import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';
import useThemeColors from '../hooks/useThemeColors';
import { loadKrCompanyData, processKrCompanyData, loadKrCompanyIndex } from '../krDataLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowLeft, Search, X, Plus } from 'lucide-react';

const CHART_COLORS = ['#5B8DEF', '#00d084', '#A78BFA', '#FF8C00'];

const Compare = () => {
    const { codes } = useParams();
    const { t, i18n } = useTranslation();
    const colors = useThemeColors();
    const navigate = useNavigate();
    const isEn = i18n.language === 'en';

    const [companiesData, setCompaniesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [companyIndex, setCompanyIndex] = useState([]);
    const [viewMode, setViewMode] = useState('annual');

    const stockCodes = useMemo(() => {
        if (!codes) return [];
        return codes.split('-vs-').filter(Boolean).slice(0, 3);
    }, [codes]);

    // Load company index for search
    useEffect(() => {
        loadKrCompanyIndex().then(setCompanyIndex).catch(() => {});
    }, []);

    // Load all companies data
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
                        market: raw.market,
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

    const searchResults = useMemo(() => {
        if (!searchTerm || searchTerm.length < 1) return [];
        const term = searchTerm.toLowerCase();
        return companyIndex
            .filter(c => !stockCodes.includes(c.stock_code))
            .filter(c =>
                c.stock_code.includes(term) ||
                c.name.toLowerCase().includes(term) ||
                (c.name_en || '').toLowerCase().includes(term)
            )
            .slice(0, 8);
    }, [searchTerm, companyIndex, stockCodes]);

    const addStock = (code) => {
        const newCodes = [...stockCodes, code].slice(0, 3);
        navigate(`/compare/${newCodes.join('-vs-')}`);
        setSearchOpen(false);
        setSearchTerm('');
    };

    const removeStock = (code) => {
        const newCodes = stockCodes.filter(c => c !== code);
        if (newCodes.length === 0) navigate('/');
        else navigate(`/compare/${newCodes.join('-vs-')}`);
    };

    // Build chart data: merge annual data from all companies
    const chartData = useMemo(() => {
        if (companiesData.length === 0) return { revenue: [], opProfit: [] };

        const dataKey = viewMode === 'annual' ? 'annualData' : 'quarterlyData';
        const labelKey = 'displayLabel';

        // Collect all labels
        const allLabels = new Set();
        companiesData.forEach(c => c[dataKey].forEach(d => allLabels.add(d[labelKey])));
        const sortedLabels = [...allLabels].sort();

        const buildSeries = (metric) => {
            return sortedLabels.map(label => {
                const entry = { label };
                companiesData.forEach(c => {
                    const d = c[dataKey].find(d => d[labelKey] === label);
                    entry[c.code] = d?.[metric] ? d[metric] / 1e8 : null; // 억원
                });
                return entry;
            });
        };

        return {
            revenue: buildSeries('revenue'),
            opProfit: buildSeries('op_profit'),
        };
    }, [companiesData, viewMode]);

    const companyNames = companiesData.map(c => isEn ? c.name_en : c.name);
    const pageTitle = companyNames.length > 0
        ? t('compare.title', { names: companyNames.join(' vs ') })
        : t('compare.defaultTitle');

    if (stockCodes.length === 0) {
        return (
            <div style={{ minHeight: '100vh', background: colors.bgBody, color: colors.textPrimary, padding: '60px 16px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{t('compare.defaultTitle')}</h1>
                <p style={{ color: colors.textMuted }}>{t('compare.selectPrompt')}</p>
                <Link to="/" style={{ color: colors.accent }}>{t('rankings.backHome')}</Link>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload) return null;
        return (
            <div style={{
                background: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.8rem',
            }}>
                <p style={{ fontWeight: 600, marginBottom: '6px', color: colors.textPrimary }}>{label}</p>
                {payload.map((p, i) => {
                    const company = companiesData.find(c => c.code === p.dataKey);
                    return (
                        <p key={i} style={{ color: p.fill, margin: '2px 0' }}>
                            {isEn ? company?.name_en : company?.name}: {p.value != null ? `${p.value.toLocaleString()}${t('compare.unitBillion')}` : '-'}
                        </p>
                    );
                })}
            </div>
        );
    };

    const renderChart = (data, title) => (
        <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: colors.textPrimary }}>
                {title}
            </h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: colors.textMuted }} />
                        <YAxis tick={{ fontSize: 11, fill: colors.textMuted }} tickFormatter={v => v >= 10000 ? `${(v/10000).toFixed(0)}조` : `${v.toLocaleString()}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend formatter={(value) => {
                            const c = companiesData.find(comp => comp.code === value);
                            return isEn ? c?.name_en : c?.name;
                        }} />
                        {companiesData.map((c, i) => (
                            <Bar key={c.code} dataKey={c.code} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <>
            <SEOHead
                title={pageTitle}
                description={t('compare.description', { names: companyNames.join(', ') })}
                canonical={`https://kstockview.com/compare/${codes}`}
            />
            <div style={{
                minHeight: '100vh',
                background: colors.bgBody,
                color: colors.textPrimary,
                padding: '40px 16px',
            }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                    <Link to="/" style={{ color: colors.accent, textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
                        <ArrowLeft size={16} /> {t('rankings.backHome')}
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                            {companyNames.join(' vs ')}
                        </h1>
                        <ShareButtons companyName={companyNames.join(' vs ')} stockCode={stockCodes.join('-vs-')} />
                    </div>

                    {/* Company chips */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
                        {companiesData.map((c, i) => (
                            <div key={c.code} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '6px 12px',
                                background: colors.bgCard,
                                border: `2px solid ${CHART_COLORS[i]}`,
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                            }}>
                                <Link to={`/stocks/${c.code}`} style={{ color: colors.textPrimary, textDecoration: 'none', fontWeight: 600 }}>
                                    {isEn ? c.name_en : c.name}
                                </Link>
                                <span style={{ color: colors.textFaded, fontSize: '0.75rem' }}>{c.code}</span>
                                {stockCodes.length > 1 && (
                                    <button onClick={() => removeStock(c.code)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, padding: '0 2px',
                                    }}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {stockCodes.length < 3 && (
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setSearchOpen(!searchOpen)} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    padding: '6px 14px',
                                    background: 'transparent',
                                    border: `1px dashed ${colors.textMuted}`,
                                    borderRadius: '20px',
                                    color: colors.textMuted,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                }}>
                                    <Plus size={14} /> {t('compare.addStock')}
                                </button>
                                {searchOpen && (
                                    <div style={{
                                        position: 'absolute', top: '110%', left: 0, zIndex: 100,
                                        background: colors.bgCard,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '8px',
                                        width: '280px',
                                        boxShadow: `0 8px 24px ${colors.tooltipShadow}`,
                                    }}>
                                        <div style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: `1px solid ${colors.border}` }}>
                                            <Search size={14} style={{ color: colors.textMuted }} />
                                            <input
                                                autoFocus
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                placeholder={t('compare.searchPlaceholder')}
                                                style={{
                                                    flex: 1, border: 'none', outline: 'none',
                                                    background: 'transparent', color: colors.textPrimary,
                                                    fontSize: '0.85rem',
                                                }}
                                            />
                                        </div>
                                        {searchResults.map(c => (
                                            <button
                                                key={c.stock_code}
                                                onClick={() => addStock(c.stock_code)}
                                                style={{
                                                    display: 'block', width: '100%', textAlign: 'left',
                                                    padding: '8px 12px', border: 'none',
                                                    background: 'transparent', color: colors.textPrimary,
                                                    cursor: 'pointer', fontSize: '0.85rem',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = colors.accentBg}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <span style={{ fontWeight: 600 }}>{c.stock_code}</span>
                                                <span style={{ marginLeft: '8px', color: colors.textMuted }}>
                                                    {isEn ? (c.name_en || c.name) : c.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* View mode toggle */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                        {['annual', 'quarterly'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '6px',
                                    border: `1px solid ${viewMode === mode ? colors.accent : colors.border}`,
                                    background: viewMode === mode ? colors.accentBg : 'transparent',
                                    color: viewMode === mode ? colors.accent : colors.textMuted,
                                    fontWeight: viewMode === mode ? 600 : 400,
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                }}
                            >
                                {t(`analysis.${mode}`)}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textMuted }}>
                            {t('common.loading')}
                        </div>
                    ) : (
                        <>
                            {renderChart(chartData.revenue, t('compare.revenueChart'))}
                            {renderChart(chartData.opProfit, t('compare.opProfitChart'))}

                            {/* Summary table */}
                            <div style={{
                                background: colors.bgCard,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                overflow: 'auto',
                                marginTop: '16px',
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                                            <th style={thStyle(colors)}></th>
                                            {companiesData.map((c, i) => (
                                                <th key={c.code} style={{ ...thStyle(colors), color: CHART_COLORS[i] }}>
                                                    {isEn ? c.name_en : c.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: t('compare.latestRevenue'), key: 'revenue' },
                                            { label: t('compare.latestOpProfit'), key: 'op_profit' },
                                            { label: t('compare.opMargin'), key: 'op_margin' },
                                            { label: 'PER', key: 'per' },
                                            { label: 'PBR', key: 'pbr' },
                                        ].map(row => (
                                            <tr key={row.key} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                                <td style={{ ...tdStyle(colors), fontWeight: 600, color: colors.textMuted }}>{row.label}</td>
                                                {companiesData.map(c => {
                                                    const latest = c.annualData[c.annualData.length - 1];
                                                    let val = '-';
                                                    if (latest) {
                                                        if (row.key === 'revenue' && latest.revenue) val = `${(latest.revenue / 1e8).toLocaleString()}${t('compare.unitBillion')}`;
                                                        else if (row.key === 'op_profit' && latest.op_profit != null) val = `${(latest.op_profit / 1e8).toLocaleString()}${t('compare.unitBillion')}`;
                                                        else if (row.key === 'op_margin' && latest.op_margin != null) val = `${latest.op_margin}%`;
                                                        else if (row.key === 'per' && c.raw.last_per != null) val = c.raw.last_per.toFixed(1);
                                                        else if (row.key === 'pbr' && c.raw.last_pbr != null) val = c.raw.last_pbr.toFixed(2);
                                                    }
                                                    return <td key={c.code} style={{ ...tdStyle(colors), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{val}</td>;
                                                })}
                                            </tr>
                                        ))}
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

const thStyle = (colors) => ({
    padding: '12px 16px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: colors.textMuted,
    textAlign: 'right',
});

const tdStyle = (colors) => ({
    padding: '10px 16px',
    fontSize: '0.85rem',
});

export default Compare;
