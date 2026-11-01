// 2D drawings: floor plan and wall elevations (SVG), built from data.js.
import { ROOM, activePieces, options, ZONES, productByKey, FT } from './data.js';

const R = ROOM.size;
const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}, text) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text != null) e.textContent = text;
  return e;
}

// Model units -> feet and inches, to the nearest quarter inch (e.g. 3′ 11¼″).
const QUARTERS = ['', '¼', '½', '¾'];
export function feetInches(cm) {
  const q = Math.round((cm / 2.54) * 4);
  const ft = Math.floor(q / 48);
  const inch = Math.floor((q % 48) / 4);
  const frac = QUARTERS[q % 4];
  const inches = inch || frac ? `${inch || ''}${frac}″` : '';
  if (!ft) return inches || '0″';
  return inches ? `${ft}′ ${inches}` : `${ft}′ 0″`;
}

// ---------------------------------------------------------------- wall runs

// Furniture that stands on the floor against a wall, and pieces hung on it.
const FLOOR_KINDS = new Set(['besta', 'kallax', 'kallaxGrid', 'kdesk', 'billyfold', 'alex', 'top', 'floorlamp']);
const MOUNTED_KINDS = new Set(['skadis', 'shelf', 'ledge']);

// Merge overlapping spans (e.g. the KARLBY counter over its ALEX units).
function mergeSpans(spans) {
  const out = [];
  for (const s of [...spans].sort((a, b) => a.l - b.l)) {
    const last = out[out.length - 1];
    if (last && s.l < last.r - 0.5) {
      last.r = Math.max(last.r, s.r);
      if (!last.labels.includes(s.label)) last.labels.push(s.label);
    } else {
      out.push({ l: s.l, r: s.r, labels: [s.label] });
    }
  }
  return out;
}

// Splits 0..R into alternating gap / item segments.
function chain(spans) {
  const segs = [];
  let at = 0;
  for (const s of spans) {
    if (s.l - at > 0.6) segs.push({ l: at, r: s.l, gap: true });
    segs.push({ l: s.l, r: s.r, label: s.labels.join(' + ') });
    at = s.r;
  }
  if (R - at > 0.6) segs.push({ l: at, r: R, gap: true });
  return segs;
}

// What stands along a wall, measured from the left as you face it.
export function wallSummary(name) {
  const W = WALLS[name];
  const along = p => {
    const [l, r] = W.h(...W.span(p));
    return { l, r, label: shortLabel(p) || pieceLabel(p) };
  };
  const nearWall = activePieces().filter(p => W.depth(p) < 20);
  const floor = nearWall.filter(p => FLOOR_KINDS.has(p.kind));
  const mounted = nearWall.filter(p => MOUNTED_KINDS.has(p.kind));
  const floorSpans = mergeSpans(floor.map(along));
  const openings = [];
  if (name === 'north') openings.push({ ...spanOf(W, ROOM.window.x0, ROOM.window.x1), labels: ['Window'] });
  if (name === 'south') {
    openings.push({ ...spanOf(W, ROOM.entry.x0, ROOM.entry.x1), labels: ['Entry door'] });
    openings.push({ ...spanOf(W, ROOM.closet.x0, ROOM.closet.x1), labels: ['Closet doors'] });
    openings.sort((a, b) => a.l - b.l);
  }
  const used = floorSpans.reduce((t, s) => t + s.r - s.l, 0);
  const rows = [...floor, ...mounted].map(p => {
    const a = along(p);
    return { piece: p, name: pieceLabel(p), mounted: MOUNTED_KINDS.has(p.kind), from: a.l, len: a.r - a.l, height: p.y1 - p.y0, top: p.y1 };
  }).sort((a, b) => a.mounted - b.mounted || a.from - b.from);
  return { length: R, used, free: R - used, floorChain: chain(floorSpans), openingChain: openings.length ? chain(openings) : null, rows };
}

function spanOf(W, a, b) {
  const [l, r] = W.h(a, b);
  return { l, r };
}

