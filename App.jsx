// ============================================================
//  SPIRE CODEX  —  Slay the Spire 2 런 기록 & 복기 앱
//  단일 파일 React 컴포넌트. 새 Vite + React 프로젝트의
//  src/App.jsx 를 이 내용으로 통째로 바꾸면 바로 동작합니다.
//
//  내장 기능:
//   1) 런 기록이 새로고침해도 안 사라짐 (localStorage 저장)
//   2) 기록을 JSON 파일로 백업 / 다시 불러오기 (PWA 안전장치)
//   3) 외부 라이브러리 없이 혼자 돌아감 (붙여넣으면 끝)
// ============================================================

import { useState, useEffect, useMemo, useRef } from "react";

// ────────────────────────────────────────────────────────────
//  ⚙️  게임 데이터 — 여기만 네 게임에 맞게 고치면 됩니다.
//  ※ STS2는 업데이트로 캐릭터/난이도가 바뀌므로, 정확한 목록은
//     게임에서 확인해서 아래 배열을 직접 수정하세요.
// ────────────────────────────────────────────────────────────
const CHARACTERS = [
  "아이언클래드",
  "사일런트",
  "디펙트",
  "와쳐",
  "(다섯 번째 캐릭터)", // ← 실제 이름으로 교체하세요
];

const MAX_ASCENSION = 20; // STS2 최고 어센션이 다르면 숫자만 바꾸세요

// ────────────────────────────────────────────────────────────
//  💾  저장소 — localStorage 사용. 안 되는 환경에선 메모리로 자동 대체.
//      (어떤 경우에도 앱이 멈추지 않도록 try/catch 로 감쌌습니다.)
// ────────────────────────────────────────────────────────────
const STORAGE_KEY = "spire-codex-runs-v1";
let memoryFallback = [];

function loadRuns() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return memoryFallback;
  }
}
function persistRuns(runs) {
  memoryFallback = runs;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  } catch {
    /* 메모리 대체본은 이미 갱신됨 */
  }
}

// 빈 폼 기본값
function blankForm() {
  return {
    character: CHARACTERS[0],
    ascension: 0,
    result: "win", // "win" | "loss"
    floor: "",
    killedBy: "",
    finalHp: "",
    notes: "",
  };
}

