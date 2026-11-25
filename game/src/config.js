// Dapur Kilat — game tuning, dishes and ingredients.
// All names, prices and timings are the game's own design.

export const VIEW_W = 1280;
export const VIEW_H = 720;

export const DAY_SECONDS = 150;

// Eight ingredients a cook can grab from the counter. `key` is the
// keyboard shortcut shown on each bin.
export const INGREDIENTS = {
  nasi: { name: 'Nasi', key: '1', color: '#fff6dd', dark: '#d9c48f' },
  mie: { name: 'Mie', key: '2', color: '#ffd94d', dark: '#c79a1d' },
  telur: { name: 'Telur', key: '3', color: '#fffdf5', dark: '#e8d9a8' },
  ayam: { name: 'Ayam', key: '4', color: '#e8a06a', dark: '#a8642f' },
  sayur: { name: 'Sayur', key: '5', color: '#7dc96b', dark: '#3e7d33' },
  kecap: { name: 'Kecap', key: '6', color: '#4a2c14', dark: '#2a1708' },
  kacang: { name: 'Bumbu Kacang', key: '7', color: '#b5772e', dark: '#7a4a12' },
  cabai: { name: 'Cabai', key: '8', color: '#e23b2e', dark: '#8f1d12' },
};

export const INGREDIENT_ORDER = [
  'nasi', 'mie', 'telur', 'ayam', 'sayur', 'kecap', 'kacang', 'cabai',
];

// Five house dishes. `needs` is the exact set of ingredients the pan
// must hold; anything else comes out burnt.
export const DISHES = {
  nasgor: {
    name: 'Nasi Goreng',
    price: 120,
    needs: ['nasi', 'telur', 'kecap'],
    plate: '#f0a13a',
  },
  miegor: {
    name: 'Mie Goreng',
    price: 110,
    needs: ['mie', 'telur', 'sayur', 'kecap'],
    plate: '#e8c33a',
  },
  sate: {
    name: 'Sate Ayam',
    price: 150,
    needs: ['ayam', 'kacang'],
    plate: '#d97b3f',
  },
  gado: {
    name: 'Gado-Gado',
    price: 100,
    needs: ['sayur', 'telur', 'kacang'],
    plate: '#8fbf5a',
  },
  geprek: {
    name: 'Ayam Geprek',
    price: 140,
    needs: ['ayam', 'cabai', 'nasi'],
    plate: '#e05a3a',
  },
};

export const DISH_ORDER = ['nasgor', 'miegor', 'sate', 'gado', 'geprek'];

// How the day ramps up: orders arrive faster and customers get less
// patient as the clock runs down.
export function spawnIntervalAt(elapsed) {
  const t = Math.min(1, elapsed / DAY_SECONDS);
  return 9 - 4 * t; // 9s early, 5s late
}

export function patienceAt(elapsed) {
  const t = Math.min(1, elapsed / DAY_SECONDS);
  return 32 - 10 * t; // 32s early, 22s late
}

export const COOK_SECONDS = 2.4;
export const MAX_ORDERS = 3;
export const MAX_PLATES = 2;
export const MAX_PAN = 4;

// Score: dish price plus a tip worth up to half the price for fast
// service, then a combo bonus of +10% per streak level (capped +50%).
export function serveScore(dish, patienceLeft, patienceMax, streak) {
  const tip = Math.round((dish.price * 0.5 * patienceLeft) / patienceMax);
  const combo = 1 + Math.min(0.5, 0.1 * Math.max(0, streak - 1));
  return Math.round((dish.price + tip) * combo);
}

export function rankFor(score, served) {
  if (served >= 18 && score >= 3200) return { stars: 3, title: 'Koki Legenda Warung' };
  if (served >= 12 && score >= 2000) return { stars: 2, title: 'Koki Andal' };
  if (served >= 6 && score >= 1000) return { stars: 1, title: 'Koki Magang Naik Kelas' };
  return { stars: 0, title: 'Koki Pemula — Terus Berlatih!' };
}
