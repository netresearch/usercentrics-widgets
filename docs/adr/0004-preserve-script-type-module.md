# 4. Preserve `type="module"` on script embeds

Date: 2026-09-17

## Status

Accepted

## Context

A blocked script carries a non-executing `type`, conventionally `text/plain`.
Activation removed the `type` attribute unconditionally, which is what un-blocks
the script — but it also flattened a legitimate `type="module"` embed to a
classic script, so the first `import` threw a `SyntaxError` and the embed was
silently dead.

This was invisible before script embeds worked at all: the activation path threw
earlier, so no script ever ran.

The ordering is load-bearing and not obvious. The element is re-connected first,
then the `type` is cleared, then `src` is assigned. A connected script that
previously had no `src` re-runs "prepare the script element" when `src` is set,
and with the blocking type gone it executes. Reversing those two lines silently
re-breaks every script embed.

## Decision

Remove the `type` attribute only when it is not `module`, comparing after
trimming and lowercasing — the HTML specification strips leading and trailing
ASCII whitespace before matching the type, so `type=" module "` is a module to
the browser.

## Consequences

Module embeds work. A `type` that is neither blocking nor `module` (for instance
`application/json`) is still dropped and the embed is restored as a classic
script; that matches the previous behaviour and no case is known where it is
wrong.

`String.prototype.trim()` strips more than the specification's ASCII whitespace
set — it also removes non-breaking space, BOM and the Unicode separators. For a
`type` value containing one of those next to `module`, the browser would not
treat the element as a module either way, so the embed is inert under both the
old and the new behaviour; only the failure mode differs.

An embed that already carries its own `src` is not rescued: the attribute is
overwritten by `data-uc-src` and, having had a `src` all along, the element does
not re-prepare. That shape is not produced by the documented usage.