// Draws a dimension chain. `pt(h, off)` maps a position along the wall and an
// offset from the line to SVG coordinates; `rot` turns the text for side walls.
function drawChain(svg, segs, pt, rot, cls) {
  const g = el('g', { class: `chain ${cls || ''}` });
  const [ax, ay] = pt(0, 0);
  const [bx, by] = pt(R, 0);
  g.append(el('line', { x1: ax, y1: ay, x2: bx, y2: by, class: 'chain-line' }));
  const ticks = new Set([0, R, ...segs.flatMap(s => [s.l, s.r])]);
  for (const t of ticks) {
    const [x1, y1] = pt(t, -4);
    const [x2, y2] = pt(t, 4);
    g.append(el('line', { x1, y1, x2, y2, class: 'chain-tick' }));
  }
  for (const s of segs) {
    const len = s.r - s.l;
    const text = feetInches(len);
    // skip text that can't fit; the table below the drawing lists every length
    if (len < text.length * 4.2) continue;
    const [x, y] = pt((s.l + s.r) / 2, -7);
    g.append(el('text', {
      x, y, class: s.gap ? 'chain-gap' : 'chain-item',
      transform: rot ? `rotate(${rot} ${x} ${y})` : '',
    }, text));
    if (!s.gap && s.label) g.lastChild.append(el('title', {}, `${s.label}: ${text}`));
  }
  svg.append(g);
}

function pieceLabel(p) {
  if (p.prop) return p.prop;
  const prod = productByKey[p.p];
  return prod ? prod.name.replace(/,.*$/, '') : p.id;
}

// Short label for drawings, e.g. "KALLAX", "SKÅDIS".
const shortLabel = p => (p.prop ? '' : pieceLabel(p).split(' ')[0]);

// Centred label that turns sideways when the box is too narrow for it.
function fitLabel(text, cx, cy, w, h) {
  const rotate = w < text.length * 5.6 && h > w;
  return el('text', { x: cx, y: cy, class: 'plan-label', transform: rotate ? `rotate(-90 ${cx} ${cy})` : '' }, text);
}

function zoneColor(p) {
  if (!p.p) return '#9aa0a6';
  return ZONES[productByKey[p.p].zone].color;
}

// Which pieces to draw in plan (skip small decorative bits)
const PLAN_SKIP = new Set(['pillow', 'curtain', 'rod', 'tertial', 'machine', 'ledge', 'skadis', 'shelf', 'cushion', 'blind']);

