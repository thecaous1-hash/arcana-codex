// ============================================================
//  [역할: 주력(1차 소스)] 이 프로젝트의 기본 데이터 경로. (tools/README.md 참고)
//  ------------------------------------------------------------
//  build_from_api.js — spire-codex 공개 API를 스냅샷해 data/api_data.js 생성.
//  (설계 "데이터 층 확정 2026-07-05": spire-codex 1차 소스)
//  담는 것:
//   - cards: 한국어 이름·설명(수치완성)·강화설명 + 타입/희귀도/캐릭터/X코스트
//   - tier : Codex Score(runs/scores/cards, Bayesian 보정)
//   - stats: 캐릭터별 카드 승률 DELTA(넣었을 때 − 뺐을 때) ← 추천 기본점수
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
    const all = await getJSONSoft(`${BASE}/runs/stats?character=${param}`);
    if (all) stats[id] = statsFrom(all); else missingStats.push(`${id}(전체)`);
    await sleep(400);
    console.log(`· 통계 ${param} (승천 ${MAX_ASC}) 받는 중…`);
    const hi = await getJSONSoft(`${BASE}/runs/stats?character=${param}&ascension=${MAX_ASC}`);
    if (hi) statsHi[id] = statsFrom(hi); else missingStats.push(`${id}(A${MAX_ASC})`);
    await sleep(400);
    console.log(`  ${id}: 전체 ${stats[id] ? `base ${stats[id].base_wr}% (${stats[id].total_runs}런)` : '누락'} · A${MAX_ASC} ${statsHi[id] ? `base ${statsHi[id].base_wr}% (${statsHi[id].total_runs}런)` : '누락'}`);
  }

  // 4) 버전 스탬프 (최신 런 build_id)
  try {
    const runs = await getJSON(`${BASE}/runs/list?limit=20`);
    const arr = Array.isArray(runs) ? runs : (runs.runs || runs.data || runs.results || []);
    const vc = {}; arr.forEach(x => { if (x.build_id) vc[x.build_id] = (vc[x.build_id] || 0) + 1; });
    stampVersion = Object.entries(vc).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  } catch (e) {}

  const out = { source: 'spire-codex.com/api', version: stampVersion, maxAsc: MAX_ASC, cards, relics, enchants, tier, stats, statsHi };
  const js = '// spire-codex API 스냅샷(개인용). tools/build_from_api.js 생성 · 갱신은 재실행.\n'
    + `// 소스: ${out.source} · 게임 ${stampVersion || '?'}\n`
    + 'window.API_DATA = ' + JSON.stringify(out) + ';\n';
  fs.mkdirSync(path.join(PROJ, 'data'), { recursive: true });
  fs.writeFileSync(path.join(PROJ, 'data', 'api_data.js'), js);
  const kb = (fs.statSync(path.join(PROJ, 'data', 'api_data.js')).size / 1024).toFixed(0);
  console.log(`\n✓ data/api_data.js 생성: ${kb}KB · 게임 ${stampVersion} · 카드 ${Object.keys(cards).length} · 유물 ${Object.keys(relics).length} · 인챈트 ${enchants ? Object.keys(enchants).length : 0} · 티어 ${Object.keys(tier).length} · 통계(전체+A${MAX_ASC}) ${Object.keys(stats).length}캐릭`);
  if (missingStats.length) console.warn(`⚠ 통계 누락 ${missingStats.length}건: ${missingStats.join(', ')} — 앱은 해당 캐릭터를 Codex+전문가 블렌드로 폴백합니다. 재실행하면 다시 시도합니다.`);
  else console.log(`통계 누락 없음 (${Object.keys(CHARS).length * 2}/${Object.keys(CHARS).length * 2})`);
})().catch(e => { console.error('실패:', e.message); process.exit(1); });
