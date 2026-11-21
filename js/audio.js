// Sound: soft UI effects + quiet background music, all synthesised with Web Audio (no files).
// Music is an ORIGINAL ramwong-style tune on a Thai pentatonic scale (ranat pluck + ching).
// To use a licensed recording instead, put it at assets/music.mp3 — it is picked up automatically.
let ctx = null, master = null, musicBus = null, sfxBus = null, on = true, started = false, fileAudio = null, timer = 0;
try { on = localStorage.getItem('mk-sound') !== 'off'; } catch (_) {}

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = on ? 1 : 0; master.connect(ctx.destination);
  musicBus = ctx.createGain(); musicBus.gain.value = .5; musicBus.connect(master);
  sfxBus = ctx.createGain(); sfxBus.gain.value = .55; sfxBus.connect(master);
  return ctx;
}
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function tone(freq, t, { type = 'sine', a = .005, d = .2, vol = .2, to = null, bus = sfxBus } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + a + d * .8);
  env(g, t, a, vol, d); o.connect(g); g.connect(bus); o.start(t); o.stop(t + a + d + .05);
}
let noiseBuf = null;
function noise(t, { d = .2, vol = .15, f0 = 2000, f1 = 600, q = .8, bus = sfxBus, type = 'lowpass' } = {}) {
  if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf; f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + d);
  env(g, t, .005, vol, d); s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + d + .05);
}

/* ---------- effects ---------- */
const FX = {
  tap: (t) => tone(820, t, { to: 1150, d: .06, vol: .09 }),
  pop: (t) => { tone(520, t, { to: 980, d: .1, vol: .14 }); tone(1560, t + .02, { d: .06, vol: .04 }); },
  place: (t) => { tone(330, t, { to: 720, d: .14, vol: .16, type: 'triangle' }); tone(990, t + .05, { d: .08, vol: .05 }); },
  select: (t) => { tone(660, t, { d: .08, vol: .12 }); tone(880, t + .07, { d: .1, vol: .1 }); },
  delete: (t) => { noise(t, { d: .18, vol: .12, f0: 2400, f1: 300 }); tone(420, t, { to: 200, d: .16, vol: .08 }); },
  cut: (t) => noise(t, { d: .22, vol: .14, f0: 5000, f1: 900, type: 'bandpass', q: 1.4 }),
  morph: (t) => { tone(300, t, { to: 600, d: .3, vol: .08, type: 'triangle' }); noise(t, { d: .3, vol: .05, f0: 800, f1: 2600 }); },
  sheet: (t) => noise(t, { d: .25, vol: .06, f0: 600, f1: 2200, type: 'bandpass', q: .7 }),
  splash: (t) => { noise(t, { d: .5, vol: .16, f0: 1800, f1: 200 }); tone(180, t, { to: 90, d: .35, vol: .1 }); tone(1200, t + .08, { to: 700, d: .2, vol: .04 }); },
  chime: (t) => [72, 76, 79, 84].forEach((n, i) => tone(midi(n), t + i * .09, { d: .9, vol: .07, type: 'triangle' })),
  tab: (t) => { tone(600, t, { to: 760, d: .08, vol: .1, type: 'triangle' }); },
};
export function sfx(name) {
  if (!on || !ensure() || ctx.state !== 'running') return;
  const f = FX[name]; if (f) f(ctx.currentTime + .005);
}

