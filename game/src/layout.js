// Dapur Kilat — where everything sits on the 1280x720 stage.
// render.js draws here and input.js hit-tests here, so the two agree.

import { INGREDIENT_ORDER } from './config.js';

export const TOP_BAR = { x: 0, y: 0, w: 1280, h: 60 };
export const ORDER_AREA = { x: 40, y: 72, w: 1200, h: 100 };
export const ORDER_W = 360;
export const ORDER_GAP = 40;

export function orderRect(i) {
  return {
    x: ORDER_AREA.x + i * (ORDER_W + ORDER_GAP),
    y: ORDER_AREA.y,
    w: ORDER_W,
    h: ORDER_AREA.h,
  };
}

export const WOK = { x: 330, y: 330, r: 118 };
export const CHEF = { x: 640, y: 330 };
export const PLATE_SPOTS = [
  { x: 980, y: 320, r: 66 },
  { x: 1130, y: 320, r: 66 },
];

export const COOK_BTN = { x: 230, y: 472, w: 200, h: 54 };
export const TRASH_BTN = { x: 450, y: 472, w: 130, h: 54 };
export const START_BTN = { x: 490, y: 520, w: 300, h: 64 };
export const AGAIN_BTN = { x: 490, y: 540, w: 300, h: 64 };
export const MUTE_BTN = { x: 1216, y: 8, w: 56, h: 44 };

export const BIN_AREA = { x: 38, y: 548, w: 1204, h: 150 };
export const BIN_W = 140;
export const BIN_GAP = 12;

export function binRect(i) {
  return {
    x: BIN_AREA.x + i * (BIN_W + BIN_GAP),
    y: BIN_AREA.y,
    w: BIN_W,
    h: BIN_AREA.h,
  };
}

export function binIndexAt(x, y) {
  for (let i = 0; i < INGREDIENT_ORDER.length; i++) {
    const r = binRect(i);
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

export function pointIn(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function orderIndexAt(x, y) {
  for (let i = 0; i < 3; i++) {
    if (pointIn(orderRect(i), x, y)) return i;
  }
  return -1;
}

export function plateIndexAt(x, y) {
  for (let i = 0; i < PLATE_SPOTS.length; i++) {
    const p = PLATE_SPOTS[i];
    const dx = x - p.x;
    const dy = y - p.y;
    if (dx * dx + dy * dy <= (p.r + 10) * (p.r + 10)) return i;
  }
  return -1;
}

export function wokHit(x, y) {
  const dx = x - WOK.x;
  const dy = y - WOK.y;
  return dx * dx + dy * dy <= (WOK.r + 14) * (WOK.r + 14);
}
