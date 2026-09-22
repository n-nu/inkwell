# Workshop 7 Verification

## Implementation completed

- Added a temporary in-memory persistence client at `server/src/db/client.js` with the repository operations required by the current server.
- Added React Router routes for `/`, `/write`, and `/login`, with a shared navigation bar.
- Added minimal access-token storage in `client/src/lib/auth.js`.
- Added login, feed, and post-card components.
- Refined `PostEditor` to use React Router, accessible error associations, and the stored bearer token.
- Added Tailwind CSS through the Vite plugin while preserving the `/api` proxy.
- Preserved the Workshop 7 limitation that the server does not verify bearer tokens or derive post ownership from them.

## Build results

| Command | Result |
|---|---|
| `cd client; npm.cmd install` | Passed |
| `cd server; npm.cmd install` | Passed |
| `cd client; npm.cmd run build` | Passed |
| `node --check` for server JavaScript files | Passed |
| Workspace diagnostics for changed source files | No errors |
| `git diff --check` | Passed |

## Runtime results

The server started successfully on port 4000. An API smoke test passed:

- Registration with `email`, `displayName`, and password.
- Login with the registered credentials.
- Empty feed retrieval with `GET /api/posts?page=1`.
- Post creation with the login access token in the `Authorization` header.
- Final feed retrieval containing the created post.

The client Vite server started on port 5173. The Vite proxy successfully served the feed request after the API server was running.

## Accessibility verification

The login and editor use real forms, associated labels, keyboard-submit-capable controls, `role="alert"` error regions, and disabled submit buttons during requests. Browser inspection confirmed reachable navigation links, login fields, and editor fields/buttons. A full automated accessibility audit was not added, consistent with the workshop scope.

## Secret-leak fix

`passwordHash` was the sensitive field at risk in the persistence-layer user object. The register and login responses from `POST /api/auth/register` and `POST /api/auth/login` use the existing `AuthService.toPublicUser` representation, which removes `passwordHash` while preserving `{ user, accessToken, refreshToken }`. The API smoke test asserted that both auth user objects omit `passwordHash`.

## Known limitations

- The temporary database is process-local and loses data when the server stops.
- `POST /api/posts` accepts the bearer header but does not verify it or derive the author's identity from it. Server-side authorization belongs to a later course increment.
- There is no post-detail route, logout workflow, refresh-token management, or automated accessibility tooling in this workshop.
