# 7. The consent write must complete before activation

Date: 2026-09-17

## Status

Accepted

## Context

`UcBridge.setConsent()` started `__ucCmp.updateServicesConsents()`, returned
without awaiting it, did not return `saveConsents()` from its `.then`, and
consumed the rejection in a `.catch`. `Base.activate()` then committed the
widget and loaded the embed while persistence was still in flight — or after it
had already failed. The build strips `console.*`, so the failure left no trace
in production at all.

The same method had a second branch: when `__ucCmp` existed without
`updateServicesConsents`, it called `saveConsents()` on its own. Per the
vendor's shipped source — `@usercentrics/cmp-web-sdk@1.0.0-beta.1`,
`package/browser.js`, the same artefact ADR 3 cites — that persists the current
in-memory state as an explicit user decision — one that does not include the service just accepted —
and the embed then loaded anyway.

## Decision

`setConsent()` is `async`, requires **both** `updateServicesConsents` and
`saveConsents`, awaits both, and propagates any failure. `Base.activate()`
awaits it, so a failed write stops the activation.

Requiring both is deliberate and symmetric: `updateServicesConsents` changes
the in-memory state and `saveConsents` writes the decision. Treating the second
as optional would resolve, and let the embed load, with nothing stored — the
defect this record exists to close, one call further along.

A CMP exposing neither is refused with a named error rather than silently
falling back.

## Consequences

An embed cannot load on the strength of a write that did not happen. That is
the property the library exists to enforce, and it now holds by construction
rather than by hope.

Making `activate()` async needed three supporting changes, each of which is a
defect if omitted: a re-entrancy flag, because `isActivated` is only set after
the write and a second click inside that window would record consent twice; a
`.catch` on the click listener, because an unhandled rejection is the failure
mode that replaces the silent one; and a `.catch` in `WidgetStore.activate()`,
whose per-widget `try/catch` cannot see a rejection.

**Accepted cost.** A widget can be left inert when a second activation for the
same service resolves while its own write is still in flight — two widgets
clicked inside the same window, or one click racing a store-driven activation
from the CMP dialog. Taking the two-widget case: the first widget's completed write runs
`WidgetStore.activate()`, whose loop skips the second at the re-entrancy guard,
and the store then latches the service anyway. If the second widget's own write
then fails, no store-driven path reaches it again and only another click will.
The same holds if a CMP promise never settles, since there is no timeout. Both
are fail-closed — nothing loads without consent — so this is availability, not
a bypass, and it is narrower than the behaviour it replaces, which activated
everything unconditionally. Fixing it means latching `activatedServices` only
for widgets that actually activated, which is the change ADR 5 declined for its
own reasons; if that is ever done, it closes this too.

**Unestablished.** Whether any shipped Usercentrics build exposes `__ucCmp`
without these methods is not known, and this turns that configuration from a
silent false consent record into a hard, named failure. That is the safe
direction for a consent gate, but it is a behaviour change for such a build if
one exists.
