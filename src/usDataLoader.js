// US Stock data loader - on-demand loading for individual company JSON files

let companyIndexCache = null;
const companyDataCache = new Map();

export async function loadUsCompanyIndex() {
    if (companyIndexCache) return companyIndexCache;
    const res = await fetch('/data/us_company_index.json');
    companyIndexCache = await res.json();
    return companyIndexCache;
}

export async function loadUsCompanyData(ticker) {
    if (companyDataCache.has(ticker)) return companyDataCache.get(ticker);
    const res = await fetch(`/data/us_stocks/${ticker}.json`);
    if (!res.ok) return null;
    const raw = await res.json();
    const processed = processUsCompanyData(raw);
    companyDataCache.set(ticker, processed);
    return processed;
}

function dateToCalendarQuarter(dateNum) {
    const s = String(dateNum);
    const year = parseInt(s.substring(0, 4));
    const month = parseInt(s.substring(4, 6));
    let q;
    if (month <= 3) q = 'Q1';
    else if (month <= 6) q = 'Q2';
    else if (month <= 9) q = 'Q3';
    else q = 'Q4';
    return { year, quarter: q };
}

function processUsCompanyData(raw) {
    const { ticker, name, cik, annual: annualRaw, quarterly: quarterlyRaw } = raw;

    // --- Annual data ---
    const annualData = (annualRaw || [])
        .map(entry => {
            const { year } = dateToCalendarQuarter(entry.date);
            return {
                year,
                displayLabel: `${year}`,
                revenue: entry.revenue,
                operating_income: entry.operating_income,
                net_income: entry.net_income,
                eps: entry.eps != null ? entry.eps : entry.eps_basic,
                op_margin: (entry.revenue && entry.operating_income != null)
                    ? parseFloat(((entry.operating_income / entry.revenue) * 100).toFixed(1))
                    : null,
            };
        })
        .sort((a, b) => a.year - b.year);

    // Calculate annual YoY
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
        entry.op_change = calcYoy(entry.operating_income, prev.operating_income);
        entry.ni_change = calcYoy(entry.net_income, prev.net_income);
        entry.eps_change = calcYoy(entry.eps, prev.eps);
    });

    // --- Quarterly data ---
    // Get qtrs=1 entries
    const singleQuarters = (quarterlyRaw || []).filter(e => e.qtrs === 1);
    // Build quarterly map keyed by "YYYY-QX"
    const quarterMap = new Map();

    singleQuarters.forEach(entry => {
        const { year, quarter } = dateToCalendarQuarter(entry.date);
        const key = `${year}-${quarter}`;
        // Keep the latest source if duplicates
        if (!quarterMap.has(key) || entry.date > quarterMap.get(key).date) {
            quarterMap.set(key, {
                date: entry.date,
                year,
                quarter,
                revenue: entry.revenue,
                operating_income: entry.operating_income,
                net_income: entry.net_income,
                eps: entry.eps != null ? entry.eps : entry.eps_basic,
            });
        }
    });

    // Derive missing Q4 from annual - Q3 YTD (qtrs=3)
    const ytdQ3 = (quarterlyRaw || []).filter(e => e.qtrs === 3);
    const ytdQ3Map = new Map();
    ytdQ3.forEach(entry => {
        const { year, quarter } = dateToCalendarQuarter(entry.date);
        const key = `${year}-${quarter}`;
        ytdQ3Map.set(key, entry);
    });

    // For each annual entry, check if corresponding Q4 is missing
    (annualRaw || []).forEach(aEntry => {
        const { year: aYear, quarter: aQuarter } = dateToCalendarQuarter(aEntry.date);
        const q4Key = `${aYear}-${aQuarter}`;

        if (!quarterMap.has(q4Key)) {
            // Find the Q3 YTD entry 3 months before the annual end
            // The YTD Q3 date is ~3 months before annual date
            const annualDate = aEntry.date;
            const annualMonth = parseInt(String(annualDate).substring(4, 6));
            // Q3 YTD month is 3 months before annual end
            let q3Month = annualMonth - 3;
            let q3Year = parseInt(String(annualDate).substring(0, 4));
            if (q3Month <= 0) { q3Month += 12; q3Year -= 1; }
            const q3MonthStr = String(q3Month).padStart(2, '0');

            // Find matching ytdQ3 entry
            let matched = null;
            ytdQ3.forEach(e => {
                const eMonth = parseInt(String(e.date).substring(4, 6));
                const eYear = parseInt(String(e.date).substring(0, 4));
                if (eYear === q3Year && eMonth === q3Month) {
                    matched = e;
                }
            });

            if (matched) {
                quarterMap.set(q4Key, {
                    date: annualDate,
                    year: aYear,
                    quarter: aQuarter,
                    revenue: subtract(aEntry.revenue, matched.revenue),
                    operating_income: subtract(aEntry.operating_income, matched.operating_income),
                    net_income: subtract(aEntry.net_income, matched.net_income),
                    eps: subtract(aEntry.eps, matched.eps),
                    derived: true,
                });
            }
        }
    });

    // Sort quarterly data chronologically
    const quarterlyData = Array.from(quarterMap.values())
        .sort((a, b) => a.date - b.date)
        .map(entry => ({
            ...entry,
            displayLabel: `${entry.year} ${entry.quarter}`,
            op_margin: (entry.revenue && entry.operating_income != null)
                ? parseFloat(((entry.operating_income / entry.revenue) * 100).toFixed(1))
                : null,
        }));

    // Calculate quarterly YoY (same calendar quarter previous year)
    quarterlyData.forEach((entry) => {
        const prevYear = quarterlyData.find(
            e => e.year === entry.year - 1 && e.quarter === entry.quarter
        );
        if (prevYear) {
            entry.rev_change = calcYoy(entry.revenue, prevYear.revenue);
            entry.op_change = calcYoy(entry.operating_income, prevYear.operating_income);
            entry.ni_change = calcYoy(entry.net_income, prevYear.net_income);
            entry.eps_change = calcYoy(entry.eps, prevYear.eps);
        } else {
            entry.rev_change = null;
            entry.op_change = null;
            entry.ni_change = null;
            entry.eps_change = null;
        }
    });

    return {
        ticker,
        name,
        cik,
        annualData,
        quarterlyData,
    };
}

function calcYoy(current, previous) {
    if (current == null || previous == null || previous === 0) return null;
    return parseFloat((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
}

function subtract(a, b) {
    if (a == null || b == null) return null;
    return a - b;
}

// USD currency formatter
export function formatUsdCurrency(val) {
    if (val == null) return 'N/A';
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(1)}T`;
    if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
    return `${sign}$${abs.toFixed(2)}`;
}
