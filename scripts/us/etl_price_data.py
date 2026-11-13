# -*- coding: utf-8 -*-
"""
주가(historical price) ETL 스크립트
- 1차 소스: Stooq (API 키 불필요, 안정적인 CSV 포맷, 대량 수집에 적합)
- 폴백 소스: yfinance (Stooq에서 누락되거나 빈 값일 때만 사용)
- 출력: ~/us_stock_data/price_jsons/{TICKER}.json (scripts/us/config.py)  (일봉 OHLCV, 날짜는 YYYYMMDD 정수)

기존 fundamentals 파이프라인(company_jsons/{TICKER}.json)과 동일한 YYYYMMDD
정수 날짜 규칙을 따르므로, 차트에서 두 데이터를 그대로 조인할 수 있습니다.

실행:
    python scripts/us/etl_price_data.py                # 상위 500개 종목 수집
    python scripts/us/etl_price_data.py --limit 5      # 상위 5개만 (스모크 테스트)
    python scripts/us/etl_price_data.py --tickers AAPL MSFT NVDA BRK-B GOOGL
    python scripts/us/etl_price_data.py --force        # 이미 있는 파일도 다시 받기
"""

import argparse
import json
import sys
import time
import math
from io import StringIO
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import TICKER_FILE, PRICE_DIR as OUT_DIR

STOOQ_URL = "https://stooq.com/q/d/l/?s={symbol}&i=d"
EXPECTED_COLS = ["Date", "Open", "High", "Low", "Close", "Volume"]
USER_AGENT = "Mozilla/5.0 (price-etl; +local research script)"


# ---------------------------------------------------------------------------
# 1. 종목 유니버스 선택
# ---------------------------------------------------------------------------
def load_ticker_mapping():
    """company_tickers.json 을 파일 순서대로 읽어 티커 리스트를 반환."""
    if not TICKER_FILE.exists():
        print("[ERROR] company_tickers.json 파일이 없습니다.")
        return []
    with open(TICKER_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    tickers = []
    seen = set()
    # 파일은 "0","1",... 순서로 시가총액/규모 순에 가깝게 정렬되어 있음
    for entry in data.values():
        t = entry.get("ticker")
        if t and t not in seen:
            seen.add(t)
            tickers.append(t)
    return tickers


def select_top_tickers(n=500):
    """상위 n개 종목 티커를 파일 순서대로 반환."""
    tickers = load_ticker_mapping()
    return tickers[:n]


# ---------------------------------------------------------------------------
# 2. 심볼 정규화 / 수집
# ---------------------------------------------------------------------------
def to_stooq_symbol(ticker):
    """Stooq 심볼 규칙: 소문자 + '.us' 접미사. 클래스주는 대시 유지(BRK-B -> brk-b.us)."""
    return ticker.lower() + ".us"


def _http_get(url):
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def fetch_stooq(ticker):
    """Stooq에서 일봉 CSV를 받아 DataFrame으로 반환. 실패 시 None."""
    symbol = to_stooq_symbol(ticker)
    url = STOOQ_URL.format(symbol=symbol)
    text = _http_get(url)

    # Stooq는 한도 초과/없는 종목일 때 CSV가 아닌 평문을 반환함 -> 데이터로 오인 금지
    first_line = text.strip().splitlines()[0] if text.strip() else ""
    if not first_line.startswith("Date,"):
        # 예: "Exceeded the daily hits limit", "No data", "N/D"
        if "Exceeded" in text:
            raise RuntimeError("Stooq 일일 한도 초과")
        return None

    df = pd.read_csv(StringIO(text))
    if df.empty or "Close" not in df.columns:
        return None
    return df


def fetch_yfinance(ticker):
    """폴백: yfinance로 전체 기간 일봉을 받아 Stooq와 동일한 컬럼 형태로 반환."""
    try:
        import yfinance as yf
    except ImportError:
        print("    (yfinance 미설치 - 폴백 건너뜀. `pip install yfinance`)")
        return None
    try:
        hist = yf.Ticker(ticker).history(period="max", auto_adjust=False)
    except Exception as e:
        print(f"    yfinance 오류: {e}")
        return None
    if hist is None or hist.empty:
        return None
    hist = hist.reset_index()
    # 컬럼명을 Stooq 포맷에 맞춤
    rename = {"Date": "Date", "Open": "Open", "High": "High",
              "Low": "Low", "Close": "Close", "Volume": "Volume"}
    df = hist.rename(columns=rename)
    df["Date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")
    return df[[c for c in EXPECTED_COLS if c in df.columns]]


# ---------------------------------------------------------------------------
# 3. 검증 / 정규화
# ---------------------------------------------------------------------------
def validate_and_normalize(df):
    """컬럼 검증 -> NaN 종가 제거 -> 정렬 -> 날짜 YYYYMMDD 정수 변환. row dict 리스트 반환."""
    missing = [c for c in ["Date", "Close"] if c not in df.columns]
    if missing:
        raise ValueError(f"필수 컬럼 누락: {missing}")

    df = df.copy()
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["Date", "Close"])
    df = df.sort_values("Date")

    rows = []
    for _, r in df.iterrows():
        rows.append({
            "date": int(r["Date"].strftime("%Y%m%d")),
            "open": _num(r.get("Open")),
            "high": _num(r.get("High")),
            "low": _num(r.get("Low")),
            "close": _num(r.get("Close")),
            "volume": _num(r.get("Volume"), as_int=True),
        })
    return rows


