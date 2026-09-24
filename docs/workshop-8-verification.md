# Workshop 8 Verification

## Final status: PASS

## HTTP endpoint results

Server started cleanly on port 4000 via `npm run dev` (server directory) after clearing a stale port-4000 socket (`TimeWait`, no active owning process). Verified with a Node `fetch` script (PowerShell quoting avoided):

| Endpoint | Result |
|---|---|
| `POST /api/auth/register` | 201, returns `{ user, accessToken, refreshToken }` |
| `POST /api/auth/login` | 200, returns `{ user, accessToken, refreshToken }` |
| `POST /api/posts` (with `Authorization: Bearer <accessToken>`) | 201, returns created post with `PUBLISHED` status |
| `GET /api/posts?page=1` | 200, returns `{ posts, hasMore, page }` including the created post |

## passwordHash leak check

Both `POST /api/auth/register` and `POST /api/auth/login` JSON responses were checked for the substring `passwordHash`. Not present in either response.

## User persistence after restart

1. Registered a new user (`restart-verify-<timestamp>@example.com`) through `POST /api/auth/register`.
2. Fully stopped the server process (killed the terminal running `npm run dev`; confirmed port 4000 had no listener).
3. Restarted the server with `npm run dev`.
4. Logged in with the same credentials through `POST /api/auth/login`: **200**, same user `id` returned.

Result: **user survived restart**.

## Post persistence after restart

1. Using the access token from the post-restart login, created a post (`POST /api/posts`, title "Restart Persistence Post"): **201**.
2. Fully stopped and restarted the server a second time (confirmed port 4000 cleared between stop and start).
3. Fetched `GET /api/posts?page=1` after the second restart.

Result: the post titled "Restart Persistence Post" was present in the feed response. **Post survived restart**.

Persistence is backed by PostgreSQL via Prisma (`server/src/db/client.js`, `@prisma/adapter-pg`), with migrations already applied to a local `inkwell_dev` database.

## Responsive verification (Playwright-driven browser checks)

### 375px

- No horizontal scrolling (`document.documentElement.scrollWidth > clientWidth` is `false`).
- No cut-off content in navbar, feed, editor, or login views.
- Feed renders all posts.
- Editor (`/write`) renders Title field, Body field, and Publish button; no overflow.
- Login (`/login`) renders Email, Password, and Log In button; no overflow.
- Navigation bar (Inkwell logo, Write, Log In) remains visible and usable, no wrapping/clipping.
- **Publish button height: 44px** (measured bounding box `{ width: 343, height: 44 }`), meeting the 44px minimum tap-target requirement.

### 768px

- No horizontal scrolling.
- Feed renders in the same single-column layout with more horizontal breathing room; navbar spacing increases (`md:px-6`, `md:gap-3` classes take effect). Layout confirmed visually via screenshot.

### 1280px

- No horizontal scrolling.
- Main content area is centered: computed style shows `max-width: 768px` with equal `margin-left`/`margin-right` (248.5px each side at this viewport).
- Navbar spans the full viewport width with the logo/title on the left and Write/Log In links on the right, confirmed visually via screenshot.

## Navbar icon and favicon

- `client/index.html` declares `<link rel="icon" type="image/svg+xml" href="/inkwell-icon.svg" />`.
- `client/src/components/NavBar.jsx` renders `<img src="/inkwell-icon.svg" alt="Inkwell" ... />`.
- Runtime check confirmed both resolve to the identical URL `http://localhost:5173/inkwell-icon.svg`.
- Visually confirmed in the browser: the same ink-well glyph appears in the navbar and in the browser tab.

## Build and check results

| Command | Result |
|---|---|
| `cd client; npm run build` | Passed (`vite build` succeeded, no errors) |
| `cd server; npx prisma generate` | Passed (Prisma Client generated to `node_modules/@prisma/client`) |
| `git diff --check` | Passed (no output, no whitespace errors) |
| `git status` | Clean working-tree listing, no commit made (see below) |

## Final git status

Working tree contains the Workshop 8 implementation changes, not yet committed or pushed, as instructed:

- Modified: `.gitignore`, `client/index.html`, `client/src/App.jsx`, `client/src/components/Feed.jsx`, `client/src/components/LoginForm.jsx`, `client/src/components/NavBar.jsx`, `client/src/components/PostCard.jsx`, `client/src/components/PostEditor.jsx`, `client/src/index.css`, `server/package-lock.json`, `server/package.json`, `server/src/db/client.js`, `server/src/repositories/user.repository.js`, `server/src/routes/post.routes.js`
- Deleted: `docs/implementation-plan.md`, `docs/workshop-3-report.md`, `docs/workshop-6-verification.md`
- Untracked: `client/public/`, `package-lock.json`, `server/.env.example`, `server/prisma.config.ts`, `server/prisma/`

No commit or push was performed as part of this verification pass.
