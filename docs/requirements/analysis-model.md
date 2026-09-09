# Analysis Model

## Model Overview

```mermaid
graph TD
    UC[Use Cases] --> Scenario[Scenario-based model]
    UC --> Class[Class-based model]
    UC --> Functional[Functional model]
    UC --> Behavioral[Behavioral model]
```

---

## Scenario-Based Model

### Use Case Diagram

```mermaid
graph TD
    Visitor((Visitor)) --> Register[Register Account]
    Visitor --> Login[Log In]
    Reader((Reader)) --> Feed[Browse Feed]
    Reader --> Comment[Comment on Post]
    Author((Author)) --> Publish[Publish Post]
    Author --> Login
```

---

## Class-Based Model

### Domain Class Diagram

```mermaid
classDiagram
    class User {
        +id
        +email
        +displayName
        +passwordHash
        +isVerified
        +createdAt
    }
    class RefreshToken {
        +id
        +tokenHash
        +expiresAt
    }
    class Post {
        +id
        +authorId
        +title
        +body
        +status: DRAFT | PUBLISHED
        +publishedAt
        +createdAt
    }
    class Comment {
        +id
        +postId
        +authorId
        +body
        +createdAt
    }
    User "1" --> "*" RefreshToken : holds
    User "1" --> "*" Post : authors
    User "1" --> "*" Comment : writes
    Post "1" --> "*" Comment : receives
```

---

## Functional Model

### Feed Data Flow

```mermaid
flowchart LR
    Reader((Reader)) -->|GET /api/posts?page=n| Retrieve[Retrieve published posts]
    Retrieve -->|query: published, ordered, paginated| Store[(Post Store)]
    Store -->|page of posts| Retrieve
    Retrieve -->|page of posts or empty page| Reader
```

### Comment Creation Boundary

Comment creation is an authenticated operation and is documented in the Workshop 4 API contract. The target post must be published before a comment can be created. The comment design remains a review point because it adds behavior around the Post state model.

```mermaid
flowchart LR
    Reader((Authenticated reader)) -->|POST /api/posts/:id/comments| CommentService[Validate comment and post state]
    CommentService -->|published post| CommentStore[(Comment Store)]
    CommentStore -->|created comment| CommentService
    CommentService -->|201 comment or standard error| Reader
```

---

## Behavioral Model

### Post State Diagram

```mermaid
stateDiagram-v2
    [*] --> Draft: author creates post
    Draft --> Draft: author edits or autosaves locally
    Draft --> Published: author publishes valid post
    Published --> Published: author edits and creates new version
```

The Archived state and server-persisted draft recovery are deferred and are not part of the negotiated US-03 MVP scope.

Comments are allowed only for posts in the Published state in the current design. Drafts cannot receive comments.
