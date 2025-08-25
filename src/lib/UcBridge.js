class UcBridge {
  /**
   * Wait for Usercentrics CMP (v2 or v3) to be ready
   *
   * @param {function} callback
   */
  waitForCmp (callback) {
    if (this.isCmpReady()) {
      callback();
      return;
    }

    if (window.Usercentrics) {
      const add = window.Usercentrics.addEventListener || window.Usercentrics.on;
      if (add) {
        add.call(window.Usercentrics, 'ready', callback);
        return;
      }
    }

    window.addEventListener('UC_UI_INITIALIZED', function (e) {
      callback();
    });
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
    if (window.Usercentrics && typeof window.Usercentrics.isInitialized === 'function') {
      try {
        return window.Usercentrics.isInitialized();
      } catch (e) {
        return false;
      }
    }
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
    if (window.Usercentrics) {
      if (typeof window.Usercentrics.acceptService === 'function') {
        window.Usercentrics.acceptService(ucId);
      } else if (typeof window.Usercentrics.updateServiceConsent === 'function') {
        window.Usercentrics.updateServiceConsent({ id: ucId, status: true });
      } else {
        throw new Error('Usercentrics v3 API missing consent method');
      }
      return;
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
      if (window.Usercentrics && typeof window.Usercentrics.getServices === 'function') {
        const consents = window.Usercentrics.getServices();
        for (let i = 0; i < consents.length; i++) {
          const service = consents[i];
          if (service.id === ucId || service.templateId === ucId) {
            if (service.consent && typeof service.consent.status !== 'undefined') {
              return !!service.consent.status;
            }
            if (typeof service.status !== 'undefined') {
              return !!service.status;
            }
          }
        }
        return false;
      }

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
