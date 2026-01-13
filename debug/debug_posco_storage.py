import json
import csv
import re
import collections

def parse_value(v):
    if not v or v.strip() == '': return None
    try:
        clean = re.sub(r'[^\d\-]', '', v)
        if not clean or clean == '-': return None
        return int(clean)
    except:
        return None

def clean_header(h):
    return h.replace(' ', '').replace('\xa0', '').strip()

# Simulate the data storage structure
data = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(dict)))

print("=" * 80)
print("Simulating data extraction for POSCO (005490) in 2022")
print("=" * 80)

# Process 2022 3Q Report
print("\n1. Processing 2022_3분기보고서 file...")
filepath = 'csv_output/2022_3분기보고서_03_포괄손익계산서_연결_20240611.csv'
with open(filepath, 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    headers = [clean_header(h) for h in next(reader)]

    code_idx = headers.index('종목코드')
    item_name_idx = headers.index('항목명')

    # Map columns to period keys
    col_map = {}
    for idx, h in enumerate(headers):
        if h: col_map[h] = idx

    def get_idx(candidates):
        for c in candidates:
            if c in col_map: return col_map[c]
        return None

    # For 3분기보고서
    target_periods = [
        ('3Q', ['당기3분기3개월']),
        ('3Q_Acc', ['당기3분기누적'])
    ]

    for row in reader:
        if '[005490]' in row[code_idx] and '매출액' == row[item_name_idx]:
            for period_key, allowed_cols in target_periods:
                col_idx = get_idx(allowed_cols)
                if col_idx is not None:
                    val = parse_value(row[col_idx])
                    if val is not None:
                        target_year = 2022
                        data['005490'][target_year][period_key]['revenue'] = val
                        print(f"  Stored: data['005490'][{target_year}]['{period_key}']['revenue'] = {val:,} ({val/100000000:,.1f} 억)")
            break

# Process 2022 Annual Report
print("\n2. Processing 2022_사업보고서 file...")
filepath = 'csv_output/2022_사업보고서_03_포괄손익계산서_연결_20251113.csv'
with open(filepath, 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    headers = [clean_header(h) for h in next(reader)]

    code_idx = headers.index('종목코드')
    item_name_idx = headers.index('항목명')

    col_map = {}
    for idx, h in enumerate(headers):
        if h: col_map[h] = idx

    def get_idx(candidates):
        for c in candidates:
            if c in col_map: return col_map[c]
        return None

    # For 사업보고서
    target_periods = [
        ('Annual_Current', ['당기', '당기사업년도']),
        ('Annual_Previous_From_Next', ['전기', '전기사업년도'])
    ]

    for row in reader:
        if '[005490]' in row[code_idx] and '매출액' == row[item_name_idx]:
            for period_key, allowed_cols in target_periods:
                col_idx = get_idx(allowed_cols)
                if col_idx is not None:
                    val = parse_value(row[col_idx])
                    if val is not None:
                        target_year = 2022
                        storage_key = period_key

                        # For Annual_Previous_From_Next -> target_year = year - 1
                        if period_key == 'Annual_Previous_From_Next':
                            target_year = 2021
                            storage_key = 'Annual_Previous'

                        data['005490'][target_year][storage_key]['revenue'] = val
                        print(f"  Stored: data['005490'][{target_year}]['{storage_key}']['revenue'] = {val:,} ({val/100000000:,.1f} 억)")
            break

print("\n" + "=" * 80)
print("Simulating Q4 Calculation (compile_final_data)")
print("=" * 80)

year = 2022
y_data = data['005490'][year]

print(f"\nData for year {year}:")
for key in sorted(y_data.keys()):
    print(f"  {key}: {y_data[key]}")

# Calculate Q4 (from process_data.py:479-481)
annual_total = y_data.get('Annual_Current')
if not annual_total:
    annual_total = y_data.get('Annual_Previous')

q3_acc = y_data.get('3Q_Acc')

print(f"\nQ4 Calculation:")
print(f"  annual_total = {annual_total}")
print(f"  q3_acc = {q3_acc}")

if annual_total and q3_acc:
    val_ann = annual_total.get('revenue')
    val_q3 = q3_acc.get('revenue')
    if val_ann is not None and val_q3 is not None:
        q4_revenue = val_ann - val_q3
        print(f"\n  Q4 revenue = annual_total['revenue'] - q3_acc['revenue']")
        print(f"  Q4 revenue = {val_ann:,} - {val_q3:,}")
        print(f"  Q4 revenue = {q4_revenue:,} ({q4_revenue/100000000:,.1f} 억)")
    else:
        print("\n  ERROR: Could not calculate Q4 - missing values")
        print(f"    val_ann = {val_ann}")
        print(f"    val_q3 = {val_q3}")
else:
    print("\n  ERROR: Could not calculate Q4 - missing annual_total or q3_acc")

# Now check actual financial_data.json
print("\n" + "=" * 80)
print("Checking actual financial_data.json")
print("=" * 80)

with open('financial_data.json', 'r', encoding='utf-8') as f:
    actual_data = json.load(f)

posco = actual_data.get('005490', {})
print(f"\n2022 entries in financial_data.json:")
for entry in posco.get('history', []):
    if entry['year'] == 2022:
        revenue = entry.get('revenue', 0)
        print(f"  {entry['year']} {entry['quarter']}: {revenue:,} ({revenue/100000000:,.1f} 억)")
