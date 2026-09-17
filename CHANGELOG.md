# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]

### Fixed
- Script embeds now load once consent is given. `performActivation()` cleared `this.container` and `Iframe.activate()` then dereferenced it, so the `TypeError` fired on every activation and the deferred `src` assignment was never reached. Restoring the source is now one path in `Base.restoreSource()`, run after the element is back in the document
- `<script type="module">` embeds are restored as modules. The blocking `type` was removed unconditionally, so a module came back as a classic script and threw on its first `import`
- `tagName` is compared case-insensitively, so script embeds are also un-blocked in XHTML documents, where `tagName` keeps its source casing
- A detached placeholder no longer destroys the parked URL. `data-uc-src` was overwritten with the string `"null"`; it is now left intact and the case is reported via the new `ucw:activation-failed` event
- Reading a stored consent no longer writes it back to the CMP as a fresh user decision. `checkInitialConsent()` synthesised a click on the accept button, which routed through the consent-writing path
- v3 consent is read from `details.services[id].consent.given` only. The previous fallback to `details.consent.serviceIds` treated membership as consent, but that array lists the *denied* services when `details.consent.status` is `SOME_DENIED` — so it granted consent to services the user had refused
- A click before the Usercentrics script has loaded no longer leaves the widget permanently inert. `setConsent()` throws in that window, and the widget state was committed before the throw

### Changed
- `getConsent()` is always `async` and resolves to a boolean, mapping any CMP failure on either API version to "no consent". The caller-side promise checks are gone
- `dist/` is excluded from linting, so `bun run build` followed by `bun run lint` no longer reports errors in generated bundles

### Security
- The `data-config` URL is reconstructed through the `URL` constructor before it reaches the script `src`, so the DOM sink receives a normalised string rather than the raw attribute value

### Added
- `ucw:activation-failed` event on `document`, for the case where the placeholder left the DOM before consent arrived. The production build strips `console.*`, so this is the only observable signal
- Documentation for the `ucw:activated` and `ucw:activation-failed` events, for script embeds including `type="module"`, and architecture decision records under `docs/adr/`

## [2.0.8] - 2025-09-10

### Fixed
- Activation of multiple widgets on the same page

## [2.0.7] - 2025-09-09

### Changed
- Version bump only

## [2.0.6] - 2025-09-09

Tagged and released on GitHub, but never published to npm — the version bump landed after the tag, so `package.json` still read 2.0.5.

### Changed
- Corrected linter styles

## [2.0.5] - 2025-09-09

### Fixed
- Updated Base.js widget implementation
- Improved overlay handling
- Removed debug mode and added automatic overlay removal

## [2.0.4] - 2025-09-01

### Fixed
- v3 API call to save consent settings

## [2.0.3] - 2025-09-01

### Fixed
- Runtime error: `this.isGerman is not a function`

## [2.0.2] - 2025-09-01

### Fixed
- Undefined variable `extMatch` in the script URL validation

## [2.0.1] - 2025-09-01

### Changed
- Version bump only

## [2.0.0] - 2025-09-01

### Added
- Support Usercentrics v3 browser API
- Support async consent check for v3
- Add configuration file option for customizable texts


## [1.2.1] - 2025-08-25
### Changed
- [TASK] Set new npm version


