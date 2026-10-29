// Studio renders of each product, drawn from the same models as the room.
// Used as the item picture on product cards and in the shopping list.
import * as THREE from 'three';
import { BUILDERS, COLORS, box, cyl, mat } from './scene.js';

// A piece spec at the origin: w along x, d along z, h tall.
const P = (kind, w, d, h, extra = {}) => ({ id: `pv-${kind}`, kind, x0: 0, z0: 0, x1: w, z1: d, y0: 0, y1: h, ...extra });
const W = () => mat(COLORS.white);

// Small models for products that don't stand alone in the room.
const CUSTOM = {
  drawerTray(g) {
    const m = W();
    g.add(box(0, 0, 0, 56, 1.2, 38, m));
    g.add(box(0, 0, 0, 1.2, 12, 38, m));
    g.add(box(54.8, 0, 0, 56, 12, 38, m));
    g.add(box(0, 0, 0, 56, 12, 1.2, m));
    g.add(box(0, 0, 36.8, 56, 12, 38, m));
  },
  runners(g) {
    const m = mat(COLORS.steel, { metalness: 0.6, roughness: 0.35 });
    for (const x of [0, 30]) {
      g.add(box(x, 0, 0, x + 1.5, 3.5, 38, m));
      g.add(box(x + 1.5, 0.5, 2, x + 2.5, 3, 36, mat('#c9ced3', { metalness: 0.6 })));
    }
  },
  panel(g, w, h, knob) {
    g.add(box(0, 0, 0, w, h, 1.6, W()));
    if (knob) {
      const k = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8), mat('#1d1d1f'));
      k.position.set(...knob);
      g.add(k);
    }
  },
  rod(g) {
    const m = mat(COLORS.trim, { roughness: 0.4 });
    const r = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 200, 12), m);
    r.rotation.z = Math.PI / 2;
    r.position.set(100, 20, 0);
    g.add(r);
    for (const x of [-3, 203]) {
      const f = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 8), m);
      f.position.set(x, 20, 0);
      g.add(f);
    }
    for (const x of [30, 170]) g.add(box(x - 1, 20, -8, x + 1, 23, 0, m), box(x - 3, 14, -9, x + 3, 26, -8, m));
  },
  hooks(g) {
    const m = mat('#e9e6e0');
    for (let i = 0; i < 5; i++) {
      const x = i * 6;
      g.add(box(x, 0, 0, x + 1.4, 7, 1.4, m));
      g.add(box(x, 0, 0, x + 1.4, 1.4, 4, m));
      g.add(box(x, 0, 2.6, x + 1.4, 2.6, 4, m));
    }
  },
  container(g) {
    g.add(box(0, 0, 0, 16, 9, 9, mat('#efede8')));
    g.add(box(-0.3, 9, -0.3, 16.3, 10.2, 9.3, mat('#d9d6cf')));
  },
  skadisShelf(g) {
    const m = mat('#efede8');
    g.add(box(0, 0, 0, 36, 1.2, 12, m));
    g.add(box(0, 0, 0, 36, 4, 1.2, m));
    for (const x of [4, 31]) g.add(box(x, -6, 0, x + 1.2, 1.2, 8, m));
  },
  kallaxInsert(g, drawers) {
    const m = W();
    g.add(box(0, 0, 0, 33, 33, 37, m));
    const n = drawers ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const y0 = (33 / n) * i;
      g.add(box(0.3, y0 + 0.3, 37, 32.7, y0 + 33 / n - 0.3, 38.6, m));
      const k = new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 8), mat('#1d1d1f'));
      k.position.set(drawers ? 16.5 : 29, y0 + 33 / n / 2, 39.4);
      g.add(k);
    }
  },
  drona(g) {
    const c = mat('#f2f0eb', { roughness: 0.95 });
    g.add(box(0, 0, 0, 33, 33, 38, c));
    g.add(box(1.2, 33, 1.2, 31.8, 33.2, 36.8, mat('#d8d3ca', { roughness: 1 })));
    g.add(box(12, 24, 37.9, 21, 28, 38.2, mat('#b9b2a6')));
  },
  files(g) {
    for (let i = 0; i < 2; i++) {
      const x = i * 9;
      const m = mat('#ffffff', { roughness: 0.6 });
      g.add(box(x, 0, 0, x + 7.5, 31, 24, m));
      g.add(box(x - 0.01, 0, 11, x + 7.51, 18, 24.01, mat('#ece9e3')));
    }
  },
  kuggis(g, w, d, h) {
    const m = new THREE.MeshStandardMaterial({ color: '#f4f4f2', transparent: true, opacity: 0.82, roughness: 0.3 });
    g.add(box(0, 0, 0, w, h, d, m));
    g.add(box(-0.3, h, -0.3, w + 0.3, h + 1, d + 0.3, mat('#ffffff', { roughness: 0.3 })));
  },
  boaxel(g) {
    const m = W();
    const metal = mat('#ececec', { metalness: 0.3 });
    g.add(box(0, 120, -2, 162, 123, 0, metal));
    for (const x of [0, 80, 160]) g.add(box(x, 0, -2, x + 2, 120, 0, metal));
    for (const y of [25, 65, 105]) g.add(box(0, y, 0, 162, y + 1.5, 40, m));
    const colors = ['#f4f4f2', '#e8e2d8', '#f4f4f2'];
    for (let i = 0; i < 4; i++) {
      const x = 6 + i * 38;
      g.add(box(x, 66.5, 4, x + 34, 81.5, 30, mat(colors[i % 3], { transparent: true, opacity: 0.85 })));
      g.add(box(x, 26.5, 4, x + 34, 41.5, 30, mat(colors[(i + 1) % 3], { transparent: true, opacity: 0.85 })));
    }
  },
};

