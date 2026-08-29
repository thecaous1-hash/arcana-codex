# 조사 D — `any` 빌드 태그 정합성

- 조사일: 2026-08-29
- 기준 커밋: `5668649` (main. `Merge pull request #54`)
- 성격: 사실·숫자 보고. 권고 없음. 코드·데이터 무수정 — 이 보고서 1개만 신규.
- 점수 실측 방법: `tools/sim_c_options.js`의 기준선 조건을 재사용한 일회용 스크립트를 저장소 밖(세션 스크래치패드)에서 실행. 로드 순서(db.js → data/extra_cards.js → data/api_data.js → logic.js → index.html 산식 블록)와 채점 조건(아키타입 1개 강제 활성 strength=1.0 · 빈 덱 · 유물 없음 · floor=20 · act=2 · encounter='normal' · 풀 = 캐릭터 카드 + 콜로리스, 전체 3,448쌍)은 sim_c_options.js와 동일. `scoreCard`는 실제 앱 함수를 그대로 호출하고 **데이터(builds)만** 바꿔서 두 번 채점했다. 제거 후 원상 복원해 재채점한 결과가 기준선과 전수 일치(불일치 0건)함을 검산했다.

## 0. 배경 수치 검증

배경에 인용된 "591장 중 208장(35%)"은 **db.js 원본 파일 기준**이고, 앱이 실제 로드하는 상태(data/extra_cards.js가 STS1 잔재 19장 제거 + 3장 추가)에서는 575장 중 204장이다. 사일런트는 원본 91장 중 50장 / 로드 후 91장 중 49장(과반 유지).

| 캐릭터 | db.js 원본: 전체 / any | 앱 로드 후: 전체 / any | any 비율(로드 후) |
|---|---|---|---|
| ironclad | 105 / 25 | 89 / 22 | 24.7% |
| silent | 91 / 50 | 91 / 49 | 53.8% |
| defect | 93 / 23 | 93 / 23 | 24.7% |
| regent | 89 / 26 | 88 / 26 | 29.5% |
| necrobinder | 87 / 26 | 88 / 26 | 29.5% |
| colorless | 126 / 58 | 126 / 58 | 46.0% |
| **합계** | **591 / 208 (35.2%)** | **575 / 204 (35.5%)** | |

이하 집계는 별도 표기 없으면 **앱 로드 후(575장)** 기준. `builds`가 `["any"]` 단독(구체 빌드 0개)인 카드는 204장 중 **127장**.

유물: DB.relics 293개 중 `builds`에 `any` 포함 **159개** (builds가 빈 유물 0개). `DB.relicNames`의 `c === 'any'`(캐릭터 무관 소속)는 293개 중 243개 — 이것은 builds가 아니라 캐릭터 필드로, 별개 용법이다(§1 참조).

## 1. `any`의 모든 사용처 전수

`builds` 맥락의 `any`는 logic.js 14곳 + index.html 4곳. 그 외 캐릭터 필드 용법 1곳(index.html:934)과 데이터 패치 스크립트 8곳.

### 1-a. 카드 `builds` 맥락 — 제외형 6곳

| 파일:행 | 코드 인용 | 분류 | 하는 일 |
|---|---|---|---|
| logic.js:125 | `const builds = (d?.builds\|\|[]).filter(b=>b!=='any');` | 제외형 | 아키타입 감지 동점 처리(primaryCount): any는 "대표(첫) 빌드"로 인정 안 함 |
| logic.js:252 | `...(data.builds\|\|[]).filter(b=>b!=='any')]);` | 제외형 | 장착 유물 scoreEffects가 카드를 강화할 때 매칭할 태그 집합에서 any 제외 |
| logic.js:276 | `...(data.builds\|\|[]).filter(b=>b!=='any')];` | 제외형 | 인챈트 가산(ENCH_SCORE_FX) 태그 매칭 집합에서 any 제외 |
| logic.js:311 | `const specificBuilds = data.builds.filter(b => b !== 'any');` | 제외형 | 아키타입 misfit 감점(-0.4−0.9) 판정: any를 빼고 구체 빌드만으로 "안 맞음"을 판단. any 단독 카드는 specificBuilds가 비어 감점 자체가 없음(logic.js:312-314) |
| logic.js:576 | `const cardBuilds= data ? (data.builds\|\| []).filter(b => b !== 'any') : [];` | 제외형 | scoreRemoval(제거 추천): 빌드 적합 판정(logic.js:765-766)용 빌드 목록에서 any 제외 |
| index.html:1077 | `const fits=(d.builds\|\|[]).some(b=>b!=='any'&&da.detected.some(x=>x.arch.id===b));` | 제외형 | '빌드 후보' 배지: any는 배지 자격 아님, 구체 빌드 일치만 |

### 1-b. 카드 `builds` 맥락 — 통과권형 9곳

| 파일:행 | 코드 인용 | 분류 | 하는 일 |
|---|---|---|---|
| logic.js:329 | `d.role === 'engine' && (d.builds\|\|[]).some(b => b===archId\|\|b==='any')` | 통과권형 | 역할 균형: 덱 내 "이 빌드의 엔진 수"를 셀 때 any 카드를 포함 |
| logic.js:333 | (동일 패턴, generator) | 통과권형 | 덱 내 생성기 수 집계에 any 포함 |
| logic.js:337 | (동일 패턴, payoff) | 통과권형 | 덱 내 보상 수 집계에 any 포함 |
| logic.js:341 | `const cardFitsTopArch = (data.builds\|\|[]).some(b => b===archId \|\| b==='any');` | 통과권형 | 채점 카드 자신의 1위 아키타입 적합 판정 — 역할 가점(첫 엔진 +0.6/0.3 등, logic.js:356-399)의 게이트 |
| logic.js:428 | `if ((data.builds\|\|[]).includes('any') && da.isUndefined) {` | 통과권형 | 1막 + 빌드 미확정이면 any 카드 +0.2 (logic.js:429) |
| logic.js:440 | `const fitsTop = (data.builds\|\|[]).includes(da.detected[0].arch.id) \|\| (data.builds\|\|[]).includes('any');` | 통과권형 | 2막 + 1위 strength≥0.5면 any를 "확정된 빌드에 적합"으로 인정 → +0.2 (logic.js:441) |
| logic.js:787 | `((d.builds\|\|[]).includes('any') \|\| da.detected.some(det => (d.builds\|\|[]).includes(det.arch.id)));` | 통과권형 | scoreRemoval: 같은 역할의 대체 카드 수(sameRoleFit) 집계에 any 포함 → isOnlyEngine/isOnlyPayoff 판정(logic.js:789-790)에 영향 |
| index.html:1094 | `const fits=(s.builds\|\|[]).some(b=>b==='any'\|\|da.detected.some(x=>x.arch.id===b));` | 통과권형 | 추천 결과 리드 문구: any면 "현재 빌드와 잘 맞아 추천합니다"로 표시 |
| index.html:1190 | `const fits=!(d.builds\|\|[]).length\|\|(d.builds\|\|[]).some(b=>b==='any'\|\|da.detected.some(x=>x.arch.id===b));` | 통과권형 | 강화 우선순위 점수: any면 빌드 적합 +1 |

