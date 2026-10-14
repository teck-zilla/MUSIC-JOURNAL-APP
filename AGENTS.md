# Music Story

## Description
Music Story is a web app where members journal the songs they hear. Each entry holds a star rating, mood tags, a note and a listening context. Members use it on a phone, keep a private journal, can share single entries with one community group, and see their own mood and rating patterns plus song suggestions based on what they logged. (PRD section 1)

## Who uses it
- Member. The only user type. A member signs in, journals, reads insights and views Discover. (PRD section 4)
- There are no admin screens, admin scripts or SQL tools. Do not write any. (A3)
- One access tier exists: FREE, for all members. (FR-44, section 6.10)
- Sign in needs the age tick box, with the text and age given in FR-1, ticked before any provider button works.

## One thing the agent must do well
Meet goal G2 when saving an entry. Never lose or duplicate an entry. (G2, FR-19, FR-39)
- The save, queue, sync and wipe rules are in offline-and-caching.md. Why: one file owns them, so they cannot drift apart.

## Defined Scope for the MVP
The PRD calls its scope v1 or this version. The PRD file is version 2.0. The scope is v1. Build only what section 5.1 and section 6 list.
- It must work in the browsers listed in A8. (section 5.3)
- Sign in with Google, GitHub or Discord. Device linking with an activation code and a PIN. (FR-1 to FR-6)
- Demo connections for Spotify, Apple Music, YT Music and Tidal, with profile badges and status. Every modal step says it is a demo, and the badge shows the word Demo. (FR-7 to FR-10)
- Song search through the iTunes Search API, with an offline catalogue fallback, album art, previews and manual song add. Every preview and album art shows the Apple Music badge. (FR-11 to FR-14, LG-1)
- Journal Modal with rating, moods, context, note and listened at. Edit, delete, list. (FR-15 to FR-21)
- Filter and search of the member's own entries. (FR-22)
- Discover For You, mood carousels, Starter Picks and the Why this sentence. (FR-23 to FR-30)
- Insights: mood breakdown, rating distribution, top artists and genres, and the habit metrics in FR-33. Build no other metrics. (FR-31 to FR-33)
- Community: one group, sharing per entry, Report button. (FR-34 to FR-37)
- Offline use, privacy screen, time zone, time stored as UTC, heartbeat, export my data and delete my account. (FR-38 to FR-43)
- Non functional rules: NFR-1 to NFR-5. A change that breaks one is not done.
- Goals: G1 first entry, G2 fast saving, G3 return, G4 light screens, G5 Discover works. Measure them after launch. Build no analytics beyond the requirements. (section 3)

## Not in scope items for the MVP
- Importing or syncing listening history from any streaming platform.
- Real sign in to streaming platforms. Connections are simulated.
- Playing full tracks. Previews only.
- Sending member text to any outside service. The rules are in member-data.md and ai-boundary.md. (AI-5, FR-11)
- Embedding entries, notes or manual songs. (sections 8.2, 8.3)
- Payments, trials or locked features.
- Native iOS or Android apps.
- Direct messages, comments, likes or follows between members.
- Showing members anything about other members, except entries they chose to share.
- Building or showing Audiomack or Bandcamp. Keep them in the platform list in the data model. (section 5.2)
- Admin or moderator screens, admin scripts. (A3)
- Analytics or dashboards beyond the requirements. (section 3)

## Stack
Fixed by the project owner: Next.js, TypeScript, Prisma, PostgreSQL, pgvector.
Chosen in the PRD:
- Next.js with the App Router. Prisma 6, which is an unconfirmed assumption (A47). Pin exact versions in the README at project start. (sections 7, 7.8)
- pgvector holds song vectors only. Never entries, notes or manual songs. (sections 8.2, 8.3)
- Embeddings and the Why this sentence use the Cloudflare Workers AI free plan. Do not use the Gemini API. This replaces the owner's earlier Gemini choice and waits for the owner's answer to Q17. (section 8.6.1)

