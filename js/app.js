// Moldkrathong — screens and UI wiring.
import { SPOTS, STUDIO } from './config.js';
import { CHAR_KEYS, CHARS, HELPERS, drawChar, charCanvas } from './characters.js';
import { createMap } from './map.js';
import { makeCard, BACKDROPS } from './card.js';

const $ = (s) => document.querySelector(s);
const show = (id) => { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id)); };

/* ---------------- intro ---------------- */
for (const k of CHAR_KEYS) $('#intro-chars').append(charCanvas(k, { size: 44, mood: 'smile' }));
$('#intro-art').innerHTML = krathongArt();

// Illustrated krathong on moonlit water (SVG, no 3D needed on the first screen).
function krathongArt() {
  const cx = 180, cy = 150, n = 12, petals = (R1, R2, lift, rot, fill, front) => {
    let out = '';
    for (let i = 0; i < n; i++) {
      const a = (i + rot) / n * Math.PI * 2, sa = Math.sin(a);
      if ((sa > 0) !== front) continue;
      const w = Math.PI / n * .95, p = (ang, r, up = 0) => `${(cx + Math.cos(ang) * r).toFixed(1)},${(cy + Math.sin(ang) * r * .34 - up).toFixed(1)}`;
      out += `<path d="M${p(a - w, R1)} Q${p(a, R2 * .82, lift * .4)} ${p(a, R2, lift)} Q${p(a, R2 * .82, lift * .4)} ${p(a + w, R1)} Z" fill="${fill}"/>`;
    }
    return out;
  };
  let water = '';
  for (let i = 0; i < 9; i++) { const y = 178 + i * 9, w = 30 + i * 16; water += `<ellipse cx="${180 + (i % 2 ? 8 : -6)}" cy="${y}" rx="${w}" ry="1.6" fill="rgba(236,230,255,${(.35 - i * .03).toFixed(2)})"/>`; }
  return `<svg viewBox="0 0 360 250" aria-label="กระทงลอยบนน้ำใต้แสงจันทร์">
  <defs><linearGradient id="ia-p1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8FC7A9"/><stop offset="1" stop-color="#C9E8D4"/></linearGradient>
  <linearGradient id="ia-p2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#CBA5D1"/><stop offset="1" stop-color="#F3C6D8"/></linearGradient>
  <radialGradient id="ia-g"><stop offset="0" stop-color="#FFE7B8"/><stop offset=".4" stop-color="rgba(255,190,110,.55)"/><stop offset="1" stop-color="rgba(255,160,90,0)"/></radialGradient></defs>
  <g class="ia-water">${water}<ellipse cx="180" cy="176" rx="120" ry="12" fill="none" stroke="rgba(236,230,255,.25)" stroke-width="1.5"/><ellipse cx="180" cy="180" rx="150" ry="17" fill="none" stroke="rgba(236,230,255,.14)" stroke-width="1.5"/></g>
  <g class="ia-k">
    <ellipse cx="180" cy="166" rx="88" ry="17" fill="#ECE9F7"/><ellipse cx="180" cy="162" rx="84" ry="14" fill="#F6F4FC"/>
    ${petals(68, 100, 22, 0, 'url(#ia-p1)', false)}${petals(46, 74, 36, .5, 'url(#ia-p2)', false)}
    <ellipse cx="180" cy="148" rx="54" ry="17" fill="#E9D7EE"/>
    ${petals(46, 74, 36, .5, 'url(#ia-p2)', true)}${petals(68, 100, 22, 0, 'url(#ia-p1)', true)}
    <g stroke-linecap="round"><path d="M168 146 L163 92M180 146 V88M192 146 L197 92" stroke="#b5523f" stroke-width="2.6"/>
    <path d="M164 104 L163 92M180 100 V88M196 104 L197 92" stroke="#7b6656" stroke-width="3.6"/></g>
    <circle cx="163" cy="90" r="2.6" fill="#ff8a4a"/><circle cx="180" cy="86" r="2.6" fill="#ff8a4a"/><circle cx="197" cy="90" r="2.6" fill="#ff8a4a"/>
    <rect x="207" y="122" width="13" height="26" rx="3" fill="#FFF4E0"/><circle cx="213.5" cy="112" r="16" fill="url(#ia-g)" class="ia-flame"/><path d="M213.5 104c3 4 3.6 7 0 10-3.6-3-3-6 0-10z" fill="#FFD27A"/>
    <ellipse cx="164" cy="170" rx="5" ry="7" fill="#202429"/><ellipse cx="196" cy="170" rx="5" ry="7" fill="#202429"/><circle cx="166" cy="167.5" r="1.6" fill="#fff"/><circle cx="198" cy="167.5" r="1.6" fill="#fff"/>
    <path d="M174 177q6 6 12 0" stroke="#202429" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="153" cy="176" rx="7" ry="4" fill="rgba(246,140,180,.55)"/><ellipse cx="207" cy="176" rx="7" ry="4" fill="rgba(246,140,180,.55)"/>
  </g></svg>`;
}
let mapApi = null;
$('#btn-start').addEventListener('click', async () => {
  $('#intro').classList.add('hide');
  if (!mapApi) mapApi = await createMap($('#map'), { onSpot: openSpot, onStudio: openStudioInfo });
});

