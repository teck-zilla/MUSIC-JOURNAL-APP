-- PRD 7.10 - Database changes Prisma cannot write
-- Owner-run only. Agent must not execute DB commands (database-safety.md).
--
-- Apply by adding these statements to the FIRST migration SQL file:
--   1. Owner runs: npx prisma migrate dev --create-only --name init
--   2. Owner appends this file's contents into the generated migration.sql
--   3. Owner reviews, then runs: npx prisma migrate dev
--   4. Owner verifies LG-7: pgvector >= 0.8.0 before using iterative scan settings (A55)
--
-- Source: PRD 7.10, data-model.md

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "JournalEntry" ADD CONSTRAINT entry_rating_range CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE "JournalEntry" ADD CONSTRAINT entry_moods_count CHECK (cardinality(moods) BETWEEN 1 AND 3);

CREATE INDEX song_title_trgm  ON "Song" USING gin (title gin_trgm_ops);
CREATE INDEX song_artist_trgm ON "Song" USING gin (artist gin_trgm_ops);

CREATE INDEX songvector_moods_gin ON "SongVector" USING gin (moods);
CREATE INDEX songvector_hnsw ON "SongVector"
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