참고(어느 쪽도 아님): 빌드 핵심 가점(+0.3~0.8)은 `data.builds.includes(arch.id)`만 본다(logic.js:297). 아키타입 id에 `'any'`는 없으므로 any는 이 가점을 받지 못한다 — 제외형처럼 걸러내는 코드가 아니라 애초에 매칭이 안 되는 구조.

### 1-c. 유물 `builds` 맥락 — 제외형 2곳 / 통과권형 1곳

| 파일:행 | 코드 인용 | 분류 | 하는 일 |
|---|---|---|---|
| logic.js:1001 | `const builds = (d.builds \|\| []).filter(b => b !== 'any');` | 제외형 | scoreRelic 빌드 적합 가점(+0.4~1.6): any 제외 — any 단독 유물은 빌드 가점 없음 |
| logic.js:1020 | `...(cd.builds\|\|[]).filter(b=>b!=='any')];` | 제외형 | scoreRelic scoreEffects용 덱 태그 카운트에서 카드 builds의 any 제외 |
| index.html:1586 | `if(archId) relics.forEach(k=>{ ... if(b.length&&!b.includes('any')&&!b.includes(archId))misfit.push(...)` | 통과권형 | 런 복기 유물 활용도: builds에 any가 있으면 "빌드와 방향이 다른 유물"에서 면제 |

### 1-d. 기타 (builds 아님)

| 파일:행 | 코드 인용 | 분류 | 하는 일 |
|---|---|---|---|
| index.html:934 | `(DB.relicNames\|\|[]).filter(n=>n.c===state.char\|\|n.c==='any')` | 기타 | 유물 자동완성: 소속 캐릭터(c)가 any인 유물을 항상 노출. builds 태그 아님 |
| scripts/apply_patches.js:69, 132, 153 · scripts/apply_patches_2.js:65, 76, 89, 100, 111 | `builds: ["any"]` 등 | 기타(데이터 기입) | 패치 동기화 스크립트가 특정 카드의 builds에 any를 수동 기입 |
| scripts/apply_patches_2.js:61, 72, 85, 96, 107 | `char: "any"` | 기타 | 유물 소속 캐릭터 필드 — builds 아님 |

tools/ 아래(build_from_api.js 포함)에는 `any` 문자열이 없음(grep 확인) — API 스냅샷 생성 도구는 any를 만들지 않는다.

## 2. 점수 영향 실측 — `builds`에서 `any`만 제거했을 때

조건은 문서 머리의 방법 참조. 이 조건(빈 덱)에서 실제로 발동 가능한 통과권형 지점은 logic.js:341(→ 역할 가점)과 logic.js:440(→ act2 +0.2) 둘뿐이다. logic.js:329/333/337은 덱 구성 의존(빈 덱에서 0), logic.js:428은 act=1 전용, logic.js:787은 scoreRemoval 경로, index.html:1094/1190은 표시·강화 로직이라 scoreCard 점수에 안 들어간다 — 즉 아래 수치는 **카드 추천 점수 한정, 빈 덱 조건의 하한**이다.

| 지표 | 값 |
|---|---|
| 전체 (카드×아키타입) 쌍 | 3,448 |
| 점수 변화 쌍 | **1,284 (37.2%)** |
| 점수 변화 고유 카드(카드ID 기준) | 202 (any 카드 204장 중) |
| 변화량 평균 (변화 쌍의 \|Δ\|) | 0.27 |
| 변화량 최대 | 0.80 |
| 등급 문자(S/A/B/C/D) 변동 쌍 | **227** |
| 등급 변동 고유 카드 — 카드ID 기준 | **69장** |
| 등급 변동 — (캐릭터, 카드) 기준 | 111건 |
| 변동 방향 | 하락 227 / 상승 0 |

Δ(제거 후 − 현재) 분포:

| Δ | 쌍 수 | 구성 |
|---|---|---|
| −0.20 | 997 | act2 적합 +0.2 소실(logic.js:440-441)만 |
| −0.50 | 273 | act2 +0.2 & 첫 엔진 +0.3 동반 소실(logic.js:341→370-372), 또는 act2 소실 후 "덱을 날렵하게" −0.3 연쇄 발동(logic.js:464-465, 점수가 2.5 밑으로 내려가며 새로 걸림) |
| −0.80 | 6 | act2 + 첫 엔진 + 연쇄 감점 셋 다 (예: ironclad/block Drum of Battle 2.50(B)→1.70(C)) |
| −0.43 ~ −0.48 | 6 | 기준선이 상한 6.00이라 [0,6] 절사(logic.js:555)가 일부 흡수 (Echo Form, Void Form, Forbidden Grimoire) |
| −0.09 | 2 | 하한 0 절사 부분 흡수 (ironclad Howl from Beyond 0.09→0.00) |

- 경로 귀속: 변화 1,284쌍 **전부**가 logic.js:440-441(+0.2 "확정된 빌드에 적합 (2막)") 소실을 포함하고, 그중 **250쌍**은 logic.js:341 게이트를 통해 받던 첫 엔진 가점(+0.3, logic.js:370-372)도 함께 소실했다. 그 외 통과권형 지점에서 발생한 점수 변화는 이 조건에서 0건.
- "덱을 날렵하게" 연쇄 감점이 새로 발동한 쌍: 53쌍.
- 점수 변화 0인데 가점 근거만 소실된 쌍: 12쌍 — 전부 기준선이 이미 0.00(D)으로 하한 절사된 카드(Clash, Bully, Grand Finale, Hyperbeam, Misery, Primal Force). any 가점이 절사에 흡수돼 있던 상태.
- any 카드 204장 중 점수 변화 고유 카드가 202장 = any는 사실상 전 부착 카드의 점수에 개입한다(빈 덱 조건에서도).

