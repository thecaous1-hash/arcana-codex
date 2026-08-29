# 조사 E — 전 캐릭터 형제 아키타입 상극 딱지

- 조사일: 2026-08-29
- 기준 커밋: `7b5a08e` (main. 조사 D `47d3474` 머지 이후)
- 성격: 사실·숫자 보고. 권고 없음. 코드·데이터 무수정 — 이 보고서 1개만 신규.
- 방법: 조사 D와 동일하게 `tools/sim_c_options.js`의 기준선 조건을 재사용한 일회용 스크립트를 저장소 밖(세션 스크래치패드)에서 실행. 로드 순서(db.js → data/extra_cards.js → data/api_data.js → logic.js → index.html 산식 블록), 채점 조건(아키타입 1개 강제 활성 strength=1.0 · 빈 덱 · 유물 없음 · floor=20 · act=2 · encounter='normal' · 풀 = 캐릭터 카드 + 콜로리스) 동일. **채점 쌍 총수 3,448 — 조사 C2·D와 일치.** 각 쌍의 딱지 제거는 데이터만 바꿔 실제 `scoreCard`로 재채점 후 원상 복원(복원 검산: 기준선과 전수 일치, 불일치 0건).
- 용어: "A소속" = `builds`에 아키타입 id A 포함(앱 로드 후 상태). "공식" = `anti` = (그 캐릭터의 전체 아키타입 id) − (자기 builds 중 아키타입 id), 집합 일치 기준.

## 1. 캐릭터별 아키타입 목록

정의 출처: db.js:11388(`"archetypes"`), 각 id 행 번호 병기. 소속 카드 수는 앱 로드 후, `builds`에 해당 id를 가진 캐릭터 고유 카드 수(괄호는 콜로리스 추가분 — 콜로리스는 전 캐릭터 채점 풀에 들어감, logic.js:951-958).

| 캐릭터 | 아키타입 id | 표시명 | core 태그 | 소속 카드 수 |
|---|---|---|---|---|
| ironclad | strength (db.js:11391) | Strength · 힘 | strength, multi_hit, strength_scaling | 29 |
| ironclad | block (db.js:11408) | Block · 방어 | block, block_retain, block_conversion | 18 (+콜로리스 1) |
| ironclad | exhaust (db.js:11425) | Exhaust · 소진 | exhaust, exhaust_payoff, exhaust_synergy | 26 |
| ironclad | self_damage (db.js:11442) | Bloodletting / Self-Damage · 사혈/자해 | self_damage, self_damage_payoff, hp_loss_synergy, blood | 13 |
| ironclad | strike (db.js:11460) | Strike · 타격 | strike, strike_scaling, attack_chain | 17 |
| silent | sly (db.js:11481) | Sly / Discard · 교활/버리기 | sly, discard, sly_enabler | 37 (+콜로리스 1) |
| silent | poison (db.js:11497) | Poison · 중독 | poison, poison_amplify | 14 |
| silent | shiv (db.js:11513) | Shiv Spam · 비수 난사 | shiv, shiv_synergy, shiv_generator, shiv_amplify | 23 (+콜로리스 1) |
| defect | orb (db.js:11533) | Orb / Focus Engine · 구체/집중 엔진 | orb, focus, orb_channel, frost, lightning | 52 |
| defect | claw (db.js:11552) | Claw / Zero-Cost · 발톱/0코스트 | claw, zero_cost, claw_payoff | 15 (+콜로리스 4) |
| defect | status (db.js:11568) | Status Engine · 상태이상 엔진 | status, status_synergy, status_exhaust | 9 (+콜로리스 1) |
| regent | stars (db.js:11586) | Stars Engine · 별 엔진 | stellar, stars, star_gain | 52 (+콜로리스 1) |
| regent | forge (db.js:11603) | Forge / Sovereign Blade · 단조/군주의 검 | forge, authority | 16 (+콜로리스 1) |
| necrobinder | soul (db.js:11620) | Soul Engine · 영혼 엔진 | soul, soul_generator, soul_payoff | 23 (+콜로리스 1) |
| necrobinder | osty (db.js:11637) | Osty / Summon · 골골이/소환 | summon, osty_buff, osty_attack | 26 (+콜로리스 1) |
| necrobinder | doom (db.js:11654) | Doom Stack · 파멸 중첩 | doom, doom_payoff | 30 |

