const ICON = {
  search: '<svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 4.5 4.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><rect x="8.5" y="3" width="7" height="12" rx="3.5"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>',
  camera: '<svg viewBox="0 0 24 24"><path d="M4 7h3l1.4-2h7.2L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.3"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="m4 16-.8 4.8L8 20l10.8-10.8a2.2 2.2 0 0 0-3.1-3.1L4.9 16.9Z"/><path d="m14.5 7.5 2 2"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  restore: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 5v5h5"/><path d="M12 8v4l2.5 1.5"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg>'
};

const imageUrls = {
  muffin: 'https://images.unsplash.com/photo-1558303057-9d7e6c5a91ce?auto=format&fit=crop&w=700&q=85',
  yogurt: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=85',
  avocado: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=700&q=85',
  eggs: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=700&q=85',
  salmon: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=700&q=85',
  berries: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=700&q=85',
  chips: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=700&q=85',
  bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=85',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=85',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=85',
  pasta: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=85'
};

const seedItems = [
  { id: 'seed-1', name: 'Blueberry muffins', brand: 'WinCo bakery', store: 'WinCo', image: imageUrls.muffin, bg: '#f0d7b5', letter: 'B', updatedAt: 12 },
  { id: 'seed-2', name: 'Greek yogurt', brand: 'Fage Total 5%', store: 'Costco', image: imageUrls.yogurt, bg: '#e9e3ce', letter: 'G', updatedAt: 11 },
  { id: 'seed-3', name: 'Hass avocados', brand: 'Organic, 4 pack', store: 'Trader Joe’s', image: imageUrls.avocado, bg: '#d5e5c3', letter: 'A', updatedAt: 10 },
  { id: 'seed-4', name: 'Free-range eggs', brand: 'Vital Farms, 12 ct', store: 'Whole Foods', image: imageUrls.eggs, bg: '#efe7d5', letter: 'E', updatedAt: 9 },
  { id: 'seed-5', name: 'Atlantic salmon', brand: 'Fresh, skin-on fillet', store: 'Whole Foods', image: imageUrls.salmon, bg: '#f1c3a9', letter: 'S', updatedAt: 8 },
  { id: 'seed-6', name: 'Raspberries', brand: 'Organic, 6 oz', store: 'Trader Joe’s', image: imageUrls.berries, bg: '#edc8c5', letter: 'R', updatedAt: 7 },
  { id: 'seed-7', name: 'Kettle cooked chips', brand: 'Sea salt, 9 oz', store: 'WinCo', image: imageUrls.chips, bg: '#f3d68f', letter: 'K', updatedAt: 6 },
  { id: 'seed-8', name: 'Sourdough bread', brand: 'San Francisco style', store: 'Safeway', image: imageUrls.bread, bg: '#d8b993', letter: 'S', updatedAt: 5 }
];

let items = [];
let trash = [];
let currentView = 'library';
let sortMode = 'recent';
let editingId = null;
let voiceRecognition = null;
let isListening = false;
let toastTimer = null;
let visionLibrariesPromise = null;
let imageClassifier = null;
let microphoneRequest = null;
let voiceRecorder = null;
let voiceChunks = [];
let voiceResultTimer = null;
let imagePickerResolver = null;
let imagePickerResults = [];
let imagePickerQuery = '';
let simpleModeEnabled = false;
let simpleItems = [];
let appleNotesConfig = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('nibble-state') || 'null');
    if (saved && Array.isArray(saved.items)) return { items: saved.items, trash: Array.isArray(saved.trash) ? saved.trash : [] };
    const oldItems = JSON.parse(localStorage.getItem('nibble-items') || 'null');
    if (Array.isArray(oldItems)) return { items: oldItems.map(normalizeItem), trash: [] };
  } catch { /* use the starter library */ }
  return { items: seedItems, trash: [] };
}

