// Настройки: часы, вид, дата, главный экран, панель значков, жесты, данные.
import { state, save, set, reset, importState, appById } from './store.js';
import { CLOCKS, renderClock } from './clocks.js';
import { ORNAMENTS, iconSVG } from './icons.js';
import { GESTURES } from './gestures.js';
import { describeAction } from './actions.js';
import { pickIcon, pickAction } from './pickers.js';
import { h, openSheet, segmented, toggle, field, section, toast } from './ui.js';

export const THEMES = [
  { value: 'light', label: 'Свет' },
  { value: 'dark', label: 'Тьма' },
  { value: 'parchment', label: 'Пергамент' },
  { value: 'auto', label: 'Авто' },
];

export const FONTS = [
  { value: 'commissioner', label: 'Commissioner', sample: 'Слово · λόγος' },
  { value: 'garamond', label: 'EB Garamond', sample: 'Слово · λόγος' },
  { value: 'manrope', label: 'Manrope', sample: 'Слово · λόγος' },
  { value: 'mono', label: 'JetBrains Mono', sample: 'Слово · λόγος' },
];

let changed = () => {};

export function openSettings(onChange) {
  changed = onChange;
  openSheet({
    title: 'Настройки', kicker: 'τάξις', full: true,
    render(body, _close, rerender) {
      const up = (patch) => { set(patch); changed(); rerender(); };
      const keepScroll = (fn) => () => { const y = body.parentElement.scrollTop; fn(); requestAnimationFrame(() => { body.parentElement.scrollTop = y; }); };

      // — Часы —
      const now = new Date();
      const clocks = h('div', { class: 'clock-picks' });
      CLOCKS.forEach((c) => clocks.append(h('button', {
        class: `clock-pick ${state.clock === c.id ? 'on' : ''}`,
        onclick: keepScroll(() => up({ clock: c.id })),
      }, h('div', { class: 'clock-mini clock', 'data-style': c.id, html: renderClock(c.id, now, state) }),
      h('span', {}, c.ru), h('small', { lang: 'el' }, c.el))));
      body.append(section('Часы', 'ὡρολόγιον',
        clocks,
        toggle('12-часовой формат', state.hour12, (v) => up({ hour12: v })),
        toggle('Литургический час', state.canonical, (v) => up({ canonical: v }), 'Утреня, Час третий, Вечерня…'),
      ));

      // — Вид —
      const fonts = h('div', { class: 'font-picks' });
      FONTS.forEach((f) => fonts.append(h('button', {
        class: `font-pick font-${f.value} ${state.font === f.value ? 'on' : ''}`,
        onclick: keepScroll(() => up({ font: f.value })),
      }, h('b', {}, f.sample), h('small', {}, f.label))));
      const orns = h('div', { class: 'orn-picks' });
      Object.entries(ORNAMENTS).forEach(([id, o]) => orns.append(h('button', {
        class: `orn-pick ${state.ornament === id ? 'on' : ''}`,
        onclick: keepScroll(() => up({ ornament: id })),
      }, h('span', { class: 'orn-ico', html: o.icon ? iconSVG(o.icon) : '' }), h('small', {}, o.ru))));
      body.append(section('Вид', 'μορφή',
        h('div', { class: 'set-label' }, 'Тема'),
        segmented(THEMES, state.theme, (v) => up({ theme: v })),
        h('div', { class: 'set-label' }, 'Шрифт'),
        fonts,
        h('div', { class: 'set-label' }, 'Символ на фоне'),
        h('p', { class: 'hint' }, 'Большой бледный символ за часами. Например, колесо ΙΧΘΥΣ — раннехристианский знак: буквы слова «рыба» (Иисус Христос, Божий Сын, Спаситель), наложенные друг на друга.'),
        orns,
        h('div', { class: 'set-label' }, 'Выравнивание списка'),
        segmented([{ value: 'left', label: 'Слева' }, { value: 'center', label: 'Центр' }, { value: 'right', label: 'Справа' }], state.align, (v) => up({ align: v })),
        h('div', { class: 'set-label' }, 'Размер названий'),
        segmented([{ value: 's', label: 'S' }, { value: 'm', label: 'M' }, { value: 'l', label: 'L' }], state.size, (v) => up({ size: v })),
        h('div', { class: 'set-label' }, 'Метка у названия'),
        segmented([{ value: 'greek', label: 'αʹ βʹ' }, { value: 'roman', label: 'I II' }, { value: 'count', label: '×счёт' }, { value: 'none', label: 'Нет' }], state.marker, (v) => up({ marker: v })),
        toggle('Строка статуса', state.showStatus, (v) => up({ showStatus: v }), 'Сеть и батарея'),
        toggle('Вступление «Да будет свет»', state.intro, (v) => up({ intro: v }), 'Анимация при запуске'),
      ));

      // — Дата и строка —
      body.append(section('Дата и строка', 'ἡμέρα',
        h('div', { class: 'set-label' }, 'Язык даты и часов «Словом»'),
        segmented([{ value: 'ru', label: 'Русский' }, { value: 'en', label: 'English' }, { value: 'el', label: 'Ελληνικά' }], state.dateLang, (v) => up({ dateLang: v })),
        toggle('Греческий день недели', state.greekEcho, (v) => up({ greekEcho: v }), 'Κυριακή, Δευτέρα…'),
        h('div', { class: 'set-label' }, 'Строка под датой'),
        segmented([{ value: 'verse', label: 'Стих' }, { value: 'hour', label: 'Койне' }, { value: 'note', label: 'Заметка' }, { value: 'none', label: 'Нет' }], state.subline, (v) => up({ subline: v })),
        state.subline === 'note' ? field('Заметка', state.note, (v) => { state.note = v; save(); changed(); }, { placeholder: '21:00 · пройти урок' }) : null,
        h('div', { class: 'set-label' }, 'Перевод стихов'),
        segmented([{ value: 'ru', label: 'Синодальный' }, { value: 'en', label: 'KJV' }], state.verseLang, (v) => up({ verseLang: v })),
      ));

      // — Главный экран —
      const homeList = h('div', { class: 'edit-list' });
      state.home.forEach((item, i) => {
        const app = appById(item.app);
        homeList.append(h('div', { class: 'edit-row' },
          h('button', { class: 'edit-main', onclick: () => editHomeItem(i, rerender) },
            h('span', {}, item.label || app?.name), h('small', {}, app ? app.name : 'приложение удалено')),
          h('button', { class: 'mini', 'aria-label': 'Выше', disabled: i === 0, onclick: keepScroll(() => { move(state.home, i, -1); save(); changed(); rerender(); }) }, '↑'),
          h('button', { class: 'mini', 'aria-label': 'Ниже', disabled: i === state.home.length - 1, onclick: keepScroll(() => { move(state.home, i, 1); save(); changed(); rerender(); }) }, '↓'),
        ));
      });
      body.append(section('Главный экран', 'οἶκος',
        h('p', { class: 'hint' }, 'Названия — любые: на русском, английском, греческом. Удерживайте название на главном экране, чтобы изменить его.'),
        homeList,
        h('button', { class: 'btn', onclick: () => pickAction({ t: 'app' }, (a) => {
          if (a.t !== 'app') return toast('Выберите приложение');
          const app = appById(a.id);
          state.home.push({ app: a.id, label: app.name.toLowerCase() });
          save(); changed(); rerender();
        }) }, '＋ добавить на главный'),
      ));

      // — Панель значков —
      const dockList = h('div', { class: 'edit-list' });
      state.dock.forEach((slot, i) => {
        const d = describeAction(slot.action);
        dockList.append(h('div', { class: 'edit-row' },
          h('button', { class: 'slot-ico', 'aria-label': 'Значок', html: iconSVG(slot.icon), onclick: () => pickIcon(slot.icon, (id) => { slot.icon = id; save(); changed(); rerender(); }) }),
          h('button', { class: 'edit-main', onclick: () => pickAction(slot.action, (a) => { slot.action = a; save(); changed(); rerender(); }) },
            h('span', {}, d.ru), h('small', {}, d.el)),
          h('button', { class: 'mini', 'aria-label': 'Убрать', onclick: keepScroll(() => { state.dock.splice(i, 1); save(); changed(); rerender(); }) }, '×'),
        ));
      });
      body.append(section('Панель значков', 'εἰκόνες',
        segmented([{ value: 'pill', label: 'Капсула' }, { value: 'line', label: 'Линия' }, { value: 'none', label: 'Скрыть' }], state.dockStyle, (v) => up({ dockStyle: v })),
        toggle('Подпись на капсуле', state.dockCaption, (v) => up({ dockCaption: v }), 'Начало стиха по-гречески — когда значков не больше трёх'),
        dockList,
        state.dock.length < 6 ? h('button', { class: 'btn', onclick: () => {
          state.dock.push({ icon: 'star', action: { t: 'cmd', id: 'drawer' } });
          save(); changed(); rerender();
        } }, '＋ добавить значок') : null,
      ));

      // — Жесты —
      const gList = h('div', { class: 'edit-list' });
      GESTURES.forEach((g) => {
        const d = describeAction(state.gestures[g.id]);
        gList.append(h('div', { class: 'edit-row' },
          h('span', { class: 'glyph' }, g.glyph),
          h('button', { class: 'edit-main', onclick: () => pickAction(state.gestures[g.id], (a) => { state.gestures[g.id] = a; save(); rerender(); }) },
            h('span', {}, g.ru), h('small', {}, `→ ${d.ru}`)),
        ));
      });
      body.append(section('Жесты', 'κινήσεις', gList,
        h('p', { class: 'hint' }, 'На компьютере: колесо мыши — свайп вверх/вниз, стрелки — свайпы, любая буква — поиск.')));

      // — Данные —
      const file = h('input', { type: 'file', accept: 'application/json', hidden: true, onchange: async (e) => {
        try {
          importState(JSON.parse(await e.target.files[0].text()));
          changed(); rerender(); toast('Импортировано');
        } catch { toast('Не удалось прочитать файл'); }
      } });
      body.append(section('Данные', 'ταμεῖον',
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn', onclick: exportState }, 'Экспорт'),
          h('button', { class: 'btn', onclick: () => file.click() }, 'Импорт'),
          h('button', { class: 'btn danger', onclick: () => { if (confirm('Сбросить все настройки?')) { reset(); changed(); rerender(); } } }, 'Сброс')),
        file,
      ));
    },
  });
}

