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
  { key: 'besta-frame', only: 'a', url: 'https://www.ikea.com/us/en/p/besta-frame-white-60245844/', zone: 'window', name: 'BESTÅ frame', spec: 'white, 47¼×15¾×15″', qty: 2, price: 70,
    why: 'Base of the window seat: 94½″ wide, centred under the 69½″ window with about 12½″ to spare on each side. Set directly on the floor (no legs) and fix to the wall so the seat lands at about 18″ with the cushion.' },
  { key: 'besta-drawer', only: 'a', url: 'https://www.ikea.com/us/en/p/besta-drawer-frame-white-80351517/', zone: 'window', name: 'BESTÅ drawer frame', spec: 'white, 23⅝×9⅞×15¾″ (fits a 23⅝″ wide section)', qty: 4, price: 20,
    why: 'Four deep drawers under the seat for hand-embroidery hoops, floss boxes and projects in progress.' },
  { key: 'besta-runner', only: 'a', url: 'https://www.ikea.com/us/en/p/besta-drawer-runner-push-open-30488315/', zone: 'window', name: 'BESTÅ push-open drawer runner', spec: '1 pair per drawer', qty: 4, price: 15,
    why: 'Handle-free fronts so nothing snags your legs while sitting.' },
  { key: 'lappviken', only: 'a', url: 'https://www.ikea.com/us/en/p/lappviken-door-drawer-front-white-00291674/', zone: 'window', name: 'LAPPVIKEN drawer front', spec: 'white, 23⅝×15″', qty: 4, price: 15,
    why: 'Clean flat fronts that read as a built-in.' },
  { key: 'bench-cushion', only: 'a', url: 'https://www.ikea.com/us/en/p/kuddarna-bench-pad-outdoor-light-grey-beige-80584183/', zone: 'window', name: 'KUDDARNA bench pad', spec: 'light grey-beige, 47¼×15¾″', qty: 2, price: 40,
    why: 'One pad per 47¼″ BESTÅ section – the same length and depth as the frame. Sold as an outdoor pad, so it wipes clean.' },
  { key: 'fjadermott', only: 'a', url: 'https://www.ikea.com/us/en/p/fjaedrar-inner-cushion-off-white-60262188/', zone: 'window', name: 'FJÄDRAR inner cushion', spec: 'off-white, 20×20″', qty: 3, price: 10,
    why: 'Back support against the window wall.' },
  { key: 'gurli', only: 'a', url: 'https://www.ikea.com/us/en/p/gurli-cushion-cover-white-60598727/', zone: 'window', name: 'GURLI cushion cover', spec: 'white, 20×20″ (other colours available)', qty: 3, price: 5,
    why: 'Washable covers – easy to swap, or embroider your own later.' },
  { key: 'hilja', only: 'a', url: 'https://www.ikea.com/us/en/p/hilja-curtains-1-pair-white-50430818/', zone: 'window', name: 'HILJA curtains, 1 pair', spec: 'white, light-filtering', qty: 1, price: 20,
    why: 'Softens glare but keeps the daylight that hand embroidery needs.' },
  { key: 'racka', only: 'a', url: 'https://www.ikea.com/us/en/p/raecka-curtain-rod-combination-with-wall-ceiling-brackets-with-finials-white-s09634074/', zone: 'window', name: 'RÄCKA curtain rod combination', spec: 'white, with finials, 82¾–151½″', qty: 1, price: 25,
    why: 'The window is 69½″ wide, so mount the rod about 110″ wide so the curtains stack beside the glass, not over it.' },
  { key: 'hektar-floor', only: 'a', url: 'https://www.ikea.com/us/en/p/hektar-floor-lamp-with-3-spotlights-dark-gray-40393618/', zone: 'window', name: 'HEKTAR floor lamp with 3 spotlights', spec: 'dark gray', qty: 1, price: 70,
    why: 'Adjustable task light over your shoulder for evening hand work.' },

  // --- Machine embroidery station -----------------------------------------
  { key: 'karlby', only: 'a', url: 'https://www.ikea.com/us/en/p/karlby-countertop-oak-veneer-70335207/', zone: 'machine', name: 'KARLBY countertop', spec: 'oak veneer, 74×1½″', qty: 1, price: 170,
    why: 'Solid, deep, vibration-resistant top. About 25″ deep, which leaves room behind the machine for the embroidery arm and hoop to travel.' },
  { key: 'alex-small', only: 'a', url: 'https://www.ikea.com/us/en/p/alex-drawer-unit-white-00473546/', zone: 'machine', name: 'ALEX drawer unit', spec: 'white, 14⅛×27½″ (5 drawers)', qty: 2, price: 110,
    why: 'Legs of the desk. Bobbins, needles, stabilizer sheets, presser feet, USB sticks with designs.' },
  { key: 'skadis-76', only: 'a', url: 'https://www.ikea.com/us/en/p/skadis-pegboard-white-10321618/', zone: 'machine', name: 'SKÅDIS pegboard', spec: 'white, 30×22″', qty: 2, price: 25,
    why: 'Hoops of every size hang within reach, plus scissors, tweezers and snips.' },
  { key: 'skadis-hook', url: 'https://www.ikea.com/us/en/p/skadis-hook-white-20320802/', zone: 'machine', name: 'SKÅDIS hook', spec: '5-pack', qty: 4, price: 5,
    why: 'Hoop hangers and tool hooks.' },
  { key: 'skadis-container', url: 'https://www.ikea.com/us/en/p/skadis-container-with-lid-white-80335909/', zone: 'machine', name: 'SKÅDIS container with lid', spec: 'white, 3-pack', qty: 2, price: 8,
    why: 'Bobbins, needles, small notions.' },
  { key: 'skadis-shelf', url: 'https://www.ikea.com/us/en/p/skadis-shelf-white-00320799/', zone: 'machine', name: 'SKÅDIS shelf', spec: '', qty: 2, price: 10,
    why: 'Short shelves on the pegboard for spray adhesive and marking tools.' },
  { key: 'lack-shelf', url: 'https://www.ikea.com/us/en/p/lack-wall-shelf-white-90282180/', zone: 'machine', name: 'LACK wall shelf', spec: 'white, 43¼×10¼″', qty: 1, price: 30,
    why: 'Thread cones in rainbow order above the pegboards.' },
  { key: 'tertial', url: 'https://www.ikea.com/us/en/p/tertial-work-lamp-dark-gray-20355434/', zone: 'machine', name: 'TERTIAL work lamp', spec: 'dark gray', qty: 2, price: 20,
    why: 'Clamp-on task light aimed at the needle area of each machine.' },
  { key: 'langfjall', url: 'https://www.ikea.com/us/en/p/langfjaell-conference-chair-with-armrests-gunnared-beige-white-s89252768/', zone: 'machine', name: 'LÅNGFJÄLL chair with armrests', spec: 'Gunnared beige/white', qty: 1, price: 230,
    why: 'Set the seat so your elbows sit at machine-bed height. IKEA US lists this as a conference chair – check its height range and base on the product page.' },

  // --- Supply wall --------------------------------------------------------
  { key: 'kallax', only: 'a', url: 'https://www.ikea.com/us/en/p/kallax-shelf-unit-white-10637302/', zone: 'supply', name: 'KALLAX shelf unit', spec: 'white, 57⅞×57⅞″ (4×4)', qty: 1, price: 140,
    why: 'Main supply wall: art supplies, fabric, yarn, paper pads, books.' },
  { key: 'kallax-drawers', only: 'a', url: 'https://www.ikea.com/us/en/p/kallax-insert-with-2-drawers-white-70286645/', zone: 'supply', name: 'KALLAX insert with 2 drawers', spec: 'white', qty: 2, price: 40,
    why: 'Paints, markers, pastels – messy things out of sight.' },
  { key: 'kallax-door', only: 'a', url: 'https://www.ikea.com/us/en/p/kallax-insert-with-door-white-20278167/', zone: 'supply', name: 'KALLAX insert with door', spec: 'white', qty: 2, price: 30,
    why: 'Dust-free storage for finished pieces and good fabric.' },
  { key: 'drona', only: 'a', url: 'https://www.ikea.com/us/en/p/droena-box-white-30574006/', zone: 'supply', name: 'DRÖNA box', spec: 'white, 13×15×13″ (other colours available)', qty: 6, price: 5,
    why: 'Grab-and-go bins: yarn, felt, scraps, stuffing.' },
  { key: 'tjena', only: 'a', url: 'https://www.ikea.com/us/en/p/tjena-magazine-file-white-black-dotted-00601054/', zone: 'supply', name: 'TJENA magazine file, 2-pack', spec: 'white/black dotted', qty: 3, price: 5,
    why: 'Patterns, design printouts and catalogues on the open cubes.' },
  { key: 'alex-9', only: 'a', url: 'https://www.ikea.com/us/en/p/alex-drawer-unit-with-9-drawers-white-90486139/', zone: 'supply', name: 'ALEX drawer unit', spec: 'white, 14⅛×45⅝″ (9 drawers)', qty: 2, price: 160,
    why: 'Shallow drawers are ideal for beads and jewelry findings – one unit for beads, one for jewelry making (chains, clasps, wire, pliers).' },
  { key: 'kuggis-small', only: 'a', url: 'https://www.ikea.com/us/en/p/kuggis-box-with-lid-white-s99561153/', zone: 'supply', name: 'KUGGIS box with lid', spec: 'white, 5×7×3¼″', qty: 12, price: 4,
    why: 'Sort beads by colour/size inside the ALEX drawers. Measure drawer height before buying.' },
  { key: 'mosslanda', only: 'a', url: 'https://www.ikea.com/us/en/p/mosslanda-picture-ledge-white-90292103/', zone: 'supply', name: 'MOSSLANDA picture ledge', spec: 'white, 45¼″', qty: 1, price: 15,
    why: 'Above the KALLAX – rotate finished hoops and art on display.' },

  // --- Centre table ------------------------------------------------------
  { key: 'norden', url: 'https://www.ikea.com/us/en/p/norden-gateleg-table-white-10423886/', zone: 'center', name: 'NORDEN gateleg table', spec: 'white, 10¼/35/59⅞×31½″', qty: 1, price: 250,
    why: 'Folds to 10¼″ when you need floor space, opens to 59⅞″ for cutting fabric, laying out beading or big art. Drawers in the middle for rotary cutters and rulers.' },
  { key: 'teodores', url: 'https://www.ikea.com/us/en/p/teodores-chair-white-30486156/', zone: 'center', name: 'TEODORES chair', spec: 'white', qty: 2, price: 35,
    why: 'Light, wipeable chairs that tuck under the table.' },
  { key: 'raskog', url: 'https://www.ikea.com/us/en/p/raskog-utility-cart-white-30586783/', zone: 'center', name: 'RÅSKOG utility cart', spec: 'white, 13¾×17¾×30⅜″', qty: 1, price: 40,
    why: 'Rolling caddy – roll it to the window seat for hand embroidery, or to the table for beading.' },
  { key: 'lohals', url: 'https://www.ikea.com/us/en/p/lohals-rug-flatwoven-natural-50277393/', zone: 'center', name: 'LOHALS rug, flatwoven', spec: 'natural, 5′3″×7′7″', qty: 1, price: 80,
    why: 'Flat weave so chairs roll and dropped beads are easy to find (unlike shag).' },

  // --- Closet / door wall ------------------------------------------------
  { key: 'boaxel', url: 'https://www.ikea.com/us/en/cat/boaxel-storage-combinations-47396/', zone: 'closet', name: 'BOAXEL storage combination', spec: 'white, sized to closet', qty: 1, price: 180,
    why: 'Turns the closet into bulk storage: stabilizer rolls, batting, fabric bolts, machine cases. Measure closet width/depth, then use IKEA’s BOAXEL planner.' },
  { key: 'kuggis-large', url: 'https://www.ikea.com/us/en/p/kuggis-box-with-lid-white-s59561188/', zone: 'closet', name: 'KUGGIS box with lid', spec: 'white, 10¼×13¾×6″', qty: 6, price: 10,
    why: 'Labelled boxes on the BOAXEL shelves: stabilizers by type, interfacing, seasonal projects.' },
  { key: 'skadis-36', url: 'https://www.ikea.com/us/en/p/skadis-pegboard-white-50320805/', zone: 'closet', name: 'SKÅDIS pegboard', spec: 'white, 14¼×22″', qty: 1, price: 15,
    why: 'Fits the strip of wall between the closet and entry door: rulers, cutting mats, big shears.' },

  // ======================================================================
  // Option 2 – "Your KALLAX design" (IKEA planner design 3476KNP), fitted to
  // this room, plus the BILLY bookcase with foldable table. Prices for the
  // design pieces and BILLY are IKEA US list prices at the time of planning.
  // ======================================================================
  { key: 'kallax-2x4', only: 'b', url: 'https://www.ikea.com/us/en/p/kallax-shelf-unit-white-20631663/', zone: 'window', name: 'KALLAX shelf unit', spec: 'white, 30⅛×57⅝″ (2×4)', qty: 2, price: 79.99,
    why: 'From your design: the two towers either side of the window. Each is 30⅛″ wide; the wall beside the window casing is 28½″, so stand them ¾″ off the wall to clear the casing (they overlap it by 1⅝″, not the glass). Anchor both to the wall.' },
  { key: 'kallax-1x4', only: 'b', url: 'https://www.ikea.com/us/en/p/kallax-shelf-unit-white-40631638/', zone: 'window', name: 'KALLAX shelf unit', spec: 'white, 16⅜×57⅝″ (1×4)', qty: 2, price: 59.99,
    why: 'From your design: one laid on its side under the window as the 57⅝″ bench (16¼″ tall, about 19″ with the pad), one standing upright on the west wall next to the desk.' },
  { key: 'kallax-bottles', only: 'b', url: 'https://www.ikea.com/us/en/p/kallax-insert-for-bottles-white-80401292/', zone: 'window', name: 'KALLAX insert for bottles', spec: 'white, 13×13″', qty: 2, price: 25,
    why: 'From your design (east tower, top two cubes). The diagonal cubbies hold rolled fabric, stabilizer rolls, yarn and paper rolls.' },
  { key: 'kallax-shelf1', only: 'b', url: 'https://www.ikea.com/us/en/p/kallax-insert-with-1-shelf-white-20423720/', zone: 'window', name: 'KALLAX insert with 1 shelf', spec: 'white, 13×13″', qty: 2, price: 20,
    why: 'From your design (east tower, top two cubes). Splits each cube in half for thread boxes and paint bottles.' },
  { key: 'kallax-shelf4', only: 'b', url: 'https://www.ikea.com/us/en/p/kallax-insert-with-4-shelves-white-40423719/', zone: 'window', name: 'KALLAX insert with 4 shelves', spec: 'white, 13×13″', qty: 4, price: 30,
    why: 'From your design (west tower, left column). Thin shelves for paper, fat quarters, felt sheets and patterns.' },
  { key: 'kuggis-cube', only: 'b', url: 'https://www.ikea.com/us/en/p/kuggis-storage-box-with-lid-white-00526875/', zone: 'window', name: 'KUGGIS storage box with lid', spec: 'white, 12½×12½×12½″', qty: 4, price: 29.99,
    why: 'From your design: the four cubes of the window bench. Hand-embroidery hoops, floss and works in progress, right where you sit.' },
  { key: 'kuddarna-b', only: 'b', url: 'https://www.ikea.com/us/en/p/kuddarna-bench-pad-outdoor-light-grey-beige-80584183/', zone: 'window', name: 'KUDDARNA bench pad', spec: 'light grey-beige, 47¼×15¾″', qty: 1, price: 30,
    why: 'Added: one pad centred on the 57⅝″ bench leaves 5″ at each end for the pillows.' },
  { key: 'fjadermott-b', only: 'b', url: 'https://www.ikea.com/us/en/p/fjaedrar-inner-cushion-off-white-60262188/', zone: 'window', name: 'FJÄDRAR inner cushion', spec: 'off-white, 20×20″', qty: 2, price: 10,
    why: 'Added: back pillows at each end of the bench.' },
  { key: 'gurli-b', only: 'b', url: 'https://www.ikea.com/us/en/p/gurli-cushion-cover-white-60598727/', zone: 'window', name: 'GURLI cushion cover', spec: 'white, 20×20″ (other colours available)', qty: 2, price: 5,
    why: 'Added: washable covers for the bench pillows.' },
  { key: 'hoppvals', only: 'b', url: 'https://www.ikea.com/us/en/p/hoppvals-cellular-blind-white-70431402/', zone: 'window', name: 'HOPPVALS cellular blind', spec: 'white, 34×64″', qty: 2, price: 39.99,
    why: 'Added: one blind inside each half of the 69½″ window. The towers stand where curtains would stack, so blinds replace them. Measure each sash opening before buying.' },
  { key: 'drona-b', only: 'b', url: 'https://www.ikea.com/us/en/p/droena-box-white-30574006/', zone: 'window', name: 'DRÖNA box', spec: 'white, 13×15×13″', qty: 4, price: 5,
    why: 'Added: the open lower cubes of both towers – yarn, felt, scraps, stuffing.' },
  { key: 'tjena-b', only: 'b', url: 'https://www.ikea.com/us/en/p/tjena-magazine-file-white-black-dotted-00601054/', zone: 'window', name: 'TJENA magazine file, 2-pack', spec: 'white/black dotted', qty: 3, price: 5,
    why: 'Added: patterns and design printouts in three of the open cubes.' },
  { key: 'kallax-desk', only: 'b', url: 'https://www.ikea.com/us/en/p/kallax-desk-white-30582445/', zone: 'machine', name: 'KALLAX desk', spec: 'white, 43¾×15⅜″, 30⅜″ tall', qty: 2, price: 79.99,
    why: 'From your design: one on the east wall for the sewing machine, one on the west wall for beading and drawing. At 15⅜″ deep it is too shallow for an embroidery machine with its embroidery arm, which goes on the BILLY table instead.' },
  { key: 'kallax-desk-drawers', only: 'b', url: 'https://www.ikea.com/us/en/p/kallax-insert-with-2-drawers-wave-shaped-light-gray-blue-10592803/', zone: 'machine', name: 'KALLAX insert with 2 drawers', spec: 'wave shaped/light gray-blue, 13×13″', qty: 2, price: 25,
    why: 'From your design: the top cube of each desk – bobbins, needles, presser feet, bead tools.' },
  { key: 'kallax-desk-door', only: 'b', url: 'https://www.ikea.com/us/en/p/kallax-insert-with-door-wave-shaped-light-gray-blue-60592805/', zone: 'machine', name: 'KALLAX insert with door', spec: 'wave shaped/light gray-blue, 13×13″', qty: 2, price: 20,
    why: 'From your design: the bottom cube of each desk – manuals, machine feet in their cases.' },
  { key: 'billy-fold', only: 'b', url: 'https://www.ikea.com/us/en/p/billy-bookcase-with-foldable-table-white-00579755/', zone: 'machine', name: 'BILLY bookcase with foldable table', spec: 'white, 31½×12¾″ (44¼″ deep open)×41¾″', qty: 1, price: 180,
    why: 'The embroidery machine station: the table folds out 31½″ at 29¼″ high and holds up to 55 lb, giving the machine and hoop room to move; it folds back when you need floor space. Shelves below hold thread and stabilizer. Anchor it to the wall.' },
  { key: 'skadis-76-b', only: 'b', url: 'https://www.ikea.com/us/en/p/skadis-pegboard-white-10321618/', zone: 'machine', name: 'SKÅDIS pegboard', spec: 'white, 30×22″', qty: 3, price: 25,
    why: 'Added: two above the east desk and BILLY for hoops and snips, one above the west desk for pliers and bead tools.' },
  { key: 'kallax-lock', only: 'b', url: 'https://www.ikea.com/us/en/p/kallax-insert-with-lockable-door-white-40544274/', zone: 'supply', name: 'KALLAX insert with lockable door', spec: 'white, 13×13″', qty: 1, price: 25,
    why: 'From your design (bottom of the upright 1×4): rotary blades, craft knives and anything to keep away from children.' },
  { key: 'alex-9-b', only: 'b', url: 'https://www.ikea.com/us/en/p/alex-drawer-unit-with-9-drawers-white-90486139/', zone: 'supply', name: 'ALEX drawer unit', spec: 'white, 14⅛×45⅝″ (9 drawers)', qty: 1, price: 160,
    why: 'Added: shallow drawers for beads and jewelry findings, beside the west desk.' },
  { key: 'kuggis-small-b', only: 'b', url: 'https://www.ikea.com/us/en/p/kuggis-box-with-lid-white-s99561153/', zone: 'supply', name: 'KUGGIS box with lid', spec: 'white, 5×7×3¼″', qty: 6, price: 4,
    why: 'Added: sort beads by colour and size inside the ALEX drawers. Measure drawer height before buying.' },
];

