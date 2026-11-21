// Photo → clay shape. Runs fully on the device: the photo is never uploaded.
// 1) guess the background from the photo's border colours, 2) keep the biggest object,
// 3) read its outline as a radial profile (the same kind of profile the blob characters use),
// 4) build a soft, posterised colour map so the clay gets the photo's colours in pastel patches.
const N = 180;            // profile samples
const WORK = 256;         // analysis size (longest side)

export async function loadImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.decoding = 'async'; img.src = url;
    await img.decode();
    return img;
  } finally { setTimeout(() => URL.revokeObjectURL(url), 4000); }
}

function kmeans(px, k, iters = 8) {   // px: array of [r,g,b]
  if (!px.length) return [[255, 255, 255]];
  const c = Array.from({ length: k }, (_, i) => px[Math.floor((i + .5) / k * px.length)].slice());
  for (let it = 0; it < iters; it++) {
    const sum = c.map(() => [0, 0, 0, 0]);
    for (const p of px) { let b = 0, bd = 1e9; for (let j = 0; j < k; j++) { const d = (p[0] - c[j][0]) ** 2 + (p[1] - c[j][1]) ** 2 + (p[2] - c[j][2]) ** 2; if (d < bd) { bd = d; b = j; } } const s = sum[b]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; }
    for (let j = 0; j < k; j++) if (sum[j][3]) c[j] = [sum[j][0] / sum[j][3], sum[j][1] / sum[j][3], sum[j][2] / sum[j][3]];
  }
  return c;
}

export function analyze(img) {
  const k = Math.min(1, WORK / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(8, Math.round(img.naturalWidth * k)), h = Math.max(8, Math.round(img.naturalHeight * k));
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h);
  const data = g.getImageData(0, 0, w, h).data;
  // background colours = clusters of the border ring
  const ring = [], bw = Math.max(2, Math.round(Math.min(w, h) * .04));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (x >= bw && y >= bw && x < w - bw && y < h - bw) continue;
    if ((x + y) % 2) continue;
    const i = (y * w + x) * 4; ring.push([data[i], data[i + 1], data[i + 2]]);
  }
  const bg = kmeans(ring, 3);
  let dist = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    let m = 1e9; for (const c of bg) { const d = (data[i * 4] - c[0]) ** 2 + (data[i * 4 + 1] - c[1]) ** 2 + (data[i * 4 + 2] - c[2]) ** 2; if (d < m) m = d; }
    dist[i] = Math.sqrt(m);
  }
  for (let pass = 0; pass < 2; pass++) dist = boxBlur(dist, w, h);
  // Otsu on the distance histogram gives a sensible starting threshold
  const hist = new Float64Array(256); for (const d of dist) hist[Math.min(255, Math.round(d * 255 / 442))]++;
  let total = w * h, sumAll = 0; for (let i = 0; i < 256; i++) sumAll += i * hist[i];
  let wB = 0, sumB = 0, best = 0, auto = 40;
  for (let i = 0; i < 256; i++) { wB += hist[i]; if (!wB) continue; const wF = total - wB; if (!wF) break; sumB += i * hist[i]; const mB = sumB / wB, mF = (sumAll - sumB) / wF, v = wB * wF * (mB - mF) ** 2; if (v > best) { best = v; auto = i * 442 / 255; } }
  return { w, h, data, dist, auto: Math.max(14, Math.min(140, auto)) };
}

function boxBlur(src, w, h) {
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h) { s += src[yy * w + xx]; n++; } }
    out[y * w + x] = s / n;
  }
  return out;
}

