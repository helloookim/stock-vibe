"""
Stock Price Pipeline — data.go.kr (금융위원회 주식시세정보)
===========================================================
Fetches daily trading data, computes PER/PBR from DART financials,
and merges into existing per-company JSON files.

Runs AFTER the DART pipeline (scripts/fetch_kr_data_dart.py).

API: https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService
- Single endpoint for KOSPI + KOSDAQ (all stocks in one call)
- Daily traffic limit: 10,000 calls/day
- Typical usage: ~55 calls for full historical + latest

Usage:
    python scripts/fetch_krx_data.py                      # Full fetch (latest + historical)
    python scripts/fetch_krx_data.py --latest-only         # Latest PER/PBR only (1 API call)
    python scripts/fetch_krx_data.py --test                # Test with 5 companies
    python scripts/fetch_krx_data.py --start-year 2020     # Historical prices from 2020+

Output:
    Merges into public/data/kr_stocks/{STOCK_CODE}.json
    Updates public/data/kr_company_index.json
"""

import sys
import json
import time
import argparse
from pathlib import Path
from datetime import datetime, timedelta
import requests

# ─── Config ───────────────────────────────────────────────────────────────────

SERVICE_KEY = '2a327102611efa5643bdb9b496315271f3b9cb144d8add5968d415a433c7261d'

API_URL = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo'

RATE_LIMIT_DELAY = 0.3  # seconds between API calls (30 tps limit)
MAX_RETRIES = 3
NUM_OF_ROWS = 5000  # enough to get all stocks in one call (~2,900 per day)

# Paths
ROOT_DIR = Path(__file__).parent.parent
KR_STOCKS_DIR = ROOT_DIR / 'public' / 'data' / 'kr_stocks'
INDEX_FILE = ROOT_DIR / 'public' / 'data' / 'kr_company_index.json'

START_YEAR = 2015
END_YEAR = 2025


# ─── API ─────────────────────────────────────────────────────────────────────

api_call_count = 0


def fetch_all_stocks_for_date(bas_dt):
    """Fetch trading data for ALL stocks for a given date (single API call).
    Returns: { stock_code: { close_price, mktcap, list_shrs } }
    """
    global api_call_count
    result = {}

    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.get(API_URL, params={
                'serviceKey': SERVICE_KEY,
                'numOfRows': NUM_OF_ROWS,
                'pageNo': 1,
                'resultType': 'json',
                'basDt': bas_dt,
            }, timeout=60)
            resp.raise_for_status()
            api_call_count += 1
            time.sleep(RATE_LIMIT_DELAY)

            data = resp.json()
            body = data.get('response', {}).get('body', {})
            items = body.get('items', {})

            # Handle both list and dict responses
            item_list = items.get('item', [])
            if isinstance(item_list, dict):
                item_list = [item_list]

            total = body.get('totalCount', 0)

            for rec in item_list:
                stock_code = rec.get('srtnCd', '')
                if len(stock_code) != 6 or not stock_code.isdigit():
                    continue

                close_price = parse_int(rec.get('clpr'))
                mktcap = parse_int(rec.get('mrktTotAmt'))
                list_shrs = parse_int(rec.get('lstgStCnt'))

                if close_price is not None and close_price > 0:
                    result[stock_code] = {
                        'close_price': close_price,
                        'mktcap': mktcap,
                        'list_shrs': list_shrs,
                    }

            # Check if we need more pages
            if total > NUM_OF_ROWS:
                print(f'    WARNING: {total} stocks but only fetched {NUM_OF_ROWS}, increase NUM_OF_ROWS')

            return result

        except requests.RequestException as e:
            if attempt < MAX_RETRIES - 1:
                wait = 2 ** attempt
                print(f'    Request failed ({e}), retrying in {wait}s...')
                time.sleep(wait)
                continue
            print(f'    Request failed after {MAX_RETRIES} attempts: {e}')
            return result

    return result


def parse_int(s):
    """Parse a string/int value, handling commas."""
    if s is None or s == '' or s == '-':
        return None
    try:
        return int(str(s).replace(',', ''))
    except (ValueError, TypeError):
        return None


# ─── Date Helpers ─────────────────────────────────────────────────────────────

