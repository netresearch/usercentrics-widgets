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
 * Escapes a value for interpolation into the placeholder markup.
 *
 * The placeholder is built as a string and assigned via `innerHTML`, so every
 * value that is documented as plain text has to be escaped on the way in. That
 * is all of the `data-*` attributes: they come from the page's markup, which in
 * a CMS is frequently editorial or user-supplied content. An author who can set
 * only an attribute would otherwise reach script execution.
 *
 * The quote characters matter as much as the angle brackets — two of these land
 * inside quoted attribute values, where a bare `"` ends the attribute early.
 *
 * Values documented as HTML (`textHtml`, `textServicePrefix`, `textSuffixHtml`)
 * come from the site's own config file, are HTML by design, and are not passed
 * through here.
 *
 * @param {*} value
 * @returns {string}
 */
function escapeHtml (value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
     * Set while the CMP write for a click is in flight. `isActivated` is only
     * set after that write resolves, so without this a second click inside the
     * window would pass the guard and record the consent twice.
     * @type {boolean}
     */
    this.isRecordingConsent = false;

    /**
     * Widget configuration
     * @type {{}}
     */
    this.cfg = {
      /**
       * Usercentrics Service ID defined via data-uc-id on the widget
       * @type {string}
       */
      ucId: this.el.getAttribute('data-uc-id'),

      /**
       * Usercentrics Service Name defined via data-usercentrics on the widget
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
    // If custom text is provided on the element, it takes precedence. It comes
    // from a `data-` attribute and is documented as text, so it is escaped;
    // the config's `textHtml` below is the documented way to pass markup.
    if (this.cfg.text) {
      return escapeHtml(this.cfg.text);
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
    return prefix + escapeHtml(this.cfg.ucName) + suffix;
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
   * Returns additional CSS class(es) for the accept button itself
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
      ? `uc-widget-control ${escapeHtml(extraClass.trim())}`
      : 'uc-widget-control';
    // `getEmbeddingText()` returns markup by design and escapes its own
    // untrusted parts; everything else here is text or an attribute value.
    return `\
<img class="uc-widget-background" src="${escapeHtml(this.getBackground())}" alt="Background Image" width="100%" height="100%"/>\
<div class="uc-widget-embedding">\
  <div class="uc-widget-text">${this.getEmbeddingText()}</div>\
  <div class="uc-widget-control"><button class="uc-widget-accept ${controlClass}">${escapeHtml(this.getAcceptButtonLabel())}</button></div>\
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
  async activate (fromWidget) {
    // Prevent double activation
    if (this.isActivated || this.isRecordingConsent) {
      return;
    }

    const ucId = this.cfg.ucId;

    // Hand the decision to the CMP before anything is committed. On the v2
    // path that is the whole write; on the v3 path `setConsent()` only starts
    // `updateServicesConsents()` and does not await it, so persistence may
    // still be in flight — or have failed — once this returns. See #148.
    //
    // `setConsent()` throws while the Usercentrics script is still loading,
    // and the placeholder is clickable from `readyState === 'complete'`, so
    // that window is reachable.
    //
    // The throw still escapes the click listener, deliberately — it is the only
    // signal that the click did not take. What the order changes is that it now
    // commits nothing on the way out: the widget is no longer left flagged as
    // activated (so a second click retries instead of returning at the guard
    // above), the siblings are no longer activated with no consent stored, and
    // the service is no longer latched in `WidgetStore.activatedServices`, so a
    // later genuine consent event can still activate it.
    if (fromWidget) {
      // Wait for the CMP to store the decision. If it fails, nothing is
      // committed and the embed does not load — a consent gate must not show
      // the content on the strength of a write that did not happen.
      this.isRecordingConsent = true;

      try {
        await new UcBridge().setConsent(ucId);
      } finally {
        this.isRecordingConsent = false;
      }

      // A store-driven activation can have landed while that was in flight.
      if (this.isActivated) {
        return;
      }
    }

    this.isActivated = true;

    widgetStore.unregister(ucId, this);
    widgetStore.activate(ucId);

    // If we have a container, perform the actual replacement
    if (this.container) {
      this.performActivation();
    }
  }

  /**
   * Perform the actual widget activation and content replacement
   */
  performActivation () {
    if (!this.container) return;

    // Store reference to container before replacement
    const containerToReplace = this.container;

    // The placeholder can be gone by now, e.g. because an SPA rerendered the
    // page before consent was given. There is nothing left to replace, and this
    // instance cannot bring the embed back: it has already been unregistered and
    // its service is marked active. Report it and leave `data-uc-src` in place,
    // so the parked URL is at least not destroyed on the way out. The build
    // strips `console.*`, so the event is the half of this a production page
    // can observe; it is dispatched on `document`, because `this.el` is
    // detached and an event on it would reach no listener.
    if (!containerToReplace.parentNode) {
      console.error('[Usercentrics Widgets] Cannot activate widget, its placeholder is no longer in the document:', this.cfg.ucId);

      document.dispatchEvent(new CustomEvent('ucw:activation-failed', {
        detail: { ucId: this.cfg.ucId, reason: 'placeholder-detached' },
        bubbles: true
      }));

      return;
    }

    containerToReplace.replaceWith(this.el);

    // Clean up reference
    this.container = null;

    // Trigger any load events or scripts that might be needed
    this.restoreSource();

    // Dispatch a custom event to signal activation
    this.el.dispatchEvent(new CustomEvent('ucw:activated', {
      detail: { ucId: this.cfg.ucId },
      bubbles: true
    }));
  }

  /**
   * Give the element back the `src` the placeholder parked in `data-uc-src`.
   *
   * The element is back in the document at this point, so assigning `src` is
   * what makes an iframe load and a script run. A blocking `type` such as
   * `text/plain` has to go first, or the script stays inert.
   */
  restoreSource () {
    const src = this.el.getAttribute('data-uc-src');

    if (!src) return;

    this.el.removeAttribute('data-uc-src');

    // `tagName` keeps the source casing in XHTML documents, so normalize it.
    if (this.el.tagName.toLowerCase() === 'script') {
      const type = this.el.getAttribute('type');

      // Only the blocking placeholder type has to go. Dropping `module` too
      // would restore the embed as a classic script, which fails on the first
      // `import` — the default classic type needs no attribute either way.
      if (type && type.trim().toLowerCase() !== 'module') {
        this.el.removeAttribute('type');
      }
    }

    this.el.setAttribute('src', src);
  }

  /**
   * Check if consent is already granted and auto-activate
   */
  async checkInitialConsent () {
    const cmp = new UcBridge();

    // Wait for CMP to be ready
    cmp.waitForCmp(async () => {
      try {
        const hasConsent = await cmp.getConsent(this.cfg.ucId);

        if (hasConsent && this.container && !this.isActivated) {
          // Activate directly. Synthesising a click on the accept button would
          // route through `activate(true)` and write the consent we just read
          // back to the CMP as a fresh user decision.
          await this.activate(false);
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
        // `activate(true)` waits for the CMP to store the decision and rejects
        // if it does not. Report that instead of leaving an unhandled
        // rejection: the build strips `console.*`, so the event is the only
        // signal a production page can observe.
        this.activate(true).catch((error) => {
          console.error('[Usercentrics Widgets] Could not record consent, the embed was not activated:', this.cfg.ucId, error);

          document.dispatchEvent(new CustomEvent('ucw:activation-failed', {
            detail: { ucId: this.cfg.ucId, reason: 'consent-not-recorded' },
            bubbles: true
          }));
        });
      });

    this.container = container;

    widgetStore.register(this.cfg.ucId, this);

    // Check if consent is already granted
    this.checkInitialConsent();
  }
}

export default Base;
