// 게임 자동추출: 누락 카드 추가 + STS1 잔재 제거 (extract_missing_cards.js 생성)
(function(){
  if(typeof DB==='undefined'||!DB.cards) return;
  function K(s){ return (s||'').toUpperCase().replace(/[\s\-]/g,'_').replace(/[^A-Z0-9_]/g,'').replace(/_+/g,'_'); }
  var STALE={"ironclad":["Heavy Blade","Clothesline","Wild Strike","Dropkick","Sever Soul","Searing Blow","Limit Break","Spot Weakness","Flex","Reaper","Brutality","Double Tap","Immolate","Intimidate","Disarm","Power Through","Combust"],"silent":["Follow Through"],"regent":["Child of Stars"]};
  for(var ch in STALE){ if(DB.cards[ch]) STALE[ch].forEach(function(id){ delete DB.cards[ch][K(id)]; }); }
  if(DB.names){ var rm={}; for(var ch in STALE) STALE[ch].forEach(function(id){ rm[id]=1; });
    DB.names=DB.names.filter(function(n){ return !rm[n.n]; }); }
  var ADD={"necrobinder":{"Call of the Void":{"id":"Call of the Void","tier":"B","char":"necrobinder","rarity":"rare","syn":[],"mech":[],"builds":[],"notes":"게임에서 자동 추출된 카드 (어드바이저 평가 미정)."}},"silent":{"Scare":{"id":"Scare","tier":"C","char":"silent","rarity":"uncommon","syn":[],"mech":[],"builds":[],"notes":"게임에서 자동 추출된 카드 (어드바이저 평가 미정)."}},"ironclad":{"Tank":{"id":"Tank","tier":"B","char":"ironclad","rarity":"rare","syn":[],"mech":[],"builds":[],"notes":"게임에서 자동 추출된 카드 (어드바이저 평가 미정)."}}};
  for(var ch in ADD){ if(!DB.cards[ch])DB.cards[ch]={}; for(var id in ADD[ch]) DB.cards[ch][K(id)]=ADD[ch][id]; }
  if(DB.names) DB.names=DB.names.concat([{"n":"Call of the Void","c":"necrobinder"},{"n":"Scare","c":"silent"},{"n":"Tank","c":"ironclad"}]);
  if(typeof window!=='undefined'){
    if(window.CARD_ART) Object.assign(window.CARD_ART, {"Call of the Void":"cards/CALL_OF_THE_VOID.webp","Scare":"cards/SCARE.webp","Tank":"cards/TANK.webp"});
    if(window.KO_OFF) Object.assign(window.KO_OFF, {"Call of the Void":{"t":"공허의 부름","d":"내 턴 시작 시,\n무작위 카드를 {Cards:diff()}장\n[gold]손[/gold]으로 가져옵니다.\n그 카드가\n[gold]휘발성[/gold]을 얻습니다."},"Scare":{"t":"위협","d":"모든 적에게\n[gold]약화[/gold]를 1 부여합니다."},"Tank":{"t":"탱커","d":"적에게 받는 피해가\n{DamageIncrease:percentMore()}% 증가합니다.\n아군이 적에게 받는 피해가\n{DamageDecrease:percentLess()}% 감소합니다."}});
  }
})();
