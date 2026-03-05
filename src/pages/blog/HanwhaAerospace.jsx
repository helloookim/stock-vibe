import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../../components/SEOHead';
import { ArrowLeft, TrendingUp, BarChart3, Shield, ExternalLink, Plane } from 'lucide-react';

const HanwhaAerospace = () => {
    const { t } = useTranslation();
    React.useEffect(() => {
        document.documentElement.classList.add('page-scroll-enabled');
        return () => {
            document.documentElement.classList.remove('page-scroll-enabled');
        };
    }, []);

    const isMobile = window.innerWidth <= 768;

    return (
        <>
            <SEOHead
                title={t('blogSeo.hanwhaAerospace.title')}
                description={t('blogSeo.hanwhaAerospace.description')}
                keywords={t('blogSeo.hanwhaAerospace.keywords')}
                canonical="https://kstockview.com/blog/hanwha-aerospace"
                ogType="article"
                jsonLd={[
                    {
                        '@type': 'Article',
                        headline: t('blogSeo.hanwhaAerospace.ogTitle'),
                        author: { '@type': 'Organization', name: 'KStockView' },
                        publisher: { '@type': 'Organization', name: 'KStockView', logo: { '@type': 'ImageObject', url: 'https://kstockview.com/logo.png' } },
                        datePublished: '2025-06-01',
                        dateModified: '2026-02-14',
                        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://kstockview.com/blog/hanwha-aerospace' }
                    },
                    {
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kstockview.com' },
                            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://kstockview.com/blogs' },
                            { '@type': 'ListItem', position: 3, name: 'Hanwha Aerospace' }
                        ]
                    },
                    {
                        '@type': 'FAQPage',
                        mainEntity: [
                            { '@type': 'Question', name: t('faq.hanwhaAerospace.q1'), acceptedAnswer: { '@type': 'Answer', text: t('faq.hanwhaAerospace.a1') } },
                            { '@type': 'Question', name: t('faq.hanwhaAerospace.q2'), acceptedAnswer: { '@type': 'Answer', text: t('faq.hanwhaAerospace.a2') } }
                        ]
                    }
                ]}
            />
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #141417 0%, #141417 100%)',
                color: '#f0f0f5',
                padding: isMobile ? '20px 15px 100px 15px' : '40px 20px 100px 20px'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#FF8C00', textDecoration: 'none', marginBottom: '30px', fontSize: '0.9rem' }}>
                        <ArrowLeft size={18} />
                        {t('blog.backToHome')}
                    </Link>

                    <header style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #2a2a30' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', flexWrap: 'wrap' }}>
                            <span style={{ background: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>기업분석</span>
                            <span style={{ background: 'rgba(255, 140, 0, 0.08)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#FF8C00' }}>항공우주 제조업</span>
                            <span style={{ background: '#7f1d1d', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#fca5a5' }}>K-방산 대표주</span>
                        </div>
                        <h1 style={{
                            fontSize: isMobile ? '1.8rem' : '2.5rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: '10px',
                            lineHeight: '1.3'
                        }}>
                            한화에어로스페이스(012450) 주가 전망 및 재무분석
                        </h1>
                        <p style={{ color: '#8888a0', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                            최종 업데이트: 2026년 3분기 실적 반영 | KStockView 리서치팀
                        </p>
                    </header>

                    <article style={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '16px',
                        padding: isMobile ? '20px' : '40px',
                        lineHeight: '1.9',
                        fontSize: isMobile ? '0.95rem' : '1.05rem'
                    }}>
                        {/* Introduction */}
                        <section style={{ marginBottom: '45px' }}>
                            <p style={{ color: '#c0c0d0', marginBottom: '20px' }}>
                                <strong style={{ color: '#f97316' }}>한화에어로스페이스</strong>는 항공엔진, 방위산업, 우주개발을 아우르는
                                한화그룹의 핵심 기업입니다. 최근 <strong>K-방산 수출 열풍</strong>의 최대 수혜주로 부상하며
                                폴란드, 사우디아라비아 등 대규모 방산 수출 계약을 수주하고 있습니다.
                            </p>
                            <p style={{ color: '#c0c0d0', marginBottom: '20px' }}>
                                본 페이지에서는 <strong>한화에어로스페이스 재무제표</strong>의 핵심 지표를 분석합니다.
                                방산과 항공엔진이라는 두 축을 중심으로 안정적인 성장을 이어가고 있으며,
                                우주산업까지 사업 영역을 확장하며 미래 성장동력을 확보하고 있습니다.
                            </p>
                            <p style={{ color: '#c0c0d0' }}>
                                특히 <strong>한화에어로스페이스 전망</strong>에서 주목할 점은 폴란드 K9 자주포 수출,
                                천무 다연장 로켓 수출 등 대규모 수주잔고입니다. 이러한 수주가 실제 매출과
                                이익으로 전환되는 과정을 데이터로 확인해보겠습니다.
                            </p>
                        </section>

                        {/* ADVERTISEMENT SLOT 1 */}

                        {/* Section 1 */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#f0f0f5', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Plane size={24} style={{ color: '#f97316' }} />
                                1. 기업 개요 및 K-방산 시장 위상
                            </h2>

                            <p style={{ color: '#c0c0d0', marginBottom: '20px' }}>
                                한화에어로스페이스는 1977년 삼성항공(주)으로 출발하여 2015년 한화그룹에 편입된 후
                                현재의 사명으로 변경되었습니다. 항공기 엔진 부품 제조에서 시작하여
                                현재는 <strong style={{ color: '#f97316' }}>방위산업, 항공우주, 산업장비</strong>를
                                아우르는 종합 중공업 기업으로 성장했습니다.
                            </p>

                            <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #141417 100%)', borderRadius: '12px', padding: '25px', marginBottom: '25px', border: '1px solid #f97316' }}>
                                <h3 style={{ color: '#f97316', marginBottom: '15px', fontSize: '1.1rem' }}>K-방산의 글로벌 위상</h3>
                                <p style={{ color: '#c0c0d0', marginBottom: '15px', fontSize: '0.95rem' }}>
                                    대한민국은 세계 <strong>9위권</strong> 방산 수출국으로 도약했습니다.
                                    우크라이나 전쟁 이후 유럽과 중동 국가들의 무기 수요가 급증하면서
                                    가성비와 품질을 갖춘 K-방산이 각광받고 있습니다.
                                </p>
                                <ul style={{ color: '#8888a0', margin: 0, paddingLeft: '20px', fontSize: '0.95rem' }}>
                                    <li style={{ marginBottom: '8px' }}>폴란드: K9 자주포, 천무 다연장 등 역대 최대 수출</li>
                                    <li style={{ marginBottom: '8px' }}>사우디, UAE: 천궁-II 방공미사일 수출 추진</li>
                                    <li>호주, 이집트 등 신규 시장 개척 중</li>
                                </ul>
                            </div>

                            <div style={{ background: '#141417', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #2a2a30' }}>
                                <h3 style={{ color: '#f97316', marginBottom: '15px', fontSize: '1.1rem' }}>주요 사업 영역</h3>
                                <ul style={{ color: '#8888a0', margin: 0, paddingLeft: '20px' }}>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#f0f0f5' }}>항공엔진:</strong> GE, 롤스로이스 등 글로벌 엔진업체 핵심 파트너 (MRO 및 부품 제조)
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#f0f0f5' }}>방위산업:</strong> K9 자주포, 천무 다연장로켓, 비호 자주대공포 등 지상무기체계
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: '#f0f0f5' }}>우주산업:</strong> 누리호 엔진, 위성 발사체, 우주 추진체계
                                    </li>
                                    <li>
                                        <strong style={{ color: '#f0f0f5' }}>산업장비:</strong> 포크리프트, 물류자동화 시스템
                                    </li>
                                </ul>
                            </div>

                            <p style={{ color: '#c0c0d0' }}>
                                한화에어로스페이스는 한화디펜스, 한화시스템 등 그룹 내 방산 계열사와 시너지를 내며
                                '한화 방산 밸류체인'을 형성하고 있습니다. 특히 2026년에는 한화오션(조선), 한화비전(보안) 등과의
                                협력을 통해 <strong>해양방위 플랫폼</strong>으로의 확장도 추진 중입니다.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#f0f0f5', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <BarChart3 size={24} style={{ color: '#00d084' }} />
                                2. 재무제표 핵심 포인트
                            </h2>

                            <p style={{ color: '#c0c0d0', marginBottom: '20px' }}>
                                <strong>한화에어로스페이스 재무</strong> 데이터를 살펴보면, 방산 수출 증가와 함께
                                매출과 영업이익이 빠르게 성장하고 있습니다. 특히 2024년 이후 폴란드향 납품이
                                본격화되면서 실적 개선세가 뚜렷합니다.
                            </p>

                            <div style={{
                                background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.08) 0%, #1c1c22 100%)',
                                borderRadius: '16px', padding: '25px', marginBottom: '30px',
                                border: '1px solid #f97316'
                            }}>
                                <h3 style={{ color: '#f97316', marginBottom: '20px', fontSize: '1.2rem', textAlign: 'center' }}>
                                    2026년 3분기 주요 실적 (연결 기준)
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#8888a0', fontSize: '0.9rem', marginBottom: '5px' }}>매출액</p>
                                        <p style={{ color: '#f0f0f5', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>6조 4,865억</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#8888a0', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익</p>
                                        <p style={{ color: '#00d084', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>8,564억</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#8888a0', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익률</p>
                                        <p style={{ color: '#cc6e00', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>약 13.2%</p>
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ color: '#f0f0f5', fontSize: '1.2rem', marginBottom: '15px' }}>폭발적 성장세</h3>
                            <p style={{ color: '#c0c0d0', marginBottom: '20px' }}>
                                2026년 3분기 한화에어로스페이스는 매출액 <strong style={{ color: '#FF8C00' }}>6조 4,865억원</strong>,
                                영업이익 <strong style={{ color: '#00d084' }}>8,564억원</strong>을 기록했습니다.
                                전년 동기 대비 매출은 약 <strong style={{ color: '#00d084' }}>45% 이상</strong> 성장한 수치입니다.
                            </p>

                            <div style={{ background: '#141417', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #2a2a30' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #2a2a30' }}>
                                            <th style={{ color: '#8888a0', padding: '10px', textAlign: 'left' }}>분기</th>
                                            <th style={{ color: '#8888a0', padding: '10px', textAlign: 'right' }}>매출액</th>
                                            <th style={{ color: '#8888a0', padding: '10px', textAlign: 'right' }}>영업이익</th>
                                            <th style={{ color: '#8888a0', padding: '10px', textAlign: 'right' }}>이익률</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid #2a2a30' }}>
                                            <td style={{ color: '#f0f0f5', padding: '10px' }}>2024 4Q</td>
                                            <td style={{ color: '#f0f0f5', padding: '10px', textAlign: 'right' }}>4.83조</td>
                                            <td style={{ color: '#00d084', padding: '10px', textAlign: 'right' }}>8,997억</td>
                                            <td style={{ color: '#cc6e00', padding: '10px', textAlign: 'right' }}>18.6%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #2a2a30' }}>
                                            <td style={{ color: '#f0f0f5', padding: '10px' }}>2025 1Q</td>
                                            <td style={{ color: '#f0f0f5', padding: '10px', textAlign: 'right' }}>5.48조</td>
                                            <td style={{ color: '#00d084', padding: '10px', textAlign: 'right' }}>5,607억</td>
                                            <td style={{ color: '#cc6e00', padding: '10px', textAlign: 'right' }}>10.2%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #2a2a30' }}>
                                            <td style={{ color: '#f0f0f5', padding: '10px' }}>2025 2Q</td>
                                            <td style={{ color: '#f0f0f5', padding: '10px', textAlign: 'right' }}>6.31조</td>
                                            <td style={{ color: '#00d084', padding: '10px', textAlign: 'right' }}>8,645억</td>
                                            <td style={{ color: '#cc6e00', padding: '10px', textAlign: 'right' }}>13.7%</td>
                                        </tr>
                                        <tr>
                                            <td style={{ color: '#f0f0f5', padding: '10px', fontWeight: '600' }}>2025 3Q</td>
                                            <td style={{ color: '#f0f0f5', padding: '10px', textAlign: 'right', fontWeight: '600' }}>6.49조</td>
                                            <td style={{ color: '#00d084', padding: '10px', textAlign: 'right', fontWeight: '600' }}>8,564억</td>
                                            <td style={{ color: '#cc6e00', padding: '10px', textAlign: 'right', fontWeight: '600' }}>13.2%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ background: '#141417', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #2a2a30' }}>
                                <h4 style={{ color: '#d4a853', marginBottom: '12px', fontSize: '1rem' }}>💡 방산 기업의 특성 이해하기</h4>
                                <p style={{ color: '#8888a0', margin: 0, fontSize: '0.95rem' }}>
                                    방산 기업은 대규모 장기 계약 특성상 분기별 실적 변동성이 클 수 있습니다.
                                    납품 시점에 따라 매출이 집중되기도 하며, 수주잔고를 통해 향후 매출 가시성을 판단합니다.
                                    한화에어로스페이스의 수주잔고는 수십조 원 규모로 향후 수년간 안정적 성장이 예상됩니다.
                                </p>
                            </div>
                        </section>

                        {/* ADVERTISEMENT SLOT 2 */}

                        {/* Section 3 */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#f0f0f5', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Shield size={24} style={{ color: '#d4a853' }} />
                                3. 투자 리스크 및 체크포인트
                            </h2>

                            <div style={{ background: '#141417', borderRadius: '12px', padding: '25px', marginBottom: '25px', border: '1px solid #d4a853' }}>
                                <h3 style={{ color: '#d4a853', marginBottom: '20px', fontSize: '1.1rem' }}>주요 리스크 요인</h3>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#f0f0f5', fontSize: '1rem', marginBottom: '8px' }}>1. 지정학적 환경 변화</h4>
                                    <p style={{ color: '#8888a0', margin: 0, fontSize: '0.95rem' }}>
                                        방산 수요는 국제 정세에 민감합니다. 우크라이나 전쟁 종전이나 글로벌 긴장 완화 시
                                        방산 지출이 감소할 수 있으며, 이는 수주에 영향을 미칠 수 있습니다.
                                    </p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#f0f0f5', fontSize: '1rem', marginBottom: '8px' }}>2. 생산능력 제약</h4>
                                    <p style={{ color: '#8888a0', margin: 0, fontSize: '0.95rem' }}>
                                        대규모 수주에 대응하기 위한 생산능력 확충에는 시간이 소요됩니다.
                                        납기 지연 시 계약 변경이나 위약금 리스크가 있을 수 있습니다.
                                    </p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#f0f0f5', fontSize: '1rem', marginBottom: '8px' }}>3. 정치적 리스크</h4>
                                    <p style={{ color: '#8888a0', margin: 0, fontSize: '0.95rem' }}>
                                        방산 수출은 정부 간 협상이 중요합니다. 정권 교체나 외교 관계 변화가
                                        수출 계약에 영향을 미칠 수 있습니다.
                                    </p>
                                </div>

                                <div>
                                    <h4 style={{ color: '#f0f0f5', fontSize: '1rem', marginBottom: '8px' }}>4. 항공엔진 사업 경기 민감성</h4>
                                    <p style={{ color: '#8888a0', margin: 0, fontSize: '0.95rem' }}>
                                        항공엔진 MRO 사업은 항공 산업 경기에 연동됩니다.
                                        글로벌 경기 침체 시 항공 수요 감소가 실적에 영향을 줄 수 있습니다.
                                    </p>
                                </div>
                            </div>

                            <h3 style={{ color: '#f0f0f5', fontSize: '1.2rem', marginBottom: '15px' }}>긍정적 모멘텀</h3>
                            <ul style={{ color: '#c0c0d0', paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '10px' }}><strong>풍부한 수주잔고:</strong> 폴란드, 호주, 중동 등 대규모 계약으로 수년간 매출 가시성 확보</li>
                                <li style={{ marginBottom: '10px' }}><strong>우주산업 진출:</strong> 누리호 성공으로 우주발사체 사업 본격화</li>
                                <li style={{ marginBottom: '10px' }}><strong>항공엔진 성장:</strong> 글로벌 항공 수요 회복과 함께 MRO 사업 성장</li>
                                <li><strong>한화그룹 시너지:</strong> 그룹 차원의 방산 통합 플랫폼 구축</li>
                            </ul>
                        </section>

                        {/* CTA Section */}
                        <section style={{
                            background: 'linear-gradient(135deg, #7f1d1d 0%, #FF8C00 100%)',
                            borderRadius: '16px', padding: '30px', marginBottom: '40px',
                            textAlign: 'center', border: '1px solid #f97316'
                        }}>
                            <h3 style={{ color: '#f0f0f5', fontSize: isMobile ? '1.2rem' : '1.4rem', marginBottom: '15px' }}>
                                더 자세한 한화에어로스페이스의 매출액 및 영업이익 차트를 확인하세요
                            </h3>
                            <p style={{ color: '#8888a0', marginBottom: '25px', fontSize: '0.95rem' }}>
                                분기별 재무 데이터를 인터랙티브 차트로 확인하세요.
                                K-방산 수출 호조와 함께 급성장하는 실적 추이를 직접 분석해보세요.
                            </p>
                            <Link to="/stocks/012450" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
                                color: '#fff', padding: '14px 32px', borderRadius: '12px',
                                textDecoration: 'none', fontWeight: '600', fontSize: '1.05rem',
                                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)'
                            }}>
                                실시간 데이터 보러가기
                                <ExternalLink size={18} />
                            </Link>
                        </section>

                        {/* ADVERTISEMENT SLOT 3 */}

                        <div style={{ background: '#141417', borderRadius: '8px', padding: '20px', border: '1px solid #4a4a60' }}>
                            <p className="disclaimer-text" style={{ color: '#5a5a70', fontSize: '0.85rem', margin: 0, lineHeight: '1.7' }}>
                                ※ 본 페이지는 KStockView의 베타 서비스 기간 동안 제공되는 자동 생성 리포트입니다.
                                일부 내용은 일반적인 투자 정보를 포함하고 있으며, 실제 데이터와 차이가 있을 수 있습니다.
                                제공되는 정보는 투자 조언이 아니며, 모든 투자 결정 및 그 결과에 대한 책임은 투자자 본인에게 있습니다.
                            </p>
                        </div>
                    </article>

                    <div style={{ marginTop: '40px', padding: '30px', background: 'rgba(0, 0, 0, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <h3 style={{ color: '#f0f0f5', fontSize: '1.2rem', marginBottom: '20px' }}>관련 기업 분석</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <Link to="/stocks/009830" style={{ color: '#FF8C00', background: 'rgba(255, 140, 0, 0.08)', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>한화솔루션 (009830)</Link>
                            <Link to="/stocks/042660" style={{ color: '#FF8C00', background: 'rgba(255, 140, 0, 0.08)', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>한화오션 (042660)</Link>
                            <Link to="/stocks/047810" style={{ color: '#FF8C00', background: 'rgba(255, 140, 0, 0.08)', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>한국항공우주 (047810)</Link>
                        </div>
                    </div>

                    <footer style={{ marginTop: '40px', textAlign: 'center', color: '#5a5a70', fontSize: '0.85rem' }}>
                        <p>© 2026 KSTOCKVIEW. All rights reserved.</p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default HanwhaAerospace;
