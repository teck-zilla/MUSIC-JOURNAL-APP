/**
 * SPOTIFY MUSIC JOURNAL - JOURNAL MANAGEMENT MODULE
 * Renders journal entry feeds, handles modal entry creation/editing, ratings, and mood tagging.
 */

import { StorageManager } from './storage.js';
import { Player } from './player.js';

export const Journal = {
  currentFilterMood: 'all',
  currentFilterRating: 'all',
  currentSearchQuery: '',
  selectedTrackForModal: null,

  init() {
    this.bindDOM();
  },

  bindDOM() {
    this.dom = {
      gridContainer: document.getElementById('journalGrid'),
      modalOverlay: document.getElementById('journalModal'),
      btnCloseModal: document.getElementById('btnCloseJournalModal'),
      form: document.getElementById('journalForm'),
      starRatingPicker: document.getElementById('starRatingPicker'),
      selectedRatingInput: document.getElementById('selectedRatingInput'),
      moodPicker: document.getElementById('moodPicker'),
      selectedMoodInput: document.getElementById('selectedMoodInput'),
      selectedMoodLabelInput: document.getElementById('selectedMoodLabelInput'),
      // Track Info in modal
      modalTrackCover: document.getElementById('modalTrackCover'),
      modalTrackTitle: document.getElementById('modalTrackTitle'),
      modalTrackArtist: document.getElementById('modalTrackArtist'),
      modalTrackGenre: document.getElementById('modalTrackGenre'),
      noteInput: document.getElementById('journalNoteInput'),
      contextInput: document.getElementById('journalContextInput'),
      platformSelect: document.getElementById('journalPlatformSelect'),
      filterChips: document.querySelectorAll('.filter-bar .chip-filter')
    };

    this.setupStarPicker();
    this.setupMoodPicker();
    this.setupFilterEvents();

    if (this.dom.btnCloseModal) {
      this.dom.btnCloseModal.addEventListener('click', () => this.closeModal());
    }

    if (this.dom.form) {
      this.dom.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  },

  setupStarPicker() {
    if (!this.dom.starRatingPicker) return;
    const stars = this.dom.starRatingPicker.querySelectorAll('.star');

    stars.forEach(star => {
      star.addEventListener('mouseover', () => {
        const val = parseInt(star.dataset.value, 10);
        this.highlightStars(val);
      });

      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.value, 10);
        this.dom.selectedRatingInput.value = val;
        this.highlightStars(val);
      });
    });

    this.dom.starRatingPicker.addEventListener('mouseleave', () => {
      const currentVal = parseInt(this.dom.selectedRatingInput.value, 10) || 5;
      this.highlightStars(currentVal);
    });
  },

  highlightStars(count) {
    if (!this.dom.starRatingPicker) return;
    const stars = this.dom.starRatingPicker.querySelectorAll('.star');
    stars.forEach((star, idx) => {
      if (idx < count) {
        star.classList.add('active');
        star.textContent = '★';
      } else {
        star.classList.remove('active');
        star.textContent = '☆';
      }
    });
  },

  setupMoodPicker() {
    if (!this.dom.moodPicker) return;
    const chips = this.dom.moodPicker.querySelectorAll('.mood-chip-btn');

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');

        this.dom.selectedMoodInput.value = chip.dataset.mood;
        this.dom.selectedMoodLabelInput.value = chip.dataset.label;
      });
    });
  },

  setupFilterEvents() {
    if (!this.dom.filterChips) return;
    this.dom.filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.dom.filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentFilterMood = chip.dataset.filterMood || 'all';
        this.render();
      });
    });
  },

  /**
   * Opens Journal Modal with chosen track details
   */
  openModalForTrack(track) {
    this.selectedTrackForModal = track;

    if (this.dom.modalTrackCover) this.dom.modalTrackCover.src = track.cover;
    if (this.dom.modalTrackTitle) this.dom.modalTrackTitle.textContent = track.title;
    if (this.dom.modalTrackArtist) this.dom.modalTrackArtist.textContent = track.artist;
    if (this.dom.modalTrackGenre) this.dom.modalTrackGenre.textContent = track.genre || 'Music';

    // Reset Form Defaults
    if (this.dom.form) this.dom.form.reset();
    this.dom.selectedRatingInput.value = 5;
    this.highlightStars(5);

    // Default Mood
    const firstMoodChip = this.dom.moodPicker?.querySelector('.mood-chip-btn');
    if (firstMoodChip) {
      firstMoodChip.click();
    }

    if (this.dom.modalOverlay) {
      this.dom.modalOverlay.classList.add('active');
    }
  },

  closeModal() {
    if (this.dom.modalOverlay) {
      this.dom.modalOverlay.classList.remove('active');
    }
  },

  handleFormSubmit(e) {
    e.preventDefault();
    if (!this.selectedTrackForModal) return;

    const entry = {
      title: this.selectedTrackForModal.title,
      artist: this.selectedTrackForModal.artist,
      album: this.selectedTrackForModal.album || this.selectedTrackForModal.title,
      cover: this.selectedTrackForModal.cover,
      previewUrl: this.selectedTrackForModal.previewUrl,
      genre: this.selectedTrackForModal.genre || 'Music',
      rating: parseInt(this.dom.selectedRatingInput.value, 10) || 5,
      mood: this.dom.selectedMoodInput.value || 'chill',
      moodLabel: this.dom.selectedMoodLabelInput.value || '☕ Chill',
      context: this.dom.contextInput.value.trim() || 'General Listening',
      note: this.dom.noteInput.value.trim(),
      platform: this.dom.platformSelect ? this.dom.platformSelect.value : 'Spotify',
      createdAt: new Date().toISOString()
    };

    StorageManager.addEntry(entry);
    this.closeModal();
    this.render();

    // Trigger custom event so discover recommendations update dynamically!
    window.dispatchEvent(new CustomEvent('journalUpdated', { detail: entry }));
  },

  /**
   * Renders journal entry cards in grid view
   */
  render() {
    if (!this.dom.gridContainer) return;

    let entries = StorageManager.getEntries();

    // Apply Mood Filter
    if (this.currentFilterMood !== 'all') {
      entries = entries.filter(e => e.mood === this.currentFilterMood);
    }

    // Apply Search Filter
    if (this.currentSearchQuery) {
      const q = this.currentSearchQuery.toLowerCase();
      entries = entries.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.artist.toLowerCase().includes(q) ||
        (e.note && e.note.toLowerCase().includes(q)) ||
        (e.context && e.context.toLowerCase().includes(q))
      );
    }

    if (entries.length === 0) {
      this.dom.gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; color: var(--text-sub);">
          <svg style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <h3 style="font-size: 1.1rem; margin-bottom: 6px; color: #fff;">No Journal Entries Found</h3>
          <p style="font-size: 0.85rem;">Use the search bar above to select a song and log your mood!</p>
        </div>
      `;
      return;
    }

    this.dom.gridContainer.innerHTML = entries.map(entry => this.createCardHTML(entry)).join('');

    // Bind card play & action buttons
    this.dom.gridContainer.querySelectorAll('.card-item').forEach(card => {
      const entryId = card.dataset.id;
      const entry = entries.find(e => e.id === entryId);

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-fav-toggle')) {
          e.stopPropagation();
          StorageManager.toggleFavorite(entryId);
          this.render();
          return;
        }

        if (e.target.closest('.btn-delete-entry')) {
          e.stopPropagation();
          if (confirm(`Delete journal entry for "${entry.title}"?`)) {
            StorageManager.deleteEntry(entryId);
            this.render();
            window.dispatchEvent(new CustomEvent('journalUpdated'));
          }
          return;
        }

        // Play track in bottom player bar
        Player.playTrack(entry);
      });
    });
  },

  createCardHTML(entry) {
    const starsHTML = '★'.repeat(entry.rating) + '☆'.repeat(5 - entry.rating);
    const dateFormatted = new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return `
      <div class="card-item" data-id="${entry.id}">
        <div class="card-cover-wrapper">
          <img class="card-cover" src="${entry.cover}" alt="${entry.title}">
          <button class="btn-play-hover" title="Play Preview">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <div class="card-title">${this.escapeHTML(entry.title)}</div>
        <div class="card-artist">${this.escapeHTML(entry.artist)}</div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin: 4px 0;">
          <span class="mood-badge mood-${entry.mood}">${entry.moodLabel || entry.mood}</span>
          <div class="rating-stars">${starsHTML}</div>
        </div>

        ${entry.note ? `<div class="journal-note-preview">"${this.escapeHTML(entry.note)}"</div>` : ''}

        <div class="card-meta-bar">
          <span style="font-size: 0.7rem; color: var(--text-muted);">${dateFormatted} • ${this.escapeHTML(entry.context || 'Journal')}</span>
          <div style="display: flex; gap: 8px;">
            <button class="btn-fav-toggle btn-icon" title="Favorite" style="color: ${entry.isFavorite ? '#ff4b2b' : 'var(--text-muted)'}">
              <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="${entry.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
            <button class="btn-delete-entry btn-icon" title="Delete Entry" style="color: var(--text-muted);">
              <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
};
