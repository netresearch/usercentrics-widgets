# 2. `getConsent()` always resolves to a boolean

Date: 2026-09-17

## Status

Accepted

## Context

`UcBridge.getConsent()` used to return a boolean from the Usercentrics v2 path
and a promise from the v3 path, and only the v2 path mapped a failure to "no
consent". A rejected v3 `getConsentDetails()` escaped as an unhandled rejection,
because the surrounding `try`/`catch` traps synchronous throws only.

Every call site had grown its own defence — four of them, each subtly different,
each testing whether the value was thenable after having already awaited it.

## Decision

`getConsent()` is `async` and resolves to a boolean on every path. One internal
`try`/`catch` maps any failure, on either API version, to `false`. The
caller-side thenable checks are deleted.

## Consequences

The "no consent on error" contract is enforced in one place instead of four, and
cannot be forgotten by a new caller. A consent gate should fail closed, and this
makes that structural rather than conventional.

The cost is that a caller can no longer distinguish "the CMP said no" from "the
CMP could not be reached". Nothing in the library wanted that distinction, but a
future caller that does will have to reintroduce it deliberately rather than
find it lying around.

The v2 path also gains one microtask tick, since it is now awaited. No caller
depends on it being synchronous.
