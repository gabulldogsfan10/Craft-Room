// U-shaped desk hack: three options drawn in 3D and as a top-view plan.
// Positions are in inches here (x east from the west wall, z south from the
// window wall) and converted to the planner's model units for the 3D builders.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BUILDERS, COLORS, box, cyl, mat } from './scene.js';

const IN = 2.54;
const ROOM_IN = 132; // 11 ft
const WALL_H = 96; // 8 ft
const WINDOW = { x0: 35, x1: 35 + 69.5, sill: 27.5, head: 84.5 }; // starts 35″ from the corner, as measured
const CLOSET = { hinge: 9.75, leaf: 30.5 }; // left closet door, hinged 9¾″ from the west wall
const DEPTH = 25.625; // countertop depth
const ALEX = { w: 14.125, d: 22.875, h: 27.5 };

const U = 'https://www.ikea.com/us/en/p/';
const LINKS = {
  karlby: { name: 'KARLBY countertop, oak veneer', url: `${U}karlby-countertop-oak-veneer-70335207/`, size: '74″ × 25⅝″ × 1½″', price: 199 },
  saljan: { name: 'SÄLJAN countertop, oak-effect laminate', url: `${U}saeljan-countertop-oak-effect-laminate-80439214/`, size: '74″ × 25⅝″ × 1½″', price: 129 },
  ekbacken: { name: 'EKBACKEN countertop, ash-effect laminate', url: `${U}ekbacken-countertop-ash-effect-laminate-30337623/`, size: '74″ long, 1⅛″ thick', price: 63.99 },
  alex: { name: 'ALEX drawer unit, white', url: `${U}alex-drawer-unit-white-00473546/`, size: '14⅛″ × 22⅞″ × 27½″', price: 95 },
  olov: { name: 'OLOV leg, adjustable, white', url: `${U}olov-leg-adjustable-white-10264302/`, size: '23⅝–35⅜″ tall', price: 12.5 },
  norden: { name: 'NORDEN gateleg table, white', url: `${U}norden-gateleg-table-white-10423886/`, size: '10¼ / 35 / 59⅞″ × 31½″', price: null },
  caster: { name: 'ALEX caster, black (4-pack)', url: `${U}alex-caster-black-10480607/`, size: '2″ wheels, adds 2¾″, 44 lb each, no brakes', price: 10 },
};

const TOPS = {
  karlby: { color: '#c9a77c', thick: 1.5 },
  saljan: { color: '#d3b48b', thick: 1.5 },
  ekbacken: { color: '#e4d6bc', thick: 1.125 },
};

// The U: window arm, main desk along the west wall, and a return arm.
function layout(top, returnArm) {
  const t = TOPS[top];
  const deskTop = ALEX.h + t.thick;
  const tops = [
    { label: 'Window arm', len: 35, x0: 0, x1: 35, z0: 0, z1: DEPTH },
    { label: 'Main desk', len: 74, x0: 0, x1: DEPTH, z0: DEPTH, z1: DEPTH + 74 },
  ];
  const end = DEPTH + 74; // 99⅝″ from the window wall
  const alex = [
    { x0: 0, x1: ALEX.w, z0: 0, z1: ALEX.d, face: 's' },
    { x0: 0, x1: ALEX.d, z0: end - ALEX.w, z1: end, face: 'e' },
  ];
  const legs = [[33, 23.5], [DEPTH - 1.5, DEPTH + 2]];
  let norden = null;
  let shelf = null;
  if (returnArm === 'offcut') {
    tops.push({ label: 'Return arm', len: 38.875, x0: DEPTH, x1: DEPTH + 38.875, z0: end - DEPTH, z1: end });
    alex.push({ x0: DEPTH + 38.875 - ALEX.w, x1: DEPTH + 38.875, z0: end - ALEX.d, z1: end, face: 'n' });
  } else {
    // NORDEN: drawer section out in the room, west leaf up to meet the desk
    norden = { cx: DEPTH + 24.75 + 5.125, cz: end - 15.75 };
    shelf = { x0: 0, x1: 10, z0: DEPTH + 20, z1: DEPTH + 20 + 38.875, y: 52 };
  }
  return { top, deskTop, tops, alex, legs, norden, shelf, end };
}

