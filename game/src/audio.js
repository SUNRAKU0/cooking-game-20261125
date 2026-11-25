// Dapur Kilat — tiny WebAudio sound effects, synthesised, no audio files.
// The context is created lazily on the first user gesture so browsers
// allow it; every effect is a short oscillator blip.

let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function audio() {
  if (muted) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function blip(freq, dur, type, vol, when = 0) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function sfxClick() {
  blip(660, 0.07, 'triangle', 0.12);
}

export function sfxAdd() {
  blip(520, 0.06, 'sine', 0.14);
  blip(780, 0.08, 'sine', 0.12, 0.05);
}

export function sfxSizzle() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const len = Math.floor(ac.sampleRate * 0.5);
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.25;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2500;
  src.connect(filter);
  filter.connect(ac.destination);
  src.start(t);
}

export function sfxDing() {
  blip(880, 0.12, 'sine', 0.16);
  blip(1318, 0.22, 'sine', 0.14, 0.09);
}

export function sfxBad() {
  blip(220, 0.18, 'sawtooth', 0.08);
  blip(160, 0.22, 'sawtooth', 0.07, 0.1);
}

export function sfxServe() {
  blip(784, 0.08, 'triangle', 0.14);
  blip(988, 0.08, 'triangle', 0.14, 0.07);
  blip(1175, 0.16, 'triangle', 0.14, 0.14);
}

export function sfxEnd() {
  [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.22, 'triangle', 0.14, i * 0.13));
}