## 2. 형제 상극 패턴 전수

기준: 앞이 앱 로드 후(575장 체계) / 뒤 괄호가 db.js 원본(591장 체계). 비율은 공식 일치 ÷ 전체 카드(로드 후).

| 캐릭터 | 전체 카드 | anti가 아키타입 id만으로 구성 | "전체−자기builds" 공식과 정확히 일치 | 비율 |
|---|---|---|---|---|
| ironclad | 89 (원본 105) | 26 (원본 28) | **1** (원본 1) | 1.1% |
| silent | 91 (원본 91) | 27 (원본 27) | **25** (원본 25) | 27.5% |
| defect | 93 (원본 93) | 6 (원본 6) | **0** (원본 0) | 0.0% |
| regent | 88 (원본 89) | 46 (원본 46) | **44** (원본 44) | 50.0% |
| necrobinder | 88 (원본 87) | 48 (원본 48) | **45** (원본 45) | 51.1% |

- 네크로바인더 원본 87 / 48 / 45 — 배경(지시서)의 수치와 일치.
- 아이언클래드의 공식 일치 1장은 지옥검무(Hellraiser, db.js:2030) — builds:[strength,strike] / anti:[exhaust,block,self_damage].
- 콜로리스 126장 중 anti에 아키타입 id를 가진 카드는 **0장** — 형제 상극 패턴은 캐릭터 고유 카드에만 존재.
- 패턴 요약(사실): 아키타입이 2~3개인 캐릭터(regent 50%·necrobinder 51%·silent 28%)에서 공식 일치가 집중되고, 5개인 ironclad는 anti에 아키 id를 쓰면서도(26장) 공식 전체(형제 4개 전부)를 채운 카드는 1장뿐이다. defect는 anti에 아키 id 자체가 6장뿐이고 공식 일치 0.

## 3. 아키타입 쌍별 집계 — 핵심 산출물

집계 풀은 채점 풀과 동일(캐릭터 고유 + 콜로리스 — 단 §2에서 확인했듯 콜로리스는 해당 anti가 없어 실제로는 캐릭터 고유 카드만 걸림). "A→B" = A소속 카드가 B를 anti에 가진 수. 대표 카드는 딱지 카드(양방향 합집합, 중복 제거)를 tier 내림차순 정렬 후 상위 3장(동률은 데이터 순). **쌍 총수 20, 그중 합계 0인 쌍 3개.**

