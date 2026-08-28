// ============================================================
//  sim_c_options.js — C항목 처방 3안 시뮬레이션 (조사 전용, 앱 코드 무수정)
//  ------------------------------------------------------------
//  확인목록 C항목의 처방 3안(① 로직 가드 / ② core 우선 / ③ support 가중치
//  축소 0.5·0.33·0.25)이 점수·등급을 얼마나 움직이는지 전수 계산한다.
//  판단·권고 없음 — 숫자만 낸다.
//
//  방법:
//   - verify_blend.js와 동일한 로드 순서(db.js → extra_cards.js → api_data.js
//     → logic.js → index.html 산식 블록)로 앱 실제 산식을 그대로 실행.
//   - logic.js 원본 소스에서 시너지 루프·안티시너지 아키타입 루프·기본점수
//     대입 줄만 문자열 치환해 매개변수화한 SIM_scoreCard를 별도 이름공간에 생성.
//     (logic.js 파일 자체는 수정하지 않음 — 읽기와 불러오기만)
//   - 기준선 검산: 중립 매개변수(가드 OFF·core우선 OFF·계수 1.0)의
//     SIM_scoreCard가 실제 logic.js scoreCard와 전체 (카드×아키타입) 쌍에서
//     완전 일치(===)하는지 확인. 1건이라도 다르면 즉시 중단.
//   - 조건 통일: 아키타입 1개를 강제 활성(strength=1.0), 빈 덱, 유물 없음,
//     floor=20·act=2(floorToAct(20)=2로 일관), encounter='normal'.
//     풀 = 해당 캐릭터 카드 전체 + 콜로리스(getCard 폴백과 동일 우선순위).
//   - 클램프 전/후: 전문가 앵커 클램프(±1.0)는 기본점수 블렌드 단계에 적용됨
//     (index.html expertClampVal). "적용 후" = 실제 앱 경로(cardBaseScoreVal),
//     "적용 전" = 블렌드 원값(blendRawVal)을 기본점수로 사용. 최종 [0,6] 절사
//     (logic.js:555)는 앱 코드 그대로 양쪽 파이프라인에 공통 적용.
//
//  변형 구현 규약 (사실 기록 — 지시서가 확정하지 않은 세부의 구현 결정):
//   ① 가드: 같은 아키타입에서 시너지 가점 자격과 안티 감점 자격이 동시에
//      성립하면 가점·감점·근거 표시 모두 제외(A항목 162a285 원칙). 제외 시
//      matchCount(DIMN 감쇠 인덱스)도 올리지 않음 — 단일 아키타입 강제
//      활성에서는 영향 없음.
//   ② core 우선: coreHit = (syn 태그가 core∪{아키타입 id}에 걸림) 또는
//      (anti 태그가 core에 걸림). coreHit이면 그 아키타입의 support 경로
//      매칭(가점·감점 모두)을 무시하고 core 경로만 계산. coreHit이 아니면
//      기존과 동일(support 허용).
//   ③ 계수: 매칭 경로 판정 시 core∪{id}를 먼저 보고, 없으면 support.
//      support 경로로 매칭된 가점(boost)·감점(pen)에만 계수를 곱함.
//      (core 매칭이 있는 카드는 축소 대상 아님)
//   - anti의 core 판정은 logic.js:203 그대로 arch.core만(아키타입 id 불포함).
//     syn의 core-동급 판정은 logic.js:185의 id 경로를 core 쪽으로 분류.
//
//  용법: node tools/sim_c_options.js   →  docs/조사_C2_처방시뮬레이션.md 생성
// ============================================================
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PROJ = path.join(__dirname, '..');
global.window = global;

// ── 1. 앱 로드 (verify_blend.js와 동일) ──────────────────────
eval(fs.readFileSync(path.join(PROJ, 'db.js'), 'utf8').replace('const DB', 'global.DB'));
eval(fs.readFileSync(path.join(PROJ, 'data/extra_cards.js'), 'utf8'));
eval(fs.readFileSync(path.join(PROJ, 'data/api_data.js'), 'utf8'));

global.state = { char: 'ironclad', floor: 20, act: 2, encounter: 'normal', deck: [], relics: [], offeredByMode: { reward: [], shop: [] }, mode: 'reward', archFilter: 'current', asc: 'all' };
global.API = window.API_DATA;
global.canonEN = n => n;
global.apiKey = n => (n || '').toUpperCase().replace(/[\s\-]/g, '_').replace(/[^A-Z0-9_]/g, '').replace(/_+/g, '_');
global.koName = n => n; global.koTag = n => n; global.koArch = n => n; global.koBuild = n => n;

