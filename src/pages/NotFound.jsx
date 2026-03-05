import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Home, AlertCircle, Search, TrendingUp, FileText } from 'lucide-react';

const NotFound = () => {
    const { t } = useTranslation();
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
                <title>{t('notFound.pageTitle')}</title>
                <meta name="robots" content="noindex" />
                <meta name="description" content={t('notFound.pageDesc')} />
            </Helmet>

            <div style={{
                minHeight: '100vh',
                backgroundColor: '#141417',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '40px 20px',
                textAlign: 'center',
                overflowY: 'auto'
            }}>
                {/* 404 Icon */}
                <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '50%',
                    padding: '24px',
                    marginBottom: '24px'
                }}>
                    <AlertCircle size={64} style={{ color: '#ff4d4f' }} />
                </div>

                {/* Error Code */}
                <h1 style={{
                    fontSize: 'clamp(3rem, 12vw, 6rem)',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #FF8C00 0%, #FFb366 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: '0 0 16px 0',
                    lineHeight: '1'
                }}>
                    404
                </h1>

                {/* Error Message */}
                <h2 style={{
                    fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                    color: '#f0f0f5',
                    fontWeight: '600',
                    margin: '0 0 12px 0'
                }}>
                    {t('notFound.title')}
                </h2>

                <p style={{
                    fontSize: '0.95rem',
                    color: '#8888a0',
                    maxWidth: '400px',
                    lineHeight: '1.6',
                    margin: '0 0 24px 0'
                }}>
                    {t('notFound.message')}
                </p>

                {/* Home Button */}
                <Link
                    to="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#e67e00',
                        color: '#ffffff',
                        padding: '14px 28px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 14px rgba(255, 140, 0, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#cc6e00';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#e67e00';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <Home size={20} />
                    {t('notFound.goHome')}
                </Link>

                {/* Helpful Links Section */}
                <div style={{
                    marginTop: '48px',
                    width: '100%',
                    maxWidth: '600px'
                }}>
                    {/* Popular Stocks */}
                    <div style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '20px',
                        border: '1px solid rgba(71, 85, 105, 0.3)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginBottom: '16px'
                        }}>
                            <TrendingUp size={20} style={{ color: '#00d084' }} />
                            <h3 style={{ color: '#f0f0f5', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                                {t('notFound.popularStocks')}
                            </h3>
                        </div>
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
                                        backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                        border: '1px solid rgba(255, 140, 0, 0.2)',
                                        borderRadius: '8px',
                                        padding: '8px 14px',
                                        color: '#f0f0f5',
                                        textDecoration: 'none',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 140, 0, 0.2)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 140, 0, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 140, 0, 0.1)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 140, 0, 0.2)';
                                    }}
                                >
                                    <span style={{ color: '#FF8C00', fontWeight: '600', fontSize: '0.75rem' }}>
                                        {stock.code}
                                    </span>
                                    <span>{stock.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <Link
                            to="/blogs"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: 'rgba(230, 126, 0, 0.1)',
                                border: '1px solid rgba(230, 126, 0, 0.2)',
                                borderRadius: '8px',
                                padding: '10px 16px',
                                color: '#FFb366',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(230, 126, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(230, 126, 0, 0.1)';
                            }}
                        >
                            <FileText size={16} />
                            {t('notFound.reports')}
                        </Link>
                        <Link
                            to="/"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: 'rgba(0, 208, 132, 0.1)',
                                border: '1px solid rgba(0, 208, 132, 0.2)',
                                borderRadius: '8px',
                                padding: '10px 16px',
                                color: '#00d084',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0, 208, 132, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0, 208, 132, 0.1)';
                            }}
                        >
                            <Search size={16} />
                            {t('notFound.searchStocks')}
                        </Link>
                    </div>
                </div>

                {/* Logo */}
                <div style={{
                    marginTop: '48px',
                    opacity: 0.5
                }}>
                    <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #FF8C00 0%, #FFb366 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        KSTOCKVIEW
                    </span>
                </div>
            </div>
        </>
    );
};

export default NotFound;
