/**
 * Slay the Spire 2 patch sync — v0.99 (launch) → v0.104.0 (beta)
 *
 * Applies all balance patches Megacrit shipped between launch (Mar 5 2026)
 * and Apr 24 2026 (latest beta) to db.js. Light-touch: notes/numbers/mechanics
 * updated to match in-game text; tier shifts only where patches clearly justify.
 *
 * Sources: official Steam patch notes (v0.100.0–v0.104.0), Mobalytics,
 * Untapped.gg, Mega Crit's Anthony's design notes.
 */
const fs = require("fs");

// ---- Load DB --------------------------------------------------------------
const src = fs.readFileSync("db.js", "utf8");
const DB = eval("(" + src.replace(/^const DB =\s*/, "").replace(/;\s*$/, "") + ")");

const changelog = [];
function log(line) { changelog.push(line); }

function setCard(ch, key, patch, reason) {
  const card = DB.cards[ch] && DB.cards[ch][key];
  if (!card) {
    log(`WARN: card ${ch}/${key} not found — skipped`);
    return false;
  }
  for (const [k, v] of Object.entries(patch)) {
    if (typeof v === "function") card[k] = v(card[k]);
    else card[k] = v;
  }
  log(`CARD ${ch}/${key} — ${reason}`);
  return true;
}
function setRelic(key, patch, reason) {
  const relic = DB.relics[key];
  if (!relic) {
    log(`WARN: relic ${key} not found — skipped`);
    return false;
  }
  for (const [k, v] of Object.entries(patch)) {
    if (typeof v === "function") relic[k] = v(relic[k]);
    else relic[k] = v;
  }
  log(`RELIC ${key} — ${reason}`);
  return true;
}
function deleteCard(ch, key, reason) {
  if (DB.cards[ch] && DB.cards[ch][key]) {
    delete DB.cards[ch][key];
    log(`CARD-REMOVED ${ch}/${key} — ${reason}`);
    return true;
  }
  log(`WARN: deleteCard ${ch}/${key} not found`);
  return false;
}

// ===========================================================================
// IRONCLAD
// ===========================================================================
// v0.100.0 — Dominate rework
setCard("ironclad", "DOMINATE", {
  notes: "[Reworked v0.100.0] 1-cost Skill, Uncommon: Apply 1(2) Vulnerable, then gain 1 Strength per Vulnerable on the enemy, Exhaust. Strong in Vulnerable-stacking decks (Tremble, Bully, Uppercut). Beware enemies with Artifact.",
  syn: ["strength", "vulnerable", "exhaust", "scaling"],
  mech: ["strength", "vulnerable_apply", "exhaust", "scaling"],
}, "v0.100.0 rework: now applies Vulnerable itself");

// v0.100.0 — Expect a Fight rework (cap on energy gain — kills infinites)
setCard("ironclad", "EXPECT_A_FIGHT", {
  notes: "[Reworked v0.100.0] Cost 2(1) Skill, Uncommon: Gain Energy for each Attack in Hand. You cannot gain additional Energy this turn. Closes off most Ironclad infinite loops; still excellent burst energy with attack-dense hands.",
  builds: ["any"],
  syn: ["energy_gain", "attack_density", "draw"],
  anti: ["exhaust_heavy"],
  tier: "A",
}, "v0.100.0 rework: cannot gain additional energy this turn (anti-infinite)");

// v0.100.0 — Spite rework
setCard("ironclad", "SPITE", {
  notes: "[Reworked v0.100.0] 0-cost Attack, Uncommon: Deal 5 dmg, hits 2(3) times if you lost HP this turn. Free 10+ dmg in self-damage decks (Bloodletting/Rupture/Brand).",
  mech: ["self_damage_payoff", "damage", "multi_hit"],
}, "v0.100.0 rework: multi-hit on HP loss (was draw)");

// v0.100.0 — Stoke rework
setCard("ironclad", "STOKE", {
  notes: "[Reworked v0.100.0] 1-cost Skill, Rare: Exhaust your Hand. Add 1 random (Upgraded) card to Hand for each card Exhausted. Massive Exhaust payoff trigger; use after dumping value or to reset bricks.",
  mech: ["exhaust", "card_generation"],
}, "v0.100.0 rework: random cards generated (was draw)");

// v0.100.0 — Break buffed
setCard("ironclad", "BREAK", {
  notes: (n) => (n || "Break attack.") + " [Buffed v0.100.0] Cost 2→1; upgraded damage 20(25)→20(30).",
}, "v0.100.0 buff: cost reduced, upgrade damage increased");

// v0.100.0 — Cinder buff (small)
setCard("ironclad", "CINDER", {
  notes: "[Updated v0.101.0] 18 damage + Exhausts a random card in your Hand (was the top of your Draw Pile). Far less of a gamble; still feeds Exhaust payoffs (Dark Embrace, Feel No Pain, Charon's Ashes).",
}, "v0.100.0+v0.101.0: random hand exhaust; damage 17(22)→18(24)");

// v0.100.0 — Fight Me
setCard("ironclad", "FIGHT_ME", {
  notes: (n) => (n || "Fight Me!") + " [Buffed v0.100.0] Self-Strength gain 2(3)→3(4).",
}, "v0.100.0 buff: more Strength on self");

