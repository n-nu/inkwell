For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.

# Inkwell Defect Log

| ID | Found During | Cause Category | Description | Remediation |
|---|---|---|---|---|
| D-001 | Lecture 10 review | Compatibility | The supported minimum Node.js version was not documented. Although the Workshop 10 handoff associated the requirement with `??=`, the review confirmed the current `EventBus.on()` implementation uses `??`; this defect record does not attribute the issue to `??=`. | Declared Node.js `>=22.0.0` in `server/package.json` under `engines`. |
| D-002 | Lecture 14 accessibility review | Accessibility | The post editor route had no page-level heading, making its primary purpose unclear to users of heading navigation. | Added the visible “Write a new post” `<h1>` to the editor page. |
| D-003 | Lecture 14 axe-core scan | Accessibility | The Inkwell logo image repeated the adjacent “Inkwell” link text in its alternative text. | Marked the redundant logo image as decorative with an empty `alt` attribute. |
| D-004 | Lecture 14 README verification | Documentation | The README omitted the full database, environment, server, client, Prisma Client generation, and E2E setup required by a clean install. | Added PowerShell setup instructions, the required Prisma Client generation step, and all test-suite commands to the README. |
| D-005 | Lecture 15 security review | Security | Authentication endpoints had no rate limit, increasing exposure to credential guessing and repeated registration requests. | Added a shared IP-based limit of five requests per 10-minute window to login and registration, with integration coverage for the 429 response. |
| D-006 | Lecture 15 / Workshop 16 dependency audit | Dependency security | The Lecture 15 production audit reported 13 advisories. Workshop 16 audits found 30 total server advisories before safe fixes; 5 server production-tree advisories remain afterward, including high and critical findings. | Applied compatible `npm audit fix` updates without `--force`; remaining findings are intentionally deferred for broader dependency-version compatibility review and are documented with direct/indirect status in [the OWASP review](../security/OWASP-TOP-10-REVIEW.md). |
| D-007 | Workshop 16 security review | Cryptographic failures | The token service fell back to predictable hardcoded access and refresh secrets when environment values were absent. | Removed the fallbacks and require different environment secrets of at least 32 bytes; local and test values are ignored. |
| D-008 | Workshop 16 security review | Security misconfiguration | Unhandled Express errors had no application-level sanitizer or server-side error logger. | Added centralized error handling that logs unexpected errors and returns generic server-error responses without stack or internal details. |
| D-009 | Workshop 16 security review | Security logging | Failed login attempts returned the expected authentication error but emitted no structured security event. | Added a Pino `auth.login.failed` event with normalized email only; passwords and tokens are excluded. |