const logicSrc = fs.readFileSync(path.join(PROJ, 'logic.js'), 'utf8');
eval(logicSrc
  .replace('const GRADE_VALS', 'global.GRADE_VALS')
  .replace('const SCORE_GRADE ', 'global.SCORE_GRADE ')
  .replace('const SCORE_GRADE_SD', 'global.SCORE_GRADE_SD')
  .replace(/^function (\w+)/gm, 'global.$1=function'));

// index.html 실파일에서 산식 블록 추출 (dataBaseScore ~ isExpertOnly)
const html = fs.readFileSync(path.join(PROJ, 'index.html'), 'utf8');
const s0 = html.indexOf('// DELTA 원점수');
const s1 = html.indexOf('// 표시 이름은 API');
if (s0 < 0 || s1 <= s0) { console.error('실패: index.html 산식 블록을 찾지 못함'); process.exit(1); }
eval(html.slice(s0, s1)
  .replace(/^const BLEND/gm, 'global.BLEND')
  .replace(/^function (\w+)/gm, 'global.$1=function'));

// ── 2. SIM_scoreCard 생성 — logic.js 소스의 국소 치환 ────────
// 치환 앵커(원본과 한 글자라도 다르면 즉시 중단)
const SYN_START = '  // Synergy - graduated with diminishing returns + saturation';
const ANTI_START = '  // Anti-synergy - penalize cards that conflict with detected archetypes';
const ANTI_END = '\n  for (const tag of (data.anti || [])) {'; // 제2 경로(덱 태그, 들여쓰기 2) — 유지 대상
const BASE_LINE = "  let score = (typeof cardBaseScoreVal === 'function') ? cardBaseScoreVal(cardName, char) : tierVal;";

const iSyn = logicSrc.indexOf(SYN_START);
const iAnti = logicSrc.indexOf(ANTI_START);
const iAntiEnd = logicSrc.indexOf(ANTI_END, iAnti);
if (iSyn < 0 || iAnti < 0 || iAntiEnd < 0 || !(iSyn < iAnti && iAnti < iAntiEnd) || !logicSrc.includes(BASE_LINE)) {
  console.error('실패: logic.js 치환 앵커를 찾지 못함 — 소스가 변경됨. 시뮬레이션 무효.');
  process.exit(1);
}

// 경로 판정 헬퍼 — 변형 5케이스와 모순 분류가 공유 (중립이면 원본과 동일 선택)
global.__simPickPaths = function (data, arch, dup, opts) {
  const syn = data.syn || [], anti = data.anti || [];
  let synFirstAny = null, synFirstAnyPath = null, synFirstCore = null, synFirstSupp = null;
  for (const t of syn) {
    if (dup.has(t)) continue;
    const c = arch.core.includes(t) || arch.id === t;   // logic.js:185의 id 경로는 core로 분류
    const s = arch.support.includes(t);
    if ((c || s) && synFirstAny === null) { synFirstAny = t; synFirstAnyPath = c ? 'core' : 'support'; }
    if (c && synFirstCore === null) synFirstCore = t;
    if (s && synFirstSupp === null) synFirstSupp = t;
  }
  let antiFirstAny = null, antiFirstAnyPath = null, antiFirstCore = null, antiFirstSupp = null;
  for (const t of anti) {
    if (dup.has(t)) continue;
    const c = arch.core.includes(t);                    // logic.js:203 그대로 — id 경로 없음
    const s = arch.support.includes(t);
    if ((c || s) && antiFirstAny === null) { antiFirstAny = t; antiFirstAnyPath = c ? 'core' : 'support'; }
    if (c && antiFirstCore === null) antiFirstCore = t;
    if (s && antiFirstSupp === null) antiFirstSupp = t;
  }
  let synTag, synPath, antiTag, antiPath;
  if (opts.supportCoeff !== 1) {                        // ③ core 우선 선택 후 support에만 계수
    synTag = synFirstCore !== null ? synFirstCore : synFirstSupp;
    synPath = synFirstCore !== null ? 'core' : (synFirstSupp !== null ? 'support' : null);
    antiTag = antiFirstCore !== null ? antiFirstCore : antiFirstSupp;
    antiPath = antiFirstCore !== null ? 'core' : (antiFirstSupp !== null ? 'support' : null);
  } else {                                              // 원본과 동일: 첫 매칭 태그
    synTag = synFirstAny; synPath = synFirstAnyPath;
    antiTag = antiFirstAny; antiPath = antiFirstAnyPath;
  }
  if (opts.corePriority) {                              // ② coreHit이면 support 경로 무시
    const coreHit = (synFirstCore !== null) || (antiFirstCore !== null);
    if (coreHit) {
      synTag = synFirstCore; synPath = synFirstCore !== null ? 'core' : null;
      antiTag = antiFirstCore; antiPath = antiFirstCore !== null ? 'core' : null;
    }
  }
  let drop = false;                                     // ① 같은 아키타입에서 가점·감점 동시 → 둘 다 제외
  if (opts.guard && synTag !== null && antiTag !== null) drop = true;
  return { synTag, synPath, antiTag, antiPath, drop };
};