// v0.100.0 — Hemokinesis
setCard("ironclad", "HEMOKINESIS", {
  notes: (n) => (n || "Hemokinesis.") + " [Buffed v0.100.0] Damage 14(19)→15(20).",
}, "v0.100.0 buff: damage up");

// v0.100.0 — Tremble: now 3 Vulnerable & v0.100.0 also gains Exhaust per pcgamesn
setCard("ironclad", "TREMBLE", {
  notes: "[Buffed v0.100.0; Exhaust added v0.101.0] Apply 3(4) Vulnerable, now Exhausts. Stronger setup but one-shot — fits better in most decks since Vulnerable rarely needs to repeat.",
  mech: ["vulnerable", "debuff", "zero_cost", "exhaust"],
}, "v0.100.0+v0.101.0: Vulnerable buffed, Exhaust added");

// v0.100.0 — Forgotten Ritual: now Exhausts
setCard("ironclad", "FORGOTTEN_RITUAL", {
  notes: "[Nerfed v0.100.0] Now Exhausts. If you Exhausted a card this turn, gain 3 Energy. The Exhaust closes the most egregious Ironclad infinite loops, but it's still strong as a one-shot turn-burster in Exhaust decks.",
  mech: ["energy_gain", "exhaust", "conditional"],
}, "v0.100.0 nerf: now Exhausts");

// v0.103.0 — Colossus rarity Rare→Uncommon
setCard("ironclad", "COLOSSUS", {
  rarity: "uncommon",
  notes: "[Rarity Rare → Uncommon, v0.103.0] New STS2 card. Strong permanent block/strength scaling, now appears in normal card rewards instead of just rare slots — much more accessible.",
}, "v0.103.0: rarity reduced from Rare to Uncommon");

// v0.103.0 — Grapple deprecated
deleteCard("ironclad", "GRAPPLE", "v0.103.0: Grapple deprecated; saved runs convert it to a placeholder Status");

// v0.103.0 — Not Yet (new card) — ADD
DB.cards.ironclad.NOT_YET = {
  id: "Not Yet",
  tier: "B",
  builds: ["any", "self_damage", "exhaust"],
  syn: ["healing", "exhaust", "self_damage", "blood"],
  anti: [],
  notes: "[Added v0.103.0] Rare Skill, Cost 2: Heal 10(13) HP, Exhaust. Panic-button heal that also fuels self-damage payoffs (Bloodletting/Rupture/Spite) and Exhaust synergies (Feel No Pain, Dark Embrace).",
  mech: ["heal", "exhaust"],
  role: "utility",
};
log("CARD-ADDED ironclad/NOT_YET — Added in v0.103.0 (Rare Skill, 2 cost, Heal 10/13, Exhaust)");

// v0.104.0 — Conflagration rework
setCard("ironclad", "CONFLAGRATION", {
  notes: "[Reworked v0.104.0] 1-cost Rare Attack: Deal 2 damage to ALL enemies 4(5) times. Multi-hit AoE — scales hard with Strength, Vulnerable, and per-hit relics (Pen Nib, Akabeko). No longer cares about other Attacks played this turn.",
  builds: ["aoe", "strength", "vulnerable"],
  syn: ["aoe", "multi_hit", "strength", "vulnerable", "pen_nib", "akabeko"],
  mech: ["aoe", "multi_hit", "damage"],
  role: "payoff",
}, "v0.104.0 rework: multi-hit AoE (was attack-counter scaling)");

// v0.104.0 — Drum of Battle: Power → Skill
setCard("ironclad", "DRUM_OF_BATTLE", {
  notes: "[Reworked v0.104.0] 1-cost Uncommon Skill (was 0-cost Power): Draw 2 cards. When Exhausted, gain 2(3) Energy. Pivots out of the unloved Power slot into a real Exhaust-archetype payoff.",
  builds: ["exhaust", "any"],
  syn: ["draw", "exhaust", "energy_gain", "feel_no_pain", "dark_embrace"],
  mech: ["draw", "exhaust", "energy_gain"],
  role: "engine",
}, "v0.104.0 rework: Power → Skill, gains energy on Exhaust");

// ===========================================================================
// SILENT
// ===========================================================================
// v0.100.0 → v0.101.0 — Prepared was reworked then reverted
setCard("silent", "PREPARED", {
  notes: "[v0.100.0 rework reverted in v0.101.0] Back to launch state: 0-cost Common Skill — Draw 1 card, Discard 1 card. Devs note Sly is still strong; future nerfs will target it indirectly.",
  syn: ["sly", "draw", "discard"],
  mech: ["draw", "discard", "sly_enabler", "zero_cost"],
}, "v0.101.0: reverted back to launch text");

// v0.102.0 — Blade of Ink rework
setCard("silent", "BLADE_OF_INK", {
  notes: "[Reworked v0.102.0] 1-cost Skill: Add 2 Inky Shivs to Hand (Inky = Shiv + 2 dmg + apply 1 Weak). Major Shiv payoff & Weak applier; no longer grants temporary Strength.",
  builds: ["shiv", "sly"],
  syn: ["shiv", "weak", "accuracy", "infinite_blades", "after_image"],
  mech: ["shiv_generate", "weak", "card_generation"],
  role: "engine",
}, "v0.102.0 rework: Inky Shiv generator (was temp Strength)");

