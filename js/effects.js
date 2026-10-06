// Pintje — toasts, overlays, confetti, crates, golden caps and background effects.
'use strict';

// =====================================================================
// TOASTS, OVERLAYS, CONFETTI
// =====================================================================
const toastQ = []; let toastBusy = false;
function queueToast(text) { if (toastQ.length < 10) toastQ.push(text); if (!toastBusy) nextToast(); }
function nextToast() {
  const t = $('toast');
  if (!toastQ.length) { toastBusy = false; t.classList.remove('show'); return; }
  toastBusy = true;
  t.textContent = toastQ.shift(); t.classList.add('show');
  setTimeout(() => { t.classList.remove('show'); setTimeout(nextToast, 350); }, 2200);
}
// one-shot animations through the Web Animations API: no class toggling, no forced reflow
function bump(el, frames, ms) { if (!reduceMotion && el.animate) el.animate(frames, { duration: ms, easing: 'ease-out' }); }
// the stage rect is cached; reading it on every tap forced a layout pass
let stageRect = null, stageRectAt = 0;
addEventListener('resize', () => { stageRect = null; });
function getStageRect() {
  const t = performance.now();
  if (!stageRect || t - stageRectAt > 2000) { stageRect = $('stage').getBoundingClientRect(); stageRectAt = t; }
  return stageRect;
}
function floatText(e, text, big) {
  const stage = $('stage'), r = getStageRect();
  const d = document.createElement('div');
  d.className = 'float' + (big ? ' crit' : '');
  d.textContent = text;
  d.style.left = ((e && e.clientX ? e.clientX - r.left : r.width / 2) - 20) + 'px';
  d.style.top = ((e && e.clientY ? e.clientY - r.top : r.height / 2) - 30) + 'px';
  stage.appendChild(d);
  setTimeout(() => d.remove(), 950);
}
function xpDrop(a, b, r) {
  if ($('tap').hidden) return;
  const d = document.createElement('div');
  d.className = 'xpdrop r' + r;
  d.innerHTML = `${esc(a)}<br><small style="font-size:0.7em">${esc(b)}</small>`;
  $('stage').appendChild(d);
  setTimeout(() => d.remove(), 1900);
}
function confetti(n, palette) {
  if (reduceMotion) return;
  const cv = $('confetti'), c = cv.getContext('2d');
  cv.hidden = false; cv.width = innerWidth; cv.height = innerHeight;
  const colors = palette || ['#f7c548', '#b88aee', '#58a9e6', '#6cc070', '#f0913a', '#fffaf0'];
  const ps = Array.from({ length: n }, () => ({
    x: innerWidth / 2, y: innerHeight * 0.4, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
    s: 4 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, col: pick(colors),
  }));
  const t0 = performance.now();
  (function frame(t) {
    c.clearRect(0, 0, cv.width, cv.height);
    ps.forEach(p => {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.rot += p.vr;
      c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore();
    });
    if (t - t0 < 3000) requestAnimationFrame(frame); else { c.clearRect(0, 0, cv.width, cv.height); cv.hidden = true; }
  })(t0);
}
let overlayOpen = null;
function overlay(html, tint, noOk) {
  if (overlayOpen) overlayOpen.remove();
  const o = document.createElement('div');
  o.className = 'overlay';
  if (tint) o.style.setProperty('--ov', tint);
  o.innerHTML = html + (noOk ? '' : '<button class="ok">Schol!</button>');
  o.close = () => { o.remove(); if (overlayOpen === o) overlayOpen = null; };
  if (noOk) { document.body.appendChild(o); overlayOpen = o; return o; }
  const close = () => { o.remove(); if (overlayOpen === o) overlayOpen = null; };
  o.querySelector('.ok').addEventListener('click', close);
  document.body.appendChild(o);
  overlayOpen = o;
  return o;
}
function beerCardHtml(b, delay = 0, count = 0) {
  return `<div class="card r${b.r}" style="animation-delay:${delay}ms"><div class="swatch" style="background:linear-gradient(${b.c[0]},${b.c[1]});--foam:${b.foam}"></div>` +
    `<div class="chip r${b.r}">${RARITIES[b.r].label}</div><div class="nm">${esc(b.name)}</div>${count > 1 ? `<div class="cnt">×${count}</div>` : ''}</div>`;
}
let lastReveal = 0;
function reveal(b) {
  if (performance.now() - lastReveal < 2500) { queueToast(`${RARITIES[b.r].label}! ${b.name}`); return; }
  lastReveal = performance.now();
  const r = RARITIES[b.r];
  overlay(`<div class="chip r${b.r}">${r.label} · ${fmtPct(tierProbs()[b.r] * 100)}</div><div class="big-t r${b.r}">${esc(b.name)}</div>` +
    `<div class="sub">${esc(fmtAbv(b.abv))} · ${esc(b.style)}<br>Drink hem zelf uit voor +${fmt(Math.round(r.xp * xpMult()))} XP en ${fmt(r.secs)} seconden aan bonnekes.</div>`, r.halo + '88');
  confetti(b.r >= RAINBOW ? 260 : 180, r.pal);
  fanfare(b.r);
}

