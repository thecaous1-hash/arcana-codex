// ============================================================
//  i18n.js  —  한국어 표시 번역 레이어
//  db.js 다음, logic.js 앞에서 로드됩니다.
//  ▸ 내부 데이터(카드 id, 콤보, 시너지 태그)는 영어 그대로 두고
//    화면에 보일 때만 한국어로 바꿉니다. (점수/콤보 로직 안 깨짐)
//  ▸ 카드/유물 이름은 한국어·영어 둘 다로 검색됩니다.
//  ※ 카드 이름 번역은 공식 한글 명칭과 다를 수 있는 추정 번역입니다.
// ============================================================

// ── 아키타입(빌드) 이름 ───────────────────────────────────────
const KO_ARCH = {
  "Strength": "힘",
  "Block": "방어",
  "Exhaust": "소진",
  "Bloodletting / Self-Damage": "사혈/자해",
  "Strike": "타격",
  "Sly / Discard": "교활/버리기",
  "Poison": "중독",
  "Shiv Spam": "비수 난사",
  "Orb / Focus Engine": "구체/집중 엔진",
  "Claw / Zero-Cost": "발톱/0코스트",
  "Stars Engine": "별 엔진",
  "Forge / Sovereign Blade": "단조/군주의 검",
  "Soul Engine": "영혼 엔진",
  "Osty / Summon": "오스티/소환",
  "Doom Stack": "파멸 중첩",
  "Status Engine": "상태이상 엔진",
};

// ── 빌드 태그(결과 카드 배지) 라벨 ────────────────────────────
const KO_BUILD = {
  strength: "힘", block: "방어", exhaust: "소진", self_damage: "사혈",
  strike: "타격", sly: "교활", poison: "중독", shiv: "비수", orb: "구체",
  claw: "발톱", stars: "별", forge: "단조", soul: "영혼", osty: "오스티",
  doom: "파멸", status: "상태이상",
};

// ── 메커니즘/시너지 태그(유물 도감 등에서 표시) ──────────────
const KO_TAG = {
  strength:"힘", scaling:"성장", block:"방어", block_retain:"방어 유지",
  block_conversion:"방어 전환", block_payoff:"방어 보상", draw:"카드 뽑기",
  weak:"약화", vulnerable:"취약", exhaust:"소진", exhaust_payoff:"소진 보상",
  exhaust_synergy:"소진 시너지", self_damage:"자해", self_damage_payoff:"자해 보상",
  hp_loss_synergy:"체력 손실 시너지", blood:"피", energy_gain:"에너지 획득",
  multi_hit:"다단 공격", strength_scaling:"힘 성장", damage:"피해", poison:"중독",
  poison_amplify:"중독 증폭", shiv:"비수", shiv_amplify:"비수 증폭", discard:"버리기",
  sly:"교활", orb:"구체", focus:"집중", doom:"파멸", soul:"영혼", stars:"별",
  star_gain:"별 획득", forge:"단조", dexterity:"민첩", intangible:"무형",
  plating:"도금", retain:"보존", aoe:"광역", healing:"회복", debuff:"디버프",
  power:"파워", permanent_scaling:"영구 성장", persistent_scaling:"지속 성장",
  infinite:"무한", stellar:"항성", claw:"발톱", strike:"타격",
};

// ── 희귀도 라벨 ──────────────────────────────────────────────
const KO_RARITY = {
  starter:"시작", common:"일반", uncommon:"고급", rare:"희귀",
  ancient:"고대", shop:"상점", event:"이벤트", special:"특수",
};

// ── 무색 카드 분류 라벨 ──────────────────────────────────────
const KO_COLORLESS_TYPE = {
  Uncommon:"고급", Rare:"희귀", Ancient:"고대", Token:"토큰",
  Status:"상태이상", Curse:"저주", Quest:"퀘스트", Event:"이벤트",
};

