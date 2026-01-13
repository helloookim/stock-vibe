import process_data
import os
import json

parser = process_data.FinancialParser()
files = sorted(os.listdir(process_data.SOURCE_DIR))

print("Building company mapping...")
parser.build_company_mapping(files)

print("\nProcessing files...")
for f in files:
    if f.endswith('.csv'):
        parser.process_file(os.path.join(process_data.SOURCE_DIR, f), f, allow_separate=False)

print("\nProcessing fallback revenue...")
parser.process_fallback_revenue()

# Check raw data for 005490 year 2022
print('\n' + '=' * 80)
print('Raw data stored for 005490 year 2022 BEFORE compile_final_data:')
print('=' * 80)

if '005490' in parser.data and 2022 in parser.data['005490']:
    y_data = parser.data['005490'][2022]
    for key in sorted(y_data.keys()):
        if not key.startswith('_meta'):
            val = y_data[key].get('revenue', None)
            if val is not None:
                print(f'  {key:30s}: {val:20,} ({val/100000000:12,.1f} 억)')

print('\n' + '=' * 80)
print('Compiling final data...')
print('=' * 80)

final_data = parser.compile_final_data()

print('\n' + '=' * 80)
print('Final data for 005490 year 2022:')
print('=' * 80)

if '005490' in final_data:
    for entry in final_data['005490']['history']:
        if entry['year'] == 2022:
            rev = entry.get('revenue', 0)
            print(f"  {entry['year']} {entry['quarter']}: {rev:20,} ({rev/100000000:12,.1f} 억)")
