# Nibble Grocery Library — AI Handoff Instructions

Last updated: 2026-08-12

This is the working handoff document for the Nibble grocery-library project. Update it whenever the product behavior, API integrations, deployment setup, or important design decisions change.

## What this project is

Nibble is a small, personal grocery library. The user wants a simple mobile-first place to save foods and grocery products they like to buy.

The core interaction is:

1. The user says, types, or shows the app a grocery item.
2. The app cleans up the wording and tries to identify the product and store.
3. The app presents image choices, ideally actual product/package photography.
4. The user selects an image, or opens Google Images and pastes an image URL.
5. The item is saved into a gallery/library with its image and source link.

The user specifically prefers product photography over generic food photography. For example, searching for “Lifeway kefir” should find the Lifeway package, not a generic kefir smoothie photo.

This is intended to be a private, personal app used mostly on a phone. It does not need social features, accounts, notifications, dashboards, nutrition tracking, pricing, categories, or a large enterprise architecture.

## Current product behavior

The interface is intentionally small and direct:

- A grocery library/gallery of saved items.
- A Trash view for deleted items.
- Search across saved item names, brands, and stores.
- Edit and delete actions on cards.
- Restore and permanently delete actions in Trash.
- Add by typing.
- Add by voice with the “Say it” button.
- Add from a photo or screenshot with the “Show it” button.
- Non-destructive “Do you mean?” suggestions while entering an item. The app does not automatically replace or search a possibly misspelled text query; the user must choose a suggestion first.
- An image picker that opens after text-based item entry.
- Source links for selected images.
- An “Open Google Images” handoff inside the picker.
- Manual image URL and optional source URL fields.
- A large `Cards / Simple list` toggle for a separate testing mode.
- A blank, text-only master list in Simple list mode. It intentionally has no images, prices, calories, categories, or automatic product enrichment.
- Typed batch entry: commas, semicolons, new lines, and bullet characters become separate list entries.
- Case-insensitive duplicate prevention, per-item remove buttons, and a clear-list action.
- A separate “Say a list” microphone action that adds a spoken batch to the simple list using native browser speech recognition or the Groq recording fallback.
- Optional Apple Notes handoff in Simple list mode. The user can save an exact Apple Note title and Shortcut name once; each item then has a `+` action that runs `shortcuts://run-shortcut` with that item as text input. This is stored separately under `nibble-apple-notes`.

Prices and calories were explicitly removed. Do not reintroduce them unless the user asks for them.

Do not add greetings, dates, notifications, help panels, categories, quick-capture icons, favorites, or other dashboard-style features unless specifically requested. The user dislikes “AI-generated” product UI and prefers a focused utility.

## Files and responsibilities

### `index.html`

The page structure and accessible labels. It contains:

- Header and Library/Trash navigation.
- Search input.
- Add panel with Say it, Show it, and text input.
- Suggestions list.
- Gallery and empty state.
- Edit modal.
- Image-picker bottom sheet/modal.
- Toast messages.

### `styles.css`

All visual styling. The app is desktop-compatible but should be designed mobile-first. At narrow widths, the image picker becomes a bottom sheet and the gallery becomes a two-column grid.

Keep the visual language quiet and practical: pale background, dark green text, coral accent, compact typography, and restrained controls.

### `app.js`

The client-side application logic:

- Local storage persistence using the `nibble-state` key.
- Migration/normalization of older saved data.
- Gallery, search, sorting, Trash, edit, restore, and delete behavior.
- Typing suggestions and spelling correction.
- Store/product parsing such as `trader joes tiki missala` → `tikka masala from Trader Joe’s`.
- Backend calls through `requestBackend()`.
- Browser speech recognition when available.
- MediaRecorder + `/api/transcribe` fallback when native speech recognition is not available.
- Local OCR/classification fallback using Tesseract.js, TensorFlow.js, and MobileNet.
- Image result picker and manual Google Images URL import.
- Simple list persistence, batch splitting, deduplication, rendering, and voice-list entry.
- Apple Notes setup persistence and per-item Shortcut URL handoff.

Important client API endpoints:

- `POST /api/enrich` — Gemini product recognition and normalization.
- `POST /api/image-search` — image candidates from the server-side providers.
- `POST /api/transcribe` — Groq speech-to-text.
- `GET /healthz` — provider configuration status.

### `server.mjs`

A dependency-free Node 20 webserver. It serves the static app and keeps API keys on the server.

It currently:

- Loads a local `.env` file when present.
- Reads Render environment variables in production.
- Serves `index.html`, `app.js`, and `styles.css`.
- Limits request bodies to 16 MB.
- Calls Gemini’s `generateContent` endpoint for text/image understanding.
- Optionally enables Gemini Google Search grounding with `GEMINI_USE_SEARCH=true`.
- Sends microphone recordings to Groq Whisper.
- Searches images in this effective order:
  1. SerpApi Google Images, if `SERPAPI_KEY` exists.
  2. Google Custom Search image results, if both Google Custom Search keys exist.
  3. Pexels, if `PEXELS_API_KEY` exists.
  4. Wikimedia Commons.
- Returns up to eight image candidates to the client.

