// ============================================================
//  [역할: 백업(2차 소스)] 주력은 tools/build_from_api.js(spire-codex API).
//   이 스크립트는 게임 파일 직접추출(GDRE/ILSpy) 예비 파이프라인 —
//   1차(API)가 중단될 때만 쓰는 백업. 평소엔 실행할 필요 없음. (자세히: tools/README.md)
//  ------------------------------------------------------------
//  crop_basic_cards.js — 캐릭터별 기본 카드(타격/수비) 그림을 각각 잘라 저장
//  crop_card_art.js 는 strike_ironclad 등을 전부 "Strike"로 합쳐 1개만 저장했음.
//  이 스크립트는 캐릭터별로 STRIKE_<CHAR>.webp / DEFEND_<CHAR>.webp 를 만들고
//  data/basic_art.js (window.BASIC_ART) 를 생성한다.
//  용법: node crop_basic_cards.js <atlasDir(=...images/atlases 상위)>
//   SHARP_PATH 로 sharp 위치 지정 가능.
// ============================================================
const fs=require('fs'), path=require('path');
const sharp=require(process.env.SHARP_PATH || 'sharp');
const PROJ=path.join(__dirname,'..');
const REC=process.argv[2];
if(!REC){ console.error('사용법: node crop_basic_cards.js <recoveredAtlasDir>'); process.exit(1); }
const ATLAS_DIR=path.join(REC,'images','atlases');
const TP=path.join(ATLAS_DIR,'card_atlas.tpsheet');

const CHARS=['ironclad','silent','defect','regent','necrobinder'];
const tp=JSON.parse(fs.readFileSync(TP,'utf8'));
const OUTDIR=path.join(PROJ,'assets','cards'); fs.mkdirSync(OUTDIR,{recursive:true});

(async()=>{
  const basicArt={}; CHARS.forEach(c=>basicArt[c]={});
  let done=0, miss=[];
  for(const tex of tp.textures){
    const imgPath=path.join(ATLAS_DIR,tex.image);
    if(!fs.existsSync(imgPath)){ console.log('  이미지 없음:', tex.image); continue; }
    const img=sharp(imgPath);
    for(const sp of tex.sprites){
      if(/\/beta\//.test(sp.filename)) continue;   // beta(개발용 옛 그림) 제외 — 정식만
      const m=sp.filename.match(/(strike|defend)_(ironclad|silent|defect|regent|necrobinder)\.png$/i);
      if(!m) continue;
      const kind=m[1].toUpperCase(), ch=m[2].toLowerCase();
      const file=`${kind}_${ch.toUpperCase()}.webp`;
      const r=sp.region;
      await img.clone().extract({left:r.x,top:r.y,width:r.w,height:r.h})
        .resize({width:220,withoutEnlargement:true}).webp({quality:82})
        .toFile(path.join(OUTDIR,file));
      basicArt[ch][kind]='cards/'+file;
      done++;
    }
  }
  // 누락 점검
  CHARS.forEach(c=>['STRIKE','DEFEND'].forEach(k=>{ if(!basicArt[c][k]) miss.push(c+'/'+k); }));
  fs.writeFileSync(path.join(PROJ,'data','basic_art.js'),
    '// 캐릭터별 기본 카드(타격/수비) 그림 매니페스트(개인용). crop_basic_cards.js 생성.\n'+
    'window.BASIC_ART = '+JSON.stringify(basicArt)+';\n');
  console.log(`잘라낸 기본카드: ${done}개 → assets/cards/ · data/basic_art.js`);
  if(miss.length) console.log('  ⚠ 누락:', miss.join(', ')); else console.log('  ✓ 5캐릭터 × 타격/수비 = 10개 모두 완료');
})();