/* ---------------- map sheet ---------------- */
let currentSpot = SPOTS[0];
function openSheet(title, sub, avaKey, bodyHTML) {
  $('#sheet-title').textContent = title; $('#sheet-sub').textContent = sub;
  drawChar($('#sheet-ava'), avaKey, { size: 52, mood: 'smile' });
  $('#sheet-body').innerHTML = bodyHTML; $('#sheet').hidden = false;
}
function openSpot(spot) {
  currentSpot = spot;
  openSheet(spot.name, spot.sub, 'gumdrop', `
    <div class="sheet-say">${spot.studio ? 'บ่อเล็กๆ หน้าบ้านพวกเรา ใครก็มาลอยได้นะ!' : 'มาลอยที่นี่กันไหม ปั้นเองหรือรับกระทงฟรีก็ได้'}</div>
    <div class="sheet-actions">
      <button class="btn-primary" id="act-sculpt">ปั้นกระทงเอง</button>
      <div class="row">
        <button class="btn-ghost" disabled>รับกระทงฟรี <span class="soon">เร็วๆ นี้</span></button>
        <button class="btn-ghost" disabled>ดูแม่น้ำ <span class="soon">เร็วๆ นี้</span></button>
      </div>
    </div>`);
  if (spot.studio) $('.sheet-actions').insertAdjacentHTML('beforeend', `<a class="link-soft" href="${STUDIO.ig}" target="_blank" rel="noopener">ทีมที่ทำเกมนี้ · ${STUDIO.igName}</a>`);
  $('#act-sculpt').addEventListener('click', () => openStudio(spot));
}
function openStudioInfo(s) {
  openSheet(s.name, 'ทีมที่ปั้นเกมนี้', 'gumdrop', `
    <div class="sheet-say">สวัสดี! พวกเราคือก้อนนุ่มจาก Moldable Studio ทีมออกแบบ UX/UI ที่ทำเกมนี้ขึ้นมา ขอให้สนุกกับการลอยกระทงนะ</div>
    <div class="sheet-actions"><a class="btn-ghost" href="${s.ig}" target="_blank" rel="noopener">แวะทักทายที่ IG ${s.igName}</a></div>`);
}
$('#sheet-close').addEventListener('click', () => { $('#sheet').hidden = true; });

