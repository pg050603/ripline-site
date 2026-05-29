import { useState, useRef, useEffect, useCallback } from "react";

/* ============================================================
   RIPLINE — rip packs online, pull real cards, ship anytime.
   A self-contained pack-opening demo (fictional "APEX" card set).
   ============================================================ */

const RARITY = {
  common:    { label: "COMMON",    color: "#8b93a7", glow: "rgba(139,147,167,.5)",  tier: 0 },
  uncommon:  { label: "UNCOMMON",  color: "#3fd07a", glow: "rgba(63,208,122,.55)",  tier: 1 },
  rare:      { label: "RARE",      color: "#4d9fff", glow: "rgba(77,159,255,.6)",   tier: 2 },
  epic:      { label: "EPIC",      color: "#b06bff", glow: "rgba(176,107,255,.65)", tier: 3 },
  legendary: { label: "LEGENDARY", color: "#ffba2e", glow: "rgba(255,186,46,.75)",  tier: 4 },
  grail:     { label: "GRAIL",     color: "#ff5db5", glow: "rgba(255,93,181,.8)", tier: 5 },
};

const POOL = [
  // commons — bulk, worth pennies (this low floor is what makes a house edge possible)
  { id: "c1", name: "Ember Pup",      glyph: "🐕", rarity: "common",    value: 0.15, hue: 18  },
  { id: "c2", name: "Tide Minnow",    glyph: "🐟", rarity: "common",    value: 0.10, hue: 200 },
  { id: "c3", name: "Pebble Mole",    glyph: "🐹", rarity: "common",    value: 0.05, hue: 35  },
  { id: "c4", name: "Gust Sparrow",   glyph: "🐦", rarity: "common",    value: 0.20, hue: 165 },
  { id: "c5", name: "Spark Newt",     glyph: "🦎", rarity: "common",    value: 0.15, hue: 90  },
  { id: "c6", name: "Moss Beetle",    glyph: "🪲", rarity: "common",    value: 0.10, hue: 130 },
  // uncommons
  { id: "u1", name: "Cinder Fox",     glyph: "🦊", rarity: "uncommon",  value: 0.75, hue: 24  },
  { id: "u2", name: "Frost Hare",     glyph: "🐇", rarity: "uncommon",  value: 0.50, hue: 190 },
  { id: "u3", name: "Stone Boar",     glyph: "🐗", rarity: "uncommon",  value: 1.00, hue: 30  },
  { id: "u4", name: "Thunder Crow",   glyph: "🐦‍⬛", rarity: "uncommon", value: 1.25, hue: 260 },
  { id: "u5", name: "Reef Crab",      glyph: "🦀", rarity: "uncommon",  value: 0.60, hue: 350 },
  { id: "u6", name: "Bramble Stag",   glyph: "🦌", rarity: "uncommon",  value: 1.50, hue: 110 },
  // rares
  { id: "r1", name: "Magma Wolf",     glyph: "🐺", rarity: "rare",      value: 6,   hue: 12  },
  { id: "r2", name: "Glacier Bear",   glyph: "🐻‍❄️", rarity: "rare",     value: 8,   hue: 198 },
  { id: "r3", name: "Storm Falcon",   glyph: "🦅", rarity: "rare",      value: 12,  hue: 220 },
  { id: "r4", name: "Venom Viper",    glyph: "🐍", rarity: "rare",      value: 4,   hue: 95  },
  { id: "r5", name: "Coral Shark",    glyph: "🦈", rarity: "rare",      value: 10,  hue: 185 },
  { id: "r6", name: "Ironback Rhino", glyph: "🦏", rarity: "rare",      value: 7,   hue: 240 },
  // epics
  { id: "e1", name: "Inferno Tiger",  glyph: "🐅", rarity: "epic",      value: 45,  hue: 16  },
  { id: "e2", name: "Tempest Owl",    glyph: "🦉", rarity: "epic",      value: 30,  hue: 275 },
  { id: "e3", name: "Abyss Octopus",  glyph: "🐙", rarity: "epic",      value: 60,  hue: 290 },
  { id: "e4", name: "Titan Gorilla",  glyph: "🦍", rarity: "epic",      value: 50,  hue: 250 },
  { id: "e5", name: "Mirage Scorpion",glyph: "🦂", rarity: "epic",      value: 75,  hue: 320 },
  // legendaries
  { id: "l1", name: "Eclipse Dragon", glyph: "🐉", rarity: "legendary", value: 320, hue: 280 },
  { id: "l2", name: "Aurora Roc",     glyph: "🦚", rarity: "legendary", value: 220, hue: 175 },
  { id: "l3", name: "The Leviathan",  glyph: "🐋", rarity: "legendary", value: 480, hue: 210 },
  { id: "l4", name: "Behemoth",       glyph: "🦣", rarity: "legendary", value: 600, hue: 28  },
  // grail
  { id: "g1", name: "Genesis Wyrm",   glyph: "🐲", rarity: "grail",     value: 3200, hue: 300 },
  { id: "g2", name: "Origin Serpent", glyph: "🪬", rarity: "grail",     value: 5000, hue: 45  },
];

/* ╔══════════════════════════════════════════════════════════════╗
   ║  ►► ADD YOUR CARD ARTWORK HERE ◄◄                              ║
   ║                                                                ║
   ║  Once you OWN a card and have the right to display its photo,  ║
   ║  paste the image URL (or a data: URI) next to its id below.    ║
   ║  Leave "" to keep the emoji placeholder + "PLACEHOLDER" tag.   ║
   ║                                                                ║
   ║  e.g.  c1: "https://your-cdn.com/ember-pup.png",               ║
   ╚══════════════════════════════════════════════════════════════╝ */
const CARD_IMAGES = {
  c1: "",  // Ember Pup        · common    · Fire
  c2: "",  // Tide Minnow      · common    · Water
  c3: "",  // Pebble Mole      · common    · Ground
  c4: "",  // Gust Sparrow     · common    · Flying
  c5: "",  // Spark Newt       · common    · Electric
  c6: "",  // Moss Beetle      · common    · Grass
  u1: "",  // Cinder Fox       · uncommon  · Fire
  u2: "",  // Frost Hare       · uncommon  · Water
  u3: "",  // Stone Boar       · uncommon  · Ground
  u4: "",  // Thunder Crow     · uncommon  · Electric
  u5: "",  // Reef Crab        · uncommon  · Water
  u6: "",  // Bramble Stag     · uncommon  · Grass
  r1: "",  // Magma Wolf       · rare      · Fire
  r2: "",  // Glacier Bear     · rare      · Water
  r3: "",  // Storm Falcon     · rare      · Electric
  r4: "",  // Venom Viper      · rare      · Poison
  r5: "",  // Coral Shark      · rare      · Water
  r6: "",  // Ironback Rhino   · rare      · Metal
  e1: "",  // Inferno Tiger    · epic      · Fire
  e2: "",  // Tempest Owl      · epic      · Psychic
  e3: "",  // Abyss Octopus    · epic      · Water
  e4: "",  // Titan Gorilla    · epic      · Fighting
  e5: "",  // Mirage Scorpion  · epic      · Poison
  l1: "",  // Eclipse Dragon   · legendary · Dragon
  l2: "",  // Aurora Roc       · legendary · Psychic
  l3: "",  // The Leviathan    · legendary · Water
  l4: "",  // Behemoth         · legendary · Fighting
  g1: "",  // Genesis Wyrm     · grail     · Dragon
  g2: "",  // Origin Serpent   · grail     · Psychic
};

/* ╔══════════════════════════════════════════════════════════════╗
   ║  ►► CARD BACK ARTWORK ◄◄                                       ║
   ║                                                                ║
   ║  Every card is face-down (identical back) until it flips —     ║
   ║  standard for rip sites. Paste ONE image URL here to use a     ║
   ║  real back (e.g. your licensed Pokémon / MTG back). Leave ""   ║
   ║  to show the generic RIPLINE placeholder back below.           ║
   ║                                                                ║
   ║  e.g.  const CARD_BACK = "https://your-cdn.com/back.png";      ║
   ╚══════════════════════════════════════════════════════════════╝ */
const CARD_BACK = "";

/* ╔══════════════════════════════════════════════════════════════╗
   ║  ►► PACK WRAPPER ARTWORK ◄◄                                    ║
   ║                                                                ║
   ║  The pack "foil" visuals on the landing page. Paste an image  ║
   ║  URL (or data: URI) to use your own wrapper art; leave ""      ║
   ║  to keep the generic RIPLINE placeholder foil. If a URL fails  ║
   ║  to load, it falls back to the placeholder automatically.      ║
   ║                                                                ║
   ║  HERO_PACK_IMAGE → the big pack in the landing hero.           ║
   ║  PACK_IMAGES[id] → the small packs in the "Featured packs"     ║
   ║                    row (keys match the PACKS ids below).       ║
   ╚══════════════════════════════════════════════════════════════╝ */
const HERO_PACK_IMAGE = "";  // landing hero · "APEX · SERIES 1" pack
const PACK_IMAGES = {
  rookie:  "",  // Rookie Rip
  premium: "",  // Apex Premium
  vault:   "",  // Vault Chase
};

/* ── House RTP: the ONE knob (a house setting, not a per-roll value).
   Each open rolls a MULTIPLIER from the provably-fair hash; higher multipliers are rarer.
   The mean multiplier is normalized to HOUSE_RTP, so 1−RTP is the long-run house edge.
   Bands match common slots: Average 94–95.9%, Good 96–97.9%. Lower RTP = more profit. */
const RTP_PRESETS = { Tight: 0.90, Average: 0.95, Good: 0.97, Loose: 0.985 };
const DEFAULT_RTP = RTP_PRESETS.Average;

const PACKS = [
  {
    id: "rookie", name: "Rookie Rip", accent: "#4d9fff", price: 5, tail: 60,
    variance: "Low variance", blurb: "Frequent small returns, a gentle tail. Good for grinding.",
  },
  {
    id: "premium", name: "Apex Premium", accent: "#b06bff", price: 25, tail: 300,
    variance: "Medium variance", blurb: "Balanced swings with real epic & legendary potential.",
  },
  {
    id: "vault", name: "Vault Chase", accent: "#ffba2e", price: 100, tail: 1200,
    variance: "High variance", blurb: "Mostly busts — but monster grail jackpots up in the tail.",
  },
];

const CARDS_PER_PACK = 5;

const FAQ = [
  { q: "Are these real cards?", a: "Yes. Every hit is a genuine graded collectible held in the vault. The digital reveal just decides which real card is allocated to you — you can ship it to your door or sell it back for credit." },
  { q: "How does RIPLINE work?", a: "Top up credits, choose a pack tier, and rip. A provably-fair roll decides your pull, the cards land in your vault, and you keep, sell, or ship them whenever you like." },
  { q: "Is it actually fair?", a: "Every open is an HMAC-SHA256 roll from a server seed we commit to (publish the hash of) before you play. Rotate the seed to reveal it, then recompute any pull yourself from the seeds. The published RTP is the long-run average those rolls converge to." },
  { q: "Can I cash out instead of shipping?", a: "Yes — sell any card back to credits at a transparent rate shown before you confirm. No hidden lowball spreads." },
  { q: "Where do you ship?", a: "Cards ship sleeved, top-loaded, and tracked. International shipping is available." },
  { q: "What's the catch on odds?", a: "There isn't a hidden one. The house edge is a single public number (1 − RTP); higher multipliers are simply rarer, and the math is in the open." },
];

/* ---- multiplier engine (provably-fair, mean === HOUSE_RTP) ---- */
// Each tier owns a slice of the hash space (its probability) and an interpolated
// multiplier range. Big multipliers live in tiny slices, so they're rare by construction.
function packTiers(tail) {
  return [
    { p: 0.50,   m0: 0.00, m1: 0.20 },
    { p: 0.28,   m0: 0.20, m1: 0.70 },
    { p: 0.14,   m0: 0.70, m1: 1.30 },
    { p: 0.055,  m0: 1.30, m1: 3.00 },
    { p: 0.018,  m0: 3.00, m1: 12.0 },
    { p: 0.0055, m0: 12.0, m1: tail * 0.25 },
    { p: 0.0015, m0: tail * 0.25, m1: tail },
  ];
}
const tiersRawMean = (ts) => ts.reduce((s, t) => s + t.p * (t.m0 + t.m1) / 2, 0);
function rollMultiplier(tail, rtp, u) {
  const ts = packTiers(tail);
  const kappa = rtp / tiersRawMean(ts); // normalize so mean multiplier === rtp
  let acc = 0;
  for (const t of ts) {
    if (u < acc + t.p) { const f = (u - acc) / t.p; return kappa * (t.m0 + f * (t.m1 - t.m0)); }
    acc += t.p;
  }
  return kappa * ts[ts.length - 1].m1;
}
function chanceAtLeast(tail, rtp, X) {
  const ts = packTiers(tail);
  const kappa = rtp / tiersRawMean(ts);
  let acc = 0;
  for (const t of ts) {
    const lo = kappa * t.m0, hi = kappa * t.m1;
    if (X <= hi) { if (X <= lo) return 1 - acc; return 1 - (acc + ((X - lo) / (hi - lo)) * t.p); }
    acc += t.p;
  }
  return 0;
}
function tierName(M) {
  if (M < 0.10) return { label: "BUST", color: "#8b93a7" };
  if (M < 0.75) return { label: "LOW", color: "#8b93a7" };
  if (M < 1.00) return { label: "NEAR MISS", color: "#c9a23f" };
  if (M < 2.00) return { label: "PROFIT", color: "#3fd07a" };
  if (M < 5.00) return { label: "BIG WIN", color: "#4d9fff" };
  if (M < 20.0) return { label: "HUGE WIN", color: "#b06bff" };
  if (M < 80.0) return { label: "MASSIVE", color: "#ffba2e" };
  return { label: "JACKPOT", color: "#ff5db5" };
}
function featureRarity(M) {
  // the headline card's rarity reflects the WIN TIER (visual drama), not a fixed price
  if (M < 0.75) return "common";
  if (M < 1.0) return "uncommon";
  if (M < 2.0) return "rare";
  if (M < 5.0) return "epic";
  if (M < 20) return "legendary";
  return "grail";
}

