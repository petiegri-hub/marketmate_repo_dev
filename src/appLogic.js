export const STORAGE_KEY = 'marketmate-ai-v02';
export const DEFAULT_POSTS = [
  { id: 'seed-1', date: '2026-10-29', time: '09:30', platform: 'Instagram', type: 'Post', title: 'Őszi újdonságok a stúdióban', status: 'Needs approval', copy: 'Megérkeztek az őszi kedvenceink 🍂 Foglalj időpontot, és frissülj fel a szezonra! Írj nekünk üzenetet a részletekért.', goal: 'Reach', source: 'demo' },
  { id: 'seed-2', date: '2026-10-30', time: '12:00', platform: 'Facebook', type: 'Post', title: 'Vendégvélemény – kiemelt poszt', status: 'Draft', copy: 'A legjobb visszajelzés az elégedett vendég. Köszönjük, hogy minket választottál!', goal: 'Trust', source: 'demo' },
  { id: 'seed-3', date: '2026-10-31', time: '08:00', platform: 'Google Ads', type: 'Campaign', title: 'Helyi keresési kampány', status: 'Needs approval', copy: 'Helyi keresési kampányterv – a tényleges hirdetésindítás nincs bekötve.', goal: 'Leads', source: 'demo' },
  { id: 'seed-4', date: '2026-11-02', time: '10:00', platform: 'Instagram', type: 'Story', title: 'Kulisszák mögött', status: 'Planned', copy: 'Mutass egy rövid, természetes pillanatot a mindennapi munkából.', goal: 'Engagement', source: 'demo' },
  { id: 'seed-5', date: '2026-11-04', time: '17:30', platform: 'Facebook', type: 'Post', title: 'Hétvégi időpontok', status: 'Planned', copy: 'Tervezd meg előre a hétvégédet – kérj időpontot üzenetben!', goal: 'Bookings', source: 'demo' },
  { id: 'seed-6', date: '2026-11-05', time: '09:00', platform: 'Instagram', type: 'Reel', title: '3 tipp otthoni ápoláshoz', status: 'Draft', copy: 'Három egyszerű tipp, amelyet otthon is könnyen kipróbálhatsz.', goal: 'Education', source: 'demo' },
];
export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return { posts: DEFAULT_POSTS, language: 'hu', brand: { name: 'Studio Bloom', industry: 'Beauty & wellness', market: 'Budapest', voice: 'Barátságos, modern, közvetlen' } };
    const parsed = JSON.parse(raw);
    return { posts: Array.isArray(parsed.posts) ? parsed.posts : DEFAULT_POSTS, language: parsed.language === 'en' ? 'en' : 'hu', brand: parsed.brand || { name: 'Studio Bloom', industry: 'Beauty & wellness', market: 'Budapest', voice: 'Barátságos, modern, közvetlen' } };
  } catch { return { posts: DEFAULT_POSTS, language: 'hu', brand: { name: 'Studio Bloom', industry: 'Beauty & wellness', market: 'Budapest', voice: 'Barátságos, modern, közvetlen' } }; }
}
export function saveState(state, storage = globalThis.localStorage) {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}
export function addPost(posts, input) {
  if (!input.title?.trim()) throw new Error('TITLE_REQUIRED');
  if (!input.date || Number.isNaN(Date.parse(`${input.date}T12:00:00`))) throw new Error('DATE_REQUIRED');
  return [...posts, { id: globalThis.crypto?.randomUUID?.() || `post-${Date.now()}-${Math.random().toString(16).slice(2)}`, date: input.date, time: input.time || '10:00', platform: input.platform || 'Instagram', type: input.type || 'Post', title: input.title.trim(), status: input.status || 'Planned', copy: input.copy || '', goal: input.goal || 'Awareness', source: 'user' }];
}
export function moveMonth(date, amount) { return new Date(date.getFullYear(), date.getMonth() + amount, 1); }
export function weekStart(date) { const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); d.setHours(12, 0, 0, 0); return d; }
export function isoDate(date) { const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0'); return `${y}-${m}-${d}`; }
export function createDraft({ topic, business, goal, platform, language = 'hu', voice = '' }) {
  const subject = topic?.trim() || (language === 'en' ? `${business}: ${goal}` : `${business}: ${goal}`);
  const en = language === 'en';
  const copy = en
    ? `${subject}\n\n${voice ? `Brand voice: ${voice}. ` : ''}Share one useful detail, explain how it helps your customers, and keep the message clear and friendly.\n\nSuggested CTA: Send us a message to learn more.`
    : `${subject}\n\n${voice ? `Márkahang: ${voice}. ` : ''}Mutasd meg, miben segít a terméked vagy szolgáltatásod, emelj ki egy konkrét előnyt, és fogalmazz közvetlenül.\n\nJavasolt CTA: Írj nekünk üzenetet a részletekért!`;
  return { title: subject.slice(0, 64), platform, type: platform === 'Google Ads' ? 'Campaign' : 'Post', copy, goal, status: 'Draft', source: 'template' };
}
