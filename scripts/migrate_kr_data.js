/**
 * Migration script: Restructure Korean stock financial data
 *
 * Reads 17 old data files, merges them (replicating dataLoader.js merge logic),
 * strips IFRS metadata, integrates EPS into quarterly entries, and outputs:
 *   - public/data/kr_quarterly_00.json, kr_quarterly_01.json (chunked)
 *   - public/data/kr_quarterly_index.json
 *   - public/data/kr_annual.json
 *
 * Run: node scripts/migrate_kr_data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

function readJSON(relativePath) {
    const fullPath = path.join(root, relativePath);
    try {
        return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    } catch (e) {
        console.warn(`  Warning: Could not read ${relativePath}: ${e.message}`);
        return {};
    }
}

console.log('=== KR Data Migration ===\n');

// ── 1. Load all source files ──
console.log('Loading source files...');

// Financial data (5 consolidated chunks)
const fd = {};
for (let i = 0; i <= 4; i++) {
    const chunk = readJSON(`public/data/financial_data_0${i}.json`);
    Object.assign(fd, chunk);
}
console.log(`  Consolidated quarterly: ${Object.keys(fd).length} companies`);

// Separate financial data (347 companies, no overlap with consolidated)
const sep = readJSON('public/data/financial_data_separate_00.json');
console.log(`  Separate quarterly: ${Object.keys(sep).length} companies`);
Object.assign(fd, sep);

// Income statement revenue supplement (fills gaps)
const incRev = readJSON('public/income_statement_revenue.json');
console.log(`  Income stmt revenue: ${Object.keys(incRev).length} companies`);

// EPS data (6 chunks)
const allEps = {};
for (let i = 0; i <= 5; i++) {
    const chunk = readJSON(`public/data/eps_data_0${i}.json`);
    Object.assign(allEps, chunk);
}
console.log(`  EPS quarterly: ${Object.keys(allEps).length} companies`);

// Income statement EPS supplement
const incEps = readJSON('public/income_statement_eps.json');
console.log(`  Income stmt EPS: ${Object.keys(incEps).length} companies`);

// Annual data
const annual = readJSON('public/financial_data_annual.json');
console.log(`  Annual: ${Object.keys(annual).length} companies`);

// Income statement annual supplement
const incAnn = readJSON('public/income_statement_annual.json');
console.log(`  Income stmt annual: ${Object.keys(incAnn).length} companies`);

// ── 2. Merge quarterly financial data (same logic as loadAllFinancialData) ──
console.log('\nMerging quarterly financial data...');

for (const [code, data] of Object.entries(incRev)) {
    if (!fd[code]) {
        fd[code] = data;
    } else {
        fd[code].name = data.name;
        fd[code].sector = data.sector;
        const existingHistory = fd[code].history || [];
        const incHistory = data.history || [];
        for (const incEntry of incHistory) {
            const existing = existingHistory.find(
                e => e.year === incEntry.year && e.quarter === incEntry.quarter
            );
            if (existing) {
                if (existing.revenue == null) existing.revenue = incEntry.revenue;
                if (existing.op_profit == null) existing.op_profit = incEntry.op_profit;
            } else {
                existingHistory.push(incEntry);
            }
        }
        fd[code].history = existingHistory;
    }
}
console.log(`  After income stmt merge: ${Object.keys(fd).length} companies`);

// ── 3. Merge EPS data (same logic as loadAllEpsData) ──
console.log('Merging EPS data...');

for (const [code, data] of Object.entries(incEps)) {
    if (!allEps[code]) {
        allEps[code] = data;
    } else {
        allEps[code].name = data.name;
        allEps[code].sector = data.sector;
        const existingHistory = allEps[code].history || [];
        const incHistory = data.history || [];
        for (const incEntry of incHistory) {
            const existing = existingHistory.find(
                e => e.year === incEntry.year && e.quarter === incEntry.quarter
            );
            if (existing) {
                if (existing.eps == null) existing.eps = incEntry.eps;
            } else {
                existingHistory.push(incEntry);
            }
        }
        allEps[code].history = existingHistory;
    }
}
console.log(`  After income stmt merge: ${Object.keys(allEps).length} companies`);

// ── 4. Build clean quarterly output (strip IFRS, integrate EPS) ──
console.log('\nBuilding clean quarterly data...');

const qOrder = { '1Q': 1, '2Q': 2, '3Q': 3, '4Q': 4 };

function sortHistory(history) {
    return history.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return (qOrder[a.quarter] || 0) - (qOrder[b.quarter] || 0);
    });
}

const cleanQuarterly = {};

// Process companies that have financial data
for (const [code, company] of Object.entries(fd)) {
    const epsCompany = allEps[code];
    const history = (company.history || []).map(e => {
        const entry = {
            year: e.year,
            quarter: e.quarter,
            revenue: e.revenue ?? null,
            op_profit: e.op_profit ?? null,
            net_income: e.net_income ?? null,
        };
        // Integrate EPS from eps data
        if (epsCompany) {
            const epsEntry = (epsCompany.history || []).find(
                ep => ep.year === e.year && ep.quarter === e.quarter
            );
            if (epsEntry) entry.eps = epsEntry.eps;
        }
        if (entry.eps === undefined) entry.eps = null;
        return entry;
    });
    cleanQuarterly[code] = {
        name: company.name,
        sector: company.sector,
        history: sortHistory(history)
    };
}

// Add EPS-only companies (have EPS but no financial data)
let epsOnlyCount = 0;
for (const [code, epsCompany] of Object.entries(allEps)) {
    if (!cleanQuarterly[code]) {
        epsOnlyCount++;
        cleanQuarterly[code] = {
            name: epsCompany.name,
            sector: epsCompany.sector,
            history: sortHistory((epsCompany.history || []).map(e => ({
                year: e.year,
                quarter: e.quarter,
                revenue: null,
                op_profit: null,
                net_income: null,
                eps: e.eps ?? null
            })))
        };
    }
}
console.log(`  Total quarterly companies: ${Object.keys(cleanQuarterly).length} (${epsOnlyCount} EPS-only)`);

// ── 5. Build clean annual output ──
console.log('Building clean annual data...');

// Merge income_statement_annual into annual
for (const [code, data] of Object.entries(incAnn)) {
    if (!annual[code]) {
        annual[code] = data;
    } else {
        annual[code].name = data.name;
        annual[code].sector = data.sector;
        const existingHistory = annual[code].history || [];
        const incHistory = data.history || [];
        for (const incEntry of incHistory) {
            const existing = existingHistory.find(e => e.year === incEntry.year);
            if (existing) {
                if (existing.revenue == null) existing.revenue = incEntry.revenue;
                if (existing.op_profit == null) existing.op_profit = incEntry.op_profit;
                if (existing.net_income == null) existing.net_income = incEntry.net_income;
            } else {
                existingHistory.push(incEntry);
            }
        }
        annual[code].history = existingHistory;
    }
}

const cleanAnnual = {};
for (const [code, company] of Object.entries(annual)) {
    cleanAnnual[code] = {
        name: company.name,
        sector: company.sector,
        history: (company.history || []).map(e => ({
            year: e.year,
            revenue: e.revenue ?? null,
            op_profit: e.op_profit ?? null,
            net_income: e.net_income ?? null,
        })).sort((a, b) => a.year - b.year)
    };
}
console.log(`  Total annual companies: ${Object.keys(cleanAnnual).length}`);

// ── 6. Split quarterly into chunks and write output ──
console.log('\nWriting output files...');

const codes = Object.keys(cleanQuarterly).sort();
const mid = Math.ceil(codes.length / 2);

const chunk0 = {};
const chunk1 = {};
codes.forEach((code, i) => {
    if (i < mid) chunk0[code] = cleanQuarterly[code];
    else chunk1[code] = cleanQuarterly[code];
});

const outDir = path.join(root, 'public', 'data');

// Write quarterly chunks
fs.writeFileSync(path.join(outDir, 'kr_quarterly_00.json'), JSON.stringify(chunk0));
fs.writeFileSync(path.join(outDir, 'kr_quarterly_01.json'), JSON.stringify(chunk1));

// Write quarterly index
const chunk0Codes = Object.keys(chunk0).sort();
const chunk1Codes = Object.keys(chunk1).sort();
const quarterlyIndex = {
    total_companies: codes.length,
    num_chunks: 2,
    chunks: [
        {
            file: 'kr_quarterly_00.json',
            start: chunk0Codes[0],
            end: chunk0Codes[chunk0Codes.length - 1],
            count: chunk0Codes.length
        },
        {
            file: 'kr_quarterly_01.json',
            start: chunk1Codes[0],
            end: chunk1Codes[chunk1Codes.length - 1],
            count: chunk1Codes.length
        }
    ]
};
fs.writeFileSync(
    path.join(outDir, 'kr_quarterly_index.json'),
    JSON.stringify(quarterlyIndex, null, 2)
);

// Write annual (single file)
fs.writeFileSync(path.join(outDir, 'kr_annual.json'), JSON.stringify(cleanAnnual));

// ── 7. Report ──
const s0 = fs.statSync(path.join(outDir, 'kr_quarterly_00.json')).size;
const s1 = fs.statSync(path.join(outDir, 'kr_quarterly_01.json')).size;
const sIdx = fs.statSync(path.join(outDir, 'kr_quarterly_index.json')).size;
const sA = fs.statSync(path.join(outDir, 'kr_annual.json')).size;

console.log(`\n=== Output ===`);
console.log(`  kr_quarterly_00.json:    ${(s0 / 1024 / 1024).toFixed(2)} MB (${chunk0Codes.length} companies)`);
console.log(`  kr_quarterly_01.json:    ${(s1 / 1024 / 1024).toFixed(2)} MB (${chunk1Codes.length} companies)`);
console.log(`  kr_quarterly_index.json: ${(sIdx / 1024).toFixed(1)} KB`);
console.log(`  kr_annual.json:          ${(sA / 1024 / 1024).toFixed(2)} MB (${Object.keys(cleanAnnual).length} companies)`);
console.log(`  TOTAL:                   ${((s0 + s1 + sIdx + sA) / 1024 / 1024).toFixed(2)} MB`);

// Spot check
console.log('\n=== Spot Check: Samsung (005930) ===');
const samsung = cleanQuarterly['005930'];
if (samsung) {
    console.log(`  Name: ${samsung.name}`);
    console.log(`  Sector: ${samsung.sector}`);
    console.log(`  Quarterly entries: ${samsung.history.length}`);
    console.log(`  First: ${JSON.stringify(samsung.history[0])}`);
    console.log(`  Last: ${JSON.stringify(samsung.history[samsung.history.length - 1])}`);
    const hasIfrs = samsung.history.some(e => e.revenue_ifrs_code || e.eps_ifrs_code);
    console.log(`  Has IFRS metadata: ${hasIfrs ? 'YES (ERROR!)' : 'No (clean)'}`);
    const hasEps = samsung.history.some(e => e.eps != null);
    console.log(`  Has EPS data: ${hasEps}`);
} else {
    console.log('  ERROR: Samsung not found!');
}

console.log('\n=== Spot Check: SK Hynix (000660) ===');
const skhynix = cleanQuarterly['000660'];
if (skhynix) {
    console.log(`  Name: ${skhynix.name}`);
    console.log(`  Quarterly entries: ${skhynix.history.length}`);
    const hasEps = skhynix.history.some(e => e.eps != null);
    console.log(`  Has EPS data: ${hasEps}`);
}

console.log('\nDone! Old files can be deleted after verifying the app works correctly.');
