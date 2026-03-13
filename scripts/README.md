# scripts/ — Data Pipeline Scripts

Data ingestion and processing scripts for **QUANTVIBE** (kstockview.com).
These scripts fetch financial data from external APIs, transform it, and output
static JSON files consumed by the React frontend.

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Korean Stocks (KR)                          │
│                                                                    │
│  ① fetch_kr_data_dart.py   DART FSS API → per-company JSONs       │
│          ↓                                                         │
│  ② fetch_krx_data.py       data.go.kr   → merge price/PER/PBR     │
│          ↓                                                         │
│  ③ fetch_naver_finance.py  Naver Finance → merge Q4 + EPS backfill │
│                                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                         US Stocks (US)                             │
│                                                                    │
│  ④ prepare_us_data.py      SEC EDGAR JSONs → deploy-ready files    │
│                                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                          Legacy                                    │
│                                                                    │
│  ⑤ migrate_kr_data.js      Old chunked format migration (unused)   │
└─────────────────────────────────────────────────────────────────────┘
```

**Output directory:** `public/data/`

| Output file | Source script | Description |
|---|---|---|
| `kr_company_index.json` | ① | Sidebar index (3,039 companies, 666KB) |
| `kr_stocks/{CODE}.json` | ①②③ | Per-company KR financial data (~3,039 files) |
| `us_company_index.json` | ④ | Sidebar index (~5,067 companies) |
| `us_stocks/{TICKER}.json` | ④ | Per-company US financial data (~5,067 files) |

---

## ① fetch_kr_data_dart.py

**DART OpenAPI pipeline** — the primary data source for Korean stock financials.

Fetches consolidated financial statements (revenue, operating profit, net income,
total assets, equity, debt) from Korea's DART (Data Analysis, Retrieval and
Transfer System) electronic disclosure API, then generates per-company JSON files.

### Data Source

- **API:** [DART OpenAPI](https://opendart.fss.or.kr) (금융감독원 전자공시시스템)
- **Main endpoint:** `fnlttMultiAcnt.json` — batch up to 100 companies per call
- **Fallback endpoints:**
  - `fnlttSinglAcnt.json` — Q4 anomaly fix via 9-month cumulative data
  - `fnlttSinglAcntAll.json` — full financial statement for missing revenue
- **Rate limit:** ~10,000 calls/day (free tier)
- **Coverage:** 2015–2025, ~3,039 listed companies (KOSPI + KOSDAQ)

### Usage

```bash
# Full fetch — all companies, all years (2015–2025)
python scripts/fetch_kr_data_dart.py

# Incremental update — single year (merges into existing files)
python scripts/fetch_kr_data_dart.py --year 2025

# Test mode — 5 companies only
python scripts/fetch_kr_data_dart.py --test

# Backfill EPS from legacy data for top N companies
python scripts/fetch_kr_data_dart.py --eps-backfill 500

# Fix missing revenue/op_profit/net_income via full financial statement API
python scripts/fetch_kr_data_dart.py --fix-revenue

# Fix Q4 anomalies only (negative Q4 from consolidation scope changes)
python scripts/fetch_kr_data_dart.py --fix-q4

# Regenerate sidebar index only (no API calls)
python scripts/fetch_kr_data_dart.py --index-only

# Force re-download corp_code ↔ stock_code mapping from DART
python scripts/fetch_kr_data_dart.py --refresh-codes
```

### Processing Steps

1. **Load corp codes** — Downloads/caches `corpCode.xml` ZIP from DART.
   Maps 8-digit `corp_code` ↔ 6-digit `stock_code`. Cached at `data/dart_corp_codes.json`.
2. **Fetch key accounts** — Batch API calls (100 companies × 4 report types × N years).
   Extracts: 매출액, 영업이익, 당기순이익, 자산총계, 자본총계, 부채총계.
3. **Consolidate CFS vs OFS** — Prefers consolidated (연결) over individual (별도) statements.
4. **Derive Q4** — `Q4 = Annual - (Q1 + Q2 + Q3)` since DART provides single-quarter figures.
5. **Fix Q4 anomalies** — Detects negative/outlier Q4 values caused by mid-year consolidation
   scope changes. Auto-fixes using `fnlttSinglAcnt` endpoint's 9-month cumulative data.
6. **Fix missing financials** — Some companies use non-standard account names (e.g., `영업수익`
   instead of `매출액`). Falls back to `fnlttSinglAcntAll` (full financial statement API).
7. **Merge EPS** — Backfills EPS from legacy data files when available.
8. **Save** — Per-company JSON files + sidebar index.

### Known Data Quality Issues

- **Q4 derivation errors:** ~666 company-years had anomalous Q4 values. Root cause: consolidation
  scope changes mid-year (e.g., Naver 2020 LINE deconsolidation). Auto-fixed in step 5.
- **Missing financials from batch API:** ~140+ companies had no revenue because the batch API only
  returns standard account names (`매출액`). Companies using `영업수익` (POSCO Holdings, Kakao
  after holding company conversion) were missing data. Fixed via `--fix-revenue`.
- **EPS unavailable:** DART's key accounts API doesn't return EPS. Backfilled from legacy data
  and Naver Finance scraper.
- **Report timing:** Q1 reports appear ~May, H1 ~August, Q3 ~November, annual ~March of next year.

### Dependencies

```
pip install requests
```

---

## ② fetch_krx_data.py

**Stock price pipeline** — fetches daily trading data and computes valuation ratios.

Runs **after** the DART pipeline. Merges close price, PER (Price-to-Earnings),
and PBR (Price-to-Book) into existing per-company JSON files.

### Data Source

- **API:** [data.go.kr](https://www.data.go.kr/data/15094808/openapi.do)
  (금융위원회 주식시세정보 — Korea Financial Services Commission)
- **Endpoint:** `GetStockSecuritiesInfoService/getStockPriceInfo`
- **Rate limit:** 10,000 calls/day, 30 TPS
- **Coverage:** KOSPI + KOSDAQ, all stocks in one call per date

### Usage

```bash
# Full fetch — latest prices + historical year-end/quarter-end prices (2015–2025)
python scripts/fetch_krx_data.py

