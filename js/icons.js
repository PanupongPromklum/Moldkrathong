// Duotone filled icons in the Morph palette. Two tones come from CSS: --ia (main) and --ib (detail).
const A = 'fill="var(--ia,#CBA5D1)"', B = 'fill="var(--ib,#252941)"';
const P = {
  back: `<path d="M14.6 4.6a1.8 1.8 0 0 1 0 2.6L9.8 12l4.8 4.8a1.8 1.8 0 1 1-2.6 2.6l-6.1-6.1a1.8 1.8 0 0 1 0-2.6L12 4.6a1.8 1.8 0 0 1 2.6 0z" ${A}/>`,
  close: `<path d="M6.3 6.3a1.7 1.7 0 0 1 2.4 0L12 9.6l3.3-3.3a1.7 1.7 0 1 1 2.4 2.4L14.4 12l3.3 3.3a1.7 1.7 0 1 1-2.4 2.4L12 14.4l-3.3 3.3a1.7 1.7 0 1 1-2.4-2.4L9.6 12 6.3 8.7a1.7 1.7 0 0 1 0-2.4z" ${A}/>`,
  undo: `<path d="M9 4.5a1.6 1.6 0 0 1 0 2.3L8 7.8h5.5a6.2 6.2 0 0 1 0 12.4H11a1.6 1.6 0 1 1 0-3.2h2.5a3 3 0 0 0 0-6H8l1 1a1.6 1.6 0 1 1-2.3 2.3L3.4 11a1.6 1.6 0 0 1 0-2.3l3.3-3.3a1.6 1.6 0 0 1 2.3 0z" ${A}/>`,
  redo: `<g transform="matrix(-1 0 0 1 24 0)"><path d="M9 4.5a1.6 1.6 0 0 1 0 2.3L8 7.8h5.5a6.2 6.2 0 0 1 0 12.4H11a1.6 1.6 0 1 1 0-3.2h2.5a3 3 0 0 0 0-6H8l1 1a1.6 1.6 0 1 1-2.3 2.3L3.4 11a1.6 1.6 0 0 1 0-2.3l3.3-3.3a1.6 1.6 0 0 1 2.3 0z" ${A}/></g>`,
  check: `<path d="M19.4 6.4a1.8 1.8 0 0 1 0 2.5l-8.6 8.7a1.8 1.8 0 0 1-2.6 0L4.6 14a1.8 1.8 0 1 1 2.6-2.6l2.3 2.4 7.4-7.4a1.8 1.8 0 0 1 2.5 0z" ${A}/>`,
  share: `<path d="M12 2.8 17 7.8h-3.4V15h-3.2V7.8H7z" ${A}/><path d="M5 12.5v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5" stroke="var(--ia,#CBA5D1)" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
  save: `<rect x="3.5" y="12" width="17" height="9" rx="4" ${A}/><path d="M10.5 3h3v7.5h3L12 15l-4.5-4.5h3z" ${B}/>`,
  trash: `<path d="M5 8h14l-1.2 11.2a2.5 2.5 0 0 1-2.5 2.3H8.7a2.5 2.5 0 0 1-2.5-2.3z" ${A}/><rect x="3" y="4" width="18" height="3.5" rx="1.75" ${B}/><rect x="9" y="2" width="6" height="3" rx="1.5" ${B}/>`,
  // tabs
  tpl: `<path d="M12 3c5 0 8.5 3.5 8.5 8.6 0 5.3-3.8 9.4-8.5 9.4S3.5 16.9 3.5 11.6C3.5 6.5 7 3 12 3z" ${A}/><ellipse cx="8.6" cy="8.6" rx="2" ry="1.3" transform="rotate(-30 8.6 8.6)" fill="#fff" opacity=".7"/><circle cx="9.5" cy="12.5" r="1.2" ${B}/><circle cx="14.5" cy="12.5" r="1.2" ${B}/>`,
  shape: `<path d="M8.5 21c-3 0-5-2.3-5-5.2 0-2.2 1.2-3.4 1.2-5.6 0-3.3 3.1-6.7 7.3-6.7 4.6 0 8.5 3.4 8.5 8.1 0 5.5-5 9.4-12 9.4z" ${A}/><path d="M9 12.5c1.2-2.4 4.4-3 6.3-1.2M8.2 16c2-3 6.4-3.6 8.8-1.1" stroke="var(--ib,#252941)" stroke-width="1.8" stroke-linecap="round" fill="none"/>`,
  paint: `<path d="M12 2.8c5.5 0 9.2 3.6 9.2 8 0 2.9-2.3 4.3-4.6 4.3h-1.4a1.7 1.7 0 0 0-1.3 2.8 1.9 1.9 0 0 1-1.5 3.2C7 21.1 2.8 17 2.8 12S6.9 2.8 12 2.8z" ${A}/><circle cx="7.6" cy="11.4" r="1.7" ${B}/><circle cx="10.6" cy="7.2" r="1.7" ${B}/><circle cx="15.6" cy="7.6" r="1.7" ${B}/>`,
  face: `<path d="M6 3h12a3 3 0 0 1 3 3v8.5L14.5 21H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" ${A}/><path d="M21 14.5h-4a2.5 2.5 0 0 0-2.5 2.5v4z" ${B} opacity=".35"/><circle cx="9" cy="10" r="1.4" ${B}/><circle cx="15" cy="10" r="1.4" ${B}/><path d="M8.5 13.6c1.9 2.3 5.1 2.3 7 0" stroke="var(--ib,#252941)" stroke-width="1.8" stroke-linecap="round" fill="none"/>`,
  krathong: `<ellipse cx="12" cy="18" rx="9.5" ry="3.5" ${B}/><path d="M12 4c2.4 2.2 3.4 4.7 3 7.6l2.6-2c1.3 2.5 1 4.9-.8 7.4H7.2c-1.8-2.5-2.1-4.9-.8-7.4l2.6 2c-.4-2.9.6-5.4 3-7.6z" ${A}/>`,
  // shape tools
  grab: `<path d="M12 2.5 15.5 6H13.3v4.7H18V8.5l3.5 3.5-3.5 3.5v-2.2h-4.7V18h2.2L12 21.5 8.5 18h2.2v-4.7H6v2.2L2.5 12 6 8.5v2.2h4.7V6H8.5z" ${A}/><circle cx="12" cy="12" r="2.2" ${B}/>`,
  add: `<path d="M12 3c5 0 8.5 3.6 8.5 8.6 0 5.2-3.8 9.4-8.5 9.4s-8.5-4.2-8.5-9.4C3.5 6.6 7 3 12 3z" ${A}/><path d="M12 8v8M8 12h8" stroke="var(--ib,#252941)" stroke-width="2.6" stroke-linecap="round"/>`,
  dig: `<path d="M12 3c5 0 8.5 3.6 8.5 8.6 0 5.2-3.8 9.4-8.5 9.4s-8.5-4.2-8.5-9.4C3.5 6.6 7 3 12 3z" ${A}/><path d="M8 12h8" stroke="var(--ib,#252941)" stroke-width="2.6" stroke-linecap="round"/>`,
  inflate: `<circle cx="12" cy="12" r="9" ${A}/><circle cx="12" cy="12" r="3.6" ${B}/><path d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4" stroke="var(--ib,#252941)" stroke-width="2" stroke-linecap="round" opacity=".5"/>`,
  deflate: `<circle cx="12" cy="12" r="9" ${B} opacity=".3"/><circle cx="12" cy="12" r="5" ${A}/>`,
  smooth: `<rect x="3" y="14" width="18" height="6" rx="3" ${B}/><path d="M3 11.5c2.5-3.2 4.8-3.2 7.2 0s4.6 3.2 7.2 0c1-1.3 2-2 3.6-2" stroke="var(--ia,#CBA5D1)" stroke-width="3" stroke-linecap="round" fill="none"/>`,
  crease: `<path d="M3 5h18l-7.6 13.4a1.6 1.6 0 0 1-2.8 0z" ${A}/><path d="M12 8v8" stroke="var(--ib,#252941)" stroke-width="2.2" stroke-linecap="round"/>`,
  flatten: `<rect x="3" y="15" width="18" height="5" rx="2.5" ${A}/><path d="M12 3v7m-3.5-3.2L12 10.4l3.5-3.6" stroke="var(--ib,#252941)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  scrape: `<path d="M13.4 3.4a2 2 0 0 1 2.8 0l1.4 1.4a2 2 0 0 1 0 2.8L11 14.2 8.8 12z" ${B}/><path d="M4 13.4 8 12l3.2 3.2-1.4 4L4 20z" ${A}/><circle cx="17" cy="17" r="1.6" ${A}/><circle cx="20" cy="13.5" r="1.2" ${A}/>`,
  slice: `<path d="M20.6 3.4a1.6 1.6 0 0 1 0 2.3L9 17.3l-2.3-2.3L18.3 3.4a1.6 1.6 0 0 1 2.3 0z" ${A}/><path d="M6.7 15 9 17.3l-3.4 3.3c-.7.7-3 1-3.3.7s0-2.6.7-3.3z" ${B}/>`,
  wider: `<rect x="6" y="6" width="12" height="12" rx="4" ${B} opacity=".35"/><path d="M2.5 12 6 8.5v7zM21.5 12 18 15.5v-7z" ${A}/><rect x="5" y="10.8" width="14" height="2.4" rx="1.2" ${A}/>`,
  narrower: `<rect x="6" y="6" width="12" height="12" rx="4" ${B} opacity=".35"/><path d="M10.5 12 7 8.5v7zM13.5 12l3.5 3.5v-7z" ${A}/><rect x="2" y="10.8" width="6" height="2.4" rx="1.2" ${A}/><rect x="16" y="10.8" width="6" height="2.4" rx="1.2" ${A}/>`,
  taller: `<rect x="6" y="6" width="12" height="12" rx="4" ${B} opacity=".35"/><path d="M12 2.5 15.5 6h-7zM12 21.5 8.5 18h7z" ${A}/><rect x="10.8" y="5" width="2.4" height="14" rx="1.2" ${A}/>`,
  shorter: `<rect x="6" y="6" width="12" height="12" rx="4" ${B} opacity=".35"/><path d="M12 10.5 8.5 7h7zM12 13.5l3.5 3.5h-7z" ${A}/><rect x="10.8" y="2" width="2.4" height="6" rx="1.2" ${A}/><rect x="10.8" y="16" width="2.4" height="6" rx="1.2" ${A}/>`,
  reset: `<path d="M12 3.5a8.5 8.5 0 1 1-8.2 10.8 1.6 1.6 0 1 1 3.1-.8A5.3 5.3 0 1 0 12 6.7v1.8L8 5.1l4-3.4z" ${A}/><circle cx="12" cy="12" r="2" ${B}/>`,
  // paint tools
  brush: `<path d="M19.8 2.6a1.6 1.6 0 0 1 1.6 1.6c0 .4-.2.8-.4 1.1l-7.4 8.8-2.3-2.3 7.4-8.8c.3-.3.7-.4 1.1-.4z" ${B}/><path d="M9.8 13.3l2 2c0 3.4-2.7 6.2-8.3 6.2 1.4-1.1 1.4-3.2 1.4-4.2 0-2.6 2.1-4 4.9-4z" ${A}/>`,
  fill: `<path d="M11 3.2 19.3 11.5 12 18.8a2.6 2.6 0 0 1-3.7 0l-4.6-4.6a2.6 2.6 0 0 1 0-3.7z" ${A}/><path d="M4 12h14" stroke="var(--ib,#252941)" stroke-width="2" opacity=".35"/><path d="M19.5 14.5s2.2 2.5 2.2 4a2.2 2.2 0 1 1-4.4 0c0-1.5 2.2-4 2.2-4z" ${B}/>`,
  // krathong items
  incense3: `<rect x="11" y="9" width="2" height="13" rx="1" ${B}/><rect x="6.6" y="11" width="2" height="11" rx="1" transform="rotate(-8 7.6 16)" ${B}/><rect x="15.4" y="11" width="2" height="11" rx="1" transform="rotate(8 16.4 16)" ${B}/><circle cx="12" cy="6.5" r="2.6" ${A}/><circle cx="6.8" cy="8.8" r="2" ${A}/><circle cx="17.2" cy="8.8" r="2" ${A}/>`,
  incense1: `<rect x="11" y="8" width="2" height="14" rx="1" ${B}/><circle cx="12" cy="5" r="3" ${A}/>`,
  candle: `<rect x="7.5" y="10" width="9" height="12" rx="2.5" ${B}/><path d="M12 2c2 2.3 2.8 4.3 1.8 6-.4.7-1 1.1-1.8 1.1s-1.4-.4-1.8-1.1C9.2 6.3 10 4.3 12 2z" ${A}/>`,
  marigold: `<path d="M12 3.5a3 3 0 0 1 2.9 2.2 3 3 0 0 1 4 3.6 3 3 0 0 1-.5 4.5A3 3 0 0 1 15 18.6a3 3 0 0 1-6 0 3 3 0 0 1-3.4-4.8 3 3 0 0 1-.5-4.5 3 3 0 0 1 4-3.6A3 3 0 0 1 12 3.5z" ${A}/><circle cx="12" cy="12" r="3" ${B} opacity=".45"/>`,
  lotusbud: `<path d="M12 3c3.4 3.1 4.7 6.8 3.8 11.2-1.1 1-2.4 1.6-3.8 1.6s-2.7-.6-3.8-1.6C7.3 9.8 8.6 6.1 12 3z" ${A}/><path d="M4.5 14.5c2.4 0 4.9 1.2 7.5 3.4 2.6-2.2 5.1-3.4 7.5-3.4-1.4 3.6-4.2 6-7.5 6s-6.1-2.4-7.5-6z" ${B}/>`,
  lotusopen: `<path d="M12 4c2.3 2.4 3.1 5 2.6 8H9.4C8.9 9 9.7 6.4 12 4z" ${A}/><path d="M3.5 9c3.2.2 5.3 1.8 6.3 4.8L8 15.4C5.4 14.3 3.9 12.2 3.5 9zm17 0c-.4 3.2-1.9 5.3-4.5 6.4l-1.8-1.6c1-3 3.1-4.6 6.3-4.8z" ${A}/><path d="M2.5 16c3.2-1.1 6.6-1.1 9.5.9 2.9-2 6.3-2 9.5-.9-1.7 2.8-5.3 4.8-9.5 4.8S4.2 18.8 2.5 16z" ${B}/>`,
  garland: `<circle cx="12" cy="12" r="8.5" ${A}/><circle cx="12" cy="12" r="4.2" fill="var(--tile,#2E3358)"/><circle cx="18.5" cy="8" r="3" ${B}/>`,
  leaf: `<path d="M12 2 18.5 20 12 16.8 5.5 20z" ${A}/><path d="M12 5v11.5" stroke="var(--ib,#252941)" stroke-width="1.6" opacity=".5"/>`,
  coin: `<circle cx="12" cy="12" r="9" ${A}/><circle cx="12" cy="12" r="6.2" ${B} opacity=".25"/><path d="M10.2 8.5h3.2a1.8 1.8 0 0 1 0 3.5h-3.2m0 0h3.6a1.8 1.8 0 0 1 0 3.5h-3.6zm0-3.5V8.5m0 7V16" stroke="var(--ib,#252941)" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,
  // other
  gift: `<rect x="3" y="9" width="18" height="12" rx="3" ${A}/><rect x="2" y="7" width="20" height="4.5" rx="2" ${A}/><rect x="10.8" y="7" width="2.4" height="14" ${B}/><path d="M12 7c-1.5-3.5-5.5-4-5.5-1.5S10 7 12 7zm0 0c1.5-3.5 5.5-4 5.5-1.5S14 7 12 7z" ${B}/>`,
  wave: `<path d="M2 15c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.6 5-1.2V21H2z" ${A}/><path d="M2 10.5c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.6 5-1.2" stroke="var(--ib,#252941)" stroke-width="2.2" stroke-linecap="round" fill="none"/>`,
  sym: `<rect x="11" y="2" width="2" height="20" rx="1" ${B}/><path d="M9 6v12l-6.5-6zM15 6v12l6.5-6z" ${A}/>`,
  eye: `<path d="M12 5c5 0 8.8 4.3 9.8 7-1 2.7-4.8 7-9.8 7S3.2 14.7 2.2 12C3.2 9.3 7 5 12 5z" ${A}/><circle cx="12" cy="12" r="3.4" ${B}/>`,
  heart: `<path d="M12 21s-8.5-5.4-8.5-11.3A4.7 4.7 0 0 1 12 6.9a4.7 4.7 0 0 1 8.5 2.8C20.5 15.6 12 21 12 21z" ${A}/><ellipse cx="8" cy="9.5" rx="1.6" ry="1" transform="rotate(-35 8 9.5)" fill="#fff" opacity=".6"/>`,
  pin: `<path d="M12 2.5a7.5 7.5 0 0 1 7.5 7.5c0 5.3-7.5 11.5-7.5 11.5S4.5 15.3 4.5 10A7.5 7.5 0 0 1 12 2.5z" ${A}/><circle cx="12" cy="10" r="3" ${B}/>`,
};
export function icon(name, cls = '') {
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[name] || P.tpl}</svg>`;
}
export function iconEl(name) { const t = document.createElement('template'); t.innerHTML = icon(name); return t.content.firstChild; }
