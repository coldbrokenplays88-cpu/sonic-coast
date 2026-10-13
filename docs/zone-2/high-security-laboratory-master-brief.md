CODEX MASTER IMPLEMENTATION BRIEF

High-Security Laboratory — Revised Level Design

ROLE AND PRIMARY OBJECTIVE

You are implementing a new act for an existing 2D Sonic-inspired platformer.

The goal is to create a large, interconnected high-security experimental laboratory featuring technical platforming, meaningful alternate routes, skill-based shortcuts, environmental machinery, and high-speed spectacle.

You are implementing an already-designed level. You are not being asked to redesign it.

The developer will provide architectural mockups and detailed gameplay mockups. Treat these as the primary design authority.

The laboratory must feel like an interconnected physical facility, not a long horizontal obstacle course with separately inserted gimmicks.

Preserve the existing movement physics, art style, controls, gameplay systems, and previously completed levels unless a change is explicitly required.

Air boost will be implemented and tested before this stage is constructed. Do not build the air-boost-dependent shortcut around an imaginary or unfinished movement ability.

⸻

PART I — NON-NEGOTIABLE DESIGN RULES

1. Mockup Fidelity — HIGHEST PRIORITY

Under normal circumstances, follow the supplied mockups exactly.

Preserve:

* The overall level architecture and relative room positions.
* The direction Sonic travels through each room.
* The intended horizontal and vertical progression.
* The shape and approximate scale of the major terrain.
* The placement and purpose of platforms, springs, rails, slopes, doors, and hazards.
* The location of secrets and alternative routes.
* The intended starting and ending points of every route.
* The connections between different floors and chambers.
* The distinction between standard, optional, faster, and recovery paths.
* The intended progression and difficulty of each gameplay challenge.

Do not reinterpret a platforming mockup as permission to design a different challenge.

Do not replace a complex room with a simpler version because it is easier to code.

Do not substitute automatic movement for deliberately designed platforming.

Do not straighten curved terrain, flatten elevation changes, remove alternate routes, or relocate major obstacles unless explicitly authorized.

The mockups must be translated into actual game geometry as faithfully as the existing engine permits.

Source priority

When interpreting the stage:

1. Approved master architecture mockup.
2. Approved detailed gameplay mockups.
3. This revised specification.
4. Existing project conventions and mechanics.
5. Your own implementation decisions, only where details are genuinely unspecified.

Do not substitute an older draft for the latest revision.

If the master architecture and a detailed room mockup appear inconsistent, identify the discrepancy rather than silently redesigning either.

If an exact drawn collision shape is impossible to implement reliably, preserve its gameplay purpose, placement, and proportions as closely as possible, and report the necessary technical approximation.

2. Extremely Limited Route-Balancing Exception

The only major exception to the mockup-fidelity rule concerns an optional route that is explicitly intended to be faster, but proves slower than its normal alternative in actual gameplay.

This exception is not general permission to redesign the level.

Before making a geometry change:

1. Implement both routes according to their approved mockups.
2. Verify both are complete and their movement systems function correctly.
3. Compare completion times from the same decision point to the same reconnection point.
4. Use comparable, clean, skilled executions for both routes.
5. Confirm the problem is genuinely caused by route geometry or unavoidable travel time, rather than poor implementation, a collision bug, incorrect momentum transfer, or a poorly executed test run.
6. Try minor adjustments to existing movement timing or mechanical tuning first, without invalidating the intended challenge.

Only if these checks establish a real route-balance problem may you make a small, controlled geometry adjustment.

Permitted emergency adjustments

* Shorten a minor connector within the optional route.
* Slightly tighten the spacing between existing route elements.
* Remove a small amount of otherwise unnecessary travel.
* Adjust an existing launch trajectory or platform cycle if doing so preserves the intended challenge.
* As a last resort, make a very small, natural extension to the standard route if that section still benefits from the added geometry.

Forbidden adjustments

