"""
Generate quarterly/annual average KRW->USD exchange rates for the Global Compare feature.

Reads DEXKOUS_KRW_to_USD.csv (FRED daily series, KRW per 1 USD) and writes
public/data/krw_usd_rates.json with:
  - quarterly: { "2024-Q1": 1330.5, ... }  (mean of daily rates in that calendar quarter)
  - annual:    { "2024": 1320.1, ... }     (mean of daily rates in that calendar year)
  - latest: { date, rate }                  (most recent available daily rate, for display)

Usage:
    python scripts/generate_fx_quarterly.py
    python scripts/generate_fx_quarterly.py --yf-fill   # fill days after the CSV's last date from yfinance KRW=X

FRED's download endpoint often drops automated requests. Download the CSV manually from
https://fred.stlouisfed.org/series/DEXKOUS when possible; --yf-fill only bridges the gap
after the CSV ends (KRW=X quarterly means differ from DEXKOUS by ~0.1-0.2%).
"""

import argparse

import csv
import json
import os
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_CSV = os.path.join(ROOT, "DEXKOUS_KRW_to_USD.csv")
OUTPUT_JSON = os.path.join(ROOT, "public", "data", "krw_usd_rates.json")


def yf_fill_rows(after_date):
    """(date_str, rate) from yfinance KRW=X for dates strictly after after_date."""
    import yfinance as yf
    df = yf.download("KRW=X", start=after_date, progress=False, auto_adjust=False)
    close = df["Close"]
    if hasattr(close, "columns"):
        close = close.iloc[:, 0]
    return [(d.strftime("%Y-%m-%d"), round(float(v), 2)) for d, v in close.items()
            if d.strftime("%Y-%m-%d") > after_date and v == v]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--yf-fill", action="store_true", help="fill dates after the CSV ends from yfinance KRW=X")
    args = ap.parse_args()

    quarterly_sums = defaultdict(lambda: [0.0, 0])  # key -> [sum, count]
    annual_sums = defaultdict(lambda: [0.0, 0])
    latest_date, latest_rate = None, None

    rows = []
    with open(INPUT_CSV, "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            rate_str = row["DEXKOUS"].strip()
            if rate_str and rate_str != ".":
                rows.append((row["observation_date"], float(rate_str)))
    fred_last = rows[-1][0]
    filled = yf_fill_rows(fred_last) if args.yf_fill else []
    rows += filled

    for date_str, rate in rows:
        year = int(date_str[:4])
        month = int(date_str[5:7])
        q = (month - 1) // 3 + 1

        qkey = f"{year}-Q{q}"
        quarterly_sums[qkey][0] += rate
        quarterly_sums[qkey][1] += 1

        akey = str(year)
        annual_sums[akey][0] += rate
        annual_sums[akey][1] += 1

        latest_date, latest_rate = date_str, rate

    quarterly = {k: round(v[0] / v[1], 2) for k, v in quarterly_sums.items()}
    annual = {k: round(v[0] / v[1], 2) for k, v in annual_sums.items()}

    source = "FRED DEXKOUS (Korean Won to U.S. Dollar Spot Exchange Rate)"
    if filled:
        source += f"; yfinance KRW=X after {fred_last}"
    output = {
        "source": source,
        "quarterly": quarterly,
        "annual": annual,
        "latest": {"date": latest_date, "rate": latest_rate},
    }

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Quarterly buckets: {len(quarterly)}")
    print(f"Annual buckets: {len(annual)}")
    print(f"Latest: {latest_date} = {latest_rate}")
    if filled:
        print(f"Filled {len(filled)} days from yfinance after FRED last date {fred_last}")
    print(f"Written to {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
