import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Line, ReferenceLine, AreaChart, Area
} from 'recharts';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Menu, X, Info } from 'lucide-react';
import { loadAllFinancialData, loadAllAnnualFinancialData, loadAllEpsData } from './dataLoader';
import { loadUsCompanyIndex } from './usDataLoader';
import NotFound from './pages/NotFound';
import ShareButtons from './components/ShareButtons';
import LanguageToggle from './components/LanguageToggle';
import MarketToggle from './components/MarketToggle';

// Info Tooltip Component
const InfoTooltip = ({ text }) => {
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
                parts.push(<span key={match.index} style={{ color: '#60a5fa', fontWeight: '500' }}>'{match[1]}'</span>);
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

    return (
        <div style={{ position: 'relative', display: 'inline-block', marginLeft: '8px' }}>
            <Info
                size={16}
                style={{
                    color: '#94a3b8',
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
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        padding: '20px 24px',
                        width: '360px',
                        maxWidth: '90vw',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        zIndex: 1000,
                        fontSize: '0.875rem',
                        lineHeight: '1.7',
                        color: '#e2e8f0',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
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
const CustomTooltip = ({ active, payload, label, valueFormatter, yoyKey }) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const yoyChange = payload[0].payload[yoyKey];

        return (
            <div style={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#e2e8f0'
            }}>
                <p style={{ margin: 0, marginBottom: '4px', color: '#94a3b8', fontSize: '12px' }}>{label}</p>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>
                    {valueFormatter(value)}
                </p>
                {yoyChange !== null && yoyChange !== undefined && (
                    <p style={{ margin: 0, marginTop: '4px', fontSize: '12px', color: yoyChange >= 0 ? '#10b981' : '#ef4444' }}>
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

    const [financialRawData, setFinancialRawData] = useState({});
    const [financialAnnualData, setFinancialAnnualData] = useState({});
    const [epsData, setEpsData] = useState({});
    const [marketCapData, setMarketCapData] = useState({});
    const [dataLoading, setDataLoading] = useState(true);
    const [selectedCode, setSelectedCode] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('revenue');  // 초기값: 매출순
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

                const pathname = window.location.pathname;
                const pathCode = pathname.startsWith('/stocks/') ? pathname.slice(8) : '';

                const codes = Object.keys(financial || {});
                if (codes.length > 0) {
                    if (!pathCode || financial[pathCode]) {
                        if (pathCode && financial[pathCode]) {
                            setSelectedCode(pathCode);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setDataLoading(false);
            }
        }

        loadData();
    }, []);

    // Phase 2: Load EPS data in background (visible on page but below fold)
    useEffect(() => {
        if (dataLoading) return;
        loadAllEpsData().then(eps => setEpsData(eps || {})).catch(() => {});
    }, [dataLoading]);

    // Phase 3: Load annual data only when user switches to annual view
    useEffect(() => {
        if (viewMode !== 'annual' || Object.keys(financialAnnualData).length > 0) return;
        loadAllAnnualFinancialData().then(annual => setFinancialAnnualData(annual || {})).catch(() => {});
    }, [viewMode]);

    // Track if we have an invalid stock code
    const [isInvalidCode, setIsInvalidCode] = useState(false);

    // Sync selected code with URL on direct navigation (browser back/forward, direct URL)
    useEffect(() => {
        if (dataLoading) return; // Wait for data to load

        const pathname = location.pathname;
        const pathCode = pathname.startsWith('/stocks/') ? pathname.slice(8) : '';

        if (pathCode && financialRawData[pathCode]) {
            // Valid stock code - update if different
            setIsInvalidCode(false);
            if (pathCode !== selectedCode) {
                isUrlChangeRef.current = true; // Mark this as URL-driven change
                setSelectedCode(pathCode);
            }
        } else if (Object.keys(financialRawData).length > 0 && pathCode) {
            // Invalid stock code - show 404
            setIsInvalidCode(true);
        }
    }, [location.pathname, financialRawData, dataLoading]);

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
            if (pathCode && !financialRawData[pathCode]) {
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
    }, [selectedCode, dataLoading, navigate, location.pathname, isInvalidCode, financialRawData]);

    const companyList = useMemo(() => {
        let list = Object.entries(financialRawData).map(([code, info]) => {
            // Find latest revenue and op_profit for sorting
            const lastEntry = info.history && info.history.length > 0 ? info.history[info.history.length - 1] : null;
            const latestRevenue = lastEntry ? (lastEntry.revenue || 0) : 0;
            const latestOpProfit = lastEntry ? (lastEntry.op_profit || 0) : 0;

            // Get market cap data
            const marketCap = marketCapData[code]?.market_cap || 0;

            return {
                code,
                name: info.name,
                sector: info.sector,
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
            // Sort by revenue descending
            list.sort((a, b) => b.latestRevenue - a.latestRevenue);
        } else if (sortBy === 'op_profit') {
            // Sort by operating profit descending
            list.sort((a, b) => b.latestOpProfit - a.latestOpProfit);
        } else if (sortBy === 'market_cap') {
            // Sort by market cap descending
            list.sort((a, b) => b.marketCap - a.marketCap);
        } else {
            // Sort by code ascending
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
        if (pathCode && Object.keys(financialRawData).length > 0 && !financialRawData[pathCode]) {
            return;
        }

        if (companyList.length > 0 && !selectedCode && !pathCode) {
            setSelectedCode(companyList[0].code);
        }
    }, [companyList, selectedCode, location.pathname, isInvalidCode, financialRawData]);

    const currentCompany = viewMode === 'quarterly' ? financialRawData[selectedCode] : financialAnnualData[selectedCode];

    // Calculate the min/max years for the current company's data
    // Skip years that only have Q4 without Q1-Q3 (since Q4 calculation needs Q1-Q3) for quarterly mode
    const companyDataRange = useMemo(() => {
        if (!currentCompany?.history?.length) return { min: 2015, max: 2025 };

        if (viewMode === 'annual') {
            // For annual mode, just get min/max years
            const years = currentCompany.history.map(h => h.year);
            return { min: Math.min(...years), max: Math.max(...years) };
        }

        // For quarterly mode: Find years that have valid data (not just Q4-only without Q1-Q3)
        const validYears = [];
        const yearGroups = {};

        // Group entries by year
        currentCompany.history.forEach(h => {
            if (!yearGroups[h.year]) yearGroups[h.year] = [];
            yearGroups[h.year].push(h.quarter);
        });

        // Check each year for valid data
        Object.entries(yearGroups).forEach(([year, quarters]) => {
            // Year is valid if it has any quarter other than just 4Q alone
            const has4Q = quarters.includes('4Q');
            const hasOtherQuarters = quarters.some(q => q === '1Q' || q === '2Q' || q === '3Q');

            // Valid if: has Q1/Q2/Q3, or has 4Q with other quarters
            if (hasOtherQuarters || (has4Q && hasOtherQuarters)) {
                validYears.push(parseInt(year));
            } else if (!has4Q) {
                // Has some other quarter data but not 4Q - still valid
                validYears.push(parseInt(year));
            }
            // Skip if only has 4Q without Q1-Q3
        });

        if (validYears.length === 0) return { min: 2015, max: 2025 };
        return { min: Math.min(...validYears), max: Math.max(...validYears) };
    }, [currentCompany, viewMode]);

    // Update yearRange when company or viewMode changes to fit company's data range
    useEffect(() => {
        setYearRange([companyDataRange.min, companyDataRange.max]);
        setIsDefaultRange(true); // Reset to default when company changes
    }, [companyDataRange, viewMode]);

    const chartData = useMemo(() => {
        if (!currentCompany) return [];

        // First, process ALL history data and calculate YoY changes using full dataset
        const fullHistory = currentCompany.history.map(entry => ({
            ...entry,
            revenue_adjusted: entry.revenue || 0,
            op_profit_adjusted: entry.op_profit || 0,
            net_income_adjusted: entry.net_income || 0
        }));

        // Calculate changes using FULL history (before filtering)
        const historyWithChanges = fullHistory.map((entry) => {
            // Convert to 억원 (100,000,000 won) units
            const revenue_eok = entry.revenue_adjusted / 100000000;
            const op_profit_eok = entry.op_profit_adjusted / 100000000;
            const net_income_eok = entry.net_income_adjusted / 100000000;

            let rev_change = null;  // null means no previous data
            let op_change = null;

            if (viewMode === 'annual') {
                // YoY for annual: Find previous year
                const prevYearEntry = fullHistory.find(e => e.year === entry.year - 1);
                if (prevYearEntry) {
                    const prev_rev_eok = prevYearEntry.revenue_adjusted / 100000000;
                    const prev_op_eok = prevYearEntry.op_profit_adjusted / 100000000;
                    rev_change = prev_rev_eok ? parseFloat(((revenue_eok - prev_rev_eok) / Math.abs(prev_rev_eok) * 100).toFixed(1)) : 0;
                    op_change = prev_op_eok ? parseFloat(((op_profit_eok - prev_op_eok) / Math.abs(prev_op_eok) * 100).toFixed(1)) : 0;
                }
            } else {
                // YoY for quarterly: Find same quarter in previous year from FULL history
                const prevYearEntry = fullHistory.find(e => e.year === entry.year - 1 && e.quarter === entry.quarter);
                if (prevYearEntry) {
                    const prev_rev_eok = prevYearEntry.revenue_adjusted / 100000000;
                    const prev_op_eok = prevYearEntry.op_profit_adjusted / 100000000;
                    rev_change = prev_rev_eok ? parseFloat(((revenue_eok - prev_rev_eok) / Math.abs(prev_rev_eok) * 100).toFixed(1)) : 0;
                    op_change = prev_op_eok ? parseFloat(((op_profit_eok - prev_op_eok) / Math.abs(prev_op_eok) * 100).toFixed(1)) : 0;
                }
            }

            return {
                ...entry,
                displayLabel: viewMode === 'annual' ? `${entry.year}` : `${entry.year} ${entry.quarter}`,
                revenue_eok,
                op_profit_eok,
                net_income_eok,
                rev_change,
                op_change,
                op_margin: entry.revenue_adjusted ? parseFloat(((entry.op_profit_adjusted / entry.revenue_adjusted) * 100).toFixed(1)) : 0
            };
        });

        // Now filter by year range AFTER calculating changes
        const filteredHistory = historyWithChanges.filter(entry => entry.year >= yearRange[0] && entry.year <= yearRange[1]);

        return filteredHistory;
    }, [currentCompany, yearRange, viewMode]);

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

    // EPS chart data
    const epsChartData = useMemo(() => {
        const currentEpsData = epsData[selectedCode];
        if (!currentEpsData) return [];

        // First, calculate YoY change using FULL history
        const fullEpsHistory = currentEpsData.history.map((entry) => {
            const eps = entry.eps || 0;

            // Calculate YoY change from FULL history
            let eps_change = null;
            const prevYearEntry = currentEpsData.history.find(e => e.year === entry.year - 1 && e.quarter === entry.quarter);
            if (prevYearEntry && prevYearEntry.eps) {
                eps_change = parseFloat(((eps - prevYearEntry.eps) / Math.abs(prevYearEntry.eps) * 100).toFixed(1));
            }

            return {
                displayLabel: `${entry.year} ${entry.quarter}`,
                eps: eps,
                eps_change: eps_change,
                year: entry.year,
                quarter: entry.quarter
            };
        });

        // Then filter by year range AFTER calculating changes
        const filteredEpsHistory = fullEpsHistory.filter(entry => entry.year >= yearRange[0] && entry.year <= yearRange[1]);

        return filteredEpsHistory;
    }, [epsData, selectedCode, yearRange]);

    // Calculate EPS YoY change domain
    const epsYoyDomain = useMemo(() => {
        const changes = epsChartData.map(d => d.eps_change).filter(v => v !== null);
        return calculateYoyDomain(changes);
    }, [epsChartData]);

    const peerCompanies = useMemo(() => {
        if (!currentCompany?.sector) return [];
        return Object.entries(financialRawData)
            .filter(([code, info]) => info.sector === currentCompany.sector && code !== selectedCode)
            .map(([code, info]) => ({ code, name: info.name }))
            .sort((a, b) => a.code.localeCompare(b.code))
            .slice(0, 15);
    }, [currentCompany, selectedCode]);

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
                    <h2 style={{ color: '#60a5fa', marginBottom: '20px' }}>{t('common.loading')}</h2>
                    <p style={{ color: '#94a3b8' }}>{t('common.loadingWait')}</p>
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
            <Helmet>
                <html lang={i18n.language} />
                <title>{currentCompany?.name ? t('helmet.appTitle', { name: currentCompany.name, code: selectedCode }) : t('helmet.appTitleDefault')}</title>
                <meta name="description" content={currentCompany?.name ? t('helmet.appDesc', { name: currentCompany.name, code: selectedCode }) : t('helmet.appDescDefault')} />
                <meta property="og:title" content={currentCompany?.name ? t('helmet.ogTitle', { name: currentCompany.name, code: selectedCode }) : t('helmet.ogTitleDefault')} />
                <meta property="og:description" content={currentCompany?.name ? t('helmet.ogDesc', { name: currentCompany.name }) : t('helmet.appDescDefault')} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`https://kstockview.com/stocks/${selectedCode || ''}`} />
                <link rel="canonical" href={`https://kstockview.com/stocks/${selectedCode || ''}`} />
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
                                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
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
                        <div className="header-top-row">
                            <div className="company-info">
                                <h1>{currentCompany?.name}</h1>
                                <span className="company-code">{selectedCode}</span>
                                <span className="company-sector">{currentCompany?.sector || t('common.general')}</span>
                                <ShareButtons
                                    companyName={currentCompany?.name || ''}
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
                                        border: viewMode === 'quarterly' ? '2px solid #60a5fa' : '1px solid #475569',
                                        backgroundColor: viewMode === 'quarterly' ? '#1e3a5f' : '#1e293b',
                                        color: viewMode === 'quarterly' ? '#60a5fa' : '#94a3b8',
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
                                        border: viewMode === 'annual' ? '2px solid #60a5fa' : '1px solid #475569',
                                        backgroundColor: viewMode === 'annual' ? '#1e3a5f' : '#1e293b',
                                        color: viewMode === 'annual' ? '#60a5fa' : '#94a3b8',
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
                    </header>

                    <div className="charts-container">
                        {/* Summary Cards */}
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
                        </div>

                        {/* Main Chart: Bar (Revenue) with YoY */}
                        <div className="chart-section">
                            <h3>
                                {t('analysis.revenueYoy', { mode: viewMode === 'annual' ? t('analysis.annual') : t('analysis.quarterly') })}
                                <InfoTooltip text={t('tooltips.revenueExplain')} />
                            </h3>
                            <div className="chart-legend">
                                <span><span className="legend-bar"></span> {t('analysis.revenueLegend')}</span>
                                <span>
                                    <span className="legend-line-dual"><span style={{ background: '#10b981' }}></span><span style={{ background: '#ef4444' }}></span></span> {t('analysis.yoyLegend')}
                                    <InfoTooltip text={t('tooltips.yoyExplain')} />
                                </span>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData} margin={chartMargins}>
                                        <defs>
                                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="displayLabel" stroke="#94a3b8" {...xAxisProps} />
                                        <YAxis
                                            stroke="#94a3b8"
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
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="displayLabel" stroke="#94a3b8" {...xAxisProps} />
                                        <YAxis
                                            stroke="#10b981"
                                            fontSize={9}
                                            tickFormatter={(val) => `${val.toFixed(0)}%`}
                                            domain={revenueYoyDomain.domain}
                                            ticks={revenueYoyDomain.ticks}
                                            width={isMobile ? 50 : 65}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                            formatter={(value) => [`${value}%`, 'YoY']}
                                        />
                                        <ReferenceLine y={0} stroke="#64748b" strokeDasharray="5 5" />
                                        <Line
                                            type="monotone"
                                            dataKey="rev_change"
                                            name="YoY"
                                            stroke="#64748b"
                                            strokeWidth={1.5}
                                            dot={(props) => {
                                                const { cx, cy, payload } = props;
                                                if (payload.rev_change === null) return null;
                                                const color = payload.rev_change >= 0 ? '#10b981' : '#ef4444';
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
                                <InfoTooltip text={t('tooltips.opProfitExplain')} />
                            </h3>
                            <div className="chart-legend">
                                <span><span className="legend-bar" style={{ background: 'rgba(16, 185, 129, 0.6)' }}></span> {t('analysis.opProfitLegend')}</span>
                                <span><span className="legend-line-dual"><span style={{ background: '#3b82f6' }}></span><span style={{ background: '#ef4444' }}></span></span> {t('analysis.yoyLegend')}</span>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData} margin={chartMargins}>
                                        <defs>
                                            <linearGradient id="barGradGreen" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="displayLabel" stroke="#94a3b8" {...xAxisProps} />
                                        <YAxis
                                            stroke="#94a3b8"
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
                                                valueFormatter={(value) => {
                                                    if (Math.abs(value) >= 10000) {
                                                        return `${(value / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${t('currency.joWon')}`;
                                                    }
                                                    return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${t('currency.eokWon')}`;
                                                }}
                                                yoyKey="op_change"
                                            />}
                                        />
                                        <ReferenceLine y={0} stroke="#64748b" />
                                        <Bar dataKey="op_profit_eok" name={t('analysis.opProfitBarName')} fill="url(#barGradGreen)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <ResponsiveContainer width="100%" height={isMobile ? 120 : 180}>
                                    <ComposedChart data={chartData} margin={chartMargins}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="displayLabel" stroke="#94a3b8" {...xAxisProps} />
                                        <YAxis
                                            stroke="#f59e0b"
                                            fontSize={9}
                                            tickFormatter={(val) => `${val.toFixed(0)}%`}
                                            domain={opProfitYoyDomain.domain}
                                            ticks={opProfitYoyDomain.ticks}
                                            width={isMobile ? 50 : 65}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                            formatter={(value) => [`${value}%`, 'YoY']}
                                        />
                                        <ReferenceLine y={0} stroke="#64748b" strokeDasharray="5 5" />
                                        <Line
                                            type="monotone"
                                            dataKey="op_change"
                                            name="YoY"
                                            stroke="#64748b"
                                            strokeWidth={1.5}
                                            dot={(props) => {
                                                const { cx, cy, payload } = props;
                                                if (payload.op_change === null) return null;
                                                const color = payload.op_change >= 0 ? '#3b82f6' : '#ef4444';
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
                                <InfoTooltip text={t('tooltips.opMarginExplain')} />
                            </h3>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={chartData} margin={isMobile ? { top: 10, right: 5, left: -10, bottom: 50 } : { top: 20, right: 10, left: 0, bottom: 60 }}>
                                        <defs>
                                            <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="displayLabel" stroke="#94a3b8" {...xAxisProps} />
                                        <YAxis
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            tickFormatter={(val) => `${Math.round(val)}%`}
                                            domain={['auto', 'auto']}
                                            allowDecimals={false}
                                            scale="linear"
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                            formatter={(value) => [`${value}%`, t('analysis.opMarginTooltip')]}
                                        />
                                        <ReferenceLine y={0} stroke="#64748b" />
                                        <Area type="monotone" dataKey="op_margin" name={t('analysis.opMarginTooltip')} stroke="#8b5cf6" fillOpacity={1} fill="url(#marginGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* EPS Bar Chart with YoY */}
                        {epsChartData.length > 0 && (
                            <div className="chart-section">
                                <h3>
                                    {t('analysis.epsYoy')}
                                    <InfoTooltip text={t('tooltips.epsExplain')} />
                                </h3>
                                <div className="chart-legend">
                                    <span><span className="legend-bar" style={{ background: 'rgba(245, 158, 11, 0.6)' }}></span> {t('analysis.epsLegend')}</span>
                                    <span><span className="legend-line-dual"><span style={{ background: '#10b981' }}></span><span style={{ background: '#ef4444' }}></span></span> {t('analysis.yoyLegend')}</span>
                                </div>
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={epsChartData} margin={chartMargins}>
                                            <defs>
                                                <linearGradient id="barGradOrange" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="displayLabel" stroke="#94a3b8" {...xAxisProps} />
                                            <YAxis
                                                stroke="#94a3b8"
                                                fontSize={11}
                                                tickFormatter={(val) => `${val.toLocaleString()} ${t('currency.won')}`}
                                                domain={isDefaultRange ? [0, 'auto'] : ['auto', 'auto']}
                                                padding={{ top: 20, bottom: 20 }}
                                                width={isMobile ? 50 : 65}
                                            />
                                            <Tooltip
                                                content={<CustomTooltip
                                                    valueFormatter={(value) => `${value.toLocaleString()} ${t('currency.won')}`}
                                                    yoyKey="eps_change"
                                                />}
                                            />
                                            <ReferenceLine y={0} stroke="#64748b" />
                                            <Bar dataKey="eps" name="EPS" fill="url(#barGradOrange)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <ResponsiveContainer width="100%" height={isMobile ? 120 : 180}>
                                        <ComposedChart data={epsChartData} margin={chartMargins}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="displayLabel" stroke="#94a3b8" {...xAxisProps} />
                                            <YAxis
                                                stroke="#10b981"
                                                fontSize={9}
                                                tickFormatter={(val) => `${val.toFixed(0)}%`}
                                                domain={epsYoyDomain.domain}
                                                ticks={epsYoyDomain.ticks}
                                                width={isMobile ? 50 : 65}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                                formatter={(value) => [`${value}%`, 'YoY']}
                                            />
                                            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="5 5" />
                                            <Line
                                                type="monotone"
                                                dataKey="eps_change"
                                                name="YoY"
                                                stroke="#64748b"
                                                strokeWidth={1.5}
                                                dot={(props) => {
                                                    const { cx, cy, payload } = props;
                                                    if (payload.eps_change === null) return null;
                                                    const color = payload.eps_change >= 0 ? '#10b981' : '#ef4444';
                                                    return <circle cx={cx} cy={cy} r={2.5} fill={color} stroke={color} strokeWidth={1} />;
                                                }}
                                            />
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

                            {/* Data Source Notice */}
                            <div style={{
                                marginBottom: '25px',
                                padding: '15px',
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px'
                            }}>
                                <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#cbd5e1' }}>
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
                                backgroundColor: '#0f172a',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                lineHeight: '1.7'
                            }}>
                                <h4 style={{ color: '#ef4444', marginBottom: '12px', fontSize: '0.9rem', fontWeight: '600' }}>
                                    {t('footer.disclaimerTitle')}
                                </h4>
                                <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', color: '#94a3b8' }}>
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
                                        color: '#94a3b8',
                                        textDecoration: 'underline',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#e2e8f0'}
                                    onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                                >
                                    {t('footer.privacyPolicy')}
                                </a>
                                <span style={{ color: '#475569' }}>|</span>
                                <a
                                    href="/terms"
                                    style={{
                                        color: '#94a3b8',
                                        textDecoration: 'underline',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#e2e8f0'}
                                    onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                                >
                                    {t('footer.terms')}
                                </a>
                                <span style={{ color: '#475569' }}>|</span>
                                <a
                                    href="/contact"
                                    style={{
                                        color: '#94a3b8',
                                        textDecoration: 'underline',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#e2e8f0'}
                                    onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                                >
                                    {t('footer.contact')}
                                </a>
                            </div>

                            {/* Copyright */}
                            <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '20px', opacity: 0.8 }}>
                                <p style={{ margin: '5px 0' }}>© 2026 KSTOCKVIEW. All rights reserved.</p>
                            </div>
                        </footer>
                    </div>
                </main>
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
