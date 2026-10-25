import '@fontsource/commissioner/300.css';
import '@fontsource/commissioner/400.css';
import '@fontsource/commissioner/500.css';
import '@fontsource/commissioner/700.css';
import '@fontsource/commissioner/900.css';
import '@fontsource/eb-garamond/400.css';
import '@fontsource/eb-garamond/500.css';
import '@fontsource/eb-garamond/400-italic.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/600.css';
import '@fontsource/jetbrains-mono/400.css';
import './style.css';

import { state, set, subscribe } from './store.js';
import { mountHome, renderHome, renderSubline, currentVerse, refreshMarkers, renderPlayer } from './home.js';
import { attachGestures } from './gestures.js';
import { mountDrawer, openDrawer, closeDrawer, drawerOpen, typeIntoSearch } from './drawer.js';
import { openSettings, editHomeItem, editDockSlot, THEMES } from './settings.js';
import { registerCommand, runAction, setToast, openUrl } from './actions.js';
import { CLOCKS } from './clocks.js';
import { VERSES } from './scripture.js';
import { iconSVG } from './icons.js';
import { mountWallpaper } from './wallpapers.js';
import { h, toast, openSheet, sheetOpen, closeTopSheet } from './ui.js';
import { startNowPlaying, onNowPlaying } from './nowplaying.js';
import { refreshMelete } from './tracker.js';
import { openTrackerSheet } from './trackersheet.js';
import { verseLinks } from './explain.js';

const app = document.querySelector('#app');
const home = h('main', { class: 'home' });
app.append(home);
// фокус в поле ввода может прокрутить контейнер с overflow: hidden — возвращаем на место
app.addEventListener('scroll', () => { app.scrollTop = 0; app.scrollLeft = 0; });

// — Тема и шрифт —
const media = window.matchMedia('(prefers-color-scheme: dark)');
function applyLook() {
  const theme = state.theme === 'auto' ? (media.matches ? 'dark' : 'light') : state.theme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.font = state.font;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
}
media.addEventListener('change', applyLook);

const refresh = () => { applyLook(); renderHome(); };
setToast(toast);

// — Покой: тихий экран —
let sabbath = null;
function openSabbath() {
  if (sabbath) return;
  const v = VERSES.find((x) => x.el.startsWith('Σιώπα'));
  const time = h('div', { class: 'sb-time' });
  const upd = () => { const d = new Date(); time.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  upd();
  const timer = setInterval(upd, 5000);
  sabbath = h('div', { class: 'sabbath', role: 'dialog', 'aria-label': 'Покой' },
    h('div', { class: 'sb-flame', html: '<svg viewBox="0 0 40 80"><defs><radialGradient id="fg" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#fff6d8"/><stop offset=".5" stop-color="#f3c46b"/><stop offset="1" stop-color="#c47a2c" stop-opacity="0"/></radialGradient></defs><path class="fl" d="M20 6C14 22 9 30 9 42a11 11 0 0 0 22 0C31 30 26 22 20 6z" fill="url(#fg)"/><rect x="17" y="54" width="6" height="26" rx="1" fill="#e8e2d4" opacity=".85"/></svg>' }),
    time,
    h('p', { class: 'sb-el', lang: 'el' }, v.el),
    h('p', { class: 'sb-ru' }, `${v.ru} · ${v.ref.ru}`),
    h('small', {}, 'коснитесь, чтобы вернуться'));
  sabbath.addEventListener('click', () => {
    clearInterval(timer);
    sabbath.classList.remove('show');
    const el = sabbath;
    sabbath = null;
    setTimeout(() => el.remove(), 600);
  });
  app.append(sabbath);
  requestAnimationFrame(() => sabbath.classList.add('show'));
}

// — Стих дня —
function openVerse() {
  openSheet({
    title: 'Слово дня', kicker: 'ἀνάγνωσις',
    render(body, close, rerender) {
      const v = currentVerse();
      body.append(
        h('div', { class: 'verse-card' },
          h('div', { class: 'verse-orn', html: iconSVG('chirho') }),
          h('p', { class: 'v-el', lang: 'el' }, v.el),
          h('p', { class: 'v-ru' }, v.ru),
          h('p', { class: 'v-en', lang: 'en' }, v.en),
          h('div', { class: 'v-ref' }, `${v.ref.ru} · ${v.ref.en}`)),
        h('div', { class: 'ex-links' }, ...verseLinks(v).map((l) => h('button', { class: 'ex-link', onclick: () => openUrl(l.url, l.ru) }, h('span', {}, l.ru), h('small', {}, l.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0])))),
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn', onclick: () => { set({ verseOffset: state.verseOffset - 1 }); renderHome(); rerender(); } }, '←'),
          h('button', { class: 'btn', onclick: () => { set({ verseOffset: 0 }); renderHome(); rerender(); } }, 'сегодня'),
          h('button', { class: 'btn', onclick: () => { set({ verseOffset: state.verseOffset + 1 }); renderHome(); rerender(); } }, '→')),
      );
    },
  });
}

