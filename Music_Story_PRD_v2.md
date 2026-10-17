# Music Story: Product Requirements Document

Version 2.0 | 13 October 2026 | Status: build ready after the launch gates (LG-1 to LG-8) in the Open Questions section

## 1. Product Summary

Music Story is a web app where members journal the songs they hear. Each entry holds a star rating, mood tags, a note and a listening context. Members use it on a phone, keep a private journal, and can share single entries with one community group. The app shows each member their own mood and rating patterns and suggests songs based on what they logged. It refuses to import listening history from streaming platforms, to send a member's notes to any outside service, to keep data it does not list on its Privacy screen, and to charge for any feature.

## 2. Problem

People listen to a lot of music. They forget songs they enjoyed, and they forget why they enjoyed them. Streaming apps keep play counts, but not the reason a song mattered on a given night. A member has no single place to record, organise and look back on their music.

Music Story is that place. It lets a member find an old song again by mood, rating, context, title or artist (FR-22). It shows each member their own listening habits over time.

## 3. Goals

ASSUMPTION A1: Every numeric target below is mine and needs founder sign off. Reason: the idea gives no targets, so I sized them for a launch of 400 members.

| ID | Goal | Target |
|---|---|---|
| G1 | New members write a first entry quickly | 60% of new members save one entry within 24 hours of first sign in |
| G2 | Logging is fast | Median time from opening the Journal Modal to tapping Save is under 30 seconds, online saves only |
| G3 | Members return | 35% of members who saved an entry in their first 7 days save at least one entry in days 22 to 28 |
| G4 | Screens are light | Cold start (database asleep): Journal and Discover usable in under 3 seconds at p75 [the time that 75 percent of loads beat] on a 4G phone. Warm: under 2 seconds at p75. First load JavaScript is 150 KB gzipped [compressed] or less per route. Every JSON response [text data the server sends to the app] is 50 KB gzipped or less |
| G5 | Discover works | 20% of Discover visits end in a preview play or a journal entry from a Discover song, and 60% of entries logged from Discover are rated 4 or 5 |

ASSUMPTION A2: Every metric uses a rolling 4 week window. No decision is made on a cohort smaller than 30 members. Reason: at 400 members, one person moves a weekly percentage by more than 3 points.

### 3.1 Metrics

A visit is one UsageSession row (FR-42).

| Metric | Definition | Source | Review |
|---|---|---|---|
| First entry within 24 h | New members with 1 or more JournalEntry within 24 h of User.createdAt, divided by new members | JournalEntry, User | Weekly |
| Median save time | Median of (Save tap time minus modal open time), sent by the client in POST /api/entries as saveMs. Offline saves are excluded | SystemEvent rows of kind SAVE_TIMING, written by POST /api/entries | Weekly |
| Week 4 retention | Members who saved an entry in days 0 to 6 and again in days 22 to 28, divided by members who saved in days 0 to 6 | JournalEntry | Weekly |
| Weekly active loggers | Members with 1 or more entry in the ISO week, divided by all members | JournalEntry | Weekly |
| Cold and warm load time | Largest Contentful Paint [time until the main content is visible] at p75, split by whether the database was asleep (the server adds a header the client reports) | Vercel Speed Insights at sampleRate 0.25 | Weekly |
| Discover action rate | Discover visits with a PlayEvent or JournalEntry from a Discover song, divided by Discover visits | PlayEvent, JournalEntry, UsageSession | Weekly |
| Discover fit | Entries with origin DISCOVER rated 4 or 5, divided by entries with origin DISCOVER | JournalEntry | Weekly |
| Search fallback rate | Searches answered from the offline catalogue, divided by all searches. Alert above 10% | SystemEvent | Weekly |
| Demo connect rate (info only) | Members with 1 or more CONNECTED PlatformConnection, divided by all members. It counts demo connections and is not a success metric | PlatformConnection | Monthly |

### 3.2 Non goals

This product will not try to solve any of the following.

- Importing or syncing listening history from any streaming platform.
- Real sign in to streaming platforms in v1. Connections are simulated.
- Playing full tracks. It plays 30 second previews only.
- Sending a member's notes, or any member text, to an outside service.
- Taking payments, running trials or locking features.
- Native iOS or Android apps. It is a web app.
- Direct messages, comments, likes or follows between members.
- Showing members anything about other members except entries they chose to share.

## 4. Users and Personas

The member is the only user. A member signs in, journals, reads their insights and views Discover. The app holds what the member enters, public song data, and the system data below. It adds nothing else.

System data the app holds (each item is listed on the Privacy screen, FR-38):

- Email and name from the sign in provider. The profile picture is not stored.
- Time zone, taken from the browser.
- Device label and last seen time for each linked device.
- Session records, with no raw IP address.
- A salted hash [a one way scrambled form] of the IP address, used only for sign in lockout.
- Active seconds in the app for each visit.
- Counts of daily actions (entries, searches, questions) used to enforce limits.

ASSUMPTION A3: v1 has no admin or moderator screens. The founder works through Prisma Studio [a visual database browser] and SQL. Reason: the idea names no operator role.

### 4.1 Persona: Tunde Bello

ASSUMPTION A4: Tunde is a fictional composite. Reason: the idea names no real user, so he is built from its global small business context. Replace him with real interview findings when you have them.

| Trait | Detail |
|---|---|
| Who | 26, junior accountant, Lagos |
| Phone | Mid range Android, 4 GB memory, Chrome, 6 inch screen |
| Data habits | Buys a mobile data bundle of about 1 GB each week. Turns mobile data off between uses. Uses home Wi-Fi in the evening. Avoids apps that load large images or autoplay audio |
| Streaming | Listens on Spotify and YouTube Music |
| What he logs | Afrobeats and releases that are often missing from big catalogues, so he sometimes adds a song by hand |
| Opening frequency | 4 to 5 times a week, 3 to 6 minutes each time |
| Trigger | A song ends and he thinks 'I will forget this one.' It happens on the evening commute or between 9 pm and 11 pm |
| Fear | Losing the entry because the signal drops while he saves |
| Win | In 6 months he opens his insights and sees that 'Late night coding' songs are mostly Focused and rated 4 or higher |

## 5. Scope

This version covers the items below. Items 1 and 2 come from the idea's Scope. Items 3 to 6 come from the idea's Features and Context and are kept small.

### 5.1 In scope

1. Account connection modal with an interactive sign in simulation, profile badges and platform status for Spotify, Apple Music, YT Music and Tidal.
2. Song search and journal entry. Live search uses the iTunes Search API [a free public URL that returns song data as JSON] and an offline catalogue. Results show real album art and a 30 second audio preview.
3. Journal Modal, Discover For You with mood carousels, and Analytics and Mood Insights (section 6).
4. Sign in with Google, GitHub or Discord, and device linking with an activation code and PIN.
5. One community group with opt in entry sharing and a Report button.
6. Persistent storage of every entry and play with an ISO 8601 UTC timestamp [a standard date and time text such as 2026-10-13T19:42:00Z].

### 5.2 Platform status in v1

| Platform | v1 behaviour |
|---|---|
| Spotify | Simulated connection, badge, status |
| Apple Music | Simulated connection, badge, status |
| YT Music | Simulated connection, badge, status |
| Tidal | Simulated connection, badge, status |
| Audiomack, Bandcamp | Not shown. Reserved in the data model |

ASSUMPTION A5: The idea lists Spotify, Apple Music, Audiomack and Bandcamp in its Context, and Spotify, Apple Music, YT Music and Tidal in its Scope. v1 builds the four in Scope. The Platform enum [a fixed list of allowed values] also holds AUDIOMACK and BANDCAMP so adding them later needs no migration. Reason: the two lists conflict. See Open Questions.

ASSUMPTION A6: Connections are simulated. No OAuth [the standard sign in handshake between two apps] call goes to any platform and no platform token is stored. Reason: the Scope says auth simulation, and the app only holds data members supply.

ASSUMPTION A7: The offline catalogue holds 1,500 songs spread across the 7 moods. A seed script fills it once from the iTunes Search API. Reason: the idea names an offline catalogue but gives no size or source.

### 5.3 Screens

| Screen | Path | What it holds |
|---|---|---|
| Sign in | /signin | Three provider buttons and the 13 plus tick box |
| Journal (home) | / | Entry list, filter chips, search box, Add button |
| Search and Journal Modal | /search | Song search, results, Journal Modal, manual add |
| Discover | /discover | Feed, mood chips, mood carousels |
| Insights | /insights | Charts, habit metrics |
| Community | /community | Group feed with Report buttons |
| Profile | /profile | Display name, platform badges, Connect modal |
| Settings | /settings | Devices, Privacy list, time zone, Export, Delete |
| Link device | /link | Code and PIN form |

ASSUMPTION A8: Supported browsers are the latest 2 versions of Chrome, Safari (iOS 16.4 and later), Firefox and Edge. Reason: the idea names none, and a phone first audience needs a defined list.

## 6. Features

Every requirement has an ID so you can reference it. The three suggestions in the brief are revised in 6.4, 6.5 and 6.6.

### 6.1 Sign in and device linking