| 캐릭터 | 쌍 | A→B | B→A | 합계 | 그중 any 포함 | 대표 카드 3장 |
|---|---|---|---|---|---|---|
| ironclad | strength ↔ block | 9 | 0 | 9 | 4 | 저글링(B) / 녹아내리는 주먹(B) / 무자비(B) |
| ironclad | strength ↔ exhaust | 10 | 6 | 16 | 7 | 원시의 힘(A) / 화력 증폭(A) / 잊힌 의식(A) |
| ironclad | strength ↔ self_damage | 2 | 0 | 2 | 0 | 녹아내리는 주먹(B) / 지옥검무(C) |
| ironclad | strength ↔ strike | 0 | 0 | **0** | 0 | — |
| ironclad | block ↔ exhaust | 1 | 6 | 7 | 1 | 요지부동(S) / 잊힌 의식(A) / 타락(B) |
| ironclad | block ↔ self_damage | 2 | 2 | 4 | 0 | 요지부동(S) / 불바다(A) / 몸통 박치기(B) |
| ironclad | block ↔ strike | 0 | 3 | 3 | 1 | 완벽한 타격(B) / 떨림(C) / 지옥검무(C) |
| ironclad | exhaust ↔ self_damage | 6 | 2 | 8 | 1 | 잊힌 의식(A) / 불바다(A) / 몸통 박치기(B) |
| ironclad | exhaust ↔ strike | 0 | 4 | 4 | 1 | 완벽한 타격(B) / 분노(B) / 떨림(C) |
| ironclad | self_damage ↔ strike | 0 | 1 | 1 | 0 | 지옥검무(C) |
| silent | sly ↔ poison | 13 | 7 | 20 | 0 | 괜찮은 전략(S) / 계산된 도박(S) / 반사신경(S) |
| silent | sly ↔ shiv | 9 | 7 | 16 | 0 | 괜찮은 전략(S) / 반사신경(S) / 작업 도구(S) |
| silent | poison ↔ shiv | 7 | 9 | 16 | 0 | 유독 가스(A) / 잉크 칼날(A) / 정밀(B) |
| defect | orb ↔ claw | 2 | 6 | 8 | 1 | 조각모음(S) / 축전기(B) / 눈 할퀴기(B) |
| defect | orb ↔ status | 0 | 0 | **0** | 0 | — |
| defect | claw ↔ status | 0 | 0 | **0** | 0 | — |
| regent | stars ↔ forge | 35 | 9 | 44 | 6 | 광채(S) / 빅뱅(S) / 수렴(S) |
| necrobinder | soul ↔ osty | 13 | 13 | 26 | 6 | 권역(S) / 연명(S) / 혼령 포획(S) |
| necrobinder | soul ↔ doom | 15 | 19 | 34 | 9 | 권역(S) / 연명(S) / 혼령 포획(S) |
| necrobinder | osty ↔ doom | 15 | 20 | 35 | 6 | 정신 폭주(S) / 생명 삼키기(A) / 회수(A) |

(필요 참고: 한 카드가 여러 쌍에 걸릴 수 있으므로 열 합계는 §2의 카드 수와 다르다. any 포함 수는 조사 D §3의 31장과 정의가 다름 — 여기는 anti에 아키 id가 1개라도 있으면 세고, 조사 D는 any 공존만 셌다.)

## 4. 쌍별 영향 규모 — 그 쌍의 상극 딱지 전부 제거 시

제거 = A소속 카드의 anti에서 B 삭제 + B소속 카드의 anti에서 A 삭제(§3 정의 그대로). 비교 범위는 그 캐릭터의 (카드×아키타입) 격자(캐릭터당 아키 수 × 풀). 조건: 현재 main 그대로 — C2 처방 ②(core 우선) 미적용, any 미조정.

| 캐릭터 | 쌍 | 점수 변화 쌍 수 | 등급 변동 카드 수 (고유 / 쌍) | 상승 / 하락 |
|---|---|---|---|---|
| ironclad | strength ↔ block | 10 | 7 / 8 | 8 / 0 |
| ironclad | strength ↔ exhaust | 9 | 4 / 5 | 5 / 0 |
| ironclad | strength ↔ self_damage | 2 | 2 / 2 | 2 / 0 |
| ironclad | strength ↔ strike | 0 | 0 / 0 | 0 / 0 |
| ironclad | block ↔ exhaust | 13 | 7 / 8 | 8 / 0 |
| ironclad | block ↔ self_damage | 4 | 2 / 2 | 2 / 0 |
| ironclad | block ↔ strike | 2 | 2 / 2 | 2 / 0 |
| ironclad | exhaust ↔ self_damage | 1 | 0 / 0 | 0 / 0 |
| ironclad | exhaust ↔ strike | 1 | 0 / 0 | 0 / 0 |
| ironclad | self_damage ↔ strike | 1 | 1 / 1 | 1 / 0 |
| silent | sly ↔ poison | 19 | 10 / 10 | 10 / 0 |
| silent | sly ↔ shiv | 15 | 11 / 11 | 11 / 0 |
| silent | poison ↔ shiv | 16 | 10 / 10 | 10 / 0 |
| defect | orb ↔ claw | 5 | 5 / 5 | 5 / 0 |
| defect | orb ↔ status | 0 | 0 / 0 | 0 / 0 |
| defect | claw ↔ status | 0 | 0 / 0 | 0 / 0 |
| regent | stars ↔ forge | 43 | **33 / 33** | 33 / 0 |
| necrobinder | soul ↔ osty | 12 | 6 / 6 | 6 / 0 |
| necrobinder | soul ↔ doom | 32 | **27 / 27** | 27 / 0 |
| necrobinder | osty ↔ doom | 14 | 10 / 10 | 10 / 0 |

