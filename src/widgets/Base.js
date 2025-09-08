import { widgetStore } from '../lib/WidgetStore';
import UcBridge from '../lib/UcBridge';

/*
 * Get default Text in page language
 */
const lang = document.documentElement.lang;

const isGerman = lang === 'de-DE' || lang === 'de' || lang === 'DE';

let DEFAULT_WIDGET_TEXT_SERVICE;
let DEFAULT_WIDGET_TEXT;
let DEFAULT_WIDGET_ACCEPT;

if (isGerman) {
  DEFAULT_WIDGET_TEXT_SERVICE = 'Wir nutzen den Service ';
  DEFAULT_WIDGET_TEXT = ' um Inhalte einzubetten. Dieser Service kann Daten zu Ihren Aktivitäten sammeln. ' +
                                'Stimmen Sie der Nutzung des Service zu, um diese Inhalte anzuzeigen.';
  DEFAULT_WIDGET_ACCEPT = 'Akzeptieren';
} else {
  DEFAULT_WIDGET_TEXT_SERVICE = 'We use the service ';
  DEFAULT_WIDGET_TEXT = ' to embed content. This service may collect data about your activities. ' +
      'Agree to use the Service to view this content.';
  DEFAULT_WIDGET_ACCEPT = 'Accept';
}

/**
 * Base widget class with enhanced consent detection
 */
class Base {
  /**
   * Base constructor for all widgets
   *
   * @param {Element} el
   */
  constructor (el) {
    /**
     * Original node element
     * @type {Element}
     */
    this.el = el;
    
    /**
     * Track if widget is activated
     * @type {boolean}
     */
    this.isActivated = false;
    
    /**
     * Widget configuration
     * @type {{}}
     */
    this.cfg = {
      /**
       * Usercentrics Service ID defined via data-data-uc-id on the widget
       * @type {string}
       */
      ucId: this.el.getAttribute('data-uc-id'),

      /**
       * Usercentrics Service Name defined via data-uc-id on the widget
       * @type {string}
       */
      ucName: this.el.getAttribute('data-usercentrics'),

      /**
       * Custom widget text
       * @type {string}
       */
      text: this.el.getAttribute('data-text'),

      /**
       * Custom accept label
       * @type {string}
       */
      accept: this.el.getAttribute('data-accept')
    };
  }

  /**
   * Returns the placeholder text
   *
   * @returns {string}
   */
  getEmbeddingText () {
    // If custom text is provided on the element, it takes precedence
    if (this.cfg.text) {
      return this.cfg.text;
    }
    // Check global config injected via optional config JS
    const cfg = (typeof window !== 'undefined' && window.UCW_WIDGET_CONFIG) ? window.UCW_WIDGET_CONFIG : null;
    // Resolve i18n config for current language if provided
    const i18n = cfg && cfg.i18n ? cfg.i18n : null;
    const langCfg = i18n ? (isGerman ? (i18n.de || i18n.DE) : (i18n.en || i18n.EN)) : null;
    // If a full HTML text is provided on language or root level, use it as-is
    if (langCfg && typeof langCfg.textHtml === 'string' && langCfg.textHtml.length > 0) {
      return langCfg.textHtml;
    }
    if (cfg && typeof cfg.textHtml === 'string' && cfg.textHtml.length > 0) {
      return cfg.textHtml;
    }
    // Otherwise, allow overriding prefix/suffix and keep default concatenation with service name
    const prefix = (langCfg && typeof langCfg.textServicePrefix === 'string')
      ? langCfg.textServicePrefix
      : (cfg && typeof cfg.textServicePrefix === 'string')
          ? cfg.textServicePrefix
          : DEFAULT_WIDGET_TEXT_SERVICE;
    const suffix = (langCfg && typeof langCfg.textSuffixHtml === 'string')
      ? langCfg.textSuffixHtml
      : (cfg && typeof cfg.textSuffixHtml === 'string')
          ? cfg.textSuffixHtml
          : DEFAULT_WIDGET_TEXT;
    return prefix + this.cfg.ucName + suffix;
  }

  /**
   * Returns the accept button text
   *
   * @return {string}
   */
  getAcceptButtonLabel () {
    if (this.cfg.accept) {
      return this.cfg.accept;
    }
    const cfg = (typeof window !== 'undefined' && window.UCW_WIDGET_CONFIG) ? window.UCW_WIDGET_CONFIG : null;
    const i18n = cfg && cfg.i18n ? cfg.i18n : null;
    const langCfg = i18n ? (isGerman ? (i18n.de || i18n.DE) : (i18n.en || i18n.EN)) : null;
    if (langCfg && typeof langCfg.acceptLabel === 'string' && langCfg.acceptLabel.length > 0) {
      return langCfg.acceptLabel;
    }
    if (cfg && typeof cfg.acceptLabel === 'string' && cfg.acceptLabel.length > 0) {
      return cfg.acceptLabel;
    }
    return DEFAULT_WIDGET_ACCEPT;
  }

