import process_data
import os

# Monkey patch to add detailed tracing
original_process = process_data.FinancialParser.process_file

def traced_process(self, filepath, filename, allow_separate=False):
    # Only trace 2022 연결 files
    if '2022' in filename and '연결' in filename and ('3분기보고서' in filename or '사업보고서' in filename):
        print(f"\n{'='*80}")
        print(f"TRACING: {filename}")
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

        # Read the file
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            headers = [clean_header(h) for h in next(reader)]

            print(f"\nColumn headers containing '당기' or '전기':")
            for i, h in enumerate(headers):
                if '당기' in h or '전기' in h:
                    print(f"  Column {i}: {h}")

            # Find POSCO 매출액 rows
            posco_found = False
            for row in reader:
                if len(row) > 1:
                    # Check for POSCO code
                    code_cell = row[1] if len(row) > 1 else ''
                    if '005490' in code_cell or '[005490]' in code_cell:
                        # Check if this is 매출액 row
                        item_name_col = None
                        for i, h in enumerate(headers):
                            if h == '항목명':
                                item_name_col = i
                                break

                        if item_name_col and len(row) > item_name_col:
                            item_name = row[item_name_col].strip()
                            if '매출액' == item_name:
                                posco_found = True
                                print(f"\n>>> FOUND POSCO 매출액 row:")
                                print(f"    종목코드: {row[1]}")
                                print(f"    회사명: {row[2] if len(row) > 2 else 'N/A'}")
                                print(f"    항목명: {item_name}")

                                # Show all period values
                                for i, h in enumerate(headers):
                                    if '당기' in h or '전기' in h:
                                        val = parse_value(row[i]) if len(row) > i else None
                                        if val:
                                            print(f"    {h:30s} (col {i:2d}): {val:20,} = {val/100000000:10,.1f} 억")
                                break

            if not posco_found:
                print(f"\n>>> POSCO 매출액 row NOT FOUND in this file")

    # Call original
    result = original_process(self, filepath, filename, allow_separate)

    # Check what was stored after processing
    if '2022' in filename and '연결' in filename and ('3분기보고서' in filename or '사업보고서' in filename):
        if '005490' in self.data and 2022 in self.data['005490']:
            y_data = self.data['005490'][2022]
            print(f"\n>>> After processing {filename}:")
            print(f"    Data stored for 005490/2022:")
            for key in sorted(y_data.keys()):
                if not key.startswith('_meta'):
                    val = y_data[key].get('revenue', None)
                    if val is not None:
                        print(f"      {key:30s}: {val:20,} ({val/100000000:10,.1f} 억)")

    return result

process_data.FinancialParser.process_file = traced_process

parser = process_data.FinancialParser()
files = sorted(os.listdir(process_data.SOURCE_DIR))

parser.build_company_mapping(files)

print("="*80)
print("Processing files (only showing 2022 연결 files)...")
print("="*80)

for f in files:
    if f.endswith('.csv'):
        parser.process_file(os.path.join(process_data.SOURCE_DIR, f), f, allow_separate=False)

print(f"\n{'='*80}")
print("FINAL STATE for 005490/2022:")
print(f"{'='*80}")

if '005490' in parser.data and 2022 in parser.data['005490']:
    y_data = parser.data['005490'][2022]
    for key in sorted(y_data.keys()):
        if not key.startswith('_meta'):
            val = y_data[key].get('revenue', None)
            if val is not None:
                print(f'  {key:30s}: {val:20,} ({val/100000000:10,.1f} 억)')
else:
    print("  NO DATA FOUND")
