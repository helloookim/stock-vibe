import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read financial data index to get all stock codes
const indexPath = path.join(__dirname, 'public', 'data', 'financial_data_index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

const baseUrl = 'https://kstockview.com';
const today = new Date().toISOString().split('T')[0];

// Collect all stock codes from all chunks
const stockCodes = new Set();

// Load each chunk and collect stock codes
for (let i = 0; i < index.chunks.length; i++) {
  const chunkPath = path.join(__dirname, 'public', 'data', `financial_data_0${i}.json`);
  const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
  Object.keys(chunkData).forEach(code => stockCodes.add(code));
}

// Also check separate financial data
const separateIndexPath = path.join(__dirname, 'public', 'data', 'financial_data_separate_index.json');
if (fs.existsSync(separateIndexPath)) {
  const separateIndex = JSON.parse(fs.readFileSync(separateIndexPath, 'utf-8'));
  for (let i = 0; i < separateIndex.chunks.length; i++) {
    const chunkPath = path.join(__dirname, 'public', 'data', `financial_data_separate_0${i}.json`);
    const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
    Object.keys(chunkData).forEach(code => stockCodes.add(code));
  }
}

console.log(`Generating sitemap for ${stockCodes.size} stocks...`);

// Blog pages
const blogPages = [
  'samsung-electronics',
  'sk-hynix',
  'hyundai-motor',
  'lg-energy-solution',
  'samsung-biologics',
  'hanwha-aerospace'
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

// Add blog pages
blogPages.forEach(slug => {
  sitemap += `  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`});

sitemap += `  <!-- Stock Pages -->
`;

// Add all stock pages (sorted for consistency)
const sortedCodes = Array.from(stockCodes).sort();
sortedCodes.forEach(code => {
  sitemap += `  <url>
    <loc>${baseUrl}/${code}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
});

sitemap += '</urlset>';

// Write sitemap to public folder
const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap);

console.log(`✅ Sitemap generated successfully!`);
console.log(`📍 Location: ${sitemapPath}`);
console.log(`📊 Total URLs: ${sortedCodes.length + 4 + blogPages.length} (1 homepage + 3 static pages + ${blogPages.length} blog pages + ${sortedCodes.length} stocks)`);
