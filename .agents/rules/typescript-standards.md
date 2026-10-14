# TypeScript standards
Activation: always on.
Job: keep types honest at the edges, where a linter cannot help.
Source: PRD 9.4, NFR-5. Formatting, import order and unused variables belong to ESLint and Prettier config. Do not restate them here.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

- Keep strict mode on in tsconfig. Never loosen a compiler option to clear an error. Why: an error cleared by loosening comes back as a runtime bug.
- Never use any, as any or ts-ignore. Use unknown and narrow it. Why: they switch off the checks that catch wrong data shapes.
- Never use the non-null assertion on values from outside the code: request data, raw SQL results and outside API answers. Check them with Zod or an explicit test. Why: Prisma does not type raw SQL results, and the vector queries are raw. (PRD 9.4)
- Never leave a catch block empty or log only. Rethrow, return a typed error, or for jobs and outside calls write a SystemEvent row. Why: silent catches hide failures, and NFR-5 requires a record.
- Throw Error objects or subclasses, never strings. Why: strings carry no stack.
- Write comments in plain English and say why, not what. Why: the next reader needs the reason.
