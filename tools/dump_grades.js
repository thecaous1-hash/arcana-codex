// ============================================================
//  dump_grades.js — 기준선 대비 등급 변동 검수 자료 (조사 전용, 앱 코드 무수정)
//  ------------------------------------------------------------
//  두 커밋(예: 8/29 검수 통과 시점 fe76e06 ↔ 현재 main)의 실제 scoreCard 결과를
//  (캐릭터 × 아키타입 × 카드) 쌍 단위로 그대로 뽑아 저장하고, 두 결과를 비교해
//  **등급 문자가 달라진 쌍만** 사람 판정(O/X)용 표로 만든다. 판단·권고 없음.
//
//  용법:
//   (1) 덤프  node tools/dump_grades.js <저장소루트> <출력json>
//         - 환경변수 FLOOR·ACT 로 층 조건 변경 가능 (기본 FLOOR=20, ACT=2)
//         - 저장소루트는 git worktree 등 다른 커밋의 체크아웃 경로여도 됨.
//           (그 경로의 db.js·data·logic.js·index.html 을 읽는다. 이 스크립트 파일
//            자체는 어느 경로에 있어도 무관.)
//         - 출력: { "char|archId|cardId": { s: 점수, g: 등급, syn: [근거…], anti: [근거…] }, … }
//   (2) 보고  node tools/dump_grades.js --report <저장소루트> <이전json> <현재json> <출력md>
//         - 등급이 달라진 쌍만 추려 카드당 한 줄 표를 만든다.
//         - 카드명은 게임 공식 한글명(<저장소루트>/data/loc_ko.js 의 KO_OFF) + 데이터 id.
//         - 정렬: ① S·A 하락 → ② 그 외 하락 → ③ 상승.
//
//  조건 (sim_c_options.js 와 동일):
//   - 로드 순서: db.js → data/extra_cards.js → data/api_data.js → logic.js
//                → index.html 의 '// DELTA 원점수' ~ '// 표시 이름은 API' 산식 블록
//   - 실제 scoreCard 를 그대로 호출 (소스 치환·패치 없음)
//   - 아키타입 1개 강제 활성(strength=1.0), 빈 덱, 유물 없음,
//     floor=20 · act=2 · encounter='normal'
//   - 풀 = 캐릭터 카드 전체 + 콜로리스(getCard 우선순위: 캐릭터 키 우선으로 중복 제거)
//   - 5캐릭터: ironclad, silent, defect, regent, necrobinder
//
//  근거 문구의 한글화: sim_c_options.js 는 koArch/koTag 를 항등 함수로 두지만
//  이 스크립트는 근거 문구를 사람이 읽어야 하므로, 채점 직전에 i18n.js 의
//  KO_ARCH/KO_TAG/KO_BUILD 사전으로 koArch/koTag/koBuild 를 바꿔 끼운다. 이 세 함수는 문자열만
//  만들고 점수 계산에는 쓰이지 않는다 — 항등 함수로 한 번 더 채점해 점수·등급이
//  전수 일치하는지 검산하고, 1건이라도 다르면 즉시 중단한다.
// ============================================================
'use strict';
const fs = require('fs');
const path = require('path');

const CHARS = ['ironclad', 'silent', 'defect', 'regent', 'necrobinder'];
const GRADE_ORD = { D: 1, C: 2, B: 3, A: 4, S: 5 };

