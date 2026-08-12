import http from 'node:http';
import { readFile, readFileSync } from 'node:fs';
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
const groqModel = process.env.GROQ_TRANSCRIPTION_MODEL || 'whisper-large-v3-turbo';
const maxBodyBytes = 16 * 1024 * 1024;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
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

function extensionForMime(mimeType) {
  if (/webm/i.test(mimeType)) return 'webm';
  if (/mp4|m4a|aac/i.test(mimeType)) return 'm4a';
  if (/ogg/i.test(mimeType)) return 'ogg';
  if (/wav/i.test(mimeType)) return 'wav';
  return 'webm';
}

async function transcribeWithGroq({ audioBase64 = '', mimeType = 'audio/webm' }) {
  if (!process.env.GROQ_API_KEY) throw Object.assign(new Error('Voice transcription is not configured yet'), { statusCode: 503, code: 'missing_groq_key' });
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

async function serveStatic(urlPath, res) {
  const requested = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.resolve(root, `.${requested}`);
  if (!filePath.startsWith(`${root}${path.sep}`)) return json(res, 403, { error: 'Forbidden' });
  try {
    const body = await new Promise((resolve, reject) => readFile(filePath, (error, data) => error ? reject(error) : resolve(data)));
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
      return json(res, 200, { ok: true, groqConfigured: Boolean(process.env.GROQ_API_KEY) });
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
