// Places, links and map settings. Change here; no other file needs editing.
export const GAME_NAME = 'Moldkrathong';

export const MAP_STYLE = 'https://carto.elemnt.earth/2026-06-22_deep-cool-dark/style.json';

export const SPOTS = [
  { id: 'moldable', name: 'บ่อ Moldable', sub: 'Moldable Studio · บ่อลอยกระทงของทีม', lng: 100.546946, lat: 13.788627, studio: true },
  { id: 'rama8',  name: 'สะพานพระราม 8', sub: 'สวนสันติชัยปราการ · แม่น้ำเจ้าพระยา', lng: 100.4948, lat: 13.7716 },
  { id: 'rotfai', name: 'สวนรถไฟ',       sub: 'สวนวชิรเบญจทัศ · บึงในสวน',           lng: 100.5528, lat: 13.8102 },
];

export const STUDIO = {
  name: 'Moldable Studio', lng: 100.546946, lat: 13.788627,
  ig: 'https://www.instagram.com/moldable.studio/', igName: '@moldable.studio',
};

export const MAP_VIEW = { center: [100.522, 13.792], zoom: 12.4, pitch: 50, bearing: -12 };
export const MAP_BOUNDS = [[100.25, 13.55], [100.85, 14.05]];