export const OPTIONS = [
  {
    id: 'oak', title: 'Option 1 · Oak countertop U', tag: 'Best look',
    blurb: 'Two KARLBY oak countertops: one whole for the main desk, the other cut into the 35″ window arm and a 38⅞″ return arm. Three ALEX drawer units and two OLOV legs hold it up at about 29″.',
    plan: layout('karlby', 'offcut'),
    parts: [[2, 'karlby'], [3, 'alex'], [2, 'olov']],
  },
  {
    id: 'laminate', title: 'Option 2 · Laminate countertop U', tag: 'Lower cost',
    blurb: 'The same U with laminate tops. Shown in SÄLJAN oak effect; EKBACKEN ash effect is cheaper still and 1⅛″ thick, so the desk sits at about 28⅝″. Cut laminate edges need iron-on edge banding.',
    plan: layout('saljan', 'offcut'),
    parts: [[2, 'saljan'], [3, 'alex'], [2, 'olov']],
    alt: [2, 'ekbacken'],
  },
  {
    id: 'norden', title: 'Option 3 · NORDEN folding return', tag: 'Folds away',
    blurb: 'The window arm and main desk as in Option 1, with the NORDEN gateleg table as the third side, on ALEX casters so it rolls out of the way. The casters lift it 2¾″, so its top sits at about 31⅞″, just above the 29″ desk – push it against the desk end rather than under it. A 2¾″ block under each gateleg foot lets the leaves reach the floor and stops the table rolling while a leaf is up. Raise the far leaf too for cutting fabric. The 38⅞″ KARLBY offcut, ripped to 10″ deep, becomes a shelf above the desk.',
    plan: layout('karlby', 'norden'),
    parts: [[2, 'karlby'], [2, 'alex'], [2, 'olov'], [1, 'norden'], [1, 'caster']],
  },
];

export const partsCost = o => o.parts.reduce((t, [q, k]) => t + (LINKS[k].price ? q * LINKS[k].price : 0), 0);
export { LINKS };

// ------------------------------------------------------------------ 3D

