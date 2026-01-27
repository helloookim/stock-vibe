import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, TrendingUp, BarChart3, Shield, ExternalLink, Car } from 'lucide-react';

const Kia = () => {
    React.useEffect(() => {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        return () => {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        };
    }, []);

    const isMobile = window.innerWidth <= 768;

    return (
        <>
            <Helmet>
                <title>기아 주가 전망 및 재무분석 2025 | 전기차·SUV 글로벌 강자 - KStockView</title>
                <meta name="description" content="기아(000270) 2025년 최신 재무제표 분석. EV6, EV9 등 전기차 라인업과 글로벌 SUV 시장에서의 성장 전략을 상세히 알아봅니다." />
                <meta name="keywords" content="기아, 000270, 기아 주가, 기아 전망, EV6, EV9, 전기차, SUV" />
                <meta property="og:title" content="기아 주가 전망 및 재무분석 2025 | KStockView" />
                <meta property="og:description" content="기아의 전기차 전환과 글로벌 시장 확대 전략을 분석합니다." />
                <meta property="og:type" content="article" />
                <link rel="canonical" href="https://kstockview.com/blog/kia" />
            </Helmet>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
                color: '#e2e8f0',
                padding: isMobile ? '20px 15px 100px 15px' : '40px 20px 100px 20px'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#60a5fa', textDecoration: 'none', marginBottom: '30px', fontSize: '0.9rem' }}>
                        <ArrowLeft size={18} />
                        홈으로 돌아가기
                    </Link>

                    <header style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', flexWrap: 'wrap' }}>
                            <span style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>기업분석</span>
                            <span style={{ background: '#1e3a5f', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#60a5fa' }}>자동차 제조업</span>
                            <span style={{ background: '#064e3b', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#10b981' }}>현대차그룹</span>
                        </div>
                        <h1 style={{
                            fontSize: isMobile ? '1.8rem' : '2.5rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: '10px',
                            lineHeight: '1.3'
                        }}>
                            기아(000270) 주가 전망 및 재무분석
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                            최종 업데이트: 2025년 3분기 실적 반영 | KStockView 리서치팀
                        </p>
                    </header>

                    <article style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: isMobile ? '20px' : '40px',
                        lineHeight: '1.9',
                        fontSize: isMobile ? '0.95rem' : '1.05rem'
                    }}>
                        {/* Introduction */}
                        <section style={{ marginBottom: '45px' }}>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                <strong style={{ color: '#ef4444' }}>기아</strong>는 현대자동차그룹의 핵심 계열사로,
                                글로벌 완성차 시장에서 독자적인 브랜드 아이덴티티를 구축하며 빠르게 성장하고 있습니다.
                                특히 <strong>디자인 혁신</strong>과 <strong>전기차 EV 시리즈</strong>로 글로벌 시장에서
                                높은 호평을 받으며 브랜드 가치를 끌어올리고 있습니다.
                            </p>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                본 페이지에서는 <strong>기아 재무제표</strong>의 핵심 지표를 분석하고,
                                SUV 중심의 제품 믹스 전략과 전기차 전환 현황을 살펴봅니다.
                                기아는 현대차와 함께 전용 전기차 플랫폼 E-GMP를 활용하면서도
                                차별화된 디자인과 포지셔닝으로 시장을 공략하고 있습니다.
                            </p>
                            <p style={{ color: '#cbd5e1' }}>
                                <strong>기아 전망</strong>에서 주목할 점은 EV6, EV9의 글로벌 판매 호조와
                                북미 시장에서의 SUV 인기입니다. 특히 텔루라이드, 스포티지 등 SUV 라인업이
                                높은 수익성을 견인하며 영업이익률 개선에 기여하고 있습니다.
                            </p>
                        </section>

                        {/* ADVERTISEMENT SLOT 1 */}

                        {/* Section 1 */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Car size={24} style={{ color: '#ef4444' }} />
                                1. 기업 개요 및 브랜드 혁신
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                기아는 1944년 설립되어 80년의 역사를 가진 대한민국 대표 자동차 기업입니다.
                                2021년 사명에서 '자동차'를 뺀 '기아(Kia)'로 리브랜딩하며
                                <strong style={{ color: '#ef4444' }}> 모빌리티 기업으로의 전환</strong>을 선언했습니다.
                                새로운 로고와 디자인 언어는 글로벌 시장에서 큰 호응을 얻고 있습니다.
                            </p>

                            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #334155' }}>
                                <h3 style={{ color: '#ef4444', marginBottom: '15px', fontSize: '1.1rem' }}>주요 차종 라인업</h3>
                                <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: '20px' }}>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#e2e8f0' }}>SUV:</strong> 텔루라이드, 쏘렌토, 스포티지, 니로, 셀토스</li>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#e2e8f0' }}>세단:</strong> K8, K5, K3, 스팅어</li>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#e2e8f0' }}>전기차:</strong> EV6, EV9, EV3, 니로 EV</li>
                                    <li><strong style={{ color: '#e2e8f0' }}>상용/MPV:</strong> 카니발, 봉고</li>
                                </ul>
                            </div>

                            <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #0f172a 100%)', borderRadius: '12px', padding: '25px', marginBottom: '25px', border: '1px solid #ef4444' }}>
                                <h3 style={{ color: '#ef4444', marginBottom: '15px', fontSize: '1.1rem' }}>기아 브랜드 혁신의 성과</h3>
                                <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: '20px', fontSize: '0.95rem' }}>
                                    <li style={{ marginBottom: '8px' }}>EV6: 2022 유럽 올해의 차, 2023 북미 올해의 유틸리티 차량</li>
                                    <li style={{ marginBottom: '8px' }}>EV9: 2024 북미 올해의 유틸리티 차량 (2년 연속)</li>
                                    <li>글로벌 브랜드 가치 상승: 인터브랜드 글로벌 100대 브랜드 진입</li>
                                </ul>
                            </div>

                            <p style={{ color: '#cbd5e1' }}>
                                기아는 현대차와 플랫폼, 기술을 공유하면서도 <strong>독자적인 디자인 철학</strong>으로
                                차별화에 성공했습니다. 특히 '오퍼짓 유나이티드(Opposites United)' 디자인 언어를 통해
                                젊고 역동적인 브랜드 이미지를 구축하며, MZ세대를 중심으로 인기를 얻고 있습니다.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <BarChart3 size={24} style={{ color: '#10b981' }} />
                                2. 재무제표 핵심 포인트
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                <strong>기아 재무</strong> 데이터를 살펴보면, 최근 수익성이 크게 개선되었습니다.
                                SUV 중심의 고수익 제품 믹스와 북미 시장 호조가 실적 개선을 견인하고 있으며,
                                영업이익률은 업계 최고 수준을 기록하고 있습니다.
                            </p>

                            <div style={{
                                background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)',
                                borderRadius: '16px', padding: '25px', marginBottom: '30px',
                                border: '1px solid #ef4444'
                            }}>
                                <h3 style={{ color: '#ef4444', marginBottom: '20px', fontSize: '1.2rem', textAlign: 'center' }}>
                                    2025년 3분기 주요 실적 (연결 기준)
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>매출액</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>28조 6,860억</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익</p>
                                        <p style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>1조 4,623억</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익률</p>
                                        <p style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>약 5.1%</p>
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>분기별 실적 추이</h3>
                            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #334155' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #334155' }}>
                                            <th style={{ color: '#94a3b8', padding: '10px', textAlign: 'left' }}>분기</th>
                                            <th style={{ color: '#94a3b8', padding: '10px', textAlign: 'right' }}>매출액</th>
                                            <th style={{ color: '#94a3b8', padding: '10px', textAlign: 'right' }}>영업이익</th>
                                            <th style={{ color: '#94a3b8', padding: '10px', textAlign: 'right' }}>이익률</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ color: '#e2e8f0', padding: '10px' }}>2024 4Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right' }}>27.1조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right' }}>2.7조</td>
                                            <td style={{ color: '#8b5cf6', padding: '10px', textAlign: 'right' }}>10.0%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ color: '#e2e8f0', padding: '10px' }}>2025 1Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right' }}>28.0조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right' }}>3.0조</td>
                                            <td style={{ color: '#8b5cf6', padding: '10px', textAlign: 'right' }}>10.7%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ color: '#e2e8f0', padding: '10px' }}>2025 2Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right' }}>29.3조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right' }}>2.8조</td>
                                            <td style={{ color: '#8b5cf6', padding: '10px', textAlign: 'right' }}>9.4%</td>
                                        </tr>
                                        <tr>
                                            <td style={{ color: '#e2e8f0', padding: '10px', fontWeight: '600' }}>2025 3Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right', fontWeight: '600' }}>28.7조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right', fontWeight: '600' }}>1.5조</td>
                                            <td style={{ color: '#8b5cf6', padding: '10px', textAlign: 'right', fontWeight: '600' }}>5.1%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #334155' }}>
                                <h4 style={{ color: '#f59e0b', marginBottom: '12px', fontSize: '1rem' }}>💡 기아 vs 현대차 수익성 비교</h4>
                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                    기아는 현대차보다 높은 영업이익률을 기록하는 경우가 많습니다.
                                    이는 SUV 비중이 더 높고, 북미 시장에서 텔루라이드 등 고수익 모델의 판매가
                                    호조를 보이기 때문입니다. 자동차 업계에서 10%대 영업이익률은 최상위 수준입니다.
                                </p>
                            </div>
                        </section>

                        {/* ADVERTISEMENT SLOT 2 */}

                        {/* Section 3 */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Shield size={24} style={{ color: '#f59e0b' }} />
                                3. 투자 리스크 및 체크포인트
                            </h2>

                            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '25px', marginBottom: '25px', border: '1px solid #f59e0b' }}>
                                <h3 style={{ color: '#f59e0b', marginBottom: '20px', fontSize: '1.1rem' }}>주요 리스크 요인</h3>
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>1. 전기차 경쟁 심화</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>테슬라, BYD 등과의 전기차 경쟁이 심화되고 있으며, 가격 경쟁 압박이 증가하고 있습니다.</p>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>2. 환율 변동</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>수출 비중이 높아 원/달러 환율 변동에 실적이 영향받습니다.</p>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>3. 현대차그룹 의존도</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>플랫폼, 기술, 부품을 현대차와 공유하여 그룹 리스크에 함께 노출됩니다.</p>
                                </div>
                                <div>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>4. 노사 리스크</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>강성 노조로 인한 파업 가능성과 인건비 상승 압력이 있습니다.</p>
                                </div>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>긍정적 모멘텀</h3>
                            <ul style={{ color: '#cbd5e1', paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '10px' }}><strong>디자인 경쟁력:</strong> 글로벌 디자인 어워드 수상으로 브랜드 가치 상승</li>
                                <li style={{ marginBottom: '10px' }}><strong>북미 시장 호조:</strong> SUV 라인업 인기로 높은 수익성 유지</li>
                                <li style={{ marginBottom: '10px' }}><strong>전기차 확대:</strong> EV3, EV4 등 보급형 전기차 출시 예정</li>
                                <li><strong>인도 시장:</strong> 인도 법인 IPO 추진으로 성장 모멘텀 확보</li>
                            </ul>
                        </section>

                        {/* CTA Section */}
                        <section style={{
                            background: 'linear-gradient(135deg, #7f1d1d 0%, #312e81 100%)',
                            borderRadius: '16px', padding: '30px', marginBottom: '40px',
                            textAlign: 'center', border: '1px solid #ef4444'
                        }}>
                            <h3 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.2rem' : '1.4rem', marginBottom: '15px' }}>
                                더 자세한 기아의 매출액 및 영업이익 차트를 확인하세요
                            </h3>
                            <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.95rem' }}>
                                분기별/연간 재무 데이터를 인터랙티브 차트로 확인하세요.
                            </p>
                            <Link to="/000270" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                                color: '#fff', padding: '14px 32px', borderRadius: '12px',
                                textDecoration: 'none', fontWeight: '600', fontSize: '1.05rem',
                                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                            }}>
                                실시간 데이터 보러가기
                                <ExternalLink size={18} />
                            </Link>
                        </section>

                        {/* ADVERTISEMENT SLOT 3 */}

                        <div style={{ background: '#0f172a', borderRadius: '8px', padding: '20px', border: '1px solid #475569' }}>
                            <p className="disclaimer-text" style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, lineHeight: '1.7' }}>
                                ※ 본 페이지는 KStockView의 베타 서비스 기간 동안 제공되는 자동 생성 리포트입니다.
                                일부 내용은 일반적인 투자 정보를 포함하고 있으며, 실제 데이터와 차이가 있을 수 있습니다.
                            </p>
                        </div>
                    </article>

                    <div style={{ marginTop: '40px', padding: '30px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '20px' }}>관련 기업 분석</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <Link to="/005380" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>현대자동차 (005380)</Link>
                            <Link to="/012330" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>현대모비스 (012330)</Link>
                            <Link to="/373220" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>LG에너지솔루션 (373220)</Link>
                        </div>
                    </div>

                    <footer style={{ marginTop: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                        <p>© 2026 KSTOCKVIEW. All rights reserved.</p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default Kia;