// v0.103.0/v0.103.2 — Acrobatics rarity Common → Uncommon
setCard("silent", "ACROBATICS", {
  rarity: "uncommon",
  notes: "[Rarity Common → Uncommon, v0.103.0] 1-cost Skill: Draw 3 cards, Discard 1. Still elite draw, but harder to pick up in card rewards now — Mega Crit's first lever to bring Sly under control.",
}, "v0.103.0: rarity Common → Uncommon");

// v0.100.0/v0.102.0 — Untouchable nerfed twice (9(12) → 7(9) → 6(8)); v0.104.0 upgraded buff
setCard("silent", "UNTOUCHABLE", {
  notes: "[Nerfed v0.100.0+v0.102.0; small upgrade buff v0.104.0] Block now 6(8) (was 9(12)). Still solid Sly intangible-block, but no longer warps the format. Upgrade now adds +3 Block (was +2).",
  tier: "B",
}, "v0.100/v0.102/v0.104 chain: block 9(12)→6(8), upgrade +2→+3");

// v0.102.0 — Speedster nerf (damage 2(3)→1(2))
setCard("silent", "SPEEDSTER", {
  notes: "[Nerfed v0.102.0] Per-card damage 2(3) → 1(2). Still a workable scaling attack, but pacing brake — needs more cards-played to hit the same numbers.",
}, "v0.102.0 nerf: per-card damage reduced");

// v0.102.0 — Leading Strike (1 Shiv → 2 Shivs, dmg 7→4)
setCard("silent", "LEADING_STRIKE", {
  notes: "[Reworked v0.102.0] Now generates 2 Shivs (was 1) but front damage 7→4. Pushed harder toward Shiv decks; less generic for non-Shiv builds.",
  builds: ["shiv"],
  syn: ["shiv", "damage"],
}, "v0.102.0: more Shivs, less direct damage");

// v0.104.0 — Nightmare clarification (afflictions removed from copies)
setCard("silent", "NIGHTMARE", {
  notes: "[Clarified v0.104.0] If the chosen card has an Affliction, it is removed from the copies added to your Hand next turn. Closes a Nightmare-laundering exploit.",
}, "v0.104.0: Afflictions stripped from generated copies");

// v0.101.0 — Serpent Form (4(5) → 4(6))
setCard("silent", "SERPENT_FORM", {
  notes: "[Buffed v0.101.0] Whenever you play a card, deal 4(6) damage to a random enemy. With high-card Sly/Shiv turns: 8 cards played = 32-48 passive damage.",
}, "v0.101.0 buff: per-card damage 4(5)→4(6) upgraded");

// v0.100.0 — Anticipate
setCard("silent", "ANTICIPATE", {
  notes: (n) => (n || "Anticipate.") + " [Nerfed v0.100.0] Dexterity 3(5)→2(3).",
}, "v0.100.0 nerf: less Dexterity");

// v0.100.0 — Corrosive Wave
setCard("silent", "CORROSIVE_WAVE", {
  notes: (n) => (n || "Corrosive Wave.") + " [Nerfed v0.100.0] Poison 3(4)→2(3).",
}, "v0.100.0 nerf: less Poison");

// v0.100.0 — Flick-Flack
setCard("silent", "FLICK_FLACK", {
  notes: (n) => (n || "Flick-Flack.") + " [Nerfed v0.100.0] Damage 7(9)→6(8).",
}, "v0.100.0 nerf: damage down");

// v0.100.0 — Pinpoint
setCard("silent", "PINPOINT", {
  notes: (n) => (n || "Pinpoint.") + " [Nerfed v0.100.0] Damage 17(22)→15(19).",
}, "v0.100.0 nerf: damage down");

// v0.100.0 — Grand Finale
setCard("silent", "GRAND_FINALE", {
  notes: (n) => (n || "Grand Finale.") + " [Buffed v0.100.0] Damage 50(60)→60(75).",
}, "v0.100.0 buff: damage up");

// v0.100.0 — Skewer
setCard("silent", "SKEWER", {
  notes: (n) => (n || "Skewer.") + " [Buffed v0.100.0] Damage 7(10)→8(11).",
}, "v0.100.0 buff: damage up");

// v0.103.0 — Follow-Through rework
setCard("silent", "FOLLOW_THROUGH", {
  notes: "[Reworked v0.103.0] If you have 5+ other cards in Hand, hits a 2nd time (full second hit, double-procs Akabeko/Shuriken etc.). Need 6 cards total in hand to trigger.",
}, "v0.103.0 rework: full extra hit at 5+ other cards");

// v0.103.0 — Memento Mori buff
setCard("silent", "MEMENTO_MORI", {
  notes: (n) => (n || "Memento Mori.") + " [Buffed v0.103.0] Base damage increased.",
}, "v0.103.0 buff: damage up");

// ===========================================================================
// REGENT
// ===========================================================================
// v0.101.0 — Arsenal rework (any card created, Innate)
setCard("regent", "ARSENAL", {
  notes: "[Reworked v0.101.0] 1-cost Power, Rare, Innate: Whenever you create a card, gain 1 Strength. Trigger broadened from Colorless-only to ANY card creation — Forge, Star payoffs, generated copies, summons. Pairs with Regalite for simultaneous Strength + Block on every card creation.",
  syn: ["card_creation", "forge", "stars", "strength", "shiv", "summon", "soul"],
  mech: ["strength", "card_creation_payoff", "scaling", "innate"],
}, "v0.101.0 rework: Innate, triggers on any card creation");

