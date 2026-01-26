import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Menu, BarChart3, TrendingUp, PieChart } from 'lucide-react';

const Home = () => {
    const popularStocks = [
        { code: '005930', name: '삼성전자' },
        { code: '000660', name: 'SK하이닉스' },
        { code: '373220', name: 'LG에너지솔루션' },
        { code: '005380', name: '현대자동차' },
        { code: '035420', name: 'NAVER' },
        { code: '035720', name: '카카오' },
    ];

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
                {/* Hero Section */}
                <main style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
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

                    {/* How to Use - Mobile */}
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
                            {/* Mobile instruction */}
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
                                        모바일
                                    </p>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        왼쪽 상단의 <strong style={{ color: '#60a5fa' }}>햄버거 메뉴</strong>를 눌러 종목을 검색하세요
                                    </p>
                                </div>
                            </div>

                            {/* Desktop instruction */}
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
                                        데스크톱
                                    </p>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        왼쪽 <strong style={{ color: '#60a5fa' }}>사이드바</strong>에서 종목을 검색하거나 선택하세요
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
