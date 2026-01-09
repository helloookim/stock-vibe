import os
import json
import re
import collections
import csv

# CONFIGURATION
SOURCE_DIR = "csv_output"
OUTPUT_FILE = "eps_data.json"

# EXCLUDED SECTORS (Financial and Insurance companies)
EXCLUDED_SECTORS = [
    '은행',
    '금융',
    '증권',
    '보험',
    '여신전문',
    '카드',
    '캐피탈',
    '저축은행',
    '금융업',
    '보험업'
]

# EPS METRIC IDENTIFIERS
EPS_METRICS = {
    'eps': {
        'codes': [
            'ifrs-full_BasicEarningsLossPerShare',
            'ifrs_BasicEarningsLossPerShare',
            'dart_BasicEarningsPerShare'
        ],
        'names': ['기본주당순이익', '기본주당이익', '주당순이익'],
        'exclude_codes': ['Diluted'],  # Exclude diluted EPS
        'exclude_names': ['희석']
    }
}

def clean_header(h):
    return h.replace(' ', '').replace('\xa0', '').strip()

def parse_value(v):
    """Parse EPS value (can be decimal)"""
    if not v or v.strip() == '': return None
    try:
        # Remove all non-numeric characters except minus and decimal point
        clean = re.sub(r'[^\d\-.]', '', v)
        if not clean or clean == '-': return None
        return float(clean)
    except:
        return None

def normalize_code(code, company_name=None):
    """Normalize stock code"""
    if not code or code == '[null]' or re.sub(r'[^\d]', '', code) == '':
        if company_name:
            COMPANY_CODE_MAP = {
                '포스코': '005490',
                'POSCO': '005490',
            }
            return COMPANY_CODE_MAP.get(company_name.strip())
        return None
    return re.sub(r'[^\d]', '', code).zfill(6)

def is_financial_sector(sector):
    """Check if company belongs to financial/insurance sector"""
    if not sector:
        return False

    sector_clean = sector.strip()
    for excluded in EXCLUDED_SECTORS:
        if excluded in sector_clean:
            return True
    return False

def should_exclude_metric(item_code, item_name, metric_def):
    """Check if this item should be excluded from the metric"""
    # Check exclude codes
    for exc_code in metric_def.get('exclude_codes', []):
        if exc_code in item_code:
            return True

    # Check exclude names
    clean_name = clean_header(item_name)
    for exc_name in metric_def.get('exclude_names', []):
        if exc_name in clean_name:
            return True

    return False

def matches_metric_code(item_code, metric_def):
    """Check if item_code matches metric definition codes"""
    allowed_codes = metric_def.get('codes', [])

    for code in allowed_codes:
        if code in item_code:
            return True

    return False

