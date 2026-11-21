// River room — 2.5D night water drawn on one 2D canvas. Krathongs are images, so many float smoothly.
const MAX_ON_WATER = 40;

export function createRiver(host, { onTap = () => {} } = {}) {
  const cv = document.createElement('canvas'); cv.className = 'river-canvas'; host.prepend(cv);
  const g = cv.getContext('2d');
  const bg = document.createElement('canvas'), bgg = bg.getContext('2d');
  let W = 0, H = 0, dpr = 1, horizon = 0, spotId = '', items = [], raf = 0, last = 0, running = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight; if (!W || !H) return;
    cv.width = bg.width = Math.round(W * dpr); cv.height = bg.height = Math.round(H * dpr);
    horizon = Math.round(H * .2);
    paintBg();
  }

  function paintBg() {
    const c = bgg; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const top = c.createLinearGradient(0, 0, 0, horizon);
    top.addColorStop(0, '#0f1329'); top.addColorStop(1, '#1d2458');
    c.fillStyle = top; c.fillRect(0, 0, W, horizon + 1);
    const wa = c.createLinearGradient(0, horizon, 0, H);
    wa.addColorStop(0, '#2b3575'); wa.addColorStop(.45, '#222a63'); wa.addColorStop(1, '#151a40');
    c.fillStyle = wa; c.fillRect(0, horizon, W, H - horizon);
    const glow = c.createRadialGradient(W / 2, horizon + 10, 4, W / 2, horizon + 10, H * .75);
    glow.addColorStop(0, 'rgba(232,226,255,.30)'); glow.addColorStop(1, 'rgba(232,226,255,0)');
    c.fillStyle = glow; c.fillRect(0, horizon, W, H - horizon);
    // minimal skyline per spot
    c.save();
    if (spotId === 'rama8') {
      c.fillStyle = c.strokeStyle = 'rgba(203,165,209,.35)'; c.lineWidth = 1;
      c.fillRect(0, horizon - 14, W, 3);
      const px = W * .7, tp = horizon - 90;
      c.beginPath(); c.moveTo(px - 4, horizon); c.lineTo(px - 2, tp); c.lineTo(px + 2, tp); c.lineTo(px + 4, horizon); c.fill();
      for (let i = 1; i <= 8; i++) { c.beginPath(); c.moveTo(px, tp + 6 + i * 3); c.lineTo(px - i * W * .08, horizon - 13); c.stroke(); c.beginPath(); c.moveTo(px, tp + 6 + i * 3); c.lineTo(px + i * W * .035, horizon - 13); c.stroke(); }
    } else if (spotId === 'rotfai') {
      c.fillStyle = 'rgba(155,176,222,.26)'; let s = 5;
      for (let x = -20; x < W + 30; x += 34 + (s = (s * 16807) % 2147483647) % 30) { const r = 18 + s % 22; c.beginPath(); c.arc(x, horizon - r * .5, r, 0, 7); c.fill(); }
    } else {
      c.fillStyle = 'rgba(203,165,209,.18)'; c.fillRect(0, horizon - 6, W, 6);
    }
    c.restore();
  }

  /* ---------- items ---------- */
  const imgCache = new Map();
  function loadImg(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const im = new Image(); im.crossOrigin = 'anonymous'; im.decoding = 'async'; im.src = src;
    imgCache.set(src, im); return im;
  }
  let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function makeItem(row, src, own) {
    return { row, img: loadImg(src), z: own ? .74 : .1 + rnd() * .75, x: rnd(), speed: .006 + rnd() * .01, ph: rnd() * 6.28, own, launch: own ? 0 : 1, box: null };
  }
  function setItems(rows, srcOf) {
    const keep = new Map(items.map(i => [i.row.id, i]));
    items = rows.slice(0, MAX_ON_WATER).map(r => keep.get(r.id) || makeItem(r, srcOf(r), false));
  }
  function addItems(rows, srcOf) {
    for (const r of rows) if (!items.some(i => i.row.id === r.id)) items.push(makeItem(r, srcOf(r), false));
    while (items.length > MAX_ON_WATER) { const k = items.findIndex(i => !i.own); items.splice(k < 0 ? 0 : k, 1); }
  }
  function addOwn(row, src) { const it = makeItem(row, src, true); it.x = .5; items.push(it); return it; }

  /* ---------- draw ---------- */
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!running || document.hidden) return;
    if (t - last < 32) return;                         // ~30 fps is plenty for water
    const dt = Math.min(.1, (t - last) / 1000); last = t;
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bg, 0, 0);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // shimmering moon path
    for (let i = 0; i < 16; i++) {
      const k = i / 16, y = horizon + 8 + k * k * (H - horizon) * .95, w = 14 + k * W * .32 * (.6 + .4 * Math.sin(t * .0012 + i * 1.7));
      g.fillStyle = `rgba(236,230,255,${(.24 * (1 - k * .6)).toFixed(3)})`;
      g.beginPath(); g.ellipse(W / 2 + Math.sin(t * .0007 + i) * 8 * k, y, w, 1 + k * 2.2, 0, 0, 7); g.fill();
    }
    items.sort((a, b) => a.z - b.z);
    const base = Math.min(W, H * .62);
    for (const it of items) {
      if (it.launch < 1) it.launch = Math.min(1, it.launch + dt * .45);
      it.x += it.speed * dt * (.4 + it.z);
      if (it.x > 1.15) it.x = -.15;
      const im = it.img; if (!im.complete || !im.naturalWidth) continue;
      const s = (.16 + .4 * it.z) * base / Math.max(im.naturalWidth, im.naturalHeight) * (it.own ? 1.08 : 1);
      const w = im.naturalWidth * s, h = im.naturalHeight * s;
      const ease = 1 - Math.pow(1 - it.launch, 3);
      const wy = horizon + (H - horizon) * (.1 + .78 * it.z) + (1 - ease) * H * .5;
      const bob = Math.sin(t * .0016 + it.ph) * 3 * (.5 + it.z), rot = Math.sin(t * .0011 + it.ph) * .03;
      const x = it.x * W, y = wy + bob;
      // reflection + ripple
      g.save(); g.globalAlpha = .16; g.translate(x, y + h * .02); g.scale(1, -.5); g.drawImage(im, -w / 2, -h, w, h); g.restore();
      g.strokeStyle = 'rgba(236,230,255,.22)'; g.lineWidth = 1;
      g.beginPath(); g.ellipse(x, y - h * .04, w * .46, h * .07 + 2, 0, 0, 7); g.stroke();
      g.save(); g.translate(x, y); g.rotate(rot); g.drawImage(im, -w / 2, -h, w, h); g.restore();
      if (it.own && it.launch >= 1) { g.fillStyle = '#EB92B3'; g.beginPath(); g.arc(x, y - h - 10, 4, 0, 7); g.fill(); }
      it.box = { x: x - w / 2, y: y - h, w, h };
    }
  }

  cv.addEventListener('click', (e) => {
    const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    for (let i = items.length - 1; i >= 0; i--) {
      const b = items[i].box; if (!b) continue;
      if (px > b.x + b.w * .1 && px < b.x + b.w * .9 && py > b.y + b.h * .15 && py < b.y + b.h) { onTap(items[i].row, items[i]); return; }
    }
    onTap(null);
  });

  const ro = new ResizeObserver(resize); ro.observe(host);
  raf = requestAnimationFrame(frame);
  return {
    setSpot(id) { spotId = id; items = []; seed = 7; resize(); },
    setItems, addItems, addOwn,
    remove(id) { items = items.filter(i => i.row.id !== id); },
    start() { running = true; resize(); }, stop() { running = false; },
  };
}
