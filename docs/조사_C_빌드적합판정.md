# 조사 C — 빌드 적합 판정이 너무 헐거움

- 조사일자: 2026-08-25
- 기준 커밋: `65676d2` (main)
- 성격: 사실·숫자 보고. 처방 없음. 코드·데이터 무수정.
- 방법 주의: 4·5번은 정적 전수 분석(카드 태그 × 아키타입 정의). 실제 화면 표시는
  해당 아키타입이 덱에서 감지(logic.js:104–128 `da.detected`)됐을 때만 발생한다.
  콜로리스 카드는 getCard 폴백(logic.js:951–958)으로 모든 캐릭터 덱에서 채점
  대상이므로 분석 풀에 포함했다.

---

## 1. 아키타입 전수 목록

출처: db.js:11388–11671 (`"archetypes"`). 총 16개.

| 아키타입 | 캐릭터 | core 태그 | support 태그 | 정의 위치 |
|---|---|---|---|---|
| strength | ironclad | strength, multi_hit, strength_scaling | scaling, damage, vulnerable | db.js:11390 |
| block | ironclad | block, block_retain, block_conversion | block_payoff, draw, weak | db.js:11407 |
| exhaust | ironclad | exhaust, exhaust_payoff, exhaust_synergy | draw, block, energy_gain | db.js:11424 |
| self_damage | ironclad | self_damage, self_damage_payoff, hp_loss_synergy, blood | strength, draw, energy_gain | db.js:11441 |
| strike | ironclad | strike, strike_scaling, attack_chain | damage, draw, energy_gain, vulnerable, multi_hit | db.js:11459 |
| sly | silent | sly, discard, sly_enabler | draw, scaling | db.js:11480 |
| poison | silent | poison, poison_amplify | scaling, block, weak | db.js:11496 |
| shiv | silent | shiv, shiv_synergy, shiv_generator, shiv_amplify | block, dexterity, scaling | db.js:11512 |
| orb | defect | orb, focus, orb_channel, frost, lightning | block, scaling, evoke | db.js:11532 |
| claw | defect | claw, zero_cost, claw_payoff | draw, scaling | db.js:11551 |
| status | defect | status, status_synergy, status_exhaust | zero_cost, draw | db.js:11567 |
| stars | regent | stellar, stars, star_gain | draw, scaling, zero_cost | db.js:11585 |
| forge | regent | forge, authority | scaling, damage | db.js:11602 |
| soul | necrobinder | soul, soul_generator, soul_payoff | draw, scaling, exhaust | db.js:11619 |
| osty | necrobinder | summon, osty_buff, osty_attack | damage, scaling, block | db.js:11636 |
| doom | necrobinder | doom, doom_payoff | aoe, debuff, scaling, execute | db.js:11653 |

---

## 2. support 태그 역인덱스

support 태그 17종, 사용 아키타입 수 내림차순:

| support 태그 | 사용 아키타입 수 | 아키타입 목록 |
|---|---|---|
| scaling | 11 | ironclad/strength, silent/sly, silent/poison, silent/shiv, defect/orb, defect/claw, regent/stars, regent/forge, necrobinder/soul, necrobinder/osty, necrobinder/doom |
| draw | 9 | ironclad/block, ironclad/exhaust, ironclad/self_damage, ironclad/strike, silent/sly, defect/claw, defect/status, regent/stars, necrobinder/soul |
| block | 5 | ironclad/exhaust, silent/poison, silent/shiv, defect/orb, necrobinder/osty |
| damage | 4 | ironclad/strength, ironclad/strike, regent/forge, necrobinder/osty |
| energy_gain | 3 | ironclad/exhaust, ironclad/self_damage, ironclad/strike |
| vulnerable | 2 | ironclad/strength, ironclad/strike |
| weak | 2 | ironclad/block, silent/poison |
| zero_cost | 2 | defect/status, regent/stars |
| block_payoff | 1 | ironclad/block |
| strength | 1 | ironclad/self_damage |
| multi_hit | 1 | ironclad/strike |
| dexterity | 1 | silent/shiv |
| evoke | 1 | defect/orb |
| exhaust | 1 | necrobinder/soul |
| aoe | 1 | necrobinder/doom |
| debuff | 1 | necrobinder/doom |
| execute | 1 | necrobinder/doom |

- scaling은 16개 중 11개 아키타입의 support. 캐릭터 단위로는 5캐릭터 전원에 걸침.
  silent·necrobinder는 모든 아키타입이 scaling을 support로 씀.