/* ---------------- studio ---------------- */
let studio = null, mod = null, tab = 'shape';
const subOf = { shape: 'grab', paint: 'brush', decor: 'eye-mold', incense: 'incense3' };
const COLORS = ['#EB92B3', '#CBA5D1', '#9BB0DE', '#7FA9B1', '#5A68B5', '#F4F2FA', '#FFE38A', '#F6C98B', '#F2A7A7', '#A9D8C3', '#252941'];
const SHAPE_TOOLS = [
  ['grab', 'ดึง', 'M12 3l3 3h-2v4h4V8l3 3-3 3v-2h-4v4h2l-3 3-3-3h2v-4H7v2l-3-3 3-3v2h4V6H9z'],
  ['add', 'พอก', 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z'],
  ['dig', 'ขุด', 'M5 11h14v2H5z'],
  ['inflate', 'พอง', 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10z'],
  ['deflate', 'ยุบ', 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z'],
  ['smooth', 'เกลี่ย', 'M3 14c3-4 5-4 8 0s5 4 8 0l2 1.5c-4 5-7 5-10 1s-5-4-7 0z'],
  ['crease', 'ร่อง', 'M4 5l8 14 8-14h-3l-5 9-5-9z'],
  ['flatten', 'ทำแบน', 'M3 14h18v3H3zM6 8h12l2 4H4z'],
  ['scrape', 'ขูดออก', 'M4 17h16v3H4zM14 3l5 5-7 7H7v-5z'],
  ['slice', 'มีดตัด', 'M3 19 19 3l2 2L8 18l-5 2zM14 4l6 6-2 2-6-6z'],
];
const RESIZE = [
  ['กว้างขึ้น', 1.1, 1, 'M2 12l4-4v3h12V8l4 4-4 4v-3H6v3z'],
  ['แคบลง', .9, 1, 'M11 12 7 8v3H2v2h5v3zm2 0 4-4v3h5v2h-5v3z'],
  ['สูงขึ้น', 1, 1.12, 'M12 2l4 4h-3v12h3l-4 4-4-4h3V6H8z'],
  ['เตี้ยลง', 1, .88, 'M12 11 8 7h3V2h2v5h3zm0 2 4 4h-3v5h-2v-5H8z'],
];
const ITEM_ICON = {
  incense3: 'M11 9h2v13h-2zM7 11h2v11H7zm8 0h2v11h-2zM12 3.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8zM8 6.6a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm8 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z',
  incense1: 'M11 8h2v14h-2zM12 3a2.4 2.4 0 1 1 0 4.8A2.4 2.4 0 0 1 12 3z',
  candle: 'M9 10h6v11H9zM12 2c1.8 2.2 2.4 4 1.5 5.5-.4.6-.9 1-1.5 1s-1.1-.4-1.5-1C9.6 6 10.2 4.2 12 2z',
  marigold: 'M12 4a3 3 0 0 1 2.9 2.2A3 3 0 0 1 19 9.5a3 3 0 0 1-.6 4.3A3 3 0 0 1 15 18.5a3 3 0 0 1-6 0 3 3 0 0 1-3.4-4.7A3 3 0 0 1 9.1 6.2 3 3 0 0 1 12 4z',
  lotusbud: 'M12 3c3.5 3.2 4.8 7 3.8 11.5-1.1 1-2.4 1.5-3.8 1.5s-2.7-.5-3.8-1.5C7.2 10 8.5 6.2 12 3zM5 15c2 0 4.5 1.2 7 3.2 2.5-2 5-3.2 7-3.2-1.3 3.4-4 5.5-7 5.5S6.3 18.4 5 15z',
  lotusopen: 'M12 4c2.2 2.4 3 5 2.6 8H9.4C9 9 9.8 6.4 12 4zM4 9c3 .2 5 1.7 6 4.5L8.2 15C5.8 14 4.4 12 4 9zm16 0c-.4 3-1.8 5-4.2 6L14 13.5c1-2.8 3-4.3 6-4.5zM3 16c3-1 6.2-1 9 .8 2.8-1.8 6-1.8 9-.8-1.6 2.6-5 4.5-9 4.5S4.6 18.6 3 16z',
  garland: 'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  leaf: 'M12 2l6 18-6-3-6 3z',
  coin: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm-1 4v2H9v2h4v1H9v4h2v2h2v-2h2v-2h-4v-1h4V9h-2V7z',
};
const PAINT_TOOLS = [
  ['brush', 'พู่กัน', 'M20 3l1 1-9 11-2-2zM8 14l2 2c0 3-2 5-6 5 1-1 1-3 1-4 0-2 1-3 3-3z'],
  ['fill', 'เทสี', 'M12 2.5s7 7.3 7 12a7 7 0 1 1-14 0c0-4.7 7-12 7-12z'],
  ['gradient', 'ไล่สี Moldable', null],
];
let paintColor = COLORS[0];

function setHelper(t) {
  const h = HELPERS[t] || HELPERS.shape;
  drawChar($('#helper-ava'), h.key, { size: 46, mood: 'smile' });
  $('#helper-name').textContent = CHARS[h.key].name;
  $('#helper-tip').textContent = h.tip;
  const el = $('#helper'); el.classList.remove('min', 'pop'); void el.offsetWidth; el.classList.add('pop');
  clearTimeout(setHelper.t); setHelper.t = setTimeout(() => el.classList.add('min'), 6000);
}

function tip(text) { $('#helper-tip').textContent = text; const el = $('#helper'); el.classList.remove('min', 'pop'); void el.offsetWidth; el.classList.add('pop'); clearTimeout(setHelper.t); setHelper.t = setTimeout(() => el.classList.add('min'), 5000); }
function chip(label, active, iconEl) {
  const b = document.createElement('button'); b.className = 'chip' + (active ? ' active' : '');
  if (iconEl) b.append(iconEl); b.append(label); return b;
}
const svgIcon = (d) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.innerHTML = `<path d="${d}"/>`; return s; };
function gradIcon() { const c = document.createElement('canvas'); c.width = c.height = 68; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 68, 68, 0); ['#7FA9B1', '#9BB0DE', '#CBA5D1', '#EB92B3'].forEach((x, i) => gr.addColorStop(i / 3, x)); g.fillStyle = gr; g.beginPath(); g.arc(34, 34, 30, 0, 7); g.fill(); return c; }
function decorIcon(kind) {
  const c = document.createElement('canvas'); c.width = c.height = 68; const g = c.getContext('2d');
  g.save(); g.translate(34, 34); g.scale(.21, .21); g.lineCap = 'round'; g.lineJoin = 'round';
  const D = mod.DECOR[kind]; D.draw(g);
  if (D.tint) { g.globalCompositeOperation = 'source-in'; g.fillStyle = paintColor; g.fillRect(-160, -160, 320, 320); }
  g.restore(); g.globalCompositeOperation = 'destination-over';
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(34, 34, 32, 0, 7); g.fill();
  return c;
}
function tplIcon(id) {
  if (CHARS[id]) return charCanvas(id, { size: 34 });
  const d = { krathong: 'M12 3c2.6 2.4 3.6 5 3.2 7.6H8.8C8.4 8 9.4 5.4 12 3zM2.5 11.5l3 1.3 2.2-1.6L10 12.6l2-1.6 2 1.6 2.3-1.4 2.2 1.6 3-1.3-1.2 4.6c-2 2-4.8 3-8.3 3s-6.3-1-8.3-3z', round: 'M12 4c4.4 0 8 3.2 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8z', lotus: 'M12 3c3 3 4.5 6.5 4 10.5-1.3 1-2.6 1.5-4 1.5s-2.7-.5-4-1.5C7.5 9.5 9 6 12 3zM3 9c3.5.5 6 3 6.8 7.5C6 17 3.8 15.2 3 9zm18 0c-.8 6.2-3 8-6.8 7.5C15 12 17.5 9.5 21 9zM4 18h16c-1.5 2-4.5 3-8 3s-6.5-1-8-3z', heart: 'M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z' }[id];
  return svgIcon(d);
}

function renderTools() {
  const box = $('#subtools'); box.innerHTML = ''; box.style.display = 'flex';
  const old = document.querySelector('.swatches'); if (old) old.remove();
  const sl = $('#sliders'), slS = $('#sl-size'), slF = $('#sl-strength'), sym = $('#tg-sym');
  sl.hidden = false; slS.hidden = false; slF.hidden = false; sym.hidden = false;
  const st = studio.state;
  if (tab === 'template') {
    sl.hidden = true;
    for (const t of mod.TEMPLATES) {
      const b = chip(t.th, st.template === t.id, tplIcon(t.id));
      b.addEventListener('click', async () => {
        if (studio.dirtyWork && !(await ask('เปลี่ยนเป็นทรง' + t.th + '?', 'ที่ปั้นไว้จะหายทั้งหมดนะ', 'เปลี่ยนเลย'))) return;
        studio.reset(t.id); renderTools();
      });
      box.append(b);
    }
    box.append(Object.assign(document.createElement('span'), { className: 'chip-sep' }));
    for (const [th, sx, sy, d] of RESIZE) { const b = chip(th, false, svgIcon(d)); b.addEventListener('click', () => studio.scaleAll(sx, sy)); box.append(b); }
    const rs = chip('เริ่มใหม่', false, svgIcon('M12 4a8 8 0 1 1-7.4 5h2.2A6 6 0 1 0 12 6v3L7.5 5 12 1z'));
    rs.addEventListener('click', async () => { if (await ask('เริ่มปั้นใหม่?', 'ที่ปั้นไว้จะหายทั้งหมดนะ', 'เริ่มใหม่')) { studio.reset(st.template); renderTools(); } });
    box.append(rs);
    return;
  }
  const tools = tab === 'shape' ? SHAPE_TOOLS : tab === 'paint' ? PAINT_TOOLS : null;
  if (tools) {
    for (const [id, th, d] of tools) {
      const b = chip(th, st.sub === id, d ? svgIcon(d) : gradIcon());
      b.addEventListener('click', () => { studio.setTool(tab, id); renderTools(); if (id === 'slice') tip('ลากเส้นผ่านก้อน ส่วนที่เล็กกว่าจะถูกตัดออก'); });
      box.append(b);
    }
  } else if (tab === 'decor') {
    for (const k of Object.keys(mod.DECOR)) {
      const b = chip(mod.DECOR[k].th, st.sub === k, decorIcon(k));
      b.addEventListener('click', () => { studio.setTool(tab, k); renderTools(); });
      box.append(b);
    }
    const clr = chip('ล้างของแต่ง', false, svgIcon('M9 3h6l1 2h4v2H4V5h4zM6 9h12l-1 12H7z'));
    clr.addEventListener('click', async () => { if (await ask('ล้างของแต่งทั้งหมด?', 'ตา ปาก สติกเกอร์ ธูป ดอกไม้ จะหายหมด', 'ล้างเลย')) studio.clearDecor(); }); box.append(clr);
    slF.hidden = true;
  } else if (tab === 'incense') {
    const clr2 = () => { const c = chip('ล้างทั้งหมด', false, svgIcon('M9 3h6l1 2h4v2H4V5h4zM6 9h12l-1 12H7z')); c.addEventListener('click', async () => { if (await ask('ล้างของแต่งทั้งหมด?', 'ตา ปาก สติกเกอร์ ธูป ดอกไม้ จะหายหมด', 'ล้างเลย')) studio.clearDecor(); }); return c; };
    queueMicrotask(() => box.append(clr2()));
    for (const [k, th] of Object.entries(mod.INCENSE)) {
      const b = chip(th, st.sub === k, svgIcon(ITEM_ICON[k]));
      const ic = studio.itemColor(k); if (ic) b.firstChild.style.color = ic;
      b.addEventListener('click', () => { studio.setTool(tab, k); renderTools(); });
      box.append(b);
    }
    slF.hidden = true;
  }
  if (tab === 'paint' && st.sub !== 'brush') slF.hidden = true;
  if (tab === 'shape' && st.sub === 'slice') { slS.hidden = true; slF.hidden = true; }
  if (tab === 'paint' || tab === 'decor' || (tab === 'incense' && studio.itemColor(st.sub))) {
    if (tab === 'paint' && st.sub === 'gradient') return;
    const cur = tab === 'incense' ? studio.itemColor(st.sub) : paintColor;
    const sw = document.createElement('div'); sw.className = 'swatches';
    for (const c of COLORS) {
      const b = document.createElement('button'); b.className = 'sw' + (c.toLowerCase() === (cur || '').toLowerCase() ? ' active' : ''); b.style.background = c; b.setAttribute('aria-label', 'สี ' + c);
      b.addEventListener('click', () => { if (tab !== 'incense') paintColor = c; studio.setColor(c); renderTools(); });
      sw.append(b);
    }
    const cu = document.createElement('label'); cu.className = 'sw custom'; cu.setAttribute('aria-label', 'เลือกสีเอง');
    const inp = document.createElement('input'); inp.type = 'color'; inp.value = cur || paintColor;
    inp.addEventListener('change', () => { if (tab !== 'incense') paintColor = inp.value; studio.setColor(inp.value); renderTools(); });
    cu.append(inp); sw.append(cu);
    box.after(sw);
  }
}

function setTab(t) {
  tab = t; studio.deselect?.();
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  if (t !== 'template') studio.setTool(t, studio.state.tab === t ? studio.state.sub : subOf[t]);
  else studio.setTool('view');
  if (t !== 'incense') studio.setColor(paintColor);
  setHelper(t); renderTools();
}
document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => studio && setTab(b.dataset.tab)));
$('#in-size').addEventListener('input', e => studio?.setSize(+e.target.value));
$('#in-strength').addEventListener('input', e => studio?.setStrength(+e.target.value));
$('#tg-sym').addEventListener('click', e => { const b = e.currentTarget, on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); studio?.setSymmetry(on); });
$('#btn-undo').addEventListener('click', () => studio?.undo());
$('#del-btn').addEventListener('click', () => studio?.deleteSelected());

