// Главный экран: статус, часы, дата, строка стиха, список приложений, трекер, плеер, значки.
import { state, appById } from './store.js';
import { renderClock, clockKey, afterClockRender } from './clocks.js';
import { VERSES, verseOfDay, canonicalHour, GREEK_WEEKDAYS, greekNumeral, romanNumeral } from './scripture.js';
import { iconSVG, ORNAMENTS } from './icons.js';
import { SLOT_HEIGHT } from './wallpapers.js';
import { h } from './ui.js';
import { openApp, openUrl, runAction } from './actions.js';
import { explain, canonicalEntry, biblicalEntry, greekWeekEntry } from './explain.js';
import { biblicalTime, placeOf } from './sun.js';
import { nowPlaying, togglePlayback, openMediaAccess } from './nowplaying.js';
import { isNative } from './native.js';
import { trackerData } from './tracker.js';
import { MELETE_PACKAGE, fmtDur } from './melete.js';

let root;
let lastKey = null;
let lastClockId = null;
let lastTime = null;
let lastDay = null;
let battery = null;

export const currentVerse = () => VERSES[verseOfDay(new Date(), state.verseOffset)];

export function mountHome(el, { onAppLongPress, onDockLongPress, onVerseTap, onTrackerSetup }) {
  root = el;
  root.handlers = { onAppLongPress, onDockLongPress, onVerseTap, onTrackerSetup };
  if (navigator.getBattery) {
    navigator.getBattery().then((b) => {
      battery = b;
      b.addEventListener('levelchange', renderStatus);
      b.addEventListener('chargingchange', renderStatus);
      renderStatus();
    }).catch(() => {});
  }
  window.addEventListener('online', renderStatus);
  window.addEventListener('offline', renderStatus);
  renderHome();
  tick();
}

function tick() {
  const now = new Date();
  updateClock(now);
  setTimeout(tick, 1000 - now.getMilliseconds() + 5);
}

function updateClock(now, force = false) {
  const t = clockKey(now, state);
  const sig = `${t}|${state.clock}|${state.dateLang}`;
  if (!force && sig === lastKey) return;
  const clockEl = root.querySelector('.clock');
  if (!clockEl) return;
  const prev = !force && lastClockId === state.clock ? lastTime : null;
  clockEl.innerHTML = renderClock(state.clock, now, state, prev);
  clockEl.dataset.style = state.clock;
  // «Без часов» + живые обои: оставляем место, обои рисуют время в нём
  const slot = state.clock === 'none' ? SLOT_HEIGHT[state.wallpaper] : 0;
  clockEl.style.height = slot ? `${slot}px` : '';
  clockEl.parentElement.classList.toggle('empty', state.clock === 'none' && !slot);
  afterClockRender(clockEl);
  lastKey = sig;
  lastTime = t;
  lastClockId = state.clock;
  renderDate(now);
  const day = now.toDateString();
  if (day !== lastDay) {
    lastDay = day;
    renderSubline();
  }
  // трекер пересчитываем раз в минуту: смена дня плана, новая неделя
  const tr = root.querySelector('.tracker');
  if (tr) tr.replaceWith(renderTracker() || h('div'));
}

