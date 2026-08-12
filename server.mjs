import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

function loadLocalEnv() {
  try {
    const lines = readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/);
    lines.forEach((line) => {
      const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]] !== undefined) return;
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    });
  } catch { /* environment variables are enough in deployed environments */ }
}

loadLocalEnv();
const port = Number(process.env.PORT || 4173);
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const groqModel = process.env.GROQ_TRANSCRIPTION_MODEL || 'whisper-large-v3-turbo';
const geminiUseSearch = process.env.GEMINI_USE_SEARCH !== 'false';
const maxBodyBytes = 16 * 1024 * 1024;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        reject(Object.assign(new Error('Request too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function parseJsonBody(body) {
  try { return JSON.parse(body || '{}'); } catch { return null; }
}

function cleanText(value, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, 240) : fallback;
}

function normalizeEnrichment(value, originalText = '') {
  const name = cleanText(value?.name, cleanText(originalText, 'Grocery item'));
  const store = cleanText(value?.store);
  const brand = cleanText(value?.brand);
  const searchQuery = cleanText(value?.searchQuery, store ? `${name} from ${store}` : name);
  const confidence = Number(value?.confidence);
  return {
    name,
    store,
    brand,
    searchQuery,
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : null,
    source: 'gemini'
  };
}

function extractGeminiJson(data) {
  const text = (data?.candidates || [])
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part?.text || '')
    .join('')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  if (!text) throw new Error('Gemini returned no text');
  return JSON.parse(text);
}

async function enrichWithGemini({ text = '', imageDataUrl = '' }) {
  if (!process.env.GEMINI_API_KEY) throw Object.assign(new Error('Gemini is not configured'), { statusCode: 503, code: 'missing_gemini_key' });
  const parts = [{
    text: [
      'You normalize grocery items for a personal grocery library.',
      'Correct misspellings and identify the product from the photo or words.',
      'If a store is mentioned, separate it from the product name.',
      'Do not invent a brand or store. Leave those fields blank when uncertain.',
      'Return only JSON with these fields: name, store, brand, searchQuery, confidence.',
      'name should be a short human-friendly item name. searchQuery should be useful for finding a representative product image.',
      text ? `User input: ${text}` : 'The user provided an image without text.'
    ].join('\n')
  }];
  if (typeof imageDataUrl === 'string' && imageDataUrl.startsWith('data:image/')) {
    const match = imageDataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
    if (match) parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
  }
  const request = {
    contents: [{ role: 'user', parts }],
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
  };
  if (geminiUseSearch) request.tools = [{ google_search: {} }];
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw Object.assign(new Error(`Gemini request failed: ${response.status}`), { statusCode: 502, providerDetail: errorText.slice(0, 500) });
  }
  return normalizeEnrichment(extractGeminiJson(await response.json()), text);
}

function extensionForMime(mimeType) {
  if (/webm/i.test(mimeType)) return 'webm';
  if (/mp4|m4a|aac/i.test(mimeType)) return 'm4a';
  if (/ogg/i.test(mimeType)) return 'ogg';
  if (/wav/i.test(mimeType)) return 'wav';
  return 'webm';
}

async function transcribeWithGroq({ audioBase64 = '', mimeType = 'audio/webm' }) {
  if (!process.env.GROQ_API_KEY) throw Object.assign(new Error('Groq is not configured'), { statusCode: 503, code: 'missing_groq_key' });
  const audio = Buffer.from(audioBase64, 'base64');
  if (!audio.length || audio.length > 12 * 1024 * 1024) throw Object.assign(new Error('Audio is missing or too large'), { statusCode: 413 });
  const form = new FormData();
  form.append('file', new Blob([audio], { type: mimeType }), `nibble-recording.${extensionForMime(mimeType)}`);
  form.append('model', groqModel);
  form.append('response_format', 'json');
  form.append('language', 'en');
  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw Object.assign(new Error(`Groq request failed: ${response.status}`), { statusCode: 502, providerDetail: errorText.slice(0, 500) });
  }
  const result = await response.json();
  return { text: cleanText(result?.text), source: 'groq' };
}

function imageSearchTerms(query) {
  return cleanText(query)
    .replace(/\b(from|at|near|in)\s+.+$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function searchGoogleImages(query) {
  if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) return null;
  const params = new URLSearchParams({
    key: process.env.GOOGLE_SEARCH_API_KEY,
    cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
    q: cleanText(query),
    searchType: 'image',
    num: '10',
    safe: 'active',
    imgType: 'photo'
  });
  try {
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
    if (!response.ok) return null;
    const data = await response.json();
    return (data.items || [])
      .filter((item) => item.link && item.image?.contextLink)
      .slice(0, 8)
      .map((item) => ({ url: item.link, sourceUrl: item.image.contextLink, title: item.title, provider: 'Google Images' }));
  } catch { return null; }
}

async function searchGoogleImagesViaSerpApi(query) {
  if (!process.env.SERPAPI_KEY) return null;
  const params = new URLSearchParams({
    engine: 'google_images',
    api_key: process.env.SERPAPI_KEY,
    q: cleanText(query),
    google_domain: 'google.com',
    gl: 'us',
    hl: 'en',
    safe: 'active'
  });
  try {
    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!response.ok) return null;
    const data = await response.json();
    return (data.images_results || [])
      .filter((result) => result.original || result.thumbnail)
      .slice(0, 8)
      .map((result) => ({
        url: result.original || result.thumbnail,
        sourceUrl: result.link || 'https://images.google.com',
        title: result.title || result.source || 'Google Images result',
        provider: 'Google Images via SerpApi'
      }));
  } catch { return null; }
}