// key -> how to build it and where the camera looks from (direction from the model).
const MODELS = {
  'besta-frame': { piece: P('besta', 120, 40, 38), from: [0.7, 0.6, 1] },
  'besta-drawer': { build: g => CUSTOM.drawerTray(g), from: [0.5, 1, 1] },
  'besta-runner': { build: g => CUSTOM.runners(g), from: [0.6, 0.8, 1] },
  lappviken: { build: g => CUSTOM.panel(g, 60, 38), from: [0.4, 0.3, 1] },
  'bench-cushion': { piece: P('cushion', 120, 40, 8), from: [0.6, 0.8, 1] },
  fjadermott: { piece: P('pillow', 50, 14, 50, { color: '#f6f3ee' }), from: [0.4, 0.3, 1] },
  gurli: { piece: P('pillow', 50, 14, 50, { color: '#fbfaf7' }), from: [0.4, 0.3, 1] },
  hilja: { piece: P('curtain', 70, 5, 250), from: [0.5, 0.2, 1] },
  racka: { build: g => CUSTOM.rod(g), from: [0.2, 0.4, 1] },
  'hektar-floor': { piece: P('floorlamp', 30, 30, 160), from: [-0.3, 0.3, 1] },
  karlby: { piece: P('top', 186, 63.5, 3.8), from: [0.5, 0.9, 1] },
  'alex-small': { piece: P('alex', 36, 58, 70, { drawers: 5, face: 's' }), from: [0.7, 0.5, 1] },
  'skadis-76': { piece: P('skadis', 76, 2, 56, { face: 's' }), from: [0.3, 0.2, 1] },
  'skadis-hook': { build: g => CUSTOM.hooks(g), from: [0.8, 0.6, 1] },
  'skadis-container': { build: g => CUSTOM.container(g), from: [0.6, 0.6, 1] },
  'skadis-shelf': { build: g => CUSTOM.skadisShelf(g), from: [0.6, 0.7, 1] },
  'lack-shelf': { piece: P('shelf', 26, 110, 5), from: [1, 0.6, 0.5] },
  tertial: { piece: P('tertial', 10, 10, 55), from: [0.2, 0.3, 1] },
  langfjall: { piece: P('officechair', 55, 55, 110), from: [1, 0.4, 0.7] },
  kallax: { piece: P('kallax', 39, 147, 147), from: [1, 0.35, 0.6] },
  'kallax-drawers': { build: g => CUSTOM.kallaxInsert(g, true), from: [0.6, 0.4, 1] },
  'kallax-door': { build: g => CUSTOM.kallaxInsert(g, false), from: [0.6, 0.4, 1] },
  drona: { build: g => CUSTOM.drona(g), from: [0.6, 0.5, 1] },
  tjena: { build: g => CUSTOM.files(g), from: [0.8, 0.4, 1] },
  'alex-9': { piece: P('alex', 36, 48, 116, { drawers: 9, face: 's' }), from: [0.7, 0.4, 1] },
  'kuggis-small': { build: g => CUSTOM.kuggis(g, 13, 18, 8), from: [0.7, 0.8, 1] },
  mosslanda: { piece: P('ledge', 9, 115, 4), from: [1, 0.5, 0.3] },
  norden: { piece: P('norden', 89, 80, 74), from: [-0.7, 0.7, 1] },
  teodores: { piece: P('chair', 43, 44, 80, { face: 'n' }), from: [0.7, 0.5, -1] },
  raskog: { piece: P('cart', 35, 45, 78), from: [0.8, 0.5, 1] },
  lohals: { piece: P('rug', 160, 230, 0.8), from: [0.4, 1.4, 1] },
  boaxel: { build: g => CUSTOM.boaxel(g), from: [0.4, 0.3, 1] },
  'kuggis-large': { build: g => CUSTOM.kuggis(g, 26, 35, 15), from: [0.7, 0.7, 1] },
  'skadis-36': { piece: P('skadis', 36, 2, 56, { face: 's' }), from: [0.3, 0.2, 1] },

  // Option 2 – KALLAX design pieces
  'kallax-2x4': { piece: P('kallaxGrid', 76.5, 39, 146.5, { cols: 2, rows: 4, face: 's', cells: [['open', 'open'], ['open', 'open'], ['open', 'open'], ['open', 'open']] }), from: [0.6, 0.4, 1] },
  'kallax-1x4': { piece: P('kallaxGrid', 146.5, 39, 41.3, { cols: 4, rows: 1, face: 's', cells: [['open', 'open', 'open', 'open']] }), from: [0.5, 0.6, 1] },
  'kallax-bottles': { piece: P('kallaxGrid', 41.3, 39, 41.3, { cols: 1, rows: 1, face: 's', cells: [['bottles']] }), from: [0.5, 0.4, 1] },
  'kallax-shelf1': { piece: P('kallaxGrid', 41.3, 39, 41.3, { cols: 1, rows: 1, face: 's', cells: [['shelf1']] }), from: [0.5, 0.4, 1] },
  'kallax-shelf4': { piece: P('kallaxGrid', 41.3, 39, 41.3, { cols: 1, rows: 1, face: 's', cells: [['shelf4']] }), from: [0.5, 0.4, 1] },
  'kuggis-cube': { build: g => CUSTOM.kuggis(g, 32, 32, 30), from: [0.7, 0.7, 1] },
  'kallax-desk': { piece: P('kdesk', 111, 39, 77, { face: 's', inserts: ['door', 'drawers'] }), from: [0.6, 0.5, 1] },
  'kallax-desk-drawers': { piece: P('kallaxGrid', 41.3, 39, 41.3, { cols: 1, rows: 1, face: 's', cells: [['drawers']] }), from: [0.5, 0.4, 1] },
  'kallax-desk-door': { piece: P('kallaxGrid', 41.3, 39, 41.3, { cols: 1, rows: 1, face: 's', cells: [['door']] }), from: [0.5, 0.4, 1] },
  'kallax-lock': { piece: P('kallaxGrid', 41.3, 39, 41.3, { cols: 1, rows: 1, face: 's', cells: [['lock']] }), from: [0.5, 0.4, 1] },
  'billy-fold': { piece: P('billyfold', 80, 112.4, 106, { face: 's', caseDepth: 32.4, tableY: 74.3 }), from: [0.9, 0.6, 1] },
  hoppvals: { piece: P('blind', 86, 1, 145), from: [0.3, 0.2, 1] },
};
// Option 2 add-ons that are the same product as one in Option 1.
Object.assign(MODELS, {
  'kuddarna-b': MODELS['bench-cushion'],
  'fjadermott-b': MODELS.fjadermott,
  'gurli-b': MODELS.gurli,
  'drona-b': MODELS.drona,
  'tjena-b': MODELS.tjena,
  'skadis-76-b': MODELS['skadis-76'],
  'alex-9-b': MODELS['alex-9'],
  'kuggis-small-b': MODELS['kuggis-small'],
});

