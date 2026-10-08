For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.

# Inkwell SQA Plan — v1

## Standards

Code changes follow the existing [pull request checklist](../../.github/PULL_REQUEST_TEMPLATE.md). Architecture conformance follows [ADR-001](../architecture/adr-001-modular.monolith.md), and API behavior follows the project's [API contract](../design/api-contract.md). This plan connects those standards without duplicating their contents.

## Reviews

The project follows the review process established in Workshop 10. The author performs a self-review against the pull request checklist. Peer review takes place before merge where applicable. Review findings and their resolutions are recorded in [docs/reviews/](../reviews/).

## Testing

The project currently uses incremental, manual verification; comprehensive systematic test coverage is not yet established. The planned testing progression is:

- Unit tests for Services and Repositories — Lecture 12
- Integration tests for Routes — Lecture 13
- End-to-end tests for critical user flows — Lecture 14

These are planned practices, not claims about tests that already exist.

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
