/**
 * UcBridge class provides an interface to interact with the Usercentrics Consent Management Platform (CMP).
 * It supports both Usercentrics v2 and v3 APIs and provides methods to wait for the CMP to be ready,
 * retrieve consent, and set consent for specific services.
 */
class UcBridge {
  /**
   * Waits for the Usercentrics CMP (v2 or v3) to be ready and executes the provided callback.
   *
   * @param {function} callback - The function to execute once the CMP is ready.
   */
  waitForCmp(callback) {
    if (this.isCmpReady()) {
      callback();
      return;
    }

    if (window.Usercentrics) {
      try {
        const add = window.Usercentrics.addEventListener || window.Usercentrics.on;
        if (add) {
          add.call(window.Usercentrics, 'ready', callback);
          return;
        }
      } catch (e) {
        console.error('Error adding Usercentrics event listener:', e);
      }
    }

    window.addEventListener('UC_UI_INITIALIZED', function (e) {
      callback();
    });
  }

  /**
   * Waits for the CMP to be ready and retrieves the current consent for a specific service.
   *
   * @param {string} ucId - The Usercentrics Service ID.
   * @param {function} callback - The function to execute if consent is granted.
   */
  waitForCmpConsent(ucId, callback) {
    this.waitForCmp(() => {
      const consent = this.getConsent(ucId);
      if (consent && typeof consent.then === 'function') {
        consent.then((result) => {
          result === true && callback();
        });
      } else if (consent === true) {
        callback();
      }
    });
  }

  /**
   * Checks if the Usercentrics CMP is ready.
   *
   * @return {boolean} - Returns true if the CMP is ready, otherwise false.
   */
  isCmpReady() {
    // Prefer UC v3 (__ucCmp) readiness if available
    if (window.__ucCmp && typeof window.__ucCmp.isInitialized === 'function') {
      try {
        return window.__ucCmp.isInitialized();
      } catch (e) {
        return false;
      }
    }
    // Fallback to Usercentrics (v3 SDK global) readiness if available
    if (window.Usercentrics && typeof window.Usercentrics.isInitialized === 'function') {
      try {
        return window.Usercentrics.isInitialized();
      } catch (e) {
        return false;
      }
    }
    // Legacy UC v2 UI readiness
    return !!(window.UC_UI && typeof window.UC_UI.isInitialized === 'function' && window.UC_UI.isInitialized());
  }

  /**
   * Signals the Usercentrics CMP that consent has been given for a specific service.
   *
   * @param {string} ucId - The Usercentrics Service ID.
   * @throws {Error} - Throws an error if the CMP is not ready or if the consent method is missing.
   */
  setConsent(ucId) {
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

    window.UC_UI.acceptService(ucId);
  }

  /**
   * Retrieves the current stored consent decision for a specific service from the Usercentrics CMP.
   *
   * @param {string} ucId - The Usercentrics Service ID.
   * @return {boolean|Promise<boolean>} - Returns true if consent is granted, false otherwise.
   *                                     If using Usercentrics v3, it may return a Promise.
   */
  getConsent(ucId) {
    try {
      // UC v3: Retrieve consent details using the __ucCmp API.
      if (window.__ucCmp && typeof window.__ucCmp.getConsentDetails === 'function') {
        const p = window.__ucCmp.getConsentDetails();
        return p.then((details) => {
          if (!details) return false;
          // If overall consent status is ALL_ACCEPTED, treat service as consented
          if (details.consent && details.consent.status === 'ALL_ACCEPTED') {
            return true;
          }
          // Prefer v3 global consent list: if serviceIds contains ucId, it's active
          if (details.consent && Array.isArray(details.consent.serviceIds)) {
            if (details.consent.serviceIds.includes(ucId)) {
              return true;
            }
          }
          // Fallback to services collection if available
          if (!details.services) return false;
          const svc = Array.isArray(details.services)
            ? details.services.find((s) => s && (s.id === ucId || s.serviceId === ucId))
            : details.services[ucId] || details.services[String(ucId)] || null;

          return svc ? !!(svc.consent?.status ?? svc.status) : false;
        });
      }

      // UC v2: Retrieve consent using the legacy API.
      if (window.UC_UI && typeof window.UC_UI.getServicesBaseInfo === 'function') {
        const consents = window.UC_UI.getServicesBaseInfo();
        for (let i = 0; i < consents.length; i++) {
          if (consents[i].id === ucId) {
            return !!(consents[i].consent && consents[i].consent.status);
          }
        }
        return false;
      }

      // Unknown environment.
      return false;
    } catch (e) {
      return false;
    }
  }
}

export default UcBridge;
