"""
Naver Finance (WiseReport) Scraper for Korean Stocks
=====================================================
Scrapes quarterly financial data from Naver Finance using Selenium.
Merges Q4 2025 data and EPS into existing per-company JSON files.

Usage:
    python scripts/fetch_naver_finance.py --test           # Test with 5 companies
    python scripts/fetch_naver_finance.py --top 100        # Top 100 by market cap
    python scripts/fetch_naver_finance.py --all            # All companies
    python scripts/fetch_naver_finance.py --code 005930    # Single company
    python scripts/fetch_naver_finance.py --dry-run --top 10  # Parse only, don't save

Dependencies:
    pip install selenium beautifulsoup4 webdriver-manager
"""

import sys
import json
import time
import argparse
import re
from pathlib import Path

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
except ImportError:
    print('ERROR: selenium is required. Install with: pip install selenium')
    sys.exit(1)

try:
    from bs4 import BeautifulSoup
except ImportError:
    print('ERROR: beautifulsoup4 is required. Install with: pip install beautifulsoup4')
    sys.exit(1)

try:
    from webdriver_manager.chrome import ChromeDriverManager
    HAS_WDM = True
except ImportError:
    HAS_WDM = False

# ─── Config ───────────────────────────────────────────────────────────────────

ROOT_DIR = Path(__file__).parent.parent
OUTPUT_DIR = ROOT_DIR / 'public' / 'data' / 'kr_stocks'
INDEX_FILE = ROOT_DIR / 'public' / 'data' / 'kr_company_index.json'

BASE_URL = 'https://navercomp.wisereport.co.kr/v2/company/c1010001.aspx?cmp_cd={code}'
REQUEST_DELAY = 2.5  # seconds between page loads

# Row labels to scrape (Korean) -> field name mapping
# Order matters: more specific labels first to avoid partial matches
ROW_LABELS = [
    ('EPS(', 'eps'),               # EPS(원) - partial match to handle variations
    ('매출액', 'revenue'),
    ('당기순이익(지배)', None),     # skip controlling interest (use total instead)
    ('당기순이익(비지배)', None),   # skip non-controlling interest
    ('당기순이익', 'net_income'),   # total net income (consistent with DART)
    ('영업이익(발표기준)', None),   # skip "announced basis" variant
    ('영업이익률', None),          # skip operating margin % (would falsely match 영업이익)
    ('영업이익', 'op_profit'),
]


# ─── Selenium Setup ──────────────────────────────────────────────────────────

def create_driver(headless=True):
    """Create a Chrome WebDriver instance."""
    options = Options()
    if headless:
        options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
    # Suppress logging
    options.add_argument('--log-level=3')
    options.add_experimental_option('excludeSwitches', ['enable-logging'])

    try:
        if HAS_WDM:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
        else:
            driver = webdriver.Chrome(options=options)
        return driver
    except WebDriverException as e:
        if headless:
            print('  Headless mode failed, trying visible mode...')
            return create_driver(headless=False)
        raise e


# ─── Page Parsing ─────────────────────────────────────────────────────────────

def scrape_company(driver, stock_code, fy_end_month=12):
    """
    Navigate to Naver Finance page and parse the financial summary table.
    Returns list of quarterly entries: [{year, quarter, revenue, op_profit, net_income, eps}, ...]
    """
    url = BASE_URL.format(code=stock_code)
    try:
        driver.get(url)
    except WebDriverException as e:
        print(f'  [{stock_code}] Page load error: {e}')
        return []

    # Wait for the financial summary table to render (AJAX loaded)
    try:
        WebDriverWait(driver, 12).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'table.gHead01'))
        )
        # Extra wait for data cells to populate
        time.sleep(2)
    except TimeoutException:
        print(f'  [{stock_code}] Table not found (timeout)')
        return []

    # Parse the rendered HTML
    soup = BeautifulSoup(driver.page_source, 'html.parser')

    # Find the financial summary table by looking for the header row
    # containing '주요재무정보' (Key Financial Information)
    table = find_financial_table(soup)

    if not table:
        print(f'  [{stock_code}] Financial summary table not found')
        return []

    return parse_financial_table(table, stock_code, fy_end_month)


