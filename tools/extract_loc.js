// ============================================================
//  [역할: 백업(2차 소스)] 주력은 tools/build_from_api.js(spire-codex API).
//   이 스크립트는 게임 파일 직접추출(GDRE/ILSpy) 예비 파이프라인 —
//   1차(API)가 중단될 때만 쓰는 백업. 평소엔 실행할 필요 없음. (자세히: tools/README.md)
//  ------------------------------------------------------------
//  extract_loc.js — STS2 pck에서 한글 로컬라이제이션(JSON 평문) 추출
//  게임 pck 안에 "CARD_ID.title":"한글", "CARD_ID.description":"한글" 형태로
//  로컬라이제이션이 평문 JSON으로 들어있음. 그 구간을 읽어 파싱 →
//  db.js의 카드/유물 ID와 매칭 → data/cards_ko.json, relics_ko.json 생성.
//  용법: node extract_loc.js
//  (환경변수 STS2_PCK 로 pck 경로 지정 가능. KO_FROM/KO_TO 로 스캔범위 조정)
// ============================================================
const fs = require('fs'), vm = require('vm'), path = require('path');
const PROJ = path.join(__dirname, '..');
const PCK = process.env.STS2_PCK ||
  "C:/Program Files (x86)/Steam/steamapps/common/Slay the Spire 2/SlayTheSpire2.pck";

// 한글 로컬 구간(실측): 타이틀이 1,878,339,306 ~ 1,879,030,391 에 몰려 있음.
// 설명(description)까지 포함하도록 여유롭게 잡는다.
const HANGUL = /[가-힣]/;  // 한글 음절

function readRegion(from, to){
  const fd = fs.openSync(PCK, 'r');
  const len = to - from;
  const buf = Buffer.alloc(len);
  fs.readSync(fd, buf, 0, len, from);
  fs.closeSync(fd);
  return buf.toString('utf8');
}

// 한글 로컬라이제이션 구간 자동 탐지 (패치로 위치가 바뀌어도 대응)
//  `.title": "` 뒤에 한글(UTF-8 EA~ED)이 오는 위치들의 최소/최대 오프셋을 찾는다.
function findKoRegion(){
  const fd = fs.openSync(PCK, 'r');
  const size = fs.fstatSync(fd).size;
  const pat = Buffer.from('.title": "', 'latin1'); // 10바이트
  const CH = 64 * 1024 * 1024, overlap = 32;
  const buf = Buffer.alloc(CH + overlap);
  let min = -1, max = -1, pos = 0;
  while (pos < size){
    const n = fs.readSync(fd, buf, 0, Math.min(CH + overlap, size - pos), pos);
    const view = buf.subarray(0, n);
    let i = 0;
    while ((i = view.indexOf(pat, i)) !== -1){
      const lead = view[i + pat.length];
      if (lead >= 0xEA && lead <= 0xED){ const abs = pos + i; if (min < 0) min = abs; max = abs; }
      i += pat.length;
    }
    pos += CH; // overlap 은 다음 청크에서 재스캔
  }
  fs.closeSync(fd);
  return { min, max };
}

let FROM, TO;
if (process.env.KO_FROM && process.env.KO_TO){
  FROM = +process.env.KO_FROM; TO = +process.env.KO_TO;
} else {
  console.error('한글 로컬 구간 자동 탐지 중… (pck 스캔, 20~40초)');
  const r = findKoRegion();
  if (r.min < 0) throw new Error('한글 로컬라이제이션 구간을 찾지 못했습니다. 게임 버전/언어를 확인하세요.');
  FROM = Math.max(0, r.min - 40000);
  TO = r.max + 40000;
  console.error(`한글 구간: ${FROM} ~ ${TO} (${((TO-FROM)/1024).toFixed(0)}KB)`);
}

function norm(nm){
  return (nm||'').toUpperCase().replace(/[\s\-]/g,'_').replace(/[^A-Z0-9_]/g,'').replace(/_+/g,'_');
}

const s = readRegion(FROM, TO);
// "KEY.title": "값"  /  "KEY.description": "값"  (값 안의 \" 와 이스케이프 허용)
const re = new RegExp('"([A-Z0-9_]+)\\.(title|description)"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"', 'g');
const loc = {}; let m, n = 0;
while ((m = re.exec(s))){
  const id = m[1], field = m[2];
  // JSON 문자열 이스케이프 복원
  let val;
  try { val = JSON.parse('"' + m[3] + '"'); } catch(e){ val = m[3]; }
  // 한글 값만 채택(제목은 반드시 한글). 이미 한글값이 있으면 덮어쓰지 않음.
  if (field === 'title' && !HANGUL.test(val)) continue;
  loc[id] = loc[id] || {};
  if (loc[id][field] && HANGUL.test(loc[id][field])) continue;
  loc[id][field] = val;
  n++;
}
console.log(`추출된 title/description 쌍: ${n},  고유 ID: ${Object.keys(loc).length}`);

