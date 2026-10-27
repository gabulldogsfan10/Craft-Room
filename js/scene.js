// Three.js model of the room and the proposed IKEA furniture.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ROOM, PIECES } from './data.js';

const R = ROOM.size;
const H = ROOM.height;

export const COLORS = {
  white: '#f2f0eb',
  trim: '#f6f5f1',
  wood: '#c9a77c',
  grey: '#3b3b40',
  steel: '#9aa0a6',
  cushion: '#b8a99a',
  glass: '#bfd8e6',
};

// ---------------------------------------------------------------- helpers

const matCache = new Map();
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...opts }));
  }
  return matCache.get(key);
}

export function box(x0, y0, z0, x1, y1, z1, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), material);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function cyl(x, y0, z, r, h, material, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), material);
  m.position.set(x, y0 + h / 2, z);
  m.castShadow = true;
  return m;
}

function canvasTexture(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  return t;
}

// Seeded random so the render looks the same every load.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// Fronts face one of n/e/s/w. Returns helpers that map (along, depth) to the
// world for a piece whose front is on that side.
function frontFrame(p, face) {
  const { x0, x1, z0, z1 } = p;
  switch (face) {
    case 'e': return { len: z1 - z0, at: (a, d) => [x1 + d, z0 + a], horiz: false };
    case 'w': return { len: z1 - z0, at: (a, d) => [x0 - d, z1 - a], horiz: false };
    case 'n': return { len: x1 - x0, at: (a, d) => [x1 - a, z0 - d], horiz: true };
    default: return { len: x1 - x0, at: (a, d) => [x0 + a, z1 + d], horiz: true };
  }
}

// A thin panel on the front face from along a0..a1, height y0..y1.
function frontPanel(p, face, a0, a1, y0, y1, thick, material) {
  const f = frontFrame(p, face);
  const [xa, za] = f.at(a0, 0);
  const [xb, zb] = f.at(a1, thick);
  return box(Math.min(xa, xb), y0, Math.min(za, zb), Math.max(xa, xb), y1, Math.max(za, zb), material);
}

// ---------------------------------------------------------------- textures

const concreteTex = canvasTexture(512, 512, (g, w, h) => {
  g.fillStyle = '#4a4540';
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) {
    const r = 6 + rand() * 40;
    g.fillStyle = `rgba(${rand() < 0.5 ? '30,26,22' : '120,110,95'},${0.04 + rand() * 0.06})`;
    g.beginPath();
    g.arc(rand() * w, rand() * h, r, 0, Math.PI * 2);
    g.fill();
  }
}, [3, 3]);

const pegTex = canvasTexture(256, 192, (g, w, h) => {
  g.fillStyle = COLORS.white;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#cfcac0';
  for (let y = 10; y < h; y += 14) for (let x = 8 + ((y / 14) % 2) * 7; x < w; x += 14) g.fillRect(x, y, 3, 6);
});

const rugTex = canvasTexture(256, 384, (g, w, h) => {
  g.fillStyle = '#d8ccb6';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#bfae92';
  g.lineWidth = 2;
  for (let y = 0; y < h; y += 6) {
    g.beginPath();
    g.moveTo(0, y + rand() * 2);
    g.lineTo(w, y + rand() * 2);
    g.stroke();
  }
  g.strokeStyle = '#a89676';
  g.lineWidth = 8;
  g.strokeRect(14, 14, w - 28, h - 28);
});

const panelDoorTex = canvasTexture(128, 256, (g, w, h) => {
  g.fillStyle = COLORS.trim;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d5d2ca';
  g.lineWidth = 3;
  const rows = 5;
  const ph = (h - 20) / rows;
  for (let i = 0; i < rows; i++) g.strokeRect(16, 10 + i * ph + 4, w - 32, ph - 8);
});