// v0.101.0 — Falling Star buffed
setCard("regent", "FALLING_STAR", {
  notes: "[Buffed v0.101.0] 8(12) damage + 1 Weak + 1 Vulnerable. Starter card; Star-build power spikes come online earlier.",
}, "v0.101.0 buff: damage 7(11)→8(12)");

// v0.101.0 — Glitterstream
setCard("regent", "GLITTERSTREAM", {
  notes: "[Buffed v0.101.0] 11 Block + 5(7) Block next turn — 16+ total. Reliable defensive card.",
}, "v0.101.0 buff: next-turn block 4(6)→5(7)");

// v0.101.0+v0.104.0 — Parry buffed and reworded
setCard("regent", "PARRY", {
  notes: "[Buffed v0.101.0; reworded v0.104.0] 1-cost Power: Sovereign Blade now gains 10(14) Block. Block is shown on Sovereign Blade itself and is now affected by Dexterity / Frail. Significantly stronger in Dex-stacking Regent builds.",
  tier: "B",
  syn: ["sovereign_blade", "block", "dexterity"],
  mech: ["block", "sovereign_blade", "scaling"],
}, "v0.101.0+v0.104.0: block 8(11)→10(14), now scales with Dex (tier C→B)");

// v0.101.0 — Refine Blade
setCard("regent", "REFINE_BLADE", {
  notes: "[Buffed v0.101.0] Forge 9(13) (was 6(10)) + Energy next turn. Efficient Forge card that also fixes tempo.",
}, "v0.101.0 buff: Forge 6(10)→9(13)");

// v0.101.0 — Celestial Might (upgrade now +1 hit)
setCard("regent", "CELESTIAL_MIGHT", {
  notes: "[Reworked upgrade v0.101.0] 6 damage 3 times; upgrade now grants 1 additional hit (was +2 damage). Multi-hit synergizes with Monarch's Gaze, Terraforming, and per-hit relics.",
}, "v0.101.0 upgrade rework: +1 hit instead of +2 damage");

// v0.101.0 — Guiding Star
setCard("regent", "GUIDING_STAR", {
  notes: "[Buffed v0.101.0] Damage + draw cards immediately (was next turn). Much better tempo.",
}, "v0.101.0 buff: immediate draw instead of delayed");

// v0.101.0 — Sword Sage (no longer increases SB cost)
setCard("regent", "SWORD_SAGE", {
  notes: "[Buffed v0.101.0] Sovereign Blade now hits an additional time and no longer costs more Energy. Pure upside in Forge/Sovereign Blade builds.",
}, "v0.101.0 buff: removed Sovereign Blade cost penalty");

// v0.100.0 — Glow rework
setCard("regent", "GLOW", {
  notes: "[Reworked v0.100.0] 1-cost Common Skill: Gain 1(2) Stars. Draw 1 card. Next turn, draw 1 card. Front-load + delayed draw.",
}, "v0.100.0 rework: Stars + split draw");

// v0.100.0 — BEGONE! / Charge transforms swapped
setCard("regent", "BEGONE", {
  notes: "[Changed v0.100.0] Now a Skill (no longer deals damage). Creates Minion Strike (was Minion Dive Bomb).",
}, "v0.100.0 change: Skill, creates Minion Strike");
setCard("regent", "CHARGE", {
  notes: "[Changed v0.100.0] Now creates Minion Dive Bomb cards (was Minion Strike).",
}, "v0.100.0 change: creates Minion Dive Bomb");

// v0.100.0 — Bundle of Joy
setCard("regent", "BUNDLE_OF_JOY", {
  notes: (n) => (n || "Bundle of Joy.") + " [Buffed v0.100.0] Cost 2→1.",
}, "v0.100.0 buff: cost reduced");

// v0.100.0 — Collision Course
setCard("regent", "COLLISION_COURSE", {
  notes: (n) => (n || "Collision Course.") + " [Buffed v0.100.0] Damage 9(12)→11(15).",
}, "v0.100.0 buff: damage up");

// v0.100.0 — Gather Light
setCard("regent", "GATHER_LIGHT", {
  notes: (n) => (n || "Gather Light.") + " [Buffed v0.100.0] Block 7(10)→8(11).",
}, "v0.100.0 buff: block up");

// v0.100.0 — Heirloom Hammer
setCard("regent", "HEIRLOOM_HAMMER", {
  notes: (n) => (n || "Heirloom Hammer.") + " [Buffed v0.100.0] Damage 17(22)→20(25).",
}, "v0.100.0 buff: damage up");

// v0.100.0 — I Am Invincible
setCard("regent", "I_AM_INVINCIBLE", {
  notes: (n) => (n || "I Am Invincible.") + " [Buffed v0.100.0] Block 9(12)→10(13).",
}, "v0.100.0 buff: block up");

// v0.100.0 — Kingly Kick
setCard("regent", "KINGLY_KICK", {
  notes: (n) => (n || "Kingly Kick.") + " [Buffed v0.100.0] Damage 24(30)→27(35).",
}, "v0.100.0 buff: damage up");

