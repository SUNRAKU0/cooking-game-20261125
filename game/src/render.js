// Dapur Kilat — every pixel of the kitchen is drawn here on one canvas.
// Screens: start, play and end. The play screen shows the order board,
// the wok, the chef, the serving counter and the ingredient bins.

import {
  COOK_SECONDS,
  DAY_SECONDS,
  DISHES,
  INGREDIENTS,
  INGREDIENT_ORDER,
  VIEW_H,
  VIEW_W,
  rankFor,
} from './config.js';
import { INGREDIENT_DRAW, drawBurnt, drawDish } from './icons.js';
import { isMuted } from './audio.js';
import { dishForPan } from './state.js';
import {
  AGAIN_BTN,
  BIN_AREA,
  CHEF,
  COOK_BTN,
  MUTE_BTN,
  ORDER_AREA,
  PLATE_SPOTS,
  START_BTN,
  TOP_BAR,
  TRASH_BTN,
  WOK,
  binRect,
  orderRect,
} from './layout.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = 'bold', align = 'center') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function render(ctx, state, now) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  if (state.screen === 'start') {
    drawStart(ctx, state);
  } else if (state.screen === 'end') {
    drawEnd(ctx, state);
  } else {
    drawKitchen(ctx, state, now);
  }
  drawMute(ctx);
}

function drawWall(ctx) {
  ctx.fillStyle = '#f7e3c2';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#f2d3a0';
  for (let y = 60; y < VIEW_H; y += 86) {
    ctx.fillRect(0, y, VIEW_W, 3);
  }
  ctx.fillStyle = '#e8b06a';
  ctx.fillRect(0, 0, VIEW_W, 10);
}

function drawTopBar(ctx, state) {
  ctx.fillStyle = '#7a3b12';
  ctx.fillRect(TOP_BAR.x, TOP_BAR.y, TOP_BAR.w, TOP_BAR.h);
  // Day timer.
  const frac = state.timeLeft / DAY_SECONDS;
  ctx.fillStyle = '#3d1e08';
  rr(ctx, 24, 18, 420, 24, 12);
  ctx.fill();
  ctx.fillStyle = frac > 0.35 ? '#ffcf4d' : '#ff5a3c';
  rr(ctx, 26, 20, 416 * frac, 20, 10);
  ctx.fill();
  text(ctx, `⏱ ${fmtTime(state.timeLeft)}`, 234, 30, 18, '#ffffff');
  text(ctx, 'DAPUR KILAT', 640, 22, 26, '#ffe9b0');
  text(ctx, 'Warung cepat saji — masak, sajikan, jangan sampai pelanggan pergi!', 640, 46, 13, '#f5c98f', 'normal');
  text(ctx, `Skor ${state.score}`, 1010, 22, 22, '#ffffff');
  text(ctx, `Streak x${state.streak}  •  Sajian ${state.served}`, 1010, 46, 14, '#ffd98f', 'normal');
}