const outsideTex = canvasTexture(512, 256, (g, w, h) => {
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#cfe3ef');
  sky.addColorStop(0.45, '#e8f0f2');
  sky.addColorStop(0.46, '#5f8150');
  sky.addColorStop(1, '#7da35f');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(${50 + rand() * 30},${85 + rand() * 40},${45 + rand() * 20},0.9)`;
    g.beginPath();
    g.arc(rand() * w, h * 0.42 + rand() * 20, 15 + rand() * 30, 0, Math.PI * 2);
    g.fill();
  }
});

// ---------------------------------------------------------------- room shell

function wallFromShape(width, holes) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(width, 0);
  s.lineTo(width, H);
  s.lineTo(0, H);
  s.lineTo(0, 0);
  for (const [u0, v0, u1, v1] of holes) {
    const hole = new THREE.Path();
    hole.moveTo(u0, v0);
    hole.lineTo(u0, v1);
    hole.lineTo(u1, v1);
    hole.lineTo(u1, v0);
    hole.lineTo(u0, v0);
    s.holes.push(hole);
  }
  return new THREE.ShapeGeometry(s);
}

function buildShell(wallMat) {
  const g = new THREE.Group();
  const { window: win, closet, entry } = ROOM;

  // Floor (stained concrete, as in the photos)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(R, R), mat('#ffffff', { map: concreteTex, roughness: 0.55 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(R / 2, 0, R / 2);
  floor.receiveShadow = true;
  g.add(floor);

  // Ceiling (faces down, so it disappears when orbiting above the room)
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(R, R),
    mat('#f4f2ee', { shadowSide: THREE.DoubleSide, emissive: '#f4f2ee', emissiveIntensity: 0.35 }));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(R / 2, H, R / 2);
  ceil.castShadow = true;
  g.add(ceil);

  const wall = (geo, rotY, x, z) => {
    const m = new THREE.Mesh(geo, wallMat);
    m.rotation.y = rotY;
    m.position.set(x, 0, z);
    m.receiveShadow = true;
    m.castShadow = true;
    g.add(m);
  };
  wall(wallFromShape(R, [[win.x0, win.sill, win.x1, win.head]]), 0, 0, 0); // north
  wall(wallFromShape(R, [ // south, viewed from inside: u = R - x
    [R - closet.x1, 0.01, R - closet.x0, closet.head],
    [R - entry.x1, 0.01, R - entry.x0, entry.head],
  ]), Math.PI, R, R);
  wall(wallFromShape(R, []), Math.PI / 2, 0, R); // west
  wall(wallFromShape(R, []), -Math.PI / 2, R, 0); // east

  const trim = mat(COLORS.trim);
  // Details on the south wall and the view outside the window are hidden when
  // the camera orbits outside the room, so they don't block the dollhouse view.
  const south = new THREE.Group();
  g.userData.south = south;
  g.add(south);
  // Baseboards
  const bb = 10;
  g.add(box(0, 0, 0, R, bb, 1.5, trim));
  g.add(box(0, 0, 0, 1.5, bb, R, trim));
  g.add(box(R - 1.5, 0, 0, R, bb, R, trim));
  south.add(box(0, 0, R - 1.5, closet.x0 - 7, bb, R, trim));
  south.add(box(closet.x1 + 7, 0, R - 1.5, entry.x0 - 7, bb, R, trim));
  south.add(box(entry.x1 + 7, 0, R - 1.5, R, bb, R, trim));

  // Window: casing, sash, muntins, glass, view outside
  const t = 7;
  g.add(box(win.x0 - t, win.sill - 4, 0, win.x1 + t, win.sill, 6, trim)); // stool
  g.add(box(win.x0 - t, win.head, 0, win.x1 + t, win.head + t, 2, trim));
  g.add(box(win.x0 - t, win.sill - 4, 0, win.x0, win.head, 2, trim));
  g.add(box(win.x1, win.sill - 4, 0, win.x1 + t, win.head, 2, trim));
  const mid = (win.x0 + win.x1) / 2;
  const midY = (win.sill + win.head) / 2;
  g.add(box(mid - 3, win.sill, -6, mid + 3, win.head, -3, trim));
  g.add(box(win.x0, midY - 3, -6, win.x1, midY + 3, -3, trim));
  for (const [a, b] of [[win.x0, mid], [mid, win.x1]]) {
    for (const f of [1 / 3, 2 / 3]) {
      const x = a + (b - a) * f;
      g.add(box(x - 0.8, midY, -5, x + 0.8, win.head, -4, trim));
    }
  }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(win.x1 - win.x0, win.head - win.sill),
    new THREE.MeshStandardMaterial({ color: COLORS.glass, transparent: true, opacity: 0.12, roughness: 0.1 }));
  glass.position.set(mid, midY, -5);
  g.add(glass);
  const outside = new THREE.Mesh(new THREE.PlaneGeometry(900, 450), new THREE.MeshBasicMaterial({ map: outsideTex }));
  outside.position.set(mid, 120, -260);
  g.userData.outside = outside;
  g.add(outside);

  // Door casings
  const casing = (x0, x1, head) => {
    south.add(box(x0 - t, 0, R - 2, x0, head, R, trim));
    south.add(box(x1, 0, R - 2, x1 + t, head, R, trim));
    south.add(box(x0 - t, head, R - 2, x1 + t, head + t, R, trim));
  };
  casing(closet.x0, closet.x1, closet.head);
  casing(entry.x0, entry.x1, entry.head);

  const doorMat = mat('#ffffff', { map: panelDoorTex });
  const leafW = (closet.x1 - closet.x0) / 2;
  south.add(box(closet.x0, 0.5, R - 4, closet.x0 + leafW - 0.3, closet.head, R - 0.5, doorMat));
  south.add(box(closet.x0 + leafW + 0.3, 0.5, R - 4, closet.x1, closet.head, R - 0.5, doorMat));
  for (const x of [closet.x0 + leafW - 4, closet.x0 + leafW + 4]) {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(2.6, 12, 8), mat('#1d1d1f'));
    knob.position.set(x, 95, R - 6);
    south.add(knob);
  }

  // Entry door, standing open against its hinge side
  const ew = entry.x1 - entry.x0;
  south.add(box(entry.hingeX - 4, 0.5, R - ew - 2, entry.hingeX - 0.5, entry.head, R - 2, doorMat));
  const hall = new THREE.Mesh(new THREE.PlaneGeometry(ew + 40, H), mat('#d9d6cf'));
  hall.rotation.y = Math.PI;
  hall.position.set((entry.x0 + entry.x1) / 2, H / 2, R + 140);
  south.add(hall);

  // Light switch
  south.add(box(ROOM.switchX - 4, 115, R - 1, ROOM.switchX + 4, 127, R - 0.3, mat('#ffffff')));

  // Ceiling fixture
  const dome = new THREE.Mesh(new THREE.SphereGeometry(18, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#fffaf0', emissive: '#fff4dc', emissiveIntensity: 0.9 }));
  dome.rotation.x = Math.PI;
  dome.position.set(R / 2, H - 1, R / 2);
  g.add(dome);

  return g;
}

// ---------------------------------------------------------------- furniture

const white = () => mat(COLORS.white);

export const BUILDERS = {
  besta(p, g) {
    g.add(box(p.x0, p.y0, p.z0, p.x1, p.y1, p.z1 - 1.6, white()));
    const w = (p.x1 - p.x0) / 2;
    for (let i = 0; i < 2; i++) {
      g.add(frontPanel({ ...p, z1: p.z1 - 1.6 }, 's', i * w + 0.2, (i + 1) * w - 0.2, p.y0 + 0.5, p.y1, 1.6, white()));
    }
  },

  cushion(p, g, color) {
    const m = box(p.x0, p.y0, p.z0, p.x1, p.y1, p.z1, mat(color || COLORS.cushion, { roughness: 0.95 }));
    g.add(m);
  },

  pillow(p, g) {
    const m = box(p.x0, p.y0, p.z0, p.x1, p.y1, p.z1, mat(p.color, { roughness: 0.95 }));
    m.rotation.x = -0.18;
    g.add(m);
  },

  curtain(p, g) {
    const m = mat('#f3efe7', { transparent: true, opacity: 0.9, roughness: 1, side: THREE.DoubleSide });
    const folds = 7;
    const w = (p.x1 - p.x0) / folds;
    for (let i = 0; i < folds; i++) {
      const d = i % 2 ? 2 : 0;
      g.add(box(p.x0 + i * w, p.y0, p.z0 + d, p.x0 + (i + 1) * w + 0.5, p.y1, p.z0 + d + 2, m));
    }
  },

  rod(p, g) {
    g.add(box(p.x0, p.y0, p.z0, p.x1, p.y1, p.z1, mat(COLORS.trim)));
  },

  floorlamp(p, g) {
    const cx = (p.x0 + p.x1) / 2;
    const cz = (p.z0 + p.z1) / 2;
    const m = mat(COLORS.grey, { metalness: 0.4, roughness: 0.5 });
    g.add(cyl(cx, 0, cz, 14, 2, m, 24));
    g.add(cyl(cx, 2, cz, 1.2, p.y1 - 25, m));
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(8, 16, 22, 24, 1, true), mat(COLORS.grey, { side: THREE.DoubleSide, metalness: 0.4 }));
    shade.position.set(cx - 10, p.y1 - 12, cz + 10);
    shade.rotation.set(0.5, 0, 0.5);
    g.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 8), new THREE.MeshBasicMaterial({ color: '#fff3d6' }));
    bulb.position.set(cx - 14, p.y1 - 18, cz + 14);
    g.add(bulb);
  },

  alex(p, g) {
    const t = 1.6;
    const f = frontFrame(p, p.face);
    const body = { ...p };
    if (p.face === 'w') body.x0 += t;
    if (p.face === 'e') body.x1 -= t;
    g.add(box(body.x0, p.y0, body.z0, body.x1, p.y1, body.z1, white()));
    const h = (p.y1 - p.y0 - 2) / p.drawers;
    for (let i = 0; i < p.drawers; i++) {
      const y0 = p.y0 + 1 + i * h;
      g.add(frontPanel(body, p.face, 0.3, f.len - 0.3, y0 + 0.3, y0 + h - 0.3, t, white()));
      // finger-pull groove shading
      g.add(frontPanel(body, p.face, 4, f.len - 4, y0 + h - 1.6, y0 + h - 0.6, t + 0.05, mat('#d6d2c9')));
    }
  },

  top(p, g) {
    g.add(box(p.x0, p.y0, p.z0, p.x1, p.y1, p.z1, mat(COLORS.wood, { roughness: 0.6 })));
  },

  skadis(p, g) {
    const tex = mat('#ffffff', { map: pegTex });
    g.add(box(p.x0, p.y0, p.z0, p.x1, p.y1, p.z1, tex));
    const f = frontFrame(p, p.face);
    const hoopMat = mat('#e9dfcf', { roughness: 0.5 });
    const isMachine = p.id.startsWith('skadis-') && p.face === 'w';
    if (isMachine) {
      // embroidery hoops hanging on hooks
      const sizes = p.id === 'skadis-1' ? [[18, 12], [13, 9]] : [[22, 15], [10, 10]];
      sizes.forEach(([w, h], i) => {
        const a = 14 + i * 36 + w / 2;
        const [x, z] = f.at(a, 3);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 32), hoopMat);
        ring.scale.set(w / 2, h / 2, 2);
        ring.rotation.y = f.horiz ? 0 : Math.PI / 2;
        ring.position.set(x, p.y1 - 6 - h / 2, z);
        g.add(ring);
      });
      // small lidded containers
      for (let i = 0; i < 3; i++) {
        const a0 = 8 + i * 22;
        const [xa, za] = f.at(a0, 0);
        const [xb, zb] = f.at(a0 + 16, 9);
        g.add(box(Math.min(xa, xb), p.y0 + 4, Math.min(za, zb), Math.max(xa, xb), p.y0 + 14, Math.max(za, zb), mat('#e8e4dc')));
      }
    } else {
      // rulers & shears by the door
      const tools = [['#e8c35a', 4, 46], ['#6aa0c9', 6, 30], ['#c74b4b', 9, 18]];
      tools.forEach(([c, w, h], i) => {
        const a0 = 4 + i * 11;
        const [xa, za] = f.at(a0, 0);
        const [xb, zb] = f.at(a0 + w, 1.2);
        g.add(box(Math.min(xa, xb), p.y1 - 4 - h, Math.min(za, zb), Math.max(xa, xb), p.y1 - 4, Math.max(za, zb), mat(c)));
      });
    }
  },

  shelf(p, g) {
    g.add(box(p.x0, p.y0, p.z0, p.x1, p.y1, p.z1, white()));
    // thread cones in rainbow order
    const n = 18;
    const len = p.z1 - p.z0;
    for (let i = 0; i < n; i++) {
      const c = new THREE.Color().setHSL(i / n, 0.65, 0.55);
      const z = p.z0 + 4 + (i * (len - 8)) / (n - 1);
      const cone = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 3, 11, 12), mat('#' + c.getHexString(), { roughness: 0.45 }));
      cone.position.set(p.x0 + 10, p.y1 + 5.5, z);
      cone.castShadow = true;
      g.add(cone);
    }
  },

  tertial(p, g) {
    const m = mat(COLORS.grey, { metalness: 0.4, roughness: 0.5 });
    const cx = (p.x0 + p.x1) / 2;
    const cz = (p.z0 + p.z1) / 2;
    g.add(box(p.x0, p.y0, p.z0, p.x1, p.y0 + 4, p.z1, m));
    g.add(cyl(cx, p.y0 + 4, cz, 0.8, 38, m, 8));
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 42, 8), m);
    arm.position.set(cx - 18, p.y0 + 48, cz);
    arm.rotation.z = Math.PI / 2.6;
    g.add(arm);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(7, 12, 20, 1, true), mat(COLORS.grey, { side: THREE.DoubleSide, metalness: 0.4 }));
    shade.position.set(cx - 36, p.y0 + 50, cz);
    g.add(shade);
  },

  machine(p, g) {
    const m = mat('#fbfbfb', { roughness: 0.35 });
    const accent = mat('#8fb8d8');
    const d = p.x1 - p.x0;
    // bed, pillar, arm (front faces west)
    g.add(box(p.x0, p.y0, p.z0, p.x1, p.y0 + 10, p.z1, m));
    g.add(box(p.x0 + d * 0.25, p.y0 + 10, p.z1 - 12, p.x1 - d * 0.1, p.y1, p.z1, m));
    g.add(box(p.x0 + d * 0.25, p.y1 - 9, p.z0 + 2, p.x1 - d * 0.1, p.y1, p.z1, m));
    g.add(box(p.x0 + d * 0.24, p.y1 - 18, p.z1 - 11, p.x0 + d * 0.25, p.y1 - 10, p.z1 - 3, accent));
    if (p.id === 'machine-1') {
      // embroidery unit + hoop on the bed
      g.add(box(p.x0 - 8, p.y0, p.z0 - 22, p.x1 - 4, p.y0 + 8, p.z0 + 4, m));
      g.add(box(p.x0 - 2, p.y0 + 10, p.z0 - 16, p.x0 + 26, p.y0 + 11.5, p.z0 + 10, mat('#e9dfcf')));
    }
  },

  officechair(p, g) {
    const cx = (p.x0 + p.x1) / 2;
    const cz = (p.z0 + p.z1) / 2;
    const fabric = mat('#4b4f57', { roughness: 0.9 });
    const black = mat('#1f1f22');
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const leg = box(-1.5, 0, 0, 1.5, 3, 30, black);
      leg.position.set(cx + Math.sin(a) * 14, 6, cz + Math.cos(a) * 14);
      leg.rotation.y = a;
      g.add(leg);
    }
    g.add(cyl(cx, 6, cz, 2.5, 38, black));
    g.add(box(cx - 24, 44, cz - 24, cx + 24, 51, cz + 24, fabric));
    // back on the side away from the desk (desk is east)
    g.add(box(cx - 26, 52, cz - 22, cx - 22, p.y1, cz + 22, fabric));
    for (const s of [-1, 1]) g.add(box(cx - 18, 62, cz + s * 25 - 2, cx + 14, 64, cz + s * 25 + 2, black));
  },

  kallax(p, g) {
    const t = 3.6;
    const w = p.z1 - p.z0;
    const cell = (w - t * 5) / 4;
    const W = white();
    // outer frame + dividers (open towards +x)
    g.add(box(p.x0, p.y0, p.z0, p.x1, p.y0 + t, p.z1, W));
    g.add(box(p.x0, p.y1 - t, p.z0, p.x1, p.y1, p.z1, W));
    g.add(box(p.x0, p.y0, p.z0, p.x0 + 1, p.y1, p.z1, W));
    for (let i = 0; i <= 4; i++) {
      const z = p.z0 + i * (cell + t);
      g.add(box(p.x0, p.y0, z, p.x1, p.y1, z + t, W));
      const y = p.y0 + i * (cell + t);
      if (i > 0 && i < 4) g.add(box(p.x0, y, p.z0, p.x1, y + t, p.z1, W));
    }
    // Row 0 = bottom. d=drawers, o=door, b=DRÖNA box, f=magazine files, k=books
    const layout = [
      ['b', 'd', 'd', 'b'],
      ['b', 'o', 'o', 'b'],
      ['f', 'k', 'b', 'f'],
      ['k', 'b', 'f', 'k'],
    ];
    const dronaColors = ['#9c86b0', '#c9b9a5', '#7e9a8a'];
    let bi = 0;
    layout.forEach((row, r) => row.forEach((type, c) => {
      const cz0 = p.z0 + t + c * (cell + t);
      const cy0 = p.y0 + t + r * (cell + t);
      const front = p.x1;
      if (type === 'd' || type === 'o') {
        const n = type === 'd' ? 2 : 1;
        const h = cell / n;
        for (let i = 0; i < n; i++) {
          g.add(box(front - 1.6, cy0 + i * h + 0.3, cz0 + 0.3, front, cy0 + (i + 1) * h - 0.3, cz0 + cell - 0.3, W));
        }
        const knob = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 8), mat('#1d1d1f'));
        knob.position.set(front + 0.8, type === 'd' ? cy0 + cell * 0.25 : cy0 + cell / 2, type === 'd' ? cz0 + cell / 2 : cz0 + cell - 4);
        g.add(knob);
        if (type === 'd') {
          const k2 = knob.clone();
          k2.position.y = cy0 + cell * 0.75;
          g.add(k2);
        }
      } else if (type === 'b') {
        g.add(box(front - 36, cy0, cz0 + 0.5, front - 1, cy0 + cell - 0.6, cz0 + cell - 0.5, mat(dronaColors[bi++ % 3], { roughness: 0.95 })));
      } else if (type === 'f') {
        for (let i = 0; i < 4; i++) {
          const z = cz0 + 1 + i * 8;
          g.add(box(front - 27, cy0, z, front - 3, cy0 + 31, z + 7.4, mat('#ffffff')));
        }
      } else {
        let z = cz0 + 1;
        while (z < cz0 + cell - 4) {
          const bw = 2 + rand() * 3;
          const bh = 20 + rand() * 9;
          const col = new THREE.Color().setHSL(rand(), 0.3, 0.35 + rand() * 0.3);
          g.add(box(front - 24, cy0, z, front - 4, cy0 + bh, z + bw, mat('#' + col.getHexString())));
          z += bw + 0.4;
        }
      }
    }));
  },

  ledge(p, g) {
    g.add(box(p.x0, p.y0, p.z0, p.x1, p.y1, p.z1, white()));
    // leaning frames / finished hoops
    const items = [[22, 28, '#2f2f33'], [30, 22, '#f5f2ea'], [24, 24, 'hoop'], [20, 26, '#2f2f33']];
    let z = p.z0 + 6;
    for (const [w, h, c] of items) {
      if (c === 'hoop') {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(h / 2, 0.9, 8, 32), mat(COLORS.wood));
        ring.rotation.y = Math.PI / 2;
        ring.position.set(p.x0 + 4, p.y1 + h / 2 + 1, z + w / 2);
        g.add(ring);
        const cloth = new THREE.Mesh(new THREE.CircleGeometry(h / 2 - 0.5, 32), mat('#efe7d8'));
        cloth.rotation.y = Math.PI / 2;
        cloth.position.set(p.x0 + 3.8, p.y1 + h / 2 + 1, z + w / 2);
        g.add(cloth);
      } else {
        const fr = box(p.x0 + 2, p.y1, z, p.x0 + 4, p.y1 + h, z + w, mat(c));
        fr.rotation.z = -0.08;
        g.add(fr);
        g.add(box(p.x0 + 4.1, p.y1 + 3, z + 3, p.x0 + 4.3, p.y1 + h - 3, z + w - 3, mat(new THREE.Color().setHSL(rand(), 0.35, 0.65).getStyle())));
      }
      z += w + 6;
    }
  },

  rug(p, g) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(p.x1 - p.x0, p.z1 - p.z0), mat('#ffffff', { map: rugTex, roughness: 1 }));
    m.rotation.x = -Math.PI / 2;
    m.position.set((p.x0 + p.x1) / 2, p.y1, (p.z0 + p.z1) / 2);
    m.receiveShadow = true;
    g.add(m);
  },

  norden(p, g) {
    const W = white();
    const top = 74;
    // drawer section (26 cm) at the east end, one 63 cm leaf raised to the west
    const mx0 = p.x1 - 26;
    g.add(box(mx0, 0, p.z0 + 2, p.x1, top - 3, p.z1 - 2, W));
    for (let i = 0; i < 3; i++) {
      const y0 = 8 + i * 20;
      g.add(box(mx0 + 1, y0, p.z1 - 2, p.x1 - 1, y0 + 18, p.z1 - 1, W));
      g.add(box(mx0 + 1, y0, p.z0 + 1, p.x1 - 1, y0 + 18, p.z0 + 2, W));
    }
    g.add(box(p.x0, top - 3, p.z0, p.x1, top, p.z1, W));
    // gateleg
    g.add(box(p.x0 + 6, 0, p.z0 + 4, p.x0 + 10, top - 3, p.z0 + 8, W));
    g.add(box(p.x0 + 6, 0, p.z1 - 8, p.x0 + 10, top - 3, p.z1 - 4, W));
    g.add(box(p.x0 + 6, 6, p.z0 + 8, p.x0 + 10, 10, p.z1 - 8, W));
    // a beading tray + cutting mat on top
    g.add(box(p.x0 + 10, top, p.z0 + 10, p.x0 + 55, top + 0.3, p.z0 + 45, mat('#3f7d5a')));
    g.add(box(p.x0 + 20, top, p.z0 + 52, p.x0 + 50, top + 1.5, p.z0 + 72, mat('#e6e1d8')));
    for (let i = 0; i < 14; i++) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.7, 6, 5), mat(new THREE.Color().setHSL(rand(), 0.7, 0.55).getStyle()));
      bead.position.set(p.x0 + 22 + rand() * 26, top + 2, p.z0 + 54 + rand() * 16);
      g.add(bead);
    }
  },

  chair(p, g) {
    const W = mat('#f5f4f0', { roughness: 0.5 });
    const cx = (p.x0 + p.x1) / 2;
    const cz = (p.z0 + p.z1) / 2;
    const s = 21;
    for (const dx of [-1, 1]) for (const dz of [-1, 1]) g.add(box(cx + dx * s - 1.5, 0, cz + dz * s - 1.5, cx + dx * s + 1.5, 45, cz + dz * s + 1.5, W));
    g.add(box(cx - s - 1.5, 45, cz - s - 1.5, cx + s + 1.5, 48, cz + s + 1.5, W));
    const back = { n: [cx - s, cz + s - 2, cx + s, cz + s + 1.5], e: [cx - s - 1.5, cz - s, cx - s + 2, cz + s] }[p.face];
    g.add(box(back[0], 48, back[1], back[2], p.y1, back[3], W));
  },

  cart(p, g) {
    const W = mat('#f2f2ef', { metalness: 0.3, roughness: 0.5 });
    for (const x of [p.x0, p.x1 - 1.5]) for (const z of [p.z0, p.z1 - 1.5]) {
      g.add(box(x, 5, z, x + 1.5, p.y1, z + 1.5, W));
      const wheel = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 6), mat('#333'));
      wheel.position.set(x + 0.75, 2.5, z + 0.75);
      g.add(wheel);
    }
    for (const y of [12, 42, p.y1 - 6]) {
      g.add(box(p.x0, y, p.z0, p.x1, y + 0.8, p.z1, W));
      g.add(box(p.x0, y, p.z0, p.x1, y + 7, p.z0 + 0.6, W));
      g.add(box(p.x0, y, p.z1 - 0.6, p.x1, y + 7, p.z1, W));
    }
    // floss skeins on top tier
    for (let i = 0; i < 10; i++) {
      const c = new THREE.Color().setHSL(i / 10, 0.6, 0.55);
      g.add(box(p.x0 + 4 + (i % 5) * 5.5, p.y1 - 5, p.z0 + 8 + Math.floor(i / 5) * 14, p.x0 + 8 + (i % 5) * 5.5, p.y1 - 2, p.z0 + 18 + Math.floor(i / 5) * 14, mat(c.getStyle())));
    }
  },
};

// ---------------------------------------------------------------- public API

export function createRoom(canvas, { onSelect } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e9e4ea');

  const wallMat = new THREE.MeshStandardMaterial({ color: '#4b2d5a', roughness: 0.9, shadowSide: THREE.DoubleSide });
  const shell = buildShell(wallMat);
  scene.add(shell);

  const pieces = new THREE.Group();
  const groups = new Map();
  for (const p of PIECES) {
    const g = new THREE.Group();
    g.userData.piece = p;
    BUILDERS[p.kind](p, g);
    pieces.add(g);
    groups.set(p.id, g);
  }

  // Wall-mounted pieces, by wall, so they hide with that wall in the dollhouse view.
  const mounted = { north: [], east: [], south: [], west: [] };
  for (const g of groups.values()) {
    const p = g.userData.piece;
    if (!['skadis', 'shelf', 'ledge'].includes(p.kind)) continue;
    if (p.x1 >= R - 0.5) mounted.east.push(g);
    else if (p.x0 <= 0.5) mounted.west.push(g);
    else if (p.z1 >= R - 0.5) mounted.south.push(g);
    else if (p.z0 <= 0.5) mounted.north.push(g);
  }
  function updateCutaway(cam) {
    const c = cam.position;
    const inside = c.x > 0 && c.x < R && c.z > 0 && c.z < R && c.y < H;
    shell.userData.outside.visible = inside;
    shell.userData.south.visible = c.z < R;
    const facing = { north: c.z > 0, east: c.x < R, south: c.z < R, west: c.x > 0 };
    for (const [wall, list] of Object.entries(mounted)) {
      for (const g of list) g.visible = facing[wall];
    }
  }
  scene.add(pieces);

  // Lighting: soft sky fill, sun through the window, ceiling fixture, task lamps
  scene.add(new THREE.HemisphereLight('#fffaf2', '#5a4d55', 1.1));
  const sun = new THREE.DirectionalLight('#fff3e0', 2.2);
  sun.position.set(140, 330, -280);
  sun.target.position.set(170, 0, 130);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -300, right: 300, top: 300, bottom: -300, near: 10, far: 1200 });
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  const ceilingLight = new THREE.PointLight('#fff1d8', 1.4, 0, 0);
  ceilingLight.position.set(R / 2, H - 25, R / 2);
  scene.add(ceilingLight);
  for (const [x, z] of [[R - 50, 97], [R - 50, 191]]) {
    const spot = new THREE.SpotLight('#fff6e6', 2.5, 140, 0.7, 0.6, 0);
    spot.position.set(x, 118, z);
    spot.target.position.set(x - 10, 74, z);
    scene.add(spot, spot.target);
  }

  const camera = new THREE.PerspectiveCamera(55, 1, 1, 5000);

  // Two ways to move around:
  //   orbit – Overview / Top: circle the room like a dollhouse (OrbitControls).
  //   look  – photo views: stand where the photo was taken and look around,
  //           with zoom changing the lens instead of walking into a wall.
  let mode = 'orbit';
  let currentView = null;

  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, {
    enableDamping: true,
    dampingFactor: 0.12,
    rotateSpeed: 0.9,
    zoomSpeed: 1.4,
    zoomToCursor: true,
    screenSpacePanning: true,
    minDistance: 120,
    maxDistance: 1400,
    maxPolarAngle: Math.PI / 2 - 0.02,
  });
  // Keep panning near the room so it can't be lost off-screen.
  controls.addEventListener('change', () => {
    const t = controls.target;
    t.set(THREE.MathUtils.clamp(t.x, -60, R + 60), THREE.MathUtils.clamp(t.y, 0, H), THREE.MathUtils.clamp(t.z, -60, R + 60));
  });

  const look = { yaw: 0, pitch: 0, minFov: 25, maxFov: 95 };
  function applyLook() {
    look.pitch = THREE.MathUtils.clamp(look.pitch, -1.25, 1.25);
    const dir = new THREE.Vector3(
      Math.sin(look.yaw) * Math.cos(look.pitch),
      Math.sin(look.pitch),
      Math.cos(look.yaw) * Math.cos(look.pitch),
    );
    camera.lookAt(camera.position.clone().add(dir));
  }
  function lookAtPoint(p) {
    const d = p.clone().sub(camera.position);
    look.yaw = Math.atan2(d.x, d.z);
    look.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
    applyLook();
  }
  function setFov(f) {
    camera.fov = THREE.MathUtils.clamp(f, look.minFov, look.maxFov);
    camera.updateProjectionMatrix();
  }

  const VIEWS = {
    overview: { pos: [R + 260, 470, R + 330], target: [R / 2, 40, R / 2], fov: 50 },
    top: { pos: [R / 2, 720, R / 2 + 1], target: [R / 2, 0, R / 2], fov: 45 },
  };

  let tween = null;
  function setView(v) {
    currentView = v;
    tween = null;
    camera.fov = v.fov || 78;
    camera.updateProjectionMatrix();
    camera.position.set(...v.pos);
    const inside = v.pos[0] > 0 && v.pos[0] < R && v.pos[2] > 0 && v.pos[2] < R && v.pos[1] < H;
    mode = inside ? 'look' : 'orbit';
    controls.enabled = mode === 'orbit';
    if (mode === 'orbit') {
      controls.target.set(...v.target);
      controls.update();
    } else {
      lookAtPoint(new THREE.Vector3(...v.target));
    }
    canvas.dataset.mode = mode;
    return mode;
  }
  setView(VIEWS.overview);

  // Look-mode input: drag to turn, wheel or pinch to zoom.
  const pointers = new Map();
  let pinch = null;
  canvas.addEventListener('pointerdown', e => {
    if (mode !== 'look') return;
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a[0] - b[0], a[1] - b[1]), fov: camera.fov };
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (mode !== 'look' || !pointers.has(e.pointerId)) return;
    const [px, py] = pointers.get(e.pointerId);
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 1) {
      // Scale by the lens so turning feels the same zoomed in or out.
      const k = (camera.fov * Math.PI) / 180 / canvas.clientHeight;
      look.yaw += (e.clientX - px) * k;
      look.pitch += (e.clientY - py) * k;
      applyLook();
    } else if (pinch) {
      const [a, b] = [...pointers.values()];
      setFov(pinch.fov * (pinch.dist / Math.max(Math.hypot(a[0] - b[0], a[1] - b[1]), 1)));
    }
  });
  const endPointer = e => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('wheel', e => {
    if (mode !== 'look') return;
    e.preventDefault();
    setFov(camera.fov * Math.exp(e.deltaY * 0.0012));
  }, { passive: false });

  // Shared actions for the on-screen buttons and keyboard.
  const spherical = new THREE.Spherical();
  const offset = new THREE.Vector3();
  function zoom(f) {
    if (mode === 'look') return setFov(camera.fov * f);
    offset.copy(camera.position).sub(controls.target);
    offset.setLength(THREE.MathUtils.clamp(offset.length() * f, controls.minDistance, controls.maxDistance));
    camera.position.copy(controls.target).add(offset);
  }
  function rotate(dYaw, dPitch) {
    if (mode === 'look') {
      look.yaw += dYaw;
      look.pitch += dPitch;
      return applyLook();
    }
    offset.copy(camera.position).sub(controls.target);
    spherical.setFromVector3(offset);
    spherical.theta += dYaw;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi - dPitch, 0.05, controls.maxPolarAngle);
    offset.setFromSpherical(spherical);
    camera.position.copy(controls.target).add(offset);
  }

  // Held buttons/keys apply a little every frame for smooth movement.
  const held = { zoom: 0, yaw: 0, pitch: 0 };
  function hold(action, dir) {
    held[action] = dir;
  }
  function applyHeld() {
    if (held.zoom) zoom(held.zoom > 0 ? 0.975 : 1 / 0.975);
    if (held.yaw || held.pitch) rotate(held.yaw * 0.025, held.pitch * 0.018);
  }

  const KEYS = {
    ArrowLeft: ['yaw', 1], ArrowRight: ['yaw', -1], ArrowUp: ['pitch', 1], ArrowDown: ['pitch', -1],
    '+': ['zoom', 1], '=': ['zoom', 1], '-': ['zoom', -1], _: ['zoom', -1],
  };
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', e => {
    const k = KEYS[e.key];
    if (!k) return;
    e.preventDefault();
    hold(...k);
  });
  canvas.addEventListener('keyup', e => {
    const k = KEYS[e.key];
    if (k) hold(k[0], 0);
  });
  canvas.addEventListener('blur', () => Object.keys(held).forEach(k => (held[k] = 0)));

  // Double-click a piece to zoom to it.
  function focusOn(g) {
    const box = new THREE.Box3().setFromObject(g);
    const center = box.getCenter(new THREE.Vector3());
    if (mode === 'look') {
      lookAtPoint(center);
      return setFov(45);
    }
    const size = box.getSize(new THREE.Vector3()).length();
    const dir = camera.position.clone().sub(controls.target).normalize();
    tween = {
      t: 0,
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toTarget: center,
      toPos: center.clone().add(dir.multiplyScalar(Math.max(size * 1.6, controls.minDistance + 30))),
    };
  }
  function stepTween() {
    if (!tween) return;
    tween.t = Math.min(tween.t + 0.06, 1);
    const e = 1 - Math.pow(1 - tween.t, 3);
    camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
    controls.target.lerpVectors(tween.fromTarget, tween.toTarget, e);
    if (tween.t === 1) tween = null;
  }
  controls.addEventListener('start', () => (tween = null));

  // Selection outline
  let outline = null;
  function select(id) {
    if (outline) {
      scene.remove(outline);
      outline.geometry.dispose();
      outline = null;
    }
    const g = id && groups.get(id);
    if (g) {
      outline = new THREE.BoxHelper(g, '#ffb100');
      scene.add(outline);
    }
  }

  const ray = new THREE.Raycaster();
  function pieceAt(e) {
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObjects(pieces.children, true)[0];
    let o = hit && hit.object;
    while (o && !o.userData.piece) o = o.parent;
    return o || null;
  }
  let down = null;
  canvas.addEventListener('pointerdown', e => (down = [e.clientX, e.clientY]));
  canvas.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const g = pieceAt(e);
    const piece = g ? g.userData.piece : null;
    select(piece && piece.id);
    onSelect && onSelect(piece);
  });
  canvas.addEventListener('dblclick', e => {
    const g = pieceAt(e);
    if (g) focusOn(g);
  });

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  let running = true;
  function loop() {
    if (running) {
      resize();
      applyHeld();
      stepTween();
      if (mode === 'orbit') controls.update();
      updateCutaway(camera);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(loop);
  }
  loop();

  // Off-screen renderer for "after" snapshots that match each photo.
  let snapRenderer = null;
  function snapshot(view, w = 1400, h = 1050) {
    if (!snapRenderer) {
      snapRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      snapRenderer.shadowMap.enabled = true;
      snapRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
      snapRenderer.toneMapping = renderer.toneMapping;
      snapRenderer.toneMappingExposure = renderer.toneMappingExposure;
    }
    snapRenderer.setSize(w, h, false);
    const cam = new THREE.PerspectiveCamera(view.fov || 80, w / h, 1, 5000);
    cam.position.set(...view.pos);
    cam.lookAt(...view.target);
    if (outline) outline.visible = false;
    updateCutaway(cam);
    snapRenderer.render(scene, cam);
    updateCutaway(camera);
    if (outline) outline.visible = true;
    return snapRenderer.domElement.toDataURL('image/jpeg', 0.9);
  }

  return {
    views: VIEWS,
    setView,
    hold,
    reset: () => currentView && setView(currentView),
    select,
    snapshot,
    setWallColor: c => wallMat.color.set(c),
    setVisible(kind, on) {
      for (const g of groups.values()) if (g.userData.piece.kind === kind) g.visible = on;
    },
    pause: v => (running = !v),
  };
}
