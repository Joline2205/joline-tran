'use strict';
const root = document.documentElement;
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
    const palette = ['#6B8B9B', '#AFC2CD', '#333B42'];
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

// Pour once at 35% visibility, then disconnect to avoid scroll-triggered resets.
const coffeeContact = document.querySelector('#contact');
if (coffeeContact) {
  const reducedPour = window.matchMedia('(prefers-reduced-motion: reduce)');
  let settleTimer;
  const settle = () => {
    clearTimeout(settleTimer);
    coffeeContact.classList.add('is-settled');
  };
  const pour = () => {
    if (coffeeContact.classList.contains('is-poured')) return;
    coffeeContact.classList.add('is-poured');
    if (reducedPour.matches) settle();
    else settleTimer = setTimeout(settle, 3100);
  };
  // The finite ripple completes after the 1.4s fill, leaving a static flooded state.
  coffeeContact.querySelector('.coffee-wave').addEventListener('animationend', (event) => {
    if (event.animationName === 'waveFlow') settle();
  });
  reducedPour.addEventListener('change', (event) => {
    if (event.matches && coffeeContact.classList.contains('is-poured')) settle();
  });
  if ('IntersectionObserver' in window) {
    const coffeeObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35)) {
        pour();
        coffeeObserver.disconnect();
      }
    }, { threshold: 0.35 });
    coffeeObserver.observe(coffeeContact);
  } else {
    pour();
  }
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
  const views = { world: [0, 0, 1000, 420], europe: [400, 40, 360, 151.2] };
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
    tooltip.querySelector('.tooltip-context').textContent = pin.dataset.context;
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
    cityDetails.querySelector('.city-category').textContent = pin.dataset.kind === 'lived' ? `Lived · ${pin.dataset.duration}` : 'Explored';
    cityDetails.querySelector('.city-year').textContent = pin.dataset.year ? `Year: ${pin.dataset.year}` : 'Year not recorded';
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
    if (pin.hidden) setView('world');
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
  const mobile = matchMedia('(max-width: 800px)');
  function placeStickers() {
    if (mobile.matches) return;
    const bounds = work.getBoundingClientRect();
    const rect = element => {
      const r = element.getBoundingClientRect();
      return { x: r.left - bounds.left, y: r.top - bounds.top, w: r.width, h: r.height };
    };
    const cards = [...work.querySelectorAll('.experience-copy, .work-endorsement, .section-heading')].map(rect);
    const [sentry, nina, quant, kellie] = cards.slice(1);
    if (!kellie) return;
    const goals = [
      [sentry.x + sentry.w * .7, sentry.y + sentry.h + 24],
      [nina.x + nina.w - 75, nina.y - 85],
      [quant.x - 85, quant.y + 30],
      [kellie.x - 75, kellie.y + 35],
      [quant.x + quant.w * .6, quant.y + quant.h + 25]
    ];
    const occupied = [...cards];
    stickers.forEach((sticker, i) => {
      const w = sticker.offsetWidth, h = sticker.offsetHeight;
      let best, score = Infinity;
      for (let y = 18; y + h < bounds.height - 18; y += 12) {
        for (let x = 18; x + w < bounds.width - 18; x += 12) {
          if (occupied.some(r => x < r.x + r.w + 14 && x + w + 14 > r.x && y < r.y + r.h + 14 && y + h + 14 > r.y)) continue;
          const distance = (x - goals[i][0]) ** 2 + (y - goals[i][1]) ** 2;
          if (distance < score) { score = distance; best = { x, y, w, h }; }
        }
      }
      if (best) {
        sticker.style.left = `${best.x}px`;
        sticker.style.top = `${best.y}px`;
        occupied.push(best);
      }
    });
  }
  Promise.all(stickers.map(s => s.decode().catch(() => {}))).then(() => {
    placeStickers();
    layer.classList.add('is-ready');
    if (!('IntersectionObserver' in window)) {
      stickers.forEach(s => s.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: .15 });
    stickers.forEach(s => observer.observe(s));
  });
  const resize = new ResizeObserver(placeStickers);
  resize.observe(work);
  document.fonts.ready.then(placeStickers);
})();
