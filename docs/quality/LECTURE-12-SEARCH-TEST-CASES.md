For this assignment's preparation, I have utilized ChatGPT, a language model created by
OpenAI. Within this assignment, ChatGPT was used for purposes such as outlining task
requirements and compositing prompts for completion.


# Lecture 12 - PostService.search() test cases

These service unit tests replace `SubstringSearchStrategy` with a hand-written Jest test double. The real strategy delegates to `PostRepository.searchPublished()`; neither that repository nor Prisma is loaded by these tests. The scope is service delegation, pagination defaults, and returned results, not database substring matching.

| # | Technique | Input | Expected Outcome |
|---|---|---|---|
| S1 | Black-box: valid-input equivalence partition | `query: "modularity", page: 1, pageSize: 10`; strategy returns a matching post and `hasMore: false` | Strategy receives the query and pagination unchanged; matching result is returned. |
| S2 | White-box: default-parameter path | `query: "design"`; pagination omitted | Strategy receives `page: 1, pageSize: 10`; its result is returned unchanged. |
| S3 | Black-box: explicit-pagination partition | `query: "design", page: 2, pageSize: 5`; strategy returns a post and `hasMore: true` | Strategy receives page 2 and page size 5; posts and `hasMore: true` are preserved. |
| S4 | Black-box: empty-result equivalence partition | `query: "no-match", page: 1, pageSize: 10`; strategy returns no matches | Returns `{ posts: [], hasMore: false }` without error. |

Implemented in [post.service.test.js](../../server/src/services/__tests__/post.service.test.js), with matching S1-S4 identifiers. Each test resets mocks and creates a new service instance.

Run from `server/`: `npm test -- --runTestsByPath src/services/__tests__/post.service.test.js`.

No query-validation rules are invented: the current service simply delegates to the strategy.
