'use strict';
const root = document.documentElement;
const tabletComposition = window.matchMedia('(min-width: 768px) and (max-width: 1199px), (min-width: 1200px) and (max-width: 1366px) and (hover: none) and (pointer: coarse)');
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

// The existing throttled trail spawns only over the hero; notes fade naturally on exit.
const noteHero = document.querySelector('#hero');
if (noteHero) {
  const particleLayer = document.createElement('div');
  particleLayer.className = 'cursor-particles';
  particleLayer.setAttribute('aria-hidden', 'true');
  document.body.append(particleLayer);
  const reducedNotes = window.matchMedia('(prefers-reduced-motion: reduce)');
  const notePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const noteAssets = [
    'music-notes/hand-drawn-note-1.svg',
    'music-notes/hand-drawn-note-2.svg',
    'music-notes/hand-drawn-note-3.svg'
  ];
  const cachedNotes = [];
  function preloadNotes() {
    if (cachedNotes.length || reducedNotes.matches || !notePointer.matches) return;
    noteAssets.forEach(src => {
      const image = new Image();
      image.src = src;
      cachedNotes.push(image);
    });
  }
  preloadNotes();
  const liveNotes = new Map();
  let noteIndex = 0;
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
    if (event.clientX < 0 || event.clientX > innerWidth || event.clientY < 0 || event.clientY > innerHeight) return;
    const bounds = noteHero.getBoundingClientRect();
    const headerBottom = siteHeader ? siteHeader.getBoundingClientRect().bottom : 0;
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < Math.max(bounds.top, headerBottom) || event.clientY > bounds.bottom) return;
    lastNoteTime = now;
    const note = document.createElement('img');
    note.className = 'music-particle';
    note.setAttribute('aria-hidden', 'true');
    note.alt = '';
    note.src = noteAssets[noteIndex++ % noteAssets.length];
    note.decoding = 'async';
    const duration = 1000;
    const size = 24 + Math.random() * 4;
    // Start beside the same hotspot; the viewport layer prevents edge overflow.
    const x = event.clientX + 10;
    const y = event.clientY + 8;
    note.style.left = `${x}px`;
    note.style.top = `${y}px`;
    note.style.height = `${size}px`;
    note.style.setProperty('--note-duration', `${duration}ms`);
    note.style.setProperty('--note-drift', `${Math.random() * 24 - 12}px`);
    note.style.setProperty('--note-rise', '-40px');
    note.style.setProperty('--note-rotation', `${Math.random() * 36 - 18}deg`);
    note.addEventListener('animationend', () => removeNote(note), { once: true });
    particleLayer.append(note);
    // A timeout also cleans up if animationend is suppressed by browser settings.
    liveNotes.set(note, setTimeout(() => removeNote(note), duration + 100));
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', clearNotes);
  window.addEventListener('blur', clearNotes);
  reducedNotes.addEventListener('change', clearNotes);
  notePointer.addEventListener('change', clearNotes);
  notePointer.addEventListener('change', preloadNotes);
  reducedNotes.addEventListener('change', preloadNotes);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearNotes(); });
}

// Match the hero's custom line, drawing only across the visible desktop word once.
const aboutStrike = document.querySelector('.about-dumb-strike');
if (aboutStrike) {
  const strikeOnce = () => aboutStrike.classList.add('is-struck');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .6)) {
        strikeOnce();
        observer.disconnect();
      }
    }, { threshold: .6 });
    observer.observe(aboutStrike);
  } else strikeOnce();
}

// Touch and keyboard users can hold a photo open; hover remains the default preview.
document.querySelectorAll('.photo-bubble').forEach((bubble) => {
  bubble.addEventListener('click', () => {
    const reveal = bubble.getAttribute('aria-pressed') !== 'true';
    document.querySelectorAll('.photo-bubble').forEach((other) => other.setAttribute('aria-pressed', 'false'));
    bubble.setAttribute('aria-pressed', String(reveal));
  });
  bubble.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') bubble.setAttribute('aria-pressed', 'false');
  });
});

