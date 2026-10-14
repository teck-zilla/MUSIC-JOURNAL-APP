# Offline and caching
Activation: always on.
Job: protect the one thing that matters most, never losing or duplicating an entry and never showing one member's data to another.
Source: PRD FR-19, FR-30, FR-39, FR-40, 7.5, 7.6. Size budgets are in ui-standards.md.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

## Saving
- Make the client create a UUID called clientId for each entry. If the server already has that clientId for the member, return the existing entry with status 200 and the same body. Never return an error for a repeat. Why: a retried offline save must not look like a failure. (FR-19)
- Close the modal at once and show the entry as saved while the request runs. Why: the persona fears losing an entry when signal drops. (FR-19, PRD 4.1)
- Save offline entries in the IndexedDB store named outbox with the member id, clientId, the payload and the device time as listenedAt. Why: the queue must survive a closed browser. (PRD 7.6)
- Send the outbox when the browser fires the online event and when the app opens. Use Background Sync only as an extra on Chrome, because Safari on iPhone has none. Add no polling and no push. Why: only the first two work on every supported browser. (PRD 7.6)
- When the server rejects a queued entry, keep it in the list marked Needs fix with an Edit button. Never drop it silently. Why: a lost entry is the worst failure. (PRD 7.6)
- Hold a queued entry whose member id differs from the signed in member. Do not send it and say so on screen. Why: it must never land in another member's journal. (FR-40)

## Caches
- Wipe the Cache Storage and IndexedDB of the app on sign out, on any 401 answer and on a device revoke. Why: a shared phone must not show the last member's journal. (FR-40, FR-5)
- Key every cache that holds member data on the member id. The Discover key is member id plus mood filter. The Insights key is member id plus range. Service worker caches and IndexedDB records carry the member id. Why: a key without the member id shows one member's feed to another. (FR-30)
- Treat search results, catalogue-lite.json and album art as shared. They hold no member data. Why: they need no member key. (PRD 7.5)
- Cache Discover for 6 hours, Insights for 1 hour and search results for 24 hours. Saving, editing or deleting an entry clears that member's Discover and Insights caches with revalidateTag. Why: stale data would hide the change the member just made. (FR-30, PRD 7.5)
- Prove with one automated test that two members never share a cache key. Why: FR-30 requires it. If the test needs a database, the owner runs it. (database-safety.md)

## Offline screens
- Offline, show the last cached Discover feed, Insights and the 20 latest entries, with the banner 'Offline. Showing saved data.' Why: FR-39 and PRD 7.6.
- Run offline search on catalogue-lite.json, a bundled list of 300 songs. Why: the full catalogue would cost data. (FR-39)
- Disable live search, filter, preview playback, the Connect modal, edit and delete while offline, each with a one line reason. Why: they need the server. (PRD 7.6)
- Build the service worker with Serwist. Stop after the first working version and ask the owner to run the offline test on Chrome Android and Safari iOS (LG-4). If Serwist fails, write a small service worker for the app shell only. Why: Serwist was not checked against the Next.js build tool. (PRD 7.6, A42)
