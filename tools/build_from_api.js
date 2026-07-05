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
const r1 = n => Math.round(n * 10) / 10;

async function getJSON(url) {
  const res = await fetch(url, { headers: { 'Accept-Encoding': 'gzip' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
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

  // 3) 캐릭터별 승률 DELTA
  const stats = {};
  let stampVersion = null;
  for (const [param, id] of Object.entries(CHARS)) {
    console.log(`· 통계 ${param} 받는 중…`);
    const rs = await getJSON(`${BASE}/runs/stats?character=${param}`);
    const T = rs.total_runs, W = rs.total_wins, baseWr = T ? r1(W / T * 100) : 0;
    const cardStats = {};
    for (const c of (rs.top_cards || [])) {
      const n = c.total_runs_with; if (!n || n < 30) continue;       // 표본 30 미만 제외
      const wrWith = c.win_runs / n * 100;
      const rWo = T - n, wWo = W - c.win_runs;
      const wrWo = rWo > 0 ? wWo / rWo * 100 : baseWr;
      cardStats[c.card_id] = { wr: r1(wrWith), delta: r1(wrWith - wrWo), n };
    }
    stats[id] = { base_wr: baseWr, total_runs: T, cards: cardStats };
    console.log(`  ${id}: base ${baseWr}% · 카드 ${Object.keys(cardStats).length}종 (${T} 런)`);
  }

  // 4) 버전 스탬프 (최신 런 build_id)
  try {
    const runs = await getJSON(`${BASE}/runs/list?limit=20`);
    const arr = Array.isArray(runs) ? runs : (runs.runs || runs.data || runs.results || []);
    const vc = {}; arr.forEach(x => { if (x.build_id) vc[x.build_id] = (vc[x.build_id] || 0) + 1; });
    stampVersion = Object.entries(vc).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  } catch (e) {}

  const out = { source: 'spire-codex.com/api', version: stampVersion, cards, tier, stats };
  const js = '// spire-codex API 스냅샷(개인용). tools/build_from_api.js 생성 · 갱신은 재실행.\n'
    + `// 소스: ${out.source} · 게임 ${stampVersion || '?'}\n`
    + 'window.API_DATA = ' + JSON.stringify(out) + ';\n';
  fs.mkdirSync(path.join(PROJ, 'data'), { recursive: true });
  fs.writeFileSync(path.join(PROJ, 'data', 'api_data.js'), js);
  const kb = (fs.statSync(path.join(PROJ, 'data', 'api_data.js')).size / 1024).toFixed(0);
  console.log(`\n✓ data/api_data.js 생성: ${kb}KB · 게임 ${stampVersion} · 카드 ${Object.keys(cards).length} · 티어 ${Object.keys(tier).length} · 통계 ${Object.keys(stats).length}캐릭`);
})().catch(e => { console.error('실패:', e.message); process.exit(1); });