class EPSParser:
    def __init__(self):
        self.data = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(dict)))
        self.meta = {}
        self.company_name_to_code = {}
        self.code_to_company_name = {}

    def build_company_mapping(self, files):
        """Build company name to code mapping from all files"""
        print("\nBuilding company name to code mapping...")

        sorted_files = sorted([f for f in files if f.endswith('.csv')], reverse=True)

        for filename in sorted_files:
            filepath = os.path.join(SOURCE_DIR, filename)

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

            if not rows:
                continue

            headers = [clean_header(h) for h in rows[0]]
            col_map = {}
            for idx, h in enumerate(headers):
                if h:
                    col_map[h] = idx

            col_code = col_map.get('종목코드')
            col_name = col_map.get('회사명')

            if col_code is None or col_name is None:
                continue

            for row in rows[1:]:
                if len(row) <= max(col_code, col_name):
                    continue

                raw_code = row[col_code].strip()
                company_name = row[col_name].strip()

                if not company_name:
                    continue

                if raw_code and raw_code != '[null]':
                    normalized = re.sub(r'[^\d]', '', raw_code)
                    if normalized:
                        stock_code = normalized.zfill(6)

                        if company_name not in self.company_name_to_code:
                            self.company_name_to_code[company_name] = stock_code

                        if stock_code not in self.code_to_company_name:
                            self.code_to_company_name[stock_code] = company_name

        print(f"Mapped {len(self.company_name_to_code)} companies")

    def process_file(self, filepath, filename, allow_separate=False):
        """Process a single CSV file for EPS data"""
        parts = filename.split('_')
        year = int(parts[0])
        report_type = parts[1]

        # Skip separate statements unless explicitly allowed
        is_consolidated = '연결' in filename
        if not is_consolidated and not allow_separate:
            return

        if '포괄손익계산서' not in filename and '손익계산서' not in filename: return
        if '현금흐름표' in filename or '재무상태표' in filename or '자본변동표' in filename: return

        print(f"Processing {filename}...")

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

        if not rows:
            print(f"Failed to read {filename}")
            return

        headers = [clean_header(h) for h in rows[0]]

        col_map = {}
        for idx, h in enumerate(headers):
            if h:
                col_map[h] = idx

        def get_idx(candidates):
            for c in candidates:
                if c in col_map: return col_map[c]
            return None

        col_code = get_idx(['종목코드'])
        col_name = get_idx(['회사명'])
        col_sector = get_idx(['업종명', '업종'])
        col_item_code = get_idx(['항목코드'])
        col_item_name = get_idx(['항목명'])

        if col_code is None or col_item_code is None:
            print(f"  Missing essential columns in {filename}")
            return

        target_periods = []

        if '1분기보고서' in report_type:
            target_periods.append(('1Q', ['당기1분기3개월', '당기1분기', '당기']))
        elif '반기보고서' in report_type:
            target_periods.append(('2Q', ['당기반기3개월', '당기2분기3개월', '당기2분기']))
        elif '3분기보고서' in report_type:
            target_periods.append(('3Q', ['당기3분기3개월']))
            target_periods.append(('3Q_Acc', ['당기3분기누적']))
        elif '사업보고서' in report_type:
            target_periods.append(('Annual_Current', ['당기', '당기사업년도']))
            target_periods.append(('Annual_Previous_From_Next', ['전기', '전기사업년도']))

        for row in rows[1:]:
            if len(row) < max(col_map.values()) + 1: continue

            company_name = row[col_name].strip() if col_name is not None else None
            raw_code = row[col_code].strip() if col_code is not None else None

            # Get stock code
            if not raw_code or raw_code == '[null]' or re.sub(r'[^\d]', '', raw_code) == '':
                row_code = self.company_name_to_code.get(company_name)
                if not row_code:
                    row_code = normalize_code(raw_code, company_name)
            else:
                row_code = normalize_code(raw_code, company_name)

            if not row_code: continue

            # Get or update metadata
            if row_code not in self.meta:
                company_sector = row[col_sector].strip() if col_sector is not None else None
                self.meta[row_code] = {
                    'name': row[col_name].strip(),
                    'sector': company_sector,
                    'statement_type': '별도' if not is_consolidated else '연결'
                }

            # Skip financial and insurance companies
            company_sector = self.meta[row_code].get('sector')
            if is_financial_sector(company_sector):
                continue

            item_code = row[col_item_code].strip()
            item_name = row[col_item_name].strip()
            clean_item_name = clean_header(item_name)

            # Check if this is EPS metric
            metric_type = None
            for m_key, m_def in EPS_METRICS.items():
                # First check if should be excluded
                if should_exclude_metric(item_code, item_name, m_def):
                    continue

                # Check if matches by code or standard names
                if matches_metric_code(item_code, m_def) or any(n in clean_item_name for n in m_def['names']):
                    metric_type = m_key
                    break

            if not metric_type: continue

            # Extract Values for targets
            for period_key, allowed_cols in target_periods:
                col_idx = get_idx(allowed_cols)
                if col_idx is not None:
                    val = parse_value(row[col_idx])
                    if val is not None:
                        target_year = year
                        storage_key = period_key

                        # For 사업보고서: 파일명의 year = 결산연도 = 당기 연도
                        if period_key == 'Annual_Current':
                            target_year = year
                        elif period_key == 'Annual_Previous_From_Next':
                            target_year = year - 1
                            storage_key = 'Annual_Previous'

                        self.data[row_code][target_year][f'_meta_{metric_type}_name'] = item_name
                        self.data[row_code][target_year][f'_meta_{metric_type}_code'] = item_code

                        if metric_type not in self.data[row_code][target_year][storage_key]:
                            self.data[row_code][target_year][storage_key][metric_type] = val

    def compile_final_data(self):
        """Compile final EPS data into output format"""
        output = {}

        sorted_codes = sorted(self.data.keys())

        for code in sorted_codes:
            company_years = sorted(self.data[code].keys())
            history = []

            company_meta = self.meta.get(code, {'name': 'Unknown', 'sector': 'Unknown'})

            for y in company_years:
                y_data = self.data[code][y]

                for q in ['1Q', '2Q', '3Q']:
                    if q in y_data:
                        rec = {
                            'year': y,
                            'quarter': q,
                            'eps': y_data[q].get('eps')
                        }

                        meta_name_key = '_meta_eps_name'
                        meta_code_key = '_meta_eps_code'
                        if meta_name_key in y_data:
                            rec['eps_ifrs_code'] = y_data[meta_code_key]
                            rec['eps_korean_name'] = y_data[meta_name_key]

                        if rec['eps'] is not None:
                            history.append(rec)

                # Calculate Q4 EPS
                annual_total = y_data.get('Annual_Previous')
                if not annual_total:
                    annual_total = y_data.get('Annual_Current')

                q3_acc = y_data.get('3Q_Acc')

                if annual_total and q3_acc:
                    q4_rec = {
                        'year': y,
                        'quarter': '4Q',
                        'eps': None
                    }

                    val_ann = annual_total.get('eps')
                    val_q3 = q3_acc.get('eps')
                    if val_ann is not None and val_q3 is not None:
                        q4_rec['eps'] = val_ann - val_q3

                    meta_name_key = '_meta_eps_name'
                    meta_code_key = '_meta_eps_code'
                    if meta_name_key in y_data:
                        q4_rec['eps_ifrs_code'] = y_data[meta_code_key]
                        q4_rec['eps_korean_name'] = y_data[meta_name_key]

                    if q4_rec['eps'] is not None:
                        history.append(q4_rec)

            if history:
                 output[code] = {
                     'name': company_meta['name'],
                     'sector': company_meta['sector'],
                     'statement_type': company_meta.get('statement_type', '연결'),
                     'history': history
                 }

        return output