function normalizeItem(item) {
  const { price, calories, category, favorite, ...cleanItem } = item;
  return {
    ...cleanItem,
    id: item.id || `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: item.name || 'Grocery item',
    brand: item.brand || item.store || 'Best guess',
    store: item.store || '',
    updatedAt: item.updatedAt || item.added || Date.now()
  };
}

function saveState() {
  try { localStorage.setItem('nibble-state', JSON.stringify({ items, trash })); } catch { /* a large uploaded image should not break the app */ }
}

function loadSimpleList() {
  try {
    const saved = JSON.parse(localStorage.getItem('nibble-simple-list') || '[]');
    return Array.isArray(saved) ? saved.map((entry) => String(entry).trim()).filter(Boolean) : [];
  } catch { return []; }
}

function saveSimpleList() {
  try { localStorage.setItem('nibble-simple-list', JSON.stringify(simpleItems)); } catch { /* keep the list usable if storage is unavailable */ }
}

function loadAppleNotesConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem('nibble-apple-notes') || 'null');
    if (!saved || typeof saved !== 'object') return null;
    const noteName = String(saved.noteName || '').trim();
    const shortcutName = String(saved.shortcutName || '').trim();
    return noteName && shortcutName ? { noteName, shortcutName } : null;
  } catch { return null; }
}

function saveAppleNotesConfig() {
  try {
    if (appleNotesConfig) localStorage.setItem('nibble-apple-notes', JSON.stringify(appleNotesConfig));
    else localStorage.removeItem('nibble-apple-notes');
  } catch { /* keep the Notes handoff usable if storage is unavailable */ }
}

function renderIcons() {
  $$('[data-icon]').forEach((element) => { element.innerHTML = ICON[element.dataset.icon] || ''; });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function splitSimpleEntries(value) {
  return String(value || '')
    .replace(/[\u2022•]/g, ',')
    .split(/[,;\n]+/)
    .map((entry) => entry.replace(/^\s*(?:and|also)\s+/i, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function renderSimpleList() {
  const list = $('#simpleList');
  const empty = $('#simpleListEmpty');
  if (!list || !empty) return;
  list.innerHTML = simpleItems.map((entry, index) => `<li><span>${escapeHtml(entry)}</span><div class="simple-item-actions"><button class="simple-note-add" type="button" data-note-index="${index}" aria-label="Add ${escapeHtml(entry)} to Apple Notes">+</button><button class="simple-remove" type="button" data-simple-index="${index}" aria-label="Remove ${escapeHtml(entry)}">×</button></div></li>`).join('');
  empty.hidden = simpleItems.length > 0;
  $('#simpleListCount').textContent = `${simpleItems.length} ${simpleItems.length === 1 ? 'item' : 'items'}`;
}

function renderAppleNotesSetup() {
  const state = $('#appleNotesState');
  const description = $('#appleNotesDescription');
  const removeButton = $('#appleNotesRemoveButton');
  const setupButton = $('#appleNotesSetupButton');
  if (!state || !description || !removeButton || !setupButton) return;
  const connected = Boolean(appleNotesConfig);
  state.textContent = connected ? `Note: ${appleNotesConfig.noteName}` : 'Not set up';
  state.classList.toggle('connected', connected);
  removeButton.hidden = !connected;
  description.textContent = connected
    ? `Tap + beside an item to send it to “${appleNotesConfig.noteName}” through Shortcuts.`
    : 'Set up a Shortcut once, then tap + beside any item to send it to your chosen note.';
  setupButton.textContent = connected ? 'Change' : 'Set up';
}

function openAppleNotesSetup() {
  $('#appleNotesName').value = appleNotesConfig?.noteName || '';
  $('#appleNotesShortcut').value = appleNotesConfig?.shortcutName || '';
  $('#appleNotesSetup').hidden = false;
  setTimeout(() => $('#appleNotesName').focus(), 30);
}

function closeAppleNotesSetup() {
  $('#appleNotesSetup').hidden = true;
}

function addSimpleItemToAppleNotes(index) {
  const entry = simpleItems[index];
  if (!entry) return;
  if (!appleNotesConfig) {
    openAppleNotesSetup();
    $('#simpleListStatus').textContent = 'Choose your note and save the setup, then tap + again.';
    return;
  }
  const shortcutUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(appleNotesConfig.shortcutName)}&input=text&text=${encodeURIComponent(entry)}`;
  $('#simpleListStatus').textContent = `Sending “${entry}” to “${appleNotesConfig.noteName}”…`;
  showToast(`Sending ${entry} to Apple Notes`);
  window.location.href = shortcutUrl;
}

function addSimpleListEntries(value) {
  const entries = splitSimpleEntries(value);
  if (!entries.length) {
    $('#simpleListStatus').textContent = 'Say or type at least one item.';
    $('#simpleListStatus').classList.add('error');
    return;
  }
  const existing = new Set(simpleItems.map((entry) => entry.toLowerCase()));
  const newEntries = entries.filter((entry) => {
    const key = entry.toLowerCase();
    if (existing.has(key)) return false;
    existing.add(key);
    return true;
  });
  simpleItems = [...simpleItems, ...newEntries];
  saveSimpleList();
  renderSimpleList();
  $('#simpleListInput').value = '';
  $('#simpleListStatus').classList.remove('error');
  $('#simpleListStatus').textContent = newEntries.length ? `${newEntries.length} ${newEntries.length === 1 ? 'item' : 'items'} added.` : 'Those items are already on the list.';
  if (newEntries.length) showToast(`${newEntries.length} ${newEntries.length === 1 ? 'item' : 'items'} added to the list`);
}

function setAppMode(mode) {
  simpleModeEnabled = mode === 'simple';
  $('#libraryMode').hidden = simpleModeEnabled;
  $('#simpleMode').hidden = !simpleModeEnabled;
  $('#libraryModeButton').classList.toggle('active', !simpleModeEnabled);
  $('#simpleModeButton').classList.toggle('active', simpleModeEnabled);
  $('#libraryModeButton').setAttribute('aria-pressed', String(!simpleModeEnabled));
  $('#simpleModeButton').setAttribute('aria-pressed', String(simpleModeEnabled));
  document.body.classList.toggle('simple-active', simpleModeEnabled);
  if (simpleModeEnabled) renderSimpleList();
}

function renderItems() {
  const query = ($('#librarySearch').value || '').trim().toLowerCase();
  const source = currentView === 'trash' ? trash : items;
  let visible = source.filter((item) => !query || [item.name, item.brand, item.store].join(' ').toLowerCase().includes(query));
  visible = [...visible].sort((a, b) => sortMode === 'name' ? a.name.localeCompare(b.name) : (b.updatedAt || 0) - (a.updatedAt || 0));

  $('#itemGrid').innerHTML = visible.map((item) => itemCard(item, currentView === 'trash')).join('');
  $('#itemGrid').classList.toggle('trash-grid', currentView === 'trash');
  $('#emptyState').hidden = visible.length > 0;

  $('#libraryTabCount').textContent = items.length;
  $('#trashTabCount').textContent = trash.length;
  $('#itemCount').textContent = `${visible.length} ${visible.length === 1 ? 'item' : 'items'}`;
  $('#pageTitle').textContent = currentView === 'trash' ? 'Trash' : 'Grocery library';
  $('#pageCopy').textContent = currentView === 'trash' ? 'Items you have removed from your library.' : 'Items you like to buy, all in one place.';
  $('#sectionTitle').textContent = currentView === 'trash' ? 'Deleted items' : 'All items';
  $('#sectionCopy').textContent = currentView === 'trash' ? 'Restore an item or delete it permanently.' : 'Your grocery library.';
  $('#emptyTitle').textContent = currentView === 'trash' ? 'Trash is empty' : (query ? 'No matching items' : 'No items yet');
  $('#emptyCopy').textContent = currentView === 'trash' ? 'Deleted items will stay here until you remove them permanently.' : (query ? 'Try a different search.' : 'Add something you like to buy and it will show up here.');
  $$('.nav-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.view === currentView));
  $$('.card-action').forEach((button) => button.addEventListener('click', handleCardAction));
}

function itemCard(item, isTrash) {
  const image = item.image ? `<img class="item-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" onerror="this.style.display='none'" />` : '';
  const imageWithSource = item.sourceUrl ? `<a class="image-source-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open image source for ${escapeHtml(item.name)}">${image}</a>` : image;
  const source = item.sourceUrl ? `<a class="item-source" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.imageProvider || 'View source')}</a>` : '';
  const actions = isTrash
    ? `<button class="card-action restore" data-action="restore" data-id="${escapeHtml(item.id)}">${ICON.restore} Restore</button><button class="card-action delete" data-action="permanent-delete" data-id="${escapeHtml(item.id)}">${ICON.trash} Delete forever</button>`
    : `<button class="card-action" data-action="edit" data-id="${escapeHtml(item.id)}">${ICON.edit} Edit</button><button class="card-action delete" data-action="delete" data-id="${escapeHtml(item.id)}">${ICON.trash} Delete</button>`;
  return `<article class="item-card ${isTrash ? 'trash-card' : ''}">
    <div class="item-image-wrap" style="--card-bg:${escapeHtml(item.bg || '#e7efe7')}"><div class="item-image-fallback">${escapeHtml(item.letter || item.name.charAt(0))}</div>${imageWithSource}</div>
    <div class="item-meta"><h3 class="item-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</h3><p class="item-brand" title="${escapeHtml(item.brand || item.store)}">${escapeHtml(item.brand || item.store || 'Best guess')}</p>${source}<div class="item-actions">${actions}</div></div>
  </article>`;
}

function showToast(message) {
  $('#toastMessage').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2800);
}

function setCaptureStatus(message, isError = false) {
  $('#captureStatus').textContent = message;
  $('#captureStatus').classList.toggle('error', isError);
}

function setActiveVoiceStatus(message, isError = false) {
  const status = simpleModeEnabled ? $('#simpleListStatus') : $('#captureStatus');
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function clearVoiceResultTimer() {
  clearTimeout(voiceResultTimer);
  voiceResultTimer = null;
}

function setVoiceButtonState(button, listening, forSimpleList = false) {
  if (!button) return;
  const label = button.querySelector('strong');
  const hint = button.querySelector('small');
  if (label) label.textContent = listening ? 'Stop & transcribe' : (forSimpleList ? 'Say a list' : 'Say it');
  if (hint) hint.textContent = listening ? 'Tap when finished' : (forSimpleList ? 'Say items separated by commas' : 'Use your voice');
  button.setAttribute('aria-label', listening ? 'Stop and transcribe voice input' : (forSimpleList ? 'Say a list' : 'Say it') + ' Use your voice');
}

function voiceOriginIsUsable() {
  if (location.protocol === 'file:') {
    setActiveVoiceStatus('Open Nibble from http://localhost:4173 to use the microphone.', true);
    showToast('Open the app from localhost first');
    return false;
  }
  const localHttp = location.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(location.hostname);
  if (!window.isSecureContext && !localHttp) {
    setActiveVoiceStatus('Microphone access needs localhost or HTTPS. Open the deployed app over HTTPS.', true);
    showToast('Use localhost or HTTPS for microphone access');
    return false;
  }
  return true;
}

const scriptPromises = {};

async function requestBackend(endpoint, payload) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function enrichItemWithAi(text = '', imageDataUrl = '') {
  const result = await requestBackend('/api/enrich', { text, imageDataUrl });
  return result?.name ? result : null;
}

function blobAsBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = () => reject(new Error('Audio could not be read.'));
    reader.readAsDataURL(blob);
  });
}

