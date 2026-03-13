# CLAUDE.md — AI Assistant Guide for stock-vibe

## Project Overview

**QUANTVIBE** (stock-vibe) is a bilingual (Korean/English) stock financial analysis dashboard deployed on Cloudflare Pages. It visualizes financial data (revenue, operating profit, EPS) for Korean and US stocks using static JSON data files.

- **Live site:** https://kstockview.com
- **Stack:** React 18 + Vite 5 (JavaScript, no TypeScript)
- **Deployment:** Cloudflare Pages
- **Language:** Pure JavaScript with ES modules (`"type": "module"`)

## Common Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Generate sitemap + Vite production build
npm run lint         # Run ESLint
npm run preview      # Preview production build locally
```

The build script runs `npm run generate-sitemap && vite build`. The sitemap generator (`generate-sitemap.js`) reads `kr_company_index.json` and `us_company_index.json` to produce `public/sitemap.xml`.

### Data Processing

```bash
# Korean stock data — DART OpenAPI pipeline (financial statements)
python scripts/fetch_kr_data_dart.py                    # Full fetch (all companies, 2015–2025)
python scripts/fetch_kr_data_dart.py --year 2025        # Incremental update for one year (merges into existing data)
python scripts/fetch_kr_data_dart.py --test             # Test with 8 companies
python scripts/fetch_kr_data_dart.py --eps-backfill 500 # Backfill EPS for top N companies
python scripts/fetch_kr_data_dart.py --fix-revenue       # Fix missing revenue/op_profit/net_income via full API
python scripts/fetch_kr_data_dart.py --index-only       # Regenerate index only

# Korean stock data — Naver Finance scraper (quarterly data + EPS via Selenium)
python scripts/fetch_naver_finance.py --test             # Test with 5 companies
python scripts/fetch_naver_finance.py --top 100          # Top 100 by market cap (default)
python scripts/fetch_naver_finance.py --all              # All companies
python scripts/fetch_naver_finance.py --code 005930      # Single company
python scripts/fetch_naver_finance.py --dry-run --top 10 # Parse only, don't save

# Korean stock data — KRX price/PER/PBR pipeline (runs AFTER DART pipeline)
python scripts/fetch_krx_data.py                        # Full fetch (latest + historical prices)
python scripts/fetch_krx_data.py --latest-only           # Latest PER/PBR only (1 API call)
python scripts/fetch_krx_data.py --start-year 2020       # Historical prices from 2020+

# US stock data
python scripts/prepare_us_data.py
```

## Architecture

### Directory Structure

```
src/
├── main.jsx                  # Entry point — routing with React.lazy() code splitting
├── App.jsx                   # Korean stock detail analysis page
├── i18n.js                   # i18next configuration (ko/en)
├── index.css                 # All CSS styles
├── krDataLoader.js           # On-demand loader for KR stock data (per-company JSON)
├── usDataLoader.js           # On-demand loader for US stock data (per-company JSON)
├── dataLoader.js             # [LEGACY] Chunked data loader — no longer imported by any component
├── components/
│   ├── SEOHead.jsx           # Helmet-based SEO meta + JSON-LD structured data
│   ├── LanguageToggle.jsx    # Korean/English toggle (persists to localStorage)
│   ├── MarketToggle.jsx      # KR/US market switcher
│   ├── ThemeToggle.jsx       # Light/Dark mode toggle
│   └── ShareButtons.jsx      # Social sharing (KakaoTalk, Twitter, Facebook, Naver)
├── hooks/
│   └── useThemeColors.js     # Theme-aware color hook
├── pages/
│   ├── Home.jsx              # Landing page with stock lists, search, sort, spotlight
│   ├── UsStockPage.jsx       # US stock detail analysis
│   ├── BlogList.jsx          # Blog article listing
│   ├── NotFound.jsx          # 404 page
│   ├── PrivacyPolicy.jsx     # Privacy policy
│   ├── Terms.jsx             # Terms of service
│   ├── Contact.jsx           # Contact page
│   └── blog/                 # 9 individual blog article pages
└── locales/
    ├── ko.json               # Korean translations
    └── en.json               # English translations

