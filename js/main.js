import { PRODUCTS, ZONES, PHOTO_VIEWS, WALL_COLORS, productByKey, ikeaUrl } from './data.js';
import { createRoom } from './scene.js';
import { productImage } from './previews.js';
import { floorPlan, elevation, wallSummary, WALL_NAMES, feetInches } from './drawings.js';

const $ = s => document.querySelector(s);
const money = n => `$${n.toLocaleString('en-US')}`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

// ------------------------------------------------------------ piece details

function productCard(prod, sizeNote) {
  const zone = ZONES[prod.zone];
  const img = productImage(prod.key);
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
    <a class="item-link" href="${ikeaUrl(prod)}" target="_blank" rel="noopener">${prod.url ? 'View this item on IKEA' : 'Search for this item on IKEA'} ↗</a>`;
}

function pieceHtml(piece) {
  if (!piece) return '<h3>Click any piece</h3><p>Select furniture to see a picture of the IKEA product, its size, what it stores and a link to buy it.</p>';
  if (!piece.p) return `<h3>${esc(piece.prop)}</h3><p>Shown for scale – not part of the shopping list.</p>`;
  const size = `${feetInches(piece.x1 - piece.x0)} × ${feetInches(piece.z1 - piece.z0)} footprint, ${feetInches(piece.y1 - piece.y0)} tall`;
  return productCard(productByKey[piece.p], size);
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

$('#plan').append(floorPlan(p => ($('#plan-info').innerHTML = pieceHtml(p))));
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
    const items = PRODUCTS.filter(p => p.zone === key);
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
      <div><span class="muted">Products</span><b>${PRODUCTS.length}</b></div>
    </div>` + html;
  $('#shopping').querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.onchange = () => {
      cb.checked ? owned.add(cb.dataset.key) : owned.delete(cb.dataset.key);
      store.set('owned', [...owned]);
      renderList();
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
      const url = productImage(img.dataset.thumb);
      if (url) img.src = url;
    }
    if (pending.length) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const dialog = $('#item-dialog');
function openItem(key) {
  $('#item-dialog-body').innerHTML = productCard(productByKey[key]);
  dialog.showModal();
}
$('#item-dialog-close').onclick = () => dialog.close();
dialog.addEventListener('click', e => {
  if (e.target === dialog) dialog.close();
});

renderList();

// When hosted as a claude.ai artifact, downloads and printing are blocked,
// so offer copy-to-clipboard instead.
const embedded = Boolean(window.CRAFT_EMBEDDED);
if (embedded) {
  document.querySelectorAll('.download, #print-list').forEach(e => (e.hidden = true));
  $('#export-csv').textContent = 'Copy as CSV';
}

$('#export-csv').onclick = () => {
  const rows = [['Zone', 'Product', 'Size / finish', 'Qty', 'Est. each (USD)', 'Est. total (USD)', 'Got it', 'Use', 'IKEA link']];
  for (const p of PRODUCTS) {
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
