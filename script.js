'use strict';
const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
function syncThemeButton() {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : systemTheme.matches;
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  themeButton.querySelector('.theme-label').textContent = dark ? 'Light mode' : 'Dark mode';
}
syncThemeButton();
systemTheme.addEventListener('change', syncThemeButton);
themeButton.addEventListener('click', () => {
  const dark = themeButton.getAttribute('aria-pressed') === 'true';
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (error) { /* The toggle also works without storage. */ }
  syncThemeButton();
});
document.querySelector('#year').textContent = new Date().getFullYear();

// Each answer reveals the same twist; reset restores the initial state and focus.
const quiz = document.querySelector('.truth-quiz');
if (quiz) {
  const options = [...quiz.querySelectorAll('.quiz-option')];
  const result = quiz.querySelector('.quiz-result');
  let selectedOption = null;
  options.forEach((option) => {
    option.addEventListener('click', () => {
      options.forEach((other) => other.setAttribute('aria-pressed', String(other === option)));
      selectedOption = option;
      result.hidden = false;
    });
  });
  quiz.querySelector('.quiz-reset').addEventListener('click', () => {
    result.hidden = true;
    options.forEach((option) => option.setAttribute('aria-pressed', 'false'));
    if (selectedOption) selectedOption.focus();
    selectedOption = null;
  });
}

// Keep company names visible if a third-party logo is unavailable.
document.querySelectorAll('.company-logo').forEach((logo) => {
  const hideUnavailableLogo = () => { logo.hidden = true; };
  logo.addEventListener('error', hideUnavailableLogo);
  if (logo.complete && logo.naturalWidth === 0) hideUnavailableLogo();
});

// Type once; the accessible heading and no-JavaScript copy stay complete.
const typingTitle = document.querySelector('.hero-title');
if (typingTitle) {
  const prefix = document.querySelector('#typewriter-prefix');
  const name = document.querySelector('#typewriter-name');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const strike = document.querySelector('.animated-strike');
  const segments = [{ element: prefix, text: "Hi, I'm " }, { element: name, text: 'Joline' }];
  let typingTimer;
  function finishTyping() {
    clearTimeout(typingTimer);
    segments.forEach(({ element, text }) => { element.textContent = text; });
    if (strike) strike.classList.add('is-struck');
    typingTitle.classList.remove('is-typing');
    typingTitle.classList.add('typing-complete');
  }
  if (!reducedMotion.matches) {
    segments.forEach(({ element }) => { element.textContent = ''; });
    typingTitle.classList.add('is-typing');
    let segmentIndex = 0;
    let characterIndex = 0;
    function typeCharacter() {
      const segment = segments[segmentIndex];
      segment.element.textContent += segment.text[characterIndex++];
      if (characterIndex === segment.text.length) {
        segmentIndex++;
        if (segmentIndex === 1 && strike) strike.classList.add('is-struck');
        characterIndex = 0;
      }
      if (segmentIndex < segments.length) {
        typingTimer = setTimeout(typeCharacter, 80 + Math.random() * 20);
      } else {
        typingTimer = setTimeout(finishTyping, 3000);
      }
    }
    typingTimer = setTimeout(typeCharacter, 300);
  }
  if (reducedMotion.matches) finishTyping();
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) finishTyping();
  });
}

// Measure the actual sticky header so the opening hero fills the remaining viewport.
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const syncHeaderHeight = () => {
    root.style.setProperty('--nav-height', `${siteHeader.getBoundingClientRect().height}px`);
  };
  syncHeaderHeight();
  if ('ResizeObserver' in window) new ResizeObserver(syncHeaderHeight).observe(siteHeader);
}
// Native anchors keep URLs and no-JavaScript navigation; CSS supplies smooth scrolling.

// Photo paths are ready for personal assets; retain solid fills until files exist.
document.querySelectorAll('.orb-surface img').forEach((image) => {
  const hideMissingPhoto = () => { image.hidden = true; };
  image.addEventListener('error', hideMissingPhoto);
  if (image.complete && image.naturalWidth === 0) hideMissingPhoto();
});