### `package.json`

There are intentionally no runtime dependencies. The server uses built-in Node modules and the native `fetch`, `FormData`, and `Blob` APIs available in modern Node.

Commands:

```bash
npm start
npm run dev
```

The app runs at `http://localhost:4173` by default.

### `render.yaml`

Render Blueprint configuration for one Node Web Service. It uses:

- Build command: `npm install`
- Start command: `npm start`
- Node runtime.
- Free plan by default.

### `.env.example`

Template for local configuration. Never commit a real `.env` file.

### `README.md`

Short setup and deployment instructions. This file is for quick starts; this document is the deeper handoff context.

## Environment variables

The minimum useful configuration is:

```text
GEMINI_API_KEY=...
SERPAPI_KEY=...
GEMINI_USE_SEARCH=true
```

Optional variables:

```text
GEMINI_MODEL=gemini-2.5-flash-lite
GROQ_API_KEY=...
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3-turbo
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
PEXELS_API_KEY=...
PORT=4173
```

### What each key is for

- `GEMINI_API_KEY`: product/image understanding, spelling cleanup, store/product separation, and normalized search queries.
- `SERPAPI_KEY`: Google Images result retrieval. This is the preferred provider for actual product/package images.
- `GEMINI_USE_SEARCH`: enables Gemini’s Google Search grounding when set to anything other than `false`.
- `GROQ_API_KEY`: optional microphone transcription fallback. It is not needed for typed entry, image search, or photo recognition.
- `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID`: legacy/optional Google Custom Search image path. Do not make the app depend on this because Google has closed the API to new customers and announced a future discontinuation.
- `PEXELS_API_KEY`: optional generic photography fallback. It is less useful for packaged grocery products.

Keys must remain in Render’s environment settings or a local `.env` file. Never put them in `index.html`, `app.js`, CSS, local storage, or a public repository.

## Image-selection behavior

For text entry, the picker should always open. This is intentional even if all automatic providers return zero results.

The picker has three paths:

1. Choose one of the returned image cards.
2. Open the real Google Images search for the normalized query, copy an image URL, paste it into the manual field, and optionally paste the source page URL.
3. Skip the photo and add the item anyway.

Do not attempt to silently control, scrape, or inspect a Google Images tab from the deployed webpage. Browser same-origin rules and Google’s policies make that fragile and unsafe. The supported workaround is an explicit Google Images link plus manual URL handoff. A future native app or browser extension could support more direct interaction, but that would be a separate product surface.

When an image is selected, save:

- `image`: the image URL.
- `sourceUrl`: the page/source URL when available.
- `imageProvider`: the provider name when available.

The saved image and source link should remain clickable.

## Recognition behavior

### Text

Typing should show suggestions without changing the input. If a likely correction exists, label it “Do you mean?” and wait for the user to choose it. Pressing Add on an unresolved likely misspelling must not search or save the item. Once the user chooses a suggestion, the selected value can be sent through the AI/image flow.

Known grocery vocabulary should include specific foods that are easy to miscorrect, such as `focaccia`, `kefir`, and `smoothie`.

After the user chooses a valid suggestion—or enters text that does not appear misspelled—text can go through Gemini when configured. Gemini should return a compact JSON-like result with:

- `name`
- `store`
- `brand`
- `searchQuery`
- `confidence`

The client falls back to local correction/parsing when Gemini is unavailable.

### Photos and screenshots

The client first sends the rasterized image to Gemini when configured. If Gemini is unavailable or fails, the client uses local OCR and MobileNet classification. It should never silently label every failed upload as a successful product identification; preserve a clear fallback label and let the user edit it.

### Voice

The app starts native `SpeechRecognition`/`webkitSpeechRecognition` directly from the “Say it” button when available, which preserves the browser’s user-gesture requirement and lets the browser ask for microphone access itself. If native speech recognition is unavailable, it explicitly requests permission, records with `MediaRecorder`, and sends the recording to Groq through the server. Microphone use must happen from `http://localhost:4173`, `http://127.0.0.1:4173`, HTTPS, or another browser-trusted origin; opening `index.html` directly as `file://` cannot use the app’s server routes and is rejected with a specific setup message.

Simple list mode uses the same permission-aware voice flow through its “Say a list” button. It expects the spoken items to be separated by commas or clear pauses; the resulting transcript is split into separate bullets instead of going through image search.

### Apple Notes handoff

The browser cannot enumerate or directly edit Apple Notes. On iPhone, the Simple list setup stores the user’s chosen note title and the name of a Shortcut that appends incoming text to that note. Each `+` button runs `shortcuts://run-shortcut?name=...&input=text&text=...`; it does not open an Apple Notes web tab. The user must create the matching Shortcut once in the iPhone Shortcuts app, and iOS may briefly switch to Shortcuts to run it.

If no Groq key is configured, typed entry and photo entry should continue to work. Show a useful error for voice rather than pretending the microphone worked.

## Hosting decision

Use a Render Node Web Service for the current project.

Reason:

- It serves the static frontend and API routes from one service.
- Render environment variables stay server-side.
- The existing `server.mjs` and `render.yaml` are already shaped for it.
- No build framework or dependency installation is required.

