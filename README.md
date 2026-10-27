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

## Tests (Lectures 12–13)

With Node.js 22 or newer, the service unit tests and HTTP integration tests run from `server/`:

```sh
npm ci
npm test
```

The integration tests use a dedicated local PostgreSQL database named
`inkwell_test`, configured in the ignored `server/.env.test` file. Create that
file with the local connection settings from `server/.env`, changing only the
database name to `inkwell_test`; then create the database and apply the existing
Prisma migrations before running the suite.
The test fixtures refuse to reset any database other than `inkwell_test`.
The development database must remain `inkwell_dev`.

The test script loads `.env.test` and uses Jest's JavaScript entry point instead
of the platform-specific `node_modules/.bin/jest` shim so it also works on
Windows. Unit tests use test doubles; integration tests use real routes,
services, repositories, Prisma, and the isolated database.

From `client/`, run the React component test and production build with:

```sh
npx vitest run
npm run build
```

See the [search test-case table](docs/quality/LECTURE-12-SEARCH-TEST-CASES.md).
