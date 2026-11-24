import { createHash } from 'node:crypto';
import type { Song, SongSource } from '@prisma/client';
import { z } from 'zod';

export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_MIN_QUERY_LENGTH = 2;
export const ITUNES_RESULT_LIMIT = 20;
export const ITUNES_TIMEOUT_MS = 3000;
export const ITUNES_CALLS_PER_MINUTE = 15;
export const DAILY_SEARCH_LIMIT = 200;
export const SEARCH_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const ITUNES_CALL_EVENT = 'ITUNES_CALL';

export const searchQuerySchema = z.object({
  q: z.string().trim().min(SEARCH_MIN_QUERY_LENGTH),
});

const itunesTrackSchema = z.object({
  trackId: z.number().int().positive(),
  trackName: z.string().min(1),
  artistName: z.string().min(1),
  collectionName: z.string().optional(),
  primaryGenreName: z.string().optional(),
  releaseDate: z.string().optional(),
  trackTimeMillis: z.number().int().nonnegative().optional(),
  artworkUrl100: z.url().optional(),
  previewUrl: z.url().optional(),
  trackViewUrl: z.url().optional(),
});

const itunesResponseSchema = z.object({
  resultCount: z.number().int().nonnegative(),
  results: z.array(itunesTrackSchema),
});

export type SongCandidate = {
  itunesTrackId: number;
  title: string;
  artist: string;
  album: string | null;
  genre: string | null;
  releaseYear: number | null;
  durationMs: number | null;
  artworkUrl: string | null;
  previewUrl: string | null;
  trackViewUrl: string | null;
  source: SongSource;
};

export type SongSearchResult = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  artworkUrl: string | null;
  previewUrl: string | null;
  trackViewUrl: string | null;
  source: SongSource;
};

export type SongSearchResponse = {
  songs: SongSearchResult[];
  showingSavedSongs: boolean;
};

function clampText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function parseReleaseYear(releaseDate: string | undefined): number | null {
  if (!releaseDate) return null;
  const match = /^(\d{4})/.exec(releaseDate);
  const year = match?.[1];
  return year ? Number(year) : null;
}

export function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

export function queryKeyFor(query: string): string {
  return createHash('sha256').update(normalizeQuery(query)).digest('hex');
}

export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function parseItunesResponse(payload: unknown): SongCandidate[] {
  const result = itunesResponseSchema.safeParse(payload);
  if (!result.success) {
    throw new Error('Invalid iTunes response');
  }

  return result.data.results.slice(0, ITUNES_RESULT_LIMIT).map((track) => ({
    itunesTrackId: track.trackId,
    title: clampText(track.trackName, 300),
    artist: clampText(track.artistName, 300),
    album: track.collectionName ? clampText(track.collectionName, 300) : null,
    genre: track.primaryGenreName
      ? clampText(track.primaryGenreName, 60)
      : null,
    releaseYear: parseReleaseYear(track.releaseDate),
    durationMs: track.trackTimeMillis ?? null,
    artworkUrl: track.artworkUrl100 ?? null,
    previewUrl: track.previewUrl ?? null,
    trackViewUrl: track.trackViewUrl ?? null,
    source: 'ITUNES',
  }));
}

export function toSongResults(songs: Song[]): SongSearchResult[] {
  return songs.map((song) => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    artworkUrl: song.artworkUrl,
    previewUrl: song.previewUrl,
    trackViewUrl: song.trackViewUrl,
    source: song.source,
  }));
}
