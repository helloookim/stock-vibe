import csv

def clean_header(h):
    return h.replace(' ', '').replace('\xa0', '').strip()

filepath = r"csv_output\2025_반기보고서_03_포괄손익계산서_연결_20260107.csv"

with open(filepath, 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    headers = next(reader)

print("=== RAW HEADERS ===")
for idx, h in enumerate(headers):
    if idx >= 12 and idx <= 15:
        print(f"[{idx}] RAW: {repr(h)}")
        print(f"[{idx}] CLEAN: {repr(clean_header(h))}")
        print()

print("\n=== CHECKING MATCH ===")
target_columns = ['당기반기3개월', '당기2분기3개월', '당기2분기', '당기반기누적']

cleaned_headers = [clean_header(h) for h in headers]

for target in target_columns:
    found = target in cleaned_headers
    idx = cleaned_headers.index(target) if found else -1
    print(f"{target:20s} -> {'FOUND' if found else 'NOT FOUND':10s} at index {idx}")
