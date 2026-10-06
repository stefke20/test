// Pintje — prestige, café dog, Bierpong, live café, Tapwedstrijd and daily quests.
'use strict';

// =====================================================================
// BROUWMEESTER: full reset for hopbellen and the brewery tree
// =====================================================================
const startBon = () => hrank('h_start') ? 1000 * Math.pow(10, hrank('h_start')) : 0;
const keptUpgrades = () => {
  const keep = [];
  if (hrank('h_auto') >= 1) keep.push('zelftap', 'klik1', 'klik2');
  if (hrank('h_auto') >= 2) keep.push('bon1', 'bon2', 'bon3', 'bon4', 'bon5', 'bon6', 'bon7', 'pint1', 'pint2', 'pint3');
  return S.upg.filter(id => keep.includes(id));
};
// hopbellen scale with every part of a run: level, collection, kroegsterren and total bonnekes
function hopBreakdown() {
  const lvl = levelInfo(S.xp).lvl, u = uniqueCount(S) + BEERS.filter(b => b.season && S.counts[b.id] > 0).length;
  const parts = {
    level: Math.floor(Math.pow(lvl, 1.5) / 15),
    collectie: Math.floor(Math.pow(u, 1.3) / 10),
    sterren: S.stars * 2,
    bonnekes: Math.floor(Math.pow(Math.max(0, Math.log10(Math.max(1, S.bonAll)) - 6), 2)),
    biertypes: S.sets.length * 3,
  };
  const raw = Object.values(parts).reduce((a, b) => a + b, 0);
  return { parts, total: Math.floor(raw * (1 + hrank('h_hop') * 0.25)), lvl };
}
const hopCost = h => Math.round(h.base * Math.pow(h.grow, hrank(h.id)));
const hopReq = h => !h.req || hrank(h.req[0]) >= h.req[1];
function renderHop() {
  const hb = hopBreakdown();
  setText($('hopHave'), fmt(S.hop));
  setText($('hopGain'), hb.lvl >= HOP_MIN_LEVEL ? fmt(hb.total) : '–');
  setText($('hopRank'), fmt(S.prestiges));
  setText($('hopBreak'), hb.lvl >= HOP_MIN_LEVEL
    ? `Opbouw: level ${hb.parts.level} + collectie ${hb.parts.collectie} + kroegsterren ${hb.parts.sterren} + bonnekes ${hb.parts.bonnekes} + biertypes ${hb.parts.biertypes}${hrank('h_hop') ? ` · +${hrank('h_hop') * 25}%` : ''}.`
    : `Beschikbaar vanaf level ${HOP_MIN_LEVEL} (je bent level ${hb.lvl}).`);
  const btn = $('hopBtn');
  const can = hb.lvl >= HOP_MIN_LEVEL && hb.total > 0;
  if (btn.disabled !== !can) btn.disabled = !can;
  if (!hopArmed) setText(btn, can ? `🌿 Nieuwe brouwerij beginnen (+${fmt(hb.total)} hopbellen)` : 'Nieuwe brouwerij beginnen');
  if (!changed('hop', [S.hop, JSON.stringify(S.hopTree)].join('|'))) return;
  const tree = $('hopTree'); tree.textContent = '';
  [1, 2, 3, 4].forEach(t => {
    const h3 = document.createElement('h3'); h3.textContent = ['', 'Brouwerijboom · wortels', 'Brouwerijboom · stam', 'Brouwerijboom · kruin', 'Brouwerijboom · top'][t];
    tree.appendChild(h3);
    const row = document.createElement('div'); row.className = 'tier';
    HOP.filter(h => h.tier === t).forEach(h => {
      const n = hrank(h.id), open = hopReq(h), cost = hopCost(h);
      const c = document.createElement('div');
      c.className = 'skill hop' + (n >= h.max ? ' maxed' : '') + (open ? '' : ' locked');
      c.innerHTML = '<div class="top"><span></span><b></b></div><div class="m"></div><div class="pips"></div><div class="eff"></div><button class="small"></button>';
      c.querySelector('.top span').textContent = open ? h.ico : '🔒';
      c.querySelector('.top b').textContent = h.name;
      c.querySelector('.m').textContent = h.desc + (open ? '' : ` Vereist: ${HOPK[h.req[0]].name} ${h.req[1]}.`);
      c.querySelector('.pips').innerHTML = Array.from({ length: h.max }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
      c.querySelector('.eff').textContent = n ? `Nu: ${h.eff(n)}` + (n < h.max ? ` · volgende: ${h.eff(n + 1)}` : '') : `Rang 1: ${h.eff(1)}`;
      const b = c.querySelector('button');
      b.textContent = n >= h.max ? 'Maximaal' : `🌿 ${fmt(cost)}`;
      b.disabled = n >= h.max || !open || S.hop < cost;
      b.addEventListener('click', () => {
        const k = hopCost(h);
        if (hrank(h.id) >= h.max || !hopReq(h) || S.hop < k) return;
        S.hop -= k; S.hopTree[h.id] = hrank(h.id) + 1;
        wake(); fanfare(4); queueToast(`🌿 ${h.name} rang ${S.hopTree[h.id]}!`);
        save(); dirty = true; renderHop(); renderTapStats(); schedulePush();
      });
      row.appendChild(c);
    });
    tree.appendChild(row);
  });
}
let hopArmed = 0;
$('hopBtn').addEventListener('click', () => {
  const hb = hopBreakdown();
  if (hb.lvl < HOP_MIN_LEVEL || hb.total <= 0) return;
  const btn = $('hopBtn');
  if (!hopArmed || performance.now() - hopArmed > 6000) {
    hopArmed = performance.now();
    btn.textContent = `Zeker? Alles behalve je stijl en de brouwerijboom gaat weg. Tik nog eens.`;
    setTimeout(() => { if (performance.now() - hopArmed >= 6000) { hopArmed = 0; renderHop(); } }, 6100);
    return;
  }
  hopArmed = 0;
  doPrestige(hb.total);
});
function doPrestige(gain) {
  const fresh = blank();
  const keep = {
    // cosmetics, history and the prestige tree survive
    skin: S.skin, bg: S.bg, theme: S.theme, seenSkins: S.seenSkins, seenBgs: S.seenBgs, seenThemes: S.seenThemes,
    ach: S.ach, flags: S.flags, taps: S.taps, caps: S.caps, pukes: S.pukes, events: S.events, quizRight: S.quizRight, thieves: S.thieves,
    playSecs: S.playSecs, schols: S.schols, bestCombo: S.bestCombo, challenges: S.challenges, bobs: S.bobs, opened: S.opened,
    questsDone: S.questsDone, questDays: S.questDays, mg: S.mg, pong: S.pong, streak: S.streak, lastDaily: S.lastDaily,
    seasonsPlayed: S.seasonsPlayed, seasonSeen: S.seasonSeen, seasonGifts: S.seasonGifts, noAmbient: S.noAmbient, staffPints: S.staffPints,
    hop: S.hop + gain, hopTotal: S.hopTotal + gain, hopTree: S.hopTree, prestiges: S.prestiges + 1,
    upg: keptUpgrades(), bonAll: 0,
  };
  if (hrank('h_dog')) keep.dog = S.dog;
  if (hrank('h_set')) { keep.sets = S.sets; keep.colRewards = S.colRewards; }
  S = Object.assign(fresh, keep);
  S.bon = startBon(); S.bonLife = 0;
  S.lastLevel = 1; S.lastSeen = Date.now();
  buffs.prod = buffs.click = buffs.luck = null;
  liCache = { xp: -1, v: null };
  level = 1; current = rollBeer(); applyBeer(); applySkin();
  drinkBtn.classList.remove('hidden'); refillBtn.classList.add('hidden');
  ensureQuests(); save(); dirty = true;
  renderVisible(); renderKroeg(); renderWallet();
  overlay(`<div class="ev-ico">🌿</div><div class="big-t" style="color:#b8f08a">Brouwmeester ${S.prestiges}!</div><div class="sub">Je nieuwe brouwerij staat klaar. +${fmt(gain)} hopbellen (je hebt er nu ${fmt(S.hop)}). Spendeer ze in de brouwerijboom op de Skills-tab.</div>`, '#7fbf4a88');
  confetti(240, ['#7fbf4a', '#b8f08a', '#f7c548', '#ffffff']); fanfare(6);
  pushScore();
}

// =====================================================================
// CAFÉHOND BOBBIE
// =====================================================================
const DOG_MAX = 20, PET_COOLDOWN = 20 * 60000;
const dogFace = () => ['🐶', '🐕', '🦮', '🐕‍🦺', '👑'][Math.min(4, Math.floor(S.dog.lvl / 5))] + (S.dog.lvl >= DOG_MAX ? '🐕' : '');
const dogFeedCost = () => Math.round(500 * Math.pow(3, S.dog.lvl));
function renderDog() {
  const d = S.dog, left = d.lastPet + PET_COOLDOWN - Date.now();
  setText($('dogFace'), dogFace());
  setText($('dogLvl'), `lvl ${d.lvl}`);
  setText($('dogInfo'), `Elk level geeft +2% bonnekes (nu +${d.lvl * 2}%).${d.lvl >= 3 ? ' Brengt soms cadeautjes mee.' : ' Vanaf level 3 brengt hij cadeautjes mee.'}${d.lvl >= 5 ? ' Bijt dieven.' : ' Vanaf level 5 bijt hij dieven.'}`);
  const pet = $('dogPet');
  pet.disabled = left > 0;
  setText(pet, left > 0 ? `Aaien (over ${Math.ceil(left / 60000)} min)` : '🤚 Aaien');
  const feed = $('dogFeed');
  feed.disabled = d.lvl >= DOG_MAX || S.bon < dogFeedCost();
  setText(feed, d.lvl >= DOG_MAX ? 'Bobbie is volgroeid' : `🦴 Voederen (🎟️ ${fmt(dogFeedCost())})`);
}
function wagDog() { bump($('dogFace'), [{ transform: 'rotate(-12deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(12deg)' }, { transform: 'none' }], 700); }
$('dogPet').addEventListener('click', () => {
  if (Date.now() - S.dog.lastPet < PET_COOLDOWN) return;
  S.dog.lastPet = Date.now(); S.dog.pets++;
  const bon = income60(120), xp = Math.round(xpToNext(levelInfo(S.xp).lvl) * 0.05 * xpMult());
  addBon(bon); S.xp += xp;
  questProg('pet', 1);
  queueToast(`🐶 Bobbie kwispelt! +${fmt(bon)} 🎟️ · +${fmt(xp)} XP`);
  wake(); tone(900, now(), 0.08, 'square', 0.06); tone(1100, now() + 0.1, 0.08, 'square', 0.06);
  wagDog(); save(); dirty = true; renderDog();
});
$('dogFeed').addEventListener('click', () => {
  const cost = dogFeedCost();
  if (S.dog.lvl >= DOG_MAX || S.bon < cost) return;
  S.bon -= cost; S.dog.lvl++;
  queueToast(`🦴 Bobbie is nu level ${S.dog.lvl}: +${S.dog.lvl * 2}% bonnekes`);
  wake(); ching(); wagDog(); save(); dirty = true; renderDog();
});

// =====================================================================
// MINIGAME: BIERPONG
// =====================================================================
const pongFactor = () => (S.pong.day === todayKey() && S.pong.today >= 5 ? 0.2 : 1) * (1 + rank('vasthand') * 0.2);
function pongPlay() {
  if (mgOpen) return;
  stop(); wake();
  mgOpen = true;
  const CUPS = [];
  [[4, 70], [3, 102], [2, 134], [1, 166]].forEach(([n, y]) => { for (let i = 0; i < n; i++) CUPS.push({ x: 150 + (i - (n - 1) / 2) * 34, y, hit: false }); });
  const o = document.createElement('div');
  o.className = 'mg';
  o.innerHTML = `<div class="top"><b>🏓 Bierpong</b><span id="pgBalls">🔴 × 10</span><span id="pgScore">0 / 10</span></div>
    <div class="field"><svg viewBox="0 0 300 420" aria-hidden="true">
      <defs><linearGradient id="tbl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a5a3a"/><stop offset="1" stop-color="#173322"/></linearGradient></defs>
      <path d="M60 20 L240 20 L290 410 L10 410 Z" fill="url(#tbl)" stroke="#e8e0c8" stroke-width="3"/>
      <line x1="150" y1="20" x2="150" y2="410" stroke="#e8e0c8" stroke-width="1.5" opacity="0.4"/>
      <g id="pgCups">${CUPS.map((c, i) => `<g id="cup${i}"><circle cx="${c.x}" cy="${c.y}" r="15" fill="#d0283f" stroke="#fff" stroke-width="2"/><circle cx="${c.x}" cy="${c.y}" r="10" fill="#f6c445"/></g>`).join('')}</g>
      <line id="pgAimX" x1="150" x2="150" y1="20" y2="400" stroke="#fff35c" stroke-width="2" stroke-dasharray="6 6"/>
      <line id="pgAimY" x1="20" x2="280" y1="120" y2="120" stroke="#5fc8ff" stroke-width="2" stroke-dasharray="6 6" opacity="0"/>
      <circle id="pgBall" cx="150" cy="380" r="8" fill="#fffaf0" stroke="#c9b48f"/>
    </svg></div>
    <div class="msg" id="pgMsg">Tik om te mikken<small>Eerst links-rechts, dan de afstand.</small></div>
    <div class="actions"><button class="big" id="pgTap" style="background:var(--accent);color:var(--on-accent)">🎯 Mik</button><button class="big outline" id="pgQuit">Stoppen</button></div>`;
  document.body.appendChild(o);
  const q = id => o.querySelector('#' + id);
  let balls = 10, hits = 0, phase = 'aimx', ax = 150, ay = 120, t0 = performance.now(), raf = 0, fly = null;
  const speed = () => 1.6 + (10 - balls) * 0.12;
  function loop(t) {
    const k = (t - t0) / 1000;
    if (phase === 'aimx') { ax = 150 + Math.sin(k * speed()) * 80; q('pgAimX').setAttribute('x1', ax); q('pgAimX').setAttribute('x2', ax); }
    if (phase === 'aimy') { ay = 118 + Math.sin(k * speed() * 1.15) * 62; q('pgAimY').setAttribute('y1', ay); q('pgAimY').setAttribute('y2', ay); }
    if (phase === 'fly' && fly) {
      const p = Math.min(1, (t - fly.start) / 650);
      const x = 150 + (ax - 150) * p, y = 380 + (ay - 380) * p - Math.sin(p * Math.PI) * 120;
      q('pgBall').setAttribute('cx', x); q('pgBall').setAttribute('cy', y); q('pgBall').setAttribute('r', 8 - Math.sin(p * Math.PI) * -4);
      if (p >= 1) { fly = null; land(); }
    }
    raf = requestAnimationFrame(loop);
  }
  function land() {
    const cup = CUPS.find(c => !c.hit && Math.hypot(c.x - ax, c.y - ay) < 14);
    if (cup) {
      cup.hit = true; hits++;
      const g = q('cup' + CUPS.indexOf(cup)); g.style.transition = 'opacity 0.4s'; g.style.opacity = 0.12;
      q('pgMsg').innerHTML = `PLONS! 🎯<small>${hits === 10 ? 'Alle bekers!' : 'Raak!'}</small>`;
      tone(500, now(), 0.06, 'sine', 0.15); tone(250, now() + 0.05, 0.2, 'triangle', 0.12);
      navigator.vibrate?.(40);
    } else {
      q('pgMsg').innerHTML = `Mis!<small>${Math.hypot(150 - ax, 0) > 100 ? 'Te ver naast.' : 'Net ernaast.'}</small>`;
      tone(160, now(), 0.15, 'sine', 0.1);
    }
    q('pgScore').textContent = `${hits} / 10`;
    q('pgBalls').textContent = `🔴 × ${balls}`;
    if (balls <= 0 || hits === 10) return setTimeout(finish, 900);
    setTimeout(() => {
      if (!mgOpen) return;
      q('pgBall').setAttribute('cx', 150); q('pgBall').setAttribute('cy', 380); q('pgBall').setAttribute('r', 8);
      q('pgAimY').setAttribute('opacity', 0); q('pgAimX').setAttribute('opacity', 1);
      phase = 'aimx'; t0 = performance.now(); q('pgTap').textContent = '🎯 Mik'; q('pgTap').disabled = false;
      q('pgMsg').innerHTML = 'Tik om te mikken<small>Eerst links-rechts, dan de afstand.</small>';
    }, 800);
  }
  function tap() {
    if (phase === 'aimx') { phase = 'aimy'; t0 = performance.now(); q('pgAimY').setAttribute('opacity', 1); q('pgTap').textContent = '🎯 Gooi'; q('pgMsg').innerHTML = 'Nu de afstand<small>Tik als de blauwe lijn op een beker staat.</small>'; }
    else if (phase === 'aimy') { phase = 'fly'; balls--; fly = { start: performance.now() }; q('pgTap').disabled = true; tone(700, now(), 0.05, 'triangle', 0.08); }
    else if (phase === 'done') { close(); pongPlay(); }
  }
  function finish() {
    phase = 'done';
    const f = pongFactor();
    const bon = Math.round((200 + staffIncome() * 300) * hits / 10 * f);
    const xp = Math.round(xpToNext(levelInfo(S.xp).lvl) * 0.12 * hits / 10 * f * xpMult());
    addBon(bon); S.xp += xp;
    if (S.pong.day !== todayKey()) { S.pong.day = todayKey(); S.pong.today = 0; }
    S.pong.today++; S.pong.plays++;
    const best = hits > S.pong.best; if (best) S.pong.best = hits;
    let extra = '';
    if (hits === 10) { S.pong.clears++; addCrate('bak'); extra = ' · +1 bak'; confetti(140); fanfare(5); } else fanfare(hits >= 6 ? 3 : 2);
    questProg('pong', 1);
    q('pgMsg').innerHTML = `${best ? '🏆 Nieuw record! ' : ''}${hits} van de 10 bekers<small>+${fmt(bon)} 🎟️ · +${fmt(xp)} XP${extra}${f < 1 ? ' (verminderde beloning na 5 spelletjes vandaag)' : ''}</small>`;
    q('pgTap').textContent = 'Nog eens'; q('pgTap').disabled = false;
    save(); dirty = true;
  }
  q('pgTap').addEventListener('click', tap);
  const kd = e => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); if (!q('pgTap').disabled) tap(); } };
  document.addEventListener('keydown', kd);
  function close() { cancelAnimationFrame(raf); document.removeEventListener('keydown', kd); o.remove(); mgOpen = false; renderVisible(); }
  q('pgQuit').addEventListener('click', close);
  raf = requestAnimationFrame(loop);
}
$('pongPlay').addEventListener('click', pongPlay);

