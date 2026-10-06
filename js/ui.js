// Pintje — panel rendering, navigation and progress checks.
'use strict';

// =====================================================================
// PANELS
// =====================================================================
function renderWallet() {
  const inc = staffIncome();
  setText($('bon'), fmt(S.bon));
  setText($('bonRate'), fmt(inc));
  setText($('kBon'), fmt(S.bon));
  setText($('kRate'), fmt(inc));
  setText($('kPints'), fmt(S.staffPints));
  const t = performance.now();
  const b = [buffs.prod, buffs.click, buffs.luck].filter(x => x && x.until > t).map(x => `<span class="buff">${x.name} · ${Math.ceil((x.until - t) / 1000)}s</span>`).join('')
    + TB.map(x => `<span class="buff" style="background:var(--panel-solid);color:var(--accent);border:1px solid var(--accent)">${x.name}</span>`).join('');
  if ($('buffs').innerHTML !== b) $('buffs').innerHTML = b;
  let cr = Object.keys(CRATES).filter(k => S.crates[k] > 0).map(k => `<button class="crate-btn ${k}" data-crate="${k}">${CRATES[k].ico} ${CRATES[k].name} (${S.crates[k]})</button>`).join('');
  if (crateTotal() > 1) cr += `<button class="crate-btn all" data-crate="all">Alles openen (${crateTotal()})</button>`;
  const box = $('crates');
  if (box.dataset.html !== cr) { box.dataset.html = cr; box.innerHTML = cr; }
  const anyAffordable = BUILDINGS.some(bd => isBldVisible(bd) && bldCost(bd) <= S.bon) || UPGRADES.some(u => !has(u.id) && u.show(S) && u.cost <= S.bon);
  $('kroegDot').classList.toggle('hidden', !anyAffordable);
  $('spelDot').classList.toggle('hidden', !(activeSeasons.some(id => S.seasonGifts[id] !== todayKey()) || S.quests && (S.quests.list.some(q => q.prog >= q.goal && !q.claimed) || (!S.quests.bonus && S.quests.list.every(q => q.claimed)))));
}

function renderTapStats() {
  setText($('today'), fmt(S.today));
  setText($('total'), fmt(S.total));
  setText($('uniq'), `${uniqueCount(S)}/${CORE.length}`);
  setText($('ptsLabel'), fmt(points(S)));
  const eff = Math.max(0, S.zat - rank('lever') * 2), zat = Math.min(eff, 10);
  $('zatFill').style.width = zat * 10 + '%';
  setText($('zatLabel'), ['nuchter', 'nuchter', 'tipsy', 'tipsy', 'aangeschoten', 'aangeschoten', 'zat', 'zat', 'stomzat', 'stomzat', 'lazarus'][zat]);
  document.body.classList.remove('zat-1', 'zat-2', 'zat-3');
  if (eff >= 3) document.body.classList.add(eff >= 10 ? 'zat-3' : eff >= 6 ? 'zat-2' : 'zat-1');
  const li = levelInfo(S.xp);
  setText($('lvlBadge'), 'Lvl ' + li.lvl);
  $('pBadge').classList.toggle('hidden', !S.prestiges);
  setText($('pBadge'), '🌿' + S.prestiges);
  $('xpFill').style.width = (li.into / li.need * 100) + '%';
  setText($('xpLabel'), `${fmt(li.into)} / ${fmt(li.need)} XP`);
  $('spDot').classList.toggle('hidden', freePoints() <= 0);
}

