# Working on the module-based game

Players do not need Node or build tools. In a source ZIP, open `Inferno-Ascent-Game/PLAY.html`; the smaller player ZIP opens `index.html`. The Windows launcher chooses the appropriate entry automatically. Keep the assets folder and generated script/style beside the entry.

## Source ownership

Edit the ES modules in `src/`. Runtime files have explicit imports; reassigned cross-system bindings are listed in `src/state.js`. Player objects, constants and caches are imported from their owning modules. `src/main.js` exposes the established browser inspection names through getters/setters, then explicitly initializes each module in the established order. That deliberate startup sequence keeps imports from running game setup while another module's data is still uninitialized. Game code calls imported services rather than looking them up through browser globals. The browser bridge exists for unchanged inspection/verification tools, including temporary function overrides.

`src/level2.js` contains the canonical Act 2 level data and one fresh-run builder. `challenges` shares the `routeChallenges` array, and the vent section points at the same challenge object; the builder restores both aliases and the original floor lookup closure. The old original/restoration filenames are inert shims for the unchanged VM test helper. They are not in the published game.

The classic JS files beside the original `Inferno-Ascent-Game/index.html` are generated compatibility files. They keep every existing Node test/helper/verifier intact; edit their corresponding `src` files instead. The two original shims are handwritten comments. Generated descriptor sources remain unformatted; their values were preserved. The two optional Python metadata authoring tools now write to the canonical src modules and tell the developer to rebuild the player; they were syntax-checked without regenerating artwork or descriptor values. `src/runtime-manifest.json` records original compatibility declaration kinds and startup order. Build checks reject stale compatibility output.

## Developer commands

1. `npm ci` installs the pinned development tools.
2. `npm run build:player` regenerates classic compatibility files, `PLAY.html`, and the content-named browser script/style.
3. `npm test` runs the unchanged game suite. `npm run test:build` checks staging, module imports, level equivalence and generation freshness.
4. `npm run build` verifies the committed player output and produces `dist/site`. It fails if source and committed generated output differ.
5. `npm run package` also creates `dist/Neon-Express-player.zip`, containing the staged game, Windows launcher and plain instructions.

When a module or stylesheet changes, rebuild before committing. Include the canonical changes and generated compatibility/player output in that commit. Content-derived filenames replace manual version bumps for the playable module build. The original index entry's old URLs are retained solely for compatibility; it is not the recommended player entry.

## Publishing and rollback

Pages uploads only `dist/site`. It contains one browser script, a content-named stylesheet, HTML and the complete remaining assets directory, including legacy/error fallback and ending artwork. Tests, tools, source modules and launch instructions are excluded from the Pages artifact. The player ZIP is a separate Actions download. The workflow checks/builds before publishing and retains the main-only deployment trigger; branch pushes do not deploy.

Changes are split into publishing, formatting, unused cleanup, level consolidation and modules commits. Later commits depend on earlier build work: revert in reverse order for a complete rollback. A targeted revert may require regenerating compatibility/player files; do not resolve generated-file conflicts by editing the tests. Main merging remains the owner's action.
