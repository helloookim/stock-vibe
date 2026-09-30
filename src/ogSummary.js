// Latest-quarter summary for share previews: the OG image (scripts/generate_og_images.mjs)
// and the meta tags crawlers see (functions/[[path]].js). Not imported by the React app.
//
// Only reported figures go in: the latest quarter that has data, the same quarter a year
// earlier, and whether the latest quarter is the highest of the last 40 (all 40 reported).

const QUARTER_NUM = { '1Q': 1, '2Q': 2, '3Q': 3, '4Q': 4 };

// First metric the latest quarter reports is the one shown (banks can lack op_profit/revenue)
const METRICS = [
    { key: 'op', label: '영업이익' },
    { key: 'revenue', label: '매출' },
    { key: 'net', label: '순이익' },
];

// KR codes starting with 9 are foreign companies (900xxx, 950xxx). Their DART figures can be in
// their reporting currency (e.g. 코오롱티슈진 in USD) though the file has no currency field, so
// no figures from them go into previews.
export const isForeignKrListing = (code) => /^9/.test(code);

// KR per-company JSON → rows { year, q, revenue, op, net } (KRW), oldest first
export function krQuarterRows(data) {
    return (data.quarterly || [])
        .filter(r => QUARTER_NUM[r.quarter])
        .map(r => ({ year: r.year, q: QUARTER_NUM[r.quarter], revenue: r.revenue, op: r.op_profit, net: r.net_income }))
        .sort((a, b) => a.year - b.year || a.q - b.q);
}

// US per-ticker JSON → single-quarter rows keyed by fiscal year/quarter (USD), oldest first
export function usQuarterRows(data) {
    const byKey = new Map();
    for (const r of data.quarterly || []) {
        if (r.type !== 'single') continue;
        const m = /^FY(\d{4})Q([1-4])$/.exec(r.fiscal_quarter || '');
        if (!m) continue;
        byKey.set(`${m[1]}-${m[2]}`, {
            year: Number(m[1]), q: Number(m[2]), date: r.date,
            revenue: r.revenue, op: r.operating_income, net: r.net_income,
        });
    }
    return [...byKey.values()].sort((a, b) => a.year - b.year || a.q - b.q);
}

const has = (v) => v != null && Number.isFinite(v);

