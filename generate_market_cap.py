"""Generate market cap data for web app"""
import FinanceDataReader as fdr
import pandas as pd
import json
import sys
import io

# Set stdout encoding to UTF-8 on Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("한국 주식 시가총액 데이터 생성 중...\n")

try:
    # KOSPI와 KOSDAQ 종목 리스트 가져오기
    print("KOSPI 종목 리스트 로딩...")
    kospi = fdr.StockListing('KOSPI')

    print("KOSDAQ 종목 리스트 로딩...")
    kosdaq = fdr.StockListing('KOSDAQ')

    # 두 시장 데이터 합치기
    all_stocks = pd.concat([kospi, kosdaq], ignore_index=True)

    print(f"총 {len(all_stocks)}개 종목 데이터 수집 완료!\n")

    # 시가총액 컬럼 찾기
    cap_column = None
    possible_names = ['MarketCap', 'Marcap', '시가총액', 'Market Cap', 'Caps']

    for name in possible_names:
        if name in all_stocks.columns:
            cap_column = name
            break

    if cap_column is None:
        print("시가총액 컬럼을 찾을 수 없습니다.")
        print("사용 가능한 컬럼:", all_stocks.columns.tolist())
        exit(1)

    print(f"시가총액 컬럼: '{cap_column}'")

    # 시가총액이 0이거나 NaN인 종목 제거
    all_stocks = all_stocks[all_stocks[cap_column].notna()]
    all_stocks = all_stocks[all_stocks[cap_column] > 0]

    # 시가총액 기준으로 정렬
    all_stocks = all_stocks.sort_values(cap_column, ascending=False).reset_index(drop=True)

    # JSON 데이터 생성 (종목코드를 키로 사용)
    market_cap_data = {}

    for idx, row in all_stocks.iterrows():
        code = str(row.get('Code', '')).zfill(6)
        if not code or code == '000000':
            continue

        market_cap_data[code] = {
            'name': row.get('Name', ''),
            'market_cap': int(row[cap_column]),  # 원 단위
            'market_cap_eok': int(row[cap_column] / 100000000),  # 억원 단위
            'close': int(row.get('Close', 0)) if pd.notna(row.get('Close')) else 0,
            'market': row.get('Market', ''),
            'sector': row.get('Sector', ''),
            'industry': row.get('Industry', ''),
            'rank': idx + 1
        }

    # JSON 파일로 저장
    output_file = 'market_cap_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(market_cap_data, f, ensure_ascii=False, indent=2)

    print(f"\n✓ {len(market_cap_data)}개 종목의 시가총액 데이터를 '{output_file}'로 저장했습니다.")

    # 통계 출력
    print("\n=== 주요 통계 ===")
    print(f"총 종목 수: {len(market_cap_data)}개")

    top_10 = sorted(market_cap_data.items(), key=lambda x: x[1]['market_cap'], reverse=True)[:10]
    print("\n시가총액 TOP 10:")
    for code, data in top_10:
        print(f"  {data['rank']:2d}. [{code}] {data['name']:15s} {data['market_cap_eok']:>10,}억원")

except Exception as e:
    print(f"오류 발생: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
