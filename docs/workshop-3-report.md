# Workshop 3 Report Content

## US-05: Comment on Post

### Overview
- **Primary Actor:** Reader
- **Preconditions:** The reader is authenticated, and the target post exists in the Published state.
- **Postconditions:** A comment containing the reader's submitted text is associated with the post and visible to readers according to the platform's comment display rules.

### Main Success Scenario
1. The reader opens a published post.
2. The system displays the existing comments and a control for adding a comment.
3. The reader enters comment text and submits it.
4. The system validates that the comment is not empty and satisfies the allowed length requirements.
5. The system creates the comment, associates it with the reader and the post, and records its creation time.
6. The system displays the new comment with the existing comments.

### Extensions
- **2a.** The reader is not authenticated: the system asks the reader to log in before showing the comment submission control.
- **4a.** The comment is empty or exceeds the allowed length: the system rejects it and explains the validation requirement without creating a comment.
- **5a.** The target post is unavailable or is no longer accepting comments: the system rejects the request and tells the reader that the comment could not be posted.

## Submission Evidence

Add a screenshot of the final `git log --oneline` output here before exporting this content as part of the PDF report.

## Requirements Review

| Use Case | Correct? | Consistent? | Complete? | Feasible? | Testable? |
|---|---|---|---|---|---|
| Register Account | Yes | Yes | Yes | Yes | Yes: email uniqueness and password strength are checkable. |
| Log In | Yes | Yes | Yes | Yes | Yes: credential, verification, and token outcomes are checkable. |
| Publish Post | Yes, after scope negotiation | Yes: consistent with the Post state model | Partial: cross-session draft recovery is explicitly deferred | Yes, within MVP scope | Yes: empty title/body and ownership checks are checkable. |
| Browse Feed | Yes | Yes | Yes | Yes | Yes: ordering, pagination, and empty results are checkable. |
