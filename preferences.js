// Read preferences before paint. Storage may be disabled or contain old values.
(() => {
  const read = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const saved = read('lykta.language');
  let language = ['en', 'sv'].includes(saved) ? saved : /^sv(?:-|$)/i.test(navigator.language || '') ? 'sv' : 'en';
  const theme = read('lykta.appearance');
  document.documentElement.lang = language;
  document.documentElement.dataset.theme = ['light', 'warm', 'dark'].includes(theme) ? theme : 'dark';
  const t = (key, fallback = key, values = {}) => {
    const message = window.siteMessages?.[key];
    return (message?.[language] || message?.en || fallback).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '{' + name + '}');
  };
  function sizeDeveloperMenu() {
    const menu = document.querySelector('.developer-nav');
    const parent = document.querySelector('.navigation-group>nav:first-child a[href="/calendar/"]');
    if (!menu || !parent) return;
    const group = menu.parentElement.getBoundingClientRect();
    menu.style.width = Math.min(group.width, Math.max(0, parent.getBoundingClientRect().right - group.left)) + 'px';
  }
  window.addEventListener('resize', sizeDeveloperMenu);
  window.addEventListener('load', sizeDeveloperMenu);
  document.addEventListener('languagechange', sizeDeveloperMenu);
  function translate() {
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n, node.textContent); });
    for (const attribute of ['aria-label', 'title', 'alt']) {
      document.querySelectorAll('[data-i18n-' + attribute + ']').forEach(node => node.setAttribute(attribute, t(node.getAttribute('data-i18n-' + attribute))));
    }
    sizeDeveloperMenu();
    const picker = document.getElementById('language');
    if (picker) picker.value = language;
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === document.documentElement.dataset.theme));
    });
  }
  window.SitePreferences = { t, translate, get language() { return language; } };
  document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.welcome-logo video');
    if (video) {
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      const updateMotion = () => {
        if (motion.matches) {
          video.pause();
          video.parentElement.classList.remove('is-playing');
        } else {
          video.play().then(() => {
            if (!motion.matches) video.parentElement.classList.add('is-playing');
          }).catch(() => {});
        }
      };
      motion.addEventListener('change', updateMotion);
      updateMotion();
    }
    translate();
    document.dispatchEvent(new Event('languagechange'));
    document.getElementById('language')?.addEventListener('change', event => {
      language = event.target.value;
      document.documentElement.lang = language;
      write('lykta.language', language);
      translate();
      document.dispatchEvent(new Event('languagechange'));
    });
    document.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', () => {
      document.documentElement.dataset.theme = button.dataset.themeChoice;
      write('lykta.appearance', button.dataset.themeChoice);
      document.querySelectorAll('[data-theme-choice]').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
    }));
  });
})();
