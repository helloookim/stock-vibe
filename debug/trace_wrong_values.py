import os
import csv
import re

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

# Target values we're looking for (in 억 won):
target_annual = 358221.9
target_q3_acc = 269140.4

# Tolerance for matching (within 1 억)
tolerance = 100000000  # 1 억 in won

print("=" * 80)
print("Searching for files that contain these WRONG values for POSCO 005490:")
print(f"  Annual: {target_annual:,.1f} 억 ({int(target_annual * 100000000):,} 원)")
print(f"  Q3_Acc: {target_q3_acc:,.1f} 억 ({int(target_q3_acc * 100000000):,} 원)")
print("=" * 80)

files = sorted([f for f in os.listdir('csv_output') if f.endswith('.csv')])

for filename in files:
    if not ('2022' in filename or '2023' in filename or '2024' in filename):
        continue

    # Check both 연결 and 별도
    # if '연결' not in filename:
    #     continue

    if '포괄손익계산서' not in filename and '손익계산서' not in filename:
        continue

    filepath = os.path.join('csv_output', filename)

    with open(filepath, 'r', encoding='utf-8-sig') as f:
        try:
            reader = csv.reader(f)
            headers = [clean_header(h) for h in next(reader)]

            code_idx = headers.index('종목코드') if '종목코드' in headers else None
            item_name_idx = headers.index('항목명') if '항목명' in headers else None

            if code_idx is None or item_name_idx is None:
                continue

            # Find POSCO data
            for row in reader:
                if code_idx and '[005490]' in row[code_idx]:
                    if item_name_idx and '매출액' == row[item_name_idx]:
                        # Check all columns for our target values
                        for i, cell in enumerate(row):
                            val = parse_value(cell)
                            if val:
                                # Check if it matches annual target
                                if abs(val - target_annual * 100000000) < tolerance:
                                    col_name = headers[i] if i < len(headers) else f'Column {i}'
                                    print(f"\n>>> FOUND ANNUAL VALUE in {filename}")
                                    print(f"    Column {i} ({col_name}): {val:,} = {val/100000000:,.1f} 억")

                                # Check if it matches Q3_Acc target
                                if abs(val - target_q3_acc * 100000000) < tolerance:
                                    col_name = headers[i] if i < len(headers) else f'Column {i}'
                                    print(f"\n>>> FOUND Q3_ACC VALUE in {filename}")
                                    print(f"    Column {i} ({col_name}): {val:,} = {val/100000000:,.1f} 억")
                        break
        except Exception as e:
            print(f"Error processing {filename}: {e}")
