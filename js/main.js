import { ROOM, PIECES, ZONES, PHOTO_VIEWS, WALL_COLORS, PLANS, FOLD_STATES, productByKey, ikeaUrl, options, activeProducts, activePieces, accessoriesOf, accessoriesOfProduct, foldState, isTurned, resolve } from './data.js';
import { createRoom } from './scene.js';
import { productImage, pieceImage } from './previews.js';
import { floorPlan, elevation, wallSummary, WALL_NAMES, feetInches } from './drawings.js';

const $ = s => document.querySelector(s);
const money = n => {
  const cents = Math.round(n * 100) / 100;
  return `$${cents.toLocaleString('en-US', Number.isInteger(cents) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

// ------------------------------------------------------------ piece details

// Which way a piece faces, so its picture shows the front.
function faceOf(p) {
  if (p.face && 'nsew'.includes(p.face)) return p.face;
  if (p.kind === 'kallax') return 'e';
  const R = ROOM.size;
  if (p.x1 > R - 15) return 'w';
  if (p.x0 < 15) return 'e';
  if (p.z1 > R - 15) return 'n';
  return 's';
}

// The picture for a card: the clicked piece as it is in the room, or for a
// product, the first piece in the current option that uses it. Products that
// never stand alone (inserts, hooks, boxes) get their own small model.
function imageFor(prod, piece) {
  const p = piece || activePieces().find(x => x.p === prod.key);
  const group = p && room.pieceGroup(p.id);
  return group ? pieceImage(p, group, faceOf(p)) : productImage(prod.key);
}

// Inserts, boxes and other add-ons that go in or on a piece (or, for a
// product card, in every piece of that product), each linking to its own card.
function accessoriesHtml(prod, piece) {
  const acc = piece ? accessoriesOf(piece) : accessoriesOfProduct(prod.key);
  if (!acc.items.length && !acc.openCubes) return '';
  const row = ({ key, qty }) => {
    const a = productByKey[key];
    const img = imageFor(a);
    return `<li>
      <button class="acc-row" data-acc="${key}" aria-label="Show details for ${esc(a.name)}">
        ${img ? `<img src="${img}" alt="">` : '<span class="acc-noimg"></span>'}
        <span class="acc-name"><b>${esc(a.name)}</b><small>${esc(a.spec)}</small></span>
        <span class="acc-qty">×${qty}</span>
      </button>
      <a class="small-link" href="${ikeaUrl(a)}" target="_blank" rel="noopener">IKEA ↗</a>
    </li>`;
  };
  const inside = acc.items.filter(i => !i.onTop);
  const onTop = acc.items.filter(i => i.onTop);
  const many = !piece && activePieces().filter(p => p.p === prod.key).length > 1;
  return `<div class="acc">
    ${inside.length ? `<h4>${many ? 'In these pieces' : 'In this piece'}</h4><ul>${inside.map(row).join('')}</ul>` : ''}
    ${onTop.length ? `<h4>On it</h4><ul>${onTop.map(row).join('')}</ul>` : ''}
    ${acc.openCubes ? `<p class="muted">${acc.openCubes} open ${acc.openCubes === 1 ? 'cube' : 'cubes'} left for your own books and supplies.</p>` : ''}
  </div>`;
}

// For an insert or box: which pieces it goes in, e.g. "KALLAX shelf unit ×2".
function goesIn(key) {
  const hosts = new Map();
  for (const p of activePieces()) {
    if (p.p && accessoriesOf(p).items.some(i => i.key === key && !i.onTop)) {
      const name = productByKey[p.p].name;
      hosts.set(name, (hosts.get(name) || 0) + 1);
    }
  }
  return [...hosts].map(([n, c]) => (c > 1 ? `${n} ×${c}` : n)).join(', ');
}

function productCard(prod, sizeNote, piece) {
  const zone = ZONES[prod.zone];
  const img = imageFor(prod, piece);
  return `
    ${img ? `<figure class="item-figure">
      <img class="item-img" src="${img}" alt="Rendering of the ${esc(prod.name)}">
      <figcaption>Rendered from the plan · see IKEA for product photos</figcaption>
    </figure>` : ''}
    <span class="tag" style="--c:${zone.color}">${esc(zone.name)}</span>
    <h3>${esc(prod.name)}</h3>
    <p class="spec">${esc(prod.spec)} · qty ${prod.qty} · est. ${money(prod.price * prod.qty)}</p>
    <p>${esc(prod.why)}</p>
    ${sizeNote ? `<p class="muted">${sizeNote}</p>` : ''}
    ${!piece && goesIn(prod.key) ? `<p class="muted">Goes in: ${esc(goesIn(prod.key))}</p>` : ''}
    ${accessoriesHtml(prod, piece)}
    <a class="item-link" href="${ikeaUrl(prod)}" target="_blank" rel="noopener">${prod.url ? 'View this item on IKEA' : 'Search for this item on IKEA'} ↗</a>`;
}

// Buttons that fold or unfold a table, e.g. Folded · One leaf up · Both leaves up.
// What a table in its current position runs into: other furniture standing
// on the floor, or a door's swing.
const FLOOR_RIDERS = new Set(['rug', 'cushion', 'pillow', 'machine', 'tertial', 'blind', 'curtain', 'rod']);
function blockers(piece) {
  const over = (a0, a1, b0, b1) => Math.min(a1, b1) - Math.max(a0, b0) > 0.5;
  const hits = activePieces().filter(o => o.id !== piece.id && o.p && !FLOOR_RIDERS.has(o.kind)
    && over(o.x0, o.x1, piece.x0, piece.x1) && over(o.z0, o.z1, piece.z0, piece.z1) && o.y0 < piece.y1)
    .map(o => productByKey[o.p].name.replace(/,.*$/, ''));
  const R = ROOM.size;
  const { closet, entry } = ROOM;
  const leaf = (closet.x1 - closet.x0) / 2;
  const swings = [[closet.x0, leaf, 1], [closet.x1, leaf, -1], [entry.hingeX, entry.x1 - entry.x0, -1]];
  for (const [hx, r, dir] of swings) {
    const nx = Math.min(Math.max(hx, piece.x0), piece.x1);
    const nz = Math.min(Math.max(R, piece.z0), piece.z1);
    const inQuadrant = dir > 0 ? piece.x1 > hx + 0.5 : piece.x0 < hx - 0.5;
    if (inQuadrant && Math.hypot(nx - hx, nz - R) < r - 0.5) hits.push(hx === entry.hingeX ? 'the entry door' : 'a closet door');
  }
  return [...new Set(hits)];
}

// Buttons that fold or unfold a table (and turn the NORDEN), plus a note
// when its current position runs into something.
function foldButtons(piece) {
  if (!piece.fold) return '';
  const state = foldState(piece);
  const name = esc(productByKey[piece.p].name);
  const hits = blockers(piece);
  return `<div class="fold-switch" role="group" aria-label="Fold the ${name}">
    ${FOLD_STATES[piece.fold].map(([value, label]) => `<button data-fold-id="${piece.id}" data-fold-state="${value}" aria-pressed="${value === state}">${label}</button>`).join('')}
  </div>${piece.turnable ? `<button class="turn-btn" data-turn-id="${piece.id}" aria-pressed="${isTurned(piece)}" aria-label="Turn the ${name} 90 degrees">↻ Turn 90°</button>` : ''}
  ${hits.length ? `<p class="muted fold-hint">In this position it runs into: ${esc(hits.join(', '))}. Move ${hits.length > 1 ? 'them' : 'it'} first.</p>` : ''}`;
}

function pieceHtml(piece) {
  if (!piece) return '<h3>Click any piece</h3><p>Select furniture to see a picture of the IKEA product, its size, what it stores and a link to buy it.</p>';
  if (!piece.p) return `<h3>${esc(piece.prop)}</h3><p>${esc(piece.propNote || 'Shown for scale – not part of the shopping list.')}</p>`;
  const size = `${feetInches(piece.x1 - piece.x0)} × ${feetInches(piece.z1 - piece.z0)} footprint, ${feetInches(piece.y1 - piece.y0)} tall`;
  return foldButtons(piece) + productCard(productByKey[piece.p], size, piece);
}

// ------------------------------------------------------------ 3D tab

const room = createRoom($('#room-canvas'), { onSelect: p => ($('#piece-info').innerHTML = pieceHtml(p)) });

const swatches = $('#swatches');
const savedColor = store.get('wallColor', WALL_COLORS[0].value);
for (const c of WALL_COLORS) {
  const b = document.createElement('button');
  b.className = 'swatch';
  b.style.background = c.value;
  b.title = c.name;
  b.setAttribute('aria-label', c.name);
  b.onclick = () => {
    room.setWallColor(c.value);
    store.set('wallColor', c.value);
    swatches.querySelectorAll('.swatch').forEach(s => s.classList.toggle('on', s === b));
    snapshotsStale = true;
  };
  if (c.value === savedColor) b.classList.add('on');
  swatches.append(b);
}
room.setWallColor(savedColor);

$('#show-machines').onchange = e => {
  room.setVisible('machine', e.target.checked);
  snapshotsStale = true;
};

const HINTS = {
  orbit: 'Drag to rotate · scroll or pinch to zoom · right-drag or two fingers to move · double-click a piece to zoom to it',
  look: 'You’re standing where the photo was taken. Drag to look around · scroll or pinch to zoom · double-click a piece to look at it',
};
function showView(v) {
  $('#view-hint').textContent = HINTS[room.setView(v)];
}
showView(room.views.overview);

document.querySelectorAll('[data-view]').forEach(b => {
  b.onclick = () => {
    const v = b.dataset.view;
    showView(PHOTO_VIEWS.find(p => `photo-${p.n}` === v) || room.views[v]);
    document.querySelectorAll('[data-view]').forEach(x => x.classList.toggle('on', x === b));
  };
});

// Press-and-hold buttons for zooming and turning.
document.querySelectorAll('[data-hold]').forEach(b => {
  const action = b.dataset.hold;
  const start = e => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    room.hold(action, Number(b.dataset.dir));
  };
  const stop = () => room.hold(action, 0);
  b.addEventListener('pointerdown', start);
  b.addEventListener('pointerup', stop);
  b.addEventListener('pointercancel', stop);
  b.addEventListener('lostpointercapture', stop);
  b.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      room.hold(action, Number(b.dataset.dir));
    }
  });
  b.addEventListener('keyup', stop);
  b.addEventListener('blur', stop);
});
$('#reset-view').onclick = () => room.reset();

$('#zone-legend').innerHTML = '<h3>Zones</h3>' + Object.values(ZONES)
  .map(z => `<div class="legend-row"><span class="dot" style="background:${z.color}"></span><span><b>${esc(z.wall)}</b> – ${esc(z.name)}</span></div>`).join('');

// ------------------------------------------------------------ before / after

let snapshotsStale = true;
const compare = $('#compare');
for (const v of PHOTO_VIEWS) {
  const card = document.createElement('div');
  card.className = 'card compare-card';
  card.innerHTML = `
    <h3>${esc(v.title)} <span class="muted">→ ${esc(v.becomes)}</span></h3>
    <div class="pair">
      <figure><img class="before" src="photos/photo-${v.n}.jpg" alt="Original ${esc(v.title)}"><figcaption>Before</figcaption></figure>
      <figure><img class="after" alt="Rendering of the new ${esc(v.becomes)}"><figcaption>After (IKEA plan)</figcaption></figure>
    </div>
    <div class="row">
      <label class="file">Replace photo<input type="file" accept="image/*"></label>
      <a class="download" download="craft-room-view-${v.n}.jpg">Download rendering</a>
    </div>`;
  card.querySelector('input').onchange = e => {
    const f = e.target.files[0];
    if (f) card.querySelector('.before').src = URL.createObjectURL(f);
  };
  compare.append(card);
}

function refreshSnapshots() {
  if (!snapshotsStale) return;
  snapshotsStale = false;
  compare.querySelectorAll('.compare-card').forEach((card, i) => {
    const url = room.snapshot(PHOTO_VIEWS[i]);
    card.querySelector('.after').src = url;
    card.querySelector('.download').href = url;
  });
}

// ------------------------------------------------------------ plan + elevations

function renderDrawings() {
  $('#plan').replaceChildren(floorPlan(p => ($('#plan-info').innerHTML = pieceHtml(p))));
  $('#plan-info').innerHTML = '<h3>Click a piece on the plan</h3>';
  $('#elevations').replaceChildren();
  for (const w of WALL_NAMES) {
    const wrap = document.createElement('div');
    wrap.className = 'card elev-card';
    const info = document.createElement('div');
    info.className = 'elev-info muted';
    info.textContent = 'Click a piece for details';
    const show = p => (info.innerHTML = pieceHtml(p));
    wrap.append(elevation(w, show), wallTable(w, show), info);
    $('#elevations').append(wrap);
  }
}

// How much of the wall each piece takes up, measured from the left as you face it.
function wallTable(name, show) {
  const sum = wallSummary(name);
  const box = document.createElement('div');
  box.className = 'wall-table';
  const pct = Math.round((sum.used / sum.length) * 100);
  const openings = (sum.openingChain || []).filter(s => !s.gap).map(s => `${esc(s.label)} ${feetInches(s.r - s.l)}`);
  const lead = sum.used
    ? `Furniture on the floor takes up <b>${feetInches(sum.used)}</b> of this <b>${feetInches(sum.length)}</b> wall (${pct}%), leaving <b>${feetInches(sum.free)}</b> open.`
    : `No furniture stands along this <b>${feetInches(sum.length)}</b> wall.`;
  box.innerHTML = `
    <p>${lead}${openings.length ? ` ${openings.join(' · ')}.` : ''}</p>
    <div class="table-scroll"><table>
      <thead><tr><th>Piece</th><th class="n">Wall length used</th><th class="n">Starts from left</th><th class="n">Height</th></tr></thead>
      <tbody>${sum.rows.map((r, i) => `
        <tr>
          <td><button class="name-btn" data-row="${i}">${esc(r.name)}</button>${r.mounted ? ' <span class="muted">(on the wall)</span>' : ''}</td>
          <td class="n">${feetInches(r.len)}</td>
          <td class="n">${feetInches(r.from)}</td>
          <td class="n">${r.mounted ? `top at ${feetInches(r.top)}` : feetInches(r.height)}</td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
  box.querySelectorAll('[data-row]').forEach(b => (b.onclick = () => show(sum.rows[b.dataset.row].piece)));
  return box;
}

// ------------------------------------------------------------ shopping list

const owned = new Set(store.get('owned', []));

function renderList() {
  let grand = 0;
  let remaining = 0;
  const html = Object.entries(ZONES).map(([key, z]) => {
    const items = activeProducts().filter(p => p.zone === key);
    if (!items.length) return '';
    const sub = items.reduce((s, p) => s + p.qty * p.price, 0);
    grand += sub;
    remaining += items.filter(p => !owned.has(p.key)).reduce((s, p) => s + p.qty * p.price, 0);
    return `
      <div class="card zone-card">
        <h3><span class="dot" style="background:${z.color}"></span>${esc(z.name)} <span class="muted">· ${esc(z.wall)}</span><span class="sub">${money(sub)}</span></h3>
        <table>
          <thead><tr><th class="chk">Got it</th><th class="thumb"><span class="sr-only">Picture</span></th><th>Product</th><th>Size / finish</th><th class="n">Qty</th><th class="n">Est. each</th><th class="n">Est. total</th><th>Use</th></tr></thead>
          <tbody>${items.map(p => `
            <tr class="${owned.has(p.key) ? 'owned' : ''}">
              <td class="chk"><input type="checkbox" data-key="${p.key}" ${owned.has(p.key) ? 'checked' : ''} aria-label="Got ${esc(p.name)}"></td>
              <td class="thumb"><button class="thumb-btn" data-key="${p.key}" aria-label="Show details for ${esc(p.name)}"><img alt="" data-thumb="${p.key}"></button></td>
              <td><button class="name-btn" data-key="${p.key}">${esc(p.name)}</button><br><a class="small-link" href="${ikeaUrl(p)}" target="_blank" rel="noopener">${p.url ? 'View on IKEA' : 'Search IKEA'} ↗</a></td>
              <td>${esc(p.spec)}</td>
              <td class="n">${p.qty}</td>
              <td class="n">${money(p.price)}</td>
              <td class="n">${money(p.qty * p.price)}</td>
              <td class="why">${esc(p.why)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }).join('');
  $('#shopping').innerHTML = `
    <div class="totals card">
      <div><span class="muted">Estimated total</span><b>${money(grand)}</b></div>
      <div><span class="muted">Still to buy</span><b>${money(remaining)}</b></div>
      <div><span class="muted">Products</span><b>${activeProducts().length}</b></div>
    </div>` + html;
  $('#shopping').querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.onchange = () => {
      cb.checked ? owned.add(cb.dataset.key) : owned.delete(cb.dataset.key);
      store.set('owned', [...owned]);
          };
  });
  $('#shopping').querySelectorAll('.thumb-btn, .name-btn').forEach(b => (b.onclick = () => openItem(b.dataset.key)));
  fillThumbs();
}

// Thumbnails are rendered a few at a time so the list appears immediately.
function fillThumbs() {
  const pending = [...document.querySelectorAll('img[data-thumb]:not([src])')];
  const step = () => {
    const start = performance.now();
    while (pending.length && performance.now() - start < 30) {
      const img = pending.shift();
      const url = imageFor(productByKey[img.dataset.thumb]);
      if (url) img.src = url;
    }
    if (pending.length) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const dialog = $('#item-dialog');
function openItem(key) {
  $('#item-dialog-body').innerHTML = productCard(productByKey[key]);
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}
// Accessory rows on any card open that accessory's own card.
document.addEventListener('click', e => {
  const row = e.target.closest('[data-acc]');
  if (row) openItem(row.dataset.acc);
});
$('#item-dialog-close').onclick = () => dialog.close();
dialog.addEventListener('click', e => {
  if (e.target === dialog) dialog.close();
});

// When hosted as a claude.ai artifact, downloads and printing are blocked,
// so offer copy-to-clipboard instead.
const embedded = Boolean(window.CRAFT_EMBEDDED);
if (embedded) {
  document.querySelectorAll('.download, #print-list').forEach(e => (e.hidden = true));
  $('#export-csv').textContent = 'Copy as CSV';
}

$('#export-csv').onclick = () => {
  const rows = [['Zone', 'Product', 'Size / finish', 'Qty', 'Est. each (USD)', 'Est. total (USD)', 'Got it', 'Use', 'IKEA link']];
  for (const p of activeProducts()) {
    rows.push([ZONES[p.zone].name, p.name, p.spec, p.qty, p.price, p.qty * p.price, owned.has(p.key) ? 'yes' : '', p.why, ikeaUrl(p)]);
  }
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  if (embedded) {
    const btn = $('#export-csv');
    navigator.clipboard.writeText(csv)
      .then(() => (btn.textContent = 'Copied – paste into a spreadsheet'))
      .catch(() => (btn.textContent = 'Copy blocked – use the repo version to download'));
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'craft-room-ikea-list.csv';
  a.click();
};
$('#print-list').onclick = () => window.print();

// ------------------------------------------------------------ tabs

function showTab(name) {
  document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === name));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.id === `tab-${name}`));
  document.body.dataset.tab = name;
  room.pause(name !== 'render');
  if (name === 'photos') requestAnimationFrame(refreshSnapshots);
  history.replaceState(null, '', `#${name}`);
}
document.querySelectorAll('.tabs button').forEach(b => (b.onclick = () => showTab(b.dataset.tab)));
showTab(location.hash.slice(1) && document.getElementById(`tab-${location.hash.slice(1)}`) ? location.hash.slice(1) : 'render');

// ------------------------------------------------------------ plan options

// Option 1 (starter plan) or Option 2 (your KALLAX design); see PLANS in data.js.
// The folding tables in the current option, with their fold buttons.
function renderFoldPanel() {
  const tables = activePieces().filter(p => p.fold);
  $('#fold-panel').hidden = !tables.length;
  $('#fold-panel').innerHTML = '<h3>Folding tables</h3>' + tables.map(p => `
    <div class="fold-row"><span>${esc(productByKey[p.p].name.replace(/ with .*| gateleg.*/, ''))}</span>${foldButtons(p)}</div>`).join('');
}

function setFold(id, state) {
  options.fold[id] = state;
  store.set('fold', options.fold);
  refreshTable(id);
}

function setTurned(id, turned) {
  options.turned[id] = turned;
  store.set('turned', options.turned);
  refreshTable(id);
}

function refreshTable(id) {
  room.rebuildPiece(id);
  renderDrawings();
  renderFoldPanel();
  snapshotsStale = true;
}

// Fold and turn buttons can be on any card; redraw that card in the new state.
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-fold-id], [data-turn-id]');
  if (!btn) return;
  const id = btn.dataset.foldId || btn.dataset.turnId;
  const host = btn.closest('#piece-info, #plan-info');
  if (btn.dataset.turnId) setTurned(id, !options.turned[id]);
  else setFold(id, btn.dataset.foldState);
  if (host) host.innerHTML = pieceHtml(resolve(PIECES.find(p => p.id === id)));
});

function setPlan(plan) {
  options.plan = plan;
  store.set('plan', plan);
  document.querySelectorAll('[data-plan]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.plan === plan)));
  room.refreshActive();
  $('#piece-info').innerHTML = pieceHtml(null);
  renderDrawings();
  renderFoldPanel();
  renderList();
  snapshotsStale = true;
  if (document.body.dataset.tab === 'photos') refreshSnapshots();
}
document.querySelectorAll('[data-plan]').forEach(b => (b.onclick = () => setPlan(b.dataset.plan)));
// Restore saved fold states for tables that still exist.
const savedFold = store.get('fold', {});
for (const [id, state] of Object.entries(savedFold)) {
  const p = PIECES.find(x => x.id === id);
  if (p && p.fold && FOLD_STATES[p.fold].some(([v]) => v === state)) {
    options.fold[id] = state;
    room.rebuildPiece(id);
  }
}
for (const [id, turned] of Object.entries(store.get('turned', {}))) {
  const p = PIECES.find(x => x.id === id);
  if (p && p.turnable && turned) {
    options.turned[id] = true;
    room.rebuildPiece(id);
  }
}
setPlan(PLANS[store.get('plan', 'a')] ? store.get('plan', 'a') : 'a');
