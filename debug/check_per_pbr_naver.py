"""
네이버 금융에서 포스코(005490) PER/PBR 크롤링
"""
import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime, timedelta

def get_stock_fundamentals_naver(stock_code):
    """네이버 금융에서 현재 PER/PBR 가져오기"""
    url = f'https://finance.naver.com/item/main.naver?code={stock_code}'

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # PER, PBR 정보는 주요 투자지표 영역에 있음
        today_list = soup.select('#_per')  # PER
        pbr_list = soup.select('#_pbr')    # PBR
        eps_list = soup.select('#_eps')    # EPS
        bps_list = soup.select('#_bps')    # BPS

        result = {}

        if today_list:
            result['PER'] = today_list[0].get_text(strip=True)

        if pbr_list:
            result['PBR'] = pbr_list[0].get_text(strip=True)

        if eps_list:
            result['EPS'] = eps_list[0].get_text(strip=True)

        if bps_list:
            result['BPS'] = bps_list[0].get_text(strip=True)

        return result

    except Exception as e:
        print(f"오류 발생: {e}")
        return None

def get_historical_per_pbr(stock_code):
    """네이버 금융에서 과거 PER/PBR 데이터 가져오기 (일별)"""
    # 네이버는 과거 PER/PBR 시계열을 직접 제공하지 않음
    # 대신 주가와 재무제표를 조합해서 계산해야 함
    print("참고: 네이버는 과거 PER/PBR 시계열 데이터를 직접 제공하지 않습니다.")
    print("분기별 PER/PBR은 각 분기말 기준으로 계산됩니다.")
    return None

if __name__ == '__main__':
    stock_code = '005490'  # 포스코

    print(f"=== {stock_code} 포스코 투자지표 (현재) ===\n")

    fundamentals = get_stock_fundamentals_naver(stock_code)

    if fundamentals:
        for key, value in fundamentals.items():
            print(f"{key}: {value}")
    else:
        print("데이터를 가져올 수 없습니다.")

    print("\n" + "="*60)
    print("\n분기별 PER/PBR을 확인하려면:")
    print("1. 각 분기말 주가 조회 (FinanceDataReader 사용)")
    print("2. 각 분기말 EPS, BPS 조회 (재무제표에서)")
    print("3. PER = 주가 / EPS, PBR = 주가 / BPS 계산")

    # 실제 계산 예시
    print("\n=== 분기별 PER/PBR 계산 예시 ===\n")

    import FinanceDataReader as fdr

    # 2024년 각 분기말 날짜
    quarter_ends = ['2024-03-29', '2024-06-28', '2024-09-30', '2024-12-31']

    print("날짜\t\t종가")
    print("-" * 40)

    for date in quarter_ends:
        try:
            # 해당 날짜 전후 데이터 가져오기
            df = fdr.DataReader(stock_code, date, date)
            if not df.empty:
                price = df['Close'].iloc[0]
                print(f"{date}\t{price:,}원")
            else:
                print(f"{date}\t데이터 없음")
        except Exception as e:
            print(f"{date}\t오류: {e}")

    print("\n참고: EPS와 BPS는 각 분기 재무제표에서 가져와야 합니다.")
    print("      현재 프로젝트의 financial_data.json에 분기별 재무 데이터가 있습니다.")
