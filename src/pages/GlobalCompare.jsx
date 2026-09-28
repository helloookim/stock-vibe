import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe2, Sparkles, ArrowRight, X, Pencil } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';
import SubPageHeader from '../components/SubPageHeader';
import StockPicker from '../components/StockPicker';
import CompareChart from '../components/CompareChart';
import { MetricTabs, ChartControls, changeBadge } from '../components/MetricTabs';
import useThemeColors from '../hooks/useThemeColors';
import useMetricTab from '../hooks/useMetricTab';
import { loadKrCompanyData, processKrCompanyData, loadKrCompanyIndex } from '../krDataLoader';
import { loadUsCompanyData, loadUsCompanyIndex } from '../usDataLoader';
import { rangeFromPreset, defaultRangePreset } from '../chartAxis';
import { chartHeight } from '../chartHeights';
import { summarizeMetric, formatSignedChange } from '../metricSummary';
import { formatUsd, prettyUsName, toDisplaySeries, bestIndex, DISPLAY_MODES } from '../compareUtils';

// Popular rival pairs, grouped by industry (labels in globalCompare.industries)
const POPULAR_PAIRS = [
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

const TAB_KEYS = ['revenue', 'op', 'margin', 'mktcap'];
const METRICS = {
    revenue: { kr: 'revenue', us: 'revenue', yoy: 'rev_change', type: 'usd' },
    op: { kr: 'op_profit', us: 'operating_income', yoy: 'op_change', type: 'usd' },
    margin: { kr: 'op_margin', us: 'op_margin', type: 'percent' },
    mktcap: { type: 'mktcap' },
};

const KR_CODE_RE = /^\d{6}$/;
const isKrCode = (code) => KR_CODE_RE.test(code);

// Normalize KR "1Q"/"2Q".. and US "Q1"/"Q2".. quarter strings to a 1-4 int
function quarterNum(q) {
    const m = String(q).match(/\d/);
    return m ? parseInt(m[0], 10) : null;
}

// Approximate shares outstanding from net_income / eps. Used as a stand-in for
// real share-count data (which isn't available for US filers in this dataset).
function impliedShares(netIncome, eps) {
    if (netIncome == null || eps == null || eps === 0) return null;
    const shares = netIncome / eps;
    if (!isFinite(shares) || shares <= 0) return null;
    return shares;
}

const GlobalCompare = () => {
    const { codes } = useParams();
    const { t, i18n } = useTranslation();
    const colors = useThemeColors();
    const navigate = useNavigate();
    const isEn = i18n.language === 'en';

    // One fixed hue per side across every chart: blue (KR) vs red (US) for maximum contrast
    const KR_COLOR = colors.revenue;
    const US_COLOR = colors.negative;

    const [krCode, usTicker] = useMemo(() => {
        if (!codes) return [null, null];
        const parts = codes.split('-vs-').filter(Boolean);
        return [parts.find(isKrCode) || null, parts.find(p => !isKrCode(p)) || null];
    }, [codes]);

    const [krRaw, setKrRaw] = useState(null);
    const [usData, setUsData] = useState(null);
    const [fxRates, setFxRates] = useState(null);
    const [usPrices, setUsPrices] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('quarterly');
    const [rangePreset, setRangePreset] = useState(defaultRangePreset('quarterly'));
    const [displayMode, setDisplayMode] = useState('amount');
    const [hoveredSide, setHoveredSide] = useState(null);
    const [editingSide, setEditingSide] = useState(null); // 'kr' | 'us' while its picker is open
    const [pendingKr, setPendingKr] = useState(null); // picker page: first pick waits for the second
    const [pendingUs, setPendingUs] = useState(null);
    const [activeTab, setActiveTab] = useMetricTab(TAB_KEYS);

    const [krIndex, setKrIndex] = useState([]);
    const [usIndex, setUsIndex] = useState([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        document.documentElement.classList.add('page-scroll-enabled');
        return () => document.documentElement.classList.remove('page-scroll-enabled');
    }, []);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        loadKrCompanyIndex().then(setKrIndex).catch(() => {});
        loadUsCompanyIndex().then(setUsIndex).catch(() => {});
        fetch('/data/krw_usd_rates.json').then(r => r.json()).then(setFxRates).catch(() => {});
        fetch('/data/us_quarterly_price.json').then(r => r.json()).then(setUsPrices).catch(() => {});
    }, []);

    useEffect(() => {
        if (!krCode || !usTicker) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setEditingSide(null);
        Promise.all([loadKrCompanyData(krCode), loadUsCompanyData(usTicker)])
            .then(([kr, us]) => {
                setKrRaw(kr);
                setUsData(us);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [krCode, usTicker]);

    const krProcessed = useMemo(() => processKrCompanyData(krRaw), [krRaw]);

    // --- names
    const krIndexName = (code) => {
        const c = krIndex.find(x => x.stock_code === code);
        return c ? (isEn ? (c.name_en || c.name) : c.name) : code;
    };
    const usIndexName = (ticker) => prettyUsName(usIndex.find(x => x.ticker === ticker)?.name) || ticker;
    const krName = krRaw ? (isEn ? (krRaw.name_en || krRaw.name) : krRaw.name) : '';
    const usName = usData ? prettyUsName(usData.name) : '';

    // --- search
    const searchKr = (term) => {
        const q = term.toLowerCase();
        return krIndex
            .filter(c => c.stock_code.includes(q) || c.name.toLowerCase().includes(q) || (c.name_en || '').toLowerCase().includes(q))
            .slice(0, 8)
            .map(c => ({ id: c.stock_code, code: c.stock_code, name: isEn ? (c.name_en || c.name) : c.name, meta: c.sector }));
    };
    const searchUs = (term) => {
        const q = term.toLowerCase();
        return usIndex
            .filter(c => c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
            .slice(0, 8)
            .map(c => ({ id: c.ticker, code: c.ticker, name: prettyUsName(c.name) }));
    };

    const openPair = (kr, us) => navigate(`/global-compare/${kr}-vs-${us}${window.location.search}`);

    // --- period controls
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setRangePreset(defaultRangePreset(mode));
    };

    const dataRange = useMemo(() => {
        const krSeries = viewMode === 'annual' ? krProcessed.annualData : krProcessed.quarterlyData;
        const usSeries = viewMode === 'annual' ? usData?.annualData : usData?.quarterlyData;
        const years = [...(krSeries || []), ...(usSeries || [])].map(d => d.year);
        if (years.length === 0) return { min: 2015, max: new Date().getFullYear() };
        return { min: Math.min(...years), max: Math.max(...years) };
    }, [krProcessed, usData, viewMode]);

    const yearRange = rangeFromPreset(rangePreset, dataRange);

    // --- KR (converted to USD) and US series merged on a shared calendar axis
    const merged = useMemo(() => {
        if (!krRaw || !usData || !fxRates) return null;
        const krSeries = viewMode === 'annual' ? krProcessed.annualData : krProcessed.quarterlyData;
        const usSeries = viewMode === 'annual' ? usData.annualData : usData.quarterlyData;
        const keyOf = (year, q) => (viewMode === 'annual' ? `${year}` : `${year}-Q${q}`);
        const fxTable = viewMode === 'annual' ? fxRates.annual : fxRates.quarterly;
        const usPriceTable = usPrices ? (viewMode === 'annual' ? usPrices.annual[usTicker] : usPrices.quarterly[usTicker]) : null;

        const krByKey = new Map(krSeries.map(d => [keyOf(d.year, quarterNum(d.quarter)), d]));
        const usByKey = new Map(usSeries.map(d => [keyOf(d.year, quarterNum(d.calQ)), d]));
        const keys = [...new Set([...krByKey.keys(), ...usByKey.keys()])]
            .filter(key => {
                const year = parseInt(key.slice(0, 4), 10);
                return year >= yearRange[0] && year <= yearRange[1];
            })
            .sort();

        const rows = keys.map(key => {
            const kr = krByKey.get(key) || {};
            const us = usByKey.get(key) || {};
            const fx = fxTable[key];
            const toUsd = (v) => (v != null && fx ? v / fx : null);

            // Market cap = implied shares (net_income / eps) × period-end close price (approximate)
            const krShares = impliedShares(kr.net_income, kr.eps);
            const krMktcap = krShares && kr.close_price ? toUsd(krShares * kr.close_price) : null;
            const usShares = impliedShares(us.net_income, us.eps);
            const usPrice = usPriceTable ? usPriceTable[key] : null;
            const usMktcap = usShares && usPrice ? usShares * usPrice : null;

            return {
                key,
                year: parseInt(key.slice(0, 4), 10),
                displayLabel: viewMode === 'annual' ? key : key.replace('-', ' '),
                fx,
                kr: {
                    ...kr,
                    revenue_usd: toUsd(kr.revenue), op_usd: toUsd(kr.op_profit), ni_usd: toUsd(kr.net_income),
                    mktcap_usd: krMktcap,
                },
                us: { ...us, mktcap_usd: usMktcap },
            };
        });
        return { rows, usPriceTable };
    }, [krRaw, usData, fxRates, usPrices, usTicker, viewMode, krProcessed, yearRange[0], yearRange[1]]); // eslint-disable-line react-hooks/exhaustive-deps

    const metric = METRICS[activeTab];
    const supportsModes = metric.type === 'usd';
    const mode = supportsModes ? displayMode : 'amount';
    const series = [
        { id: 'kr', name: krName, color: KR_COLOR },
        { id: 'us', name: usName, color: US_COLOR },
    ];

    // Chart rows for the active tab: { displayLabel, year, kr, us, krLocal, fx }
    const chartData = useMemo(() => {
        if (!merged) return [];
        const { rows } = merged;
        const base = rows.map(r => ({ displayLabel: r.displayLabel, year: r.year, fx: r.fx, krLocal: null }));
        if (metric.type === 'mktcap') {
            rows.forEach((r, i) => { base[i].kr = r.kr.mktcap_usd; base[i].us = r.us.mktcap_usd; });
            return base;
        }
        if (metric.type === 'percent') {
            rows.forEach((r, i) => { base[i].kr = r.kr.op_margin ?? null; base[i].us = r.us.op_margin ?? null; });
            return base;
        }
        // USD metrics: amount / index use USD values; growth uses each side's native-currency YoY
        const krUsdField = activeTab === 'revenue' ? 'revenue_usd' : 'op_usd';
        const krVals = toDisplaySeries(rows.map(r => r.kr), mode === 'growth' ? metric.kr : krUsdField, metric.yoy, mode);
        const usVals = toDisplaySeries(rows.map(r => r.us), metric.us, metric.yoy, mode);
        rows.forEach((r, i) => {
            base[i].kr = krVals[i];
            base[i].us = usVals[i];
            base[i].krLocal = r.kr[metric.kr] ?? null;
        });
        return base;
    }, [merged, activeTab, mode, metric]);

    const hasChartData = chartData.some(r => r.kr != null || r.us != null);

    const tickFormatter = mode === 'growth' ? (v) => `${v}%`
        : mode === 'index' ? (v) => `${v}`
        : metric.type === 'percent' ? (v) => `${v}%`
        : (v) => formatUsd(v, 0);
    const formatValue = (v) => {
        if (v == null) return '-';
        if (mode === 'growth') return formatSignedChange(v);
        if (mode === 'index') return v.toLocaleString();
        if (metric.type === 'percent') return `${v}%`;
        return formatUsd(v, 2);
    };
    const tooltipExtra = (row, id) => (id === 'kr' && mode === 'amount' && metric.type === 'usd' && row.krLocal != null ? (
        <span style={{ color: colors.textFaded }}> ({(row.krLocal / 1e8).toLocaleString(undefined, { maximumFractionDigits: 0 })}억원 @ {row.fx?.toLocaleString()}원)</span>
    ) : null);

    // --- per-company headline cards (latest value in USD, YoY in each side's own currency)
    const isQuarterly = viewMode === 'quarterly';
    const headlineCards = (() => {
        if (!merged) return [];
        const sides = [
            { side: 'kr', name: krName, color: KR_COLOR, native: metric.kr, usd: activeTab === 'revenue' ? 'revenue_usd' : 'op_usd' },
            { side: 'us', name: usName, color: US_COLOR, native: metric.us, usd: metric.us },
        ];
        return sides.map(s => {
            const rows = merged.rows.map(r => ({ ...r[s.side], displayLabel: r.displayLabel, year: r.year })).filter(r => r[s.native] != null || metric.type === 'mktcap');
            if (metric.type === 'mktcap') {
                const last = [...merged.rows].reverse().find(r => r[s.side].mktcap_usd != null);
                return { ...s, value: last ? formatUsd(last[s.side].mktcap_usd, 2) : '-', period: last?.displayLabel };
            }
            const sum = summarizeMetric(rows, s.native, { changeKey: metric.yoy, isQuarterly });
            if (!sum) return { ...s, value: '-' };
            const value = metric.type === 'percent' ? `${sum.value}%` : formatUsd(sum.latest[s.usd], 2);
            const badge = changeBadge({ ...sum, changePrefix: t(isQuarterly ? 'metricTabs.yoyQuarterly' : 'metricTabs.yoyAnnual') }, t);
            return { ...s, value, period: sum.latest.displayLabel, badge };
        });
    })();

    // --- summary table (latest period of the current view per company)
    const tableRows = useMemo(() => {
        if (!merged) return [];
        const latestOf = (side, field) => [...merged.rows].reverse().find(r => r[side][field] != null);
        const krRow = latestOf('kr', 'revenue');
        const usRow = latestOf('us', 'revenue');
        const kr = krRow?.kr || {};
        const us = usRow?.us || {};
        const krMk = latestOf('kr', 'mktcap_usd');
        const usMk = latestOf('us', 'mktcap_usd');

        // US PER (TTM) = latest quarter-end price ÷ sum of the last four quarterly EPS
        const usQuarters = usData?.quarterlyData || [];
        const last4 = usQuarters.slice(-4);
        const lastKey = last4.length ? `${last4[3].year}-Q${quarterNum(last4[3].calQ)}` : null;
        const usPriceNow = lastKey && usPrices?.quarterly?.[usTicker]?.[lastKey];
        const ttmEps = last4.length === 4 && last4.every(q => q.eps != null) ? last4.reduce((s, q) => s + q.eps, 0) : null;
        const usPer = usPriceNow && ttmEps > 0 ? parseFloat((usPriceNow / ttmEps).toFixed(1)) : null;

        const usd = (v) => formatUsd(v, 2);
        const netMargin = (d, rev) => (d.net_income != null && d[rev] ? parseFloat(((d.net_income / d[rev]) * 100).toFixed(1)) : null);
        return [
            { label: t('compare.period'), values: [krRow?.displayLabel ?? '-', usRow?.displayLabel ?? '-'] },
            { label: t('globalCompare.revenueUsd'), raw: [kr.revenue_usd, us.revenue], fmt: usd, best: 'max' },
            { label: t('globalCompare.opIncomeUsd'), raw: [kr.op_usd, us.operating_income], fmt: usd, best: 'max' },
            { label: t('globalCompare.netIncomeUsd'), raw: [kr.ni_usd, us.net_income], fmt: usd, best: 'max' },
            { label: t('compare.opMargin'), raw: [kr.op_margin, us.op_margin], fmt: v => (v != null ? `${v}%` : '-'), best: 'max' },
            { label: t('globalCompare.netMargin'), raw: [netMargin(kr, 'revenue'), netMargin(us, 'revenue')], fmt: v => (v != null ? `${v}%` : '-'), best: 'max' },
            { label: t('compare.revenueGrowth'), raw: [kr.rev_change, us.rev_change], fmt: v => (v != null ? formatSignedChange(v) : '-'), best: 'max' },
            { label: t('globalCompare.marketCapLatest'), raw: [krMk?.kr.mktcap_usd, usMk?.us.mktcap_usd], fmt: usd },
            { label: t('globalCompare.perTtm'), raw: [krRaw?.last_per, usPer], fmt: v => (v != null ? `${v.toFixed(1)}x` : '-'), best: 'minPositive' },
        ].map(row => ({
            ...row,
            values: row.values || row.raw.map(v => row.fmt(v ?? null)),
            bestAt: row.best ? bestIndex(row.raw, row.best) : -1,
        }));
    }, [merged, usData, usPrices, usTicker, krRaw, t]);

    const pageTitle = (krCode && usTicker)
        ? t('globalCompare.title', { kr: krName, us: usName })
        : t('globalCompare.defaultTitle');

    // ---------------------------------------------------------------- picker page (no pair yet)
    if (!krCode || !usTicker) {
        const pickKr = (code) => (pendingUs ? openPair(code, pendingUs) : setPendingKr(code));
        const pickUs = (ticker) => (pendingKr ? openPair(pendingKr, ticker) : setPendingUs(ticker));
        const renderSide = (side) => {
            const isKr = side === 'kr';
            const pending = isKr ? pendingKr : pendingUs;
            const color = isKr ? KR_COLOR : US_COLOR;
            return (
                <div className="gc-picker-col">
                    <label style={{ color }}>
                        {isKr ? '\u{1F1F0}\u{1F1F7}' : '\u{1F1FA}\u{1F1F8}'} {t(isKr ? 'globalCompare.pickKr' : 'globalCompare.pickUs')}
                    </label>
                    {pending ? (
                        <div className="gc-picked" style={{ borderColor: color }}>
                            <span className="gc-picked-name" style={{ color }}>{isKr ? krIndexName(pending) : usIndexName(pending)}</span>
                            <span className="gc-picked-code">{pending}</span>
                            <button onClick={() => (isKr ? setPendingKr(null) : setPendingUs(null))} aria-label="✕"><X size={14} /></button>
                        </div>
                    ) : (
                        <StockPicker
                            search={isKr ? searchKr : searchUs}
                            onPick={isKr ? pickKr : pickUs}
                            placeholder={t('compare.searchPlaceholder')}
                            accentColor={color}
                        />
                    )}
                </div>
            );
        };
        return (
            <div className="compare-page">
                <SEOHead
                    title={t('globalCompare.defaultTitle')}
                    description={t('globalCompare.pickerDescription')}
                    canonical="https://kstockview.com/global-compare"
                />
                <SubPageHeader />
                <div className="compare-inner gc-picker-inner">
                    <div className="gc-hero">
                        <h1 className="gc-logo">
                            <Globe2 size={30} style={{ verticalAlign: '-4px', marginRight: '8px', color: '#7B5EA7' }} />
                            {t('globalCompare.heroTitle')}
                        </h1>
                        <p className="gc-tagline">{t('globalCompare.heroSubtitle')}</p>
                        <div className="gc-badge">
                            <Sparkles size={15} />
                            <span>{t('globalCompare.fxBadge')}</span>
                        </div>
                    </div>

                    <div className="gc-picker-row">
                        {renderSide('kr')}
                        {renderSide('us')}
                    </div>
                    {(pendingKr || pendingUs) && <p className="gc-picker-hint">{t('globalCompare.pickBoth')}</p>}

                    <p className="gc-section-label">{t('globalCompare.popularPairs')}</p>
                    <div className="gc-pair-grid" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
                        {POPULAR_PAIRS.map(p => (
                            <Link key={p.kr + p.us} to={`/global-compare/${p.kr}-vs-${p.us}`} className="gc-pair-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                    <span style={{ fontSize: '1.3rem' }}>{p.emoji}</span>
                                    <div style={{ minWidth: 0 }}>
                                        <span className="gc-pair-industry">{t(`globalCompare.industries.${p.industry}`)}</span>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>
                                            <span style={{ color: KR_COLOR }}>{krIndexName(p.kr)}</span>
                                            <span style={{ color: colors.textFaded, fontWeight: 400, margin: '0 6px' }}>vs</span>
                                            <span style={{ color: US_COLOR }}>{usIndexName(p.us)}</span>
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight size={16} style={{ color: colors.textFaded, flexShrink: 0 }} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ---------------------------------------------------------------- comparison page
    const renderCompanyCard = (side) => {
        const isKr = side === 'kr';
        const color = isKr ? KR_COLOR : US_COLOR;
        return (
            <div className="gc-company" style={{ borderColor: color }}>
                <div className="gc-company-main">
                    <span className="gc-company-flag">{isKr ? '\u{1F1F0}\u{1F1F7}' : '\u{1F1FA}\u{1F1F8}'}</span>
                    <div style={{ minWidth: 0 }}>
                        <Link to={isKr ? `/stocks/${krCode}` : `/us-stocks/${usTicker}`} className="gc-company-name" style={{ color }}>
                            {isKr ? krName : usName}
                        </Link>
                        <span className="gc-company-code">{isKr ? krCode : usTicker}</span>
                    </div>
                    <button className="gc-company-change" onClick={() => setEditingSide(editingSide === side ? null : side)}>
                        <Pencil size={12} /> {t('globalCompare.change')}
                    </button>
                </div>
                {editingSide === side && (
                    <div className="gc-company-picker">
                        <StockPicker
                            autoFocus
                            search={isKr ? searchKr : searchUs}
                            onPick={(id) => (isKr ? openPair(id, usTicker) : openPair(krCode, id))}
                            onClose={() => setEditingSide(null)}
                            placeholder={t('compare.searchPlaceholder')}
                            accentColor={color}
                        />
                    </div>
                )}
            </div>
        );
    };

    const renderTable = () => (
        isMobile ? (
            <div className="compare-cards">
                {series.map((s, ci) => (
                    <div key={s.id} className="compare-card-company" style={{ borderTopColor: s.color }}>
                        <span className="compare-card-company-name" style={{ color: s.color }}>{s.name}</span>
                        {tableRows.map(row => (
                            <div key={row.label} className="compare-card-row">
                                <span>{row.label}</span>
                                <span className={row.bestAt === ci ? 'is-best' : ''}>
                                    {row.bestAt === ci && <span className="best-dot" aria-hidden="true">●</span>}
                                    {row.values[ci]}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        ) : (
            <div className="compare-table-wrap">
                <table className="compare-table">
                    <thead>
                        <tr>
                            <th></th>
                            {series.map(s => <th key={s.id} style={{ color: s.color }}>{s.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows.map(row => (
                            <tr key={row.label}>
                                <td className="compare-table-label">{row.label}</td>
                                {row.values.map((v, ci) => (
                                    <td key={ci} className={row.bestAt === ci ? 'is-best' : ''}>
                                        {row.bestAt === ci && <span className="best-dot" aria-hidden="true">●</span>}
                                        {v}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    );

    const marketCapAvailable = !!merged?.usPriceTable && chartData.some(r => r.kr != null || r.us != null);

    return (
        <>
            <SEOHead
                title={pageTitle}
                description={t('globalCompare.description', { kr: krName, us: usName })}
                canonical={`https://kstockview.com/global-compare/${krCode}-vs-${usTicker}`}
            />
            <div className="compare-page">
                <SubPageHeader />
                <div className="compare-inner">
                    {/* Header: one card per side (with a change picker), share on the right */}
                    <div className="gc-header">
                        <div className="gc-companies">
                            {renderCompanyCard('kr')}
                            <span className="gc-vs">vs</span>
                            {renderCompanyCard('us')}
                        </div>
                        <ShareButtons companyName={`${krName} vs ${usName}`} stockCode={`${krCode}-vs-${usTicker}`} />
                    </div>
                    <p className="gc-fx-note">{t('globalCompare.fxNote')}</p>

                    {loading || !merged ? (
                        <div className="metric-empty">{t('common.loading')}</div>
                    ) : (
                        <>
                            <MetricTabs
                                tabs={TAB_KEYS.map(key => ({
                                    key,
                                    label: key === 'mktcap' ? t('compare.marketCap') : t(`metricTabs.tabs.${key}`),
                                }))}
                                activeTab={activeTab}
                                onChange={setActiveTab}
                            />
                            <ChartControls
                                viewMode={viewMode}
                                onViewModeChange={handleViewModeChange}
                                rangePreset={rangePreset}
                                onRangePresetChange={setRangePreset}
                                rangeText={`${yearRange[0]} – ${yearRange[1]}`}
                            />

                            <div className="compare-headlines">
                                {headlineCards.map(h => (
                                    <div
                                        key={h.side}
                                        className="compare-headline"
                                        style={{ borderTopColor: h.color }}
                                        onMouseEnter={() => setHoveredSide(h.side)}
                                        onMouseLeave={() => setHoveredSide(null)}
                                    >
                                        <span className="compare-headline-name" style={{ color: h.color }}>
                                            {h.name}
                                            {h.period && <span className="compare-headline-period">{h.period}</span>}
                                        </span>
                                        <span className="compare-headline-value">{h.value}</span>
                                        {h.badge && <span className={`metric-change-badge ${h.badge.up ? 'up' : 'down'}`}>{h.badge.text}</span>}
                                    </div>
                                ))}
                            </div>

                            {supportsModes && (
                                <div className="compare-mode-row">
                                    <div className="chart-controls-group" role="radiogroup">
                                        {DISPLAY_MODES.map(m => (
                                            <button
                                                key={m}
                                                role="radio"
                                                aria-checked={displayMode === m}
                                                className={`chart-chip ${displayMode === m ? 'active' : ''}`}
                                                onClick={() => setDisplayMode(m)}
                                            >
                                                {t(`compare.mode.${m}`)}
                                            </button>
                                        ))}
                                    </div>
                                    {mode !== 'amount' && (
                                        <span className="compare-mode-note">
                                            {t(mode === 'index' ? 'compare.indexNote' : 'globalCompare.growthNote')}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="chart-section">
                                {activeTab === 'mktcap' && <p className="compare-chart-note">{t('globalCompare.marketCapNote')}</p>}
                                {activeTab === 'mktcap' && !marketCapAvailable ? (
                                    <div className="metric-empty">{t('globalCompare.marketCapUnavailable')}</div>
                                ) : hasChartData ? (
                                    <CompareChart
                                        data={chartData}
                                        series={series}
                                        kind={mode === 'amount' && metric.type === 'usd' ? 'bar' : 'line'}
                                        mode={mode}
                                        height={chartHeight(activeTab === 'mktcap' ? 'single' : 'bare', isMobile)}
                                        isMobile={isMobile}
                                        colors={colors}
                                        tickFormatter={tickFormatter}
                                        formatValue={formatValue}
                                        tooltipExtra={tooltipExtra}
                                        highlightId={hoveredSide}
                                    />
                                ) : (
                                    <div className="metric-empty">{t('compare.noData')}</div>
                                )}
                            </div>

                            <div className="compare-table-header">
                                <h2>{t('compare.tableTitle')}</h2>
                                <span>{t('globalCompare.bestNote')}</span>
                            </div>
                            {renderTable()}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default GlobalCompare;
