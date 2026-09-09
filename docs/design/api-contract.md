# Inkwell API Contract - v1

All application endpoints use the `/api` prefix. The frontend depends on this contract, not on Prisma models or other server implementation details.

## Common response rules

Successful responses use the status and JSON shape specified by each endpoint. Errors always use this shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "A clear explanation"
  }
}
```

The `code` is stable for frontend decisions. The `message` is suitable for display unless an endpoint explicitly requires a generic security message.

Public user objects never contain `passwordHash`, refresh-token hashes, or other persistence-only fields.

## POST /api/auth/register

Registers an unverified account and starts the verification-message workflow.

Authentication: not required.

Request body:

```json
{
  "email": "reader@example.com",
  "displayName": "Reader",
  "password": "strong password"
}
```

Success: `201 Created`

```json
{
  "user": {
    "id": "user-id",
    "email": "reader@example.com",
    "displayName": "Reader",
    "isVerified": false,
    "createdAt": "2026-09-09T12:00:00.000Z"
  },
  "accessToken": "access-token",
  "refreshToken": "refresh-token"
}
```

Errors:

| Status | Code | Message |
|---|---|---|
| 400 | `INVALID_EMAIL` | `Enter a valid email address.` |
| 400 | `WEAK_PASSWORD` | `Password does not meet strength requirements.` |
| 400 | `EMAIL_ALREADY_REGISTERED` | `This email is already registered.` |
| 400 | `INVALID_REQUEST` | `The request is invalid.` |
| 500 | `VERIFICATION_DELIVERY_FAILED` | `We could not send the verification message. Please try again later.` |

The database's unique email constraint remains a second protection against duplicate registration races. Verification delivery failure leaves the account unverified so the user can request another message later.

## POST /api/auth/login

Authenticates a verified user and issues an access-token/refresh-token pair.

Authentication: not required.

Request body:

```json
{
  "email": "reader@example.com",
  "password": "strong password"
}
```

Success: `200 OK`

```json
{
  "user": {
    "id": "user-id",
    "email": "reader@example.com",
    "displayName": "Reader",
    "isVerified": true,
    "createdAt": "2026-09-09T12:00:00.000Z"
  },
  "accessToken": "access-token",
  "refreshToken": "refresh-token"
}
```

Errors:

| Status | Code | Message |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | `Invalid email or password.` |
| 403 | `EMAIL_NOT_VERIFIED` | `Please verify your email before logging in.` |
| 500 | `AUTHENTICATION_FAILED` | `We could not complete the login request.` |

A missing user and a wrong password both return `INVALID_CREDENTIALS`; the response must not reveal which value was incorrect or whether the email exists. If refresh-token issuance fails, the server must not issue an access token.

## GET /api/posts?page=n

Returns a public page of published posts.

Authentication: not required.

Query parameters:

- `page`: optional positive integer; defaults to `1`.
- The server uses a fixed page size defined by the service configuration.

Success: `200 OK`

```json
{
  "posts": [
    {
      "id": "post-id",
      "authorId": "user-id",
      "title": "A published post",
      "body": "Plain-text post body.",
      "publishedAt": "2026-09-09T12:00:00.000Z",
      "createdAt": "2026-09-09T11:55:00.000Z"
    }
  ],
  "page": 1,
  "hasMore": false
}
```

Rules:

- Return `PUBLISHED` posts only.
- Order by `publishedAt` newest first, with a deterministic tie-breaker.
- Return an explicit empty `posts` array when no posts exist.
- Return an empty page with `200 OK` when `page` is beyond the available data.

Errors:

| Status | Code | Message |
|---|---|---|
| 400 | `INVALID_PAGE` | `Page must be a positive integer.` |

## POST /api/posts/:id/comments

Creates a comment on a published post. This endpoint is documented now as requested by Workshop 4 and is implemented in the later US-05 increment.

Authentication: required. The access token identifies the comment author.

Request body:

```json
{
  "body": "This is a thoughtful comment."
}
```

Success: `201 Created`

```json
{
  "comment": {
    "id": "comment-id",
    "postId": "post-id",
    "authorId": "user-id",
    "body": "This is a thoughtful comment.",
    "createdAt": "2026-09-09T12:05:00.000Z"
  }
}
```

Rules:

- The caller must be authenticated.
- The referenced post must exist and have status `PUBLISHED`.
- The comment body must be non-empty after trimming and must satisfy the configured maximum length.

Errors:

| Status | Code | Message |
|---|---|---|
| 400 | `INVALID_COMMENT` | `Comment text cannot be empty.` |
| 401 | `UNAUTHENTICATED` | `Authentication is required.` |
| 404 | `POST_NOT_FOUND` | `The requested post was not found.` |
| 409 | `POST_NOT_COMMENTABLE` | `Comments are not available for this post.` |

## Contract decisions to preserve

- Keep resource URLs consistent and use HTTP methods for actions.
- Keep errors machine-readable through stable codes and user-readable through messages.
- Do not expose database field names or persistence-only values when they are not part of this public contract.
- Breaking response changes require a versioned API such as `/api/v2/...`.