- draw는 9개. block은 5개 (문제 사례의 exhaust support block 포함). energy_gain은
  3개 전부 ironclad.

---

## 3. 판정 코드 위치와 가중치

### 시너지 판정 — logic.js:178–196

매칭 조건(logic.js:185): core·support·아키타입 id 세 경로가 `||`로 동급.

```js
// Synergy - graduated with diminishing returns + saturation
const DIMN = [1.0, 0.6, 0.3];                                    // logic.js:179
for (const {arch, strength} of da.detected) {                     // logic.js:181
  ...
  for (const tag of data.syn) {                                   // logic.js:183
    if (synAntiDup.has(tag)) continue;                            // logic.js:184
    if (arch.core.includes(tag) || arch.support.includes(tag) || arch.id === tag) {  // logic.js:185
      const satCount = da.unionCount(tag);                        // logic.js:186
      const satMult = satCount >= 7 ? 0.35 : satCount >= 4 ? 0.65 : 1.0;  // logic.js:187
      const boost = (0.3 + strength * 0.5) * DIMN[matchCount] * satMult;  // logic.js:188
      score += boost;                                             // logic.js:189
```

### 안티시너지 판정 — logic.js:198–219

```js
// Anti-synergy - penalize cards that conflict with detected archetypes
for (const {arch, strength} of da.detected) {                     // logic.js:200
  for (const tag of (data.anti || [])) {                          // logic.js:201
    if (synAntiDup.has(tag)) continue;                            // logic.js:202
    if (arch.core.includes(tag) || arch.support.includes(tag)) {  // logic.js:203
      const pen = -(0.4 + strength * 0.5);                        // logic.js:204
      score += pen; antiDelta += pen;                             // logic.js:205
```

- 제2 경로(덱 태그 기반): logic.js:211–218, `da.unionCount(tag) >= 2`면 `-0.7`.
- 안티 합계 상한: logic.js:219, `-1.5`.

### core vs support 가중치

- **채점 단계에서는 완전히 동일.** 시너지 boost(logic.js:188)와 안티 pen(logic.js:204)
  모두 매칭 경로(core/support/id)를 계산식에 반영하지 않는다.
  어느 경로든 시너지 = `(0.3 + strength×0.5) × DIMN × satMult`,
  안티 = `−(0.4 + strength×0.5)`.
- core/support 가중이 다른 곳은 **아키타입 감지 단계뿐**:

```js
const coreThresh    = arch.coreThresh    ?? arch.threshold ?? 3;        // logic.js:115
const supportThresh = arch.supportThresh ?? Math.max(1, Math.floor(coreThresh / 2)); // logic.js:116
const meetsCore    = coreCount >= coreThresh;                           // logic.js:117
const meetsPartial = coreCount >= Math.ceil(coreThresh * 0.75) && supportCount >= supportThresh; // logic.js:119
const strength = Math.min(1, (coreCount / coreThresh) * 0.65 + (supportCount / Math.max(supportThresh,1)) * 0.35); // logic.js:121
```

---

## 4. 모순 카드 전수 조사

정의(코드 판정식 그대로): 같은 아키타입에 대해 syn 태그가 core∪support∪id에
걸리고(가점 자격, logic.js:185), anti 태그가 core∪support에 걸리는(감점 자격,
logic.js:203) 카드. 커밋 `162a285`의 syn/anti 중복 가드(logic.js:176)는 반영.

**총계: 111건 (카드-아키타입 쌍), 고유 카드 90장. 콜로리스 해당 0장.**

경로 유형별 분해:

| 유형 | 건수 | 의미 |
|---|---|---|
| 부패형: 가점=core, 감점=support | **7건** | 빌드 대표 카드인데 support 경로로 "충돌" |
| 역방향: 가점=support, 감점=core | **104건** | 남의 빌드 카드가 범용 support 태그로 "적합" |
| 양쪽 모두 core / 양쪽 모두 support | 0건 / 0건 | — |

### 4-1. 부패형 7장 전체 (전부 ironclad/exhaust, 감점은 모두 anti:[block] ↔ exhaust support의 block, db.js:11434)