export function floorPlan(onSelect) {
  const pad = 92;
  const svg = el('svg', { viewBox: `${-pad} ${-pad} ${R + pad * 2} ${R + pad * 2}`, class: 'drawing plan' });

  // 1 ft grid
  for (let i = 1; i < 11; i++) {
    svg.append(el('line', { x1: i * FT, y1: 0, x2: i * FT, y2: R, class: 'grid' }));
    svg.append(el('line', { x1: 0, y1: i * FT, x2: R, y2: i * FT, class: 'grid' }));
  }

  // Pieces (rug first so it sits under everything)
  // Draw the rug first and counters under the drawer units they sit on, so
  // every piece stays clickable.
  const layer = p => (p.kind === 'rug' ? 0 : p.kind === 'top' ? 1 : 2);
  const sorted = activePieces().filter(p => !PLAN_SKIP.has(p.kind)).sort((a, b) => layer(a) - layer(b));
  for (const p of sorted) {
    const g = el('g', { class: 'piece', 'data-id': p.id });
    const c = zoneColor(p);
    g.append(el('rect', {
      x: p.x0, y: p.z0, width: p.x1 - p.x0, height: p.z1 - p.z0,
      fill: c, 'fill-opacity': p.kind === 'rug' ? 0.12 : 0.35, stroke: c, 'stroke-width': 1.5,
      'stroke-dasharray': p.kind === 'rug' ? '6 4' : '',
    }));
    if (!['rug', 'besta', 'floorlamp'].includes(p.kind)) {
      g.append(fitLabel(shortLabel(p), (p.x0 + p.x1) / 2, (p.z0 + p.z1) / 2, p.x1 - p.x0, p.z1 - p.z0));
    }
    g.append(el('title', {}, pieceLabel(p)));
    g.addEventListener('click', () => onSelect(p));
    svg.append(g);
  }
  if (options.plan === 'a') {
    // window-seat label once, across both cushions
    svg.append(el('text', { x: 167.5, y: 20, class: 'plan-label' }, 'Window seat · 2× BESTÅ'));
    svg.append(el('text', { x: 312, y: 23, class: 'plan-label' }, 'lamp'));
  }

  // Walls
  const wt = 10;
  const { window: win, closet, entry } = ROOM;
  const wall = (x, y, w, h) => svg.append(el('rect', { x, y, width: w, height: h, class: 'wall' }));
  wall(-wt, -wt, win.x0 + wt, wt);
  wall(win.x1, -wt, R - win.x1 + wt, wt);
  wall(-wt, 0, wt, R);
  wall(R, 0, wt, R);
  wall(-wt, R, closet.x0 + wt, wt);
  wall(closet.x1, R, entry.x0 - closet.x1, wt);
  wall(entry.x1, R, R - entry.x1 + wt, wt);

  // Window
  svg.append(el('rect', { x: win.x0, y: -wt, width: win.x1 - win.x0, height: wt, class: 'window' }));
  svg.append(el('line', { x1: win.x0, y1: -wt / 2, x2: win.x1, y2: -wt / 2, class: 'window-line' }));

  // Door swings
  const leaf = (closet.x1 - closet.x0) / 2;
  const swing = (hx, hy, len, dir) => {
    // dir: +1 opens toward +x from hinge, -1 toward -x
    const ex = hx + dir * len;
    svg.append(el('line', { x1: hx, y1: hy, x2: hx, y2: hy - len, class: 'door' }));
    svg.append(el('path', { d: `M ${hx} ${hy - len} A ${len} ${len} 0 0 ${dir > 0 ? 1 : 0} ${ex} ${hy}`, class: 'swing' }));
  };
  swing(closet.x0, R, leaf, 1);
  swing(closet.x1, R, leaf, -1);
  swing(entry.hingeX, R, entry.x1 - entry.x0, -1);

  // How much of each wall the furniture takes up, measured outside the wall.
  const base = wt + 14;
  const SIDES = {
    north: { at: h => [h, 0], n: [0, -1], rot: 0 },
    east: { at: h => [R, h], n: [1, 0], rot: 90 },
    south: { at: h => [R - h, R], n: [0, 1], rot: 0 },
    west: { at: h => [0, R - h], n: [-1, 0], rot: -90 },
  };
  for (const [name, side] of Object.entries(SIDES)) {
    const pt = (h, off) => {
      const [x, y] = side.at(h);
      return [x + side.n[0] * (base - off), y + side.n[1] * (base - off)];
    };
    const { floorChain, openingChain } = wallSummary(name);
    const segs = floorChain.some(s => !s.gap) ? floorChain : openingChain;
    if (segs) drawChain(svg, segs, pt, side.rot);
  }

  // Labels & dimensions
  const nameOff = wt + 52;
  svg.append(el('text', { x: R / 2, y: -nameOff, class: 'wall-name' }, 'NORTH — window'));
  svg.append(el('text', { x: R / 2, y: R + nameOff + 6, class: 'wall-name' }, 'SOUTH — closet & entry'));
  svg.append(el('text', { x: -nameOff, y: R / 2, class: 'wall-name', transform: `rotate(-90 ${-nameOff} ${R / 2})` }, 'WEST — supply wall'));
  svg.append(el('text', { x: R + nameOff, y: R / 2, class: 'wall-name', transform: `rotate(90 ${R + nameOff} ${R / 2})` }, 'EAST — machine station'));
  svg.append(el('text', { x: closet.x0 + leaf, y: R - 30, class: 'plan-note' }, 'closet'));
  svg.append(el('text', { x: entry.x0 + 40, y: R - 20, class: 'plan-note' }, 'entry'));
  svg.append(el('text', { x: R / 2, y: -nameOff - 18, class: 'dim' }, `11′ 0″ × 11′ 0″  · 1 square = 1 ft · measurements along each wall show the furniture against it`));

  return svg;
}

