/**
 * SPOTIFY MUSIC JOURNAL - AUDIO PLAYER & CANVAS VISUALIZER
 * Manages audio playback, Web Audio API frequency analysis, and UI sync.
 */

let audioCtx = null;
let analyser = null;
let source = null;
let animFrameId = null;

const audio = new Audio();
audio.crossOrigin = 'anonymous';

export const Player = {
  currentTrack: null,
  isPlaying: false,

  init() {
    this.bindDOM();
    this.setupAudioListeners();
  },

  bindDOM() {
    this.dom = {
      cover: document.getElementById('playerCover'),
      title: document.getElementById('playerTitle'),
      artist: document.getElementById('playerArtist'),
      playBtn: document.getElementById('btnPlayPause'),
      playIcon: document.getElementById('playIcon'),
      pauseIcon: document.getElementById('pauseIcon'),
      progressFill: document.getElementById('progressFill'),
      progressBar: document.getElementById('progressBar'),
      currentTime: document.getElementById('currentTime'),
      durationTime: document.getElementById('durationTime'),
      volumeSlider: document.getElementById('volumeSlider'),
      canvas: document.getElementById('visualizerCanvas')
    };

    if (this.dom.volumeSlider) {
      audio.volume = parseFloat(this.dom.volumeSlider.value);
      this.dom.volumeSlider.addEventListener('input', (e) => {
        audio.volume = parseFloat(e.target.value);
      });
    }

    if (this.dom.playBtn) {
      this.dom.playBtn.addEventListener('click', () => this.togglePlay());
    }

    if (this.dom.progressBar) {
      this.dom.progressBar.addEventListener('click', (e) => {
        if (!audio.duration) return;
        const rect = this.dom.progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
      });
    }
  },

  setupAudioListeners() {
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      if (this.dom.progressFill) this.dom.progressFill.style.width = `${pct}%`;
      if (this.dom.currentTime) this.dom.currentTime.textContent = this.formatTime(audio.currentTime);
      if (this.dom.durationTime) this.dom.durationTime.textContent = this.formatTime(audio.duration);
    });

    audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.updatePlayStateUI();
      this.stopVisualizer();
    });

    audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updatePlayStateUI();
      this.startVisualizer();
    });

    audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updatePlayStateUI();
      this.stopVisualizer();
    });
  },

  playTrack(track) {
    if (!track) return;
    this.currentTrack = track;

    if (this.dom.cover) this.dom.cover.src = track.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80';
    if (this.dom.title) this.dom.title.textContent = track.title;
    if (this.dom.artist) this.dom.artist.textContent = track.artist;

    if (track.previewUrl) {
      audio.src = track.previewUrl;
      audio.play().catch(err => console.warn('Audio autoplay restricted:', err));
    } else {
      // Simulate playback if no preview URL available
      console.log('No preview URL for track, simulating player ui');
      this.isPlaying = true;
      this.updatePlayStateUI();
    }
  },

  togglePlay() {
    if (!this.currentTrack && !audio.src) return;

    if (audio.paused && audio.src) {
      audio.play();
    } else if (!audio.paused) {
      audio.pause();
    }
  },

  updatePlayStateUI() {
    if (!this.dom.playIcon || !this.dom.pauseIcon) return;

    if (this.isPlaying) {
      this.dom.playIcon.style.display = 'none';
      this.dom.pauseIcon.style.display = 'block';
    } else {
      this.dom.playIcon.style.display = 'block';
      this.dom.pauseIcon.style.display = 'none';
    }
  },

  formatTime(secs) {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  },

  /**
   * Initializes Web Audio API Analyzer for Visualizer Canvas
   */
  startVisualizer() {
    const canvas = this.dom.canvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Initialize Web Audio Context on user gesture/play
    if (!audioCtx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
      } catch (e) {
        console.warn('Web Audio API not allowed cross-origin or unsupported:', e);
      }
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const render = () => {
      if (!this.isPlaying) return;
      animFrameId = requestAnimationFrame(render);

      const bufferLength = analyser ? analyser.frequencyBinCount : 16;
      const dataArray = new Uint8Array(bufferLength);
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Fallback procedural animation if audio context is blocked
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.floor(Math.random() * 180) + 50;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#1db954';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth + 1;
      }
    };

    if (animFrameId) cancelAnimationFrame(animFrameId);
    render();
  },

  stopVisualizer() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    const canvas = this.dom.canvas;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
};
