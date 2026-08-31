// tools/verify_act1_scoring.js — 1막 스코어링 수정 검증 (2026-08-31 실측 재현)
// 실행: node tools/verify_act1_scoring.js  (저장소 루트에서)
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
function run(floor,act,deck){
  return vm.runInContext(`
    state.char='ironclad'; state.floor=${floor}; state.act=${act}; state.asc='all';
    (()=>{ const deck=${deck};
      const da=analyzeDeck('ironclad',deck);
      const out=Object.keys(DB.cards.ironclad).map(k=>{
        const r=scoreCard(k,'ironclad',da,${floor},${act},deck,'normal',[]);
        return {name:k,score:+r.finalScore.toFixed(2),grade:r.finalGrade};
      });
      out.sort((a,b)=>b.score-a.score);
      return out; })()
  `,ctx);
}
const basic=`(()=>{const d=[];for(let i=0;i<5;i++)d.push({name:'Strike'});for(let i=0;i<4;i++)d.push({name:'Defend'});d.push({name:'Bash'});return d;})()`;
const late=`(()=>{const d=[];for(let i=0;i<4;i++)d.push({name:'Strike'});for(let i=0;i<4;i++)d.push({name:'Defend'});
  ['Bash','Cinder','Tremble','Dismantle','Bully','Shrug It Off','Rage','Whirlwind','Cruelty'].forEach(n=>d.push({name:n}));return d;})()`;
const f3=run(3,1,basic), f12=run(12,1,late);
const get=(arr,n)=>arr.find(r=>r.name===n);
// 기대값 (2026-08-31 프로토타입 확정 수치)
const EXPECT_F3={BLOODLETTING:3.72, SHRUG_IT_OFF:3.97, DARK_EMBRACE:4.21, BARRICADE:4.17,
                 FEEL_NO_PAIN:3.89, UNMOVABLE:4.52, CRUELTY:5.12, IMPERVIOUS:4.82, BATTLE_TRANCE:4.26};
const EXPECT_F12={DARK_EMBRACE:6.00, OFFERING:6.00, BLOODLETTING:3.92, UPPERCUT:5.90};
let fail=0;
for(const [k,v] of Object.entries(EXPECT_F3)){
  const g=get(f3,k); const ok=g&&Math.abs(g.score-v)<0.005;
  console.log((ok?'PASS':'FAIL'),'3층',k,'기대',v,'실측',g?g.score:'없음'); if(!ok)fail++;
}
for(const [k,v] of Object.entries(EXPECT_F12)){
  const g=get(f12,k); const ok=g&&Math.abs(g.score-v)<0.005;
  console.log((ok?'PASS':'FAIL'),'12층',k,'기대',v,'실측',g?g.score:'없음'); if(!ok)fail++;
}
// 방향 검증: 3층에서 흘려보내기 > 사혈
const dir=get(f3,'SHRUG_IT_OFF').score>get(f3,'BLOODLETTING').score;
console.log((dir?'PASS':'FAIL'),'3층 방향: 흘려보내기 > 사혈'); if(!dir)fail++;
console.log(fail===0?'\n전체 통과':'\n실패 '+fail+'건'); process.exit(fail?1:0);
