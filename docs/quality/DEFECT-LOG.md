For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.

# Inkwell Defect Log

| ID | Found During | Cause Category | Description | Remediation |
|---|---|---|---|---|
| D-001 | Lecture 10 review | Compatibility | The supported minimum Node.js version was not documented. Although the Workshop 10 handoff associated the requirement with `??=`, the review confirmed the current `EventBus.on()` implementation uses `??`; this defect record does not attribute the issue to `??=`. | Declared Node.js `>=22.0.0` in `server/package.json` under `engines`. |
| D-002 | Lecture 14 accessibility review | Accessibility | The post editor route had no page-level heading, making its primary purpose unclear to users of heading navigation. | Added the visible “Write a new post” `<h1>` to the editor page. |
| D-003 | Lecture 14 axe-core scan | Accessibility | The Inkwell logo image repeated the adjacent “Inkwell” link text in its alternative text. | Marked the redundant logo image as decorative with an empty `alt` attribute. |
| D-004 | Lecture 14 README verification | Documentation | The README omitted the full database, environment, server, client, Prisma Client generation, and E2E setup required by a clean install. | Added PowerShell setup instructions, the required Prisma Client generation step, and all test-suite commands to the README. |
