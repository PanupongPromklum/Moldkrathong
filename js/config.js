// Places, links and map settings. Change here; no other file needs editing.
export const GAME_NAME = 'Moldkrathong';

// Supabase (leave empty = local test mode, saves only in this browser)
export const SUPABASE = {
  url: 'https://rrnbvucexpsrmqrxdwdh.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybmJ2dWNleHBzcm1xcnhkd2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMzQyMjAsImV4cCI6MjExMDgxMDIyMH0.oAqdaqxTn118GcVODplT23A7e5cnc738wYAFcJ_vP04', // public anon key (safe to ship)
};

export const MAP_STYLE = 'https://carto.elemnt.earth/2026-06-22_deep-cool-dark/style.json';

export const SPOTS = [
  { id: 'moldable', name: 'บ่อ Moldable', sub: 'Moldable Studio · บ่อลอยกระทงของทีม', lng: 100.546946, lat: 13.788627, studio: true },
  { id: 'rama8',  name: 'สะพานพระราม 8', sub: 'สวนสันติชัยปราการ · แม่น้ำเจ้าพระยา', lng: 100.4948, lat: 13.7716 },
  { id: 'rotfai', name: 'สวนรถไฟ',       sub: 'สวนวชิรเบญจทัศ · บึงในสวน',           lng: 100.5528, lat: 13.8102 },
  { id: 'watarun',    name: 'วัดอรุณ',        sub: 'วัดอรุณราชวราราม · ริมเจ้าพระยา',     lng: 100.4888, lat: 13.7437, char: 'flower', color: 'var(--warm)' },
  { id: 'mahakan',    name: 'ป้อมมหากาฬ',     sub: 'ริมคลองรอบกรุง · มองเห็นภูเขาทอง',     lng: 100.5047, lat: 13.7563, char: 'diamond', color: 'var(--peri)' },
  { id: 'songwat',    name: 'ถนนทรงวาด',      sub: 'ย่านเยาวราช · ริมเจ้าพระยา',           lng: 100.5098, lat: 13.7385, char: 'cloud', color: 'var(--pink)' },
  { id: 'iconsiam',   name: 'ไอคอนสยาม',      sub: 'ลานริมแม่น้ำ · ริมเจ้าพระยา',           lng: 100.5106, lat: 13.7267, char: 'splat', color: 'var(--teal)' },
  { id: 'asiatique',  name: 'เอเชียทีค',       sub: 'ชิงช้าสวรรค์ · ริมเจ้าพระยา',          lng: 100.5028, lat: 13.7046, char: 'gumdrop', color: 'var(--lilac)' },
  { id: 'lumphini',   name: 'สวนลุมพินี',      sub: 'บึงใหญ่กลางเมือง · ปทุมวัน',            lng: 100.5418, lat: 13.7309, char: 'cloud', color: 'var(--teal)' },
  { id: 'benjakitti', name: 'สวนเบญจกิติ',     sub: 'บึงและสะพานลอยฟ้า · คลองเตย',          lng: 100.5583, lat: 13.7297, char: 'flower', color: 'var(--pink)' },
];

export const STUDIO = {
  name: 'Moldable Studio', lng: 100.546946, lat: 13.788627,
  ig: 'https://www.instagram.com/moldable.studio/', igName: '@moldable.studio',
};

// Ready-made krathongs (replace the PNGs in assets/free/ with the team's designs, same file names)
export const READY = [
  { id: 'pinklotus', name: 'บัวชมพู' }, { id: 'leaf', name: 'ใบตองเขียว' }, { id: 'heart', name: 'บานเย็น' },
  { id: 'gold', name: 'ดาวเรืองทอง' }, { id: 'sky', name: 'ฟ้าใส' },
];

export const MAP_VIEW = { center: [100.522, 13.792], zoom: 12.4, pitch: 50, bearing: -12 };
export const MAP_BOUNDS = [[100.25, 13.55], [100.85, 14.05]];