등급 변동 69장의 카드별 전개(전체):

| 카드(한글명) | 카드ID | 캐릭터 | tier | role | builds | 등급 변동 아키타입 (변경 전 → 후) |
|---|---|---|---|---|---|---|
| 자동화 | Automation | defect | B | engine | any | orb 4.50(S)→4.00(A) |
| 재앙 | Calamity | defect | C | engine | any | orb 3.50(A)→3.00(B) · claw 3.50(A)→3.00(B) · status 3.50(A)→3.00(B) |
| 계몽 | Enlightenment | defect | B | engine | any | orb 4.35(S)→3.85(A) · claw 4.35(S)→3.85(A) · status 4.35(S)→3.85(A) |
| 영원의 갑옷 | Eternal Armor | defect | B | generator | any | status 4.30(S)→4.10(A) |
| 유전 알고리즘 | Genetic Algorithm | defect | S | generator | any | status 4.30(S)→4.10(A) |
| 황금 도끼 | Gold Axe | defect | C | payoff | any | orb 2.50(B)→2.00(C) · claw 2.50(B)→2.00(C) |
| 나선 관통 | Helix Drill | defect | B | payoff | any | orb 2.56(B)→2.06(C) · claw 2.56(B)→2.06(C) · status 2.56(B)→2.06(C) |
| 숨겨진 보석 | Hidden Gem | defect | B | engine | any | status 4.50(S)→4.00(A) |
| 잭팟 | Jackpot | defect | B | payoff | claw, any | orb 1.50(C)→1.30(D) · status 2.60(B)→2.10(C) |
| 대혼란 | Mayhem | defect | B | engine | any | status 4.50(S)→4.00(A) |
| 준비 시간 | Prep Time | defect | B | engine | any | orb 4.73(S)→4.23(A) · claw 4.73(S)→4.23(A) |
| 굴러가는 바위 | Rolling Boulder | defect | B | engine | any | status 4.48(S)→3.98(A) |
| 포집 | Scavenge | defect | B | generator | any | orb 3.53(A)→3.33(B) · claw 3.53(A)→3.33(B) · status 3.53(A)→3.33(B) |
| 충격파 | Shockwave | defect | A | generator | any | orb 4.34(S)→4.14(A) · claw 4.34(S)→4.14(A) · status 4.34(S)→4.14(A) |
| 미래 예지 | Thinking Ahead | defect | A | generator | any | orb 4.47(S)→4.27(A) |
| 터보 | TURBO | defect | B | generator | claw, any | orb 2.54(B)→2.04(C) |
| 난동 | Uproar | defect | C | payoff | any | orb 1.62(C)→1.42(D) · claw 1.62(C)→1.42(D) |
| 자동화 | Automation | ironclad | B | engine | any | strength 4.47(S)→3.97(A) |
| 두들겨 패기 | Beat Down | ironclad | C | payoff | any | strength 2.50(B)→2.00(C) · strike 2.50(B)→2.00(C) |
| 재앙 | Calamity | ironclad | C | engine | any | strength 4.30(S)→3.80(A) · block 3.50(A)→3.00(B) · exhaust 3.50(A)→3.00(B) · self_damage 3.50(A)→3.00(B) · strike 4.30(S)→3.80(A) |
| 연쇄 | Cascade | ironclad | A | generator | any | block 4.50(S)→4.30(A) · self_damage 4.50(S)→4.30(A) |
| 극적인 입장 | Dramatic Entrance | ironclad | B | payoff | any | strength 2.62(B)→2.12(C) · block 1.52(C)→1.32(D) · exhaust 1.52(C)→1.32(D) · self_damage 1.52(C)→1.32(D) · strike 2.62(B)→2.12(C) |
| 전투의 북소리 | Drum of Battle | ironclad | C | engine | exhaust, any | block 2.50(B)→1.70(C) · self_damage 2.50(B)→1.70(C) · strike 3.40(A)→2.90(B) |
| 계몽 | Enlightenment | ironclad | B | engine | any | strength 4.32(S)→3.82(A) · block 4.32(S)→3.82(A) · exhaust 4.32(S)→3.82(A) · self_damage 4.32(S)→3.82(A) · strike 4.32(S)→3.82(A) |
| 영원의 갑옷 | Eternal Armor | ironclad | B | generator | any | self_damage 4.30(S)→4.10(A) · strike 4.30(S)→4.10(A) |
| 싸움 준비 | Expect A Fight | ironclad | A | generator | any | block 4.44(S)→4.24(A) · exhaust 4.44(S)→4.24(A) · self_damage 4.44(S)→4.24(A) · strike 4.44(S)→4.24(A) |
| 황금 도끼 | Gold Axe | ironclad | C | payoff | any | strength 2.50(B)→2.00(C) · strike 2.50(B)→2.00(C) |
| 탐욕의 손 | Hand of Greed | ironclad | S | payoff | any | strength 3.58(A)→3.38(B) · strike 3.58(A)→3.38(B) |
| 박치기 | Headbutt | ironclad | S | engine | any | block 4.50(S)→4.00(A) · exhaust 4.50(S)→4.00(A) · self_damage 4.50(S)→4.00(A) |
| 숨겨진 보석 | Hidden Gem | ironclad | B | engine | any | block 4.50(S)→4.00(A) · exhaust 4.50(S)→4.00(A) · self_damage 4.50(S)→4.00(A) · strike 4.50(S)→4.00(A) |
| 잭팟 | Jackpot | ironclad | B | payoff | claw, any | strength 2.60(B)→2.10(C) · block 1.50(C)→1.30(D) · exhaust 1.50(C)→1.30(D) · self_damage 1.50(C)→1.30(D) · strike 2.60(B)→2.10(C) |
| 난도질 | Mangle | ironclad | A | generator | any | block 4.40(S)→4.20(A) · exhaust 4.40(S)→4.20(A) · self_damage 4.40(S)→4.20(A) |
| 대혼란 | Mayhem | ironclad | B | engine | any | block 4.50(S)→4.00(A) · exhaust 4.50(S)→4.00(A) · self_damage 4.50(S)→4.00(A) · strike 4.50(S)→4.00(A) |
| 정신 공격 | Mind Blast | ironclad | C | payoff | any | strength 2.50(B)→2.00(C) · strike 2.50(B)→2.00(C) |
| 만물 절단 | Omnislice | ironclad | B | payoff | any | strength 2.59(B)→2.09(C) · strike 2.59(B)→2.09(C) |
| 원투 펀치 | One-Two Punch | ironclad | B | generator | strength, any | exhaust 1.63(C)→1.43(D) |
| 위풍당당 | Panache | ironclad | S | engine | claw, sly, any | strength 4.75(S)→4.25(A) · strike 4.75(S)→4.25(A) |
| 준비 시간 | Prep Time | ironclad | B | engine | any | strength 4.60(S)→4.10(A) · block 3.80(A)→3.30(B) · exhaust 3.80(A)→3.30(B) · self_damage 4.60(S)→4.10(A) · strike 3.80(A)→3.30(B) |
| 원시의 힘 | Primal Force | ironclad | A | payoff | strength, any | self_damage 1.66(C)→1.46(D) · strike 1.66(C)→1.46(D) |
| 쥐어뜯기 | Rend | ironclad | B | payoff | any | strength 3.50(A)→3.30(B) · strike 3.50(A)→3.30(B) |
| 굴러가는 바위 | Rolling Boulder | ironclad | B | engine | any | block 4.43(S)→3.93(A) · exhaust 4.43(S)→3.93(A) · self_damage 4.43(S)→3.93(A) |
| 집중 포화 | Salvo | ironclad | B | payoff | any | strength 3.50(A)→3.30(B) · strike 3.50(A)→3.30(B) |
| 흘려보내기 | Shrug It Off | ironclad | B | defense | block, any | exhaust 3.57(A)→3.37(B) · self_damage 3.57(A)→3.37(B) · strike 3.57(A)→3.37(B) |
| 쇄도 | Stampede | ironclad | C | generator | strength, any | self_damage 1.69(C)→1.49(D) |
| 폭탄 | The Bomb | ironclad | C | payoff | any | strength 1.52(C)→1.32(D) · strike 1.52(C)→1.32(D) |
| 무자비 | Unrelenting | ironclad | B | generator | strength, any | exhaust 1.63(C)→1.43(D) |
| 포악함 | Vicious | ironclad | A | payoff | any | strength 3.52(A)→3.32(B) · exhaust 1.52(C)→1.32(D) · strike 3.52(A)→3.32(B) |
| 자동화 | Automation | necrobinder | B | engine | any | osty 4.50(S)→4.00(A) · doom 4.50(S)→4.00(A) |
| 두들겨 패기 | Beat Down | necrobinder | C | payoff | any | osty 2.50(B)→2.00(C) |
| 재앙 | Calamity | necrobinder | C | engine | any | soul 3.50(A)→3.00(B) · osty 4.30(S)→3.80(A) · doom 3.50(A)→3.00(B) |
| 정화 | Cleanse | necrobinder | S | generator | osty, any | doom 3.41(A)→3.21(B) |
| 지연 | Delay | necrobinder | B | generator | doom, any | osty 3.60(A)→3.40(B) |
| 권역 | Demesne | necrobinder | S | engine | soul, any | doom 4.50(S)→4.00(A) |
| 기력 흡수 | Drain Power | necrobinder | B | generator | any | soul 3.57(A)→3.37(B) |
| 극적인 입장 | Dramatic Entrance | necrobinder | B | payoff | any | osty 2.56(B)→2.06(C) · doom 2.56(B)→2.06(C) |
| 계몽 | Enlightenment | necrobinder | B | engine | any | soul 4.33(S)→3.83(A) · osty 4.33(S)→3.83(A) · doom 4.33(S)→3.83(A) |
| 황금 도끼 | Gold Axe | necrobinder | C | payoff | any | soul 2.50(B)→2.00(C) · osty 2.50(B)→2.00(C) · doom 2.50(B)→2.00(C) |
| 무덤 폭발 | Graveblast | necrobinder | S | generator | soul, any | osty 3.45(A)→3.25(B) · doom 2.55(B)→2.05(C) |
| 하이파이브 | High Five | necrobinder | A | generator | osty, any | doom 2.59(B)→2.09(C) |
| 잭팟 | Jackpot | necrobinder | B | payoff | claw, any | soul 1.50(C)→1.30(D) · osty 2.60(B)→2.10(C) · doom 1.50(C)→1.30(D) |
| 치사성 | Lethality | necrobinder | A | engine | doom, any | soul 3.44(A)→2.94(B) · osty 4.34(S)→3.84(A) |
| 정신 공격 | Mind Blast | necrobinder | C | payoff | any | osty 2.50(B)→2.00(C) |
| 분석 | Parse | necrobinder | A | generator | soul, any | osty 3.52(A)→3.32(B) · doom 2.62(B)→2.12(C) |
| 준비 시간 | Prep Time | necrobinder | B | engine | any | soul 4.63(S)→4.13(A) · osty 4.63(S)→4.13(A) · doom 4.63(S)→4.13(A) |
| 쥐어뜯기 | Rend | necrobinder | B | payoff | any | osty 3.50(A)→3.30(B) · doom 3.50(A)→3.30(B) |
| 집중 포화 | Salvo | necrobinder | B | payoff | any | osty 3.50(A)→3.30(B) |
| 탐색 타격 | Seeker Strike | necrobinder | B | generator | any | soul 4.47(S)→4.27(A) · osty 4.47(S)→4.27(A) |
| 충격파 | Shockwave | necrobinder | A | generator | any | osty 4.41(S)→4.21(A) |
| 살점 재주 | Sleight of Flesh | necrobinder | C | engine | doom, any | soul 2.60(B)→1.80(C) · osty 3.40(A)→2.90(B) |
| 파종 | Sow | necrobinder | C | generator | doom, any | osty 1.64(C)→1.44(D) |
| 사신의 낫 | The Scythe | necrobinder | B | payoff | any | soul 2.57(B)→2.07(C) · osty 2.57(B)→2.07(C) · doom 2.57(B)→2.07(C) |
| 무기고 | Arsenal | regent | B | engine | stars, any | forge 4.40(S)→3.90(A) |
| 자동화 | Automation | regent | B | engine | any | forge 4.46(S)→3.96(A) |
| 두들겨 패기 | Beat Down | regent | C | payoff | any | forge 2.50(B)→2.00(C) |
| 재앙 | Calamity | regent | C | engine | any | stars 3.50(A)→3.00(B) · forge 4.30(S)→3.80(A) |
| 지면 파쇄 | Crush Under | regent | B | generator | any | forge 3.59(A)→3.39(B) |
| 극적인 입장 | Dramatic Entrance | regent | B | payoff | any | forge 2.50(B)→2.00(C) |
| 계몽 | Enlightenment | regent | B | engine | any | stars 4.41(S)→3.91(A) · forge 4.41(S)→3.91(A) |
| 주먹다짐 | Fisticuffs | regent | B | generator | any | forge 4.50(S)→4.30(A) |
| 필연적인 결과 | Foregone Conclusion | regent | A | engine | stars, any | forge 3.78(A)→3.28(B) |
| 황금 도끼 | Gold Axe | regent | C | payoff | any | stars 2.50(B)→2.00(C) · forge 2.50(B)→2.00(C) |
| 선조의 망치 | Heirloom Hammer | regent | B | generator | stars, any | forge 3.60(A)→3.40(B) |
| 잭팟 | Jackpot | regent | B | payoff | claw, any | stars 2.60(B)→2.10(C) · forge 2.60(B)→2.10(C) |
| 유성우 | Meteor Shower | regent | S | payoff | any | forge 3.50(A)→3.30(B) |
| 정신 공격 | Mind Blast | regent | C | payoff | any | forge 2.50(B)→2.00(C) |
| 위풍당당 | Panache | regent | S | engine | claw, sly, any | stars 4.79(S)→4.29(A) · forge 4.79(S)→4.29(A) |
| 창조의 기둥 | Pillar of Creation | regent | C | engine | stars, any | forge 3.60(A)→3.10(B) |
| 준비 시간 | Prep Time | regent | B | engine | any | stars 4.58(S)→4.08(A) · forge 4.58(S)→4.08(A) |
| 쥐어뜯기 | Rend | regent | B | payoff | any | forge 3.50(A)→3.30(B) |
| 집중 포화 | Salvo | regent | B | payoff | any | forge 3.50(A)→3.30(B) |
| 미래 예지 | Thinking Ahead | regent | A | generator | any | forge 4.45(S)→4.25(A) |
| 자동화 | Automation | silent | B | engine | any | poison 4.50(S)→4.00(A) · shiv 4.50(S)→4.00(A) |
| 재앙 | Calamity | silent | C | engine | any | sly 3.50(A)→3.00(B) · poison 3.50(A)→3.00(B) · shiv 3.50(A)→3.00(B) |
| 망토와 단검 | Cloak And Dagger | silent | B | generator | shiv, any | poison 3.52(A)→3.32(B) |
| 탈출구 | Escape Plan | silent | A | generator | sly, any | poison 4.32(S)→4.12(A) · shiv 4.32(S)→4.12(A) |
| 들춰내기 | Expose | silent | A | generator | any | sly 4.30(S)→4.10(A) · shiv 4.30(S)→4.10(A) |
| 주먹다짐 | Fisticuffs | silent | B | generator | any | poison 4.43(S)→4.23(A) · shiv 4.43(S)→4.23(A) |
| 발놀림 | Footwork | silent | A | engine | any | sly 4.67(S)→4.17(A) |
| 황금 도끼 | Gold Axe | silent | C | payoff | any | sly 2.50(B)→2.00(C) · poison 2.50(B)→2.00(C) · shiv 2.50(B)→2.00(C) |
| 잭팟 | Jackpot | silent | B | payoff | claw, any | sly 1.50(C)→1.30(D) · poison 1.50(C)→1.30(D) · shiv 1.50(C)→1.30(D) |
| 무력화 | Neutralize | silent | D | generator | any | poison 1.60(C)→1.40(D) |
| 악몽 | Nightmare | silent | C | engine | sly, any | poison 3.40(A)→2.90(B) · shiv 3.40(A)→2.90(B) |
| 귀를 찢는 비명 | Piercing Wail | silent | S | generator | any | sly 4.37(S)→4.17(A) · poison 4.37(S)→4.17(A) · shiv 4.37(S)→4.17(A) |
| 준비 시간 | Prep Time | silent | B | engine | any | sly 4.55(S)→4.05(A) · poison 4.55(S)→4.05(A) · shiv 4.55(S)→4.05(A) |
| 안식 | Relax | silent | A | generator | any | sly 4.49(S)→4.29(A) · poison 4.49(S)→4.29(A) · shiv 4.49(S)→4.29(A) |
| 탐색 타격 | Seeker Strike | silent | B | generator | any | sly 4.41(S)→4.21(A) |
| 구렁이의 형상 | Serpent Form | silent | C | engine | sly, shiv, any | poison 2.60(B)→1.80(C) |
| 칼질 | Slice | silent | C | generator | any | poison 2.54(B)→2.04(C) · shiv 2.54(B)→2.04(C) |
| 스피드스터 | Speedster | silent | C | engine | sly, any | poison 2.60(B)→1.80(C) · shiv 2.60(B)→1.80(C) |
| 불의의 일격 | Sucker Punch | silent | C | generator | any | sly 2.65(B)→2.15(C) · poison 3.45(A)→3.25(B) · shiv 2.65(B)→2.15(C) |
| 유령의 형상 | Wraith Form | silent | S | engine | any | sly 4.73(S)→4.23(A) · poison 3.83(A)→3.33(B) · shiv 3.83(A)→3.33(B) |

