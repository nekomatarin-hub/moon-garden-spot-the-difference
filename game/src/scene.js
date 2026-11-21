// Moon Garden scene: one garden at night, drawn twice. The left panel is
// the original; the right panel is drawn with every difference applied.
// Each difference is data: where it is (for click tests and markers) and
// how the right-hand drawing changes. Everything is vector shapes on a
// 480x400 canvas, deterministic — the star field comes from a seeded
// generator, so both panels (and every screenshot) agree star for star.

export const SCENE_W = 480;
export const SCENE_H = 400;

/** The eight differences. x/y/r are scene coordinates for the click test. */
export const DIFFERENCES = [
  { id: 'moon', x: 78, y: 64, r: 36, label: 'The moon changed phase' },
  { id: 'star', x: 398, y: 54, r: 24, label: 'A bright star went out' },
  { id: 'lantern', x: 268, y: 206, r: 27, label: 'The lantern burns teal, not amber' },
  { id: 'tulip', x: 86, y: 358, r: 25, label: 'One tulip is missing' },
  { id: 'steam', x: 150, y: 260, r: 25, label: 'The teapot lost its steam' },
  { id: 'butterfly', x: 128, y: 84, r: 25, label: 'An extra butterfly appeared' },
  { id: 'apple', x: 106, y: 132, r: 23, label: 'One apple is gone from the tree' },
  { id: 'bell', x: 228, y: 306, r: 20, label: "The cat's bell changed colour" },
];

/** mulberry32: small seeded RNG so the garden is the same on every load. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STARS = (() => {
  const rand = rng(20261121);
  const stars = [];
  for (let i = 0; i < 46; i += 1) {
    stars.push({ x: 8 + rand() * 464, y: 8 + rand() * 150, r: 0.8 + rand() * 1.5, tw: rand() * Math.PI * 2 });
  }
  return stars;
})();

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A four-point sparkle star, centred at x/y. */
function sparkle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawMoon(ctx, altered) {
  if (!altered) {
    const glow = ctx.createRadialGradient(78, 64, 10, 78, 64, 62);
    glow.addColorStop(0, 'rgba(250,230,160,0.5)');
    glow.addColorStop(1, 'rgba(250,230,160,0)');
    circle(ctx, 78, 64, 62, glow);
    circle(ctx, 78, 64, 30, '#f7e7ae');
    circle(ctx, 68, 54, 6, '#ecd894');
    circle(ctx, 88, 76, 4.5, '#ecd894');
    circle(ctx, 74, 82, 3.4, '#ecd894');
  } else {
    // Crescent: the same moon with most of its face in shadow.
    circle(ctx, 78, 64, 30, '#f7e7ae');
    circle(ctx, 96, 53, 27, '#1d2a52');
    circle(ctx, 64, 50, 4.5, '#ecd894');
  }
}

