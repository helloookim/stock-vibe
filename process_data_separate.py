"""
Process 포괄손익계산서 (별도재무제표, non-consolidated) files
Creates a separate JSON file with companies NOT in the consolidated data
"""
import os
import json
import re
import collections

# CONFIGURATION
SOURCE_DIR = "손익계산서"
OUTPUT_FILE = "financial_data_separate.json"
CONSOLIDATED_FILE = "financial_data.json"  # To check for duplicates

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
        'names': [
            '매출액', 
            '매출',
            '수익(매출액)'
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
            'entity_'  # Exclude all entity_ prefixed codes
        ],
        'exclude_names': [
            '이자수익',
            '이자순수익',
            '영업수익',  # 금융업 매출 용어
            '보험수익',
            '보험료수익',
            '순영업수익',
            '배당금수익',
            '배당수익',
            '기타수익',
            '기타의수익'
        ]
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

def normalize_code(code):
    if not code: return None
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

class FinancialParser:
    def __init__(self, excluded_codes):
        self.data = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(dict)))
        self.meta = {}
        self.excluded_codes = excluded_codes  # Companies already in consolidated data

    def process_file(self, filepath, filename):
        parts = filename.split('_')
        year = int(parts[0])
        report_type = parts[1]
        
        # Only process non-consolidated (without _연결)
        if '_연결' in filename: return
        if '포괄손익계산서' not in filename and '손익계산서' not in filename: return
        if '현금흐름표' in filename or '재무상태표' in filename or '자본변동표' in filename: return

        print(f"Processing {filename}...")

        encoding_candidates = ['cp949', 'utf-8', 'euc-kr']
        lines = []
        
        for enc in encoding_candidates:
            try:
                with open(filepath, 'r', encoding=enc) as f:
                    lines = f.readlines()
                break
            except UnicodeDecodeError:
                continue
        
        if not lines:
            print(f"Failed to read {filename}")
            return

        headers = [clean_header(h) for h in lines[0].split('\t')]
        
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

        for line in lines[1:]:
            parts = line.split('\t')
            if len(parts) < max(col_map.values()) + 1: continue

            row_code = normalize_code(parts[col_code])
            if not row_code: continue
            
            # Skip companies that are already in consolidated data
            if row_code in self.excluded_codes:
                continue

            # Get or update metadata
            if row_code not in self.meta:
                company_sector = parts[col_sector].strip() if col_sector is not None else None
                self.meta[row_code] = {
                    'name': parts[col_name].strip(),
                    'sector': company_sector
                }
            
            # Skip financial and insurance companies
            company_sector = self.meta[row_code].get('sector')
            if is_financial_sector(company_sector):
                continue

            item_code = parts[col_item_code].strip()
            item_name = parts[col_item_name].strip()
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
                
                # Then check if matches (with exact matching for Revenue codes)
                if matches_metric_code(item_code, m_def) or any(n in clean_item_name for n in m_def['names']):
                    metric_type = m_key
                    break
            
            if not metric_type: continue

            for period_key, allowed_cols in target_periods:
                col_idx = get_idx(allowed_cols)
                if col_idx is not None:
                    val = parse_value(parts[col_idx])
                    if val is not None:
                        target_year = year
                        if period_key == 'Annual_Previous_From_Next':
                            target_year = year - 1
                            storage_key = 'Annual_Previous'
                        else:
                            storage_key = period_key
                        
                        self.data[row_code][target_year][f'_meta_{metric_type}_name'] = item_name
                        self.data[row_code][target_year][f'_meta_{metric_type}_code'] = item_code
                        
                        # Only store first match (don't overwrite)
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
                annual_total = y_data.get('Annual_Previous')
                if not annual_total:
                    annual_total = y_data.get('Annual_Current')
                
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

                    # Skip invalid Q4 (negative revenue)
                    if q4_rec['revenue'] is not None and q4_rec['revenue'] < 0:
                        continue
                    
                    if q4_rec['revenue'] is not None or q4_rec['op_profit'] is not None:
                        history.append(q4_rec)

            if history:
                 output[code] = {
                     'name': company_meta['name'],
                     'sector': company_meta['sector'],
                     'history': history 
                 }
        
        return output

def main():
    # Load existing consolidated data to get list of companies to exclude
    excluded_codes = set()
    if os.path.exists(CONSOLIDATED_FILE):
        with open(CONSOLIDATED_FILE, 'r', encoding='utf-8') as f:
            consolidated_data = json.load(f)
            excluded_codes = set(consolidated_data.keys())
        print(f"Loaded {len(excluded_codes)} companies from consolidated data to exclude")
    
    parser = FinancialParser(excluded_codes)
    
    files = sorted(os.listdir(SOURCE_DIR))
    
    for f in files:
        if f.endswith('.txt'):
            parser.process_file(os.path.join(SOURCE_DIR, f), f)
            
    final_data = parser.compile_final_data()
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
        
    print(f"Done. Processed {len(final_data)} companies (별도재무제표 only, excluding consolidated).")

if __name__ == '__main__':
    main()