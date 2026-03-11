/**
 * Shared app logic — language selector, year in footer.
 */
document.addEventListener('DOMContentLoaded', async () => {
  const lang = await I18n.init();

  const selector = document.getElementById('lang-select');
  if (selector) {
    selector.value = lang;
    selector.addEventListener('change', (e) => {
      I18n.setLanguage(e.target.value);
    });
  }

  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
