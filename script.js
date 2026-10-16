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
  const segments = [{ element: prefix, text: "Hi, I'm " }, { element: name, text: 'Joline' }];
  let typingTimer;
  function finishTyping() {
    clearTimeout(typingTimer);
    segments.forEach(({ element, text }) => { element.textContent = text; });
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
