"""
포괄손익계산서(03_포괄손익계산서_연결)에는 revenue가 없지만
손익계산서(02_손익계산서_연결)에는 revenue가 있는 기업들의 EPS 데이터를 파싱합니다.

예: 한화오션 [042660]

process_eps_data.py와 동일한 구조로 EPS 데이터를 추출하되,
02_손익계산서_연결 파일에서만 추출합니다.

출력: income_statement_eps.json
"""

import os
import csv
import re
import json
from collections import defaultdict

# CONFIGURATION
SOURCE_DIR = "csv_output"
OUTPUT_FILE = "income_statement_eps.json"

# Revenue codes (to identify target companies)
REVENUE_CODES = ['ifrs_Revenue', 'ifrs-full_Revenue']

# EPS METRIC IDENTIFIERS
EPS_METRICS = {
    'eps': {
        'codes': [
            'ifrs-full_BasicEarningsLossPerShare',
            'ifrs_BasicEarningsLossPerShare',
            'dart_BasicEarningsPerShare'
        ],
        'names': ['기본주당순이익', '기본주당이익', '주당순이익'],
        'exclude_codes': ['Diluted'],
        'exclude_names': ['희석']
    }
}

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

def clean_header(h):
    return h.replace(' ', '').replace('\xa0', '').strip()

def parse_value(v):
    """Parse EPS value (can be decimal)"""
    if not v or v.strip() == '': return None
    try:
        clean = re.sub(r'[^\d\-.]', '', v)
        if not clean or clean == '-': return None
        return float(clean)
    except:
        return None

def normalize_code(code):
    """종목코드 정규화"""
    if not code or code == '[null]':
        return None
    digits_only = re.sub(r'[^\d]', '', code)
    if not digits_only:
        return None
    cleaned_code = code.replace('[', '').replace(']', '').replace(' ', '').strip()
    if not cleaned_code.isdigit():
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
    for exc_code in metric_def.get('exclude_codes', []):
        if exc_code in item_code:
            return True
    clean_name = clean_header(item_name)
    for exc_name in metric_def.get('exclude_names', []):
        if exc_name in clean_name:
            return True
    return False

def matches_metric_code(item_code, metric_def):
    """Check if item_code matches metric definition codes"""
    for code in metric_def.get('codes', []):
        if code in item_code:
            return True
    return False

def get_files_by_pattern(files, pattern):
    """파일명 패턴으로 필터링"""
    return [f for f in files if pattern in f and f.endswith('.csv')]

def build_latest_company_names(source_dir):
    """2025년 3분기 보고서에서 최신 회사명 매핑 추출"""
    latest_names = {}

    files = sorted(os.listdir(source_dir))
    target_file = None
    for f in files:
        if '2025_3분기보고서_02_손익계산서_연결' in f:
            target_file = f
            break

    if not target_file:
        print("Warning: 2025년 3분기 보고서 파일을 찾을 수 없습니다.")
        return latest_names

    filepath = os.path.join(source_dir, target_file)
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
        return latest_names

    headers = [clean_header(h) for h in rows[0]]
    col_map = {}
    for idx, h in enumerate(headers):
        if h:
            col_map[h] = idx

    col_code = col_map.get('종목코드')
    col_name = col_map.get('회사명')
    col_sector = col_map.get('업종명')

    if col_code is None or col_name is None:
        return latest_names

    for row in rows[1:]:
        if len(row) <= max(col_code, col_name):
            continue

        raw_code = row[col_code].strip()
        stock_code = normalize_code(raw_code)
        if not stock_code:
            continue

        company_name = row[col_name].strip()
        sector = row[col_sector].strip() if col_sector is not None and col_sector < len(row) else 'Unknown'

        if stock_code not in latest_names:
            latest_names[stock_code] = {'name': company_name, 'sector': sector}

    print(f"  2025년 3분기 기준 {len(latest_names)}개 기업명 매핑 완료")
    return latest_names

def extract_revenue_companies_from_comprehensive(filepath):
    """포괄손익계산서에서 revenue가 있는 기업 목록 추출"""
    companies_with_revenue = set()

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
        return companies_with_revenue

    headers = [clean_header(h) for h in rows[0]]
    col_map = {}
    for idx, h in enumerate(headers):
        if h:
            col_map[h] = idx

    col_code = col_map.get('종목코드')
    col_item_code = col_map.get('항목코드')

    if col_code is None or col_item_code is None:
        return companies_with_revenue

    for row in rows[1:]:
        if len(row) <= max(col_map.values()):
            continue

        item_code = row[col_item_code].strip()

        if item_code not in REVENUE_CODES:
            continue

        raw_code = row[col_code].strip()
        stock_code = normalize_code(raw_code)
        if stock_code:
            companies_with_revenue.add(stock_code)

    return companies_with_revenue

