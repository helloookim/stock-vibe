import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

SOURCE_DIR = "손익계산서"
TARGET_CODE = '005930'
FILENAME = "2023_사업보고서_03_포괄손익계산서_연결_20251206.txt"

METRICS = {
    'revenue': {
        'codes': ['ifrs_Revenue', 'ifrs-full_Revenue', 'ifrs-full_InterestRevenueExpense', 'ifrs-full_RevenueFromInterest', 'dart_TotalOperatingRevenue', 'dart_Revenue'],
        'names': ['매출액', '매출', '영업수익', '이자수익', '이자순수익', '보험수익', '보험료수익', '순영업수익', '수익(매출액)']
    }
}

def clean_header(h):
    return h.replace(' ', '').replace('\xa0', '').strip()

def normalize_code(code):
    if not code: return None
    return re.sub(r'[^\d]', '', code).zfill(6)

filepath = os.path.join(SOURCE_DIR, FILENAME)
with open(filepath, encoding='cp949') as f:
    lines = f.readlines()

headers = [clean_header(h) for h in lines[0].split('\t')]
col_map = {h: idx for idx, h in enumerate(headers) if h}
col_code = col_map.get('종목코드')
col_item_code = col_map.get('항목코드')
col_item_name = col_map.get('항목명')

print(f"Scanning items for {TARGET_CODE} in {FILENAME}...")

for line in lines[1:]:
    parts = line.split('\t')
    if len(parts) < max(col_map.values()) + 1: continue
    
    row_code = normalize_code(parts[col_code])
    if row_code != TARGET_CODE: continue
    
    item_code = parts[col_item_code].strip()
    item_name = parts[col_item_name].strip()
    clean_item_name = clean_header(item_name)
    
    match_found = False
    
    # Check if generic logic catches it
    metric_type = None
    
    # Simulate exclusion logic
    if 'CostOfSales' in item_code or '매출원가' in clean_item_name:
        is_excluded = True
    elif 'GrossProfit' in item_code or '매출총이익' in clean_item_name or '매출총손실' in clean_item_name:
        is_excluded = True
    else:
        is_excluded = False

    for m_key, m_def in METRICS.items():
        if any(c in item_code for c in m_def['codes']) or any(n in clean_item_name for n in m_def['names']):
            metric_type = m_key
            break
            
    print(f"Item: {item_code} | {item_name}")
    print(f"  -> Clean Name: {clean_item_name}")
    print(f"  -> Excluded? {is_excluded}")
    print(f"  -> Metric Type: {metric_type}")
    
    if metric_type == 'revenue' and not is_excluded:
        print("  !!! THIS SHOULD BE CAPTURED AS REVENUE !!!")
    print()
