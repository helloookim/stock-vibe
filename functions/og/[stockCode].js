// Cloudflare Pages Function: Dynamic OG Image (SVG)
// Generates per-stock social preview images for better sharing CTR
// Returns SVG with company name, key metrics, and mini bar chart

export async function onRequest(context) {
    const { params, env } = context;
    const stockCode = params.stockCode;

    if (!stockCode || !/^[0-9]{6}$/.test(stockCode)) {
        return new Response('Invalid stock code', { status: 400 });
    }

    try {
        // Fetch stock data from static assets
        const dataUrl = new URL(`/data/kr_stocks/${stockCode}.json`, context.request.url);
        const res = await env.ASSETS.fetch(dataUrl.toString());

        if (!res.ok) {
            return new Response('Stock not found', { status: 404 });
        }

        const data = await res.json();
        const name = data.name || stockCode;
        const market = data.market || '';
        const per = data.last_per != null ? data.last_per.toFixed(1) : '-';
        const pbr = data.last_pbr != null ? data.last_pbr.toFixed(2) : '-';

        // Get latest annual revenue/op_profit
        const annual = (data.annual || []).sort((a, b) => b.year - a.year);
        const latest = annual[0];
        const formatNum = (v) => {
            if (!v) return '-';
            if (Math.abs(v) >= 1e12) return `${(v / 1e12).toFixed(1)}조`;
            if (Math.abs(v) >= 1e8) return `${Math.round(v / 1e8).toLocaleString()}억`;
            return v.toLocaleString();
        };
        const revenue = latest ? formatNum(latest.revenue) : '-';
        const opProfit = latest ? formatNum(latest.op_profit) : '-';

        // Mini chart data: last 4 quarters revenue
        const quarterly = (data.quarterly || [])
            .sort((a, b) => a.year - b.year || (a.quarter || '').localeCompare(b.quarter || ''))
            .slice(-4);

        const maxRev = Math.max(...quarterly.map(q => q.revenue || 0), 1);
        const barWidth = 50;
        const barGap = 15;
        const chartHeight = 80;
        const chartX = 480;
        const chartY = 160;

        const bars = quarterly.map((q, i) => {
            const h = ((q.revenue || 0) / maxRev) * chartHeight;
            const x = chartX + i * (barWidth + barGap);
            const y = chartY + chartHeight - h;
            const label = q.quarter || '';
            return `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="4" fill="#5B8DEF" opacity="${0.5 + (i / 4) * 0.5}"/>
                    <text x="${x + barWidth / 2}" y="${chartY + chartHeight + 16}" text-anchor="middle" fill="#8888a0" font-size="12">${label}</text>`;
        }).join('\n');

        const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#141417"/>
            <stop offset="100%" stop-color="#1c1c22"/>
        </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>

    <!-- Border accent -->
    <rect x="0" y="0" width="1200" height="4" fill="#FF8C00"/>

    <!-- Company Name -->
    <text x="60" y="100" font-family="sans-serif" font-size="48" font-weight="700" fill="#f0f0f5">${escapeXml(name)}</text>
    <text x="60" y="140" font-family="sans-serif" font-size="22" fill="#8888a0">${escapeXml(stockCode)} · ${escapeXml(market)}</text>

    <!-- Metrics -->
    <text x="60" y="220" font-family="sans-serif" font-size="16" fill="#8888a0">매출액</text>
    <text x="60" y="250" font-family="sans-serif" font-size="28" font-weight="600" fill="#5B8DEF">${escapeXml(revenue)}</text>

    <text x="60" y="310" font-family="sans-serif" font-size="16" fill="#8888a0">영업이익</text>
    <text x="60" y="340" font-family="sans-serif" font-size="28" font-weight="600" fill="#00d084">${escapeXml(opProfit)}</text>

    <text x="60" y="400" font-family="sans-serif" font-size="16" fill="#8888a0">PER</text>
    <text x="60" y="430" font-family="sans-serif" font-size="28" font-weight="600" fill="#f0f0f5">${escapeXml(per)}</text>

    <text x="250" y="400" font-family="sans-serif" font-size="16" fill="#8888a0">PBR</text>
    <text x="250" y="430" font-family="sans-serif" font-size="28" font-weight="600" fill="#f0f0f5">${escapeXml(pbr)}</text>

    <!-- Mini Chart -->
    <text x="${chartX}" y="${chartY - 10}" font-family="sans-serif" font-size="14" fill="#8888a0">분기별 매출 추이</text>
    ${bars}

    <!-- Branding -->
    <text x="60" y="560" font-family="sans-serif" font-size="20" font-weight="700" fill="#FF8C00">KSTOCKVIEW</text>
    <text x="60" y="585" font-family="sans-serif" font-size="14" fill="#5a5a70">kstockview.com</text>

    <!-- Logo accent line -->
    <rect x="60" y="500" width="100" height="3" rx="1.5" fill="#FF8C00" opacity="0.5"/>
</svg>`;

        return new Response(svg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (e) {
        return new Response('Error generating OG image', { status: 500 });
    }
}

function escapeXml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
