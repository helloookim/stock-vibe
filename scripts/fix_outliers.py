"""
KR Stock Data Pinpoint Fixer
=============================
Applies surgical fixes to specific data quality issues in per-company JSONs.
Reads a fix configuration, modifies ONLY the specified fields, writes back.

Usage:
    python scripts/fix_outliers.py --dry-run                     # Show known fixes
    python scripts/fix_outliers.py --fix --backup                # Apply with backup
    python scripts/fix_outliers.py --auto-scan --dry-run         # Auto-detect, preview
    python scripts/fix_outliers.py --auto-scan --fix --backup    # Auto-detect, apply
    python scripts/fix_outliers.py --config data/fix_config.json --dry-run
"""

import json
import shutil
import argparse
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# ─── Config ───────────────────────────────────────────────────────────────────

ROOT_DIR = Path(__file__).parent.parent
KR_STOCKS_DIR = ROOT_DIR / 'public' / 'data' / 'kr_stocks'

ABSURD_VALUE = 1_000_000_000_000_000  # 1경 KRW

# Financial company detection (same as scan_outliers.py)
FINANCIAL_SECTOR_KEYWORDS = ('금융', '은행', '보험', '증권', '투자', '신탁', '지주')
FINANCIAL_NAME_KEYWORDS = (
    '은행', '보험', '증권', '금융', '캐피탈', '투자', '저축', '카드',
    '자산운용', '리츠', '스팩', '선물', '코리안리', '화재',
)

# ─── Known Fixes (verified issues) ───────────────────────────────────────────

KNOWN_FIXES = [
    # ── NAVER (035420) ────────────────────────────────────────────────────────
    # Q4 2020: LINE deconsolidated mid-year, Q4 derivation produces garbage.
    # Real values from NAVER earnings release (2021-01-28):
    #   Revenue 1조5,126억, Op Profit 3,238억, Net Income 3,753억
    # Source: https://www.sidae.com/article/2021012808058093923
    {
        'stock_code': '035420', 'type': 'quarterly', 'year': 2020, 'quarter': '4Q',
        'action': 'set_value',
        'fields': ['revenue', 'op_profit', 'net_income'],
        'values': [1512600000000, 323800000000, 375300000000],
        'reason': 'Q4 2020 LINE deconsolidation: derived values wrong, using real earnings release figures',
    },
    # Q4 2017/2018 EPS: legacy data has wrong sign (negative EPS with positive NI)
    {
        'stock_code': '035420', 'type': 'quarterly', 'year': 2017, 'quarter': '4Q',
        'action': 'set_null', 'fields': ['eps'],
        'reason': 'EPS sign mismatch: eps=-15103 with positive net_income=172B',
    },
    {
        'stock_code': '035420', 'type': 'quarterly', 'year': 2018, 'quarter': '4Q',
        'action': 'set_null', 'fields': ['eps'],
        'reason': 'EPS sign mismatch: eps=-13633 with positive net_income=124B',
    },
]


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
    """Format a numeric value for display."""
    if v is None:
        return 'null'
    av = abs(v)
    sign = '-' if v < 0 else ''
    if av >= 1_000_000_000_000:
        return f'{sign}{av / 1_000_000_000_000:.1f}조'
    if av >= 100_000_000:
        return f'{sign}{av / 100_000_000:.0f}억'
    return f'{sign}{av:,.0f}'


# ─── Auto-Scan ────────────────────────────────────────────────────────────────

