"""
US 데이터 수동 보정 (KR 쪽 fix_outliers.py KNOWN_FIXES 와 같은 역할).

ETL 을 처음부터 다시 돌리면 public/ 에 직접 손댄 수정이 사라지므로,
여기 등록해 두고 fix_financial_data.py 다음 단계에서 매번 재적용한다.

규칙
- 대상 레코드는 (ticker, date, qtrs) 로 정확히 지정
- 현재 값이 null 일 때만 채운다 → SEC 가 나중에 원본을 고치면 그 값을 존중
- 지정한 필드 외에는 절대 건드리지 않는다

실행:
    python scripts/us/known_fixes.py            # dry-run
    python scripts/us/known_fixes.py --fix      # FIXED_DIR 에 적용
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import FIXED_DIR  # noqa: E402

KNOWN_FIXES = [
    {
        # SEC bulk 데이터셋의 Broadcom FY2026Q1 10-Q (0001730168-26-000016) 는
        # 현금흐름표 태그만 있고 손익계산서 태그가 num.txt 에 아예 없음.
        # FY2026Q2 6개월 누적 − FY2026Q2 단일분기로 산출 (net_income 교차검증 일치).
        # EPS 는 기간 합산이 안전하지 않아 null 유지.
        "ticker": "AVGO",
        "date": 20260131,
        "qtrs": 1,
        "fields": {
            "revenue": 19311000000.0,
            "operating_income": 8563000000.0,
            "pretax_income": 8195000000.0,
        },
        "mark_calculated": True,
    },
]


def apply_fixes(write=False, base_dir=FIXED_DIR):
    applied = 0
    for fx in KNOWN_FIXES:
        path = Path(base_dir) / f"{fx['ticker']}.json"
        if not path.exists():
            print(f"  [SKIP] {fx['ticker']}: 파일 없음")
            continue
        with open(path, encoding="utf-8") as f:
            data = json.load(f)

        target = next(
            (q for q in data.get("quarterly", [])
             if q.get("date") == fx["date"] and q.get("qtrs") == fx["qtrs"]),
            None,
        )
        if target is None:
            print(f"  [SKIP] {fx['ticker']} {fx['date']} qtrs={fx['qtrs']}: 레코드 없음")
            continue

        changed = []
        for field, value in fx["fields"].items():
            if target.get(field) is None:
                target[field] = value
                changed.append(field)
        if not changed:
            print(f"  [OK]   {fx['ticker']} {fx['date']}: 이미 값 있음 (변경 없음)")
            continue
        if fx.get("mark_calculated"):
            target["is_calculated"] = True

        print(f"  [{'FIX' if write else 'DRY'}]  {fx['ticker']} {fx['date']}: {', '.join(changed)}")
        applied += 1
        if write:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
    return applied


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="US known fixes 재적용")
    ap.add_argument("--fix", action="store_true", help="실제로 파일에 쓰기 (기본: dry-run)")
    args = ap.parse_args()
    n = apply_fixes(write=args.fix)
    print(f"{'적용' if args.fix else '적용 예정'}: {n}건")
