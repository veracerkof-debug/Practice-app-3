// Выбор значка и действия — общие листы для панели и жестов.
import { ICONS, iconSVG } from './icons.js';
import { COMMANDS, LINK_PRESETS } from './actions.js';
import { state } from './store.js';
import { h, openSheet, segmented, field } from './ui.js';

export function pickIcon(current, onPick) {
  let q = '';
  openSheet({
    title: 'Значок', kicker: 'εἰκών', full: true,
    render(body, close) {
      const grid = h('div', { class: 'icon-grid' });
      const fill = () => {
        grid.replaceChildren();
        const ql = q.trim().toLowerCase();
        ICONS.filter((i) => !ql || [i.el, i.ru, i.en].some((s) => s.toLowerCase().includes(ql)))
          .forEach((i) => grid.append(h('button', {
            class: `icon-cell ${i.id === current ? 'on' : ''}`,
            title: `${i.ru} — ${i.en}`,
            onclick: () => { onPick(i.id); close(); },
          }, h('span', { html: iconSVG(i.id) }), h('b', {}, i.el), h('small', {}, i.ru))));
      };
      const search = h('input', { class: 'search', placeholder: 'ζήτει — найти значок', oninput: (e) => { q = e.target.value; fill(); } });
      body.append(search, grid);
      fill();
    },
  });
}

export function pickAction(current, onPick) {
  let tab = current?.t || 'cmd';
  let url = current?.t === 'url' ? current.url : '';
  let name = current?.t === 'url' ? current.name || '' : '';
  openSheet({
    title: 'Действие', kicker: 'πρᾶξις', full: true,
    render(body, close, rerender) {
      body.append(segmented([
        { value: 'cmd', label: 'Команда' },
        { value: 'app', label: 'Приложение' },
        { value: 'url', label: 'Ссылка' },
      ], tab, (v) => { tab = v; rerender(); }));

      const list = h('div', { class: 'pick-list' });
      if (tab === 'cmd') {
        COMMANDS.forEach((c) => list.append(h('button', {
          class: `pick ${current?.t === 'cmd' && current.id === c.id ? 'on' : ''}`,
          onclick: () => { onPick({ t: 'cmd', id: c.id }); close(); },
        }, h('span', {}, c.ru), h('small', {}, c.el))));
      } else if (tab === 'app') {
        [...state.apps].sort((a, b) => a.name.localeCompare(b.name, 'ru')).forEach((a) => list.append(h('button', {
          class: `pick ${current?.t === 'app' && current.id === a.id ? 'on' : ''}`,
          onclick: () => { onPick({ t: 'app', id: a.id }); close(); },
        }, h('span', {}, a.name), h('small', {}, a.pkg || a.url))));
      } else {
        const urlField = field('Ссылка, схема или intent', url, (v) => { url = v; }, { placeholder: 'https://, tel:, intent:#Intent;…' });
        const nameField = field('Подпись', name, (v) => { name = v; }, { placeholder: 'например: Позвонить маме' });
        body.append(h('p', { class: 'hint' }, 'Действие внутри приложения: deep link (tg://, spotify:, whatsapp://) или Android intent. Выберите шаблон и поправьте значение.'));
        body.append(urlField, nameField, h('button', {
          class: 'btn primary',
          onclick: () => { if (url.trim()) { onPick({ t: 'url', url: url.trim(), name: name.trim() }); close(); } },
        }, 'Готово · γένοιτο'));
        LINK_PRESETS.forEach((p) => list.append(h('button', {
          class: 'pick',
          onclick: () => { url = p.url; name = p.ru; rerender(); },
        }, h('span', {}, p.ru), h('small', {}, p.url))));
        list.prepend(h('div', { class: 'kicker pad' }, 'Шаблоны'));
      }
      body.append(list);
    },
  });
}
