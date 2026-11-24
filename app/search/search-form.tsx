'use client';

import { useEffect, useState } from 'react';
import type { SongSearchResult } from '@/lib/song-search';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const SEARCH_SOURCES = new Set(['ITUNES', 'OFFLINE_SEED', 'MANUAL']);

type SearchResponse = {
  songs: SongSearchResult[];
  showingSavedSongs: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSong(value: unknown): value is SongSearchResult {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.artist === 'string' &&
    (value.album === null || typeof value.album === 'string') &&
    (value.artworkUrl === null || typeof value.artworkUrl === 'string') &&
    (value.previewUrl === null || typeof value.previewUrl === 'string') &&
    (value.trackViewUrl === null || typeof value.trackViewUrl === 'string') &&
    typeof value.source === 'string' &&
    SEARCH_SOURCES.has(value.source)
  );
}

function isSearchResponse(value: unknown): value is SearchResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.songs) &&
    value.songs.every(isSong) &&
    typeof value.showingSavedSongs === 'boolean'
  );
}

function readError(value: unknown): string | null {
  if (!isRecord(value) || !('error' in value)) return null;
  const error: unknown = value.error;
  return typeof error === 'string' ? error : null;
}

export function SearchForm() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<SongSearchResult[]>([]);
  const [showingSavedSongs, setShowingSavedSongs] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setMessage('Searching...');
      const request = async () => {
        try {
          const response = await fetch(
            `/api/songs/search?q=${encodeURIComponent(trimmed)}`,
            {
              signal: controller.signal,
              headers: { Accept: 'application/json' },
            },
          );
          const payload: unknown = await response.json();

          if (!response.ok) {
            setSongs([]);
            setShowingSavedSongs(false);
            setMessage(
              readError(payload) ??
                'Search could not finish. Please try again.',
            );
            return;
          }
          if (!isSearchResponse(payload)) {
            setSongs([]);
            setShowingSavedSongs(false);
            setMessage('Search could not finish. Please try again.');
            return;
          }

          setSongs(payload.songs);
          setShowingSavedSongs(payload.showingSavedSongs);
          setMessage(null);
        } catch {
          if (controller.signal.aborted) return;
          setSongs([]);
          setShowingSavedSongs(false);
          setMessage('Search could not finish. Please try again.');
        }
      };

      void request();
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <section>
      <label htmlFor="song-search">Song search</label>
      <input
        id="song-search"
        type="search"
        value={query}
        onChange={(event) => {
          const nextQuery = event.target.value;
          setQuery(nextQuery);
          if (nextQuery.trim().length < MIN_QUERY_LENGTH) {
            setSongs([]);
            setShowingSavedSongs(false);
            setMessage(null);
          }
        }}
      />

      <p aria-live="polite">{message}</p>
      {showingSavedSongs ? <p>Showing saved songs.</p> : null}

      <ul>
        {songs.map((song) => (
          <li key={song.id}>
            <strong>{song.title}</strong> — {song.artist}
            {song.album ? ` · ${song.album}` : ''}
          </li>
        ))}
      </ul>
    </section>
  );
}