// — Команды —
registerCommand('drawer', () => openDrawer(false));
registerCommand('search', () => openDrawer(true));
registerCommand('settings', () => openSettings(refresh));
registerCommand('verseNext', () => {
  set({ verseOffset: state.verseOffset + 1 });
  const sub = home.querySelector('.subline');
  sub?.classList.add('swap');
  setTimeout(() => { renderHome(); }, 180);
});
registerCommand('verseOpen', openVerse);
registerCommand('theme', () => {
  const order = THEMES.map((t) => t.value).filter((t) => t !== 'auto');
  const next = order[(order.indexOf(state.theme) + 1) % order.length];
  set({ theme: next });
  applyLook();
  toast(next === 'dark' ? 'σκότος · тьма' : next === 'light' ? 'φῶς · свет' : 'πάπυρος · пергамент');
});
registerCommand('clock', () => {
  const i = CLOCKS.findIndex((c) => c.id === state.clock);
  const next = CLOCKS[(i + 1) % CLOCKS.length];
  set({ clock: next.id });
  renderHome();
  toast(`${next.el} · ${next.ru}`);
});
registerCommand('sabbath', openSabbath);
registerCommand('fullscreen', () => {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else document.documentElement.requestFullscreen?.().catch(() => toast('Полный экран недоступен'));
});
registerCommand('none', () => {});

// — Сборка —
mountWallpaper(app, () => ({ id: state.wallpaper, full: state.clock === 'none' }));

mountHome(home, {
  onAppLongPress: (i) => editHomeItem(i, null, refresh),
  onDockLongPress: (i) => editDockSlot(i, refresh),
  onVerseTap: openVerse,
  onTrackerSetup: () => openTrackerSheet(renderHome),
});

// плеер и Melete (Android): опрос состояния, свежие данные при возвращении на экран
onNowPlaying(renderPlayer);
startNowPlaying();
const syncMelete = () => refreshMelete().then((changed) => { if (changed) renderHome(); });
syncMelete();
setInterval(() => { if (!document.hidden) syncMelete(); }, 5 * 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) syncMelete(); });
mountDrawer(app, { onChange: renderHome });

const blocked = () => sheetOpen() || drawerOpen() || !!sabbath;
attachGestures(home, {
  isBlocked: blocked,
  onGesture: (g) => runAction(state.gestures[g]),
});

subscribe(() => refreshMarkers());

// — Клавиатура (веб-версия) —
const KEYS = { ArrowUp: 'swipeUp', ArrowDown: 'swipeDown', ArrowLeft: 'swipeLeft', ArrowRight: 'swipeRight' };
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (sabbath) return sabbath.click();
    if (closeTopSheet()) return;
    if (drawerOpen()) return closeDrawer();
  }
  if (blocked() || e.metaKey || e.ctrlKey || e.altKey) return;
  if (KEYS[e.key]) { e.preventDefault(); runAction(state.gestures[KEYS[e.key]]); return; }
  if (e.key.length === 1 && /\S/.test(e.key)) { e.preventDefault(); typeIntoSearch(e.key); }
});

// Android «назад» через history: закрываем листы и панель
history.replaceState({ root: true }, '');
window.addEventListener('popstate', () => {
  let handled = true;
  if (sabbath) sabbath.click();
  else if (!closeTopSheet()) {
    if (drawerOpen()) closeDrawer();
    else handled = false;
  }
  if (handled) history.pushState({}, '');
});
history.pushState({}, '');

applyLook();

// — Вступление: «Да будет свет» —
if (state.intro && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const intro = h('div', { class: 'intro', 'aria-hidden': 'true' },
    h('div', { class: 'intro-light' }),
    h('p', { lang: 'el' }, 'Γενηθήτω φῶς'),
    h('small', {}, 'Да будет свет'));
  app.append(intro);
  home.classList.add('pre');
  setTimeout(() => intro.classList.add('go'), 900);
  setTimeout(() => home.classList.remove('pre'), 1150);
  setTimeout(() => intro.remove(), 2100);
}

// перерисовка при смене размеров (подгонка даты)
let rz;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(renderHome, 150); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) renderSubline(); });
