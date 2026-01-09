"""Check if 이렘(009730) data was successfully loaded from 별도 statements"""
import json

with open('financial_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total companies: {len(data)}")

# Check for 이렘(009730)
irem_data = data.get('009730')
print(f"\n009730 (이렘) exists: {irem_data is not None}")

if irem_data:
    print(f"Company name: {irem_data.get('name')}")
    print(f"Statement type: {irem_data.get('statement_type')}")
    print(f"Sector: {irem_data.get('sector')}")
    print(f"History records: {len(irem_data.get('history', []))}")
    print("\nFirst 5 records:")
    for rec in irem_data.get('history', [])[:5]:
        revenue = rec.get('revenue')
        revenue_bil = revenue / 1e8 if revenue else None
        print(f"  {rec['year']} {rec['quarter']}: {revenue_bil:.2f}억원" if revenue_bil else f"  {rec['year']} {rec['quarter']}: None")

# Count companies by statement_type
byul_companies = sum(1 for c in data.values() if c.get('statement_type') == '별도')
yeon_companies = sum(1 for c in data.values() if c.get('statement_type') == '연결')

print(f"\n연결 companies: {yeon_companies}")
print(f"별도 companies: {byul_companies}")