// Count elapsed Glasgow calendar days so DST changes cannot add or remove a day.
const glasgowDayFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit'
});
function updateGlasgowProgress(now = new Date()) {
  const parts = Object.fromEntries(glasgowDayFormat.formatToParts(now).map((part) => [part.type, part.value]));
  const currentDay = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
  const elapsed = Math.max(0, Math.min(106, Math.floor((currentDay - Date.UTC(2026, 8, 10)) / 86400000)));
  const label = `Day ${elapsed} of 106`;
  document.querySelectorAll('[data-glasgow-progress]').forEach((badge) => {
    if (badge.textContent !== label) badge.textContent = label;
    badge.style.setProperty('--stay-progress', `${elapsed / 106 * 100}%`);
  });
  const pin = document.querySelector('.map-pin[data-city="Glasgow"]');
  if (pin) {
    pin.dataset.duration = label;
    pin.setAttribute('aria-label', `Glasgow, ${pin.dataset.country} · ${label} · ${pin.dataset.context}`);
    if (pin.getAttribute('aria-pressed') === 'true') {
      const category = document.querySelector('.city-category');
      if (category && category.textContent !== `Lived · ${label}`) category.textContent = `Lived · ${label}`;
    }
  }
}

// Two live local clocks, with automatic daylight-saving changes in each zone.
const atlantaClock = document.querySelector('#atlanta-clock');
const glasgowClock = document.querySelector('#glasgow-clock');
if (atlantaClock && glasgowClock) {
  const clockOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' };
  const atlantaFormat = new Intl.DateTimeFormat('en-US', { ...clockOptions, timeZone: 'America/New_York' });
  // en-GB names the UK zone BST/GMT instead of a generic GMT+1 offset.
  const glasgowFormat = new Intl.DateTimeFormat('en-GB', { ...clockOptions, timeZone: 'Europe/London' });
  function updateLocalClocks() {
    const now = new Date();
    atlantaClock.dateTime = glasgowClock.dateTime = now.toISOString();
    atlantaClock.textContent = atlantaFormat.format(now);
    glasgowClock.textContent = glasgowFormat.format(now).replace(/\b(am|pm)\b/g, (period) => period.toUpperCase());
    updateGlasgowProgress(now);
  }
  updateLocalClocks();
  setInterval(updateLocalClocks, 1000);
}

