import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import useThemeColors from '../hooks/useThemeColors';
import { ArrowLeft, ChevronRight, Building2 } from 'lucide-react';

const SectorPage = () => {
    const { sectorSlug } = useParams();
    const { t, i18n } = useTranslation();
    const colors = useThemeColors();
    const navigate = useNavigate();
    const isEn = i18n.language === 'en';

    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        document.documentElement.classList.add('page-scroll-enabled');
        return () => document.documentElement.classList.remove('page-scroll-enabled');
    }, []);

    useEffect(() => {
        fetch('/data/kr_sectors.json')
            .then(r => r.json())
            .then(d => { setSectors(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const currentSector = useMemo(() => {
        if (!sectorSlug) return null;
        // React Router decodes the URL param, but slugs in JSON are URI-encoded
        const encoded = encodeURIComponent(sectorSlug);
        return sectors.find(s => s.slug === encoded || s.slug === sectorSlug);
    }, [sectorSlug, sectors]);

    const filteredSectors = useMemo(() => {
        if (!searchTerm) return sectors;
        const term = searchTerm.toLowerCase();
        return sectors.filter(s => s.sector.toLowerCase().includes(term));
    }, [sectors, searchTerm]);

    const formatRevenue = (v) => {
        if (!v) return '-';
        if (v >= 1e12) return `${(v / 1e12).toFixed(1)}${t('sectors.trillion')}`;
        if (v >= 1e8) return `${(v / 1e8).toLocaleString()}${t('sectors.billion')}`;
        return v.toLocaleString();
    };

    // Hub page
    if (!sectorSlug) {
        return (
            <>
                <SEOHead
                    title={t('sectors.hubTitle')}
                    description={t('sectors.hubDesc')}
                    canonical="https://kstockview.com/sectors"
                    jsonLd={[{
                        '@type': 'ItemList',
                        name: t('sectors.hubTitle'),
                        numberOfItems: sectors.length,
                    }]}
                />
                <div style={{ minHeight: '100vh', background: colors.bgBody, color: colors.textPrimary, padding: '40px 16px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <Link to="/" style={{ color: colors.accent, textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
                            <ArrowLeft size={16} /> {t('rankings.backHome')}
                        </Link>

                        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>
                            {t('sectors.hubHeading')}
                        </h1>
                        <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '24px' }}>
                            {t('sectors.hubSubtitle')}
                        </p>

                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder={t('sectors.searchPlaceholder')}
                            style={{
                                width: '100%', maxWidth: '400px',
                                padding: '10px 16px',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '8px',
                                background: colors.bgInput,
                                color: colors.textPrimary,
                                fontSize: '0.9rem',
                                marginBottom: '24px',
                                outline: 'none',
                            }}
                        />

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textMuted }}>
                                {t('common.loading')}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                {filteredSectors.map(s => (
                                    <Link
                                        key={s.slug}
                                        to={`/sectors/${s.slug}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div style={{
                                            background: colors.bgCard,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '10px',
                                            padding: '16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }} onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = colors.accent;
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }} onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = colors.border;
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                                                    {s.sector}
                                                </h3>
                                                <ChevronRight size={16} style={{ color: colors.textMuted }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                                <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                                                    {t('sectors.companyCount', { count: s.company_count })}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: colors.textFaded }}>
                                                    {t('sectors.totalRevenue')}: {formatRevenue(s.total_revenue)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    // Detail page
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: colors.bgBody, color: colors.textMuted, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {t('common.loading')}
            </div>
        );
    }

    if (!currentSector) {
        return (
            <div style={{ minHeight: '100vh', background: colors.bgBody, color: colors.textPrimary, padding: '60px 16px', textAlign: 'center' }}>
                <p>{t('sectors.notFound')}</p>
                <Link to="/sectors" style={{ color: colors.accent }}>{t('sectors.backToHub')}</Link>
            </div>
        );
    }

    return (
        <>
            <SEOHead
                title={t('sectors.detailTitle', { sector: currentSector.sector })}
                description={t('sectors.detailDesc', { sector: currentSector.sector, count: currentSector.company_count })}
                canonical={`https://kstockview.com/sectors/${sectorSlug}`}
                jsonLd={[{
                    '@type': 'ItemList',
                    name: `${currentSector.sector} - ${t('sectors.sectorAnalysis')}`,
                    numberOfItems: currentSector.company_count,
                    itemListElement: currentSector.top_companies.map((c, i) => ({
                        '@type': 'ListItem',
                        position: i + 1,
                        name: isEn ? (c.name_en || c.name) : c.name,
                        url: `https://kstockview.com/stocks/${c.stock_code}`,
                    })),
                }]}
            />
            <div style={{ minHeight: '100vh', background: colors.bgBody, color: colors.textPrimary, padding: '40px 16px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <Link to="/sectors" style={{ color: colors.accent, textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
                        <ArrowLeft size={16} /> {t('sectors.backToHub')}
                    </Link>

                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
                        {currentSector.sector}
                    </h1>
                    <p style={{ color: colors.textMuted, fontSize: '0.85rem', marginBottom: '24px' }}>
                        {t('sectors.companyCount', { count: currentSector.company_count })} · {t('sectors.totalRevenue')}: {formatRevenue(currentSector.total_revenue)}
                    </p>

                    {/* Companies table */}
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
                                    <th style={{ ...thStyle(colors), textAlign: 'right' }}>{t('sectors.revenue')}</th>
                                    <th style={{ ...thStyle(colors), textAlign: 'right' }}>{t('sectors.opProfit')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentSector.top_companies.map((c, i) => (
                                    <tr
                                        key={c.stock_code}
                                        style={{
                                            borderBottom: `1px solid ${colors.border}`,
                                            cursor: 'pointer',
                                            transition: 'background 0.15s',
                                        }}
                                        onClick={() => navigate(`/stocks/${c.stock_code}`)}
                                        onMouseEnter={e => e.currentTarget.style.background = colors.accentBg}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ ...tdStyle(), textAlign: 'center', color: colors.textMuted, width: '40px' }}>{i + 1}</td>
                                        <td style={tdStyle()}>
                                            <span style={{ fontWeight: 600, color: colors.textPrimary }}>
                                                {isEn ? (c.name_en || c.name) : c.name}
                                            </span>
                                            <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: colors.textFaded }}>{c.stock_code}</span>
                                        </td>
                                        <td style={{ ...tdStyle(), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                            {formatRevenue(c.last_revenue)}
                                        </td>
                                        <td style={{ ...tdStyle(), textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: c.last_op_profit > 0 ? colors.positive : c.last_op_profit < 0 ? colors.negative : colors.textMuted }}>
                                            {formatRevenue(c.last_op_profit)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {currentSector.company_count > 10 && (
                        <p style={{ textAlign: 'center', color: colors.textFaded, fontSize: '0.8rem', marginTop: '12px' }}>
                            {t('sectors.showingTop', { shown: currentSector.top_companies.length, total: currentSector.company_count })}
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

const tdStyle = () => ({
    padding: '10px 16px',
    fontSize: '0.85rem',
});

export default SectorPage;
