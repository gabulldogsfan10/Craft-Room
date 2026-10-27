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

- **North wall (window):** a window seat from 2× BESTÅ 120 frames with 4 drawers, cushions, light-filtering curtains and a HEKTAR floor lamp. This is the hand-embroidery nook.
- **East wall (where the TV is now):** machine embroidery station. KARLBY countertop on 2× ALEX, SKÅDIS pegboards for hoops, a LACK shelf for thread, TERTIAL lamps and a LÅNGFJÄLL chair.
- **West wall (gallery wall):** supply wall. KALLAX 4×4 with inserts and DRÖNA boxes, plus 2× ALEX 9-drawer units for beads and jewelry findings.
- **Centre:** a NORDEN gateleg table for cutting and beading that folds away, 2 TEODORES chairs, a RÅSKOG cart and a LOHALS rug.
- **South wall:** BOAXEL closet system with KUGGIS boxes, and a SKÅDIS board between the doors.

## Editing the design

All measurements, furniture positions and products live in `js/data.js`. Units
are centimetres, with x running west→east and z running north→south. The 3D
model, plan, elevations and shopping list are all generated from that file.
The window width (69.5″) is measured. The sill height, door and ceiling sizes are
estimated from the photos, so measure those and update `ROOM`.

Item pictures are rendered from the plan's own 3D models (`js/previews.js`), not IKEA photos.
Product links point to IKEA US pages found by web search. Prices are rough US estimates. Always confirm sizes, prices and availability on ikea.com.
