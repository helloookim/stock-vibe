"""
Simplified debug: Check if Samsung data exists in internal data structure
"""
import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Import the parser
from process_data import FinancialParser

parser = FinancialParser()
files = sorted(os.listdir('csv_output'))

# Build company mapping
parser.build_company_mapping(files)

# Process all files
for f in files:
    if f.endswith('.csv'):
        parser.process_file(os.path.join('csv_output', f), f)

# Check Samsung data
SAMSUNG_CODE = '005930'

if SAMSUNG_CODE in parser.data:
    print(f"=== 삼성전자 ({SAMSUNG_CODE}) 내부 데이터 구조 ===\n")
    
    for year in sorted(parser.data[SAMSUNG_CODE].keys()):
        if isinstance(year, int) and year >= 2023:
            print(f"\n{year}년:")
            year_data = parser.data[SAMSUNG_CODE][year]
            
            for key in sorted(year_data.keys()):
                if not key.startswith('_meta'):
                    val = year_data[key]
                    if isinstance(val, dict) and 'revenue' in val:
                        rev = val.get('revenue')
                        if rev:
                            print(f"  {key}: revenue = {rev:,} ({rev/1e12:.2f}조)")
                        else:
                            print(f"  {key}: revenue = None")
                    else:
                        print(f"  {key}: {val}")
    
    print("\n\n=== 4Q 계산 가능 여부 ===")
    for year in [2023, 2024]:
        annual_current = parser.data[SAMSUNG_CODE].get(year, {}).get('Annual_Current', {})
        annual_prev = parser.data[SAMSUNG_CODE].get(year, {}).get('Annual_Previous', {})
        q3_acc = parser.data[SAMSUNG_CODE].get(year, {}).get('3Q_Acc', {})
        
        annual_rev = annual_current.get('revenue') or annual_prev.get('revenue')
        q3_acc_rev = q3_acc.get('revenue')
        
        print(f"\n{year}년:")
        print(f"  Annual: {annual_rev/1e12:.2f}조" if annual_rev else "  Annual: None")
        print(f"  3Q_Acc: {q3_acc_rev/1e12:.2f}조" if q3_acc_rev else "  3Q_Acc: None")
        
        if annual_rev and q3_acc_rev:
            q4_calc = annual_rev - q3_acc_rev
            print(f"  4Q 계산: {annual_rev/1e12:.2f}조 - {q3_acc_rev/1e12:.2f}조 = {q4_calc/1e12:.2f}조")
            
            expected = 75.79 if year == 2024 else 67.78
            print(f"  예상값: {expected}조")
            print(f"  일치: {'✓' if abs(q4_calc/1e12 - expected) < 0.1 else '✗'}")
        else:
            print("  4Q 계산 불가")
            
else:
    print(f"삼성전자 ({SAMSUNG_CODE}) 데이터가 없습니다")

print("\n\n=== 처리된 사업보고서 파일 ===")
processed_files = [f for f in files if '사업보고서' in f and '연결' in f and ('손익계산서' in f or '포괄손익계산서' in f)]
for f in processed_files[:10]:
    print(f"  {f}")
