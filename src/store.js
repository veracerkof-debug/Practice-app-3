// Состояние лаунчера: всё хранится в localStorage и экспортируется в JSON.

const KEY = 'launcher.v1';
const OLD_KEY = 'melete.v1';

// pkg — имя пакета Android (для нативной сборки), url — ссылка / схема для веба.
export const DEFAULT_APPS = [
  { id: 'phone', name: 'Телефон', pkg: 'com.google.android.dialer', url: 'tel:' },
  { id: 'sms', name: 'Сообщения', pkg: 'com.google.android.apps.messaging', url: 'sms:' },
  { id: 'camera', name: 'Камера', pkg: '', url: 'intent:#Intent;action=android.media.action.STILL_IMAGE_CAMERA;end' },
  { id: 'photos', name: 'Фото', pkg: 'com.google.android.apps.photos', url: 'https://photos.google.com' },
  { id: 'telegram', name: 'Telegram', pkg: 'org.telegram.messenger', url: 'https://web.telegram.org' },
  { id: 'whatsapp', name: 'WhatsApp', pkg: 'com.whatsapp', url: 'https://web.whatsapp.com' },
  { id: 'bible', name: 'Библия', pkg: 'com.sirma.mobile.bible.android', url: 'https://www.bible.com/ru' },
  { id: 'music', name: 'Музыка', pkg: 'com.google.android.apps.youtube.music', url: 'https://music.youtube.com' },
  { id: 'youtube', name: 'YouTube', pkg: 'com.google.android.youtube', url: 'https://www.youtube.com' },
  { id: 'maps', name: 'Карты', pkg: 'com.google.android.apps.maps', url: 'https://maps.google.com' },
  { id: 'mail', name: 'Почта', pkg: 'com.google.android.gm', url: 'https://mail.google.com' },
  { id: 'calendar', name: 'Календарь', pkg: 'com.google.android.calendar', url: 'https://calendar.google.com' },
  { id: 'notes', name: 'Заметки', pkg: 'com.google.android.keep', url: 'https://keep.google.com' },
  { id: 'browser', name: 'Браузер', pkg: 'com.android.chrome', url: 'https://duckduckgo.com' },
  { id: 'clock', name: 'Будильник', pkg: 'com.google.android.deskclock', url: 'intent:#Intent;action=android.intent.action.SET_ALARM;end' },
  { id: 'settings', name: 'Настройки', pkg: 'com.android.settings', url: 'intent:#Intent;action=android.settings.SETTINGS;end' },
];

export const DEFAULTS = {
  theme: 'light',            // light | dark | parchment | auto
  font: 'commissioner',      // commissioner | garamond | manrope | mono
  clock: 'tablet',           // tablet | codex | greek | sundial | word
  hour12: false,
  canonical: true,           // литургический час под часами
  dateLang: 'ru',            // ru | en | el
  greekEcho: true,           // греческий день недели рядом
  showStatus: true,
  subline: 'verse',          // verse | note | hour | none
  note: '',
  verseLang: 'ru',           // ru | en
  verseOffset: 0,
  align: 'right',            // left | center | right
  size: 'm',                 // s | m | l
  marker: 'greek',           // greek | roman | count | none
  ornament: 'none',          // фоновый символ, см. ORNAMENTS
  wallpaper: 'none',         // живые обои: none | hands | planet | sun
  intro: true,
  dockStyle: 'icons',        // icons | line | none
  player: true,              // строка плеера над значками (Android)
  tracker: true,             // трекер чтения и практики (Melete)
  place: null,               // { lat, lon } для восхода и заката
  apps: DEFAULT_APPS,
  home: [
    { app: 'bible', label: 'book · βίβλος' },
    { app: 'phone', label: 'voice · φωνή' },
    { app: 'telegram', label: 'letters · ἐπιστολή' },
    { app: 'music', label: 'psalms · ψαλμοί' },
    { app: 'maps', label: 'way · ὁδός' },
    { app: 'camera', label: 'light · φῶς' },
  ],
  dock: [
    { icon: 'trumpet', action: { t: 'app', id: 'phone' } },
    { icon: 'scroll', action: { t: 'app', id: 'sms' } },
    { icon: 'lamp', action: { t: 'cmd', id: 'search' } },
    { icon: 'eye', action: { t: 'app', id: 'camera' } },
    { icon: 'key', action: { t: 'cmd', id: 'settings' } },
  ],
  gestures: {
    swipeUp: { t: 'cmd', id: 'drawer' },
    swipeDown: { t: 'cmd', id: 'search' },
    swipeLeft: { t: 'cmd', id: 'verseNext' },
    swipeRight: { t: 'cmd', id: 'clock' },
    doubleTap: { t: 'cmd', id: 'sabbath' },
    longPress: { t: 'cmd', id: 'settings' },
    clockTap: { t: 'app', id: 'clock' },
    dateTap: { t: 'app', id: 'calendar' },
  },
  usage: {},
};

const clone = (o) => JSON.parse(JSON.stringify(o));

function load() {
  try {
    let raw = localStorage.getItem(KEY);
    let saved;
    if (raw) saved = JSON.parse(raw);
    else {
      // настройки из первой версии: переносим, фон по умолчанию — без символа
      raw = localStorage.getItem(OLD_KEY);
      if (!raw) return clone(DEFAULTS);
      saved = { ...JSON.parse(raw), ornament: 'none' };
    }
    if (saved.dockStyle === 'pill') saved.dockStyle = 'icons'; // капсулы больше нет
    return { ...clone(DEFAULTS), ...saved, gestures: { ...clone(DEFAULTS.gestures), ...(saved.gestures || {}) } };
  } catch {
    return clone(DEFAULTS);
  }
}

export const state = load();
const listeners = new Set();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* приватный режим */ }
  listeners.forEach((fn) => fn(state));
}

export function set(patch) {
  Object.assign(state, patch);
  save();
}

export const subscribe = (fn) => listeners.add(fn);

export function reset() {
  const fresh = clone(DEFAULTS);
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, fresh);
  save();
}

export function importState(obj) {
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.apps)) throw new Error('bad file');
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, clone(DEFAULTS), obj);
  save();
}

export const appById = (id) => state.apps.find((a) => a.id === id);

export const uid = () => Math.random().toString(36).slice(2, 9);
