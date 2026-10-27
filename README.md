For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.

# Inkwell

A Medium-like blog publishing platform built for CS 415/515: Software Design and Development.

## Getting Started

### Prerequisites

- Node.js 22.12 or newer and npm
- Docker Desktop (or Docker Engine) for PostgreSQL

### Start PostgreSQL

Create the development database container once:

```powershell
docker run --name inkwell-postgres `
  -e POSTGRES_USER=inkwell `
  -e POSTGRES_PASSWORD=inkwell `
  -e POSTGRES_DB=inkwell_dev `
  -p 5432:5432 `
  -d postgres:16
```

For later runs, start the existing container instead of creating it again:

```powershell
docker start inkwell-postgres
```

The example credentials are for local development only. If the container uses
different credentials or a different port, update `DATABASE_URL` accordingly.

### Configure and start the server

In a terminal at the repository root:

```powershell
cd server
npm.cmd install
Copy-Item .env.example .env
```

Set `DATABASE_URL` in `.env` to the PostgreSQL development database. The example uses
`postgresql://inkwell:inkwell@localhost:5432/inkwell_dev?schema=public`.
`ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` may be set for local use;
the server otherwise uses development-only defaults. Do not use those defaults
outside local development.

Apply the Prisma migrations and start the API:

```powershell
npx.cmd prisma migrate deploy
npx.cmd prisma generate
npm.cmd run dev
```

The API listens on `http://localhost:4000`.

### Start the client

In another terminal at the repository root:

```powershell
cd client
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173`.

### Tests

Server unit and HTTP integration tests (Jest and Supertest) run from `server/`.
Complete the test database setup below before running the suite.

The integration tests require a separate PostgreSQL database named
`inkwell_test` and an ignored `server/.env.test` file. Copy `.env.example` to
`.env.test` with `Copy-Item .env.example .env.test`, change only the database
name in `DATABASE_URL` to `inkwell_test`, and create the database:

```powershell
Copy-Item .env.example .env.test
docker exec inkwell-postgres createdb -U inkwell inkwell_test
```

Apply the migrations to the test database before running the tests. In
PowerShell, from `server/`, set `DATABASE_URL` to the value in `.env.test` for
the migration command:

```powershell
$env:DATABASE_URL = "postgresql://inkwell:inkwell@localhost:5432/inkwell_test?schema=public"
npx.cmd prisma migrate deploy
Remove-Item Env:DATABASE_URL
```

If the database credentials or port differ, use the corresponding `.env.test`
URL in the PowerShell assignment. The test fixtures refuse to reset any
database other than `inkwell_test`; keep the development database as
`inkwell_dev`.

Generate the Prisma Client and run the server tests from `server/`:

```powershell
npx.cmd prisma generate
npm.cmd test
```

Run React component tests and the production client build from `client/`:

```powershell
npx.cmd vitest run
npm.cmd run build
```

Playwright end-to-end tests run from the repository root. They start the API
and client automatically, and cover the login-to-publish flow at mobile,
tablet, and desktop viewport sizes plus an automated axe-core accessibility
check:

```powershell
npm.cmd install
npx.cmd playwright install chromium
npx.cmd playwright test
```

The client uses port 5173 by default. If that port is already in use, set
`$env:PLAYWRIGHT_CLIENT_PORT = "5174"` in PowerShell before running the tests;
the Playwright config uses that port for its managed Vite server.

The automated accessibility scan supplements, but does not replace, manual
accessibility and UX review.

## Definition of Done

A backlog item is Done when:
- [ ] Code is committed with a descriptive message
- [ ] It runs locally per the relevant lecture's Code Walkthrough
- [ ] It does not break previously-passing verification steps
- [ ] New setup steps are documented here

## Process

Inkwell follows an incremental process: one lecture, one increment.
See docs/BACKLOG.md for the current product backlog.

See the [search test-case table](docs/quality/LECTURE-12-SEARCH-TEST-CASES.md)
and [README verification record](docs/quality/README-VERIFICATION.md).
