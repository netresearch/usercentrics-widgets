import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        CustomEvent: 'readonly',
        URL: 'readonly',
        HTMLElement: 'readonly',
        MutationObserver: 'readonly',
        NodeList: 'readonly',
        Event: 'readonly'
      }
    },
    rules: {
      semi: ['error', 'always'],
      'no-extra-semi': 'error',
      'no-unused-vars': ['error', {
        args: 'none',
        caughtErrors: 'none'
      }]
    }
  }
];
