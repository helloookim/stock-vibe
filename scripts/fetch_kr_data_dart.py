"""
DART OpenAPI Data Pipeline for Korean Stocks
=============================================
Fetches financial data from DART and generates per-company JSON files.

Usage:
    python scripts/fetch_kr_data_dart.py                    # Full fetch (key accounts)
    python scripts/fetch_kr_data_dart.py --year 2024        # Single year only
    python scripts/fetch_kr_data_dart.py --eps-backfill 500 # Backfill EPS for top N companies
    python scripts/fetch_kr_data_dart.py --test             # Test with 5 companies

Output:
    public/data/kr_stocks/{STOCK_CODE}.json   — per-company financial data
    public/data/kr_company_index.json         — lightweight sidebar index
"""

import os
import sys
import json
import time
import argparse
import zipfile
import io
import xml.etree.ElementTree as ET
from pathlib import Path
import requests

# ─── Config ───────────────────────────────────────────────────────────────────

API_KEY = 'c1cb15169326b68bd3d68f63969f2cd67dad63be'
BASE_URL = 'https://opendart.fss.or.kr/api'
RATE_LIMIT_DELAY = 0.5  # seconds between API calls
MAX_RETRIES = 3
BATCH_SIZE = 100  # max companies per fnlttMultiAcnt call

# Report codes
REPORT_CODES = {
    'Q1': '11013',
    'H1': '11012',
    'Q3': '11014',
    'annual': '11011',
}

# Years to fetch
START_YEAR = 2015
END_YEAR = 2025

# Paths
ROOT_DIR = Path(__file__).parent.parent
OUTPUT_DIR = ROOT_DIR / 'public' / 'data' / 'kr_stocks'
RAW_DIR = ROOT_DIR / 'data' / 'dart_raw'
CACHE_DIR = ROOT_DIR / 'data'
CORP_CODE_CACHE = CACHE_DIR / 'dart_corp_codes.json'
INDEX_OUTPUT = ROOT_DIR / 'public' / 'data' / 'kr_company_index.json'


# ─── API Helpers ──────────────────────────────────────────────────────────────

def api_get(endpoint, params, retries=MAX_RETRIES):
    """Make a DART API GET request with retry logic."""
    params['crtfc_key'] = API_KEY
    for attempt in range(retries):
        try:
            resp = requests.get(f'{BASE_URL}/{endpoint}', params=params, timeout=30)
            resp.raise_for_status()

            # Binary response (ZIP file)
            if 'xml' in endpoint and resp.headers.get('content-type', '').startswith('application/'):
                return resp.content

            data = resp.json()
            status = data.get('status', '')

            if status == '000':  # Success
                return data
            elif status == '013':  # No data
                return None
            elif status == '020':  # Rate limit exceeded
                wait = 60 * (attempt + 1)
                print(f'  Rate limit hit, waiting {wait}s...')
                time.sleep(wait)
                continue
            else:
                print(f'  API error: {status} {data.get("message", "")}')
                return None

        except requests.RequestException as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            print(f'  Request failed: {e}')
            return None

    return None


# ─── Corp Code Mapping ───────────────────────────────────────────────────────

def load_corp_codes(force_refresh=False):
    """Load or download corp_code <-> stock_code mapping."""
    if not force_refresh and CORP_CODE_CACHE.exists():
        with open(CORP_CODE_CACHE, 'r', encoding='utf-8') as f:
            return json.load(f)

    print('Downloading corp code mapping from DART...')
    content = api_get('corpCode.xml', {})
    if not content:
        print('ERROR: Failed to download corp codes')
        sys.exit(1)

    mapping = {}
    with zipfile.ZipFile(io.BytesIO(content)) as zf:
        raw = zf.read(zf.namelist()[0])
        root = ET.fromstring(raw)
        for corp in root.findall('list'):
            stock_code = (corp.findtext('stock_code') or '').strip()
            if not stock_code:
                continue
            stock_code = stock_code.zfill(6)
            mapping[stock_code] = {
                'corp_code': corp.findtext('corp_code', '').strip(),
                'name': corp.findtext('corp_name', '').strip(),
                'name_en': corp.findtext('corp_eng_name', '').strip(),
            }

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    with open(CORP_CODE_CACHE, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)

    print(f'  Loaded {len(mapping)} listed companies')
    return mapping


# ─── Batch Fetch Key Accounts ────────────────────────────────────────────────