(콜로리스 카드는 채점되는 캐릭터별로 행이 나뉨. 카드ID 기준 고유 69장 / (캐릭터,카드) 기준 111건. 캐릭터별: ironclad 30 · silent 20 · defect 17 · regent 20 · necrobinder 24)

## 3. `any` + 상극(anti에 같은 캐릭터 아키타입 id) 공존 카드 전수

조건: `builds`에 `any` 포함 + `anti`에 그 캐릭터의 아키타입 id(DB.archetypes) 포함. 콜로리스는 5캐릭터 아키타입 id 전체와 대조 — 해당 0장. "현재 등급"은 §2 기준선(빈 덱·강제 아키 strength 1.0)에서 builds의 첫 구체 빌드 아키타입으로 채점한 값.

**캐릭터별 소계: ironclad 9 · silent 1 · defect 2 · regent 8 · necrobinder 11 · colorless 0 — 총 31장** (배경의 네크로바인더 11장 확인과 일치)

| 카드(한글명) | 카드ID (db.js 행) | 캐릭터 | tier | builds | anti | 현재 등급(대표 아키타입 기준) |
|---|---|---|---|---|---|---|
| 포악함 | Vicious (db.js:507) | ironclad | A | any | exhaust | (any 단독 — 아래 소표) |
| 원시의 힘 | Primal Force (db.js:547) | ironclad | A | strength, any | exhaust | strength 3.66 (A) |
| 격돌 | Clash (db.js:1221) | ironclad | D | any | block, exhaust, self_damage | (any 단독 — 아래 소표) |
| 떨림 | Tremble (db.js:1794) | ironclad | C | strength, strike, any | exhaust, block | strength 4.52 (S) |
| 협박 | Bully (db.js:1819) | ironclad | C | strength, any | exhaust, block | strength 3.30 (B) |
| 전투의 북소리 | Drum of Battle (db.js:1884) | ironclad | C | exhaust, any | strength, block, self_damage | exhaust 4.20 (A) |
| 쇄도 | Stampede (db.js:1984) | ironclad | C | strength, any | exhaust, block | strength 4.49 (S) |
| 무자비 | Unrelenting (db.js:2007) | ironclad | B | strength, any | exhaust, block | strength 4.53 (S) |
| 원투 펀치 | One-Two Punch (db.js:2054) | ironclad | B | strength, any | exhaust | strength 5.33 (S) |
| 대단원의 막 | Grand Finale (db.js:3091) | silent | D | any | poison, shiv, sly | (any 단독 — 아래 소표) |
| 눈 할퀴기 | Go for the Eyes (db.js:4315) | defect | B | claw, any | orb | claw 4.83 (S) |
| 파괴광선 | Hyperbeam (db.js:4601) | defect | D | any | frost, focus, orb | (any 단독 — 아래 소표) |
| 광채 | Glow (db.js:5782) | regent | S | stars, any | forge | stars 5.76 (S) |
| 빅뱅 | Big Bang (db.js:5805) | regent | S | stars, any | forge | stars 6.00 (S) |
| 공허의 형상 | Void Form (db.js:5854) | regent | S | any | forge | (any 단독 — 아래 소표) |
| 막아라!!! | GUARDS!!! (db.js:5943) | regent | S | stars, any | forge | stars 4.15 (A) |
| 필연적인 결과 | Foregone Conclusion (db.js:6126) | regent | A | stars, any | forge | stars 6.00 (S) |
| 공진 | Resonance (db.js:6690) | regent | C | any | forge | (any 단독 — 아래 소표) |
| 전장의 생존자 | Wrought in War (db.js:6848) | regent | B | forge, any | stars | forge 4.33 (S) |
| 별의 망토 | Cloak of Stars (db.js:6956) | regent | B | stars, any | forge | stars 5.02 (S) |
| 권역 | Demesne (db.js:7561) | necrobinder | S | soul, any | doom, osty | soul 6.00 (S) |
| 정신 폭주 | Neurosurge (db.js:7686) | necrobinder | S | doom, any | osty | doom 6.00 (S) |
| 추출 | Dredge (db.js:7754) | necrobinder | S | soul, any | doom, osty | soul 6.00 (S) |
| 치사성 | Lethality (db.js:7776) | necrobinder | A | doom, any | soul, osty | doom 6.00 (S) |
| 무덤 폭발 | Graveblast (db.js:7963) | necrobinder | S | soul, any | doom, osty | soul 5.95 (S) |
| 쇠락 | Debilitate (db.js:7986) | necrobinder | A | doom, any | soul, osty | doom 6.00 (S) |
| 분석 | Parse (db.js:8058) | necrobinder | A | soul, any | doom, osty | soul 6.00 (S) |
| 하이파이브 | High Five (db.js:8193) | necrobinder | A | osty, any | doom, soul | osty 5.19 (S) |
| 변형 | Transfigure (db.js:8240) | necrobinder | A | soul, any | doom, osty | soul 6.00 (S) |
| 쇠약의 손길 | Enfeebling Touch (db.js:8305) | necrobinder | B | doom, any | soul, osty | doom 5.67 (S) |
| 운명 공유 | Shared Fate (db.js:8496) | necrobinder | A | doom, any | soul, osty | doom 6.00 (S) |

