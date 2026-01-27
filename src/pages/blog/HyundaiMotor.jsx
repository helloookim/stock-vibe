import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, TrendingUp, BarChart3, Shield, ExternalLink, Car } from 'lucide-react';

const HyundaiMotor = () => {
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
                <title>현대자동차 주가 전망 및 재무분석 2025 | 전기차 전환 분석 - KStockView</title>
                <meta name="description" content="현대자동차(005380) 2025년 최신 재무제표 분석. 글로벌 완성차 3위 기업의 전기차 전환과 수익성 개선 현황을 상세히 알아봅니다." />
                <meta name="keywords" content="현대자동차, 005380, 현대차 주가, 현대차 전망, 아이오닉, 전기차, 완성차" />
                <meta property="og:title" content="현대자동차 주가 전망 및 재무분석 2025 | KStockView" />
                <meta property="og:description" content="현대자동차의 전기차 전환과 글로벌 시장 확대 전략을 분석합니다." />
                <meta property="og:type" content="article" />
                <link rel="canonical" href="https://kstockview.com/blog/hyundai-motor" />
            </Helmet>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
                color: '#e2e8f0',
                padding: isMobile ? '20px 15px 100px 15px' : '40px 20px 100px 20px'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                    {/* Back Button */}
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#60a5fa', textDecoration: 'none', marginBottom: '30px', fontSize: '0.9rem' }}>
                        <ArrowLeft size={18} />
                        홈으로 돌아가기
                    </Link>

                    {/* Header */}
                    <header style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', flexWrap: 'wrap' }}>
                            <span style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                                기업분석
                            </span>
                            <span style={{ background: '#1e3a5f', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#60a5fa' }}>
                                자동차 제조업
                            </span>
                            <span style={{ background: '#064e3b', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#10b981' }}>
                                글로벌 TOP 3
                            </span>
                        </div>
                        <h1 style={{
                            fontSize: isMobile ? '1.8rem' : '2.5rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: '10px',
                            lineHeight: '1.3'
                        }}>
                            현대자동차(005380) 주가 전망 및 재무분석
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                            최종 업데이트: 2025년 3분기 실적 반영 | KStockView 리서치팀
                        </p>
                    </header>

                    {/* Main Content */}
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
                                <strong style={{ color: '#3b82f6' }}>현대자동차</strong>는 기아와 함께 현대자동차그룹을 이끌며
                                <strong> 글로벌 완성차 판매량 3위</strong>를 기록하고 있는 대한민국 대표 자동차 기업입니다.
                                내연기관에서 전기차로의 대전환기를 맞아 아이오닉 시리즈와 제네시스 브랜드를 앞세워
                                프리미엄 시장 공략에 박차를 가하고 있습니다.
                            </p>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                본 페이지에서는 <strong>현대자동차 재무제표</strong>의 핵심 지표를 분석하고,
                                전기차 전환 전략, 수익성 개선 현황, 그리고 글로벌 시장에서의 경쟁력을 살펴봅니다.
                                자동차 산업은 원자재 가격, 환율, 판매 믹스 등 다양한 변수의 영향을 받기 때문에
                                재무제표를 통해 기업의 실질적인 체력을 파악하는 것이 중요합니다.
                            </p>
                            <p style={{ color: '#cbd5e1' }}>
                                특히 <strong>현대자동차 전망</strong>에서 주목할 점은 미국 조지아주 전기차 공장(메타플랜트)
                                가동과 인도, 유럽 시장에서의 성장세입니다. 실적 데이터를 통해 이러한 전략이
                                실제 매출과 이익에 어떻게 반영되고 있는지 확인해보겠습니다.
                            </p>
                        </section>

                        {/* ADVERTISEMENT SLOT 1 */}

                        {/* Section 1: Company Overview */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Car size={24} style={{ color: '#3b82f6' }} />
                                1. 기업 개요 및 글로벌 위상
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                현대자동차는 1967년 설립 이후 50여 년간 대한민국 자동차 산업을 이끌어왔습니다.
                                현재 현대자동차그룹(현대+기아)은 <strong style={{ color: '#3b82f6' }}>도요타, 폭스바겐에 이어 세계 3위</strong>의
                                자동차 그룹으로, 연간 약 700만 대 이상을 판매하고 있습니다.
                            </p>

                            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #334155' }}>
                                <h3 style={{ color: '#3b82f6', marginBottom: '15px', fontSize: '1.1rem' }}>
                                    주요 브랜드 및 차종
                                </h3>
                                <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: '20px' }}>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#e2e8f0' }}>현대:</strong> 아반떼, 쏘나타, 그랜저, 투싼, 싼타페, 팰리세이드
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#e2e8f0' }}>제네시스:</strong> G70, G80, G90, GV60, GV70, GV80
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#e2e8f0' }}>전기차:</strong> 아이오닉 5, 아이오닉 6, 아이오닉 9 (예정)
                                    </li>
                                    <li>
                                        <strong style={{ color: '#e2e8f0' }}>상용차:</strong> 포터, 스타렉스, 유니버스
                                    </li>
                                </ul>
                            </div>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                자동차 산업은 전기차 전환이라는 거대한 패러다임 전환기에 놓여 있습니다.
                                현대자동차는 전용 전기차 플랫폼 'E-GMP'를 기반으로 아이오닉 시리즈를 출시하며
                                테슬라, BYD 등과 경쟁하고 있습니다. 특히 디자인과 기술력을 인정받아
                                아이오닉 5는 '세계 올해의 차' 수상 등 글로벌 호평을 받았습니다.
                            </p>

                            <p style={{ color: '#cbd5e1' }}>
                                한편, 현대자동차는 내연기관 시장에서의 수익성도 잘 유지하고 있습니다.
                                북미 시장에서 SUV 및 픽업트럭 판매 호조와 함께 높은 판매 단가를 유지하며,
                                이는 안정적인 현금 창출의 기반이 되고 있습니다.
                            </p>
                        </section>

                        {/* Section 2: Financial Analysis */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <BarChart3 size={24} style={{ color: '#10b981' }} />
                                2. 재무제표 핵심 포인트
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                <strong>현대자동차 재무</strong> 데이터를 살펴보면, 최근 몇 년간 수익성이
                                크게 개선된 것을 확인할 수 있습니다. 품질 향상, 프리미엄 라인업 확대,
                                그리고 유리한 환율 효과가 실적 개선에 기여했습니다.
                            </p>

                            {/* Financial Summary Box */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)',
                                borderRadius: '16px',
                                padding: '25px',
                                marginBottom: '30px',
                                border: '1px solid #3b82f6'
                            }}>
                                <h3 style={{ color: '#3b82f6', marginBottom: '20px', fontSize: '1.2rem', textAlign: 'center' }}>
                                    2025년 3분기 주요 실적 (연결 기준)
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>매출액</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>46조 7,214억</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익</p>
                                        <p style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>2조 5,373억</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익률</p>
                                        <p style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>약 5.4%</p>
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>
                                매출액 및 수익성 분석
                            </h3>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                2025년 3분기 현대자동차는 매출액 <strong style={{ color: '#60a5fa' }}>46조 7,214억원</strong>,
                                영업이익 <strong style={{ color: '#10b981' }}>2조 5,373억원</strong>을 기록했습니다.
                                자동차 산업 특성상 영업이익률 5~7%는 양호한 수준으로 평가됩니다.
                            </p>
                            <p style={{ color: '#cbd5e1', marginBottom: '25px' }}>
                                현대자동차의 영업이익률은 과거 2~3% 수준에서 최근 5~7%대로 크게 개선되었습니다.
                                이는 고수익 SUV/픽업 트럭 판매 비중 확대, 제네시스 브랜드 성장,
                                그리고 품질 비용 감소 등이 복합적으로 작용한 결과입니다.
                            </p>

                            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #334155' }}>
                                <h4 style={{ color: '#f59e0b', marginBottom: '12px', fontSize: '1rem' }}>
                                    💡 자동차 기업의 수익성 이해하기
                                </h4>
                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                    자동차 산업은 대규모 설비 투자와 R&D 비용이 필요하며, 원자재 가격 변동에 민감합니다.
                                    일반적으로 완성차 업체의 영업이익률 5% 이상은 양호한 수준입니다.
                                    테슬라가 10% 이상의 이익률로 주목받는 이유이기도 합니다.
                                    현대차가 5~7%를 안정적으로 유지하는 것은 글로벌 경쟁력을 갖추었다는 의미입니다.
                                </p>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>
                                분기별 실적 추이
                            </h3>
                            <ul style={{ color: '#cbd5e1', paddingLeft: '20px', marginBottom: '20px' }}>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>2024 4Q:</strong> 매출 46.6조, 영업이익 2.8조 (이익률 6.1%)
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>2025 1Q:</strong> 매출 44.4조, 영업이익 3.6조 (이익률 8.2%)
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>2025 2Q:</strong> 매출 48.3조, 영업이익 3.6조 (이익률 7.5%)
                                </li>
                                <li>
                                    <strong>2025 3Q:</strong> 매출 46.7조, 영업이익 2.5조 (이익률 5.4%)
                                </li>
                            </ul>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                                * 3분기 이익률 하락은 계절적 요인과 신차 출시 비용 반영 영향
                            </p>
                        </section>

                        {/* ADVERTISEMENT SLOT 2 */}

                        {/* Section 3: Investment Risks */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Shield size={24} style={{ color: '#f59e0b' }} />
                                3. 투자 리스크 및 체크포인트
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                <strong>현대자동차 전망</strong>을 분석할 때 고려해야 할 리스크 요인들입니다.
                                자동차 산업은 거시경제와 밀접하게 연동되어 있어 외부 변수에 주의가 필요합니다.
                            </p>

                            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '25px', marginBottom: '25px', border: '1px solid #f59e0b' }}>
                                <h3 style={{ color: '#f59e0b', marginBottom: '20px', fontSize: '1.1rem' }}>주요 리스크 요인</h3>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>1. 전기차 경쟁 심화</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        테슬라, BYD 등과의 경쟁이 심화되고 있으며, 특히 중국 전기차 업체들의
                                        가격 경쟁력이 글로벌 시장에서 위협 요인이 되고 있습니다.
                                    </p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>2. 환율 변동 리스크</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        수출 비중이 높아 원/달러 환율에 민감합니다.
                                        원화 강세 시 수출 경쟁력과 수익성에 부정적 영향이 있을 수 있습니다.
                                    </p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>3. 원자재 가격 변동</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        철강, 알루미늄, 리튬 등 원자재 가격 상승은 원가 부담으로 직결됩니다.
                                        특히 전기차 배터리 원자재 가격 변동성에 노출되어 있습니다.
                                    </p>
                                </div>

                                <div>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>4. 노사 리스크</h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        강성 노조로 인한 파업 리스크와 인건비 상승 압력이
                                        지속적인 경영 리스크로 작용하고 있습니다.
                                    </p>
                                </div>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>긍정적 모멘텀</h3>
                            <ul style={{ color: '#cbd5e1', paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '10px' }}><strong>미국 공장 가동:</strong> 조지아 메타플랜트 전기차 생산으로 IRA 보조금 수혜</li>
                                <li style={{ marginBottom: '10px' }}><strong>인도 시장 확대:</strong> 인도 법인 IPO 추진, 신흥시장 성장 기대</li>
                                <li style={{ marginBottom: '10px' }}><strong>제네시스 성장:</strong> 프리미엄 브랜드로서 북미/유럽 시장 인지도 상승</li>
                                <li><strong>배당 확대:</strong> 주주환원 정책 강화로 배당 매력 증가</li>
                            </ul>
                        </section>

                        {/* CTA Section */}
                        <section style={{
                            background: 'linear-gradient(135deg, #1e3a5f 0%, #312e81 100%)',
                            borderRadius: '16px',
                            padding: '30px',
                            marginBottom: '40px',
                            textAlign: 'center',
                            border: '1px solid #3b82f6'
                        }}>
                            <h3 style={{ color: '#e2e8f0', fontSize: isMobile ? '1.2rem' : '1.4rem', marginBottom: '15px' }}>
                                더 자세한 현대자동차의 매출액 및 영업이익 차트를 확인하세요
                            </h3>
                            <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.95rem' }}>
                                2016년부터 현재까지의 분기별/연간 재무 데이터를 인터랙티브 차트로 확인하세요.
                                수익성 개선 추이와 함께 전기차 전환기의 실적 변화를 직접 분석해보세요.
                            </p>
                            <Link to="/stocks/005380" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                                color: '#fff', padding: '14px 32px', borderRadius: '12px',
                                textDecoration: 'none', fontWeight: '600', fontSize: '1.05rem',
                                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                            }}>
                                실시간 데이터 보러가기
                                <ExternalLink size={18} />
                            </Link>
                        </section>

                        {/* ADVERTISEMENT SLOT 3 */}

                        {/* Disclaimer */}
                        <div style={{ background: '#0f172a', borderRadius: '8px', padding: '20px', border: '1px solid #475569' }}>
                            <p className="disclaimer-text" style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, lineHeight: '1.7' }}>
                                ※ 본 페이지는 KStockView의 베타 서비스 기간 동안 제공되는 자동 생성 리포트입니다.
                                일부 내용은 일반적인 투자 정보를 포함하고 있으며, 실제 데이터와 차이가 있을 수 있습니다.
                                제공되는 정보는 투자 조언이 아니며, 모든 투자 결정 및 그 결과에 대한 책임은
                                투자자 본인에게 있습니다. 투자 전 반드시 공식 공시 자료를 확인하시기 바랍니다.
                            </p>
                        </div>
                    </article>

                    {/* Related Links */}
                    <div style={{ marginTop: '40px', padding: '30px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '20px' }}>관련 기업 분석</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <Link to="/stocks/000270" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>기아 (000270)</Link>
                            <Link to="/stocks/012330" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>현대모비스 (012330)</Link>
                            <Link to="/stocks/373220" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>LG에너지솔루션 (373220)</Link>
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

export default HyundaiMotor;
