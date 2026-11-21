// 2D drawings of the Moldable blobs (canvas) — light enough for helper bubbles and pins.
import { CHARDATA } from './chardata.js?v=12';

export const CHARS = CHARDATA;
export const CHAR_KEYS = ['gumdrop', 'diamond', 'splat', 'flower', 'cloud'];

// Which blob helps with which tool (matches each person's skill).
export const HELPERS = {
  template: { key: 'gumdrop', tip: 'เลือกทรงที่ชอบ หรือกด "สุ่ม" ให้จัดให้ทั้งใบเลย' },
  shape:   { key: 'diamond', tip: 'กดยืดหดได้เลย หรือลากบนก้อนเพื่อดึง ลากที่ว่างเพื่อหมุน' },
  paint:   { key: 'splat',   tip: 'แตะชุดสี ได้สีทั้งใบทีเดียว หรือเลือกพู่กันระบายเอง' },
  decor:   { key: 'flower',  tip: 'แตะหน้าสำเร็จรูปได้เลย หรือเลือกชิ้นเดี่ยวแล้วแตะวางบนกระทง' },
  incense: { key: 'cloud',   tip: 'แตะชุดธูปเทียนหรือดอกไม้ ใส่ให้ครบทีเดียว' },
  done:    { key: 'gumdrop', tip: 'สวยมาก! เก็บรูปไว้ก่อน แล้วไปลอยกัน' },
};

const INK = '#202429', WHITE = '#f4f4f6';

function superPath(g, a, b, p) {
  g.beginPath();
  for (let i = 0; i <= 64; i++) {
    const t = i / 64 * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    const x = a * Math.sign(c) * Math.pow(Math.abs(c), 2 / p), y = b * Math.sign(s) * Math.pow(Math.abs(s), 2 / p);
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath();
}

/** Outline points (body units, y up). */
export function outline(key) {
  const p = CHARS[key].p, N = p.length;
  return p.map((r, i) => { const t = i / N * Math.PI * 2; return [r * Math.cos(t), r * Math.sin(t)]; });
}

/**
 * Draw a character into a canvas. mood: 'smile' | 'happy' (closed arcs) | 'normal'
 */
export function drawChar(cv, key, { size = 64, mood = 'normal' } = {}) {
  const C = CHARS[key], g = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = cv.height = Math.round(size * dpr);
  cv.style.width = cv.style.height = size + 'px';
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, size, size);
  const pts = outline(key);
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const s = size * .9 / Math.max(x1 - x0, y1 - y0);
  g.translate(size / 2, size / 2); g.scale(s, -s); g.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
  // body
  g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath();
  const gr = g.createLinearGradient(0, y1, 0, y0);
  gr.addColorStop(0, C.colors.top); gr.addColorStop(.55, C.colors.mid); gr.addColorStop(1, C.colors.bottom);
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  const hl = g.createRadialGradient(x0 + (x1 - x0) * .3, y1 - (y1 - y0) * .2, 0, x0 + (x1 - x0) * .3, y1 - (y1 - y0) * .2, (x1 - x0) * .7);
  hl.addColorStop(0, 'rgba(255,255,255,.45)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = hl; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.restore();
  // eyes
  const E = C.eye, S = 1.1;
  for (const [ex, ey] of E.pos) {
    const w = E.w * S, h = E.h * S;
    g.save(); g.translate(ex, ey); g.rotate(E.rot || 0);
    if (mood === 'happy') {
      g.lineCap = 'round'; g.lineWidth = Math.max(.014, .16 * Math.min(w, h)); g.strokeStyle = INK;
      g.beginPath(); g.moveTo(-w * .85, -h * .15); g.quadraticCurveTo(0, h * .8, w * .85, -h * .15); g.stroke();
    } else {
      superPath(g, w, h, E.p); g.fillStyle = WHITE; g.fill();
      g.save(); superPath(g, w, h, E.p); g.clip();
      g.fillStyle = INK; g.beginPath(); g.ellipse(E.pdx * w * .5, E.pdy * h * .5, E.pw * w, E.ph * h, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(w * .5, h * .45, w * .12, h * .2, -.6, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    g.restore();
  }
  // mouth
  const m = C.mouth;
  g.save(); g.translate(m.x, m.y); g.fillStyle = INK; g.strokeStyle = INK; g.lineCap = 'round';
  if (mood === 'normal' && m.up > .01 && m.down > .01) {
    g.beginPath(); g.ellipse(0, 0, m.w, (m.up + m.down) / 2, 0, 0, Math.PI * 2); g.fill();
  } else if (mood !== 'normal' || m.down > .01) {
    const w = Math.max(m.w, .045), d = Math.max(m.down, .04);
    g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(0, -d * 2.2, w, 0); g.closePath(); g.fill();
  } else {
    g.lineWidth = Math.max(.014, m.t * 3); const c = Math.max(m.curve, .02);
    g.beginPath(); g.moveTo(-m.w, c * .5); g.quadraticCurveTo(0, -c * 1.2, m.w, c * .5); g.stroke();
  }
  g.restore();
  return cv;
}

export function charCanvas(key, opts) { return drawChar(document.createElement('canvas'), key, opts); }