function buildScene(plan) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#ece7ee');
  const g = new THREE.Group();
  scene.add(g);
  const c = v => v * IN;
  const span = 110; // show the room's north-west corner area
  const wallMat = mat('#5a3a68', { roughness: 0.9 });
  const trim = mat(COLORS.trim);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(c(span + 20), c(ROOM_IN)), mat('#5a524b', { roughness: 0.8 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(c((span + 20) / 2), 0, c(ROOM_IN / 2));
  floor.receiveShadow = true;
  g.add(floor);
  // west wall and north wall with the window opening
  g.add(box(-c(1), 0, 0, 0, c(WALL_H), c(ROOM_IN), wallMat));
  g.add(box(0, 0, -c(1), c(WINDOW.x0), c(WALL_H), 0, wallMat));
  g.add(box(c(WINDOW.x0), 0, -c(1), c(WINDOW.x1), c(WINDOW.sill), 0, wallMat));
  g.add(box(c(WINDOW.x0), c(WINDOW.head), -c(1), c(WINDOW.x1), c(WALL_H), 0, wallMat));
  g.add(box(c(WINDOW.x1), 0, -c(1), c(span + 20), c(WALL_H), 0, wallMat));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(c(WINDOW.x1 - WINDOW.x0), c(WINDOW.head - WINDOW.sill)),
    new THREE.MeshBasicMaterial({ color: '#cfe3ef' }));
  glass.position.set(c((WINDOW.x0 + WINDOW.x1) / 2), c((WINDOW.sill + WINDOW.head) / 2), -c(0.9));
  g.add(glass);
  g.add(box(c(WINDOW.x0 - 2.75), c(WINDOW.sill - 1.5), 0, c(WINDOW.x0), c(WINDOW.head), c(0.8), trim));
  g.add(box(c(WINDOW.x0 - 2.75), c(WINDOW.sill - 1.5), 0, c(WINDOW.x1 + 2.75), c(WINDOW.sill), c(2.4), trim));

  // closet door swing on the floor + the line the desk must stop at
  const swing = new THREE.Mesh(new THREE.RingGeometry(c(CLOSET.leaf - 0.6), c(CLOSET.leaf), 48, 1, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: '#e0a03c', side: THREE.DoubleSide }));
  swing.rotation.x = -Math.PI / 2;
  swing.position.set(c(CLOSET.hinge), c(0.1), c(ROOM_IN));
  g.add(swing);
  g.add(box(c(CLOSET.hinge - 0.6), 0, c(ROOM_IN - CLOSET.leaf), c(CLOSET.hinge), c(80), c(ROOM_IN), mat('#f6f5f1')));

  const t = TOPS[plan.top];
  const topMat = mat(t.color, { roughness: 0.6 });
  for (const s of plan.tops) g.add(box(c(s.x0), c(ALEX.h), c(s.z0), c(s.x1), c(plan.deskTop), c(s.z1), topMat));
  for (const a of plan.alex) {
    BUILDERS.alex({ x0: c(a.x0), x1: c(a.x1), z0: c(a.z0), z1: c(a.z1), y0: 0, y1: c(ALEX.h), drawers: 5, face: a.face }, g);
  }
  const legMat = mat('#f2f2ef', { metalness: 0.3, roughness: 0.4 });
  for (const [x, z] of plan.legs) g.add(cyl(c(x), 0, c(z), c(0.8), c(ALEX.h), legMat));
  if (plan.norden) {
    BUILDERS.norden({
      cx: c(plan.norden.cx), cz: c(plan.norden.cz), y0: 0, y1: 81, casters: 7,
      local: { x0: -13 - 63, x1: 13, z0: -40, z1: 40, midX0: -13, midX1: 13 },
      leaves: { w: true, e: false }, turned: false,
    }, g);
  }
  if (plan.shelf) {
    const s = plan.shelf;
    g.add(box(c(s.x0), c(s.y), c(s.z0), c(s.x1), c(s.y + 1.5), c(s.z1), topMat));
  }
  // the Brother SE2000 on the main desk, facing into the U
  const m = new THREE.Group();
  BUILDERS.machine({ x0: -12, x1: 12, z0: -22, z1: 22.6, y0: 0, y1: 30, embroidery: true }, m);
  m.rotation.y = Math.PI;
  m.position.set(c(12), c(plan.deskTop), c(DEPTH + 30));
  g.add(m);

  scene.add(new THREE.HemisphereLight('#fffaf2', '#5a4d55', 1.3));
  const sun = new THREE.DirectionalLight('#fff3e0', 2);
  sun.position.set(c(140), c(220), c(-120));
  sun.target.position.set(c(40), 0, c(60));
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -400, right: 400, top: 400, bottom: -400, near: 10, far: 1500 });
  scene.add(sun, sun.target);
  g.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return scene;
}

export function mount3D(canvas, plan) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = buildScene(plan);
  const camera = new THREE.PerspectiveCamera(42, 1, 1, 4000);
  camera.position.set(125 * IN, 110 * IN, 150 * IN);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(32 * IN, 18 * IN, 52 * IN);
  Object.assign(controls, { enableDamping: true, maxPolarAngle: Math.PI / 2 - 0.05, minDistance: 80, maxDistance: 900, zoomToCursor: true });
  controls.update();
  let visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  const loop = () => {
    requestAnimationFrame(loop);
    if (!visible) return;
    const { clientWidth: w, clientHeight: h } = canvas;
    if (canvas.width !== Math.floor(w * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    controls.update();
    renderer.render(scene, camera);
  };
  loop();
}

// ------------------------------------------------------------------ plan

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs, text) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
  if (text != null) e.textContent = text;
  return e;
};
const frac = n => {
  const q = Math.round(n * 8) / 8;
  const whole = Math.floor(q);
  const rest = { 0: '', 0.125: '⅛', 0.25: '¼', 0.375: '⅜', 0.5: '½', 0.625: '⅝', 0.75: '¾', 0.875: '⅞' }[q - whole];
  return `${whole || ''}${rest}″`;
};