def extract_period_info(filename):
    """파일명에서 연도, 보고서 종류 추출"""
    parts = filename.split('_')
    year = int(parts[0])
    report_type = parts[1]
    return year, report_type

def get_target_periods(report_type):
    """보고서 종류에 따른 타겟 기간 컬럼 설정"""
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
        target_periods.append(('Annual_Previous', ['전기', '전기사업년도']))

    return target_periods

def extract_eps_data_from_income_statement(filepath, filename):
    """손익계산서에서 EPS 데이터 추출"""
    results = {}

    year, report_type = extract_period_info(filename)
    target_periods = get_target_periods(report_type)

    if not target_periods:
        return results

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
        return results

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

    col_code = col_map.get('종목코드')
    col_name = col_map.get('회사명')
    col_item_code = col_map.get('항목코드')
    col_item_name = col_map.get('항목명')
    col_sector = col_map.get('업종명')

    if col_code is None or col_item_code is None:
        return results

    for row in rows[1:]:
        if len(row) <= max(col_map.values()):
            continue

        raw_code = row[col_code].strip()
        stock_code = normalize_code(raw_code)
        if not stock_code:
            continue

        item_code = row[col_item_code].strip()
        item_name = row[col_item_name].strip() if col_item_name is not None else ''
        company_name = row[col_name].strip() if col_name is not None else 'Unknown'
        sector = row[col_sector].strip() if col_sector is not None else 'Unknown'

        # Skip financial sectors
        if is_financial_sector(sector):
            continue

        # Check if this is EPS metric
        metric_type = None
        for m_key, m_def in EPS_METRICS.items():
            if should_exclude_metric(item_code, item_name, m_def):
                continue
            clean_item_name = clean_header(item_name)
            if matches_metric_code(item_code, m_def) or any(n in clean_item_name for n in m_def['names']):
                metric_type = m_key
                break

        if not metric_type:
            continue

        # 기업 정보 초기화
        if stock_code not in results:
            results[stock_code] = {
                'name': company_name,
                'sector': sector,
                'data': defaultdict(lambda: defaultdict(dict))
            }

        # 각 타겟 기간에서 값 추출
        for period_key, allowed_cols in target_periods:
            col_idx = get_idx(allowed_cols)
            if col_idx is not None and col_idx < len(row):
                val = parse_value(row[col_idx])
                if val is not None:
                    target_year = year
                    storage_key = period_key

                    if period_key == 'Annual_Previous':
                        target_year = year - 1

                    if metric_type not in results[stock_code]['data'][target_year][storage_key]:
                        results[stock_code]['data'][target_year][storage_key][metric_type] = val
                        results[stock_code]['data'][target_year][f'{storage_key}_{metric_type}_item_code'] = item_code
                        results[stock_code]['data'][target_year][f'{storage_key}_{metric_type}_item_name'] = item_name

    return results

def compile_history(data):
    """데이터를 분기별 히스토리로 컴파일"""
    history = []

    for year in sorted(data.keys()):
        year_data = data[year]

        # 1Q, 2Q, 3Q
        for q in ['1Q', '2Q', '3Q']:
            if q in year_data and 'eps' in year_data[q]:
                rec = {
                    'year': year,
                    'quarter': q,
                    'eps': year_data[q].get('eps'),
                }

                # Add metadata
                code_key = f'{q}_eps_item_code'
                name_key = f'{q}_eps_item_name'
                if code_key in year_data:
                    rec['eps_ifrs_code'] = year_data[code_key]
                    rec['eps_korean_name'] = year_data[name_key]

                if rec['eps'] is not None:
                    history.append(rec)

        # 4Q 계산 (Annual - 3Q_Acc)
        annual_data = year_data.get('Annual_Current') or year_data.get('Annual_Previous')
        q3_acc_data = year_data.get('3Q_Acc')

        if annual_data and q3_acc_data:
            val_ann = annual_data.get('eps')
            val_q3 = q3_acc_data.get('eps')

            if val_ann is not None and val_q3 is not None:
                q4_rec = {
                    'year': year,
                    'quarter': '4Q',
                    'eps': val_ann - val_q3
                }

                # Add metadata from Annual
                code_key = 'Annual_Current_eps_item_code'
                name_key = 'Annual_Current_eps_item_name'
                if code_key not in year_data:
                    code_key = 'Annual_Previous_eps_item_code'
                    name_key = 'Annual_Previous_eps_item_name'

                if code_key in year_data:
                    q4_rec['eps_ifrs_code'] = year_data[code_key]
                    q4_rec['eps_korean_name'] = year_data[name_key]

                history.append(q4_rec)

    return history