* Cutting out a major platforming challenge.
* Removing important hazards or signature mechanics.
* Deleting or substantially shortening an entire room.
* Making the optional route automatically successful.
* Extending the normal route with long corridors, unnecessary enemies, waiting, or repetitive obstacles solely to inflate its completion time.
* Relocating the route’s entrance or destination.
* Changing the intended route identity.
* Redesigning other sections to compensate for one timing issue.
* Making numerous small, unreported changes that collectively alter the mockup substantially.

Make the smallest possible change that solves the demonstrated problem.

Limit automatic geometry changes to one small local adjustment or short connector, not a substantial portion of a route. Anything more extensive requires developer approval.

After every exception, document:

* The original measured route times.
* Why the intended fast route was slower.
* The exact geometry or timing modification.
* The new measured route times.
* Confirmation that the route still matches the approved design.

Do not modify the main route unnecessarily to manufacture a speed advantage.

An exceptionally optimized normal-route run may occasionally outperform a shortcut; that alone does not justify changing the level. The important requirement is that the intended faster route provides a meaningful advantage for comparably skilled, clean execution while preserving its challenge.

This exception should be rare. Adhering to the mockups remains the default.

3. Generating Short Connecting Sections

Some room connections may be indicated on the architectural map without detailed platform geometry.

Only in these deliberately unspecified spaces may you generate your own connecting gameplay.

These sections must:

* Be short.
* Preserve the exact entrances, exits, and elevations specified.
* Provide satisfying speed with minimal to no danger.
* Use the existing physics to create momentum.
* Feature interesting slopes, curves, loops, ramps, springs, and previously introduced propulsion systems.
* Allow players to influence movement rather than simply watching an automated sequence.
* Avoid repetitive flat corridors or unnecessary filler.
* Avoid introducing entirely new major gimmicks.
* Vary the traversal geometry between connections.
* Respect the surrounding rooms and never create unintended access to future sections.

Consider downward slopes feeding into upward ramps, short loop transitions, curved launch surfaces, or propulsion pads positioned to enhance naturally gained momentum.

Do not create a huge high-speed straightaway merely because space needs to be filled.

When a transition is already drawn, follow the drawing rather than generating a replacement.

4. General Gameplay Philosophy

* Speed should result from understanding and mastering the movement system.
* Preserve the fun and spectacle of modern Sonic movement.
* Technical platforming should reward precision and efficient execution.
* Standard routes must be enjoyable rather than tedious.
* Optional fast routes should still require skill or observation.
* Failure should generally cost time, momentum, rings, or route access rather than cause unavoidable death.
* Hazards may punish mistakes, but should operate consistently.
* Do not eliminate deliberate difficulty simply to make first-time play effortless.
* Allow players to improve substantially through repeated playthroughs.
* Use the facility’s existing technology in different ways rather than constantly adding unrelated mechanics.
* Maintain an intentional difficulty progression that peaks in the research division before the final high-speed release.

⸻

PART II — COMPLETE LEVEL STRUCTURE

SECTION 1 — FACILITY BREACH AND SECURITY LOCKDOWN

A. Initial Break-In

Sonic begins with a high-speed breach into the research facility.

The entrance should immediately communicate that the laboratory is heavily guarded.

Security alarms activate. Enemies mobilize. Rocket projectiles threaten Sonic as he runs through the early corridors.

This is a reaction-focused opening rather than a complicated precision-platforming challenge.

Preserve the original security lockdown and floor-vent escape from the approved architectural plan.

The initial locked security barrier eventually forces Sonic into the lower facility, where he must navigate around the obstruction before returning to the area beyond the sealed door later in the act.

B. Invincible Enemy Pursuit and Tilted Door

The revised opening also contains a pursuit involving an invincible enemy.

Sonic escapes toward a corridor blocked by laser security.

A security door closes behind Sonic, separating him from the pursuing enemy.

The invincible enemy slams into that door, causing it to tilt and form a usable slope.

The player must stop before running into the lasers.

A button positioned on top of the tilted door activates a propulsion pad.

The propulsion pad accelerates Sonic up the slope and onto a wall-running trajectory.

High lasers prevent players from simply running upward indefinitely.

A platform below these upper lasers contains another button, which disables the laser barrier blocking standard progression.

C. Optional Air-Boost Shortcut

Near the upper portion of the wall-running sequence is a boost item box.