// =====================================================================
// LIVE CAFÉ (room): who's here, Schol!, rare finds
// =====================================================================
let room = null, lastPresence = '', scholReadyAt = 0;
const lastScholFrom = {};
const others = () => room ? room.peers().filter(p => p.kind === 'viewer' && !p.isMe) : [];
async function nameOf(by) {
  if (!by || !user) return 'Een drinker';
  try { const ps = await user.profiles([by]); return (ps[by] && ps[by].name) || 'Een drinker'; } catch (e) { return 'Een drinker'; }
}
function sendPresence() {
  if (!room || !current) return;
  const p = { lvl: levelInfo(S.xp).lvl, beer: current.id };
  const k = JSON.stringify(p);
  if (k === lastPresence) return;
  lastPresence = k;
  room.presence(p).catch(() => {});
}
let peerSeq = 0;
async function renderPeers() {
  const el = $('peerList'), seq = ++peerSeq;
  if (!room) { $('liveLead').textContent = 'Live meedrinken werkt als je Pintje opent via de gedeelde link op claude.ai.'; el.textContent = ''; return; }
  const ps = room.peers().filter(p => p.kind === 'viewer');
  const seen = new Map();
  ps.forEach(p => { const key = p.by || p.peer; if (!seen.has(key) || p.isMe) seen.set(key, p); });
  const list = [...seen.values()];
  const ids = list.map(p => p.by).filter(Boolean);
  const prof = user && ids.length ? await user.profiles(ids) : {};
  if (seq !== peerSeq) return;
  el.textContent = '';
  list.sort((a, b) => b.isMe - a.isMe).forEach(p => {
    const pr = (p.by && prof[p.by]) || {};
    const chip = document.createElement('div'); chip.className = 'peer' + (p.isMe ? ' me' : '');
    const img = document.createElement('img'); img.alt = ''; if (pr.avatarUrl) img.src = pr.avatarUrl;
    const nm = document.createElement('span');
    const beer = BEER[p.presence && p.presence.beer];
    const lvl = Number.isInteger(p.presence && p.presence.lvl) ? p.presence.lvl : null;
    nm.textContent = (pr.name || (p.isMe ? 'Jij' : 'Een drinker')) + (p.isMe ? ' (jij)' : '');
    const sm = document.createElement('small');
    sm.textContent = [lvl ? `lvl ${lvl}` : '', beer ? beer.name : ''].filter(Boolean).join(' · ');
    chip.append(img, nm); if (sm.textContent) { chip.append(' '); chip.append(sm); }
    el.appendChild(chip);
  });
  const n = others().length;
  $('liveLead').textContent = n ? `${n} andere drinker${n > 1 ? 's' : ''} ${n > 1 ? 'hebben' : 'heeft'} Pintje nu open. Roep Schol! voor een bonus voor iedereen.` : 'Je zit alleen aan de toog. Deel de link en drink samen.';
  $('scholBtn').hidden = n === 0;
  setText($('liveCount'), n ? ` · 👥 ${n + 1} in het café` : '');
}
$('scholBtn').addEventListener('click', () => {
  if (!room || performance.now() < scholReadyAt) return;
  const n = others().length;
  if (!n) return;
  scholReadyAt = performance.now() + 30000;
  room.emit('schol', {}).then(() => {
    S.schols++;
    const bon = income60(10) * Math.min(5, n); addBon(bon);
    queueToast(`🍻 SCHOL! naar ${n} drinker${n > 1 ? 's' : ''} · +${fmt(bon)} 🎟️`);
    wake(); ching(); confetti(40); dirty = true;
  }).catch(() => queueToast('Je kan hier enkel meekijken: Schol! roepen lukt niet.'));
  const b = $('scholBtn'); b.disabled = true; setTimeout(() => { b.disabled = false; }, 30000);
});
async function initRoom() {
  try { room = window.claude && await window.claude.use('room'); } catch (e) { room = null; }
  if (!room) { renderPeers(); return; }
  room.onPeers(() => { if (activeTab() === 'ranglijst') renderPeers(); else { const n = others().length; setText($('liveCount'), n ? ` · 👥 ${n + 1} in het café` : ''); } }, () => { room = null; renderPeers(); });
  room.on('schol', async m => {
    if (m.sameTab || m.kind !== 'viewer') return;
    const key = m.by || m.peer;
    const name = await nameOf(m.by);
    if (!lastScholFrom[key] || performance.now() - lastScholFrom[key] > 20000) {
      lastScholFrom[key] = performance.now();
      const bon = income60(10); addBon(bon);
      queueToast(`🍻 ${name} roept Schol! +${fmt(bon)} 🎟️`);
    } else queueToast(`🍻 ${name} roept Schol!`);
    tone(1200, now(), 0.1, 'triangle', 0.08);
  });
  room.on('vondst', async m => {
    if (m.isMe || m.kind !== 'viewer') return;
    const b = m.data && typeof m.data.id === 'string' ? BEER[m.data.id] : null;
    if (!b || b.r < GEM) return;
    queueToast(`🔔 ${await nameOf(m.by)} vond ${RARITIES[b.r].label.toLowerCase()}: ${b.name}!`);
  });
  sendPresence();
  renderPeers();
}
function announceFind(b) { if (room && b.r >= GEM) room.emit('vondst', { id: b.id }).catch(() => {}); }