- **FR-1.** The member signs in with Google, GitHub or Discord through Better Auth [an open source sign in library for Next.js]. The sign in page has a tick box 'I am 13 or older' that must be ticked first. There is no password and no email link. ASSUMPTION A9: these three providers. Reason: the idea says 'preferred social media handle' but names none, and all three are free. 'Google ID/email' is read as the Google account email. ASSUMPTION A10: age 13 or older. Reason: the idea gives no minimum age. See Open Questions.
- **FR-2.** First sign in creates the User, one Device, one PlatformConnection per platform with status NOT_CONNECTED, and one GroupMember row. It does not ask for a code or PIN.
- **FR-3.** After the member's first saved entry, a card offers 'Link another device'. The same option sits in Settings, Devices. The member sets a 6 digit PIN, then the app shows one 8 character activation code once, with a Copy button. The app stores only a hash of the code and PIN. Purpose: it lets the member sign in on a device without using their social account, such as a shared or family phone. ASSUMPTION A11: the deferred offer, the stated purpose, an 8 character code from the Crockford base32 alphabet [digits and letters without I, L, O, U] and a 6 digit PIN. Reason: the idea says a code is issued automatically but not when, and a forced step before the first entry would hurt G1. The PIN is mine, from the brief's request for code plus PIN.
- **FR-4.** On a new device the member opens /link, enters the code and PIN, and that device is signed in as that member. A code links exactly one device. An unused code never expires. A member can have 5 active devices. A sixth link needs a revoke first. ASSUMPTION A12: 5 devices. Reason: the idea gives no limit.
- **FR-5.** In Settings, Devices, the member can issue a new code. The old unused code stops working at once. The member can revoke any device. A revoked device is signed out and its saved data is wiped on its next load (FR-40).
- **FR-6.** After 5 wrong PINs on one code, that code is locked for 15 minutes. After 20 wrong code or PIN attempts from one IP hash in 15 minutes, linking returns an error for that IP for 15 minutes. Neither lock blocks social sign in. Every attempt is stored in LoginAttempt. ASSUMPTION A13: 5, 20 and 15 minutes. Reason: shared mobile carrier addresses put many people behind one IP, so the IP limit must be higher than the per code limit.

### 6.2 Streaming platform connection (demo)

- **FR-7.** The Connect modal, opened from Profile, lists the four platforms. Tapping one starts a three step simulation: Choose, Consent, Result. The Consent step shows a fake sign in screen with a handle field and an Allow button. All three steps show the line 'Demo connection. Nothing is shared with the platform.'
- **FR-8.** Each platform has a status: NOT_CONNECTED, CONNECTED or ERROR. A CONNECTED platform shows a badge on the Profile screen with the word Demo. ASSUMPTION A14: badges are computed from PlatformConnection and have no table. Reason: they carry no data of their own.
- **FR-9.** Cancel or closing the modal sets NOT_CONNECTED and writes a ConnectionIssue with type CANCELLED. Sixty seconds without action sets ERROR and writes TIMEOUT. A failed save of the result sets ERROR and writes NETWORK. Every row has simulated = true. The member sees one plain sentence and a Retry button.
- **FR-10.** Disconnect removes the badge and sets NOT_CONNECTED. Entries stay.

### 6.3 Song search and manual add

- **FR-11.** The search box waits 300 ms after typing stops, needs 2 or more characters, and calls GET /api/songs/search. The server asks the iTunes Search API for 20 songs. The server never sends more than 15 iTunes calls a minute in total. On a 429, a 403 or no answer in 3 seconds, the server searches the offline catalogue, writes a SystemEvent of kind SEARCH_FALLBACK, and the screen says 'Showing saved songs.' ASSUMPTION A15: 300 ms, 20 results, 3 seconds and 15 calls a minute. Reason: Apple says the API allows about 20 calls a minute, and the server shares one address with other apps.
- **FR-12.** Each result shows 100 pixel album art, title, artist, album, a play button for the 30 second preview, and an Apple Music badge that links to the song's Apple page (trackViewUrl). The badge sits beside the play button. Art loads at 600 by 600 on the detail view only. One preview plays at a time. ASSUMPTION A16: the badge placement. Reason: Apple's terms allow previews and art only to promote store content, with samples near a store badge. See Launch gates.
- **FR-13.** A preview that plays for 5 seconds or more writes a PlayEvent with playedAt in UTC. ASSUMPTION A17: 5 seconds. Reason: filters out accidental taps.
- **FR-14.** Below the results, 'Add it yourself' asks for a title (required, up to 200 characters) and an artist (required, up to 200 characters). It creates a Song with source MANUAL and createdByUserId set. A manual song shows a plain placeholder in place of art, has no preview, is visible only to its creator, is never embedded and is never recommended. ASSUMPTION A18: manual add with two fields. Reason: songs from small platforms are often missing from the iTunes catalogue, and without it the member cannot log them.

### 6.4 Journal Modal (revised)

- **FR-15.** Tapping a result opens the Journal Modal. Fields: star rating (required), moods (required), listening context (optional), note (optional), listened at (defaults to now, editable). Listened at may not be later than now plus 5 minutes and may not be earlier than 1 January 2000. ASSUMPTION A19: these two bounds. Reason: a wrong phone clock would otherwise save entries dated years away.
- **FR-16.** Rating is 1 to 5 whole stars. ASSUMPTION A20: no half stars. Reason: the idea says '5-star' only.
- **FR-17.** Moods are exactly: Energetic, Chill, Melancholic, Focused, Euphoric, Nostalgic, Hype. The member picks 1 to 3. ASSUMPTION A21: 1 to 3 moods. Reason: songs often carry more than one mood, and a cap keeps the mood charts readable.
- **FR-18.** Context offers six chips (Rainy night, Workout, Late night coding, Commute, Road trip, Studying) plus a custom text box up to 40 characters. ASSUMPTION A22: the chips beyond the three examples in the idea, and the 40 character cap. Reason: chips make logging faster on a phone.
- **FR-19.** The note holds up to 2,000 characters. ASSUMPTION A23: 2,000 characters. Reason: long enough for a paragraph, small enough to keep each row near 1 KB. Save is idempotent [sending it twice creates one entry]. The client makes a UUID called clientId for each entry. If the server already has that clientId for the member, it returns the existing entry with status 200 and the same body. The modal closes at once and shows the entry as saved while the request finishes.
- **FR-20.** The member can edit or delete any of their entries. The same song can be logged many times.
- **FR-21.** The journal list shows entries newest first by listenedAt, 20 per page. The cursor [a marker for where the next page starts] is the pair (listenedAt, id).
- **FR-22.** The Journal screen has filter chips for mood, minimum rating and context, and a text box that matches song title or artist. Filters combine with AND and apply only to the member's own entries. Filtering needs a connection. ASSUMPTION A24: this filter and search. Reason: the Problem promises easy re-finding, and no other requirement delivers it. The founder may cut it. See Open Questions.

### 6.5 Adaptive browsing and recommendations (revised)

- **FR-23.** Discover For You is one feed of 20 songs for each member. Candidates are Song rows that are not MANUAL and have a SongVector. That means the 1,500 catalogue songs plus any iTunes song a member has journaled.
- **FR-24.** The server fetches the 60 candidates nearest to the member's taste vector (FR-25). For each candidate it computes three parts. Taste similarity is the cosine similarity [a measure from minus 1 to 1 of how alike two vectors point]. Mood affinity is the share of the member's last 90 days of entries that carry any of the song's moods. Genre affinity is the member's average rating in the song's genre divided by 5, or 0.5 if none. Each part is scaled to 0 to 1 across the 60 candidates (lowest becomes 0, highest becomes 1; if all are equal, every value is 0.5). Score = 0.5 x taste + 0.3 x mood + 0.2 x genre. ASSUMPTION A25: the weights and the scaling. Reason: the idea names the signals (mood frequency, favourite genres, high ratings) but not their weights, and unscaled parts would let one signal dominate. Tune after launch.
- **FR-25.** The taste vector is the average of the SongVector of every song the member rated 4 or 5 in the last 90 days. An entry rated 5 counts twice. It needs 3 or more such entries. ASSUMPTION A26: rating 4 or 5, double weight for 5, 90 days and 3 entries. Reason: the idea says to use high ratings but gives no window or weight.
- **FR-26.** Mood carousels show one row per mood among the member's top 3 moods in the last 90 days, 10 songs each. Mood filter chips above Discover narrow the feed to one mood. A song's moods are its seed moods (from the table in 6.5.1) plus any mood that 3 or more member entries have given it. ASSUMPTION A27: the genre to mood table and the 3 entry rule. Reason: catalogue songs have no member moods at launch, and the idea gives no mapping.
- **FR-27.** A member with fewer than 3 qualifying entries (rated 4 or 5, last 90 days) sees Starter Picks. Starter Picks are catalogue songs filtered by the mood chip the member chooses, ordered by md5 of member id plus song id, so each member sees a stable but different order. ASSUMPTION A28: the fixed numbers in this section: 60 candidates, 20 in the feed, 3 carousels of 10 songs, a 90 day window and a 6 hour cache (FR-30). Reason: the idea gives none of them. Tune after launch.
- **FR-28.** A song the member already journaled, at any rating, never appears in Discover.
- **FR-29.** Each Discover card has a 'Why this?' link. It returns one sentence written by the language model from song facts and averaged numbers only (section 8.6). The server accepts the sentence only if it has 25 words or fewer and has no quotation marks. Otherwise, and when the daily limit of 10 is hit or the call fails, the app shows this template: 'You rated {n} {mood} songs in {genre} {avg} stars on average.' ASSUMPTION A29: the language model writes this sentence, with a validity check and a template. Reason: the brief lists a language model in the stack, and this is the lowest cost use. Each request is stored in QuestionLog.
- **FR-30.** The feed is cached for 6 hours per member. The cache key includes the member id and the mood filter. Saving, editing or deleting an entry clears the member's feed. One automated test must prove that two members never share a cache key.

#### 6.5.1 Genre to mood table

The match is case insensitive on the iTunes primaryGenreName. The table lives in lib/genre-moods.ts. Any genre not listed, or a missing genre, has no seed moods.

| Genre | Seed moods |
|---|---|
| Pop | Energetic, Euphoric |
| Hip-Hop/Rap | Hype, Energetic |
| R&B/Soul | Chill, Nostalgic |
| Rock | Energetic, Hype |
| Alternative | Melancholic, Nostalgic |
| Electronic | Euphoric, Energetic |
| Dance | Euphoric, Hype |
| Jazz | Chill, Focused |
| Classical | Focused, Chill |
| Ambient | Chill, Focused |
| Country | Nostalgic, Chill |
| Latin | Energetic, Euphoric |
| Reggae | Chill, Euphoric |
| African, Afrobeats, Afropop | Energetic, Euphoric |
| Blues | Melancholic, Nostalgic |
| Singer/Songwriter | Melancholic, Chill |
| Soundtrack | Focused, Nostalgic |
| Gospel | Euphoric, Nostalgic |

