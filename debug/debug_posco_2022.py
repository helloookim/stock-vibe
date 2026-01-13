import json
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

print("=" * 80)
print("ISSUE 1: Company Name Mapping")
print("=" * 80)

# Load current financial_data.json
with open('financial_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

posco = data.get('005490', {})
print(f"\nCurrent name in financial_data.json: {posco.get('name', 'N/A')}")
print(f"Expected name: POSCO홀딩스")

# Check company_code_mapping.json
with open('company_code_mapping.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

code_to_name = mapping.get('code_to_company_name', {})
print(f"\nName in code_to_company_name mapping: {code_to_name.get('005490', 'N/A')}")

print("\n" + "=" * 80)
print("ISSUE 2: 2022 Q4 Calculation")
print("=" * 80)

# Get 2022 data from financial_data.json
print("\nCurrent 2022 quarterly data in financial_data.json:")
for entry in posco.get('history', []):
    if entry['year'] == 2022:
        revenue_eok = entry.get('revenue', 0) / 100000000
        print(f"  {entry['year']} {entry['quarter']}: {revenue_eok:,.1f} 억원 ({entry.get('revenue', 0):,} 원)")

# Now check the source CSV files
print("\n" + "-" * 80)
print("Checking source CSV files for 2022:")
print("-" * 80)

# Check 2022 Q3 Report
print("\n1. 2022 Q3 Report (3분기보고서):")
filepath = 'csv_output/2022_3분기보고서_03_포괄손익계산서_연결_20240611.csv'
with open(filepath, 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    headers = [clean_header(h) for h in next(reader)]

    # Find indices
    code_idx = headers.index('종목코드')
    item_name_idx = headers.index('항목명')

    # Print relevant column headers
    print(f"\n  Columns with '당기' in header:")
    for i, h in enumerate(headers):
        if '당기' in h or '전기' in h:
            print(f"    Column {i}: {h}")

    # Find POSCO revenue row
    for row in reader:
        if '[005490]' in row[code_idx] and '매출액' == row[item_name_idx]:
            print(f"\n  POSCO 매출액 row found:")
            print(f"    당기3분기3개월 (col 12): {row[12]}")
            val_12 = parse_value(row[12])
            print(f"      = {val_12:,} 원 = {val_12/100000000:,.1f} 억원")

            print(f"    당기3분기누적 (col 13): {row[13]}")
            val_13 = parse_value(row[13])
            print(f"      = {val_13:,} 원 = {val_13/100000000:,.1f} 억원")
            break

# Check 2022 Annual Report
print("\n2. 2022 Annual Report (사업보고서):")
filepath = 'csv_output/2022_사업보고서_03_포괄손익계산서_연결_20251113.csv'
with open(filepath, 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    headers = [clean_header(h) for h in next(reader)]

    # Find indices
    code_idx = headers.index('종목코드')
    item_name_idx = headers.index('항목명')

    # Print relevant column headers
    print(f"\n  Columns with '당기' in header:")
    for i, h in enumerate(headers):
        if '당기' in h or '전기' in h:
            print(f"    Column {i}: {h}")

    # Find POSCO revenue row
    val_11 = None
    val_15 = None
    for row in reader:
        if '[005490]' in row[code_idx] and '매출액' == row[item_name_idx]:
            print(f"\n  POSCO 매출액 row found:")

            # Find the 당기 column (column 13 based on output)
            col_danggi = 13 if len(row) > 13 else 11
            print(f"    당기 (col {col_danggi}): {row[col_danggi] if len(row) > col_danggi else 'N/A'}")
            if len(row) > col_danggi:
                val_11 = parse_value(row[col_danggi])
                if val_11:
                    print(f"      = {val_11:,} 원 = {val_11/100000000:,.1f} 억원")

            # Find the 전기 column
            col_jeongi = 16 if len(row) > 16 else 15
            if len(row) > col_jeongi:
                print(f"    전기 (col {col_jeongi}): {row[col_jeongi]}")
                val_15 = parse_value(row[col_jeongi])
                if val_15:
                    print(f"      = {val_15:,} 원 = {val_15/100000000:,.1f} 억원")
            break

print("\n" + "=" * 80)
print("EXPECTED 2022 Q4 CALCULATION:")
print("=" * 80)
print(f"\n  Q4 = Annual (당기) - Q3 Accumulated (당기3분기누적)")
if val_11 and val_13:
    q4_expected = val_11 - val_13
    print(f"  Q4 = {val_11:,} - {val_13:,}")
    print(f"  Q4 = {q4_expected:,} 원")
    print(f"  Q4 = {q4_expected/100000000:,.1f} 억원")

    # Compare with actual
    actual_q4 = None
    for entry in posco.get('history', []):
        if entry['year'] == 2022 and entry['quarter'] == '4Q':
            actual_q4 = entry.get('revenue', 0)
            break

    if actual_q4:
        print(f"\n  Actual Q4 in financial_data.json: {actual_q4:,} 원 = {actual_q4/100000000:,.1f} 억원")
        print(f"  Difference: {(q4_expected - actual_q4):,} 원 = {(q4_expected - actual_q4)/100000000:,.1f} 억원")
        print(f"\n  ❌ MISMATCH DETECTED!")