// ---- kroeg: built once, updated in place ----
let buyAmt = 1;
document.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {
  buyAmt = +b.dataset.amt;
  document.querySelectorAll('.seg button').forEach(x => x.setAttribute('aria-pressed', x === b));
  renderKroeg();
}));
const isBldVisible = b => (S.bld[b.id] || 0) > 0 || S.bonAll >= b.cost * 0.4 || b.id === 'rietje';
const bldEls = {};
BUILDINGS.forEach(b => {
  const el = document.createElement('button');
  el.className = 'bld';
  el.innerHTML = '<div class="ico"></div><div><div class="n"></div><div class="m"></div><div class="cost"></div></div><div class="own"></div>';
  el.addEventListener('click', () => {
    const cost = bldCost(b, buyAmt);
    if (cost > S.bon) return;
    S.bon -= cost; S.bld[b.id] = (S.bld[b.id] || 0) + buyAmt;
    questProg('buy', buyAmt);
    ching(); dirty = true; renderKroeg(); renderWallet(); save();
  });
  $('bldList').appendChild(el);
  bldEls[b.id] = el;
});
function renderKroeg() {
  BUILDINGS.forEach((b, i) => {
    const el = bldEls[b.id], vis = isBldVisible(b), own = S.bld[b.id] || 0;
    el.hidden = !vis && !(i === 0 || isBldVisible(BUILDINGS[i - 1]));
    el.classList.toggle('mystery', !vis);
    const cost = bldCost(b, buyAmt);
    const dis = !vis || cost > S.bon;
    if (el.disabled !== dis) el.disabled = dis;
    setText(el.querySelector('.ico'), vis ? b.ico : '❔');
    setText(el.querySelector('.n'), vis ? b.name : '???');
    const each = bldSps(b) * allBonMult();
    setText(el.querySelector('.m'), vis ? `${b.desc} ${fmt(each)} bonnekes/s per stuk${own ? ` · samen ${fmt(each * own)}/s` : ''}` : 'Verdien meer bonnekes om dit te ontdekken.');
    setText(el.querySelector('.cost'), vis ? `🎟️ ${fmt(cost)}${buyAmt > 1 ? ` voor ${buyAmt}` : ''}` : '');
    setText(el.querySelector('.own'), own ? String(own) : '');
  });
  const list = $('upgList');
  const avail = UPGRADES.filter(u => !has(u.id) && u.show(S)).sort((a, b) => a.cost - b.cost);
  const key = avail.map(u => u.id).join(',');
  if (list.dataset.key !== key) {
    list.dataset.key = key;
    list.textContent = '';
    if (!avail.length) list.innerHTML = '<div class="empty">Nieuwe verbeteringen verschijnen naarmate je kroeg groeit.</div>';
    avail.forEach(u => {
      const el = document.createElement('button');
      el.className = 'upg'; el.dataset.id = u.id;
      el.innerHTML = '<div class="n"></div><div class="m"></div><div class="cost"></div>';
      el.querySelector('.n').textContent = `${u.ico} ${u.name}`;
      el.querySelector('.m').textContent = u.desc;
      el.querySelector('.cost').textContent = `🎟️ ${fmt(u.cost)}`;
      el.addEventListener('click', () => {
        if (has(u.id) || u.cost > S.bon) return;
        S.bon -= u.cost; S.upg.push(u.id);
        ching(); queueToast(`${u.ico} ${u.name} gekocht`);
        dirty = true; renderKroeg(); renderWallet(); save();
      });
      list.appendChild(el);
    });
  }
  list.querySelectorAll('.upg').forEach(el => { const d = UPG[el.dataset.id].cost > S.bon; if (el.disabled !== d) el.disabled = d; });
  const pot = Math.floor(Math.cbrt(S.bonAll / 1e10)), claim = pot - S.stars;
  setText($('prestigeInfo'), `Je hebt ${S.stars} ⭐. ${claim > 0 ? `Een nieuwe kroeg geeft je er nu ${claim} bij.` : `Volgende ster bij ${fmt(Math.pow(S.stars + 1, 3) * 1e10)} bonnekes in totaal (nu ${fmt(S.bonAll)}).`}`);
  const pb = $('prestigeBtn');
  if (pb.disabled !== (claim < 1)) pb.disabled = claim < 1;
  if (!prestigeArmed) setText(pb, claim > 0 ? `Nieuwe kroeg openen (+${claim} ⭐)` : 'Nog geen nieuwe ster');
}
let prestigeArmed = false;
$('prestigeBtn').addEventListener('click', () => {
  const claim = Math.floor(Math.cbrt(S.bonAll / 1e10)) - S.stars;
  if (claim < 1) return;
  const pb = $('prestigeBtn');
  if (!prestigeArmed) { prestigeArmed = true; pb.textContent = 'Zeker? Tik nog eens om te bevestigen'; setTimeout(() => { prestigeArmed = false; renderKroeg(); }, 4000); return; }
  prestigeArmed = false;
  S.stars += claim; S.bon = startBon(); S.bonLife = 0; S.bld = {}; S.upg = keptUpgrades();
  buffs.prod = buffs.click = buffs.luck = null;
  overlay(`<div class="big-t r14">⭐ Nieuwe kroeg!</div><div class="sub">+${claim} kroegster${claim > 1 ? 'ren' : ''}. Alles levert nu ${Math.round(S.stars * 5)}% meer bonnekes op.</div>`, '#ffd75e88');
  confetti(200, RARITIES[MYTHIC].pal);
  dirty = true; save(); renderKroeg(); schedulePush();
});

