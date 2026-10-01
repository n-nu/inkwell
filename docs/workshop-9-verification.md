# Workshop 9 verification

## Implementation

- Added the Workshop 9 backlog items for tagging and search to the backlog.
- Extended the Prisma schema with a many-to-many `Post` ↔ `Tag` relationship using an explicit `PostTag` join model.
- Added tagging support to post publication through `PostRepository.createWithTags()` and `PostService.publish({ tagNames = [] })`.
- Added the minimal `SubstringSearchStrategy` and wired `PostService.search()` through it.
- Extended `GET /api/posts` to accept an optional `search` parameter while preserving the normal feed behavior.
- Added a lightweight in-process `EventBus` and registered the logging listener as well as the published-post counter listener.
- Added `GET /api/stats` to expose the in-memory published-post count.
- Refactored the bcrypt cost factor into `BCRYPT_COST_FACTOR` and kept `MIN_PASSWORD_LENGTH` in place.

## Migration

- Ran: `cd server && npx prisma migrate dev --name add_tags`
- Ran: `cd server && npx prisma generate`
- Result: both commands completed successfully.
- New migration folder: `server/prisma/migrations/20261001002638_add_tags/`
- The resulting schema includes the `Tag` table, `PostTag` table, unique `Tag.name`, and the composite primary key on `PostTag(postId, tagId)`.

## Tag verification

- Verified registration and publish requests through the real HTTP API.
- Published a post with `tagNames: ["design", "architecture"]`.
- Returned post included both tags and the join rows were created successfully.
- Publishing a second post with the existing `design` tag reused the same tag instead of creating a duplicate tag record.

## Search verification

- Verified `GET /api/posts?search=modularity&page=1` returned matching posts.
- Search matches were case-insensitive and title/body matching worked as implemented.
- The normal feed remained available at `GET /api/posts?page=1` without a `search` parameter.
- The current Workshop 9 implementation uses a simple title/body substring search strategy; tag search is not expanded beyond the demonstrated repository implementation.

## Event verification

- Verified the `post.published` event fired after successful publish.
- The logging listener emitted output equivalent to `[event] post.published:` and included the payload fields `postId`, `authorId`, `title`, and `tags`.
- The stats listener increments a count in memory only when the event fires.

## Stats verification

- Fresh server start: `/api/stats` returned `0`.
- After first valid publish: `/api/stats` returned `1`.
- After second valid publish: `/api/stats` returned `2`.
- After a server restart: `/api/stats` again returned `0`.
- The counter is intentionally process-local and not persisted to PostgreSQL.

## Security regression

- Registered a new user through `POST /api/auth/register`.
- Returned user payload did not include `passwordHash`.
- Logged in successfully through `POST /api/auth/login`.
- The bcrypt cost factor is now a named constant, but hashing behavior remains otherwise unchanged.

## Build and check results

- `cd server && npm install` — succeeded.
- `cd client && npm install` — succeeded.
- `cd client && npm run build` — succeeded.
- `cd repo-root && git diff --check` — no diff-check errors reported.

## Known limitations

- Search is intentionally limited to substring matching on post `title` and `body` as shown in the Workshop 9 implementation.
- The repository still uses the existing explicit authenticated-user flow; no future authorization middleware was invented to reconcile the PDF example with the current codebase.
- No client-side UI for tag management or search was added because the workshop requirements remain server-side and incremental.
