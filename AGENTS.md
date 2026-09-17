# AGENTS.md

## Project Overview

- **npm package**: `@netresearch/usercentrics-widgets` (public, MIT license)
- Lightweight CMP (Consent Management Platform) widget placeholders compatible with Usercentrics v2 and v3
- Replaces `<iframe>` and `<script>` elements with consent placeholders until the user grants consent via Usercentrics
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
    HtmlCollectionHelper.js # HTMLCollection-to-array helper
  replaceWith.js           # ChildNode.replaceWith polyfill (legacy bundle only)
  widgets/
    Base.js                # Base widget: render placeholder, handle activation, i18n text, config resolution
    Iframe.js              # Generic iframe widget (extends Base)
    Youtube.js             # YouTube widget (extends Iframe) with poster image from Usercentrics privacy proxy
  config/
    ucw.config.example.js  # Example config file (copied to dist/ during build)
style/
  ucw.css                  # Widget CSS (minified to dist/ucw.min.css)
  _usercentrics_widgets.scss # SCSS source, independent of dist/ucw.min.css
dist/                      # BUILD OUTPUT — gitignored, produced by `bun run build`
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

- `data-uc-src` -- the parked `src` of the blocked element (`<iframe>` or `<script>`); its presence triggers widget creation
- `data-uc-id` -- Usercentrics service ID
- `data-usercentrics` -- service display name
- `data-text` -- custom placeholder text (overrides default)
- `data-accept` -- custom accept button label
- `data-uc-background-image` -- custom background image URL

### Global config

Optional `window.UCW_WIDGET_CONFIG` object with i18n support for `textHtml`, `textServicePrefix`, `textSuffixHtml`, `acceptLabel`, `acceptLabelClass`. Keys are read at `i18n.<lang>` and at root level, in that precedence, after the element's own attribute. Recognised language keys are `de`/`DE` and `en`/`EN` only — no other casing is matched.

`acceptLabelClass` is added to the accept **button**, not to the wrapping element.

### Events

- `ucw:activated` -- on the restored element, bubbles, `detail: { ucId }`, fired after `src` is assigned
- `ucw:activation-failed` -- on `document`, bubbles, `detail: { ucId, reason }`, fired when the placeholder left the DOM before consent arrived

Neither is covered by a test; `console.*` is stripped from both bundles, so the event is the only production-observable signal for the failure case.

## Development

```bash
bun install             # Install dependencies
bun run build           # Build both bundles + minified CSS
bun run lint            # Lint with ESLint
bun run lint:fix        # Auto-fix lint issues
bun run watch           # Dev mode with rollup watch (console.* preserved)
```

- Linter: ESLint 10 flat config (`eslint.config.mjs`), built on `@eslint/js` recommended plus three rules. `semistandard` was dropped in `4be1820`
- `bun run build:css` exists as a separate script and is called by `bun run build`
- No test suite currently. `bun run test` (and `npm test`) is a placeholder script that exits with an error; `bun test`, Bun's own runner, finds no test files. CI sets `enable-test: false`
- Node 24.x used in CI

## CI/CD

### Workflows (`.github/workflows/`)

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | push to `main`, every PR | The main gate, via the shared `netresearch/.github` `node-ci.yml`: ESLint, build, npm audit at `high`, CodeQL, dependency review. Tests and gitleaks are disabled |
| `npm-publish.yml` | push of a `v*` tag, or manual dispatch naming a tag | Build, publish to npm (`--access public`) and create the GitHub Release. Authenticates over **OIDC Trusted Publishing** — no `NPM_TOKEN` — and publishes with provenance. It does **not** lint or test — the shared `node-release.yml` states that is out of its scope. `version-source: manifest-verified` fails the run when the tag and `package.json` disagree |
| `auto-merge-deps.yml` | `pull_request_target` | Auto-approve and rebase-merge Dependabot/Renovate PRs |

### Security

- **CodeQL**: runs as a job inside `ci.yml` (via `netresearch/.github`), language `javascript-typescript`, query suite `security-and-quality`. GitHub's CodeQL *default setup* is `not-configured` for this repository
- **Dependabot security updates**: Enabled (no `dependabot.yml` config file -- uses GitHub default)
- **Secret scanning + push protection**: Enabled
- **npm publishing**: OIDC Trusted Publishing, registered on npmjs.com against the repository and the caller filename `npm-publish.yml`. Renaming that file breaks publishing until the publisher entry is updated; the publisher must never name the reusable `node-release.yml`, since npm validates the run's entry-point workflow. The npm trusted-publisher entry cannot be edited after creation — it has to be deleted and recreated. No npm token is forwarded to the publish workflow; the unused repository secret `NPM_TOKEN` is pending deletion
- **Workflow permissions**: `permissions: {}` at the top of `ci.yml` and `npm-publish.yml`, scoped per job. `auto-merge-deps.yml` is the exception: it sets `contents: write` and `pull-requests: write` at workflow level on a `pull_request_target` trigger

### Script URL sanitization

`sanitizeScriptUrl()` in `main.js` validates config URLs loaded from DOM attributes:
- Blocks `javascript:`, `data:`, `vbscript:` schemes
- Requires same-origin
- Allows only `.js`/`.mjs` extensions
- Returns normalized `URL.href` (not the raw attribute value)

### npm overrides

`overrides` in `package.json` pins transitive dependencies for CVE mitigation when upstream hasn't patched.

## Repository Conventions

- **Merge strategy**: Rebase only (merge commits and squash disabled). Note that a rebase merge rewrites the commits, so signatures made on the branch do not survive onto `main`
- **Conventional commits**: `feat:`, `fix:`, `chore:`, etc.
- **Signed commits**: convention, not enforcement. `main` has classic protection against deletion and force-push; `required_signatures` is false and there are no required reviews or status checks. The `main` ruleset matches no branch (`conditions.ref_name.include` is empty)
- **Default branch**: `main`
- **ADRs**: `docs/adr/`
