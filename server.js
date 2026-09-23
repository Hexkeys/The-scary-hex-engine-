const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname)));

app.get('/api/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing search query' });

  try {
    const response = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q), {
      headers: { 'User-Agent': 'Mozilla/5.0 HexSearch/1.0' }
    });
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