def fetch_key_accounts(corp_codes_mapping, years=None, test_mode=False):
    """
    Fetch key accounts for all companies using fnlttMultiAcnt (batch API).
    Returns: { stock_code: { 'annual': [...], 'Q1': [...], 'H1': [...], 'Q3': [...] } }
    """
    if years is None:
        years = list(range(START_YEAR, END_YEAR + 1))

    # Build corp_code list
    stock_codes = list(corp_codes_mapping.keys())
    if test_mode:
        # Test with top companies
        test_codes = ['005930', '000660', '373220', '005380', '035420',
                      '105560', '055550', '086790']  # Include financial companies
        stock_codes = [c for c in test_codes if c in corp_codes_mapping]
        print(f'Test mode: {len(stock_codes)} companies')

    corp_code_list = [corp_codes_mapping[sc]['corp_code'] for sc in stock_codes]
    stock_code_by_corp = {v['corp_code']: k for k, v in corp_codes_mapping.items()}

    # Result accumulator: { stock_code: { period_key: { account_nm: amount } } }
    all_data = {}

    total_calls = 0
    for year in years:
        for period_name, reprt_code in REPORT_CODES.items():
            # Skip future periods
            if year == END_YEAR and period_name in ('Q3', 'annual'):
                continue

            print(f'  Fetching {year} {period_name}...', end='', flush=True)
            period_count = 0

            # Batch by 100
            for i in range(0, len(corp_code_list), BATCH_SIZE):
                batch = corp_code_list[i:i + BATCH_SIZE]
                batch_str = ','.join(batch)

                data = api_get('fnlttMultiAcnt.json', {
                    'corp_code': batch_str,
                    'bsns_year': str(year),
                    'reprt_code': reprt_code,
                })
                total_calls += 1
                time.sleep(RATE_LIMIT_DELAY)

                if not data or 'list' not in data:
                    continue

                for item in data['list']:
                    corp_code = item.get('corp_code', '')
                    stock_code = stock_code_by_corp.get(corp_code)
                    if not stock_code:
                        continue

                    if stock_code not in all_data:
                        all_data[stock_code] = {}

                    fs_div = item.get('fs_div', '')  # CFS or OFS
                    # Prefer consolidated (CFS)
                    period_key = f'{year}_{period_name}_{fs_div}'

                    if period_key not in all_data[stock_code]:
                        all_data[stock_code][period_key] = {}

                    account_nm = item.get('account_nm', '')
                    amount_str = item.get('thstrm_amount', '')
                    amount = parse_amount(amount_str)

                    all_data[stock_code][period_key][account_nm] = amount
                    period_count += 1

            print(f' {period_count} entries')

    print(f'\nTotal API calls: {total_calls}')
    return all_data, stock_codes


def parse_amount(s):
    """Parse DART amount string (e.g., '71,922,637,000,000' or '-1,234') to int."""
    if not s or s == '-':
        return None
    try:
        return int(s.replace(',', ''))
    except ValueError:
        return None


# ─── Build Per-Company Data ──────────────────────────────────────────────────

# Known account name mappings for DART
REVENUE_NAMES = {'매출액', '수익(매출액)', '영업수익', '보험료수익', '이자수익', '순영업수익'}
OP_PROFIT_NAMES = {'영업이익', '영업이익(손실)'}
NET_INCOME_NAMES = {'당기순이익', '당기순이익(손실)', '당기순이익(손실)의 귀속 지배기업의 소유주에게 귀속되는 당기순이익(손실)'}
TOTAL_ASSETS_NAMES = {'자산총계'}
TOTAL_EQUITY_NAMES = {'자본총계'}
TOTAL_DEBT_NAMES = {'부채총계'}


def extract_value(period_data, name_set):
    """Extract a financial value from period data, trying multiple account names."""
    for name in name_set:
        if name in period_data:
            return period_data[name]
    return None


