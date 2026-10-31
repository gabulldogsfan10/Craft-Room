# Craft Room Planner

A small static web app that turns the four photos of an 11′ × 11′ room into a
professional craft room plan built only from IKEA pieces, to start with:
machine and hand embroidery, beading, jewelry making, art supplies and tools,
plus a window seat with storage under the window.

## Run it

It's plain HTML/JS with Three.js vendored in `vendor/`, so there's no build step.
ES modules need a web server (opening the file directly won't work):

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

It also works as-is on GitHub Pages.

## What's in it

| Tab | What it shows |
| --- | --- |
| 3D Rendering | Orbitable model of the room. Click any piece for a card with a picture of the item, what it stores and a link to it on IKEA. Wall-colour swatches. Camera presets that match each photo. |
| Before & After | Each original photo next to a rendering taken from the same spot. You can download the renderings or swap in new photos (they stay in your browser). |
| Floor Plan | To-scale plan with a 1 ft grid and the door swings. |
| Wall Elevations | One drawing per wall. |
| IKEA Shopping List | Every product with a picture, quantity, estimated price, purpose and a link to its IKEA US product page. Has "got it" checkboxes, CSV export and print. |
| Design Notes | Why the layout works, and what to measure before buying. |

## The plan

- **North wall (window):** a window seat from 2× 47¼″ BESTÅ frames with 4 drawers, cushions, light-filtering curtains and a HEKTAR floor lamp. This is the hand-embroidery nook.
- **East wall (where the TV is now):** machine embroidery station. KARLBY countertop on 2× ALEX, SKÅDIS pegboards for hoops, a LACK shelf for thread, TERTIAL lamps and a LÅNGFJÄLL chair.
- **West wall (gallery wall):** supply wall. KALLAX 4×4 with inserts and DRÖNA boxes, plus 2× ALEX 9-drawer units for beads and jewelry findings.
- **Centre:** a NORDEN gateleg table for cutting and beading that folds away, 2 TEODORES chairs, a RÅSKOG cart and a LOHALS rug.
- **South wall:** BOAXEL closet system with KUGGIS boxes, and a SKÅDIS board between the doors.

## Two layouts

Switch between them at the top of the page:

- **Option 1 · Starter plan** – the layout described above.
- **Option 2 · Your KALLAX design** – the IKEA KALLAX planner design `3476KNP`
  fitted to this room. It has the KALLAX towers and window bench, KALLAX desks
  and an upright 1×4 with a lockable door. The BILLY bookcase with foldable
  table holds the embroidery machine. Two desks fit; the design's third desk
  needs 87⅜″ of free wall alongside another desk, which no wall here has
  once the door swings are kept clear.

The NORDEN gateleg table (both options) and the BILLY foldable table (Option 2)
can be folded and unfolded from their cards or the panel beside the 3D view,
and the NORDEN can be turned 90° about its centre.
Option 2 has a single chair, the LÅNGFJÄLL at the BILLY table.

Check that every piece in both layouts fits the walls, window and door swings
(the script also notes what each table's other fold positions would bump into):

```sh
node tools/check-fit.mjs
```

## Editing the design

All measurements, furniture positions and products live in `js/data.js`, with
x running west→east and z running north→south. The 3D model, plan, elevations and
shopping list are all generated from that file. Everything the app shows is in
feet and inches (to the nearest ¼″). Only the model's internal coordinates use
IKEA's metric grid, and `feetInches()` in `js/drawings.js` converts them for display.
The window width (69½″) is measured. The sill height, door and ceiling sizes are
estimated from the photos, so measure those and update `ROOM`.

Item pictures are rendered from the plan's own 3D models (`js/previews.js`), not IKEA photos.
Product links point to IKEA US pages found by web search. Prices are rough US estimates. Always confirm sizes, prices and availability on ikea.com.
