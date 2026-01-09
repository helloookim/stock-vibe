import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Line, Cell, ReferenceLine, AreaChart, Area
} from 'recharts';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { loadAllFinancialData, epsDataLoader } from './dataLoader';

const App = () => {
    const [financialRawData, setFinancialRawData] = useState({});
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

    // Load all data on mount
    useEffect(() => {
        async function loadData() {
            setDataLoading(true);
            try {
                const [financial, eps, marketCap] = await Promise.all([
                    loadAllFinancialData(),  // Loads and merges consolidated + separate
                    epsDataLoader.loadAll(),
                    fetch('/market_cap_data.json').then(r => r.json())
                ]);

                setFinancialRawData(financial || {});
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

    const currentCompany = financialRawData[selectedCode];

    // Calculate the min/max years for the current company's data
    // Skip years that only have Q4 without Q1-Q3 (since Q4 calculation needs Q1-Q3)
    const companyDataRange = useMemo(() => {
        if (!currentCompany?.history?.length) return { min: 2015, max: 2025 };

        // Find years that have valid data (not just Q4-only without Q1-Q3)
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
    }, [currentCompany]);

    // Update yearRange when company changes to fit company's data range
    useEffect(() => {
        setYearRange([companyDataRange.min, companyDataRange.max]);
        setIsDefaultRange(true); // Reset to default when company changes
    }, [companyDataRange]);

    const chartData = useMemo(() => {
        if (!currentCompany) return [];

        // Filter data by year range
        const rawHistory = currentCompany.history.filter(entry => entry.year >= yearRange[0] && entry.year <= yearRange[1]);

        // Data is already properly calculated in the JSON (Q4 = Annual - Q3_Cumulative)
        // No additional processing needed
        const processedHistory = rawHistory.map(entry => ({
            ...entry,
            revenue_adjusted: entry.revenue || 0,
            op_profit_adjusted: entry.op_profit || 0,
            net_income_adjusted: entry.net_income || 0
        }));

        // Don't filter - show all quarters
        // Now convert to 억원 and calculate changes
        const history = processedHistory.map((entry, idx, arr) => {
            // Convert to 억원 (100,000,000 won) units
            const revenue_eok = entry.revenue_adjusted / 100000000;
            const op_profit_eok = entry.op_profit_adjusted / 100000000;
            const net_income_eok = entry.net_income_adjusted / 100000000;

            let rev_change = null;  // null means no previous data
            let op_change = null;
            // YoY: Find same quarter in previous year
            const prevYearEntry = arr.find(e => e.year === entry.year - 1 && e.quarter === entry.quarter);
            if (prevYearEntry) {
                const prev_rev_eok = prevYearEntry.revenue_adjusted / 100000000;
                const prev_op_eok = prevYearEntry.op_profit_adjusted / 100000000;
                rev_change = prev_rev_eok ? parseFloat(((revenue_eok - prev_rev_eok) / Math.abs(prev_rev_eok) * 100).toFixed(1)) : 0;
                op_change = prev_op_eok ? parseFloat(((op_profit_eok - prev_op_eok) / Math.abs(prev_op_eok) * 100).toFixed(1)) : 0;
            }

            return {
                ...entry,
                displayLabel: `${entry.year} ${entry.quarter}`,
                revenue_eok,
                op_profit_eok,
                net_income_eok,
                rev_change,
                op_change,
                op_margin: entry.revenue_adjusted ? parseFloat(((entry.op_profit_adjusted / entry.revenue_adjusted) * 100).toFixed(1)) : 0
            };
        });
        return history;
    }, [currentCompany, yearRange]);

    // EPS chart data
    const epsChartData = useMemo(() => {
        const currentEpsData = epsData[selectedCode];
        if (!currentEpsData) return [];

        // Filter by year range and map to chart format
        const epsHistory = currentEpsData.history
            .filter(entry => entry.year >= yearRange[0] && entry.year <= yearRange[1])
            .map((entry, idx, arr) => {
                const eps = entry.eps || 0;

                // Calculate YoY change
                let eps_change = null;
                const prevYearEntry = arr.find(e => e.year === entry.year - 1 && e.quarter === entry.quarter);
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

        return epsHistory;
    }, [selectedCode, yearRange]);

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
        <div className="app-container">
            {/* SIDEBAR */}
            <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <h1 className="app-title">QUANTVIBE</h1>
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
                            onClick={() => setSelectedCode(comp.code)}
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
                    <div className="company-info">
                        <h1>{currentCompany?.name}</h1>
                        <span className="company-code">{selectedCode}</span>
                        <span className="company-sector">{currentCompany?.sector || '일반'}</span>
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
                            <span className="card-label">최근 당기순이익</span>
                            <span className="card-value">
                                {chartData.length > 0 ? formatKoreanCurrency(chartData[chartData.length - 1].net_income_eok) : '0억'}
                            </span>
                        </div>
                        <div className="summary-card">
                            <span className="card-label">영업이익률</span>
                            <span className="card-value">
                                {chartData.length > 0 ? chartData[chartData.length - 1].op_margin : 0}%
                            </span>
                        </div>
                    </div>

                    {/* Main Chart: Bar (Revenue) + Line (Change Rate) */}
                    <div className="chart-section">
                        <h3>분기별 매출액 & 변동률</h3>
                        <div className="chart-legend">
                            <span><span className="legend-bar"></span> 매출액 (억원)</span>
                            <span><span className="legend-line-dual"><span style={{ background: '#10b981' }}></span><span style={{ background: '#ef4444' }}></span></span> YoY 변동률 (%)</span>
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={chartData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="displayLabel" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={70} />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="#94a3b8"
                                        fontSize={11}
                                        tickFormatter={(val) => val >= 10000 ? `${(val / 10000).toFixed(1)}조` : `${val.toFixed(0)}억`}
                                        domain={isDefaultRange ? [0, 'auto'] : ['auto', 'auto']}
                                        padding={{ top: 20, bottom: 20 }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#10b981"
                                        fontSize={11}
                                        tickFormatter={(val) => `${val}%`}
                                        padding={{ top: 20, bottom: 20 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                        formatter={(value, name) => {
                                            if (name === '변동률') return [`${value}%`, name];
                                            if (Math.abs(value) >= 10000) return [`${(value / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 })} 조원`, name];
                                            return [`${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} 억원`, name];
                                        }}
                                    />
                                    <ReferenceLine yAxisId="right" y={0} stroke="#64748b" strokeDasharray="5 5" />
                                    <Bar yAxisId="left" dataKey="revenue_eok" name="매출액" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="rev_change"
                                        name="변동률"
                                        stroke="#64748b"
                                        strokeWidth={2}
                                        dot={(props) => {
                                            const { cx, cy, payload } = props;
                                            if (payload.rev_change === null) return null;
                                            const color = payload.rev_change >= 0 ? '#10b981' : '#ef4444';
                                            return <circle cx={cx} cy={cy} r={5} fill={color} stroke={color} strokeWidth={2} />;
                                        }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Operating Profit Chart - Same X-axis as Revenue */}
                    <div className="chart-section">
                        <h3>분기별 영업이익 & 변동률</h3>
                        <div className="chart-legend">
                            <span><span className="legend-bar" style={{ background: 'rgba(16, 185, 129, 0.6)' }}></span> 영업이익 (억원)</span>
                            <span><span className="legend-line-dual"><span style={{ background: '#10b981' }}></span><span style={{ background: '#ef4444' }}></span></span> YoY 변동률 (%)</span>
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={chartData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="barGradGreen" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="displayLabel" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={70} />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="#94a3b8"
                                        fontSize={11}
                                        domain={isDefaultRange ? [0, 'auto'] : [dataMin => Math.min(dataMin, 0), 'auto']}
                                        tickFormatter={(val) => Math.abs(val) >= 10000 ? `${(val / 10000).toFixed(1)}조` : `${val.toFixed(0)}억`}
                                        padding={{ top: 20, bottom: 20 }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#f59e0b"
                                        fontSize={11}
                                        tickFormatter={(val) => `${val}%`}
                                        padding={{ top: 20, bottom: 20 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                        formatter={(value, name) => {
                                            if (name === '변동률') return [`${value}%`, name];
                                            if (Math.abs(value) >= 10000) return [`${(value / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 })} 조원`, name];
                                            return [`${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} 억원`, name];
                                        }}
                                    />
                                    <ReferenceLine yAxisId="left" y={0} stroke="#64748b" />
                                    <ReferenceLine yAxisId="right" y={0} stroke="#64748b" strokeDasharray="5 5" />
                                    <Bar yAxisId="left" dataKey="op_profit_eok" name="영업이익" fill="url(#barGradGreen)" radius={[4, 4, 0, 0]} />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="op_change"
                                        name="변동률"
                                        stroke="#64748b"
                                        strokeWidth={2}
                                        dot={(props) => {
                                            const { cx, cy, payload } = props;
                                            if (payload.op_change === null) return null;
                                            const color = payload.op_change >= 0 ? '#10b981' : '#ef4444';
                                            return <circle cx={cx} cy={cy} r={5} fill={color} stroke={color} strokeWidth={2} />;
                                        }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Second Chart: Growth Rates */}
                    <div className="bottom-section">
                        <div className="chart-section profit-margin-chart">
                            <h3>분기별 영업이익률 (%)</h3>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                                        <defs>
                                            <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="displayLabel" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" />
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

                        <div className="peers-section">
                            <h3>동종업계 기업</h3>
                            <div className="peers-list">
                                {peerCompanies.map(peer => (
                                    <button
                                        key={peer.code}
                                        onClick={() => {
                                            setSearchTerm(''); // Clear search to ensure company is in list
                                            setSelectedCode(peer.code);
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
                    </div>

                    {/* EPS Chart */}
                    {epsChartData.length > 0 && (
                        <div className="chart-section">
                            <h3>분기별 주당순이익 (EPS) & 변동률</h3>
                            <div className="chart-legend">
                                <span><span className="legend-bar" style={{ background: 'rgba(245, 158, 11, 0.6)' }}></span> EPS (원)</span>
                                <span><span className="legend-line-dual"><span style={{ background: '#10b981' }}></span><span style={{ background: '#ef4444' }}></span></span> YoY 변동률 (%)</span>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={350}>
                                    <ComposedChart data={epsChartData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
                                        <defs>
                                            <linearGradient id="barGradOrange" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="displayLabel" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={70} />
                                        <YAxis
                                            yAxisId="left"
                                            stroke="#94a3b8"
                                            fontSize={11}
                                            tickFormatter={(val) => `${val.toLocaleString()}원`}
                                            domain={isDefaultRange ? [0, 'auto'] : ['auto', 'auto']}
                                            padding={{ top: 20, bottom: 20 }}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            stroke="#10b981"
                                            fontSize={11}
                                            tickFormatter={(val) => `${val}%`}
                                            padding={{ top: 20, bottom: 20 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                            formatter={(value, name) => {
                                                if (name === '변동률') return [`${value}%`, name];
                                                return [`${value.toLocaleString()}원`, name];
                                            }}
                                        />
                                        <ReferenceLine yAxisId="left" y={0} stroke="#64748b" />
                                        <ReferenceLine yAxisId="right" y={0} stroke="#64748b" strokeDasharray="5 5" />
                                        <Bar yAxisId="left" dataKey="eps" name="EPS" fill="url(#barGradOrange)" radius={[4, 4, 0, 0]} />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="eps_change"
                                            name="변동률"
                                            stroke="#64748b"
                                            strokeWidth={2}
                                            dot={(props) => {
                                                const { cx, cy, payload } = props;
                                                if (payload.eps_change === null) return null;
                                                const color = payload.eps_change >= 0 ? '#10b981' : '#ef4444';
                                                return <circle cx={cx} cy={cy} r={5} fill={color} stroke={color} strokeWidth={2} />;
                                            }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