function renderSpel() {
  ensureQuests();
  renderSeasons();
  renderDog();
  setText($('pongBest'), String(S.pong.best));
  setText($('pongToday'), String(S.pong.day === todayKey() ? S.pong.today : 0));
  setText($('pongClears'), String(S.pong.clears));
  setText($('pongInfo'), `Beloning per beker: bonnekes en XP. Alle 10 raak geeft een bak bier.${pongFactor() < 1 ? ' Na 5 spelletjes per dag krijg je 20% van de beloning.' : ''}`);
  setText($('mgBest'), String(S.mg.best));
  setText($('mgToday'), String(S.mg.day === todayKey() ? S.mg.today : 0));
  setText($('mgPerf'), String(S.mg.perfects));
  setText($('mgInfo'), `Beloning: tot ${fmt(200 + staffIncome() * 300)} bonnekes en XP. 475 of meer geeft een bak bier.${mgRewardFactor() < 1 ? ' Na 5 spelletjes per dag krijg je 20% van de beloning.' : ''}`);
  const list = $('questList'); list.textContent = '';
  S.quests.list.forEach((q, i) => {
    const def = QUESTS[q.t];
    const el = document.createElement('div');
    el.className = 'quest' + (q.claimed ? ' claimed' : '');
    el.innerHTML = '<div class="ico"></div><div class="t"><div class="n"></div><div class="qbar"><div class="fill"></div></div><div class="m"></div></div><button class="small"></button>';
    el.querySelector('.ico').textContent = def.ico;
    el.querySelector('.n').textContent = def.text(q.goal);
    el.querySelector('.fill').style.width = Math.min(100, q.prog / q.goal * 100) + '%';
    el.querySelector('.m').textContent = `${fmt(q.prog)} / ${fmt(q.goal)} · beloning: bonnekes en XP`;
    const b = el.querySelector('button');
    b.textContent = q.claimed ? 'Opgehaald' : q.prog >= q.goal ? 'Ophalen' : 'Bezig';
    b.disabled = q.claimed || q.prog < q.goal;
    b.addEventListener('click', () => claimQuest(i));
    list.appendChild(el);
  });
  const allDone = S.quests.list.every(q => q.claimed);
  $('questBonus').classList.toggle('hidden', !allDone || S.quests.bonus);
  setText($('questLead'), S.quests.bonus ? 'Alles afgewerkt voor vandaag. Morgen wachten er nieuwe opdrachten.' : 'Elke dag drie nieuwe opdrachten. Werk ze alle drie af voor een bak bier.');
}

// Rebuilding a panel is costly on phones, so each one remembers what it last drew
// and the collection keeps references to its tiles to update them in place.
const lastDrawn = {};
const changed = (name, key) => { if (lastDrawn[name] === key) return false; lastDrawn[name] = key; return true; };
const beerTiles = {};
let tierHeads = [];

