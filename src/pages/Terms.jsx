import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
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
                <title>이용약관 | KStockView</title>
                <meta name="description" content="KStockView 서비스 이용약관 및 면책사항" />
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
                            이용약관
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
                                1. 서비스 이용
                            </h2>
                            <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
                                본 사이트(KSTOCKVIEW)는 한국 상장 기업의 재무 정보를 조회할 수 있는 무료 서비스입니다.
                            </p>
                            <p style={{ color: '#cbd5e1' }}>
                                모든 사용자는 별도의 회원가입 없이 서비스를 이용할 수 있습니다.
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
                                2. 제공 정보의 성격
                            </h2>
                            <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
                                본 사이트에서 제공하는 모든 재무 데이터와 정보는 <strong>참고 목적</strong>으로만 제공됩니다.
                            </p>
                            <p style={{ color: '#cbd5e1' }}>
                                제공되는 정보는 투자 조언이나 매수/매도 권유가 아니며, 투자 결정에 대한 모든 책임은 이용자 본인에게 있습니다.
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
                                3. 면책사항
                            </h2>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#0f172a',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                marginBottom: '15px'
                            }}>
                                <h3 style={{
                                    color: '#ef4444',
                                    marginBottom: '15px',
                                    fontSize: window.innerWidth > 768 ? '1.1rem' : '1rem'
                                }}>
                                    ⚠️ 중요: 투자 위험 고지
                                </h3>
                                <ul style={{ color: '#cbd5e1', paddingLeft: '20px', margin: 0 }}>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#ef4444' }}>데이터 정확성 면책:</strong> 본 사이트는 금융감독원 DART의 공시 자료를 자동으로 처리하여 제공하며,
                                        데이터 수집·가공·표시 과정에서 발생할 수 있는 오류, 누락, 지연에 대해 <strong style={{ color: '#ef4444' }}>어떠한 법적 책임도 지지 않습니다.</strong>
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#ef4444' }}>손해배상 면책:</strong> 본 서비스의 데이터 오류로 인해 발생한 직접적·간접적·부수적·파생적 손해
                                        (투자 손실, 기회 손실 등 일체 포함)에 대해 운영자는 <strong style={{ color: '#ef4444' }}>법적 책임을 지지 않습니다.</strong>
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#ef4444' }}>투자 판단 책임:</strong> 본 서비스는 투자 조언이 아니며,
                                        모든 투자 결정 및 그 결과(손익)에 대한 법적 책임은 <strong style={{ color: '#ef4444' }}>전적으로 이용자 본인</strong>에게 있습니다.
                                    </li>
                                    <li>
                                        <strong style={{ color: '#ef4444' }}>검증 의무:</strong> 실제 투자 전 반드시 공식 증권사, 금융감독원, 한국거래소 등의
                                        공식 자료를 직접 확인하시기 바랍니다.
                                    </li>
                                </ul>
                            </div>
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
                                4. 저작권
                            </h2>
                            <p style={{ color: '#cbd5e1' }}>
                                본 사이트의 디자인, 구조, 코드 등은 저작권법의 보호를 받습니다. 무단 복제 및 배포를 금지합니다.
                            </p>
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
                                5. 데이터 출처
                            </h2>
                            <p style={{ color: '#cbd5e1' }}>
                                본 사이트에 게시된 재무 데이터는 금융감독원 전자공시시스템(DART)에서 제공하는 공개 정보를 기반으로 합니다.
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

export default Terms;
