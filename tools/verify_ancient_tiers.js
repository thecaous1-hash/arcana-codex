// tools/verify_ancient_tiers.js — 고존(Ancient) 유물 티어 재산정 검증 (2026-08-31)
// 실행: node tools/verify_ancient_tiers.js  (저장소 루트에서)
// 근거: spire-codex /runs/scores/relics 획득 시점 코호트 산정 + DC 유물 공략 오버라이드
const fs=require('fs'),vm=require('vm'),path=require('path');
const R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const ctx={console,Math,JSON,Set,Map}; ctx.window=ctx; ctx.globalThis=ctx;
vm.createContext(ctx);
vm.runInContext(R('db.js'),ctx,{filename:'db.js'});
const relics=vm.runInContext('DB.relics',ctx);
// 최종 확정 티어 102종 (2026-08-31 코호트 산정 확정 수치)
const EXPECT={"SPIKED_GAUNTLETS":"A","BLACK_STAR":"B","MEAT_CLEAVER":"S","ARCHAIC_TOOTH":"S","LORDS_PARASOL":"A","LOOMING_FRUIT":"A","DISTINGUISHED_CAPE":"A","LEAFY_POULTICE":"B","FISHING_ROD":"D","WINGED_BOOTS":"C","LEAD_PAPERWEIGHT":"C","YUMMY_COOKIE":"S","NEOWS_TORMENT":"C","NEOWS_BONES":"D","NEOWS_TALISMAN":"D","NEOWS_SACRIFICE":"B","DOWSING_ROD":"C","DIAMOND_DIADEM":"A","MASSIVE_SCROLL":"A","LARGE_CAPSULE":"C","STORYBOOK":"B","SCROLL_BOXES":"D","TOASTY_MITTENS":"B","RUNIC_PYRAMID":"A","KALEIDOSCOPE":"D","SERE_TALON":"A","DUSTY_TOME":"B","BRILLIANT_SCARF":"S","SAND_CASTLE":"B","FUR_COAT":"A","HEFTY_TABLET":"D","SEA_GLASS":"B","FIDDLE":"A","GLITTER":"S","CALLING_BELL":"B","VELVET_CHOKER":"B","JEWELED_MASK":"A","JEWELRY_BOX":"S","PRESERVED_FOG":"A","SILKEN_TRESS":"C","PRECARIOUS_SHEARS":"B","ARCANE_SCROLL":"D","EMPTY_CAGE":"B","RADIANT_PEARL":"A","SAI":"S","TRI_BOOMERANG":"S","NEW_LEAF":"C","STONE_HUMIDIFIER":"C","CHOICES_PARADOX":"A","SMALL_CAPSULE":"C","WHISPERING_EARRING":"A","IRON_CLUB":"S","SNECKO_EYE":"B","SOZU":"B","BEAUTIFUL_BRACELET":"S","ASTROLABE":"B","PHIAL_HOLSTER":"C","VERY_HOT_COCOA":"B","ALCHEMICAL_COFFER":"B","NUTRITIOUS_OYSTER":"C","NUTRITIOUS_SOUP":"A","TOUCH_OF_OROBAS":"S","MUSIC_BOX":"A","ECTOPLASM":"B","DELICATE_FROND":"S","GLASS_EYE":"A","DRIFTWOOD":"B","SILVER_CRUCIBLE":"C","SIGNET_RING":"S","LOST_COFFER":"C","TOY_BOX":"B","CURSED_PEARL":"C","ELECTRIC_SHRYMP":"B","WAR_HAMMER":"A","PRECISE_SCISSORS":"B","BIIIG_HUG":"B","BLESSED_ANTLER":"A","BOOMING_CONCH":"C","CROSSBOW":"S","CLAWS":"A","TANXS_WHISTLE":"S","THROWING_AXE":"A","PAELS_LEGION":"B","PAELS_WING":"C","PAELS_EYE":"C","PAELS_TEARS":"C","PAELS_CLAW":"B","PAELS_HORN":"D","PAELS_FLESH":"C","PAELS_TOOTH":"B","PAELS_GROWTH":"C","PAELS_BLOOD":"S","PANDORAS_BOX":"B","POMANDER":"C","PRISMATIC_GEM":"B","BLOOD_SOAKED_ROSE":"A","PHILOSOPHERS_STONE":"B","PUMPKIN_CANDLE":"S","LAVA_ROCK":"C","GOLDEN_COMPASS":"B","SEAL_OF_GOLD":"B","GOLDEN_PEARL":"C"};
const EXPECT_DIST={S:17,A:23,B:31,C:23,D:8};
let fail=0;
// 1) 102종 전건 티어 대조 (신규 5종 포함)
for(const [k,v] of Object.entries(EXPECT)){
  const d=relics[k];
  const ok=d&&d.tier===v;
  if(!ok){ console.log('FAIL',k,'기대',v,'실측',d?d.tier:'항목 없음'); fail++; }
}
console.log('티어 대조:',Object.keys(EXPECT).length+'종 중 실패',fail,'건');
// 2) 분포 확인
const dist={};
for(const k of Object.keys(EXPECT)){
  const d=relics[k]; if(d) dist[d.tier]=(dist[d.tier]||0)+1;
}
for(const [t,n] of Object.entries(EXPECT_DIST)){
  const ok=dist[t]===n;
  console.log((ok?'PASS':'FAIL'),'분포',t,'기대',n,'실측',dist[t]||0); if(!ok)fail++;
}
// 3) builds 확인
for(const k of ['PUMPKIN_CANDLE','RUNIC_PYRAMID']){
  const b=relics[k]&&relics[k].builds;
  const ok=Array.isArray(b)&&b.length===1&&b[0]==='any';
  console.log((ok?'PASS':'FAIL'),'builds',k,'기대 [any] 실측',JSON.stringify(b)); if(!ok)fail++;
}
console.log(fail===0?'\n전체 통과':'\n실패 '+fail+'건'); process.exit(fail?1:0);
