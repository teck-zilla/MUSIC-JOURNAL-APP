# Data model
Activation: glob **/schema.prisma, **/prisma/**, **/*.sql, **/lib/db/**.
Job: say how code must use the schema and the vector column.
Source: PRD 7.9, 7.10, 8.2 to 8.5, 9.1 to 9.6. Who may run or change the database is in database-safety.md. Read that file before editing the schema or a migration.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

## Schema
- Keep schema.prisma equal to PRD 7.9. Any difference needs the owner's approval. Why: it is the agreed contract. When Better Auth changes, run its generate command and reconcile with 7.9.
- Write Prisma 6 syntax and pin the version in the README. Why: later majors move connection settings out of the schema file. (PRD 7.8, A47, unconfirmed)
- Keep the model names User, Session, Account and Verification. Why: the auth library maps to them. (PRD 7.3)
- Keep the unique pair of member and clientId on journal entries. Why: it makes repeat saves safe. (FR-19)
- Keep AUDIOMACK and BANDCAMP in the platform list though they are hidden. Why: adding them later then needs no migration. (A5)
- Keep every timestamp in UTC. Check listened at in code: no later than now plus 5 minutes and no earlier than 1 January 2000. Do not use a database check for it. Why: a rule based on the current time breaks later edits. (FR-15, PRD 7.10)
- Never delete a song row with source ITUNES or OFFLINE_SEED. Why: a delete cascades to entries and plays. (PRD 7.9 note)

## Vector column
- Keep the vector column optional and typed Unsupported with 768 dimensions. Read and write it only with raw SQL through Prisma.sql. Why: the Prisma client has no field for it. (PRD 9.4)
- Send the vector as a string like [0.01,-0.04] cast with ::vector. Divide it by its length before storing. Why: cosine search expects normalised vectors. (PRD 8.2, 9.4)
- Keep vectors for songs only. Never add a vector for an entry. Why: entries hold member text. (PRD 8.3)
- Put tier = 'FREE' and a source other than MANUAL in every song vector query. Why: a future paid tier needs no rewrite, and manual songs must never be recommended. (PRD 8.5)
- Run any query that needs SET LOCAL inside prisma.$transaction. Why: the setting lasts for one transaction, and Prisma runs one statement per call. (PRD 9.6)
- Change modelVersion whenever the embedding model or text template changes, then re-embed every row. Why: old and new vectors cannot be compared. (PRD 9.2)

## Hand written SQL
- Put only these in the first migration file: the vector and trigram extensions, the check on rating 1 to 5, the check on 1 to 3 moods per entry, the two trigram indexes on song title and artist, the moods index and the cosine HNSW index on song vectors. Why: Prisma cannot express them. (PRD 7.10)
- Run the version check from LG-7 before using the iterative scan setting. If pgvector is older than 0.8, drop that setting and raise ef_search to 200. Why: older versions do not know it. (A55)
