"""
Extract calendar quarter-end close prices for US stocks from the sibling
us_stock/price_jsons/ dataset (yfinance daily OHLCV), for use in the
Global Compare market cap chart.

Only tickers that exist in both price_jsons/ and public/data/us_stocks/
(i.e. have fundamentals data too) are included.

Output: public/data/us_quarterly_price.json
  { "AAPL": { "2015-Q1": 123.45, ... }, "annual": { "AAPL": { "2015": 130.0, ... } } }

Usage:
    python scripts/generate_us_quarterly_prices.py
"""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRICE_DIR = os.path.join(os.path.dirname(ROOT), "us_stock", "price_jsons")
FUND_DIR = os.path.join(ROOT, "public", "data", "us_stocks")
OUTPUT_JSON = os.path.join(ROOT, "public", "data", "us_quarterly_price.json")


def cal_quarter(date_int):
    year = date_int // 10000
    month = (date_int // 100) % 100
    q = 1 if month <= 3 else 2 if month <= 6 else 3 if month <= 9 else 4
    return year, q


def main():
    fund_tickers = {f[:-5] for f in os.listdir(FUND_DIR) if f.endswith(".json")}
    price_files = sorted(f for f in os.listdir(PRICE_DIR) if f.endswith(".json"))

    quarterly_out = {}
    annual_out = {}
    skipped = 0

    for fname in price_files:
        ticker = fname[:-5]
        if ticker not in fund_tickers:
            skipped += 1
            continue

        with open(os.path.join(PRICE_DIR, fname), "r", encoding="utf-8") as f:
            data = json.load(f)

        prices = data.get("prices", [])
        if not prices:
            continue

        # Keep the last close observed within each calendar quarter / year
        q_last = {}   # (year, q) -> (date, close)
        a_last = {}   # year -> (date, close)

        for p in prices:
            date = p.get("date")
            close = p.get("close")
            if date is None or close is None:
                continue
            year, q = cal_quarter(date)
            qkey = (year, q)
            if qkey not in q_last or date > q_last[qkey][0]:
                q_last[qkey] = (date, close)
            if year not in a_last or date > a_last[year][0]:
                a_last[year] = (date, close)

        quarterly_out[ticker] = {
            f"{y}-Q{q}": round(v[1], 4) for (y, q), v in q_last.items()
        }
        annual_out[ticker] = {
            str(y): round(v[1], 4) for y, v in a_last.items()
        }

    output = {
        "source": "yfinance daily close, resampled to calendar quarter-end / year-end",
        "quarterly": quarterly_out,
        "annual": annual_out,
    }

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False)

    print(f"Tickers with price+fundamentals match: {len(quarterly_out)}")
    print(f"Skipped (no fundamentals match): {skipped}")
    print(f"Written to {OUTPUT_JSON} ({os.path.getsize(OUTPUT_JSON) / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
