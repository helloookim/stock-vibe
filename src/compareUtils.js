// Formatting + series helpers shared by the compare pages (Compare.jsx, GlobalCompare.jsx)

const trimZeros = (n, digits) => parseFloat(n.toFixed(digits)).toLocaleString(undefined, { maximumFractionDigits: digits });

// KRW amount given in 억 → "333조 6,059억" / "5,422억" (ko), "₩33.4T" / "₩542.2B" (en)
export function formatEok(eok, isEn) {
    if (eok == null || !Number.isFinite(eok)) return '-';
    const sign = eok < 0 ? '-' : '';
    const abs = Math.abs(eok);
    if (isEn) {
        if (abs >= 10000) return `${sign}₩${trimZeros(abs / 10000, 1)}T`;
        return `${sign}₩${trimZeros(abs / 10, 1)}B`;
    }
    if (abs >= 10000) {
        const jo = Math.floor(abs / 10000);
        const rest = Math.round(abs % 10000);
        return rest ? `${sign}${jo}조 ${rest.toLocaleString()}억` : `${sign}${jo}조`;
    }
    return `${sign}${Math.round(abs).toLocaleString()}억`;
}

// Axis ticks for 억 values; the unit is chosen once per axis from its largest value
export function eokAxisFormatter(maxAbs, isEn) {
    const inJo = maxAbs >= 10000;
    return (v) => {
        const sign = v < 0 ? '-' : '';
        const abs = Math.abs(v);
        if (isEn) return inJo ? `${sign}₩${trimZeros(abs / 10000, 1)}T` : `${sign}₩${trimZeros(abs / 10, 0)}B`;
        return inJo ? `${sign}${trimZeros(abs / 10000, 1)}조` : `${sign}${Math.round(abs).toLocaleString()}억`;
    };
}

// USD amount → "$60B", "-$15B", "$950M", "$1.2T"
export function formatUsd(value, digits = 1) {
    if (value == null || !Number.isFinite(value)) return '-';
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    if (abs >= 1e12) return `${sign}$${trimZeros(abs / 1e12, 2)}T`;
    if (abs >= 1e9) return `${sign}$${trimZeros(abs / 1e9, digits)}B`;
    if (abs >= 1e6) return `${sign}$${trimZeros(abs / 1e6, 0)}M`;
    return `${sign}$${Math.round(abs).toLocaleString()}`;
}

// 'COM' covers SEC names like "AMAZON COM INC"
const NAME_SUFFIXES = new Set(['INC', 'CORP', 'CO', 'LTD', 'PLC', 'NV', 'SA', 'AG', 'LP', 'LLC', 'INCORPORATED', 'CORPORATION', 'COMPANY', 'COM']);

// Display name for SEC company names: drops the legal suffix ("Tesla, Inc." → "Tesla",
// "General Motors Co" → "General Motors") and title-cases ALL-CAPS names
// ("MICRON TECHNOLOGY INC" → "Micron Technology"). Mixed-case words are left alone.
export function prettyUsName(name) {
    if (!name) return '';
    const cleaned = name.replace(/\s*\/[A-Z]{2,4}\/?$/i, '').trim(); // "/NEW", "/DE/"
    const words = cleaned.split(/\s+/);
    const bare = (w) => w.replace(/[.,]/g, '').toUpperCase();
    // keep "& Co" ("Eli Lilly & Co") — the suffix is part of the name there
    while (words.length > 1 && NAME_SUFFIXES.has(bare(words[words.length - 1])) && words[words.length - 2] !== '&') words.pop();
    const core = words.filter(w => !NAME_SUFFIXES.has(bare(w))).join(' ');
    // title-case ALL-CAPS names, except a lone short word that is likely an acronym (RTX, IBM)
    const allCaps = core === core.toUpperCase() && !(words.length === 1 && core.length <= 4);
    return words
        .map(w => (allCaps && !/\d|&/.test(w) && w.length > 2 ? w.charAt(0) + w.slice(1).toLowerCase() : w))
        .join(' ')
        .replace(/,$/, '');
}

// Chart display modes for money-like metrics
export const DISPLAY_MODES = ['amount', 'growth', 'index'];

/**
 * Re-express one company's series for the chosen display mode.
 * amount → value as is; growth → YoY % (from yoyKey); index → first positive value in range = 100.
 */
export function toDisplaySeries(rows, valueKey, yoyKey, mode) {
    if (mode === 'growth') return rows.map(r => r[yoyKey] ?? null);
    if (mode === 'index') {
        const base = rows.find(r => r[valueKey] != null && r[valueKey] > 0)?.[valueKey];
        return rows.map(r => (base && r[valueKey] != null ? parseFloat(((r[valueKey] / base) * 100).toFixed(1)) : null));
    }
    return rows.map(r => r[valueKey] ?? null);
}

// Index of the "best" value in a row of per-company values ('max' | 'minPositive'), or -1 if not meaningful
export function bestIndex(values, rule) {
    let best = -1;
    values.forEach((v, i) => {
        if (v == null || !Number.isFinite(v)) return;
        if (rule === 'minPositive' && v <= 0) return;
        if (best === -1) { best = i; return; }
        if (rule === 'max' ? v > values[best] : v < values[best]) best = i;
    });
    const valid = values.filter(v => v != null && Number.isFinite(v) && (rule !== 'minPositive' || v > 0));
    return valid.length >= 2 ? best : -1;
}

// Popular KR–US rival pairs, grouped by industry (labels in globalCompare.industries).
// Also read by scripts/generate_og_images.mjs, which renders a share image per pair.
export const POPULAR_PAIRS = [
    { kr: '000660', us: 'MU', industry: 'semis', emoji: '\u{1F4BE}' },
    { kr: '005930', us: 'INTC', industry: 'semis', emoji: '\u{1F9E0}' },
    { kr: '005930', us: 'AAPL', industry: 'electronics', emoji: '\u{1F4F1}' },
    { kr: '005380', us: 'GM', industry: 'autos', emoji: '\u{1F697}' },
    { kr: '000270', us: 'TSLA', industry: 'autos', emoji: '\u{1F699}' },
    { kr: '373220', us: 'TSLA', industry: 'battery', emoji: '\u{1F50B}' },
    { kr: '035420', us: 'META', industry: 'internet', emoji: '\u{1F310}' },
    { kr: '207940', us: 'TMO', industry: 'bio', emoji: '\u{1F9EA}' },
    { kr: '068270', us: 'AMGN', industry: 'bio', emoji: '\u{1F48A}' },
    { kr: '012450', us: 'LMT', industry: 'defense', emoji: '\u{1F6E1}' },
];