// The map runs entirely locally; its native select also exposes tightly grouped cities.
const travelMap = document.querySelector('.travel-map');
if (travelMap) {
  const canvas = travelMap.querySelector('.map-canvas');
  const geography = travelMap.querySelector('.world-geography');
  const pins = [...travelMap.querySelectorAll('.map-pin')];
  const tooltip = travelMap.querySelector('.map-tooltip');
  const travelSection = travelMap.closest('.travel-section');
  const picker = travelSection.querySelector('#travel-place');
  const cityDetails = travelSection.querySelector('.city-detail-content');
  const emptyDetails = travelSection.querySelector('.city-empty');
  const views = { world: [0, 0, 1000, 420], 'north-america': [40, 65, 350, 147], europe: [400, 40, 360, 151.2] };
  let selectedPin = null;
  let tooltipPin = null;
  function hideTooltip() {
    tooltip.hidden = true;
    tooltipPin = null;
    pins.forEach((pin) => pin.removeAttribute('aria-describedby'));
  }
  function positionTooltip(pin) {
    const board = canvas.getBoundingClientRect();
    const point = pin.getBoundingClientRect();
    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;
    const left = Math.max(8, Math.min(board.width - width - 8, point.left - board.left + 17));
    const top = Math.max(8, Math.min(board.height - height - 8, point.top - board.top - height - 6));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }
  function showTooltip(pin) {
    hideTooltip();
    tooltipPin = pin;
    tooltip.querySelector('strong').textContent = pin.dataset.city;
    tooltip.querySelector('.tooltip-country').textContent = pin.dataset.country;
    const date = pin.dataset.year
      ? `${pin.dataset.yearLabel ? pin.dataset.yearLabel.toLowerCase() + ' ' : ''}${pin.dataset.year}`
      : '';
    tooltip.querySelector('.tooltip-context').textContent = [pin.dataset.context, date].filter(Boolean).join(' · ');
    tooltip.hidden = false;
    pin.setAttribute('aria-describedby', 'map-tooltip');
    positionTooltip(pin);
  }
  function setView(name) {
    const [x, y, width, height] = views[name];
    geography.setAttribute('viewBox', views[name].join(' '));
    pins.forEach((pin) => {
      const px = (Number(pin.dataset.x) - x) / width * 100;
      const py = (Number(pin.dataset.y) - y) / height * 100;
      pin.hidden = px < 0 || px > 100 || py < 0 || py > 100;
      pin.style.left = `${px}%`;
      pin.style.top = `${py}%`;
    });
    travelMap.querySelectorAll('[data-map-view]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.mapView === name));
    });
    hideTooltip();
  }
  function selectPin(pin) {
    selectedPin = pin;
    pins.forEach((other) => other.setAttribute('aria-pressed', String(other === pin)));
    picker.value = String(pins.indexOf(pin));
    emptyDetails.hidden = true;
    cityDetails.hidden = false;
    cityDetails.querySelector('.city-detail-title').textContent = `${pin.dataset.city}, ${pin.dataset.country}`;
    const isStateOrDistrict = pin.dataset.kind === 'state' || pin.dataset.kind === 'district';
    cityDetails.querySelector('.city-category').textContent = pin.dataset.kind === 'lived' ? `Lived · ${pin.dataset.duration}`
      : pin.dataset.kind === 'state' ? 'Visited state'
      : pin.dataset.kind === 'district' ? 'Visited district' : 'Explored';
    const year = cityDetails.querySelector('.city-year');
    year.hidden = isStateOrDistrict;
    year.textContent = isStateOrDistrict ? '' : pin.dataset.year ? `${pin.dataset.yearLabel || 'Year'}: ${pin.dataset.year}` : 'Year not recorded';
    cityDetails.querySelector('.city-context').textContent = pin.dataset.context;
    showTooltip(pin);
  }
  pins.forEach((pin) => {
    pin.addEventListener('mouseenter', () => showTooltip(pin));
    pin.addEventListener('focus', () => showTooltip(pin));
    pin.addEventListener('mouseleave', () => { if (document.activeElement !== pin && selectedPin !== pin) hideTooltip(); });
    pin.addEventListener('blur', () => { if (selectedPin !== pin) hideTooltip(); });
    pin.addEventListener('click', () => selectPin(pin));
    pin.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        hideTooltip();
        selectedPin = null;
        pins.forEach((other) => other.setAttribute('aria-pressed', 'false'));
      }
    });
  });
  picker.addEventListener('change', () => {
    if (picker.value === '') {
      hideTooltip();
      selectedPin = null;
      pins.forEach((pin) => pin.setAttribute('aria-pressed', 'false'));
      cityDetails.hidden = true;
      emptyDetails.hidden = false;
      return;
    }
    const pin = pins[Number(picker.value)];
    if (pin.hidden) setView(pin.dataset.kind === 'state' || pin.dataset.kind === 'district' ? 'north-america' : 'world');
    selectPin(pin);
  });
  travelMap.querySelectorAll('[data-map-view]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.mapView));
  });
  canvas.addEventListener('mouseleave', () => { if (!selectedPin) hideTooltip(); });
  window.addEventListener('resize', () => { if (tooltipPin && !tooltipPin.hidden) positionTooltip(tooltipPin); });
}

// Count only on first entry; the accessible and no-JavaScript totals stay final.
const travelStats = document.querySelector('.travel-metrics');
if (travelStats) {
  const reduceCounters = window.matchMedia('(prefers-reduced-motion: reduce)');
  const counters = [...travelStats.querySelectorAll('.travel-counter')].map((element) => ({
    element, value: element.querySelector('.counter-value'), target: Number(element.dataset.target),
    displayed: Number(element.dataset.target), roll: null
  }));
  let counterFrame = 0;
  let counterObserver;
  let started = false;
  function lockCounters() {
    cancelAnimationFrame(counterFrame);
    counterFrame = 0;
    counters.forEach((counter) => {
      if (counter.roll) counter.roll.cancel();
      counter.value.textContent = String(counter.target);
      counter.displayed = counter.target;
    });
    travelStats.dataset.counterState = 'done';
    if (counterObserver) counterObserver.disconnect();
  }
  function startCounters() {
    if (started) return;
    started = true;
    if (counterObserver) counterObserver.disconnect();
    if (reduceCounters.matches) { lockCounters(); return; }
    travelStats.dataset.counterState = 'running';
    counters.forEach((counter) => { counter.displayed = 0; counter.value.textContent = '0'; });
    const start = performance.now();
    const duration = 1400;
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      counters.forEach((counter) => {
        const next = progress === 1 ? counter.target : Math.min(counter.target - 1, Math.floor(counter.target * eased));
        if (next === counter.displayed) return;
        counter.displayed = next;
        counter.value.textContent = String(next);
        if (counter.roll) counter.roll.cancel();
        if (typeof counter.value.animate === 'function') {
          counter.roll = counter.value.animate([
            { transform: 'translateY(35%)', opacity: 0.45 },
            { transform: 'translateY(0)', opacity: 1 }
          ], { duration: 90, easing: 'ease-out' });
        }
      });
      if (progress < 1) counterFrame = requestAnimationFrame(tick);
      else lockCounters();
    }
    counterFrame = requestAnimationFrame(tick);
  }
  if (reduceCounters.matches || !('IntersectionObserver' in window)) {
    started = true;
    lockCounters();
  } else {
    counterObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.3)) startCounters();
    }, { threshold: 0.3 });
    counterObserver.observe(travelStats);
  }
  reduceCounters.addEventListener('change', (event) => {
    if (event.matches) { started = true; lockCounters(); }
  });
}

