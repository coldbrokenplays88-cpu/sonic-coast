# Momentum follow-ups

Starting branch: `codex/playtest-physics`; starting commit:
`78ac0816f06fcf95c2b4f80b9b7eb896506f9cf2`. Main lacks both experimental
controllers. Worktree was clean. Node24.19.0/npm11.9.0.
Baseline:563 game tests,10 build tests,`npm run build` passed.

The supplied description predates Act2's migration. Preserve its CURRENT approved
controller and behavior; do not restore the older controller. Isolate the five
changes from Act2 and compare repeatable movement traces against this baseline.
No level-data edits, new dependencies, main pushes, merges or deployments.

- [ ] 1. Cap ground-rolling slope acceleration at42, preserving external momentum.
- [ ] 2. Hold idle standing contact below0.3 speed on slopes through38 degrees.
- [ ] 3. Air acceleration0.16/brake0.2 in Act1 and PLAYTEST.
- [ ] 4. Standing ground brake0.9; rolling brake unchanged.
- [ ] 5. Rolling uphill multiplier0.625; downhill multiplier2.5 unchanged.

Skip the optional30-tick slide input lock: it adds a control-state change beyond
holding still and would delay player corrections. All other behavior remains.
The Mania numbers in the request are tuning references, not independently verified
historical claims. Final evidence and test-expectation changes will be recorded here.