// ── 카드 이름 (영어 → 한국어) ────────────────────────────────
const KO_CARD = {
"Abrasive":"거슬림","Accelerant":"촉진제","Accuracy":"정확성","Acrobatics":"곡예",
"Adaptive Strike":"적응형 타격","Adrenaline":"아드레날린","Afterimage":"잔상",
"Afterlife":"사후세계","Aggression":"공격성","Alchemize":"연금술","Alignment":"정렬",
"All for One":"모두를 위한 하나","Anger":"분노","Anointed":"기름 부음","Anticipate":"예측",
"Apotheosis":"신격화","Apparition":"환영","Armaments":"장비","Arsenal":"무기고",
"Ascender's Bane":"등반자의 파멸","Ashen Strike":"잿빛 타격","Assassinate":"암살",
"Astral Pulse":"천체 파동","Automation":"자동화","BEGONE!":"사라져라!","Backflip":"백덤블링",
"Backstab":"등 찌르기","Bad Luck":"불운","Ball Lightning":"구체 번개","Banshee's Cry":"밴시의 비명",
"Barrage":"일제 사격","Barricade":"바리케이드","Bash":"강타","Battle Trance":"전투 무아지경",
"Beacon of Hope":"희망의 봉화","Beam Cell":"빔 세포","Beat Down":"두들겨 패기",
"Beat into Shape":"형태 잡기","Beckon":"손짓","Believe in You":"너를 믿어",
"Biased Cognition":"편향된 인지","Big Bang":"빅뱅","Black Hole":"블랙홀","Blade Dance":"칼춤",
"Blade Of Ink":"잉크의 검","Blight Strike":"마름 타격","Blood Wall":"피의 장벽",
"Bloodletting":"사혈","Bludgeon":"곤봉질","Blur":"흐릿함","Body Slam":"보디 슬램",
"Bodyguard":"경호원","Bolas":"볼라","Bombardment":"포격","Bone Shards":"뼛조각",
"Boost Away":"밀어내기","Boot Sequence":"부팅 절차","Borrowed Time":"빌린 시간",
"Bouncing Flask":"통통 튀는 플라스크","Brand":"낙인","Breakthrough":"돌파",
"Brightest Flame":"가장 밝은 불꽃","Brutality":"잔혹함","Bubble Bubble":"보글보글",
"Buffer":"완충 장치","Bulk Up":"덩치 키우기","Bullet Time":"총알 시간","Bully":"약자 괴롭히기",
"Bulwark":"보루","Bundle of Joy":"기쁨의 꾸러미","Burn":"화상","Burning Pact":"불타는 맹세",
"Burst":"연발","Bury":"매장","Byrd Swoop":"버드 급강하","Byrdonis Egg":"버드 알",
"CHARGE!!":"돌격!!","Calamity":"재앙","Calcify":"석회화","Calculated Gamble":"계산된 도박",
"Caltrops":"마름쇠","Capacitor":"축전기","Capture Spirit":"영혼 포획","Cascade":"폭포",
"Catastrophe":"대재앙","Celestial Might":"천상의 힘","Chaos":"혼돈","Charge Battery":"배터리 충전",
"Child of Stars":"별의 아이","Child of the Stars":"별들의 아이","Chill":"냉각","Cinder":"잿불",
"Clash":"격돌","Claw":"발톱","Cleanse":"정화","Cloak And Dagger":"망토와 단검",
"Cloak of Stars":"별의 망토","Clothesline":"빨랫줄 공격","Clumsy":"서투름","Cold Snap":"한파",
"Collision Course":"충돌 경로","Colossus":"거인상","Combust":"발화","Comet":"혜성",
"Compact":"압축","Compile Driver":"컴파일 드라이버","Conflagration":"큰불","Conqueror":"정복자",
"Consuming Shadow":"집어삼키는 그림자","Convergence":"수렴","Coolant":"냉각수",
"Coolheaded":"냉철함","Coordinate":"협응","Corrosive Wave":"부식의 파도","Corruption":"타락",
"Cosmic Indifference":"우주적 무관심","Countdown":"카운트다운","Crash Landing":"불시착",
"Creative AI":"창조적 AI","Crescent Spear":"초승달 창","Crimson Mantle":"진홍의 망토",
"Cruelty":"잔인함","Crush Under":"짓밟기","Curse of the Bell":"종의 저주","Dagger Spray":"단검 살포",
"Dagger Throw":"단검 투척","Danse Macabre":"죽음의 무도","Dark Embrace":"어둠의 포옹",
"Dark Shackles":"어둠의 족쇄","Darkness":"어둠","Dash":"질주","Dazed":"어지러움",
"Deadly Poison":"맹독","Death March":"죽음의 행진","Death's Door":"죽음의 문",
"Deathbringer":"죽음을 부르는 자","Debilitate":"쇠약","Debris":"잔해","Debt":"빚","Decay":"부패",
"Decisions, Decisions":"선택, 또 선택","Defend":"수비","Defile":"더럽히기","Deflect":"비껴내기",
"Defragment":"조각 모음","Defy":"저항","Delay":"지연","Demesne":"영지","Demon Form":"악마의 형상",
"Demonic Shield":"악마의 방패","Devastate":"파괴","Devour Life":"생명 포식","Dirge":"만가",
"Disarm":"무장 해제","Discovery":"발견","Disintegration":"분해","Dismantle":"해체",
"Distraction":"교란","Dodge And Roll":"구르기 회피","Dominate":"지배","Double Energy":"이중 에너지",
"Double Tap":"두 번 치기","Doubt":"의심","Drain Power":"힘 흡수","Dramatic Entrance":"극적인 등장",
"Dredge":"준설","Dropkick":"드롭킥","Drum of Battle":"전투의 북","Dualcast":"이중 시전",
"Dying Star":"죽어가는 별","Echo Form":"메아리 형상","Echoing Slash":"메아리치는 베기",
"Eidolon":"환영상","End of Days":"종말","Energy Surge":"에너지 급증","Enfeebling Touch":"쇠약의 손길",
"Enlightenment":"깨달음","Enthralled":"매혹됨","Entrench":"참호","Entropy":"엔트로피",
"Envenom":"독 바르기","Equilibrium":"평형","Eradicate":"박멸","Escape Plan":"탈출 계획",
"Eternal Armor":"영원한 갑옷","Evil Eye":"사악한 눈","Expect A Fight":"싸움을 예상하라",
"Expertise":"전문 기술","Expose":"폭로","Exterminate":"몰살","FTL":"초광속",
"Falling Star":"떨어지는 별","Fan Of Knives":"칼 부채","Fasten":"조이기","Fear":"공포",
"Feed":"포식","Feeding Frenzy":"광란의 먹이질","Feel No Pain":"고통 차단","Feral":"야성",
"Fetch":"가져오기","Fiend Fire":"마귀 화염","Fight Me!":"덤벼!","Fight Through":"뚫고 싸우기",
"Finesse":"기교","Finisher":"마무리","Fisticuffs":"주먹다짐","Flak Cannon":"대공포",
"Flame Barrier":"화염 방벽","Flanking":"측면 공격","Flash of Steel":"강철의 섬광","Flatten":"납작하게",
"Flechettes":"화살","Flex":"굳히기","Flick Flack":"플릭 플랙","Focused Strike":"집중 타격",
"Follow Through":"끝까지 밀어붙이기","Folly":"어리석음","Footwork":"발놀림",
"Forbidden Grimoire":"금단의 마도서","Foregone Conclusion":"정해진 결말","Forgotten Ritual":"잊혀진 의식",
"Frantic Escape":"광란의 탈출","Friendship":"우정","Fuel":"연료","Furnace":"용광로","Fusion":"융합",
"GUARDS!!!":"경비병!!!","Gamma Blast":"감마 폭발","Gang Up":"떼로 덤비기","Gather Light":"빛 모으기",
"Genesis":"창세","Genetic Algorithm":"유전 알고리즘","Giant Rock":"거대한 바위","Glacier":"빙하",
"Glasswork":"유리 세공","Glimmer":"희미한 빛","Glimpse Beyond":"너머를 엿보기",
"Glitterstream":"반짝임의 흐름","Glow":"발광","Go for the Eyes":"눈을 노려라","Gold Axe":"황금 도끼",
"Grand Finale":"대단원","Grave Warden":"무덤지기","Graveblast":"무덤 폭발","Greed":"탐욕",
"Guiding Star":"길잡이 별","Guilty":"죄책감","Gunk Up":"끈적임","Hailstorm":"우박 폭풍",
"Hammer Time":"망치 시간","Hand Trick":"손재주","Hand of Greed":"탐욕의 손","Hang":"매달기",
"Haunt":"출몰","Havoc":"대혼란","Haze":"안개","Headbutt":"박치기","Heavenly Drill":"천상의 송곳",
"Heavy Blade":"대검","Hegemony":"패권","Heirloom Hammer":"가보 망치","Helix Drill":"나선 송곳",
"Hello World":"헬로 월드","Hellraiser":"지옥문지기","Hemokinesis":"피의 운동",
"Hidden Cache":"숨겨진 은닉처","Hidden Daggers":"숨겨진 단검","Hidden Gem":"숨겨진 보석",
"High Five":"하이 파이브","Hologram":"홀로그램","Hotfix":"긴급 수정","Howl from Beyond":"저편의 울부짖음",
"Huddle Up":"웅크리기","Hyperbeam":"초강력 빔","I Am Invincible":"나는 무적이다","Ice Lance":"얼음 창",
"Ignition":"점화","Immolate":"산 제물","Impatience":"조급함","Impervious":"무적","Infection":"감염",
"Infernal Blade":"지옥의 검","Inferno":"지옥불","Infinite Blades":"무한의 검","Inflame":"점화",
"Injury":"부상","Intercept":"가로채기","Intimidate":"위협","Invoke":"발동","Iron Wave":"강철 파도",
"Iteration":"반복","Jack of All Trades":"만물박사","Jackpot":"대박","Juggernaut":"파괴 전차",
"Juggling":"저글링","Kingly Kick":"왕의 발차기","Kingly Punch":"왕의 주먹","Knife Trap":"칼 함정",
"Knockdown":"넘어뜨리기","Knockout Blow":"결정타","Know Thy Place":"분수를 알라","Lantern Key":"등불 열쇠",
"Largesse":"후한 베풂","Leading Strike":"선제 타격","Leap":"도약","Leg Sweep":"다리 후리기",
"Legion of Bone":"뼈의 군단","Lethality":"치명성","Lift":"들어올리기","Lightning Rod":"피뢰침",
"Limit Break":"한계 돌파","Loop":"루프","Luminesce":"발광","Lunar Blast":"달의 폭발",
"Machine Learning":"기계 학습","Make It So":"그렇게 하라","Malaise":"권태","Mangle":"짓이기기",
"Manifest Authority":"권위 현현","Master Planner":"책략의 대가","Master of Strategy":"전략의 대가",
"Maul":"후려치기","Mayhem":"아수라장","Melancholy":"우울","Memento Mori":"메멘토 모리",
"Metamorphosis":"변형","Meteor Shower":"유성우","Meteor Strike":"유성 강타","Mimic":"모방",
"Mind Blast":"정신 폭발","Mind Rot":"정신 부패","Minion Dive Bomb":"하수인 급강하 폭격",
"Minion Sacrifice":"하수인 희생","Minion Strike":"하수인 타격","Mirage":"신기루","Misery":"비참",
"Modded":"개조됨","Molten Fist":"용암 주먹","Momentum Strike":"가속 타격","Monarch's Gaze":"군주의 응시",
"Monologue":"독백","Multi-Cast":"다중 시전","Murder":"살인","Necro Mastery":"강령술 숙련",
"Negative Pulse":"음의 파동","Neow's Fury":"네오우의 분노","Neurosurge":"신경 급증","Neutralize":"무력화",
"Neutron Aegis":"중성자 방패","Nightmare":"악몽","No Escape":"탈출 불가","Normality":"평범함",
"Nostalgia":"향수","Not Yet":"아직이야","Noxious Fumes":"유독 가스","Null":"무효","Oblivion":"망각",
"Offering":"제물","Omnislice":"전방위 베기","One-Two Punch":"원투 펀치","Orbit":"궤도",
"Outbreak":"발발","Outmaneuver":"책략","Overclock":"오버클럭","Pact's End":"맹세의 끝",
"Pagestorm":"책장 폭풍","Pale Blue Dot":"창백한 푸른 점","Panache":"멋","Panic Button":"비상 단추",
"Parry":"받아넘기기","Parse":"구문 분석","Particle Wall":"입자 장벽","Patter":"재잘거림","Peck":"쪼기",
"Perfected Strike":"완성된 타격","Phantom Blades":"환영의 검","Photon Cut":"광자 절단",
"Piercing Wail":"꿰뚫는 통곡","Pillage":"약탈","Pillar of Creation":"창조의 기둥","Pinpoint":"정밀 조준",
"Poisoned Stab":"독을 묻힌 일격","Poke":"쿡 찌르기","Pommel Strike":"손잡이 가격","Poor Sleep":"설잠",
"Pounce":"덮치기","Power Through":"강행 돌파","Precise Cut":"정밀한 절단","Predator":"포식자",
"Prep Time":"준비 시간","Prepared":"준비","Primal Force":"원초적 힘","Production":"생산","Prolong":"연장",
"Prophesize":"예언","Protector":"수호자","Prowess":"용맹","Pull Aggro":"어그로 끌기",
"Pull from Below":"아래에서 끌어올리기","Purity":"순수","Putrefy":"부패시키기","Pyre":"화장단",
"Quadcast":"사중 시전","Quasar":"퀘이사","Radiate":"방사","Rage":"격노","Rainbow":"무지개","Rally":"집결",
"Rampage":"광란","Rattle":"덜그럭","Reanimate":"되살리기","Reap":"수확","Reaper":"사신",
"Reaper Form":"사신의 형상","Reave":"찢어발기기","Reboot":"재부팅","Rebound":"반동",
"Refine Blade":"검 단련","Reflect":"반사","Reflex":"반사 신경","Refract":"굴절","Regret":"후회",
"Relax":"이완","Rend":"가르기","Resonance":"공명","Restlessness":"안절부절","Ricochet":"도탄",
"Right Hand Hand":"오른손의 손","Rip and Tear":"찢고 가르기","Rocket Punch":"로켓 주먹",
"Rolling Boulder":"굴러가는 바위","Royal Gamble":"왕의 도박","Royalties":"인세","Rupture":"분열",
"Sacrifice":"희생","Salvo":"일제 발사","Scavenge":"줍기","Scourge":"천벌","Scrape":"긁어내기",
"Scrawl":"휘갈겨 쓰기","Sculpting Strike":"조각 타격","Seance":"강령회","Searing Blow":"작열의 일격",
"Second Wind":"재기","Secret Technique":"비밀 기술","Secret Weapon":"비밀 무기","Seeker Strike":"추적 타격",
"Seeking Edge":"추적의 칼날","Sentry Mode":"감시 모드","Serpent Form":"뱀의 형상","Setup Strike":"사전 타격",
"Seven Stars":"일곱 별","Sever Soul":"영혼 가르기","Severance":"단절","Shadow Shield":"그림자 방패",
"Shadow Step":"그림자 걸음","Shadowmeld":"그림자 융합","Shame":"수치","Shared Fate":"공유된 운명",
"Shatter":"산산조각","Shining Strike":"빛나는 타격","Shiv":"비수","Shockwave":"충격파","Shroud":"장막",
"Shrug It Off":"떨쳐내기","Sic 'Em":"공격 명령","Signal Boost":"신호 증폭","Skewer":"꼬치 꿰기",
"Skim":"훑어보기","Sleight of Flesh":"살의 속임수","Slice":"베기","Slimed":"점액질","Sloth":"나태",
"Smokestack":"굴뚝","Snakebite":"뱀 물기","Snap":"탁 치기","Sneaky":"교활함","Solar Strike":"태양 타격",
"Soot":"그을음","Soul":"영혼","Soul Storm":"영혼 폭풍","Sovereign Blade":"군주의 검","Sow":"씨뿌리기",
"Spectrum Shift":"스펙트럼 전환","Speedster":"속도광","Spinner":"회전체","Spirit of Ash":"잿빛 영혼",
"Spite":"앙심","Splash":"첨벙","Spoils Map":"전리품 지도","Spoils of Battle":"전투의 전리품",
"Spore Mind":"포자 정신","Spot Weakness":"약점 포착","Spur":"박차","Squash":"으깨기","Squeeze":"쥐어짜기",
"Stack":"스택","Stampede":"쇄도","Stardust":"별먼지","Stoke":"부추기기","Stomp":"짓밟기",
"Stone Armor":"돌 갑옷","Storm":"폭풍","Storm Of Steel":"강철 폭풍","Strangle":"교살","Stratagem":"책략",
"Strike":"타격","Subroutine":"하위 루틴","Sucker Punch":"기습 공격","Summon Forth":"소환","Sunder":"분쇄",
"Supercritical":"초임계","Supermassive":"초거대","Suppress":"진압","Survivor":"생존자",
"Sweeping Beam":"일소 광선","Sweeping Gaze":"일소하는 응시","Sword Boomerang":"검 부메랑",
"Sword Sage":"검의 현자","Synchronize":"동기화","Synthesis":"합성","TURBO":"터보","Tactician":"전술가",
"Tag Team":"협공","Taunt":"도발","Tear Asunder":"갈가리 찢기","Tempest":"폭풍우","Terraforming":"지형 변형",
"Tesla Coil":"테슬라 코일","The Bomb":"폭탄","The Gambit":"도박수","The Hunt":"사냥","The Scythe":"큰낫",
"The Sealed Throne":"봉인된 왕좌","The Smith":"대장장이","Thinking Ahead":"앞서 생각하기","Thrash":"후려치기",
"Thrumming Hatchet":"진동하는 손도끼","Thunder":"천둥","Thunderclap":"천둥소리","Time's Up":"시간 종료",
"Tools Of The Trade":"생업 도구","Toric Toughness":"토릭의 강인함","Toxic":"유독","Tracking":"추적",
"Transfigure":"변모","Trash to Treasure":"쓰레기에서 보물로","Tremble":"진동","True Grit":"진정한 근성",
"Twin Strike":"쌍둥이 타격","Tyranny":"폭정","Ultimate Defend":"궁극의 수비","Ultimate Strike":"궁극의 타격",
"Undeath":"불사","Unleash":"해방","Unmovable":"부동","Unrelenting":"가차없음","Untouchable":"불가침",
"Up My Sleeve":"소매 속에","Uppercut":"어퍼컷","Uproar":"소란","Veilpiercer":"장막을 뚫는 자",
"Venerate":"숭배","Vicious":"흉포함","Void":"공허","Void Form":"공허의 형상","Volley":"일제 사격",
"Voltaic":"전압의","Waste Away":"쇠퇴","Well-Laid Plans":"용의주도한 계획","Whirlwind":"회오리바람",
"Whistle":"호각","White Noise":"백색 소음","Wild Strike":"거친 타격","Wish":"소원","Wisp":"도깨비불",
"Wound":"부상","Wraith Form":"망령의 형상","Writhe":"몸부림","Wrought in War":"전쟁으로 벼려진","Zap":"지직",
};