Also named in the PRD: Better Auth, iTunes Search API, Neon, Vercel Hobby, Serwist, Zod, @node-rs/argon2, Vercel Speed Insights. (sections 3.1, 7.7)
The PRD names its tools in sections 3.1, 7.7 and 8.6. Ask before adding a tool not named there.

## Folder map
Files the PRD names:
```
AGENTS.md              project root (owner)
lib/genre-moods.ts     genre to mood table (6.5.1). Ask whether the app uses a src folder first.
lib/ai/config.ts       AI settings (8.6.2)
lib/ai/facts.ts        builds the model input (8.6.2)
lib/ai/client.ts       the only file that calls Cloudflare Workers AI (8.6.2)
schema.prisma          Prisma schema (7.9, 9.4)
first migration file   hand written SQL (7.10)
README                 pinned versions (7.8)
.agents/rules/         the rules files listed below
```
Screens and routes (section 5.3):
```
/signin Sign in    / Journal        /search Search     /discover Discover
/insights Insights /community Community /profile Profile /settings Settings
/link Link device
```
- API paths are listed in PRD section 7.4. Do not add a path that is not listed.
- Create route folders for the screens and API paths in PRD sections 5.3 and 7.4. Ask before creating any top level folder beyond the paths of the files listed above.
- The PRD file is Music_Story_PRD_v2.md. Its place in the project is not given.

## How to work in this codebase
- One change is one PRD ID. Finish it, report it, then wait for the owner to say continue. Why: the owner can review and undo one requirement at a time.
- Ask before adding any package, including dev packages and packages the PRD names. Give the package name and the PRD line that names it. Why: each package adds risk and cost.
- Never run anything that connects to a database. The rules are in database-safety.md. Why: member journals cannot be restored beyond a short window.
- List assumptions at the end of every response as Assumption 1, 2, 3. If there are none, write "Assumptions: none". Do not reuse PRD A numbers. Why: hidden guesses turn into wrong builds.
- Stop and ask when the PRD gives no rule for a behaviour, field, route, limit or vendor. Why: a guess becomes a rule the owner never chose.
- Open Questions Q1 to Q17 are at the end of the PRD with build defaults. Sign in providers (Q5), the platform list (Q1) and the journal filter (Q7) are among them. Use the default and list it under Assumptions. Treat items marked A and a number the same way. Why: defaults stand in for answers the owner has not given.
- Name the PRD ID for every change: FR, NFR, AI, LG or a section number. Why: it traces each change to a requirement.
- Before a change, read the PRD text for its ID and let the matching rules files load. If a rules file and the PRD disagree, the PRD wins. Stop and tell the owner. Why: the rules files are short copies and the PRD is the source.

## Where the detailed rules live
- Rules files in .agents/rules. Always on: database-safety.md, security-and-secrets.md, change-control.md, definition-of-done.md, typescript-standards.md, member-data.md, offline-and-caching.md, launch-gates.md. Loaded by file match: ai-boundary.md, data-model.md, auth-and-devices.md, outside-services.md, ui-standards.md.
- Which file for which task: schema or SQL, data-model.md and database-safety.md. Sign in, codes and devices, auth-and-devices.md. Embeddings or the Why this sentence, ai-boundary.md. Search and previews, outside-services.md. Screens, ui-standards.md. Saving and caches, offline-and-caching.md.
- Requirements: FR-1 to FR-44 and NFR-1 to NFR-5 in section 6. AI-1 to AI-9 in 8.6. LG-1 to LG-8 and Q1 to Q17 at the end of the PRD.
- Goals and metrics: section 3. Screens: 5.3. Daily limits: 6.10. Genre to mood table: 6.5.1 and lib/genre-moods.ts.
- Schema: 7.9. SQL Prisma cannot write: 7.10. Vector model: section 9. AI rules: 8.6.
- Env var names: read them in 7.3, 7.4, 7.9 and 9.5. Do not invent one.
- Numbers (limits, windows, weights, sizes) sit in section 6, section 7.7 and section 9. Read them there. Do not copy a number from memory.
- Every assumption sits inline in the PRD as ASSUMPTION with an A number.
- Rules live in the rules files above, the PRD sections above and lib/ai/config.ts. Ask before creating any other rules file.

