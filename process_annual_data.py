import os
import json
import re
import collections
import csv

# CONFIGURATION
SOURCE_DIR = "csv_output"
OUTPUT_FILE = "financial_data_annual.json"

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

# METRIC IDENTIFIERS
METRICS = {
    'revenue': {
        # ONLY these exact codes are allowed
        'codes': [
            'ifrs_Revenue',
            'ifrs-full_Revenue'
        ],
        'names': [],
        # Fallback Korean names (only used when IFRS codes not available for a company)
        # Priority order: exact match '매출액' > '영업수익' > '매출' > '수익'
        'fallback_names': [
            '매출액',
            '영업수익',
            '매출',
            '수익'
        ],
        # Exclude patterns in Korean names
        'fallback_exclude_patterns': [
            '이자',
            '금융',
            '임대',
            '광고',
            '채권',
            '기타',
            '배당',
            '수수료',
            '시험',
            '공사',
            '가공',
            '상품',
            '원가',
            '외',
            '이지',
            '법인'
        ],
        # EXCLUDED codes and names that should NOT be treated as revenue
        'exclude_codes': [
            'RevenueFrom',  # Excludes RevenueFromDividends, RevenueFromInterest, etc.
            'OtherRevenue',  # 기타수익
            'InterestRevenue',
            'InterestIncome',
            'InterestRevenueExpense',
            'InterestRevenueCalculatedUsingEffectiveInterestMethod',
            'InterestIncomeFinanceIncome',
            'TotalOperatingRevenue',  # 영업수익 (금융업 용어)
            'DividendRevenue',
            'Dividends',
            'dart_',  # Exclude all dart_ prefixed codes
        ],
        'exclude_names': []
    },
    'op_profit': {
        'codes': [
            'dart_OperatingIncomeLoss',
            'ifrs_OperatingIncomeLoss',
            'ifrs-full_ProfitLossFromOperatingActivities'
        ],
        'names': ['영업이익', '영업이익(손실)', '영업손익'],
        'exclude_codes': [],
        'exclude_names': []
    },
    'net_income': {
        'codes': [
            'ifrs_ProfitLoss',
            'ifrs-full_ProfitLoss',
            'ifrs-full_ProfitLossAttributableToOwnersOfParent',
            'ifrs_ProfitLossAttributableToOwnersOfParent'
        ],
        'names': ['당기순이익', '당기순손익', '지배기업소유주순이익', '당기순이익(손실)'],
        'exclude_codes': [],
        'exclude_names': []
    }
}

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

def normalize_code(code, company_name=None):
    """Normalize stock code, with fallback to company name mapping for missing codes"""
    if not code or code == '[null]' or re.sub(r'[^\d]', '', code) == '':
        # Special handling for companies with missing codes
        if company_name:
            # Known mappings for companies with missing stock codes in DART data
            COMPANY_CODE_MAP = {
                '포스코': '005490',
                'POSCO': '005490',
            }
            return COMPANY_CODE_MAP.get(company_name.strip())
        return None

    # Extract only digits
    digits_only = re.sub(r'[^\d]', '', code)

    # Check if original code contains non-digit characters (excluding brackets and spaces)
    # If the code has letters (like 0008Z0), reject it as invalid
    cleaned_code = code.replace('[', '').replace(']', '').replace(' ', '').strip()
    if not cleaned_code.isdigit():
        # Invalid stock code (contains letters)
        return None

    return digits_only.zfill(6)

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
    """Check if item_code matches metric definition codes with exact matching"""
    allowed_codes = metric_def.get('codes', [])

    for code in allowed_codes:
        # Exact match for ifrs_Revenue and ifrs-full_Revenue
        if code in ['ifrs_Revenue', 'ifrs-full_Revenue']:
            if item_code == code:
                return True
        # Substring match for other codes
        elif code in item_code:
            return True

    return False

