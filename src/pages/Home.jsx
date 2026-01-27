import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Menu, X, BarChart3, TrendingUp, PieChart, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle, FileText } from 'lucide-react';
import { loadAllFinancialData } from '../dataLoader';

const Home = () => {
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
                <title>KStockView - 한국 주식 재무제표 & 실적 분석</title>
                <meta name="description" content="한국 상장 기업의 재무제표와 실적 데이터를 차트로 시각화하여 분석합니다. 매출액, 영업이익, EPS 등 핵심 재무지표를 한눈에 확인하세요." />
                <meta property="og:title" content="KStockView - 한국 주식 재무제표 & 실적 분석" />
                <meta property="og:description" content="한국 상장 기업의 재무제표와 실적 데이터를 차트로 시각화하여 분석합니다." />
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
                        <Link to="/" className="app-title" style={{ textDecoration: 'none', color: 'inherit' }}>KSTOCKVIEW</Link>
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
                        {dataLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                                로딩 중...
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
                        title={sidebarCollapsed ? "사이드바 열기" : "사이드바 접기"}
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
                                한국 상장 기업의 재무제표와 실적 데이터를<br />
                                차트로 시각화하여 분석합니다
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
                                    회원가입 없이 무료로 이용 가능
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
                                    <span>매출액 & 영업이익</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#94a3b8',
                                    fontSize: '0.95rem'
                                }}>
                                    <TrendingUp size={20} style={{ color: '#10b981' }} />
                                    <span>YoY 성장률</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#94a3b8',
                                    fontSize: '0.95rem'
                                }}>
                                    <PieChart size={20} style={{ color: '#8b5cf6' }} />
                                    <span>영업이익률 & EPS</span>
                                </div>
                            </div>

                            {/* How to Use */}
                            <div className="chart-section" style={{ maxWidth: '500px', width: '100%' }}>
                                <h3>사용 방법</h3>
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
                                                종목 검색
                                            </p>
                                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                왼쪽 <strong style={{ color: '#60a5fa' }}>사이드바</strong>에서 종목을 검색하거나 선택하세요
                                            </p>
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
                                                검색 & 정렬
                                            </p>
                                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                회사명 또는 종목코드로 검색하고, 매출/시총/영업이익 순으로 정렬할 수 있습니다
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
                                    인기 종목 바로가기
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

                            {/* Blog Analysis Reports Section - Orphan Page 해결 */}
                            <div className="chart-section" style={{
                                width: '100%',
                                maxWidth: '700px',
                                marginTop: '40px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '12px'
                                }}>
                                    <h3 style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        margin: 0
                                    }}>
                                        <FileText size={20} style={{ color: '#8b5cf6' }} />
                                        종목 분석 리포트
                                    </h3>
                                    <Link
                                        to="/blogs"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            backgroundColor: 'rgba(139, 92, 246, 0.15)',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            color: '#a78bfa',
                                            textDecoration: 'none',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.25)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.15)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                        }}
                                    >
                                        전체보기 →
                                    </Link>
                                </div>
                                <p style={{
                                    color: '#94a3b8',
                                    fontSize: '0.9rem',
                                    marginBottom: '20px',
                                    lineHeight: '1.5'
                                }}>
                                    주요 종목에 대한 상세 분석 리포트를 확인하세요. 기업 개요, 재무 분석, 투자 포인트를 제공합니다.
                                </p>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '12px'
                                }}>
                                    <Link
                                        to="/blog/samsung-electronics"
                                        style={{
                                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '10px',
                                            padding: '16px',
                                            color: '#e2e8f0',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>삼성전자</div>
                                        <div style={{ fontSize: '0.8rem', color: '#a78bfa' }}>반도체 · 전자</div>
                                    </Link>
                                    <Link
                                        to="/blog/sk-hynix"
                                        style={{
                                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '10px',
                                            padding: '16px',
                                            color: '#e2e8f0',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>SK하이닉스</div>
                                        <div style={{ fontSize: '0.8rem', color: '#a78bfa' }}>메모리 반도체</div>
                                    </Link>
                                    <Link
                                        to="/blog/hyundai-motor"
                                        style={{
                                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '10px',
                                            padding: '16px',
                                            color: '#e2e8f0',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>현대자동차</div>
                                        <div style={{ fontSize: '0.8rem', color: '#a78bfa' }}>완성차 · EV</div>
                                    </Link>
                                    <Link
                                        to="/blog/lg-energy-solution"
                                        style={{
                                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '10px',
                                            padding: '16px',
                                            color: '#e2e8f0',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>LG에너지솔루션</div>
                                        <div style={{ fontSize: '0.8rem', color: '#a78bfa' }}>배터리</div>
                                    </Link>
                                    <Link
                                        to="/blog/samsung-biologics"
                                        style={{
                                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '10px',
                                            padding: '16px',
                                            color: '#e2e8f0',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>삼성바이오로직스</div>
                                        <div style={{ fontSize: '0.8rem', color: '#a78bfa' }}>바이오 CMO</div>
                                    </Link>
                                    <Link
                                        to="/blog/hanwha-aerospace"
                                        style={{
                                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '10px',
                                            padding: '16px',
                                            color: '#e2e8f0',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>한화에어로스페이스</div>
                                        <div style={{ fontSize: '0.8rem', color: '#a78bfa' }}>방산 · 우주</div>
                                    </Link>
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
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>한국 상장 기업 재무 정보 조회 서비스</p>
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
                                    개인정보처리방침
                                </Link>
                                <span style={{ color: '#475569' }}>|</span>
                                <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'underline' }}>
                                    이용약관
                                </Link>
                                <span style={{ color: '#475569' }}>|</span>
                                <Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'underline' }}>
                                    문의하기
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
