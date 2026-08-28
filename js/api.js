/**
 * SPOTIFY MUSIC JOURNAL - LIVE MUSIC & SEARCH API INTEGRATION
 * Connects to iTunes Search API for real live music metadata, audio previews,
 * high-res cover art, and curated mood datasets.
 */

// Curated mood-based track collections for adaptive recommendations
const MOOD_TRACK_CATALOG = [
  {
    id: 'rec-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/32/3a/4b323a9d-5a1e-848e-f18c-32ec2349079a/20UMGIM07662.rgb.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo115/v4/bf/1d/15/bf1d154d-7c2a-9e1e-fbef-97b77e231e3d/mzaf_7822941198539268673.plus.aac.p.m4a',
    genre: 'Synthwave / Pop',
    mood: 'energetic',
    moodLabel: '⚡ Energetic'
  },
  {
    id: 'rec-2',
    title: 'Weightless',
    artist: 'Marconi Union',
    album: 'Weightless (Ambient)',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/f4/35/6b/f4356b6b-85ee-d0ea-e065-ef5647ddf16c/5055196321287.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo115/v4/07/70/4e/07704e6e-213c-fa70-761b-90f7a08e1ec2/mzaf_16487848039327857999.plus.aac.p.m4a',
    genre: 'Ambient / Chill',
    mood: 'chill',
    moodLabel: '☕ Chill'
  },
  {
    id: 'rec-3',
    title: 'Someone Like You',
    artist: 'Adele',
    album: '21',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/10/89/3e/10893e36-6e4b-a9a3-5c7a-6b834fa22d8e/886443315664.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo125/v4/66/c6/77/66c677f9-bd0f-fa93-4a1b-3fbb1c7a8bf6/mzaf_1333333333333333333.plus.aac.p.m4a',
    genre: 'Pop / Ballad',
    mood: 'melancholic',
    moodLabel: '🌧️ Melancholic'
  },
  {
    id: 'rec-4',
    title: 'Clair de Lune',
    artist: 'Claude Debussy',
    album: 'Debussy: Essential Piano',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e5/26/fa/e526fa12-6804-d023-741c-308832a829e1/00028948332152.rgb.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo125/v4/91/9f/c7/919fc79b-240a-5b12-9c3f-d31e8bb0f1c3/mzaf_11306354605175908078.plus.aac.p.m4a',
    genre: 'Classical',
    mood: 'focused',
    moodLabel: '🎯 Focused'
  },
  {
    id: 'rec-5',
    title: 'Don\'t Stop Me Now',
    artist: 'Queen',
    album: 'Jazz',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bd/d5/df/bdd5df3f-9177-3e28-1b20-1e58f01b333a/00602527718042.rgb.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo115/v4/71/3b/68/713b6801-b75b-df73-a55e-2b5074e5ad08/mzaf_15781329583794711674.plus.aac.p.m4a',
    genre: 'Classic Rock',
    mood: 'euphoric',
    moodLabel: '🚀 Euphoric'
  },
  {
    id: 'rec-6',
    title: 'Dreams',
    artist: 'Fleetwood Mac',
    album: 'Rumours',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/25/71/7b257127-be18-b235-9615-ff553a1bfab5/603497877393.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo125/v4/d9/bc/d0/d9bcd008-8e68-07bd-fa56-3b60381640a3/mzaf_8496466986505703901.plus.aac.p.m4a',
    genre: 'Soft Rock',
    mood: 'nostalgic',
    moodLabel: '🌅 Nostalgic'
  },
  {
    id: 'rec-7',
    title: 'HUMBLE.',
    artist: 'Kendrick Lamar',
    album: 'DAMN.',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/0d/bb/29/0dbb29fb-b83c-1b77-5085-f5bebb1dfed2/17UMGIM13075.rgb.jpg/600x600bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioVideo125/v4/9c/68/49/9c6849a6-1601-5250-93cb-33d3ab201083/mzaf_2689255850901594957.plus.aac.p.m4a',
    genre: 'Hip-Hop / Rap',
    mood: 'hype',
    moodLabel: '🔥 Hype'
  }
];

export const MusicAPI = {
  /**
   * Live search query to iTunes API with fallback to local catalog
   */
  async searchTracks(query) {
    if (!query || query.trim().length === 0) {
      return MOOD_TRACK_CATALOG;
    }

    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=18`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Search request failed');

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results.map(item => ({
          id: 'itunes-' + item.trackId,
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName || item.trackName,
          cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
          previewUrl: item.previewUrl || '',
          genre: item.primaryGenreName || 'Music',
          releaseDate: item.releaseDate ? item.releaseDate.substring(0, 4) : ''
        }));
      }
    } catch (error) {
      console.warn('Live API search error, falling back to internal catalog:', error);
    }

    // Fallback: search internal catalog
    const q = query.toLowerCase();
    return MOOD_TRACK_CATALOG.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.artist.toLowerCase().includes(q) || 
      t.genre.toLowerCase().includes(q)
    );
  },

  /**
   * Retrieves recommended tracks filtered by mood
   */
  getTracksByMood(mood) {
    if (!mood || mood === 'all') return MOOD_TRACK_CATALOG;
    return MOOD_TRACK_CATALOG.filter(t => t.mood === mood);
  },

  /**
   * Returns catalog list
   */
  getCatalog() {
    return MOOD_TRACK_CATALOG;
  }
};
