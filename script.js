'use strict';

// Keep the page fully readable without JavaScript or when reduced motion is enabled.
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
  document.documentElement.classList.add('js-motion');
}

document.querySelector('#year').textContent = new Date().getFullYear();

// Unpublished content stays explicitly labeled instead of linking to invented URLs.
const toast = document.querySelector('.toast');
let toastTimeout;
document.querySelectorAll('[data-placeholder]').forEach((button) => {
  button.addEventListener('click', () => {
    clearTimeout(toastTimeout);
    toast.textContent = button.dataset.placeholder;
    toast.classList.add('visible');
    toastTimeout = setTimeout(() => toast.classList.remove('visible'), 3500);
  });
});
