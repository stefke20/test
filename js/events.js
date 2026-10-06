// Pintje — random events, tap combos, golden bubbles, challenges and seasons.
'use strict';

// =====================================================================
// RANDOM EVENTS (voorvallen)
// =====================================================================
const QUIZ = [
  ['Welke abdij brouwt Westvleteren?', ['Sint-Sixtusabdij', 'Abdij van Orval', 'Abdij van Scourmont']],
  ['Wat betekent "Duvel"?', ['Duivel', 'Dubbel', 'Duif']],
  ['Hoe gist lambiek?', ['Spontaan, met wilde gisten uit de lucht', 'Met gewone bakkersgist', 'Koud, zoals een pils']],
  ['Wat is geuze?', ['Een mengeling van jonge en oude lambiek', 'Een donker abdijbier', 'Een pils met citroen']],
  ['Welk fruit zit er in een kriek?', ['Zure kersen', 'Frambozen', 'Bosbessen']],
  ['Wie is de patroonheilige van de brouwers?', ['Sint-Arnoldus', 'Sint-Niklaas', 'Sint-Maarten']],
  ['Sinds wanneer staat de Belgische biercultuur op de Unesco-lijst?', ['2016', '1999', '2022']],
  ['Uit welke stad komt Stella Artois?', ['Leuven', 'Gent', 'Brugge']],
  ['Uit welk glas drink je een De Koninck in Antwerpen?', ['Een bolleke', 'Een fluit', 'Een kwakglas']],
  ['Welke brouwerij legde een bierpijpleiding onder Brugge?', ['De Halve Maan', 'Duvel Moortgat', 'Palm']],
  ['Wat voor bier is Hoegaarden?', ['Witbier', 'Tripel', 'Stout']],
  ['Volgens de legende van Orval vond een gravin haar ring terug in de bek van een…', ['Forel', 'Zwaan', 'Kikker']],
  ['In welke stad wordt Rodenbach gebrouwen?', ['Roeselare', 'Mechelen', 'Hasselt']],
  ['Waarom heeft een kwakglas een houten houder?', ['Het was een glas voor koetsiers', 'Om het bier warm te houden', 'Omdat het glas te zwaar was']],
  ['In welke streek wordt lambiek traditioneel gebrouwen?', ['Pajottenland en de Zennevallei', 'De Kempen', 'De Westhoek']],
  ['Waar wordt Jupiler gebrouwen?', ['Jupille, bij Luik', 'Leuven', 'Oudenaarde']],
  ['Welke abdij brouwt Chimay?', ['Abdij van Scourmont', 'Sint-Sixtusabdij', 'Abdij van Westmalle']],
];
const JOKES = [
  'Zegt de ene pint tegen de andere: "Gij ziet er wat schuimig uit vandaag."',
  'Waarom drinken monniken trappist? Omdat ze anders de trap niet meer op geraken.',
  'Wat zegt een geuze tegen een kriek? "Gij zijt precies wat rood aangelopen."',
  '"Ik drink er maar ene," zei Nonkel Jos. In 1987.',
  'Wat is de favoriete sport van een tapper? Schuimspringen.',
  'Een stamgast komt binnen met een ladder. "Voor de hoge schuimkraag," zegt hij.',
  'Waarom neemt een lambiek nooit de bus? Hij gist liever spontaan.',
  'Hoe noem je een bier dat altijd te laat is? Een Westvleteren: daar wacht ge op.',
];
let eventBusy = false;
const EVENTS = [
  { id: 'quiz',      w: 3,   ok: () => true },
  { id: 'rondje',    w: 2,   ok: () => S.bon > 500 },
  { id: 'politie',   w: 2,   ok: () => S.zat >= 2 },
  { id: 'dief',      w: 2,   ok: () => S.bon > 1000 },
  { id: 'tapkapot',  w: 1.5, ok: () => baseSps() > 0 && buffMult('prod') === 1 },
  { id: 'stroom',    w: 1.5, ok: () => true },
  { id: 'kermis',    w: 1.2, ok: () => baseSps() > 0 && buffMult('prod') === 1 },
  { id: 'brouwerij', w: 1.5, ok: () => true },
  { id: 'vreemde',   w: 0.6, ok: () => true },
  { id: 'mop',       w: 2,   ok: () => true },
  { id: 'hond',      w: 1.5, ok: () => S.dog.lvl >= 3 },
  { id: 'auto',      w: 2.5, ok: () => S.zat >= 3 },
  { id: 'spook',     w: 3,   ok: () => seasonActive('halloween') },
  { id: 'sint',      w: 3,   ok: () => seasonActive('sinterklaas') },
  { id: 'kerstman',  w: 1.2, ok: () => seasonActive('kerst') },
  { id: 'stoet',     w: 3,   ok: () => seasonActive('carnaval') && buffMult('prod') === 1 },
  { id: 'zomerbui',  w: 2,   ok: () => seasonActive('zomer') && buffMult('prod') === 1 },
  { id: 'vuurwerk',  w: 4,   ok: () => seasonActive('nieuwjaar') },
  { id: 'mass',      w: 2.5, ok: () => seasonActive('herfst') },
  { id: 'defile',    w: 4,   ok: () => seasonActive('nationale') && buffMult('prod') === 1 },
];
let nextEventAt = performance.now() + (90 + Math.random() * 90) * 1000;
function maybeEvent(t) {
  if (t < nextEventAt) return;
  if (mgOpen || overlayOpen || puking() || document.hidden || eventBusy || drinking) { nextEventAt = t + 15000; return; }
  nextEventAt = t + (100 + Math.random() * 100) * 1000;
  const pool = EVENTS.filter(e => e.ok()), sum = pool.reduce((a, e) => a + e.w, 0);
  let x = Math.random() * sum, ev = pool[0];
  for (const e of pool) { if (x < e.w) { ev = e; break; } x -= e.w; }
  S.events++; dirty = true;
  tone(880, now(), 0.12, 'triangle', 0.1); tone(660, now() + 0.12, 0.18, 'triangle', 0.1);
  EVENT_RUN[ev.id]();
}
const income60 = k => Math.max(100, staffIncome() * k);
function choiceCard(ico, title, text, choices, tint) {
  const o = overlay(`<div class="ev-ico">${ico}</div><div class="big-t">${esc(title)}</div><div class="sub">${esc(text)}</div><div class="choices"></div>`, tint, true);
  const box = o.querySelector('.choices');
  choices.forEach(c => {
    const b = document.createElement('button');
    b.textContent = c.label; if (c.cls) b.className = c.cls;
    b.addEventListener('click', () => c.fn(b, o));
    box.appendChild(b);
  });
  return o;
}
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const EVENT_RUN = {
  quiz() {
    const [q, answers] = pick(QUIZ), right = answers[0];
    let done = false;
    choiceCard('🧠', 'Kroegquiz!', q, shuffle([...answers]).map(a => ({ label: a, fn: (b, o) => {
      if (done) return; done = true;
      const ok = a === right;
      o.querySelectorAll('.choices button').forEach(x => { if (x.textContent === right) x.className = 'right'; else if (x === b) x.className = 'wrong'; });
      if (ok) {
        S.quizRight++;
        const bon = income60(120); addBon(bon);
        const crate = Math.random() < 0.25; if (crate) addCrate('bak');
        queueToast(`🧠 Juist! +${fmt(bon)} 🎟️${crate ? ' · +1 bak bier' : ''}`); ching();
      } else { queueToast(`❌ Fout. Het was: ${right}`); tone(200, now(), 0.3, 'sawtooth', 0.08); }
      dirty = true;
      setTimeout(o.close, 1600);
    } })));
  },
  rondje() {
    const cost = Math.round(S.bon * 0.05);
    choiceCard('🍻', 'Rondje geven?', `Het café zit vol stamgasten. Een rondje kost je ${fmt(cost)} bonnekes, maar brengt geluk.`, [
      { label: `Rondje van de zaak! (−${fmt(cost)} 🎟️)`, cls: 'primary', fn: (b, o) => {
        S.bon = Math.max(0, S.bon - cost);
        buffs.luck = { mult: 2, until: performance.now() + 90000, name: 'Rondje-geluk ×2' };
        const xp = Math.round(xpToNext(levelInfo(S.xp).lvl) * 0.1 * xpMult()); S.xp += xp;
        queueToast(`🍻 Iedereen roept "Schol!" · +${fmt(xp)} XP · geluk ×2 voor 90 s`); startFx('beerrain', 6); fanfare(3);
        dirty = true; o.close();
      } },
      { label: 'Nee merci, ik ben krap bij kas', fn: (b, o) => { queueToast('De stamgasten kijken je scheef aan.'); o.close(); } },
    ]);
  },
  politie() {
    const drunk = S.zat >= 5;
    if (drunk) {
      const fine = Math.round(S.bon * 0.05); S.bon = Math.max(0, S.bon - fine);
      overlay(`<div class="ev-ico">🚓</div><div class="big-t">Alcoholcontrole!</div><div class="sub">De blaastest kleurt rood. Gelukkig ben je te voet, maar de agent schrijft toch een boete van ${fmt(fine)} bonnekes uit voor "openbare dronkenschap".</div>`, '#3a5aff88');
    } else {
      const bon = income60(60); addBon(bon);
      overlay(`<div class="ev-ico">🚓</div><div class="big-t">Alcoholcontrole!</div><div class="sub">Blaastest groen. De agent is zo onder de indruk dat hij je ${fmt(bon)} bonnekes toestopt. "Voor uw verstandig drinkgedrag."</div>`, '#3a5aff88');
    }
    dirty = true;
  },
  dief() {
    if (S.dog.lvl >= 5 && Math.random() < 0.5) {
      S.thieves++; const bon = Math.max(100, Math.round(S.bon * 0.02)); addBon(bon);
      overlay(`<div class="ev-ico">🐕🦹</div><div class="big-t">Bobbie grijpt in!</div><div class="sub">Een dief wilde je bonnekes stelen, maar Bobbie beet hem in zijn broek. Als excuus laat hij ${fmt(bon)} bonnekes achter.</div>`);
      dirty = true; return;
    }
    eventBusy = true;
    const b = document.createElement('button');
    b.className = 'thief'; b.setAttribute('aria-label', 'Vang de dief');
    b.innerHTML = '<span>🦹</span>';
    b.style.top = (120 + Math.random() * (innerHeight - 300)) + 'px';
    document.body.appendChild(b);
    queueToast('🦹 Een dief gaat ervandoor met je bonnekes! Tik hem!');
    let caught = false;
    b.addEventListener('click', () => {
      if (caught) return; caught = true; b.remove(); eventBusy = false;
      S.thieves++;
      const bon = Math.max(100, Math.round(S.bon * 0.02)); addBon(bon);
      queueToast(`🚓 Gevangen! Hij geeft je ${fmt(bon)} bonnekes als excuus.`); ching(); confetti(50); dirty = true;
    });
    setTimeout(() => {
      if (caught) return; b.remove(); eventBusy = false;
      const loss = Math.round(S.bon * 0.03); S.bon = Math.max(0, S.bon - loss);
      queueToast(`💸 Ontsnapt… je bent ${fmt(loss)} bonnekes kwijt.`); dirty = true;
    }, 6000);
  },
  tapkapot() {
    buffs.prod = { mult: 0.5, until: performance.now() + 60000, name: 'Tap kapot ×0,5' };
    let n = 0, fixed = false;
    const NEED = 20;
    const o = choiceCard('🔧', 'De tap is kapot!', `Je personeel drinkt maar half zo snel. Tik ${NEED} keer om de tap te repareren (8 seconden).`, [
      { label: `🔧 Repareren (0/${NEED})`, cls: 'primary', fn: b => {
        if (fixed) return;
        n++; b.textContent = `🔧 Repareren (${n}/${NEED})`; tone(300 + n * 30, now(), 0.05, 'square', 0.05);
        if (n >= NEED) {
          fixed = true; buffs.prod = null;
          const bon = income60(60); addBon(bon);
          queueToast(`🔧 Gerepareerd! De brouwer geeft je ${fmt(bon)} bonnekes.`); ching(); dirty = true; o.close();
        }
      } },
    ]);
    setTimeout(() => { if (!fixed && overlayOpen === o) { o.close(); queueToast('⏱️ Te laat: de tap blijft een minuutje kapot.'); } }, 8000);
  },
  stroom() {
    buffs.click = { mult: 5, until: performance.now() + 20000, name: 'Kaarslicht ×5' };
    document.body.classList.add('blackout');
    startFx('candle', 20);
    setTimeout(() => document.body.classList.remove('blackout'), 20000);
    queueToast('🕯️ Stroompanne! Bij kaarslicht leveren je slokken ×5 op. Drinken!');
  },
  kermis() {
    buffs.prod = { mult: 3, until: performance.now() + 120000, name: 'Kermis ×3' };
    startFx('disco', 120);
    queueToast('🎡 Kermis in het dorp! Je personeel drinkt 2 minuten ×3.');
    fanfare(3);
  },
  brouwerij() {
    const beers = shuffle([rollBeer(), rollBeer(), rollBeer(2)]);
    let done = false;
    const o = overlay(`<div class="ev-ico">🏭</div><div class="big-t">Brouwerijbezoek</div><div class="sub">De brouwer laat je één fles kiezen uit zijn kelder.</div><div class="pickrow">${beers.map((_, i) => `<button class="pick" data-i="${i}">?</button>`).join('')}</div>`, null, true);
    o.querySelectorAll('.pick').forEach(btn => btn.addEventListener('click', () => {
      if (done) return; done = true;
      const i = +btn.dataset.i, b = beers[i];
      gainPints(b, 1, 'crate');
      o.querySelector('.pickrow').innerHTML = beers.map((x, j) => `<div style="opacity:${j === i ? 1 : 0.4}">${beerCardHtml(x, j * 120)}</div>`).join('');
      o.querySelector('.sub').textContent = `Je koos ${b.name}! +${fmt(Math.round(RARITIES[b.r].xp * xpMult()))} XP`;
      fanfare(Math.max(2, b.r)); if (b.r >= 3) confetti(100, RARITIES[b.r].pal);
      const ok = document.createElement('button'); ok.className = 'ok'; ok.textContent = 'Schol!'; ok.addEventListener('click', o.close); o.appendChild(ok);
      dirty = true;
    }));
  },
  vreemde() {
    addCrate('bak');
    overlay('<div class="ev-ico">🕵️</div><div class="big-t">Een vreemde trakteert</div><div class="sub">Een man in een lange regenjas zet een bak bier op je tafel, knikt, en verdwijnt. +1 bak bier.</div>');
  },
  auto() {
    setTimeout(() => choiceCard('🚗', 'Nonkel Jos en zijn auto', 'Nonkel Jos zwaait met zijn autosleutels en wil zelf naar huis rijden. Hij heeft "maar" vijf pintjes op.', [
      { label: '🔑 Sleutels afpakken: ik ben de BOB', cls: 'primary', fn: (b, o) => {
        S.bobs++;
        const bon = income60(120), xp = Math.round(xpToNext(levelInfo(S.xp).lvl) * 0.12 * xpMult());
        addBon(bon); S.xp += xp;
        queueToast(`🚗 Held! Jos neemt de bus. +${fmt(bon)} 🎟️ · +${fmt(xp)} XP`); fanfare(3); dirty = true; o.close();
      } },
      { label: '🚶 Ik ga te voet naar huis', fn: (b, o) => {
        S.zat = Math.max(0, S.zat - 3); S.zatAt = Date.now();
        queueToast('🚶 De frisse lucht doet deugd. Zatheidsmeter −3.'); dirty = true; o.close();
      } },
      { label: '😬 Toch instappen', fn: (b, o) => {
        o.close();
        overlay('<div class="ev-ico">🚓</div><div class="big-t">Geen goed idee</div><div class="sub">Na tien meter staat de politie er al. Jos moet zijn auto laten staan en jij betaalt de taxi. Neem de volgende keer de bus, of word zelf de BOB.</div>', '#3a5aff88');
        S.bon = Math.max(0, S.bon - Math.round(S.bon * 0.03)); dirty = true;
      } },
    ]), 0);
  },
  spook() {
    eventBusy = true;
    const b = document.createElement('button');
    b.className = 'thief'; b.setAttribute('aria-label', 'Vang het spook');
    b.innerHTML = '<span>👻</span>';
    b.style.top = (120 + Math.random() * (innerHeight - 300)) + 'px';
    document.body.appendChild(b);
    queueToast('👻 Boe! Een spook zweeft door het café. Tik het!');
    let caught = false;
    b.addEventListener('click', () => {
      if (caught) return; caught = true; b.remove(); eventBusy = false;
      const bon = income60(150), xp = Math.round(xpToNext(levelInfo(S.xp).lvl) * 0.08 * xpMult());
      addBon(bon); S.xp += xp;
      queueToast(`👻 Gevangen! Het spook laat ${fmt(bon)} bonnekes en ${fmt(xp)} XP achter.`); ching(); dirty = true;
    });
    setTimeout(() => { if (!caught) { b.remove(); eventBusy = false; queueToast('👻 Het spook verdwijnt door de muur…'); } }, 6000);
  },
  sint() {
    const bon = income60(180); addBon(bon);
    startFx('rain', 6, '🍪');
    overlay(`<div class="ev-ico">🎁🐴</div><div class="big-t">De Sint komt langs!</div><div class="sub">De Sint rijdt op zijn schimmel voorbij het café en strooit pepernoten. Jij raapt er genoeg op voor ${fmt(bon)} bonnekes.</div>`, '#d43a2a88');
    dirty = true;
  },
  kerstman() {
    addCrate('krat'); startFx('rain', 6, '🎁');
    overlay('<div class="ev-ico">🎅</div><div class="big-t">Ho ho ho!</div><div class="sub">De Kerstman zet een krat bier onder de kerstboom van het café. +1 krat bier.</div>', '#12402a88');
    dirty = true;
  },
  stoet() {
    buffs.prod = { mult: 2, until: performance.now() + 60000, name: 'Carnavalsstoet ×2' };
    confetti(220); startFx('rain', 8, '🎭');
    queueToast('🎭 De carnavalsstoet trekt voorbij! Je personeel drinkt een minuut ×2.');
  },
  zomerbui() {
    buffs.prod = { mult: 2, until: performance.now() + 60000, name: 'Zomerbui ×2' };
    startFx('rain', 10, '💧');
    queueToast('🌧️ Zomerbui! Iedereen vlucht het café in. Je personeel drinkt een minuut ×2.');
  },
  vuurwerk() {
    const bon = income60(600); addBon(bon); confetti(260, ['#ffd75e', '#ff5fa2', '#5fc8ff', '#ffffff']);
    overlay(`<div class="ev-ico">🎆</div><div class="big-t">Gelukkig Nieuwjaar!</div><div class="sub">Het hele café klinkt op het nieuwe jaar. De baas trakteert: +${fmt(bon)} bonnekes.</div>`, '#ffd75e88');
    dirty = true;
  },
  mass() {
    let n = 0, done = false;
    const NEED = 25;
    const o = choiceCard('🍺', 'Maßkrugstemmen!', `Hou de zware maß zo lang mogelijk omhoog: tik ${NEED} keer in 8 seconden.`, [
      { label: `💪 Omhoog houden (0/${NEED})`, cls: 'primary', fn: b => {
        if (done) return;
        n++; b.textContent = `💪 Omhoog houden (${n}/${NEED})`; tone(200 + n * 20, now(), 0.05, 'square', 0.05);
        if (n >= NEED) {
          done = true;
          const bon = income60(240), xp = Math.round(xpToNext(levelInfo(S.xp).lvl) * 0.12 * xpMult());
          addBon(bon); S.xp += xp;
          queueToast(`🏆 Gewonnen! +${fmt(bon)} 🎟️ · +${fmt(xp)} XP`); fanfare(4); confetti(100); dirty = true; o.close();
        }
      } },
    ]);
    setTimeout(() => { if (!done && overlayOpen === o) { o.close(); queueToast('💦 De maß werd te zwaar. Volgende keer beter!'); } }, 8000);
  },
  defile() {
    buffs.prod = { mult: 3, until: performance.now() + 90000, name: 'Defilé ×3' };
    startFx('rain', 8, '🇧🇪'); fanfare(4);
    queueToast('🇧🇪 Het defilé passeert! Je personeel drinkt anderhalve minuut ×3.');
  },
  hond() {
    const x = Math.random();
    let what;
    if (x < 0.1) { addCrate('krat'); what = 'een hele krat bier'; }
    else if (x < 0.4) { addCrate('bak'); what = 'een bak bier'; }
    else { const bon = income60(180); addBon(bon); what = `een zakje met ${fmt(bon)} bonnekes`; }
    overlay(`<div class="ev-ico">${dogFace()}</div><div class="big-t">Bobbie brengt iets mee</div><div class="sub">Bobbie komt kwispelend aanlopen met ${what} in zijn bek. Brave hond!</div>`);
    dirty = true;
  },
  mop() {
    const bon = income60(20);
    choiceCard('🗣️', 'Een stamgast vertelt een mop', pick(JOKES), [
      { label: '😂 Haha!', cls: 'primary', fn: (b, o) => { addBon(bon); queueToast(`Hij is zo blij dat hij ${fmt(bon)} bonnekes geeft.`); o.close(); } },
      { label: '😐 Die kende ik al', fn: (b, o) => { queueToast('De stamgast druipt beteuterd af.'); o.close(); } },
    ]);
  },
};

