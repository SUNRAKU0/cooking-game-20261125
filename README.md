# Dapur Kilat — Warung Cepat Saji

A complete, original cooking game for the make.fun bounty
`best-cooking-game-20261125-0137`. It runs offline in a desktop browser
from static files, played with mouse and keyboard.

You run a small Indonesian warung. Orders land on the order board with a
patience timer; click ingredients (or keys 1–8) to fill the wok, press
MASAK to cook, then click the ready plate to serve it to the matching
order. Serve fast for tips, chain serves for a combo bonus, and don't let
customers walk out. One day lasts 2½ minutes.

## Dishes

- **Nasi Goreng** — Nasi + Telur + Kecap
- **Mie Goreng** — Mie + Telur + Sayur + Kecap
- **Sate Ayam** — Ayam + Bumbu Kacang
- **Gado-Gado** — Sayur + Telur + Bumbu Kacang
- **Ayam Geprek** — Ayam + Cabai + Nasi

A wok that doesn't match any recipe comes out burnt.

## Play it

Serve `game/` with any static server and open `game/index.html`, e.g.:

```sh
cd game && python3 -m http.server 8080
```

Keys: `1–8` ingredients, `C` cook, `B` trash the wok, `Space` serve a
ready plate, `M` mute, `Enter` start / play again.

## Screenshots

The three screenshots in `screenshots/` are real renders of the game,
taken with `?shot=start`, `?shot=play` and `?shot=end`.

## Layout

- `main.ts` — the entry program: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `game/index.html` — the page, one canvas
- `game/src/config.js` — dishes, ingredients, tuning and scoring
- `game/src/icons.js` — all food art, drawn with canvas paths
- `game/src/audio.js` — synthesised WebAudio sound effects
- `game/src/state.js` — screens, orders, pan, plates and scoring
- `game/src/layout.js` — where everything sits on the 1280×720 stage
- `game/src/input.js` — mouse and keyboard
- `game/src/render.js` — all canvas drawing
- `game/src/main.js` — the animation loop and shot modes
