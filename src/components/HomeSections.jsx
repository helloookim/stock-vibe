import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import Sparkline from './Sparkline';
import { formatSignedChange } from '../metricSummary';
import { formatEok } from '../compareUtils';

// "+12.4%" below +100%, "2.3배" / "2.3×" from +100% up
const growthText = (yoy, t) => (yoy >= 100 ? t('metricTabs.times', { n: (1 + yoy / 100).toFixed(1) }) : formatSignedChange(yoy));

/**
 * One spotlight card: latest quarter revenue / operating profit, a one-line hook generated
 * from the data (record quarter or YoY growth), and the last 8 quarters as bars.
 * `quarters` are processKrCompanyData quarterly rows (oldest → newest).
 */
export const SpotlightCard = ({ code, name, color, colorLight, quarters, isMobile, colors }) => {
    const { t, i18n } = useTranslation();
    const isEn = i18n.language === 'en';
    const rows = quarters.filter(q => q.revenue != null);
    if (rows.length === 0) return null;
    const latest = rows[rows.length - 1];
    const recent = rows.slice(-8).map(q => ({ label: `${String(q.year).slice(-2)}.${q.quarter}`, revenue: q.revenue }));
    const isRecord = latest.revenue >= Math.max(...rows.map(q => q.revenue));

    let hook = '';
    if (latest.rev_change != null) {
        const growth = growthText(latest.rev_change, t);
        if (isRecord) hook = t('home.spotlightHookRecord', { growth });
        else if (latest.op_change != null) hook = t('home.spotlightHookGrowth', { growth, op: growthText(latest.op_change, t) });
    }

    const fmt = (v) => formatEok(v / 1e8, isEn);
    const gradId = `spot-${code}`;

    return (
        <Link to={`/stocks/${code}`} className="home-spotlight-card" style={{ '--spot-color': color }}>
            <div className="home-spotlight-top">
                <div>
                    <p className="home-spotlight-name">
                        {name}
                        <span className="home-spotlight-code">{code}</span>
                    </p>
                    <p className="home-spotlight-period">
                        {t('home.spotlightPeriod', { year: latest.year, quarter: latest.quarter[0] })}
                    </p>
                </div>
                <div className="home-spotlight-figures">
                    <p className="home-spotlight-revenue" style={{ color }}>{fmt(latest.revenue)}</p>
                    {latest.op_profit != null && (
                        <p className="home-spotlight-op">
                            {t('metricTabs.tabs.op')} <strong style={{ color: latest.op_profit >= 0 ? colors.positive : colors.negative }}>{fmt(latest.op_profit)}</strong>
                        </p>
                    )}
                </div>
            </div>
            {hook && <p className="home-spotlight-hook">{hook}</p>}
            <div className="home-spotlight-chart">
                <ResponsiveContainer width="100%" height={isMobile ? 140 : 170}>
                    <BarChart data={recent} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`${gradId}-n`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id={`${gradId}-l`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={colorLight} stopOpacity={1} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.75} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="label" stroke={colors.textFaded} fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Bar dataKey="revenue" radius={[2, 2, 0, 0]} animationDuration={1200}>
                            {recent.map((_, i) => (
                                <Cell key={i} fill={i === recent.length - 1 ? `url(#${gradId}-l)` : `url(#${gradId}-n)`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="home-spotlight-cta" style={{ color }}>{t('home.spotlightViewAnalysis')}</p>
        </Link>
    );
};

/**
 * Popular-stock row: name + code, 8-quarter revenue sparkline, latest revenue and YoY.
 * `trend` = { values, revenue, yoy } or null while loading; `formatRevenue` renders the currency.
 */
export const StockTrendRow = ({ to, code, name, trend, formatRevenue, colors }) => {
    const up = trend?.yoy == null || trend.yoy >= 0;
    return (
        <Link to={to} className="home-stock-row">
            <span className="home-stock-row-main">
                <span className="home-stock-row-name">{name}</span>
                <span className="home-stock-row-code">{code}</span>
            </span>
            {trend ? (
                <>
                    <Sparkline values={trend.values} color={up ? colors.positive : colors.negative} />
                    <span className="home-stock-row-metric">
                        <span className="home-stock-row-revenue">{formatRevenue(trend.revenue)}</span>
                        {trend.yoy != null && (
                            <span className={`home-stock-row-yoy ${up ? 'up' : 'down'}`}>{formatSignedChange(trend.yoy)}</span>
                        )}
                    </span>
                </>
            ) : (
                <span className="home-stock-row-skeleton" aria-hidden="true" />
            )}
        </Link>
    );
};

// Market movers (latest quarter vs the same quarter a year earlier — see scripts/generate_movers.js)
export const MoversGrid = ({ movers, isEn, colors }) => {
    const { t } = useTranslation();
    const nameOf = (item) => (isEn ? (item.name_en || item.name) : item.name);
    const categories = [
        { key: 'revenue_growth_top', label: t('movers.revenueGrowth'), icon: '🚀', color: colors.positive, fmt: (i) => formatSignedChange(i.value) },
        { key: 'op_profit_turnaround', label: t('movers.opTurnaround'), icon: '📈', color: colors.revenue, fmt: (i) => formatEok(i.value / 1e8, isEn) },
        { key: 'margin_expansion', label: t('movers.marginExpansion'), icon: '✨', color: colors.gold, fmt: (i) => formatSignedChange(i.value, '%p') },
        { key: 'revenue_decline_top', label: t('movers.revenueDecliner'), icon: '📉', color: colors.negative, fmt: (i) => formatSignedChange(i.value) },
    ];
    return (
        <div className="home-movers-grid">
            {categories.map(cat => {
                const items = (movers[cat.key] || []).slice(0, 5);
                if (items.length === 0) return null;
                return (
                    <div key={cat.key} className="home-movers-card">
                        <p className="home-movers-card-title">
                            <span aria-hidden="true">{cat.icon}</span> {cat.label}
                            {cat.key === 'op_profit_turnaround' && <span className="home-movers-card-hint">{t('movers.turnaroundHint')}</span>}
                        </p>
                        {items.map((item, i) => (
                            <Link key={item.stock_code} to={`/stocks/${item.stock_code}`} className="home-movers-item">
                                <span className="home-movers-rank">{i + 1}</span>
                                <span className="home-movers-name">{nameOf(item)}</span>
                                <span className="home-movers-value" style={{ color: cat.color }}>{cat.fmt(item)}</span>
                            </Link>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};
