"""
포괄손익계산서(03_포괄손익계산서_연결)에는 revenue가 없지만
손익계산서(02_손익계산서_연결)에는 revenue가 있는 기업들을 찾아서 파싱합니다.

예: 한화오션 [042660]
"""

import os
import csv
import re
import json
from collections import defaultdict

# CONFIGURATION
SOURCE_DIR = "csv_output"
OUTPUT_FILE = "revenue_from_income_statement.json"

# Revenue codes to look for
REVENUE_CODES = ['ifrs_Revenue', 'ifrs-full_Revenue']

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

def extract_revenue_companies(filepath, filename):
    """CSV에서 revenue가 있는 기업 목록과 데이터 추출"""
    companies = {}

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
        return companies

    headers = [clean_header(h) for h in rows[0]]
    col_map = {}
    for idx, h in enumerate(headers):
        if h:
            col_map[h] = idx

    col_code = col_map.get('종목코드')
    col_name = col_map.get('회사명')
    col_item_code = col_map.get('항목코드')
    col_item_name = col_map.get('항목명')
    col_sector = col_map.get('업종명')

    if col_code is None or col_item_code is None:
        return companies

    for row in rows[1:]:
        if len(row) <= max(col_map.values()):
            continue

        item_code = row[col_item_code].strip()

        # Check if this row has revenue
        if item_code not in REVENUE_CODES:
            continue

        raw_code = row[col_code].strip()
        stock_code = normalize_code(raw_code)
        if not stock_code:
            continue

        company_name = row[col_name].strip() if col_name is not None else 'Unknown'
        sector = row[col_sector].strip() if col_sector is not None else 'Unknown'
        item_name = row[col_item_name].strip() if col_item_name is not None else ''

        companies[stock_code] = {
            'name': company_name,
            'sector': sector,
            'item_code': item_code,
            'item_name': item_name,
            'row': row,
            'headers': headers,
            'col_map': col_map
        }

    return companies

def main():
    files = sorted(os.listdir(SOURCE_DIR))

    # 포괄손익계산서_연결 파일들
    comprehensive_files = get_files_by_pattern(files, '03_포괄손익계산서_연결')
    # 손익계산서_연결 파일들
    income_files = get_files_by_pattern(files, '02_손익계산서_연결')

    print(f"포괄손익계산서 파일: {len(comprehensive_files)}개")
    print(f"손익계산서 파일: {len(income_files)}개")

    # 연도/분기별로 그룹화
    def extract_period(filename):
        parts = filename.split('_')
        year = parts[0]
        report_type = parts[1]
        return f"{year}_{report_type}"

    # 포괄손익에 revenue 있는 기업들 (per period)
    comprehensive_revenue_by_period = defaultdict(set)
    # 손익계산서에 revenue 있는 기업들 (per period)
    income_revenue_by_period = defaultdict(set)

    # 손익계산서에서 revenue 데이터 (나중에 사용)
    income_revenue_data = defaultdict(dict)  # {period: {stock_code: data}}

    print("\n=== 포괄손익계산서에서 revenue 있는 기업 추출 ===")
    for f in comprehensive_files:
        period = extract_period(f)
        filepath = os.path.join(SOURCE_DIR, f)
        companies = extract_revenue_companies(filepath, f)
        for stock_code in companies:
            comprehensive_revenue_by_period[period].add(stock_code)

    print("\n=== 손익계산서에서 revenue 있는 기업 추출 ===")
    for f in income_files:
        period = extract_period(f)
        filepath = os.path.join(SOURCE_DIR, f)
        companies = extract_revenue_companies(filepath, f)
        for stock_code, data in companies.items():
            income_revenue_by_period[period].add(stock_code)
            income_revenue_data[period][stock_code] = data

    # 포괄손익에는 없고 손익계산서에만 있는 기업 찾기
    missing_from_comprehensive = defaultdict(set)

    all_periods = set(comprehensive_revenue_by_period.keys()) | set(income_revenue_by_period.keys())

    for period in sorted(all_periods):
        comprehensive_codes = comprehensive_revenue_by_period.get(period, set())
        income_codes = income_revenue_by_period.get(period, set())

        # 손익계산서에만 있는 기업
        only_in_income = income_codes - comprehensive_codes

        if only_in_income:
            missing_from_comprehensive[period] = only_in_income

    # 결과 출력 및 저장
    print("\n" + "=" * 70)
    print("포괄손익계산서에 revenue 없고, 손익계산서에만 revenue 있는 기업들:")
    print("=" * 70)

    # 기업별로 집계 (어떤 기간에 해당되는지)
    company_periods = defaultdict(list)  # {stock_code: [periods]}
    company_info = {}  # {stock_code: {name, sector}}

    for period, codes in sorted(missing_from_comprehensive.items()):
        for code in sorted(codes):
            company_periods[code].append(period)
            if code not in company_info:
                data = income_revenue_data[period].get(code, {})
                company_info[code] = {
                    'name': data.get('name', 'Unknown'),
                    'sector': data.get('sector', 'Unknown')
                }

    # 정렬해서 출력
    print(f"\n총 {len(company_periods)}개 기업 발견\n")

    result = {}
    for code in sorted(company_periods.keys()):
        info = company_info[code]
        periods = company_periods[code]

        print(f"[{code}] {info['name']}")
        print(f"    업종: {info['sector']}")
        print(f"    해당 기간: {', '.join(sorted(periods))}")
        print()

        result[code] = {
            'name': info['name'],
            'sector': info['sector'],
            'periods': sorted(periods)
        }

    # JSON 저장
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n결과가 {OUTPUT_FILE}에 저장되었습니다.")

    # 상세 출력: 각 기간별로 보기
    print("\n" + "=" * 70)
    print("기간별 상세:")
    print("=" * 70)

    for period in sorted(missing_from_comprehensive.keys()):
        codes = missing_from_comprehensive[period]
        print(f"\n{period}: {len(codes)}개 기업")
        for code in sorted(codes):
            data = income_revenue_data[period].get(code, {})
            print(f"  [{code}] {data.get('name', 'Unknown')}")

if __name__ == '__main__':
    main()
