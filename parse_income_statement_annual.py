"""
포괄손익계산서(03_포괄손익계산서_연결)에는 revenue가 없지만
손익계산서(02_손익계산서_연결)에는 revenue가 있는 기업들의 연간(Annual) 데이터를 파싱합니다.

예: 한화오션 [042660]

process_annual_data.py와 동일한 구조로 연간 데이터를 추출하되,
02_손익계산서_연결 파일에서만 추출합니다.

출력: income_statement_annual.json
"""

import os
import csv
import re
import json
from collections import defaultdict

# CONFIGURATION
SOURCE_DIR = "csv_output"
OUTPUT_FILE = "income_statement_annual.json"

# Revenue codes to look for
REVENUE_CODES = ['ifrs_Revenue', 'ifrs-full_Revenue']

# Operating profit codes
OP_PROFIT_CODES = ['dart_OperatingIncomeLoss', 'ifrs_OperatingIncomeLoss', 'ifrs-full_ProfitLossFromOperatingActivities']

# Net income codes
NET_INCOME_CODES = [
    'ifrs_ProfitLoss',
    'ifrs-full_ProfitLoss',
    'ifrs-full_ProfitLossAttributableToOwnersOfParent',
    'ifrs_ProfitLossAttributableToOwnersOfParent'
]

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

def get_files_by_pattern(files, pattern):
    """파일명 패턴으로 필터링"""
    return [f for f in files if pattern in f and f.endswith('.csv')]

def build_latest_company_names(source_dir):
    """2025년 3분기 보고서에서 최신 회사명 매핑 추출"""
    latest_names = {}

    # 2025년 3분기 손익계산서 연결 파일 찾기
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

def extract_revenue_from_comprehensive(filepath):
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

def extract_annual_data_from_income_statement(filepath, filename):
    """손익계산서에서 연간 데이터 추출 (사업보고서만)"""
    results = {}

    # 사업보고서만 처리
    if '사업보고서' not in filename:
        return results

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

    # 사업보고서의 타겟 기간
    # 당기 = current fiscal year (year in filename)
    # 전기 = previous fiscal year (year - 1)
    target_periods = [
        ('Annual', ['당기', '당기사업년도']),
        ('Previous', ['전기', '전기사업년도'])
    ]

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

        # metric 타입 확인
        metric_type = None
        if item_code in REVENUE_CODES:
            metric_type = 'revenue'
        elif any(code in item_code for code in OP_PROFIT_CODES):
            metric_type = 'op_profit'
        elif any(code in item_code for code in NET_INCOME_CODES):
            metric_type = 'net_income'

        if not metric_type:
            continue

        # 기업 정보 초기화
        if stock_code not in results:
            results[stock_code] = {
                'name': company_name,
                'sector': sector,
                'data': defaultdict(dict)
            }

        # 각 타겟 기간에서 값 추출
        for period_key, allowed_cols in target_periods:
            col_idx = get_idx(allowed_cols)
            if col_idx is not None and col_idx < len(row):
                val = parse_value(row[col_idx])
                if val is not None:
                    # 당기 -> year, 전기 -> year - 1
                    if period_key == 'Annual':
                        target_year = year
                    elif period_key == 'Previous':
                        target_year = year - 1
                    else:
                        continue

                    # 저장 (기존 값이 없을 때만)
                    if metric_type not in results[stock_code]['data'][target_year]:
                        results[stock_code]['data'][target_year][metric_type] = val
                        results[stock_code]['data'][target_year][f'{metric_type}_item_code'] = item_code
                        results[stock_code]['data'][target_year][f'{metric_type}_item_name'] = item_name

    return results

def compile_history(data):
    """데이터를 연간 히스토리로 컴파일"""
    history = []

    for year in sorted(data.keys()):
        year_data = data[year]

        rec = {
            'year': year,
            'revenue': year_data.get('revenue'),
            'op_profit': year_data.get('op_profit'),
            'net_income': year_data.get('net_income')
        }

        # metadata 추가
        for metric in ['revenue', 'op_profit', 'net_income']:
            code_key = f'{metric}_item_code'
            name_key = f'{metric}_item_name'
            if code_key in year_data:
                rec[f'{metric}_ifrs_code'] = year_data[code_key]
                rec[f'{metric}_korean_name'] = year_data[name_key]

        if rec['revenue'] is not None or rec['op_profit'] is not None:
            history.append(rec)

    return history