// Match the invitation to the mobile photo controls, including viewport changes.
const circleHint = document.querySelector('.hero-hint em');
if (circleHint) {
  const mobileHero = window.matchMedia('(max-width: 768px)');
  const updateCircleHint = () => {
    circleHint.textContent = mobileHero.matches ? 'tap the circles' : 'hover over the circles';
  };
  updateCircleHint();
  mobileHero.addEventListener('change', updateCircleHint);
}

// YouTube may omit max-resolution artwork; retain a useful link if remote images fail.
const recitalThumbnail = document.querySelector('.youtube-thumb-img');
if (recitalThumbnail) {
  function thumbnailFallback() {
    if (!recitalThumbnail.dataset.fallbackTried) {
      recitalThumbnail.dataset.fallbackTried = 'true';
      recitalThumbnail.src = 'https://img.youtube.com/vi/0lXD4k-HBIo/hqdefault.jpg';
    } else {
      recitalThumbnail.hidden = true;
      recitalThumbnail.closest('.youtube-thumb-wrapper').classList.add('thumbnail-unavailable');
    }
  }
  recitalThumbnail.addEventListener('error', thumbnailFallback);
  recitalThumbnail.addEventListener('load', () => {
    if (recitalThumbnail.naturalWidth <= 120) thumbnailFallback();
  });
  if (recitalThumbnail.complete && recitalThumbnail.naturalWidth === 0) thumbnailFallback();
}