// ---- crates ----
function addCrate(type, n = 1) { S.crates[type] = (S.crates[type] || 0) + n; dirty = true; }
function rollCrate(type) {
  const def = CRATES[type], n = def.n + rank('krat') + hrank('h_crate');
  const got = Array.from({ length: n }, () => rollBeer());
  if (got.every(b => b.r < def.min)) got[n - 1] = rollBeer(def.min);
  return got;
}
function openCrates(types) {
  if (!types.length) return;
  wake();
  const got = [];
  types.forEach(type => { S.crates[type]--; S.opened++; questProg('crate', 1); got.push(...rollCrate(type)); });
  const before = new Set(BEERS.filter(b => S.counts[b.id] > 0).map(b => b.id));
  let xp = 0;
  got.forEach(b => { gainPints(b, 1, 'crate'); xp += Math.round(RARITIES[b.r].xp * xpMult()); });
  const fresh = [...new Set(got.filter(b => !before.has(b.id)).map(b => b.id))];
  const best = got.reduce((m, b) => Math.max(m, b.r), 0);
  // group identical beers, best first
  const grouped = [...got.reduce((m, b) => m.set(b.id, (m.get(b.id) || 0) + 1), new Map())].map(([id, c]) => ({ b: BEER[id], c })).sort((a, z) => z.b.r - a.b.r || z.c - a.c);
  const title = types.length === 1 ? `${CRATES[types[0]].ico} ${CRATES[types[0]].name}` : `📦 ${types.length} bakken, kratten en vaten`;
  const shown = grouped.slice(0, 18);
  const tally = RARITIES.map((r, i) => ({ i, c: got.filter(b => b.r === i).length })).filter(x => x.c).reverse()
    .map(x => `<span class="chip r${x.i}">${RARITIES[x.i].label} ×${x.c}</span>`).join('');
  overlay(`<div class="big-t">${title}</div>${types.length > 1 ? `<div class="tally">${tally}</div>` : ''}<div class="cards">${shown.map((g, i) => beerCardHtml(g.b, Math.min(i, 12) * 120, g.c)).join('')}</div>` +
    `<div class="sub">${got.length} bieren · +${fmt(xp)} XP${fresh.length ? ` · ${fresh.length} nieuw in je collectie` : ''}${grouped.length > shown.length ? ` · en nog ${grouped.length - shown.length} andere soorten` : ''}</div>`,
    best >= GEM ? RARITIES[best].halo + '88' : null);
  fanfare(Math.max(2, best));
  if (best >= 3) confetti(120, RARITIES[best].pal);
  save(); dirty = true;
}
$('crates').addEventListener('click', e => {
  const b = e.target.closest('[data-crate]');
  if (!b) return;
  const k = b.dataset.crate;
  if (k === 'all') openCrates(Object.keys(CRATES).flatMap(t => Array(S.crates[t]).fill(t)));
  else if (S.crates[k] > 0) openCrates([k]);
});

