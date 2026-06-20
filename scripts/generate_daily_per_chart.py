"""
Generate daily P/E ratio chart using historical daily close prices.

Combines:
  - public/data/kr_daily_prices/{code}.json  → daily close prices
  - public/data/kr_stocks/{code}.json        → quarterly net_income (for trailing 4Q)

P/E computation:
  shares        = last_mktcap / last_close_price  (treated as constant)
  daily_mktcap  = daily_close × shares
  trailing_4Q   = sum of 4 most recent quarters' net_income available on that date
  daily_per     = daily_mktcap / trailing_4Q

Usage:
    python scripts/generate_daily_per_chart.py 005930
    python scripts/generate_daily_per_chart.py 005930 --output reports/samsung_daily_per.png
    python scripts/generate_daily_per_chart.py 005930 --lang en --color '#4f46e5'
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import matplotlib.dates as mdates
import numpy as np

ROOT_DIR = Path(__file__).parent.parent
KR_STOCKS_DIR  = ROOT_DIR / 'public' / 'data' / 'kr_stocks'
DAILY_DIR      = ROOT_DIR / 'public' / 'data' / 'kr_daily_prices'
DEFAULT_OUTPUT = ROOT_DIR / 'reports'

FIG_WIDTH  = 13.0
FIG_HEIGHT = 5.0
DPI        = 180

BG_COLOR   = '#FFFFFF'
GRID_COLOR = '#E8E8E8'
TEXT_COLOR = '#1a1a1a'
TEXT_MUTED = '#6b6b6b'
TEXT_FADED = '#aaaaaa'


# ── Font ──────────────────────────────────────────────────────────────────────

def setup_font(preset='noto'):
    import matplotlib.font_manager as fm
    import platform

    bold_fonts = {
        'noto':       ['NotoSerifKR-ExtraBold.ttf', 'NotoSerifKR-Bold.ttf'],
        'pretendard': ['Pretendard-Black.otf', 'Pretendard-ExtraBold.otf'],
    }.get(preset, [])

    search_dirs = (
        [Path.home() / 'AppData/Local/Microsoft/Windows/Fonts', Path('C:/Windows/Fonts')]
        if platform.system() == 'Windows'
        else [Path.home() / '.fonts', Path('/usr/share/fonts')]
    )

    for d in search_dirs:
        for fname in bold_fonts:
            fpath = d / fname
            if fpath.exists():
                fm.fontManager.addfont(str(fpath))
                prop = fm.FontProperties(fname=str(fpath))
                plt.rcParams['font.family'] = prop.get_name()
                break

    fallbacks = ['Noto Serif KR', 'Noto Serif CJK KR', 'Malgun Gothic', 'NanumGothic']
    available = {f.name for f in fm.fontManager.ttflist}
    current_family = plt.rcParams['font.family']
    current_family = current_family[0] if isinstance(current_family, list) else current_family
    if current_family not in available:
        for name in fallbacks:
            if name in available:
                plt.rcParams['font.family'] = name
                break

    plt.rcParams['axes.unicode_minus'] = False
    plt.rcParams['figure.dpi'] = DPI


# ── Data loading ──────────────────────────────────────────────────────────────

def load_stock(code):
    path = KR_STOCKS_DIR / f'{code}.json'
    if not path.exists():
        print(f'ERROR: {path} not found')
        sys.exit(1)
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def load_daily_prices(code):
    path = DAILY_DIR / f'{code}.json'
    if not path.exists():
        print(f'ERROR: {path} not found — run fetch_kr_daily_prices.py first')
        sys.exit(1)
    with open(path, encoding='utf-8') as f:
        return json.load(f).get('prices', [])  # [[YYYYMMDD, price], ...]


# ── Trailing 4Q net_income lookup ─────────────────────────────────────────────

QUARTER_END_MONTH = {'1Q': 3, '2Q': 6, '3Q': 9, '4Q': 12}

def build_quarter_timeline(quarterly):
    """
    Return sorted list of (quarter_end_date_int, net_income) for quarters
    that have non-null net_income. quarter_end date = last day of quarter month.
    """
    timeline = []
    for q in quarterly:
        ni = q.get('net_income')
        if ni is None:
            continue
        year = q['year']
        month = QUARTER_END_MONTH.get(q['quarter'])
        if not month:
            continue
        # Last day of the quarter month (approximate)
        last_day = 31 if month in (1, 3, 5, 7, 8, 10, 12) else 30 if month in (4, 6, 9, 11) else 28
        date_int = year * 10000 + month * 100 + last_day
        timeline.append((date_int, ni))
    return sorted(timeline, key=lambda x: x[0])


def trailing_4q(timeline, as_of_date_int):
    """Sum of net_income for the 4 most recent quarters available on as_of_date."""
    available = [ni for d, ni in timeline if d <= as_of_date_int]
    if len(available) < 1:
        return None
    recent = available[-4:]  # up to 4 quarters
    if len(recent) < 4:
        return None  # not enough history
    return sum(recent)


# ── Chart ─────────────────────────────────────────────────────────────────────

def generate_daily_per_chart(code, output_path=None, lang='ko', color='#e53935', font='noto'):
    setup_font(font)

    stock    = load_stock(code)
    raw_prices = load_daily_prices(code)

    if not raw_prices:
        print('No daily price data available.')
        sys.exit(1)

    # Shares outstanding (approximate constant)
    last_mktcap = stock.get('last_mktcap')
    last_close  = stock.get('last_close_price')
    if not last_mktcap or not last_close:
        print('ERROR: last_mktcap / last_close_price missing in stock JSON')
        sys.exit(1)
    shares = last_mktcap / last_close

    # Build trailing 4Q lookup
    timeline = build_quarter_timeline(stock.get('quarterly', []))
    if not timeline:
        print('No quarterly net_income data available.')
        sys.exit(1)

    # Compute daily P/E
    dates, per_values = [], []
    for date_int, price in raw_prices:
        t4q = trailing_4q(timeline, date_int)
        if t4q is None or t4q <= 0:
            continue
        mktcap = price * shares
        per = mktcap / t4q
        if per <= 0 or per > 500:   # filter absurd values
            continue
        dt = datetime.strptime(str(date_int), '%Y%m%d')
        dates.append(dt)
        per_values.append(round(per, 2))

    if not dates:
        print('No valid P/E data points computed.')
        sys.exit(1)

    per_arr     = np.array(per_values)
    current_per = per_arr[-1]
    hist_avg    = round(float(np.mean(per_arr)), 1)
    hist_min    = round(float(np.min(per_arr)), 1)
    hist_max    = round(float(np.max(per_arr)), 1)
    n_years     = dates[-1].year - dates[0].year + 1

    is_at_low  = current_per <= float(np.percentile(per_arr, 15))
    is_at_high = current_per >= float(np.percentile(per_arr, 85))

    name_ko = stock.get('name', code)
    name_en = stock.get('name_en', name_ko)
    company_name = name_en.title() if lang == 'en' else name_ko

    # ── Figure ────────────────────────────────────────────────────────────────
    fig, ax = plt.subplots(figsize=(FIG_WIDTH, FIG_HEIGHT), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)

    ax.fill_between(dates, per_values, alpha=0.08, color=color, zorder=1)
    ax.plot(dates, per_values, color=color, linewidth=1.6, zorder=3, solid_capstyle='round')

    # Endpoint dot + label
    ax.scatter([dates[-1]], [current_per], color=color, s=55, zorder=5, linewidths=0)
    offset = (hist_max - hist_min) * 0.06
    va = 'bottom' if current_per < hist_max * 0.85 else 'top'
    y_text = current_per + offset if va == 'bottom' else current_per - offset
    ax.text(dates[-1], y_text, f'{current_per:.1f}x',
            fontsize=11, fontweight='bold', color=color,
            va=va, ha='left', zorder=6)

    # Historical avg line
    ax.axhline(hist_avg, color=GRID_COLOR, linewidth=1.2, linestyle='--', zorder=2)
    ax.text(dates[0], hist_avg + offset * 0.5,
            f'{"평균" if lang == "ko" else "Avg"} {hist_avg:.1f}x',
            fontsize=9, color=TEXT_FADED, va='bottom', ha='left', zorder=4)

    if is_at_low:
        ax.axhline(hist_min, color='#cccccc', linewidth=0.8, linestyle=':', zorder=2)

    # ── Axes ──────────────────────────────────────────────────────────────────
    ax.set_ylim(max(0, hist_min * 0.75), hist_max * 1.22)
    ax.set_xlim(dates[0], dates[-1])

    ax.xaxis.set_major_locator(mdates.YearLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter("'%y"))
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f'{v:.0f}'))
    ax.tick_params(axis='both', labelsize=10, colors=TEXT_MUTED, length=0)
    ax.grid(axis='y', linestyle=':', alpha=0.5, color=GRID_COLOR, zorder=0)
    for spine in ax.spines.values():
        spine.set_visible(False)

    # ── Titles ────────────────────────────────────────────────────────────────
    fig.text(0.5, 0.97, 'P/E (Daily)',
             fontsize=20, fontweight='bold', color=TEXT_COLOR, ha='center', va='top')
    fig.text(0.5, 0.88, f'● {code}  {company_name}',
             fontsize=12, color=color, fontweight='bold', ha='center', va='top')

    if is_at_low or is_at_high:
        if is_at_low:
            msg = (f'현재 {current_per:.1f}배 — {n_years}년 중 최저 수준'
                   if lang == 'ko' else
                   f'Currently {current_per:.1f}x — near {n_years}-year low')
            insight_color = '#059669'
        else:
            msg = (f'현재 {current_per:.1f}배 — {n_years}년 중 최고 수준'
                   if lang == 'ko' else
                   f'Currently {current_per:.1f}x — near {n_years}-year high')
            insight_color = '#e53935'
        fig.text(0.5, 0.025, msg,
                 fontsize=11, fontweight='bold', color=insight_color,
                 ha='center', va='bottom', alpha=0.9)

    fig.text(0.98, 0.02, 'kstockview.com',
             fontsize=10, color=TEXT_FADED, ha='right', va='bottom',
             fontweight='bold', alpha=0.7)

    plt.subplots_adjust(left=0.05, right=0.97, top=0.78, bottom=0.13)

    # ── Save ──────────────────────────────────────────────────────────────────
    if output_path:
        filepath = Path(output_path)
    else:
        DEFAULT_OUTPUT.mkdir(parents=True, exist_ok=True)
        filepath = DEFAULT_OUTPUT / f'{code}_daily_per.png'

    fig.savefig(filepath, dpi=DPI, facecolor=BG_COLOR, bbox_inches='tight', pad_inches=0.15)
    plt.close(fig)
    print(f'Saved: {filepath}')
    print(f'  {len(dates)} data points  |  P/E range: {hist_min:.1f}x - {hist_max:.1f}x  |  avg: {hist_avg:.1f}x  |  current: {current_per:.1f}x')
    if is_at_low:
        print(f'  -> Historically LOW ({n_years}-year low)')
    elif is_at_high:
        print(f'  -> Historically HIGH ({n_years}-year high)')
    return filepath


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Daily P/E chart for KR stocks')
    parser.add_argument('stock_code', help='KR stock code (e.g. 005930)')
    parser.add_argument('--output', default=None, help='Output PNG path')
    parser.add_argument('--lang',  default='ko', choices=['ko', 'en'])
    parser.add_argument('--color', default='#e53935', help='Line color hex')
    parser.add_argument('--font',  default='noto', choices=['noto', 'pretendard'])
    args = parser.parse_args()

    generate_daily_per_chart(args.stock_code, args.output, args.lang, args.color, args.font)


if __name__ == '__main__':
    main()
