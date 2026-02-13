import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEOHead = ({
    title,
    description,
    keywords,
    canonical,
    ogType = 'website',
    ogImage = 'https://kstockview.com/og-image.png',
    jsonLd = [],
}) => {
    const { i18n } = useTranslation();

    return (
        <Helmet>
            <html lang={i18n.language} />
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="robots" content="index, follow" />

            {/* Canonical */}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Hreflang - SPA serves both languages at same URL */}
            {canonical && <link rel="alternate" hreflang="ko" href={canonical} />}
            {canonical && <link rel="alternate" hreflang="en" href={canonical} />}
            {canonical && <link rel="alternate" hreflang="x-default" href={canonical} />}

            {/* Open Graph */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {canonical && <meta property="og:url" content={canonical} />}
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content="KStockView" />
            <meta property="og:locale" content={i18n.language === 'ko' ? 'ko_KR' : 'en_US'} />
            <meta property="og:locale:alternate" content={i18n.language === 'ko' ? 'en_US' : 'ko_KR'} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* JSON-LD Structured Data */}
            {jsonLd.map((data, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify({ '@context': 'https://schema.org', ...data })}
                </script>
            ))}
        </Helmet>
    );
};

export default SEOHead;
