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
      el.removeAttribute('data-uc-src');

      // for scripts
      if (el.hasAttribute('type')) {
        el.removeAttribute('type');
      }

      // Base.performActivation() has already put the element back into the
      // document; it only assigns `src` for iframes, so do it for everything
      // else here.
      if (dataSrc && !el.src) {
        window.setTimeout(() => {
          el.setAttribute('src', dataSrc);
        }, 0);
      }
    }
  }
}

export default Iframe;
