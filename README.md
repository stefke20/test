# 🍺 Pintje

A Belgian beer idle game in Dutch (Flemish). You tap and drink virtual pintjes, collect more than a hundred Belgian beers, run your own café and work your way up to Brouwmeester.

**▶️ Play:** https://claude.ai/artifact/4jJwLJMTMyrPWfAWo9L2bo (log in on claude.ai; this version has the shared leaderboard and the live café)

The game also runs as a plain static site. Open `index.html` in a browser, or serve the folder with any static host.

## Run locally

```sh
git clone https://github.com/stefke20/Pintje.git
cd Pintje
python3 -m http.server 8000   # then open http://localhost:8000
```

Progress is saved in your browser's local storage. The leaderboard and live café only work in the claude.ai version; everything else works anywhere.

## Project structure

```
index.html        page markup: header, tabs and panels
css/pintje.css    all styling, backgrounds and UI themes
js/data.js        game data: beers, rarities, glasses, themes, seasons, buildings, skills, achievements
js/state.js       save state, migrations, economy formulas, rolling beers
js/audio.js       sound effects (Web Audio, no audio files)
js/glass.js       the glass: pouring, drinking, tapping, brokken
js/effects.js     toasts, overlays, confetti, crates, golden caps, background effects
js/events.js      random events, tap combos, golden bubbles, challenges, seasons
js/features.js    Brouwmeester prestige, café dog, Bierpong, live café, Tapwedstrijd, daily quests
js/ui.js          panel rendering, navigation and progress checks
js/main.js        main loop, leaderboard and boot
```

The scripts are plain classic scripts that share one global scope, loaded in the order above. There is no build step and there are no dependencies.

For testing, open the local file with `#debug` (for example `index.html#debug`). That exposes `window.pintjeDebug` to trigger events, seasons and challenges. It is never available on the hosted version.

## Features

- **Tap & drink**: tap the glass for a sip, hold to drink, or tilt your phone. Tap combos, perfecte slokken, golden bubbles and short timed challenges.
- **Beers**: 102 beers in 16 rarity tiers, from Gewoon to Goddelijk (0.001%), plus 17 seasonal beers. Complete beer types and collection milestones for permanent bonuses.
- **Kroeg**: 14 kinds of staff and businesses earn bonnekes in the background, with 90+ upgrades and kroegsterren (a soft reset).
- **Brouwmeester**: a full prestige reset from level 25 for hopbellen, spent in a 14-node brewery tree.
- **Levels and skills**: XP from your own pints, crates, quests and minigames, and an 18-skill tree.
- **Minigames**: Tapwedstrijd (pour onto the fill line) and Bierpong.
- **Events**: kroegquiz, police check, thieves, broken tap, power cut, kermis, brewery visit, Nonkel Jos and his car, golden caps with full-screen effects.
- **Seasons**: nine yearly seasons (herfst, Halloween, Sinterklaas, kerst, oudejaar, carnaval, lente, zomer, 21 juli) with bonuses, beers, events, backgrounds and a daily gift.
- **Café life**: Bobbie the café dog, daily quests, a daily streak, crates (bak, krat, vat), clock bonuses such as happy hour.
- **Stijl**: 9 UI themes, 19 glasses and 30+ backgrounds.
- **Brokken**: drink too much and you might throw up.
- **Social**: shared leaderboard, live "who's in the café" and shout Schol! to other players (claude.ai version).

Drink met mate. 🍻
