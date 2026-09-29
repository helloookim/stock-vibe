import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ArrowRightLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import SubPageHeader from '../components/SubPageHeader';
import { MetricTabs } from '../components/MetricTabs';
import { formatEok } from '../compareUtils';
import { formatSignedChange } from '../metricSummary';

const money = (v, isEn) => formatEok(v / 1e8, isEn);

// Category order, icon, value formatting, and whether a relative bar makes sense
// (bars only for "bigger is the story" lists, not for lowest-PER style lists)
const CATEGORIES = [
    { key: 'market_cap_top', icon: '🏆', format: money, bar: true },
    { key: 'revenue_top', icon: '💰', format: money, bar: true },
    { key: 'op_profit_top', icon: '📈', format: money, bar: true },
    { key: 'per_lowest', icon: '🔍', format: (v) => `${v.toFixed(1)}x` },
    { key: 'pbr_lowest', icon: '📊', format: (v) => `${v.toFixed(2)}x` },
    { key: 'revenue_growth_top', icon: '🚀', format: (v) => formatSignedChange(v), bar: true },
    { key: 'op_margin_top', icon: '✨', format: (v) => `${v.toFixed(1)}%`, bar: true },
    { key: 'debt_ratio_lowest', icon: '🛡️', format: (v) => `${v.toFixed(1)}%` },
];
const MARKETS = ['all', 'KOSPI', 'KOSDAQ'];

