"""Debug NAVER with 2020 annual report"""
import sys, os
from process_data import FinancialParser

parser = FinancialParser()

files = [
    '2019_1분기보고서_03_포괄손익계산서_연결_20251219.csv',
    '2019_반기보고서_03_포괄손익계산서_연결_20250605.csv',
    '2019_3분기보고서_03_포괄손익계산서_연결_20250605.csv',
    '2019_사업보고서_03_포괄손익계산서_연결_20250820.csv',
    '2020_사업보고서_03_포괄손익계산서_연결_20250930.csv'  # Add 2020
]

SOURCE_DIR = 'csv_output'

for f in files:
    filepath = os.path.join(SOURCE_DIR, f)
    if os.path.exists(filepath):
        parser.process_file(filepath, f)
        
        # Check internal data after each file
        if '035420' in parser.data and 2019 in parser.data['035420']:
            year_data = parser.data['035420'][2019]
            print(f"\n[After {f}]")
            print(f"  Annual_Current: {year_data.get('Annual_Current', {}).get('revenue', 'N/A')}")
            print(f"  Annual_Previous: {year_data.get('Annual_Previous', {}).get('revenue', 'N/A')}")
            print(f"  3Q_Acc: {year_data.get('3Q_Acc', {}).get('revenue', 'N/A')}")

# Compile
final_data = parser.compile_final_data()
naver = final_data.get('035420', {})
history_2019 = [h for h in naver.get('history', []) if h['year'] == 2019]

print("\n=== FINAL NAVER 2019 ===")
for h in sorted(history_2019, key=lambda x: ['1Q','2Q','3Q','4Q'].index(x['quarter']) if x['quarter'] in ['1Q','2Q','3Q','4Q'] else 99):
    rev = h.get('revenue', 0) / 100000000
    print(f"  {h['quarter']}: 매출={rev:.0f}억원")