def build_company_json(stock_code, raw_data, corp_info, market_info=None):
    """Build the per-company JSON structure from raw DART data."""
    annual_entries = []
    quarterly_raw = {}  # { year: { 'Q1': {...}, 'H1': {...}, 'Q3': {...} } }

    for period_key, accounts in raw_data.items():
        parts = period_key.split('_')
        year = int(parts[0])
        period = parts[1]
        fs_div = parts[2] if len(parts) > 2 else ''

        revenue = extract_value(accounts, REVENUE_NAMES)
        op_profit = extract_value(accounts, OP_PROFIT_NAMES)
        net_income = extract_value(accounts, NET_INCOME_NAMES)
        total_assets = extract_value(accounts, TOTAL_ASSETS_NAMES)
        total_equity = extract_value(accounts, TOTAL_EQUITY_NAMES)
        total_debt = extract_value(accounts, TOTAL_DEBT_NAMES)

        entry = {
            'revenue': revenue,
            'op_profit': op_profit,
            'net_income': net_income,
        }

        if period == 'annual':
            entry['year'] = year
            entry['total_assets'] = total_assets
            entry['total_equity'] = total_equity
            entry['total_debt'] = total_debt
            annual_entries.append(entry)
        else:
            if year not in quarterly_raw:
                quarterly_raw[year] = {}
            quarterly_raw[year][period] = entry

    # fnlttMultiAcnt returns single-quarter figures directly:
    #   Q1 (11013) → Q1 single quarter
    #   H1 (11012) → Q2 single quarter (당기 3개월, NOT 6-month cumulative)
    #   Q3 (11014) → Q3 single quarter (당기 3개월, NOT 9-month cumulative)
    #   Annual (11011) → full year
    # Q4 must be derived: Annual - (Q1 + Q2 + Q3)

    QUARTER_MAP = {'Q1': '1Q', 'H1': '2Q', 'Q3': '3Q'}

    quarterly_entries = []
    for year in sorted(quarterly_raw.keys()):
        periods = quarterly_raw[year]

        for period_key, quarter_label in QUARTER_MAP.items():
            if period_key in periods:
                p = periods[period_key]
                quarterly_entries.append({
                    'year': year, 'quarter': quarter_label,
                    'revenue': p['revenue'],
                    'op_profit': p['op_profit'],
                    'net_income': p['net_income'],
                    'eps': None,
                })

        # Q4 = Annual - (Q1 + Q2 + Q3)
        annual_match = next((a for a in annual_entries if a['year'] == year), None)
        if annual_match and all(k in periods for k in ('Q1', 'H1', 'Q3')):
            q1 = periods['Q1']
            q2 = periods['H1']
            q3 = periods['Q3']
            quarterly_entries.append({
                'year': year, 'quarter': '4Q',
                'revenue': safe_subtract_multi(annual_match['revenue'], q1['revenue'], q2['revenue'], q3['revenue']),
                'op_profit': safe_subtract_multi(annual_match['op_profit'], q1['op_profit'], q2['op_profit'], q3['op_profit']),
                'net_income': safe_subtract_multi(annual_match['net_income'], q1['net_income'], q2['net_income'], q3['net_income']),
                'eps': None,
            })

    # Sort
    annual_entries.sort(key=lambda x: x['year'])
    quarterly_entries.sort(key=lambda x: (x['year'], x['quarter']))

    # Clean None total_assets/equity/debt from annual entries to save space
    for entry in annual_entries:
        if entry.get('total_assets') is None:
            entry.pop('total_assets', None)
        if entry.get('total_equity') is None:
            entry.pop('total_equity', None)
        if entry.get('total_debt') is None:
            entry.pop('total_debt', None)
        entry['eps'] = None  # EPS not available from key accounts API

    result = {
        'stock_code': stock_code,
        'corp_code': corp_info.get('corp_code', ''),
        'name': corp_info.get('name', ''),
        'name_en': corp_info.get('name_en', ''),
        'sector': market_info.get('sector', '') if market_info else '',
        'market': market_info.get('market', '') if market_info else '',
        'fy_end_month': 12,
        'annual': annual_entries,
        'quarterly': quarterly_entries,
    }

    return result


def safe_subtract(a, b):
    """Subtract two values that may be None."""
    if a is None or b is None:
        return None
    return a - b


def safe_subtract_multi(total, *parts):
    """Subtract multiple parts from total. Returns None if any value is None."""
    if total is None or any(p is None for p in parts):
        return None
    return total - sum(parts)


# ─── Consolidate CFS vs OFS ─────────────────────────────────────────────────

def consolidate_fs(raw_data):
    """Prefer CFS (consolidated) over OFS (individual) for each period."""
    consolidated = {}
    for period_key, accounts in raw_data.items():
        parts = period_key.split('_')
        year = parts[0]
        period = parts[1]
        fs_div = parts[2] if len(parts) > 2 else ''

        base_key = f'{year}_{period}'

        if base_key not in consolidated:
            consolidated[base_key] = {'data': accounts, 'fs_div': fs_div}
        elif fs_div == 'CFS':
            # CFS takes priority
            consolidated[base_key] = {'data': accounts, 'fs_div': fs_div}
        # else: keep existing (which might be CFS already)

    return {k: v['data'] for k, v in consolidated.items()}


# ─── Market Cap Data (for sector/market info) ────────────────────────────────

