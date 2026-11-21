// 2.5D moonlit scene shared by the intro, the river room and the save card.
// paintBackdrop() draws the still layers once; createLife() animates stars, sky lanterns, moonlight and fireflies.
import { CHAR_KEYS, charCanvas } from './characters.js?v=16';

const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
export const MORPH = { peri: '#9BB0DE', lilac: '#CBA5D1', pink: '#EB92B3', teal: '#7FA9B1', primary: '#5A68B5', ink: '#252941' };

function cloud(g, x, y, w, color) {
  // one soft puffy silhouette (single path so overlaps don't stack opacity)
  g.fillStyle = color; g.beginPath();
  g.moveTo(x - .42 * w, y + .2 * w);
  g.bezierCurveTo(x - .62 * w, y + .2 * w, x - .6 * w, y - .12 * w, x - .3 * w, y - .06 * w);
  g.bezierCurveTo(x - .26 * w, y - .42 * w, x + .2 * w, y - .5 * w, x + .3 * w, y - .2 * w);
  g.bezierCurveTo(x + .5 * w, y - .38 * w, x + .9 * w, y - .2 * w, x + .78 * w, y + .04 * w);
  g.bezierCurveTo(x + 1.02 * w, y + .06 * w, x + 1 * w, y + .2 * w, x + .8 * w, y + .2 * w);
  g.closePath(); g.fill();
}

export function moonPos(W, horizon, s, o) { return o ? { x: o.x, y: o.y, r: (o.r || 30) * s } : { x: W * .76, y: Math.max(54 * s, horizon * .36), r: 30 * s }; }

