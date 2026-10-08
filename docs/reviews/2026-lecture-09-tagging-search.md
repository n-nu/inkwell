For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.

# Review: Tagging, Strategy Search, Observer Publish Event

**Reviewed increment:** Workshop 9 (`5859f91`)
**Reviewer prep and review time:** 60 minutes
**Defects found:** 1 (missing Node.js engine constraint)
**Additional process finding:** Workshop 9 commit message does not reference US-08 or US-09
**Outcome:** Accept with minor follow-up

## Findings

1. `server/package.json` did not declare the supported Node.js version. The Workshop 10 handoff attributes this requirement to `??=` in `EventBus.on()`, but the reviewed implementation currently uses `??`. The missing runtime declaration was still addressed as required by Workshop 10 with Node.js `>=22.0.0`.
2. Commit `5859f91` is descriptive but does not reference the related backlog items. Existing history was not rewritten; future commits should follow the checklist.

## Review

- Workshop 9 route handlers pass HTTP input to services and translate results/errors; `/api/stats` is a trivial read-only counter endpoint.
- Workshop 9 added no direct `@prisma/client` imports outside the repository layer. The existing `server/src/db/client.js` import is pre-existing Workshop 8 infrastructure and was not changed.
- Search follows `PostService` → `SubstringSearchStrategy` → `PostRepository`; publish emits the event without invoking listeners directly.
- The bcrypt cost and minimum password length are named constants, and the EventBus and search strategy remain small. No duplicate validation or newly introduced magic numbers were found in the reviewed increment.
- UX/accessibility review was not applicable to this backend-only increment.
- US-08 and US-09 remain in `docs/BACKLOG.md`. No secrets were identified in the Workshop 9 change set.

## Resolution

Added the requested Node.js engine constraint to `server/package.json`. The existing `server/src/db/client.js` import remains an acknowledged earlier architecture exception to the literal PR checklist item; persistence architecture was not restructured.