// =====================================================================
// TAP COMBO, GOLDEN BUBBLES, CHALLENGES
// =====================================================================
let combo = 0, lastTapAt = 0;
const comboMult = () => 1 + Math.min(5, Math.floor(combo / 10)) * 0.5;
function renderCombo() {
  const el = $('combo');
  if (combo > 0 && performance.now() - lastTapAt > 1200) combo = 0;
  setText(el, combo >= 5 ? `🔥 Combo ${combo} · ×${comboMult().toString().replace('.', ',')}` : '');
}
let bubbleEl = null, nextBubbleAt = performance.now() + 12000;
function spawnBubble2() {
  const b = document.createElement('button');
  const egg = seasonActive('lente');
  b.className = 'gbubble'; b.setAttribute('aria-label', egg ? 'Paasei' : 'Gouden bubbel'); b.textContent = egg ? '🥚' : '✨';
  b.style.left = `calc(${35 + Math.random() * 30}% - 22px)`;
  b.addEventListener('pointerdown', e => {
    e.stopPropagation(); e.preventDefault();
    if (bubbleEl !== b) return;
    bubbleEl = null; b.remove();
    if (ch) ch.bubbles++;
    const x = Math.random();
    if (egg && x < 0.08) { addCrate('bak'); floatText(e, '🥚 +1 bak!'); }
    else if (x < 0.6) { const bon = Math.max(sipValue() * 60, staffIncome() * 20, 25) * (egg ? 2 : 1); addBon(bon); floatText(e, `+${fmt(bon)} 🎟️`); }
    else if (x < 0.9) { const xp = Math.max(5, Math.round(xpToNext(levelInfo(S.xp).lvl) * 0.04 * xpMult())); S.xp += xp; floatText(e, `+${fmt(xp)} XP`); }
    else { buffs.click = { mult: 3, until: performance.now() + 10000, name: 'Bubbelroes ×3' }; floatText(e, '×3 slokken!'); }
    wake(); tone(1400, now(), 0.08, 'sine', 0.12); tone(1800, now() + 0.06, 0.1, 'sine', 0.1);
    dirty = true;
  });
  $('stage').appendChild(b);
  bubbleEl = b;
  setTimeout(() => { if (bubbleEl === b) { b.remove(); bubbleEl = null; } }, 5000);
}