### 6.6 Analytics and mood insights (revised)

- **FR-31.** Mood breakdown: a bar chart of entry share per mood. Range switch: 7 days, 30 days, 90 days, All.
- **FR-32.** Rating distribution: counts for 1 to 5 stars and the average rating. Top 5 artists and top 5 genres by entry count, each with average rating.
- **FR-33.** Habit metrics: entries per week, current streak of days with an entry, busiest hour of day in the member's time zone, most used listening context, and preview plays this week. ASSUMPTION A30: the ranges in FR-31, these five metrics, and a minimum of 5 entries before charts show (below that the screen shows 'N of 5 entries'). Reason: the idea says 'listening habit metrics' without a list, and charts on 1 or 2 entries mislead. Bars are drawn with plain SVG or CSS, with no chart library. Each chart has a 'Show as table' control. The Insights code loads only when the screen opens.

### 6.7 Community group

- **FR-34.** There is one group named Music Story Community. Every member joins at sign up. ASSUMPTION A31: one group with automatic join. Reason: the idea says 'a community group' and gives no creation flow.
- **FR-35.** Sharing is per entry and off by default. The toggle sits in the Journal Modal and on the entry, with the line 'Anyone in the group can read this note.' Turning it off removes the entry from the group feed. Deleting an entry deletes its share.
- **FR-36.** The group feed shows shared entries newest first, 20 per page. Each card shows display name, song, rating, moods, context and note, and a Report button. Nothing else about the member appears. Hidden shares do not appear.
- **FR-37.** Report asks for a reason (Illegal, Abuse, Private information, Other) and an optional note of up to 300 characters, and writes a ContentReport. A share with reports from 2 different members is hidden at once (hiddenAt is set). The founder reviews reports by SQL. ASSUMPTION A32: the Report button, hiding at 2 reports and the reason list. Reason: a feed of member posts needs a way to report and hide content, and the idea gives none. See Launch gates.

### 6.8 Offline, time and data

- **FR-38.** Settings, Privacy lists every item in the system data list in section 4, and states that notes never leave the database except to the group when shared. Settings, Time zone shows the zone taken from the browser at sign in and lets the member change it.
- **FR-39.** Offline, the app opens and shows the last cached Discover feed, Insights and the 20 most recent entries. Saving an entry offline puts it in a queue on the device and syncs when the connection returns (section 7.6). Offline search runs on a bundled list of 300 catalogue songs. ASSUMPTION A33: the 300 song list (about 35 KB gzipped). Reason: search must work offline, and the full catalogue would cost data.
- **FR-40.** Every cached bundle and every queued entry carries the member id. Sign out, a 401 answer and a device revoke wipe the Cache Storage and IndexedDB of the app. A queued entry whose member id differs from the signed in member is held, not sent, and the screen says so.
- **FR-41.** Every date and time is stored as UTC and sent as ISO 8601. The screen shows it in the member's time zone, saved in User.timezone.
- **FR-42.** While the app is visible, the client sends a heartbeat every 60 seconds, and one last time when the page closes (using sendBeacon [a browser call that sends data as a page unloads]). The server adds the active seconds to the open UsageSession. A heartbeat more than 5 minutes after the last one starts a new session. The founder uses this data only to run the product. It appears on the Privacy screen. ASSUMPTION A34: 60 seconds and the 5 minute gap rule. Reason: the idea lists time on the app as data to keep but gives no precision, and a daily cron job cannot close sessions on time (section 7.7).
- **FR-43.** Settings has Delete my account and Export my data. Both need a sign in within the last 10 minutes, or they ask the member to sign in again. Delete removes every row for the member at once, including shares and reports the member made. Export is a JSON file with entries, plays, platform connections, devices (no hashes) and group shares. ASSUMPTION A35: both buttons, the sign in check and the export contents. Reason: members in the UK and EU have a legal right to them, and the idea does not state them.
- **FR-44.** There is no payment code, no trial timer and no locked feature. Every member has tier FREE.

### 6.9 Non functional requirements

- **NFR-1.** Performance: the budgets in G4 apply. First load JavaScript is 150 KB gzipped or less per route. A build step fails if a route goes over.
- **NFR-2.** Accessibility: core flows (sign in, search, Journal Modal, journal list) meet WCAG 2.2 level AA [a standard for accessible web pages]. Stars are a radio group. Mood chips are toggle buttons. Text contrast is at least 4.5 to 1. ASSUMPTION A36: WCAG 2.2 AA for core flows only. Reason: the idea names no standard.
- **NFR-3.** Security: HTTPS only, a Content Security Policy [a rule that limits what scripts and images a page may load], the Strict-Transport-Security header, and cookies marked HttpOnly, Secure and SameSite Lax.
- **NFR-4.** Privacy pages: /privacy and /terms exist before launch. The founder supplies the text. See Open Questions.
- **NFR-5.** Failure records: jobs and outside calls that fail write a SystemEvent row, because Vercel keeps logs for only one hour on the free plan.

### 6.10 Tier access and daily limits

ASSUMPTION A37: The daily limits below. Reason: they keep free services inside their free limits (section 7.7) and block runaway use.

| Capability | FREE tier (all members) |
|---|---|
| Price | 0. No trial. No expiry |
| Entries saved per day | 30 |
| Uncached song searches per day | 200 |
| 'Why this?' requests per day | 10 |
| Reports sent per day | 10 |
| Linked devices | 5 |
| Community group sharing | Yes |
| Insights, Discover, mood carousels | Yes |

## 7. Technical Architecture with a Prisma Data Model

The stack is locked: Next.js with the App Router [the Next.js folder based routing system], TypeScript, Prisma [a library that lets TypeScript code read and write the database], PostgreSQL and pgvector [a PostgreSQL add on that stores and searches vectors]. Everything else in this section is added by me and obeys the free tier rule. Vendor plan facts were checked on 13 October 2026. The sources are listed in 7.7.

### 7.1 System diagram

```text
Browser (member's phone, Chrome or Safari)
  |  Service worker: app shell, cached JSON, offline queue (7.6)
  |  IndexedDB [a database inside the browser]: outbox, catalogue-lite
  v
Vercel Hobby (Next.js App Router, TypeScript)
  |  Middleware [code that runs before each request]: session cookie present check only
  |  Route handlers [files that answer /api/* URLs] and server components
  |  Better Auth: sign in and database sessions
  |  Next.js Data Cache: per member Discover and Insights bundles
  |  Vercel Cron: one maintenance job a day
  v                         v                          v
Neon PostgreSQL           iTunes Search API          Cloudflare Workers AI
(Prisma + pgvector)       (songs, art, previews)     (song embeddings, Why this sentence)
```

### 7.2 Request flow, browser to answer

Example: a member opens Discover.

1. The browser asks for /discover. The service worker shows the cached page at once if it has one for this member.
2. Middleware checks that a session cookie exists. If not, it sends the member to /signin. It does not read the database.
3. The page calls GET /api/discover.
4. The handler runs on the Node runtime. It asks Better Auth for the session and reads the member id from it. No valid session returns 401.
5. The handler looks in the Data Cache. The key is made of the member id and the mood filter. A hit returns the stored JSON.
6. On a miss the handler runs the taste vector query and the nearest songs query from section 9 inside one transaction, scores the 60 rows in TypeScript (FR-24), builds the feed and the carousels, and stores the JSON for 6 hours.
7. The handler returns the JSON with Cache-Control: private. The body is 50 KB gzipped or less.
8. The browser draws the cards. Album art loads lazily. 'Why this?' calls POST /api/discover/why only when tapped.

### 7.3 Auth with activation code, PIN and device linking

- Better Auth with its Prisma adapter and database sessions [sessions stored in the Session table, so a device can be revoked]. ASSUMPTION A40: Better Auth, not Auth.js. Reason: Auth.js is in security fix only mode and its own maintainers advise new projects to use Better Auth.
- Run the library's generate command for Prisma, then merge its output with the schema in 7.8. Keep the model names User, Session, Account and Verification. Re-run it after any plugin change.
- Added User fields: displayName, timezone, tier, ageConfirmedAt. A database hook sets displayName from the provider name at first sign in. The member can change it on the Profile screen. The provider picture is not saved.
- Added Session field: deviceId. The app sets a cookie named ms_device (HttpOnly) with a random id. A session create hook reads it and attaches the matching Device. If the cookie is missing or the device is revoked, the hook creates a new Device and the response sets a new cookie. If the hook cannot read cookies, create the Device in the first authenticated route instead.
- Raw IP storage: the app never stores a raw IP address. Turn off the library's IP and user agent capture on sessions if it offers that option. If it does not, a session create hook replaces the IP with its salted hash before the write. ASSUMPTION A45: salted IP hashes only. Reason: lockout needs an IP key, and privacy needs no raw IP. Build gate: after the first test sign in, read the Session row and confirm no raw IP is stored.
- The code is 8 random characters from the Crockford base32 alphabet, drawn with crypto.randomInt. The server saves codeHash, an HMAC-SHA-256 [a keyed one way hash] of the code, using a secret in the environment variable CODE_PEPPER. The PIN is saved as pinHash with argon2id [a slow password hash].
- POST /api/device/code issues a code. The first call sets the PIN. Later calls need the current PIN. A new code sets supersededAt on any older unused code.
- POST /api/device/activate takes code and pin. (1) If the IP hash has 20 or more failed attempts in the last 15 minutes, write IP_BLOCKED and return 429. (2) Find the code by codeHash where usedAt and supersededAt are null. None found writes WRONG_CODE. (3) If lockedUntil is in the future, write CODE_LOCKED and return 429. (4) Check the PIN. A mismatch adds 1 to failedPins, writes WRONG_PIN, and at 5 sets lockedUntil to 15 minutes from now. (5) In one transaction, set usedAt, create the Device, create the session through the library's internal adapter, and write SUCCESS. (6) Set the session cookie with the library's cookie helper. This is the only place the app uses library internals. Build gate: prove it works on the installed version before other work.
- A member who loses every device and the PIN signs in again with Google, GitHub or Discord and issues a new code.

