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
    const cfgPath = scriptEl.getAttribute('data-config');
    if (!cfgPath) {
      return;
    }
    // Prevent double loading
    if (window.__UCW_CFG_LOADING__) {
      await window.__UCW_CFG_LOADING__;
      return;
    }
    window.__UCW_CFG_LOADING__ = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = cfgPath;
      s.onload = () => resolve();
      s.onerror = () => resolve(); // continue without config if it fails
      document.head.appendChild(s);
    });
    await window.__UCW_CFG_LOADING__;
  } catch (e) {
    // fail silent: continue without config
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
