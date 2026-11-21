// Save card: transparent PNG, or the krathong floating at one of the spots (1080×1350, IG post size).
import { SPOTS, STUDIO } from './config.js';
import { charCanvas, CHAR_KEYS } from './characters.js';

export const BACKDROPS = [{ id: 'none', th: 'ไม่มีพื้นหลัง' }, ...SPOTS.map(s => ({ id: s.id, th: s.name }))];

let W = 1080, H = 1350, HORIZON = 470;
const rnd = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function water(g) {
  const sky = g.createLinearGradient(0, 0, 0, HORIZON);
  sky.addColorStop(0, '#121633'); sky.addColorStop(1, '#212862');
  g.fillStyle = sky; g.fillRect(0, 0, W, HORIZON);
  const wa = g.createLinearGradient(0, HORIZON, 0, H);
  wa.addColorStop(0, '#2b3575'); wa.addColorStop(.5, '#222a63'); wa.addColorStop(1, '#171c46');
  g.fillStyle = wa; g.fillRect(0, HORIZON, W, H - HORIZON);
  // moonlight on the water
  const glow = g.createRadialGradient(W / 2, HORIZON + 40, 10, W / 2, HORIZON + 40, 520);
  glow.addColorStop(0, 'rgba(232,226,255,.32)'); glow.addColorStop(1, 'rgba(232,226,255,0)');
  g.fillStyle = glow; g.fillRect(0, HORIZON, W, H - HORIZON);
  const r = rnd(7);
  for (let y = HORIZON + 12; y < H; y += 14 + (y - HORIZON) * .03) {
    const k = (y - HORIZON) / (H - HORIZON), w = 60 + k * 320 * r();
    g.fillStyle = `rgba(236,230,255,${.28 * (1 - k * .7) * (.5 + r() * .5)})`;
    g.beginPath(); g.ellipse(W / 2 + (r() - .5) * 120 * k, y, w, 2 + k * 3, 0, 0, 7); g.fill();
  }
}

function silhouette(g, id) {
  g.save();
  if (id === 'rama8') { // cable-stayed bridge, one pylon
    g.strokeStyle = 'rgba(203,165,209,.42)'; g.fillStyle = 'rgba(203,165,209,.42)';
    g.fillRect(0, HORIZON - 70, W, 7);
    const px = 760, top = HORIZON - 330;
    g.beginPath(); g.moveTo(px - 12, HORIZON); g.lineTo(px - 5, top); g.lineTo(px + 5, top); g.lineTo(px + 12, HORIZON); g.fill();
    g.lineWidth = 2;
    for (let i = 1; i <= 9; i++) { g.beginPath(); g.moveTo(px, top + 20 + i * 8); g.lineTo(px - i * 75, HORIZON - 66); g.stroke(); g.beginPath(); g.moveTo(px, top + 20 + i * 8); g.lineTo(px + i * 36, HORIZON - 66); g.stroke(); }
  } else if (id === 'rotfai') { // soft park trees
    const r = rnd(3); g.fillStyle = 'rgba(155,176,222,.3)';
    for (let x = -40; x < W + 60; x += 70 + r() * 50) { const s = 40 + r() * 55; g.beginPath(); g.arc(x, HORIZON - s * .55, s, 0, 7); g.fill(); }
    g.fillRect(0, HORIZON - 20, W, 20);
  } else if (id === 'moldable') { // the gang peeking from the bank
    g.fillStyle = 'rgba(203,165,209,.22)'; g.fillRect(0, HORIZON - 16, W, 16);
    CHAR_KEYS.forEach((k, i) => {
      const c = charCanvas(k, { size: 120, mood: i % 2 ? 'smile' : 'normal' });
      g.globalAlpha = .95; g.drawImage(c, 150 + i * 165, HORIZON - 112 - (i % 2) * 14, 120, 120);
    });
    g.globalAlpha = 1;
  }
  g.restore();
}

function sparkles(g) {
  const r = rnd(11); g.fillStyle = 'rgba(255,255,255,.85)';
  for (let i = 0; i < 14; i++) {
    const x = r() * W, y = r() * (HORIZON - 160) + 40, s = 3 + r() * 7;
    g.beginPath(); g.moveTo(x, y - s); g.quadraticCurveTo(x, y, x + s, y); g.quadraticCurveTo(x, y, x, y + s); g.quadraticCurveTo(x, y, x - s, y); g.quadraticCurveTo(x, y, x, y - s); g.fill();
  }
}

