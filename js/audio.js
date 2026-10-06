// Pintje — sound effects (Web Audio, no files).
'use strict';

// =====================================================================
// SOUND
// =====================================================================
let audio;
const ctx = () => (audio ||= new (window.AudioContext || window.webkitAudioContext)());
const now = () => { try { return ctx().currentTime; } catch (e) { return 0; } };
const wake = () => { try { ctx().resume(); } catch (e) {} };
function tone(freq, t, dur, type = 'sine', vol = 0.18) {
  try {
    const a = ctx(), o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch (e) {}
}
function gulp(pitch = 1) {
  try {
    const a = ctx(), t = a.currentTime, o = a.createOscillator(), g = a.createGain();
    o.frequency.setValueAtTime(180 * pitch, t); o.frequency.exponentialRampToValueAtTime(70 * pitch, t + 0.12);
    g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.16);
  } catch (e) {}
}
function burp() {
  try {
    const a = ctx(), t = a.currentTime;
    const o = a.createOscillator(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(95, t); o.frequency.linearRampToValueAtTime(65, t + 0.6);
    lfo.frequency.value = 28; lg.gain.value = 20; lfo.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    o.connect(g).connect(a.destination); o.start(t); lfo.start(t); o.stop(t + 0.7); lfo.stop(t + 0.7);
  } catch (e) {}
}
function fanfare(r) {
  if (r < 2) return;
  const t = now(), base = [523, 659, 784, 1047, 1319, 1568, 2093, 2637, 3136];
  base.slice(0, Math.min(base.length, 2 + Math.ceil(r * 0.55))).forEach((f, i) => tone(f, t + i * 0.08, r >= GEM ? 0.8 : 0.35, 'triangle', 0.11));
}
const ching = () => { const t = now(); tone(1320, t, 0.12, 'triangle', 0.1); tone(1760, t + 0.06, 0.18, 'triangle', 0.1); };
function noiseBuffer(a, secs) {
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * secs), a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}
function pourSound(on) {
  try {
    const a = ctx();
    if (on && !pourSound.src) {
      const src = a.createBufferSource(); src.buffer = noiseBuffer(a, 2); src.loop = true;
      const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 0.8;
      const g = a.createGain(); g.gain.value = 0.08;
      src.connect(f).connect(g).connect(a.destination); src.start();
      pourSound.src = src;
    } else if (!on && pourSound.src) { pourSound.src.stop(); pourSound.src = null; }
  } catch (e) {}
}
