/**
 * SPOTIFY MUSIC JOURNAL - WEB STORAGE MANAGER
 * Handles localStorage persistence, multi-platform user authentication,
 * initial seed data, and JSON backup/restore.
 */

const STORAGE_KEYS = {
  JOURNAL_ENTRIES: 'spotify_journal_entries_v1',
  CONNECTED_PLATFORM: 'spotify_journal_platform_v1',
  USER_PREFERENCES: 'spotify_journal_prefs_v1',
  AUTH_USER: 'spotify_journal_auth_user_v2'
};

// Preset User Profiles for Multi-Platform Login
const PLATFORM_PROFILES = {
  spotify: {
    platform: 'Spotify',
    platformId: 'spotify',
    displayName: 'Alex Vance',
    handle: '@alexvance_sp',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    badge: 'Spotify Premium',
    badgeClass: 'spotify',
    color: '#1db954',
    isLoggedIn: true
  },
  apple: {
    platform: 'Apple Music',
    platformId: 'apple',
    displayName: 'Alex Vance',
    handle: '@alexvance_am',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    badge: 'Apple Music Subscriber',
    badgeClass: 'apple',
    color: '#fc3c44',
    isLoggedIn: true
  },
  audiomack: {
    platform: 'Audiomack',
    platformId: 'audiomack',
    displayName: 'Alex Vance',
    handle: '@alexvance_amk',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    badge: 'Audiomack VIP',
    badgeClass: 'audiomack',
    color: '#ffa200',
    isLoggedIn: true
  },
  soundcloud: {
    platform: 'SoundCloud',
    platformId: 'soundcloud',
    displayName: 'Alex Vance',
    handle: '@alexvance_sc',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    badge: 'SoundCloud Next Pro',
    badgeClass: 'soundcloud',
    color: '#ff5500',
    isLoggedIn: true
  }
};

// Initial Seed Data for Instant Visual Experience
const INITIAL_SEED_ENTRIES = [
  {
    id: 'seed-1',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/bf/20/38/bf20387d-2a1d-2139-2a9d-5a676b05216e/16UMGIM56475.rgb.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo115/v4/4b/7d/51/4b7d51e7-817f-0565-df0b-222bfec7bd36/mzaf_10034638708304958156.plus.aac.p.m4a',
    genre: 'R&B / Synthwave',
    rating: 5,
    mood: 'hype',
    moodLabel: '🔥 Hype',
    context: 'Late Night Drive',
    note: 'Unbelievable synthbass drop! Perfect track when cruising down the highway past midnight. Pure futuristic vibes.',
    platform: 'Spotify',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isFavorite: true
  },
  {
    id: 'seed-2',
    title: 'Get Lucky',
    artist: 'Daft Punk ft. Pharrell Williams',
    album: 'Random Access Memories',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bf/6d/46/bf6d460e-ae18-4299-4d69-35a2d67a18bb/886443834375.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo125/v4/b8/9a/3c/b89a3c22-b5e1-884a-faeb-78ef9c7924ef/mzaf_8462705705353592823.plus.aac.p.m4a',
    genre: 'Disco / Funk',
    rating: 5,
    mood: 'energetic',
    moodLabel: '⚡ Energetic',
    context: 'Weekend Party',
    note: 'Nile Rodgers rhythm guitar line is clean perfection. Instant mood booster that makes everyone move.',
    platform: 'Spotify',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isFavorite: true
  },
  {
    id: 'seed-3',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bc/c7/28/bcc728d8-7b96-6415-f5fb-d26b9a896aa3/886443194097.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo115/v4/44/14/0f/44140f7b-6003-8d07-2c97-6a15758cf196/mzaf_4724991189498263158.plus.aac.p.m4a',
    genre: 'Indie Electronic',
    rating: 4,
    mood: 'nostalgic',
    moodLabel: '🌅 Nostalgic',
    context: 'Sunset Walk',
    note: 'That legendary sax solo at the end gives me goosebumps every single time. 80s synth nostalgia at its peak.',
    platform: 'Apple Music',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    isFavorite: false
  },
  {
    id: 'seed-4',
    title: 'Resonance',
    artist: 'HOME',
    album: 'Odyssey',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a4/09/b8/a409b8d2-430c-1798-251f-d2f16efbc2ea/cover.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo124/v4/37/ef/52/37ef5202-bdfa-b280-994c-83b3341bdf0d/mzaf_7852230491866762395.plus.aac.p.m4a',
    genre: 'Chillwave',
    rating: 5,
    mood: 'chill',
    moodLabel: '☕ Chill',
    context: 'Deep Focus Coding',
    note: 'Warm analogue synthesizers looping effortlessly. Kept me in the flow state for 3 hours straight.',
    platform: 'SoundCloud',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    isFavorite: true
  }
];

