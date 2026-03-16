"""
KR Stock Data Outlier Scanner
==============================
Scans all per-company JSONs in public/data/kr_stocks/ for data quality issues.
Produces a markdown report grouped by severity (Critical / Warning / Info).

Usage:
    python scripts/scan_outliers.py                    # Full scan → reports/outlier_report_YYYYMMDD.md
    python scripts/scan_outliers.py --stdout           # Print report to stdout
    python scripts/scan_outliers.py --code 035420      # Scan single company
    python scripts/scan_outliers.py --json             # Output as JSON instead of markdown
    python scripts/scan_outliers.py --severity critical # Only show critical issues
"""

import json
import argparse
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# ─── Config ───────────────────────────────────────────────────────────────────

ROOT_DIR = Path(__file__).parent.parent
KR_STOCKS_DIR = ROOT_DIR / 'public' / 'data' / 'kr_stocks'
REPORT_DIR = ROOT_DIR / 'reports'

# Severity levels
CRITICAL = 'Critical'
WARNING = 'Warning'
INFO = 'Info'

# Thresholds
ABSURD_VALUE = 1_000_000_000_000_000       # 1경 KRW — no Korean company exceeds this
Q4_LOW_RATIO = 0.10                         # Q4 < 10% of avg(Q1-Q3)
Q4_HIGH_RATIO = 5.0                         # Q4 > 500% of avg(Q1-Q3)
NI_OP_EXTREME_RATIO = 10                    # |net_income| > 10x |op_profit|
OP_MEANINGFUL_MIN = 100_000_000             # 1억 — minimum |op_profit| for ratio checks
REVENUE_DROP_THRESHOLD = -0.50              # >50% YoY drop
REVENUE_SPIKE_THRESHOLD = 3.0              # >300% YoY increase
REVENUE_MIN_FOR_YOY = 1_000_000_000        # 10억 — skip YoY if previous year < this
QUARTERLY_START_YEAR = 2016                 # No quarterly data before this year
CURRENT_YEAR = datetime.now().year

