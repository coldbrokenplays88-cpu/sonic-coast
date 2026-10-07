# Sonic Coast update specification

Binding requirements: ../../references/original-27-step-checklist.txt plus the user-approved addition: a pixel-art boost bar shaped like a long speed streak ending in Sonic's head silhouette (muzzle left, three quills right), empty outline versus dark-indigo full fill with animated cyan lightning throughout, including the silhouette.

Continue the existing repository; do not restart or redesign it. Use recovered October 7 atlases and city PNG as the primary art, retain originals and provenance. Use the supplied Sonic expression reference for additional poses. Everything visible must be deliberate crisp pixel art. Sound is original synthesis, inspired by Mania without ripped audio.

Low route: normal platforms, fallen damaged building, momentum-catching lower spring, optional upper spring reached with controlled jump. Lower spring launches into the destroyed first tower of a glass H-shaped building with scripted central pool landing. Underwater mechanism launches toward tilted second tower. Roof transfers branch left to an optional boost monitor, showing only the first four exploration platforms from the initial approach. Right branch passes an enemy and reaches a shared junction with two short building jumps before the original tower at video 1:05.

High route: upper spring, two forgiving spring transfers and an aimed third. Next choose left spring; wrong right branch hits enemy and falls to the low route. Repeated bounces between a lower spring and horizontally moving spring platform allow waiting for alignment. Final spring reaches a continuous fast rail with enemies, merging into a broad shared landing before the tower. Misses can lose height and route advantage; no automatic generic rescue network.

Boost: full at act start; only unbroken lightning monitors refill. Release preserves balance. Designated grind skip rails provide free boost even at zero gauge without changing stored balance. Required boost interactions have reachable monitors. Death resets appropriate monitors so retries are possible, without gifting passive boost. Vent shafts are vertical launchers. Charge spindash by holding down+jump and release down to launch; tap charging remains compatible.

Keep safe movement, higher speed, stronger precision braking and low-route grip. Follow moving platforms and sloped floors without fall-through; spring positions follow their parent moving surface. Checkpoints activate only on safe matching ground, respawn with enough room to act.

Architecture: additive JS modules and minimal integration into game.js; existing level builders remain authoritative. New section builder consumes/returns the normal level object, shifting downstream coordinates rather than replacing existing districts. All HUD operations use existing IDs where compatibility helps. Browser tests validate real frames, visual pixels, sound graphs and controls; node tests validate fixed physics and authored trajectories. Record coverage of all 28 requirements in docs/update-progress.md.

Video transfer is blocked by the 32 MiB tool limit. The subsequently supplied screenshot identifies the original 09 / NEON SWITCHBACK tower (neon-0); insertion is anchored to secret-exit-uphill-link. The proposed circular lift replacement remains optional pending its drawing; compare current lift timing, don't invent that replacement.
