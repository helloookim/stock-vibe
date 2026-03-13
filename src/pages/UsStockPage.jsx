import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Line, ReferenceLine, AreaChart, Area
} from 'recharts';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Menu, X, Info } from 'lucide-react';
import { loadUsCompanyIndex, loadUsCompanyData, formatUsdCurrency } from '../usDataLoader';
import { loadKrCompanyIndex } from '../krDataLoader';
import NotFound from './NotFound';
import LanguageToggle from '../components/LanguageToggle';
import MarketToggle from '../components/MarketToggle';
import ShareButtons from '../components/ShareButtons';
import ThemeToggle from '../components/ThemeToggle';
import useThemeColors from '../hooks/useThemeColors';

// Info Tooltip Component
const InfoTooltip = ({ text, colors }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const c = colors || {};

    const formatText = (text) => {
        const sentences = text.split(/\.\s+/);
        return sentences.map((sentence, idx) => {
            if (!sentence.trim()) return null;
            const isLast = idx === sentences.length - 1;
            const parts = [];
            let lastIndex = 0;
            const quoteRegex = /'([^']+)'/g;
            let match;
            while ((match = quoteRegex.exec(sentence)) !== null) {
                if (match.index > lastIndex) parts.push(sentence.substring(lastIndex, match.index));
                parts.push(<span key={match.index} style={{ color: '#FF8C00', fontWeight: '500' }}>'{match[1]}'</span>);
                lastIndex = match.index + match[0].length;
            }
            if (lastIndex < sentence.length) parts.push(sentence.substring(lastIndex));
            const content = parts.length > 0 ? parts : sentence.trim();
            return (
                <p key={idx} style={{ margin: '0 0 10px 0', fontWeight: '400' }}>
                    {content}{!isLast && !sentence.endsWith('.') ? '.' : ''}
                </p>
            );
        }).filter(Boolean);
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block', marginLeft: '8px' }}>
            <Info size={16} style={{ color: c.textMuted || '#8888a0', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} />
            {isVisible && (
                <div style={{
                    position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: c.tooltipBg || '#1c1c22', border: `1px solid ${c.tooltipBorder || '#4a4a60'}`, borderRadius: '8px',
                    padding: '20px 24px', width: '360px', maxWidth: '90vw', maxHeight: '80vh',
                    overflow: 'auto', zIndex: 1000, fontFamily: "'Noto Serif KR', 'Noto Serif', Georgia, serif", fontSize: '0.85rem', lineHeight: '1.8',
                    color: c.textPrimary || '#f0f0f5', boxShadow: `0 10px 25px -5px ${c.tooltipShadow || 'rgba(0, 0, 0, 0.5)'}`,
                    pointerEvents: 'none', textAlign: 'left'
                }}>
                    {formatText(text)}
                </div>
            )}
        </div>
    );
};

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label, valueFormatter, yoyKey, colors }) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const yoyChange = payload[0].payload[yoyKey];
        const c = colors || {};
        return (
            <div style={{
                backgroundColor: c.tooltipBg || '#1c1c22', border: `1px solid ${c.tooltipBorder || '#4a4a60'}`,
                borderRadius: '8px', padding: '8px 12px', color: c.textPrimary || '#f0f0f5'
            }}>
                <p style={{ margin: 0, marginBottom: '4px', color: c.textMuted || '#8888a0', fontSize: '12px' }}>{label}</p>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{valueFormatter(value)}</p>
                {yoyChange !== null && yoyChange !== undefined && (
                    <p style={{ margin: 0, marginTop: '4px', fontSize: '12px', color: yoyChange >= 0 ? (c.positive || '#00d084') : (c.negative || '#ff4d4f') }}>
                        YoY: {yoyChange > 0 ? '+' : ''}{yoyChange.toFixed(1)}%
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const UsStockPage = () => {
    const { t, i18n } = useTranslation();
    const isEn = i18n.language === 'en';
    const navigate = useNavigate();
    const location = useLocation();
    const { ticker: urlTicker } = useParams();
    const colors = useThemeColors();

    const [companyIndex, setCompanyIndex] = useState([]);
    const [companyData, setCompanyData] = useState(null);
    const [indexLoading, setIndexLoading] = useState(true);
    const [companyLoading, setCompanyLoading] = useState(false);
    const [selectedTicker, setSelectedTicker] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('rank');
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [sidebarMarket, setSidebarMarket] = useState('us');
    const [krCompanyIndex, setKrCompanyIndex] = useState([]);
    const [krDataLoading, setKrDataLoading] = useState(false);
    const [krSortBy, setKrSortBy] = useState('market_cap');
    const [krSearchTerm, setKrSearchTerm] = useState('');
    const [yearRange, setYearRange] = useState([2015, 2025]);
    const [isDefaultRange, setIsDefaultRange] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [viewMode, setViewMode] = useState('quarterly');
    const [isInvalidTicker, setIsInvalidTicker] = useState(false);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const chartMargins = isMobile
        ? { top: 10, right: 0, left: 5, bottom: 20 }
        : { top: 20, right: 5, left: 35, bottom: 20 };

    const xAxisProps = isMobile
        ? { fontSize: 8, angle: -45, textAnchor: 'end', height: 60 }
        : { fontSize: 10, angle: -45, textAnchor: 'end', height: 70 };

    // Load company index on mount
    useEffect(() => {
        async function loadIndex() {
            setIndexLoading(true);
            try {
                const index = await loadUsCompanyIndex();
                setCompanyIndex(index || []);
            } catch (err) {
                console.error('Error loading US company index:', err);
            } finally {
                setIndexLoading(false);
            }
        }
        loadIndex();
    }, []);

    // Sync ticker from URL
    useEffect(() => {
        if (indexLoading || !urlTicker) return;
        const normalized = urlTicker.toUpperCase();
        const exists = companyIndex.some(c => c.ticker === normalized);
        if (exists) {
            setIsInvalidTicker(false);
            if (normalized !== selectedTicker) {
                setSelectedTicker(normalized);
            }
        } else {
            setIsInvalidTicker(true);
        }
    }, [urlTicker, indexLoading, companyIndex]);

    // Load company data when ticker changes
    useEffect(() => {
        if (!selectedTicker) return;
        async function loadData() {
            setCompanyLoading(true);
            try {
                const data = await loadUsCompanyData(selectedTicker);
                setCompanyData(data);
            } catch (err) {
                console.error('Error loading US company data:', err);
                setCompanyData(null);
            } finally {
                setCompanyLoading(false);
            }
        }
        loadData();
    }, [selectedTicker]);

    // Sync URL when user selects a stock from sidebar
    useEffect(() => {
        if (!selectedTicker || indexLoading) return;
        const pathTicker = location.pathname.startsWith('/us-stocks/')
            ? location.pathname.slice(11).toUpperCase()
            : '';
        if (pathTicker !== selectedTicker) {
            navigate(`/us-stocks/${selectedTicker}`, { replace: true });
        }
    }, [selectedTicker]);

    // Company list for sidebar
    const companyList = useMemo(() => {
        let list = companyIndex.filter(c => {
            const term = searchTerm.toLowerCase();
            return c.ticker.toLowerCase().includes(term) || c.name.toLowerCase().includes(term);
        });

        if (sortBy === 'ticker') {
            list = [...list].sort((a, b) => a.ticker.localeCompare(b.ticker));
        } else if (sortBy === 'name') {
            list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        }
        // 'rank' is default order from index (market cap rank)

        return list;
    }, [companyIndex, searchTerm, sortBy]);

    // Load KR company index when sidebar switches to KR
    useEffect(() => {
        if (sidebarMarket !== 'kr' || krCompanyIndex.length > 0) return;
        async function loadKrData() {
            setKrDataLoading(true);
            try {
                const index = await loadKrCompanyIndex();
                setKrCompanyIndex(index || []);
            } catch (err) {
                console.error('Error loading KR company index:', err);
            } finally {
                setKrDataLoading(false);
            }
        }
        loadKrData();
    }, [sidebarMarket]);

    const krCompanyList = useMemo(() => {
        let list = krCompanyIndex.map(c => ({
            code: c.stock_code,
            name: isEn ? (c.name_en || c.name) : c.name,
            nameKo: c.name,
            nameEn: c.name_en || '',
            latestRevenue: c.last_revenue || 0,
            latestOpProfit: c.last_op_profit || 0,
            rank: c.rank || 99999
        })).filter(c => {
            const term = krSearchTerm.toLowerCase();
            return c.name.toLowerCase().includes(term) || c.code.includes(krSearchTerm) || c.nameKo.toLowerCase().includes(term) || c.nameEn.toLowerCase().includes(term);
        });
        if (krSortBy === 'revenue') list.sort((a, b) => b.latestRevenue - a.latestRevenue);
        else if (krSortBy === 'op_profit') list.sort((a, b) => b.latestOpProfit - a.latestOpProfit);
        else if (krSortBy === 'market_cap') list.sort((a, b) => a.rank - b.rank);
        else list.sort((a, b) => a.code.localeCompare(b.code));
        return list;
    }, [krCompanyIndex, krSearchTerm, krSortBy, isEn]);

    const handleMarketToggle = (market) => {
        setSidebarMarket(market);
        setSearchTerm('');
        setKrSearchTerm('');
        setSortDropdownOpen(false);
    };

    // Chart data
    const currentData = useMemo(() => {
        if (!companyData) return [];
        return viewMode === 'quarterly' ? companyData.quarterlyData : companyData.annualData;
    }, [companyData, viewMode]);

    // Data range for year slider
    const companyDataRange = useMemo(() => {
        if (!currentData || currentData.length === 0) return { min: 2015, max: 2025 };
        const years = currentData.map(d => d.year);
        return { min: Math.min(...years), max: Math.max(...years) };
    }, [currentData]);

    // Update year range when company or viewMode changes
    useEffect(() => {
        setYearRange([Math.max(companyDataRange.min, 2020), companyDataRange.max]);
        setIsDefaultRange(true);
    }, [companyDataRange, viewMode]);

    // Filtered chart data by year range
    const chartData = useMemo(() => {
        if (!currentData) return [];
        return currentData.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]);
    }, [currentData, yearRange]);

    // YoY domain calculators
    const calculateYoyDomain = (changes) => {
        if (changes.length === 0) return { domain: [-10, 10], ticks: [-10, 0, 10] };
        const min = Math.min(...changes);
        const max = Math.max(...changes);
        const maxAbs = Math.max(Math.abs(min), Math.abs(max));
        let tickInterval = maxAbs < 100 ? 10 : 100;
        const lowerBound = Math.floor(min / tickInterval) * tickInterval;
        const upperBound = Math.ceil(max / tickInterval) * tickInterval;
        const ticks = [];
        for (let i = lowerBound; i <= upperBound; i += tickInterval) ticks.push(i);
        if (!ticks.includes(0)) { ticks.push(0); ticks.sort((a, b) => a - b); }
        return { domain: [lowerBound, upperBound], ticks };
    };

    const revenueYoyDomain = useMemo(() => calculateYoyDomain(chartData.map(d => d.rev_change).filter(v => v !== null)), [chartData]);
    const opIncomeYoyDomain = useMemo(() => calculateYoyDomain(chartData.map(d => d.op_change).filter(v => v !== null)), [chartData]);
    const netIncomeYoyDomain = useMemo(() => calculateYoyDomain(chartData.map(d => d.ni_change).filter(v => v !== null)), [chartData]);
    const epsYoyDomain = useMemo(() => calculateYoyDomain(chartData.map(d => d.eps_change).filter(v => v !== null)), [chartData]);

    // USD value axis formatter
    const yAxisFormatter = (val) => {
        const abs = Math.abs(val);
        const sign = val < 0 ? '-' : '';
        if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(1)}T`;
        if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(0)}B`;
        if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(0)}M`;
        return `${sign}$${abs.toFixed(0)}`;
    };

    // Show loading
    if (indexLoading) {
        return (
            <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ color: colors.accent, marginBottom: '20px' }}>{t('common.loading')}</h2>
                    <p style={{ color: colors.textMuted }}>{t('common.loadingWait')}</p>
                </div>
            </div>
        );
    }

    if (isInvalidTicker) return <NotFound />;

    const modeLabel = viewMode === 'annual' ? t('usAnalysis.annual') : t('usAnalysis.quarterly');

    // Helper to render a bar+yoy chart section
    const renderBarYoyChart = ({ title, tooltipText, dataKey, yoyKey, barColor, yoyDomain, legendLabel, barName, yoyDotColors }) => {
        const hasData = chartData.some(d => d[dataKey] != null);
        if (!hasData) {
            return (
                <div className="chart-section">
                    <h3>
                        {title}
                        <InfoTooltip text={tooltipText} colors={colors} />
                    </h3>
                    <div className="chart-placeholder">
                        <div className="chart-placeholder-blur" />
                        <span className="chart-placeholder-label">{t('usAnalysis.dataUnavailable')}</span>
                    </div>
                </div>
            );
        }
        return (
        <div className="chart-section">
            <h3>
                {title}
                <InfoTooltip text={tooltipText} colors={colors} />
            </h3>
            <div className="chart-legend">
                <span><span className="legend-bar" style={{ background: `${barColor}99` }}></span> {legendLabel}</span>
                <span>
                    <span className="legend-line-dual"><span style={{ background: yoyDotColors[0] }}></span><span style={{ background: yoyDotColors[1] }}></span></span> {t('usAnalysis.yoyLegend')}
                </span>
            </div>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} margin={chartMargins}>
                        <defs>
                            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={barColor} stopOpacity={colors.isLight ? 1 : 0.8} />
                                <stop offset="100%" stopColor={barColor} stopOpacity={colors.isLight ? 1 : 0.3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                        <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                        <YAxis stroke={colors.textMuted} fontSize={11} tickFormatter={dataKey === 'eps' ? (v) => `$${v.toFixed(1)}` : yAxisFormatter}
                            domain={isDefaultRange ? [0, 'auto'] : [dataMin => Math.min(dataMin, 0), 'auto']}
                            padding={{ top: 20, bottom: 20 }} width={isMobile ? 55 : 70} />
                        <Tooltip content={<CustomTooltip
                            colors={colors}
                            valueFormatter={(v) => dataKey === 'eps' ? `$${v.toFixed(2)}` : formatUsdCurrency(v)}
                            yoyKey={yoyKey} />} />
                        <ReferenceLine y={0} stroke={colors.chartRef} />
                        <Bar dataKey={dataKey} name={barName} fill={`url(#grad-${dataKey})`} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={isMobile ? 120 : 180}>
                    <ComposedChart data={chartData} margin={chartMargins}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                        <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                        <YAxis stroke={yoyDotColors[0]} fontSize={9} tickFormatter={(v) => `${v.toFixed(0)}%`}
                            domain={yoyDomain.domain} ticks={yoyDomain.ticks} width={isMobile ? 55 : 70} />
                        <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px' }}
                            formatter={(v) => [`${v}%`, 'YoY']} />
                        <ReferenceLine y={0} stroke={colors.chartRef} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey={yoyKey} name="YoY" stroke={colors.chartRef} strokeWidth={1.5}
                            dot={(props) => {
                                const { cx, cy, payload } = props;
                                if (payload[yoyKey] === null) return null;
                                const color = payload[yoyKey] >= 0 ? yoyDotColors[0] : yoyDotColors[1];
                                return <circle cx={cx} cy={cy} r={2.5} fill={color} stroke={color} strokeWidth={1} />;
                            }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
    };

    return (
        <>
            <SEOHead
                title={companyData ? t('usHelmet.appTitle', { name: companyData.name, ticker: selectedTicker }) : 'KStockView - US Stock Analysis'}
                description={companyData ? t('usHelmet.appDesc', { name: companyData.name, ticker: selectedTicker }) : ''}
                canonical={`https://kstockview.com/us-stocks/${selectedTicker}`}
                jsonLd={companyData ? [{
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kstockview.com' },
                        { '@type': 'ListItem', position: 2, name: companyData.name }
                    ]
                }] : []}
            />
            <div className="app-container">
                {/* Mobile Header */}
                <div className="mobile-header">
                    <button className="hamburger-menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <Link to="/" className="mobile-app-title" style={{ textDecoration: 'none', color: 'inherit' }}>KSTOCKVIEW</Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>
                </div>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />}

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
                        {sidebarMarket === 'us' ? (
                            <div className="sort-dropdown-container">
                                <button className="sort-dropdown-btn" onClick={() => setSortDropdownOpen(prev => !prev)}>
                                    <ArrowUpDown size={16} />
                                    <span>
                                        {sortBy === 'rank' ? t('usSidebar.sortByRank') :
                                            sortBy === 'ticker' ? t('usSidebar.sortByTicker') : t('usSidebar.sortByName')}
                                    </span>
                                </button>
                                {sortDropdownOpen && (
                                    <div className="sort-dropdown-menu">
                                        <button className={`sort-option ${sortBy === 'rank' ? 'active' : ''}`}
                                            onClick={() => { setSortBy('rank'); setSortDropdownOpen(false); }}>
                                            {t('usSidebar.sortByRank')}
                                        </button>
                                        <button className={`sort-option ${sortBy === 'ticker' ? 'active' : ''}`}
                                            onClick={() => { setSortBy('ticker'); setSortDropdownOpen(false); }}>
                                            {t('usSidebar.sortByTicker')}
                                        </button>
                                        <button className={`sort-option ${sortBy === 'name' ? 'active' : ''}`}
                                            onClick={() => { setSortBy('name'); setSortDropdownOpen(false); }}>
                                            {t('usSidebar.sortByName')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="sort-dropdown-container">
                                <button className="sort-dropdown-btn" onClick={() => setSortDropdownOpen(prev => !prev)}>
                                    <ArrowUpDown size={16} />
                                    <span>
                                        {krSortBy === 'revenue' ? t('sidebar.sortByRevenue') :
                                            krSortBy === 'op_profit' ? t('sidebar.sortByOpProfit') :
                                                krSortBy === 'market_cap' ? t('sidebar.sortByMarketCap') : t('sidebar.sortByCode')}
                                    </span>
                                </button>
                                {sortDropdownOpen && (
                                    <div className="sort-dropdown-menu">
                                        <button className={`sort-option ${krSortBy === 'revenue' ? 'active' : ''}`}
                                            onClick={() => { setKrSortBy('revenue'); setSortDropdownOpen(false); }}>
                                            {t('sidebar.sortByRevenue')}
                                        </button>
                                        <button className={`sort-option ${krSortBy === 'market_cap' ? 'active' : ''}`}
                                            onClick={() => { setKrSortBy('market_cap'); setSortDropdownOpen(false); }}>
                                            {t('sidebar.sortByMarketCap')}
                                        </button>
                                        <button className={`sort-option ${krSortBy === 'op_profit' ? 'active' : ''}`}
                                            onClick={() => { setKrSortBy('op_profit'); setSortDropdownOpen(false); }}>
                                            {t('sidebar.sortByOpProfit')}
                                        </button>
                                        <button className={`sort-option ${krSortBy === 'code' ? 'active' : ''}`}
                                            onClick={() => { setKrSortBy('code'); setSortDropdownOpen(false); }}>
                                            {t('sidebar.sortByCode')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input type="text"
                            placeholder={sidebarMarket === 'us' ? t('usSidebar.searchPlaceholder') : t('sidebar.searchPlaceholder')}
                            value={sidebarMarket === 'us' ? searchTerm : krSearchTerm}
                            onChange={(e) => sidebarMarket === 'us' ? setSearchTerm(e.target.value) : setKrSearchTerm(e.target.value)} />
                    </div>

                    <div className="ticker-list">
                        {sidebarMarket === 'us' ? (
                            companyList.map((comp) => (
                                <button key={comp.ticker}
                                    onClick={() => {
                                        const chartsContainer = document.querySelector('.charts-container');
                                        if (chartsContainer) chartsContainer.scrollTo({ top: 0, behavior: 'instant' });
                                        setSelectedTicker(comp.ticker);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`ticker-item ${selectedTicker === comp.ticker ? 'active' : ''}`}>
                                    <span className="ticker-code">{comp.ticker}</span>
                                    <span className="ticker-name">{comp.name}</span>
                                </button>
                            ))
                        ) : (
                            krDataLoading ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted }}>
                                    {t('common.loadingSidebar')}
                                </div>
                            ) : (
                                krCompanyList.map((comp) => (
                                    <button key={comp.code}
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            navigate(`/stocks/${comp.code}`);
                                        }}
                                        className="ticker-item">
                                        <span className="ticker-code">{comp.code}</span>
                                        <span className="ticker-name">{comp.name}</span>
                                    </button>
                                ))
                            )
                        )}
                    </div>

                    <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? t('sidebar.openSidebar') : t('sidebar.collapseSidebar')}>
                        {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </aside>

                {/* MAIN CONTENT */}
                <main className="main-content">
                    <header className="main-header">
                      <div className="main-header-inner">
                        <div className="header-top-row">
                            <div className="company-info">
                                <h1>{companyData?.name || selectedTicker}</h1>
                                <span className="company-code">{selectedTicker}</span>
                                <ShareButtons
                                    companyName={companyData?.name || ''}
                                    stockCode={selectedTicker}
                                    url={`https://kstockview.com/us-stocks/${selectedTicker}`}
                                />
                            </div>

                            <div className="view-mode-toggle" style={{ display: 'flex', gap: '6px', marginBottom: '8px', justifyContent: 'center' }}>
                                <button onClick={() => setViewMode('quarterly')} style={{
                                    padding: '6px 16px', borderRadius: '6px',
                                    border: viewMode === 'quarterly' ? `2px solid ${colors.accent}` : `1px solid ${colors.textVeryFaded}`,
                                    backgroundColor: viewMode === 'quarterly' ? colors.accentBg : colors.bgCard,
                                    color: viewMode === 'quarterly' ? colors.accent : colors.textMuted,
                                    cursor: 'pointer', fontSize: '0.85rem',
                                    fontWeight: viewMode === 'quarterly' ? '600' : '400', transition: 'all 0.2s'
                                }}>
                                    {t('usAnalysis.quarterly')}
                                </button>
                                <button onClick={() => setViewMode('annual')} style={{
                                    padding: '6px 16px', borderRadius: '6px',
                                    border: viewMode === 'annual' ? `2px solid ${colors.accent}` : `1px solid ${colors.textVeryFaded}`,
                                    backgroundColor: viewMode === 'annual' ? colors.accentBg : colors.bgCard,
                                    color: viewMode === 'annual' ? colors.accent : colors.textMuted,
                                    cursor: 'pointer', fontSize: '0.85rem',
                                    fontWeight: viewMode === 'annual' ? '600' : '400', transition: 'all 0.2s'
                                }}>
                                    {t('usAnalysis.annual')}
                                </button>
                            </div>
                        </div>

                        <div className="year-slider">
                            <label>{t('common.period')}: {yearRange[0]} - {yearRange[1]}</label>
                            <div className="dual-slider-container">
                                <input type="range" className="slider-track slider-min"
                                    min={companyDataRange.min} max={companyDataRange.max} value={yearRange[0]}
                                    onChange={e => { const val = parseInt(e.target.value); if (val <= yearRange[1]) { setYearRange([val, yearRange[1]]); setIsDefaultRange(false); } }} />
                                <input type="range" className="slider-track slider-max"
                                    min={companyDataRange.min} max={companyDataRange.max} value={yearRange[1]}
                                    onChange={e => { const val = parseInt(e.target.value); if (val >= yearRange[0]) { setYearRange([yearRange[0], val]); setIsDefaultRange(false); } }} />
                            </div>
                        </div>
                      </div>
                    </header>

                    <div className="charts-container">
                        {companyLoading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <p style={{ color: colors.textMuted }}>{t('common.loading')}</p>
                            </div>
                        ) : !companyData || chartData.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <p style={{ color: colors.textMuted }}>{t('usAnalysis.noData')}</p>
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div className="summary-cards">
                                    <div className="summary-card">
                                        <span className="card-label">{t('usAnalysis.latestRevenue')}</span>
                                        {chartData[chartData.length - 1].revenue != null
                                            ? <span className="card-value">{formatUsdCurrency(chartData[chartData.length - 1].revenue)}</span>
                                            : <span className="card-value-placeholder">{t('usAnalysis.dataUnavailable')}</span>}
                                    </div>
                                    <div className="summary-card">
                                        <span className="card-label">{t('usAnalysis.latestOpIncome')}</span>
                                        {chartData[chartData.length - 1].operating_income != null
                                            ? <span className="card-value">{formatUsdCurrency(chartData[chartData.length - 1].operating_income)}</span>
                                            : <span className="card-value-placeholder">{t('usAnalysis.dataUnavailable')}</span>}
                                    </div>
                                    <div className="summary-card">
                                        <span className="card-label">{t('usAnalysis.opMarginLabel')}</span>
                                        {chartData[chartData.length - 1].op_margin != null
                                            ? <span className="card-value">{chartData[chartData.length - 1].op_margin}%</span>
                                            : <span className="card-value-placeholder">{t('usAnalysis.dataUnavailable')}</span>}
                                    </div>
                                    <div className="summary-card">
                                        <span className="card-label">{t('usAnalysis.latestEps')}</span>
                                        {chartData[chartData.length - 1].eps != null
                                            ? <span className="card-value">${chartData[chartData.length - 1].eps.toFixed(2)}</span>
                                            : <span className="card-value-placeholder">{t('usAnalysis.dataUnavailable')}</span>}
                                    </div>
                                </div>

                                {/* Revenue Chart */}
                                {renderBarYoyChart({
                                    title: t('usAnalysis.revenueYoy', { mode: modeLabel }),
                                    tooltipText: t('usTooltips.revenueExplain'),
                                    dataKey: 'revenue', yoyKey: 'rev_change', barColor: colors.revenue,
                                    yoyDomain: revenueYoyDomain, legendLabel: t('usAnalysis.revenueLegend'),
                                    barName: t('usAnalysis.revenueBarName'), yoyDotColors: [colors.positive, colors.negative]
                                })}

                                {/* Operating Income Chart */}
                                {renderBarYoyChart({
                                    title: t('usAnalysis.opIncomeYoy', { mode: modeLabel }),
                                    tooltipText: t('usTooltips.opIncomeExplain'),
                                    dataKey: 'operating_income', yoyKey: 'op_change', barColor: colors.opIncome,
                                    yoyDomain: opIncomeYoyDomain, legendLabel: t('usAnalysis.opIncomeLegend'),
                                    barName: t('usAnalysis.opIncomeBarName'), yoyDotColors: [colors.positive, colors.negative]
                                })}

                                {/* Net Income Chart */}
                                {renderBarYoyChart({
                                    title: t('usAnalysis.netIncomeYoy', { mode: modeLabel }),
                                    tooltipText: t('usTooltips.netIncomeExplain'),
                                    dataKey: 'net_income', yoyKey: 'ni_change', barColor: colors.netIncome,
                                    yoyDomain: netIncomeYoyDomain, legendLabel: t('usAnalysis.netIncomeLegend'),
                                    barName: t('usAnalysis.netIncomeBarName'), yoyDotColors: [colors.positive, colors.negative]
                                })}

                                {/* Operating Margin Chart */}
                                <div className="chart-section profit-margin-chart">
                                    <h3>
                                        {t('usAnalysis.opMarginChart', { mode: modeLabel })}
                                        <InfoTooltip text={t('usTooltips.opMarginExplain')} colors={colors} />
                                    </h3>
                                    {chartData.some(d => d.op_margin != null) ? (
                                        <div className="chart-wrapper">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <AreaChart data={chartData} margin={isMobile ? { top: 10, right: 5, left: -10, bottom: 50 } : { top: 20, right: 10, left: 0, bottom: 60 }}>
                                                    <defs>
                                                        <linearGradient id="usMarginGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={colors.margin} stopOpacity={0.8} />
                                                            <stop offset="95%" stopColor={colors.margin} stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                                    <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                                    <YAxis stroke={colors.textMuted} fontSize={10} tickFormatter={(v) => `${Math.round(v)}%`}
                                                        domain={[dataMin => Math.min(dataMin, 0), 'auto']} allowDecimals={false} scale="linear" />
                                                    <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px' }}
                                                        formatter={(v) => [`${v}%`, t('usAnalysis.opMarginTooltip')]} />
                                                    <ReferenceLine y={0} stroke={colors.chartRef} />
                                                    <Area type="monotone" dataKey="op_margin" name={t('usAnalysis.opMarginTooltip')}
                                                        stroke={colors.margin} fillOpacity={1} fill="url(#usMarginGrad)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="chart-placeholder">
                                            <div className="chart-placeholder-blur" />
                                            <span className="chart-placeholder-label">{t('usAnalysis.dataUnavailable')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* EPS Chart */}
                                {renderBarYoyChart({
                                    title: t('usAnalysis.epsYoy', { mode: modeLabel }),
                                    tooltipText: t('usTooltips.epsExplain'),
                                    dataKey: 'eps', yoyKey: 'eps_change', barColor: colors.gold,
                                    yoyDomain: epsYoyDomain, legendLabel: t('usAnalysis.epsLegend'),
                                    barName: 'EPS', yoyDotColors: [colors.positive, colors.negative]
                                })}


                                {/* Browse Other Stocks - Mobile */}
                                <div className="browse-stocks-mobile" onClick={() => setIsMobileMenuOpen(true)}>
                                    <div className="browse-stocks-icon-wrap">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                    </div>
                                    <div className="browse-stocks-text">
                                        <span className="browse-stocks-title">{t('usAnalysis.browseStocks')}</span>
                                        <span className="browse-stocks-desc">{t('usAnalysis.browseStocksDesc')}</span>
                                    </div>
                                    <div className="browse-stocks-arrow">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Footer */}
                        <footer style={{
                            marginTop: '60px', padding: '30px 20px', borderTop: `1px solid ${colors.footerBorder}`,
                            textAlign: 'center', backgroundColor: colors.footerBg, color: colors.textFaded, fontSize: '0.8rem', lineHeight: '1.6'
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: colors.textPrimary, fontSize: '1.2rem', marginBottom: '8px' }}>KSTOCKVIEW</h3>
                                <p style={{ color: colors.textMuted, fontSize: '0.85rem', margin: 0 }}>{t('usFooter.serviceDesc')}</p>
                            </div>
                            <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: colors.bgCard, border: `1px solid ${colors.footerBorder}`, borderRadius: '8px' }}>
                                <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: colors.textSecondary }}>
                                    {t('usFooter.dataSourceTitle')}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.75rem' }} dangerouslySetInnerHTML={{ __html: t('usFooter.dataSourceText') }} />
                            </div>
                            <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: colors.disclaimerBg, border: `1px solid ${colors.disclaimerBorder}`, borderRadius: '8px', fontSize: '0.75rem', lineHeight: '1.7' }}>
                                <h4 style={{ color: colors.negative, marginBottom: '12px', fontSize: '0.9rem', fontWeight: '600' }}>
                                    {t('usFooter.disclaimerTitle')}
                                </h4>
                                <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', color: colors.textMuted }}>
                                    <p style={{ margin: '0 0 10px 0' }}>
                                        <strong>{t('usFooter.disclaimer1Title')}</strong> <span dangerouslySetInnerHTML={{ __html: t('usFooter.disclaimer1') }} />
                                    </p>
                                    <p style={{ margin: '0 0 10px 0' }}>
                                        <strong>{t('usFooter.disclaimer2Title')}</strong> <span dangerouslySetInnerHTML={{ __html: t('usFooter.disclaimer2') }} />
                                    </p>
                                    <p style={{ margin: 0 }}>
                                        <strong>{t('usFooter.disclaimer3Title')}</strong> {t('usFooter.disclaimer3')}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '20px', fontSize: '0.85rem' }}>
                                <a href="/privacy" style={{ color: colors.textMuted, textDecoration: 'underline', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => e.target.style.color = colors.textPrimary} onMouseLeave={(e) => e.target.style.color = colors.textMuted}>
                                    {t('footer.privacyPolicy')}
                                </a>
                                <span style={{ color: colors.textVeryFaded }}>|</span>
                                <a href="/terms" style={{ color: colors.textMuted, textDecoration: 'underline', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => e.target.style.color = colors.textPrimary} onMouseLeave={(e) => e.target.style.color = colors.textMuted}>
                                    {t('footer.terms')}
                                </a>
                                <span style={{ color: colors.textVeryFaded }}>|</span>
                                <a href="/contact" style={{ color: colors.textMuted, textDecoration: 'underline', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => e.target.style.color = colors.textPrimary} onMouseLeave={(e) => e.target.style.color = colors.textMuted}>
                                    {t('footer.contact')}
                                </a>
                            </div>
                            <div style={{ color: colors.textFaded, fontSize: '0.7rem', marginTop: '20px', opacity: 0.8 }}>
                                <p style={{ margin: '5px 0' }}>© 2026 KSTOCKVIEW. All rights reserved.</p>
                            </div>
                        </footer>
                    </div>
                </main>

                {/* Side Rail Ad */}
                {!isMobile && (
                    <aside className="side-rail">
                        <div className="side-rail-ad">
                            <ins className="adsbygoogle"
                                style={{ display: 'block' }}
                                data-ad-client="ca-pub-9130041681645679"
                                data-ad-slot="side-rail"
                                data-ad-format="vertical"
                                data-full-width-responsive="false"
                            />
                        </div>
                    </aside>
                )}
            </div>
        </>
    );
};

export default UsStockPage;
