import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from './components/SEOHead';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Line, ReferenceLine, AreaChart, Area
} from 'recharts';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Menu, X, Info } from 'lucide-react';
import { loadKrCompanyIndex, loadKrCompanyData, processKrCompanyData } from './krDataLoader';
import { loadUsCompanyIndex } from './usDataLoader';
import NotFound from './pages/NotFound';
import ShareButtons from './components/ShareButtons';
import LanguageToggle from './components/LanguageToggle';
import MarketToggle from './components/MarketToggle';
import ThemeToggle from './components/ThemeToggle';
import useThemeColors from './hooks/useThemeColors';

// Info Tooltip Component
const InfoTooltip = ({ text, colors }) => {
    const [isVisible, setIsVisible] = React.useState(false);

    // Split text by sentences for better readability
    const formatText = (text) => {
        // Split by '. ' or '.' at end of sentence
        const sentences = text.split(/\.\s+/);
        return sentences.map((sentence, idx) => {
            if (!sentence.trim()) return null;
            const isLast = idx === sentences.length - 1;

            // Process sentence to highlight text in quotes
            const parts = [];
            let lastIndex = 0;
            const quoteRegex = /'([^']+)'/g;
            let match;

            while ((match = quoteRegex.exec(sentence)) !== null) {
                // Add text before quote
                if (match.index > lastIndex) {
                    parts.push(sentence.substring(lastIndex, match.index));
                }
                // Add quoted text with emphasis
                parts.push(<span key={match.index} style={{ color: '#FF8C00', fontWeight: '500' }}>'{match[1]}'</span>);
                lastIndex = match.index + match[0].length;
            }

            // Add remaining text
            if (lastIndex < sentence.length) {
                parts.push(sentence.substring(lastIndex));
            }

            // If no quotes found, just use the plain sentence
            const content = parts.length > 0 ? parts : sentence.trim();

            return (
                <p key={idx} style={{ margin: '0 0 10px 0', fontWeight: '400' }}>
                    {content}{!isLast && !sentence.endsWith('.') ? '.' : ''}
                </p>
            );
        }).filter(Boolean);
    };

    const c = colors || {};

    return (
        <div style={{ position: 'relative', display: 'inline-block', marginLeft: '8px' }}>
            <Info
                size={16}
                style={{
                    color: c.textMuted || '#8888a0',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                }}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            />
            {isVisible && (
                <div
                    style={{
                        position: 'fixed',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: c.tooltipBg || '#1c1c22',
                        border: `1px solid ${c.tooltipBorder || '#4a4a60'}`,
                        borderRadius: '8px',
                        padding: '20px 24px',
                        width: '360px',
                        maxWidth: '90vw',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        zIndex: 1000,
                        fontFamily: "'Noto Serif KR', 'Noto Serif', Georgia, serif",
                        fontSize: '0.85rem',
                        lineHeight: '1.8',
                        color: c.textPrimary || '#f0f0f5',
                        boxShadow: `0 10px 25px -5px ${c.tooltipShadow || 'rgba(0, 0, 0, 0.5)'}`,
                        pointerEvents: 'none',
                        textAlign: 'left'
                    }}>
                    {formatText(text)}
                </div>
            )}
        </div>
    );
};

