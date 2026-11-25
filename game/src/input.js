// Dapur Kilat — mouse and keyboard input. It translates clicks and
// keys into kitchen actions and hands the results to state.js.

import { INGREDIENTS, INGREDIENT_ORDER } from './config.js';
import {
  AGAIN_BTN,
  COOK_BTN,
  MUTE_BTN,
  START_BTN,
  TRASH_BTN,
  binIndexAt,
  orderIndexAt,
  plateIndexAt,
  pointIn,
  wokHit,
} from './layout.js';
import {
  addIngredient,
  matchingOrderIndex,
  servePlate,
  showToast,
  startCooking,
  startDay,
  trashPan,
  trashPlate,
} from './state.js';
import {
  isMuted,
  setMuted,
  sfxAdd,
  sfxBad,
  sfxClick,
  sfxServe,
  sfxSizzle,
} from './audio.js';

export function attachInput(canvas, state) {
  canvas.addEventListener('click', (event) => {
    const pos = canvasPos(canvas, event);
    handleClick(state, pos.x, pos.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    handleKey(state, event.key.toLowerCase());
  });
}

function canvasPos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function handleClick(state, x, y) {
  if (pointIn(MUTE_BTN, x, y)) {
    setMuted(!isMuted());
    return;
  }

  if (state.screen === 'start') {
    if (pointIn(START_BTN, x, y)) {
      sfxClick();
      startDay(state);
    }
    return;
  }

  if (state.screen === 'end') {
    if (pointIn(AGAIN_BTN, x, y)) {
      sfxClick();
      startDay(state);
    }
    return;
  }

  // Playing.
  const bin = binIndexAt(x, y);
  if (bin >= 0) {
    const id = INGREDIENT_ORDER[bin];
    const res = addIngredient(state, id);
    if (res === 'ok') sfxAdd();
    else if (res === 'full') {
      sfxBad();
      showToast(state, 'Wajan penuh! Masak dulu atau buang.');
    }
    return;
  }

  if (pointIn(COOK_BTN, x, y) || wokHit(x, y)) {
    const res = startCooking(state);
    if (res === 'ok') sfxSizzle();
    else if (res === 'empty') {
      sfxBad();
      showToast(state, 'Wajan kosong — masukkan bahan dulu!');
    }
    return;
  }

  if (pointIn(TRASH_BTN, x, y)) {
    if (state.pan.length > 0) {
      sfxClick();
      trashPan(state);
    }
    return;
  }

  const plate = plateIndexAt(x, y);
  if (plate >= 0 && state.plates[plate]) {
    const dish = state.plates[plate];
    if (!dish.dishId) {
      // Burnt plate: click to throw it away.
      sfxClick();
      trashPlate(state, plate);
      showToast(state, 'Masakan gosong dibuang.');
      return;
    }
    const orderIdx = matchingOrderIndex(state, dish.dishId);
    if (orderIdx >= 0) {
      const res = servePlate(state, plate, orderIdx);
      if (res && res !== 'mismatch') {
        sfxServe();
        state.floats.push({
          text: `+${res.points}`,
          x: 980,
          y: 240,
          until: state.time + 1.2,
          color: '#2e7d32',
        });
      }
    } else {
      sfxBad();
      showToast(state, 'Tidak ada pesanan yang cocok!');
    }
    return;
  }

  const order = orderIndexAt(x, y);
  if (order >= 0 && state.selectedPlate >= 0) {
    const res = servePlate(state, state.selectedPlate, order);
    if (res === 'mismatch') {
      sfxBad();
      showToast(state, 'Piring itu bukan untuk pesanan ini!');
    } else if (res) {
      sfxServe();
    }
  }
}

function handleKey(state, key) {
  if (key === 'm') {
    setMuted(!isMuted());
    return;
  }
  if (state.screen === 'start') {
    if (key === 'enter' || key === ' ') {
      sfxClick();
      startDay(state);
    }
    return;
  }
  if (state.screen === 'end') {
    if (key === 'enter' || key === 'r') {
      sfxClick();
      startDay(state);
    }
    return;
  }

  const ing = INGREDIENT_ORDER.find((id) => INGREDIENTS[id].key === key);
  if (ing) {
    const res = addIngredient(state, ing);
    if (res === 'ok') sfxAdd();
    return;
  }
  if (key === 'c' || key === 'enter') {
    const res = startCooking(state);
    if (res === 'ok') sfxSizzle();
    return;
  }
  if (key === 'b') {
    trashPan(state);
    return;
  }
  if (key === ' ') {
    const ready = state.plates.findIndex((p) => p.dishId);
    if (ready >= 0) {
      const orderIdx = matchingOrderIndex(state, state.plates[ready].dishId);
      if (orderIdx >= 0) {
        const res = servePlate(state, ready, orderIdx);
        if (res && res !== 'mismatch') sfxServe();
      }
    }
  }
}
