// Share-preview (Open Graph) images, 1200×630 PNG, rendered with headless Chrome.
//
// Usage:
//   node scripts/generate_og_images.mjs                 # default image + top 300 KR + top 200 US + popular pairs
//   node scripts/generate_og_images.mjs --kr 500 --us 300
//   node scripts/generate_og_images.mjs --code 005930   # one KR stock (repeatable)
//   node scripts/generate_og_images.mjs --ticker AAPL   # one US stock (repeatable)
//   node scripts/generate_og_images.mjs --only default  # default | kr | us | gc
//
// Output (served as static files; functions/[[path]].js points og:image at them when present):
//   public/og-image.png                  site default
//   public/og/kr/{code}.png              KR stock pages
//   public/og/us/{TICKER}.png            US stock pages
//   public/og/gc/{code}-vs-{TICKER}.png  global-compare popular pairs
//
// Figures are the latest reported quarter from the per-company JSONs, so re-run after each
// quarterly data update. Stocks without an image fall back to the site default.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
    krQuarterRows, usQuarterRows, summarizeQuarters, krPeriodLabel, usPeriodLabel,
    shortQuarter, formatKrwShort, formatUsdKorean, usQuarterEnd, isForeignKrListing,
} from '../src/ogSummary.js';
import { prettyUsName, POPULAR_PAIRS } from '../src/compareUtils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.join(PUBLIC, 'data');
const OG = path.join(PUBLIC, 'og');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const W = 1200;
const H = 630;

// ---------------------------------------------------------------- args
const args = process.argv.slice(2);
const argValue = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const argValues = (flag) => args.flatMap((a, i) => (a === flag && args[i + 1] ? [args[i + 1]] : []));
const KR_TOP = Number(argValue('--kr', 300));
const US_TOP = Number(argValue('--us', 200));
const ONLY = argValue('--only', null);
const ONE_CODES = argValues('--code');
const ONE_TICKERS = argValues('--ticker').map(t => t.toUpperCase());

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));
const readIf = (p) => (fs.existsSync(p) ? readJson(p) : null);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