### 7.4 API endpoints

All endpoints need a session unless marked Public. All bodies are JSON validated with Zod [a TypeScript checking library, open source].

| Method and path | Purpose | Notes |
|---|---|---|
| /api/auth/* | Better Auth sign in and sign out | Public |
| POST /api/device/activate | Link a device with code and PIN | Public, rate limited (FR-6) |
| POST /api/device/code | Issue an activation code | First call sets the PIN |
| DELETE /api/devices/[id] | Revoke a device | |
| GET /api/songs/search?q= | Search iTunes, fall back to catalogue | Counts toward the daily search limit |
| POST /api/songs/manual | Add a song by hand | FR-14 |
| GET /api/songs/[id] | One song with 600 px art | |
| POST /api/entries | Create entry, idempotent on clientId | Counts toward the daily entry limit |
| GET /api/entries?cursor=&mood=&minRating=&context=&q= | List and filter own entries, 20 a page | FR-21, FR-22 |
| PATCH and DELETE /api/entries/[id] | Edit or delete | |
| POST /api/plays | Record a preview play | |
| POST /api/connections | Start the demo simulation | |
| POST /api/connections/[platform]/complete | Finish with allow, cancel or timeout | |
| DELETE /api/connections/[platform] | Disconnect | |
| GET /api/discover?mood= | Feed and carousels | Data Cache 6 hours |
| POST /api/discover/why | One sentence for one song | Daily limit, FR-29 |
| GET /api/insights?range= | Charts and habit metrics | Data Cache 1 hour |
| POST /api/sessions/heartbeat | Add active seconds | FR-42 |
| GET /api/community/feed?cursor= | Group feed | |
| POST and DELETE /api/community/shares | Share or unshare an entry | |
| POST /api/community/reports | Report a shared entry | FR-37 |
| PATCH /api/me | Change display name or time zone | |
| GET /api/me/export and DELETE /api/me | Export and delete | FR-43 |
| GET /api/cron/maintenance | Daily job | Needs the Authorization header with CRON_SECRET |

### 7.5 Caching for small data bundles

| Bundle | Max size gzipped | Server cache | Browser cache |
|---|---|---|---|
| Recent entries (20) | 25 KB | None | Stale while revalidate [show the old copy, fetch a new one in the background] |
| Discover feed and carousels | 50 KB | Data Cache, key = member id + mood filter, 6 hours | Stale while revalidate |
| Insights, per range | 15 KB | Data Cache, key = member id + range, 1 hour | Stale while revalidate |
| Search results | 20 KB | SearchCache table, 24 hours | Network first |
| catalogue-lite.json (300 songs) | 35 KB | Static file, version in file name | Precached |
| Album art (100 px) | 5 KB each | Apple CDN | Cache first, up to 100 images, 7 days |

Saving, editing or deleting an entry calls revalidateTag [clears a cache tag] for the member's Discover tag and every Insights tag. Tags carry the member id. The cache key, not the tag, keeps members apart. FR-30 requires a test for it. ASSUMPTION A44: 24 hours for the search cache. Reason: song data rarely changes and it protects the iTunes limit.

### 7.6 Offline behaviour

- The service worker is built with Serwist [an open source service worker toolkit]. It precaches the app shell and catalogue-lite.json. ASSUMPTION A42: Serwist, with a fallback. Reason: it is free and made for Next.js, but I did not verify it against the current Next.js build tool. Build gate: prove offline save and sync on Chrome Android and Safari iOS before feature work. If Serwist fails, hand write a small service worker for the app shell only.
- Offline reads: Discover, Insights, the 20 latest entries and any seen album art open from cache, for the signed in member only (FR-40). A banner says 'Offline. Showing saved data.'
- Offline writes: only new entries. The client saves them in the IndexedDB store outbox with the member id, clientId, payload and the device time as listenedAt.
- Sync: the client sends the outbox when the browser fires the online event and when the app opens. Chrome also uses Background Sync [a Chrome feature that retries in the background]. Safari on iPhone has no Background Sync, so a Safari member syncs on open and on the online event only. The server answers a repeated clientId with the existing entry (FR-19).
- A queued entry that the server rejects (for example a missing field) stays in the list marked Needs fix, with an Edit button. Nothing is dropped silently.
- Offline, these are disabled with a one line reason: live search, filter, preview playback, Connect modal, edit and delete.

### 7.7 Hosting and free tier choices

ASSUMPTION A38: I picked every service below. Facts marked Checked come from the vendor pages listed under Sources on 13 October 2026. Facts marked Not checked are my estimates and must be measured. Reason: the brief leaves hosting and services to me.

ASSUMPTION A39: At 400 members I assume 20% are active on a given day (80 members), each saves 2 entries on an active day, each member visits 20 times a month (8,000 visits), and a function call uses 50 ms of Active CPU. That gives 4,800 entries and about 170,000 function calls a month. Reason: the idea gives no usage numbers.

| Piece | Exact name | Free limit | Reached at 400 members? |
|---|---|---|---|
| Hosting, cron, caching | Vercel Hobby | Checked: 100 GB data transfer, 1 million function calls and 4 hours of Active CPU a month. Non commercial use only. Cron runs once a day and may fire any time inside the scheduled hour. Runtime logs are kept for 1 hour | No, but CPU is the first limit: about 2.4 of 4 hours (Not checked, from A39). The limit is reached near 650 members. Transfer is about 3 GB |
| Database and vector store | Neon Free, PostgreSQL with pgvector | Checked: 100 compute hours and 0.5 GB storage per project a month. Compute sleeps after 5 idle minutes. Restore window is 6 hours | No. Compute: at most about 40 hours. Storage: about 12 MB a month, so full in about 3 years (Not checked, measure after month 3) |
| Sign in | Better Auth | Checked: open source, MIT licence, no usage limit | No |
| Embeddings and language model | Cloudflare Workers AI, free plan | Checked: 10,000 neurons [Cloudflare's unit of AI compute] a day at no charge. The embedding model costs 6,058 neurons per million input tokens. Requests can fail with an out of capacity error | No. Embeddings use under 1 neuron a day. The sentence model price per call is Not checked: measure in week 1 and alert at 70% of the daily allowance |
| Song data | iTunes Search API | Checked: about 20 calls a minute. Apple asks large sites to cache | Possible at peak. FR-11 sets a server limit, a cache and a fallback |
| Speed data | Vercel Speed Insights | Not checked. Set sampleRate to 0.25 | Unknown. If over the limit, drop the metric and send web vitals to our own endpoint |
| Offline support | Serwist | Open source | No |
| PIN hashing | @node-rs/argon2 | Open source | No |
| File storage | None needed. Art loads from Apple image URLs and members upload nothing | Not applicable | Not applicable |
| Background jobs | Vercel Cron, one job a day, and Next.js after() [runs code after the reply is sent] | Included in Hobby | No |

Sources, all read on 13 October 2026:

- Vercel limits: https://vercel.com/docs/limits and https://vercel.com/docs/cron-jobs/usage-and-pricing
- Neon plans: https://neon.com/pricing
- Cloudflare Workers AI pricing and data use: https://developers.cloudflare.com/workers-ai/platform/pricing/ and https://developers.cloudflare.com/workers-ai/privacy/
- Apple Search API: https://performance-partners.apple.com/search-api
- Gemini API terms: https://ai.google.dev/gemini-api/terms
- Auth library status: https://www.turbostarter.dev/blog/better-auth-vs-clerk-vs-nextauth-vs-supabase-auth

The daily job runs once. It may start any time inside its scheduled hour, so nothing may depend on its exact time. It does five things. It embeds iTunes songs that lack a vector. It deletes SearchCache rows past expiresAt. It deletes LoginAttempt rows older than 90 days and SystemEvent rows older than 30 days. It rebuilds the crowd moods on song vectors (FR-26). It writes a SystemEvent of kind CRON_FAIL for any step that fails. ASSUMPTION A46: 90 days for LoginAttempt and 30 days for SystemEvent. Reason: long enough to investigate abuse, short enough to limit stored data.

### 7.8 Operations

- Region: set the Vercel function region and the Neon region to the closest available to London. ASSUMPTION A41: London. Reason: the founder is in England and the persona is in Lagos, and the free regions do not include West Africa.
- Backups: Neon Free restores only within 6 hours. The founder runs a manual pg_dump once a month and keeps the file off the platform. ASSUMPTION A48: a monthly manual dump. Reason: no free automatic backup covers more than 6 hours.
- Versions: pin exact versions at project start and write them in the README. Prisma 6 (the schema below uses its syntax), the current Node LTS and the current stable Next.js. ASSUMPTION A47: these pins. Reason: Prisma moved connection settings in later major versions, and an unpinned install can break the schema.
- Failures: every failed job or outside call writes a SystemEvent (NFR-5).

### 7.9 Prisma schema

ASSUMPTION A43: QuestionLog stores each 'Why this?' request and its answer. Reason: the brief asks for question logs and the idea names no other place where members ask questions.

The Better Auth models follow its default Prisma output. Re-run its generate command and reconcile any difference before the first migration.

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
  extensions = [vector, pg_trgm]
}

enum Tier { FREE }
enum Mood { ENERGETIC CHILL MELANCHOLIC FOCUSED EUPHORIC NOSTALGIC HYPE }
enum Platform { SPOTIFY APPLE_MUSIC YT_MUSIC TIDAL AUDIOMACK BANDCAMP }
enum ConnectionStatus { NOT_CONNECTED CONNECTED ERROR }
enum ConnectionIssueType { CANCELLED TIMEOUT NETWORK }
enum LoginMethod { GOOGLE GITHUB DISCORD ACTIVATION_CODE }
enum LoginOutcome { SUCCESS WRONG_CODE WRONG_PIN CODE_LOCKED IP_BLOCKED PROVIDER_ERROR }
enum SongSource { ITUNES OFFLINE_SEED MANUAL }
enum PlayOrigin { SEARCH DISCOVER JOURNAL GROUP }
enum QuestionKind { WHY_THIS }
enum QuestionStatus { OK ERROR RATE_LIMITED INVALID_OUTPUT TEMPLATE_FALLBACK }
enum CounterKind { ENTRY SEARCH WHY_THIS REPORT }
enum ReportReason { ILLEGAL ABUSE PRIVATE_INFO OTHER }
enum SystemEventKind { SEARCH_FALLBACK EMBED_FAIL LLM_FAIL CRON_FAIL SAVE_TIMING OTHER }

model User {
  id             String    @id
  name           String
  email          String    @unique
  emailVerified  Boolean   @default(false)
  image          String?
  displayName    String    @default("") @db.VarChar(40)
  timezone       String    @default("UTC") @db.VarChar(64)
  tier           Tier      @default(FREE)
  ageConfirmedAt DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  sessions         Session[]
  accounts         Account[]
  devices          Device[]
  activationCodes  ActivationCode[]
  loginAttempts    LoginAttempt[]
  connections      PlatformConnection[]
  connectionIssues ConnectionIssue[]
  manualSongs      Song[]
  entries          JournalEntry[]
  plays            PlayEvent[]
  usageSessions    UsageSession[]
  questionLogs     QuestionLog[]
  memberships      GroupMember[]
  shares           GroupShare[]
  reports          ContentReport[]
  counters         UsageCounter[]
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  deviceId  String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  device    Device?  @relation(fields: [deviceId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([deviceId])
  @@index([expiresAt])
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
}

model Device {
  id               String          @id @default(cuid())
  userId           String
  label            String          @db.VarChar(60)
  userAgent        String?         @db.VarChar(300)
  activationCodeId String?         @unique
  createdAt        DateTime        @default(now())
  lastSeenAt       DateTime        @default(now())
  revokedAt        DateTime?
  user             User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  activationCode   ActivationCode? @relation(fields: [activationCodeId], references: [id])
  sessions         Session[]

  @@index([userId])
}

model ActivationCode {
  id           String    @id @default(cuid())
  userId       String
  codeHash     String    @unique @db.VarChar(64)
  pinHash      String    @db.VarChar(255)
  failedPins   Int       @default(0)
  lockedUntil  DateTime?
  issuedAt     DateTime  @default(now())
  usedAt       DateTime?
  supersededAt DateTime?
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  device       Device?

  @@index([userId, supersededAt])
}

model LoginAttempt {
  id               String       @id @default(cuid())
  userId           String?
  activationCodeId String?
  ipHash           String       @db.VarChar(64)
  method           LoginMethod
  outcome          LoginOutcome
  createdAt        DateTime     @default(now())
  user             User?        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([ipHash, createdAt])
  @@index([userId, createdAt])
}

model PlatformConnection {
  id             String           @id @default(cuid())
  userId         String
  platform       Platform
  status         ConnectionStatus @default(NOT_CONNECTED)
  handle         String?          @db.VarChar(60)
  simulated      Boolean          @default(true)
  connectedAt    DateTime?
  disconnectedAt DateTime?
  updatedAt      DateTime         @updatedAt
  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, platform])
}

model ConnectionIssue {
  id         String              @id @default(cuid())
  userId     String
  platform   Platform
  type       ConnectionIssueType
  message    String              @db.VarChar(300)
  simulated  Boolean             @default(true)
  createdAt  DateTime            @default(now())
  resolvedAt DateTime?
  user       User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([platform, createdAt])
}

model Song {
  id              String      @id @default(cuid())
  itunesTrackId   Int?        @unique
  title           String      @db.VarChar(300)
  artist          String      @db.VarChar(300)
  album           String?     @db.VarChar(300)
  genre           String?     @db.VarChar(60)
  releaseYear     Int?
  durationMs      Int?
  artworkUrl      String?
  previewUrl      String?
  trackViewUrl    String?
  source          SongSource
  createdByUserId String?
  inCatalogue     Boolean     @default(false)
  seedMoods       Mood[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  createdBy       User?       @relation(fields: [createdByUserId], references: [id], onDelete: Cascade)
  vector          SongVector?
  entries         JournalEntry[]
  plays           PlayEvent[]

  @@index([artist])
  @@index([genre])
  @@index([inCatalogue])
  @@index([createdByUserId])
}

model SongVector {
  songId       String   @id
  tier         Tier     @default(FREE)
  moods        Mood[]
  genre        String?  @db.VarChar(60)
  modelVersion String   @db.VarChar(40)
  embedding    Unsupported("vector(768)")?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  song         Song     @relation(fields: [songId], references: [id], onDelete: Cascade)

  @@index([tier])
}

model SearchCache {
  id        String     @id @default(cuid())
  queryKey  String     @unique @db.VarChar(120)
  songIds   String[]
  source    SongSource
  fetchedAt DateTime   @default(now())
  expiresAt DateTime

  @@index([expiresAt])
}

model JournalEntry {
  id         String      @id @default(cuid())
  clientId   String      @db.VarChar(36)
  userId     String
  songId     String
  rating     Int
  moods      Mood[]
  context    String?     @db.VarChar(40)
  note       String?     @db.VarChar(2000)
  origin     PlayOrigin  @default(SEARCH)
  listenedAt DateTime
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  song       Song        @relation(fields: [songId], references: [id], onDelete: Cascade)
  share      GroupShare?

  @@unique([userId, clientId])
  @@index([userId, listenedAt(sort: Desc), id])
  @@index([userId, songId])
  @@index([songId])
}

model PlayEvent {
  id       String     @id @default(cuid())
  userId   String
  songId   String
  origin   PlayOrigin
  playedAt DateTime
  playedMs Int
  user     User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  song     Song       @relation(fields: [songId], references: [id], onDelete: Cascade)

  @@index([userId, playedAt(sort: Desc)])
  @@index([songId])
}

model UsageSession {
  id              String    @id @default(cuid())
  userId          String
  deviceId        String?
  startedAt       DateTime  @default(now())
  lastHeartbeatAt DateTime  @default(now())
  endedAt         DateTime?
  activeSeconds   Int       @default(0)
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, startedAt])
}

model QuestionLog {
  id        String         @id @default(cuid())
  userId    String
  kind      QuestionKind
  songId    String?
  question  String         @db.VarChar(500)
  answer    String?        @db.VarChar(500)
  model     String         @db.VarChar(60)
  status    QuestionStatus
  latencyMs Int
  createdAt DateTime       @default(now())
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([status, createdAt])
}

model Group {
  id        String        @id @default(cuid())
  name      String        @unique @db.VarChar(60)
  createdAt DateTime      @default(now())
  members   GroupMember[]
  shares    GroupShare[]
}

model GroupMember {
  groupId  String
  userId   String
  joinedAt DateTime @default(now())
  group    Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([groupId, userId])
  @@index([userId])
}

model GroupShare {
  id       String          @id @default(cuid())
  groupId  String
  entryId  String          @unique
  userId   String
  sharedAt DateTime        @default(now())
  hiddenAt DateTime?
  group    Group           @relation(fields: [groupId], references: [id], onDelete: Cascade)
  entry    JournalEntry    @relation(fields: [entryId], references: [id], onDelete: Cascade)
  user     User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  reports  ContentReport[]

  @@index([groupId, sharedAt(sort: Desc)])
}

model ContentReport {
  id         String       @id @default(cuid())
  shareId    String
  reporterId String
  reason     ReportReason
  note       String?      @db.VarChar(300)
  createdAt  DateTime     @default(now())
  share      GroupShare   @relation(fields: [shareId], references: [id], onDelete: Cascade)
  reporter   User         @relation(fields: [reporterId], references: [id], onDelete: Cascade)

  @@unique([shareId, reporterId])
  @@index([createdAt])
}

model UsageCounter {
  userId String
  day    DateTime    @db.Date
  kind   CounterKind
  count  Int         @default(0)
  user   User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([userId, day, kind])
}

model SystemEvent {
  id        String          @id @default(cuid())
  kind      SystemEventKind
  message   String          @db.VarChar(300)
  valueInt  Int?
  createdAt DateTime        @default(now())

  @@index([kind, createdAt])
}
```

Deleting an ITUNES or OFFLINE_SEED song would delete its entries. Never delete those rows. The cascade exists so a deleted member's manual songs go with them.

### 7.10 Database changes Prisma cannot write

Add these by hand in the first migration file (prisma migrate dev --create-only, then edit the SQL).

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "JournalEntry" ADD CONSTRAINT entry_rating_range CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE "JournalEntry" ADD CONSTRAINT entry_moods_count CHECK (cardinality(moods) BETWEEN 1 AND 3);

CREATE INDEX song_title_trgm  ON "Song" USING gin (title gin_trgm_ops);
CREATE INDEX song_artist_trgm ON "Song" USING gin (artist gin_trgm_ops);

CREATE INDEX songvector_moods_gin ON "SongVector" USING gin (moods);
CREATE INDEX songvector_hnsw ON "SongVector"
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```

The trigram indexes [indexes that speed up partial text matches] serve the offline catalogue search and the journal text filter (FR-22). The listened at bounds in FR-15 are checked in code, not in the database, because a rule based on the current time breaks later edits.

### 7.11 Data model summary

| Brief asks for | Where it lives | Key fields |
|---|---|---|
| Users | User, Account, Session, Device | email, displayName, timezone, tier |
| Streaming platforms used | PlatformConnection | platform, status, handle, simulated |
| Text content | JournalEntry | note, context, moods, rating, listenedAt |
| Audio content | Song, PlayEvent | previewUrl, artworkUrl, trackViewUrl, playedAt, playedMs |
| Time spent on the app | UsageSession | startedAt, lastHeartbeatAt, activeSeconds |
| Login attempts | LoginAttempt | method, outcome, ipHash, createdAt |
| Issues connecting platforms | ConnectionIssue | platform, type, message, simulated |
| Question logs | QuestionLog | question, answer, model, status, latencyMs |
| Activation code and PIN | ActivationCode, Device | codeHash, pinHash, failedPins, lockedUntil |
| Community group | Group, GroupMember, GroupShare, ContentReport | entryId, hiddenAt, reason |
| Daily limits | UsageCounter | day, kind, count |
| Search cache | SearchCache | queryKey, songIds, expiresAt |
| Vectors | SongVector | songId, moods, genre, tier, embedding |
| Failure and timing records | SystemEvent | kind, message, valueInt |

### 7.12 Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Apple terms limit previews and art to promoting store content | Search results lose art and audio | Medium | Apple Music badge beside every preview (FR-12). Launch gate LG-1. Fallback: ship text only |
| iTunes limits or terms change | Search fails | Medium | SearchCache, offline catalogue, manual add, server limit (FR-11, FR-14) |
| Neon wakes slowly after 5 idle minutes | First load is slower | High | Cold and warm targets in G4. Cached bundles paint first |
| Vercel Active CPU limit (4 hours) | Site stops near 650 members | Medium | Watch usage monthly. Cut heartbeat calls first (FR-42) |
| Vercel Hobby bars commercial use | Must move host if the product earns money | Medium | Open Question Q13 |
| Shared carrier IP locks out linking | Members cannot link devices | Medium | Per code lock first, high per IP limit (FR-6) |
| Workers AI out of capacity or daily neurons used up | No Why this sentence | Medium | Template sentence (FR-29). SystemEvent LLM_FAIL |
| Workers AI retires the chosen model | Calls fail | Medium | Model ids live in one file (8.6). Template covers the gap |
| Better Auth internal call changes | Device linking breaks | Medium | Build gate in 7.3. One route touches internals |
| Serwist does not fit the Next.js build | No offline support | Medium | Build gate in 7.6. Hand written shell worker fallback |
| Shared notes hold abuse or private data | Harm to members | Medium | Off by default, warning line, Report, auto hide (FR-35, FR-37). LG-2 |
| Members think a demo connection is real | Loss of trust | Medium | Label in every step of the modal (FR-7) |
| Song text embeddings give weak taste matches | Discover feels random | Medium | Mood and genre parts in the score (FR-24). Tune weights after launch |
| Member text reaches an outside AI service | Breaks the privacy promise | Low | Rules AI-1 to AI-8 in 8.6 and the boundary test LG-6 |
| Data lost, with only 6 hours of restore | Journals gone | Low | Monthly manual dump (7.8) |

## 8. Vector Database Architecture and Design

### 8.1 Choice: pgvector inside the Neon PostgreSQL database

The vector store is pgvector, running in the same Neon Free database as everything else. ASSUMPTION A49: pgvector on Neon. Reason: the stack locks PostgreSQL and pgvector, and this adds no new service.

Why it fits the locked stack:

- It is part of PostgreSQL. No new vendor, no new bill, no new login.
- Neon Free includes it. It uses the same 0.5 GB of storage as the rest of the data.
- A vector row has a real foreign key to its Song. Deleting a song deletes its vector.
- One connection string and one backup cover everything.

The cost is that Prisma cannot read or write a vector column. Section 9.4 shows how the code handles that with raw SQL.

Volume at 400 members: 1,500 catalogue vectors plus a few hundred new iTunes songs a month. Each vector takes about 3 KB. Entries are not embedded.

### 8.2 What is embedded

An embedding [a list of numbers that captures the meaning of a text, so similar texts get similar lists] is made only for songs, only from public song data. No member text is ever embedded.

| Source | Text sent to the embedding model |
|---|---|
| Song with source ITUNES or OFFLINE_SEED | {title} by {artist}. Album: {album}. Genre: {genre}. Year: {year}. |
| Song with source MANUAL | Never embedded |

ASSUMPTION A50: Cloudflare Workers AI model @cf/baai/bge-base-en-v1.5, which returns 768 numbers per text, with the template above. The server divides each vector by its length (L2 normalisation) before storing. The seed script sends texts in batches of 50. Reason: the model is free on the Workers AI free plan, matches the schema size, and does not need member data. I did not verify the batch limit. Check it when you write the seed script.

### 8.3 How the vectors are used

- The taste vector is the average of the song vectors for songs the member rated 4 or 5 in the last 90 days, with a 5 counted twice (FR-25). It is computed by one SQL query from the member's own entries. It is never stored.
- Discover finds the song vectors nearest to the taste vector (FR-23, FR-24).
- There is no search over entries and no vector of any entry.

ASSUMPTION A55: iterative scan. If the installed pgvector is older than 0.8, remove the two SET LOCAL hnsw lines that mention iterative scan, and raise hnsw.ef_search to 200. Reason: iterative scan needs pgvector 0.8, and I did not verify the version Neon runs. See LG-7.

### 8.4 Write and delete paths

1. The seed script embeds the 1,500 catalogue songs once and writes their vectors.
2. When a member journals an ITUNES song that has no vector, the save handler runs embedding through Next.js after(), so the save is not slowed. If the call fails, it writes a SystemEvent of kind EMBED_FAIL. The daily job retries every ITUNES song without a vector.
3. A MANUAL song never gets a vector.
4. Deleting a Song deletes its vector (cascade).
5. Changing the model or the template means a new modelVersion value, then re-embedding every row.

### 8.5 Query rules

- Every query on song vectors carries tier = 'FREE'. ASSUMPTION A54: the tier filter is on every query even though only one tier exists. Reason: a future paid tier then needs no query change.
- Every query excludes songs with source MANUAL.
- The taste query reads only the signed in member's own entries. The member id comes from the session, never from the request body.
- The nearest songs query runs inside a transaction so the SET LOCAL settings apply to it.

### 8.6 Language model and the member text rule

#### 8.6.1 Vendor decision

Use Cloudflare Workers AI on its free plan for both the embeddings (8.2) and the Why this sentence (FR-29). Keep the template sentence as the fallback and as the launch setting if any launch gate fails.

| Option | Cost | Member text and terms | Verdict |
|---|---|---|---|
| Cloudflare Workers AI, free plan | Free up to 10,000 neurons a day (Checked) | Checked: Cloudflare does not use customer content to train models or to improve its services without consent. No region ban found on the pages read. Confirm at launch (LG-6 covers the data boundary) | Use |
| Gemini API, free tier | Free (Checked) | Checked: free tier content may be used to improve Google products. Only paid services may be used when the app is available to users in the EEA, Switzerland or the United Kingdom | Do not use. The founder is in England and Q10 is open |
| Gemini API with billing turned on | Not free by the brief's rule | Checked: turning on billing moves data use to the paid terms. Not checked: whether free quota stays free | Do not use unless the founder drops the free rule |
| Template sentence only | Free | No data leaves | Fallback and launch setting |

ASSUMPTION A51: Cloudflare Workers AI for the Why this sentence, with model @cf/meta/llama-3.2-3b-instruct. Reason: it is a small model on the free plan, and its terms fit the member text rule. I did not verify that this model is still offered or its price per call. Check the model list at build time. Cloudflare retires models over time, so the model id lives in one file.

#### 8.6.2 The member text rule: allow list, not filter

The safest way to keep member text away from any model is to never give the model code a path to it. A filter that tries to remove member text from a bigger object can miss a field added later. An allow list cannot. The rules below build the allow list.

ASSUMPTION A52: AI code lives in three files: lib/ai/config.ts (model ids and limits), lib/ai/facts.ts (builds the facts) and lib/ai/client.ts (the only caller of the vendor). Reason: one place for each job makes the boundary easy to test and review.

- **AI-1.** Only lib/ai/client.ts may call Cloudflare Workers AI. No other file may contain the vendor URL or token. A test greps the source for this.
- **AI-2.** Embedding input is built only from Song title, artist, album, genre and year, for songs with source ITUNES or OFFLINE_SEED.
- **AI-3.** The sentence prompt is built only by buildWhyFacts in lib/ai/facts.ts. It returns a fixed shape made of the fields in 8.6.3 and nothing else.
- **AI-4.** The client function accepts only the facts type. It does not accept a string or an object of another shape. Every text field in the facts is a Song column from an allowed source or a value from a fixed list.
- **AI-5.** Text a member types is never a field of the facts. That means: note, custom context, display name, manual song title and artist, report note, demo connection handle, and email.
- **AI-6.** The facts hold no member id and no entry id. QuestionLog.question holds the song id and the counts, not the prompt.
- **AI-7.** Output goes through the checks in 8.6.5 before any member sees it.
- **AI-8.** The boundary test in 8.6.6 runs on every change and must pass before merge.
- **AI-9.** The Privacy screen states what is sent: public song facts and averaged numbers. It states that notes are never sent (FR-38).

#### 8.6.3 Facts the sentence model may receive

| Field | Source | Type | Why it is safe |
|---|---|---|---|
| song_title | Song.title, source ITUNES or OFFLINE_SEED | text | Public data from Apple |
| artist | Song.artist, same sources | text | Public data from Apple |
| genre | Song.genre | text | Public data from Apple |
| song_moods | SongVector.moods | list of the 7 mood names | Fixed list |
| your_top_moods | Counted from the member's entries | up to 3 mood names with a whole number percent | Fixed list and numbers |
| your_average_rating_in_this_genre | Averaged from the member's entries | number or none | Number |
| match_count | Counted from the member's entries | whole number | Number |
| similar_liked_song | A liked song with source ITUNES or OFFLINE_SEED | title and artist, or none | Public data from Apple. Sent with no member id |

#### 8.6.4 System prompt

Sent with temperature 0.3 and a limit of 60 output tokens.

```text
You write one short sentence that tells a music app member why a song was suggested to them.
Use only the facts in the FACTS block. Do not add facts. Do not name any person.
Write one sentence of 25 words or fewer. Write in plain English and use 'you'.
Do not use em dashes, emojis, hashtags, links or quotation marks.
If FACTS gives no reason, write: This song fits the moods you log most.
Output the sentence and nothing else.
```

User message sent with it:

```text
FACTS
song_title: {title}
artist: {artist}
genre: {genre}
song_moods: {moods}
your_top_moods: {top three moods with percent share}
your_average_rating_in_this_genre: {number or none}
match_count: {number}
similar_liked_song: {title and artist, or none}
```

#### 8.6.5 Output checks and fallback

- The server accepts the sentence only if it is one sentence, has 25 words or fewer, and has no quotation mark, link or at sign. Otherwise it uses the template from FR-29 and stores status INVALID_OUTPUT.
- The call times out after 5 seconds. There is no retry. ASSUMPTION A56: a 5 second timeout and no retry. Reason: a retry would spend free neurons and slow the card.
- Any other failure (an error answer, an out of capacity answer, the daily allowance used up) uses the template, writes a SystemEvent of kind LLM_FAIL and stores status ERROR or TEMPLATE_FALLBACK.
- The limit of 10 requests a day per member is counted in UsageCounter (kind WHY_THIS). Past the limit the template is used and the status is RATE_LIMITED.

#### 8.6.6 Boundary test

One automated test, run on every change.

1. Create a test member with these values: display name CANARY_NAME_7f3a, email canary7f3a@example.test, note CANARY_NOTE_7f3a, custom context CANARY_CTX_7f3a, demo connection handle CANARY_HANDLE_7f3a, and a manual song titled CANARY_SONG_7f3a.
2. Replace fetch so it records the URL, headers and body of every outbound request to the vendor host.
3. Run these steps: save entries with every canary value, request Discover, request Why this for 3 songs, and run the daily job.
4. Fail the test if any recorded body or header contains the text CANARY, the member id or the email.
5. Fail the test if any source file other than lib/ai/client.ts contains the vendor host name.

## 9. Vector Database Model

### 9.1 Table: SongVector

| Column | Type | Null | Notes |
|---|---|---|---|
| songId | text | No | Primary key. Foreign key to Song.id. Cascade on delete |
| tier | enum Tier | No | FREE. Default FREE |
| moods | enum Mood[] | No | Seed moods plus crowd moods (FR-26). Empty array allowed |
| genre | varchar(60) | Yes | Copied from Song.genre |
| modelVersion | varchar(40) | No | cf-bge-base-en-v1.5:768:v1 |
| embedding | vector(768) | Yes | 768 float32 numbers, about 3 KB, L2 normalised. Null until embedded |
| createdAt | timestamptz | No | Default now() |
| updatedAt | timestamptz | No | Set on every update |

### 9.2 Metadata keys and allowed values

| Key | Allowed values |
|---|---|
| songId | A Song.id whose source is ITUNES or OFFLINE_SEED. Never MANUAL |
| tier | FREE (the only value today) |
| moods | Any of ENERGETIC, CHILL, MELANCHOLIC, FOCUSED, EUPHORIC, NOSTALGIC, HYPE. 0 to 7 values |
| genre | Text up to 60 characters from Apple, or null |
| modelVersion | cf-bge-base-en-v1.5:768:v1. Change the suffix when the model or template changes, then re-embed every row |

No key holds member text, a member id or an entry id.

### 9.3 Indexes

| Index | Type and parameters | Used by |
|---|---|---|
| songvector_hnsw | HNSW [a graph index for fast nearest neighbour search], vector_cosine_ops, m = 16, ef_construction = 64. Query setting hnsw.ef_search = 100 | Nearest songs for Discover |
| songId | Primary key B-tree | Upsert, join, cascade |
| tier | B-tree | Tier filter |
| songvector_moods_gin | GIN | Mood filter with the && operator |

ASSUMPTION A53: HNSW with m = 16, ef_construction = 64 and ef_search = 100. Reason: m and ef_construction are the pgvector defaults, and a higher ef_search keeps results full after the mood filter. Distance is cosine, written <=> in SQL. Similarity is 1 minus distance.

### 9.4 How Prisma handles the vector column

- The column is declared as Unsupported("vector(768)")? in schema.prisma, with the postgresqlExtensions preview feature and extensions = [vector]. Prisma creates the column and tracks it, but the generated client has no field for it.
- The column is optional so prisma.songVector.create() and update() still work for every other field.
- Writing and reading the vector uses prisma.$executeRaw and prisma.$queryRaw with Prisma.sql [a tagged template that sends values as safe parameters, never as joined text]. The vector goes in as a string such as [0.01,-0.04,...] cast with ::vector.
- The HNSW index, the GIN index and the check constraints are hand written in the migration (section 7.10). If Prisma reports them as drift [a mismatch between schema and database], keep them in the migration SQL and never run prisma db push on production.

### 9.5 Example insert

Example row, with the vector shortened:

```json
{
  "songId": "clx9k2m0a0001",
  "tier": "FREE",
  "moods": ["ENERGETIC", "EUPHORIC"],
  "genre": "Afrobeats",
  "modelVersion": "cf-bge-base-en-v1.5:768:v1",
  "embedding": "[0.0132, -0.0471, 0.0089, ... 765 more numbers]"
}
```

Code that makes the embedding. The answer shape is from my reading of the docs. Check it against the current docs.

```typescript
// lib/ai/client.ts (the only file that calls the vendor)
import { EMBED_MODEL } from './config';

function l2(v: number[]): number[] {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / n);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${EMBED_MODEL}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: texts }),
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!res.ok) throw new Error('embed_failed:' + res.status);
  const json = await res.json();
  return (json.result.data as number[][]).map(l2);
}
```

Code that writes the vector:

```typescript
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function upsertSongVector(
  songId: string,
  moods: string[],
  genre: string | null,
  vec: number[], // 768 numbers, already L2 normalised
) {
  const literal = '[' + vec.join(',') + ']';
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "SongVector"
      ("songId", tier, moods, genre, "modelVersion", embedding, "createdAt", "updatedAt")
    VALUES
      (${songId}, 'FREE'::"Tier", ${moods}::text[]::"Mood"[], ${genre},
       'cf-bge-base-en-v1.5:768:v1', ${literal}::vector, now(), now())
    ON CONFLICT ("songId") DO UPDATE SET
      moods = EXCLUDED.moods,
      genre = EXCLUDED.genre,
      "modelVersion" = EXCLUDED."modelVersion",
      embedding = EXCLUDED.embedding,
      "updatedAt" = now()
  `);
}
```

### 9.6 Example queries with the tier filter

Step 1. Build the member's taste vector. userId comes from the session. The UNION ALL keeps duplicates, so a song rated 5 counts twice.

```typescript
const [taste] = await prisma.$queryRaw<{ taste: string | null; n: number }[]>(Prisma.sql`
  SELECT avg(sv.embedding)::text AS taste, count(*)::int AS n
  FROM (
    SELECT e."songId" FROM "JournalEntry" e
    WHERE e."userId" = ${userId} AND e.rating >= 4
      AND e."listenedAt" >= now() - interval '90 days'
    UNION ALL
    SELECT e."songId" FROM "JournalEntry" e
    WHERE e."userId" = ${userId} AND e.rating = 5
      AND e."listenedAt" >= now() - interval '90 days'
  ) w
  JOIN "SongVector" sv ON sv."songId" = w."songId"
  WHERE sv.tier = 'FREE' AND sv.embedding IS NOT NULL
  HAVING count(*) >= 3
`);
// No row means fewer than 3 qualifying entries: show Starter Picks (FR-27).
```

Step 2. Find the nearest songs. moods is a string array or null for no mood filter.

```typescript
const near = await prisma.$transaction(async (tx) => {
  await tx.$executeRaw`SET LOCAL hnsw.ef_search = 100`;
  await tx.$executeRaw`SET LOCAL hnsw.iterative_scan = relaxed_order`;
  return tx.$queryRaw<
    { songId: string; similarity: number; moods: string[]; genre: string | null }[]
  >(Prisma.sql`
    SELECT sv."songId",
           1 - (sv.embedding <=> ${taste.taste}::vector) AS similarity,
           sv.moods,
           sv.genre
    FROM "SongVector" sv
    JOIN "Song" s ON s.id = sv."songId"
    WHERE sv.tier = 'FREE'
      AND sv.embedding IS NOT NULL
      AND s.source <> 'MANUAL'
      AND (${moods}::text[]::"Mood"[] IS NULL OR sv.moods && ${moods}::text[]::"Mood"[])
      AND NOT EXISTS (
        SELECT 1 FROM "JournalEntry" e
        WHERE e."userId" = ${userId} AND e."songId" = sv."songId"
      )
    ORDER BY sv.embedding <=> ${taste.taste}::vector
    LIMIT 60
  `);
});
```

Step 3. In TypeScript, apply the FR-24 score to the 60 rows, sort, and keep 20 for the feed and 10 per carousel.

## Open Questions

Only the founder can answer these. Each has a build default so work can start. Launch gates follow the table.

| ID | Question | Build default until answered |
|---|---|---|
| Q1 | The Context lists Spotify, Apple Music, Audiomack and Bandcamp. The Scope lists Spotify, Apple Music, YT Music and Tidal. Which four ship in v1? | The four in Scope (A5) |
| Q2 | Do you want real sign in to any streaming platform later? Which ones, and when? Each has its own developer approval process | Simulated only (A6) |
| Q3 | The idea says the activation code is 'one time' and also that it 'persists until the user wants to link another device'. Does one code link one device, or many until replaced? | One code links one device. An unused code never expires (FR-4) |
| Q4 | Do you want the PIN? The brief asks for code plus PIN. The idea mentions only the code | PIN required (A11) |
| Q5 | Which 'social media handles' should work for sign in? Instagram, X and TikTok do not offer a simple free sign in for this use | Google, GitHub, Discord (A9) |
| Q6 | Who reviews reports, how fast, and what is the rule for removing a member? Can members create their own groups later? | One group. The founder reviews reports by SQL (A3, A31, A32) |
| Q7 | Do you want the journal filter and search (FR-22)? It is a new feature that I added so the Problem is solved | Keep it (A24) |
| Q8 | What is the minimum age? | 13 or older, by tick box (A10) |
| Q9 | Who writes the Privacy and Terms pages? | The founder supplies the text before launch (NFR-4) |
| Q10 | Where do members live? UK, EEA and Swiss members affect which AI vendors are allowed | Vendor choice already avoids the Gemini free tier (8.6.1) |
| Q11 | Do you accept the numeric targets in G1 to G5? | As written (A1, A2) |
| Q12 | What did you mean by 'question logs'? | 'Why this?' requests only (A43) |
| Q13 | Will the product ever earn money (ads, sponsors, paid tier)? Vercel Hobby bars commercial use | Stays free and non commercial |
| Q14 | Is English the only language at launch? | English only |
| Q15 | Do you want the AI written Why this sentence at launch, or the template sentence only? | AI sentence on, with template fallback (A51). Set to template only if LG-6 or LG-8 fails |
| Q16 | Is the Demo badge on the Profile screen acceptable? | Yes (FR-8) |
| Q17 | The project context file AGENTS.md lists 'Gemini free tier'. Do you agree to replace it with 'Cloudflare Workers AI free plan'? | Replace it (8.6.1) |

### Launch gates

Each gate must pass before members are invited.

| ID | Gate | Pass condition |
|---|---|---|
| LG-1 | Apple terms | A written check of Apple's current Search API terms shows that the Apple Music badge placement in FR-12 complies. If not, ship with no art and no previews |
| LG-2 | UK legal check | A qualified adviser has reviewed the community feed, the Report flow and the age tick box. I am not a lawyer, and this is advice to check, not a legal finding |
| LG-3 | Search load test | 60 searches in one minute return results or the labelled fallback, with no error screen (FR-11) |
| LG-4 | Offline test | A saved entry made offline syncs once, with no duplicate, on Chrome Android and on Safari iOS (FR-19, FR-39, FR-40) |
| LG-5 | Auth test | After a test sign in, the Session row holds no raw IP address. A device links with a code and PIN on the installed Better Auth version (7.3) |
| LG-6 | Boundary test | The test in 8.6.6 passes. The Cloudflare Workers AI terms are confirmed for UK, EEA and Swiss members |
| LG-7 | pgvector version | SELECT extversion FROM pg_extension WHERE extname = 'vector' returns 0.8.0 or later, or A55 is applied |
| LG-8 | Model check | Both Workers AI model ids exist in the current catalogue. One day of real use stays under 70% of the free daily neurons |

## All assumptions in this document

| ID | Assumption | Reason |
|---|---|---|
| A1 | Every numeric target below is mine and needs founder sign off. | the idea gives no targets, so I sized them for a launch of 400 members. |
| A2 | Every metric uses a rolling 4 week window. No decision is made on a cohort smaller than 30 members. | at 400 members, one person moves a weekly percentage by more than 3 points. |
| A3 | v1 has no admin or moderator screens. The founder works through Prisma Studio [a visual database browser] and SQL. | the idea names no operator role. |
| A4 | Tunde is a fictional composite. | the idea names no real user, so he is built from its global small business context. |
| A5 | The idea lists Spotify, Apple Music, Audiomack and Bandcamp in its Context, and Spotify, Apple Music, YT Music and Tidal in its Scope. v1 builds the four in Scope. The Platform enum [a fixed list of allowed values] also holds AUDIOMACK and BANDCAMP so adding them later needs no migration. | the two lists conflict. |
| A6 | Connections are simulated. No OAuth [the standard sign in handshake between two apps] call goes to any platform and no platform token is stored. | the Scope says auth simulation, and the app only holds data members supply. |
| A7 | The offline catalogue holds 1,500 songs spread across the 7 moods. A seed script fills it once from the iTunes Search API. | the idea names an offline catalogue but gives no size or source. |
| A8 | Supported browsers are the latest 2 versions of Chrome, Safari (iOS 16.4 and later), Firefox and Edge. | the idea names none, and a phone first audience needs a defined list. |
| A9 | these three providers. | the idea says 'preferred social media handle' but names none, and all three are free. |
| A10 | age 13 or older. | the idea gives no minimum age. |
| A11 | the deferred offer, the stated purpose, an 8 character code from the Crockford base32 alphabet [digits and letters without I, L, O, U] and a 6 digit PIN. | the idea says a code is issued automatically but not when, and a forced step before the first entry would hurt G1. |
| A12 | 5 devices. | the idea gives no limit. |
| A13 | 5, 20 and 15 minutes. | shared mobile carrier addresses put many people behind one IP, so the IP limit must be higher than the per code limit. |
| A14 | badges are computed from PlatformConnection and have no table. | they carry no data of their own. |
| A15 | 300 ms, 20 results, 3 seconds and 15 calls a minute. | Apple says the API allows about 20 calls a minute, and the server shares one address with other apps. |
| A16 | the badge placement. | Apple's terms allow previews and art only to promote store content, with samples near a store badge. |
| A17 | 5 seconds. | filters out accidental taps. |
| A18 | manual add with two fields. | songs from small platforms are often missing from the iTunes catalogue, and without it the member cannot log them. |
| A19 | these two bounds. | a wrong phone clock would otherwise save entries dated years away. |
| A20 | no half stars. | the idea says '5-star' only. |
| A21 | 1 to 3 moods. | songs often carry more than one mood, and a cap keeps the mood charts readable. |
| A22 | the chips beyond the three examples in the idea, and the 40 character cap. | chips make logging faster on a phone. |
| A23 | 2,000 characters. | long enough for a paragraph, small enough to keep each row near 1 KB. |
| A24 | this filter and search. | the Problem promises easy re-finding, and no other requirement delivers it. |
| A25 | the weights and the scaling. | the idea names the signals (mood frequency, favourite genres, high ratings) but not their weights, and unscaled parts would let one signal dominate. |
| A26 | rating 4 or 5, double weight for 5, 90 days and 3 entries. | the idea says to use high ratings but gives no window or weight. |
| A27 | the genre to mood table and the 3 entry rule. | catalogue songs have no member moods at launch, and the idea gives no mapping. |
| A28 | the fixed numbers in this section: 60 candidates, 20 in the feed, 3 carousels of 10 songs, a 90 day window and a 6 hour cache (FR-30). | the idea gives none of them. |
| A29 | the language model writes this sentence, with a validity check and a template. | the brief lists a language model in the stack, and this is the lowest cost use. |
| A30 | the ranges in FR-31, these five metrics, and a minimum of 5 entries before charts show (below that the screen shows 'N of 5 entries'). | the idea says 'listening habit metrics' without a list, and charts on 1 or 2 entries mislead. |
| A31 | one group with automatic join. | the idea says 'a community group' and gives no creation flow. |
| A32 | the Report button, hiding at 2 reports and the reason list. | a feed of member posts needs a way to report and hide content, and the idea gives none. |
| A33 | the 300 song list (about 35 KB gzipped). | search must work offline, and the full catalogue would cost data. |
| A34 | 60 seconds and the 5 minute gap rule. | the idea lists time on the app as data to keep but gives no precision, and a daily cron job cannot close sessions on time (section 7.7). |
| A35 | both buttons, the sign in check and the export contents. | members in the UK and EU have a legal right to them, and the idea does not state them. |
| A36 | WCAG 2.2 AA for core flows only. | the idea names no standard. |
| A37 | The daily limits below. | they keep free services inside their free limits (section 7.7) and block runaway use. |
| A38 | I picked every service below. Facts marked Checked come from the vendor pages listed under Sources on 13 October 2026. Facts marked Not checked are my estimates and must be measured. | the brief leaves hosting and services to me. |
| A39 | At 400 members I assume 20% are active on a given day (80 members), each saves 2 entries on an active day, each member visits 20 times a month (8,000 visits), and a function call uses 50 ms of Active CPU. That gives 4,800 entries and about 170,000 function calls a month. | the idea gives no usage numbers. |
| A40 | Better Auth, not Auth.js. | Auth.js is in security fix only mode and its own maintainers advise new projects to use Better Auth. |
| A41 | London. | the founder is in England and the persona is in Lagos, and the free regions do not include West Africa. |
| A42 | Serwist, with a fallback. | it is free and made for Next.js, but I did not verify it against the current Next.js build tool. |
| A43 | QuestionLog stores each 'Why this?' request and its answer. | the brief asks for question logs and the idea names no other place where members ask questions. |
| A44 | 24 hours for the search cache. | song data rarely changes and it protects the iTunes limit. |
| A45 | salted IP hashes only. | lockout needs an IP key, and privacy needs no raw IP. |
| A46 | 90 days for LoginAttempt and 30 days for SystemEvent. | long enough to investigate abuse, short enough to limit stored data. |
| A47 | these pins. | Prisma moved connection settings in later major versions, and an unpinned install can break the schema. |
| A48 | a monthly manual dump. | no free automatic backup covers more than 6 hours. |
| A49 | pgvector on Neon. | the stack locks PostgreSQL and pgvector, and this adds no new service. |
| A50 | Cloudflare Workers AI model @cf/baai/bge-base-en-v1.5, which returns 768 numbers per text, with the template above. The server divides each vector by its length (L2 normalisation) before storing. The seed script sends texts in batches of 50. | the model is free on the Workers AI free plan, matches the schema size, and does not need member data. |
| A51 | Cloudflare Workers AI for the Why this sentence, with model @cf/meta/llama-3.2-3b-instruct. | it is a small model on the free plan, and its terms fit the member text rule. |
| A52 | AI code lives in three files: lib/ai/config.ts (model ids and limits), lib/ai/facts.ts (builds the facts) and lib/ai/client.ts (the only caller of the vendor). | one place for each job makes the boundary easy to test and review. |
| A53 | HNSW with m = 16, ef_construction = 64 and ef_search = 100. | m and ef_construction are the pgvector defaults, and a higher ef_search keeps results full after the mood filter. |
| A54 | the tier filter is on every query even though only one tier exists. | a future paid tier then needs no query change. |
| A55 | iterative scan. If the installed pgvector is older than 0.8, remove the two SET LOCAL hnsw lines that mention iterative scan, and raise hnsw.ef_search to 200. | iterative scan needs pgvector 0.8, and I did not verify the version Neon runs. |
| A56 | a 5 second timeout and no retry. | a retry would spend free neurons and slow the card. |
