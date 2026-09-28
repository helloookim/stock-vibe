import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Plus } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';
import SubPageHeader from '../components/SubPageHeader';
import StockPicker from '../components/StockPicker';
import CompareChart from '../components/CompareChart';
import { MetricTabs, ChartControls, changeBadge } from '../components/MetricTabs';
import useThemeColors from '../hooks/useThemeColors';
import useMetricTab from '../hooks/useMetricTab';
import { loadKrCompanyData, processKrCompanyData, loadKrCompanyIndex } from '../krDataLoader';
import { rangeFromPreset } from '../chartAxis';
import { chartHeight } from '../chartHeights';
import { summarizeMetric, formatSignedChange } from '../metricSummary';
import { formatEok, eokAxisFormatter, toDisplaySeries, bestIndex, DISPLAY_MODES } from '../compareUtils';

const MAX_STOCKS = 3;

// Tabs and how each metric is read from processKrCompanyData rows
const METRICS = {
    revenue: { field: 'revenue', yoy: 'rev_change', type: 'money' },
    op: { field: 'op_profit', yoy: 'op_change', type: 'money' },
    ni: { field: 'net_income', yoy: 'ni_change', type: 'money' },
    margin: { field: 'op_margin', type: 'percent' },
    eps: { field: 'eps', yoy: 'eps_change', type: 'won' },
    valuation: { type: 'multiple' },
};
const TAB_KEYS = Object.keys(METRICS);

// With up to three companies side by side, quarterly bars get crowded fast: default to 3 years
const defaultPreset = (viewMode) => (viewMode === 'annual' ? 'all' : '3y');

const periodKey = (d) => `${d.year}-${d.quarter || ''}`;

