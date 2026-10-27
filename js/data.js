// Room + design data. Single source of truth for the 3D render, floor plan,
// wall elevations and shopping list.
//
// Coordinate system (all values in centimetres):
//   x: west wall (0) -> east wall (ROOM.size)
//   z: north wall (0) -> south wall (ROOM.size)
//   y: floor (0) -> ceiling (ROOM.height)
//
// Layout taken from the four photos:
//   North wall – centred double window (photo 2)
//   East wall  – the long blank wall where the TV hangs today (photo 1)
//   South wall – entry door near the east corner, double closet doors (photo 4)
//   West wall  – the gallery wall (photo 3)

export const FT = 30.48;

export const ROOM = {
  size: 11 * FT, // 11 ft x 11 ft
  height: 8 * FT, // assumed 8 ft ceiling
  // 69.5 in wide (measured), centred on the wall; sill and head heights are estimates.
  window: { x0: 11 * FT / 2 - (69.5 * 2.54) / 2, x1: 11 * FT / 2 + (69.5 * 2.54) / 2, sill: 70, head: 215 },
  closet: { x0: 25, x1: 180, head: 205, leaf: 77 }, // two leaves, swing into room
  entry: { x0: 240, x1: 322, head: 205, hingeX: 322 }, // hinged on east jamb
  switchX: 231,
};

export const ZONES = {
  window: { name: 'Window Seat & Hand-Embroidery Nook', wall: 'North wall', color: '#c58b5a' },
  machine: { name: 'Machine Embroidery Station', wall: 'East wall', color: '#5a8fc5' },
  supply: { name: 'Beading, Jewelry & Art Supply Wall', wall: 'West wall', color: '#7fae6b' },
  center: { name: 'Cutting / Beading Table', wall: 'Room centre', color: '#b77fc4' },
  closet: { name: 'Closet & Door Wall', wall: 'South wall', color: '#c5b25a' },
};

