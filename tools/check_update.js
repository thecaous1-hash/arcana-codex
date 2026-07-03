// ============================================================
//  check_update.js — STS2 패치 감지 → 필요 시 한글 데이터 재추출
//  게임 폴더의 release_info.json(version, main_assembly_hash)을
//  data/extracted_version.json 과 비교. 다르면 extract_loc.js 실행.
//  용법: node check_update.js         (다르면 재추출)
//        node check_update.js --force (무조건 재추출)
//  → 작업 스케줄러/시작 스크립트에 걸어두면 "앱 열 때/주기적으로" 최신 유지.
// ============================================================
const fs = require('fs'), path = require('path'), cp = require('child_process');
const PROJ = path.join(__dirname, '..');
const GAME_DIR = process.env.STS2_DIR ||
  "C:/Program Files (x86)/Steam/steamapps/common/Slay the Spire 2";

function readJson(p){ try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch(e){ return null; } }

const rel = readJson(path.join(GAME_DIR, 'release_info.json'));
if (!rel){ console.error('release_info.json 을 찾지 못함:', GAME_DIR); process.exit(2); }
const stamp = readJson(path.join(PROJ, 'data', 'extracted_version.json'));
const force = process.argv.includes('--force');

const cur = { version: rel.version, hash: rel.main_assembly_hash };
const old = stamp ? { version: stamp.version, hash: stamp.main_assembly_hash } : null;
const changed = force || !old || old.version !== cur.version || old.hash !== cur.hash;

console.log(`게임 버전: ${cur.version} (hash ${cur.hash})`);
console.log(`추출 버전: ${old ? old.version + ' (hash ' + old.hash + ')' : '(없음)'}`);

if (!changed){
  console.log('✅ 최신입니다 — 재추출 불필요.');
  process.exit(0);
}

console.log(force ? '↻ 강제 재추출…' : '⚠ 버전이 달라졌습니다 — 재추출 시작…');
try {
  // 실패해도 직전 데이터(loc_ko.js)는 그대로 유지(폴백). 성공해야 덮어씀.
  cp.execFileSync(process.execPath, [path.join(__dirname, 'extract_loc.js')],
    { stdio: 'inherit', env: process.env });
  console.log('✅ 재추출 완료 — 앱을 새로고침하면 최신 데이터가 반영됩니다.');
} catch(e){
  console.error('❌ 재추출 실패 — 직전 데이터를 그대로 사용합니다(폴백).');
  process.exit(1);
}
