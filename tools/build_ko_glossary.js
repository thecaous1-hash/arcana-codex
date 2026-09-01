// tools/build_ko_glossary.js — 콤보 번역용 카드·유물 이름 대조표 생성 (2026-09-01)
// 실행: node tools/build_ko_glossary.js  (저장소 루트에서)
// 출력: tools/ko_glossary.json — DB.combos/relicCombos가 참조하는 모든 이름의 한글 표기
// 이름 결정 우선순위:
//   1) data/api_data.js 공식 한글명 (API_DATA.cards[KEY].name / API_DATA.relics[KEY].name)
//   2) i18n.js koName() 폴백 (loc_ko.js KO_OFF → KO_NAME)
//   3) 고정값 3종 (Electrodynamics/Symbiosis/Strength — 어느 소스에도 없음)
// 누락이 하나라도 있으면 exit 1 (번역 착수 전 중단·보고용)
const fs=require('fs'),vm=require('vm'),path=require('path');
const R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const ctx={console,Math,JSON,Set,Map}; ctx.window=ctx; ctx.globalThis=ctx;
vm.createContext(ctx);
const load=(name,tx)=>vm.runInContext(tx,ctx,{filename:name});
load('api_data.js',R('data/api_data.js'));
load('loc_ko.js',R('data/loc_ko.js'));
load('db.js',R('db.js'));
load('i18n.js',R('i18n.js'));

// 기존 코드와 동일한 키 정규화 (logic.js:992 등):
// 대문자화 → 공백·하이픈 → _ → 영숫자·_ 외 제거(아포스트로피 포함) → _ 중복 정리
const K=s=>(s||'').toUpperCase().replace(/[\s\-]/g,'_').replace(/[^A-Z0-9_]/g,'').replace(/_+/g,'_');

const FIXED={ 'Electrodynamics':'전기역학', 'Symbiosis':'공생', 'Strength':'힘' };

const DB=vm.runInContext('DB',ctx);
const API=vm.runInContext('API_DATA',ctx);
const koNameFn=n=>vm.runInContext('koName('+JSON.stringify(n)+')',ctx);

const cardNames=new Set(), relicNames=new Set();
for(const c of DB.combos){ cardNames.add(c.deckCard); cardNames.add(c.offeredCard); }
for(const r of DB.relicCombos){ relicNames.add(r.relic); cardNames.add(r.card); }

function resolve(name,kind){
  const key=K(name);
  const pools=kind==='relic'?[API.relics,API.cards]:[API.cards,API.relics];
  for(const pool of pools){
    const e=pool&&pool[key];
    if(e&&e.name) return {ko:e.name,src:'api'};
  }
  // 2차: 밑줄 무시 대조 — db.js 표기가 공백을 생략한 경우 (예: Sic'Em → SICEM vs API SIC_EM)
  const bare=key.replace(/_/g,'');
  for(const pool of pools){
    for(const pk of Object.keys(pool||{})){
      if(pk.replace(/_/g,'')===bare && pool[pk].name) return {ko:pool[pk].name,src:'api'};
    }
  }
  const fb=koNameFn(name);
  if(fb&&fb!==name) return {ko:fb,src:'i18n'};
  if(FIXED[name]) return {ko:FIXED[name],src:'fixed'};
  return null;
}

const out={cards:{},relics:{}};
const stats={api:0,i18n:0,fixed:0};
const missing=[];
for(const n of [...cardNames].sort()){
  const r=resolve(n,'card');
  if(!r){missing.push('card: '+n);continue;}
  out.cards[n]=r.ko; stats[r.src]++;
}
for(const n of [...relicNames].sort()){
  const r=resolve(n,'relic');
  if(!r){missing.push('relic: '+n);continue;}
  out.relics[n]=r.ko; stats[r.src]++;
}

console.log('카드 이름:',Object.keys(out.cards).length,'/ 유물 이름:',Object.keys(out.relics).length);
console.log('출처: api',stats.api,'· i18n 폴백',stats.i18n,'· 고정값',stats.fixed);
if(missing.length){
  console.log('누락 '+missing.length+'건:'); missing.forEach(m=>console.log('  '+m));
  process.exit(1);
}
fs.writeFileSync(path.join(__dirname,'ko_glossary.json'),JSON.stringify(out,null,1),'utf8');
console.log('tools/ko_glossary.json 생성 완료 — 누락 0건');