def find_financial_table(soup):
    """
    Find the '주요재무정보' table in the page.
    This table has:
    - Row 0: '주요재무정보' | '연간...' (colspan=4) | '분기...' (colspan=4)
    - Row 1: 8 date headers (YYYY/MM format)
    - Row 2+: data rows with label + 8 values
    """
    for table in soup.find_all('table'):
        rows = table.find_all('tr')
        if len(rows) < 3:
            continue
        first_row = rows[0]
        first_cell = first_row.find(['th', 'td'])
        if first_cell and '주요재무정보' in first_cell.get_text(strip=True):
            return table
    return None


def parse_financial_table(table, stock_code, fy_end_month=12):
    """
    Parse the '주요재무정보' table.

    Structure:
    - Row 0: section headers with colspan (1 label + 4 annual + 4 quarterly)
    - Row 1: 8 date headers (no label cell, since Row 0 label has rowspan)
    - Row 2+: label cell + 8 data cells

    Returns list of quarterly entries (only actual data, no estimates).
    """
    month_to_quarter = build_quarter_mapping(fy_end_month)
    rows = table.find_all('tr')

    if len(rows) < 3:
        return []

    # --- Parse Row 0 to find quarterly column range ---
    row0_cells = rows[0].find_all(['th', 'td'])
    annual_cols = 0
    quarterly_start = 0

    for cell in row0_cells:
        text = cell.get_text(strip=True)
        colspan = int(cell.get('colspan', 1))
        if '연간' in text:
            annual_cols = colspan
        elif '분기' in text:
            quarterly_start = annual_cols  # quarterly starts after annual columns
            break

    if annual_cols == 0:
        # Fallback: assume 4 annual + 4 quarterly
        annual_cols = 4
        quarterly_start = 4

    # --- Parse Row 1: date headers ---
    row1_cells = rows[1].find_all(['th', 'td'])
    # Row 1 has 8 cells (no label cell): indices 0..7
    # Quarterly columns: indices quarterly_start .. quarterly_start+3

    quarterly_columns = []  # List of (year, quarter, is_estimate, col_index_in_row1)
    for i, cell in enumerate(row1_cells):
        if i < quarterly_start:
            continue  # Skip annual columns

        text = cell.get_text(strip=True)
        match = re.match(r'(\d{4})/(\d{2})', text)
        if not match:
            continue

        year = int(match.group(1))
        month = match.group(2)
        is_estimate = '(E)' in text

        quarter = month_to_quarter.get(month)
        if quarter:
            quarterly_columns.append({
                'year': year,
                'quarter': quarter,
                'is_estimate': is_estimate,
                'col_index': i,  # index in row1 (0-based among 8 headers)
            })

    if not quarterly_columns:
        print(f'  [{stock_code}] No quarterly columns found in headers')
        return []

    # --- Parse data rows (Row 2+) ---
    data_by_quarter = {}  # (year, quarter) -> {field: value}

    for row in rows[2:]:
        cells = row.find_all(['th', 'td'])
        if len(cells) < 2:
            continue

        # First cell is the label
        label_text = cells[0].get_text(strip=True)

        # Match label to field name (None = no match or intentionally skipped)
        field_name = match_row_label(label_text)
        if not field_name:
            continue

        # Data cells: cells[1:] correspond to the 8 date columns
        # cells[1+i] corresponds to row1_cells[i]
        data_cells = cells[1:]

        for qcol in quarterly_columns:
            if qcol['is_estimate']:
                continue

            idx = qcol['col_index']
            if idx >= len(data_cells):
                continue

            cell = data_cells[idx]

            # Double-check cell-level estimate class
            cell_classes = cell.get('class', [])
            if isinstance(cell_classes, str):
                cell_classes = cell_classes.split()
            if 'bgE' in cell_classes:
                continue

            value = parse_cell_value(cell)
            if value is not None:
                key = (qcol['year'], qcol['quarter'])
                if key not in data_by_quarter:
                    data_by_quarter[key] = {}
                data_by_quarter[key][field_name] = value

    # --- Build result ---
    result = []
    for (year, quarter), fields in sorted(data_by_quarter.items()):
        entry = {'year': year, 'quarter': quarter}

        # Convert from table unit (억원) to 원 for monetary values
        for field in ('revenue', 'op_profit', 'net_income'):
            if field in fields:
                entry[field] = int(round(fields[field] * 1e8))

        # EPS is already in 원 (no conversion)
        if 'eps' in fields:
            entry['eps'] = int(round(fields['eps']))

        result.append(entry)

    return result


