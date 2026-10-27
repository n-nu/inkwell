For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.

# Inkwell SQA Plan — v1

## Standards

Code changes follow the existing [pull request checklist](../../.github/PULL_REQUEST_TEMPLATE.md). Architecture conformance follows [ADR-001](../architecture/adr-001-modular.monolith.md), and API behavior follows the project's [API contract](../design/api-contract.md). This plan connects those standards without duplicating their contents.

## Reviews

The project follows the review process established in Workshop 10. The author performs a self-review against the pull request checklist. Peer review takes place before merge where applicable. Review findings and their resolutions are recorded in [docs/reviews/](../reviews/).

## Testing

The project uses incremental automated verification; comprehensive end-to-end coverage is not yet established.

- Unit tests: Services and Repositories (Jest) — ACTIVE (Lecture 12). Current coverage tests `AuthService.register()`, `PostService.publish()`, and `PostService.search()` with repository, token, event, and search-strategy test doubles; repository unit tests remain future work.
- Integration tests: Routes → Services → Repositories, real isolated PostgreSQL test DB (Supertest) — ACTIVE (Lecture 13). Covers registration, publishing/browsing, duplicate registration, and registration/login.
- Component tests: React components (React Testing Library + Vitest) — ACTIVE (Lecture 13). Covers failed post publishing in `PostEditor`.
- End-to-end tests: critical user flows (Playwright) — planned starting Lecture 14.

Run `npm test` from `server/`; it loads `server/.env.test` and requires the isolated `inkwell_test` database with migrations applied. The reset fixture refuses to delete records unless `DATABASE_URL` names `inkwell_test`. Run `npx vitest run` from `client/` for component tests. See the [Lecture 12 search test cases](LECTURE-12-SEARCH-TEST-CASES.md) for the search test design.

## Defect Tracking

Defects discovered through code review, testing, or manual use are recorded in the [Defect Log](DEFECT-LOG.md). Each entry records the cause category, discovery stage, description, and remediation.

## Metrics Tracked

- Defects per lecture or increment
- Defect distribution by cause category
- Review turnaround, tracked qualitatively at the project's current scale

These measures support the course project's incremental quality process; they do not establish production reliability.

## Ownership

Me

## Metrics Snapshot

Snapshot date: 2026-10-07

| Measure | Value | Counting rule |
|---|---:|---|
| Git commits | 13 | Output of `git rev-list --count HEAD`; counts commits reachable from HEAD and excludes uncommitted changes. |
| Logged defects | 1 | Count of actual `D-###` entries in [DEFECT-LOG.md](DEFECT-LOG.md), excluding the table header and explanatory text. |
| Backlog items at Requirements Defined or later | 0 | Count backlog rows whose explicit Status is `Requirements Defined` or a later workflow stage. All nine current rows have Status `Backlog`, so none qualify. |
