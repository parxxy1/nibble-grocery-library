# Nibble — AI handoff instructions

Last updated: 2026-08-12

This is the working handoff file for the Nibble project. Update it whenever the product behavior, deployment setup, or an important design decision changes.

## Product intent

Nibble is a private, personal, mobile-first grocery list. The user wants to quickly say or type foods they like to buy and keep one large, readable list.

The product was intentionally simplified after testing the earlier grocery-library prototype. The current product is list-only. Do not reintroduce the cards gallery, product images, image picking, reverse image search, prices, calories, categories, notifications, greetings, dashboards, or AI enrichment unless the user explicitly asks for them again.

## Current user experience

- A centered white mobile-style canvas contains the `nibble` wordmark, a settings gear, and a clear-list/archive icon.
- The main content is a large, unbulleted, scrollable text list.
- The bottom floating `+` opens the add panel.
- Typed input accepts one item or a comma/semicolon/newline-separated batch.
- Duplicate entries are ignored case-insensitively.
- Each row has an `x` to remove it.
- Each row has a dark `+` that copies the item name to the clipboard and opens the configured Apple Shortcut.
- The list has no item cards, images, prices, calories, product identification, or remote search.
- The list is blank on a new browser/device. Existing simple-list data remains in local storage when the code changes.

The settings gear opens Apple Notes setup. The archive icon clears the list only after a browser confirmation. These are the only utility controls outside the list and add button.

## Apple Notes integration

The browser cannot enumerate or directly edit the private Apple Notes database. The app uses an iPhone Shortcut and the clipboard.

The user must create the Shortcut once in the iPhone Shortcuts app:

1. Create a shortcut with a name, for example `Nibble Add to Groceries`.
2. Add the **Get Clipboard** action.
3. Add an Apple Notes action that appends the clipboard result to the intended note, for example `Groceries`.
4. Do not add **Ask for Input**. That would create the unwanted second prompt.
5. In Nibble, tap the gear and enter the exact note name and exact Shortcut name.

When the row `+` is tapped, `app.js` calls `navigator.clipboard.writeText(entry)` from the button action, then navigates to:

```text
shortcuts://run-shortcut?name=<encoded shortcut name>
```

The Shortcut reads the already-copied item with **Get Clipboard** and appends it to Notes. No `input` or `text` query parameter is sent, because the clipboard is the deliberate handoff. If clipboard access fails, the app shows an error and does not launch the Shortcut.

The browser may briefly switch to Shortcuts while iOS runs the shortcut. It should not open Notes in another browser tab. Shortcut names are exact-match configuration, and the app cannot verify the shortcut before launching it.

Apple Notes settings are stored in `localStorage` under `nibble-apple-notes` as:

```json
{
  "noteName": "Groceries",
  "shortcutName": "Nibble Add to Groceries"
}
```

## Voice behavior

The user primarily wants voice entry to work from a phone. The voice button therefore follows this order:

1. Reject `file://` and insecure non-local origins with a specific message.
2. Request microphone access with `navigator.mediaDevices.getUserMedia({ audio: true })` from the button interaction. This makes the browser permission prompt explicit.
3. Use `SpeechRecognition` or `webkitSpeechRecognition` when the browser exposes it.
4. If browser speech recognition is unavailable, record with `MediaRecorder` and send the recording to the server’s Groq transcription route.
5. Split the returned text on commas, semicolons, new lines, and bullet characters, then add the resulting entries to the plain list.

Native speech recognition can vary by browser and OS. The interface changes to `Stop & transcribe` while listening and reports permission, speech-service, timeout, and no-speech errors instead of silently claiming that a recording worked.

Voice does not perform spelling correction, product recognition, image search, or any other enrichment. It adds the words to the simple list.

## Files and responsibilities

### `index.html`

Contains only the list page, hidden add/voice panel, Apple Notes setup modal, and toast. There are no card, image, upload, search, edit, trash, or enrichment elements.

### `styles.css`

Contains the sparse list layout based on the user’s mobile reference: white canvas, plain `nibble` wordmark, large black text, small row actions, and a dark floating `+`. It also styles the add panel and the Notes setup modal.

### `app.js`

Contains:

- Local list load/save/render behavior.
- Batch parsing and duplicate prevention.
- Individual removal and confirmed clear-list behavior.
- Browser microphone permission handling.
- Native speech recognition and MediaRecorder/Groq fallback.
- Apple Notes configuration persistence.
- Clipboard copy and `shortcuts://run-shortcut` launch.

