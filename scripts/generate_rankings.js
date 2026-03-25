import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const krStocksDir = path.join(rootDir, 'public', 'data', 'kr_stocks');
const indexPath = path.join(rootDir, 'public', 'data', 'kr_company_index.json');
const outputPath = path.join(rootDir, 'public', 'data', 'kr_rankings.json');

const TOP_N = 50;

console.log('Generating rankings data...');

const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
const files = fs.readdirSync(krStocksDir).filter(f => f.endsWith('.json'));

// Collect per-company derived metrics
const companies = [];

for (const file of files) {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(krStocksDir, file), 'utf-8'));
        const code = data.stock_code;
        const name = data.name;
        const name_en = data.name_en || name;
        const sector = data.sector || '';
        const market = data.market || '';

        // Find in index for rank/last_revenue/last_op_profit
        const idx = index.find(c => c.stock_code === code);
        const rank = idx?.rank || 9999;
        const last_revenue = idx?.last_revenue || null;
        const last_op_profit = idx?.last_op_profit || null;
        const last_per = idx?.last_per || null;
        const last_pbr = idx?.last_pbr || null;

        // Get latest annual data
        const annual = (data.annual || []).sort((a, b) => b.year - a.year);
        const latest = annual[0];
        const prev = annual[1];

        let revenue_yoy = null;
        let op_margin = null;
        let debt_ratio = null;

        if (latest && prev && latest.revenue && prev.revenue && prev.revenue > 0) {
            revenue_yoy = parseFloat((((latest.revenue - prev.revenue) / Math.abs(prev.revenue)) * 100).toFixed(1));
        }

        if (latest && latest.revenue && latest.op_profit != null) {
            op_margin = parseFloat(((latest.op_profit / latest.revenue) * 100).toFixed(1));
        }

        if (latest && latest.total_equity && latest.total_debt != null && latest.total_equity > 0) {
            debt_ratio = parseFloat(((latest.total_debt / latest.total_equity) * 100).toFixed(1));
        }

        companies.push({
            stock_code: code,
            name,
            name_en,
            sector,
            market,
            rank,
            last_revenue,
            last_op_profit,
            last_per,
            last_pbr,
            revenue_yoy,
            op_margin,
            debt_ratio,
        });
    } catch (e) {
        // Skip broken files
    }
}

console.log(`Processed ${companies.length} companies`);

// Generate rankings
function topN(arr, key, ascending = false, filterPositive = false) {
    let filtered = arr.filter(c => c[key] != null && isFinite(c[key]));
    if (filterPositive) filtered = filtered.filter(c => c[key] > 0);
    filtered.sort((a, b) => ascending ? a[key] - b[key] : b[key] - a[key]);
    return filtered.slice(0, TOP_N).map((c, i) => ({
        rank: i + 1,
        stock_code: c.stock_code,
        name: c.name,
        name_en: c.name_en,
        sector: c.sector,
        market: c.market,
        value: c[key],
    }));
}

const rankings = {
    generated_at: new Date().toISOString().split('T')[0],
    market_cap_top: topN(companies, 'rank', true).map((c, i) => ({ ...c, rank: i + 1 })),
    revenue_top: topN(companies, 'last_revenue'),
    op_profit_top: topN(companies, 'last_op_profit'),
    per_lowest: topN(companies.filter(c => c.last_per > 0), 'last_per', true),
    pbr_lowest: topN(companies.filter(c => c.last_pbr > 0), 'last_pbr', true),
    revenue_growth_top: topN(companies, 'revenue_yoy'),
    op_margin_top: topN(companies, 'op_margin'),
    debt_ratio_lowest: topN(companies.filter(c => c.debt_ratio >= 0), 'debt_ratio', true),
};

fs.writeFileSync(outputPath, JSON.stringify(rankings, null, 0));
console.log(`Rankings generated: ${outputPath}`);
console.log(`Categories: ${Object.keys(rankings).filter(k => k !== 'generated_at').length}`);
