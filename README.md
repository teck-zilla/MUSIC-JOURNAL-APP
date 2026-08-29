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
