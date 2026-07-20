"""
Generate quarterly/annual average KRW->USD exchange rates for the Global Compare feature.

Reads DEXKOUS_KRW_to_USD.csv (FRED daily series, KRW per 1 USD) and writes
public/data/krw_usd_rates.json with:
  - quarterly: { "2024-Q1": 1330.5, ... }  (mean of daily rates in that calendar quarter)
  - annual:    { "2024": 1320.1, ... }     (mean of daily rates in that calendar year)
  - latest: { date, rate }                  (most recent available daily rate, for display)

Usage:
    python scripts/generate_fx_quarterly.py
"""

import csv
import json
import os
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_CSV = os.path.join(ROOT, "DEXKOUS_KRW_to_USD.csv")
OUTPUT_JSON = os.path.join(ROOT, "public", "data", "krw_usd_rates.json")


def main():
    quarterly_sums = defaultdict(lambda: [0.0, 0])  # key -> [sum, count]
    annual_sums = defaultdict(lambda: [0.0, 0])
    latest_date, latest_rate = None, None

    with open(INPUT_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            date_str = row["observation_date"]
            rate_str = row["DEXKOUS"].strip()
            if not rate_str or rate_str == ".":
                continue
            rate = float(rate_str)
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

    output = {
        "source": "FRED DEXKOUS (Korean Won to U.S. Dollar Spot Exchange Rate)",
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
    print(f"Written to {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
