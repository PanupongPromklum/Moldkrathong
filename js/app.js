// Moldkrathong — screens and UI wiring.
import { SPOTS, STUDIO, READY } from './config.js?v=14';
import { CHAR_KEYS, CHARS, HELPERS, drawChar, charCanvas } from './characters.js?v=14';
import { createMap } from './map.js?v=14';
import { makeCard, makeStory, BACKDROPS } from './card.js?v=14';
import * as data from './data.js?v=14';
import { createRiver } from './river.js?v=14';
import { icon, iconEl } from './icons.js?v=14';
import { paintBackdrop, createLife } from './scene.js?v=14';
import { sfx, unlock, isOn, setOn } from './audio.js?v=14';
import * as photo from './photo.js?v=14';

const $ = (s) => document.querySelector(s);
const show = (id) => {
  document.querySelectorAll('.screen').forEach(s => { const on = s.id === id; if (on && !s.classList.contains('active')) { s.classList.remove('enter'); void s.offsetWidth; s.classList.add('enter'); } s.classList.toggle('active', on); });
};

/* ---------------- intro ---------------- */
// desktop: let the mouse wheel and click-drag scroll the sideways rows (touch already swipes)
function dragScroll(el) {
  if (!el || el.dataset.ds) return; el.dataset.ds = '1';
  el.addEventListener('wheel', (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) { el.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
  let sx = 0, sl = 0, down = false, moved = false;
  el.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; });
  el.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; el.scrollLeft = sl - dx; el.classList.add('dragging'); } });
  const end = () => { down = false; setTimeout(() => el.classList.remove('dragging'), 0); };
  el.addEventListener('pointerup', end); el.addEventListener('pointerleave', end);
  el.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
}
// put a duotone icon in front of every element that asks for one
function decorate(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { if (!el.querySelector(':scope > .ico')) el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)); }); }
decorate();
dragScroll(document.getElementById('subtools')); dragScroll(document.getElementById('bg-chips'));
// sound: unlock on the first touch, soft tick on every button, toggles anywhere
document.addEventListener('pointerdown', unlock, { once: true, capture: true });
document.addEventListener('click', (e) => { if (e.target.closest('button, a.btn-primary, a.btn-cream')) sfx('tap'); }, true);
function paintSoundBtns() { document.querySelectorAll('[data-sound]').forEach(b => { b.innerHTML = icon(isOn() ? 'sound' : 'mute'); b.classList.toggle('off', !isOn()); }); }
document.querySelectorAll('[data-sound]').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); setOn(!isOn()); unlock(); paintSoundBtns(); }));
paintSoundBtns();
for (const k of CHAR_KEYS) {
  const c = charCanvas(k, { size: 44, mood: 'smile' }); $('#intro-chars').append(c);
  c.addEventListener('pointerdown', () => c.animate([{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(2px) scale(1.15,.8)' }, { transform: 'translateY(-18px) scale(.9,1.1)' }, { transform: 'translateY(0) scale(1.06,.94)' }, { transform: 'none' }], { duration: 620, easing: 'ease-out' }));
}
// living moonlit scene behind the intro
(function introScene() {
  const cv = $('#intro-scene'), g = cv.getContext('2d'); let life, W, H, dpr, bg, raf;
  const size = () => {
    dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr;
    const horizon = Math.round(H * .58), s = Math.min(W, 520) / 390; bg = document.createElement('canvas'); bg.width = cv.width; bg.height = cv.height;
    const b = bg.getContext('2d'); b.setTransform(dpr, 0, 0, dpr, 0, 0); const moon = { x: W / 2 + Math.min(W, 520) * .32, y: horizon - 170 * s, r: 26 };
    paintBackdrop(b, W, H, { horizon, spot: 'rama8', moon, hero: 1.7, s });
    life = createLife(W, H, horizon, { lanterns: 9, moon, s });
  };
  size(); addEventListener('resize', size);
  let last = 0;
  const loop = (t) => { raf = requestAnimationFrame(loop); if ($('#intro').classList.contains('hide')) { cancelAnimationFrame(raf); return; } if (t - last < 33) return; const dt = (t - last) / 1000; last = t; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bg, 0, 0); g.setTransform(dpr, 0, 0, dpr, 0, 0); life.draw(g, t, Math.min(.1, dt)); };
  raf = requestAnimationFrame(loop);
})();

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
  if (!mapApi) { mapApi = await createMap($('#map'), { onSpot: openSpot, onStudio: openStudioInfo }); refreshCounts(); }
});

/* ---------------- map sheet ---------------- */
let currentSpot = SPOTS[0];
const SPOT_COLOR = { moldable: 'var(--lilac)', rama8: 'var(--pink)', rotfai: 'var(--teal)' };
function openSheet(title, sub, avaKey, bodyHTML, color) {
  $('#sheet-title').textContent = title; $('#sheet-sub').textContent = sub;
  $('#sheet').style.setProperty('--spot', color || 'var(--pink)');
  drawChar($('#sheet-ava'), avaKey, { size: 52, mood: 'smile' });
  $('#sheet-body').innerHTML = bodyHTML; decorate($('#sheet-body')); $('#sheet').hidden = false; sfx('sheet');
}
function openSpot(spot) {
  currentSpot = spot;
  openSheet(spot.name, spot.sub, spot.studio ? 'gumdrop' : spot.id === 'rama8' ? 'splat' : 'diamond', `
    <p class="sheet-say">${spot.studio ? 'บ่อเล็กๆ หน้าบ้านพวกเรา ใครก็มาลอยได้นะ' : 'ปั้นกระทงเองหรือรับใบที่ปั้นไว้แล้วก็ได้ แล้วไปลอยด้วยกัน'}</p>
    <div class="sheet-actions">
      <div class="row">
        <button class="btn-cream" id="act-free" data-icon="gift">เลือกกระทง</button>
        <button class="btn-surface" id="act-river" data-icon="wave">ดูแม่น้ำ</button>
      </div>
      <button class="btn-primary" id="act-sculpt" data-icon="shape">ปั้นกระทงเอง</button>
    </div>`, SPOT_COLOR[spot.id]);
  if (spot.studio) $('.sheet-actions').insertAdjacentHTML('beforeend', `<a class="link-soft" href="${STUDIO.ig}" target="_blank" rel="noopener">ทีมที่ทำเกมนี้ ${STUDIO.igName}</a>`);
  $('#act-sculpt').addEventListener('click', () => openStudio(spot));
  $('#act-free').addEventListener('click', () => openFree(spot));
  $('#act-river').addEventListener('click', () => openRiver(spot));
}
function openStudioInfo(s) { openSpot(SPOTS.find(x => x.studio) || SPOTS[0]); }
$('#sheet-close').addEventListener('click', () => { $('#sheet').hidden = true; });

/* ---------------- studio ---------------- */
let studio = null, mod = null, tab = 'shape';
const subOf = { shape: 'grab', paint: 'brush', decor: 'flower', incense: 'incense3' };
const COLORS = ['#EB92B3', '#CBA5D1', '#9BB0DE', '#7FA9B1', '#5A68B5', '#FBF8FF', '#F2C98B', '#F6B8CF', '#A9D8C3', '#252941'];
const SHAPE_TOOLS = [['grab', 'ดึง'], ['add', 'พอก'], ['dig', 'ขุด'], ['inflate', 'พอง'], ['deflate', 'ยุบ'], ['smooth', 'เกลี่ย'], ['crease', 'ร่อง'], ['flatten', 'ทำแบน'], ['scrape', 'ขูดออก'], ['slice', 'มีดตัด']];
const RESIZE = [['wider', 'กว้างขึ้น', 1.1, 1], ['narrower', 'แคบลง', .9, 1], ['taller', 'สูงขึ้น', 1, 1.12], ['shorter', 'เตี้ยลง', 1, .88]];
const PAINT_TOOLS = [['brush', 'พู่กัน'], ['fill', 'เทสี']];
// easy mode: few tools up front, the rest behind "เพิ่มเติม"
const EASY_SHAPE = ['grab', 'add', 'smooth'];
const EASY_DECOR = ['flower', 'lotus', 'heart', 'star', 'sparkle', 'moon', 'butterfly', 'bow', 'kanok', 'crown'];
const more = { shape: false, decor: false };
const GRADS = [
  ['พาสเทล', ['#7FA9B1', '#9BB0DE', '#CBA5D1', '#EB92B3']], ['บัวชมพู', ['#EFA9C4', '#F3C6D8', '#F6C2D6', '#FFE7A3']],
  ['ใบตอง', ['#8FC7A9', '#B5DEC4', '#D7C3E3', '#EB92B3']], ['ฟ้าใส', ['#7FA9B1', '#9BB0DE', '#DCE6FA']],
  ['ทองคำ', ['#E9A23B', '#F2C98B', '#FFF1C9']], ['คืนเพ็ญ', ['#5A68B5', '#9BB0DE', '#CBA5D1']], ['สายรุ้ง', ['#9BB0DE', '#A9D8C3', '#FFE7A3', '#F6B8CF']],
];
const ring = (kind, n, rf, a0 = Math.PI / 2) => Array.from({ length: n }, (_, i) => ({ kind, rf, ang: a0 + i * Math.PI * 2 / n }));
const SETS = [
  ['ธูปเทียน', 'incense3', { centre: [{ kind: 'candle', rf: .14, ang: Math.PI / 2 }, { kind: 'incense3', rf: .14, ang: -Math.PI / 2 }] }],
  ['บัวบาน', 'lotusopen', { centre: [{ kind: 'lotusopen', rf: 0 }] }],
  ['ดาวเรือง', 'marigold', { rim: ring('marigold', 6, .78) }],
  ['บัวตูม', 'lotusbud', { rim: ring('lotusbud', 5, .74) }],
  ['มาลัย', 'garland', { rim: ring('garland', 4, .8, Math.PI / 4) }],
  ['เหรียญ', 'coin', { rim: [-.55, 0, .55].map(d => ({ kind: 'coin', rf: .5, ang: Math.PI / 2 + d })) }],
];
const RIM_SETS = SETS.slice(2, 5).map(x => x[2].rim);
const BASES = ['#ECE9F7', '#F7E3EC', '#E3F1EA', '#FFF1D6', '#E2E8F8'];
const SPARKS = ['sparkle', 'star', 'heart', 'flower', 'lotus', 'butterfly'];

let paintColor = COLORS[0];

function setHelper(t) {
  const h = HELPERS[t] || HELPERS.shape;
  drawChar($('#helper-ava'), h.key, { size: 46, mood: 'smile' });
  $('#helper-name').textContent = CHARS[h.key].name;
  tip(h.tip);
}
function tip(text) {
  $('#helper-tip').textContent = text;
  const el = $('#helper'); el.hidden = true; void el.offsetWidth; el.hidden = false; $('#helper-btn').classList.remove('has-tip');
  clearTimeout(setHelper.t); setHelper.t = setTimeout(() => { el.hidden = true; $('#helper-btn').classList.add('has-tip'); }, 5000);
}
$('#helper-btn').addEventListener('click', () => { const el = $('#helper'); if (el.hidden) tip($('#helper-tip').textContent); else { el.hidden = true; clearTimeout(setHelper.t); } });

function tile(label, active, node, extra = '') {
  const b = document.createElement('button'); b.className = 'tile' + (active ? ' active' : '') + (extra ? ' ' + extra : '');
  const box = document.createElement('div'); box.className = 'tile-ico'; if (node) box.append(node);
  const l = document.createElement('span'); l.className = 'tile-label'; l.textContent = label;
  b.append(box, l); b.setAttribute('aria-pressed', active ? 'true' : 'false'); return b;
}
function gradIcon(stops = GRADS[0][1]) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 60, 0, 4); stops.forEach((x, i) => gr.addColorStop(i / (stops.length - 1), x)); g.fillStyle = gr; g.beginPath(); g.arc(32, 32, 28, 0, 7); g.fill(); return c; }
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function shuffleRecipe() {
  // only ready krathong shapes (not the plain plate or the character blobs), never a face
  const ids = mod.TEMPLATES.map(t => t.id).filter(id => id !== studio.state.template && id !== 'plate' && !CHARS[id]);
  const tpl = pick(ids);
  const groups = { face: [] };
  groups.centre = Math.random() < .8 ? SETS[0][2].centre : SETS[1][2].centre;
  groups.rim = Math.random() < .8 ? pick(RIM_SETS) : [];
  groups.extra = [];
  if (Math.random() < .55) { const k = pick(SPARKS), col = pick(COLORS.slice(0, 9)), y = .5 + Math.random() * .9, x = 2.6 + Math.random() * .6; groups.extra.push({ kind: k, x: -x, y, s: .7, color: col }, { kind: k, x, y, s: .7, color: col }); }
  return { tpl, grad: Math.random() < .4 ? null : pick(GRADS)[1], base: pick(BASES), groups };
}
$('#btn-shuffle').addEventListener('click', async () => {
  if (!studio) return;
  if (studio.state.template === 'photo' && studio.dirtyWork && !(await ask('สุ่มกระทงใบใหม่?', 'ทรงจากรูปจะหาย', 'สุ่มเลย'))) return;
  const b = $('#btn-shuffle'); b.classList.remove('roll'); void b.offsetWidth; b.classList.add('roll');
  studio.shuffle(shuffleRecipe()); sfx('chime'); renderTools();
  tip(pick(['ได้แบบนี้! ชอบไหม ถ้าไม่ชอบกดสุ่มอีกได้', 'ว้าว ใบนี้น่ารัก แต่งต่อได้เลยนะ', 'ไม่ถูกใจ กดย้อนกลับได้ หรือสุ่มอีกที']));
});
function decorIcon(kind) {
  const c = document.createElement('canvas'); c.width = c.height = 88; c.className = 'big'; const g = c.getContext('2d');
  g.save(); g.translate(44, 44); g.scale(.24, .24); g.lineCap = 'round'; g.lineJoin = 'round';
  const D = mod.DECOR[kind]; D.draw(g);
  if (D.tint) { g.globalCompositeOperation = 'source-in'; g.fillStyle = paintColor; g.fillRect(-200, -200, 400, 400); }
  g.restore(); g.globalCompositeOperation = 'destination-over';
  g.fillStyle = '#FBF8FF'; g.beginPath(); g.arc(44, 44, 38, 0, 7); g.fill();
  return c;
}
function tplIcon(id) {
  if (CHARS[id]) { const c = charCanvas(id, { size: 44 }); c.classList.add('big'); return c; }
  // top view of the shape, in its own colours
  const c = document.createElement('canvas'); c.width = c.height = 88; c.className = 'big'; const g = c.getContext('2d');
  const cols = mod.templateColors(id), N = 120; let R = 0; const pts = [];
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, r = mod.outlineOf(id, a); R = Math.max(R, r); pts.push([a, r]); }
  const path = (k) => { g.beginPath(); for (const [a, r] of pts) g.lineTo(44 + Math.cos(a) * r / R * 38 * k, 46 + Math.sin(a) * r / R * 30 * k); g.closePath(); };
  const gr = g.createLinearGradient(0, 80, 0, 10); cols.forEach((x, i) => gr.addColorStop(i / (cols.length - 1), x));
  g.fillStyle = 'rgba(0,0,0,.25)'; g.save(); g.translate(0, 4); path(1); g.fill(); g.restore();
  g.fillStyle = gr; path(1); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2.5; path(id === 'plate' ? .9 : .62); g.stroke();
  return c;
}
const askReset = (title) => ask(title, 'ที่ปั้นไว้จะหายทั้งหมด', 'ตกลง');

