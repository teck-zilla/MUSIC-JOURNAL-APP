# Database safety
Activation: always on.
Job: control what the agent may run, write or change near any database.
Source: PRD 7.8, 7.10, 9.4. Structure rules are in data-model.md.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

## Never do
- Never run a command that opens a database connection. This covers prisma migrate, prisma db push, prisma db pull, prisma db seed, prisma db execute, prisma studio, psql, and starting the app or any test with a real database URL set. Why: one wrong command can destroy member journals, and Neon Free restores only the last 6 hours. (PRD 7.8)
- Never write DROP, TRUNCATE, or a DELETE or UPDATE with no WHERE clause, in any file. Why: the owner cannot review a run that has already happened.
- Never use queryRawUnsafe or executeRawUnsafe. Why: they send values as text and open the door to SQL injection. PRD 9.4 requires Prisma.sql.
- Never run prisma db push against production. Why: it can drop the hand written indexes and constraints. (PRD 9.4)
- Never edit a migration file the owner has already run. Write a new one. Why: edited history makes two databases differ.
- Never edit schema.prisma, or write a migration or seed file, unless the owner names the PRD ID for it. Why: the schema is the PRD 7.9 contract, and every change must trace to a requirement.

## Allowed
- Run these, which need no connection: prisma generate, prisma validate, prisma format, the type check, lint and build. Why: they check the work with no risk to data.
- Write migration SQL, seed scripts and tests when the owner names the PRD ID. Then give the owner the exact command to run, and stop. Why: only the owner runs anything that touches data.
- Before any change that drops, renames or rewrites existing data, stop and ask the owner to confirm a recent pg_dump. Why: the only backup beyond 6 hours is the owner's monthly manual dump. (PRD 7.8)
- Leave tests that need a database (the boundary test, the two member cache test) for the owner to run on a database the owner provides. Why: they create member rows. (PRD 8.6.6, FR-30)
