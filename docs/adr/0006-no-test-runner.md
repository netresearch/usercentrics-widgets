# 6. No test runner

Date: 2026-09-17 (recording the existing state, not a new decision)

## Status

Accepted — recorded so it is a decision rather than an omission

## Context

The repository has no test framework. `bun test` is a placeholder that exits
with an error, and CI passes `enable-test: false`. Every gate that runs is
static: ESLint, the build, an npm audit, CodeQL and dependency review.

This is recorded because the absence reads as neglect, and because the
consequences below are load-bearing for anyone changing this code.

## Decision

Leave it as it is for now. Do not add a runner as a side effect of an unrelated
change.

## Consequences

Nothing guards behaviour. Several properties that are easy to break and silent
when broken are unprotected: the `type`-then-`src` ordering on script embeds
(ADR 4), the "no consent on error" contract (ADR 2), the consent reader (ADR 3),
and the double-activation guards.

In place of tests, changes to those paths have been verified with throwaway
probes run under `bun` with `happy-dom`, executed against both the old and the
new tree and compared. That is reproducible by whoever runs it and by nobody
afterwards, which is the actual cost of this decision: the evidence lives in
pull request descriptions rather than in the repository.

Adding a runner is worthwhile and is a change of its own. The useful first step
is not coverage but the handful of characterisation tests for the properties
listed above, since those are the ones where a regression is invisible until a
consent gate has already failed.