function renderTools() {
  const box = $('#subtools'); box.innerHTML = ''; $('#tools').dataset.cat = tab;
  document.querySelector('.swatches')?.remove();
  // brush bars: size (left) + strength (right) live beside the stage; the panel row only holds base size
  const sl = $('#sliders'), slS = { hidden: false }, slF = { hidden: false }, sym = { hidden: false };
  sl.hidden = true; $('#sl-base').hidden = true;
  queueMicrotask(() => { $('#vb-size').hidden = slS.hidden; $('#vb-strength').hidden = slF.hidden; });
  const st = studio.state;
  const add = (b, fn) => { b.addEventListener('click', fn); box.append(b); };
  if (tab === 'template') {
    slS.hidden = true; slF.hidden = true; sl.hidden = false; $('#sl-base').hidden = false; $('#in-base').value = studio.baseSize;
    $('#vb-size').hidden = true; $('#vb-strength').hidden = true;
    add(tile('จากรูป', st.template === 'photo', iconEl('photo')), () => { loadNsfw(); $('#photo-file').value = ''; $('#photo-file').click(); });
    for (const t of mod.TEMPLATES) add(tile(t.th, st.template === t.id, tplIcon(t.id)), async () => {
      if (studio.dirtyWork && !(await askReset('เปลี่ยนเป็นทรง' + t.th + '?'))) return;
      studio.reset(t.id); renderTools();
    });
    box.append(Object.assign(document.createElement('span'), { className: 'tile-sep' }));
    add(tile('เริ่มใหม่', false, iconEl('reset'), 'danger'), async () => { if (await askReset('เริ่มปั้นใหม่?')) { studio.reset(st.template); renderTools(); } });
    return;
  }
  const sep = () => box.append(Object.assign(document.createElement('span'), { className: 'tile-sep' }));
  const moreTile = (key) => add(tile(more[key] ? 'น้อยลง' : 'เพิ่มเติม', false, iconEl(more[key] ? 'minus' : 'more'), 'more'), () => {
    more[key] = !more[key]; renderTools(); if (more[key]) requestAnimationFrame(() => box.scrollTo({ left: box.scrollWidth, behavior: 'smooth' }));
  });
  if (tab === 'shape') {
    if (!more.shape && !EASY_SHAPE.includes(st.sub)) { studio.setTool('shape', 'grab'); st.sub = 'grab'; }
    for (const [ic, th, sx, sy] of RESIZE) add(tile(th, false, iconEl(ic)), () => { if (!studio.scaleAll(sx, sy)) tip(sx > 1 || sy > 1 ? 'ใหญ่สุดแล้ว เดี๋ยวล้นจอ' : 'เล็กสุดแล้วจ้า'); });
    sep();
    for (const [id, th] of SHAPE_TOOLS) if (more.shape || EASY_SHAPE.includes(id)) add(tile(th, st.sub === id, iconEl(id)), () => {
      studio.setTool(tab, id); renderTools(); if (id === 'slice') tip('ลากเส้นผ่านก้อน ส่วนที่เล็กกว่าจะถูกตัดออก');
    });
    moreTile('shape');
    if (!more.shape) { slF.hidden = true; studio.setStrength(.55); }
  } else if (tab === 'paint') {
    for (const [th, stops] of GRADS) add(tile(th, false, gradIcon(stops), 'set'), () => { studio.paintAll(stops); });
    sep();
    for (const [id, th] of PAINT_TOOLS) add(tile(th, st.sub === id, iconEl(id)), () => { studio.setTool(tab, id); renderTools(); });
  } else if (tab === 'decor') {
    // decorative stickers first, face parts (eyes, mouths, cheeks) after them
    const keys = Object.keys(mod.DECOR), order = [...keys.filter(k => mod.DECOR[k].tint), ...keys.filter(k => !mod.DECOR[k].tint)];
    if (!more.decor) order.sort((a, b) => (EASY_DECOR.indexOf(a) + 1 || 99) - (EASY_DECOR.indexOf(b) + 1 || 99));
    for (const k of order) if (more.decor || EASY_DECOR.includes(k) || st.sub === k) add(tile(mod.DECOR[k].th, st.sub === k, decorIcon(k)), () => { studio.setTool(tab, k); renderTools(); });
    moreTile('decor');
    slF.hidden = true;
  } else if (tab === 'incense') {
    for (const [th, ic, g] of SETS) {   // ready-made sets: one tap puts the whole set on
      const b = tile(th, false, iconEl(ic), 'set'); b.style.setProperty('--ia', mod.ITEM_COLOR[ic] || '#CBA5D1');
      const n = (g.rim || g.centre).length; if (n > 1) b.querySelector('.tile-ico').dataset.n = g.rim ? '×' + n : 'ชุด'; add(b, () => studio.dress(g));
    }
    sep();
    for (const [k, th] of Object.entries(mod.INCENSE)) {
      const b = tile(th, st.sub === k, iconEl(k)); const ic = studio.itemColor(k);
      if (ic && st.sub !== k) b.style.setProperty('--ia', ic);
      add(b, () => { studio.setTool(tab, k); renderTools(); });
    }
    slF.hidden = true;
  }
  if (tab === 'decor' || tab === 'incense') {
    box.append(Object.assign(document.createElement('span'), { className: 'tile-sep' }));
    add(tile('ล้างทั้งหมด', false, iconEl('trash'), 'danger'), async () => { if (await ask('ล้างของแต่งทั้งหมด?', 'ตา ปาก สติกเกอร์ ธูป ดอกไม้ จะหายหมด', 'ล้างเลย')) studio.clearDecor(); });
  }
  if (tab === 'paint' && st.sub !== 'brush') { slF.hidden = true; slS.hidden = true; }
  if (tab === 'shape' && st.sub === 'slice') { slS.hidden = true; slF.hidden = true; }
  if (tab === 'paint' || tab === 'decor' || (tab === 'incense' && studio.itemColor(st.sub))) {
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
    box.after(sw); dragScroll(sw);
  }
}

