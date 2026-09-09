# Inkwell Workshop 4 Implementation Plan

For this assignment's preparation, Emil Estrada has utilized GitHub Copilot, a language model created by GitHub & OpenAI . Within this assignment, the GitHub Copilot was used for purposes including: Plan writeup/formalization.
## Purpose

This plan translates Workshop 4 into a project-specific sequence for Inkwell. The repository is currently a Lecture 1 scaffold: the server exposes only health/version endpoints, the client is a placeholder, and the requirements are documented but not implemented.

Workshop 4 is a design increment. Its first deliverable is a consistent design for US-01, US-02, and US-04, not production routing or database code. The later implementation phases below use those design decisions as the contract.

## Scope and constraints

- US-01: Register Account
- US-02: Log In
- US-04: Browse Feed
- Design the Publish Post boundary needed by the feed, but defer detailed editor/component design to the later workshop specified by the assignment.
- Add the API contract for `POST /api/posts/:id/comments` as the requested follow-up artifact. This documents US-05 and does not require implementing comments in this increment.
- Use REST resources under `/api`.
- Use one error response shape everywhere:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "A clear explanation"
  }
}
```

- Routes/controllers handle HTTP only, services own business rules, and repositories are the only modules that access Prisma/PostgreSQL.
- Do not create a Prisma migration or production authentication flow as part of the Workshop 4 design-only increment.

## Phase 1: Establish the Workshop 4 design artifacts

Create `docs/design/` with these three documents:

### `docs/design/design-classes.md`

Define implementable design classes and their responsibilities.

- `User`
  - `id: string`
  - `email: string` and unique
  - `displayName: string`
  - `passwordHash: string`
  - `isVerified: boolean`
  - `createdAt: DateTime`
- `Post`
  - `id: string`
  - `authorId: string`
  - `title: string`
  - `body: string`
  - `status: PostStatus`, limited to `DRAFT` or `PUBLISHED`
  - `publishedAt: DateTime | null`
  - `createdAt: DateTime`
- `PostStatus` is a fixed enum, not free text.
- `User 1 -> many Post`; store `authorId` directly on each post because each post has exactly one author.
- Keep password hashing and verification in `AuthService`, not in `User`.
- Include `RefreshToken` in the design because US-02 requires refresh-token persistence and secure rotation/storage.
- Record that a future `Comment` design must reference its post and author before US-05 implementation begins. The comment API contract is added in Phase 2.

### `docs/design/api-contract.md`

Document the client/server boundary for the required use cases:

| Endpoint | Method | Request | Success |
|---|---|---|---|
| `/api/auth/register` | POST | `email`, `displayName`, `password` | `201 { user, accessToken, refreshToken }` |
| `/api/auth/login` | POST | `email`, `password` | `200 { user, accessToken, refreshToken }` |
| `/api/posts?page=n` | GET | `page` query parameter | `200 { posts, page, hasMore }` |

For every endpoint, define validation, authentication requirements, public response fields, status codes, and error codes. In particular:

- Registration rejects invalid email, weak password, and duplicate email according to the use cases.
- Login always uses `INVALID_CREDENTIALS` with `Invalid email or password.` for failed credentials; do not reveal whether an email exists.
- Login rejects unverified accounts and provides the planned verification-message resend path.
- A login response must not contain an access token if refresh-token issuance fails.
- Feed access is public, returns published posts only, orders newest first, uses a fixed page size, and returns an empty page beyond the end.
- Never expose `passwordHash`, token hashes, or other persistence-only fields.

Add the requested US-05 contract using the same format:

- `POST /api/posts/:id/comments`
- Define whether authentication is required, the request body (`body` or the selected comment text field), and the success response.
- Define errors for malformed/empty comment text, unauthenticated callers, and a missing post using the standard `{ error: { code, message } }` shape.
- State whether comments can be created only on published posts. Choose one rule and keep it consistent with the eventual `Comment` design.

### `docs/design/module-structure.md`

Document the dependency direction and responsibilities:

- Routes/controllers receive requests, call services, and serialize responses.
- `AuthService` hashes/verifies passwords and issues tokens.
- `PostService` applies post ownership and draft/published rules and coordinates post reads.
- `UserRepository` and `PostRepository` are the only modules that access Prisma/PostgreSQL.
- A future `CommentService`/`CommentRepository` should follow the same separation when US-05 is implemented.
- Dependency flow is `Routes -> Services -> Repositories -> PostgreSQL`.
- Modules exchange simple data objects and do not depend on each other's internals.

## Phase 2: Review and verify the design increment

Before writing runtime code:

1. Cross-check all three design documents against `docs/requirements/use-cases.md` and `docs/requirements/analysis-model.md`.
2. Update the analysis model where needed:
   - Add `authorId` to the post relationship/model.
   - Represent fixed post states `DRAFT` and `PUBLISHED`.
   - Add the auth and feed interaction boundaries.
   - Review the watch-list concern before adding comment relationships.
3. Confirm every API endpoint has a matching use case, response shape, status code, and error format.
4. Confirm the design never places Prisma/database access in a route.
5. Commit the design increment with a message such as:

```text
docs: design classes, API contract, and module structure for US-01/US-02/US-04
```

The Workshop 4 deliverable is complete at this point. The next phases are implementation work built from the approved contract.

## Phase 3: Add the persistence foundation

Implement this after the design review and the architecture workshop that follows Workshop 4.

1. Add Prisma and PostgreSQL configuration under `server/`.
2. Convert the design sketch into an executable schema.
3. Add `User`, `RefreshToken`, and `Post` models.
4. Add the `PostStatus` enum with only `DRAFT` and `PUBLISHED`.
5. Add the unique constraint on `User.email` and the required `Post.authorId` relation.
6. Add migrations and a documented local database setup.
7. Keep token persistence secure by storing token hashes rather than raw refresh tokens.

Cheap verification: run the Prisma schema validation/migration check before adding routes.

## Phase 4: Implement US-04 feed first

The feed is public and provides the simplest end-to-end vertical slice.

1. Implement `PostRepository.getPublishedPage(page, pageSize)`.
2. Filter to `PUBLISHED`, order by `publishedAt` descending, and use deterministic pagination.
3. Implement `PostService.getPublishedFeed(page)` with page validation and a fixed page size.
4. Add `GET /api/posts?page=n` under the `/api` prefix.
5. Return `{ posts, page, hasMore }` and the standard errors for invalid page input.
6. Add the client API call and replace the placeholder view with a feed that has an explicit empty state.

Tests must cover newest-first ordering, draft exclusion, first/next pages, no posts, and a page beyond the available data.

## Phase 5: Implement US-01 registration

1. Add request parsing and validation at the route boundary.
2. Add `AuthService` password hashing using a maintained password-hashing library.
3. Add `UserRepository.findByEmail` and `create`.
4. Handle the database unique-email failure as a registration error as well as performing the normal duplicate check; this protects against races.
5. Create users as unverified and initiate the verification-message workflow.
6. Return only the public user representation and the token pair defined in the contract. Do not return `passwordHash`.
7. Add client registration form, loading state, field errors, and API error handling.

Tests must cover valid registration, invalid email, weak password, duplicate/racing registration, secure password storage, and verification-message delivery failure leaving the account unverified.

## Phase 6: Implement US-02 login and session handling

1. Add `UserRepository.findByEmail` and refresh-token persistence operations.
2. Add `AuthService.verifyPassword` and generic invalid-credential handling.
3. Reject unverified users through a non-leaking, contract-defined error path.
4. Issue the refresh token first/persist its hash, then issue the access token only after refresh-token creation succeeds.
5. Add authenticated-request middleware for later post/comment routes.
6. Define client storage according to the security decision in the architecture work; do not put refresh tokens in ordinary local storage unless the approved design explicitly accepts that tradeoff.
7. Add client login, session restoration/refresh, logout, and failure states.

Tests must cover valid login, wrong email/password without account enumeration, unverified accounts, refresh-token persistence, token expiry/refresh, and the no-partial-authentication failure case.

## Phase 7: Implement comments from the contract

Implement US-05 only after the comment model and endpoint contract are reviewed together.

1. Add the `Comment` design class and database relation.
2. Add `CommentRepository` and `CommentService` following the module boundaries.
3. Implement `POST /api/posts/:id/comments` exactly as documented.
4. Enforce authentication and comment validation.
5. Handle missing or non-commentable posts with the documented errors.
6. Add client integration and focused route/service tests.

This phase must not change the already-approved register, login, or feed response shapes without a versioned API decision.

## Verification and Definition of Done

For each phase:

- Run the relevant server/client tests and preserve all earlier passing checks.
- Run a server startup smoke check and verify `GET /api/health` and `GET /api/version` remain available.
- Run `npm run build` in `client/` after client changes.
- Document new setup commands in `README.md`.
- Update `docs/BACKLOG.md` only when the corresponding behavior is genuinely complete.
- Commit each coherent increment with a descriptive message and push it according to the course workflow.

Recommended commit sequence:

1. `docs: add Workshop 4 design artifacts`
2. `docs: add comment endpoint API contract`
3. `feat: add Prisma persistence foundation`
4. `feat: implement public paginated feed`
5. `feat: implement account registration`
6. `feat: implement secure login and sessions`
7. `feat: implement post comments`