// ---------------------------------------------------------------- page pieces
const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
  body {
    font-family: 'Pretendard', -apple-system, 'Apple SD Gothic Neo', sans-serif;
    background: #F8F6F3; color: #16161a; padding: 50px 64px 40px;
    display: flex; flex-direction: column; -webkit-font-smoothing: antialiased;
  }
  body::before { content: ''; position: absolute; left: 0; top: 0; right: 0; height: 8px; background: #E07800; }
  .eyebrow { font-size: 22px; font-weight: 700; color: #8a8a94; letter-spacing: .01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .name { font-size: 76px; font-weight: 800; letter-spacing: -.035em; line-height: 1.12; margin-top: 6px; white-space: nowrap; overflow: hidden; }
  .mid { flex: 1; display: grid; grid-template-columns: 1fr 470px; gap: 40px; align-items: end; margin-top: 18px; min-height: 0; }
  .stat-label { font-size: 25px; font-weight: 700; color: #6b6b75; line-height: 1.35; }
  .stat-value { font-size: 92px; font-weight: 800; letter-spacing: -.045em; line-height: 1.05; margin-top: 6px; white-space: nowrap; }
  .stat-value.neg { color: #d63b3b; }
  .chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
  .chip { font-size: 22px; font-weight: 800; padding: 8px 14px; border-radius: 10px; white-space: nowrap; }
  .chip.up { color: #0a8f4f; background: #e3f4ea; }
  .chip.down { color: #d63b3b; background: #fbe8e8; }
  .chip.hi { color: #E07800; background: #fff0dc; }
  .stat-sub { font-size: 22px; font-weight: 600; color: #8a8a94; margin-top: 16px; }
  .chart { display: flex; flex-direction: column; height: 100%; max-height: 330px; }
  .chart-title { font-size: 18px; font-weight: 700; color: #9a9aa2; margin-bottom: 10px; text-align: right; }
  .plot { position: relative; flex: 1; display: flex; gap: 10px; }
  .col { flex: 1; position: relative; }
  .bar { position: absolute; left: 0; right: 0; border-radius: 6px; }
  .zero { position: absolute; left: 0; right: 0; height: 2px; background: #d8d2c8; }
  .xlabels { display: flex; gap: 10px; margin-top: 10px; }
  .xlabels div { flex: 1; text-align: center; font-size: 16px; font-weight: 600; color: #a2a2aa; }
  .xlabels div.last { color: #E07800; font-weight: 800; }
  .foot { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 22px;
          font-size: 20px; color: #8a8a94; font-weight: 600; }
  .brand { font-size: 30px; font-weight: 800; color: #16161a; letter-spacing: -.01em; }
  .brand span { color: #E07800; }
`;

const footer = (right) => `<div class="foot"><div class="brand">kstock<span>view</span>.com</div><div>${esc(right)}</div></div>`;

const chipClass = (yoy) => (yoy.kind === 'up' || yoy.kind === 'turnProfit' ? 'up' : 'down');

// Up to 8 quarterly bars around a zero line; the latest quarter is the accent
function barChart(bars, title) {
    const vals = bars.map(b => b.value).filter(v => v != null);
    const hi = Math.max(0, ...vals);
    const lo = Math.min(0, ...vals);
    const span = hi - lo || 1;
    const zeroFromTop = (hi / span) * 100;
    const cols = bars.map((b, i) => {
        if (b.value == null) return '<div class="col"></div>';
        const last = i === bars.length - 1;
        const pos = b.value >= 0;
        const h = Math.max(1.2, (Math.abs(b.value) / span) * 100);
        const color = pos ? (last ? '#E07800' : '#E9DCC8') : (last ? '#d63b3b' : '#F0C9C9');
        const place = pos ? `bottom:${100 - zeroFromTop}%` : `top:${zeroFromTop}%`;
        return `<div class="col"><div class="bar" style="${place};height:${h}%;background:${color}"></div></div>`;
    }).join('');
    const labels = bars.map((b, i) => `<div${i === bars.length - 1 ? ' class="last"' : ''}>${shortQuarter(b)}</div>`).join('');
    return `<div class="chart">
        <div class="chart-title">${esc(title)}</div>
        <div class="plot">${cols}<div class="zero" style="top:calc(${zeroFromTop}% - 1px)"></div></div>
        <div class="xlabels">${labels}</div>
    </div>`;
}

function stockCard({ eyebrow, name, period, summary, formatMoney }) {
    const { metric, value, yoy, margin, isTenYearHigh, bars, latest } = summary;
    const chips = [
        yoy ? `<span class="chip ${chipClass(yoy)}">전년 동기 대비 ${esc(yoy.text)}</span>` : '',
        isTenYearHigh ? '<span class="chip hi">최근 10년 분기 최대</span>' : '',
    ].join('');
    const sub = [
        metric.key !== 'revenue' && latest.revenue != null ? `매출 ${formatMoney(latest.revenue)}` : '',
        margin != null ? `영업이익률 ${margin.toFixed(1)}%` : '',
    ].filter(Boolean).join(' · ');
    return `
        <div class="eyebrow">${esc(eyebrow)}</div>
        <div class="name fit">${esc(name)}</div>
        <div class="mid">
            <div>
                <div class="stat-label">${esc(period)} ${metric.label}</div>
                <div class="stat-value fit${value < 0 ? ' neg' : ''}">${esc(formatMoney(value))}</div>
                ${chips ? `<div class="chips">${chips}</div>` : ''}
                ${sub ? `<div class="stat-sub">${esc(sub)}</div>` : ''}
            </div>
            ${barChart(bars, `분기 ${metric.label}`)}
        </div>
        ${footer('분기 실적 · 재무제표 차트')}`;
}

// ---------------------------------------------------------------- data
const krIndex = readJson(path.join(DATA, 'kr_company_index.json'));
const usIndex = readJson(path.join(DATA, 'us_company_index.json'));
const fx = readJson(path.join(DATA, 'krw_usd_rates.json'));
const krByCode = new Map(krIndex.map(c => [c.stock_code, c]));

const krCompany = (code) => readIf(path.join(DATA, 'kr_stocks', `${code}.json`));
const usCompany = (ticker) => readIf(path.join(DATA, 'us_stocks', `${ticker}.json`));

function krCard(code) {
    if (isForeignKrListing(code)) return null;
    const data = krCompany(code);
    if (!data) return null;
    const summary = summarizeQuarters(krQuarterRows(data));
    if (!summary) return null;
    const meta = krByCode.get(code) || {};
    return stockCard({
        eyebrow: [data.market || meta.market, code, data.sector || meta.sector].filter(Boolean).join(' · '),
        name: data.name,
        period: krPeriodLabel(summary.latest),
        summary,
        formatMoney: formatKrwShort,
    });
}

function usCard(ticker) {
    const data = usCompany(ticker);
    if (!data) return null;
    const summary = summarizeQuarters(usQuarterRows(data));
    if (!summary) return null;
    return stockCard({
        eyebrow: `${ticker} · 미국 주식`,
        name: prettyUsName(data.name),
        period: usPeriodLabel(summary.latest, data.fy_end_month),
        summary,
        formatMoney: formatUsdKorean,
    });
}

// Latest KR quarter that the US company also reported: a US quarter matches when it ends in
// one of the KR quarter's three months (Micron's Mar–May quarter pairs with 2Q = Apr–Jun).
function matchQuarters(krRows, usRows) {
    const monthIndex = (year, month) => year * 12 + month;
    for (const k of [...krRows].reverse()) {
        if (k.op == null) continue;
        const krEnd = monthIndex(k.year, k.q * 3);
        const u = [...usRows].reverse().find(r => {
            if (r.op == null || !r.date) return false;
            const end = usQuarterEnd(r);
            const e = monthIndex(end.year, end.month);
            return e <= krEnd && e >= krEnd - 2;
        });
        if (u) return { k, u };
    }
    return null;
}

// KR vs US: operating profit for the same period in USD (KR converted at that quarter's average rate)
function pairCard({ kr, us }) {
    if (isForeignKrListing(kr)) return null;
    const krData = krCompany(kr);
    const usData = usCompany(us);
    if (!krData || !usData) return null;
    const match = matchQuarters(krQuarterRows(krData), usQuarterRows(usData));
    if (!match) return null;
    const { k, u } = match;
    const rate = fx.quarterly?.[`${k.year}-Q${k.q}`];
    if (!rate) return null;
    const krName = krData.name;
    const usName = prettyUsName(usData.name);
    const sides = [
        { name: krName, usd: k.op / rate, period: krPeriodLabel(k), color: '#2f6fe0' },
        { name: usName, usd: u.op, period: usPeriodLabel(u, usData.fy_end_month), color: '#d63b3b' },
    ];
    const max = Math.max(...sides.map(s => Math.abs(s.usd))) || 1;
    const [a, b] = sides;
    let headline = '';
    if (a.usd > 0 && b.usd > 0) {
        const big = a.usd >= b.usd ? a : b;
        const small = big === a ? b : a;
        headline = `${big.name} 영업이익, ${small.name}의 ${(big.usd / small.usd).toFixed(1)}배`;
    } else if (a.usd > 0 !== b.usd > 0) {
        headline = `${(a.usd > 0 ? a : b).name}만 흑자`;
    }
    const rows = sides.map(s => `
        <div class="prow">
            <div class="pname fit" style="color:${s.color}">${esc(s.name)}</div>
            <div class="ptrack"><div class="pbar" style="width:${Math.max(1.5, (Math.abs(s.usd) / max) * 100)}%;background:${s.usd < 0 ? '#e7a3a3' : s.color}"></div></div>
            <div class="pval">${esc(formatUsdKorean(s.usd))}</div>
            <div class="pperiod">${esc(s.period)}</div>
        </div>`).join('');
    return `
        <div class="eyebrow">한미 기업 실적 비교 · 같은 분기 영업이익 (USD 환산)</div>
        <div class="name fit">${esc(krName)} vs ${esc(usName)}</div>
        ${headline ? `<div class="phead">${esc(headline)}</div>` : ''}
        <div class="pairs">${rows}</div>
        ${footer(`원화는 분기 평균 환율 ${rate.toLocaleString('ko-KR')}원 기준`)}
        <style>
          .phead { font-size: 34px; font-weight: 800; color: #E07800; margin-top: 8px; }
          .pairs { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 22px; }
          .prow { display: grid; grid-template-columns: 300px 1fr 250px; grid-template-rows: auto auto; column-gap: 22px; align-items: center; }
          .pname { font-size: 34px; font-weight: 800; white-space: nowrap; overflow: hidden; }
          .ptrack { height: 46px; background: #ece8e2; border-radius: 10px; overflow: hidden; }
          .pbar { height: 100%; border-radius: 10px; }
          .pval { font-size: 36px; font-weight: 800; text-align: right; white-space: nowrap; letter-spacing: -.02em; }
          .pperiod { grid-column: 2 / 4; font-size: 17px; font-weight: 600; color: #a2a2aa; margin-top: 4px; }
        </style>`;
}

// Site default: what the site is, plus one real chart
function defaultCard() {
    const hynix = summarizeQuarters(krQuarterRows(krCompany('000660')));
    const total = krIndex.length + usIndex.length;
    return `
        <div class="eyebrow">KSTOCKVIEW</div>
        <div class="mid" style="grid-template-columns: 1fr 440px; margin-top: 0; align-items: center">
            <div>
                <div class="dh">한국·미국 주식 실적,<br>차트로 한눈에</div>
                <div class="ds">코스피·코스닥·나스닥·NYSE ${(Math.floor(total / 100) * 100).toLocaleString('ko-KR')}여 종목<br>분기 실적 · 영업이익률 · 한미 기업 비교</div>
            </div>
            <div class="dcard">
                <div class="dcard-name">SK하이닉스</div>
                ${barChart(hynix.bars, `분기 ${hynix.metric.label}`)}
            </div>
        </div>
        ${footer('무료 재무제표 분석')}
        <style>
          .dh { font-size: 74px; font-weight: 800; letter-spacing: -.04em; line-height: 1.15; }
          .ds { font-size: 26px; font-weight: 600; color: #6b6b75; line-height: 1.55; margin-top: 22px; }
          .dcard { background: #fff; border-radius: 24px; padding: 26px 30px 22px; box-shadow: 0 2px 16px rgba(0,0,0,.06); height: 360px; display: flex; flex-direction: column; }
          .dcard-name { font-size: 26px; font-weight: 800; }
          .dcard .chart { flex: 1; max-height: none; }
          .dcard .chart-title { text-align: left; margin-top: 2px; }
          .dcard .plot, .dcard .xlabels { gap: 8px; }
          .dcard .xlabels div { font-size: 13px; }
        </style>`;
}

// ---------------------------------------------------------------- what to render
function jobs() {
    const list = [];
    const want = (kind) => !ONLY || ONLY === kind;
    const single = ONE_CODES.length || ONE_TICKERS.length;

    if (single) {
        for (const code of ONE_CODES) list.push({ file: path.join(OG, 'kr', `${code}.png`), make: () => krCard(code) });
        for (const t of ONE_TICKERS) list.push({ file: path.join(OG, 'us', `${t}.png`), make: () => usCard(t) });
        return list;
    }
    if (want('default')) list.push({ file: path.join(PUBLIC, 'og-image.png'), make: defaultCard });
    if (want('kr')) {
        const codes = new Set(krIndex.filter(c => c.last_mktcap).sort((a, b) => b.last_mktcap - a.last_mktcap)
            .slice(0, KR_TOP).map(c => c.stock_code));
        POPULAR_PAIRS.forEach(p => codes.add(p.kr));
        for (const code of codes) list.push({ file: path.join(OG, 'kr', `${code}.png`), make: () => krCard(code) });
    }
    if (want('us')) {
        const tickers = new Set([...usIndex].sort((a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9)).slice(0, US_TOP).map(c => c.ticker));
        POPULAR_PAIRS.forEach(p => tickers.add(p.us));
        for (const t of tickers) list.push({ file: path.join(OG, 'us', `${t}.png`), make: () => usCard(t) });
    }
    if (want('gc')) {
        for (const p of POPULAR_PAIRS) list.push({ file: path.join(OG, 'gc', `${p.kr}-vs-${p.us}.png`), make: () => pairCard(p) });
    }
    return list;
}

// ---------------------------------------------------------------- render (headless Chrome over CDP)
// OneDrive can briefly lock a file it is syncing (EBUSY / UNKNOWN on Windows) — retry a few times
async function writeWithRetry(file, data, attempts = 6) {
    for (let i = 1; ; i++) {
        try {
            fs.writeFileSync(file, data);
            return;
        } catch (err) {
            if (i >= attempts) throw err;
            await new Promise(r => setTimeout(r, 1000 * i));
        }
    }
}

// Shrinks each .fit element's font until its text fits on one line
const FIT_SCRIPT = `
  window.fitAll = () => document.querySelectorAll('.fit').forEach(el => {
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth + 1 && size > 28) { size -= 2; el.style.fontSize = size + 'px'; }
  });`;

async function render(list) {
    const tmp = fs.mkdtempSync(path.join(tmpdir(), 'og-'));
    const base = path.join(tmp, 'base.html');
    fs.writeFileSync(base, `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>${CSS}</style><script>${FIT_SCRIPT}</script></head><body></body></html>`);

    const port = 9500 + Math.floor(Math.random() * 90);
    const chrome = spawn(CHROME, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`,
        `--user-data-dir=${path.join(tmp, 'profile')}`, 'about:blank',
    ], { stdio: 'ignore' });
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    let target;
    for (let i = 0; i < 50 && !target; i++) {
        try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch { await sleep(200); }
    }
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.addEventListener('open', r));
    let id = 0;
    const pending = new Map();
    ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
    const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `file:///${base.replace(/\\/g, '/')}` });
    await sleep(1500);
    // Load every weight once so later cards render without waiting on the network
    await send('Runtime.evaluate', {
        expression: `Promise.all([500,600,700,800].map(w => document.fonts.load(w + ' 40px Pretendard', '가A1'))).then(() => document.fonts.ready)`,
        awaitPromise: true,
    });

    let done = 0;
    let skipped = 0;
    for (const job of list) {
        const body = job.make();
        if (!body) { skipped++; continue; }
        await send('Runtime.evaluate', {
            expression: `(async () => { document.body.innerHTML = ${JSON.stringify(body)}; await document.fonts.ready; fitAll();
                await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); })()`,
            awaitPromise: true,
        });
        const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
        fs.mkdirSync(path.dirname(job.file), { recursive: true });
        await writeWithRetry(job.file, Buffer.from(shot.result.data, 'base64'));
        done++;
        if (list.length <= 20 || done % 50 === 0) console.log(`✓ ${path.relative(ROOT, job.file)}`);
    }
    ws.close();
    chrome.kill();
    console.log(`\n${done} images written, ${skipped} skipped (no reported quarter, or a foreign KR listing)`);
}

await render(jobs());
process.exit(0);