let studio = null;
function setupStudio() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(480, 360, false);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#efebf1');
  scene.add(new THREE.HemisphereLight('#ffffff', '#8a8090', 1.6));
  const key = new THREE.DirectionalLight('#fff6ea', 1.8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0005;
  scene.add(key, key.target);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.18 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const camera = new THREE.PerspectiveCamera(30, 480 / 360, 1, 5000);
  return { renderer, scene, key, floor, camera };
}

const cache = new Map();

// Returns a data URL picture of the product, or null if there's no model for it.
export function productImage(key) {
  if (cache.has(key)) return cache.get(key);
  const spec = MODELS[key];
  if (!spec) return null;
  studio ||= setupStudio();
  const { renderer, scene, key: light, floor, camera } = studio;

  const g = new THREE.Group();
  if (spec.piece) BUILDERS[spec.piece.kind](spec.piece, g);
  else spec.build(g);
  scene.add(g);

  const bounds = new THREE.Box3().setFromObject(g);
  const center = bounds.getCenter(new THREE.Vector3());
  const radius = bounds.getBoundingSphere(new THREE.Sphere()).radius;
  const dir = new THREE.Vector3(...spec.from).normalize();
  const dist = (radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.08;
  camera.position.copy(center).addScaledVector(dir, dist);
  camera.near = dist / 20;
  camera.far = dist * 6;
  camera.lookAt(center);
  camera.updateProjectionMatrix();

  floor.position.set(center.x, bounds.min.y - 0.05, center.z);
  floor.scale.setScalar(radius * 8);
  light.position.copy(center).add(new THREE.Vector3(radius * 1.5, radius * 3, radius * 2));
  light.target.position.copy(center);
  Object.assign(light.shadow.camera, { left: -radius * 2, right: radius * 2, top: radius * 2, bottom: -radius * 2, near: 1, far: radius * 10 });
  light.shadow.camera.updateProjectionMatrix();

  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  scene.remove(g);
  cache.set(key, url);
  return url;
}
