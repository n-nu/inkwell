For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.

# OWASP Top 10 Review — Workshop 16

Reviewed: 2026-11-01

Dependency audit updated: 2026-11-10 (Workshop 18, UTC)

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

At the time of the Workshop 16 review, the server's earlier Workshop 15
baseline recorded 13 production-tree advisories. Compatible updates reduced
that production-tree count to 5. All five were transitive findings: moderate
`glob`, `minimatch`, and `rimraf`, high `@mapbox/node-pre-gyp`, and critical
`tar`, in the native `bcrypt` install dependency chain
(`bcrypt` → `@mapbox/node-pre-gyp` → `tar`).

The Workshop 16 server development-tree findings included direct `jest` at
moderate severity and transitive Jest tooling, including low `deepmerge` and
moderate `glob` / `minimatch`. The offered Jest remediation was a major
downgrade to 29.7.0, so it was intentionally deferred for compatibility review.

The client findings are development-only. Direct `vite` has a high-severity
finding and direct `vitest` has a critical-severity finding; transitive
`@vitest/mocker`, `esbuild`, `tinypool`, and `vite-node` advisories remain as
well. The offered remediation requires major upgrades to Vite 8 and Vitest 5,
which were intentionally deferred for compatibility review.

At the end of Workshop 16, the client production audit was clear, but the
server production audit still reported high and critical advisories.
The Workshop 18 reassessment below supersedes that server audit status.

## Workshop 18 Audit Rerun

The original GitHub Actions audit for PR #1 failed with 22 findings: 1 low,
18 moderate, 2 high, and 1 critical. A clean Node 22 audit using only the
server manifests reproduced that result. The earlier installed-tree audit
reported 21 findings because it did not include direct `bcrypt` as an
additional high finding. The extra high finding was **not** `deepmerge`;
that advisory is low severity.

The blocking production path was direct `bcrypt@5.1.1` (high) through
`@mapbox/node-pre-gyp@1.0.11` (high) to `tar@6.2.1` (critical). The tar
advisories cover archive path traversal, file overwrite, and denial of service.
This is a native-binary installation dependency chain, not an archive parser
called by an Inkwell HTTP route; the audit does not establish remote
exploitability through the running API. The affected dependencies were still
included in the production image, so the findings were not dismissed.

No compatible bcrypt 5 update removed this chain. After explicit approval,
upgraded only bcrypt to 6.0.0, whose prebuildify/node-gyp-build strategy removes
node-pre-gyp and tar and supports Node 22. Prisma and Jest versions were not
changed, and no `npm audit fix --force` or transitive major-version override
was used. The lockfile removes the obsolete installer subtree. Verified a
known bcrypt 5.1.1 hash with bcrypt 6 on both Windows and Node 22 Alpine,
including rejection of an incorrect password.

| Audit scope | Before (clean Node 22 manifests) | After bcrypt 6 |
|---|---|---|
| All server dependencies | 22: 1 low, 18 moderate, 2 high, 1 critical | 19: 1 low, 18 moderate; no high/critical |
| Production subtree | bcrypt/node-pre-gyp/tar chain above | 0 findings |
| `npm audit --audit-level=high` | Failed | Passed (exit 0) |

All remaining findings are in the development-only Jest subtree. The core
advisories and their dependency paths are:

| Severity | Affected package / path | Advisory |
|---|---|---|
| Low | `jest` -> `jest-config` -> `deepmerge@4.3.1` | [Prototype poisoning of merged objects](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) |
| Moderate | Jest reporters/config/runtime and Istanbul's `test-exclude` -> `glob@13.0.6` / `glob@10.5.0` | [Traversal after AbortSignal cancellation](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) |
| Moderate | The same tooling -> `minimatch@10.2.6` / `minimatch@9.0.9` | [Globparts amplification denial of service](https://github.com/advisories/GHSA-g3hv-75wg-m249) |

The 19 audit entries include affected parent packages, not 19 independent
root advisories. `npm audit fix --dry-run` offers compatible glob patch and
deduplication changes but leaves all 19 findings. The offered full remediation
is a major Jest downgrade to 29.7.0; patched glob/minimatch majors are outside
the current transitive ranges, and the latest deepmerge 4 release remains
affected. Those broader tooling changes are deferred rather than weakening
the high-severity audit threshold. The production image omits Jest and these
development dependencies.

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

### Workshop 18 Reverification

- `npm.cmd test` from `server/`: 5 suites, 28 tests passed, including two new
  authentication checks against a hash generated by bcrypt 5.1.1.
- `npx.cmd vitest run` from `client/`: 2 files, 2 tests passed.
- `npx.cmd playwright test publish-flow.spec.js`: 3 passed.
- `npx.cmd playwright test`: 4 passed using `inkwell_test`, not the persistent
  Compose database. The publishing locator is scoped to Main navigation and
  matches the exact Write link; both legitimate links remain in the UI.
- `npm.cmd run build` from `client/`: passed.
- `npm.cmd audit --audit-level=high` and
  `npm.cmd audit --omit=dev --audit-level=high` from `server/`: passed.
  The clean Node 22 manifest-only audit also passed with 19 low/moderate
  development findings.
- `docker build -t inkwell-server:latest .\server`: passed; bcrypt 6 loads and
  hashes/compares correctly as the non-root user on Alpine. Nested test
  directories and environment secrets are excluded from the image.
- Missing `DATABASE_URL`: exit 2 before Express starts. Unreachable database:
  exit 1 after 10 migration attempts, without starting Express.
- `docker compose config --quiet`: passed without displaying resolved secrets.
- `docker compose up --build -d`: PostgreSQL healthy, all 3 migrations applied,
  API health HTTP 200, registration HTTP 201. After ordinary container
  recreation, the same user logged in successfully (HTTP 200), existing user
  counts were preserved, and migration deployment reported no pending changes.
- `docker compose down`: passed without removing the persistent named volume.
- `git diff --check`: passed.
