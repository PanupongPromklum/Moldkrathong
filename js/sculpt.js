// Moldkrathong — sculpt studio. One soft clay mesh on a plain base, kept light for phones.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { CHARS } from './characters.js?v=10';

export const BRAND = ['#7FA9B1', '#9BB0DE', '#CBA5D1', '#EB92B3'];
const DETAIL = 30;          // ≈ 9.6k vertices / 19k triangles
const BASE_TOP = 0.12;
const MAX_UNDO = 25;
const UP = new THREE.Vector3(0, 1, 0), ZAX = new THREE.Vector3(0, 0, 1);

const glow = (mat, key) => {
  mat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float mkFr = pow(1.0 - clamp(abs(dot(normalize(vViewPosition), normal)), 0.0, 1.0), 2.2);
      totalEmissiveRadiance += diffuseColor.rgb * 0.07 + vec3(0.13) * mkFr;`);
  };
  mat.customProgramCacheKey = () => key;
  return mat;
};

/* ---------------- textures for stickers and flames ---------------- */
const INK = '#202429';
function tex(draw, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); g.translate(size / 2, size / 2); g.scale(size / 256, size / 256);
  g.lineCap = 'round'; g.lineJoin = 'round'; draw(g);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 2; return t;
}
const star = (g, r1, r2, n = 5) => { g.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = -Math.PI / 2 + i * Math.PI / n; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); };
const heart = (g, s) => { g.beginPath(); for (let i = 0; i <= 60; i++) { const t = i / 60 * Math.PI * 2; g.lineTo(16 * Math.pow(Math.sin(t), 3) * s, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s); } g.closePath(); };

export const DECOR = {
  'eye-mold':   { th: 'ตาโต',   pair: true, size: .22, draw: g => { g.fillStyle = '#f4f4f6'; g.beginPath(); g.ellipse(0, 0, 70, 96, 0, 0, 7); g.fill(); g.fillStyle = INK; g.beginPath(); g.ellipse(4, 10, 50, 70, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(26, -26, 12, 22, -.6, 0, 7); g.fill(); } },
  'eye-dot':    { th: 'ตาเม็ด', pair: true, size: .16, draw: g => { g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 62, 86, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(20, -26, 14, 22, -.5, 0, 7); g.fill(); } },
  'eye-happy':  { th: 'ตายิ้ม', pair: true, size: .2,  draw: g => { g.strokeStyle = INK; g.lineWidth = 26; g.beginPath(); g.moveTo(-80, 30); g.quadraticCurveTo(0, -70, 80, 30); g.stroke(); } },
  'eye-sleep':  { th: 'ตาหลับ', pair: true, size: .2,  draw: g => { g.strokeStyle = INK; g.lineWidth = 24; g.beginPath(); g.moveTo(-80, -10); g.quadraticCurveTo(0, 60, 80, -10); g.stroke(); } },
  'eye-star':   { th: 'ตาดาว',  pair: true, size: .22, draw: g => { star(g, 110, 48); g.fillStyle = INK; g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(18, -22, 14, 0, 7); g.fill(); } },
  'mouth-smile':{ th: 'ยิ้ม',    size: .22, draw: g => { g.strokeStyle = INK; g.lineWidth = 22; g.beginPath(); g.moveTo(-80, -20); g.quadraticCurveTo(0, 70, 80, -20); g.stroke(); } },
  'mouth-open': { th: 'อ้าปาก', size: .22, draw: g => { g.beginPath(); g.moveTo(-80, -30); g.quadraticCurveTo(0, 130, 80, -30); g.closePath(); g.fillStyle = INK; g.fill(); g.save(); g.clip(); g.fillStyle = '#ee8fb0'; g.beginPath(); g.ellipse(0, 60, 46, 30, 0, 0, 7); g.fill(); g.restore(); } },
  'mouth-cat':  { th: 'ปากแมว', size: .22, draw: g => { g.strokeStyle = INK; g.lineWidth = 20; g.beginPath(); g.moveTo(-90, -10); g.quadraticCurveTo(-45, 60, 0, -5); g.quadraticCurveTo(45, 60, 90, -10); g.stroke(); } },
  'mouth-o':    { th: 'ปากโอ',  size: .14, draw: g => { g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 60, 74, 0, 0, 7); g.fill(); } },
  'blush':      { th: 'แก้มแดง', pair: true, size: .24, draw: g => { const r = g.createRadialGradient(0, 0, 0, 0, 0, 110); r.addColorStop(0, 'rgba(246,140,180,.9)'); r.addColorStop(1, 'rgba(246,140,180,0)'); g.fillStyle = r; g.beginPath(); g.ellipse(0, 0, 120, 80, 0, 0, 7); g.fill(); } },
  'heart':      { th: 'หัวใจ',  tint: true, size: .22, draw: g => { heart(g, 6.5); g.fillStyle = '#fff'; g.fill(); } },
  'star':       { th: 'ดาว',    tint: true, size: .22, draw: g => { star(g, 118, 52); g.fillStyle = '#fff'; g.fill(); } },
  'flower':     { th: 'ดอกไม้', tint: true, size: .26, draw: g => { g.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { g.save(); g.rotate(i * Math.PI / 3); g.beginPath(); g.ellipse(0, -62, 40, 58, 0, 0, 7); g.fill(); g.restore(); } g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.arc(0, 0, 34, 0, 7); g.fill(); } },
  'lotus':      { th: 'บัว',     tint: true, size: .26, draw: g => { g.fillStyle = '#fff'; for (const [a, l] of [[-.9, .8], [.9, .8], [-.45, .95], [.45, .95], [0, 1]]) { g.save(); g.translate(0, 60); g.rotate(a); g.beginPath(); g.ellipse(0, -70 * l, 30, 70 * l, 0, 0, 7); g.fill(); g.restore(); } } },
  'moon':       { th: 'จันทร์',  tint: true, size: .22, draw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 100, 0, 7); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(45, -30, 88, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; } },
  'sparkle':    { th: 'วิบวับ', tint: true, size: .2,  draw: g => { star(g, 120, 22, 4); g.fillStyle = '#fff'; g.fill(); } },
};
export const INCENSE = {
  incense3: 'ธูป 3 ดอก', incense1: 'ธูป 1 ดอก', candle: 'เทียน', marigold: 'ดาวเรือง', lotusbud: 'บัวตูม',
  lotusopen: 'บัวบาน', garland: 'พวงมาลัย', leaf: 'ใบตองพับ', coin: 'เหรียญ',
};
const ORIENT = { incense3: .8, incense1: .8, candle: .85, marigold: .5, lotusbud: .75, lotusopen: .7, garland: 0, leaf: 0, coin: 0 };
export const ITEM_COLOR = { candle: '#FFF4E0', marigold: '#FFB547', lotusbud: '#EB92B3', lotusopen: '#F6B8CF', garland: '#F7F4EA', leaf: '#86C29A', coin: '#E9C46A' };

const texCache = {};
const glowTex = () => texCache.glow || (texCache.glow = tex(g => { const r = g.createRadialGradient(0, 0, 0, 0, 0, 128); r.addColorStop(0, 'rgba(255,240,200,1)'); r.addColorStop(.25, 'rgba(255,190,110,.8)'); r.addColorStop(1, 'rgba(255,150,80,0)'); g.fillStyle = r; g.fillRect(-128, -128, 256, 256); }, 128));
const flameTex = () => texCache.flame || (texCache.flame = tex(g => { const r = g.createRadialGradient(0, 30, 4, 0, 10, 120); r.addColorStop(0, 'rgba(255,255,235,1)'); r.addColorStop(.3, 'rgba(255,205,120,.95)'); r.addColorStop(.7, 'rgba(255,140,70,.35)'); r.addColorStop(1, 'rgba(255,120,60,0)'); g.fillStyle = r; g.beginPath(); g.moveTo(0, -120); g.bezierCurveTo(70, -20, 80, 90, 0, 120); g.bezierCurveTo(-80, 90, -70, -20, 0, -120); g.fill(); }, 128));

/* ---------------- templates ---------------- */
export const TEMPLATES = [
  { id: 'krathong', th: 'กระทง' }, { id: 'round', th: 'ก้อนกลม' }, { id: 'lotus', th: 'ดอกบัว' }, { id: 'heart', th: 'หัวใจ' },
  { id: 'gumdrop', th: 'มิน' }, { id: 'diamond', th: 'แอ๊ค' }, { id: 'splat', th: 'ใหม่' }, { id: 'flower', th: 'ไผ่' }, { id: 'cloud', th: 'ฟ้า' },
];

let heartProfile = null;
function getHeartProfile() {
  if (heartProfile) return heartProfile;
  const raw = [];
  for (let i = 0; i < 720; i++) {
    const t = i / 720 * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2;
    raw.push([Math.atan2(y, x), Math.hypot(x, y) / 17]);
  }
  raw.sort((a, b) => a[0] - b[0]);
  const N = 180, out = new Array(N);
  for (let k = 0; k < N; k++) {
    let a = k / N * Math.PI * 2; if (a > Math.PI) a -= Math.PI * 2;
    let j = raw.findIndex(p => p[0] >= a); if (j <= 0) j = 1;
    const p0 = raw[j - 1], p1 = raw[Math.min(j, raw.length - 1)];
    const f = (a - p0[0]) / Math.max(1e-6, p1[0] - p0[0]);
    out[k] = p0[1] + (p1[1] - p0[1]) * Math.min(1, Math.max(0, f));
  }
  return (heartProfile = out);
}
// Flat open-bloom shapes (one closed surface): bottom disc → petal rows → centre.
// rows: [tStart, tEnd, inner radius, petal reach, base height, rise, tip lift, phase, pointy]
const BLOOMS = {
  krathong: { n: 10, rows: [[.16, .40, 1.0, .30, 0, .14, .22, 0, false], [.48, .70, .72, .2, .14, .18, .24, .5, false]], valleys: [.72, .42], centre: [.28, .08], end: .78 },
  lotus:    { n: 8,  rows: [[.12, .36, 1.0, .24, 0, .15, .26, 0, false], [.42, .60, .70, .18, .15, .22, .3, .5, false], [.66, .82, .45, .1, .3, .2, .26, 0, false]], valleys: [.70, .45, .22], centre: [.44, .06], end: .88 },
};
function bloom(id, ph, t) {
  const B = BLOOMS[id], rows = B.rows;
  const fr = (((ph / (Math.PI * 2)) * B.n) % 1 + 1) % 1;
  const petal = (phase, pointy) => { const f = (fr + phase) % 1; return pointy ? Math.pow(1 - Math.abs(2 * f - 1), 1.6) : Math.pow(Math.sin(Math.PI * f), .7); };
  const tipOf = (row) => { const p = petal(row[7], row[8]); return [row[2] + row[3] * p, row[4] + row[5] + row[6] * p]; };
  if (t < rows[0][0]) { const u = t / rows[0][0]; return { ph, r: u * rows[0][2], h: 0 }; }
  for (let k = 0; k < rows.length; k++) {
    const R = rows[k];
    if (t < R[1]) { const u = (t - R[0]) / (R[1] - R[0]), p = petal(R[7], R[8]); return { ph, r: R[2] + R[3] * p * u, h: R[4] + u * R[5] + R[6] * p * u * u }; }
    const next = k + 1 < rows.length ? rows[k + 1][0] : B.end;
    if (t < next) {
      const u = (t - R[1]) / (next - R[1]), [tr, th] = tipOf(R);
      const vr = B.valleys[k], vh = k + 1 < rows.length ? rows[k + 1][4] : B.centre[0];
      return { ph, r: tr * (1 - u) + vr * u, h: th * (1 - u) + vh * u };
    }
  }
  const u = (t - B.end) / (1 - B.end), vr = B.valleys[B.valleys.length - 1];
  return { ph, r: vr * (1 - u), h: B.centre[0] + B.centre[1] * Math.sin(u * Math.PI / 2) };
}
const profR = (p, t) => { const N = p.length, u = ((t / (Math.PI * 2)) % 1 + 1) % 1 * N, i = Math.floor(u), f = u - i; return p[i % N] * (1 - f) + p[(i + 1) % N] * f; };

/* ================================================================== */
export function createStudio(host, { onChange = () => {}, onSelect = () => {}, onAction = () => {} } = {}) {
  const canvas = document.createElement('canvas'); canvas.className = 'studio-canvas'; host.appendChild(canvas);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: dpr < 2, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 60); scene.add(camera);
  scene.add(new THREE.HemisphereLight('#d9defa', '#3b3566', 1.25));
  const key = new THREE.DirectionalLight('#eef0ff', 1.7); key.position.set(-2.5, 3, 3); camera.add(key);
  const rim = new THREE.DirectionalLight('#f3a9cb', 1.1); rim.position.set(3, 1.5, -3); camera.add(rim);
  const target = new THREE.Vector3(0, .85, 0);
  const view = { yaw: -.45, pitch: .3, dist: 6, fit: 6 };

  const piece = new THREE.Group(); scene.add(piece);

  // plain minimal base
  const baseGeo = new THREE.LatheGeometry([[0, 0], [.9, 0], [.99, .018], [1.03, .055], [1.01, .095], [.95, BASE_TOP], [0, BASE_TOP]].map(p => new THREE.Vector2(p[0], p[1])), 72);
  const baseMat = glow(new THREE.MeshStandardMaterial({ color: '#ECE9F7', roughness: .62 }), 'mk-base');
  const base = new THREE.Mesh(baseGeo, baseMat); piece.add(base);
  let baseScale = 1;

  // clay
  const ico = new THREE.IcosahedronGeometry(1, DETAIL); ico.deleteAttribute('normal'); ico.deleteAttribute('uv');
  const geo = mergeVertices(ico); ico.dispose();
  const NV = geo.attributes.position.count;
  const dirs = geo.attributes.position.array.slice();
  const P = geo.attributes.position.array;
  const C = new Float32Array(NV * 3); geo.setAttribute('color', new THREE.BufferAttribute(C, 3));
  geo.computeVertexNormals();
  // photo texture support: uv + per-vertex "how much photo shows" (front = 1, sides/back = 0)
  const UV = new Float32Array(NV * 2); geo.setAttribute('uv', new THREE.BufferAttribute(UV, 2));
  const TM = new Float32Array(NV); geo.setAttribute('texMix', new THREE.BufferAttribute(TM, 1));
  let tex = null, texCv = null, texG = null, texK = null, texDirty = false;
  const clayMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .5 });
  clayMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float texMix;\nvarying float vTexMix;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTexMix = texMix;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vTexMix;')
      .replace('#include <map_fragment>', '#ifdef USE_MAP\n vec4 mkTex = texture2D( map, vMapUv );\n#endif')
      .replace('#include <color_fragment>', '#include <color_fragment>\n#ifdef USE_MAP\n diffuseColor.rgb = mix( diffuseColor.rgb, mkTex.rgb, vTexMix );\n#endif')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float mkFr = pow(1.0 - clamp(abs(dot(normalize(vViewPosition), normal)), 0.0, 1.0), 2.2);
      totalEmissiveRadiance += diffuseColor.rgb * 0.07 + vec3(0.13) * mkFr;`);
  };
  clayMat.customProgramCacheKey = () => 'mk-clay2';
  const clay = new THREE.Mesh(geo, clayMat); piece.add(clay);
  // neighbours (for smoothing)
  const adjStart = new Uint32Array(NV + 1); let adjList;
  {
    const sets = Array.from({ length: NV }, () => new Set()), ix = geo.index.array;
    for (let i = 0; i < ix.length; i += 3) { const a = ix[i], b = ix[i + 1], c = ix[i + 2]; sets[a].add(b).add(c); sets[b].add(a).add(c); sets[c].add(a).add(b); }
    let n = 0; for (let i = 0; i < NV; i++) { adjStart[i] = n; n += sets[i].size; } adjStart[NV] = n;
    adjList = new Uint32Array(n); let k = 0; for (const s of sets) for (const v of s) adjList[k++] = v;
  }

  // brush ring
  const cursor = new THREE.Mesh(new THREE.RingGeometry(.86, 1, 40), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .55, depthTest: false }));
  cursor.renderOrder = 10; cursor.visible = false; scene.add(cursor);

  /* -------- state -------- */
  const st = { tab: 'shape', sub: 'grab', color: '#EB92B3', size: .45, strength: .55, sym: true, template: 'krathong', itemColor: { ...ITEM_COLOR } };
  const radius = () => .05 + Math.pow(st.size, 1.6) * .6;   // finer steps at small sizes
  let decor = [];           // { kind, vi, obj, scale, color, base?: [x,y,z] }
  let flames = [];
  const undoStack = [], redoStack = [];
  let dirty = true, geoDirty = false, colDirty = false;

  /* -------- template -------- */
  let firstTpl = true, morph = null;
  function smoothAll(iter, k) {
    const tmp = new Float32Array(NV * 3);
    for (let n = 0; n < iter; n++) {
      for (let i = 0; i < NV; i++) { let ax = 0, ay = 0, az = 0; const a0 = adjStart[i], a1 = adjStart[i + 1]; for (let q = a0; q < a1; q++) { const v = adjList[q]; ax += P[v * 3]; ay += P[v * 3 + 1]; az += P[v * 3 + 2]; } const c = a1 - a0 || 1; tmp[i * 3] = ax / c; tmp[i * 3 + 1] = ay / c; tmp[i * 3 + 2] = az / c; }
      for (let i = 0; i < NV * 3; i++) P[i] += (tmp[i] - P[i]) * k;
    }
  }
  let lastPhoto = null;
  const _pc = new THREE.Color();
  function applyTemplate(id, photo = null) {
    if (id === 'photo') { photo = photo || lastPhoto; if (!photo) return; lastPhoto = photo; }
    const fromP = firstTpl ? null : P.slice(), fromC = firstTpl ? null : C.slice();
    st.template = id;
    const ch = CHARS[id];
    let prof = null, depthF = .85, depthB = .68, mean = 0;
    if (ch) { prof = ch.p; depthF = .85 * ch.req; depthB = depthF * .8; }
    if (id === 'heart') { prof = getHeartProfile(); depthF = .5; depthB = .45; }
    if (id === 'photo') { prof = photo.profile; depthF = .62; depthB = .5; }
    if (prof) { for (const v of prof) mean += v; mean /= prof.length; }
    for (let i = 0; i < NV; i++) {
      let x = dirs[i * 3], y = dirs[i * 3 + 1], z = dirs[i * 3 + 2];
      if (prof) {
        const c = Math.hypot(x, y), r = mean + (profR(prof, Math.atan2(y, x)) - mean) * Math.pow(c, 2.4);
        const k = c > 1e-7 ? Math.pow(c, .93) / c : 0, zz = Math.sign(z) * Math.pow(Math.abs(z), .93);
        x = x * k * r; y = y * k * r; z = zz * (z > 0 ? depthF : depthB);
      } else if (id === 'krathong' || id === 'lotus') {
        const b = bloom(id, Math.atan2(z, x), Math.acos(Math.max(-1, Math.min(1, -y))) / Math.PI);
        x = Math.cos(b.ph) * b.r; z = Math.sin(b.ph) * b.r; y = b.h;
      } else { x *= .98; y *= .86; z *= .98; }
      P[i * 3] = x; P[i * 3 + 1] = y; P[i * 3 + 2] = z;
    }
    // photo colours are read from the front view before the shape is fitted (same x/y space as the profile)
    if (id === 'photo') for (let i = 0; i < NV; i++) {
      const c = photo.colorAt(P[i * 3], P[i * 3 + 1]); _pc.setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace); C[i * 3] = _pc.r; C[i * 3 + 1] = _pc.g; C[i * 3 + 2] = _pc.b;
      const uv = photo.uvAt(P[i * 3], P[i * 3 + 1]); UV[i * 2] = uv[0]; UV[i * 2 + 1] = uv[1];
      TM[i] = Math.min(1, Math.max(0, (dirs[i * 3 + 2] - .08) / .32));
    } else TM.fill(0);
    geo.attributes.uv.needsUpdate = true; geo.attributes.texMix.needsUpdate = true;
    // fit on the base
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let i = 0; i < NV; i++) { x0 = Math.min(x0, P[i * 3]); x1 = Math.max(x1, P[i * 3]); y0 = Math.min(y0, P[i * 3 + 1]); y1 = Math.max(y1, P[i * 3 + 1]); z0 = Math.min(z0, P[i * 3 + 2]); z1 = Math.max(z1, P[i * 3 + 2]); }
    const s = Math.min(1.75 / (x1 - x0), 1.75 / (z1 - z0), 1.7 / (y1 - y0));
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (let i = 0; i < NV; i++) { P[i * 3] = (P[i * 3] - cx) * s; P[i * 3 + 1] = (P[i * 3 + 1] - y0) * s + BASE_TOP - .06; P[i * 3 + 2] = (P[i * 3 + 2] - cz) * s; }
    smoothAll(BLOOMS[id] || id === 'heart' ? 6 : 2, .5);   // soft, rounded edges — no sharp tips
    // colours
    const stops = ch ? [ch.colors.bottom, ch.colors.mid, ch.colors.top] : id === 'krathong' ? ['#8FC7A9', '#B5DEC4', '#D7C3E3', '#EB92B3'] : id === 'lotus' ? ['#F3C6D8', '#EFA9C4', '#F6C2D6', '#FFE7A3'] : BRAND;
    if (id === 'photo') {
      colDirty = true;
      texK = photo.uvScale.u / s;                                        // uv units per world unit (x)
      texCv = document.createElement('canvas'); texCv.width = photo.texture.width; texCv.height = photo.texture.height;
      texG = texCv.getContext('2d', { willReadFrequently: true }); texG.drawImage(photo.texture, 0, 0);
      tex?.dispose(); tex = new THREE.CanvasTexture(texCv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      clayMat.map = tex; clayMat.needsUpdate = true;
    } else {
      if (clayMat.map) { clayMat.map = null; clayMat.needsUpdate = true; tex?.dispose(); tex = null; texCv = texG = null; }
      gradientFill(stops);
    }
    clearDecorObjs(); baseMat.color.set('#ECE9F7');
    undoStack.length = 0; redoStack.length = 0;
    if (fromP) { onAction('morph'); morph = { fromP, toP: P.slice(), fromC, toC: C.slice(), t0: performance.now() }; P.set(fromP); C.set(fromC); }
    firstTpl = false;
    geoDirty = true; onChange();
  }

  function gradientFill(stops) {
    const cs = stops.map(h => new THREE.Color(h)), c = new THREE.Color();
    let y0 = 1e9, y1 = -1e9; for (let i = 0; i < NV; i++) { y0 = Math.min(y0, P[i * 3 + 1]); y1 = Math.max(y1, P[i * 3 + 1]); }
    for (let i = 0; i < NV; i++) {
      const t = (P[i * 3 + 1] - y0) / Math.max(1e-6, y1 - y0) * (cs.length - 1), k = Math.min(cs.length - 2, Math.floor(t));
      c.copy(cs[k]).lerp(cs[k + 1], t - k);
      C[i * 3] = c.r; C[i * 3 + 1] = c.g; C[i * 3 + 2] = c.b;
    }
    colDirty = true;
  }

  /* -------- undo -------- */
  const decorState = () => decor.map(d => ({ kind: d.kind, vi: d.vi, scale: d.scale, color: d.color, base: d.base }));
  const snap = () => ({ P: P.slice(), C: C.slice(), TM: TM.slice(), img: texG ? texG.getImageData(0, 0, texCv.width, texCv.height) : null, decor: decorState(), baseColor: '#' + baseMat.color.getHexString() });
  function restore(s) {
    P.set(s.P); C.set(s.C); TM.set(s.TM); geo.attributes.texMix.needsUpdate = true; baseMat.color.set(s.baseColor);
    if (s.img && texG && s.img.width === texCv.width) { texG.putImageData(s.img, 0, 0); texDirty = true; }
    clearDecorObjs(); for (const d of s.decor) addDecor(d.kind, d.vi, d.scale, d.color, d.base);
    geoDirty = true; colDirty = true;
  }
  function pushUndo() { undoStack.push(snap()); while (undoStack.length > (tex ? 12 : MAX_UNDO)) undoStack.shift(); redoStack.length = 0; onChange(); }
  function undo() { if (!undoStack.length) return; redoStack.push(snap()); restore(undoStack.pop()); onChange(); }
  function redo() { if (!redoStack.length) return; undoStack.push(snap()); restore(redoStack.pop()); onChange(); }

  /* -------- decorations -------- */
  const stickerGeo = new THREE.PlaneGeometry(1, 1);
  const stickMat = new THREE.MeshStandardMaterial({ color: '#b5523f', roughness: .8 });
  const coatMat = new THREE.MeshStandardMaterial({ color: '#7b6656', roughness: .9 });
  const emberMat = new THREE.MeshBasicMaterial({ color: '#ff8a4a' });
  const stickGeo = new THREE.CylinderGeometry(.012, .012, .5, 6).translate(0, .25, 0);
  const coatGeo = new THREE.CylinderGeometry(.018, .018, .38, 6).translate(0, .69, 0);
  const emberGeo = new THREE.SphereGeometry(.021, 8, 6).translate(0, .885, 0);
  const candleGeo = new THREE.CylinderGeometry(.075, .08, .3, 20).translate(0, .15, 0);
  const wickGeo = new THREE.CylinderGeometry(.006, .006, .05, 4).translate(0, .325, 0);

  const itemGeo = {};
  const once = (k, f) => () => itemGeo['_' + k] || (itemGeo['_' + k] = f());
  itemGeo.marigold = once('mg', () => { const g = new THREE.IcosahedronGeometry(.085, 3); const p = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const a = Math.atan2(v.z, v.x), b = Math.acos(Math.max(-1, Math.min(1, v.y / .085))); v.multiplyScalar(1 + .14 * Math.abs(Math.sin(a * 7) * Math.sin(b * 7))); v.y *= .8; p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; });
  itemGeo.bud = once('bud', () => new THREE.LatheGeometry([[0, 0], [.05, .02], [.075, .08], [.07, .15], [.045, .22], [0, .29]].map(q => new THREE.Vector2(q[0], q[1])), 18));
  itemGeo.petal = once('pt', () => { const g = new THREE.SphereGeometry(.05, 10, 8); g.scale(.75, .25, 1.6); g.translate(0, 0, .075); return g; });
  itemGeo.garland = once('gl', () => { const g = new THREE.TorusGeometry(.12, .026, 8, 40); g.rotateX(Math.PI / 2); const p = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const a = Math.atan2(v.z, v.x), k = 1 + .25 * Math.max(0, Math.cos(a * 18)); const r = Math.hypot(v.x, v.z), d = r - .12; const nr = .12 + d * k; v.x *= nr / r; v.z *= nr / r; v.y *= k; p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; });
  itemGeo.leaf = once('lf', () => new THREE.ConeGeometry(.055, .24, 4, 1).translate(0, .1, 0));
  itemGeo.coin = once('cn', () => new THREE.CylinderGeometry(.065, .065, .014, 24));

  function makeSticker(kind, color) {
    const D = DECOR[kind];
    const t = texCache[kind] || (texCache[kind] = tex(D.draw));
    const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, toneMapped: false });
    if (D.tint) m.color.set(color);
    const o = new THREE.Mesh(stickerGeo, m); o.renderOrder = 2; return o;
  }
  function makeIncense(kind, color) {
    const g = new THREE.Group();
    const std = (c, extra = {}) => glow(new THREE.MeshStandardMaterial({ color: c, roughness: .6, ...extra }), 'mk-item');
    if (kind === 'marigold') {
      const m = new THREE.Mesh(itemGeo.marigold(), std(color)); m.position.y = .07; g.add(m); return g;
    }
    if (kind === 'lotusbud') {
      const m = new THREE.Mesh(itemGeo.bud(), std(color)); g.add(m);
      const leafM = std('#86C29A'); for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(itemGeo.petal(), leafM); l.scale.set(.6, .5, .6); l.rotation.set(-.3, i * 2.09, 0, 'YXZ'); g.add(l); }
      return g;
    }
    if (kind === 'lotusopen') {
      const mat = std(color), inner = std('#FFE7A3');
      for (let k = 0; k < 2; k++) for (let i = 0; i < 8; i++) { const l = new THREE.Mesh(itemGeo.petal(), mat); const sc = k ? .75 : 1; l.scale.setScalar(sc); l.rotation.set(k ? -1.05 : -.45, i * Math.PI / 4 + k * .39, 0, 'YXZ'); g.add(l); }
      const c = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), inner); c.position.y = .04; g.add(c); return g;
    }
    if (kind === 'garland') {
      const m = new THREE.Mesh(itemGeo.garland(), std(color, { roughness: .45 })); g.add(m);
      return g;
    }
    if (kind === 'leaf') { const m = new THREE.Mesh(itemGeo.leaf(), std(color, { flatShading: true })); g.add(m); return g; }
    if (kind === 'coin') { const m = new THREE.Mesh(itemGeo.coin(), new THREE.MeshStandardMaterial({ color, metalness: .75, roughness: .32 })); m.position.y = .007; g.add(m); return g; }
    if (kind === 'candle') {
      const body = new THREE.Mesh(candleGeo, glow(new THREE.MeshStandardMaterial({ color, roughness: .55 }), 'mk-candle'));
      const wick = new THREE.Mesh(wickGeo, new THREE.MeshBasicMaterial({ color: '#3a2a20' }));
      const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
      fl.position.y = .42; fl.scale.set(.14, .24, 1);
      const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .5, toneMapped: false }));
      gl.position.y = .4; gl.scale.set(.6, .6, 1);
      g.add(body, wick, fl, gl); flames.push(fl, gl); g.userData.flames = [fl, gl];
    } else {
      const n = kind === 'incense3' ? 3 : 1;
      for (let i = 0; i < n; i++) {
        const s = new THREE.Group();
        s.add(new THREE.Mesh(stickGeo, stickMat), new THREE.Mesh(coatGeo, coatMat), new THREE.Mesh(emberGeo, emberMat));
        const ember = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .8, toneMapped: false }));
        ember.position.y = .885; ember.scale.set(.12, .12, 1); s.add(ember);
        if (n === 3) { s.rotation.z = (i - 1) * .16; s.position.x = (i - 1) * .03; }
        g.add(s);
      }
    }
    return g;
  }
  function nearestVertex(x, y, z) {
    let best = 0, bd = 1e9;
    for (let i = 0; i < NV; i++) { const dx = P[i * 3] - x, dy = P[i * 3 + 1] - y, dz = P[i * 3 + 2] - z, d = dx * dx + dy * dy + dz * dz; if (d < bd) { bd = d; best = i; } }
    return best;
  }
  const pops = [];
  function addDecor(kind, vi, scale, color, basePos, animate = false) {
    const isInc = kind in INCENSE;
    const obj = isInc ? makeIncense(kind, color) : makeSticker(kind, color);
    const d = { kind, vi, obj, scale, color, base: basePos, inc: isInc };
    obj.scale.setScalar(animate ? .001 : scale); if (animate) pops.push({ obj, s: scale, t0: performance.now() });
    piece.add(obj); decor.push(d); updateDecor(d); dirty = true;
    return d;
  }
  const _n = new THREE.Vector3(), _p = new THREE.Vector3(), _dir = new THREE.Vector3(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _m = new THREE.Matrix4();
  function updateDecor(d) {
    if (d.base) { _p.fromArray(d.base); _n.set(0, 1, 0); }
    else { const N = geo.attributes.normal.array; _p.fromArray(P, d.vi * 3); _n.fromArray(N, d.vi * 3).normalize(); }
    if (d.inc) {
      _dir.copy(_n).lerp(UP, ORIENT[d.kind] ?? .8).normalize();
      d.obj.quaternion.setFromUnitVectors(UP, _dir);
      d.obj.position.copy(_p).addScaledVector(_dir, (d.kind === 'coin' || d.kind === 'garland' ? 0 : -.05) * d.scale);
    } else {
      // keep stickers upright: x along the horizon, y as close to world up as the surface allows
      _x.crossVectors(UP, _n); if (_x.lengthSq() < 1e-4) _x.set(1, 0, 0); _x.normalize(); _y.crossVectors(_n, _x);
      d.obj.quaternion.setFromRotationMatrix(_m.makeBasis(_x, _y, _n));
      d.obj.position.copy(_p).addScaledVector(_n, .012);
    }
  }
  function clearDecorObjs() {
    if (typeof selRing !== 'undefined' && selRing) { selRing.visible = false; selected = null; }
    for (const d of decor) { piece.remove(d.obj); d.obj.traverse(o => { if (o.material && o.material.map !== undefined && !o.isSprite && o.material !== stickMat && o.material !== coatMat && o.material !== emberMat) o.material.dispose?.(); }); }
    decor = []; flames = []; dirty = true;
  }
  function rebuildFlames() { flames = []; for (const d of decor) if (d.obj.userData.flames) flames.push(...d.obj.userData.flames); }

  /* -------- brushes -------- */
  const hitL = new THREE.Vector3(), nArea = new THREE.Vector3();
  function brush(hx, hy, hz, nx, ny, nz, mirror) {
    if (mirror) { hx = -hx; nx = -nx; }
    const R = radius(), R2 = R * R, s = st.strength, sub = st.sub, N = geo.attributes.normal.array;
    const sign = (sub === 'dig' || sub === 'deflate') ? -1 : 1;
    const list = [];
    for (let i = 0; i < NV; i++) {
      const dx = P[i * 3] - hx, dy = P[i * 3 + 1] - hy, dz = P[i * 3 + 2] - hz, d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > R2) continue;
      let f = 1 - d2 / R2; f *= f;
      if (sub === 'add' || sub === 'dig') { const a = .014 * s * f * sign; P[i * 3] += nx * a; P[i * 3 + 1] += ny * a; P[i * 3 + 2] += nz * a; }
      else if (sub === 'inflate' || sub === 'deflate') { const a = .012 * s * f * sign; P[i * 3] += N[i * 3] * a; P[i * 3 + 1] += N[i * 3 + 1] * a; P[i * 3 + 2] += N[i * 3 + 2] * a; }
      else if (sub === 'crease') { const a = .07 * s * f; P[i * 3] -= dx * a + nx * .004 * s * f; P[i * 3 + 1] -= dy * a + ny * .004 * s * f; P[i * 3 + 2] -= dz * a + nz * .004 * s * f; }
      else if (sub === 'smooth') list.push(i, f);
      else if (sub === 'flatten' || sub === 'scrape') {
        const dd = dx * nx + dy * ny + dz * nz;          // height above the touch plane
        if (sub === 'scrape' && dd < -.02) continue;
        const a = (sub === 'scrape' ? .5 : .3) * s * f * dd + (sub === 'scrape' ? .006 * s * f : 0);
        P[i * 3] -= nx * a; P[i * 3 + 1] -= ny * a; P[i * 3 + 2] -= nz * a;
      }
    }
    if (list.length) {
      const tmp = new Float32Array(list.length / 2 * 3);
      for (let j = 0; j < list.length; j += 2) {
        const i = list[j]; let ax = 0, ay = 0, az = 0; const a0 = adjStart[i], a1 = adjStart[i + 1];
        for (let k = a0; k < a1; k++) { const v = adjList[k]; ax += P[v * 3]; ay += P[v * 3 + 1]; az += P[v * 3 + 2]; }
        const c = a1 - a0 || 1; tmp[j / 2 * 3] = ax / c; tmp[j / 2 * 3 + 1] = ay / c; tmp[j / 2 * 3 + 2] = az / c;
      }
      for (let j = 0; j < list.length; j += 2) {
        const i = list[j], f = list[j + 1] * (.25 + .5 * s);
        P[i * 3] += (tmp[j / 2 * 3] - P[i * 3]) * f; P[i * 3 + 1] += (tmp[j / 2 * 3 + 1] - P[i * 3 + 1]) * f; P[i * 3 + 2] += (tmp[j / 2 * 3 + 2] - P[i * 3 + 2]) * f;
      }
    }
    geoDirty = true;
  }
  const paintCol = new THREE.Color();
  function texPaint(u, v) {
    if (!texG) return;
    const W = texCv.width, H = texCv.height, x = u * W, y = (1 - v) * H, r = Math.max(1.5, radius() * texK * W);
    const a = .3 + .55 * st.strength, gr = texG.createRadialGradient(x, y, 0, x, y, r);
    const c = '#' + paintCol.getHexString(THREE.SRGBColorSpace);
    gr.addColorStop(0, c); gr.addColorStop(.6, c); gr.addColorStop(1, c + '00');
    texG.globalAlpha = a; texG.fillStyle = gr; texG.beginPath(); texG.arc(x, y, r, 0, 7); texG.fill(); texG.globalAlpha = 1;
    texDirty = true;
  }
  function paint(hx, hy, hz, mirror) {
    if (mirror) hx = -hx;
    const R = radius(), R2 = R * R, a0 = .25 + .5 * st.strength;
    for (let i = 0; i < NV; i++) {
      const dx = P[i * 3] - hx, dy = P[i * 3 + 1] - hy, dz = P[i * 3 + 2] - hz, d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > R2) continue;
      const f = Math.min(1, (1 - d2 / R2) * 1.6) * a0;
      C[i * 3] += (paintCol.r - C[i * 3]) * f; C[i * 3 + 1] += (paintCol.g - C[i * 3 + 1]) * f; C[i * 3 + 2] += (paintCol.b - C[i * 3 + 2]) * f;
    }
    colDirty = true;
  }
  // grab
  let grab = null;
  const plane = new THREE.Plane(), ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), tmpV = new THREE.Vector3();
  function startGrab(hit) {
    const R = radius() * 1.25, R2 = R * R, pts = [];
    const sets = [[hit.point.x, 1]]; if (st.sym && Math.abs(hit.point.x) > R * .4) sets.push([-hit.point.x, -1]);
    for (const [hx, mx] of sets) {
      for (let i = 0; i < NV; i++) {
        const dx = P[i * 3] - hx, dy = P[i * 3 + 1] - hit.point.y, dz = P[i * 3 + 2] - hit.point.z, d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > R2) continue; let f = 1 - d2 / R2; f *= f; pts.push(i, f, mx);
      }
    }
    camera.getWorldDirection(tmpV); plane.setFromNormalAndCoplanarPoint(tmpV, hit.point);
    grab = { start: hit.point.clone(), pts, orig: P.slice() };
  }
  function moveGrab(cx, cy) {
    setRay(cx, cy); const p = ray.ray.intersectPlane(plane, tmpV); if (!p) return;
    const k = .6 + .8 * st.strength;
    const dx = (p.x - grab.start.x) * k, dy = (p.y - grab.start.y) * k, dz = (p.z - grab.start.z) * k;
    const { pts, orig } = grab;
    for (let j = 0; j < pts.length; j += 3) {
      const i = pts[j], f = pts[j + 1], m = pts[j + 2];
      P[i * 3] = orig[i * 3] + dx * f * m; P[i * 3 + 1] = orig[i * 3 + 1] + dy * f; P[i * 3 + 2] = orig[i * 3 + 2] + dz * f;
    }
    geoDirty = true;
  }

  /* -------- knife: cut off the smaller side of a swiped line -------- */
  const knife = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  knife.setAttribute('class', 'knife'); knife.innerHTML = '<line stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 9"/>';
  host.appendChild(knife);
  const kLine = knife.firstChild;
  function knifeShow(a, b) {
    const r = host.getBoundingClientRect();
    kLine.setAttribute('x1', a.x - r.left); kLine.setAttribute('y1', a.y - r.top); kLine.setAttribute('x2', b.x - r.left); kLine.setAttribute('y2', b.y - r.top);
    knife.style.display = 'block';
  }
  function knifeCut(a, b) {
    knife.style.display = 'none';
    if (Math.hypot(a.x - b.x, a.y - b.y) < 24) return false;
    setRay(a.x, a.y); const d1 = ray.ray.direction.clone();
    setRay(b.x, b.y); const d2 = ray.ray.direction.clone();
    const n = new THREE.Vector3().crossVectors(d1, d2).normalize(), o = camera.position;
    let pos = 0, neg = 0;
    for (let i = 0; i < NV; i++) (P[i * 3] - o.x) * n.x + (P[i * 3 + 1] - o.y) * n.y + (P[i * 3 + 2] - o.z) * n.z > 0 ? pos++ : neg++;
    if (!pos || !neg) return false;
    const side = pos < neg ? 1 : -1;
    pushUndo();
    for (let i = 0; i < NV; i++) {
      const dd = (P[i * 3] - o.x) * n.x + (P[i * 3 + 1] - o.y) * n.y + (P[i * 3 + 2] - o.z) * n.z;
      if (dd * side > 0) { P[i * 3] -= n.x * dd; P[i * 3 + 1] -= n.y * dd; P[i * 3 + 2] -= n.z * dd; }
    }
    // drop decorations that were on the removed side
    decor = decor.filter(dc => {
      const q = dc.obj.position, dd = (q.x - o.x) * n.x + (q.y - o.y) * n.y + (q.z - o.z) * n.z;
      if (dd * side > .02) { piece.remove(dc.obj); return false; } return true;
    });
    rebuildFlames(); geoDirty = true; onChange(); onAction('cut'); return true;
  }
  function bbox() { let a = [1e9, 1e9, 1e9], b = [-1e9, -1e9, -1e9]; for (let i = 0; i < NV; i++) for (let k = 0; k < 3; k++) { const v = P[i * 3 + k]; if (v < a[k]) a[k] = v; if (v > b[k]) b[k] = v; } return { w: Math.max(b[0] - a[0], b[2] - a[2]), h: b[1] - a[1] }; }
  function scaleAll(sx, sy) {
    const bb = bbox();
    if ((sx > 1 && bb.w * sx > 2.5) || (sx < 1 && bb.w * sx < .55) || (sy > 1 && bb.h * sy > 2.1) || (sy < 1 && bb.h * sy < .3)) return false;
    pushUndo();
    for (let i = 0; i < NV; i++) { P[i * 3] *= sx; P[i * 3 + 2] *= sx; P[i * 3 + 1] = BASE_TOP - .06 + (P[i * 3 + 1] - BASE_TOP + .06) * sy; }
    for (const d of decor) if (d.base) { d.base[0] *= sx; d.base[2] *= sx; }
    geoDirty = true; onChange(); return true;
  }

  /* -------- select / delete decorations -------- */
  let selected = null;
  const selRing = new THREE.Mesh(new THREE.RingGeometry(.8, 1, 32), new THREE.MeshBasicMaterial({ color: '#EB92B3', transparent: true, opacity: .95, depthTest: false, side: THREE.DoubleSide }));
  selRing.renderOrder = 11; selRing.visible = false; scene.add(selRing);
  void selRing;
  function pickDecor(cx, cy) {
    if (!decor.length) return null;
    setRay(cx, cy); ray.camera = camera;
    const h = ray.intersectObjects(decor.map(d => d.obj), true)[0];
    if (h) { let o = h.object; while (o && !decor.some(d => d.obj === o)) o = o.parent; const d = decor.find(x => x.obj === o); if (d) return d; }
    // finger-friendly: nearest item within ~30 px of the tap
    let best = null, bd = 30;
    for (const d of decor) { const q = screenOf(d); const dist = Math.hypot(q.x - cx, q.y - cy); if (dist < bd) { bd = dist; best = d; } }
    return best;
  }
  const _sv = new THREE.Vector3();
  function screenOf(d) {
    const r = canvas.getBoundingClientRect();
    _sv.set(0, d.inc && !['coin', 'garland'].includes(d.kind) ? .35 : 0, 0); d.obj.localToWorld(_sv); _sv.project(camera);
    return { x: r.left + (_sv.x + 1) / 2 * r.width, y: r.top + (1 - _sv.y) / 2 * r.height };
  }
  function select(d) {
    selected = d;
    if (d) { selRing.position.copy(d.obj.position); selRing.quaternion.copy(camera.quaternion); selRing.scale.setScalar(.12 + .12 * d.scale); }
    selRing.visible = !!d; dirty = true; onSelect(d ? (d.inc ? INCENSE[d.kind] : DECOR[d.kind].th) : null);
  }
  function deleteSelected() {
    if (!selected) return;
    pushUndo();
    piece.remove(selected.obj); decor = decor.filter(d => d !== selected);
    rebuildFlames(); select(null); onChange(); onAction('delete');
  }

  /* -------- picking -------- */
  function setRay(cx, cy) {
    const r = canvas.getBoundingClientRect();
    ndc.set((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera);
  }
  function pick(cx, cy) {
    setRay(cx, cy);
    const h = ray.intersectObjects([clay, base], false)[0];
    if (!h) return null;
    const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
    return { obj: h.object === clay ? 'clay' : 'base', point: h.point.clone(), normal: n, uv: h.object === clay && h.uv ? h.uv.clone() : null };
  }
  function showCursor(hit) {
    cursor.visible = true; cursor.position.copy(hit.point).addScaledVector(hit.normal, .01);
    cursor.quaternion.setFromUnitVectors(ZAX, hit.normal); cursor.scale.setScalar(radius()); dirty = true;
  }

  /* -------- actions -------- */
  function canUse(hit) {
    if (st.tab === 'view') return false;
    if (st.tab === 'shape' || st.tab === 'decor') return hit.obj === 'clay';
    return true;
  }
  function doStroke(hit) {
    if (st.tab === 'shape') {
      const p = hit.point, n = hit.normal;
      brush(p.x, p.y, p.z, n.x, n.y, n.z, false);
      if (st.sym && Math.abs(p.x) > radius() * .4) brush(p.x, p.y, p.z, n.x, n.y, n.z, true);
    } else if (st.tab === 'paint' && st.sub === 'brush') {
      if (hit.obj === 'base') { baseMat.color.set(st.color); dirty = true; return; }
      paint(hit.point.x, hit.point.y, hit.point.z, false);
      if (hit.uv) texPaint(hit.uv.x, hit.uv.y);
      if (tex && st.sym && Math.abs(hit.point.x) > radius() * .4) { const vi = nearestVertex(-hit.point.x, hit.point.y, hit.point.z); if (TM[vi] > 0) texPaint(UV[vi * 2], UV[vi * 2 + 1]); }
      if (st.sym && Math.abs(hit.point.x) > radius() * .4) paint(hit.point.x, hit.point.y, hit.point.z, true);
    }
    showCursor(hit);
  }
  function place(hit) {
    const kind = st.sub, isInc = kind in INCENSE;
    const scale = isInc ? (kind.startsWith('incense') || kind === 'candle' ? .42 + st.size * .6 : .7 + st.size * 1.3) : DECOR[kind].size * (.5 + st.size * 1.4) * 2;
    const color = isInc && st.itemColor[kind] ? st.itemColor[kind] : st.color;
    const put = (x, y, z) => {
      if (hit.obj === 'base') addDecor(kind, -1, scale, color, [x, BASE_TOP, z], true);
      else addDecor(kind, nearestVertex(x, y, z), scale, color, null, true);
    };
    const p = hit.point; put(p.x, p.y, p.z); onAction('place');
    const pair = isInc || DECOR[kind]?.pair;
    if (st.sym && pair && Math.abs(p.x) > .07) put(-p.x, p.y, p.z);
    rebuildFlames();
  }
  function begin(hit) {
    pushUndo();
    const { tab, sub } = st;
    if (tab === 'shape') { if (sub === 'grab') { startGrab(hit); showCursor(hit); return 'grab'; } doStroke(hit); return 'stroke'; }
    if (tab === 'paint') {
      if (sub === 'brush') { doStroke(hit); return 'stroke'; }
      if (hit.obj === 'base') baseMat.color.set(st.color);
      else if (sub === 'fill') { for (let i = 0; i < NV; i++) { C[i * 3] = paintCol.r; C[i * 3 + 1] = paintCol.g; C[i * 3 + 2] = paintCol.b; } colDirty = true; }
      else gradientFill(BRAND);
      if (tex && hit.obj !== 'base') { TM.fill(0); geo.attributes.texMix.needsUpdate = true; }   // a full fill covers the photo (undo brings it back)
      dirty = true; return 'tap';
    }
    place(hit); return 'tap';
  }

  /* -------- pointer input -------- */
  const pointers = new Map();
  let mode = null, last = null, pinch0 = null, pending = null, kStart = null, press = null;
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault(); canvas.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      if (mode === 'stroke' || mode === 'grab') endStroke();
      if (mode === 'knife') knife.style.display = 'none';
      if (mode === 'press') clearTimeout(press.timer);
      mode = 'pinch'; const [a, b] = [...pointers.values()];
      pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: view.fit, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      return;
    }
    if (pointers.size > 2) return;
    last = { x: e.clientX, y: e.clientY };
    if (st.tab === 'shape' && st.sub === 'slice') { mode = 'knife'; kStart = { ...last }; return; }
    if (st.tab === 'decor' || st.tab === 'incense') {
      // tap = place (even on top of other items) · press and hold = pick an item to delete
      if (selected) select(null);
      const sx = e.clientX, sy = e.clientY;
      mode = 'press';
      press = { x: sx, y: sy, fired: false, timer: setTimeout(() => {
        press.fired = true; const d = pickDecor(sx, sy);
        if (d) { select(d); navigator.vibrate?.(12); onAction('select'); mode = 'tap'; } else mode = 'orbit';
      }, 450) };
      return;
    }
    const hit = pick(e.clientX, e.clientY);
    mode = hit && canUse(hit) ? begin(hit) : 'orbit';
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (mode === 'pinch' && pointers.size === 2) {
      const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      view.fit = Math.min(14, Math.max(3, pinch0.dist * pinch0.d / Math.max(20, d)));
      view.yaw -= (mx - pinch0.mx) * .008; view.pitch = Math.min(1.2, Math.max(-.15, view.pitch + (my - pinch0.my) * .005));
      pinch0.mx = mx; pinch0.my = my; placeCamera(); return;
    }
    if (mode === 'orbit') {
      view.yaw -= (e.clientX - last.x) * .009; view.pitch = Math.min(1.2, Math.max(-.15, view.pitch + (e.clientY - last.y) * .006));
      last = { x: e.clientX, y: e.clientY }; placeCamera(); return;
    }
    if (mode === 'press' && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) { clearTimeout(press.timer); mode = 'orbit'; last = { x: e.clientX, y: e.clientY }; return; }
    if (mode === 'knife') { knifeShow(kStart, { x: e.clientX, y: e.clientY }); return; }
    if (mode === 'stroke' || mode === 'grab') pending = { x: e.clientX, y: e.clientY };
  });
  const up = (e) => {
    pointers.delete(e.pointerId);
    if (mode === 'press') { clearTimeout(press.timer); if (!press.fired) { const hit = pick(press.x, press.y); if (hit && canUse(hit)) begin(hit); } mode = null; }
    if (mode === 'knife') { knifeCut(kStart, { x: e.clientX, y: e.clientY }); mode = null; }
    if (mode === 'stroke' || mode === 'grab') endStroke();
    if (pointers.size === 1 && mode === 'pinch') { const p = [...pointers.values()][0]; last = { x: p.x, y: p.y }; mode = 'orbit'; }
    else if (!pointers.size) mode = null;
  };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); view.fit = Math.min(14, Math.max(3, view.fit * (1 + e.deltaY * .001))); placeCamera(); }, { passive: false });
  function endStroke() { grab = null; pending = null; cursor.visible = false; mode = null; dirty = true; geoDirty = true; onChange(); }

  /* -------- camera / size -------- */
  function placeCamera() {
    const d = view.fit;
    camera.position.set(Math.sin(view.yaw) * Math.cos(view.pitch) * d, target.y + Math.sin(view.pitch) * d, Math.cos(view.yaw) * Math.cos(view.pitch) * d);
    camera.lookAt(target); dirty = true;
  }
  function resize() {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    const t = Math.tan(THREE.MathUtils.degToRad(19));
    view.fit = Math.max(1.75 / (t * camera.aspect), 1.5 / t);
    placeCamera();
  }
  const ro = new ResizeObserver(resize); ro.observe(host);

  /* -------- loop -------- */
  let raf = 0, frameN = 0, paused = false, camTween = null;
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (paused || document.hidden) return;
    frameN++;
    if (pending) {
      const p = pending; pending = null;
      if (mode === 'grab') moveGrab(p.x, p.y);
      else if (mode === 'stroke') { const hit = pick(p.x, p.y); if (hit && canUse(hit)) doStroke(hit); }
    }
    const now = performance.now();
    if (morph) {
      const k0 = Math.min(1, (now - morph.t0) / 520), k = 1 - Math.pow(1 - k0, 3) + Math.sin(k0 * Math.PI) * .06;
      for (let i = 0; i < NV * 3; i++) { P[i] = morph.fromP[i] + (morph.toP[i] - morph.fromP[i]) * k; C[i] = morph.fromC[i] + (morph.toC[i] - morph.fromC[i]) * Math.min(1, k0 * 1.4); }
      geoDirty = true; colDirty = true; if (k0 >= 1) { P.set(morph.toP); morph = null; }
    }
    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i], k = Math.min(1, (now - p.t0) / 320), e = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
      p.obj.scale.setScalar(Math.max(.001, p.s * e)); dirty = true; if (k >= 1) { p.obj.scale.setScalar(p.s); pops.splice(i, 1); }
    }
    if (camTween) {
      const k0 = Math.min(1, (now - camTween.t0) / 480), k = 1 - Math.pow(1 - k0, 3);
      view.yaw = camTween.y0 + (camTween.y1 - camTween.y0) * k; view.pitch = camTween.p0 + (camTween.p1 - camTween.p0) * k;
      placeCamera(); if (k0 >= 1) camTween = null;
    }
    if (geoDirty) {
      geo.computeVertexNormals(); geo.attributes.position.needsUpdate = true; geo.computeBoundingSphere();
      for (const d of decor) updateDecor(d);
      geoDirty = false; dirty = true;
    }
    if (texDirty && tex) { tex.needsUpdate = true; texDirty = false; dirty = true; }
    if (colDirty) { geo.attributes.color.needsUpdate = true; colDirty = false; dirty = true; }
    if (flames.length && frameN % 2 === 0) {
      const s = 1 + Math.sin(t * .013) * .06 + Math.sin(t * .031) * .04;
      for (const f of flames) { if (!f.userData.s0) f.userData.s0 = f.scale.clone(); f.scale.set(f.userData.s0.x * s, f.userData.s0.y * (2 - s), 1); }
      dirty = true;
    }
    if (selRing.visible && selected) { selRing.position.copy(selected.obj.position); selRing.quaternion.copy(camera.quaternion); }
    if (dirty) { renderer.render(scene, camera); dirty = false; }
  }
  raf = requestAnimationFrame(frame);

  /* -------- snapshot (transparent PNG cropped to the piece) -------- */
  function snapshot(max = 640) {
    cursor.visible = false; const sr = selRing.visible; selRing.visible = false;
    renderer.render(scene, camera);
    selRing.visible = sr; dirty = true;
    const src = renderer.domElement, W = src.width, H = src.height;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(src, 0, 0);
    const d = g.getImageData(0, 0, W, H).data; let x0 = W, x1 = 0, y0 = H, y1 = 0;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 <= x0) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
    const pad = 8, sw = x1 - x0 + pad * 2, sh = y1 - y0 + pad * 2, k = Math.min(1, max / Math.max(sw, sh));
    const out = document.createElement('canvas'); out.width = Math.round(sw * k); out.height = Math.round(sh * k);
    out.getContext('2d').drawImage(c, x0 - pad, y0 - pad, sw, sh, 0, 0, out.width, out.height);
    return out;
  }

  /* -------- public api -------- */
  paintCol.set(st.color);
  applyTemplate('krathong');
  resize();
  return {
    setTool(tab, sub) { st.tab = tab; if (sub) st.sub = sub; },
    setColor(hex) { st.color = hex; paintCol.set(hex); if (st.tab === 'incense' && st.sub in st.itemColor) st.itemColor[st.sub] = hex; },
    itemColor(k) { return st.itemColor[k]; },
    brushPx() { const h = host.clientHeight || 1; return radius() * (h / 2) / (Math.tan(THREE.MathUtils.degToRad(19)) * view.fit); },
    setSize(v) { st.size = v; }, setStrength(v) { st.strength = v; }, setSymmetry(b) { st.sym = b; },
    get state() { return { ...st, canUndo: undoStack.length > 0, canRedo: redoStack.length > 0, decorCount: decor.length }; },
    undo() { select(null); undo(); }, redo() { select(null); redo(); }, reset: applyTemplate,
    scaleAll, deleteSelected, deselect() { select(null); },
    _decorScreen() { return decor.map(screenOf); },
    gradient(stops) { gradientFill(stops); },
    get dirtyWork() { return undoStack.length > 0; },
    clearDecor() { if (!decor.length) return; pushUndo(); clearDecorObjs(); onChange(); },
    frontView(instant) {
      const y1 = Math.round(view.yaw / (Math.PI * 2)) * Math.PI * 2;
      if (instant) { view.yaw = y1; view.pitch = .22; resize(); return; }
      camTween = { y0: view.yaw, y1, p0: view.pitch, p1: .22, t0: performance.now() };
    },
    setBaseSize(v) { baseScale = Math.min(1.35, Math.max(.8, v)); base.scale.set(baseScale, 1, baseScale); dirty = true; },
    get baseSize() { return baseScale; },
    placeTop(kind, ang, rf, color, scale) {   // for ready-made krathongs
      let R = 0; for (let i = 0; i < NV; i++) R = Math.max(R, Math.hypot(P[i * 3], P[i * 3 + 2]));
      const tx = Math.cos(ang) * R * rf, tz = Math.sin(ang) * R * rf; let best = 0, bs = -1e9;
      for (let i = 0; i < NV; i++) { const d = Math.hypot(P[i * 3] - tx, P[i * 3 + 2] - tz); if (d < R * .08) { const sc = P[i * 3 + 1] - d * 2; if (sc > bs) { bs = sc; best = i; } } }
      addDecor(kind, best, scale, color || ITEM_COLOR[kind] || st.color, null); rebuildFlames();
    },
    snapshot, resize,
    pause() { paused = true; }, resume() { paused = false; dirty = true; resize(); },
  };
}
