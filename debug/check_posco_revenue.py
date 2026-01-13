"""
포스코(005490) 분기별 매출 확인 예제
FinanceDataReader는 주가 데이터만 제공하므로, 네이버 금융에서 크롤링
"""
import requests
from bs4 import BeautifulSoup
import pandas as pd

def get_quarterly_revenue(stock_code):
    """네이버 금융에서 분기별 매출 데이터 가져오기"""
    url = f'https://finance.naver.com/item/main.naver?code={stock_code}'

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')

    # 분기별 실적 테이블 찾기
    table = soup.select_one('#content > div.section.cop_analysis > div.sub_section > table')

    if not table:
        print("재무 데이터를 찾을 수 없습니다.")
        return None

    # 테이블 데이터 파싱
    rows = table.select('tr')
    data = []

    for row in rows:
        cols = row.select('th, td')
        if cols:
            row_data = [col.get_text(strip=True) for col in cols]
            data.append(row_data)

    # DataFrame 생성
    if len(data) > 0:
        df = pd.DataFrame(data[1:], columns=data[0])
        return df

    return None

if __name__ == '__main__':
    stock_code = '005490'  # 포스코

    print(f"=== {stock_code} 포스코 분기별 재무 데이터 ===\n")

    df = get_quarterly_revenue(stock_code)

    if df is not None:
        print(df.to_string())

        # 매출액 행만 추출
        if '매출액' in df.iloc[:, 0].values:
            revenue_row = df[df.iloc[:, 0] == '매출액']
            print("\n=== 분기별 매출액 ===")
            print(revenue_row.to_string(index=False))
    else:
        print("데이터를 가져올 수 없습니다.")

    print("\n참고: FinanceDataReader는 주가 데이터만 제공합니다.")
    print("분기별 재무제표 데이터는 네이버 금융 크롤링 또는 OpenDart API를 사용하세요.")
