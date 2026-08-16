// ============================================================
//  [역할: 런 복기 전용] 데이터 소스(1차/백업)와 무관한 별개 기능 도구. (tools/README.md 참고)
//  ------------------------------------------------------------
//  build_run_history.js — 게임 런 기록(.run)을 슬림하게 추출해
//  data/runs.js (window.RUN_HISTORY) 생성. 앱이 열자마자 자동 로드용.
//  분석에 필요한 필드만 남겨 용량 최소화.
//  용법: node tools/build_run_history.js [historyDir]
//   기본: SlayTheSpire2\steam\*\profile1\saves\history 자동 탐색.
// ============================================================
const fs=require('fs'), path=require('path');
const PROJ=path.join(__dirname,'..');

function findHistory(){
  if(process.argv[2]) return process.argv[2];
  const base=path.join(process.env.APPDATA||'', 'SlayTheSpire2', 'steam');
  if(!fs.existsSync(base)) return null;
  for(const sid of fs.readdirSync(base)){
    for(const prof of ['profile1','profile2','profile3']){
      const h=path.join(base,sid,prof,'saves','history');
      if(fs.existsSync(h) && fs.readdirSync(h).some(f=>/\.run$/.test(f))) return h;
    }
  }
  return null;
}
const H=findHistory();
if(!H){ console.error('런 기록 폴더를 찾지 못했습니다. 경로를 인자로 주세요.'); process.exit(1); }

function slim(r){
  const p=(r.players&&r.players[0])||{};
  const mph=(r.map_point_history||[]).map(act=>(Array.isArray(act)?act:[act]).map(mp=>({
    player_stats:((mp&&mp.player_stats)||[]).map(ps=>({
      card_choices:((ps&&ps.card_choices)||[]).map(cc=>({card:{id:cc.card&&cc.card.id}, was_picked:!!cc.was_picked})),
      current_hp:ps&&ps.current_hp,
      damage_taken:ps&&ps.damage_taken
    })),
    // 방 정보(사망 지점 분석용). 분석이 쓰는 room_type·turns_taken만 남긴다 —
    // 전투 이름은 killed_by_encounter로 충분하고, model_id·monster_ids는 필요해지면 그때 추가·재빌드.
    rooms:((mp&&mp.rooms)||[]).map(rm=>({
      room_type:rm&&rm.room_type, turns_taken:rm&&rm.turns_taken
    }))
  })));
  return {
    players:[{ character:p.character, deck:(p.deck||[]).map(c=>({id:c.id})), relics:(p.relics||[]).map(c=>({id:c.id})) }],
    win:!!r.win, was_abandoned:!!r.was_abandoned, killed_by_encounter:r.killed_by_encounter,
    acts:r.acts||[], start_time:r.start_time, build_id:r.build_id, map_point_history:mph
  };
}

const files=fs.readdirSync(H).filter(f=>/\.run$/i.test(f)&&!/\.backup$/i.test(f));
const runs=[];
for(const f of files){ try{ runs.push(slim(JSON.parse(fs.readFileSync(path.join(H,f),'utf8')))); }catch(e){} }
runs.sort((a,b)=>(b.start_time||0)-(a.start_time||0));

fs.mkdirSync(path.join(PROJ,'data'),{recursive:true});
const out='// 게임 런 기록 스냅샷(개인용). build_run_history.js 생성 · 새 런은 재실행으로 갱신.\nwindow.RUN_HISTORY = '+JSON.stringify(runs)+';\n';
fs.writeFileSync(path.join(PROJ,'data','runs.js'), out);
const kb=(fs.statSync(path.join(PROJ,'data','runs.js')).size/1024).toFixed(0);
const wins=runs.filter(r=>r.win).length, losses=runs.filter(r=>!r.win&&!r.was_abandoned).length;
console.log(`data/runs.js 생성: ${runs.length}런 (${kb}KB) · 승 ${wins} / 패 ${losses} / 포기 ${runs.length-wins-losses}`);
console.log('경로:', H);
