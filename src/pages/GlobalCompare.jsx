import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';
import useThemeColors from '../hooks/useThemeColors';
import { loadKrCompanyData, processKrCompanyData, loadKrCompanyIndex } from '../krDataLoader';
import { loadUsCompanyData, loadUsCompanyIndex } from '../usDataLoader';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowLeft, Search, Globe2, Sparkles } from 'lucide-react';

const POPULAR_PAIRS = [
    { kr: '000660', krName: 'SK하이닉스', us: 'MU', usName: 'Micron', emoji: '\u{1F4BE}' },
    { kr: '005930', krName: '삼성전자', us: 'AAPL', usName: 'Apple', emoji: '\u{1F4F1}' },
    { kr: '005380', krName: '현대자동차', us: 'GM', usName: 'General Motors', emoji: '\u{1F697}' },
    { kr: '373220', krName: 'LG에너지솔루션', us: 'TSLA', usName: 'Tesla', emoji: '\u{1F50B}' },
];

const KR_CODE_RE = /^\d{6}$/;

function isKrCode(code) {
    return KR_CODE_RE.test(code);
}

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

    // Reuse the site's existing palette as per-entity colors, same convention
    // as /compare: one fixed hue per entity across every chart. Blue vs red
    // (rather than blue vs green) for maximum contrast between the two series.
    const KR_COLOR = colors.revenue;
    const US_COLOR = colors.negative;

    const [krCode, usTicker] = useMemo(() => {
        if (!codes) return [null, null];
        const parts = codes.split('-vs-').filter(Boolean);
        const kr = parts.find(isKrCode);
        const us = parts.find(p => !isKrCode(p));
        return [kr || null, us || null];
    }, [codes]);

    const [krRaw, setKrRaw] = useState(null);
    const [usData, setUsData] = useState(null);
    const [fxRates, setFxRates] = useState(null);
    const [usPrices, setUsPrices] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('quarterly');
    const [yearRange, setYearRange] = useState([2020, new Date().getFullYear()]);

    const [krIndex, setKrIndex] = useState([]);
    const [usIndex, setUsIndex] = useState([]);
    const [krSearch, setKrSearch] = useState('');
    const [usSearch, setUsSearch] = useState('');
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

    // Load pickers (only needed when no valid pair selected yet, but cheap enough to always load)
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
        Promise.all([loadKrCompanyData(krCode), loadUsCompanyData(usTicker)])
            .then(([kr, us]) => {
                setKrRaw(kr);
                setUsData(us);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [krCode, usTicker]);

    const krProcessed = useMemo(() => processKrCompanyData(krRaw), [krRaw]);

    // Combined min/max year across both companies, for the range slider
    const dataRange = useMemo(() => {
        const krSeries = viewMode === 'annual' ? krProcessed.annualData : krProcessed.quarterlyData;
        const usSeries = viewMode === 'annual' ? usData?.annualData : usData?.quarterlyData;
        const years = [...(krSeries || []), ...(usSeries || [])].map(d => d.year);
        if (years.length === 0) return { min: 2015, max: new Date().getFullYear() };
        return { min: Math.min(...years), max: Math.max(...years) };
    }, [krProcessed, usData, viewMode]);

    // Reset the slider to a sensible default whenever the pair or view mode changes
    useEffect(() => {
        setYearRange([Math.max(dataRange.min, dataRange.max - 6), dataRange.max]);
    }, [dataRange.min, dataRange.max, krCode, usTicker, viewMode]);

    const krSearchResults = useMemo(() => {
        if (!krSearch || krSearch.length < 1) return [];
        const term = krSearch.toLowerCase();
        return krIndex
            .filter(c => c.stock_code.includes(term) || c.name.toLowerCase().includes(term) || (c.name_en || '').toLowerCase().includes(term))
            .slice(0, 6);
    }, [krSearch, krIndex]);

    const usSearchResults = useMemo(() => {
        if (!usSearch || usSearch.length < 1) return [];
        const term = usSearch.toLowerCase();
        return usIndex
            .filter(c => c.ticker.toLowerCase().includes(term) || c.name.toLowerCase().includes(term))
            .slice(0, 6);
    }, [usSearch, usIndex]);

    const pickKr = (code) => navigate(`/global-compare/${code}-vs-${usTicker || 'AAPL'}`);
    const pickUs = (ticker) => navigate(`/global-compare/${krCode || '005930'}-vs-${ticker}`);

    // --- Merge KR (converted to USD) and US quarterly/annual series on a shared calendar axis ---
    const chartData = useMemo(() => {
        if (!krRaw || !usData || !fxRates) return { revenue: [], opIncome: [] };

        const krSeries = viewMode === 'annual' ? krProcessed.annualData : krProcessed.quarterlyData;
        const usSeries = viewMode === 'annual' ? usData.annualData : usData.quarterlyData;

        const keyOf = (year, q) => (viewMode === 'annual' ? `${year}` : `${year}-Q${q}`);
        const fxTable = viewMode === 'annual' ? fxRates.annual : fxRates.quarterly;

        const labels = new Set();
        krSeries.forEach(d => labels.add(keyOf(d.year, quarterNum(d.quarter))));
        usSeries.forEach(d => labels.add(keyOf(d.year, quarterNum(d.calQ))));

        const sortedLabels = [...labels]
            .filter(key => {
                const year = parseInt(key.slice(0, 4), 10);
                return year >= yearRange[0] && year <= yearRange[1];
            })
            .sort();

        const build = (krField, usField) => sortedLabels.map(key => {
            const kr = krSeries.find(d => keyOf(d.year, quarterNum(d.quarter)) === key);
            const us = usSeries.find(d => keyOf(d.year, quarterNum(d.calQ)) === key);
            const fx = fxTable[key];
            const krValueLocal = kr ? kr[krField] : null;
            const krValueUsd = (krValueLocal != null && fx) ? krValueLocal / fx : null;
            const usValue = us ? us[usField] : null;
            const label = viewMode === 'annual' ? key : key.replace('-', ' ');
            return {
                label,
                kr: krValueUsd != null ? parseFloat((krValueUsd / 1e6).toFixed(1)) : null, // $M
                us: usValue != null ? parseFloat((usValue / 1e6).toFixed(1)) : null, // $M
                krLocal: krValueLocal,
                fx,
            };
        });

        // Market cap = implied shares (net_income / eps) × period-end close price.
        // Approximate — see globalCompare.marketCapNote for the caveat.
        const usPriceTable = usPrices ? (viewMode === 'annual' ? usPrices.annual[usTicker] : usPrices.quarterly[usTicker]) : null;

        const marketCap = sortedLabels.map(key => {
            const kr = krSeries.find(d => keyOf(d.year, quarterNum(d.quarter)) === key);
            const us = usSeries.find(d => keyOf(d.year, quarterNum(d.calQ)) === key);
            const fx = fxTable[key];

            const krShares = kr ? impliedShares(kr.net_income, kr.eps) : null;
            const krMktcapLocal = (krShares && kr?.close_price) ? krShares * kr.close_price : null;
            const krMktcapUsd = (krMktcapLocal != null && fx) ? krMktcapLocal / fx : null;

            const usShares = us ? impliedShares(us.net_income, us.eps) : null;
            const usPrice = usPriceTable ? usPriceTable[key] : null;
            const usMktcapUsd = (usShares && usPrice) ? usShares * usPrice : null;

            const label = viewMode === 'annual' ? key : key.replace('-', ' ');
            return {
                label,
                kr: krMktcapUsd != null ? parseFloat((krMktcapUsd / 1e9).toFixed(2)) : null, // $B
                us: usMktcapUsd != null ? parseFloat((usMktcapUsd / 1e9).toFixed(2)) : null, // $B
            };
        });
        const marketCapAvailable = !!usPriceTable && marketCap.some(d => d.kr != null || d.us != null);

        return {
            revenue: build('revenue', 'revenue'),
            opIncome: build('op_profit', 'operating_income'),
            marketCap,
            marketCapAvailable,
        };
    }, [krRaw, usData, fxRates, usPrices, usTicker, viewMode, krProcessed, yearRange]);

    const krName = krRaw ? (isEn ? (krRaw.name_en || krRaw.name) : krRaw.name) : '';
    const usName = usData ? usData.name : '';
    const pageTitle = (krCode && usTicker)
        ? t('globalCompare.title', { kr: krName, us: usName })
        : t('globalCompare.defaultTitle');

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || payload.length === 0) return null;
        return (
            <div style={{
                background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem',
            }}>
                <p style={{ fontWeight: 600, marginBottom: '6px', color: colors.textPrimary }}>{label}</p>
                {payload.map((p, i) => {
                    const isKr = p.dataKey === 'kr';
                    const point = p.payload;
                    return (
                        <p key={i} style={{ color: isKr ? KR_COLOR : US_COLOR, margin: '2px 0' }}>
                            {isKr ? krName : usName}: {p.value != null ? `$${p.value.toLocaleString()}M` : '-'}
                            {isKr && point.krLocal != null && (
                                <span style={{ color: colors.textFaded }}> ({(point.krLocal / 1e8).toLocaleString()}억원 @ {point.fx?.toLocaleString()}원)</span>
                            )}
                        </p>
                    );
                })}
            </div>
        );
    };

    const renderChart = (data, title, keyPrefix) => (
        <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: colors.textPrimary }}>{title}</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                        <defs>
                            <linearGradient id={`${keyPrefix}KrGrad`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={KR_COLOR} stopOpacity={colors.isLight ? 1 : 0.85} />
                                <stop offset="100%" stopColor={KR_COLOR} stopOpacity={colors.isLight ? 1 : 0.3} />
                            </linearGradient>
                            <linearGradient id={`${keyPrefix}UsGrad`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={US_COLOR} stopOpacity={colors.isLight ? 1 : 0.85} />
                                <stop offset="100%" stopColor={US_COLOR} stopOpacity={colors.isLight ? 1 : 0.3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: colors.textMuted }} />
                        <YAxis tick={{ fontSize: 11, fill: colors.textMuted }} tickFormatter={v => `$${v.toLocaleString()}M`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend formatter={(value) => value === 'kr' ? krName : usName} />
                        <Bar dataKey="kr" name="kr" fill={`url(#${keyPrefix}KrGrad)`} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="us" name="us" fill={`url(#${keyPrefix}UsGrad)`} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    const MarketCapTooltip = ({ active, payload, label }) => {
        if (!active || !payload || payload.length === 0) return null;
        return (
            <div style={{
                background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem',
            }}>
                <p style={{ fontWeight: 600, marginBottom: '6px', color: colors.textPrimary }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.stroke, margin: '2px 0' }}>
                        {p.dataKey === 'kr' ? krName : usName}: {p.value != null ? `$${p.value.toLocaleString()}B` : '-'}
                    </p>
                ))}
            </div>
        );
    };

    const renderLineChart = (data, title) => (
        <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px', color: colors.textPrimary }}>{title}</h3>
            <p style={{ fontSize: '0.72rem', color: colors.textFaded, marginBottom: '12px' }}>{t('globalCompare.marketCapNote')}</p>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: colors.textMuted }} />
                        <YAxis tick={{ fontSize: 11, fill: colors.textMuted }} tickFormatter={v => `$${v.toLocaleString()}B`} />
                        <Tooltip content={<MarketCapTooltip />} />
                        <Legend formatter={(value) => value === 'kr' ? krName : usName} />
                        <Line type="monotone" dataKey="kr" name="kr" stroke={KR_COLOR} strokeWidth={2.5} dot={{ r: 3, fill: KR_COLOR }} connectNulls />
                        <Line type="monotone" dataKey="us" name="us" stroke={US_COLOR} strokeWidth={2.5} dot={{ r: 3, fill: US_COLOR }} connectNulls />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    // --- Picker UI (no valid pair selected) ---
    if (!krCode || !usTicker) {
        return (
            <div style={{ minHeight: '100vh', background: colors.bgBody, color: colors.textPrimary }}>
                <SEOHead
                    title={t('globalCompare.defaultTitle')}
                    description={t('globalCompare.pickerDescription')}
                    canonical="https://kstockview.com/global-compare"
                />
                <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 16px 60px' }}>
                    <Link to="/" style={{ color: colors.accent, textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', paddingTop: '24px' }}>
                        <ArrowLeft size={16} /> {t('rankings.backHome')}
                    </Link>

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

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '44px' }}>
                        <div style={{ flex: '1 1 280px', position: 'relative', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.75rem', color: KR_COLOR, fontWeight: 700 }}>{'\u{1F1F0}\u{1F1F7}'} {t('globalCompare.pickKr')}</label>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                border: `1.5px solid ${krSearch ? KR_COLOR : colors.border}`,
                                borderRadius: '24px', padding: '10px 16px', background: colors.bgCard, marginTop: '6px',
                                transition: 'border-color 0.2s',
                            }}>
                                <Search size={15} style={{ color: colors.textMuted, flexShrink: 0 }} />
                                <input value={krSearch} onChange={e => setKrSearch(e.target.value)} placeholder={t('compare.searchPlaceholder')}
                                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: colors.textPrimary, fontSize: '0.85rem', minWidth: 0 }} />
                            </div>
                            {krSearchResults.length > 0 && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', marginTop: '6px', boxShadow: `0 8px 24px ${colors.tooltipShadow}`, overflow: 'hidden' }}>
                                    {krSearchResults.map(c => (
                                        <button key={c.stock_code} onClick={() => { pickKr(c.stock_code); setKrSearch(''); }}
                                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'transparent', color: colors.textPrimary, cursor: 'pointer', fontSize: '0.85rem' }}>
                                            <span style={{ fontWeight: 600 }}>{c.stock_code}</span>
                                            <span style={{ marginLeft: '8px', color: colors.textMuted }}>{isEn ? (c.name_en || c.name) : c.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ flex: '1 1 280px', position: 'relative', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.75rem', color: US_COLOR, fontWeight: 700 }}>{'\u{1F1FA}\u{1F1F8}'} {t('globalCompare.pickUs')}</label>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                border: `1.5px solid ${usSearch ? US_COLOR : colors.border}`,
                                borderRadius: '24px', padding: '10px 16px', background: colors.bgCard, marginTop: '6px',
                                transition: 'border-color 0.2s',
                            }}>
                                <Search size={15} style={{ color: colors.textMuted, flexShrink: 0 }} />
                                <input value={usSearch} onChange={e => setUsSearch(e.target.value)} placeholder={t('compare.searchPlaceholder')}
                                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: colors.textPrimary, fontSize: '0.85rem', minWidth: 0 }} />
                            </div>
                            {usSearchResults.length > 0 && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', marginTop: '6px', boxShadow: `0 8px 24px ${colors.tooltipShadow}`, overflow: 'hidden' }}>
                                    {usSearchResults.map(c => (
                                        <button key={c.ticker} onClick={() => { pickUs(c.ticker); setUsSearch(''); }}
                                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'transparent', color: colors.textPrimary, cursor: 'pointer', fontSize: '0.85rem' }}>
                                            <span style={{ fontWeight: 600 }}>{c.ticker}</span>
                                            <span style={{ marginLeft: '8px', color: colors.textMuted }}>{c.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="gc-section-label">{t('globalCompare.popularPairs')}</p>
                    <div className="gc-pair-grid" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
                        {POPULAR_PAIRS.map(p => (
                            <Link key={p.kr + p.us} to={`/global-compare/${p.kr}-vs-${p.us}`} className="gc-pair-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '1.3rem' }}>{p.emoji}</span>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>
                                            <span style={{ color: KR_COLOR }}>{p.krName}</span>
                                            <span style={{ color: colors.textFaded, fontWeight: 400, margin: '0 6px' }}>vs</span>
                                            <span style={{ color: US_COLOR }}>{p.usName}</span>
                                        </p>
                                    </div>
                                </div>
                                <ArrowLeft size={16} style={{ color: colors.textFaded, transform: 'rotate(180deg)', flexShrink: 0 }} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEOHead
                title={pageTitle}
                description={t('globalCompare.description', { kr: krName, us: usName })}
                canonical={`https://kstockview.com/global-compare/${krCode}-vs-${usTicker}`}
            />
            <div style={{ minHeight: '100vh', background: colors.bgBody, color: colors.textPrimary, padding: '40px 16px' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                    <Link to="/" style={{ color: colors.accent, textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
                        <ArrowLeft size={16} /> {t('rankings.backHome')}
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                        <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.7rem)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', letterSpacing: '-0.01em' }}>
                            <Link to={`/stocks/${krCode}`} style={{ color: KR_COLOR, textDecoration: 'none', textShadow: `0 0 20px ${KR_COLOR}33` }}>
                                {'\u{1F1F0}\u{1F1F7}'} {krName}
                            </Link>
                            <span style={{ color: colors.textFaded, fontWeight: 400, fontSize: '0.9em' }}>vs</span>
                            <Link to={`/us-stocks/${usTicker}`} style={{ color: US_COLOR, textDecoration: 'none', textShadow: `0 0 20px ${US_COLOR}33` }}>
                                {'\u{1F1FA}\u{1F1F8}'} {usName}
                            </Link>
                        </h1>
                        <ShareButtons companyName={`${krName} vs ${usName}`} stockCode={`${krCode}-vs-${usTicker}`} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: colors.textFaded, marginBottom: '24px' }}>{t('globalCompare.fxNote')}</p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['quarterly', 'annual'].map(mode => (
                                <button key={mode} onClick={() => setViewMode(mode)} style={{
                                    padding: '6px 16px', borderRadius: '6px',
                                    border: `1px solid ${viewMode === mode ? colors.accent : colors.border}`,
                                    background: viewMode === mode ? colors.accentBg : 'transparent',
                                    color: viewMode === mode ? colors.accent : colors.textMuted,
                                    fontWeight: viewMode === mode ? 600 : 400, cursor: 'pointer', fontSize: '0.85rem',
                                }}>
                                    {t(`analysis.${mode}`)}
                                </button>
                            ))}
                        </div>

                        <div className="year-slider">
                            <label>{t('common.period')}: {yearRange[0]} - {yearRange[1]}</label>
                            <div className="dual-slider-container">
                                <input
                                    type="range"
                                    className="slider-track slider-min"
                                    min={dataRange.min}
                                    max={dataRange.max}
                                    value={yearRange[0]}
                                    onChange={e => {
                                        const val = parseInt(e.target.value, 10);
                                        if (val <= yearRange[1]) setYearRange([val, yearRange[1]]);
                                    }}
                                />
                                <input
                                    type="range"
                                    className="slider-track slider-max"
                                    min={dataRange.min}
                                    max={dataRange.max}
                                    value={yearRange[1]}
                                    onChange={e => {
                                        const val = parseInt(e.target.value, 10);
                                        if (val >= yearRange[0]) setYearRange([yearRange[0], val]);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textMuted }}>{t('common.loading')}</div>
                    ) : (
                        <>
                            {renderChart(chartData.revenue, t('globalCompare.revenueChart'), 'rev')}
                            {renderChart(chartData.opIncome, t('globalCompare.opIncomeChart'), 'op')}
                            {chartData.marketCapAvailable ? (
                                renderLineChart(chartData.marketCap, t('globalCompare.marketCapChart'))
                            ) : (
                                <div style={{ marginBottom: '32px' }}>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: colors.textPrimary }}>{t('globalCompare.marketCapChart')}</h3>
                                    <div style={{ padding: '24px', textAlign: 'center', color: colors.textFaded, fontSize: '0.8rem', border: `1px dashed ${colors.border}`, borderRadius: '10px' }}>
                                        {t('globalCompare.marketCapUnavailable')}
                                    </div>
                                </div>
                            )}

                            <div style={{
                                background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px',
                                overflow: 'auto', marginTop: '16px',
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '480px' : '100%' }}>
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                                            <th style={thStyle(colors)}></th>
                                            <th style={{ ...thStyle(colors), color: KR_COLOR }}>{krName}</th>
                                            <th style={{ ...thStyle(colors), color: US_COLOR }}>{usName}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const krLatest = krProcessed.annualData[krProcessed.annualData.length - 1];
                                            const usLatest = usData.annualData[usData.annualData.length - 1];
                                            const latestFx = fxRates?.latest?.rate;
                                            const krRevUsd = krLatest?.revenue != null && latestFx ? krLatest.revenue / latestFx : null;
                                            const krOpUsd = krLatest?.op_profit != null && latestFx ? krLatest.op_profit / latestFx : null;
                                            const rows = [
                                                { label: t('globalCompare.latestRevenueUsd'), kr: krRevUsd, us: usLatest?.revenue },
                                                { label: t('globalCompare.latestOpIncomeUsd'), kr: krOpUsd, us: usLatest?.operating_income },
                                                { label: t('compare.opMargin'), kr: krLatest?.op_margin, us: usLatest?.op_margin, isPct: true },
                                            ];
                                            return rows.map(row => (
                                                <tr key={row.label} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                                    <td style={{ ...tdStyle(colors), fontWeight: 600, color: colors.textMuted }}>{row.label}</td>
                                                    <td style={{ ...tdStyle(colors), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                                        {row.kr != null ? (row.isPct ? `${row.kr}%` : `$${(row.kr / 1e9).toFixed(2)}B`) : '-'}
                                                    </td>
                                                    <td style={{ ...tdStyle(colors), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                                        {row.us != null ? (row.isPct ? `${row.us}%` : `$${(row.us / 1e9).toFixed(2)}B`) : '-'}
                                                    </td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

const thStyle = (colors) => ({ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: colors.textMuted, textAlign: 'right' });
const tdStyle = (colors) => ({ padding: '10px 16px', fontSize: '0.85rem' });

export default GlobalCompare;
