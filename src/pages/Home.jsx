import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Menu, X, BarChart3, TrendingUp, PieChart, ArrowUpDown } from 'lucide-react';
import { loadAllFinancialData } from '../dataLoader';

const Home = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        navigate(`/${code}`);
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

            <div style={{
                minHeight: '100vh',
                backgroundColor: '#0f172a',
                color: '#e2e8f0',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header with Hamburger Menu */}
                <header style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '56px',
                    backgroundColor: '#0f172a',
                    borderBottom: '1px solid #1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    zIndex: 100
                }}>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#e2e8f0',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span style={{
                        marginLeft: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#60a5fa'
                    }}>
                        KSTOCKVIEW
                    </span>
                </header>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 150
                        }}
                    />
                )}

                {/* Sidebar */}
                <aside style={{
                    position: 'fixed',
                    top: 0,
                    left: isMobileMenuOpen ? 0 : '-280px',
                    width: '280px',
                    height: '100vh',
                    backgroundColor: '#1e293b',
                    zIndex: 200,
                    transition: 'left 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isMobileMenuOpen ? '4px 0 20px rgba(0, 0, 0, 0.3)' : 'none'
                }}>
                    {/* Sidebar Header */}
                    <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #334155'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <h2 style={{
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                color: '#60a5fa',
                                margin: 0
                            }}>
                                KSTOCKVIEW
                            </h2>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Sort Dropdown */}
                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                            <button
                                onClick={() => setSortDropdownOpen(prev => !prev)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '6px',
                                    color: '#e2e8f0',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.85rem'
                                }}
                            >
                                <ArrowUpDown size={16} />
                                <span>
                                    {sortBy === 'revenue' ? '매출순' :
                                        sortBy === 'op_profit' ? '영업이익순' :
                                        sortBy === 'market_cap' ? '시가총액순' : '코드순'}
                                </span>
                            </button>
                            {sortDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '6px',
                                    marginTop: '4px',
                                    zIndex: 10,
                                    overflow: 'hidden'
                                }}>
                                    {['revenue', 'market_cap', 'op_profit', 'code'].map((sort) => (
                                        <button
                                            key={sort}
                                            onClick={() => { setSortBy(sort); setSortDropdownOpen(false); }}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                background: sortBy === sort ? '#334155' : 'transparent',
                                                border: 'none',
                                                color: sortBy === sort ? '#60a5fa' : '#e2e8f0',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {sort === 'revenue' ? '매출순' :
                                                sort === 'op_profit' ? '영업이익순' :
                                                sort === 'market_cap' ? '시가총액순' : '코드순'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Search Box */}
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Search size={18} style={{
                                position: 'absolute',
                                left: '12px',
                                color: '#64748b'
                            }} />
                            <input
                                type="text"
                                placeholder="티커 또는 회사명 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 40px',
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '6px',
                                    color: '#e2e8f0',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Stock List */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '8px'
                    }}>
                        {dataLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                                로딩 중...
                            </div>
                        ) : (
                            companyList.map((comp) => (
                                <button
                                    key={comp.code}
                                    onClick={() => handleStockSelect(comp.code)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#e2e8f0',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        textAlign: 'left',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <span style={{
                                        color: '#60a5fa',
                                        fontWeight: '600',
                                        fontSize: '0.8rem',
                                        minWidth: '60px'
                                    }}>
                                        {comp.code}
                                    </span>
                                    <span style={{
                                        fontSize: '0.9rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {comp.name}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </aside>

                {/* Hero Section */}
                <main style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px 20px 40px',
                    textAlign: 'center'
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
                        marginBottom: '40px',
                        maxWidth: '600px',
                        lineHeight: '1.6'
                    }}>
                        한국 상장 기업의 재무제표와 실적 데이터를<br />
                        차트로 시각화하여 분석합니다
                    </p>

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
                    <div style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '16px',
                        padding: '24px 32px',
                        marginBottom: '40px',
                        maxWidth: '500px',
                        width: '100%'
                    }}>
                        <h2 style={{
                            fontSize: '1.1rem',
                            color: '#e2e8f0',
                            marginBottom: '20px',
                            fontWeight: '600'
                        }}>
                            사용 방법
                        </h2>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            textAlign: 'left'
                        }}>
                            {/* Menu instruction */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px'
                            }}>
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
                                        왼쪽 상단의 <strong style={{ color: '#60a5fa' }}>메뉴 버튼</strong>을 눌러 종목을 검색하세요
                                    </p>
                                </div>
                            </div>

                            {/* Search instruction */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px'
                            }}>
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
                    <div style={{ width: '100%', maxWidth: '600px' }}>
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
                                    to={`/${stock.code}`}
                                    style={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
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
                                        e.currentTarget.style.backgroundColor = '#334155';
                                        e.currentTarget.style.borderColor = '#60a5fa';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1e293b';
                                        e.currentTarget.style.borderColor = '#334155';
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
                </main>

                {/* Footer */}
                <footer style={{
                    padding: '24px 20px',
                    borderTop: '1px solid #1e293b',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.8rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '16px',
                        marginBottom: '12px',
                        flexWrap: 'wrap'
                    }}>
                        <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                            개인정보처리방침
                        </Link>
                        <span style={{ color: '#475569' }}>|</span>
                        <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                            이용약관
                        </Link>
                        <span style={{ color: '#475569' }}>|</span>
                        <Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                            문의하기
                        </Link>
                    </div>
                    <p style={{ margin: 0 }}>© 2026 KSTOCKVIEW. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
};

export default Home;
