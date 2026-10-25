// Стихи: койне (греческий оригинал / Септуагинта), Синодальный перевод, KJV.
// Все тексты — общественное достояние.

export const VERSES = [
  { az: 'Jn.1:1', ref: { ru: 'Ин 1:1', en: 'John 1:1' },
    el: 'Ἐν ἀρχῇ ἦν ὁ λόγος',
    ru: 'В начале было Слово',
    en: 'In the beginning was the Word' },
  { az: 'Lk.10:41', ref: { ru: 'Лк 10:41–42', en: 'Luke 10:41–42' },
    el: 'μεριμνᾷς καὶ θορυβάζῃ περὶ πολλά, ἑνὸς δέ ἐστιν χρεία',
    ru: 'Ты заботишься и суетишься о многом, а одно только нужно',
    en: 'Thou art careful and troubled about many things: but one thing is needful' },
  { az: 'Ps.45:11', ref: { ru: 'Пс 45:11', en: 'Psalm 46:10' },
    el: 'σχολάσατε καὶ γνῶτε ὅτι ἐγώ εἰμι ὁ θεός',
    ru: 'Остановитесь и познайте, что Я — Бог',
    en: 'Be still, and know that I am God' },
  { az: 'Eph.5:16', ref: { ru: 'Еф 5:16', en: 'Ephesians 5:16' },
    el: 'ἐξαγοραζόμενοι τὸν καιρόν',
    ru: 'Дорожа временем',
    en: 'Redeeming the time' },
  { az: 'Ps.118:105', ref: { ru: 'Пс 118:105', en: 'Psalm 119:105' },
    el: 'λύχνος τοῖς ποσίν μου ὁ λόγος σου',
    ru: 'Слово Твое — светильник ноге моей',
    en: 'Thy word is a lamp unto my feet' },
  { az: 'Mk.4:39', ref: { ru: 'Мк 4:39', en: 'Mark 4:39' },
    el: 'Σιώπα, πεφίμωσο',
    ru: 'Умолкни, перестань',
    en: 'Peace, be still' },
  { az: 'Mt.11:28', ref: { ru: 'Мф 11:28', en: 'Matthew 11:28' },
    el: 'Δεῦτε πρός με πάντες οἱ κοπιῶντες καὶ πεφορτισμένοι, κἀγὼ ἀναπαύσω ὑμᾶς',
    ru: 'Придите ко Мне, все труждающиеся и обремененные, и Я успокою вас',
    en: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest' },
  { az: 'Jn.8:12', ref: { ru: 'Ин 8:12', en: 'John 8:12' },
    el: 'Ἐγώ εἰμι τὸ φῶς τοῦ κόσμου',
    ru: 'Я свет миру',
    en: 'I am the light of the world' },
  { az: 'Jn.1:5', ref: { ru: 'Ин 1:5', en: 'John 1:5' },
    el: 'καὶ τὸ φῶς ἐν τῇ σκοτίᾳ φαίνει, καὶ ἡ σκοτία αὐτὸ οὐ κατέλαβεν',
    ru: 'И свет во тьме светит, и тьма не объяла его',
    en: 'And the light shineth in darkness; and the darkness comprehended it not' },
  { az: '1Jn.4:8', ref: { ru: '1 Ин 4:8', en: '1 John 4:8' },
    el: 'ὁ θεὸς ἀγάπη ἐστίν',
    ru: 'Бог есть любовь',
    en: 'God is love' },
  { az: 'Apok.22:13', ref: { ru: 'Откр 22:13', en: 'Revelation 22:13' },
    el: 'Ἐγὼ τὸ Ἄλφα καὶ τὸ Ὦ, ὁ πρῶτος καὶ ὁ ἔσχατος, ἡ ἀρχὴ καὶ τὸ τέλος',
    ru: 'Я есмь Альфа и Омега, начало и конец, Первый и Последний',
    en: 'I am Alpha and Omega, the beginning and the end, the first and the last' },
  { az: 'Eccl.3:1', ref: { ru: 'Еккл 3:1', en: 'Ecclesiastes 3:1' },
    el: 'τοῖς πᾶσιν χρόνος, καὶ καιρὸς τῷ παντὶ πράγματι ὑπὸ τὸν οὐρανόν',
    ru: 'Всему свое время, и время всякой вещи под небом',
    en: 'To every thing there is a season, and a time to every purpose under the heaven' },
  { az: '1Thes.5:17', ref: { ru: '1 Фес 5:17', en: '1 Thessalonians 5:17' },
    el: 'ἀδιαλείπτως προσεύχεσθε',
    ru: 'Непрестанно молитесь',
    en: 'Pray without ceasing' },
  { az: 'Mt.6:34', ref: { ru: 'Мф 6:34', en: 'Matthew 6:34' },
    el: 'μὴ οὖν μεριμνήσητε εἰς τὴν αὔριον',
    ru: 'Не заботьтесь о завтрашнем дне',
    en: 'Take therefore no thought for the morrow' },
  { az: 'Jn.14:6', ref: { ru: 'Ин 14:6', en: 'John 14:6' },
    el: 'Ἐγώ εἰμι ἡ ὁδὸς καὶ ἡ ἀλήθεια καὶ ἡ ζωή',
    ru: 'Я есмь путь и истина и жизнь',
    en: 'I am the way, the truth, and the life' },
  { az: 'Gen.1:3', ref: { ru: 'Быт 1:3', en: 'Genesis 1:3' },
    el: 'Γενηθήτω φῶς. καὶ ἐγένετο φῶς',
    ru: 'Да будет свет. И стал свет',
    en: 'Let there be light: and there was light' },
  { az: '1Cor.13:13', ref: { ru: '1 Кор 13:13', en: '1 Corinthians 13:13' },
    el: 'νυνὶ δὲ μένει πίστις, ἐλπίς, ἀγάπη, τὰ τρία ταῦτα· μείζων δὲ τούτων ἡ ἀγάπη',
    ru: 'А теперь пребывают сии три: вера, надежда, любовь; но любовь из них больше',
    en: 'And now abideth faith, hope, charity, these three; but the greatest of these is charity' },
  { az: 'Mt.5:8', ref: { ru: 'Мф 5:8', en: 'Matthew 5:8' },
    el: 'μακάριοι οἱ καθαροὶ τῇ καρδίᾳ, ὅτι αὐτοὶ τὸν θεὸν ὄψονται',
    ru: 'Блаженны чистые сердцем, ибо они Бога узрят',
    en: 'Blessed are the pure in heart: for they shall see God' },
  { az: 'Ps.22:1', ref: { ru: 'Пс 22:1', en: 'Psalm 23:1' },
    el: 'Κύριος ποιμαίνει με, καὶ οὐδέν με ὑστερήσει',
    ru: 'Господь — Пастырь мой; я ни в чем не буду нуждаться',
    en: 'The LORD is my shepherd; I shall not want' },
  { az: 'Rom.12:12', ref: { ru: 'Рим 12:12', en: 'Romans 12:12' },
    el: 'τῇ ἐλπίδι χαίροντες, τῇ θλίψει ὑπομένοντες, τῇ προσευχῇ προσκαρτεροῦντες',
    ru: 'Утешайтесь надеждою; в скорби будьте терпеливы, в молитве постоянны',
    en: 'Rejoicing in hope; patient in tribulation; continuing instant in prayer' },
  { az: 'Hebr.13:8', ref: { ru: 'Евр 13:8', en: 'Hebrews 13:8' },
    el: 'Ἰησοῦς Χριστὸς ἐχθὲς καὶ σήμερον ὁ αὐτός, καὶ εἰς τοὺς αἰῶνας',
    ru: 'Иисус Христос вчера и сегодня и во веки Тот же',
    en: 'Jesus Christ the same yesterday, and to day, and for ever' },
  { az: 'Phil.4:13', ref: { ru: 'Флп 4:13', en: 'Philippians 4:13' },
    el: 'πάντα ἰσχύω ἐν τῷ ἐνδυναμοῦντί με',
    ru: 'Все могу в укрепляющем меня',
    en: 'I can do all things through Christ which strengtheneth me' },
];

export function verseOfDay(date = new Date(), offset = 0) {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date - start) / 86400000);
  const n = VERSES.length;
  return ((((day + offset) % n) + n) % n);
}