// =====================================================================
// GOLDEN CAPS + BACKGROUND EFFECTS
// =====================================================================
const fxCv = $('fx'), fxC = fxCv.getContext('2d');
let fx = null, fxWasOn = false;   // { kind, until, start, parts }
function startFx(kind, secs, emoji) {
  fx = { kind, emoji, start: performance.now(), until: performance.now() + secs * 1000, parts: [] };
  fxCv.width = innerWidth; fxCv.height = innerHeight;
}
// ---- seasonal ambience: light particles while no other effect runs ----
let amb = [], ambLast = 0;
const ambKind = () => {
  if (S.noAmbient || reduceMotion) return null;
  const x = SEASONS.find(z => seasonActive(z.id));
  return x ? x.amb : null;
};
function drawAmbient(t) {
  const kind = ambKind(), w = fxCv.width, h = fxCv.height, c = fxC;
  if (!kind) { amb = []; return; }
  if (drawAmbient.kind !== kind) { amb = []; drawAmbient.kind = kind; }
  if (w !== innerWidth || h !== innerHeight) { fxCv.width = innerWidth; fxCv.height = innerHeight; }
  const dt = Math.min(0.05, (t - ambLast) / 1000 || 0.016); ambLast = t;
  const EMO = { leaves: ['🍂', '🍁'], bats: ['🦇', '👻', '🎃'], cookies: ['🍪', '🎁'], blossoms: ['🌸', '🌼'], flags: ['🇧🇪'], sun: ['✨'] };
  const max = kind === 'fireworks' ? 160 : kind === 'snow' ? 60 : kind === 'confetti' ? 50 : 18;
  if (kind === 'fireworks') {
    if (Math.random() < dt * 0.8) {
      const x = w * (0.15 + Math.random() * 0.7), y = h * (0.1 + Math.random() * 0.35), hue = Math.random() * 360;
      for (let i = 0; i < 40; i++) { const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 120; amb.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1.6, col: `hsl(${hue + Math.random() * 40} 100% 65%)` }); }
    }
  } else if (amb.length < max && Math.random() < dt * (kind === 'snow' ? 12 : kind === 'confetti' ? 10 : 2.2)) {
    const p = { x: Math.random() * w, y: -20, vx: (Math.random() - 0.5) * 30, vy: 20 + Math.random() * 40, r: Math.random() * 6, vr: (Math.random() - 0.5) * 2, s: 2 + Math.random() * 3, e: EMO[kind] ? pick(EMO[kind]) : null, col: `hsl(${Math.random() * 360} 90% 60%)`, life: 99 };
    if (kind === 'bats') { p.y = Math.random() * h * 0.6; p.x = -30; p.vx = 50 + Math.random() * 60; p.vy = 0; }
    if (kind === 'sun') { p.y = h + 10; p.vy = -(10 + Math.random() * 20); }
    amb.push(p);
  }
  c.globalAlpha = 0.55; c.textAlign = 'center'; c.font = '20px serif';
  amb.forEach(p => {
    p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
    if (kind === 'fireworks') { p.vy += 60 * dt; p.vx *= 0.98; p.life -= dt; c.globalAlpha = Math.max(0, p.life / 1.6) * 0.8; c.fillStyle = p.col; c.fillRect(p.x, p.y, 2.5, 2.5); return; }
    if (kind === 'bats') p.y += Math.sin(t / 200 + p.r) * 0.8;
    else p.x += Math.sin(t / 900 + p.r) * 0.3;
    if (kind === 'snow') { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(p.x, p.y, p.s, 0, Math.PI * 2); c.fill(); }
    else if (kind === 'confetti') { c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.col; c.fillRect(-4, -2, 8, 4); c.restore(); }
    else { c.save(); c.translate(p.x, p.y); c.rotate(kind === 'bats' ? 0 : p.r * 0.3); c.fillText(p.e, 0, 0); c.restore(); }
  });
  c.globalAlpha = 1;
  amb = amb.filter(p => p.life > 0 && p.y < h + 30 && p.y > -40 && p.x < w + 40 && p.x > -60);
}
function drawFx(t) {
  const w = fxCv.width, h = fxCv.height, c = fxC;
  c.clearRect(0, 0, w, h);
  if (!fx) { drawAmbient(t); return; }
  const left = fx.until - t, age = (t - fx.start) / 1000;
  if (left <= 0) { fx = null; return; }
  c.globalAlpha = Math.max(0, Math.min(1, left / 1000, age * 2));
  const still = reduceMotion;
  if (fx.kind === 'disco') {
    c.fillStyle = 'rgba(20,0,30,0.35)'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 7; i++) {
      const a = (still ? 0 : age * 0.7) + i * Math.PI * 2 / 7, x0 = w / 2, y0 = 40, len = Math.hypot(w, h);
      c.fillStyle = `hsla(${i * 51 + (still ? 0 : age * 60)}, 95%, 60%, 0.16)`;
      c.beginPath(); c.moveTo(x0, y0);
      c.lineTo(x0 + Math.cos(a - 0.12) * len, y0 + Math.sin(a - 0.12) * len);
      c.lineTo(x0 + Math.cos(a + 0.12) * len, y0 + Math.sin(a + 0.12) * len);
      c.closePath(); c.fill();
    }
    const g = c.createRadialGradient(w / 2, 40, 2, w / 2, 40, 28); g.addColorStop(0, '#fff'); g.addColorStop(1, '#8a8aa0');
    c.fillStyle = g; c.beginPath(); c.arc(w / 2, 40, 24, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 18; i++) {
      const x = (Math.sin(i * 12.9 + age * 1.3) * 0.5 + 0.5) * w, y = (Math.cos(i * 7.7 + age * 0.9) * 0.5 + 0.5) * h;
      c.fillStyle = `hsla(${i * 40 + age * 90}, 100%, 70%, 0.25)`; c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.fill();
    }
  } else if (fx.kind === 'tickets' || fx.kind === 'beerrain' || fx.kind === 'rain') {
    if (!still && fx.parts.length < 60 && Math.random() < 0.6) fx.parts.push({ x: Math.random() * w, y: -30, v: 120 + Math.random() * 200, r: Math.random() * 6, vr: (Math.random() - 0.5) * 4 });
    c.font = '26px serif'; c.textAlign = 'center';
    fx.parts.forEach(p => {
      p.y += p.v / 60; p.r += p.vr / 60;
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillText(fx.kind === 'rain' ? fx.emoji : fx.kind === 'tickets' ? '🎟️' : '🍺', 0, 0); c.restore();
    });
    fx.parts = fx.parts.filter(p => p.y < h + 40);
    c.fillStyle = 'rgba(255,215,94,0.08)'; c.fillRect(0, 0, w, h);
  } else if (fx.kind === 'storm') {
    c.fillStyle = 'rgba(10,30,60,0.3)'; c.fillRect(0, 0, w, h);
    if (fx.parts.length < 140) fx.parts.push({ a: Math.random() * Math.PI * 2, r: 20 + Math.random() * Math.max(w, h) * 0.6, s: 2 + Math.random() * 6, y: h + 10 });
    c.strokeStyle = 'rgba(220,240,255,0.55)'; c.lineWidth = 1.5;
    fx.parts.forEach(p => {
      p.a += still ? 0 : 0.03; p.y -= still ? 0 : 3 + p.s * 0.6;
      const x = w / 2 + Math.cos(p.a) * p.r * 0.6;
      c.beginPath(); c.arc(x, p.y, p.s, 0, Math.PI * 2); c.stroke();
    });
    fx.parts = fx.parts.filter(p => p.y > -20);
  } else if (fx.kind === 'clover') {
    ['#ff5f5f', '#ffb347', '#fff35c', '#5fff8a', '#5fc8ff', '#b05fff'].forEach((col, i) => { c.strokeStyle = col + '40'; c.lineWidth = 14; c.beginPath(); c.arc(w / 2, h * 0.9, Math.max(20, w * 0.55 - i * 14), Math.PI, 0); c.stroke(); });
    if (!still && fx.parts.length < 30 && Math.random() < 0.15) fx.parts.push({ x: Math.random() * w, y: h + 20, v: 30 + Math.random() * 50, sw: Math.random() * 6 });
    c.font = '24px serif'; c.textAlign = 'center';
    fx.parts.forEach(p => { p.y -= p.v / 60; c.fillText('🍀', p.x + Math.sin(p.y / 40 + p.sw) * 12, p.y); });
    fx.parts = fx.parts.filter(p => p.y > -30);
  } else if (fx.kind === 'candle') {
    c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(0, 0, w, h);
    const fl = still ? 1 : 0.85 + Math.sin(age * 13) * 0.08 + Math.sin(age * 7.3) * 0.07;
    const g = c.createRadialGradient(w / 2, h * 0.45, 10, w / 2, h * 0.45, Math.max(w, h) * 0.5 * fl);
    g.addColorStop(0, 'rgba(255,190,90,0.35)'); g.addColorStop(1, 'rgba(255,140,40,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  } else if (fx.kind === 'gold') {
    c.fillStyle = 'rgba(60,40,0,0.3)'; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.42, len = Math.hypot(w, h);
    for (let i = 0; i < 16; i++) {
      const a = (still ? 0 : age * 0.25) + i * Math.PI / 8;
      c.fillStyle = i % 2 ? 'rgba(255,215,94,0.18)' : 'rgba(255,241,168,0.1)';
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); c.lineTo(cx + Math.cos(a + 0.18) * len, cy + Math.sin(a + 0.18) * len); c.closePath(); c.fill();
    }
    for (let i = 0; i < 24; i++) {
      const x = (Math.sin(i * 3.1 + age) * 0.5 + 0.5) * w, y = (Math.cos(i * 5.3 + age * 0.7) * 0.5 + 0.5) * h;
      c.fillStyle = `rgba(255,250,220,${0.4 + 0.4 * Math.sin(age * 4 + i)})`; c.fillRect(x, y, 3, 3);
    }
  }
  c.globalAlpha = 1;
}

