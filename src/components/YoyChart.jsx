import React, { useMemo } from 'react';
import {
    ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { yearAxisProps } from '../chartAxis';

// The axis never stretches past these, so one +1,800% quarter can't flatten every other point.
// Points beyond them are pinned to the edge and drawn as triangles; the tooltip shows the real value.
const CAP_HIGH = 200;
const CAP_LOW = -100;

function yoyScale(values) {
    if (values.length === 0) return { domain: [-10, 10], ticks: [-10, 0, 10] };
    const lo = Math.max(Math.min(...values), CAP_LOW);
    const hi = Math.min(Math.max(...values), CAP_HIGH);
    const span = hi - lo;
    const step = span <= 60 ? 10 : span <= 150 ? 25 : 50;
    const lower = Math.min(Math.floor(lo / step) * step, 0);
    const upper = Math.max(Math.ceil(hi / step) * step, 0);
    const ticks = [];
    for (let v = lower; v <= upper; v += step) ticks.push(v);
    return { domain: [lower, upper], ticks };
}

const YoyTooltip = ({ active, payload, label, colors }) => {
    if (!active || !payload?.length) return null;
    const value = payload[0].payload.yoy;
    if (value == null) return null;
    return (
        <div style={{
            backgroundColor: colors.tooltipBg,
            border: `1px solid ${colors.tooltipBorder}`,
            borderRadius: '8px',
            padding: '8px 12px',
            color: colors.textPrimary,
        }}>
            <p style={{ margin: 0, marginBottom: '4px', color: colors.textMuted, fontSize: '12px' }}>{label}</p>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: value >= 0 ? colors.positive : colors.negative }}>
                YoY {value > 0 ? '+' : ''}{value.toFixed(1)}%
            </p>
        </div>
    );
};

// YoY % line under a bar chart; shares the bar chart's margins/Y-axis width so points line up with bars
const YoyChart = ({ data, yoyKey, height, margin, yAxisWidth, isMobile, colors }) => {
    const { plotData, domain, ticks } = useMemo(() => {
        const scale = yoyScale((data || []).map(d => d[yoyKey]).filter(v => v != null));
        const [lower, upper] = scale.domain;
        return {
            ...scale,
            plotData: (data || []).map(d => {
                const yoy = d[yoyKey] ?? null;
                const plotted = yoy == null ? null : Math.min(Math.max(yoy, lower), upper);
                return { displayLabel: d.displayLabel, year: d.year, yoy, plotted, clipped: yoy != null && plotted !== yoy };
            }),
        };
    }, [data, yoyKey]);

    const renderDot = ({ cx, cy, index, payload }) => {
        if (payload.yoy == null || cx == null || cy == null) return <g key={`yoy-${index}`} />;
        const color = payload.yoy >= 0 ? colors.positive : colors.negative;
        if (payload.clipped) {
            // Triangle with its tip on the axis edge, pointing off the chart: the real value is beyond it.
            // The body stays inside the plot area so the chart's clip path doesn't cut it off.
            const d = payload.yoy > 0
                ? `M${cx},${cy} L${cx - 5},${cy + 8} L${cx + 5},${cy + 8} Z`
                : `M${cx},${cy} L${cx - 5},${cy - 8} L${cx + 5},${cy - 8} Z`;
            return <path key={`yoy-${index}`} d={d} fill={color} />;
        }
        return <circle key={`yoy-${index}`} cx={cx} cy={cy} r={2.5} fill={color} />;
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={plotData} margin={margin}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} vertical={false} />
                <XAxis {...yearAxisProps(plotData, isMobile)} stroke={colors.textMuted} />
                <YAxis
                    stroke={colors.positive}
                    fontSize={9}
                    tickFormatter={(v) => `${v}%`}
                    domain={domain}
                    ticks={ticks}
                    width={yAxisWidth}
                    allowDataOverflow
                />
                <Tooltip content={<YoyTooltip colors={colors} />} />
                <ReferenceLine y={0} stroke={colors.chartRef} strokeDasharray="5 5" />
                <Line
                    type="monotone"
                    dataKey="plotted"
                    name="YoY"
                    stroke={colors.chartRef}
                    strokeWidth={1.5}
                    dot={renderDot}
                    activeDot={{ r: 4 }}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default YoyChart;