// Shopping list. Prices are rough US estimates for budgeting only –
// IKEA prices and availability change, always confirm on ikea.com.
export const PRODUCTS = [
  // --- Window seat -------------------------------------------------------
  { key: 'besta-frame', zone: 'window', name: 'BESTÅ frame', spec: 'white, 120×40×38 cm', qty: 2, price: 70,
    why: 'Base of the window seat: 240 cm (94.5″) wide, centred under the 69.5″ window with about 12.5″ to spare on each side. Set directly on the floor (no legs) and fix to the wall so the seat lands at ~46 cm with the cushion.' },
  { key: 'besta-drawer', zone: 'window', name: 'BESTÅ drawer frame', spec: 'white, for 60 cm wide sections', qty: 4, price: 20,
    why: 'Four deep drawers under the seat for hand-embroidery hoops, floss boxes and projects in progress.' },
  { key: 'besta-runner', zone: 'window', name: 'BESTÅ push-open drawer runner', spec: '1 pair per drawer', qty: 4, price: 15,
    why: 'Handle-free fronts so nothing snags your legs while sitting.' },
  { key: 'lappviken', zone: 'window', name: 'LAPPVIKEN drawer front', spec: 'white, 60×38 cm', qty: 4, price: 15,
    why: 'Clean flat fronts that read as a built-in.' },
  { key: 'bench-cushion', zone: 'window', name: 'Bench / seat cushion', spec: 'IKEA bench-pad range, ~120 cm long', qty: 2, search: 'bench cushion', price: 40,
    why: 'One cushion per 120 cm BESTÅ section. Measure the frames before buying – sizes vary by range.' },
  { key: 'fjadermott', zone: 'window', name: 'FJÄDERMOTT inner cushion', spec: '50×50 cm', qty: 3, price: 10,
    why: 'Back support against the window wall.' },
  { key: 'gurli', zone: 'window', name: 'GURLI cushion cover', spec: '50×50 cm', qty: 3, price: 5,
    why: 'Washable covers – easy to swap, or embroider your own later.' },
  { key: 'hilja', zone: 'window', name: 'HILJA curtains, 1 pair', spec: 'white, light-filtering', qty: 1, price: 20,
    why: 'Softens glare but keeps the daylight that hand embroidery needs.' },
  { key: 'racka', zone: 'window', name: 'RÄCKA curtain rod combination', spec: 'extendable, 210–385 cm', qty: 1, price: 25,
    why: 'The window is 69.5″ (177 cm) wide, so mount the rod ~110″ (280 cm) wide so the curtains stack beside the glass, not over it.' },
  { key: 'hektar-floor', zone: 'window', name: 'HEKTAR floor lamp', spec: 'dark grey', qty: 1, price: 70,
    why: 'Adjustable task light over your shoulder for evening hand work.' },

  // --- Machine embroidery station -----------------------------------------
  { key: 'karlby', zone: 'machine', name: 'KARLBY countertop', spec: '186×63.5×3.8 cm', qty: 1, price: 170,
    why: 'Solid, deep, vibration-resistant top. 63.5 cm depth leaves room behind the machine for the embroidery arm and hoop to travel.' },
  { key: 'alex-small', zone: 'machine', name: 'ALEX drawer unit', spec: 'white, 36×70 cm (5 drawers)', qty: 2, price: 110,
    why: 'Legs of the desk. Bobbins, needles, stabilizer sheets, presser feet, USB sticks with designs.' },
  { key: 'skadis-76', zone: 'machine', name: 'SKÅDIS pegboard', spec: 'white, 76×56 cm', qty: 2, price: 25,
    why: 'Hoops of every size hang within reach, plus scissors, tweezers and snips.' },
  { key: 'skadis-hook', zone: 'machine', name: 'SKÅDIS hook', spec: '5-pack', qty: 4, price: 5,
    why: 'Hoop hangers and tool hooks.' },
  { key: 'skadis-container', zone: 'machine', name: 'SKÅDIS container with lid', spec: '', qty: 4, price: 6,
    why: 'Bobbins, needles, small notions.' },
  { key: 'skadis-shelf', zone: 'machine', name: 'SKÅDIS shelf', spec: '', qty: 2, price: 10,
    why: 'Short shelves on the pegboard for spray adhesive and marking tools.' },
  { key: 'lack-shelf', zone: 'machine', name: 'LACK wall shelf', spec: 'white, 110×26 cm', qty: 1, price: 30,
    why: 'Thread cones in rainbow order above the pegboards.' },
  { key: 'tertial', zone: 'machine', name: 'TERTIAL work lamp', spec: 'dark grey', qty: 2, price: 20,
    why: 'Clamp-on task light aimed at the needle area of each machine.' },
  { key: 'langfjall', zone: 'machine', name: 'LÅNGFJÄLL office chair', spec: 'with armrests', qty: 1, price: 230,
    why: 'Height-adjustable so your elbows sit at machine bed height.' },

  // --- Supply wall --------------------------------------------------------
  { key: 'kallax', zone: 'supply', name: 'KALLAX shelf unit', spec: 'white, 147×147 cm (4×4)', qty: 1, price: 140,
    why: 'Main supply wall: art supplies, fabric, yarn, paper pads, books.' },
  { key: 'kallax-drawers', zone: 'supply', name: 'KALLAX insert with 2 drawers', spec: 'white', qty: 2, price: 40,
    why: 'Paints, markers, pastels – messy things out of sight.' },
  { key: 'kallax-door', zone: 'supply', name: 'KALLAX insert with door', spec: 'white', qty: 2, price: 30,
    why: 'Dust-free storage for finished pieces and good fabric.' },
  { key: 'drona', zone: 'supply', name: 'DRÖNA box', spec: '33×38×33 cm', qty: 6, price: 5,
    why: 'Grab-and-go bins: yarn, felt, scraps, stuffing.' },
  { key: 'tjena', zone: 'supply', name: 'TJENA magazine file, 2-pack', spec: 'white', qty: 3, price: 5,
    why: 'Patterns, design printouts and catalogues on the open cubes.' },
  { key: 'alex-9', zone: 'supply', name: 'ALEX drawer unit', spec: 'white, 36×116 cm (9 drawers)', qty: 2, price: 160,
    why: 'Shallow drawers are ideal for beads and jewelry findings – one unit for beads, one for jewelry making (chains, clasps, wire, pliers).' },
  { key: 'kuggis-small', zone: 'supply', name: 'KUGGIS box with lid', spec: '13×18×8 cm', qty: 12, price: 4,
    why: 'Sort beads by colour/size inside the ALEX drawers. Measure drawer height before buying.' },
  { key: 'mosslanda', zone: 'supply', name: 'MOSSLANDA picture ledge', spec: 'white, 115 cm', qty: 1, price: 15,
    why: 'Above the KALLAX – rotate finished hoops and art on display.' },

  // --- Centre table ------------------------------------------------------
  { key: 'norden', zone: 'center', name: 'NORDEN gateleg table', spec: 'white, 26/89/152×80 cm', qty: 1, price: 250,
    why: 'Folds to 26 cm when you need floor space, opens to 152 cm for cutting fabric, laying out beading or big art. Drawers in the middle for rotary cutters and rulers.' },
  { key: 'teodores', zone: 'center', name: 'TEODORES chair', spec: 'white', qty: 2, price: 35,
    why: 'Light, wipeable chairs that tuck under the table.' },
  { key: 'raskog', zone: 'center', name: 'RÅSKOG utility cart', spec: 'white, 35×45×78 cm', qty: 1, price: 40,
    why: 'Rolling caddy – roll it to the window seat for hand embroidery, or to the table for beading.' },
  { key: 'lohals', zone: 'center', name: 'LOHALS rug, flatwoven', spec: 'natural, 160×230 cm', qty: 1, price: 80,
    why: 'Flat weave so chairs roll and dropped beads are easy to find (unlike shag).' },

  // --- Closet / door wall ------------------------------------------------
  { key: 'boaxel', zone: 'closet', name: 'BOAXEL wall uprights, brackets & shelves', spec: 'white, sized to closet', qty: 1, search: 'BOAXEL', price: 180,
    why: 'Turns the closet into bulk storage: stabilizer rolls, batting, fabric bolts, machine cases. Measure closet width/depth, then use IKEA’s BOAXEL planner.' },
  { key: 'kuggis-large', zone: 'closet', name: 'KUGGIS storage box with lid', spec: '26×35×15 cm', qty: 6, search: 'KUGGIS', price: 10,
    why: 'Labelled boxes on the BOAXEL shelves: stabilizers by type, interfacing, seasonal projects.' },
  { key: 'skadis-36', zone: 'closet', name: 'SKÅDIS pegboard', spec: 'white, 36×56 cm', qty: 1, price: 15,
    why: 'Fits the strip of wall between the closet and entry door: rulers, cutting mats, big shears.' },
];