def main():
    files = sorted(os.listdir(SOURCE_DIR))

    # 파일 목록
    comprehensive_files = get_files_by_pattern(files, '03_포괄손익계산서_연결')
    income_files = get_files_by_pattern(files, '02_손익계산서_연결')

    print(f"포괄손익계산서 파일: {len(comprehensive_files)}개")
    print(f"손익계산서 파일: {len(income_files)}개")

    # 0단계: 2025년 3분기 기준 최신 회사명 매핑 추출
    print("\n=== 0단계: 2025년 3분기 기준 최신 회사명 매핑 ===")
    latest_company_names = build_latest_company_names(SOURCE_DIR)

    # 1단계: 포괄손익계산서에서 revenue가 있는 기업 목록 추출 (기간별)
    comprehensive_revenue_by_period = defaultdict(set)

    print("\n=== 1단계: 포괄손익계산서에서 revenue 있는 기업 추출 ===")
    for f in comprehensive_files:
        year, report_type = extract_period_info(f)
        period = f"{year}_{report_type}"
        filepath = os.path.join(SOURCE_DIR, f)
        companies = extract_revenue_companies_from_comprehensive(filepath)
        comprehensive_revenue_by_period[period] = companies

    # 2단계: 손익계산서에서 EPS 데이터 추출 (포괄손익에 revenue 없는 기업만)
    print("\n=== 2단계: 손익계산서에서 EPS 데이터 추출 ===")

    all_results = {}

    for f in income_files:
        year, report_type = extract_period_info(f)
        period = f"{year}_{report_type}"
        filepath = os.path.join(SOURCE_DIR, f)

        # 포괄손익에 revenue가 있는 기업들
        companies_with_comprehensive_revenue = comprehensive_revenue_by_period.get(period, set())

        # 손익계산서에서 EPS 데이터 추출
        results = extract_eps_data_from_income_statement(filepath, f)

        # 포괄손익에 없는 기업만 필터링하여 저장
        for stock_code, company_data in results.items():
            if stock_code in companies_with_comprehensive_revenue:
                continue  # 포괄손익에 이미 있으면 스킵

            if stock_code not in all_results:
                all_results[stock_code] = {
                    'name': company_data['name'],
                    'sector': company_data['sector'],
                    'data': defaultdict(lambda: defaultdict(dict))
                }

            # 데이터 병합
            for year_key, year_data in company_data['data'].items():
                for period_key, period_data in year_data.items():
                    if isinstance(period_data, dict):
                        all_results[stock_code]['data'][year_key][period_key].update(period_data)
                    else:
                        all_results[stock_code]['data'][year_key][period_key] = period_data

    # 3단계: 히스토리 컴파일 및 출력 (최신 회사명 사용)
    print("\n=== 3단계: 결과 컴파일 (2025년 3분기 기준 회사명 적용) ===")

    final_output = {}

    for stock_code in sorted(all_results.keys()):
        company_data = all_results[stock_code]
        history = compile_history(dict(company_data['data']))

        if history:
            # 최신 회사명 사용 (있으면), 없으면 기존 이름 유지
            if stock_code in latest_company_names:
                name = latest_company_names[stock_code]['name']
                sector = latest_company_names[stock_code]['sector']
            else:
                name = company_data['name']
                sector = company_data['sector']

            final_output[stock_code] = {
                'name': name,
                'sector': sector,
                'source': '02_손익계산서_연결',
                'history': history
            }

    print(f"\n총 {len(final_output)}개 기업의 EPS 데이터 추출 완료")

    # JSON 저장
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, ensure_ascii=False, indent=2)

    print(f"결과가 {OUTPUT_FILE}에 저장되었습니다.")

    # 샘플 출력: 한화오션
    if '042660' in final_output:
        print("\n=== 샘플: 한화오션 [042660] ===")
        hwo = final_output['042660']
        print(f"회사명: {hwo['name']}")
        print(f"업종: {hwo['sector']}")
        print(f"데이터 출처: {hwo['source']}")
        print(f"분기 데이터 개수: {len(hwo['history'])}")
        print("\n최근 5개 분기:")
        for rec in hwo['history'][-5:]:
            eps_str = f"{rec['eps']:,.2f}" if rec['eps'] is not None else 'N/A'
            print(f"  {rec['year']} {rec['quarter']}: EPS {eps_str}원")

if __name__ == '__main__':
    main()