function tileHtml() { return '<div class="ico"></div><div class="t"><div class="n"></div><div class="m"></div></div>'; }
function buildBeerGrid() {
  const list = $('colList'); list.textContent = '';
  tierHeads = RARITIES.map((r, i) => {
    const h = document.createElement('h3');
    const lab = document.createElement('span'); lab.className = 'r' + i; lab.textContent = r.label;
    const odds = document.createElement('span'); odds.className = 'odds';
    h.append(lab, odds);
    list.appendChild(h);
    const g = document.createElement('div'); g.className = 'grid';
    BY_TIER[i].forEach(b => {
      const t = document.createElement('div');
      const sw = document.createElement('div'); sw.className = 'swatch';
      sw.style.background = `linear-gradient(${b.c[0]}, ${b.c[1]})`; sw.style.setProperty('--foam', b.foam);
      const tx = document.createElement('div'); tx.className = 't';
      const nm = document.createElement('div'); nm.className = 'n';
      const m = document.createElement('div'); m.className = 'm';
      tx.append(nm, m); t.append(sw, tx); g.appendChild(t);
      beerTiles[b.id] = { t, nm, m, n: -1 };
    });
    list.appendChild(g);
    return odds;
  });
}
function renderCollection() {
  const u = uniqueCount(S);
  $('colFill').style.width = (u / CORE.length * 100) + '%';
  const sz = BEERS.filter(b => b.season && S.counts[b.id] > 0).length;
  setText($('colLabel'), `${u} / ${CORE.length}` + (sz ? ` · +${sz} seizoen` : ''));

  const top = BEERS.filter(b => S.counts[b.id] > 0).sort((a, b) => b.r - a.r || (S.counts[b.id] - S.counts[a.id])).slice(0, 6);
  if (changed('vitrine', top.map(b => b.id + ':' + S.counts[b.id]).join())) {
    $('vitrine').innerHTML = top.length ? top.map(b => beerCardHtml(b, 0, S.counts[b.id])).join('') : '<div class="empty" style="width:100%">Nog leeg. Drink je eerste pintje!</div>';
  }

  if (changed('colRewards', `${u}|${S.colRewards.join()}`)) {
    const cr = $('colRewards'); cr.textContent = '';
    COL_MILESTONES.forEach(ms => {
      const done = S.colRewards.includes(ms.n);
      const el = document.createElement('div');
      el.className = 'tile' + (done ? ' done' : u >= ms.n ? '' : ' locked');
      el.innerHTML = tileHtml();
      el.querySelector('.ico').textContent = done ? '✅' : '🎁';
      el.querySelector('.n').textContent = `${ms.n} soorten`;
      el.querySelector('.m').textContent = `+2% bonnekes${ms.crate ? ` · ${CRATES[ms.crate].label}` : ''} · ${fmt(ms.n * 500)}+ 🎟️`;
      cr.appendChild(el);
    });
  }

  const setState = SETS.map(st => setHave(S, st));
  if (changed('sets', setState.join() + '|' + S.sets.join())) {
    const sl = $('setList'); sl.textContent = '';
    SETS.forEach((st, i) => {
      const have = setState[i], size = setSize(st), done = S.sets.includes(st.id);
      const el = document.createElement('div');
      el.className = 'tile' + (done ? ' done' : '');
      el.innerHTML = '<div class="ico"></div><div class="t"><div class="n"></div><div class="qbar"><div class="fill"></div></div><div class="m"></div></div>';
      el.querySelector('.ico').textContent = st.ico;
      el.querySelector('.n').textContent = st.name;
      el.querySelector('.fill').style.width = (have / size * 100) + '%';
      el.querySelector('.m').textContent = `${have}/${size} · ${done ? 'voltooid: ' : ''}+${Math.round(st.bonus * 100)}% bonnekes, ${CRATES[st.reward].label}`;
      sl.appendChild(el);
    });
  }

  if (!tierHeads.length) buildBeerGrid();
  const p = tierProbs();
  RARITIES.forEach((r, i) => setText(tierHeads[i], `${fmtPct(p[i] * 100)} kans · ${fmt(r.xp)} XP · ${fmt(r.pts)} punten`));
  BEERS.forEach(b => {
    const ref = beerTiles[b.id], n = S.counts[b.id] || 0;
    if (ref.n === n) return;
    ref.n = n;
    ref.t.className = 'tile' + (n ? '' : ' locked');
    ref.nm.textContent = n ? b.name : '???';
    ref.m.textContent = n ? `${fmtAbv(b.abv)} · ${fmt(n)}×${b.season ? ' · ' + SEASON[b.season].ico : ''}`
      : b.season ? `${SEASON[b.season].ico} enkel tijdens ${SEASON[b.season].name}` : 'nog niet gevonden';
  });

  if (changed('ach', S.ach.join())) {
    const al = $('achList'); al.textContent = '';
    setText($('achCount'), `${S.ach.length} / ${ACH.length}`);
    const got = new Set(S.ach);
    [...ACH].sort((a, b) => got.has(b.id) - got.has(a.id)).forEach(a => {
      const t = document.createElement('div'); t.className = 'tile' + (got.has(a.id) ? '' : ' locked');
      t.innerHTML = tileHtml();
      t.querySelector('.ico').textContent = got.has(a.id) ? a.ico : '🔒';
      t.querySelector('.n').textContent = a.name;
      t.querySelector('.m').textContent = `${a.desc} · ${a.crate ? '1 ' + CRATES[a.crate].label : a.bon ? fmt(a.bon) + ' 🎟️' : 'bonnekes'}`;
      al.appendChild(t);
    });
  }
}