// v0.100.0 — Kingly Punch
setCard("regent", "KINGLY_PUNCH", {
  notes: (n) => (n || "Kingly Punch.") + " [Buffed v0.100.0] Base damage 8(8)→8(10), scaling 3(5)→4(6).",
}, "v0.100.0 buff: base + scaling damage");

// v0.100.0 — Patter (PATTERN in db.js)
setCard("regent", "PATTERN", {
  notes: (n) => (n || "Patter.") + " [Buffed v0.100.0] Block 8(10)→9(11).",
}, "v0.100.0 buff: block up");

// v0.100.0 — Solar Strike
setCard("regent", "SOLAR_STRIKE", {
  notes: (n) => (n || "Solar Strike.") + " [Buffed v0.100.0] Damage 8(9)→9(10).",
}, "v0.100.0 buff: damage up");

// v0.100.0 — Spoils of Battle
setCard("regent", "SPOILS_OF_BATTLE", {
  notes: (n) => (n || "Spoils of Battle.") + " [Buffed v0.100.0] Forge 10(15)→12(17).",
}, "v0.100.0 buff: Forge up");

// v0.100.0 — Wrought in War
setCard("regent", "WROUGHT_IN_WAR", {
  notes: (n) => (n || "Wrought in War.") + " [Buffed v0.100.0] Forge 5(7)→7(9).",
}, "v0.100.0 buff: Forge up");

// v0.100.0 — Alignment nerf
setCard("regent", "ALIGNMENT", {
  notes: (n) => (n || "Alignment.") + " [Nerfed v0.100.0] Star cost 2→3.",
}, "v0.100.0 nerf: more Stars to play");

// v0.100.0 — Void Form
setCard("regent", "VOID_FORM", {
  notes: (n) => (n || "Void Form.") + " [Changed v0.100.0] Now Ethereal; upgrade now removes Ethereal (was +1 card).",
  mech: (m) => Array.isArray(m) ? Array.from(new Set([...m, "ethereal"])) : ["ethereal"],
}, "v0.100.0: now Ethereal");

// v0.104.0 — Tyranny ordering fix
setCard("regent", "TYRANNY", {
  notes: "[Interaction fix v0.104.0] At start of turn, draw 1 and Exhaust 1 from Hand. Now triggers BEFORE Bombardment, so a Bombardment Exhausted by Tyranny will be played that same turn.",
}, "v0.104.0: triggers before Bombardment");

// v0.104.0 — Reflect nerf
setCard("regent", "REFLECT", {
  notes: "[Nerfed v0.104.0] 13 Block (was 14). Reflects blocked attack damage to attacker. Still a strong reflect-block tool, no longer auto-include.",
}, "v0.104.0 nerf: block 17(21)→16(20) (Untapped quotes 14→13 base)");

// ===========================================================================
// NECROBINDER
// ===========================================================================
// v0.100.0 — Defy upgrade change
setCard("necrobinder", "DEFY", {
  notes: "[Changed v0.100.0] Ethereal. Gain 6 Block + apply 1 Weak. Upgrade no longer increases Weak; instead +3 Block.",
}, "v0.100.0: upgrade now +3 block (was +1)");

// v0.100.0 — Grave Warden upgrade change
setCard("necrobinder", "GRAVE_WARDEN", {
  notes: "[Changed v0.100.0] 8 Block + add a Soul to Draw Pile. Upgrade now 8(11) Block (was 8(10)) and no longer upgrades the Soul.",
}, "v0.100.0: upgrade Block +3 instead of +2 + Soul+");

// v0.100.0 — Danse Macabre buff
setCard("necrobinder", "DANSE_MACABRE", {
  notes: (n) => (n || "Danse Macabre.") + " [Buffed v0.100.0] Block 3(4)→4(6).",
}, "v0.100.0 buff: block up");

// v0.100.0 — Debilitate
setCard("necrobinder", "DEBILITATE", {
  notes: (n) => (n || "Debilitate.") + " [Buffed v0.100.0] Damage 7(9)→10(12).",
}, "v0.100.0 buff: damage up");

// v0.100.0 — Sculpting Strike
setCard("necrobinder", "SCULPTING_STRIKE", {
  notes: (n) => (n || "Sculpting Strike.") + " [Buffed v0.100.0] Damage 8(11)→9(12).",
}, "v0.100.0 buff: damage up");

// v0.100.0 — Banshee's Cry nerf
setCard("necrobinder", "BANSHEES_CRY", {
  notes: "[Nerfed v0.100.0] Cost 6 → 9(7). Upgrade no longer increases damage. 33 AoE; cost reduces 2 per Ethereal played. Steeper to drop down without strong Ethereal density.",
}, "v0.100.0 nerf: cost up, upgrade no longer increases damage");

// v0.102.0 — Borrowed Time rework (cost 1, +4(6) energy, cards cost +1)
setCard("necrobinder", "BORROWED_TIME", {
  notes: "[Reworked v0.102.0] 1-cost Skill: Gain 4(6) Energy, all cards cost +1 this turn. No longer self-Doom. Best with high-cost Necrobinder cards (Reap, Bury, Banshee's Cry) where the surcharge barely matters.",
  builds: ["high_cost", "reap", "bury", "soul"],
  syn: ["energy_gain", "high_cost", "reap", "bury", "burst"],
  mech: ["energy_gain", "cost_increase"],
  tier: "S",
}, "v0.102.0 rework: burst energy + cost penalty (no longer Doom)");

