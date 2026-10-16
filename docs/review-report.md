# Review findings: completion report

Work is on `fix/review-findings`, created from freshly fetched main `710786e`. The starting folder was clean. No existing tests/verifiers, images, CSS, level builders or deployment workflow were changed. No separate planned update was started. Main was not pushed or merged.

Baseline `node --test`: **339 passed, 0 failed**. Final runtime: **350 passed, 0 failed**, including 11 new tests. All original tests still pass. Numbers below record the full-suite run after each change, not just the new tests.

| Item | Meaning for someone playing | Status | Proof | Full suite vs baseline 339/0 |
| --- | --- | --- | --- | --- |
| 1. World edges | Sonic stops at the boundary and can turn away immediately. | fixed | New 200-tick Left test failed at velocity -14 before; passes at x=24 and velocity=0 after. Right-edge and immediate-turn tests pass. | 341/0 |
| 2. Sound/stage focus | Sound clicks and choosing a stage no longer trap the movement/jump keys. | fixed | Chromium reproduced ignored Right and Space re-toggling Sound; after the fix focus returns to the canvas, Right reaches controls and Space leaves Sound unchanged. Dropdown checked too. | 341/0 |
| 3. Phone/tablet controls | On-screen buttons remain absent until your decision. | needs my decision | Markup/styles/bindings inspected; unchanged. Existing browser check still confirms no touch buttons. | 341/0 at decision point; final 350/0 |
| 4. Small cleanups | Breakable objects draw the same; pool timing and splash are preserved. | not finished | Duplicate breakable branch removed; settled-frame pixel comparisons match. Requested water-call removal withheld because deleting the post-movement check changes crossing velocity and drops the splash. Two added water tests pass. | 343/0 |
| 5. Artwork loading | Less artwork downloads at startup; both acts and error fallbacks retain their settled appearance. | fixed | Act 1 loads 7 gameplay sheets, Act 2 loads 8, instead of 18. 360 raw canvas frames match main across both acts and 9 normal/missing-art cases. Startup/no-repeat-download browser assertions pass. Compression measured only. | 343/0 |
| 6. Surface calculations | Less repeated collision work, with the same checked landings/routes. | fixed | 13,566 identical player contact states and 9,044 identical surface queries vs pre-optimization code; all original route/physics tests pass. New cache, moving-roof and edge tests pass. | 348/0 |
| 7. Redraws | High-refresh screens avoid drawing unchanged playing frames. | fixed | Regression fails before and passes after; ready/paused/results and controlled browser frames still draw. Existing browser verifier passes. | 350/0 |
| Part 3. Proposals | Future maintenance ideas are written down; no redesign or publishing change is applied. | fixed | `docs/review-proposals.md` includes all five proposals, effort, risk and recommended next work. | Runtime remains at verified 350/0; docs only |

## Performance and measurements

The gameplay loader's PNG total falls from **34.32 MB** to **13.98 MB for Act 1** (59.3% less) or **16.15 MB for Act 2** (52.9% less). The separate six-sheet ending loader is unchanged and excluded from those figures. Nominal decoded gameplay images fall from 110.94 MB to 44.05 MB / 50.34 MB; these are size calculations, not whole-browser memory measurements.

Across the original 18 gameplay sheets, in-memory lossless WebP is **27.94 MB** (18.6% smaller), with every decoded RGBA byte identical. Palette PNG is **5.85 MB** (82.9% smaller), but every sheet loses exact pixel/color information. No human visual comparison proved that palette loss invisible. **No image file was converted, replaced or deleted.** Recommend considering lossless WebP separately; keep palette conversion off.

`cityTexture()` sensibly reuses one Scale2x result per source image. Its canvas has four times the source pixel area. Loaded images and their caches remain for the page lifetime; this is reuse rather than eviction on act switching. No clear bug was found, so it is unchanged. Details and per-sheet numbers: [review-assets.md](review-assets.md).

Pose calls during 200-tick update samples (drawing excluded):

| Scenario | Mean calls/tick before → after | Peak before → after |
| --- | ---: | ---: |
| Act 1 running | 233.42 → 16.42 | 629 → 23 |
| Act 1 initially airborne | 246.23 → 15.04 | 629 → 23 |
| Act 2 running | 1462.46 → 55.19 | 3333 → 65 |
| Act 2 initially airborne | 1401.18 → 52.91 | 3333 → 65 |

These use identical placements/inputs before and after; they do not reproduce the reviewer's exact route. The static-pose cache also saves allocations when call counts stay the same. Details: [review-performance.md](review-performance.md).

## Preserved behavior, limits and your decision

Removing the post-movement water check changed the crossing tick from horizontal velocity **4 to 8**, vertical velocity **1.145 to 4.58**, left the underwater flag false and omitted the splash. The pre-movement check also supplies correct water physics after a player placement or respawn. I recommend keeping both checks. Item 4 is marked unfinished because the requested removal was not made.

