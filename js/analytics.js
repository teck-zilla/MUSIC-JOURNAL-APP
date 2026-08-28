/**
 * SPOTIFY MUSIC JOURNAL - ANALYTICS & INSIGHTS RENDERER
 * Visualizes listening stats, mood distribution charts, and journaling metrics.
 */

import { StorageManager } from './storage.js';

export const Analytics = {
  init() {
    window.addEventListener('journalUpdated', () => this.render());
  },

  render() {
    const entries = StorageManager.getEntries();
    
    // Total entries
    const totalElem = document.getElementById('statTotalEntries');
    if (totalElem) totalElem.textContent = entries.length;

    // Average rating
    const avgElem = document.getElementById('statAvgRating');
    if (avgElem) {
      if (entries.length === 0) {
        avgElem.textContent = '0.0';
      } else {
        const sum = entries.reduce((acc, curr) => acc + curr.rating, 0);
        avgElem.textContent = (sum / entries.length).toFixed(1) + ' ★';
      }
    }

    // Top Mood
    const topMoodElem = document.getElementById('statTopMood');
    const moodCounts = {};
    entries.forEach(e => {
      moodCounts[e.moodLabel || e.mood] = (moodCounts[e.moodLabel || e.mood] || 0) + 1;
    });

    let topMoodName = 'None';
    let maxCnt = 0;
    for (const [m, cnt] of Object.entries(moodCounts)) {
      if (cnt > maxCnt) {
        maxCnt = cnt;
        topMoodName = m;
      }
    }
    if (topMoodElem) topMoodElem.textContent = topMoodName;

    // Mood Breakdown Chart Bars
    const chartContainer = document.getElementById('moodChartContainer');
    if (chartContainer) {
      const moods = [
        { key: 'energetic', label: 'Energetic', color: '#ff416c' },
        { key: 'chill', label: 'Chill', color: '#4776e6' },
        { key: 'melancholic', label: 'Melancholic', color: '#614385' },
        { key: 'focused', label: 'Focused', color: '#11998e' },
        { key: 'euphoric', label: 'Euphoric', color: '#ff007f' },
        { key: 'nostalgic', label: 'Nostalgic', color: '#f2994a' },
        { key: 'hype', label: 'Hype', color: '#f857a6' }
      ];

      const counts = {};
      moods.forEach(m => counts[m.key] = 0);
      entries.forEach(e => {
        if (counts[e.mood] !== undefined) counts[e.mood]++;
      });

      const maxVal = Math.max(...Object.values(counts), 1);

      chartContainer.innerHTML = moods.map(m => {
        const val = counts[m.key];
        const heightPct = Math.max((val / maxVal) * 100, 8);
        return `
          <div class="bar-group">
            <div class="bar-fill" style="height: ${heightPct}%; background: ${m.color};" title="${val} entries">
              <span style="position: absolute; top: -20px; width: 100%; text-align: center; font-size: 0.7rem; font-weight: 700;">${val}</span>
            </div>
            <div class="bar-label">${m.label}</div>
          </div>
        `;
      }).join('');
    }
  }
};