`builds=[any]` 단독이라 대표 아키타입이 없는 6장 — 캐릭터 전 아키타입 기준선 등급:

| 카드 | 캐릭터 | 아키타입별 점수(등급) |
|---|---|---|
| 포악함 (Vicious) | ironclad | strength 3.52(A) · block 2.72(B) · exhaust 1.52(C) · self_damage 2.72(B) · strike 3.52(A) |
| 격돌 (Clash) | ironclad | strength 0.66(D) · block 0.00(D) · exhaust 0.00(D) · self_damage 0.00(D) · strike 0.66(D) |
| 대단원의 막 (Grand Finale) | silent | sly 0.00(D) · poison 0.00(D) · shiv 0.00(D) |
| 파괴광선 (Hyperbeam) | defect | orb 0.00(D) · claw 0.40(D) · status 0.40(D) |
| 공허의 형상 (Void Form) | regent | stars 6.00(S) · forge 5.12(S) |
| 공진 (Resonance) | regent | stars 3.83(A) · forge 1.83(C) |

참고 사실: Hyperbeam의 anti 중 `frost`·`focus`, Wraith Form(§5)의 anti 중 `dexterity`·`block` 등은 아키타입 **id**가 아니라 core/support **태그**로도 감점 경로(logic.js:203)에 걸린다. 위 31장 집계는 지시서 정의(anti에 아키타입 id)만 센 것이다.

