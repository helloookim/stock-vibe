import React from 'react';

// Tiny trend line (no axes) — used in the peer companies list
const Sparkline = ({ values, color, width = 72, height = 24 }) => {
    const points = (values || []).filter(v => v != null);
    if (points.length < 2) return <svg width={width} height={height} aria-hidden="true" />;

    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = max - min || 1;
    const pad = 2;
    const coords = points.map((v, i) => [
        pad + (i / (points.length - 1)) * (width - pad * 2),
        pad + (1 - (v - min) / span) * (height - pad * 2),
    ]);

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            <polyline
                points={coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="2.2" fill={color} />
        </svg>
    );
};

export default Sparkline;