관측 사실(모두 이 sim 조건 한정):

- 변동은 전 쌍에서 **상승뿐**이다 — 딱지 제거는 감점 경로(logic.js:200-210, −0.9)만 없애기 때문.
- 딱지 수와 점수 변화 수가 어긋나는 이유 두 가지: ① anti 태그는 자기 쌍의 아키타입 밖에서도 발화한다 — logic.js:203이 core뿐 아니라 support도 보므로, 예컨대 anti의 `block`은 block 아키(core)만이 아니라 exhaust 아키(support에 block, db.js:11425 구역)에서도 −0.9를 만든다. strength↔block 딱지 제거로 제압(Dominate)의 exhaust 아키 점수가 1.60(C)→2.80(B)로 오른 것이 이 사례. 조사 C의 support 겹침 문제가 anti 쪽에서 재현된 것. ② 기준선이 0 또는 6에 절사된 쌍은 변화가 흡수된다(logic.js:555).
- anti의 `osty`는 osty 아키타입의 core(summon, osty_buff, osty_attack)에도 support(damage, scaling, block)에도 없어 **이 sim의 아키타입 경로에서 아예 발화하지 않는다**(조사 C2의 Dirge 각주와 동일 구조). soul↔osty 쌍의 딱지 26장 대비 변화 12쌍에 그친 주 원인. 단, syn/mech에 literal `osty` 태그를 가진 카드가 네크로바인더에 14장 있어(Devour Life, Rattle, Fetch, High Five 등), 실제 덱에서는 제2 경로(logic.js:211-218, unionCount≥2, −0.7)로 발화할 수 있다 — 이 sim(빈 덱)에서는 미측정.
- 등급 변동 상세(카드@아키, 변경 전→후 전체)는 각 쌍의 수치 산출 로그에 있으며, 최대 이동 폭은 +1.2점(예: Eradicate@soul 1.03(D)→2.23(C), One-Two Punch@exhaust 1.63(C)→2.83(B) — anti 감점 −0.9 소멸 + "덱 날렵" −0.3 연쇄 해제).

## 5. 예외 카드 — anti에 형제 아키 id가 있으나 공식과 불일치

공식 일치(§2) 카드를 뺀 나머지 전수, 43장. "형제 중 누락" = 공식대로라면 anti에 있어야 할 형제 아키 id가 빠짐. 아키타입이 5개인 아이언클래드는 구조상 거의 전부 "누락"으로 잡힌다(공식 일치가 1장뿐이므로) — 이 표는 그 자체가 수작업/부분 기입의 흔적 목록이다.

