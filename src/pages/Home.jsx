import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import { Search, Menu, X, BarChart3, TrendingUp, PieChart, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle, Trophy, Layers, ArrowRightLeft, Clock } from 'lucide-react';
import { loadUsCompanyIndex, loadUsCompanyData } from '../usDataLoader';
import { loadKrCompanyIndex, loadKrCompanyData, processKrCompanyData } from '../krDataLoader';
import LanguageToggle from '../components/LanguageToggle';
import MarketToggle from '../components/MarketToggle';
import ThemeToggle from '../components/ThemeToggle';
import StockPicker from '../components/StockPicker';
import { SpotlightCard, StockTrendRow, MoversGrid } from '../components/HomeSections';
import useThemeColors from '../hooks/useThemeColors';
import { getRecentStocks, clearRecentStocks } from '../recentStocks';
import { formatEok, formatUsd, prettyUsName } from '../compareUtils';

const POPULAR_KR = ['005930', '000660', '373220', '005380', '035420', '035720'];
const POPULAR_US = ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'TSLA', 'META'];
const SPOTLIGHT = ['005930', '000660'];

// Last 8 quarters of revenue + latest YoY for a popular-stock row
const trendOf = (quarters) => {
    const rows = (quarters || []).filter(q => q.revenue != null);
    if (rows.length === 0) return null;
    const last = rows[rows.length - 1];
    return { values: rows.slice(-8).map(q => q.revenue), revenue: last.revenue, yoy: last.rev_change ?? null };
};