/** Foreground mask for a threshold: biggest object, holes filled. Returns null if nothing usable. */
export function mask(an, T) {
  const { w, h, dist } = an, n = w * h, m = new Uint8Array(n);
  for (let i = 0; i < n; i++) m[i] = dist[i] > T ? 1 : 0;
  // keep the biggest connected piece
  const lab = new Int32Array(n), q = new Int32Array(n); let bestLab = 0, bestSize = 0, cur = 0;
  for (let s = 0; s < n; s++) {
    if (!m[s] || lab[s]) continue;
    cur++; let head = 0, tail = 0, size = 0; q[tail++] = s; lab[s] = cur;
    while (head < tail) {
      const p = q[head++]; size++; const x = p % w, y = (p / w) | 0;
      if (x > 0 && m[p - 1] && !lab[p - 1]) { lab[p - 1] = cur; q[tail++] = p - 1; }
      if (x < w - 1 && m[p + 1] && !lab[p + 1]) { lab[p + 1] = cur; q[tail++] = p + 1; }
      if (y > 0 && m[p - w] && !lab[p - w]) { lab[p - w] = cur; q[tail++] = p - w; }
      if (y < h - 1 && m[p + w] && !lab[p + w]) { lab[p + w] = cur; q[tail++] = p + w; }
    }
    if (size > bestSize) { bestSize = size; bestLab = cur; }
  }
  if (bestSize < n * .02) return null;
  for (let i = 0; i < n; i++) m[i] = lab[i] === bestLab ? 1 : 0;
  // fill holes: anything not reachable from the border through background is inside
  const out = new Uint8Array(n); let head = 0, tail = 0;
  const push = (p) => { if (!m[p] && !out[p]) { out[p] = 1; q[tail++] = p; } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (head < tail) { const p = q[head++], x = p % w, y = (p / w) | 0; if (x > 0) push(p - 1); if (x < w - 1) push(p + 1); if (y > 0) push(p - w); if (y < h - 1) push(p + w); }
  for (let i = 0; i < n; i++) m[i] = out[i] ? 0 : 1;
  if (bestSize > n * .97) return null;   // everything selected = background not found
  return m;
}

/** Turn a mask into a radial profile + colour lookup in profile space (x right, y up, |r| ≤ 1). */
export function toShape(an, m) {
  const { w, h, data } = an;
  let cx = 0, cy = 0, cnt = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m[y * w + x]) { cx += x; cy += y; cnt++; }
  cx /= cnt; cy /= cnt;
  const raw = new Float32Array(N), maxR = Math.hypot(w, h);
  for (let a = 0; a < N; a++) {
    const t = a / N * Math.PI * 2, dx = Math.cos(t), dy = -Math.sin(t); let far = 1;
    for (let r = 0; r < maxR; r += .5) { const x = Math.round(cx + dx * r), y = Math.round(cy + dy * r); if (x < 0 || y < 0 || x >= w || y >= h) break; if (m[y * w + x]) far = r; }
    raw[a] = far;
  }
  const prof = new Float32Array(N); let R = 0;
  for (let a = 0; a < N; a++) { let s = 0, ws = 0; for (let j = -4; j <= 4; j++) { const wt = Math.exp(-(j * j) / 8); s += raw[(a + j + N) % N] * wt; ws += wt; } prof[a] = s / ws; R = Math.max(R, prof[a]); }
  for (let a = 0; a < N; a++) prof[a] /= R;

  // colour grid: average photo colour per cell, fill the outside by spreading, then posterise to pastel patches
  const G = 40, gs = Math.max(w, h) / G, gw = Math.ceil(w / gs), gh = Math.ceil(h / gs);
  const col = new Float32Array(gw * gh * 3), known = new Uint8Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = Math.floor(gy * gs); y < Math.min(h, (gy + 1) * gs); y++) for (let x = Math.floor(gx * gs); x < Math.min(w, (gx + 1) * gs); x++) if (m[y * w + x]) { const i = (y * w + x) * 4; r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
    if (n) { const k = gy * gw + gx; col[k * 3] = r / n; col[k * 3 + 1] = g / n; col[k * 3 + 2] = b / n; known[k] = 1; }
  }
  const px = []; for (let k = 0; k < gw * gh; k++) if (known[k]) px.push([col[k * 3], col[k * 3 + 1], col[k * 3 + 2]]);
  const pal = kmeans(px, Math.min(5, Math.max(1, px.length)), 10).map(c => {
    const l = .2; return [c[0] + (255 - c[0]) * l, c[1] + (255 - c[1]) * l, c[2] + (255 - c[2]) * l];   // pastel lift
  });
  for (let k = 0; k < gw * gh; k++) if (known[k]) {
    let b = 0, bd = 1e9; for (let j = 0; j < pal.length; j++) { const d = (col[k * 3] - pal[j][0]) ** 2 + (col[k * 3 + 1] - pal[j][1]) ** 2 + (col[k * 3 + 2] - pal[j][2]) ** 2; if (d < bd) { bd = d; b = j; } }
    col[k * 3] = pal[b][0]; col[k * 3 + 1] = pal[b][1]; col[k * 3 + 2] = pal[b][2];
  }
  for (let pass = 0; pass < 60; pass++) {   // spread colour into unknown cells
    let changed = false;
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
      const k = gy * gw + gx; if (known[k]) continue;
      let r = 0, g = 0, b = 0, n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = gx + dx, yy = gy + dy; if (xx < 0 || yy < 0 || xx >= gw || yy >= gh) continue; const kk = yy * gw + xx; if (known[kk] === 1) { r += col[kk * 3]; g += col[kk * 3 + 1]; b += col[kk * 3 + 2]; n++; } }
      if (n) { col[k * 3] = r / n; col[k * 3 + 1] = g / n; col[k * 3 + 2] = b / n; known[k] = 2; changed = true; }
    }
    for (let k = 0; k < gw * gh; k++) if (known[k] === 2) known[k] = 1;
    if (!changed) break;
  }
  const at = (gx, gy) => { gx = Math.max(0, Math.min(gw - 1, gx)); gy = Math.max(0, Math.min(gh - 1, gy)); const k = gy * gw + gx; return [col[k * 3], col[k * 3 + 1], col[k * 3 + 2]]; };
  /** x, y in profile space → [r, g, b] 0..1 (sRGB), bilinear so patches blend softly */
  const colorAt = (x, y) => {
    const fx = (cx + x * R) / gs - .5, fy = (cy - y * R) / gs - .5, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
    const a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), d = at(x0 + 1, y0 + 1), o = [0, 0, 0];
    for (let i = 0; i < 3; i++) o[i] = ((a[i] * (1 - tx) + b[i] * tx) * (1 - ty) + (c[i] * (1 - tx) + d[i] * tx) * ty) / 255;
    return o;
  };
  const aspect = 1;
  return { profile: prof, colorAt, palette: pal, aspect };
}

