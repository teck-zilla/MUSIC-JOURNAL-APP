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

### 1. Multi-Platform Authentication & OAuth 2.0 PKCE
- **Spotify OAuth 2.0 with PKCE**: Implemented RFC 7636 PKCE flow for client-side authentication without requiring a backend server.
- **Client ID Validation & Guidance**: Added automated validation for Spotify Client IDs (32-character hex validation) and an interactive setup modal guiding users through Spotify Developer Dashboard configuration and redirect URI setup (`http://127.0.0.1:5500`, etc.).
- **Multi-Platform Support**: Added profile login and integration support for Apple Music, Audiomack, and SoundCloud alongside Spotify.
- **Instant Demo Fallback**: One-click demo mode allows testing all platform features immediately without API credentials.

### 2. Session Management & Auth Safeguards
- **Persistent Credentials**: Securely persists session tokens and user platform credentials in `localStorage`.
- **Dynamic Profile UI**: Real-time reactive updates for user avatar, platform badge, connection status, and logout actions.
- **Journaling Auth Gate**: Prompts unauthenticated guests to connect an account or enter demo mode before journaling.

### 3. Architecture, Specifications & Styling Enhancements
- **Agent Governance & Specifications**: Added `AGENTS.md` and `.agents/rules/` defining system architecture, data models, privacy boundaries, offline caching policies, and database safety rules.
- **Modern CSS & Standards**: Cleaned up vendor prefixes for `background-clip` and `line-clamp` for standards compliance and seamless cross-browser rendering.

---

## 🔮 Future Improvements

Future versions of Music Journal could include:

- **Music statistics**: Show detailed information such as favourite artists, genres, and listening trends over time.
- **Advanced Recommendations**: Vector-based taste recommendations matching personal journal entries.
- **Customization**: Allow members to customize their profile, themes, and journal displays.

