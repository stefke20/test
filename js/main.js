// Pintje — main loop, leaderboard and boot.
'use strict';

// =====================================================================
// MAIN LOOP — staff income is pure arithmetic; only your own drinking animates
// =====================================================================
let ambFrame = false;
let lastFrame = performance.now(), uiAcc = 0, slowAcc = 0, saveAcc = 0, staffAcc = 0;
function frame(t) {
  let dt = (t - lastFrame) / 1000;
  lastFrame = t;
  if (!(dt > 0)) dt = 0;
  dt = Math.min(dt, 8 * 3600);
  const s = sps();
  if (s > 0) {
    addBon(s * dt * allBonMult());
    staffAcc += s * dt;
    if (staffAcc >= SIPS_PER_PINT) { const k = Math.floor(staffAcc / SIPS_PER_PINT); S.staffPints += k; staffAcc -= k * SIPS_PER_PINT; }
  }
  if (drinking && current && !puking()) {
    addSips(SIPS_PER_PINT / drinkSecs(current) * Math.min(dt, 0.1));
    gulpTimer -= dt;
    if (gulpTimer <= 0) { gulp(); gulpTimer = 0.45; navigator.vibrate?.(20); }
    if (drinking && level > 0) status.textContent = level < 0.25 ? 'Bijna leeg…' : DRINK_MSG[Math.floor((1 - level) * 3) % 3];
  }
  if (current && current.r >= RAINBOW && current.r !== MYTHIC && !$('tap').hidden) {
    const k = t / 1000;
    if (current.r === RAINBOW) { $('beerTop').setAttribute('stop-color', `hsl(${(k * 120) % 360} 90% 65%)`); $('beerBottom').setAttribute('stop-color', `hsl(${(k * 120 + 120) % 360} 90% 45%)`); }
    else if (current.r === COSMIC) { $('beerTop').setAttribute('stop-color', `hsl(${200 + Math.sin(k) * 50} 85% 60%)`); $('beerBottom').setAttribute('stop-color', `hsl(${270 + Math.cos(k) * 30} 80% 20%)`); }
    else if (current.r === DIVINE) { $('beerTop').setAttribute('stop-color', `hsl(48 100% ${88 + Math.sin(k * 3) * 8}%)`); }
  }
  if (capEl === null && t > nextCapAt && !mgOpen) { spawnCap(); nextCapAt = t + capInterval(); }
  maybeEvent(t);
  tickChallenge(t);
  if (!bubbleEl && t > nextBubbleAt && !$('tap').hidden && !mgOpen && !overlayOpen && level > 0) { spawnBubble2(); nextBubbleAt = t + (15 + Math.random() * 20) * 1000; }
  if (dt < 5) S.playSecs += dt;
  if (!$('tap').hidden) updateBubbles(t, dt);
  // background effects: full rate while a golden-cap effect runs, 30 fps for the seasonal ambience
  if (fx || fxWasOn) { drawFx(t); fxWasOn = !!fx; }
  else if ((ambKind() || amb.length) && (ambFrame = !ambFrame)) drawFx(t);
  uiAcc += dt; slowAcc += dt; saveAcc += dt;
  if (uiAcc > 0.25) { uiAcc = 0; renderWallet(); renderCombo(); if (activeTab() === 'kroeg') renderKroeg(); if (activeTab() === 'spel') renderDog(); }
  if (slowAcc > 1) {
    // slowly sober up: one pint less on the meter every 15 minutes
    if (S.zat > 0 && Date.now() - S.zatAt > 15 * 60000) { S.zat--; S.zatAt = Date.now(); dirty = true; }
    { const before = activeSeasons.join(); refreshTimeBuffs(); if (activeSeasons.join() !== before) seasonWelcome(); } sendPresence();
  }
  if (slowAcc > 1) { slowAcc = 0; checkProgress(); if (dirty) { dirty = false; renderVisible(); schedulePush(); } }
  if (saveAcc > 5) { saveAcc = 0; save(); }
  requestAnimationFrame(frame);
}
addEventListener('pagehide', save);
addEventListener('resize', () => { if (fx) { fxCv.width = innerWidth; fxCv.height = innerHeight; } });
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

