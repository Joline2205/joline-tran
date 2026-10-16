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
