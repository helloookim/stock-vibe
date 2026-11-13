import pandas as pd
import sqlite3
import json
import os
from pathlib import Path
import time
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))

# ==========================================
# 1. 환경 설정
# ==========================================
from config import RAW_DATA_DIR, TICKER_FILE, DB_PATH, ETL_OUTPUT_DIR as OUTPUT_DIR, CIK_ALIAS_FILE
import re

# Windows 예약 장치명(CON, PRN 등)은 {ticker}.json 파일로 쓸 수 없음
WINDOWS_RESERVED_NAMES = re.compile(r'^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$', re.IGNORECASE)

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ETF 제외 목록 (금융 데이터가 없는 ETF)
EXCLUDED_TICKERS = {'GLD', 'IAU'}

# qtrs 값에 대응하는 기간 유형 레이블
QTRS_TYPE_MAP = {1: "single", 2: "cumulative_6m", 3: "cumulative_9m"}

# ==========================================
# 태그 매핑 (확장판 v3)
#
# 여러 태그가 같은 metric에 매핑될 때, TAG_PRIORITY로 우선권 결정
# ==========================================
TAG_MAP = {
    # Revenue - US-GAAP
    'RevenueFromContractWithCustomerExcludingAssessedTax': 'revenue',
    'Revenues': 'revenue',
    'SalesRevenueNet': 'revenue',
    'SalesRevenueGoodsNet': 'revenue',
    'SalesRevenueServicesNet': 'revenue',
    'SalesRevenueProductsNet': 'revenue',
    'RevenueFromContractWithCustomerIncludingAssessedTax': 'revenue',
    'SalesAndOtherOperatingRevenueIncludingSalesBasedTaxes': 'revenue',         # XOM (pre-2020), 에너지
    'RevenuesNetOfInterestExpense': 'revenue',                                 # 은행 (JPM, GS, WFC)
    'TotalRevenuesNetOfInterestExpense': 'revenue',                            # AXP 구 양식
    # Revenue - IFRS
    'Revenue': 'revenue',                                                      # IFRS (SCCO 등)

    # Operating Income (직접 보고하는 기업용)
    'OperatingIncomeLoss': 'operating_income',

    # Costs and Expenses (operating_income 미보고 기업 → revenue - costs로 파생)
    'CostsAndExpenses': 'costs_and_expenses',

    # Cost Components (operating_income 개별 파생: revenue - COGS - SGA - R&D)
    'CostOfGoodsAndServicesSold': 'cost_of_revenue',                             # 대부분 기업 (LLY, JNJ, PFE, MRK 등)
    'CostOfRevenue': 'cost_of_revenue',                                          # IBM 등
    'CostOfGoodsSold': 'cost_of_revenue',                                        # 구 양식
    'SellingGeneralAndAdministrativeExpense': 'sga',                              # 거의 모든 기업
    'ResearchAndDevelopmentExpense': 'rd_expense',                                # IBM, MRK, HON 등
    'ResearchAndDevelopmentExpenseExcludingAcquiredInProcessCost': 'rd_expense',  # LLY, JNJ, PFE (제약)

    # Pretax Income
    'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest': 'pretax_income',
    'IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments': 'pretax_income',

    # Net Income - US-GAAP
    'NetIncomeLoss': 'net_income',
    'ProfitLoss': 'net_income',
    'NetIncomeLossAvailableToCommonStockholdersBasic': 'net_income',
    'IncomeLossFromContinuingOperations': 'net_income',                        # TMO, BKNG 구 양식
    # Net Income - IFRS
    'ProfitLossAttributableToOwnersOfParent': 'net_income',                    # IFRS (SCCO 등)

    # EPS - US-GAAP
    'EarningsPerShareDiluted': 'eps',
    'EarningsPerShareBasic': 'eps_basic',
    'EarningsPerShareBasicAndDiluted': 'eps',                                  # TSLA 적자기, 소형주
    # EPS - IFRS
    'BasicEarningsLossPerShare': 'eps_basic',                                  # IFRS (SCCO 등)
    'DilutedEarningsLossPerShare': 'eps',                                      # IFRS (SCCO 등)

    # Operating Cash Flow - US-GAAP
    'NetCashProvidedByUsedInOperatingActivities': 'operating_cash_flow',
    'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations': 'operating_cash_flow',
    # Operating Cash Flow - IFRS
    'CashFlowsFromUsedInOperatingActivities': 'operating_cash_flow',           # IFRS (SCCO 등)

    # Balance Sheet
    'Assets': 'total_assets',
    'StockholdersEquity': 'total_equity',
    'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest': 'total_equity',
}