/* ---------------- confirm dialog ---------------- */
function ask(title, msg, ok) {
  return new Promise((res) => {
    $('#ask-title').textContent = title; $('#ask-msg').textContent = msg; $('#ask-ok').textContent = ok;
    const m = $('#modal-ask'); m.hidden = false;
    const done = (v) => { m.hidden = true; $('#ask-ok').onclick = $('#ask-no').onclick = null; res(v); };
    $('#ask-ok').onclick = () => done(true); $('#ask-no').onclick = () => done(false);
  });
}
$('#btn-redo').addEventListener('click', () => studio?.redo());

function syncButtons() { if (!studio) return; const s = studio.state; $('#btn-undo').disabled = !s.canUndo; $('#btn-redo').disabled = !s.canRedo; }

async function openStudio(spot) {
  $('#sheet').hidden = true;
  $('#studio-spot').textContent = spot.name;
  show('screen-studio');
  history.pushState({ s: 'studio' }, '');
  if (!studio) {
    drawChar($('#loading-ava'), 'diamond', { size: 64, mood: 'smile' });
    $('#stage-loading').hidden = false;
    try {
      mod = await import('./sculpt.js');
      studio = window.__mk = mod.createStudio($('#stage'), { onChange: syncButtons, onSelect: (name) => { const d = $('#del-pill'); d.hidden = !name; if (name) $('#del-name').textContent = name; } });
    } catch (err) {
      console.error(err);
      $('#stage-loading').querySelector('span').textContent = 'เครื่องนี้เปิดห้องปั้น 3D ไม่ได้ ลองเปิดใน Safari หรือ Chrome นะ';
      return;
    }
    $('#stage-loading').hidden = true;
    studio.setColor(paintColor);
    setTab('template');
  } else { studio.resume(); setTab('template'); }
}
function closeStudio() { studio?.deselect?.(); studio?.pause(); show('screen-map'); mapApi?.resize(); }
$('#btn-back').addEventListener('click', () => history.back());
window.addEventListener('popstate', () => { if ($('#screen-studio').classList.contains('active')) closeStudio(); $('#modal-done').hidden = true; });

