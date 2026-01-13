import csv
import re

csv_file = r"c:\Users\laser\OneDrive\2026\vibecode\korean_stock\csv_output\2025_반기보고서_03_포괄손익계산서_연결_20260107.csv"

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

# Read CSV
encoding_candidates = ['utf-8-sig', 'cp949', 'utf-8', 'euc-kr']
rows = []

for enc in encoding_candidates:
    try:
        with open(csv_file, 'r', encoding=enc, newline='') as f:
            reader = csv.reader(f)
            rows = list(reader)
        break
    except (UnicodeDecodeError, csv.Error):
        continue

if not rows:
    print("Failed to read file")
    exit(1)

# Get headers
headers = [clean_header(h) for h in rows[0]]
print("=== HEADERS ===")
for idx, h in enumerate(headers):
    print(f"{idx}: {h}")

# Find column mapping
col_map = {}
for idx, h in enumerate(headers):
    if h:
        col_map[h] = idx

print("\n=== COLUMN MAP ===")
for k, v in sorted(col_map.items()):
    print(f"{k} -> {v}")

# Find 하이트진로 revenue row
print("\n=== 하이트진로 REVENUE ROW ===")
for row in rows[1:]:
    if len(row) < 5:
        continue

    # Check both stock code column and item code column
    stock_code = row[1].strip() if len(row) > 1 else ''
    item_code = row[10].strip() if len(row) > 10 else ''

    if '000080' in stock_code and 'ifrs-full_Revenue' in item_code:
        print(f"Row length: {len(row)}")
        for idx, val in enumerate(row):
            print(f"[{idx}] {headers[idx] if idx < len(headers) else '???'} = {val}")

        # Parse values for key columns
        print("\n=== PARSED VALUES ===")

        # 반기보고서 target periods:
        # 2Q -> 당기반기3개월, 당기2분기3개월, 당기2분기
        # Also has: 당기반기누적

        target_columns = [
            '당기반기3개월',
            '당기반기누적',
            '전기반기3개월',
            '전기반기누적',
            '당기2분기3개월',
            '당기2분기',
        ]

        for col_name in target_columns:
            col_idx = col_map.get(col_name)
            if col_idx is not None and col_idx < len(row):
                raw_val = row[col_idx]
                parsed = parse_value(raw_val)
                print(f"{col_name} (idx={col_idx}): '{raw_val}' -> {parsed}")

        break