Obtaining this box requires traveling somewhat farther up the wall than normal, without carelessly colliding with the upper lasers.

A glass window provides access to a hidden exterior passage.

Sonic can shatter the window using air boost.

The shortcut leads through a hallway into an exterior fire-escape staircase and a long descending rail grind.

This bypasses the normal laser-dodging passage, as specified in the mockup.

The window shortcut is optional and should not be required to complete the stage.

D. Standard Laser-Dodging Passage

The normal route should be designed around a 2D adaptation of Sonic Unleashed-style reaction challenges.

Instead of horizontal lane switching, Sonic dodges vertically using:

* Jumps over low lasers.
* Rolls beneath higher lasers.
* Changes in elevation using small raised platforms.
* Momentum-preserving transitions between safe spaces.

Show warning indicators before lasers fire.

The player should be able to traverse the passage cautiously or learn its patterns to move through it almost continuously.

Do not make this route boring simply because a faster secret exists.

An exceptionally well-optimized normal run may be competitive with the exterior shortcut.

E. Architectural Connection

The revised pursuit, laser route, optional exterior shortcut, and original lockdown must connect according to the master mockup.

Do not independently invent the spatial relationship between the tilted security door and the original crushing-ceiling lockdown.

If the drawings show them as distinct barriers or sequences, preserve that distinction. Do not merge them into a contradictory door state or duplicate the same obstacle.

The original forced lower-facility detour remains an important part of the level’s progression.

⸻

SECTION 2 — LOWER FACILITY AND LOBBY

A. Sinking-Platform Water Chamber

The initial ventilation escape takes Sonic downward and leftward into a chamber containing horizontally arranged floating platforms above water.

These platforms:

* Move vertically.
* Have spikes underneath.
* Begin sinking gradually when Sonic stands on them.
* Require well-timed jumps to cross efficiently.

The primary challenge is a horizontal crossing, not a long vertical climb.

Skilled players can rapidly jump from platform to platform before they descend too far or move out of favorable positions.

Missing the upper crossing drops Sonic into the water.

B. Underwater Route

The underwater area is a complete slower alternative route.

It contains enemies and dangerous upward-launching levitation pads.

Some pads are located beneath the spiked platforms and can launch Sonic directly into the spikes if approached carelessly.

Sonic must navigate the water and eventually reach a separate entry into the lobby.

This route should be more dangerous and slower than the successful upper crossing, but still enjoyable and completable without obscure knowledge.

C. Hidden Bubble Shield

Immediately after emerging from the initial vent, an optional boost-breakable wall to the left contains a Bubble Shield.

The Bubble Shield provides infinite underwater breathing protection while retained and absorbs damage according to the existing shield rules.

The secret does not allow Sonic to bypass the chamber.

It rewards exploration by making mistakes less punishing.

D. Lobby Convergence

The upper route enters through a normal doorway and immediately reaches a spring that launches Sonic to the next floor.

The water route emerges from a pool in the middle of the lobby.

Sonic travels right, jumps onto a platform, and uses another spring to travel back left toward the main upward spring.

The lobby is a low-intensity transition space.

Do not add unnecessary enemies or complicated hazards here.

Both routes ultimately reach the next floor.

⸻

SECTION 3 — EXPERIMENTAL ROCKET TEST CHAMBER

A. Central Mechanic

The laboratory contains an enormous experimental rocket-testing room.

A giant prototype rocket is mounted on a launch system.

Sonic activates its launch using a cord or trigger as indicated in the mockup.

The rocket does not explode. It serves as a fast-moving physical platform and experimental propulsion vehicle.

Give it a clear launch startup, so Sonic has a reasonable opportunity to jump aboard.

Once boarded, it accelerates dramatically through the testing area.

B. First Rocket Interaction — Optional Learning Reward

During an early diagonal upward portion of the rocket’s movement, place a clearly visible elevated platform containing an optional shield or extra life.

Sonic can use momentum inherited from the rocket to jump onto it.

A propulsion pad at the end of this optional section returns Sonic to the intended rocket continuation/landing area shown in the mockup.

Do not trap the player or remove their ability to continue normally after collecting this reward.

