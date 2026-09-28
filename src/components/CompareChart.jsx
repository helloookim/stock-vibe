import React from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { yearAxisProps } from '../chartAxis';

// Growth mode shares the YoY chart's caps so one outlier quarter can't flatten the rest
const GROWTH_DOMAIN = [-100, 200];

const CompareTooltip = ({ active, payload, label, series, formatValue, extra, colors }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload;
    return (
        <div style={{
            background: colors.tooltipBg,
            border: `1px solid ${colors.tooltipBorder}`,
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            color: colors.textPrimary,
        }}>
            <p style={{ fontWeight: 600, margin: '0 0 6px', color: colors.textMuted }}>{label}</p>
            {series.map(s => (
                <p key={s.id} style={{ margin: '2px 0', color: s.color }}>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>: {formatValue(row[s.id])}
                    {extra && extra(row, s.id)}
                </p>
            ))}
        </div>
    );
};

/**
 * One metric for 1–3 companies on a shared period axis.
 * data: [{ displayLabel, year, [series.id]: value }]; series: [{ id, name, color }]
 * kind 'bar' → grouped bars, 'line' → one line per company. `mode` 'growth' / 'index' add a
 * reference line (0 / 100); growth also caps the axis. `highlightId` dims the other companies.
 */
const CompareChart = ({
    data, series, kind = 'bar', mode = 'amount', height, isMobile, colors,
    tickFormatter, formatValue, tooltipExtra, highlightId, yAxisWidth,
}) => {
    const opacityOf = (id) => (highlightId && highlightId !== id ? 0.22 : 1);
    const isGrowth = mode === 'growth';
    const domain = isGrowth ? GROWTH_DOMAIN : [dataMin => Math.min(dataMin, 0), 'auto'];

    return (
        <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={data} margin={isMobile ? { top: 10, right: 4, left: 0, bottom: 4 } : { top: 16, right: 12, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} vertical={false} />
                <XAxis {...yearAxisProps(data, isMobile)} stroke={colors.textMuted} />
                <YAxis
                    stroke={colors.textMuted}
                    fontSize={11}
                    tickFormatter={tickFormatter}
                    domain={mode === 'index' ? ['auto', 'auto'] : domain}
                    allowDataOverflow={isGrowth}
                    width={yAxisWidth ?? (isMobile ? 52 : 72)}
                />
                <Tooltip
                    content={<CompareTooltip series={series} formatValue={formatValue} extra={tooltipExtra} colors={colors} />}
                    cursor={{ fill: colors.bgInput }}
                />
                {mode === 'index' && <ReferenceLine y={100} stroke={colors.chartRef} strokeDasharray="4 4" />}
                {mode !== 'index' && <ReferenceLine y={0} stroke={colors.chartRef} />}
                {series.map(s => (kind === 'bar' ? (
                    <Bar
                        key={s.id}
                        dataKey={s.id}
                        name={s.name}
                        fill={s.color}
                        fillOpacity={opacityOf(s.id) * (colors.isLight ? 0.9 : 0.8)}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={36}
                        isAnimationActive={false}
                    />
                ) : (
                    <Line
                        key={s.id}
                        type="monotone"
                        dataKey={s.id}
                        name={s.name}
                        stroke={s.color}
                        strokeOpacity={opacityOf(s.id)}
                        strokeWidth={2.5}
                        dot={{ r: data.length > 24 ? 0 : 3, fill: s.color, fillOpacity: opacityOf(s.id), strokeWidth: 0 }}
                        activeDot={{ r: 4 }}
                        connectNulls
                        isAnimationActive={false}
                    />
                )))}
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default CompareChart;