const SYN_REPLACEMENT = `  // [SIM] Synergy — 매개변수화(중립이면 원본과 동일 계산)
  const DIMN = [1.0, 0.6, 0.3];
  let matchCount = 0;
  const __simOpts = (typeof SIM_OPTS !== 'undefined' && SIM_OPTS) ? SIM_OPTS : { guard: false, corePriority: false, supportCoeff: 1 };
  for (const {arch, strength} of da.detected) {
    if (matchCount >= DIMN.length) break;
    const __pick = __simPickPaths(data, arch, synAntiDup, __simOpts);
    if (__pick.drop || __pick.synTag === null) continue;
    const tag = __pick.synTag;
    const satCount = da.unionCount(tag);
    const satMult = satCount >= 7 ? 0.35 : satCount >= 4 ? 0.65 : 1.0;
    let boost = (0.3 + strength * 0.5) * DIMN[matchCount] * satMult;
    if (__pick.synPath === 'support' && __simOpts.supportCoeff !== 1) boost = boost * __simOpts.supportCoeff;
    score += boost;
    const satNote = satMult < 1 ? \` (포화)\` : '';
    synR.push(\`+\${boost.toFixed(1)} \${koArch(arch.name)} 빌드에 적합\${satNote}\`);
    matchCount++;
  }
`;

const ANTI_REPLACEMENT = `  // [SIM] Anti-synergy(아키타입 경로) — 매개변수화. 제2 경로(덱 태그)·상한은 원본 유지
  let antiDelta = 0;
  for (const {arch, strength} of da.detected) {
    const __pick = __simPickPaths(data, arch, synAntiDup, __simOpts);
    if (__pick.drop || __pick.antiTag === null) continue;
    let pen = -(0.4 + strength * 0.5);
    if (__pick.antiPath === 'support' && __simOpts.supportCoeff !== 1) pen = pen * __simOpts.supportCoeff;
    score += pen; antiDelta += pen;
    antiR.push(\`\${pen.toFixed(1)} \${koArch(arch.name)} 빌드와 충돌 (\${koTag(__pick.antiTag)})\`);
  }`;

const BASE_REPLACEMENT = "  let score = (typeof SIM_BASE_RAW !== 'undefined' && SIM_BASE_RAW) ? blendRawVal(baseScoreParts(cardName, char)) : ((typeof cardBaseScoreVal === 'function') ? cardBaseScoreVal(cardName, char) : tierVal);";

const patchedSrc = (logicSrc.slice(0, iSyn) + SYN_REPLACEMENT + logicSrc.slice(iAnti, iAntiEnd).replace(logicSrc.slice(iAnti, iAntiEnd), ANTI_REPLACEMENT) + logicSrc.slice(iAntiEnd))
  .replace(BASE_LINE, BASE_REPLACEMENT);
if (!patchedSrc.includes('[SIM] Synergy') || !patchedSrc.includes('[SIM] Anti-synergy') || !patchedSrc.includes('SIM_BASE_RAW')) {
  console.error('실패: 치환이 적용되지 않음'); process.exit(1);
}
eval(patchedSrc.replace(/^function (\w+)/gm, 'global.SIM_$1=function'));

global.SIM_OPTS = null;       // null → 중립
global.SIM_BASE_RAW = false;  // false → 실제 앱 경로(클램프 적용 후)

// ── 3. 조건: 아키타입 강제 활성 + 채점 풀 ─────────────────────
const FLOOR = 20, ACT = 2, ENCOUNTER = 'normal', RELICS = [], DECK = [];
const NEUTRAL = { guard: false, corePriority: false, supportCoeff: 1 };
const STRENGTH = 1.0;

