import os
import json
import re
import collections
import csv

# CONFIGURATION
SOURCE_DIR = "csv_output"
OUTPUT_FILE = "financial_data.json"

# [수정] 분석 대상 연도 설정 (유지보수를 위해 상수로 분리)
START_YEAR = 2020
END_YEAR = 2024  # 2024년까지 데이터 확인

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

# [수정] 아래 클래스 로직은 원본 유지하되, 하단부 find_companies_with_missing_quarters 함수 내 연도 범위만 상수로 교체됨

class FinancialParser:
    def __init__(self):
        self.data = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(dict)))
        self.meta = {}
        self.companies_with_ifrs_revenue_by_year = collections.defaultdict(set)  # Track company-year pairs with IFRS codes
        self.fallback_revenue_candidates = collections.defaultdict(lambda: collections.defaultdict(list))  # Track multiple matches
        self.current_file = None  # Track current file being processed
        self.company_name_to_code = {}  # Map company name to stock code (from latest files)
        self.code_to_company_name = {}  # Map stock code to company name (from latest files)
        self.companies_with_consolidated_data = set()  # Track companies that have data from 연결 (consolidated) files

    def build_company_mapping(self, files):
        """Build company name to code mapping from all files to catch name changes"""
        print("\nBuilding company name to code mapping from all files...")

        # Sort files by year descending to process latest first
        sorted_files = sorted([f for f in files if f.endswith('.csv')], reverse=True)

        for filename in sorted_files:  # Process all files to catch historical name changes
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
                        # This catches company name changes (e.g., 포스코 -> POSCO홀딩스)
                        if company_name not in self.company_name_to_code:
                            self.company_name_to_code[company_name] = stock_code

                        # For code_to_company_name, always use latest name (overwrite with newest data)
                        # Since files are sorted by year descending, first encountered = latest
                        self.code_to_company_name[stock_code] = company_name

        print(f"Mapped {len(self.company_name_to_code)} companies")

        # Save mapping to JSON file for reference
        mapping_data = {
            'company_name_to_code': self.company_name_to_code,
            'code_to_company_name': self.code_to_company_name
        }
        with open('company_code_mapping.json', 'w', encoding='utf-8') as f:
            json.dump(mapping_data, f, ensure_ascii=False, indent=2)
        print("Saved mapping to company_code_mapping.json")

    def process_file(self, filepath, filename, allow_separate=False):
        self.current_file = filename  # Track current file
        parts = filename.split('_')
        year = int(parts[0])
        report_type = parts[1]

        # Skip separate statements unless explicitly allowed
        is_consolidated = '연결' in filename
        if not is_consolidated and not allow_separate:
            return

        # Track if this is a consolidated file for later filtering
        processing_consolidated = is_consolidated

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

            if not row_code: continue

            # Track companies with consolidated data (from 연결 files)
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
                    # Track if this is revenue with IFRS code (per year)
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

                            # Store as potential fallback candidate with file info
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
                        # 당기 -> target_year = year (파일명 연도)
                        # 전기 -> target_year = year - 1
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
                            'revenue': y_data[q].get('revenue'),
                            'op_profit': y_data[q].get('op_profit'),
                            'net_income': y_data[q].get('net_income')
                        }
                        for metric in ['revenue', 'op_profit', 'net_income']:
                            meta_name_key = f'_meta_{metric}_name'
                            meta_code_key = f'_meta_{metric}_code'
                            if meta_name_key in y_data:
                                rec[f'{metric}_ifrs_code'] = y_data[meta_code_key]
                                rec[f'{metric}_korean_name'] = y_data[meta_name_key]
                            
                        if rec['revenue'] or rec['op_profit']:
                            history.append(rec)

                # Calculate Q4
                # Prefer Annual_Current (from same year's annual report) over Annual_Previous (from next year's report)
                # Annual_Previous can be incorrect due to accounting standard changes or restatements
                annual_total = y_data.get('Annual_Current')
                if not annual_total:
                    annual_total = y_data.get('Annual_Previous')

                q3_acc = y_data.get('3Q_Acc')
                
                if annual_total and q3_acc:
                    q4_rec = {
                        'year': y,
                        'quarter': '4Q',
                        'revenue': None,
                        'op_profit': None,
                        'net_income': None
                    }
                    
                    for m in ['revenue', 'op_profit', 'net_income']:
                        val_ann = annual_total.get(m)
                        val_q3 = q3_acc.get(m)
                        if val_ann is not None and val_q3 is not None:
                            q4_rec[m] = val_ann - val_q3
                    
                    for metric in ['revenue', 'op_profit', 'net_income']:
                        meta_name_key = f'_meta_{metric}_name'
                        meta_code_key = f'_meta_{metric}_code'
                        if meta_name_key in y_data:
                            q4_rec[f'{metric}_ifrs_code'] = y_data[meta_code_key]
                            q4_rec[f'{metric}_korean_name'] = y_data[meta_name_key]

                    if q4_rec['revenue'] is not None and q4_rec['revenue'] < 0:
                        continue
                    
                    if q4_rec['revenue'] is not None or q4_rec['op_profit'] is not None:
                        history.append(q4_rec)

            if history:
                 output[code] = {
                     'name': company_meta['name'],
                     'sector': company_meta['sector'],
                     'statement_type': company_meta.get('statement_type', '연결'),
                     'history': history
                 }

        return output

    def process_fallback_revenue(self):
        """Process fallback Korean name revenue for companies without IFRS codes

        Priority:
        1. Exact match '매출액' (no additional words)
        2. Exact match '영업수익' (no additional words)
        3. If multiple '영업수익', choose one with '매출' in name
        4. Otherwise, report for manual selection
        """
        multiple_matches = {}

        for row_code, year_candidates in self.fallback_revenue_candidates.items():
            for year, candidates in year_candidates.items():
                # Don't skip entire year - check per-quarter if revenue already exists

                # Don't merge! Process each candidate separately to handle different row_data from different files
                # Just deduplicate to remove exact duplicates
                seen = set()
                deduped_candidates = []
                for cand in candidates:
                    # Create a unique key based on item_code and filename
                    unique_key = (cand['item_code'], cand['filename'])
                    if unique_key not in seen:
                        seen.add(unique_key)
                        deduped_candidates.append(cand)

                # Check if all candidates have the same clean_name
                # If so, they're the same metric from different quarterly reports - process all of them
                if len(deduped_candidates) > 1:
                    unique_names = set(c['clean_name'] for c in deduped_candidates)
                    if len(unique_names) == 1:
                        # All same name - process all candidates to cover all quarters
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
                            # Use the selected candidate
                            candidates_to_process = [selected]
                        else:
                            # Multiple matches found - store for reporting
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
                                target_year = year
                                storage_key = period_key

                                # For 사업보고서: 파일명의 year = 결산연도 = 당기 연도
                                # 당기 -> target_year = year (파일명 연도)
                                # 전기 -> target_year = year - 1
                                if period_key == 'Annual_Current':
                                    target_year = year
                                elif period_key == 'Annual_Previous_From_Next':
                                    target_year = year - 1
                                    storage_key = 'Annual_Previous'

                                self.data[row_code][target_year][f'_meta_revenue_name'] = item_name
                                self.data[row_code][target_year][f'_meta_revenue_code'] = item_code

                                # Only set if revenue doesn't exist or is None
                                if storage_key not in self.data[row_code][target_year]:
                                    self.data[row_code][target_year][storage_key] = {}

                                if self.data[row_code][target_year][storage_key].get('revenue') is None:
                                    self.data[row_code][target_year][storage_key]['revenue'] = val

        # Report multiple matches with file info and amounts
        if multiple_matches:
            print("\n=== WARNING: Multiple fallback revenue matches found ===")
            for key, candidates in multiple_matches.items():
                print(f"\n{key}:")
                for i, cand in enumerate(candidates, 1):
                    # Get sample amounts from the candidate
                    amounts_str = []
                    row = cand['row_data']
                    col_idx_map = cand['col_idx_map']
                    for period_key, col_idx in col_idx_map.items():
                        if col_idx is not None and col_idx < len(row):
                            val = parse_value(row[col_idx])
                            if val is not None:
                                # Format period name
                                period_name = period_key.replace('_Acc', '누적').replace('Annual_Current', '당기연간').replace('Annual_Previous', '전기연간')
                                amounts_str.append(f"{period_name}: {val:,}원")

                    amounts_display = ", ".join(amounts_str) if amounts_str else "금액 없음"
                    filename = cand.get('filename', '알 수 없음')

                    print(f"  {i}. Name: {cand['item_name']}")
                    print(f"     Code: {cand['item_code']}")
                    print(f"     File: {filename}")
                    print(f"     Amounts: {amounts_display}")
            print("\n==========================================================\n")

        return multiple_matches

    def find_companies_with_missing_quarters(self):
        """Identify companies missing quarterly data (2020-2024)

        IMPORTANT: Only return companies that:
        1. Have missing data AND
        2. Do NOT have any consolidated (연결) data

        This prevents overwriting consolidated data with separate (별도) data.
        """
        missing_companies = set()

        for code in self.meta.keys():
            # CRITICAL: Skip companies that have consolidated data
            # We don't want to overwrite 연결 data with 별도 data
            if code in self.companies_with_consolidated_data:
                continue

            # [수정] 상단의 설정값 사용
            for year in range(START_YEAR, END_YEAR + 1):
                year_data = self.data.get(code, {}).get(year, {})

                # Check each quarter
                for quarter in ['1Q', '2Q', '3Q']:
                    if quarter not in year_data or not year_data[quarter].get('revenue'):
                        missing_companies.add(code)
                        break

                # Check 4Q calculation requirements
                has_annual = 'Annual_Current' in year_data or 'Annual_Previous' in year_data
                has_3q_acc = '3Q_Acc' in year_data
                if not (has_annual and has_3q_acc):
                    missing_companies.add(code)

        return missing_companies

    def process_file_for_separate(self, filepath, filename, target_companies):
        """Process separate statements (별도) only for target companies"""
        # Only process files WITHOUT '연결' (separate statements)
        if '연결' in filename:
            return

        # Check if it's an income statement
        if '포괄손익계산서' not in filename and '손익계산서' not in filename:
            return
        if '현금흐름표' in filename or '재무상태표' in filename or '자본변동표' in filename:
            return

        print(f"Processing (별도): {filename}...")

        parts = filename.split('_')
        year = int(parts[0])
        report_type = parts[1]

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

            if not row_code: continue

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

            # Determine Metric Type with exclusion check
            metric_type = None
            for m_key, m_def in METRICS.items():
                # First check if should be excluded
                if should_exclude_metric(item_code, item_name, m_def):
                    continue

                # Check if matches by code or standard names
                if matches_metric_code(item_code, m_def) or any(n in clean_item_name for n in m_def['names']):
                    metric_type = m_key
                    # Track if this is revenue with IFRS code (per year)
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

                            # Store as potential fallback candidate with file info
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
                    continue  # Will process in second pass

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
                        # 당기 -> target_year = year (파일명 연도)
                        # 전기 -> target_year = year - 1
                        if period_key == 'Annual_Current':
                            target_year = year
                        elif period_key == 'Annual_Previous_From_Next':
                            target_year = year - 1
                            storage_key = 'Annual_Previous'

                        self.data[row_code][target_year][f'_meta_{metric_type}_name'] = item_name
                        self.data[row_code][target_year][f'_meta_{metric_type}_code'] = item_code

                        if metric_type not in self.data[row_code][target_year][storage_key]:
                            self.data[row_code][target_year][storage_key][metric_type] = val

def main():
    parser = FinancialParser()

    files = sorted(os.listdir(SOURCE_DIR))

    # Build company name to code mapping from latest files first
    parser.build_company_mapping(files)

    # PASS 1: Process consolidated statements (연결)
    print("\n=== Pass 1: Processing Consolidated Statements (연결) ===")
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
    missing_companies = parser.find_companies_with_missing_quarters()
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