const formatDate = (d) => (d ? String(d).replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3') : '-');

const Rankings = () => {
    const { metric } = useParams();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const isEn = i18n.language === 'en';

    const marketParam = searchParams.get('market');
    const market = MARKETS.includes(marketParam) ? marketParam : 'all';
    const setMarket = (m) => {
        const next = new URLSearchParams(searchParams);
        if (m === 'all') next.delete('market');
        else next.set('market', m);
        setSearchParams(next, { replace: true });
    };

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

    const nameOf = (item) => (isEn ? (item.name_en || item.name) : item.name);
    const listOf = (key, m = 'all') => data?.[key]?.[m] || [];
    const criteriaText = (key) => t(`rankings.criteria.${key}`, {
        year: data?.fiscal_year, prev: data?.fiscal_year - 1, date: formatDate(data?.price_date),
    });
    const subLine = (item) => [item.sector, item.market].filter(Boolean).join(' · ');

    // ------------------------------------------------------------ hub
    if (!metric) {
        return (
            <>
                <SEOHead
                    title={t('rankings.hubTitle')}
                    description={t('rankings.hubDesc')}
                    canonical="https://kstockview.com/rankings"
                    jsonLd={[{ '@type': 'WebPage', name: t('rankings.hubTitle'), description: t('rankings.hubDesc') }]}
                />
                <div className="compare-page">
                    <SubPageHeader />
                    <div className="compare-inner">
                        <h1 className="rankings-title">{t('rankings.hubHeading')}</h1>
                        <p className="rankings-subtitle">{t('rankings.hubSubtitle')}</p>
                        {data && <p className="rankings-basis">{t('rankings.basis', { year: data.fiscal_year, date: formatDate(data.price_date) })}</p>}

                        {loading ? (
                            <div className="metric-empty">{t('common.loading')}</div>
                        ) : (
                            <div className="rankings-hub-grid">
                                {CATEGORIES.map(cat => (
                                    <Link key={cat.key} to={`/rankings/${cat.key}`} className="rankings-hub-card">
                                        <div className="rankings-hub-card-head">
                                            <span className="rankings-hub-icon" aria-hidden="true">{cat.icon}</span>
                                            <span>
                                                <span className="rankings-hub-card-title">{t(`rankings.${cat.key}`)}</span>
                                                <span className="rankings-hub-card-desc">{t(`rankings.${cat.key}_desc`)}</span>
                                            </span>
                                        </div>
                                        <ol className="rankings-hub-preview">
                                            {listOf(cat.key).slice(0, 3).map(item => (
                                                <li key={item.stock_code}>
                                                    <span className={`rankings-rank rank-${item.rank}`}>{item.rank}</span>
                                                    <span className="rankings-hub-preview-name">{nameOf(item)}</span>
                                                    <span className="rankings-hub-preview-value">{cat.format(item.value, isEn)}</span>
                                                </li>
                                            ))}
                                        </ol>
                                        <span className="rankings-hub-more">{t('rankings.viewAll')} <ChevronRight size={14} /></span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    // ------------------------------------------------------------ detail
    const category = CATEGORIES.find(c => c.key === metric);
    if (!category) {
        return (
            <div className="compare-page">
                <SubPageHeader />
                <div className="compare-inner" style={{ textAlign: 'center', paddingTop: '60px' }}>
                    <p>{t('rankings.notFound')}</p>
                    <Link to="/rankings" style={{ color: 'var(--accent)' }}>{t('rankings.backToHub')}</Link>
                </div>
            </div>
        );
    }

    const items = listOf(metric, market);
    const maxValue = Math.max(0, ...items.map(i => i.value));
    const top3 = items.slice(0, 3).map(i => i.stock_code);

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
                        name: nameOf(item),
                        url: `https://kstockview.com/stocks/${item.stock_code}`,
                    })),
                }]}
            />
            <div className="compare-page">
                <SubPageHeader />
                <div className="compare-inner">
                    <Link to="/rankings" className="rankings-back">← {t('rankings.backToHub')}</Link>

                    <MetricTabs
                        tabs={CATEGORIES.map(c => ({ key: c.key, label: t(`rankings.short.${c.key}`) }))}
                        activeTab={metric}
                        onChange={(key) => navigate(`/rankings/${key}${window.location.search}`)}
                    />

                    <div className="rankings-detail-head">
                        <div>
                            <h1 className="rankings-title">{category.icon} {t(`rankings.${metric}`)}</h1>
                            <p className="rankings-subtitle">{t(`rankings.${metric}_desc`)}</p>
                        </div>
                        {top3.length >= 2 && (
                            <Link to={`/compare/${top3.join('-vs-')}`} className="rankings-compare-link">
                                <ArrowRightLeft size={14} /> {t('rankings.compareTop3')}
                            </Link>
                        )}
                    </div>

                    <div className="rankings-controls">
                        <div className="chart-controls-group" role="radiogroup">
                            {MARKETS.map(m => (
                                <button
                                    key={m}
                                    role="radio"
                                    aria-checked={market === m}
                                    className={`chart-chip ${market === m ? 'active' : ''}`}
                                    onClick={() => setMarket(m)}
                                >
                                    {t(`rankings.market.${m}`)}
                                </button>
                            ))}
                        </div>
                        {data && <span className="rankings-criteria">{criteriaText(metric)}</span>}
                    </div>

                    {loading ? (
                        <div className="metric-empty">{t('common.loading')}</div>
                    ) : items.length === 0 ? (
                        <div className="metric-empty">{t('rankings.empty')}</div>
                    ) : (
                        <div className={`rankings-list ${metric === 'market_cap_top' ? 'no-mktcap' : ''}`} role="table">
                            <div className="rankings-row rankings-row-head" role="row">
                                <span role="columnheader">#</span>
                                <span role="columnheader">{t('rankings.company')}</span>
                                <span role="columnheader" className="rankings-col-value">{t(`rankings.valueLabel.${metric}`)}</span>
                                {metric !== 'market_cap_top' && (
                                    <span role="columnheader" className="rankings-col-mktcap">{t('rankings.marketCap')}</span>
                                )}
                            </div>
                            {items.map(item => (
                                <Link key={item.stock_code} to={`/stocks/${item.stock_code}`} className="rankings-row" role="row">
                                    <span className={`rankings-rank rank-${item.rank}`}>{item.rank}</span>
                                    <span className="rankings-company">
                                        <span className="rankings-company-name">
                                            {nameOf(item)}
                                            <span className="rankings-company-code">{item.stock_code}</span>
                                        </span>
                                        {subLine(item) && <span className="rankings-company-sub">{subLine(item)}</span>}
                                    </span>
                                    <span className="rankings-col-value">
                                        <span className="rankings-value">{category.format(item.value, isEn)}</span>
                                        {category.bar && maxValue > 0 && (
                                            <span className="rankings-bar" aria-hidden="true">
                                                <span style={{ width: `${Math.max(2, (item.value / maxValue) * 100)}%` }} />
                                            </span>
                                        )}
                                    </span>
                                    {metric !== 'market_cap_top' && (
                                        <span className="rankings-col-mktcap">{item.mktcap != null ? money(item.mktcap, isEn) : '-'}</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}

                    {data && (
                        <p className="rankings-updated">{t('rankings.lastUpdated', { date: data.generated_at })}</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Rankings;