This interaction teaches that the rocket’s momentum can be exploited to reach areas Sonic cannot access through ordinary jumps.

C. Main Rocket Trajectory

The rocket travels at extremely high speed through a large testing zone.

Its trajectory eventually bends downward into a steep descending slope.

Before the descent, Sonic has an opportunity to jump off and reach an elevated platform near a closing security door.

D. Fast Rocket Shortcut

A precisely timed jump from the rocket allows Sonic to preserve enough momentum to reach the elevated platform.

The player must then run under the closing door before it shuts.

Successful execution leads to a spring and powerful turbine.

The turbine launches Sonic above the main testing room, allowing him to bypass the slower ascent.

This route should be faster, but it must still require deliberate execution.

The closing door does not need to make the shortcut obvious on the first playthrough.

However, avoid an unfair off-screen crushing collision or a permanently trapped failure state.

E. Standard Rocket Route

If Sonic remains aboard the rocket, it follows its natural downward trajectory.

This leads to an alternative platforming section where moving platforms launch upward and eventually descend.

Sonic navigates these platforms to ascend toward the same general upper continuation point.

This route is more time-consuming but should still feel like an enjoyable, intentional section of the facility.

Do not make it tedious simply to make the shortcut more appealing.

Both rocket outcomes lead toward the next major chamber.

⸻

SECTION 4 — DISAPPEARING-PLATFORM WATER CHAMBER

This replaces the original major electrified-floor section.

A. Timed Platforms

Sonic must cross a water-filled chamber using platforms that appear and disappear on fixed, predictable cycles.

The platforms operate independently of Sonic’s arrival.

The challenge emphasizes timing and pattern recognition.

A cautious player can wait for the appropriate cycle. An experienced player can chain jumps efficiently by anticipating the next platform’s appearance.

The primary traversal is horizontal.

B. Water Recovery

The water below is not another complete route.

It exists as a recovery area for missed jumps.

Enemies occupy the water and may damage or slow Sonic.

A speed pad provides a way to launch Sonic back toward the disappearing-platform crossing.

If the player preserves momentum and the platform timing aligns favorably, they may be able to land directly on a later platform rather than restarting on the first.

Preserve that possibility when supported by the actual physics.

Do not artificially force Sonic to restart from the first platform every time.

The platform cycles should continue consistently during recovery rather than restarting unpredictably.

Ensure a player can always recover within a reasonable time.

C. Exit and Original Barrier Bypass

After crossing the chamber, Sonic reaches an elevated movement passage.

This passage contains an opportunity to accelerate, run through a loop, jump over a spike, and descend extremely rapidly.

The descent brings Sonic into the room beyond the originally locked security barrier.

Sonic has physically bypassed the original lockdown by navigating the lower facility and returning from a different elevation.

Place the established research-entry checkpoint here.

Other checkpoints will be defined by the approved mockup.

⸻

SECTION 5 — MAIN RESEARCH DIVISION

This is the main difficulty climax of the act.

A. Research Entry and Route Selection

Following the checkpoint, Sonic travels through a short corridor with enemies and incoming rocket attacks.

He enters a room containing a levitation platform that prepares to launch.

If Sonic boards it in time, he reaches the upper research route.

If Sonic runs past and misses the opportunity, the platform departs without him.

The upper route becomes inaccessible for that attempt, leaving the lower research route.

Provide clear visual evidence that the platform exists and is preparing to depart.

Do not allow late boarding through unintended collision exploits.

Both routes should be substantial and genuinely different.

B. Upper Research Route — Difficult Vertical Shortcut

This is the more technical and potentially much faster route.

The route primarily emphasizes vertical movement through tight laser arrangements and launched platforms.

Platforms accelerate upward and then descend toward their original positions.

Sonic must jump between them while managing their movement and avoiding laser damage.

Incorrect timing may cost rings, momentum, or elevation.

C-shaped slopes: Include momentum-based curved slopes that Sonic can ascend with sufficiently skilled Spin Dash or boost execution.

Advanced spring shortcuts: Include certain springs accessible through unusual but physically valid movement, such as jumping in the opposite direction or reaching moving springs at particular positions.