class AnnualFinancialParser:
    def __init__(self):
        self.data = collections.defaultdict(lambda: collections.defaultdict(dict))
        self.meta = {}
        self.companies_with_ifrs_revenue_by_year = collections.defaultdict(set)
        self.fallback_revenue_candidates = collections.defaultdict(lambda: collections.defaultdict(list))
        self.current_file = None
        self.company_name_to_code = {}
        self.code_to_company_name = {}
        self.companies_with_consolidated_data = set()

    def build_company_mapping(self, files):
        """Build company name to code mapping from all files to catch name changes"""
        print("\nBuilding company name to code mapping from all files...")

        # Sort files by year descending to process latest first
        sorted_files = sorted([f for f in files if f.endswith('.csv')], reverse=True)

        for filename in sorted_files:
            filepath = os.path.join(SOURCE_DIR, filename)

            # Read CSV file
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

            # Extract company code and name mappings
            for row in rows[1:]:
                if len(row) <= max(col_code, col_name):
                    continue

                raw_code = row[col_code].strip()
                company_name = row[col_name].strip()

                if not company_name:
                    continue

                # Skip [null] codes, we want valid codes only
                if raw_code and raw_code != '[null]':
                    normalized = re.sub(r'[^\d]', '', raw_code)
                    if normalized:
                        stock_code = normalized.zfill(6)

                        # Store all historical names for the same code
                        if company_name not in self.company_name_to_code:
                            self.company_name_to_code[company_name] = stock_code

                        # For code_to_company_name, always use latest name
                        self.code_to_company_name[stock_code] = company_name

        print(f"Mapped {len(self.company_name_to_code)} companies")

        # Save mapping to JSON file for reference
        mapping_data = {
            'company_name_to_code': self.company_name_to_code,
            'code_to_company_name': self.code_to_company_name
        }
        with open('company_code_mapping_annual.json', 'w', encoding='utf-8') as f:
            json.dump(mapping_data, f, ensure_ascii=False, indent=2)
        print("Saved mapping to company_code_mapping_annual.json")

    def process_file(self, filepath, filename, allow_separate=False):
        """Process only 사업보고서 (Annual Report) files"""
        self.current_file = filename
        parts = filename.split('_')

        # Skip if not 사업보고서
        if len(parts) < 2:
            return

        year = int(parts[0])
        report_type = parts[1]

        # ONLY process 사업보고서 (Annual Reports)
        if '사업보고서' not in report_type:
            return

        # Skip separate statements unless explicitly allowed
        is_consolidated = '연결' in filename
        if not is_consolidated and not allow_separate:
            return

        # Track if this is a consolidated file
        processing_consolidated = is_consolidated

        if '포괄손익계산서' not in filename and '손익계산서' not in filename:
            return
        if '현금흐름표' in filename or '재무상태표' in filename or '자본변동표' in filename:
            return

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

        # For 사업보고서: only extract annual cumulative data
        # 당기 = current fiscal year (year in filename)
        # 전기 = previous fiscal year (year - 1)
        target_periods = [
            ('Annual', ['당기', '당기사업년도']),
            ('Previous', ['전기', '전기사업년도'])
        ]

        for row in rows[1:]:
            if len(row) < max(col_map.values()) + 1:
                continue

            # Try to normalize code with company name fallback
            company_name = row[col_name].strip() if col_name is not None else None
            raw_code = row[col_code].strip() if col_code is not None else None

            # First try to get from mapping if code is null
            if not raw_code or raw_code == '[null]' or re.sub(r'[^\d]', '', raw_code) == '':
                row_code = self.company_name_to_code.get(company_name)
                if not row_code:
                    row_code = normalize_code(raw_code, company_name)
            else:
                row_code = normalize_code(raw_code, company_name)

            if not row_code:
                continue

            # Track companies with consolidated data
            if processing_consolidated:
                self.companies_with_consolidated_data.add(row_code)

            # Get or update metadata
            if row_code not in self.meta:
                company_sector = row[col_sector].strip() if col_sector is not None else None
                self.meta[row_code] = {
                    'name': row[col_name].strip(),
                    'sector': company_sector
                }

            # Skip financial and insurance companies
            company_sector = self.meta[row_code].get('sector')
            if is_financial_sector(company_sector):
                continue

            item_code = row[col_item_code].strip()
            item_name = row[col_item_name].strip()
            clean_item_name = clean_header(item_name)

            # Skip Cost of Sales and Gross Profit
            if 'CostOfSales' in item_code or '매출원가' in clean_item_name:
                continue
            if 'GrossProfit' in item_code or '매출총이익' in clean_item_name or '매출총손실' in clean_item_name:
                continue

            # Determine Metric Type with exclusion check
            metric_type = None
            for m_key, m_def in METRICS.items():
                # First check if should be excluded
                if should_exclude_metric(item_code, item_name, m_def):
                    continue

                # Check if matches by code or standard names
                if matches_metric_code(item_code, m_def) or any(n in clean_item_name for n in m_def['names']):
                    metric_type = m_key
                    # Track if this is revenue with IFRS code
                    if m_key == 'revenue' and (item_code == 'ifrs_Revenue' or item_code == 'ifrs-full_Revenue'):
                        self.companies_with_ifrs_revenue_by_year[row_code].add(year)
                    break

            # If not matched and this is potentially a fallback revenue candidate
            if not metric_type and 'fallback_names' in METRICS['revenue']:
                fallback_names = METRICS['revenue']['fallback_names']
                fallback_exclude = METRICS['revenue'].get('fallback_exclude_patterns', [])

                # Check if Korean name matches fallback patterns
                matched_fallback = False
                for fb_name in fallback_names:
                    if fb_name in clean_item_name:
                        # Check if any exclude pattern exists in the name
                        has_exclude = any(exc in clean_item_name for exc in fallback_exclude)
                        if not has_exclude:
                            col_idx_map = {pk: get_idx(cols) for pk, cols in target_periods}

                            # Store as potential fallback candidate
                            self.fallback_revenue_candidates[row_code][year].append({
                                'item_code': item_code,
                                'item_name': item_name,
                                'clean_name': clean_item_name,
                                'row_data': row,
                                'col_idx_map': col_idx_map,
                                'filename': self.current_file
                            })
                            matched_fallback = True
                            break

                if matched_fallback:
                    continue  # Will process in second pass

            if not metric_type:
                continue

            # Extract Values for targets
            for period_key, allowed_cols in target_periods:
                col_idx = get_idx(allowed_cols)
                if col_idx is not None:
                    val = parse_value(row[col_idx])
                    if val is not None:
                        # For 사업보고서: 파일명의 year = 결산연도 = 당기 연도
                        # 당기 -> target_year = year (파일명 연도)
                        # 전기 -> target_year = year - 1
                        if period_key == 'Annual':
                            target_year = year
                        elif period_key == 'Previous':
                            target_year = year - 1
                        else:
                            continue

                        # Store metadata
                        if f'_meta_{metric_type}_name' not in self.data[row_code][target_year]:
                            self.data[row_code][target_year][f'_meta_{metric_type}_name'] = item_name
                        if f'_meta_{metric_type}_code' not in self.data[row_code][target_year]:
                            self.data[row_code][target_year][f'_meta_{metric_type}_code'] = item_code

                        # Store value
                        if metric_type not in self.data[row_code][target_year]:
                            self.data[row_code][target_year][metric_type] = val

    def process_fallback_revenue(self):
        """Process fallback Korean name revenue for companies without IFRS codes"""
        multiple_matches = {}

        for row_code, year_candidates in self.fallback_revenue_candidates.items():
            for year, candidates in year_candidates.items():
                # Deduplicate candidates
                seen = set()
                deduped_candidates = []
                for cand in candidates:
                    unique_key = (cand['item_code'], cand['filename'])
                    if unique_key not in seen:
                        seen.add(unique_key)
                        deduped_candidates.append(cand)

                # Check if all candidates have the same clean_name
                if len(deduped_candidates) > 1:
                    unique_names = set(c['clean_name'] for c in deduped_candidates)
                    if len(unique_names) == 1:
                        # All same name - process all candidates
                        candidates_to_process = deduped_candidates
                    else:
                        # Different names - apply priority selection
                        selected = None

                        # Priority 1: Exact match '매출액'
                        exact_maechul = [c for c in deduped_candidates if c['clean_name'] == '매출액']
                        if exact_maechul:
                            selected = exact_maechul[0]

                        # Priority 2: Exact match '영업수익'
                        if not selected:
                            exact_youngsup = [c for c in deduped_candidates if c['clean_name'] == '영업수익']
                            if len(exact_youngsup) == 1:
                                selected = exact_youngsup[0]
                            elif len(exact_youngsup) > 1:
                                # Priority 3: '영업수익' with '매출' in name
                                youngsup_with_maechul = [c for c in exact_youngsup if '매출' in c['clean_name']]
                                if len(youngsup_with_maechul) == 1:
                                    selected = youngsup_with_maechul[0]

                        if selected:
                            candidates_to_process = [selected]
                        else:
                            # Multiple matches found
                            company_name = self.meta.get(row_code, {}).get('name', 'Unknown')
                            key = f"{row_code}_{company_name}_{year}"
                            multiple_matches[key] = deduped_candidates
                            continue
                else:
                    candidates_to_process = deduped_candidates

                # Process all selected candidates
                for candidate in candidates_to_process:
                    item_code = candidate['item_code']
                    item_name = candidate['item_name']
                    row = candidate['row_data']
                    col_idx_map = candidate['col_idx_map']

                    # Process this as revenue
                    for period_key, col_idx in col_idx_map.items():
                        if col_idx is not None and col_idx < len(row):
                            val = parse_value(row[col_idx])

                            if val is not None:
                                # Determine target year
                                if period_key == 'Annual':
                                    target_year = year
                                elif period_key == 'Previous':
                                    target_year = year - 1
                                else:
                                    continue

                                # Store metadata
                                if '_meta_revenue_name' not in self.data[row_code][target_year]:
                                    self.data[row_code][target_year]['_meta_revenue_name'] = item_name
                                if '_meta_revenue_code' not in self.data[row_code][target_year]:
                                    self.data[row_code][target_year]['_meta_revenue_code'] = item_code

                                # Only set if revenue doesn't exist
                                if 'revenue' not in self.data[row_code][target_year]:
                                    self.data[row_code][target_year]['revenue'] = val

        # Report multiple matches
        if multiple_matches:
            print("\n=== WARNING: Multiple fallback revenue matches found ===")
            for key, candidates in multiple_matches.items():
                print(f"\n{key}:")
                for i, cand in enumerate(candidates, 1):
                    amounts_str = []
                    row = cand['row_data']
                    col_idx_map = cand['col_idx_map']
                    for period_key, col_idx in col_idx_map.items():
                        if col_idx is not None and col_idx < len(row):
                            val = parse_value(row[col_idx])
                            if val is not None:
                                period_name = period_key.replace('Annual', '당기연간').replace('Previous', '전기연간')
                                amounts_str.append(f"{period_name}: {val:,}원")

                    amounts_display = ", ".join(amounts_str) if amounts_str else "금액 없음"
                    filename = cand.get('filename', '알 수 없음')

                    print(f"  {i}. Name: {cand['item_name']}")
                    print(f"     Code: {cand['item_code']}")
                    print(f"     File: {filename}")
                    print(f"     Amounts: {amounts_display}")
            print("\n==========================================================\n")

        return multiple_matches

    def find_companies_with_missing_data(self):
        """Identify companies missing annual data that do NOT have consolidated data"""
        missing_companies = set()

        for code in self.meta.keys():
            # Skip companies that have consolidated data
            if code in self.companies_with_consolidated_data:
                continue

            # Check if company has data for recent years (e.g., 2020-2024)
            for year in range(2020, 2025):
                year_data = self.data.get(code, {}).get(year, {})

                # Check if revenue exists for this year
                if 'revenue' not in year_data or year_data.get('revenue') is None:
                    missing_companies.add(code)
                    break

        return missing_companies

    def process_file_for_separate(self, filepath, filename, target_companies):
        """Process separate statements (별도) only for target companies"""
        # Only process files WITHOUT '연결' (separate statements)
        if '연결' in filename:
            return

        # Check if it's an income statement from 사업보고서
        if '사업보고서' not in filename:
            return
        if '포괄손익계산서' not in filename and '손익계산서' not in filename:
            return
        if '현금흐름표' in filename or '재무상태표' in filename or '자본변동표' in filename:
            return

        print(f"Processing (별도): {filename}...")

        parts = filename.split('_')
        year = int(parts[0])

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

        target_periods = [
            ('Annual', ['당기', '당기사업년도']),
            ('Previous', ['전기', '전기사업년도'])
        ]

        for row in rows[1:]:
            if len(row) < max(col_map.values()) + 1:
                continue

            company_name = row[col_name].strip() if col_name is not None else None
            raw_code = row[col_code].strip() if col_code is not None else None

            if not raw_code or raw_code == '[null]' or re.sub(r'[^\d]', '', raw_code) == '':
                row_code = self.company_name_to_code.get(company_name)
                if not row_code:
                    row_code = normalize_code(raw_code, company_name)
            else:
                row_code = normalize_code(raw_code, company_name)

            if not row_code:
                continue

            # ONLY process if this company is in target_companies
            if row_code not in target_companies:
                continue

            # Get or update metadata
            if row_code not in self.meta:
                company_sector = row[col_sector].strip() if col_sector is not None else None
                self.meta[row_code] = {
                    'name': row[col_name].strip(),
                    'sector': company_sector,
                    'statement_type': '별도'
                }
            elif 'statement_type' not in self.meta[row_code]:
                self.meta[row_code]['statement_type'] = '별도'

            # Skip financial and insurance companies
            company_sector = self.meta[row_code].get('sector')
            if is_financial_sector(company_sector):
                continue

            item_code = row[col_item_code].strip()
            item_name = row[col_item_name].strip()
            clean_item_name = clean_header(item_name)

            # Skip Cost of Sales and Gross Profit
            if 'CostOfSales' in item_code or '매출원가' in clean_item_name:
                continue
            if 'GrossProfit' in item_code or '매출총이익' in clean_item_name or '매출총손실' in clean_item_name:
                continue

            # Determine Metric Type
            metric_type = None
            for m_key, m_def in METRICS.items():
                if should_exclude_metric(item_code, item_name, m_def):
                    continue

                if matches_metric_code(item_code, m_def) or any(n in clean_item_name for n in m_def['names']):
                    metric_type = m_key
                    if m_key == 'revenue' and (item_code == 'ifrs_Revenue' or item_code == 'ifrs-full_Revenue'):
                        self.companies_with_ifrs_revenue_by_year[row_code].add(year)
                    break

            # Fallback revenue handling
            if not metric_type and 'fallback_names' in METRICS['revenue']:
                fallback_names = METRICS['revenue']['fallback_names']
                fallback_exclude = METRICS['revenue'].get('fallback_exclude_patterns', [])

                matched_fallback = False
                for fb_name in fallback_names:
                    if fb_name in clean_item_name:
                        has_exclude = any(exc in clean_item_name for exc in fallback_exclude)
                        if not has_exclude:
                            col_idx_map = {pk: get_idx(cols) for pk, cols in target_periods}

                            self.fallback_revenue_candidates[row_code][year].append({
                                'item_code': item_code,
                                'item_name': item_name,
                                'clean_name': clean_item_name,
                                'row_data': row,
                                'col_idx_map': col_idx_map,
                                'filename': filename
                            })
                            matched_fallback = True
                            break

                if matched_fallback:
                    continue

            if not metric_type:
                continue

            # Extract Values
            for period_key, allowed_cols in target_periods:
                col_idx = get_idx(allowed_cols)
                if col_idx is not None:
                    val = parse_value(row[col_idx])
                    if val is not None:
                        if period_key == 'Annual':
                            target_year = year
                        elif period_key == 'Previous':
                            target_year = year - 1
                        else:
                            continue

                        if f'_meta_{metric_type}_name' not in self.data[row_code][target_year]:
                            self.data[row_code][target_year][f'_meta_{metric_type}_name'] = item_name
                        if f'_meta_{metric_type}_code' not in self.data[row_code][target_year]:
                            self.data[row_code][target_year][f'_meta_{metric_type}_code'] = item_code

                        if metric_type not in self.data[row_code][target_year]:
                            self.data[row_code][target_year][metric_type] = val

    def compile_final_data(self):
        """Compile final annual data"""
        output = {}

        sorted_codes = sorted(self.data.keys())

        for code in sorted_codes:
            company_years = sorted(self.data[code].keys())
            history = []

            company_meta = self.meta.get(code, {'name': 'Unknown', 'sector': 'Unknown'})

            for y in company_years:
                y_data = self.data[code][y]

                rec = {
                    'year': y,
                    'revenue': y_data.get('revenue'),
                    'op_profit': y_data.get('op_profit'),
                    'net_income': y_data.get('net_income')
                }

                # Add metadata
                for metric in ['revenue', 'op_profit', 'net_income']:
                    meta_name_key = f'_meta_{metric}_name'
                    meta_code_key = f'_meta_{metric}_code'
                    if meta_name_key in y_data:
                        rec[f'{metric}_ifrs_code'] = y_data[meta_code_key]
                        rec[f'{metric}_korean_name'] = y_data[meta_name_key]

                # Only add if we have at least revenue or op_profit
                if rec['revenue'] or rec['op_profit']:
                    history.append(rec)

            if history:
                company_name = company_meta['name']

                # HARDCODED FIX: POSCO name correction
                if code == '005490':
                    company_name = 'POSCO홀딩스'

                output[code] = {
                    'name': company_name,
                    'sector': company_meta['sector'],
                    'statement_type': company_meta.get('statement_type', '연결'),
                    'history': history
                }

        return output

