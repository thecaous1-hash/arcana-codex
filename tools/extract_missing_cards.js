// ============================================================
//  extract_missing_cards.js  (v2 — 철자무시 매칭 + 아틀라스 기준)
//  게임엔 있는데 DB엔 없는 카드(그림 있는 것)를 추출해 이미지 크롭 +
//  data/extra_cards.js 생성. STS1 잔재(게임 C#에 없는) 카드는 제거 목록.
//  용법: node tools/extract_missing_cards.js <recoveredAtlasDir> <recoveredCardsDir>
//   SHARP_PATH 로 sharp 위치 지정.
// ============================================================
const fs=require('fs'), path=require('path'), vm=require('vm');
const sharp=require(process.env.SHARP_PATH || 'sharp');
const PROJ=path.join(__dirname,'..');
const ATLAS_ROOT=process.argv[2], CARDS_DIR=process.argv[3];
if(!ATLAS_ROOT||!CARDS_DIR){ console.error('사용법: node tools/extract_missing_cards.js <atlasDir> <cardsDir>'); process.exit(1); }
const ATLAS_DIR=path.join(ATLAS_ROOT,'images','atlases');

const norm=s=>(s||'').toUpperCase().replace(/[\s\-]/g,'_').replace(/[^A-Z0-9_]/g,'').replace(/_+/g,'_');
const flat=s=>(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const CHARS=new Set(['ironclad','silent','defect','regent','necrobinder','colorless']);
const SMALL=new Set(['of','the','and','a','to','for','in','on','from','with','at','by','into']);
const titleCase=leaf=>leaf.split('_').map((w,i)=>(i>0&&SMALL.has(w))?w:w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
const isBasic=s=>/^(strike|defend)/i.test(s);

// 데이터 로드
const ctx={}; ctx.window=ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(PROJ,'db.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(PROJ,'data','card_stats.js'),'utf8'),ctx);
const DB=vm.runInContext('DB',ctx), CARD_STATS=ctx.CARD_STATS||ctx.window.CARD_STATS;
const allLoc=JSON.parse(fs.readFileSync(path.join(PROJ,'data','all_loc_ko.json'),'utf8'));
const tp=JSON.parse(fs.readFileSync(path.join(ATLAS_DIR,'card_atlas.tpsheet'),'utf8'));

// 게임 C# 카드 클래스(정답) — flat 집합 (Strike/Defend/Deprecated 제외)
const gameFlat=new Set();
fs.readdirSync(CARDS_DIR).filter(f=>/\.cs$/.test(f)&&!/\.cs\.uid/.test(f)).forEach(f=>{
  const cls=f.replace(/\.cs$/,''); if(/^(Strike|Defend|Deprecated)/.test(cls))return; gameFlat.add(flat(cls));
});
// CardPool → 캐릭터 매핑 (그림 없는 카드의 캐릭터 판별용)
const POOLS_DIR=path.join(path.dirname(CARDS_DIR),'CardPools');
const classChar={};
if(fs.existsSync(POOLS_DIR)) for(const ch of CHARS){ const pf=path.join(POOLS_DIR, ch.charAt(0).toUpperCase()+ch.slice(1)+'CardPool.cs');
  if(!fs.existsSync(pf))continue; const src=fs.readFileSync(pf,'utf8'); let m; const re=/ModelDb\.Card<(\w+)>/g;
  while((m=re.exec(src))) classChar[flat(m[1])]=ch;
}
// 스프라이트 인덱스: flat(leaf) → {char, region, image}
const spriteByFlat={};
for(const tex of tp.textures){ for(const sp of tex.sprites){ if(/\/beta\//.test(sp.filename))continue;
  const parts=sp.filename.split('/'); const leaf=parts.pop().replace(/\.png$/i,''); const ch=parts[0];
  const fk=flat(leaf); if(!spriteByFlat[fk]) spriteByFlat[fk]={char:ch, region:sp.region, image:tex.image, leaf};
}}
// CARD_STATS flat 인덱스
const statsByFlat={}; for(const k in CARD_STATS) statsByFlat[flat(k)]=CARD_STATS[k];
const locByFlat={}; for(const k in allLoc) locByFlat[flat(k)]=allLoc[k];
// DB flat 집합
const dbFlat=new Set();
for(const ch of Object.keys(DB.cards)) for(const c of Object.values(DB.cards[ch])) dbFlat.add(flat(c.id));

// 1) 누락 추가: 게임 C# 카드 클래스 전수 → DB에 없고 수집형인 것 (그림 있으면 크롭)
const added={}, artMap={}, locMap={}, names=[]; const imgCache={}; let noArt=[];
const OUTDIR=path.join(PROJ,'assets','cards'); fs.mkdirSync(OUTDIR,{recursive:true});
const classes=fs.readdirSync(CARDS_DIR).filter(f=>/\.cs$/.test(f)&&!/\.cs\.uid/.test(f)).map(f=>f.replace(/\.cs$/,''));

(async()=>{
  for(const cls of classes){
    if(/^(Strike|Defend|Deprecated)/.test(cls)) continue;
    const fk=flat(cls); if(dbFlat.has(fk)) continue;                 // 이미 DB에 있음
    const st=statsByFlat[fk]; if(!st || !/^(Common|Uncommon|Rare|Special)$/i.test(st.rarity||'')) continue;
    const sp=spriteByFlat[fk];
    // ★ 그림(아트)이 없는 카드 = 실제 게임에 없는 베타/삭제 카드 → 추가하지 않음
    if(!sp || !CHARS.has(sp.char)){ if(sp||classChar[fk]) noArt.push(cls); continue; }
    const ch=sp.char;
    const leaf=sp.leaf, key=norm(leaf), id=titleCase(leaf);
    { const r=sp.region; if(!imgCache[sp.image]) imgCache[sp.image]=sharp(path.join(ATLAS_DIR,sp.image));
      await imgCache[sp.image].clone().extract({left:r.x,top:r.y,width:r.w,height:r.h})
        .resize({width:220,withoutEnlargement:true}).webp({quality:82}).toFile(path.join(OUTDIR,key+'.webp'));
      artMap[id]='cards/'+key+'.webp';
    }
    const loc=locByFlat[fk]; if(loc) locMap[id]={t:loc.title||id, d:loc.description||''};
    const tier=/Rare/i.test(st.rarity)?'B':'C';
    (added[ch]=added[ch]||{})[id]={id,tier,char:ch,rarity:(st.rarity||'').toLowerCase(),syn:[],mech:[],builds:[],notes:'게임에서 자동 추출된 카드 (어드바이저 평가 미정).'};
    names.push({n:id,c:ch});
  }

  // 2) STS1 잔재 제거: DB 카드 중 게임 C#에 (철자무시) 없는 것 (기본카드 제외)
  const stale={};
  for(const ch of Object.keys(DB.cards)){ const arr=[];
    for(const c of Object.values(DB.cards[ch])){ if(isBasic(c.id))continue;
      if(!gameFlat.has(flat(c.id))) arr.push(c.id);
    } if(arr.length) stale[ch]=arr;
  }

  const out=`// 게임 자동추출: 누락 카드 추가 + STS1 잔재 제거 (extract_missing_cards.js 생성)
(function(){
  if(typeof DB==='undefined'||!DB.cards) return;
  function K(s){ return (s||'').toUpperCase().replace(/[\\s\\-]/g,'_').replace(/[^A-Z0-9_]/g,'').replace(/_+/g,'_'); }
  var STALE=${JSON.stringify(stale)};
  for(var ch in STALE){ if(DB.cards[ch]) STALE[ch].forEach(function(id){ delete DB.cards[ch][K(id)]; }); }
  if(DB.names){ var rm={}; for(var ch in STALE) STALE[ch].forEach(function(id){ rm[id]=1; });
    DB.names=DB.names.filter(function(n){ return !rm[n.n]; }); }
  var ADD=${JSON.stringify(added)};
  for(var ch in ADD){ if(!DB.cards[ch])DB.cards[ch]={}; for(var id in ADD[ch]) DB.cards[ch][K(id)]=ADD[ch][id]; }
  if(DB.names) DB.names=DB.names.concat(${JSON.stringify(names)});
  if(typeof window!=='undefined'){
    if(window.CARD_ART) Object.assign(window.CARD_ART, ${JSON.stringify(artMap)});
    if(window.KO_OFF) Object.assign(window.KO_OFF, ${JSON.stringify(locMap)});
  }
})();
`;
  fs.writeFileSync(path.join(PROJ,'data','extra_cards.js'), out);
  console.log('추가:',names.length,'(모두 그림 있음 · loc',Object.keys(locMap).length,')');
  console.log('추가 목록:', names.map(n=>n.c+'/'+n.n).join(', '));
  console.log('제외(그림없음=게임에 없는 베타/삭제 카드로 판단)',noArt.length,':', noArt.join(', '));
  console.log('제거(stale) 총', Object.values(stale).reduce((s,a)=>s+a.length,0),':', JSON.stringify(stale));
})();
