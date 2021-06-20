class UcBridge {
  /**
   * Wait for Usercentrics CMP to be ready
   *
   * @param {function} callback
   */
  waitForCmp (callback) {
    if (window.UC_UI && window.UC_UI.isInitialized()) {
      callback();
    } else {
      window.addEventListener('UC_UI_INITIALIZED', function (e) {
        callback();
      });
    }
  }

  /**
   * Retrieve current consent from CMP when ready
   *
   * @param {string} ucId Usercentrics Service ID
   * @param {function} callback Called when CMP is ready and consent could be read
   */
  waitForCmpConsent (ucId, callback) {
    this.waitForCmp(() => {
      (this.getConsent(ucId) === true) && callback();
    });
  }

  /**
   * Indicates the Usercentrics CMP is ready
   *
   * @return {boolean}
   */
  isCmpReady () {
    return window.UC_UI && window.UC_UI.isInitialized();
  }

  /**
   * Signals the Ucercentrics CMP that a consent was given via widget
   *
   * @param {string} ucId Usercentrics Service ID
   */
  setConsent (ucId) {
    if (!this.isCmpReady()) {
      throw new Error('Usercentrics CMP is not ready!');
    }
    window.UC_UI.acceptService(ucId); // TODO: should we wait for the CMP consent server answer?
  }

  /**
   * Retrieves the current stored consent decision from the Usercentrics CMP
   *
   * @param {string} ucId Usercentrics Service ID
   * @return {boolean}
   */
  getConsent (ucId) {
    try {
      const consents = window.UC_UI.getServicesBaseInfo();
      for (let i = 0; i < consents.length; i++) {
        if (consents[i].id === ucId) {
          return !!consents[i].consent.status;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

export default UcBridge;