// Keep the supplied stickers in free paper space, never over foreground copy.
(() => {
  const work = document.querySelector('#work');
  const layer = work?.querySelector('.work-sticker-layer');
  if (!layer) return;
  const stickers = [...layer.querySelectorAll('.work-doodle-sticker')];
  function placeStickers() {
    const bounds = work.getBoundingClientRect();
    const rect = element => {
      const r = element.getBoundingClientRect();
      return { x: r.left - bounds.left, y: r.top - bounds.top, w: r.width, h: r.height };
    };
    const sentry = work.querySelector('.sentry-row > .experience-copy');
    const nina = work.querySelector('.sentry-row .work-endorsement');
    const quant = work.querySelector('.quanthub-row .experience-copy');
    const kellie = work.querySelector('.quanthub-row .work-endorsement');
    if (!sentry || !nina || !quant || !kellie) return;
    const centerY = element => { const r = rect(element); return r.y + r.h / 2; };
    const find = name => layer.querySelector(`.sticker-${name}`);
    if (tabletComposition.matches) {
      // The tablet grid reserves side pockets, not additional vertical rows.
      const gutter = parseFloat(getComputedStyle(work).paddingLeft);
      const placeInPocket = (name, card, side, desired, fraction) => {
        const element = find(name), r = rect(card);
        const left = side === 'right' ? r.x + r.w + 16 : gutter + 16;
        const right = side === 'right' ? bounds.width - gutter - 16 : r.x - 16;
        const ratio = element.naturalHeight / element.naturalWidth;
        const angle = Math.abs(parseFloat(element.style.getPropertyValue('--sticker-angle'))) * Math.PI / 180;
        const spanFactor = Math.cos(angle) + ratio * Math.sin(angle);
        const width = Math.min(desired, Math.max(1, right - left) / spanFactor);
        element.style.width = `${width}px`;
        element.style.left = `${(left + right - width) / 2}px`;
        element.style.top = `${r.y + r.h * fraction - width * ratio / 2}px`;
      };
      placeInPocket('tam', sentry, 'right', 96, .55);
      placeInPocket('envelope', nina, 'left', 80, .5);
      placeInPocket('icp', quant, 'left', 92, .48);
      placeInPocket('hello', kellie, 'right', 104, .55);
      return;
    }
    const gap = 8;
    // Include rotation in the fit calculation so even the outer ink remains
    // outside the card, inside the section, and centered on its landmark.
    function size(sticker, maximum) {
      const angle = parseFloat(sticker.style.getPropertyValue('--sticker-angle')) * Math.PI / 180;
      const ratio = sticker.naturalHeight / sticker.naturalWidth;
      const span = Math.abs(Math.cos(angle)) + ratio * Math.abs(Math.sin(angle));
      const desired = parseFloat(sticker.style.getPropertyValue('--sticker-width'));
      const w = Math.min(desired, Math.max(1, maximum) / span);
      const h = w * ratio;
      sticker.style.width = `${w}px`;
      return { w, h, span: w * span };
    }
    function beside(name, card, side, y) {
      const sticker = find(name), r = rect(card);
      let space = side === 'left' ? r.x : bounds.width - r.x - r.w;
      const halfHeight = parseFloat(sticker.style.getPropertyValue('--sticker-width')) * sticker.naturalHeight / sticker.naturalWidth / 2 + 4;
      [sentry, nina, quant, kellie].filter(other => other !== card).forEach(other => {
        const obstacle = rect(other);
        if (y + halfHeight <= obstacle.y || y - halfHeight >= obstacle.y + obstacle.h) return;
        if (side === 'left' && obstacle.x + obstacle.w <= r.x)
          space = Math.min(space, r.x - obstacle.x - obstacle.w);
        if (side === 'right' && obstacle.x >= r.x + r.w)
          space = Math.min(space, obstacle.x - r.x - r.w);
      });
      let { w, h, span } = size(sticker, space - gap - 4);
      let centerX = side === 'left' ? r.x - gap - span / 2 : r.x + r.w + gap + span / 2;
      if (['tam', 'icp', 'hello'].includes(name)) {
        // Triple the previous fitted width, using the full page margin rather
        // than squeezing the annotation into the section's internal gutter.
        const pageEdge = side === 'left' ? -bounds.left : document.documentElement.clientWidth - bounds.left;
        const cardEdge = side === 'left' ? r.x : r.x + r.w;
        const available = Math.abs(cardEdge - pageEdge);
        const edgePadding = available >= 100 ? 32 : 4;
        const cardGap = available >= 100 ? 16 : gap;
        const spanFactor = span / w;
        w = Math.min(w * 3, Math.max(1, available - edgePadding - cardGap) / spanFactor);
        h = w * sticker.naturalHeight / sticker.naturalWidth;
        sticker.style.width = `${w}px`;
        // The entire rotated rectangle must fit, not just its center. Position
        // inward from the screen edge while retaining a clear gap to the card.
        const halfSpan = w * spanFactor / 2;
        const nearEdge = side === 'left'
          ? pageEdge + edgePadding + halfSpan
          : cardEdge + cardGap + halfSpan;
        const farEdge = side === 'left'
          ? cardEdge - cardGap - halfSpan
          : pageEdge - edgePadding - halfSpan;
        const inward = side === 'left' ? farEdge : nearEdge;
        centerX = Math.max(nearEdge, Math.min(farEdge, inward));
      }
      sticker.style.left = `${centerX - w / 2}px`;
      sticker.style.top = `${y - h / 2}px`;
    }
    beside('tam', sentry, 'left', centerY(sentry.querySelector('.tags')));
    beside('envelope', nina, 'left', centerY(nina.querySelector('blockquote')));
    beside('icp', quant, 'right', centerY(quant.querySelector('.company-title')));
    // Position-only adjustments: retain each width calculated above, and move
    // its existing box to the new text landmark without rerunning size fitting.
    const moveCenterY = (name, y) => {
      const element = find(name);
      const h = parseFloat(element.style.width) * element.naturalHeight / element.naturalWidth;
      element.style.top = `${y - h / 2}px`;
    };
    moveCenterY('tam', centerY(sentry.querySelector('.experience-narrative p:last-child')) - 20);
    moveCenterY('icp', rect(quant.querySelector('.experience-narrative')).y);
    const envelope = find('envelope');
    const envelopeWidth = parseFloat(envelope.style.width);
    const angle = Math.abs(parseFloat(envelope.style.getPropertyValue('--sticker-angle'))) * Math.PI / 180;
    const envelopeSpanFactor = Math.cos(angle) + envelope.naturalHeight / envelope.naturalWidth * Math.sin(angle);
    const ninaRect = rect(nina);
    const rightSpace = document.documentElement.clientWidth - bounds.left - ninaRect.x - ninaRect.w;
    const edgePadding = rightSpace >= 100 ? 32 : 4;
    const fittedWidth = Math.min(envelopeWidth, Math.max(1, rightSpace - 8 - edgePadding) / envelopeSpanFactor);
    const envelopeSpan = fittedWidth * envelopeSpanFactor;
    envelope.style.width = `${fittedWidth}px`;
    const baseEnvelopeLeft = ninaRect.x + ninaRect.w + 8 + (envelopeSpan - fittedWidth) / 2;
    const baseEnvelopeRight = bounds.left + baseEnvelopeLeft + fittedWidth / 2 + envelopeSpan / 2;
    const extraEnvelopeGap = Math.min(20, Math.max(0, document.documentElement.clientWidth - 24 - baseEnvelopeRight));
    envelope.style.left = `${baseEnvelopeLeft + extraEnvelopeGap}px`;
    moveCenterY('envelope', centerY(nina.querySelector('blockquote')) + 20);
    const quote = rect(kellie.querySelector('blockquote'));
    const author = rect(kellie.querySelector('figcaption'));
    beside('hello', kellie, 'left', (quote.y + quote.h + author.y) / 2);

    // Lift the entire existing triangle into the clear strip below Sentry,
    // above the calculator tables; no background or card geometry is changed.
    const triangle = find('bottom-up');
    const sr = rect(sentry), nr = rect(nina);
    const availableHeight = Math.max(24, nr.y - (sr.y + sr.h) - 20);
    const ratio = triangle.naturalHeight / triangle.naturalWidth;
    const { w, h } = size(triangle, Math.min(60, availableHeight / ratio));
    triangle.style.left = `${sr.x + sr.w * .8 - w / 2}px`;
    triangle.style.top = `${sr.y + sr.h + 10}px`;
  }
  Promise.all(stickers.map(s => s.decode().catch(() => {}))).then(() => {
    placeStickers();
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches || !('IntersectionObserver' in window)) {
      stickers.forEach(s => s.classList.add('revealed'));
      return;
    }
    layer.classList.add('is-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: .2 });
    stickers.forEach(s => observer.observe(s));
    motion.addEventListener('change', event => {
      if (!event.matches) return;
      observer.disconnect();
      layer.classList.remove('is-ready');
      stickers.forEach(s => s.classList.add('revealed'));
    });
  });
  const resize = new ResizeObserver(placeStickers);
  resize.observe(work);
  // The centered section can keep its width while the outer page margins grow.
  window.addEventListener('resize', placeStickers, { passive: true });
  document.fonts.ready.then(placeStickers);
})();


