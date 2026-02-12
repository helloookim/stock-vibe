import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Search, Menu, X, BarChart3, TrendingUp, PieChart, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { loadAllFinancialData } from '../dataLoader';
import { loadUsCompanyIndex } from '../usDataLoader';
import LanguageToggle from '../components/LanguageToggle';
import MarketToggle from '../components/MarketToggle';

const Home = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [financialRawData, setFinancialRawData] = useState({});
    const [marketCapData, setMarketCapData] = useState({});
    const [dataLoading, setDataLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('revenue');
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarMarket, setSidebarMarket] = useState('kr');
    const [usCompanyIndex, setUsCompanyIndex] = useState([]);
    const [usIndexLoading, setUsIndexLoading] = useState(false);
    const [usSortBy, setUsSortBy] = useState('rank');
    const [usSearchTerm, setUsSearchTerm] = useState('');

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const popularStocks = [
        { code: '005930', name: '삼성전자' },
        { code: '000660', name: 'SK하이닉스' },
        { code: '373220', name: 'LG에너지솔루션' },
        { code: '005380', name: '현대자동차' },
        { code: '035420', name: 'NAVER' },
        { code: '035720', name: '카카오' },
    ];

    const usPopularStocks = [
        { ticker: 'AAPL', name: 'Apple Inc.' },
        { ticker: 'NVDA', name: 'NVIDIA CORP' },
        { ticker: 'MSFT', name: 'MICROSOFT CORP' },
        { ticker: 'AMZN', name: 'AMAZON COM INC' },
        { ticker: 'TSLA', name: 'Tesla, Inc.' },
        { ticker: 'META', name: 'Meta Platforms, Inc.' },
    ];

    // Load financial data for sidebar
    useEffect(() => {
        async function loadData() {
            setDataLoading(true);
            try {
                const [financial, marketCap] = await Promise.all([
                    loadAllFinancialData(),
                    fetch('/market_cap_data.json').then(r => r.json())
                ]);
                setFinancialRawData(financial || {});
                setMarketCapData(marketCap || {});
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setDataLoading(false);
            }
        }
        loadData();
    }, []);

    const companyList = useMemo(() => {
        let list = Object.entries(financialRawData).map(([code, info]) => {
            const lastEntry = info.history && info.history.length > 0 ? info.history[info.history.length - 1] : null;
            const latestRevenue = lastEntry ? (lastEntry.revenue || 0) : 0;
            const latestOpProfit = lastEntry ? (lastEntry.op_profit || 0) : 0;
            const marketCap = marketCapData[code]?.market_cap || 0;

            return {
                code,
                name: info.name,
                latestRevenue,
                latestOpProfit,
                marketCap
            };
        })
        .filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.includes(searchTerm);
            return matchesSearch;
        });

        if (sortBy === 'revenue') {
            list.sort((a, b) => b.latestRevenue - a.latestRevenue);
        } else if (sortBy === 'op_profit') {
            list.sort((a, b) => b.latestOpProfit - a.latestOpProfit);
        } else if (sortBy === 'market_cap') {
            list.sort((a, b) => b.marketCap - a.marketCap);
        } else {
            list.sort((a, b) => a.code.localeCompare(b.code));
        }

        return list;
    }, [searchTerm, sortBy, financialRawData, marketCapData]);

    // Load US company index when sidebar switches to US
    useEffect(() => {
        if (sidebarMarket !== 'us' || usCompanyIndex.length > 0) return;
        async function loadUsIndex() {
            setUsIndexLoading(true);
            try {
                const index = await loadUsCompanyIndex();
                setUsCompanyIndex(index || []);
            } catch (err) {
                console.error('Error loading US company index:', err);
            } finally {
                setUsIndexLoading(false);
            }
        }
        loadUsIndex();
    }, [sidebarMarket]);

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

    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>{t('helmet.homeTitle')}</title>
                <meta name="description" content={t('helmet.homeDesc')} />
                <meta property="og:title" content={t('helmet.homeTitle')} />
                <meta property="og:description" content={t('helmet.appDescDefault')} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://kstockview.com" />
                <link rel="canonical" href="https://kstockview.com" />
            </Helmet>

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
                    <LanguageToggle />
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
                            <LanguageToggle />
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
                                            {sortBy === 'revenue' ? t('sidebar.sortByRevenue') :
                                                sortBy === 'op_profit' ? t('sidebar.sortByOpProfit') :
                                                sortBy === 'market_cap' ? t('sidebar.sortByMarketCap') : t('sidebar.sortByCode')}
                                        </span>
                                    </button>
                                    {sortDropdownOpen && (
                                        <div className="sort-dropdown-menu">
                                            <button className={`sort-option ${sortBy === 'revenue' ? 'active' : ''}`}
                                                onClick={() => { setSortBy('revenue'); setSortDropdownOpen(false); }}>
                                                {t('sidebar.sortByRevenue')}
                                            </button>
                                            <button className={`sort-option ${sortBy === 'market_cap' ? 'active' : ''}`}
                                                onClick={() => { setSortBy('market_cap'); setSortDropdownOpen(false); }}>
                                                {t('sidebar.sortByMarketCap')}
                                            </button>
                                            <button className={`sort-option ${sortBy === 'op_profit' ? 'active' : ''}`}
                                                onClick={() => { setSortBy('op_profit'); setSortDropdownOpen(false); }}>
                                                {t('sidebar.sortByOpProfit')}
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
                                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
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
                                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
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

                            {/* Hero Section */}
                            <section className="home-hero">
                                <h1 className="home-hero-logo">KSTOCKVIEW</h1>
                                <p className="home-hero-tagline">
                                    {t('home.tagline')}<br />
                                    {t('home.tagline2')}
                                </p>
                                <div className="home-hero-badge">
                                    <CheckCircle size={18} className="home-hero-badge-icon" />
                                    <span className="home-hero-badge-text">{t('home.freeService')}</span>
                                </div>
                                <button
                                    className="home-cta-primary"
                                    onClick={() => {
                                        if (isMobile) {
                                            setIsMobileMenuOpen(true);
                                        } else {
                                            setSidebarCollapsed(false);
                                            setTimeout(() => {
                                                const searchInput = document.querySelector('.search-box input');
                                                if (searchInput) searchInput.focus();
                                            }, 100);
                                        }
                                    }}
                                >
                                    <Search size={20} />
                                    {t('home.ctaButton')}
                                </button>
                            </section>

                            {/* Feature Cards */}
                            <section className="home-features-section">
                                <p className="home-features-title">{t('home.featuresLabel')}</p>
                                <div className="home-features-grid">
                                    <div className="home-feature-card">
                                        <div className="home-feature-icon home-feature-icon--blue">
                                            <BarChart3 size={24} />
                                        </div>
                                        <div className="home-feature-card-text">
                                            <h3 className="home-feature-title">{t('home.featureRevenue')}</h3>
                                            <p className="home-feature-desc">{t('home.featureRevenueDesc')}</p>
                                        </div>
                                    </div>
                                    <div className="home-feature-card">
                                        <div className="home-feature-icon home-feature-icon--green">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div className="home-feature-card-text">
                                            <h3 className="home-feature-title">{t('home.featureYoy')}</h3>
                                            <p className="home-feature-desc">{t('home.featureYoyDesc')}</p>
                                        </div>
                                    </div>
                                    <div className="home-feature-card">
                                        <div className="home-feature-icon home-feature-icon--purple">
                                            <PieChart size={24} />
                                        </div>
                                        <div className="home-feature-card-text">
                                            <h3 className="home-feature-title">{t('home.featureMargin')}</h3>
                                            <p className="home-feature-desc">{t('home.featureMarginDesc')}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* How to Use */}
                            <section className="home-howto-section">
                                <div className="home-howto-header">
                                    <p className="home-howto-label">{t('home.howToUseLabel')}</p>
                                    <h2 className="home-howto-title">{t('home.howToUse')}</h2>
                                </div>
                                <div className="home-howto-steps">
                                    <div
                                        className={`home-howto-step ${isMobile ? 'home-howto-step--clickable' : ''}`}
                                        onClick={() => { if (isMobile) setIsMobileMenuOpen(true); }}
                                    >
                                        <div className="home-howto-step-number home-howto-step-number--blue">1</div>
                                        <div className="home-howto-step-content">
                                            <p className="home-howto-step-title">{t('home.searchStocks')}</p>
                                            <p className="home-howto-step-desc" dangerouslySetInnerHTML={{ __html: t('home.searchStocksDesc') }} />
                                        </div>
                                        {isMobile && (
                                            <div className="home-howto-step-arrow">
                                                <ChevronRight size={18} />
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={`home-howto-step ${isMobile ? 'home-howto-step--clickable' : ''}`}
                                        onClick={() => { if (isMobile) setIsMobileMenuOpen(true); }}
                                    >
                                        <div className="home-howto-step-number home-howto-step-number--green">2</div>
                                        <div className="home-howto-step-content">
                                            <p className="home-howto-step-title">{t('home.searchAndSort')}</p>
                                            <p className="home-howto-step-desc">{t('home.searchAndSortDesc')}</p>
                                        </div>
                                        {isMobile && (
                                            <div className="home-howto-step-arrow">
                                                <ChevronRight size={18} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Popular Stocks - Korean */}
                            <section className="home-popular-section">
                                <p className="home-popular-label">🇰🇷 {t('home.popularStocks')}</p>
                                <div className="home-popular-grid">
                                    {popularStocks.map((stock) => (
                                        <Link
                                            key={stock.code}
                                            to={`/stocks/${stock.code}`}
                                            className="home-popular-chip"
                                        >
                                            <span className="home-popular-chip-code">{stock.code}</span>
                                            <span className="home-popular-chip-name">{stock.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            {/* Popular Stocks - US */}
                            <section className="home-popular-section" style={{ marginTop: '0' }}>
                                <p className="home-popular-label">🇺🇸 {t('home.usPopularStocks')}</p>
                                <div className="home-popular-grid">
                                    {usPopularStocks.map((stock) => (
                                        <Link
                                            key={stock.ticker}
                                            to={`/us-stocks/${stock.ticker}`}
                                            className="home-popular-chip"
                                        >
                                            <span className="home-popular-chip-code">{stock.ticker}</span>
                                            <span className="home-popular-chip-name">{stock.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            {/* Footer */}
                            <footer className="home-footer">
                                <div className="home-footer-brand">
                                    <h3>KSTOCKVIEW</h3>
                                    <p>{t('footer.serviceDesc')}</p>
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