/* ---------------- done: save with or without a backdrop ---------------- */
let lastShot = null, bg = 'none', lastCard = null;
async function refreshCard() {
  lastCard = await makeCard(lastShot, bg, SPOTS.find(s => s.id === bg));
  $('#done-img').src = lastCard.toDataURL('image/png');
  $('#done-prev').classList.toggle('clear', bg === 'none');
  document.querySelectorAll('#bg-chips button').forEach(b => b.classList.toggle('active', b.dataset.bg === bg));
}
$('#bg-chips').innerHTML = BACKDROPS.map(b => `<button data-bg="${b.id}">${b.th}</button>`).join('');
$('#bg-chips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { bg = b.dataset.bg; refreshCard(); } });
$('#btn-done').addEventListener('click', async () => {
  if (!studio) return;
  studio.frontView();
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  lastShot = studio.snapshot(900);
  bg = currentSpot.id;
  $('#modal-done').hidden = false;
  await refreshCard();
  setHelper('done');
});
$('#done-back').addEventListener('click', () => { $('#modal-done').hidden = true; });
$('#done-save').addEventListener('click', () => {
  if (!lastCard) return;
  lastCard.toBlob(async (blob) => {
    const name = `moldkrathong-${bg}.png`;
    const file = new File([blob], name, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Moldkrathong' }); return; } catch (_) { /* fall back */ } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }, 'image/png');
});

// keep the page from zooming on double tap (iOS)
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
