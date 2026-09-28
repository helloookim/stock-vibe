import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Market movers for the home page: the latest quarter most companies have reported,
// compared with the same quarter a year earlier. Output: public/data/kr_movers.json

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const krStocksDir = path.join(rootDir, 'public', 'data', 'kr_stocks');
const indexPath = path.join(rootDir, 'public', 'data', 'kr_company_index.json');
const outputPath = path.join(rootDir, 'public', 'data', 'kr_movers.json');

const TOP_N = 8;
const UNIVERSE_SIZE = 500;            // top companies by market cap
const MIN_REVENUE = 100_000_000_000;  // 1,000억 in both quarters — tiny bases make % changes meaningless
const MAX_ABS_MARGIN = 100;           // ignore margins outside ±100% (accounting oddities)

// Financial-company rule from scripts/scan_outliers.py (+ 생명/해상/손해 for insurers): their "revenue" isn't comparable
const FINANCIAL_SECTOR_KEYWORDS = ['금융', '은행', '보험', '증권', '투자', '신탁', '지주'];
const FINANCIAL_NAME_KEYWORDS = ['은행', '보험', '증권', '금융', '캐피탈', '투자', '저축', '카드', '자산운용', '리츠', '스팩', '선물', '코리안리', '화재', '생명', '해상', '손해'];
const isFinancial = (name = '', sector = '') =>
    FINANCIAL_SECTOR_KEYWORDS.some(kw => sector.includes(kw)) || FINANCIAL_NAME_KEYWORDS.some(kw => name.includes(kw));

const round1 = (v) => parseFloat(v.toFixed(1));
const margin = (q) => (q.revenue ? (q.op_profit / q.revenue) * 100 : null);

console.log('Generating market movers data...');

const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
const universe = index
    .filter(c => c.last_mktcap && !isFinancial(c.name, c.sector))
    .sort((a, b) => b.last_mktcap - a.last_mktcap)
    .slice(0, UNIVERSE_SIZE);

const companies = [];
for (const c of universe) {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(krStocksDir, `${c.stock_code}.json`), 'utf-8'));
        const quarters = (data.quarterly || []).filter(q => q.revenue != null);
        if (quarters.length) companies.push({ info: c, quarters });
    } catch {
        // missing / unreadable file: skip
    }
}

// Target period = the most recent quarter reported by at least half of the universe
const reported = new Map();
companies.forEach(({ quarters }) => quarters.forEach(q => {
    const key = `${q.year}-${q.quarter}`;
    reported.set(key, (reported.get(key) || 0) + 1);
}));
const [targetKey] = [...reported.entries()]
    .filter(([, n]) => n >= companies.length / 2)
    .map(([key]) => key)
    .sort()
    .reverse();
const [targetYear, targetQuarter] = targetKey.split('-');
const year = Number(targetYear);

const rows = [];
for (const { info, quarters } of companies) {
    const cur = quarters.find(q => q.year === year && q.quarter === targetQuarter);
    const prev = quarters.find(q => q.year === year - 1 && q.quarter === targetQuarter);
    if (!cur || !prev || cur.revenue < MIN_REVENUE || prev.revenue < MIN_REVENUE) continue;
    const curMargin = cur.op_profit != null ? margin(cur) : null;
    const prevMargin = prev.op_profit != null ? margin(prev) : null;
    rows.push({
        stock_code: info.stock_code,
        name: info.name,
        name_en: info.name_en || info.name,
        revenue: cur.revenue,
        rev_yoy: round1(((cur.revenue - prev.revenue) / prev.revenue) * 100),
        op_profit: cur.op_profit,
        prev_op_profit: prev.op_profit,
        margin: curMargin,
        margin_change: curMargin != null && prevMargin != null
            && Math.abs(curMargin) <= MAX_ABS_MARGIN && Math.abs(prevMargin) <= MAX_ABS_MARGIN
            ? round1(curMargin - prevMargin) : null,
    });
}

const pick = (list, sortFn, map) => list.sort(sortFn).slice(0, TOP_N).map(r => ({
    stock_code: r.stock_code, name: r.name, name_en: r.name_en, ...map(r),
}));

const result = {
    updated_date: new Date().toISOString().split('T')[0],
    period: `${year} ${targetQuarter}`,
    prev_period: `${year - 1} ${targetQuarter}`,
    universe: rows.length,
    // value: revenue YoY %
    revenue_growth_top: pick(rows.filter(r => r.rev_yoy > 0), (a, b) => b.rev_yoy - a.rev_yoy, r => ({ value: r.rev_yoy, revenue: r.revenue })),
    revenue_decline_top: pick(rows.filter(r => r.rev_yoy < 0), (a, b) => a.rev_yoy - b.rev_yoy, r => ({ value: r.rev_yoy, revenue: r.revenue })),
    // Loss a year ago → operating profit now; value: current operating profit (KRW)
    op_profit_turnaround: pick(
        rows.filter(r => r.prev_op_profit != null && r.prev_op_profit < 0 && r.op_profit > 0),
        (a, b) => b.op_profit - a.op_profit,
        r => ({ value: r.op_profit, prev_value: r.prev_op_profit }),
    ),
    // value: operating margin change in %p
    margin_expansion: pick(
        rows.filter(r => r.margin_change != null && r.margin_change > 0),
        (a, b) => b.margin_change - a.margin_change,
        r => ({ value: r.margin_change, margin: round1(r.margin) }),
    ),
};

fs.writeFileSync(outputPath, JSON.stringify(result, null, 0));
console.log(`Market movers generated: ${outputPath}`);
console.log(`Period ${result.period} vs ${result.prev_period} · ${rows.length} companies compared`);
