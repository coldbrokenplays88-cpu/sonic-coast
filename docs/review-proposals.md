# Proposals for a later update

These are proposals only. This branch does not reformat the game, introduce a build system, combine level builders, delete assets/CSS or change publishing.

## 1. Make the code easier to read

**Recommendation:** do a formatting-only change in its own branch, after the gameplay fixes are played. Use Prettier with this proposed configuration:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "singleQuote": true,
  "semi": true,
  "trailingComma": "es5",
  "endOfLine": "lf"
}
```

The change would split tightly packed statements in authored runtime JavaScript, HTML, CSS and workflow YAML into readable lines. Keep generated frame-coordinate files out of the first pass: `ending-frames.js`, `ending-polish-frames.js`, `supplemental-frames.js`, `traversal-frames.js`, and the generated descriptor blocks in `recovered-art.js`. Their lines reach roughly 3,000–6,560 characters. Do not format image/audio files or reference captures. Tests should stay untouched during this task; any future formatting of test files needs a separate, explicit scope and must preserve every assertion.

Use a pinned tool version, a preview of the file list and a single formatting commit. Run the full tests and the existing raw-pixel and route comparisons before and after. Formatting should not change the game, but mistakes in file selection or generated data would be harder to see in a large diff.

**Effort:** about half a day to one day, mostly verification. **Risk:** low to medium because many lines change at once; keeping it separate makes review and undo practical.

## 2. Replace shared globals with explicit imports

**Recommendation:** plan this as several small updates. The entry page currently has **30 script tags: 29 external files and one inline default-act setting**. Their order supplies shared variables. For example, `surface-collision.js` relies on the player, level, keys and timer declared later in `game.js`; it works because its functions run after initialization. Turning those files directly into modules would break those assumptions.

Start by documenting dependencies and extracting a small shared game-state object. Make physics, level construction, rendering, input, sound and the main controller import exactly what they need. Move initialization into one entry file and avoid circular imports. Keep the existing browser test commands available through an explicit compatibility bridge while converting; the Node test helper currently reads classic scripts into one shared scope and will need a separately authorized adaptation. Preserve all existing assertions and compare the old and new game throughout the migration.

Use **esbuild** to package the eventual source modules into one ordinary browser script, with a generated filename that changes when its contents change. That removes manual `?v=NN` updates while retaining the current double-click `index.html` launch. Copy assets unchanged with relative URLs and test both a local file and the GitHub Pages `/sonic-coast/` path. Esbuild would be a development tool, not something players install. Pin its version and generate the entry HTML during the build. Keep a source checkout and a ready-to-play download clearly distinguished.

Vite is a good alternative if a convenient development server and standard asset handling are more valuable. Its usual module output needs a server and would change the current double-click launch, so I recommend esbuild for this game's current distribution. Either choice needs staging, a tested downloadable build and a rollback to the existing classic scripts.

**Effort:** several days, potentially a week once test-tool compatibility is included. **Risk:** high relative to the other proposals: initialization order, shared state, artwork paths, browser tooling and local launch all interact. Do it after the smaller cleanup work.

## 3. Simplify Act 2 construction

**Recommendation:** retain the three layers for now. They are active game content, not obsolete copies:

- `level2-original.js` supplies `makeOriginalCity()` and authored districts.
- `level2-restoration.js` selects districts, moves their coordinates, remaps IDs, adjusts hazards/checkpoints and reconnects the finale.
- `level2.js` builds the newer section and applies restoration. `midsection.js` then inserts the low/high routes during setup.

They **can be consolidated safely in a later change**, but only by preserving the resulting level: every surface and its order, IDs, slopes, moving-platform parameters, references, hazards, enemies, springs, rings, checkpoints, death zones, challenge links and boss arena. Merely deleting either older file removes playable districts. Moving the functions into one file without simplifying construction would mostly change organization, not remove complexity.

First record complete output snapshots from the current builders, including separately checking functions such as `floorAt` that JSON cannot capture. Then produce one clearly structured builder or authoring data source. Keep fresh mutable objects for each new game. Compare snapshots, seven moving-platform phases, normal-input low/high/secret routes, boss/ending behavior and raw canvas pixels. Retire the old layers only once those checks match.

**Effort:** two to four days including route checks. **Risk:** medium to high: invisible changes to surface order or IDs can change contact resolution or progression. No consolidation is part of this branch.

## 4. Review unused files and old HUD styles

**Recommendation:** keep these candidates until a separate deletion branch checks uncommon states and reference material.

The exact asset paths `assets/objects.png` and `assets/sonic.png` have no active runtime references. `assets/sonic-expressive.png` is a different file and remains an active fallback; the older fallback atlases and city images must stay.

These class selectors in `style.css` have no matching current markup or runtime class creation:

| Candidate | Selectors to inspect together |
| --- | --- |
| Old stage display | `.zone`, `.zone b`, responsive `.zone` overrides |
| Old difficulty label | `.difficulty-label`, responsive override |
| Old score box | `.score-stat` |
| Old boost track | `.meter-track`, `.meter-track i` |
| Old text speed display | `.speed-read`, `.speed-read b`, responsive overrides |

The `.touch` family also has no markup, but it belongs to the explicit phone/tablet decision below. Keep `.run-meter` and its inherited styling: the current pixel meter still uses that class. Broad rules such as `.hud strong`, `.run-meter > span` or generic `canvas` rules are not proven dead just because their original use changed. Responsive overrides and CSS rule order need careful inspection.

**Effort:** half a day to one day. **Risk:** low for the two unreferenced images after reference/provenance checks, medium for CSS because inherited rules can affect the current HUD. Compare desktop, small-screen, fullscreen, ready, paused and results screens before deleting anything.

**Phone/tablet decision:** Do you want people to be able to play on phones and tablets with on-screen buttons? I recommend yes if mobile visitors are intended. Yes means adding reachable Left, Right, Down/Roll, Jump and Boost buttons, checking multi-touch, held/released inputs and HUD overlap on devices. No means a separate cleanup can remove the unused touch styles and event bindings. This branch takes the stated default and changes neither.

## 5. Publish only the playable site

**Recommendation:** keep the current main-only deployment trigger, but stage a clean site directory before the Pages upload. Use an explicit allowlist of `index.html`, `style.css`, the runtime scripts in entry-page order and the complete `assets/` directory. Keep artwork used only for failures and the ending; a normal run's network trace is not a complete asset list.

Upload that staging directory instead of the entire `Inferno-Ascent-Game` folder. The starting folder contained 46 `.cjs` test/helper/verification files; this branch adds eight more. None needs to be on the live site. Exclude test helpers, browser verifiers, authoring tools, readme and launcher from the Pages artifact, while leaving them in the repository and downloadable source. A dedicated downloadable player ZIP can separately include the launcher and plain instructions.

Check every entry-page script and asset URL against the staging folder, serve it under `/sonic-coast/`, run both acts and the existing browser/ending checks, then inspect the uploaded file list. A deliberate workflow change still needs its own branch and play-test; merging main automatically deploys, so no workflow change is made here.

**Effort:** half a day to one day. **Risk:** low to medium: an incomplete allowlist could hide a late-stage or fallback resource. Roll back by uploading the original folder again.

## What I would do next

First, publish only the playable site: it removes unnecessary public developer files with little gameplay risk when the staged site is checked. Second, make the authored code readable in a formatting-only change. That will make the later, more delicate module and Act 2 work easier to review and maintain. Resolve the phone/tablet question separately before either adding controls or deleting its unused scaffolding.
