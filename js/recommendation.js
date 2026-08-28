/**
 * SPOTIFY MUSIC JOURNAL - ADAPTIVE RECOMMENDATION ENGINE
 * Analyzes journal entry history, ratings, and mood frequencies to influence browsing & search habits.
 */

import { StorageManager } from './storage.js';
import { MusicAPI } from './api.js';
import { Player } from './player.js';
import { Journal } from './journal.js';

export const RecommendationEngine = {
  init() {
    this.bindDOM();
    window.addEventListener('journalUpdated', () => this.render());
  },

  bindDOM() {
    this.dom = {
      recsGrid: document.getElementById('recommendationsGrid'),
      moodHeadline: document.getElementById('recommendationMoodHeadline'),
      habitTag: document.getElementById('habitInsightTag')
    };
  },

  /**
   * Analyzes saved entries to compute taste profile
   */
  computeTasteProfile() {
    const entries = StorageManager.getEntries();
    if (entries.length === 0) {
      return { topMood: 'chill', topGenre: 'Pop', avgRating: 5 };
    }

    const moodCounts = {};
    const genreCounts = {};
    let totalRating = 0;

    entries.forEach(e => {
      // Weight high-rated entries (4★ and 5★) twice as heavily!
      const weight = e.rating >= 4 ? 2 : 1;
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + weight;
      if (e.genre) {
        genreCounts[e.genre] = (genreCounts[e.genre] || 0) + weight;
      }
      totalRating += e.rating;
    });

    let topMood = 'chill';
    let maxMoodCount = 0;
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > maxMoodCount) {
        maxMoodCount = count;
        topMood = mood;
      }
    }

    let topGenre = 'Pop';
    let maxGenreCount = 0;
    for (const [genre, count] of Object.entries(genreCounts)) {
      if (count > maxGenreCount) {
        maxGenreCount = count;
        topGenre = genre;
      }
    }

    return {
      topMood,
      topGenre,
      avgRating: (totalRating / entries.length).toFixed(1)
    };
  },

  render() {
    if (!this.dom.recsGrid) return;

    const profile = this.computeTasteProfile();
    const catalog = MusicAPI.getCatalog();

    // Recommend tracks matching top mood or high energy catalog
    let recommended = catalog.filter(t => t.mood === profile.topMood);
    if (recommended.length < 4) {
      recommended = catalog;
    }

    if (this.dom.moodHeadline) {
      const moodTitles = {
        energetic: '⚡ High Energy & Workout Beats',
        chill: '☕ Chill & Relaxing Soundscapes',
        melancholic: '🌧️ Deep & Emotional Harmonies',
        focused: '🎯 Instrumental & Deep Focus',
        euphoric: '🚀 Euphoric Party & Dance Hits',
        nostalgic: '🌅 Golden Era Retro & Synth Nostalgia',
        hype: '🔥 Heavy Bass & Hype Tracks'
      };
      this.dom.moodHeadline.textContent = moodTitles[profile.topMood] || 'Recommended For You';
    }

    if (this.dom.habitTag) {
      this.dom.habitTag.textContent = `Influenced by your ${profile.topMood.toUpperCase()} journaling habits (${profile.avgRating}★ avg rating)`;
    }

    this.dom.recsGrid.innerHTML = recommended.map(track => `
      <div class="card-item" data-rec-id="${track.id}">
        <div class="card-cover-wrapper">
          <img class="card-cover" src="${track.cover}" alt="${track.title}">
          <button class="btn-play-hover" title="Play Preview">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <div class="card-title">${track.title}</div>
        <div class="card-artist">${track.artist}</div>
        <div class="card-meta-bar">
          <span class="mood-badge mood-${track.mood}">${track.moodLabel || track.mood}</span>
          <button class="btn-log-track btn-primary" style="padding: 4px 10px; font-size: 0.72rem;">+ Journal</button>
        </div>
      </div>
    `).join('');

    // Attach click events
    this.dom.recsGrid.querySelectorAll('.card-item').forEach(card => {
      const trackId = card.dataset.recId;
      const track = catalog.find(t => t.id === trackId);

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-log-track')) {
          e.stopPropagation();
          Journal.openModalForTrack(track);
          return;
        }
        Player.playTrack(track);
      });
    });
  }
};
