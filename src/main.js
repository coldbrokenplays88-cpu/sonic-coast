import { state } from './state.js';
import * as module0 from './level.js';
import * as module1 from './midsection.js';
import * as module2 from './blimp-route.js';
import * as module3 from './level2.js';
import * as module4 from './act2.js';
import * as module5 from './pixel-world.js';
import * as module6 from './city-polish.js';
import * as module7 from './supplemental-frames.js';
import * as module8 from './traversal-frames.js';
import * as module9 from './traversal-animations.js';
import * as module10 from './recovered-art.js';
import * as module11 from './boost-rules.js';
import * as module12 from './game-audio.js';
import * as module13 from './game-music.js';
import * as module14 from './hud.js';
import * as module15 from './egg-scorpion.js';
import * as module16 from './boss-art.js';
import * as module17 from './ending-scene.js';
import * as module18 from './ending-frames.js';
import * as module19 from './ending-polish-frames.js';
import * as module20 from './ending-art.js';
import * as module21 from './boss-game.js';
import * as module22 from './surface-collision.js';
import * as module23 from './player-movement.js';
import * as module24 from './world-interactions.js';
import * as module25 from './stage-runtime.js';
import * as module26 from './game.js';
import * as groundModule from './playtest-ground.js';
import * as motionModule from './playtest-motion.js';
import * as playtestModule from './playtest.js';

// Browser verification uses these established names and controlled overrides.
const modules = [
  module0,
  module1,
  module2,
  module3,
  module4,
  module5,
  module6,
  module7,
  module8,
  module9,
  module10,
  module11,
  module12,
  module13,
  module14,
  module15,
  module16,
  module17,
  module18,
  module19,
  module20,
  module21,
  module22,
  module23,
  module24,
  module25,
  groundModule,
  motionModule,
  playtestModule,
  module26,
];
for (const module of modules) {
  for (const [name, descriptor] of Object.entries(module.getRuntimeBindings()))
    Object.defineProperty(globalThis, name, { ...descriptor, configurable: true });
}
for (const name of [
  'cityRasterContext',
  'cityPillarPass',
  'boss',
  'bossCheckpoint',
  'ending',
  'stageRuntime',
  'testControlled',
  'selectedAct',
  'level',
  'END',
  'mode',
  'cam',
  'camY',
  'zoom',
  'clock',
  'lives',
  'count',
  'score',
  'charge',
  'checkpoint',
  'toastTime',
  'sound',
  'particles',
  'rings',
  'enemies',
  'last',
  'acc',
  'step',
  'boost',
  'shake',
  'anim',
  'jumpBuffer',
  'coyote',
  'stage',
  'runFrames',
  'stats',
  'visited',
])
  Object.defineProperty(globalThis, name, {
    get: () => state[name],
    set: (value) => {
      state[name] = value;
    },
    configurable: true,
  });

// Explicit startup preserves the old initialization sequence despite import cycles.
for (const module of modules) module.initializeRuntimeModule();
