import React from 'react';

const MarketToggle = ({ activeMarket = 'kr', onChange }) => {
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
                KR
            </button>
            <button
                className={`market-toggle-btn ${activeMarket === 'us' ? 'active' : ''}`}
                onClick={() => handleToggle('us')}
            >
                US
            </button>
        </div>
    );
};

export default MarketToggle;
