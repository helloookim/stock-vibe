import process_data
import os

# Add debug logging to process_file
original_process = process_data.FinancialParser.process_file

def debug_process(self, filepath, filename, allow_separate=False):
    # Only track 2022 Annual report for POSCO
    if '2022' in filename and '사업보고서' in filename and '연결' in filename:
        print(f"\n{'='*80}")
        print(f"DEBUG: Processing {filename}")
        print(f"{'='*80}")

        import csv, re

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

        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            headers = [clean_header(h) for h in next(reader)]

            print(f"\nColumn mapping for '당기' and '전기':")
            for i, h in enumerate(headers):
                if '당기' in h or '전기' in h:
                    print(f"  Column {i}: {h}")

            # Find POSCO row
            for row in reader:
                if len(row) > 1 and '005490' in row[1]:
                    if len(row) > 10 and '매출액' in row[10]:
                        print(f"\nPOSCO 매출액 row found:")
                        print(f"  Statement type (col 0): {row[0]}")

                        # Check what will be extracted
                        col_map = {}
                        for idx, h in enumerate(headers):
                            if h: col_map[h] = idx

                        def get_idx(candidates):
                            for c in candidates:
                                if c in col_map: return col_map[c]
                            return None

                        # For 사업보고서
                        target_periods = [
                            ('Annual_Current', ['당기', '당기사업년도']),
                            ('Annual_Previous_From_Next', ['전기', '전기사업년도'])
                        ]

                        for period_key, allowed_cols in target_periods:
                            col_idx = get_idx(allowed_cols)
                            if col_idx is not None:
                                val = parse_value(row[col_idx])
                                print(f"  {period_key:30s} (col {col_idx}): {val:20,} = {val/100000000:10,.1f} 억")

                        break

    # Call original
    return original_process(self, filepath, filename, allow_separate)

# Monkey patch
process_data.FinancialParser.process_file = debug_process

parser = process_data.FinancialParser()
files = sorted(os.listdir(process_data.SOURCE_DIR))

parser.build_company_mapping(files)

for f in files:
    if f.endswith('.csv'):
        parser.process_file(os.path.join(process_data.SOURCE_DIR, f), f, allow_separate=False)

print(f"\n{'='*80}")
print("Final stored data for 005490 year 2022:")
print(f"{'='*80}")

if '005490' in parser.data and 2022 in parser.data['005490']:
    y_data = parser.data['005490'][2022]
    for key in sorted(y_data.keys()):
        if not key.startswith('_meta'):
            val = y_data[key].get('revenue', None)
            if val is not None:
                print(f'  {key:30s}: {val:20,} ({val/100000000:10,.1f} 억)')