// ── 유물 이름 (영어 → 한국어) ────────────────────────────────
const KO_RELIC = {
"Akabeko":"아카베코","Alchemical Coffer":"연금술 상자","Amethyst Aubergine":"자수정 가지",
"Anchor":"닻","Anchor_Ev":"닻 (이벤트)","Arcane Scroll":"비전 두루마리","Archaic Tooth":"고대의 이빨",
"Art of War":"전쟁의 기술","Astrolabe":"아스트롤라베","Bag of Marbles":"구슬 주머니",
"Bag of Preparation":"준비물 주머니","Beating Remnant":"박동하는 잔재","Beautiful Bracelet":"아름다운 팔찌",
"Bellows":"풀무","Belt Buckle":"벨트 버클","Big Hat":"큰 모자","Big Mushroom":"큰 버섯",
"Biiig Hug":"크으은 포옹","Bing Bong":"빙봉","Black Blood":"검은 피","Black Star":"검은 별",
"Blessed Antler":"축복받은 뿔","Blood Vial":"피의 약병","Blood-Soaked Rose":"피에 젖은 장미",
"Blood_Vial_Ev":"피의 약병 (이벤트)","Bone Flute":"뼈 피리","Bone Tea":"뼈 차",
"Book Repair Knife":"책 수선용 칼","Book of Five Rings":"오륜서","Bookmark":"책갈피",
"Booming Conch":"우렁찬 소라고둥","Bound Phylactery":"결속된 성물함","Bowler Hat":"중산모","Bread":"빵",
"Brilliant Scarf":"화려한 스카프","Brimstone":"유황","Bronze Scales":"청동 비늘","Burning Blood":"불타는 피",
"Burning Sticks":"불타는 막대기","Byrdpip":"버드핍","Calling Bell":"부르는 종","Candelabra":"촛대",
"Captain's Wheel":"선장의 키","Cauldron":"가마솥","Centennial Puzzle":"백년의 퍼즐","Chandelier":"샹들리에",
"Charon's Ashes":"카론의 재","Chemical X":"화학물질 X","Choices Paradox":"선택의 역설","Circlet":"작은 관",
"Claws":"발톱","Cloak Clasp":"망토 걸쇠","Cracked Core":"갈라진 핵","Crossbow":"석궁",
"Cursed Pearl":"저주받은 진주","Darkstone Periapt":"흑석 부적","Data Disk":"데이터 디스크",
"Daughter of the Wind":"바람의 딸","Delicate Frond":"여린 잎","Demon Tongue":"악마의 혀",
"Diamond Diadem":"다이아몬드 왕관","Dingy Rug":"꾀죄죄한 양탄자","Distinguished Cape":"고귀한 망토",
"Divine Destiny":"신성한 운명","Divine Right":"신성한 권리","Dolly's Mirror":"인형의 거울",
"Dragon Fruit":"용과","Dream Catcher":"드림 캐쳐","Driftwood":"유목","Dusty Tome":"먼지투성이 책",
"Ectoplasm":"엑토플라즘","Electric Shrymp":"전기 새우","Ember Tea":"잿불 차","Emotion Chip":"감정 칩",
"Empty Cage":"빈 새장","Eternal Feather":"영원한 깃털","Fencing Manual":"펜싱 교본",
"Festive Popper":"축제 폭죽","Fiddle":"바이올린","Forgotten Soul":"잊혀진 영혼","Fragrant Mushroom":"향기로운 버섯",
"Fresnel Lens":"프레넬 렌즈","Frozen Egg":"얼어붙은 알","Funerary Mask":"장례 가면","Fur Coat":"모피 코트",
"Galactic Dust":"은하의 먼지","Gambling Chip":"도박 칩","Game Piece":"게임 말","Ghost Seed":"유령 씨앗",
"Girya":"기랴","Glass Eye":"유리 눈","Glitter":"반짝이","Gnarled Hammer":"울퉁불퉁한 망치",
"Gold-Plated Cables":"금도금 케이블","Golden Compass":"황금 나침반","Golden Pearl":"황금 진주",
"Gorget":"목 보호대","Gremlin Horn":"그렘린 뿔","Hand Drill":"수동 드릴","Happy Flower":"행복한 꽃",
"Happy_Flower_Ev":"행복한 꽃 (이벤트)","Hefty Tablet":"묵직한 석판","Helical Dart":"나선형 다트",
"History Course":"역사 강의","Horn Cleat":"뿔 고정쇠","Ice Cream":"아이스크림","Infused Core":"주입된 핵",
"Intimidating Helmet":"위협적인 투구","Iron Club":"철퇴","Ivory Tile":"상아 패","Jeweled Mask":"보석 가면",
"Jewelry Box":"보석함","Joss Paper":"지전","Juzu Bracelet":"염주 팔찌","Kifuda":"기후다","Kunai":"쿠나이",
"Kusarigama":"쇠사슬낫","Lantern":"등불","Large Capsule":"큰 캡슐","Lasting Candy":"오래가는 사탕",
"Lava Lamp":"라바 램프","Lava Rock":"용암석","Lead Paperweight":"납 문진","Leafy Poultice":"잎사귀 찜질약",
"Lee's Waffle":"리의 와플","Lees_Waffle_Ev":"리의 와플 (이벤트)","Letter Opener":"편지 칼","Lizard Tail":"도마뱀 꼬리",
"Looming Fruit":"어렴풋한 열매","Lord's Parasol":"군주의 양산","Lost Coffer":"잃어버린 상자",
"Lost Wisp":"길 잃은 도깨비불","Lucky Fysh":"행운의 물고기","Lunar Pastry":"달 페이스트리","Mango":"망고",
"Mango_Ev":"망고 (이벤트)","Massive Scroll":"거대한 두루마리","Maw Bank":"아귀 금고","Meal Ticket":"식권",
"Meat Cleaver":"고기 칼","Meat on the Bone":"뼈에 붙은 고기","Membership Card":"회원 카드",
"Mercury Hourglass":"수은 모래시계","Metronome":"메트로놈","Mini Regent":"미니 섭정","Miniature Cannon":"소형 대포",
"Miniature Tent":"소형 천막","Molten Egg":"용암 알","Mr. Struggles":"미스터 발버둥","Mummified Hand":"미라의 손",
"Music Box":"오르골","Mystic Lighter":"신비한 라이터","Neow's Bones":"네오우의 뼈","Neow's Talisman":"네오우의 부적",
"Neow's Torment":"네오우의 고통","New Leaf":"새 잎","Ninja Scroll":"닌자 두루마리","Nunchaku":"쌍절곤",
"Nutritious Oyster":"영양굴","Nutritious Soup":"영양 수프","Oddly Smooth Stone":"묘하게 매끄러운 돌",
"Old Coin":"옛 동전","Orange Dough":"주황색 반죽","Orichalcum":"오리칼쿰","Orichalcum_Ev":"오리칼쿰 (이벤트)",
"Ornamental Fan":"장식 부채","Orrery":"천체 모형","Pael's Blood":"파엘의 피","Pael's Claw":"파엘의 발톱",
"Pael's Eye":"파엘의 눈","Pael's Flesh":"파엘의 살","Pael's Growth":"파엘의 증식","Pael's Horn":"파엘의 뿔",
"Pael's Legion":"파엘의 군단","Pael's Tears":"파엘의 눈물","Pael's Tooth":"파엘의 이빨","Pael's Wing":"파엘의 날개",
"Pandora's Box":"판도라의 상자","Pantograph":"팬터그래프","Paper Krane":"종이학","Paper Phrog":"종이 개구리",
"Parrying Shield":"받아넘기는 방패","Pear":"배","Pen Nib":"펜촉","Pendulum":"진자","Permafrost":"영구동토",
"Petrified Toad":"석화된 두꺼비","Phial Holster":"약병 홀스터","Philosopher's Stone":"현자의 돌",
"Phylactery Unbound":"풀려난 성물함","Planisphere":"평면천체도","Pocketwatch":"회중시계",
"Pollinous Core":"화분 핵","Pomander":"향료 주머니","Potion Belt":"물약 벨트","Power Cell":"전력 전지",
"Prayer Wheel":"기도 바퀴","Precarious Shears":"위태로운 가위","Precise Scissors":"정밀한 가위",
"Preserved Fog":"보존된 안개","Prismatic Gem":"무지갯빛 보석","Pumpkin Candle":"호박 양초",
"Punch Dagger":"주먹 단검","Radiant Pearl":"빛나는 진주","Rainbow Ring":"무지개 고리","Razor Tooth":"면도날 이빨",
"Red Mask":"붉은 가면","Red Skull":"붉은 해골","Regal Pillow":"호화로운 베개","Regalite":"레갈라이트",
"Reptile Trinket":"파충류 장신구","Ring of the Drake":"용의 반지","Ring of the Snake":"뱀의 반지",
"Ringing Triangle":"울리는 트라이앵글","Ripple Basin":"잔물결 대야","Royal Poison":"왕실 독약",
"Royal Stamp":"왕실 도장","Ruined Helmet":"망가진 투구","Runic Capacitor":"룬 축전기","Runic Pyramid":"룬 피라미드",
"Sai":"사이","Sand Castle":"모래성","Screaming Flagon":"비명 지르는 술병","Scroll Boxes":"두루마리 상자",
"Sea Glass":"바다 유리","Seal of Gold":"황금 인장","Self-Forming Clay":"스스로 형성되는 점토",
"Sere Talon":"메마른 발톱","Shovel":"삽","Shuriken":"수리검","Signet Ring":"인장 반지","Silver Crucible":"은 도가니",
"Sling of Courage":"용기의 투석구","Small Capsule":"작은 캡슐","Snecko Eye":"스네코의 눈","Snecko Skull":"스네코의 두개골",
"Snecko_Eye_Ev":"스네코의 눈 (이벤트)","Sozu":"소즈","Sparkling Rouge":"반짝이는 루주","Spiked Gauntlets":"가시 건틀릿",
"Stone Calendar":"돌 달력","Stone Cracker":"돌 깨는 도구","Stone Humidifier":"돌 가습기","Storybook":"이야기책",
"Strawberry":"딸기","Strike Dummy":"타격 인형","Strike_Dummy_Ev":"타격 인형 (이벤트)","Sturdy Clamp":"튼튼한 죔쇠",
"Sword of Jade":"비취 검","Sword of Stone":"돌의 검","Symbiotic Virus":"공생 바이러스","Tanx's Whistle":"탱크스의 호각",
"Tea of Discourtesy":"무례의 차","The Abacus":"주판","The Boot":"장화","The Chosen Cheese":"선택받은 치즈",
"The Courier":"배달부","The_Merchants_Rug_Ev":"상인의 양탄자 (이벤트)","Throwing Axe":"투척 도끼","Tingsha":"팅샤",
"Tiny Mailbox":"작은 우편함","Toasty Mittens":"따뜻한 벙어리장갑","Toolbox":"공구함","Touch of Orobas":"오로바스의 손길",
"Tough Bandages":"질긴 붕대","Toxic Egg":"유독성 알","Toy Box":"장난감 상자","Tri-Boomerang":"삼중 부메랑",
"Tungsten Rod":"텅스텐 막대","Tuning Fork":"소리굽쇠","Twisted Funnel":"뒤틀린 깔때기","Unceasing Top":"멈추지 않는 팽이",
"Undying Sigil":"불멸의 인장","Unsettling Lamp":"불안한 등불","Vajra":"금강저","Vambrace":"팔 보호대",
"Velvet Choker":"벨벳 초커","Venerable Tea Set":"유서 깊은 다기","Venerable_Tea_Set_Ev":"유서 깊은 다기 (이벤트)",
"Very Hot Cocoa":"아주 뜨거운 코코아","Vexing Puzzlebox":"성가신 퍼즐 상자","Vitruvian Minion":"비트루비우스 하수인",
"War Hammer":"전쟁 망치","War Paint":"전투 도색","Whetstone":"숫돌","Whispering Earring":"속삭이는 귀걸이",
"White Beast Statue":"흰 짐승 조각상","White Star":"흰 별","Wing Charm":"날개 부적","Winged Boots":"날개 달린 부츠",
"Wongo Customer Appreciation Badge":"웡고 고객 감사 배지","Wongo's Mystery Ticket":"웡고의 미스터리 티켓",
"Yummy Cookie":"맛있는 쿠키",
};

