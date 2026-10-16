# Phase three progress

Base: main 548ac04. Branch: refactor/phase-three. Owner approved all five proposals and no mobile play. Existing working folder clean. Baseline game suite: 350 passed, 0 failed.

- [ ] Publish only playable files and package a player ZIP.
- [ ] Format authored code, leaving tests/generated metadata alone.
- [ ] Remove verified unused artwork, HUD and touch code.
- [ ] Consolidate Act 2 with exact data/alias/route checks.
- [ ] Move production to explicit modules and one esbuild script.
- [ ] Final review, complete checks, push and attempt draft PR.

Execution: inline. The owner's instruction to do all the work without code review/commands supersedes skill review pauses. Ruling: preserve existing VM tests through generated classic compatibility files; ship only the module build. Cost: compatibility generation must be checked for freshness. Ruling: preserve the two old Act 2 filenames as inert helper shims rather than edit existing test helpers; production omits them.
