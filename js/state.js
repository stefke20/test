// Pintje — save state, economy formulas and rolling beers.
'use strict';

// =====================================================================
// STATE
// =====================================================================
const TOP = 40;
const SAVE_KEY = 'pintje2';
const dayKey = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const todayKey = () => dayKey(new Date());
const blank = () => ({
  v: 3, counts: {}, total: 0, staffPints: 0, day: todayKey(), today: 0, skin: 'vaasje', bg: 'bruin', theme: 'klassiek',
  ach: [], flags: {}, xp: 0, skills: {}, seenSkins: [], seenBgs: [], seenThemes: [], sets: [], colRewards: [],
  bon: 0, bonLife: 0, bonAll: 0, bld: {}, upg: [], stars: 0, taps: 0, caps: 0,
  crates: { bak: 0, krat: 0, vat: 0 }, opened: 0, streak: 0, lastDaily: '', lastLevel: 1, lastSeen: 0, pukes: 0,
  mg: { best: 0, plays: 0, perfects: 0, day: '', today: 0 }, quests: null, questsDone: 0, questDays: 0,
  zat: 0, zatAt: 0, events: 0, quizRight: 0, thieves: 0, playSecs: 0,
  hop: 0, hopTotal: 0, hopTree: {}, prestiges: 0,
  bestCombo: 0, challenges: 0, bobs: 0, seasonsPlayed: [], seasonSeen: [], seasonGifts: {}, noAmbient: false,
  dog: { lvl: 0, lastPet: 0, pets: 0 }, pong: { best: 0, plays: 0, clears: 0, day: '', today: 0 }, schols: 0,
});
let S = blank();
let wipedBefore = false;
try { wipedBefore = localStorage.getItem('pintje-wiped') === '1'; } catch (e) {}
try {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  if (saved) {
    S = Object.assign(blank(), saved);
    if (typeof S.crates === 'number') S.crates = { bak: Math.min(S.crates, 3), krat: 0, vat: 0 };
    S.crates = Object.assign({ bak: 0, krat: 0, vat: 0 }, S.crates);
    S.mg = Object.assign(blank().mg, S.mg || {});
    S.dog = Object.assign(blank().dog, S.dog || {});
    S.pong = Object.assign(blank().pong, S.pong || {});
    S.hopTree = S.hopTree || {};
    if ((saved.v || 0) < 3) {
      // v3: staff pints no longer give XP; rebuild XP from the collection and hand back the skill points
      S.xp = BEERS.reduce((x, b) => x + Math.min(S.counts[b.id] || 0, 2000) * RARITIES[b.r].xp, 0);
      S.lastLevel = levelInfo(S.xp).lvl;
      S.skills = {};
      S.v = 3;
    }
  } else if (!wipedBefore) {
    const old = JSON.parse(localStorage.getItem('pintje') || 'null');  // first version of the app
    if (old && old.total) {
      S.total = old.total;
      if (old.wv) S.counts.westvleteren = old.wv;
      if (old.total - (old.wv || 0) > 0) S.counts.jupiler = old.total - (old.wv || 0);
      S.xp = BEERS.reduce((x, b) => x + (S.counts[b.id] || 0) * RARITIES[b.r].xp, 0);
    }
  }
} catch (e) {}
if (S.day !== todayKey()) { S.day = todayKey(); S.today = 0; S.zat = 0; }
if (!SKIN[S.skin]) S.skin = 'vaasje';
if (!THEME[S.theme]) S.theme = 'klassiek';
let wiping = false;
const save = () => { if (wiping) return; S.lastSeen = Date.now(); try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} };

