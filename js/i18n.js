/**
 * Lightweight i18n engine for static sites.
 * Loads JSON translation files and applies them to elements with data-i18n attributes.
 */
const I18n = (() => {
  const SUPPORTED_LANGS = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'sv', 'da', 'no', 'fi'];
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'nextia-lang';

  let translations = {};
  let currentLang = DEFAULT_LANG;

  function detectLanguage() {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang && SUPPORTED_LANGS.includes(urlLang)) return urlLang;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

    const browserLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGS.includes(browserLang)) return browserLang;

    return DEFAULT_LANG;
  }

  function getNestedValue(obj, key) {
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(translations, key);
      if (value !== null) {
        el.innerHTML = value;
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const mappings = el.getAttribute('data-i18n-attr').split(',');
      mappings.forEach((mapping) => {
        const [attr, key] = mapping.split(':').map((s) => s.trim());
        const value = getNestedValue(translations, key);
        if (value !== null) {
          el.setAttribute(attr, value);
        }
      });
    });

    document.documentElement.lang = currentLang;
  }

  function resolveLocalePath(lang) {
    const depth = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean).length;
    const prefix = depth === 0 ? './' : '../'.repeat(depth);
    return `${prefix}locales/${lang}.json`;
  }

  async function loadLanguage(lang) {
    try {
      const path = resolveLocalePath(lang);
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      translations = await res.json();
      currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      applyTranslations();
    } catch (err) {
      console.warn(`Failed to load locale "${lang}", falling back to "${DEFAULT_LANG}"`, err);
      if (lang !== DEFAULT_LANG) {
        await loadLanguage(DEFAULT_LANG);
      }
    }
  }

  async function init() {
    const lang = detectLanguage();
    await loadLanguage(lang);
    return lang;
  }

  function setLanguage(lang) {
    if (SUPPORTED_LANGS.includes(lang)) {
      loadLanguage(lang);
    }
  }

  function t(key) {
    return getNestedValue(translations, key) || key;
  }

  return { init, setLanguage, t, SUPPORTED_LANGS, DEFAULT_LANG };
})();
