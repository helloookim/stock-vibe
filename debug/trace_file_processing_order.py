import os

SOURCE_DIR = "csv_output"
files = sorted(os.listdir(SOURCE_DIR))

print("=== FILE PROCESSING ORDER ===")
print("(Only showing 2025 files that will be processed)\n")

for f in files:
    if not f.endswith('.csv'):
        continue

    # Skip non-2025 files
    if not f.startswith('2025'):
        continue

    # Check if it's an income statement and 연결
    is_income_stmt = '포괄손익계산서' in f or '손익계산서' in f
    is_consolidated = '연결' in f
    should_skip = '현금흐름표' in f or '재무상태표' in f or '자본변동표' in f

    if not is_income_stmt or should_skip:
        status = "SKIP (not income statement)"
    elif not is_consolidated:
        status = "SKIP (not consolidated, processed in Pass 2 only if missing)"
    else:
        status = "PROCESS"

    print(f"{status:50s} {f}")
