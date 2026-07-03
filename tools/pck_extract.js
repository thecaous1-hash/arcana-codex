// ============================================================
//  pck_extract.js — Godot 4 (.pck, GDPC format v3) 직접 파서/추출기
//  GUI 툴(GDRE) 없이 STS2 SlayTheSpire2.pck에서 파일 목록/파일을 추출.
//  용법:
//    node pck_extract.js list                      # 전체 파일 목록 → tools/pck_files.txt
//    node pck_extract.js grep <문자열>             # 경로에 문자열 포함된 것만 출력
//    node pck_extract.js extract <문자열> <출력폴더>  # 매칭 파일 추출
// ============================================================
const fs = require('fs');
const path = require('path');

const PCK = process.env.STS2_PCK ||
  "C:/Program Files (x86)/Steam/steamapps/common/Slay the Spire 2/SlayTheSpire2.pck";

function u32(buf, p){ return buf.readUInt32LE(p); }
function u64(buf, p){ // 53비트 이내 안전
  const lo = buf.readUInt32LE(p), hi = buf.readUInt32LE(p+4);
  return hi * 0x100000000 + lo;
}

function readDir(){
  const fd = fs.openSync(PCK, 'r');
  const head = Buffer.alloc(40);
  fs.readSync(fd, head, 0, 40, 0);
  if (head.toString('latin1', 0, 4) !== 'GDPC') throw new Error('GDPC 매직 아님');
  const packVer = u32(head, 4);
  const flags = u32(head, 20);
  const filesBase = u64(head, 24);
  const dirOffset = u64(head, 32);
  const stat = fs.fstatSync(fd);
  const dirLen = stat.size - dirOffset;
  const dir = Buffer.alloc(dirLen);
  fs.readSync(fd, dir, 0, dirLen, dirOffset);

  function parse(pad){
    let p = 0;
    const count = u32(dir, p); p += 4;
    const files = [];
    for (let i = 0; i < count; i++){
      const plen = u32(dir, p); p += 4;
      if (plen <= 0 || plen > 4096 || p + plen > dir.length) return null;
      let raw = dir.toString('utf8', p, p + plen);
      p += plen;
      if (pad) p += (4 - (plen % 4)) % 4;
      const off = u64(dir, p); p += 8;
      const size = u64(dir, p); p += 8;
      p += 16; // md5
      let fflags = 0;
      if (packVer >= 2){ fflags = u32(dir, p); p += 4; }
      const clean = raw.replace(/\0+$/,'');
      files.push({ path: clean, offset: off, size, flags: fflags });
      if (i === 0 && !clean.startsWith('res://')) return null; // 파싱 방식 틀림
    }
    return files;
  }

  let files = parse(false);
  if (!files) files = parse(true);
  fs.closeSync(fd);
  if (!files) throw new Error('디렉터리 파싱 실패 — 엔트리 형식 불일치');
  return { packVer, flags, filesBase, dirOffset, count: files.length, files };
}

function extractOne(fd, filesBase, f, outPath){
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const CH = 1 << 20;
  const buf = Buffer.alloc(Math.min(CH, f.size));
  const out = fs.openSync(outPath, 'w');
  let remaining = f.size, pos = filesBase + f.offset;
  while (remaining > 0){
    const n = Math.min(CH, remaining);
    const r = fs.readSync(fd, buf, 0, n, pos);
    if (r <= 0) break;
    fs.writeSync(out, buf, 0, r);
    remaining -= r; pos += r;
  }
  fs.closeSync(out);
}

const mode = process.argv[2] || 'list';
const d = readDir();
console.error(`pck: format v${d.packVer}, flags=${d.flags}, filesBase=${d.filesBase}, 파일 ${d.count}개`);

if (mode === 'list'){
  const outTxt = path.join(__dirname, 'pck_files.txt');
  fs.writeFileSync(outTxt, d.files.map(f => `${f.path}\t${f.size}`).join('\n'));
  console.error(`전체 목록 저장: ${outTxt}`);
  // 카테고리 요약
  const cat = {};
  for (const f of d.files){
    const ext = (f.path.match(/\.[a-z0-9]+$/i)||['(없음)'])[0].toLowerCase();
    cat[ext] = (cat[ext]||0)+1;
  }
  console.log('\n=== 확장자별 개수(상위 25) ===');
  Object.entries(cat).sort((a,b)=>b[1]-a[1]).slice(0,25)
    .forEach(([e,n])=>console.log(`${String(n).padStart(6)}  ${e}`));
}
else if (mode === 'grep'){
  const q = (process.argv[3]||'').toLowerCase();
  const hits = d.files.filter(f => f.path.toLowerCase().includes(q));
  console.log(`\n"${q}" 포함 ${hits.length}개 (상위 60):`);
  hits.slice(0,60).forEach(f => console.log(`${String(f.size).padStart(9)}  ${f.path}`));
}
else if (mode === 'extract'){
  const q = (process.argv[3]||'').toLowerCase();
  const outDir = process.argv[4] || path.join(__dirname, '..', 'assets', 'raw');
  const hits = d.files.filter(f => f.path.toLowerCase().includes(q));
  console.error(`추출 대상 ${hits.length}개 → ${outDir}`);
  const fd = fs.openSync(PCK, 'r');
  let done = 0;
  for (const f of hits){
    const rel = f.path.replace(/^res:\/\//,'');
    extractOne(fd, d.filesBase, f, path.join(outDir, rel));
    if (++done % 200 === 0) console.error(`  ${done}/${hits.length}`);
  }
  fs.closeSync(fd);
  console.error(`완료: ${done}개 추출`);
}
