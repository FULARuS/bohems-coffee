import translations from './translations.js';

const localeKeys = new Set(['tr', 'ru', 'en', 'ar']);
const attributes = ['alt', 'aria-label', 'title', 'content'];

export function initLocale(renderActions) {
  const root = document.documentElement;
  const switcher = document.querySelector('[data-language]');
  const select = switcher.querySelector('select');
  const map = document.querySelector('.map iframe');
  const strings = [];

  for (const node of document.querySelectorAll('[data-i18n]')) {
    strings.push({ node, key: node.dataset.i18n, turkish: node.textContent });
  }
  for (const attribute of attributes) {
    for (const node of document.querySelectorAll(`[data-i18n-${attribute}]`)) {
      const key = node.getAttribute(`data-i18n-${attribute}`);
      strings.push({ node, key, attribute, turkish: node.getAttribute(attribute) });
    }
  }

  function apply(locale) {
    const dictionary = translations[locale] ?? {};
    root.lang = locale;
    root.dir = locale === 'ar' ? 'rtl' : 'ltr';
    select.value = locale;

    for (const { node, key, attribute, turkish } of strings) {
      const value = dictionary[key] ?? turkish;
      if (attribute) node.setAttribute(attribute, value);
      else node.textContent = value;
    }

    const mapUrl = new URL(map.src);
    if (mapUrl.searchParams.get('hl') !== locale) {
      mapUrl.searchParams.set('hl', locale);
      map.src = mapUrl.href;
    }

    renderActions(dictionary);
  }

  const url = new URL(location.href);
  const initial = url.searchParams.get('lang');
  apply(localeKeys.has(initial) ? initial : 'tr');
  switcher.hidden = false;

  select.addEventListener('change', () => {
    const locale = select.value;
    if (!localeKeys.has(locale)) return;

    apply(locale);
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      const current = new URL(location.href);
      if (locale === 'tr') current.searchParams.delete('lang');
      else current.searchParams.set('lang', locale);
      history.replaceState(null, '', current);
    }
  });
}
