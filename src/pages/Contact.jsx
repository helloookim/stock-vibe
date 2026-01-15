import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';

const Contact = () => {
    return (
        <>
            <Helmet>
                <title>문의하기 | KStockView</title>
                <meta name="description" content="KStockView 서비스 문의 및 연락처 정보" />
            </Helmet>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
                color: '#e2e8f0',
                padding: '40px 20px 80px 20px'
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
                            문의하기
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            서비스 이용과 관련하여 문의사항이 있으시면 연락주시기 바랍니다.
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
                        {/* Email Contact */}
                        <section style={{ marginBottom: '40px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '20px'
                            }}>
                                <Mail size={24} color="#60a5fa" />
                                <h2 style={{
                                    color: '#e2e8f0',
                                    fontSize: '1.5rem',
                                    margin: 0
                                }}>
                                    이메일 문의
                                </h2>
                            </div>
                            <div style={{
                                padding: '30px',
                                backgroundColor: '#0f172a',
                                borderRadius: '12px',
                                border: '1px solid #334155',
                                textAlign: 'center'
                            }}>
                                <p style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '0.9rem' }}>
                                    문의 이메일
                                </p>
                                <a
                                    href="mailto:contact@kstockview.com"
                                    style={{
                                        fontSize: '1.3rem',
                                        color: '#60a5fa',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        display: 'inline-block',
                                        padding: '10px 20px',
                                        background: 'rgba(96, 165, 250, 0.1)',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(96, 165, 250, 0.2)';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(96, 165, 250, 0.1)';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    contact@kstockview.com
                                </a>
                            </div>
                        </section>

                        {/* Inquiry Types */}
                        <section style={{ marginBottom: '40px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '20px'
                            }}>
                                <MessageSquare size={24} color="#10b981" />
                                <h2 style={{
                                    color: '#e2e8f0',
                                    fontSize: '1.5rem',
                                    margin: 0
                                }}>
                                    문의 가능 내용
                                </h2>
                            </div>
                            <ul style={{
                                color: '#cbd5e1',
                                paddingLeft: '20px',
                                lineHeight: '2',
                                fontSize: '1rem'
                            }}>
                                <li>데이터 오류 신고</li>
                                <li>서비스 개선 제안</li>
                                <li>기술적 문제 보고</li>
                                <li>광고 및 제휴 문의</li>
                                <li>기타 문의사항</li>
                            </ul>
                        </section>

                        {/* Notice */}
                        <section>
                            <div style={{
                                padding: '20px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px'
                            }}>
                                <p style={{ color: '#fca5a5', margin: 0, fontSize: '0.9rem' }}>
                                    <strong>※ 주의사항:</strong> 개별 종목 추천이나 투자 상담은 제공하지 않습니다.
                                </p>
                            </div>
                        </section>

                        {/* Response Time */}
                        <section style={{ marginTop: '30px' }}>
                            <p style={{
                                color: '#94a3b8',
                                fontSize: '0.85rem',
                                textAlign: 'center',
                                margin: 0
                            }}>
                                보통 영업일 기준 1-3일 이내에 답변드립니다.
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

export default Contact;
