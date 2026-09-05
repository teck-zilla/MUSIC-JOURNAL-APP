/**
 * SPOTIFY MUSIC JOURNAL - MAIN APP CONTROLLER
 * Initializes components, real OAuth 2.0 streaming platform authentication (Spotify, Apple Music, Audiomack, SoundCloud),
 * view switching, live search handlers, streaming platform connections, and toast notifications.
 */

import { StorageManager } from './storage.js';
import { MusicAPI } from './api.js';
import { Player } from './player.js';
import { Journal } from './journal.js';
import { RecommendationEngine } from './recommendation.js';
import { Analytics } from './analytics.js';
import { SpotifyOAuth, SoundCloudOAuth, AppleMusicAuth, AudiomackAuth } from './oauth.js';

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

    // 3. Check for Real OAuth Callback Redirects (?code= or #access_token=)
    await this.handleOAuthRedirectCallback();

    // 4. Bind UI Events & Navigation
    this.bindNavigation();
    this.bindSearch();
    this.bindAuthEvents();
    this.bindSpotifySetupModal();
    this.bindPlatformModal();
    this.bindBackupDataEvents();

    // 5. Initial Renders
    Journal.render();
    RecommendationEngine.render();
    Analytics.render();
    this.updatePlatformUI();
    this.loadSavedApiCredentials();

    console.log('Spotify Music Journal App Initialized Successfully!');
  }

  /**
   * Auto-detects and processes OAuth callback parameters from Spotify / SoundCloud redirects
   */
  async handleOAuthRedirectCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const hash = window.location.hash;

    // 1. Spotify OAuth 2.0 Authorization Code Callback
    if (code) {
      this.showToast('Authenticating with Spotify...');
      const res = await SpotifyOAuth.handleCallback(code);
      if (res && res.profile) {
        StorageManager.saveAuthUser(res.profile);
        this.updatePlatformUI();
        this.showToast(`Authenticated as ${res.profile.displayName} on Spotify!`);
      }
      // Clean query string from browser address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // 2. SoundCloud OAuth Token Callback
    else if (hash && hash.includes('access_token')) {
      const hashParams = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = hashParams.get('access_token');
      if (accessToken) {
        this.showToast('Authenticating with SoundCloud...');
        const profile = await SoundCloudOAuth.fetchProfile(accessToken);
        StorageManager.saveAuthUser(profile);
        this.updatePlatformUI();
        this.showToast(`Authenticated as ${profile.displayName} on SoundCloud!`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
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
      this.showToast('Please log in to your platform profile to create journal entries');
      const loginModal = document.getElementById('loginModal');
      if (loginModal) loginModal.classList.add('active');
      return;
    }
    Journal.openModalForTrack(track);
  }

  bindAuthEvents() {
    const profileBtn = document.getElementById('userProfileBtn');
    const dropdown = document.getElementById('userProfileDropdown');
    const loginModal = document.getElementById('loginModal');
    const btnOpenLogin = document.getElementById('btnOpenLoginModal');
    const btnCloseLogin = document.getElementById('btnCloseLoginModal');
    const btnLogout = document.getElementById('btnLogout');

    // Real OAuth Buttons
    const btnSpotifyReal = document.getElementById('btnRealSpotifyLogin');
    const btnAppleReal = document.getElementById('btnRealAppleLogin');
    const btnAudiomackReal = document.getElementById('btnRealAudiomackLogin');
    const btnSoundcloudReal = document.getElementById('btnRealSoundcloudLogin');

    const spotifyClientInput = document.getElementById('customSpotifyClientId');
    const soundcloudKeyInput = document.getElementById('customSoundcloudKey');
    const appleDevTokenInput = document.getElementById('customAppleDevToken');

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

    // Modal Open/Close
    if (btnOpenLogin && loginModal) {
      btnOpenLogin.addEventListener('click', () => {
        loginModal.classList.add('active');
        if (dropdown) dropdown.classList.remove('active');
      });
    }

    if (btnCloseLogin && loginModal) {
      btnCloseLogin.addEventListener('click', () => {
        loginModal.classList.remove('active');
      });
    }

    // Save Custom API Credentials on Input Change
    const saveCreds = () => {
      const creds = {
        spotifyClientId: spotifyClientInput ? spotifyClientInput.value.trim() : '',
        soundcloudKey: soundcloudKeyInput ? soundcloudKeyInput.value.trim() : '',
        appleDevToken: appleDevTokenInput ? appleDevTokenInput.value.trim() : ''
      };
      StorageManager.saveApiCredentials(creds);
      return creds;
    };

    if (spotifyClientInput) spotifyClientInput.addEventListener('change', saveCreds);
    if (soundcloudKeyInput) soundcloudKeyInput.addEventListener('change', saveCreds);
    if (appleDevTokenInput) appleDevTokenInput.addEventListener('change', saveCreds);

    // 1. Real Spotify OAuth Login Trigger with Client ID Guard
    if (btnSpotifyReal) {
      btnSpotifyReal.addEventListener('click', async () => {
        const creds = saveCreds();
        const clientId = creds.spotifyClientId;

        if (!SpotifyOAuth.isValidClientId(clientId)) {
          // Open Spotify Client ID Setup Prompt modal instead of showing Spotify invalid_client error page!
          if (loginModal) loginModal.classList.remove('active');
          this.openSpotifySetupModal();
          return;
        }

        this.showToast('Redirecting to Spotify Authorization...');
        await SpotifyOAuth.login(clientId);
      });
    }

    // 2. Real Apple MusicKit Login Trigger
    if (btnAppleReal) {
      btnAppleReal.addEventListener('click', async () => {
        const creds = saveCreds();
        this.showToast('Launching Apple Music authorization...');
        const userProfile = await AppleMusicAuth.login(creds.appleDevToken);
        StorageManager.saveAuthUser(userProfile);
        this.updatePlatformUI();
        if (loginModal) loginModal.classList.remove('active');
        this.showToast(`Logged in as ${userProfile.displayName} on Apple Music!`);
      });
    }

    // 3. Real Audiomack Login Trigger
    if (btnAudiomackReal) {
      btnAudiomackReal.addEventListener('click', async () => {
        this.showToast('Connecting to Audiomack account...');
        const userProfile = await AudiomackAuth.login();
        StorageManager.saveAuthUser(userProfile);
        this.updatePlatformUI();
        if (loginModal) loginModal.classList.remove('active');
        this.showToast(`Logged in as ${userProfile.displayName} on Audiomack!`);
      });
    }

    // 4. Real SoundCloud OAuth Login Trigger
    if (btnSoundcloudReal) {
      btnSoundcloudReal.addEventListener('click', () => {
        const creds = saveCreds();
        const clientId = creds.soundcloudKey;

        if (!clientId) {
          this.showToast('Please enter your SoundCloud Client Key below or use instant login');
          return;
        }

        this.showToast('Connecting to SoundCloud...');
        SoundCloudOAuth.login(clientId);
      });
    }

    // Logout Action
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        StorageManager.logoutUser();
        if (dropdown) dropdown.classList.remove('active');
        if (loginModal) loginModal.classList.add('active');
        this.updatePlatformUI();
        this.showToast('Logged out of platform session');
      });
    }
  }

  openSpotifySetupModal() {
    const setupModal = document.getElementById('spotifySetupModal');
    const redirectInput = document.getElementById('redirectUriDisplayInput');
    const currentRedirectUri = window.location.origin + window.location.pathname;

    if (redirectInput) redirectInput.value = currentRedirectUri;
    if (setupModal) setupModal.classList.add('active');
  }

  bindSpotifySetupModal() {
    const setupModal = document.getElementById('spotifySetupModal');
    const btnClose = document.getElementById('btnCloseSpotifySetupModal');
    const form = document.getElementById('spotifyClientIdForm');
    const input = document.getElementById('promptSpotifyClientId');
    const btnCopy = document.getElementById('btnCopyRedirectUri');
    const btnDemo = document.getElementById('btnUseDemoSpotifyProfile');

    if (btnClose && setupModal) {
      btnClose.addEventListener('click', () => setupModal.classList.remove('active'));
    }

    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        const currentRedirectUri = window.location.origin + window.location.pathname;
        navigator.clipboard.writeText(currentRedirectUri).then(() => {
          this.showToast('Redirect URI copied to clipboard!');
        }).catch(() => {
          this.showToast('Redirect URI: ' + currentRedirectUri);
        });
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const enteredId = input ? input.value.trim() : '';

        if (!SpotifyOAuth.isValidClientId(enteredId)) {
          alert('Spotify Client IDs must be exactly 32 hexadecimal characters (0-9, a-f). Please check your entry from Spotify Developer Dashboard.');
          return;
        }

        const creds = StorageManager.getApiCredentials();
        creds.spotifyClientId = enteredId;
        StorageManager.saveApiCredentials(creds);

        const customInput = document.getElementById('customSpotifyClientId');
        if (customInput) customInput.value = enteredId;

        if (setupModal) setupModal.classList.remove('active');
        this.showToast('Saved Client ID! Redirecting to Spotify...');
        await SpotifyOAuth.login(enteredId);
      });
    }

    if (btnDemo) {
      btnDemo.addEventListener('click', () => {
        const userProfile = StorageManager.loginPlatform('spotify');
        this.updatePlatformUI();
        if (setupModal) setupModal.classList.remove('active');
        this.showToast(`Logged in as ${userProfile.displayName} (Spotify Demo Profile)!`);
      });
    }
  }

  loadSavedApiCredentials() {
    const creds = StorageManager.getApiCredentials();
    const spotifyInput = document.getElementById('customSpotifyClientId');
    const soundcloudInput = document.getElementById('customSoundcloudKey');
    const appleInput = document.getElementById('customAppleDevToken');

    if (spotifyInput && creds.spotifyClientId) spotifyInput.value = creds.spotifyClientId;
    if (soundcloudInput && creds.soundcloudKey) soundcloudInput.value = creds.soundcloudKey;
    if (appleInput && creds.appleDevToken) appleInput.value = creds.appleDevToken;
  }

  bindPlatformModal() {
    const btnConnect = document.getElementById('btnOpenPlatformModal');
    const modal = document.getElementById('platformModal');
    const btnClose = document.getElementById('btnClosePlatformModal');
    const platformBtns = document.querySelectorAll('.btn-platform-option');

    if (btnConnect && modal) {
      btnConnect.addEventListener('click', () => {
        const user = StorageManager.getAuthUser();
        if (!user.isLoggedIn) {
          const loginModal = document.getElementById('loginModal');
          if (loginModal) loginModal.classList.add('active');
        } else {
          modal.classList.add('active');
        }
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener('click', () => modal.classList.remove('active'));
    }

    platformBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const platformId = btn.dataset.platformId;
        const userProfile = StorageManager.loginPlatform(platformId);

        this.updatePlatformUI();
        if (modal) modal.classList.remove('active');
        this.showToast(`Switched active profile to ${userProfile.platform}!`);
      });
    });
  }

  updatePlatformUI() {
    const user = StorageManager.getAuthUser();

    // 1. Top Header User Profile Widget
    const nameElem = document.getElementById('userNameText');
    const avatarImg = document.getElementById('userAvatarImg');
    const badgeTag = document.getElementById('userPlatformBadge');
    const dropdownName = document.getElementById('dropdownDisplayName');
    const dropdownHandle = document.getElementById('dropdownHandle');

    if (nameElem) nameElem.textContent = user.isLoggedIn ? (user.displayName || 'Guest User') : 'Guest User';
    if (avatarImg && user.avatar) avatarImg.src = user.avatar;
    if (dropdownName) dropdownName.textContent = user.isLoggedIn ? (user.displayName || 'Guest User') : 'Guest User';
    if (dropdownHandle) dropdownHandle.textContent = user.isLoggedIn ? (user.handle || '@music_lover') : 'Logged Out';

    if (badgeTag) {
      if (user.isLoggedIn) {
        badgeTag.textContent = user.platform || 'Spotify';
        badgeTag.className = `user-platform-tag ${user.badgeClass || 'spotify'}`;
      } else {
        badgeTag.textContent = 'Log In';
        badgeTag.className = 'user-platform-tag logged-out';
      }
    }

    // 2. Sidebar Platform Status Card
    const platformNameText = document.getElementById('platformNameText');
    const platformHandleText = document.getElementById('platformHandleText');
    const statusDot = document.getElementById('platformStatusBadge');

    if (platformNameText) {
      platformNameText.textContent = user.isLoggedIn ? (user.badge || `${user.platform} Connected`) : 'Logged Out';
    }
    if (platformHandleText) {
      platformHandleText.textContent = user.isLoggedIn ? user.handle : 'Click to Log In';
    }

    if (statusDot) {
      statusDot.className = `platform-badge ${user.isLoggedIn ? (user.badgeClass || 'connected') : 'logged-out'}`;
    }

    // 3. Update Modal Platform Option Badges
    const options = document.querySelectorAll('.btn-platform-option');
    options.forEach(opt => {
      const optId = opt.dataset.platformId;
      const statusSpan = opt.querySelector('.platform-option-status');
      if (statusSpan) {
        if (user.isLoggedIn && user.platformId === optId) {
          statusSpan.textContent = 'Active ✓';
          statusSpan.style.color = user.color || 'var(--primary)';
        } else {
          statusSpan.textContent = 'Connect';
          statusSpan.style.color = 'var(--text-sub)';
        }
      }
    });

    // 4. Update Journal Modal Default Platform Selector
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
