---
name: implement-endpoint
description: Use this skill when asked to build, change or test an API route listed in PRD section 7.4. It gives the order of work and one check for each step.
---

# Implement an endpoint

Build one route from the PRD 7.4 endpoint table. Build one route per run. If the row lists several methods, build all of them in this run.

Follow each step in order. Do not start a step until the check for the step before it passes. If a check fails, fix it or stop and ask the owner.

## Steps

1. Find the route.
   - Open the row for the route in PRD section 7.4. Open the FR or NFR the row cites.
   - Check: you can state the method, the path, the purpose and the PRD ID. If the route is not in 7.4, stop and ask. Do not add a path.

2. Create the route file.
   - Create the route handler in the route folder for the exact path in 7.4. Add one handler for each method the row lists.
   - Check: the folder path matches the 7.4 path, including every dynamic part such as [id] or [platform].

3. Mark the route public or session.
   - Public routes are the rows marked Public, or the row that needs the Authorization header with the cron secret. Every other row needs a session.
   - Check: the choice matches the row. Security rules are in security-and-secrets.md.

4. Write the input schema.
   - Write a Zod schema for the body, the query string and the route params. Take every field, length and allowed value from the FR text.
   - Check: each input the FR names is in the schema, and no extra field is. If the FR is silent on an input, stop and ask.

5. Add the session check.
   - Skip this step for public routes. For all others, read the member id from the session on the server.
   - Check: no code reads a member id from the body, the query string or the route params.

6. Add the daily limit check.
   - Do this only when PRD 6.10 lists a limit for the route. The routes are song search, entry save, Why this and reports.
   - Count in the daily counter for that kind. For search, count only a search that goes to iTunes. Rules are in outside-services.md and ai-boundary.md.
   - Check: the counter changes once per allowed request, and a request over the limit does not run the handler. If the PRD gives no response body for a request over the limit, stop and ask.

7. Write the handler.
   - Do the one job in the PRD purpose column. Read and write only the signed in member's rows. Return the shape the FR describes, with the status codes the FR