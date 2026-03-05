import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '../../components/SEOHead';
import { ArrowLeft, TrendingUp, BarChart3, Shield, ExternalLink, MessageCircle } from 'lucide-react';

const Kakao = () => {
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
                title={t('blogSeo.kakao.title')}
                description={t('blogSeo.kakao.description')}
                keywords={t('blogSeo.kakao.keywords')}
                canonical="https://kstockview.com/blog/kakao"
                ogType="article"
                jsonLd={[
                    {
                        '@type': 'Article',
                        headline: t('blogSeo.kakao.ogTitle'),
                        author: { '@type': 'Organization', name: 'KStockView' },
                        publisher: { '@type': 'Organization', name: 'KStockView', logo: { '@type': 'ImageObject', url: 'https://kstockview.com/logo.png' } },
                        datePublished: '2025-06-01',
                        dateModified: '2026-02-14',
                        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://kstockview.com/blog/kakao' }
                    },
                    {
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kstockview.com' },
                            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://kstockview.com/blogs' },
                            { '@type': 'ListItem', position: 3, name: 'Kakao' }
                        ]
                    },
                    {
                        '@type': 'FAQPage',
                        mainEntity: [
                            { '@type': 'Question', name: t('faq.kakao.q1'), acceptedAnswer: { '@type': 'Answer', text: t('faq.kakao.a1') } },
                            { '@type': 'Question', name: t('faq.kakao.q2'), acceptedAnswer: { '@type': 'Answer', text: t('faq.kakao.a2') } }
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
                            <span style={{ background: 'linear-gradient(135deg, #eab308 0%, #d4a853 100%)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', color: '#000' }}>기업분석</span>
                            <span style={{ background: 'rgba(255, 140, 0, 0.08)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#FF8C00' }}>인터넷 플랫폼</span>
                            <span style={{ background: '#78350f', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#fcd34d' }}>턴어라운드</span>
                        </div>
                        <h1 style={{
                            fontSize: isMobile ? '1.8rem' : '2.5rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #fcd34d 0%, #d4a853 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: '10px',
                            lineHeight: '1.3'
                        }}>
                            카카오(035720) 주가 전망 및 재무분석
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
                                <strong style={{ color: '#fcd34d' }}>카카오</strong>는 대한민국 국민 메신저 '카카오톡'을 기반으로
                                핀테크, 콘텐츠, 모빌리티, 커머스 등 다양한 영역으로 사업을 확장한 <strong>종합 플랫폼 기업</strong>입니다.
                                2021년 주가 고점 이후 조정을 거쳐, 최근 구조조정과 비용 효율화를 통해
                                수익성 개선에 집중하고 있습니다.
                            </p>
                            <p style={{ color: '#c0c0d0', marginBottom: '20px' }}>
                                본 페이지에서는 <strong>카카오 재무제표</strong>의 핵심 지표를 분석하고,
                                톡비즈, 핀테크, 콘텐츠 등 주요 사업 부문의 현황과 턴어라운드 가능성을 살펴봅니다.
                            </p>
                            <p style={{ color: '#c0c0d0' }}>
                                <strong>카카오 전망</strong>에서 주목할 점은 광고 사업 회복, 카카오페이·카카오뱅크 성장,
                                그리고 SM엔터 인수 효과입니다. 그동안의 무리한 확장에서 '선택과 집중' 전략으로
                                전환하는 카카오의 변화를 데이터로 확인해보겠습니다.
                            </p>
                        </section>

                        {/* ADVERTISEMENT SLOT 1 */}

                        {/* Section 1 */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#f0f0f5', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <MessageCircle size={24} style={{ color: '#fcd34d' }} />
                                1. 기업 개요 및 사업 구조
                            </h2>

                            <p style={{ color: '#c0c0d0', marginBottom: '20px' }}>
                                카카오는 2010년 카카오톡 출시 이후 급성장하여 국민 메신저로 자리잡았습니다.
                                <strong style={{ color: '#fcd34d' }}> 월간 활성 사용자(MAU) 4,800만 명</strong> 이상의
                                카카오톡을 기반으로 광고, 커머스, 핀테크, 콘텐츠 사업을 영위하고 있습니다.
                            </p>

                            <div style={{ background: '#141417', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #2a2a30' }}>
                                <h3 style={{ color: '#fcd34d', marginBottom: '15px', fontSize: '1.1rem' }}>주요 사업 부문 및 자회사</h3>
                                <ul style={{ color: '#8888a0', margin: 0, paddingLeft: '20px' }}>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#f0f0f5' }}>톡비즈:</strong> 카카오톡 광고, 비즈보드, 선물하기, 이모티콘</li>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#f0f0f5' }}>핀테크:</strong> 카카오페이(상장), 카카오뱅크(상장)</li>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#f0f0f5' }}>콘텐츠:</strong> 카카오엔터테인먼트, SM엔터, 카카오웹툰, 멜론</li>
                                    <li style={{ marginBottom: '10px' }}><strong style={{ color: '#f0f0f5' }}>모빌리티:</strong> 카카오모빌리티(카카오T)</li>
                                    <li><strong style={{ color: '#f0f0f5' }}>기타:</strong> 카카오게임즈, 카카오클라우드</li>
                                </ul>
                            </div>

                            <div style={{ background: 'linear-gradient(135deg, #78350f 0%, #141417 100%)', borderRadius: '12px', padding: '25px', marginBottom: '25px', border: '1px solid #d4a853' }}>
                                <h3 style={{ color: '#fcd34d', marginBottom: '15px', fontSize: '1.1rem' }}>카카오의 구조조정</h3>
                                <p style={{ color: '#c0c0d0', marginBottom: '15px', fontSize: '0.95rem' }}>
                                    2022~2024년 사이 카카오는 무리한 확장의 후유증으로 어려움을 겪었습니다.
                                    데이터센터 화재, SM엔터 경영권 분쟁, 창업자 구속 등의 악재를 겪으며
                                    '선택과 집중' 전략으로 전환하고 있습니다.
                                </p>
                                <ul style={{ color: '#8888a0', margin: 0, paddingLeft: '20px', fontSize: '0.95rem' }}>
                                    <li style={{ marginBottom: '8px' }}>비핵심 사업 정리 및 인력 구조조정</li>
                                    <li style={{ marginBottom: '8px' }}>수익성 중심의 사업 재편</li>
                                    <li>AI 기반 서비스 고도화 추진</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section style={{ marginBottom: '45px' }}>
                            <h2 style={{ color: '#f0f0f5', fontSize: isMobile ? '1.3rem' : '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <BarChart3 size={24} style={{ color: '#00d084' }} />
                                2. 재무제표 핵심 포인트
                            </h2>

                            <p style={{ color: '#c0c0d0', marginBottom: '20px' }}>
                                <strong>카카오 재무</strong> 데이터를 살펴보면, 2024년 저점을 찍고
                                2026년 들어 수익성이 개선되고 있습니다. 비용 효율화와 광고 사업 회복이
                                영업이익 증가로 이어지고 있습니다.
                            </p>

                            <div style={{
                                background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.08) 0%, #1c1c22 100%)',
                                borderRadius: '16px', padding: '25px', marginBottom: '30px',
                                border: '1px solid #d4a853'
                            }}>
                                <h3 style={{ color: '#fcd34d', marginBottom: '20px', fontSize: '1.2rem', textAlign: 'center' }}>
                                    2026년 3분기 주요 실적 (연결 기준)
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#8888a0', fontSize: '0.9rem', marginBottom: '5px' }}>매출액</p>
                                        <p style={{ color: '#f0f0f5', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>2조 866억</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#8888a0', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익</p>
                                        <p style={{ color: '#00d084', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>2,080억</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#8888a0', fontSize: '0.9rem', marginBottom: '5px' }}>영업이익률</p>
                                        <p style={{ color: '#cc6e00', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>약 10.0%</p>
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ color: '#f0f0f5', fontSize: '1.2rem', marginBottom: '15px' }}>수익성 개선 추이</h3>
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
                                            <td style={{ color: '#f0f0f5', padding: '10px', textAlign: 'right' }}>1.96조</td>
                                            <td style={{ color: '#00d084', padding: '10px', textAlign: 'right' }}>754억</td>
                                            <td style={{ color: '#cc6e00', padding: '10px', textAlign: 'right' }}>3.9%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #2a2a30' }}>
                                            <td style={{ color: '#f0f0f5', padding: '10px' }}>2025 1Q</td>
                                            <td style={{ color: '#f0f0f5', padding: '10px', textAlign: 'right' }}>1.86조</td>
                                            <td style={{ color: '#00d084', padding: '10px', textAlign: 'right' }}>1,054억</td>
                                            <td style={{ color: '#cc6e00', padding: '10px', textAlign: 'right' }}>5.7%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #2a2a30' }}>
                                            <td style={{ color: '#f0f0f5', padding: '10px' }}>2025 2Q</td>
                                            <td style={{ color: '#f0f0f5', padding: '10px', textAlign: 'right' }}>2.03조</td>
                                            <td style={{ color: '#00d084', padding: '10px', textAlign: 'right' }}>1,859억</td>
                                            <td style={{ color: '#cc6e00', padding: '10px', textAlign: 'right' }}>9.2%</td>
                                        </tr>
                                        <tr>
                                            <td style={{ color: '#f0f0f5', padding: '10px', fontWeight: '600' }}>2025 3Q</td>
                                            <td style={{ color: '#f0f0f5', padding: '10px', textAlign: 'right', fontWeight: '600' }}>2.09조</td>
                                            <td style={{ color: '#00d084', padding: '10px', textAlign: 'right', fontWeight: '600' }}>2,080억</td>
                                            <td style={{ color: '#cc6e00', padding: '10px', textAlign: 'right', fontWeight: '600' }}>10.0%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ background: '#141417', borderRadius: '12px', padding: '20px', marginBottom: '25px', border: '1px solid #2a2a30' }}>
                                <h4 style={{ color: '#d4a853', marginBottom: '12px', fontSize: '1rem' }}>💡 카카오 vs 네이버</h4>
                                <p style={{ color: '#8888a0', margin: 0, fontSize: '0.95rem' }}>
                                    카카오는 네이버 대비 영업이익률이 낮은 편입니다(10% vs 18%).
                                    이는 콘텐츠, 모빌리티 등 저마진 사업 비중이 높기 때문입니다.
                                    다만, 카카오페이, 카카오뱅크 등 핀테크 자회사의 성장이 기대됩니다.
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
                                    <h4 style={{ color: '#f0f0f5', fontSize: '1rem', marginBottom: '8px' }}>1. 지배구조 리스크</h4>
                                    <p style={{ color: '#8888a0', margin: 0, fontSize: '0.95rem' }}>창업자 구속 등 지배구조 관련 불확실성이 존재합니다.</p>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#f0f0f5', fontSize: '1rem', marginBottom: '8px' }}>2. 플랫폼 규제</h4>
                                    <p style={{ color: '#8888a0', margin: 0, fontSize: '0.95rem' }}>공정거래위원회의 플랫폼 규제 강화 움직임이 있습니다.</p>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#f0f0f5', fontSize: '1rem', marginBottom: '8px' }}>3. 콘텐츠 사업 경쟁</h4>
                                    <p style={{ color: '#8888a0', margin: 0, fontSize: '0.95rem' }}>넷플릭스, 유튜브 등 글로벌 플랫폼과의 경쟁이 심화되고 있습니다.</p>
                                </div>
                                <div>
                                    <h4 style={{ color: '#f0f0f5', fontSize: '1rem', marginBottom: '8px' }}>4. 복잡한 자회사 구조</h4>
                                    <p style={{ color: '#8888a0', margin: 0, fontSize: '0.95rem' }}>수많은 자회사로 인한 복잡성과 비효율이 존재합니다.</p>
                                </div>
                            </div>

                            <h3 style={{ color: '#f0f0f5', fontSize: '1.2rem', marginBottom: '15px' }}>긍정적 모멘텀</h3>
                            <ul style={{ color: '#c0c0d0', paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '10px' }}><strong>광고 회복:</strong> 톡비즈 광고 매출 성장세</li>
                                <li style={{ marginBottom: '10px' }}><strong>핀테크 성장:</strong> 카카오페이, 카카오뱅크 실적 개선</li>
                                <li style={{ marginBottom: '10px' }}><strong>SM엔터 시너지:</strong> 콘텐츠 사업 강화</li>
                                <li><strong>비용 효율화:</strong> 구조조정 효과로 수익성 개선</li>
                            </ul>
                        </section>

                        {/* CTA Section */}
                        <section style={{
                            background: 'linear-gradient(135deg, #78350f 0%, #FF8C00 100%)',
                            borderRadius: '16px', padding: '30px', marginBottom: '40px',
                            textAlign: 'center', border: '1px solid #d4a853'
                        }}>
                            <h3 style={{ color: '#f0f0f5', fontSize: isMobile ? '1.2rem' : '1.4rem', marginBottom: '15px' }}>
                                더 자세한 카카오의 매출액 및 영업이익 차트를 확인하세요
                            </h3>
                            <p style={{ color: '#8888a0', marginBottom: '25px', fontSize: '0.95rem' }}>
                                분기별/연간 재무 데이터를 인터랙티브 차트로 확인하세요.
                            </p>
                            <Link to="/stocks/035720" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'linear-gradient(135deg, #fcd34d 0%, #d4a853 100%)',
                                color: '#000', padding: '14px 32px', borderRadius: '12px',
                                textDecoration: 'none', fontWeight: '600', fontSize: '1.05rem',
                                boxShadow: '0 4px 15px rgba(252, 211, 77, 0.4)'
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
                            </p>
                        </div>
                    </article>

                    <div style={{ marginTop: '40px', padding: '30px', background: 'rgba(0, 0, 0, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <h3 style={{ color: '#f0f0f5', fontSize: '1.2rem', marginBottom: '20px' }}>관련 기업 분석</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <Link to="/stocks/035420" style={{ color: '#FF8C00', background: 'rgba(255, 140, 0, 0.08)', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>NAVER (035420)</Link>
                            <Link to="/stocks/377300" style={{ color: '#FF8C00', background: 'rgba(255, 140, 0, 0.08)', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>카카오페이 (377300)</Link>
                            <Link to="/stocks/323410" style={{ color: '#FF8C00', background: 'rgba(255, 140, 0, 0.08)', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>카카오뱅크 (323410)</Link>
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

export default Kakao;
