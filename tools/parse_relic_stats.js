// ============================================================
//  [역할: 백업(2차 소스)] 주력은 tools/build_from_api.js(spire-codex API).
//   이 스크립트는 게임 파일 직접추출(GDRE/ILSpy) 예비 파이프라인 —
//   1차(API)가 중단될 때만 쓰는 백업. 평소엔 실행할 필요 없음. (자세히: tools/README.md)
//  ------------------------------------------------------------
//  parse_relic_stats.js — GDRE 디컴파일 C# 유물 소스에서 수치 추출
//  입력: <recoveredDir>/src/Core/Models/Relics/*.cs
//  출력: data/relic_stats.js  (window.RELIC_STATS = { LOCKEY: {...} })
//   각 유물: {rarity, vars:{Heal:{b,u}, VigorPower:{b,u}, ...}}
//   (유물은 강화가 없어 b===u)
//  용법: node parse_relic_stats.js <recoveredDir> [--test]
// ============================================================
const fs=require('fs'), path=require('path');
const PROJ=path.join(__dirname,'..');
const REC=process.argv[2];
if(!REC){ console.error('사용법: node parse_relic_stats.js <recoveredDir>'); process.exit(1); }
const RELICS=path.join(REC,'src','Core','Models','Relics');

// PascalCase 클래스명 → UPPER_SNAKE (로컬라이제이션/DB 키와 일치)
function pascalToKey(s){ return s.replace(/([a-z0-9])([A-Z])/g,'$1_$2').replace(/([A-Z]+)([A-Z][a-z])/g,'$1_$2').toUpperCase(); }

function parseRelic(src){
  const cm=src.match(/class\s+(\w+)\s*:\s*\w*Relic\w*/) || src.match(/class\s+(\w+)\s*:/);
  if(!cm) return null;
  const cls=cm[1];
  // RelicRarity.X
  const rm=src.match(/RelicRarity\.(\w+)/);
  const rarity=rm?rm[1]:null;
  // CanonicalVars 블록 (=> ... ;)  — 한 줄 또는 여러 줄
  let varsBlock='';
  const vb=src.match(/CanonicalVars\s*=>([\s\S]*?);/);
  if(vb) varsBlock=vb[1];
  // new XxxVar<Type>(Nm  또는  new XxxVar(Nm   — 카드 파서와 동일 규칙
  const vars={};
  const vre=/new\s+(\w+)Var(?:<(\w+)>)?\s*\(\s*(-?\d+(?:\.\d+)?)m?\s*[,)]/g; let vm;
  while((vm=vre.exec(varsBlock))){
    const key = vm[2] ? vm[2] : vm[1];   // PowerVar<VigorPower>→VigorPower, HealVar→Heal
    const base = parseFloat(vm[3]);
    if(!(key in vars)) vars[key]={b:base, u:base};   // 유물은 강화 없음
  }
  // new DynamicVar("Key", Nm) — 문자열 키가 먼저 오는 형태
  const dvre=/new\s+DynamicVar\(\s*"(\w+)"\s*,\s*(-?\d+(?:\.\d+)?)m?/g; let dv;
  while((dv=dvre.exec(varsBlock))){ const key=dv[1], base=parseFloat(dv[2]); if(!(key in vars)) vars[key]={b:base,u:base}; }
  return { cls, key:pascalToKey(cls), rarity, vars };
}

let files;
try { files=fs.readdirSync(RELICS).filter(f=>f.endsWith('.cs')); }
catch(e){ console.error('유물 소스 폴더 없음:', RELICS); process.exit(1); }

const out={};
let withVars=0;
for(const f of files){
  const r=parseRelic(fs.readFileSync(path.join(RELICS,f),'utf8'));
  if(!r) continue;
  out[r.key]={rarity:r.rarity, vars:r.vars};
  if(Object.keys(r.vars).length) withVars++;
}

if(process.argv[3]==='--test'){
  for(const k of ['BURNING_BLOOD','AKABEKO','BOOMING_CONCH','BOUND_PHYLACTERY','NUTRITIOUS_SOUP']){
    console.log(k, JSON.stringify(out[k]));
  }
  console.log(`\n총 ${files.length}파일, ${Object.keys(out).length}유물, 변수있음 ${withVars}`);
} else {
  fs.mkdirSync(path.join(PROJ,'data'),{recursive:true});
  fs.writeFileSync(path.join(PROJ,'data','relic_stats.js'),
    '// 유물 수치 데이터(개인용). GDRE 디컴파일 C# 소스에서 parse_relic_stats.js 로 추출.\n'+
    'window.RELIC_STATS = '+JSON.stringify(out)+';\n');
  console.log(`저장: data/relic_stats.js — ${Object.keys(out).length}유물, 변수있음 ${withVars}`);
}