function forcedDa(arch) {
  return {
    detected: [{ arch, strength: STRENGTH, primaryCount: 0 }],
    tagCounts: {}, mechCounts: {}, total: 0, meaningfulCount: 0, isUndefined: false,
    hasTag: () => false, hasMech: () => false, tagCount: () => 0, mechCount: () => 0, unionCount: () => 0,
  };
}

function poolOf(char) {  // 캐릭터 카드 + 콜로리스 — getCard 우선순위(캐릭터 키 우선)로 중복 제거
  const pool = [];
  const seen = new Set();
  for (const [key, card] of Object.entries(DB.cards[char])) { pool.push(card); seen.add(key); }
  for (const [key, card] of Object.entries(DB.cards.colorless)) if (!seen.has(key)) pool.push(card);
  return pool;
}

const CHARS = ['ironclad', 'silent', 'defect', 'regent', 'necrobinder'];
const GRADE_ORD = { D: 1, C: 2, B: 3, A: 4, S: 5 };

function runScore(fn, cardId, char, arch, baseRaw) {
  global.SIM_BASE_RAW = baseRaw;
  const r = fn(cardId, char, forcedDa(arch), FLOOR, ACT, DECK, ENCOUNTER, RELICS);
  global.SIM_BASE_RAW = false;
  return r;
}

// ── 4. 기준선 검산 — 중립 SIM_scoreCard vs 실제 scoreCard 전수 비교 ──
let verifiedPairs = 0;
const mismatches = [];
global.SIM_OPTS = NEUTRAL;
for (const char of CHARS) {
  const pool = poolOf(char);
  for (const arch of DB.archetypes[char]) {
    for (const card of pool) {
      const real = scoreCard(card.id, char, forcedDa(arch), FLOOR, ACT, DECK, ENCOUNTER, RELICS);
      const sim = SIM_scoreCard(card.id, char, forcedDa(arch), FLOOR, ACT, DECK, ENCOUNTER, RELICS);
      verifiedPairs++;
      if (real.finalScore !== sim.finalScore || real.finalGrade !== sim.finalGrade) {
        mismatches.push({ char, arch: arch.id, card: card.id, real: real.finalScore, sim: sim.finalScore });
      }
    }
  }
}
if (mismatches.length > 0) {
  console.error(`✗ 기준선 검산 실패: ${verifiedPairs}쌍 중 ${mismatches.length}건 불일치. 변형 시뮬레이션 중단 — 결과 무효.`);
  for (const m of mismatches.slice(0, 20)) console.error(`  ${m.char}/${m.arch} ${m.card}: 실제 ${m.real} vs 스크립트 ${m.sim}`);
  process.exit(1);
}
console.log(`✓ 기준선 검산 통과: ${verifiedPairs}쌍 전체 일치 (finalScore === , finalGrade ===)`);

// ── 5. 모순 쌍 재산출 (조사 C 4번 정의 그대로) ────────────────
const contradictions = [];   // {char, arch, card, kind}
for (const char of CHARS) {
  const pool = poolOf(char);
  for (const arch of DB.archetypes[char]) {
    for (const card of pool) {
      const dup = new Set((card.syn || []).filter(t => (card.anti || []).includes(t)));
      const p = __simPickPaths(card, arch, dup, NEUTRAL);
      if (p.synTag === null || p.antiTag === null) continue;
      const synCore = (card.syn || []).some(t => !dup.has(t) && (arch.core.includes(t) || arch.id === t));
      const antiCore = (card.anti || []).some(t => !dup.has(t) && arch.core.includes(t));
      const kind = synCore && antiCore ? '양쪽core' : synCore ? '부패형' : antiCore ? '역방향' : '양쪽support';
      contradictions.push({ char, arch, card, kind });
    }
  }
}
const uniqueContraCards = new Set(contradictions.map(c => c.card.id)).size;
const kindCount = k => contradictions.filter(c => c.kind === k).length;
console.log(`모순 재산출: ${contradictions.length}건 (고유 카드 ${uniqueContraCards}장) — 부패형 ${kindCount('부패형')} / 역방향 ${kindCount('역방향')} / 양쪽core ${kindCount('양쪽core')} / 양쪽support ${kindCount('양쪽support')}`);

