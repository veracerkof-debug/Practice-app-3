// Трекер на главном экране: чтение Библии и практика из Melete.
// Android: пользователь один раз выбирает «папку Melete», лаунчер читает Data/melete-data.json сам.
// Браузер: файл melete-data.json можно выбрать вручную (обновляется при повторном выборе).
import { state, save } from './store.js';
import { isNative, Launcher } from './native.js';
import { digest, readingToday, practiceWeek, MELETE_DATA_PATH } from './melete.js';

const KEEP_DAYS = 70; // для недели хватает, лишнее не храним

function store(data, source, extra = {}) {
  const d = digest(data);
  const since = Date.now() - KEEP_DAYS * 864e5;
  d.sessions = d.sessions.filter((s) => s.start >= since);
  state.melete = { ...(state.melete || {}), ...extra, source, data: d, readAt: Date.now() };
  save();
}

export async function connectMelete() {
  if (isNative()) {
    const { tree } = await Launcher.pickFolder();
    state.melete = { source: 'folder', tree };
    save();
    await refreshMelete(true);
    return;
  }
  const file = await new Promise((resolve) => {
    const input = Object.assign(document.createElement('input'), { type: 'file', accept: 'application/json,.json' });
    input.addEventListener('change', () => resolve(input.files[0] || null));
    input.click();
  });
  if (!file) throw new Error('cancelled');
  store(JSON.parse(await file.text()), 'file', { fileName: file.name });
}

export async function refreshMelete(throwErrors = false) {
  const m = state.melete;
  if (!isNative() || m?.source !== 'folder' || !m.tree) return false;
  try {
    const { text, modified } = await Launcher.readText({ tree: m.tree, path: MELETE_DATA_PATH });
    if (modified && modified === m.modified) return false;
    store(JSON.parse(text), 'folder', { tree: m.tree, modified });
    return true;
  } catch (e) {
    if (throwErrors) throw e;
    return false;
  }
}

export function disconnectMelete() {
  delete state.melete;
  save();
}

export function trackerData(now = new Date()) {
  const d = state.melete?.data;
  if (!d) return null;
  return {
    reading: d.bible ? readingToday(d.bible, now) : null,
    practice: practiceWeek(d.sessions, d.goal, now),
    readAt: state.melete.readAt,
    source: state.melete.source,
  };
}
