"""
포스코(005490) PER/PBR 확인 예제
"""
import FinanceDataReader as fdr
import pandas as pd

def check_per_pbr_methods():
    """여러 방법으로 PER/PBR 데이터 조회 시도"""

    stock_code = '005490'

    print(f"=== {stock_code} 포스코 PER/PBR 조회 ===\n")

    # 방법 1: 주가 데이터로 계산 (FinanceDataReader)
    print("1. 주가 데이터 조회:")
    try:
        df_price = fdr.DataReader(stock_code, '2024-01-01')
        print(df_price.tail())
        print(f"\n컬럼: {df_price.columns.tolist()}")
        print("=> FinanceDataReader는 주가만 제공하며 PER/PBR은 포함되지 않음\n")
    except Exception as e:
        print(f"오류: {e}\n")

    # 방법 2: pykrx 시도
    print("\n2. pykrx로 PER/PBR 조회 시도:")
    try:
        from pykrx import stock

        # 특정 날짜의 시장 전체 데이터
        df_market = stock.get_market_fundamental('20241220', market='ALL')
        if not df_market.empty and stock_code in df_market.index:
            print(f"\n포스코 데이터:")
            print(df_market.loc[stock_code])
        else:
            print("데이터를 찾을 수 없습니다.")

    except Exception as e:
        print(f"오류: {e}")

    # 방법 3: 개별 종목 시계열 데이터
    print("\n3. pykrx 시계열 데이터 조회:")
    try:
        from pykrx import stock
        df_series = stock.get_market_fundamental('20240101', '20241231', stock_code)
        if not df_series.empty:
            print(df_series.tail(10))
            print("\n분기별 평균:")
            df_series['quarter'] = pd.to_datetime(df_series.index).to_period('Q')
            quarterly = df_series.groupby('quarter')[['PER', 'PBR']].mean()
            print(quarterly)
        else:
            print("데이터가 비어있습니다.")
    except Exception as e:
        print(f"오류: {e}")

if __name__ == '__main__':
    check_per_pbr_methods()

    print("\n" + "="*60)
    print("결론:")
    print("- FinanceDataReader: 주가 데이터만 제공 (PER/PBR 없음)")
    print("- pykrx: PER/PBR 제공, 하지만 현재 버전에 이슈가 있을 수 있음")
    print("- 대안: 네이버 금융 크롤링 또는 KRX API 직접 사용")