// ── 6. 5케이스 실행 ───────────────────────────────────────────
const CASES = [
  { id: '①', label: '① 로직 가드', opts: { guard: true, corePriority: false, supportCoeff: 1 } },
  { id: '②', label: '② core 우선', opts: { guard: false, corePriority: true, supportCoeff: 1 } },
  { id: '③a', label: '③ support 계수 0.5', opts: { guard: false, corePriority: false, supportCoeff: 0.5 } },
  { id: '③b', label: '③ support 계수 0.33', opts: { guard: false, corePriority: false, supportCoeff: 0.33 } },
  { id: '③c', label: '③ support 계수 0.25', opts: { guard: false, corePriority: false, supportCoeff: 0.25 } },
];

// 기준선(중립) 점수 — 클램프 후(앱 경로)·클램프 전(블렌드 원값) 두 파이프라인
const baseline = new Map();   // key → {clamped:{score,grade}, raw:{score,grade}}
const pairList = [];          // {char, arch, card, key}
global.SIM_OPTS = NEUTRAL;
for (const char of CHARS) {
  const pool = poolOf(char);
  for (const arch of DB.archetypes[char]) {
    for (const card of pool) {
      const key = `${char}|${arch.id}|${card.id}`;
      const c = runScore(SIM_scoreCard, card.id, char, arch, false);
      const r = runScore(SIM_scoreCard, card.id, char, arch, true);
      baseline.set(key, { clamped: { score: c.finalScore, grade: c.finalGrade }, raw: { score: r.finalScore, grade: r.finalGrade } });
      pairList.push({ char, arch, card, key });
    }
  }
}

const EPS = 1e-9;
const results = [];
for (const cs of CASES) {
  global.SIM_OPTS = cs.opts;
  const perPair = new Map();
  for (const p of pairList) {
    const c = runScore(SIM_scoreCard, p.card.id, p.char, p.arch, false);
    const r = runScore(SIM_scoreCard, p.card.id, p.char, p.arch, true);
    perPair.set(p.key, { clamped: { score: c.finalScore, grade: c.finalGrade }, raw: { score: r.finalScore, grade: r.finalGrade } });
  }
  // A. 모순 해소
  const outcomes = { 유지: 0, 가점만: 0, 감점만: 0, 소멸: 0 };
  const corr7 = [];
  for (const ct of contradictions) {
    const dup = new Set((ct.card.syn || []).filter(t => (ct.card.anti || []).includes(t)));
    const p = __simPickPaths(ct.card, ct.arch, dup, cs.opts);
    const synOn = !p.drop && p.synTag !== null;
    const antiOn = !p.drop && p.antiTag !== null;
    const oc = synOn && antiOn ? '유지' : synOn ? '가점만' : antiOn ? '감점만' : '소멸';
    outcomes[oc]++;
    if (ct.kind === '부패형') {
      const key = `${ct.char}|${ct.arch.id}|${ct.card.id}`;
      corr7.push({ card: ct.card.id, arch: `${ct.char}/${ct.arch.id}`, oc, before: baseline.get(key).clamped, after: perPair.get(key).clamped });
    }
  }
  // B·C. 변화 규모·방향 (클램프 후 / 클램프 전)
  const stat = pipe => {
    let changed = 0, sumAbs = 0, maxAbs = 0, gradeChanged = 0, up = 0, down = 0;
    const changedCards = new Set(), gradeCards = new Set();
    const movers = [];
    for (const p of pairList) {
      const b = baseline.get(p.key)[pipe], v = perPair.get(p.key)[pipe];
      const d = v.score - b.score;
      if (Math.abs(d) > EPS) {
        changed++; sumAbs += Math.abs(d); changedCards.add(p.card.id);
        if (Math.abs(d) > maxAbs) maxAbs = Math.abs(d);
        movers.push({ card: p.card.id, arch: `${p.char}/${p.arch.id}`, b, v, d });
      }
      if (b.grade !== v.grade) {
        gradeChanged++; gradeCards.add(p.card.id);
        if (GRADE_ORD[v.grade] > GRADE_ORD[b.grade]) up++; else down++;
      }
    }
    movers.sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    return { changed, changedCards: changedCards.size, meanAbs: changed ? sumAbs / changed : 0, maxAbs, gradeChanged, gradeCards: gradeCards.size, up, down, top5: movers.slice(0, 5) };
  };
  results.push({ cs, outcomes, corr7, clamped: stat('clamped'), raw: stat('raw'), perPair });
}
global.SIM_OPTS = null;

