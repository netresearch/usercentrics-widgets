import WidgetFactory from './lib/WidgetFactory';
import { toArray } from './lib/HtmlCollectionHelper';
import { widgetStore } from './lib/WidgetStore';


function init () {
  if (document.readyState !== 'complete') {
    return;
  }
  document.removeEventListener('readystatechange', init);

  console.debug('init');

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
