import os
import csv
import re

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

def process_3q_file():
    """Process 3Q report to see what gets stored"""
    SOURCE_DIR = "csv_output"
    filename = "2025_3분기보고서_03_포괄손익계산서_연결_20251231.csv"
    filepath = os.path.join(SOURCE_DIR, filename)

    parts = filename.split('_')
    year = int(parts[0])
    report_type = parts[1]

    print(f"=== Processing: {filename} ===")
    print(f"Year: {year}")
    print(f"Report type: {report_type}\n")

    # Target periods for 3분기보고서
    target_periods = []
    if '3분기보고서' in report_type:
        target_periods.append(('3Q', ['당기3분기3개월']))
        target_periods.append(('3Q_Acc', ['당기3분기누적']))

    print(f"Target periods: {target_periods}\n")

    # Read CSV
    encoding_candidates = ['utf-8-sig', 'cp949', 'utf-8', 'euc-kr']
    rows = []

    for enc in encoding_candidates:
        try:
            with open(filepath, 'r', encoding=enc, newline='') as f:
                reader = csv.reader(f)
                rows = list(reader)
            break
        except (UnicodeDecodeError, csv.Error):
            continue

    headers = [clean_header(h) for h in rows[0]]

    col_map = {}
    for idx, h in enumerate(headers):
        if h:
            col_map[h] = idx

    def get_idx(candidates):
        for c in candidates:
            if c in col_map:
                return col_map[c]
        return None

    # Find 하이트진로 revenue row
    for row in rows[1:]:
        if len(row) < max(col_map.values()) + 1:
            continue

        stock_code = row[col_map['종목코드']].strip() if '종목코드' in col_map else ''
        item_code = row[col_map['항목코드']].strip() if '항목코드' in col_map else ''

        if '000080' not in stock_code:
            continue

        if 'ifrs-full_Revenue' not in item_code:
            continue

        print(f"Found 하이트진로 revenue row\n")

        # Extract values for target periods
        for period_key, allowed_cols in target_periods:
            col_idx = get_idx(allowed_cols)
            if col_idx is not None:
                raw_val = row[col_idx]
                val = parse_value(raw_val)
                print(f"{period_key}:")
                print(f"  Looking for: {allowed_cols}")
                print(f"  Found column at index: {col_idx}")
                print(f"  Raw value: '{raw_val}'")
                print(f"  Parsed value: {val}")
                print(f"  Will store as: data[000080][{year}]['{period_key}']['revenue'] = {val}")
                print()

        break

process_3q_file()