## 4. `any` 부여 기준 추적

tier 상관 (앱 로드 후 575장):

| tier | 전체 | any | 비율 |
|---|---|---|---|
| S | 55 | 32 | **58.2%** |
| A | 113 | 42 | 37.2% |
| B | 164 | 66 | 40.2% |
| C | 136 | 52 | 38.2% |
| D | 107 | 12 | **11.2%** |

role 상관:

| role | 전체 | any | 비율 |
|---|---|---|---|
| generator | 254 | 121 | **47.6%** |
| engine | 107 | 40 | 37.4% |
| payoff | 130 | 40 | 30.8% |
| utility | 65 | 1 | 1.5% |
| defense | 5 | 1 | — |
| support | 1 | 1 | — |
| (role 없음) | 13 | 0 | 0% |

커밋 히스토리:

- 이 저장소의 이력은 2026-07-13이 시초다(루트 커밋 4개: `22148a8`·`dcf7f0e` 2026-07-13, `065fbd6`·`2d32907` 2026-07-18 — 각각 파일 전체를 신규 추가하는 형태).
- db.js의 `"any"` 문자열 출현 수는 **최초 커밋부터 현재까지 865개로 불변**이다(22148a8 = dcf7f0e = 2d32907 = 5668649 = 865, `git show <커밋>:db.js | grep -c '"any"'`). `git log -S'"any"' --follow -- db.js`에 걸리는 커밋은 위 파일-신규-추가 커밋 4개뿐 — **저장소 이력 안에서 any를 추가하거나 뺀 커밋은 없다.** 대량 부여 시점은 저장소 이력 이전.
- 865개의 맥락 구성: 카드 builds 208 + 유물 builds 159 + 유물 `"char": "any"` 248 + relicNames `"c": "any"` 243 + 기타 7.
- 수작업 흔적: scripts/apply_patches.js:69, 132, 153과 scripts/apply_patches_2.js:65, 76, 89, 100, 111에서 패치 반영 시 카드별로 `builds: ["any", ...]`를 손으로 기입했다(예: Expect A Fight, Not Yet, Drum of Battle). 이 8건은 수작업 부여의 직접 근거다.
- 스크립트 생성 흔적: tools/ 아래 어느 도구에도 `any` 문자열이 없다. 자동 추출 도구(extract_missing_cards.js가 생성한 data/extra_cards.js)는 신규 카드에 `builds: []`(빈 배열)를 넣지 `any`를 넣지 않는다(data/extra_cards.js:9).
- 부여 기준 문서: 어드바이저_설계서.md, 확인목록_TODO.md, 현재상태.md, CHANGELOG.md에서 any 부여 기준 서술을 찾지 못했다(grep 확인).
- **결론: 대량 부여(204장)의 기준·시점·주체는 확인 못 함.** 확인된 것은 (1) 저장소 이력 이전에 이미 존재, (2) 이후 소량 추가는 수작업 패치 스크립트 경유, (3) tier가 높을수록(S 58% vs D 11%), role이 generator일수록 any 비율이 높다는 상관뿐이다.

