const ICON = {
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><rect x="8.5" y="3" width="7" height="12" rx="3.5"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"/><path d="m19.4 13.5 1.3 1-.1 1.3-1.6 1.6-1.3-.1-1-1.3a7.6 7.6 0 0 1-1.6.7l-.2 1.6-1 .9h-2.3l-1-.9-.2-1.6a7.6 7.6 0 0 1-1.6-.7l-1 1.3-1.3.1-1.6-1.6-.1-1.3 1.3-1a7.7 7.7 0 0 1-.1-1.5c0-.5 0-1 .1-1.5l-1.3-1 .1-1.3 1.6-1.6 1.3.1 1 1.3a7.6 7.6 0 0 1 1.6-.7l.2-1.6 1-.9h2.3l1 .9.2 1.6a7.6 7.6 0 0 1 1.6.7l1-1.3 1.3-.1 1.6 1.6.1 1.3-1.3 1c.1.5.1 1 .1 1.5s0 1-.1 1.5Z"/></svg>',
  archive: '<svg viewBox="0 0 24 24"><path d="M4 7.5h16v12H4zM3 4.5h18v3H3zM9 11.5h6"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M10 11v6M14 11v6"/></svg>',
  note: '<svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M9.5 12.5h5M9.5 16h5"/></svg>'
};

let simpleItems = [];
let appleNotesConfig = null;
let voiceRecognition = null;
let voiceRecorder = null;
let voiceStream = null;
let voiceChunks = [];
let voiceFinalText = '';
let isListening = false;
let toastTimer = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function renderIcons() {
  $$('[data-icon]').forEach((element) => { element.innerHTML = ICON[element.dataset.icon] || ''; });
}

function loadSimpleList() {
  try {
    const saved = JSON.parse(localStorage.getItem('nibble-simple-list') || '[]');
    return Array.isArray(saved) ? saved.map((entry) => String(entry).trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
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
  } catch {
    return null;
  }
}

function saveAppleNotesConfig() {
  try {
    if (appleNotesConfig) localStorage.setItem('nibble-apple-notes', JSON.stringify(appleNotesConfig));
    else localStorage.removeItem('nibble-apple-notes');
  } catch { /* keep the Notes handoff usable if storage is unavailable */ }
}

function splitSimpleEntries(value) {
  return String(value || '')
    .replace(/[\u2022•]/g, ',')
    .split(/[,;\n]+/)
    .map((entry) => entry
      .replace(/^\s*(?:and|also|um+|uh+)\s+/i, '')
      .replace(/\s+(?:um+|uh+)\s+/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean);
}

function renderSimpleList() {
  const list = $('#simpleList');
  const empty = $('#simpleListEmpty');
  const hint = $('#simpleListHint');
  if (!list || !empty) return;
  list.innerHTML = simpleItems.map((entry, index) => `
    <li class="simple-item" data-index="${index}">
      <div class="simple-item-swipe-bg swipe-bg-delete"><span data-icon="trash"></span></div>
      <div class="simple-item-swipe-bg swipe-bg-done"><span data-icon="check"></span></div>
      <div class="simple-item-row">
        <span class="simple-item-label" data-role="label">${escapeHtml(entry)}</span>
        <button class="simple-note-add" type="button" data-note-index="${index}" aria-label="Send ${escapeHtml(entry)} to Apple Notes"><span data-icon="note"></span></button>
      </div>
    </li>`).join('');
  empty.hidden = simpleItems.length > 0;
  if (hint) hint.hidden = simpleItems.length === 0;
  renderIcons();
}

function renderAppleNotesSetup() {
  const connected = Boolean(appleNotesConfig);
  $('#appleNotesName').value = appleNotesConfig?.noteName || '';
  $('#appleNotesShortcut').value = appleNotesConfig?.shortcutName || '';
  $('#appleNotesConnected').hidden = !connected;
  $('#appleNotesConnectedText').textContent = connected
    ? `Connected to “${appleNotesConfig.noteName}” using “${appleNotesConfig.shortcutName}”.`
    : '';
}

function openAppleNotesSetup() {
  renderAppleNotesSetup();
  $('#appleNotesSetup').hidden = false;
  setTimeout(() => $('#appleNotesName').focus(), 30);
}

function closeAppleNotesSetup() {
  $('#appleNotesSetup').hidden = true;
}

function openSimpleEntryPanel() {
  $('#simpleEntryPanel').hidden = false;
  setTimeout(() => $('#simpleListInput').focus(), 30);
}

function closeSimpleEntryPanel() {
  if (isListening) stopVoiceCapture();
  $('#simpleEntryPanel').hidden = true;
}

function showToast(message) {
  $('#toastMessage').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2800);
}

function setVoiceStatus(message, isError = false) {
  const status = $('#simpleListStatus');
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function setVoiceButtonState(listening) {
  const button = $('#simpleVoiceButton');
  const label = button.querySelector('strong');
  const hint = button.querySelector('small');
  button.classList.toggle('listening', listening);
  label.textContent = listening ? 'Stop & transcribe' : 'Say a list';
  hint.textContent = listening ? 'Tap when finished' : 'Tap to use your microphone';
  button.setAttribute('aria-label', listening ? 'Stop and transcribe voice input' : 'Say a list using your microphone');
}

function voiceOriginIsUsable() {
  if (location.protocol === 'file:') {
    setVoiceStatus('Open Nibble from http://localhost:4173 to use the microphone.', true);
    showToast('Open the app from localhost first');
    return false;
  }
  const localHttp = location.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(location.hostname);
  if (!window.isSecureContext && !localHttp) {
    setVoiceStatus('Microphone access needs localhost or HTTPS.', true);
    showToast('Use localhost or HTTPS for microphone access');
    return false;
  }
  return true;
}

async function requestMicrophoneStream() {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser does not provide microphone access.');
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

function stopStream(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}

async function requestBackend(endpoint, payload) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);
    return response.ok ? result : null;
  } catch {
    return null;
  }
}

function blobAsBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = () => reject(new Error('The recording could not be read.'));
    reader.readAsDataURL(blob);
  });
}

async function transcribeWithAi(blob) {
  const audioBase64 = await blobAsBase64(blob);
  const result = await requestBackend('/api/transcribe', { audioBase64, mimeType: blob.type || 'audio/webm' });
  return result?.text?.trim() || '';
}

function finishVoiceCapture() {
  isListening = false;
  setVoiceButtonState(false);
  stopStream(voiceStream);
  voiceStream = null;
  voiceRecorder = null;
  voiceRecognition = null;
}

function startNativeVoiceCapture(stream) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return false;
  const recognition = new Recognition();
  voiceRecognition = recognition;
  voiceFinalText = '';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.onstart = () => {
    isListening = true;
    setVoiceButtonState(true);
    setVoiceStatus('Listening… say your items, then tap Stop & transcribe.');
  };
  recognition.onresult = (event) => {
    let interim = '';
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const text = event.results[index][0]?.transcript || '';
      if (event.results[index].isFinal) voiceFinalText += `${text}, `;
      else interim += text;
    }
    setVoiceStatus(interim ? `Hearing: ${interim}` : 'Listening… say your items, then tap Stop & transcribe.');
  };
  recognition.onerror = (event) => {
    if (event.error === 'aborted') return;
    const message = event.error === 'not-allowed' ? 'Microphone permission was denied. Allow it in your browser settings and try again.' : `Voice input stopped: ${event.error || 'browser speech service error'}.`;
    setVoiceStatus(message, true);
  };
  recognition.onend = () => {
    const transcript = voiceFinalText.trim();
    const wasListening = isListening;
    finishVoiceCapture();
    if (wasListening && transcript) addSimpleListEntries(transcript);
    else if (wasListening) setVoiceStatus('I did not hear any words. Try again and speak after the browser says it is listening.', true);
  };
  try {
    recognition.start();
    stopStream(stream);
    return true;
  } catch {
    stopStream(stream);
    finishVoiceCapture();
    return false;
  }
}

async function startServerVoiceCapture(stream) {
  if (!window.MediaRecorder) {
    stopStream(stream);
    setVoiceStatus('This browser cannot record audio. Try Safari or Chrome on localhost/HTTPS.', true);
    return;
  }
  const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((type) => MediaRecorder.isTypeSupported(type)) || '';
  voiceStream = stream;
  voiceChunks = [];
  voiceRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  voiceRecorder.ondataavailable = (event) => { if (event.data.size) voiceChunks.push(event.data); };
  voiceRecorder.onstop = async () => {
    const blob = new Blob(voiceChunks, { type: voiceRecorder?.mimeType || mimeType || 'audio/webm' });
    finishVoiceCapture();
    setVoiceStatus('Transcribing…');
    const transcript = await transcribeWithAi(blob);
    if (transcript) addSimpleListEntries(transcript);
    else setVoiceStatus('I could not transcribe that recording. Add GROQ_API_KEY in Render, or use the browser speech option.', true);
  };
  voiceRecorder.start();
  isListening = true;
  setVoiceButtonState(true);
  setVoiceStatus('Recording… say your items, then tap Stop & transcribe.');
}