async function transcribeWithAi(blob) {
  const audioBase64 = await blobAsBase64(blob);
  const result = await requestBackend('/api/transcribe', { audioBase64, mimeType: blob.type || 'audio/webm' });
  return result?.text?.trim() || '';
}

function loadScript(src) {
  if (scriptPromises[src]) return scriptPromises[src];
  scriptPromises[src] = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(script);
  });
  return scriptPromises[src];
}

async function ensureVisionLibraries() {
  if (!visionLibrariesPromise) {
    visionLibrariesPromise = (async () => {
      if (!window.tf) await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js');
      if (!window.mobilenet) await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js');
      if (!window.Tesseract) await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
    })().catch((error) => { visionLibrariesPromise = null; throw error; });
  }
  return visionLibrariesPromise;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The image could not be previewed.'));
    image.src = dataUrl;
  });
}

async function rasterizeImage(dataUrl) {
  const image = await loadImageElement(dataUrl);
  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

async function classifyImage(dataUrl) {
  await ensureVisionLibraries();
  if (!imageClassifier) imageClassifier = await window.mobilenet.load({ version: 2, alpha: 1 });
  const image = await loadImageElement(dataUrl);
  const predictions = await imageClassifier.classify(image, 3);
  return predictions.map((prediction) => prediction.className.split(',')[0].trim()).filter(Boolean);
}

function extractOcrName(text) {
  const ignored = /nutrition|ingredients|calories|serving|daily value|amount per|protein|total fat|sodium|carbohydrate|sugars|vitamin|copyright|www\.|http|barcode/i;
  const lines = text.split(/\r?\n/).map((line) => line.replace(/[^a-zA-Z0-9&' -]/g, ' ').replace(/\s+/g, ' ').trim()).filter((line) => line.length >= 3 && !ignored.test(line));
  return lines.slice(0, 2).join(' ').trim();
}

async function identifyImage(dataUrl) {
  setCaptureStatus('Reading the image…');
  await ensureVisionLibraries();
  const rasterDataUrl = await rasterizeImage(dataUrl);
  const [ocrResult, classifierResult] = await Promise.allSettled([
    window.Tesseract.recognize(rasterDataUrl, 'eng', { logger: (message) => { if (message.status === 'recognizing text') setCaptureStatus(`Reading the label… ${Math.round((message.progress || 0) * 100)}%`); } }),
    classifyImage(rasterDataUrl)
  ]);
  const ocrName = ocrResult.status === 'fulfilled' ? extractOcrName(ocrResult.value?.data?.text || '') : '';
  const predictions = classifierResult.status === 'fulfilled' ? classifierResult.value : [];
  const candidate = ocrName || predictions[0] || '';
  return { candidate, predictions, usedVision: Boolean(candidate) };
}

async function searchImages(query) {
  const backendLookup = await requestBackend('/api/image-search', { query });
  if (backendLookup?.results?.length) return backendLookup.results;
  const searchTerm = inferName(query);
  if (!searchTerm || searchTerm === 'Uploaded grocery item') return [];
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url%7Cmime&iiurlwidth=900&format=json&origin=*`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) return [];
    const data = await response.json();
    const pages = Object.values(data.query?.pages || {}).filter((page) => page.imageinfo?.[0]?.mime?.startsWith('image/'));
    if (!pages.length) return [];
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
  } catch {
    return [];
  }
}

function settleImagePicker(result = null) {
  const resolve = imagePickerResolver;
  imagePickerResolver = null;
  imagePickerResults = [];
  imagePickerQuery = '';
  $('#imagePicker').hidden = true;
  $('#imagePickerGrid').innerHTML = '';
  $('#manualImageUrl').value = '';
  $('#manualSourceUrl').value = '';
  resolve?.(result);
}

function chooseImageForItem(name, results, query) {
  imagePickerResults = results;
  imagePickerQuery = query;
  $('#imagePickerTitle').textContent = name;
  $('#openGoogleImages').href = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
  $('#imagePickerGrid').innerHTML = results.length
    ? results.map((result, index) => `<article class="image-choice-card"><button class="image-choice" type="button" data-image-index="${index}"><span class="image-choice-preview"><img src="${escapeHtml(result.url)}" alt="${escapeHtml(result.title || name)}" onerror="this.closest('.image-choice-card').classList.add('image-choice-broken')" /></span><strong>${escapeHtml(result.title || 'Image result')}</strong><small>${escapeHtml(result.provider || 'Image search')}</small></button>${result.sourceUrl ? `<a class="image-choice-source" href="${escapeHtml(result.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open source</a>` : ''}</article>`).join('')
    : '<p class="image-picker-empty">No automatic photos came back. Use Google below to choose one.</p>';
  $('#imagePicker').hidden = false;
  setCaptureStatus('Choose a photo to finish adding this item.');
  return new Promise((resolve) => { imagePickerResolver = resolve; });
}

const groceryWords = [
  'apple', 'apples', 'avocado', 'avocados', 'bagel', 'banana', 'bananas', 'beans', 'beef', 'berries', 'blueberry', 'blueberries', 'bread', 'butter', 'carrot', 'carrots', 'cereal', 'cheese', 'chicken', 'chips', 'chocolate', 'coffee', 'cookie', 'cookies', 'corn', 'cream', 'cucumber', 'eggs', 'flour', 'flakes', 'focaccia', 'garlic', 'granola', 'grape', 'grapes', 'honey', 'juice', 'kettle', 'kefir', 'lettuce', 'masala', 'muffin', 'muffins', 'milk', 'noodles', 'oat', 'oatmeal', 'onion', 'orange', 'oranges', 'pancake', 'pasta', 'peach', 'peaches', 'peanut', 'pear', 'peppers', 'pizza', 'popcorn', 'potato', 'potatoes', 'raspberries', 'raspberry', 'rice', 'salmon', 'smoothie', 'spinach', 'sourdough', 'strawberries', 'strawberry', 'sugar', 'tikka', 'tomato', 'tomatoes', 'tortilla', 'turkey', 'yogurt', 'watermelon', 'waffle', 'waffles'
];
const storeWords = ['winco', 'costco', 'safeway', 'target', 'walmart', 'kroger', 'whole', 'foods', 'trader', 'joes', 'sprouts', 'albertsons'];
const storeNames = { winco: 'WinCo', costco: 'Costco', safeway: 'Safeway', target: 'Target', walmart: 'Walmart', kroger: 'Kroger', 'whole foods': 'Whole Foods', 'trader joes': 'Trader Joe’s', sprouts: 'Sprouts', albertsons: 'Albertsons' };
const commonCorrections = { tiki: 'tikka', missala: 'masala', muffen: 'muffin', bluebary: 'blueberry', avacado: 'avocado', yorgurt: 'yogurt', tomatos: 'tomatoes', strawberies: 'strawberries' };
const storePrefixes = [
  { alias: 'trader joes', name: 'Trader Joe’s', words: 2 },
  { alias: 'whole foods', name: 'Whole Foods', words: 2 },
  { alias: 'albertsons', name: 'Albertsons', words: 1 },
  { alias: 'safeway', name: 'Safeway', words: 1 },
  { alias: 'walmart', name: 'Walmart', words: 1 },
  { alias: 'sprouts', name: 'Sprouts', words: 1 },
  { alias: 'costco', name: 'Costco', words: 1 },
  { alias: 'target', name: 'Target', words: 1 },
  { alias: 'kroger', name: 'Kroger', words: 1 },
  { alias: 'winco', name: 'WinCo', words: 1 }
];
const phraseCorrections = { 'trader joes tiki missala': 'tikka masala from Trader Joe’s' };

function levenshtein(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

function closestWord(token, dictionary) {
  const normalized = token.toLowerCase();
  if (normalized.length < 3) return token;
  if (commonCorrections[normalized]) return commonCorrections[normalized];
  const exact = dictionary.find((word) => word === normalized);
  if (exact) return exact;
  const candidates = dictionary.map((word) => ({ word, distance: levenshtein(normalized, word) })).sort((a, b) => a.distance - b.distance);
  const best = candidates[0];
  const allowedDistance = normalized.length <= 5 ? 1 : Math.max(1, Math.ceil(normalized.length * 0.3));
  return best && best.distance <= allowedDistance ? best.word : token;
}

async function datamuseSuggestion(token) {
  try {
    const response = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(token)}&max=8`);
    if (!response.ok) return token;
    const suggestions = await response.json();
    const best = suggestions.map((suggestion) => suggestion.word).filter(Boolean).sort((a, b) => levenshtein(token.toLowerCase(), a.toLowerCase()) - levenshtein(token.toLowerCase(), b.toLowerCase()))[0];
    const distance = best ? levenshtein(token.toLowerCase(), best.toLowerCase()) : Infinity;
    return best && distance <= Math.max(1, Math.ceil(token.length * 0.3)) ? best : token;
  } catch {
    return token;
  }
}

async function correctWords(text, dictionary) {
  const tokens = text.split(/(\s+)/);
  const corrected = await Promise.all(tokens.map(async (token) => {
    if (!token.trim() || /[^a-zA-Z'’-]/.test(token)) return token;
    const local = closestWord(token, dictionary);
    return local === token ? datamuseSuggestion(token) : local;
  }));
  return corrected.join('');
}

function findLeadingStore(query) {
  const leadingTokens = query.trim().split(/\s+/);
  return storePrefixes.find((store) => {
    const candidate = leadingTokens.slice(0, store.words).join(' ').toLowerCase().replace(/[’']/g, '').replace(/\s+/g, '');
    const alias = store.alias.replace(/\s+/g, '');
    return candidate === alias || levenshtein(candidate, alias) <= 1;
  });
}

function normalizePhrase(text) {
  return text.toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
}

async function correctSpelling(query) {
  const knownCorrection = phraseCorrections[normalizePhrase(query)];
  if (knownCorrection) return { query: knownCorrection, changed: true };
  const connector = query.match(/\b(from|at|near|in)\b/i);
  if (!connector) {
    const leadingTokens = query.trim().split(/\s+/);
    const leadingStore = findLeadingStore(query);
    if (leadingStore && leadingTokens.length > leadingStore.words) {
      const productPart = leadingTokens.slice(leadingStore.words).join(' ');
      const correctedProduct = await correctWords(productPart, groceryWords);
      const corrected = `${correctedProduct} from ${leadingStore.name}`;
      return { query: corrected, changed: corrected.toLowerCase() !== query.toLowerCase() };
    }
    const corrected = await correctWords(query, groceryWords);
    return { query: corrected, changed: corrected.toLowerCase() !== query.toLowerCase() };
  }
  const productPart = query.slice(0, connector.index).trim();
  const storePart = query.slice(connector.index + connector[0].length).trim();
  const correctedProduct = await correctWords(productPart, groceryWords);
  const correctedStore = await correctWords(storePart, storeWords);
  const corrected = `${correctedProduct} ${connector[0].toLowerCase()} ${correctedStore}`.trim();
  return { query: corrected, changed: corrected.toLowerCase() !== query.toLowerCase() };
}

const suggestionExamples = [
  'Blueberry muffins from WinCo',
  'Greek yogurt from Costco',
  'Tikka masala from Trader Joe’s',
  'Hass avocados from Trader Joe’s',
  'Cold brew coffee from Trader Joe’s',
  'Sourdough bread from Safeway',
  'Free-range eggs from Whole Foods'
];
let suggestionTimer = null;
let suggestionSequence = 0;
let selectedSuggestionValue = '';
let pendingCorrection = null;

function formatSuggestion(query) {
  const name = inferName(query);
  const store = inferStore(query);
  return store ? `${name} from ${store}` : name;
}

function suggestionScore(label, query, hint = '') {
  const normalizedLabel = label.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  let score = hint === 'Do you mean?' ? 50 : (normalizedLabel.includes(normalizedQuery) ? 20 : 0);
  queryTokens.forEach((token) => { if (normalizedLabel.includes(token)) score += 4; });
  if (normalizedLabel.startsWith(queryTokens[0] || '')) score += 3;
  return score;
}

function hideSuggestions() {
  $('#searchSuggestions').hidden = true;
  $('#searchSuggestions').innerHTML = '';
}

async function refreshSuggestions() {
  const rawQuery = $('#itemInput').value.trim();
  const requestId = ++suggestionSequence;
  if (rawQuery.length < 2) { pendingCorrection = null; hideSuggestions(); return; }

  const pool = [...suggestionExamples, ...items.map((item) => item.store ? `${item.name} from ${item.store}` : item.name), ...seedItems.map((item) => item.store ? `${item.name} from ${item.store}` : item.name)];
  const uniquePool = [...new Set(pool.map((value) => formatSuggestion(value)))];
  let corrected = { query: rawQuery, changed: false };
  if (rawQuery.length >= 3) corrected = await correctSpelling(rawQuery);
  if (requestId !== suggestionSequence) return;

  const candidates = uniquePool.map((label) => ({ label, value: label, hint: 'Suggested' }));
  const phraseMatch = phraseCorrections[normalizePhrase(rawQuery)];
  if (phraseMatch) candidates.unshift({ label: formatSuggestion(phraseMatch), value: phraseMatch, hint: 'Do you mean?' });
  const leadingStore = findLeadingStore(rawQuery);
  if (leadingStore && rawQuery.trim().split(/\s+/).length > leadingStore.words) {
    const productPart = rawQuery.trim().split(/\s+/).slice(leadingStore.words).join(' ');
    const correctedProduct = await correctWords(productPart, groceryWords);
    const leadingStoreQuery = `${correctedProduct} from ${leadingStore.name}`;
    if (leadingStoreQuery.toLowerCase() !== rawQuery.toLowerCase()) corrected = { query: leadingStoreQuery, changed: true };
  }
  pendingCorrection = corrected.changed ? corrected : null;
  if (corrected.changed) candidates.unshift({ label: formatSuggestion(corrected.query), value: corrected.query, hint: 'Do you mean?' });
  const seenLabels = new Set();
  const ranked = candidates.filter((candidate) => {
    const key = candidate.label.toLowerCase();
    if (seenLabels.has(key)) return false;
    seenLabels.add(key);
    return true;
  })
    .map((candidate) => ({ ...candidate, score: suggestionScore(candidate.label, rawQuery, candidate.hint) }))
    .filter((candidate) => candidate.score > 0 || candidate.hint === 'Do you mean?')
    .sort((a, b) => (b.hint === 'Do you mean?') - (a.hint === 'Do you mean?') || b.score - a.score)
    .slice(0, 5);

  if (!ranked.length) { hideSuggestions(); return; }
  $('#searchSuggestions').innerHTML = ranked.map((candidate) => `<button type="button" class="suggestion-option" role="option" data-suggestion="${escapeHtml(candidate.value)}">${ICON.search}<span>${escapeHtml(candidate.label)}</span><small>${escapeHtml(candidate.hint)}</small></button>`).join('');
  $('#searchSuggestions').hidden = false;
}

function inferName(query) {
  const cleaned = query.replace(/\.[a-z0-9]{2,5}$/i, '').replace(/\b(from|at|near|in)\b.+$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned || /^image|photo|screenshot|uploaded/i.test(cleaned)) return 'Uploaded grocery item';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function inferStore(query) {
  const match = query.match(/\b(from|at|near|in)\s+([^,]+)/i);
  if (!match) return '';
  const rawStore = match[2].trim();
  const normalizedStore = rawStore.toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ');
  return storeNames[normalizedStore] || rawStore.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function imageForQuery(query) {
  const value = query.toLowerCase();
  if (/muffin/.test(value)) return imageUrls.muffin;
  if (/yogurt/.test(value)) return imageUrls.yogurt;
  if (/avocado/.test(value)) return imageUrls.avocado;
  if (/egg/.test(value)) return imageUrls.eggs;
  if (/salmon|fish/.test(value)) return imageUrls.salmon;
  if (/berry|berries|raspberry|blueberry/.test(value)) return imageUrls.berries;
  if (/chip|snack/.test(value)) return imageUrls.chips;
  if (/bread|sourdough/.test(value)) return imageUrls.bread;
  if (/coffee|cold brew/.test(value)) return imageUrls.coffee;
  if (/apple/.test(value)) return imageUrls.apple;
  if (/pasta|rigatoni|noodle/.test(value)) return imageUrls.pasta;
  return imageUrls.muffin;
}

async function addItem(query, imageData = null, options = {}) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery && !imageData) { setCaptureStatus('Type or say an item first.', true); showToast('Tell me what to add'); return; }
  hideSuggestions();
  const aiResult = options.enrichment || await enrichItemWithAi(cleanQuery, imageData || '');
  const spelling = options.skipSpelling
    ? { query: cleanQuery, changed: false }
    : aiResult
    ? { query: aiResult.searchQuery || aiResult.name || cleanQuery, changed: Boolean(cleanQuery && aiResult.searchQuery && aiResult.searchQuery.toLowerCase() !== cleanQuery.toLowerCase()) }
    : await correctSpelling(cleanQuery || 'Uploaded grocery item');
  const normalizedQuery = spelling.query || cleanQuery;
  const name = aiResult?.name || inferName(normalizedQuery);
  const store = aiResult?.store || inferStore(normalizedQuery);
  const submitButton = $('.form-submit');
  submitButton.disabled = true;
  if (spelling.changed && !imageData) $('#itemInput').value = normalizedQuery;
  setCaptureStatus(aiResult ? `Found “${name}”. Looking for an image…` : (spelling.changed ? `Fixed spelling to “${name}”. Looking for an image…` : 'Looking for a matching image…'));
  try {
    let lookup = options.lookupImage ? { url: options.lookupImage } : null;
    let skipImage = false;
    if (!lookup) {
      const lookupResults = await searchImages(normalizedQuery || name);
      if (!imageData && !options.skipPicker) {
        const chosen = await chooseImageForItem(name, lookupResults, normalizedQuery || name);
        if (!chosen) {
          setCaptureStatus('Image selection cancelled.');
          return;
        }
        skipImage = chosen.skip === true;
        lookup = skipImage ? null : chosen;
      } else {
        lookup = lookupResults[0] || null;
      }
    }
    const item = normalizeItem({
      id: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      brand: aiResult?.brand || (imageData ? (options.recognizedFrom ? `Recognized as ${options.recognizedFrom}` : 'Photo upload · edit to refine') : (store ? `${store} · best guess` : 'Best guess')),
      store,
      image: lookup?.url || imageData || imageForQuery(normalizedQuery),
      sourceUrl: lookup?.sourceUrl || '',
      imageProvider: lookup?.provider || '',
      bg: '#e1eee3',
      letter: name.charAt(0).toUpperCase(),
      updatedAt: Date.now()
    });
    items = [item, ...items];
    currentView = 'library';
    $('#itemInput').value = '';
    saveState();
    renderItems();
    setCaptureStatus('');
    showToast(`${item.name} added`);
  } finally {
    submitButton.disabled = false;
  }
}

async function handlePhoto(file) {
  if (!file || !file.type.startsWith('image/')) { showToast('Please choose an image file'); return; }
  try {
    const dataUrl = await readFileAsDataUrl(file);
    let aiIdentification = null;
    try {
      setCaptureStatus('Asking the image recognizer…');
      aiIdentification = await enrichItemWithAi('', await rasterizeImage(dataUrl));
    } catch { /* use the local OCR/classifier fallback below */ }
    if (aiIdentification?.name) {
      await addItem(aiIdentification.searchQuery || aiIdentification.name, dataUrl, { enrichment: aiIdentification, recognizedFrom: aiIdentification.name });
      return;
    }
    let identification = { candidate: '', usedVision: false };
    try { identification = await identifyImage(dataUrl); } catch { setCaptureStatus('Could not read the label; saving the photo so you can edit it.'); }
    const candidate = identification.candidate || 'Uploaded grocery item';
    await addItem(candidate, dataUrl, { recognizedFrom: identification.usedVision ? candidate : '' });
  } catch {
    showToast('That image could not be read');
    setCaptureStatus('The image could not be read.', true);
  }
}

async function requestMicrophonePermission() {
  if (microphoneRequest) return microphoneRequest;
  microphoneRequest = (async () => {
    if (!voiceOriginIsUsable()) return false;
    if (!navigator.mediaDevices?.getUserMedia) {
      setActiveVoiceStatus('This browser cannot request microphone access. Try Chrome or Safari.', true);
      showToast('Microphone access is unavailable');
      return false;
    }
    setActiveVoiceStatus('Requesting microphone access…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      const message = error?.name === 'NotAllowedError' || error?.name === 'SecurityError'
        ? 'Microphone permission was blocked. Allow it in the browser, then try again.'
        : error?.name === 'NotFoundError'
          ? 'No microphone was found on this device.'
          : 'The microphone could not be opened. Try again.';
      setActiveVoiceStatus(message, true);
      showToast('Microphone access was not granted');
      return false;
    } finally {
      microphoneRequest = null;
    }
  })();
  return microphoneRequest;
}

async function startServerVoiceCapture(forSimpleList = false, permissionGranted = false) {
  if (!window.MediaRecorder) {
    (forSimpleList ? $('#simpleListStatus') : $('#captureStatus')).textContent = 'This browser cannot record audio for transcription. Try Chrome or Safari.';
    (forSimpleList ? $('#simpleListStatus') : $('#captureStatus')).classList.add('error');
    showToast('Voice transcription is unavailable here');
    return;
  }
  if (!permissionGranted && !(await requestMicrophonePermission())) return;
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type)) || '';
    voiceRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    voiceChunks = [];
    isListening = true;
    const voiceButton = forSimpleList ? $('#simpleVoiceButton') : $('#voiceButton');
    voiceButton.classList.add('listening');
    setVoiceButtonState(voiceButton, true, forSimpleList);
    (forSimpleList ? $('#simpleListStatus') : $('#captureStatus')).textContent = 'Listening… tap Say it again when you are done.';
    (forSimpleList ? $('#simpleListStatus') : $('#captureStatus')).classList.remove('error');
    voiceRecorder.ondataavailable = (event) => { if (event.data.size) voiceChunks.push(event.data); };
    voiceRecorder.onerror = () => {
      const status = forSimpleList ? $('#simpleListStatus') : $('#captureStatus');
      status.textContent = 'The recording failed. Try again or type the item below.';
      status.classList.add('error');
    };
    voiceRecorder.onstop = async () => {
      const recording = new Blob(voiceChunks, { type: voiceRecorder?.mimeType || mimeType || 'audio/webm' });
      stream.getTracks().forEach((track) => track.stop());
      voiceRecorder = null;
      voiceChunks = [];
      isListening = false;
      voiceButton.classList.remove('listening');
      setVoiceButtonState(voiceButton, false, forSimpleList);
      const status = forSimpleList ? $('#simpleListStatus') : $('#captureStatus');
      status.textContent = 'Transcribing…';
      status.classList.remove('error');
      try {
        const transcript = await transcribeWithAi(recording);
        if (!transcript) throw new Error('No transcript');
        if (forSimpleList) {
          $('#simpleListInput').value = transcript;
          addSimpleListEntries(transcript);
        } else {
          $('#itemInput').value = transcript;
          await addItem(transcript);
        }
      } catch {
        status.textContent = forSimpleList
          ? 'Voice transcription is not configured yet. Type the list below or add the API keys on the server.'
          : 'Voice transcription is not configured yet. Type the item below or add the API keys on the server.';
        status.classList.add('error');
        showToast('Could not transcribe that recording');
      }
    };
    voiceRecorder.start();
  } catch {
    stream?.getTracks().forEach((track) => track.stop());
    voiceRecorder = null;
    isListening = false;
    (forSimpleList ? $('#simpleVoiceButton') : $('#voiceButton')).classList.remove('listening');
    setVoiceButtonState(forSimpleList ? $('#simpleVoiceButton') : $('#voiceButton'), false, forSimpleList);
    const status = forSimpleList ? $('#simpleListStatus') : $('#captureStatus');
    status.textContent = 'Voice could not start. Allow microphone access and try again.';
    status.classList.add('error');
  }
}

async function startSimpleVoiceCapture() {
  if (isListening) {
    if (voiceRecognition) voiceRecognition.stop();
    else voiceRecorder?.stop();
    return;
  }
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return startServerVoiceCapture(true);
  if (!voiceOriginIsUsable()) return;
  try {
    voiceRecognition = new Recognition();
    voiceRecognition.lang = 'en-US';
    voiceRecognition.continuous = false;
    voiceRecognition.interimResults = true;
    isListening = true;
    $('#simpleVoiceButton').classList.add('listening');
    setVoiceButtonState($('#simpleVoiceButton'), true, true);
    $('#simpleListStatus').classList.remove('error');
    $('#simpleListStatus').textContent = 'Listening… say items separated by commas.';
    voiceRecognition.onresult = (event) => {
      clearVoiceResultTimer();
      const transcript = [...event.results].map((result) => result[0].transcript).join(' ').trim();
      if (transcript) $('#simpleListInput').value = transcript;
      const finalResult = [...event.results].some((result) => result.isFinal);
      if (finalResult && transcript) { addSimpleListEntries(transcript); voiceRecognition.stop(); }
    };
    voiceRecognition.onerror = (event) => {
      clearVoiceResultTimer();
      const status = $('#simpleListStatus');
      status.textContent = event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone access is blocked. Allow it in the browser, then try again.'
        : event.error === 'network'
          ? 'The browser speech service is unavailable. Try Chrome or Safari, or configure Groq for the recorder fallback.'
          : 'I could not hear that. Try again or type the list below.';
      status.classList.add('error');
      showToast('Voice capture needs another try');
    };
    voiceRecognition.onend = () => {
      clearVoiceResultTimer();
      isListening = false;
      $('#simpleVoiceButton').classList.remove('listening');
      setVoiceButtonState($('#simpleVoiceButton'), false, true);
      voiceRecognition = null;
    };
    voiceRecognition.start();
    voiceResultTimer = setTimeout(() => {
      if (!voiceRecognition || !isListening) return;
      voiceRecognition.stop();
      $('#simpleListStatus').textContent = 'No speech was returned. Try Chrome or Safari, or use typing below.';
      $('#simpleListStatus').classList.add('error');
    }, 12000);
  } catch {
    clearVoiceResultTimer();
    isListening = false;
    $('#simpleVoiceButton').classList.remove('listening');
    setVoiceButtonState($('#simpleVoiceButton'), false, true);
    $('#simpleListStatus').textContent = 'Voice could not start. Try typing the list below.';
    $('#simpleListStatus').classList.add('error');
  }
}

async function startVoiceCapture() {
  if (simpleModeEnabled) return startSimpleVoiceCapture();
  if (isListening) {
    if (voiceRecognition) voiceRecognition.stop();
    else voiceRecorder?.stop();
    return;
  }
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    return startServerVoiceCapture();
  }
  if (!voiceOriginIsUsable()) return;
  try {
    voiceRecognition = new Recognition();
    voiceRecognition.lang = 'en-US';
    voiceRecognition.continuous = false;
    voiceRecognition.interimResults = true;
    isListening = true;
    $('#voiceButton').classList.add('listening');
    setVoiceButtonState($('#voiceButton'), true);
    setCaptureStatus('Listening… say the item and store.');
    voiceRecognition.onresult = (event) => {
      clearVoiceResultTimer();
      const transcript = [...event.results].map((result) => result[0].transcript).join(' ').trim();
      if (transcript) $('#itemInput').value = transcript;
      const finalResult = [...event.results].some((result) => result.isFinal);
      if (finalResult && transcript) { void addItem(transcript); voiceRecognition.stop(); }
    };
    voiceRecognition.onerror = (event) => {
      clearVoiceResultTimer();
      const message = event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone access is blocked. Allow it in the browser, then try again.'
        : event.error === 'network'
          ? 'The browser speech service is unavailable. Try Chrome or Safari, or configure Groq for the recorder fallback.'
          : 'I could not hear that. Try again or type it below.';
      setCaptureStatus(message, true);
      showToast('Voice capture needs another try');
    };
    voiceRecognition.onend = () => {
      clearVoiceResultTimer();
      isListening = false;
      $('#voiceButton').classList.remove('listening');
      setVoiceButtonState($('#voiceButton'), false);
      voiceRecognition = null;
    };
    voiceRecognition.start();
    voiceResultTimer = setTimeout(() => {
      if (!voiceRecognition || !isListening) return;
      voiceRecognition.stop();
      setCaptureStatus('No speech was returned. Try Chrome or Safari, or use typing below.', true);
    }, 12000);
  } catch {
    clearVoiceResultTimer();
    isListening = false;
    $('#voiceButton').classList.remove('listening');
    setVoiceButtonState($('#voiceButton'), false);
    setCaptureStatus('Voice could not start. Try typing the item below.', true);
  }
}

function openEditModal(id) {
  const item = items.find((entry) => String(entry.id) === String(id));
  if (!item) return;
  editingId = item.id;
  $('#editName').value = item.name || '';
  $('#editStore').value = item.store || '';
  $('#editModal').hidden = false;
  setTimeout(() => $('#editName').focus(), 30);
}

function closeEditModal() {
  editingId = null;
  $('#editModal').hidden = true;
}

function handleCardAction(event) {
  const button = event.currentTarget;
  const id = button.dataset.id;
  const action = button.dataset.action;
  if (action === 'edit') openEditModal(id);
  if (action === 'delete') {
    const index = items.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return;
    trash = [items[index], ...trash];
    items.splice(index, 1);
    saveState();
    renderItems();
    showToast('Moved to trash');
  }
  if (action === 'restore') {
    const index = trash.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return;
    items = [trash[index], ...items];
    trash.splice(index, 1);
    saveState();
    renderItems();
    showToast('Restored to your library');
  }
  if (action === 'permanent-delete') {
    const item = trash.find((entry) => String(entry.id) === String(id));
    if (!item || !window.confirm(`Delete ${item.name} permanently?`)) return;
    trash = trash.filter((entry) => String(entry.id) !== String(id));
    saveState();
    renderItems();
    showToast('Deleted permanently');
  }
}

async function submitTypedItem() {
  const rawQuery = $('#itemInput').value.trim();
  if (!rawQuery) { await addItem(rawQuery); return; }
  const selectedValue = selectedSuggestionValue && selectedSuggestionValue === rawQuery ? selectedSuggestionValue : '';
  const correction = selectedValue ? { query: rawQuery, changed: false } : await correctSpelling(rawQuery);
  if (correction.changed) {
    pendingCorrection = correction;
    await refreshSuggestions();
    $('#itemInput').focus();
    setCaptureStatus(`Do you mean “${formatSuggestion(correction.query)}”? Choose a suggestion before adding.`);
    return;
  }
  await addItem(selectedValue || rawQuery, null, { skipSpelling: true });
}

$('#addForm').addEventListener('submit', (event) => { event.preventDefault(); void submitTypedItem(); });
$('#simpleListForm').addEventListener('submit', (event) => { event.preventDefault(); addSimpleListEntries($('#simpleListInput').value); });
$('#simpleList').addEventListener('click', (event) => {
  const noteButton = event.target.closest('.simple-note-add');
  if (noteButton) {
    addSimpleItemToAppleNotes(Number(noteButton.dataset.noteIndex));
    return;
  }
  const removeButton = event.target.closest('.simple-remove');
  if (!removeButton) return;
  simpleItems.splice(Number(removeButton.dataset.simpleIndex), 1);
  saveSimpleList();
  renderSimpleList();
});
$('#clearSimpleList').addEventListener('click', () => {
  if (!simpleItems.length || !window.confirm('Clear the simple list?')) return;
  simpleItems = [];
  saveSimpleList();
  renderSimpleList();
  $('#simpleListStatus').textContent = 'List cleared.';
});
$('#appleNotesSetupButton').addEventListener('click', openAppleNotesSetup);
$('#appleNotesRemoveButton').addEventListener('click', () => {
  if (!appleNotesConfig) return;
  appleNotesConfig = null;
  saveAppleNotesConfig();
  renderAppleNotesSetup();
  $('#simpleListStatus').textContent = 'Apple Notes setup removed.';
  showToast('Apple Notes setup removed');
});
$('#closeAppleNotesSetup').addEventListener('click', closeAppleNotesSetup);
$('#cancelAppleNotesSetup').addEventListener('click', closeAppleNotesSetup);
$('#appleNotesSetup').addEventListener('click', (event) => { if (event.target === $('#appleNotesSetup')) closeAppleNotesSetup(); });
$('#appleNotesForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const noteName = $('#appleNotesName').value.trim();
  const shortcutName = $('#appleNotesShortcut').value.trim();
  if (!noteName || !shortcutName) return;
  appleNotesConfig = { noteName, shortcutName };
  saveAppleNotesConfig();
  renderAppleNotesSetup();
  closeAppleNotesSetup();
  $('#simpleListStatus').textContent = `Apple Notes is ready for “${noteName}”. Tap + beside an item to send it.`;
  showToast('Apple Notes setup saved');
});
$('#simpleVoiceButton').addEventListener('click', startSimpleVoiceCapture);
$$('.mode-toggle-option').forEach((button) => button.addEventListener('click', () => setAppMode(button.dataset.mode)));
$('#itemInput').addEventListener('input', () => {
  selectedSuggestionValue = '';
  pendingCorrection = null;
  setCaptureStatus('');
  clearTimeout(suggestionTimer);
  suggestionTimer = setTimeout(() => { void refreshSuggestions(); }, 220);
});
$('#itemInput').addEventListener('focus', () => { if ($('#itemInput').value.trim().length >= 2) void refreshSuggestions(); });
$('#searchSuggestions').addEventListener('click', (event) => {
  const option = event.target.closest('.suggestion-option');
  if (!option) return;
  $('#itemInput').value = option.dataset.suggestion;
  selectedSuggestionValue = option.dataset.suggestion;
  pendingCorrection = null;
  hideSuggestions();
  $('#itemInput').focus();
  setCaptureStatus(`Using “${formatSuggestion(option.dataset.suggestion)}”. Press Add to save.`);
});
document.addEventListener('click', (event) => { if (!event.target.closest('.add-panel')) hideSuggestions(); });
$('#focusAddButton').addEventListener('click', () => { $('#itemInput').focus(); $('#itemInput').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
$('#emptyAddButton').addEventListener('click', () => { $('#itemInput').focus(); $('#itemInput').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
$('#voiceButton').addEventListener('click', startVoiceCapture);
$('#photoInput').addEventListener('change', (event) => { handlePhoto(event.target.files[0]); event.target.value = ''; });
$('#librarySearch').addEventListener('input', renderItems);
$$('.nav-tab').forEach((tab) => tab.addEventListener('click', () => { currentView = tab.dataset.view; renderItems(); }));
$('#sortButton').addEventListener('click', () => { sortMode = sortMode === 'recent' ? 'name' : 'recent'; $('#sortButton').innerHTML = `${sortMode === 'recent' ? 'Recently added' : 'Name'} ${ICON.chevronDown}`; renderItems(); });
$('#editForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const item = items.find((entry) => String(entry.id) === String(editingId));
  if (!item) return;
  item.name = $('#editName').value.trim() || item.name;
  item.store = $('#editStore').value.trim();
  item.brand = item.store || item.brand;
  item.updatedAt = Date.now();
  saveState();
  closeEditModal();
  renderItems();
  showToast('Item updated');
});
$('#closeEditModal').addEventListener('click', closeEditModal);
$('#cancelEdit').addEventListener('click', closeEditModal);
$('#editModal').addEventListener('click', (event) => { if (event.target === $('#editModal')) closeEditModal(); });
$('#imagePickerGrid').addEventListener('click', (event) => {
  const choice = event.target.closest('.image-choice');
  if (!choice) return;
  settleImagePicker(imagePickerResults[Number(choice.dataset.imageIndex)] || null);
});
$('#useManualImage').addEventListener('click', () => {
  const imageUrl = $('#manualImageUrl').value.trim();
  if (!/^https?:\/\//i.test(imageUrl)) {
    showToast('Paste a full image URL first');
    return;
  }
  const sourceUrl = $('#manualSourceUrl').value.trim() || imageUrl;
  settleImagePicker({ url: imageUrl, sourceUrl, title: $('#imagePickerTitle').textContent, provider: 'Google Images (manual)' });
});
$('#closeImagePicker').addEventListener('click', () => settleImagePicker());
$('#skipImagePicker').addEventListener('click', () => settleImagePicker({ skip: true }));
$('#imagePicker').addEventListener('click', (event) => { if (event.target === $('#imagePicker')) settleImagePicker(); });
window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('#editModal').hidden) closeEditModal(); if (event.key === 'Escape' && !$('#imagePicker').hidden) settleImagePicker(); if (event.key === 'Escape') hideSuggestions(); });

const initialState = loadState();
items = initialState.items.map(normalizeItem);
trash = initialState.trash.map(normalizeItem);
simpleItems = loadSimpleList();
appleNotesConfig = loadAppleNotesConfig();
saveState();
renderIcons();
renderItems();
renderSimpleList();
renderAppleNotesSetup();