// v0.101.0 — Capture Spirit reverted to original
setCard("necrobinder", "CAPTURE_SPIRIT", {
  notes: "[v0.100.0 nerf reverted in v0.101.0] Restored to original: HP loss 3(4), Souls 3(4). Top Necrobinder pick again.",
  tier: "S",
}, "v0.101.0: reverted nerf, back to original numbers");

// v0.100.0 — Dirge nerf
setCard("necrobinder", "DIRGE", {
  notes: "[Nerfed v0.100.0] Now Exhausts. Make X Souls + raise Osty's HP. Setup card for soul+osty combo, but one-shot.",
  mech: (m) => Array.isArray(m) ? Array.from(new Set([...m, "exhaust"])) : ["exhaust"],
}, "v0.100.0 nerf: now Exhausts");

// v0.100.0 — Seance nerf
setCard("necrobinder", "SEANCE", {
  notes: "[Nerfed v0.100.0] Cost 0 → 1(0). Upgrade no longer makes a Soul+. Ethereal. Transforms a Draw Pile card into a Soul. Still strong as a deck-thinning Soul gen.",
}, "v0.100.0 nerf: cost up, upgrade no longer Soul+");

// ===========================================================================
// DEFECT
// ===========================================================================
// v0.101.0 — Voltaic cost 2→3
setCard("defect", "VOLTAIC", {
  notes: "[Nerfed v0.101.0] Energy cost 2→3. Channel Lightning equal to total Lightning Channeled this combat, Exhaust. Now a definitive finisher rather than a mid-combat splash.",
}, "v0.101.0 nerf: cost 2→3");

// v0.100.0 — Hotfix
setCard("defect", "HOTFIX", {
  notes: "[Nerfed v0.100.0] Now has Exhaust. Gain 2 Focus this turn. Upgrade now removes Exhaust instead of increasing Focus.",
  mech: (m) => Array.isArray(m) ? Array.from(new Set([...m, "exhaust"])) : ["exhaust", "focus"],
}, "v0.100.0 nerf: now Exhausts; upgrade removes Exhaust");

// v0.100.0 — Rocket Punch buff
setCard("defect", "ROCKET_PUNCH", {
  notes: "[Buffed v0.100.0] Cost reduction now lasts until played (was end of turn). 13 damage, draw 1, free if a Status was created this turn — now usable across turns.",
}, "v0.100.0 buff: cost reduction persists until played");

// ===========================================================================
// COLORLESS
// ===========================================================================
// v0.100.0 — Discovery (Free to Play wording; affects Star cost)
setCard("colorless", "DISCOVERY", {
  notes: "[Changed v0.100.0] Choose 1 of 3 random cards to add to Hand, free to play this turn, Exhaust. Star cost is also reduced to 0 this turn (new — under \"Free to Play\" wording).",
}, "v0.100.0: 'Free to Play' now also waives Star cost");

// v0.100.0 + v0.103.2 — Hidden Gem
setCard("colorless", "HIDDEN_GEM", {
  notes: "[Reworked v0.103.2; v0.100.0 patch] Colorless Skill that grants Replay-style scaling. Can no longer be generated mid-combat by Skill Potion etc. Verify in-game text for current numbers; tier reflects general role.",
  tier: "B",
}, "v0.103.2 rework + v0.100.0 generation restriction");

// v0.100.0 — Production
setCard("colorless", "PRODUCTION", {
  notes: "[Changed v0.100.0] 0-cost Skill, Uncommon: Gain 2 Energy, Exhaust. Upgrade now adds +1 Energy (was: removes Exhaust). Free 3 Energy on a one-shot.",
}, "v0.100.0: upgrade now +1 energy (was lose Exhaust)");

// v0.100.0 — Seeker Strike
setCard("colorless", "SEEKER_STRIKE", {
  notes: (n) => (n || "Seeker Strike.") + " [Buffed v0.100.0] Damage 6(9)→9(12).",
}, "v0.100.0 buff: damage up");

// v0.100.0 — Eternal Armor
setCard("colorless", "ETERNAL_ARMOR", {
  notes: (n) => (n || "Eternal Armor.") + " [Buffed v0.100.0] Plating 7(9)→9(12).",
}, "v0.100.0 buff: more plating");

// v0.104.0 — Neow's Fury (choose 2 instead of random; can choose 0/1)
setCard("colorless", "NEOWS_FURY", {
  notes: "[Buffed v0.104.0] You now CHOOSE up to 2 cards from your Discard Pile to add to Hand (was random). May choose 0 or 1 if preferred.",
  tier: "A",
}, "v0.104.0 buff: player choice instead of random");

// v0.100.0 — Beacon of Hope nerf (no stacking)
setCard("colorless", "BEACON_OF_HOPE", {
  notes: "[Nerfed v0.100.0] Can no longer be stacked. Whenever you gain Block, other players gain half. Multiplayer-only — D-tier solo.",
}, "v0.100.0 nerf: no stacking");