// Center only the new note in the available Sentry/calculator paper gap.
(() => {
  const work = document.querySelector('#work');
  const note = work?.querySelector('.work-gap-note');
  if (!note) return;
  function placeNote() {
    const section = work.getBoundingClientRect();
    const card = work.querySelector('.sentry-row > .experience-copy').getBoundingClientRect();
    const calculator = work.querySelector('.quanthub-graphic-overlap').getBoundingClientRect();
    const quote = work.querySelector('.sentry-row .work-endorsement').getBoundingClientRect();
    const clearance = 24;
    const ratio = 251 / 698;
    const previousRatio = 247 / 430;
    const end = quote.left >= card.right ? calculator.top : Math.min(calculator.top, quote.top);
    const height = end - card.bottom - clearance * 2;
    // The replacement has a wider composition. Preserve roughly the previous
    // visual area while fitting its original aspect ratio into the same gap.
    const previousWidth = Math.min(288, card.width - clearance * 2, height / previousRatio);
    const maxWidth = Math.min(previousWidth * Math.sqrt(previousRatio / ratio) * 1.2, card.width - clearance * 2, height / ratio);
    // No fallback above or beside Sentry: if the fixed screenshots close this
    // gap completely, omit this one decoration until there is room again.
    note.hidden = true;
    if (maxWidth < 72) return;
    const obstacles = [...work.querySelectorAll('.work-doodle-sticker, .work-endorsement, .experience-copy, .work-graphic-container')]
      .filter(element => element !== work.querySelector('.sentry-row > .experience-copy'))
      .map(element => element.getBoundingClientRect());
    const fits = (x, y, w, h) => !obstacles.some(r =>
      x < r.right + 12 && x + w + 12 > r.left && y < r.bottom + 12 && y + h + 12 > r.top);
    let placement;
    for (let width = maxWidth; width >= 72 && !placement; width -= 4) {
      const h = width * ratio;
      const y = card.bottom + clearance + (height - h) / 2;
      const candidates = [];
      for (let x = card.left + clearance; x + width <= card.right - clearance; x += 4) candidates.push(x);
      const financialTag = work.querySelector('.sentry-row .tags span:nth-child(2)').getBoundingClientRect();
      const targetX = (financialTag.left + financialTag.right) / 2 + 12;
      candidates.sort((a, b) => Math.abs(a + width / 2 - targetX) - Math.abs(b + width / 2 - targetX));
      const x = candidates.find(x => fits(x, y, width, h));
      if (x !== undefined) placement = { x, y, width };
    }
    if (!placement) return;
    note.style.width = `${placement.width}px`;
    note.style.left = `${placement.x - section.left}px`;
    note.style.top = `${placement.y - section.top}px`;
    note.hidden = false;
  }
  new ResizeObserver(placeNote).observe(work);
  note.addEventListener('load', placeNote);
  Promise.all([...work.querySelectorAll('.work-doodle-sticker')].map(image => image.decode().catch(() => {})))
    .then(() => requestAnimationFrame(placeNote));
  window.addEventListener('resize', placeNote, { passive: true });
  document.fonts.ready.then(placeNote);
  placeNote();
})();


