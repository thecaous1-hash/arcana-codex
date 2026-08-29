# 조사 F — 빌드 부적합 감점 누락 (`anti` 공백)

- 조사일: 2026-08-29
- 기준 커밋: `77e1c48` (main. 조사 E `0cad1fd` 머지 이후)
- 성격: 사실·숫자 보고. 권고 없음. 코드·데이터 무수정 — 이 보고서 1개만 신규.
- 방법: 조사 D·E와 동일 — `tools/sim_c_options.js`의 기준선 조건(로드 순서, 아키타입 강제 활성 strength=1.0 · 빈 덱 · 유물 없음 · floor=20 · act=2 · encounter='normal')을 재사용한 일회용 스크립트를 저장소 밖(세션 스크래치패드)에서 실행. `scoreCard`는 실제 앱 함수 그대로 호출.

## 0. 배경 수치 재현 검증 — 전부 일치

| 예비 확인(사용자 측정) | 재현 결과 | 판정 |
|---|---|---|
| 전체 591장 중 anti 빈 카드 430장(73%) | 591장 / 430장 (72.8%) — db.js 원본 기준 | **일치** |
| ironclad 76/105 · silent 63/91 · defect 83/93 · regent 43/89 · necrobinder 39/87 · colorless 126/126 | 동일 (아래 §1 표의 괄호 수치) | **일치** |
| 무색 중 builds 구체적 + anti 빈 카드 10장 | 10장 (§2 표의 colorless 행들) | **일치** |

구조 사실(§3에서 실측으로 확인): anti가 비어도 **misfit 감점(logic.js:311-317, 강제 활성 기준 −0.9)은 받는다**. 비는 것은 anti 충돌 감점(logic.js:200-210, −0.9)이다. anti가 채워진 카드는 안 맞는 빌드에서 두 경로가 겹쳐 최대 −1.8까지 내려가는 반면, anti 공백 카드는 −0.9에서 멈춘다. 배경의 위풍당당 사례: 기본점수(3원 블렌드)가 높고 any 보정(+0.5)이 있어 −0.9만으로는 힘 아키에서 4.75(S)에 머문다(§3 첫 행).
## 1. `anti` 공백 전수

앞 = 앱 로드 후(575장 체계) / 괄호 = db.js 원본(591장 체계). "builds 구체적" = builds에서 any 제외 후 1개 이상 남음.

| 캐릭터 | 전체 카드 | anti 빈 카드 | 비율(로드 후) | 그중 builds 구체적 | 그중 builds 빔/any만 |
|---|---|---|---|---|---|
| ironclad | 89 (105) | 62 (76) | 69.7% | 53 (66) | 9 (10) |
| silent | 91 (91) | 63 (63) | 69.2% | 31 (32) | 32 (31) |
| defect | 93 (93) | 83 (83) | 89.2% | 64 (64) | 19 (19) |
| regent | 88 (89) | 42 (43) | 47.7% | 20 (21) | 22 (22) |
| necrobinder | 88 (87) | 40 (39) | 45.5% | 28 (28) | 12 (11) |
| colorless | 126 (126) | 126 (126) | 100.0% | 10 (10) | 116 (116) |
| **합계** | **575 (591)** | **416 (430)** | **72.3%** | **206 (221)** | **210 (209)** |

## 2. 위험 카드 — builds 구체적 + anti 공백 (전 206장, tier 순)

S 14장 · A 52장 · B 70장 · C 60장 · D 10장. db.js 행 번호 병기(로드 후 추가분은 data/extra_cards.js).

