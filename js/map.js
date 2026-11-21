// Map screen: ELEMNT Cartographer style (MapLibre + PMTiles), night-tinted, with spot pins.
import { MAP_STYLE, SPOTS, STUDIO, MAP_VIEW, MAP_BOUNDS } from './config.js?v=10';
import { charCanvas } from './characters.js?v=10';
import { icon } from './icons.js?v=10';

const KRATHONG_SVG = `<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="kg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9BB0DE"/><stop offset=".55" stop-color="#CBA5D1"/><stop offset="1" stop-color="#EB92B3"/></linearGradient></defs>
<ellipse cx="24" cy="34" rx="18" ry="6.5" fill="#ECE9F7"/><path d="M24 10c6 5 9 11 8 18-2.6 2-5.3 3-8 3s-5.4-1-8-3c-1-7 2-13 8-18z" fill="url(#kg)"/>
<path d="M12 22c4 1 7 4 8 9-3 .3-6-.4-8.6-2-.6-2.4-.4-4.8.6-7zM36 22c-4 1-7 4-8 9 3 .3 6-.4 8.6-2 .6-2.4.4-4.8-.6-7z" fill="#CBA5D1"/><rect x="23" y="3" width="2" height="8" rx="1" fill="#FFE2A8"/><circle cx="24" cy="3" r="2.4" fill="#FFB76B"/></svg>`;

function tintStyle(style) {
  for (const l of style.layers || []) {
    if (l.type === 'background') l.paint = { ...(l.paint || {}), 'background-color': '#11152c' };
    if (l.id === 'water' && l.type === 'fill') l.paint = { ...(l.paint || {}), 'fill-color': '#27326c' };
  }
  return style;
}

export async function createMap(el, { onSpot, onStudio }) {
  maplibregl.addProtocol('pmtiles', new pmtiles.Protocol().tile);
  let style = MAP_STYLE;
  try { const r = await fetch(MAP_STYLE); if (r.ok) style = tintStyle(await r.json()); } catch (_) { /* use the url as is */ }
  const map = new maplibregl.Map({
    container: el, style, ...MAP_VIEW, maxBounds: MAP_BOUNDS, minZoom: 10.5, maxZoom: 17.5,
    attributionControl: false, dragRotate: true, pitchWithRotate: false, fadeDuration: 0,
    maxPitch: 60, renderWorldCopies: false,
  });
  // credits live behind a small (i) — OpenStreetMap's licence requires them to stay reachable
  map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: 'Map style © <a href="https://elemnt.earth" target="_blank" rel="noopener">ELEMNT</a>' }), 'bottom-left');
  map.once('idle', () => el.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show'));
  map.touchZoomRotate.disableRotation();

  const markers = []; let order = 0;
  for (const s of SPOTS) {
    const b = document.createElement('button');
    b.className = 'pin'; b.type = 'button'; b.dataset.spot = s.id; b.style.setProperty('--d', (order++ * .12) + 's'); b.setAttribute('aria-label', 'ลอยกระทงที่ ' + s.name);
    b.innerHTML = `<span class="pin-glow"></span><span class="pin-icon">${s.studio ? '' : icon('krathong')}</span><span class="pin-label">${s.name}</span>`;
    if (s.studio) { b.classList.add('pin-studio'); b.querySelector('.pin-icon').append(charCanvas('gumdrop', { size: 40, mood: 'smile' })); }
    b.addEventListener('click', (e) => { e.stopPropagation(); map.easeTo({ center: [s.lng, s.lat], zoom: Math.max(map.getZoom(), 13.4), duration: 600 }); onSpot(s); });
    markers.push(new maplibregl.Marker({ element: b, anchor: 'bottom' }).setLngLat([s.lng, s.lat]).addTo(map));
  }

  const fitAll = (dur = 700) => {
    const b = new maplibregl.LngLatBounds(); for (const s of SPOTS) b.extend([s.lng, s.lat]);
    map.fitBounds(b, { padding: { top: 130, bottom: 120, left: 70, right: 90 }, maxZoom: 14, duration: dur, pitch: 45, bearing: -12 });
  };
  map.once('load', () => fitAll(0));
  return {
    map, fitAll,
    zoomIn: () => map.zoomIn({ duration: 300 }), zoomOut: () => map.zoomOut({ duration: 300 }),
    resize: () => map.resize(),
    flyHome: () => map.easeTo({ ...MAP_VIEW, duration: 700 }),
  };
}