function setTab(t) {
  if (t !== tab) sfx('tab');
  tab = t; studio.deselect?.();
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  if (t !== 'template') studio.setTool(t, studio.state.tab === t ? studio.state.sub : subOf[t]);
  else studio.setTool('view');
  if (t !== 'incense') studio.setColor(paintColor);
  setHelper(t); renderTools();
}
document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => studio && setTab(b.dataset.tab)));
function vslider(el, value, onInput, preview) {
  const track = el.querySelector('.vb-track'); let drag = false;
  const set = (v) => { v = Math.min(1, Math.max(0, v)); track.style.setProperty('--v', v); track.setAttribute('aria-valuenow', Math.round(v * 100)); return v; };
  const at = (y) => { const r = track.getBoundingClientRect(); return 1 - (y - r.top - 20) / (r.height - 40); };
  const showPrev = () => { if (!preview || !studio) return; const p = $('#brush-preview'), d = Math.max(6, studio.brushPx() * 2); p.style.width = p.style.height = d + 'px'; p.hidden = false; };
  set(value);
  track.addEventListener('pointerdown', (e) => { e.preventDefault(); drag = true; track.classList.add('drag'); track.setPointerCapture?.(e.pointerId); onInput(set(at(e.clientY))); showPrev(); });
  track.addEventListener('pointermove', (e) => { if (!drag) return; onInput(set(at(e.clientY))); showPrev(); });
  const end = () => { drag = false; track.classList.remove('drag'); $('#brush-preview').hidden = true; };
  track.addEventListener('pointerup', end); track.addEventListener('pointercancel', end);
  track.addEventListener('keydown', (e) => { const d = e.key === 'ArrowUp' ? .05 : e.key === 'ArrowDown' ? -.05 : 0; if (d) { e.preventDefault(); onInput(set(+track.style.getPropertyValue('--v') + d)); } });
}
vslider($('#vb-size'), .45, v => studio?.setSize(v), true);
vslider($('#vb-strength'), .55, v => studio?.setStrength(.1 + v * .9));
$('#in-base').addEventListener('input', e => studio?.setBaseSize(+e.target.value));
$('#btn-front').addEventListener('click', () => studio?.frontView());
$('#mz-in').addEventListener('click', () => mapApi?.zoomIn());
$('#mz-out').addEventListener('click', () => mapApi?.zoomOut());
$('#mz-all').addEventListener('click', () => { $('#sheet').hidden = true; mapApi?.fitAll(); });
$('#tg-sym').addEventListener('click', e => { const b = e.currentTarget, on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); studio?.setSymmetry(on); });
$('#btn-undo').addEventListener('click', () => studio?.undo());
$('#del-btn').addEventListener('click', () => studio?.deleteSelected());

