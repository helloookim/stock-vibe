// Shared X-axis + period-range helpers for stock detail charts (App.jsx, UsStockPage.jsx)

// displayLabel of the first entry of each year ("2020 1Q" → one tick per year).
// Synthetic points (e.g. the appended current price, year 9999) never get a tick.
export function yearTicks(data) {
    const seen = new Set();
    return (data || [])
        .filter(d => d.year < 9999 && !seen.has(d.year) && seen.add(d.year))
        .map(d => d.displayLabel);
}

// Horizontal, year-only X axis: "2020  2021  2022 …" instead of every quarter at -45°
export const yearAxisProps = (data, isMobile) => ({
    dataKey: 'displayLabel',
    ticks: yearTicks(data),
    tickFormatter: (label) => String(label).split(' ')[0],
    interval: 'preserveStartEnd',
    minTickGap: isMobile ? 4 : 8,
    fontSize: isMobile ? 10 : 11,
    tickLine: false,
    height: 24,
});

// Latest bar at full strength, earlier bars slightly muted so the newest period stands out
export const latestBarOpacity = (index, length) => (index === length - 1 ? 1 : 0.62);

// Period presets shown next to the metric tabs
export const RANGE_PRESETS = ['3y', '5y', '10y', 'all'];
export const defaultRangePreset = (viewMode) => (viewMode === 'annual' ? 'all' : '5y');

// [startYear, endYear] for a preset within the company's available years
export function rangeFromPreset(preset, { min, max }) {
    const years = { '3y': 3, '5y': 5, '10y': 10 }[preset];
    return years ? [Math.max(min, max - years + 1), max] : [min, max];
}