const skinOk = sk => sk.ok(S) || S.seenSkins.includes(sk.id);
const bgOk = bg => bg.ok(S) || S.seenBgs.includes(bg.id);
const themeOk = th => th.ok(S) || S.seenThemes.includes(th.id);
function styleButton(on, ok, inner, name, unlock, onClick) {
  const b = document.createElement('button');
  b.className = 'skin' + (on ? ' on' : '');
  b.disabled = !ok;
  b.setAttribute('aria-pressed', on);
  b.innerHTML = inner + '<div class="n"></div><div class="m"></div>';
  b.querySelector('.n').textContent = name;
  b.querySelector('.m').textContent = ok ? (on ? 'In gebruik' : 'Vrijgespeeld') : '🔒 ' + unlock;
  b.addEventListener('click', onClick);
  return b;
}
function renderStyle() {
  if (!changed('style', [S.theme, S.skin, S.bg, S.seenSkins.length, S.seenBgs.length, S.seenThemes.length, THEMES.filter(themeOk).length, SKINS.filter(skinOk).length, BGS.filter(bgOk).length].join())) return;
  const tl = $('themeList'); tl.textContent = '';
  THEMES.forEach(th => {
    const v = th.v;
    tl.appendChild(styleButton(S.theme === th.id, themeOk(th),
      `<div class="th" style="background:${v['panel-solid']};border-color:${v.accent};color:${v.accent};border-radius:${th.rc}px;font-family:'${th.font}',${th.fb}">Aa</div>`,
      th.name, th.unlock, () => { S.theme = th.id; save(); applyTheme(); renderStyle(); }));
  });
  const list = $('skinList'); list.textContent = '';
  SKINS.forEach(sk => {
    const ok = skinOk(sk), sh = SHAPE[sk.shape];
    list.appendChild(styleButton(S.skin === sk.id, ok,
      `<svg viewBox="0 0 200 300" aria-hidden="true"><defs><clipPath id="pv-${sk.id}"><path d="${sh.d}"/></clipPath></defs>${sk.back || ''}` +
      `<rect clip-path="url(#pv-${sk.id})" x="0" y="${ok ? 40 : 300}" width="200" height="${sh.bottom - 34}" fill="#e8a52a"/>` +
      `<path d="${sh.d}" fill="none" stroke="${sk.stroke}" stroke-width="8"/>${sk.front || ''}</svg>`,
      sk.name, sk.unlock, () => { S.skin = sk.id; save(); applySkin(); renderStyle(); schedulePush(); }));
  });
  const bl = $('bgList'); bl.textContent = '';
  BGS.forEach(bg => {
    bl.appendChild(styleButton(S.bg === bg.id, bgOk(bg), `<div class="sw bg-${bg.id}"></div>`, bg.name, bg.unlock,
      () => { S.bg = bg.id; save(); applyBg(); renderStyle(); }));
  });
}
function applyBg() {
  [...document.body.classList].filter(c => c.startsWith('bg-')).forEach(c => document.body.classList.remove(c));
  document.body.classList.add('bg-' + (BGS.some(b => b.id === S.bg) ? S.bg : 'bruin'));
}
const loadedFonts = new Set(['Alfa Slab One']);
const fontHref = fams => 'https://fonts.googleapis.com/css2?' + fams.map(f => 'family=' + encodeURIComponent(f).replace(/%20/g, '+')).join('&') + '&display=swap';
function loadFonts(fams) {
  fams = fams.filter(f => !loadedFonts.has(f));
  if (!fams.length) return;
  fams.forEach(f => loadedFonts.add(f));
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = fontHref(fams);
  document.head.appendChild(l);
}
function applyTheme() {
  const th = THEME[S.theme] || THEMES[0], root = document.documentElement.style;
  Object.entries(th.v).forEach(([k, v]) => root.setProperty('--' + k, v));
  root.setProperty('--r-card', th.rc + 'px');
  root.setProperty('--r-btn', th.rb + 'px');
  root.setProperty('--dscale', th.dscale);
  root.setProperty('--display', `"${th.font}", ${th.fb}`);
  document.querySelector('meta[name=theme-color]').setAttribute('content', th.v['panel-solid']);
  loadFonts([th.font]);
}

