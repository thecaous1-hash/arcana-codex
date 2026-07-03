# Changelog

All changes in this fork relative to upstream `Shawnrai/Shunrai-s-STS2-Advisor` at commit `c0751c5` (Mar 31 2026), which itself reflected the game state circa launch / v0.99.

This fork syncs the card and relic database to **Slay the Spire 2 v0.104.0 beta (Apr 24 2026)**, the latest beta branch as of May 7 2026. Main-branch state corresponds to **v0.103.2 (Apr 17 2026)**.

Primary sources used:
- Mega Crit official Steam patch notes for v0.100.0, v0.101.0, v0.102.0, v0.103.0, v0.103.1, v0.103.2, and v0.104.0
- Untapped.gg patch breakdowns for v0.102.0, v0.103.0, v0.103.2, v0.104.0
- Mobalytics' full v0.100.0 changelog
- Anthony Giovannetti's annotated design notes (v0.101.0)
- pcgamesn.com, gamerant.com, xpgained.co.uk recaps for cross-checking numbers

Light-touch principle: notes and numbers were updated to match in-game text; tier shifts were applied only where patches clearly justify them. Schema (keys, fields, file layout) is untouched.

---

## Advisor v1.6 — May 7 2026

### Header
- Version banner bumped from `V1.51 • Mar 18th 2026` to `V1.6 • Synced through STS2 v0.104.0 (May 7 2026)`.

### v0.104.0 (Apr 24 2026, beta) — most recent

**Ironclad**
- `CONFLAGRATION` reworked: now deals 2 damage to ALL enemies 4(5) times (no longer scales with attacks played). Notes/mech/syn updated to multi-hit AoE — Strength, Vulnerable, Pen Nib, Akabeko all matter more than before.
- `DRUM_OF_BATTLE` reworked: Power → Skill, 0 cost → 1 cost. Draw 2 cards, when Exhausted gain 2(3) Energy. Notes/mech/role updated to engine + exhaust archetype.

**Silent**
- `UNTOUCHABLE` upgrade buff: +2 Block → +3 Block on upgrade (final state in the v0.100/v0.102/v0.104 nerf-then-tune chain — base now 6(8) Block).
- `NIGHTMARE` clarified: Afflictions on the chosen card are stripped from the copies generated next turn.

**Regent**
- `PARRY` reworded: Block now displays on Sovereign Blade and is affected by Dexterity / Frail. Combined with the v0.101.0 Block buff (8(11) → 10(14)), this is a real upgrade. **Tier C → B.**
- `TYRANNY` interaction fix: now triggers before Bombardment, so a Bombardment that Tyranny Exhausts will be played that same turn.
- `REFLECT` nerfed: Block decreased by 1 (17(21) → 16(20)).

**Colorless**
- `NEOWS_FURY` buffed: you now CHOOSE up to 2 cards from your Discard Pile (was random); you may also choose 0 or 1.

**Relics**
- `BOOMING_CONCH` (Neow ancient) buffed: in addition to the first-turn draw, now also gains 1 Energy at the start of Elite combats. **Tier B → A.**
- `NUTRITIOUS_SOUP` (Tezcatara ancient) buffed: in addition to making Strikes cost 0 and Eternal, now also makes them deal +3 damage. **Tier B → A.**

### v0.103.2 (Apr 17 2026, main branch update)

This patch promoted the entire v0.100.0 → v0.103.1 beta cycle to the main branch. It is the de-facto "live" patch most players experience as of May 7 2026.