| 카드 | 아키타입 | 가점 근거 | 감점 근거 |
|---|---|---|---|
| Corruption (db.js:969) | exhaust | exhaust(core) | block(support) |
| Cinder | exhaust | exhaust(core) | block(support) |
| Havoc | exhaust | exhaust(core) | block(support) |
| Dominate | exhaust | exhaust(core) | block(support) |
| Drum of Battle | exhaust | draw·energy_gain(support)+exhaust(core) | block(support) |
| Forgotten Ritual | exhaust | exhaust(core)+energy_gain(support) | block(support) |
| Pact's End | exhaust | exhaust(core) | block(support) |

### 4-2. 역방향 104건 전수 (동일 근거끼리 묶음)

| 아키타입 (건수) | 가점 근거(support) | 감점 근거(core) | 카드 |
|---|---|---|---|
| ironclad/strength (4) | damage×3, scaling×1 | strength | Stoke, Cinder, Pact's End / Forgotten Ritual |
| ironclad/block (1) | draw | block | Drum of Battle |
| ironclad/exhaust (2) | block×1, energy_gain×1 | exhaust | Unmovable / Unrelenting(+support block 감점 병행) |
| ironclad/self_damage (3) | strength×1, draw·energy_gain×2 | self_damage(+support strength) | Molten Fist / Drum of Battle, Forgotten Ritual |
| silent/sly (6) | scaling | sly | Noxious Fumes, Accuracy, Infinite Blades, Accelerant, Finisher, Up My Sleeve |
| silent/poison (10) | scaling×8, block×1, weak×1 | poison | Well-Laid Plans, Accuracy, Infinite Blades, Tactician, Finisher, Tools Of The Trade, Flechettes, Up My Sleeve / Untouchable / Blade Of Ink |
| silent/shiv (6) | scaling×5, block×1 | shiv | Well-Laid Plans, Noxious Fumes, Tactician, Accelerant, Tools Of The Trade / Untouchable |
| defect/orb (3) | scaling | orb, focus | All for One, Claw, Feral |
| defect/claw (2) | scaling | claw | Defragment, Capacitor |
| regent/stars (4) | scaling | stars | Bulwark, Summon Forth, Beat into Shape, Furnace |
| regent/forge (30) | scaling×13, damage×16, damage+scaling×1 | forge | Glow, Big Bang, Convergence, Void Form, Child of the Stars, Royal Gamble, Genesis, Hidden Cache, Foregone Conclusion, Alignment, Glimmer, Tyranny, Monologue / Reflect, GUARDS!!!, Comet, Radiate, Gamma Blast, Photon Cut, Knockout Blow, Seven Stars, Solar Strike, Guiding Star, Hegemony, Dying Star, Celestial Might, Crescent Spear, Stardust, Lunar Blast, Falling Star / Shining Strike |
| necrobinder/soul (16) | scaling×14, draw×1, draw+scaling×1 | soul | Lethality, Death's Door, Rattle, Countdown, Eradicate, No Escape, Sic 'Em, Danse Macabre, Shared Fate, Bodyguard, Oblivion, Unleash, Squeeze, Pull Aggro / Fetch / Scourge |
| necrobinder/doom (16) | scaling×13, aoe×3 | doom | Demesne, Haunt, Soul Storm, Sic 'Em, Transfigure, Death March, Dirge, Bodyguard, Reave, Unleash, Squeeze, Flatten, Pull Aggro / Bone Shards, Sacrifice, High Five |

- 역방향 104건 중 가점 근거: scaling 68건, damage 20건, 기타(draw/block/energy_gain/weak/aoe/strength) 16건.

---

## 5. support 단독 매칭 카드 수

정의: syn 태그가 core에도 아키타입 id에도 안 걸리고 support에만 걸리는 카드
(시너지 가점의 유일 경로가 support). 풀 = 해당 캐릭터 카드 + 콜로리스 126장.
캐릭터별 카드 수: ironclad 105, silent 91, defect 93, regent 89, necrobinder 87,
colorless 126 (db.js `"cards"`).

