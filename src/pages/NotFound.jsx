import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
    return (
        <>
            <Helmet>
                <title>페이지를 찾을 수 없습니다 - KStockView</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <div style={{
                minHeight: '100vh',
                backgroundColor: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                textAlign: 'center'
            }}>
                {/* 404 Icon */}
                <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '50%',
                    padding: '24px',
                    marginBottom: '24px'
                }}>
                    <AlertCircle size={64} style={{ color: '#ef4444' }} />
                </div>

                {/* Error Code */}
                <h1 style={{
                    fontSize: 'clamp(4rem, 15vw, 8rem)',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
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
                    fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                    color: '#e2e8f0',
                    fontWeight: '600',
                    margin: '0 0 12px 0'
                }}>
                    페이지를 찾을 수 없습니다
                </h2>

                <p style={{
                    fontSize: '1rem',
                    color: '#94a3b8',
                    maxWidth: '400px',
                    lineHeight: '1.6',
                    margin: '0 0 32px 0'
                }}>
                    요청하신 페이지가 존재하지 않거나, 이동되었거나, 삭제되었을 수 있습니다.
                </p>

                {/* Home Button */}
                <Link
                    to="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        padding: '14px 28px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <Home size={20} />
                    홈으로 돌아가기
                </Link>

                {/* Logo */}
                <div style={{
                    marginTop: '60px',
                    opacity: 0.5
                }}>
                    <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
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
