import WidgetFactory from './lib/WidgetFactory';
import { toArray } from './lib/HtmlCollectionHelper';
import { widgetStore } from './lib/WidgetStore';

async function loadConfigIfNeeded () {
  try {
    // Look for the script tag that includes the UC widgets and carries the config path
    const scriptEl = document.querySelector('script[data-config]');
    if (!scriptEl) {
      return;
    }
    const safeUrl = sanitizeScriptUrl(scriptEl.getAttribute('data-config'));
    if (!safeUrl) {
      return;
    }
    // Prevent double loading
    if (window.__UCW_CFG_LOADING__) {
      await window.__UCW_CFG_LOADING__;
      return;
    }
    window.__UCW_CFG_LOADING__ = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = safeUrl;
      s.onload = () => resolve();
      s.onerror = () => resolve(); // continue without config if it fails
      document.head.appendChild(s);
    });
    await window.__UCW_CFG_LOADING__;
  } catch (e) {
    // fail silent: continue without config
  }
}

/**
 * Validates and sanitizes a script URL.
 * Allows only same-origin .js/.mjs URLs and blocks javascript:, data:, etc.
 * Returns the sanitized URL string from the URL constructor, or null if unsafe.
 */
function sanitizeScriptUrl (url) {
  try {
    if (!url) return null;
    url = url.trim();
    // Disallow javascript: and data: and vbscript: schemes.
    const prohibited = /^(?:javascript:|data:|vbscript:)/i;
    if (prohibited.test(url)) return null;
    // Parse the URL — this normalizes the value and strips any embedded control characters.
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) return null;
    // Allow only .js/.mjs files.
    const extMatch = parsed.pathname.match(/\.([a-z0-9]+)$/i);
    if (!extMatch || !['js', 'mjs'].includes(extMatch[1].toLowerCase())) return null;
    // Return the normalized href from the URL constructor (a new, clean string).
    return parsed.href;
  } catch (e) {
    return null;
  }
}

async function init () {
  if (document.readyState !== 'complete') {
    return;
  }
  document.removeEventListener('readystatechange', init);

  // Load optional widget config before rendering widgets
  await loadConfigIfNeeded();

  const elements = toArray(document.querySelectorAll('[data-uc-src]'));

  for (const el of elements) {
    const widget = WidgetFactory.create(el);
    widget.render();
  }

  widgetStore.linkCmp();
}

if (document.readyState === 'complete') {
  init();
} else {
  document.addEventListener('readystatechange', init);
}
