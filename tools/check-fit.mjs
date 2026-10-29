// Checks that every piece in each plan fits the room:
//   node tools/check-fit.mjs
// Reports pieces outside the room, pieces that collide, anything in a door's
// swing, and tall pieces that cover window glass. Exits 1 on any problem.
import { ROOM, PIECES, PLANS, options, activePieces } from '../js/data.js';
import { feetInches } from '../js/drawings.js';

const R = ROOM.size;
const { window: win, closet, entry } = ROOM;

// Things that sit on or hang from something else, or lie flat.
const RIDERS = new Set(['rug', 'cushion', 'pillow', 'machine', 'tertial', 'blind', 'curtain', 'rod']);

const overlap1 = (a0, a1, b0, b1) => Math.min(a1, b1) - Math.max(a0, b0);
const boxesOverlap = (a, b) => overlap1(a.x0, a.x1, b.x0, b.x1) > 0.5 && overlap1(a.z0, a.z1, b.z0, b.z1) > 0.5 && overlap1(a.y0, a.y1, b.y0, b.y1) > 0.5;

// Does a footprint rectangle reach into a quarter circle swing?
function inSwing(p, cx, cz, r, xDir) {
  const x0 = xDir > 0 ? cx : cx - r;
  const x1 = xDir > 0 ? cx + r : cx;
  const nx = Math.min(Math.max(cx, p.x0), p.x1);
  const nz = Math.min(Math.max(cz, p.z0), p.z1);
  const inQuadrant = p.x1 > x0 + 0.5 && p.x0 < x1 - 0.5 && p.z1 > cz - r + 0.5;
  return inQuadrant && Math.hypot(nx - cx, nz - cz) < r - 0.5;
}

const leaf = (closet.x1 - closet.x0) / 2;
const SWINGS = [
  ['left closet door', closet.x0, R, leaf, 1],
  ['right closet door', closet.x1, R, leaf, -1],
  ['entry door', entry.hingeX, R, entry.x1 - entry.x0, -1],
];

const name = p => p.prop || `${p.p} (${p.id})`;
let problems = 0;

for (const plan of Object.keys(PLANS)) {
  options.plan = plan;
  const pieces = activePieces();
  const out = [];
  for (const p of pieces) {
    if (p.kind !== 'blind' && (p.x0 < -0.5 || p.z0 < -0.5 || p.x1 > R + 0.5 || p.z1 > R + 0.5 || p.y1 > ROOM.height)) {
      out.push(`outside the room: ${name(p)}`);
    }
    if (RIDERS.has(p.kind)) continue;
    for (const [label, cx, cz, r, dir] of SWINGS) {
      if (p.y0 < 200 && inSwing(p, cx, cz, r, dir)) out.push(`in the ${label}'s swing: ${name(p)}`);
    }
    // tall furniture in front of the window glass
    if (p.z0 < 45 && p.y1 > win.sill && overlap1(p.x0, p.x1, win.x0, win.x1) > 0.5 && !['curtain', 'rod'].includes(p.kind)) {
      out.push(`covers ${feetInches(overlap1(p.x0, p.x1, win.x0, win.x1))} of window glass: ${name(p)}`);
    }
  }
  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      const a = pieces[i];
      const b = pieces[j];
      if (RIDERS.has(a.kind) || RIDERS.has(b.kind)) continue;
      const pair = [a.kind, b.kind].sort().join('+');
      if (pair === 'alex+top') continue; // counter sits on its drawer units
      if (boxesOverlap(a, b)) out.push(`collide: ${name(a)} and ${name(b)}`);
    }
  }
  console.log(`${PLANS[plan].name}: ${pieces.length} pieces – ${out.length ? `${out.length} problem(s)` : 'everything fits'}`);
  for (const line of out) console.log(`  ✗ ${line}`);
  problems += out.length;
}
process.exit(problems ? 1 : 0);
