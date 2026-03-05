import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';

const Contact = () => {
    const { t } = useTranslation();
    // Override body overflow for this page
    React.useEffect(() => {
        document.documentElement.classList.add('page-scroll-enabled');
        return () => {
            document.documentElement.classList.remove('page-scroll-enabled');
        };
    }, []);

    return (
        <>
            <Helmet>
                <title>{t('contact.pageTitle')}</title>
                <meta name="description" content={t('contact.pageDesc')} />
            </Helmet>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #141417 0%, #141417 100%)',
                color: '#f0f0f5',
                padding: '20px 15px 100px 15px',
                paddingTop: window.innerWidth > 768 ? '40px' : '20px',
                paddingLeft: window.innerWidth > 768 ? '20px' : '15px',
                paddingRight: window.innerWidth > 768 ? '20px' : '15px'
            }}>
                <div style={{
                    maxWidth: '800px',
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
                            color: '#FF8C00',
                            textDecoration: 'none',
                            marginBottom: '30px',
                            fontSize: '0.9rem',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#cc9955'}
                        onMouseLeave={(e) => e.target.style.color = '#FF8C00'}
                    >
                        <ArrowLeft size={18} />
                        {t('contact.goHome')}
                    </Link>
                    <LanguageToggle style={{ marginBottom: '30px' }} />

                    {/* Header */}
                    <header style={{
                        marginBottom: '40px',
                        paddingBottom: '20px',
                        borderBottom: '2px solid #2a2a30'
                    }}>
                        <h1 style={{
                            fontSize: window.innerWidth > 768 ? '2.5rem' : '1.8rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #FF8C00 0%, #FFa040 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: '10px'
                        }}>
                            {t('contact.title')}
                        </h1>
                        <p style={{ color: '#8888a0', fontSize: window.innerWidth > 768 ? '0.9rem' : '0.8rem' }}>
                            {t('contact.subtitle')}
                        </p>
                    </header>

                    {/* Content */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '16px',
                        padding: window.innerWidth > 768 ? '40px' : '20px',
                        lineHeight: '1.8',
                        fontSize: window.innerWidth > 768 ? '1rem' : '0.9rem'
                    }}>
                        {/* Email Contact */}
                        <section style={{ marginBottom: '40px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '20px'
                            }}>
                                <Mail size={24} color="#FF8C00" />
                                <h2 style={{
                                    color: '#f0f0f5',
                                    fontSize: window.innerWidth > 768 ? '1.5rem' : '1.2rem',
                                    margin: 0
                                }}>
                                    {t('contact.emailInquiry')}
                                </h2>
                            </div>
                            <div style={{
                                padding: '30px',
                                backgroundColor: '#141417',
                                borderRadius: '12px',
                                border: '1px solid #2a2a30',
                                textAlign: 'center'
                            }}>
                                <p style={{ color: '#8888a0', marginBottom: '15px', fontSize: '0.9rem' }}>
                                    {t('contact.inquiryEmail')}
                                </p>
                                <a
                                    href="mailto:contact@kstockview.com"
                                    style={{
                                        fontSize: window.innerWidth > 768 ? '1.3rem' : '0.95rem',
                                        color: '#FF8C00',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        display: 'inline-block',
                                        padding: window.innerWidth > 768 ? '10px 20px' : '8px 12px',
                                        background: 'rgba(255, 140, 0, 0.1)',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s',
                                        wordBreak: 'break-all',
                                        maxWidth: '100%'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255, 140, 0, 0.2)';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255, 140, 0, 0.1)';
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
                                <MessageSquare size={24} color="#00d084" />
                                <h2 style={{
                                    color: '#f0f0f5',
                                    fontSize: window.innerWidth > 768 ? '1.5rem' : '1.2rem',
                                    margin: 0
                                }}>
                                    {t('contact.inquiryTypes')}
                                </h2>
                            </div>
                            <ul style={{
                                color: '#c0c0d0',
                                paddingLeft: '20px',
                                lineHeight: '2',
                                fontSize: '1rem'
                            }}>
                                <li>{t('contact.type1')}</li>
                                <li>{t('contact.type2')}</li>
                                <li>{t('contact.type3')}</li>
                                <li>{t('contact.type4')}</li>
                                <li>{t('contact.type5')}</li>
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
                                <p style={{ color: '#fca5a5', margin: 0, fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: t('contact.notice') }} />
                            </div>
                        </section>

                        {/* Response Time */}
                        <section style={{ marginTop: '30px' }}>
                            <p style={{
                                color: '#8888a0',
                                fontSize: '0.85rem',
                                textAlign: 'center',
                                margin: 0
                            }}>
                                {t('contact.responseTime')}
                            </p>
                        </section>
                    </div>

                    {/* Footer */}
                    <footer style={{
                        marginTop: '40px',
                        textAlign: 'center',
                        color: '#5a5a70',
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