def get_quarter_end_dates(start_year, end_year):
    """Generate quarter-end dates (last business day of Mar/Jun/Sep/Dec)."""
    quarter_ends = []
    for year in range(start_year, end_year + 1):
        for quarter, (month, day) in enumerate([
            (3, 31), (6, 30), (9, 30), (12, 30)
        ], 1):
            dt = datetime(year, month, day)
            if dt > datetime.now():
                continue
            while dt.weekday() >= 5:
                dt -= timedelta(days=1)
            quarter_ends.append((year, f'{quarter}Q', dt.strftime('%Y%m%d')))
    return quarter_ends


def get_year_end_dates(start_year, end_year):
    """Generate year-end dates (last business day of Dec)."""
    year_ends = []
    for year in range(start_year, end_year + 1):
        dt = datetime(year, 12, 30)
        if dt > datetime.now():
            continue
        while dt.weekday() >= 5:
            dt -= timedelta(days=1)
        year_ends.append((year, dt.strftime('%Y%m%d')))
    return year_ends


def get_latest_trading_date():
    """Get the most recent likely trading date."""
    dt = datetime.now()
    while dt.weekday() >= 5:
        dt -= timedelta(days=1)
    return dt.strftime('%Y%m%d')


def try_fetch_with_fallback(date_str, label=''):
    """Fetch data for a date, falling back up to 5 business days for holidays."""
    data = fetch_all_stocks_for_date(date_str)
    if data:
        return data, date_str

    tried = {date_str}
    dt = datetime.strptime(date_str, '%Y%m%d')
    for _ in range(5):
        dt -= timedelta(days=1)
        while dt.weekday() >= 5:
            dt -= timedelta(days=1)
        alt_date = dt.strftime('%Y%m%d')
        if alt_date in tried:
            continue
        tried.add(alt_date)
        print(f'    No data, trying {alt_date}...')
        data = fetch_all_stocks_for_date(alt_date)
        if data:
            return data, alt_date

    return {}, date_str


# ─── PER / PBR ───────────────────────────────────────────────────────────────

def compute_per_pbr(mktcap, company_data):
    """PER = MKTCAP / trailing 4Q net_income, PBR = MKTCAP / latest annual total_equity."""
    if not mktcap or not company_data:
        return None, None

    per = None
    pbr = None

    quarterly = company_data.get('quarterly', [])
    annual = company_data.get('annual', [])

    # PER: use trailing 4Q net_income, fallback to latest annual net_income
    t4q_ni = None
    if quarterly:
        recent_4q = [q for q in quarterly if q.get('net_income') is not None][-4:]
        if len(recent_4q) == 4:
            t4q_ni = sum(q['net_income'] for q in recent_4q)
    if t4q_ni is None and annual:
        latest_annual = annual[-1]
        t4q_ni = latest_annual.get('net_income')
    if t4q_ni and t4q_ni > 0:
        per = round(mktcap / t4q_ni, 1)

    # PBR: use latest annual total_equity
    if annual:
        latest = annual[-1]
        total_equity = latest.get('total_equity')
        if total_equity and total_equity > 0:
            pbr = round(mktcap / total_equity, 2)

    return per, pbr


# ─── Merge ────────────────────────────────────────────────────────────────────

def merge_latest_data(latest_data, latest_date, kr_stocks_dir, test_codes=None):
    """Merge latest PER/PBR/close_price into per-company JSON files."""
    updated = 0

    for json_file in kr_stocks_dir.glob('*.json'):
        stock_code = json_file.stem
        if test_codes and stock_code not in test_codes:
            continue
        if stock_code not in latest_data:
            continue

        with open(json_file, 'r', encoding='utf-8') as f:
            company = json.load(f)

        krx = latest_data[stock_code]
        mktcap = krx.get('mktcap')
        per, pbr = compute_per_pbr(mktcap, company)

        company['last_close_price'] = krx.get('close_price')
        company['last_close_date'] = latest_date
        company['last_mktcap'] = mktcap
        company['last_per'] = per
        company['last_pbr'] = pbr

        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(company, f, ensure_ascii=False)
        updated += 1

    return updated