## [1.2.0] - 2025-08-25
### Changed
- chore(deps): update dependency rollup to v4.48.1
- chore(deps): update dependency rollup to v4.46.4
- chore(deps): update dependency rollup to v4.46.3
- chore(deps): update actions/checkout action to v5
- chore(deps): update babel monorepo to v7.28.3
- chore(deps): update dependency rollup to v4.46.2
- chore(deps): update dependency rollup to v4.44.2
- chore(deps): update babel monorepo to v7.28.0
- chore(deps): update dependency rollup to v4.44.1
- chore(deps): update dependency @babel/core to v7.27.7
- chore(deps): update dependency rollup to v4.43.0
- chore(deps): update dependency rollup to v4.42.0
- chore(deps): update dependency rollup to v4.41.1
- chore(deps): update babel monorepo to v7.27.4
- chore(deps): update dependency rollup to v4.38.0
- chore(deps): update dependency rollup to v4.37.0
- chore(deps): update dependency rollup to v4.36.0
- chore(deps): update dependency rollup to v4.35.0
- chore(deps): update dependency @babel/core to v7.26.10
- chore(deps): update dependency node to v22
- chore(deps): update dependency rollup to v4.34.9
- chore(deps): update dependency standard to v17.1.2
- chore(deps): update babel monorepo to v7.26.9
- chore(deps): update dependency rollup to v4.34.8
- chore(deps): update actions/checkout action to v4
- chore(deps): update actions/setup-node action to v4
- Bump serialize-javascript from 6.0.1 to 6.0.2
- chore(deps): update dependency clean-css-cli to v5.6.3
- Add renovate.json
- Bump braces from 3.0.2 to 3.0.3
- Bump rollup from 4.2.0 to 4.22.4


## [1.1.0] - 2023-11-01
### Changed
- Set new version v1.1.0
- [TASK] Set alt-, height and width attribute for background image to improve SEO and google lighthouse test
- Update rollup config
- Update dependencies
- [TASK] Make width and height calculation of consentbox more clear
- [TASK] Update documentation for new background-image-url
- [FEATURE] Support manual background-images using "data-uc-background-image"
- feat: upgrade rollup-plugin-polyfill from 3.0.0 to 4.0.0
- feat: upgrade @rollup/plugin-strip from 2.0.1 to 3.0.3
- Bump @babel/traverse from 7.14.5 to 7.23.2
- Bump word-wrap from 1.2.3 to 1.2.4
- fix: upgrade clean-css from 5.1.2 to 5.3.2
- feat: upgrade semistandard from 16.0.1 to 17.0.0


## [1.0.12] - 2023-01-03
### Changed
- Set new version v1.0.12


## [1.0.11] - 2023-01-02
### Changed
- Bump json5 from 2.2.0 to 2.2.3


## [1.0.10] - 2022-11-17
### Changed
- Update package.json
- Update package.json
- Update npm-publish.yml
- Update npm-publish.yml


## [1.0.9] - 2022-11-17
### Changed
- Cleanup Readme
- Bump minimatch from 3.0.4 to 3.1.2
- Bump terser from 5.7.0 to 5.14.2
- Bump minimist from 1.2.5 to 1.2.6
- Fix background image overlay


## [1.0.8] - 2022-01-04
### Changed
- 1.0.8
- NRNR-1118: Refactor code style
- NRNR-1118: Update Readme


## [1.0.7] - 2022-01-04
### Changed
- 1.0.7
- NRNR-1118: Fix security
- NRNR-1118: Build assets


## [1.0.6] - 2022-01-04
### Changed
- 1.0.6
- NRNR-1118: Remove dist to generate with github pipeline


## [1.0.5] - 2022-01-04
### Changed
- 1.0.5
- NRNR-1118: Fix npmjs publishing
- NRNR-1118: Fix npmjs publishing


## [1.0.4] - 2022-01-04
### Changed
- 1.0.4
- NRNR-1118: Fix pipeline


## [1.0.3] - 2022-01-04
### Changed
- 1.0.3


## [1.0.2] - 2022-01-04
### Changed
- 1.0.2
- NRNR-1118: Cleanup example
- NRNR-1118: Add pipeline for npmjs publish


## [1.0.1] - 2022-01-04
### Changed
- 1.0.1
- NRNR-1118: Correct package information


## [1.0.0] - 2022-01-04
### Changed
- NRNR-1118: Define new styling
- NRNR-1118: Add composer json
- define npm package files


## [0.0.4] - 2021-06-20
### Fixed
- Centering button in default layout


## [0.0.3] - 2021-06-13
### Added
- Customization of widget text and labels

### Fixed
- Cover image for youtube.com


## [0.0.2] - 2021-06-13
### Fixed
- Listen to CMP changes for all services (removed code block intended for testing)


## [0.0.1] - 2021-06-13
### Added
- Support for iframes
- Proxied background for Youtube embeddings
- Interaction with Usercentrics CMPv2
- Examples and initial documentation