| 아키타입 | support 단독 (캐릭터/콜로리스) | 합계 | 풀 전체 | 비율 |
|---|---|---|---|---|
| ironclad/strike | 62 / 56 | 118 | 231 | 51.1% |
| necrobinder/osty | 44 / 56 | 100 | 213 | 46.9% |
| ironclad/strength | 60 / 41 | 101 | 231 | 43.7% |
| regent/forge | 53 / 41 | 94 | 215 | 43.7% |
| necrobinder/soul | 34 / 43 | 77 | 213 | 36.2% |
| silent/poison | 38 / 29 | 67 | 217 | 30.9% |
| defect/claw | 28 / 34 | 62 | 219 | 28.3% |
| silent/shiv | 31 / 28 | 59 | 217 | 27.2% |
| ironclad/self_damage | 32 / 29 | 61 | 231 | 26.4% |
| ironclad/exhaust | 25 / 29 | 54 | 231 | 23.4% |
| silent/sly | 16 / 34 | 50 | 217 | 23.0% |
| regent/stars | 13 / 35 | 48 | 215 | 22.3% |
| necrobinder/doom | 27 / 20 | 47 | 213 | 22.1% |
| defect/orb | 16 / 28 | 44 | 219 | 20.1% |
| defect/status | 20 / 23 | 43 | 219 | 19.6% |
| ironclad/block | 11 / 23 | 34 | 231 | 14.7% |

16개 아키타입 전부에서 풀의 15~51%가 core 매칭 없이 support만으로 시너지 가점
자격을 가진다. 최상위: strike 51.1%, osty 46.9%, strength·forge 43.7%.

---

## 6. 네크로바인더 anti 일괄 생성 건

### 6-1. "8/23 발견 건"의 정체

- 저장소 내 기록은 확인목록_TODO.md:236–240 한 곳뿐 (커밋 `810cf2e`, 8/24 기입).
  `git log -S'48장'` 전 히스토리 검색 결과도 `810cf2e` 1건.
  **8/23 당시의 1차 기록 자체는 저장소에 없음 — 확인 못 함.**
- 숫자는 현재 데이터와 일치: 네크로바인더 87장 중 anti 비어있지 않은 카드 =
  정확히 **48장**.

### 6-2. 수작업 vs 스크립트 생성 흔적

| 증거 | 결과 |
|---|---|
| 커밋 히스토리 | 확인 불가. 히스토리가 루트 커밋 `d88ef63`(2026-07-05)에서 시작하며 그 시점에 48장 anti가 이미 포함. 이후 네크로 anti 변경은 `162a285`(8/24, 4장 축소)뿐 |
| 생성 스크립트 | 없음. scripts/apply_patches.js, apply_patches_2.js, tools/*.js에 네크로 anti 생성 코드 없음 |
| 주석 | db.js 네크로 구역에 생성 관련 주석 없음 |
| 값의 패턴 | **강한 기계적 패턴 있음.** 네크로 anti 등장 태그는 전 히스토리에서 정확히 3종 — doom(27회)·osty(33회)·soul(32회). 루트 커밋 기준 48/48장이 "{doom, soul, osty} 중 정확히 2개" 조합, 그중 43장은 `anti = 3개 아키타입 id − 자기 builds` 공식과 정확히 일치. 나머지 5장(Neurosurge, Devour Life, Rattle, Dirge, Flatten)은 자기 builds 아키타입이 anti에도 든 자기모순형 → 4장은 `162a285`에서 정리, **Dirge는 현재도 builds=[soul,osty] / anti=[doom,osty]로 osty 모순 잔존** |
| 타 캐릭터 대조 | anti 태그 종수: ironclad 5종, silent 5종, defect 4종(다양) vs necrobinder 3종. regent만 2종(forge 37/stars 9)으로 유사한 균일 패턴. anti 보유율: necrobinder 48/87(55%), regent 46/89(52%) vs defect 10/93(11%) |

결론: 스크립트 생성의 **직접 증거(스크립트·커밋·주석)는 확인 못 함**.
"일괄 생성으로 보인다"의 근거는 위 패턴 균일성(3태그 한정, 48/48 2개 조합,
43/48 공식 일치)이라는 간접 증거뿐.

### 6-3. 변화폭 상위 4장의 48장 포함 여부

| 카드 | 위치 | builds | anti | role | 48장 포함 |
|---|---|---|---|---|---|
| Borrowed Time | db.js:7586 | high_cost, reap, bury, soul | [doom, osty] | engine | **포함** |
| Capture Spirit | db.js:7711 | soul | [doom, osty] | engine | **포함** |
| Pagestorm | db.js:9006 | soul | [] | engine | **미포함** |
| Seance | db.js:9257 | soul | [] | engine | **미포함** |

4장 중 **2장만 포함**. 4장의 공통점은 anti가 아니라 전원 `role: "engine"` +
builds에 soul 포함. 확인목록_TODO.md:239의 "같은 구역이라 연관 가능성" 추정은
anti 48장 기준으로는 절반만 성립.