export const StorageManager = {
  /**
   * Initializes Storage with seed data if empty
   */
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES)) {
      this.saveEntries(INITIAL_SEED_ENTRIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTH_USER)) {
      this.saveAuthUser(PLATFORM_PROFILES.spotify);
    }
  },

  /**
   * Returns current authenticated user profile
   */
  getAuthUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return data ? JSON.parse(data) : PLATFORM_PROFILES.spotify;
    } catch (e) {
      return PLATFORM_PROFILES.spotify;
    }
  },

  /**
   * Saves user authentication state
   */
  saveAuthUser(userProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(userProfile));
    } catch (e) {
      console.error('Failed to save auth profile:', e);
    }
  },

  /**
   * Authenticates user using platform profile ID (spotify, apple, audiomack, soundcloud)
   */
  loginPlatform(platformId, customData = {}) {
    const preset = PLATFORM_PROFILES[platformId] || PLATFORM_PROFILES.spotify;
    const userProfile = {
      ...preset,
      ...customData,
      isLoggedIn: true,
      lastLogin: new Date().toISOString()
    };
    this.saveAuthUser(userProfile);
    return userProfile;
  },

  /**
   * Logs out current user session
   */
  logoutUser() {
    const current = this.getAuthUser();
    const loggedOutUser = {
      ...current,
      isLoggedIn: false
    };
    this.saveAuthUser(loggedOutUser);
    return loggedOutUser;
  },

  /**
   * Returns available platform profile presets
   */
  getPlatformPresets() {
    return PLATFORM_PROFILES;
  },

  /**
   * Retrieves all journal entries sorted by newest first
   */
  getEntries() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read entries from storage:', e);
      return [];
    }
  },

  /**
   * Saves entry array to localStorage
   */
  saveEntries(entries) {
    try {
      localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save entries to storage:', e);
    }
  },

  /**
   * Adds or updates a journal entry
   */
  addEntry(entry) {
    const entries = this.getEntries();
    const existingIdx = entries.findIndex(e => e.id === entry.id);
    
    if (existingIdx >= 0) {
      entries[existingIdx] = { ...entries[existingIdx], ...entry };
    } else {
      entries.unshift({
        ...entry,
        id: entry.id || 'entry-' + Date.now(),
        createdAt: entry.createdAt || new Date().toISOString(),
        isFavorite: entry.isFavorite || false
      });
    }
    this.saveEntries(entries);
    return entries;
  },

  /**
   * Toggles favorite status of an entry
   */
  toggleFavorite(entryId) {
    const entries = this.getEntries();
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      entry.isFavorite = !entry.isFavorite;
      this.saveEntries(entries);
    }
    return entries;
  },

  /**
   * Removes an entry by ID
   */
  deleteEntry(entryId) {
    const entries = this.getEntries().filter(e => e.id !== entryId);
    this.saveEntries(entries);
    return entries;
  },

  /**
   * Exports backup JSON string
   */
  exportData() {
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      entries: this.getEntries(),
      authUser: this.getAuthUser()
    };
    return JSON.stringify(payload, null, 2);
  },

  /**
   * Imports backup JSON data
   */
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.entries)) {
        this.saveEntries(data.entries);
      }
      if (data.authUser) {
        this.saveAuthUser(data.authUser);
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  /**
   * Resets data back to initial seed data
   */
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.JOURNAL_ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    this.init();
  }
};
