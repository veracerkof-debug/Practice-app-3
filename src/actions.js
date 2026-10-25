// База действий: открыть приложение, выполнить команду, перейти по ссылке / deep link.
import { Capacitor } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { state, save, appById } from './store.js';

export const COMMANDS = [
  { id: 'drawer', ru: 'Все приложения', el: 'πάντα' },
  { id: 'search', ru: 'Поиск', el: 'ζήτει' },
  { id: 'settings', ru: 'Настройки', el: 'τάξις' },
  { id: 'verseNext', ru: 'Следующий стих', el: 'λόγος' },
  { id: 'verseOpen', ru: 'Открыть стих дня', el: 'ἀνάγνωσις' },
  { id: 'theme', ru: 'Свет / тьма', el: 'φῶς καὶ σκότος' },
  { id: 'clock', ru: 'Сменить часы', el: 'ὥρα' },
  { id: 'sabbath', ru: 'Покой — тихий экран', el: 'ἀνάπαυσις' },
  { id: 'fullscreen', ru: 'Полный экран', el: 'πλήρωμα' },
  { id: 'none', ru: 'Ничего', el: 'οὐδέν' },
];

// Шаблоны действий внутри приложений. Значение можно отредактировать при выборе.
export const LINK_PRESETS = [
  { ru: 'Позвонить', url: 'tel:+7' },
  { ru: 'Написать SMS', url: 'sms:+7' },
  { ru: 'Новое письмо', url: 'mailto:' },
  { ru: 'Telegram — чат', url: 'https://t.me/username' },
  { ru: 'WhatsApp — чат', url: 'https://wa.me/79990000000' },
  { ru: 'Маршрут', url: 'https://www.google.com/maps/dir/?api=1&destination=' },
  { ru: 'Поиск в YouTube', url: 'https://www.youtube.com/results?search_query=' },
  { ru: 'Стих дня (bible.com)', url: 'https://www.bible.com/verse-of-the-day' },
  { ru: 'Поставить будильник', url: 'intent:#Intent;action=android.intent.action.SET_ALARM;end' },
  { ru: 'Таймер', url: 'intent:#Intent;action=android.intent.action.SET_TIMER;end' },
  { ru: 'Камера — фото', url: 'intent:#Intent;action=android.media.action.STILL_IMAGE_CAMERA;end' },
  { ru: 'Камера — видео', url: 'intent:#Intent;action=android.media.action.VIDEO_CAMERA;end' },
  { ru: 'Настройки Wi-Fi', url: 'intent:#Intent;action=android.settings.WIFI_SETTINGS;end' },
  { ru: 'Настройки Bluetooth', url: 'intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end' },
];

const handlers = {};
export const registerCommand = (id, fn) => { handlers[id] = fn; };

let toastFn = () => {};
export const setToast = (fn) => { toastFn = fn; };

export function describeAction(a) {
  if (!a) return { ru: 'Ничего', el: 'οὐδέν' };
  if (a.t === 'app') {
    const app = appById(a.id);
    return { ru: app ? app.name : 'Приложение удалено', el: 'ἄνοιγε' };
  }
  if (a.t === 'cmd') return COMMANDS.find((c) => c.id === a.id) || COMMANDS.at(-1);
  if (a.t === 'url') return { ru: a.name || a.url, el: 'ὁδός' };
  return { ru: 'Ничего', el: 'οὐδέν' };
}

export async function runAction(a) {
  if (!a) return;
  if (a.t === 'cmd') return handlers[a.id]?.();
  if (a.t === 'app') return openApp(appById(a.id));
  if (a.t === 'url') return openUrl(a.url);
}

const isNative = () => Capacitor.isNativePlatform();

export async function openApp(app) {
  if (!app) return toastFn('Приложение не найдено');
  state.usage[app.id] = (state.usage[app.id] || 0) + 1;
  save();
  if (isNative() && app.pkg) {
    try {
      await AppLauncher.openUrl({ url: app.pkg });
      return;
    } catch { /* пробуем ссылку */ }
  }
  if (app.url) return openUrl(app.url, app.name);
  toastFn(`${app.name}: нет ссылки для веба`);
}

export async function openUrl(url, label) {
  if (!url) return;
  toastFn(`ἄνοιγε · ${label || url.replace(/^https?:\/\//, '').slice(0, 32)}`);
  if (isNative()) {
    try { await AppLauncher.openUrl({ url }); return; } catch { /* fallthrough */ }
  }
  if (/^https?:/i.test(url)) {
    window.open(url, '_blank', 'noopener');
  } else {
    // tel:, sms:, mailto:, intent:, tg:, spotify: — отдаём системе
    window.location.href = url;
  }
}
