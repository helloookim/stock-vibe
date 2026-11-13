"""
US 재무 데이터 업데이트 오케스트레이터 (SEC EDGAR Financial Statement Data Sets).

새 분기 데이터셋을 받은 뒤:
    1. https://www.sec.gov/dera/data/financial-statement-data-sets 에서 YYYYqN.zip 다운로드
       → ~/us_stock_data/raw_data/YYYYqN/ 에 압축 해제 (sub.txt, num.txt 필요)
    2. python scripts/us/update_us_financials.py --refresh-tickers
       → ETL → Q4 보정 → known fixes → 현재 public/ 대비 diff 리포트 (여기서 멈춤)
    3. 리포트 확인 후:
       python scripts/us/update_us_financials.py --skip-etl --apply
       → prepare_us_data.py 로 public/data/us_stocks/ + us_company_index.json 반영

옵션:
    --refresh-tickers  SEC company_tickers.json 새로 받기 (기존 파일은 us_stock_data/ 에 백업)
    --skip-etl         ETL/보정 단계를 건너뛰고 diff(+apply)만
    --apply            diff 후 prepare_us_data.py 실행
"""

import argparse
import json
import math
import re
import shutil
import subprocess
import sys
import time
import urllib.request
from collections import Counter
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from config import (  # noqa: E402
    REPO_ROOT, US_DATA_DIR, RAW_DATA_DIR, FIXED_DIR, TICKER_FILE, PUBLIC_US_DIR, PUBLIC_US_INDEX,
    CIK_ALIAS_FILE,
)
from known_fixes import apply_fixes  # noqa: E402

SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"
# SEC 는 "이름 이메일" 형식 User-Agent 를 요구함 (형식 없으면 403). 개인 연락처 대신 일반값 사용
USER_AGENT = "research-data-pipeline admin@example.com"
WINDOWS_RESERVED_NAMES = re.compile(r'^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$', re.IGNORECASE)
NUMERIC_FIELDS = ("revenue", "operating_income", "net_income", "eps", "eps_basic",
                  "pretax_income", "operating_cash_flow", "total_assets", "total_equity")


def run(script, *extra):
    print(f"\n=== {script} {' '.join(extra)} ===")
    t = time.time()
    subprocess.run([sys.executable, str(HERE / script), *extra], check=True, cwd=REPO_ROOT)
    print(f"--- {script} 완료 ({time.time() - t:.0f}s)")