Some springs may be hazardous when their platforms are at one height but provide useful shortcuts at another.

The intended fastest traversal should reward actual platforming mastery, not merely knowledge of a hidden trigger.

The main route through this area must remain completable without using advanced shortcuts.

The upper route ultimately reaches an elevated ventilation entrance.

It should be substantially faster than the lower route when executed cleanly by a skilled player.

C. Lower Research Route — Main Facility Route

This is the longer, more horizontal route intended to remain fun as the default play experience.

It contains enemies, laser obstacles, reactive movement challenges, and conventional high-speed running.

The overall experience should be less technically complex than the upper route but still hazardous.

C1. Main Research Corridors

Sonic runs through guarded corridors containing grounded and flying enemies.

Hazards should allow meaningful jumping, rolling, and movement decisions.

C2. Turret Platform Challenge

Levitation pads provide the primary means of reaching elevated platforms.

Landing on a platform triggers a laser turret that fires small projectiles.

These triggers occur regardless of the platform’s distance from the turret.

Sonic must move between platforms quickly while avoiding projectile fire.

Preserve the intended platform spacing and enemy placement.

Use clear firing cues without excessively slowing the gameplay.

C3. L-Shaped Hallway and Laser Avoidance

The original electrified-floor mechanic in this research corridor has been removed.

Replace it with a relatively short, high-speed laser-dodging passage inspired by Sonic Unleashed’s reaction gameplay.

Sonic should jump over some laser arrangements and roll beneath others.

Introduce grounded and flying enemies to add moderate difficulty without making the passage excessively long or punishing.

An upper part of the L-shaped hallway contains optional rings and an extra life.

This is a reward detour, not an additional full route.

The player eventually returns to the lower main corridor.

C4. Boost Box and Moving Platform

Sonic reaches a platform containing a boost item box.

The platform launches upward.

A separate moving platform travels into jumping range from the left.

Sonic must jump across while the opportunity is available.

If the jump is missed, the moving platform descends and later resets, allowing another attempt.

This section has minimal direct danger; the primary penalty is lost time.

The moving platform launches Sonic via a spring onto a higher platform.

Sonic then uses a boost charge to break through a wall and continue.

The boost box should be positioned so a normal player can reliably obtain the charge needed for this interaction.

C5. Maximum-Access Approach

Sonic reaches a chamber outside the sealed maximum-access door.

Several ordinary platforms lead upward.

This climb should be simple and contain little or no direct hazard.

At the top, an automated sequence of springs and powerful propulsion/levitation machinery launches Sonic at enormous speed through the facility.

Partway through this fast-moving sequence, Sonic is directed into a ventilation shaft.

The sequence connects to the shared ventilation network.

It should be exciting but not excessively long.

⸻

SECTION 6 — SHARED VENTILATION NETWORK

Both research routes converge within a fast ventilation system.

The upper research route enters from its elevated ventilation entrance.

The lower route enters through the automated launch sequence.

The exact physical connections must follow the architecture mockup.

This section is intentionally short.

Ventilation launchers propel Sonic rapidly through interconnected shafts.

At certain junctions, the player can influence Sonic’s direction to access optional tunnels.

These contain rings, shields, or other approved rewards.

All optional tunnels reconnect with the main path.

Avoid punishment for missing optional rewards.

Do not replace meaningful route decisions with a long completely automated animation.

The segment ends with Sonic smashing through a ventilation grate into the maximum-access laboratory.

⸻

SECTION 7 — MAXIMUM-ACCESS HIGH-SPEED FINALE

This section represents the point where Sonic has bypassed the laboratory’s strongest security restrictions.

There should be almost no enemy threat.

The primary challenges involve preserving momentum, performing well-timed jumps and rolls, choosing trajectories, and taking advantage of the facility’s propulsion machinery.

A. High-Speed Traversal

Include the loops, ramps, slopes, springs, launchers, and fast traversal geometry indicated by the mockups.

Maintain meaningful player control.

B. Levitation-Pad Route Decisions

High-powered levitation pads propel Sonic upward.

Players can steer onto a platform to continue running directly.