// Custom Tooltip Component for displaying YoY on separate line
const CustomTooltip = ({ active, payload, label, valueFormatter, yoyKey, colors }) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const yoyChange = payload[0].payload[yoyKey];
        const c = colors || {};

        return (
            <div style={{
                backgroundColor: c.tooltipBg || '#1c1c22',
                border: `1px solid ${c.tooltipBorder || '#4a4a60'}`,
                borderRadius: '8px',
                padding: '8px 12px',
                color: c.textPrimary || '#f0f0f5'
            }}>
                <p style={{ margin: 0, marginBottom: '4px', color: c.textMuted || '#8888a0', fontSize: '12px' }}>{label}</p>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>
                    {valueFormatter(value)}
                </p>
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

const App = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const colors = useThemeColors();
    const isEn = i18n.language === 'en';

    const [krCompanyIndex, setKrCompanyIndex] = useState([]);
    const [currentCompanyRaw, setCurrentCompanyRaw] = useState(null);
    const [companyLoading, setCompanyLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [selectedCode, setSelectedCode] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('market_cap');  // 초기값: 시가총액순
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [yearRange, setYearRange] = useState([2015, 2025]);
    const [isDefaultRange, setIsDefaultRange] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [viewMode, setViewMode] = useState('quarterly'); // 'quarterly' or 'annual'
    const [showDonationPopup, setShowDonationPopup] = useState(false);
    const [sidebarMarket, setSidebarMarket] = useState('kr');
    const [usCompanyIndex, setUsCompanyIndex] = useState([]);
    const [usIndexLoading, setUsIndexLoading] = useState(false);
    const [usSortBy, setUsSortBy] = useState('rank');
    const [usSearchTerm, setUsSearchTerm] = useState('');
    const viewedStocksRef = useRef(new Set());

    // Track the source of selectedCode changes to prevent loops
    const isUrlChangeRef = useRef(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Dynamic chart margins based on screen size
    const chartMargins = isMobile
        ? { top: 10, right: 0, left: 5, bottom: 20 }
        : { top: 20, right: 5, left: 35, bottom: 20 };

    // Dynamic X-axis label properties
    const xAxisProps = isMobile
        ? { fontSize: 8, angle: -45, textAnchor: 'end', height: 60 }
        : { fontSize: 10, angle: -45, textAnchor: 'end', height: 70 };

    // Phase 1: Load quarterly data + market cap (essential for initial render)
    // Load lightweight company index for sidebar (~666KB)
    useEffect(() => {
        async function loadData() {
            setDataLoading(true);
            try {
                const index = await loadKrCompanyIndex();
                setKrCompanyIndex(index || []);

                const pathname = window.location.pathname;
                const pathCode = pathname.startsWith('/stocks/') ? pathname.slice(8) : '';

                if (pathCode) {
                    const exists = (index || []).some(c => c.stock_code === pathCode);
                    if (exists) {
                        setSelectedCode(pathCode);
                    }
                }
            } catch (error) {
                console.error('Error loading index:', error);
            } finally {
                setDataLoading(false);
            }
        }
        loadData();
    }, []);

    // Load individual company data on-demand when selectedCode changes
    useEffect(() => {
        if (!selectedCode) return;
        let cancelled = false;
        setCompanyLoading(true);
        loadKrCompanyData(selectedCode).then(data => {
            if (!cancelled) {
                setCurrentCompanyRaw(data);
                setCompanyLoading(false);
            }
        }).catch(() => {
            if (!cancelled) setCompanyLoading(false);
        });
        return () => { cancelled = true; };
    }, [selectedCode]);

    // Track if we have an invalid stock code
    const [isInvalidCode, setIsInvalidCode] = useState(false);

    // Sync selected code with URL on direct navigation (browser back/forward, direct URL)
    useEffect(() => {
        if (dataLoading) return; // Wait for data to load

        const pathname = location.pathname;
        const pathCode = pathname.startsWith('/stocks/') ? pathname.slice(8) : '';

        if (pathCode) {
            const exists = krCompanyIndex.some(c => c.stock_code === pathCode);
            if (exists) {
                setIsInvalidCode(false);
                if (pathCode !== selectedCode) {
                    isUrlChangeRef.current = true;
                    setSelectedCode(pathCode);
                }
            } else if (krCompanyIndex.length > 0) {
                setIsInvalidCode(true);
            }
        }
    }, [location.pathname, krCompanyIndex, dataLoading]);

    // Track unique stock views and show donation popup at 10 unique views (1-day cooldown)
    useEffect(() => {
        if (!selectedCode || dataLoading) return;
        // Only show donation popup to Korean language users
        if (i18n.language !== 'ko') return;
        // Skip if already viewed this stock
        if (viewedStocksRef.current.has(selectedCode)) return;
        viewedStocksRef.current.add(selectedCode);

        // Check 1-day cooldown
        const lastShown = localStorage.getItem('kstockview_donation_shown');
        if (lastShown && Date.now() - parseInt(lastShown, 10) < 24 * 60 * 60 * 1000) return;

        if (viewedStocksRef.current.size >= 10) {
            setShowDonationPopup(true);
            localStorage.setItem('kstockview_donation_shown', String(Date.now()));
        }
    }, [selectedCode]);

    // Sync URL with selected code (only on user selection)
    useEffect(() => {
        // Don't do anything if we have an invalid code
        if (isInvalidCode) return;

        if (!dataLoading && selectedCode) {
            const pathname = location.pathname;
            const pathCode = pathname.startsWith('/stocks/') ? pathname.slice(8) : '';

            // If URL has an invalid code, don't navigate (let 404 show)
            if (pathCode && !krCompanyIndex.some(c => c.stock_code === pathCode)) {
                return;
            }

            // If this change came from URL, don't navigate
            if (isUrlChangeRef.current) {
                isUrlChangeRef.current = false; // Reset the flag
                return;
            }

            // User clicked a stock - update URL if different
            if (pathCode !== selectedCode) {
                navigate(`/stocks/${selectedCode}`, { replace: true });
            }
        }
    }, [selectedCode, dataLoading, navigate, location.pathname, isInvalidCode, krCompanyIndex]);

    const companyList = useMemo(() => {
        let list = krCompanyIndex.map(c => ({
            code: c.stock_code,
            name: isEn ? (c.name_en || c.name) : c.name,
            sector: c.sector,
            latestRevenue: c.last_revenue || 0,
            latestOpProfit: c.last_op_profit || 0,
            rank: c.rank || 9999,
        }))
            .filter(c => {
                const term = searchTerm.toLowerCase();
                const idx = krCompanyIndex.find(i => i.stock_code === c.code);
                return c.name.toLowerCase().includes(term) || c.code.includes(searchTerm) || (idx?.name || '').toLowerCase().includes(term) || (idx?.name_en || '').toLowerCase().includes(term);
            });

        if (sortBy === 'revenue') {
            // Sort by revenue descending
            list.sort((a, b) => b.latestRevenue - a.latestRevenue);
        } else if (sortBy === 'op_profit') {
            // Sort by operating profit descending
            list.sort((a, b) => b.latestOpProfit - a.latestOpProfit);
        } else if (sortBy === 'market_cap') {
            // Sort by market cap rank ascending (rank 1 = largest)
            list.sort((a, b) => a.rank - b.rank);
        } else {
            // Sort by code ascending
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

    const handleMarketToggle = (market) => {
        setSidebarMarket(market);
        setSearchTerm('');
        setUsSearchTerm('');
        setSortDropdownOpen(false);
    };

    useEffect(() => {
        // Don't do anything if we have an invalid code
        if (isInvalidCode) return;

        // Only set default company if no stock code in URL
        const pathname = location.pathname;
        const pathCode = pathname.startsWith('/stocks/') ? pathname.slice(8) : '';

        // If URL has an invalid code, don't set default (let 404 show)
        if (pathCode && krCompanyIndex.length > 0 && !krCompanyIndex.some(c => c.stock_code === pathCode)) {
            return;
        }

        if (companyList.length > 0 && !selectedCode && !pathCode) {
            setSelectedCode(companyList[0].code);
        }
    }, [companyList, selectedCode, location.pathname, isInvalidCode, krCompanyIndex]);

    // Process loaded company data into chart-ready format
    const { quarterlyData: processedQuarterly, annualData: processedAnnual } = useMemo(
        () => processKrCompanyData(currentCompanyRaw),
        [currentCompanyRaw]
    );

    // Build a currentCompany-like object for backward compatibility
    const currentCompany = useMemo(() => {
        if (!currentCompanyRaw) return null;
        const history = viewMode === 'quarterly' ? processedQuarterly : processedAnnual;
        return {
            name: currentCompanyRaw.name,
            name_en: currentCompanyRaw.name_en,
            sector: currentCompanyRaw.sector,
            history,
        };
    }, [currentCompanyRaw, viewMode, processedQuarterly, processedAnnual]);

    const displayName = currentCompany ? (isEn ? (currentCompany.name_en || currentCompany.name) : currentCompany.name) : '';

    const companyDataRange = useMemo(() => {
        const history = viewMode === 'quarterly' ? processedQuarterly : processedAnnual;
        if (!history?.length) return { min: 2015, max: 2025 };

        if (viewMode === 'annual') {
            const years = history.map(h => h.year);
            return { min: Math.min(...years), max: Math.max(...years) };
        }

        const yearGroups = {};
        history.forEach(h => {
            if (!yearGroups[h.year]) yearGroups[h.year] = [];
            yearGroups[h.year].push(h.quarter);
        });

        const validYears = [];
        Object.entries(yearGroups).forEach(([year, quarters]) => {
            const hasOtherQuarters = quarters.some(q => q === '1Q' || q === '2Q' || q === '3Q');
            if (hasOtherQuarters) validYears.push(parseInt(year));
        });

        if (validYears.length === 0) return { min: 2015, max: 2025 };
        return { min: Math.min(...validYears), max: Math.max(...validYears) };
    }, [processedQuarterly, processedAnnual, viewMode]);

    // Update yearRange when company or viewMode changes to fit company's data range
    useEffect(() => {
        const defaultMin = Math.max(companyDataRange.min, 2020);
        setYearRange([defaultMin, companyDataRange.max]);
        setIsDefaultRange(true); // Reset to default when company changes
    }, [companyDataRange, viewMode]);

    const chartData = useMemo(() => {
        if (!currentCompany) return [];

        const history = currentCompany.history;
        // YoY is already calculated in processKrCompanyData, just add 억원 units
        const withEok = history.map(entry => ({
            ...entry,
            revenue_eok: (entry.revenue || 0) / 100000000,
            op_profit_eok: (entry.op_profit || 0) / 100000000,
            net_income_eok: (entry.net_income || 0) / 100000000,
        }));

        return withEok.filter(entry => entry.year >= yearRange[0] && entry.year <= yearRange[1]);
    }, [currentCompany, yearRange]);

    // Calculate YoY change domain with smart ticks (must include 0)
    const calculateYoyDomain = (changes) => {
        if (changes.length === 0) return { domain: [-10, 10], ticks: [-10, 0, 10] };

        const min = Math.min(...changes);
        const max = Math.max(...changes);

        // Calculate appropriate bounds
        const maxAbs = Math.max(Math.abs(min), Math.abs(max));

        // Determine tick interval based on magnitude
        let tickInterval;
        if (maxAbs < 100) {
            // Under 100: use 10s
            tickInterval = 10;
        } else {
            // 100 or more: use 100s
            tickInterval = 100;
        }

        // Round bounds to tick intervals (not necessarily symmetric)
        const lowerBound = Math.floor(min / tickInterval) * tickInterval;
        const upperBound = Math.ceil(max / tickInterval) * tickInterval;

        // Generate ticks from lower to upper, ensuring 0 is included
        const ticks = [];
        for (let i = lowerBound; i <= upperBound; i += tickInterval) {
            ticks.push(i);
        }

        // Ensure 0 is in ticks
        if (!ticks.includes(0)) {
            ticks.push(0);
            ticks.sort((a, b) => a - b);
        }

        return { domain: [lowerBound, upperBound], ticks };
    };

    const revenueYoyDomain = useMemo(() => {
        const changes = chartData.map(d => d.rev_change).filter(v => v !== null);
        return calculateYoyDomain(changes);
    }, [chartData]);

    const opProfitYoyDomain = useMemo(() => {
        const changes = chartData.map(d => d.op_change).filter(v => v !== null);
        return calculateYoyDomain(changes);
    }, [chartData]);

    const netIncomeYoyDomain = useMemo(() => {
        const changes = chartData.map(d => d.ni_change).filter(v => v !== null);
        return calculateYoyDomain(changes);
    }, [chartData]);

    // EPS chart data from processed quarterly data
    const epsChartData = useMemo(() => {
        const epsEntries = processedQuarterly.filter(e => e.eps != null);
        if (epsEntries.length === 0) return [];

        return epsEntries
            .map(entry => ({
                displayLabel: entry.displayLabel,
                eps: entry.eps,
                eps_change: entry.eps_change,
                year: entry.year,
                quarter: entry.quarter,
            }))
            .filter(entry => entry.year >= yearRange[0] && entry.year <= yearRange[1]);
    }, [processedQuarterly, yearRange]);

    // Calculate EPS YoY change domain
    const epsYoyDomain = useMemo(() => {
        const changes = epsChartData.map(d => d.eps_change).filter(v => v !== null);
        return calculateYoyDomain(changes);
    }, [epsChartData]);

    // PER/PBR chart data
    const perPbrData = useMemo(() => {
        const data = viewMode === 'quarterly' ? processedQuarterly : processedAnnual;
        return data
            .filter(entry => (entry.per != null || entry.pbr != null) && entry.year >= yearRange[0] && entry.year <= yearRange[1])
            .map(entry => ({
                displayLabel: entry.displayLabel,
                per: entry.per,
                pbr: entry.pbr,
                year: entry.year,
            }));
    }, [processedQuarterly, processedAnnual, viewMode, yearRange]);

    // Close price chart data (with current price appended)
    const closePriceData = useMemo(() => {
        const data = viewMode === 'quarterly' ? processedQuarterly : processedAnnual;
        const historical = data
            .filter(entry => entry.close_price != null && entry.year >= yearRange[0] && entry.year <= yearRange[1])
            .map(entry => ({
                displayLabel: entry.displayLabel,
                close_price: entry.close_price,
                year: entry.year,
                isCurrent: false,
            }));

        // Append current price as the last data point
        if (currentCompanyRaw?.last_close_price != null) {
            const lastHistorical = historical[historical.length - 1];
            // Only add if different from last historical point
            if (!lastHistorical || lastHistorical.close_price !== currentCompanyRaw.last_close_price) {
                historical.push({
                    displayLabel: t('analysis.currentPrice'),
                    close_price: currentCompanyRaw.last_close_price,
                    year: 9999,
                    isCurrent: true,
                });
            }
        }

        return historical;
    }, [processedQuarterly, processedAnnual, viewMode, yearRange, currentCompanyRaw, t]);

    const bogleData = useMemo(() => {
        const data = viewMode === 'quarterly' ? processedQuarterly : processedAnnual;
        const valid = data
            .filter(e => e.eps != null && e.close_price != null && e.year >= yearRange[0] && e.year <= yearRange[1]);

        if (valid.length < 2) return [];

        const baseEps = valid[0].eps;
        const basePrice = valid[0].close_price;

        if (!baseEps || !basePrice) return [];

        return valid.map(e => ({
            displayLabel: e.displayLabel,
            epsIndex: parseFloat(((e.eps / baseEps) * 100).toFixed(1)),
            priceIndex: parseFloat(((e.close_price / basePrice) * 100).toFixed(1)),
            year: e.year,
        }));
    }, [processedQuarterly, processedAnnual, viewMode, yearRange]);

    const peerCompanies = useMemo(() => {
        if (!currentCompany?.sector) return [];
        return krCompanyIndex
            .filter(c => c.sector === currentCompany.sector && c.stock_code !== selectedCode)
            .map(c => ({ code: c.stock_code, name: isEn ? (c.name_en || c.name) : c.name }))
            .slice(0, 15);
    }, [currentCompany, selectedCode, krCompanyIndex, isEn]);

    const formatCurrency = (val) => {
        if (!val && val !== 0) return t('currency.zeroEok');
        const absoluteVal = Math.abs(val);
        const isEn = i18n.language === 'en';
        if (isEn) {
            // English: show in billions (억 ≈ 0.1B), display as X.XB or X.XT
            if (absoluteVal >= 10000) {
                const t_val = absoluteVal / 10000;
                return `${val < 0 ? '-' : ''}${t_val.toLocaleString(undefined, { maximumFractionDigits: 1 })}T`;
            }
            return `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })}B`;
        }
        if (absoluteVal >= 10000) {
            const jo = Math.floor(absoluteVal / 10000);
            const eok = Math.round(absoluteVal % 10000);
            return `${val < 0 ? '-' : ''}${jo}조 ${eok.toLocaleString()}억`;
        }
        return `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })}억`;
    };

    // Show loading screen while data is loading
    if (dataLoading) {
        return (
            <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ color: colors.accent, marginBottom: '20px' }}>{t('common.loading')}</h2>
                    <p style={{ color: colors.textMuted }}>{t('common.loadingWait')}</p>
                </div>
            </div>
        );
    }

    // Show 404 page for invalid stock codes
    if (isInvalidCode) {
        return <NotFound />;
    }

    return (
        <>
            <SEOHead
                title={displayName ? t('helmet.appTitle', { name: displayName, code: selectedCode }) : t('helmet.appTitleDefault')}
                description={displayName ? t('helmet.appDesc', { name: displayName, code: selectedCode }) : t('helmet.appDescDefault')}
                canonical={`https://kstockview.com/stocks/${selectedCode || ''}`}
                jsonLd={currentCompany ? [{
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kstockview.com' },
                        { '@type': 'ListItem', position: 2, name: displayName }
                    ]
                }] : []}
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
                            <div className="sort-dropdown-container">
                                <button
                                    className="sort-dropdown-btn"
                                    onClick={() => setSortDropdownOpen(prev => !prev)}
                                >
                                    <ArrowUpDown size={16} />
                                    <span>
                                        {sortBy === 'market_cap' ? t('sidebar.sortByMarketCap') :
                                            sortBy === 'revenue' ? t('sidebar.sortByRevenue') :
                                                sortBy === 'op_profit' ? t('sidebar.sortByOpProfit') : t('sidebar.sortByCode')}
                                    </span>
                                </button>
                                {sortDropdownOpen && (
                                    <div className="sort-dropdown-menu">
                                        <button className={`sort-option ${sortBy === 'market_cap' ? 'active' : ''}`}
                                            onClick={() => { setSortBy('market_cap'); setSortDropdownOpen(false); }}>
                                            {t('sidebar.sortByMarketCap')}
                                        </button>
                                        <button className={`sort-option ${sortBy === 'revenue' ? 'active' : ''}`}
                                            onClick={() => { setSortBy('revenue'); setSortDropdownOpen(false); }}>
                                            {t('sidebar.sortByRevenue')}
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
                        ) : (
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
                            companyList.map((comp) => (
                                <button
                                    key={comp.code}
                                    onClick={() => {
                                        const chartsContainer = document.querySelector('.charts-container');
                                        if (chartsContainer) {
                                            chartsContainer.scrollTo({ top: 0, behavior: 'instant' });
                                        }
                                        setSelectedCode(comp.code);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`ticker-item ${selectedCode === comp.code ? 'active' : ''}`}
                                >
                                    <span className="ticker-code">{comp.code}</span>
                                    <span className="ticker-name">{comp.name}</span>
                                </button>
                            ))
                        ) : (
                            usIndexLoading ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted }}>
                                    {t('common.loadingSidebar')}
                                </div>
                            ) : (
                                usCompanyList.map((comp) => (
                                    <button
                                        key={comp.ticker}
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            navigate(`/us-stocks/${comp.ticker}`);
                                        }}
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
                    <header className="main-header">
                      <div className="main-header-inner">
                        <div className="header-top-row">
                            <div className="company-info">
                                <h1>{displayName || currentCompany?.name}</h1>
                                <span className="company-code">{selectedCode}</span>
                                <span className="company-sector">{currentCompany?.sector || t('common.general')}</span>
                                <ShareButtons
                                    companyName={displayName || currentCompany?.name || ''}
                                    stockCode={selectedCode}
                                    url={`https://kstockview.com/stocks/${selectedCode}`}
                                />
                            </div>

                            <div className="view-mode-toggle" style={{
                                display: 'flex',
                                gap: '6px',
                                marginBottom: '8px',
                                justifyContent: 'center'
                            }}>
                                <button
                                    onClick={() => setViewMode('quarterly')}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '6px',
                                        border: viewMode === 'quarterly' ? `2px solid ${colors.accent}` : `1px solid ${colors.textVeryFaded}`,
                                        backgroundColor: viewMode === 'quarterly' ? colors.accentBg : colors.bgCard,
                                        color: viewMode === 'quarterly' ? colors.accent : colors.textMuted,
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: viewMode === 'quarterly' ? '600' : '400',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {t('analysis.quarterly')}
                                </button>
                                <button
                                    onClick={() => setViewMode('annual')}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '6px',
                                        border: viewMode === 'annual' ? `2px solid ${colors.accent}` : `1px solid ${colors.textVeryFaded}`,
                                        backgroundColor: viewMode === 'annual' ? colors.accentBg : colors.bgCard,
                                        color: viewMode === 'annual' ? colors.accent : colors.textMuted,
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: viewMode === 'annual' ? '600' : '400',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {t('analysis.annual')}
                                </button>
                            </div>
                        </div>

                        <div className="year-slider">
                            <label>{t('common.period')}: {yearRange[0]} - {yearRange[1]}</label>
                            <div className="dual-slider-container">
                                <input
                                    type="range"
                                    className="slider-track slider-min"
                                    min={companyDataRange.min}
                                    max={companyDataRange.max}
                                    value={yearRange[0]}
                                    onChange={e => {
                                        const val = parseInt(e.target.value);
                                        if (val <= yearRange[1]) {
                                            setYearRange([val, yearRange[1]]);
                                            setIsDefaultRange(false);
                                        }
                                    }}
                                />
                                <input
                                    type="range"
                                    className="slider-track slider-max"
                                    min={companyDataRange.min}
                                    max={companyDataRange.max}
                                    value={yearRange[1]}
                                    onChange={e => {
                                        const val = parseInt(e.target.value);
                                        if (val >= yearRange[0]) {
                                            setYearRange([yearRange[0], val]);
                                            setIsDefaultRange(false);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                      </div>
                    </header>

                    <div className="charts-container">
                        {/* Summary Cards — Market Overview */}
                        <div style={{ marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: colors.textFaded, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {t('analysis.marketOverview')}
                            </span>
                        </div>
                        <div className="summary-cards">
                            <div className="summary-card">
                                <span className="card-label">
                                    {t('analysis.latestClosePrice')}
                                    {currentCompanyRaw?.last_close_date && (
                                        <span style={{ fontWeight: 400, fontSize: '9px', marginLeft: '4px', opacity: 0.6 }}>
                                            {currentCompanyRaw.last_close_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')}
                                        </span>
                                    )}
                                </span>
                                <span className="card-value">
                                    {currentCompanyRaw?.last_close_price != null
                                        ? `${currentCompanyRaw.last_close_price.toLocaleString()}${t('currency.won')}`
                                        : '-'}
                                </span>
                            </div>
                            <div className="summary-card">
                                <span className="card-label">{t('analysis.latestMktcap')}</span>
                                <span className="card-value">
                                    {currentCompanyRaw?.last_mktcap != null
                                        ? (() => {
                                            const eok = currentCompanyRaw.last_mktcap / 100000000;
                                            return formatCurrency(eok);
                                        })()
                                        : '-'}
                                </span>
                            </div>
                            <div className="summary-card">
                                <span className="card-label">{t('analysis.latestPer')}</span>
                                <span className="card-value">
                                    {currentCompanyRaw?.last_per != null ? `${currentCompanyRaw.last_per.toFixed(1)}x` : '-'}
                                </span>
                            </div>
                            <div className="summary-card">
                                <span className="card-label">{t('analysis.latestPbr')}</span>
                                <span className="card-value">
                                    {currentCompanyRaw?.last_pbr != null ? `${currentCompanyRaw.last_pbr.toFixed(2)}x` : '-'}
                                </span>
                            </div>
                        </div>

                        {/* Summary Cards — Financial Summary */}
                        <div style={{ marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: colors.textFaded, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {t('analysis.financialSummary')}
                            </span>
                        </div>
                        <div className="summary-cards">
                            <div className="summary-card">
                                <span className="card-label">{t('analysis.latestRevenue')}</span>
                                <span className="card-value">
                                    {chartData.length > 0 ? formatCurrency(chartData[chartData.length - 1].revenue_eok) : t('currency.zeroEok')}
                                </span>
                            </div>
                            <div className="summary-card">
                                <span className="card-label">{t('analysis.latestOpProfit')}</span>
                                <span className="card-value">
                                    {chartData.length > 0 ? formatCurrency(chartData[chartData.length - 1].op_profit_eok) : t('currency.zeroEok')}
                                </span>
                            </div>
                            <div className="summary-card">
                                <span className="card-label">{t('analysis.opMarginLabel')}</span>
                                <span className="card-value">
                                    {chartData.length > 0 ? chartData[chartData.length - 1].op_margin : 0}%
                                </span>
                            </div>
                            <div className="summary-card">
                                <span className="card-label">{t('analysis.latestEps')}</span>
                                <span className="card-value">
                                    {(() => {
                                        const lastWithEps = [...(processedQuarterly || [])].reverse().find(e => e.eps != null);
                                        return lastWithEps ? `${lastWithEps.eps.toLocaleString()}${t('currency.won')}` : '-';
                                    })()}
                                </span>
                            </div>
                        </div>

                        {/* Main Chart: Bar (Revenue) with YoY */}
                        <div className="chart-section">
                            <h3>
                                {t('analysis.revenueYoy', { mode: viewMode === 'annual' ? t('analysis.annual') : t('analysis.quarterly') })}
                                <InfoTooltip text={t('tooltips.revenueExplain')} colors={colors} />
                            </h3>
                            <div className="chart-legend">
                                <span><span className="legend-bar"></span> {t('analysis.revenueLegend')}</span>
                                <span>
                                    <span className="legend-line-dual"><span style={{ background: colors.positive }}></span><span style={{ background: colors.negative }}></span></span> {t('analysis.yoyLegend')}
                                    <InfoTooltip text={t('tooltips.yoyExplain')} colors={colors} />
                                </span>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData} margin={chartMargins}>
                                        <defs>
                                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={colors.revenue} stopOpacity={colors.isLight ? 1 : 0.8} />
                                                <stop offset="100%" stopColor={colors.revenue} stopOpacity={colors.isLight ? 1 : 0.3} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                        <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                        <YAxis
                                            stroke={colors.textMuted}
                                            fontSize={11}
                                            tickFormatter={(val) => {
                                                const maxVal = Math.max(...chartData.map(d => d.revenue_eok));
                                                if (maxVal >= 10000) {
                                                    return `${(val / 10000).toFixed(1)}${t('currency.jo')}`;
                                                }
                                                return `${val.toFixed(0)}${t('currency.eok')}`;
                                            }}
                                            domain={[0, 'dataMax']}
                                            padding={{ top: 20, bottom: 0 }}
                                            width={isMobile ? 50 : 65}
                                        />
                                        <Tooltip
                                            content={<CustomTooltip
                                                colors={colors}
                                                valueFormatter={(value) => {
                                                    if (Math.abs(value) >= 10000) {
                                                        return `${(value / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${t('currency.joWon')}`;
                                                    }
                                                    return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${t('currency.eokWon')}`;
                                                }}
                                                yoyKey="rev_change"
                                            />}
                                        />
                                        <Bar dataKey="revenue_eok" name={t('analysis.revenueBarName')} fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <ResponsiveContainer width="100%" height={isMobile ? 120 : 180}>
                                    <ComposedChart data={chartData} margin={chartMargins}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                        <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                        <YAxis
                                            stroke={colors.positive}
                                            fontSize={9}
                                            tickFormatter={(val) => `${val.toFixed(0)}%`}
                                            domain={revenueYoyDomain.domain}
                                            ticks={revenueYoyDomain.ticks}
                                            width={isMobile ? 50 : 65}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px' }}
                                            formatter={(value) => [`${value}%`, 'YoY']}
                                        />
                                        <ReferenceLine y={0} stroke={colors.chartRef} strokeDasharray="5 5" />
                                        <Line
                                            type="monotone"
                                            dataKey="rev_change"
                                            name="YoY"
                                            stroke={colors.chartRef}
                                            strokeWidth={1.5}
                                            dot={(props) => {
                                                const { cx, cy, payload } = props;
                                                if (payload.rev_change === null) return null;
                                                const color = payload.rev_change >= 0 ? colors.positive : colors.negative;
                                                return <circle cx={cx} cy={cy} r={2.5} fill={color} stroke={color} strokeWidth={1} />;
                                            }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Operating Profit Bar Chart with YoY */}
                        <div className="chart-section">
                            <h3>
                                {t('analysis.opProfitYoy', { mode: viewMode === 'annual' ? t('analysis.annual') : t('analysis.quarterly') })}
                                <InfoTooltip text={t('tooltips.opProfitExplain')} colors={colors} />
                            </h3>
                            <div className="chart-legend">
                                <span><span className="legend-bar" style={{ background: 'rgba(0, 208, 132, 0.6)' }}></span> {t('analysis.opProfitLegend')}</span>
                                <span><span className="legend-line-dual"><span style={{ background: colors.positive }}></span><span style={{ background: colors.negative }}></span></span> {t('analysis.yoyLegend')}</span>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData} margin={chartMargins}>
                                        <defs>
                                            <linearGradient id="barGradGreen" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={colors.opIncome} stopOpacity={colors.isLight ? 1 : 0.8} />
                                                <stop offset="100%" stopColor={colors.opIncome} stopOpacity={colors.isLight ? 1 : 0.3} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                        <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                        <YAxis
                                            stroke={colors.textMuted}
                                            fontSize={11}
                                            domain={isDefaultRange ? [0, 'auto'] : [dataMin => Math.min(dataMin, 0), 'auto']}
                                            tickFormatter={(val) => {
                                                const maxVal = Math.max(...chartData.map(d => Math.abs(d.op_profit_eok)));
                                                if (maxVal >= 10000) {
                                                    return `${(val / 10000).toFixed(1)}${t('currency.jo')}`;
                                                }
                                                return `${val.toFixed(0)}${t('currency.eok')}`;
                                            }}
                                            padding={{ top: 20, bottom: 20 }}
                                            width={isMobile ? 50 : 65}
                                        />
                                        <Tooltip
                                            content={<CustomTooltip
                                                colors={colors}
                                                valueFormatter={(value) => {
                                                    if (Math.abs(value) >= 10000) {
                                                        return `${(value / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${t('currency.joWon')}`;
                                                    }
                                                    return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${t('currency.eokWon')}`;
                                                }}
                                                yoyKey="op_change"
                                            />}
                                        />
                                        <ReferenceLine y={0} stroke={colors.chartRef} />
                                        <Bar dataKey="op_profit_eok" name={t('analysis.opProfitBarName')} fill="url(#barGradGreen)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <ResponsiveContainer width="100%" height={isMobile ? 120 : 180}>
                                    <ComposedChart data={chartData} margin={chartMargins}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                        <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                        <YAxis
                                            stroke={colors.positive}
                                            fontSize={9}
                                            tickFormatter={(val) => `${val.toFixed(0)}%`}
                                            domain={opProfitYoyDomain.domain}
                                            ticks={opProfitYoyDomain.ticks}
                                            width={isMobile ? 50 : 65}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px' }}
                                            formatter={(value) => [`${value}%`, 'YoY']}
                                        />
                                        <ReferenceLine y={0} stroke={colors.chartRef} strokeDasharray="5 5" />
                                        <Line
                                            type="monotone"
                                            dataKey="op_change"
                                            name="YoY"
                                            stroke={colors.chartRef}
                                            strokeWidth={1.5}
                                            dot={(props) => {
                                                const { cx, cy, payload } = props;
                                                if (payload.op_change === null) return null;
                                                const color = payload.op_change >= 0 ? colors.positive : colors.negative;
                                                return <circle cx={cx} cy={cy} r={2.5} fill={color} stroke={color} strokeWidth={1} />;
                                            }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Net Income Bar Chart with YoY */}
                        <div className="chart-section">
                            <h3>
                                {t('analysis.netIncomeYoy', { mode: viewMode === 'annual' ? t('analysis.annual') : t('analysis.quarterly') })}
                                <InfoTooltip text={t('tooltips.netIncomeExplain')} colors={colors} />
                            </h3>
                            <div className="chart-legend">
                                <span><span className="legend-bar" style={{ background: `${colors.netIncome}99` }}></span> {t('analysis.netIncomeLegend')}</span>
                                <span><span className="legend-line-dual"><span style={{ background: colors.positive }}></span><span style={{ background: colors.negative }}></span></span> {t('analysis.yoyLegend')}</span>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData} margin={chartMargins}>
                                        <defs>
                                            <linearGradient id="barGradPurple" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={colors.netIncome} stopOpacity={colors.isLight ? 1 : 0.8} />
                                                <stop offset="100%" stopColor={colors.netIncome} stopOpacity={colors.isLight ? 1 : 0.3} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                        <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                        <YAxis
                                            stroke={colors.textMuted}
                                            fontSize={11}
                                            domain={isDefaultRange ? [0, 'auto'] : [dataMin => Math.min(dataMin, 0), 'auto']}
                                            tickFormatter={(val) => {
                                                const maxVal = Math.max(...chartData.map(d => Math.abs(d.net_income_eok)));
                                                if (maxVal >= 10000) {
                                                    return `${(val / 10000).toFixed(1)}${t('currency.jo')}`;
                                                }
                                                return `${val.toFixed(0)}${t('currency.eok')}`;
                                            }}
                                            padding={{ top: 20, bottom: 20 }}
                                            width={isMobile ? 50 : 65}
                                        />
                                        <Tooltip
                                            content={<CustomTooltip
                                                colors={colors}
                                                valueFormatter={(value) => {
                                                    if (Math.abs(value) >= 10000) {
                                                        return `${(value / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${t('currency.joWon')}`;
                                                    }
                                                    return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${t('currency.eokWon')}`;
                                                }}
                                                yoyKey="ni_change"
                                            />}
                                        />
                                        <ReferenceLine y={0} stroke={colors.chartRef} />
                                        <Bar dataKey="net_income_eok" name={t('analysis.netIncomeBarName')} fill="url(#barGradPurple)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <ResponsiveContainer width="100%" height={isMobile ? 120 : 180}>
                                    <ComposedChart data={chartData} margin={chartMargins}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                        <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                        <YAxis
                                            stroke={colors.positive}
                                            fontSize={9}
                                            tickFormatter={(val) => `${val.toFixed(0)}%`}
                                            domain={netIncomeYoyDomain.domain}
                                            ticks={netIncomeYoyDomain.ticks}
                                            width={isMobile ? 50 : 65}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px' }}
                                            formatter={(value) => [`${value}%`, 'YoY']}
                                        />
                                        <ReferenceLine y={0} stroke={colors.chartRef} strokeDasharray="5 5" />
                                        <Line
                                            type="monotone"
                                            dataKey="ni_change"
                                            name="YoY"
                                            stroke={colors.chartRef}
                                            strokeWidth={1.5}
                                            dot={(props) => {
                                                const { cx, cy, payload } = props;
                                                if (payload.ni_change === null) return null;
                                                const color = payload.ni_change >= 0 ? colors.positive : colors.negative;
                                                return <circle cx={cx} cy={cy} r={2.5} fill={color} stroke={color} strokeWidth={1} />;
                                            }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Profit Margin Chart (Full Width) */}
                        <div className="chart-section profit-margin-chart">
                            <h3>
                                {t('analysis.opMarginChart', { mode: viewMode === 'annual' ? t('analysis.annual') : t('analysis.quarterly') })}
                                <InfoTooltip text={t('tooltips.opMarginExplain')} colors={colors} />
                            </h3>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={chartData} margin={isMobile ? { top: 10, right: 5, left: -10, bottom: 50 } : { top: 20, right: 10, left: 0, bottom: 60 }}>
                                        <defs>
                                            <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={colors.margin} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={colors.margin} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                        <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                        <YAxis
                                            stroke={colors.textMuted}
                                            fontSize={10}
                                            tickFormatter={(val) => `${Math.round(val)}%`}
                                            domain={[dataMin => Math.min(dataMin, 0), 'auto']}
                                            allowDecimals={false}
                                            scale="linear"
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px' }}
                                            formatter={(value) => [`${value}%`, t('analysis.opMarginTooltip')]}
                                        />
                                        <ReferenceLine y={0} stroke={colors.chartRef} />
                                        <Area type="monotone" dataKey="op_margin" name={t('analysis.opMarginTooltip')} stroke={colors.margin} fillOpacity={1} fill="url(#marginGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* EPS Bar Chart with YoY */}
                        {epsChartData.length > 0 && (
                            <div className="chart-section">
                                <h3>
                                    {t('analysis.epsYoy')}
                                    <InfoTooltip text={t('tooltips.epsExplain')} colors={colors} />
                                </h3>
                                <div className="chart-legend">
                                    <span><span className="legend-bar" style={{ background: 'rgba(255, 140, 0, 0.6)' }}></span> {t('analysis.epsLegend')}</span>
                                    <span><span className="legend-line-dual"><span style={{ background: colors.positive }}></span><span style={{ background: colors.negative }}></span></span> {t('analysis.yoyLegend')}</span>
                                </div>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={epsChartData} margin={chartMargins}>
                                            <defs>
                                                <linearGradient id="barGradOrange" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={colors.gold} stopOpacity={colors.isLight ? 1 : 0.8} />
                                                    <stop offset="100%" stopColor={colors.gold} stopOpacity={colors.isLight ? 1 : 0.3} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                            <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                            <YAxis
                                                stroke={colors.textMuted}
                                                fontSize={11}
                                                tickFormatter={(val) => `${val.toLocaleString()} ${t('currency.won')}`}
                                                domain={isDefaultRange ? [0, 'auto'] : ['auto', 'auto']}
                                                padding={{ top: 20, bottom: 20 }}
                                                width={isMobile ? 50 : 65}
                                            />
                                            <Tooltip
                                                content={<CustomTooltip
                                                    colors={colors}
                                                    valueFormatter={(value) => `${value.toLocaleString()} ${t('currency.won')}`}
                                                    yoyKey="eps_change"
                                                />}
                                            />
                                            <ReferenceLine y={0} stroke={colors.chartRef} />
                                            <Bar dataKey="eps" name="EPS" fill="url(#barGradOrange)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <ResponsiveContainer width="100%" height={isMobile ? 120 : 180}>
                                        <ComposedChart data={epsChartData} margin={chartMargins}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                            <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                            <YAxis
                                                stroke={colors.positive}
                                                fontSize={9}
                                                tickFormatter={(val) => `${val.toFixed(0)}%`}
                                                domain={epsYoyDomain.domain}
                                                ticks={epsYoyDomain.ticks}
                                                width={isMobile ? 50 : 65}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px' }}
                                                formatter={(value) => [`${value}%`, 'YoY']}
                                            />
                                            <ReferenceLine y={0} stroke={colors.chartRef} strokeDasharray="5 5" />
                                            <Line
                                                type="monotone"
                                                dataKey="eps_change"
                                                name="YoY"
                                                stroke={colors.chartRef}
                                                strokeWidth={1.5}
                                                dot={(props) => {
                                                    const { cx, cy, payload } = props;
                                                    if (payload.eps_change === null) return null;
                                                    const color = payload.eps_change >= 0 ? colors.positive : colors.negative;
                                                    return <circle cx={cx} cy={cy} r={2.5} fill={color} stroke={color} strokeWidth={1} />;
                                                }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Close Price Chart */}
                        {closePriceData.length > 0 && (
                            <div className="chart-section">
                                <h3>
                                    {t('analysis.closePriceChart', { mode: viewMode === 'annual' ? t('analysis.annual') : t('analysis.quarterly') })}
                                    <InfoTooltip text={t('tooltips.closePriceExplain')} colors={colors} />
                                </h3>
                                <div className="chart-legend">
                                    <span><span className="legend-bar" style={{ background: colors.closePrice }}></span> {t('analysis.closePriceLegend')}</span>
                                </div>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={closePriceData} margin={chartMargins}>
                                            <defs>
                                                <linearGradient id="closePriceGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={colors.closePrice} stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor={colors.closePrice} stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                            <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                            <YAxis
                                                stroke={colors.textMuted}
                                                fontSize={11}
                                                tickFormatter={(val) => `${val.toLocaleString()}`}
                                                domain={['auto', 'auto']}
                                                padding={{ top: 20, bottom: 20 }}
                                                width={isMobile ? 55 : 70}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px' }}
                                                formatter={(value, name, props) => {
                                                    const label = props?.payload?.isCurrent ? t('analysis.currentPrice') : t('analysis.closePrice');
                                                    return [`${value.toLocaleString()} ${t('currency.won')}`, label];
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="close_price"
                                                name={t('analysis.closePrice')}
                                                stroke={colors.closePrice}
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#closePriceGrad)"
                                                dot={(dotProps) => {
                                                    const { cx, cy, payload } = dotProps;
                                                    if (payload.isCurrent) {
                                                        return (
                                                            <g key="current-dot">
                                                                <circle cx={cx} cy={cy} r={6} fill={colors.accent} stroke={colors.bgCard} strokeWidth={2} />
                                                                <circle cx={cx} cy={cy} r={3} fill="#fff" />
                                                            </g>
                                                        );
                                                    }
                                                    return <circle cx={cx} cy={cy} r={2} fill={colors.closePrice} strokeWidth={0} />;
                                                }}
                                                activeDot={{ r: 4, fill: colors.closePrice, strokeWidth: 2, stroke: colors.bgCard }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* EPS vs Price Growth (Bogle) Chart */}
                        {bogleData.length > 0 && (
                            <div className="chart-section">
                                <h3>
                                    {t('analysis.bogleChart', { mode: viewMode === 'annual' ? t('analysis.annual') : t('analysis.quarterly') })}
                                    <InfoTooltip text={t('tooltips.bogleExplain')} colors={colors} />
                                </h3>
                                <div className="chart-legend">
                                    <span><span className="legend-bar" style={{ background: colors.revenue }}></span> {t('analysis.epsGrowthLegend')}</span>
                                    <span><span className="legend-bar" style={{ background: colors.accent }}></span> {t('analysis.priceGrowthLegend')}</span>
                                </div>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart data={bogleData} margin={chartMargins}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                            <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                            <YAxis
                                                stroke={colors.textMuted}
                                                fontSize={11}
                                                domain={['auto', 'auto']}
                                                padding={{ top: 20, bottom: 20 }}
                                                width={isMobile ? 45 : 55}
                                            />
                                            <ReferenceLine y={100} stroke={colors.chartRef} strokeDasharray="4 4" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px' }}
                                                formatter={(value, name) => {
                                                    const label = name === 'epsIndex' ? t('analysis.epsGrowthLegend') : t('analysis.priceGrowthLegend');
                                                    return [value, label];
                                                }}
                                            />
                                            <Line type="monotone" dataKey="epsIndex" name="epsIndex" stroke={colors.revenue} strokeWidth={2.5} dot={{ r: 3, fill: colors.revenue }} />
                                            <Line type="monotone" dataKey="priceIndex" name="priceIndex" stroke={colors.accent} strokeWidth={2.5} dot={{ r: 3, fill: colors.accent }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* PER / PBR Chart */}
                        {perPbrData.length > 0 && (
                            <div className="chart-section">
                                <h3>
                                    {t('analysis.perPbrChart', { mode: viewMode === 'annual' ? t('analysis.annual') : t('analysis.quarterly') })}
                                    <InfoTooltip text={t('tooltips.perExplain')} colors={colors} />
                                </h3>
                                <div className="chart-legend">
                                    <span><span className="legend-bar" style={{ background: colors.per }}></span> PER</span>
                                    <span><span className="legend-bar" style={{ background: colors.pbr }}></span> PBR</span>
                                </div>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart data={perPbrData} margin={chartMargins}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                                            <XAxis dataKey="displayLabel" stroke={colors.textMuted} {...xAxisProps} />
                                            <YAxis
                                                yAxisId="per"
                                                stroke={colors.per}
                                                fontSize={11}
                                                tickFormatter={(val) => `${val}x`}
                                                domain={[0, 'auto']}
                                                padding={{ top: 20 }}
                                                width={isMobile ? 45 : 55}
                                            />
                                            <YAxis
                                                yAxisId="pbr"
                                                orientation="right"
                                                stroke={colors.pbr}
                                                fontSize={11}
                                                tickFormatter={(val) => `${val}x`}
                                                domain={[0, 'auto']}
                                                padding={{ top: 20 }}
                                                width={isMobile ? 45 : 55}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px' }}
                                                formatter={(value, name) => [`${value}x`, name]}
                                            />
                                            <Bar yAxisId="per" dataKey="per" name="PER" fill={colors.per} radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                                            <Line yAxisId="pbr" type="monotone" dataKey="pbr" name="PBR" stroke={colors.pbr} strokeWidth={2.5} dot={{ r: 3, fill: colors.pbr }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Browse Other Stocks - Mobile Only */}
                        <div className="browse-stocks-mobile" onClick={() => setIsMobileMenuOpen(true)}>
                            <div className="browse-stocks-icon-wrap">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                            </div>
                            <div className="browse-stocks-text">
                                <span className="browse-stocks-title">{t('analysis.browseStocks')}</span>
                                <span className="browse-stocks-desc">{t('analysis.browseStocksDesc')}</span>
                            </div>
                            <div className="browse-stocks-arrow">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"/>
                                </svg>
                            </div>
                        </div>

                        {/* Peer Companies Section */}
                        <div className="peers-section">
                            <h3>{t('analysis.peers')}</h3>
                            <div className="peers-list">
                                {peerCompanies.map(peer => (
                                    <button
                                        key={peer.code}
                                        onClick={() => {
                                            // Scroll the charts-container to top (not window!)
                                            const chartsContainer = document.querySelector('.charts-container');
                                            if (chartsContainer) {
                                                chartsContainer.scrollTo({ top: 0, behavior: 'instant' });
                                            }
                                            setSearchTerm(''); // Clear search to ensure company is in list
                                            setSelectedCode(peer.code);
                                            setIsMobileMenuOpen(false); // Close mobile menu
                                        }}
                                        className="peer-item"
                                    >
                                        <span className="peer-code">{peer.code}</span>
                                        <span className="peer-name">{peer.name}</span>
                                    </button>
                                ))}
                                {peerCompanies.length === 0 && <span className="no-peers">{t('analysis.noPeers')}</span>}
                            </div>
                        </div>

                        {/* Footer with Legal Notice */}
                        <footer style={{
                            marginTop: '60px',
                            padding: '30px 20px',
                            borderTop: `1px solid ${colors.footerBorder}`,
                            textAlign: 'center',
                            backgroundColor: colors.footerBg,
                            color: colors.textFaded,
                            fontSize: '0.8rem',
                            lineHeight: '1.6'
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: colors.textPrimary, fontSize: '1.2rem', marginBottom: '8px' }}>KSTOCKVIEW</h3>
                                <p style={{ color: colors.textMuted, fontSize: '0.85rem', margin: 0 }}>{t('footer.serviceDesc')}</p>
                            </div>

                            {/* Data Source Notice */}
                            <div style={{
                                marginBottom: '25px',
                                padding: '15px',
                                backgroundColor: colors.bgCard,
                                border: `1px solid ${colors.footerBorder}`,
                                borderRadius: '8px'
                            }}>
                                <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: colors.textSecondary }}>
                                    {t('footer.dataSourceTitle')}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.75rem' }} dangerouslySetInnerHTML={{ __html: t('footer.dataSourceText') }} />
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem' }}>
                                    {t('footer.dataSourceEn')}
                                </p>
                            </div>

                            {/* Disclaimer */}
                            <div style={{
                                marginBottom: '25px',
                                padding: '20px',
                                backgroundColor: colors.disclaimerBg,
                                border: `1px solid ${colors.disclaimerBorder}`,
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                lineHeight: '1.7'
                            }}>
                                <h4 style={{ color: colors.negative, marginBottom: '12px', fontSize: '0.9rem', fontWeight: '600' }}>
                                    {t('footer.disclaimerTitle')}
                                </h4>
                                <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', color: colors.textMuted }}>
                                    <p style={{ margin: '0 0 10px 0' }}>
                                        <strong>{t('footer.disclaimer1Title')}</strong> <span dangerouslySetInnerHTML={{ __html: t('footer.disclaimer1') }} />
                                    </p>
                                    <p style={{ margin: '0 0 10px 0' }}>
                                        <strong>{t('footer.disclaimer2Title')}</strong> <span dangerouslySetInnerHTML={{ __html: t('footer.disclaimer2') }} />
                                    </p>
                                    <p style={{ margin: '0 0 10px 0' }}>
                                        <strong>{t('footer.disclaimer3Title')}</strong> <span dangerouslySetInnerHTML={{ __html: t('footer.disclaimer3') }} />
                                    </p>
                                    <p style={{ margin: 0 }}>
                                        <strong>{t('footer.disclaimer4Title')}</strong> {t('footer.disclaimer4')}
                                    </p>
                                </div>
                            </div>

                            {/* Links */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '20px',
                                flexWrap: 'wrap',
                                marginBottom: '20px',
                                fontSize: '0.85rem'
                            }}>
                                <a
                                    href="/privacy"
                                    style={{
                                        color: colors.textMuted,
                                        textDecoration: 'underline',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = colors.textPrimary}
                                    onMouseLeave={(e) => e.target.style.color = colors.textMuted}
                                >
                                    {t('footer.privacyPolicy')}
                                </a>
                                <span style={{ color: colors.textVeryFaded }}>|</span>
                                <a
                                    href="/terms"
                                    style={{
                                        color: colors.textMuted,
                                        textDecoration: 'underline',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = colors.textPrimary}
                                    onMouseLeave={(e) => e.target.style.color = colors.textMuted}
                                >
                                    {t('footer.terms')}
                                </a>
                                <span style={{ color: colors.textVeryFaded }}>|</span>
                                <a
                                    href="/contact"
                                    style={{
                                        color: colors.textMuted,
                                        textDecoration: 'underline',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = colors.textPrimary}
                                    onMouseLeave={(e) => e.target.style.color = colors.textMuted}
                                >
                                    {t('footer.contact')}
                                </a>
                            </div>

                            {/* Copyright */}
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

            {/* Donation Popup Modal */}
            {showDonationPopup && (
                <div className="donation-overlay">
                    <div className="donation-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="donation-glow" />
                        <button className="donation-close" onClick={() => setShowDonationPopup(false)}>
                            <X size={18} />
                        </button>

                        <div className="donation-header">
                            <div className="donation-emoji">☕</div>
                            <span className="donation-badge">{t('donation.badge')}</span>
                            <h2 className="donation-title">{t('donation.headline')}</h2>
                            <p className="donation-subtitle">{t('donation.subtitle')}</p>
                        </div>

                        <div className="donation-divider" />

                        <div className="donation-body">
                            <p>{t('donation.body1')}</p>
                            <p>{t('donation.body2')}</p>
                        </div>

                        <div className="donation-qr-section">
                            <div className="donation-qr-card">
                                <img src="/kakaopay_QR.png" alt="KakaoPay QR" />
                                <span className="donation-qr-label">KakaoPay</span>
                            </div>
                            <p className="donation-cta">{t('donation.cta')}</p>
                        </div>

                        <a
                            href="https://qr.kakaopay.com/FILRgbaC9"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="donation-link"
                        >
                            {t('donation.linkText')}
                        </a>

                        <button className="donation-dismiss" onClick={() => setShowDonationPopup(false)}>
                            {t('donation.dismiss')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default App;
