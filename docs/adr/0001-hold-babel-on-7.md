# 1. Hold Babel on 7.x

Date: 2026-09-17 (recording a decision first made in `renovate.json`)

## Status

Accepted

## Context

Renovate offered `@babel/core` and `@babel/preset-env` 8.x. The build runs Babel
through `@rollup/plugin-babel`, whose latest published version is 7.1.0 — there
is no 8.x line — and whose peer dependency is `@babel/core: ^7.0.0`. That peer is
not marked optional in `peerDependenciesMeta`.

Taking Babel 8 therefore breaks peer resolution, which in turn breaks the npm
audit step in CI, and puts the legacy (IE11) bundle on an untested combination.

## Decision

Pin `@babel/core` and `@babel/preset-env` below 8 with a `packageRules` entry in
`renovate.json` carrying the reason inline, so the constraint is not mistaken
for staleness.

## Consequences

The project stays on a Babel major that will eventually stop receiving fixes,
and every dependency sweep has to re-check whether the reason still holds rather
than assume it.

The condition for lifting this is narrow and checkable: a release of
`@rollup/plugin-babel` that peer-accepts `@babel/core` 8. Until then, a sweep
should confirm the peer range from the registry rather than from memory.

Re-checked 2026-09-17: `@rollup/plugin-babel` is still at 7.1.0, still peers
`@babel/core: ^7.0.0`, still non-optional. The hold stands.
