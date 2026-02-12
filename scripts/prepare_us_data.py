"""
Prepare US stock data for deployment.
1. Reads us_company_tickers.json, filters to tickers with data files
2. Generates public/data/us_company_index.json (sidebar index)
3. Copies individual JSON files to public/data/us_stocks/
"""

import json
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TICKERS_FILE = os.path.join(ROOT, "us_company_tickers.json")
SOURCE_DIR = os.path.join(ROOT, "us_fixed_company_jsons")
OUTPUT_INDEX = os.path.join(ROOT, "public", "data", "us_company_index.json")
OUTPUT_DIR = os.path.join(ROOT, "public", "data", "us_stocks")


def main():
    # Load tickers index
    with open(TICKERS_FILE, "r", encoding="utf-8") as f:
        tickers_raw = json.load(f)

    # Get available data files
    data_files = set(
        f.replace(".json", "")
        for f in os.listdir(SOURCE_DIR)
        if f.endswith(".json")
    )

    # Filter to tickers with data, preserve market cap rank order
    index = []
    for key in sorted(tickers_raw.keys(), key=lambda k: int(k)):
        entry = tickers_raw[key]
        ticker = entry["ticker"]
        if ticker in data_files:
            index.append({
                "ticker": ticker,
                "name": entry["title"],
                "rank": int(key),
            })

    print(f"Total tickers in index: {len(tickers_raw)}")
    print(f"Data files available: {len(data_files)}")
    print(f"Matched (included in output): {len(index)}")

    # Write index file
    os.makedirs(os.path.dirname(OUTPUT_INDEX), exist_ok=True)
    with open(OUTPUT_INDEX, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False)
    print(f"Written index to {OUTPUT_INDEX} ({os.path.getsize(OUTPUT_INDEX) / 1024:.1f} KB)")

    # Copy data files
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    copied = 0
    for ticker_info in index:
        ticker = ticker_info["ticker"]
        src = os.path.join(SOURCE_DIR, f"{ticker}.json")
        dst = os.path.join(OUTPUT_DIR, f"{ticker}.json")
        shutil.copy2(src, dst)
        copied += 1

    print(f"Copied {copied} company JSON files to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
