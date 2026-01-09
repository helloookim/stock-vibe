import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

SOURCE_DIR = "손익계산서"
TARGET_CODE = '005930'
# Check '손익계산서' (02) instead of '포괄손익계산서' (03)
FILENAME = "2023_사업보고서_02_손익계산서_연결_20251206.txt" 

filepath = os.path.join(SOURCE_DIR, FILENAME)
if not os.path.exists(filepath):
    print(f"File {FILENAME} not found.")
    sys.exit(0)

print(f"Checking {FILENAME} for Samsung Electronics ({TARGET_CODE})...")

def clean_header(h):
    return h.replace(' ', '').replace('\xa0', '').strip()

def normalize_code(code):
    if not code: return None
    return re.sub(r'[^\d]', '', code).zfill(6)

with open(filepath, encoding='cp949') as f:
    lines = f.readlines()

headers = [clean_header(h) for h in lines[0].split('\t')]
col_map = {h: idx for idx, h in enumerate(headers) if h}
col_code = col_map.get('종목코드')
col_item_code = col_map.get('항목코드')
col_item_name = col_map.get('항목명')

found_count = 0
for i, line in enumerate(lines[1:], start=2):
    parts = line.split('\t')
    if len(parts) < max(col_map.values()) + 1: continue
    
    row_code = normalize_code(parts[col_code])
    if row_code == TARGET_CODE:
        found_count += 1
        item_c = parts[col_item_code].strip()
        item_n = parts[col_item_name].strip()
        
        if 'Revenue' in item_c or '매출' in item_n:
            print(f"  Line {i}: {item_c} | {item_n}")

if found_count > 0:
    print(f"\nFound {found_count} lines for Samsung Electronics in '손익계산서' file.")
else:
    print("\nSamsung Electronics NOT FOUND in '손익계산서' file.")
