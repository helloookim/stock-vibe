"""
US Daily Price Update — yfinance
=================================
Appends latest close prices to public/data/us_daily_prices/{TICKER}.json

Usage:
    python scripts/fetch_us_daily_prices.py              # Append latest (default: last 5 days)
    python scripts/fetch_us_daily_prices.py --days 10    # Fetch last N days
    python scripts/fetch_us_daily_prices.py --backfill   # Full backfill from 2020-01-01

Output format (matches KR daily prices):
    { "prices": [[20240315, 372.97], ...] }
"""

import json
import argparse
from pathlib import Path
from datetime import datetime, timedelta

try:
    import yfinance as yf
except ImportError:
    print('ERROR: yfinance not installed. Run: pip install yfinance')
    raise

ROOT_DIR  = Path(__file__).parent.parent
DAILY_DIR = ROOT_DIR / 'public' / 'data' / 'us_daily_prices'
START_DATE = '2020-01-01'


def load_tickers():
    """Return list of tickers from existing files."""
    return sorted([p.stem for p in DAILY_DIR.glob('*.json')])


def load_existing(ticker):
    """Load existing prices as {date_int: close} dict."""
    path = DAILY_DIR / f'{ticker}.json'
    if not path.exists():
        return {}
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    return {entry[0]: entry[1] for entry in data.get('prices', [])}


def save_prices(ticker, prices_dict):
    """Save sorted price list to file."""
    prices = sorted([[d, c] for d, c in prices_dict.items() if c is not None])
    path = DAILY_DIR / f'{ticker}.json'
    with open(path, 'w', encoding='utf-8') as f:
        json.dump({'prices': prices}, f, separators=(',', ':'))


def fetch_batch(tickers, start, end=None):
    """
    Download close prices for a list of tickers via yfinance batch.
    Returns: { ticker: { date_int: close, ... } }
    """
    end_str = end or datetime.now().strftime('%Y-%m-%d')
    print(f'Downloading {len(tickers)} tickers from {start} to {end_str}...')

    # yfinance batch download
    df = yf.download(
        tickers,
        start=start,
        end=end_str,
        auto_adjust=True,
        progress=False,
        threads=True,
    )

    if df.empty:
        print('No data returned.')
        return {}

    # Extract Close prices
    if len(tickers) == 1:
        # Single ticker: flat columns
        close_df = df[['Close']].copy()
        close_df.columns = tickers
    else:
        close_df = df['Close']

    result = {}
    for ticker in tickers:
        if ticker not in close_df.columns:
            continue
        series = close_df[ticker].dropna()
        result[ticker] = {
            int(dt.strftime('%Y%m%d')): round(float(val), 4)
            for dt, val in series.items()
        }
    return result


def main():
    parser = argparse.ArgumentParser(description='US daily price updater (yfinance)')
    parser.add_argument('--days',     type=int, default=7,
                        help='Fetch last N calendar days (default: 7)')
    parser.add_argument('--backfill', action='store_true',
                        help=f'Full backfill from {START_DATE}')
    args = parser.parse_args()

    DAILY_DIR.mkdir(parents=True, exist_ok=True)
    tickers = load_tickers()
    if not tickers:
        print(f'No ticker files found in {DAILY_DIR}')
        return

    print(f'Tickers: {len(tickers)}')

    if args.backfill:
        start = START_DATE
    else:
        start = (datetime.now() - timedelta(days=args.days)).strftime('%Y-%m-%d')

    # Batch download in chunks of 100 (yfinance works well at this size)
    CHUNK = 100
    all_fetched = {}
    for i in range(0, len(tickers), CHUNK):
        chunk = tickers[i:i + CHUNK]
        print(f'\nChunk {i//CHUNK + 1}/{(len(tickers)-1)//CHUNK + 1}: {chunk[0]}~{chunk[-1]}')
        fetched = fetch_batch(chunk, start)
        all_fetched.update(fetched)

    # Merge into existing files
    updated, unchanged = 0, 0
    for ticker in tickers:
        existing = load_existing(ticker)
        new_data  = all_fetched.get(ticker, {})
        before    = len(existing)
        existing.update(new_data)
        if len(existing) > before:
            save_prices(ticker, existing)
            updated += 1
        else:
            unchanged += 1

    print(f'\nDone: {updated} files updated, {unchanged} unchanged')


if __name__ == '__main__':
    main()