/** Draw the photo with the chosen object lit and an outline, for the preview. */
export function drawPreview(cv, img, an, m) {
  const { w, h } = an, dpr = Math.min(2, devicePixelRatio || 1);
  const box = cv.parentElement.getBoundingClientRect(), k = Math.min(box.width / w, box.height / h);
  cv.width = Math.round(w * k * dpr); cv.height = Math.round(h * k * dpr);
  cv.style.width = Math.round(w * k) + 'px'; cv.style.height = Math.round(h * k) + 'px';
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0, cv.width, cv.height);
  if (!m) { g.fillStyle = 'rgba(21,24,48,.55)'; g.fillRect(0, 0, cv.width, cv.height); return; }
  const ov = document.createElement('canvas'); ov.width = w; ov.height = h;
  const og = ov.getContext('2d'), id = og.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const x = i % w, y = (i / w) | 0;
    const edge = m[i] && (x === 0 || y === 0 || x === w - 1 || y === h - 1 || !m[i - 1] || !m[i + 1] || !m[i - w] || !m[i + w]);
    if (edge) { id.data[i * 4] = 235; id.data[i * 4 + 1] = 146; id.data[i * 4 + 2] = 179; id.data[i * 4 + 3] = 255; }
    else if (!m[i]) { id.data[i * 4] = 21; id.data[i * 4 + 1] = 24; id.data[i * 4 + 2] = 48; id.data[i * 4 + 3] = 170; }
  }
  og.putImageData(id, 0, 0);
  g.imageSmoothingEnabled = true; g.drawImage(ov, 0, 0, cv.width, cv.height);
}
