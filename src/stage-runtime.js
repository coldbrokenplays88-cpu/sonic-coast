// Canonical runtime module. Classic VM compatibility is generated from this source.
import { state as runtimeState } from './state.js';
import { resetAct2, updateAct2 } from './act2.js';
import { onBlimpLanding, resetBlimpRoute } from './blimp-route.js';
import { beginEndingScene } from './boss-game.js';
import { finishAct, p } from './game.js';
import { beginWrongRouteDrop, updateMiddleMotion, updateMiddleSection } from './midsection.js';
export let neonExpressAct1Runtime, neonExpressAct2Runtime;

export function selectStageRuntime() {
  // The shipped Act 1 builder predates explicit act metadata; keep its schema.
  if (
    runtimeState.level.act === 1 ||
    (runtimeState.level.act === undefined && runtimeState.selectedAct === 1)
  )
    runtimeState.stageRuntime = neonExpressAct1Runtime;
  else if (runtimeState.level.act === 2) runtimeState.stageRuntime = neonExpressAct2Runtime;
  else throw Error('Unsupported stage act: ' + runtimeState.level.act);
}

export function resetStageRuntime() {
  runtimeState.stageRuntime.reset();
}

export function updateStageMotion() {
  return runtimeState.stageRuntime.motion();
}

export function beforeStageLanding(s) {
  runtimeState.stageRuntime.beforeLanding(s);
}

export function afterStageLanding(s) {
  runtimeState.stageRuntime.afterLanding(s);
}

export function updateStageWorld() {
  runtimeState.stageRuntime.updateWorld();
}

export function handleStageEnemyDamage(e) {
  runtimeState.stageRuntime.enemyDamage(e);
}

export function stageDeathLimit() {
  return runtimeState.stageRuntime.deathLimit();
}

export function updateStageCompletion() {
  runtimeState.stageRuntime.completion();
}
export function initializeRuntimeModule() {
  // Explicit existing-stage integration. Adapters are selected once per setup;
  // their methods execute synchronously at the controller's established phases.
  runtimeState.stageRuntime = null;

  neonExpressAct1Runtime = {
    reset() {},
    motion() {
      return false;
    },
    beforeLanding(s) {},
    afterLanding(s) {},
    updateWorld() {},
    enemyDamage(e) {},
    deathLimit() {
      return 800;
    },
    completion() {
      if (
        p.x >= runtimeState.END &&
        ((p.ground && p.surface?.kind === 'main') ||
          (p.landFrame === runtimeState.runFrames && p.landKind === 'main'))
      )
        finishAct();
    },
  };

  neonExpressAct2Runtime = {
    reset() {
      resetAct2();
      resetBlimpRoute();
    },
    motion() {
      return updateMiddleMotion();
    },
    beforeLanding(s) {
      if (p.wrongRouteDrop && s.fallen) {
        p.wrongRouteDrop = false;
        p.vx = 0;
      }
    },
    afterLanding(s) {
      onBlimpLanding(s);
      if (s.poolCurve) {
        p.poolApproach = false;
        p.rolling = true;
        p.roll = true;
        p.rollAge = 0;
        p.lowRollFrames = 0;
      }
    },
    updateWorld() {
      updateAct2();
      updateMiddleSection();
    },
    enemyDamage(e) {
      if (e.id === 'mid-wrong-way-guard' && p.hurt && runtimeState.mode === 'playing')
        beginWrongRouteDrop();
    },
    deathLimit() {
      return runtimeState.level.floorAt(p.x) + 950;
    },
    completion() {
      if (runtimeState.boss?.state === 'defeated') beginEndingScene();
    },
  };
}
export function getRuntimeBindings() {
  return {
    neonExpressAct1Runtime: {
      get: () => neonExpressAct1Runtime,
      set: (value) => {
        neonExpressAct1Runtime = value;
      },
    },
    neonExpressAct2Runtime: {
      get: () => neonExpressAct2Runtime,
      set: (value) => {
        neonExpressAct2Runtime = value;
      },
    },
    selectStageRuntime: {
      get: () => selectStageRuntime,
      set: (value) => {
        selectStageRuntime = value;
      },
    },
    resetStageRuntime: {
      get: () => resetStageRuntime,
      set: (value) => {
        resetStageRuntime = value;
      },
    },
    updateStageMotion: {
      get: () => updateStageMotion,
      set: (value) => {
        updateStageMotion = value;
      },
    },
    beforeStageLanding: {
      get: () => beforeStageLanding,
      set: (value) => {
        beforeStageLanding = value;
      },
    },
    afterStageLanding: {
      get: () => afterStageLanding,
      set: (value) => {
        afterStageLanding = value;
      },
    },
    updateStageWorld: {
      get: () => updateStageWorld,
      set: (value) => {
        updateStageWorld = value;
      },
    },
    handleStageEnemyDamage: {
      get: () => handleStageEnemyDamage,
      set: (value) => {
        handleStageEnemyDamage = value;
      },
    },
    stageDeathLimit: {
      get: () => stageDeathLimit,
      set: (value) => {
        stageDeathLimit = value;
      },
    },
    updateStageCompletion: {
      get: () => updateStageCompletion,
      set: (value) => {
        updateStageCompletion = value;
      },
    },
  };
}
