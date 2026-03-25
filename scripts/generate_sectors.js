import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const indexPath = path.join(rootDir, 'public', 'data', 'kr_company_index.json');
const outputPath = path.join(rootDir, 'public', 'data', 'kr_sectors.json');

console.log('Generating sector data...');

const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

// Group by sector
const sectorMap = new Map();

for (const company of index) {
    const sector = company.sector || '기타';
    if (!sectorMap.has(sector)) {
        sectorMap.set(sector, []);
    }
    sectorMap.get(sector).push(company);
}

// Convert sector name to URL-safe slug
function toSlug(sector) {
    return encodeURIComponent(sector);
}

// Build sector list
const sectors = [];

for (const [sector, companies] of sectorMap) {
    companies.sort((a, b) => (a.rank || 9999) - (b.rank || 9999));

    const total_revenue = companies.reduce((sum, c) => sum + (c.last_revenue || 0), 0);
    const total_op_profit = companies.reduce((sum, c) => sum + (c.last_op_profit || 0), 0);

    sectors.push({
        sector,
        slug: toSlug(sector),
        company_count: companies.length,
        total_revenue,
        total_op_profit,
        top_companies: companies.slice(0, 10).map(c => ({
            stock_code: c.stock_code,
            name: c.name,
            name_en: c.name_en,
            rank: c.rank,
            last_revenue: c.last_revenue,
            last_op_profit: c.last_op_profit,
        })),
    });
}

// Sort sectors by total revenue descending
sectors.sort((a, b) => b.total_revenue - a.total_revenue);

fs.writeFileSync(outputPath, JSON.stringify(sectors, null, 0));
console.log(`Sector data generated: ${outputPath}`);
console.log(`Total sectors: ${sectors.length}`);