A Render Static Site can host the frontend only, but static-site environment variables are exposed at build time and can be embedded into browser JavaScript. Do not put Gemini, Groq, or SerpApi secrets into a static bundle.

Firebase Hosting could work only with Cloud Functions or Cloud Run added for the API routes. That is a possible future migration, not the simplest current deployment.

The deployed Render URL is still publicly reachable unless an access-control layer is added. “Private app” currently means personal use and private keys, not network isolation. If the user wants actual private access, add a small password gate or another authentication layer before treating the app as private.

### Current deployment

- GitHub repository: `https://github.com/parxxy1/nibble-grocery-library`
- Branch: `main`
- Initial deployed commit: `fc64cc0`
- Render service: `nibble-grocery-library`
- Live URL: `https://nibble-grocery-library.onrender.com/`
- Render service type: Node Web Service on the Free plan, managed by `render.yaml`.
- Current Render health check: `/healthz` returns HTTP 200.
- Optional provider keys are currently unset in Render, so `geminiConfigured`, `groqConfigured`, `serpApiConfigured`, `googleImagesConfigured`, and `pexelsConfigured` are all `false`. The local/fallback UI still works.

Render is connected to the GitHub repository and can auto-deploy future pushes to `main`. Keep secrets only in Render environment settings; never add `.env` to Git.

## Data and privacy

The library currently lives in browser `localStorage`, not a server database. This means:

- Items are local to one browser/device.
- Clearing browser data can remove the library.
- The Render server does not know the user’s saved library.
- A future sync feature would need authentication and a database.

Uploaded images may be sent to Gemini when the Gemini key is configured. Be explicit about this if privacy becomes a concern. Do not add analytics or tracking without user approval.

## Current design decisions and why

- **Static frontend plus small Node server:** keeps the UI simple while protecting API keys.
- **Gemini Flash-Lite:** one inexpensive multimodal model can clean text and inspect product photos.
- **Groq Whisper:** isolates speech-to-text so the app still works where browser speech recognition is missing.
- **SerpApi:** chosen for Google Images-style product results because stock-photo providers do not reliably carry package photography.
- **Wikimedia fallback:** free and keyless fallback for development and no-key use.
- **Explicit image picker:** the user wants to choose the exact package photo instead of trusting an automatic first result.
- **Manual Google Images handoff:** lets the user use Google directly without attempting cross-origin browser automation.
- **Local storage:** enough for a personal prototype and avoids adding a database/auth system prematurely.
- **No price/calorie fields:** explicitly removed at the user’s request.
- **Separate Simple list mode:** supports quickly dictating a plain master list without forcing every entry through product recognition or image selection.
- **Apple Notes via Shortcuts:** uses Apple’s supported URL scheme for a lightweight phone handoff instead of pretending a web app can access the private Notes database.
- **Minimal UI:** avoids unsolicited categories, notifications, greetings, dashboards, and other features.

## Known limitations

- No server-side database or cross-device sync.
- No authentication/password gate yet.
- No API usage budget enforcement beyond provider limits.
- No result caching, so repeated searches can consume provider quotas.
- SerpApi results depend on the provider’s current Google Images response format.
- Image URLs from third parties can expire, block hotlinking, or disappear.
- Some uploaded images may still require manual editing.
- Browser voice support varies by browser; Groq requires its API key.
- Some browsers expose a microphone permission but do not return Web Speech results; the UI now reports a timeout or browser speech-service error instead of leaving the button active indefinitely.
- When the recorder fallback is active, the voice button changes to “Stop & transcribe” so the user knows how to finish the recording.
- Simple-list voice splitting is intentionally lightweight; it does not infer item boundaries from general prose or generate SVG symbols.
- Apple Notes integration depends on the user-created Shortcut name and target note; a browser cannot discover Notes or create the Shortcut automatically.
- The current local browser may contain test items in its `nibble-state` local storage. Do not delete user data casually.

## Verification expectations

After changes, run:

```bash
node --check app.js
node --check server.mjs
curl http://localhost:4173/healthz
```

For UI changes, test in the local browser at `http://localhost:4173`:

- Add a correctly spelled text item.
- Add a misspelled item such as `trader joes tiki missala`.
- Confirm the image picker always appears.
- Confirm the no-results state still offers Google Images and manual URL paste.
- Select an image and confirm the card/source link is saved.
- Test edit, delete, restore, and permanent delete.
- Avoid triggering microphone permission prompts during automated testing unless the user explicitly wants to test them.

## Working-file rules for future AI agents

Before changing the app:

1. Read this file and `README.md`.
2. Inspect the current files instead of assuming earlier behavior still exists.
3. Preserve user changes and existing local data.
4. Keep the UI focused on the grocery-library use case.
5. Keep all secrets server-side.

After changing the app:

1. Update this document’s “Last updated” date.
2. Update the relevant behavior, file, API, deployment, or limitation sections.
3. Record any new environment variable or route.
4. Run the syntax and health checks above.
5. Smoke-test the changed user flow in the local browser when practical.

When handing off, state clearly whether a feature is implemented, requires an API key, uses a fallback, or is only a future idea.
