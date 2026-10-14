# Definition of done
Activation: always on.
Job: decide when the agent may say a change is finished.
Source: AGENTS.md, PRD NFR-1. Launch gates are in launch-gates.md.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

- Run the type check, lint, test and build scripts listed in the README. If the README lists none, stop and ask. Why: the PRD names no scripts, and guessing leads to skipped checks.
- Show the command and its result for each check. Why: the owner cannot trust the word passed without output.
- Check every clause of the PRD text for the ID, one by one, and list each clause with pass or fail. Why: long requirements, such as FR-19 with five clauses, are the ones most often built in part.
- Remove console.log, commented out code and TODO before finishing. Why: logs can leak member data, and a TODO hides unfinished work.
- When the change touches a route, run the first load size check from ui-standards.md. Why: NFR-1 makes the build fail over budget.
- A check that needs a database counts as unrun. Name it and give the owner the command. Why: database-safety.md bars the agent from connecting.
- Report one status word: DONE, DONE WITH UNRUN CHECKS (list them), or BLOCKED (say what is needed). Why: done with a hidden caveat is the failure this file prevents.
- DONE means the code passes these checks. It does not mean launch ready. Why: some launch gates can only be passed by the owner. (launch-gates.md)
