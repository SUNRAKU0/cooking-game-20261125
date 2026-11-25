// Dapur Kilat — entry point: the animation loop, the screenshot shot
// modes (?shot=start|play|end) and the wiring between state, input
// and rendering.

import { VIEW_H, VIEW_W } from './config.js';
import { newState, seedShot, tick } from './state.js';
import { attachInput } from './input.js';
import { render } from './render.js';
import { sfxEnd } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const state = newState();
attachInput(canvas, state);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot === 'start' || shot === 'play' || shot === 'end') {
  seedShot(state, shot);
}

let last = performance.now();
let endSoundPlayed = false;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  const wasPlaying = state.screen === 'play';
  tick(state, dt);
  if (wasPlaying && state.screen === 'end' && !endSoundPlayed) {
    endSoundPlayed = true;
    sfxEnd();
  }
  if (state.screen === 'play') endSoundPlayed = false;
  render(ctx, state, now);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