// Things drawn in the render. `p` links a piece back to PRODUCTS.
// Footprint is [x0, z0] -> [x1, z1]; heights are y0 -> y1.
const R = ROOM.size;
export const PIECES = [
  // North – window seat (2 × BESTÅ 120 centred on the window)
  { id: 'seat-w', p: 'besta-frame', kind: 'besta', x0: 47.5, z0: 0, x1: 167.5, z1: 40, y0: 0, y1: 38 },
  { id: 'seat-e', p: 'besta-frame', kind: 'besta', x0: 167.5, z0: 0, x1: 287.5, z1: 40, y0: 0, y1: 38 },
  { id: 'cush-w', p: 'bench-cushion', kind: 'cushion', x0: 48.5, z0: 1, x1: 166.5, z1: 40, y0: 38, y1: 46 },
  { id: 'cush-e', p: 'bench-cushion', kind: 'cushion', x0: 168.5, z0: 1, x1: 286.5, z1: 40, y0: 38, y1: 46 },
  { id: 'pil-1', p: 'fjadermott', kind: 'pillow', x0: 60, z0: 2, x1: 108, z1: 16, y0: 46, y1: 92, color: '#d9c7b3' },
  { id: 'pil-2', p: 'fjadermott', kind: 'pillow', x0: 143, z0: 2, x1: 191, z1: 16, y0: 46, y1: 92, color: '#a77aa4' },
  { id: 'pil-3', p: 'fjadermott', kind: 'pillow', x0: 226, z0: 2, x1: 274, z1: 16, y0: 46, y1: 92, color: '#d9c7b3' },
  { id: 'curtain-w', p: 'hilja', kind: 'curtain', x0: 34, z0: 4, x1: 76, z1: 9, y0: 50, y1: 228 },
  { id: 'curtain-e', p: 'hilja', kind: 'curtain', x0: 259, z0: 4, x1: 301, z1: 9, y0: 50, y1: 228 },
  { id: 'rod', p: 'racka', kind: 'rod', x0: 28, z0: 5, x1: 307, z1: 8, y0: 228, y1: 230 },
  { id: 'floorlamp', p: 'hektar-floor', kind: 'floorlamp', x0: 297, z0: 8, x1: 327, z1: 38, y0: 0, y1: 160 },

  // East – machine embroidery station
  { id: 'alex-n', p: 'alex-small', kind: 'alex', x0: R - 58, z0: 52, x1: R, z1: 88, y0: 0, y1: 70, drawers: 5, face: 'w' },
  { id: 'alex-s', p: 'alex-small', kind: 'alex', x0: R - 58, z0: 202, x1: R, z1: 238, y0: 0, y1: 70, drawers: 5, face: 'w' },
  { id: 'karlby', p: 'karlby', kind: 'top', x0: R - 63.5, z0: 52, x1: R, z1: 238, y0: 70, y1: 73.8 },
  { id: 'skadis-1', p: 'skadis-76', kind: 'skadis', x0: R - 2, z0: 66, x1: R, z1: 142, y0: 100, y1: 156, face: 'w' },
  { id: 'skadis-2', p: 'skadis-76', kind: 'skadis', x0: R - 2, z0: 148, x1: R, z1: 224, y0: 100, y1: 156, face: 'w' },
  { id: 'lack', p: 'lack-shelf', kind: 'shelf', x0: R - 26, z0: 90, x1: R, z1: 200, y0: 172, y1: 177, spools: 'w' },
  { id: 'tertial-1', p: 'tertial', kind: 'tertial', x0: R - 14, z0: 92, x1: R - 4, z1: 102, y0: 73.8, y1: 125, aim: [-40, 0] },
  { id: 'tertial-2', p: 'tertial', kind: 'tertial', x0: R - 14, z0: 186, x1: R - 4, z1: 196, y0: 73.8, y1: 125, aim: [-40, 0] },
  { id: 'machine-1', p: null, prop: 'Your embroidery machine', kind: 'machine', x0: R - 52, z0: 100, x1: R - 12, z1: 150, y0: 73.8, y1: 106 },
  { id: 'machine-2', p: null, prop: 'Your sewing machine', kind: 'machine', x0: R - 48, z0: 160, x1: R - 18, z1: 200, y0: 73.8, y1: 103 },
  { id: 'chair-office', p: 'langfjall', kind: 'officechair', x0: 205, z0: 120, x1: 260, z1: 175, y0: 0, y1: 110, face: 'e' },

  // West – supply wall
  { id: 'kallax', p: 'kallax', kind: 'kallax', x0: 0, z0: 4, x1: 39, z1: 151, y0: 0, y1: 147, face: 'e' },
  { id: 'alex9-1', p: 'alex-9', kind: 'alex', x0: 0, z0: 156, x1: 48, z1: 192, y0: 0, y1: 116, drawers: 9, face: 'e' },
  { id: 'alex9-2', p: 'alex-9', kind: 'alex', x0: 0, z0: 196, x1: 48, z1: 232, y0: 0, y1: 116, drawers: 9, face: 'e' },
  { id: 'mosslanda', p: 'mosslanda', kind: 'ledge', x0: 0, z0: 20, x1: 9, z1: 135, y0: 175, y1: 179, frames: 'e' },

  // Centre
  { id: 'rug', p: 'lohals', kind: 'rug', x0: 62, z0: 50, x1: 222, z1: 280, y0: 0, y1: 0.8 },
  // One leaf raised (89 cm); the drawer section sits at the east end.
  { id: 'norden', p: 'norden', kind: 'norden', x0: 95, z0: 110, x1: 184, z1: 190, y0: 0, y1: 74 },
  { id: 'chair-1', p: 'teodores', kind: 'chair', x0: 117, z0: 196, x1: 160, z1: 240, y0: 0, y1: 80, face: 'n' },
  { id: 'chair-2', p: 'teodores', kind: 'chair', x0: 60, z0: 128, x1: 102, z1: 172, y0: 0, y1: 80, face: 'e' },
  { id: 'raskog', p: 'raskog', kind: 'cart', x0: 190, z0: 250, x1: 225, z1: 295, y0: 0, y1: 78 },

  // South – closet & door wall
  { id: 'skadis-door', p: 'skadis-36', kind: 'skadis', x0: 190, z0: R - 2, x1: 226, z1: R, y0: 100, y1: 156, face: 'n' },
];

