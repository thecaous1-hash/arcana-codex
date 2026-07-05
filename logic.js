const GRADE_VALS = {S:5,A:4,B:3,C:2,D:1,F:0};
const SCORE_GRADE = s => s>=4.5?'S':s>=3.5?'A':s>=2.5?'B':s>=1.5?'C':s>=0.5?'D':'F';

const SCALING_TAGS = new Set(['strength','scaling','focus','stellar','stars','soul','doom','infinite',
  'permanent_scaling','star_gain','poison_amplify','shiv_amplify','orb','claw']);


function ensureDbNames() {
  if (typeof DB !== 'object' || !DB || typeof DB.cards !== 'object') return;
  const seen = new Set();
  const names = [];
  for (const [char, cards] of Object.entries(DB.cards)) {
    if (!cards || typeof cards !== 'object') continue;
    for (const card of Object.values(cards)) {
      if (!card || !card.id) continue;
      const key = `${char}::${card.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      names.push({ n: card.id, c: char });
    }
  }
  names.sort((a, b) => a.c.localeCompare(b.c) || a.n.localeCompare(b.n));
  DB.names = names;
}

ensureDbNames();


const STARTER_NAMES = new Set([
  'strike','defend','wound','burn','dazed','slimed','void',
  'bash',
  'survivor','neutralize',
  'zap','dualcast',
  'venerate',
  'soul spark',
  'shiv','debris',
]);

const STARTERS = {
  ironclad:    ['Strike','Strike','Strike','Strike','Strike','Defend','Defend','Defend','Defend','Bash'],
  silent:      ['Strike','Strike','Strike','Strike','Strike','Defend','Defend','Defend','Defend','Defend','Survivor','Neutralize'],
  defect:      ['Strike','Strike','Strike','Strike','Defend','Defend','Defend','Defend','Zap','Dualcast'],
  regent:      ['Strike','Strike','Strike','Strike','Defend','Defend','Defend','Defend','Falling Star','Venerate'],
  necrobinder: ['Strike','Strike','Strike','Strike','Defend','Defend','Defend','Defend','Bodyguard','Unleash'],
};

function isStarter(cardName) {
  const n = cardName.toLowerCase();
  if (STARTER_NAMES.has(n)) return true;
  if ((n === 'strike' || n === 'strike+') && !n.includes(' ')) return true;
  if ((n === 'defend' || n === 'defend+') && !n.includes(' ')) return true;
  return false;
}

function analyzeDeck(char, deckCards) {
  const tagCounts = {};
  const mechCounts = {};

  // Starters and bare D-tier filler don't count toward archetype detection
  const meaningfulCards = deckCards.filter(card => {
    if (isStarter(card.name)) return false;
    const data = getCard(char, card.name);
    if (data && data.tier === 'D' && (data.builds||[]).length === 0) return false;
    return true;
  });

  for (const card of meaningfulCards) {
    const data = getCard(char, card.name);
    const tags = data ? data.syn : [];
    const mechs = data ? (data.mech || []) : [];
    for (const t of tags) tagCounts[t] = (tagCounts[t]||0) + 1;
    for (const m of mechs) mechCounts[m] = (mechCounts[m]||0) + 1;
  }

  const allTagCounts = {};
  const allMechCounts = {};
  for (const card of deckCards) {
    const data = getCard(char, card.name);
    const tags = data ? data.syn : [];
    const mechs = data ? (data.mech || []) : [];
    for (const t of tags) allTagCounts[t] = (allTagCounts[t]||0) + 1;
    for (const m of mechs) allMechCounts[m] = (allMechCounts[m]||0) + 1;
  }

  // Union count: each card contributes at most 1 per tag (no double-counting syn+mech overlap)
  const allUnionCounts = {};
  for (const card of meaningfulCards) {
    const data = getCard(char, card.name);
    const allTags = new Set([...(data?.syn||[]), ...(data?.mech||[])]);
    for (const t of allTags) allUnionCounts[t] = (allUnionCounts[t]||0) + 1;
  }

  const archs = (DB.archetypes[char] || []);
  const detected = [];
  for (const arch of archs) {
    // Use union counts — each card contributes at most 1 per tag (no syn+mech double-count)
    let coreCount = 0, supportCount = 0;
    for (const t of arch.core) {
      coreCount += (allUnionCounts[t]||0);
    }
    for (const t of arch.support) {
      supportCount += (allUnionCounts[t]||0);
    }
    const coreThresh    = arch.coreThresh    ?? arch.threshold ?? 3;
    const supportThresh = arch.supportThresh ?? Math.max(1, Math.floor(coreThresh / 2));
    const meetsCore    = coreCount >= coreThresh;
    // Raised partial threshold from 60% to 75% — harder to false-trigger
    const meetsPartial = coreCount >= Math.ceil(coreThresh * 0.75) && supportCount >= supportThresh;
    if (meetsCore || meetsPartial) {
      const strength = Math.min(1, (coreCount / coreThresh) * 0.65 + (supportCount / Math.max(supportThresh,1)) * 0.35);
      // Tiebreaker: prefer arch where more cards list it as PRIMARY (first) build
      const primaryCount = meaningfulCards.filter(c => {
        const d = getCard(char, c.name);
        const builds = (d?.builds||[]).filter(b=>b!=='any');
        return builds.length > 0 && builds[0] === arch.id;
      }).length;
      detected.push({arch, strength: Math.min(1, strength), primaryCount});
    }
  }
  // Sort by strength, break ties by how many cards list this as primary build
  detected.sort((a,b) => b.strength - a.strength || b.primaryCount - a.primaryCount);

  return {detected, tagCounts: allTagCounts, mechCounts: allMechCounts, total: deckCards.length,
    meaningfulCount: meaningfulCards.length,
    isUndefined: detected.length === 0,
    hasTag: t => (allTagCounts[t]||0) > 0,
    hasMech: m => (allMechCounts[m]||0) > 0,
    tagCount: t => (allTagCounts[t]||0),
    mechCount: m => (allMechCounts[m]||0),
    unionCount: t => (allUnionCounts[t]||0),
  };
}

function scoreCard(cardName, char, da, floor, act, deckCards, encounter, equippedRelics) {
  encounter = encounter || 'normal';
  equippedRelics = equippedRelics || [];
  if (typeof canonEN === 'function') cardName = canonEN(cardName);
  const data = getCard(char, cardName);
  if (!data) {
    return {name:cardName, base:'C', finalScore:2, finalGrade:'C', notes:'알 수 없는 카드', synReasons:[], antiReasons:[], isBest:false};
  }

  // 기본점수: 커뮤니티 승률 DELTA(spire-codex)를 1차로, 없으면 기존 티어로 폴백 (설계 §3)
  const _dbs = (typeof dataBaseScore === 'function') ? dataBaseScore(cardName, char) : null;
  const base = GRADE_VALS[data.tier] ?? 2;
  let score = (_dbs && _dbs.score != null) ? _dbs.score : base;
  const synR = [], antiR = [];

  // Synergy - graduated with diminishing returns + saturation
  const DIMN = [1.0, 0.6, 0.3];
  let matchCount = 0;
  for (const {arch, strength} of da.detected) {
    if (matchCount >= DIMN.length) break;
    for (const tag of data.syn) {
      if (arch.core.includes(tag) || arch.support.includes(tag) || arch.id === tag) {
        const satCount = da.unionCount(tag);
        const satMult = satCount >= 7 ? 0.35 : satCount >= 4 ? 0.65 : 1.0;
        const boost = (0.3 + strength * 0.5) * DIMN[matchCount] * satMult;
        score += boost;
        const satNote = satMult < 1 ? ` (포화)` : '';
        synR.push(`+${boost.toFixed(1)} ${koArch(arch.name)} 빌드에 적합${satNote}`);
        matchCount++;
        break;
      }
    }
  }

  // Anti-synergy - penalize cards that conflict with detected archetypes
  let antiDelta = 0;
  for (const {arch, strength} of da.detected) {
    for (const tag of (data.anti || [])) {
      if (arch.core.includes(tag) || arch.support.includes(tag)) {
        const pen = -(0.4 + strength * 0.5);
        score += pen; antiDelta += pen;
        antiR.push(`${pen.toFixed(1)} ${koArch(arch.name)} 빌드와 충돌 (${koTag(tag)})`);
        break;
      }
    }
  }
  for (const tag of (data.anti || [])) {
    if (da.unionCount(tag) >= 2) {
      const pen = -0.7;
      score += pen; antiDelta += pen;
      antiR.push(`${pen.toFixed(1)} 덱의 ${koTag(tag)} 카드에 해를 끼침`);
    }
  }
  if (antiDelta < -1.5) score += (-1.5 - antiDelta); // cap total anti penalty

  // Combo bonus (card-card)
  const deckNameSet = new Set(deckCards.map(c => norm(c.name)));
  let comboBonusTotal = 0;
  for (const combo of DB.combos) {
    if (!deckNameSet.has(norm(combo.deckCard))) continue;
    if (norm(combo.offeredCard) === norm(cardName)) {
      score += combo.bonus; comboBonusTotal += combo.bonus;
      synR.push(`▲ +${combo.bonus.toFixed(1)} ${combo.reason}`);
    }
  }

  // Relic-card combo bonus — equipped relics that synergize with this card
  if (equippedRelics.length > 0 && DB.relicCombos) {
    const equippedSet = new Set(equippedRelics.map(r => r.toLowerCase()));
    for (const rc of DB.relicCombos) {
      if (equippedSet.has(rc.relic.toLowerCase()) && norm(rc.card) === norm(cardName)) {
        score += rc.bonus;
        synR.push(`◈ +${rc.bonus.toFixed(1)} ${koName(rc.relic)} 유물과 시너지`);
      }
    }
  }

  // Relic scoreEffects — equipped relics passively boosting cards with matching tags
  if (equippedRelics.length > 0 && DB.relics) {
    const cardTags = new Set([...(data.syn||[]), ...(data.mech||[]), ...(data.builds||[]).filter(b=>b!=='any')]);
    for (const relicName of equippedRelics) {
      const rKey = relicName.toUpperCase().replace(/'/g,'').replace(/[\s\-]+/g,'_')
        .replace(/[^A-Z0-9_]/g,'').replace(/_+/g,'_').replace(/_+$/,'');
      const rd = DB.relics[rKey];
      if (!rd || !rd.scoreEffects) continue;
      for (const fx of rd.scoreEffects) {
        const matchingTags = (fx.tags||[]).filter(t => cardTags.has(t));
        if (matchingTags.length > 0) {
          const boost = +(fx.bonus * Math.min(matchingTags.length, 1.5)).toFixed(1);
          if (boost >= 0.1) {
            score += boost;
            synR.push(`◈ +${boost} ${koName(rd.id)} 유물이 ${matchingTags.map(koTag).join('/')} 카드 강화`);
          }
        }
      }
    }
  }

  // Build fit bonus
  let gotFitBonus = false;
  if (data.builds && data.builds.length > 0 && da.detected.length > 0) {
    for (const {arch, strength} of da.detected) {
      if (data.builds.includes(arch.id)) {
        const fitBonus = 0.3 + strength * 0.5;
        score += fitBonus;
        synR.push(`+${fitBonus.toFixed(1)} ${koArch(arch.name)} 빌드 핵심 카드`);
        gotFitBonus = true;
        break;
      }
    }
  }

  // Archetype misfit penalty - card belongs to a different build
  if (!gotFitBonus && da.detected.length > 0 && data.builds && data.builds.length > 0) {
    const topArch = da.detected[0];
    if (topArch.strength >= 0.4) {
      const specificBuilds = data.builds.filter(b => b !== 'any');
      const fitsAnyDetected = specificBuilds.length === 0
        || specificBuilds.some(b => da.detected.some(d => d.arch.id === b));
      if (!fitsAnyDetected && specificBuilds.length > 0) {
        const pen = -(0.4 + topArch.strength * 0.5);
        score += pen;
        antiR.push(`${pen.toFixed(1)} ${koBuild(specificBuilds[0])} 카드라 ${koArch(topArch.arch.name)} 빌드와 안 맞음`);
      }
    }
  }

  // Role balance (engine / generator / payoff)
  if (data.role && da.detected.length > 0) {
    const topArch = da.detected[0];
    const archId  = topArch.arch.id;

    const enginesInDeck = deckCards.filter(c => {
      const d = getCard(char, c.name);
      return d && d.role === 'engine' && (d.builds||[]).some(b => b===archId||b==='any');
    }).length;
    const generatorsInDeck = deckCards.filter(c => {
      const d = getCard(char, c.name);
      return d && d.role === 'generator' && (d.builds||[]).some(b => b===archId||b==='any');
    }).length;
    const payoffsInDeck = deckCards.filter(c => {
      const d = getCard(char, c.name);
      return d && d.role === 'payoff' && (d.builds||[]).some(b => b===archId||b==='any');
    }).length;

    const floorEarly = floor <= 8;
    const floorLate  = floor >= 20;

    // 2+ generators counts as a functional economy even without a dedicated engine card
    const effectiveEngines = enginesInDeck + (generatorsInDeck >= 2 ? 1 : 0);

    if (data.role === 'payoff') {
      if (effectiveEngines === 0) {
        score -= 1.5;
        antiR.push(`-1.5 엔진이 없어 보상(페이오프) 카드가 무용지물`);
      } else if (effectiveEngines === 1 && generatorsInDeck < 2) {
        score -= 0.7;
        antiR.push(`-0.7 엔진은 있으나 생성기 ${generatorsInDeck}개뿐 - 보상이 자주 안 터짐`);
      } else if (effectiveEngines >= 1 && generatorsInDeck >= 2) {
        const bon = floorLate ? 0.5 : 0.2;
        score += bon;
        synR.push(`+${bon.toFixed(1)} 엔진·생성기 가동 중 - 보상이 안정적으로 발동`);
      }
      if (payoffsInDeck >= 4) {
        score -= 0.4;
        antiR.push(`-0.4 이미 보상 ${payoffsInDeck}개 - 생성기/엔진을 더 늘리세요`);
      }
    }

    if (data.role === 'engine') {
      if (enginesInDeck === 0) {
        const bon = floorEarly ? 0.6 : 0.3;
        score += bon;
        synR.push(`+${bon.toFixed(1)} 첫 엔진 카드 - 빌드 전체를 가동시킴`);
      } else if (enginesInDeck === 1) {
        score += 0.1;
        synR.push(`+0.1 두 번째 엔진 - 안정성 향상`);
      } else {
        score -= 0.4;
        antiR.push(`-0.4 이미 엔진 ${enginesInDeck}개 - 추가 엔진은 잉여`);
      }
    }

    if (data.role === 'generator') {
      if (enginesInDeck === 0 && generatorsInDeck === 0) {
        score -= 0.1;
        antiR.push(`-0.1 첫 생성기 - 곧 보상 카드를 챙기세요`);
      } else if (enginesInDeck === 0 && generatorsInDeck >= 4) {
        score -= 0.5;
        antiR.push(`-0.5 엔진 없이 생성기 ${generatorsInDeck}개 - 대신 보상 카드를 챙기세요`);
      } else if (generatorsInDeck >= 5) {
        score -= 0.5;
        antiR.push(`-0.5 이미 생성기 ${generatorsInDeck}개 - 패가 막힘`);
      } else if (generatorsInDeck >= 3 && payoffsInDeck === 0) {
        antiR.push(`(생성기 ${generatorsInDeck}개, 보상 0개 - 이제 보상 카드를 찾으세요)`);
      } else if (generatorsInDeck < 4) {
        score += 0.2;
        synR.push(`+0.2 ${koArch(topArch.arch.name)} 자원 생성에 기여`);
      }
    }
  }

  // Floor curve - continuous over 57 floors
  const hasSynScaling = data.syn.some(t => SCALING_TAGS.has(t));
  const hasMechScaling = (data.mech||[]).some(t => SCALING_TAGS.has(t));
  const isScaling = hasSynScaling || hasMechScaling;
  const hasDefense = data.syn.includes('block') || data.syn.includes('dexterity');
  const runProgress = Math.min(1.0, (floor - 1) / 56);
  const flexValue  = Math.max(0, 1.0 - runProgress * 3.5);
  const scaleValue = Math.max(0, (runProgress - 0.33) * 1.8);
  const defValue   = Math.sin(runProgress * Math.PI) * 0.8;
  if (da.isUndefined && data.syn.length >= 2) {
    const fb = +(flexValue * 0.4).toFixed(1);
    if (fb >= 0.1) { score += fb; synR.push(`+${fb} 유연한 선택 (초반 런)`); }
  }
  if (isScaling && !data.role) {
    const sb = +(scaleValue * 0.5).toFixed(1);
    if (sb >= 0.1) { score += sb; synR.push(`+${sb} 성장형 카드, 후반 런`); }
  }
  if (!da.isUndefined && hasDefense) {
    const db_ = +(defValue * 0.25).toFixed(1);
    if (db_ >= 0.1) { score += db_; synR.push(`+${db_} 중반 런에는 방어가 중요`); }
  }

  // Act phase modifiers
  if (act === 1) {
    if ((data.builds||[]).includes('any') && da.isUndefined) {
      score += 0.2; synR.push('+0.2 유연한 카드, 개방적인 1막에 좋음');
    }
    if (data.role === 'engine') {
      score += 0.3; synR.push('+0.3 엔진 카드 - 1막에 빌드를 세팅하세요');
    }
    if (data.role === 'payoff') {
      const enginesNow = deckCards.filter(c => { const d=getCard(char,c.name); return d&&d.role==='engine'; }).length;
      if (enginesNow === 0) { score -= 0.3; antiR.push('-0.3 엔진 없는 보상 카드 - 1막에는 위험한 선택'); }
    }
  } else if (act === 2) {
    if (!da.isUndefined && da.detected[0].strength >= 0.5) {
      const fitsTop = (data.builds||[]).includes(da.detected[0].arch.id) || (data.builds||[]).includes('any');
      if (fitsTop) { score += 0.2; synR.push('+0.2 확정된 빌드에 적합 (2막)'); }
    }
  } else if (act === 3) {
    if (data.role === 'payoff') {
      const eng3 = deckCards.filter(c => { const d=getCard(char,c.name); return d&&d.role==='engine'; }).length;
      const gen3 = deckCards.filter(c => { const d=getCard(char,c.name); return d&&d.role==='generator'; }).length;
      if (eng3 >= 1 && gen3 >= 2) { score += 0.4; synR.push('+0.4 보상이 안정적으로 발동 - 3막엔 가동됨'); }
    }
    if (data.role === 'engine') {
      const eng3 = deckCards.filter(c => { const d=getCard(char,c.name); return d&&d.role==='engine'; }).length;
      if (eng3 >= 1) { score -= 0.3; antiR.push('-0.3 엔진 카드 - 3막에 전환하기엔 너무 늦음'); }
    }
  } else if (act === 4) {
    if (data.role === 'payoff') {
      const eng4 = deckCards.filter(c => { const d=getCard(char,c.name); return d&&d.role==='engine'; }).length;
      const gen4 = deckCards.filter(c => { const d=getCard(char,c.name); return d&&d.role==='generator'; }).length;
      if (eng4 >= 1 && gen4 >= 2) { score += 0.5; synR.push('+0.5 엔진 완비된 보상 - 지금 전투를 끝내야 함'); }
    }
    if (score < 3.0 && !data.role) { score -= 0.5; antiR.push('-0.5 4막 - 꼭 필요한 카드만 추가할 가치가 있음'); }
  }

  // Deck size selectivity
  const deckSize = da.total;
  if (deckSize <= 16 && score < 2.5) {
    score -= 0.3; antiR.push('-0.3 덱을 날렵하게 유지 - 영향력 있는 카드만 받으세요');
  } else if (deckSize >= 26 && score < 3.5) {
    score -= 0.4; antiR.push('-0.4 큰 덱 - 강한 카드만 추가할 가치가 있음');
  }

  // Duplicate penalty
  const owned = deckCards.filter(c => norm(c.name) === norm(cardName)).length;
  if (owned > 0) {
    const pen = DB.dupePenalties[cardName] ?? (data.syn.includes('permanent_scaling') ? -1.5 : -0.8);
    const scaled = pen * (owned >= 2 ? 1.4 : 1.0);
    score += scaled;
    const dupeMsg = pen <= -10
      ? `두 번째 사본은 절대 받지 마세요 - 완전히 낭비`
      : `${scaled.toFixed(1)} 이미 ${owned}장 보유 중`;
    antiR.push(dupeMsg);
  }

  // Sly special handling - free-from-discard plays are fundamentally different from normal synergy
  const SLY_ENGINES = new Set(['tools of the trade','acrobatics','prepared','calculated gamble','serpent form']);
  const SLY_PAYOFFS = new Set(['reflex','tactician','untouchable','flick flack','ricochet','night terror','eviscerate']);
  const cardLower = cardName.toLowerCase();
  const deckLower = deckCards.map(c => c.name.toLowerCase());
  const slyEngineCount = deckLower.filter(n => SLY_ENGINES.has(n)).length;
  const slyPayoffCount = deckLower.filter(n => SLY_PAYOFFS.has(n)).length;
  const hasSlyArch = da.detected.some(d => d.arch.id === 'sly');

  if (SLY_PAYOFFS.has(cardLower) && slyEngineCount >= 1 && hasSlyArch) {
    const slyBonus = +(0.6 + Math.min(1.0, slyEngineCount * 0.3)).toFixed(1);
    score += slyBonus;
    synR.push(`+${slyBonus} 교활 보상 - 버리는 턴마다 무료 사용 (엔진 ${slyEngineCount}개)`);
  }

  // Acrobatics + Prepared infinite loop
  const SLY_LOOPERS = new Set(['acrobatics','prepared']);
  if (SLY_LOOPERS.has(cardLower)) {
    const otherLoopersInDeck = deckLower.filter(n => SLY_LOOPERS.has(n) && n !== cardLower).length;
    if (otherLoopersInDeck >= 1 && slyPayoffCount >= 2) {
      score += 0.8;
      synR.push(`+0.8 교활 무한 루프 완성 - 버리기 순환으로 무한 무료 사용`);
    }
  }

  if (SLY_ENGINES.has(cardLower) && slyPayoffCount >= 2 && hasSlyArch) {
    const engineBonus = +(0.4 + Math.min(0.6, slyPayoffCount * 0.15)).toFixed(1);
    score += engineBonus;
    synR.push(`+${engineBonus} 교활 엔진 - 버릴 때마다 보상 ${slyPayoffCount}개가 무료 발동`);
  }

  // Encounter context
  if (encounter === 'boss') {
    if ((data.syn||[]).includes('doom') && data.role === 'payoff') {
      score -= 0.4; antiR.push(`-0.4 파멸 즉사는 보스에게 불안정`);
    }
    if (hasDefense) {
      score += 0.3; synR.push(`+0.3 보스 임박 - 방어가 중요`);
    }
  } else if (encounter === 'elite') {
    if ((data.syn||[]).includes('doom') && data.role === 'payoff') {
      score += 0.3; synR.push(`+0.3 파멸 보상 - 정예는 파멸이 빠르게 쌓임`);
    }
    const hasSingleUseExhaust = data.role === 'payoff' && (data.mech||[]).includes('exhaust');
    if (hasSingleUseExhaust) {
      score -= 0.2; antiR.push(`-0.2 1회용 소진 보상 - 정예는 체력이 많음`);
    }
  }

  // Doom context (Necrobinder) - payoffs require generators to get enemies to threshold
  if (char === 'necrobinder') {
    const doomGens = deckCards.filter(c => {
      const d = getCard(char, c.name);
      return d && d.role === 'generator' && (d.syn||[]).includes('doom');
    }).length;
    const doomPayoffs = deckCards.filter(c => {
      const d = getCard(char, c.name);
      return d && d.role === 'payoff' && (d.syn||[]).includes('doom');
    }).length;
    if ((data.syn||[]).includes('doom') && data.role === 'payoff') {
      if (doomGens < 2) {
        score -= 0.6;
        antiR.push(`-0.6 파멸 보상이지만 파멸 생성기 ${doomGens}개뿐 - 적이 임계치에 못 미침`);
      } else if (doomGens >= 3 && act >= 2) {
        score += 0.4;
        synR.push(`+0.4 파멸 생성기 ${doomGens}개 - 적이 안정적으로 임계치 도달`);
      }
      if (act >= 2 && doomPayoffs >= 2) {
        antiR.push(`(참고: 파멸 즉사는 보스에게 불안정 - 대체 피해 수단을 유지하세요)`);
      }
    }
  }

  score = Math.max(0, Math.min(6, score));
  return {name:cardName, base:data.tier, finalScore:score, finalGrade:SCORE_GRADE(score),
    notes:data.notes, synReasons:synR, antiReasons:antiR, isBest:false,
    builds:data.builds||[], char, dataStat:_dbs};
}

function scoreRemoval(cardName, char, da, deckCards, equippedRelics) {
  equippedRelics = equippedRelics || [];
  if (typeof canonEN === 'function') cardName = canonEN(cardName);
  const name = cardName.toLowerCase();

  // ── 1. CURSES / STATUSES — always cut immediately ─────────────
  const CURSE_NAMES = new Set(['wound','burn','dazed','slimed','void','debris']);
  const isCurse = name.includes('curse') || CURSE_NAMES.has(name);
  if (isCurse) return {name:cardName, score:5, grade:'S',
    reason:'저주/상태이상 — 즉시 제거하세요. 해롭기만 합니다.', safeToRemove:true};

  const data      = getCard(char, cardName);
  const baseGrade = data ? data.tier : 'C';
  const baseVal   = GRADE_VALS[baseGrade] ?? 2;
  const cardRole  = data ? (data.role  || 'utility') : 'utility';
  const cardBuilds= data ? (data.builds|| []).filter(b => b !== 'any') : [];
  const cardAnti  = data ? (data.anti  || []) : [];
  const cardMech  = data ? (data.mech  || []) : [];
  const cardSyn   = data ? (data.syn   || []) : [];

  // ── IDENTIFICATION ─────────────────────────────────────────────
  const STRIKE_EXCEPTIONS = ['shining','solar','pommel','perfected','ashen','leading','setup'];
  const isStrike = name.includes('strike') && !STRIKE_EXCEPTIONS.some(x => name.includes(x));
  const isDefend = name === 'defend' || name === 'defend+';
  const UTILITY_STARTERS = new Set(['bash','bash+','survivor','survivor+','neutralize','neutralize+',
    'zap','zap+','dualcast','dualcast+','venerate','venerate+','soul spark','soul spark+']);
  const isUtilityStarter = UTILITY_STARTERS.has(name);
  const isPower = cardMech.includes('power') || cardSyn.includes('power') ||
    (data && data.notes && data.notes.toLowerCase().includes('power'));
  const isExhaust = cardMech.includes('exhaust') || cardSyn.includes('exhaust');

  // ── CONTEXT ────────────────────────────────────────────────────
  const topArch      = da.detected.length > 0 ? da.detected[0] : null;
  const topArchId    = topArch ? topArch.arch.id : null;
  const archStrength = topArch ? topArch.strength : 0;
  const isStrikeBuild = topArchId === 'strike' && archStrength >= 0.35;
  const isThinBuild = ['sly','claw','stars'].includes(topArchId) && archStrength >= 0.35;
  const deckSize = deckCards.length;

  // Deck bloat factor — bigger decks need more aggressive removal
  const bloatFactor = deckSize >= 30 ? 0.8 : deckSize >= 25 ? 0.5 : deckSize >= 20 ? 0.2 : 0;

  // ── DECK COMPOSITION ───────────────────────────────────────────
  let removedOne = false;
  const otherCards = deckCards.filter(c => {
    if (!removedOne && c.name === cardName) { removedOne = true; return false; }
    return true;
  });

  const basicStrikesLeft = otherCards.filter(c => {
    const n = c.name.toLowerCase();
    return n.includes('strike') && !STRIKE_EXCEPTIONS.some(x => n.includes(x));
  }).length;

  const basicDefendsLeft = otherCards.filter(c => {
    const n = c.name.toLowerCase();
    return n === 'defend' || n === 'defend+';
  }).length;

  // Damage sources
  const isDamageSource = c => {
    const n = c.name.toLowerCase();
    const d = getCard(char, c.name);
    if (n.includes('strike') && !STRIKE_EXCEPTIONS.some(x => n.includes(x))) return true;
    if (!d) return false;
    const m = d.mech || []; const s = d.syn || [];
    return m.includes('damage') || m.includes('multi_hit') || m.includes('aoe') ||
           m.includes('block_conversion') || m.includes('per_attack_payoff') ||
           m.includes('poison') || m.includes('doom') || m.includes('hp_drain') ||
           s.includes('damage') || (d.role === 'payoff' && s.includes('block'));
  };
  const otherDamageSources = otherCards.filter(isDamageSource).length;
  const thisIsDamageSource = isDamageSource({name: cardName});

  const realNonStrikeAtks = otherCards.filter(c => {
    const n = c.name.toLowerCase();
    if (n.includes('strike') && !STRIKE_EXCEPTIONS.some(x => n.includes(x))) return false;
    const d = getCard(char, c.name);
    if (!d) return false;
    const m = d.mech || []; const s = d.syn || [];
    return m.includes('damage') || m.includes('multi_hit') || m.includes('aoe') ||
           m.includes('block_conversion') || m.includes('poison') ||
           m.includes('doom') || m.includes('hp_drain') ||
           (d.role === 'payoff' && s.includes('block'));
  }).length;

  // Block sources
  const isBlockGen = c => {
    const n = c.name.toLowerCase();
    const d = getCard(char, c.name);
    if (n === 'defend' || n === 'defend+') return true;
    if (!d) return false;
    const m = d.mech || []; const s = d.syn || [];
    return m.includes('block') || m.includes('retain') || m.includes('delayed_block') ||
           s.includes('block') || m.includes('intangible') || m.includes('plating');
  };
  const otherBlockSources = otherCards.filter(isBlockGen).length;
  const thisIsBlockSource = isBlockGen({name: cardName});

  const realNonDefendBlock = otherCards.filter(c => {
    const n = c.name.toLowerCase();
    if (n === 'defend' || n === 'defend+') return false;
    return isBlockGen(c);
  }).length;

  // ── 2. BASIC STRIKES ──────────────────────────────────────────
  if (isStrike) {
    if (isStrikeBuild)
      return {name:cardName, score:0.5, grade:'D',
        reason:`타격 빌드 감지 — 기본 타격은 '완성된 타격'의 연료입니다. 유지하세요.`,
        safeToRemove:false};

    // Safety: need at least 2 total damage sources after the cut
    if (otherDamageSources < 2)
      return {name:cardName, score:2.0, grade:'C',
        reason:`피해 수단이 ${otherDamageSources}개만 남습니다 — 공격 카드를 먼저 추가하세요.`,
        safeToRemove:false};

    // Have real attack cards — safe to cut
    if (realNonStrikeAtks >= 1) {
      if (isThinBuild)
        return {name:cardName, score:5, grade:'S',
          reason:`기본 타격 — ${koArch(topArch.arch.name)} 빌드는 날렵한 덱이 필요합니다. 최우선 제거 대상.`,
          safeToRemove:true};
      // Bloated deck = more urgency
      const bloatBoost = bloatFactor > 0 ? ` 덱이 ${deckSize}장 — 덱 압축의 가치가 높습니다.` : '';
      return {name:cardName, score: Math.min(5, 4.5 + bloatFactor), grade:'S',
        reason:`기본 타격 — 덱 최악의 카드. 제거하면 모든 드로우가 곧바로 좋아집니다.${bloatBoost}`,
        safeToRemove:true};
    }

    // No real attacks yet but have total damage coverage — mild push
    return {name:cardName, score:3.0, grade:'B',
      reason:`기본 타격 — 제거해야 하지만, 피해를 메울 진짜 공격 카드를 곧 추가하세요.`,
      safeToRemove:true};
  }

  // ── 3. BASIC DEFENDS ──────────────────────────────────────────
  if (isDefend) {
    // If Strikes still exist, cut those first
    const strikesInDeck = deckCards.filter(c => {
      const n = c.name.toLowerCase();
      return n.includes('strike') && !STRIKE_EXCEPTIONS.some(x => n.includes(x));
    }).length;

    if (strikesInDeck > 0 && !isThinBuild)
      return {name:cardName, score:1.8, grade:'C',
        reason:`기본 타격 ${strikesInDeck}장을 먼저 제거하세요 — 수비가 타격보다 가치 있습니다.`,
        safeToRemove:false};

    // Need minimum block coverage
    if (otherBlockSources < 2)
      return {name:cardName, score:1.2, grade:'D',
        reason:`방어 수단이 ${otherBlockSources}개만 남습니다 — 제거하기엔 너무 위험합니다.`,
        safeToRemove:false};

    // Have real non-Defend block
    if (realNonDefendBlock >= 2) {
      if (isThinBuild)
        return {name:cardName, score:5, grade:'S',
          reason:`기본 수비 — ${koArch(topArch.arch.name)} 빌드는 날렵한 덱이 필요합니다. 진짜 방어 카드가 ${realNonDefendBlock}장 있습니다.`,
          safeToRemove:true};
      return {name:cardName, score: Math.min(5, 3.5 + bloatFactor), grade:'A',
        reason:`기본 수비 — 진짜 방어 수단이 ${realNonDefendBlock}개 있습니다. 더 좋은 드로우를 위해 제거해도 안전합니다.`,
        safeToRemove:true};
    }

    // Marginal — have some block but not ideal
    return {name:cardName, score:2.2, grade:'C',
      reason:`기본 수비 — 진짜 방어 카드가 ${realNonDefendBlock}장뿐. 제거 전에 더 나은 방어를 추가하는 걸 고려하세요.`,
      safeToRemove:false};
  }

  // ── 4. UTILITY STARTERS ───────────────────────────────────────
  if (isUtilityStarter) {
    if (basicStrikesLeft > 0)
      return {name:cardName, score:1.5, grade:'D',
        reason:`기본 타격 ${basicStrikesLeft}장을 먼저 제거하세요 — ${koName(cardName)}은(는) 실질적 유용성이 있습니다.`,
        safeToRemove:false};

    if (basicDefendsLeft > 0 && realNonDefendBlock < 2)
      return {name:cardName, score:1.8, grade:'C',
        reason:`${koName(cardName)}은(는) 아직 유용합니다 — 수비나 시너지 낮은 카드를 먼저 제거하는 걸 고려하세요.`,
        safeToRemove:false};

    // No starters left — utility starters are now on the block
    // Fall through to real card scoring but with a nudge
  }

  // ── SAFETY RAILS ──────────────────────────────────────────────
  if (thisIsDamageSource && otherDamageSources === 0)
    return {name:cardName, score:0.3, grade:'D',
      reason:`유일한 피해 수단 — 제거하면 아무것도 죽일 수 없습니다.`,
      safeToRemove:false};
  if (thisIsBlockSource && otherBlockSources === 0)
    return {name:cardName, score:0.3, grade:'D',
      reason:`유일한 방어 수단 — 제거하면 완전히 무방비가 됩니다.`,
      safeToRemove:false};

  // ══════════════════════════════════════════════════════════════
  //  REAL CARD SCORING
  // ══════════════════════════════════════════════════════════════

  // Build fit
  const fitsDetectedBuild = cardBuilds.length === 0 ||
    da.detected.some(d => cardBuilds.includes(d.arch.id));
  const conflictsWithBuild = archStrength >= 0.4 &&
    cardAnti.some(a => da.detected.some(d => d.arch.id === a));

  // Synergy overlap — how many of this card's tags actually appear in the rest of the deck?
  const allDeckTags = new Set();
  for (const c of otherCards) {
    const d = getCard(char, c.name);
    if (d) {
      for (const t of (d.syn||[])) allDeckTags.add(t);
      for (const t of (d.mech||[])) allDeckTags.add(t);
    }
  }
  const cardAllTags = [...cardSyn, ...cardMech];
  const tagOverlap = cardAllTags.filter(t => allDeckTags.has(t)).length;
  const isDeadWeight = tagOverlap === 0 && cardAllTags.length > 0 && !isUtilityStarter;

  // Role scarcity
  const sameRoleFit = otherCards.filter(c => {
    const d = getCard(char, c.name);
    return d && d.role === cardRole &&
      ((d.builds||[]).includes('any') || da.detected.some(det => (d.builds||[]).includes(det.arch.id)));
  }).length;
  const isOnlyEngine = cardRole === 'engine' && sameRoleFit === 0 && fitsDetectedBuild;
  const isOnlyPayoff = cardRole === 'payoff' && sameRoleFit === 0 && fitsDetectedBuild;

  // Duplicate count
  const copies = deckCards.filter(c => c.name === cardName).length;

  // Generator clog
  const deckEngines  = deckCards.filter(c => { const d=getCard(char,c.name); return d&&d.role==='engine'; }).length;
  const deckPayoffs  = deckCards.filter(c => { const d=getCard(char,c.name); return d&&d.role==='payoff'; }).length;
  const deckGens     = deckCards.filter(c => { const d=getCard(char,c.name); return d&&d.role==='generator'; }).length;
  const genClog = cardRole === 'generator' &&
    deckGens > (deckEngines + deckPayoffs) * 2 + 2 &&
    !fitsDetectedBuild && archStrength >= 0.3;

  // Relic synergy — does an equipped relic specifically reward keeping this card?
  let relicProtect = 0;
  if (equippedRelics.length > 0 && DB.relicCombos) {
    const equippedSet = new Set(equippedRelics.map(r => r.toLowerCase()));
    for (const rc of DB.relicCombos) {
      if (equippedSet.has(rc.relic.toLowerCase()) && norm(rc.card) === norm(cardName)) {
        relicProtect += rc.bonus;
      }
    }
  }

  // ── SCORE BUILDING ─────────────────────────────────────────────
  let score = 0;
  const reasons = [];

  // Base tier — lower tier = more removable
  score += Math.max(0, (3.5 - baseVal) * 0.5); // D=1.25, C=0.75, B=0.25, A/S=0

  // === PRIMARY: Build fit ===
  if (archStrength >= 0.3) {
    if (fitsDetectedBuild) {
      // Core card — protect it
      score = Math.max(0, score - archStrength * 2.5);
      if (archStrength >= 0.5) reasons.push(`${koArch(topArch.arch.name)} 빌드의 핵심`);
    } else if (cardBuilds.length > 0) {
      // Off-archetype — strong removal candidate
      const offPen = archStrength * 2.5;
      score += offPen;
      reasons.push(`빌드 밖 카드 — ${cardBuilds.map(koBuild).join('/')}용이라 ${koArch(topArch.arch.name)} 빌드와 안 맞음`);
    }
  }

  // === Dead weight — zero synergy overlap with rest of deck ===
  if (isDeadWeight && !isUtilityStarter) {
    score += 1.5;
    reasons.push(`덱의 다른 어떤 카드와도 시너지가 겹치지 않음`);
  }

  // === Conflict with build ===
  if (conflictsWithBuild) {
    score += 1.8;
    reasons.push(`${koArch(topArch.arch.name)} 빌드와 적극적으로 충돌`);
  }

  // === Power card protection — plays once then leaves deck ===
  if (isPower && fitsDetectedBuild && !conflictsWithBuild) {
    score = Math.min(score, 0.5);
    reasons.length = 0;
    reasons.push(`파워 카드 — 한 번 쓰면 드로우 더미에서 빠짐. 덱을 거의 막지 않음.`);
  }

  // === Exhaust cards self-thin — lower removal priority ===
  if (isExhaust && fitsDetectedBuild && !conflictsWithBuild && score > 1.0) {
    score = Math.max(0.8, score - 0.6);
    reasons.push(`자가 소진 — 전투 중 스스로 덱에서 빠짐`);
  }

  // === Sole engine — never cut ===
  if (isOnlyEngine) {
    score = 0.2;
    reasons.length = 0;
    reasons.push(`덱의 유일한 엔진 — 제거하면 빌드가 무너짐`);
  }

  // === Sole payoff — heavily protect ===
  if (isOnlyPayoff) {
    score = Math.min(score, 0.6);
    reasons.length = 0;
    reasons.push(`${topArch ? koArch(topArch.arch.name) : '현재'} 빌드의 유일한 보상 — 지키세요`);
  }

  // === High tier protection — A/S cards rarely worth cutting ===
  if (baseVal >= 4 && !conflictsWithBuild && !genClog && !isDeadWeight) {
    score = Math.min(score, 1.0);
    if (!reasons.length) reasons.push(`${baseGrade}티어 카드 — 제거하기엔 너무 가치 있음`);
  }

  // === Generator clog ===
  if (genClog) {
    score = Math.max(score, 2.8);
    reasons.push(`생성기 과잉 — 생성기 ${deckGens}개 대 엔진/보상 ${deckEngines+deckPayoffs}개`);
  }

  // === Utility starter with no Strikes/Defends left ===
  if (isUtilityStarter) {
    const starterScore = Math.max(score, 2.5 + bloatFactor);
    score = starterScore;
    if (!reasons.length) reasons.push(`시작 카드 — 추가한 진짜 카드들보다 약함`);
  }

  // === Thin build bonus ===
  if (isThinBuild && score >= 1.5) {
    score = Math.min(5, score + 0.6);
    if (!reasons.some(r => r.includes('날렵')))
      reasons.push(`${koArch(topArch.arch.name)} 빌드는 날렵한 덱에서 이득`);
  }

  // === Deck bloat pressure ===
  if (bloatFactor > 0 && score >= 1.5) {
    score = Math.min(5, score + bloatFactor);
    if (!reasons.some(r => r.includes('장')))
      reasons.push(`덱이 ${deckSize}장 — 압축하면 안정성이 좋아짐`);
  }

  // === Duplicate handling ===
  if (copies > 1) {
    const isStackable = cardMech.includes('permanent_scaling') ||
      cardMech.includes('dexterity') || cardMech.includes('strength') ||
      cardSyn.includes('scaling');
    if (!isStackable || copies > 2) {
      const dupePen = copies > 2 ? 1.2 : 0.6;
      score += dupePen;
      reasons.push(`${copies}장 중복 — 드로우가 중복됨`);
    }
  }

  // === Relic protection — equipped relics synergize with this card ===
  if (relicProtect > 0) {
    const protection = Math.min(2.0, relicProtect * 0.5);
    score = Math.max(0.3, score - protection);
    reasons.push(`장착 유물 시너지 — 현재 유물과 함께라면 더 가치 있음`);
  }

  // === Small deck safety — don't over-thin ===
  if (deckSize <= 8 && score < 4.0) {
    score = Math.min(score, 1.5);
    if (!reasons.some(r => r.includes('얇')))
      reasons.push(`덱이 ${deckSize}장뿐 — 너무 많이 줄이지 마세요`);
  }

  score = Math.min(5, Math.max(0, score));

  // ── REASON STRING ──────────────────────────────────────────────
  let reasonStr = reasons.length ? reasons.join(' · ') + '. ' : '';
  reasonStr += score >= 4   ? '확실한 제거 — 가능할 때 빼세요.'
    : score >= 3             ? '다음 기회에 제거할 가치가 있음.'
    : score >= 2             ? '더 나쁜 카드가 없다면 제거 고려.'
    : score >= 1             ? '괜찮은 카드 — 덱이 비대하지 않으면 유지.'
    :                          '이 카드는 유지하세요.';

  return {name:cardName, score, grade:SCORE_GRADE(score), reason:reasonStr,
    safeToRemove: score >= 3.0};
}


function norm(n) {
  return (n||'').toUpperCase().replace(/[\s\-]/g,'_').replace(/[^A-Z0-9_]/g,'').replace(/_+/g,'_');
}
function getCard(char, name) {
  if (typeof canonEN === 'function') name = canonEN(name);
  const key = norm(name);
  const charCards = DB.cards[char] || {};
  if (charCards[key]) return charCards[key];
  const colorless = DB.cards.colorless || {};
  if (colorless[key]) return colorless[key];
  return null;
}
function gradeColor(g) {
  return {S:'var(--s)',A:'var(--a)',B:'var(--b)',C:'var(--c)',D:'var(--d)',F:'var(--f)'}[g]||'var(--f)';
}



function floorToAct(f) {
  return f <= 17 ? 1 : f <= 34 ? 2 : f <= 50 ? 3 : 4;
}


function getFunctionalRole(data) {
  if (!data) return 'utility';
  if (data.role) return data.role;
  const tags = new Set([...(data.syn || []), ...(data.mech || [])]);
  if (tags.has('block') || tags.has('block_retain') || tags.has('weak')) return 'defense';
  if (tags.has('permanent_scaling') || tags.has('persistent_scaling') || tags.has('scaling')) return 'engine';
  if (tags.has('energy_gain') || tags.has('draw') || tags.has('strength') || tags.has('focus') || tags.has('star_gain')) return 'generator';
  if (tags.has('block_conversion') || tags.has('block_payoff') || tags.has('per_attack_payoff') || tags.has('vulnerable_payoff') || tags.has('self_damage_payoff') || tags.has('exhaust_payoff')) return 'payoff';
  if (tags.has('vulnerable') || tags.has('debuff')) return 'setup';
  return 'utility';
}


// ── RELIC SCORING ─────────────────────────────────────────────────
// Returns a result object shaped like scoreCard output so index.html
// can render it with the same resultHTML() function.
function scoreRelic(relicName, char, da, deckCards) {
  if (!DB.relics) return null;
  if (typeof canonEN === 'function') relicName = canonEN(relicName);
  const key = relicName.toUpperCase()
    .replace(/'/g,'').replace(/[\s\-]+/g,'_')
    .replace(/[^A-Z0-9_]/g,'').replace(/_+/g,'_').replace(/_+$/,'');
  const d = DB.relics[key];
  if (!d) return null;

  const TIER_VALS = {S:5, A:4, B:3, C:2, D:1};
  let score = TIER_VALS[d.tier] ?? 2;
  const synR = [], antiR = [];

  // 1. Build fit — relic's builds vs detected archetypes
  const builds = (d.builds || []).filter(b => b !== 'any');
  if (builds.length && da.detected.length) {
    for (const {arch, strength} of da.detected) {
      if (builds.includes(arch.id)) {
        const boost = +(0.4 + strength * 1.2).toFixed(1);
        score += boost;
        synR.push('+' + boost + ' ' + koArch(arch.name) + ' 빌드에 적합');
        break;
      }
    }
  }

  // 2. scoreEffects — check relic passive bonuses vs deck tag frequency
  if (d.scoreEffects && d.scoreEffects.length) {
    const deckTagCounts = {};
    for (const card of deckCards) {
      const cd = getCard(char, card.name);
      if (!cd) continue;
      const tags = [...(cd.syn||[]), ...(cd.mech||[]),
                    ...(cd.builds||[]).filter(b=>b!=='any')];
      for (const tag of tags) {
        deckTagCounts[tag] = (deckTagCounts[tag]||0) + 1;
      }
    }
    for (const fx of d.scoreEffects) {
      const matchCount = (fx.tags||[]).reduce((s,t) => s+(deckTagCounts[t]||0), 0);
      if (matchCount > 0) {
        const boost = +(fx.bonus * Math.min(matchCount/3, 1.5)).toFixed(1);
        if (boost > 0.05) {
          score += boost;
          synR.push('+' + boost + ' 덱에 ' + fx.tags.map(koTag).join('/') + ' 카드 있음 (×' + matchCount + ')');
        }
      }
    }
  }

  // 3. relicCombos — specific relic+card pairs in deck
  const deckNames = new Set(deckCards.map(c => c.name));
  for (const rc of (DB.relicCombos || [])) {
    if (rc.relic === relicName && deckNames.has(rc.card)) {
      score += rc.bonus;
      synR.push('+' + rc.bonus.toFixed(1) + ' ' + koName(rc.card) + ' 카드와 시너지');
    }
  }

  // 4. Grade
  const GRADES  = ['S','A','B','C','D'];
  const THRESH  = [4.5, 3.5, 2.5, 1.5, 0];
  const idx2    = THRESH.findIndex(v => score >= v);
  const finalGrade = idx2 >= 0 ? GRADES[idx2] : 'D';

  return {
    name:        relicName,
    finalScore:  +score.toFixed(2),
    finalGrade,
    base:        d.tier,
    synReasons:  synR,
    antiReasons: antiR,
    builds:      builds,
    notes:       d.notes || '',
    rarity:      d.rarity || '',
    isBest:      false,
  };
}
