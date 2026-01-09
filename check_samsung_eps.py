"""Check Samsung EPS data"""
import json
import sys
import io

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('eps_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

samsung = data.get('005930')

if samsung:
    print(f"=== 삼성전자 EPS 데이터 ===\n")
    print(f"회사명: {samsung['name']}")
    print(f"재무제표 종류: {samsung['statement_type']}")
    print(f"총 레코드: {len(samsung['history'])}개\n")

    # 2023-2024 데이터
    print("2023-2024 EPS:")
    for rec in samsung['history']:
        if rec['year'] in [2023, 2024]:
            eps = rec.get('eps')
            if eps is not None:
                print(f"  {rec['year']} {rec['quarter']}: {eps:,.0f}원")
else:
    print("삼성전자 데이터를 찾을 수 없습니다.")

# 전체 통계
print(f"\n=== 전체 통계 ===")
print(f"총 기업 수: {len(data)}")

byuldo = sum(1 for c in data.values() if c.get('statement_type') == '별도')
yeongyeol = sum(1 for c in data.values() if c.get('statement_type') == '연결')

print(f"연결: {yeongyeol}개")
print(f"별도: {byuldo}개")
