"""
US 파이프라인 공통 경로 설정.

대용량/재생성 가능한 데이터(SEC 원본 24GB, SQLite 스테이징 DB, 중간 JSON)는
OneDrive 동기화 충돌(*-laser4070.json)을 피하기 위해 OneDrive 밖에 둔다.

기본 위치: ~/us_stock_data  (환경변수 US_STOCK_DATA_DIR 로 변경 가능)

    us_stock_data/
    ├── raw_data/{YYYYqN}/       SEC Financial Statement Data Sets (sub.txt, num.txt)
    ├── sec_data.db              ETL 스테이징 DB (매 실행마다 재생성)
    ├── company_jsons/           ETL 출력 (etl_sec_data.py)
    ├── fixed_company_jsons/     Q4 보정 + known fixes 적용본 → prepare_us_data.py 입력
    └── price_jsons/             일봉 주가 (etl_price_data.py)
"""

import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

US_DATA_DIR = Path(os.environ.get("US_STOCK_DATA_DIR", Path.home() / "us_stock_data"))

RAW_DATA_DIR = US_DATA_DIR / "raw_data"
DB_PATH = US_DATA_DIR / "sec_data.db"
ETL_OUTPUT_DIR = US_DATA_DIR / "company_jsons"
FIXED_DIR = US_DATA_DIR / "fixed_company_jsons"
PRICE_DIR = US_DATA_DIR / "price_jsons"

# SEC CIK ↔ ticker 매핑 (https://www.sec.gov/files/company_tickers.json)
TICKER_FILE = REPO_ROOT / "us_company_tickers.json"
# 옛 CIK → 티커 별칭 (지주회사 재편 등 CIK 변경 시 과거 실적 연결). git 관리.
CIK_ALIAS_FILE = Path(__file__).resolve().parent / "cik_aliases.json"

PUBLIC_US_DIR = REPO_ROOT / "public" / "data" / "us_stocks"
PUBLIC_US_INDEX = REPO_ROOT / "public" / "data" / "us_company_index.json"
