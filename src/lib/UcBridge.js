/**
 * Locates a service entry in a v3 consent-details payload, which is either an
 * array of services or a map keyed by service ID.
 *
 * @param {Array|Object} services
 * @param {string} ucId - The Usercentrics Service ID.
 * @return {Object|null}
 */
function findServiceEntry (services, ucId) {
  if (Array.isArray(services)) {
    return services.find((s) => s && (s.id === ucId || s.serviceId === ucId)) || null;
  }

  return services[ucId] || services[String(ucId)] || null;
}

/**
 * Reads the consent flag off a v3 service entry. Builds disagree on where it
 * sits, so take the first field that is present and treat a missing one as
 * "not consented" rather than as unknown.
 *
 * @param {Object} svc
 * @return {boolean}
 */
function readServiceConsent (svc) {
  if (svc.consent && typeof svc.consent.given !== 'undefined') {
    return !!svc.consent.given;
  }

  if (typeof svc.consent?.status !== 'undefined') {
    return !!svc.consent.status;
  }

  return !!svc.status;
}

/**
 * Reads consent from the UC v3 `__ucCmp` API.
 *
 * @param {string} ucId - The Usercentrics Service ID.
 * @return {Promise<boolean>}
 */
async function getConsentV3 (ucId) {
  const details = await window.__ucCmp.getConsentDetails();

  if (!details) {
    return false;
  }

  if (details.services) {
    const svc = findServiceEntry(details.services, ucId);

    if (svc) {
      return readServiceConsent(svc);
    }
  }

  // No explicit service entry: fall back to the global consented-service list.
  if (details.consent && Array.isArray(details.consent.serviceIds)) {
    return details.consent.serviceIds.includes(ucId);
  }

  return false;
}

/**
 * Reads consent from the legacy UC v2 `UC_UI` API. Newer CMP builds resolve
 * `getServicesBaseInfo()` asynchronously, older ones return the array.
 *
 * @param {string} ucId - The Usercentrics Service ID.
 * @return {Promise<boolean>}
 */
async function getConsentV2 (ucId) {
  const services = await window.UC_UI.getServicesBaseInfo();

  if (!Array.isArray(services)) {
    return false;
  }

  for (const service of services) {
    if (service.id === ucId) {
      return !!service.consent?.status;
    }
  }

  return false;
}

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
    this.waitForCmp(async () => {
      if (await this.getConsent(ucId)) {
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
   * Always resolves: any failure of the underlying CMP call, on either API
   * version, counts as "no consent" rather than propagating.
   *
   * @param {string} ucId - The Usercentrics Service ID.
   * @return {Promise<boolean>} - Resolves true if consent is granted, false otherwise.
   */
  async getConsent (ucId) {
    try {
      if (window.__ucCmp && typeof window.__ucCmp.getConsentDetails === 'function') {
        return await getConsentV3(ucId);
      }

      if (window.UC_UI && typeof window.UC_UI.getServicesBaseInfo === 'function') {
        return await getConsentV2(ucId);
      }

      // Unknown environment.
      return false;
    } catch (e) {
      return false;
    }
  }
}

export default UcBridge;
