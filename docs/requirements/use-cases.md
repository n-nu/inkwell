# Use Cases

## US-01: Register Account

### Overview
- **Primary Actor:** Visitor
- **Preconditions:** The visitor is not authenticated.
- **Postconditions:** A new account exists for the submitted email address and is ready for email verification.

### Main Success Scenario
1. The visitor submits an email address and password.
2. The system validates the email format and password strength.
3. The system confirms that no account already exists for the email address.
4. The system creates the account with the password stored as a secure hash.
5. The system initiates the email-verification process.
6. The system tells the visitor to verify the account before logging in.

### Extensions
- **2a.** The email format is invalid: the system rejects the request and asks for a valid email address.
- **2b.** The password does not meet the password-strength requirements: the system rejects the request and explains the requirements.
- **3a.** An account already exists for the submitted email: the system returns a generic registration failure message that does not reveal whether the email is already registered.
- **5a.** Verification-message delivery fails: the account remains unverified and the user can request another verification message later.

---

## US-02: Log In

### Overview
- **Primary Actor:** Registered user
- **Preconditions:** The user has a registered, verified account.
- **Postconditions:** The user holds a valid access token and refresh token. Subsequent requests are authenticated.

### Main Success Scenario
1. The user submits an email and password.
2. The system verifies the credentials against the stored password hash.
3. The system issues a new access token and refresh token pair.
4. The client stores the refresh token securely and attaches the access token to subsequent requests.

### Extensions
- **2a.** Credentials do not match: the system returns a generic "invalid email or password" error and does not reveal which field was wrong.
- **2b.** The account exists but is not yet verified: the system rejects login and offers to resend a verification message.
- **3a.** Refresh-token issuance fails: the system does not issue an access token either, avoiding a partial authentication state.

---

## US-03: Publish Post

### Overview
- **Primary Actor:** Author, an authenticated user
- **Preconditions:** The user is authenticated.
- **Postconditions:** A Post exists in the Published state, is visible in the public feed, and appears on the author's profile.

### Main Success Scenario
1. The author creates a new draft post with a title and body.
2. The system autosaves the draft periodically according to the negotiated MVP scope.
3. The author requests to publish the draft.
4. The system validates that the post has a non-empty title and body.
5. The system transitions the post to Published and records a publish timestamp.
6. The post becomes visible in the public feed and on the author's profile.

### Extensions
- **1a.** The author navigates away mid-draft: the most recent local autosave is retained within the negotiated MVP scope.
- **3a.** The author is not the post's owner: the system rejects the request with an authorization error.
- **4a.** The title or body is empty: the system rejects the publish request and keeps the post in Draft.

---

## US-04: Browse Feed

### Overview
- **Primary Actor:** Reader, authenticated or visitor
- **Preconditions:** None. The public feed is readable without authentication.
- **Postconditions:** The reader sees a list of published posts, most recent first.

### Main Success Scenario
1. The reader navigates to the feed.
2. The system retrieves published posts ordered by publish date descending, in pages of a fixed size.
3. The reader may request the next page.

### Extensions
- **2a.** No posts exist yet: the system shows an explicit empty state rather than a blank screen.
- **2b.** The requested page is beyond the available data: the system returns an empty page rather than an error.
