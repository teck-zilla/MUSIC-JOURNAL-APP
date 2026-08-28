/**
 * SPOTIFY MUSIC JOURNAL - MAIN APP CONTROLLER
 * Initializes components, view switching, live search handlers, streaming platform connections, and toast notifications.
 */

import { StorageManager } from './storage.js';
import { MusicAPI } from './api.js';
import { Player } from './player.js';
import { Journal } from './journal.js';
import { RecommendationEngine } from './recommendation.js';
import { Analytics } from './analytics.js';

class AppController {
  constructor() {
    this.currentView = 'discover';
    this.searchTimeout = null;
  }

  init() {
    // 1. Initialize Storage & Seed Data
    StorageManager.init();

    // 2. Initialize Core Submodules
    Player.init();
    Journal.init();
    RecommendationEngine.init();
    Analytics.init();

    // 3. Bind UI Events & Navigation
    this.bindNavigation();
    this.bindSearch();
    this.bindPlatformModal();
    this.bindBackupDataEvents();

    // 4. Initial Renders
    Journal.render();
    RecommendationEngine.render();
    Analytics.render();
    this.updatePlatformUI();

    console.log('Spotify Music Journal App Initialized Successfully!');
  }

  bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-panel');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.dataset.targetView;
        if (!targetView) return;

        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        views.forEach(v => {
          if (v.id === `view-${targetView}`) {
            v.classList.add('active');
          } else {
            v.classList.remove('active');
          }
        });

        this.currentView = targetView;
        if (targetView === 'analytics') {
          Analytics.render();
        } else if (targetView === 'journal') {
          Journal.render();
        } else if (targetView === 'discover') {
          RecommendationEngine.render();
        }
      });
    });
  }

  bindSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    const searchResultsPanel = document.getElementById('view-search-results');
    const searchGrid = document.getElementById('searchResultsGrid');
    const searchHeaderTitle = document.getElementById('searchHeaderTitle');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();

      if (this.searchTimeout) clearTimeout(this.searchTimeout);

      if (!query) {
        // Return to active tab
        document.getElementById(`view-${this.currentView}`)?.classList.add('active');
        searchResultsPanel?.classList.remove('active');
        Journal.currentSearchQuery = '';
        Journal.render();
        return;
      }

      this.searchTimeout = setTimeout(async () => {
        // Show Search Results view
        document.querySelectorAll('.view-panel').forEach(v => v.classList.remove('active'));
        searchResultsPanel?.classList.add('active');

        if (searchHeaderTitle) searchHeaderTitle.textContent = `Search Results for "${query}"`;
        if (searchGrid) searchGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-sub);">Searching music database...</div>`;

        // Also sync search query with journal filter
        Journal.currentSearchQuery = query;

        const results = await MusicAPI.searchTracks(query);

        if (!results || results.length === 0) {
          if (searchGrid) {
            searchGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-sub);">No tracks found for "${query}"</div>`;
          }
          return;
        }

        if (searchGrid) {
          searchGrid.innerHTML = results.map(track => `
            <div class="card-item" data-search-id="${track.id}">
              <div class="card-cover-wrapper">
                <img class="card-cover" src="${track.cover}" alt="${track.title}">
                <button class="btn-play-hover" title="Play Preview">
                  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
              <div class="card-title">${track.title}</div>
              <div class="card-artist">${track.artist}</div>
              <div class="card-meta-bar">
                <span style="font-size: 0.72rem; color: var(--text-muted);">${track.genre || 'Music'}</span>
                <button class="btn-log-track btn-primary" style="padding: 4px 10px; font-size: 0.72rem;">+ Journal</button>
              </div>
            </div>
          `).join('');

          // Bind search result clicks
          searchGrid.querySelectorAll('.card-item').forEach(card => {
            const trackId = card.dataset.searchId;
            const track = results.find(t => t.id === trackId);

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
      }, 300);
    });
  }

  bindPlatformModal() {
    const btnConnect = document.getElementById('btnOpenPlatformModal');
    const modal = document.getElementById('platformModal');
    const btnClose = document.getElementById('btnClosePlatformModal');
    const platformBtns = document.querySelectorAll('.btn-platform-option');

    if (btnConnect && modal) {
      btnConnect.addEventListener('click', () => modal.classList.add('active'));
    }

    if (btnClose && modal) {
      btnClose.addEventListener('click', () => modal.classList.remove('active'));
    }

    platformBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const platformName = btn.dataset.platform;
        StorageManager.savePlatform({
          name: platformName,
          connected: true,
          user: 'Music Lover',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          connectedAt: new Date().toISOString()
        });

        this.updatePlatformUI();
        if (modal) modal.classList.remove('active');
        this.showToast(`Connected to ${platformName}!`);
      });
    });
  }

  updatePlatformUI() {
    const p = StorageManager.getPlatform();
    const nameElem = document.getElementById('platformNameText');
    const statusDot = document.getElementById('platformStatusBadge');

    if (nameElem) nameElem.textContent = p.name || 'Not Connected';
    if (statusDot) {
      if (p.connected) statusDot.classList.add('connected');
      else statusDot.classList.remove('connected');
    }
  }

  bindBackupDataEvents() {
    const btnExport = document.getElementById('btnExportData');
    const btnImport = document.getElementById('btnImportData');
    const importInput = document.getElementById('importFileInput');
    const btnReset = document.getElementById('btnResetData');

    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const json = StorageManager.exportData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spotify_music_journal_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Journal data backup exported!');
      });
    }

    if (btnImport && importInput) {
      btnImport.addEventListener('click', () => importInput.click());
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          const success = StorageManager.importData(evt.target.result);
          if (success) {
            Journal.render();
            RecommendationEngine.render();
            Analytics.render();
            this.showToast('Journal restored from backup!');
          } else {
            alert('Invalid backup JSON file.');
          }
        };
        reader.readAsText(file);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Reset journal back to initial sample entries?')) {
          StorageManager.resetToDefaults();
          Journal.render();
          RecommendationEngine.render();
          Analytics.render();
          this.showToast('Journal reset to default demo entries.');
        }
      });
    }
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg style="width: 18px; height: 18px; fill: var(--primary);" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
