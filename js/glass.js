// Pintje — the glass: pouring, drinking, tapping and brokken.
'use strict';

// =====================================================================
// GLASS (moves only when YOU drink)
// =====================================================================
let level = 1, drinking = false, current = null, fullHold = false, pouring = false;

function applySkin() {
  const sk = SKIN[S.skin], sh = SHAPE[sk.shape];
  $('clipPath').setAttribute('d', sh.d);
  $('outline').setAttribute('d', sh.d);
  $('outline').setAttribute('stroke', sk.stroke);
  $('decorBack').innerHTML = sk.back || '';
  $('decorFront').innerHTML = (sk.front || '') + (sk.shape === 'pul' || sk.shape === 'kwak' ? '' : sh.hl);
  document.querySelector('svg.glass').style.filter = sk.glow && !(current && current.r >= GEM) ? `drop-shadow(0 0 10px ${sk.glow})` : '';
  render();
}
function applyBeer() {
  const b = current, r = RARITIES[b.r];
  $('beerTop').setAttribute('stop-color', b.c[0]); $('beerBottom').setAttribute('stop-color', b.c[1]);
  foam.setAttribute('fill', b.foam);
  glassWrap.classList.toggle('halo', b.r >= GEM);
  glassWrap.style.setProperty('--halo', r.halo || 'transparent');
  applySkin();
  const chip = $('beerRarity');
  chip.textContent = r.label; chip.className = 'chip r' + b.r;
  $('beerName').textContent = b.name;
  $('beerMeta').textContent = `${fmtAbv(b.abv)} · ${b.style}`;
  $('beerNew').classList.toggle('hidden', (S.counts[b.id] || 0) > 0);
  bump($('beerCard'), [{ transform: 'scale(0.6)', opacity: 0 }, { transform: 'scale(1.05)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], 450);
}
function render() {
  const bottom = SHAPE[SKIN[S.skin].shape].bottom;
  const surface = TOP + (1 - level) * (bottom - TOP);
  beerRect.setAttribute('y', surface);
  beerRect.setAttribute('height', Math.max(0, bottom - surface + 6));
  foam.setAttribute('transform', `translate(0 ${surface})`);
  foam.style.opacity = level > 0.01 ? Math.min(1, 0.4 + level) : 0;
}
function spawnBubble() {
  if (level <= 0.02 || document.hidden || $('tap').hidden) return;
  const sh = SHAPE[SKIN[S.skin].shape], bottom = sh.bottom, r = current ? current.r : 0;
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  const x = sh.bx[0] + Math.random() * (sh.bx[1] - sh.bx[0]);
  c.setAttribute('r', (r >= GEM ? 2 : 1.5) + Math.random() * 2.5);
  c.setAttribute('fill', r >= GEM ? (r === RAINBOW ? `hsl(${Math.random() * 360} 100% 75%)` : RARITIES[r].halo) : 'rgba(255,255,255,0.55)');
  bubbles.appendChild(c);
  liveBubbles.push({ c, x, bottom, start: performance.now(), dur: 1500 + Math.random() * 1500 });
}
// all bubbles move in the main loop instead of one animation loop per bubble
const liveBubbles = [];
let bubbleAcc = 0;
function updateBubbles(t, dt) {
  bubbleAcc += dt;
  if (bubbleAcc > 0.24) { bubbleAcc = 0; spawnBubble(); }
  for (let i = liveBubbles.length - 1; i >= 0; i--) {
    const b = liveBubbles[i], p = (t - b.start) / b.dur;
    const surf = TOP + (1 - level) * (b.bottom - TOP);
    const y = b.bottom - 4 - p * (b.bottom - 4 - surf);
    if (p >= 1 || y <= surf + 2) { b.c.remove(); liveBubbles.splice(i, 1); continue; }
    b.c.setAttribute('cy', y); b.c.setAttribute('cx', b.x + Math.sin(p * 12) * 2);
  }
}

// =====================================================================
// POURING & DRINKING
// =====================================================================
const POUR_MSG = ['Vers getapt!', 'Oh, iets anders!', 'Zeldzaam! Goe gezien.', 'EPISCH! 🏆', 'LEGENDARISCH! 🔥', 'PAREL! 🤍', 'SMARAGD! 💚', 'ROBIJN! ❤️', 'SAFFIER! 💙', 'AMETHIST! 💜', 'DIAMANT! 💎', 'OBSIDIAAN! 🖤', 'REGENBOOG! 🌈', 'KOSMISCH! 🪐', 'MYTHISCH! ✨', 'GODDELIJK! 👑'];
function pourNew(beer) {
  current = beer || rollBeer();
  if (secondChance) queueToast('🎲 Tweede kans! Opnieuw getapt.');
  applyBeer();
  const r = current.r;
  if (r >= GEM) { reveal(current); announceFind(current); }
  else if (r >= 3) confetti(r === 4 ? 140 : 80);
  if (r >= 2) fanfare(r);
  sendPresence();
  if (navigator.vibrate && r >= 3) navigator.vibrate(r >= 4 ? [80, 50, 80, 50, 200] : [60, 40, 60]);
  fullHold = drinking;
  return POUR_MSG[r];
}

const xpMult = () => (1 + rank('kenner') * 0.1) * timeMult('xp') * Math.pow(1.5, hrank('h_xp'));
function gainPints(beer, n, src) {
  if (n <= 0) return;
  const first = !(S.counts[beer.id] > 0);
  S.counts[beer.id] = (S.counts[beer.id] || 0) + n;
  S.total += n;
  S.xp += Math.round(RARITIES[beer.r].xp * n * xpMult());
  if (first && src !== 'crate') queueToast(`📖 Nieuw in je collectie: ${beer.name}`);
  dirty = true;
}

// Your own sips: they earn bonnekes and drain your glass.
function addSips(n) {
  let guard = 0;
  while (n > 1e-9 && guard++ < 4) {
    if (level <= 0) { showRefill(); return; }
    const need = level * SIPS_PER_PINT, take = Math.min(n, need);
    addBon(take * sipValue());
    level -= take / SIPS_PER_PINT; n -= take;
    if (level <= 1e-6) { level = 0; finishGlass(); if (level <= 0) break; }
  }
  render();
}

let pukeUntil = 0;
const puking = () => performance.now() < pukeUntil;
function finishGlass() {
  if (S.day !== todayKey()) { S.day = todayKey(); S.today = 0; S.zat = 0; }
  const mult = Math.random() < rank('dubbel') * 0.04 ? 2 : 1;
  const beer = current;
  gainPints(beer, mult, 'own');
  const bonus = pintBonus(beer) * mult;
  addBon(bonus);
  S.today += mult; S.zat += mult; S.zatAt = Date.now();
  questProg('drink', mult);
  if (beer.r >= 2) questProg('rare', mult);
  if (fullHold && drinking) { S.flags.adfundum = true; if (ch) ch.nolift++; }
  if (ch) ch.pints += mult;
  if (new Date().getHours() < 5) S.flags.nachtuil = true;
  fullHold = false;
  xpDrop(`+${fmt(Math.round(RARITIES[beer.r].xp * mult * xpMult()))} XP${mult > 1 ? ' ×2' : ''}`, `+${fmt(bonus)} 🎟️`, beer.r);
  const limit = 10 + rank('lever') * 2;
  const willPuke = S.zat > limit && Math.random() < Math.min(0.9, (S.zat - limit) * 0.05);
  status.textContent = mult === 2 ? `🍻 Dubbel getapt! ${beer.name} telt 2×.` : `Burp! ${beer.name} op. ${pick(TOASTS)}`;
  if (willPuke) { setTimeout(puke, 250); level = 0; drinking = false; glassWrap.classList.remove('drinking'); showRefill(); return; }
  burp(); navigator.vibrate?.([60, 40, 120]);
  if (has('zelftap')) { const msg = pourNew(); level = 1; if (current.r >= 2) status.textContent = msg; }
  else { drinking = false; glassWrap.classList.remove('drinking'); showRefill(); }
}
function showRefill() {
  if (pouring) return;
  drinkBtn.classList.add('hidden');
  refillBtn.classList.remove('hidden');
}
function refill() {
  if (pouring || puking()) return;
  refillBtn.classList.add('hidden');
  drinkBtn.classList.remove('hidden');
  status.textContent = 'Wordt getapt…';
  wake();
  const msg = pourNew();
  pouring = true;
  const from = level, t0 = performance.now();
  (function pour(t) {
    const p = Math.min(1, (t - t0) / 900);
    level = from + (1 - from) * (1 - Math.pow(1 - p, 3));
    render();
    if (p < 1) requestAnimationFrame(pour);
    else { pouring = false; status.textContent = msg; }
  })(t0);
}

const DRINK_MSG = ['Glug glug glug…', 'Mmm, lekker!', 'Ad fundum! 🍺'];
const drinkSecs = b => (b.abv == null ? 7 : 3 + b.abv * 0.15) * (1 - rank('slok') * 0.08);
let gulpTimer = 0;
function start() {
  if (drinking || pouring || puking()) return;
  if (level <= 0) { refill(); return; }
  wake();
  drinking = true;
  fullHold = level >= 0.999;
  glassWrap.classList.add('drinking');
  gulpTimer = 0;
}
function stop() {
  if (!drinking) return;
  drinking = false; fullHold = false;
  glassWrap.classList.remove('drinking');
  if (level > 0 && level < 1) status.textContent = 'Nog niet leeg, drink door!';
}
function tapGlass(e) {
  if (pouring || puking()) return;
  if (level <= 0) { refill(); return; }
  wake();
  S.taps++;
  questProg('tap', 1);
  const t = performance.now();
  combo = t - lastTapAt < 700 ? combo + 1 : 1; lastTapAt = t;
  if (combo > S.bestCombo) S.bestCombo = combo;
  if (ch) ch.maxCombo = Math.max(ch.maxCombo, combo);
  const crit = Math.random() < 0.04;
  const base = sipValue(), v = base * comboMult() * (crit ? 10 : 1);
  addSips(1);
  if (v > base) addBon(v - base);
  gulp(1 + Math.min(combo, 40) * 0.015);
  if (!drinking) bump(glassWrap, [{ transform: 'none' }, { transform: 'rotate(-10deg) scale(0.97)' }, { transform: 'none' }], 180);
  floatText(e, crit ? `PERFECTE SLOK! +${fmt(v)}` : `+${fmt(v)} 🎟️`, crit);
  if (combo % 10 === 0) bump($('combo'), [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], 160);
  renderCombo();
}

drinkBtn.addEventListener('pointerdown', e => { e.preventDefault(); start(); });
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => drinkBtn.addEventListener(ev, stop));
refillBtn.addEventListener('click', refill);
glassWrap.addEventListener('pointerdown', e => { e.preventDefault(); tapGlass(e); });
glassWrap.addEventListener('keydown', e => { if (e.key === 'Enter') tapGlass(null); });
document.addEventListener('keydown', e => {
  if (e.code !== 'Space' || e.repeat || $('tap').hidden || mgOpen) return;
  e.preventDefault();
  start();
});
document.addEventListener('keyup', e => { if (e.code === 'Space') stop(); });

function onOrient(e) {
  if (e.beta == null || $('tap').hidden) return;
  if (e.beta > 115) start(); else stop();
}
if ('DeviceOrientationEvent' in window && matchMedia('(pointer: coarse)').matches) {
  tiltBtn.classList.remove('hidden');
  tiltBtn.addEventListener('click', async () => {
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function' && await DeviceOrientationEvent.requestPermission() !== 'granted') return;
      window.addEventListener('deviceorientation', onOrient);
      tiltBtn.textContent = 'Kantelen staat aan 📱'; tiltBtn.disabled = true;
    } catch (e) {}
  });
}

// =====================================================================
// BROKKEN
// =====================================================================
function retchSound() {
  try {
    const a = ctx(), t = a.currentTime;
    [0, 0.32, 0.62].forEach((off, i) => {
      const src = a.createBufferSource(); src.buffer = noiseBuffer(a, 0.3);
      const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3;
      bp.frequency.setValueAtTime(250, t + off); bp.frequency.exponentialRampToValueAtTime(700 + i * 150, t + off + 0.2);
      const g = a.createGain(); g.gain.setValueAtTime(0.0001, t + off); g.gain.exponentialRampToValueAtTime(0.35 + i * 0.15, t + off + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.25);
      src.connect(bp).connect(g).connect(a.destination); src.start(t + off); src.stop(t + off + 0.3);
      const o = a.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(120 + i * 10, t + off); o.frequency.exponentialRampToValueAtTime(70, t + off + 0.22);
      const og = a.createGain(); og.gain.setValueAtTime(0.0001, t + off); og.gain.exponentialRampToValueAtTime(0.12, t + off + 0.04); og.gain.exponentialRampToValueAtTime(0.001, t + off + 0.22);
      const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
      o.connect(lp).connect(og).connect(a.destination); o.start(t + off); o.stop(t + off + 0.25);
    });
    const v = t + 0.9;
    const o = a.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(150, v); o.frequency.linearRampToValueAtTime(95, v + 1.1);
    const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 9; lg.gain.value = 12; lfo.connect(lg).connect(o.frequency);
    const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, v); f.frequency.linearRampToValueAtTime(350, v + 1.1);
    const og = a.createGain(); og.gain.setValueAtTime(0.0001, v); og.gain.exponentialRampToValueAtTime(0.22, v + 0.08); og.gain.setValueAtTime(0.22, v + 0.8); og.gain.exponentialRampToValueAtTime(0.001, v + 1.2);
    o.connect(f).connect(og).connect(a.destination); o.start(v); lfo.start(v); o.stop(v + 1.25); lfo.stop(v + 1.25);
    const gush = a.createBufferSource(); gush.buffer = noiseBuffer(a, 1.3);
    const gl = a.createBiquadFilter(); gl.type = 'lowpass'; gl.frequency.setValueAtTime(600, v); gl.frequency.linearRampToValueAtTime(1800, v + 0.4); gl.frequency.linearRampToValueAtTime(400, v + 1.2);
    const gg = a.createGain(); gg.gain.setValueAtTime(0.0001, v); gg.gain.exponentialRampToValueAtTime(0.3, v + 0.1); gg.gain.exponentialRampToValueAtTime(0.001, v + 1.25);
    gush.connect(gl).connect(gg).connect(a.destination); gush.start(v); gush.stop(v + 1.3);
    const sp = t + 1.9, splash = a.createBufferSource(); splash.buffer = noiseBuffer(a, 0.9);
    const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
    const sg = a.createGain(); sg.gain.setValueAtTime(0.4, sp); sg.gain.exponentialRampToValueAtTime(0.001, sp + 0.8);
    splash.connect(hp).connect(sg).connect(a.destination); splash.start(sp); splash.stop(sp + 0.9);
    for (let i = 0; i < 5; i++) {
      const pt = sp + 0.3 + i * (0.25 + Math.random() * 0.3), po = a.createOscillator(), pg = a.createGain();
      po.frequency.setValueAtTime(500 + Math.random() * 300, pt); po.frequency.exponentialRampToValueAtTime(90, pt + 0.08);
      pg.gain.setValueAtTime(0.12, pt); pg.gain.exponentialRampToValueAtTime(0.001, pt + 0.1);
      po.connect(pg).connect(a.destination); po.start(pt); po.stop(pt + 0.12);
    }
  } catch (e) {}
}
function puke() {
  stop();
  const ms = 5000 - rank('emmer') * 2000;
  pukeUntil = performance.now() + ms;
  S.pukes++;
  S.zat = 0; S.zatAt = Date.now();   // alles eruit: terug nuchter
  dirty = true;
  retchSound();
  navigator.vibrate?.([100, 80, 100, 80, 400, 100, 600]);
  document.body.classList.add('queasy');
  setTimeout(() => document.body.classList.remove('queasy'), 900);
  drinkBtn.disabled = true;
  const greens = ['#9cc33b', '#b5d44f', '#7fa62a', '#c9dc6a', '#8db535'];
  let blobs = '', drips = '';
  for (let i = 0; i < 26; i++) {
    const cx = Math.random() * 100, cy = Math.random() * 100, rr = 6 + Math.random() * 16;
    blobs += `<ellipse cx="${cx}" cy="${cy}" rx="${rr}" ry="${rr * (0.6 + Math.random() * 0.6)}" fill="${greens[i % greens.length]}" opacity="${0.75 + Math.random() * 0.25}"/>`;
  }
  for (let i = 0; i < 40; i++) blobs += `<circle cx="${Math.random() * 100}" cy="${Math.random() * 100}" r="${0.6 + Math.random() * 1.6}" fill="${['#d98c35', '#e8c26a', '#6e4520', '#f3e3a0'][i % 4]}"/>`;
  for (let i = 0; i < 12; i++) {
    const w = 1.5 + Math.random() * 3;
    drips += `<rect x="${Math.random() * 100}" y="${40 + Math.random() * 40}" width="${w}" height="${10 + Math.random() * 30}" rx="${w / 2}" fill="${greens[i % greens.length]}"/>`;
  }
  const o = document.createElement('div');
  o.className = 'puke';
  o.setAttribute('role', 'alert');
  o.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g>${blobs}</g><g class="drip">${drips}</g></svg><div class="word">BRRROKKEEEEUUUHHH 🤮</div><div class="timer">Even bekomen…</div>`;
  document.body.appendChild(o);
  status.textContent = 'Bah. Even niks drinken…';
  const timer = o.querySelector('.timer');
  const iv = setInterval(() => {
    const left = Math.ceil((pukeUntil - performance.now()) / 1000);
    if (left > 0) { timer.textContent = `Even bekomen… ${left}`; return; }
    clearInterval(iv);
    o.classList.add('out');
    setTimeout(() => o.remove(), 800);
    drinkBtn.disabled = false;
    status.textContent = 'Oef, alles eruit. Terug nuchter! Nog ene?';
  }, 250);
}