// ── 덤프 ─────────────────────────────────────────────────────
function dump(root, outJson) {
  const FLOOR = Number(process.env.FLOOR || 20);
  const ACT = Number(process.env.ACT || 2);
  const ENCOUNTER = 'normal', RELICS = [], DECK = [], STRENGTH = 1.0;
  const read = f => fs.readFileSync(path.join(root, f), 'utf8');

  global.window = global;
  eval(read('db.js').replace('const DB', 'global.DB'));
  eval(read('data/extra_cards.js'));
  eval(read('data/api_data.js'));

  global.state = { char: 'ironclad', floor: FLOOR, act: ACT, encounter: ENCOUNTER, deck: [], relics: [], offeredByMode: { reward: [], shop: [] }, mode: 'reward', archFilter: 'current', asc: 'all' };
  global.API = window.API_DATA;
  global.canonEN = n => n;
  global.apiKey = n => (n || '').toUpperCase().replace(/[\s\-]/g, '_').replace(/[^A-Z0-9_]/g, '').replace(/_+/g, '_');
  global.koName = n => n; global.koTag = n => n; global.koArch = n => n; global.koBuild = n => n;

  eval(read('logic.js')
    .replace('const GRADE_VALS', 'global.GRADE_VALS')
    .replace('const SCORE_GRADE ', 'global.SCORE_GRADE ')
    .replace('const SCORE_GRADE_SD', 'global.SCORE_GRADE_SD')
    .replace(/^function (\w+)/gm, 'global.$1=function'));

  const html = read('index.html');
  const s0 = html.indexOf('// DELTA 원점수');
  const s1 = html.indexOf('// 표시 이름은 API');
  if (s0 < 0 || s1 <= s0) { console.error('실패: index.html 산식 블록을 찾지 못함'); process.exit(1); }
  eval(html.slice(s0, s1)
    .replace(/^const BLEND/gm, 'global.BLEND')
    .replace(/^function (\w+)/gm, 'global.$1=function'));

  function forcedDa(arch) {
    return {
      detected: [{ arch, strength: STRENGTH, primaryCount: 0 }],
      tagCounts: {}, mechCounts: {}, total: 0, meaningfulCount: 0, isUndefined: false,
      hasTag: () => false, hasMech: () => false, tagCount: () => 0, mechCount: () => 0, unionCount: () => 0,
    };
  }
  function poolOf(char) {
    const pool = [];
    const seen = new Set();
    for (const [key, card] of Object.entries(DB.cards[char])) { pool.push(card); seen.add(key); }
    for (const [key, card] of Object.entries(DB.cards.colorless)) if (!seen.has(key)) pool.push(card);
    return pool;
  }
  function scoreAll() {
    const out = {};
    for (const char of CHARS) {
      const pool = poolOf(char);
      for (const arch of DB.archetypes[char]) {
        for (const card of pool) {
          const r = scoreCard(card.id, char, forcedDa(arch), FLOOR, ACT, DECK, ENCOUNTER, RELICS);
          out[`${char}|${arch.id}|${card.id}`] = { s: r.finalScore, g: r.finalGrade, syn: r.synReasons.slice(), anti: r.antiReasons.slice() };
        }
      }
    }
    return out;
  }

  // 1차: 항등 koArch/koTag (sim_c_options.js 와 완전히 같은 상태)
  const plain = scoreAll();

  // 2차: i18n.js 사전으로 문구만 한글화 — 점수·등급 전수 일치 검산
  let result = plain;
  const i18nPath = path.join(root, 'i18n.js');
  if (fs.existsSync(i18nPath)) {
    const src = fs.readFileSync(i18nPath, 'utf8');
    const grab = name => { const m = src.match(new RegExp(`^const ${name} = \\{[\\s\\S]*?^\\};`, 'm')); return m ? eval(`(${m[0].slice(`const ${name} = `.length, -1)})`) : null; };
    const KO_ARCH = grab('KO_ARCH'), KO_TAG = grab('KO_TAG'), KO_BUILD = grab('KO_BUILD');
    if (KO_ARCH && KO_TAG && KO_BUILD) {
      global.koArch = en => (en != null && KO_ARCH[en]) ? KO_ARCH[en] : en;
      global.koTag = t => (t != null && KO_TAG[t]) ? KO_TAG[t] : t;
      global.koBuild = id => (id != null && KO_BUILD[id]) ? KO_BUILD[id] : id;
      const ko = scoreAll();
      let bad = 0;
      for (const k of Object.keys(plain)) if (plain[k].s !== ko[k].s || plain[k].g !== ko[k].g) bad++;
      if (bad > 0) { console.error(`실패: 한글화 후 점수 불일치 ${bad}건 — 결과 무효`); process.exit(1); }
      result = ko;
    }
  }

  fs.writeFileSync(outJson, JSON.stringify(result));
  const n = Object.keys(result).length;
  console.log(`덤프 완료: ${n}쌍 → ${outJson} (root=${root}, FLOOR=${FLOOR}, ACT=${ACT})`);
}

