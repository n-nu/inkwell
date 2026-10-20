# Inkwell

A Medium-like blog publishing platform built for CS 415/515: Software Design and Development.

## Definition of Done

A backlog item is Done when:
- [ ] Code is committed with a descriptive message
- [ ] It runs locally per the relevant lecture's Code Walkthrough
- [ ] It does not break previously-passing verification steps
- [ ] New setup steps are documented here

## Process

Inkwell follows an incremental process: one lecture, one increment.
See docs/BACKLOG.md for the current product backlog.

## Unit tests (Lecture 12)

With Node.js 22 or newer, run from `server/`:

```sh
npm ci
npm test
```

Jest runs the ES-module service tests with `--experimental-vm-modules`. The test
script uses Jest's JavaScript entry point instead of the platform-specific
`node_modules/.bin/jest` shim so it also works on Windows.

The tests use doubles for repositories, token issuance, the event bus, and the
search strategy. PostgreSQL, Docker, and `.env` credentials are not required.
See the [search test-case table](docs/quality/LECTURE-12-SEARCH-TEST-CASES.md).