// ── 통합 이름 사전 + 역방향(한국어 → 영어) 인덱스 ───────────
const KO_NAME = Object.assign({}, KO_CARD, KO_RELIC);
const EN_FROM_KO = {};
for (const en in KO_NAME) {
  const ko = KO_NAME[en];
  if (!(ko in EN_FROM_KO)) EN_FROM_KO[ko] = en;   // 첫 매칭 우선
}
// 게임에서 추출한 공식 한글 이름(loc_ko.js의 window.KO_OFF)도 역방향 검색에 포함
if (typeof KO_OFF !== 'undefined' && KO_OFF) {
  for (const en in KO_OFF) {
    const t = KO_OFF[en] && KO_OFF[en].t;
    if (t && !(t in EN_FROM_KO)) EN_FROM_KO[t] = en;
  }
}

// ── 표시/입력 헬퍼 (전역) ────────────────────────────────────
// 카드/유물 한글 이름: 게임 공식(KO_OFF) 우선 → 추정(KO_NAME) → 영어
function koName(en) {
  if (en == null) return en;
  if (typeof KO_OFF !== 'undefined' && KO_OFF[en] && KO_OFF[en].t) return KO_OFF[en].t;
  return KO_NAME[en] || en;
}
// 게임 공식 한글 효과 설명(HTML 렌더). 없으면 ''.
function renderGameText(raw) {
  if (!raw) return '';
  let h = String(raw).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  h = h.replace(/\{[^}]*\}/g, '<span class="gv">◆</span>');           // 동적 수치 값
  h = h.replace(/\[gold\]([\s\S]*?)\[\/gold\]/g, '<span class="gh">$1</span>');
  h = h.replace(/\[[a-zA-Z_]+\]([\s\S]*?)\[\/[a-zA-Z_]+\]/g, '<span class="gh">$1</span>');
  h = h.replace(/\[\/?[a-zA-Z_]+\]/g, '');                            // 남은 태그 제거
  h = h.replace(/\n/g, '<br>');
  return h;
}
function koDesc(en) {
  const d = (typeof KO_OFF !== 'undefined' && KO_OFF[en]) ? KO_OFF[en].d : '';
  return renderGameText(d);
}
function hasOfficial(en) { return typeof KO_OFF !== 'undefined' && !!(KO_OFF[en] && KO_OFF[en].t); }
function koArch(en) { return (en != null && KO_ARCH[en]) ? KO_ARCH[en] : en; }
function koBuild(id){ return (id != null && KO_BUILD[id]) ? KO_BUILD[id] : id; }
function koTag(t)   { return (t  != null && KO_TAG[t])   ? KO_TAG[t]   : t; }
function koRarity(r){ return (r  != null && KO_RARITY[r])? KO_RARITY[r]: r; }
function koTags(arr){ return (arr||[]).map(koTag).join('/'); }

