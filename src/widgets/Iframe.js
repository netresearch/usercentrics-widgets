import Base from './Base';

/**
 * Common class for all iframes
 */
class Iframe extends Base {
  activate (fromWidget) {
    super.activate(fromWidget);

    const el = this.el;
    if (el) {
      const dataSrc = el.getAttribute('data-uc-src');
      el.setAttribute('data-uc-src', null);

      //for scripts
      if (el.hasAttribute('type')) {
        el.removeAttribute('type');
      }

      this.container.parentElement.replaceChild(el, this.container);
      window.setTimeout(() => {
        el.setAttribute('src', dataSrc);
      }, 0);
    }
  }
}

export default Iframe;
