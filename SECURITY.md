# Security policy

## Reporting a vulnerability

Report privately through GitHub's [security advisory form](https://github.com/netresearch/usercentrics-widgets/security/advisories/new). Please do not open a public issue for a vulnerability.

If you cannot use that form, write to security@netresearch.de and name this repository in the subject.

Include what you have: the affected version, the markup or configuration that triggers it, and what you observed. A proof of concept is welcome but not required to report.

## What is in scope

This library is a consent gate. Its job is that no third-party embed loads before consent is recorded for its service. Reports that bear on that are the most valuable, in particular:

- an embed that loads, or a script that executes, without consent for its service
- consent recorded in the CMP that does not match what the user did
- markup or configuration reaching the DOM in a way that lets an embed author run script in the host page

## What is not in scope

- The library does not block anything by itself. Embeds that were never converted to `data-uc-src` load normally, by design — see the first note in the README.
- The Usercentrics CMP itself, and the `privacy-proxy-server.usercentrics.eu` poster proxy used for YouTube placeholders. Report those to Usercentrics.
- Findings in `devDependencies` that do not reach the published bundle. The package has no runtime dependencies, and `dist/` is built from `src/` only.

## Supported versions

Fixes are made on `main` and released from there. Only the latest published version is supported; there are no maintenance branches.
