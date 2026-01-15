import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
    // Override body overflow for this page
    React.useEffect(() => {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        return () => {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        };
    }, []);

    return (
        <>
            <Helmet>
                <title>개인정보처리방침 | KStockView</title>
                <meta name="description" content="KStockView의 개인정보 처리방침 및 쿠키 사용 정책" />
            </Helmet>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
                color: '#e2e8f0',
                padding: '20px 15px 100px 15px',
                paddingTop: window.innerWidth > 768 ? '40px' : '20px',
                paddingLeft: window.innerWidth > 768 ? '20px' : '15px',
                paddingRight: window.innerWidth > 768 ? '20px' : '15px'
            }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    {/* Back Button */}
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#60a5fa',
                            textDecoration: 'none',
                            marginBottom: '30px',
                            fontSize: '0.9rem',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#93c5fd'}
                        onMouseLeave={(e) => e.target.style.color = '#60a5fa'}
                    >
                        <ArrowLeft size={18} />
                        홈으로 돌아가기
                    </Link>

                    {/* Header */}
                    <header style={{
                        marginBottom: '40px',
                        paddingBottom: '20px',
                        borderBottom: '2px solid #334155'
                    }}>
                        <h1 style={{
                            fontSize: window.innerWidth > 768 ? '2.5rem' : '1.8rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: '10px'
                        }}>
                            개인정보처리방침
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: window.innerWidth > 768 ? '0.9rem' : '0.8rem' }}>
                            최종 수정일: 2026년 1월 15일
                        </p>
                    </header>

                    {/* Content */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: window.innerWidth > 768 ? '40px' : '20px',
                        lineHeight: '1.8',
                        fontSize: window.innerWidth > 768 ? '1rem' : '0.9rem'
                    }}>
                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{
                                color: '#e2e8f0',
                                fontSize: window.innerWidth > 768 ? '1.5rem' : '1.2rem',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{
                                    width: '4px',
                                    height: '24px',
                                    background: '#60a5fa',
                                    borderRadius: '2px'
                                }} />
                                1. 개인정보의 수집 및 이용
                            </h2>
                            <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
                                본 사이트는 회원가입 없이 운영되며, <strong>별도의 개인정보를 수집하지 않습니다</strong>.
                            </p>
                            <p style={{ color: '#cbd5e1' }}>
                                사용자는 어떠한 개인정보도 제공하지 않고 모든 서비스를 자유롭게 이용할 수 있습니다.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{
                                color: '#e2e8f0',
                                fontSize: window.innerWidth > 768 ? '1.5rem' : '1.2rem',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{
                                    width: '4px',
                                    height: '24px',
                                    background: '#60a5fa',
                                    borderRadius: '2px'
                                }} />
                                2. 쿠키(Cookie) 사용
                            </h2>
                            <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
                                본 사이트는 사용자 경험 개선을 위해 쿠키를 사용할 수 있습니다.
                            </p>
                            <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
                                쿠키는 웹사이트 방문 기록, 설정 등을 저장하는 작은 텍스트 파일입니다.
                            </p>
                            <p style={{ color: '#cbd5e1' }}>
                                대부분의 웹 브라우저는 쿠키를 자동으로 수락하지만, 브라우저 설정을 통해 쿠키를 거부하거나 삭제할 수 있습니다.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{
                                color: '#e2e8f0',
                                fontSize: window.innerWidth > 768 ? '1.5rem' : '1.2rem',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{
                                    width: '4px',
                                    height: '24px',
                                    background: '#60a5fa',
                                    borderRadius: '2px'
                                }} />
                                3. Google AdSense
                            </h2>
                            <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
                                본 사이트는 Google AdSense 광고를 게재합니다.
                            </p>
                            <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
                                Google은 광고 게재를 위해 쿠키를 사용하며, 이를 통해 맞춤형 광고를 제공할 수 있습니다.
                            </p>
                            <p style={{ color: '#cbd5e1' }}>
                                Google의 개인정보 보호정책은{' '}
                                <a
                                    href="https://policies.google.com/privacy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#60a5fa', textDecoration: 'underline' }}
                                >
                                    Google 개인정보처리방침
                                </a>
                                에서 확인하실 수 있습니다.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{
                                color: '#e2e8f0',
                                fontSize: window.innerWidth > 768 ? '1.5rem' : '1.2rem',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{
                                    width: '4px',
                                    height: '24px',
                                    background: '#60a5fa',
                                    borderRadius: '2px'
                                }} />
                                4. 개인정보 관련 문의
                            </h2>
                            <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
                                개인정보와 관련한 문의사항은 아래 이메일로 연락주시기 바랍니다.
                            </p>
                            <div style={{
                                marginTop: '20px',
                                padding: '20px',
                                backgroundColor: '#0f172a',
                                borderRadius: '8px',
                                border: '1px solid #334155'
                            }}>
                                <p style={{
                                    fontSize: window.innerWidth > 768 ? '1rem' : '0.85rem',
                                    color: '#60a5fa',
                                    margin: 0,
                                    wordBreak: 'break-all'
                                }}>
                                    📧 contact@kstockview.com
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 style={{
                                color: '#e2e8f0',
                                fontSize: window.innerWidth > 768 ? '1.5rem' : '1.2rem',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{
                                    width: '4px',
                                    height: '24px',
                                    background: '#60a5fa',
                                    borderRadius: '2px'
                                }} />
                                5. 정책 변경
                            </h2>
                            <p style={{ color: '#cbd5e1' }}>
                                본 개인정보처리방침은 관련 법령 및 서비스 변경에 따라 수정될 수 있습니다.
                                변경 시 웹사이트를 통해 공지하며, 중요한 변경사항이 있을 경우 별도로 안내드립니다.
                            </p>
                        </section>
                    </div>

                    {/* Footer */}
                    <footer style={{
                        marginTop: '40px',
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: '0.85rem'
                    }}>
                        <p>© 2026 KSTOCKVIEW. All rights reserved.</p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default PrivacyPolicy;
