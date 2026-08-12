# Nibble grocery library

Nibble is a small grocery library that can run as a static site by itself. The optional AI features use the included Node server so API keys never ship to the browser.

For the full product history, architecture, decisions, API map, limitations, and future handoff guidance, see [`AI_INSTRUCTIONS.md`](./AI_INSTRUCTIONS.md). Keep that file updated as the project changes.

## Run locally

```bash
npm start
```

Open `http://localhost:4173`—do not double-click `index.html`—so browser microphone permissions and the `/api` routes work. Copy `.env.example` to `.env` and provide `GEMINI_API_KEY` and `GROQ_API_KEY` to enable AI recognition and server-side microphone transcription. `GEMINI_USE_SEARCH=true` lets Gemini use Google Search grounding. Add `SERPAPI_KEY` to use the first Google Images result for each query. The server then falls back to Google Custom Search, Pexels, and Wikimedia. The server loads `.env` locally and reads Render environment variables in production.

The large `Cards / Simple list` toggle switches to a separate text-only master list. Simple-list entries are stored locally under their own `nibble-simple-list` key, so this testing mode does not change the image-based grocery library.

On iPhone, Simple list also has an optional Apple Notes handoff. Set the exact Notes title and Shortcut name once, then tap `+` beside individual items to run the Shortcut with that item’s text. The web app never opens an Apple Notes browser tab; iOS hands the action to Shortcuts.

## Live app

The current Render deployment is available at [nibble-grocery-library.onrender.com](https://nibble-grocery-library.onrender.com/). It is connected to the `main` branch of [parxxy1/nibble-grocery-library](https://github.com/parxxy1/nibble-grocery-library). The app is live with optional AI/image API keys unset; add them in Render’s environment settings when you are ready to enable Gemini recognition, Groq transcription, or Google-style image results.

## Deploy on Render

Render is the simplest fit because one Node web service can serve the frontend and keep the API keys private. Create a Web Service from this folder, use the included `render.yaml`, and add the secret environment variables you want to use in Render. The start command is `npm start`.

## Firebase

Firebase Hosting alone can serve the UI, but it cannot safely store these API keys. Firebase would need a Cloud Function or Cloud Run service for `/api/enrich` and `/api/transcribe`, plus a Hosting rewrite. The included server is therefore ready for Render first; the frontend still works without it using local spelling, OCR, and Wikimedia image search fallbacks.
