// tools/verify_display_quality.js — 추천 사유 표시 품질 검증 (2026-09-01)
// 실행: node tools/verify_display_quality.js  (저장소 루트에서)
// 검사: ① 점수 무변경 ② 문구 모순 0건 ③ 새 문구 실제 등장 ④ relicNames 스키마 정상화
const fs=require('fs'),vm=require('vm'),path=require('path');
const R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const ctx={console,Math,JSON,Set,Map}; ctx.window=ctx; ctx.globalThis=ctx;
vm.createContext(ctx);
const load=(name,tx)=>vm.runInContext(tx,ctx,{filename:name});
load('api_data.js',R('data/api_data.js'));
load('db.js',R('db.js'));
load('i18n.js',R('i18n.js'));
load('logic.js',R('logic.js'));
// index.html에서 블렌드 함수 구간(let state ~ cardBaseGrade 정의 직전)만 추출 실행
const lines=R('index.html').split('\n');
const s=lines.findIndex(l=>l.includes('let state={'));
const e=lines.findIndex(l=>l.includes('function cardBaseGrade'));
load('ix.js',lines.slice(s,e).join('\n'));

let fail=0;
const check=(ok,label,detail)=>{
  console.log((ok?'PASS':'FAIL'),label,detail||''); if(!ok)fail++;
};

function scoreAll(char,floor,act,deckExpr){
  return vm.runInContext(`
    state.char='${char}'; state.floor=${floor}; state.act=${act}; state.asc='all';
    (()=>{ const deck=${deckExpr};
      const da=analyzeDeck('${char}',deck);
      return Object.keys(DB.cards.${char}).map(k=>{
        const r=scoreCard(k,'${char}',da,${floor},${act},deck,'normal',[]);
        return {name:k,score:+r.finalScore.toFixed(2),
                syn:r.synReasons||[],anti:r.antiReasons||[]};
      }); })()
  `,ctx);
}
const deckExpr=extras=>`(()=>{const d=[];for(let i=0;i<4;i++)d.push({name:'Strike'});`+
  `for(let i=0;i<4;i++)d.push({name:'Defend'});`+
  `${JSON.stringify(extras)}.forEach(n=>d.push({name:n}));return d;})()`;

// ── ① 점수 무변경 (가장 중요): 1막 3층 아클 기본덱 — PR #73 확정 기대값 그대로 ──
const basicExpr=`(()=>{const d=[];for(let i=0;i<5;i++)d.push({name:'Strike'});`+
  `for(let i=0;i<4;i++)d.push({name:'Defend'});d.push({name:'Bash'});return d;})()`;
const f3=scoreAll('ironclad',3,1,basicExpr);
const EXPECT_F3={BLOODLETTING:3.72, SHRUG_IT_OFF:3.97, CRUELTY:5.12};
for(const [k,v] of Object.entries(EXPECT_F3)){
  const g=f3.find(r=>r.name===k);
  check(g&&Math.abs(g.score-v)<0.005,'① 점수 무변경 3층 '+k,'기대 '+v+' 실측 '+(g?g.score:'없음'));
}

// ── ② 문구 모순 0건: 3캐릭 × 2막 25층 실전덱 전수 채점 ──
const DECKS={
  ironclad:['Bash','Cinder','Anger','Shrug It Off','Inflame','Dark Embrace','Whirlwind'],
  silent:['Neutralize','Survivor','Deadly Poison','Footwork','Backflip','Catalyst'],
  defect:['Zap','Dualcast','Ball Lightning','Coolheaded','Defragment','Echo Form']
};
const FIT=/빌드에 적합|빌드 핵심/, MISFIT=/빌드와 안 맞음/;
const results={};
let contra=0;
for(const [char,extras] of Object.entries(DECKS)){
  const all=scoreAll(char,25,2,deckExpr(extras));
  results[char]=all;
  for(const r of all){
    const rs=r.syn.concat(r.anti);
    if(rs.some(x=>FIT.test(x))&&rs.some(x=>MISFIT.test(x))){
      contra++; console.log('  모순:',char,r.name,JSON.stringify(rs));
    }
  }
}
check(contra===0,'② 문구 모순 0건','실측 '+contra+'건');

// ── ③ 새 문구 실제 등장 (아클 2막 실전덱) ──
const ic=results.ironclad;
const nSyn=ic.filter(r=>r.syn.some(x=>x.includes('덱에서 효과가 잘 맞음'))).length;
const nAnti=ic.filter(r=>r.anti.some(x=>/원래 .* 빌드용 카드/.test(x))).length;
check(nSyn>=1,'③ 새 문구 등장: 덱에서 효과가 잘 맞음','실측 '+nSyn+'건');
check(nAnti>=1,'③ 새 문구 등장: 원래 ~ 빌드용 카드','실측 '+nAnti+'건');

// ── ④ relicNames 정상화 ──
const rn=vm.runInContext('DB.relicNames',ctx);
check(rn.length===298,'④ relicNames 길이 298','실측 '+rn.length);
const strCount=rn.filter(x=>typeof x==='string').length;
check(strCount===0,'④ 문자열 항목 0건','실측 '+strCount+'건');
const FIVE=['Hefty Tablet',"Neow's Talisman","Neow's Bones",'Phial Holster','Winged Boots'];
for(const f of FIVE){
  const it=rn.find(x=>x&&typeof x==='object'&&x.n===f);
  check(!!it&&it.c==='any','④ 스키마 '+f,it?JSON.stringify(it):'항목 없음');
}
// relicSource() 방식 필터(index.html:934)로 ironclad 기준 5종 조회 가능한지
const filtered=rn.filter(n=>n.c==='ironclad'||n.c==='any');
check(FIVE.every(f=>filtered.some(x=>x.n===f)),'④ relicSource 필터(ironclad)에 5종 포함');

console.log(fail===0?'\n전체 통과':'\n실패 '+fail+'건'); process.exit(fail?1:0);