/* ---------------- basic nudity check (on device, NSFWJS) ---------------- */
let nsfwLoading = null, photoNsfw = null, lastMeta = { photo: false, nsfw: null };
function loadNsfw() {
  if (nsfwLoading) return nsfwLoading;
  nsfwLoading = new Promise((res) => {
    if (window.nsfwjs) return res();
    const sc = document.createElement('script'); sc.src = 'lib/nsfw/nsfwjs.min.js'; sc.onload = res; sc.onerror = res; document.head.append(sc);
  }).then(() => (window.nsfwjs ? nsfwjs.load('lib/nsfw/', { size: 224 }) : null)).catch(() => null);
  return nsfwLoading;
}
/** ok=false for nudity / explicit drawings. If the checker can't load, let it through (reports + admin still apply). */
async function checkImage(el) {
  try {
    const m = await loadNsfw(); if (!m) return { ok: true, score: null };
    const p = Object.fromEntries((await m.classify(el)).map(x => [x.className, x.probability]));
    const score = Math.max(p.Porn || 0, p.Hentai || 0);
    return { ok: !((p.Porn || 0) > .5 || (p.Hentai || 0) > .6), score: +score.toFixed(3) };
  } catch (_) { return { ok: true, score: null }; }
}

/* ---------------- photo → shape ---------------- */
let ph = null;   // { img, an, m, shape }
function photoRefresh() {
  if (!ph) return;
  ph.m = photo.mask(ph.an, +$('#photo-th').value);
  photo.drawPreview($('#photo-cv'), ph.img, ph.an, ph.m);
  const msg = $('#photo-msg');
  msg.hidden = !!ph.m; msg.textContent = 'ยังหาวัตถุไม่เจอ ลองเลื่อนแถบ "ตัดพื้นหลัง" หรือใช้รูปที่พื้นหลังเรียบกว่านี้';
  $('#photo-use').disabled = !ph.m;
}
$('#photo-file').addEventListener('change', async (e) => {
  const f = e.target.files?.[0]; if (!f) return;
  $('#modal-photo').hidden = false; sfx('sheet');
  $('#photo-msg').hidden = false; $('#photo-msg').textContent = 'กำลังดูรูป…'; $('#photo-use').disabled = true;
  try {
    const img = await photo.loadImage(f);
    const an = photo.analyze(img);
    $('#photo-msg').textContent = 'กำลังตรวจรูป…';
    const chk = await checkImage(img);
    if (!chk.ok) { ph = null; photo.drawPreview($('#photo-cv'), img, an, null); $('#photo-msg').hidden = false; $('#photo-msg').textContent = 'รูปนี้ใช้ปั้นไม่ได้ ลองเลือกรูปอื่นนะ'; return; }
    ph = { img, an, nsfw: chk.score }; $('#photo-th').value = Math.round(an.auto);
    requestAnimationFrame(photoRefresh);
  } catch (err) { console.error(err); $('#photo-msg').textContent = 'เปิดรูปนี้ไม่ได้ ลองรูปอื่นนะ'; }
});
let phT = 0;
$('#photo-th').addEventListener('input', () => { cancelAnimationFrame(phT); phT = requestAnimationFrame(photoRefresh); });
$('#photo-again').addEventListener('click', () => { $('#photo-file').value = ''; $('#photo-file').click(); });
$('#photo-x').addEventListener('click', () => { $('#modal-photo').hidden = true; });
$('#photo-use').addEventListener('click', async () => {
  if (!ph?.m || !studio) return;
  if (studio.dirtyWork && !(await ask('ใช้ทรงจากรูปนี้?', 'ที่ปั้นไว้จะหายทั้งหมด', 'ใช้เลย'))) return;
  const shape = photo.toShape(ph.an, ph.m, ph.img);
  $('#modal-photo').hidden = true;
  studio.reset('photo', shape); photoNsfw = ph.nsfw ?? null; studio.frontView(); renderTools();
  tip('ได้ทรงจากรูปแล้ว ปั้นหรือแต่งต่อได้เลย');
});

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
  $('#sheet').hidden = true; currentSpot = spot;
  $('#studio-spot').textContent = spot.name;
  show('screen-studio');
  history.pushState({ s: 'studio' }, '');
  if (!studio) {
    drawChar($('#loading-ava'), 'diamond', { size: 64, mood: 'smile' });
    $('#stage-loading').hidden = false;
    try {
      mod = await import('./sculpt.js?v=14');
      studio = window.__mk = mod.createStudio($('#stage'), { onChange: syncButtons, onAction: (a) => sfx(a), onSelect: (name) => { const d = $('#del-pill'); d.hidden = !name; if (name) $('#del-name').textContent = name; } });
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
window.addEventListener('popstate', () => {
  document.querySelectorAll('.modal').forEach(m => { m.hidden = true; });
  if ($('#screen-studio').classList.contains('active')) closeStudio();
  else if ($('#screen-river').classList.contains('active')) closeRiver();
});

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
  studio.deselect?.(); studio.frontView(true);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  lastShot = studio.snapshot(900);
  lastMeta = studio.state.template === 'photo' ? { photo: true, nsfw: photoNsfw } : { photo: false, nsfw: null };
  bg = currentSpot.id;
  $('#modal-done').hidden = false; sfx('chime');
  await refreshCard();
  setHelper('done');
});
$('#done-back').addEventListener('click', () => { $('#modal-done').hidden = true; });
$('#done-keep').addEventListener('click', () => {
  if (!lastShot || !keepMine(lastShot, lastMeta)) return toast('เก็บไม่ได้ ที่เก็บในเครื่องเต็ม');
  $('#modal-done').hidden = true; toast('เก็บไว้ใน "กระทงของฉัน" แล้ว', 'ไปแผนที่', () => history.back());
});
$('#done-float').addEventListener('click', () => { $('#modal-done').hidden = true; openWish(lastShot, currentSpot, null, lastMeta); });
$('#done-save').addEventListener('click', () => {
  if (!lastCard) return;
  lastCard.toBlob(async (blob) => {
    const name = `moldkrathong-${bg}.png`;
    const file = new File([blob], name, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Moldkrathong' }); return; } catch (_) { /* fall back */ } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }, 'image/png');
});

/* ---------------- counts on the map ---------------- */
let countsCache = {};
async function refreshCounts() {
  try { countsCache = await data.counts(); } catch (_) { return; }
  document.querySelectorAll('.pin').forEach(p => {
    const id = p.dataset.spot; if (!id) return;
    let n = p.querySelector('.pin-count'); if (!n) { n = document.createElement('small'); n.className = 'pin-count'; p.querySelector('.pin-label').append(n); }
    n.textContent = 'ลอยแล้ว ' + (countsCache[id] || 0);
  });
}

/* ---------------- wish + float ---------------- */
let wishShot = null, wishSpot = null;
function toUploadBlob(canvasOrImg) {
  const max = 420, w = canvasOrImg.width || canvasOrImg.naturalWidth, h = canvasOrImg.height || canvasOrImg.naturalHeight, k = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
  c.getContext('2d').drawImage(canvasOrImg, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(b => b && b.type === 'image/webp' ? res(b) : c.toBlob(res, 'image/png'), 'image/webp', .86));
}
let wishMine = null;
let wishMeta = { photo: false, nsfw: null };
function openWish(shot, spot, mineId = null, meta = null) {
  wishShot = shot; wishSpot = spot; wishMine = mineId; wishMeta = meta || { photo: false, nsfw: null };
  $('#wish-img').src = shot.toDataURL ? shot.toDataURL('image/png') : shot.src;
  $('#wish-where').textContent = 'ลอยที่ ' + spot.name;
  $('#wish-go').disabled = false; $('#wish-go').querySelector('span').textContent = 'ลอยเลย';
  $('#modal-wish').hidden = false; sfx('sheet');
}
$('#wish-text').addEventListener('input', e => { $('#wish-count').textContent = e.target.value.length + '/60'; });
$('#wish-pub').addEventListener('click', e => { const b = e.currentTarget, on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.querySelector('span').textContent = on ? 'ให้คนอื่นเห็นคำอธิษฐาน' : 'อธิษฐานในใจ (คนอื่นไม่เห็น)'; });
$('#wish-back').addEventListener('click', () => { $('#modal-wish').hidden = true; });
let myLast = null;
$('#wish-go').addEventListener('click', async () => {
  const go = $('#wish-go'); go.disabled = true; go.querySelector('span').textContent = 'กำลังลอย…';
  try {
    const blob = await toUploadBlob(wishShot);
    let nsfw = wishMeta.nsfw;
    if (wishMeta.photo) {   // check the final krathong image too before it goes public
      const r = await checkImage(wishShot);
      if (!r.ok) { go.disabled = false; go.querySelector('span').textContent = 'ลอยเลย'; $('#modal-wish').hidden = true; return toast('กระทงใบนี้ลอยไม่ได้ ลองปั้นใหม่นะ'); }
      if (r.score != null) nsfw = Math.max(nsfw || 0, r.score);
    }
    const row = await data.float({ spot: wishSpot.id, blob, nickname: $('#wish-name').value, wish: $('#wish-text').value, isPublic: $('#wish-pub').classList.contains('on'), fromPhoto: wishMeta.photo, nsfw });
    if (wishMine) dropMine(wishMine);
    myLast = { row, shot: wishShot, spot: wishSpot, nickname: $('#wish-name').value.trim(), wish: $('#wish-pub').classList.contains('on') ? $('#wish-text').value.trim() : '' };
    $('#modal-wish').hidden = true; $('#wish-text').value = ''; $('#wish-count').textContent = '0/60';
    if ($('#screen-studio').classList.contains('active')) { studio?.pause(); history.replaceState({ s: 'river' }, ''); } else history.pushState({ s: 'river' }, '');
    sfx('splash'); setTimeout(() => sfx('chime'), 900);
    await openRiver(wishSpot, { own: row, ownSrc: $('#wish-img').src, noPush: true });
  } catch (err) {
    console.error(err); go.disabled = false; go.querySelector('span').textContent = 'ลองอีกครั้ง';
    toast('ลอยไม่สำเร็จ ลองใหม่อีกครั้งนะ');
  }
});

/* ---------------- choose a krathong: mine (kept) + ready-made ---------------- */
const MINE = 'mk-mine';
const getMine = () => { try { return JSON.parse(localStorage.getItem(MINE) || '[]'); } catch (_) { return []; } };
function keepMine(canvas, meta = {}) {
  const k = Math.min(1, 420 / Math.max(canvas.width, canvas.height)), c = document.createElement('canvas');
  c.width = Math.round(canvas.width * k); c.height = Math.round(canvas.height * k); c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
  let url = c.toDataURL('image/webp', .86); if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/png');
  const list = getMine(); list.unshift({ id: 'm' + Date.now(), img: url, photo: !!meta.photo, nsfw: meta.nsfw ?? null });
  try { localStorage.setItem(MINE, JSON.stringify(list.slice(0, 8))); return true; } catch (_) { return false; }
}
function dropMine(id) { try { localStorage.setItem(MINE, JSON.stringify(getMine().filter(m => m.id !== id))); } catch (_) {} }
let freeSpot = null;
function openFree(spot) {
  freeSpot = spot; $('#sheet').hidden = true;
  const mine = getMine();
  $('#mine-wrap').hidden = !mine.length;
  $('#mine-grid').innerHTML = mine.map((m, i) => `<button data-mine="${m.id}"><img src="${m.img}" alt="กระทงของฉัน ${i + 1}"><span>ใบที่ ${mine.length - i}</span><i class="x" data-drop="${m.id}" aria-label="ลบ">×</i></button>`).join('');
  $('#free-grid').innerHTML = READY.map(r => `<button data-k="${r.id}"><img src="assets/free/${r.id}.png" alt="${r.name}"><span>${r.name}</span></button>`).join('');
  $('#modal-free').hidden = false; sfx('sheet');
}
const pickFrom = (e) => {
  const drop = e.target.closest('[data-drop]');
  if (drop) { e.stopPropagation(); dropMine(drop.dataset.drop); openFree(freeSpot); return; }
  const b = e.target.closest('button'); if (!b) return;
  const im = b.querySelector('img'); if (!im.complete || !im.naturalWidth) return;
  const mine = b.dataset.mine ? getMine().find(x => x.id === b.dataset.mine) : null;
  $('#modal-free').hidden = true; openWish(im, freeSpot, b.dataset.mine || null, mine ? { photo: !!mine.photo, nsfw: mine.nsfw ?? null } : null);
};
$('#free-grid').addEventListener('click', pickFrom);
$('#mine-grid').addEventListener('click', pickFrom);
$('#free-x').addEventListener('click', () => { $('#modal-free').hidden = true; });
$('#free-back').addEventListener('click', () => { $('#modal-free').hidden = true; });

/* ---------------- river ---------------- */
let river = null, riverSpot = null, riverPoll = 0, newest = null, tapped = null;
async function openRiver(spot, opts = {}) {
  riverSpot = spot; currentSpot = spot; $('#sheet').hidden = true;
  show('screen-river'); if (!opts.noPush) history.pushState({ s: 'river' }, '');
  $('#river-name').textContent = spot.name; $('#k-info').hidden = true;
  $('#river-share').hidden = !(myLast && myLast.spot.id === spot.id);
  if (!river) river = createRiver($('#river'), { onTap: showInfo });
  river.setSpot(spot.id); river.start();
  let rows = [];
  try { rows = await data.list(spot.id); } catch (err) { console.error(err); toast('โหลดกระทงไม่ได้ ลองใหม่อีกที'); }
  if (opts.own) rows = rows.filter(r => r.id !== opts.own.id);
  river.setItems(rows, r => data.imageUrl(r.image_path));
  newest = rows[0]?.created_at || null;
  if (opts.own) { river.addOwn(opts.own, opts.ownSrc); newest = opts.own.created_at; setTimeout(() => toast('ลอยแล้ว! ชวนเพื่อนมาลอยด้วยกัน', 'แชร์', shareStory), 1800); }
  updateCount(rows.length + (opts.own ? 1 : 0));
  clearInterval(riverPoll);
  riverPoll = setInterval(pollRiver, 12000);
}
async function pollRiver() {
  if (document.hidden || !riverSpot) return;
  try { const rows = await data.list(riverSpot.id, newest); if (rows.length) { river.addItems(rows, r => data.imageUrl(r.image_path)); newest = rows[0].created_at; refreshCounts().then(() => updateCount()); } } catch (_) { /* try again later */ }
}
function updateCount(fallback) {
  const n = Math.max(countsCache[riverSpot.id] || 0, fallback || 0);
  $('#river-count').textContent = 'ลอยแล้ว ' + n.toLocaleString('th-TH') + ' ใบ';
  $('#river-empty').hidden = n > 0;
}
function closeRiver() { river?.stop(); clearInterval(riverPoll); riverSpot = null; show('screen-map'); mapApi?.resize(); refreshCounts(); }
$('#river-back').addEventListener('click', () => history.back());
$('#river-sculpt').addEventListener('click', () => { const sp = riverSpot; closeRiver(); history.replaceState(null, ''); openStudio(sp); });
$('#river-free').addEventListener('click', () => openFree(riverSpot));
$('#river-share').addEventListener('click', () => shareStory());

const ago = (iso) => { const m = Math.max(0, (Date.now() - new Date(iso)) / 60000); return m < 1 ? 'เมื่อสักครู่' : m < 60 ? Math.floor(m) + ' นาทีที่แล้ว' : m < 1440 ? Math.floor(m / 60) + ' ชั่วโมงที่แล้ว' : Math.floor(m / 1440) + ' วันที่แล้ว'; };
function showInfo(row, it) {
  const box = $('#k-info');
  if (!row) { box.hidden = true; tapped = null; return; }
  tapped = row;
  $('#k-name').textContent = row.nickname || 'ไม่ประสงค์ออกนาม';
  $('#k-wish').textContent = row.wish ? '“' + row.wish + '”' : 'อธิษฐานในใจ';
  $('#k-time').textContent = ago(row.created_at) + (it?.own ? ' · กระทงของคุณ' : '');
  $('#k-report').hidden = !!it?.own;
  $('#k-report').textContent = 'รายงานกระทงไม่เหมาะสม'; $('#k-report').disabled = false;
  box.hidden = false;
}
$('#k-report').addEventListener('click', async () => {
  if (!tapped) return;
  if (!(await ask('รายงานกระทงนี้?', 'ถ้ามีคนรายงานครบ 3 คน กระทงจะถูกซ่อนจนกว่าแอดมินจะตรวจ', 'รายงาน'))) return;
  try {
    const r = await data.report(tapped.id);
    $('#k-report').textContent = r.already ? 'คุณรายงานไปแล้ว' : 'ขอบคุณที่ช่วยดูแลนะ'; $('#k-report').disabled = true;
    if (r.hidden) { river.remove(tapped.id); setTimeout(() => { $('#k-info').hidden = true; }, 900); }
  } catch (_) { toast('ส่งรายงานไม่สำเร็จ'); }
});

/* ---------------- toast + share ---------------- */
function toast(text, action, fn) {
  const t = $('#toast'); t.innerHTML = ''; t.append(text);
  if (action) { const b = document.createElement('button'); b.textContent = action; b.onclick = () => { t.hidden = true; fn(); }; t.append(b); }
  t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => { t.hidden = true; }, action ? 7000 : 3000);
}
async function shareStory() {
  if (!myLast) return;
  const url = location.host + location.pathname.replace(/index\.html$/, '');
  const c = await makeStory(myLast.shot, myLast.spot, { nickname: myLast.nickname, wish: myLast.wish, url });
  c.toBlob(async (blob) => {
    const file = new File([blob], 'moldkrathong-story.png', { type: 'image/png' });
    const shareData = { files: [file], title: 'Moldkrathong', text: 'มาลอยกระทงด้วยกัน ' + location.href.split('#')[0] };
    if (navigator.canShare?.(shareData)) { try { await navigator.share(shareData); return; } catch (_) { /* fall back */ } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'moldkrathong-story.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast('บันทึกรูปแล้ว เอาไปลงสตอรี่ IG ได้เลย');
  }, 'image/png');
}

// keep the page from zooming on double tap (iOS)
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