def merge_historical_prices(date_prices_map, kr_stocks_dir, mode, test_codes=None):
    """Merge historical close prices + PER/PBR into quarterly/annual entries.
    date_prices_map values: { key: { close_price, mktcap } }
    """
    updated = 0

    for json_file in kr_stocks_dir.glob('*.json'):
        stock_code = json_file.stem
        if test_codes and stock_code not in test_codes:
            continue
        if stock_code not in date_prices_map:
            continue

        with open(json_file, 'r', encoding='utf-8') as f:
            company = json.load(f)

        prices = date_prices_map[stock_code]
        changed = False

        if mode == 'quarterly':
            quarterly = company.get('quarterly', [])
            annual = company.get('annual', [])
            for q in quarterly:
                key = (q['year'], q['quarter'])
                if key not in prices:
                    continue
                info = prices[key]
                q['close_price'] = info['close_price']
                mktcap = info.get('mktcap')
                if mktcap:
                    # PER: mktcap / trailing 4Q net_income (fallback to annual net_income)
                    t4q_ni = _trailing_4q_net_income(quarterly, q['year'], q['quarter'])
                    if t4q_ni is None:
                        t4q_ni = _annual_net_income_fallback(annual, q['year'], q['quarter'])
                    q['per'] = round(mktcap / t4q_ni, 1) if t4q_ni and t4q_ni > 0 else None
                    # PBR: mktcap / most recent annual total_equity
                    equity = _latest_equity_at(annual, q['year'])
                    q['pbr'] = round(mktcap / equity, 2) if equity and equity > 0 else None
                changed = True

        elif mode == 'annual':
            annual = company.get('annual', [])
            for a in annual:
                if a['year'] not in prices:
                    continue
                info = prices[a['year']]
                a['close_price'] = info['close_price']
                mktcap = info.get('mktcap')
                if mktcap:
                    ni = a.get('net_income')
                    a['per'] = round(mktcap / ni, 1) if ni and ni > 0 else None
                    eq = a.get('total_equity')
                    a['pbr'] = round(mktcap / eq, 2) if eq and eq > 0 else None
                changed = True

        if changed:
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(company, f, ensure_ascii=False)
            updated += 1

    return updated


def _trailing_4q_net_income(quarterly, year, quarter):
    """Sum net_income of the 4 most recent quarters ending at (year, quarter)."""
    q_order = ['1Q', '2Q', '3Q', '4Q']
    qi = q_order.index(quarter)
    targets = []
    for i in range(4):
        idx = qi - i
        y = year if idx >= 0 else year - 1
        q = q_order[idx % 4]
        targets.append((y, q))

    total = 0
    found = 0
    for y, q in targets:
        match = next((x for x in quarterly if x['year'] == y and x['quarter'] == q), None)
        if match and match.get('net_income') is not None:
            total += match['net_income']
            found += 1

    return total if found == 4 else None


def _annual_net_income_fallback(annual, year, quarter):
    """Fallback: use annual net_income when quarterly net_income is unavailable.
    For Q4, use that year's annual. For Q1-Q3, use previous year's annual."""
    target_year = year if quarter == '4Q' else year - 1
    match = next((a for a in annual if a['year'] == target_year), None)
    if match and match.get('net_income') is not None:
        return match['net_income']
    # Try current year if previous year not found
    if quarter != '4Q':
        match = next((a for a in annual if a['year'] == year), None)
        if match and match.get('net_income') is not None:
            return match['net_income']
    return None


def _latest_equity_at(annual, year):
    """Get total_equity from the most recent annual entry at or before given year."""
    best = None
    for a in annual:
        if a['year'] <= year and a.get('total_equity'):
            best = a['total_equity']
    return best


