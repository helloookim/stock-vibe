import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import useThemeColors from '../hooks/useThemeColors';
import { Trophy, TrendingUp, TrendingDown, BarChart3, ArrowLeft, ChevronRight } from 'lucide-react';

const RANKING_CATEGORIES = [
    { key: 'market_cap_top', icon: '🏆', unit: '', formatValue: (v) => `#${v}` },
    { key: 'revenue_top', icon: '💰', unit: '조', formatValue: (v) => `${(v / 1e12).toFixed(1)}조` },
    { key: 'op_profit_top', icon: '📈', unit: '조', formatValue: (v) => `${(v / 1e12).toFixed(1)}조` },
    { key: 'per_lowest', icon: '🔍', unit: '', formatValue: (v) => v.toFixed(1) },
    { key: 'pbr_lowest', icon: '📊', unit: '', formatValue: (v) => v.toFixed(2) },
    { key: 'revenue_growth_top', icon: '🚀', unit: '%', formatValue: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
    { key: 'op_margin_top', icon: '✨', unit: '%', formatValue: (v) => `${v.toFixed(1)}%` },
    { key: 'debt_ratio_lowest', icon: '🛡️', unit: '%', formatValue: (v) => `${v.toFixed(1)}%` },
];

const Rankings = () => {
    const { metric } = useParams();
    const { t, i18n } = useTranslation();
    const colors = useThemeColors();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const isEn = i18n.language === 'en';

    useEffect(() => {
        document.documentElement.classList.add('page-scroll-enabled');
        return () => document.documentElement.classList.remove('page-scroll-enabled');
    }, []);

    useEffect(() => {
        fetch('/data/kr_rankings.json')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const category = RANKING_CATEGORIES.find(c => c.key === metric);

    // Hub page (no metric)
    if (!metric) {
        return (
            <>
                <SEOHead
                    title={t('rankings.hubTitle')}
                    description={t('rankings.hubDesc')}
                    canonical="https://kstockview.com/rankings"
                    jsonLd={[{
                        '@type': 'WebPage',
                        name: t('rankings.hubTitle'),
                        description: t('rankings.hubDesc'),
                    }]}
                />
                <div style={{
                    minHeight: '100vh',
                    background: colors.bgBody,
                    color: colors.textPrimary,
                    padding: '40px 16px',
                }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <Link to="/" style={{ color: colors.accent, textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
                            <ArrowLeft size={16} /> {t('rankings.backHome')}
                        </Link>

                        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>
                            {t('rankings.hubHeading')}
                        </h1>
                        <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '32px' }}>
                            {t('rankings.hubSubtitle')}
                        </p>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textMuted }}>
                                {t('common.loading')}
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: '16px',
                            }}>
                                {RANKING_CATEGORIES.map(cat => (
                                    <Link
                                        key={cat.key}
                                        to={`/rankings/${cat.key}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div style={{
                                            background: colors.bgCard,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '12px',
                                            padding: '20px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }} onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = colors.accent;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }} onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = colors.border;
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}>
                                            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{cat.icon}</div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary, marginBottom: '4px' }}>
                                                {t(`rankings.${cat.key}`)}
                                            </h3>
                                            <p style={{ fontSize: '0.8rem', color: colors.textMuted, margin: 0 }}>
                                                TOP 50
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                                <ChevronRight size={18} style={{ color: colors.textMuted }} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {data && (
                            <p style={{ textAlign: 'center', color: colors.textFaded, fontSize: '0.75rem', marginTop: '24px' }}>
                                {t('rankings.lastUpdated', { date: data.generated_at })}
                            </p>
                        )}
                    </div>
                </div>
            </>
        );
    }

    // Detail page
    if (!category) {
        return (
            <div style={{ minHeight: '100vh', background: colors.bgBody, color: colors.textPrimary, padding: '60px 16px', textAlign: 'center' }}>
                <p>{t('rankings.notFound')}</p>
                <Link to="/rankings" style={{ color: colors.accent }}>{t('rankings.backToHub')}</Link>
            </div>
        );
    }

    const items = data?.[metric] || [];

    return (
        <>
            <SEOHead
                title={t(`rankings.seo_${metric}_title`)}
                description={t(`rankings.seo_${metric}_desc`)}
                canonical={`https://kstockview.com/rankings/${metric}`}
                jsonLd={[{
                    '@type': 'ItemList',
                    name: t(`rankings.${metric}`),
                    numberOfItems: items.length,
                    itemListElement: items.slice(0, 10).map((item, i) => ({
                        '@type': 'ListItem',
                        position: i + 1,
                        name: isEn ? (item.name_en || item.name) : item.name,
                        url: `https://kstockview.com/stocks/${item.stock_code}`,
                    })),
                }]}
            />
            <div style={{
                minHeight: '100vh',
                background: colors.bgBody,
                color: colors.textPrimary,
                padding: '40px 16px',
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <Link to="/rankings" style={{ color: colors.accent, textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
                        <ArrowLeft size={16} /> {t('rankings.backToHub')}
                    </Link>

                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
                        {category.icon} {t(`rankings.${metric}`)}
                    </h1>
                    <p style={{ color: colors.textMuted, fontSize: '0.85rem', marginBottom: '24px' }}>
                        {t(`rankings.${metric}_desc`)}
                    </p>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textMuted }}>
                            {t('common.loading')}
                        </div>
                    ) : (
                        <div style={{
                            background: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '12px',
                            overflow: 'hidden',
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                                        <th style={thStyle(colors)}>#</th>
                                        <th style={{ ...thStyle(colors), textAlign: 'left' }}>{t('rankings.company')}</th>
                                        <th style={{ ...thStyle(colors), textAlign: 'left', display: 'none' }}>{t('rankings.sector')}</th>
                                        <th style={{ ...thStyle(colors), textAlign: 'right' }}>{t(`rankings.${metric}`)}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, i) => (
                                        <tr
                                            key={item.stock_code}
                                            style={{
                                                borderBottom: `1px solid ${colors.border}`,
                                                cursor: 'pointer',
                                                transition: 'background 0.15s',
                                            }}
                                            onClick={() => navigate(`/stocks/${item.stock_code}`)}
                                            onMouseEnter={e => e.currentTarget.style.background = colors.accentBg}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ ...tdStyle(colors), textAlign: 'center', fontWeight: 600, color: i < 3 ? colors.accent : colors.textMuted, width: '50px' }}>
                                                {item.rank}
                                            </td>
                                            <td style={tdStyle(colors)}>
                                                <div>
                                                    <span style={{ fontWeight: 600, color: colors.textPrimary }}>
                                                        {isEn ? (item.name_en || item.name) : item.name}
                                                    </span>
                                                    <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: colors.textFaded }}>
                                                        {item.stock_code}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: '2px' }}>
                                                    {item.sector} · {item.market}
                                                </div>
                                            </td>
                                            <td style={{ ...tdStyle(colors), textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                                                {category.formatValue(item.value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {data && (
                        <p style={{ textAlign: 'center', color: colors.textFaded, fontSize: '0.75rem', marginTop: '16px' }}>
                            {t('rankings.lastUpdated', { date: data.generated_at })}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

const thStyle = (colors) => ({
    padding: '12px 16px',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colors.textMuted,
});

const tdStyle = (colors) => ({
    padding: '12px 16px',
    fontSize: '0.85rem',
});

export default Rankings;
