# 5. A detached placeholder is reported, not recovered

Date: 2026-09-17

## Status

Accepted

## Context

If something removes the `.uc-widget-container` placeholder from the document
before consent is given — an SPA re-render, a tab panel — then consent arrives
for a widget with nothing to replace.

The original code was equally dead on that path but threw a `TypeError` that at
least reached `console.error`. Rewriting activation removed the throw, which
would have made the case silent.

## Decision

Report and stop. The activation path returns early, leaves `data-uc-src` intact
so the parked URL is not destroyed, and dispatches `ucw:activation-failed` on
`document`. It does not attempt to recover the widget.

## Consequences

The case is observable in production, which the `console.error` alone is not:
the build strips `console.*` from both bundles. The event is dispatched on
`document` rather than on the element, because the element is detached and a
listener on it would never fire.

The widget stays dead. By the time the branch runs it has been unregistered and
its service is recorded in `WidgetStore.activatedServices`, and its element is
reachable from nothing but the instance itself.

Recovery was considered and rejected as out of proportion. The scenario worth
supporting is not "a new element for the same service" — `main.js` runs once, so
no second widget is ever registered — but detach-then-*re*attach of the same
node, which is the only case where `container.parentNode` goes null and later
non-null again. Supporting it means latching `activatedServices` only on a real
activation, stopping `unregisterAll` from wiping widgets that bailed, and
updating all five readers of that set. That is its own change with its own
target scenario, and it should be argued on that scenario rather than folded in
here.
