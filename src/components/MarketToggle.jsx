import React from 'react';
import { useTranslation } from 'react-i18next';

const MarketToggle = ({ activeMarket = 'kr', onChange }) => {
    const { t } = useTranslation();
    const handleToggle = (market) => {
        if (market === activeMarket) return;
        if (onChange) onChange(market);
    };

    return (
        <div className="market-toggle">
            <button
                className={`market-toggle-btn ${activeMarket === 'kr' ? 'active' : ''}`}
                onClick={() => handleToggle('kr')}
            >
                {t('market.kr')}
            </button>
            <button
                className={`market-toggle-btn ${activeMarket === 'us' ? 'active' : ''}`}
                onClick={() => handleToggle('us')}
            >
                {t('market.us')}
            </button>
        </div>
    );
};

export default MarketToggle;
