For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.

# Inkwell Security Threat Model

## Scope and assumptions

This model covers the current Express API, PostgreSQL-backed post and user data,
and React rendering of feed posts. The public post feed and search are unauthenticated.
Authentication uses signed JWT access tokens; the server loads the user identified
by the token subject before allowing a post to be published.

Likelihood, impact, and risk describe the remaining risk after the mitigations
listed below. The risk ratings are qualitative and are not a production security
certification.

## STRIDE analysis

| Component | Threat category | Likelihood | Impact | Risk rating | Mitigation / current status |
|---|---|---:|---:|---:|---|
| `POST /api/posts` | Spoofing | Low | High | Low | Already present before this pass: bearer access tokens are verified, the token subject is resolved to a current user, and the route overwrites any client-supplied `authorId`. A regression test verifies Alice cannot publish as Bob. |
| `GET /api/posts` and search | Information Disclosure | Low | Medium | Low | Feed and search select and serialize only the public author `id` and `displayName`. Email and persistence-only fields are not returned. |
| `POST /api/auth/register` and `POST /api/auth/login` | Denial of Service / Spoofing | Medium | High | Medium | An IP-based limiter allows five requests per 10-minute window across authentication routes and returns `TOO_MANY_ATTEMPTS` thereafter. It reduces brute-force and request-flood risk but is not a distributed abuse defense. |
| JWT access tokens | Spoofing / Elevation of Privilege | Low | High | Low | Tokens are signature- and expiry-verified server-side. Missing, malformed, invalid, expired, or orphaned-user tokens are rejected with HTTP 401. Development secret defaults must not be used in production. |
| `PostCard` rendering post body | Tampering / Elevation of Privilege (stored XSS) | Low | High | Low | Post body is rendered as React text, not HTML. A regression test verifies a script payload remains literal text and does not execute. |
| `GET /api/posts` and search pagination | Denial of Service | Low | Medium | Low | `pageSize` defaults to 10, rejects malformed or non-positive values, and clamps requests to a maximum of 100 for both feed and search. |
| Server dependency tree | Tampering / Denial of Service | Unknown | High | High | `npm audit --omit=dev` reports 13 production-tree advisories (5 moderate, 6 high, 2 critical). Reachability and exploitability were not assessed; compatible dependency updates remain a follow-up before production use. |

## Hardening Log

- Verified the pre-existing bearer-token authentication and server-derived
  publishing identity; added explicit middleware and regression coverage for
  missing/invalid credentials and attempted author spoofing.
- Added allowlist-based public author serialization for feed and search results.
- Added a five-attempt, 10-minute authentication rate limit to registration and
  login, with an isolated integration test for the 429 response.
- Verified React's existing text escaping with a stored-XSS regression test;
  no HTML sanitizer was needed because the app does not render post bodies as HTML.
- Added a `pageSize` maximum of 100, with input validation and feed/search
  integration coverage.
- Reviewed the production dependency audit summary. Dependency advisories were
  not upgraded in this scoped pass; they are recorded as a separate follow-up.

## Security Measurement Baseline

- Confirmed application-level hardening gap: 1 (authentication endpoints had no
  rate limit).
- Dependency audit: 13 reported production-tree advisories (5 moderate, 6 high,
  2 critical); reachability was not independently confirmed and remediation is
  pending a compatible-version review.
- Existing protections verified rather than counted as newly introduced flaws:
  server-derived post author identity and inert React text rendering.
- Mitigations completed or verified in this pass: 5 areas (identity, public
  response shaping, authentication rate limiting, XSS regression coverage, and
  bounded pagination).
- Dedicated security regression scenarios: 5 (missing/invalid tokens and
  spoofing, feed/search data shaping, rate limiting, XSS rendering, and
  oversized/malformed pagination).
- Security maturity: ad hoc/reactive — first formal hardening pass. This baseline
  does not establish production readiness or replace deployment-level review.
