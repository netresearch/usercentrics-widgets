import UcBridge from './UcBridge';

/**
 * Store to manage all active widgets with enhanced real-time consent handling
 */
class WidgetStore {
  constructor () {
    this.store = {};
    this.activatedServices = new Set(); // Track which services have been activated
    this.isListening = false;
    this.debug = window.location.search.includes('ucw-debug') || false;
  }

  /**
   * Log debug messages
   */
  log(...args) {
    if (this.debug) {
      console.log('[UCW-WidgetStore]', ...args);
    }
  }

  /**
   * Register a widget into the store
   *
   * @param {string} ucId Usercentrics Service ID
   * @param {Base} widget Widget instance
   */
  register (ucId, widget) {
    if (!this.store[ucId]) {
      this.store[ucId] = [];
    }
    this.store[ucId].push(widget);
    
    this.log(`Registered widget for service ${ucId}`);
    
    // Check if this service already has consent and activate immediately
    this.checkAndActivateService(ucId);
  }

  /**
   * Check if a service has consent and activate if it does
   * 
   * @param {string} ucId Usercentrics Service ID
   */
  async checkAndActivateService(ucId) {
    // Skip if already activated
    if (this.activatedServices.has(ucId)) {
      return;
    }

    const cmp = new UcBridge();
    
    // Wait for CMP to be ready
    cmp.waitForCmp(async () => {
      try {
        const consent = await cmp.getConsent(ucId);
        const hasConsent = consent === true || (consent && typeof consent.then === 'function' && await consent);
        
        this.log(`Service ${ucId} consent check:`, hasConsent);
        
        if (hasConsent) {
          this.log(`Immediate activation for service ${ucId} - consent already granted`);
          this.activate(ucId);
        }
      } catch (error) {
        this.log(`Error checking consent for ${ucId}:`, error);
      }
    });
  }

  /**
   * Remove the given widget instance
   *
   * @param {string} ucId Usercentrics Service ID
   * @param {Base} widget Widget instance
   */
  unregister (ucId, widget) {
    const widgets = this.store[ucId];

    if (widgets) {
      for (let i = 0; i < widgets.length; i++) {
        if (widgets[i] === widget) {
          delete widgets[i];
          break;
        }
      }
    }
  }

  /**
   * Remove all widget references from the store
   *
   * @param {string} ucId Usercentrics Service ID
   */
  unregisterAll (ucId) {
    this.store[ucId] = [];
  }

  /**
   * Triggers activation of all widgets for the given Service ID and remove them
   * from the store
   *
   * @param {string} ucId Usercentrics Service ID
   */
  activate (ucId) {
    // Prevent double activation
    if (this.activatedServices.has(ucId)) {
      this.log(`Service ${ucId} already activated, skipping`);
      return;
    }

    const widgets = this.store[ucId];

    if (widgets && widgets.length > 0) {
      this.log(`Activating ${widgets.length} widget(s) for service ${ucId}`);
      
      for (let i = 0; i < widgets.length; i++) {
        widgets[i] && widgets[i].activate(false);
      }
      
      this.activatedServices.add(ucId);
    }

    this.unregisterAll(ucId);
  }

  /**
   * Check all registered services for consent and activate if granted
   */
  async checkAllServicesConsent() {
    const cmp = new UcBridge();
    
    for (const ucId of Object.keys(this.store)) {
      // Skip if already activated
      if (this.activatedServices.has(ucId)) {
        continue;
      }
      
      try {
        const consent = await cmp.getConsent(ucId);
        const hasConsent = consent === true || (consent && typeof consent.then === 'function' && await consent);
        
        if (hasConsent) {
          this.log(`Activating service ${ucId} after consent change`);
          this.activate(ucId);
        }
      } catch (error) {
        this.log(`Error checking consent for ${ucId}:`, error);
      }
    }
  }

