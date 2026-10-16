# Phase three implementation plan

Spec: ../specs/2026-10-16-phase-three.md. Execute inline under the owner's approval to implement all proposals; do not ask them to review code or run commands.

## Global constraints

No existing test/verifier edits, no main push/merge/deploy, no new mobile controls, no image conversions. Keep node --test green against baseline 350/0. Preserve the source-download compatibility entry and provide a clearly marked packaged player entry. Record concrete validation and deviations in docs/phase-three-progress.md.

## Task 1: Publishing and player package

- Add tools/stage-site.cjs exporting stageSite({gameDir, outputDir}); explicit HTML/CSS/script/asset allowlist, reject missing/escaping resources, no tests/tools in output.
- Add tools/test-site.cjs: staged entry/scripts/art exist, developer files excluded, missing resources fail. Watch missing-tool failure, implement, then pass.
- Add package.json/package-lock.json with pinned build tools and scripts; .gitignore excludes dependencies/dist.
- Add tools/package-player.cjs for player ZIP, launcher and instructions.
- Update Pages to npm ci, checks/build and upload dist/site; retain deployment trigger/permissions.
- Run staging checks and 350+ game tests; commit proposal 5.

## Task 2: Formatting

- Add .prettierrc.json/.prettierignore; format only authored runtime JS/HTML/CSS/workflow and new build tooling. Leave generated descriptor files and every existing test/verifier untouched.
- Run formatter check on selected files, full game suite, baseline pixel comparison; commit proposal 1.

## Task 3: Unused cleanup

- Trace exact asset references, CSS selectors and event bindings. Remove only the two unreferenced images and dead HUD/touch selectors/listeners, preserving CSS order.
- Check keyboard, Sound, mouse boost, fullscreen and desktop/small-window layouts. Compare raw game pixels and full suite; commit proposal 4.

## Task 4: Act 2 consolidation

- Capture the baseline graph as canonical data, explicitly retaining aliases, undefined/nonfinite values if present, and floorAt closure behavior.
- New tests compare all serialized level values, all alias paths, floorAt over the route, fresh-run independence and middle/boss integration.
- Replace three runtime builders with one data-backed builder; two old filenames become documented inert compatibility shims for unchanged test helpers.
- Compare route traces and run full route/physics suite; commit proposal 3.

## Task 5: Modules and esbuild

- Move runtime ownership to src modules. Use AST scope analysis to assign explicit imports and convert cross-module mutable data to state fields without rewriting shadowed local names.
- Preserve initialization order via explicit initialization functions; imported function bindings must support browser verification overrides through module-specific setters.
- Generate classic compatibility files for unchanged tests from the canonical modules, with a build freshness check. Generate a single content-named packaged browser script and CSS; no manual version queries in published entry.
- New checks verify module dependency resolution, no unexpected globals, clean packaged entry, compatibility freshness and ZIP resources. Run existing browser commands against packaged site, both acts/missing art pixel comparisons, ending and full game suite; commit proposal 2.

## Task 6: Final delivery

- Fresh independent whole-branch review; address important findings with meaningful regression checks. Verify protected test files unchanged.
- Record commands/results, what was not verified, changed player launch instructions, rollback order and play-test checklist.
- Push branch, attempt draft PR, report exact delivery status. Never merge.

## Review focus

- Act 2 shared aliases and mutable restart data: owning level tests.
- Module circular initialization and lazy artwork failures: packaged browser/fallback checks.
- Existing browser scripts' direct state/function overrides: packaged verify-browser and ending checks.
- Source ZIP versus packaged player ZIP: resource/launcher checks and plain instructions.
- Staging missing fallback assets and unintended developer uploads: staging/ZIP allowlist tests.