# Latest only — 1 API call, updates top-level last_close_price/last_per/last_pbr
python scripts/fetch_krx_data.py --latest-only

# Historical prices from a specific year
python scripts/fetch_krx_data.py --start-year 2020

# Test mode — 5 companies only
python scripts/fetch_krx_data.py --test
```

### Processing Steps

1. **Fetch latest trading day** — Gets close price, market cap, listed shares for all stocks.
2. **Compute PER/PBR** — Using financial data from DART:
   - Annual PER = market cap / annual net income
   - Annual PBR = market cap / annual total equity
   - Quarterly PER = market cap / trailing 4-quarter net income
   - Quarterly PBR = market cap / latest annual total equity
3. **Fetch historical prices** — Quarter-end and year-end close prices for each year.
4. **Merge into JSONs** — Updates `close_price`, `per`, `pbr` fields in annual/quarterly entries
   and top-level `last_close_price`, `last_per`, `last_pbr`, `last_close_date`, `last_mktcap`.
5. **Update index** — Refreshes `kr_company_index.json` with latest data.

### Dependencies

```
pip install requests
```

---

## ③ fetch_naver_finance.py

**Naver Finance scraper** — fills in Q4 data and EPS not available from DART.

Uses Selenium to render Naver Finance's JavaScript-heavy WiseReport pages and
scrapes the `주요재무정보` (Key Financial Information) table. This provides:
- **Q4 data** before official DART filings (preliminary earnings on Naver)
- **EPS** which DART's key accounts API does not return

### Data Source

- **Page:** `https://navercomp.wisereport.co.kr/v2/company/c1010001.aspx?cmp_cd={code}`
- **Table:** `주요재무정보` section with 4 annual + 4 quarterly columns
- **Unit:** 억원 (100M KRW) with decimal precision in `title` attribute
- **Actual vs estimate:** Estimate columns marked with `(E)` in header or `bgE` CSS class

### Usage

```bash
# Test mode — 5 companies
python scripts/fetch_naver_finance.py --test

# Top N companies by market cap (default: 100)
python scripts/fetch_naver_finance.py --top 100

# All companies (~3,039)
python scripts/fetch_naver_finance.py --all

# Single company
python scripts/fetch_naver_finance.py --code 005930

# Dry run — parse and print without saving
python scripts/fetch_naver_finance.py --dry-run --top 10

# Show browser window (default is headless)
python scripts/fetch_naver_finance.py --no-headless --code 005930
```

### What It Scrapes

From the `주요재무정보` table on each company's page:

| Row label | Field | Unit | Conversion |
|---|---|---|---|
| 매출액 | `revenue` | 억원 | × 1e8 → 원 |
| 영업이익 | `op_profit` | 억원 | × 1e8 → 원 |
| 당기순이익 | `net_income` | 억원 | × 1e8 → 원 |
| EPS(원) | `eps` | 원 | no conversion |

Skipped rows: 영업이익(발표기준), 영업이익률, 당기순이익(지배), 당기순이익(비지배)

### Merge Behavior

- **Existing quarter, field is null** → fill from Naver data
- **Existing quarter, field has value** → keep existing (no overwrite)
- **New quarter** → add entire entry
- Preserves all other fields (close_price, per, pbr, etc.)

### Rate Limiting

2.5-second delay between page loads + 2-second wait for AJAX table to render.
Top 100 companies takes ~8 minutes. All ~3,039 companies takes ~3.5 hours.

### Dependencies

```
pip install selenium beautifulsoup4 webdriver-manager
```

Chrome browser must be installed. `webdriver-manager` auto-downloads the matching
ChromeDriver. Falls back to visible mode if headless fails.

---

## ④ prepare_us_data.py

**US stock data preparation** — copies pre-processed SEC EDGAR data to the deploy directory.

This is a simple file-copy script. The actual SEC EDGAR processing is done externally
and stored in `us_fixed_company_jsons/`. This script filters to tickers with available
data, generates the sidebar index, and copies files to `public/data/us_stocks/`.

### Usage

```bash
python scripts/prepare_us_data.py
```

### Input

