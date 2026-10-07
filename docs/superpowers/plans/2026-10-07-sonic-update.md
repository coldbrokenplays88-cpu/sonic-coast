# Sonic Coast full update implementation plan

> Agentic workers: execute native integration task by task, using test-driven-development and verification-before-completion. Independent HUD, audio and pixel-object modules may be implemented in parallel in non-overlapping files under dispatching-parallel-agents. A fresh reviewer checks the integrated result.

Goal: Complete the original 27 requirements and Sonic-shaped lightning boost bar while preserving existing game structure.
Architecture: Retain static JS/canvas engine; add focused modules for HUD, synthesized sound, city objects, boost rules, and the intermediate route. Root owns game.js, act2.js, recovered-art.js and level integration; workers own only their named module files.
Tech stack: Node built-in test runner, Python static server, Chromium/Playwright.
Spec: ../specs/2026-10-07-sonic-update.md and ../../references/original-27-step-checklist.txt.

Global constraints: preserve existing work; no rip/recolor of recovered originals; crisp integer-scaled pixel art; original synthesized sound; no new required dependency; keyboard and fullscreen support; full starting gauge, monitors-only refill, free designated grind boost preserves stored gauge.
Review focus: zero boost entering mandatory gates; death after using a required monitor; moving springs at all phases; high-speed rail exits; facade readability and unseen secret branch during vertical camera motion.

## Task 1: Mechanics and tests (checklist 6,7,11–16,24,25)
Files: game.js, act2.js, new boost-rules.js, test-inputs.cjs, test-mechanics.cjs.
Interfaces: updateBoostState(want) boolean; collectBoostMonitors(); resetBoostMonitors(); configureBoostMonitors(level) level; measurementSpeed() world units per frame.
- [ ] Write failing tests for no incidental refill, retained release gauge, empty free rail, monitor break/reset, sustained hold-charge, sloped landing and moving spring launch.
- [ ] Observe failure, implement bounded mechanics, run node --test test-*.cjs and preserve existing tests.
- [ ] Review camera landing prediction, tune continuous framing, collision boundaries and recovery precision.

## Task 2: New middle section (9,10,11,12,20,24)
Files: new midsection.js, level2.js integration, test-midsection.cjs.
Interfaces: addMiddleSection(level,{entryId,towerEntryId}) returns level; updateMiddleSection() handles pool capture/launch; drawMiddleSection() paints architecture and water.
- [ ] Determine original tower from 1:05 reference, build authored low/high routes following all eight drawings.
- [ ] Test actual spring trajectories, scripted pool landing/exit, wrong-turn drops, bounce alignment, optional hidden monitor branch, and momentum-preserving rail merge.
- [ ] Add junction checkpoint and safe monitor retry; compare lift timing without implementing unapproved circular replacement.

## Task 3: Pixel objects, architecture and sprites (1–5,8,17–20,26)
Files: new city-polish.js and test-city-polish.cjs; recovered-art.js, pixel-world.js, act2.js integration.
Interfaces: drawPolishedSpring(device), drawBoostMonitor(monitor), drawPoolBooster(device), drawPixelEnemy(enemy), drawPixelSpikes(hazard), drawDebrisWarning(debris), drawCityDetails() (all world canvas); updateCityInteriors(); drawPixelSign(x,y,text,type).
- [ ] Use reference colors/proportions, pixel-grid geometry and bounded cached sprites.
- [ ] Restore readable roofs/facades/interiors and smooth entry opacity; fix scenery cutoffs and vertical culling.
- [ ] Verify new sprite states, open hands for fast normal running, closed fists for boost, foot stability and quill motion.
- [ ] Profile before/after representative busy frames and remove per-frame lookup/allocation bottlenecks.

## Task 4: HUD and original sounds (21–23,28)
Files: new hud.js, game-audio.js, index.html, style.css, test-hud.cjs, test-audio.cjs; root integrates calls in game.js.
Interfaces: updatePixelHud({rings,lives,time,score,boost,maxBoost,speed,mode,frame}); drawPixelBoostBar(canvas,fraction,frame); playGameSound(name,options); setGameSoundEnabled(enabled).
- [ ] Hide gameplay score/route text, ring icon left, unlabeled centered timer, lives and pause right, accessible fullscreen; remove touch controls.
- [ ] Sonic silhouette boost bar, outline-empty/full-indigo and animated lightning; pixel text and ring icon.
- [ ] Original named sound graphs for all actions with envelope/concurrency limits; no downloaded audio.
- [ ] Validate in Chromium including fullscreen enter/exit, keyboard handling, warm redraw behavior and sound timing.

## Task 5: Integrated playtesting, review and delivery (26,27)
- [ ] Run complete node suite, both-stage browser smoke, authored low/high route replays and failure/retry scenarios.
- [ ] Visually inspect scene screenshots for all major districts, object/animation atlas and hidden interiors.
- [ ] Fresh review of diff against all requirements; fix important findings with tests.
- [ ] Record exact passes, remaining device checks and any external blocker. Prepare reviewable GitHub Pages change; do not claim deployed without a confirmed deployment.