let nextCapAt = performance.now() + (45 + Math.random() * 60) * 1000, capEl = null;
const capInterval = () => (60 + Math.random() * 90) * 1000 / ((has('dop1') ? 1.5 : 1) * (1 + rank('goudhand') * 0.2));
function spawnCap() {
  capEl = document.createElement('button');
  capEl.className = 'goldcap';
  capEl.setAttribute('aria-label', 'Gouden bierdop');
  capEl.textContent = '🍺';
  capEl.style.left = (16 + Math.random() * (innerWidth - 90)) + 'px';
  capEl.style.top = (90 + Math.random() * (innerHeight - 240)) + 'px';
  capEl.addEventListener('click', clickCap);
  document.body.appendChild(capEl);
  const el = capEl;
  setTimeout(() => { if (capEl === el) { el.remove(); capEl = null; } }, 13000);
}
function clickCap() {
  if (!capEl) return;
  capEl.remove(); capEl = null;
  S.caps++;
  questProg('cap', 1);
  wake();
  const dur = (has('dop2') ? 2 : 1) * (1 + rank('goudhand') * 0.1), power = has('dop3') ? 1.5 : 1, x = Math.random(), t = performance.now();
  let msg;
  if (x < 0.36) { buffs.prod = { mult: 7 * power, until: t + 77000 * dur, name: `Happy Hour ×${7 * power}` }; msg = '🪩 Happy Hour! Je personeel drinkt ×7.'; startFx('disco', 77 * dur); }
  else if (x < 0.68) {
    const gain = (Math.max(50, Math.min(S.bon * 0.15, staffIncome() * 900)) + 13) * power;
    addBon(gain); msg = `🎟️ Rondje van de zaak! +${fmt(gain)} bonnekes`; startFx('tickets', 6);
  }
  else if (x < 0.8) { buffs.click = { mult: 77, until: t + 15000 * dur, name: 'Slokkenstorm ×77' }; msg = '🌪️ Slokkenstorm! Je eigen slokken ×77.'; startFx('storm', 15 * dur); }
  else if (x < 0.91) { buffs.luck = { mult: 3 * power, until: t + 60000 * dur, name: `Geluksuur ×${3 * power}` }; msg = '🍀 Geluksuur! Zeldzaam en beter ×3 als je zelf tapt.'; startFx('clover', 60 * dur); }
  else if (x < 0.96) { const k = Math.random() < 0.15 ? 'krat' : 'bak'; addCrate(k); msg = `🍺 Bierregen! +1 ${CRATES[k].label}`; startFx('beerrain', 6); }
  else {
    level = 1; pourNew(rollBeer(3)); msg = '🛢️ Gouden fust! Een episch bier of beter staat klaar.'; startFx('gold', 8);
    drinkBtn.classList.remove('hidden'); refillBtn.classList.add('hidden');
  }
  queueToast(msg);
  ching(); confetti(60, RARITIES[MYTHIC].pal);
  dirty = true;
}
