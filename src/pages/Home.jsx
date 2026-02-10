import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Search, Menu, X, BarChart3, TrendingUp, PieChart, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { loadAllFinancialData } from '../dataLoader';
import LanguageToggle from '../components/LanguageToggle';

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

    const popularStocks = [
        { code: '005930', name: '삼성전자' },
        { code: '000660', name: 'SK하이닉스' },
        { code: '373220', name: 'LG에너지솔루션' },
        { code: '005380', name: '현대자동차' },
        { code: '035420', name: 'NAVER' },
        { code: '035720', name: '카카오' },
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

    const handleStockSelect = (code) => {
        setIsMobileMenuOpen(false);
        navigate(`/stocks/${code}`);
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
                                    <button
                                        className={`sort-option ${sortBy === 'revenue' ? 'active' : ''}`}
                                        onClick={() => { setSortBy('revenue'); setSortDropdownOpen(false); }}
                                    >
                                        {t('sidebar.sortByRevenue')}
                                    </button>
                                    <button
                                        className={`sort-option ${sortBy === 'market_cap' ? 'active' : ''}`}
                                        onClick={() => { setSortBy('market_cap'); setSortDropdownOpen(false); }}
                                    >
                                        {t('sidebar.sortByMarketCap')}
                                    </button>
                                    <button
                                        className={`sort-option ${sortBy === 'op_profit' ? 'active' : ''}`}
                                        onClick={() => { setSortBy('op_profit'); setSortDropdownOpen(false); }}
                                    >
                                        {t('sidebar.sortByOpProfit')}
                                    </button>
                                    <button
                                        className={`sort-option ${sortBy === 'code' ? 'active' : ''}`}
                                        onClick={() => { setSortBy('code'); setSortDropdownOpen(false); }}
                                    >
                                        {t('sidebar.sortByCode')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder={t('sidebar.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="ticker-list">
                        {dataLoading ? (
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
                        {/* Hero Section */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '60vh',
                            textAlign: 'center',
                            padding: '20px'
                        }}>
                            {/* Logo */}
                            <h1 style={{
                                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                                fontWeight: '700',
                                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                marginBottom: '16px',
                                letterSpacing: '-0.02em'
                            }}>
                                KSTOCKVIEW
                            </h1>

                            {/* Tagline */}
                            <p style={{
                                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                                color: '#94a3b8',
                                marginBottom: '20px',
                                maxWidth: '600px',
                                lineHeight: '1.6'
                            }}>
                                {t('home.tagline')}<br />
                                {t('home.tagline2')}
                            </p>

                            {/* Free Service Badge */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '12px',
                                padding: '12px 20px',
                                marginBottom: '40px'
                            }}>
                                <CheckCircle size={20} style={{ color: '#10b981' }} />
                                <span style={{
                                    color: '#10b981',
                                    fontSize: '0.95rem',
                                    fontWeight: '600'
                                }}>
                                    {t('home.freeService')}
                                </span>
                            </div>

                            {/* Features */}
                            <div style={{
                                display: 'flex',
                                gap: '24px',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                marginBottom: '48px',
                                maxWidth: '800px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#94a3b8',
                                    fontSize: '0.95rem'
                                }}>
                                    <BarChart3 size={20} style={{ color: '#3b82f6' }} />
                                    <span>{t('home.featureRevenue')}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#94a3b8',
                                    fontSize: '0.95rem'
                                }}>
                                    <TrendingUp size={20} style={{ color: '#10b981' }} />
                                    <span>{t('home.featureYoy')}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#94a3b8',
                                    fontSize: '0.95rem'
                                }}>
                                    <PieChart size={20} style={{ color: '#8b5cf6' }} />
                                    <span>{t('home.featureMargin')}</span>
                                </div>
                            </div>

                            {/* How to Use */}
                            <div className="chart-section" style={{ maxWidth: '500px', width: '100%' }}>
                                <h3>{t('home.howToUse')}</h3>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    textAlign: 'left',
                                    padding: '10px 0'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{
                                            backgroundColor: '#3b82f6',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <Menu size={20} color="#fff" />
                                        </div>
                                        <div>
                                            <p style={{ color: '#e2e8f0', margin: '0 0 4px 0', fontWeight: '500' }}>
                                                {t('home.searchStocks')}
                                            </p>
                                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: t('home.searchStocksDesc') }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{
                                            backgroundColor: '#10b981',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <Search size={20} color="#fff" />
                                        </div>
                                        <div>
                                            <p style={{ color: '#e2e8f0', margin: '0 0 4px 0', fontWeight: '500' }}>
                                                {t('home.searchAndSort')}
                                            </p>
                                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                {t('home.searchAndSortDesc')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Popular Stocks */}
                            <div style={{ width: '100%', maxWidth: '600px', marginTop: '30px' }}>
                                <h3 style={{
                                    fontSize: '0.95rem',
                                    color: '#94a3b8',
                                    marginBottom: '16px',
                                    fontWeight: '500'
                                }}>
                                    {t('home.popularStocks')}
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '10px',
                                    justifyContent: 'center'
                                }}>
                                    {popularStocks.map((stock) => (
                                        <Link
                                            key={stock.code}
                                            to={`/stocks/${stock.code}`}
                                            style={{
                                                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '8px',
                                                padding: '10px 16px',
                                                color: '#e2e8f0',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.6)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            }}
                                        >
                                            <span style={{ color: '#60a5fa', fontWeight: '600', fontSize: '0.8rem' }}>
                                                {stock.code}
                                            </span>
                                            <span>{stock.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <footer style={{
                            marginTop: '60px',
                            padding: '30px 20px',
                            borderTop: '1px solid #334155',
                            textAlign: 'center',
                            backgroundColor: '#0f172a',
                            color: '#64748b',
                            fontSize: '0.8rem',
                            lineHeight: '1.6'
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '8px' }}>KSTOCKVIEW</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>{t('footer.serviceDesc')}</p>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '20px',
                                flexWrap: 'wrap',
                                marginBottom: '20px',
                                fontSize: '0.85rem'
                            }}>
                                <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'underline' }}>
                                    {t('footer.privacyPolicy')}
                                </Link>
                                <span style={{ color: '#475569' }}>|</span>
                                <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'underline' }}>
                                    {t('footer.terms')}
                                </Link>
                                <span style={{ color: '#475569' }}>|</span>
                                <Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'underline' }}>
                                    {t('footer.contact')}
                                </Link>
                            </div>

                            <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '20px', opacity: 0.8 }}>
                                <p style={{ margin: '5px 0' }}>© 2026 KSTOCKVIEW. All rights reserved.</p>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>
        </>
    );
};

export default Home;
