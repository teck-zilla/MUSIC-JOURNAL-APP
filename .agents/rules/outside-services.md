# Outside services
Activation: glob **/api/songs/**, **/api/plays/**, **/lib/songs/**.
Job: control calls to the iTunes Search API and the rules every outside call must follow.
Source: PRD FR-11 to FR-13, NFR-5, 6.10, 7.5. AI vendor data rules are in ai-boundary.md.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

## iTunes Search API
- Call the iTunes Search API from the server only, never from the browser. Why: the call limit has to be enforced in one place. (FR-11)
- Let the search box wait 300 ms after typing stops, require 2 or more characters, and ask for 20 songs. Why: it keeps calls under the limit. (FR-11, A15)
- Send no more than 15 iTunes calls a minute in total across the app. Why: Apple allows about 20 a minute and the server shares one address with other apps. (FR-11)
- On a 429, a 403 or no answer in 3 seconds, search the offline catalogue, write a SystemEvent of kind SEARCH_FALLBACK, and show 'Showing saved songs.' Why: search is the first step of logging, and goal G2 depends on it. (FR-11)
- Keep results in SearchCache for 24 hours. Count a search toward the member's 200 a day only when it goes to iTunes. Why: cached answers cost no call. (PRD 7.5, 6.10)

## Results and previews
- Show on each result: 100 pixel art, title, artist, album, a play button and an Apple Music badge that links to trackViewUrl, beside the play button. Load 600 pixel art on the detail view only. Why: Apple allows previews and art only to promote store content, near a store badge. (FR-12, LG-1)
- Play one preview at a time, and start a preview only on tap. Why: the persona avoids autoplay audio, and FR-12 allows one at a time. (PRD 4.1)
- Store the art, preview and track page URLs. Never download or rehost the files. Why: the PRD stores no files, and Apple's terms cover the files. (PRD 7.7)
- Write a PlayEvent in UTC when a preview plays for 5 seconds or more. Why: it filters accidental taps. (FR-13)

## Every outside call
- Give every outside call a timeout and write a SystemEvent row when it fails. Why: Vercel keeps logs for only 1 hour. (NFR-5)
- Never retry an outside call unless the owning rule says to. Why: retries spend free allowances and slow the screen.
