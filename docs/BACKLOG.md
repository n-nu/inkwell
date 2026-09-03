# Inkwell Product Backlog

Definition of Done: see README.md

| ID | User Story | Priority | Points | Status | Notes |
|----|------------|----------|--------|--------|-------|
| US-01 | As a visitor, I want to register an account, so that I can publish and interact with content | High | 3 | Backlog | See docs/requirements/use-cases.md |
| US-02 | As a registered user, I want to log in and stay logged in securely, so that I don't have to re-authenticate constantly | High | 5 | Backlog | See docs/requirements/use-cases.md |
| US-03 | As an author, I want to write and publish a post, so that readers can see my writing | High | 5 | Backlog | Scope negotiated: plain-text title/body, manual Publish, and local component-state autosave; rich text, image embeds, and server-persisted draft recovery deferred. |
| US-04 | As a reader, I want to browse a public feed of posts, so that I can discover new writing | High | 3 | Backlog | See docs/requirements/use-cases.md |
| US-05 | As a reader, I want to comment on a post, so that I can engage with the author | Medium | 3 | Backlog |
| US-06 | As a reader, I want to follow an author, so that I see their new posts more prominently | Medium | 3 | Backlog |
| US-07 | As an author, I want to see basic analytics on my posts, so that I understand my audience | Low | 5 | Backlog |
| US-08 | As a user, I want to reset my password, so that I can regain access if I forget it | High | 3 | Backlog | See docs/requirements/use-cases.md |
| US-09 | As an author, I want to edit my published posts, so that I can fix errors or update content after publishing | Medium | 3 | Backlog | See docs/requirements/use-cases.md |

## Estimation Justifications

- **US-08:** Password reset is High priority because losing account access prevents users from using the platform, and 3 points reflects a focused recovery workflow involving reset-token handling.
- **US-09:** Published-post editing is Medium priority because it improves author experience but is less essential than registration, login, publishing, and feed access, and 3 points reflects a contained post-update feature.
