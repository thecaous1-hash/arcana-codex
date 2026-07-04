// ============================================================
//  parse_card_stats.js — GDRE로 디컴파일한 C# 카드 소스에서 수치 추출
//  입력: <recoveredDir>/src/Core/Models/Cards/*.cs
//  출력: data/card_stats.js  (window.CARD_STATS = { LOCKEY: {...} })
//   각 카드: {cost, type, rarity, vars:{Damage:{b,u}, VulnerablePower:{b,u}, ...}}
//  용법: node parse_card_stats.js <recoveredDir>
// ============================================================
const fs=require('fs'), path=require('path');
const PROJ=path.join(__dirname,'..');
const REC=process.argv[2];
if(!REC){ console.error('사용법: node parse_card_stats.js <recoveredDir>'); process.exit(1); }
const CARDS=path.join(REC,'src','Core','Models','Cards');

// PascalCase 클래스명 → UPPER_SNAKE (로컬라이제이션 키와 일치)
function pascalToKey(s){ return s.replace(/([a-z0-9])([A-Z])/g,'$1_$2').replace(/([A-Z]+)([A-Z][a-z])/g,'$1_$2').toUpperCase(); }
const num=s=>{ const m=String(s).match(/-?\d+(?:\.\d+)?/); return m?parseFloat(m[0]):null; };

function parseCard(src){
  // 클래스명
  const cm=src.match(/class\s+(\w+)\s*:\s*\w*Card\w*/) || src.match(/class\s+(\w+)\s*:/);
  if(!cm) return null;
  const cls=cm[1];
  // 생성자 base(cost, CardType.X, CardRarity.Y, ...)
  const bm=src.match(/:\s*base\(\s*([^,]+?)\s*,\s*CardType\.(\w+)(?:\s*,\s*CardRarity\.(\w+))?/);
  let cost=null, type=null, rarity=null;
  if(bm){ cost = /^\d+$/.test(bm[1].trim())?parseInt(bm[1]):(bm[1].trim()); type=bm[2]; rarity=bm[3]||null; }
  // CanonicalVars 블록 추출(=> ... ;)
  let varsBlock='';
  const vb=src.match(/CanonicalVars\s*=>([\s\S]*?);/);
  if(vb) varsBlock=vb[1];
  // new XxxVar<Type>(Nm  또는  new XxxVar(Nm
  const vars={};
  const vre=/new\s+(\w+)Var(?:<(\w+)>)?\s*\(\s*(-?\d+(?:\.\d+)?)m?\s*[,)]/g; let vm;
  while((vm=vre.exec(varsBlock))){
    const key = vm[2] ? vm[2] : vm[1];   // PowerVar<VulnerablePower>→VulnerablePower, DamageVar→Damage
    const base = parseFloat(vm[3]);
    if(!(key in vars)) vars[key]={b:base, u:base};
  }
  // new DynamicVar("Key", Nm) — 문자열 키가 먼저 오는 형태 (Power, DamageBack, Increase 등)
  const dvre=/new\s+DynamicVar\(\s*"(\w+)"\s*,\s*(-?\d+(?:\.\d+)?)m?/g; let dv;
  while((dv=dvre.exec(varsBlock))){ const key=dv[1], base=parseFloat(dv[2]); if(!(key in vars)) vars[key]={b:base,u:base}; }
  // OnUpgrade 델타
  const um=src.match(/OnUpgrade\(\)\s*\{([\s\S]*?)\n\t\}/);
  if(um){
    const ub=um[1];
    // DynamicVars["Key"].UpgradeValueBy(Nm)
    let dm; const dre=/DynamicVars\["(\w+)"\]\.UpgradeValueBy\(\s*(-?\d+(?:\.\d+)?)m?/g;
    while((dm=dre.exec(ub))){ if(vars[dm[1]]) vars[dm[1]].u = vars[dm[1]].b + parseFloat(dm[2]); }
    // DynamicVars.Prop.UpgradeValueBy(Nm)
    let pm; const pre=/DynamicVars\.(\w+)\.UpgradeValueBy\(\s*(-?\d+(?:\.\d+)?)m?/g;
    while((pm=pre.exec(ub))){
      const prop=pm[1], delta=parseFloat(pm[2]);
      // prop → var key 매칭 (동일 / prop+Power / startsWith)
      let k = Object.keys(vars).find(k=>k===prop) || Object.keys(vars).find(k=>k===prop+'Power')
            || Object.keys(vars).find(k=>k.startsWith(prop));
      if(k) vars[k].u = vars[k].b + delta;
    }
  }
  return { cls, key:pascalToKey(cls), cost, type, rarity, vars };
}

const files=fs.readdirSync(CARDS).filter(f=>f.endsWith('.cs'));
const out={};
let withVars=0;
for(const f of files){
  const c=parseCard(fs.readFileSync(path.join(CARDS,f),'utf8'));
  if(!c) continue;
  const rec={cost:c.cost, type:c.type, rarity:c.rarity, vars:c.vars};
  out[c.key]=rec;
  // 캐릭터별 기본카드(STRIKE_IRONCLAD 등) → 기본 키(STRIKE) 별칭도 추가
  const base=c.key.replace(/_(IRONCLAD|SILENT|DEFECT|REGENT|NECROBINDER)$/,'');
  if(base!==c.key && !(base in out)) out[base]=rec;
  if(Object.keys(c.vars).length) withVars++;
}

if(process.argv[3]==='--test'){
  for(const k of ['BASH','ANGER','INFLAME','DEFEND','STRIKE','BODY_SLAM','WHIRLWIND','DEMON_FORM','FEEL_NO_PAIN','CORRUPTION']){
    console.log(k, JSON.stringify(out[k]));
  }
  console.log(`\n총 ${files.length}파일, ${Object.keys(out).length}카드, 변수있음 ${withVars}`);
} else {
  fs.mkdirSync(path.join(PROJ,'data'),{recursive:true});
  fs.writeFileSync(path.join(PROJ,'data','card_stats.js'),
    '// 카드 수치 데이터(개인용). GDRE 디컴파일 C# 소스에서 parse_card_stats.js 로 추출.\n'+
    'window.CARD_STATS = '+JSON.stringify(out)+';\n');
  console.log(`저장: data/card_stats.js — ${Object.keys(out).length}카드, 변수있음 ${withVars}`);
}
