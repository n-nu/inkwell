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
        +title
        +body
        +status
        +publishedAt
        +createdAt
    }
    User "1" --> "*" RefreshToken : holds
    User "1" --> "*" Post : authors
```

---

## Functional Model

### Feed Data Flow

```mermaid
flowchart LR
    Reader((Reader)) -->|GET /feed?page=n| Retrieve[Retrieve published posts]
    Retrieve -->|query: published, ordered, paginated| Store[(Post Store)]
    Store -->|page of posts| Retrieve
    Retrieve -->|page of posts or empty page| Reader
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
