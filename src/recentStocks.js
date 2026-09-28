// "Recently viewed" stocks, kept in this browser only (localStorage) and shown on the home page.
// Entries: { market: 'kr' | 'us', code, name, name_en }

const KEY = 'recent_stocks';
const MAX = 8;

export function getRecentStocks() {
    try {
        const list = JSON.parse(localStorage.getItem(KEY));
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

export function addRecentStock(entry) {
    if (!entry?.code) return;
    try {
        const rest = getRecentStocks().filter(s => !(s.market === entry.market && s.code === entry.code));
        localStorage.setItem(KEY, JSON.stringify([entry, ...rest].slice(0, MAX)));
    } catch {
        // storage unavailable (private mode etc.) — the list is a convenience only
    }
}

export function clearRecentStocks() {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // ignore
    }
}