## 5. 상충 지점 — 제외형과 통과권형이 같은 카드에서 반대로 작동하는 경우

### 5-a. misfit 감점(제외형 logic.js:311→315-317) + any발 가점(통과권형 341·440) 동시 발화

`builds:[구체빌드, any]` 카드가 다른 빌드 덱에서 채점되면, misfit 판정은 any를 **빼고**("이 빌드 카드가 아니다" → −0.9) 역할/act2 가점은 any를 **인정**한다("이 빌드에 맞다" → +0.2~+0.5). §2 기준선에서 같은 scoreCard 호출 안에 둘이 동시에 찍힌 쌍이 **211쌍, 고유 (캐릭터,카드) 93건**(ironclad 17 · silent 22 · defect 11 · regent 19 · necrobinder 24). 예시:

| 카드 | 아키타입 | builds | 동시에 찍힌 근거 |
|---|---|---|---|
| 전투의 북소리 (Drum of Battle) | ironclad/strength | exhaust, any | "−0.9 소진 카드라 힘 빌드와 안 맞음" + "+0.3 첫 엔진 카드" + "+0.2 확정된 빌드에 적합 (2막)" |
| 위풍당당 (Panache) | ironclad/strength | claw, sly, any | "−0.9 발톱 카드라 힘 빌드와 안 맞음" + "+0.3 첫 엔진 카드" + "+0.2 확정된 빌드에 적합 (2막)" |
| 포식 (Feed) | ironclad/strength | self_damage, any | "−0.9 사혈 카드라 힘 빌드와 안 맞음" + "+0.2 확정된 빌드에 적합 (2막)" |
| 불굴 (Not Yet) | ironclad/strength | any, self_damage, exhaust | "−0.9 사혈 카드라 힘 빌드와 안 맞음" + "+0.2 확정된 빌드에 적합 (2막)" |

### 5-b. anti 아키타입 충돌 감점(logic.js:200-210) + any발 가점 동시 발화 — 43쌍 전체

§3의 공존 카드가 실제 점수에서 발현되는 형태다. "이 빌드에서 해롭다"(−0.9)와 "이 빌드에 적합"(+0.2~0.5)이 같은 호출에 공존한다.