// =====================================================================
// LEADERBOARD (shared db)
// =====================================================================
let db = null, user = null, uid = null, boardDocs = null, boardState = 'loading', canWrite = true;
function summary() {
  return {
    points: points(S), total: S.total, unique: uniqueCount(S), best: bestRarity(S),
    counts: S.counts, ach: S.ach, skin: S.skin, xp: S.xp, level: levelInfo(S.xp).lvl, skills: S.skills,
    bonAll: S.bonAll, stars: S.stars, mgBest: S.mg.best, sets: S.sets.length, prestiges: S.prestiges, hopTotal: S.hopTotal, v: 3, updatedAt: Date.now(),
  };
}
let writing = false, writePending = false, pushTimer = null;
function schedulePush() { if (!pushTimer) pushTimer = setTimeout(() => { pushTimer = null; pushScore(); }, 10000); }
async function pushScore() {
  if (!db || !uid || !canWrite || wiping) return;
  writePending = true;
  if (writing) return;
  writing = true;
  while (writePending) {
    writePending = false;
    try { await db.doc('scores/' + uid).set(summary()); }
    catch (e) {
      if (e && (e.code === 'invalid_argument' || e.code === 'not_granted' || e.code === 'revoked')) { canWrite = false; renderBoard(); }
      else if (e && e.code === 'unavailable') { await new Promise(r => setTimeout(r, 800 + Math.random() * 800)); writePending = true; }
      break;
    }
  }
  writing = false;
}
function renderStats() {
  const h = Math.floor(S.playSecs / 3600), m = Math.floor(S.playSecs % 3600 / 60);
  const rows = [
    ['🍺', 'Zelf gedronken', fmt(S.total)], ['🏪', 'Door personeel', fmt(S.staffPints)], ['👆', 'Tikken op je glas', fmt(S.taps)],
    ['📖', 'Soorten gevonden', `${uniqueCount(S)}/${CORE.length}`], ['🎟️', 'Bonnekes ooit verdiend', fmt(S.bonAll)], ['⭐', 'Kroegsterren', fmt(S.stars)],
    ['🧢', 'Gouden doppen', fmt(S.caps)], ['🎲', 'Voorvallen', fmt(S.events)], ['🧠', 'Quizvragen juist', fmt(S.quizRight)],
    ['🚓', 'Dieven gevangen', fmt(S.thieves)], ['📦', 'Bakken geopend', fmt(S.opened)], ['🤮', 'Keer gebrokt', fmt(S.pukes)],
    ['🎯', 'Beste tapwedstrijd', `${S.mg.best} / 500`], ['🏓', 'Beste bierpong', `${S.pong.best} / 10`], ['🐶', 'Bobbie', `level ${S.dog.lvl}`], ['🥂', 'Schol! geroepen', fmt(S.schols)], ['🔥', 'Hoogste combo', fmt(S.bestCombo)], ['🌿', 'Brouwmeester-rang', fmt(S.prestiges)], ['🍃', 'Hopbellen ooit', fmt(S.hopTotal)], ['⏱️', 'Uitdagingen gehaald', fmt(S.challenges)], ['📅', 'Dagen op rij', fmt(S.streak)], ['⏱️', 'Speeltijd', `${h} u ${m} min`],
  ];
  const el = $('statList'); el.textContent = '';
  rows.forEach(([ico, label, val]) => {
    const t = document.createElement('div'); t.className = 'tile stattile';
    t.innerHTML = '<div class="ico"></div><div class="t"><b></b><div class="m"></div></div>';
    t.querySelector('.ico').textContent = ico; t.querySelector('b').textContent = val; t.querySelector('.m').textContent = label;
    el.appendChild(t);
  });
}
let boardSeq = 0;
async function renderBoard() {
  const el = $('board'), seq = ++boardSeq;
  if (boardState === 'off') { el.innerHTML = '<div class="empty">De ranglijst werkt als je Pintje opent via de gedeelde link op claude.ai, ingelogd. Je eigen voortgang blijft hier gewoon bewaard.</div>'; return; }
  if (!boardDocs) { el.innerHTML = '<div class="empty">De ranglijst wordt geladen…</div>'; return; }
  const rows = boardDocs.filter(d => d.exists).map(d => ({ id: d.id, ...d.data() }));
  if (!rows.length) { el.innerHTML = '<div class="empty">Nog niemand op de ranglijst. Drink een pintje en sta als eerste bovenaan!</div>'; return; }
  const ps = user ? await user.profiles(rows.map(r => r.id)) : {};
  if (seq !== boardSeq) return;
  el.textContent = '';
  rows.forEach((r, i) => {
    const p = ps[r.id] || {}, isMe = r.id === uid;
    const row = document.createElement('div'); row.className = 'lrow' + (isMe ? ' me' : '');
    const rk = document.createElement('div'); rk.className = 'rank'; rk.textContent = ['🥇', '🥈', '🥉'][i] || (i + 1);
    const img = document.createElement('img'); img.alt = ''; if (p.avatarUrl) img.src = p.avatarUrl;
    const who = document.createElement('div'); who.className = 'who';
    const nm = document.createElement('div'); nm.className = 'nm';
    nm.textContent = (p.name || (isMe ? 'Jij' : 'Anonieme drinker')) + (isMe ? ' (jij)' : '');
    const sub = document.createElement('div'); sub.className = 'sub';
    sub.textContent = `${r.prestiges ? `🌿${r.prestiges} · ` : ''}Lvl ${r.level || 1} · ${fmt(r.total || 0)} pintjes · ${r.unique || 0}/${BEERS.length}` + (r.stars ? ` · ${r.stars}⭐` : '') + (r.mgBest ? ` · 🎯${r.mgBest}` : '');
    const best = r.v === 3 && Number.isInteger(r.best) && RARITIES[r.best] ? r.best : -1;
    if (best >= 0) { const c = document.createElement('span'); c.className = 'chip r' + best; c.style.marginLeft = '6px'; c.textContent = RARITIES[best].label; sub.appendChild(c); }
    who.append(nm, sub);
    const pts = document.createElement('div'); pts.className = 'pts'; pts.textContent = fmt(r.points || 0);
    row.append(rk, img, who, pts);
    el.appendChild(row);
  });
  if (!canWrite) {
    const n = document.createElement('div'); n.className = 'empty';
    n.textContent = 'Je kan meekijken, maar je eigen score komt niet op de ranglijst: vraag de eigenaar om je als Contributor toe te voegen.';
    el.appendChild(n);
  }
}
async function initShared() {
  if (!window.claude || typeof window.claude.use !== 'function') { boardState = 'off'; renderBoard(); return; }
  try {
    [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    uid = user ? await user.id() : null;
  } catch (e) { db = null; }
  if (!db) { boardState = 'off'; renderBoard(); return; }
  boardState = 'on';
  if (user && typeof user.can === 'function') { try { if (await user.can('data.write') === false) canWrite = false; } catch (e) {} }
  db.collection('scores').orderBy('points', 'desc').limit(50).onSnapshot(
    snap => { boardDocs = snap.docs; if (activeTab() === 'ranglijst') renderBoard(); },
    () => { boardState = 'off'; renderBoard(); }
  );
  if (!uid) { canWrite = false; return; }
  if (wipedBefore) {
    // after "Alles wissen": never pull old progress back in; overwrite the remote copy instead
    try { localStorage.removeItem('pintje-wiped'); } catch (e) {}
    if (S.total > 0) pushScore(); else { try { await db.doc('scores/' + uid).delete(); } catch (e) {} }
    return;
  }
  // Bring progress from another device: keep the highest of each. Older versions' XP is not trusted.
  try {
    const mine = await db.doc('scores/' + uid).get();
    if (mine.exists && (mine.data().prestiges || 0) > S.prestiges) {
      // another device is further along in prestige: take its tree and counters, never the old run
      const r = mine.data();
      S.prestiges = r.prestiges; S.hopTotal = Math.max(S.hopTotal, r.hopTotal || 0);
      save(); dirty = true;
    } else if (mine.exists && (mine.data().prestiges || 0) < S.prestiges) {
      pushScore();   // this device reset: overwrite the old run on the leaderboard
    } else if (mine.exists) {
      const r = mine.data();
      let changed = false;
      for (const [id, n] of Object.entries(r.counts || {})) if (BEER[id] && n > (S.counts[id] || 0)) { S.counts[id] = n; changed = true; }
      const sum = Object.values(S.counts).reduce((a, b) => a + b, 0);
      if (Math.max(S.total, r.total || 0, sum) !== S.total) { S.total = Math.max(S.total, r.total || 0, sum); changed = true; }
      (r.ach || []).forEach(a => { if (!S.ach.includes(a) && ACH.some(x => x.id === a)) { S.ach.push(a); changed = true; } });
      if (r.v === 3) {
        if ((r.xp || 0) > S.xp) { S.xp = r.xp; S.lastLevel = Math.max(S.lastLevel, levelInfo(r.xp).lvl); changed = true; }
        const rs = r.skills || {};
        if (Object.values(rs).reduce((a, b) => a + b, 0) > spent()) { S.skills = { ...rs }; changed = true; }
      }
      if ((r.stars || 0) > S.stars) { S.stars = r.stars; changed = true; }
      if ((r.bonAll || 0) > S.bonAll) { S.bonAll = r.bonAll; changed = true; }
      if ((r.mgBest || 0) > S.mg.best) { S.mg.best = r.mgBest; changed = true; }
      if (changed) { save(); dirty = true; }
      pushScore();
    } else if (S.total > 0) pushScore();
  } catch (e) {}
}

// =====================================================================
// BOOT
// =====================================================================
function dailyReward() {
  const today = todayKey();
  if (S.lastDaily === today) return null;
  const y = new Date(); y.setDate(y.getDate() - 1);
  S.streak = S.lastDaily === dayKey(y) ? S.streak + 1 : 1;
  S.lastDaily = today;
  const crates = [];
  if (S.streak % 30 === 0) crates.push('vat');
  else if (S.streak % 7 === 0) crates.push('krat');
  else if (S.streak % 3 === 0) crates.push('bak');
  if (has('kelder')) crates.push('bak');
  for (let i = 0; i < hrank('h_crate'); i++) crates.push('bak');
  if (has('kelder2')) crates.push('krat');
  crates.forEach(c => addCrate(c));
  const bon = Math.round((100 + staffIncome() * 300) * Math.min(S.streak, 7));
  addBon(bon);
  return { bon, crates };
}

applyTheme(); applyBg();
current = rollBeer();
const away = S.lastSeen ? Math.min((Date.now() - S.lastSeen) / 1000, (hrank('h_off') ? 24 : 8) * 3600) : 0;
if (away > 60 && baseSps() > 0) {
  const rate = hrank('h_off') ? 1 : 0.5 + rank('nacht') * 0.1, sips = baseSps() * away * rate, bon = sips * allBonMult();
  addBon(bon);
  const pints = Math.floor(sips / SIPS_PER_PINT); S.staffPints += pints;
  const h = Math.floor(away / 3600), m = Math.round((away % 3600) / 60);
  setTimeout(() => overlay(`<div class="big-t">Welkom terug!</div><div class="sub">Terwijl je ${h ? `${h} u ` : ''}${m} min weg was, dronk je personeel ${fmt(pints)} pintjes (aan ${Math.round(rate * 100)}% tempo) en verdiende ${fmt(bon)} bonnekes.</div>`), 300);
}
ensureQuests();
const daily = dailyReward();
if (daily && S.streak > 1)
if (daily) setTimeout(() => queueToast(`📅 Dagelijks rondje, dag ${S.streak}! +${fmt(daily.bon)} 🎟️${daily.crates.length ? ` · +${daily.crates.map(c => CRATES[c].label).join(', ')}` : ''}`), away > 60 ? 1500 : 600);

applySkin(); applyBeer();
status.textContent = current.r >= 2 ? POUR_MSG[current.r] : (S.total ? 'Hou ingedrukt of tik op het glas' : 'Welkom! Tik op het glas of hou de knop ingedrukt.');
seasonWelcome();
checkProgress(); save();
renderWallet(); renderTapStats(); renderKroeg();
requestAnimationFrame(t => { lastFrame = t; requestAnimationFrame(frame); });
initShared();
initRoom();
if (location.protocol === 'file:' && location.hash === '#debug') window.pintjeDebug = { event: id => EVENT_RUN[id](), state: () => S, setXp: x => { S.xp = x; dirty = true; }, season: ids => { activeSeasons = ids; seasonWelcome(); dirty = true; }, puke, pong: pongPlay, challenge: () => { nextChAt = 0; }, bubble: () => { nextBubbleAt = 0; } };
