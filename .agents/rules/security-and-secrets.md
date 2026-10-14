# Security and secrets
Activation: always on.
Job: keep secrets out of the repo and make every route safe by default.
Source: PRD NFR-3, 7.2, 7.4. Member data in logs is in member-data.md. Cookie and code rules for sign in are in auth-and-devices.md.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

## Secrets
- Never put a secret in code, a log, a commit, a test file or a reply. Secrets are keys, tokens, peppers and database URLs. Why: a leaked key cannot be taken back, and the AI token and the code pepper guard member data.
- Read env vars in one module only. Ask the owner for its path before creating it. Why: scattered reads make leaks and missing values hard to find.
- Use only the env var names the PRD uses (7.3, 7.4, 7.9, 9.5). Ask before adding one. Why: an invented name can be missed when the owner sets up hosting.
- Never log a request body, header or token. Why: they carry credentials.
- Never turn off TLS checks or any security check to make a test pass. Why: the check would stay off in production.

## Routes
- Check every request body, query string and route param with a Zod schema before use. Why: unchecked input is the main route to bugs and injection. Zod is named in PRD 7.4.
- Check the session on the server in every route handler and server component. Middleware only checks that a cookie exists. Why: middleware runs at the edge and cannot read the database. (PRD 7.2)
- Public routes are only /api/auth/*, POST /api/device/activate and GET /api/cron/maintenance. Their protection is the auth library, the rate limit in FR-6 and the cron secret header. Everything else needs a session. Why: PRD 7.4 lists exactly these.
- Never let a GET change data, except the cron route. Use POST, PATCH or DELETE. Why: GET can fire from prefetch or a pasted link. (PRD 7.4)
- Compare codes, hashes and secrets with a constant time compare. Why: a slower or faster answer leaks how much matched.

## Transport
- Use HTTPS only. Send the Content Security Policy and Strict-Transport-Security headers. Mark cookies HttpOnly, Secure and SameSite Lax. Why: NFR-3.
