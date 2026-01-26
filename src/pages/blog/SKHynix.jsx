import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, TrendingUp, BarChart3, Shield, ExternalLink, Cpu } from 'lucide-react';

const SKHynix = () => {
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
                <title>SK하이닉스 주가 전망 및 재무분석 2025 | HBM 수혜주 분석 - KStockView</title>
                <meta name="description" content="SK하이닉스(000660) 2025년 최신 재무제표 분석. HBM 시장 선두주자로서의 실적과 AI 반도체 수요 수혜 전망을 상세히 알아봅니다." />
                <meta name="keywords" content="SK하이닉스, 000660, SK하이닉스 주가, SK하이닉스 전망, HBM, AI반도체, 메모리반도체" />
                <meta property="og:title" content="SK하이닉스 주가 전망 및 재무분석 2025 | KStockView" />
                <meta property="og:description" content="SK하이닉스의 HBM 실적과 AI 반도체 수혜 전망을 분석합니다." />
                <meta property="og:type" content="article" />
                <link rel="canonical" href="https://kstockview.com/blog/sk-hynix" />
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
                            fontSize: '0.9rem'
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
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
                                반도체 제조업
                            </span>
                            <span style={{
                                background: '#064e3b',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                color: '#10b981'
                            }}>
                                HBM 선두주자
                            </span>
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
                            SK하이닉스(000660) 주가 전망 및 재무분석
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
                                <strong style={{ color: '#ef4444' }}>SK하이닉스</strong>는 AI 시대의 핵심 수혜주로 주목받고 있는
                                글로벌 메모리 반도체 기업입니다. 특히 <strong>HBM(High Bandwidth Memory)</strong> 시장에서
                                압도적인 점유율을 확보하며, 엔비디아(NVIDIA)의 주요 공급업체로서 AI 반도체 붐의
                                직접적인 수혜를 받고 있습니다.
                            </p>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                본 페이지에서는 <strong>SK하이닉스 재무제표</strong>의 핵심 지표를 분석하고,
                                HBM 사업의 성장성과 메모리 반도체 시장에서의 경쟁력을 객관적으로 평가합니다.
                                AI 데이터센터 투자 확대와 함께 폭발적으로 성장하는 고대역폭메모리 시장에서
                                SK하이닉스가 어떤 위치에 있는지 살펴보겠습니다.
                            </p>
                            <p style={{ color: '#cbd5e1' }}>
                                최근 <strong>SK하이닉스 전망</strong>에 대한 시장의 기대가 그 어느 때보다 높습니다.
                                HBM3E, HBM4 등 차세대 제품 로드맵과 함께 실제 재무 성과가 어떻게 나타나고 있는지
                                데이터 기반으로 확인해보시기 바랍니다.
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
                                <Cpu size={24} style={{ color: '#ef4444' }} />
                                1. 기업 개요 및 HBM 시장 지위
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                SK하이닉스는 1983년 현대전자로 출발하여 2012년 SK그룹에 편입된 이후
                                지속적인 기술 투자와 혁신을 통해 <strong style={{ color: '#ef4444' }}>DRAM 세계 2위,
                                NAND Flash 세계 5위</strong>의 위상을 확보했습니다. 그러나 현재 시장에서
                                SK하이닉스를 주목하는 가장 큰 이유는 단연 HBM 사업입니다.
                            </p>

                            <div style={{
                                background: 'linear-gradient(135deg, #7f1d1d 0%, #0f172a 100%)',
                                borderRadius: '12px',
                                padding: '25px',
                                marginBottom: '25px',
                                border: '1px solid #ef4444'
                            }}>
                                <h3 style={{ color: '#ef4444', marginBottom: '15px', fontSize: '1.1rem' }}>
                                    HBM(High Bandwidth Memory)이란?
                                </h3>
                                <p style={{ color: '#cbd5e1', marginBottom: '15px', fontSize: '0.95rem' }}>
                                    HBM은 여러 개의 DRAM 칩을 수직으로 적층하고, TSV(Through Silicon Via) 기술로
                                    연결하여 <strong>초고속 데이터 처리</strong>가 가능한 차세대 메모리입니다.
                                </p>
                                <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: '20px', fontSize: '0.95rem' }}>
                                    <li style={{ marginBottom: '8px' }}>기존 DRAM 대비 <strong style={{ color: '#10b981' }}>10배 이상</strong>의 대역폭</li>
                                    <li style={{ marginBottom: '8px' }}>AI 학습/추론에 필수적인 대용량 고속 메모리</li>
                                    <li>엔비디아 H100, H200, B100 GPU의 핵심 부품</li>
                                </ul>
                            </div>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                SK하이닉스는 HBM 시장에서 <strong style={{ color: '#10b981' }}>약 50% 이상의 점유율</strong>을
                                확보하며 삼성전자, 마이크론을 크게 앞서고 있습니다. 특히 엔비디아의 차세대 AI 칩에
                                독점적으로 HBM을 공급하며 "AI 반도체 시대의 승자"로 평가받고 있습니다.
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
                                        <strong style={{ color: '#e2e8f0' }}>DRAM:</strong> 서버, 모바일, PC용 메모리 (HBM 포함)
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#e2e8f0' }}>NAND Flash:</strong> SSD, 모바일 저장장치
                                    </li>
                                    <li>
                                        <strong style={{ color: '#e2e8f0' }}>Solidigm (인텔 NAND 인수):</strong> 엔터프라이즈 SSD
                                    </li>
                                </ul>
                            </div>

                            <p style={{ color: '#cbd5e1' }}>
                                AI 산업의 폭발적 성장과 함께 데이터센터 투자가 급증하면서, 고성능 메모리에 대한
                                수요는 지속적으로 확대되고 있습니다. SK하이닉스는 이러한 메가트렌드의 최대 수혜자로
                                평가받으며, 특히 HBM 사업의 높은 수익성이 전체 실적을 견인하고 있습니다.
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
                                <strong>SK하이닉스 재무</strong> 데이터를 살펴보면, 2023년 반도체 불황을 딛고
                                2024년부터 본격적인 턴어라운드에 성공한 모습을 확인할 수 있습니다.
                                특히 HBM 매출 비중 확대와 함께 수익성이 급격히 개선되고 있습니다.
                            </p>

                            {/* Financial Summary Box */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)',
                                borderRadius: '16px',
                                padding: '25px',
                                marginBottom: '30px',
                                border: '1px solid #ef4444'
                            }}>
                                <h3 style={{
                                    color: '#ef4444',
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
                                            24조 4,489억
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익</p>
                                        <p style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                                            11조 3,834억
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익률</p>
                                        <p style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                                            약 46.5%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>
                                폭발적인 실적 성장
                            </h3>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                2025년 3분기 SK하이닉스는 매출액 <strong style={{ color: '#60a5fa' }}>24조 4,489억원</strong>,
                                영업이익 <strong style={{ color: '#10b981' }}>11조 3,834억원</strong>을 기록했습니다.
                                영업이익률은 무려 <strong style={{ color: '#8b5cf6' }}>46.5%</strong>에 달하며,
                                이는 제조업에서 보기 드문 초고수익성입니다.
                            </p>
                            <p style={{ color: '#cbd5e1', marginBottom: '25px' }}>
                                특히 HBM 매출이 전체 DRAM 매출의 상당 부분을 차지하면서, 평균판매단가(ASP) 상승과
                                높은 마진율이 실적 개선을 주도하고 있습니다. 2023년 적자에서 2024~2025년 역대급
                                실적으로의 V자 반등은 AI 반도체 수요의 폭발적 성장을 반영합니다.
                            </p>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>
                                분기별 실적 추이
                            </h3>
                            <div style={{
                                background: '#0f172a',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '25px',
                                border: '1px solid #334155'
                            }}>
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
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right' }}>19.8조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right' }}>8.1조</td>
                                            <td style={{ color: '#8b5cf6', padding: '10px', textAlign: 'right' }}>40.9%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ color: '#e2e8f0', padding: '10px' }}>2025 1Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right' }}>17.6조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right' }}>7.4조</td>
                                            <td style={{ color: '#8b5cf6', padding: '10px', textAlign: 'right' }}>42.2%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ color: '#e2e8f0', padding: '10px' }}>2025 2Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right' }}>22.2조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right' }}>9.2조</td>
                                            <td style={{ color: '#8b5cf6', padding: '10px', textAlign: 'right' }}>41.5%</td>
                                        </tr>
                                        <tr>
                                            <td style={{ color: '#e2e8f0', padding: '10px', fontWeight: '600' }}>2025 3Q</td>
                                            <td style={{ color: '#e2e8f0', padding: '10px', textAlign: 'right', fontWeight: '600' }}>24.4조</td>
                                            <td style={{ color: '#10b981', padding: '10px', textAlign: 'right', fontWeight: '600' }}>11.4조</td>
                                            <td style={{ color: '#8b5cf6', padding: '10px', textAlign: 'right', fontWeight: '600' }}>46.5%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{
                                background: '#0f172a',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '25px',
                                border: '1px solid #334155'
                            }}>
                                <h4 style={{ color: '#f59e0b', marginBottom: '12px', fontSize: '1rem' }}>
                                    💡 HBM 프리미엄의 힘
                                </h4>
                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                    HBM은 일반 DRAM 대비 5~10배 높은 가격에 판매됩니다.
                                    SK하이닉스가 46%가 넘는 영업이익률을 달성할 수 있는 것은
                                    고부가가치 HBM 제품의 매출 비중이 크게 증가했기 때문입니다.
                                    이는 AI 수요가 지속되는 한 높은 수익성이 유지될 가능성을 시사합니다.
                                </p>
                            </div>
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
                                <Shield size={24} style={{ color: '#f59e0b' }} />
                                3. 투자 리스크 및 체크포인트
                            </h2>

                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                <strong>SK하이닉스 전망</strong>은 밝지만, 모든 투자에는 리스크가 따릅니다.
                                현재의 호황이 영원히 지속되지는 않을 것이며, 다음과 같은 요인들을 주시해야 합니다.
                            </p>

                            <div style={{
                                background: '#0f172a',
                                borderRadius: '12px',
                                padding: '25px',
                                marginBottom: '25px',
                                border: '1px solid #f59e0b'
                            }}>
                                <h3 style={{ color: '#f59e0b', marginBottom: '20px', fontSize: '1.1rem' }}>
                                    주요 리스크 요인
                                </h3>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>
                                        1. HBM 경쟁 심화
                                    </h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        삼성전자와 마이크론이 HBM 시장 진입을 가속화하고 있습니다.
                                        경쟁 심화로 인한 점유율 하락과 가격 인하 압력이 발생할 수 있습니다.
                                    </p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>
                                        2. AI 투자 사이클 변동
                                    </h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        빅테크 기업들의 AI 인프라 투자가 조정 국면에 들어갈 경우
                                        HBM 수요가 급감할 수 있습니다. 현재의 과열 투자가 지속 가능한지 모니터링이 필요합니다.
                                    </p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>
                                        3. 엔비디아 의존도
                                    </h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        HBM 매출의 상당 부분이 엔비디아에 집중되어 있어,
                                        특정 고객사에 대한 의존도 리스크가 존재합니다.
                                    </p>
                                </div>

                                <div>
                                    <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '8px' }}>
                                        4. 반도체 사이클 리스크
                                    </h4>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                        메모리 반도체는 수급 사이클에 민감합니다. 범용 DRAM/NAND 가격 변동이
                                        전체 실적에 영향을 미칠 수 있습니다.
                                    </p>
                                </div>
                            </div>

                            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '15px' }}>
                                긍정적 모멘텀
                            </h3>
                            <ul style={{ color: '#cbd5e1', paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>HBM4 선점:</strong> 차세대 HBM4 양산 준비로 기술 리더십 유지
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>용인 팹 투자:</strong> 대규모 신규 생산시설 투자로 공급능력 확대
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong>AI 시장 확대:</strong> 클라우드, 자율주행, 로봇 등 AI 적용 분야 지속 확대
                                </li>
                                <li>
                                    <strong>고객 다변화:</strong> AMD, 인텔 등 신규 HBM 고객 확보 진행
                                </li>
                            </ul>
                        </section>

                        {/* CTA Section */}
                        <section style={{
                            background: 'linear-gradient(135deg, #7f1d1d 0%, #312e81 100%)',
                            borderRadius: '16px',
                            padding: '30px',
                            marginBottom: '40px',
                            textAlign: 'center',
                            border: '1px solid #ef4444'
                        }}>
                            <h3 style={{
                                color: '#e2e8f0',
                                fontSize: isMobile ? '1.2rem' : '1.4rem',
                                marginBottom: '15px'
                            }}>
                                더 자세한 SK하이닉스의 매출액 및 영업이익 차트를 확인하세요
                            </h3>
                            <p style={{
                                color: '#94a3b8',
                                marginBottom: '25px',
                                fontSize: '0.95rem'
                            }}>
                                2016년부터 현재까지의 분기별/연간 재무 데이터를 인터랙티브 차트로 확인할 수 있습니다.
                                HBM 성장과 함께 급변하는 실적 추이를 직접 확인해보세요.
                            </p>
                            <Link
                                to="/000660"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                                    color: '#fff',
                                    padding: '14px 32px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    fontSize: '1.05rem',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
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
                        <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '20px' }}>
                            관련 기업 분석
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <Link to="/005930" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
                                삼성전자 (005930)
                            </Link>
                            <Link to="/042700" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
                                한미반도체 (042700)
                            </Link>
                            <Link to="/403870" style={{ color: '#60a5fa', background: '#1e3a5f', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
                                HPSP (403870)
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer style={{ marginTop: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                        <p>© 2026 KSTOCKVIEW. All rights reserved.</p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default SKHynix;