// Reveal the original word pixels along traced ink centerlines, once per load.
(() => {
  const note = document.querySelector('.work-gap-note');
  if (!note) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let observer, completion;
  const finish = () => {
    clearTimeout(completion);
    note.classList.remove('writing-ready', 'is-writing');
    note.classList.add('is-written');
    observer?.disconnect();
  };
  if (motion.matches || !('IntersectionObserver' in window)) { finish(); return; }
  note.classList.add('writing-ready');
  observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    note.classList.add('is-writing');
    observer.disconnect();
    completion = setTimeout(finish, 1850);
  }, { threshold: .25 });
  observer.observe(note);
  motion.addEventListener('change', event => { if (event.matches) finish(); });
})();


// Scatter the supplied tool drawings above their dashboard, never over its UI.
(() => {
  const work = document.querySelector('#work');
  const tools = [...(work?.querySelectorAll('.work-tool-doodle') || [])];
  if (!tools.length) return;
  const graphic = work.querySelector('.sentry-graphic-overlap');
  const card = work.querySelector('.sentry-row > .experience-copy');
  const fractions = [0, .28, .57, 1];
  function placeTools() {
    const section = work.getBoundingClientRect();
    const dashboard = graphic.getBoundingClientRect();
    const tile = card.getBoundingClientRect();
    const stacked = matchMedia('(max-width: 800px)').matches;
    const left = stacked ? dashboard.left + 12 : tile.right + 20;
    let right = Math.min(stacked ? dashboard.right - 12 : section.right - 36, document.documentElement.clientWidth - 16);
    if (stacked) {
      // The existing UP/BOTTOM illustration owns the right side of this gap.
      // Fit only the new drawings into the remaining paper space to its left.
      const triangle = work.querySelector('.sticker-bottom-up');
      const width = parseFloat(triangle.style.width) || triangle.offsetWidth;
      const height = width * triangle.naturalHeight / triangle.naturalWidth;
      const angle = Math.abs(parseFloat(triangle.style.getPropertyValue('--sticker-angle'))) * Math.PI / 180;
      const rotatedWidth = width * Math.cos(angle) + height * Math.sin(angle);
      const triangleLeft = section.left + parseFloat(triangle.style.left) + (width - rotatedWidth) / 2;
      if (Number.isFinite(triangleLeft)) right = Math.min(right, triangleLeft - 16);
    }
    const available = Math.max(1, right - left);
    const scale = stacked ? Math.min(.55, available / 600) : Math.min(1, available / 760);
    const gaps = stacked ? [16, 10, 20, 13] : [28, 12, 24, 16];
    tools.forEach((tool, i) => {
      if (!tool.naturalWidth) return;
      const width = parseFloat(tool.style.getPropertyValue('--sticker-width')) * scale;
      const height = width * tool.naturalHeight / tool.naturalWidth;
      const angle = Math.abs(parseFloat(tool.style.getPropertyValue('--sticker-angle'))) * Math.PI / 180;
      const visualWidth = width * Math.cos(angle) + height * Math.sin(angle);
      const visualHeight = height * Math.cos(angle) + width * Math.sin(angle);
      const x = left + fractions[i] * (available - visualWidth);
      const y = dashboard.top - gaps[i] - visualHeight;
      // Retain each existing center/rotation; shrink only the rendered artwork.
      const sizeFactor = .375;
      tool.style.width = `${width * sizeFactor}px`;
      tool.style.left = `${x - section.left + (visualWidth - width * sizeFactor) / 2}px`;
      tool.style.top = `${y - section.top + (visualHeight - height * sizeFactor) / 2}px`;
      tool.classList.add('is-placed');
    });
  }
  Promise.all([...work.querySelectorAll('.work-doodle-sticker')].map(tool => tool.decode().catch(() => {})))
    .then(() => requestAnimationFrame(placeTools));
  const observer = new ResizeObserver(placeTools);
  observer.observe(work);
  observer.observe(graphic);
  window.addEventListener('resize', placeTools, { passive: true });
  document.fonts.ready.then(placeTools);
})();

