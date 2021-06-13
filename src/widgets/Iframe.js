import Base from './Base';

/**
 * Common class for all iframes
 */
class Iframe extends Base {
  activate (fromWidget) {
    super.activate(fromWidget);

    const el = this.el;
    if (el) {
      const dataSrc = el.getAttribute('data-src');
      el.setAttribute('data-src', null);

      this.container.parentElement.replaceChild(el, this.container);
      window.setTimeout(() => {
        el.setAttribute('src', dataSrc);
      }, 0);
    }
  }
}

export default Iframe;