There is deliberately no Gemini client call, image library loader, OCR, MobileNet, Google Images adapter, Pexels adapter, spelling-correction service, or product-normalization code.

### `server.mjs`

This is a small dependency-free Node 20 server. It:

- Loads local `.env` values without overriding deployment environment variables.
- Serves the static frontend.
- Exposes `GET /healthz` with the optional Groq configuration status.
- Exposes `POST /api/transcribe` for the MediaRecorder fallback.
- Keeps the Groq key server-side.

There are no Gemini, Google Images, SerpApi, Pexels, image-search, or image-recognition routes.

### `render.yaml`

Configures the Render Node Web Service with `npm install` and `npm start`. It declares only the optional `GROQ_API_KEY` and `GROQ_TRANSCRIPTION_MODEL` settings.

### `.env.example`

Documents the only optional server secret:

```text
GROQ_API_KEY=
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3-turbo
PORT=4173
```

Never commit a real `.env` or put a provider key in browser JavaScript.

## Hosting and deployment

The GitHub repository is:

```text
https://github.com/parxxy1/nibble-grocery-library
```

The production branch is `main`. The Render service is `nibble-grocery-library` on the Free plan, and the live URL is:

```text
https://nibble-grocery-library.onrender.com/
```

Render is connected to GitHub and auto-deploys pushes to `main`.

This remains a Node Web Service rather than a pure Render Static Site because the optional Groq transcription request needs a server-side secret. Typed entry, native browser speech recognition, the list, clipboard handoff, and Apple Shortcut launch do not require a server provider key. If Groq is unset, the server returns a clear 503 for the recorder fallback.

The app is private in intended use, but the live Render URL is reachable by anyone who knows it. There is no authentication or password gate. List data is local to each browser/device and is not stored on Render.

## Data keys

- `nibble-simple-list` — JSON array of list item strings.
- `nibble-apple-notes` — JSON object containing `noteName` and `shortcutName`.

Do not casually clear these keys during testing; they represent the user’s local list and Notes setup.

## Design decisions

- **Plain text list:** speed and readability matter more than product metadata.
- **No AI enrichment:** the user explicitly chose to remove the card/image system and make this a simple list.
- **Clipboard handoff:** simpler and more reliable for the chosen Shortcut than passing text through the URL scheme. The Shortcut owns the Notes action.
- **No Ask for Input:** the app already knows the item and copies it before launching the Shortcut.
- **Local storage:** sufficient for a personal prototype and avoids an account/database system.
- **Small Node server:** protects the optional Groq key while serving the static app.
- **Browser permission request:** microphone use must be explicit and user initiated.
- **No analytics or tracking:** not requested and inappropriate for this private utility.

## Known limitations

- Lists do not sync between browsers or devices.
- Apple Notes integration requires a manually created Shortcut with an exact name.
- Clipboard access depends on browser permission and a user gesture; use Safari/Chrome on iOS over HTTPS or localhost for testing.
- iOS may briefly switch to Shortcuts when launching the URL scheme.
- Native browser speech recognition varies across browsers. The Groq fallback requires `GROQ_API_KEY` and uses provider quota.
- The app does not verify that the configured Shortcut or Apple Note exists.
- There is no authentication on the Render URL.

## Verification checklist

After changing the app, run:

```bash
node --check app.js
node --check server.mjs
curl http://localhost:4173/healthz
```

Smoke-test in a browser at `http://localhost:4173`:

- Confirm there is no Cards view, image picker, upload control, search bar, price, calorie, category, or greeting UI.
- Tap the floating `+`, add a comma-separated batch, and verify rows appear.
- Remove one row and test the clear-list confirmation.
- Open the gear and verify the setup says **Get Clipboard** and explicitly says not to use **Ask for Input**.
- With a test Shortcut configured, tap a row `+` and verify the item is copied before the Shortcut is opened.
- Test microphone permission only when explicitly requested, because it opens a browser permission prompt.

## Working-file rules for future AI agents

Before changing the project, read this file and `README.md`, inspect the current code, and preserve the user’s local data. Keep the product list-only unless the user explicitly changes direction.

After changing the project, update this file’s date and affected sections, run syntax/health checks, smoke-test the changed flow when practical, and clearly state whether a feature is local-only, browser-dependent, or requires the optional Groq key.
