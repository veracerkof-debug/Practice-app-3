// Жесты на главном экране: свайпы в 4 стороны, двойной тап, долгое нажатие.
// Долгое нажатие на приложении или значке панели открывает его редактор.

const LONG_MS = 520;
const SWIPE_PX = 48;
const DOUBLE_MS = 300;

export function attachGestures(el, { onGesture, isBlocked }) {
  let start = null;
  let longTimer = null;
  let lastTap = null;
  let halo = null;

  const target = (e) => e.target.closest('.app, .dock-btn, .clock-wrap, .date');

  const clearHalo = () => {
    if (!halo) return;
    const hEl = halo;
    hEl.classList.add('out');
    setTimeout(() => hEl.remove(), 300);
    halo = null;
  };

  el.addEventListener('pointerdown', (e) => {
    if (isBlocked() || e.button > 0) return;
    start = { x: e.clientX, y: e.clientY, t: performance.now(), el: target(e), moved: false, long: false };
    halo = document.createElement('div');
    halo.className = 'halo';
    halo.style.left = e.clientX + 'px';
    halo.style.top = e.clientY + 'px';
    document.body.append(halo);
    requestAnimationFrame(() => halo?.classList.add('grow'));
    longTimer = setTimeout(() => {
      if (!start || start.moved) return;
      start.long = true;
      navigator.vibrate?.(12);
      clearHalo();
      if (start.el?.longPress) start.el.longPress();
      else onGesture('longPress');
    }, LONG_MS);
  });

  el.addEventListener('pointermove', (e) => {
    if (!start) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) {
      start.moved = true;
      clearTimeout(longTimer);
      clearHalo();
    }
  });

  const end = (e) => {
    clearTimeout(longTimer);
    clearHalo();
    if (!start) return;
    const s = start;
    start = null;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const dt = performance.now() - s.t;

    // подавляем click после свайпа/долгого нажатия
    if (s.el && (s.long || s.moved)) {
      s.el.dataset.suppress = '1';
      setTimeout(() => delete s.el.dataset.suppress, 50);
    }
    if (s.long) return;

    if (s.moved && dt < 800) {
      const ax = Math.abs(dx), ay = Math.abs(dy);
      if (Math.max(ax, ay) < SWIPE_PX) return;
      if (ay > ax) onGesture(dy < 0 ? 'swipeUp' : 'swipeDown');
      else onGesture(dx < 0 ? 'swipeLeft' : 'swipeRight');
      return;
    }
    if (s.moved || s.el || e.target.closest('button')) { lastTap = null; return; }

    // двойной тап — только по пустому месту
    const now = performance.now();
    if (lastTap && now - lastTap.t < DOUBLE_MS && Math.hypot(s.x - lastTap.x, s.y - lastTap.y) < 40) {
      lastTap = null;
      onGesture('doubleTap');
    } else {
      lastTap = { t: now, x: s.x, y: s.y };
    }
  };

  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', () => { clearTimeout(longTimer); clearHalo(); start = null; });
  el.addEventListener('contextmenu', (e) => e.preventDefault());

  // колесо мыши / тачпад: прокрутка вниз = свайп вверх (открыть все приложения)
  let wheelLock = 0;
  el.addEventListener('wheel', (e) => {
    if (isBlocked() || Date.now() < wheelLock || Math.abs(e.deltaY) < 30) return;
    wheelLock = Date.now() + 700;
    onGesture(e.deltaY > 0 ? 'swipeUp' : 'swipeDown');
  }, { passive: true });
}

export const GESTURES = [
  { id: 'swipeUp', ru: 'Свайп вверх', el: 'ἄνω', glyph: '↑' },
  { id: 'swipeDown', ru: 'Свайп вниз', el: 'κάτω', glyph: '↓' },
  { id: 'swipeLeft', ru: 'Свайп влево', el: 'ἀριστερά', glyph: '←' },
  { id: 'swipeRight', ru: 'Свайп вправо', el: 'δεξιά', glyph: '→' },
  { id: 'doubleTap', ru: 'Двойной тап', el: 'δίς', glyph: '··' },
  { id: 'longPress', ru: 'Долгое нажатие', el: 'μένε', glyph: '◯' },
  { id: 'clockTap', ru: 'Нажатие на часы', el: 'ὥρα', glyph: '◷' },
  { id: 'dateTap', ru: 'Нажатие на дату', el: 'ἡμέρα', glyph: '▦' },
];
