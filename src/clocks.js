// Виды часов. Каждый рендерит HTML по текущему времени.
import { greekNumeral, romanNumeral, numberWords } from './scripture.js';

export const CLOCKS = [
  { id: 'tablet', ru: 'Скрижаль', el: 'πλάξ' },
  { id: 'codex', ru: 'Кодекс', el: 'κῶδιξ' },
  { id: 'greek', ru: 'Греческие числа', el: 'ἀριθμοί' },
  { id: 'sundial', ru: 'Солнечный круг', el: 'κύκλος' },
  { id: 'word', ru: 'Словом', el: 'λόγῳ' },
];

const pad = (n) => String(n).padStart(2, '0');

function hm(date, hour12) {
  let h = date.getHours();
  if (hour12) h = h % 12 || 12;
  return [h, date.getMinutes()];
}

function digits(str, prev) {
  return [...str].map((ch, i) => `<b class="${prev && prev[i] !== ch ? 'tick' : ''}">${ch}</b>`).join('');
}

const renderers = {
  tablet(date, s, prev) {
    const [h, m] = hm(date, s.hour12);
    const H = s.hour12 ? String(h) : pad(h);
    const M = pad(m);
    const p = prev?.split(':') || [];
    return `<div class="ck-tablet" role="img" aria-label="${H}:${M}">
      <span>${digits(H, p[0])}</span><i></i><span>${digits(M, p[1])}</span></div>`;
  },

  codex(date, s, prev) {
    const [h, m] = hm(date, s.hour12);
    const H = s.hour12 ? String(h) : pad(h);
    const M = pad(m);
    const p = prev?.split(':') || [];
    return `<div class="ck-codex">
      <div class="ck-codex-main">${digits(H, p[0])}<em>·</em>${digits(M, p[1])}</div>
      <div class="ck-codex-sub"><s></s>${romanNumeral(h)} · ${romanNumeral(m)}<s></s></div></div>`;
  },

  greek(date, s) {
    const h = date.getHours();
    const m = date.getMinutes();
    return `<div class="ck-greek">
      <div class="ck-greek-main"><span>${greekNumeral(h)}</span><em>·</em><span>${greekNumeral(m)}</span></div>
      <div class="ck-greek-sub">${pad(h)}:${pad(m)}</div></div>`;
  },

  sundial(date) {
    const h = date.getHours() % 12;
    const m = date.getMinutes();
    const sec = date.getSeconds() + date.getMilliseconds() / 1000;
    const ha = h * 30 + m * 0.5;
    const ma = m * 6 + sec * 0.1;
    let marks = '';
    for (let i = 1; i <= 12; i++) {
      const a = ((i * 30 - 90) * Math.PI) / 180;
      const x = 100 + 78 * Math.cos(a), y = 100 + 78 * Math.sin(a);
      marks += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" dy=".34em">${greekNumeral(i, false)}</text>`;
    }
    let ticks = '';
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const a = (i * 6 * Math.PI) / 180;
      ticks += `M${(100 + 92 * Math.sin(a)).toFixed(1)} ${(100 - 92 * Math.cos(a)).toFixed(1)}L${(100 + 95 * Math.sin(a)).toFixed(1)} ${(100 - 95 * Math.cos(a)).toFixed(1)}`;
    }
    return `<svg class="ck-sundial" viewBox="0 0 200 200" role="img" aria-label="${pad(date.getHours())}:${pad(m)}">
      <circle cx="100" cy="100" r="97" class="rim"/>
      <path d="${ticks}" class="tk"/>
      <g class="nums">${marks}</g>
      <line x1="100" y1="100" x2="100" y2="52" class="hh" transform="rotate(${ha} 100 100)"/>
      <line x1="100" y1="100" x2="100" y2="28" class="mh" transform="rotate(${ma} 100 100)"/>
      <g class="sh" style="animation-delay:-${sec.toFixed(2)}s"><line x1="100" y1="114" x2="100" y2="22"/></g>
      <path d="M100 93v14M93 100h14" class="cx"/>
    </svg>`;
  },

  word(date, s) {
    const [h, m] = hm(date, s.hour12);
    const lang = s.dateLang;
    return `<div class="ck-word" lang="${lang}">
      <span>${numberWords(h, lang)}</span><span>${numberWords(m, lang, true)}</span></div>`;
  },
};

export function renderClock(id, date, s, prev) {
  return (renderers[id] || renderers.tablet)(date, s, prev);
}

export function clockKey(date, s) {
  const [h, m] = hm(date, s.hour12);
  return `${s.hour12 ? h : pad(h)}:${pad(m)}`;
}
