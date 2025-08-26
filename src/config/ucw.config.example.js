// Example configuration for Usercentrics widgets text overrides.
// To use: include data-config="/assets/{BUILD_NUMBER}/vendor/usercentrics-widgets/ucw.config.js" on the ucw.js script tag.
// The config allows full HTML for the placeholder text, including links.

window.UCW_WIDGET_CONFIG = {
  // Language-specific overrides. Supported keys: de, en (case-insensitive).
  // Each language block may define: textHtml, acceptLabel, acceptLabelClass, textServicePrefix, textSuffixHtml
  i18n: {
    de: {
      textHtml: '<p>Wir verwenden Dienste von Drittanbietern, um Ihnen Inhalte zur Verfügung zu stellen, beispielsweise Videos, Karten von Google, Formulare. Diese und andere Dienste nutzen Cookies.<br/>Damit wir Ihnen diesen Inhalt anzeigen können, benötigen wir Ihr Einverständnis. Dieses erklären Sie durch Klicken des Buttons “Cookies dauerhaft zulassen”.</p>',
      acceptLabel: 'Cookies dauerhaft zulassen',
      acceptLabelClass: 'btn btn-primary'
      // Alternative to textHtml if you prefer the service name concatenation:
      // textServicePrefix: 'Wir nutzen den Service ',
      // textSuffixHtml: ' um Inhalte einzubetten. Dieser Service kann Daten zu Ihren Aktivitäten sammeln. Stimmen Sie der Nutzung des Service zu, um diese Inhalte anzuzeigen.'
    },
    en: {
      textHtml: '<p>We use third-party services to provide you with content, such as videos, Google maps, and forms. These and other services use cookies.<br/>To display this content, we need your consent. You can give this by clicking the “Allow cookies permanently” button.</p>',
      acceptLabel: 'Allow cookies permanently',
      acceptLabelClass: 'btn btn-primary'
      // Or use service name concatenation for EN:
      // textServicePrefix: 'We use the service ',
      // textSuffixHtml: ' to embed content. This service may collect data about your activities. Agree to use the Service to view this content.'
    }
  }

  // Backward-compatibility: you can also set the following at root level (applies for all languages):
  // textHtml: '...',
  // acceptLabel: '...',
  // textServicePrefix: '...',
  // textSuffixHtml: '...'
};