// v0.100.0 — Believe in You nerf
setCard("colorless", "BELIEVE_IN_YOU", {
  notes: (n) => (n || "Believe in You.") + " [Nerfed v0.100.0] Energy 3(4)→2(3).",
}, "v0.100.0 nerf: less energy");

// v0.100.0 — Huddle Up
setCard("colorless", "HUDDLE_UP", {
  notes: (n) => (n || "Huddle Up.") + " [Nerfed v0.100.0] Now Exhausts.",
  mech: (m) => Array.isArray(m) ? Array.from(new Set([...m, "exhaust"])) : ["exhaust"],
}, "v0.100.0 nerf: now Exhausts");

// v0.103.2 — Tag Team
setCard("colorless", "TAG_TEAM", {
  notes: (n) => (n || "Tag Team.") + " [Buffed v0.103.2] Replay effect now also triggers on 'deal damage to ALL enemies' attacks.",
}, "v0.103.2 buff: replay also on AoE attacks");

// v0.103.2 — Stratagem multiplayer unbanned (note only)
setCard("colorless", "STRATAGEM", {
  notes: (n) => (n || "Stratagem.") + " [Note v0.103.2] No longer banned from the Colorless pool in multiplayer.",
}, "v0.103.2: multiplayer unban note");

// ===========================================================================
// RELICS
// ===========================================================================
// v0.102.0 — History Course
setRelic("HISTORY_COURSE", {
  notes: "[Updated v0.102.0] Plays of X-cost copies now use your CURRENT energy for X (not the energy spent last play). Significantly more flexible.",
}, "v0.102.0: current energy for X-cost copies");

// v0.101.0 — Pendulum rework
setRelic("PENDULUM", {
  notes: "[Reworked v0.101.0] Common — Every 3 turns, draw 1 card. Predictable cadence (was: draw on every shuffle). Less swingy in tiny decks.",
}, "v0.101.0 rework: every 3 turns instead of on shuffle");

// v0.102.0 — Nonupeipe's Fur Coat buff
setRelic("NONUPEIPES_FUR_COAT", {
  notes: "[Buffed v0.102.0] Now also affects restocked Axebots and any enemies that enter combat mid-fight. Strong vs. Axebot encounters and re-summon fights.",
}, "v0.102.0 buff: covers mid-combat enemy spawns");

// v0.103.2 — Regalite (any card created → Block)
setRelic("REGALITE", {
  notes: "[Updated v0.103.2] Now grants Block whenever you create a card (broader trigger, mirrors Arsenal). Pairs with Arsenal for simultaneous Strength + Block on each card creation.",
}, "v0.103.2: trigger broadened to any card creation");

// v0.101.0/v0.102.0 — Vexing Puzzlebox 'Free to Play'
setRelic("VEXING_PUZZLEBOX", {
  notes: "[Updated v0.102.0] Start combat: add a random Free-to-Play card to Hand (only lasts until end of turn). Wording change: 'Free to Play' instead of 'Costs 0 Energy'.",
}, "v0.102.0: Free to Play wording, ends-of-turn cap");

// v0.104.0 — Booming Conch (Neow ancient)
setRelic("BOOMING_CONCH", {
  notes: "[Buffed v0.104.0] Draw extra cards on the first turn AND gain 1 Energy at the start of Elite combats. Now a real Neow pick on elite-heavy maps.",
}, "v0.104.0 buff: +1 Energy on Elite combat start");

// v0.104.0 — Nutritious Soup (Tezcatara ancient)
setRelic("NUTRITIOUS_SOUP", {
  notes: "[Buffed v0.104.0] Strikes cost 0, are Eternal, AND deal +3 damage. Strike-payoff decks (Perfected Strike, Pommel Strike, Strike count) get a major lift.",
}, "v0.104.0 buff: +3 damage to all Strikes");

// v0.103.0 — Hefty Tablet, Neow's Talisman
setRelic("HEFTY_TABLET", {
  notes: "[Added v0.103.0] Neow relic: Choose 1 of 3 Rare cards to add to your Deck. Add 1 Injury to your Deck. Powerful early scaling at the cost of one Curse.",
}, "v0.103.0 added: Rare-card-for-Injury Neow relic");
setRelic("NEOWS_TALISMAN", {
  notes: "[Added v0.103.0] Neow relic: Upgrade 1 of your Strikes and 1 of your Defends. Modest but always-useful.",
}, "v0.103.0 added: starter upgrade Neow relic");
setRelic("NEOWS_BONES", {
  notes: "[Added v0.103.0] Neow relic: Upon pickup, gain 2 random Neow Relics + 1 random Curse. Net: +2 Neow relics for 1 curse — almost always worth it.",
}, "v0.103.0 added: 2x Neow relics for 1 curse");
setRelic("PHIAL_HOLSTER", {
  notes: "[Added v0.103.0] Neow relic: Upon pickup, gain +1 Potion Slot AND 2 random potions. Massive front-load value plus a permanent slot.",
}, "v0.103.0 added: +1 potion slot + 2 potions");
setRelic("WINGED_BOOTS", {
  notes: "[Added v0.103.0] Neow relic: 3 charges to ignore paths when choosing the next room. Use to grab off-path Elites/shops/key rooms.",
}, "v0.103.0 added: ignore-paths charges");

