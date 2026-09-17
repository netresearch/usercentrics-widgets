/**
 * Reads consent from the UC v3 `__ucCmp` API.
 *
 * `details.services` is a map keyed by service ID, and the per-service flag is
 * `consent.given`. That is the whole contract — it is what the CMP itself reads
 * back when it restores a stored decision.
 *
 * Deliberately no fallback to `details.consent.serviceIds`: that array is a
 * delta list whose meaning depends on `details.consent.status`. It is empty for
 * `ALL_ACCEPTED` and `ALL_DENIED`, lists the CONSENTED services for
 * `SOME_ACCEPTED`, and lists the DENIED ones for `SOME_DENIED` — the CMP picks
 * whichever list is shorter. Reading membership as consent therefore inverts
 * the answer in the `SOME_DENIED` case, which is the common one for a user who
 * accepts most services and refuses a few.
 *
 * A service absent from `services` is not configured in this CMP setting, and
 * "not configured" is not consent.
 *
 * @param {string} ucId - The Usercentrics Service ID.
 * @return {Promise<boolean>}
 */
async function getConsentV3 (ucId) {
  const details = await window.__ucCmp.getConsentDetails();

  return findServiceEntry(details?.services, ucId)?.consent?.given === true;
}

/**
 * Looks a service up in a v3 `services` map, falling back to the subservices of
 * each entry — which is what the CMP's own `getService()` does. Without the
 * fallback an embed configured with a subservice id resolves to nothing and
 * stays a placeholder whatever the visitor consented to.
 *
 * `hasOwnProperty` rather than a plain index, so a service id that collides
 * with an `Object.prototype` member (`constructor`, `toString`) cannot return
 * an inherited value.
 *
 * @param {Object|undefined} services
 * @param {string} ucId - The Usercentrics Service ID.
 * @return {Object|undefined}
 */
function findServiceEntry (services, ucId) {
  if (!services || typeof services !== 'object') {
    return undefined;
  }

  if (Object.prototype.hasOwnProperty.call(services, ucId)) {
    return services[ucId];
  }

  for (const key of Object.keys(services)) {
    const subservices = services[key] && services[key].subservices;

    if (subservices && Object.prototype.hasOwnProperty.call(subservices, ucId)) {
      return subservices[ucId];
    }
  }

  return undefined;
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
   * Records consent for a service with the Usercentrics CMP, and resolves only
   * once the CMP has persisted it.
   *
   * It used to start `updateServicesConsents()` and return, neither awaiting
   * the promise nor returning it, with a `.catch` that swallowed the rejection
   * — and the build strips `console.*`, so a failed write left no trace at all
   * while the embed went on to load. The caller now awaits this, so a failure
   * stops the activation instead of producing an embed with no recorded
   * consent.
   *
   * @param {string} ucId - The Usercentrics Service ID.
   * @return {Promise<void>} - Resolves when the CMP has stored the consent.
   * @throws {Error} - If the CMP is not ready, exposes no way to record a
   *                   single service's consent, or fails to store it.
   */
  async setConsent (ucId) {
    if (!this.isCmpReady()) {
      throw new Error('Usercentrics CMP is not ready!');
    }

    // Prefer UC v3 (__ucCmp) API if available
    if (window.__ucCmp) {
      // `saveConsents()` on its own persists the CURRENT state as an explicit
      // user decision — one that does not include the service just accepted.
      // Refusing is the only safe option: the embed must not load on the back
      // of a decision that excludes it.
      if (typeof window.__ucCmp.updateServicesConsents !== 'function') {
        throw new Error('Usercentrics CMP cannot record consent for a single service: __ucCmp.updateServicesConsents is missing');
      }

      await window.__ucCmp.updateServicesConsents([{ id: ucId, consent: true }]);

      if (typeof window.__ucCmp.saveConsents === 'function') {
        await window.__ucCmp.saveConsents();
      }

      return;
    }

    // Legacy v2 fallback
    if (window.UC_UI && typeof window.UC_UI.acceptService === 'function') {
      await window.UC_UI.acceptService(ucId);

      return;
    }

    throw new Error('Usercentrics CMP exposes no way to record consent');
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
