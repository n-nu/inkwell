# Software Configuration Management Policy

## Branching Strategy

Inkwell uses GitHub Flow because its small project size and “one lecture, one increment” development rhythm do not need GitFlow’s long-lived `develop` and release branches. GitHub Flow also keeps the process lighter than a strict trunk-based workflow while ensuring changes are reviewed before they reach `main`.

- `main` is always deployable.
- Work happens on short-lived branches named `<type>/<short-description>`, such as `feature/tag-search` or `fix/author-id-spoofing`.
- Changes merge through pull requests using the [pull request template](../../.github/PULL_REQUEST_TEMPLATE.md).
- Pull requests require all automated tests to pass and approval from at least one reviewer.
- Delete branches after they are merged.

## Commit Message Conventions

Use Conventional Commits in this format:

```text
<type>(<scope>): <short summary>
```

Supported types are `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, and `security`.

Examples:

```text
feat(posts): add tag-based search
security(auth): fix authorId spoofing vulnerability
```

Consistent prefixes make the history easier to search, for example with `git log --grep="^security"`. This convention applies going forward; do not rewrite older commits to make them conform.

## Change Control

Ordinary changes to unreleased work follow the standard pull-request process. Use the [Change Request template](../../.github/CHANGE_REQUEST_TEMPLATE.md) when changing software that has already been released and baselined. This risk-based control avoids imposing the formal process on every routine development change.
