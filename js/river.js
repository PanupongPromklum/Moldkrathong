// River room — 2.5D moonlit scene on one 2D canvas. Krathongs are images, so many float smoothly.
import { paintBackdrop, createLife } from './scene.js?v=16';
const MAX_ON_WATER = 40;

export function createRiver(host, { onTap = () => {} } = {}) {
  const cv = document.createElement('canvas'); cv.className = 'river-canvas'; host.prepend(cv);
  const g = cv.getContext('2d');
  const bg = document.createElement('canvas'), bgg = bg.getContext('2d');
  let W = 0, H = 0, dpr = 1, horizon = 0, spotId = '', items = [], raf = 0, last = 0, running = false, life = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight; if (!W || !H) return;
    cv.width = bg.width = Math.round(W * dpr); cv.height = bg.height = Math.round(H * dpr);
    horizon = Math.round(H * .34);
    paintBg();
  }

  function paintBg() {
    bgg.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintBackdrop(bgg, W, H, { horizon, spot: spotId });
    life = createLife(W, H, horizon);
  }

  /* ---------- items ---------- */
  const imgCache = new Map();
  function loadImg(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const im = new Image(); im.crossOrigin = 'anonymous'; im.decoding = 'async'; im.src = src;
    imgCache.set(src, im); return im;
  }
  let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // Depth lanes: every krathong sits in one lane; a lane keeps its boats spaced so they never pile up,
  // and all lanes drift at the same pace so the spacing (and the stagger between lanes) holds.
  const LANES = [.1, .25, .4, .55, .7, .85], SPAN = 1.3, X0 = -.15, SPEED = .012;
  const widthAt = (z) => (.1 + .24 * z) * Math.min(W || 390, 640);
  const capOf = (li) => Math.max(1, Math.floor(SPAN * (W || 390) / (widthAt(LANES[li]) * 1.2)));
  function place(it, frontFirst) {
    let best = -1, bs = -1e9;
    for (let li = LANES.length - 1; li >= 0; li--) {
      const n = items.filter(o => o !== it && o.lane === li).length, free = (capOf(li) - n) / capOf(li);
      const sc = free + (frontFirst ? li * .02 : -Math.abs(li - 2.5) * .01);
      if (sc > bs) { bs = sc; best = li; }
    }
    it.lane = best; it.z = LANES[best];
    // drop it into the widest gap of that lane
    const xs = items.filter(o => o !== it && o.lane === best).map(o => ((o.x - X0) % SPAN + SPAN) % SPAN).sort((a, b) => a - b);
    if (!xs.length) { it.x = X0 + (best % 2 ? .35 : .65) * SPAN; return; }
    let gx = 0, gw = -1;
    for (let i = 0; i < xs.length; i++) { const a = xs[i], b = i + 1 < xs.length ? xs[i + 1] : xs[0] + SPAN; if (b - a > gw) { gw = b - a; gx = a + (b - a) / 2; } }
    it.x = X0 + (gx % SPAN);
  }
  function makeItem(row, src, own) {
    return { row, img: loadImg(src), z: .5, lane: -1, x: .5, ph: rnd() * 6.28, own, launch: own ? 0 : 1, box: null, y: 0 };
  }
  function setItems(rows, srcOf) {
    const keep = new Map(items.map(i => [i.row.id, i]));
    const next = rows.slice(0, MAX_ON_WATER).map(r => keep.get(r.id) || makeItem(r, srcOf(r), false));
    items = next.filter(i => i.lane >= 0);
    for (const it of next) if (it.lane < 0) { place(it, false); items.push(it); }
  }
  function addItems(rows, srcOf) {
    for (const r of rows) if (!items.some(i => i.row.id === r.id)) { const it = makeItem(r, srcOf(r), false); place(it, false); items.push(it); }
    while (items.length > MAX_ON_WATER) { const k = items.findIndex(i => !i.own); items.splice(k < 0 ? 0 : k, 1); }
  }
  function addOwn(row, src) { const it = makeItem(row, src, true); place(it, true); items.push(it); return it; }

  /* ---------- draw ---------- */
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!running || document.hidden) return;
    if (t - last < 32) return;                         // ~30 fps is plenty for water
    const dt = Math.min(.1, (t - last) / 1000); last = t;
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bg, 0, 0);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    life?.draw(g, t, dt);
    for (const it of items) {
      if (it.launch < 1) it.launch = Math.min(1, it.launch + dt * .45);
      it.x += SPEED * dt; if (it.x > X0 + SPAN) it.x -= SPAN;
      const ease = 1 - Math.pow(1 - it.launch, 3);
      it.y = horizon + (H - horizon) * (.14 + .7 * it.z) + (1 - ease) * H * .5;
    }
    // back to front by where the boat touches the water, so nearer boats always cover farther ones
    items.sort((a, b) => a.y - b.y);
    for (const it of items) {
      const im = it.img; if (!im.complete || !im.naturalWidth) continue;
      // size by width (the boat), not height — tall incense must not shrink a near boat below a far one
      let w = widthAt(it.z) * (it.own ? 1.08 : 1), h = w * im.naturalHeight / im.naturalWidth;
      if (h > w * 1.5) { h = w * 1.5; w = h * im.naturalWidth / im.naturalHeight; }
      const bob = Math.sin(t * .0016 + it.ph) * 2 * (.5 + it.z), rot = Math.sin(t * .0011 + it.ph) * .03;
      const x = it.x * W + Math.sin(t * .0005 + it.ph) * 4, y = it.y + bob;
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