Alternatively, remaining within a launcher trajectory may propel Sonic into an overhead ventilation passage, which loops through a spring before reconnecting with the same progression route.

Different choices should produce different traversal times without making either one a dead end.

C. Suspended-Platform Traversal

Sonic jumps across floating platforms at speed.

Missing a jump sends him to a relatively safe lower progression/recovery area rather than instantly killing him.

He can continue toward a spring that returns him to the main route.

D. Player Control

Despite the spectacle, this is not a fully automated sequence.

Sonic should still need to:

* Jump at the right moments.
* Roll where appropriate.
* Choose slopes or straight-line routes.
* Manipulate momentum.
* Make directional decisions at key points.

E. Act Ending

The finale ends at a subbasement elevator.

This is the stage’s endpoint.

Do not add an unplanned boss fight, unrelated chase, or additional final obstacle gauntlet.

⸻

PART III — SHARED SYSTEMS AND IMPLEMENTATION REQUIREMENTS

1. Movement Physics

Reuse the existing movement system.

Preserve acceleration, braking, Spin Dash behavior, aerial control, jump physics, slopes, and collision handling unless the developer explicitly requests a physics change.

Do not globally modify Sonic’s movement to compensate for a poorly sized platform.

Adjust the local geometry or platform timing when practical.

Use the existing boost-charge system.

Place boost item boxes near the specific shortcuts that require them.

Do not make rings automatically refill boost charges.

Do not make an optional shortcut require a charge that can only be obtained far earlier in the stage unless the mockup explicitly establishes that challenge.

Air boost is a prerequisite for the glass-window shortcut.

2. Moving Platforms and Rocket Physics

Moving surfaces must have reliable collision.

Sonic should inherit appropriate platform or rocket momentum when jumping from them.

Ensure there is no tunneling through surfaces at high speeds.

Launched platforms should follow consistent movement cycles and return to their intended positions reliably.

The rocket must carry Sonic without repeatedly detaching him due to collision instability.

The rocket must not explode, disappear unexpectedly, or leave Sonic stranded.

Any resetting platform must remain reachable after a missed opportunity.

3. Hazard Timing

Use consistent cycles for disappearing platforms.

Use readable pre-fire cues for the reaction-based laser corridor.

Maintain reliable collision boundaries for lasers, spikes, and projectiles.

Ensure that rolling actually permits Sonic to fit beneath hazards intended to be roll-dodged.

Avoid unavoidable damage caused by excessive camera speed or hazards becoming visible too late.

4. Recovery and Failure Handling

Test every recovery route.

No player should become permanently trapped in a pit, vent, disconnected room, or incomplete movement cycle.

Missed platform jumps should produce the intended consequence rather than automatically killing the player.

Do not convert recovery routes into major additional gameplay sections.

Do not add invisible walls that artificially prevent legitimate momentum-based shortcuts.

Preserve deliberate route locks where indicated, such as the departing research platform.

5. Camera

Account for Sonic’s increased base speed.

Provide sufficient lookahead during high-speed horizontal movement.

Use appropriate vertical framing in rocket jumps and large research chambers.

The player should be able to see necessary platforms and relevant hazards without extreme blind jumps.

Do not zoom out so far that Sonic and small hazards become unreadable.

6. Visual Design

You may create the laboratory’s artwork, machinery appearance, backgrounds, lighting, and decorations using your own visual judgment.

The developer is delegating visual production, not level architecture.

The facility should look like a coherent experimental research complex with visually distinct testing chambers, security areas, and maximum-access interiors.

Maintain a consistent pixel-art visual language and appropriate sprite scaling.

Visual details must never obscure the location of hazards, secrets, or solid geometry.

Avoid generic floating platforms with no believable environmental context.

Do not modify the existing character design, established visual systems, or unrelated assets without necessity.

7. Level Length

The developer currently imagines a competent run lasting approximately 3–5 minutes, but this is not a rigid limit.

Do not remove designed gameplay merely to hit an arbitrary duration.

Do not pad the level to achieve a target duration either.

Prioritize coherent pacing and satisfying room-to-room progression.

Report actual clear times from testing.

8. Checkpoints

Follow checkpoint locations marked in the mockups.

