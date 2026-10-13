# Zone 2 — High-security laboratory: saved design context

Read the [complete user-supplied master brief](high-security-laboratory-master-brief.md) before any future laboratory work. It is archived in full, not replaced by this index. Use the latest approved master architecture and detailed gameplay mockups as primary design authority. Do not substitute an older laboratory draft.

## Current authorization and scope

The user has supplied this brief as reference only. They have not started the mockups and will provide and explain them when ready. Do not request those mockups prematurely. Do not generate laboratory artwork, graybox geometry, levels, gimmicks or code until the user explicitly orders development to begin.

The immediate pending update concerns air boost, Bubble Shield and underwater behavior, not laboratory construction. The user authorized this prerequisite implementation on October 13, 2026; see [the update report](../prerequisite-update.md). Laboratory construction remains on hold. Research and test the real movement abilities before building shortcuts that depend on them. Merely recording these requirements does not authorize implementing them.

## Confirmed clarifications after the master brief

- **Air boost:** A short forward burst, in the style of Sonic Generations, using the existing boost system. It requires a fresh boost press while already airborne. Holding boost from the ground through takeoff must not trigger the burst; release and press again in the air to request it. Only one burst is available per airborne period, resetting on landing. Burst duration, velocity/vertical handling and gauge cost require researched, tested tuning when implementation is authorized; they were not assigned arbitrary values in this discussion.
- **Bubble Shield:** Unlimited underwater breathing while retained. An airborne second jump-button press activates the classic downward slam, followed by an automatic rebound on landing. It absorbs one hit without losing rings. Implement and test it together with air boost before constructing Zone 2.
- **Underwater physics:** Use classic Sonic-style movement and drowning timing, scaled appropriately from this game's faster existing movement. Research the classic relative changes before tuning; do not copy absolute classic speeds and make this game unnaturally slow. Preserve dry-land movement. The user will mark air-bubble locations in the future mockups.
- **Existing Act 2 pool:** The new water physics should apply here. For playtesting, replace one nonessential boost box with a Bubble Shield box. Preserve boost boxes needed for mandatory interactions; do not alter unrelated routes or geometry.
- **Research-entry launch platform:** The upper-route opportunity may reset when Sonic returns, but first he must fully leave the room and the room must leave the camera's field of view. Remaining nearby, waiting in the room, or boarding late is not a reset. This clarification supersedes any interpretation that locks the route until death or a checkpoint restart.

## Earlier connector rule, retained

Only fill deliberately unmapped connecting spaces. Keep them short, relatively safe, varied and momentum-driven, with exact entrances, exits, elevations and architectural connections preserved. Prefer curved slopes, loops, ramps, springs and established propulsion over generic flat corridors or automatic speed boosts. No repetitive spring chains, unnecessary obstacles, long filler or new major gimmicks. Drawn transitions must follow the drawing. This remains consistent with Part I.3 of the master brief.

## Session execution preferences

The user delegates game code, architecture and logic to the assistant: use technically sound algorithms/math, direct production-quality code and justified native/engine APIs. Avoid unnecessary abstractions, unused factories and heavy dependencies. Deliver complete implementations without code placeholders/stubs and test relevant loop/collision/reset/loading edge cases. Do not promise universal optimality or bug-free results without evidence.

Minimize token cost: concise communication, focused reads, reuse settled decisions, no unnecessary planning documents or repeated verification. Extra agents only when requested or justified by an applicable workflow. Preserve the working game and latest assets; never restart the project.

For future development, inspect the latest repository first. The main-branch stage-runtime refactor provides player-movement, surface-collision, world-interaction and explicit stage-behavior boundaries. Its existence does not mean air boost, shields, drowning or the laboratory are already implemented.
