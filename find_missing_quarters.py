"""
Find companies with missing quarterly data
"""
import json

# Load financial data
with open('financial_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=== 쿼터별 데이터 누락 분석 ===\n")

# Analyze missing quarters per company per year
missing_report = []

for code, company_data in data.items():
    company_name = company_data['name']
    history = company_data['history']
    
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
        expected = {'1Q', '2Q', '3Q', '4Q'}
        missing = expected - quarters
        
        if missing and year >= 2020:  # Only check recent years
            missing_report.append({
                'code': code,
                'name': company_name,
                'year': year,
                'missing': sorted(missing),
                'has': sorted(quarters)
            })

# Sort by year desc, then by number of missing quarters
missing_report.sort(key=lambda x: (-x['year'], -len(x['missing'])))

# Print summary
print(f"총 {len(missing_report)}건의 누락 발견 (2020년 이후)\n")

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
print("-" * 100)
for i, item in enumerate(missing_report[:20], 1):
    missing_str = ', '.join(item['missing'])
    has_str = ', '.join(item['has'])
    print(f"{i:2}. [{item['code']}] {item['name'][:15]:15} | {item['year']}년 | 누락: {missing_str:12} | 보유: {has_str}")

# Save full report to file
with open('missing_quarters_report.json', 'w', encoding='utf-8') as f:
    json.dump(missing_report, f, ensure_ascii=False, indent=2)

print(f"\n\n전체 리포트 저장: missing_quarters_report.json ({len(missing_report)}건)")
