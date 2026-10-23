const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 10000;

// Permit the GitHub Pages frontend to call this API when deployed separately.
// Set ALLOWED_ORIGIN to the exact Pages origin if using a custom domain.
const allowedOrigins = new Set([
  'https://hexkeys.github.io',
  'http://localhost:10000',
  'http://127.0.0.1:10000',
  ...(process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',').map(x => x.trim()) : [])
]);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.sendStatus(204);
  }
  next();
});

app.use(express.static(path.join(__dirname)));

app.get('/api/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing search query' });

  try {
    const response = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q), {
      headers: { 'User-Agent': 'Mozilla/5.0 HexSearch/1.0' }
    });
    if (!response.ok) return res.status(502).json({ error: 'Search provider unavailable' });
    const html = await response.text();
    const results = [];
    const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = re.exec(html)) && results.length < 10) {
      const title = match[2].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").trim();
      let url = match[1];
      if (url.startsWith('//')) url = 'https:' + url;
      results.push({ title, url });
    }
    res.json({ query: q, results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(502).json({ error: 'Search provider unavailable' });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => console.log(`Hex Search listening on ${port}`));
