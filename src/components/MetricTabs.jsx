import React, { useEffect, useRef, useState } from 'react';
import { BarChart3, TrendingUp, Wallet, Percent, Coins, LineChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatSignedChange } from '../metricSummary';
import { RANGE_PRESETS } from '../chartAxis';

const TAB_ICONS = {
    revenue: BarChart3,
    op: TrendingUp,
    ni: Wallet,
    margin: Percent,
    eps: Coins,
    valuation: LineChart,
};

// Segmented control for switching the financial chart shown on stock detail pages
export const MetricTabs = ({ tabs, activeTab, onChange }) => {
    const listRef = useRef(null);
    const [atEnd, setAtEnd] = useState(true);

    // When the bar scrolls sideways (mobile), keep the active tab centered in view
    useEffect(() => {
        const list = listRef.current;
        const active = list?.querySelector('.metric-tab.active');
        if (!list || !active || list.scrollWidth <= list.clientWidth) return;
        list.scrollTo({ left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2, behavior: 'smooth' });
    }, [activeTab]);

    // Fade the right edge only while more tabs are hidden there
    const updateEdge = () => {
        const list = listRef.current;
        if (list) setAtEnd(list.scrollLeft + list.clientWidth >= list.scrollWidth - 4);
    };
    useEffect(() => {
        updateEdge();
        window.addEventListener('resize', updateEdge);
        return () => window.removeEventListener('resize', updateEdge);
    }, [tabs.length]);

    return (
        <div className="metric-tabs-bar">
            <div
                ref={listRef}
                className={`metric-tabs ${atEnd ? '' : 'has-more'}`}
                role="tablist"
                onScroll={updateEdge}
            >
                {tabs.map(tab => {
                    const Icon = TAB_ICONS[tab.key];
                    return (
                        <button
                            key={tab.key}
                            role="tab"
                            aria-selected={tab.key === activeTab}
                            className={`metric-tab ${tab.key === activeTab ? 'active' : ''}`}
                            onClick={() => onChange(tab.key)}
                        >
                            {Icon && <Icon size={16} strokeWidth={2.2} />}
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Badge text + tone for the YoY change (see summarizeMetric's changeKind); also used by the compare pages
export const changeBadge = ({ change, changeUnit, changeKind, multiple, changePrefix }, t) => {
    switch (changeKind) {
        case 'turnProfit': return { text: t('metricTabs.turnProfit'), up: true };
        case 'turnLoss': return { text: t('metricTabs.turnLoss'), up: false };
        case 'lossContinued': return { text: t('metricTabs.lossContinued'), up: false };
        case 'multiple': return { text: `${changePrefix} ${t('metricTabs.times', { n: multiple })}`, up: true };
        default:
            if (change == null || !Number.isFinite(change)) return null;
            return { text: `${changePrefix} ${formatSignedChange(change, changeUnit)}`, up: change >= 0 };
    }
};

// Latest value + YoY badge for the active tab, with up to two stat boxes beside it.
// `info` is an optional explanation icon (the page's InfoTooltip) shown after the label.
export const MetricHeadline = ({ label, period, value, info, stats = [], ...change }) => {
    const { t } = useTranslation();
    const badge = changeBadge(change, t);
    return (
        <div className="metric-headline">
            <div className="metric-headline-main">
                <span className="metric-headline-label">
                    {label}
                    {period && <span className="metric-headline-period">{period}</span>}
                    {info}
                </span>
                <div className="metric-headline-value-row">
                    <span className="metric-headline-value">{value}</span>
                    {badge && (
                        <span className={`metric-change-badge ${badge.up ? 'up' : 'down'}`}>{badge.text}</span>
                    )}
                </div>
            </div>
            {stats.length > 0 && (
                <div className="metric-stats">
                    {stats.map(stat => (
                        <div key={stat.label} className="metric-stat">
                            <span className="metric-stat-label">{stat.label}</span>
                            <span className={`metric-stat-value ${stat.tone || ''}`}>{stat.value}</span>
                            {stat.sub && <span className="metric-stat-sub">{stat.sub}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Quarterly/annual switch + period presets, shown right under the metric tabs
export const ChartControls = ({ viewMode, onViewModeChange, rangePreset, onRangePresetChange, rangeText }) => {
    const { t } = useTranslation();
    return (
        <div className="chart-controls">
            <div className="chart-controls-group" role="radiogroup" aria-label={t('common.period')}>
                {['quarterly', 'annual'].map(mode => (
                    <button
                        key={mode}
                        role="radio"
                        aria-checked={viewMode === mode}
                        className={`chart-chip ${viewMode === mode ? 'active' : ''}`}
                        onClick={() => onViewModeChange(mode)}
                    >
                        {t(`analysis.${mode}`)}
                    </button>
                ))}
            </div>
            <div className="chart-controls-range">
                {rangeText && <span className="chart-controls-range-text">{rangeText}</span>}
                <div className="chart-controls-group" role="radiogroup">
                    {RANGE_PRESETS.map(preset => (
                        <button
                            key={preset}
                            role="radio"
                            aria-checked={rangePreset === preset}
                            className={`chart-chip ${rangePreset === preset ? 'active' : ''}`}
                            onClick={() => onRangePresetChange(preset)}
                        >
                            {t(`metricTabs.range.${preset}`)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Props that turn a .summary-card into a shortcut to its metric tab
export const summaryCardProps = (tab, activeTab, onSelect) => ({
    className: `summary-card clickable ${activeTab === tab ? 'active' : ''}`,
    role: 'button',
    tabIndex: 0,
    onClick: () => onSelect(tab),
    onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(tab);
        }
    },
});
