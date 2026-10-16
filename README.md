Spotify-Inspired Music Journal Application 

A sleek, high-performance, Spotify-inspired web app that lets users journal their musical experiences, track their moods and ratings, connect streaming platforms, and receive personalized music recommendations based on their listening & journaling habits.

🎵 What is the app for?
The app is a personal music journal where users can record the songs and albums they listen to, rate them, and write down their thoughts or feelings about the music.


👥 Who is it designed for?
It is designed for music lovers, students, and anyone who enjoys discovering and keeping track of music. It is especially useful for people who want to remember what they listened to and how the music made them feel.


💡 What problem does it solve?
People listen to lots of music but often forget songs they enjoyed or why they liked them. The app provides a centralized place to record, organize, and reflect on their music, making it easier to remember favourite songs and discover their personal listening habits.

Tech Stack
Pure Vanilla HTML5, CSS3 (using CSS custom properties/variables), and Vanilla JavaScript (ES6+ Modules). No React, No Tailwind.
HTML – Structure and content
CSS – Styling and layout
JavaScript – Functionality and interactions
Git & GitHub – Version control and project management

Audio & Live Search API: Uses the live iTunes Search API (free, no auth token required) to query millions of real songs with high-res cover art and 30-second audio previews, alongside a rich offline fallback dataset and Spotify Web API integration hooks.

Data Persistence: Uses localStorage with JSON import/export capability and pre-populated sample entries for an instant, visually rich experience.


Features 
Platform Integration (Spotify, Apple Music, YT Music, Tidal):
Account connection modal with interactive auth simulation, profile badges, and platform status.

Song Search & Journal Entry:
Live search (iTunes API + offline catalogue) with real album art, audio preview playback.

Journal Modal: 5-star rating system, mood tagging (⚡ Energetic, ☕ Chill, 🌧️ Melancholic, 🎯 Focused, 🚀 Euphoric, 🌅 Nostalgic, 🔥 Hype), custom note text, listening context (e.g. Rainy night, Workout, Late night coding).

Adaptive Browsing & Recommendation Engine:
Algorithms that track mood frequencies, favourite genres, and high ratings to personalize the "Discover For You" feed and mood-filtered recommendation carousels.

Analytics & Mood Insights:
Visual charts (mood breakdown, rating distributions, top artists/genres) and listening habit metrics.

Data Management:
Complete Web Storage persistence, bookmarking, filter/sort operations, data export/import.

Spotify-Inspired Visual Design

