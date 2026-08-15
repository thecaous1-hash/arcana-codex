// ============================================================
//  [역할: 주력(1차 소스)] 이 프로젝트의 기본 데이터 경로. (tools/README.md 참고)
//  ------------------------------------------------------------
//  build_from_api.js — spire-codex 공개 API를 스냅샷해 data/api_data.js 생성.
//  (설계 "데이터 층 확정 2026-07-05": spire-codex 1차 소스)
//  담는 것:
//   - cards: 한국어 이름·설명(수치완성)·강화설명 + 타입/희귀도/캐릭터/X코스트
//   - tier : Codex Score(runs/scores/cards, Bayesian 보정)
//   - stats: 캐릭터별 카드 승률 DELTA(넣었을 때 − 뺐을 때) ← 추천 기본점수
//  수신 실패 항목은 기존 data/api_data.js의 값을 물려받아 유지(빈 값으로 덮어쓰지 않음).
//   → 물려받은 항목은 out.inherited에 "경로: 이전 스냅샷 생성일"로 기록.
//  용법: node tools/build_from_api.js   (Node 18+ 전역 fetch 사용)
//  새 패치/통계 갱신: 다시 실행. file:// 더블클릭 유지를 위해 스냅샷 방식.
// ============================================================
const fs = require('fs'), path = require('path');
const PROJ = path.join(__dirname, '..');
const BASE = 'https://spire-codex.com/api';
const CHARS = { IronClad:'ironclad', Silent:'silent', Defect:'defect', Regent:'regent', Necrobinder:'necrobinder' };
const MAX_ASC = 10;                 // STS2 최고 승천(전체 스냅샷 외에 최고난도 밴드도 저장)
const r1 = n => Math.round(n * 10) / 10;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getJSON(url, tries = 4, timeoutMs = 25000) {
  for (let i = 0; i < tries; i++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);   // 기본 25초(핵심 데이터), 넘으면 중단 후 재시도(무한대기 방지)
    try {
      const res = await fetch(url, { headers: { 'Accept-Encoding': 'gzip' }, signal: ac.signal });
      if (!res.ok) throw new Error(`${res.status}`);
      return await res.json();
    } catch (e) { if (i === tries - 1) throw new Error(`${e.message} ${url}`);
      console.warn(`  재시도 ${i + 1}/${tries - 1} (${e.message})…`); await sleep(1500 * (i + 1)); }
    finally { clearTimeout(timer); }
  }
}
// 통계(/runs/*) 전용 관대 래퍼 — 타임아웃 60초로 연장, 재시도 소진 시 중단 대신 null 반환.
// (카드·유물·티어 등 핵심 데이터는 getJSON 그대로: 25초·실패 시 전체 중단 유지)
async function getJSONSoft(url, tries = 4, timeoutMs = 60000) {
  try { return await getJSON(url, tries, timeoutMs); }
  catch (e) { console.warn(`  ⚠ 누락 처리(계속 진행): ${e.message}`); return null; }
}
// 이전 스냅샷(data/api_data.js) 읽기 — 이번에 못 받은 항목을 물려받기 위한 폴백 소스.
// 파일이 없거나 파싱이 안 되면 null → 물려받기 없이 기존 동작 그대로.
function readPrevSnapshot() {
  const p = path.join(PROJ, 'data', 'api_data.js');
  if (!fs.existsSync(p)) return null;
  try {
    const src = fs.readFileSync(p, 'utf8');
    const at = src.indexOf('window.API_DATA');
    const i = at < 0 ? -1 : src.indexOf('{', at);
    const j = src.lastIndexOf('}');
    if (i < 0 || j <= i) throw new Error('window.API_DATA 형태가 아님');
    const obj = JSON.parse(src.slice(i, j + 1));
    if (!obj || typeof obj !== 'object') throw new Error('객체가 아님');
    return obj;
  } catch (e) {
    console.warn(`  ⚠ 이전 스냅샷 파싱 실패(물려받기 없이 진행): ${e.message}`);
    return null;
  }
}
// 스냅샷 생성 날짜(YYYY-MM-DD). generatedAt이 없던 옛 스냅샷은 'unknown'.
function snapshotDate(snap) {
  const d = snap && typeof snap.generatedAt === 'string' ? snap.generatedAt.slice(0, 10) : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : 'unknown';
}

