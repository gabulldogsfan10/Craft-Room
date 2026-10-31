// Checks that every piece in each plan fits the room:
//   node tools/check-fit.mjs
// Reports pieces outside the room, pieces that collide, anything in a door's
// swing, tall pieces that cover window glass, machines that hang off their
// table, and shopping-list quantities that don't match what the pieces use.
// Exits 1 on any problem.
// Folding tables are checked as they start; each other fold position is
// listed with what it would bump into, as a note.
import { ROOM, PLANS, FOLD_STATES, options, activePieces, activeProducts, accessoriesOf } from '../js/data.js';
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
  // machines must sit fully on a work surface at their height (embroidery
  // unit and hoop included)
  const surfaces = pieces.flatMap(p => {
    if (p.kind === 'top' || p.kind === 'kdesk') return [{ ...p, y: p.y1 }];
    if (p.kind === 'billyfold' && p.tableOpen !== false) {
      const t = { ...p, y: p.tableY };
      if (p.face === 'w') t.x1 = p.x1 - p.caseDepth;
      else if (p.face === 'e') t.x0 = p.x0 + p.caseDepth;
      return [t];
    }
    return [];
  });
  for (const m of pieces.filter(p => p.kind === 'machine')) {
    const f = m.embroidery ? { x0: m.x0 - 10, x1: m.x1, z0: m.z0 - 24, z1: m.z1 } : m;
    const ok = surfaces.some(s => Math.abs(s.y - m.y0) < 1.5 && f.x0 >= s.x0 - 0.5 && f.x1 <= s.x1 + 0.5 && f.z0 >= s.z0 - 0.5 && f.z1 <= s.z1 + 0.5);
    if (!ok) out.push(`hangs off its table: ${name(m)}`);
  }
  // every placed piece and accessory adds up to the shopping-list quantity
  const used = new Map();
  const use = (key, n) => used.set(key, (used.get(key) || 0) + n);
  for (const p of pieces) {
    if (p.p) use(p.p, p.share ?? 1);
    for (const i of accessoriesOf(p).items) if (!i.onTop) use(i.key, i.qty);
  }
  for (const prod of activeProducts()) {
    const n = used.get(prod.key) || 0;
    if (n && n !== prod.qty) out.push(`${prod.name} (${prod.key}): the list says ${prod.qty}, the pieces use ${n}`);
  }
  // other fold positions of each folding table
  const notes = [];
  for (const table of pieces.filter(p => p.fold)) {
    for (const [state, label] of FOLD_STATES[table.fold]) {
      if (state === table.foldState) continue;
      options.fold = { [table.id]: state };
      const now = activePieces();
      const t = now.find(p => p.id === table.id);
      const hits = now.filter(o => o !== t && !RIDERS.has(o.kind) && boxesOverlap(t, o)).map(name);
      for (const [door, cx, cz, r, dir] of SWINGS) if (inSwing(t, cx, cz, r, dir)) hits.push(`the ${door}'s swing`);
      notes.push(`${t.p} "${label}": ${hits.length ? `move ${hits.join(', ')} first` : 'fits as is'}`);
      options.fold = {};
    }
  }
  console.log(`${PLANS[plan].name}: ${pieces.length} pieces – ${out.length ? `${out.length} problem(s)` : 'everything fits'}`);
  for (const line of out) console.log(`  ✗ ${line}`);
  for (const line of notes) console.log(`  · ${line}`);
  problems += out.length;
}
process.exit(problems ? 1 : 0);