// Change vs the same quarter a year earlier
function yearOverYear(cur, prev) {
    if (!has(cur) || !has(prev) || cur === 0) return null;
    if (prev <= 0 && cur > 0) return { kind: 'turnProfit', text: '흑자전환' };
    if (prev > 0 && cur < 0) return { kind: 'turnLoss', text: '적자전환' };
    if (prev < 0 && cur < 0) return { kind: 'stillLoss', text: '적자지속' };
    if (prev === 0) return null;
    const ratio = cur / prev;
    if (ratio >= 3) return { kind: 'up', text: `${ratio.toFixed(1)}배` };
    const pct = (ratio - 1) * 100;
    return { kind: pct >= 0 ? 'up' : 'down', text: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` };
}

/**
 * rows → { metric, latest, value, yoy, margin, isTenYearHigh, bars } or null when nothing is reported.
 * bars = up to 8 quarters ending at the latest one: { year, q, value } (value may be null).
 */
export function summarizeQuarters(rows) {
    const idx = rows.findLastIndex(r => METRICS.some(m => has(r[m.key])));
    if (idx < 0) return null;
    const latest = rows[idx];
    const metric = METRICS.find(m => has(latest[m.key]));
    const value = latest[metric.key];
    const prevRow = rows.find(r => r.year === latest.year - 1 && r.q === latest.q);
    const upToLatest = rows.slice(0, idx + 1);
    const last40 = upToLatest.slice(-40).map(r => r[metric.key]);
    const isTenYearHigh = value > 0 && last40.length === 40 && last40.every(has) && value >= Math.max(...last40);
    const margin = metric.key === 'op' && latest.revenue > 0 ? (value / latest.revenue) * 100 : null;
    return {
        metric,
        latest,
        value,
        yoy: yearOverYear(value, prevRow?.[metric.key]),
        margin: margin != null && Math.abs(margin) <= 100 ? margin : null,
        isTenYearHigh,
        bars: upToLatest.slice(-8).map(r => ({ year: r.year, q: r.q, value: has(r[metric.key]) ? r[metric.key] : null })),
    };
}

// ---------------------------------------------------------------- labels + money

// KR: "2026년 2분기"
export const krPeriodLabel = (row) => `${row.year}년 ${row.q}분기`;

// US quarter's last calendar month as { year, month }. A quarter that ends in the first week
// of a month (52/53-week years) is counted as ending the month before.
export function usQuarterEnd(row) {
    const d = String(row.date);
    let year = Number(d.slice(0, 4));
    let month = Number(d.slice(4, 6));
    if (Number(d.slice(6, 8)) <= 7) {
        month -= 1;
        if (month === 0) { month = 12; year -= 1; }
    }
    return { year, month };
}

// US: calendar-year companies read like KR ("2026년 2분기"); others get the fiscal label plus
// the calendar months it covers ("FY2026 3분기 (2026년 3~5월)").
export function usPeriodLabel(row, fyEndMonth) {
    if (fyEndMonth === 12 || !row.date) return `${row.year}년 ${row.q}분기`;
    const { year: endYear, month: endMonth } = usQuarterEnd(row);
    let startMonth = endMonth - 2;
    let startYear = endYear;
    if (startMonth <= 0) { startMonth += 12; startYear -= 1; }
    const months = startYear === endYear
        ? `${endYear}년 ${startMonth}~${endMonth}월`
        : `${startYear}년 ${startMonth}월~${endYear}년 ${endMonth}월`;
    return `FY${row.year} ${row.q}분기 (${months})`;
}

// Short axis label: "26.2Q"
export const shortQuarter = (row) => `${String(row.year).slice(2)}.${row.q}Q`;

// KRW → "60.5조" / "5,422억" / "-4,100만"
export function formatKrwShort(won) {
    if (!has(won)) return '-';
    const sign = won < 0 ? '-' : '';
    const abs = Math.abs(won);
    if (abs >= 0.9995e12) return `${sign}${(abs / 1e12).toFixed(1)}조`;
    if (abs >= 0.95e8) return `${sign}${Math.round(abs / 1e8).toLocaleString('ko-KR')}억`;
    return `${sign}${Math.round(abs / 1e4).toLocaleString('ko-KR')}만`;
}

// USD → "1.39조 달러" / "333억 달러" / "17.5억 달러" / "1,200만 달러"
export function formatUsdKorean(usd) {
    if (!has(usd)) return '-';
    const sign = usd < 0 ? '-' : '';
    const abs = Math.abs(usd);
    if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}조 달러`;
    if (abs >= 1e10) return `${sign}${Math.round(abs / 1e8).toLocaleString('ko-KR')}억 달러`;
    if (abs >= 1e8) return `${sign}${(abs / 1e8).toFixed(1)}억 달러`;
    if (abs >= 1e4) return `${sign}${Math.round(abs / 1e4).toLocaleString('ko-KR')}만 달러`;
    return `${sign}${Math.round(abs).toLocaleString('ko-KR')}달러`;
}

// One sentence for og:description / meta description
export function summarySentence(name, period, summary, formatMoney) {
    if (!summary) return null;
    const { metric, value, yoy, isTenYearHigh } = summary;
    const change = yoy ? ` (전년 동기 대비 ${yoy.text})` : '';
    const high = isTenYearHigh ? ', 최근 10년 분기 최대' : '';
    return `${name} ${period} ${metric.label} ${formatMoney(value)}${change}${high}. 분기별 매출·영업이익·영업이익률·EPS 차트와 재무제표를 확인하세요.`;
}
