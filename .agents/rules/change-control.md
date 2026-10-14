# Change control
Activation: always on.
Job: make every change reviewable and reversible, one PRD ID at a time.
Source: AGENTS.md "How to work". This file adds git steps and the summary format only.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

- Work on one branch per PRD ID. Name it with the lower case ID and a short phrase, for example fr-19-repeat-save. Why: the owner can review or undo one requirement.
- Never commit to main. Why: main must always be what the owner reviewed.
- Start every commit message with the PRD ID. Why: the git log then traces to the PRD.
- Never force push or rewrite shared history. Why: lost work cannot be recovered.
- Delete only files the change created. Why: tidying can remove work the owner wanted.
- Never edit the PRD, AGENTS.md or any file in .agents/rules. Propose the edit in the reply and wait. Why: these files are the control surface, and an agent that edits its own rules removes the control.
- Keep .env files, build output and node_modules in .gitignore. Why: they hold secrets or bulk that should not be committed.
- End every change with one summary in this order: PRD ID, files changed, commands run with results, open gates that touch the change, assumptions. Why: the owner reviews from this summary, and one fixed shape makes gaps visible.