# Financial company detection
FINANCIAL_SECTOR_KEYWORDS = ('금융', '은행', '보험', '증권', '투자', '신탁', '지주')
FINANCIAL_NAME_KEYWORDS = (
    '은행', '보험', '증권', '금융', '캐피탈', '투자', '저축', '카드',
    '자산운용', '리츠', '스팩', '선물', '코리안리', '화재',
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def is_financial_company(name, sector):
    """Detect financial companies via sector and name keywords."""
    sector = sector or ''
    name = name or ''
    for kw in FINANCIAL_SECTOR_KEYWORDS:
        if kw in sector:
            return True
    for kw in FINANCIAL_NAME_KEYWORDS:
        if kw in name:
            return True
    return False


def fmt_val(v):
    """Format a numeric value for display (조/억 units)."""
    if v is None:
        return 'null'
    av = abs(v)
    sign = '-' if v < 0 else ''
    if av >= 1_000_000_000_000:
        return f'{sign}{av / 1_000_000_000_000:.1f}조'
    if av >= 100_000_000:
        return f'{sign}{av / 100_000_000:.0f}억'
    return f'{sign}{av:,.0f}'


def fmt_raw(v):
    """Format raw numeric value with commas."""
    if v is None:
        return 'null'
    return f'{v:,.0f}'


# ─── Check Functions ─────────────────────────────────────────────────────────

def check_absurd_values(data, findings):
    """CRITICAL: Values exceeding 1 quadrillion KRW."""
    code = data['stock_code']
    name = data['name']

    for entry in data.get('annual', []):
        for field in ('revenue', 'op_profit', 'net_income'):
            val = entry.get(field)
            if val is not None and abs(val) > ABSURD_VALUE:
                findings.append({
                    'severity': CRITICAL,
                    'category': 'Absurd Values',
                    'stock_code': code, 'name': name,
                    'year': entry['year'], 'quarter': None,
                    'field': field, 'value': val,
                    'detail': f'{field}={fmt_raw(val)} (>{fmt_val(ABSURD_VALUE)})',
                })

    for entry in data.get('quarterly', []):
        for field in ('revenue', 'op_profit', 'net_income'):
            val = entry.get(field)
            if val is not None and abs(val) > ABSURD_VALUE:
                findings.append({
                    'severity': CRITICAL,
                    'category': 'Absurd Values',
                    'stock_code': code, 'name': name,
                    'year': entry['year'], 'quarter': entry.get('quarter'),
                    'field': field, 'value': val,
                    'detail': f'{field}={fmt_raw(val)} (>{fmt_val(ABSURD_VALUE)})',
                })


def check_q4_anomalies(data, findings, is_financial):
    """CRITICAL/WARNING: Q4 derivation artifacts."""
    code = data['stock_code']
    name = data['name']
    quarterly = data.get('quarterly', [])

    # Group by year
    by_year = defaultdict(dict)
    for q in quarterly:
        by_year[q['year']][q.get('quarter')] = q

    for year, quarters in by_year.items():
        q4 = quarters.get('4Q')
        if not q4:
            continue

        q4_rev = q4.get('revenue')
        q4_op = q4.get('op_profit')

        # Check negative Q4 revenue
        if q4_rev is not None and q4_rev < 0:
            findings.append({
                'severity': CRITICAL,
                'category': 'Negative Q4 Revenue',
                'stock_code': code, 'name': name,
                'year': year, 'quarter': '4Q',
                'field': 'revenue', 'value': q4_rev,
                'detail': f'Q4 revenue={fmt_val(q4_rev)}',
            })

        # Check Q4 op_profit > revenue (non-financial only)
        if (not is_financial and q4_rev is not None and q4_op is not None
                and q4_rev > 0 and q4_op > q4_rev):
            findings.append({
                'severity': CRITICAL,
                'category': 'Q4 Op Profit > Revenue',
                'stock_code': code, 'name': name,
                'year': year, 'quarter': '4Q',
                'field': 'op_profit', 'value': q4_op,
                'detail': f'op_profit={fmt_val(q4_op)} > revenue={fmt_val(q4_rev)}',
            })

        # Compare Q4 to Q1-Q3 average
        other_revs = []
        for qname in ('1Q', '2Q', '3Q'):
            q = quarters.get(qname)
            if q and q.get('revenue') is not None:
                other_revs.append(q['revenue'])

        if len(other_revs) >= 2 and q4_rev is not None:
            avg123 = sum(other_revs) / len(other_revs)
            if avg123 > REVENUE_MIN_FOR_YOY:
                if q4_rev >= 0 and q4_rev < avg123 * Q4_LOW_RATIO:
                    findings.append({
                        'severity': WARNING,
                        'category': 'Q4 Revenue Too Small',
                        'stock_code': code, 'name': name,
                        'year': year, 'quarter': '4Q',
                        'field': 'revenue', 'value': q4_rev,
                        'detail': f'Q4={fmt_val(q4_rev)} < 10% of avg Q1-Q3={fmt_val(avg123)}',
                    })
                elif q4_rev > avg123 * Q4_HIGH_RATIO:
                    findings.append({
                        'severity': WARNING,
                        'category': 'Q4 Revenue Too Large',
                        'stock_code': code, 'name': name,
                        'year': year, 'quarter': '4Q',
                        'field': 'revenue', 'value': q4_rev,
                        'detail': f'Q4={fmt_val(q4_rev)} > 500% of avg Q1-Q3={fmt_val(avg123)}',
                    })


def check_one_time_gains(data, findings):
    """WARNING: One-time gain/loss detection."""
    code = data['stock_code']
    name = data['name']

    # Quarterly: |net_income| > 10x |op_profit|
    for q in data.get('quarterly', []):
        ni = q.get('net_income')
        op = q.get('op_profit')
        if ni is not None and op is not None and abs(op) > OP_MEANINGFUL_MIN:
            if abs(ni) > NI_OP_EXTREME_RATIO * abs(op):
                findings.append({
                    'severity': WARNING,
                    'category': 'One-Time Gain/Loss (Quarterly)',
                    'stock_code': code, 'name': name,
                    'year': q['year'], 'quarter': q.get('quarter'),
                    'field': 'net_income', 'value': ni,
                    'detail': f'NI={fmt_val(ni)} vs OP={fmt_val(op)} ({abs(ni)/abs(op):.1f}x)',
                })

    # Annual: net_income > 5x previous year
    annual = sorted(data.get('annual', []), key=lambda a: a['year'])
    for i in range(1, len(annual)):
        prev_ni = annual[i-1].get('net_income')
        curr_ni = annual[i].get('net_income')
        if (prev_ni is not None and curr_ni is not None
                and abs(prev_ni) > OP_MEANINGFUL_MIN
                and prev_ni > 0 and curr_ni > 0):
            ratio = curr_ni / prev_ni
            if ratio > 5:
                findings.append({
                    'severity': WARNING,
                    'category': 'Annual NI Spike (>5x YoY)',
                    'stock_code': code, 'name': name,
                    'year': annual[i]['year'], 'quarter': None,
                    'field': 'net_income', 'value': curr_ni,
                    'detail': f'{annual[i]["year"]} NI={fmt_val(curr_ni)} vs {annual[i-1]["year"]} NI={fmt_val(prev_ni)} ({ratio:.1f}x)',
                })


def check_eps_consistency(data, findings):
    """WARNING: EPS sign mismatch with net_income."""
    code = data['stock_code']
    name = data['name']

    for q in data.get('quarterly', []):
        eps = q.get('eps')
        ni = q.get('net_income')
        if eps is not None and ni is not None:
            # Sign mismatch: positive NI but negative EPS (or vice versa)
            if (ni > 0 and eps < 0) or (ni < 0 and eps > 0):
                findings.append({
                    'severity': WARNING,
                    'category': 'EPS Sign Mismatch',
                    'stock_code': code, 'name': name,
                    'year': q['year'], 'quarter': q.get('quarter'),
                    'field': 'eps', 'value': eps,
                    'detail': f'eps={eps:,.0f} but net_income={fmt_val(ni)}',
                })


def check_revenue_continuity(data, findings):
    """WARNING: Annual revenue continuity issues."""
    code = data['stock_code']
    name = data['name']

    annual = sorted(data.get('annual', []), key=lambda a: a['year'])
    for i in range(1, len(annual)):
        prev_rev = annual[i-1].get('revenue')
        curr_rev = annual[i].get('revenue')
        if prev_rev is None or curr_rev is None:
            continue
        # Skip absurd values (already flagged separately)
        if abs(prev_rev) > ABSURD_VALUE or abs(curr_rev) > ABSURD_VALUE:
            continue
        # Skip tiny companies
        if abs(prev_rev) < REVENUE_MIN_FOR_YOY:
            continue

        yoy = (curr_rev - prev_rev) / abs(prev_rev)

        if yoy < REVENUE_DROP_THRESHOLD:
            findings.append({
                'severity': WARNING,
                'category': 'Revenue YoY Drop (>50%)',
                'stock_code': code, 'name': name,
                'year': annual[i]['year'], 'quarter': None,
                'field': 'revenue', 'value': curr_rev,
                'detail': f'{annual[i]["year"]} rev={fmt_val(curr_rev)} vs {annual[i-1]["year"]} rev={fmt_val(prev_rev)} ({yoy:+.0%})',
            })
        elif yoy > REVENUE_SPIKE_THRESHOLD:
            findings.append({
                'severity': WARNING,
                'category': 'Revenue YoY Spike (>300%)',
                'stock_code': code, 'name': name,
                'year': annual[i]['year'], 'quarter': None,
                'field': 'revenue', 'value': curr_rev,
                'detail': f'{annual[i]["year"]} rev={fmt_val(curr_rev)} vs {annual[i-1]["year"]} rev={fmt_val(prev_rev)} ({yoy:+.0%})',
            })


def check_data_completeness(data, findings):
    """INFO: Data completeness issues."""
    code = data['stock_code']
    name = data['name']

    annual_years = {a['year'] for a in data.get('annual', [])}
    quarterly_years = {q['year'] for q in data.get('quarterly', [])}

    # Annual data but no quarterly (skip 2015 and current year)
    for year in annual_years:
        if year <= 2015 or year >= CURRENT_YEAR:
            continue
        if year not in quarterly_years:
            findings.append({
                'severity': INFO,
                'category': 'Annual Without Quarterly',
                'stock_code': code, 'name': name,
                'year': year, 'quarter': None,
                'field': '-', 'value': None,
                'detail': f'Annual data exists for {year} but no quarterly entries',
            })

    # Null annual revenue
    for a in data.get('annual', []):
        if a.get('revenue') is None:
            findings.append({
                'severity': INFO,
                'category': 'Null Annual Revenue',
                'stock_code': code, 'name': name,
                'year': a['year'], 'quarter': None,
                'field': 'revenue', 'value': None,
                'detail': f'Annual {a["year"]} revenue is null',
            })


# ─── Scanner ─────────────────────────────────────────────────────────────────

def scan_company(data):
    """Scan a single company for all anomaly types."""
    findings = []
    financial = is_financial_company(data.get('name', ''), data.get('sector', ''))

    check_absurd_values(data, findings)
    check_q4_anomalies(data, findings, financial)
    check_one_time_gains(data, findings)
    check_eps_consistency(data, findings)
    check_revenue_continuity(data, findings)
    check_data_completeness(data, findings)

    return findings


def scan_all(stock_code=None):
    """Scan all companies (or a single one). Returns list of findings."""
    all_findings = []
    stats = {'scanned': 0, 'with_issues': 0}

    if stock_code:
        filepath = KR_STOCKS_DIR / f'{stock_code}.json'
        if not filepath.exists():
            print(f'ERROR: {filepath} not found')
            return all_findings, stats
        files = [filepath]
    else:
        files = sorted(KR_STOCKS_DIR.glob('*.json'))

    for filepath in files:
        try:
            with open(filepath, encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, KeyError) as e:
            all_findings.append({
                'severity': CRITICAL,
                'category': 'Parse Error',
                'stock_code': filepath.stem, 'name': '?',
                'year': 0, 'quarter': None,
                'field': '-', 'value': None,
                'detail': str(e),
            })
            continue

        stats['scanned'] += 1
        company_findings = scan_company(data)
        if company_findings:
            stats['with_issues'] += 1
            all_findings.extend(company_findings)

    return all_findings, stats


# ─── Report Generation ────────────────────────────────────────────────────────

def generate_markdown_report(findings, stats, severity_filter=None):
    """Generate markdown report string."""
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Filter by severity if requested
    if severity_filter:
        sf = severity_filter.capitalize()
        findings = [f for f in findings if f['severity'] == sf]

    # Count by severity
    by_severity = defaultdict(list)
    for f in findings:
        by_severity[f['severity']].append(f)

    lines = []
    lines.append(f'# KR Stock Data Quality Report')
    lines.append(f'Generated: {now}\n')
    lines.append(f'## Summary')
    lines.append(f'- Total companies scanned: {stats["scanned"]}')
    lines.append(f'- Companies with issues: {stats["with_issues"]}')
    lines.append(f'- Critical issues: {len(by_severity[CRITICAL])}')
    lines.append(f'- Warning issues: {len(by_severity[WARNING])}')
    lines.append(f'- Info issues: {len(by_severity[INFO])}')
    lines.append('')

    # Group each severity by category
    for severity in (CRITICAL, WARNING, INFO):
        items = by_severity.get(severity, [])
        if not items:
            continue

        lines.append(f'---\n')
        lines.append(f'## {severity} Issues\n')

        by_category = defaultdict(list)
        for f in items:
            by_category[f['category']].append(f)

        for category, cat_items in sorted(by_category.items()):
            lines.append(f'### {category} ({len(cat_items)} entries)\n')
            lines.append(f'| Stock Code | Name | Year | Quarter | Field | Value | Detail |')
            lines.append(f'|---|---|---|---|---|---|---|')

            # Limit to 50 rows per category, show count if truncated
            show_items = cat_items[:50]
            for f in show_items:
                q = f['quarter'] or '-'
                v = fmt_val(f['value']) if f['value'] is not None else 'null'
                lines.append(f'| {f["stock_code"]} | {f["name"]} | {f["year"]} | {q} | {f["field"]} | {v} | {f["detail"]} |')

            if len(cat_items) > 50:
                lines.append(f'\n*...and {len(cat_items) - 50} more entries (truncated)*\n')
            lines.append('')

    return '\n'.join(lines)


def generate_json_report(findings, stats):
    """Generate JSON report."""
    return json.dumps({
        'generated': datetime.now().isoformat(),
        'stats': stats,
        'findings': findings,
    }, ensure_ascii=False, indent=2)


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Scan KR stock data for outliers')
    parser.add_argument('--code', help='Scan a single company by stock code')
    parser.add_argument('--stdout', action='store_true', help='Print to stdout instead of file')
    parser.add_argument('--json', action='store_true', help='Output JSON instead of markdown')
    parser.add_argument('--severity', choices=['critical', 'warning', 'info'],
                        help='Filter by severity level')
    args = parser.parse_args()

    print(f'Scanning {args.code or "all companies"} in {KR_STOCKS_DIR}...')
    findings, stats = scan_all(args.code)

    if args.json:
        report = generate_json_report(findings, stats)
        ext = '.json'
    else:
        report = generate_markdown_report(findings, stats, args.severity)
        ext = '.md'

    if args.stdout:
        print(report)
    else:
        REPORT_DIR.mkdir(exist_ok=True)
        date_str = datetime.now().strftime('%Y%m%d')
        filename = f'outlier_report_{date_str}{ext}'
        output_path = REPORT_DIR / filename
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f'Report written to {output_path}')

    # Print summary to console
    by_sev = defaultdict(int)
    for f in findings:
        by_sev[f['severity']] += 1
    print(f'\nSummary: {stats["scanned"]} companies scanned, {stats["with_issues"]} with issues')
    print(f'  Critical: {by_sev[CRITICAL]}, Warning: {by_sev[WARNING]}, Info: {by_sev[INFO]}')


if __name__ == '__main__':
    main()
