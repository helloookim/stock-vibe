import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read KR company index to get all stock codes
const indexPath = path.join(__dirname, 'public', 'data', 'kr_company_index.json');
const krIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

const baseUrl = 'https://kstockview.com';
const today = new Date().toISOString().split('T')[0];

const stockCodes = krIndex.map(c => c.stock_code);
stockCodes.sort();

console.log(`Generating sitemap for ${stockCodes.length} KR stocks...`);

// Blog pages
const blogPages = [
  'samsung-electronics',
  'sk-hynix',
  'hyundai-motor',
  'lg-energy-solution',
  'samsung-biologics',
  'hanwha-aerospace',
  'kia',
  'naver',
  'kakao'
];

// Generate sitemap XML
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

// Add blog list page
sitemap += `  <url>
    <loc>${baseUrl}/blogs</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;

// Add blog pages
blogPages.forEach(slug => {
  sitemap += `  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`});

// Rankings pages
const rankingCategories = [
  'market_cap_top', 'revenue_top', 'op_profit_top', 'per_lowest',
  'pbr_lowest', 'revenue_growth_top', 'op_margin_top', 'debt_ratio_lowest'
];

sitemap += `  <!-- Rankings Pages -->
  <url>
    <loc>${baseUrl}/rankings</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
rankingCategories.forEach(cat => {
  sitemap += `  <url>
    <loc>${baseUrl}/rankings/${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
});

// Sector pages
sitemap += `  <!-- Sector Pages -->
  <url>
    <loc>${baseUrl}/sectors</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
const sectorsPath = path.join(__dirname, 'public', 'data', 'kr_sectors.json');
let sectorCount = 0;
if (fs.existsSync(sectorsPath)) {
  const sectors = JSON.parse(fs.readFileSync(sectorsPath, 'utf-8'));
  sectors.forEach(s => {
    sitemap += `  <url>
    <loc>${baseUrl}/sectors/${s.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  });
  sectorCount = sectors.length;
  console.log(`Added ${sectorCount} sector pages to sitemap`);
}

// Popular comparison pages
const popularComparisons = [
  '005930-vs-000660', '005380-vs-000270', '035420-vs-035720',
  '373220-vs-006400', '207940-vs-068270', '005930-vs-000270',
];
sitemap += `  <!-- Compare Pages -->
`;
popularComparisons.forEach(codes => {
  sitemap += `  <url>
    <loc>${baseUrl}/compare/${codes}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
});

sitemap += `  <!-- Stock Pages -->
`;

// Add all stock pages (sorted for consistency)
stockCodes.forEach(code => {
  sitemap += `  <url>
    <loc>${baseUrl}/stocks/${code}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
});

// Add US stock pages
const usIndexPath = path.join(__dirname, 'public', 'data', 'us_company_index.json');
let usTickerCount = 0;
if (fs.existsSync(usIndexPath)) {
  const usIndex = JSON.parse(fs.readFileSync(usIndexPath, 'utf-8'));
  sitemap += `  <!-- US Stock Pages -->
`;
  usIndex.forEach(company => {
    sitemap += `  <url>
    <loc>${baseUrl}/us-stocks/${company.ticker}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });
  usTickerCount = usIndex.length;
  console.log(`Added ${usTickerCount} US stock pages to sitemap`);
}

sitemap += '</urlset>';

// Write sitemap to public folder
const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap);

console.log(`✅ Sitemap generated successfully!`);
console.log(`📍 Location: ${sitemapPath}`);
const rankingsCount = 1 + rankingCategories.length;
const comparisonCount = popularComparisons.length;
const totalUrls = stockCodes.length + 5 + blogPages.length + usTickerCount + rankingsCount + (sectorCount + 1) + comparisonCount;
console.log(`📊 Total URLs: ${totalUrls} (1 homepage + 1 blogs + 3 static + ${blogPages.length} blogs + ${rankingsCount} rankings + ${sectorCount + 1} sectors + ${comparisonCount} comparisons + ${stockCodes.length} KR + ${usTickerCount} US)`);
