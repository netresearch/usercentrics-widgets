/**
 * Utility class to parse URLs
 */
class UrlParser {
  /**
   *
   * @param {string} url
   */
  constructor (url) {
    this.url = url;

    const firstSplit = url.split('/');
    this._protocol = firstSplit.shift();
    firstSplit.shift();
    this._host = firstSplit.shift();

    const secondSplit = firstSplit.join('/').split(/[?#]/);
    this._pathname = secondSplit[0];
  }

  get host () {
    return this._host;
  }

  get protocol () {
    return this._protocol;
  }

  get pathname () {
    return this._pathname;
  }
}

export default UrlParser;
