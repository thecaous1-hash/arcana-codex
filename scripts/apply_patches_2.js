/**
 * Second pass: fix relic key spellings + add v0.103.0 Neow relics.
 */
const fs = require("fs");
const src = fs.readFileSync("db.js", "utf8");
const DB = eval("(" + src.replace(/^const DB =\s*/, "").replace(/;\s*$/, "") + ")");

const changelog = [];
function setRelic(key, patch, reason) {
  const r = DB.relics[key];
  if (!r) { changelog.push(`WARN: relic ${key} not found`); return false; }
  for (const [k, v] of Object.entries(patch)) {
    if (typeof v === "function") r[k] = v(r[k]);
    else r[k] = v;
  }
  changelog.push(`RELIC ${key} — ${reason}`);
  return true;
}
function addRelic(key, def, reason) {
  if (DB.relics[key]) {
    changelog.push(`WARN: relic ${key} already exists; updating notes only`);
    DB.relics[key].notes = def.notes;
    return false;
  }
  DB.relics[key] = def;
  changelog.push(`RELIC-ADDED ${key} — ${reason}`);
  return true;
}

// Fix relic key spellings (re-apply using actual db.js keys)
setRelic("FUR_COAT", {
  notes: "[Buffed v0.102.0] Now also affects restocked Axebots and any enemies that enter combat mid-fight. Strong vs. Axebot encounters and re-summon fights.",
}, "v0.102.0 buff: covers mid-combat enemy spawns (key: FUR_COAT)");

setRelic("LEAFY_POULTICE", {
  notes: (n) => (n || "Leafy Poultice.") + " [Nerfed v0.100.0] Blessing's max HP loss 10→12.",
}, "v0.100.0 nerf: HP loss up");

setRelic("PRECARIOUS_SHEARS", {
  notes: (n) => (n || "Precarious Shears.") + " [Nerfed v0.100.0] Blessing's self-damage 13→16.",
}, "v0.100.0 nerf: self-damage up");

setRelic("TRI_BOOMERANG", {
  notes: (n) => (n || "Tri-Boomerang.") + " [Changed v0.100.0] Instinct enchantment no longer reduces cost; instead doubles damage on enchanted Attacks.",
}, "v0.100.0 rework: damage double instead of cost reduce");

setRelic("PRESERVED_FOG", {
  notes: (n) => (n || "Preserved Fog.") + " [Nerfed v0.100.0] Cards removed 5→3; Folly curse now Ethereal.",
}, "v0.100.0 nerf: fewer removes; Folly Ethereal");

// Bump Booming Conch tier B → A given v0.104.0 buff
setRelic("BOOMING_CONCH", { tier: "A" }, "v0.104.0: tier B → A (energy on elite combats is significant)");
// Bump Nutritious Soup tier B → A given v0.104.0 buff (+3 dmg to Strikes)
setRelic("NUTRITIOUS_SOUP", { tier: "A" }, "v0.104.0: tier B → A (+3 damage to all Strikes is huge)");

// === NEW v0.103.0 NEOW RELICS — add to db ===

addRelic("HEFTY_TABLET", {
  id: "Hefty Tablet",
  tier: "A",
  char: "any",
  rarity: "ancient",
  syn: ["scaling", "card_quality"],
  notes: "[Added v0.103.0] Neow relic: Choose 1 of 3 Rare cards to add to your Deck. Add 1 Injury to your Deck. A free Rare pick at the cost of one Curse — almost always worth it for build acceleration.",
  builds: ["any"],
  scoreEffects: [],
}, "Added in v0.103.0 (Neow relic)");

addRelic("NEOWS_TALISMAN", {
  id: "Neow's Talisman",
  tier: "B",
  char: "any",
  rarity: "ancient",
  syn: ["strike", "defend"],
  notes: "[Added v0.103.0] Neow relic: Upgrade 1 of your starting Strikes and 1 of your starting Defends. Modest but always useful — improves your two most-played early cards permanently.",
  builds: ["any", "strike"],
  scoreEffects: [
    { tags: ["strike"], bonus: 0.2 },
  ],
}, "Added in v0.103.0 (Neow relic)");

addRelic("NEOWS_BONES", {
  id: "Neow's Bones",
  tier: "S",
  char: "any",
  rarity: "ancient",
  syn: ["neow_relic", "scaling"],
  notes: "[Added v0.103.0] Neow relic: On pickup, gain 2 random Neow Relics + 1 random Curse. Net +2 Neow relics for 1 Curse — borderline always-take when you don't have a strong opening relic.",
  builds: ["any"],
  scoreEffects: [],
}, "Added in v0.103.0 (Neow relic)");

addRelic("PHIAL_HOLSTER", {
  id: "Phial Holster",
  tier: "S",
  char: "any",
  rarity: "ancient",
  syn: ["potion"],
  notes: "[Added v0.103.0] Neow relic: On pickup, gain +1 Potion Slot AND 2 random potions. Massive front-loaded value plus a permanent extra slot for the rest of the run.",
  builds: ["any"],
  scoreEffects: [],
}, "Added in v0.103.0 (Neow relic)");

addRelic("WINGED_BOOTS", {
  id: "Winged Boots",
  tier: "A",
  char: "any",
  rarity: "ancient",
  syn: ["map_route"],
  notes: "[Added v0.103.0] Neow relic: 3 charges to ignore paths when choosing the next room. Use to grab off-path Elites, shops, or key event rooms — major routing flexibility.",
  builds: ["any"],
  scoreEffects: [],
}, "Added in v0.103.0 (Neow relic)");

// Update names list (the db has a relicNames array)
const newNames = ["Hefty Tablet", "Neow's Talisman", "Neow's Bones", "Phial Holster", "Winged Boots"];
if (Array.isArray(DB.relicNames)) {
  for (const n of newNames) {
    if (!DB.relicNames.includes(n)) {
      DB.relicNames.push(n);
      changelog.push(`relicNames added: ${n}`);
    }
  }
}

// Re-emit
fs.writeFileSync("db.js", "const DB = " + JSON.stringify(DB, null, 2) + ";\n");
console.log(changelog.join("\n"));
fs.appendFileSync("/tmp/changelog_raw.txt", "\n" + changelog.join("\n"));