| 카드(한글명) | 카드ID (db.js 행) | 캐릭터 | tier | builds | anti | 공식과 다른 점 |
|---|---|---|---|---|---|---|
| 요지부동 | Unmovable (164) | ironclad | S | block | exhaust, self_damage | 형제 중 누락: strength, strike |
| 포악함 | Vicious (507) | ironclad | A | any | exhaust | 형제 중 누락: strength, block, self_damage, strike |
| 원시의 힘 | Primal Force (547) | ironclad | A | strength, any | exhaust | 형제 중 누락: block, self_damage, strike |
| 화력 증폭 | Stoke (588) | ironclad | A | exhaust | strength | 형제 중 누락: block, self_damage, strike |
| 몸통 박치기 | Body Slam (667) | ironclad | B | block, exhaust | self_damage | 형제 중 누락: strength, strike |
| 저글링 | Juggling (844) | ironclad | B | strength | exhaust, block | 형제 중 누락: self_damage, strike |
| 녹아내리는 주먹 | Molten Fist (923) | ironclad | B | strength | exhaust, self_damage, block | 형제 중 누락: strike |
| 완벽한 타격 | Perfected Strike (945) | ironclad | B | strike | exhaust, block | 형제 중 누락: strength, self_damage |
| 타락 | Corruption (969) | ironclad | B | exhaust | block | 형제 중 누락: strength, self_damage, strike |
| 분노 | Anger (1027) | ironclad | B | strike | exhaust | 형제 중 누락: strength, block, self_damage |
| 격돌 | Clash (1221) | ironclad | D | any | block, exhaust, self_damage | 형제 중 누락: strength, strike |
| 잿불 | Cinder (1728) | ironclad | C | exhaust | strength, block, self_damage | 형제 중 누락: strike |
| 파괴 | Havoc (1750) | ironclad | D | exhaust | strength, block, self_damage | 형제 중 누락: strike |
| 사전 타격 | Setup Strike (1771) | ironclad | C | strength | exhaust, block | 형제 중 누락: self_damage, strike |
| 떨림 | Tremble (1794) | ironclad | C | strength, strike, any | exhaust, block | 형제 중 누락: self_damage |
| 협박 | Bully (1819) | ironclad | C | strength, any | exhaust, block | 형제 중 누락: self_damage, strike |
| 제압 | Dominate (1860) | ironclad | C | strength | block | 형제 중 누락: exhaust, self_damage, strike |
| 전투의 북소리 | Drum of Battle (1884) | ironclad | C | exhaust, any | strength, block, self_damage | 형제 중 누락: strike |
| 잊힌 의식 | Forgotten Ritual (1911) | ironclad | A | exhaust | strength, block, self_damage | 형제 중 누락: strike |
| 불바다 | Inferno (1959) | ironclad | A | self_damage | block, exhaust | 형제 중 누락: strength, strike |
| 쇄도 | Stampede (1984) | ironclad | C | strength, any | exhaust, block | 형제 중 누락: self_damage, strike |
| 무자비 | Unrelenting (2007) | ironclad | B | strength, any | exhaust, block | 형제 중 누락: self_damage, strike |
| 원투 펀치 | One-Two Punch (2054) | ironclad | B | strength, any | exhaust | 형제 중 누락: block, self_damage, strike |
| 조약의 끝 | Pact's End (2076) | ironclad | C | exhaust | strength, block, self_damage | 형제 중 누락: strike |
| 갈가리 찢기 | Tear Asunder (2101) | ironclad | B | self_damage | block, exhaust | 형제 중 누락: strength, strike |
| 계산된 도박 | Calculated Gamble (2191) | silent | S | sly | poison | 형제 중 누락: shiv |
| 잉크 칼날 | Blade Of Ink (3472) | silent | A | shiv, sly | poison, sly | **자기 builds 아키가 anti에: sly** |
| 조각모음 | Defragment (4028) | defect | S | orb | claw | 형제 중 누락: status |
| 하나를 위한 모두 | All for One (4049) | defect | C | claw | orb, focus | 아키 외 태그 혼합: focus · 형제 중 누락: status |
| 후벼 파기 | Claw (4072) | defect | D | claw | orb, focus | 아키 외 태그 혼합: focus · 형제 중 누락: status |
| 축전기 | Capacitor (4253) | defect | B | orb | claw | 형제 중 누락: status |
| 긁어내기 | Scrape (4294) | defect | C | claw | orb | 형제 중 누락: status |
| 눈 할퀴기 | Go for the Eyes (4315) | defect | B | claw, any | orb | 형제 중 누락: status |
| 초광속 | FTL (4338) | defect | B | claw | orb | 형제 중 누락: status |
| 파괴광선 | Hyperbeam (4601) | defect | D | any | frost, focus, orb | 아키 외 태그 혼합: frost, focus · 형제 중 누락: claw, status |
| 야성 | Feral (4666) | defect | C | claw | orb, focus | 아키 외 태그 혼합: focus · 형제 중 누락: status |
| 증강 | Bulk Up (4947) | defect | C | (없음) | orb | 형제 중 누락: claw, status |
| 공허의 형상 | Void Form (5854) | regent | S | any | forge | 형제 중 누락: stars |
| 공진 | Resonance (6690) | regent | C | any | forge | 형제 중 누락: stars |
| 정신 폭주 | Neurosurge (7686) | necrobinder | S | doom, any | osty | 형제 중 누락: soul |
| 덜그럭대기 | Rattle (7822) | necrobinder | A | osty | soul | 형제 중 누락: doom |
| 장송가 | Dirge (8351) | necrobinder | B | soul, osty | doom, osty | **자기 builds 아키가 anti에: osty** |

