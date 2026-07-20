import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import { Search, Menu, X, BarChart3, TrendingUp, PieChart, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle, Trophy, Layers, ArrowRightLeft } from 'lucide-react';
import { loadUsCompanyIndex } from '../usDataLoader';
import { loadKrCompanyIndex } from '../krDataLoader';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import LanguageToggle from '../components/LanguageToggle';
import MarketToggle from '../components/MarketToggle';
import ThemeToggle from '../components/ThemeToggle';
import useThemeColors from '../hooks/useThemeColors';

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
    const [spotlightData, setSpotlightData] = useState({ samsung: null, skhynix: null });
    const [spotlightLoading, setSpotlightLoading] = useState(true);
    const [moversData, setMoversData] = useState(null);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const popularStocks = [
        { code: '005930', name: '삼성전자', name_en: 'Samsung Electronics' },
        { code: '000660', name: 'SK하이닉스', name_en: 'SK hynix' },
        { code: '373220', name: 'LG에너지솔루션', name_en: 'LG Energy Solution' },
        { code: '005380', name: '현대자동차', name_en: 'Hyundai Motor' },
        { code: '035420', name: 'NAVER', name_en: 'NAVER' },
        { code: '035720', name: '카카오', name_en: 'Kakao' },
    ];

    const isEn = i18n.language === 'en';

    const usPopularStocks = [
        { ticker: 'AAPL', name: 'Apple Inc.' },
        { ticker: 'NVDA', name: 'NVIDIA CORP' },
        { ticker: 'MSFT', name: 'MICROSOFT CORP' },
        { ticker: 'AMZN', name: 'AMAZON COM INC' },
        { ticker: 'TSLA', name: 'Tesla, Inc.' },
        { ticker: 'META', name: 'Meta Platforms, Inc.' },
    ];

    // Load spotlight data for Samsung Electronics
    useEffect(() => {
        async function loadSpotlightData() {
            try {
                const [samsungRaw, hynixRaw] = await Promise.all([
                    fetch('/data/kr_stocks/005930.json').then(r => r.json()),
                    fetch('/data/kr_stocks/000660.json').then(r => r.json()),
                ]);

                const toQuarters = raw => (raw?.quarterly || [])
                    .sort((a, b) => a.year - b.year || a.quarter.localeCompare(b.quarter))
                    .slice(-8)
                    .map(e => ({
                        label: `${String(e.year).slice(-2)}.${e.quarter}`,
                        revenue: e.revenue,
                        op_profit: e.op_profit,
                    }));

                setSpotlightData({ samsung: toQuarters(samsungRaw), skhynix: toQuarters(hynixRaw) });
            } catch (err) {
                console.error('Error loading spotlight data:', err);
            } finally {
                setSpotlightLoading(false);
            }
        }
        loadSpotlightData();
        fetch('/data/kr_movers.json').then(r => r.json()).then(setMoversData).catch(() => {});
    }, []);

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

    // Load KR company index for sidebar
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

                            {/* Logo */}
                            <div className="home-logo-header">
                                <h1 className="home-hero-logo">KSTOCKVIEW</h1>
                            </div>

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
                                    color: colors.textMuted,
                                    marginBottom: '24px',
                                }}>
                                    {t('home.spotlightTitle')}
                                </p>

                                {spotlightLoading ? (
                                    <div style={{
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        borderRadius: '16px',
                                        height: '300px',
                                        animation: 'homeHeroFadeIn 1.5s ease-in-out infinite alternate',
                                    }} />
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                        gap: '16px',
                                    }}>
                                        {/* Samsung Electronics Card */}
                                        {spotlightData.samsung && (
                                            <Link to="/stocks/005930" style={{ textDecoration: 'none' }}>
                                                <div style={{
                                                    background: colors.bgCard,
                                                    border: '1px solid rgba(64, 156, 255, 0.25)',
                                                    borderRadius: '8px',
                                                    padding: isMobile ? '22px' : '28px',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                }} onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.borderColor = 'rgba(64, 156, 255, 0.5)';
                                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(64, 156, 255, 0.15)';
                                                }} onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.borderColor = 'rgba(64, 156, 255, 0.25)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontSize: '1.15rem' }}>&#127472;&#127479;</span> {i18n.language === 'ko' ? '삼성전자' : 'Samsung Electronics'}
                                                                <span style={{ fontSize: '0.75rem', color: colors.textMuted, fontWeight: 400 }}>005930</span>
                                                            </p>
                                                            <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: colors.textMuted, fontWeight: 500 }}>
                                                                {i18n.language === 'ko' ? '2026년 1분기 잠정실적' : '2026 Q1 Preliminary Earnings'}
                                                            </p>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <p style={{
                                                                margin: 0,
                                                                fontSize: isMobile ? '1.4rem' : '1.7rem',
                                                                fontWeight: 800,
                                                                color: '#409cff',
                                                                textShadow: '0 0 18px rgba(64, 156, 255, 0.35)',
                                                            }}>
                                                                {formatKrw(spotlightData.samsung[spotlightData.samsung.length - 1]?.revenue, i18n.language)}
                                                            </p>
                                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: colors.textMuted }}>
                                                                {i18n.language === 'ko' ? '영업이익 ' : 'Op. Profit '}
                                                                <span style={{ color: colors.positive, fontWeight: 700 }}>
                                                                    {formatKrw(spotlightData.samsung[spotlightData.samsung.length - 1]?.op_profit, i18n.language)}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p style={{ fontSize: '0.82rem', color: colors.textMuted, lineHeight: 1.5, margin: '12px 0 16px 0' }}>
                                                        {t('home.spotlightSamsungHook')}
                                                    </p>
                                                    <ResponsiveContainer width="100%" height={isMobile ? 150 : 180}>
                                                        <BarChart data={spotlightData.samsung} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="spotSamsungNormal" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#409cff" stopOpacity={0.35} />
                                                                    <stop offset="100%" stopColor="#409cff" stopOpacity={0.05} />
                                                                </linearGradient>
                                                                <linearGradient id="spotSamsungLatest" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#6ab6ff" stopOpacity={1} />
                                                                    <stop offset="100%" stopColor="#409cff" stopOpacity={0.75} />
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="label" stroke={colors.textFaded} fontSize={10} tickLine={false} axisLine={false} />
                                                            <YAxis hide />
                                                            <Bar dataKey="revenue" radius={[2, 2, 0, 0]} animationDuration={1200}>
                                                                {spotlightData.samsung.map((_, index) => (
                                                                    <Cell
                                                                        key={index}
                                                                        fill={index === spotlightData.samsung.length - 1 ? 'url(#spotSamsungLatest)' : 'url(#spotSamsungNormal)'}
                                                                    />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                    <p style={{
                                                        margin: '14px 0 0 0',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 600,
                                                        color: '#409cff',
                                                    }}>
                                                        {t('home.spotlightViewAnalysis')}
                                                    </p>
                                                </div>
                                            </Link>
                                        )}

                                        {/* SK Hynix Card */}
                                        {spotlightData.skhynix && (
                                            <Link to="/stocks/000660" style={{ textDecoration: 'none' }}>
                                                <div style={{
                                                    background: colors.bgCard,
                                                    border: '1px solid rgba(168, 85, 247, 0.25)',
                                                    borderRadius: '8px',
                                                    padding: isMobile ? '22px' : '28px',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                }} onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(168, 85, 247, 0.15)';
                                                }} onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.25)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontSize: '1.15rem' }}>&#127472;&#127479;</span> {i18n.language === 'ko' ? 'SK하이닉스' : 'SK hynix'}
                                                                <span style={{ fontSize: '0.75rem', color: colors.textMuted, fontWeight: 400 }}>000660</span>
                                                            </p>
                                                            <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: colors.textMuted, fontWeight: 500 }}>
                                                                {i18n.language === 'ko' ? '2026년 1분기 실적' : '2026 Q1 Earnings'}
                                                            </p>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <p style={{
                                                                margin: 0,
                                                                fontSize: isMobile ? '1.4rem' : '1.7rem',
                                                                fontWeight: 800,
                                                                color: '#a855f7',
                                                                textShadow: '0 0 18px rgba(168, 85, 247, 0.35)',
                                                            }}>
                                                                {formatKrw(spotlightData.skhynix[spotlightData.skhynix.length - 1]?.revenue, i18n.language)}
                                                            </p>
                                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: colors.textMuted }}>
                                                                {i18n.language === 'ko' ? '영업이익 ' : 'Op. Profit '}
                                                                <span style={{ color: colors.positive, fontWeight: 700 }}>
                                                                    {formatKrw(spotlightData.skhynix[spotlightData.skhynix.length - 1]?.op_profit, i18n.language)}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p style={{ fontSize: '0.82rem', color: colors.textMuted, lineHeight: 1.5, margin: '12px 0 16px 0' }}>
                                                        {t('home.spotlightSkHynixHook')}
                                                    </p>
                                                    <ResponsiveContainer width="100%" height={isMobile ? 150 : 180}>
                                                        <BarChart data={spotlightData.skhynix} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="spotHynixNormal" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.35} />
                                                                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.05} />
                                                                </linearGradient>
                                                                <linearGradient id="spotHynixLatest" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#c084fc" stopOpacity={1} />
                                                                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.75} />
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="label" stroke={colors.textFaded} fontSize={10} tickLine={false} axisLine={false} />
                                                            <YAxis hide />
                                                            <Bar dataKey="revenue" radius={[2, 2, 0, 0]} animationDuration={1200}>
                                                                {spotlightData.skhynix.map((_, index) => (
                                                                    <Cell
                                                                        key={index}
                                                                        fill={index === spotlightData.skhynix.length - 1 ? 'url(#spotHynixLatest)' : 'url(#spotHynixNormal)'}
                                                                    />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                    <p style={{
                                                        margin: '14px 0 0 0',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 600,
                                                        color: '#a855f7',
                                                    }}>
                                                        {t('home.spotlightViewAnalysis')}
                                                    </p>
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </section>

                            {/* Intro / Tagline */}
                            <section className="home-intro">
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
                                            <span className="home-popular-chip-name">{isEn ? stock.name_en : stock.name}</span>
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

                            {/* Market Movers Section — temporarily hidden pending data review */}
                            {false && moversData && (
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
                                        color: colors.textMuted,
                                        marginBottom: '24px',
                                    }}>
                                        {t('movers.title')}
                                    </p>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                                        gap: '16px',
                                    }}>
                                        {[
                                            { key: 'revenue_growth_top', label: t('movers.revenueGrowth'), icon: '🚀', color: colors.positive },
                                            { key: 'op_profit_turnaround', label: t('movers.opTurnaround'), icon: '📈', color: colors.revenue },
                                            { key: 'margin_expansion', label: t('movers.marginExpansion'), icon: '✨', color: colors.gold },
                                            { key: 'revenue_decline_top', label: t('movers.revenueDecliner'), icon: '📉', color: colors.negative },
                                        ].map(cat => {
                                            const items = (moversData[cat.key] || []).slice(0, 3);
                                            if (items.length === 0) return null;
                                            return (
                                                <div key={cat.key} style={{
                                                    background: colors.bgCard,
                                                    border: `1px solid ${colors.border}`,
                                                    borderRadius: '10px',
                                                    padding: '16px',
                                                }}>
                                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: colors.textPrimary, margin: '0 0 10px' }}>
                                                        {cat.icon} {cat.label}
                                                    </p>
                                                    {items.map((item, i) => (
                                                        <Link
                                                            key={item.stock_code}
                                                            to={`/stocks/${item.stock_code}`}
                                                            style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderTop: i > 0 ? `1px solid ${colors.border}` : 'none' }}
                                                        >
                                                            <span style={{ fontSize: '0.8rem', color: colors.textPrimary }}>
                                                                {isEn ? (item.name_en || item.name) : item.name}
                                                            </span>
                                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: cat.color, fontVariantNumeric: 'tabular-nums' }}>
                                                                {item.value > 0 ? '+' : ''}{item.value.toFixed(1)}%
                                                            </span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: colors.textFaded, marginTop: '12px' }}>
                                        {t('movers.lastUpdated', { date: moversData.updated_date })}
                                    </p>
                                </section>
                            )}

                            {/* Global Compare promo banner */}
                            <section style={{
                                maxWidth: '900px',
                                margin: '0 auto 2rem',
                                padding: '0 16px',
                            }}>
                                <Link to="/global-compare" style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(0,71,160,0.12), rgba(200,16,44,0.12))',
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: '14px',
                                        padding: isMobile ? '20px' : '24px 28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                       onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, color: colors.textPrimary }}>
                                                {t('home.globalCompareTitle')}
                                            </p>
                                            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: colors.textMuted }}>
                                                {t('home.globalCompareDesc')}
                                            </p>
                                        </div>
                                        <span style={{
                                            flexShrink: 0,
                                            padding: '8px 18px',
                                            borderRadius: '20px',
                                            background: colors.accent,
                                            color: '#fff',
                                            fontSize: '0.82rem',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {t('home.globalCompareCta')} →
                                        </span>
                                    </div>
                                </Link>
                            </section>

                            {/* Quick Links: Rankings, Sectors, Compare */}
                            <section style={{
                                maxWidth: '900px',
                                margin: '0 auto 3rem',
                                padding: '0 16px',
                            }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                                    gap: '12px',
                                }}>
                                    <Link to="/rankings" style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            background: colors.bgCard,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '10px',
                                            padding: '16px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }} onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = colors.accent;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }} onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = colors.border;
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}>
                                            <Trophy size={22} style={{ color: colors.accent }} />
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary }}>{t('home.rankingsLink')}</p>
                                                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: colors.textMuted }}>{t('home.rankingsLinkDesc')}</p>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link to="/sectors" style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            background: colors.bgCard,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '10px',
                                            padding: '16px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }} onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = colors.accent;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }} onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = colors.border;
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}>
                                            <Layers size={22} style={{ color: colors.accent }} />
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary }}>{t('home.sectorsLink')}</p>
                                                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: colors.textMuted }}>{t('home.sectorsLinkDesc')}</p>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link to="/compare/005930-vs-000660" style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            background: colors.bgCard,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '10px',
                                            padding: '16px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }} onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = colors.accent;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }} onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = colors.border;
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}>
                                            <ArrowRightLeft size={22} style={{ color: colors.accent }} />
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary }}>{t('home.compareLink')}</p>
                                                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: colors.textMuted }}>{t('home.compareLinkDesc')}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
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
