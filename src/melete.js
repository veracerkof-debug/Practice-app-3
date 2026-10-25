// Связь с Melete (музыкальное приложение-компаньон): читаем его файл данных Data/melete-data.json
// из «папки Melete» и считаем чтение Библии на сегодня и практику за неделю.
// Правила расчёта совпадают с Melete: src/core/bible.js, reading.js, stats.js, time.js — иначе цифры разойдутся.
// Ключи глав — «КОД.глава» (коды eBible, синодальный порядок: соборные послания после Деяний).

export const MELETE_PACKAGE = 'app.melete';
export const MELETE_DATA_PATH = 'Data/melete-data.json';

const RAW = [
  ['GEN', 'Быт', 50], ['EXO', 'Исх', 40], ['LEV', 'Лев', 27], ['NUM', 'Чис', 36], ['DEU', 'Втор', 34], ['JOS', 'Нав', 24],
  ['JDG', 'Суд', 21], ['RUT', 'Руф', 4], ['1SA', '1Цар', 31], ['2SA', '2Цар', 24], ['1KI', '3Цар', 22], ['2KI', '4Цар', 25],
  ['1CH', '1Пар', 29], ['2CH', '2Пар', 36], ['EZR', 'Езд', 10], ['NEH', 'Неем', 13], ['EST', 'Есф', 10], ['JOB', 'Иов', 42],
  ['PSA', 'Пс', 150], ['PRO', 'Притч', 31], ['ECC', 'Еккл', 12], ['SOL', 'Песн', 8], ['ISA', 'Ис', 66], ['JER', 'Иер', 52],
  ['LAM', 'Плач', 5], ['EZE', 'Иез', 48], ['DAN', 'Дан', 12], ['HOS', 'Ос', 14], ['JOE', 'Иоил', 3], ['AMO', 'Ам', 9],
  ['OBA', 'Авд', 1], ['JON', 'Ион', 4], ['MIC', 'Мих', 7], ['NAH', 'Наум', 3], ['HAB', 'Авв', 3], ['ZEP', 'Соф', 3],
  ['HAG', 'Агг', 2], ['ZEC', 'Зах', 14], ['MAL', 'Мал', 4],
  ['MAT', 'Мф', 28], ['MAR', 'Мк', 16], ['LUK', 'Лк', 24], ['JOH', 'Ин', 21], ['ACT', 'Деян', 28], ['JAM', 'Иак', 5],
  ['1PE', '1Пет', 5], ['2PE', '2Пет', 3], ['1JO', '1Ин', 5], ['2JO', '2Ин', 1], ['3JO', '3Ин', 1], ['JUD', 'Иуд', 1],
  ['ROM', 'Рим', 16], ['1CO', '1Кор', 16], ['2CO', '2Кор', 13], ['GAL', 'Гал', 6], ['EPH', 'Еф', 6], ['PHI', 'Флп', 4],
  ['COL', 'Кол', 4], ['1TH', '1Фес', 5], ['2TH', '2Фес', 3], ['1TI', '1Тим', 6], ['2TI', '2Тим', 4], ['TIT', 'Тит', 3],
  ['PHM', 'Флм', 1], ['HEB', 'Евр', 13], ['REV', 'Откр', 22],
];
const BOOKS = RAW.map(([code, abbr, chapters], i) => ({ code, abbr, chapters, nt: i >= 39 }));
const chapters = (books) => books.flatMap((b) => Array.from({ length: b.chapters }, (_, k) => `${b.code}.${k + 1}`));
const ALL = chapters(BOOKS);
const OT = chapters(BOOKS.filter((b) => !b.nt));
const NT = chapters(BOOKS.filter((b) => b.nt));
const ofCodes = (codes) => chapters(BOOKS.filter((b) => codes.includes(b.code)));

// день i — главы с floor(i·N/D) по floor((i+1)·N/D)
const spread = (list, days) => Array.from({ length: days }, (_, i) => list.slice(Math.floor((i * list.length) / days), Math.floor(((i + 1) * list.length) / days)));
const join = (...parts) => (i) => parts.flatMap((p) => p[i] || []);

const PLANS = {
  year: { days: 365, day: join(spread(ALL, 365)), name: 'Библия за год' },
  yearpar: { days: 365, day: join(spread(OT, 365), spread(NT, 365)), name: 'Ветхий и Новый Завет' },
  nt90: { days: 90, day: join(spread(NT, 90)), name: 'Новый Завет за 90 дней' },
  psprov: { days: 31, day: join(spread(ofCodes(['PSA']), 31), spread(ofCodes(['PRO']), 31)), name: 'Псалтирь и Притчи' },
};

function planOf(b) {
  if (PLANS[b.plan]) return PLANS[b.plan];
  const c = (b.custom || []).find((x) => x.id === b.plan);
  if (!c) return null;
  const list = ofCodes(c.books || []);
  if (!list.length) return null;
  const days = Math.max(1, Math.min(Math.round(+c.days) || 1, list.length));
  return { days, day: join(spread(list, days)), name: c.name };
}

const dayNum = (key) => { const [y, m, d] = key.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// «Быт 1–3; Мф 5»
export function refText(keys) {
  const parts = [];
  keys.forEach((k) => {
    const [code, c] = k.split('.');
    const ch = +c;
    const last = parts.at(-1);
    if (last && last.code === code && last.to === ch - 1) last.to = ch;
    else parts.push({ code, from: ch, to: ch });
  });
  return parts.map((p) => `${BOOKS.find((b) => b.code === p.code)?.abbr || p.code} ${p.from === p.to ? p.from : `${p.from}–${p.to}`}`).join('; ');
}

export function readingToday(bible, now = new Date()) {
  if (!bible?.plan || !bible.start) return null;
  const p = planOf(bible);
  if (!p) return null;
  const i = dayNum(dayKey(now)) - dayNum(bible.start);
  if (i < 0 || i >= p.days) return { plan: p.name, finished: i >= p.days, day: i + 1, days: p.days };
  const keys = p.day(i);
  const read = bible.read || {};
  return { plan: p.name, day: i + 1, days: p.days, ref: refText(keys), total: keys.length, done: keys.filter((k) => read[k]).length };
}

const weekStart = (now) => { const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };

export function practiceWeek(sessions = [], settings = {}, now = new Date()) {
  const ws = weekStart(now), we = ws + 7 * 864e5;
  const per = Array(7).fill(0);
  let total = 0;
  for (const s of sessions) {
    if (s.deleted || s.clk === 'bad' || !(s.start >= ws && s.start < we)) continue;
    const wd = (new Date(s.start).getDay() + 6) % 7;
    per[wd] += s.dur || 0;
    total += s.dur || 0;
  }
  const goalMin = settings.goalMin || 300;
  return { total, per, goal: goalMin * 60, progress: total / Math.max(1, goalMin * 60), days: settings.days || [1, 1, 1, 1, 1, 0, 0] };
}

// Из полного файла Melete берём только то, что нужно лаунчеру
export function digest(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.sessions)) throw new Error('not melete');
  return {
    bible: data.settings?.bible || null,
    goal: { goalMin: data.settings?.goalMin, days: data.settings?.days },
    sessions: data.sessions.filter((s) => !s.deleted).map((s) => ({ start: s.start, dur: s.dur, clk: s.clk })),
    savedAt: data.updatedAt || data.backupInfo?.at || null,
  };
}

export const fmtDur = (sec) => {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} ч ${r} мин` : `${h} ч`;
};
