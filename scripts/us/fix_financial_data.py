import json
import os
import pandas as pd
from pathlib import Path
from datetime import timedelta
import time
import warnings

warnings.simplefilter(action='ignore', category=FutureWarning)

# ==========================================
# 1. 설정
# ==========================================
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import ETL_OUTPUT_DIR as INPUT_DIR, FIXED_DIR as OUTPUT_DIR

os.makedirs(OUTPUT_DIR, exist_ok=True)

METRICS = ['revenue', 'operating_income', 'net_income', 'operating_cash_flow', 'eps', 'eps_basic', 'pretax_income']


def get_fiscal_label(date_int, fy_end_month):
    """
    날짜(YYYYMMDD 정수)와 회계연도 종료 월로부터 회계분기 레이블을 생성한다.
    etl_sec_data.py와 동일한 로직.
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

    if month > fy_end_month:
        fy = year + 1
    else:
        fy = year

    return (f"FY{fy}Q{quarter}", f"FY{fy}")

# Q3 누적 데이터를 찾기 위한 날짜 범위 (연간 보고일 기준 이전 ~3.3개월)
Q3_LOOKUP_WINDOW_DAYS = 100
# Q4 데이터를 매칭하기 위한 날짜 허용 범위 (연간 보고일 전후)
Q4_MATCH_WINDOW_DAYS = 10


def fix_company_json(file_path):
    """
    Q4 분기 데이터를 보정한다.
    Returns:
        int: 보정된 지표 수 (0이면 보정 없음)
        None: 데이터 부족으로 처리 불가
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"  [ERROR] 파일 읽기 실패 ({file_path.name}): {e}")
        return None

    if not data.get('annual') or not data.get('quarterly'):
        return None

    fy_end_month = data.get('fy_end_month', 12)

    df_annual = pd.DataFrame(data['annual'])
    df_quarterly = pd.DataFrame(data['quarterly'])

    # 날짜 변환
    df_annual['date_dt'] = pd.to_datetime(df_annual['date'].astype(str), format='%Y%m%d', errors='coerce')
    df_quarterly['date_dt'] = pd.to_datetime(df_quarterly['date'].astype(str), format='%Y%m%d', errors='coerce')

    df_annual = df_annual.dropna(subset=['date_dt'])
    df_quarterly = df_quarterly.dropna(subset=['date_dt'])

    if df_annual.empty or df_quarterly.empty:
        return None

    # 날짜순 정렬
    df_annual = df_annual.sort_values('date_dt').reset_index(drop=True)
    df_quarterly = df_quarterly.sort_values('date_dt').reset_index(drop=True)

    fixed_metric_count = 0
    new_rows = []

    # ---------------------------------------------------------
    # Q4 데이터 보정 로직
    # ---------------------------------------------------------
    for _, annual_row in df_annual.iterrows():
        annual_date = annual_row['date_dt']

        # 1. Q3(누적) 데이터 찾기 - 정렬 후 가장 가까운 날짜 선택
        q3_candidates = df_quarterly[
            (df_quarterly['qtrs'] == 3) &
            (df_quarterly['date_dt'] < annual_date) &
            (df_quarterly['date_dt'] > annual_date - timedelta(days=Q3_LOOKUP_WINDOW_DAYS))
        ]

        if q3_candidates.empty:
            continue

        q3_row = q3_candidates.sort_values('date_dt').iloc[-1]

        # 2. Q4(qtrs=1) 데이터 존재 여부 확인 (날짜 범위로 매칭)
        mask_q4 = (
            (df_quarterly['qtrs'] == 1) &
            (df_quarterly['date_dt'] >= annual_date - timedelta(days=Q4_MATCH_WINDOW_DAYS)) &
            (df_quarterly['date_dt'] <= annual_date + timedelta(days=Q4_MATCH_WINDOW_DAYS))
        )

        if df_quarterly[mask_q4].empty:
            # Case A: Q4 행이 없는 경우 -> 새로 생성
            fq_label, _ = get_fiscal_label(int(annual_row['date']), fy_end_month)
            new_row = {
                'date': annual_row['date'],
                'date_dt': annual_date,
                'qtrs': 1,
                'fiscal_quarter': fq_label,
                'type': 'single',
                'source': annual_row.get('source', 'Calculated'),
                'is_calculated': True
            }

            has_data = False
            for metric in METRICS:
                val_annual = annual_row.get(metric)
                val_q3 = q3_row.get(metric)

                if pd.notna(val_annual) and pd.notna(val_q3):
                    try:
                        calculated = val_annual - val_q3
                        new_row[metric] = calculated
                        has_data = True
                        fixed_metric_count += 1
                    except TypeError:
                        new_row[metric] = None
                else:
                    new_row[metric] = None

            if has_data:
                new_rows.append(new_row)

        else:
            # Case B: Q4 행은 있지만 값이 비어있는 경우 -> 채워 넣기
            q4_idx = df_quarterly[mask_q4].index[0]

            for metric in METRICS:
                val_annual = annual_row.get(metric)
                val_q3 = q3_row.get(metric)

                if metric not in df_quarterly.columns:
                    df_quarterly[metric] = None

                val_q4_existing = df_quarterly.at[q4_idx, metric]

                if pd.isna(val_q4_existing) and pd.notna(val_annual) and pd.notna(val_q3):
                    try:
                        calculated = val_annual - val_q3
                        df_quarterly.at[q4_idx, metric] = calculated
                        df_quarterly.at[q4_idx, 'is_calculated'] = True
                        fixed_metric_count += 1
                    except TypeError:
                        pass

    # 새로 만든 행이 있으면 합치기
    if new_rows:
        df_new = pd.DataFrame(new_rows)
        df_quarterly = pd.concat([df_quarterly, df_new], ignore_index=True)
        df_quarterly = df_quarterly.sort_values('date_dt')

    # 저장 준비 - 임시 컬럼 제거
    df_quarterly = df_quarterly.drop(columns=['date_dt'], errors='ignore')

    quarterly_records = df_quarterly.astype(object).where(pd.notnull(df_quarterly), None).to_dict(orient='records')

    data['quarterly'] = quarterly_records

    output_path = OUTPUT_DIR / file_path.name
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    return fixed_metric_count


def main():
    if not INPUT_DIR.exists():
        print(f"  [ERROR] 입력 폴더가 없습니다: {INPUT_DIR}")
        return

    # 입력(company_jsons)에 없는 잔여 출력 제거 — 티커 변경 시 옛 파일이 배포되는 것 방지
    stale = list(OUTPUT_DIR.glob('*.json'))
    for p in stale:
        p.unlink()
    print(f"기존 보정 출력 {len(stale)}개 삭제 후 재생성")

    json_files = list(INPUT_DIR.glob('*.json'))
    total_files = len(json_files)
    print(f"총 {total_files}개 기업의 데이터 보정 (누락분 생성 포함) 시작...")

    start_time = time.time()
    processed_count = 0
    fixed_files_count = 0
    total_metrics_fixed = 0
    skipped_count = 0

    for file_path in json_files:
        result = fix_company_json(file_path)
        processed_count += 1

        if result is None:
            skipped_count += 1
        elif result > 0:
            fixed_files_count += 1
            total_metrics_fixed += result

        if processed_count % 100 == 0:
            print(f"   Progress: {processed_count}/{total_files}...")

    elapsed = time.time() - start_time
    print(f"\n완료! ({elapsed:.1f}초)")
    print(f"  처리: {total_files}개 / 보정: {fixed_files_count}개 / 건너뜀: {skipped_count}개")
    print(f"  보정된 지표 수: {total_metrics_fixed}개")
    print(f"  결과 위치: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
