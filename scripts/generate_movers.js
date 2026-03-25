import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const krStocksDir = path.join(rootDir, 'public', 'data', 'kr_stocks');
const indexPath = path.join(rootDir, 'public', 'data', 'kr_company_index.json');
const outputPath = path.join(rootDir, 'public', 'data', 'kr_movers.json');

const TOP_N = 10;

console.log('Generating market movers data...');

const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
// Only consider companies with rank <= 500 (meaningful size)
const topCodes = new Set(index.filter(c => c.rank && c.rank <= 500).map(c => c.stock_code));

const files = fs.readdirSync(krStocksDir).filter(f => f.endsWith('.json'));

const movers = [];

for (const file of files) {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(krStocksDir, file), 'utf-8'));
        const code = data.stock_code;
        if (!topCodes.has(code)) continue;

        const name = data.name;
        const name_en = data.name_en || name;

        const annual = (data.annual || []).sort((a, b) => b.year - a.year);
        if (annual.length < 2) continue;
        const latest = annual[0];
        const prev = annual[1];

        const calcYoy = (curr, prev) => {
            if (curr == null || prev == null || prev === 0) return null;
            return parseFloat((((curr - prev) / Math.abs(prev)) * 100).toFixed(1));
        };

        const rev_yoy = calcYoy(latest.revenue, prev.revenue);
        const op_yoy = calcYoy(latest.op_profit, prev.op_profit);
        const op_margin = (latest.revenue && latest.op_profit != null)
            ? parseFloat(((latest.op_profit / latest.revenue) * 100).toFixed(1))
            : null;
        const prev_op_margin = (prev.revenue && prev.op_profit != null)
            ? parseFloat(((prev.op_profit / prev.revenue) * 100).toFixed(1))
            : null;
        const margin_change = (op_margin != null && prev_op_margin != null)
            ? parseFloat((op_margin - prev_op_margin).toFixed(1))
            : null;

        movers.push({
            stock_code: code,
            name,
            name_en,
            period: `${prev.year} → ${latest.year}`,
            rev_yoy,
            op_yoy,
            op_margin,
            margin_change,
            latest_revenue: latest.revenue,
        });
    } catch (e) {
        // Skip
    }
}

// Build categories
function pickTop(arr, key, ascending = false, filter = null) {
    let sorted = filter ? arr.filter(filter) : [...arr];
    sorted = sorted.filter(c => c[key] != null && isFinite(c[key]));
    sorted.sort((a, b) => ascending ? a[key] - b[key] : b[key] - a[key]);
    return sorted.slice(0, TOP_N).map(c => ({
        stock_code: c.stock_code,
        name: c.name,
        name_en: c.name_en,
        value: c[key],
        period: c.period,
    }));
}

const result = {
    updated_date: new Date().toISOString().split('T')[0],
    revenue_growth_top: pickTop(movers, 'rev_yoy', false, c => c.rev_yoy > 0),
    revenue_decline_top: pickTop(movers, 'rev_yoy', true, c => c.rev_yoy < 0),
    op_profit_turnaround: pickTop(movers, 'op_yoy', false, c => c.op_yoy > 50),
    margin_expansion: pickTop(movers, 'margin_change', false, c => c.margin_change > 0),
};

fs.writeFileSync(outputPath, JSON.stringify(result, null, 0));
console.log(`Market movers generated: ${outputPath}`);
console.log(`Categories: ${Object.keys(result).filter(k => k !== 'updated_date').length}`);
