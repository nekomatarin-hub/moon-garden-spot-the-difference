# Moon Garden — Spot the Difference

[![Play on make.fun](https://make.fun/api/competitions/best-spot-the-difference-game-20261121-0451/badge.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451?ref=fs66msvv)
[![make.fun competition](https://make.fun/api/badges/competition.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451?ref=fs66msvv)
[![Built for make.fun](https://make.fun/api/badges/built-for.svg)](https://make.fun?ref=fs66msvv)

One moonlit garden, drawn twice — and the right-hand copy hides **8 quiet
changes**: the moon slips from full to crescent, a bright star goes out,
the lantern burns teal instead of amber, a tulip vanishes, the teapot
loses its steam, an extra butterfly drifts in, an apple disappears from
the tree, and the cat's bell turns from gold to red.

Click a change in **either** picture and it is ringed in gold on **both**,
so you always see what you found and where. The header keeps score the
whole round — found, still to go, time and misses — and the round ends
with a celebration when the last difference is ringed.

## Play

Open `game/index.html` in a desktop browser — it is a static site, no
build, no network. Or serve the folder:

```sh
node serve.ts   # → http://localhost:8080
```

- **Mouse / touch:** click or tap a difference in either picture.
- **Keyboard:** arrow keys or `W A S D` move the gold ring, `Tab`
  switches picture, `Enter` checks the ring's spot, `R` starts a new
  round. Wrong clicks ripple red on both pictures and count as misses;
  there is no miss limit, only the clock.

## How it is built

- `game/` — the game itself: `index.html` plus ES modules under
  `src/`. `src/scene.js` draws the whole garden with canvas vector
  shapes (a seeded star field, so both panels agree star for star) and
  holds the eight differences as data — position, click radius and how
  the right-hand drawing changes. `src/main.js` is the game: state,
  mouse and keyboard input, the found-rings, the header counter, the
  title and clear screens, and the `?shot=` states the screenshots use.
- `screenshots/` — four honest frames from those shot states: the
  title, a round with 3 of 8 found and 5 to go, a round with 6 found,
  and the all-found celebration.
- `main.ts` — the entry program (Node 22, standard library only): it
  copies `game/` and `screenshots/` to the output directory and writes
  `dossier.json` with the vendored make.fun library in `vendor/`.

An entry to make.fun's
[Make the best spot the difference game](https://make.fun/c/best-spot-the-difference-game-20261121-0451?ref=fs66msvv)
competition. MIT licensed.