// =====================================================================
// MINIGAME: TAPWEDSTRIJD
// =====================================================================
let mgOpen = false;
const MG_ROUNDS = 5;
const mgRewardFactor = () => (S.mg.day === todayKey() && S.mg.today >= 5 ? 0.2 : 1) * (1 + rank('vasthand') * 0.2);
function mgPlay() {
  if (mgOpen) return;
  stop(); wake();
  mgOpen = true;
  const o = document.createElement('div');
  o.className = 'mg';
  const sh = SHAPE.vaasje, BOT = 286, RIM = 24;
  o.innerHTML = `<div class="top"><b>🎯 Tapwedstrijd</b><div class="rounds">${'<i></i>'.repeat(MG_ROUNDS)}</div><span id="mgScore">0</span></div>
    <div class="field"><svg viewBox="-10 -70 230 370" aria-hidden="true">
      <defs><clipPath id="mgClip"><path d="${sh.d}"/></clipPath>
        <linearGradient id="mgBeer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c445"/><stop offset="1" stop-color="#d98a12"/></linearGradient></defs>
      <rect x="70" y="-70" width="60" height="26" rx="6" fill="#8a8a96"/><rect x="92" y="-46" width="16" height="22" fill="#6a6a76"/>
      <rect id="mgStream" x="96" y="-24" width="8" height="0" fill="#f2be40" opacity="0.9"/>
      <g clip-path="url(#mgClip)">
        <rect id="mgBeerR" x="0" y="300" width="200" height="0" fill="url(#mgBeer)"/>
        <rect id="mgFoamR" x="0" y="300" width="200" height="0" fill="#fffaf0"/>
      </g>
      <rect id="mgBand" x="22" y="0" width="156" height="0" fill="#3ddc84" opacity="0.18"/>
      <line id="mgLine" x1="14" x2="186" y1="0" y2="0" stroke="#3ddc84" stroke-width="3" stroke-dasharray="8 6"/>
      <text id="mgLabel" x="188" y="0" fill="#3ddc84" font-size="12" font-weight="700">ijkstreep</text>
      <path d="${sh.d}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="4"/>
    </svg></div>
    <div class="msg" id="mgMsg">Ronde 1<small>Hou de knop vast om te tappen, laat los op tijd.</small></div>
    <div class="actions"><button class="big" id="mgTap" style="background:var(--accent);color:var(--on-accent)">Hou vast om te tappen</button><button class="big outline" id="mgQuit">Stoppen</button></div>`;
  document.body.appendChild(o);
  const q = id => o.querySelector('#' + id);
  const yOf = f => BOT - f * (BOT - RIM);
  let round = 0, total = 0, perfects = 0, phase = 'ready', fill = 0, foamF = 0, target = 0.7, tol = 0.06, rate = 0.3, raf = 0, last = 0, settleEnd = 0, spilled = false;
  function setupRound() {
    target = 0.62 + Math.random() * 0.24;
    tol = 0.065 - round * 0.009;
    rate = (0.26 + round * 0.07) * (1 - rank('vasthand') * 0.1);
    fill = 0; foamF = 0; phase = 'ready';
    q('mgLine').setAttribute('y1', yOf(target)); q('mgLine').setAttribute('y2', yOf(target));
    q('mgLabel').setAttribute('y', yOf(target) + 4);
    q('mgBand').setAttribute('y', yOf(target + tol)); q('mgBand').setAttribute('height', yOf(target - tol) - yOf(target + tol));
    q('mgMsg').innerHTML = `Ronde ${round + 1} van ${MG_ROUNDS}<small>Mik op de ijkstreep. Het schuim zakt nog wat na het loslaten.</small>`;
    q('mgTap').textContent = 'Hou vast om te tappen'; q('mgTap').disabled = false;
    draw();
  }
  function draw() {
    const beerTop = yOf(Math.max(0, fill - foamF)), foamTop = yOf(fill);
    q('mgBeerR').setAttribute('y', beerTop); q('mgBeerR').setAttribute('height', BOT - beerTop + 6);
    q('mgFoamR').setAttribute('y', foamTop); q('mgFoamR').setAttribute('height', Math.max(0, beerTop - foamTop));
    q('mgStream').setAttribute('height', phase === 'pour' ? Math.max(0, foamTop + 24) : 0);
  }
  function loop(t) {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (phase === 'pour') {
      fill += rate * dt;
      foamF = Math.min(0.2, foamF + dt * (0.06 + rate * 0.12));
      if (fill >= 1) { fill = 1; endPour(true); }
    } else if (phase === 'settle') {
      foamF = Math.max(foamF * 0.6, foamF - dt * 0.12);
      fill = Math.max(0, fill - dt * 0.05);
      if (t > settleEnd) { phase = 'scored'; score(); }
    }
    draw();
    raf = requestAnimationFrame(loop);
  }
  function startPour() { if (phase !== 'ready') return; phase = 'pour'; spilled = false; pourSound(true); }
  function endPour(spill) {
    if (phase !== 'pour') return;
    pourSound(false);
    spilled = !!spill;
    phase = 'settle'; settleEnd = performance.now() + 800;
    q('mgTap').disabled = true;
  }
  function score() {
    const final = fill - foamF * 0.3, dist = Math.abs(final - target);
    let pts, label, cls;
    if (spilled) { pts = 0; label = 'Overgelopen! 💦'; cls = 'bad'; }
    else if (dist < tol * 0.3) { pts = 100; label = 'PERFECT! Twee vingers schuim. 🤌'; cls = 'ok'; perfects++; }
    else if (dist < tol) { pts = Math.round(100 - dist / tol * 30); label = final > target ? 'Goed, iets te vol.' : 'Goed, iets te weinig.'; cls = 'ok'; }
    else { pts = Math.max(0, Math.round(70 - (dist - tol) / tol * 35)); label = final > target ? 'Te vol!' : 'Te weinig!'; cls = pts > 30 ? 'meh' : 'bad'; }
    total += pts;
    o.querySelectorAll('.rounds i')[round].className = cls;
    q('mgScore').textContent = total;
    q('mgMsg').innerHTML = `${label}<small>+${pts} punten</small>`;
    if (pts === 100) { tone(1047, now(), 0.2, 'triangle', 0.12); tone(1568, now() + 0.1, 0.3, 'triangle', 0.12); }
    else if (pts > 0) tone(660, now(), 0.15, 'triangle', 0.1); else tone(180, now(), 0.3, 'sawtooth', 0.08);
    round++;
    setTimeout(() => { if (!mgOpen) return; if (round < MG_ROUNDS) setupRound(); else finish(); }, 1300);
  }
  function finish() {
    phase = 'done';
    const f = mgRewardFactor(), rewardScore = total + (rank('ambacht') ? perfects * 100 : 0);
    const bon = Math.round((200 + staffIncome() * 300) * rewardScore / 500 * f);
    const xp = Math.round(xpToNext(levelInfo(S.xp).lvl) * 0.15 * rewardScore / 500 * f * xpMult());
    addBon(bon); S.xp += xp;
    if (S.mg.day !== todayKey()) { S.mg.day = todayKey(); S.mg.today = 0; }
    S.mg.today++; S.mg.plays++; S.mg.perfects += perfects;
    const best = total > S.mg.best; if (best) S.mg.best = total;
    questProg('mg', 1); questProg('mgscore', total);
    let extra = '';
    if (total >= 475) { addCrate('bak'); extra = ' · +1 bak'; }
    q('mgMsg').innerHTML = `${best ? '🏆 Nieuw record! ' : ''}${total} / 500<small>+${fmt(bon)} 🎟️ · +${fmt(xp)} XP${extra}${f < 1 ? ' (verminderde beloning na 5 spelletjes vandaag)' : ''}</small>`;
    q('mgTap').textContent = 'Nog eens'; q('mgTap').disabled = false;
    fanfare(total >= 400 ? 4 : 2);
    if (total >= 400) confetti(120);
    save(); dirty = true;
  }
  const tapBtn = q('mgTap');
  tapBtn.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (phase === 'done') { close(); mgPlay(); return; }
    startPour();
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => tapBtn.addEventListener(ev, () => endPour(false)));
  const kd = e => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); if (phase === 'done') { close(); mgPlay(); } else startPour(); } };
  const ku = e => { if (e.code === 'Space') endPour(false); };
  document.addEventListener('keydown', kd); document.addEventListener('keyup', ku);
  function close() { cancelAnimationFrame(raf); pourSound(false); document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); o.remove(); mgOpen = false; renderVisible(); }
  q('mgQuit').addEventListener('click', close);
  setupRound();
  last = performance.now();
  raf = requestAnimationFrame(loop);
}
$('mgPlay').addEventListener('click', mgPlay);

