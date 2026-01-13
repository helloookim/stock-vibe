import process_data
import os

# Monkey patch to track writes
original_process_file = process_data.FinancialParser.process_file

def tracked_process_file(self, filepath, filename, allow_separate=False):
    # Call original
    result = original_process_file(self, filepath, filename, allow_separate)

    # After processing, check if 005490/2022 data was modified
    if '005490' in self.data and 2022 in self.data['005490']:
        y_data = self.data['005490'][2022]

        annual_current = y_data.get('Annual_Current', {}).get('revenue')
        q3_acc = y_data.get('3Q_Acc', {}).get('revenue')

        if annual_current:
            print(f"{filename:60s} | Annual_Current: {annual_current/100000000:>10,.1f} 억")
        if q3_acc:
            print(f"{filename:60s} | 3Q_Acc:         {q3_acc/100000000:>10,.1f} 억")

    return result

# Replace method
process_data.FinancialParser.process_file = tracked_process_file

parser = process_data.FinancialParser()
files = sorted(os.listdir(process_data.SOURCE_DIR))

parser.build_company_mapping(files)

print("=" * 80)
print("Tracking data changes for 005490 year 2022:")
print("=" * 80)

for f in files:
    if f.endswith('.csv'):
        parser.process_file(os.path.join(process_data.SOURCE_DIR, f), f, allow_separate=False)

print("\n" + "=" * 80)
print("Processing fallback revenue...")
print("=" * 80)
parser.process_fallback_revenue()

# Check final state
print("\n" + "=" * 80)
print("Final raw data for 2022:")
print("=" * 80)

if '005490' in parser.data and 2022 in parser.data['005490']:
    y_data = parser.data['005490'][2022]
    for key in sorted(y_data.keys()):
        if not key.startswith('_meta'):
            val = y_data[key].get('revenue', None)
            if val is not None:
                print(f'  {key:30s}: {val/100000000:12,.1f} 억')