관측 사실: defect의 예외는 전부 orb↔claw 사이 + `focus`/`frost` 같은 core 태그 혼합 — 공식형이 아니라 태그 단위 기입. silent는 공식형 25장과 별개로 예외 2장뿐. 네크로바인더 예외 3장(Neurosurge·Rattle·Dirge)은 조사 C §6-2에서 확인된 "자기모순형 5장 중 162a285가 정리한 4장"의 잔여 상태와 일치한다.

## 6. 자기모순 잔존 — builds와 anti에 같은 아키타입 id

전 캐릭터(콜로리스 포함) 전수. **2장** — 알려진 Dirge 외에 사일런트 잉크 칼날 1장 추가 발견.

| 카드(한글명) | 캐릭터 | builds | anti | 겹치는 id |
|---|---|---|---|---|
| 잉크 칼날 | Blade Of Ink (db.js:3472) | silent | shiv, sly | poison, sly | **sly** |
| 장송가 | Dirge (db.js:8351) | necrobinder | soul, osty | doom, osty | osty |

- 아키타입 id 외 태그까지 포함해 builds∩anti를 봐도 이 2장 외 겹침은 없다.
- 발화 양상 차이(실측): Dirge의 겹침 `osty`는 osty 아키 core/support에 없어 아키 경로에서 무발화 — 기준선 Dirge@osty는 5.45(S), anti 감점 없음(§4 참조). 반면 Blade Of Ink의 겹침 `sly`는 sly 아키 core(db.js:11481 구역)에 있어 기준선 Blade Of Ink@sly 5.02(S)에서 "+0.8 교활/버리기 빌드 핵심 카드"와 "−0.9 교활/버리기 빌드와 충돌 (교활)"이 같은 채점에 동시에 찍힘을 확인했다.

---

# 판정 질문지

§3의 쌍 중 딱지 합계 > 0인 17쌍. 각 쌍의 수치는 §3(딱지·any)·§4(등급변동 예상 = 딱지 제거 시 등급이 오르는 고유 카드 수)에서 가져옴. 대표 카드는 tier 상위 3장.

**아이언클래드**

- [ ] 아이언클래드 · 힘 ↔ 방어
      딱지 9장 (그중 any 포함 4장) · 등급변동 예상 7장
      대표: 저글링(B) / 녹아내리는 주먹(B) / 무자비(B)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐
- [ ] 아이언클래드 · 힘 ↔ 소진
      딱지 16장 (그중 any 포함 7장) · 등급변동 예상 4장
      대표: 원시의 힘(A) / 화력 증폭(A) / 잊힌 의식(A)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐
