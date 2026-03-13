// KR Stock data loader - on-demand loading for individual company JSON files
// Loads from public/data/kr_stocks/{stockCode}.json (DART API sourced)
// Index from public/data/kr_company_index.json

let companyIndexCache = null;
const companyDataCache = new Map();

export async function loadKrCompanyIndex() {
    if (companyIndexCache) return companyIndexCache;
    const res = await fetch('/data/kr_company_index.json');
    if (!res.ok) throw new Error(`Failed to load KR company index: ${res.status}`);
    companyIndexCache = await res.json();
    return companyIndexCache;
}

export async function loadKrCompanyData(stockCode) {
    if (companyDataCache.has(stockCode)) return companyDataCache.get(stockCode);
    const res = await fetch(`/data/kr_stocks/${stockCode}.json`);
    if (!res.ok) return null;
    const raw = await res.json();
    companyDataCache.set(stockCode, raw);
    return raw;
}

/**
 * Process raw company data into chart-ready format.
 * Returns { quarterlyData, annualData } with YoY and op_margin calculated.
 */
export function processKrCompanyData(raw) {
    if (!raw) return { quarterlyData: [], annualData: [] };

    // --- Quarterly ---
    const quarterlyData = (raw.quarterly || [])
        .map(q => ({
            year: q.year,
            quarter: q.quarter,
            displayLabel: `${q.year} ${q.quarter}`,
            revenue: q.revenue,
            op_profit: q.op_profit,
            net_income: q.net_income,
            eps: q.eps,
            close_price: q.close_price || null,
            per: q.per != null ? q.per : null,
            pbr: q.pbr != null ? q.pbr : null,
            op_margin: (q.revenue && q.op_profit != null)
                ? parseFloat(((q.op_profit / q.revenue) * 100).toFixed(1))
                : null,
        }))
        .sort((a, b) => a.year - b.year || a.quarter.localeCompare(b.quarter));

    // Quarterly YoY (same quarter previous year)
    quarterlyData.forEach(entry => {
        const prev = quarterlyData.find(
            e => e.year === entry.year - 1 && e.quarter === entry.quarter
        );
        if (prev) {
            entry.rev_change = calcYoy(entry.revenue, prev.revenue);
            entry.op_change = calcYoy(entry.op_profit, prev.op_profit);
            entry.ni_change = calcYoy(entry.net_income, prev.net_income);
            entry.eps_change = calcYoy(entry.eps, prev.eps);
        } else {
            entry.rev_change = null;
            entry.op_change = null;
            entry.ni_change = null;
            entry.eps_change = null;
        }
    });

    // --- Annual ---
    const annualData = (raw.annual || [])
        .map(a => ({
            year: a.year,
            displayLabel: `${a.year}`,
            revenue: a.revenue,
            op_profit: a.op_profit,
            net_income: a.net_income,
            eps: a.eps,
            close_price: a.close_price || null,
            per: a.per != null ? a.per : null,
            pbr: a.pbr != null ? a.pbr : null,
            total_assets: a.total_assets,
            total_equity: a.total_equity,
            total_debt: a.total_debt,
            op_margin: (a.revenue && a.op_profit != null)
                ? parseFloat(((a.op_profit / a.revenue) * 100).toFixed(1))
                : null,
        }))
        .sort((a, b) => a.year - b.year);

    annualData.forEach((entry, idx) => {
        if (idx === 0) {
            entry.rev_change = null;
            entry.op_change = null;
            entry.ni_change = null;
            entry.eps_change = null;
            return;
        }
        const prev = annualData[idx - 1];
        entry.rev_change = calcYoy(entry.revenue, prev.revenue);
        entry.op_change = calcYoy(entry.op_profit, prev.op_profit);
        entry.ni_change = calcYoy(entry.net_income, prev.net_income);
        entry.eps_change = calcYoy(entry.eps, prev.eps);
    });

    return { quarterlyData, annualData };
}

function calcYoy(current, previous) {
    if (current == null || previous == null || previous === 0) return null;
    return parseFloat((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
}
