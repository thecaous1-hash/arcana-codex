# tools/ — 데이터 도구 지도

이 폴더의 스크립트들은 **세 갈래**로 나뉩니다. 평소엔 **주력만** 쓰면 됩니다.

| 갈래 | 스크립트 | 언제 쓰나 |
|---|---|---|
| **① 주력 (1차 소스)** | `build_from_api.js` | **평소 사용.** spire-codex 공개 API에서 카드·유물 한글/승률통계/티어를 받아 `data/api_data.js`로 저장. 게임 패치·통계 갱신 때 다시 실행. |
| **② 백업 (2차 소스)** | 아래 GDRE/ILSpy 파이프라인 | **1차(API)가 멈췄을 때만.** 내 PC의 게임 파일을 직접 뜯어 데이터를 만듦. |
| **③ 별개 기능** | `build_run_history.js` | 런 복기용. 내 게임 런 기록(`.run`)을 `data/runs.js`로 추출. 데이터 소스와 무관. |

---

## ① 주력 — 이것만 알면 됨

```
node tools/build_from_api.js
```

- 하는 일: spire-codex.com API를 스냅샷 → `data/api_data.js` 생성.
- 언제: 게임이 패치됐거나 커뮤니티 통계를 새로 반영하고 싶을 때.
- 결과: 앱을 새로고침하면 최신 한글 이름·설명·승률·티어가 반영됨.

## ② 백업 (2차 소스) — 평소엔 실행 안 함

spire-codex API가 사라지거나 오래 멈출 때를 대비한 **예비 경로**입니다.
내 PC에 설치된 게임 파일을 [GDRE Tools](https://github.com/bruvzg/gdsdecomp)(`.pck` 복원)와
[ILSpy](https://github.com/icsharpcode/ILSpy)(`.dll` 디컴파일)로 직접 추출합니다.

| 스크립트 | 역할 |
|---|---|
| `pck_extract.js` | 게임 `SlayTheSpire2.pck`에서 파일 목록/파일 추출 (GDRE 없이도 동작) |
| `extract_loc.js` | `.pck` 안의 한글 로컬라이제이션(이름·설명) 추출 |
| `parse_card_stats.js` | 디컴파일한 C# 카드 소스에서 수치 추출 → `data/card_stats.js` |
| `parse_relic_stats.js` | 디컴파일한 C# 유물 소스에서 수치 추출 → `data/relic_stats.js` |
| `crop_card_art.js` | 카드/유물 아틀라스 이미지를 잘라 WebP로 저장 |
| `crop_basic_cards.js` | 캐릭터별 기본 카드(타격/수비) 그림 크롭 |
| `extract_missing_cards.js` | DB에 없는 카드 그림 추출 |
| `check_update.js` | 게임 패치 감지 시 위 백업 추출을 자동 재실행하는 도우미 |

> ⚠️ 백업 파이프라인은 **내 PC의 게임 설치 경로·GDRE/ILSpy 산출물**이 있어야 동작합니다.
> 1차(API)를 쓰는 동안에는 실행할 필요가 없습니다.

## ③ 별개 기능 — 런 복기

```
node tools/build_run_history.js
```

- 하는 일: 내 게임 런 기록(`.run`)을 앱이 읽을 `data/runs.js`로 변환.
- 데이터 소스(1차/백업)와 **무관한 별개 기능**입니다.