export async function makeCard(shot, bgId, spot, story = null) {
  if (!shot) return null;
  if (bgId === 'none' || !spot) return shot;
  try { await document.fonts.ready; } catch (_) { /* fonts optional */ }
  if (story) { W = 1080; H = 1920; HORIZON = 640; } else { W = 1080; H = 1350; HORIZON = 470; }
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  water(g); sparkles(g); silhouette(g, spot.id);
  // krathong + reflection
  const k = Math.min(620 / shot.width, 560 / shot.height), w = shot.width * k, h = shot.height * k;
  const x = (W - w) / 2, baseY = story ? 1300 : 1010, y = baseY - h;
  g.save(); g.globalAlpha = .22; g.translate(0, baseY * 2 - 30); g.scale(1, -1); g.drawImage(shot, x, y, w, h); g.restore();
  const fade = g.createLinearGradient(0, baseY - 30, 0, baseY + h * .7);
  fade.addColorStop(0, 'rgba(34,42,99,0)'); fade.addColorStop(1, 'rgba(26,32,76,1)');
  g.fillStyle = fade; g.fillRect(0, baseY - 30, W, h * .8);
  g.strokeStyle = 'rgba(236,230,255,.35)'; g.lineWidth = 3;
  for (let i = 0; i < 3; i++) { g.globalAlpha = 1 - i * .3; g.beginPath(); g.ellipse(W / 2, baseY - 18, w * .42 + i * 70, 22 + i * 12, 0, 0, 7); g.stroke(); }
  g.globalAlpha = 1;
  g.drawImage(shot, x, y, w, h);
  // text
  g.textBaseline = 'alphabetic';
  g.font = '600 44px Poppins, sans-serif'; g.fillStyle = '#F4F2FA';
  g.fillText('Mold', 64, 110);
  const mw = g.measureText('Mold').width, tw = g.measureText('krathong').width;
  const gr = g.createLinearGradient(64 + mw, 0, 64 + mw + tw, 0);
  ['#7FA9B1', '#9BB0DE', '#CBA5D1', '#EB92B3'].forEach((s, i) => gr.addColorStop(i / 3, s));
  g.fillStyle = gr; g.fillText('krathong', 64 + mw, 110);
  g.textAlign = 'center';
  if (story) {
    g.font = '400 40px Prompt, sans-serif'; g.fillStyle = 'rgba(236,230,255,.8)'; g.fillText((story.nickname ? story.nickname + ' ' : 'ฉัน') + 'ลอยกระทงที่', W / 2, 230);
    g.font = '600 76px Prompt, sans-serif'; g.fillStyle = '#F4F2FA'; g.fillText(spot.name, W / 2, 320);
    if (story.wish) { g.font = '400 44px Prompt, sans-serif'; g.fillStyle = '#F4F2FA'; wrap(g, '“' + story.wish + '”', W / 2, 1460, 860, 62); }
    pill(g, W / 2, H - 250, 'มาลอยด้วยกัน → ' + story.url);
    g.font = '400 32px Prompt, sans-serif'; g.fillStyle = 'rgba(236,230,255,.65)'; g.fillText('ลอยกระทงออนไลน์ 2569 · ' + STUDIO.igName, W / 2, H - 150);
    return c;
  }
  g.font = '600 52px Prompt, sans-serif'; g.fillStyle = '#F4F2FA'; g.fillText(spot.name, W / 2, H - 150);
  g.font = '400 30px Prompt, sans-serif'; g.fillStyle = 'rgba(236,230,255,.7)'; g.fillText('ลอยกระทงออนไลน์ · ' + STUDIO.igName, W / 2, H - 98);
  return c;
}

function wrap(g, text, x, y, maxW, lh) {
  const parts = Array.from(text); let line = '', lines = [];
  for (const ch of parts) { if (g.measureText(line + ch).width > maxW && line) { lines.push(line); line = ch; } else line += ch; }
  lines.push(line); lines.slice(0, 3).forEach((l, i) => g.fillText(l, x, y + i * lh));
}
function pill(g, x, y, text) {
  g.font = '500 36px Prompt, sans-serif'; const w = g.measureText(text).width + 80, h = 84;
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); ['#9BB0DE', '#CBA5D1', '#EB92B3'].forEach((c, i) => gr.addColorStop(i / 2, c));
  g.fillStyle = gr; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.fill();
  g.fillStyle = '#252941'; g.fillText(text, x, y + 13);
}

export const makeStory = (shot, spot, info) => makeCard(shot, spot.id, spot, info);