// Camera presets that match where each photo was taken from.
export const PHOTO_VIEWS = [
  { n: 1, title: 'Photo 1 – East wall (TV wall)', becomes: 'Machine embroidery station',
    pos: [42, 160, 190], target: [R, 100, 140] },
  { n: 2, title: 'Photo 2 – North wall (window)', becomes: 'Window seat with storage',
    pos: [190, 150, 325], target: [165, 110, 0] },
  { n: 3, title: 'Photo 3 – West wall (gallery wall)', becomes: 'Beading, jewelry & art supply wall',
    pos: [320, 155, 270], target: [0, 115, 120] },
  { n: 4, title: 'Photo 4 – South wall (doors)', becomes: 'Closet storage & tool board',
    pos: [175, 150, 20], target: [175, 110, R] },
];

export const WALL_COLORS = [
  { name: 'Current plum', value: '#4b2d5a' },
  { name: 'Soft lavender', value: '#b9a6c9' },
  { name: 'Warm white', value: '#ece6dc' },
  { name: 'Sage', value: '#a9b79c' },
];

export const productByKey = Object.fromEntries(PRODUCTS.map(p => [p.key, p]));

export function ikeaUrl(p) {
  const q = p.search || p.name.split(/[ ,]/)[0];
  return `https://www.ikea.com/us/en/search/?q=${encodeURIComponent(q)}`;
}