/* ---------- helpers ---------- */
function weightedPick(weights) {
  const r = Math.random();
  let acc = 0;
  for (const k of Object.keys(weights)) {
    acc += weights[k];
    if (r <= acc) return k;
  }
  return Object.keys(weights)[Object.keys(weights).length - 1];
}
function pickCardOfRarity(rarity) {
  const opts = POOL.filter((c) => c.rarity === rarity);
  return opts[Math.floor(Math.random() * opts.length)];
}

/* ---------- provably-fair engine (commit / reveal, HMAC-SHA256) ----------
   Identical algorithm to what real pack/case sites run server-side:
     1. Server picks a secret serverSeed and publishes SHA-256(serverSeed) BEFORE you open (the commitment).
     2. You choose a clientSeed (editable) the server can't predict.
     3. Each pack has a nonce that increments per open.
     4. Each card slot i is derived from HMAC-SHA256(serverSeed, `${clientSeed}:${nonce}:${i}`).
     5. After rotating the seed, the serverSeed is revealed — hash it to confirm it matches
        the commitment, then recompute the HMACs to prove the cards were never tampered with.
   NOTE: in this front-end demo the serverSeed is generated in the browser, so it isn't truly
   trust-minimized. A production build must generate + store the seed server-side and reveal it
   only on rotation. The derivation/verification math below is exactly the real thing.            */
const enc = new TextEncoder();
const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
function randomHex(bytes) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return toHex(a.buffer);
}
async function sha256hex(str) {
  return toHex(await crypto.subtle.digest("SHA-256", enc.encode(str)));
}
async function hmac256hex(keyStr, msgStr) {
  const key = await crypto.subtle.importKey("raw", enc.encode(keyStr), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc.encode(msgStr)));
}
const floatFromHex = (hex8) => parseInt(hex8, 16) / 0x100000000; // maps to the 0..1 range

// Outcome-first generation: the hash rolls one multiplier (the "win"). The payout is
// exactly M × price — the source of truth — so RTP is identical across every pack regardless
// of the card catalogue. The pull is dressed with 4 bulk fillers + 1 feature card whose RARITY
// reflects the win tier and whose VALUE carries the payout. Pure function of the seeds, so any
// pull can be recomputed and verified once the server seed is revealed.
async function generatePackFair(pack, serverSeed, clientSeed, nonce, rtp) {
  const hMain = await hmac256hex(serverSeed, `${clientSeed}:${nonce}:M`);
  const u = floatFromHex(hMain.slice(0, 8));
  const M = rollMultiplier(pack.tail, rtp, u);
  const payout = +(M * pack.price).toFixed(2);

  const cards = [];
  let floorSum = 0;
  for (let i = 0; i < CARDS_PER_PACK - 1; i++) {
    const h = await hmac256hex(serverSeed, `${clientSeed}:${nonce}:${i}`);
    const rar = floatFromHex(h.slice(0, 8)) < 0.8 ? "common" : "uncommon";
    const opts = POOL.filter((c) => c.rarity === rar);
    const base = opts[Math.floor(floatFromHex(h.slice(8, 16)) * opts.length)];
    cards.push({ ...base, instanceId: `${base.id}-${nonce}-${i}` });
    floorSum += base.value;
  }
  floorSum = +floorSum.toFixed(2);

  const featR = featureRarity(M);
  const fopts = POOL.filter((c) => c.rarity === featR);
  const hf = await hmac256hex(serverSeed, `${clientSeed}:${nonce}:F`);
  const fbase = fopts[Math.floor(floatFromHex(hf.slice(0, 8)) * fopts.length)];
  const featValue = Math.max(+(payout - floorSum).toFixed(2), 0.02); // feature carries the win
  cards.push({ ...fbase, value: featValue, instanceId: `${fbase.id}-${nonce}-feat`, feature: true });

  cards.sort((a, b) => a.value - b.value); // low value first, the hit reveals last

  const total = +(floorSum + featValue).toFixed(2); // === payout except on deep busts
  const t = tierName(M);
  const proof = {
    hmac: hMain, u, multiplier: +M.toFixed(4), payout: total,
    tier: t.label, feature: fbase.name, rarity: featR,
  };
  return { cards, multiplier: M, payout: total, tier: t, proof };
}
const money = (n) => "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- classic TCG card data ---------- */
const TYPES = {
  Fire:     { color: "#f0612e", soft: "#ffe1d2", icon: "🔥" },
  Water:    { color: "#3d8bf0", soft: "#d6e9ff", icon: "💧" },
  Grass:    { color: "#3fae5a", soft: "#d8f3df", icon: "🍃" },
  Electric: { color: "#e7b21f", soft: "#fff3cc", icon: "⚡" },
  Psychic:  { color: "#b04fd8", soft: "#f0ddff", icon: "🔮" },
  Ground:   { color: "#c0934f", soft: "#f2e6d0", icon: "⛰️" },
  Fighting: { color: "#cc5a33", soft: "#fbdcd0", icon: "👊" },
  Poison:   { color: "#9a4fc0", soft: "#ecd9f5", icon: "☠️" },
  Metal:    { color: "#8a98a8", soft: "#e6ebf0", icon: "⚙️" },
  Dragon:   { color: "#6a72d8", soft: "#dde0ff", icon: "🐲" },
  Flying:   { color: "#79a4d4", soft: "#e2eefb", icon: "🌪️" },
};
const TYPE_OF = {
  c1: "Fire", c2: "Water", c3: "Ground", c4: "Flying", c5: "Electric", c6: "Grass",
  u1: "Fire", u2: "Water", u3: "Ground", u4: "Electric", u5: "Water", u6: "Grass",
  r1: "Fire", r2: "Water", r3: "Electric", r4: "Poison", r5: "Water", r6: "Metal",
  e1: "Fire", e2: "Psychic", e3: "Water", e4: "Fighting", e5: "Poison",
  l1: "Dragon", l2: "Psychic", l3: "Water", l4: "Fighting",
  g1: "Dragon", g2: "Psychic",
};
const TYPE_MOVES = {
  Fire:     ["Ember", "Flare Blitz", "Searing Roar"],
  Water:    ["Bubble", "Tidal Crash", "Abyssal Surge"],
  Grass:    ["Vine Whip", "Razor Leaf", "Verdant Storm"],
  Electric: ["Spark", "Thunderbolt", "Overload"],
  Psychic:  ["Confuse Ray", "Mind Shatter", "Astral Wave"],
  Ground:   ["Mud Slap", "Earth Splitter", "Tectonic Slam"],
  Fighting: ["Jab", "Seismic Toss", "Titan Crush"],
  Poison:   ["Toxic Bite", "Venom Spray", "Plague Cloud"],
  Metal:    ["Iron Tail", "Steel Wing", "Magnetic Burst"],
  Dragon:   ["Dragon Claw", "Hyper Beam", "Cataclysm"],
  Flying:   ["Gust", "Wing Slash", "Cyclone Dive"],
};
const EFFECTS = {
  Fire: "Discard 1 Energy attached to this creature.",
  Water: "The Defending creature can't retreat next turn.",
  Grass: "Heal 30 damage from this creature.",
  Electric: "Flip a coin. If heads, the Defender is Paralyzed.",
  Psychic: "The Defending creature is now Confused.",
  Ground: "This attack's damage isn't affected by Resistance.",
  Fighting: "Discard the top card of your opponent's deck.",
  Poison: "The Defending creature is now Poisoned.",
  Metal: "Reduce damage to this creature by 20 next turn.",
  Dragon: "Discard 2 Energy attached to this creature.",
  Flying: "Switch this creature with one of your Bench.",
};
const WEAK = { Fire:"Water", Water:"Grass", Grass:"Fire", Electric:"Ground", Ground:"Grass",
  Psychic:"Poison", Fighting:"Psychic", Poison:"Psychic", Metal:"Fire", Dragon:"Dragon", Flying:"Electric" };
const RESIST = { Metal:"Grass", Flying:"Fighting", Dragon:"Metal" };
const RARITY_SYM = ["●", "◆", "★", "★", "✦", "✺"];
const HP_BASE = [60, 90, 120, 170, 250, 340];
const DMG_A = [10, 20, 30, 50, 70, 90];
const DMG_B = [0, 40, 60, 90, 160, 250];

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function deriveTCG(card) {
  const t = RARITY[card.rarity].tier;
  const type = TYPE_OF[card.id] || "Fighting";
  const ty = TYPES[type];
  const hp = HP_BASE[t] + (hash(card.id) % 4) * 10;
  const stage = t <= 1 ? "Basic" : t <= 3 ? "Stage 1" : "Stage 2";
  const names = TYPE_MOVES[type];
  const attacks = [];
  attacks.push({ cost: [type], dmg: DMG_A[t], name: names[0] });
  if (t >= 1) {
    const cost = [type, type];
    for (let k = 0; k < Math.min(t - 1, 2); k++) cost.push("c");
    attacks.push({ cost, dmg: DMG_B[t], name: t >= 4 ? names[2] : names[1], text: t >= 3 ? EFFECTS[type] : "" });
  }
  const num = ("000" + (POOL.findIndex((p) => p.id === card.id) + 1)).slice(-3);
  return {
    type, ty, hp, stage, attacks,
    weakness: WEAK[type], resistance: RESIST[type] || null,
    retreat: Math.min(1 + Math.floor(t / 1.5), 4),
    sym: RARITY_SYM[t], num,
  };
}

