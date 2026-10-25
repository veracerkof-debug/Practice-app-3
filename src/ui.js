// Мелкие помощники интерфейса: создание узлов, листы (bottom sheets), тост.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

// — Тост —
let toastTimer;
export function toast(text) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = h('div', { class: 'toast', role: 'status' });
    document.body.append(el);
  }
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

// — Листы —
const stack = [];
export const sheetOpen = () => stack.length > 0;

export function openSheet({ title, kicker, render, full = false, onClose }) {
  const body = h('div', { class: 'sheet-body' });
  const closeBtn = h('button', { class: 'sheet-x', 'aria-label': 'Закрыть', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' });
  const panel = h('div', { class: `sheet ${full ? 'sheet-full' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div', { class: 'sheet-grip' }),
    h('header', { class: 'sheet-head' },
      h('div', {}, kicker ? h('div', { class: 'kicker' }, kicker) : null, h('h2', {}, title)),
      closeBtn),
    body);
  const scrim = h('div', { class: 'scrim' });
  const wrap = h('div', { class: 'sheet-wrap' }, scrim, panel);
  document.querySelector('#app').append(wrap);
  requestAnimationFrame(() => wrap.classList.add('open'));

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    stack.splice(stack.indexOf(entry), 1);
    wrap.classList.remove('open');
    setTimeout(() => wrap.remove(), 320);
    onClose?.();
  };
  const entry = { close };
  stack.push(entry);
  scrim.addEventListener('click', close);
  closeBtn.addEventListener('click', close);

  // свайп вниз по заголовку закрывает лист
  let y0 = null;
  panel.querySelector('.sheet-head').addEventListener('pointerdown', (e) => { y0 = e.clientY; });
  panel.addEventListener('pointerup', (e) => {
    if (y0 != null && e.clientY - y0 > 70) close();
    y0 = null;
  });

  const rerender = () => { body.replaceChildren(); render(body, close, rerender); };
  rerender();
  return { close, rerender, panel };
}

export function closeTopSheet() {
  const top = stack.at(-1);
  if (top) { top.close(); return true; }
  return false;
}

// — Элементы настроек —
export function segmented(options, value, onChange) {
  const wrap = h('div', { class: 'seg', role: 'radiogroup' });
  for (const o of options) {
    wrap.append(h('button', {
      class: o.value === value ? 'on' : '',
      role: 'radio',
      'aria-checked': o.value === value ? 'true' : 'false',
      onclick: () => onChange(o.value),
    }, o.label));
  }
  return wrap;
}

export function toggle(label, value, onChange, hint) {
  return h('button', { class: 'row', role: 'switch', 'aria-checked': value ? 'true' : 'false', onclick: () => onChange(!value) },
    h('span', { class: 'row-main' }, h('span', {}, label), hint ? h('small', {}, hint) : null),
    h('span', { class: `sw ${value ? 'on' : ''}` }, h('i')));
}

export function field(label, value, onInput, attrs = {}) {
  const input = h('input', { value: value ?? '', ...attrs });
  input.addEventListener('input', () => onInput(input.value));
  return h('label', { class: 'field' }, h('span', {}, label), input);
}

export function section(title, el, ...children) {
  return h('section', { class: 'set-sec' },
    h('h3', {}, title, el ? h('span', { class: 'el' }, el) : null),
    ...children);
}