// runs/stats 응답 → {base_wr,total_runs,cards:{ID:{wr,delta,n}}} (승률 DELTA 계산)
function statsFrom(rs) {
  const T = rs.total_runs, W = rs.total_wins, baseWr = T ? r1(W / T * 100) : 0;
  const cards = {};
  for (const c of (rs.top_cards || [])) {
    const n = c.total_runs_with; if (!n || n < 30) continue;
    const wrWith = c.win_runs / n * 100, rWo = T - n, wWo = W - c.win_runs;
    const wrWo = rWo > 0 ? wWo / rWo * 100 : baseWr;
    cards[c.card_id] = { wr: r1(wrWith), delta: r1(wrWith - wrWo), n };
  }
  return { base_wr: baseWr, total_runs: T, cards };
}

(async () => {
  // 0) 이전 스냅샷 확보 — 이번에 못 받은 항목은 여기서 물려받는다(빈 값으로 덮어쓰지 않음).
  const prev = readPrevSnapshot();
  const prevDate = snapshotDate(prev);
  const inherited = {};   // out 기준 경로 → 물려받은 값이 만들어진 날짜
  console.log(prev ? `· 이전 스냅샷 확인 (생성 ${prevDate})` : '· 이전 스냅샷 없음 — 물려받기 없이 새로 생성');
  // 이번 수신값이 "쓸 수 없는 값"인지 판정 → 물려받기 사유. 쓸 수 있으면 null.
  //  · 응답 자체가 없음(504·타임아웃 등)         → 수신 실패
  //  · 200이지만 알맹이가 없음({} / 항목 0개)    → 빈 응답
  //  · 통계인데 total_runs가 0                   → 빈 응답(0런).
  //    이 스크립트는 원래 n<30 카드를 버리므로 0런 통계는 애초에 쓸 수 없는 데이터다.
  //    그걸 지키려고 기존 수만 런짜리 값을 버리는 건 손해라 실패로 본다.
  //    (신규 캐릭터가 진짜 0런이면 이전 값도 없으니 자연히 빈 상태로 남는다)
  const emptyReason = v => {
    if (v == null) return '수신 실패';
    if (typeof v === 'object') {
      if (Object.keys(v).length === 0) return '빈 응답';
      if ('total_runs' in v && !v.total_runs) return '빈 응답(0런)';
    }
    return null;
  };
  // 쓸 수 있는 값이면 그대로. 아니면 prev의 같은 경로 값을 물려받고 inherited에 기록.
  // 둘 다 없으면 null → 호출부에서 지금까지처럼 빈 값 취급.
  const keep = (keyPath, fresh, label) => {
    const why = emptyReason(fresh);
    if (!why) return fresh;
    const old = keyPath.split('.').reduce((o, k) => (o == null ? null : o[k]), prev);
    if (old == null) { console.warn(`⚠ ${label} ${why} → 물려받을 이전 값도 없음(빈 상태로 남김)`); return null; }
    inherited[keyPath] = prevDate;
    console.warn(`⚠ ${label} ${why} → 기존 값 물려받음 (${prevDate} 기준)`);
    return old;
  };

  // 1) 한국어 카드
  console.log('· 카드(한국어) 받는 중…');
  const cardsKo = await getJSON(`${BASE}/cards?lang=kor&channel=beta`);
  const cards = {};
  for (const c of cardsKo) {
    cards[c.id] = {
      name: c.name,
      ko: c.description || '',
      koUp: c.upgrade_description || '',
      type: c.type_key || '',
      rarity: c.rarity_key || '',
      color: c.color || '',
      xcost: !!c.is_x_cost,
      starcost: !!c.is_x_star_cost,
      img: c.image_url_card || null,          // CDN 절대 URL (로컬 아트 없을 때 폴백)
    };
  }
  console.log(`  카드 ${Object.keys(cards).length}장`);

  // 1b) 한국어 유물
  console.log('· 유물(한국어) 받는 중…');
  const relicsKo = await getJSON(`${BASE}/relics?lang=kor&channel=beta`);
  const relics = {};
  for (const r of relicsKo) {
    relics[r.id] = {
      name: r.name,
      ko: r.description || '',
      rarity: r.rarity_key || '',
      img: r.image_url ? ('https://spire-codex.com' + r.image_url) : null,
    };
  }
  console.log(`  유물 ${Object.keys(relics).length}개`);

  // 1c) 인챈트(한국어) — 22종. 이름·텍스트·타입제한·중복가능만 저장.
  //     이미지(image_url)는 /static/ 경로 = robots.txt Disallow → 사용하지 않음(1단계 정책).
  //     실패해도 나머지 스냅샷은 정상 생성(인챈트 기능만 앱에서 조용히 꺼짐).
  console.log('· 인챈트(한국어) 받는 중…');
  let enchants = null;
  try {
    const enchKo = await getJSON(`${BASE}/enchantments?lang=kor&channel=beta`);
    enchants = {};
    for (const e of enchKo) {
      enchants[e.id] = {
        name: e.name,
        ko: e.description || '',
        cardType: e.card_type || null,   // null = 카드 타입 제한 없음
        stackable: !!e.is_stackable,
      };
    }
    console.log(`  인챈트 ${Object.keys(enchants).length}종`);
  } catch (e) { console.warn('  인챈트 스킵(폴백):', e.message); }
  enchants = keep('enchants', enchants, '인챈트');

  // 1d) 베타 패치 변경 정보(beta/diff) — 신규/변경/삭제 카드 목록.
  //     구버전 통계 신호 조정용(신규=통계 없음, 성능 변경=DELTA 가중치 낮춤).
  //     실패해도 나머지 스냅샷은 정상 생성(betaDiff=null → 앱은 조정 없이 기존 동작).
  console.log('· 베타 패치 변경 정보(beta/diff) 받는 중…');
  let betaDiff = null;
  try {
    const diff = await getJSON(`${BASE}/beta/diff`);
    const cd = (diff.types && diff.types.cards) || {};
    betaDiff = {
      version: diff.beta_version || null,
      added: cd.added || [],
      changed: cd.changed || {},
      removed: cd.removed || [],
    };
    console.log(`  베타 ${betaDiff.version || '?'} · 신규 ${betaDiff.added.length}장 / 변경 ${Object.keys(betaDiff.changed).length}장 / 삭제 ${betaDiff.removed.length}장`);
  } catch (e) { console.warn('  베타 diff 스킵(폴백):', e.message); }
  betaDiff = keep('betaDiff', betaDiff, '베타 diff');

  // 2) Codex Score(티어)
  console.log('· Codex Score(scores/cards) 받는 중…');
  const scores = await getJSON(`${BASE}/runs/scores/cards`);
  const tier = {};
  for (const id in scores) {
    const s = scores[id];
    tier[id] = { score: s.score, elo: s.elo != null ? r1(s.elo) : null, wr: s.win_rate != null ? r1(s.win_rate) : null, picks: s.picks };
  }
  console.log(`  티어 ${Object.keys(tier).length}종`);

  // 3) 캐릭터별 승률 DELTA — 전체(stats) + 최고 승천(statsHi)
  const stats = {}, statsHi = {};
  const missingStats = [];
  let stampVersion = null;
  for (const [param, id] of Object.entries(CHARS)) {
    console.log(`· 통계 ${param} (전체) 받는 중…`);
    const allRaw = await getJSONSoft(`${BASE}/runs/stats?character=${param}`);
    const all = keep(`stats.${id}`, allRaw ? statsFrom(allRaw) : null, `${id}(전체)`);
    if (all) stats[id] = all; else missingStats.push(`${id}(전체)`);
    await sleep(400);
    console.log(`· 통계 ${param} (승천 ${MAX_ASC}) 받는 중…`);
    const hiRaw = await getJSONSoft(`${BASE}/runs/stats?character=${param}&ascension=${MAX_ASC}`);
    const hi = keep(`statsHi.${id}`, hiRaw ? statsFrom(hiRaw) : null, `${id}(A${MAX_ASC})`);
    if (hi) statsHi[id] = hi; else missingStats.push(`${id}(A${MAX_ASC})`);
    await sleep(400);
    const tag = k => inherited[k] ? ', 물려받음' : '';
    console.log(`  ${id}: 전체 ${stats[id] ? `base ${stats[id].base_wr}% (${stats[id].total_runs}런${tag(`stats.${id}`)})` : '누락'} · A${MAX_ASC} ${statsHi[id] ? `base ${statsHi[id].base_wr}% (${statsHi[id].total_runs}런${tag(`statsHi.${id}`)})` : '누락'}`);
  }

  // 4) 버전 스탬프 (최신 런 build_id)
  try {
    const runs = await getJSON(`${BASE}/runs/list?limit=20`);
    const arr = Array.isArray(runs) ? runs : (runs.runs || runs.data || runs.results || []);
    const vc = {}; arr.forEach(x => { if (x.build_id) vc[x.build_id] = (vc[x.build_id] || 0) + 1; });
    stampVersion = Object.entries(vc).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  } catch (e) {}
  // 버전은 앱이 읽지 않는 표시용 라벨이라 inherited에 남기지 않는다. null로 지워지는 것만 막는다.
  if (stampVersion == null && prev && prev.version) {
    stampVersion = prev.version;
    console.warn(`⚠ 게임 버전 스탬프 수신 실패 → 이전 값 유지 (${stampVersion})`);
  }

  const out = { source: 'spire-codex.com/api', generatedAt: new Date().toISOString(), version: stampVersion, maxAsc: MAX_ASC, cards, relics, enchants, betaDiff, tier, stats, statsHi, inherited };
  const js = '// spire-codex API 스냅샷(개인용). tools/build_from_api.js 생성 · 갱신은 재실행.\n'
    + `// 소스: ${out.source} · 게임 ${stampVersion || '?'} · 생성 ${out.generatedAt.slice(0, 10)}\n`
    + 'window.API_DATA = ' + JSON.stringify(out) + ';\n';
  fs.mkdirSync(path.join(PROJ, 'data'), { recursive: true });
  fs.writeFileSync(path.join(PROJ, 'data', 'api_data.js'), js);
  const kb = (fs.statSync(path.join(PROJ, 'data', 'api_data.js')).size / 1024).toFixed(0);
  // 요약 — 전체/A10을 따로 세고, 그중 몇 개가 물려받은 값인지까지 표시(실제 상태와 어긋나지 않게).
  const N = Object.keys(CHARS).length;
  const inhKeys = Object.keys(inherited);
  const inhAll = inhKeys.filter(k => k.startsWith('stats.')).length;
  const inhHi = inhKeys.filter(k => k.startsWith('statsHi.')).length;
  const band = (have, inh) => `${have}/${N}` + (inh ? ` (신규 ${have - inh}·물려받음 ${inh})` : '');
  console.log(`\n✓ data/api_data.js 생성: ${kb}KB · 게임 ${stampVersion || '?'} · 카드 ${Object.keys(cards).length} · 유물 ${Object.keys(relics).length} · 인챈트 ${enchants ? Object.keys(enchants).length : 0} · 티어 ${Object.keys(tier).length} · 통계 전체 ${band(Object.keys(stats).length, inhAll)} · A${MAX_ASC} ${band(Object.keys(statsHi).length, inhHi)}`);
  if (inhKeys.length) console.warn(`↺ 물려받은 항목 ${inhKeys.length}건(이전 값 유지, 새로 받지 못함): ${inhKeys.join(', ')} — 기준 ${prevDate}`);
  if (missingStats.length) console.warn(`⚠ 통계 빈 항목 ${missingStats.length}건(물려받을 이전 값도 없음): ${missingStats.join(', ')} — 앱은 해당 캐릭터를 Codex+전문가 블렌드로 폴백합니다. 재실행하면 다시 시도합니다.`);
  else console.log(`통계 빈 항목 없음 (${N * 2}/${N * 2})`);
})().catch(e => { console.error('실패:', e.message); process.exit(1); });