- `us_company_tickers.json` — ticker metadata with market cap rankings
- `us_fixed_company_jsons/{TICKER}.json` — pre-processed SEC EDGAR financial data

### Output

- `public/data/us_company_index.json` — sidebar index (~5,067 companies, ~150KB)
- `public/data/us_stocks/{TICKER}.json` — per-company financial data

### Dependencies

None (stdlib only).

---

## ⑤ migrate_kr_data.js (Legacy)

**Data migration tool** — restructured old chunked KR data files. **No longer used.**

Previously merged 17 old data files into 4 consolidated files (`kr_quarterly_00.json`,
`kr_quarterly_01.json`, `kr_quarterly_index.json`, `kr_annual.json`). This format was
replaced by the per-company architecture (scripts ①②③).

```bash
node scripts/migrate_kr_data.js   # do not run — legacy only
```

---

## Typical Workflow

### Initial Setup (full data build)

```bash
# 1. Fetch all KR financial data from DART (takes ~30 min)
python scripts/fetch_kr_data_dart.py

# 2. Add stock prices and PER/PBR (takes ~5 min)
python scripts/fetch_krx_data.py

# 3. Backfill EPS from Naver Finance (takes ~8 min for top 100)
python scripts/fetch_naver_finance.py --top 100

# 4. Prepare US stock data
python scripts/prepare_us_data.py
```

### Incremental Update (e.g., new quarter released)

```bash
# 1. Fetch only 2025 data from DART (merges into existing files)
python scripts/fetch_kr_data_dart.py --year 2025

# 2. Update latest stock prices
python scripts/fetch_krx_data.py --latest-only

# 3. Scrape new quarterly data from Naver Finance
python scripts/fetch_naver_finance.py --top 100
```

### Quick Data Quality Check

```bash
# Fix Q4 anomalies
python scripts/fetch_kr_data_dart.py --fix-q4

# Fix missing revenue for companies with non-standard account names
python scripts/fetch_kr_data_dart.py --fix-revenue

# Regenerate sidebar index
python scripts/fetch_kr_data_dart.py --index-only
```

---

## Output JSON Format

### Korean Stock (per-company)

`public/data/kr_stocks/{STOCK_CODE}.json`

```json
{
  "stock_code": "005930",
  "corp_code": "00126380",
  "name": "삼성전자",
  "name_en": "SAMSUNG ELECTRONICS CO,.LTD",
  "sector": "통신 및 방송장비 제조업",
  "market": "KOSPI",
  "fy_end_month": 12,
  "last_close_price": 55500,
  "last_close_date": "20260311",
  "last_mktcap": 3314085000000,
  "last_per": 9.6,
  "last_pbr": 0.92,
  "annual": [
    {
      "year": 2024,
      "revenue": 300870903000000,
      "op_profit": 32725961000000,
      "net_income": 34451351000000,
      "total_assets": 479518073000000,
      "total_equity": 361063324000000,
      "total_debt": 118454749000000,
      "eps": null,
      "close_price": 53000,
      "per": 9.2,
      "pbr": 0.88
    }
  ],
  "quarterly": [
    {
      "year": 2024,
      "quarter": "1Q",
      "revenue": 71915601000000,
      "op_profit": 6606009000000,
      "net_income": 6754708000000,
      "eps": 975,
      "close_price": 80600,
      "per": 33.7,
      "pbr": 1.34
    }
  ]
}
```

All monetary values are in **KRW (원)**. `1조 = 1,000,000,000,000 / 1억 = 100,000,000`

### Korean Stock Index

`public/data/kr_company_index.json` — array of:

```json
{
  "stock_code": "005930",
  "name": "삼성전자",
  "name_en": "SAMSUNG ELECTRONICS CO,.LTD",
  "sector": "통신 및 방송장비 제조업",
  "market": "KOSPI",
  "rank": 1,
  "last_revenue": 300870903000000,
  "last_op_profit": 32725961000000
}
```

### US Stock (per-company)

`public/data/us_stocks/{TICKER}.json` — see `us_fixed_company_jsons/README.md` for full spec.

---

## Environment

- **Python:** 3.10+ (uses `pathlib`, f-strings, `walrus operator` in some places)
- **Node.js:** 18+ (only for legacy `migrate_kr_data.js`)
- **OS:** Tested on Windows 11. Scripts use `pathlib` for cross-platform path handling.
- **Chrome:** Required for `fetch_naver_finance.py` (Selenium WebDriver)

### Python Dependencies

```
requests            # fetch_kr_data_dart.py, fetch_krx_data.py
selenium            # fetch_naver_finance.py
beautifulsoup4      # fetch_naver_finance.py
webdriver-manager   # fetch_naver_finance.py (optional, auto-downloads ChromeDriver)
```

Install all:

```bash
pip install requests selenium beautifulsoup4 webdriver-manager
```

### API Keys

| API | Key | Script |
|---|---|---|
| DART OpenAPI | `c1cb15169...` | `fetch_kr_data_dart.py` |
| data.go.kr | `2a327102...` | `fetch_krx_data.py` |

Keys are hardcoded in the scripts (no `.env` files used).
