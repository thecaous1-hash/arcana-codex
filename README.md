# Arcana Codex

> 한국어 Slay the Spire 2 실시간 카드 픽 어드바이저. [Shunrai's STS2 Advisor](https://github.com/yard9/STS2-Advisor-Y) (MIT)를 토대로 하며, 카드·유물·통계 데이터는 외부 오픈소스 API [spire-codex](https://github.com/ptrlrd/spire-codex)를 사용합니다. (Arcana Codex는 spire-codex와 무관한 별개 프로젝트입니다.)

Browser tool for Slay the Spire 2 that helps evaluate card rewards, shop buys and removals based on your current deck.

Still **early access** and the logic isn't perfect yet - feedback and issue reports are welcome.

> **Fork note (May 7 2026):** Card and relic data synced through STS2 beta **v0.104.0** (Apr 24 2026). Main-branch state corresponds to **v0.103.2**. See [CHANGELOG.md](./CHANGELOG.md) for the full per-patch breakdown.

---

## What it does

- Track your deck
- Detect archetypes
- Evaluate card rewards
- Evaluate shop purchases
- Suggest card removals
- Show the data source behind every grade (community stats + expert tier), so you can judge how much to trust each pick

---

## How to use

1. Add cards from your current deck on the left.
2. Enter the card rewards or shop options you see in game.
3. Click **Analyze**.
4. The advisor will suggest the best pick based on deck synergy.

---

## Try it in browser

[Open the advisor](https://shawnrai.github.io/Shunrai-s-STS2-Advisor/)

---
## Character Support
**_Ironclad_**
- 195 different combos between cards
- All cards supported
- Archetypes: Strike, Bloodletting, Exhaust, Strength, Block

**_Silent_**
- 184 combos between cards
- All cards supported
- Archetypes: Sly, Poison, Shiv

**_Regent_**
- 57 different combos between cards
- All cards supported
- Archetypes: Stars, Forge
  
**_Necrobinder_**
- 60 combos between cards
- All cards supported
- Archetypes: Soul, Osty, Doom

**_Defect_**
- 54 combos between cards
- All cards supported
- Archetypes: Orb, Claw, Status

**_Colorless_**
- 73 combos between cards
- All cards supported

---

## How the logic currently works

The advisor grades every card on an **S–D scale** built from two data sources, then adjusts it to your run:

1. **Base grade — community data + expert tier.** Each card's base score blends [spire-codex](https://github.com/ptrlrd/spire-codex) community statistics (Codex win-rate score / win-rate delta) with a hand-made expert tier list (`db.js`, from Shunrai's advisor). Community data carries most of the weight; the expert tier corrects small-sample and biased cases.
2. **Context adjustment.** That base grade is then shifted by your detected archetypes, owned relics, the card's role, the current floor/act, and the ascension band you select (overall / A10).

Every recommendation shows **why**: the community win-rate delta ("+X%p over N runs"), synergy and anti-synergy notes, and a small line stating which data source set the grade. Cards that have no community data yet fall back to the expert tier and say so explicitly, so a blank stat never looks like a bug.

---

## Known issues

The logic still needs tuning and there are definitely cases where recommendations will be wrong.

If you notice something off, feel free to open an issue and include:

- character
- deck
- cards offered
- what result you expected

---

## Planned improvements

- Add missing cards
- Relic synergy
- Better archetype detection
- Improved card scoring logic
- More accurate deck health metrics
- Better support for future STS2 updates

---

## Disclaimer

This tool is experimental and the scoring logic is still evolving.
It should be treated as a helper, not a perfect decision maker.

---

## Reddit Thread[
https://www.reddit.com/r/slaythespire/comments/1rv5vwq/sts2_deck_assistant_helps_guide_builds_and/

---

## Credits / Notice

Arcana Codex is an unofficial, non-commercial fan project and is not affiliated with or
endorsed by Mega Crit. Slay the Spire and Slay the Spire 2, and all in-game images and text,
are the property of Mega Crit. Card and relic artwork is **not stored in this repository** —
it is loaded at runtime from spire-codex.com's CDN. Game data and card info are provided by
spire-codex.com (ptrlrd/spire-codex). Base UI/logic adapted from yard9/STS2-Advisor-Y (© Shunrai, MIT).
If expert tier-list data is used in db.js, credit those sources here as well.

---

## License

MIT License © 2026 Arcana Codex contributors · base project © 2026 Shunrai (MIT)

See the [LICENSE](LICENSE) file for details. Note: game-derived assets (images, in-game text)
are property of Mega Crit and are not covered by the MIT license — see the LICENSE asset exception.