- `EXPECT_A_FIGHT` rework re-confirmed: now caps additional Energy gain on the same turn (closes the most-popular Ironclad infinite). Anti-tag added: `exhaust_heavy`.
- `BLADE_OF_INK` final form: 1-cost Skill, adds 2 Inky Shivs to Hand (Inky Shiv = Shiv + 2 dmg + apply 1 Weak). Mech retagged for shiv generation + weak.
- `ARSENAL` rework: now Innate; triggers on ANY card creation (was Colorless-only). Note re-pointed to forge / stars / shiv / summon / soul.
- `REGALITE` updated: now grants Block whenever you create a card (mirrors Arsenal). Updated note.
- `BORROWED_TIME` final rework: 1-cost, gain 4(6) Energy, all cards cost +1 this turn. No longer Doom-based. Mech retagged: `energy_gain`, `cost_increase`. Build hints updated to Reap/Bury/high-cost.
- `HIDDEN_GEM` rework noted (advisor relies on in-game text for current numbers).
- `TAG_TEAM` buffed: replay effect now triggers on "deal damage to ALL enemies" attacks too.
- `STRATAGEM` no longer banned in multiplayer.
- `BRILLIANT_SCARF` clarified: only counts cards played "from your hand" (auto-played cards do not count).

### v0.103.1 (Apr 16 2026, beta hotfix)
- Bug fixes only — no card or relic data changes.

### v0.103.0 (Apr 9 2026, beta)

**Ironclad**
- `COLOSSUS` rarity Rare → Uncommon. Note updated.
- `GRAPPLE` deprecated. Card removed entirely; the deck-card combo with Barricade was filtered; the names list and Barricade's notes were cleaned up.
- `NOT_YET` added: Rare Skill, Cost 2 — Heal 10(13) HP, Exhaust. Tier B; notes/mech/builds set to align with Healing/Exhaust/Self-damage archetypes.

**Silent**
- `ACROBATICS` rarity Common → Uncommon. Note updated; tier kept at S.
- `FOLLOW_THROUGH` reworked: hits a 2nd time if you have 5+ other cards in Hand (full extra hit, double-procs Akabeko/Shuriken etc.).
- `MEMENTO_MORI` base damage buffed.

**Relics — 5 new Neow ancients added**
- `HEFTY_TABLET` — Choose 1 of 3 Rare cards to add to Deck. Add 1 Injury. (Tier A)
- `NEOWS_TALISMAN` — Upgrade 1 Strike and 1 Defend. (Tier B)
- `NEOWS_BONES` — Gain 2 random Neow relics + 1 random Curse on pickup. (Tier S)
- `PHIAL_HOLSTER` — Gain +1 potion slot + 2 random potions on pickup. (Tier S)
- `WINGED_BOOTS` — 3 charges to ignore paths when choosing the next room. (Tier A)
- All five are also added to `DB.relicNames` so the autocomplete / search picks them up.

### v0.102.0 (Apr 3 2026, beta)

**Ironclad** (none direct, see v0.100.0 / v0.103.2 chain)

**Silent**
- `BLADE_OF_INK` reworked into Inky Shiv generator (see v0.103.2 above for final note).
- `SPEEDSTER` per-card damage 2(3) → 1(2).
- `LEADING_STRIKE` reworked: 2 Shivs (was 1), front-damage 7 → 4. Pushed harder toward Shiv decks.
- `UNTOUCHABLE` Block 7(9) → 6(8) (second nerf in the chain).

**Necrobinder**
- `BORROWED_TIME` reworked into the burst-energy / +1-cost-this-turn version (see v0.103.2 final form above).

