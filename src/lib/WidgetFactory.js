import Youtube from '../widgets/Youtube';
import Iframe from '../widgets/Iframe';
import UrlParser from './UrlParser';

class WidgetFactory {
  /**
   *
   * @param {Element} el
   */
  static create (el) {
    try {
      const url = new UrlParser(el.getAttribute('data-src'));
      const host = url.host;
      const nodeType = el.tagName.toLowerCase(); // eslint-disable-line  no-unused-vars

      if (/\.youtube(-nocookie)\./.test(host)) {
        return new Youtube(el);
      }
      return new Iframe(el);
    } catch (e) {
      console.error(e);
      return new Iframe(el);
    }
  }
}

export default WidgetFactory;