function drawTree(ctx, altered) {
  ctx.strokeStyle = '#4a3220';
  ctx.lineCap = 'round';
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(78, 252);
  ctx.quadraticCurveTo(74, 200, 78, 158);
  ctx.stroke();
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(78, 190);
  ctx.quadraticCurveTo(52, 168, 38, 146);
  ctx.moveTo(79, 178);
  ctx.quadraticCurveTo(104, 158, 118, 138);
  ctx.stroke();
  const blobs = [
    [78, 118, 47], [44, 138, 30], [112, 140, 31], [60, 96, 28], [98, 98, 27], [78, 142, 34],
  ];
  for (const [x, y, r] of blobs) circle(ctx, x, y, r, '#2e6b46');
  for (const [x, y, r] of blobs) {
    ctx.beginPath();
    ctx.arc(x - 6, y - 7, r * 0.62, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(88,160,110,0.5)';
    ctx.fill();
  }
  // Apples — the one at (106,132) is missing in the altered panel.
  const apples = [[48, 128], [78, 112], [106, 132], [58, 162], [96, 166], [76, 142]];
  for (const [x, y] of apples) {
    if (altered && x === 106 && y === 132) continue;
    circle(ctx, x, y, 6.5, '#d94f3d');
    circle(ctx, x - 2, y - 2, 2, '#f0856f');
  }
}

function drawCottage(ctx) {
  roundRect(ctx, 330, 196, 118, 74, 4, '#e8dcc3');
  ctx.beginPath();
  ctx.moveTo(318, 200);
  ctx.lineTo(389, 156);
  ctx.lineTo(460, 200);
  ctx.closePath();
  ctx.fillStyle = '#8a4b38';
  ctx.fill();
  roundRect(ctx, 414, 160, 16, 30, 2, '#7a5a48');
  ctx.strokeStyle = 'rgba(230,230,240,0.55)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(422, 156);
  ctx.quadraticCurveTo(414, 138, 424, 126);
  ctx.quadraticCurveTo(432, 114, 424, 100);
  ctx.stroke();
  roundRect(ctx, 376, 224, 26, 46, 8, '#5d4030');
  circle(ctx, 396, 248, 2.4, '#f2c14e');
  roundRect(ctx, 340, 214, 22, 22, 3, '#ffd97a');
  roundRect(ctx, 420, 214, 20, 22, 3, '#ffd97a');
  ctx.strokeStyle = '#5d4030';
  ctx.lineWidth = 2.4;
  ctx.strokeRect(340, 214, 22, 22);
  ctx.strokeRect(420, 214, 20, 22);
  circle(ctx, 389, 190, 9, '#ffe9a8');
  ctx.beginPath();
  ctx.arc(389, 190, 9, 0, Math.PI * 2);
  ctx.strokeStyle = '#5d4030';
  ctx.lineWidth = 2.2;
  ctx.stroke();
}

function drawLantern(ctx, altered) {
  ctx.strokeStyle = '#2c2c38';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(268, 292);
  ctx.lineTo(268, 224);
  ctx.stroke();
  const colour = altered ? '#57e6c9' : '#ffc95e';
  const glow = ctx.createRadialGradient(268, 206, 4, 268, 206, 40);
  glow.addColorStop(0, altered ? 'rgba(87,230,201,0.55)' : 'rgba(255,201,94,0.55)');
  glow.addColorStop(1, 'rgba(255,201,94,0)');
  circle(ctx, 268, 206, 40, glow);
  roundRect(ctx, 256, 192, 24, 28, 5, '#2c2c38');
  roundRect(ctx, 260, 196, 16, 20, 3, colour);
  ctx.beginPath();
  ctx.moveTo(252, 192);
  ctx.lineTo(284, 192);
  ctx.lineTo(268, 180);
  ctx.closePath();
  ctx.fillStyle = '#2c2c38';
  ctx.fill();
}

function drawTableAndTea(ctx, altered) {
  // A little garden table with a teapot and a cup.
  roundRect(ctx, 118, 292, 64, 7, 3, '#6e4f30');
  roundRect(ctx, 124, 299, 6, 26, 2, '#54382a');
  roundRect(ctx, 170, 299, 6, 26, 2, '#54382a');
  // Teapot: body, spout, handle, lid.
  ellipse(ctx, 140, 284, 17, 10, '#c95d7b');
  ctx.beginPath();
  ctx.moveTo(125, 280);
  ctx.lineTo(112, 272);
  ctx.lineTo(116, 266);
  ctx.lineTo(128, 274);
  ctx.closePath();
  ctx.fillStyle = '#c95d7b';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(157, 283, 8, -1.1, 1.5);
  ctx.strokeStyle = '#c95d7b';
  ctx.lineWidth = 4;
  ctx.stroke();
  circle(ctx, 140, 273, 4, '#a8485f');
  // Cup.
  roundRect(ctx, 164, 284, 15, 9, 3, '#e8e4da');
  // Steam — only in the original.
  if (!altered) {
    ctx.strokeStyle = 'rgba(240,244,255,0.8)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(138, 264);
    ctx.quadraticCurveTo(132, 254, 139, 246);
    ctx.quadraticCurveTo(144, 240, 140, 232);
    ctx.moveTo(152, 266);
    ctx.quadraticCurveTo(147, 257, 153, 249);
    ctx.stroke();
  }
}

function drawCat(ctx, altered) {
  // A grey cat sitting on the path, tail curled round its feet.
  ctx.strokeStyle = '#565d6e';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(252, 330);
  ctx.quadraticCurveTo(272, 322, 266, 306);
  ctx.stroke();
  ellipse(ctx, 228, 318, 25, 21, '#6b7285');
  ellipse(ctx, 228, 322, 17, 14, '#7d8496');
  circle(ctx, 228, 288, 16, '#6b7285');
  // Ears with pink inners.
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(228 + s * 13, 279);
    ctx.lineTo(228 + s * 15, 262);
    ctx.lineTo(228 + s * 3, 272);
    ctx.closePath();
    ctx.fillStyle = '#6b7285';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(228 + s * 11, 276);
    ctx.lineTo(228 + s * 12.5, 267);
    ctx.lineTo(228 + s * 5, 272);
    ctx.closePath();
    ctx.fillStyle = '#e59bb0';
    ctx.fill();
  }
  // Closed happy eyes and a tiny nose.
  ctx.strokeStyle = '#2e3242';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(221, 288, 3.4, Math.PI * 1.08, Math.PI * 1.92);
  ctx.arc(235, 288, 3.4, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(226, 294);
  ctx.lineTo(230, 294);
  ctx.lineTo(228, 296.6);
  ctx.closePath();
  ctx.fillStyle = '#e59bb0';
  ctx.fill();
  // Collar and bell — gold in the original, red in the altered panel.
  ctx.strokeStyle = '#37415c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(228, 292, 13.5, Math.PI * 0.25, Math.PI * 0.75);
  ctx.stroke();
  circle(ctx, 228, 306, 6, altered ? '#e0483e' : '#f2c14e');
  circle(ctx, 226, 304, 1.8, 'rgba(255,255,255,0.75)');
}

function drawTulips(ctx, altered) {
  const tulips = [
    { x: 30, c: '#e5637f' }, { x: 58, c: '#f2c14e' }, { x: 86, c: '#e5637f' },
    { x: 114, c: '#b388e6' }, { x: 142, c: '#f2c14e' },
  ];
  for (const t of tulips) {
    if (altered && t.x === 86) continue; // the middle tulip is gone
    ctx.strokeStyle = '#3f7d4e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(t.x, 378);
    ctx.lineTo(t.x, 362);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(t.x - 6, 370, 6, 2.6, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#4c9159';
    ctx.fill();
    // Flower head: three petals.
    ctx.beginPath();
    ctx.moveTo(t.x - 7, 350);
    ctx.lineTo(t.x - 7, 360);
    ctx.quadraticCurveTo(t.x, 366, t.x + 7, 360);
    ctx.lineTo(t.x + 7, 350);
    ctx.lineTo(t.x + 3.5, 355);
    ctx.lineTo(t.x, 350);
    ctx.lineTo(t.x - 3.5, 355);
    ctx.closePath();
    ctx.fillStyle = t.c;
    ctx.fill();
  }
}

function drawButterfly(ctx, x, y, wing, flap) {
  const s = Math.sin(flap) * 0.25 + 0.75;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, 1);
  ellipse(ctx, -6, 0, 7, 4.6, wing);
  ellipse(ctx, 6, 0, 7, 4.6, wing);
  ctx.restore();
  ellipse(ctx, x, y, 1.8, 5, '#33333f');
}

function drawPond(ctx) {
  ellipse(ctx, 392, 358, 76, 25, '#274a73');
  ellipse(ctx, 392, 355, 76, 23, '#2f5b8c');
  ellipse(ctx, 366, 350, 13, 5, '#3f7d4e');
  ellipse(ctx, 420, 362, 10, 4, '#3f7d4e');
  circle(ctx, 366, 347, 3.4, '#e59bb0');
  ctx.strokeStyle = 'rgba(190,220,250,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(398, 360, 30, 7, 0, 0.3, 2.4);
  ctx.stroke();
}

/**
 * Draw one panel. `altered` false draws the original garden; true draws
 * the changed garden. `time` (seconds) drives the star twinkle.
 */
export function drawScene(ctx, altered, time = 0) {
  // Sky and ground.
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#141d3d');
  sky.addColorStop(1, '#2c3a68');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, 262);
  for (const s of STARS) {
    const a = 0.55 + 0.45 * Math.sin(time * 1.6 + s.tw);
    ctx.globalAlpha = a;
    circle(ctx, s.x, s.y, s.r, '#dfe8ff');
  }
  ctx.globalAlpha = 1;
  // The bright star that goes out in the altered panel.
  if (!altered) sparkle(ctx, 398, 54, 11, '#ffeeb0');
  // Hills.
  ctx.beginPath();
  ctx.moveTo(0, 262);
  ctx.quadraticCurveTo(120, 216, 250, 252);
  ctx.quadraticCurveTo(360, 278, 480, 246);
  ctx.lineTo(480, 300);
  ctx.lineTo(0, 300);
  ctx.closePath();
  ctx.fillStyle = '#24455c';
  ctx.fill();
  const grass = ctx.createLinearGradient(0, 250, 0, 400);
  grass.addColorStop(0, '#2c5c40');
  grass.addColorStop(1, '#1d4029');
  ctx.fillStyle = grass;
  ctx.fillRect(0, 292, SCENE_W, 108);
  ctx.beginPath();
  ctx.moveTo(0, 292);
  ctx.quadraticCurveTo(160, 278, 320, 290);
  ctx.quadraticCurveTo(420, 296, 480, 288);
  ctx.lineTo(480, 400);
  ctx.lineTo(0, 400);
  ctx.closePath();
  ctx.fillStyle = grass;
  ctx.fill();
  // Stone path from the bottom centre to the cottage.
  ctx.fillStyle = '#8d8fa3';
  const stones = [[228, 388, 30, 8], [234, 368, 24, 7], [226, 350, 19, 6], [238, 334, 15, 5]];
  for (const [x, y, rx, ry] of stones) ellipse(ctx, x, y, rx, ry, '#83859b');

  drawMoon(ctx, altered);
  drawTree(ctx, altered);
  drawCottage(ctx);
  drawLantern(ctx, altered);
  drawPond(ctx);
  drawTableAndTea(ctx, altered);
  drawTulips(ctx, altered);
  drawCat(ctx, altered);
  // Butterflies: two in the original, a third joins in the altered panel.
  const flap = time * 6;
  drawButterfly(ctx, 186, 118, '#b388e6', flap);
  drawButterfly(ctx, 330, 92, '#7fc7e8', flap + 2);
  if (altered) drawButterfly(ctx, 128, 84, '#f2a65e', flap + 4);
  // Fireflies.
  const flies = [[300, 300], [180, 210], [96, 250], [440, 300], [352, 330]];
  for (let i = 0; i < flies.length; i += 1) {
    const [x, y] = flies[i];
    const a = 0.35 + 0.3 * Math.sin(time * 2 + i * 1.7);
    ctx.globalAlpha = a;
    circle(ctx, x, y, 2.2, '#ffe98a');
  }
  ctx.globalAlpha = 1;
}

/** The gold ring that marks a found difference, drawn on both panels. */
export function drawMarker(ctx, diff, pulse = 0) {
  const r = diff.r + 4 + Math.sin(pulse) * 1.6;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r + 3.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(20,16,8,0.65)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
}