// 한국어/영어 입력 → 영어 정식 이름. (점수·검색 내부는 항상 영어)
function canonEN(input) {
  if (input == null) return input;
  const t = String(input).trim();
  if (EN_FROM_KO[t]) return EN_FROM_KO[t];
  return input;
}

// ── 한글 초성 검색 (예: "ㅍㅅ" → "포식") ──────────────────────
const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
// 한글 음절 문자열 → 각 글자의 초성만 뽑은 문자열 (한글 아닌 글자는 그대로)
function toChosung(str) {
  let out = '';
  for (const ch of String(str)) {
    const code = ch.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) out += CHOSUNG[Math.floor((code - 0xAC00) / 588)];
    else out += ch;
  }
  return out;
}
// 질의가 초성 자모(ㄱ~ㅎ)로만 이루어졌는지
function isChosungQuery(q) { return /^[ㄱ-ㅎ]+$/.test(q); }

// 자동완성/검색: 영어 id / 한국어 이름 부분일치 + 한글 초성 검색
function nameMatches(en, q) {
  if (!q) return false;
  const off = (typeof KO_OFF !== 'undefined' && KO_OFF[en]) ? KO_OFF[en].t : '';
  const ko = KO_NAME[en] || '';
  if (en.toLowerCase().includes(q) || ko.includes(q) || (off && off.includes(q))) return true;
  // 초성 질의면 이름의 초성열에서 부분일치 검사
  if (isChosungQuery(q)) {
    if (ko && toChosung(ko).includes(q)) return true;
    if (off && toChosung(off).includes(q)) return true;
  }
  return false;
}