// Magnetic offsets compose with ambient transforms rather than replacing them.
const magneticHero = document.querySelector('.hero');
if (magneticHero) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const circles = [...magneticHero.querySelectorAll('.geo-orb')].map((element) => ({
    element, x: 0, y: 0,
    easing: Math.max(0.045, Math.min(0.11, 16 / element.offsetWidth))
  }));
  const cursor = { x: 0, y: 0, active: false };
  let frame = 0;
  let previousTime = 0;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function animateMagnet(time) {
    frame = 0;
    const elapsed = previousTime ? Math.min(40, time - previousTime) : 16.67;
    previousTime = time;
    const heroBounds = magneticHero.getBoundingClientRect();
    let settling = false;
    // Read all bounds before writing offsets to avoid repeated style/layout work.
    const updates = circles.map((circle) => {
      const bounds = circle.element.getBoundingClientRect();
      const baseLeft = bounds.left - circle.x;
      const baseTop = bounds.top - circle.y;
      const dx = cursor.x - (baseLeft + bounds.width / 2);
      const dy = cursor.y - (baseTop + bounds.height / 2);
      const distance = Math.hypot(dx, dy);
      const radius = 220;
      const pull = cursor.active && distance < radius ? (1 - distance / radius) * 0.35 : 0;
      let targetX = clamp(dx * pull, -32, 32);
      let targetY = clamp(dy * pull, -32, 32);
      // Retain padding inside the viewport and the hero, even near its perimeter.
      targetX = clamp(targetX, Math.min(0, 12 - baseLeft), Math.max(0, innerWidth - 12 - baseLeft - bounds.width));
      targetY = clamp(targetY, Math.min(0, heroBounds.top + 12 - baseTop), Math.max(0, heroBounds.bottom - 12 - baseTop - bounds.height));
      const easing = 1 - Math.pow(1 - circle.easing, elapsed / 16.67);
      circle.x += (targetX - circle.x) * easing;
      circle.y += (targetY - circle.y) * easing;
      if (!cursor.active && Math.abs(circle.x) < 0.05 && Math.abs(circle.y) < 0.05) {
        circle.x = 0;
        circle.y = 0;
      }
      if (circle.x !== 0 || circle.y !== 0) settling = true;
      return circle;
    });
    updates.forEach(({ element, x, y }) => {
      element.style.setProperty('--magnet-x', `${x}px`);
      element.style.setProperty('--magnet-y', `${y}px`);
    });
    if (cursor.active || settling) frame = requestAnimationFrame(animateMagnet);
    else previousTime = 0;
  }
  function wakeMagnet() {
    if (!frame && !motionPreference.matches && !document.hidden) frame = requestAnimationFrame(animateMagnet);
  }
  function releaseMagnet() {
    cursor.active = false;
    wakeMagnet();
  }
  magneticHero.addEventListener('mousemove', (event) => {
    if (motionPreference.matches || !finePointer.matches || document.hidden) return;
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    cursor.active = true;
    wakeMagnet();
  }, { passive: true });
  magneticHero.addEventListener('mouseleave', releaseMagnet);
  window.addEventListener('scroll', releaseMagnet, { passive: true });
  window.addEventListener('blur', releaseMagnet);
  function resetMagnet() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    cursor.active = false;
    circles.forEach((circle) => {
      circle.x = circle.y = 0;
      circle.element.style.removeProperty('--magnet-x');
      circle.element.style.removeProperty('--magnet-y');
    });
  }
  motionPreference.addEventListener('change', resetMagnet);
  finePointer.addEventListener('change', resetMagnet);
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetMagnet(); });
  window.addEventListener('resize', resetMagnet, { passive: true });
}

// A throttled hero-only trail: no timers or animation loop while the mouse is idle.
const noteHero = document.querySelector('#hero');
if (noteHero) {
  const particleLayer = document.createElement('div');
  particleLayer.className = 'hero-particles';
  particleLayer.setAttribute('aria-hidden', 'true');
  noteHero.append(particleLayer);
  const reducedNotes = window.matchMedia('(prefers-reduced-motion: reduce)');
  const notePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const glyphs = ['♩', '♪'];
  const liveNotes = new Map();
  let glyphIndex = 0;
  let lastNoteTime = -Infinity;
  function removeNote(note) {
    clearTimeout(liveNotes.get(note));
    liveNotes.delete(note);
    note.remove();
  }
  function clearNotes() {
    liveNotes.forEach((timeout, note) => {
      clearTimeout(timeout);
      note.remove();
    });
    liveNotes.clear();
    lastNoteTime = -Infinity;
  }
  noteHero.addEventListener('mousemove', (event) => {
    if (reducedNotes.matches || !notePointer.matches || document.hidden) return;
    const now = performance.now();
    if (now - lastNoteTime < 200 || liveNotes.size >= 4) return;
    const bounds = noteHero.getBoundingClientRect();
    const headerBottom = siteHeader ? siteHeader.getBoundingClientRect().bottom : 0;
    if (bounds.bottom <= headerBottom || event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < Math.max(bounds.top, headerBottom) || event.clientY > bounds.bottom) return;
    lastNoteTime = now;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : systemTheme.matches;
    const palette = dark ? ['#C5D5DF', '#EDEFE9'] : ['#6B8B9B', '#AFC2CD', '#333B42'];
    const note = document.createElement('span');
    note.className = 'music-particle';
    note.setAttribute('aria-hidden', 'true');
    note.textContent = glyphs[glyphIndex++ % glyphs.length];
    const duration = 1000;
    const size = 24 + Math.random() * 4;
    // Keep exact tip coordinates even at the screen edges; the layer clips drift.
    const x = event.clientX - bounds.left;
    // The baton hotspot (27, 5) is its tip, so event coordinates anchor the trail.
    const y = event.clientY - bounds.top;
    note.style.left = `${x}px`;
    note.style.top = `${y}px`;
    note.style.fontSize = `${size}px`;
    note.style.color = palette[Math.floor(Math.random() * palette.length)];
    note.style.setProperty('--note-duration', `${duration}ms`);
    note.style.setProperty('--note-drift', `${Math.random() * 24 - 12}px`);
    note.style.setProperty('--note-rise', '-40px');
    note.style.setProperty('--note-rotation', `${Math.random() * 36 - 18}deg`);
    note.addEventListener('animationend', () => removeNote(note), { once: true });
    particleLayer.append(note);
    // A timeout also cleans up if animationend is suppressed by browser settings.
    liveNotes.set(note, setTimeout(() => removeNote(note), duration + 100));
  }, { passive: true });
  noteHero.addEventListener('mouseleave', clearNotes);
  window.addEventListener('scroll', clearNotes, { passive: true });
  window.addEventListener('blur', clearNotes);
  reducedNotes.addEventListener('change', clearNotes);
  notePointer.addEventListener('change', clearNotes);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearNotes(); });
}
