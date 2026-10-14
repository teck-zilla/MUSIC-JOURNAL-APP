# UI standards
Activation: glob **/*.tsx, **/*.css, **/components/**, **/app/**.
Job: hold the size, access and browser rules that apply to every screen. Visual design is not covered here.
Source: PRD G4, NFR-1, NFR-2, FR-33, A8.
If this file and the PRD disagree, the PRD wins. Stop and tell the owner.

- Keep first load JavaScript at 150 KB gzipped or less for each route. Make the build step fail above it. Why: the persona buys about 1 GB of data a week. (NFR-1)
- Keep every JSON response at 50 KB gzipped or less. Why: goal G4.
- Do not claim the load times in G4 (cold under 3 seconds, warm under 2 seconds at p75). The owner measures them with Vercel Speed Insights at a sample rate of 0.25. Why: an agent cannot measure p75 from real members. (PRD 3.1)
- Use no chart library. Draw bars with plain SVG or CSS. Why: a chart library adds script weight that breaks the budget. (FR-33, NFR-1)
- Load the Insights code only when the Insights screen opens. Why: it keeps first load light. (FR-33)
- Give every chart a Show as table control. Why: charts alone fail screen readers. (FR-33)
- Meet WCAG 2.2 level AA on sign in, search, the Journal Modal and the journal list. Make stars a radio group and mood chips toggle buttons. Keep text contrast at 4.5 to 1 or better. Label every input and make every action work by keyboard. Why: NFR-2.
- Support the latest 2 versions of Chrome, Safari (iOS 16.4 and later), Firefox and Edge. Why: A8, so the test list is fixed.
- Load album art lazily. Why: it saves data on the first screen. (FR-12)
