# Architecture decision records

Short records of decisions that are not obvious from the code and that someone
would otherwise re-litigate. Each states the context, the decision, and what it
costs — including the consequences that argue against it.

They are written when the decision is made, and superseded rather than edited
once something depends on them. A record whose decision has been reversed keeps
its file and gains a "Superseded by" line, so the reasoning stays readable.

| # | Title | Status |
|---|---|---|
| [0001](0001-hold-babel-on-7.md) | Hold Babel on 7.x | Accepted |
| [0002](0002-getconsent-always-resolves.md) | `getConsent()` always resolves to a boolean | Accepted |
| [0003](0003-no-serviceids-fallback.md) | Read v3 consent only from the services map | Accepted |
| [0004](0004-preserve-script-type-module.md) | Preserve `type="module"` on script embeds | Accepted |
| [0005](0005-detached-placeholder-is-reported-not-recovered.md) | A detached placeholder is reported, not recovered | Accepted |
| [0006](0006-no-test-runner.md) | No test runner | Accepted |
| [0007](0007-consent-write-must-complete-before-activation.md) | The consent write must complete before activation | Accepted |