def _num(v, as_int=False):
    """NaN -> None, 그 외 float/int 변환."""
    try:
        if v is None or (isinstance(v, float) and math.isnan(v)):
            return None
        return int(v) if as_int else float(v)
    except (ValueError, TypeError):
        return None


def write_price_json(ticker, rows, source):
    OUT_DIR.mkdir(exist_ok=True)
    out = {
        "ticker": ticker,
        "source": source,
        "frequency": "daily",
        "prices": rows,
    }
    path = OUT_DIR / f"{ticker}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)


# ---------------------------------------------------------------------------
# 4. 메인 루프
# ---------------------------------------------------------------------------
def fetch_one(ticker, retries=3):
    """Stooq -> (실패 시) yfinance 순으로 시도. (rows, source) 반환, 모두 실패 시 (None, None)."""
    # Stooq (재시도 포함)
    for attempt in range(retries):
        try:
            df = fetch_stooq(ticker)
            if df is not None:
                rows = validate_and_normalize(df)
                if rows:
                    return rows, "stooq"
            break  # df is None -> 종목 없음, 재시도 무의미
        except RuntimeError as e:  # 한도 초과
            print(f"    {e} - {2 ** attempt}s 후 재시도")
            time.sleep(2 ** attempt)
        except (URLError, HTTPError) as e:
            print(f"    네트워크 오류: {e} - 재시도")
            time.sleep(1 + attempt)

    # 폴백: yfinance
    df = fetch_yfinance(ticker)
    if df is not None:
        rows = validate_and_normalize(df)
        if rows:
            return rows, "yfinance"

    return None, None


def main():
    ap = argparse.ArgumentParser(description="주가 일봉 ETL (Stooq + yfinance 폴백)")
    ap.add_argument("--limit", type=int, default=500, help="상위 N개 종목 (기본 500)")
    ap.add_argument("--tickers", nargs="+", help="특정 티커만 수집 (테스트용)")
    ap.add_argument("--force", action="store_true", help="기존 파일도 다시 수집")
    ap.add_argument("--sleep", type=float, default=0.7, help="Stooq 호출 간 대기(초)")
    args = ap.parse_args()

    if args.tickers:
        universe = args.tickers
    else:
        universe = select_top_tickers(args.limit)
    print(f"[OK] 대상 종목 {len(universe)}개")

    OUT_DIR.mkdir(exist_ok=True)
    n_stooq = n_yf = n_skip = n_fail = 0
    failed = []

    for i, ticker in enumerate(universe, 1):
        out_path = OUT_DIR / f"{ticker}.json"
        if out_path.exists() and not args.force:
            n_skip += 1
            continue

        print(f"[{i}/{len(universe)}] {ticker} ...", end=" ", flush=True)
        try:
            rows, source = fetch_one(ticker)
        except Exception as e:  # 한 종목 오류가 전체 실행을 막지 않도록
            print(f"예외: {e}")
            n_fail += 1
            failed.append(ticker)
            continue

        if rows:
            write_price_json(ticker, rows, source)
            if source == "stooq":
                n_stooq += 1
            else:
                n_yf += 1
            print(f"{source} ({len(rows)} rows)")
        else:
            n_fail += 1
            failed.append(ticker)
            print("실패")

        time.sleep(args.sleep)  # Stooq에 예의를 갖춘 rate limit

    print("\n=== 요약 ===")
    print(f"Stooq 성공:     {n_stooq}")
    print(f"yfinance 폴백:  {n_yf}")
    print(f"건너뜀(기존):   {n_skip}")
    print(f"실패:           {n_fail}")
    if failed:
        print("실패 종목:", ", ".join(failed[:50]) + (" ..." if len(failed) > 50 else ""))


if __name__ == "__main__":
    main()