**Relics**
- `HISTORY_COURSE` updated: X-cost copies now use your CURRENT energy for X (was the energy spent last play).
- `VEXING_PUZZLEBOX` switched to "Free to Play" wording (free until end of turn).
- `FUR_COAT` (Nonupeipe's) buff: now also affects restocked Axebots and any enemies that enter combat mid-fight.

### v0.101.0 (Mar 27 2026, beta) — reverts + Regent buffs

**Reverts (v0.100.0 nerfs walked back)**
- `PREPARED` reverted to the launch text (0-cost Skill: Draw 1, Discard 1).
- `CAPTURE_SPIRIT` reverted (HP loss / Souls back to 3(4)/3(4)). Tier kept at S.

**Ironclad**
- `CINDER` change: now Exhausts a random card in your Hand (was top of Draw Pile). Damage 17(22) → 18(24).
- `TREMBLE` now Exhausts.

**Silent**
- `SERPENT_FORM` upgraded damage 4(5) → 4(6).

**Regent — biggest buff cycle**
- `ARSENAL` reworked into Innate / any-card-creation Strength.
- `FALLING_STAR` damage 7(11) → 8(12).
- `GLITTERSTREAM` next-turn Block 4(6) → 5(7).
- `PARRY` Block 8(11) → 10(14).
- `REFINE_BLADE` Forge 6(10) → 9(13).
- `CELESTIAL_MIGHT` upgrade now grants 1 additional hit (was +2 damage).
- `GUIDING_STAR` now draws cards immediately (was next turn).
- `SWORD_SAGE` no longer increases Sovereign Blade's cost.
- `SPOILS_OF_BATTLE` Forge buff (in v0.100.0; cross-listed there).

**Defect**
- `VOLTAIC` cost 2 → 3.

**Relics**
- `PENDULUM` reworked: every 3 turns, draw 1 card (was on every shuffle).
- `BELLOWS` rarity Uncommon → Rare.
- `BAG_OF_MARBLES` rarity Uncommon → Common.
- `RED_MASK` rarity Uncommon → Common.
- `LASTING_CANDY` rarity Rare → Uncommon.
- `PERMAFROST` rarity Common → Uncommon (and Block 6 → 7 from v0.100.0).
- `TINY_MAILBOX` relative frequency note (still Common).

### v0.100.0 (Mar 21 2026, beta) — first major balance patch

**Ironclad**
- `DOMINATE` reworked: now applies 1(2) Vulnerable itself, then gains Strength.
- `EXPECT_A_FIGHT` reworked: cap on additional Energy this turn (this is the v0.100.0 origin of the change later confirmed in v0.103.2).
- `SPITE` reworked: 5 dmg, hits 2(3) times if you lost HP this turn.
- `STOKE` reworked: random (Upgraded) cards added per Exhausted card.
- `BREAK` cost 2 → 1, upgraded damage 25 → 30.
- `FIGHT_ME` self-Strength 2(3) → 3(4).
- `HEMOKINESIS` damage 14(19) → 15(20).
- `TREMBLE` Vulnerable 2(3) → 3(4) — combined with the v0.101.0 Exhaust.
- `FORGOTTEN_RITUAL` now Exhausts.

**Silent**
- `UNTOUCHABLE` Block 9(12) → 7(9) — first nerf in the chain.
- `ANTICIPATE` Dexterity 3(5) → 2(3).
- `CORROSIVE_WAVE` Poison 3(4) → 2(3).
- `FLICK_FLACK` damage 7(9) → 6(8).
- `PINPOINT` damage 17(22) → 15(19).
- `GRAND_FINALE` damage 50(60) → 60(75).
- `SKEWER` damage 7(10) → 8(11).

**Regent**
- `GLOW` reworked into Stars + split draw.
- `BEGONE` reworked: Skill, no damage, creates Minion Strike.
- `CHARGE` reworked: now creates Minion Dive Bomb instead of Minion Strike.
- `BUNDLE_OF_JOY` cost 2 → 1.
- `COLLISION_COURSE` damage 9(12) → 11(15).
- `GATHER_LIGHT` Block 7(10) → 8(11).
- `HEIRLOOM_HAMMER` damage 17(22) → 20(25).
- `I_AM_INVINCIBLE` Block 9(12) → 10(13).
- `KINGLY_KICK` damage 24(30) → 27(35).
- `KINGLY_PUNCH` base 8(8) → 8(10), scaling 3(5) → 4(6).
- `PATTERN` (in-game name "Patter") Block 8(10) → 9(11).
- `SOLAR_STRIKE` damage 8(9) → 9(10).
- `SPOILS_OF_BATTLE` Forge 10(15) → 12(17).
- `WROUGHT_IN_WAR` Forge 5(7) → 7(9).
- `ALIGNMENT` Star cost 2 → 3.
- `VOID_FORM` now Ethereal; upgrade now removes Ethereal.

**Necrobinder**
- `DEFY` upgrade now adds +3 Block (was +1) and no longer increases Weak.
- `GRAVE_WARDEN` upgrade now 8(11) Block; no longer upgrades the Soul.
- `DANSE_MACABRE` Block 3(4) → 4(6).
- `DEBILITATE` damage 7(9) → 10(12).
- `SCULPTING_STRIKE` damage 8(11) → 9(12).
- `BANSHEES_CRY` cost 6 → 9(7); upgrade no longer increases damage.
- `DIRGE` now Exhausts.
- `SEANCE` cost 0 → 1(0); upgrade no longer makes a Soul+.

**Defect**
- `HOTFIX` now Exhausts; upgrade now removes Exhaust (was +Focus).
- `ROCKET_PUNCH` cost reduction now lasts until played (was end of turn).

**Colorless**
- `DISCOVERY` "Free to Play" wording (also waives Star cost).
- `HIDDEN_GEM` can no longer be generated mid-combat by Skill Potion etc.
- `PRODUCTION` upgrade now +1 Energy (was lose Exhaust).
- `SEEKER_STRIKE` damage 6(9) → 9(12).
- `ETERNAL_ARMOR` Plating 7(9) → 9(12).
- `BEACON_OF_HOPE` can no longer be stacked.
- `BELIEVE_IN_YOU` Energy 3(4) → 2(3).
- `HUDDLE_UP` now Exhausts.

**Relics**
- `AMETHYST_AUBERGINE` gold drop 10 → 15. No longer at the shop (gold-generating relic).
- `BOOK_OF_FIVE_RINGS` heal 15 → 20.
- `BOWLER_HAT` gold gain 20% → 25%. No longer at the shop.
- `PERMAFROST` Block 6 → 7.
- `PLANISPHERE` heal 4 → 5.
- `STONE_CRACKER` reworked: now works in ALL combats but only Upgrades 2 random Draw Pile cards (was 3 in Boss combats only).
- `LEAFY_POULTICE` (Neow's) blessing HP loss 10 → 12.
- `PRECARIOUS_SHEARS` (Neow's) blessing self-damage 13 → 16.
- `TRI_BOOMERANG` (Tanx's) Instinct enchantment no longer reduces cost; now doubles damage on enchanted Attacks.
- `PRESERVED_FOG` (Vakuu's) cards removed 5 → 3; Folly curse now Ethereal.

---

## Tier movements applied

Light touch — only three:

- `regent/PARRY` C → B (v0.101.0 Block buff + v0.104.0 Dex scaling).
- `BOOMING_CONCH` B → A (v0.104.0 Energy on Elite combats).
- `NUTRITIOUS_SOUP` B → A (v0.104.0 +3 damage to all Strikes, on top of cost 0 + Eternal).

All other tiers were left as the maintainer set them, even where patches arguably justify a shift. The intent is to keep advisor scoring stable for existing users.

---

## Pre-existing issues in upstream — left alone

There are 11 entries in `DB.combos` that reference cards which don't exist in `DB.cards`. These predate this fork and are unrelated to v0.100–v0.104 patches; they look like maintainer typos or untracked aliases. They do not error at runtime (the matcher just skips unknown names) but they reduce useful matches:

- `Defragment ↔ Electrodynamics` (both directions)
- `Symbiosis ↔ Unleash`, `Symbiosis ↔ Squeeze`
- `Pagestorm ↔ Call of the Void` (both directions)
- `Spirit of Ash ↔ Call of the Void` (both directions)
- `Pull from Below ↔ Call of the Void` (both directions)
- `Thrumming Hatchet ↔ Strength`

Recommend reconciling these against the latest card pool in a separate PR.

---

## Files in this fork

- `db.js` — patched
- `index.html` — version banner bumped
- `logic.js` — untouched
- `CHANGELOG.md` — new (this file)
- `scripts/apply_patches.js` and `scripts/apply_patches_2.js` — the patcher used to produce this update; reusable for future patches
- `README.md` — small note linking to this changelog

The advisor's scoring schema, archetype tags, and combo logic are unchanged. The intent of this fork is purely to true the data up to the latest beta branch.
