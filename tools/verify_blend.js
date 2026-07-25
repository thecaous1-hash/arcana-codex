// ============================================================
//  verify_blend.js — 기본점수 블렌드 회귀 검증 하네스
//  ------------------------------------------------------------
//  앱과 동일한 로드 순서(db.js → extra_cards.js → api_data.js → logic.js)로
//  index.html의 실제 산식 블록을 추출해 실행한다(복사본 아님 — 산식을 바꾸면
//  이 하네스도 자동으로 새 산식을 검증하게 됨).
//  검사 항목:
//   1) 진단 6장(2026-07-25) 최종 점수·등급 + 고수 평가 대비 역전 쌍 수
//   2) 무작위 10장(시드 고정 20260725) 점수표
//   3) 보정 층 스모크: 콤보(▲)·유물(◈)·인챈트(✦) 발동 확인
//  용법: node tools/verify_blend.js
// ============================================================
const fs = require('fs');
const path = require('path');
const PROJ = path.join(__dirname, '..');
global.window = global;

eval(fs.readFileSync(path.join(PROJ,'db.js'),'utf8').replace('const DB','global.DB'));
eval(fs.readFileSync(path.join(PROJ,'data/extra_cards.js'),'utf8'));
eval(fs.readFileSync(path.join(PROJ,'data/api_data.js'),'utf8'));

// index.html 전역 스텁 (i18n·DOM 무관 최소치)
global.state = { char:'ironclad', floor:5, act:1, encounter:'normal', deck:[], relics:[], offered:[], mode:'reward', archFilter:'current', asc:'all' };
global.API = window.API_DATA;
global.canonEN = n => n;
global.apiKey = n => (n||'').toUpperCase().replace(/[\s\-]/g,'_').replace(/[^A-Z0-9_]/g,'').replace(/_+/g,'_');
global.koName = n=>n; global.koTag = n=>n; global.koArch = n=>n; global.koBuild = n=>n;

eval(fs.readFileSync(path.join(PROJ,'logic.js'),'utf8')
  .replace('const GRADE_VALS','global.GRADE_VALS')
  .replace('const SCORE_GRADE ','global.SCORE_GRADE ')
  .replace('const SCORE_GRADE_SD','global.SCORE_GRADE_SD')
  .replace(/^function (\w+)/gm,'global.$1=function'));

// index.html 실파일에서 산식 블록 추출 (dataBaseScore ~ isExpertOnly)
const html = fs.readFileSync(path.join(PROJ,'index.html'),'utf8');
const s0 = html.indexOf('// DELTA 원점수');
const s1 = html.indexOf('// 표시 이름은 API');
if (s0 < 0 || s1 <= s0) { console.error('실패: index.html 산식 블록을 찾지 못함'); process.exit(1); }
eval(html.slice(s0,s1)
  .replace(/^const BLEND/gm,'global.BLEND')
  .replace(/^function (\w+)/gm,'global.$1=function'));

const starterDeck = ['Strike','Strike','Strike','Strike','Strike','Defend','Defend','Defend','Defend','Bash'].map(n=>({name:n}));
const da5 = analyzeDeck('ironclad', starterDeck);
let fails = 0;

// ── 1) 진단 6장 + 역전 쌍 ──
// 고수 평가(2026-07 커뮤니티): 높음 = Bloodletting/Pommel Strike/Stoke, 낮음 = Demon Form/Anger/Clothesline
const SIX = ['Bloodletting','Pommel Strike','Stoke','Demon Form','Anger','Clothesline'];
const HIGH = new Set(['Bloodletting','Pommel Strike','Stoke']);
console.log('── 진단 6장 (층5·1막·아이언클래드 시작 덱) ──');
const rows = SIX.map(n => {
  const r = scoreCard(n, 'ironclad', da5, 5, 1, starterDeck, 'normal', []);
  const b = cardBaseScoreVal(n, 'ironclad');
  console.log(`  ${n.padEnd(14)} 기본 ${b.toFixed(2)} → 최종 ${r.finalScore.toFixed(2)} (${r.finalGrade})`);
  return { name:n, final:r.finalScore };
});
const inv = [];
for (const lo of rows.filter(r=>!HIGH.has(r.name)))
  for (const hi of rows.filter(r=>HIGH.has(r.name)))
    if (lo.final > hi.final) inv.push(`${lo.name}(${lo.final.toFixed(2)}) > ${hi.name}(${hi.final.toFixed(2)})`);
console.log(`  역전 쌍: ${inv.length}개 ${inv.length?JSON.stringify(inv):''}`);
// 기준선: 3원 블렌드(안2) 도입 시점 1쌍(Demon Form>Pommel Strike — 데이터 한계, 2차 수술 대상)
if (inv.length > 1) { console.log('  ✗ 경고: 역전 쌍이 기준선(1)을 초과'); fails++; }

// ── 2) 무작위 10장 (시드 고정 — 진단 Q6과 동일) ──
let seed = 20260725;
const rnd = () => (seed = (seed*1103515245+12345) % 2147483648) / 2147483648;
const icCards = Object.values(DB.cards.ironclad);
const used = new Set(); const sample = [];
while (sample.length < 10) { const i = Math.floor(rnd()*icCards.length); if (used.has(i)) continue; used.add(i); sample.push(icCards[i]); }
console.log('── 무작위 10장 (시드 20260725) ──');
for (const c of sample) {
  const r = scoreCard(c.id, 'ironclad', da5, 5, 1, starterDeck, 'normal', []);
  const t = API.tier[apiKey(c.id)];
  console.log(`  ${c.id.padEnd(16)} 티어 ${c.tier} · Codex ${t?String(t.score).padStart(3):'  —'} · 기본 ${cardBaseScoreVal(c.id,'ironclad').toFixed(2)} · 최종 ${r.finalScore.toFixed(2)} (${r.finalGrade})`);
}

// ── 3) 보정 층 스모크 (▲콤보 · ◈유물 · ✦인챈트) ──
const comboIC = DB.combos.find(cb => getCard('ironclad', cb.deckCard) && getCard('ironclad', cb.offeredCard));
const rcIC = DB.relicCombos.find(rc => getCard('ironclad', rc.card));
const scenDeck = [ {name:'Strike'},{name:'Defend'},{name:'Bash'},
  {name:'Bloodletting', ench:'CORRUPTED'}, {name: comboIC.deckCard} ];
const daS = analyzeDeck('ironclad', scenDeck);
const checks = [
  { name: comboIC.offeredCard, mark:'▲', desc:`콤보(${comboIC.deckCard}→${comboIC.offeredCard})` },
  { name: rcIC.card,           mark:'◈', desc:`유물(${rcIC.relic}+${rcIC.card})` },
  { name: 'Feed',              mark:'✦', desc:'인챈트(CORRUPTED→회복 시너지)' },
];
console.log('── 보정 층 스모크 ──');
for (const c of checks) {
  const r = scoreCard(c.name, 'ironclad', daS, 10, 1, scenDeck, 'normal', [rcIC.relic]);
  const hit = r.synReasons.some(x => x.includes(c.mark));
  console.log(`  ${hit?'✓':'✗'} ${c.desc}: ${hit?'발동':'미발동!'}`);
  if (!hit) fails++;
}

console.log(fails ? `\n✗ 검증 실패 ${fails}건` : '\n✓ 전체 검증 통과');
process.exit(fails ? 1 : 0);
