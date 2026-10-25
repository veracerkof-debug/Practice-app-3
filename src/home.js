// Главный экран: статус, часы, дата, строка стиха, список приложений, панель значков.
import { state, appById } from './store.js';
import { renderClock, clockKey, afterClockRender } from './clocks.js';
import { VERSES, verseOfDay, canonicalHour, GREEK_WEEKDAYS, greekNumeral, romanNumeral } from './scripture.js';
import { iconSVG, ORNAMENTS } from './icons.js';
import { SLOT_HEIGHT } from './wallpapers.js';
import { h } from './ui.js';
import { openApp, runAction } from './actions.js';

let root;
let lastKey = null;
let lastClockId = null;
let lastTime = null;
let lastDay = null;
let battery = null;

export const currentVerse = () => VERSES[verseOfDay(new Date(), state.verseOffset)];

export function mountHome(el, { onAppLongPress, onDockLongPress, onVerseTap }) {
  root = el;
  root.handlers = { onAppLongPress, onDockLongPress, onVerseTap };
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
  el.querySelector('.weekday').innerHTML = `<span>${weekday}</span>${echo ? `<em lang="el">${echo}</em>` : ''}`;
  const big = el.querySelector('.daymonth');
  big.textContent = dm;
  big.lang = lang;
  fitText(big);
  const ch = root.querySelector('.canonical');
  if (ch) {
    const c = canonicalHour(now.getHours());
    ch.hidden = !state.canonical;
    ch.innerHTML = `<span lang="el">${c.el}</span> · ${c.ru}`;
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
    h('div', { class: 'clock-wrap', onclick: tapAction('clockTap') }, h('div', { class: 'clock' }), h('div', { class: 'canonical' })),
    h('div', { class: 'date', onclick: tapAction('dateTap') }, h('div', { class: 'weekday' }), h('div', { class: 'daymonth' })),
    h('button', { class: 'subline', onclick: (e) => { e.stopPropagation(); root.handlers.onVerseTap(); } }),
    renderList(),
    h('div', { class: 'spacer' }),
    renderDock(),
  ].filter(Boolean));
  lastKey = null;
  renderStatus();
  updateClock(new Date(), true);
  renderSubline();
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
  const v = currentVerse();
  const dock = h('div', { class: `dock dock-${state.dockStyle}` });
  if (state.dockCaption && state.dockStyle === 'pill' && state.dock.length <= 3) {
    dock.append(h('div', { class: 'dock-cap' }, h('b', { lang: 'el' }, v.el.split(/[,.·;]/)[0]), h('small', {}, v.ref[state.verseLang] || v.ref.ru)));
  }
  const icons = h('div', { class: 'dock-icons' });
  state.dock.forEach((slot, i) => {
    const b = h('button', { class: 'dock-btn', 'aria-label': `Слот ${i + 1}`, html: iconSVG(slot.icon) });
    b.addEventListener('click', () => { if (!b.dataset.suppress) runAction(slot.action); });
    b.longPress = () => root.handlers.onDockLongPress(i);
    icons.append(b);
  });
  dock.append(icons);
  return dock;
}

export function refreshMarkers() {
  root?.querySelectorAll('.app').forEach((b) => {
    const i = +b.dataset.i;
    const m = b.querySelector('.mark');
    if (m) m.textContent = marker(i, appById(state.home[i]?.app));
  });
}