  /**
   * Returns additional CSS class for the accept control wrapper
   * @return {string}
   */
  getAcceptLabelClass () {
    const cfg = (typeof window !== 'undefined' && window.UCW_WIDGET_CONFIG) ? window.UCW_WIDGET_CONFIG : null;
    const i18n = cfg && cfg.i18n ? cfg.i18n : null;
    const langCfg = i18n ? (isGerman ? (i18n.de || i18n.DE) : (i18n.en || i18n.EN)) : null;

    if (langCfg && typeof langCfg.acceptLabelClass === 'string' && langCfg.acceptLabelClass.length > 0) {
      return langCfg.acceptLabelClass;
    }
    if (cfg && typeof cfg.acceptLabelClass === 'string' && cfg.acceptLabelClass.length > 0) {
      return cfg.acceptLabelClass;
    }
    return '';
  }

  /**
   * Template for the embedding inside the main widget container
   *
   * @returns {string}
   */
  getEmbedding () {
    const extraClass = this.getAcceptLabelClass();
    const controlClass = extraClass && extraClass.trim().length > 0
      ? `uc-widget-control ${extraClass.trim()}`
      : 'uc-widget-control';
    return `\
<img class="uc-widget-background" src="${this.getBackground()}" alt="Background Image" width="100%" height="100%"/>\
<div class="uc-widget-embedding">\
  <div class="uc-widget-text">${this.getEmbeddingText()}</div>\
  <div class="uc-widget-control"><button class="uc-widget-accept ${controlClass}">${this.getAcceptButtonLabel()}</button></div>\
</div>\
`;
  }

  /**
   * Background image for the widget (default: transparent inline pixel)
   *
   * @returns {string}
   */
  getBackground () {
    const backgroundImage = this.el.getAttribute('data-uc-background-image');
    return backgroundImage ?? 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  }

  /**
   * Logic for replacing the embedding with the original content
   *
   * @param {boolean} fromWidget Indicates if the activation happened from the current Widget
   */
  activate (fromWidget) {
    // Prevent double activation
    if (this.isActivated) {
      return;
    }
    
    this.isActivated = true;
    const ucId = this.cfg.ucId;

    widgetStore.unregister(ucId, this);
    widgetStore.activate(ucId);

    if (fromWidget) {
      const cmp = new UcBridge();
      cmp.setConsent(ucId);
    }
    
    // If we have a container, perform the actual replacement
    if (this.container) {
      this.performActivation();
    }
  }
  
  /**
   * Perform the actual widget activation and content replacement
   */
  performActivation() {
    if (!this.container) return;
    
    // Store reference to container before replacement
    const containerToReplace = this.container;
    
    // Replace the container with the original element
    if (this.el && containerToReplace && containerToReplace.parentNode) {
      containerToReplace.replaceWith(this.el);
      
      // Clean up reference
      this.container = null;
      
      // Trigger any load events or scripts that might be needed
      if (this.el.tagName === 'IFRAME' && this.el.hasAttribute('data-uc-src')) {
        this.el.src = this.el.getAttribute('data-uc-src');
      }
      
      // Dispatch a custom event to signal activation
      this.el.dispatchEvent(new CustomEvent('ucw:activated', { 
        detail: { ucId: this.cfg.ucId },
        bubbles: true 
      }));
    }
  }

  /**
   * Check if consent is already granted and auto-activate
   */
  async checkInitialConsent() {
    const cmp = new UcBridge();
    
    // Wait for CMP to be ready
    cmp.waitForCmp(async () => {
      try {
        const consent = await cmp.getConsent(this.cfg.ucId);
        const hasConsent = consent === true || (consent && typeof consent.then === 'function' && await consent);
        
        if (hasConsent && this.container && !this.isActivated) {
          // Trigger click on accept button to activate properly
          const acceptButton = this.container.querySelector('.uc-widget-accept');
          if (acceptButton) {
            acceptButton.click();
          } else {
            // Fallback: activate directly
            this.activate(false);
          }
        }
      } catch (error) {
        // Silently ignore errors
      }
    });
  }

  /**
   * Render logic to show the widget
   */
  render () {
    const { width: nodeWith, height: nodeHeight } = this.el.getBoundingClientRect();

    const container = document.createElement('div');
    container.innerHTML = this.getEmbedding();
    container.setAttribute('class', 'uc-widget-container');
    container.setAttribute('width', `${Math.floor(nodeWith)}px`);
    container.setAttribute('height', `${Math.floor(nodeHeight)}px`);
    
    // Store the UC ID on the container for easier identification
    container.setAttribute('data-uc-id', this.cfg.ucId);
    container.setAttribute('data-uc-name', this.cfg.ucName || '');

    this.el.replaceWith(container);

    container
      .getElementsByClassName('uc-widget-accept')[0]
      .addEventListener('click', () => {
        this.activate(true);
      });

    this.container = container;

    widgetStore.register(this.cfg.ucId, this);
    
    // Check if consent is already granted
    this.checkInitialConsent();
  }
}

export default Base;
