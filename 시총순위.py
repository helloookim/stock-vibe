import FinanceDataReader as fdr
import pandas as pd

print("한국 주식 시가총액 순위 조회 중...\n")

try:
    # KOSPI와 KOSDAQ 종목 리스트 가져오기
    print("KOSPI 종목 리스트 로딩...")
    kospi = fdr.StockListing('KOSPI')
    
    print("KOSDAQ 종목 리스트 로딩...")
    kosdaq = fdr.StockListing('KOSDAQ')
    
    # 두 시장 데이터 합치기
    all_stocks = pd.concat([kospi, kosdaq], ignore_index=True)
    
    print(f"총 {len(all_stocks)}개 종목 데이터 수집 완료!\n")
    
    # 실제 컬럼명 확인
    print("데이터 컬럼:", all_stocks.columns.tolist())
    print("\n첫 번째 종목 샘플:")
    print(all_stocks.head(1).T)
    print("\n")
    
    # 시가총액 컬럼 찾기 (여러 가능한 이름 시도)
    cap_column = None
    possible_names = ['MarketCap', 'Marcap', '시가총액', 'Market Cap', 'Caps']
    
    for name in possible_names:
        if name in all_stocks.columns:
            cap_column = name
            break
    
    if cap_column is None:
        print("시가총액 컬럼을 찾을 수 없습니다. 사용 가능한 컬럼:")
        print(all_stocks.columns.tolist())
        print("\n데이터 샘플:")
        print(all_stocks.head())
        exit()
    
    print(f"시가총액 컬럼 발견: '{cap_column}'")
    
    # 시가총액이 0이거나 NaN인 종목 제거
    all_stocks = all_stocks[all_stocks[cap_column].notna()]
    all_stocks = all_stocks[all_stocks[cap_column] > 0]
    
    # 시가총액 기준으로 정렬
    all_stocks = all_stocks.sort_values(cap_column, ascending=False).reset_index(drop=True)
    all_stocks['순위'] = range(1, len(all_stocks) + 1)
    
    # 시가총액을 억원 단위로 변환
    all_stocks['시가총액(억원)'] = (all_stocks[cap_column] / 100000000).round(0).astype(int)
    
    # 결과 DataFrame 생성 (컬럼 존재 여부 확인)
    columns_to_show = ['순위']
    column_mapping = {'순위': '순위'}
    
    if 'Name' in all_stocks.columns:
        columns_to_show.append('Name')
        column_mapping['Name'] = '종목명'
    
    if 'Code' in all_stocks.columns:
        columns_to_show.append('Code')
        column_mapping['Code'] = '종목코드'
    
    if 'Close' in all_stocks.columns:
        columns_to_show.append('Close')
        column_mapping['Close'] = '종가'
    
    columns_to_show.append('시가총액(억원)')
    column_mapping['시가총액(억원)'] = '시가총액(억원)'
    
    if 'Market' in all_stocks.columns:
        columns_to_show.append('Market')
        column_mapping['Market'] = '시장'
    
    if 'Sector' in all_stocks.columns:
        columns_to_show.append('Sector')
        column_mapping['Sector'] = '섹터'
    
    if 'Industry' in all_stocks.columns:
        columns_to_show.append('Industry')
        column_mapping['Industry'] = '업종'
    
    result_df = all_stocks[columns_to_show].copy()
    result_df.columns = [column_mapping.get(col, col) for col in columns_to_show]
    
    # 결과 출력
    print("\n" + "="*120)
    print("한국 증시 시가총액 순위 TOP 50")
    print("="*120)
    
    pd.set_option('display.max_rows', None)
    pd.set_option('display.width', None)
    pd.set_option('display.max_colwidth', 20)
    
    print(result_df.head(50).to_string(index=False))
    
    # CSV 파일로 저장
    result_df.to_csv('시가총액순위.csv', index=False, encoding='utf-8-sig')
    
    print("\n" + "="*120)
    print(f"전체 {len(result_df)}개 종목 결과가 '시가총액순위.csv' 파일로 저장되었습니다.")
    
    if 'Market' in all_stocks.columns:
        print("\n주요 통계:")
        print(f"- KOSPI 종목 수: {len(all_stocks[all_stocks['Market'] == 'KOSPI'])}개")
        print(f"- KOSDAQ 종목 수: {len(all_stocks[all_stocks['Market'] == 'KOSDAQ'])}개")
        print(f"- 전체 시가총액: {all_stocks['시가총액(억원)'].sum():,}억원")
    
except Exception as e:
    print(f"오류 발생: {e}")
    import traceback
    traceback.print_exc()
