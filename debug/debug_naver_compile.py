"""Debug NAVER 2019 Q4 compilation"""
import sys
import os
import json

from process_data import FinancialParser

parser = FinancialParser()

# Process only necessary 2019 files for NAVER
files = [
    '2019_1분기보고서_03_포괄손익계산서_연결_20251219.csv',
    '2019_반기보고서_03_포괄손익계산서_연결_20250605.csv',
    '2019_3분기보고서_03_포괄손익계산서_연결_20250605.csv',
    '2019_사업보고서_03_포괄손익계산서_연결_20250820.csv'
]

SOURCE_DIR = 'csv_output'

for f in files:
    filepath = os.path.join(SOURCE_DIR, f)
    if os.path.exists(filepath):
        parser.process_file(filepath, f)

# Compile final data
final_data = parser.compile_final_data()

# Check NAVER
naver_code = '035420'
if naver_code in final_data:
    naver = final_data[naver_code]
    history_2019 = [h for h in naver['history'] if h['year'] == 2019]
    
    print("NAVER 2019년 최종 데이터:")
    for h in sorted(history_2019, key=lambda x: ['1Q','2Q','3Q','4Q'].index(x['quarter']) if x['quarter'] in ['1Q','2Q','3Q','4Q'] else 99):
        rev = h.get('revenue', 0) / 100000000
        print(f"  {h['quarter']}: 매출={rev:.0f}억원")
    
    if not any(h['quarter'] == '4Q' for h in history_2019):
        print("\n  ❌ 4Q 데이터 없음!")
        
        # Check internal data
        internal = parser.data.get(naver_code, {}).get(2019, {})
        print("\n내부 데이터 확인:")
        print(f"  Annual_Current: {internal.get('Annual_Current')}")
        print(f"  Annual_Previous: {internal.get('Annual_Previous')}")
        print(f"  3Q_Acc: {internal.get('3Q_Acc')}")
else:
    print("NAVER 데이터 없음!")