const Home = () => {
    const { t, i18n } = useTranslation();
    const colors = useThemeColors();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [krCompanyIndex, setKrCompanyIndex] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('market_cap');
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarMarket, setSidebarMarket] = useState('kr');
    const [usCompanyIndex, setUsCompanyIndex] = useState([]);
    const [usIndexLoading, setUsIndexLoading] = useState(false);
    const [usSortBy, setUsSortBy] = useState('rank');
    const [usSearchTerm, setUsSearchTerm] = useState('');
    const [krQuarters, setKrQuarters] = useState({}); // code → processed quarterly rows (spotlight + popular)
    const [krNames, setKrNames] = useState({});
    const [usTrends, setUsTrends] = useState({}); // ticker → { trend, name }
    const [popularMarket, setPopularMarket] = useState('kr'); // mobile: one list at a time
    const [moversData, setMoversData] = useState(null);
    const [recentStocks, setRecentStocks] = useState([]);

    const isEn = i18n.language === 'en';

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        setRecentStocks(getRecentStocks());
    }, []);

    // Spotlight + popular KR stocks (per-company JSONs, cached by the loader)
    useEffect(() => {
        const codes = [...new Set([...SPOTLIGHT, ...POPULAR_KR])];
        Promise.all(codes.map(code => loadKrCompanyData(code).then(raw => [code, raw]).catch(() => [code, null])))
            .then(results => {
                const quarters = {};
                const names = {};
                results.forEach(([code, raw]) => {
                    if (!raw) return;
                    quarters[code] = processKrCompanyData(raw).quarterlyData;
                    names[code] = { name: raw.name, name_en: raw.name_en };
                });
                setKrQuarters(quarters);
                setKrNames(names);
            });
        Promise.all(POPULAR_US.map(ticker => loadUsCompanyData(ticker).then(d => [ticker, d]).catch(() => [ticker, null])))
            .then(results => {
                const trends = {};
                results.forEach(([ticker, d]) => {
                    if (d) trends[ticker] = { trend: trendOf(d.quarterlyData), name: d.name };
                });
                setUsTrends(trends);
            });
        fetch('/data/kr_movers.json').then(r => r.json()).then(setMoversData).catch(() => {});
    }, []);

    // Load KR company index for sidebar + home search
    useEffect(() => {
        async function loadData() {
            setDataLoading(true);
            try {
                const index = await loadKrCompanyIndex();
                setKrCompanyIndex(index || []);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setDataLoading(false);
            }
        }
        loadData();
    }, []);

    const companyList = useMemo(() => {
        let list = krCompanyIndex.map(c => ({
            code: c.stock_code,
            name: isEn ? (c.name_en || c.name) : c.name,
            mktcap: c.last_mktcap || 0,
        }))
        .filter(c => {
            const term = searchTerm.toLowerCase();
            const idx = krCompanyIndex.find(i => i.stock_code === c.code);
            return c.name.toLowerCase().includes(term) || c.code.includes(searchTerm) || (idx?.name_en || '').toLowerCase().includes(term) || (idx?.name || '').toLowerCase().includes(term);
        });

        if (sortBy === 'market_cap') {
            list.sort((a, b) => b.mktcap - a.mktcap);
        } else {
            list.sort((a, b) => a.code.localeCompare(b.code));
        }

        return list;
    }, [searchTerm, sortBy, krCompanyIndex, isEn]);

    // US company index: needed by the home search right away (also feeds the sidebar's US list)
    useEffect(() => {
        if (usCompanyIndex.length > 0) return;
        let cancelled = false;
        setUsIndexLoading(true);
        loadUsCompanyIndex()
            .then(index => { if (!cancelled) setUsCompanyIndex(index || []); })
            .catch(err => console.error('Error loading US company index:', err))
            .finally(() => { if (!cancelled) setUsIndexLoading(false); });
        return () => { cancelled = true; };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const usCompanyList = useMemo(() => {
        let list = usCompanyIndex.filter(c => {
            const term = usSearchTerm.toLowerCase();
            return c.ticker.toLowerCase().includes(term) || c.name.toLowerCase().includes(term);
        });
        if (usSortBy === 'ticker') {
            list = [...list].sort((a, b) => a.ticker.localeCompare(b.ticker));
        } else if (usSortBy === 'name') {
            list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        }
        return list;
    }, [usCompanyIndex, usSearchTerm, usSortBy]);

    const handleStockSelect = (code) => {
        setIsMobileMenuOpen(false);
        navigate(`/stocks/${code}`);
    };

    const handleUsStockSelect = (ticker) => {
        setIsMobileMenuOpen(false);
        navigate(`/us-stocks/${ticker}`);
    };

    const handleMarketToggle = (market) => {
        setSidebarMarket(market);
        setSearchTerm('');
        setUsSearchTerm('');
        setSortDropdownOpen(false);
    };

    // Home search: Korean and US stocks together. Latin-only input (tickers) lists US first.
    const searchAll = (term) => {
        const q = term.trim().toLowerCase();
        if (!q) return [];
        const kr = krCompanyIndex
            .filter(c => c.stock_code.includes(q) || c.name.toLowerCase().includes(q) || (c.name_en || '').toLowerCase().includes(q))
            .sort((a, b) => (b.last_mktcap || 0) - (a.last_mktcap || 0))
            .slice(0, 6)
            .map(c => ({ id: `kr:${c.stock_code}`, code: c.stock_code, name: isEn ? (c.name_en || c.name) : c.name, meta: `KR · ${c.sector || ''}` }));
        const us = usCompanyIndex
            .filter(c => c.ticker.toLowerCase().startsWith(q) || c.name.toLowerCase().includes(q))
            .sort((a, b) => (b.ticker.toLowerCase() === q) - (a.ticker.toLowerCase() === q))
            .slice(0, 4)
            .map(c => ({ id: `us:${c.ticker}`, code: c.ticker, name: prettyUsName(c.name), meta: 'US' }));
        return /^[a-z0-9.\s-]+$/i.test(q) ? [...us, ...kr] : [...kr, ...us];
    };

    const openSearchResult = (id) => {
        const [market, code] = id.split(':');
        navigate(market === 'us' ? `/us-stocks/${code}` : `/stocks/${code}`);
    };

    const krName = (code) => {
        const n = krNames[code];
        return n ? (isEn ? (n.name_en || n.name) : n.name) : code;
    };
    const spotlightColors = [
        { color: '#409cff', light: '#6ab6ff' },
        { color: '#a855f7', light: '#c084fc' },
    ];

    return (
        <>
            <SEOHead
                title={t('helmet.homeTitle')}
                description={t('helmet.homeDesc')}
                canonical="https://kstockview.com"
                jsonLd={[
                    {
                        '@type': 'FAQPage',
                        mainEntity: [
                            { '@type': 'Question', name: t('faq.home.q1'), acceptedAnswer: { '@type': 'Answer', text: t('faq.home.a1') } },
                            { '@type': 'Question', name: t('faq.home.q2'), acceptedAnswer: { '@type': 'Answer', text: t('faq.home.a2') } },
                            { '@type': 'Question', name: t('faq.home.q3'), acceptedAnswer: { '@type': 'Answer', text: t('faq.home.a3') } },
                            { '@type': 'Question', name: t('faq.home.q4'), acceptedAnswer: { '@type': 'Answer', text: t('faq.home.a4') } }
                        ]
                    }
                ]}
            />

            <div className="app-container">
                {/* Mobile Header with Hamburger Menu */}
                <div className="mobile-header">
                    <button
                        className="hamburger-menu"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <Link to="/" className="mobile-app-title" style={{ textDecoration: 'none', color: 'inherit' }}>KSTOCKVIEW</Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>
                </div>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="mobile-overlay"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* SIDEBAR */}
                <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <div className="sidebar-header">
                        <div className="sidebar-header-top">
                            <Link to="/" className="app-title" style={{ textDecoration: 'none', color: 'inherit' }}>KSTOCKVIEW</Link>
                            <div className="sidebar-toggles">
                                <ThemeToggle />
                                <LanguageToggle />
                            </div>
                        </div>
                        <MarketToggle activeMarket={sidebarMarket} onChange={handleMarketToggle} />
                        {sidebarMarket === 'kr' ? (
                            <>
                                <div className="sort-dropdown-container">
                                    <button
                                        className="sort-dropdown-btn"
                                        onClick={() => setSortDropdownOpen(prev => !prev)}
                                    >
                                        <ArrowUpDown size={16} />
                                        <span>
                                            {sortBy === 'market_cap' ? t('sidebar.sortByMarketCap') : t('sidebar.sortByCode')}
                                        </span>
                                    </button>
                                    {sortDropdownOpen && (
                                        <div className="sort-dropdown-menu">
                                            <button className={`sort-option ${sortBy === 'market_cap' ? 'active' : ''}`}
                                                onClick={() => { setSortBy('market_cap'); setSortDropdownOpen(false); }}>
                                                {t('sidebar.sortByMarketCap')}
                                            </button>
                                            <button className={`sort-option ${sortBy === 'code' ? 'active' : ''}`}
                                                onClick={() => { setSortBy('code'); setSortDropdownOpen(false); }}>
                                                {t('sidebar.sortByCode')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="sort-dropdown-container">
                                    <button className="sort-dropdown-btn" onClick={() => setSortDropdownOpen(prev => !prev)}>
                                        <ArrowUpDown size={16} />
                                        <span>
                                            {usSortBy === 'rank' ? t('usSidebar.sortByRank') :
                                                usSortBy === 'ticker' ? t('usSidebar.sortByTicker') : t('usSidebar.sortByName')}
                                        </span>
                                    </button>
                                    {sortDropdownOpen && (
                                        <div className="sort-dropdown-menu">
                                            <button className={`sort-option ${usSortBy === 'rank' ? 'active' : ''}`}
                                                onClick={() => { setUsSortBy('rank'); setSortDropdownOpen(false); }}>
                                                {t('usSidebar.sortByRank')}
                                            </button>
                                            <button className={`sort-option ${usSortBy === 'ticker' ? 'active' : ''}`}
                                                onClick={() => { setUsSortBy('ticker'); setSortDropdownOpen(false); }}>
                                                {t('usSidebar.sortByTicker')}
                                            </button>
                                            <button className={`sort-option ${usSortBy === 'name' ? 'active' : ''}`}
                                                onClick={() => { setUsSortBy('name'); setSortDropdownOpen(false); }}>
                                                {t('usSidebar.sortByName')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder={sidebarMarket === 'kr' ? t('sidebar.searchPlaceholder') : t('usSidebar.searchPlaceholder')}
                            value={sidebarMarket === 'kr' ? searchTerm : usSearchTerm}
                            onChange={(e) => sidebarMarket === 'kr' ? setSearchTerm(e.target.value) : setUsSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="ticker-list">
                        {sidebarMarket === 'kr' ? (
                            dataLoading ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted }}>
                                    {t('common.loadingSidebar')}
                                </div>
                            ) : (
                                companyList.map((comp) => (
                                    <button
                                        key={comp.code}
                                        onClick={() => handleStockSelect(comp.code)}
                                        className="ticker-item"
                                    >
                                        <span className="ticker-code">{comp.code}</span>
                                        <span className="ticker-name">{comp.name}</span>
                                    </button>
                                ))
                            )
                        ) : (
                            usIndexLoading ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted }}>
                                    {t('common.loadingSidebar')}
                                </div>
                            ) : (
                                usCompanyList.map((comp) => (
                                    <button
                                        key={comp.ticker}
                                        onClick={() => handleUsStockSelect(comp.ticker)}
                                        className="ticker-item"
                                    >
                                        <span className="ticker-code">{comp.ticker}</span>
                                        <span className="ticker-name">{comp.name}</span>
                                    </button>
                                ))
                            )
                        )}
                    </div>

                    {/* Collapse Toggle Button */}
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? t('sidebar.openSidebar') : t('sidebar.collapseSidebar')}
                    >
                        {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </aside>

                {/* MAIN CONTENT */}
                <main className="main-content">
                    <div className="charts-container">
                        <div className="home-page">

                            {/* Hero: what the site does + search (Korean and US stocks together) */}
                            <section className="home-section home-hero2">
                                <p className="home-hero2-brand" aria-hidden="true">KSTOCKVIEW</p>
                                <h1 className="home-hero2-title">
                                    {t('home.tagline')}<br />
                                    {t('home.tagline2')}
                                </h1>
                                <StockPicker
                                    className="home-search"
                                    search={searchAll}
                                    onPick={openSearchResult}
                                    placeholder={t('home.searchPlaceholder')}
                                    hint={t('home.searchHint')}
                                />
                                <div className="home-hero-badge">
                                    <CheckCircle size={16} className="home-hero-badge-icon" />
                                    <span className="home-hero-badge-text">{t('home.freeService')}</span>
                                </div>
                            </section>

                            {/* Recently viewed (this browser only) */}
                            {recentStocks.length > 0 && (
                                <section className="home-section home-recent">
                                    <span className="home-recent-label"><Clock size={14} /> {t('home.recentTitle')}</span>
                                    <div className="home-recent-chips">
                                        {recentStocks.map(s => (
                                            <Link
                                                key={`${s.market}:${s.code}`}
                                                to={s.market === 'us' ? `/us-stocks/${s.code}` : `/stocks/${s.code}`}
                                                className="home-recent-chip"
                                            >
                                                <span className="home-recent-chip-name">
                                                    {s.market === 'us' ? prettyUsName(s.name) : (isEn ? (s.name_en || s.name) : s.name)}
                                                </span>
                                                <span className="home-recent-chip-code">{s.code}</span>
                                            </Link>
                                        ))}
                                        <button className="home-recent-clear" onClick={() => { clearRecentStocks(); setRecentStocks([]); }}>
                                            {t('home.recentClear')}
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* Earnings spotlight */}
                            <section className="home-section">
                                <p className="home-section-label">{t('home.spotlightTitle')}</p>
                                <div className="home-spotlight-grid">
                                    {SPOTLIGHT.map((code, i) => (
                                        krQuarters[code] ? (
                                            <SpotlightCard
                                                key={code}
                                                code={code}
                                                name={krName(code)}
                                                color={spotlightColors[i].color}
                                                colorLight={spotlightColors[i].light}
                                                quarters={krQuarters[code]}
                                                isMobile={isMobile}
                                                colors={colors}
                                            />
                                        ) : (
                                            <div key={code} className="home-spotlight-card home-skeleton" />
                                        )
                                    ))}
                                </div>
                            </section>

                            {/* Popular stocks with revenue trend (desktop: KR | US side by side, mobile: toggle) */}
                            <section className="home-section">
                                <div className="home-section-head">
                                    <p className="home-section-label">{t('home.popularTitle')}</p>
                                    <span className="home-section-sub">{t('metricTabs.peersMetric')}</span>
                                </div>
                                {isMobile && (
                                    <div className="chart-controls-group home-popular-toggle" role="radiogroup">
                                        {['kr', 'us'].map(m => (
                                            <button
                                                key={m}
                                                role="radio"
                                                aria-checked={popularMarket === m}
                                                className={`chart-chip ${popularMarket === m ? 'active' : ''}`}
                                                onClick={() => setPopularMarket(m)}
                                            >
                                                {m === 'kr' ? '🇰🇷' : '🇺🇸'} {t(m === 'kr' ? 'home.popularKr' : 'home.popularUs')}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="home-popular-columns">
                                    {(!isMobile || popularMarket === 'kr') && (
                                        <div className="home-popular-list">
                                            {!isMobile && <p className="home-popular-list-title">🇰🇷 {t('home.popularKr')}</p>}
                                            {POPULAR_KR.map(code => (
                                                <StockTrendRow
                                                    key={code}
                                                    to={`/stocks/${code}`}
                                                    code={code}
                                                    name={krName(code)}
                                                    trend={krQuarters[code] ? trendOf(krQuarters[code]) : null}
                                                    formatRevenue={(v) => formatEok(v / 1e8, isEn)}
                                                    colors={colors}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {(!isMobile || popularMarket === 'us') && (
                                        <div className="home-popular-list">
                                            {!isMobile && <p className="home-popular-list-title">🇺🇸 {t('home.popularUs')}</p>}
                                            {POPULAR_US.map(ticker => (
                                                <StockTrendRow
                                                    key={ticker}
                                                    to={`/us-stocks/${ticker}`}
                                                    code={ticker}
                                                    name={prettyUsName(usTrends[ticker]?.name) || ticker}
                                                    trend={usTrends[ticker]?.trend ?? null}
                                                    formatRevenue={(v) => formatUsd(v)}
                                                    colors={colors}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Market movers: latest quarter vs the same quarter a year earlier */}
                            {moversData?.period && (
                                <section className="home-section">
                                    <div className="home-section-head">
                                        <p className="home-section-label">{t('movers.title')}</p>
                                        <span className="home-section-sub">
                                            {t('movers.criteria', { period: moversData.period, prev: moversData.prev_period, n: moversData.universe })}
                                        </span>
                                    </div>
                                    <MoversGrid movers={moversData} isEn={isEn} colors={colors} />
                                </section>
                            )}

                            {/* Global compare promo + quick links */}
                            <section className="home-section">
                                <Link to="/global-compare" className="home-promo">
                                    <div>
                                        <p className="home-promo-title">{t('home.globalCompareTitle')}</p>
                                        <p className="home-promo-desc">{t('home.globalCompareDesc')}</p>
                                    </div>
                                    <span className="home-promo-cta">{t('home.globalCompareCta')} →</span>
                                </Link>
                                <div className="home-links">
                                    {[
                                        { to: '/rankings', icon: Trophy, title: t('home.rankingsLink'), desc: t('home.rankingsLinkDesc') },
                                        { to: '/sectors', icon: Layers, title: t('home.sectorsLink'), desc: t('home.sectorsLinkDesc') },
                                        { to: '/compare/005930-vs-000660', icon: ArrowRightLeft, title: t('home.compareLink'), desc: t('home.compareLinkDesc') },
                                    ].map(link => (
                                        <Link key={link.to} to={link.to} className="home-link-card">
                                            <link.icon size={22} className="home-link-icon" />
                                            <span>
                                                <span className="home-link-title">{link.title}</span>
                                                <span className="home-link-desc">{link.desc}</span>
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            {/* What the site covers (compact) */}
                            <section className="home-section home-about">
                                <p className="home-section-label">{t('home.featuresLabel')}</p>
                                <div className="home-about-grid">
                                    {[
                                        { icon: BarChart3, tone: 'blue', title: t('home.featureRevenue'), desc: t('home.featureRevenueDesc') },
                                        { icon: TrendingUp, tone: 'green', title: t('home.featureYoy'), desc: t('home.featureYoyDesc') },
                                        { icon: PieChart, tone: 'purple', title: t('home.featureMargin'), desc: t('home.featureMarginDesc') },
                                    ].map(f => (
                                        <div key={f.title} className="home-about-item">
                                            <span className={`home-about-icon home-feature-icon--${f.tone}`}><f.icon size={18} /></span>
                                            <span>
                                                <span className="home-about-title">{f.title}</span>
                                                <span className="home-about-desc">{f.desc}</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Footer */}
                            <footer className="home-footer">
                                <div className="home-footer-brand">
                                    <h3>KSTOCKVIEW</h3>
                                    <p>{t('footer.serviceDesc')}</p>
                                </div>
                                <div className="home-footer-notice">
                                    <p dangerouslySetInnerHTML={{ __html: t('footer.dataSourceText') }} />
                                    <p dangerouslySetInnerHTML={{ __html: t('usFooter.dataSourceText') }} />
                                    <p dangerouslySetInnerHTML={{ __html: t('footer.disclaimer3') }} />
                                </div>
                                <div className="home-footer-links">
                                    <Link to="/privacy">{t('footer.privacyPolicy')}</Link>
                                    <span className="home-footer-divider">|</span>
                                    <Link to="/terms">{t('footer.terms')}</Link>
                                    <span className="home-footer-divider">|</span>
                                    <Link to="/contact">{t('footer.contact')}</Link>
                                </div>
                                <p className="home-footer-copyright">
                                    &copy; 2026 KSTOCKVIEW. All rights reserved.
                                </p>
                            </footer>

                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default Home;