function move(arr, i, d) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: 'launcher-settings.json' });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

export function editHomeItem(i, after, onChange = changed) {
  const item = state.home[i];
  if (!item) return;
  openSheet({
    title: 'Название на главном', kicker: 'ὄνομα',
    render(body, close, rerender) {
      const app = appById(item.app);
      const commit = () => { save(); onChange(); after?.(); };
      body.append(
        field('Подпись', item.label, (v) => { item.label = v; commit(); }, { placeholder: app?.name || '' }),
        h('div', { class: 'chips' }, ...['βίβλος', 'λόγος', 'φῶς', 'ζωή', 'ὁδός', 'φωνή', 'ψαλμοί', 'εἰρήνη'].map((w) =>
          h('button', { class: 'chip', lang: 'el', onclick: () => { item.label = (item.label ? item.label.split(' · ')[0] + ' · ' : '') + w; commit(); rerender(); } }, w))),
        h('button', { class: 'pick', onclick: () => pickAction({ t: 'app', id: item.app }, (a) => {
          if (a.t !== 'app') return toast('Выберите приложение');
          item.app = a.id; commit(); rerender();
        }) }, h('span', {}, 'Открывает: ' + (app?.name || '—')), h('small', {}, 'сменить')),
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn', disabled: i === 0, onclick: () => { move(state.home, i, -1); commit(); close(); } }, '↑ Выше'),
          h('button', { class: 'btn', disabled: i === state.home.length - 1, onclick: () => { move(state.home, i, 1); commit(); close(); } }, '↓ Ниже'),
          h('button', { class: 'btn danger', onclick: () => { state.home.splice(i, 1); commit(); close(); } }, 'Убрать')),
      );
    },
  });
}

export function editDockSlot(i, onChange) {
  const slot = state.dock[i];
  if (!slot) return;
  openSheet({
    title: 'Значок панели', kicker: 'εἰκών',
    render(body, close, rerender) {
      const d = describeAction(slot.action);
      body.append(
        h('button', { class: 'pick', onclick: () => pickIcon(slot.icon, (id) => { slot.icon = id; save(); onChange(); rerender(); }) },
          h('span', { class: 'pick-ico', html: iconSVG(slot.icon) }), h('span', {}, 'Сменить значок'), h('small', {}, 'εἰκών')),
        h('button', { class: 'pick', onclick: () => pickAction(slot.action, (a) => { slot.action = a; save(); onChange(); rerender(); }) },
          h('span', {}, 'Действие: ' + d.ru), h('small', {}, 'πρᾶξις')),
        h('button', { class: 'btn danger', onclick: () => { state.dock.splice(i, 1); save(); onChange(); close(); } }, 'Убрать значок'),
      );
    },
  });
}
