import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const DIST_DIR = path.join(ROOT, 'dist');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

await fs.mkdir(DATA_DIR, { recursive: true });

const app = express();
app.use(express.json({ limit: '10mb' }));

// ── Key/value storage ──────────────────────────────────────────────────────
// Single-user, single JSON file per key. Atomic writes via tmp + rename.
const safeKey = (k) => /^[a-zA-Z0-9_\-]+$/.test(k);

app.get('/api/storage/:key', async (req, res) => {
  const { key } = req.params;
  if (!safeKey(key)) return res.status(400).json({ error: 'invalid key' });
  try {
    const data = await fs.readFile(path.join(DATA_DIR, `${key}.json`), 'utf8');
    res.type('application/json').send(data);
  } catch (e) {
    if (e.code === 'ENOENT') return res.json(null);
    console.error('[forge] storage get error:', e);
    res.status(500).json({ error: 'read failed' });
  }
});

app.post('/api/storage/:key', async (req, res) => {
  const { key } = req.params;
  if (!safeKey(key)) return res.status(400).json({ error: 'invalid key' });
  const tmp = path.join(DATA_DIR, `${key}.json.tmp`);
  const final = path.join(DATA_DIR, `${key}.json`);
  try {
    await fs.writeFile(tmp, JSON.stringify(req.body));
    await fs.rename(tmp, final);
    res.json({ ok: true });
  } catch (e) {
    console.error('[forge] storage set error:', e);
    res.status(500).json({ error: 'write failed' });
  }
});

// ── Anthropic proxy ────────────────────────────────────────────────────────
// Thin pass-through: client sends a normal Messages API body, server adds the
// API key header server-side so the key never ships to the frontend.
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY not set on server. Edit .env and restart.',
    });
  }
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });
    const text = await upstream.text();
    res.status(upstream.status).type('application/json').send(text);
  } catch (e) {
    console.error('[forge] chat proxy error:', e);
    res.status(502).json({ error: 'upstream error' });
  }
});

// ── Static frontend (production) ───────────────────────────────────────────
// In dev, Vite serves the frontend on :5173 and proxies /api here.
// In production, `npm run build` creates dist/ and Express serves it.
try {
  await fs.access(DIST_DIR);
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
  console.log('[forge] serving built frontend from dist/');
} catch {
  console.log('[forge] dist/ not found — dev mode (run `npm run dev:client` in another terminal, or use `npm run dev`)');
}

app.listen(PORT, HOST, () => {
  console.log(`[forge] listening on http://${HOST}:${PORT}`);
});
