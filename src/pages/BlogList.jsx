import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText, ChevronRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const BlogList = () => {
    const { t } = useTranslation();
    React.useEffect(() => {
        document.documentElement.classList.add('page-scroll-enabled');
        return () => {
            document.documentElement.classList.remove('page-scroll-enabled');
        };
    }, []);

    const isMobile = window.innerWidth <= 768;

    const blogPosts = [
        {
            slug: 'samsung-electronics',
            title: '삼성전자 주가 전망 및 재무분석 2025',
            company: '삼성전자',
            code: '005930',
            category: '반도체 · 전자',
            description: '국내 시가총액 1위 기업, 글로벌 반도체 및 가전 산업의 핵심 플레이어. 메모리 반도체, 스마트폰, TV 등 다각화된 사업 분석.',
            color: '#e67e00'
        },
        {
            slug: 'sk-hynix',
            title: 'SK하이닉스 주가 전망 및 재무분석 2025',
            company: 'SK하이닉스',
            code: '000660',
            category: '메모리 반도체',
            description: 'HBM 시장 선두주자, AI 시대의 핵심 수혜주. DRAM·NAND Flash 메모리 반도체 전문 기업 분석.',
            color: '#ff4d4f'
        },
        {
            slug: 'hyundai-motor',
            title: '현대자동차 주가 전망 및 재무분석 2025',
            company: '현대자동차',
            code: '005380',
            category: '완성차 · EV',
            description: '글로벌 5위 자동차 제조사, 전기차 아이오닉 시리즈와 수소차 넥쏘로 친환경차 시장 공략.',
            color: '#00d084'
        },
        {
            slug: 'lg-energy-solution',
            title: 'LG에너지솔루션 주가 전망 및 재무분석 2025',
            company: 'LG에너지솔루션',
            code: '373220',
            category: '배터리',
            description: '글로벌 2위 배터리 기업, 테슬라·GM 등 글로벌 완성차 업체에 배터리 공급. ESS 사업 확대.',
            color: '#d4a853'
        },
        {
            slug: 'samsung-biologics',
            title: '삼성바이오로직스 주가 전망 및 재무분석 2025',
            company: '삼성바이오로직스',
            code: '207940',
            category: '바이오 CMO',
            description: '세계 최대 바이오의약품 위탁생산(CMO) 기업. 글로벌 제약사들의 바이오의약품 생산 파트너.',
            color: '#cc6e00'
        },
        {
            slug: 'hanwha-aerospace',
            title: '한화에어로스페이스 주가 전망 및 재무분석 2025',
            company: '한화에어로스페이스',
            code: '012450',
            category: '방산 · 우주',
            description: '한국 대표 방산·우주항공 기업. K-방산 수출 호조와 우주 산업 진출로 성장 동력 확보.',
            color: '#06b6d4'
        },
        {
            slug: 'kia',
            title: '기아 주가 전망 및 재무분석 2025',
            company: '기아',
            code: '000270',
            category: '자동차 · EV',
            description: '글로벌 SUV 및 전기차 시장 강자. EV6, EV9 등 전기차 라인업과 디자인 혁신으로 브랜드 가치 상승.',
            color: '#dc2626'
        },
        {
            slug: 'naver',
            title: 'NAVER 주가 전망 및 재무분석 2025',
            company: 'NAVER',
            code: '035420',
            category: 'AI · 검색 · 커머스',
            description: '대한민국 1위 검색 포털, 하이퍼클로바X AI 기술력. 검색광고, 커머스, 콘텐츠 플랫폼 사업 분석.',
            color: '#22c55e'
        },
        {
            slug: 'kakao',
            title: '카카오 주가 전망 및 재무분석 2025',
            company: '카카오',
            code: '035720',
            category: '메신저 · 핀테크 · 콘텐츠',
            description: '카카오톡 기반 슈퍼앱 플랫폼. 카카오페이, 카카오뱅크, 카카오엔터테인먼트 등 다각화된 사업 포트폴리오.',
            color: '#eab308'
        }
    ];

    return (
        <>
            <SEOHead
                title={t('blogList.title')}
                description={t('blogList.description')}
                canonical="https://kstockview.com/blogs"
            />
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #141417 0%, #141417 100%)',
                color: '#f0f0f5',
                padding: isMobile ? '20px 15px 100px 15px' : '40px 20px 100px 20px'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                    {/* Back Button */}
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#FF8C00',
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
                        textAlign: 'center'
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '20px'
                        }}>
                            <FileText size={32} style={{ color: '#cc6e00' }} />
                            <h1 style={{
                                fontSize: isMobile ? '1.8rem' : '2.5rem',
                                fontWeight: '800',
                                background: 'linear-gradient(135deg, #FF8C00 0%, #FFb366 100%)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                                margin: 0
                            }}>
                                종목 분석 리포트
                            </h1>
                        </div>
                        <p style={{
                            color: '#8888a0',
                            fontSize: '1rem',
                            maxWidth: '600px',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}>
                            한국 주요 상장 기업의 재무분석 리포트입니다.<br />
                            기업 개요, 재무 분석, 투자 포인트를 확인하세요.
                        </p>
                    </header>

                    {/* Blog Post Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                        gap: '20px'
                    }}>
                        {blogPosts.map((post) => (
                            <Link
                                key={post.slug}
                                to={`/blog/${post.slug}`}
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    textDecoration: 'none',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                                    e.currentTarget.style.borderColor = post.color;
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = `0 10px 30px -10px ${post.color}40`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Category Badge */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    flexWrap: 'wrap'
                                }}>
                                    <span style={{
                                        backgroundColor: `${post.color}20`,
                                        color: post.color,
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        {post.category}
                                    </span>
                                    <span style={{
                                        color: '#5a5a70',
                                        fontSize: '0.75rem'
                                    }}>
                                        {post.code}
                                    </span>
                                </div>

                                {/* Title */}
                                <h2 style={{
                                    color: '#f0f0f5',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    margin: 0,
                                    lineHeight: '1.4'
                                }}>
                                    {post.title}
                                </h2>

                                {/* Description */}
                                <p style={{
                                    color: '#8888a0',
                                    fontSize: '0.9rem',
                                    margin: 0,
                                    lineHeight: '1.6',
                                    flex: 1
                                }}>
                                    {post.description}
                                </p>

                                {/* Read More */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: post.color,
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    marginTop: '8px'
                                }}>
                                    자세히 보기
                                    <ChevronRight size={16} />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div style={{
                        marginTop: '60px',
                        textAlign: 'center',
                        padding: '40px 20px',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                        <h3 style={{
                            color: '#f0f0f5',
                            fontSize: '1.3rem',
                            marginBottom: '12px'
                        }}>
                            더 많은 종목의 재무 데이터가 필요하신가요?
                        </h3>
                        <p style={{
                            color: '#8888a0',
                            fontSize: '0.95rem',
                            marginBottom: '24px'
                        }}>
                            KStockView에서 200개 이상 상장 기업의 실시간 재무제표를 확인하세요.
                        </p>
                        <Link
                            to="/"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'linear-gradient(135deg, #e67e00 0%, #cc6e00 100%)',
                                color: '#fff',
                                padding: '14px 32px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '1rem',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 4px 15px rgba(255, 140, 0, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(255, 140, 0, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(255, 140, 0, 0.4)';
                            }}
                        >
                            전체 종목 보러가기
                            <ChevronRight size={18} />
                        </Link>
                    </div>

                    {/* Footer */}
                    <footer style={{
                        marginTop: '60px',
                        padding: '30px 20px',
                        borderTop: '1px solid #2a2a30',
                        textAlign: 'center',
                        color: '#5a5a70',
                        fontSize: '0.8rem'
                    }}>
                        <p style={{ marginBottom: '15px' }}>© 2026 KSTOCKVIEW. All rights reserved.</p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '20px',
                            flexWrap: 'wrap'
                        }}>
                            <Link to="/privacy" style={{ color: '#8888a0', textDecoration: 'underline' }}>
                                개인정보처리방침
                            </Link>
                            <Link to="/terms" style={{ color: '#8888a0', textDecoration: 'underline' }}>
                                이용약관
                            </Link>
                            <Link to="/contact" style={{ color: '#8888a0', textDecoration: 'underline' }}>
                                문의하기
                            </Link>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default BlogList;
