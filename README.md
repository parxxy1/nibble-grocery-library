# Nibble

Nibble is a small, mobile-first grocery list for one person. It intentionally uses a plain text list: no cards, product photos, prices, calories, categories, image recognition, or search providers.

## What it does

- Add one or several grocery items by typing.
- Add a spoken list from the microphone.
- Keep the list in the browser on the current device.
- Remove individual items or clear the whole list.
- Optionally copy an item to the clipboard and open an Apple Shortcut that appends it to Apple Notes.

## Run locally

```bash
npm start
```

Then open [http://localhost:4173](http://localhost:4173). Do not open `index.html` directly as a `file://` URL; the microphone and server route need localhost or HTTPS.

## Voice setup

The app first asks the browser for microphone permission and uses native browser speech recognition when available. If the browser does not provide speech recognition, it records audio and sends it to the optional server-side Groq Whisper fallback.

To enable the fallback locally, copy `.env.example` to `.env` and set:

```text
GROQ_API_KEY=your_key_here
```

The key stays in the Node server and is never placed in browser code. Typed list entry works without any API key.

## Apple Notes Shortcut setup

The browser cannot directly edit Apple Notes. The supported handoff is clipboard plus Shortcut:

1. On the iPhone, open **Shortcuts** and create a shortcut, for example `Nibble Add to Groceries`.
2. Add **Get Clipboard**.
3. Add the Apple Notes action that appends the clipboard result to the exact note you want, for example `Groceries`.
4. Do not add **Ask for Input**. The item is already in the clipboard.
5. In Nibble, tap the gear, enter the exact Apple Note name and exact Shortcut name, and save.
6. Tap the dark `+` beside an item. Nibble copies that item name, opens the Shortcut, and the Shortcut appends the clipboard to Notes.

The phone may briefly switch to Shortcuts while it runs. It should not open a Notes tab or ask you to type the item again.

## Deployment

This project is a Node Web Service rather than a pure static site because the optional Groq transcription request needs a server-side secret. Render can run it with the included `render.yaml`:

- Build command: `npm install`
- Start command: `npm start`
- Optional environment variable: `GROQ_API_KEY`

The current GitHub repository is `parxxy1/nibble-grocery-library`, and the live Render app is [nibble-grocery-library.onrender.com](https://nibble-grocery-library.onrender.com/).

The app itself is local-first. List data is stored under `nibble-simple-list` in browser `localStorage`; Apple Notes settings are stored under `nibble-apple-notes`. The server does not store the grocery list.

## Files

- `index.html` — the minimal list, add panel, and Apple Notes setup modal.
- `styles.css` — the sparse mobile list layout.
- `app.js` — list persistence, microphone handling, clipboard handoff, and Shortcut launch.
- `server.mjs` — static file server, `/healthz`, and optional `/api/transcribe`.
- `render.yaml` — Render Web Service configuration.
- `AI_INSTRUCTIONS.md` — the detailed working handoff for future changes.
