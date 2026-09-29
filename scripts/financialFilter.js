// Financial-company detection shared by the data generators (rankings, movers).
// Based on scripts/scan_outliers.py, plus 생명/해상/손해 (insurers) and 지주 (e.g. 신한지주, whose
// sector is empty in the index). Their "revenue" / margins / debt ratios aren't comparable
// with operating companies, so the generators leave them out of those rankings.

const FINANCIAL_SECTOR_KEYWORDS = ['금융', '은행', '보험', '증권', '투자', '신탁', '지주'];
const FINANCIAL_NAME_KEYWORDS = [
    '은행', '보험', '증권', '금융', '캐피탈', '투자', '저축', '카드', '자산운용', '리츠', '스팩', '선물',
    '코리안리', '화재', '생명', '해상', '손해', '지주',
];

export const isFinancialCompany = (name = '', sector = '') =>
    FINANCIAL_SECTOR_KEYWORDS.some(kw => (sector || '').includes(kw))
    || FINANCIAL_NAME_KEYWORDS.some(kw => (name || '').includes(kw));