def load_market_info():
    """Load market_cap_data.json for sector and market info."""
    mkt_file = ROOT_DIR / 'public' / 'market_cap_data.json'
    if not mkt_file.exists():
        # Try alternate location
        mkt_file = ROOT_DIR / 'market_cap_data.json'
    if mkt_file.exists():
        with open(mkt_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


# ─── Existing Data Merge ─────────────────────────────────────────────────────

def load_existing_quarterly_data():
    """Load existing chunked quarterly data for sector info and EPS values."""
    combined = {}
    for chunk_file in ['kr_quarterly_00.json', 'kr_quarterly_01.json']:
        path = ROOT_DIR / 'public' / 'data' / chunk_file
        if path.exists():
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                combined.update(data)
    return combined


# ─── Generate Index ──────────────────────────────────────────────────────────

def generate_index(corp_codes, market_info, output_dir):
    """Generate kr_company_index.json for sidebar."""
    index = []
    for stock_code, info in corp_codes.items():
        # Only include companies that have generated JSON files
        json_file = output_dir / f'{stock_code}.json'
        if not json_file.exists():
            continue

        mkt = market_info.get(stock_code, {})
        index.append({
            'stock_code': stock_code,
            'name': info.get('name', ''),
            'name_en': info.get('name_en', ''),
            'sector': mkt.get('sector', ''),
            'market': mkt.get('market', ''),
            'rank': mkt.get('rank', 9999),
        })

    index.sort(key=lambda x: x['rank'])

    with open(INDEX_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False)

    print(f'Generated index: {len(index)} companies -> {INDEX_OUTPUT}')


# ─── Main Pipeline ───────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='DART OpenAPI Data Pipeline')
    parser.add_argument('--year', type=int, help='Fetch single year only')
    parser.add_argument('--test', action='store_true', help='Test mode (5 companies)')
    parser.add_argument('--eps-backfill', type=int, metavar='N', help='Backfill EPS for top N companies')
    parser.add_argument('--refresh-codes', action='store_true', help='Force refresh corp codes')
    parser.add_argument('--index-only', action='store_true', help='Only regenerate index')
    args = parser.parse_args()

    print('=== DART OpenAPI Data Pipeline ===\n')

    # Step 1: Load corp code mapping
    corp_codes = load_corp_codes(force_refresh=args.refresh_codes)
    print(f'Corp codes: {len(corp_codes)} listed companies\n')

    # Load market info for sector/market/rank
    market_info = load_market_info()
    print(f'Market info: {len(market_info)} companies\n')

    # Load existing data for sector info
    existing_data = load_existing_quarterly_data()
    print(f'Existing quarterly data: {len(existing_data)} companies\n')

    # Index-only mode
    if args.index_only:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        generate_index(corp_codes, market_info, OUTPUT_DIR)
        return

    # Step 2: Fetch key accounts
    years = [args.year] if args.year else None
    print('Fetching key accounts from DART...')
    raw_data, stock_codes = fetch_key_accounts(corp_codes, years=years, test_mode=args.test)
    print(f'Fetched data for {len(raw_data)} companies\n')

    # Step 3: Build and save per-company JSONs
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    saved = 0
    skipped = 0

    for stock_code in stock_codes:
        if stock_code not in raw_data:
            skipped += 1
            continue

        # Consolidate CFS vs OFS
        company_raw = consolidate_fs(raw_data[stock_code])

        # Get corp info
        corp_info = corp_codes.get(stock_code, {})

        # Get market info (sector, market, rank)
        mkt = market_info.get(stock_code, {})

        # Get sector from existing data if not in market info
        existing = existing_data.get(stock_code, {})
        mkt_info = {
            'sector': mkt.get('sector') or existing.get('sector', ''),
            'market': mkt.get('market', ''),
            'rank': mkt.get('rank', 9999),
        }

        # Build company JSON
        company_json = build_company_json(stock_code, company_raw, corp_info, mkt_info)

        # Merge EPS from existing data if available
        if existing and existing.get('history'):
            merge_existing_eps(company_json, existing)

        # Only save if there's actual data
        if not company_json['annual'] and not company_json['quarterly']:
            skipped += 1
            continue

        # Save
        output_file = OUTPUT_DIR / f'{stock_code}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(company_json, f, ensure_ascii=False)

        saved += 1

    print(f'Saved: {saved} companies, Skipped: {skipped} (no data)')

    # Step 4: Generate index
    print()
    generate_index(corp_codes, market_info, OUTPUT_DIR)

    print(f'\nDone! Files saved to {OUTPUT_DIR}')


def merge_existing_eps(company_json, existing):
    """Merge EPS values from existing quarterly data into the new company JSON."""
    eps_map = {}
    for h in existing.get('history', []):
        key = f"{h.get('year')}_{h.get('quarter', '')}"
        if h.get('eps') is not None:
            eps_map[key] = h['eps']

    for q in company_json['quarterly']:
        key = f"{q['year']}_{q['quarter']}"
        if key in eps_map:
            q['eps'] = eps_map[key]


if __name__ == '__main__':
    main()
