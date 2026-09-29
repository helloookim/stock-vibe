import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isFinancialCompany } from './financialFilter.js';

// Rankings for /rankings: market cap, size, valuation and quality lists.
// Output: public/data/kr_rankings.json — per category, a TOP_N list for all stocks and one per
// market ({ all, KOSPI, KOSDAQ }) so the page's market filter always shows a full list.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const krStocksDir = path.join(rootDir, 'public', 'data', 'kr_stocks');
const indexPath = path.join(rootDir, 'public', 'data', 'kr_company_index.json');
const outputPath = path.join(rootDir, 'public', 'data', 'kr_rankings.json');

const TOP_N = 50;
const MIN_MKTCAP = 300_000_000_000;    // 3,000억 — valuation / balance-sheet lists skip micro caps
const MIN_REVENUE = 100_000_000_000;   // 1,000억 — growth / margin lists need a meaningful revenue base
const MAX_MARGIN = 100;                // operating margin above 100% = accounting oddity, not "quality"

const round1 = (v) => parseFloat(v.toFixed(1));

console.log('Generating rankings data...');

const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

// Per-company annual rows + market data
const companies = [];
for (const c of index) {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(krStocksDir, `${c.stock_code}.json`), 'utf-8'));
        companies.push({
            info: c,
            financial: isFinancialCompany(c.name, c.sector),
            annual: (data.annual || []).filter(a => a.revenue != null || a.op_profit != null),
            closeDate: data.last_close_date || null,
        });
    } catch {
        // missing / unreadable file: skip
    }
}

// Fiscal year used by the annual lists: the latest year most companies have reported
const yearCounts = new Map();
companies.forEach(({ annual }) => {
    const latest = Math.max(...annual.map(a => a.year));
    if (Number.isFinite(latest)) yearCounts.set(latest, (yearCounts.get(latest) || 0) + 1);
});
const fiscalYear = [...yearCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];

const rows = companies.map(({ info, financial, annual }) => {
    const cur = annual.find(a => a.year === fiscalYear) || {};
    const prev = annual.find(a => a.year === fiscalYear - 1) || {};
    const bigEnough = cur.revenue >= MIN_REVENUE;
    return {
        stock_code: info.stock_code,
        name: info.name,
        name_en: info.name_en || info.name,
        sector: info.sector || '',
        // "KOSDAQ GLOBAL" is a KOSDAQ segment
        market: (info.market || '').startsWith('KOSDAQ') ? 'KOSDAQ' : (info.market || ''),
        financial,
        mktcap: info.last_mktcap ?? null,
        per: info.last_per ?? null,
        pbr: info.last_pbr ?? null,
        revenue: cur.revenue ?? null,
        op_profit: cur.op_profit ?? null,
        revenue_yoy: bigEnough && prev.revenue >= MIN_REVENUE
            ? round1(((cur.revenue - prev.revenue) / prev.revenue) * 100) : null,
        op_margin: bigEnough && cur.op_profit != null ? round1((cur.op_profit / cur.revenue) * 100) : null,
        debt_ratio: cur.total_equity > 0 && cur.total_debt != null
            ? round1((cur.total_debt / cur.total_equity) * 100) : null,
    };
});

/**
 * @param key      field ranked on
 * @param order    'desc' | 'asc'
 * @param include  row filter on top of "key is a finite number"
 */
function rank(key, order, include = () => true) {
    const eligible = rows
        .filter(r => r[key] != null && Number.isFinite(r[key]) && include(r))
        .sort((a, b) => (order === 'asc' ? a[key] - b[key] : b[key] - a[key]));
    const top = (list) => list
        .slice(0, TOP_N)
        .map((r, i) => ({
            rank: i + 1,
            stock_code: r.stock_code,
            name: r.name,
            name_en: r.name_en,
            sector: r.sector,
            market: r.market,
            value: r[key],
            mktcap: r.mktcap,
        }));
    return {
        all: top(eligible),
        KOSPI: top(eligible.filter(r => r.market === 'KOSPI')),
        KOSDAQ: top(eligible.filter(r => r.market === 'KOSDAQ')),
    };
}

const sizable = (r) => r.mktcap >= MIN_MKTCAP;
const operating = (r) => !r.financial;

const rankings = {
    generated_at: new Date().toISOString().split('T')[0],
    fiscal_year: fiscalYear,
    price_date: companies.map(c => c.closeDate).filter(Boolean).sort().pop() || null,
    criteria: { min_mktcap: MIN_MKTCAP, min_revenue: MIN_REVENUE, max_margin: MAX_MARGIN },
    market_cap_top: rank('mktcap', 'desc'),
    revenue_top: rank('revenue', 'desc', operating),
    op_profit_top: rank('op_profit', 'desc'),
    per_lowest: rank('per', 'asc', r => r.per > 0 && sizable(r)),
    pbr_lowest: rank('pbr', 'asc', r => r.pbr > 0 && sizable(r)),
    revenue_growth_top: rank('revenue_yoy', 'desc', operating),
    op_margin_top: rank('op_margin', 'desc', r => operating(r) && r.op_margin <= MAX_MARGIN),
    debt_ratio_lowest: rank('debt_ratio', 'asc', r => operating(r) && sizable(r) && r.debt_ratio >= 0),
};

fs.writeFileSync(outputPath, JSON.stringify(rankings, null, 0));
console.log(`Rankings generated: ${outputPath}`);
console.log(`FY${fiscalYear} · price date ${rankings.price_date} · ${rows.length} companies`);