// ── 보고 ─────────────────────────────────────────────────────
function report(root, beforeJson, afterJson, outMd) {
  const before = JSON.parse(fs.readFileSync(beforeJson, 'utf8'));
  const after = JSON.parse(fs.readFileSync(afterJson, 'utf8'));
  global.window = global;
  eval(fs.readFileSync(path.join(root, 'data/loc_ko.js'), 'utf8'));
  const KO_OFF = window.KO_OFF || {};
  const koCard = id => (KO_OFF[id] && KO_OFF[id].t) ? `${KO_OFF[id].t} (${id})` : `${id} (공식 한글명 없음)`;

  const keysB = Object.keys(before), keysA = Object.keys(after);
  const onlyB = keysB.filter(k => !(k in after)), onlyA = keysA.filter(k => !(k in before));
  const common = keysB.filter(k => k in after);

  const EPS = 1e-9;
  let scoreChanged = 0;
  const changed = [];   // 등급 변동 쌍
  for (const k of common) {
    const b = before[k], a = after[k];
    if (Math.abs(a.s - b.s) > EPS) scoreChanged++;
    if (a.g !== b.g) {
      const [char, arch, card] = k.split('|');
      const up = GRADE_ORD[a.g] > GRADE_ORD[b.g];
      changed.push({ key: k, char, arch, card, b, a, up, saDown: !up && (b.g === 'S' || b.g === 'A') });
    }
  }
  const downs = changed.filter(c => !c.up), ups = changed.filter(c => c.up);
  const saDowns = changed.filter(c => c.saDown);
  const uniq = arr => new Set(arr.map(c => c.card)).size;
  const perChar = {};
  for (const c of changed) perChar[c.char] = (perChar[c.char] || 0) + 1;

  const stats = {
    pairsBefore: keysB.length, pairsAfter: keysA.length, common: common.length, onlyBefore: onlyB.length, onlyAfter: onlyA.length,
    scoreChanged, gradeChanged: changed.length, gradeCards: uniq(changed), down: downs.length, up: ups.length,
    saDown: saDowns.length, saDownCards: uniq(saDowns), perChar,
  };
  console.log(JSON.stringify(stats, null, 1));

  // 카드당 한 줄로 묶기
  const byCard = new Map();
  for (const c of changed) {
    if (!byCard.has(c.card)) byCard.set(c.card, []);
    byCard.get(c.card).push(c);
  }
  const rows = [];
  for (const [card, list] of byCard) {
    list.sort((x, y) => CHARS.indexOf(x.char) - CHARS.indexOf(y.char) || x.arch.localeCompare(y.arch));
    const cat = list.some(c => c.saDown) ? 1 : list.some(c => !c.up) ? 2 : 3;
    const chars = [...new Set(list.map(c => c.char))];
    rows.push({ card, list, cat, chars, firstChar: CHARS.indexOf(list[0].char) });
  }
  rows.sort((x, y) => x.cat - y.cat || x.firstChar - y.firstChar || koCard(x.card).localeCompare(koCard(y.card), 'ko'));

  const f2 = n => n.toFixed(2);
  const sd = d => `${d >= 0 ? '+' : '−'}${f2(Math.abs(d))}`;
  const esc = s => String(s).replace(/\|/g, '\\|');
  const multi = list => list.length > 1;
  const pre = (c, list) => multi(list) ? `${c.char}/${c.arch}: ` : '';
  const reasonsOf = c => {
    const r = [...c.a.syn, ...c.a.anti];
    return r.length ? r.map(esc).join(' · ') : '(발화한 가감점 없음 — 기본점수만)';
  };
  const CAT_TITLE = { 1: '① S·A 하락', 2: '② 그 외 하락', 3: '③ 상승' };

  const L = [];
  const today = new Date().toISOString().slice(0, 10);
  L.push(`# 등급 검수 — fe76e06(2026-08-29 검수 통과) 대비 등급 변동`);
  L.push('');
  L.push(`- 작성일: ${today}`);
  L.push(`- 기준선: fe76e06 (2026-08-29 사용자 검수 통과 시점) ↔ 현재 main`);
  L.push(`- 성격: 사람 판정(O/X)용 자료. 판단·권고 없음. 앱 코드·데이터 무수정.`);
  L.push(`- 재생성: \`node tools/dump_grades.js <루트> <json>\` 을 두 체크아웃에서 각각 실행한 뒤`);
  L.push(`  \`node tools/dump_grades.js --report <루트> <이전json> <현재json> <이md>\``);
  L.push('');
  L.push(`## 조건 (8/29 검수 · sim_c_options.js 와 동일)`);
  L.push('');
  L.push(`- 아키타입 1개 강제 활성(strength 1.0) · 빈 덱 · 유물 없음 · floor 20 / act 2 · encounter normal`);
  L.push(`- 풀 = 캐릭터 카드 전체 + 콜로리스(getCard 우선순위로 중복 제거), 5캐릭터`);
  L.push(`- 실제 logic.js scoreCard 를 그대로 호출 (치환·패치 없음)`);
  L.push(`- 등급 경계(SCORE_GRADE_SD): S ≥ 4.3 · A ≥ 3.4 · B ≥ 2.5 · C ≥ 1.5 · 그 외 D`);
  L.push('');
  L.push(`## 규모`);
  L.push('');
  L.push(`| 항목 | 값 |`);
  L.push(`|---|---|`);
  L.push(`| 전체 쌍 (카드×아키타입) | ${common.length}${onlyB.length || onlyA.length ? ` (기준선만 ${onlyB.length} · 현재만 ${onlyA.length} 제외)` : ''} |`);
  L.push(`| 점수 변동 쌍 | ${scoreChanged} |`);
  L.push(`| 등급 변동 쌍 / 고유 카드 | ${changed.length} / ${uniq(changed)} |`);
  L.push(`| 하락 / 상승 (쌍) | ${downs.length} / ${ups.length} |`);
  L.push(`| S·A 하락 쌍 / 고유 카드 | ${saDowns.length} / ${uniq(saDowns)} |`);
  L.push(`| 캐릭터별 변동 쌍 | ${CHARS.map(c => `${c} ${perChar[c] || 0}`).join(' · ')} |`);
  L.push('');
  L.push(`## 판정표`);
  L.push('');
  L.push(`- **카드당 한 줄.** 같은 카드가 여러 아키타입에서 바뀐 경우 \`캐릭터/아키타입: \` 접두로 한 셀에 묶음.`);
  L.push(`- 카드명 = 게임 공식 한글명(data/loc_ko.js KO_OFF) + 괄호에 데이터 id.`);
  L.push(`- 근거 = 현재 등급을 만든 가점·감점 문구 (logic.js 가 만든 문자열 그대로, 발화 순서대로).`);
  L.push(`- 정렬: ① S·A 하락 → ② 그 외 하락 → ③ 상승. 각 묶음 안은 캐릭터 순(ironclad·silent·defect·regent·necrobinder) → 한글명 순.`);
  L.push(`- 등급 칸의 ▼ = 하락, ▲ = 상승. ①·② 묶음의 카드가 다른 아키타입에서 상승한 쌍도 같은 줄에 함께 적음.`);
  L.push(`- 판정 칸: O = 현재 등급이 맞다 / X = 틀리다 (사용자 기입)`);
  L.push('');
  let lastCat = 0;
  for (const r of rows) {
    if (r.cat !== lastCat) {
      lastCat = r.cat;
      const n = rows.filter(x => x.cat === r.cat);
      const pairs = n.reduce((s, x) => s + x.list.length, 0);
      const own = n.reduce((s, x) => s + x.list.filter(c => r.cat === 1 ? c.saDown : r.cat === 2 ? !c.up : c.up).length, 0);
      L.push(`### ${CAT_TITLE[r.cat]} — ${n.length}장 (${CAT_TITLE[r.cat].slice(2)} ${own}쌍${pairs > own ? `, 같은 카드의 다른 방향 변동 ${pairs - own}쌍 포함 ${pairs}쌍` : ''})`);
      L.push('');
      L.push(`| # | 카드명 | 캐릭터 | 아키타입(변동분) | 이전 등급 → 현재 등급 | 점수차 | 현재 등급 근거 | 판정(O/X) |`);
      L.push(`|---|---|---|---|---|---|---|---|`);
    }
    const idx = rows.indexOf(r) + 1;
    const archCell = r.list.map(c => `${c.char}/${c.arch}`).join('<br>');
    const gradeCell = r.list.map(c => `${pre(c, r.list)}${c.up ? '▲' : '▼'} ${c.b.g} → ${c.a.g}`).join('<br>');
    const diffCell = r.list.map(c => `${pre(c, r.list)}${f2(c.b.s)} → ${f2(c.a.s)} (${sd(c.a.s - c.b.s)})`).join('<br>');
    const reasonCell = r.list.map(c => `${pre(c, r.list)}${reasonsOf(c)}`).join('<br>');
    L.push(`| ${idx} | ${esc(koCard(r.card))} | ${r.chars.join('·')} | ${archCell} | ${gradeCell} | ${diffCell} | ${reasonCell} |  |`);
    if (rows[idx] && rows[idx].cat !== r.cat) L.push('');
  }
  L.push('');
  fs.writeFileSync(outMd, L.join('\n'));
  console.log(`보고서 생성: ${outMd} (${rows.length}행)`);
}

// ── 진입 ─────────────────────────────────────────────────────
const argv = process.argv.slice(2);
if (argv[0] === '--report') {
  if (argv.length !== 5) { console.error('용법: node tools/dump_grades.js --report <저장소루트> <이전json> <현재json> <출력md>'); process.exit(1); }
  report(path.resolve(argv[1]), path.resolve(argv[2]), path.resolve(argv[3]), path.resolve(argv[4]));
} else {
  if (argv.length !== 2) { console.error('용법: node tools/dump_grades.js <저장소루트> <출력json>  (환경변수 FLOOR·ACT)'); process.exit(1); }
  dump(path.resolve(argv[0]), path.resolve(argv[1]));
}
