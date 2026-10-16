/**
 * SPOTIFY MUSIC JOURNAL - MAIN APP CONTROLLER
 * Initializes components, PRD-compliant demo streaming platform connections (Spotify, Apple Music, YT Music, Tidal),
 * view switching, live search handlers, and toast notifications.
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

  async init() {
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
    this.bindAuthEvents();
    this.bindPlatformModal();
    this.bindBackupDataEvents();

    // 4. Initial Renders
    Journal.render();
    RecommendationEngine.render();
    Analytics.render();
    this.updatePlatformUI();

    console.log('Spotify Music Journal App Initialized Successfully (PRD FR-7 to FR-10 Compliant)!');
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
                this.checkAuthAndOpenJournal(track);
                return;
              }
              Player.playTrack(track);
            });
          });
        }
      }, 300);
    });
  }

  checkAuthAndOpenJournal(track) {
    const user = StorageManager.getAuthUser();
    if (!user.isLoggedIn) {
      this.showToast('Please select a streaming platform demo connection to journal');
      const modal = document.getElementById('platformModal');
      if (modal) modal.classList.add('active');
      return;
    }
    Journal.openModalForTrack(track);
  }

  bindAuthEvents() {
    const profileBtn = document.getElementById('userProfileBtn');
    const dropdown = document.getElementById('userProfileDropdown');
    const btnOpenLogin = document.getElementById('btnOpenLoginModal');
    const btnLogout = document.getElementById('btnLogout');
    const platformModal = document.getElementById('platformModal');

    // Header Profile Dropdown Toggle
    if (profileBtn && dropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-profile-widget')) {
          dropdown.classList.remove('active');
        }
      });
    }

    // Modal Trigger from Dropdown
    if (btnOpenLogin && platformModal) {
      btnOpenLogin.addEventListener('click', () => {
        platformModal.classList.add('active');
        if (dropdown) dropdown.classList.remove('active');
      });
    }

    // Disconnect Action (PRD FR-10)
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        StorageManager.logoutUser();
        if (dropdown) dropdown.classList.remove('active');
        this.updatePlatformUI();
        this.showToast('Disconnected demo platform session');
      });
    }
  }

  bindPlatformModal() {
    const btnConnect = document.getElementById('btnOpenPlatformModal');
    const modal = document.getElementById('platformModal');
    const btnClose = document.getElementById('btnClosePlatformModal');
    const btnDisconnectModal = document.getElementById('btnDisconnectDemo');
    const platformBtns = document.querySelectorAll('.btn-platform-option');

    // Open Modal from Sidebar
    if (btnConnect && modal) {
      btnConnect.addEventListener('click', () => {
        modal.classList.add('active');
      });
    }

    // Close Modal
    if (btnClose && modal) {
      btnClose.addEventListener('click', () => modal.classList.remove('active'));
    }

    // Disconnect from inside Modal (PRD FR-10)
    if (btnDisconnectModal) {
      btnDisconnectModal.addEventListener('click', () => {
        StorageManager.logoutUser();
        this.updatePlatformUI();
        if (modal) modal.classList.remove('active');
        this.showToast('Disconnected from demo platform');
      });
    }

    // Connect / Switch Demo Platform (PRD FR-7 to FR-10)
    platformBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const platformId = btn.dataset.platformId;
        const userProfile = StorageManager.loginPlatform(platformId);

        this.updatePlatformUI();
        if (modal) modal.classList.remove('active');
        this.showToast(`Connected to ${userProfile.platform} (Demo)!`);
      });
    });
  }

  updatePlatformUI() {
    const user = StorageManager.getAuthUser();

    // 1. Top Header User Profile Widget (PRD FR-9)
    const nameElem = document.getElementById('userNameText');
    const avatarImg = document.getElementById('userAvatarImg');
    const badgeTag = document.getElementById('userPlatformBadge');
    const dropdownName = document.getElementById('dropdownDisplayName');
    const dropdownHandle = document.getElementById('dropdownHandle');

    if (nameElem) nameElem.textContent = user.isLoggedIn ? (user.displayName || 'Alex Vance') : 'Guest User';
    if (avatarImg && user.avatar) avatarImg.src = user.avatar;
    if (dropdownName) dropdownName.textContent = user.isLoggedIn ? (user.displayName || 'Alex Vance') : 'Guest User';
    if (dropdownHandle) dropdownHandle.textContent = user.isLoggedIn ? (user.handle || '@alexvance') : 'Logged Out';

    if (badgeTag) {
      if (user.isLoggedIn) {
        badgeTag.textContent = `${user.platform} (Demo)`;
        badgeTag.className = `user-platform-tag ${user.badgeClass || 'spotify'}`;
      } else {
        badgeTag.textContent = 'Demo (Disconnected)';
        badgeTag.className = 'user-platform-tag logged-out';
      }
    }

    // 2. Sidebar Platform Status Card (PRD FR-9)
    const platformNameText = document.getElementById('platformNameText');
    const platformHandleText = document.getElementById('platformHandleText');
    const statusDot = document.getElementById('platformStatusBadge');

    if (platformNameText) {
      platformNameText.textContent = user.isLoggedIn ? `${user.platform} (Demo)` : 'Not Connected (Demo)';
    }
    if (platformHandleText) {
      platformHandleText.textContent = user.isLoggedIn ? 'Demo Connection' : 'Click to Connect (Demo)';
    }

    if (statusDot) {
      statusDot.className = `platform-badge ${user.isLoggedIn ? (user.badgeClass || 'connected') : 'logged-out'}`;
    }

    // 3. Update Modal Platform Option Badges (PRD FR-8, FR-9)
    const options = document.querySelectorAll('.btn-platform-option');
    options.forEach(opt => {
      const optId = opt.dataset.platformId;
      const statusSpan = opt.querySelector('.platform-option-status');
      if (statusSpan) {
        if (user.isLoggedIn && user.platformId === optId) {
          statusSpan.textContent = 'Active (Demo) ✓';
          statusSpan.style.color = user.color || 'var(--primary)';
        } else {
          statusSpan.textContent = 'Connect (Demo)';
          statusSpan.style.color = 'var(--text-sub)';
        }
      }
    });

    // 4. Update Journal Modal Default Platform Selector (PRD FR-7)
    const platformSelect = document.getElementById('journalPlatformSelect');
    if (platformSelect && user.isLoggedIn && user.platform) {
      platformSelect.value = user.platform;
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
            this.updatePlatformUI();
            this.loadSavedApiCredentials();
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
          this.updatePlatformUI();
          this.loadSavedApiCredentials();
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
