// База значков: библейские символы, линейная графика 24×24.
// Каждый значок: id, греческое слово, русское и английское значение, тело SVG.

const f = (n) => +n.toFixed(2);

function starPath(points, R, r, cx = 12, cy = 12, rot = -90) {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const rad = ((rot + (i * 180) / points) * Math.PI) / 180;
    const rr = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${f(cx + rr * Math.cos(rad))} ${f(cy + rr * Math.sin(rad))}`;
  }
  return `<path d="${d}z"/>`;
}

function rays(n, r1, r2, cx = 12, cy = 12, rot = 0) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = ((rot + (i * 360) / n) * Math.PI) / 180;
    d += `M${f(cx + r1 * Math.cos(a))} ${f(cy + r1 * Math.sin(a))}L${f(cx + r2 * Math.cos(a))} ${f(cy + r2 * Math.sin(a))}`;
  }
  return `<path d="${d}"/>`;
}

const letter = (ch, size = 17) =>
  `<text x="12" y="12" dy=".35em" text-anchor="middle" font-size="${size}" font-family="'EB Garamond', serif" fill="currentColor" stroke="none">${ch}</text>`;

const leaf = (x, y, ang, len = 4.2, w = 1.7) => {
  const a = (ang * Math.PI) / 180;
  const ex = x + len * Math.cos(a), ey = y + len * Math.sin(a);
  const nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
  const mx = (x + ex) / 2, my = (y + ey) / 2;
  return `M${f(x)} ${f(y)}Q${f(mx + nx)} ${f(my + ny)} ${f(ex)} ${f(ey)}Q${f(mx - nx)} ${f(my - ny)} ${f(x)} ${f(y)}z`;
};

export const ICONS = [
  // — Знаки Христа —
  { id: 'chirho', el: 'Χριστός', ru: 'Хризма', en: 'Chi-Rho',
    svg: `<path d="M12 3v18M12 3h3a3 3 0 0 1 0 6h-3M7.5 8.5l9 9M16.5 8.5l-9 9"/>` },
  { id: 'alphaomega', el: 'Ἄλφα καὶ Ὦ', ru: 'Альфа и Омега', en: 'Alpha & Omega',
    svg: `<path d="M2.5 18L6.5 6l4 12M4 14h5M13 18h2.6v-1.3a4.6 4.6 0 1 1 3.8 0V18h2.1"/>` },
  { id: 'ichthys', el: 'ἰχθύς', ru: 'Рыба', en: 'Ichthys',
    svg: `<path d="M2.5 12Q11 3 20.5 16.5M2.5 12Q11 21 20.5 7.5"/>` },
  { id: 'cross', el: 'σταυρός', ru: 'Крест', en: 'Cross',
    svg: `<path d="M12 3v18M7 8h10"/>` },
  { id: 'cross8', el: 'σταυρός', ru: 'Крест восьмиконечный', en: 'Orthodox cross',
    svg: `<path d="M12 2.5v19M9.5 5h5M7 8.5h10M9 17.5l6-2.6"/>` },
  { id: 'crossgreek', el: 'σταυρός', ru: 'Крест равноконечный', en: 'Greek cross',
    svg: `<path d="M12 3.5v5.3M12 15.2v5.3M3.5 12h5.3M15.2 12h5.3"/><circle cx="12" cy="12" r="3.2"/>` },
  { id: 'wheel', el: 'ΙΧΘΥΣ', ru: 'Колесо ΙΧΘΥΣ', en: 'Ichthys wheel',
    svg: `<circle cx="12" cy="12" r="9"/>${rays(8, 0, 9, 12, 12, 0)}` },
  { id: 'ihs', el: 'ΙΗΣ', ru: 'Христограмма', en: 'IHS',
    svg: letter('ΙΗΣ', 9) },

  // — Свет —
  { id: 'lamp', el: 'λύχνος', ru: 'Светильник', en: 'Oil lamp',
    svg: `<path d="M3 13h13c2.5 0 4-1.5 4.5-3.5M3 13c1 3 4 4.5 7 4.5s5-1.5 6-4.5M8 17.5V20h4v-2.5"/><path d="M20.5 8c-1-.9-1.1-2.3 0-4 1.1 1.7 1 3.1 0 4z"/>` },
  { id: 'candle', el: 'κηρίον', ru: 'Свеча', en: 'Candle',
    svg: `<path d="M10 11h4v10h-4zM12 11V9M12 7.5c-1.3-1-1.4-2.6 0-4.5 1.4 1.9 1.3 3.5 0 4.5z"/>` },
  { id: 'fire', el: 'πῦρ', ru: 'Огонь', en: 'Fire',
    svg: `<path d="M12 21c-3.5 0-6-2.4-6-5.6 0-3.6 3-5 3.6-9.4 2 1.4 3 3.2 3 4.8 1-.6 1.6-1.8 1.8-3.2 2 1.8 3.6 4.4 3.6 7.6 0 3.3-2.5 5.8-6 5.8z"/>` },
  { id: 'menorah', el: 'λυχνία', ru: 'Менора', en: 'Menorah',
    svg: `<path d="M12 5v15M8 20.5h8M9 6v4a3 3 0 0 0 6 0V6M6.5 6v4a5.5 5.5 0 0 0 11 0V6M4 6v4a8 8 0 0 0 16 0V6"/>` },
  { id: 'star', el: 'ἀστήρ', ru: 'Звезда', en: 'Star',
    svg: starPath(8, 9.5, 3.8) },
  { id: 'sun', el: 'ἥλιος', ru: 'Солнце', en: 'Sun',
    svg: `<circle cx="12" cy="12" r="4"/>${rays(8, 6.5, 9.5)}` },
  { id: 'moon', el: 'σελήνη', ru: 'Луна', en: 'Moon',
    svg: `<path d="M15 3.8a8.5 8.5 0 1 0 5.6 13.4A7 7 0 0 1 15 3.8z"/>` },
  { id: 'eye', el: 'ὀφθαλμός', ru: 'Око', en: 'Eye',
    svg: `<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>` },

  // — Слово и Писание —
  { id: 'book', el: 'βίβλος', ru: 'Книга', en: 'Book',
    svg: `<path d="M12 6.5c-2-1.5-5-2-8.5-1.5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5c-3.5-.5-6.5 0-8.5 1.5zM12 6.5v13"/>` },
  { id: 'scroll', el: 'κύλινδρος', ru: 'Свиток', en: 'Scroll',
    svg: `<path d="M6 5h12M6 19h12M6 5a1.5 1.5 0 0 0 0 3h12a1.5 1.5 0 0 0 0-3M6 16a1.5 1.5 0 0 0 0 3h12a1.5 1.5 0 0 0 0-3M7 8v8M17 8v8M10 11h4M10 13.5h4"/>` },
  { id: 'tablets', el: 'πλάκες', ru: 'Скрижали', en: 'Tablets',
    svg: `<path d="M3.5 20V9a3.5 3.5 0 0 1 7 0v11zM13.5 20V9a3.5 3.5 0 0 1 7 0v11zM5.5 11h3M5.5 14h3M5.5 17h3M15.5 11h3M15.5 14h3M15.5 17h3"/>` },
  { id: 'pen', el: 'κάλαμος', ru: 'Трость', en: 'Reed pen',
    svg: `<path d="M4 20l3.5-1L19 7.5a2.1 2.1 0 0 0-3-3L4.5 16zM14.5 6l3 3"/>` },
  { id: 'seal', el: 'σφραγίς', ru: 'Печать', en: 'Seal',
    svg: `<circle cx="12" cy="10" r="6"/><path d="M12 7v6M9 10h6M8.5 15l-1.5 6 5-2.5 5 2.5-1.5-6"/>` },
  { id: 'logos', el: 'λόγος', ru: 'Слово', en: 'Word',
    svg: letter('λ', 20) },

  // — Звук и голос —
  { id: 'trumpet', el: 'σάλπιγξ', ru: 'Труба', en: 'Trumpet',
    svg: `<path d="M3 10v4h3l11 5V5L6 10zM17 9c1.5 0 2.5 1.3 2.5 3s-1 3-2.5 3"/>` },
  { id: 'lyre', el: 'κιθάρα', ru: 'Гусли Давида', en: 'Lyre',
    svg: `<path d="M6 4c-1 6 0 11 3 14.5h6c3-3.5 4-8.5 3-14.5M4.5 6c1.8-1 3.2 0 3.5 1.5M19.5 6c-1.8-1-3.2 0-3.5 1.5M7.2 8h9.6M10 8v10.5M12 8v10.5M14 8v10.5"/>` },
  { id: 'bell', el: 'κώδων', ru: 'Колокол', en: 'Bell',
    svg: `<path d="M6 17h12l-1.5-2v-4a4.5 4.5 0 0 0-9 0v4zM12 6.5V4.5M10.5 19.5a1.6 1.6 0 0 0 3 0"/>` },
  { id: 'dove', el: 'περιστερά', ru: 'Голубь', en: 'Dove',
    svg: `<path d="M4 10.5l2.2-.6c1-1.8 3.2-2 4.4-.4l1.6 2.2 4.6-6.2c1 3.9-.2 7-2.6 8.7l5.8 1.5c-2.4 1.8-6 2.4-8.6 1.6L8.6 20l.6-3.6C6.7 15 5.9 12.8 6.2 10"/><circle cx="8.2" cy="10" r=".25" fill="currentColor"/>` },

  // — Хлеб и вино —
  { id: 'bread', el: 'ἄρτος', ru: 'Хлеб', en: 'Bread',
    svg: `<path d="M4 14.5c0-3 3.5-5.5 8-5.5s8 2.5 8 5.5c0 1.8-1 3-2.5 3h-11C5 17.5 4 16.3 4 14.5zM8.8 11.4l-1 3M12 10.8v3.6M15.2 11.4l1 3"/>` },
  { id: 'cup', el: 'ποτήριον', ru: 'Чаша', en: 'Chalice',
    svg: `<path d="M6.5 4h11c0 5.2-2.3 8.5-5.5 8.5S6.5 9.2 6.5 4zM12 12.5v6.5M8 20h8"/>` },
  { id: 'grapes', el: 'σταφυλή', ru: 'Виноград', en: 'Grapes',
    svg: `<circle cx="7.6" cy="9" r="2.2"/><circle cx="12" cy="9" r="2.2"/><circle cx="16.4" cy="9" r="2.2"/><circle cx="9.8" cy="13.2" r="2.2"/><circle cx="14.2" cy="13.2" r="2.2"/><circle cx="12" cy="17.4" r="2.2"/><path d="M12 6.8V3M12 4.5c1.5-1.5 3.5-1.8 5-1"/>` },
  { id: 'wheat', el: 'σῖτος', ru: 'Пшеница', en: 'Wheat',
    svg: `<path d="M12 21V5.5"/><path d="${leaf(12, 8, -130)}${leaf(12, 8, -50)}${leaf(12, 11.5, -130)}${leaf(12, 11.5, -50)}${leaf(12, 15, -130)}${leaf(12, 15, -50)}${leaf(12, 5.5, -90, 3.2)}"/>` },
  { id: 'olive', el: 'ἐλαία', ru: 'Масличная ветвь', en: 'Olive branch',
    svg: `<path d="M4 20C9 15.5 13 10.5 19.5 4"/><path d="${leaf(7.2, 17, -150)}${leaf(7.2, 17, 60)}${leaf(10.5, 13.6, -145)}${leaf(10.5, 13.6, 55)}${leaf(14, 9.8, -140)}${leaf(14, 9.8, 50)}${leaf(17.3, 6.2, -135)}"/>` },
  { id: 'pomegranate', el: 'ῥοά', ru: 'Гранат', en: 'Pomegranate',
    svg: `<circle cx="12" cy="13.5" r="7"/><path d="M9.5 6.8l.8-2.8 1.7 2 1.7-2 .8 2.8"/>` },
  { id: 'tree', el: 'ξύλον ζωῆς', ru: 'Древо жизни', en: 'Tree of life',
    svg: `<circle cx="12" cy="9" r="6"/><path d="M12 21v-9M12 15l-3-2.5M12 13.5l3-2.5M8 21h8"/>` },

  // — Путь и странствие —
  { id: 'anchor', el: 'ἄγκυρα', ru: 'Якорь', en: 'Anchor',
    svg: `<circle cx="12" cy="5" r="2"/><path d="M12 7v14M8.5 10.5h7M5 14c0 4 3.5 7 7 7s7-3 7-7M3.5 15.5L5 14l1.5 1.5M17.5 15.5L19 14l1.5 1.5"/>` },
  { id: 'ark', el: 'κιβωτός', ru: 'Ковчег', en: 'Ark',
    svg: `<path d="M2.5 14h19l-3 5h-13zM6.5 14v-4h11v4M6 10.2l6-4 6 4M10.5 14v-2h3v2"/>` },
  { id: 'boat', el: 'πλοῖον', ru: 'Лодка', en: 'Boat',
    svg: `<path d="M4 16h16l-2.5 4h-11zM12 3v13M12 4l6 10h-6"/>` },
  { id: 'net', el: 'δίκτυον', ru: 'Сеть', en: 'Net',
    svg: `<path d="M4 4h16v16H4zM4 9.3L14.7 20M4 14.7L9.3 20M9.3 4L20 14.7M14.7 4L20 9.3M4 4l16 16M20 4L4 20M9.3 20L20 9.3M4 14.7L14.7 4M14.7 20L20 14.7M4 9.3L9.3 4"/>` },
  { id: 'staff', el: 'ῥάβδος', ru: 'Посох', en: "Shepherd's staff",
    svg: `<path d="M9.5 21V8a4 4 0 0 1 8 0v1.5"/>` },
  { id: 'door', el: 'θύρα', ru: 'Дверь', en: 'Door',
    svg: `<path d="M6 21V10a6 6 0 0 1 12 0v11M3 21h18M14.5 15v1"/>` },
  { id: 'ladder', el: 'κλῖμαξ', ru: 'Лествица', en: "Jacob's ladder",
    svg: `<path d="M8 3v18M16 3v18M8 7h8M8 11h8M8 15h8M8 19h8"/>` },
  { id: 'mountain', el: 'ὄρος', ru: 'Гора', en: 'Mountain',
    svg: `<path d="M2 19L9 7l4 6 2.5-3L22 19z"/>` },
  { id: 'water', el: 'ὕδωρ', ru: 'Вода', en: 'Water',
    svg: `<path d="M3 8.5c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 12.5c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 16.5c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/>` },
  { id: 'rainbow', el: 'τόξον', ru: 'Радуга', en: 'Rainbow',
    svg: `<path d="M3 18a9 9 0 0 1 18 0M6 18a6 6 0 0 1 12 0M9 18a3 3 0 0 1 6 0"/>` },
  { id: 'tent', el: 'σκηνή', ru: 'Скиния', en: 'Tabernacle',
    svg: `<path d="M3 20L12 4l9 16zM12 4v16M9 20l3-6 3 6"/>` },
  { id: 'house', el: 'οἶκος', ru: 'Дом', en: 'House',
    svg: `<path d="M4 11l8-6.5 8 6.5M6 9.5V20h12V9.5M10 20v-5h4v5"/>` },

  // — Царство —
  { id: 'crown', el: 'στέφανος', ru: 'Венец', en: 'Crown',
    svg: `<path d="M4.5 18h15M4.5 18L3.5 8l5 4 3.5-7 3.5 7 5-4-1 10"/>` },
  { id: 'thorns', el: 'ἄκανθαι', ru: 'Терновый венец', en: 'Crown of thorns',
    svg: `<circle cx="12" cy="12" r="6"/>${rays(12, 6, 9, 12, 12, 15)}` },
  { id: 'key', el: 'κλείς', ru: 'Ключ', en: 'Key',
    svg: `<circle cx="7" cy="12" r="3.5"/><path d="M10.5 12H21M17 12v3M20 12v2.5"/>` },
  { id: 'coin', el: 'λεπτόν', ru: 'Лепта', en: "Widow's mite",
    svg: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5.5"/><path d="M12 9.5v5M9.5 12h5"/>` },
  { id: 'heart', el: 'καρδία', ru: 'Сердце', en: 'Heart',
    svg: `<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>` },
  { id: 'hourglass', el: 'ὥρα', ru: 'Час', en: 'Hourglass',
    svg: `<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>` },

  // — Буквы —
  { id: 'alpha', el: 'Ἄλφα', ru: 'Альфа — начало', en: 'Alpha', svg: letter('Α') },
  { id: 'omega', el: 'Ὦ μέγα', ru: 'Омега — конец', en: 'Omega', svg: letter('Ω') },
  { id: 'phi', el: 'φῶς', ru: 'Свет', en: 'Light', svg: letter('Φ') },
  { id: 'zeta', el: 'ζωή', ru: 'Жизнь', en: 'Life', svg: letter('Ζ') },
  { id: 'theta', el: 'Θεός', ru: 'Бог', en: 'God', svg: letter('Θ') },
  { id: 'sigma', el: 'σιωπή', ru: 'Тишина', en: 'Silence', svg: letter('Σ') },
];

export const iconById = (id) => ICONS.find((i) => i.id === id) || ICONS[0];

export function iconSVG(id, cls = '') {
  const ic = iconById(id);
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic.svg}</svg>`;
}

// Большие фоновые орнаменты
export const ORNAMENTS = {
  none: { ru: 'Нет', el: '—' },
  wheel: { ru: 'Колесо ΙΧΘΥΣ', el: 'ΙΧΘΥΣ', icon: 'wheel' },
  chirho: { ru: 'Хризма', el: 'Χριστός', icon: 'chirho' },
  alphaomega: { ru: 'Альфа и Омега', el: 'Α Ω', icon: 'alphaomega' },
  star: { ru: 'Вифлеемская звезда', el: 'ἀστήρ', icon: 'star' },
  thorns: { ru: 'Венец', el: 'στέφανος', icon: 'thorns' },
};
