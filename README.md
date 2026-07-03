# Shunrai's STS2 Advisor

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

The current decision logic is based on a mix of practical run experience, community knowledge, and some experimentation.

Right now it mainly relies on:

- decision patterns I would typically follow during my own runs
- information and strategies from various community guides
- some unconventional card combinations I’ve experimented with that might work well together
- some AI-assisted exploration of card synergies and how certain cards can interact or enable specific builds

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

## License

MIT License © 2026 Shunrai

See the [LICENSE](LICENSE) file for details.