async function startSimpleVoiceCapture() {
  if (isListening) {
    if (voiceRecognition) voiceRecognition.stop();
    else if (voiceRecorder) voiceRecorder.stop();
    return;
  }
  if (!voiceOriginIsUsable()) return;
  setVoiceStatus('Requesting microphone permission…');
  try {
    const stream = await requestMicrophoneStream();
    if (!startNativeVoiceCapture(stream)) await startServerVoiceCapture(stream);
  } catch (error) {
    setVoiceStatus(`${error.message} Allow microphone access and try again.`, true);
    showToast('Microphone permission is needed');
  }
}

function stopVoiceCapture() {
  if (voiceRecognition) voiceRecognition.stop();
  else if (voiceRecorder) voiceRecorder.stop();
  else finishVoiceCapture();
}

function addSimpleListEntries(value) {
  const entries = splitSimpleEntries(value);
  if (!entries.length) {
    setVoiceStatus('Say or type at least one item.', true);
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
  setVoiceStatus(newEntries.length ? `${newEntries.length} ${newEntries.length === 1 ? 'item' : 'items'} added.` : 'Those items are already on the list.');
  if (newEntries.length) showToast(`${newEntries.length} ${newEntries.length === 1 ? 'item' : 'items'} added`);
}

async function addSimpleItemToAppleNotes(index) {
  const entry = simpleItems[index];
  if (!entry) return;
  if (!appleNotesConfig) {
    openAppleNotesSetup();
    setVoiceStatus('Set up Apple Notes first, then tap + again.');
    return;
  }
  if (!navigator.clipboard?.writeText) {
    setVoiceStatus('This browser cannot copy to the clipboard. Use Safari or Chrome on your phone.', true);
    return;
  }
  try {
    await navigator.clipboard.writeText(entry);
    const shortcutUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(appleNotesConfig.shortcutName)}`;
    setVoiceStatus(`Copied “${entry}”. Opening the Notes Shortcut…`);
    showToast(`Copied ${entry}; opening Shortcut`);
    window.location.href = shortcutUrl;
  } catch {
    setVoiceStatus('Nibble could not copy that item. Allow clipboard access and try again.', true);
  }
}

function clearSimpleList() {
  if (!simpleItems.length) return;
  if (!window.confirm('Clear the entire grocery list?')) return;
  simpleItems = [];
  saveSimpleList();
  renderSimpleList();
  setVoiceStatus('List cleared.');
}

function removeSimpleItemAt(index, message) {
  if (!simpleItems[index]) return;
  simpleItems.splice(index, 1);
  saveSimpleList();
  renderSimpleList();
  if (message) setVoiceStatus(message);
}

function beginEditSimpleItem(li) {
  if (!li || li.classList.contains('editing')) return;
  const index = Number(li.dataset.index);
  const label = li.querySelector('[data-role="label"]');
  if (!label) return;
  const original = simpleItems[index];
  li.classList.add('editing');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'simple-item-edit';
  input.value = original;
  input.setAttribute('aria-label', `Edit ${original}`);
  label.replaceWith(input);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  let settled = false;
  const commit = () => {
    if (settled) return;
    settled = true;
    const value = input.value.trim();
    if (!value) removeSimpleItemAt(index, 'Item removed.');
    else if (value !== original) {
      simpleItems[index] = value;
      saveSimpleList();
      renderSimpleList();
    } else {
      renderSimpleList();
    }
  };
  const cancel = () => {
    if (settled) return;
    settled = true;
    renderSimpleList();
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); input.blur(); }
    else if (event.key === 'Escape') { event.preventDefault(); cancel(); }
  });
}

const SWIPE_COMMIT_PX = 84;
const SWIPE_MAX_PX = 132;
let swipeState = null;

function resetSwipeRow(row) {
  if (!row) return;
  row.style.transition = 'transform .18s ease';
  row.style.transform = 'translateX(0px)';
}

function onSimplePointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return;
  const li = event.target.closest('.simple-item');
  if (!li || li.classList.contains('editing')) return;
  if (event.target.closest('.simple-note-add')) return;
  const row = li.querySelector('.simple-item-row');
  if (!row) return;
  swipeState = {
    li, row,
    index: Number(li.dataset.index),
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    dx: 0,
    locked: false,
    captured: false
  };
}

function onSimplePointerMove(event) {
  if (!swipeState || event.pointerId !== swipeState.pointerId) return;
  const dx = event.clientX - swipeState.startX;
  const dy = event.clientY - swipeState.startY;
  if (!swipeState.locked) {
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      swipeState.locked = true;
      swipeState.row.style.transition = 'none';
      try { swipeState.li.setPointerCapture(event.pointerId); swipeState.captured = true; } catch { /* pointer capture unsupported */ }
    } else if (Math.abs(dy) > 8) {
      swipeState = null;
      return;
    } else {
      return;
    }
  }
  event.preventDefault();
  swipeState.dx = Math.max(-SWIPE_MAX_PX, Math.min(SWIPE_MAX_PX, dx));
  swipeState.row.style.transform = `translateX(${swipeState.dx}px)`;
  swipeState.li.classList.toggle('swipe-right', swipeState.dx > 4);
  swipeState.li.classList.toggle('swipe-left', swipeState.dx < -4);
}

function finishSwipe(event) {
  if (!swipeState || (event && event.pointerId !== swipeState.pointerId)) return;
  const { li, row, index, dx, locked, captured } = swipeState;
  if (captured) { try { li.releasePointerCapture(event.pointerId); } catch { /* already released */ } }
  swipeState = null;
  if (!locked) return;
  if (dx >= SWIPE_COMMIT_PX) {
    const entry = simpleItems[index];
    row.style.transition = 'transform .16s ease, opacity .16s ease';
    row.style.transform = 'translateX(140%)';
    row.style.opacity = '0';
    setTimeout(() => removeSimpleItemAt(index, entry ? `Removed ${entry}.` : undefined), 150);
  } else if (dx <= -SWIPE_COMMIT_PX) {
    const entry = simpleItems[index];
    li.classList.add('swipe-done');
    row.style.transition = 'transform .16s ease, opacity .16s ease';
    row.style.transform = 'translateX(-140%)';
    row.style.opacity = '0';
    setTimeout(() => removeSimpleItemAt(index, entry ? `Checked off ${entry}.` : undefined), 150);
  } else {
    resetSwipeRow(row);
    li.classList.remove('swipe-right', 'swipe-left');
  }
}

function onSimpleListClick(event) {
  const noteButton = event.target.closest('[data-note-index]');
  if (noteButton) { addSimpleItemToAppleNotes(Number(noteButton.dataset.noteIndex)); return; }
  const label = event.target.closest('[data-role="label"]');
  if (label) beginEditSimpleItem(label.closest('.simple-item'));
}

document.addEventListener('DOMContentLoaded', () => {
  simpleItems = loadSimpleList();
  appleNotesConfig = loadAppleNotesConfig();
  renderIcons();
  renderSimpleList();
  renderAppleNotesSetup();

  $('#simpleAddButton').addEventListener('click', openSimpleEntryPanel);
  $('#closeSimpleEntry').addEventListener('click', closeSimpleEntryPanel);
  $('#simpleVoiceButton').addEventListener('click', startSimpleVoiceCapture);
  $('#simpleListForm').addEventListener('submit', (event) => {
    event.preventDefault();
    addSimpleListEntries($('#simpleListInput').value);
  });
  const simpleList = $('#simpleList');
  simpleList.addEventListener('click', onSimpleListClick);
  simpleList.addEventListener('pointerdown', onSimplePointerDown);
  simpleList.addEventListener('pointermove', onSimplePointerMove);
  simpleList.addEventListener('pointerup', finishSwipe);
  simpleList.addEventListener('pointercancel', finishSwipe);
  $('#simpleClearHeaderButton').addEventListener('click', clearSimpleList);
  $('#simpleSettingsButton').addEventListener('click', openAppleNotesSetup);
  $('#closeAppleNotesSetup').addEventListener('click', closeAppleNotesSetup);
  $('#cancelAppleNotesSetup').addEventListener('click', closeAppleNotesSetup);
  $('#appleNotesRemoveButton').addEventListener('click', () => {
    appleNotesConfig = null;
    saveAppleNotesConfig();
    renderAppleNotesSetup();
    showToast('Apple Notes setup removed');
  });
  $('#appleNotesSetup').addEventListener('click', (event) => {
    if (event.target.id === 'appleNotesSetup') closeAppleNotesSetup();
  });
  $('#appleNotesForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const noteName = $('#appleNotesName').value.trim();
    const shortcutName = $('#appleNotesShortcut').value.trim();
    if (!noteName || !shortcutName) return;
    appleNotesConfig = { noteName, shortcutName };
    saveAppleNotesConfig();
    renderAppleNotesSetup();
    closeAppleNotesSetup();
    showToast('Apple Notes setup saved');
  });
});
