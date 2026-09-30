// Cloudflare Pages Function: /og/{code} → that stock's share image (PNG)
// Kept for links that still point here (App.jsx's Helmet tag and Kakao share button).
// Serves /og/kr/{code}.png from scripts/generate_og_images.mjs, or the site default when the
// stock has no image. (This used to return an SVG, which X, KakaoTalk and Facebook don't accept.)

export async function onRequest(context) {
    const { params, env, request } = context;
    const stockCode = params.stockCode;
    const origin = new URL(request.url).origin;

    if (!stockCode || !/^[0-9]{6}$/.test(stockCode)) {
        return new Response('Invalid stock code', { status: 400 });
    }

    // A missing file comes back as the SPA's index.html, so check the content type
    let res = await env.ASSETS.fetch(new URL(`/og/kr/${stockCode}.png`, origin));
    if (!(res.ok && (res.headers.get('content-type') || '').startsWith('image/'))) {
        res = await env.ASSETS.fetch(new URL('/og-image.png', origin));
    }
    return new Response(res.body, {
        status: res.status,
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400',
        },
    });
}
