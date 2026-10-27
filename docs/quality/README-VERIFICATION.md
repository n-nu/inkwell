For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.

# README Verification

## README Verification — Lecture 14

**Verification date:** 2026-10-26

The README was followed from the perspective of a new developer in an isolated
source copy with `.git`, existing `.env` files, and installed dependencies
excluded. The two environment files were created from `.env.example` in that
copy. The existing PostgreSQL service was reused; the development database was
not cleared, and the server suite reset only its dedicated `inkwell_test`
database. The Playwright flow created uniquely named users and posts in the
configured development database.

| Check | Result | Evidence |
|---|---|---|
| Server setup works | PASS | `npm.cmd install`, migration deployment, `npx.cmd prisma generate`, and `npm.cmd test` from `server/`; all 16 Jest/Supertest tests passed. Playwright also started the server from its documented `npm run dev` command. |
| Client setup works | PASS | `npm.cmd install`, `npx.cmd vitest run`, and `npm.cmd run build` from `client/`; component test and production build passed. Playwright started Vite from its configured command. |
| Required environment variables are documented | PASS | README describes `DATABASE_URL`, optional development token secrets, and the separate test database. |
| Setup and test commands run as written | PARTIAL | The documented dependency installation, environment-file copies, migration commands, Prisma Client generation, component/server tests, build, browser installation, and E2E commands were run in the isolated copy. The Docker container creation/start commands were not run because a PostgreSQL service already occupied port 5432. |
| Test commands are documented | PASS | README documents Jest/Supertest, Vitest, production build, and Playwright/axe-core commands. |

### Commands and results

- `npm.cmd install` from the repository root — passed.
- `npm.cmd install` from `server/` — passed; npm reported 11 dependency audit advisories.
- `npm.cmd install` from `client/` — passed; npm reported 7 dependency audit advisories.
- `npx.cmd prisma migrate deploy` for `inkwell_dev` and `inkwell_test` — passed; both databases already had all migrations.
- `npx.cmd prisma generate` from `server/` — passed. The first clean-install server test attempt exposed that generation is required; the documented setup was updated and the tests then passed.
- `npm.cmd test` from `server/` — passed, 3 suites and 16 tests.
- `npx.cmd vitest run` from `client/` — passed, 1 test.
- `npm.cmd run build` from `client/` — passed.
- `npx.cmd playwright install chromium` from the repository root — passed.
- `$env:PLAYWRIGHT_CLIENT_PORT = '5174'; npx.cmd playwright test` from the repository root — passed, 4 tests: the publish flow at mobile, tablet, and desktop, plus the feed accessibility scan.

Port 5173 was occupied by an unrelated running development server, so the E2E
run used port 5174 rather than reusing or stopping that process. The README now
documents this optional override. Automated axe-core checks support but do not
replace manual accessibility review.

### Gaps found and corrected

The original README documented some test commands but omitted complete
new-developer instructions for PostgreSQL, environment setup, starting the
server and client, Prisma Client generation, and running E2E tests. These
instructions were added. PowerShell execution policy also blocked the
`npm`/`npx` PowerShell shims in this environment, so the documented PowerShell
commands use the working `npm.cmd`/`npx.cmd` entry points. The Docker
container-creation command was not rerun because port 5432 was already in use;
all available setup and test paths passed. Automated axe-core checks support,
but do not replace, manual accessibility review.
