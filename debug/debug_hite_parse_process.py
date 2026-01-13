import os
import csv
import re

SOURCE_DIR = "csv_output"
csv_file = "2025_반기보고서_03_포괄손익계산서_연결_20260107.csv"
filepath = os.path.join(SOURCE_DIR, csv_file)

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

# Parse filename
parts = csv_file.split('_')
year = int(parts[0])
report_type = parts[1]

print(f"Year: {year}")
print(f"Report type: {report_type}")

# Target periods for 반기보고서
target_periods = []
if '반기보고서' in report_type:
    target_periods.append(('2Q', ['당기반기3개월', '당기2분기3개월', '당기2분기']))

print(f"Target periods: {target_periods}")

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

print(f"\nColumn map: {col_map}")

def get_idx(candidates):
    for c in candidates:
        if c in col_map:
            print(f"  Found column '{c}' at index {col_map[c]}")
            return col_map[c]
    print(f"  No column found for {candidates}")
    return None

# Find 하이트진로 revenue row
print("\n=== PROCESSING 하이트진로 ===")
for row in rows[1:]:
    if len(row) < max(col_map.values()) + 1:
        continue

    stock_code = row[col_map['종목코드']].strip() if '종목코드' in col_map else ''
    item_code = row[col_map['항목코드']].strip() if '항목코드' in col_map else ''

    if '000080' not in stock_code:
        continue

    if 'ifrs-full_Revenue' not in item_code:
        continue

    print(f"\nFound revenue row for 하이트진로:")
    print(f"  Stock code: {stock_code}")
    print(f"  Item code: {item_code}")

    # Extract values for target periods
    for period_key, allowed_cols in target_periods:
        print(f"\n  Processing period: {period_key}")
        print(f"  Looking for columns: {allowed_cols}")

        col_idx = get_idx(allowed_cols)
        if col_idx is not None:
            raw_val = row[col_idx]
            val = parse_value(raw_val)
            print(f"  Raw value: '{raw_val}'")
            print(f"  Parsed value: {val}")

            if val is not None:
                target_year = year
                storage_key = period_key
                print(f"  Will store as: [{target_year}][{storage_key}]['revenue'] = {val}")
        else:
            print(f"  No column found!")

    break