// ── 7. 대표 카드 추적표 ───────────────────────────────────────
const TRACKED = [
  { card: 'Corruption', char: 'ironclad', archId: 'exhaust', note: '부패형 대표' },
  { card: 'Glow', char: 'regent', archId: 'forge', note: '역방향 대표 (regent/forge)' },
  { card: 'Lethality', char: 'necrobinder', archId: 'soul', note: '역방향 대표 (necrobinder/soul)' },
  { card: 'Demesne', char: 'necrobinder', archId: 'doom', note: '역방향 대표 (necrobinder/doom)' },
  { card: 'Seance', char: 'necrobinder', archId: 'soul', note: '역할 게이트 관찰용' },
  { card: 'Pagestorm', char: 'necrobinder', archId: 'soul', note: '역할 게이트 관찰용' },
  { card: 'Dirge', char: 'necrobinder', archId: 'doom', note: 'builds↔anti 모순 (doom 아키타입)' },
  { card: 'Dirge', char: 'necrobinder', archId: 'osty', note: 'builds↔anti 모순 (osty 아키타입)' },
];

// ── 8. 보고서 생성 ────────────────────────────────────────────
let commit = '(git 조회 실패)';
try { commit = execSync('git rev-parse --short HEAD', { cwd: PROJ }).toString().trim(); } catch (e) { /* 보고서에 실패 사실만 기록 */ }
const today = new Date().toISOString().slice(0, 10);
const f2 = n => n.toFixed(2);
const sg = x => `${f2(x.score)} (${x.grade})`;
const L = [];
L.push(`# 조사 C2 — C항목 처방 3안 시뮬레이션`);
L.push('');
L.push(`- 조사일자: ${today}`);
L.push(`- 기준 커밋: \`${commit}\` (main)`);
L.push(`- **기준선 검산: 통과 — ${verifiedPairs}쌍 전수 비교, 불일치 0건** (중립 매개변수의 시뮬레이션 함수 vs 실제 logic.js scoreCard, finalScore·finalGrade 완전 일치)`);
L.push(`- 성격: 숫자·사실 보고. 권고 없음. 앱 코드·데이터 무수정 (logic.js는 읽기·불러오기만).`);
L.push(`- 재실행: \`node tools/sim_c_options.js\` (네트워크 불필요, 이 문서를 재생성)`);
L.push('');
L.push(`## 조건`);
L.push('');
L.push(`- 아키타입 1개를 강제 활성(strength=1.0)한 합성 덱 분석 객체로 채점. 덱 랜덤성 배제 목적.`);
L.push(`- 빈 덱·유물 없음·floor=20·act=2(floorToAct(20)=2로 일관)·encounter='normal'. 이 조건에서`);
L.push(`  덱 태그 기반 제2 안티 경로(logic.js:211, unionCount≥2)·포화 감쇠(satMult)·콤보·유물·인챈트 층은 발동하지 않음.`);
L.push(`- 채점 풀 = 해당 캐릭터 카드 전체 + 콜로리스(getCard 우선순위로 중복 제거). 쌍 수 ${pairList.length}.`);
L.push(`- **클램프 적용 후** = 실제 앱 경로: 기본점수 \`cardBaseScoreVal\`(전문가 앵커 ±1.0 클램프 포함).`);
L.push(`  **클램프 적용 전** = 기본점수를 \`blendRawVal\`(클램프 없는 블렌드 원값)로 대체.`);
L.push(`  구조 사실: 전문가 앵커 클램프는 기본점수(3원 블렌드) 단계에 적용되고 syn/anti 가감은 그 뒤에`);
L.push(`  더해진다(logic.js:170→178). 따라서 앵커 클램프 자체는 syn/anti 변화량을 직접 흡수하지 않으며,`);
L.push(`  흡수는 최종 [0,6] 절사(logic.js:555)와 등급 경계 이산화에서 발생한다. [0,6] 절사는 두 파이프라인 공통.`);
L.push(`- 변형 구현 세부(①의 matchCount 미증가, ②의 coreHit 정의, ③의 core 우선 선택)는 스크립트 머리주석 참조.`);
L.push('');
L.push(`## 모순 쌍 재산출 (조사 C 4번 정의)`);
L.push('');
L.push(`- 재산출 결과: **${contradictions.length}건 (고유 카드 ${uniqueContraCards}장)** — 부패형 ${kindCount('부패형')} / 역방향 ${kindCount('역방향')} / 양쪽core ${kindCount('양쪽core')} / 양쪽support ${kindCount('양쪽support')}`);
L.push(`- 조사 C 보고서(52cad29) 수치: 111건 / 90장 / 부패형 7 / 역방향 104 — ${contradictions.length === 111 && uniqueContraCards === 90 && kindCount('부패형') === 7 && kindCount('역방향') === 104 ? '**일치**' : '**불일치 — 아래 수치는 재산출 기준**'}`);
const satPairs = contradictions.filter(ct => {
  const b = baseline.get(`${ct.char}|${ct.arch.id}|${ct.card.id}`).clamped.score;
  return b <= 0 || b >= 6;
});
if (satPairs.length > 0) {
  L.push(`- 절사 포화 쌍: ${contradictions.length}건 중 ${satPairs.length}건은 기준선 최종점수가 [0,6] 절사 경계에 있음`);
  L.push(`  (${satPairs.map(ct => `${ct.char}/${ct.arch.id} ${ct.card.id} ${f2(baseline.get(`${ct.char}|${ct.arch.id}|${ct.card.id}`).clamped.score)}`).join(' · ')}).`);
  L.push(`  이 쌍들은 변형의 점수 변화가 절사에 흡수되어 "점수 변화 쌍 수"에 잡히지 않을 수 있다`);
  L.push(`  (①·②의 점수 변화 쌍이 ${contradictions.length}이 아닌 이유).`);
}
L.push('');