$('ambToggle').checked = !S.noAmbient;
$('ambToggle').addEventListener('change', e => { S.noAmbient = !e.target.checked; amb = []; save(); });

// ---- wipe everything ----
let wipeArmed = 0;
$('wipeBtn').addEventListener('click', async () => {
  const b = $('wipeBtn');
  if (!wipeArmed || performance.now() - wipeArmed > 6000) {
    wipeArmed = performance.now();
    b.textContent = 'Echt alles wissen? Tik binnen 6 seconden nog eens';
    setTimeout(() => { if (performance.now() - wipeArmed >= 6000) { wipeArmed = 0; b.textContent = 'Alles wissen en opnieuw beginnen'; } }, 6100);
    return;
  }
  wiping = true;
  b.disabled = true; b.textContent = 'Bezig met wissen…';
  try { localStorage.setItem('pintje-wiped', '1'); localStorage.removeItem(SAVE_KEY); localStorage.removeItem('pintje'); } catch (e) {}
  if (db && uid && canWrite) { try { await db.doc('scores/' + uid).delete(); } catch (e) {} }
  location.reload();
  setTimeout(() => { b.textContent = 'Gewist. Herlaad de pagina om opnieuw te beginnen.'; }, 1500);
});

const reqMet = k => [k.req, k.req2].every(q => !q || rank(q[0]) >= q[1]);
function renderSkills() {
  if (!changed('skills', [JSON.stringify(S.skills), freePoints()].join('|'))) return;
  const free = freePoints();
  $('spCount').textContent = free;
  $('respec').disabled = spent() === 0;
  const tree = $('skillTree'); tree.textContent = '';
  [1, 2, 3, 4].forEach(t => {
    const h = document.createElement('h3');
    h.textContent = ['', 'Basis', 'Gevorderd', 'Expert', 'Meesterbrouwer'][t];
    tree.appendChild(h);
    const row = document.createElement('div'); row.className = 'tier';
    SKILLS.filter(k => k.tier === t).forEach(k => {
      const n = rank(k.id), open = reqMet(k);
      const c = document.createElement('div');
      c.className = 'skill' + (n >= k.max ? ' maxed' : '') + (open ? '' : ' locked');
      c.innerHTML = '<div class="top"><span></span><b></b></div><div class="m"></div><div class="pips"></div><div class="eff"></div><button class="small"></button>';
      c.querySelector('.top span').textContent = open ? k.ico : '🔒';
      c.querySelector('.top b').textContent = k.name;
      const reqTxt = [k.req, k.req2].filter(Boolean).map(q => `${SK[q[0]].name} ${q[1]}`).join(' + ');
      c.querySelector('.m').textContent = k.desc + (open ? '' : ` Vereist: ${reqTxt}.`);
      c.querySelector('.pips').innerHTML = Array.from({ length: k.max }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
      c.querySelector('.eff').textContent = n ? `Nu: ${k.eff(n)}` + (n < k.max ? ` · volgende: ${k.eff(n + 1)}` : '') : `Rang 1: ${k.eff(1)}`;
      const b = c.querySelector('button');
      b.textContent = n >= k.max ? 'Maximaal' : `Investeer (${n}/${k.max})`;
      b.disabled = n >= k.max || !open || free <= 0;
      b.addEventListener('click', () => {
        if (freePoints() <= 0 || rank(k.id) >= k.max || !reqMet(k)) return;
        S.skills[k.id] = rank(k.id) + 1; save(); dirty = true; renderSkills(); renderTapStats(); schedulePush();
        const t0 = now(); tone(660, t0, 0.15, 'triangle', 0.12); tone(990, t0 + 0.08, 0.2, 'triangle', 0.12);
      });
      row.appendChild(c);
    });
    tree.appendChild(row);
  });
}
let respecArmed = false;
$('respec').addEventListener('click', () => {
  const b = $('respec');
  if (!respecArmed) { respecArmed = true; b.textContent = 'Zeker?'; setTimeout(() => { respecArmed = false; b.textContent = 'Reset'; }, 3000); return; }
  respecArmed = false; b.textContent = 'Reset';
  S.skills = {}; save(); dirty = true; renderSkills(); renderTapStats(); schedulePush(); queueToast('Skillpunten teruggezet');
});

const activeTab = () => document.querySelector('nav button[aria-selected="true"]').dataset.tab;
function renderVisible() {
  const tab = activeTab();
  renderTapStats();
  if (tab === 'kroeg') renderKroeg();
  if (tab === 'spel') renderSpel();
  if (tab === 'skills') { renderHop(); renderSkills(); }
  if (tab === 'collectie') renderCollection();
  if (tab === 'stijl') renderStyle();
  if (tab === 'ranglijst') { renderBoard(); renderStats(); renderPeers(); }
}
document.querySelectorAll('nav button').forEach(btn => btn.addEventListener('click', () => {
  stop();
  document.querySelectorAll('nav button').forEach(b => b.setAttribute('aria-selected', b === btn));
  document.querySelectorAll('.panel').forEach(p => { p.hidden = p.id !== btn.dataset.tab; });
  if (btn.dataset.tab === 'stijl') loadFonts(THEMES.map(t => t.font));
  renderVisible();
}));

// ---- progress: achievements, sets, collection, levels, unlocks ----
function checkProgress() {
  ensureQuests();
  const fresh = ACH.filter(a => !S.ach.includes(a.id) && a.ok(S));
  fresh.forEach(a => {
    S.ach.push(a.id);
    if (a.crate) { addCrate(a.crate); queueToast(`🏅 ${a.name}! +1 ${CRATES[a.crate].label}`); }
    else { const bon = a.bon || achBon(); addBon(bon); queueToast(`🏅 ${a.name}! +${fmt(bon)} 🎟️`); }
  });
  SETS.forEach(st => {
    if (S.sets.includes(st.id) || setHave(S, st) < setSize(st)) return;
    S.sets.push(st.id); addCrate(st.reward);
    queueToast(`🧩 Biertype voltooid: ${st.name}! +${Math.round(st.bonus * 100)}% bonnekes · +1 ${CRATES[st.reward].label}`);
    fanfare(5);
  });
  const u = uniqueCount(S);
  COL_MILESTONES.forEach(ms => {
    if (u < ms.n || S.colRewards.includes(ms.n)) return;
    S.colRewards.push(ms.n);
    const bon = Math.max(ms.n * 500, staffIncome() * ms.n * 10);
    addBon(bon); if (ms.crate) addCrate(ms.crate);
    queueToast(`📖 ${ms.n} soorten verzameld! +2% bonnekes · +${fmt(bon)} 🎟️${ms.crate ? ` · +1 ${CRATES[ms.crate].label}` : ''}`);
    fanfare(4);
  });
  const lvl = levelInfo(S.xp).lvl;
  if (lvl > S.lastLevel) {
    let bon = 0;
    for (let L = S.lastLevel + 1; L <= lvl; L++) {
      bon += Math.max(50 * L, staffIncome() * 30);
      if (L % 50 === 0) addCrate('vat'); else if (L % 25 === 0) addCrate('krat'); else if (L % 10 === 0) addCrate('bak');
    }
    addBon(bon);
    queueToast(`⬆️ Level ${lvl}! +${lvl - S.lastLevel} skillpunt · +${fmt(bon)} 🎟️`);
    if (!overlayOpen) confetti(70);
    fanfare(3);
    S.lastLevel = lvl;
  }
  SKINS.forEach(sk => { if (!S.seenSkins.includes(sk.id) && sk.ok(S)) { S.seenSkins.push(sk.id); if (sk.id !== 'vaasje') queueToast(`🥂 Nieuw glas: ${sk.name}`); } });
  BGS.forEach(bg => { if (!S.seenBgs.includes(bg.id) && bg.ok(S)) { S.seenBgs.push(bg.id); if (bg.id !== 'bruin') queueToast(`🖼️ Nieuwe achtergrond: ${bg.name}`); } });
  THEMES.forEach(th => { if (!S.seenThemes.includes(th.id) && th.ok(S)) { S.seenThemes.push(th.id); if (th.id !== 'klassiek') queueToast(`🎨 Nieuw thema: ${th.name}`); } });
  if (fresh.length) dirty = true;
}

function nextNews() {
  const pool = NEWS.filter(n => !n.ok || n.ok(S));
  const el = $('ticker');
  el.style.opacity = 0;
  setTimeout(() => { $('tickerText').textContent = pick(pool).t; el.style.opacity = 1; }, 400);
}
setInterval(nextNews, 9000);