| 카드(한글명) | 카드ID (db.js 행) | 캐릭터 | tier | role | builds | notes 요약 |
|---|---|---|---|---|---|---|
| 위풍당당 | Panache (9468) | colorless | S | engine | claw, sly, any | Every 5 cards played in a turn, deal 10 AoE. S-tier — in Claw or Sly builds playing 10+ ca |
| 빙하 | Glacier (4213) | defect | S | generator | orb | Channel 2 Frost + block. Excellent defensive orb card. |
| 모드 적용 | Modded (5570) | defect | S | engine | orb | Gain 1 Orb Slot and draw 1 card. Cost increases by 1 each play. S-tier at 0 cost — free Or |
| 걷어내기 | Skim (4474) | defect | S | generator | claw, any | Pure draw. Essential in Claw builds where your cards are cheap but you need more of them i |
| 스피너 | Spinner (5666) | defect | S | engine | orb | At start of turn, Channel 1 Glass. S-tier — free Glass Orb every single turn passively. Gl |
| 임계 초과 | Supercritical (4398) | defect | S | generator | orb | 2 Focus burst for big damage turns. |
| 사혈 | Bloodletting (4) | ironclad | S | generator | self_damage | 0-cost reusable energy. Core enabler. Pairs with Rupture for free Strength. |
| 거상 | Colossus (141) | ironclad | S | defense | block, strike | [Rarity Rare → Uncommon, v0.103.0] New STS2 card. Strong permanent block/strength scaling, |
| 포식 | Feed (80) | ironclad | S | generator | self_damage, any | Permanent max HP on kill. Snowballs hard. Especially valuable in Bloodletting builds where |
| 제물 | Offering (99) | ironclad | S | generator | self_damage, exhaust | Lose 6 HP, draw 3, gain 2 energy. Enables explosive turns. Triggers Rupture. |
| 정화 | Cleanse (8932) | necrobinder | S | generator | osty, any | Summon 3 then Exhaust 1 from Draw Pile. S-tier — grows Osty AND thins deck simultaneously. |
| 강령회 | Seance (9257) | necrobinder | S | engine | soul | [Nerfed v0.100.0] Cost 0 → 1(0). Upgrade no longer makes a Soul+. Ethereal. Transforms a D |
| 어려운 결정 | Decisions, Decisions (6282) | regent | S | payoff | stars, forge | Draw 3 then triple any Skill. Royal Gamble → 27 Stars. Reflect → 51 Block. The Smith → For |
| 곡예 | Acrobatics (2509) | silent | S | generator | sly, any | [Rarity Common → Uncommon, v0.103.0] 1-cost Skill: Draw 3 cards, Discard 1. Still elite dr |
| 비밀 병기 | Secret Weapon (9509) | colorless | A | generator | claw, any | Put an Attack from Draw Pile into Hand. Exhaust. A-tier — tutors any Attack on demand. In  |
| 버퍼 | Buffer (4417) | defect | A | payoff | orb, any | Prevent HP loss once. Strong defensive option. |
| 오한 | Chill (4768) | defect | A | generator | orb | Channel 1 Frost orb per enemy. Great AoE frost generation. |
| 압축 | Compact (4982) | defect | A | generator | status | Gain 6 Block. Transform all Status cards in Hand into Fuel. A-tier — in Status builds, con |
| 그림자 소모 | Consuming Shadow (5439) | defect | A | engine | orb | Channel 2 Dark. At end of turn, Evoke leftmost Orb. A-tier — passive Evoke every turn plus |
| 냉각재 | Coolant (5460) | defect | A | engine | orb | At start of turn, gain 2 Block per unique Orb you have. A-tier — with 3+ unique orbs, give |
| 유리 공예 | Glasswork (5072) | defect | A | generator | orb | Gain 5 Block. Channel 1 Glass. A-tier — Glass orb deals 4 AoE each turn and evokes for 8 A |
| 홀로그램 | Hologram (4689) | defect | A | generator | claw | Puts a card back in hand. Upgrade removes Exhaust. Returns Claw, Scrape, or All For One. |
| 기계학습 | Machine Learning (4749) | defect | A | generator | claw, orb | Draw an extra card each turn. With All For One becomes somewhat redundant. |
| 다중 시전 | Multi-Cast (5760) | defect | A | payoff | orb | Evoke your rightmost Orb X times. Great finisher with Focus — evoke a Dark Orb multiple ti |
| 사중 시전 | Quadcast (5727) | defect | A | payoff | orb | Evoke your rightmost Orb 4 times. A-tier — Lightning x4 = 32+ damage with Focus. Dark Orb  |
| 무지개 | Rainbow (5590) | defect | A | generator | orb | Channel 1 Lightning + 1 Frost + 1 Dark. Exhaust. A-tier — fills all 3 major orb slots at o |
| 신호 증폭 | Signal Boost (5646) | defect | A | engine | orb | Next Power you play is played an extra time. Exhaust. A-tier — doubles Defragment (2 Focus |
| 공격성 | Aggression (528) | ironclad | A | generator | exhaust | Free upgraded Attack every turn. Strong in exhaust/scaling decks. |
| 바리케이드 | Barricade (206) | ironclad | A | engine | block | Block persists. Stack massive defense. Combines with Juggernaut and Body Slam. |
| 낙인 | Brand (245) | ironclad | A | generator | exhaust, self_damage, strength | Exhaust + Strength synergy. Core of exhaust-strength combo builds. |
| 불타는 조약 | Burning Pact (307) | ironclad | A | generator | exhaust, any | Exhaust a card, draw 2. Best cantrip for thinning deck and maintaining hand. |
| 대화재 | Conflagration (1683) | ironclad | A | payoff | aoe, strength, vulnerable | [Reworked v0.104.0] 1-cost Rare Attack: Deal 2 damage to ALL enemies 4(5) times. Multi-hit |
| 핏빛 망토 | Crimson Mantle (467) | ironclad | A | payoff | self_damage, block | Converts HP loss into block. Strong in self-damage builds. |
| 악랄함 | Cruelty (1708) | ironclad | A | engine | strike | Persistent Vulnerable scaler. Rewards decks that repeatedly apply Vulnerable and cash in w |
| 어둠의 포옹 | Dark Embrace (268) | ironclad | A | engine | exhaust | Draw a card when any card is exhausted. Central for exhaust builds. |
| 참호 | Entrench (1431) | ironclad | A | generator | block | Double your current Block. In Barricade builds this becomes absurd. |
| 악마의 눈 | Evil Eye (449) | ironclad | A | payoff | exhaust | Applies Vulnerable. Amplifies all damage from attacks. |
| 무감각 | Feel No Pain (287) | ironclad | A | engine | exhaust, block | Block per exhaust. Turns deck-thinning into consistent defense. Works with Corruption. |
| 화염 장벽 | Flame Barrier (489) | ironclad | A | defense | block | Block + retaliatory damage. Good tempo and damage mitigation. |
| 무적 | Impervious (326) | ironclad | A | defense | block | 2-cost 30 block exhaust. Huge early number. Skip once infinite assembled. |
| 발화 | Inflame (122) | ironclad | A | engine | strength | Permanent +2 Strength. Improves every attack for the rest of the fight. Near-auto-pick. |
| 절대적인 힘 | Juggernaut (709) | ironclad | A | payoff | block, exhaust | Deal 5 damage whenever you gain Block. Main damage dealer in Block builds. Also excellent  |
| 갈취 | Pillage (344) | ironclad | A | generator | strength, any | High damage that generates gold. Efficient in strength builds. |
| 불의 심장 | Pyre (362) | ironclad | A | generator | strike | Nuke your hand for massive damage. Powerful burst in exhaust decks. |
| 파열 | Rupture (223) | ironclad | A | engine | self_damage, strength | Gain 1 Strength when you lose HP. Stacks with copies. Bloodletting = free Strength every t |
| 기사회생 | Second Wind (408) | ironclad | A | generator | exhaust, block | Exhaust non-attacks for block. Powerful in skill-heavy decks with Dark Embrace. |
| 악의 | Spite (427) | ironclad | A | payoff | self_damage, exhaust | [Reworked v0.100.0] 0-cost Attack, Uncommon: Deal 5 dmg, hits 2(3) times if you lost HP th |
| 돌 갑옷 | Stone Armor (25) | ironclad | A | engine | block | Provides Plating for passive Block every turn. Strong in Block decks and excellent with Ju |
| 도발 | Taunt (386) | ironclad | A | generator | block, strike | Flexible setup card for Block and Strike. Upgraded Vulnerable makes it especially good wit |
| 난타 | Thrash (568) | ironclad | A | payoff | strength, exhaust | Scales with attacks played this turn. Good in attack-heavy strength builds. |
| 강령의 극의 | Necro Mastery (9373) | necrobinder | A | engine | osty | Summon 5. Whenever Osty loses HP, ALL enemies lose that much HP. Converts Osty tanking int |
| 파수꾼 | Protector (9354) | necrobinder | A | payoff | osty | Osty deals 10 damage plus additional damage equal to Osty's Max HP. A-tier — with high Sum |
| 부식 | Putrefy (9045) | necrobinder | A | generator | doom, any | Apply 2 Weak + 2 Vulnerable then Exhaust. A-tier setup — Exhaust means it's not a dead dra |
| 천원돌파 | Heavenly Drill (7331) | regent | A | payoff | stars, any | Deal 8 damage X times — doubles to 16xX when X is 4+. Needs Energy generation or Stars for |
| 검성 | Sword Sage (7459) | regent | A | engine | forge | [Buffed v0.101.0] Sovereign Blade now hits an additional time and no longer costs more Ene |
| 봉인된 왕좌 | The Sealed Throne (7518) | regent | A | engine | stars | Gain 1 Star every card played. With Void Form free cards, generates Stars effortlessly. Ef |
| 위대한 재련 | The Smith (7477) | regent | A | payoff | forge, stars | Forge 30 in one card. Near-instant win condition in Forge builds. Also viable as an eventu |
| 연마 | Abrasive (3449) | silent | A | engine | sly, any | Sly. Gain 1 Dexterity. Gain 4 Thorns. When discarded for free: costs 0 AND permanently gai |
| 잔상 | Afterimage (3984) | silent | A | engine | shiv, sly, any | Whenever you play a card, gain 1 Block. Passive block engine in any build — in Shiv spam t |
| 부식성 파도 | Corrosive Wave (3519) | silent | A | generator | poison, sly | Whenever you draw a card this turn, apply 3 Poison to ALL enemies. Draw 4 cards in one tur |
| 단검 투척 | Dagger Throw (2633) | silent | A | generator | sly, any | Deal 9 damage. Draw 1 card. Discard 1 card. Sly enabler — the discard triggers any Sly car |
| 독 바르기 | Envenom (2553) | silent | A | engine | poison, shiv | Attacks apply 1 poison. Synergizes Shiv + Poison builds. |
| 탈출구 | Escape Plan (3369) | silent | A | generator | sly, any | Draw 1 card. If you draw a Skill, gain 3 Block. In skill-heavy Silent decks almost always  |
| 정밀 사격 | Pinpoint (3834) | silent | A | payoff | sly, shiv, any | Deal 17 damage. Costs 1 less for each Skill played this turn. After 3 Skills played costs  |
| 예비 | Prepared (2531) | silent | A | generator | sly, any | [v0.100.0 rework reverted in v0.101.0] Back to launch state: 0-cost Common Skill — Draw 1  |
| 생존자 | Survivor (2674) | silent | A | generator | sly, any | Starting deck card with Sly. Block + discard = free Sly trigger. Your first Sly activator. |
| 강철의 섬광 | Flash of Steel (9414) | colorless | B | generator | claw, any | Deal 5 damage. Draw 1 card. B-tier — 0-cost damage and draw. Perfect in Claw Defect builds |
| 잭팟 | Jackpot (10316) | colorless | B | payoff | claw, any | Deal 25 damage. Add 3 random 0-cost cards to Hand. B-tier — strong damage plus 3 free 0-co |
| 번개 구체 | Ball Lightning (4174) | defect | B | generator | orb | Channel lightning + damage. Core of lightning builds. |
| 일제 사격 | Barrage (4154) | defect | B | payoff | orb | Hits per orb slot. More slots = more hits. Strong in focus builds. |
| 인지 편향 | Biased Cognition (4095) | defect | B | engine | orb | Gain 4 Focus. Each turn, lose 1 Focus. B-tier — enormous immediate Focus boost (4 Focus =  |
| 배터리 충전 | Charge Battery (4820) | defect | B | generator | orb, any | Gain 7 Block. Next turn, gain Energy. B-tier — reliable Block plus delayed Energy. One of  |
| 컴파일 드라이버 | Compile Driver (4274) | defect | B | payoff | claw, orb | Damage + draw cards per orb type. Key draw engine for both builds. |
| 냉정함 | Coolheaded (4133) | defect | B | generator | orb | Channel frost + draw. Upgraded draws 2. Strong in any Defect deck. |
| 어둠 | Darkness (4233) | defect | B | generator | orb | Channel dark + upgrade it. Dark orbs accumulate massive damage. |
| 이중 시전 | Dualcast (4379) | defect | B | payoff | orb | Evoke first orb twice. Great for Dark orb payoffs. |
| 밀집 타격 | Focused Strike (4839) | defect | B | generator | orb | Deal 9 damage. Gain 1 Focus this turn. B-tier — damage plus temporary Focus buff. Great ea |
| 융합 | Fusion (5053) | defect | B | generator | orb | Channel 1 Plasma. B-tier — Plasma passively gives Energy each turn. One Fusion in the righ |
| 우박 폭풍 | Hailstorm (5092) | defect | B | payoff | orb | At end of your turn, if you have Frost, deal 6 AoE. B-tier — free 6 AoE every turn you hav |
| 얼음 창 | Ice Lance (5536) | defect | B | generator | orb | Deal 19 damage. Channel 3 Frost. B-tier — huge damage plus 3 Frost orbs in one card. With  |
| 피뢰침 | Lightning Rod (4910) | defect | B | generator | orb | Gain 4 Block. Channel 1 Lightning at start of next 2 turns. B-tier — better Defend that al |
| 다중 시전 | Multi-Cast (5760) | defect | B | payoff | orb | Evoke orbs multiple times. Massive damage with Dark or Lightning orbs. |
| 무효 | Null (5131) | defect | B | generator | orb, any | Deal 10 damage. Apply 2 Weak. Channel 1 Dark. B-tier — damage, debuff, and Dark orb in one |
| 되돌리기 | Rebound (4436) | defect | B | generator | orb, any | Puts played card on top of draw. Useful for cycling key cards. |
| 그림자 방패 | Shadow Shield (5249) | defect | B | generator | orb | Gain 11 Block. Channel 1 Dark. B-tier — above-rate Block plus Dark orb. Dark passively gro |
| 산산조각 | Shatter (5627) | defect | B | payoff | orb | Deal 11 AoE damage. Evoke all Orbs. A-tier — mass Evoke plus AoE. With 3+ orbs, Evoking al |
| 동기화 | Synchronize (5326) | defect | B | generator | orb | Gain 2 Focus per unique Orb you have. Exhaust. B-tier — with 3+ unique orbs (Lightning, Fr |
| 테슬라 코일 | Tesla Coil (5382) | defect | B | payoff | orb | Deal 3 damage. Trigger all Lightning against the enemy. B-tier — with Focus and multiple L |
| 터보 | TURBO (4492) | defect | B | generator | claw, any | 2 energy + status to discard. Good energy gen. |
| 동전기 | Voltaic (5707) | defect | B | payoff | orb | [Nerfed v0.101.0] Energy cost 2→3. Channel Lightning equal to total Lightning Channeled th |
| 백색 소음 | White Noise (4788) | defect | B | generator | orb | Add a random Power to your hand. Useful for finding Defragment or Echo Form. |
| 잿빛 타격 | Ashen Strike (629) | ironclad | B | payoff | exhaust | High damage with exhaust synergy. Strong in exhaust-heavy decks. |
| 피의 벽 | Blood Wall (688) | ironclad | B | generator | self_damage, block | Big block at HP cost. Good in self-damage builds with Rupture. |
| 몽둥이질 | Bludgeon (786) | ironclad | B | payoff | strength | 3-cost 32 damage. Big hit for act 1 with Bloodletting energy. |
| 정면 돌파 | Breakthrough (803) | ironclad | B | generator | self_damage, strike | Useful early AoE that slots into Blood and Strike lists. Efficient coverage in multi-enemy |
| 악마의 형상 | Demon Form (990) | ironclad | B | engine | strength | Best passive Strength generation. +2 Strength every turn snowballs hard. Expensive at 3 En |
| 해체 | Dismantle (885) | ironclad | B | engine | exhaust | Exhaust attack synergy. |
| 덤벼라! | Fight Me! (1660) | ironclad | B | generator | strength, strike | Strength generator attached to multi-hit damage. Strong in Strength and Strike shells, but |
| 혈류 | Hemokinesis (608) | ironclad | B | generator | self_damage, strength | High damage at HP cost. Pairs with Rupture/Bloodletting. Good elite killer. [Buffed v0.100 |
| 지옥검 | Infernal Blade (826) | ironclad | B | generator | exhaust | Exhaust synergy attack. |
| 불굴 | Not Yet (2126) | ironclad | B | utility | any, self_damage, exhaust | [Added v0.103.0] Rare Skill, Cost 2: Heal 10(13) HP, Exhaust. Panic-button heal that also  |
| 폼멜 타격 | Pommel Strike (903) | ironclad | B | generator | strike | Solid Strike support card. Draw keeps aggressive decks moving and pairs well with Perfecte |
| 격노 | Rage (1638) | ironclad | B | engine | strength, strike | Attack-chain block engine. Best in Strike and Strength decks that play multiple attacks pe |
| 충격파 | Shockwave (1531) | ironclad | B | generator | block, strike | Apply 3 Weak and Vulnerable to ALL enemies. Exhaust. Strong setup card. |
| 흘려보내기 | Shrug It Off (866) | ironclad | B | defense | block, any | 1-cost block + draw. Consistent defense with hand refill. |
| 짓밟기 | Stomp (767) | ironclad | B | payoff | strength | Multi-hit that benefits from Vulnerable and Strength. |
| 진정한 끈기 | True Grit (730) | ironclad | B | generator | exhaust, block | Block + random exhaust. Helps thin deck while defending. Triggers Feel No Pain. |
| 어퍼컷 | Uppercut (1088) | ironclad | B | generator | strength, strike | Weak + Vulnerable tempo card. Solid but not outstanding. |
| 소용돌이 | Whirlwind (648) | ironclad | B | payoff | strength | Energy-scaling AoE. Best with Strength or energy relics. |
| 모독 | Defile (8746) | necrobinder | B | generator | doom | Ethereal. Deal 13 damage. B-tier early Doom card — efficient damage that helps drop enemie |
| 지연 | Delay (8285) | necrobinder | B | generator | doom, any | 11 block + next turn gain 1 energy. Key survival card for Doom builds that need to stay al |
| 쑤시기 | Poke (8824) | necrobinder | B | generator | osty | Osty deals 6 damage. B-tier — cheap Osty attack that enables Rattle multi-hit chains. The  |
| 분리 | Severance (9085) | necrobinder | B | generator | soul | Deal 13 damage. Add a Soul to Draw Pile, Hand, and Discard Pile. B-tier — 13 damage plus 3 |
| 격려 | Spur (9144) | necrobinder | B | generator | osty | Retain. Summon 3. Osty heals 5 HP. B-tier — Retain makes it safe to hold. Heals and grows  |
| 무기고 | Arsenal (7288) | regent | B | engine | stars, any | [Reworked v0.101.0] 1-cost Power, Rare, Innate: Whenever you create a card, gain 1 Strengt |
| 우주적 무관심 | Cosmic Indifference (6391) | regent | B | generator | stars, forge | Block + retrieve card from discard. One of the easiest ways to bring back Sovereign Blade  |
| 선조의 망치 | Heirloom Hammer (7352) | regent | B | generator | stars, any | 17 damage plus duplicates a Colorless card in hand. Pairs with Arsenal for double Strength |
| 나는 무적이다 | I Am Invincible (7371) | regent | B | engine | stars, any | Gain 9 Block. If on top of draw pile at end of turn, plays again. Recurring Block engine.  |
| 네 주제를 알라 | Know Thy Place (7072) | regent | B | generator | stars, forge | Weak + Vulnerable then Exhaust. Free setup for Comet, Gamma Blast, Sovereign Blade. |
| 권위 행사 | Manifest Authority (7137) | regent | B | generator | stars, any | 7 Block plus a random Colorless card. Fuels Arsenal and Pillar of Creation. |
| 궤도 | Orbit (7156) | regent | B | engine | stars, any | Every 4 Energy spent, gain 1 Energy. Too slow and too conditional for most runs. |
| 검날 개선 | Refine Blade (6987) | regent | B | generator | forge | [Buffed v0.101.0] Forge 9(13) (was 6(10)) + Energy next turn. Efficient Forge card that al |
| 스펙트럼 이동 | Spectrum Shift (7232) | regent | B | engine | stars, any | Add 1 random Colorless card at turn start. Passive engine for Arsenal and Pillar of Creati |
| 불릿 타임 | Bullet Time (3498) | silent | B | engine | sly, shiv | You cannot draw additional cards this turn. ALL cards in your Hand are free to play this t |
| 폭주 | Burst (2259) | silent | B | engine | sly, poison, shiv | This turn, your next Skill is played an extra time. Most Poison applicators are Skills — B |
| 망토와 단검 | Cloak And Dagger (2367) | silent | B | generator | shiv, any | 1 Shiv + block. Flexible card that works in any deck. |
| 전문성 | Expertise (2695) | silent | B | generator | sly, any | Draw up to 6 cards. Fills hand for Sly triggers. |
| 칼날 부채 | Fan Of Knives (2747) | silent | B | generator | shiv, any | Shivs now hit ALL enemies. Add 4 Shivs into your Hand. Dual effect — permanently makes all |
| 손기술 | Hand Trick (3132) | silent | B | engine | sly, shiv, poison | Gain 7 Block. Add Sly to a Skill in your Hand this turn. Gives ANY Skill the Sly keyword f |
| 아지랑이 | Haze (2467) | silent | B | payoff | sly, poison | Sly + applies 4 poison to ALL enemies. Insane value when discarded free. |
| 칼날 함정 | Knife Trap (2387) | silent | B | generator | shiv | Incredible finisher in shiv builds. Can play 15-20 Shivs in later turns. |
| 설계의 대가 | Master Planner (3045) | silent | B | engine | sly, any | When you play a Skill, it gains Sly. Permanent passive — every Skill you play becomes a Sl |
| 신기루 | Mirage (2596) | silent | B | payoff | poison | Block = total poison on all enemies. Insane defensive value in poison decks. |
| 환영검 | Phantom Blades (3815) | silent | B | engine | shiv | Shivs gain Retain. The first Shiv you play each turn deals 9 additional damage. Retained S |
| 정밀한 베기 | Precise Cut (3877) | silent | B | payoff | sly, shiv | Deal 13 damage. Deals 2 less damage for each other card in your Hand. Best after a big Sly |
| 그림자 걸음 | Shadow Step (3628) | silent | B | engine | sly, shiv | Discard your Hand. Next turn, Attacks deal double damage. Discarding triggers ALL Sly card |
| 연장 | Prolong (9919) | colorless | C | generator | block, stars | Next turn, gain Block equal to current Block. Exhaust. C-tier — doubles current Block next |
| 적응형 타격 | Adaptive Strike (5420) | defect | C | payoff | claw | Deal 18 damage. Add a 0-cost copy to Discard. C-tier — self-replicating 0-cost attack. In  |
| 레이저 포인터 | Beam Cell (4728) | defect | C | generator | claw, orb | 0-cost Vulnerable applicator. Core in Claw decks for easy Vulnerable. |
| 혼돈 | Chaos (4965) | defect | C | generator | orb | Channel 1 random Orb. C-tier — randomness is the limiting factor. Can hit Plasma for Energ |
| 꽃샘추위 | Cold Snap (4193) | defect | C | generator | orb | Channel frost + damage. Core of frost/block builds. |
| 창의적인 인공지능 | Creative AI (5480) | defect | C | engine | orb | At start of turn, add a random Power to Hand. C-tier — free Power every turn but random. C |
| 강행 돌파 | Fight Through (5035) | defect | C | generator | status | Gain 13 Block. Add 2 Wounds into Discard. C-tier — big Block but Wounds are dead cards. On |
| 대공포 | Flak Cannon (5498) | defect | C | payoff | status | Exhaust all Status cards. Deal 8 damage per card Exhausted. C-tier — in Status builds with |
| 틀어막기 | Gunk Up (4857) | defect | C | generator | status | Deal 4 damage 3 times. Add a Slimed into Discard. C-tier — multi-hit is nice but Slimed cl |
| 핫픽스 | Hotfix (4876) | defect | C | generator | orb | [Nerfed v0.100.0] Now has Exhaust. Gain 2 Focus this turn. Upgrade now removes Exhaust ins |
| 순회 | Iteration (5112) | defect | C | engine | status | First time you draw a Status card each turn, draw 2 cards. C-tier — transforms Status card |
| 반복 | Loop (4584) | defect | C | generator | orb | Re-channel leftmost orb. Useful for keeping good orbs. |
| 유성 타격 | Meteor Strike (4510) | defect | C | payoff | orb | Huge damage + 3 plasma orbs. |
| 추진 타격 | Momentum Strike (4708) | defect | C | generator | claw | Can be reduced to 0-cost. Synergizes with other 0-cost spam. |
| 오버클럭 | Overclock (5153) | defect | C | generator | claw, status | Draw 2 cards. Add a Burn into Discard. C-tier — great draw but adds Burn. In Claw or Statu |
| 굴절 | Refract (5172) | defect | C | generator | orb | Deal 9 damage twice. Channel 2 Glass. C-tier — multi-hit with Glass orb generation. Glass  |
| 로켓 펀치 | Rocket Punch (5210) | defect | C | payoff | status | [Buffed v0.100.0] Cost reduction now lasts until played (was end of turn). 13 damage, draw |
| 배기 장치 | Smokestack (5269) | defect | C | engine | status | Whenever you create a Status card, deal 5 AoE. C-tier — in Status builds with TURBO, Boost |
| 폭풍 | Storm (4454) | defect | C | engine | orb | Whenever you play a Power, Channel 1 Lightning. C-tier — generates Lightning passively for |
| 서브루틴 | Subroutine (5289) | defect | C | engine | orb | Whenever you play a Power, gain Energy. C-tier — free Energy per Power card. Scales well i |
| 합성 | Synthesis (5344) | defect | C | generator | orb | Deal 12 damage. Next Power costs 0. C-tier — enables free Defragment, free Machine Learnin |
| 벼락 | Thunder (5401) | defect | C | engine | orb | Whenever you Evoke Lightning, deal 6 AoE. C-tier — converts Lightning Evoke (normally sing |
| 고철을 보물로 | Trash to Treasure (5687) | defect | C | engine | status | Whenever you create a Status card, Channel 1 random Orb. C-tier — converts Status generati |
| 전투장비 | Armaments (1111) | ironclad | C | defense | block | Block + upgrade. Too slow. |
| 강타 | Bash (1008) | ironclad | C | generator | strike | Starter. 2-cost Vulnerable. Useful early but outclassed later. |
| 지옥불 | Fiend Fire (1490) | ironclad | C | payoff | exhaust | Exhaust hand, deal 7 damage per card. With Dark Embrace = draw them all back. |
| 저편의 울음소리 | Howl from Beyond (1935) | ironclad | C | payoff | exhaust, any | Deal 16 AoE, then it plays itself from the Exhaust Pile every turn start for FREE. After t |
| 광란 | Rampage (1185) | ironclad | C | payoff | strength | Scales each play. OK in strength builds. |
| 부메랑 칼날 | Sword Boomerang (1332) | ironclad | C | payoff | strength | Deal 3 damage 3 times to random enemies. Each hit benefits from Strength. Great multi-hit. |
| 천둥 | Thunderclap (1047) | ironclad | C | generator | strength, strike | AoE + Vulnerable. Helps control groups early. |
| 이중 타격 | Twin Strike (1351) | ironclad | C | payoff | strength, strike | Deal 5 damage twice. Each hit benefits from Strength. |
| 석회화 | Calcify (8914) | necrobinder | C | engine | osty | Osty attacks deal 4 additional damage. C-tier — flat Osty damage buff. Only good if Osty a |
| 반항 | Defy (8765) | necrobinder | C | generator | doom, any | [Changed v0.100.0] Ethereal. Gain 6 Block + apply 1 Weak. Upgrade no longer increases Weak |
| 매달기 | Hang (9216) | necrobinder | C | payoff | doom | Deal 10 damage. Doubles ALL Hang damage to this enemy. C-tier — exponential scaling but ex |
| 부름 | Invoke (8805) | necrobinder | C | generator | osty, any | Next turn, Summon 2 and gain 2 Energy. C-tier — delayed payoff hurts. Good when you can pl |
| 비애 | Melancholy (8987) | necrobinder | C | generator | doom, any | Gain 13 Block. Reduces cost by 1 each time ANYONE dies. C-tier — becomes powerful late gam |
| 비참함 | Misery (9235) | necrobinder | C | payoff | doom, any | Deal 7 damage. Apply all enemy debuffs to ALL other enemies. C-tier — spreads Weak/Vulnera |
| 서류 폭풍 | Pagestorm (9006) | necrobinder | C | engine | soul | Whenever you draw an Ethereal card, draw 1 more card. C-tier — strong in Ethereal-heavy bu |
| 끌어내리기 | Pull from Below (9026) | necrobinder | C | payoff | soul | Deal 5 damage per Ethereal card played this combat. C-tier — scales with Ethereal plays. G |
| 진정한 오른팔 | Right Hand Hand (9067) | necrobinder | C | generator | osty | Osty deals 4 damage. Returns from Discard when you play a 2+ Energy card. C-tier — recurri |
| 조각 타격 | Sculpting Strike (8857) | necrobinder | C | generator | soul | Deal 8 damage. Add Ethereal to a card in Hand. C-tier — adds Ethereal for Spirit of Ash/Pa |
| 경계 태세 | Sentry Mode (9277) | necrobinder | C | engine | osty | At start of turn, add 1 Sweeping Gaze to Hand. C-tier — generates a free Osty attack each  |
| 수의 | Shroud (9104) | necrobinder | C | engine | doom | Whenever you apply Doom, gain 2 Block. C-tier — passive Block per Doom application. In pur |
| 살점 재주 | Sleight of Flesh (9123) | necrobinder | C | engine | doom, any | Whenever you apply a debuff to an enemy, they take 9 damage. C-tier — in debuff-heavy buil |
| 파종 | Sow (8875) | necrobinder | C | generator | doom, any | Retain. Deal 8 damage to ALL enemies. C-tier — AoE with Retain is flexible but 2 Energy fo |
| 잿빛 혼령 | Spirit of Ash (9295) | necrobinder | C | engine | soul | Whenever you play an Ethereal card, gain 4 Block. C-tier — in Ethereal builds (Parse, Deme |
| 장막 관통자 | Veilpiercer (9165) | necrobinder | C | generator | soul | Deal 10 damage. Next Ethereal card costs 0. C-tier — enables free Parse, free Demesne, fre |
| 그렇게 하라 | Make It So (7391) | regent | C | payoff | stars | 6 damage that returns every 3 Skills. Interesting in Skill-heavy builds but too conditiona |
| 창백한 푸른 점 | Pale Blue Dot (7175) | regent | C | generator | stars | Draw 1 next turn if you played 5+ cards. Passive draw in big-turn builds. |
| 창조의 기둥 | Pillar of Creation (7194) | regent | C | engine | stars, any | Gain 3 Block per card created. Needs Spectrum Shift/Quasar shell — too conditional otherwi |
| 준항성 | Quasar (7214) | regent | C | generator | stars, any | Choose 1 of 3 Colorless cards. Flexible but random — feeds Arsenal/Pillar but not reliable |
| 초질량 | Supermassive (7252) | regent | C | payoff | stars | 5 damage + 3 per card created. Good in Colorless shell, weak otherwise. |
| 차오르는 독 | Bubble Bubble (2713) | silent | C | generator | poison | If the enemy has Poison, apply 9 Poison. Conditional but extremely efficient — 9 Poison fo |
| 숨겨진 단검 | Hidden Daggers (3749) | silent | C | generator | shiv, sly | Discard 2 cards. Add 2 Shivs into your Hand. Discards 2 cards triggering Sly effects for f |
| 살해 | Murder (3582) | silent | C | payoff | sly, any | Deal 1 damage. Deals 1 additional damage for each card drawn this combat. Scales with TOTA |
| 악몽 | Nightmare (3028) | silent | C | engine | sly, any | [Clarified v0.104.0] If the chosen card has an Affliction, it is removed from the copies a |
| 덮치기 | Pounce (3856) | silent | C | generator | sly, any | Deal 12 damage. The next Skill you play costs 0. 12 damage plus makes next Skill free — en |
| 구렁이의 형상 | Serpent Form (3604) | silent | C | engine | sly, shiv, any | [Buffed v0.101.0] Whenever you play a card, deal 4(6) damage to a random enemy. With high- |
| 스피드스터 | Speedster (3898) | silent | C | engine | sly, any | [Nerfed v0.102.0] Per-card damage 2(3) → 1(2). Still a workable scaling attack, but pacing |
| 목 조르기 | Strangle (3920) | silent | C | payoff | sly, any | Deal 8 damage. Whenever you play a card this turn, the enemy loses 2 HP. HP loss bypasses  |
| 연료 | Fuel (11112) | colorless | D | utility | status | Token. Gain Energy and draw 1 card. Exhaust. Generated by Compact in Defect Status builds  |
| 단도 | Shiv (11209) | colorless | D | generator | shiv | Token. Deal 4 damage. Exhaust. Generated by Blade Dance, Fan of Knives, Cloak and Dagger.  |
| 영혼 | Soul (11227) | colorless | D | generator | soul | Token. Draw 2 cards. Exhaust. Generated by Capture Spirit, Severance, Seance. Core to Necr |
| 군주의 칼날 | Sovereign Blade (11245) | colorless | D | payoff | forge | Token. Retain. Deal 10 damage base, scaling with Forge. Regent's Forge build win condition |
| 훑어보기 | Sweeping Gaze (11263) | colorless | D | utility | osty | Token. Ethereal. Osty deals 10 damage to a random enemy. Generated by Sentry Mode. Etherea |
| 뇌우 | Tempest (5363) | defect | D | generator | orb | Channel X Lightning. D-tier — scales with Energy spent but Lightning passive damage is onl |
| 파지직 | Zap (4530) | defect | D | generator | orb | Basic lightning channel. Early filler. |
| 경계 엿보기 | Glimpse Beyond (9199) | necrobinder | D | generator | soul | ALL players add 3 Souls to Draw Pile. Exhaust. D-tier — splits the benefit with allies. So |
| 해골 군단 | Legion of Bone (8970) | necrobinder | D | generator | osty | ALL players Summon 6. Exhaust. D-tier — splitting Summon with allies limits solo value. Ex |
| 망치질 시간 | Hammer Time (7314) | regent | D | engine | forge | Forge extends to allies — solo play value is minimal. |

## 3. 실제 점수 확인 — S·A 티어 66장 × 비소속 아키타입

조건: 조사 D·E와 동일한 기준선(아키타입 강제 활성 strength=1.0 · 빈 덱 · 유물 없음 · floor=20 · act=2). 콜로리스 카드는 5캐릭터 전 아키타입에서 채점되므로 전부 나열. "감점 근거"는 scoreCard의 antiReasons 실출력.

| 카드 | 자기 builds | 평가 아키타입 | 현재 점수·등급 | 감점 근거 |
|---|---|---|---|---|
| 위풍당당 (S) | claw, sly, any | ironclad/strength | 4.75 (S) | -0.9 발톱 카드라 힘 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | ironclad/block | 3.95 (A) | -0.9 발톱 카드라 방어 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | ironclad/exhaust | 3.95 (A) | -0.9 발톱 카드라 소진 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | ironclad/self_damage | 3.95 (A) | -0.9 발톱 카드라 사혈/자해 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | ironclad/strike | 4.75 (S) | -0.9 발톱 카드라 타격 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | silent/poison | 4.97 (S) | -0.9 발톱 카드라 중독 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | silent/shiv | 4.97 (S) | -0.9 발톱 카드라 비수 난사 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | defect/orb | 4.91 (S) | -0.9 발톱 카드라 구체/집중 엔진 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | defect/status | 4.11 (A) | -0.9 발톱 카드라 상태이상 엔진 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | regent/stars | 4.79 (S) | -0.9 발톱 카드라 별 엔진 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | regent/forge | 4.79 (S) | -0.9 발톱 카드라 단조/군주의 검 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | necrobinder/soul | 4.87 (S) | -0.9 발톱 카드라 영혼 엔진 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | necrobinder/osty | 4.87 (S) | -0.9 발톱 카드라 골골이/소환 빌드와 안 맞음 |
| 위풍당당 (S) | claw, sly, any | necrobinder/doom | 4.87 (S) | -0.9 발톱 카드라 파멸 중첩 빌드와 안 맞음 |
| 빙하 (S) | orb | defect/claw | 3.20 (B) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 빙하 (S) | orb | defect/status | 3.20 (B) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 모드 적용 (S) | orb | defect/claw | 4.30 (A) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 |
| 모드 적용 (S) | orb | defect/status | 4.30 (A) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 |
| 걷어내기 (S) | claw, any | defect/orb | 3.73 (A) | -0.9 발톱 카드라 구체/집중 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 걷어내기 (S) | claw, any | defect/status | 4.53 (S) | -0.9 발톱 카드라 상태이상 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 스피너 (S) | orb | defect/claw | 4.11 (A) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 |
| 스피너 (S) | orb | defect/status | 3.31 (B) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 |
| 임계 초과 (S) | orb | defect/claw | 4.35 (S) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 임계 초과 (S) | orb | defect/status | 3.55 (A) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 사혈 (S) | self_damage | ironclad/strength | 3.82 (A) | -0.9 사혈 카드라 힘 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 사혈 (S) | self_damage | ironclad/block | 3.02 (B) | -0.9 사혈 카드라 방어 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 사혈 (S) | self_damage | ironclad/exhaust | 3.82 (A) | -0.9 사혈 카드라 소진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 사혈 (S) | self_damage | ironclad/strike | 3.02 (B) | -0.9 사혈 카드라 타격 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 거상 (S) | block, strike | ironclad/strength | 4.29 (A) | -0.9 방어 카드라 힘 빌드와 안 맞음 |
| 거상 (S) | block, strike | ironclad/exhaust | 4.29 (A) | -0.9 방어 카드라 소진 빌드와 안 맞음 |
| 거상 (S) | block, strike | ironclad/self_damage | 4.29 (A) | -0.9 방어 카드라 사혈/자해 빌드와 안 맞음 |
| 포식 (S) | self_damage, any | ironclad/strength | 4.00 (A) | -0.9 사혈 카드라 힘 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 포식 (S) | self_damage, any | ironclad/block | 3.20 (B) | -0.9 사혈 카드라 방어 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 포식 (S) | self_damage, any | ironclad/exhaust | 3.20 (B) | -0.9 사혈 카드라 소진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 포식 (S) | self_damage, any | ironclad/strike | 4.00 (A) | -0.9 사혈 카드라 타격 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 제물 (S) | self_damage, exhaust | ironclad/strength | 4.80 (S) | -0.9 사혈 카드라 힘 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 제물 (S) | self_damage, exhaust | ironclad/block | 4.80 (S) | -0.9 사혈 카드라 방어 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 제물 (S) | self_damage, exhaust | ironclad/strike | 4.80 (S) | -0.9 사혈 카드라 타격 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 정화 (S) | osty, any | necrobinder/soul | 4.21 (A) | -0.9 골골이 카드라 영혼 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 정화 (S) | osty, any | necrobinder/doom | 3.41 (A) | -0.9 골골이 카드라 파멸 중첩 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 강령회 (S) | soul | necrobinder/osty | 3.93 (A) | -0.9 영혼 카드라 골골이/소환 빌드와 안 맞음 |
| 강령회 (S) | soul | necrobinder/doom | 3.93 (A) | -0.9 영혼 카드라 파멸 중첩 빌드와 안 맞음 |
| 곡예 (S) | sly, any | silent/poison | 3.69 (A) | -0.9 교활 카드라 중독 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 곡예 (S) | sly, any | silent/shiv | 3.69 (A) | -0.9 교활 카드라 비수 난사 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | ironclad/strength | 3.75 (A) | -0.9 발톱 카드라 힘 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | ironclad/block | 4.55 (S) | -0.9 발톱 카드라 방어 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | ironclad/exhaust | 4.55 (S) | -0.9 발톱 카드라 소진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | ironclad/self_damage | 4.55 (S) | -0.9 발톱 카드라 사혈/자해 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | ironclad/strike | 4.55 (S) | -0.9 발톱 카드라 타격 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | silent/sly | 4.62 (S) | -0.9 발톱 카드라 교활/버리기 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | silent/poison | 3.82 (A) | -0.9 발톱 카드라 중독 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | silent/shiv | 3.82 (A) | -0.9 발톱 카드라 비수 난사 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | defect/orb | 3.82 (A) | -0.9 발톱 카드라 구체/집중 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | defect/status | 4.62 (S) | -0.9 발톱 카드라 상태이상 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | regent/stars | 4.62 (S) | -0.9 발톱 카드라 별 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | regent/forge | 3.82 (A) | -0.9 발톱 카드라 단조/군주의 검 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | necrobinder/soul | 4.61 (S) | -0.9 발톱 카드라 영혼 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | necrobinder/osty | 3.81 (A) | -0.9 발톱 카드라 골골이/소환 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 비밀 병기 (A) | claw, any | necrobinder/doom | 3.81 (A) | -0.9 발톱 카드라 파멸 중첩 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 버퍼 (A) | orb, any | defect/claw | 3.12 (B) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 |
| 버퍼 (A) | orb, any | defect/status | 2.02 (C) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 오한 (A) | orb | defect/claw | 2.89 (B) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 오한 (A) | orb | defect/status | 2.89 (B) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 압축 (A) | status | defect/orb | 3.70 (A) | -0.9 상태이상 카드라 구체/집중 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 압축 (A) | status | defect/claw | 2.90 (B) | -0.9 상태이상 카드라 발톱/0코스트 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 그림자 소모 (A) | orb | defect/claw | 2.61 (B) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 |
| 그림자 소모 (A) | orb | defect/status | 2.61 (B) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 |
| 냉각재 (A) | orb | defect/claw | 4.15 (A) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 |
| 냉각재 (A) | orb | defect/status | 3.35 (B) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 |
| 유리 공예 (A) | orb | defect/claw | 1.82 (C) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 유리 공예 (A) | orb | defect/status | 1.82 (C) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 홀로그램 (A) | claw | defect/orb | 2.80 (B) | -0.9 발톱 카드라 구체/집중 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 홀로그램 (A) | claw | defect/status | 3.60 (A) | -0.9 발톱 카드라 상태이상 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 기계학습 (A) | claw, orb | defect/status | 4.26 (A) | -0.9 발톱 카드라 상태이상 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 다중 시전 (A) | orb | defect/claw | 1.74 (C) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 다중 시전 (A) | orb | defect/status | 0.94 (D) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 사중 시전 (A) | orb | defect/claw | 0.30 (D) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 사중 시전 (A) | orb | defect/status | 0.30 (D) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 무지개 (A) | orb | defect/claw | 2.61 (B) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 무지개 (A) | orb | defect/status | 2.61 (B) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 신호 증폭 (A) | orb | defect/claw | 4.12 (A) | -0.9 구체 카드라 발톱/0코스트 빌드와 안 맞음 |
| 신호 증폭 (A) | orb | defect/status | 3.32 (B) | -0.9 구체 카드라 상태이상 엔진 빌드와 안 맞음 |
| 공격성 (A) | exhaust | ironclad/strength | 4.07 (A) | -0.9 소진 카드라 힘 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 공격성 (A) | exhaust | ironclad/block | 4.07 (A) | -0.9 소진 카드라 방어 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 공격성 (A) | exhaust | ironclad/self_damage | 4.07 (A) | -0.9 소진 카드라 사혈/자해 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 공격성 (A) | exhaust | ironclad/strike | 4.07 (A) | -0.9 소진 카드라 타격 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 바리케이드 (A) | block | ironclad/strength | 4.47 (S) | -0.9 방어 카드라 힘 빌드와 안 맞음 |
| 바리케이드 (A) | block | ironclad/exhaust | 4.47 (S) | -0.9 방어 카드라 소진 빌드와 안 맞음 |
| 바리케이드 (A) | block | ironclad/self_damage | 3.67 (A) | -0.9 방어 카드라 사혈/자해 빌드와 안 맞음 |
| 바리케이드 (A) | block | ironclad/strike | 3.67 (A) | -0.9 방어 카드라 타격 빌드와 안 맞음 |
| 낙인 (A) | exhaust, self_damage, strength | ironclad/block | 3.10 (B) | -0.9 소진 카드라 방어 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 낙인 (A) | exhaust, self_damage, strength | ironclad/strike | 3.10 (B) | -0.9 소진 카드라 타격 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 불타는 조약 (A) | exhaust, any | ironclad/strength | 3.18 (B) | -0.9 소진 카드라 힘 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 불타는 조약 (A) | exhaust, any | ironclad/block | 3.98 (A) | -0.9 소진 카드라 방어 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 불타는 조약 (A) | exhaust, any | ironclad/self_damage | 3.98 (A) | -0.9 소진 카드라 사혈/자해 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 불타는 조약 (A) | exhaust, any | ironclad/strike | 3.98 (A) | -0.9 소진 카드라 타격 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 대화재 (A) | aoe, strength, vulnerable | ironclad/block | 1.18 (D) | -0.9 aoe 카드라 방어 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 대화재 (A) | aoe, strength, vulnerable | ironclad/exhaust | 1.18 (D) | -0.9 aoe 카드라 소진 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 대화재 (A) | aoe, strength, vulnerable | ironclad/self_damage | 1.98 (C) | -0.9 aoe 카드라 사혈/자해 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 대화재 (A) | aoe, strength, vulnerable | ironclad/strike | 1.98 (C) | -0.9 aoe 카드라 타격 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 핏빛 망토 (A) | self_damage, block | ironclad/strength | 3.10 (B) | -0.9 사혈 카드라 힘 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 |
| 핏빛 망토 (A) | self_damage, block | ironclad/exhaust | 3.10 (B) | -0.9 사혈 카드라 소진 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 |
| 핏빛 망토 (A) | self_damage, block | ironclad/strike | 2.00 (C) | -0.9 사혈 카드라 타격 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 악랄함 (A) | strike | ironclad/strength | 4.02 (A) | -0.9 타격 카드라 힘 빌드와 안 맞음 |
| 악랄함 (A) | strike | ironclad/block | 3.22 (B) | -0.9 타격 카드라 방어 빌드와 안 맞음 |
| 악랄함 (A) | strike | ironclad/exhaust | 3.22 (B) | -0.9 타격 카드라 소진 빌드와 안 맞음 |
| 악랄함 (A) | strike | ironclad/self_damage | 3.22 (B) | -0.9 타격 카드라 사혈/자해 빌드와 안 맞음 |
| 어둠의 포옹 (A) | exhaust | ironclad/strength | 3.61 (A) | -0.9 소진 카드라 힘 빌드와 안 맞음 |
| 어둠의 포옹 (A) | exhaust | ironclad/block | 4.41 (S) | -0.9 소진 카드라 방어 빌드와 안 맞음 |
| 어둠의 포옹 (A) | exhaust | ironclad/self_damage | 4.41 (S) | -0.9 소진 카드라 사혈/자해 빌드와 안 맞음 |
| 어둠의 포옹 (A) | exhaust | ironclad/strike | 4.41 (S) | -0.9 소진 카드라 타격 빌드와 안 맞음 |
| 참호 (A) | block | ironclad/strength | 3.49 (A) | -0.9 방어 카드라 힘 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 참호 (A) | block | ironclad/exhaust | 3.49 (A) | -0.9 방어 카드라 소진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 참호 (A) | block | ironclad/self_damage | 2.69 (B) | -0.9 방어 카드라 사혈/자해 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 참호 (A) | block | ironclad/strike | 2.69 (B) | -0.9 방어 카드라 타격 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 악마의 눈 (A) | exhaust | ironclad/strength | 1.73 (C) | -0.9 소진 카드라 힘 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 악마의 눈 (A) | exhaust | ironclad/block | 0.93 (D) | -0.9 소진 카드라 방어 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 악마의 눈 (A) | exhaust | ironclad/self_damage | 0.93 (D) | -0.9 소진 카드라 사혈/자해 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 악마의 눈 (A) | exhaust | ironclad/strike | 1.73 (C) | -0.9 소진 카드라 타격 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 무감각 (A) | exhaust, block | ironclad/strength | 3.39 (B) | -0.9 소진 카드라 힘 빌드와 안 맞음 |
| 무감각 (A) | exhaust, block | ironclad/self_damage | 3.39 (B) | -0.9 소진 카드라 사혈/자해 빌드와 안 맞음 |
| 무감각 (A) | exhaust, block | ironclad/strike | 3.39 (B) | -0.9 소진 카드라 타격 빌드와 안 맞음 |
| 화염 장벽 (A) | block | ironclad/strength | 3.52 (A) | -0.9 방어 카드라 힘 빌드와 안 맞음 |
| 화염 장벽 (A) | block | ironclad/exhaust | 3.52 (A) | -0.9 방어 카드라 소진 빌드와 안 맞음 |
| 화염 장벽 (A) | block | ironclad/self_damage | 2.72 (B) | -0.9 방어 카드라 사혈/자해 빌드와 안 맞음 |
| 화염 장벽 (A) | block | ironclad/strike | 3.52 (A) | -0.9 방어 카드라 타격 빌드와 안 맞음 |
| 무적 (A) | block | ironclad/strength | 3.62 (A) | -0.9 방어 카드라 힘 빌드와 안 맞음 |
| 무적 (A) | block | ironclad/exhaust | 4.42 (S) | -0.9 방어 카드라 소진 빌드와 안 맞음 |
| 무적 (A) | block | ironclad/self_damage | 3.62 (A) | -0.9 방어 카드라 사혈/자해 빌드와 안 맞음 |
| 무적 (A) | block | ironclad/strike | 3.62 (A) | -0.9 방어 카드라 타격 빌드와 안 맞음 |
| 발화 (A) | strength | ironclad/block | 2.14 (C) | -0.9 힘 카드라 방어 빌드와 안 맞음 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 발화 (A) | strength | ironclad/exhaust | 2.14 (C) | -0.9 힘 카드라 소진 빌드와 안 맞음 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 발화 (A) | strength | ironclad/self_damage | 3.24 (B) | -0.9 힘 카드라 사혈/자해 빌드와 안 맞음 |
| 발화 (A) | strength | ironclad/strike | 3.24 (B) | -0.9 힘 카드라 타격 빌드와 안 맞음 |
| 절대적인 힘 (A) | block, exhaust | ironclad/strength | 2.20 (C) | -0.9 방어 카드라 힘 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 절대적인 힘 (A) | block, exhaust | ironclad/self_damage | 1.40 (D) | -0.9 방어 카드라 사혈/자해 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 절대적인 힘 (A) | block, exhaust | ironclad/strike | 2.20 (C) | -0.9 방어 카드라 타격 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 갈취 (A) | strength, any | ironclad/block | 2.93 (B) | -0.9 힘 카드라 방어 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 갈취 (A) | strength, any | ironclad/exhaust | 2.93 (B) | -0.9 힘 카드라 소진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 갈취 (A) | strength, any | ironclad/self_damage | 2.93 (B) | -0.9 힘 카드라 사혈/자해 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 갈취 (A) | strength, any | ironclad/strike | 3.73 (A) | -0.9 힘 카드라 타격 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 불의 심장 (A) | strike | ironclad/strength | 3.94 (A) | -0.9 타격 카드라 힘 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 불의 심장 (A) | strike | ironclad/block | 3.14 (B) | -0.9 타격 카드라 방어 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 불의 심장 (A) | strike | ironclad/exhaust | 3.94 (A) | -0.9 타격 카드라 소진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 불의 심장 (A) | strike | ironclad/self_damage | 3.94 (A) | -0.9 타격 카드라 사혈/자해 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 파열 (A) | self_damage, strength | ironclad/block | 2.69 (B) | -0.9 사혈 카드라 방어 빌드와 안 맞음 |
| 파열 (A) | self_damage, strength | ironclad/exhaust | 2.69 (B) | -0.9 사혈 카드라 소진 빌드와 안 맞음 |
| 파열 (A) | self_damage, strength | ironclad/strike | 2.69 (B) | -0.9 사혈 카드라 타격 빌드와 안 맞음 |
| 기사회생 (A) | exhaust, block | ironclad/strength | 3.04 (B) | -0.9 소진 카드라 힘 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 기사회생 (A) | exhaust, block | ironclad/self_damage | 3.04 (B) | -0.9 소진 카드라 사혈/자해 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 기사회생 (A) | exhaust, block | ironclad/strike | 3.04 (B) | -0.9 소진 카드라 타격 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 악의 (A) | self_damage, exhaust | ironclad/strength | 1.63 (C) | -0.9 사혈 카드라 힘 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 악의 (A) | self_damage, exhaust | ironclad/block | 0.83 (D) | -0.9 사혈 카드라 방어 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 악의 (A) | self_damage, exhaust | ironclad/strike | 0.83 (D) | -0.9 사혈 카드라 타격 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 돌 갑옷 (A) | block | ironclad/strength | 3.71 (A) | -0.9 방어 카드라 힘 빌드와 안 맞음 |
| 돌 갑옷 (A) | block | ironclad/exhaust | 3.71 (A) | -0.9 방어 카드라 소진 빌드와 안 맞음 |
| 돌 갑옷 (A) | block | ironclad/self_damage | 2.91 (B) | -0.9 방어 카드라 사혈/자해 빌드와 안 맞음 |
| 돌 갑옷 (A) | block | ironclad/strike | 2.91 (B) | -0.9 방어 카드라 타격 빌드와 안 맞음 |
| 도발 (A) | block, strike | ironclad/strength | 3.67 (A) | -0.9 방어 카드라 힘 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 도발 (A) | block, strike | ironclad/exhaust | 3.67 (A) | -0.9 방어 카드라 소진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 도발 (A) | block, strike | ironclad/self_damage | 2.87 (B) | -0.9 방어 카드라 사혈/자해 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 난타 (A) | strength, exhaust | ironclad/block | 1.27 (D) | -0.9 힘 카드라 방어 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 난타 (A) | strength, exhaust | ironclad/self_damage | 2.07 (C) | -0.9 힘 카드라 사혈/자해 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 난타 (A) | strength, exhaust | ironclad/strike | 2.07 (C) | -0.9 힘 카드라 타격 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 강령의 극의 (A) | osty | necrobinder/soul | 3.96 (A) | -0.9 골골이 카드라 영혼 엔진 빌드와 안 맞음 |
| 강령의 극의 (A) | osty | necrobinder/doom | 3.96 (A) | -0.9 골골이 카드라 파멸 중첩 빌드와 안 맞음 |
| 파수꾼 (A) | osty | necrobinder/soul | 1.43 (D) | -0.9 골골이 카드라 영혼 엔진 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 파수꾼 (A) | osty | necrobinder/doom | 1.43 (D) | -0.9 골골이 카드라 파멸 중첩 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 부식 (A) | doom, any | necrobinder/soul | 4.13 (A) | -0.9 파멸 카드라 영혼 엔진 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 부식 (A) | doom, any | necrobinder/osty | 3.33 (B) | -0.9 파멸 카드라 골골이/소환 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 천원돌파 (A) | stars, any | regent/forge | 2.78 (B) | -0.9 별 카드라 단조/군주의 검 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 |
| 검성 (A) | forge | regent/stars | 3.39 (B) | -0.9 단조 카드라 별 엔진 빌드와 안 맞음 |
| 봉인된 왕좌 (A) | stars | regent/forge | 4.48 (S) | -0.9 별 카드라 단조/군주의 검 빌드와 안 맞음 |
| 연마 (A) | sly, any | silent/poison | 5.02 (S) | -0.9 교활 카드라 중독 빌드와 안 맞음 |
| 연마 (A) | sly, any | silent/shiv | 5.02 (S) | -0.9 교활 카드라 비수 난사 빌드와 안 맞음 |
| 잔상 (A) | shiv, sly, any | silent/poison | 5.30 (S) | -0.9 비수 카드라 중독 빌드와 안 맞음 |
| 부식성 파도 (A) | poison, sly | silent/shiv | 3.21 (B) | -0.9 중독 카드라 비수 난사 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 단검 투척 (A) | sly, any | silent/poison | 2.12 (C) | -0.9 교활 카드라 중독 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 단검 투척 (A) | sly, any | silent/shiv | 2.12 (C) | -0.9 교활 카드라 비수 난사 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 독 바르기 (A) | poison, shiv | silent/sly | 3.19 (B) | -0.9 중독 카드라 교활/버리기 빌드와 안 맞음 |
| 탈출구 (A) | sly, any | silent/poison | 4.32 (S) | -0.9 교활 카드라 중독 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 탈출구 (A) | sly, any | silent/shiv | 4.32 (S) | -0.9 교활 카드라 비수 난사 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 정밀 사격 (A) | sly, shiv, any | silent/poison | 0.89 (D) | -0.9 교활 카드라 중독 빌드와 안 맞음 · -1.5 엔진이 없어 보상(페이오프) 카드가 무용지물 · -0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요 |
| 예비 (A) | sly, any | silent/poison | 3.10 (B) | -0.9 교활 카드라 중독 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 예비 (A) | sly, any | silent/shiv | 3.10 (B) | -0.9 교활 카드라 비수 난사 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 생존자 (A) | sly, any | silent/poison | 4.20 (A) | -0.9 교활 카드라 중독 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |
| 생존자 (A) | sly, any | silent/shiv | 4.20 (A) | -0.9 교활 카드라 비수 난사 빌드와 안 맞음 · -0.1 첫 생성기 - 곧 보상 카드를 챙기세요 |

§3 요약 수치: 총 187행(카드×비소속 아키타입) 중 **35행이 감점 후에도 S 유지**. 187행 전부에서 misfit 감점("~카드라 ~빌드와 안 맞음", logic.js:317)은 출력됐고, anti 충돌 감점("~빌드와 충돌", logic.js:206)은 0행 — anti가 비어 있으므로 정의상 발화 불가.

## 4. notes에 조건이 있으나 태그화 안 된 카드

판정 기준(보고서 명시 의무):

- 범위: **S·A 티어 전체 168장**(로드 후, S 55 + A 113). 기계적 전수 판독이 어려워 범위를 좁혔다.
- 1차 탐지: notes에 조건 지시 표현이 있는 카드를 정규식으로 추출 — `in X build/deck`, `X builds`, `without`, `useless`, `require/need`, `only if/in/with`, `unless`, `dead card/draw`, `falls off`, `worse/weak in`, `if you have/don't`, `depends on` 등. **후보 41장**.
- 2차 판정(수동): 후보 각각에 대해 notes의 조건 서술이 builds / anti / syn / mech / DB.combos 어디에도 대응 표현이 없는 경우만 채택. "X 빌드에서 강함"이 builds에 X로 이미 있으면 표현된 것으로 간주.
- 한계: 정규식에 안 걸리는 표현의 조건 서술은 누락될 수 있다. B~D 티어는 미검토.

채택 결과 — **조건 일부가 어떤 태그로도 표현 안 된 카드 10장**:

| 카드 | 캐릭터 | tier | notes의 조건 서술 | 태그로 표현된 부분 | 표현 안 된 부분 |
|---|---|---|---|---|---|
| 위풍당당 (Panache, db.js:9468) | colorless | S | "in Claw or Sly builds playing **10+ cards per turn**" | builds:[claw, sly] | '턴당 카드 10장+' 수량 조건. anti도 빈칸 |
| 불의 심장 (Pyre, db.js:362) | ironclad | A | "Powerful burst in **exhaust decks**" | syn·mech에 exhaust | builds가 [strike] — 소진 빌드 소속 미반영 |
| 난타 (Thrash, db.js:568) | ironclad | A | "Scales with attacks played this turn. **attack-heavy** strength builds" | builds:[strength, exhaust], mech:[conditional] | '턴당 공격 다수' 조건 태그 없음 |
| 탈출구 (Escape Plan, db.js:3369) | silent | A | "In **skill-heavy** Silent decks almost always triggers" | builds:[sly, any], mech:[conditional] | '스킬 비중 높음' 조건 태그 없음 |
| 들춰내기 (Expose, db.js:3390) | silent | A | "Crucial for **Poison and Shiv builds** against Artifact bosses" | syn에 poison | builds가 [any] 단독 — poison·shiv 소속 미반영, shiv는 syn에도 없음 |
| 냉각재 (Coolant, db.js:5460) | defect | A | "with **3+ unique orbs**, gives 6+ free Block" | builds:[orb] | '고유 구체 3개+' 수량 조건 태그 없음 |
| 재부팅 (Reboot, db.js:5610) | defect | A | "In fast **Claw builds** or when deck is almost exhausted" | builds:[any], syn:[draw] | claw 소속·조건이 builds/syn 어디에도 없음 |
| 천원돌파 (Heavenly Drill, db.js:7331) | regent | A | "**Needs Energy generation or Stars** for maximum impact" | builds:[stars, any], mech:[x_cost] | '에너지 생성 필요' 조건 태그 없음 |
| 죽음의 행진 (Death March, db.js:8263) | necrobinder | A | "in Soul builds **drawing 5-7 cards per turn**" | builds:[soul] | '턴당 드로우 다수' 조건 — syn·mech에 draw 계열 태그 없음 |
| 강령의 극의 (Necro Mastery, db.js:9373) | necrobinder | A | "**Requires reliably keeping Osty alive**" | builds:[osty] | '오스티 생존 유지' 조건 태그 없음 |

참고(반대 사례 — 조건이 이미 연결돼 있는 경우): 참호(Entrench)의 "In Barricade builds this becomes absurd"는 DB.combos에 Barricade↔Entrench 양방향 콤보(db.js:11710-11717)로, 부식(Putrefy)의 "Pairs with Debilitate"는 Debilitate→Putrefy 콤보(db.js:14824-14825)로 이미 점수에 반영된다. 즉 카드 단위 조건을 태그 밖에서 연결하는 기제(DB.combos)는 존재하며 일부 카드에는 이미 쓰이고 있다.

## 5. `anti` 부여 기준 추적

anti 채워진 카드의 분해 (캐릭터 고유 카드, 콜로리스는 0):

| 구분 | 장수 |
|---|---|
| anti 채워진 카드 — db.js 원본 | 161 (591 − 430) |
| anti 채워진 카드 — 앱 로드 후 | 159 (575 − 416) |
| 그중 조사 E의 공식("전체 아키타입 − 자기 builds") 정확 일치 | **115** (regent 44 + necrobinder 45 + silent 25 + ironclad 1) |
| 나머지 | **44** (ironclad 26 · defect 10 · silent 3 · regent 2 · necrobinder 3) |

나머지 44장의 anti 성분: 아키타입 id만 38장 / 아키 id + 일반 태그 혼합 4장(defect의 All for One·Claw·Feral·Hyperbeam — `focus`/`frost` 혼합, 조사 E §5) / 일반 태그만 2장:

- 싸움 준비(Expect A Fight, db.js:184) — anti:[exhaust_heavy]. `exhaust_heavy`는 db.js 전체에서 이 1곳에만 등장(196행)하며, 어떤 아키타입의 core/support에도, 어떤 카드의 syn/mech에도 없다 → 아키 경로(logic.js:203)와 덱 태그 경로(logic.js:213, unionCount) 모두에서 **발화 불가능한 태그**.
- 유령의 형상(Wraith Form, db.js:3709) — anti:[dexterity, block]. 일반 태그형 — 아키 support(중독·비수의 block, 비수의 dexterity)와 덱 태그 경로에서 발화(조사 E §5-b에서 실측 확인).

커밋 히스토리:

- db.js를 만진 전 커밋에서 anti 채워진 카드 수: 저장소 시초(22148a8, 2026-07-13)부터 **163장으로 시작**, 이후 유일한 변화는 162a285(8/24, A항목 syn/anti 중복 정리)에서 **2장 감소 → 161장**(silent/BURST의 [shiv], regent/DECISIONS_DECISIONS의 [forge]가 비워짐). **이력 안에서 anti 대량 추가 커밋은 없다** — anti 대량 부여는 any(조사 D)와 마찬가지로 저장소 이력 이전.
- 설계 문서: 어드바이저_설계서.md, 현재상태.md, CHANGELOG.md에 anti 부여 기준 서술 없음(grep 확인. README.md:77의 "anti-synergy notes"는 표시 기능 설명이지 부여 기준이 아님).
- **결론: 공식 일괄생성 115장 외 44장의 부여 기준·시점·주체는 확인 못 함.** 확인된 것은 (1) 저장소 이력 이전 존재, (2) 44장 구성이 캐릭터별로 불균일(ironclad 26장 집중)하고 태그 종류가 다양해 공식형과 패턴이 다르다는 것, (3) 이력 내 변화는 8/24 정리 2장뿐이라는 것.

## 6. 무색 카드 특수성

| 확인 항목 | 결과 |
|---|---|
| 의도적 설계 근거(문서·주석·코드) | **확인 못 함** — 어드바이저_설계서.md·README.md·CHANGELOG.md·확인목록_TODO.md에 "무색 카드는 anti를 두지 않는다"류 서술 없음. db.js colorless 구역에 관련 주석 없음 |
| 단순 미작업 여부 | **확인 못 함** — 판단 근거 없음. 관측 사실만: 저장소 시초부터 무색 126장 전부 anti가 비어 있고(캐릭터 중 유일한 100%), any 보유율은 46%로 5캐릭터 평균(약 32%)보다 높다(조사 D §0) |
| 채점 경로 차이 | **차이 없음(확인됨)** — logic.js에서 `colorless`는 getCard 폴백 2행뿐(logic.js:956-957): 캐릭터 카드에 없으면 colorless에서 찾아 **동일한 scoreCard 경로**로 채점. scoreCard·scoreRemoval·scoreRelic 내부에 colorless 분기 없음 |

index.html의 colorless 등장 지점(594, 609, 932-933, 1014-1015, 1023행)은 전부 카드 선택 탭 분류·자동완성 소스·상점 6-7칸 기본 필터 등 **풀 구성과 표시** 코드이며 채점 로직이 아니다. 즉 무색 카드는 채점상 "anti가 빈 캐릭터 카드"와 완전히 동일하게 취급되고, §3에서 실측했듯 misfit 감점만 받고 anti 충돌 감점은 구조적으로 받을 수 없다.
