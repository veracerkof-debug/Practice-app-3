// Панель всех приложений (свайп вверх) и редакторы приложений.
import { state, save, uid } from './store.js';
import { openApp } from './actions.js';
import { h, openSheet, field, toast } from './ui.js';

let drawer, list, search;
let isOpen = false;
export const drawerOpen = () => isOpen;

export function mountDrawer(container, { onChange }) {
  search = h('input', {
    class: 'search', type: 'search', placeholder: 'ζήτει — поиск', autocomplete: 'off', enterkeyhint: 'go',
    oninput: fill,
    onkeydown: (e) => {
      if (e.key === 'Enter') { const first = list.querySelector('.d-app'); first?.click(); }
    },
  });
  list = h('div', { class: 'd-list' });
  drawer = h('div', { class: 'drawer', 'aria-hidden': 'true' },
    h('div', { class: 'd-head' },
      h('button', { class: 'd-grip', 'aria-label': 'Закрыть', onclick: closeDrawer }),
      h('div', { class: 'd-title' }, h('span', { lang: 'el' }, 'πάντα'), h('small', {}, 'все приложения')),
      search),
    list,
    h('button', { class: 'd-add', onclick: () => editApp(null, () => { fill(); onChange(); }) }, '＋ добавить приложение'));
  container.append(drawer);
  drawer.onChange = onChange;

  // закрытие свайпом вниз, когда список прокручен в начало
  let y0 = null;
  drawer.addEventListener('pointerdown', (e) => { y0 = list.scrollTop <= 0 || !list.contains(e.target) ? e.clientY : null; });
  drawer.addEventListener('pointerup', (e) => {
    if (y0 != null && e.clientY - y0 > 80) closeDrawer();
    y0 = null;
  });
  drawer.addEventListener('wheel', (e) => { if (e.deltaY < -40 && list.scrollTop <= 0) closeDrawer(); }, { passive: true });
}

function fill() {
  const q = search.value.trim().toLowerCase();
  const apps = [...state.apps]
    .filter((a) => !q || a.name.toLowerCase().includes(q) || (a.pkg || '').toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  list.replaceChildren();
  let letter = '';
  apps.forEach((a, i) => {
    const L = a.name[0]?.toUpperCase() || '#';
    if (L !== letter && !q) {
      letter = L;
      list.append(h('div', { class: 'd-letter' }, L));
    }
    const btn = h('button', { class: 'd-app', style: { '--d': `${Math.min(i, 14) * 18}ms` } },
      h('span', {}, a.name),
      state.home.some((x) => x.app === a.id) ? h('i', { class: 'd-dot', title: 'на главном' }) : null);
    let timer;
    btn.addEventListener('pointerdown', () => { timer = setTimeout(() => { btn.dataset.lp = '1'; appMenu(a); }, 520); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, () => clearTimeout(timer)));
    btn.addEventListener('contextmenu', (e) => { e.preventDefault(); appMenu(a); });
    btn.addEventListener('click', () => {
      if (btn.dataset.lp) { delete btn.dataset.lp; return; }
      openApp(a);
      closeDrawer();
    });
    list.append(btn);
  });
  if (!apps.length) list.append(h('p', { class: 'empty' }, 'Ничего не найдено. οὐδέν.'));
}

export function openDrawer(focusSearch = false) {
  if (isOpen) return;
  isOpen = true;
  search.value = '';
  fill();
  list.scrollTop = 0;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  if (focusSearch) setTimeout(() => search.focus(), 280);
}

export function closeDrawer() {
  if (!isOpen) return;
  isOpen = false;
  search.blur();
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
}

export function typeIntoSearch(ch) {
  openDrawer(true);
  search.value += ch;
  search.focus();
  fill();
}

function appMenu(app) {
  const onHome = state.home.findIndex((x) => x.app === app.id);
  openSheet({
    title: app.name, kicker: 'ἐπιλογή',
    render(body, close) {
      body.append(
        h('button', { class: 'pick', onclick: () => {
          if (onHome >= 0) state.home.splice(onHome, 1);
          else state.home.push({ app: app.id, label: app.name.toLowerCase() });
          save(); fill(); drawer.onChange(); close();
          toast(onHome >= 0 ? 'Убрано с главного' : 'Добавлено на главный');
        } }, h('span', {}, onHome >= 0 ? 'Убрать с главного' : 'Добавить на главный'), h('small', {}, onHome >= 0 ? 'ἆρον' : 'θές')),
        h('button', { class: 'pick', onclick: () => { close(); editApp(app, () => { fill(); drawer.onChange(); }); } },
          h('span', {}, 'Изменить'), h('small', {}, 'μεταβολή')),
        h('button', { class: 'pick danger', onclick: () => {
          if (!confirm(`Удалить «${app.name}» из списка?`)) return;
          state.apps = state.apps.filter((a) => a.id !== app.id);
          state.home = state.home.filter((x) => x.app !== app.id);
          save(); fill(); drawer.onChange(); close();
        } }, h('span', {}, 'Удалить из списка'), h('small', {}, 'ἄφες')),
      );
    },
  });
}

export function editApp(app, done) {
  const draft = app ? { ...app } : { id: uid(), name: '', pkg: '', url: '' };
  openSheet({
    title: app ? 'Приложение' : 'Новое приложение', kicker: 'ποίησις',
    render(body, close) {
      body.append(
        field('Название', draft.name, (v) => { draft.name = v; }, { placeholder: 'Телефон' }),
        field('Пакет Android', draft.pkg, (v) => { draft.pkg = v; }, { placeholder: 'org.telegram.messenger', autocapitalize: 'off' }),
        field('Ссылка для веба / схема', draft.url, (v) => { draft.url = v; }, { placeholder: 'https://…  tel:  intent:#Intent;…', autocapitalize: 'off' }),
        h('p', { class: 'hint' }, 'В Android-сборке приложение запускается по имени пакета. В браузере — по ссылке.'),
        h('button', { class: 'btn primary', onclick: () => {
          if (!draft.name.trim()) return toast('Нужно название');
          draft.name = draft.name.trim();
          const i = state.apps.findIndex((a) => a.id === draft.id);
          if (i >= 0) state.apps[i] = draft; else state.apps.push(draft);
          save(); close(); done?.();
        } }, 'Сохранить · γένοιτο'),
      );
    },
  });
}
