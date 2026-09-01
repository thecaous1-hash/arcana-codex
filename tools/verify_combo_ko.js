// tools/verify_combo_ko.js — 콤보 사유 한글화 검증 (2026-09-01)
// 실행: node tools/verify_combo_ko.js  (저장소 루트에서)
// 핵심: reason 외 필드가 하나도 변하지 않았음을 구조 지문(SHA-256)으로 증명한다.
// 기대 해시는 번역 전 main(e8dd001)에서 계산한 값 — 불일치 시 임의로 고치지 말고 중단·보고.
const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto');
const R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let fail=0;
const check=(ok,label,detail)=>{ console.log((ok?'PASS':'FAIL'),label,detail||''); if(!ok)fail++; };

// ⑤ 파일 로드 정상 (따옴표 이스케이프 사고 방지) — 로드 실패는 즉시 FAIL
let DB=null;
try{
  const ctx={console,Math,JSON,Set,Map}; ctx.window=ctx; ctx.globalThis=ctx;
  vm.createContext(ctx);
  vm.runInContext(R('db.js'),ctx,{filename:'db.js'});
  DB=vm.runInContext('DB',ctx);
  check(true,'⑤ db.js vm 로드 정상');
}catch(e){
  check(false,'⑤ db.js vm 로드 정상',String(e).slice(0,200));
  console.log('\n실패 '+fail+'건'); process.exit(1);
}

// ① 구조 무결성 (가장 중요): reason 외 필드 불변 증명
const EXPECT_FP='4c9ac183815fbd9ff257c2569b89d34fc39de89af0801d8f655d31f40fb5e586';
const fp = DB.combos.map((c,i)=>i+'|'+c.deckCard+'|'+c.offeredCard+'|'+c.bonus).join('\n')
         + '\n##\n' + DB.relicCombos.map((r,i)=>i+'|'+r.relic+'|'+r.card+'|'+r.bonus).join('\n');
const hash=crypto.createHash('sha256').update(fp).digest('hex');
check(hash===EXPECT_FP,'① 구조 지문 SHA-256 일치','실측 '+hash.slice(0,16)+'…');

// ② 건수
check(DB.combos.length===781,'② combos 781건','실측 '+DB.combos.length);
check(DB.relicCombos.length===145,'② relicCombos 145건','실측 '+DB.relicCombos.length);

// ③ 한글 포함 926건 전건
const all=[...DB.combos,...DB.relicCombos];
const noKo=all.filter(c=>!/[가-힣]/.test(c.reason||''));
check(noKo.length===0,'③ 전건 reason에 한글 포함','한글 없음 '+noKo.length+'건');

// ④ 영문 잔존 0건 (영어 단어 3개 이상 연속 금지)
const ENG_RUN=/[A-Za-z]{3,}\s+[A-Za-z]{3,}\s+[A-Za-z]{2,}/;
const engLeft=all.filter(c=>ENG_RUN.test(c.reason||''));
check(engLeft.length===0,'④ 영문 연속 구문 잔존 0건','실측 '+engLeft.length+'건');
engLeft.slice(0,5).forEach(c=>console.log('   잔존:',(c.reason||'').slice(0,80)));

console.log(fail===0?'\n전체 통과':'\n실패 '+fail+'건'); process.exit(fail?1:0);
