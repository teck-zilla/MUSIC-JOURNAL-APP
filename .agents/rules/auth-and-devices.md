# Auth and devices
Activation: glob **/api/auth/**, **/api/device/**, **/api/devices/**, **/link/**, **/signin/**.
Job: build sign in, device linking, the activation code and the PIN.
Source: PRD FR-1 to FR-6, 7.2, 7.3. Cookie flags and public routes are in security-and-secrets.md. The raw IP policy is in member-data.md.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

## Sign in
- Use Better Auth with its Prisma adapter and database sessions, never JWT. Why: revoking a device needs a session row. (PRD 7.3, A40)
- Offer Google, GitHub and Discord only. No password and no email link. Why: FR-1.
- Block every provider button until the tick box 'I am 13 or older' is ticked. Why: the PRD sets the age rule. (FR-1, A10)
- On first sign in create the member, one device, one platform connection per platform and one group membership. Do not ask for a code or PIN. Why: a forced step before the first entry hurts goal G1. (FR-2, FR-3)
- Set the display name from the provider name in a database hook. Let the member change it. Never save the provider picture. Why: the PRD stores no picture. (PRD 7.3, section 4)
- In middleware check only that a session cookie exists. Do the full session check in route handlers on the Node runtime. Why: the edge cannot read the database. (PRD 7.2)

## Device cookie
- Set a random HttpOnly cookie named ms_device. A session create hook attaches the matching device. If the cookie is missing or the device is revoked, create a new device and set a new cookie. If the hook cannot read cookies, create the device in the first signed in route instead. Why: a session must belong to a device so it can be revoked. (PRD 7.3)
- Turn off the library's IP capture on sessions if it offers that option. If not, replace the IP with its salted hash in a session create hook before the write. Why: no raw IP may be stored. (member-data.md, LG-5)

## Code and PIN
- Draw the code from 8 characters of the Crockford base32 alphabet with crypto.randomInt. Store only an HMAC-SHA-256 of it, keyed from the pepper env var. Show the code once. Why: the code is a credential. (FR-3, PRD 7.3)
- Store the 6 digit PIN only as an argon2id hash from @node-rs/argon2. Never log or store a code or PIN in plain text. Why: they are credentials. (PRD 7.3)
- On the first call to POST /api/device/code set the PIN. Later calls need the current PIN. A new code sets supersededAt on any older unused code. Why: only one code may work at a time. (FR-5, PRD 7.3)
- A code links exactly one device and an unused code never expires. A member may have 5 active devices, and a sixth link needs a revoke first. Why: FR-4.
- A revoke deletes that device's sessions. The revoked device wipes its saved data on its next load. Why: FR-5 and FR-40.

## Activate route
- Run POST /api/device/activate in this order. (1) If the IP hash has 20 failed attempts in the last 15 minutes, write IP_BLOCKED and return 429. (2) Find the code by its hash with usedAt and supersededAt empty. None found writes WRONG_CODE. (3) If lockedUntil is in the future, write CODE_LOCKED and return 429. (4) Check the PIN. A mismatch adds 1 to failedPins and writes WRONG_PIN, and the 5th wrong PIN locks the code for 15 minutes. (5) In one transaction set usedAt, create the device, create the session through the library's internal adapter, and write SUCCESS. (6) Set the cookie with the library's cookie helper. Why: this order stops guessing and keeps one shared carrier IP from locking out everyone. (FR-6, PRD 7.3)
- Never let a lock block social sign in. Write every attempt to LoginAttempt. Why: FR-6.
- Use library internals only in POST /api/device/activate. Stop after writing it and ask the owner to prove it on the installed version (LG-5). Why: internals can change between versions. (PRD 7.3)
