import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Line, ReferenceLine, AreaChart, Area
} from 'recharts';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Menu, X, Info } from 'lucide-react';
import { loadAllFinancialData, epsDataLoader } from './dataLoader';

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
    const [showPolicyModal, setShowPolicyModal] = useState(null); // 'privacy', 'terms', 'contact', null
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [yearRange, setYearRange] = useState([2015, 2025]);
    const [isDefaultRange, setIsDefaultRange] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [viewMode, setViewMode] = useState('quarterly'); // 'quarterly' or 'annual'

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

    // Load all data on mount
    useEffect(() => {
        async function loadData() {
            setDataLoading(true);
            try {
                const [financial, annual, eps, marketCap] = await Promise.all([
                    loadAllFinancialData(),  // Loads and merges consolidated + separate
                    fetch('/financial_data_annual.json').then(r => r.json()),
                    epsDataLoader.loadAll(),
                    fetch('/market_cap_data.json').then(r => r.json())
                ]);

                setFinancialRawData(financial || {});
                setFinancialAnnualData(annual || {});
                setEpsData(eps || {});
                setMarketCapData(marketCap || {});

                // Set initial selected code to top revenue company
                const codes = Object.keys(financial || {});
                if (codes.length > 0) {
                    // Sort by latest revenue to get top company
                    const sortedByRevenue = codes.sort((a, b) => {
                        const aLast = financial[a]?.history?.[financial[a].history.length - 1];
                        const bLast = financial[b]?.history?.[financial[b].history.length - 1];
                        const aRev = aLast?.revenue || 0;
                        const bRev = bLast?.revenue || 0;
                        return bRev - aRev;
                    });
                    setSelectedCode(sortedByRevenue[0]);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setDataLoading(false);
            }
        }

        loadData();
    }, []);

    // Sync selected code with URL on direct navigation (browser back/forward, direct URL)
    useEffect(() => {
        if (dataLoading) return; // Wait for data to load

        const pathCode = location.pathname.slice(1) || '005930'; // Default to Samsung

        if (pathCode && financialRawData[pathCode]) {
            // Only update if different
            if (pathCode !== selectedCode) {
                isUrlChangeRef.current = true; // Mark this as URL-driven change
                setSelectedCode(pathCode);
            }
        } else if (Object.keys(financialRawData).length > 0) {
            // Invalid code, redirect to default
            navigate('/005930', { replace: true });
        }
    }, [location.pathname, financialRawData, dataLoading]);

    // Sync URL with selected code (only on user selection)
    useEffect(() => {
        if (!dataLoading && selectedCode) {
            const pathCode = location.pathname.slice(1);

            // If this change came from URL, don't navigate
            if (isUrlChangeRef.current) {
                isUrlChangeRef.current = false; // Reset the flag
                return;
            }

            // User clicked a stock - update URL if different
            if (pathCode !== selectedCode) {
                navigate(`/${selectedCode}`, { replace: true });
            }
        }
    }, [selectedCode, dataLoading, navigate, location.pathname]);

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

    useEffect(() => {
        if (companyList.length > 0 && !companyList.find(c => c.code === selectedCode)) {
            setSelectedCode(companyList[0].code);
        }
    }, [companyList, selectedCode]);

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

    const formatKoreanCurrency = (val) => {
        if (!val && val !== 0) return '0억';
        const absoluteVal = Math.abs(val);
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
                    <h2 style={{ color: '#60a5fa', marginBottom: '20px' }}>데이터 로딩 중...</h2>
                    <p style={{ color: '#94a3b8' }}>잠시만 기다려주세요</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{currentCompany?.name ? `${currentCompany.name} (${selectedCode}) - 재무 데이터 | KStockView` : 'KStockView - 한국 주식 재무 시각화'}</title>
                <meta name="description" content={currentCompany?.name ? `${currentCompany.name}의 분기별/연간 재무 데이터, 매출액, 영업이익, 영업이익률 등을 시각화하여 제공합니다.` : '한국 상장 기업의 재무 데이터를 시각화하여 제공합니다.'} />
                <meta property="og:title" content={currentCompany?.name ? `${currentCompany.name} (${selectedCode}) - 재무 데이터 | KStockView` : 'KStockView'} />
                <meta property="og:description" content={currentCompany?.name ? `${currentCompany.name}의 분기별/연간 재무 데이터를 그래프로 확인하세요.` : '한국 상장 기업의 재무 데이터를 시각화하여 제공합니다.'} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`https://kstockview.com/${selectedCode || ''}`} />
                <link rel="canonical" href={`https://kstockview.com/${selectedCode || ''}`} />
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
                <h1 className="mobile-app-title">KSTOCKVIEW</h1>
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
                    <h1 className="app-title">KSTOCKVIEW</h1>
                    <div className="sort-dropdown-container">
                        <button
                            className="sort-dropdown-btn"
                            onClick={() => setSortDropdownOpen(prev => !prev)}
                        >
                            <ArrowUpDown size={16} />
                            <span>
                                {sortBy === 'revenue' ? '매출순' :
                                    sortBy === 'op_profit' ? '영업이익순' :
                                    sortBy === 'market_cap' ? '시가총액순' : '코드순'}
                            </span>
                        </button>
                        {sortDropdownOpen && (
                            <div className="sort-dropdown-menu">
                                <button
                                    className={`sort-option ${sortBy === 'revenue' ? 'active' : ''}`}
                                    onClick={() => { setSortBy('revenue'); setSortDropdownOpen(false); }}
                                >
                                    매출순
                                </button>
                                <button
                                    className={`sort-option ${sortBy === 'market_cap' ? 'active' : ''}`}
                                    onClick={() => { setSortBy('market_cap'); setSortDropdownOpen(false); }}
                                >
                                    시가총액순
                                </button>
                                <button
                                    className={`sort-option ${sortBy === 'op_profit' ? 'active' : ''}`}
                                    onClick={() => { setSortBy('op_profit'); setSortDropdownOpen(false); }}
                                >
                                    영업이익순
                                </button>
                                <button
                                    className={`sort-option ${sortBy === 'code' ? 'active' : ''}`}
                                    onClick={() => { setSortBy('code'); setSortDropdownOpen(false); }}
                                >
                                    코드순
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="티커 또는 회사명 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="ticker-list">
                    {companyList.map((comp) => (
                        <button
                            key={comp.code}
                            onClick={() => {
                                // Scroll the charts-container to top (not window!)
                                const chartsContainer = document.querySelector('.charts-container');
                                if (chartsContainer) {
                                    chartsContainer.scrollTo({ top: 0, behavior: 'instant' });
                                }
                                setSelectedCode(comp.code);
                                setIsMobileMenuOpen(false); // Close mobile menu on selection
                            }}
                            className={`ticker-item ${selectedCode === comp.code ? 'active' : ''}`}
                        >
                            <span className="ticker-code">{comp.code}</span>
                            <span className="ticker-name">{comp.name}</span>
                        </button>
                    ))}
                </div>

                {/* Collapse Toggle Button */}
                <button
                    className="sidebar-toggle"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    title={sidebarCollapsed ? "사이드바 열기" : "사이드바 접기"}
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
                            <span className="company-sector">{currentCompany?.sector || '일반'}</span>
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
                                분기별
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
                                연간
                            </button>
                        </div>
                    </div>

                    <div className="year-slider">
                        <label>기간: {yearRange[0]} - {yearRange[1]}</label>
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
                            <span className="card-label">최근 매출액</span>
                            <span className="card-value">
                                {chartData.length > 0 ? formatKoreanCurrency(chartData[chartData.length - 1].revenue_eok) : '0억'}
                            </span>
                        </div>
                        <div className="summary-card">
                            <span className="card-label">최근 영업이익</span>
                            <span className="card-value">
                                {chartData.length > 0 ? formatKoreanCurrency(chartData[chartData.length - 1].op_profit_eok) : '0억'}
                            </span>
                        </div>
                        <div className="summary-card">
                            <span className="card-label">영업이익률</span>
                            <span className="card-value">
                                {chartData.length > 0 ? chartData[chartData.length - 1].op_margin : 0}%
                            </span>
                        </div>
                    </div>

                    {/* Main Chart: Bar (Revenue) with YoY */}
                    <div className="chart-section">
                        <h3>
                            {viewMode === 'annual' ? '연간' : '분기별'} 매출액 & YoY 변동률
                            <InfoTooltip text="매출액은 기업이 제품이나 서비스를 판매하고 벌어들인 총 금액입니다. 기업의 외형적인 성장세를 판단하는 가장 기초적인 지표로, 매출이 꾸준히 늘어나는 기업은 시장 점유율이 확대되고 있다는 긍정적인 신호일 수 있습니다." />
                        </h3>
                        <div className="chart-legend">
                            <span><span className="legend-bar"></span> 매출액 (억원)</span>
                            <span>
                                <span className="legend-line-dual"><span style={{ background: '#10b981' }}></span><span style={{ background: '#ef4444' }}></span></span> YoY 변동률 (%)
                                <InfoTooltip text="YoY(Year on Year)는 전년 동기 대비 변동률입니다. 작년 같은 분기와 비교하여 얼마나 성장했는지를 나타내며, 계절적 요인을 배제하고 회사의 실질적인 성장 추세를 파악하는 데 필수적입니다." />
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
                                                return `${(val / 10000).toFixed(1)}조`;
                                            }
                                            return `${val.toFixed(0)}억`;
                                        }}
                                        domain={[0, 'dataMax']}
                                        padding={{ top: 20, bottom: 0 }}
                                        width={isMobile ? 50 : 65}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip
                                            valueFormatter={(value) => {
                                                if (Math.abs(value) >= 10000) {
                                                    return `${(value / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 })} 조원`;
                                                }
                                                return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} 억원`;
                                            }}
                                            yoyKey="rev_change"
                                        />}
                                    />
                                    <Bar dataKey="revenue_eok" name="매출액" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
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
                            {viewMode === 'annual' ? '연간' : '분기별'} 영업이익 & YoY 변동률
                            <InfoTooltip text="영업이익은 매출액에서 원가와 판매관리비(인건비, 마케팅비 등)를 뺀 금액입니다. 회사가 본업인 장사를 통해 실제로 얼마나 돈을 벌었는지를 보여주는 가장 중요한 수익성 지표입니다." />
                        </h3>
                        <div className="chart-legend">
                            <span><span className="legend-bar" style={{ background: 'rgba(16, 185, 129, 0.6)' }}></span> 영업이익 (억원)</span>
                            <span><span className="legend-line-dual"><span style={{ background: '#3b82f6' }}></span><span style={{ background: '#ef4444' }}></span></span> YoY 변동률 (%)</span>
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
                                                return `${(val / 10000).toFixed(1)}조`;
                                            }
                                            return `${val.toFixed(0)}억`;
                                        }}
                                        padding={{ top: 20, bottom: 20 }}
                                        width={isMobile ? 50 : 65}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip
                                            valueFormatter={(value) => {
                                                if (Math.abs(value) >= 10000) {
                                                    return `${(value / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 })} 조원`;
                                                }
                                                return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} 억원`;
                                            }}
                                            yoyKey="op_change"
                                        />}
                                    />
                                    <ReferenceLine y={0} stroke="#64748b" />
                                    <Bar dataKey="op_profit_eok" name="영업이익" fill="url(#barGradGreen)" radius={[4, 4, 0, 0]} />
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
                            {viewMode === 'annual' ? '연간' : '분기별'} 영업이익률 (%)
                            <InfoTooltip text="영업이익률은 매출액 대비 영업이익의 비율(%)입니다. 같은 매출을 올려도 영업이익률이 높은 회사가 더 효율적으로 돈을 버는 회사입니다." />
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
                                        formatter={(value) => [`${value}%`, '영업이익률']}
                                    />
                                    <ReferenceLine y={0} stroke="#64748b" />
                                    <Area type="monotone" dataKey="op_margin" name="영업이익률" stroke="#8b5cf6" fillOpacity={1} fill="url(#marginGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* EPS Bar Chart with YoY */}
                    {epsChartData.length > 0 && (
                        <div className="chart-section">
                            <h3>
                                분기별 주당순이익 (EPS) & YoY 변동률
                                <InfoTooltip text="EPS(Earning Per Share)는 기업이 벌어들인 순이익을 발행 주식 수로 나눈 값입니다. '내가 가진 주식 1주가 얼마를 벌었나'를 나타내며, EPS가 증가해야 주가도 오를 가능성이 높습니다. 단, 주식 발행량 증가나 주식 분할에 따라 주당순이익이 크게 변동할 수 있으므로, EPS 변화를 해석할 때는 주식 수 변동 여부도 함께 확인해야 합니다." />
                            </h3>
                            <div className="chart-legend">
                                <span><span className="legend-bar" style={{ background: 'rgba(245, 158, 11, 0.6)' }}></span> EPS (원)</span>
                                <span><span className="legend-line-dual"><span style={{ background: '#10b981' }}></span><span style={{ background: '#ef4444' }}></span></span> YoY 변동률 (%)</span>
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
                                            tickFormatter={(val) => `${val.toLocaleString()}원`}
                                            domain={isDefaultRange ? [0, 'auto'] : ['auto', 'auto']}
                                            padding={{ top: 20, bottom: 20 }}
                                            width={isMobile ? 50 : 65}
                                        />
                                        <Tooltip
                                            content={<CustomTooltip
                                                valueFormatter={(value) => `${value.toLocaleString()}원`}
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

                    {/* Peer Companies Section */}
                    <div className="peers-section">
                        <h3>동종업계 기업</h3>
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
                            {peerCompanies.length === 0 && <span className="no-peers">동종업계 기업 없음</span>}
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
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>한국 상장 기업 재무 정보 조회 서비스</p>
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
                                📊 데이터 출처 및 저작권 고지
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem' }}>
                                본 서비스는 <strong style={{ color: '#94a3b8' }}>금융감독원 Open DART</strong>의 공공데이터를 기반으로 제공됩니다.<br />
                                (Source: Financial Supervisory Service Open DART)
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
                                ⚠️ 면책 조항 (Disclaimer)
                            </h4>
                            <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', color: '#94a3b8' }}>
                                <p style={{ margin: '0 0 8px 0' }}>
                                    <strong>1.</strong> 본 서비스가 제공하는 재무 데이터는 금융감독원 전자공시시스템(DART)에 기업이 제출한 공시 자료를 기반으로 자동 처리한 것이며,
                                    데이터 수집 및 처리 과정에서 오류가 발생할 수 있습니다. 운영자는 데이터의 <strong style={{ color: '#ef4444' }}>정확성, 완전성, 무결성을 보장하지 않습니다.</strong>
                                </p>
                                <p style={{ margin: '0 0 8px 0' }}>
                                    <strong>2.</strong> 제공되는 정보는 투자 참고용일 뿐이며, 주식 매매의 권유가 아닙니다.
                                </p>
                                <p style={{ margin: '0 0 8px 0' }}>
                                    <strong>3.</strong> 본 서비스의 정보를 활용하여 발생한 투자의 결과(손익)에 대한 법적 책임은
                                    <strong style={{ color: '#ef4444' }}> 전적으로 투자자 본인</strong>에게 있습니다.
                                </p>
                                <p style={{ margin: 0 }}>
                                    <strong>4.</strong> 데이터 오류나 지연이 발생할 수 있으므로, 실제 거래 전 반드시 증권사 및 공식 공시 정보를 확인하시기 바랍니다.
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
                            <button
                                onClick={() => setShowPolicyModal('privacy')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: 0
                                }}
                            >
                                개인정보처리방침
                            </button>
                            <span style={{ color: '#475569' }}>|</span>
                            <button
                                onClick={() => setShowPolicyModal('terms')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: 0
                                }}
                            >
                                이용약관
                            </button>
                            <span style={{ color: '#475569' }}>|</span>
                            <button
                                onClick={() => setShowPolicyModal('contact')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: 0
                                }}
                            >
                                문의하기
                            </button>
                        </div>

                        {/* Copyright */}
                        <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '20px', opacity: 0.8 }}>
                            <p style={{ margin: '5px 0' }}>© 2026 KSTOCKVIEW. All rights reserved.</p>
                        </div>
                    </footer>
                </div>
            </main>

            {/* Policy Modal */}
            {showPolicyModal && (
                <div
                    onClick={() => setShowPolicyModal(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: '#1e293b',
                            borderRadius: '12px',
                            padding: '30px',
                            maxWidth: '700px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            border: '1px solid #475569'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ color: '#e2e8f0', margin: 0 }}>
                                {showPolicyModal === 'privacy' && '개인정보처리방침'}
                                {showPolicyModal === 'terms' && '이용약관'}
                                {showPolicyModal === 'contact' && '문의하기'}
                            </h2>
                            <button
                                onClick={() => setShowPolicyModal(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    padding: '0 10px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.7' }}>
                            {showPolicyModal === 'privacy' && (
                                <>
                                    <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginTop: '20px' }}>1. 개인정보의 수집 및 이용</h3>
                                    <p>본 사이트는 회원가입 없이 운영되며, <strong>별도의 개인정보를 수집하지 않습니다</strong>.</p>

                                    <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginTop: '20px' }}>2. 쿠키(Cookie) 사용</h3>
                                    <p>본 사이트는 사용자 경험 개선을 위해 쿠키를 사용할 수 있습니다. 쿠키는 웹사이트 방문 기록, 설정 등을 저장하는 작은 텍스트 파일입니다.</p>

                                    <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginTop: '20px' }}>3. Google AdSense</h3>
                                    <p>본 사이트는 Google AdSense 광고를 게재합니다. Google은 광고 게재를 위해 쿠키를 사용하며, 이를 통해 맞춤형 광고를 제공할 수 있습니다. Google의 개인정보 보호정책은 <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>Google 개인정보처리방침</a>에서 확인하실 수 있습니다.</p>

                                    <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginTop: '20px' }}>4. 개인정보 관련 문의</h3>
                                    <p>개인정보와 관련한 문의사항은 '문의하기'를 통해 연락주시기 바랍니다.</p>

                                    <p style={{ marginTop: '30px', color: '#94a3b8', fontSize: '0.85rem' }}>최종 수정일: 2026년 1월 11일</p>
                                </>
                            )}

                            {showPolicyModal === 'terms' && (
                                <>
                                    <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginTop: '20px' }}>1. 서비스 이용</h3>
                                    <p>본 사이트(KSTOCKVIEW)는 한국 상장 기업의 재무 정보를 조회할 수 있는 무료 서비스입니다. 모든 사용자는 별도의 회원가입 없이 서비스를 이용할 수 있습니다.</p>

                                    <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginTop: '20px' }}>2. 제공 정보의 성격</h3>
                                    <p>본 사이트에서 제공하는 모든 재무 데이터와 정보는 <strong>참고 목적</strong>으로만 제공됩니다. 제공되는 정보는 투자 조언이나 매수/매도 권유가 아니며, 투자 결정에 대한 모든 책임은 이용자 본인에게 있습니다.</p>

                                    <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginTop: '20px' }}>3. 면책사항</h3>
                                    <p>• 본 사이트는 데이터의 정확성, 완전성, 적시성을 보장하지 않습니다.<br />
                                    • 데이터 오류, 누락, 지연으로 인한 손해에 대해 책임지지 않습니다.<br />
                                    • 실제 투자 전 반드시 공식 증권사 및 금융감독원 자료를 확인하시기 바랍니다.</p>

                                    <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginTop: '20px' }}>4. 저작권</h3>
                                    <p>본 사이트의 디자인, 구조, 코드 등은 저작권법의 보호를 받습니다. 무단 복제 및 배포를 금지합니다.</p>

                                    <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginTop: '20px' }}>5. 데이터 출처</h3>
                                    <p>본 사이트에 게시된 재무 데이터는 금융감독원 전자공시시스템(DART)에서 제공하는 공개 정보를 기반으로 합니다.</p>

                                    <p style={{ marginTop: '30px', color: '#94a3b8', fontSize: '0.85rem' }}>최종 수정일: 2026년 1월 11일</p>
                                </>
                            )}

                            {showPolicyModal === 'contact' && (
                                <>
                                    <p>KSTOCKVIEW 서비스 이용과 관련하여 문의사항이 있으시면 아래 이메일로 연락주시기 바랍니다.</p>

                                    <div style={{
                                        marginTop: '30px',
                                        padding: '20px',
                                        backgroundColor: '#0f172a',
                                        borderRadius: '8px',
                                        border: '1px solid #334155'
                                    }}>
                                        <h3 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '15px' }}>📧 문의 이메일</h3>
                                        <p style={{ fontSize: '1.1rem', color: '#60a5fa', margin: 0 }}>contact@kstockview.com</p>
                                    </div>

                                    <div style={{ marginTop: '30px', fontSize: '0.85rem', color: '#94a3b8' }}>
                                        <p><strong>문의 가능 내용:</strong></p>
                                        <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                                            <li>데이터 오류 신고</li>
                                            <li>서비스 개선 제안</li>
                                            <li>기술적 문제 보고</li>
                                            <li>기타 문의사항</li>
                                        </ul>
                                        <p style={{ marginTop: '15px' }}>※  개별 종목 추천이나 투자 상담은 제공하지 않습니다.</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};

export default App;
