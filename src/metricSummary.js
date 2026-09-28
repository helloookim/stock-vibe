// Headline + stat figures for one metric over the visible chart range,
// shared by the KR (App.jsx) and US (UsStockPage.jsx) metric tabs.

const round1 = (v) => parseFloat(v.toFixed(1));

// Quarter number from KR ("1Q") or US ("Q1") entries; 0 for annual entries
const quarterNum = (d) => parseInt(String(d.quarter || d.calQ || '').replace(/\D/g, ''), 10) || 0;
const periodIndex = (d) => d.year * 4 + quarterNum(d);

/**
 * @param {Array} data        chart rows (already filtered by the year range)
 * @param {string} valueKey   field to summarize (e.g. 'revenue', 'op_margin')
 * @param {object} opts
 *   changeKey   precomputed YoY % field (e.g. 'rev_change'); omit to use %p vs a year earlier
 *   isQuarterly whether rows are quarters (enables TTM and 4Q-sum CAGR)
 */
export function summarizeMetric(data, valueKey, { changeKey, isQuarterly } = {}) {
    const rows = (data || []).filter(d => d[valueKey] != null);
    if (rows.length === 0) return null;

    const latest = rows[rows.length - 1];
    const values = rows.map(d => d[valueKey]);
    const best = rows.reduce((a, b) => (b[valueKey] > a[valueKey] ? b : a));

    // Same period a year earlier (same quarter for quarterly rows)
    const prev = rows.find(d => d.year === latest.year - 1 && quarterNum(d) === quarterNum(latest));
    let change = null;
    let changeUnit = '%';
    // How to phrase the change: plain %, "N.N배" for ≥ +100%, or a profit/loss turnaround
    let changeKind = 'pct';
    let multiple = null;
    if (changeKey) {
        change = latest[changeKey] ?? null;
        const cur = latest[valueKey];
        const before = prev?.[valueKey];
        if (before != null && before < 0 && cur > 0) changeKind = 'turnProfit';
        else if (before != null && before > 0 && cur < 0) changeKind = 'turnLoss';
        else if (before != null && before < 0 && cur < 0) changeKind = 'lossContinued';
        else if (change != null && change >= 100 && before > 0) {
            changeKind = 'multiple';
            multiple = round1(cur / before);
        }
    } else if (prev) {
        change = round1(latest[valueKey] - prev[valueKey]);
        changeUnit = '%p';
    }

    // Trailing four quarters — only when they are consecutive
    let ttm = null;
    if (isQuarterly && rows.length >= 4) {
        const last4 = rows.slice(-4);
        if (periodIndex(last4[3]) - periodIndex(last4[0]) === 3) {
            ttm = last4.reduce((s, d) => s + d[valueKey], 0);
        }
    }

    // CAGR: annual rows compare first vs last year; quarterly rows compare
    // the first vs last 4-quarter sums to cancel out seasonality
    let cagr = null;
    let first = null;
    let last = null;
    let years = 0;
    if (isQuarterly) {
        if (rows.length >= 8) {
            first = rows.slice(0, 4).reduce((s, d) => s + d[valueKey], 0);
            last = rows.slice(-4).reduce((s, d) => s + d[valueKey], 0);
            years = (periodIndex(rows[rows.length - 1]) - periodIndex(rows[3])) / 4;
        }
    } else if (rows.length >= 2) {
        first = rows[0][valueKey];
        last = latest[valueKey];
        years = latest.year - rows[0].year;
    }
    if (first > 0 && last > 0 && years > 0) {
        cagr = round1(((last / first) ** (1 / years) - 1) * 100);
    }

    return {
        latest,
        value: latest[valueKey],
        change,
        changeUnit,
        changeKind,
        multiple,
        best,
        bestValue: best[valueKey],
        positive: values.filter(v => v > 0).length,
        total: values.length,
        average: round1(values.reduce((s, v) => s + v, 0) / values.length),
        ttm,
        cagr,
        cagrYears: years,
    };
}

// Bar coloring: a loss, or lower than the same period a year earlier
export const isDecline = (value, change) =>
    value != null && (value < 0 || (change != null && change < 0));

// "+12.4%" / "-3.1%p"
export const formatSignedChange = (value, unit = '%') =>
    `${value > 0 ? '+' : ''}${value.toFixed(1)}${unit}`;