def match_row_label(label_text):
    """
    Match a row label to a field name.
    Returns field name string if matched, or None if no match / intentionally skipped.
    """
    for kr_label, field in ROW_LABELS:
        if label_text.startswith(kr_label) or kr_label in label_text:
            return field  # None means "matched but skip this row"
    return None


def parse_cell_value(cell):
    """
    Extract numeric value from a table cell.
    Prefers title attribute (full precision) over displayed text.
    """
    # Try title attribute first (has full precision like "12,345.67")
    title = cell.get('title', '').strip()
    if title:
        value = parse_number(title)
        if value is not None:
            return value

    # Fall back to cell text
    text = cell.get_text(strip=True)
    if text:
        return parse_number(text)

    return None


def parse_number(text):
    """Parse a number string, handling commas and negative values."""
    if not text:
        return None
    text = text.strip().replace(',', '').replace(' ', '')
    if not text or text in ('', '-', 'N/A', 'nan', 'N/A(IFRS'):
        return None
    try:
        return float(text)
    except ValueError:
        return None


def build_quarter_mapping(fy_end_month):
    """Build month -> quarter mapping based on fiscal year end month."""
    if fy_end_month == 12:
        return {'03': '1Q', '06': '2Q', '09': '3Q', '12': '4Q'}
    elif fy_end_month == 3:
        return {'06': '1Q', '09': '2Q', '12': '3Q', '03': '4Q'}
    elif fy_end_month == 6:
        return {'09': '1Q', '12': '2Q', '03': '3Q', '06': '4Q'}
    elif fy_end_month == 9:
        return {'12': '1Q', '03': '2Q', '06': '3Q', '09': '4Q'}
    else:
        return {'03': '1Q', '06': '2Q', '09': '3Q', '12': '4Q'}


# ─── Merge Logic ──────────────────────────────────────────────────────────────

def merge_naver_data(stock_code, naver_quarters, dry_run=False):
    """
    Merge scraped Naver Finance quarterly data into existing per-company JSON.
    Only fills in missing (null) fields - does not overwrite existing data.
    Returns (new_count, updated_count).
    """
    json_path = OUTPUT_DIR / f'{stock_code}.json'

    if not json_path.exists():
        print(f'  [{stock_code}] JSON file not found, skipping')
        return 0, 0

    with open(json_path, 'r', encoding='utf-8') as f:
        company_data = json.load(f)

    existing_q = {(q['year'], q['quarter']): q for q in company_data.get('quarterly', [])}

    new_count = 0
    updated_count = 0

    for nq in naver_quarters:
        key = (nq['year'], nq['quarter'])
        if key in existing_q:
            existing = existing_q[key]
            changed = False

            # Fill in missing/null fields from Naver data
            for field in ('revenue', 'op_profit', 'net_income', 'eps'):
                if field in nq and nq[field] is not None:
                    if existing.get(field) is None:
                        existing[field] = nq[field]
                        changed = True

            if changed:
                updated_count += 1
        else:
            # New quarter entry
            existing_q[key] = nq
            new_count += 1

    # Rebuild sorted quarterly list
    company_data['quarterly'] = sorted(
        existing_q.values(),
        key=lambda x: (x['year'], x['quarter'])
    )

    if not dry_run and (new_count > 0 or updated_count > 0):
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(company_data, f, ensure_ascii=False)

    return new_count, updated_count


# ─── Main ─────────────────────────────────────────────────────────────────────

def load_company_list():
    """Load company list from kr_company_index.json, sorted by rank."""
    if not INDEX_FILE.exists():
        print(f'ERROR: Company index not found: {INDEX_FILE}')
        sys.exit(1)

    with open(INDEX_FILE, 'r', encoding='utf-8') as f:
        companies = json.load(f)

    companies.sort(key=lambda c: c.get('rank', 9999))
    return companies


def get_fy_end_month(stock_code):
    """Get fiscal year end month from existing company JSON."""
    json_path = OUTPUT_DIR / f'{stock_code}.json'
    if json_path.exists():
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data.get('fy_end_month', 12)
    return 12