function renderStatus() {
  const el = root?.querySelector('.status');
  if (!el) return;
  el.hidden = !state.showStatus;
  const online = navigator.onLine;
  const wifi = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="${online ? '' : 'off'}"><path d="M2.5 8.5a14 14 0 0 1 19 0L12 20z"/>${online ? '' : '<path d="M4 4l16 16"/>'}</svg>`;
  const pct = battery ? Math.round(battery.level * 100) : null;
  const level = battery ? battery.level : 1;
  const bat = `<svg viewBox="0 0 30 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1" y="1.5" width="24" height="13" rx="2.5" opacity=".45"/><rect x="3" y="3.5" width="${Math.max(1.5, 20 * level).toFixed(1)}" height="9" rx="1" fill="currentColor" stroke="none"/><path d="M28 6v4" stroke-linecap="round" opacity=".45"/></svg>`;
  el.innerHTML = `${wifi}<i></i><span>${pct != null ? pct + '%' : '—'}${battery?.charging ? ' ⚡︎' : ''}</span><i></i>${bat}`;
}

function renderDate(now) {
  const el = root.querySelector('.date');
  if (!el) return;
  const lang = state.dateLang;
  const loc = lang === 'el' ? 'el-GR' : lang === 'en' ? 'en-GB' : 'ru-RU';
  const weekday = new Intl.DateTimeFormat(loc, { weekday: 'long' }).format(now);
  const dm = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long' }).format(now);
  const echo = state.greekEcho && lang !== 'el' ? GREEK_WEEKDAYS[now.getDay()] : '';
  const wd = el.querySelector('.weekday');
  wd.replaceChildren(h('span', {}, weekday));
  if (echo) {
    // греческое название дня — нажатие объясняет, что оно значит
    const day = now.getDay();
    wd.append(h('button', { class: 'echo', lang: 'el', onclick: (e) => { e.stopPropagation(); explain(greekWeekEntry(day)); } }, echo));
  }
  const big = el.querySelector('.daymonth');
  big.textContent = dm;
  big.lang = lang;
  fitText(big);
  const ch = root.querySelector('.canonical');
  if (ch) {
    if (state.clock === 'biblical') {
      // для ветхозаветных часов — часть дня словами Писания
      const b = biblicalTime(now, placeOf(state));
      ch.hidden = false;
      ch.replaceChildren(h('span', {}, b.part.ru), ` · ${b.prayer ? b.prayer.ru : b.part.ref}`);
      ch.onclick = (e) => { e.stopPropagation(); explain(biblicalEntry(biblicalTime(new Date(), placeOf(state)), placeOf(state))); };
    } else {
      const c = canonicalHour(now.getHours());
      ch.hidden = !state.canonical;
      ch.replaceChildren(h('span', { lang: 'el' }, c.el), ` · ${c.ru}`);
      ch.onclick = (e) => { e.stopPropagation(); explain(canonicalEntry(new Date())); };
    }
  }
}

function fitText(el) {
  el.style.fontSize = '';
  const max = parseFloat(getComputedStyle(el).fontSize);
  const avail = el.parentElement.clientWidth;
  if (!avail) return;
  let size = max;
  while (el.scrollWidth > avail && size > 18) {
    size -= 2;
    el.style.fontSize = size + 'px';
  }
}

export function renderSubline() {
  const el = root?.querySelector('.subline');
  if (!el) return;
  el.hidden = state.subline === 'none';
  el.replaceChildren();
  if (state.subline === 'verse') {
    const v = currentVerse();
    el.append(h('span', { class: 'ref' }, v.ref[state.verseLang] || v.ref.ru), h('i'), h('span', { class: 'txt' }, v[state.verseLang] || v.ru));
  } else if (state.subline === 'note') {
    el.append(h('span', { class: 'txt' }, state.note || 'Заметка — задайте в настройках'));
  } else if (state.subline === 'hour') {
    const v = currentVerse();
    el.append(h('span', { class: 'txt', lang: 'el' }, v.el));
  }
}

function marker(i, app) {
  switch (state.marker) {
    case 'greek': return greekNumeral(i + 1);
    case 'roman': return romanNumeral(i + 1);
    case 'count': return `×${state.usage[app?.id] || 0}`;
    default: return '';
  }
}

export function renderHome() {
  if (!root) return;
  const orn = ORNAMENTS[state.ornament];
  root.className = `home align-${state.align} size-${state.size}`;
  root.replaceChildren(...[
    orn?.icon ? h('div', { class: `ornament orn-${state.ornament}`, 'aria-hidden': 'true', html: iconSVG(orn.icon) }) : null,
    h('div', { class: 'status', 'aria-label': 'Статус' }),
    h('div', { class: 'clock-wrap', onclick: tapAction('clockTap') }, h('div', { class: 'clock' }), h('button', { class: 'canonical' })),
    h('div', { class: 'date', onclick: tapAction('dateTap') }, h('div', { class: 'weekday' }), h('div', { class: 'daymonth' })),
    h('button', { class: 'subline', onclick: (e) => { e.stopPropagation(); root.handlers.onVerseTap(); } }),
    renderList(),
    h('div', { class: 'spacer' }),
    renderTracker(),
    h('div', { class: 'player', hidden: true }),
    renderDock(),
  ].filter(Boolean));
  lastKey = null;
  renderStatus();
  updateClock(new Date(), true);
  renderSubline();
  renderPlayer();
}

// нажатие на часы / дату (как в Olauncher: часы → будильник, дата → календарь)
const tapAction = (gesture) => (e) => {
  if (e.currentTarget.dataset.suppress) return;
  runAction(state.gestures[gesture]);
};

function renderList() {
  const list = h('nav', { class: 'apps', 'aria-label': 'Избранные приложения' });
  state.home.forEach((item, i) => {
    const app = appById(item.app);
    const btn = h('button', { class: 'app', 'data-i': i, style: { '--d': `${i * 55}ms` } },
      h('span', { class: 'label' }, item.label || app?.name || '—'),
      state.marker !== 'none' ? h('span', { class: 'mark' }, marker(i, app)) : null);
    btn.addEventListener('click', () => {
      if (btn.dataset.suppress) return;
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 500);
      openApp(app);
    });
    btn.longPress = () => root.handlers.onAppLongPress(i);
    list.append(btn);
  });
  if (!state.home.length) list.append(h('p', { class: 'empty' }, 'Пусто. Удерживайте экран → настройки, чтобы добавить приложения.'));
  return list;
}

function renderDock() {
  if (state.dockStyle === 'none' || !state.dock.length) return h('div', { class: 'dock-gap' });
  // только значки: без капсулы и подписей
  const dock = h('div', { class: `dock dock-${state.dockStyle}` });
  state.dock.forEach((slot, i) => {
    const b = h('button', { class: 'dock-btn', 'aria-label': `Слот ${i + 1}`, html: iconSVG(slot.icon) });
    b.addEventListener('click', () => { if (!b.dataset.suppress) runAction(slot.action); });
    b.longPress = () => root.handlers.onDockLongPress(i);
    dock.append(b);
  });
  return dock;
}

// — Строка плеера: что играет и пауза —
const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5.5" width="3.4" height="13" rx="1"/><rect x="13.6" y="5.5" width="3.4" height="13" rx="1"/></svg>';

export function renderPlayer() {
  const el = root?.querySelector('.player');
  if (!el) return;
  const m = nowPlaying();
  el.replaceChildren();
  if (!state.player || !isNative()) { el.hidden = true; return; }
  if (m.access === false) {
    // доступа к медиасессиям ещё нет — одна строка-приглашение
    el.hidden = false;
    el.append(h('button', { class: 'pl-info pl-ask', onclick: openMediaAccess }, h('span', {}, 'Плеер · разрешить доступ к уведомлениям')));
    return;
  }
  if (!m.active || (!m.title && !m.app)) { el.hidden = true; return; }
  el.hidden = false;
  const btn = h('button', { class: `pl-btn ${m.playing ? 'on' : ''}`, 'aria-label': m.playing ? 'Пауза' : 'Играть', html: m.playing ? PAUSE : PLAY, onclick: togglePlayback });
  const text = [m.title, m.artist].filter(Boolean).join(' — ') || m.app;
  const info = h('button', { class: 'pl-info', onclick: () => m.pkg && openApp({ id: '_media', name: m.app || m.pkg, pkg: m.pkg }) },
    h('span', { class: 'pl-t' }, text), m.app ? h('small', {}, m.app) : null);
  el.append(btn, info);
}

// — Трекер: чтение Библии и практика из Melete —
function renderTracker() {
  if (!state.tracker) return null;
  const t = trackerData();
  const wrap = h('div', { class: 'tracker' });
  const openMelete = () => (isNative()
    ? openApp({ id: '_melete', name: 'Melete', pkg: MELETE_PACKAGE, url: '' })
    : openUrl('https://veracerkof-debug.github.io/melete-app/', 'Melete'));
  const row = (k, v, m, frac, onclick) => {
    const r = h('button', { class: 'tr-row', onclick: (e) => { if (!e.currentTarget.dataset.suppress) onclick(); } },
      h('span', { class: 'tr-k' }, k), h('span', { class: 'tr-v' }, v), h('span', { class: 'tr-m' }, m),
      frac != null ? h('i', { class: 'tr-bar' }, h('u', { style: { width: `${Math.min(100, frac * 100).toFixed(0)}%` } })) : null);
    r.longPress = () => root.handlers.onTrackerSetup();
    return r;
  };
  if (!t) {
    wrap.append(row('Чтение · практика', 'подключить Melete', '', null, () => root.handlers.onTrackerSetup()));
    return wrap;
  }
  const rd = t.reading;
  if (!rd) wrap.append(row('Чтение', 'план не выбран', 'в Melete', null, openMelete));
  else if (rd.finished) wrap.append(row('Чтение', rd.plan, 'план прочитан', 1, openMelete));
  else if (rd.day < 1) wrap.append(row('Чтение', rd.plan, 'ещё не начат', 0, openMelete));
  else wrap.append(row('Чтение', rd.ref, `${rd.done}/${rd.total} · день ${rd.day}`, rd.total ? rd.done / rd.total : 0, openMelete));
  const p = t.practice;
  wrap.append(row('Практика', fmtDur(p.total), `из ${fmtDur(p.goal)} · неделя`, p.progress, openMelete));
  return wrap;
}

export function refreshMarkers() {
  root?.querySelectorAll('.app').forEach((b) => {
    const i = +b.dataset.i;
    const m = b.querySelector('.mark');
    if (m) m.textContent = marker(i, appById(state.home[i]?.app));
  });
}