The intended feel changes are stopping at world edges and keeping keyboard control after Sound/stage selection. No settled artwork or sound redesign was made. Newly needed art may appear after downloading when switching acts; the initial loading sequence and failure recovery delay differ because fallback downloads now wait for an error. Transient loading frames were not compared pixel for pixel. High-refresh frames now draw only when game state changes, as requested.

Checked in Chromium: both acts, ordinary keyboard controls, Sound focus, dropdown focus, music play/pause/mute/restart, effect-event wiring, fullscreen, small-screen layout, pool arc, missing artwork and ending. The ending reaches results with its beats/events, frozen gameplay state, pause/resume, failed-art retry and act switching intact. The browser verifier also passes under `/sonic-coast/`, matching the Pages folder path.

Not verified: physical phones/tablets, a physical high-refresh display, Safari/Firefox, a human listening pass, every possible route/input combination, actual device memory/FPS, or a live Pages deployment. Direct local-file navigation was blocked by this environment's browser administrator policy, so I could not verify double-click launch here. The Windows batch file was inspected, not executed on Windows. No existing test failed.

**Do you want people to be able to play on phones and tablets with on-screen buttons?** I recommend **yes** if mobile play is intended. **Yes:** add Left, Right, Down/Roll, Jump and Boost buttons and test multi-touch, release behavior and HUD overlap. **No:** remove the unused touch CSS and input bindings in a separate cleanup. Default followed: neither change was made.

## A few minutes of play-testing

1. Choose **Act 1**, start, hold Left for a few seconds, then press Right. Sonic should stop at the edge and turn away immediately.
2. While running, click **Sound**, then use Left/Right, A/D and Space. Movement/jumping should work, and Space should not toggle Sound again.
3. In **Act 1**, run, jump, roll and briefly boost. Check the city background and Sonic's usual poses.
4. Choose **Act 2**, press Space to start, then move and jump. Check the burning-city background and Sonic artwork after loading.
5. Switch **Act 2 → Act 1 → Act 2**, starting each act. Both backgrounds and controls should keep working. Switching stages starts a fresh run, as before.
6. Press **P** to pause/resume, and **F** to enter/leave fullscreen. Listen for normal music behavior and check that the picture and controls resume.

## Play this branch without coding

1. Open [the review branch](https://github.com/coldbrokenplays88-cpu/sonic-coast/tree/fix/review-findings). Confirm the branch selector says **fix/review-findings**.
2. Click the green **Code** button, then **Download ZIP**.
3. Extract/unzip the downloaded file completely. Open its **Inferno-Ascent-Game** folder. Keep its **assets** folder in place beside **index.html**.
4. Double-click **index.html** and open it in Chrome or Edge. These instructions match the repository's `README.txt`; direct-file launch could not be tested in this managed browser.
5. On Windows, if the game is blank, double-click **RUN-GAME-WINDOWS.bat** in that same folder and leave its window open. It serves the folder and opens `http://127.0.0.1:8000`. It requires Python already installed; if it reports Python missing, it cannot provide that fallback until Python is installed. You do not need to type any commands.

## GitHub and merge recommendation

The branch was created and pushed successfully. Draft pull-request creation was attempted immediately after the tracking commit but **GitHub's API returned Forbidden**. I could not create or update a draft PR. The live checklist is [review-progress.md](review-progress.md), on this branch.

If you want to create the draft through GitHub's website: open [the branch comparison](https://github.com/coldbrokenplays88-cpu/sonic-coast/compare/main...fix/review-findings?expand=1), confirm **base: main** and **compare: fix/review-findings**, click **Create pull request**, then use the arrow beside the final create button to choose **Create draft pull request**. The task checklist and proof are in this report and `review-progress.md`. This website action is necessary only because API creation was denied; it does not deploy or merge the branch.

**Safe to merge as it stands: Yes**, based on the tests and browser checks above, after your requested play-test. Both water checks remain intentionally, and the phone decision is optional future work. Every runtime change is in a separate commit; no unsafe subset was identified. Independent review found no critical, important or minor issues in the runtime changes. That reviewer independently reran the 11 added tests and checked the diff; it reviewed, but did not rerun, my full-suite/browser/differential evidence.

| Item | Commit |
| --- | --- |
| 1. Edges | `bd96b01` |
| 2. Focus | `304985d` |
| 4. Breakable cleanup/water preservation | `8d26591` |
| 5. Loading | `16c5dea` |
| 6. Collision work | `8809e62` |
| 7. Drawing | `ca40891` |
| Part 3. Proposals | `a5868db` |

No commit was needed for item 3 because its default was to change nothing. Setup/progress and the final evidence report are documentation commits. You retain control of merging; I have not merged or pushed to main.