- [ ] 아이언클래드 · 힘 ↔ 사혈
      딱지 2장 (그중 any 포함 0장) · 등급변동 예상 2장
      대표: 녹아내리는 주먹(B) / 지옥검무(C)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐
- [ ] 아이언클래드 · 방어 ↔ 소진
      딱지 7장 (그중 any 포함 1장) · 등급변동 예상 7장
      대표: 요지부동(S) / 잊힌 의식(A) / 타락(B)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐
- [ ] 아이언클래드 · 방어 ↔ 사혈
      딱지 4장 (그중 any 포함 0장) · 등급변동 예상 2장
      대표: 요지부동(S) / 불바다(A) / 몸통 박치기(B)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐
- [ ] 아이언클래드 · 방어 ↔ 타격
      딱지 3장 (그중 any 포함 1장) · 등급변동 예상 2장
      대표: 완벽한 타격(B) / 떨림(C) / 지옥검무(C)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐
- [ ] 아이언클래드 · 소진 ↔ 사혈
      딱지 8장 (그중 any 포함 1장) · 등급변동 예상 0장
      대표: 잊힌 의식(A) / 불바다(A) / 몸통 박치기(B)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐
- [ ] 아이언클래드 · 소진 ↔ 타격
      딱지 4장 (그중 any 포함 1장) · 등급변동 예상 0장
      대표: 완벽한 타격(B) / 분노(B) / 떨림(C)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐
- [ ] 아이언클래드 · 사혈 ↔ 타격
      딱지 1장 (그중 any 포함 0장) · 등급변동 예상 1장
      대표: 지옥검무(C)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐

**사일런트**

- [ ] 사일런트 · 교활 ↔ 중독
      딱지 20장 (그중 any 포함 0장) · 등급변동 예상 10장
      대표: 괜찮은 전략(S) / 계산된 도박(S) / 반사신경(S)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐
- [ ] 사일런트 · 교활 ↔ 비수
      딱지 16장 (그중 any 포함 0장) · 등급변동 예상 11장
      대표: 괜찮은 전략(S) / 반사신경(S) / 작업 도구(S)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐
- [ ] 사일런트 · 중독 ↔ 비수
      딱지 16장 (그중 any 포함 0장) · 등급변동 예상 10장
      대표: 유독 가스(A) / 잉크 칼날(A) / 정밀(B)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐

**디펙트**

- [ ] 디펙트 · 구체 ↔ 발톱
      딱지 8장 (그중 any 포함 1장) · 등급변동 예상 5장
      대표: 조각모음(S) / 축전기(B) / 눈 할퀴기(B)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐

**리젠트**

- [ ] 리젠트 · 별 ↔ 단조
      딱지 44장 (그중 any 포함 6장) · 등급변동 예상 33장
      대표: 광채(S) / 빅뱅(S) / 수렴(S)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐

**네크로바인더** (사용자 기판정: doom↔soul 비충돌, doom↔osty·soul↔osty 충돌 — 재확인용으로 남김)

- [ ] 네크로바인더 · 영혼 ↔ 골골이
      딱지 26장 (그중 any 포함 6장) · 등급변동 예상 6장
      대표: 권역(S) / 연명(S) / 혼령 포획(S)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐
- [ ] 네크로바인더 · 영혼 ↔ 파멸
      딱지 34장 (그중 any 포함 9장) · 등급변동 예상 27장
      대표: 권역(S) / 연명(S) / 혼령 포획(S)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐
- [ ] 네크로바인더 · 골골이 ↔ 파멸
      딱지 35장 (그중 any 포함 6장) · 등급변동 예상 10장
      대표: 정신 폭주(S) / 생명 삼키기(A) / 회수(A)
      → 한 덱에 섞이면: ☐ 실제로 방해함  ☐ 그냥 다른 빌드일 뿐

※ 딱지 합계 0이라 질문지에서 제외한 쌍 3개: 아이언클래드 힘↔타격, 디펙트 구체↔상태이상, 디펙트 발톱↔상태이상.