// ────────────────────────────────────────────────────────────
//  메인 컴포넌트
// ────────────────────────────────────────────────────────────
export default function App() {
  const [runs, setRuns] = useState(loadRuns);
  const [tab, setTab] = useState("log"); // log | stats | review
  const [form, setForm] = useState(blankForm);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);

  // 런이 바뀔 때마다 자동 저장
  useEffect(() => {
    persistRuns(runs);
  }, [runs]);

  // 토스트 메시지 자동 사라짐
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addRun() {
    const newRun = {
      id:
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2)),
      date: new Date().toISOString(),
      character: form.character,
      ascension: Number(form.ascension) || 0,
      result: form.result,
      floor: form.floor === "" ? null : Number(form.floor),
      killedBy: form.killedBy.trim(),
      finalHp: form.finalHp === "" ? null : Number(form.finalHp),
      notes: form.notes.trim(),
    };
    setRuns((prev) => [newRun, ...prev]);
    setForm(blankForm());
    setToast("런이 기록되었습니다");
  }

  function deleteRun(id) {
    setRuns((prev) => prev.filter((r) => r.id !== id));
    setToast("런을 삭제했습니다");
  }

  // ── 백업: JSON 파일로 내보내기 ──
  function exportRuns() {
    try {
      const blob = new Blob([JSON.stringify(runs, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `spire-codex-backup-${stamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setToast("백업 파일을 내려받았습니다");
    } catch {
      setToast("백업에 실패했습니다");
    }
  }

  // ── 복원: JSON 파일에서 불러오기 ──
  function importRuns(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data)) throw new Error("형식이 올바르지 않습니다");
        // 기존 기록과 합치되, 같은 id는 중복 제거
        setRuns((prev) => {
          const seen = new Set(prev.map((r) => r.id));
          const merged = [...prev];
          for (const r of data) if (r && r.id && !seen.has(r.id)) merged.push(r);
          merged.sort((a, b) => (a.date < b.date ? 1 : -1));
          return merged;
        });
        setToast("백업을 불러왔습니다");
      } catch {
        setToast("불러오기에 실패했습니다 — 파일을 확인하세요");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // 같은 파일 다시 선택 가능하게 초기화
  }

  // ── 통계 계산 ──
  const stats = useMemo(() => computeStats(runs), [runs]);

  return (
    <div className="sc-root">
      <style>{CSS}</style>

      <header className="sc-header">
        <div className="sc-eyebrow">RUN TRACKER &amp; CODEX</div>
        <h1 className="sc-title">SPIRE CODEX</h1>
        <p className="sc-sub">
          기록한 런 {runs.length}회 · 승리 {stats.wins}회 · 승률{" "}
          {stats.total ? Math.round(stats.winRate * 100) : 0}%
        </p>
      </header>

      <nav className="sc-tabs">
        <TabBtn id="log" tab={tab} setTab={setTab} label="런 기록" />
        <TabBtn id="stats" tab={tab} setTab={setTab} label="통계" />
        <TabBtn id="review" tab={tab} setTab={setTab} label="런 복기" />
      </nav>

      <main className="sc-main">
        {tab === "log" && (
          <LogTab form={form} updateField={updateField} addRun={addRun} />
        )}
        {tab === "stats" && <StatsTab stats={stats} />}
        {tab === "review" && (
          <ReviewTab
            runs={runs}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            deleteRun={deleteRun}
          />
        )}
      </main>

      <footer className="sc-footer">
        <button className="sc-ghost" onClick={exportRuns}>
          ⬇ 기록 백업
        </button>
        <button
          className="sc-ghost"
          onClick={() => fileInputRef.current?.click()}
        >
          ⬆ 백업 불러오기
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={importRuns}
          style={{ display: "none" }}
        />
      </footer>

      {toast && <div className="sc-toast">{toast}</div>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
//  탭 버튼
// ────────────────────────────────────────────────────────────
function TabBtn({ id, tab, setTab, label }) {
  return (
    <button
      className={"sc-tab" + (tab === id ? " sc-tab-on" : "")}
      onClick={() => setTab(id)}
    >
      {label}
    </button>
  );
}

// ────────────────────────────────────────────────────────────
//  런 기록 탭
// ────────────────────────────────────────────────────────────
function LogTab({ form, updateField, addRun }) {
  return (
    <section className="sc-card">
      <h2 className="sc-card-title">새 런 기록</h2>

      <div className="sc-grid">
        <Field label="캐릭터">
          <select
            className="sc-input"
            value={form.character}
            onChange={(e) => updateField("character", e.target.value)}
          >
            {CHARACTERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="어센션">
          <select
            className="sc-input"
            value={form.ascension}
            onChange={(e) => updateField("ascension", e.target.value)}
          >
            {Array.from({ length: MAX_ASCENSION + 1 }, (_, i) => (
              <option key={i} value={i}>
                A{i}
              </option>
            ))}
          </select>
        </Field>

        <Field label="결과">
          <div className="sc-toggle">
            <button
              className={
                "sc-toggle-btn" + (form.result === "win" ? " sc-win" : "")
              }
              onClick={() => updateField("result", "win")}
            >
              승리
            </button>
            <button
              className={
                "sc-toggle-btn" + (form.result === "loss" ? " sc-loss" : "")
              }
              onClick={() => updateField("result", "loss")}
            >
              패배
            </button>
          </div>
        </Field>

        <Field label="도달 층">
          <input
            className="sc-input"
            type="number"
            min="0"
            placeholder="예: 51"
            value={form.floor}
            onChange={(e) => updateField("floor", e.target.value)}
          />
        </Field>

        <Field label="사망 원인 (패배 시)">
          <input
            className="sc-input"
            type="text"
            placeholder="예: 최종 보스, 엘리트…"
            value={form.killedBy}
            onChange={(e) => updateField("killedBy", e.target.value)}
          />
        </Field>

        <Field label="최종 체력">
          <input
            className="sc-input"
            type="number"
            min="0"
            placeholder="예: 24"
            value={form.finalHp}
            onChange={(e) => updateField("finalHp", e.target.value)}
          />
        </Field>
      </div>

      <Field label="덱 요약 / 메모 (복기용)">
        <textarea
          className="sc-input sc-textarea"
          rows={3}
          placeholder="핵심 카드, 유물, 어떤 순간에 무너졌는지 등 자유롭게…"
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </Field>

      <button className="sc-primary" onClick={addRun}>
        이 런 기록하기
      </button>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="sc-field">
      <span className="sc-field-label">{label}</span>
      {children}
    </label>
  );
}

// ────────────────────────────────────────────────────────────
//  통계 탭
// ────────────────────────────────────────────────────────────
function StatsTab({ stats }) {
  if (stats.total === 0) {
    return (
      <section className="sc-card sc-empty">
        아직 기록된 런이 없습니다. <br />
        <span className="sc-muted">‘런 기록’ 탭에서 첫 런을 남겨보세요.</span>
      </section>
    );
  }
  return (
    <section className="sc-stats">
      <div className="sc-stat-row">
        <StatBox label="총 런" value={stats.total} />
        <StatBox label="승리" value={stats.wins} accent="win" />
        <StatBox
          label="승률"
          value={Math.round(stats.winRate * 100) + "%"}
          accent="ember"
        />
        <StatBox label="현재 연승" value={stats.streak} />
      </div>

      <div className="sc-stat-row">
        <StatBox
          label="평균 도달 층"
          value={stats.avgFloor == null ? "—" : stats.avgFloor}
        />
        <StatBox
          label="최고 도달 층"
          value={stats.maxFloor == null ? "—" : stats.maxFloor}
        />
      </div>

      <div className="sc-card">
        <h2 className="sc-card-title">캐릭터별 승률</h2>
        <div className="sc-bars">
          {stats.byCharacter.map((c) => (
            <div className="sc-bar-row" key={c.character}>
              <span className="sc-bar-label">{c.character}</span>
              <div className="sc-bar-track">
                <div
                  className="sc-bar-fill"
                  style={{ width: Math.round(c.winRate * 100) + "%" }}
                />
              </div>
              <span className="sc-bar-val">
                {Math.round(c.winRate * 100)}%{" "}
                <span className="sc-muted">
                  ({c.wins}/{c.total})
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatBox({ label, value, accent }) {
  return (
    <div className={"sc-statbox" + (accent ? " sc-acc-" + accent : "")}>
      <div className="sc-statbox-val">{value}</div>
      <div className="sc-statbox-label">{label}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
//  런 복기 탭
// ────────────────────────────────────────────────────────────
function ReviewTab({ runs, expandedId, setExpandedId, deleteRun }) {
  if (runs.length === 0) {
    return (
      <section className="sc-card sc-empty">
        복기할 런이 없습니다. <br />
        <span className="sc-muted">먼저 런을 기록해 주세요.</span>
      </section>
    );
  }
  return (
    <section className="sc-list">
      {runs.map((r) => {
        const open = expandedId === r.id;
        return (
          <div
            key={r.id}
            className={"sc-run" + (r.result === "win" ? " sc-run-win" : "")}
          >
            <button
              className="sc-run-head"
              onClick={() => setExpandedId(open ? null : r.id)}
            >
              <span
                className={
                  "sc-pill " + (r.result === "win" ? "sc-pill-win" : "sc-pill-loss")
                }
              >
                {r.result === "win" ? "승리" : "패배"}
              </span>
              <span className="sc-run-char">{r.character}</span>
              <span className="sc-muted">A{r.ascension}</span>
              <span className="sc-run-meta">
                {r.floor != null ? `${r.floor}층` : "—"} ·{" "}
                {fmtDate(r.date)}
              </span>
              <span className="sc-chevron">{open ? "▾" : "▸"}</span>
            </button>

            {open && (
              <div className="sc-run-body">
                <div className="sc-run-facts">
                  {r.killedBy && (
                    <span>
                      사망 원인: <b>{r.killedBy}</b>
                    </span>
                  )}
                  {r.finalHp != null && (
                    <span>
                      최종 체력: <b>{r.finalHp}</b>
                    </span>
                  )}
                </div>
                {r.notes ? (
                  <p className="sc-run-notes">{r.notes}</p>
                ) : (
                  <p className="sc-run-notes sc-muted">메모 없음</p>
                )}
                <button
                  className="sc-danger"
                  onClick={() => deleteRun(r.id)}
                >
                  이 런 삭제
                </button>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

// ────────────────────────────────────────────────────────────
//  유틸 & 통계 계산
// ────────────────────────────────────────────────────────────
function computeStats(runs) {
  const total = runs.length;
  const wins = runs.filter((r) => r.result === "win").length;
  const winRate = total ? wins / total : 0;

  const floors = runs.map((r) => r.floor).filter((f) => f != null);
  const avgFloor = floors.length
    ? Math.round(floors.reduce((a, b) => a + b, 0) / floors.length)
    : null;
  const maxFloor = floors.length ? Math.max(...floors) : null;

  // 현재 연승 (가장 최근 런부터 연속 승리 수)
  let streak = 0;
  for (const r of runs) {
    if (r.result === "win") streak++;
    else break;
  }

  // 캐릭터별 승률
  const map = {};
  for (const r of runs) {
    if (!map[r.character]) map[r.character] = { total: 0, wins: 0 };
    map[r.character].total++;
    if (r.result === "win") map[r.character].wins++;
  }
  const byCharacter = Object.entries(map)
    .map(([character, v]) => ({
      character,
      total: v.total,
      wins: v.wins,
      winRate: v.total ? v.wins / v.total : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate);

  return { total, wins, winRate, avgFloor, maxFloor, streak, byCharacter };
}

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
      d.getDate()
    ).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

// ────────────────────────────────────────────────────────────
//  스타일 — 다크 ‘대장간/코덱스’ 테마. 외부 폰트/CSS 불필요.
// ────────────────────────────────────────────────────────────
const CSS = `
.sc-root{
  --bg:#15131c; --panel:#1e1b29; --panel-2:#262234;
  --line:#332e45; --text:#e9e6f2; --muted:#9a93ac;
  --ember:#f0833e; --ember-soft:#ffae73;
  --win:#54d6a0; --loss:#e5556e;
  min-height:100vh; background:
    radial-gradient(1200px 600px at 50% -10%, #2a2238 0%, transparent 60%),
    var(--bg);
  color:var(--text);
  font-family: ui-sans-serif, system-ui, "Segoe UI", Roboto, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  -webkit-font-smoothing:antialiased;
  padding:0 16px 96px;
}
.sc-root *{box-sizing:border-box;}

.sc-header{ max-width:760px; margin:0 auto; padding:40px 0 18px; text-align:center; }
.sc-eyebrow{
  font-size:11px; letter-spacing:.32em; color:var(--ember);
  font-weight:700; text-transform:uppercase; margin-bottom:10px;
}
.sc-title{
  margin:0; font-size:clamp(34px,7vw,52px); font-weight:800;
  letter-spacing:.04em;
  background:linear-gradient(180deg,#fff 0%, var(--ember-soft) 130%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
.sc-sub{ margin:10px 0 0; color:var(--muted); font-size:14px;
  font-variant-numeric:tabular-nums; }

.sc-tabs{ max-width:760px; margin:22px auto 0; display:flex; gap:6px;
  background:var(--panel); border:1px solid var(--line);
  border-radius:14px; padding:6px; }
.sc-tab{
  flex:1; padding:11px 12px; border:0; cursor:pointer; border-radius:9px;
  background:transparent; color:var(--muted); font-size:14px; font-weight:600;
  transition:.15s;
}
.sc-tab:hover{ color:var(--text); }
.sc-tab-on{ background:var(--panel-2); color:var(--text);
  box-shadow:inset 0 0 0 1px var(--line); }

.sc-main{ max-width:760px; margin:18px auto 0; }

.sc-card{ background:var(--panel); border:1px solid var(--line);
  border-radius:16px; padding:22px; }
.sc-card-title{ margin:0 0 16px; font-size:15px; letter-spacing:.02em;
  color:var(--text); font-weight:700; }

.sc-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
@media (max-width:560px){ .sc-grid{ grid-template-columns:1fr; } }

.sc-field{ display:flex; flex-direction:column; gap:7px; }
.sc-field-label{ font-size:12px; color:var(--muted); font-weight:600;
  letter-spacing:.02em; }

.sc-input{
  width:100%; padding:11px 12px; background:var(--panel-2);
  border:1px solid var(--line); border-radius:10px; color:var(--text);
  font-size:14px; outline:none; transition:.15s; font-family:inherit;
}
.sc-input:focus{ border-color:var(--ember); box-shadow:0 0 0 3px rgba(240,131,62,.18); }
.sc-textarea{ resize:vertical; margin-top:0; }
label.sc-field:has(.sc-textarea){ margin-top:14px; }

.sc-toggle{ display:flex; gap:6px; }
.sc-toggle-btn{
  flex:1; padding:11px 0; border:1px solid var(--line); cursor:pointer;
  background:var(--panel-2); color:var(--muted); border-radius:10px;
  font-size:14px; font-weight:600; transition:.15s;
}
.sc-toggle-btn.sc-win{ background:rgba(84,214,160,.16); color:var(--win);
  border-color:var(--win); }
.sc-toggle-btn.sc-loss{ background:rgba(229,85,110,.16); color:var(--loss);
  border-color:var(--loss); }

.sc-primary{
  margin-top:20px; width:100%; padding:14px; border:0; cursor:pointer;
  border-radius:12px; font-size:15px; font-weight:700; color:#1a1206;
  background:linear-gradient(180deg,var(--ember-soft),var(--ember));
  box-shadow:0 6px 18px rgba(240,131,62,.28); transition:.15s;
}
.sc-primary:hover{ filter:brightness(1.05); transform:translateY(-1px); }
.sc-primary:active{ transform:translateY(0); }

/* 통계 */
.sc-stats{ display:flex; flex-direction:column; gap:16px; }
.sc-stat-row{ display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
@media (max-width:560px){ .sc-stat-row{ grid-template-columns:repeat(2,1fr); } }
.sc-statbox{ background:var(--panel); border:1px solid var(--line);
  border-radius:14px; padding:18px 14px; text-align:center; }
.sc-statbox-val{ font-size:30px; font-weight:800; letter-spacing:.01em;
  font-variant-numeric:tabular-nums;
  font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace; }
.sc-statbox-label{ margin-top:6px; font-size:12px; color:var(--muted);
  font-weight:600; }
.sc-acc-win .sc-statbox-val{ color:var(--win); }
.sc-acc-ember .sc-statbox-val{ color:var(--ember); }

.sc-bars{ display:flex; flex-direction:column; gap:12px; }
.sc-bar-row{ display:grid; grid-template-columns:96px 1fr auto; gap:12px;
  align-items:center; }
.sc-bar-label{ font-size:13px; color:var(--text); font-weight:600;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.sc-bar-track{ height:10px; background:var(--panel-2);
  border-radius:99px; overflow:hidden; border:1px solid var(--line); }
.sc-bar-fill{ height:100%;
  background:linear-gradient(90deg,var(--ember),var(--ember-soft));
  border-radius:99px; transition:width .4s ease; }
.sc-bar-val{ font-size:13px; font-variant-numeric:tabular-nums;
  font-weight:700; white-space:nowrap; }

/* 복기 리스트 */
.sc-list{ display:flex; flex-direction:column; gap:10px; }
.sc-run{ background:var(--panel); border:1px solid var(--line);
  border-left:3px solid var(--loss); border-radius:12px; overflow:hidden; }
.sc-run-win{ border-left-color:var(--win); }
.sc-run-head{ width:100%; display:flex; align-items:center; gap:10px;
  padding:14px 16px; background:transparent; border:0; cursor:pointer;
  color:var(--text); font-size:14px; text-align:left; }
.sc-run-head:hover{ background:var(--panel-2); }
.sc-pill{ font-size:11px; font-weight:700; padding:3px 9px; border-radius:99px;
  letter-spacing:.02em; }
.sc-pill-win{ background:rgba(84,214,160,.16); color:var(--win); }
.sc-pill-loss{ background:rgba(229,85,110,.16); color:var(--loss); }
.sc-run-char{ font-weight:700; }
.sc-run-meta{ margin-left:auto; color:var(--muted); font-size:12.5px;
  font-variant-numeric:tabular-nums; }
.sc-chevron{ color:var(--muted); width:14px; text-align:center; }
.sc-run-body{ padding:0 16px 16px; border-top:1px solid var(--line); }
.sc-run-facts{ display:flex; gap:18px; flex-wrap:wrap; margin:14px 0 8px;
  font-size:13px; color:var(--muted); }
.sc-run-facts b{ color:var(--text); }
.sc-run-notes{ margin:8px 0 14px; font-size:14px; line-height:1.6;
  white-space:pre-wrap; }

.sc-danger{ background:transparent; border:1px solid var(--loss);
  color:var(--loss); padding:8px 14px; border-radius:9px; cursor:pointer;
  font-size:13px; font-weight:600; transition:.15s; }
.sc-danger:hover{ background:rgba(229,85,110,.12); }

/* 빈 화면 */
.sc-empty{ text-align:center; padding:48px 22px; line-height:1.7; }
.sc-muted{ color:var(--muted); }

/* 푸터(백업) */
.sc-footer{ position:fixed; left:0; right:0; bottom:0;
  display:flex; gap:10px; justify-content:center;
  padding:14px 16px; background:linear-gradient(180deg,transparent,var(--bg) 40%); }
.sc-ghost{ background:var(--panel); border:1px solid var(--line);
  color:var(--text); padding:11px 18px; border-radius:11px; cursor:pointer;
  font-size:13.5px; font-weight:600; transition:.15s; }
.sc-ghost:hover{ border-color:var(--ember); color:var(--ember-soft); }

/* 토스트 */
.sc-toast{ position:fixed; left:50%; bottom:74px; transform:translateX(-50%);
  background:var(--panel-2); border:1px solid var(--ember);
  color:var(--text); padding:11px 18px; border-radius:11px; font-size:14px;
  font-weight:600; box-shadow:0 10px 30px rgba(0,0,0,.4);
  animation:sc-pop .2s ease; }
@keyframes sc-pop{ from{opacity:0; transform:translate(-50%,8px);}
  to{opacity:1; transform:translate(-50%,0);} }
`;