const CHALLENGES = [
  { id: 'taps',   make: () => { const g = pick([[30, 8], [40, 10], [60, 15]]); return { goal: g[0], dur: g[1], text: `Tik ${g[0]} keer op je glas in ${g[1]} s` }; }, prog: c => S.taps - c.base.taps },
  { id: 'pints',  make: () => ({ goal: 2, dur: 35, text: 'Drink 2 pintjes in 35 s' }), prog: c => c.pints },
  { id: 'combo',  make: () => ({ goal: 25, dur: 12, text: 'Haal een combo van 25 in 12 s' }), prog: c => c.maxCombo },
  { id: 'nolift', make: () => ({ goal: 1, dur: 25, text: 'Drink een volle pint zonder los te laten (25 s)' }), prog: c => c.nolift },
  { id: 'bubble', make: () => ({ goal: 1, dur: 15, text: 'Vang een gouden bubbel in 15 s' }), prog: c => c.bubbles },
];
let ch = null, nextChAt = performance.now() + 40000;
function startChallenge() {
  const def = pick(CHALLENGES), c = def.make();
  ch = { def, ...c, start: performance.now(), base: { taps: S.taps }, pints: 0, maxCombo: 0, nolift: 0, bubbles: 0 };
  if (def.id === 'bubble' && !bubbleEl) spawnBubble2();
  $('challenge').classList.remove('hidden');
  setText($('chText'), `⏱️ Uitdaging: ${ch.text}`);
  tone(990, now(), 0.1, 'square', 0.06); tone(1320, now() + 0.1, 0.12, 'square', 0.06);
}
function tickChallenge(t) {
  if (!ch) {
    if (t > nextChAt && !$('tap').hidden && !mgOpen && !overlayOpen && !puking() && current && level > 0) startChallenge();
    return;
  }
  const left = ch.dur * 1000 - (t - ch.start), prog = Math.min(ch.goal, ch.def.prog(ch));
  $('chFill').style.width = Math.max(0, left / (ch.dur * 10)) + '%';
  setText($('chProg'), `${prog} / ${ch.goal} · nog ${Math.max(0, Math.ceil(left / 1000))} s`);
  if (prog >= ch.goal) {
    S.challenges++;
    const bon = Math.max(300, staffIncome() * 60 + sipValue() * 100), xp = Math.round(xpToNext(levelInfo(S.xp).lvl) * 0.1 * xpMult());
    addBon(bon); S.xp += xp;
    queueToast(`⏱️ Uitdaging gehaald! +${fmt(bon)} 🎟️ · +${fmt(xp)} XP`);
    fanfare(4); confetti(70);
    endChallenge(t); dirty = true;
  } else if (left <= 0) {
    queueToast('⏱️ Te laat! Volgende keer beter.');
    endChallenge(t);
  }
}
function endChallenge(t) { ch = null; $('challenge').classList.add('hidden'); nextChAt = t + (70 + Math.random() * 70) * 1000; }

