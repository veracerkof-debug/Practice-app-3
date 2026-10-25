// Лист «Чтение и практика»: подключение Melete, состояние, обновление.
import { state } from './store.js';
import { h, openSheet, toast } from './ui.js';
import { openUrl } from './actions.js';
import { isNative } from './native.js';
import { connectMelete, refreshMelete, disconnectMelete, trackerData } from './tracker.js';
import { fmtDur } from './melete.js';

const ago = (ts) => {
  if (!ts) return '—';
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'только что';
  if (m < 60) return `${m} мин назад`;
  const hrs = Math.round(m / 60);
  return hrs < 48 ? `${hrs} ч назад` : new Date(ts).toLocaleDateString('ru-RU');
};

export function openTrackerSheet(onChange) {
  openSheet({
    title: 'Чтение и практика', kicker: 'μελέτη',
    render(body, close, rerender) {
      const done = () => { onChange?.(); rerender(); };
      body.append(h('p', { class: 'ex-p' },
        'Melete — ваше приложение для музыкальной практики. В нём же — планы чтения Библии. Лаунчер показывает на главном экране чтение на сегодня и практику за неделю. Считает так же, как Melete: те же планы и та же неделя с понедельника.'));
      body.append(h('p', { class: 'ex-p' }, isNative()
        ? 'Как это работает: Melete сохраняет данные в «папку Melete» (обычно Документы/Melete). Выберите эту папку один раз — лаунчер будет читать файл Data/melete-data.json сам и ничего в нём не меняет. Melete обновляет файл, пока открыто, поэтому цифры свежие после занятия.'
        : 'В браузере папку читать нельзя: выберите файл melete-data.json вручную (из папки Melete → Data, или резервную копию). В Android-версии лаунчер будет читать папку сам.'));

      const t = trackerData();
      if (t) {
        const rd = t.reading;
        body.append(h('div', { class: 'tr-status' },
          h('div', {}, h('b', {}, 'Чтение: '), rd ? (rd.ref ? `${rd.ref} — прочитано ${rd.done} из ${rd.total}, день ${rd.day} из ${rd.days} (${rd.plan})` : rd.plan) : 'план не выбран в Melete'),
          h('div', {}, h('b', {}, 'Практика: '), `${fmtDur(t.practice.total)} из ${fmtDur(t.practice.goal)} за неделю`),
          h('small', {}, `Источник: ${t.source === 'folder' ? 'папка Melete' : state.melete.fileName || 'файл'} · обновлено ${ago(t.readAt)}`)));
      }

      const btns = h('div', { class: 'btn-row' });
      btns.append(h('button', { class: 'btn primary', onclick: async () => {
        try { await connectMelete(); toast('Melete подключено'); done(); } catch (e) {
          if (String(e?.message) !== 'cancelled') toast(e?.message?.startsWith('not found') ? 'В папке нет Data/melete-data.json' : 'Не удалось прочитать данные Melete');
        }
      } }, t ? (isNative() ? 'Выбрать папку заново' : 'Выбрать файл заново') : (isNative() ? 'Выбрать папку Melete' : 'Выбрать файл melete-data.json')));
      if (t && isNative()) btns.append(h('button', { class: 'btn', onclick: async () => { try { await refreshMelete(true); toast('Обновлено'); done(); } catch { toast('Не удалось прочитать папку'); } } }, 'Обновить'));
      if (t) btns.append(h('button', { class: 'btn danger', onclick: () => { disconnectMelete(); done(); } }, 'Отключить'));
      body.append(btns);

      const links = h('div', { class: 'ex-links' },
        h('button', { class: 'ex-link', onclick: () => openUrl('https://veracerkof-debug.github.io/melete-app/', 'Melete') }, h('span', {}, 'Открыть веб-версию Melete'), h('small', {}, 'github.io')),
        h('button', { class: 'ex-link', onclick: () => openUrl('https://github.com/veracerkof-debug/melete-app', 'Melete на GitHub') }, h('span', {}, 'Melete на GitHub'), h('small', {}, 'github.com')));
      body.append(links);
    },
  });
}