  /**
   * Setup enhanced event listeners for real-time consent changes
   */
  setupEnhancedListeners() {
    if (this.isListening) return;
    this.isListening = true;

    const cmp = new UcBridge();
    
    this.log('Setting up enhanced consent listeners');

    // Enhanced V3 event handling
    if (window.__ucCmp && typeof window.__ucCmp.addEventListener === 'function') {
      try {
        // Listen for consent changed events
        window.__ucCmp.addEventListener('consentChanged', (event) => {
          this.log('V3 consentChanged event received', event);
          setTimeout(() => this.checkAllServicesConsent(), 100);
        });

        // Listen for consent saved events
        window.__ucCmp.addEventListener('consentSaved', (event) => {
          this.log('V3 consentSaved event received', event);
          setTimeout(() => this.checkAllServicesConsent(), 100);
        });

        // Listen for UI interactions
        window.__ucCmp.addEventListener('uiChanged', (event) => {
          this.log('V3 uiChanged event received', event);
          if (event && event.action === 'acceptAll') {
            setTimeout(() => this.checkAllServicesConsent(), 100);
          }
        });
      } catch (e) {
        this.log('Error setting up V3 listeners:', e);
      }
    }

    // Enhanced V2 event handling
    if (window.UC_UI) {
      // Listen for accept all
      window.addEventListener('UC_UI_ACCEPT_ALL', () => {
        this.log('V2 accept all event received');
        setTimeout(() => this.checkAllServicesConsent(), 100);
      });

      // Listen for save settings
      window.addEventListener('UC_UI_SAVE_SETTINGS', () => {
        this.log('V2 save settings event received');
        setTimeout(() => this.checkAllServicesConsent(), 100);
      });

      // Listen for reject all
      window.addEventListener('UC_UI_REJECT_ALL', () => {
        this.log('V2 reject all event received');
        // Could implement de-activation here if needed
      });
    }

    // Existing view change handler with improvements
    window.addEventListener('UC_UI_VIEW_CHANGED', (e) => {
      if (e.detail) {
        this.log('V2 view changed', e.detail);
        
        // Check consent after dialog interactions
        if (e.detail.previousView && 
            e.detail.previousView !== 'NONE' && 
            e.detail.previousView !== 'PRIVACY_BUTTON' &&
            (e.detail.view === 'NONE' || e.detail.view === 'PRIVACY_BUTTON')) {
          // Dialog was closed, check for consent changes
          setTimeout(() => this.checkAllServicesConsent(), 100);
        }
      }
    });
  }

  /**
   * Link CMP to all registered widgets to react on consents coming from the CMP itself
   */
  linkCmp () {
    const cmp = new UcBridge();

    this.log('Linking CMP to widget store');

    // Setup enhanced listeners
    this.setupEnhancedListeners();

    // wait for the initial CMP consent
    for (const ucId of Object.keys(this.store)) {
      cmp.waitForCmpConsent(ucId, () => {
        this.log(`Initial consent detected for ${ucId}`);
        this.activate(ucId);
      });
    }

    // Also do an immediate check when CMP is ready
    cmp.waitForCmp(() => {
      this.log('CMP ready, performing initial consent check');
      setTimeout(() => this.checkAllServicesConsent(), 500);
    });

    // react on changes of the CMP based UI events (v2) - improved version
    window.addEventListener('UC_UI_VIEW_CHANGED', (e) => {
      if (e.detail && (e.detail.previousView === 'NONE' || e.detail.previousView === 'PRIVACY_BUTTON')) {
        return;
      }
      
      // Recheck all services after view change
      for (const ucId of Object.keys(this.store)) {
        if (!this.activatedServices.has(ucId)) {
          cmp.waitForCmpConsent(ucId, () => {
            this.log(`Consent detected for ${ucId} after view change`);
            this.activate(ucId);
          });
        }
      }
    });

    // react on consent changes for UC v3 (__ucCmp) if available - improved version
    try {
      if (window.__ucCmp && typeof window.__ucCmp.addEventListener === 'function') {
        window.__ucCmp.addEventListener('consentChanged', () => {
          this.log('V3 consent changed, rechecking all services');
          for (const ucId of Object.keys(this.store)) {
            if (!this.activatedServices.has(ucId)) {
              cmp.waitForCmpConsent(ucId, () => {
                this.log(`Consent detected for ${ucId} after V3 consent change`);
                this.activate(ucId);
              });
            }
          }
        });
      }
    } catch (e) {
      // ignore
    }
  }
}

const widgetStore = new WidgetStore();
export { widgetStore };
