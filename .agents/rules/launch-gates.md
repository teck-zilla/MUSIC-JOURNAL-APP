# Launch gates
Activation: always on.
Job: keep code that is done separate from work that is safe to launch, and say which gate blocks which feature.
Source: PRD Launch gates LG-1 to LG-8, 7.3, 7.6. The done rules are in definition-of-done.md.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

- Report a change as DONE when it passes definition-of-done.md. Call it LAUNCH READY only when every gate in the table that blocks it has passed. Why: some gates can only be passed by the owner, so an open gate must not stop code from being finished.
- End every change summary with the gates that touch it, using the table. Why: the owner then knows what to check before inviting members.
- Never state or imply that a gate has passed. Only the owner confirms a pass. Why: an agent cannot run a legal review or test two phones.

| Gate | Blocks | Who passes it | Pass condition |
|---|---|---|---|
| LG-1 | Previews, album art and the Apple Music badge (FR-12) | Owner | A written check of Apple's Search API terms shows the badge placement complies. If not, ship with no art and no previews |
| LG-2 | Community feed, Report and the age tick box (FR-1, FR-34 to FR-37) | Owner with an adviser | A qualified adviser has reviewed the feed, the Report flow and the tick box. This is advice to check, not a legal finding |
| LG-3 | Song search (FR-11) | Agent writes the test, owner runs it | 60 searches in one minute return results or the labelled fallback, with no error screen |
| LG-4 | Offline save and sync (FR-19, FR-39, FR-40) | Owner on two devices | A saved entry made offline syncs once, with no duplicate, on Chrome Android and on Safari iOS |
| LG-5 | Sign in and device linking (FR-1 to FR-6) | Owner | A test session row holds no raw IP, and a device links with a code and PIN on the installed Better Auth version |
| LG-6 | Embeddings and the Why this sentence (FR-29, section 8) | Agent writes the test, owner runs it | The boundary test in 8.6.6 passes, and Cloudflare's terms are confirmed for UK, EEA and Swiss members |
| LG-7 | The iterative scan setting in song vector queries | Owner | SELECT extversion FROM pg_extension WHERE extname = 'vector' returns 0.8.0 or later, or A55 is applied |
| LG-8 | Both AI model ids | Owner | Both Workers AI model ids exist in the current catalogue, and one day of real use stays under 70% of the free daily allowance |

- Stop and ask the owner to prove the build gates before dependent work: the activate route on the installed Better Auth version (PRD 7.3, LG-5) and the offline test (PRD 7.6, LG-4). Why: later code is built on top of them.