## Definitions
- Member: the only user. (section 4)
- Visit: one stretch of active use. A new visit starts when the gap between heartbeats passes the limit in FR-42. (section 3.1)
- Heartbeat: a message the app sends while visible to add active seconds. (FR-42)
- System data: email and name from the sign in provider, time zone, device label and last seen time, session records without a raw IP address, a salted hash of the IP address, active seconds, daily action counts. The provider profile picture is not stored. (section 4)
- Activation code: a code shown once that links one new device. PIN: the member's secret that goes with it. (FR-3, FR-4)
- Demo connection: a simulated platform connection. Nothing is shared with the platform. (FR-7)
- Manual song: a song a member adds by hand. Only its creator sees it. It has no art or preview. It is never embedded and never recommended. (FR-14)
- Offline catalogue: the seeded song list in the database. Used when iTunes fails, for Starter Picks and as Discover candidates. The bundled list in FR-39 serves search when the device is offline. (FR-11, FR-39)
- Seed moods: moods given to a song by its genre, from the genre to mood table. (FR-26)
- Crowd moods: moods that enough member entries have given a song, per FR-26.
- Qualifying entries: entries that meet the rating and time rule in FR-25 and FR-27, for songs that have a vector. Manual songs never qualify.
- Taste vector: computed on demand from the member's own entries as FR-25 says. It is never stored.
- Starter Picks: catalogue songs filtered by the member's chosen mood, in a stable order that differs per member. The entry count that triggers them is in FR-27.
- Discover score: three parts, taste similarity, mood affinity and genre affinity. The formulas are in FR-24. Do not change them.
- Discover For You: one feed of suggested songs for each member. (FR-23)
- Mood carousel: one row of songs for one of the member's most used moods. (FR-26)
- Why this sentence: one short sentence on a Discover card, written from song facts only. (FR-29)
- Habit metrics: the five metrics listed in FR-33.
- Report: a button on a shared entry that records a reason. Enough reports hide the entry, per FR-37.
- Launch gate (LG): a check that must pass before members are invited. Build gate: a check in 7.3 or 7.6 that must pass before dependent work.
- Boundary test: the test in 8.6.6 that fails if member text, a member id or an email reaches the AI vendor.
- Journal Modal: the form that opens when a member taps a search result. (FR-15)
- Idempotent: sending a save twice creates one entry and returns the existing one. (FR-19)
- Cursor: a marker for where the next page starts. (FR-21)
- p75: the time that 75 percent of loads beat. gzipped: compressed. JSON response: text data the server sends to the app. (section 3)
- Largest Contentful Paint: time until the main content is visible. (section 3.1)
- Salted hash: a one way scrambled form. (section 4)
- Prisma Studio: a visual database browser. (A3)
- iTunes Search API: a free public URL that returns song data as JSON. (section 5.1)
- ISO 8601 UTC timestamp: a standard date and time text such as 2026-10-13T19:42:00Z. (section 5.1)
- Enum: a fixed list of allowed values. (A5)
- OAuth: the standard sign in handshake between two apps. (A6)
- Better Auth: an open source sign in library for Next.js. (FR-1)
- Crockford base32: digits and letters without I, L, O, U. (FR-3)
- Cosine similarity: a measure of how alike two vectors point. (FR-24)
- sendBeacon: a browser call that sends data as a page unloads. (FR-42)
- WCAG 2.2 level AA: a standard for accessible web pages. (NFR-2)
- Content Security Policy: a rule that limits what scripts and images a page may load. (NFR-3)