/* ---------- music: original tune, Thai pentatonic, ~84 bpm ---------- */
const BPM = 84, BEAT = 60 / BPM;
// [midi, beats]  (C D E G A pentatonic) — four phrases of four bars
const MELODY = [
  [76, 2], [74, 1], [72, 1], [69, 2], [67, 2], [69, 1], [72, 1], [74, 1], [76, 1], [74, 4],
  [76, 2], [74, 1], [72, 1], [69, 2], [72, 2], [67, 1], [69, 1], [72, 1], [69, 1], [67, 4],
  [72, 1], [74, 1], [76, 2], [79, 2], [76, 2], [74, 1], [76, 1], [74, 1], [72, 1], [69, 4],
  [72, 2], [69, 1], [67, 1], [64, 2], [67, 2], [69, 1], [67, 1], [64, 1], [62, 1], [60, 4],
];
const BASS = [48, 45, 43, 50, 48, 45, 43, 43, 48, 43, 50, 45, 45, 40, 43, 48]; // one root per bar
const LOOP_BEATS = 64;
function ranat(freq, t, d) {   // xylophone-like pluck
  tone(freq, t, { type: 'triangle', a: .004, d: Math.min(.9, d * .9), vol: .12, bus: musicBus });
  tone(freq * 2, t, { type: 'sine', a: .002, d: .18, vol: .035, bus: musicBus });
}
function ching(t, open) {   // small Thai cymbals: open "ching" / damped "chap"
  tone(3200, t, { type: 'square', a: .001, d: open ? .35 : .05, vol: open ? .012 : .008, bus: musicBus });
  tone(4170, t, { type: 'square', a: .001, d: open ? .3 : .04, vol: open ? .01 : .007, bus: musicBus });
}
let loopStart = 0, nextIdx = 0, nextBeat = 0, nextPerc = 0;
function schedule() {
  const ahead = ctx.currentTime + .35;
  while (true) {
    const [n, b] = MELODY[nextIdx % MELODY.length], loop = Math.floor(nextIdx / MELODY.length);
    const t = loopStart + (loop * LOOP_BEATS + nextBeat) * BEAT;
    if (t > ahead) break;
    ranat(midi(n), t, b * BEAT);
    if (b >= 2) ranat(midi(n - 12), t + BEAT * .5, b * BEAT * .5);   // soft echo an octave down
    nextBeat += b; nextIdx++; if (nextIdx % MELODY.length === 0) nextBeat = 0;
  }
  while (true) {
    const t = loopStart + nextPerc * BEAT; if (t > ahead) break;
    const bar = Math.floor(nextPerc / 4) % BASS.length, beat = nextPerc % 4;
    if (beat === 0) tone(midi(BASS[bar]), t, { type: 'sine', a: .01, d: BEAT * 1.8, vol: .09, bus: musicBus });
    if (beat === 2) tone(midi(BASS[bar] + 7), t, { type: 'sine', a: .01, d: BEAT * 1.2, vol: .05, bus: musicBus });
    ching(t + BEAT * .5, beat % 2 === 1); if (beat % 2 === 0) ching(t, false);
    nextPerc++;
  }
}
async function startMusic() {
  if (started) return; started = true;
  try {
    const r = await fetch('assets/music.mp3', { method: 'HEAD' });
    if (r.ok) { fileAudio = new Audio('assets/music.mp3'); fileAudio.loop = true; fileAudio.volume = on ? .25 : 0; fileAudio.play().catch(() => {}); return; }
  } catch (_) { /* no file: use the synthesised tune */ }
  loopStart = ctx.currentTime + .2; nextIdx = 0; nextBeat = 0; nextPerc = 0;
  timer = setInterval(() => { if (ctx.state === 'running') schedule(); }, 120);
}

/** Call from a user gesture (first tap). */
export function unlock() {
  if (!ensure()) return;
  if (ctx.state === 'suspended') ctx.resume();
  startMusic();
}
export function isOn() { return on; }
export function setOn(v) {
  on = v; try { localStorage.setItem('mk-sound', v ? 'on' : 'off'); } catch (_) {}
  if (master) master.gain.setTargetAtTime(v ? 1 : 0, ctx.currentTime, .05);
  if (fileAudio) fileAudio.volume = v ? .25 : 0;
}
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) { ctx.suspend(); fileAudio?.pause(); } else { ctx.resume(); if (on) fileAudio?.play().catch(() => {}); }
});