Spotify Dark Vibe Interface:
Spotify signature color palette (#121212, #181818, #1DB954), sidebar navigation, hero section, responsive cards, and fixed bottom audio player bar with Web Audio API canvas visualizer.


## 🚀 Recent Updates & Changelog

### 1. PRD FR-7 to FR-10: Simulated Demo Platform Connections
- **Compliant Platform List**: Configured simulated demo connections for the four authorized MVP platforms: **Spotify, Apple Music, YT Music, and Tidal**.
- **Mandatory "Demo" Status Indicators**: Ensured every modal step explicitly states it is a simulation and updated all UI badges (sidebar, top header, modal cards, and journal entries) to prominently display the word `"Demo"`.
- **Streamlined Platform Switching & Disconnection**: Implemented clean platform switching and disconnection flows without requiring external accounts or API keys.
- **Scope Alignment**: Removed out-of-scope platforms (Audiomack and SoundCloud) from member-facing UI per PRD Section 5.2.

### 2. Database Environment & Secrets Protection (PRD Section 7.8, 7.9)
- **Secrets Protection**: Configured [.gitignore](file:///c:/Users/teckm/OneDrive/Desktop/MUSIC%20JOURNAL%20APP/.gitignore) to protect all `.env` files from accidental repository exposure.
- **Standardized Environment Template**: Created [.env.example](file:///c:/Users/teckm/OneDrive/Desktop/MUSIC%20JOURNAL%20APP/.env.example) and local [.env](file:///c:/Users/teckm/OneDrive/Desktop/MUSIC%20JOURNAL%20APP/.env) with PRD-specified variable names (`DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `CRON_SECRET`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`).

### 3. Architecture, Specifications & Standards
- **Agent Governance Rules**: Added [AGENTS.md](file:///c:/Users/teckm/OneDrive/Desktop/MUSIC%20JOURNAL%20APP/AGENTS.md) and [.agents/rules/](file:///c:/Users/teckm/OneDrive/Desktop/MUSIC%20JOURNAL%20APP/.agents/rules) defining database safety, member data protection, AI boundaries, offline caching, and launch gates.
- **Cross-Browser Styling**: Standardized CSS rules for `background-clip` and `line-clamp` across all major browsers.

---

## 🗺️ Step-by-Step Roadmap to Reach Working MVP (PRD v1)

This roadmap outlines the sequential phases to transition the current client prototype into a full-stack, production-grade MVP in accordance with [AGENTS.md](file:///c:/Users/teckm/OneDrive/Desktop/MUSIC%20JOURNAL%20APP/AGENTS.md) and the project specification:

### Phase 1: Project Scaffolding & Next.js Foundation (PRD Section 7.8)
- [ ] Initialize Next.js App Router workspace with TypeScript.
- [ ] Pin exact dependency versions in `README.md` (`next`, `react`, `prisma`, `better-auth`, `serwist`, `zod`, `@node-rs/argon2`).
- [ ] Set up centralized environment variable validation module with Zod (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `CRON_SECRET`, etc.).
- [ ] Configure ESLint and strict TypeScript type-checking standards.

### Phase 2: Database Schema & Vector Migrations (PRD Section 7.9, 7.10, 9.4)
- [ ] Author [schema.prisma](file:///c:/Users/teckm/OneDrive/Desktop/MUSIC%20JOURNAL%20APP/schema.prisma) matching PRD models (`User`, `Session`, `Account`, `Device`, `Song`, `JournalEntry`, `CommunityGroup`, `GroupMembership`, `Report`, `SystemEvent`).
- [ ] Author hand-written SQL migration script for Neon PostgreSQL (`CREATE EXTENSION IF NOT EXISTS vector;`, `pg_trgm` extension, composite indexes, and check constraints for ratings 1–5 and 1–3 moods).
- [ ] Execute migration on Neon PostgreSQL and verify extension version meets launch gate **LG-7** ($\ge 0.8.0$).

### Phase 3: Member Authentication & Device Linking (PRD FR-1 to FR-6, LG-5)
- [ ] Implement Better Auth endpoints for Google, GitHub, and Discord OAuth with database-backed sessions.
- [ ] Build `/signin` screen with the mandatory `"I am 13 or older"` age verification tick box.
- [ ] Implement device linking flow using 8-character Crockford base32 activation codes and 6-digit `@node-rs/argon2` PINs (`/api/device/code`, `/api/device/activate`, `/link`).
- [ ] Enforce privacy rules: store only salted IP hashes (no raw IPs) and omit provider profile pictures.

### Phase 4: Server-Side Song Search & Apple Music Compliance (PRD FR-11 to FR-14, LG-1, LG-3)
- [ ] Build `/api/songs/search` server-side proxy to iTunes Search API with global rate limiting (15 calls/min), member daily limits (200 calls/day), and 24-hour cache.
- [ ] Integrate required Apple Music badge and affiliate track link next to all preview audio and album artwork to satisfy **LG-1**.
- [ ] Build manual song entry modal (creator-only visibility, no artwork, no vector embedding).
- [ ] Implement `PlayEvent` tracking in UTC for preview playback $\ge 5$ seconds.

### Phase 5: Journal Storage & Idempotent Offline Sync Engine (PRD FR-15 to FR-22, FR-39, FR-40, LG-4)
- [ ] Implement `/api/entries` CRUD routes with client-generated `clientId` (UUID) paired with member ID for guaranteed idempotent saving (G2).
- [ ] Integrate Serwist service worker and IndexedDB `outbox` queue to persist entries logged offline and automatically sync upon reconnection.
- [ ] Build cached offline screens for `/discover`, `/insights`, and the latest 20 journal entries with clear offline banners.
- [ ] Validate timestamps server-side: UTC timestamp between Jan 1, 2000 and current time + 5 minutes.

### Phase 6: Discover Engine & Cloudflare AI Boundary (PRD FR-23 to FR-30, Section 8.6, LG-6, LG-8)
- [ ] Create `lib/ai/config.ts`, `lib/ai/facts.ts`, and `lib/ai/client.ts` strictly routing through Cloudflare Workers AI free tier.
- [ ] Compute on-demand taste vectors from qualifying entries (ratings $\ge 3$, time-decay weighted) without storing member vectors.
- [ ] Implement 3-part Discover scoring formula (Taste Similarity + Mood Affinity + Genre Affinity).
- [ ] Build Starter Picks for new members ($< 5$ qualifying entries) and Mood Carousels for top moods.
- [ ] Implement "Why this" 1-sentence explanations ($\le 25$ words) generated strictly from public song facts and member counts with template fallbacks and canary privacy tests (PRD 8.6.6).

### Phase 7: Insights & Habit Metrics (PRD FR-31 to FR-33)
- [ ] Build visual mood distribution breakdown and rating distribution (1–5 stars).
- [ ] Calculate top artists and top genres from member entries.
- [ ] Implement the exact 5 Habit Metrics defined in FR-33:
  1. **Logging Streak** (consecutive active days)
  2. **Most Active Listening Setting** (e.g., "Late night coding")
  3. **Most Active Journaling Hour**
  4. **Weekly Logging Velocity** (this week vs. last week)
  5. **Mood Diversity Score**

### Phase 8: Community Feed & Moderation (PRD FR-34 to FR-37, LG-2)
- [ ] Build single global community group feed (`/community`) with opt-in per-entry sharing toggle.
- [ ] Implement "Report" button with structured reason logging.
- [ ] Implement auto-hiding threshold for entries receiving $\ge 3$ unique member reports.
- [ ] Enforce strict privacy: zero direct messaging, comments, follower counts, or public member profiles.

### Phase 9: Privacy, Data Ownership & Operations (PRD FR-38 to FR-43, LG-1 to LG-8)
- [ ] Build dedicated Privacy screen disclosing AI data boundaries and local storage policies.
- [ ] Build "Export My Data" generating a complete GDPR-compliant JSON archive.
- [ ] Build "Delete My Account" permanently cascading deletion of all member rows.
- [ ] Implement active session time tracking via `navigator.sendBeacon` heartbeat without external analytics scripts.
- [ ] Pass all Launch Gates (**LG-1** to **LG-8**) prior to inviting production members.

