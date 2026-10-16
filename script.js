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
document.querySelectorAll('.bubble').forEach((bubble) => {
  bubble.addEventListener('click', () => {
    const open = bubble.getAttribute('aria-pressed') !== 'true';
    document.querySelectorAll('.bubble').forEach((other) => other.setAttribute('aria-pressed', 'false'));
    bubble.setAttribute('aria-pressed', String(open));
  });
  bubble.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') bubble.setAttribute('aria-pressed', 'false');
  });
});
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  root.classList.add('js-motion');
}
document.querySelector('#year').textContent = new Date().getFullYear();
