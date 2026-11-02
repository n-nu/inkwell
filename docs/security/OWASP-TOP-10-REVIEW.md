For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.

# OWASP Top 10 Review — Workshop 16

Reviewed: 2026-11-01

This review covers the current Inkwell repository and records the existing
Workshop 15 controls separately from Workshop 16 changes. It is a scoped
application review, not a production penetration test.

| Category | Status in Inkwell | Action / review |
|---|---|---|
| A01 — Broken Access Control | Implemented for post deletion | No delete endpoint existed before this pass. Added authenticated `DELETE /api/posts/:id`; the server loads the post, returns `404 NOT_FOUND` when absent, compares its `authorId` with the authenticated token user, returns `403 FORBIDDEN` for a non-owner, and returns `204` for the owner. Tagged-post deletion cascades. |
| A02 — Cryptographic Failures | Fixed | Passwords use bcrypt. The token service previously had predictable development-secret fallbacks. Removed them; startup now requires different environment-provided access and refresh secrets of at least 32 bytes. Local and test values are ignored and were not committed. |
| A03 — Injection | No new action needed | Database access uses Prisma query APIs. No interpolated raw SQL (`$queryRaw` / `$executeRaw`) was found in server source. |
| A04 — Insecure Design | No new action needed | Reviewed the Workshop 15 [STRIDE threat model](./THREAT-MODEL.md). No additional design-level gap was identified in this scope. |
| A05 — Security Misconfiguration | Fixed | Added one global error handler. Unexpected server errors are logged internally and return a generic `500` response without stack traces or internal details. Known validation and authentication errors retain their public status, code, and message. |
| A06 — Vulnerable and Outdated Components | Partially remediated; residual risk documented | Ran audits for both packages and applied compatible fixes with `npm audit fix` only. Remaining direct/indirect findings and severity are detailed below. Broader upgrades were intentionally deferred for compatibility review; no `--force` update or breaking dependency change was made. |
| A07 — Identification and Authentication Failures | Existing controls verified | Bearer-token verification, current-user lookup, server-derived authorship, and the shared authentication rate limiter were already present. Existing regression tests remain in place. |
| A08 — Software and Data Integrity Failures | Deferred / flagged | Deeper dependency and pipeline-integrity controls are deferred to later lectures, as specified by Workshop 16. |
| A09 — Security Logging and Monitoring Failures | Implemented | Added a shared Pino logger and structured `auth.login.failed` events. Events include normalized email only; passwords and tokens are not logged. |
| A10 — Server-Side Request Forgery | Not currently applicable | No server feature fetches arbitrary user-provided URLs. Revisit if URL-fetching features are introduced. |

## Dependency Audit

Audit totals before safe remediation were:

| Package | Initial `npm audit` | Final `npm audit` | Final `npm audit --omit=dev` |
|---|---:|---:|---:|
| `server/` | 30 (1 low, 21 moderate, 6 high, 2 critical) | 22 (1 low, 19 moderate, 1 high, 1 critical) | 5 (3 moderate, 1 high, 1 critical) |
| `client/` | 7 (3 moderate, 2 high, 2 critical) | 6 (3 moderate, 1 high, 2 critical) | 0 |

The server's earlier Workshop 15 baseline recorded 13 production-tree
advisories. Compatible updates reduced the current production-tree count to 5.
All five are transitive findings: moderate `glob`, `minimatch`, and `rimraf`,
high `@mapbox/node-pre-gyp`, and critical `tar`, in the native `bcrypt` install
dependency chain (`bcrypt` → `@mapbox/node-pre-gyp` → `tar`). The current
`bcrypt` dependency constrains that chain to vulnerable versions; resolving it
requires a dependency change beyond a compatible lockfile fix; that work was
intentionally deferred rather than forced into this workshop.

The remaining server development-tree findings include direct `jest` at
moderate severity and transitive Jest tooling, including low `deepmerge` and
moderate `glob` / `minimatch`. The offered Jest remediation is a major downgrade
to 29.7.0, so it was intentionally deferred for compatibility review.

The client findings are development-only. Direct `vite` has a high-severity
finding and direct `vitest` has a critical-severity finding; transitive
`@vitest/mocker`, `esbuild`, `tinypool`, and `vite-node` advisories remain as
well. The offered remediation requires major upgrades to Vite 8 and Vitest 5,
which were intentionally deferred for compatibility review.

The client production dependency audit is clear. The server production audit
still reports high and critical advisories, so dependency security is not
considered fully remediated.

## Verification Evidence

- Server tests: `npm test` from `server/` — 5 suites, 26 tests passed.
- Client tests: `npx vitest run` from `client/` — 2 files, 2 tests passed.
- End-to-end and accessibility tests: `npx playwright test` — 4 passed.
- Client production build: `npm run build` from `client/` — passed.
- Audit commands: `npm audit`, `npm audit --omit=dev`, and
  `npm audit --audit-level=high` were run for server and client; remaining
  advisories are reported above rather than treated as a pass.
- Test migration applied to the separate `inkwell_test` database. Local
  development configuration remains `inkwell_dev`.
