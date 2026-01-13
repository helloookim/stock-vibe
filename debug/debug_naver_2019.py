"""Debug NAVER 2019 data processing"""
import sys
import os

# Import process_data module
from process_data import FinancialParser

# Create parser
parser = FinancialParser()

# Process only 2019 files
files = [
    '2019_3분기보고서_03_포괄손익계산서_연결_20250605.csv',
    '2019_사업보고서_03_포괄손익계산서_연결_20250820.csv'
]

SOURCE_DIR = 'csv_output'

for f in files:
    filepath = os.path.join(SOURCE_DIR, f)
    if os.path.exists(filepath):
        print(f"\n=== Processing {f} ===")
        parser.process_file(filepath, f)

# Check NAVER internal data
naver_code = '035420'
if naver_code in parser.data:
    print(f"\n=== NAVER ({naver_code}) Internal Data ===")
    naver_data = parser.data[naver_code]
    
    if 2019 in naver_data:
        print("\n2019년 데이터:")
        year_data = naver_data[2019]
        for key in sorted(year_data.keys()):
            if key.startswith('_meta'):
                continue
            print(f"  {key}: {year_data[key]}")
    else:
        print("2019년 데이터 없음!")
else:
    print(f"\nNAVER ({naver_code}) 데이터 없음!")

