import {
  Prisma,
  CounterKind,
  SongSource,
  SystemEventKind,
} from '@prisma/client';
import type { Song } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  DAILY_SEARCH_LIMIT,
  ITUNES_CALL_EVENT,
  ITUNES_CALLS_PER_MINUTE,
  ITUNES_RESULT_LIMIT,
  ITUNES_TIMEOUT_MS,
  SEARCH_CACHE_TTL_MS,
  parseItunesResponse,
  queryKeyFor,
  searchQuerySchema,
  startOfUtcDay,
  toSongResults,
  type SongCandidate,
  type SongSearchResponse,
} from '@/lib/song-search';

export const runtime = 'nodejs';

type ClaimResult = 'allowed' | 'daily_limit' | 'global_limit';
type ItunesLookup =
  { ok: true; tracks: SongCandidate[] } | { ok: false; status: number | null };

const GLOBAL_RATE_LOCK_KEY = 918273645;

function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

async function writeSystemEvent(
  kind: SystemEventKind,
  message: string,
  valueInt: number | null = null,
) {
  await prisma.systemEvent.create({
    data: { kind, message, valueInt },
  });
}

async function claimItunesSearch(userId: string): Promise<ClaimResult> {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended(${`member-search:${userId}`}, ${0}::bigint));`,
    );
    await tx.$queryRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(${GLOBAL_RATE_LOCK_KEY});`,
    );

    const day = startOfUtcDay(new Date());
    const counter = await tx.usageCounter.findUnique({
      where: { userId_day_kind: { userId, day, kind: CounterKind.SEARCH } },
      select: { count: true },
    });
    if (counter && counter.count >= DAILY_SEARCH_LIMIT) {
      return 'daily_limit';
    }

    const windowStart = new Date(Date.now() - 60 * 1000);
    const recentCalls = await tx.systemEvent.count({
      where: {
        kind: SystemEventKind.OTHER,
        message: ITUNES_CALL_EVENT,
        createdAt: { gte: windowStart },
      },
    });
    if (recentCalls >= ITUNES_CALLS_PER_MINUTE) {
      return 'global_limit';
    }

    await tx.systemEvent.create({
      data: { kind: SystemEventKind.OTHER, message: ITUNES_CALL_EVENT },
    });
    await tx.usageCounter.upsert({
      where: { userId_day_kind: { userId, day, kind: CounterKind.SEARCH } },
      update: { count: { increment: 1 } },
      create: { userId, day, kind: CounterKind.SEARCH, count: 1 },
    });

    return 'allowed';
  });
}

async function requestItunes(query: string): Promise<ItunesLookup> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=${ITUNES_RESULT_LIMIT}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(ITUNES_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const payload: unknown = await response.json();
    return { ok: true, tracks: parseItunesResponse(payload) };
  } catch {
    return { ok: false, status: null };
  }
}

async function upsertItunesTracks(tracks: SongCandidate[]): Promise<Song[]> {
  return Promise.all(
    tracks.map((track) =>
      prisma.song.upsert({
        where: { itunesTrackId: track.itunesTrackId },
        update: {
          title: track.title,
          artist: track.artist,
          album: track.album,
          genre: track.genre,
          releaseYear: track.releaseYear,
          durationMs: track.durationMs,
          artworkUrl: track.artworkUrl,
          previewUrl: track.previewUrl,
          trackViewUrl: track.trackViewUrl,
        },
        create: {
          itunesTrackId: track.itunesTrackId,
          title: track.title,
          artist: track.artist,
          album: track.album,
          genre: track.genre,
          releaseYear: track.releaseYear,
          durationMs: track.durationMs,
          artworkUrl: track.artworkUrl,
          previewUrl: track.previewUrl,
          trackViewUrl: track.trackViewUrl,
          source: SongSource.ITUNES,
        },
      }),
    ),
  );
}

async function searchCatalogue(query: string): Promise<Song[]> {
  return prisma.song.findMany({
    where: {
      inCatalogue: true,
      source: SongSource.OFFLINE_SEED,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { artist: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: [{ title: 'asc' }, { artist: 'asc' }],
    take: ITUNES_RESULT_LIMIT,
  });
}

async function cacheResults(
  queryKey: string,
  songs: Song[],
  source: SongSource,
): Promise<void> {
  await prisma.searchCache.upsert({
    where: { queryKey },
    update: {
      songIds: songs.map((song) => song.id),
      source,
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + SEARCH_CACHE_TTL_MS),
    },
    create: {
      queryKey,
      songIds: songs.map((song) => song.id),
      source,
      expiresAt: new Date(Date.now() + SEARCH_CACHE_TTL_MS),
    },
  });
}

async function readCachedResults(
  queryKey: string,
): Promise<SongSearchResponse | null> {
  const cache = await prisma.searchCache.findUnique({ where: { queryKey } });
  if (!cache || cache.expiresAt <= new Date()) return null;

  const songIds = cache.songIds.slice(0, ITUNES_RESULT_LIMIT);
  const rows = await prisma.song.findMany({
    where: { id: { in: songIds } },
    take: ITUNES_RESULT_LIMIT,
  });
  const byId = new Map(rows.map((song) => [song.id, song]));
  const songs = songIds.flatMap((id) => {
    const song = byId.get(id);
    return song ? [song] : [];
  });

  return {
    songs: toSongResults(songs),
    showingSavedSongs: cache.source === SongSource.OFFLINE_SEED,
  };
}

async function fallbackResponse(
  query: string,
  queryKey: string,
  message: string,
  status: number | null = null,
) {
  await writeSystemEvent(SystemEventKind.SEARCH_FALLBACK, message, status);
  const songs = await searchCatalogue(query);
  await cacheResults(queryKey, songs, SongSource.OFFLINE_SEED);
  return NextResponse.json({
    songs: toSongResults(songs),
    showingSavedSongs: true,
  });
}

export async function GET(request: Request) {
  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return jsonError(401, 'Sign in required');
    }

    const params = new URL(request.url).searchParams;
    const parsedQuery = searchQuerySchema.safeParse({
      q: params.get('q') ?? '',
    });
    if (!parsedQuery.success) {
      return jsonError(400, 'Invalid search query');
    }

    const query = parsedQuery.data.q;
    const queryKey = queryKeyFor(query);
    const cached = await readCachedResults(queryKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const claim = await claimItunesSearch(session.user.id);
    if (claim === 'daily_limit') {
      return jsonError(429, 'Daily search limit reached');
    }
    if (claim === 'global_limit') {
      return fallbackResponse(
        query,
        queryKey,
        'Global iTunes search limit reached',
      );
    }

    const lookup = await requestItunes(query);
    if (!lookup.ok) {
      await writeSystemEvent(
        SystemEventKind.OTHER,
        'ITUNES_FAIL',
        lookup.status,
      );
      return fallbackResponse(
        query,
        queryKey,
        'iTunes search unavailable',
        lookup.status,
      );
    }

    const songs = await upsertItunesTracks(lookup.tracks);
    await cacheResults(queryKey, songs, SongSource.ITUNES);
    return NextResponse.json({
      songs: toSongResults(songs),
      showingSavedSongs: false,
    });
  } catch {
    try {
      await writeSystemEvent(SystemEventKind.OTHER, 'SEARCH_FAIL');
    } catch {
      return jsonError(500, 'Search could not finish.');
    }
    return jsonError(500, 'Search could not finish.');
  }
}
