import WidgetFactory from './lib/WidgetFactory';
import { toArray } from './lib/HtmlCollectionHelper';
import { widgetStore } from './lib/WidgetStore';

const WIDGET_CLASS = 'uc-widget';

function init () {
  if (document.readyState !== 'complete') {
    return;
  }
  document.removeEventListener('readystatechange', init);

  console.debug('init');

  const elements = toArray(document.getElementsByClassName(WIDGET_CLASS));
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
