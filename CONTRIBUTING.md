# Contributing

Thanks for taking the time. This is a small library with a specific job, so the notes below are mostly about the constraints that are not visible from the code.

## Getting set up

```bash
bun install
bun run build     # writes dist/ — it is gitignored, not committed
bun run lint
bun run watch     # dev build, keeps console.* in the output
```

Node 24 is what CI uses. `bun` is the package manager; do not add a second lockfile.

## There is no test suite

`bun run test` is a placeholder script that exits with an error, and CI runs no tests. This is deliberate for now and recorded in [ADR 6](docs/adr/0006-no-test-runner.md), which also lists the properties that are unprotected as a result.

That puts the burden on the change itself. If you touch activation, consent reading, or the order in which a script's `type` and `src` are set, say in the pull request how you established that it works — and prefer something reproducible over "tested locally". Building a throwaway probe against both the old and the new tree and comparing is the pattern used so far.

## What the gates actually are

CI runs ESLint, the build, an npm audit at `high`, CodeQL and a dependency review. `bun run lint` and `bun run build` are the two you can run yourself; both must exit 0.

`dist/` is excluded from linting, so building before linting is safe.

## Commits and merges

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, and so on.
- The repository is **rebase-only** — merge commits and squash are disabled. A rebase merge rewrites commits, so a signature made on your branch does not survive onto `main`.
- Sign your commits if you can. It is convention here, not enforcement.

## Decisions

Anything that a future reader would otherwise re-litigate belongs in `docs/adr/`. That includes decisions *not* to do something — several existing records exist precisely to explain why an obvious-looking change was rejected.

If you are about to remove a constraint that looks stale — a pinned version, a `packageRules` entry, a guard — read the commit that introduced it first. Most of them state their reason inline.

## Reporting a vulnerability

Not here. See [SECURITY.md](SECURITY.md).
