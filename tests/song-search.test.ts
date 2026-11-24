import { describe, expect, it } from 'vitest';

import {
  ITUNES_RESULT_LIMIT,
  parseItunesResponse,
  queryKeyFor,
  searchQuerySchema,
  startOfUtcDay,
} from '../lib/song-search';

function itunesPayload(count: number) {
  return {
    resultCount: count,
    results: Array.from({ length: count }, (_, index) => ({
      trackId: index + 1,
      trackName: `Song ${index + 1}`,
      artistName: `Artist ${index + 1}`,
      collectionName: `Album ${index + 1}`,
      primaryGenreName: 'Pop',
      releaseDate: '2026-10-13T19:42:00Z',
      trackTimeMillis: 210000,
      artworkUrl100: 'https://example.test/art100.jpg',
      previewUrl: 'https://example.test/preview.m4a',
      trackViewUrl: 'https://example.test/song',
    })),
  };
}

describe('song search helpers', () => {
  it('accepts a trimmed query of at least two characters', () => {
    expect(searchQuerySchema.parse({ q: '  abc  ' })).toEqual({ q: 'abc' });
    expect(searchQuerySchema.safeParse({ q: 'a' }).success).toBe(false);
  });

  it('makes a stable cache key from case and spacing', () => {
    expect(queryKeyFor('  Too  High ')).toBe(queryKeyFor('too high'));
    expect(queryKeyFor('too high')).toHaveLength(64);
  });

  it('caps iTunes results at 20 and maps public song fields', () => {
    const songs = parseItunesResponse(itunesPayload(ITUNES_RESULT_LIMIT + 5));
    expect(songs).toHaveLength(ITUNES_RESULT_LIMIT);
    expect(songs[0]).toMatchObject({
      itunesTrackId: 1,
      title: 'Song 1',
      artist: 'Artist 1',
      album: 'Album 1',
      genre: 'Pop',
      releaseYear: 2026,
      durationMs: 210000,
      source: 'ITUNES',
    });
  });

  it('rejects an invalid iTunes payload', () => {
    expect(() =>
      parseItunesResponse({ resultCount: 1, results: [{}] }),
    ).toThrow('Invalid iTunes response');
  });

  it('starts the daily counter at UTC midnight', () => {
    expect(
      startOfUtcDay(new Date('2026-11-24T23:59:59.000Z')).toISOString(),
    ).toBe('2026-11-24T00:00:00.000Z');
  });
});
