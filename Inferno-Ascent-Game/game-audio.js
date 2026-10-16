// Generated from src/game-audio.js; run npm run build:compat after source edits.
'use strict';


(function (root) {
    'use strict';
    const MAX_VOICES = 18,
      MAX_EVENTS = 8,
      MASTER_LEVEL = 0.22;
    let enabled = false,
      context = null,
      master = null,
      noiseBuffer = null,
      pendingResume = null;
    const active = new Set(),
      lastPlayed = new Map();
    const clamp = (value, min, max, fallback) =>
      Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
    const tone = (from, to, duration, amplitude, type = 'triangle', delay = 0) => ({
      from,
      to,
      duration,
      amplitude,
      type,
      delay,
    });
    const hiss = (from, to, duration, amplitude, delay = 0, filter = 'bandpass') => ({
      from,
      to,
      duration,
      amplitude,
      delay,
      noise: true,
      filter,
    });

    // Short attacks give tactile cues; quieter noise underlies movement instead of
    // a competing melody. Frequencies and note sequences are authored for this game.
    const cues = {
      airWarning: {
        interval: 0.45,
        priority: 4,
        voices: () => [
          tone(880, 880, 0.1, 0.16, 'square'),
          tone(1100, 1100, 0.1, 0.14, 'triangle', 0.14),
        ],
      },
      bubbleBounce: {
        interval: 0.12,
        priority: 3,
        voices: () => [
          tone(480, 150, 0.12, 0.16, 'sine'),
          tone(190, 440, 0.16, 0.12, 'triangle', 0.06),
        ],
      },
      shieldBreak: {
        interval: 0.2,
        priority: 4,
        voices: () => [hiss(3200, 700, 0.2, 0.18), tone(950, 210, 0.18, 0.16, 'sine')],
      },
      endingRocket: {
        interval: 0.3,
        priority: 3,
        voices: () => [hiss(500, 3600, 0.65, 0.22), tone(180, 600, 0.45, 0.13, 'sawtooth')],
      },
      endingTeleport: {
        interval: 0.3,
        priority: 4,
        voices: () => [
          tone(420, 1900, 0.24, 0.17, 'sine'),
          tone(1470, 320, 0.28, 0.14, 'triangle'),
          hiss(2400, 900, 0.18, 0.12),
        ],
      },
      endingKick: {
        interval: 0.2,
        priority: 4,
        voices: () => [
          tone(190, 45, 0.13, 0.26, 'triangle'),
          hiss(4100, 680, 0.18, 0.24),
          tone(980, 1300, 0.08, 0.1, 'sine'),
        ],
      },
      endingExplosion: {
        interval: 0.6,
        priority: 4,
        voices: () => [
          hiss(3300, 110, 0.8, 0.3, 0, 'lowpass'),
          tone(105, 24, 0.65, 0.27, 'sawtooth'),
          hiss(1200, 280, 0.45, 0.15, 0.16),
        ],
      },
      endingJetpack: {
        interval: 0.4,
        priority: 3,
        voices: () => [hiss(700, 3200, 1.1, 0.18), tone(180, 580, 1.05, 0.1, 'sawtooth')],
      },
      endingEmerald: {
        interval: 0.3,
        priority: 2,
        voices: () => [
          tone(990, 1005, 0.3, 0.11, 'sine'),
          tone(1490, 1510, 0.36, 0.08, 'sine', 0.06),
        ],
      },
      endingCharge: {
        interval: 0.4,
        priority: 3,
        voices: () => [
          tone(220, 1260, 0.85, 0.14, 'triangle'),
          tone(660, 1980, 0.8, 0.09, 'sine'),
          hiss(800, 2900, 0.75, 0.1),
        ],
      },
      endingWarp: {
        interval: 0.4,
        priority: 4,
        voices: () => [
          tone(1800, 240, 0.42, 0.18, 'sine'),
          tone(630, 2100, 0.3, 0.12, 'triangle'),
          hiss(3800, 400, 0.38, 0.12),
        ],
      },
      endingSigh: {
        interval: 0.5,
        priority: 1,
        voices: () => [
          hiss(600, 190, 0.38, 0.06, 0, 'lowpass'),
          hiss(1100, 300, 0.25, 0.025, 0.08),
        ],
      },
      bossReveal: {
        interval: 1,
        priority: 4,
        voices: () => [tone(65, 32, 0.9, 0.3, 'sawtooth'), hiss(500, 90, 0.8, 0.2, 0, 'lowpass')],
      },
      bossAnchor: {
        interval: 0.4,
        priority: 4,
        voices: () => [
          tone(115, 28, 0.35, 0.32, 'triangle'),
          hiss(1900, 130, 0.45, 0.3, 0, 'lowpass'),
        ],
      },
      bossStrike: {
        interval: 0.25,
        priority: 3,
        voices: () => [tone(280, 38, 0.2, 0.28, 'square'), hiss(2500, 150, 0.28, 0.24)],
      },
      bossBite: {
        interval: 0.25,
        priority: 3,
        voices: () => [tone(170, 65, 0.28, 0.26, 'sawtooth'), hiss(1800, 440, 0.2, 0.23)],
      },
      bossLaser: {
        interval: 0.3,
        priority: 3,
        voices: () => [
          tone(1500, 330, 0.48, 0.22, 'sawtooth'),
          tone(2300, 630, 0.38, 0.13, 'square'),
          hiss(3200, 1800, 0.4, 0.13),
        ],
      },
      bossHit: {
        interval: 0.3,
        priority: 4,
        voices: () => [
          hiss(5600, 700, 0.35, 0.28),
          tone(670, 110, 0.22, 0.24, 'square'),
          tone(1400, 1900, 0.15, 0.13, 'sine', 0.04),
        ],
      },
      bossBreak: {
        interval: 1,
        priority: 4,
        voices: () => [
          tone(140, 25, 0.8, 0.3, 'sawtooth'),
          hiss(2900, 100, 0.85, 0.32),
          tone(85, 30, 0.6, 0.2, 'triangle', 0.2),
        ],
      },
      start: {
        interval: 0.5,
        priority: 2,
        voices: () => [
          tone(340, 345, 0.13, 0.24, 'triangle'),
          tone(430, 438, 0.15, 0.23, 'triangle', 0.085),
          tone(540, 552, 0.18, 0.21, 'triangle', 0.17),
          tone(675, 680, 0.26, 0.22, 'sine', 0.255),
        ],
      },
      jump: {
        interval: 0.075,
        priority: 2,
        voices: () => [
          tone(270, 820, 0.14, 0.25, 'square'),
          tone(960, 570, 0.1, 0.16, 'sine', 0.035),
          hiss(1500, 3100, 0.06, 0.11),
        ],
      },
      land: {
        interval: 0.1,
        priority: 1,
        voices: () => [
          tone(125, 53, 0.085, 0.24, 'triangle'),
          hiss(1050, 180, 0.075, 0.17, 0, 'lowpass'),
        ],
      },
      run: {
        interval: 0.16,
        priority: 0,
        voices: (o) => [
          tone(92 + o.speed * 45, 56, 0.055, 0.07, 'triangle'),
          hiss(1200 + o.speed * 900, 500, 0.055, 0.07),
        ],
      },
      brake: {
        interval: 0.16,
        priority: 0,
        voices: (o) => [
          tone(1180 + o.speed * 900, 470, 0.14, 0.075, 'square'),
          hiss(3500, 1100, 0.15, 0.16),
        ],
      },
      spindashCharge: {
        interval: 0.12,
        priority: 0,
        voices: (o) => [
          tone(185 + o.charge * 540, 280 + o.charge * 790, 0.12, 0.19, 'sawtooth'),
          tone(285 + o.charge * 650, 385 + o.charge * 920, 0.1, 0.12, 'triangle', 0.014),
          hiss(1100, 2200, 0.075, 0.08),
        ],
      },
      spindashRelease: {
        interval: 0.16,
        priority: 2,
        voices: (o) => [
          tone(800 + o.charge * 600, 170, 0.26, 0.26, 'sawtooth'),
          tone(280, 76, 0.18, 0.24, 'triangle'),
          hiss(4300, 700, 0.25, 0.23, 0, 'highpass'),
        ],
      },
      boost: {
        interval: 0.2,
        priority: 0,
        voices: (o) => [
          tone(140 + o.speed * 110, 96, 0.19, 0.11, 'sawtooth'),
          tone(450, 630, 0.18, 0.07, 'triangle'),
          hiss(2100, 4400, 0.2, 0.18, 0, 'highpass'),
        ],
      },
      grind: {
        interval: 0.19,
        priority: 0,
        voices: (o) => [
          tone(1050 + o.speed * 800, 870, 0.13, 0.065, 'square'),
          tone(1670, 1830, 0.095, 0.055, 'triangle', 0.025),
          hiss(3200, 1700, 0.16, 0.11),
        ],
      },
      spring: {
        interval: 0.12,
        priority: 2,
        voices: () => [
          tone(170, 1170, 0.22, 0.27, 'triangle'),
          tone(690, 1460, 0.18, 0.14, 'square', 0.035),
          tone(1120, 690, 0.13, 0.12, 'sine', 0.12),
        ],
      },
      vent: {
        interval: 0.18,
        priority: 2,
        voices: () => [
          hiss(360, 2300, 0.31, 0.3, 0, 'lowpass'),
          tone(96, 250, 0.25, 0.18, 'triangle'),
          hiss(2600, 4900, 0.2, 0.1, 0.06, 'highpass'),
        ],
      },
      pool: {
        interval: 0.25,
        priority: 2,
        voices: (o) =>
          o.launch
            ? [
                tone(160, 1130, 0.25, 0.24, 'triangle'),
                tone(510, 1440, 0.19, 0.13, 'square', 0.04),
                hiss(420, 3100, 0.26, 0.26, 0, 'lowpass'),
                hiss(2800, 900, 0.16, 0.12, 0.11),
              ]
            : [
                hiss(600, 210, 0.27, 0.27, 0, 'lowpass'),
                tone(720, 130, 0.11, 0.16, 'sine'),
                tone(470, 105, 0.12, 0.14, 'sine', 0.065),
                tone(290, 85, 0.14, 0.12, 'sine', 0.12),
              ],
      },
      ring: {
        interval: 0.045,
        priority: 2,
        voices: () => [
          tone(1515, 1523, 0.18, 0.21, 'sine'),
          tone(2175, 2188, 0.16, 0.13, 'sine', 0.025),
        ],
      },
      monitor: {
        interval: 0.18,
        priority: 3,
        voices: () => [
          hiss(2200, 500, 0.1, 0.21),
          tone(245, 73, 0.09, 0.23, 'triangle'),
          tone(720, 738, 0.18, 0.2, 'square', 0.055),
          tone(1160, 1180, 0.24, 0.17, 'sine', 0.115),
        ],
      },
      enemy: {
        interval: 0.065,
        priority: 2,
        voices: () => [
          tone(210, 52, 0.12, 0.28, 'square'),
          hiss(2800, 340, 0.18, 0.25),
          tone(430, 90, 0.085, 0.1, 'triangle', 0.015),
        ],
      },
      hazard: {
        interval: 0.12,
        priority: 2,
        voices: () => [
          hiss(1800, 320, 0.2, 0.24),
          tone(160, 42, 0.17, 0.23, 'triangle'),
          tone(670, 210, 0.07, 0.09, 'square'),
        ],
      },
      warning: {
        interval: 0.3,
        priority: 3,
        voices: () => [
          tone(590, 530, 0.09, 0.22, 'square'),
          tone(750, 670, 0.09, 0.23, 'square', 0.12),
          tone(970, 870, 0.12, 0.2, 'triangle', 0.24),
        ],
      },
      hurt: {
        interval: 0.22,
        priority: 3,
        voices: () => [
          tone(420, 84, 0.25, 0.29, 'sawtooth'),
          tone(940, 160, 0.2, 0.17, 'square', 0.012),
          hiss(3100, 700, 0.18, 0.23),
        ],
      },
      death: {
        interval: 0.6,
        priority: 4,
        voices: () => [
          tone(380, 155, 0.3, 0.24, 'triangle'),
          tone(235, 66, 0.4, 0.24, 'square', 0.2),
          tone(120, 38, 0.45, 0.18, 'triangle', 0.43),
          hiss(950, 150, 0.25, 0.11, 0.3, 'lowpass'),
        ],
      },
      checkpoint: {
        interval: 0.4,
        priority: 3,
        voices: () => [
          tone(570, 582, 0.17, 0.23, 'triangle'),
          tone(855, 876, 0.21, 0.2, 'sine', 0.08),
          tone(1080, 1100, 0.27, 0.18, 'sine', 0.16),
          tone(1440, 1456, 0.22, 0.09, 'sine', 0.21),
        ],
      },
      pause: {
        interval: 0.15,
        priority: 2,
        voices: () => [
          tone(520, 500, 0.11, 0.18, 'triangle'),
          tone(355, 340, 0.15, 0.15, 'sine', 0.07),
        ],
      },
      menu: {
        interval: 0.075,
        priority: 2,
        voices: () => [
          tone(470, 610, 0.075, 0.18, 'triangle'),
          tone(810, 830, 0.09, 0.12, 'sine', 0.025),
        ],
      },
      clear: {
        interval: 1.2,
        priority: 4,
        voices: () => [
          tone(355, 358, 0.2, 0.22, 'triangle'),
          tone(475, 480, 0.23, 0.2, 'triangle', 0.12),
          tone(620, 624, 0.24, 0.2, 'triangle', 0.25),
          tone(785, 794, 0.31, 0.2, 'triangle', 0.38),
          tone(1045, 1055, 0.45, 0.19, 'sine', 0.54),
          tone(1310, 1325, 0.4, 0.11, 'sine', 0.63),
        ],
      },
    };

    function disconnect(node) {
      try {
        node.disconnect();
      } catch {}
    }
    function cleanEvent(event, stop = false) {
      if (event.cleaned) return;
      event.cleaned = true;
      active.delete(event);
      if (stop)
        for (const source of event.sources) {
          source.onended = null;
          try {
            source.stop(context.currentTime);
          } catch {}
        }
      for (const node of event.nodes) disconnect(node);
    }
    function mute() {
      enabled = false;
      lastPlayed.clear();
      if (master && context) {
        try {
          master.gain.cancelScheduledValues(context.currentTime);
          master.gain.setValueAtTime(0, context.currentTime);
        } catch {}
      }
      for (const event of [...active]) cleanEvent(event, true);
    }
    function unlock() {
      if (context.state === 'running' || pendingResume) return;
      // Calling resume immediately inside the Sound button gesture is required on
      // Safari/iPad; never await a promise before initiating it. Every rejection is caught.
      try {
        pendingResume = Promise.resolve(context.resume())
          .catch(() => {
            mute();
          })
          .finally(() => {
            pendingResume = null;
          });
      } catch {
        mute();
      }
    }
    function prepare() {
      if (context && context.state !== 'closed') return true;
      if (context) mute();
      const Context = root.AudioContext || root.webkitAudioContext;
      if (!Context) return false;
      try {
        context = new Context();
        master = context.createGain();
        master.gain.setValueAtTime(0, context.currentTime);
        if (context.createDynamicsCompressor) {
          const limiter = context.createDynamicsCompressor();
          limiter.threshold.value = -18;
          limiter.knee.value = 10;
          limiter.ratio.value = 5;
          limiter.attack.value = 0.003;
          limiter.release.value = 0.12;
          master.connect(limiter);
          limiter.connect(context.destination);
        } else master.connect(context.destination);
        noiseBuffer = null;
        pendingResume = null;
        lastPlayed.clear();
        return true;
      } catch {
        context = null;
        master = null;
        return false;
      }
    }
    function setGameSoundEnabled(value) {
      if (!value) {
        mute();
        return false;
      }
      if (!prepare()) {
        mute();
        return false;
      }
      enabled = true;
      try {
        master.gain.cancelScheduledValues(context.currentTime);
        master.gain.setValueAtTime(MASTER_LEVEL, context.currentTime);
        unlock();
      } catch {
        mute();
      }
      return enabled;
    }
    function getNoise() {
      if (noiseBuffer) return noiseBuffer;
      noiseBuffer = context.createBuffer(
        1,
        Math.ceil(context.sampleRate * 0.45),
        context.sampleRate
      );
      const data = noiseBuffer.getChannelData(0);
      let seed = 0x5eab431;
      for (let i = 0; i < data.length; i++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        data[i] = (seed / 4294967296) * 2 - 1;
      }
      return noiseBuffer;
    }
    function addVoice(event, voice, options, now, bus) {
      const source = voice.noise ? context.createBufferSource() : context.createOscillator();
      event.sources.push(source);
      event.nodes.push(source);
      const envelope = context.createGain();
      event.nodes.push(envelope);
      const begin = now + voice.delay,
        end = begin + voice.duration;
      const attack = Math.min(0.008, voice.duration * 0.15),
        peak = voice.amplitude * options.volume;
      envelope.gain.setValueAtTime(0.0001, begin);
      envelope.gain.linearRampToValueAtTime(peak, begin + attack);
      envelope.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, peak * 0.55),
        begin + voice.duration * 0.45
      );
      envelope.gain.exponentialRampToValueAtTime(0.0001, end);
      source.connect(envelope);
      if (voice.noise) {
        source.buffer = getNoise();
        source.loop = true;
        const filter = context.createBiquadFilter();
        event.nodes.push(filter);
        filter.type = voice.filter;
        filter.Q.value = voice.filter === 'bandpass' ? 0.8 : 0.55;
        filter.frequency.setValueAtTime(voice.from, begin);
        filter.frequency.exponentialRampToValueAtTime(voice.to, end);
        envelope.connect(filter);
        filter.connect(bus);
      } else {
        source.type = voice.type;
        source.frequency.setValueAtTime(voice.from, begin);
        source.frequency.exponentialRampToValueAtTime(voice.to, end);
        envelope.connect(bus);
      }
      source.onended = () => {
        disconnect(source);
        disconnect(envelope);
        event.remaining--;
        if (event.remaining === 0) cleanEvent(event);
      };
      source.start(begin);
      source.stop(end + 0.018);
      event.end = Math.max(event.end, end + 0.02);
    }
    function makeRoom(size, priority, now) {
      for (const event of [...active]) if (event.end <= now) cleanEvent(event);
      let voices = 0;
      for (const event of active) voices += event.remaining;
      while (voices + size > MAX_VOICES || active.size >= MAX_EVENTS) {
        // Important cues may replace older cues of the same importance. Ambient
        // motion never replaces a ring, warning, impact or checkpoint chime.
        let victim = null;
        for (const event of active)
          if (event.priority < priority || (event.priority === priority && priority >= 2)) {
            if (!victim || event.priority < victim.priority) victim = event;
          }
        if (!victim) return false;
        voices -= victim.remaining;
        cleanEvent(victim, true);
      }
      return true;
    }
    function playGameSound(name, options = {}) {
      const cue = Object.prototype.hasOwnProperty.call(cues, name) ? cues[name] : null;
      if (!enabled || !context || !cue || context.state === 'closed') return false;
      options = options && typeof options === 'object' ? options : {};
      const opts = {
        volume: clamp(options.volume, 0, 1, 1),
        charge: clamp(options.charge, 0, 1, 0),
        speed: clamp(Math.abs(options.speed), 0, 32, 0) / 32,
        pan: clamp(options.pan, -1, 1, 0),
        launch: options.launch === true,
      };
      if (opts.volume === 0) return false;
      const now = context.currentTime;
      if (now - (lastPlayed.get(name) ?? -Infinity) < cue.interval) return false;
      const voices = cue.voices(opts);
      if (!makeRoom(voices.length, cue.priority, now)) return false;
      const event = {
        sources: [],
        nodes: [],
        remaining: voices.length,
        end: now,
        priority: cue.priority,
        cleaned: false,
      };
      try {
        unlock();
        if (!enabled) return false;
        let bus = master;
        if (context.createStereoPanner) {
          bus = context.createStereoPanner();
          bus.pan.setValueAtTime(opts.pan, now);
          bus.connect(master);
          event.nodes.push(bus);
        }
        active.add(event);
        for (const voice of voices) addVoice(event, voice, opts, now, bus);
        lastPlayed.set(name, now);
        return true;
      } catch {
        cleanEvent(event, true);
        return false;
      }
    }
    root.setGameSoundEnabled = setGameSoundEnabled;
    root.playGameSound = playGameSound;
  })(window);