# 같은 metric에 여러 태그 → 우선순위 (리스트 앞쪽 = 높은 우선순위)
TAG_PRIORITY = {
    'revenue': [
        'RevenueFromContractWithCustomerExcludingAssessedTax',
        'Revenues',
        'SalesRevenueNet',
        'SalesRevenueGoodsNet',
        'SalesRevenueServicesNet',
        'SalesRevenueProductsNet',
        'RevenueFromContractWithCustomerIncludingAssessedTax',
        'SalesAndOtherOperatingRevenueIncludingSalesBasedTaxes',
        'RevenuesNetOfInterestExpense',
        'TotalRevenuesNetOfInterestExpense',
        'Revenue',
    ],
    'net_income': [
        'NetIncomeLoss',
        'ProfitLoss',
        'NetIncomeLossAvailableToCommonStockholdersBasic',
        'IncomeLossFromContinuingOperations',
        'ProfitLossAttributableToOwnersOfParent',
    ],
    'eps': [
        'EarningsPerShareDiluted',
        'EarningsPerShareBasicAndDiluted',
        'DilutedEarningsLossPerShare',
    ],
    'eps_basic': [
        'EarningsPerShareBasic',
        'EarningsPerShareBasicAndDiluted',
        'BasicEarningsLossPerShare',
    ],
    'operating_cash_flow': [
        'NetCashProvidedByUsedInOperatingActivities',
        'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations',
        'CashFlowsFromUsedInOperatingActivities',
    ],
    'total_equity': [
        'StockholdersEquity',
        'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest',
    ],
    'pretax_income': [
        'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest',
        'IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments',
    ],
    'cost_of_revenue': [
        'CostOfGoodsAndServicesSold',
        'CostOfRevenue',
        'CostOfGoodsSold',
    ],
    'rd_expense': [
        'ResearchAndDevelopmentExpense',
        'ResearchAndDevelopmentExpenseExcludingAcquiredInProcessCost',
    ],
}

TARGET_TAGS = list(TAG_MAP.keys())

# EPS 태그 목록 (세그먼트 특별 처리용)
# VISA, GOOG, BRK 등 다중 주식 클래스 기업은 EPS를 세그먼트로만 보고
EPS_TAGS = [tag for tag, metric in TAG_MAP.items() if metric in ('eps', 'eps_basic')]