def main():
    parser = argparse.ArgumentParser(description='Naver Finance Quarterly Data Scraper')
    parser.add_argument('--top', type=int, default=100, help='Scrape top N companies by market cap (default: 100)')
    parser.add_argument('--all', action='store_true', help='Scrape all companies')
    parser.add_argument('--test', action='store_true', help='Test mode (5 companies)')
    parser.add_argument('--code', type=str, help='Scrape a single company by stock code')
    parser.add_argument('--dry-run', action='store_true', help='Parse and print without saving')
    parser.add_argument('--no-headless', action='store_true', help='Show browser window')
    args = parser.parse_args()

    print('=== Naver Finance Quarterly Data Scraper ===\n')

    # Determine which companies to scrape
    if args.code:
        companies = [{'stock_code': args.code, 'name': args.code, 'rank': 0}]
        all_companies = load_company_list()
        for c in all_companies:
            if c['stock_code'] == args.code:
                companies = [c]
                break
    else:
        companies = load_company_list()
        if args.test:
            companies = companies[:5]
        elif not args.all:
            companies = companies[:args.top]

    print(f'Companies to scrape: {len(companies)}')
    if args.dry_run:
        print('DRY RUN - will not save any changes\n')

    # Create Selenium driver
    print('Starting Chrome browser...')
    headless = not args.no_headless
    driver = create_driver(headless=headless)
    print('Browser ready.\n')

    # Stats
    total = len(companies)
    scraped = 0
    with_new_data = 0
    total_new_quarters = 0
    total_updated_quarters = 0
    errors = 0

    try:
        for i, company in enumerate(companies):
            stock_code = company['stock_code']
            name = company.get('name', stock_code)
            rank = company.get('rank', '?')

            print(f'[{i+1}/{total}] {stock_code} {name} (rank #{rank})...', end=' ', flush=True)

            fy_end_month = get_fy_end_month(stock_code)

            try:
                quarters = scrape_company(driver, stock_code, fy_end_month)
            except Exception as e:
                print(f'ERROR: {e}')
                errors += 1
                time.sleep(REQUEST_DELAY)
                continue

            if not quarters:
                print('no data')
                time.sleep(REQUEST_DELAY)
                continue

            scraped += 1

            # Show what we found
            q_labels = [f"{q['year']}_{q['quarter']}" for q in quarters]
            print(f'{len(quarters)} quarters: {", ".join(q_labels)}')

            # Print details in dry-run mode
            if args.dry_run:
                for q in quarters:
                    rev = q.get('revenue')
                    op = q.get('op_profit')
                    ni = q.get('net_income')
                    eps = q.get('eps')
                    rev_s = f'{rev/1e8:,.0f}' if rev else 'N/A'
                    op_s = f'{op/1e8:,.0f}' if op else 'N/A'
                    ni_s = f'{ni/1e8:,.0f}' if ni else 'N/A'
                    eps_s = f'{eps:,.0f}' if eps else 'N/A'
                    print(f'    {q["year"]} {q["quarter"]}: rev={rev_s} / op={op_s} / ni={ni_s} / eps={eps_s}')

            # Merge into existing JSON
            new_count, updated_count = merge_naver_data(stock_code, quarters, dry_run=args.dry_run)

            if new_count > 0 or updated_count > 0:
                with_new_data += 1
                total_new_quarters += new_count
                total_updated_quarters += updated_count
                if not args.dry_run:
                    print(f'    -> Saved: {new_count} new, {updated_count} updated quarters')

            # Rate limiting
            time.sleep(REQUEST_DELAY)

    except KeyboardInterrupt:
        print('\n\nInterrupted by user.')
    finally:
        driver.quit()
        print('\nBrowser closed.')

    # Summary
    print(f'\n=== Summary ===')
    print(f'Total companies: {total}')
    print(f'Successfully scraped: {scraped}')
    print(f'Companies with new/updated data: {with_new_data}')
    print(f'New quarters added: {total_new_quarters}')
    print(f'Existing quarters updated: {total_updated_quarters}')
    print(f'Errors: {errors}')
    if args.dry_run:
        print('\n(DRY RUN - no files were modified)')


if __name__ == '__main__':
    main()
