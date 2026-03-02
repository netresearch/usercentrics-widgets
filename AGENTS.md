# AGENTS.md

## Project Overview

- **npm package**: `@netresearch/usercentrics-widgets` (public, MIT license)
- Lightweight CMP (Consent Management Platform) widget placeholders compatible with Usercentrics v2 and v3
- Replaces `<iframe>` elements with consent placeholders until the user grants consent via Usercentrics
- Built with Rollup, outputs IIFE bundles for modern and legacy (IE11) browsers
- Zero runtime dependencies

## Architecture

```
src/
  main.js                  # Entry point: loads config, finds [data-uc-src] elements, renders widgets
  lib/
    WidgetFactory.js       # Creates widget instances (Youtube or generic Iframe) based on URL host
    WidgetStore.js         # Singleton store managing widgets per Usercentrics service ID; links CMP consent events
    UcBridge.js            # Abstraction over Usercentrics v2 (UC_UI) and v3 (__ucCmp) APIs
    UrlParser.js           # Lightweight URL parser (no URL constructor, works in IE11)
    HtmlCollectionHelper.js # HTMLCollection-to-array polyfill
  widgets/
    Base.js                # Base widget: render placeholder, handle activation, i18n text, config resolution
    Iframe.js              # Generic iframe widget (extends Base)
    Youtube.js             # YouTube widget (extends Iframe) with poster image from Usercentrics privacy proxy
  config/
    ucw.config.example.js  # Example config file (copied to dist/ during build)
style/
  ucw.css                  # Widget CSS (minified to dist/ucw.min.css)
dist/
  ucw.js                   # Modern bundle (targets: defaults, not IE11)
  ucw.legacy.js            # Legacy bundle (targets: IE11)
  ucw.min.css              # Minified CSS
  ucw.config.js            # Example config
```

### Key data flow

1. `main.js` waits for `document.readyState === 'complete'`
2. Optionally loads external config via `<script data-config="path/to/config.js">`
3. Finds all `[data-uc-src]` elements, creates widgets via `WidgetFactory`
4. Each widget replaces the original element with a consent placeholder
5. `WidgetStore.linkCmp()` listens for Usercentrics consent events (v2 + v3)
6. On consent, widgets activate: placeholder is replaced with the original element, `src` is set

### Widget HTML attributes

- `data-uc-src` -- original iframe src (triggers widget creation)
- `data-uc-id` -- Usercentrics service ID
- `data-usercentrics` -- service display name
- `data-text` -- custom placeholder text (overrides default)
- `data-accept` -- custom accept button label
- `data-uc-background-image` -- custom background image URL

### Global config

Optional `window.UCW_WIDGET_CONFIG` object with i18n support (`i18n.de`, `i18n.en`) for `textHtml`, `textServicePrefix`, `textSuffixHtml`, `acceptLabel`, `acceptLabelClass`.

## Development

```bash
npm ci                  # Install dependencies
npm run build           # Build both bundles + minified CSS
npm run lint            # Lint with semistandard
npm run lint:fix        # Auto-fix lint issues
npm run watch           # Dev mode with rollup watch (console.* preserved)
```

- Linter: [semistandard](https://github.com/standard/semistandard) (standard + semicolons)
- No test suite currently (`npm test` exits with error)
- Node 24.x used in CI

## CI/CD

### Workflows (`.github/workflows/`)

| Workflow | Trigger | Purpose |
|---|---|---|
| `npm-publish.yml` | `release: created` | Lint + publish to npm (`--access public`) |
| `auto-merge-deps.yml` | `pull_request_target` | Auto-approve and rebase-merge Dependabot/Renovate PRs |

### Security

- **CodeQL**: Default setup (extended query suite) for JavaScript/TypeScript + Actions
- **Dependabot security updates**: Enabled (no `dependabot.yml` config file -- uses GitHub default)
- **Secret scanning + push protection**: Enabled
- **Workflow permissions**: Least-privilege (`permissions: {}` at workflow top, scoped per job)

### Script URL sanitization

`sanitizeScriptUrl()` in `main.js` validates config URLs loaded from DOM attributes:
- Blocks `javascript:`, `data:`, `vbscript:` schemes
- Requires same-origin
- Allows only `.js`/`.mjs` extensions
- Returns normalized `URL.href` (not the raw attribute value)

### npm overrides

`overrides` in `package.json` pins transitive dependencies for CVE mitigation when upstream hasn't patched.

## Repository Conventions

- **Merge strategy**: Rebase only (merge commits and squash disabled)
- **Conventional commits**: `feat:`, `fix:`, `chore:`, etc.
- **Signed commits**: Required
- **Default branch**: `main`
