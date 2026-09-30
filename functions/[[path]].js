// Cloudflare Pages Function (every path):
// 1. 301 redirect for old stock URLs: /{6-digit-code} → /stocks/{6-digit-code}
// 2. Per-page share previews: link crawlers (X, KakaoTalk, Facebook, Slack) don't run JS, so the
//    tags React Helmet sets never reach them. For stock and compare pages the SPA's index.html
//    is rewritten here with that page's title, description, canonical URL and OG image.
//    Images come from scripts/generate_og_images.mjs; pages without one keep /og-image.png.

import {
    krQuarterRows, usQuarterRows, summarizeQuarters, krPeriodLabel, usPeriodLabel,
    formatKrwShort, formatUsdKorean, summarySentence, isForeignKrListing,
} from '../src/ogSummary.js';
import { prettyUsName } from '../src/compareUtils.js';

const SITE = 'https://kstockview.com';
const DEFAULT_IMAGE = `${SITE}/og-image.png`;

export async function onRequest(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const path = params.path ? params.path.join('/') : '';

    // Old-style stock URL → /stocks/ prefix
    if (/^[0-9]{6}$/.test(path)) {
        return new Response(null, {
            status: 301,
            headers: {
                'Location': `${url.origin}/stocks/${path}`,
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    }

    const response = await context.next();
    if (request.method !== 'GET' || !(response.headers.get('content-type') || '').includes('text/html')) {
        return response;
    }

    // Any failure here leaves the page exactly as the static server sent it
    try {
        const meta = await pageMeta(path, env, url);
        return meta ? rewriteMeta(response, meta) : response;
    } catch {
        return response;
    }
}

// ---------------------------------------------------------------- per-route meta

async function pageMeta(path, env, url) {
    let m;
    if ((m = /^stocks\/([0-9]{6})\/?$/.exec(path))) return krStockMeta(m[1], env, url);
    if ((m = /^us-stocks\/([A-Za-z0-9.\-]{1,10})\/?$/.exec(path))) return usStockMeta(m[1].toUpperCase(), env, url);
    if ((m = /^global-compare\/([0-9]{6})-vs-([A-Za-z0-9.\-]{1,10})\/?$/.exec(path))) return globalCompareMeta(m[1], m[2].toUpperCase(), env, url);
    if ((m = /^compare\/([0-9]{6}(?:-vs-[0-9]{6}){1,3})\/?$/.exec(path))) return compareMeta(m[1].split('-vs-'), env, url);
    return null;
}

async function krStockMeta(code, env, url) {
    const data = await assetJson(env, url, `/data/kr_stocks/${code}.json`);
    if (!data) return null;
    const name = data.name || code;
    const summary = isForeignKrListing(code) ? null : summarizeQuarters(krQuarterRows(data));
    const sentence = summary && summarySentence(`${name}(${code})`, krPeriodLabel(summary.latest), summary, formatKrwShort);
    return {
        title: `${name} (${code}) 재무제표 & 실적 분석 - 매출액, 영업이익 | KStockView`,
        description: sentence || `${name}(${code})의 분기별/연간 재무제표, 매출액, 영업이익, 영업이익률, EPS 등 실적 데이터를 차트로 분석합니다.`,
        canonical: `${SITE}/stocks/${code}`,
        image: await imageIfExists(env, url, `/og/kr/${code}.png`),
    };
}

async function usStockMeta(ticker, env, url) {
    const data = await assetJson(env, url, `/data/us_stocks/${ticker}.json`);
    if (!data) return null;
    const name = prettyUsName(data.name) || ticker;
    const summary = summarizeQuarters(usQuarterRows(data));
    const sentence = summary && summarySentence(`${name}(${ticker})`, usPeriodLabel(summary.latest, data.fy_end_month), summary, formatUsdKorean);
    return {
        title: `${name} (${ticker}) 재무제표 분석 - 매출, 순이익, EPS | KStockView`,
        description: sentence || `${name} (${ticker})의 분기별/연간 매출액, 영업이익, 순이익, EPS 데이터를 차트로 분석합니다.`,
        canonical: `${SITE}/us-stocks/${ticker}`,
        image: await imageIfExists(env, url, `/og/us/${ticker}.png`),
    };
}

async function globalCompareMeta(code, ticker, env, url) {
    const [kr, us] = await Promise.all([
        assetJson(env, url, `/data/kr_stocks/${code}.json`),
        assetJson(env, url, `/data/us_stocks/${ticker}.json`),
    ]);
    if (!kr || !us) return null;
    const krName = kr.name || code;
    const usName = prettyUsName(us.name) || ticker;
    return {
        title: `${krName} vs ${usName} 실적 비교 (USD) | KStockView`,
        description: `${krName}와 ${usName}의 매출액, 영업이익을 분기별 평균 환율로 USD 환산하여 비교합니다.`,
        canonical: `${SITE}/global-compare/${code}-vs-${ticker}`,
        image: await imageIfExists(env, url, `/og/gc/${code}-vs-${ticker}.png`),
    };
}

async function compareMeta(codes, env, url) {
    const companies = await Promise.all(codes.map(c => assetJson(env, url, `/data/kr_stocks/${c}.json`)));
    if (companies.some(c => !c)) return null;
    const names = companies.map((c, i) => c.name || codes[i]);
    return {
        title: `${names.join(' vs ')} 실적 비교 | KStockView`,
        description: `${names.join(', ')}의 매출액, 영업이익, 영업이익률을 차트로 비교 분석합니다.`,
        canonical: `${SITE}/compare/${codes.join('-vs-')}`,
        image: DEFAULT_IMAGE,
    };
}

// ---------------------------------------------------------------- helpers

// Static asset as JSON, or null. A missing file comes back as the SPA's index.html (200), so
// the content type is checked rather than the status.
async function assetJson(env, url, assetPath) {
    const res = await env.ASSETS.fetch(new URL(assetPath, url.origin));
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) return null;
    return res.json();
}

async function imageIfExists(env, url, assetPath) {
    const res = await env.ASSETS.fetch(new URL(assetPath, url.origin), { method: 'HEAD' });
    const isImage = res.ok && (res.headers.get('content-type') || '').startsWith('image/');
    return isImage ? `${SITE}${assetPath}` : DEFAULT_IMAGE;
}

const setContent = (value) => ({ element(el) { el.setAttribute('content', value); } });
const setHref = (value) => ({ element(el) { el.setAttribute('href', value); } });

function rewriteMeta(response, { title, description, canonical, image }) {
    return new HTMLRewriter()
        .on('title', { element(el) { el.setInnerContent(title); } })
        .on('meta[name="title"]', setContent(title))
        .on('meta[name="description"]', setContent(description))
        .on('link[rel="canonical"]', setHref(canonical))
        .on('link[rel="alternate"]', setHref(canonical))
        .on('meta[property="og:type"]', setContent('article'))
        .on('meta[property="og:url"]', setContent(canonical))
        .on('meta[property="og:title"]', setContent(title))
        .on('meta[property="og:description"]', setContent(description))
        .on('meta[property="og:image"]', setContent(image))
        .on('meta[property="twitter:url"]', setContent(canonical))
        .on('meta[property="twitter:title"]', setContent(title))
        .on('meta[property="twitter:description"]', setContent(description))
        .on('meta[property="twitter:image"]', setContent(image))
        .transform(response);
}