public/
├── data/
│   ├── kr_company_index.json                           # KR sidebar index (3,039 companies, 666KB)
│   ├── kr_stocks/            # Individual JSON per KR stock code (~3,039 files, ~14MB total)
│   ├── us_company_index.json # US company index (~5,067 companies)
│   └── us_stocks/            # Individual JSON per US ticker (~5,067 files)
├── og-image.png              # Open Graph social image
├── robots.txt, ads.txt       # SEO/ads config
├── site.webmanifest          # PWA manifest
├── _headers                  # Cloudflare security headers
└── _redirects                # SPA fallback rule

scripts/
├── README.md                 # Comprehensive pipeline documentation
├── fetch_kr_data_dart.py     # ① DART OpenAPI pipeline — generates kr_stocks/ and kr_company_index.json
├── fetch_krx_data.py         # ② KRX price pipeline — merges close_price, PER, PBR into kr_stocks/ JSONs
├── fetch_naver_finance.py    # ③ Naver Finance scraper — quarterly/annual data + EPS via Selenium
├── prepare_us_data.py        # ④ US stock data preparation — copies SEC EDGAR data to public/
├── daily_update.bat          # Windows Task Scheduler script for daily KRX price update
└── migrate_kr_data.js        # [LEGACY] Old chunked data migration

data/
├── dart_corp_codes.json      # Cached DART corp_code ↔ stock_code mapping
└── dart_raw/                 # Raw DART API responses (if saved)

