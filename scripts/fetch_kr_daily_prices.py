"""
Daily Price History Pipeline — data.go.kr (금융위원회 주식시세정보)
===================================================================
Fetches daily close prices for top N companies by market cap (2020~today).
Stores results in public/data/kr_daily_prices/{stock_code}.json

Usage:
    python scripts/fetch_kr_daily_prices.py                  # Backfill 2020~today (top 200)
    python scripts/fetch_kr_daily_prices.py --append-latest  # Append today only
    python scripts/fetch_kr_daily_prices.py --top 500        # Top 500 companies
    python scripts/fetch_kr_daily_prices.py --start-date 20240101  # From specific date

Output format (per company):
    { "prices": [[20200102, 54800], [20200103, 55200], ...] }
    Date: YYYYMMDD int, Price: KRW int
"""

import json
import time
import argparse
from pathlib import Path
from datetime import datetime, timedelta
import requests

# ─── Config ───────────────────────────────────────────────────────────────────

SERVICE_KEY = '2a327102611efa5643bdb9b496315271f3b9cb144d8add5968d415a433c7261d'
API_URL = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo'

RATE_LIMIT_DELAY = 0.35  # seconds between API calls
MAX_RETRIES = 3
NUM_OF_ROWS = 5000

DEFAULT_TOP_N = 200
DEFAULT_START_DATE = '20200102'

ROOT_DIR = Path(__file__).parent.parent
INDEX_FILE = ROOT_DIR / 'public' / 'data' / 'kr_company_index.json'
DAILY_DIR = ROOT_DIR / 'public' / 'data' / 'kr_daily_prices'


# ─── Helpers ─────────────────────────────────────────────────────────────────

def load_top_n_codes(n):
    """Return top N stock codes sorted by last_mktcap descending."""
    with open(INDEX_FILE, 'r', encoding='utf-8') as f:
        index = json.load(f)
    ranked = sorted(
        [c for c in index if c.get('last_mktcap')],
        key=lambda c: c['last_mktcap'],
        reverse=True
    )
    codes = [c['stock_code'] for c in ranked[:n]]
    print(f'Top {n} companies loaded (largest: {ranked[0]["name"]}, smallest: {ranked[n-1]["name"]})')
    return set(codes)


def get_trading_dates(start_date_str, end_date_str=None):
    """Generate weekday dates from start to end (inclusive)."""
    start = datetime.strptime(start_date_str, '%Y%m%d')
    end = datetime.strptime(end_date_str, '%Y%m%d') if end_date_str else datetime.now()
    dates = []
    cur = start
    while cur <= end:
        if cur.weekday() < 5:  # Mon–Fri
            dates.append(cur.strftime('%Y%m%d'))
        cur += timedelta(days=1)
    return dates


def fetch_date(date_str):
    """Fetch all stocks for a single date. Returns {stock_code: close_price}."""
    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.get(API_URL, params={
                'serviceKey': SERVICE_KEY,
                'numOfRows': NUM_OF_ROWS,
                'pageNo': 1,
                'resultType': 'json',
                'basDt': date_str,
            }, timeout=60)
            resp.raise_for_status()
            time.sleep(RATE_LIMIT_DELAY)

            items = resp.json().get('response', {}).get('body', {}).get('items', {}).get('item', [])
            if isinstance(items, dict):
                items = [items]

            result = {}
            for rec in items:
                code = rec.get('srtnCd', '')
                if len(code) != 6 or not code.isdigit():
                    continue
                try:
                    price = int(str(rec.get('clpr', '')).replace(',', ''))
                    if price > 0:
                        result[code] = price
                except (ValueError, TypeError):
                    continue
            return result

        except requests.RequestException as e:
            if attempt < MAX_RETRIES - 1:
                wait = 2 ** attempt
                print(f'    Retry in {wait}s ({e})')
                time.sleep(wait)
            else:
                print(f'    Failed after {MAX_RETRIES} attempts: {e}')
    return {}


def load_existing(stock_code):
    """Load existing price entries for a company. Returns list of [date, price]."""
    path = DAILY_DIR / f'{stock_code}.json'
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f).get('prices', [])
    return []


def save_prices(stock_code, prices):
    """Save price list to file."""
    path = DAILY_DIR / f'{stock_code}.json'
    with open(path, 'w', encoding='utf-8') as f:
        json.dump({'prices': prices}, f, separators=(',', ':'))


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='KR daily price history pipeline')
    parser.add_argument('--append-latest', action='store_true',
                        help='Append only the latest trading day (fast, for daily CI)')
    parser.add_argument('--top', type=int, default=DEFAULT_TOP_N,
                        help=f'Number of top companies by market cap (default: {DEFAULT_TOP_N})')
    parser.add_argument('--start-date', type=str, default=DEFAULT_START_DATE,
                        help='Start date YYYYMMDD for backfill (default: 20200102)')
    args = parser.parse_args()

    DAILY_DIR.mkdir(parents=True, exist_ok=True)
    target_codes = load_top_n_codes(args.top)

    if args.append_latest:
        # Find the latest date in existing files to determine what's missing
        sample_code = next(iter(target_codes))
        existing = load_existing(sample_code)
        if existing:
            last_date = str(existing[-1][0])
            last_dt = datetime.strptime(last_date, '%Y%m%d')
            start_dt = last_dt + timedelta(days=1)
        else:
            start_dt = datetime.strptime(DEFAULT_START_DATE, '%Y%m%d')

        dates = get_trading_dates(start_dt.strftime('%Y%m%d'))
        if not dates:
            print('Already up to date.')
            return
        print(f'Appending {len(dates)} missing date(s) starting {dates[0]}')
    else:
        dates = get_trading_dates(args.start_date)
        print(f'Backfill: {len(dates)} dates from {dates[0]} to {dates[-1]}')

    # Load existing data for all target companies
    data = {code: load_existing(code) for code in target_codes}
    existing_dates = {code: {entry[0] for entry in entries} for code, entries in data.items()}

    total = len(dates)
    api_calls = 0
    skipped = 0

    for i, date_str in enumerate(dates):
        date_int = int(date_str)

        # Skip if all companies already have this date
        all_have = all(date_int in existing_dates.get(code, set()) for code in target_codes)
        if all_have:
            skipped += 1
            continue

        print(f'[{i+1}/{total}] {date_str}', end='  ', flush=True)
        day_data = fetch_date(date_str)
        api_calls += 1

        if not day_data:
            print('(no data - holiday?)')
            continue

        found = 0
        for code in target_codes:
            if code in day_data:
                if date_int not in existing_dates.get(code, set()):
                    data[code].append([date_int, day_data[code]])
                    found += 1

        print(f'{found} companies')

    print(f'\nAPI calls: {api_calls} (skipped {skipped} already-fetched dates)')
    print('Saving files...')

    saved = 0
    for code in target_codes:
        prices = sorted(data[code], key=lambda x: x[0])
        save_prices(code, prices)
        saved += 1

    print(f'Saved {saved} files to {DAILY_DIR}')
    print('Done!')


if __name__ == '__main__':
    main()
