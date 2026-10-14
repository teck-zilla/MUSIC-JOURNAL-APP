# Member data
Activation: always on.
Job: limit what the app stores, shows and sends about a member.
Source: PRD sections 1, 3.2, 4, FR-35, FR-36, FR-38, FR-42, FR-43. AI input rules are in ai-boundary.md. How sign in avoids raw IP storage is in auth-and-devices.md.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

## What is stored
- Store only what the member enters, public song data, and this system data: email and name from the sign in provider, time zone, device label and last seen time, session records, a salted hash of the IP address, active seconds, and daily action counts. Why: anything else is a hidden collection. (PRD section 4, FR-38)
- Never store a raw IP address anywhere. Why: the PRD allows only the salted hash, for lockout. (PRD section 4)
- Never store the provider profile picture. Why: the PRD says it is not stored. (PRD section 4)
- Use active seconds only to run the product. List the item on the Privacy screen. Never show the values and never put them in the export. Why: the member did not enter them. (FR-42, FR-43)

## What leaves the app
- Never send member text to any outside service. Member text is note, custom context, display name, manual song title and artist, report note, demo handle and email. Search words go only to the iTunes Search API. Why: the product promise. (PRD 3.2, AI-5, FR-11)
- Show a note to its own author, and to the community group only when the member turned sharing on for that entry. Show it nowhere else. Why: sharing is off by default. (FR-35, FR-38) PRD FR-38 does not mention the author's own view or the export. This file treats both as allowed. Confirm with the owner.
- Show the community feed only display name, song, rating, moods, context and note. Why: nothing else about the member may appear. (FR-36)
- Never write member text, member id, email or a note into a log, a SystemEvent message, an error message or a tracking tool. Why: logs sit outside the database. (NFR-5)
- Add no analytics, pixel or third party script. The only exception is Vercel Speed Insights, sampled. Ask before adding anything else. Why: the Privacy screen must list everything. (PRD 3.1, FR-38)

## Delete and export
- Delete my account removes every row for the member: entries, plays, platform connections, devices, sessions, counters, shares, reports the member made and manual songs. Why: members have a right to deletion. (FR-43, A35)
- Delete and Export both need a sign in within the last 10 minutes, or they ask the member to sign in again. Why: a stolen open session must not be able to wipe or copy a journal. (FR-43)
- Export is a JSON file holding exactly entries, plays, platform connections, devices without hashes, and group shares. Why: that is the PRD list. (FR-43)
