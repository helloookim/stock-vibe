import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, TrendingUp, BarChart3, Shield, ExternalLink, Battery } from 'lucide-react';

const LGEnergySolution = () => {
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
                <title>LG에너지솔루션 주가 전망 및 재무분석 2025 | 2차전지 시장 분석 - KStockView</title>
                <meta name="description" content="LG에너지솔루션(373220) 2025년 최신 재무제표 분석. 글로벌 배터리 2위 기업의 전기차 배터리 사업과 ESS 시장 전망을 상세히 알아봅니다." />
                <meta name="keywords" content="LG에너지솔루션, 373220, LGES 주가, 2차전지, 배터리주, 전기차 배터리, ESS" />
                <meta property="og:title" content="LG에너지솔루션 주가 전망 및 재무분석 2025 | KStockView" />
                <meta property="og:description" content="LG에너지솔루션의 글로벌 배터리 시장 경쟁력과 수익성 개선 전망을 분석합니다." />
                <meta property="og:type" content="article" />
                <link rel="canonical" href="https://kstockview.com/blog/lg-energy-solution" />
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
                            <span style={{ background: '#1e3a5f', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#60a5fa' }}>2차전지 제조업</span>
                            <span style={{ background: '#064e3b', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#10b981' }}>글로벌 TOP 2</span>
                        </div>
                        <h1 style={{
                            fontSize: isMobile ? '1.8rem' : '2.5rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: '10px',
                            lineHeight: '1.3'
                        }}>
                            LG에너지솔루션(373220) 주가 전망 및 재무분석
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
                                <strong style={{ color: '#22c55e' }}>LG에너지솔루션</strong>은 전기차 배터리 시장에서
                                CATL에 이어 <strong>글로벌 2위</strong>를 차지하고 있는 대한민국 대표 2차전지 기업입니다.
                                테슬라, GM, 현대차그룹 등 글로벌 완성차 업체에 배터리를 공급하며,
                                ESS(에너지저장장치) 시장에서도 강력한 입지를 구축하고 있습니다.
                            </p>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                본 페이지에서는 <strong>LG에너지솔루션 재무제표</strong>의 핵심 지표를 분석하고,
                                전기차 시장 성장 둔화 우려 속에서의 수익성 개선 현황과 미래 성장 전략을 살펴봅니다.
                                2차전지 산업은 원자재 가격, 전기차 판매량, 기술 경쟁 등 다양한 변수의 영향을 받아
                                재무 실적의 변동성이 큰 편입니다.
                            </p>
                            <p style={{ color: '#cbd5e1' }}>
                                특히 <strong>LG에너지솔루션 전망</strong>에서 주목할 점은 북미 IRA(인플레이션 감축법) 수혜,
                                원통형 46시리즈 배터리 양산, 그리고 ESS 시장 확대입니다. 이러한 전략이 실제 매출과
                                이익에 어떻게 반영되고 있는지 데이터로 확인해보겠습니다.
                            </p>
                        </section>

                        {/* ADVERTISEMENT SLOT 1 */}

                        {/* Section 1 */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Battery size={24} style={{ color: '#22c55e' }} />
                                1. 기업 개요 및 배터리 시장 위상
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                LG에너지솔루션은 2020년 LG화학에서 배터리 사업부가 물적분할되어 설립되었으며,
                                2022년 코스피에 상장했습니다. 상장 당시 시가총액 약 118조원으로
                                <strong style={{ color: '#22c55e' }}> 국내 IPO 역대 최대 규모</strong>를 기록하며
                                시장의 높은 관심을 받았습니다.
                            </p>

                            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #334155' }}>
                                <h3 style={{ color: '#22c55e', marginBottom: '15px', fontSize: '1.1rem' }}>주요 사업 영역</h3>
                                <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: '20px' }}>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#e2e8f0' }}>EV 배터리:</strong> 전기차용 파우치/원통형 배터리 (테슬라, GM, 현대 등 공급)</li>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#e2e8f0' }}>ESS:</strong> 에너지저장시스템용 대용량 배터리 (전력 그리드, 가정용)</li>
                                    <li><strong style={{ color: '#e2e8f0' }}>소형전지:</strong> IT기기, 전동공구용 배터리</li>
                                </ul>
                            </div>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                글로벌 배터리 시장에서 LG에너지솔루션은 CATL(중국)에 이어 <strong style={{ color: '#22c55e' }}>점유율 2위</strong>를
                                유지하고 있습니다. 특히 비중국 시장(유럽, 북미)에서는 CATL과 경쟁하며 높은 점유율을 확보하고 있어,
                                미중 갈등 속에서 수혜를 받을 수 있는 위치에 있습니다.
                            </p>

                            <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)', borderRadius: '12px', padding: '25px', marginBottom: '25px', border: '1px solid #22c55e' }}>
                                <h3 style={{ color: '#22c55e', marginBottom: '15px', fontSize: '1.1rem' }}>글로벌 생산 거점</h3>
                                <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: '20px' }}>
                                    <li style={{ marginBottom: '8px' }}><strong style={{ color: '#e2e8f0' }}>한국:</strong> 오창, 대전</li>
                                    <li style={{ marginBottom: '8px' }}><strong style={{ color: '#e2e8f0' }}>미국:</strong> 미시간(GM JV), 오하이오(Honda JV), 애리조나</li>
                                    <li style={{ marginBottom: '8px' }}><strong style={{ color: '#e2e8f0' }}>유럽:</strong> 폴란드</li>
                                    <li><strong style={{ color: '#e2e8f0' }}>중국:</strong> 난징</li>
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
                                <strong>LG에너지솔루션 재무</strong> 데이터를 살펴보면, 2024년 적자 전환 후
                                2025년 들어 수익성이 회복되고 있습니다. 원자재 가격 안정화와 북미 IRA 세액공제 반영이
                                실적 개선에 기여하고 있습니다.
                            </p>

                            <div style={{
                                background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)',
                                borderRadius: '16px',
                                padding: '25px',
                                marginBottom: '30px',
                                border: '1px solid #22c55e'
                            }}>
                                <h3 style={{ color: '#22c55e', marginBottom: '20px', fontSize: '1.2rem', textAlign: 'center' }}>
                                    2025년 3분기 주요 실적 (연결 기준)
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>매출액</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>5조 6,999억</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익</p>
                                        <p style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>6,013억</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익률</p>
                                        <p style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>약 10.5%</p>
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>실적 턴어라운드</h3>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                2024년 4분기 <strong style={{ color: '#ef4444' }}>-2,255억원</strong>의 영업적자를 기록했던
                                LG에너지솔루션은 2025년 들어 흑자 전환에 성공했습니다. 3분기에는 영업이익
                                <strong style={{ color: '#10b981' }}> 6,013억원</strong>을 기록하며 영업이익률이
                                <strong style={{ color: '#8b5cf6' }}> 10%대</strong>를 회복했습니다.
                            </p>

                            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #334155' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #334155' }}>
                                            <th style={{ color: '#94a3b8', padding: '10px', textAlign: 'left' }}>분기</th>
                                            <th style={{ color: '#94a3b8', padding: '10px', textAlign: 'right' }}>매출액</th>
                                            <th style={{ color: '#94a3b8', padding: '10px', textAlign: 'right' }}>영업이익</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ color: '#e2e8f0', padding: '10px' }}>2024 4Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right' }}>6.5조</td>
                                            <td style={{ color: '#ef4444', padding: '10px', textAlign: 'right' }}>-2,255억</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ color: '#e2e8f0', padding: '10px' }}>2025 1Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right' }}>6.3조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right' }}>3,747억</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ color: '#e2e8f0', padding: '10px' }}>2025 2Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right' }}>5.6조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right' }}>4,922억</td>
                                        </tr>
                                        <tr>
                                            <td style={{ color: '#e2e8f0', padding: '10px', fontWeight: '600' }}>2025 3Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right', fontWeight: '600' }}>5.7조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right', fontWeight: '600' }}>6,013억</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #334155' }}>
                                <h4 style={{ color: '#f59e0b', marginBottom: '12px', fontSize: '1rem' }}>💡 IRA 효과 이해하기</h4>
                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                    미국 인플레이션 감축법(IRA)에 따라 북미에서 생산되는 배터리에 대해 세액공제 혜택이 제공됩니다.
                                    LG에너지솔루션은 북미 생산 확대와 함께 IRA 세액공제를 영업이익에 반영하고 있어,
                                    실질적인 수익성 개선에 크게 기여하고 있습니다.
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
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>1. 전기차 수요 둔화</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        글로벌 전기차 판매 성장률이 둔화되고 있으며, 일부 완성차 업체들이 전기차 계획을 수정하고 있습니다.
                                        배터리 수요 전망 하향 조정 가능성이 있습니다.
                                    </p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>2. 중국 업체와의 경쟁</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        CATL, BYD 등 중국 배터리 업체들의 가격 경쟁력이 강화되고 있으며,
                                        LFP 배터리 확산으로 기술 경쟁 구도가 변화하고 있습니다.
                                    </p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>3. 원자재 가격 변동</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        리튬, 니켈, 코발트 등 핵심 원자재 가격 변동이 마진에 직접 영향을 미칩니다.
                                        최근 원자재 가격 하락이 오히려 재고평가손실로 이어질 수 있습니다.
                                    </p>
                                </div>

                                <div>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>4. IRA 정책 변동 리스크</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        미국 정권 교체에 따라 IRA 정책이 수정될 가능성이 있으며,
                                        이는 북미 사업 수익성에 영향을 미칠 수 있습니다.
                                    </p>
                                </div>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>긍정적 모멘텀</h3>
                            <ul style={{ color: '#cbd5e1', paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '10px' }}><strong>46시리즈 양산:</strong> 테슬라향 대형 원통형 배터리로 신규 매출 확대</li>
                                <li style={{ marginBottom: '10px' }}><strong>ESS 성장:</strong> 신재생에너지 확대로 ESS 수요 급증</li>
                                <li style={{ marginBottom: '10px' }}><strong>기술 혁신:</strong> 전고체 배터리 등 차세대 기술 개발 진행</li>
                                <li><strong>북미 확장:</strong> GM, Honda, 현대차 JV 공장 본격 가동</li>
                            </ul>
                        </section>

                        {/* CTA Section */}
                        <section style={{
                            background: 'linear-gradient(135deg, #064e3b 0%, #312e81 100%)',
                            borderRadius: '16px', padding: '30px', marginBottom: '40px',
                            textAlign: 'center', border: '1px solid #22c55e'
                        }}>
                            <h3 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.2rem' : '1.4rem', marginBottom: '15px' }}>
                                더 자세한 LG에너지솔루션의 매출액 및 영업이익 차트를 확인하세요
                            </h3>
                            <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.95rem' }}>
                                상장 이후 분기별 재무 데이터를 인터랙티브 차트로 확인하세요.
                                배터리 산업 사이클과 함께 변화하는 실적 추이를 직접 분석해보세요.
                            </p>
                            <Link to="/stocks/373220" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)',
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
                                제공되는 정보는 투자 조언이 아니며, 모든 투자 결정 및 그 결과에 대한 책임은
                                투자자 본인에게 있습니다.
                            </p>
                        </div>
                    </article>

                    <div style={{ marginTop: '40px', padding: '30px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '20px' }}>관련 기업 분석</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <Link to="/stocks/006400" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>삼성SDI (006400)</Link>
                            <Link to="/stocks/051910" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>LG화학 (051910)</Link>
                            <Link to="/stocks/005380" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>현대자동차 (005380)</Link>
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

export default LGEnergySolution;
