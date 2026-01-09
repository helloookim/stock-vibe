import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

SOURCE_DIR = "손익계산서"
TARGET_CODE = '005930'
FILENAME = "2023_사업보고서_03_포괄손익계산서_연결_20251206.txt"

def clean_header(h):
    return h.replace(' ', '').replace('\xa0', '').strip()

def normalize_code(code):
    if not code: return None
    return re.sub(r'[^\d]', '', code).zfill(6)

filepath = os.path.join(SOURCE_DIR, FILENAME)
try:
    with open(filepath, encoding='cp949') as f:
        lines = f.readlines()
except:
    print(f"Failed to read {FILENAME}")
    sys.exit(1)

headers = [clean_header(h) for h in lines[0].split('\t')]
col_map = {h: idx for idx, h in enumerate(headers) if h}
col_code = col_map.get('종목코드')
col_name = col_map.get('회사명')
col_item_code = col_map.get('항목코드')
col_item_name = col_map.get('항목명')

print(f"Header Count: {len(headers)}")
print(f"Max Col Index: {max(col_map.values())}")
print(f"Columns: {col_map}")

print(f"\nScanning ALL lines for {TARGET_CODE}...")

found_count = 0
for i, line in enumerate(lines[1:], start=2):
    parts = line.split('\t')
    
    # Try to find target code at known column index
    if len(parts) > col_code:
        row_code = normalize_code(parts[col_code])
        if row_code == TARGET_CODE:
            found_count += 1
            item_n = parts[col_item_name] if len(parts) > col_item_name else "N/A"
            item_c = parts[col_item_code] if len(parts) > col_item_code else "N/A"
            
            status = "OK"
            if len(parts) < max(col_map.values()) + 1:
                status = f"SHORT ({len(parts)} < {max(col_map.values()) + 1})"
                
            if found_count <= 20 or 'Revenue' in item_c or '매출' in item_n:
                print(f"Line {i} [{status}]: {item_c} | {item_n}")

if found_count == 0:
    print("No lines found for Samsung Electronics found.")
else:
    print(f"Total lines found: {found_count}")