// Keep the original Prospecting and Top Down artwork tied to QuantHub, not the viewport.
(() => {
  const work = document.querySelector('#work');
  const card = work?.querySelector('.quanthub-row .experience-copy');
  const prospecting = work?.querySelector('.annotation-prospecting');
  const topDown = work?.querySelector('.annotation-top-down');
  if (!card || !prospecting || !topDown) return;
  function placeAnnotations() {
    const section = work.getBoundingClientRect();
    const tile = card.getBoundingClientRect();
    const role = card.querySelector('.experience-role');
    const text = role.firstChild;
    const strategy = text.textContent.indexOf('STRATEGY');
    const range = document.createRange();
    range.setStart(text, strategy);
    range.setEnd(text, strategy + 1);
    const start = range.getBoundingClientRect();
    const precedingQuote = work.querySelector('.sentry-row .work-endorsement').getBoundingClientRect();
    const sharesColumn = precedingQuote.left < tile.right && precedingQuote.right > tile.left;
    const freeHeight = sharesColumn ? Math.max(1, tile.top - precedingQuote.bottom - 16) : Infinity;
    const width = Math.min(180, tile.width * .4, freeHeight * 288 / 86);
    const height = width * 86 / 288;
    prospecting.style.width = `${width}px`;
    prospecting.style.left = `${Math.min(start.left, tile.right - width - 16) - section.left}px`;
    prospecting.style.top = `${tile.top - section.top - height - (sharesColumn ? 8 : 18)}px`;
    // The outer margin is narrow on small screens; shrink this new annotation
    // rather than moving the existing card or clipping the supplied artwork.
    const available = document.documentElement.clientWidth - tile.right;
    const edge = available >= 100 ? 24 : 4;
    const gap = available >= 100 ? 12 : 4;
    const sideWidth = Math.max(1, Math.min(66, available - edge - gap));
    topDown.style.width = `${sideWidth}px`;
    topDown.style.left = `${tile.right - section.left + gap}px`;
    topDown.style.top = `${tile.bottom - section.top - sideWidth * 133 / 75}px`;
    [prospecting, topDown].forEach(image => image.classList.add('is-positioned'));
  }
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      reveal.unobserve(entry.target);
    }
  }), { threshold: .2 });
  [prospecting, topDown].forEach(image => reveal.observe(image));
  Promise.all([prospecting.decode(), topDown.decode()].map(promise => promise.catch(() => {})))
    .then(() => requestAnimationFrame(placeAnnotations));
  const resize = new ResizeObserver(placeAnnotations);
  resize.observe(work);
  resize.observe(card);
  window.addEventListener('resize', placeAnnotations, { passive: true });
  document.fonts.ready.then(placeAnnotations);
})();