const Compare = () => {
    const { codes } = useParams();
    const { t, i18n } = useTranslation();
    const colors = useThemeColors();
    const navigate = useNavigate();
    const isEn = i18n.language === 'en';

    const [companiesData, setCompaniesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);
    const [companyIndex, setCompanyIndex] = useState([]);
    const [viewMode, setViewMode] = useState('quarterly');
    const [rangePreset, setRangePreset] = useState(defaultPreset('quarterly'));
    const [displayMode, setDisplayMode] = useState('amount');
    const [hoveredCode, setHoveredCode] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useMetricTab(TAB_KEYS);

    // One fixed, theme-aware hue per company across every chart and the table
    const SERIES_COLORS = [colors.revenue, colors.opIncome, colors.netIncome];

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

    const stockCodes = useMemo(() => {
        if (!codes) return [];
        return codes.split('-vs-').filter(Boolean).slice(0, MAX_STOCKS);
    }, [codes]);

    useEffect(() => {
        loadKrCompanyIndex().then(setCompanyIndex).catch(() => {});
    }, []);

    useEffect(() => {
        if (stockCodes.length === 0) {
            setLoading(false);
            return;
        }
        setLoading(true);
        Promise.all(stockCodes.map(code => loadKrCompanyData(code)))
            .then(results => {
                const processed = results.map((raw, i) => {
                    if (!raw) return null;
                    const { quarterlyData, annualData } = processKrCompanyData(raw);
                    return {
                        code: stockCodes[i],
                        name: raw.name,
                        name_en: raw.name_en || raw.name,
                        sector: raw.sector,
                        quarterlyData,
                        annualData,
                        raw,
                    };
                }).filter(Boolean);
                setCompaniesData(processed);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [stockCodes]);

    const nameOf = (c) => (isEn ? c.name_en : c.name);
    const series = companiesData.map((c, i) => ({ id: c.code, name: nameOf(c), color: SERIES_COLORS[i % SERIES_COLORS.length] }));

    // --- search + same-industry suggestions
    const searchStocks = (term) => {
        const q = term.toLowerCase();
        return companyIndex
            .filter(c => !stockCodes.includes(c.stock_code))
            .filter(c => c.stock_code.includes(q) || c.name.toLowerCase().includes(q) || (c.name_en || '').toLowerCase().includes(q))
            .slice(0, 8)
            .map(c => ({ id: c.stock_code, code: c.stock_code, name: isEn ? (c.name_en || c.name) : c.name, meta: c.sector }));
    };

    const suggestions = useMemo(() => {
        const sector = companiesData[0]?.sector;
        if (!sector || stockCodes.length >= MAX_STOCKS) return [];
        return companyIndex
            .filter(c => c.sector === sector && !stockCodes.includes(c.stock_code))
            .sort((a, b) => (b.last_mktcap || 0) - (a.last_mktcap || 0))
            .slice(0, 5);
    }, [companyIndex, companiesData, stockCodes]);

    const addStock = (code) => {
        const newCodes = [...stockCodes, code].slice(0, MAX_STOCKS);
        navigate(`/compare/${newCodes.join('-vs-')}${window.location.search}`);
        setSearchOpen(false);
    };

    const removeStock = (code) => {
        const newCodes = stockCodes.filter(c => c !== code);
        if (newCodes.length === 0) navigate('/');
        else navigate(`/compare/${newCodes.join('-vs-')}${window.location.search}`);
    };

    // --- period controls
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setRangePreset(defaultPreset(mode));
    };

    const seriesOf = (c) => (viewMode === 'annual' ? c.annualData : c.quarterlyData);

    const dataRange = useMemo(() => {
        const years = companiesData.flatMap(c => seriesOf(c).map(d => d.year));
        if (years.length === 0) return { min: 2015, max: new Date().getFullYear() };
        return { min: Math.min(...years), max: Math.max(...years) };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companiesData, viewMode]);

    const yearRange = rangeFromPreset(rangePreset, dataRange);

    // Rows per company inside the selected years, plus the merged, sorted period axis
    const { periods, rowsByCode } = useMemo(() => {
        const byCode = {};
        const all = new Map();
        companiesData.forEach(c => {
            const rows = seriesOf(c).filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]);
            byCode[c.code] = new Map(rows.map(d => [periodKey(d), d]));
            rows.forEach(d => all.set(periodKey(d), { displayLabel: d.displayLabel, year: d.year, quarter: d.quarter }));
        });
        const sorted = [...all.values()].sort((a, b) => a.year - b.year || String(a.quarter).localeCompare(String(b.quarter)));
        return { periods: sorted, rowsByCode: byCode };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companiesData, viewMode, yearRange[0], yearRange[1]]);

    const metric = METRICS[activeTab];
    const supportsModes = metric.type === 'money' || metric.type === 'won';
    const mode = supportsModes ? displayMode : 'amount';

    // Chart rows for the active metric: { displayLabel, year, [code]: value }
    const buildChartData = (field, yoy, chartMode) => {
        const rows = periods.map(p => ({ displayLabel: p.displayLabel, year: p.year }));
        companiesData.forEach(c => {
            const aligned = periods.map(p => rowsByCode[c.code]?.get(periodKey(p)) || {});
            const values = toDisplaySeries(aligned, field, yoy, chartMode);
            values.forEach((v, i) => {
                let out = v;
                if (out != null && chartMode === 'amount' && metric.type === 'money') out = out / 1e8; // 억
                rows[i][c.code] = out;
            });
        });
        return rows;
    };

    const chartData = metric.field ? buildChartData(metric.field, metric.yoy, mode) : [];
    const perData = activeTab === 'valuation' ? buildChartData('per', null, 'amount') : [];
    const pbrData = activeTab === 'valuation' ? buildChartData('pbr', null, 'amount') : [];

    const maxAbs = Math.max(0, ...chartData.flatMap(r => series.map(s => Math.abs(r[s.id] ?? 0))));
    const axisFormat = {
        money: mode === 'amount' ? eokAxisFormatter(maxAbs, isEn) : null,
        percent: (v) => `${v}%`,
        won: (v) => `${v.toLocaleString()}${t('currency.won')}`,
    };
    const tickFormatter = mode === 'growth' ? (v) => `${v}%` : mode === 'index' ? (v) => `${v}` : axisFormat[metric.type];
    const formatValue = (v) => {
        if (v == null) return '-';
        if (mode === 'growth') return formatSignedChange(v);
        if (mode === 'index') return v.toLocaleString();
        if (metric.type === 'money') return formatEok(v, isEn);
        if (metric.type === 'percent') return `${v}%`;
        if (metric.type === 'won') return `${Math.round(v).toLocaleString()}${t('currency.won')}`;
        return `${v}x`;
    };
    const hasChartData = chartData.some(r => series.some(s => r[s.id] != null));

    // --- per-company headline cards for the active metric
    const isQuarterly = viewMode === 'quarterly';
    const headlineCards = companiesData.map((c, i) => {
        const color = SERIES_COLORS[i % SERIES_COLORS.length];
        if (activeTab === 'valuation') {
            const { last_per: per, last_pbr: pbr } = c.raw;
            return { c, color, value: per != null ? `PER ${per.toFixed(1)}x` : '-', sub: pbr != null ? `PBR ${pbr.toFixed(2)}x` : null };
        }
        const rows = [...(rowsByCode[c.code]?.values() || [])];
        const s = summarizeMetric(rows, metric.field, { changeKey: metric.yoy, isQuarterly });
        if (!s) return { c, color, value: '-' };
        const raw = metric.type === 'money' ? s.value / 1e8 : s.value;
        const badge = changeBadge({
            ...s,
            changePrefix: t(isQuarterly ? 'metricTabs.yoyQuarterly' : 'metricTabs.yoyAnnual'),
        }, t);
        const valueText = metric.type === 'money' ? formatEok(raw, isEn)
            : metric.type === 'percent' ? `${raw}%`
            : `${Math.round(raw).toLocaleString()}${t('currency.won')}`;
        return { c, color, value: valueText, period: s.latest.displayLabel, badge };
    });

    // --- summary table (latest period of the current view per company)
    const tableRows = useMemo(() => {
        const latestOf = (c) => {
            const rows = seriesOf(c);
            for (let i = rows.length - 1; i >= 0; i--) if (rows[i].revenue != null) return rows[i];
            return null;
        };
        const latest = companiesData.map(latestOf);
        const eok = (v) => (v != null ? v / 1e8 : null);
        const pct = (v) => (v != null ? `${v}%` : '-');
        return [
            { label: t('compare.period'), values: latest.map(l => l?.displayLabel ?? '-'), raw: [] },
            { label: t('compare.latestRevenue'), raw: latest.map(l => l?.revenue), fmt: v => formatEok(eok(v), isEn), best: 'max' },
            { label: t('compare.latestOpProfit'), raw: latest.map(l => l?.op_profit), fmt: v => formatEok(eok(v), isEn), best: 'max' },
            { label: t('compare.netIncome'), raw: latest.map(l => l?.net_income), fmt: v => formatEok(eok(v), isEn), best: 'max' },
            { label: t('compare.opMargin'), raw: latest.map(l => l?.op_margin), fmt: pct, best: 'max' },
            { label: t('compare.revenueGrowth'), raw: latest.map(l => l?.rev_change), fmt: v => (v != null ? formatSignedChange(v) : '-'), best: 'max' },
            { label: 'EPS', raw: latest.map(l => l?.eps), fmt: v => (v != null ? `${Math.round(v).toLocaleString()}${t('currency.won')}` : '-') },
            { label: t('compare.marketCap'), raw: companiesData.map(c => c.raw.last_mktcap), fmt: v => formatEok(eok(v), isEn) },
            { label: 'PER', raw: companiesData.map(c => c.raw.last_per), fmt: v => (v != null ? `${v.toFixed(1)}x` : '-'), best: 'minPositive' },
            { label: 'PBR', raw: companiesData.map(c => c.raw.last_pbr), fmt: v => (v != null ? `${v.toFixed(2)}x` : '-'), best: 'minPositive' },
        ].map(row => ({
            ...row,
            values: row.values || row.raw.map(v => row.fmt(v ?? null)),
            bestAt: row.best ? bestIndex(row.raw, row.best) : -1,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companiesData, viewMode, isEn, t]);

    const companyNames = companiesData.map(nameOf);
    const pageTitle = companyNames.length > 0
        ? t('compare.title', { names: companyNames.join(' vs ') })
        : t('compare.defaultTitle');

    if (stockCodes.length === 0) {
        return (
            <div className="compare-page">
                <SubPageHeader />
                <div className="compare-inner" style={{ textAlign: 'center', paddingTop: '60px' }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{t('compare.defaultTitle')}</h1>
                    <p style={{ color: colors.textMuted }}>{t('compare.selectPrompt')}</p>
                    <Link to="/" style={{ color: colors.accent }}>{t('rankings.backHome')}</Link>
                </div>
            </div>
        );
    }

    const addButton = stockCodes.length < MAX_STOCKS && (
        <div className="compare-add">
            <button className="compare-add-btn" onClick={() => setSearchOpen(o => !o)}>
                <Plus size={14} /> {t('compare.addStock')}
            </button>
            {searchOpen && (
                <div className="compare-add-popover">
                    <StockPicker
                        autoFocus
                        search={searchStocks}
                        onPick={addStock}
                        onClose={() => setSearchOpen(false)}
                        placeholder={t('compare.searchPlaceholder')}
                        hint={t('compare.maxHint', { n: stockCodes.length })}
                    />
                </div>
            )}
        </div>
    );

    const renderTable = () => (
        isMobile ? (
            <div className="compare-cards">
                {companiesData.map((c, ci) => (
                    <div key={c.code} className="compare-card-company" style={{ borderTopColor: series[ci].color }}>
                        <Link to={`/stocks/${c.code}`} className="compare-card-company-name" style={{ color: series[ci].color }}>{nameOf(c)}</Link>
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
                            {companiesData.map((c, ci) => (
                                <th key={c.code} style={{ color: series[ci].color }}>{nameOf(c)}</th>
                            ))}
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

    return (
        <>
            <SEOHead
                title={pageTitle}
                description={t('compare.description', { names: companyNames.join(', ') })}
                canonical={`https://kstockview.com/compare/${codes}`}
            />
            <div className="compare-page">
                <SubPageHeader />
                <div className="compare-inner">
                    <div className="compare-title-row">
                        <h1 className="compare-title">{companyNames.join(' vs ')}</h1>
                        <ShareButtons companyName={companyNames.join(' vs ')} stockCode={stockCodes.join('-vs-')} />
                    </div>

                    {/* Company chips double as the chart legend: hover one to highlight its series */}
                    <div className="compare-chips">
                        {companiesData.map((c, i) => (
                            <div
                                key={c.code}
                                className="compare-chip"
                                style={{ borderColor: series[i].color }}
                                onMouseEnter={() => setHoveredCode(c.code)}
                                onMouseLeave={() => setHoveredCode(null)}
                            >
                                <span className="compare-chip-dot" style={{ background: series[i].color }} />
                                <Link to={`/stocks/${c.code}`} className="compare-chip-name">{nameOf(c)}</Link>
                                <span className="compare-chip-code">{c.code}</span>
                                {stockCodes.length > 1 && (
                                    <button className="compare-chip-remove" onClick={() => removeStock(c.code)} aria-label={`${nameOf(c)} ✕`}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {addButton}
                    </div>

                    {suggestions.length > 0 && (
                        <div className="compare-suggest">
                            <span className="compare-suggest-label">
                                {stockCodes.length === 1 ? t('compare.addPrompt') : t('compare.suggested')}
                            </span>
                            {suggestions.map(s => (
                                <button key={s.stock_code} className="compare-suggest-chip" onClick={() => addStock(s.stock_code)}>
                                    <Plus size={12} /> {isEn ? (s.name_en || s.name) : s.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div className="metric-empty">{t('common.loading')}</div>
                    ) : (
                        <>
                            <MetricTabs
                                tabs={TAB_KEYS.map(key => ({
                                    key,
                                    label: key === 'valuation' ? t('compare.tabValuation') : t(`metricTabs.tabs.${key}`),
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

                            {/* Latest value per company for the active metric */}
                            <div className="compare-headlines">
                                {headlineCards.map(h => (
                                    <div
                                        key={h.c.code}
                                        className="compare-headline"
                                        style={{ borderTopColor: h.color }}
                                        onMouseEnter={() => setHoveredCode(h.c.code)}
                                        onMouseLeave={() => setHoveredCode(null)}
                                    >
                                        <span className="compare-headline-name" style={{ color: h.color }}>
                                            {nameOf(h.c)}
                                            {h.period && <span className="compare-headline-period">{h.period}</span>}
                                        </span>
                                        <span className="compare-headline-value">{h.value}</span>
                                        {h.badge && <span className={`metric-change-badge ${h.badge.up ? 'up' : 'down'}`}>{h.badge.text}</span>}
                                        {h.sub && <span className="compare-headline-sub">{h.sub}</span>}
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
                                        <span className="compare-mode-note">{t(mode === 'index' ? 'compare.indexNote' : 'compare.growthNote')}</span>
                                    )}
                                </div>
                            )}

                            {activeTab !== 'valuation' && (
                                <div className="chart-section">
                                    {hasChartData ? (
                                        <CompareChart
                                            data={chartData}
                                            series={series}
                                            kind={mode === 'amount' && metric.type !== 'percent' ? 'bar' : 'line'}
                                            mode={mode}
                                            height={chartHeight('bare', isMobile)}
                                            isMobile={isMobile}
                                            colors={colors}
                                            tickFormatter={tickFormatter}
                                            formatValue={formatValue}
                                            highlightId={hoveredCode}
                                        />
                                    ) : (
                                        <div className="metric-empty">{t('compare.noData')}</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'valuation' && [
                                { key: 'per', title: t('compare.perChart'), data: perData },
                                { key: 'pbr', title: t('compare.pbrChart'), data: pbrData },
                            ].map(chart => (
                                <div key={chart.key} className="chart-section">
                                    <h3>{chart.title}</h3>
                                    {chart.data.some(r => series.some(s => r[s.id] != null)) ? (
                                        <CompareChart
                                            data={chart.data}
                                            series={series}
                                            kind="line"
                                            height={chartHeight('single', isMobile)}
                                            isMobile={isMobile}
                                            colors={colors}
                                            tickFormatter={(v) => `${v}x`}
                                            formatValue={(v) => (v != null ? `${v}x` : '-')}
                                            highlightId={hoveredCode}
                                        />
                                    ) : (
                                        <div className="metric-empty">{t('compare.noData')}</div>
                                    )}
                                </div>
                            ))}

                            <div className="compare-table-header">
                                <h2>{t('compare.tableTitle')}</h2>
                                <span>{t('compare.bestNote')}</span>
                            </div>
                            {renderTable()}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Compare;