// Things drawn in the render. `p` links a piece back to PRODUCTS.
// Footprint is [x0, z0] -> [x1, z1]; heights are y0 -> y1.
const R = ROOM.size;
export const PIECES = [
  // North – window seat (2 × 47¼″ BESTÅ frames centred on the window)
  { id: 'seat-w', only: 'a', p: 'besta-frame', kind: 'besta', x0: 47.5, z0: 0, x1: 167.5, z1: 40, y0: 0, y1: 38, extras: [{ p: 'besta-drawer', qty: 2 }, { p: 'besta-runner', qty: 2 }, { p: 'lappviken', qty: 2 }] },
  { id: 'seat-e', only: 'a', p: 'besta-frame', kind: 'besta', x0: 167.5, z0: 0, x1: 287.5, z1: 40, y0: 0, y1: 38, extras: [{ p: 'besta-drawer', qty: 2 }, { p: 'besta-runner', qty: 2 }, { p: 'lappviken', qty: 2 }] },
  { id: 'cush-w', only: 'a', p: 'bench-cushion', kind: 'cushion', x0: 48.5, z0: 1, x1: 166.5, z1: 40, y0: 38, y1: 46 },
  { id: 'cush-e', only: 'a', p: 'bench-cushion', kind: 'cushion', x0: 168.5, z0: 1, x1: 286.5, z1: 40, y0: 38, y1: 46 },
  { id: 'pil-1', only: 'a', p: 'fjadermott', kind: 'pillow', x0: 60, z0: 2, x1: 108, z1: 16, y0: 46, y1: 92, color: '#f6f3ec', extras: [{ p: 'gurli', qty: 1 }] },
  { id: 'pil-2', only: 'a', p: 'fjadermott', kind: 'pillow', x0: 143, z0: 2, x1: 191, z1: 16, y0: 46, y1: 92, color: '#f6f3ec', extras: [{ p: 'gurli', qty: 1 }] },
  { id: 'pil-3', only: 'a', p: 'fjadermott', kind: 'pillow', x0: 226, z0: 2, x1: 274, z1: 16, y0: 46, y1: 92, color: '#f6f3ec', extras: [{ p: 'gurli', qty: 1 }] },
  { id: 'curtain-w', only: 'a', share: 0.5, p: 'hilja', kind: 'curtain', x0: 34, z0: 4, x1: 76, z1: 9, y0: 50, y1: 228 },
  { id: 'curtain-e', only: 'a', share: 0.5, p: 'hilja', kind: 'curtain', x0: 259, z0: 4, x1: 301, z1: 9, y0: 50, y1: 228 },
  { id: 'rod', only: 'a', p: 'racka', kind: 'rod', x0: 28, z0: 5, x1: 307, z1: 8, y0: 228, y1: 230 },
  { id: 'floorlamp', only: 'a', p: 'hektar-floor', kind: 'floorlamp', x0: 297, z0: 8, x1: 327, z1: 38, y0: 0, y1: 160 },

  // East – machine embroidery station
  { id: 'alex-n', only: 'a', p: 'alex-small', kind: 'alex', x0: R - 58, z0: 52, x1: R, z1: 88, y0: 0, y1: 70, drawers: 5, face: 'w' },
  { id: 'alex-s', only: 'a', p: 'alex-small', kind: 'alex', x0: R - 58, z0: 202, x1: R, z1: 238, y0: 0, y1: 70, drawers: 5, face: 'w' },
  { id: 'karlby', only: 'a', p: 'karlby', kind: 'top', x0: R - 63.5, z0: 52, x1: R, z1: 238, y0: 70, y1: 73.8 },
  { id: 'skadis-1', only: 'a', p: 'skadis-76', kind: 'skadis', hoops: 1, x0: R - 2, z0: 66, x1: R, z1: 142, y0: 100, y1: 156, face: 'w', extras: [{ p: 'skadis-hook', qty: 2 }, { p: 'skadis-container', qty: 1 }, { p: 'skadis-shelf', qty: 1 }] },
  { id: 'skadis-2', only: 'a', p: 'skadis-76', kind: 'skadis', hoops: 2, x0: R - 2, z0: 148, x1: R, z1: 224, y0: 100, y1: 156, face: 'w', extras: [{ p: 'skadis-hook', qty: 2 }, { p: 'skadis-container', qty: 1 }, { p: 'skadis-shelf', qty: 1 }] },
  { id: 'lack', only: 'a', p: 'lack-shelf', kind: 'shelf', x0: R - 26, z0: 90, x1: R, z1: 200, y0: 172, y1: 177, spools: 'w' },
  { id: 'tertial-1', only: 'a', p: 'tertial', kind: 'tertial', x0: R - 14, z0: 92, x1: R - 4, z1: 102, y0: 73.8, y1: 125, aim: [-40, 0] },
  { id: 'tertial-2', only: 'a', p: 'tertial', kind: 'tertial', x0: R - 14, z0: 186, x1: R - 4, z1: 196, y0: 73.8, y1: 125, aim: [-40, 0] },
  { id: 'machine-1', only: 'a', p: null, prop: 'Your embroidery machine', kind: 'machine', x0: R - 52, z0: 100, x1: R - 12, z1: 150, y0: 73.8, y1: 106 },
  { id: 'machine-2', only: 'a', p: null, prop: 'Your sewing machine', kind: 'machine', x0: R - 48, z0: 160, x1: R - 18, z1: 200, y0: 73.8, y1: 103 },
  { id: 'chair-office', only: 'a', p: 'langfjall', kind: 'officechair', x0: 205, z0: 120, x1: 260, z1: 175, y0: 0, y1: 110, face: 'e' },

  // West – supply wall
  { id: 'kallax', only: 'a', p: 'kallax', kind: 'kallax', x0: 0, z0: 4, x1: 39, z1: 151, y0: 0, y1: 147, face: 'e', extras: [{ p: 'kallax-drawers', qty: 2 }, { p: 'kallax-door', qty: 2 }, { p: 'drona', qty: 6 }, { p: 'tjena', qty: 3 }], openCubes: 3 },
  { id: 'alex9-1', only: 'a', p: 'alex-9', kind: 'alex', x0: 0, z0: 156, x1: 48, z1: 192, y0: 0, y1: 116, drawers: 9, face: 'e', extras: [{ p: 'kuggis-small', qty: 6 }] },
  { id: 'alex9-2', only: 'a', p: 'alex-9', kind: 'alex', x0: 0, z0: 196, x1: 48, z1: 232, y0: 0, y1: 116, drawers: 9, face: 'e', extras: [{ p: 'kuggis-small', qty: 6 }] },
  { id: 'mosslanda', only: 'a', p: 'mosslanda', kind: 'ledge', x0: 0, z0: 20, x1: 9, z1: 135, y0: 175, y1: 179, frames: 'e' },

  // Centre
  { id: 'rug', p: 'lohals', kind: 'rug', x0: 62, z0: 50, x1: 222, z1: 280, y0: 0, y1: 0.8 },
  // One leaf raised (35″ long); the drawer section sits at the east end.
  { id: 'norden', only: 'a', p: 'norden', kind: 'norden', x0: 95, z0: 110, x1: 184, z1: 190, y0: 0, y1: 74 },
  { id: 'chair-1', only: 'a', p: 'teodores', kind: 'chair', x0: 117, z0: 196, x1: 160, z1: 240, y0: 0, y1: 80, face: 'n' },
  { id: 'chair-2', only: 'a', p: 'teodores', kind: 'chair', x0: 51, z0: 128, x1: 93, z1: 172, y0: 0, y1: 80, face: 'e' },
  { id: 'raskog', p: 'raskog', kind: 'cart', x0: 190, z0: 250, x1: 225, z1: 295, y0: 0, y1: 78 },

  // South – closet & door wall
  { id: 'skadis-door', p: 'skadis-36', kind: 'skadis', x0: 190, z0: R - 2, x1: 226, z1: R, y0: 100, y1: 156, face: 'n' },

  // ======================================================================
  // Option 2 – your KALLAX design fitted to this room
  // ======================================================================
  // North: tower | bench under the window | tower. Towers stand ¾″ off the
  // wall to clear the window casing.
  { id: 'b-tower-w', only: 'b', p: 'kallax-2x4', kind: 'kallaxGrid', cols: 2, rows: 4, face: 's', x0: 0, z0: 2, x1: 76.5, z1: 41, y0: 0, y1: 146.5,
    cells: [['shelf4', 'drona'], ['shelf4', 'drona'], ['shelf4', 'files'], ['shelf4', 'books']] },
  { id: 'b-bench', only: 'b', p: 'kallax-1x4', kind: 'kallaxGrid', cols: 4, rows: 1, face: 's', x0: R / 2 - 73.25, z0: 0, x1: R / 2 + 73.25, z1: 39, y0: 0, y1: 41.3,
    cells: [['kuggis', 'kuggis', 'kuggis', 'kuggis']], extras: [{ p: 'kuddarna-b', qty: 1, onTop: true }, { p: 'fjadermott-b', qty: 2, onTop: true }, { p: 'gurli-b', qty: 2, onTop: true }] },
  { id: 'b-pad', only: 'b', p: 'kuddarna-b', kind: 'cushion', x0: R / 2 - 60, z0: 1, x1: R / 2 + 60, z1: 39, y0: 41.3, y1: 47.3 },
  { id: 'b-pil-1', only: 'b', p: 'fjadermott-b', kind: 'pillow', x0: R / 2 - 70, z0: 2, x1: R / 2 - 22, z1: 16, y0: 47.3, y1: 93, color: '#f6f3ec', extras: [{ p: 'gurli-b', qty: 1 }] },
  { id: 'b-pil-2', only: 'b', p: 'fjadermott-b', kind: 'pillow', x0: R / 2 + 22, z0: 2, x1: R / 2 + 70, z1: 16, y0: 47.3, y1: 93, color: '#f6f3ec', extras: [{ p: 'gurli-b', qty: 1 }] },
  { id: 'b-tower-e', only: 'b', p: 'kallax-2x4', kind: 'kallaxGrid', cols: 2, rows: 4, face: 's', x0: R - 76.5, z0: 2, x1: R, z1: 41, y0: 0, y1: 146.5,
    cells: [['drona', 'drona'], ['books', 'files'], ['bottles', 'shelf1'], ['bottles', 'shelf1']] },
  { id: 'b-blind-w', only: 'b', p: 'hoppvals', kind: 'blind', x0: ROOM.window.x0 + 1, z0: -5, x1: (ROOM.window.x0 + ROOM.window.x1) / 2 - 3, z1: -4, y0: ROOM.window.sill, y1: ROOM.window.head },
  { id: 'b-blind-e', only: 'b', p: 'hoppvals', kind: 'blind', x0: (ROOM.window.x0 + ROOM.window.x1) / 2 + 3, z0: -5, x1: ROOM.window.x1 - 1, z1: -4, y0: ROOM.window.sill, y1: ROOM.window.head },

  // West: KALLAX desk + upright 1×4 (as in your design), plus bead drawers.
  // Everything stops short of the closet door's swing.
  { id: 'b-desk-w', only: 'b', p: 'kallax-desk', kind: 'kdesk', face: 'e', x0: 0, z0: 45, x1: 39, z1: 156, y0: 0, y1: 77, inserts: ['door', 'drawers'] },
  { id: 'b-tower-1x4', only: 'b', p: 'kallax-1x4', kind: 'kallaxGrid', cols: 1, rows: 4, face: 'e', x0: 0, z0: 156, x1: 39, z1: 197.3, y0: 0, y1: 146.5,
    cells: [['lock'], ['files'], ['books'], ['books']] },
  { id: 'b-alex9', only: 'b', p: 'alex-9-b', kind: 'alex', x0: 0, z0: 201, x1: 48, z1: 237, y0: 0, y1: 116, drawers: 9, face: 'e', extras: [{ p: 'kuggis-small-b', qty: 6 }] },
  { id: 'b-skadis-w', only: 'b', p: 'skadis-76-b', kind: 'skadis', x0: 0, z0: 62, x1: 2, z1: 138, y0: 95, y1: 151, face: 'e', extras: [{ p: 'skadis-hook', qty: 1 }, { p: 'skadis-shelf', qty: 1 }] },
  { id: 'b-chair-w', only: 'b', p: 'teodores', kind: 'chair', x0: 45, z0: 99, x1: 88, z1: 143, y0: 0, y1: 80, face: 'w' },

  // East: KALLAX desk (sewing) + BILLY with the table folded out (embroidery).
  // x0 of the BILLY is the open table's reach into the room.
  { id: 'b-desk-e', only: 'b', p: 'kallax-desk', kind: 'kdesk', face: 'w', x0: R - 39, z0: 44, x1: R, z1: 155, y0: 0, y1: 77, inserts: ['door', 'drawers'] },
  { id: 'b-billy', only: 'b', p: 'billy-fold', kind: 'billyfold', face: 'w', x0: R - 112.4, z0: 163, x1: R, z1: 243, y0: 0, y1: 106, caseDepth: 32.4, tableY: 74.3 },
  { id: 'b-skadis-e1', only: 'b', p: 'skadis-76-b', kind: 'skadis', hoops: 1, x0: R - 2, z0: 60, x1: R, z1: 136, y0: 110, y1: 166, face: 'w', extras: [{ p: 'skadis-hook', qty: 2 }, { p: 'skadis-container', qty: 1 }] },
  { id: 'b-skadis-e2', only: 'b', p: 'skadis-76-b', kind: 'skadis', hoops: 2, x0: R - 2, z0: 165, x1: R, z1: 241, y0: 120, y1: 176, face: 'w', extras: [{ p: 'skadis-hook', qty: 1 }, { p: 'skadis-container', qty: 1 }, { p: 'skadis-shelf', qty: 1 }] },
  { id: 'b-lack', only: 'b', p: 'lack-shelf', kind: 'shelf', x0: R - 26, z0: 90, x1: R, z1: 200, y0: 188, y1: 193 },
  { id: 'b-tertial-1', only: 'b', p: 'tertial', kind: 'tertial', x0: R - 14, z0: 104, x1: R - 4, z1: 114, y0: 77, y1: 128 },
  { id: 'b-tertial-2', only: 'b', p: 'tertial', kind: 'tertial', x0: R - 14, z0: 228, x1: R - 4, z1: 238, y0: 106, y1: 157 },
  { id: 'b-machine-2', only: 'b', p: null, prop: 'Your sewing machine', kind: 'machine', x0: R - 34, z0: 58, x1: R - 4, z1: 98, y0: 77, y1: 106 },
  { id: 'b-machine-1', only: 'b', p: null, prop: 'Your embroidery machine', kind: 'machine', x0: R - 100, z0: 195, x1: R - 60, z1: 237, y0: 74.3, y1: 106.5 },
  { id: 'b-chair-office', only: 'b', p: 'langfjall', kind: 'officechair', x0: 164, z0: 176, x1: 219, z1: 231, y0: 0, y1: 110, face: 'e' },
  { id: 'b-chair-e', only: 'b', p: 'teodores', kind: 'chair', x0: 250, z0: 57, x1: 293, z1: 100, y0: 0, y1: 80, face: 'e' },

  // Centre: NORDEN folded down to 10¼″ so the desks and BILLY table have
  // room; open it for cutting fabric.
  { id: 'b-norden', only: 'b', p: 'norden', kind: 'norden', folded: true, x0: 110, z0: 120, x1: 136, z1: 200, y0: 0, y1: 74 },
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

// Two layouts share one room: 'a' is the starter plan, 'b' is the KALLAX
// design. Items marked `only` belong to one layout; the rest are in both.
export const PLANS = {
  a: { name: 'Option 1 · Starter plan' },
  b: { name: 'Option 2 · Your KALLAX design' },
};
export const options = { plan: 'a' };
export const isActive = item => !item.only || item.only === options.plan;
export const activePieces = () => PIECES.filter(isActive);
export const activeProducts = () => PRODUCTS.filter(isActive);

// What goes in or on a piece: KALLAX inserts and boxes from its cubes, desk
// inserts, plus any `extras` (drawers, covers, hooks…). Extras marked
// `onTop` are separate pieces resting on it (a bench pad), listed for
// reference only. Returns { items: [{ key, qty, onTop }], openCubes } –
// open cubes hold your own things.
const CELL_PRODUCTS = {
  shelf4: 'kallax-shelf4', shelf1: 'kallax-shelf1', bottles: 'kallax-bottles', kuggis: 'kuggis-cube',
  drona: 'drona-b', files: 'tjena-b', drawers: 'kallax-desk-drawers', door: 'kallax-desk-door', lock: 'kallax-lock',
};
export function accessoriesOf(piece) {
  const counts = new Map();
  const add = (key, qty) => counts.set(key, (counts.get(key) || 0) + qty);
  let openCubes = piece.openCubes || 0;
  for (const type of [...(piece.cells || []).flat(), ...(piece.inserts || [])]) {
    if (CELL_PRODUCTS[type]) add(CELL_PRODUCTS[type], 1);
    else openCubes++;
  }
  const onTop = new Set();
  for (const e of piece.extras || []) {
    add(e.p, e.qty);
    if (e.onTop) onTop.add(e.p);
  }
  return { items: [...counts].map(([key, qty]) => ({ key, qty, onTop: onTop.has(key) })), openCubes };
}

// The same, added up over every piece of one product in the current option.
export function accessoriesOfProduct(key) {
  const counts = new Map();
  let openCubes = 0;
  for (const piece of activePieces().filter(p => p.p === key)) {
    const acc = accessoriesOf(piece);
    acc.items.filter(i => !i.onTop).forEach(i => counts.set(i.key, (counts.get(i.key) || 0) + i.qty));
    openCubes += acc.openCubes;
  }
  return { items: [...counts].map(([k, qty]) => ({ key: k, qty })), openCubes };
}

// Direct product page when we have one, otherwise an IKEA search.
export function ikeaUrl(p) {
  if (p.url) return p.url;
  const q = p.search || p.name.replace(/,.*$/, '');
  return `https://www.ikea.com/us/en/search/?q=${encodeURIComponent(q)}`;
}