def main():
    parser = EPSParser()

    files = sorted(os.listdir(SOURCE_DIR))

    # Build company name to code mapping
    parser.build_company_mapping(files)

    # PASS 1: Process consolidated statements (연결)
    print("\n=== Pass 1: Processing Consolidated Statements (연결) ===")
    for f in files:
        if f.endswith('.csv'):
            parser.process_file(os.path.join(SOURCE_DIR, f), f, allow_separate=False)

    # PASS 2: Process separate statements (별도) for all companies
    print("\n=== Pass 2: Processing Separate Statements (별도) ===")
    for f in files:
        if f.endswith('.csv'):
            parser.process_file(os.path.join(SOURCE_DIR, f), f, allow_separate=True)

    final_data = parser.compile_final_data()

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)

    print(f"\nDone. Processed EPS data for {len(final_data)} companies.")

    # Show sample data
    print("\n=== Sample EPS Data ===")
    sample_codes = list(final_data.keys())[:3]
    for code in sample_codes:
        company = final_data[code]
        print(f"\n[{code}] {company['name']} ({company['statement_type']})")
        recent_data = company['history'][-4:] if len(company['history']) >= 4 else company['history']
        for rec in recent_data:
            print(f"  {rec['year']} {rec['quarter']}: {rec['eps']:.2f}원")

if __name__ == '__main__':
    main()
