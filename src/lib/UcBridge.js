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
  waitForCmp (callback) {
    if (this.isCmpReady()) {
      callback();
      return;
    }

    // Prefer UC v3 (__ucCmp) event if available; fallback to legacy UI event
    try {
      if (window.__ucCmp && typeof window.__ucCmp.isInitialized === 'function') {
        // If __ucCmp is already initialized, callback will be fired from the early return above.
        // Some implementations also dispatch a custom event when initialized; as a safe fallback,
        // we poll once with requestAnimationFrame until initialized.
        const poll = () => {
          try {
            if (window.__ucCmp && window.__ucCmp.isInitialized()) {
              callback();
            } else {
              window.requestAnimationFrame(poll);
            }
          } catch (e) {
            window.requestAnimationFrame(poll);
          }
        };
        window.requestAnimationFrame(poll);
        return;
      }
    } catch (e) {
      console.error('Error while waiting for __ucCmp readiness:', e);
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
  waitForCmpConsent (ucId, callback) {
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
  isCmpReady () {
    // Prefer UC v3 (__ucCmp) readiness if available
    if (window.__ucCmp && typeof window.__ucCmp.isInitialized === 'function') {
      try {
        return window.__ucCmp.isInitialized();
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
  setConsent (ucId) {
    if (!this.isCmpReady()) {
      throw new Error('Usercentrics CMP is not ready!');
    }

    // Prefer UC v3 (__ucCmp) API if available
    if (window.__ucCmp) {
      try {
        // New recommended approach: batch update services consents and then save
        if (typeof window.__ucCmp.updateServicesConsents === 'function') {
          window.__ucCmp.updateServicesConsents([{ id: ucId, consent: true }])
            .then(() => {
              if (typeof window.__ucCmp.saveConsents === 'function') {
                window.__ucCmp.saveConsents();
              }
            }).catch((e) => {
              console.error('Error while setting consent via __ucCmp promise chain:', e);
            });
          return;
        } else {
          if (typeof window.__ucCmp.saveConsents === 'function') {
            window.__ucCmp.saveConsents();
          }
          return;
        }
      } catch (e) {
        console.error('Error while setting consent via __ucCmp:', e);
      }
    }

    // Legacy v2 fallback
    if (window.UC_UI && typeof window.UC_UI.acceptService === 'function') {
      window.UC_UI.acceptService(ucId);
    }
  }

  /**
   * Retrieves the current stored consent decision for a specific service from the Usercentrics CMP.
   *
   * @param {string} ucId - The Usercentrics Service ID.
   * @return {boolean|Promise<boolean>} - Returns true if consent is granted, false otherwise.
   *                                     If using Usercentrics v3, it may return a Promise.
   */
  getConsent (ucId) {
    try {
      // UC v3: Retrieve consent details using the __ucCmp API.
      if (window.__ucCmp && typeof window.__ucCmp.getConsentDetails === 'function') {
        const p = window.__ucCmp.getConsentDetails();
        return p.then((details) => {
          if (!details) return false;
          // First check explicit services map/object for the service and require consent.given === true if present
          if (details.services) {
            const svc = Array.isArray(details.services)
              ? details.services.find((s) => s && (s.id === ucId || s.serviceId === ucId))
              : details.services[ucId] || details.services[String(ucId)] || null;
            if (svc) {
              const given = (svc.consent && typeof svc.consent.given !== 'undefined')
                ? !!svc.consent.given
                : (typeof svc.consent?.status !== 'undefined')
                    ? !!svc.consent.status
                    : (typeof svc.status !== 'undefined')
                        ? !!svc.status
                        : false;
              return given === true;
            }
          }

          // Then additionally require that the global consent serviceIds includes ucId
          if (details.consent && Array.isArray(details.consent.serviceIds)) {
            return details.consent.serviceIds.includes(ucId);
          }

          return false;
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
