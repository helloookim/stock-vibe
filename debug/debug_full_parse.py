"""
Debug script to trace exactly what happens to 하이트진로 2025 2Q and 3Q data
"""
import os
import json
import re
import collections
import csv

SOURCE_DIR = "csv_output"

def clean_header(h):
    return h.replace(' ', '').replace('\xa0', '').strip()

def parse_value(v):
    if not v or v.strip() == '': return None
    try:
        clean = re.sub(r'[^\d\-]', '', v)
        if not clean or clean == '-': return None
        return int(clean)
    except:
        return None

# Track data for 하이트진로 only
hite_data = collections.defaultdict(lambda: collections.defaultdict(dict))

files_to_process = [
    "2025_1분기보고서_03_포괄손익계산서_연결_20251223.csv",
    "2025_3분기보고서_03_포괄손익계산서_연결_20251231.csv",
    "2025_반기보고서_03_포괄손익계산서_연결_20260107.csv",
]

for filename in files_to_process:
    filepath = os.path.join(SOURCE_DIR, filename)

    if not os.path.exists(filepath):
        continue

    parts = filename.split('_')
    year = int(parts[0])
    report_type = parts[1]

    print(f"\n{'='*80}")
    print(f"PROCESSING: {filename}")
    print(f"Year: {year}, Report type: {report_type}")
    print(f"{'='*80}")

    target_periods = []
    if '1분기보고서' in report_type:
        target_periods.append(('1Q', ['당기1분기3개월', '당기1분기', '당기']))
    elif '반기보고서' in report_type:
        target_periods.append(('2Q', ['당기반기3개월', '당기2분기3개월', '당기2분기']))
    elif '3분기보고서' in report_type:
        target_periods.append(('3Q', ['당기3분기3개월']))
        target_periods.append(('3Q_Acc', ['당기3분기누적']))

    print(f"Target periods: {target_periods}\n")

    # Read CSV
    encoding_candidates = ['utf-8-sig', 'cp949', 'utf-8', 'euc-kr']
    rows = []

    for enc in encoding_candidates:
        try:
            with open(filepath, 'r', encoding=enc, newline='') as f:
                reader = csv.reader(f)
                rows = list(reader)
            break
        except (UnicodeDecodeError, csv.Error):
            continue

    headers = [clean_header(h) for h in rows[0]]

    col_map = {}
    for idx, h in enumerate(headers):
        if h:
            col_map[h] = idx

    def get_idx(candidates):
        for c in candidates:
            if c in col_map:
                return col_map[c]
        return None

    # Process rows
    for row in rows[1:]:
        if len(row) < max(col_map.values()) + 1:
            continue

        stock_code = row[col_map['종목코드']].strip() if '종목코드' in col_map else ''
        item_code = row[col_map['항목코드']].strip() if '항목코드' in col_map else ''

        if '000080' not in stock_code:
            continue

        if 'ifrs-full_Revenue' not in item_code:
            continue

        print(f"Found 하이트진로 Revenue row\n")

        # Extract values
        for period_key, allowed_cols in target_periods:
            col_idx = get_idx(allowed_cols)
            if col_idx is not None:
                val = parse_value(row[col_idx])
                if val is not None:
                    target_year = year
                    storage_key = period_key

                    print(f"  Period: {period_key}")
                    print(f"    Looked for columns: {allowed_cols}")
                    print(f"    Found at index: {col_idx}")
                    print(f"    Value: {val:,}")
                    print(f"    Storage: hite_data[{target_year}]['{storage_key}']['revenue']")

                    # Check if already exists
                    if storage_key in hite_data[target_year] and 'revenue' in hite_data[target_year][storage_key]:
                        old_val = hite_data[target_year][storage_key]['revenue']
                        print(f"    ⚠️  ALREADY EXISTS! Old value: {old_val:,}, will NOT overwrite")
                    else:
                        hite_data[target_year][storage_key]['revenue'] = val
                        print(f"    ✓ Stored")
                    print()

print(f"\n{'='*80}")
print("FINAL DATA STRUCTURE")
print(f"{'='*80}\n")

for year in sorted(hite_data.keys()):
    print(f"Year {year}:")
    for key in sorted(hite_data[year].keys()):
        revenue = hite_data[year][key].get('revenue')
        if revenue:
            print(f"  {key:10s}: revenue = {revenue:,}")
