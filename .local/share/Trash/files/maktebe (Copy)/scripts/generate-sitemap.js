const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.VERCEL_URL || 'http://localhost:3000';
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

async function generateSitemap() {
  try {
    const response = await axios.get(`${SITE_URL}/api/books`);
    const books = response.data;

    const sitemap = `
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${SITE_URL}</loc>
          <priority>1.0</priority>
        </url>
        ${books
          .map(book => (
            `
              <url>
                <loc>${SITE_URL}/book/${book._id}</loc>
                <priority>0.8</priority>
              </url>
            `
          ))
          .join('')}
      </urlset>
    `;

    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap);
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap();