const rank = id => S.skills[id] || 0;
const hrank = id => (S.hopTree && S.hopTree[id]) || 0;
// owned upgrades as a Set, rebuilt only when the list changes (this sits on the per-frame path)
let upgCache = { ref: null, len: -1, set: new Set() };
const has = id => {
  if (upgCache.ref !== S.upg || upgCache.len !== S.upg.length) upgCache = { ref: S.upg, len: S.upg.length, set: new Set(S.upg) };
  return upgCache.set.has(id);
};
const spent = () => Object.values(S.skills).reduce((a, b) => a + b, 0);
const freePoints = () => levelInfo(S.xp).lvl - 1 + hrank('h_sp') * 3 - spent();
const uniqueCount = s => CORE.filter(b => s.counts[b.id] > 0).length;
const points = s => BEERS.reduce((p, b) => p + (s.counts[b.id] || 0) * RARITIES[b.r].pts, 0);
const bestRarity = s => BEERS.reduce((m, b) => s.counts[b.id] > 0 ? Math.max(m, b.r) : m, -1);
const bldTotal = s => Object.values(s.bld).reduce((a, b) => a + b, 0);
const crateTotal = () => S.crates.bak + S.crates.krat + S.crates.vat;
const fmtAbv = abv => abv == null ? '∞%' : abv.toFixed(1).replace('.', ',') + '%';
function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1e6) return n < 100 && n % 1 ? n.toFixed(1).replace('.', ',') : Math.floor(n).toLocaleString('nl-BE');
  const u = [[1e21, 'trd'], [1e18, 'trln'], [1e15, 'bljd'], [1e12, 'bljn'], [1e9, 'mjd'], [1e6, 'mln']].find(([v]) => n >= v);
  const x = n / u[0];
  return x.toFixed(x < 10 ? 2 : x < 100 ? 1 : 0).replace('.', ',') + ' ' + u[1];
}
const fmtPct = p => (p >= 1 ? p.toFixed(1) : p >= 0.1 ? p.toFixed(2) : p >= 0.01 ? p.toFixed(3) : p.toFixed(4)).replace('.', ',') + '%';

// =====================================================================
// ECONOMY
// =====================================================================
const buffs = { prod: null, click: null, luck: null };
const buffMult = k => buffs[k] && buffs[k].until > performance.now() ? buffs[k].mult : 1;
// real-world clock bonuses
let TB = [];
function refreshTimeBuffs() {
  const d = new Date(), h = d.getHours(), wd = d.getDay(), out = [];
  if (h >= 17 && h < 19) out.push({ k: 'click', mult: 2, name: 'Happy hour 17–19 u: eigen slokken ×2' });
  if (((wd === 5 || wd === 6) && h >= 20) || ((wd === 6 || wd === 0) && h < 3)) out.push({ k: 'prod', mult: 1.5, name: 'Weekend: personeel ×1,5' });
  if (wd === 0 && h >= 10 && h < 13) out.push({ k: 'xp', mult: 1.5, name: 'Zondagsmatinee: XP ×1,5' });
  if (wd === 1) out.push({ k: 'luck', mult: 1.2, name: 'Blauwe maandag: geluk ×1,2' });
  activeSeasons = SEASONS.filter(x => inSeason(x, d)).map(x => x.id);
  activeSeasons.forEach(id => SEASON[id].eff.forEach(([k, mult]) => out.push({ k, mult, name: `${SEASON[id].ico} ${SEASON[id].name}: ${k === 'prod' ? 'personeel' : k === 'click' ? 'eigen slokken' : k === 'xp' ? 'XP' : 'geluk'} ×${String(mult).replace('.', ',')}` })));
  TB = out;
}
refreshTimeBuffs();
const timeMult = k => TB.filter(b => b.k === k).reduce((m, b) => m * b.mult, 1);
const starMult = () => 1 + S.stars * 0.05;
const setMult = () => 1 + S.sets.reduce((t, id) => t + (SETS.find(x => x.id === id)?.bonus || 0), 0) + S.colRewards.length * 0.02;
const allBonMult = () => Math.pow(1.5, BON_UPS.filter(has).length) * starMult() * setMult() * (1 + rank('legende') * 0.15) * (1 + S.dog.lvl * 0.02) * Math.pow(1.75, hrank('h_bon'));
const BLD_UPS = Object.fromEntries(BUILDINGS.map(b => [b.id, UPGRADES.filter(u => u.bld === b.id).map(u => u.id)]));
const BON_UPS = ['bon1', 'bon2', 'bon3', 'bon4', 'bon5', 'bon6', 'bon7'];
const bldMult = id => Math.pow(BLD_UP_MULT, BLD_UPS[id].filter(has).length);
const bldSps = b => b.sps * bldMult(b.id) * (1 + rank('tap') * 0.1) * Math.pow(2, hrank('h_staff'));
const baseSps = () => BUILDINGS.reduce((t, b) => t + (S.bld[b.id] || 0) * bldSps(b), 0);
const sps = () => baseSps() * buffMult('prod') * timeMult('prod');
const staffIncome = () => sps() * allBonMult();
const ownMult = () => (1 + rank('fooi') * 0.1);
const clickMult = () => (has('klik1') ? 2 : 1) * (has('klik2') ? 2 : 1) * (has('klik6') ? 2 : 1) * buffMult('click') * timeMult('click');
const clickPct = () => ['klik3', 'klik4', 'klik5', 'klik7'].filter(has).length * 0.01;
// value of one sip YOU take
const sipValue = () => allBonMult() * clickMult() * ownMult() + staffIncome() * clickPct() * buffMult('click');
const pintMult = () => Math.pow(2, ['pint1', 'pint2', 'pint3'].filter(has).length) * ownMult();
// bonus for a pint YOU finish: flat by rarity plus some seconds of staff income
const pintBonus = b => (RARITIES[b.r].pts * 5 * allBonMult() + staffIncome() * RARITIES[b.r].secs) * pintMult();
const bldCost = (b, n = 1) => { const own = S.bld[b.id] || 0; return Math.ceil(b.cost * Math.pow(1.15, own) * (Math.pow(1.15, n) - 1) / 0.15 * (1 - rank('korting') * 0.03)); };
const achBon = () => Math.round(Math.max(50, staffIncome() * 60));
function addBon(x) {
  if (!(x > 0)) return;
  S.bon += x; S.bonLife += x; S.bonAll += x;
  questProg('earn', x);
}