// — Греческие (ионийские) числа: ιηʹ —
const G_UNITS = ['', 'α', 'β', 'γ', 'δ', 'ε', 'ϛ', 'ζ', 'η', 'θ'];
const G_TENS = ['', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ϙ'];
const G_HUND = ['', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'ϡ'];

export function greekNumeral(n, keraia = true) {
  if (n === 0) return 'ō'; // ноль Птолемея
  const s = G_HUND[Math.floor(n / 100) % 10] + G_TENS[Math.floor(n / 10) % 10] + G_UNITS[n % 10];
  return keraia ? s + 'ʹ' : s;
}

export function romanNumeral(n) {
  if (n === 0) return 'N'; // nulla
  const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}

// — Литургические часы —
export const CANONICAL_HOURS = [
  { from: 0, ru: 'Полунощница', el: 'Μεσονυκτικόν' },
  { from: 3, ru: 'Утреня', el: 'Ὄρθρος' },
  { from: 6, ru: 'Час первый', el: 'Ὥρα αʹ' },
  { from: 9, ru: 'Час третий', el: 'Ὥρα γʹ' },
  { from: 12, ru: 'Час шестой', el: 'Ὥρα ϛʹ' },
  { from: 15, ru: 'Час девятый', el: 'Ὥρα θʹ' },
  { from: 18, ru: 'Вечерня', el: 'Ἑσπερινός' },
  { from: 21, ru: 'Повечерие', el: 'Ἀπόδειπνον' },
];
export const canonicalHour = (h) => [...CANONICAL_HOURS].reverse().find((c) => h >= c.from);

// — Числа словами —
const RU1 = ['ноль', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
const RU10 = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят'];
const EN1 = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN10 = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];
const EL1 = ['μηδέν', 'μία', 'δύο', 'τρεις', 'τέσσερις', 'πέντε', 'έξι', 'επτά', 'οκτώ', 'εννέα', 'δέκα', 'έντεκα', 'δώδεκα', 'δεκατρία', 'δεκατέσσερα', 'δεκαπέντε', 'δεκαέξι', 'δεκαεπτά', 'δεκαοκτώ', 'δεκαεννέα'];
const EL10 = ['', '', 'είκοσι', 'τριάντα', 'σαράντα', 'πενήντα'];

export function numberWords(n, lang, isMinute = false) {
  const [ones, tens] = lang === 'en' ? [EN1, EN10] : lang === 'el' ? [EL1, EL10] : [RU1, RU10];
  if (isMinute && n === 0) return lang === 'en' ? "o'clock" : lang === 'el' ? 'ακριβώς' : 'ровно';
  if (isMinute && n < 10 && lang === 'en') return 'oh ' + ones[n];
  if (n < 20) {
    if (lang === 'ru' && isMinute && n === 1) return 'одна';
    if (lang === 'ru' && isMinute && n === 2) return 'две';
    return ones[n];
  }
  const t = tens[Math.floor(n / 10)];
  const u = n % 10;
  if (!u) return t;
  let uw = ones[u];
  if (lang === 'ru' && isMinute && u === 1) uw = 'одна';
  if (lang === 'ru' && isMinute && u === 2) uw = 'две';
  if (lang === 'el' && u === 1) uw = 'ένα';
  return lang === 'en' ? `${t}-${uw}` : `${t} ${uw}`;
}

export const GREEK_WEEKDAYS = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
