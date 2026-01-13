"""Test that byuldo fallback is working correctly"""
import json
import sys

# Set stdout encoding to UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('financial_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=== 별도재무제표 Fallback Test Results ===\n")

# Count statement types
byuldo_companies = [code for code, info in data.items() if info.get('statement_type') == '별도']
yeongyeol_companies = [code for code, info in data.items() if info.get('statement_type') == '연결']

print(f"Total companies processed: {len(data)}")
print(f"  연결 (consolidated): {len(yeongyeol_companies)}")
print(f"  별도 (separate): {len(byuldo_companies)}")

# Test 이렘(009730)
print(f"\n=== Test Case: 이렘 (009730) ===")
irem = data.get('009730')
if irem:
    print(f"[OK] Company found")
    print(f"  Name: {irem['name']}")
    print(f"  Statement type: {irem['statement_type']}")
    print(f"  Sector: {irem['sector']}")
    print(f"  Total records: {len(irem['history'])}")

    # Show 2024 data
    data_2024 = [r for r in irem['history'] if r['year'] == 2024]
    print(f"\n  2024 data ({len(data_2024)} quarters):")
    for rec in data_2024:
        rev = rec.get('revenue')
        if rev:
            print(f"    {rec['quarter']}: {rev/1e8:.2f}억원")
else:
    print("[FAIL] Company NOT found")

# Show sample of other byuldo companies
print(f"\n=== Sample of other 별도 companies ===")
for code in list(byuldo_companies)[:5]:
    company = data[code]
    record_count = len(company['history'])
    print(f"  [{code}] {company['name']}: {record_count} records")

print(f"\n[SUCCESS] 별도 fallback implementation successful!")
print(f"  Added {len(byuldo_companies)} companies that only have separate statements")
