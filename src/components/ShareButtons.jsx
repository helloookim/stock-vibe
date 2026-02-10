import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ShareButtons = ({ companyName, stockCode, url }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef(null);

    const shareUrl = url || window.location.href;
    const shareTitle = t('share.shareTitle', { name: companyName, code: stockCode });
    const shareDescription = t('share.shareDesc', { name: companyName });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error(t('share.clipboardError'), err);
        }
    };

    const handleKakaoShare = () => {
        if (window.Kakao && window.Kakao.isInitialized()) {
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: shareTitle,
                    description: shareDescription,
                    imageUrl: `${window.location.origin}/og-image.png`,
                    link: {
                        mobileWebUrl: shareUrl,
                        webUrl: shareUrl,
                    },
                },
                buttons: [
                    {
                        title: t('share.viewMore'),
                        link: {
                            mobileWebUrl: shareUrl,
                            webUrl: shareUrl,
                        },
                    },
                ],
            })
            .then(() => console.log('Kakao share success'))
            .catch((err) => {
                console.error('Kakao share error:', err);
                alert('Kakao share error: ' + (err.message || JSON.stringify(err)));
            });
        } else {
            console.error('Kakao SDK not loaded or not initialized');
            alert(t('share.kakaoError'));
        }
        setIsOpen(false);
    };

    const handleTwitterShare = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        setIsOpen(false);
    };

    const handleFacebookShare = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
        setIsOpen(false);
    };

    const handleNaverShare = () => {
        const naverUrl = `https://share.naver.com/web/shareView?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`;
        window.open(naverUrl, '_blank', 'width=600,height=400');
        setIsOpen(false);
    };

    return (
        <div className="share-dropdown" ref={dropdownRef}>
            <button
                className="share-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                title={t('share.share')}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
            </button>

            {isOpen && (
                <div className="share-dropdown-menu">
                    <button className="share-menu-item" onClick={handleCopyLink}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span>{copied ? t('share.copied') : t('share.copyLink')}</span>
                    </button>

                    <button className="share-menu-item share-kakao" onClick={handleKakaoShare}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3C6.477 3 2 6.463 2 10.762c0 2.756 1.83 5.17 4.574 6.542-.142.51-.455 1.85-.52 2.13-.08.354.13.35.273.255.112-.074 1.79-1.214 2.522-1.713.706.096 1.435.146 2.151.146 5.523 0 10-3.463 10-7.76C21 6.463 17.523 3 12 3z" />
                        </svg>
                        <span>{t('share.kakao')}</span>
                    </button>

                    <button className="share-menu-item share-twitter" onClick={handleTwitterShare}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span>X</span>
                    </button>

                    <button className="share-menu-item share-facebook" onClick={handleFacebookShare}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span>{t('share.facebook')}</span>
                    </button>

                    <button className="share-menu-item share-naver" onClick={handleNaverShare}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.627 24H24V0h-7.727z" />
                        </svg>
                        <span>{t('share.naverBlog')}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShareButtons;
