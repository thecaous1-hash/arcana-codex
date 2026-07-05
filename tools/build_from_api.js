// ============================================================
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

async function getJSON(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 25000);   // 25초 넘으면 중단 후 재시도(무한대기 방지)
    try {
      const res = await fetch(url, { headers: { 'Accept-Encoding': 'gzip' }, signal: ac.signal });
      if (!res.ok) throw new Error(`${res.status}`);
      return await res.json();
    } catch (e) { if (i === tries - 1) throw new Error(`${e.message} ${url}`); await sleep(1000); }
    finally { clearTimeout(timer); }
  }
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
  const cardsKo = await getJSON(`${BASE}/cards?lang=kor`);
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
    };
  }
  console.log(`  카드 ${Object.keys(cards).length}장`);

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
  let stampVersion = null;
  for (const [param, id] of Object.entries(CHARS)) {
    console.log(`· 통계 ${param} (전체) 받는 중…`);
    stats[id] = statsFrom(await getJSON(`${BASE}/runs/stats?character=${param}`));
    await sleep(400);
    console.log(`· 통계 ${param} (승천 ${MAX_ASC}) 받는 중…`);
    statsHi[id] = statsFrom(await getJSON(`${BASE}/runs/stats?character=${param}&ascension=${MAX_ASC}`));
    await sleep(400);
    console.log(`  ${id}: 전체 base ${stats[id].base_wr}% (${stats[id].total_runs}런) · A${MAX_ASC} base ${statsHi[id].base_wr}% (${statsHi[id].total_runs}런)`);
  }

  // 4) 버전 스탬프 (최신 런 build_id)
  try {
    const runs = await getJSON(`${BASE}/runs/list?limit=20`);
    const arr = Array.isArray(runs) ? runs : (runs.runs || runs.data || runs.results || []);
    const vc = {}; arr.forEach(x => { if (x.build_id) vc[x.build_id] = (vc[x.build_id] || 0) + 1; });
    stampVersion = Object.entries(vc).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  } catch (e) {}

  const out = { source: 'spire-codex.com/api', version: stampVersion, maxAsc: MAX_ASC, cards, tier, stats, statsHi };
  const js = '// spire-codex API 스냅샷(개인용). tools/build_from_api.js 생성 · 갱신은 재실행.\n'
    + `// 소스: ${out.source} · 게임 ${stampVersion || '?'}\n`
    + 'window.API_DATA = ' + JSON.stringify(out) + ';\n';
  fs.mkdirSync(path.join(PROJ, 'data'), { recursive: true });
  fs.writeFileSync(path.join(PROJ, 'data', 'api_data.js'), js);
  const kb = (fs.statSync(path.join(PROJ, 'data', 'api_data.js')).size / 1024).toFixed(0);
  console.log(`\n✓ data/api_data.js 생성: ${kb}KB · 게임 ${stampVersion} · 카드 ${Object.keys(cards).length} · 티어 ${Object.keys(tier).length} · 통계(전체+A${MAX_ASC}) ${Object.keys(stats).length}캐릭`);
})().catch(e => { console.error('실패:', e.message); process.exit(1); });
