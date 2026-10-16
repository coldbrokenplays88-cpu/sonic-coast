# Phase three implementation design

The owner approved implementing all five proposals and ruled out mobile play. Keep the tested game behavior, graphics and sound, preserve all existing test files and assertions, and leave merging/deployment to the owner. Base: freshly fetched main 548ac04 (the earlier fixes were merged by the owner). Starting working folder is clean. Work on refactor/phase-three, one reversible commit per proposal.

## Delivery

1. Build a clean Pages staging folder using only entry HTML, CSS, runtime and assets. Create a ready-to-play ZIP with a Windows launcher and instructions. CI builds/tests staging before upload; only the existing main trigger deploys.
2. Format authored runtime JS/HTML/CSS/YAML with pinned Prettier, preserving generated descriptors and every existing test.
3. Remove only assets/objects.png, assets/sonic.png and verified unused HUD/touch rules and button listeners. Preserve shared input, mouse boost, fullscreen and inherited HUD/layout rules.
4. Consolidate the three Act 2 runtime construction layers into one canonical data-backed builder. Preserve exact numbers, ordering and object aliases, restore the floorAt closure, and return fresh mutable data for each new run. Keep two inert filename shims required by unchanged test helpers; no old construction code remains in production.
5. Add canonical ES module sources with explicit imports. Mutable shared game data lives in a state module; renderer/model functions use explicit imports. Initialize modules in the established sequence to prevent circular-import timing changes. esbuild produces one ordinary browser script with a content-derived filename, retaining file-based distribution. Keep classic generated compatibility files for unchanged VM tests and the existing root test entry. They are generated from the same module definitions, not separately maintained gameplay. Build the published entry and player ZIP from modules. Expose an explicit browser inspection bridge for existing verification commands and their controlled state/function overrides.

## Verification

Baseline node --test: 350 passed, 0 failed. Run the complete unchanged suite after every proposal. Add staging/module/level tests as needed. Compare level values and aliases, floorAt queries and ordinary-input traces against 548ac04. Run Chromium checks against the built site under /sonic-coast/, compare normal and forced-failure raw canvas frames, and run ending verification. Check ZIP layout and resource completeness. Do not claim Windows/direct-file, physical-device, live-deployment or human-audio checks not actually performed.

## Rollback and limitations

Each proposal has its own commit; later architecture commits may depend on earlier build tooling. Revert dependent commits in reverse order. Do not publish, merge or push main. Draft PR API is currently Forbidden; attempt the authorized branch PR and report actual result. Pinned development tools are not player requirements. Preserve the original test helpers even where they require legacy filenames or script tags; the generated playable site excludes those compatibility files.
