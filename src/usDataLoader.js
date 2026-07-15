// US Stock data loader - on-demand loading for individual company JSON files
// Data format: per-company JSON with fiscal_year/fiscal_quarter labels, type field,
// and pre-derived Q4 data. See us_fixed_company_jsons/README.md for full spec.

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

const CAL_Q_END_MONTH = { Q1: 3, Q2: 6, Q3: 9, Q4: 12 };

function dateToCalendar(dateInt) {
    const year = Math.floor(dateInt / 10000);
    const month = Math.floor((dateInt % 10000) / 100);
    const calQ = month <= 3 ? 'Q1' : month <= 6 ? 'Q2' : month <= 9 ? 'Q3' : 'Q4';
    return { calYear: year, calQ };
}

// Distance (in months) from a period-end date to its calendar quarter's canonical
// end month. Used to pick the better match when two fiscal quarters land in the
// same calendar-quarter bucket (common with 4-4-5 week retail fiscal calendars).
function monthsFromQuarterEnd(dateInt, calQ) {
    const month = Math.floor((dateInt % 10000) / 100);
    return Math.abs(month - CAL_Q_END_MONTH[calQ]);
}

function processUsCompanyData(raw) {
    const { ticker, name, cik, annual: annualRaw, quarterly: quarterlyRaw } = raw;

    // --- Annual data ---
    const annualData = (annualRaw || [])
        .map(entry => {
            const year = Math.floor(entry.date / 10000);
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
    // Filter for single-quarter entries only (pre-derived Q4 included)
    const singleQuarters = (quarterlyRaw || []).filter(e => e.type === 'single');
    const quarterMap = new Map();

    singleQuarters.forEach(entry => {
        const { calYear, calQ } = dateToCalendar(entry.date);
        const key = `${calYear}-${calQ}`;
        const existing = quarterMap.get(key);
        // When two fiscal quarters land in the same calendar bucket, keep whichever
        // period-end date is closer to that quarter's canonical end month; only
        // fall back to "latest date" on an exact tie.
        const shouldReplace = !existing
            || monthsFromQuarterEnd(entry.date, calQ) < monthsFromQuarterEnd(existing.date, calQ)
            || (monthsFromQuarterEnd(entry.date, calQ) === monthsFromQuarterEnd(existing.date, calQ) && entry.date > existing.date);
        if (shouldReplace) {
            quarterMap.set(key, {
                date: entry.date,
                year: calYear,
                calQ,
                revenue: entry.revenue,
                operating_income: entry.operating_income,
                net_income: entry.net_income,
                eps: entry.eps != null ? entry.eps : entry.eps_basic,
            });
        }
    });

    // Sort and enrich quarterly data
    const quarterlyData = Array.from(quarterMap.values())
        .sort((a, b) => a.date - b.date)
        .map(entry => ({
            ...entry,
            displayLabel: `${entry.year} ${entry.calQ}`,
            op_margin: (entry.revenue && entry.operating_income != null)
                ? parseFloat(((entry.operating_income / entry.revenue) * 100).toFixed(1))
                : null,
        }));

    // Calculate quarterly YoY (same calendar quarter previous year)
    quarterlyData.forEach((entry) => {
        const prevYear = quarterlyData.find(
            e => e.year === entry.year - 1 && e.calQ === entry.calQ
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