export function planSvg(plan) {
  const W = 120;
  const H = ROOM_IN;
  const svg = el('svg', { viewBox: `-16 -14 ${W + 26} ${H + 26}`, class: 'udesk-plan', role: 'img', 'aria-label': 'Top view of the U-shaped desk' });
  // grid every foot
  for (let i = 12; i < W; i += 12) svg.append(el('line', { x1: i, y1: 0, x2: i, y2: H, class: 'u-grid' }));
  for (let i = 12; i < H; i += 12) svg.append(el('line', { x1: 0, y1: i, x2: W, y2: i, class: 'u-grid' }));
  // walls, window, closet swing
  svg.append(el('rect', { x: -3, y: -3, width: 3, height: H + 3, class: 'u-wall' }));
  svg.append(el('rect', { x: 0, y: -3, width: WINDOW.x0, height: 3, class: 'u-wall' }));
  svg.append(el('rect', { x: WINDOW.x0, y: -3, width: Math.min(WINDOW.x1, W) - WINDOW.x0, height: 3, class: 'u-window' }));
  svg.append(el('rect', { x: 0, y: H, width: CLOSET.hinge, height: 3, class: 'u-wall' }));
  const hx = CLOSET.hinge;
  svg.append(el('path', { d: `M ${hx} ${H - CLOSET.leaf} A ${CLOSET.leaf} ${CLOSET.leaf} 0 0 1 ${hx + CLOSET.leaf} ${H}`, class: 'u-swing' }));
  svg.append(el('line', { x1: hx, y1: H, x2: hx, y2: H - CLOSET.leaf, class: 'u-door' }));
  svg.append(el('text', { x: hx + 12, y: H - 4, class: 'u-note' }, 'closet door swing'));
  // ALEX units and legs (under the tops)
  for (const a of plan.alex) svg.append(el('rect', { x: a.x0, y: a.z0, width: a.x1 - a.x0, height: a.z1 - a.z0, class: 'u-alex' }));
  // tops
  for (const s of plan.tops) {
    svg.append(el('rect', { x: s.x0, y: s.z0, width: s.x1 - s.x0, height: s.z1 - s.z0, class: `u-top u-top-${plan.top}` }));
  }
  for (const [x, z] of plan.legs) svg.append(el('circle', { cx: x, cy: z, r: 0.9, class: 'u-leg' }));
  if (plan.norden) {
    const n = plan.norden;
    svg.append(el('rect', { x: n.cx - 5.125 - 24.75, y: n.cz - 15.75, width: 24.75 + 10.25, height: 31.5, class: 'u-norden' }));
    svg.append(el('rect', { x: n.cx + 5.125, y: n.cz - 15.75, width: 24.75, height: 31.5, class: 'u-norden-leaf' }));
    svg.append(el('text', { x: n.cx - 8, y: n.cz + 1, class: 'u-label' }, 'NORDEN'));
    svg.append(el('text', { x: n.cx + 17.5, y: n.cz + 1, class: 'u-note' }, 'leaf (opt.)'));
  }
  if (plan.shelf) {
    const s = plan.shelf;
    svg.append(el('rect', { x: s.x0, y: s.z0, width: s.x1 - s.x0, height: s.z1 - s.z0, class: 'u-shelf' }));
  }
  // labels and dimensions
  for (const s of plan.tops) {
    const cx = (s.x0 + s.x1) / 2;
    const cy = (s.z0 + s.z1) / 2;
    const vertical = s.z1 - s.z0 > s.x1 - s.x0;
    svg.append(el('text', { x: cx, y: cy, class: 'u-label', transform: vertical ? `rotate(-90 ${cx} ${cy})` : '' }, `${s.label} · ${frac(s.len)}`));
  }
  const dim = (x1, y1, x2, y2, text, off) => {
    svg.append(el('line', { x1, y1, x2, y2, class: 'u-dim' }));
    svg.append(el('text', { x: (x1 + x2) / 2 + (off?.[0] || 0), y: (y1 + y2) / 2 + (off?.[1] || 0), class: 'u-dimtext' }, text));
  };
  dim(0, -8, WINDOW.x0, -8, '35″ to window', [0, -1.5]);
  dim(-9, 0, -9, plan.end, frac(plan.end), [-2, 0]);
  dim(-9, plan.end, -9, H, frac(H - plan.end), [-2, 0]);
  const open = plan.norden ? plan.norden.cz - 15.75 : plan.end - DEPTH;
  dim(DEPTH + 6, DEPTH, DEPTH + 6, open, `${frac(open - DEPTH)} between arms`, [11, 0]);
  svg.append(el('text', { x: W / 2 + 10, y: -10, class: 'u-note' }, 'window'));
  svg.append(el('text', { x: 4, y: H + 9, class: 'u-note' }, 'Top edge: window wall · left edge: west wall · grid: 1 ft'));
  return svg;
}
