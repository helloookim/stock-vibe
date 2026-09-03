# US Stock Financial Data (SEC EDGAR)

Per-company JSON files containing 10+ years of key financial metrics extracted from SEC EDGAR filings. Data covers 5,000+ US-listed companies with annual (10-K) and quarterly (10-Q) financials.

## Data Source

- **SEC EDGAR Bulk Data** (2015q1 ~ 2025q4)
- Filing types: 10-K, 10-Q, 20-F, 40-F
- Post-processed with Q4 derivation (annual minus 9-month cumulative)

## File Structure

One JSON file per company, named by ticker symbol (e.g., `AAPL.json`, `MSFT.json`).

```json
{
    "ticker": "AAPL",
    "cik": 320193,
    "name": "APPLE INC",
    "fy_end_month": 9,
    "annual": [ ... ],
    "quarterly": [ ... ]
}
```

### Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `ticker` | string | Stock ticker symbol |
| `cik` | int | SEC Central Index Key |
| `name` | string | Company name from SEC filings |
| `fy_end_month` | int | Fiscal year-end month (1-12). E.g., Apple = `9` (September), most companies = `12` (December) |
| `annual` | array | Annual financial records (from 10-K/20-F/40-F filings) |
| `quarterly` | array | Quarterly financial records (single-quarter and cumulative) |

## Annual Records

```json
{
    "date": 20240930,
    "fiscal_year": "FY2024",
    "revenue": 391035000000.0,
    "operating_income": 123216000000.0,
    "net_income": 93736000000.0,
    "eps": 6.08,
    "eps_basic": 6.11,
    "pretax_income": 123485000000.0,
    "operating_cash_flow": 118254000000.0,
    "total_assets": 364980000000.0,
    "total_equity": 56950000000.0,
    "source": "2025q4"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `date` | int | Fiscal year-end date (YYYYMMDD format) |
| `fiscal_year` | string | Fiscal year label (e.g., `"FY2024"`) |
| `source` | string | SEC filing batch the data was extracted from (e.g., `"2025q4"`) |

## Quarterly Records

```json
{
    "date": 20240629,
    "fiscal_quarter": "FY2024Q3",
    "type": "single",
    "qtrs": 1,
    "revenue": 85777000000.0,
    "operating_income": 25352000000.0,
    "net_income": 21448000000.0,
    "eps": 1.4,
    "operating_cash_flow": null,
    "source": "2024q3"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `date` | int | Period-end date (YYYYMMDD format) |
| `fiscal_quarter` | string | Fiscal quarter label (e.g., `"FY2024Q3"`) relative to the company's fiscal year |
| `type` | string | `"single"` = one quarter (3 months), `"cumulative_6m"` = first half (6 months), `"cumulative_9m"` = first three quarters (9 months) |
| `qtrs` | int | Numeric period indicator: `1` = single quarter, `2` = 6-month cumulative, `3` = 9-month cumulative |
| `is_calculated` | bool | `true` if Q4 was derived (annual minus Q3 cumulative), absent or `null` otherwise |
| `source` | string | SEC filing batch the data was extracted from |

## Financial Metrics

| Metric | Description |
|--------|-------------|
| `revenue` | Total revenue / net sales |
| `operating_income` | Operating income (loss) |
| `net_income` | Net income (loss) |
| `pretax_income` | Income before income taxes |
| `eps` | Diluted earnings per share |
| `eps_basic` | Basic earnings per share |
| `operating_cash_flow` | Net cash from operating activities |
| `total_assets` | Total assets (balance sheet) |
| `total_equity` | Total stockholders' equity |

All monetary values are in USD. Missing values are `null`.

## Fiscal Quarter Labels

Quarter labels are **relative to each company's fiscal year**, not calendar quarters.

Examples:

| Company | FY Ends | Dec Quarter | Mar Quarter | Jun Quarter | Sep Quarter |
|---------|---------|-------------|-------------|-------------|-------------|
| Apple (`fy_end_month: 9`) | September | FY_Q1 | FY_Q2 | FY_Q3 | FY_Q4 |
| Microsoft (`fy_end_month: 6`) | June | FY_Q2 | FY_Q3 | FY_Q4 | FY_Q1 |
| Walmart (`fy_end_month: 1`) | January | FY_Q3 | FY_Q4 (prev year) | FY_Q1 | FY_Q2 |
| Most companies (`fy_end_month: 12`) | December | FY_Q4 | FY_Q1 | FY_Q2 | FY_Q3 |

## Understanding Cumulative Data

SEC quarterly filings often report **cumulative** figures for certain items (especially cash flow):

| `type` | `qtrs` | Meaning | Example |
|--------|--------|---------|---------|
| `"single"` | 1 | That quarter only (3 months) | Q2 revenue = Q2 only |
| `"cumulative_6m"` | 2 | Q1 + Q2 combined (6 months) | Half-year cash flow |
| `"cumulative_9m"` | 3 | Q1 + Q2 + Q3 combined (9 months) | 9-month cash flow |

The same date may have both a `single` and a `cumulative` record with different values. To get a single-quarter value from cumulative data:

```
Q2_single = cumulative_6m - Q1_single
Q3_single = cumulative_9m - cumulative_6m
```

## Usage Examples

### Python — Load and filter single-quarter data

```python
import json

with open("fixed_company_jsons/AAPL.json") as f:
    data = json.load(f)

print(f"{data['ticker']} (FY ends month {data['fy_end_month']})")

# Annual data
for row in data["annual"]:
    print(f"  {row['fiscal_year']}: revenue={row.get('revenue')}")

# Quarterly data — single quarter only
for row in data["quarterly"]:
    if row["type"] == "single":
        print(f"  {row['fiscal_quarter']}: revenue={row.get('revenue')}")
```

### Python — Build a quarterly revenue chart (single-quarter only)

```python
import json

with open("fixed_company_jsons/AAPL.json") as f:
    data = json.load(f)

quarters = [r for r in data["quarterly"] if r["type"] == "single"]
quarters.sort(key=lambda r: r["date"])

labels = [r["fiscal_quarter"] for r in quarters]
values = [r["revenue"] for r in quarters]

# Use labels/values with your charting library (matplotlib, Chart.js, etc.)
```

### JavaScript — Fetch and filter for web charts

```javascript
const res = await fetch("/data/AAPL.json");
const data = await res.json();

// Single-quarter records only
const quarters = data.quarterly
  .filter(r => r.type === "single")
  .sort((a, b) => a.date - b.date);

// Annual records
const annual = data.annual.sort((a, b) => a.date - b.date);

// Ready for Chart.js, D3, etc.
const labels = quarters.map(r => r.fiscal_quarter);
const revenue = quarters.map(r => r.revenue);
```

### Deriving single-quarter cash flow from cumulative

```python
import json

with open("fixed_company_jsons/AAPL.json") as f:
    data = json.load(f)

quarterly = sorted(data["quarterly"], key=lambda r: (r["date"], r["qtrs"]))

# Group by fiscal_quarter
from collections import defaultdict
by_fq = defaultdict(dict)
for r in quarterly:
    by_fq[r["fiscal_quarter"]][r["type"]] = r

# For each quarter, get single-quarter cash flow
for fq in sorted(by_fq):
    rec = by_fq[fq]
    if "single" in rec and rec["single"].get("operating_cash_flow") is not None:
        print(f"{fq}: {rec['single']['operating_cash_flow']}")
    elif "cumulative_6m" in rec:
        # Q2 cash flow = 6m cumulative (look up Q1 to subtract)
        print(f"{fq}: needs Q1 subtraction from cumulative_6m")
```
