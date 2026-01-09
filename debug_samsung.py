"""
Debug script for 삼성전자 4Q revenue calculation
Expected values:
- 2024 4Q: 75,788,300,000,000 (75.79조)
- 2023 4Q: 67,779,900,000,000 (67.78조)
"""
import os
import csv
import re
import json

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

# 삼성전자 코드
SAMSUNG_CODE = '005930'
CSV_DIR = 'csv_output'

print("=== 삼성전자 4Q 디버그 ===\n")

# 1. 사업보고서에서 Annual 데이터 확인
print("1. 사업보고서 확인 (Annual 데이터)")
print("-" * 80)

annual_data = {}

for year in [2024, 2025]:
    annual_file = f"{year}_사업보고서_03_포괄손익계산서_연결_"
    matching_files = [f for f in os.listdir(CSV_DIR) if f.startswith(annual_file)]

    if not matching_files:
        print(f"  {year} 사업보고서: 파일 없음")
        continue

    filepath = os.path.join(CSV_DIR, matching_files[0])
    print(f"\n  파일: {matching_files[0]}")

    with open(filepath, 'r', encoding='utf-8-sig', newline='') as f:
        reader = csv.reader(f)
        rows = list(reader)

    headers = [clean_header(h) for h in rows[0]]
    col_map = {h: idx for idx, h in enumerate(headers) if h}
    col_code = col_map.get('종목코드')
    col_item_name = col_map.get('항목명')
    col_item_code = col_map.get('항목코드')
    col_danggi = col_map.get('당기') or col_map.get('당기사업년도')
    col_jeongi = col_map.get('전기') or col_map.get('전기사업년도')

    print(f"  컬럼: 당기={col_danggi}, 전기={col_jeongi}")

    for row in rows[1:]:
        if len(row) <= max(filter(None, [col_code, col_item_name, col_danggi, col_jeongi, col_item_code])):
            continue

        code = row[col_code].strip()
        if SAMSUNG_CODE not in code:
            continue

        item_name = row[col_item_name].strip()
        item_code = row[col_item_code].strip() if col_item_code else ''

        if 'ifrs_Revenue' in item_code or 'ifrs-full_Revenue' in item_code:
            danggi_val = parse_value(row[col_danggi]) if col_danggi else None
            jeongi_val = parse_value(row[col_jeongi]) if col_jeongi else None

            print(f"  항목: {item_name} ({item_code})")
            if danggi_val:
                target_year = year - 1
                annual_data[target_year] = danggi_val
                print(f"    당기(={target_year}년): {danggi_val:,} ({danggi_val/1e12:.2f}조)")
            if jeongi_val:
                target_year = year - 2
                print(f"    전기(={target_year}년): {jeongi_val:,} ({jeongi_val/1e12:.2f}조)")
            break

# 2. 3분기보고서에서 3Q_Acc 확인
print("\n\n2. 3분기보고서 확인 (3Q 누적)")
print("-" * 80)

q3_acc_data = {}

for year in [2023, 2024]:
    q3_file = f"{year}_3분기보고서_03_포괄손익계산서_연결_"
    matching_files = [f for f in os.listdir(CSV_DIR) if f.startswith(q3_file)]

    if not matching_files:
        print(f"  {year} 3분기보고서: 파일 없음")
        continue

    filepath = os.path.join(CSV_DIR, matching_files[0])
    print(f"\n  파일: {matching_files[0]}")

    with open(filepath, 'r', encoding='utf-8-sig', newline='') as f:
        reader = csv.reader(f)
        rows = list(reader)

    headers = [clean_header(h) for h in rows[0]]
    col_map = {h: idx for idx, h in enumerate(headers) if h}

    col_code = col_map.get('종목코드')
    col_item_name = col_map.get('항목명')
    col_item_code = col_map.get('항목코드')
    col_3q_acc = col_map.get('당기3분기누적')

    print(f"  컬럼: 당기3분기누적={col_3q_acc}")

    for row in rows[1:]:
        if len(row) <= max(filter(None, [col_code, col_item_name, col_3q_acc, col_item_code])):
            continue

        code = row[col_code].strip()
        if SAMSUNG_CODE not in code:
            continue

        item_name = row[col_item_name].strip()
        item_code = row[col_item_code].strip() if col_item_code else ''

        if 'ifrs_Revenue' in item_code or 'ifrs-full_Revenue' in item_code:
            q3_acc_val = parse_value(row[col_3q_acc]) if col_3q_acc else None

            if q3_acc_val:
                q3_acc_data[year] = q3_acc_val
                print(f"  항목: {item_name} ({item_code})")
                print(f"    3Q 누적: {q3_acc_val:,} ({q3_acc_val/1e12:.2f}조)")
                break

# 3. 4Q 계산
print("\n\n3. 4Q 계산 (Annual - 3Q_Acc)")
print("-" * 80)

print("\n예상값:")
print("  2024 4Q: 75,788,300,000,000 (75.79조)")
print("  2023 4Q: 67,779,900,000,000 (67.78조)")

print("\n실제 계산:")
for year in [2023, 2024]:
    if year in annual_data and year in q3_acc_data:
        q4_calc = annual_data[year] - q3_acc_data[year]
        print(f"  {year} 4Q = {annual_data[year]:,} - {q3_acc_data[year]:,}")
        print(f"         = {q4_calc:,} ({q4_calc/1e12:.2f}조)")
        
        # 예상값과 비교
        expected = 75788300000000 if year == 2024 else 67779900000000
        diff = abs(q4_calc - expected)
        match = "✓ 일치!" if diff < 1e9 else f"✗ 차이: {diff:,}"
        print(f"         {match}\n")
    else:
        missing = []
        if year not in annual_data:
            missing.append("Annual")
        if year not in q3_acc_data:
            missing.append("3Q_Acc")
        print(f"  {year} 4Q: 계산 불가 (누락: {', '.join(missing)})\n")

print("\n=== 디버그 완료 ===")