// =====================================================================
// ROLLING
// =====================================================================
function weights() {
  const luck = (1 + rank('geluk') * 0.15) * buffMult('luck') * timeMult('luck') * Math.pow(1.3, hrank('h_luck')), edel = (1 + rank('edel') * 0.5) * Math.pow(1.5, hrank('h_gem'));
  const w = RARITIES.map((r, i) => r.weight * (i >= 2 ? luck : 1) * (i >= GEM && i <= COSMIC ? edel : 1));
  if (rank('arnoldus')) { w[MYTHIC] *= 10; w[DIVINE] *= 10; }
  if (hrank('h_myth')) { w[MYTHIC] *= 5; w[DIVINE] *= 5; }
  return w;
}
function tierProbs() {
  const w = weights(), sum = w.reduce((a, b) => a + b, 0), p = w.map(x => x / sum);
  const re = p[0] * rank('kans') * 0.08;
  return p.map((pi, i) => (i === 0 ? pi - re : pi) + re * pi);
}
function rollTier(min = 0) {
  const w = weights().map((x, i) => i < min ? 0 : x), sum = w.reduce((a, b) => a + b, 0);
  let x = Math.random() * sum;
  for (let i = w.length - 1; i >= 0; i--) { if (x < w[i]) return i; x -= w[i]; }
  return min;
}
let secondChance = false;
function rollBeer(min = 0) {
  let tier = rollTier(min);
  secondChance = false;
  if (tier === 0 && Math.random() < rank('kans') * 0.08) { tier = rollTier(); secondChance = true; }
  const pool = BY_TIER[tier].filter(b => !b.season || seasonActive(b.season));
  return pick(pool.length ? pool : BY_TIER[tier].filter(b => !b.season));
}

// =====================================================================
// ELEMENTS & HELPERS
// =====================================================================
const $ = id => document.getElementById(id);
const setText = (el, v) => { if (el.textContent !== v) el.textContent = v; };
const beerRect = $('beer'), foam = $('foam'), bubbles = $('bubbles'), glassWrap = $('glassWrap');
const status = $('status'), drinkBtn = $('drink'), refillBtn = $('refill'), tiltBtn = $('tilt');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let dirty = true;
