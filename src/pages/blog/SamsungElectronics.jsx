import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, TrendingUp, BarChart3, Shield, ExternalLink } from 'lucide-react';

const SamsungElectronics = () => {
    // Override body overflow for this page
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
                <title>삼성전자 주가 전망 및 재무분석 2025 | 매출액, 영업이익 추이 - KStockView</title>
                <meta name="description" content="삼성전자(005930) 2025년 최신 재무제표 분석. 분기별 매출액, 영업이익, 영업이익률 추이와 반도체 산업 전망을 상세히 알아봅니다." />
                <meta name="keywords" content="삼성전자, 005930, 삼성전자 주가, 삼성전자 전망, 삼성전자 재무제표, 삼성전자 영업이익, 반도체 주식" />
                <meta property="og:title" content="삼성전자 주가 전망 및 재무분석 2025 | KStockView" />
                <meta property="og:description" content="삼성전자의 분기별 매출액, 영업이익 추이와 반도체 산업 전망을 분석합니다." />
                <meta property="og:type" content="article" />
                <link rel="canonical" href="https://kstockview.com/blog/samsung-electronics" />
            </Helmet>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
                color: '#e2e8f0',
                padding: isMobile ? '20px 15px 100px 15px' : '40px 20px 100px 20px'
            }}>
                <div style={{
                    maxWidth: '900px',
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
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '15px',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}>
                                기업분석
                            </span>
                            <span style={{
                                background: '#1e3a5f',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                color: '#60a5fa'
                            }}>
                                통신 및 방송장비 제조업
                            </span>
                        </div>
                        <h1 style={{
                            fontSize: isMobile ? '1.8rem' : '2.5rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: '10px',
                            lineHeight: '1.3'
                        }}>
                            삼성전자(005930) 주가 전망 및 재무분석
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
                                <strong style={{ color: '#60a5fa' }}>삼성전자</strong>의 주가 흐름과 재무 건전성을 분석하는 것은
                                대한민국 주식 투자에 있어 필수적인 과정입니다. 국내 시가총액 1위 기업이자 글로벌 반도체 및
                                가전 산업의 핵심 플레이어로서, 삼성전자의 실적은 한국 증시 전체의 방향성을 가늠하는 바로미터
                                역할을 합니다.
                            </p>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                본 페이지에서는 <strong>삼성전자 재무제표</strong>의 핵심 지표를 심층 분석하고,
                                분기별 매출액 및 영업이익 추이를 통해 기업의 성장성과 수익성을 객관적으로 평가해보겠습니다.
                                투자 판단에 앞서 재무제표를 읽는 방법과 주요 체크포인트를 함께 살펴보시기 바랍니다.
                            </p>
                            <p style={{ color: '#cbd5e1' }}>
                                특히 최근 AI 반도체 시장의 급성장과 함께 <strong>삼성전자 전망</strong>에 대한
                                관심이 높아지고 있어, 이러한 거시적 트렌드가 실제 재무 성과에 어떻게 반영되고 있는지
                                데이터를 기반으로 확인해보는 것이 중요합니다.
                            </p>
                        </section>

                        {/* Ad Slot 1 */}
                        {/* ADVERTISEMENT SLOT 1 */}

                        {/* Section 1: Company Overview */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{
                                color: '#e2e8f0',
                                fontSize: isMobile ? '1.3rem' : '1.6rem',
                                marginBottom: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <TrendingUp size={24} style={{ color: '#60a5fa' }} />
                                1. 기업 개요 및 시장 위치
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                삼성전자는 1969년 설립 이후 반세기가 넘는 시간 동안 대한민국 산업 발전의 중심에 있었습니다.
                                현재 <strong style={{ color: '#60a5fa' }}>메모리 반도체 분야 세계 1위</strong>,
                                스마트폰 출하량 세계 1~2위, TV 판매량 세계 1위 등 다수의 사업 부문에서 글로벌 선두 위치를
                                유지하고 있습니다.
                            </p>

                            <div style={{
                                background: '#0f172a',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '25px',
                                border: '1px solid #334155'
                            }}>
                                <h3 style={{ color: '#60a5fa', marginBottom: '15px', fontSize: '1.1rem' }}>
                                    주요 사업 부문
                                </h3>
                                <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: '20px' }}>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#e2e8f0' }}>DS(Device Solutions) 부문:</strong> DRAM, NAND Flash, 시스템LSI, 파운드리
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#e2e8f0' }}>DX(Device eXperience) 부문:</strong> 스마트폰, TV, 생활가전
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#e2e8f0' }}>SDC(Samsung Display):</strong> OLED 패널 (관계사)
                                    </li>
                                    <li>
                                        <strong style={{ color: '#e2e8f0' }}>Harman:</strong> 자동차 전장 부품
                                    </li>
                                </ul>
                            </div>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                반도체 산업은 현대 디지털 경제의 핵심 인프라로, 스마트폰, PC, 서버, 자동차, IoT 기기 등
                                거의 모든 전자기기에 필수적으로 사용됩니다. 특히 AI와 클라우드 컴퓨팅의 폭발적 성장으로
                                고성능 반도체 수요가 급증하고 있어, 삼성전자의 DS 부문 성장 잠재력에 시장의 관심이
                                집중되고 있습니다.
                            </p>

                            <p style={{ color: '#cbd5e1' }}>
                                한편, 스마트폰과 가전 사업은 성숙기에 접어들어 성장률이 둔화되고 있으나,
                                프리미엄 시장에서의 경쟁력과 안정적인 현금 창출 능력을 보유하고 있습니다.
                                이러한 <strong>다각화된 사업 포트폴리오</strong>는 특정 산업의 경기 변동에 따른
                                리스크를 분산시키는 역할을 합니다.
                            </p>
                        </section>

                        {/* Section 2: Financial Analysis */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{
                                color: '#e2e8f0',
                                fontSize: isMobile ? '1.3rem' : '1.6rem',
                                marginBottom: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <BarChart3 size={24} style={{ color: '#10b981' }} />
                                2. 재무제표 핵심 포인트
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                재무제표는 기업의 건강 상태를 보여주는 '건강검진표'와 같습니다.
                                투자자가 반드시 확인해야 할 핵심 지표들을 <strong>삼성전자 재무</strong> 데이터를
                                통해 살펴보겠습니다.
                            </p>

                            {/* Financial Summary Box */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)',
                                borderRadius: '16px',
                                padding: '25px',
                                marginBottom: '30px',
                                border: '1px solid #3b82f6'
                            }}>
                                <h3 style={{
                                    color: '#60a5fa',
                                    marginBottom: '20px',
                                    fontSize: '1.2rem',
                                    textAlign: 'center'
                                }}>
                                    2025년 3분기 주요 실적 (연결 기준)
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                                    gap: '20px'
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>매출액</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                                            86조 617억
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익</p>
                                        <p style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                                            12조 1,660억
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익률</p>
                                        <p style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                                            약 14.1%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>
                                매출액 추이 분석
                            </h3>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                매출액은 기업이 제품이나 서비스를 판매하여 벌어들인 총 금액입니다.
                                삼성전자의 분기별 매출액을 살펴보면, 2023년 반도체 업황 둔화로 인한 매출 감소 이후
                                2024년부터 본격적인 회복세를 보이고 있습니다.
                            </p>
                            <p style={{ color: '#cbd5e1', marginBottom: '25px' }}>
                                특히 2025년 3분기 매출액 <strong style={{ color: '#60a5fa' }}>86조 617억원</strong>은
                                전년 동기(67조 4,047억원) 대비 약 <strong style={{ color: '#10b981' }}>27.7% 증가</strong>한
                                수치로, AI 서버용 HBM(고대역폭메모리) 수요 증가와 메모리 가격 상승이 주요 원인으로
                                분석됩니다.
                            </p>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>
                                영업이익과 영업이익률
                            </h3>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                <strong>영업이익</strong>은 매출액에서 매출원가와 판매관리비를 차감한 금액으로,
                                기업이 본업에서 실제로 얼마나 돈을 벌었는지를 보여주는 핵심 지표입니다.
                                <strong>영업이익률</strong>은 매출 대비 영업이익의 비율로, 기업의 수익 창출 효율성을
                                나타냅니다.
                            </p>
                            <p style={{ color: '#cbd5e1', marginBottom: '25px' }}>
                                삼성전자는 2023년 반도체 불황기에 영업이익률이 한 자릿수까지 하락했으나,
                                2025년 3분기 기준 약 <strong style={{ color: '#8b5cf6' }}>14.1%</strong>까지
                                회복하였습니다. 이는 메모리 반도체 가격 정상화와 원가 절감 노력의 결과로 해석됩니다.
                            </p>

                            <div style={{
                                background: '#0f172a',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '25px',
                                border: '1px solid #334155'
                            }}>
                                <h4 style={{ color: '#f59e0b', marginBottom: '12px', fontSize: '1rem' }}>
                                    💡 재무제표 읽는 팁
                                </h4>
                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                    영업이익률은 동종업계 평균과 비교하는 것이 중요합니다.
                                    일반적으로 반도체 제조업은 10~20%의 영업이익률이 양호한 수준으로 평가됩니다.
                                    다만, 반도체 산업은 경기 사이클에 따른 변동성이 크므로 단기 실적보다는
                                    중장기 추세를 함께 확인하는 것이 바람직합니다.
                                </p>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>
                                연도별 실적 추이
                            </h3>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                삼성전자의 연간 실적을 살펴보면 뚜렷한 사이클을 확인할 수 있습니다:
                            </p>
                            <ul style={{ color: '#cbd5e1', marginBottom: '20px', paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>2017~2018년:</strong> 슈퍼 사이클 - 반도체 호황으로 역대 최대 실적
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>2019년:</strong> 다운 사이클 - 메모리 가격 급락으로 실적 하락
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>2020~2021년:</strong> 코로나 특수 - 비대면 수요 급증으로 회복
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>2022~2023년:</strong> 조정기 - 인플레이션, 금리 인상으로 수요 둔화
                                </li>
                                <li>
                                    <strong>2024~2025년:</strong> AI 시대 - HBM 등 AI 반도체 수요 급증으로 재도약
                                </li>
                            </ul>
                        </section>

                        {/* Ad Slot 2 */}
                        {/* ADVERTISEMENT SLOT 2 */}

                        {/* Section 3: Investment Risks */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{
                                color: '#e2e8f0',
                                fontSize: isMobile ? '1.3rem' : '1.6rem',
                                marginBottom: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <Shield size={24} style={{ color: '#ef4444' }} />
                                3. 투자 리스크 및 체크포인트
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                모든 투자에는 리스크가 따릅니다. <strong>삼성전자 전망</strong>을 분석할 때
                                반드시 고려해야 할 리스크 요인들을 정리해보았습니다.
                            </p>

                            <div style={{
                                background: '#0f172a',
                                borderRadius: '12px',
                                padding: '25px',
                                marginBottom: '25px',
                                border: '1px solid #ef4444'
                            }}>
                                <h3 style={{ color: '#ef4444', marginBottom: '20px', fontSize: '1.1rem' }}>
                                    주요 리스크 요인
                                </h3>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>
                                        1. 반도체 산업 사이클 리스크
                                    </h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        반도체 산업은 수요와 공급의 불균형으로 인해 주기적인 호황과 불황을 반복합니다.
                                        업황 하락기에는 제품 가격 급락으로 실적이 크게 악화될 수 있습니다.
                                    </p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>
                                        2. 글로벌 경쟁 심화
                                    </h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        메모리 분야에서 SK하이닉스, 마이크론과의 경쟁이 치열하며,
                                        파운드리 분야에서는 TSMC와의 기술 격차가 여전히 존재합니다.
                                        특히 HBM 시장에서 SK하이닉스에 선두를 내준 상황입니다.
                                    </p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>
                                        3. 지정학적 리스크
                                    </h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        미중 무역분쟁, 반도체 수출 규제 등 지정학적 불확실성이 공급망에
                                        영향을 미칠 수 있습니다. 중국 시장 의존도도 주요 변수입니다.
                                    </p>
                                </div>

                                <div>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>
                                        4. 환율 변동 리스크
                                    </h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        수출 비중이 높아 원/달러 환율 변동이 실적에 직접적인 영향을 미칩니다.
                                        원화 강세 시 수출 경쟁력이 약화될 수 있습니다.
                                    </p>
                                </div>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>
                                거시경제 환경 체크포인트
                            </h3>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                삼성전자와 같은 대형 수출 기업의 실적은 글로벌 거시경제 환경과 밀접하게 연관됩니다.
                                투자 판단 시 다음 요소들을 모니터링하는 것이 좋습니다:
                            </p>
                            <ul style={{ color: '#cbd5e1', paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>글로벌 금리 동향:</strong> 고금리 환경은 IT 투자 및 소비 위축으로 이어질 수 있음
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>AI 투자 트렌드:</strong> 빅테크 기업들의 데이터센터 투자 계획
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>메모리 가격 동향:</strong> DRAM, NAND Flash 시장 가격 추이
                                </li>
                                <li>
                                    <strong>스마트폰 교체 주기:</strong> 글로벌 스마트폰 출하량 전망
                                </li>
                            </ul>
                        </section>

                        {/* CTA Section */}
                        <section style={{
                            background: 'linear-gradient(135deg, #1e3a5f 0%, #312e81 100%)',
                            borderRadius: '16px',
                            padding: '30px',
                            marginBottom: '40px',
                            textAlign: 'center',
                            border: '1px solid #60a5fa'
                        }}>
                            <h3 style={{
                                color: '#e2e8f0',
                                fontSize: isMobile ? '1.2rem' : '1.4rem',
                                marginBottom: '15px'
                            }}>
                                더 자세한 삼성전자의 매출액 및 영업이익 차트를 확인하세요
                            </h3>
                            <p style={{
                                color: '#94a3b8',
                                marginBottom: '25px',
                                fontSize: '0.95rem'
                            }}>
                                2016년부터 현재까지의 분기별/연간 재무 데이터를 인터랙티브 차트로 확인할 수 있습니다.
                                YoY(전년 동기 대비) 성장률, 영업이익률 추이 등 투자 분석에 필요한 모든 데이터를 제공합니다.
                            </p>
                            <Link
                                to="/005930"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    color: '#fff',
                                    padding: '14px 32px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    fontSize: '1.05rem',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                                }}
                            >
                                실시간 데이터 보러가기
                                <ExternalLink size={18} />
                            </Link>
                        </section>

                        {/* Ad Slot 3 */}
                        {/* ADVERTISEMENT SLOT 3 */}

                        {/* Disclaimer */}
                        <div style={{
                            background: '#0f172a',
                            borderRadius: '8px',
                            padding: '20px',
                            border: '1px solid #475569'
                        }}>
                            <p className="disclaimer-text" style={{
                                color: '#64748b',
                                fontSize: '0.85rem',
                                margin: 0,
                                lineHeight: '1.7'
                            }}>
                                ※ 본 페이지는 KStockView의 베타 서비스 기간 동안 제공되는 자동 생성 리포트입니다.
                                일부 내용은 일반적인 투자 정보를 포함하고 있으며, 실제 데이터와 차이가 있을 수 있습니다.
                                제공되는 정보는 투자 조언이 아니며, 모든 투자 결정 및 그 결과에 대한 책임은
                                투자자 본인에게 있습니다. 투자 전 반드시 공식 공시 자료를 확인하시기 바랍니다.
                            </p>
                        </div>
                    </article>

                    {/* Related Links */}
                    <div style={{
                        marginTop: '40px',
                        padding: '30px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <h3 style={{
                            color: '#e2e8f0',
                            fontSize: '1.2rem',
                            marginBottom: '20px'
                        }}>
                            관련 기업 분석
                        </h3>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px'
                        }}>
                            <Link
                                to="/000660"
                                style={{
                                    color: '#60a5fa',
                                    background: '#1e3a5f',
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                SK하이닉스 (000660)
                            </Link>
                            <Link
                                to="/005380"
                                style={{
                                    color: '#60a5fa',
                                    background: '#1e3a5f',
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                현대자동차 (005380)
                            </Link>
                            <Link
                                to="/035420"
                                style={{
                                    color: '#60a5fa',
                                    background: '#1e3a5f',
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                NAVER (035420)
                            </Link>
                        </div>
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

export default SamsungElectronics;