// db.js 로드
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(PROJ,'db.js'),'utf8'), ctx, {filename:'db.js'});
const DB = vm.runInContext('DB', ctx);  // const는 컨텍스트 속성이 안 되므로 평가로 꺼냄

function build(entries){
  const out = {}; let hit = 0; const miss = [];
  for (const {id, ch} of entries){
    const base = norm(id);
    // 캐릭터 접미사 키(STRIKE_IRONCLAD 등)를 먼저, 없으면 기본 키
    const tryKeys = ch && ch !== 'colorless' ? [base + '_' + ch.toUpperCase(), base] : [base];
    let picked = null;
    for (const k of tryKeys){ if (loc[k] && loc[k].title && HANGUL.test(loc[k].title)){ picked = k; break; } }
    if (picked){ out[base] = {en:id, title:loc[picked].title, description:loc[picked].description||''}; hit++; }
    else miss.push(id);
  }
  return {out, hit, miss};
}

const cardEntries = [];
for (const ch of Object.keys(DB.cards)) for (const key of Object.keys(DB.cards[ch]))
  cardEntries.push({id: DB.cards[ch][key].id, ch});
const relicEntries = Object.keys(DB.relics||{}).map(k => ({id: DB.relics[k].id, ch: DB.relics[k].char}));

const C = build(cardEntries), R = build(relicEntries);
console.log(`카드 매칭: ${C.hit}/${cardEntries.length}   (미매칭 ${C.miss.length})`);
console.log(`유물 매칭: ${R.hit}/${relicEntries.length}   (미매칭 ${R.miss.length})`);
if (C.miss.length) console.log('카드 미매칭 예시:', C.miss.slice(0,20).join(', '));

console.log('\n=== 샘플 ===');
for (const k of ['STRIKE','DEFEND','BASH','BLOODLETTING','STONE_ARMOR','HEADBUTT'])
  if (C.out[k]) console.log(`  ${k} → ${C.out[k].title}  |  ${(C.out[k].description||'').replace(/\n/g,' ').slice(0,50)}`);

fs.mkdirSync(path.join(PROJ,'data'), {recursive:true});
fs.writeFileSync(path.join(PROJ,'data','cards_ko.json'), JSON.stringify(C.out, null, 1));
fs.writeFileSync(path.join(PROJ,'data','relics_ko.json'), JSON.stringify(R.out, null, 1));
// 전체 로컬(참고용, 카드/유물 외 이벤트 등 포함)도 저장
fs.writeFileSync(path.join(PROJ,'data','all_loc_ko.json'), JSON.stringify(loc, null, 0));

// ── 브라우저용 loc_ko.js (file:// 에선 JSON fetch 불가 → <script> 전역으로) ──
// 영어 id 로 키를 잡아 앱에서 바로 조회. {t:공식한글이름, d:공식한글설명}
const off = {};
for (const k in C.out){ const e = C.out[k]; off[e.en] = {t:e.title, d:e.description||''}; }
for (const k in R.out){ const e = R.out[k]; if(!off[e.en]) off[e.en] = {t:e.title, d:e.description||''}; }
let rel = {};
try { rel = JSON.parse(fs.readFileSync(path.dirname(PCK)+"/release_info.json","utf8")); } catch(e){}
const ver = rel.version || '?';
const js = '// 게임에서 추출한 공식 한글 이름/설명 (개인용). extract_loc.js 가 생성.\n' +
  '// STS2 ' + ver + ' 기준\n' +
  'window.KO_OFF_VERSION = ' + JSON.stringify(ver) + ';\n' +
  'window.KO_OFF = ' + JSON.stringify(off) + ';\n';
fs.writeFileSync(path.join(PROJ,'data','loc_ko.js'), js);
// 버전 스탬프(패치 감지용)
fs.writeFileSync(path.join(PROJ,'data','extracted_version.json'), JSON.stringify({
  version: ver, commit: rel.commit||null, main_assembly_hash: rel.main_assembly_hash||null,
  extracted_at: new Date().toISOString(), items: Object.keys(off).length
}, null, 2));
console.log('\n저장: data/cards_ko.json, data/relics_ko.json, data/all_loc_ko.json, data/loc_ko.js, data/extracted_version.json');
console.log('loc_ko.js 항목 수:', Object.keys(off).length, '| STS2', ver);
