import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { loadKrCompanyData, processKrCompanyData } from '../krDataLoader';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

const DARK_COLORS = {
    bg: '#141417', card: '#1c1c22', text: '#f0f0f5', muted: '#8888a0',
    border: 'rgba(255,255,255,0.08)', accent: '#FF8C00', bar: '#5B8DEF',
    positive: '#00d084', negative: '#ff4d4f',
};
const LIGHT_COLORS = {
    bg: '#F8F6F3', card: '#FFFFFF', text: '#1a1a1a', muted: '#505050',
    border: 'rgba(0,0,0,0.08)', accent: '#E07800', bar: '#3A6FD8',
    positive: '#008C46', negative: '#DC2626',
};

const Embed = () => {
    const { stockCode } = useParams();
    const [searchParams] = useSearchParams();
    const theme = searchParams.get('theme') || 'dark';
    const c = theme === 'light' ? LIGHT_COLORS : DARK_COLORS;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!stockCode) return;
        loadKrCompanyData(stockCode)
            .then(raw => {
                if (!raw) { setLoading(false); return; }
                const { quarterlyData } = processKrCompanyData(raw);
                const last4 = quarterlyData.slice(-4).map(q => ({
                    label: q.displayLabel,
                    revenue: q.revenue ? q.revenue / 1e8 : 0,
                }));
                setData({
                    name: raw.name,
                    name_en: raw.name_en || raw.name,
                    code: raw.stock_code,
                    market: raw.market,
                    per: raw.last_per,
                    pbr: raw.last_pbr,
                    chartData: last4,
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [stockCode]);

    if (loading) {
        return (
            <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: c.bg, color: c.muted, fontFamily: 'sans-serif' }}>
                Loading...
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: c.bg, color: c.muted, fontFamily: 'sans-serif' }}>
                Not found
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            background: c.bg,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px',
            boxSizing: 'border-box',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '320px',
                background: c.card,
                border: `1px solid ${c.border}`,
                borderRadius: '12px',
                padding: '16px',
            }}>
                {/* Header */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: c.text }}>
                                {data.name}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: c.muted }}>
                                {data.code} · {data.market}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {data.per != null && (
                                <span style={{ fontSize: '0.7rem', color: c.muted, display: 'block' }}>
                                    PER {data.per.toFixed(1)}
                                </span>
                            )}
                            {data.pbr != null && (
                                <span style={{ fontSize: '0.7rem', color: c.muted, display: 'block' }}>
                                    PBR {data.pbr.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mini chart */}
                {data.chartData.length > 0 && (
                    <div style={{ width: '100%', height: 100, marginBottom: '8px' }}>
                        <ResponsiveContainer>
                            <BarChart data={data.chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                                <Bar dataKey="revenue" radius={[3, 3, 0, 0]}>
                                    {data.chartData.map((_, i) => (
                                        <Cell key={i} fill={c.bar} opacity={0.5 + (i / data.chartData.length) * 0.5} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                            {data.chartData.map((d, i) => (
                                <span key={i} style={{ fontSize: '0.6rem', color: c.muted }}>{d.label.split(' ').pop()}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: `1px solid ${c.border}` }}>
                    <a
                        href={`https://kstockview.com/stocks/${data.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.7rem', color: c.accent, textDecoration: 'none' }}
                    >
                        Powered by KStockView
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Embed;
