// Moon Garden — Spot the Difference: the make.fun entry program (Node 22,
// standard library only). The game itself is the static site in game/
// (open game/index.html in a desktop browser; it runs offline with no
// network requests). This program hands the entry in: it copies game/
// and screenshots/ into the output directory and writes dossier.json
// there with the vendored make.fun library, byte for byte the way the
// scorer builds it.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (MAKEFUN_OUTPUT_DIR stands in for /output outside the grader's box.)
// Serve the game locally with: node serve.ts  →  http://localhost:8080

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps, mirrored so this program refuses anything the
// scorer would refuse: at most 4 screenshots of 256 KiB, at most 993
// game files / 48 MiB in game/, no game path over 1000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
