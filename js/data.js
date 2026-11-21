// Data layer: Supabase (REST, no SDK) when configured, otherwise a local stand-in for testing.
import { SUPABASE } from './config.js?v=8';

export const remote = !!(SUPABASE.url && SUPABASE.key) && !/[?&]local=1/.test(location.search);
export const deviceId = (() => {
  try {
    let d = localStorage.getItem('mk-device');
    if (!d) { d = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)); localStorage.setItem('mk-device', d); }
    return d;
  } catch (_) { return 'anon-' + Math.random().toString(36).slice(2); }
})();

const H = (extra = {}) => ({ apikey: SUPABASE.key, Authorization: 'Bearer ' + SUPABASE.key, ...extra });
const rest = (p) => `${SUPABASE.url}/rest/v1/${p}`;
async function call(url, opts = {}) {
  const r = await fetch(url, opts);
  if (!r.ok) { let msg = r.status + ''; try { msg = (await r.json()).message || msg; } catch (_) {} throw new Error(msg); }
  return r.status === 204 ? null : r.json();
}
const rpc = (fn, body) => call(rest('rpc/' + fn), { method: 'POST', headers: H({ 'Content-Type': 'application/json' }), body: JSON.stringify(body) });

export function imageUrl(path) {
  if (!path) return '';
  if (/^(data:|blob:|https?:|assets\/)/.test(path)) return path;
  return `${SUPABASE.url}/storage/v1/object/public/krathong/${path}`;
}

/* ---------- local stand-in (one browser only) ---------- */
const LS = 'mk-local-v1';
const lget = () => { try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch (_) { return []; } };
const lset = (a) => { try { localStorage.setItem(LS, JSON.stringify(a.slice(-40))); } catch (_) { /* full */ } };
const blobToData = (b) => new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(b); });

/* ---------- api ---------- */
export async function list(spot, since) {
  if (!remote) return lget().filter(k => k.spot_id === spot && !k.hidden && (!since || k.created_at > since)).reverse();
  const q = new URLSearchParams({ select: 'id,spot_id,image_path,nickname,wish,created_at', spot_id: 'eq.' + spot, hidden: 'eq.false', order: 'created_at.desc', limit: '40' });
  if (since) q.append('created_at', 'gt.' + since);
  return call(rest('krathongs?' + q), { headers: H() });
}

export async function counts() {
  if (!remote) { const c = {}; for (const k of lget()) if (!k.hidden) c[k.spot_id] = (c[k.spot_id] || 0) + 1; return c; }
  const rows = await rpc('spot_counts', {});
  const c = {}; for (const r of rows || []) c[r.spot_id] = Number(r.n); return c;
}

export async function float({ spot, blob, nickname, wish, isPublic }) {
  nickname = (nickname || '').trim().slice(0, 20); wish = (wish || '').trim().slice(0, 60);
  if (!remote) {
    const row = { id: 'local-' + Date.now(), spot_id: spot, image_path: await blobToData(blob), nickname, wish: isPublic ? wish : '', created_at: new Date().toISOString(), reports: 0, hidden: false };
    const a = lget(); a.push(row); lset(a); return row;
  }
  const ext = blob.type === 'image/webp' ? 'webp' : 'png';
  const path = `${spot}/${(crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36))}.${ext}`;
  await call(`${SUPABASE.url}/storage/v1/object/krathong/${path}`, { method: 'POST', headers: H({ 'Content-Type': blob.type, 'x-upsert': 'false' }), body: blob });
  const r = await rpc('float_krathong', { p_spot: spot, p_image: path, p_nickname: nickname, p_wish: wish, p_public: !!isPublic, p_device: deviceId });
  return Array.isArray(r) ? r[0] : r;
}

export async function report(id) {
  const key = 'mk-reported';
  let done = []; try { done = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) {}
  if (done.includes(id)) return { already: true };
  done.push(id); try { localStorage.setItem(key, JSON.stringify(done.slice(-200))); } catch (_) {}
  if (!remote) { const a = lget(), k = a.find(x => x.id === id); if (k) { k.reports++; k.hidden = k.reports >= 3; lset(a); return { hidden: k.hidden }; } return {}; }
  const hidden = await rpc('report_krathong', { p_id: id, p_device: deviceId });
  return { hidden: !!hidden };
}