def update_index(kr_stocks_dir, index_file):
    """Update kr_company_index.json with last_per and last_pbr."""
    if not index_file.exists():
        print('Index file not found, skipping.')
        return

    with open(index_file, 'r', encoding='utf-8') as f:
        index = json.load(f)

    updated = 0
    for entry in index:
        stock_code = entry.get('stock_code', '')
        json_file = kr_stocks_dir / f'{stock_code}.json'
        if not json_file.exists():
            continue

        with open(json_file, 'r', encoding='utf-8') as f:
            company = json.load(f)

        per = company.get('last_per')
        pbr = company.get('last_pbr')

        if per is not None or pbr is not None:
            entry['last_per'] = per
            entry['last_pbr'] = pbr
            updated += 1

    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False)

    print(f'Updated index: {updated} companies with PER/PBR')


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    global api_call_count

    parser = argparse.ArgumentParser(
        description='Stock Price Pipeline (data.go.kr 금융위원회 주식시세정보)')
    parser.add_argument('--latest-only', action='store_true',
                        help='Only fetch latest PER/PBR (1 API call)')
    parser.add_argument('--test', action='store_true',
                        help='Test with 5 companies')
    parser.add_argument('--start-year', type=int, default=START_YEAR,
                        help=f'Start year for historical prices (default: {START_YEAR})')
    parser.add_argument('--date', type=str,
                        help='Specific date to fetch (YYYYMMDD)')
    args = parser.parse_args()

    print('=== Stock Price Pipeline (data.go.kr) ===\n')

    test_codes = None
    if args.test:
        test_codes = {'005930', '000660', '373220', '005380', '035420'}
        print(f'Test mode: {len(test_codes)} companies\n')

    # ── Step 1: Fetch latest trading data ──
    latest_date = args.date or get_latest_trading_date()
    print(f'Step 1: Fetching latest trading data ({latest_date})...')
    latest_data, latest_date = try_fetch_with_fallback(latest_date)
    print(f'  Got data for {len(latest_data)} stocks\n')

    if not latest_data:
        print('  ERROR: No trading data returned. Market may be closed or API is down.')
        print('  Aborting to avoid overwriting good data with stale values.')
        sys.exit(1)

    # ── Step 2: Merge latest PER/PBR/price ──
    print('Step 2: Merging latest data (PER, PBR, close price)...')
    count = merge_latest_data(latest_data, latest_date, KR_STOCKS_DIR, test_codes)
    print(f'  Updated {count} company files\n')

    if args.latest_only:
        print('Step 3: Updating index...')
        update_index(KR_STOCKS_DIR, INDEX_FILE)
        print(f'\nDone! (latest-only, {api_call_count} API calls)')
        return

    # ── Step 3: Historical quarter-end prices ──
    print(f'Step 3: Fetching historical quarter-end prices ({args.start_year}-{END_YEAR})...')
    quarter_dates = get_quarter_end_dates(args.start_year, END_YEAR)
    print(f'  {len(quarter_dates)} quarter-end dates to fetch\n')

    quarterly_prices = {}
    for i, (year, quarter, date_str) in enumerate(quarter_dates):
        print(f'  [{i+1}/{len(quarter_dates)}] {year} {quarter} ({date_str})')
        day_data, _ = try_fetch_with_fallback(date_str)

        for stock_code, info in day_data.items():
            if test_codes and stock_code not in test_codes:
                continue
            if stock_code not in quarterly_prices:
                quarterly_prices[stock_code] = {}
            quarterly_prices[stock_code][(year, quarter)] = info

    print(f'\n  Collected quarterly prices for {len(quarterly_prices)} stocks')
    print('  Merging quarterly close prices...')
    count = merge_historical_prices(quarterly_prices, KR_STOCKS_DIR, 'quarterly', test_codes)
    print(f'  Updated {count} company files')

    # ── Step 4: Historical year-end prices ──
    print(f'\nStep 4: Fetching historical year-end prices ({args.start_year}-{END_YEAR})...')
    year_dates = get_year_end_dates(args.start_year, END_YEAR)
    print(f'  {len(year_dates)} year-end dates to fetch\n')

    annual_prices = {}
    for i, (year, date_str) in enumerate(year_dates):
        print(f'  [{i+1}/{len(year_dates)}] {year} ({date_str})')
        day_data, _ = try_fetch_with_fallback(date_str)

        for stock_code, info in day_data.items():
            if test_codes and stock_code not in test_codes:
                continue
            if stock_code not in annual_prices:
                annual_prices[stock_code] = {}
            annual_prices[stock_code][year] = info

    print(f'\n  Collected annual prices for {len(annual_prices)} stocks')
    print('  Merging annual close prices...')
    count = merge_historical_prices(annual_prices, KR_STOCKS_DIR, 'annual', test_codes)
    print(f'  Updated {count} company files')

    # ── Step 5: Update index ──
    print('\nStep 5: Updating index...')
    update_index(KR_STOCKS_DIR, INDEX_FILE)

    print(f'\nDone! ({api_call_count} API calls)')


if __name__ == '__main__':
    main()