functions/
└── [[path]].js               # Cloudflare Pages function — redirects legacy /XXXXXX to /stocks/XXXXXX
```

### Routing (defined in `src/main.jsx`)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Landing page with stock lists |
| `/stocks/:stockCode` | `App` | Korean stock detail view |
| `/us-stocks/:ticker` | `UsStockPage` | US stock detail view |
| `/blogs` | `BlogList` | Blog listing |
| `/blog/:slug` | Individual blog | 9 hardcoded blog routes |
| `/privacy` | `PrivacyPolicy` | Privacy policy |
| `/terms` | `Terms` | Terms of service |
| `/contact` | `Contact` | Contact page |
| `*` | `NotFound` | 404 fallback |

All page components are lazy-loaded via `React.lazy()` with a shared `<Suspense>` boundary.

### Data Loading Strategy

**Korean stocks** — On-demand per company via `krDataLoader.js` (DART OpenAPI sourced):

- Sidebar: `kr_company_index.json` (666KB, 3,039 companies) loaded once on mount
- Detail: individual JSONs from `public/data/kr_stocks/{stockCode}.json` (~4-8KB each) loaded on-demand
- `loadKrCompanyIndex()` → returns array of `{ stock_code, name, name_en, sector, market, rank, last_revenue, last_op_profit }`
- `loadKrCompanyData(stockCode)` → returns full company JSON with `annual[]` and `quarterly[]`
- `processKrCompanyData(raw)` → returns `{ quarterlyData, annualData }` with YoY and op_margin calculated
- Both index and company data are cached in memory after first load
- Includes English company names (`name_en`) from DART corpCode.xml
- Financial companies (banks/insurance/securities) now included (~296 companies added vs old data)

**US stocks** — On-demand per ticker via `usDataLoader.js`:

- Sidebar: `us_company_index.json` (~150KB, ~5,067 companies)
- Detail: individual JSONs from `public/data/us_stocks/{TICKER}.json`
- Data includes `fiscal_year`/`fiscal_quarter` labels and pre-derived Q4 entries
- Loader parses labels and filters `type === "single"` quarters
- All data fetching uses the native `fetch()` API (no axios)

**Legacy data files** (no longer used by frontend, kept for reference):
- `kr_quarterly_00.json`, `kr_quarterly_01.json`, `kr_quarterly_index.json`, `kr_annual.json`
- `market_cap_data.json` (sidebar data — replaced by `kr_company_index.json`)
- `dataLoader.js` (class-based chunked loader — replaced by `krDataLoader.js`)

## Code Conventions

### Component Patterns
- **Functional components only** — no class components
- **React Hooks** for all state/effects (`useState`, `useEffect`, `useMemo`, `useRef`)
- **No external state management** — props drilling, no Redux/Context
- **Code splitting** — all pages lazy-loaded via `React.lazy()`

### Styling
- **Inline styles** are the primary styling method in components
- **CSS file** (`src/index.css`) handles structural/layout styles
- **Light/Dark theme** — toggled via `ThemeToggle` component, colors provided by `useThemeColors` hook
- Tailwind CSS utilities (`clsx`, `tailwind-merge`) are dependencies but Tailwind classes are not used in components

### Naming
- **Components/files:** PascalCase (`ShareButtons.jsx`, `UsStockPage.jsx`)
- **Functions/variables:** camelCase (`loadKrCompanyIndex`, `handleClickOutside`)
- **Constants:** UPPER_SNAKE_CASE (`BATCH_SIZE`, `EXCLUDED_SECTORS`)
- **CSS classes:** kebab-case (`market-toggle`, `share-dropdown`)

### Internationalization (i18n)
- Uses `i18next` + `react-i18next` for Korean/English support
- Translations in `src/locales/ko.json` and `src/locales/en.json`
- Default language: Korean (`ko`), fallback: Korean
- Language preference stored in `localStorage`
- Usage: `const { t, i18n } = useTranslation()` then `t('key.path')`
- English company names: `isEn ? (company.name_en || company.name) : company.name`

### SEO
- `react-helmet-async` for per-page meta tags
- JSON-LD structured data (Article, FAQPage, BreadcrumbList, WebSite, Organization schemas)
- Hreflang tags for bilingual support
- OpenGraph and Twitter Card meta tags
- Sitemap generated at build time from `kr_company_index.json` and `us_company_index.json`

## Third-Party Integrations

- **Google Analytics (GA4):** `G-3KN148ST56` — loaded in `index.html`
- **Google AdSense:** `ca-pub-9130041681645679` — loaded in `index.html`
- **Kakao SDK:** v2.7.2 — used for KakaoTalk sharing in `ShareButtons.jsx`
- **Pretendard font** — loaded from CDN in `index.html`

All IDs/keys are hardcoded (no environment variables used).

## Deployment

- **Platform:** Cloudflare Pages
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 18
- **Security headers:** Defined in `public/_headers` (HSTS, X-Frame-Options: DENY, XSS protection)
- **SPA routing:** `public/_redirects` with `/* /index.html 200`
- **Legacy redirects:** `functions/[[path]].js` handles old `/XXXXXX` stock code URLs

## Testing & Linting

- **No test framework** is configured (no Jest, Vitest, or test files)
- **ESLint v9** is installed with React plugins but no config file exists
- **No Prettier** or formatting tool configured
- **No CI/CD pipeline** — no GitHub Actions or similar

## Key Data Structures

### Korean Stock Data (DART API sourced)

Per-company JSON files (`public/data/kr_stocks/{stockCode}.json`):

```javascript
{
  "stock_code": "005930",
  "corp_code": "00126380",          // DART 8-digit corp code
  "name": "삼성전자",
  "name_en": "SAMSUNG ELECTRONICS CO,.LTD",
  "sector": "통신 및 방송장비 제조업",
  "market": "KOSPI",                // KOSPI or KOSDAQ
  "fy_end_month": 12,
  // Top-level KRX market data (latest trading day)
  "last_close_price": 55500,        // Latest close price (KRW)
  "last_close_date": "20260311",    // Date of latest price
  "last_mktcap": 3314085000000,     // Market capitalization (KRW)
  "last_per": 9.6,                  // PER = mktcap / latest annual net_income
  "last_pbr": 0.92,                 // PBR = mktcap / latest annual total_equity
  "annual": [{
    "year": 2024,
    "revenue": 300870903000000,     // All monetary values in KRW (원)
    "op_profit": 32725961000000,
    "net_income": 34451351000000,
    "total_assets": 479518073000000,
    "total_equity": 361063324000000,
    "total_debt": 118454749000000,
    "eps": null,                    // EPS not available from key accounts API
    "close_price": 53000,           // KRX: year-end close price
    "per": 9.2,                     // KRX: PER at year-end
    "pbr": 0.88                     // KRX: PBR at year-end
  }],
  "quarterly": [{
    "year": 2024, "quarter": "1Q",  // 1Q, 2Q, 3Q, 4Q
    "revenue": 71915601000000,
    "op_profit": 6606009000000,
    "net_income": 6754708000000,
    "eps": 975,                     // EPS backfilled from legacy data
    "close_price": 80600,           // KRX: quarter-end close price
    "per": 33.7,                    // KRX: PER = mktcap / trailing 4Q net_income
    "pbr": 1.34                     // KRX: PBR = mktcap / latest annual total_equity
  }]
}
```

Sidebar index (`public/data/kr_company_index.json`):

```javascript
[{
  "stock_code": "005930",
  "name": "삼성전자",
  "name_en": "SAMSUNG ELECTRONICS CO,.LTD",
  "sector": "통신 및 방송장비 제조업",
  "market": "KOSPI",
  "rank": 1,                        // Market cap rank (from market_cap_data.json)
  "last_revenue": 300870903000000,
  "last_op_profit": 32725961000000
}]
```

### US Stock Data

Per-company JSON files from SEC EDGAR (2015q1–2025q4). See `us_fixed_company_jsons/README.md` for full spec.

```javascript
{
  "ticker": "AAPL",
  "cik": 320193,
  "name": "APPLE INC",
  "fy_end_month": 9,            // Fiscal year-end month (1-12). Apple = September
  "annual": [{
    "date": 20240930,            // Fiscal year-end date (YYYYMMDD)
    "fiscal_year": "FY2024",     // Fiscal year label
    "revenue": 391035000000.0,   // All monetary values in full USD
    "operating_income": 123216000000.0,
    "net_income": 93736000000.0,
    "eps": 6.08,
    "eps_basic": 6.11,
    "pretax_income": 123485000000.0,
    "operating_cash_flow": 118254000000.0,
    "source": "2025q4"
  }],
  "quarterly": [{
    "date": 20240629,
    "fiscal_quarter": "FY2024Q3", // Fiscal quarter label (relative to company's FY)
    "type": "single",             // "single" | "cumulative_6m" | "cumulative_9m"
    "qtrs": 1,                    // 1=single, 2=6m, 3=9m
    "revenue": 85777000000.0,
    "operating_income": 25352000000.0,
    "net_income": 21448000000.0,
    "eps": 1.4,
    "is_calculated": null,        // true if Q4 was derived (annual - 9m cumulative)
    "source": "2024q3"
  }]
}
```

## DART OpenAPI Pipeline

### Overview
- **API Key:** `c1cb15169326b68bd3d68f63969f2cd67dad63be`
- **Base URL:** `https://opendart.fss.or.kr/api`
- **Rate limit:** ~10,000 calls/day (free)
- **Main endpoint:** `fnlttMultiAcnt.json` (batch up to 100 companies)
- **Documentation:** `DART_API_GUIDE.md` (comprehensive reference)

### Pipeline Script: `scripts/fetch_kr_data_dart.py`
1. Loads corp_code mapping from `data/dart_corp_codes.json` (cached) or downloads from DART
2. Fetches key accounts (revenue, op_profit, net_income, total_assets, total_equity, total_debt) via batch API (`fnlttMultiAcnt`)
3. Consolidates CFS (consolidated) vs OFS (individual) — prefers CFS
4. Derives Q4 = Annual − (Q1 + Q2 + Q3) using `safe_subtract_multi()`
5. Detects Q4 anomalies and auto-fixes using `fnlttSinglAcnt` endpoint's 9-month cumulative data
6. Fixes missing financials via `fnlttSinglAcntAll` fallback — the batch API sometimes omits accounts when companies use non-standard names (e.g., `영업수익` instead of `매출액` after holding company conversion). The `--fix-revenue` flag runs this step standalone.
7. Merges EPS from legacy data files (when available)
8. **Merge behavior:** `--year` mode merges into existing JSON files (preserves other years); full mode preserves KRX market data fields (close_price, per, pbr)
9. Generates per-company JSON files in `public/data/kr_stocks/`
10. Generates sidebar index `public/data/kr_company_index.json`

### KRX Price Pipeline: `scripts/fetch_krx_data.py`
- Runs **after** the DART pipeline
- Fetches daily trading data from data.go.kr (금융위원회 주식시세정보)
- Computes **PER** = market cap / net_income (trailing 4Q for quarterly, annual for annual entries)
- Computes **PBR** = market cap / total_equity (latest annual)
- Merges close_price, PER, PBR into existing per-company JSON files
- `--latest-only` for quick daily update (1 API call)
- **Must be re-run after Naver scraper** if new net_income was added, to recalculate PER/PBR
- **Historical data limitation:** data.go.kr API only has data from **2020 onwards**. Pre-2020 close_price/PER/PBR is unavailable from this source.

### Naver Finance Scraper: `scripts/fetch_naver_finance.py`
- Selenium + BeautifulSoup scraper for Naver Finance WiseReport pages
- Fills data not available from DART: **Q4 data** (before official filing), **EPS**, **annual data** (preliminary earnings)
- Scrapes `주요재무정보` table: revenue, op_profit, net_income, EPS (quarterly) + total_assets, total_equity, total_debt (annual)
- **Merge strategy:** only fills null/missing fields, never overwrites existing DART data
- Skips estimate columns (marked with `(E)` or `bgE` CSS class)
- Unit conversion: 억원 × 1e8 = 원 for monetary values; EPS already in 원
- Rate limiting: 2.5s delay between pages, 2s AJAX wait
- **Dependencies:** `selenium`, `beautifulsoup4`, `webdriver-manager`, Chrome browser

### Daily Update: `scripts/daily_update.bat`
- Windows Task Scheduler script for automated daily KRX price updates
- Runs `fetch_krx_data.py --latest-only` (1 API call)
- Logs to `logs/daily_update_YYYYMMDD.log`, auto-cleans logs older than 30 days
- Schedule: weekdays 18:00 KST (after market close)

### Known Data Quality Issues
- **Q4 derivation:** `Q4 = Annual − Q1 − Q2 − Q3` can produce incorrect values when consolidation scope changes mid-year. The pipeline auto-detects anomalies and fixes them using `fnlttSinglAcnt` endpoint's `thstrm_add_amount` (9-month cumulative). Remaining negative Q4 entries are nullified.
- **Missing financials from batch API:** ~140+ companies had missing revenue/op_profit/net_income because the batch API (`fnlttMultiAcnt`) only returns standard "주요계정" names. Companies using `영업수익` (e.g., POSCO홀딩스, 카카오 after holding company conversion) or `연결당기순이익` (e.g., 현대자동차) were missing data. Fixed by falling back to `fnlttSinglAcntAll` (full financial statement API). ~70 small companies still have missing revenue where DART has no revenue account at all (SPACs, pre-revenue biotech).
- **EPS:** Not available from DART key accounts API. Backfilled from legacy chunked data and Naver Finance scraper (`fetch_naver_finance.py`).
- **Report period semantics:** For IS items, `fnlttMultiAcnt` returns `thstrm_amount` = single-quarter figure for Q1/H1/Q3 reports. H1 report's `thstrm_amount` = Q2 single (not 6-month cumulative).
- **Data freshness:** DART only has historical filings. Q1 reports appear ~May, H1 ~August, Q3 ~November, annual ~March of next year. No forward/consensus estimates available. Naver Finance often has preliminary earnings before official DART filings.

### Typical Pipeline Order
1. `fetch_kr_data_dart.py` — DART financials (revenue, op_profit, net_income, assets, equity, debt)
2. `fetch_krx_data.py` — KRX prices + PER/PBR computation
3. `fetch_naver_finance.py` — Fill Q4 data, EPS, annual data from Naver
4. `fetch_krx_data.py --latest-only` — Recalculate PER/PBR with updated net_income

## Important Notes for AI Assistants

1. **No TypeScript** — the project uses plain JavaScript throughout.
2. **Inline styles dominate** — most visual styling is in JSX `style={{}}` objects, not CSS classes.
3. **Static data** — all financial data is pre-generated JSON. There is no backend API or database.
4. **Bilingual content** — any user-facing text must be added to both `ko.json` and `en.json` locale files.
5. **On-demand data loading** — Both KR and US stock data use the same pattern: lightweight sidebar index loaded once, individual company JSON loaded on-demand when selected. KR uses `krDataLoader.js`, US uses `usDataLoader.js`.
6. **English company names** — KR companies have `name_en` field sourced from DART corpCode.xml. Use `isEn ? (c.name_en || c.name) : c.name` pattern for display.
7. **No tests exist** — there is no test infrastructure to run or maintain.
8. **Hardcoded config** — analytics IDs, API keys, and the domain are hardcoded. No `.env` files are used.
9. **Legacy data files** — Old chunked KR data files (`kr_quarterly_*.json`, `kr_annual.json`, `market_cap_data.json`) and `dataLoader.js` still exist but are no longer used. Frontend exclusively uses `krDataLoader.js` + per-company JSONs.
