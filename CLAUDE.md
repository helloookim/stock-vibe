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

The build script runs `npm run generate-sitemap && vite build`. The sitemap generator (`generate-sitemap.js`) reads chunked data files to produce `public/sitemap.xml`.

### Data Processing (Python)

```bash
python scripts/process_data.py       # Process Korean stock data
python scripts/process_us_data.py    # Process US stock data
```

Requires Python 3.8+ with `FinanceDataReader` and `pandas`.

## Architecture

### Directory Structure

```
src/
├── main.jsx                  # Entry point — routing with React.lazy() code splitting
├── App.jsx                   # Korean stock detail analysis page (~1400 lines)
├── i18n.js                   # i18next configuration (ko/en)
├── index.css                 # All CSS styles (~39KB)
├── dataLoader.js             # Chunked data loader for Korean stocks (class DataLoader)
├── usDataLoader.js           # On-demand loader for US stock data
├── components/
│   ├── SEOHead.jsx           # Helmet-based SEO meta + JSON-LD structured data
│   ├── LanguageToggle.jsx    # Korean/English toggle (persists to localStorage)
│   ├── MarketToggle.jsx      # KR/US market switcher
│   └── ShareButtons.jsx     # Social sharing (KakaoTalk, Twitter, Facebook, Naver)
├── pages/
│   ├── Home.jsx              # Landing page with stock lists, search, sort
│   ├── UsStockPage.jsx       # US stock detail analysis (~45KB)
│   ├── BlogList.jsx          # Blog article listing
│   ├── NotFound.jsx          # 404 page
│   ├── PrivacyPolicy.jsx     # Privacy policy
│   ├── Terms.jsx             # Terms of service
│   ├── Contact.jsx           # Contact page
│   └── blog/                 # 9 individual blog article pages
│       ├── SamsungElectronics.jsx
│       ├── SKHynix.jsx
│       └── ... (7 more)
└── locales/
    ├── ko.json               # Korean translations
    └── en.json               # English translations

public/
├── data/                     # Static JSON data files (~50MB total)
│   ├── financial_data_00.json ... financial_data_04.json   # Korean stock chunks
│   ├── financial_data_separate_00.json                     # Separate financial data
│   ├── eps_data_00.json ... eps_data_05.json               # EPS data chunks
│   ├── market_cap_data.json                                # Market cap data
│   ├── us_stocks/            # Individual JSON per US ticker
│   └── us_company_index.json # US company index
├── og-image.png              # Open Graph social image
├── robots.txt, ads.txt       # SEO/ads config
├── site.webmanifest          # PWA manifest
├── _headers                  # Cloudflare security headers
└── _redirects                # SPA fallback rule

functions/
└── [[path]].js               # Cloudflare Pages function — redirects legacy /XXXXXX to /stocks/XXXXXX

scripts/                      # Python data processing scripts
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

Korean stock data is split into chunks to stay under Cloudflare Pages' 25MB file size limit:

- `DataLoader` class in `dataLoader.js` manages chunked loading with caching
- Three loader instances exported: `financialDataLoader`, `financialDataSeparateLoader`, `epsDataLoader`
- US stock data loaded on-demand per ticker via `usDataLoader.js`. Data includes `fiscal_year`/`fiscal_quarter` labels and pre-derived Q4 entries, so the loader simply parses labels and filters `type === "single"` quarters.
- All data fetching uses the native `fetch()` API (no axios)

## Code Conventions

### Component Patterns
- **Functional components only** — no class components
- **React Hooks** for all state/effects (`useState`, `useEffect`, `useMemo`, `useRef`)
- **No external state management** — props drilling, no Redux/Context
- **Code splitting** — all pages lazy-loaded via `React.lazy()`

### Styling
- **Inline styles** are the primary styling method in components
- **CSS file** (`src/index.css`) handles structural/layout styles
- **Dark theme only** — background colors: `#0f172a`, `#020617`; accent: `#60a5fa`; text: `#e2e8f0`
- Tailwind CSS utilities (`clsx`, `tailwind-merge`) are dependencies but Tailwind classes are not used in components

### Naming
- **Components/files:** PascalCase (`ShareButtons.jsx`, `UsStockPage.jsx`)
- **Functions/variables:** camelCase (`loadAllFinancialData`, `handleClickOutside`)
- **Constants:** UPPER_SNAKE_CASE (`CHUNK_SIZE`, `EXCLUDED_SECTORS`)
- **CSS classes:** kebab-case (`market-toggle`, `share-dropdown`)

### Internationalization (i18n)
- Uses `i18next` + `react-i18next` for Korean/English support
- Translations in `src/locales/ko.json` and `src/locales/en.json`
- Default language: Korean (`ko`), fallback: Korean
- Language preference stored in `localStorage`
- Usage: `const { t } = useTranslation()` then `t('key.path')`

### SEO
- `react-helmet-async` for per-page meta tags
- JSON-LD structured data (Article, FAQPage, BreadcrumbList, WebSite, Organization schemas)
- Hreflang tags for bilingual support
- OpenGraph and Twitter Card meta tags
- Sitemap generated at build time from data files

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

### Korean Stock Data
```javascript
{
  "005930": {
    "code": "005930",
    "name": "삼성전자",
    "sector": "전자",
    "history": [
      { "year": 2024, "quarter": "Q1", "revenue": 12345, "op_profit": 5678, "eps": 123 }
    ]
  }
}
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

## Important Notes for AI Assistants

1. **Large component files** — `App.jsx` (~1400 lines) and `UsStockPage.jsx` (~45KB) are monolithic. Read them before making changes.
2. **No TypeScript** — the project uses plain JavaScript throughout.
3. **Inline styles dominate** — most visual styling is in JSX `style={{}}` objects, not CSS classes.
4. **Static data** — all financial data is pre-generated JSON. There is no backend API or database.
5. **Bilingual content** — any user-facing text must be added to both `ko.json` and `en.json` locale files.
6. **Chunked data loading** — Korean stock data is split across multiple JSON files. Changes to data structure require updating `dataLoader.js` and potentially `generate-sitemap.js`.
7. **No tests exist** — there is no test infrastructure to run or maintain.
8. **Hardcoded config** — analytics IDs, API keys, and the domain are hardcoded. No `.env` files are used.