One established checkpoint is positioned after the detour rejoins the room beyond the originally locked door, before the research division.

Other checkpoint positions will be specified during the mockup phase.

Do not invent a final checkpoint layout before consulting those markers.

9. Performance

Preserve performance on the existing supported devices and hosting setup.

Avoid excessive per-frame object creation, unstable moving-platform calculations, unnecessary collision checks, and expensive effects.

Do not compromise gameplay functionality or visual readability for unnecessary decoration.

⸻

PART IV — DEVELOPMENT PROCESS

Phase 1 — Design Interpretation

Before implementation:

1. Inspect the existing repository and level architecture.
2. Read all attached mockups.
3. Identify every major room, route, height change, checkpoint, and connection.
4. Build an internal route graph matching the supplied architecture.
5. Identify ambiguous or technically impossible connections before making geometry changes.
6. Confirm the air-boost system is implemented and usable.
7. Identify the existing physics systems that can be reused.

Do not invent an alternative level layout because the mockup is complicated.

Phase 2 — Architectural Graybox

Construct the major rooms using placeholder geometry.

Implement:

* Correct overall room positions.
* Correct elevations.
* Main route connections.
* Optional route entrances and exits.
* Recovery routes.
* Original locked-door bypass.
* Research route divergence and convergence.
* Final elevator endpoint.

Use simple collision geometry and placeholder visuals.

Do not focus on decoration before verifying spatial structure.

Phase 3 — Gameplay Implementation

Implement each major gameplay section according to its detailed mockup.

Add moving platforms, projectile systems, rocket behavior, laser systems, boost windows, springs, turbines, and ventilation launchers.

Keep the existing movement system intact.

Test each section independently before connecting it to the rest of the level.

Phase 4 — Playtesting and Route Validation

Verify:

* Every normal path is completable.
* Every intended optional route is reachable.
* Every recovery route works.
* Every moving platform resets correctly.
* Route timing is reasonably consistent.
* Sonic cannot clip through the rocket, doors, or fast-moving platforms.
* No section softlocks the player.
* Important hazards remain visible at the intended traversal speed.
* Boost-dependent interactions work with the actual item system.

Compare major route times using comparable skilled runs.

If the intended faster route proves slower, follow the narrow route-balancing exception from Part I.

If you cannot reliably measure the difference, report it as unverified. Do not silently change geometry based on a guess.

Phase 5 — Artwork and Polish

Once the level works:

* Generate and integrate the facility artwork.
* Add appropriate effects, alarms, lights, and sound cues.
* Differentiate laboratory departments visually.
* Improve readability.
* Optimize performance.
* Remove unnecessary implementation code without removing gameplay.
* Retest collisions and movement after artwork integration.

Phase 6 — Final Verification

Deliver a clear implementation summary including:

* Completed sections.
* Confirmed routes and shortcuts.
* Measured completion times where available.
* Tested recovery behavior.
* Unresolved gameplay issues.
* Performance findings.
* Any small geometry deviations from the mockups.
* An explanation of every permitted route-balancing exception.

Do not describe a section as complete if its core mechanics, route connections, or recovery behavior are missing.

⸻

FINAL DIRECTIVE

The objective is to faithfully implement the developer’s level, not create your own interpretation of it.

Under almost all circumstances, reproduce the approved architecture and gameplay mockups exactly.

Only deviate when absolutely necessary for correct functionality or when a verified route-time imbalance cannot reasonably be solved without a minimal adjustment.

Such adjustments must be local, carefully calculated, documented, and small enough that the original intended challenge remains intact.

Do not repeatedly deviate from the designs.

Do not pad slower routes with boring gameplay to make shortcuts more valuable.

Do not cut meaningful challenges from faster routes simply to save time.

Where geometry has deliberately been left unspecified, create short, skillfully shaped, high-speed connecting sections using established mechanics and natural momentum.

Preserve the distinction between difficult execution, enjoyable normal progression, optional exploration, and safe recovery.

The finished stage should feel like a coherent laboratory that Sonic navigates through skill and level knowledge, not a collection of disconnected challenges or a generic horizontal Sonic obstacle course.
