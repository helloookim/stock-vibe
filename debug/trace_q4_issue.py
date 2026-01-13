import os
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

# Simulate the data storage
data = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(dict)))

# Get all CSV files sorted
files = sorted([f for f in os.listdir('csv_output') if f.endswith('.csv')])

print("=" * 80)
print("Tracing all files that affect POSCO 005490 year 2022")
print("=" * 80)

for filename in files:
    if not ('2022' in filename or '2023' in filename or '2024' in filename):
        continue

    if '연결' not in filename:
        continue

    if '포괄손익계산서' not in filename and '손익계산서' not in filename:
        continue

    filepath = os.path.join('csv_output', filename)

    # Parse filename
    parts = filename.split('_')
    year = int(parts[0])
    report_type = parts[1]

    # Skip if not relevant
    if year not in [2022, 2023, 2024]:
        continue

    with open(filepath, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        headers = [clean_header(h) for h in next(reader)]

        code_idx = headers.index('종목코드') if '종목코드' in headers else None
        item_name_idx = headers.index('항목명') if '항목명' in headers else None

        if code_idx is None or item_name_idx is None:
            continue

        col_map = {}
        for idx, h in enumerate(headers):
            if h: col_map[h] = idx

        def get_idx(candidates):
            for c in candidates:
                if c in col_map: return col_map[c]
            return None

        # Determine target periods based on report type
        target_periods = []
        if '1분기보고서' in report_type:
            target_periods.append(('1Q', ['당기1분기3개월', '당기1분기', '당기']))
        elif '반기보고서' in report_type:
            target_periods.append(('2Q', ['당기반기3개월', '당기2분기3개월', '당기2분기']))
        elif '3분기보고서' in report_type:
            target_periods.append(('3Q', ['당기3분기3개월']))
            target_periods.append(('3Q_Acc', ['당기3분기누적']))
        elif '사업보고서' in report_type:
            target_periods.append(('Annual_Current', ['당기', '당기사업년도']))
            target_periods.append(('Annual_Previous_From_Next', ['전기', '전기사업년도']))

        # Find POSCO data
        found_posco = False
        for row in reader:
            if code_idx and '[005490]' in row[code_idx]:
                if item_name_idx and '매출액' == row[item_name_idx]:
                    found_posco = True

                    for period_key, allowed_cols in target_periods:
                        col_idx = get_idx(allowed_cols)
                        if col_idx is not None and col_idx < len(row):
                            val = parse_value(row[col_idx])
                            if val is not None:
                                target_year = year
                                storage_key = period_key

                                if period_key == 'Annual_Current':
                                    target_year = year
                                elif period_key == 'Annual_Previous_From_Next':
                                    target_year = year - 1
                                    storage_key = 'Annual_Previous'

                                # Only track year 2022
                                if target_year == 2022:
                                    # Check if overwriting
                                    prev_val = data['005490'][target_year][storage_key].get('revenue')
                                    if prev_val and prev_val != val:
                                        print(f"\n>>> OVERWRITE in {filename}")
                                        print(f"    {storage_key}: {prev_val:,} -> {val:,}")

                                    data['005490'][target_year][storage_key]['revenue'] = val
                                    print(f"{filename:60s} | year={target_year} | {storage_key:25s} | {val/100000000:>10,.1f} 억")
                    break

        if not found_posco:
            # Check if file should have POSCO
            pass

print("\n" + "=" * 80)
print("Final state for 2022:")
print("=" * 80)

year_data = data['005490'][2022]
for key in sorted(year_data.keys()):
    val = year_data[key].get('revenue', 0)
    print(f"  {key:25s}: {val:>15,} ({val/100000000:>10,.1f} 억)")

print("\n" + "=" * 80)
print("Q4 Calculation:")
print("=" * 80)

annual_total = year_data.get('Annual_Current')
if not annual_total:
    annual_total = year_data.get('Annual_Previous')
    print("Using Annual_Previous (no Annual_Current)")
else:
    print("Using Annual_Current")

q3_acc = year_data.get('3Q_Acc')

if annual_total and q3_acc:
    val_ann = annual_total.get('revenue')
    val_q3 = q3_acc.get('revenue')
    if val_ann and val_q3:
        q4 = val_ann - val_q3
        print(f"\nQ4 = {val_ann:,} - {val_q3:,}")
        print(f"Q4 = {q4:,} ({q4/100000000:,.1f} 억)")