def generate_auto_fixes():
    """Scan all data and generate fixes for unambiguous issues only."""
    fixes = []

    for filepath in sorted(KR_STOCKS_DIR.glob('*.json')):
        try:
            with open(filepath, encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, KeyError):
            continue

        code = data.get('stock_code', filepath.stem)
        name = data.get('name', '?')
        financial = is_financial_company(name, data.get('sector', ''))

        # 1. Absurd values (>1경) — nullify corrupt fields
        for entry_type in ('annual', 'quarterly'):
            for entry in data.get(entry_type, []):
                for field in ('revenue', 'op_profit', 'net_income'):
                    val = entry.get(field)
                    if val is not None and abs(val) > ABSURD_VALUE:
                        fix = {
                            'stock_code': code,
                            'type': entry_type,
                            'year': entry['year'],
                            'quarter': entry.get('quarter'),
                            'action': 'set_null',
                            'fields': [field],
                            'reason': f'Absurd value: {field}={fmt_val(val)} (>{fmt_val(ABSURD_VALUE)})',
                        }
                        fixes.append(fix)

        # 2. Negative Q4 revenue — nullify Q4 revenue, op_profit, net_income
        for entry in data.get('quarterly', []):
            if entry.get('quarter') != '4Q':
                continue
            rev = entry.get('revenue')
            if rev is not None and rev < 0:
                null_fields = []
                for field in ('revenue', 'op_profit', 'net_income'):
                    if entry.get(field) is not None:
                        null_fields.append(field)
                if null_fields:
                    fixes.append({
                        'stock_code': code,
                        'type': 'quarterly',
                        'year': entry['year'],
                        'quarter': '4Q',
                        'action': 'set_null',
                        'fields': null_fields,
                        'reason': f'Negative Q4 revenue={fmt_val(rev)} (derivation artifact)',
                    })

        # 3. Q4 op_profit > revenue (non-financial only) — nullify revenue, op_profit
        if not financial:
            for entry in data.get('quarterly', []):
                if entry.get('quarter') != '4Q':
                    continue
                rev = entry.get('revenue')
                op = entry.get('op_profit')
                if (rev is not None and op is not None
                        and rev > 0 and op > rev):
                    fixes.append({
                        'stock_code': code,
                        'type': 'quarterly',
                        'year': entry['year'],
                        'quarter': '4Q',
                        'action': 'set_null',
                        'fields': ['revenue', 'op_profit'],
                        'reason': f'Q4 op_profit({fmt_val(op)}) > revenue({fmt_val(rev)}) - derivation artifact',
                    })

        # 4. EPS sign mismatch — nullify EPS
        for entry in data.get('quarterly', []):
            eps = entry.get('eps')
            ni = entry.get('net_income')
            if eps is not None and ni is not None:
                if (ni > 0 and eps < 0) or (ni < 0 and eps > 0):
                    fixes.append({
                        'stock_code': code,
                        'type': 'quarterly',
                        'year': entry['year'],
                        'quarter': entry.get('quarter'),
                        'action': 'set_null',
                        'fields': ['eps'],
                        'reason': f'EPS sign mismatch: eps={eps:,.0f} but net_income={fmt_val(ni)}',
                    })

    return fixes


# ─── Fix Application ─────────────────────────────────────────────────────────

def find_entry(data, fix):
    """Find the matching entry in data for a fix."""
    entries = data.get(fix['type'], [])
    for entry in entries:
        if entry['year'] != fix['year']:
            continue
        if fix['type'] == 'quarterly' and entry.get('quarter') != fix.get('quarter'):
            continue
        return entry
    return None


def apply_fix(data, fix):
    """Apply a single fix to company data (in-memory).
    Returns (changed: bool, description: str).
    """
    target = find_entry(data, fix)
    if target is None:
        loc = f"{fix['type']} {fix['year']}"
        if fix.get('quarter'):
            loc += f" {fix['quarter']}"
        return False, f'Entry not found: {loc}'

    action = fix['action']

    if action == 'set_null':
        changes = []
        for field in fix['fields']:
            old_val = target.get(field)
            if old_val is not None:
                target[field] = None
                changes.append(f'{field}: {fmt_val(old_val)} -> null')
        if changes:
            return True, '; '.join(changes)
        return False, 'already null'

    elif action == 'set_value':
        changes = []
        for field, value in zip(fix['fields'], fix['values']):
            old_val = target.get(field)
            if old_val != value:
                target[field] = value
                changes.append(f'{field}: {fmt_val(old_val)} -> {fmt_val(value)}')
        if changes:
            return True, '; '.join(changes)
        return False, 'same value'

    elif action == 'delete_entry':
        entries = data[fix['type']]
        entries.remove(target)
        loc = f"{fix['type']} {fix['year']}"
        if fix.get('quarter'):
            loc += f" {fix['quarter']}"
        return True, f'Deleted entry: {loc}'

    return False, f'Unknown action: {action}'


def backup_file(filepath):
    """Create a timestamped backup."""
    date_str = datetime.now().strftime('%Y%m%d')
    backup_path = filepath.with_suffix(f'.json.bak.{date_str}')
    shutil.copy2(filepath, backup_path)
    return backup_path


