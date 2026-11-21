// Moldkrathong — screens and UI wiring.
import { SPOTS, STUDIO } from './config.js';
import { CHAR_KEYS, CHARS, HELPERS, drawChar, charCanvas } from './characters.js';
import { createMap } from './map.js';

const $ = (s) => document.querySelector(s);
const show = (id) => { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id)); };

/* ---------------- intro ---------------- */
for (const k of CHAR_KEYS) $('#intro-chars').append(charCanvas(k, { size: 56, mood: 'smile' }));
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
    <div class="sheet-say">มิน: มาลอยกระทงที่นี่กันไหม ปั้นเองก็ได้ หรือรับกระทงฟรีจากพวกเราก็ได้นะ</div>
    <div class="sheet-actions">
      <button class="btn-primary" id="act-sculpt">ปั้นกระทงเอง</button>
      <div class="row">
        <button class="btn-ghost" disabled>รับกระทงฟรี <span class="soon">เร็วๆ นี้</span></button>
        <button class="btn-ghost" disabled>ดูแม่น้ำ <span class="soon">เร็วๆ นี้</span></button>
      </div>
    </div>`);
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
];
const PAINT_TOOLS = [
  ['brush', 'พู่กัน', 'M20 3l1 1-9 11-2-2zM8 14l2 2c0 3-2 5-6 5 1-1 1-3 1-4 0-2 1-3 3-3z'],
  ['fill', 'เทสี', 'M12 2.5s7 7.3 7 12a7 7 0 1 1-14 0c0-4.7 7-12 7-12z'],
  ['gradient', 'ไล่สี Moldable', null],
];
let paintColor = COLORS[0];

function setHelper(t) {
  const h = HELPERS[t === 'template' ? 'done' : t] || HELPERS.shape;
  drawChar($('#helper-ava'), h.key, { size: 46, mood: 'smile' });
  $('#helper-name').textContent = `${CHARS[h.key].name} · ${h.role}`;
  $('#helper-tip').textContent = t === 'template' ? 'เริ่มจากทรงไหนดี? เลือกได้เลย แล้วค่อยปั้นต่อตามใจ' : h.tip;
  const el = $('#helper'); el.classList.remove('min', 'pop'); void el.offsetWidth; el.classList.add('pop');
  clearTimeout(setHelper.t); setHelper.t = setTimeout(() => el.classList.add('min'), 6000);
}

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
  const d = { round: 'M12 4c4.4 0 8 3.2 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8z', lotus: 'M12 3c3 3 4.5 6.5 4 10.5-1.3 1-2.6 1.5-4 1.5s-2.7-.5-4-1.5C7.5 9.5 9 6 12 3zM3 9c3.5.5 6 3 6.8 7.5C6 17 3.8 15.2 3 9zm18 0c-.8 6.2-3 8-6.8 7.5C15 12 17.5 9.5 21 9zM4 18h16c-1.5 2-4.5 3-8 3s-6.5-1-8-3z', heart: 'M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z' }[id];
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
      b.addEventListener('click', () => {
        if (studio.state.canUndo && !b.classList.contains('armed')) { box.querySelectorAll('.armed').forEach(x => x.classList.remove('armed')); b.classList.add('armed'); b.lastChild.textContent = 'แตะอีกที'; return; }
        studio.reset(t.id); renderTools();
      });
      box.append(b);
    }
    return;
  }
  const tools = tab === 'shape' ? SHAPE_TOOLS : tab === 'paint' ? PAINT_TOOLS : null;
  if (tools) {
    for (const [id, th, d] of tools) {
      const b = chip(th, st.sub === id, d ? svgIcon(d) : gradIcon());
      b.addEventListener('click', () => { studio.setTool(tab, id); renderTools(); });
      box.append(b);
    }
  } else if (tab === 'decor') {
    for (const k of Object.keys(mod.DECOR)) {
      const b = chip(mod.DECOR[k].th, st.sub === k, decorIcon(k));
      b.addEventListener('click', () => { studio.setTool(tab, k); renderTools(); });
      box.append(b);
    }
    const clr = chip('ล้างของแต่ง', false, svgIcon('M9 3h6l1 2h4v2H4V5h4zM6 9h12l-1 12H7z'));
    clr.addEventListener('click', () => studio.clearDecor()); box.append(clr);
    slF.hidden = true;
  } else if (tab === 'incense') {
    for (const [k, th] of Object.entries(mod.INCENSE)) {
      const d = k === 'candle' ? 'M10 9h4v12h-4zM12 2c1.6 2 2.2 3.6 1.4 5-.4.6-.8.9-1.4.9s-1-.3-1.4-.9C9.8 5.6 10.4 4 12 2z' : k === 'incense1' ? 'M11 8h2v14h-2zM12 3a2.4 2.4 0 1 1 0 4.8A2.4 2.4 0 0 1 12 3z' : 'M11 9h2v13h-2zM7 11h2v11H7zm8 0h2v11h-2zM12 3.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8zM8 6.6a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm8 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z';
      const b = chip(th, st.sub === k, svgIcon(d));
      b.addEventListener('click', () => { studio.setTool(tab, k); renderTools(); });
      box.append(b);
    }
    slF.hidden = true;
  }
  if (tab === 'paint' && st.sub !== 'brush') slF.hidden = true;
  if (tab === 'paint' || (tab === 'decor') || (tab === 'incense' && st.sub === 'candle')) {
    if (tab === 'paint' && st.sub === 'gradient') return;
    const sw = document.createElement('div'); sw.className = 'swatches';
    for (const c of COLORS) {
      const b = document.createElement('button'); b.className = 'sw' + (c === paintColor ? ' active' : ''); b.style.background = c; b.setAttribute('aria-label', 'สี ' + c);
      b.addEventListener('click', () => { paintColor = c; studio.setColor(c); renderTools(); });
      sw.append(b);
    }
    const cu = document.createElement('label'); cu.className = 'sw custom'; cu.setAttribute('aria-label', 'เลือกสีเอง');
    const inp = document.createElement('input'); inp.type = 'color'; inp.value = paintColor;
    inp.addEventListener('change', () => { paintColor = inp.value; studio.setColor(inp.value); renderTools(); });
    cu.append(inp); sw.append(cu);
    box.after(sw);
  }
}

function setTab(t) {
  tab = t;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  if (t !== 'template') studio.setTool(t, studio.state.tab === t ? studio.state.sub : subOf[t]);
  else studio.setTool('view');
  setHelper(t); renderTools();
}
document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => studio && setTab(b.dataset.tab)));
$('#in-size').addEventListener('input', e => studio?.setSize(+e.target.value));
$('#in-strength').addEventListener('input', e => studio?.setStrength(+e.target.value));
$('#tg-sym').addEventListener('click', e => { const b = e.currentTarget, on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); studio?.setSymmetry(on); });
$('#btn-undo').addEventListener('click', () => studio?.undo());
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
      studio = mod.createStudio($('#stage'), { onChange: syncButtons });
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
function closeStudio() { studio?.pause(); show('screen-map'); mapApi?.resize(); }
$('#btn-back').addEventListener('click', () => history.back());
window.addEventListener('popstate', () => { if ($('#screen-studio').classList.contains('active')) closeStudio(); $('#modal-done').hidden = true; });

/* ---------------- done (step 1 preview) ---------------- */
let lastShot = null;
$('#btn-done').addEventListener('click', () => {
  if (!studio) return;
  lastShot = studio.snapshot(720);
  $('#done-img').src = lastShot.toDataURL('image/png');
  $('#done-spot').textContent = currentSpot.name;
  $('#modal-done').hidden = false;
  setHelper('done');
});
$('#done-back').addEventListener('click', () => { $('#modal-done').hidden = true; });
$('#done-save').addEventListener('click', () => {
  if (!lastShot) return;
  lastShot.toBlob(async (blob) => {
    const file = new File([blob], 'moldkrathong.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Moldkrathong' }); return; } catch (_) { /* fall back */ } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'moldkrathong.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }, 'image/png');
});

// keep the page from zooming on double tap (iOS)
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
