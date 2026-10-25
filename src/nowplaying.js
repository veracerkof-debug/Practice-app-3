// Строка плеера: что играет в любом приложении и пауза. Данные — из медиасессий Android
// (нужен доступ к уведомлениям). В браузере чужое воспроизведение не видно — строка скрыта.
import { isNative, Launcher } from './native.js';

let media = { access: null, active: false };
const listeners = new Set();
let timer = null;

export const nowPlaying = () => media;
export const onNowPlaying = (fn) => listeners.add(fn);

async function poll() {
  try {
    const next = await Launcher.mediaState();
    const changed = JSON.stringify(next) !== JSON.stringify(media);
    media = next;
    if (changed) listeners.forEach((fn) => fn(media));
  } catch { /* плагин недоступен */ }
}

export function startNowPlaying() {
  if (!isNative() || timer) return;
  poll();
  timer = setInterval(() => { if (!document.hidden) poll(); }, 2000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
}

export async function togglePlayback() {
  try { await Launcher.mediaCommand({ cmd: 'toggle' }); } catch { /* нет сессии */ }
  // оптимистично меняем значок, потом уточняем
  media = { ...media, playing: !media.playing };
  listeners.forEach((fn) => fn(media));
  setTimeout(poll, 400);
}

export const openMediaAccess = () => Launcher.openMediaAccess().catch(() => {});