def main():
    files = sorted(os.listdir(SOURCE_DIR))

    # 파일 목록 (사업보고서만)
    comprehensive_files = [f for f in get_files_by_pattern(files, '03_포괄손익계산서_연결') if '사업보고서' in f]
    income_files = [f for f in get_files_by_pattern(files, '02_손익계산서_연결') if '사업보고서' in f]

    print(f"포괄손익계산서 (사업보고서) 파일: {len(comprehensive_files)}개")
    print(f"손익계산서 (사업보고서) 파일: {len(income_files)}개")

    # 0단계: 2025년 3분기 기준 최신 회사명 매핑 추출
    print("\n=== 0단계: 2025년 3분기 기준 최신 회사명 매핑 ===")
    latest_company_names = build_latest_company_names(SOURCE_DIR)

    # 1단계: 포괄손익계산서에서 revenue가 있는 기업 목록 추출 (기간별)
    comprehensive_revenue_by_period = defaultdict(set)

    print("\n=== 1단계: 포괄손익계산서에서 revenue 있는 기업 추출 ===")
    for f in comprehensive_files:
        parts = f.split('_')
        year = parts[0]
        period = f"{year}_사업보고서"
        filepath = os.path.join(SOURCE_DIR, f)
        companies = extract_revenue_from_comprehensive(filepath)
        comprehensive_revenue_by_period[period] = companies
        print(f"  {period}: {len(companies)}개 기업")

    # 2단계: 손익계산서에서 연간 데이터 추출 (포괄손익에 없는 기업만)
    print("\n=== 2단계: 손익계산서에서 연간 데이터 추출 ===")

    all_results = {}  # {stock_code: {name, sector, data}}

    for f in income_files:
        parts = f.split('_')
        year = parts[0]
        period = f"{year}_사업보고서"
        filepath = os.path.join(SOURCE_DIR, f)

        print(f"  Processing: {f}")

        # 포괄손익에 revenue가 있는 기업들
        companies_with_comprehensive_revenue = comprehensive_revenue_by_period.get(period, set())

        # 손익계산서에서 연간 데이터 추출
        results = extract_annual_data_from_income_statement(filepath, f)

        # 포괄손익에 없는 기업만 필터링하여 저장
        for stock_code, company_data in results.items():
            if stock_code in companies_with_comprehensive_revenue:
                continue  # 포괄손익에 이미 있으면 스킵

            if stock_code not in all_results:
                all_results[stock_code] = {
                    'name': company_data['name'],
                    'sector': company_data['sector'],
                    'data': defaultdict(dict)
                }

            # 데이터 병합
            for year_key, year_data in company_data['data'].items():
                for key, value in year_data.items():
                    if key not in all_results[stock_code]['data'][year_key]:
                        all_results[stock_code]['data'][year_key][key] = value

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

    print(f"\n총 {len(final_output)}개 기업의 연간 데이터 추출 완료")

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
        print(f"연간 데이터 개수: {len(hwo['history'])}")
        print("\n연간 데이터:")
        for rec in hwo['history']:
            rev_str = f"{rec['revenue']:,}" if rec.get('revenue') else 'N/A'
            op_str = f"{rec['op_profit']:,}" if rec.get('op_profit') else 'N/A'
            net_str = f"{rec['net_income']:,}" if rec.get('net_income') else 'N/A'
            print(f"  {rec['year']}: 매출 {rev_str}, 영업이익 {op_str}, 순이익 {net_str}")

    # 통계
    print("\n=== 통계 ===")
    years_count = defaultdict(int)
    for code, data in final_output.items():
        for rec in data['history']:
            years_count[rec['year']] += 1

    print("연도별 기업 수:")
    for year in sorted(years_count.keys()):
        print(f"  {year}: {years_count[year]}개")

if __name__ == '__main__':
    main()
