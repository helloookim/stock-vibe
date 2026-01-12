"""
Find companies with missing quarterly data
"""
import json
from datetime import datetime

# Load financial data
with open('financial_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=== 쿼터별 데이터 누락 분석 ===\n")

# Determine current quarter based on today's date
today = datetime.now()
current_year = today.year
current_month = today.month

# Determine which quarter is the latest that should be available
# Quarterly earnings are typically released 2 months after quarter ends:
# Q1 (Jan-Mar): Available around mid-May
# Q2 (Apr-Jun): Available around mid-August
# Q3 (Jul-Sep): Available around mid-November
# Q4 (Oct-Dec): Available around mid-February of next year

# Use conservative estimates (mid-month release dates)
if current_month == 12:  # December: Only Q3 available
    latest_quarter = 3
    latest_year = current_year
elif current_month == 11:  # November: Q2 available (Q3 releases mid-Nov)
    latest_quarter = 2
    latest_year = current_year
elif current_month >= 8:  # Aug-Oct: Q2 should be available
    latest_quarter = 2
    latest_year = current_year
elif current_month >= 5:  # May-Jul: Q1 should be available
    latest_quarter = 1
    latest_year = current_year
elif current_month >= 2 and current_month <= 4:  # Feb-Apr: Q4 of previous year available
    latest_quarter = 4
    latest_year = current_year - 1
else:  # January: Q3 of previous year is the latest (Q4 not yet released)
    latest_quarter = 3
    latest_year = current_year - 1

print(f"현재 날짜: {today.strftime('%Y-%m-%d')}")
print(f"최신 예상 분기: {latest_year} {latest_quarter}Q\n")

# Analyze missing quarters per company per year
missing_report = []

for code, company_data in data.items():
    company_name = company_data['name']
    history = company_data['history']

    if not history:
        continue

    # Determine company's first data point
    first_year = min(entry['year'] for entry in history)
    first_quarter_entries = [e for e in history if e['year'] == first_year]
    first_quarter_num = min(['1Q', '2Q', '3Q', '4Q'].index(e['quarter']) for e in first_quarter_entries) + 1

    # Group by year
    by_year = {}
    for entry in history:
        year = entry['year']
        quarter = entry['quarter']
        if year not in by_year:
            by_year[year] = []
        by_year[year].append(quarter)

    # Check for missing quarters (expect 1Q, 2Q, 3Q, 4Q)
    for year in sorted(by_year.keys()):
        quarters = set(by_year[year])

        # Determine expected quarters for this year
        if year < latest_year:
            # Past years: expect all 4 quarters
            expected = {'1Q', '2Q', '3Q', '4Q'}
        elif year == latest_year:
            # Latest year: expect up to latest_quarter
            expected = {f'{q}Q' for q in range(1, latest_quarter + 1)}
        else:
            # Future years: skip (no data expected yet)
            continue

        # For the first year of the company, only expect quarters from first_quarter onwards
        if year == first_year:
            expected = {f'{q}Q' for q in range(first_quarter_num, 5)}
            if year == latest_year:
                # If first year is also latest year, cap at latest_quarter
                expected = {f'{q}Q' for q in range(first_quarter_num, min(5, latest_quarter + 1))}

        missing = expected - quarters

        if missing:  # Report all missing quarters from company's first data point onwards
            missing_report.append({
                'code': code,
                'name': company_name,
                'year': year,
                'first_data_year': first_year,
                'first_data_quarter': f'{first_quarter_num}Q',
                'missing': sorted(missing),
                'has': sorted(quarters)
            })

# Sort by year desc, then by number of missing quarters
missing_report.sort(key=lambda x: (-x['year'], -len(x['missing'])))

# Print summary
print(f"총 {len(missing_report)}건의 누락 발견 (각 기업의 최초 데이터 시점 이후)\n")

# Group by number of missing quarters
by_count = {}
for item in missing_report:
    count = len(item['missing'])
    if count not in by_count:
        by_count[count] = []
    by_count[count].append(item)

print("누락 분포:")
for count in sorted(by_count.keys(), reverse=True):
    print(f"  {count}개 쿼터 누락: {len(by_count[count])}개 기업")

# Show examples
print("\n\n상위 20개 누락 케이스:")
print("-" * 120)
for i, item in enumerate(missing_report[:20], 1):
    missing_str = ', '.join(item['missing'])
    has_str = ', '.join(item['has'])
    first_data = f"{item['first_data_year']} {item['first_data_quarter']}"
    print(f"{i:2}. [{item['code']}] {item['name'][:15]:15} | {item['year']}년 | 최초: {first_data:9} | 누락: {missing_str:12} | 보유: {has_str}")

# Save full report to file
with open('missing_quarters_report.json', 'w', encoding='utf-8') as f:
    json.dump(missing_report, f, ensure_ascii=False, indent=2)

print(f"\n\n전체 리포트 저장: missing_quarters_report.json ({len(missing_report)}건)")
