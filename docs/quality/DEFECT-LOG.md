For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.

# Inkwell Defect Log

| ID | Found During | Cause Category | Description | Remediation |
|---|---|---|---|---|
| D-001 | Lecture 10 review | Compatibility | The supported minimum Node.js version was not documented. Although the Workshop 10 handoff associated the requirement with `??=`, the review confirmed the current `EventBus.on()` implementation uses `??`; this defect record does not attribute the issue to `??=`. | Declared Node.js `>=22.0.0` in `server/package.json` under `engines`. |
