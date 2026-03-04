import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import { Search, Menu, X, BarChart3, TrendingUp, PieChart, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { loadUsCompanyIndex } from '../usDataLoader';
import { financialDataLoader } from '../dataLoader';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import LanguageToggle from '../components/LanguageToggle';
import MarketToggle from '../components/MarketToggle';

const Home = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [marketCapData, setMarketCapData] = useState({});
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
    const [spotlightData, setSpotlightData] = useState({ nvda: null, skHynix: null });
    const [spotlightLoading, setSpotlightLoading] = useState(true);

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

    // Load spotlight data for NVDA and SK Hynix
    useEffect(() => {
        async function loadSpotlightData() {
            try {
                const [nvdaRaw, skHynixRaw] = await Promise.all([
                    fetch('/data/us_stocks/NVDA.json').then(r => r.json()),
                    financialDataLoader.getCompany('000660')
                ]);

                const nvdaQuarters = (nvdaRaw.quarterly || [])
                    .filter(e => e.type === 'single')
                    .sort((a, b) => a.date - b.date)
                    .slice(-8)
                    .map(e => {
                        const match = e.fiscal_quarter?.match(/FY(\d+)Q(\d)/);
                        return {
                            label: match ? `FY${match[1].slice(-2)}Q${match[2]}` : '',
                            revenue: e.revenue,
                        };
                    });

                const skHynixQuarters = (skHynixRaw?.history || [])
                    .slice(-8)
                    .map(e => ({
                        label: `${String(e.year).slice(-2)}.${e.quarter}`,
                        revenue: e.revenue,
                    }));

                setSpotlightData({ nvda: nvdaQuarters, skHynix: skHynixQuarters });
            } catch (err) {
                console.error('Error loading spotlight data:', err);
            } finally {
                setSpotlightLoading(false);
            }
        }
        loadSpotlightData();
    }, []);

    const formatUsd = (val) => {
        if (val == null) return 'N/A';
        if (val >= 1e12) return `$${(val / 1e12).toFixed(1)}T`;
        if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
        if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
        return `$${val.toLocaleString()}`;
    };

    const formatKrw = (val, lang) => {
        if (val == null) return 'N/A';
        const abs = Math.abs(val);
        if (abs >= 1e12) {
            const v = (val / 1e12).toFixed(1);
            return lang === 'ko' ? `${v}조원` : `${v}T KRW`;
        }
        if (abs >= 1e8) {
            const v = Math.round(val / 1e8).toLocaleString();
            return lang === 'ko' ? `${v}억원` : `${v}B KRW`;
        }
        return val.toLocaleString();
    };

    // Load lightweight market cap data for sidebar (587KB instead of 40MB)
    useEffect(() => {
        async function loadData() {
            setDataLoading(true);
            try {
                const marketCap = await fetch('/market_cap_data.json').then(r => r.json());
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
        let list = Object.entries(marketCapData).map(([code, info]) => ({
            code,
            name: info.name,
            marketCap: info.market_cap || 0,
            rank: info.rank || 9999
        }))
        .filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.includes(searchTerm);
            return matchesSearch;
        });

        if (sortBy === 'market_cap') {
            list.sort((a, b) => a.rank - b.rank);
        } else {
            list.sort((a, b) => a.code.localeCompare(b.code));
        }

        return list;
    }, [searchTerm, sortBy, marketCapData]);

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

                            {/* Data Update Notice */}
                            <section style={{
                                maxWidth: '640px',
                                margin: '0 auto 2rem',
                                padding: '14px 20px',
                                background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
                                border: '1px solid rgba(96,165,250,0.2)',
                                borderRadius: '12px',
                                textAlign: 'center',
                            }}>
                                <p style={{
                                    margin: 0,
                                    color: '#93c5fd',
                                    fontSize: '0.85rem',
                                    lineHeight: '1.5',
                                }}>
                                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>
                                        {t('home.updateNoticeTitle')}
                                    </span>
                                    <br />
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                        {t('home.updateNoticeDesc')}
                                    </span>
                                </p>
                            </section>

                            {/* Revenue Spotlight Section */}
                            <section style={{
                                maxWidth: '900px',
                                margin: '0 auto 3rem',
                                padding: '0 16px',
                            }}>
                                <p style={{
                                    textAlign: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
                                    color: '#64748b',
                                    marginBottom: '24px',
                                }}>
                                    {t('home.spotlightTitle')}
                                </p>

                                {spotlightLoading ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                                        gap: '20px',
                                    }}>
                                        {[0, 1].map(i => (
                                            <div key={i} style={{
                                                background: 'rgba(30, 41, 59, 0.4)',
                                                borderRadius: '16px',
                                                height: '280px',
                                                animation: 'homeHeroFadeIn 1.5s ease-in-out infinite alternate',
                                            }} />
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                                        gap: '20px',
                                    }}>
                                        {/* NVDA Card */}
                                        {spotlightData.nvda && (
                                            <Link to="/us-stocks/NVDA" style={{ textDecoration: 'none' }}>
                                                <div style={{
                                                    background: 'rgba(30, 41, 59, 0.5)',
                                                    border: '1px solid rgba(96, 165, 250, 0.15)',
                                                    borderRadius: '16px',
                                                    padding: isMobile ? '20px' : '24px',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                }} onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.35)';
                                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.15)';
                                                }} onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.15)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontSize: '1.1rem' }}>&#127482;&#127480;</span> NVIDIA
                                                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>NVDA</span>
                                                            </p>
                                                        </div>
                                                        <p style={{
                                                            margin: 0,
                                                            fontSize: isMobile ? '1.3rem' : '1.5rem',
                                                            fontWeight: 800,
                                                            color: '#60a5fa',
                                                            textShadow: '0 0 20px rgba(96, 165, 250, 0.3)',
                                                        }}>
                                                            {formatUsd(spotlightData.nvda[spotlightData.nvda.length - 1]?.revenue)}
                                                        </p>
                                                    </div>
                                                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, margin: '6px 0 14px 0' }}>
                                                        {t('home.spotlightNvdaHook')}
                                                    </p>
                                                    <ResponsiveContainer width="100%" height={isMobile ? 130 : 150}>
                                                        <BarChart data={spotlightData.nvda} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="spotNvdaNormal" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                                </linearGradient>
                                                                <linearGradient id="spotNvdaLatest" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="label" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                                                            <YAxis hide />
                                                            <Bar dataKey="revenue" radius={[4, 4, 0, 0]} animationDuration={1200}>
                                                                {spotlightData.nvda.map((_, index) => (
                                                                    <Cell
                                                                        key={index}
                                                                        fill={index === spotlightData.nvda.length - 1 ? 'url(#spotNvdaLatest)' : 'url(#spotNvdaNormal)'}
                                                                    />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                    <p style={{
                                                        margin: '12px 0 0 0',
                                                        fontSize: '0.78rem',
                                                        fontWeight: 600,
                                                        color: '#60a5fa',
                                                    }}>
                                                        {t('home.spotlightViewAnalysis')}
                                                    </p>
                                                </div>
                                            </Link>
                                        )}

                                        {/* SK Hynix Card */}
                                        {spotlightData.skHynix && (
                                            <Link to="/stocks/000660" style={{ textDecoration: 'none' }}>
                                                <div style={{
                                                    background: 'rgba(30, 41, 59, 0.5)',
                                                    border: '1px solid rgba(16, 185, 129, 0.15)',
                                                    borderRadius: '16px',
                                                    padding: isMobile ? '20px' : '24px',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                }} onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)';
                                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.15)';
                                                }} onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.15)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontSize: '1.1rem' }}>&#127472;&#127479;</span> SK{i18n.language === 'ko' ? '하이닉스' : ' Hynix'}
                                                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>000660</span>
                                                            </p>
                                                        </div>
                                                        <p style={{
                                                            margin: 0,
                                                            fontSize: isMobile ? '1.3rem' : '1.5rem',
                                                            fontWeight: 800,
                                                            color: '#34d399',
                                                            textShadow: '0 0 20px rgba(52, 211, 153, 0.3)',
                                                        }}>
                                                            {formatKrw(spotlightData.skHynix[spotlightData.skHynix.length - 1]?.revenue, i18n.language)}
                                                        </p>
                                                    </div>
                                                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, margin: '6px 0 14px 0' }}>
                                                        {t('home.spotlightSkHynixHook')}
                                                    </p>
                                                    <ResponsiveContainer width="100%" height={isMobile ? 130 : 150}>
                                                        <BarChart data={spotlightData.skHynix} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="spotSkNormal" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                                                                </linearGradient>
                                                                <linearGradient id="spotSkLatest" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="label" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                                                            <YAxis hide />
                                                            <Bar dataKey="revenue" radius={[4, 4, 0, 0]} animationDuration={1200}>
                                                                {spotlightData.skHynix.map((_, index) => (
                                                                    <Cell
                                                                        key={index}
                                                                        fill={index === spotlightData.skHynix.length - 1 ? 'url(#spotSkLatest)' : 'url(#spotSkNormal)'}
                                                                    />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                    <p style={{
                                                        margin: '12px 0 0 0',
                                                        fontSize: '0.78rem',
                                                        fontWeight: 600,
                                                        color: '#34d399',
                                                    }}>
                                                        {t('home.spotlightViewAnalysis')}
                                                    </p>
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                )}
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
