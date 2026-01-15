import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
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
                padding: '40px 20px'
            }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto'
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
                            fontSize: '2.5rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: '10px'
                        }}>
                            이용약관
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            최종 수정일: 2026년 1월 15일
                        </p>
                    </header>

                    {/* Content */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '40px',
                        lineHeight: '1.8'
                    }}>
                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{
                                color: '#e2e8f0',
                                fontSize: '1.5rem',
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
                                fontSize: '1.5rem',
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
                                fontSize: '1.5rem',
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
                                <h3 style={{ color: '#ef4444', marginBottom: '15px', fontSize: '1.1rem' }}>
                                    ⚠️ 중요: 투자 위험 고지
                                </h3>
                                <ul style={{ color: '#cbd5e1', paddingLeft: '20px', margin: 0 }}>
                                    <li style={{ marginBottom: '10px' }}>
                                        본 사이트는 데이터의 <strong style={{ color: '#ef4444' }}>정확성, 완전성, 적시성을 보장하지 않습니다.</strong>
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        데이터 오류, 누락, 지연으로 인한 손해에 대해 책임지지 않습니다.
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        실제 투자 전 반드시 공식 증권사 및 금융감독원 자료를 확인하시기 바랍니다.
                                    </li>
                                    <li>
                                        투자 결과(손익)에 대한 법적 책임은 <strong style={{ color: '#ef4444' }}>전적으로 투자자 본인</strong>에게 있습니다.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{
                                color: '#e2e8f0',
                                fontSize: '1.5rem',
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
                                fontSize: '1.5rem',
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
