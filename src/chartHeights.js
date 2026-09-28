// Chart heights (px) for stock detail pages (App.jsx, UsStockPage.jsx).
// Desktop values keep each .chart-section card at roughly 5:3 (width:height)
// at the 960px max column width, so cards never get wider than that.
//   main   — bar chart above a YoY chart (no X axis of its own)
//   yoy    — YoY line chart under the bars (carries the year axis)
//   single — single chart in a card with a title + legend (valuation tab)
//   bare   — single chart in a card with no title/legend (operating margin)
const DESKTOP = { main: 326, yoy: 175, single: 480, bare: 535 };
const MOBILE = { main: 250, yoy: 120, single: 300, bare: 300 };

export const chartHeight = (kind, isMobile) => (isMobile ? MOBILE : DESKTOP)[kind];
