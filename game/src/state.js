// Dapur Kilat — the game state: screens, orders, the pan, plates and
// scoring. Rendering and input live in their own files; this one only
// knows what the kitchen holds and what happens when time passes.

import {
  DAY_SECONDS,
  DISHES,
  DISH_ORDER,
  MAX_ORDERS,
  MAX_PAN,
  MAX_PLATES,
  COOK_SECONDS,
  patienceAt,
  serveScore,
  spawnIntervalAt,
} from './config.js';

let orderSeq = 0;

export function newState() {
  return {
    screen: 'start', // 'start' | 'play' | 'end'
    time: 0, // seconds into the day
    timeLeft: DAY_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    failed: 0,
    lost: 0,
    streak: 0,
    bestStreak: 0,
    orders: [],
    pan: [], // ingredient ids in the wok
    cooking: 0, // seconds left while the wok is hot, 0 = idle
    plates: [], // { dishId | null, ready: bool, born: time }
    spawnIn: 2.5,
    toast: null, // { text, until }
    floats: [], // { text, x, y, until, color }
    selectedPlate: -1,
    dayOver: false,
  };
}

function pickDish() {
  return DISH_ORDER[Math.floor(Math.random() * DISH_ORDER.length)];
}

function spawnOrder(state) {
  const dishId = pickDish();
  const patience = patienceAt(state.time);
  state.orders.push({
    id: ++orderSeq,
    dishId,
    patience,
    max: patience,
  });
}

export function startDay(state) {
  const fresh = newState();
  Object.assign(state, fresh, { screen: 'play' });
  spawnOrder(state);
  spawnOrder(state);
  state.spawnIn = spawnIntervalAt(0);
}

export function dishForPan(pan) {
  if (pan.length === 0) return null;
  const sorted = [...pan].sort().join(',');
  for (const id of DISH_ORDER) {
    if ([...DISHES[id].needs].sort().join(',') === sorted) return id;
  }
  return null;
}

export function addIngredient(state, id) {
  if (state.screen !== 'play' || state.cooking > 0) return 'busy';
  if (state.pan.length >= MAX_PAN) return 'full';
  state.pan.push(id);
  return 'ok';
}

export function trashPan(state) {
  if (state.screen !== 'play' || state.cooking > 0) return;
  state.pan = [];
}

export function startCooking(state) {
  if (state.screen !== 'play' || state.cooking > 0) return 'busy';
  if (state.pan.length === 0) return 'empty';
  state.cooking = COOK_SECONDS;
  return 'ok';
}

export function trashPlate(state, index) {
  if (index < 0 || index >= state.plates.length) return;
  state.plates.splice(index, 1);
  if (state.selectedPlate === index) state.selectedPlate = -1;
  else if (state.selectedPlate > index) state.selectedPlate -= 1;
}

export function servePlate(state, plateIndex, orderIndex) {
  const plate = state.plates[plateIndex];
  const order = state.orders[orderIndex];
  if (!plate || !order || !plate.dishId) return null;
  if (plate.dishId !== order.dishId) return 'mismatch';
  const dish = DISHES[plate.dishId];
  const points = serveScore(dish, order.patience, order.max, state.streak);
  state.score += points;
  state.coins += points;
  state.served += 1;
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  state.plates.splice(plateIndex, 1);
  state.orders.splice(orderIndex, 1);
  state.selectedPlate = -1;
  return { points, dish };
}

// One tick of the kitchen clock. `dt` is seconds since the last tick.
export function tick(state, dt) {
  if (state.screen !== 'play') return;
  state.time += dt;
  state.timeLeft = Math.max(0, DAY_SECONDS - state.time);

  if (state.cooking > 0) {
    state.cooking -= dt;
    if (state.cooking <= 0) {
      state.cooking = 0;
      const dishId = dishForPan(state.pan);
      state.pan = [];
      if (state.plates.length < MAX_PLATES) {
        state.plates.push({ dishId, born: state.time });
        if (!dishId) state.failed += 1;
      } else if (!dishId) {
        state.failed += 1;
      }
    }
  }

  for (let i = state.orders.length - 1; i >= 0; i--) {
    const order = state.orders[i];
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders.splice(i, 1);
      state.lost += 1;
      state.streak = 0;
      showToast(state, 'Pelanggan pergi, pesanan hangus!');
    }
  }

  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.orders.length < MAX_ORDERS) {
    spawnOrder(state);
    state.spawnIn = spawnIntervalAt(state.time);
  } else if (state.spawnIn <= 0) {
    state.spawnIn = 1;
  }

  if (state.timeLeft <= 0 && !state.dayOver) {
    state.dayOver = true;
    state.screen = 'end';
  }
}

export function showToast(state, text, seconds = 2) {
  state.toast = { text, until: state.time + seconds };
}

export function addFloat(state, text, x, y, color) {
  state.floats.push({ text, x, y, until: state.time + 1.2, color });
}

export function matchingOrderIndex(state, dishId) {
  return state.orders.findIndex((o) => o.dishId === dishId);
}

// Deterministic states for the three screenshots.
export function seedShot(state, shot) {
  const base = newState();
  Object.assign(state, base);
  if (shot === 'start') {
    state.screen = 'start';
    return;
  }
  if (shot === 'play') {
    state.screen = 'play';
    state.time = 42;
    state.timeLeft = DAY_SECONDS - 42;
    state.score = 320;
    state.coins = 320;
    state.served = 3;
    state.streak = 2;
    state.bestStreak = 3;
    state.orders = [
      { id: 101, dishId: 'nasgor', patience: 18, max: 30 },
      { id: 102, dishId: 'sate', patience: 9, max: 26 },
      { id: 103, dishId: 'miegor', patience: 24, max: 30 },
    ];
    state.pan = ['nasi', 'telur'];
    state.plates = [{ dishId: 'gado', born: 40 }];
    state.spawnIn = 4;
    return;
  }
  if (shot === 'end') {
    state.screen = 'end';
    state.time = DAY_SECONDS;
    state.timeLeft = 0;
    state.score = 2450;
    state.coins = 2450;
    state.served = 14;
    state.failed = 1;
    state.lost = 2;
    state.streak = 0;
    state.bestStreak = 5;
    state.dayOver = true;
  }
}