/* ---------- tiny synth audio engine ---------- */
function useAudio(enabledRef) {
  const ctxRef = useRef(null);
  const ensure = () => {
    if (!ctxRef.current) {
      try { ctxRef.current = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { ctxRef.current = null; }
    }
    if (ctxRef.current && ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  };
  const tone = (freq, dur, type = "sine", gain = 0.18, when = 0) => {
    const ctx = ensure(); if (!ctx || !enabledRef.current) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  };
  const noise = (dur, gain = 0.25) => {
    const ctx = ensure(); if (!ctx || !enabledRef.current) return;
    const t = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1200;
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(t); src.stop(t + dur);
  };
  return {
    rip: () => { noise(0.45, 0.32); tone(140, 0.4, "sawtooth", 0.12); },
    flip: () => tone(420, 0.08, "triangle", 0.10),
    reveal: (tier) => {
      const base = 300 + tier * 120;
      tone(base, 0.14, "triangle", 0.14);
      if (tier >= 2) tone(base * 1.5, 0.16, "sine", 0.1, 0.04);
    },
    jackpot: (tier) => {
      const notes = tier >= 5 ? [523, 659, 784, 1046, 1318] : [440, 554, 659, 880];
      notes.forEach((f, i) => tone(f, 0.5, "square", 0.12, i * 0.09));
      noise(0.6, 0.2);
    },
  };
}

/* ---------- pointer-tilt holographic card ---------- */
function Card({ card, faceUp, size = "md", onClick, dim }) {
  const ref = useRef(null);
  const r = RARITY[card.rarity];
  const tcg = deriveTCG(card);
  const tierFoil = r.tier >= 2;
  const [imgErr, setImgErr] = useState(false);
  const [backErr, setBackErr] = useState(false);
  const art = CARD_IMAGES[card.id] || "";
  const showImg = art && !imgErr;
  const showBack = CARD_BACK && !backErr;
  const dims = size === "lg" ? { w: 210, h: 293, g: 60 }
    : size === "sm" ? { w: 124, h: 173, g: 34 }
    : { w: 156, h: 218, g: 44 };

  const onMove = (e) => {
    const el = ref.current; if (!el || !faceUp) return;
    const b = el.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width;
    const py = (e.clientY - b.top) / b.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 16}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 18}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const reset = () => {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mx", "50%"); el.style.setProperty("--my", "30%");
  };

  return (
    <div
      className={`flipwrap ${onClick ? "clickable" : ""}`}
      style={{ width: dims.w, height: dims.h, opacity: dim ? 0.5 : 1 }}
      onClick={onClick}
    >
      <div className={`flipinner ${faceUp ? "is-flipped" : ""}`}>
        {/* face down */}
        <div className="face back">
          {showBack ? (
            <img className="back-img" src={CARD_BACK} alt="card back" onError={() => setBackErr(true)} />
          ) : (
            <div className="back-art">
              <div className="back-guilloche" />
              <div className="back-frame">
                <div className="back-emblem"><span>R</span></div>
                <div className="back-word">RIPLINE</div>
                <div className="back-sub">· TRADING CARDS ·</div>
              </div>
              <span className="back-ph">PLACEHOLDER BACK</span>
            </div>
          )}
        </div>
        {/* face up */}
        <div
          ref={ref}
          className={`face front ${tierFoil ? "foil" : ""}`}
          onMouseMove={onMove}
          onMouseLeave={reset}
          style={{
            "--rcolor": r.color,
            "--rglow": r.glow,
            "--tcolor": tcg.ty.color,
            "--tsoft": tcg.ty.soft,
            transform: faceUp ? undefined : "none",
          }}
        >
          <div className="card-frame">
            <div className="tcg-stage">
              <span>{tcg.stage}</span>
              <span className="tcg-rar" style={{ color: r.color }}>{r.label}</span>
            </div>
            <div className="tcg-namerow">
              <span className="tcg-name">{card.name}</span>
              <span className="tcg-hp">
                <i>HP</i>{tcg.hp}
                <span className="tcg-type" style={{ background: tcg.ty.color }}>{tcg.ty.icon}</span>
              </span>
            </div>
            <div className="tcg-art" style={{ fontSize: dims.g }}>
              {showImg ? (
                <img className="tcg-img" src={art} alt={card.name} onError={() => setImgErr(true)} />
              ) : (
                <>
                  <span className="glyph">{card.glyph}</span>
                  <div className="art-glow" />
                  <span className="art-ph">PLACEHOLDER</span>
                </>
              )}
              {tierFoil && <div className="holo" />}
            </div>
            <div className="tcg-species">NO. {tcg.num} · {tcg.type} Beast · {money(card.value)}</div>
            <div className="tcg-attacks">
              {tcg.attacks.map((a, ai) => (
                <div className="tcg-atk" key={ai}>
                  <span className="atk-cost">
                    {a.cost.map((c, ci) => (
                      <span key={ci} className="edot" style={{ background: c === "c" ? "#e6e1d2" : TYPES[c].color }} />
                    ))}
                  </span>
                  <span className="atk-body">
                    <span className="atk-top"><span className="atk-name">{a.name}</span><span className="atk-dmg">{a.dmg || ""}</span></span>
                    {a.text && <span className="atk-text">{a.text}</span>}
                  </span>
                </div>
              ))}
            </div>
            <div className="tcg-info">
              <div className="ti-cell"><span>weakness</span><b>{tcg.ty && TYPES[tcg.weakness] ? TYPES[tcg.weakness].icon : "—"}×2</b></div>
              <div className="ti-cell"><span>resistance</span><b>{tcg.resistance ? `${TYPES[tcg.resistance].icon}-30` : "—"}</b></div>
              <div className="ti-cell"><span>retreat</span><b>{"○".repeat(tcg.retreat)}</b></div>
            </div>
            <div className="tcg-foot">
              <span>Illus. RIPLINE</span>
              <span>{tcg.sym} APEX · {tcg.num}/120</span>
            </div>
            {tierFoil && <div className="shine" />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- pack wrapper foil (image slot + placeholder fallback) ----------
   Renders a real wrapper image when `image` is a non-empty URL that loads;
   otherwise falls back to the generic RIPLINE foil (logo + name + count). */
function PackFoil({ image, name, count = `${CARDS_PER_PACK} CARDS`, className = "", style }) {
  const [err, setErr] = useState(false);
  const showImg = image && !err;
  return (
    <div className={`pack-foil ${className}`.trim()} style={style}>
      <div className="pack-shine" />
      {showImg ? (
        <img className="pack-img" src={image} alt={`${name} pack`} onError={() => setErr(true)} />
      ) : (
        <>
          <div className="pack-logo">R</div>
          <div className="pack-name">{name}</div>
          <div className="pack-count">{count}</div>
        </>
      )}
    </div>
  );
}

/* ---------- provably-fair panel + verifier ---------- */
function FairModal({ commitment, clientSeed, setClientSeed, nonce, revealedSeed, houseRtp, setHouseRtp, onRotate, onClose }) {
  const [vSeed, setVSeed] = useState("");
  const [vClient, setVClient] = useState(clientSeed);
  const [vNonce, setVNonce] = useState(0);
  const [vPack, setVPack] = useState(PACKS[0].id);
  const [vOut, setVOut] = useState(null);
  const [vHash, setVHash] = useState("");

  useEffect(() => { if (revealedSeed?.seed) setVSeed(revealedSeed.seed); }, [revealedSeed]);

  const runVerify = async () => {
    if (!vSeed) return;
    const pack = PACKS.find((p) => p.id === vPack);
    const res = await generatePackFair(pack, vSeed, vClient, Number(vNonce), houseRtp);
    setVOut({ ...res, price: pack.price });
    setVHash(await sha256hex(vSeed));
  };

  return (
    <div className="fair-overlay" onClick={onClose}>
      <div className="fair-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fair-x" onClick={onClose}>✕</div>
        <h2 className="fair-h">⚖ Provably Fair</h2>
        <p className="fair-p">
          Each open rolls a multiplier via <b>HMAC-SHA256(serverSeed, “clientSeed:nonce:M”)</b>. The server
          commits to <b>SHA-256(serverSeed)</b> beforehand, so it can’t change the result. Higher multipliers sit
          in tiny slices of the hash space, so they’re rare — and the mean is pinned to the house RTP.
        </p>

        <div className="fair-field" style={{ marginBottom: 12 }}>
          <label>House RTP (mean return to player · 1−RTP = house edge)</label>
          <div className="rtp-presets">
            {Object.keys(RTP_PRESETS).map((k) => (
              <button key={k} className={`rtp-preset ${houseRtp === RTP_PRESETS[k] ? "on" : ""}`} onClick={() => setHouseRtp(RTP_PRESETS[k])}>
                {k} · {(RTP_PRESETS[k] * 100).toFixed(1)}%
              </button>
            ))}
          </div>
          <div className="rtp-edge-note">current edge <b>{((1 - houseRtp) * 100).toFixed(1)}%</b></div>
        </div>

        <div className="fair-grid">
          <div className="fair-field">
            <label>Server seed — committed hash (shown before opening)</label>
            <code className="fair-code">{commitment || "…"}</code>
          </div>
          <div className="fair-field">
            <label>Your client seed (affects future opens)</label>
            <div className="fair-inline">
              <input value={clientSeed} onChange={(e) => setClientSeed(e.target.value.replace(/\s/g, ""))} />
              <button onClick={() => setClientSeed(randomHex(8))}>↻</button>
            </div>
          </div>
          <div className="fair-field">
            <label>Next nonce</label>
            <code className="fair-code">{nonce}</code>
          </div>
          <div className="fair-field">
            <label>Reveal past rolls</label>
            <button className="fair-rotate" onClick={onRotate}>Rotate &amp; reveal server seed</button>
          </div>
        </div>

        {revealedSeed && (
          <div className="fair-revealed">
            <div className="fair-rv-row"><span>revealed server seed</span><code>{revealedSeed.seed}</code></div>
            <div className="fair-rv-row"><span>its SHA-256 (must match the prior commit)</span><code>{revealedSeed.hash}</code></div>
            <div className="fair-rv-row"><span>rolls signed under it</span><code>nonce 0 – {Math.max(revealedSeed.finalNonce - 1, 0)}</code></div>
          </div>
        )}

        <div className="fair-verify">
          <div className="fair-vh">Recompute a pull</div>
          <div className="fair-vrow">
            <label>server seed</label>
            <input value={vSeed} onChange={(e) => setVSeed(e.target.value.trim())} placeholder="paste a revealed server seed" />
          </div>
          <div className="fair-vrow split">
            <div><label>client seed</label><input value={vClient} onChange={(e) => setVClient(e.target.value.trim())} /></div>
            <div><label>nonce</label><input type="number" value={vNonce} onChange={(e) => setVNonce(e.target.value)} /></div>
            <div><label>pack</label>
              <select value={vPack} onChange={(e) => setVPack(e.target.value)}>
                {PACKS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <button className="fair-run" onClick={runVerify}>Verify →</button>

          {vOut && (
            <div className="fair-result">
              <div className="fair-rhash">SHA-256(server seed) = <code>{vHash}</code></div>
              <div className="fair-vmult">
                <span className="fr-tier" style={{ color: vOut.tier.color }}>{vOut.tier.label}</span>
                <span className="fr-bigm" style={{ color: vOut.tier.color }}>{vOut.multiplier.toFixed(2)}×</span>
                <span className="fr-pay">pays {money(vOut.payout)} on {money(vOut.price)}</span>
              </div>
              {vOut.cards.map((c, i) => (
                <div className="fair-row" key={i}>
                  <span className="fr-slot">{c.feature ? "★ hit" : `slot ${i}`}</span>
                  <span className="fr-pip" style={{ background: RARITY[c.rarity].color }} />
                  <span className="fr-rar">{RARITY[c.rarity].label}</span>
                  <span className="fr-card">{c.name}</span>
                  <span className="fr-f">{money(c.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="fair-note">
          Demo note: here the server seed is generated in your browser, so it isn’t truly trust-minimised.
          In production the seed and its commitment must live server-side and only be revealed on rotation —
          the algorithm above is exactly what a real backend runs.
        </p>
      </div>
    </div>
  );
}

export default function Ripline() {
  const [screen, setScreen] = useState("intro"); // intro | store | opening | vault
  const [balance, setBalance] = useState(1000);
  const [spent, setSpent] = useState(0);
  const [vault, setVault] = useState([]);
  const [toast, setToast] = useState(null);

  // opening state
  const [activePack, setActivePack] = useState(null);
  const [pulled, setPulled] = useState([]);
  const [phase, setPhase] = useState("sealed"); // sealed | revealing | done
  const [revealed, setRevealed] = useState([]);
  const [bigHit, setBigHit] = useState(null);
  const [resolved, setResolved] = useState(false);

  // swipe-stack state
  const [di, setDi] = useState(0);            // index of the card currently on top
  const [flippedTop, setFlippedTop] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flyOut, setFlyOut] = useState(null); // null | 'keep' | 'sell'
  const [kept, setKept] = useState(0);
  const [sold, setSold] = useState(0);
  const [soldCredits, setSoldCredits] = useState(0);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);

  const soundOn = useRef(true);
  const [soundUi, setSoundUi] = useState(true);
  const audio = useAudio(soundOn);

  // provably-fair state
  const [serverSeed, setServerSeed] = useState("");
  const [serverSeedHash, setServerSeedHash] = useState("");
  const [clientSeed, setClientSeed] = useState(() => randomHex(8));
  const [nonce, setNonce] = useState(0);
  const [revealed_, setRevealedSeed] = useState(null); // {seed, hash, finalNonce}
  const [lastProof, setLastProof] = useState(null);    // {hash, clientSeed, nonce, packId}
  const [showFair, setShowFair] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);
  const [houseRtp, setHouseRtp] = useState(DEFAULT_RTP);
  const [pullOutcome, setPullOutcome] = useState(null); // {multiplier, payout, tier}
  const [wagered, setWagered] = useState(0);
  const [returned, setReturned] = useState(0);

  useEffect(() => {
    (async () => {
      const s = randomHex(32);
      setServerSeed(s);
      setServerSeedHash(await sha256hex(s));
    })();
  }, []);

  const rotateSeed = async () => {
    if (!serverSeed) return;
    setRevealedSeed({ seed: serverSeed, hash: serverSeedHash, finalNonce: nonce });
    const s = randomHex(32);
    setServerSeed(s);
    setServerSeedHash(await sha256hex(s));
    setNonce(0);
    flash("Seed rotated — previous server seed revealed for verification");
  };

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const buyAndOpen = async (pack) => {
    if (balance < pack.price) { flash("Not enough credits — top up below."); return; }
    if (!serverSeed) { flash("Initialising fair seed… try again in a moment."); return; }
    const n = nonce;
    setBalance((b) => +(b - pack.price).toFixed(2));
    setSpent((s) => +(s + pack.price).toFixed(2));
    setWagered((w) => +(w + pack.price).toFixed(2));
    const { cards, multiplier, payout, tier } = await generatePackFair(pack, serverSeed, clientSeed, n, houseRtp);
    setReturned((r) => +(r + payout).toFixed(2));
    setNonce(n + 1);
    setLastProof({ hash: serverSeedHash, clientSeed, nonce: n, packId: pack.id });
    setPullOutcome({ multiplier, payout, tier });
    setActivePack(pack);
    setPulled(cards);
    setPhase("sealed");
    setBigHit(null);
    setDi(0); setFlippedTop(false); setDragX(0); setDragging(false); setFlyOut(null);
    setKept(0); setSold(0); setSoldCredits(0);
    setScreen("opening");
  };

  const rip = () => {
    audio.rip();
    setPhase("revealing");
  };

  const triggerHits = (indices) => {
    let best = -1;
    indices.forEach((i) => { if (RARITY[pulled[i].rarity].tier > best) best = RARITY[pulled[i].rarity].tier; });
    if (best >= 3) {
      const rk = Object.keys(RARITY).find((k) => RARITY[k].tier === best);
      setBigHit({ rarity: rk, t: Date.now() });
      audio.jackpot(best);
      setTimeout(() => setBigHit(null), best >= 5 ? 3200 : 2400);
    }
  };

  const flipTop = () => {
    if (flippedTop || phase !== "revealing") return;
    audio.flip();
    audio.reveal(RARITY[pulled[di].rarity].tier);
    setFlippedTop(true);
    triggerHits([di]);
  };

  const decideCard = (action) => {
    if (!flippedTop || flyOut) return;
    const card = pulled[di];
    setFlyOut(action);
    if (action === "keep") {
      setVault((v) => [{ ...card, shipped: false }, ...v]);
      setKept((k) => k + 1);
    } else {
      const cr = +(card.value * 0.7).toFixed(2);
      setBalance((b) => +(b + cr).toFixed(2));
      setSoldCredits((s) => +(s + cr).toFixed(2));
      setSold((s) => s + 1);
    }
    setTimeout(() => {
      setFlyOut(null); setDragX(0); setFlippedTop(false);
      setDi((prev) => {
        const next = prev + 1;
        if (next >= pulled.length) setPhase("done");
        return next;
      });
    }, 360);
  };

  const sweepRest = (action) => {
    const rest = pulled.slice(di);
    if (rest.length === 0) return;
    if (action === "keep") {
      setVault((v) => [...rest.map((c) => ({ ...c, shipped: false })), ...v]);
      setKept((k) => k + rest.length);
    } else {
      const cr = +rest.reduce((s, c) => s + c.value * 0.7, 0).toFixed(2);
      setBalance((b) => +(b + cr).toFixed(2));
      setSoldCredits((s) => +(s + cr).toFixed(2));
      setSold((s) => s + rest.length);
    }
    setDi(pulled.length); setFlippedTop(false); setDragX(0); setFlyOut(null); setPhase("done");
  };

  const skipToGood = () => {
    if (flyOut) return;
    const goodIdx = pulled.reduce((mi, c, i, arr) => (c.value > arr[mi].value ? i : mi), 0);
    if (di >= goodIdx) return;
    const skipped = pulled.slice(di, goodIdx); // auto-sell the bulk below the hit
    const cr = +skipped.reduce((s, c) => s + c.value * 0.7, 0).toFixed(2);
    setBalance((b) => +(b + cr).toFixed(2));
    setSoldCredits((s) => +(s + cr).toFixed(2));
    setSold((s) => s + skipped.length);
    setDi(goodIdx); setFlippedTop(false); setDragX(0); setFlyOut(null);
    flash(`Auto-sold ${skipped.length} bulk card${skipped.length === 1 ? "" : "s"} · +${money(cr)}`);
  };

  const onDown = (e) => {
    if (flyOut) return;
    draggingRef.current = true; setDragging(true); startXRef.current = e.clientX;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  };
  const onMove = (e) => { if (!draggingRef.current) return; setDragX(e.clientX - startXRef.current); };
  const onUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false; setDragging(false);
    const dx = e.clientX - startXRef.current;
    if (!flippedTop) { if (Math.abs(dx) < 8) flipTop(); setDragX(0); return; }
    if (dx > 110) decideCard("keep");
    else if (dx < -110) decideCard("sell");
    else setDragX(0);
  };

  const total = pulled.reduce((s, c) => s + c.value, 0);

  const sellFromVault = (instanceId, value) => {
    setVault((v) => v.filter((c) => c.instanceId !== instanceId));
    setBalance((b) => +(b + value * 0.7).toFixed(2));
    flash(`Sold for ${money(+(value * 0.7).toFixed(2))}`);
  };

  const vaultValue = vault.reduce((s, c) => s + c.value, 0);
  const net = +(vaultValue + balance - 1000).toFixed(2);

  useEffect(() => {
    soundOn.current = soundUi;
  }, [soundUi]);

  return (
    <div className="rl-root">
      <style>{CSS}</style>
      <div className="bg-aurora" />
      <div className="bg-grid" />
      <div className="bg-noise" />

      {/* HEADER */}
      <header className="rl-head">
        <div className="head-inner">
        <div className="brand" onClick={() => setScreen("intro")}>
          <span className="brand-mark">R</span>
          <span className="brand-text"><span className="brand-r">RIP</span>LINE<span className="brand-sub">rip · pull · ship</span></span>
        </div>
        <nav className="rl-nav">
          <button className={`navbtn ${screen === "store" ? "on" : ""}`} onClick={() => setScreen("store")}>Store</button>
          <button className={`navbtn ${screen === "vault" ? "on" : ""}`} onClick={() => setScreen("vault")}>
            Vault {vault.length > 0 && <span className="badge">{vault.length}</span>}
          </button>
          <button className="navbtn fairbtn" onClick={() => setShowFair(true)} title="Provably fair">⚖ Fair</button>
          {wagered > 0 && (
            <div className="rtpmeter" onClick={() => setShowFair(true)} title="Realized return-to-player this session">
              RTP <b>{(returned / wagered * 100).toFixed(1)}%</b>
            </div>
          )}
          <button className="iconbtn" title="sound" onClick={() => setSoundUi((s) => !s)}>{soundUi ? "🔊" : "🔈"}</button>
          <div className="wallet">{money(balance)}</div>
        </nav>
        </div>
      </header>

      {/* INTRO / LANDING */}
      {screen === "intro" && (
        <main className="rl-main intro-main">
          {/* hero */}
          <section className="lp-hero">
            <div className="lp-hero-text">
              <div className="hero-eyebrow">REAL CARDS · PROVABLY FAIR · SHIPPED TO YOU</div>
              <h1 className="intro-title">Open packs online.<br /><span>Pull the real cards.</span></h1>
              <p className="intro-sub">
                RIPLINE packs are our own creation, filled with genuine graded cards — opened with a
                provably-fair roll you can verify yourself, then shipped to your door or sold back instantly.
              </p>
              <div className="intro-cta">
                <button className="rip-btn" style={{ "--accent": "#6be0ff", maxWidth: 220 }} onClick={() => setScreen("store")}>Start ripping →</button>
                <button className="ghostbtn" onClick={() => setShowFair(true)}>How fairness works</button>
              </div>
              <div className="hero-chips">
                <span className="hero-chip">⚖ Provably fair</span>
                <span className="hero-chip">🃏 Authentic cards</span>
                <span className="hero-chip">🪙 1 coin = $1</span>
              </div>
            </div>
            <div className="lp-hero-pack">
              <div className="peel">✦ Peel to open</div>
              <PackFoil image={HERO_PACK_IMAGE} name="APEX · SERIES 1" className="hero-foil" style={{ "--accent": "#3fd07a" }} />
            </div>
          </section>

          {/* how it works */}
          <section className="lp-section">
            <div className="section-head"><h2>How it works</h2><span className="section-note">four steps</span></div>
            <div className="how-grid">
              {[
                { n: 1, h: "Pick a pack", b: "Choose a tier — each shows its RTP, odds, and variance up front." },
                { n: 2, h: "Rip it open", b: "A provably-fair roll decides your pull. Flip each card to reveal it." },
                { n: 3, h: "Keep or sell", b: "Swipe to vault the cards you want or cash them back instantly." },
                { n: 4, h: "Ship to your door", b: "Request shipping any time — sleeved, top-loaded, and tracked." },
              ].map((s) => (
                <div className="how-card" key={s.n}>
                  <span className="how-n">{("0" + s.n).slice(-2)}</span>
                  <div className="how-h">{s.h}</div>
                  <div className="how-b">{s.b}</div>
                </div>
              ))}
            </div>
          </section>

          {/* benefits */}
          <section className="lp-section">
            <div className="section-head"><h2>An experience that feels real</h2><span className="section-note">why RIPLINE</span></div>
            <div className="benefits">
              {[
                { icon: "⚖", c: "#6be0ff", h: "Provably fair, not 'trust us'",
                  b: "Every open is an HMAC-SHA256 roll from a seed we commit to before you play. Recompute any pull from the seeds — if it doesn't match, we cheated. It always matches." },
                { icon: "📊", c: "#3fd07a", h: "Published RTP. No skimming.",
                  b: "The return-to-player is one public number, and a live meter tracks what you're actually getting. We don't quietly shave odds or pocket the difference." },
                { icon: "🃏", c: "#b06bff", h: "Real cards, yours to keep",
                  b: "Every hit is a genuine graded card held in the vault. Ship it or hold it — what you pull is what you get, no swaps or downgrades." },
                { icon: "💸", c: "#ffba2e", h: "Instant, honest buyback",
                  b: "Cash any card back at a transparent rate shown before you sell. No mystery spreads, no locked balances." },
              ].map((x) => (
                <div className="benefit" key={x.h} style={{ "--bc": x.c }}>
                  <div className="benefit-icon">{x.icon}</div>
                  <div className="benefit-h">{x.h}</div>
                  <div className="benefit-b">{x.b}</div>
                </div>
              ))}
            </div>
          </section>

          {/* featured packs */}
          <section className="lp-section">
            <div className="section-head"><h2>Featured packs</h2><span className="section-note">{PACKS.length} live now</span></div>
            <div className="feat-row">
              {PACKS.map((p) => (
                <button className="feat-pack" key={p.id} style={{ "--accent": p.accent }} onClick={() => setScreen("store")}>
                  <PackFoil image={PACK_IMAGES[p.id]} name={p.name} />
                  <div className="feat-meta"><span>{p.name}</span><span className="feat-price">{money(p.price)}</span></div>
                </button>
              ))}
            </div>
          </section>

          {/* vault / shipping */}
          <section className="lp-section">
            <div className="ship-grid">
              <div className="ship-visual">
                <div className="ship-emoji">🗄️</div>
                <span className="ship-tagline">📍 THE RIPLINE VAULT</span>
              </div>
              <div className="ship-info">
                <div className="hero-eyebrow green">REAL CARDS, REAL VAULT</div>
                <h2 className="ship-h">Held safe until you want them</h2>
                <p className="ship-sub">Every hit is a genuine card stored in the vault. Cash out instantly, or request shipping whenever you like.</p>
                <div className="ship-list">
                  {[
                    ["🃏", "Authentic graded card behind every hit"],
                    ["✨", "Near-mint condition guaranteed"],
                    ["🛡️", "Sleeved & top-loaded for protection"],
                    ["⚖️", "Every pull verifiable from the seed"],
                    ["🌍", "International shipping available"],
                  ].map(([i, t]) => (<div className="ship-item" key={t}><span className="ship-ico">{i}</span>{t}</div>))}
                </div>
              </div>
            </div>
          </section>

          {/* faq */}
          <section className="lp-section">
            <div className="section-head"><h2>Frequently asked</h2><span className="section-note">the basics</span></div>
            <div className="faq">
              {FAQ.map((f, i) => (
                <div className={`faq-item ${faqOpen === i ? "open" : ""}`} key={i}>
                  <button className="faq-q" onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}>
                    <span>{f.q}</span><span className="faq-caret">›</span>
                  </button>
                  {faqOpen === i && <div className="faq-a">{f.a}</div>}
                </div>
              ))}
            </div>
          </section>

          {/* closing cta */}
          <section className="lp-cta">
            <div className="lp-cta-spark">✦</div>
            <h2 className="lp-cta-h">Step into the rip.</h2>
            <p className="lp-cta-sub">No resealed packs. No fake cards. No guesswork — just a fair roll and real cards.</p>
            <button className="rip-btn huge" style={{ "--accent": "#6be0ff" }} onClick={() => setScreen("store")}>Start opening now</button>
          </section>
        </main>
      )}

      {/* STORE */}
      {screen === "store" && (
        <main className="rl-main">
          <section className="store-banner">
            <div>
              <div className="hero-eyebrow">SERIES 1 · APEX BEASTS · LIVE</div>
              <h1 className="store-title">Rip packs. Pull real cards.</h1>
              <p className="store-sub">
                Provably-fair odds, published RTP, instant buyback. Every hit is a real graded card —
                ship it or vault it.
              </p>
            </div>
            <button className="banner-fair" onClick={() => setShowFair(true)}>
              <span className="bf-k">RTP</span>
              <span className="bf-v">{(houseRtp * 100).toFixed(1)}%</span>
              <span className="bf-sub">{((1 - houseRtp) * 100).toFixed(1)}% edge · adjust ⚖</span>
            </button>
          </section>

          <div className="section-head">
            <h2>Choose your pack</h2>
            <span className="section-note">{PACKS.length} packs · {CARDS_PER_PACK} cards each</span>
          </div>

          <div className="pack-grid">
            {PACKS.map((p, idx) => (
              <div className="pack-card" key={p.id} style={{ "--accent": p.accent, animationDelay: `${idx * 0.08}s` }}>
                <div className="pack-shine" />
                <div className="pack-wrap">
                  <div className="pack-foil">
                    <div className="pack-logo">R</div>
                    <div className="pack-name">{p.name}</div>
                    <div className="pack-count">{CARDS_PER_PACK} CARDS</div>
                  </div>
                </div>
                <div className="pack-info">
                  <div className="pack-title">{p.name}</div>
                  <div className="pack-blurb">{p.blurb}</div>
                  <div className="rtp-row">
                    <span className="rtp-bit">RTP <b>{(houseRtp * 100).toFixed(1)}%</b></span>
                    <span className="rtp-bit edge">Edge <b>{((1 - houseRtp) * 100).toFixed(1)}%</b></span>
                    <span className="rtp-bit var">{p.variance}</span>
                  </div>
                  <div className="odds">
                    {[
                      { label: "Profit (≥1×)", X: 1 },
                      { label: "Big (≥2×)", X: 2 },
                      { label: "Huge (≥10×)", X: 10 },
                      { label: "Jackpot (≥50×)", X: 50 },
                    ].map((row) => (
                      <div className="odds-row" key={row.label}>
                        <span className="odds-label">{row.label}</span>
                        <span className="odds-pct">{fmtChance(chanceAtLeast(p.tail, houseRtp, row.X))}</span>
                      </div>
                    ))}
                  </div>
                  <button className="rip-btn" style={{ "--accent": p.accent }} onClick={() => buyAndOpen(p)}>
                    RIP · {money(p.price)}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="topup">
            <span>Demo credits · no real money</span>
            <button onClick={() => { setBalance((b) => +(b + 500).toFixed(2)); flash("+$500.00 credits"); }}>+ $500</button>
          </div>
        </main>
      )}

      {/* OPENING */}
      {screen === "opening" && activePack && (
        <main className="rl-main open-main">
          {phase === "sealed" && (
            <div className="sealed-stage">
              <div className="sealed-pack" style={{ "--accent": activePack.accent }} onClick={rip}>
                <div className="pack-shine" />
                <div className="pack-wrap big">
                  <div className="pack-foil">
                    <div className="pack-logo">R</div>
                    <div className="pack-name">{activePack.name}</div>
                    <div className="pack-count">{CARDS_PER_PACK} CARDS</div>
                  </div>
                </div>
              </div>
              <button className="rip-btn huge" style={{ "--accent": activePack.accent }} onClick={rip}>
                ✊ RIP IT OPEN
              </button>
              <div className="tap-hint">tap the pack to tear it</div>
            </div>
          )}

          {phase === "revealing" && (
            <div className="swipe-stage">
              <div className="swipe-head">
                <h2>{flippedTop ? "KEEP OR SELL?" : "TAP TO REVEAL"}</h2>
                <div className="swipe-progress">CARD {di + 1} OF {pulled.length}</div>
              </div>

              <div className="stack">
                {pulled.map((c, i) => {
                  if (i < di) return null;
                  const depth = i - di;
                  if (depth > 3) return null;
                  const isTop = depth === 0;
                  const style = isTop
                    ? {
                        transform: flyOut
                          ? `translateX(${flyOut === "keep" ? 760 : -760}px) rotate(${flyOut === "keep" ? 22 : -22}deg)`
                          : `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
                        transition: dragging ? "none" : "transform .36s ease",
                        opacity: flyOut ? 0 : 1,
                        zIndex: 30,
                      }
                    : {
                        transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.045})`,
                        opacity: depth > 2 ? 0 : 1,
                        zIndex: 30 - depth,
                      };
                  return (
                    <div
                      key={c.instanceId}
                      className={`stack-card ${isTop ? "top" : ""}`}
                      style={style}
                      onPointerDown={isTop ? onDown : undefined}
                      onPointerMove={isTop ? onMove : undefined}
                      onPointerUp={isTop ? onUp : undefined}
                      onPointerCancel={isTop ? onUp : undefined}
                    >
                      <Card card={c} faceUp={isTop ? flippedTop : false} size="lg" />
                      {isTop && flippedTop && (
                        <>
                          <div className="swipe-tag keep" style={{ opacity: Math.max(0, Math.min(1, dragX / 90)) }}>KEEP</div>
                          <div className="swipe-tag sell" style={{ opacity: Math.max(0, Math.min(1, -dragX / 90)) }}>SELL</div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {!flippedTop ? (
                <div className="tap-hint">tap the card to flip it</div>
              ) : (
                <>
                  <div className="swipe-actions">
                    <button className="swipe-btn sell" onClick={() => decideCard("sell")}>
                      ← Sell · {money(+(pulled[di].value * 0.7).toFixed(2))}
                    </button>
                    <button className="swipe-btn keep" onClick={() => decideCard("keep")}>Keep →</button>
                  </div>
                  <div className="swipe-hint">swipe right to keep · left to sell</div>
                </>
              )}

              {(() => {
                const goodIdx = pulled.reduce((mi, c, i, arr) => (c.value > arr[mi].value ? i : mi), 0);
                const hasGood = pulled[goodIdx] && RARITY[pulled[goodIdx].rarity].tier >= 2;
                if (di >= goodIdx || !hasGood) return null;
                return (
                  <button className="skip-good" onClick={skipToGood}>
                    ⏩ Skip to the good stuff
                    <span>auto-sells the {goodIdx - di} bulk card{goodIdx - di === 1 ? "" : "s"} below it</span>
                  </button>
                );
              })()}

              <div className="swipe-quick">
                <button onClick={() => sweepRest("keep")}>Keep the rest</button>
                <span>·</span>
                <button onClick={() => sweepRest("sell")}>Sell the rest</button>
              </div>
            </div>
          )}

          {phase === "done" && (
            <div className="reveal-stage">
              <div className="summary">
                {pullOutcome && (
                  <div className="mult-banner" style={{ "--tc": pullOutcome.tier.color }}>
                    <span className="mb-tier">{pullOutcome.tier.label}</span>
                    <span className="mb-mult">{pullOutcome.multiplier.toFixed(2)}×</span>
                    <span className="mb-sub">on your {money(activePack.price)} open</span>
                  </div>
                )}
                <div className="summary-line">
                  <div className="sl-block">
                    <span className="sl-k">Payout value</span>
                    <span className="sl-v">{money(total)}</span>
                  </div>
                  <div className="sl-block">
                    <span className="sl-k">Kept</span>
                    <span className="sl-v">{kept} card{kept === 1 ? "" : "s"}</span>
                  </div>
                  <div className="sl-block">
                    <span className="sl-k">Sold for</span>
                    <span className="sl-v up">{money(soldCredits)}</span>
                  </div>
                </div>

                <div className="actions">
                  <button className="act primary" onClick={() => buyAndOpen(activePack)}>
                    Rip another · {money(activePack.price)}
                  </button>
                  <button className="act" onClick={() => setScreen("store")}>Back to store</button>
                  <button className="act" onClick={() => setScreen("vault")}>View vault</button>
                </div>

                {lastProof && (
                  <div className="fairstamp" onClick={() => setShowFair(true)}>
                    <span className="fs-badge">⚖ PROVABLY FAIR</span>
                    <span className="fs-bit">nonce <b>{lastProof.nonce}</b></span>
                    <span className="fs-bit">client <b>{lastProof.clientSeed}</b></span>
                    <span className="fs-bit">commit <b>{lastProof.hash.slice(0, 16)}…</b></span>
                    <span className="fs-verify">verify ↗</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* VAULT */}
      {screen === "vault" && (
        <main className="rl-main">
          <div className="vault-head">
            <h2>YOUR VAULT</h2>
            <div className="vault-stats">
              <div className="vstat"><span>Cards</span><b>{vault.length}</b></div>
              <div className="vstat"><span>Vault value</span><b>{money(vaultValue)}</b></div>
              <div className="vstat"><span>Spent</span><b>{money(spent)}</b></div>
              <div className="vstat"><span>Net</span><b className={net >= 0 ? "up" : "down"}>{net >= 0 ? "+" : "−"}{money(Math.abs(net))}</b></div>
            </div>
          </div>

          {vault.length === 0 ? (
            <div className="empty">
              <div className="empty-glyph">🗄</div>
              <p>Your vault is empty. Go rip a pack.</p>
              <button className="rip-btn" style={{ "--accent": "#4d9fff" }} onClick={() => setScreen("store")}>Browse packs</button>
            </div>
          ) : (
            <div className="vault-grid">
              {vault.map((c) => (
                <div className="vault-item" key={c.instanceId}>
                  <Card card={c} faceUp size="sm" />
                  {c.shipped && <span className="ship-tag">📦 shipping</span>}
                  <button className="vsell" onClick={() => sellFromVault(c.instanceId, c.value)}>
                    Sell · {money(+(c.value * 0.7).toFixed(2))}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* BIG HIT FX */}
      {bigHit && (
        <div className={`bighit tier${RARITY[bigHit.rarity].tier}`} style={{ "--rcolor": RARITY[bigHit.rarity].color }}>
          <div className="rays" />
          <div className="hit-flash" />
          <div className="hit-label">{RARITY[bigHit.rarity].label} PULL!</div>
          <div className="confetti">
            {Array.from({ length: 46 }).map((_, i) => (
              <span key={i} style={{
                left: `${Math.random() * 100}%`,
                background: [RARITY[bigHit.rarity].color, "#fff", "#ffd86b", "#6be0ff"][i % 4],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1.4 + Math.random() * 1.4}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }} />
            ))}
          </div>
        </div>
      )}

      {showFair && (
        <FairModal
          commitment={serverSeedHash}
          clientSeed={clientSeed}
          setClientSeed={setClientSeed}
          nonce={nonce}
          revealedSeed={revealed_}
          houseRtp={houseRtp}
          setHouseRtp={setHouseRtp}
          onRotate={rotateSeed}
          onClose={() => setShowFair(false)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}

      <footer className="rl-foot">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="brand">
              <span className="brand-mark">R</span>
              <span className="brand-text"><span className="brand-r">RIP</span>LINE<span className="brand-sub">rip · pull · ship</span></span>
            </div>
            <p className="foot-tag">The provably-fair way to rip real cards. Built as a demo on a fictional set.</p>
            <div className="trust-bar">
              <span className="trust-chip">⚖ Provably fair</span>
              <span className="trust-chip">🃏 Real graded cards</span>
              <span className="trust-chip">🔞 18+</span>
            </div>
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <span className="foot-h">EXPLORE</span>
              <button onClick={() => setScreen("store")}>Store</button>
              <button onClick={() => setScreen("vault")}>Vault</button>
              <button onClick={() => setShowFair(true)}>Verify fairness</button>
            </div>
            <div className="foot-col">
              <span className="foot-h">LEARN</span>
              <button onClick={() => setScreen("intro")}>How it works</button>
              <button onClick={() => { setScreen("intro"); setFaqOpen(0); }}>FAQ</button>
              <button onClick={() => setShowFair(true)}>Published RTP</button>
            </div>
            <div className="foot-col">
              <span className="foot-h">LEGAL</span>
              <span className="foot-static">Privacy</span>
              <span className="foot-static">Terms</span>
              <span className="foot-static">Responsible play</span>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <div className="foot-disclaimer">RIPLINE DEALS IN AN ORIGINAL, FICTIONAL CARD SET (“APEX”). NOT AFFILIATED WITH NINTENDO, WIZARDS OF THE COAST, BANDAI, OR ANY REAL TRADING-CARD BRAND.</div>
          <div className="foot-note">© 2026 RIPLINE — demo build</div>
        </div>
      </footer>
    </div>
  );
}

function fmtChance(p) {
  if (p <= 0) return "—";
  if (p >= 0.10) return Math.round(p * 100) + "%";
  if (p >= 0.01) return (p * 100).toFixed(1) + "%";
  return "1 in " + Math.round(1 / p).toLocaleString();
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }
.rl-root {
  position: relative; min-height: 100vh; width: 100%;
  background: #07080d; color: #e9ecf5;
  font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden;
  --rcolor: #4d9fff;
  --surface: rgba(20,24,34,.62);
  --surface-2: rgba(13,16,24,.82);
  --border: rgba(255,255,255,.09);
  --border-strong: rgba(255,255,255,.16);
  --radius: 18px;
  --radius-lg: 22px;
  --shadow: 0 20px 50px -24px rgba(0,0,0,.75);
  --muted: #8b94a9;
}
.bg-aurora {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(60% 50% at 15% 0%, rgba(77,159,255,.20), transparent 70%),
    radial-gradient(55% 45% at 90% 10%, rgba(176,107,255,.18), transparent 70%),
    radial-gradient(70% 60% at 50% 110%, rgba(255,186,46,.10), transparent 70%);
  filter: saturate(1.1);
}
.bg-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: .5;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(circle at 50% 30%, #000 0%, transparent 80%);
}
.bg-noise { position: fixed; inset:0; z-index:0; pointer-events:none; opacity:.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

/* header */
.rl-head { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between;
  padding: 16px 26px; background: rgba(7,8,13,.72); backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,.07); }
.brand { font-family: 'Fredoka', sans-serif; font-size: 26px; letter-spacing: 2px; cursor: pointer; line-height: .9; position: relative; }
.brand-r { color: #ff5db5; }
.brand-sub { display:block; font-family:'Space Mono',monospace; font-size:9px; letter-spacing:4px; color:#6b7488; margin-top:2px; }
.rl-nav { display: flex; align-items: center; gap: 10px; }
.navbtn { background: transparent; border: 1px solid rgba(255,255,255,.1); color: #aeb6c9; padding: 8px 16px;
  border-radius: 999px; font-family:'Plus Jakarta Sans'; font-weight:600; font-size:13px; cursor: pointer; transition:.2s; position:relative; }
.navbtn:hover { color:#fff; border-color: rgba(255,255,255,.3); }
.navbtn.on { background:#fff; color:#07080d; border-color:#fff; }
.badge { background:#ff5db5; color:#fff; font-size:10px; border-radius:999px; padding:1px 6px; margin-left:4px; font-family:'Space Mono'; }
.iconbtn { background: transparent; border:1px solid rgba(255,255,255,.1); border-radius:999px; width:36px; height:36px; cursor:pointer; font-size:15px; }
.wallet { font-family:'Space Mono',monospace; font-weight:700; background: linear-gradient(135deg,#1a2030,#0d1018); border:1px solid rgba(255,186,46,.4);
  color:#ffd86b; padding:8px 14px; border-radius:10px; font-size:14px; box-shadow: inset 0 0 18px rgba(255,186,46,.12); }

.rl-main { position: relative; z-index: 10; max-width: 1180px; margin: 0 auto; padding: 38px 22px 90px; }

/* hero */
.hero { text-align:center; margin-bottom: 44px; }
.hero-eyebrow { font-family:'Space Mono',monospace; font-size:11px; letter-spacing:5px; color:#ff5db5; margin-bottom:14px; }
.hero-title { font-family:'Fredoka',sans-serif; font-size: clamp(40px, 8vw, 92px); line-height:.9; letter-spacing:1px; }
.hero-title span { background: linear-gradient(100deg,#4d9fff,#b06bff 45%,#ff5db5 70%,#ffba2e); -webkit-background-clip:text; background-clip:text; color: transparent; }
.hero-sub { max-width: 560px; margin: 18px auto 0; color:#9aa3b8; font-size:15px; line-height:1.6; }

/* pack store */
.pack-grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap: 24px; }
.pack-card { position: relative; background: linear-gradient(180deg, rgba(22,26,38,.9), rgba(12,14,22,.95));
  border:1px solid rgba(255,255,255,.08); border-radius:20px; padding: 22px; overflow:hidden;
  animation: rise .6s both; }
.pack-card::before { content:''; position:absolute; inset:0; border-radius:20px; padding:1px;
  background: linear-gradient(160deg, var(--accent), transparent 55%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; opacity:.6; pointer-events:none; }
@keyframes rise { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform:none; } }

.pack-wrap { display:flex; justify-content:center; margin-bottom: 18px; }
.pack-wrap.big { transform: scale(1.5); margin: 30px 0 50px; }
.pack-foil { width: 150px; height: 200px; border-radius: 12px; position: relative; overflow:hidden;
  background:
    linear-gradient(135deg, var(--accent) 0%, #0a0c14 60%),
    repeating-linear-gradient(115deg, rgba(255,255,255,.14) 0 8px, transparent 8px 18px);
  border: 1px solid rgba(255,255,255,.25);
  box-shadow: 0 18px 40px rgba(0,0,0,.55), inset 0 0 30px rgba(255,255,255,.08);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; }
.pack-foil::after { content:''; position:absolute; inset:0;
  background: linear-gradient(60deg, transparent 30%, rgba(255,255,255,.5) 50%, transparent 70%);
  transform: translateX(-120%); animation: sweep 3.5s infinite; }
@keyframes sweep { 0%,60%{ transform: translateX(-120%);} 100%{ transform: translateX(120%);} }
.pack-logo { font-family:'Fredoka'; font-size: 46px; color:#fff; text-shadow:0 2px 12px rgba(0,0,0,.5); }
.pack-name { font-family:'Fredoka'; font-size:15px; letter-spacing:1px; color:#fff; text-align:center; padding:0 8px; }
.pack-count { font-family:'Space Mono'; font-size:9px; letter-spacing:2px; color: rgba(255,255,255,.7); }
.pack-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1; }
.pack-shine { position:absolute; top:-40%; right:-30%; width:180px; height:180px; border-radius:50%;
  background: radial-gradient(circle, var(--accent), transparent 70%); opacity:.25; filter: blur(20px); pointer-events:none; }

.pack-info { position: relative; }
.pack-title { font-family:'Fredoka'; font-size:24px; letter-spacing:1px; }
.pack-blurb { color:#8b94a9; font-size:13px; margin:6px 0 12px; line-height:1.5; min-height:38px; }
.rtp-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
.rtp-bit { font-family:'Space Mono'; font-size:10px; letter-spacing:.5px; color:#8b94a9; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:7px; padding:4px 8px; }
.rtp-bit b { color:#cfd6e6; }
.rtp-bit.edge b { color:#3fd07a; }
.rtp-bit.ev b { color:#ffd86b; }
.rtp-bit.var { color:#cfd6e6; }

/* live RTP meter */
.rtpmeter { font-family:'Space Mono',monospace; font-size:12px; color:#9fb3c9; background:rgba(110,224,255,.08); border:1px solid rgba(110,224,255,.3); border-radius:10px; padding:7px 12px; cursor:pointer; }
.rtpmeter b { color:#6be0ff; }

/* RTP preset buttons */
.rtp-presets { display:flex; flex-wrap:wrap; gap:6px; }
.rtp-preset { flex:1; min-width:90px; background:#0a0d14; border:1px solid rgba(255,255,255,.14); color:#cfd6e6; border-radius:8px; padding:8px; cursor:pointer; font-family:'Space Mono'; font-size:11px; }
.rtp-preset.on { background:#6be0ff; color:#07080d; border-color:#6be0ff; font-weight:700; }
.rtp-edge-note { font-family:'Space Mono'; font-size:10px; color:#7a8197; margin-top:6px; }
.rtp-edge-note b { color:#3fd07a; }

/* multiplier banner on result */
.mult-banner { display:flex; flex-direction:column; align-items:center; gap:2px; margin-bottom:18px; padding:16px;
  border-radius:16px; background:radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--tc) 22%, transparent), transparent 70%);
  border:1px solid color-mix(in srgb, var(--tc) 45%, transparent); }
.mb-tier { font-family:'Space Mono'; font-size:12px; letter-spacing:4px; color:var(--tc); }
.mb-mult { font-family:'Fredoka'; font-size:54px; line-height:1; color:var(--tc); text-shadow:0 0 28px color-mix(in srgb, var(--tc) 60%, transparent); }
.mb-sub { font-family:'Space Mono'; font-size:11px; color:#8b94a9; }

/* verifier multiplier output */
.fair-vmult { display:flex; align-items:baseline; gap:10px; padding:8px 0 10px; flex-wrap:wrap; }
.fr-tier { font-family:'Space Mono'; font-size:11px; letter-spacing:2px; }
.fr-bigm { font-family:'Fredoka'; font-size:26px; }
.fr-pay { font-family:'Space Mono'; font-size:11px; color:#8b94a9; }

/* intro / landing */
.intro-main { max-width: 1080px; }
.intro-hero { text-align:center; padding: 30px 0 20px; }
.intro-title { font-family:'Fredoka'; font-size: clamp(38px, 7.5vw, 86px); line-height:.92; letter-spacing:1px; margin-top:12px; }
.intro-title span { background: linear-gradient(100deg,#6be0ff,#b06bff 50%,#ffba2e); -webkit-background-clip:text; background-clip:text; color:transparent; }
.intro-sub { max-width: 640px; margin: 20px auto 0; color:#9aa3b8; font-size:16px; line-height:1.65; }
.intro-cta { display:flex; gap:14px; justify-content:center; align-items:center; flex-wrap:wrap; margin-top:28px; }
.benefits { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px,1fr)); gap:18px; margin: 48px 0; }
.benefit { position:relative; background: linear-gradient(180deg, rgba(22,26,38,.85), rgba(12,14,22,.95));
  border:1px solid rgba(255,255,255,.08); border-radius:18px; padding:24px; overflow:hidden; }
.benefit::before { content:''; position:absolute; inset:0 0 auto 0; height:3px; background: var(--bc); opacity:.9; }
.benefit::after { content:''; position:absolute; top:-40px; right:-30px; width:140px; height:140px; border-radius:50%;
  background: radial-gradient(circle, var(--bc), transparent 70%); opacity:.16; filter: blur(14px); }
.benefit-icon { font-size:30px; margin-bottom:12px; filter: drop-shadow(0 0 12px var(--bc)); }
.benefit-h { font-family:'Fredoka'; font-size:20px; letter-spacing:.5px; color:#fff; margin-bottom:8px; }
.benefit-b { color:#9aa3b8; font-size:13.5px; line-height:1.6; }
.intro-strip { text-align:center; padding: 30px 20px 10px; display:flex; flex-direction:column; align-items:center; gap:6px; }
.strip-line { font-family:'Plus Jakarta Sans'; font-size:18px; color:#8b94a9; }
.strip-line b { color:#cfd6e6; }
.strip-line.big { font-family:'Fredoka'; font-size: clamp(28px,5vw,48px); color:#fff; letter-spacing:1px; margin-bottom:18px; }
.strip-line.big span { background: linear-gradient(100deg,#6be0ff,#3fd07a); -webkit-background-clip:text; background-clip:text; color:transparent; }
.odds { background: rgba(0,0,0,.3); border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:10px 12px; margin-bottom:16px; }
.odds-row { display:flex; align-items:center; gap:8px; padding:3px 0; font-size:12px; }
.odds-dot { width:8px; height:8px; border-radius:50%; flex:none; box-shadow:0 0 8px currentColor; }
.odds-label { font-family:'Space Mono'; letter-spacing:1px; color:#aab2c5; flex:1; font-size:10px; }
.odds-pct { font-family:'Space Mono'; color:#fff; font-weight:700; }

.rip-btn { width:100%; border:none; cursor:pointer; padding:14px; border-radius:12px; font-family:'Fredoka'; letter-spacing:1.5px;
  font-size:17px; color:#07080d; background: var(--accent); position:relative; overflow:hidden; transition: transform .12s, box-shadow .2s;
  box-shadow: 0 8px 24px -6px var(--accent); }
.rip-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -6px var(--accent); }
.rip-btn:active { transform: translateY(0) scale(.98); }
.rip-btn.huge { font-size:24px; padding:20px 48px; width:auto; margin-top:12px; }

.topup { display:flex; align-items:center; justify-content:center; gap:14px; margin-top:36px; color:#6b7488; font-size:12px; font-family:'Space Mono'; }
.topup button { background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.14); color:#ffd86b; padding:6px 14px; border-radius:8px; cursor:pointer; font-family:'Space Mono'; font-weight:700; }

/* opening */
.open-main { display:flex; flex-direction:column; align-items:center; min-height: 70vh; justify-content:center; }
.sealed-stage { display:flex; flex-direction:column; align-items:center; gap:14px; }
.sealed-pack { cursor:pointer; position:relative; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%,100%{ transform: translateY(0) rotate(-1deg);} 50%{ transform: translateY(-14px) rotate(1deg);} }
.tap-hint { font-family:'Space Mono'; font-size:11px; letter-spacing:2px; color:#6b7488; }

.reveal-stage { width:100%; }
.reveal-head h2 { font-family:'Fredoka'; font-size:28px; letter-spacing:2px; }
.ghostbtn { background:transparent; border:1px solid rgba(255,255,255,.2); color:#cfd6e6; padding:8px 16px; border-radius:999px; cursor:pointer; font-family:'Plus Jakarta Sans'; font-weight:600; }
.ghostbtn:hover { border-color:#fff; color:#fff; }
.card-row { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
.slot { animation: pop .4s both; }
@keyframes pop { from { opacity:0; transform: scale(.85) translateY(14px);} to { opacity:1; transform:none; } }

/* swipe stack */
.swipe-stage { display:flex; flex-direction:column; align-items:center; gap:14px; width:100%; }
.swipe-head { text-align:center; }
.swipe-head h2 { font-family:'Fredoka'; font-size:26px; letter-spacing:2px; }
.swipe-progress { font-family:'Space Mono'; font-size:11px; color:#7a8197; letter-spacing:3px; margin-top:4px; }
.stack { position:relative; width:210px; height:293px; margin:6px 0; }
.stack-card { position:absolute; inset:0; will-change:transform; }
.stack-card.top { cursor:grab; touch-action:none; }
.stack-card.top:active { cursor:grabbing; }
.swipe-tag { position:absolute; top:20px; font-family:'Fredoka'; font-size:26px; letter-spacing:2px; padding:3px 12px; border:3px solid; border-radius:8px; pointer-events:none; z-index:6; }
.swipe-tag.keep { right:10px; transform:rotate(12deg); color:#3fd07a; border-color:#3fd07a; text-shadow:0 0 12px rgba(63,208,122,.5); }
.swipe-tag.sell { left:10px; transform:rotate(-12deg); color:#ff6a7a; border-color:#ff6a7a; text-shadow:0 0 12px rgba(255,106,122,.5); }
.swipe-actions { display:flex; gap:12px; }
.swipe-btn { border:1.5px solid; background:transparent; padding:12px 22px; border-radius:12px; font-family:'Plus Jakarta Sans'; font-weight:700; font-size:15px; cursor:pointer; transition:.15s; }
.swipe-btn.keep { color:#3fd07a; border-color:rgba(63,208,122,.5); }
.swipe-btn.keep:hover { background:rgba(63,208,122,.14); transform:translateY(-2px); }
.swipe-btn.sell { color:#ff6a7a; border-color:rgba(255,106,122,.5); }
.swipe-btn.sell:hover { background:rgba(255,106,122,.14); transform:translateY(-2px); }
.swipe-hint { font-family:'Space Mono'; font-size:10px; color:#6b7488; letter-spacing:1px; }
.skip-good { display:flex; flex-direction:column; align-items:center; gap:2px; cursor:pointer;
  background:linear-gradient(135deg, rgba(255,186,46,.16), rgba(255,93,181,.12)); border:1px solid rgba(255,186,46,.45);
  color:#ffd86b; border-radius:12px; padding:11px 20px; font-family:'Fredoka'; letter-spacing:1px; font-size:16px; transition:.15s; }
.skip-good:hover { transform:translateY(-2px); border-color:rgba(255,186,46,.8); box-shadow:0 8px 22px -8px rgba(255,186,46,.5); }
.skip-good span { font-family:'Space Mono'; font-size:9px; letter-spacing:1px; color:#a98c4e; text-transform:none; }
.swipe-quick { display:flex; gap:10px; align-items:center; font-family:'Space Mono'; font-size:11px; color:#5a6275; margin-top:2px; }
.swipe-quick button { background:none; border:none; color:#8b94a9; cursor:pointer; text-decoration:underline; font-family:'Space Mono'; font-size:11px; }
.swipe-quick button:hover { color:#cfd6e6; }

/* card flip */
.flipwrap { perspective: 1000px; }
.flipwrap.clickable { cursor:pointer; }
.flipinner { position:relative; width:100%; height:100%; transition: transform .65s cubic-bezier(.4,.8,.3,1); transform-style: preserve-3d; }
.flipinner.is-flipped { transform: rotateY(180deg); }
.face { position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden; border-radius:12px;
  transition: opacity 0s linear .32s; } /* hard-swap which face is opaque at the flip midpoint */
.flipinner .front { opacity:0; }
.flipinner.is-flipped .front { opacity:1; }
.flipinner .back { opacity:1; }
.flipinner.is-flipped .back { opacity:0; }
.back { background: linear-gradient(150deg,#1a2030,#0a0d16); border:1px solid rgba(255,255,255,.12); display:flex; align-items:center; justify-content:center; overflow:hidden; box-shadow: 0 10px 26px rgba(0,0,0,.5); }
.back-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border-radius:12px; }
.back-art { position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:12px;
  background:
    radial-gradient(circle at 50% 38%, #20283c 0%, #0c0f18 70%),
    linear-gradient(150deg,#1a2030,#0a0d16); }
.back-guilloche { position:absolute; inset:0; opacity:.6;
  background:
    repeating-linear-gradient(45deg, rgba(110,224,255,.10) 0 1px, transparent 1px 8px),
    repeating-linear-gradient(-45deg, rgba(176,107,255,.10) 0 1px, transparent 1px 8px),
    repeating-radial-gradient(circle at 50% 38%, rgba(255,255,255,.05) 0 1px, transparent 1px 7px); }
.back-frame { position:relative; z-index:2; width:84%; height:88%; border-radius:8px;
  border:1px solid rgba(255,255,255,.28); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px;
  box-shadow: inset 0 0 0 3px rgba(0,0,0,.25), inset 0 0 28px rgba(110,224,255,.10); }
.back-frame::before, .back-frame::after { content:''; position:absolute; width:8px; height:8px; border:1px solid rgba(110,224,255,.5); }
.back-frame::before { top:5px; left:5px; border-right:none; border-bottom:none; }
.back-frame::after { bottom:5px; right:5px; border-left:none; border-top:none; }
.back-emblem { width:42%; aspect-ratio:1; border-radius:50%; display:flex; align-items:center; justify-content:center;
  background: radial-gradient(circle at 50% 32%, #33405f, #0d1018 75%); border:1.5px solid rgba(255,255,255,.3);
  box-shadow: 0 0 22px rgba(110,224,255,.3), inset 0 -3px 12px rgba(0,0,0,.55); }
.back-emblem span { font-family:'Fredoka'; font-size:32px; color:#dcefff; text-shadow:0 0 14px rgba(110,224,255,.7); }
.back-word { font-family:'Fredoka'; font-size:13px; letter-spacing:5px; color:rgba(255,255,255,.62); }
.back-sub { font-family:'Space Mono'; font-size:6px; letter-spacing:2px; color:rgba(110,224,255,.55); margin-top:-4px; }
.back-ph { position:absolute; z-index:3; bottom:6px; left:50%; transform:translateX(-50%); font-family:'Space Mono'; font-size:5.5px; letter-spacing:1.5px; color:rgba(110,224,255,.75); background:rgba(8,12,20,.7); border:1px solid rgba(110,224,255,.35); border-radius:4px; padding:1px 6px; white-space:nowrap; }
.front { transform: rotateY(180deg); }
.front .card-frame { width:100%; height:100%; border-radius:10px; padding:4px; position:relative; overflow:hidden;
  background: linear-gradient(160deg, #fbf6e8, #efe6cf);
  border:4px solid #e7d49a;
  box-shadow: 0 0 0 1px rgba(0,0,0,.45), 0 16px 34px -8px var(--rglow), inset 0 0 0 1px rgba(255,255,255,.5);
  transform: rotateX(var(--rx,0)) rotateY(var(--ry,0)); transition: transform .1s;
  display:flex; flex-direction:column; gap:2px; color:#20232c; }
.tcg-stage { display:flex; justify-content:space-between; align-items:center; font-family:'Space Mono'; font-size:6px; letter-spacing:1px; color:#6a6552; text-transform:uppercase; padding:0 1px; }
.tcg-rar { font-weight:700; }
.tcg-namerow { display:flex; justify-content:space-between; align-items:flex-end; padding:0 1px; }
.tcg-name { font-family:'Fredoka'; font-size:12px; letter-spacing:.3px; line-height:1; color:#1c1e26; }
.tcg-hp { display:flex; align-items:center; gap:2px; font-family:'Fredoka'; font-size:11px; color:#c0392b; }
.tcg-hp i { font-style:normal; font-size:6px; color:#7a4a44; margin-right:1px; }
.tcg-type { width:13px; height:13px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:8px; box-shadow: inset 0 -1px 3px rgba(0,0,0,.35), 0 1px 2px rgba(0,0,0,.3); margin-left:2px; }
.tcg-art { position:relative; height:38%; min-height:54px; display:flex; align-items:center; justify-content:center; overflow:hidden;
  border:2px solid #c8b27a; border-radius:4px;
  background: radial-gradient(circle at 50% 38%, var(--tsoft), color-mix(in srgb, var(--tcolor) 55%, #fff) 75%, color-mix(in srgb, var(--tcolor) 70%, #333)); }
.glyph { position:relative; z-index:2; filter: drop-shadow(0 4px 7px rgba(0,0,0,.4)); }
.tcg-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1; }
.art-ph { position:absolute; z-index:3; bottom:2px; right:2px; font-family:'Space Mono'; font-size:5px; letter-spacing:1px;
  color:rgba(20,20,20,.6); background:rgba(255,255,255,.6); padding:1px 3px; border-radius:3px; }
.art-glow { position:absolute; width:75%; height:75%; border-radius:50%; background: radial-gradient(circle, rgba(255,255,255,.55), transparent 70%); filter: blur(7px); }
.tcg-species { font-family:'Space Mono'; font-size:5.5px; letter-spacing:.5px; color:#6a6552; text-align:center; padding:1px 0; border-bottom:1px solid #d9cba0; }
.tcg-attacks { flex:1; display:flex; flex-direction:column; justify-content:center; gap:3px; padding:2px 1px; }
.tcg-atk { display:flex; gap:4px; align-items:flex-start; }
.atk-cost { display:flex; gap:1px; flex:none; padding-top:1px; }
.edot { width:8px; height:8px; border-radius:50%; border:1px solid rgba(0,0,0,.35); box-shadow: inset 0 -1px 1px rgba(0,0,0,.25); }
.atk-body { flex:1; min-width:0; }
.atk-top { display:flex; justify-content:space-between; align-items:baseline; gap:4px; }
.atk-name { font-family:'Plus Jakarta Sans'; font-weight:700; font-size:8px; color:#1c1e26; }
.atk-dmg { font-family:'Fredoka'; font-size:11px; color:#1c1e26; }
.atk-text { display:block; font-family:'Plus Jakarta Sans'; font-size:5.5px; line-height:1.25; color:#5c5848; margin-top:1px; }
.tcg-info { display:flex; border-top:1px solid #d9cba0; padding-top:2px; }
.ti-cell { flex:1; text-align:center; border-right:1px solid #e2d5ab; }
.ti-cell:last-child { border-right:none; }
.ti-cell span { display:block; font-family:'Space Mono'; font-size:4.5px; letter-spacing:.5px; color:#8a8264; text-transform:uppercase; }
.ti-cell b { font-size:8px; color:#33312a; }
.tcg-foot { display:flex; justify-content:space-between; font-family:'Space Mono'; font-size:5px; letter-spacing:.3px; color:#7a7460; padding:0 1px; }

/* foil / holo */
.foil .card-frame { border-color:#e9cf6a; box-shadow: 0 0 0 1px rgba(0,0,0,.45), 0 16px 36px -6px var(--rglow), 0 0 22px -2px var(--rglow), inset 0 0 0 1px rgba(255,255,255,.6); }
.holo { position:absolute; inset:0; z-index:2; pointer-events:none; mix-blend-mode: color-dodge; opacity:.5;
  background: conic-gradient(from 0deg at var(--mx,50%) var(--my,30%), #ff0080, #ffea00, #00ff8c, #00b3ff, #b400ff, #ff0080);
  background-size: 200% 200%; animation: foilmove 5s linear infinite; }
@keyframes foilmove { 0%{ background-position:0% 0%;} 100%{ background-position:200% 200%;} }
.shine { position:absolute; z-index:5; inset:0; border-radius:8px; pointer-events:none;
  background: radial-gradient(circle at var(--mx,50%) var(--my,30%), rgba(255,255,255,.6), transparent 42%); mix-blend-mode: screen; opacity:.7; }

/* summary */
.summary { margin-top:34px; }
.summary-line { display:flex; gap:30px; justify-content:center; margin-bottom:22px; flex-wrap:wrap;
  background: rgba(0,0,0,.3); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:18px 28px; }
.sl-block { display:flex; flex-direction:column; align-items:center; }
.sl-k { font-family:'Space Mono'; font-size:10px; letter-spacing:2px; color:#7a8197; }
.sl-v { font-family:'Fredoka'; font-size:26px; }
.sl-v.dim { color:#8b94a9; } .sl-v.up { color:#3fd07a; } .sl-v.down { color:#ff6a7a; }
.actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
.act { border:1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.05); color:#e9ecf5; padding:13px 22px; border-radius:12px; cursor:pointer; font-family:'Plus Jakarta Sans'; font-weight:600; font-size:14px; transition:.18s; }
.act:hover { transform: translateY(-2px); border-color:#fff; }
.act.primary { background:#fff; color:#07080d; border-color:#fff; }
.act.sell { border-color: rgba(255,186,46,.45); color:#ffd86b; }

/* vault */
.vault-head { margin-bottom:26px; }
.vault-head h2 { font-family:'Fredoka'; font-size:34px; letter-spacing:2px; margin-bottom:14px; }
.vault-stats { display:flex; gap:14px; flex-wrap:wrap; }
.vstat { background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:12px 20px; min-width:120px; }
.vstat span { display:block; font-family:'Space Mono'; font-size:10px; letter-spacing:2px; color:#7a8197; margin-bottom:4px; }
.vstat b { font-family:'Fredoka'; font-size:22px; }
.up { color:#3fd07a; } .down { color:#ff6a7a; }
.vault-grid { display:flex; gap:18px; flex-wrap:wrap; }
.vault-item { display:flex; flex-direction:column; align-items:center; gap:8px; position:relative; }
.ship-tag { font-family:'Space Mono'; font-size:9px; color:#6be0ff; }
.vsell { background: rgba(255,186,46,.1); border:1px solid rgba(255,186,46,.35); color:#ffd86b; padding:5px 10px; border-radius:8px; cursor:pointer; font-family:'Space Mono'; font-size:10px; }
.vsell:hover { background: rgba(255,186,46,.2); }
.empty { text-align:center; padding:60px 20px; }
.empty-glyph { font-size:60px; opacity:.5; } .empty p { color:#8b94a9; margin:14px 0 20px; }

/* big hit fx */
.bighit { position: fixed; inset:0; z-index:60; pointer-events:none; display:flex; align-items:center; justify-content:center; }
.rays { position:absolute; width:200vmax; height:200vmax; left:50%; top:50%; transform: translate(-50%,-50%);
  background: repeating-conic-gradient(from 0deg, var(--rcolor) 0deg 6deg, transparent 6deg 14deg);
  opacity:.16; animation: spin 9s linear infinite; }
@keyframes spin { to { transform: translate(-50%,-50%) rotate(360deg); } }
.hit-flash { position:absolute; inset:0; background: radial-gradient(circle, var(--rcolor), transparent 60%); opacity:0; animation: flash .6s ease-out; }
@keyframes flash { 0%{ opacity:.6;} 100%{ opacity:0;} }
.hit-label { font-family:'Fredoka'; font-size: clamp(40px,9vw,100px); letter-spacing:3px; color:#fff;
  text-shadow: 0 0 30px var(--rcolor), 0 0 60px var(--rcolor); animation: hitpop .5s cubic-bezier(.2,1.4,.4,1) both; }
@keyframes hitpop { from { opacity:0; transform: scale(.4);} to { opacity:1; transform: scale(1);} }
.tier5 .hit-label { background: linear-gradient(90deg,#ff0080,#ffea00,#00ff8c,#00b3ff,#b400ff); -webkit-background-clip:text; background-clip:text; color:transparent; }
.confetti { position:absolute; inset:0; overflow:hidden; }
.confetti span { position:absolute; top:-20px; width:9px; height:14px; border-radius:2px; animation: fall linear forwards; }
@keyframes fall { to { transform: translateY(110vh) rotate(720deg); opacity:.2; } }

.toast { position: fixed; bottom: 28px; left:50%; transform: translateX(-50%); z-index:70;
  background: rgba(18,22,32,.95); border:1px solid rgba(255,255,255,.16); color:#fff; padding:12px 22px; border-radius:12px;
  font-family:'Plus Jakarta Sans'; font-weight:600; font-size:14px; box-shadow:0 14px 40px rgba(0,0,0,.5); animation: rise .3s both; }
.rl-foot { position:relative; z-index:10; text-align:center; padding:26px; color:#5a6275; font-family:'Space Mono'; font-size:11px; letter-spacing:1px; }

/* provably fair */
.fairbtn { border-color: rgba(110,224,255,.4); color:#6be0ff; }
.fairstamp { display:flex; flex-wrap:wrap; align-items:center; gap:10px; justify-content:center; margin-top:18px; cursor:pointer;
  background: rgba(110,224,255,.06); border:1px solid rgba(110,224,255,.25); border-radius:12px; padding:10px 16px; font-family:'Space Mono'; font-size:10px; color:#9fb3c9; transition:.18s; }
.fairstamp:hover { border-color: rgba(110,224,255,.55); }
.fs-badge { color:#6be0ff; letter-spacing:1.5px; font-weight:700; }
.fs-bit b { color:#e9ecf5; }
.fs-verify { color:#6be0ff; margin-left:auto; }

.fair-overlay { position:fixed; inset:0; z-index:80; background:rgba(4,5,9,.78); backdrop-filter:blur(6px); display:flex; align-items:flex-start; justify-content:center; padding:30px 16px; overflow-y:auto; animation: rise .25s both; }
.fair-modal { position:relative; width:100%; max-width:620px; background:linear-gradient(180deg,#13161f,#0b0d14); border:1px solid rgba(255,255,255,.12); border-radius:18px; padding:26px; box-shadow:0 30px 80px rgba(0,0,0,.6); }
.fair-x { position:absolute; top:16px; right:18px; cursor:pointer; color:#8b94a9; font-size:16px; }
.fair-x:hover { color:#fff; }
.fair-h { font-family:'Fredoka'; font-size:26px; letter-spacing:1px; }
.fair-p { color:#9aa3b8; font-size:13px; line-height:1.6; margin:8px 0 18px; }
.fair-p b { color:#cfe6ff; font-weight:600; }
.fair-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.fair-field { background:rgba(0,0,0,.3); border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:10px 12px; }
.fair-field label { display:block; font-family:'Space Mono'; font-size:9px; letter-spacing:1px; color:#7a8197; text-transform:uppercase; margin-bottom:6px; }
.fair-code { display:block; font-family:'Space Mono'; font-size:12px; color:#e9ecf5; word-break:break-all; }
.fair-inline { display:flex; gap:6px; }
.fair-inline input { flex:1; }
.fair-modal input, .fair-modal select { width:100%; background:#0a0d14; border:1px solid rgba(255,255,255,.14); color:#e9ecf5; border-radius:8px; padding:7px 9px; font-family:'Space Mono'; font-size:12px; }
.fair-inline button, .fair-rotate { background:rgba(110,224,255,.12); border:1px solid rgba(110,224,255,.4); color:#6be0ff; border-radius:8px; cursor:pointer; font-family:'Space Mono'; font-weight:700; }
.fair-inline button { width:34px; flex:none; }
.fair-rotate { width:100%; padding:7px; font-size:11px; }
.fair-revealed { margin-top:14px; background:rgba(63,208,122,.06); border:1px solid rgba(63,208,122,.25); border-radius:10px; padding:12px; }
.fair-rv-row { display:flex; flex-direction:column; gap:2px; margin-bottom:8px; }
.fair-rv-row:last-child { margin-bottom:0; }
.fair-rv-row span { font-family:'Space Mono'; font-size:9px; letter-spacing:1px; color:#7fae93; text-transform:uppercase; }
.fair-rv-row code { font-family:'Space Mono'; font-size:11px; color:#cfe9d8; word-break:break-all; }
.fair-verify { margin-top:18px; border-top:1px solid rgba(255,255,255,.08); padding-top:16px; }
.fair-vh { font-family:'Fredoka'; font-size:16px; letter-spacing:1px; margin-bottom:12px; }
.fair-vrow { margin-bottom:10px; }
.fair-vrow label { display:block; font-family:'Space Mono'; font-size:9px; letter-spacing:1px; color:#7a8197; text-transform:uppercase; margin-bottom:4px; }
.fair-vrow.split { display:grid; grid-template-columns:1fr 80px 1.2fr; gap:8px; }
.fair-run { background:#6be0ff; color:#07080d; border:none; border-radius:9px; padding:10px 22px; font-family:'Fredoka'; letter-spacing:1px; cursor:pointer; font-size:15px; }
.fair-result { margin-top:14px; background:rgba(0,0,0,.35); border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:12px; }
.fair-rhash { font-family:'Space Mono'; font-size:10px; color:#9aa3b8; word-break:break-all; margin-bottom:10px; }
.fair-rhash code { color:#e9ecf5; }
.fair-row { display:flex; align-items:center; gap:8px; padding:4px 0; font-family:'Space Mono'; font-size:11px; border-top:1px solid rgba(255,255,255,.05); }
.fr-slot { color:#7a8197; width:46px; }
.fr-pip { width:9px; height:9px; border-radius:50%; flex:none; }
.fr-rar { width:78px; color:#cfd6e6; }
.fr-card { flex:1; color:#fff; }
.fr-f { color:#6b7488; }
.fair-note { margin-top:18px; color:#6b7488; font-size:11px; line-height:1.55; font-style:italic; }

@media (max-width: 560px) {
  .hero-title { font-size: 44px; }
  .summary-line { gap:18px; padding:14px; }
  .pack-wrap.big { transform: scale(1.25); }
  .fair-grid { grid-template-columns:1fr; }
  .fair-vrow.split { grid-template-columns:1fr; }
}

/* ============ clean-interface polish layer ============ */
/* type weight: Fredoka reads friendly at 600; push the big display moments to 700 */
.brand-mark, .brand-text, .hero-title, .intro-title, .store-title, .mb-mult, .fr-bigm,
.bf-v, .pack-logo, .vault-head h2, .fair-h, .hit-label, .mb-tier { font-weight:700; }
.hero-title, .intro-title, .store-title, .hit-label, .mb-mult { letter-spacing:-0.5px; }
.rl-root ::selection { background: rgba(110,224,255,.3); color:#fff; }
.rl-root ::-webkit-scrollbar { width:10px; height:10px; }
.rl-root ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.12); border-radius:8px; border:2px solid transparent; background-clip:content-box; }
.rl-root ::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,.22); background-clip:content-box; }

/* header */
.rl-head { padding: 12px 22px; background: rgba(7,8,13,.78); }
.rl-head::after { content:''; position:absolute; left:0; right:0; bottom:0; height:1px;
  background: linear-gradient(90deg, transparent, rgba(110,224,255,.5), rgba(176,107,255,.4), transparent); }
.head-inner { width:100%; max-width:1180px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.brand { display:flex; align-items:center; gap:10px; }
.brand-mark { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center;
  font-family:'Fredoka'; font-size:22px; color:#07080d; background:linear-gradient(135deg,#6be0ff,#b06bff);
  box-shadow:0 6px 16px -4px rgba(110,224,255,.6); }
.brand-text { display:flex; flex-direction:column; font-family:'Fredoka'; font-size:22px; letter-spacing:1.5px; line-height:.95; }
.brand-r { color:#ff5db5; }

/* unified panels */
.pack-card, .benefit, .summary-line, .vstat, .vault-item, .empty {
  background: var(--surface); border:1px solid var(--border); box-shadow: var(--shadow);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.pack-card { border-radius: var(--radius-lg); }
.odds, .rtp-bit, .fair-field, .fair-result, .fair-revealed { border-radius:12px; }

/* store banner + section head */
.store-banner { display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap;
  background: linear-gradient(135deg, rgba(77,159,255,.10), rgba(176,107,255,.08));
  border:1px solid var(--border); border-radius: var(--radius-lg); padding:26px 28px; margin-bottom:30px; position:relative; overflow:hidden; }
.store-banner::after { content:''; position:absolute; top:-60px; right:-40px; width:240px; height:240px; border-radius:50%;
  background:radial-gradient(circle, rgba(110,224,255,.18), transparent 70%); filter:blur(20px); pointer-events:none; }
.store-title { font-family:'Fredoka'; font-size: clamp(28px,4.5vw,46px); letter-spacing:1px; line-height:1; margin-top:8px; }
.store-sub { color:var(--muted); font-size:14px; line-height:1.55; margin-top:10px; max-width:520px; }
.banner-fair { position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; gap:2px; cursor:pointer;
  background: var(--surface-2); border:1px solid rgba(110,224,255,.3); border-radius:16px; padding:16px 22px; min-width:130px; transition:.18s; }
.banner-fair:hover { border-color:rgba(110,224,255,.6); transform:translateY(-2px); }
.bf-k { font-family:'Space Mono'; font-size:10px; letter-spacing:3px; color:var(--muted); }
.bf-v { font-family:'Fredoka'; font-size:34px; color:#6be0ff; line-height:1; }
.bf-sub { font-family:'Space Mono'; font-size:9px; color:#7a8197; }

.section-head { display:flex; align-items:flex-end; justify-content:space-between; gap:12px; margin-bottom:18px;
  padding-bottom:12px; border-bottom:1px solid var(--border); }
.section-head h2 { font-family:'Fredoka'; font-size:22px; letter-spacing:1px; }
.section-note { font-family:'Space Mono'; font-size:11px; color:#6b7488; letter-spacing:1px; }

/* pack card internals */
.pack-card { padding:20px; }
.pack-info { display:flex; flex-direction:column; }
.pack-title { font-size:22px; }
.odds { background: var(--surface-2); border-color: var(--border); }
.rip-btn { margin-top:16px; }

/* opening: give the stage a calm focus panel */
.open-main .swipe-stage, .open-main .sealed-stage { background: var(--surface); border:1px solid var(--border);
  border-radius: var(--radius-lg); box-shadow: var(--shadow); padding:30px 26px; backdrop-filter: blur(8px); max-width:520px; width:100%; }
.open-main { gap:0; }
.summary { width:100%; max-width:520px; margin:0 auto; background: var(--surface); border:1px solid var(--border); border-radius: var(--radius-lg);
  box-shadow: var(--shadow); padding:26px; backdrop-filter: blur(8px); }
.summary-line { background: var(--surface-2); box-shadow:none; }

/* vault tidy tiles */
.vault-grid { gap:16px; }
.vault-item { border-radius:16px; padding:14px 12px 12px; align-items:center; transition:.16s; }
.vault-item:hover { transform:translateY(-3px); border-color: var(--border-strong); }
.vault-head h2 { margin-bottom:16px; }
.vstat { border-radius:14px; }

/* trust-bar footer */
.rl-foot { padding:30px 22px 40px; display:flex; flex-direction:column; align-items:center; gap:14px; border-top:1px solid var(--border); margin-top:30px; }
.trust-bar { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
.trust-chip { font-family:'Space Mono'; font-size:11px; letter-spacing:.5px; color:#aeb6c9;
  background: var(--surface); border:1px solid var(--border); border-radius:999px; padding:8px 14px; }
.foot-note { font-family:'Space Mono'; font-size:10px; color:#5a6275; letter-spacing:.5px; text-align:center; }

@media (max-width: 600px) {
  .store-banner { padding:20px; }
  .banner-fair { width:100%; flex-direction:row; justify-content:center; gap:10px; }
  .open-main .swipe-stage, .open-main .sealed-stage, .summary { padding:20px 16px; }
}

/* ===================== landing page ===================== */
.intro-main { padding-top: 26px; }

/* hero */
.lp-hero { display:grid; grid-template-columns: 1.05fr .95fr; gap:40px; align-items:center; min-height:70vh; padding: 14px 0 30px; }
.lp-hero-text { text-align:left; }
.lp-hero-text .intro-title { text-align:left; margin-top:14px; font-size: clamp(38px,5.2vw,68px); }
.lp-hero-text .intro-sub { text-align:left; margin:18px 0 0; max-width:520px; font-size:16px; }
.lp-hero-text .intro-cta { justify-content:flex-start; margin-top:26px; }
.hero-chips { display:flex; flex-wrap:wrap; gap:10px; margin-top:24px; }
.hero-chip { font-family:'Space Mono'; font-size:11px; letter-spacing:.5px; color:#aeb6c9;
  background:var(--surface); border:1px solid var(--border); border-radius:999px; padding:9px 15px; }
.lp-hero-pack { position:relative; display:flex; flex-direction:column; align-items:center; gap:18px; }
.lp-hero-pack::after { content:''; position:absolute; inset:-30px; z-index:0;
  background: radial-gradient(circle at 50% 45%, rgba(63,208,122,.30), transparent 62%); filter:blur(16px); }
.peel { position:relative; z-index:2; font-family:'Plus Jakarta Sans'; font-weight:600; font-size:15px; color:#d3dae9; display:flex; align-items:center; gap:8px; }
.hero-foil { position:relative; z-index:1; width:262px; height:352px;
  box-shadow: 0 40px 80px -28px rgba(63,208,122,.55), 0 0 0 1px rgba(255,255,255,.06);
  animation: floaty 5s ease-in-out infinite; }
@keyframes floaty { 0%,100%{ transform:rotate(-3deg) translateY(0);} 50%{ transform:rotate(-3deg) translateY(-14px);} }

/* generic section */
.lp-section { margin: 68px 0; }
.lp-section .benefits { margin:0; }

/* how it works */
.how-grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(210px,1fr)); gap:16px; }
.how-card { position:relative; overflow:hidden; background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius); padding:22px 22px 22px 26px; box-shadow:var(--shadow); }
.how-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:linear-gradient(#6be0ff,#b06bff); }
.how-n { font-family:'Space Mono'; font-weight:700; font-size:13px; color:#6be0ff; letter-spacing:2px; }
.how-h { font-family:'Fredoka'; font-weight:700; font-size:18px; margin:10px 0 8px; }
.how-b { color:var(--muted); font-size:14px; line-height:1.55; }

/* featured packs row */
.feat-row { display:flex; gap:20px; overflow-x:auto; padding:6px 2px 16px; scroll-snap-type:x mandatory; }
.feat-pack { scroll-snap-align:start; flex:0 0 auto; width:172px; background:transparent; border:none; cursor:pointer;
  display:flex; flex-direction:column; gap:12px; padding:0; transition:.18s; }
.feat-pack:hover { transform:translateY(-6px); }
.feat-pack .pack-foil { width:172px; height:230px; }
.feat-meta { display:flex; align-items:center; justify-content:space-between; gap:8px; text-align:left;
  font-family:'Fredoka'; font-weight:600; font-size:14px; color:#e2e7f2; }
.feat-price { font-family:'Space Mono'; font-weight:700; font-size:13px; color:#ffd86b; }

/* vault / shipping */
.ship-grid { display:grid; grid-template-columns:1fr 1fr; gap:36px; align-items:center; }
.ship-visual { position:relative; overflow:hidden; aspect-ratio:4/3; border-radius:var(--radius-lg);
  border:1px solid var(--border); background:linear-gradient(150deg, rgba(63,208,122,.16), rgba(13,16,24,.92));
  display:flex; align-items:center; justify-content:center; }
.ship-emoji { font-size:96px; filter: drop-shadow(0 14px 34px rgba(0,0,0,.55)); }
.ship-tagline { position:absolute; left:16px; bottom:16px; font-family:'Space Mono'; font-size:11px; letter-spacing:1px;
  color:#d3dae9; background:rgba(0,0,0,.5); border:1px solid var(--border); border-radius:999px; padding:7px 12px; }
.hero-eyebrow.green { color:#3fd07a; }
.ship-h { font-family:'Fredoka'; font-weight:700; font-size: clamp(26px,3.4vw,36px); margin:10px 0 12px; }
.ship-sub { color:var(--muted); font-size:15px; line-height:1.6; max-width:460px; }
.ship-list { display:flex; flex-direction:column; gap:12px; margin-top:22px; }
.ship-item { display:flex; align-items:center; gap:12px; font-size:15px; color:#e2e7f2; }
.ship-ico { width:34px; height:34px; flex:0 0 auto; display:flex; align-items:center; justify-content:center;
  border-radius:10px; background:var(--surface); border:1px solid var(--border); font-size:16px; }

/* faq accordion */
.faq { display:flex; flex-direction:column; border-top:1px solid var(--border); }
.faq-item { border-bottom:1px solid var(--border); }
.faq-q { width:100%; background:transparent; border:none; cursor:pointer; display:flex; align-items:center;
  justify-content:space-between; gap:16px; padding:20px 4px; text-align:left; color:#fff;
  font-family:'Fredoka'; font-weight:700; font-size:18px; transition:.15s; }
.faq-q:hover { color:#6be0ff; }
.faq-caret { font-size:24px; line-height:1; color:#6be0ff; transform:rotate(90deg); transition:transform .2s; }
.faq-item.open .faq-caret { transform:rotate(-90deg); }
.faq-a { color:var(--muted); font-size:15px; line-height:1.65; padding:0 4px 22px; max-width:760px; animation:fadeIn .2s ease; }
@keyframes fadeIn { from{ opacity:0; transform:translateY(-4px);} to{ opacity:1; transform:none;} }

/* closing cta */
.lp-cta { position:relative; overflow:hidden; text-align:center; border-radius:var(--radius-lg); padding:60px 30px;
  border:1px solid var(--border);
  background:linear-gradient(150deg, rgba(77,159,255,.18), rgba(176,107,255,.16) 58%, rgba(63,208,122,.12)); }
.lp-cta::after { content:''; position:absolute; inset:0; pointer-events:none;
  background: radial-gradient(60% 80% at 50% -10%, rgba(255,255,255,.16), transparent 60%); }
.lp-cta-spark { position:relative; z-index:1; font-size:34px; color:#fff; filter: drop-shadow(0 0 16px rgba(110,224,255,.8)); }
.lp-cta-h { position:relative; z-index:1; font-family:'Fredoka'; font-weight:700; font-size: clamp(30px,4.4vw,46px); margin:10px 0 12px; }
.lp-cta-sub { position:relative; z-index:1; color:#c8cfde; max-width:520px; margin:0 auto 26px; font-size:15px; line-height:1.6; }
.lp-cta .rip-btn { position:relative; z-index:1; max-width:280px; margin:0 auto; }

/* footer columns */
.rl-foot { align-items:stretch; gap:26px; }
.foot-top { width:100%; max-width:1180px; margin:0 auto; display:grid; grid-template-columns: 1.4fr 1.6fr; gap:30px; text-align:left; }
.foot-brand .brand { margin-bottom:14px; }
.foot-tag { color:var(--muted); font-family:'Plus Jakarta Sans'; font-size:14px; line-height:1.55; max-width:320px; margin-bottom:16px; }
.foot-cols { display:grid; grid-template-columns: repeat(3,1fr); gap:20px; }
.foot-col { display:flex; flex-direction:column; gap:10px; align-items:flex-start; }
.foot-h { font-family:'Space Mono'; font-size:11px; letter-spacing:2px; color:#6b7488; margin-bottom:4px; }
.foot-col button { background:none; border:none; cursor:pointer; color:#aeb6c9; font-family:'Plus Jakarta Sans';
  font-weight:500; font-size:14px; padding:0; text-align:left; transition:.15s; }
.foot-col button:hover { color:#fff; }
.foot-static { color:#5a6275; font-family:'Plus Jakarta Sans'; font-size:14px; }
.foot-bottom { width:100%; max-width:1180px; margin:0 auto; border-top:1px solid var(--border); padding-top:20px; display:flex; flex-direction:column; gap:8px; }
.foot-disclaimer { font-family:'Space Mono'; font-size:10px; letter-spacing:.5px; color:#4f566a; line-height:1.6; }

@media (max-width: 820px) {
  .lp-hero { grid-template-columns:1fr; gap:30px; min-height:auto; text-align:center; }
  .lp-hero-text, .lp-hero-text .intro-title, .lp-hero-text .intro-sub { text-align:center; }
  .lp-hero-text .intro-sub { margin-left:auto; margin-right:auto; }
  .lp-hero-text .intro-cta, .hero-chips { justify-content:center; }
  .ship-grid { grid-template-columns:1fr; gap:22px; }
  .lp-section { margin:46px 0; }
  .foot-top { grid-template-columns:1fr; gap:24px; }
}
`;