| 카드 | 아키타입 | builds | anti | 감점 | any발 가점 | 기준선 점수 |
|---|---|---|---|---|---|---|
| 전투의 북소리 (Drum of Battle) | ironclad/strength | exhaust, any | strength, block, self_damage | −0.9 힘 빌드와 충돌 | +0.3 첫 엔진 + 0.2 적합 | 1.40 (D) |
| 격돌 (Clash) | ironclad/block | any | block, exhaust, self_damage | −0.9 방어 빌드와 충돌 | +0.2 | 0.00 (D) |
| 떨림 (Tremble) | ironclad/block | strength, strike, any | exhaust, block | −0.9 방어 빌드와 충돌 | +0.2 | 0.82 (D) |
| 협박 (Bully) | ironclad/block | strength, any | exhaust, block | −0.9 방어 빌드와 충돌 | +0.2 | 0.00 (D) |
| 전투의 북소리 (Drum of Battle) | ironclad/block | exhaust, any | strength, block, self_damage | −0.9 방어 빌드와 충돌 | +0.3 + 0.2 | 2.50 (B) |
| 쇄도 (Stampede) | ironclad/block | strength, any | exhaust, block | −0.9 방어 빌드와 충돌 | +0.2 | 0.79 (D) |
| 무자비 (Unrelenting) | ironclad/block | strength, any | exhaust, block | −0.9 방어 빌드와 충돌 | +0.2 | 0.83 (D) |
| 포악함 (Vicious) | ironclad/exhaust | any | exhaust | −0.9 소진 빌드와 충돌 | +0.2 | 1.52 (C) |
| 원시의 힘 (Primal Force) | ironclad/exhaust | strength, any | exhaust | −0.9 소진 빌드와 충돌 | +0.2 | 0.00 (D) |
| 격돌 (Clash) | ironclad/exhaust | any | block, exhaust, self_damage | −0.9 소진 빌드와 충돌 (방어) | +0.2 | 0.00 (D) |
| 떨림 (Tremble) | ironclad/exhaust | strength, strike, any | exhaust, block | −0.9 소진 빌드와 충돌 | +0.2 | 0.82 (D) |
| 협박 (Bully) | ironclad/exhaust | strength, any | exhaust, block | −0.9 소진 빌드와 충돌 | +0.2 | 0.00 (D) |
| 쇄도 (Stampede) | ironclad/exhaust | strength, any | exhaust, block | −0.9 소진 빌드와 충돌 | +0.2 | 0.79 (D) |
| 무자비 (Unrelenting) | ironclad/exhaust | strength, any | exhaust, block | −0.9 소진 빌드와 충돌 | +0.2 | 1.63 (C) |
| 원투 펀치 (One-Two Punch) | ironclad/exhaust | strength, any | exhaust | −0.9 소진 빌드와 충돌 | +0.2 | 1.63 (C) |
| 격돌 (Clash) | ironclad/self_damage | any | block, exhaust, self_damage | −0.9 사혈/자해 빌드와 충돌 | +0.2 | 0.00 (D) |
| 전투의 북소리 (Drum of Battle) | ironclad/self_damage | exhaust, any | strength, block, self_damage | −0.9 사혈/자해 빌드와 충돌 (힘) | +0.3 + 0.2 | 2.50 (B) |
| 대단원의 막 (Grand Finale) | silent/sly | any | poison, shiv, sly | −0.9 교활/버리기 빌드와 충돌 | +0.2 | 0.00 (D) |
| 대단원의 막 (Grand Finale) | silent/poison | any | poison, shiv, sly | −0.9 중독 빌드와 충돌 | +0.2 | 0.00 (D) |
| 유령의 형상 (Wraith Form) | silent/poison | any | dexterity, block | −0.9 중독 빌드와 충돌 (방어) | +0.3 + 0.2 | 3.83 (A) |
| 대단원의 막 (Grand Finale) | silent/shiv | any | poison, shiv, sly | −0.9 비수 난사 빌드와 충돌 | +0.2 | 0.00 (D) |
| 유령의 형상 (Wraith Form) | silent/shiv | any | dexterity, block | −0.9 비수 난사 빌드와 충돌 (민첩) | +0.3 + 0.2 | 3.83 (A) |
| 눈 할퀴기 (Go for the Eyes) | defect/orb | claw, any | orb | −0.9 구체/집중 엔진 빌드와 충돌 | +0.2 | 1.13 (D) |
| 파괴광선 (Hyperbeam) | defect/orb | any | frost, focus, orb | −0.9 구체/집중 엔진 빌드와 충돌 (frost) | +0.2 | 0.00 (D) |
| 전장의 생존자 (Wrought in War) | regent/stars | forge, any | stars | −0.9 별 엔진 빌드와 충돌 | +0.2 | 0.63 (D) |
| 광채 (Glow) | regent/forge | stars, any | forge | −0.9 단조 빌드와 충돌 | +0.2 | 3.16 (B) |
| 빅뱅 (Big Bang) | regent/forge | stars, any | forge | −0.9 단조 빌드와 충돌 | +0.2 | 4.10 (A) |
| 공허의 형상 (Void Form) | regent/forge | any | forge | −0.9 단조 빌드와 충돌 | +0.3 + 0.2 | 5.12 (S) |
| 막아라!!! (GUARDS!!!) | regent/forge | stars, any | forge | −0.9 단조 빌드와 충돌 | +0.2 | 2.05 (C) |
| 필연적인 결과 (Foregone Conclusion) | regent/forge | stars, any | forge | −0.9 단조 빌드와 충돌 | +0.3 + 0.2 | 3.78 (A) |
| 공진 (Resonance) | regent/forge | any | forge | −0.9 단조 빌드와 충돌 | +0.2 | 1.83 (C) |
| 별의 망토 (Cloak of Stars) | regent/forge | stars, any | forge | −0.9 단조 빌드와 충돌 | +0.2 | 1.32 (D) |
| 치사성 (Lethality) | necrobinder/soul | doom, any | soul, osty | −0.9 영혼 엔진 빌드와 충돌 | +0.3 + 0.2 | 3.44 (A) |
| 쇠락 (Debilitate) | necrobinder/soul | doom, any | soul, osty | −0.9 영혼 엔진 빌드와 충돌 | +0.2 | 2.86 (B) |
| 하이파이브 (High Five) | necrobinder/soul | osty, any | doom, soul | −0.9 영혼 엔진 빌드와 충돌 | +0.2 | 1.49 (D) |
| 쇠약의 손길 (Enfeebling Touch) | necrobinder/soul | doom, any | soul, osty | −0.9 영혼 엔진 빌드와 충돌 | +0.2 | 1.97 (C) |
| 운명 공유 (Shared Fate) | necrobinder/soul | doom, any | soul, osty | −0.9 영혼 엔진 빌드와 충돌 | +0.2 | 3.70 (A) |
| 권역 (Demesne) | necrobinder/doom | soul, any | doom, osty | −0.9 파멸 중첩 빌드와 충돌 | +0.3 + 0.2 | 4.50 (S) |
| 추출 (Dredge) | necrobinder/doom | soul, any | doom, osty | −0.9 파멸 중첩 빌드와 충돌 | +0.2 | 3.04 (B) |
| 무덤 폭발 (Graveblast) | necrobinder/doom | soul, any | doom, osty | −0.9 파멸 중첩 빌드와 충돌 | +0.2 | 2.55 (B) |
| 분석 (Parse) | necrobinder/doom | soul, any | doom, osty | −0.9 파멸 중첩 빌드와 충돌 | +0.2 | 2.62 (B) |
| 하이파이브 (High Five) | necrobinder/doom | osty, any | doom, soul | −0.9 파멸 중첩 빌드와 충돌 | +0.2 | 2.59 (B) |
| 변형 (Transfigure) | necrobinder/doom | soul, any | doom, osty | −0.9 파멸 중첩 빌드와 충돌 | +0.3 + 0.2 | 3.90 (A) |

(§3 공존 31장 중 이 표에 없는 카드 — Neurosurge 등 — 는 anti의 아키타입 id가 해당 아키타입의 core/support **태그** 목록에 없어서 감점 경로 logic.js:203에 안 걸리는 경우다. 조사 C2 보고서의 Dirge 각주와 같은 구조.)

### 5-c. 표시 계층 상충 (정적 사실)

- index.html:1077(제외형)은 `builds:[any]` 단독 카드에 '빌드 후보' 배지를 **안** 주고, 같은 화면의 리드 문구 index.html:1094(통과권형)는 같은 카드를 "현재 빌드와 잘 맞아 추천합니다"로 표시한다. 같은 카드가 배지 기준으로는 빌드 카드가 아니고 문구 기준으로는 빌드 적합이다.
- logic.js:125(제외형)에서 any 단독 카드는 아키타입 감지의 primaryCount(대표 빌드 카드 수)에 기여하지 못하지만, logic.js:341(통과권형)에서는 그 아키타입의 엔진/생성기/보상으로 집계되고 가점을 받는다.