async function searchPexels(query) {
  if (!process.env.PEXELS_API_KEY) return null;
  const params = new URLSearchParams({ query: imageSearchTerms(query), per_page: '8', orientation: 'square' });
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?${params}`, { headers: { authorization: process.env.PEXELS_API_KEY } });
    if (!response.ok) return null;
    const data = await response.json();
    return (data.photos || [])
      .filter((photo) => photo.src?.large2x || photo.src?.large)
      .slice(0, 8)
      .map((photo) => ({ url: photo.src.large2x || photo.src.large, sourceUrl: photo.url || 'https://www.pexels.com', title: photo.alt || 'Pexels photo', provider: 'Pexels' }));
  } catch { return null; }
}

async function searchWikimedia(query) {
  const searchTerm = imageSearchTerms(query);
  if (!searchTerm) return null;
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url%7Cmime&iiurlwidth=900&format=json&origin=*`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) return null;
    const data = await response.json();
    const pages = Object.values(data.query?.pages || {}).filter((page) => page.imageinfo?.[0]?.mime?.startsWith('image/'));
    if (!pages.length) return null;
    const terms = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
    pages.sort((a, b) => {
      const score = (page) => {
        const title = (page.title || '').toLowerCase();
        return terms.reduce((total, term) => total + (title.includes(term) ? 1 : 0), 0) + (title.includes(searchTerm.toLowerCase()) ? 3 : 0);
      };
      return score(b) - score(a);
    });
    return pages.slice(0, 8).map((page) => {
      const info = page.imageinfo[0];
      return { url: info.thumburl || info.url, sourceUrl: info.descriptionurl || '', title: page.title?.replace(/^File:/i, '') || 'Wikimedia Commons image', provider: 'Wikimedia Commons' };
    });
  } catch { return null; }
}

async function searchImage(query) {
  const providerResults = [await searchGoogleImages(query), await searchPexels(query), await searchWikimedia(query)];
  const results = [];
  const seenUrls = new Set();
  providerResults.flatMap((provider) => provider || []).forEach((result) => {
    if (!result?.url || seenUrls.has(result.url)) return;
    seenUrls.add(result.url);
    results.push(result);
  });
  return results.slice(0, 8);
}

async function serveStatic(urlPath, res) {
  const requested = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.resolve(root, `.${requested}`);
  if (!filePath.startsWith(`${root}${path.sep}`)) return json(res, 403, { error: 'Forbidden' });
  try {
    const body = await readFile(filePath);
    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'content-type': contentType, 'cache-control': 'no-cache' });
    res.end(body);
  } catch (error) {
    if (error.code === 'ENOENT') return json(res, 404, { error: 'Not found' });
    json(res, 500, { error: 'Could not read file' });
  }
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'GET' && requestUrl.pathname === '/healthz') {
      return json(res, 200, {
        ok: true,
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
        groqConfigured: Boolean(process.env.GROQ_API_KEY),
        serpApiConfigured: Boolean(process.env.SERPAPI_KEY),
        googleImagesConfigured: Boolean(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID),
        pexelsConfigured: Boolean(process.env.PEXELS_API_KEY)
      });
    }
    if (req.method === 'POST' && requestUrl.pathname === '/api/enrich') {
      const body = parseJsonBody(await readRequestBody(req));
      const text = cleanText(body?.text);
      const imageDataUrl = typeof body?.imageDataUrl === 'string' ? body.imageDataUrl : '';
      if (!body || (!text && !imageDataUrl)) return json(res, 400, { error: 'Text or an image is required' });
      return json(res, 200, await enrichWithGemini({ text, imageDataUrl }));
    }
    if (req.method === 'POST' && requestUrl.pathname === '/api/image-search') {
      const body = parseJsonBody(await readRequestBody(req));
      const query = cleanText(body?.query);
      if (!query) return json(res, 400, { error: 'A search query is required' });
      const serpResults = await searchGoogleImagesViaSerpApi(query);
      const result = serpResults?.length ? serpResults : await searchImage(query);
      return result.length ? json(res, 200, { results: result }) : json(res, 404, { error: 'No image found' });
    }
    if (req.method === 'POST' && requestUrl.pathname === '/api/transcribe') {
      const body = parseJsonBody(await readRequestBody(req));
      if (!body || typeof body.audioBase64 !== 'string') return json(res, 400, { error: 'Audio is required' });
      return json(res, 200, await transcribeWithGroq({ audioBase64: body.audioBase64, mimeType: cleanText(body.mimeType, 'audio/webm') }));
    }
    if (req.method === 'GET') return serveStatic(requestUrl.pathname, res);
    return json(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    const status = Number(error.statusCode) || 500;
    if (status >= 500) console.error(error.message);
    return json(res, status, { error: status === 500 ? 'The server could not complete that request.' : error.message, code: error.code || 'request_failed' });
  }
});

server.listen(port, () => console.log(`Nibble is running at http://localhost:${port}`));