// =====================================================================
// SEASONS: calendar, daily gifts, welcome
// =====================================================================
const fmtMd = md => `${md[1]} ${MONTHS[md[0] - 1]}`;
function seasonGiftCrate(x) {
  const d = new Date(), m = d.getMonth() + 1, day = d.getDate();
  if (x.id === 'kerst' && m === 12 && (day === 24 || day === 25)) return 'krat';
  if (x.id === 'sinterklaas' && m === 12 && day === 6) return 'vat';
  return x.crate;
}
function renderSeasons() {
  const el = $('seasonList'); el.textContent = '';
  [...SEASONS].sort((a, b) => (seasonActive(b.id) - seasonActive(a.id)) || daysUntil(a.from) - daysUntil(b.from)).forEach(x => {
    const on = seasonActive(x.id), claimed = S.seasonGifts[x.id] === todayKey();
    const t = document.createElement('div');
    t.className = 'quest' + (on ? '' : ' claimed');
    t.style.opacity = on ? 1 : 0.6;
    t.innerHTML = '<div class="ico"></div><div class="t"><div class="n"></div><div class="m"></div></div>';
    t.querySelector('.ico').textContent = x.ico;
    t.querySelector('.n').textContent = `${x.name} · ${fmtMd(x.from)} – ${fmtMd(x.to)}`;
    const left = on ? daysUntil(x.to) : daysUntil(x.from);
    t.querySelector('.m').textContent = `${x.effTxt}. ${BEERS.filter(b => b.season === x.id).length} seizoensbier(en). ` + (on ? (left === 0 ? 'Laatste dag!' : `Nog ${left} dag${left > 1 ? 'en' : ''}.`) : `Begint over ${left} dag${left > 1 ? 'en' : ''}.`);
    if (on) {
      const b = document.createElement('button'); b.className = 'small';
      b.textContent = claimed ? 'Morgen weer' : `🎁 ${x.gift}`;
      b.disabled = claimed;
      b.addEventListener('click', () => {
        if (S.seasonGifts[x.id] === todayKey()) return;
        S.seasonGifts[x.id] = todayKey();
        const crate = seasonGiftCrate(x), bon = income60(300);
        addCrate(crate); addBon(bon);
        queueToast(`${x.ico} ${x.gift}: +1 ${CRATES[crate].label} · +${fmt(bon)} 🎟️`);
        wake(); fanfare(3); confetti(80); save(); dirty = true; renderSeasons();
      });
      t.appendChild(b);
    } else t.appendChild(document.createElement('span'));
    el.appendChild(t);
  });
}
function seasonWelcome() {
  activeSeasons.forEach(id => { if (!S.seasonsPlayed.includes(id)) { S.seasonsPlayed.push(id); dirty = true; } });
  const yr = new Date().getFullYear();
  const fresh = activeSeasons.map(id => SEASON[id]).filter(x => !S.seasonSeen.includes(`${x.id}-${yr}`));
  if (!fresh.length) return;
  fresh.forEach(x => S.seasonSeen.push(`${x.id}-${yr}`));
  const x = fresh[0], beers = BEERS.filter(b => b.season === x.id);
  setTimeout(() => {
    if (overlayOpen) { queueToast(`${x.ico} ${x.name} is begonnen!`); return; }
    overlay(`<div class="ev-ico">${x.ico}</div><div class="big-t">${esc(x.name)} is begonnen!</div><div class="sub">Van ${fmtMd(x.from)} tot ${fmtMd(x.to)}: ${esc(x.effTxt)}. Zoek de seizoensbieren${beers.length ? ` (${beers.map(b => esc(b.name)).join(', ')})` : ''} en haal elke dag je seizoensgeschenk op in de Spel-tab.</div>`);
  }, 1200);
}
