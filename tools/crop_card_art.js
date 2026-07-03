// ============================================================
//  crop_card_art.js — 카드/유물 아틀라스에서 그림을 잘라 WebP로 저장
//  입력: GDRE로 복원한 *_atlas.tpsheet + *_atlas*.png
//  출력: assets/cards/<ID>.webp, assets/relics/<ID>.webp + data/card_art.js, relic_art.js
//  용법: node crop_card_art.js <recoveredDir>
// ============================================================
const fs=require('fs'), path=require('path'), vm=require('vm');
const sharp=require(process.env.SHARP_PATH || 'sharp');
const PROJ=path.join(__dirname,'..');
const REC=process.argv[2];
if(!REC){ console.error('사용법: node crop_card_art.js <recoveredDir>'); process.exit(1); }
const ATLAS_DIR=path.join(REC,'images','atlases');

function norm(nm){ return (nm||'').toUpperCase().replace(/[\s\-]/g,'_').replace(/[^A-Z0-9_]/g,'').replace(/_+/g,'_'); }

const ctx={}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(PROJ,'db.js'),'utf8'),ctx,{filename:'db.js'});
const DB=vm.runInContext('DB',ctx);

// norm -> 대표 영어 id
function mapFromCards(){ const m={}; for(const ch of Object.keys(DB.cards)) for(const k of Object.keys(DB.cards[ch])){ const id=DB.cards[ch][k].id; m[norm(id)]=id; } return m; }
function mapFromRelics(){ const m={}; for(const k of Object.keys(DB.relics||{})){ const id=DB.relics[k].id; m[norm(id)]=id; } return m; }

async function process_atlas(tpsheetFile, dbMap, outSub, manifestVar, manifestFile){
  const tpPath=path.join(ATLAS_DIR, tpsheetFile);
  if(!fs.existsSync(tpPath)){ console.log('건너뜀(없음):', tpsheetFile); return; }
  const tp=JSON.parse(fs.readFileSync(tpPath,'utf8'));
  const OUTDIR=path.join(PROJ,'assets',outSub); fs.mkdirSync(OUTDIR,{recursive:true});
  const manifest={}; let hit=0,miss=0; const missNames=[]; const seen=new Set();
  for(const tex of tp.textures){
    const imgPath=path.join(ATLAS_DIR,tex.image);
    if(!fs.existsSync(imgPath)){ console.log('  이미지 없음:', tex.image); continue; }
    const img=sharp(imgPath);
    for(const sp of tex.sprites){
      const leaf=(sp.filename.split('/').pop()||'').replace(/\.png$/i,'');
      const key=norm(leaf);
      let enId=dbMap[key];
      if(!enId){ const base=key.replace(/_(IRONCLAD|SILENT|DEFECT|REGENT|NECROBINDER)$/,''); if(dbMap[base])enId=dbMap[base]; }
      if(!enId){ miss++; if(missNames.length<20)missNames.push(leaf); continue; }
      if(seen.has(enId))continue; seen.add(enId);
      const r=sp.region, file=norm(enId)+'.webp';
      await img.clone().extract({left:r.x,top:r.y,width:r.w,height:r.h})
        .resize({width:220,withoutEnlargement:true}).webp({quality:82})
        .toFile(path.join(OUTDIR,file));
      manifest[enId]=outSub+'/'+file; hit++;
    }
  }
  const js=`// ${outSub} 그림 매니페스트(개인용). crop_card_art.js 생성.\nwindow.${manifestVar} = ${JSON.stringify(manifest)};\n`;
  fs.writeFileSync(path.join(PROJ,'data',manifestFile), js);
  const kb=fs.readdirSync(OUTDIR).reduce((s,f)=>s+fs.statSync(path.join(OUTDIR,f)).size,0)/1024;
  console.log(`${outSub}: 매칭 ${hit}, 미매칭 ${miss} · ${fs.readdirSync(OUTDIR).length}개 ${kb.toFixed(0)}KB · data/${manifestFile}`);
  if(missNames.length) console.log('   미매칭 예:', missNames.join(', '));
}

(async()=>{
  await process_atlas('card_atlas.tpsheet',  mapFromCards(),  'cards',  'CARD_ART',  'card_art.js');
  await process_atlas('relic_atlas.tpsheet', mapFromRelics(), 'relics', 'RELIC_ART', 'relic_art.js');
})();