# ==========================================
# 2. 유틸리티 함수
# ==========================================
def load_ticker_mapping():
    if not TICKER_FILE.exists():
        print("Error: company_tickers.json 파일이 없습니다.")
        return {}
    try:
        with open(TICKER_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        # 한 CIK 에 여러 티커(보통주/우선주/워런트 등)가 있으면 순위가 가장 높은
        # (키 숫자가 가장 작은) 티커 = 주 상장 보통주를 사용한다.
        # (과거엔 마지막 항목이 덮어써서 GME→GME-WT, CWEN→CWEN-A 같은 오매핑 발생)
        cik_to_ticker = {}
        for key in sorted(data.keys(), key=int):
            entry = data[key]
            cik_to_ticker.setdefault(entry['cik_str'], entry['ticker'])
        print(f"[OK] {len(cik_to_ticker)}개의 티커 정보를 로드했습니다.")

        # CIK 별칭: 지주회사 재편 등으로 같은 티커가 새 CIK 로 옮겨간 경우
        # 옛 CIK 의 과거 실적을 같은 티커로 합친다 (예: XOM 34088 → 2115436).
        # cik_aliases.json 은 update_us_financials.py --refresh-tickers 가 자동 누적.
        active_tickers = set(cik_to_ticker.values())
        n_alias = 0
        if CIK_ALIAS_FILE.exists():
            with open(CIK_ALIAS_FILE, 'r', encoding='utf-8') as f:
                aliases = json.load(f)
            for old_cik, info in aliases.items():
                old_cik = int(old_cik)
                # merge: true 로 검토 완료된 것만 (null = 검토 대기, false = 다른 회사)
                if info.get('merge') is not True:
                    continue
                if old_cik not in cik_to_ticker and info['ticker'] in active_tickers:
                    cik_to_ticker[old_cik] = info['ticker']
                    n_alias += 1
        print(f"[OK] CIK 별칭 {n_alias}개 적용")
        return cik_to_ticker
    except Exception as e:
        print(f"[ERROR] 티커 파일 로딩 실패: {e}")
        return {}

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS financials")
    cur.execute("""
        CREATE TABLE financials (
            cik INTEGER,
            name TEXT,
            date INTEGER,
            qtrs INTEGER,
            tag TEXT,
            metric TEXT,
            value REAL,
            form TEXT,
            source TEXT
        )
    """)
    cur.execute("CREATE INDEX idx_cik ON financials (cik)")
    cur.execute("CREATE INDEX idx_date ON financials (date)")
    conn.commit()
    return conn

# ==========================================
# 3. ETL 프로세스
# ==========================================
def process_folder(folder_path, conn):
    start_time = time.time()
    sub_path = folder_path / 'sub.txt'
    num_path = folder_path / 'num.txt'
    source_folder = folder_path.name

    if not sub_path.exists() or not num_path.exists():
        return

    try:
        # SUB 로딩
        sub = pd.read_csv(sub_path, sep='\t', encoding='utf-8',
                          usecols=['adsh', 'cik', 'name', 'form'])
        sub = sub[sub['form'].isin(['10-K', '10-Q', '20-F', '40-F'])]

        # NUM 로딩
        num = pd.read_csv(num_path, sep='\t', encoding='utf-8',
                          usecols=['adsh', 'tag', 'ddate', 'qtrs', 'value', 'segments'])

        # --- 1) 세그먼트 없는 일반 데이터 ---
        num_no_seg = num[
            (num['tag'].isin(TARGET_TAGS)) &
            (num['segments'].isna()) &
            (num['qtrs'].isin([1, 2, 3, 4]))
        ]

        # --- 2) EPS: 세그먼트가 있어도 CommonClassA면 허용 (VISA, GOOG 등) ---
        num_eps_seg = num[
            (num['tag'].isin(EPS_TAGS)) &
            (num['segments'].notna()) &
            (num['segments'].str.contains('CommonClassA', case=False, na=False)) &
            (num['qtrs'].isin([1, 2, 3, 4]))
        ].copy()
        # 세그먼트 기반 EPS는 세그먼트 없는 EPS가 없는 경우에만 사용하므로 일단 합침
        # (중복은 나중에 resolve_duplicates에서 처리)
        num_eps_seg['segments'] = pd.NA  # 세그먼트 컬럼 통일

        # 합치기
        num_filtered = pd.concat([num_no_seg, num_eps_seg], ignore_index=True)

        # 동일 (adsh, tag, ddate, qtrs)에 세그먼트 없는 값과 있는 값 양쪽이면 세그먼트 없는 것 우선
        num_filtered = num_filtered.drop_duplicates(
            subset=['adsh', 'tag', 'ddate', 'qtrs'], keep='first'
        )

        # 병합
        df = pd.merge(num_filtered, sub, on='adsh', how='inner')

        # 가공
        df['metric'] = df['tag'].map(TAG_MAP)
        df['cik'] = df['cik'].astype(int)
        df['source'] = source_folder

        df_save = df[['cik', 'name', 'ddate', 'qtrs', 'tag', 'metric', 'value', 'form', 'source']]
        df_save = df_save.rename(columns={'ddate': 'date'})

        # DB 저장
        df_save.to_sql('financials', conn, if_exists='append', index=False)

        elapsed = time.time() - start_time
        print(f"   [OK] Inserted {len(df_save):5,} rows from {source_folder} ({elapsed:.2f}s)")

    except Exception as e:
        print(f"   [ERROR] Error processing {source_folder}: {e}")


def resolve_duplicates(df):
    """
    같은 (date, qtrs, metric)에 여러 태그가 매핑된 경우,
    TAG_PRIORITY에 따라 우선순위가 높은 태그의 값만 남긴다.
    """
    results = []

    for metric, priority_list in TAG_PRIORITY.items():
        metric_df = df[df['metric'] == metric]
        if metric_df.empty:
            continue

        # 태그별 우선순위 부여
        tag_rank = {tag: i for i, tag in enumerate(priority_list)}
        metric_df = metric_df.copy()
        metric_df['rank'] = metric_df['tag'].map(tag_rank).fillna(len(priority_list))

        # 각 (date, qtrs) 그룹에서 가장 우선순위 높은 행만 남김
        metric_df = metric_df.sort_values('rank')
        metric_df = metric_df.drop_duplicates(subset=['date', 'qtrs'], keep='first')
        metric_df = metric_df.drop(columns=['rank'])
        results.append(metric_df)

    # priority 목록에 없는 metric(단일 태그 metric)은 그대로 유지
    metrics_with_priority = set(TAG_PRIORITY.keys())
    other_df = df[~df['metric'].isin(metrics_with_priority)]
    if not other_df.empty:
        other_df = other_df.drop_duplicates(subset=['date', 'qtrs', 'metric'], keep='last')
        results.append(other_df)

    if not results:
        return df.iloc[0:0]

    return pd.concat(results, ignore_index=True)


def filter_earliest_source(df):
    """
    같은 (date, qtrs)에 여러 source 폴더의 데이터가 있을 때,
    가장 이른 source(원본 제출)만 유지하여 cross-vintage 혼합 방지.
    예: LLY FY2017 데이터가 2018q1(원본), 2019q1(비교), 2020q1(재작성)에 존재 시
        2018q1 데이터만 유지하여 Elanco 분사 전후 데이터 혼합 방지.
    """
    earliest = df.groupby(['date', 'qtrs'])['source'].transform('min')
    return df[df['source'] == earliest].copy()


def derive_operating_income(pivot_df):
    """
    OperatingIncomeLoss를 보고하지 않는 기업의 operating_income 파생 계산.
    3단계 우선순위:
      1순위: 직접 보고된 OperatingIncomeLoss (이미 있으면 유지)
      2순위: revenue - costs_and_expenses (XOM, CVX, DIS 등)
      3순위: revenue - cost_of_revenue - sga - rd_expense (LLY, JNJ, IBM, PFE 등)
             rd_expense 없으면 revenue - cost_of_revenue - sga (NKE 등)
    """
    has_oi = 'operating_income' in pivot_df.columns
    has_rev = 'revenue' in pivot_df.columns
    has_cost = 'costs_and_expenses' in pivot_df.columns
    has_cogs = 'cost_of_revenue' in pivot_df.columns
    has_sga = 'sga' in pivot_df.columns
    has_rd = 'rd_expense' in pivot_df.columns

    # --- 2순위: revenue - costs_and_expenses ---
    if has_rev and has_cost:
        if has_oi:
            mask = pivot_df['operating_income'].isna()
            pivot_df.loc[mask, 'operating_income'] = (
                pivot_df.loc[mask, 'revenue'].astype(float) -
                pivot_df.loc[mask, 'costs_and_expenses'].astype(float)
            )
        else:
            pivot_df['operating_income'] = (
                pivot_df['revenue'].astype(float) -
                pivot_df['costs_and_expenses'].astype(float)
            )

    # --- 3순위: revenue - cost_of_revenue - sga - rd_expense ---
    if has_rev and has_cogs and has_sga:
        if 'operating_income' not in pivot_df.columns:
            pivot_df['operating_income'] = None

        mask = pivot_df['operating_income'].isna()
        if mask.any():
            rev = pivot_df.loc[mask, 'revenue'].astype(float)
            cogs = pivot_df.loc[mask, 'cost_of_revenue'].astype(float)
            sga_val = pivot_df.loc[mask, 'sga'].astype(float)

            if has_rd:
                rd_val = pivot_df.loc[mask, 'rd_expense'].astype(float)
                derived = rev - cogs - sga_val - rd_val
                # R&D가 NaN인 행은 revenue - cogs - sga로 폴백
                rd_null = pivot_df.loc[mask, 'rd_expense'].isna()
                derived[rd_null] = rev[rd_null] - cogs[rd_null] - sga_val[rd_null]
            else:
                # R&D 컬럼 자체가 없는 기업 (NKE 등)
                derived = rev - cogs - sga_val

            pivot_df.loc[mask, 'operating_income'] = derived

    # 중간 계산용 컬럼 제거 (JSON 출력에 포함되지 않도록)
    drop_cols = ['costs_and_expenses', 'cost_of_revenue', 'sga', 'rd_expense']
    existing_drop = [c for c in drop_cols if c in pivot_df.columns]
    if existing_drop:
        pivot_df = pivot_df.drop(columns=existing_drop)

    return pivot_df


def derive_q4_from_annual(pivot_df):
    """
    Q4 단일분기(qtrs=1) 데이터가 없는 경우, 연간(qtrs=4) - 누적Q3(qtrs=3)로 파생.
    10-K는 연간 합계만 보고하고 Q4 단독 수치를 제공하지 않는 경우가 많음.
    operating_income 외 다른 metric도 동일하게 처리.
    """
    if 'operating_income' not in pivot_df.columns:
        return pivot_df

    # 연간 데이터 (qtrs=4)
    annual = pivot_df[pivot_df['qtrs'] == 4][['date', 'operating_income']].copy()
    annual = annual.rename(columns={'operating_income': 'oi_annual'})

    # 누적 Q3 데이터 (qtrs=3)
    q3_cum = pivot_df[pivot_df['qtrs'] == 3][['date', 'operating_income']].copy()
    q3_cum = q3_cum.rename(columns={'operating_income': 'oi_q3cum'})

    # Q4 단일분기 중 operating_income이 null인 행
    q4_mask = (pivot_df['qtrs'] == 1) & (pivot_df['operating_income'].isna())
    if not q4_mask.any():
        return pivot_df

    q4_dates = pivot_df.loc[q4_mask, 'date'].values

    for q4_date in q4_dates:
        # 연간 데이터에서 같은 날짜 찾기 (예: 20231231)
        annual_row = annual[annual['date'] == q4_date]
        if annual_row.empty or pd.isna(annual_row['oi_annual'].values[0]):
            continue

        # 해당 연도의 Q3 누적 날짜 계산 (12월말→9월말, 6월말→3월말 등)
        q4_date_int = int(q4_date)
        year = q4_date_int // 10000
        month = (q4_date_int % 10000) // 100

        # Q3 누적 = 3개월 전 (일반적으로 연도말 - 3개월)
        if month <= 3:
            q3_month = month + 9
            q3_year = year - 1
        else:
            q3_month = month - 3
            q3_year = year

        # 월말 날짜 결정
        if q3_month in (1, 3, 5, 7, 8, 10, 12):
            q3_day = 31
        elif q3_month in (4, 6, 9, 11):
            q3_day = 30
        else:
            q3_day = 28

        q3_date = q3_year * 10000 + q3_month * 100 + q3_day

        q3_row = q3_cum[q3_cum['date'] == q3_date]
        if q3_row.empty or pd.isna(q3_row['oi_q3cum'].values[0]):
            continue

        derived_q4 = float(annual_row['oi_annual'].values[0]) - float(q3_row['oi_q3cum'].values[0])

        # pivot_df에 반영
        idx = pivot_df.index[(pivot_df['date'] == q4_date) & (pivot_df['qtrs'] == 1)]
        if len(idx) > 0:
            pivot_df.loc[idx[0], 'operating_income'] = derived_q4

    return pivot_df


def detect_fy_end_month(annual_df):
    """
    연간 보고서의 날짜에서 회계연도 종료 월을 감지한다.
    mode(최빈값)를 사용하여 회계연도 변경이 있는 기업도 안정적으로 처리.
    연간 데이터가 없으면 12월(달력 연도) 기본값 반환.
    """
    if annual_df.empty or 'date' not in annual_df.columns:
        return 12

    months = annual_df['date'].apply(lambda d: int(d) % 10000 // 100)
    mode_result = months.mode()

    if mode_result.empty:
        return 12

    return int(mode_result.iloc[0])


def get_fiscal_label(date_int, fy_end_month):
    """
    날짜(YYYYMMDD 정수)와 회계연도 종료 월로부터 회계분기 레이블을 생성한다.

    Returns:
        tuple: (fiscal_quarter_str, fiscal_year_str)
               예: ("FY2024Q1", "FY2024")
    """
    date_int = int(date_int)
    year = date_int // 10000
    month = (date_int % 10000) // 100

    months_after = (month - fy_end_month) % 12

    if months_after == 0:
        quarter = 4
    elif months_after <= 3:
        quarter = 1
    elif months_after <= 6:
        quarter = 2
    else:
        quarter = 3

    # 회계연도 결정: FY-end 월 이후이면 다음 FY에 속함
    if month > fy_end_month:
        fy = year + 1
    else:
        fy = year

    return (f"FY{fy}Q{quarter}", f"FY{fy}")


# ==========================================
# 4. JSON 내보내기
# ==========================================
def export_to_json(conn, cik_map):
    print("\n[START] 회사별 JSON 파일 생성 시작...")

    # 이전 실행의 잔여 파일(티커 변경/매핑 변경으로 더 이상 생성되지 않는 파일) 제거
    stale = list(OUTPUT_DIR.glob('*.json'))
    for p in stale:
        p.unlink()
    print(f"   기존 출력 {len(stale)}개 삭제 후 재생성")

    # 티커 단위로 CIK 묶기 (CIK 별칭이 있으면 한 티커에 CIK 여러 개)
    ciks_df = pd.read_sql(
        "SELECT cik, name, MAX(source) AS last_source FROM financials GROUP BY cik, name", conn)
    groups = {}
    for _, row in ciks_df.iterrows():
        ticker = cik_map.get(int(row['cik']))
        if not ticker or ticker in EXCLUDED_TICKERS or WINDOWS_RESERVED_NAMES.match(ticker):
            continue
        groups.setdefault(ticker, []).append((int(row['cik']), row['name'], row['last_source']))

    total_companies = len(groups)
    exported = 0

    for ticker, members in groups.items():
        # 대표 CIK/회사명 = 가장 최근 제출이 있는 CIK (재편 후 새 법인)
        cik, name, _ = max(members, key=lambda m: m[2])
        cik_list = ','.join(str(c) for c in sorted({m[0] for m in members}))

        query = f"SELECT date, qtrs, tag, metric, value, form, source FROM financials WHERE cik IN ({cik_list}) ORDER BY date"
        df = pd.read_sql(query, conn)

        if df.empty:
            continue

        # 원본 제출 데이터만 유지 (cross-vintage 혼합 방지)
        df = filter_earliest_source(df)

        # 우선순위 기반 중복 제거
        df = resolve_duplicates(df)

        try:
            # Pivot (metric을 컬럼으로)
            pivot_df = df.pivot_table(
                index=['date', 'qtrs'],
                columns='metric',
                values='value',
                aggfunc='first'
            ).reset_index()

            # Source, Form 정보 매핑
            source_map = df[['date', 'qtrs', 'form', 'source']].drop_duplicates(subset=['date', 'qtrs'])
            pivot_df = pd.merge(pivot_df, source_map, on=['date', 'qtrs'], how='left')

        except Exception:
            continue

        # operating_income 파생 계산 (revenue - costs_and_expenses)
        pivot_df = derive_operating_income(pivot_df)

        # Q4 단일분기 파생 (연간 - 누적Q3)
        pivot_df = derive_q4_from_annual(pivot_df)

        # 회계연도 종료 월 감지
        annual_for_fy = pivot_df[
            (pivot_df['qtrs'] == 4) &
            (pivot_df['form'].isin(['10-K', '20-F', '40-F']))
        ]
        fy_end_month = detect_fy_end_month(annual_for_fy)

        # 회계연도/분기 레이블 생성
        pivot_df['fiscal_quarter'] = pivot_df['date'].apply(
            lambda d: get_fiscal_label(int(d), fy_end_month)[0]
        )
        pivot_df['fiscal_year'] = pivot_df['date'].apply(
            lambda d: get_fiscal_label(int(d), fy_end_month)[1]
        )
        pivot_df['type'] = pivot_df['qtrs'].map(QTRS_TYPE_MAP)

        # NaN 처리
        pivot_df = pivot_df.astype(object).where(pd.notnull(pivot_df), None)

        # 연간/분기 분리 (연간은 10-K/20-F/40-F만 — TTM 데이터 제외)
        annual_df = pivot_df[
            (pivot_df['qtrs'] == 4) &
            (pivot_df['form'].isin(['10-K', '20-F', '40-F']))
        ]
        annual_data = annual_df.drop(columns=['qtrs', 'form', 'fiscal_quarter', 'type']).to_dict(orient='records')
        quarterly_data = pivot_df[pivot_df['qtrs'].isin([1, 2, 3])].drop(columns=['form', 'fiscal_year']).to_dict(orient='records')

        final_json = {
            "ticker": ticker,
            "cik": cik,
            "name": name,
            "fy_end_month": fy_end_month,
            "annual": annual_data,
            "quarterly": quarterly_data
        }

        with open(OUTPUT_DIR / f"{ticker}.json", 'w', encoding='utf-8') as f:
            json.dump(final_json, f, indent=4)

        exported += 1
        if exported % 500 == 0:
            print(f"   Progress: {exported}/{total_companies}...")

    print(f"\n[DONE] {exported}개 회사 JSON 파일 생성 완료. 위치: {OUTPUT_DIR}")


def main():
    export_only = '--export-only' in sys.argv  # 기존 sec_data.db 재사용, JSON export 만
    cik_map = load_ticker_mapping()
    if not cik_map:
        return

    if export_only:
        if not DB_PATH.exists():
            print(f"[ERROR] --export-only 인데 DB 가 없습니다: {DB_PATH}")
            return
        conn = sqlite3.connect(DB_PATH)
        export_to_json(conn, cik_map)
        conn.close()
        return

    conn = init_db()

    if not RAW_DATA_DIR.exists():
        print(f"[ERROR] raw_data 폴더가 없습니다: {RAW_DATA_DIR}")
        return

    folders = sorted([f for f in RAW_DATA_DIR.iterdir() if f.is_dir()])

    print(f"[START] {len(folders)}개 폴더 처리 시작...")
    for folder in folders:
        process_folder(folder, conn)

    export_to_json(conn, cik_map)
    conn.close()


if __name__ == "__main__":
    main()