// Elevation for one wall, as seen standing in the room facing it.
// `h(a, b)` maps a span along the wall to positions from the viewer's left;
// `depth` is how far a piece stands off the wall.
const WALLS = {
  north: { title: 'North wall — window seat', h: (x0, x1) => [x0, x1], span: p => [p.x0, p.x1], depth: p => p.z0 },
  east: { title: 'East wall — machine embroidery station', h: (a, b) => [a, b], span: p => [p.z0, p.z1], depth: p => R - p.x1 },
  south: { title: 'South wall — closet & entry', h: (a, b) => [R - b, R - a], span: p => [p.x0, p.x1], depth: p => R - p.z1 },
  west: { title: 'West wall — beading, jewelry & art supplies', h: (a, b) => [R - b, R - a], span: p => [p.z0, p.z1], depth: p => p.x0 },
};

const ELEV_SKIP = new Set(['rug', 'chair', 'officechair', 'norden', 'cart']);

export function elevation(name, onSelect) {
  const W = WALLS[name];
  const H = ROOM.height;
  const pad = 40;
  const summary = wallSummary(name);
  const hasFurniture = summary.floorChain.some(s => !s.gap);
  const rows = [
    summary.openingChain && ['Openings', summary.openingChain],
    hasFurniture && ['Furniture', summary.floorChain],
    ['Wall', [{ l: 0, r: R, gap: false }]],
  ].filter(Boolean);
  const below = 16 + rows.length * 20;
  const svg = el('svg', { viewBox: `${-pad - 30} ${-pad} ${R + pad * 2 + 30} ${H + pad + below}`, class: 'drawing elev' });
  const Y = y => H - y;

  svg.append(el('rect', { x: 0, y: 0, width: R, height: H, class: 'elev-wall' }));
  svg.append(el('line', { x1: 0, y1: H, x2: R, y2: H, class: 'floor-line' }));

  // openings
  const opening = (a, b, y0, y1, cls) => {
    const [l, r] = W.h(a, b);
    svg.append(el('rect', { x: l, y: Y(y1), width: r - l, height: y1 - y0, class: cls }));
  };
  if (name === 'north') {
    opening(ROOM.window.x0, ROOM.window.x1, ROOM.window.sill, ROOM.window.head, 'elev-window');
    const m = (ROOM.window.x0 + ROOM.window.x1) / 2;
    svg.append(el('line', { x1: m, y1: Y(ROOM.window.sill), x2: m, y2: Y(ROOM.window.head), class: 'elev-mullion' }));
  }
  if (name === 'south') {
    const { closet, entry } = ROOM;
    opening(closet.x0, (closet.x0 + closet.x1) / 2, 0, closet.head, 'elev-door');
    opening((closet.x0 + closet.x1) / 2, closet.x1, 0, closet.head, 'elev-door');
    opening(entry.x0, entry.x1, 0, entry.head, 'elev-opening');
    const [sl] = W.h(ROOM.switchX - 4, ROOM.switchX + 4);
    svg.append(el('rect', { x: sl, y: Y(127), width: 8, height: 12, class: 'elev-switch' }));
  }

  const items = activePieces().filter(p => W.depth(p) < 20 && !ELEV_SKIP.has(p.kind))
    .sort((a, b) => W.depth(b) - W.depth(a)); // far first, near last
  for (const p of items) {
    const [a, b] = W.span(p);
    const [l, r] = W.h(a, b);
    const c = zoneColor(p);
    const g = el('g', { class: 'piece', 'data-id': p.id });
    g.append(el('rect', {
      x: l, y: Y(p.y1), width: r - l, height: Math.max(p.y1 - p.y0, 1.5),
      fill: c, 'fill-opacity': ['curtain', 'blind'].includes(p.kind) ? 0.15 : p.prop ? 0.1 : 0.35, stroke: c, 'stroke-width': 1.2,
      'stroke-dasharray': p.prop ? '4 3' : '',
    }));
    if (p.drawers) {
      const dh = (p.y1 - p.y0) / p.drawers;
      for (let i = 1; i < p.drawers; i++) g.append(el('line', { x1: l, x2: r, y1: Y(p.y0 + i * dh), y2: Y(p.y0 + i * dh), stroke: c }));
    }
    if (p.kind === 'kallax') {
      for (let i = 1; i < 4; i++) {
        g.append(el('line', { x1: l + ((r - l) * i) / 4, x2: l + ((r - l) * i) / 4, y1: Y(p.y1), y2: Y(p.y0), stroke: c }));
        g.append(el('line', { x1: l, x2: r, y1: Y(p.y0 + ((p.y1 - p.y0) * i) / 4), y2: Y(p.y0 + ((p.y1 - p.y0) * i) / 4), stroke: c }));
      }
    }
    if (p.kind === 'kallaxGrid') {
      // cube grid as seen from the front (or the side, on a neighbouring wall)
      const facing = { north: 's', south: 'n', east: 'w', west: 'e' }[name] === p.face;
      const cols = facing ? p.cols : 1;
      for (let i = 1; i < cols; i++) g.append(el('line', { x1: l + ((r - l) * i) / cols, x2: l + ((r - l) * i) / cols, y1: Y(p.y1), y2: Y(p.y0), stroke: c }));
      for (let i = 1; i < p.rows; i++) {
        const y = Y(p.y0 + ((p.y1 - p.y0) * i) / p.rows);
        g.append(el('line', { x1: l, x2: r, y1: y, y2: y, stroke: c }));
      }
    }
    if (p.kind === 'billyfold') g.append(el('line', { x1: l, x2: r, y1: Y(p.tableY), y2: Y(p.tableY), stroke: c, 'stroke-width': 2 }));
    if (p.kind === 'besta') g.append(el('line', { x1: (l + r) / 2, x2: (l + r) / 2, y1: Y(p.y1), y2: Y(p.y0), stroke: c }));
    if (['shelf', 'ledge', 'top'].includes(p.kind)) {
      g.append(el('text', { x: (l + r) / 2, y: Y(p.y1) - 6, class: 'plan-label' }, shortLabel(p)));
    } else if (p.y1 - p.y0 > 12 && !['cushion', 'curtain', 'pillow', 'machine', 'tertial'].includes(p.kind)) {
      g.append(fitLabel(shortLabel(p), (l + r) / 2, Y((p.y0 + p.y1) / 2), r - l, p.y1 - p.y0));
    }
    g.append(el('title', {}, `${pieceLabel(p)} — ${feetInches(p.y1 - p.y0)} tall, top at ${feetInches(p.y1)}`));
    g.addEventListener('click', () => onSelect(p));
    svg.append(g);
  }

  // height marks
  for (const y of [46, 74, 147]) {
    if ((y === 147 && name !== 'west') || (y === 46 && name !== 'north') || (y === 74 && name !== 'east')) continue;
    svg.append(el('line', { x1: -12, x2: 0, y1: Y(y), y2: Y(y), class: 'dim-line' }));
    svg.append(el('text', { x: -16, y: Y(y) + 3, class: 'dim dim-left' }, feetInches(y)));
  }
  // Dimension chains along the wall: openings, furniture, then the whole wall.
  rows.forEach(([label, segs], i) => {
    const y = H + 24 + i * 20;
    drawChain(svg, segs, (h, off) => [h, y + off], 0, label === 'Wall' ? 'chain-total' : '');
    svg.append(el('text', { x: -8, y, class: 'chain-row' }, label));
  });
  svg.append(el('text', { x: 0, y: -14, class: 'dim dim-start' }, W.title));
  return svg;
}

export const WALL_NAMES = Object.keys(WALLS);