def main():
    parser = AnnualFinancialParser()

    files = sorted(os.listdir(SOURCE_DIR))

    # Build company name to code mapping
    parser.build_company_mapping(files)

    # PASS 1: Process consolidated statements (연결) from 사업보고서 only
    print("\n=== Pass 1: Processing Consolidated Statements (연결) from 사업보고서 ===")
    for f in files:
        if f.endswith('.csv'):
            parser.process_file(os.path.join(SOURCE_DIR, f), f, allow_separate=False)

    # Process fallback revenue for companies without IFRS codes (Pass 1)
    print(f"\nProcessing fallback revenue (Pass 1)...")
    total_ifrs_company_years = sum(len(years) for years in parser.companies_with_ifrs_revenue_by_year.values())
    print(f"Company-years with IFRS revenue codes: {total_ifrs_company_years}")
    print(f"Companies with fallback candidates: {len(parser.fallback_revenue_candidates)}")

    multiple_matches = parser.process_fallback_revenue()

    # PASS 2: Process separate statements (별도) for companies with missing data
    print("\n=== Pass 2: Processing Separate Statements (별도) for Missing Companies ===")
    missing_companies = parser.find_companies_with_missing_data()
    print(f"Found {len(missing_companies)} companies with missing data")

    if missing_companies:
        for f in files:
            if f.endswith('.csv'):
                parser.process_file_for_separate(os.path.join(SOURCE_DIR, f), f, missing_companies)

        # Process fallback revenue again for newly added data (Pass 2)
        print(f"\nProcessing fallback revenue (Pass 2)...")
        multiple_matches_pass2 = parser.process_fallback_revenue()

        # Merge both pass results
        if multiple_matches_pass2:
            multiple_matches.update(multiple_matches_pass2)

    final_data = parser.compile_final_data()

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)

    print(f"\nDone. Processed {len(final_data)} companies.")
    if multiple_matches:
        print(f"WARNING: {len(multiple_matches)} company-years have multiple fallback matches (see above)")

if __name__ == '__main__':
    main()