// v0.100.0 buffs/changes — relics
setRelic("AMETHYST_AUBERGINE", {
  notes: "[Buffed v0.100.0] Enemies now drop 15 extra Gold (was 10). No longer appears in shops (gold-generating relic).",
}, "v0.100.0 buff: gold drop 10→15; not sold at shop");
setRelic("BOOK_OF_FIVE_RINGS", {
  notes: "[Buffed v0.100.0] Heal 20 HP every 5 cards added to deck (was 15). Penalizes small decks but rewards deck-building.",
}, "v0.100.0 buff: heal 15→20");
setRelic("BOWLER_HAT", {
  notes: "[Buffed v0.100.0] Gain 25% extra Gold (was 20%). No longer appears in shops (gold-generating relic).",
}, "v0.100.0 buff: gold gain 20%→25%; not sold at shop");
setRelic("PERMAFROST", {
  notes: "[Buffed v0.100.0; rarity nerf v0.101.0] First Power played per combat: gain 7 Block (was 6). Rarity moved Common → Uncommon (less common in rewards).",
  rarity: "uncommon",
}, "v0.100.0 buff (block 6→7) + v0.101.0 rarity Common→Uncommon");
setRelic("PLANISPHERE", {
  notes: "[Buffed v0.100.0] Heal 5 HP per ? room (was 4). Compounds nicely on event-heavy maps.",
}, "v0.100.0 buff: heal 4→5");
setRelic("STONE_CRACKER", {
  notes: "[Reworked v0.100.0] Now works in ALL combats but only Upgrades 2 random Draw Pile cards (was: 3 cards in Boss combats only). Far more reliable per-fight value.",
}, "v0.100.0 rework: every combat / 2 cards");

// v0.101.0 — rarity shifts: Bellows (rare-ified), Tiny Mailbox/BoM/Red Mask/Lasting Candy (commonified)
setRelic("BELLOWS", {
  rarity: "rare",
  notes: (n) => (n || "Bellows.") + " [Rarity v0.101.0] Uncommon → Rare; less common in rewards but unchanged effect.",
}, "v0.101.0: rarity Uncommon → Rare");
setRelic("TINY_MAILBOX", {
  notes: (n) => (n || "Tiny Mailbox.") + " [Rarity note v0.101.0] Stays Common, now appears more often relative to other rarities.",
}, "v0.101.0: relative frequency up (still Common)");
setRelic("BAG_OF_MARBLES", {
  rarity: "common",
  notes: (n) => (n || "Bag of Marbles.") + " [Rarity v0.101.0] Uncommon → Common; appears more often.",
}, "v0.101.0: rarity Uncommon → Common");
setRelic("RED_MASK", {
  rarity: "common",
  notes: (n) => (n || "Red Mask.") + " [Rarity v0.101.0] Uncommon → Common; appears more often. Still S-tier value.",
}, "v0.101.0: rarity Uncommon → Common");
setRelic("LASTING_CANDY", {
  rarity: "uncommon",
  notes: (n) => (n || "Lasting Candy.") + " [Rarity v0.101.0] Rare → Uncommon; appears more often.",
}, "v0.101.0: rarity Rare → Uncommon");

// v0.103.2 — Brilliant Scarf clarification
setRelic("BRILLIANT_SCARF", {
  notes: "[Clarified v0.103.2] The 5th card you play 'from your hand' each turn is free. Auto-played cards (e.g. via Whispering Earring) do not count.",
}, "v0.103.2: clarified 'from your hand'");

// v0.103.2 — Archaic Tooth (gold-relic shop note doesn't apply, but it's an Ancient anyway)
// (No change — leaving as-is.)

// v0.100.0 — Neow relic blessing nerfs (if these exist)
setRelic("NEOWS_LEAFY_POULTICE", {
  notes: (n) => (n || "Neow's Leafy Poultice.") + " [Nerfed v0.100.0] Blessing's max HP loss 10→12.",
}, "v0.100.0 nerf: HP loss up");
setRelic("NEOWS_PRECARIOUS_SHEARS", {
  notes: (n) => (n || "Neow's Precarious Shears.") + " [Nerfed v0.100.0] Blessing's self-damage 13→16.",
}, "v0.100.0 nerf: self-damage up");
setRelic("TANXS_TRI_BOOMERANG", {
  notes: (n) => (n || "Tanx's Tri-Boomerang.") + " [Changed v0.100.0] Instinct enchantment no longer reduces cost; instead doubles damage on enchanted Attacks.",
}, "v0.100.0 rework: damage double instead of cost reduce");
setRelic("VAKUUS_PRESERVED_FOG", {
  notes: (n) => (n || "Vakuu's Preserved Fog.") + " [Nerfed v0.100.0] Cards removed 5→3; Folly curse now Ethereal.",
}, "v0.100.0 nerf: fewer removes; Folly Ethereal");

// ===========================================================================
// Update version banner
// ===========================================================================
// (handled separately in index.html)

// ===========================================================================
// Re-emit
// ===========================================================================
const out = "const DB = " + JSON.stringify(DB, null, 2) + ";\n";
fs.writeFileSync("db.js", out);

// Print log
console.log(`Applied ${changelog.length} changes.`);
console.log("---CHANGELOG---");
console.log(changelog.join("\n"));

// Save the changelog content for the markdown file
fs.writeFileSync("/tmp/changelog_raw.txt", changelog.join("\n"));