function drawOrders(ctx, state) {
  for (let i = 0; i < 3; i++) {
    const r = orderRect(i);
    const order = state.orders[i];
    if (!order) {
      ctx.fillStyle = 'rgba(122, 59, 18, 0.12)';
      rr(ctx, r.x, r.y, r.w, r.h, 12);
      ctx.fill();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#b98a5a';
      ctx.lineWidth = 2;
      rr(ctx, r.x, r.y, r.w, r.h, 12);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'Menunggu pesanan…', r.x + r.w / 2, r.y + r.h / 2, 15, '#a87c4f', 'normal');
      continue;
    }
    const dish = DISHES[order.dishId];
    const frac = Math.max(0, order.patience / order.max);
    ctx.fillStyle = '#fffaf0';
    rr(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.strokeStyle = frac > 0.35 ? '#c9a86a' : '#e23b2e';
    ctx.lineWidth = 3;
    rr(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.stroke();
    // Dish icon + name.
    drawDish(ctx, r.x + 52, r.y + 42, 34, dish, dish.needs);
    text(ctx, dish.name, r.x + 98, r.y + 26, 20, '#5a2d0c', 'bold', 'left');
    text(ctx, `Rp${dish.price}`, r.x + 98, r.y + 52, 15, '#8a5a1d', 'normal', 'left');
    // Required ingredients.
    dish.needs.forEach((id, k) => {
      const ix = r.x + 100 + k * 40;
      const iy = r.y + 78;
      ctx.fillStyle = '#f3e6c8';
      ctx.beginPath();
      ctx.arc(ix, iy, 15, 0, Math.PI * 2);
      ctx.fill();
      INGREDIENT_DRAW[id](ctx, ix, iy, 11);
    });
    // Patience bar.
    ctx.fillStyle = '#e8dcc2';
    rr(ctx, r.x + 250, r.y + 70, 96, 12, 6);
    ctx.fill();
    ctx.fillStyle = frac > 0.35 ? '#57ab4a' : '#e23b2e';
    rr(ctx, r.x + 251, r.y + 71, 94 * frac, 10, 5);
    ctx.fill();
    text(ctx, `${Math.ceil(order.patience)} dtk`, r.x + 298, r.y + 48, 13, '#7a3b12', 'bold');
    // Ready-to-serve badge: a plate with this dish is already waiting
    // on the counter, so the cook can see at a glance which order to
    // serve instead of matching dish names by eye.
    const ready = state.plates.some((p) => p.dishId === order.dishId);
    if (ready) {
      ctx.fillStyle = '#2e7d32';
      rr(ctx, r.x + r.w - 120, r.y + 8, 110, 24, 12);
      ctx.fill();
      text(ctx, '✓ SIAP DIANTAR', r.x + r.w - 65, r.y + 21, 13, '#ffffff');
    }
  }
}

function drawStoveAndWok(ctx, state, now) {
  // Stove.
  ctx.fillStyle = '#4a4a52';
  rr(ctx, WOK.x - 150, WOK.y + 62, 300, 44, 10);
  ctx.fill();
  ctx.fillStyle = '#33333a';
  rr(ctx, WOK.x - 150, WOK.y + 62, 300, 12, 6);
  ctx.fill();
  // Flame while cooking.
  if (state.cooking > 0) {
    const flick = Math.sin(now / 90) * 6;
    ctx.fillStyle = '#ff8c1a';
    ctx.beginPath();
    ctx.moveTo(WOK.x - 70, WOK.y + 62);
    ctx.quadraticCurveTo(WOK.x - 40, WOK.y + 20 + flick, WOK.x, WOK.y + 58);
    ctx.quadraticCurveTo(WOK.x + 40, WOK.y + 20 - flick, WOK.x + 70, WOK.y + 62);
    ctx.closePath();
    ctx.fill();
  }
  // Wok.
  ctx.fillStyle = '#2e2e33';
  ctx.beginPath();
  ctx.arc(WOK.x, WOK.y, WOK.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#454550';
  ctx.beginPath();
  ctx.arc(WOK.x, WOK.y, WOK.r - 10, 0, Math.PI * 2);
  ctx.fill();
  // Ingredients in the pan.
  state.pan.forEach((id, i) => {
    const angle = -Math.PI / 2 + (i - (state.pan.length - 1) / 2) * 0.9;
    const px = WOK.x + Math.cos(angle) * 52;
    const py = WOK.y + Math.sin(angle) * 38;
    INGREDIENT_DRAW[id](ctx, px, py, 30);
  });
  if (state.pan.length === 0 && state.cooking <= 0) {
    text(ctx, 'Wajan kosong', WOK.x, WOK.y, 16, '#9a9aa5', 'normal');
  }
  // Cooking progress ring.
  if (state.cooking > 0) {
    const frac = 1 - state.cooking / COOK_SECONDS;
    ctx.strokeStyle = '#ffcf4d';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(WOK.x, WOK.y, WOK.r - 4, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.stroke();
    text(ctx, 'Memasak…', WOK.x, WOK.y, 20, '#ffe9b0');
  }
  // Wok preview: tell the cook what the pan will become before they
  // commit to cooking it — a wrong combo only shows up as burnt after.
  if (state.cooking <= 0 && state.pan.length > 0) {
    const dishId = dishForPan(state.pan);
    if (dishId) {
      text(ctx, `Akan jadi: ${DISHES[dishId].name}`, WOK.x, WOK.y + 122, 15, '#2e7d32');
    } else {
      text(ctx, 'Bukan resep yang dikenal…', WOK.x, WOK.y + 122, 15, '#a02c1e');
    }
  }
}

function drawChef(ctx, state, now) {
  const bob = state.cooking > 0 ? Math.sin(now / 120) * 4 : Math.sin(now / 900) * 2;
  const x = CHEF.x;
  const y = CHEF.y + bob;
  // Body / apron.
  ctx.fillStyle = '#ffffff';
  rr(ctx, x - 52, y - 6, 104, 96, 18);
  ctx.fill();
  ctx.fillStyle = '#2e7d32';
  rr(ctx, x - 40, y + 20, 80, 64, 12);
  ctx.fill();
  // Head.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(x, y - 34, 34, 0, Math.PI * 2);
  ctx.fill();
  // Chef hat.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - 22, y - 62, 20, 0, Math.PI * 2);
  ctx.arc(x, y - 70, 24, 0, Math.PI * 2);
  ctx.arc(x + 22, y - 62, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 34, y - 66, 68, 16);
  // Face.
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath();
  ctx.arc(x - 12, y - 38, 3.5, 0, Math.PI * 2);
  ctx.arc(x + 12, y - 38, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y - 26, 10, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Moustache.
  ctx.strokeStyle = '#4a2c14';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 20);
  ctx.quadraticCurveTo(x, y - 14, x + 14, y - 20);
  ctx.stroke();
}

function drawPlates(ctx, state) {
  text(ctx, 'MEJA SAJI — klik piring untuk mengantar', 920, 208, 14, '#7a3b12', 'bold');
  PLATE_SPOTS.forEach((spot, i) => {
    ctx.fillStyle = '#d9c39a';
    ctx.beginPath();
    ctx.ellipse(spot.x, spot.y + 46, 84, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    const plate = state.plates[i];
    if (!plate) {
      ctx.strokeStyle = '#b98a5a';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'Kosong', spot.x, spot.y, 14, '#a87c4f', 'normal');
      return;
    }
    if (plate.dishId) {
      drawDish(ctx, spot.x, spot.y, spot.r, DISHES[plate.dishId], DISHES[plate.dishId].needs);
      text(ctx, DISHES[plate.dishId].name, spot.x, spot.y + spot.r + 18, 14, '#5a2d0c');
    } else {
      drawBurnt(ctx, spot.x, spot.y, spot.r);
      text(ctx, 'Gosong! Klik untuk buang', spot.x, spot.y + spot.r + 18, 13, '#a02c1e');
    }
  });
}

function drawButtons(ctx, state) {
  const cooking = state.cooking > 0;
  ctx.fillStyle = cooking ? '#8a8a92' : '#2e7d32';
  rr(ctx, COOK_BTN.x, COOK_BTN.y, COOK_BTN.w, COOK_BTN.h, 12);
  ctx.fill();
  text(ctx, cooking ? 'MEMASAK…' : '🔥 MASAK  (C)', COOK_BTN.x + COOK_BTN.w / 2, COOK_BTN.y + 28, 20, '#ffffff');
  ctx.fillStyle = '#b03a2e';
  rr(ctx, TRASH_BTN.x, TRASH_BTN.y, TRASH_BTN.w, TRASH_BTN.h, 12);
  ctx.fill();
  text(ctx, '🗑 BUANG (B)', TRASH_BTN.x + TRASH_BTN.w / 2, TRASH_BTN.y + 28, 18, '#ffffff');
  text(ctx, 'Klik bahan di bawah (atau tombol 1–8) → MASAK → klik piring untuk mengantar ke pesanan yang cocok.', 640, 556, 15, '#7a5a34', 'normal');
  if (state.toast && state.time < state.toast.until) {
    ctx.fillStyle = 'rgba(43, 43, 43, 0.88)';
    const w = 560;
    rr(ctx, 640 - w / 2, 500, w, 34, 10);
    ctx.fill();
    text(ctx, state.toast.text, 640, 518, 16, '#ffe9b0');
  }
}

function drawBins(ctx, state) {
  ctx.fillStyle = '#8a5a2e';
  rr(ctx, BIN_AREA.x - 10, BIN_AREA.y - 8, BIN_AREA.w + 20, BIN_AREA.h + 16, 14);
  ctx.fill();
  INGREDIENT_ORDER.forEach((id, i) => {
    const r = binRect(i);
    const ing = INGREDIENTS[id];
    ctx.fillStyle = '#fffaf0';
    rr(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 2;
    rr(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.stroke();
    // Bowl.
    ctx.fillStyle = '#e8dcc2';
    ctx.beginPath();
    ctx.arc(r.x + r.w / 2, r.y + 62, 44, 0, Math.PI);
    ctx.fill();
    INGREDIENT_DRAW[id](ctx, r.x + r.w / 2, r.y + 56, 32);
    text(ctx, ing.name, r.x + r.w / 2, r.y + 112, 16, '#5a2d0c');
    ctx.fillStyle = '#7a3b12';
    rr(ctx, r.x + r.w / 2 - 13, r.y + 126, 26, 20, 5);
    ctx.fill();
    text(ctx, ing.key, r.x + r.w / 2, r.y + 137, 13, '#ffffff');
  });
}

function drawFloats(ctx, state) {
  state.floats = state.floats.filter((f) => state.time < f.until);
  for (const f of state.floats) {
    const age = 1 - (f.until - state.time) / 1.2;
    text(ctx, f.text, f.x, f.y - age * 40, 26, f.color);
  }
}

function drawKitchen(ctx, state, now) {
  drawWall(ctx);
  drawTopBar(ctx, state);
  drawOrders(ctx, state);
  drawStoveAndWok(ctx, state, now);
  drawChef(ctx, state, now);
  drawPlates(ctx, state);
  drawButtons(ctx, state);
  drawBins(ctx, state);
  drawFloats(ctx, state);
}

function drawStart(ctx, state) {
  drawWall(ctx);
  ctx.fillStyle = '#7a3b12';
  ctx.fillRect(0, 0, VIEW_W, 60);
  text(ctx, 'DAPUR KILAT', 640, 110, 64, '#7a3b12');
  text(ctx, 'Warung cepat saji — masak pesanan sebelum pelanggan pergi!', 640, 160, 22, '#8a5a1d', 'normal');
  // Hero dish on a big plate.
  drawDish(ctx, 640, 300, 110, DISHES.nasgor, DISHES.nasgor.needs);
  text(ctx, 'Nasi Goreng andalan warung — dan 4 hidangan lainnya menantimu.', 640, 430, 18, '#5a2d0c', 'normal');
  text(ctx, '1  Klik bahan (atau tombol 1–8) untuk mengisi wajan   •   2  Tekan MASAK   •   3  Klik piring untuk mengantar', 640, 470, 17, '#7a5a34', 'normal');
  ctx.fillStyle = '#2e7d32';
  rr(ctx, START_BTN.x, START_BTN.y, START_BTN.w, START_BTN.h, 14);
  ctx.fill();
  text(ctx, '▶  MULAI MASAK', START_BTN.x + START_BTN.w / 2, START_BTN.y + 34, 24, '#ffffff');
  text(ctx, 'Hari kerja 2½ menit — sajikan sebanyak mungkin pesanan!', 640, 620, 16, '#8a5a1d', 'normal');
}

function drawEnd(ctx, state) {
  drawWall(ctx);
  ctx.fillStyle = '#7a3b12';
  ctx.fillRect(0, 0, VIEW_W, 60);
  text(ctx, 'HARI SELESAI!', 640, 110, 52, '#7a3b12');
  const rank = rankFor(state.score, state.served);
  const stars = '★'.repeat(rank.stars) + '☆'.repeat(3 - rank.stars);
  text(ctx, stars, 640, 168, 40, '#e8a91c');
  text(ctx, rank.title, 640, 214, 24, '#5a2d0c');
  const rows = [
    ['Skor akhir', `${state.score}`],
    ['Pesanan tersaji', `${state.served}`],
    ['Masakan gosong', `${state.failed}`],
    ['Pelanggan pergi', `${state.lost}`],
    ['Streak terbaik', `x${state.bestStreak}`],
  ];
  ctx.fillStyle = '#fffaf0';
  rr(ctx, 440, 250, 400, 250, 16);
  ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2;
  rr(ctx, 440, 250, 400, 250, 16);
  ctx.stroke();
  rows.forEach(([label, value], i) => {
    const y = 288 + i * 44;
    text(ctx, label, 470, y, 19, '#7a5a34', 'normal', 'left');
    text(ctx, value, 810, y, 19, '#5a2d0c', 'bold', 'right');
  });
  ctx.fillStyle = '#2e7d32';
  rr(ctx, AGAIN_BTN.x, AGAIN_BTN.y, AGAIN_BTN.w, AGAIN_BTN.h, 14);
  ctx.fill();
  text(ctx, '↻  MAIN LAGI', AGAIN_BTN.x + AGAIN_BTN.w / 2, AGAIN_BTN.y + 34, 24, '#ffffff');
  text(ctx, 'Tekan Enter untuk main lagi', 640, 640, 15, '#8a5a1d', 'normal');
}

function drawMute(ctx) {
  ctx.fillStyle = 'rgba(43, 30, 8, 0.75)';
  rr(ctx, MUTE_BTN.x, MUTE_BTN.y, MUTE_BTN.w, MUTE_BTN.h, 8);
  ctx.fill();
  text(ctx, isMuted() ? '🔇' : '🔊', MUTE_BTN.x + MUTE_BTN.w / 2, MUTE_BTN.y + 23, 20, '#ffffff');
}