export function paintBackdrop(g, W, H, { horizon, spot = '', s = W / 390, seed = 7, moon = null, hero = 1 }) {
  const r = rng(seed);
  // sky
  const sky = g.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#111329'); sky.addColorStop(.55, '#20245a'); sky.addColorStop(1, '#3f3f86');
  g.fillStyle = sky; g.fillRect(0, 0, W, horizon + 1);
  const hz = g.createRadialGradient(W / 2, horizon, 0, W / 2, horizon, W * .8);
  hz.addColorStop(0, 'rgba(235,146,179,.35)'); hz.addColorStop(.5, 'rgba(203,165,209,.12)'); hz.addColorStop(1, 'rgba(203,165,209,0)');
  g.fillStyle = hz; g.fillRect(0, 0, W, horizon);
  // still stars
  for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * horizon * .85, a = .25 + r() * .5; g.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`; g.beginPath(); g.arc(x, y, (.4 + r() * .9) * s, 0, 7); g.fill(); }
  // moon + halo
  const m = moonPos(W, horizon, s, moon);
  const halo = g.createRadialGradient(m.x, m.y, m.r * .8, m.x, m.y, m.r * 4.2);
  halo.addColorStop(0, 'rgba(244,238,255,.42)'); halo.addColorStop(1, 'rgba(244,238,255,0)');
  g.fillStyle = halo; g.beginPath(); g.arc(m.x, m.y, m.r * 4.2, 0, 7); g.fill();
  const mg = g.createRadialGradient(m.x - m.r * .3, m.y - m.r * .3, m.r * .1, m.x, m.y, m.r);
  mg.addColorStop(0, '#FFFBF2'); mg.addColorStop(1, '#F1E6FA');
  g.fillStyle = mg; g.beginPath(); g.arc(m.x, m.y, m.r, 0, 7); g.fill();
  g.fillStyle = 'rgba(203,165,209,.25)';
  for (const [dx, dy, rr] of [[-.3, .1, .18], [.25, -.25, .12], [.2, .35, .1]]) { g.beginPath(); g.arc(m.x + dx * m.r, m.y + dy * m.r, rr * m.r, 0, 7); g.fill(); }
  // clouds
  cloud(g, W * .1, horizon * .3, 70 * s, 'rgba(155,176,222,.16)');
  cloud(g, W * .62, m.y + m.r * .9, 80 * s, 'rgba(203,165,209,.2)');
  cloud(g, W * .3, horizon * .68, 110 * s, 'rgba(235,146,179,.12)');
  skyline(g, W, horizon, spot, s, r, hero);
  // water
  const wa = g.createLinearGradient(0, horizon, 0, H);
  wa.addColorStop(0, '#3a3f86'); wa.addColorStop(.18, '#2b3375'); wa.addColorStop(.6, '#1f255b'); wa.addColorStop(1, '#151a43');
  g.fillStyle = wa; g.fillRect(0, horizon, W, H - horizon);
  const glow = g.createRadialGradient(m.x, horizon, 2, m.x, horizon, (H - horizon) * 1.1);
  glow.addColorStop(0, 'rgba(240,232,255,.30)'); glow.addColorStop(1, 'rgba(240,232,255,0)');
  g.fillStyle = glow; g.fillRect(0, horizon, W, H - horizon);
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, horizon, W, 1.2 * s);
  lotusPads(g, W, H, s, r);
}

function skyline(g, W, horizon, spot, s, r, hero = 1) {
  const far = '#2a2d63', near = '#1c1f4a', rim = 'rgba(235,146,179,.55)';
  // far city blocks
  g.fillStyle = far;
  for (let x = 0; x < W; x += (14 + r() * 22) * s) { const h = (8 + r() * 26) * s; g.fillRect(x, horizon - h, (10 + r() * 14) * s, h); }
  g.fillStyle = 'rgba(255,214,150,.6)';
  for (let i = 0; i < 26; i++) g.fillRect(r() * W, horizon - r() * 26 * s, 1.4 * s, 1.4 * s);
  if (spot === 'rama8') {
    const px = hero > 1 ? W / 2 + Math.min(W, 520) * (W > 720 ? .62 : .14) : W * .3, top = horizon - 120 * s * hero, deck = horizon - 18 * s * Math.min(hero, 1.4);
    g.fillStyle = near; g.fillRect(0, deck, W, 4 * s);
    const pw = hero;
    g.beginPath(); g.moveTo(px - 7 * s * pw, horizon); g.lineTo(px - 2.5 * s * pw, top); g.lineTo(px + 2.5 * s * pw, top); g.lineTo(px + 7 * s * pw, horizon); g.fill();
    g.strokeStyle = 'rgba(203,165,209,.55)'; g.lineWidth = .9 * s * Math.min(pw, 1.5);
    const n = hero > 1 ? 14 : 10, gap = (hero > 1 ? 5.4 : 3.2) * s;
    for (let i = 1; i <= n; i++) { g.beginPath(); g.moveTo(px, top + 6 * s + i * gap); g.lineTo(px + i * W * (hero > 1 ? .05 : .065), deck); g.stroke(); g.beginPath(); g.moveTo(px, top + 6 * s + i * gap); g.lineTo(px - i * W * (hero > 1 ? .045 : .028), deck); g.stroke(); }
    g.fillStyle = rim; g.fillRect(px - 1 * s * pw, top, 2 * s * pw, 30 * s * pw);
    g.fillStyle = 'rgba(255,214,150,.9)'; for (let x = 0; x < W; x += 16 * s) g.fillRect(x, deck - 1.6 * s, 2 * s, 1.6 * s);
  } else if (spot === 'rotfai') {
    g.fillStyle = near;
    for (let x = -20 * s; x < W + 30 * s; x += (26 + r() * 22) * s) { const rr = (14 + r() * 16) * s; g.beginPath(); g.arc(x, horizon - rr * .45, rr, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(127,169,177,.35)';
    for (let x = 0; x < W; x += (40 + r() * 30) * s) { const rr = (8 + r() * 6) * s; g.beginPath(); g.arc(x, horizon - rr * 1.6, rr, Math.PI, 0); g.fill(); }
  } else if (spot === 'moldable') {
    g.fillStyle = near; g.fillRect(0, horizon - 8 * s, W, 8 * s);
    const bx = W * .18, bw = 70 * s, bh = 46 * s;
    g.fillRect(bx, horizon - bh, bw, bh);
    g.fillStyle = 'rgba(255,214,150,.85)'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g.fillRect(bx + (10 + i * 20) * s, horizon - bh + (10 + j * 16) * s, 10 * s, 8 * s);
    CHAR_KEYS.forEach((k, i) => { const c = charCanvas(k, { size: 64, mood: 'smile' }); const sz = 26 * s; g.drawImage(c, W * .48 + i * 30 * s, horizon - sz * .82 - (i % 2) * 3 * s, sz, sz); });
  } else if (spot === 'watarun') {
    // floodlit prangs across the river
    const px = W * .6, prang = (x, h, w) => {
      const gr = g.createLinearGradient(0, horizon - h, 0, horizon); gr.addColorStop(0, '#FFE7B8'); gr.addColorStop(.7, '#E9B77E'); gr.addColorStop(1, '#6b4f5e');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x - w, horizon);
      for (let i = 0; i <= 5; i++) { const k = i / 5, y = horizon - h * (.08 + k * .7), ww = w * (1 - k * .78); g.lineTo(x - ww, y); g.lineTo(x - ww * .86, y - h * .03); }
      g.lineTo(x - w * .06, horizon - h * .92); g.lineTo(x, horizon - h); g.lineTo(x + w * .06, horizon - h * .92);
      for (let i = 5; i >= 0; i--) { const k = i / 5, y = horizon - h * (.08 + k * .7), ww = w * (1 - k * .78); g.lineTo(x + ww * .86, y - h * .03); g.lineTo(x + ww, y); }
      g.lineTo(x + w, horizon); g.fill();
    };
    g.fillStyle = near; g.fillRect(0, horizon - 7 * s, W, 7 * s);
    const glow = g.createRadialGradient(px, horizon - 50 * s, 4, px, horizon - 50 * s, 120 * s); glow.addColorStop(0, 'rgba(255,214,150,.28)'); glow.addColorStop(1, 'rgba(255,214,150,0)');
    g.fillStyle = glow; g.fillRect(px - 130 * s, horizon - 170 * s, 260 * s, 170 * s);
    prang(px - 58 * s, 46 * s, 9 * s); prang(px + 58 * s, 46 * s, 9 * s); prang(px - 30 * s, 62 * s, 11 * s); prang(px + 30 * s, 62 * s, 11 * s); prang(px, 118 * s, 20 * s);
  } else if (spot === 'mahakan') {
    // fort wall + octagonal tower, Golden Mount behind
    const mx = W * .72;
    g.fillStyle = '#262a5c'; g.beginPath(); g.ellipse(mx, horizon, 70 * s, 34 * s, 0, Math.PI, 0); g.fill();
    const gold = g.createLinearGradient(0, horizon - 96 * s, 0, horizon - 30 * s); gold.addColorStop(0, '#FFE7A3'); gold.addColorStop(1, '#D9A24E');
    g.fillStyle = gold; g.beginPath(); g.moveTo(mx - 16 * s, horizon - 30 * s); g.quadraticCurveTo(mx - 15 * s, horizon - 52 * s, mx - 4 * s, horizon - 60 * s); g.lineTo(mx - 1.2 * s, horizon - 96 * s); g.lineTo(mx + 1.2 * s, horizon - 96 * s); g.lineTo(mx + 4 * s, horizon - 60 * s); g.quadraticCurveTo(mx + 15 * s, horizon - 52 * s, mx + 16 * s, horizon - 30 * s); g.fill();
    g.fillStyle = near; g.fillRect(0, horizon - 18 * s, W * .55, 18 * s);
    for (let x = 0; x < W * .55; x += 9 * s) g.fillRect(x, horizon - 23 * s, 5 * s, 5 * s);
    const fx = W * .28; g.fillRect(fx - 16 * s, horizon - 40 * s, 32 * s, 40 * s);
    for (let x = fx - 16 * s; x < fx + 16 * s; x += 8 * s) g.fillRect(x, horizon - 45 * s, 5 * s, 5 * s);
    g.beginPath(); g.moveTo(fx - 12 * s, horizon - 45 * s); g.lineTo(fx, horizon - 66 * s); g.lineTo(fx + 12 * s, horizon - 45 * s); g.fill();
    g.fillStyle = 'rgba(255,214,150,.85)'; for (let x = 6 * s; x < W * .55; x += 22 * s) g.fillRect(x, horizon - 11 * s, 2 * s, 3 * s);
  } else if (spot === 'songwat') {
    // old shophouses with a string of red lanterns
    g.fillStyle = near; let x = -4 * s;
    while (x < W) { const w = (26 + r() * 18) * s, h = (30 + r() * 22) * s; g.fillRect(x, horizon - h, w - 2 * s, h);
      g.fillStyle = 'rgba(255,214,150,.75)'; for (let i = 0; i < 2; i++) g.fillRect(x + (5 + i * (w - 16 * s) / 1.2) , horizon - h + 8 * s, 5 * s, 7 * s);
      g.fillStyle = near; x += w; }
    g.strokeStyle = 'rgba(255,214,150,.5)'; g.lineWidth = 1 * s;
    for (const [y0, sag] of [[horizon - 58 * s, 12 * s], [horizon - 44 * s, 9 * s]]) {
      g.beginPath(); g.moveTo(0, y0); g.quadraticCurveTo(W / 2, y0 + sag * 2, W, y0); g.stroke();
      for (let i = 1; i < 12; i++) { const t = i / 12, ly = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * (y0 + sag * 2) + t * t * y0;
        g.fillStyle = 'rgba(232,82,82,.9)'; g.beginPath(); g.ellipse(t * W, ly + 5 * s, 4 * s, 5 * s, 0, 0, 7); g.fill();
        g.fillStyle = 'rgba(255,214,150,.9)'; g.fillRect(t * W - 1.5 * s, ly + 9.5 * s, 3 * s, 1.5 * s); }
    }
  } else if (spot === 'iconsiam') {
    // two glass towers and a glowing riverside podium
    const tower = (x, w, h, col) => { g.fillStyle = near; g.fillRect(x, horizon - h, w, h); g.fillStyle = col; for (let y = horizon - h + 6 * s; y < horizon - 6 * s; y += 7 * s) g.fillRect(x + 3 * s, y, w - 6 * s, 1.4 * s); };
    tower(W * .64, 24 * s, 150 * s, 'rgba(155,176,222,.55)'); tower(W * .74, 20 * s, 112 * s, 'rgba(127,169,177,.55)');
    g.fillStyle = '#23275a'; g.beginPath(); g.moveTo(W * .3, horizon); g.lineTo(W * .32, horizon - 26 * s); g.quadraticCurveTo(W * .6, horizon - 40 * s, W * .9, horizon - 26 * s); g.lineTo(W * .92, horizon); g.fill();
    g.strokeStyle = 'rgba(169,216,195,.7)'; g.lineWidth = 1.3 * s;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(W * .33, horizon - (20 - i * 6) * s); g.quadraticCurveTo(W * .6, horizon - (33 - i * 6) * s, W * .89, horizon - (20 - i * 6) * s); g.stroke(); }
  } else if (spot === 'asiatique') {
    // riverside warehouses and the big wheel
    g.fillStyle = near;
    for (let x = 0; x < W; x += 44 * s) { g.beginPath(); g.moveTo(x, horizon); g.lineTo(x, horizon - 16 * s); g.lineTo(x + 20 * s, horizon - 24 * s); g.lineTo(x + 40 * s, horizon - 16 * s); g.lineTo(x + 40 * s, horizon); g.fill(); }
    const cx = W * .3, cy = horizon - 62 * s, R = 50 * s;
    g.strokeStyle = 'rgba(203,165,209,.8)'; g.lineWidth = 1.6 * s; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
    g.lineWidth = .8 * s; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke();
      g.fillStyle = ['#EB92B3', '#FFE7A3', '#A9D8C3', '#9BB0DE'][i % 4]; g.beginPath(); g.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R + 3 * s, 3 * s, 0, 7); g.fill(); }
    g.strokeStyle = near; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(cx - 26 * s, horizon); g.lineTo(cx, cy); g.lineTo(cx + 26 * s, horizon); g.stroke();
  } else if (spot === 'lumphini' || spot === 'benjakitti') {
    // city towers behind the park trees
    for (let i = 0; i < 7; i++) { const x = W * (.08 + i * .14) + (r() - .5) * 20 * s, w = (18 + r() * 14) * s, h = (60 + r() * 80) * s;
      g.fillStyle = '#262a5c'; g.fillRect(x, horizon - h, w, h); g.fillStyle = 'rgba(255,214,150,.55)';
      for (let k = 0; k < 10; k++) g.fillRect(x + r() * (w - 3 * s), horizon - h + r() * h * .9, 2 * s, 2 * s); }
    g.fillStyle = near;
    for (let x = -20 * s; x < W + 30 * s; x += (24 + r() * 20) * s) { const rr = (13 + r() * 14) * s; g.beginPath(); g.arc(x, horizon - rr * .4, rr, 0, 7); g.fill(); }
    if (spot === 'benjakitti') {   // the elevated skywalk loops over the trees
      g.strokeStyle = 'rgba(169,216,195,.85)'; g.lineWidth = 2.4 * s; g.beginPath(); g.moveTo(-10, horizon - 34 * s); g.bezierCurveTo(W * .3, horizon - 52 * s, W * .6, horizon - 24 * s, W + 10, horizon - 40 * s); g.stroke();
      g.lineWidth = 1 * s; for (let x = W * .06; x < W; x += W * .12) { g.beginPath(); g.moveTo(x, horizon - 4 * s); g.lineTo(x, horizon - 30 * s); g.stroke(); }
    }
  } else {
    g.fillStyle = near; g.fillRect(0, horizon - 6 * s, W, 6 * s);
  }
}

function lotusPads(g, W, H, s, r) {
  const pad = (x, y, rx, flower) => {
    g.save(); g.translate(x, y);
    g.fillStyle = '#4f8f86'; g.beginPath(); g.ellipse(0, 0, rx, rx * .34, 0, .25, Math.PI * 2 - .05); g.lineTo(0, 0); g.fill();
    g.fillStyle = 'rgba(169,216,195,.35)'; g.beginPath(); g.ellipse(-rx * .1, -rx * .05, rx * .7, rx * .2, 0, 0, 7); g.fill();
    if (flower) {
      for (const [a, l] of [[-1.1, .7], [1.1, .7], [-.55, .9], [.55, .9], [0, 1]]) { g.save(); g.rotate(a); g.fillStyle = a === 0 ? '#F6C2D6' : '#EB92B3'; g.beginPath(); g.ellipse(0, -rx * .3 * l, rx * .12, rx * .3 * l, 0, 0, 7); g.fill(); g.restore(); }
      g.fillStyle = '#FFE7A3'; g.beginPath(); g.arc(0, -rx * .08, rx * .06, 0, 7); g.fill();
    }
    g.restore();
  };
  pad(-10 * s, H - 30 * s, 70 * s, false); pad(46 * s, H - 8 * s, 48 * s, true);
  pad(W + 14 * s, H - 46 * s, 64 * s, true); pad(W - 50 * s, H - 4 * s, 40 * s, false);
}

function lanternSprite(size) {
  const c = document.createElement('canvas'); c.width = c.height = size * 4; const g = c.getContext('2d');
  const m = size * 2;
  const gl = g.createRadialGradient(m, m, 0, m, m, m); gl.addColorStop(0, 'rgba(255,200,120,.55)'); gl.addColorStop(1, 'rgba(255,170,100,0)');
  g.fillStyle = gl; g.fillRect(0, 0, size * 4, size * 4);
  const w = size * .9, h = size * 1.15, x = m - w / 2, y = m - h / 2;
  const bg = g.createLinearGradient(0, y, 0, y + h); bg.addColorStop(0, '#FFF1C9'); bg.addColorStop(1, '#F4A66B');
  g.fillStyle = bg; g.beginPath(); g.moveTo(x + w * .12, y); g.lineTo(x + w * .88, y); g.quadraticCurveTo(x + w * 1.05, y + h * .5, x + w * .82, y + h); g.lineTo(x + w * .18, y + h); g.quadraticCurveTo(x - w * .05, y + h * .5, x + w * .12, y); g.fill();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x + w * .3, y + h * .15, w * .08, h * .6);
  return c;
}

export function createLife(W, H, horizon, { s = W / 390, lanterns = 7, seed = 3, moon = null } = {}) {
  const r = rng(seed), m = moonPos(W, horizon, s, moon);
  const tw = Array.from({ length: 18 }, () => ({ x: r() * W, y: r() * horizon * .8, p: r() * 6.28, k: .6 + r() }));
  const sprite = lanternSprite(Math.round(16 * s));
  const lan = Array.from({ length: lanterns }, () => ({ x: r() * W, y: horizon * (.2 + r() * .8), v: (4 + r() * 6) * s, sz: .55 + r() * .6, p: r() * 6.28 }));
  const ff = Array.from({ length: 10 }, () => ({ x: r() * W, y: horizon + (6 + r() * 40) * s, p: r() * 6.28 }));
  return {
    draw(g, t, dt = .033) {
      for (const st of tw) { const a = .35 + .45 * Math.sin(t * .002 * st.k + st.p); g.fillStyle = `rgba(255,255,255,${Math.max(0, a).toFixed(2)})`; g.beginPath(); g.arc(st.x, st.y, 1.1 * s, 0, 7); g.fill(); }
      for (const l of lan) {
        l.y -= l.v * dt; if (l.y < -30 * s) { l.y = horizon + 10 * s; l.x = r() * W; }
        const fade = Math.min(1, (horizon - l.y) / (40 * s) + .2), size = sprite.width * l.sz * .5;
        g.globalAlpha = Math.max(0, Math.min(1, fade)) * (.75 + .25 * Math.sin(t * .004 + l.p));
        g.drawImage(sprite, l.x + Math.sin(t * .0008 + l.p) * 6 * s - size / 2, l.y - size / 2, size, size);
      }
      g.globalAlpha = 1;
      for (let i = 0; i < 18; i++) {
        const k = i / 18, y = horizon + 4 * s + k * k * (H - horizon) * .95, w = (8 + k * 110 * (.6 + .4 * Math.sin(t * .0012 + i * 1.7))) * s;
        g.fillStyle = `rgba(244,238,255,${(.32 * (1 - k * .65)).toFixed(3)})`;
        g.beginPath(); g.ellipse(m.x + Math.sin(t * .0007 + i) * 6 * s * k, y, w, (1 + k * 2.4) * s, 0, 0, 7); g.fill();
      }
      for (const f of ff) { const a = .4 + .6 * Math.sin(t * .003 + f.p); g.fillStyle = `rgba(255,226,150,${Math.max(0, a).toFixed(2)})`; g.beginPath(); g.arc(f.x + Math.sin(t * .0006 + f.p) * 14 * s, f.y + Math.cos(t * .0009 + f.p) * 4 * s, 1.6 * s, 0, 7); g.fill(); }
    },
  };
}