// =====================================================================
// DAILY QUESTS
// =====================================================================
function ensureQuests() {
  if (S.quests && S.quests.day === todayKey()) return;
  const keys = Object.keys(QUESTS).filter(k => k !== 'buy' || S.bonAll > 100);
  const chosen = [];
  while (chosen.length < 3) { const k = pick(keys); if (!chosen.includes(k)) chosen.push(k); }
  S.quests = { day: todayKey(), list: chosen.map(t => ({ t, goal: QUESTS[t].goal(), prog: 0, claimed: false })), bonus: false };
  dirty = true;
}
function questProg(type, amt) {
  if (!S.quests) return;
  S.quests.list.forEach(q => {
    if (q.t !== type || q.claimed || q.prog >= q.goal) return;
    q.prog = QUESTS[type].max ? Math.max(q.prog, amt) : Math.min(q.goal, q.prog + amt);
    if (q.prog >= q.goal) { q.prog = q.goal; queueToast(`✅ Opdracht klaar: ${QUESTS[type].text(q.goal)}`); dirty = true; }
  });
}
function claimQuest(i) {
  const q = S.quests.list[i];
  if (!q || q.claimed || q.prog < q.goal) return;
  q.claimed = true; S.questsDone++;
  const bon = Math.max(250, staffIncome() * 300), xp = Math.round(xpToNext(levelInfo(S.xp).lvl) * 0.3 * xpMult());
  addBon(bon); S.xp += xp;
  queueToast(`🎁 +${fmt(bon)} 🎟️ · +${fmt(xp)} XP`);
  ching(); save(); dirty = true; renderSpel();
}
$('questBonus').addEventListener('click', () => {
  if (!S.quests || S.quests.bonus || !S.quests.list.every(q => q.claimed)) return;
  S.quests.bonus = true; S.questDays++; addCrate('bak');
  queueToast('📦 +1 bak bier voor je harde werk!'); fanfare(3); confetti(80);
  save(); dirty = true; renderSpel();
});
