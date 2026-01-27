import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, TrendingUp, BarChart3, Shield, ExternalLink, Search } from 'lucide-react';

const Naver = () => {
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
                <title>NAVER 주가 전망 및 재무분석 2025 | AI·검색·커머스 플랫폼 - KStockView</title>
                <meta name="description" content="NAVER(035420) 2025년 최신 재무제표 분석. 하이퍼클로바X AI, 검색광고, 커머스 사업의 성장성과 수익성을 상세히 알아봅니다." />
                <meta name="keywords" content="네이버, NAVER, 035420, 네이버 주가, 네이버 전망, 하이퍼클로바, AI, 검색" />
                <meta property="og:title" content="NAVER 주가 전망 및 재무분석 2025 | KStockView" />
                <meta property="og:description" content="NAVER의 AI 전환과 플랫폼 성장 전략을 분석합니다." />
                <meta property="og:type" content="article" />
                <link rel="canonical" href="https://kstockview.com/blog/naver" />
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
                            <span style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>기업분석</span>
                            <span style={{ background: '#1e3a5f', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#60a5fa' }}>인터넷 플랫폼</span>
                            <span style={{ background: '#064e3b', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#10b981' }}>AI 선도기업</span>
                        </div>
                        <h1 style={{
                            fontSize: isMobile ? '1.8rem' : '2.5rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: '10px',
                            lineHeight: '1.3'
                        }}>
                            NAVER(035420) 주가 전망 및 재무분석
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
                                <strong style={{ color: '#22c55e' }}>NAVER</strong>는 대한민국 최대 검색 포털이자
                                AI, 클라우드, 커머스, 핀테크, 콘텐츠를 아우르는 <strong>종합 플랫폼 기업</strong>입니다.
                                국내 검색 시장 점유율 1위를 바탕으로 안정적인 광고 수익을 창출하면서,
                                하이퍼클로바X를 통해 AI 시대의 선도 기업으로 도약하고 있습니다.
                            </p>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                본 페이지에서는 <strong>NAVER 재무제표</strong>의 핵심 지표를 분석하고,
                                검색광고, 커머스, 핀테크, 콘텐츠, 클라우드 등 다양한 사업 부문의
                                성장성과 수익성을 살펴봅니다.
                            </p>
                            <p style={{ color: '#cbd5e1' }}>
                                <strong>NAVER 전망</strong>에서 주목할 점은 AI 검색 전환, 스마트스토어와
                                네이버쇼핑의 성장, 일본 라인야후 지분 매각 이슈 등입니다.
                                글로벌 빅테크와의 AI 경쟁 속에서 네이버의 전략을 분석해보겠습니다.
                            </p>
                        </section>

                        {/* ADVERTISEMENT SLOT 1 */}

                        {/* Section 1 */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Search size={24} style={{ color: '#22c55e' }} />
                                1. 기업 개요 및 사업 포트폴리오
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                NAVER는 1999년 설립되어 한국 인터넷 산업의 성장과 함께 발전해온 기업입니다.
                                검색 포털에서 시작하여 현재는 <strong style={{ color: '#22c55e' }}>검색, 커머스, 핀테크,
                                콘텐츠, 클라우드, AI</strong>를 아우르는 거대 플랫폼 기업으로 성장했습니다.
                            </p>

                            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #334155' }}>
                                <h3 style={{ color: '#22c55e', marginBottom: '15px', fontSize: '1.1rem' }}>주요 사업 부문</h3>
                                <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: '20px' }}>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#e2e8f0' }}>서치플랫폼:</strong> 검색광고, 디스플레이 광고 (네이버 검색, 뉴스, 블로그)</li>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#e2e8f0' }}>커머스:</strong> 스마트스토어, 네이버쇼핑, 브랜드스토어</li>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#e2e8f0' }}>핀테크:</strong> 네이버페이, 네이버파이낸셜</li>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#e2e8f0' }}>콘텐츠:</strong> 네이버웹툰, V LIVE, 스노우</li>
                                    <li><strong style={{ color: '#e2e8f0' }}>클라우드:</strong> 네이버클라우드, AI (하이퍼클로바X)</li>
                                </ul>
                            </div>

                            <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)', borderRadius: '12px', padding: '25px', marginBottom: '25px', border: '1px solid #22c55e' }}>
                                <h3 style={{ color: '#22c55e', marginBottom: '15px', fontSize: '1.1rem' }}>하이퍼클로바X: 네이버의 AI 전략</h3>
                                <p style={{ color: '#cbd5e1', marginBottom: '15px', fontSize: '0.95rem' }}>
                                    하이퍼클로바X는 네이버가 자체 개발한 초거대 AI 모델로, 한국어에 특화되어 있습니다.
                                    네이버 검색, 쇼핑, 클라우드 등 전 사업에 AI를 접목시키는 전략을 추진 중입니다.
                                </p>
                                <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: '20px', fontSize: '0.95rem' }}>
                                    <li style={{ marginBottom: '8px' }}>네이버 큐(Cue): AI 검색 서비스</li>
                                    <li style={{ marginBottom: '8px' }}>클로바 스튜디오: 기업용 AI 솔루션</li>
                                    <li>AI 기반 쇼핑 추천, 광고 최적화</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <BarChart3 size={24} style={{ color: '#10b981' }} />
                                2. 재무제표 핵심 포인트
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                <strong>NAVER 재무</strong> 데이터를 살펴보면, 안정적인 검색광고 수익을 기반으로
                                커머스와 핀테크 사업이 성장하고 있습니다. 높은 영업이익률은 플랫폼 비즈니스의
                                특성을 반영합니다.
                            </p>

                            <div style={{
                                background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)',
                                borderRadius: '16px', padding: '25px', marginBottom: '30px',
                                border: '1px solid #22c55e'
                            }}>
                                <h3 style={{ color: '#22c55e', marginBottom: '20px', fontSize: '1.2rem', textAlign: 'center' }}>
                                    2025년 3분기 주요 실적 (연결 기준)
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>매출액</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>3조 1,381억</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익</p>
                                        <p style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>5,706억</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익률</p>
                                        <p style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>약 18.2%</p>
                                    </div>
                                </div>
                            </div>

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
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right' }}>2.89조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right' }}>5,420억</td>
                                            <td style={{ color: '#8b5cf6', padding: '10px', textAlign: 'right' }}>18.8%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ color: '#e2e8f0', padding: '10px' }}>2025 1Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right' }}>2.79조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right' }}>5,053억</td>
                                            <td style={{ color: '#8b5cf6', padding: '10px', textAlign: 'right' }}>18.1%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ color: '#e2e8f0', padding: '10px' }}>2025 2Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right' }}>2.92조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right' }}>5,216억</td>
                                            <td style={{ color: '#8b5cf6', padding: '10px', textAlign: 'right' }}>17.9%</td>
                                        </tr>
                                        <tr>
                                            <td style={{ color: '#e2e8f0', padding: '10px', fontWeight: '600' }}>2025 3Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right', fontWeight: '600' }}>3.14조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right', fontWeight: '600' }}>5,706억</td>
                                            <td style={{ color: '#8b5cf6', padding: '10px', textAlign: 'right', fontWeight: '600' }}>18.2%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #334155' }}>
                                <h4 style={{ color: '#f59e0b', marginBottom: '12px', fontSize: '1rem' }}>💡 플랫폼 기업의 수익 구조</h4>
                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                    네이버와 같은 플랫폼 기업은 한계비용이 낮아 규모가 커질수록 수익성이 높아집니다.
                                    18%대 영업이익률은 국내 인터넷 기업 중 최상위 수준이며,
                                    검색광고의 안정적인 수익이 이를 뒷받침하고 있습니다.
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
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>1. AI 검색 경쟁</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>구글, OpenAI 등 글로벌 빅테크와의 AI 검색 경쟁이 심화되고 있습니다.</p>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>2. 라인야후 이슈</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>일본 정부의 압박으로 라인야후 지분 매각 가능성이 있으며, 이는 기업 가치에 영향을 미칠 수 있습니다.</p>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>3. 광고 시장 경기 민감도</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>검색광고 매출은 경기 변동에 민감하며, 경기 침체 시 광고주 지출이 감소할 수 있습니다.</p>
                                </div>
                                <div>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>4. 커머스 경쟁 심화</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>쿠팡, 11번가 등과의 이커머스 경쟁이 심화되고 있습니다.</p>
                                </div>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>긍정적 모멘텀</h3>
                            <ul style={{ color: '#cbd5e1', paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '10px' }}><strong>AI 전환:</strong> 하이퍼클로바X 기반 서비스 확대</li>
                                <li style={{ marginBottom: '10px' }}><strong>커머스 성장:</strong> 스마트스토어 거래액 지속 증가</li>
                                <li style={{ marginBottom: '10px' }}><strong>웹툰 글로벌화:</strong> 네이버웹툰 해외 성장</li>
                                <li><strong>클라우드 확대:</strong> 네이버클라우드 B2B 사업 성장</li>
                            </ul>
                        </section>

                        {/* CTA Section */}
                        <section style={{
                            background: 'linear-gradient(135deg, #064e3b 0%, #312e81 100%)',
                            borderRadius: '16px', padding: '30px', marginBottom: '40px',
                            textAlign: 'center', border: '1px solid #22c55e'
                        }}>
                            <h3 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.2rem' : '1.4rem', marginBottom: '15px' }}>
                                더 자세한 NAVER의 매출액 및 영업이익 차트를 확인하세요
                            </h3>
                            <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.95rem' }}>
                                분기별/연간 재무 데이터를 인터랙티브 차트로 확인하세요.
                            </p>
                            <Link to="/035420" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                                color: '#fff', padding: '14px 32px', borderRadius: '12px',
                                textDecoration: 'none', fontWeight: '600', fontSize: '1.05rem',
                                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
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
                            <Link to="/035720" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>카카오 (035720)</Link>
                            <Link to="/259960" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>크래프톤 (259960)</Link>
                            <Link to="/036570" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>엔씨소프트 (036570)</Link>
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

export default Naver;
