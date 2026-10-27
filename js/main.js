import { PRODUCTS, ZONES, PHOTO_VIEWS, WALL_COLORS, productByKey, ikeaUrl } from './data.js';
import { createRoom } from './scene.js';
import { floorPlan, elevation, WALL_NAMES, feetInches } from './drawings.js';

const $ = s => document.querySelector(s);
const money = n => `$${n.toLocaleString('en-US')}`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

// ------------------------------------------------------------ piece details

function pieceHtml(piece) {
  if (!piece) return '<h3>Click any piece</h3><p>Select furniture to see the IKEA product, size and what it stores.</p>';
  const size = `${feetInches(piece.x1 - piece.x0)} × ${feetInches(piece.z1 - piece.z0)} footprint, ${feetInches(piece.y1 - piece.y0)} tall`;
  if (!piece.p) return `<h3>${esc(piece.prop)}</h3><p>Shown for scale – not part of the shopping list.</p>`;
  const prod = productByKey[piece.p];
  const zone = ZONES[prod.zone];
  return `
    <span class="tag" style="--c:${zone.color}">${esc(zone.name)}</span>
    <h3>${esc(prod.name)}</h3>
    <p class="spec">${esc(prod.spec)} · qty ${prod.qty} · est. ${money(prod.price * prod.qty)}</p>
    <p>${esc(prod.why)}</p>
    <p class="muted">${size}</p>
    <a href="${ikeaUrl(prod)}" target="_blank" rel="noopener">Find on IKEA →</a>`;
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

document.querySelectorAll('[data-view]').forEach(b => {
  b.onclick = () => {
    const v = b.dataset.view;
    const photo = PHOTO_VIEWS.find(p => `photo-${p.n}` === v);
    room.setView(photo || room.views[v]);
    document.querySelectorAll('[data-view]').forEach(x => x.classList.toggle('on', x === b));
  };
});

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
  wrap.append(elevation(w, p => (info.innerHTML = pieceHtml(p))), info);
  $('#elevations').append(wrap);
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
          <thead><tr><th class="chk">Got it</th><th>Product</th><th>Size / finish</th><th class="n">Qty</th><th class="n">Est. each</th><th class="n">Est. total</th><th>Use</th></tr></thead>
          <tbody>${items.map(p => `
            <tr class="${owned.has(p.key) ? 'owned' : ''}">
              <td class="chk"><input type="checkbox" data-key="${p.key}" ${owned.has(p.key) ? 'checked' : ''} aria-label="Got ${esc(p.name)}"></td>
              <td><a href="${ikeaUrl(p)}" target="_blank" rel="noopener">${esc(p.name)}</a></td>
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
}
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