for (const R of results) {
  L.push(`---`);
  L.push('');
  L.push(`## ${R.cs.label}`);
  L.push('');
  L.push(`### A. 모순 해소 (${contradictions.length}건 기준)`);
  L.push('');
  L.push(`| 결과 | 건수 |`);
  L.push(`|---|---|`);
  L.push(`| 해소 — 가점만 남음 | ${R.outcomes['가점만']} |`);
  L.push(`| 해소 — 감점만 남음 | ${R.outcomes['감점만']} |`);
  L.push(`| 해소 — 둘 다 소멸 | ${R.outcomes['소멸']} |`);
  L.push(`| 모순 유지 (둘 다 적용) | ${R.outcomes['유지']} |`);
  L.push(`| **해소 합계** | **${R.outcomes['가점만'] + R.outcomes['감점만'] + R.outcomes['소멸']}** |`);
  L.push('');
  L.push(`부패형 ${R.corr7.length}건 개별 결과 (점수·등급은 클램프 적용 후):`);
  L.push('');
  L.push(`| 카드 | 아키타입 | 결과 | 변경 전 | 변경 후 |`);
  L.push(`|---|---|---|---|---|`);
  for (const c of R.corr7) L.push(`| ${c.card} | ${c.arch} | ${c.oc === '유지' ? '모순 유지' : c.oc === '소멸' ? '둘 다 소멸' : c.oc + ' 남음'} | ${sg(c.before)} | ${sg(c.after)} |`);
  L.push('');
  L.push(`### B. 변화 규모`);
  L.push('');
  L.push(`| 지표 | 클램프 적용 후 | 클램프 적용 전 |`);
  L.push(`|---|---|---|`);
  L.push(`| 점수 변화 쌍 수 (전체 ${pairList.length}) | ${R.clamped.changed} | ${R.raw.changed} |`);
  L.push(`| 점수 변화 고유 카드 수 | ${R.clamped.changedCards} | ${R.raw.changedCards} |`);
  L.push(`| 변화량 평균 (변화 쌍의 \\|Δ\\|) | ${R.clamped.changed ? f2(R.clamped.meanAbs) : '—'} | ${R.raw.changed ? f2(R.raw.meanAbs) : '—'} |`);
  L.push(`| 변화량 최대 | ${f2(R.clamped.maxAbs)} | ${f2(R.raw.maxAbs)} |`);
  L.push(`| 등급 문자 변동 쌍 수 | ${R.clamped.gradeChanged} | ${R.raw.gradeChanged} |`);
  L.push(`| 등급 문자 변동 고유 카드 수 | ${R.clamped.gradeCards} | ${R.raw.gradeCards} |`);
  L.push('');
  L.push(`### C. 방향 분포 (클램프 적용 후 / 클램프 적용 전)`);
  L.push('');
  L.push(`| 방향 | 클램프 후 (쌍) | 클램프 전 (쌍) |`);
  L.push(`|---|---|---|`);
  L.push(`| 등급 상승 | ${R.clamped.up} | ${R.raw.up} |`);
  L.push(`| 등급 하락 | ${R.clamped.down} | ${R.raw.down} |`);
  L.push('');
  L.push(`가장 크게 움직인 쌍 상위 5 (클램프 적용 후, \\|Δ점수\\| 기준):`);
  L.push('');
  L.push(`| 카드 | 아키타입 | 변경 전 | 변경 후 | Δ |`);
  L.push(`|---|---|---|---|---|`);
  for (const m of R.clamped.top5) L.push(`| ${m.card} | ${m.arch} | ${sg(m.b)} | ${sg(m.v)} | ${m.d >= 0 ? '+' : ''}${f2(m.d)} |`);
  if (R.clamped.top5.length === 0) L.push(`| (변화 없음) | | | | |`);
  L.push('');
}

