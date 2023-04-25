import Iframe from './Iframe';
import UrlParser from '../lib/UrlParser';

/**
 * Youtube placeholder
 */
class Youtube extends Iframe {
  /**
   * Show background using the Usercentrics Proxy, fallback to default on error
   *
   * @returns {string}
   */
  getBackground () {
    const src = this.el.getAttribute('data-uc-src');
    const hasBackgroundImageSet = this.el.hasAttribute('data-uc-background-image');
    if (!src || hasBackgroundImageSet) {
      return super.getBackground();
    }
    try {
      const url = new UrlParser(src);
      const lastPath = url.pathname.split('/').pop();
      return `https://privacy-proxy-server.usercentrics.eu/video/youtube/${lastPath}-poster-image`;
    } catch (e) {
      return super.getBackground();
    }
  }
}

export default Youtube;
