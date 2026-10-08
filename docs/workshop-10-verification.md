For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.

# Workshop 10 verification

## Implementation

- Added `.github/PULL_REQUEST_TEMPLATE.md` with the focused Workshop 10 checklist.
- Declared Node.js `>=22.0.0` in `server/package.json`.
- Added `docs/reviews/2026-lecture-09-tagging-search.md` documenting the Workshop 9 self-review and findings.

## Self-review

- Reviewed the Workshop 9 increment (`5859f91`) against the architecture, design, UX/accessibility, and process-hygiene checklist.
- Found one actionable issue: the supported Node.js version was not declared. Added the required engine constraint.
- Recorded the Workshop 9 commit's missing backlog reference as a process finding; existing history was not rewritten.
- No Workshop 9 architecture regression or secret-management issue was found. The existing `server/src/db/client.js` Prisma import predates Workshop 9 and was left unchanged.

## Verification results

- `node -e "JSON.parse(require('fs').readFileSync('server/package.json', 'utf8'))"` — passed.
- `npm.cmd --prefix server pkg get engines` — returned `>=22.0.0`.
- `npm.cmd --prefix server run` — confirmed no server test, lint, or type-check scripts are defined.
- `node --check` on all 15 files under `server/src` — passed.
- `npm.cmd --prefix client run build` — passed.
- `git diff --check` — passed.

No Workshop 10 Prisma migration was needed. No commit or push was made.
