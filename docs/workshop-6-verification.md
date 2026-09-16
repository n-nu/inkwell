# Workshop 6 Verification

## Verification performed

- Ran `npm.cmd install` in `server`.
- Ran `npm.cmd install` in `client`.
- Ran `npm.cmd run build` in `client`.
- Ran `node --check` against all server JavaScript files.
- Ran `git diff --check`.
- Ran `node src/index.js` in `server`.
- Ran workspace diagnostics against the new server and client source files.
- No API curl requests were run because the server could not load its persistence dependency.

## Results

- Server dependencies installed successfully.
- Client dependencies installed successfully.
- Client production build completed successfully with Vite.
- Diagnostics reported no errors in the Workshop 6 source files.
- Server startup was blocked before it could listen.

## Curl results

| Endpoint | Result | Reason |
|---|---|---|
| `POST /api/auth/register` | BLOCKED | Server startup fails because `server/src/db/client.js` is missing. |
| Duplicate registration | BLOCKED | Server startup fails because `server/src/db/client.js` is missing. |
| `POST /api/posts` | BLOCKED | Server startup fails because `server/src/db/client.js` is missing. |
| `GET /api/posts?page=1` | BLOCKED | Server startup fails because `server/src/db/client.js` is missing. |

## Cause and follow-up

The new repositories intentionally import `../db/client.js`, preserving the repository-to-persistence boundary documented by the project. Prisma setup, the schema, generated client, database configuration, and `server/src/db/client.js` must be introduced before repository-dependent routes can execute. No future-course persistence implementation was added to Workshop 6.

## Assignment status

Workshop 6 validation, token, service, repository, route, server-wiring, and React editor layers are present. Runtime API verification remains blocked by the missing persistence prerequisite. No commit or push was performed.