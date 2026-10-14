# AI boundary
Activation: glob **/lib/ai/**, **/api/discover/**, **/api/entries/**, **/*seed*. Also load when a task mentions embeddings or the Why this sentence.
Job: decide what may reach the AI vendor and what comes back.
Source: PRD 8.2 to 8.6, AI-1 to AI-9, FR-29. Where member data may go in general is in member-data.md. Generic outside call rules are in outside-services.md.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

## One door
- Only lib/ai/client.ts calls Cloudflare Workers AI. The vendor URL and token appear in no other file. A test greps the source for this. Why: one door can be tested. (AI-1)
- Keep model ids, the system prompt text and AI limits in lib/ai/config.ts. Do not change the prompt text without the owner. Why: Cloudflare retires models, and the prompt is a PRD artifact. (PRD 8.6.4)
- Never call the Gemini API. Why: Google's terms bar free use for UK, EEA and Swiss users, and free content may be used to improve Google products. (PRD 8.6.1)

## What goes in
- Embed text built only from title, artist, album, genre and year of songs with source ITUNES or OFFLINE_SEED. Why: public song data is the only safe input. (AI-2)
- Never embed an entry, a note, a manual song or any member typed text. Why: no member text may leave the database. (PRD 8.3)
- Build sentence input only with buildWhyFacts in lib/ai/facts.ts. It returns the fields in the table below and nothing else. Why: a fixed shape cannot pick up a new field by accident. (AI-3)
- The client function accepts only the facts type, never a string or another object. Why: the type system blocks a bad call before it runs. (AI-4)
- Never put these in the facts: note, custom context, display name, manual song title or artist, report note, demo connection handle, email, member id, entry id. Why: each is member typed or identifies the member. (AI-5, AI-6)
- Take similar_liked_song only from an ITUNES or OFFLINE_SEED song. Why: a manual song title is member typed.
- Store the song id and counts in QuestionLog.question, not the prompt. Why: the log must not become a copy of member behaviour text. (AI-6)

| Allowed field | Source |
|---|---|
| song_title, artist, genre | Song columns, source ITUNES or OFFLINE_SEED |
| song_moods | Song vector moods, from the fixed mood list |
| your_top_moods | Counted from the member's entries, up to 3 moods with a whole number percent |
| your_average_rating_in_this_genre | Averaged from the member's entries, or none |
| match_count | Counted from the member's entries |
| similar_liked_song | Title and artist of a liked ITUNES or OFFLINE_SEED song, or none |

## What comes out
- Accept the sentence only if it is one sentence of 25 words or fewer with no quotation mark, link or at sign. Otherwise use the template and store status INVALID_OUTPUT. Why: a small model can drift, and member facing text must be safe. (PRD 8.6.5)
- Time out after 5 seconds and never retry. Why: a retry spends the free daily allowance and slows the card. (PRD 8.6.5)
- On any failure use the template, write a SystemEvent of kind LLM_FAIL and store status ERROR or TEMPLATE_FALLBACK. Why: Vercel keeps logs for only 1 hour. (NFR-5)
- Allow 10 requests per member per day, counted in UsageCounter with kind WHY_THIS. Past it use the template and store RATE_LIMITED. Why: it protects the free allowance. (FR-29, 6.10)
- Use this template: 'You rated {n} {mood} songs in {genre} {avg} stars on average.' When there is no data, use: 'This song fits the moods you log most.' Why: both are PRD text. (FR-29, 8.6.4)
- Do not ship the AI sentence until the Privacy screen says what is sent: public song facts and averaged numbers, and that notes are never sent. Why: members must be told. (AI-9, FR-38)

## Test
- Write the boundary test in PRD 8.6.6 and keep it passing on every change. It saves entries holding canary values, runs Discover, requests Why this three times, runs the daily job, and fails if any outbound request holds a canary, the member id or the email, or if another file holds the vendor host name. The owner runs it on a database the owner provides. Why: this test is the only proof the rule holds. (AI-8, LG-6)