def refresh_tickers():
    req = urllib.request.Request(SEC_TICKERS_URL, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.loads(r.read().decode("utf-8"))
    if len(data) < 5000:
        raise RuntimeError(f"티커 수가 비정상적으로 적음: {len(data)}")
    if TICKER_FILE.exists():
        backup = US_DATA_DIR / f"company_tickers_{date.today():%Y%m%d}_backup.json"
        shutil.copy2(TICKER_FILE, backup)
        print(f"  기존 티커 파일 백업: {backup}")
        with open(TICKER_FILE, encoding="utf-8") as f:
            update_cik_aliases(json.load(f), data)
    with open(TICKER_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f)
    print(f"  티커 {len(data):,}개 저장: {TICKER_FILE}")


def _primary_by_ticker(tickers_raw):
    """ticker → cik (CIK 별 최상위 티커 기준, etl_sec_data.load_ticker_mapping 과 동일 규칙)."""
    cik_to_ticker = {}
    for k in sorted(tickers_raw, key=int):
        e = tickers_raw[k]
        cik_to_ticker.setdefault(e["cik_str"], e["ticker"])
    return {t: c for c, t in cik_to_ticker.items()}


def update_cik_aliases(old_raw, new_raw):
    """같은 티커가 새 CIK 로 옮겨갔고 옛 CIK 가 목록에서 사라진 경우 → 별칭 후보로 누적.

    티커 재사용(다른 회사), SPAC 교체 등도 같은 패턴으로 잡히므로 merge=null(검토 대기)로
    기록만 한다. 회사명을 보고 같은 법인(재상장/지주회사 재편)이면 merge=true 로 바꿔야
    ETL 이 과거 실적을 합친다.
    """
    old_t, new_t = _primary_by_ticker(old_raw), _primary_by_ticker(new_raw)
    new_ciks = {e["cik_str"] for e in new_raw.values()}
    old_names = {e["cik_str"]: e["title"] for e in old_raw.values()}
    new_names = {e["cik_str"]: e["title"] for e in new_raw.values()}
    aliases = {}
    if CIK_ALIAS_FILE.exists():
        aliases = json.loads(CIK_ALIAS_FILE.read_text(encoding="utf-8"))
    added = []
    for t, old_cik in old_t.items():
        new_cik = new_t.get(t)
        if new_cik and new_cik != old_cik and old_cik not in new_ciks and str(old_cik) not in aliases:
            aliases[str(old_cik)] = {
                "ticker": t, "new_cik": new_cik,
                "old_name": old_names.get(old_cik), "new_name": new_names.get(new_cik),
                "merge": None, "note": "검토 필요", "detected": f"{date.today():%Y-%m-%d}",
            }
            added.append(f"{t}: {old_names.get(old_cik)} → {new_names.get(new_cik)}")
    CIK_ALIAS_FILE.write_text(json.dumps(aliases, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"  CIK 별칭 후보 신규 {len(added)}개 (merge=null, {CIK_ALIAS_FILE.name} 에서 검토 필요)")
    for a in added:
        print(f"    - {a}")


def planned_index():
    """prepare_us_data.py 와 동일한 규칙으로 배포될 티커 집합 계산."""
    with open(TICKER_FILE, encoding="utf-8") as f:
        tickers_raw = json.load(f)
    available = {p.stem for p in FIXED_DIR.glob("*.json")}
    return {e["ticker"] for e in tickers_raw.values()
            if e["ticker"] in available and not WINDOWS_RESERVED_NAMES.match(e["ticker"])}


def _differs(a, b):
    if a is None or b is None:
        return (a is None) != (b is None)
    try:
        return not math.isclose(float(a), float(b), rel_tol=1e-6, abs_tol=1e-6)
    except (TypeError, ValueError):
        return a != b


def _records(d):
    out = {}
    for kind in ("annual", "quarterly"):
        for r in d.get(kind, []):
            out[(kind, r.get("date"), r.get("qtrs"), r.get("type"))] = r
    return out


def diff_report():
    new_set = planned_index()
    # 현재 사이트에 노출 중인 티커 = 인덱스 기준 (public 폴더엔 인덱스 밖 잔여 파일이 있을 수 있음)
    with open(PUBLIC_US_INDEX, encoding="utf-8") as f:
        old_set = {e["ticker"] for e in json.load(f)}
    dropped = sorted(old_set - new_set)
    added = sorted(new_set - old_set)

    changed_tickers = []
    new_period_tickers = 0
    latest = Counter()
    for t in sorted(new_set & old_set):
        with open(FIXED_DIR / f"{t}.json", encoding="utf-8") as f:
            new = json.load(f)
        with open(PUBLIC_US_DIR / f"{t}.json", encoding="utf-8") as f:
            old = json.load(f)
        nr, orr = _records(new), _records(old)
        if set(nr) - set(orr):
            new_period_tickers += 1
        n_changed = sum(
            1 for k in set(nr) & set(orr)
            if any(_differs(nr[k].get(fld), orr[k].get(fld)) for fld in NUMERIC_FIELDS)
        )
        if n_changed:
            changed_tickers.append((t, n_changed))
        q = [r["date"] for r in new.get("quarterly", [])
             if r.get("type") == "single" and (r.get("revenue") is not None or r.get("net_income") is not None)]
        if q:
            latest[str(max(q))[:6]] += 1

    changed_tickers.sort(key=lambda x: -x[1])
    lines = [
        f"# US 데이터 업데이트 diff - {date.today():%Y-%m-%d}",
        "",
        f"- raw_data 폴더: {', '.join(sorted(p.name for p in RAW_DATA_DIR.iterdir() if p.is_dir())[-3:])} (최근 3개)",
        f"- 배포 예정 티커: {len(new_set):,} (현재 public: {len(old_set):,})",
        f"- 신규 티커: {len(added)}",
        f"- **삭제될 티커: {len(dropped)}** (prepare 는 public 파일을 지우지 않지만 인덱스에서 빠짐)",
        f"- 새 기간이 추가된 티커: {new_period_tickers:,}",
        f"- 기존 기간 값이 바뀐 티커: {len(changed_tickers)}",
        "",
        "## 최신 단일분기 기준월 분포 (상위 8)",
        "",
        *[f"- {ym}: {n:,}" for ym, n in sorted(latest.items(), reverse=True)[:8]],
        "",
        "## 삭제될 티커",
        "",
        ", ".join(dropped) if dropped else "(없음)",
        "",
        "## 기존 값이 바뀐 티커 (변경 레코드 수 상위 50)",
        "",
        *[f"- {t}: {n}" for t, n in changed_tickers[:50]],
        "",
        "## 신규 티커 (최대 200)",
        "",
        ", ".join(added[:200]) if added else "(없음)",
        "",
    ]
    report = REPO_ROOT / "reports" / f"us_update_diff_{date.today():%Y%m%d}.md"
    report.parent.mkdir(exist_ok=True)
    report.write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines[:16]))
    print(f"\n리포트: {report}")


def main():
    ap = argparse.ArgumentParser(description="US 재무 데이터 업데이트")
    ap.add_argument("--refresh-tickers", action="store_true")
    ap.add_argument("--skip-etl", action="store_true")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--export-only", action="store_true",
                    help="raw_data 적재 생략, 기존 sec_data.db 로 JSON export 부터 (티커 매핑만 바뀐 경우)")
    args = ap.parse_args()

    print(f"데이터 디렉토리: {US_DATA_DIR}")
    if args.refresh_tickers:
        refresh_tickers()
    if not args.skip_etl:
        run("etl_sec_data.py", *(["--export-only"] if args.export_only else []))
        run("fix_financial_data.py")
        print("\n=== known fixes ===")
        apply_fixes(write=True)
    diff_report()
    if args.apply:
        # 리다이렉트는 옛 인덱스가 필요하므로 prepare(인덱스 덮어쓰기) 전에 생성
        run("generate_ticker_redirects.py")
        subprocess.run([sys.executable, str(REPO_ROOT / "scripts" / "prepare_us_data.py")],
                       check=True, cwd=REPO_ROOT)
    else:
        print("\n(dry-run) 확인 후 --skip-etl --apply 로 public/ 에 반영하세요.")


if __name__ == "__main__":
    main()