L.push(`---`);
L.push('');
L.push(`## D. 대표 카드 추적표 (클램프 적용 후, 점수 (등급))`);
L.push('');
L.push(`| 카드 | 아키타입 | 비고 | 기준선 | ${CASES.map(c => c.label).join(' | ')} |`);
L.push(`|---|---|---|---|${CASES.map(() => '---').join('|')}|`);
for (const t of TRACKED) {
  const key = `${t.char}|${t.archId}|${t.card}`;
  if (!baseline.has(key)) { L.push(`| ${t.card} | ${t.char}/${t.archId} | ${t.note} | 산출 불가 — 쌍 없음 | ${CASES.map(() => '—').join(' | ')} |`); continue; }
  const cells = results.map(R => sg(R.perPair.get(key).clamped));
  L.push(`| ${t.card} | ${t.char}/${t.archId} | ${t.note} | ${sg(baseline.get(key).clamped)} | ${cells.join(' | ')} |`);
}
L.push('');
L.push(`Dirge builds↔anti 모순의 표시 방식 (사실 기록): Dirge는 builds=[soul,osty] / anti=[doom,osty].`);
L.push(`anti의 아키타입 경로 판정(logic.js:203)은 core·support 태그만 보고 아키타입 id는 보지 않으므로,`);
L.push(`anti의 'osty'는 osty 아키타입(core=summon·osty_buff·osty_attack)에 걸리지 않는다. 즉 osty 아키타입에서`);
L.push(`Dirge의 builds↔anti 모순은 이번 시뮬레이션 대상 경로(syn/anti 태그 루프)에는 나타나지 않고,`);
L.push(`빌드 핵심 보너스(builds 경로)와 실제 덱의 unionCount 제2 경로에서만 발현될 수 있다.`);
L.push(`doom 아키타입에서는 syn scaling(support) ↔ anti doom(core)의 역방향 모순으로 잡힌다(위 표).`);
L.push('');
L.push(`---`);
L.push('');
L.push(`## 종합 비교표`);
L.push('');
L.push(`클램프 흡수량 = (등급 변동 쌍 수, 클램프 적용 전) − (등급 변동 쌍 수, 클램프 적용 후).`);
L.push('');
L.push(`| 케이스 | 모순 해소 건수 (/${contradictions.length}) | 등급 변동 카드 수 (클램프 후, 쌍/고유) | 등급 상승 (쌍) | 등급 하락 (쌍) | 클램프 흡수량 |`);
L.push(`|---|---|---|---|---|---|`);
for (const R of results) {
  const resolved = R.outcomes['가점만'] + R.outcomes['감점만'] + R.outcomes['소멸'];
  L.push(`| ${R.cs.label} | ${resolved} | ${R.clamped.gradeChanged} / ${R.clamped.gradeCards} | ${R.clamped.up} | ${R.clamped.down} | ${R.raw.gradeChanged - R.clamped.gradeChanged} |`);
}
L.push('');

const outPath = path.join(PROJ, 'docs', '조사_C2_처방시뮬레이션.md');
fs.writeFileSync(outPath, L.join('\n'));
console.log(`보고서 생성: ${outPath}`);
for (const R of results) {
  const resolved = R.outcomes['가점만'] + R.outcomes['감점만'] + R.outcomes['소멸'];
  console.log(`${R.cs.label}: 해소 ${resolved}/${contradictions.length} (가점만 ${R.outcomes['가점만']}·감점만 ${R.outcomes['감점만']}·소멸 ${R.outcomes['소멸']}) · 점수변화 ${R.clamped.changed}쌍 · 등급변동 ${R.clamped.gradeChanged}쌍(↑${R.clamped.up}/↓${R.clamped.down}) · 흡수 ${R.raw.gradeChanged - R.clamped.gradeChanged}`);
}
