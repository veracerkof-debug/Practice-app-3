// Виды часов. Каждый рендерит HTML по текущему времени.
import { greekNumeral, romanNumeral, numberWords } from './scripture.js';

export const CLOCKS = [
  { id: 'tablet', ru: 'Скрижаль', el: 'πλάξ' },
  { id: 'codex', ru: 'Кодекс', el: 'κῶδιξ' },
  { id: 'greek', ru: 'Греческие числа', el: 'ἀριθμοί' },
  { id: 'sundial', ru: 'Солнечный круг', el: 'κύκλος' },
  { id: 'word', ru: 'Словом', el: 'λόγῳ' },
  { id: 'orbit', ru: 'Светила', el: 'φωστῆρες' },
  { id: 'flip', ru: 'Листы', el: 'φύλλα' },
  { id: 'scroll', ru: 'Свиток', el: 'κύλινδρος' },
  { id: 'letters', ru: 'Письмена', el: 'γράμματα' },
  { id: 'mosaic', ru: 'Мозаика', el: 'ψηφιδωτόν' },
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


// — Светила: часы и минуты движутся по орбитам (Быт 1:16).
// Радиусы орбит связаны золотым сечением; вращение — CSS-анимацией.
const PHI = 1.618034;

function orbit(date, s) {
  const [h] = hm(date, s.hour12);
  const m = date.getMinutes();
  const sec = date.getSeconds() + date.getMilliseconds() / 1000;
  const rs = 16, rm = 42, rh = rm + (rm - rs) * PHI;
  const hSize = 18, mSize = 13;
  const sinceHour = m * 60 + sec;
  const sinceHalfDay = (date.getHours() % 12) * 3600 + sinceHour;
  // планета на орбите: группа вращается вокруг центра, подпись — обратно, чтобы оставаться прямой
  const body = (r, size, cls, text, period, elapsed) => `
    <g class="orb-rot" style="animation-duration:${period}s;animation-delay:-${elapsed.toFixed(1)}s">
      <circle cx="110" cy="${110 - r}" r="${size}" class="${cls}"/>
      ${text != null ? `<g class="orb-up" style="transform-origin:110px ${110 - r}px;animation-duration:${period}s;animation-delay:-${elapsed.toFixed(1)}s">
        <text x="110" y="${110 - r}" dy=".35em" class="${cls}-t">${text}</text></g>` : ''}
    </g>`;
  return `<svg class="ck-orbit" viewBox="0 0 220 220" role="img" aria-label="${pad(date.getHours())}:${pad(m)}">
    <circle cx="110" cy="110" r="${rs}" class="orb-path" stroke-dasharray="1.5 2.5"/>
    <circle cx="110" cy="110" r="${rm}" class="orb-path" stroke-dasharray="${(2 * PHI).toFixed(2)} ${(2 * PHI).toFixed(2)}"/>
    <circle cx="110" cy="110" r="${rh.toFixed(1)}" class="orb-path" stroke-dasharray="${(2 * PHI * PHI).toFixed(2)} ${(2 * PHI * PHI).toFixed(2)}"/>
    <circle cx="110" cy="110" r="2" class="orb-core"/>
    ${body(rs, 3, 'orb-s', null, 60, sec)}
    ${body(rm, mSize, 'orb-m', pad(m), 3600, sinceHour)}
    ${body(rh, hSize, 'orb-h', h, 43200, sinceHalfDay)}
  </svg>`;
}

// — Листы: перекидные карточки, как страницы кодекса.
function flip(date, s, prev) {
  const [h, m] = hm(date, s.hour12);
  const H = s.hour12 ? String(h) : pad(h);
  const M = pad(m);
  const [pH, pM] = prev ? prev.split(':') : [H, M];
  const card = (now, before) => {
    const anim = before !== now ? ' go' : '';
    return `<div class="fl-card${anim}">
      <div class="fl-half fl-top"><span>${now}</span></div>
      <div class="fl-half fl-bottom"><span>${before}</span></div>
      <div class="fl-half fl-top fl-flap-top"><span>${before}</span></div>
      <div class="fl-half fl-bottom fl-flap-bottom"><span>${now}</span></div>
    </div>`;
  };
  return `<div class="ck-flip" role="img" aria-label="${H}:${M}">${card(H, pH)}<i></i>${card(M, pM)}</div>`;
}

// — Свиток: цифры прокручиваются по вертикали, как разворачиваемый свиток.
function scroll(date, s, prev) {
  const [h, m] = hm(date, s.hour12);
  const now = (s.hour12 ? String(h) : pad(h)) + ':' + pad(m);
  const before = prev && prev.length === now.length ? prev : now;
  const strip = '0123456789'.split('').concat('0').map((d) => `<span>${d}</span>`).join('');
  const cols = [...now].map((ch, i) => {
    if (ch === ':') return '<em>:</em>';
    const to = +ch;
    const from = +before[i];
    // 9 → 0 и 5 → 0 крутим вперёд, к последнему нулю ленты
    const target = to < from && to === 0 ? 10 : to;
    return `<div class="sc-col"><div class="sc-strip" data-from="${from}" data-to="${target}" data-final="${to}" style="transform:translateY(${from * -1.1}em)">${strip}</div></div>`;
  }).join('');
  return `<div class="ck-scroll" role="img" aria-label="${now}">${cols}</div>`;
}

// — Письмена: сетка букв, подсвечиваются слова времени (идея QLOCKTWO).
// Остальные клетки — бледные греческие буквы.
const GRID = [
  ['ОДИННАДЦАТЬ', 0, 'h11'], ['ДВЕНАДЦАТЬ', 1, 'h12'],
  ['ДЕВЯТЬ', 2, 'h9'], ['ДЕСЯТЬ', 2, 'h10'],
  ['ВОСЕМЬ', 3, 'h8'], ['ЧЕТЫРЕ', 3, 'h4'],
  ['ШЕСТЬ', 4, 'h6'], ['СЕМЬ', 4, 'h7'], ['ТРИ', 4, 'h3'],
  ['ПЯТЬ', 5, 'h5'], ['ЧАС', 5, 'h1'], ['ДВА', 5, 'h2'],
  ['РОВНО', 6, 'm0'], ['СОРОК', 6, 'm40'],
  ['ПЯТНАДЦАТЬ', 7, 'm15'], ['ДВАДЦАТЬ', 8, 'm20'], ['ТРИДЦАТЬ', 9, 'm30'],
  ['ПЯТЬДЕСЯТ', 10, 'm50'], ['ДЕСЯТЬ', 11, 'm10'], ['ПЯТЬ', 11, 'm5'],
];
const COLS = 12;
const FILL = 'ΘΛΞΣΦΨΩΔΓΠ';

// раскладываем слова по строкам: промежутки между словами, пока хватает места
const LETTER_GRID = (() => {
  const rows = Array.from({ length: 12 }, () => []);
  for (const [word, r, key] of GRID) rows[r].push({ word, key });
  const cells = [];
  let n = 0;
  const filler = () => ({ ch: FILL[n++ % FILL.length], key: null });
  rows.forEach((words) => {
    let spare = COLS - words.reduce((a, w) => a + w.word.length, 0);
    const row = [];
    words.forEach((w, i) => {
      if (i && spare > 0) { row.push(filler()); spare--; }
      for (const ch of w.word) row.push({ ch, key: w.key });
    });
    while (row.length < COLS) row.push(filler());
    cells.push(...row);
  });
  return cells;
})();

function letterKeys(date) {
  const h = date.getHours() % 12 || 12;
  const m5 = Math.floor(date.getMinutes() / 5) * 5;
  const keys = new Set([`h${h}`]);
  const tens = { 0: 'm0', 5: 'm5', 10: 'm10', 15: 'm15', 20: 'm20', 30: 'm30', 40: 'm40', 50: 'm50' };
  if (tens[m5]) keys.add(tens[m5]);
  else { keys.add(tens[m5 - 5]); keys.add('m5'); }
  return keys;
}

function letters(date, s, prev) {
  const keys = letterKeys(date);
  let before = null;
  if (prev) {
    const [ph, pm] = prev.split(':').map(Number);
    const d = new Date(date);
    d.setHours(s.hour12 && date.getHours() >= 12 && ph < 12 ? ph + 12 : ph, pm);
    before = letterKeys(d);
  }
  const cells = LETTER_GRID.map((c, i) => {
    const on = c.key && keys.has(c.key);
    const fresh = on && before && !before.has(c.key);
    return `<span class="${c.key ? 'w' : 'f'}${on ? ' on' : ''}${fresh ? ' fresh' : ''}" style="--i:${i % COLS}">${c.ch}</span>`;
  }).join('');
  const rest = date.getMinutes() % 5;
  const dots = [1, 2, 3, 4].map((i) => `<i class="${i <= rest ? 'on' : ''}"></i>`).join('');
  return `<div class="ck-letters" role="img" aria-label="${pad(date.getHours())}:${pad(date.getMinutes())}">
    <div class="lt-grid">${cells}</div><div class="lt-dots">${dots}</div></div>`;
}

// — Мозаика: цифры из смальты 5×7, меняющиеся камешки вспыхивают по очереди.
const GLYPHS = {
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
};

function mosaic(date, s, prev) {
  const [h, m] = hm(date, s.hour12);
  const now = (s.hour12 ? String(h).padStart(2, ' ') : pad(h)) + pad(m);
  const before = prev ? prev.replace(':', '').padStart(4, ' ') : now;
  const digit = (ch, was) => {
    const g = GLYPHS[ch];
    const p = GLYPHS[was];
    if (!g) return '<div class="ms-digit ms-blank"></div>';
    let cells = '';
    g.forEach((row, y) => [...row].forEach((bit, x) => {
      const on = bit === '1';
      const changed = p && p[y][x] !== bit;
      cells += `<i class="${on ? 'on' : ''}${changed ? ' ch' : ''}" style="--k:${y + x}"></i>`;
    }));
    return `<div class="ms-digit">${cells}</div>`;
  };
  return `<div class="ck-mosaic" role="img" aria-label="${now.trim()}">
    ${digit(now[0], before[0])}${digit(now[1], before[1])}
    <div class="ms-colon"><i></i><i></i></div>
    ${digit(now[2], before[2])}${digit(now[3], before[3])}</div>`;
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

  orbit,
  flip,
  scroll,
  letters,
  mosaic,
};

export function renderClock(id, date, s, prev) {
  return (renderers[id] || renderers.tablet)(date, s, prev);
}

export function clockKey(date, s) {
  const [h, m] = hm(date, s.hour12);
  return `${s.hour12 ? h : pad(h)}:${pad(m)}`;
}

// После вставки в DOM: запускаем прокрутку «Свитка» к новым цифрам.
export function afterClockRender(el) {
  const strips = el.querySelectorAll('.sc-strip');
  if (!strips.length) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    strips.forEach((st) => {
      st.style.transform = `translateY(${+st.dataset.to * -1.1}em)`;
      if (st.dataset.to !== st.dataset.final) {
        st.addEventListener('transitionend', () => {
          st.style.transition = 'none';
          st.style.transform = `translateY(${+st.dataset.final * -1.1}em)`;
        }, { once: true });
      }
    });
  }));
}