def deduplicate_fixes(fixes):
    """Remove duplicate fixes (same stock_code + type + year + quarter + fields)."""
    seen = set()
    deduped = []
    for fix in fixes:
        key = (
            fix['stock_code'],
            fix['type'],
            fix['year'],
            fix.get('quarter'),
            fix['action'],
            tuple(sorted(fix['fields'])),
        )
        if key not in seen:
            seen.add(key)
            deduped.append(fix)
    return deduped


def process_fixes(fixes, dry_run=True, do_backup=False):
    """Main processing loop. Returns summary stats."""
    # Group fixes by stock_code for efficient I/O
    by_code = defaultdict(list)
    for fix in fixes:
        by_code[fix['stock_code']].append(fix)

    stats = {
        'total': len(fixes),
        'changed': 0,
        'already_ok': 0,
        'not_found': 0,
        'files_modified': 0,
    }

    fix_num = 0
    for code, code_fixes in sorted(by_code.items()):
        filepath = KR_STOCKS_DIR / f'{code}.json'
        if not filepath.exists():
            for fix in code_fixes:
                fix_num += 1
                print(f'\n  Fix {fix_num}/{stats["total"]}: {code} — FILE NOT FOUND')
                stats['not_found'] += 1
            continue

        with open(filepath, encoding='utf-8') as f:
            data = json.load(f)

        name = data.get('name', '?')
        file_changed = False

        for fix in code_fixes:
            fix_num += 1
            loc = f"{fix['type']} {fix['year']}"
            if fix.get('quarter'):
                loc += f" {fix['quarter']}"

            print(f'\n  Fix {fix_num}/{stats["total"]}: {code} {name}')
            print(f'    Target: {loc}')
            print(f'    Action: {fix["action"]} {fix["fields"]}')
            print(f'    Reason: {fix["reason"]}')

            changed, desc = apply_fix(data, fix)

            if changed:
                file_changed = True
                stats['changed'] += 1
                status = 'WOULD CHANGE' if dry_run else 'CHANGED'
            elif 'not found' in desc.lower():
                stats['not_found'] += 1
                status = 'NOT FOUND'
            else:
                stats['already_ok'] += 1
                status = 'ALREADY OK'

            print(f'    Result: {desc}')
            print(f'    Status: {status}')

        if file_changed and not dry_run:
            if do_backup:
                bak = backup_file(filepath)
                print(f'    Backup: {bak}')
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False)
            stats['files_modified'] += 1
            print(f'  [OK] Saved {filepath.name}')

    return stats


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Apply pinpoint fixes to KR stock data')
    parser.add_argument('--fix', action='store_true',
                        help='Actually apply fixes (default is dry-run)')
    parser.add_argument('--backup', action='store_true',
                        help='Create backup before modifying files')
    parser.add_argument('--auto-scan', action='store_true',
                        help='Auto-detect fixable issues instead of using known fixes')
    parser.add_argument('--config', type=str,
                        help='Path to JSON fix config file')
    args = parser.parse_args()

    dry_run = not args.fix
    mode = 'DRY RUN' if dry_run else 'APPLYING FIXES'

    print(f'=== KR Stock Data Pinpoint Fixer ({mode}) ===\n')

    # Load fixes
    if args.config:
        config_path = Path(args.config)
        if not config_path.exists():
            print(f'ERROR: Config file not found: {config_path}')
            return
        with open(config_path, encoding='utf-8') as f:
            fixes = json.load(f)
        print(f'Loaded {len(fixes)} fixes from {config_path}')
    elif args.auto_scan:
        print('Scanning all companies for auto-fixable issues...')
        fixes = generate_auto_fixes()
        fixes = deduplicate_fixes(fixes)
        print(f'Found {len(fixes)} auto-fixable issues')
    else:
        fixes = KNOWN_FIXES
        print(f'Using {len(fixes)} known fixes')

    if not fixes:
        print('No fixes to apply.')
        return

    stats = process_fixes(fixes, dry_run=dry_run, do_backup=args.backup)

    print(f'\n{"=" * 50}')
    print(f'Summary:')
    print(f'  Fixes examined: {stats["total"]}')
    if dry_run:
        print(f'  Would change:   {stats["changed"]}')
    else:
        print(f'  Changed:        {stats["changed"]}')
        print(f'  Files modified: {stats["files_modified"]}')
    print(f'  Already OK:     {stats["already_ok"]}')
    print(f'  Not found:      {stats["not_found"]}')


if __name__ == '__main__':
    main()
