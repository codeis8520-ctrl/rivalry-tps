import { WeaponStats, WeaponSkin, CaseType, BotProfile } from './types';

export const WEAPON_TYPES: Record<string, WeaponStats> = {
  pistol: {
    name: 'Desert Eagle (데저트 이글)',
    type: 'pistol',
    damage: 40,
    headshotMult: 2.5,
    fireRate: 400, // delay in ms
    reloadTime: 1.5,
    maxAmmo: 7,
    range: 600,
    bulletSpeed: 14,
    spread: 0.02,
    bulletCount: 1,
    color: '#94a3b8',
    description: '정밀 핸드 캐논입니다. 신중하게 격발할 시 파괴적인 헤드샷 피해를 입힙니다.',
  },
  rifle: {
    name: 'M4A4 Automatic (돌격소총)',
    type: 'rifle',
    damage: 18,
    headshotMult: 1.8,
    fireRate: 110,
    reloadTime: 2.2,
    maxAmmo: 30,
    range: 500,
    bulletSpeed: 15,
    spread: 0.04,
    bulletCount: 1,
    color: '#fbbf24',
    description: '다재다능한 자동 소총입니다. 뛰어난 연사력과 안정적인 탄 퍼짐 패턴을 자랑합니다.',
  },
  shotgun: {
    name: 'Pump Action (샷건)',
    type: 'shotgun',
    damage: 12, // per pellet
    headshotMult: 1.5,
    fireRate: 850,
    reloadTime: 3.0,
    maxAmmo: 5,
    range: 250,
    bulletSpeed: 11,
    spread: 0.12,
    bulletCount: 6, // 6 pellets
    color: '#ef4444',
    description: '강력한 위력의 근거리 산탄총입니다. 한 번에 6발의 산탄을 널찍이 방사하여 적을 초토화합니다.',
  },
  sniper: {
    name: 'AWM Sniper (저격소총)',
    type: 'sniper',
    damage: 85,
    headshotMult: 3.0,
    fireRate: 1500,
    reloadTime: 3.5,
    maxAmmo: 5,
    range: 1000,
    bulletSpeed: 25,
    spread: 0.002, // ultra accurate
    bulletCount: 1,
    color: '#10b981',
    description: '볼트액션 대구경 저격총입니다. 조준한 적의 머리를 적중시켜 일격에 쓰러뜨릴 수 있습니다.',
  },
  rpg: {
    name: 'Frag Grenade (세열수류탄)',
    type: 'rpg',
    damage: 110, // splash damage
    headshotMult: 1.0,
    fireRate: 2000,
    reloadTime: 4.0,
    maxAmmo: 1,
    range: 600,
    bulletSpeed: 6.5, // slower rocket
    spread: 0.01,
    bulletCount: 1,
    color: '#a855f7',
    description: '전술 세열수류탄입니다. 다소 느린 궤적으로 폭발물을 포착 지점에 투척해 가공할 폭발 피해를 입힙니다.',
  },
  smg: {
    name: 'UMP-45 SMG (기관단총)',
    type: 'smg',
    damage: 14,
    headshotMult: 1.6,
    fireRate: 80,
    reloadTime: 1.8,
    maxAmmo: 35,
    range: 380,
    bulletSpeed: 13,
    spread: 0.055,
    bulletCount: 1,
    color: '#38bdf8',
    description: '고속 연사 기관단총입니다. 근~중거리에서 탄막을 쏟아부어 상대를 압도합니다.',
  },
  katana: {
    name: 'Death Scythe (그림 리퍼의 낫)',
    type: 'katana',
    damage: 60,
    headshotMult: 1.2,
    fireRate: 3000,
    reloadTime: 0.1, // virtually no reload
    maxAmmo: 1, // always "loaded"
    range: 120, // close range strike
    bulletSpeed: 18, // dash speed
    spread: 0.0,
    bulletCount: 1,
    color: '#ec4899',
    description: '치명적인 사신의 큰 낫입니다. 고속 질주 대시를 가동하여 정면에 포착된 모든 적을 일도양단합니다.',
  }
};

export const WEAPON_SKINS: WeaponSkin[] = [
  // --- Pistol skins ---
  { id: 'p_default', name: '공장 고유 슬레이트', weaponType: 'pistol', rarity: 'common', primaryColor: '#475569', secondaryColor: '#1e293b', glow: false, pattern: 'solid' },
  { id: 'p_forest', name: '산악 디지털 카모', weaponType: 'pistol', rarity: 'common', primaryColor: '#1c1917', secondaryColor: '#166534', glow: false, pattern: 'digital' },
  { id: 'p_neon', name: '사이버 펑키 네온', weaponType: 'pistol', rarity: 'rare', primaryColor: '#06b6d4', secondaryColor: '#db2777', glow: false, pattern: 'neon' },
  { id: 'p_gold', name: '주권자의 무구 (소버린 데글)', weaponType: 'pistol', rarity: 'legendary', primaryColor: '#f59e0a', secondaryColor: '#78350f', glow: true, pattern: 'gold_plated' },

  // --- Rifle skins ---
  { id: 'r_default', name: '제식 표준 밀리터리', weaponType: 'rifle', rarity: 'common', primaryColor: '#1e293b', secondaryColor: '#0f172a', glow: false, pattern: 'solid' },
  { id: 'r_digital', name: '데드 존 미러 카모', weaponType: 'rifle', rarity: 'rare', primaryColor: '#4b5563', secondaryColor: '#ca8a04', glow: false, pattern: 'digital' },
  { id: 'r_magma', name: '볼케이노 용암 코어', weaponType: 'rifle', rarity: 'epic', primaryColor: '#b91c1c', secondaryColor: '#ea580c', glow: true, pattern: 'fade' },
  { id: 'r_hyper', name: '프리즘 코스믹 하이드라', weaponType: 'rifle', rarity: 'legendary', primaryColor: '#ec4899', secondaryColor: '#3b82f6', glow: true, pattern: 'galaxy' },

  // --- Shotgun skins ---
  { id: 's_default', name: '매트 블랙 카본', weaponType: 'shotgun', rarity: 'common', primaryColor: '#0f172a', secondaryColor: '#334155', glow: false, pattern: 'solid' },
  { id: 's_toxic', name: '새린 가스 케미컬 네온', weaponType: 'shotgun', rarity: 'rare', primaryColor: '#22c55e', secondaryColor: '#1e293b', glow: false, pattern: 'neon' },
  { id: 's_void', name: '블랙홀 다크 보이더', weaponType: 'shotgun', rarity: 'epic', primaryColor: '#6366f1', secondaryColor: '#020617', glow: true, pattern: 'galaxy' },

  // --- Sniper skins ---
  { id: 'sn_default', name: '탄자니아 데저트 샌드', weaponType: 'sniper', rarity: 'common', primaryColor: '#451a03', secondaryColor: '#14532d', glow: false, pattern: 'solid' },
  { id: 'sn_blizzard', name: '혹한의 불그스름한 동토', weaponType: 'sniper', rarity: 'rare', primaryColor: '#38bdf8', secondaryColor: '#e0f2fe', glow: false, pattern: 'fade' },
  { id: 'sn_nebula', name: '성운 우주 대폭발 (코스믹 네뷸라)', weaponType: 'sniper', rarity: 'legendary', primaryColor: '#a855f7', secondaryColor: '#ec4899', glow: true, pattern: 'galaxy' },
  { id: 'sn_dragon', name: '고대 파괴 신룡 (드래곤 혼 스킨)', weaponType: 'sniper', rarity: 'classified', primaryColor: '#ea580c', secondaryColor: '#facc15', glow: true, pattern: 'gold_plated' },

  // --- RPG skins ---
  { id: 'rpg_default', name: '묵직한 냉간 주조 강철', weaponType: 'rpg', rarity: 'common', primaryColor: '#334155', secondaryColor: '#0f172a', glow: false, pattern: 'solid' },
  { id: 'rpg_nuclear', name: '뉴클리어 디케이 방사능', weaponType: 'rpg', rarity: 'epic', primaryColor: '#84cc16', secondaryColor: '#1e3a8a', glow: true, pattern: 'neon' },

  // --- Katana skins ---
  { id: 'kd_default', name: '참격의 귀베르네', weaponType: 'katana', rarity: 'common', primaryColor: '#ec4899', secondaryColor: '#000000', glow: false, pattern: 'solid' },
  { id: 'kd_plasma', name: '플라즈마 써멀 서광 열선', weaponType: 'katana', rarity: 'epic', primaryColor: '#3b82f6', secondaryColor: '#06b6d4', glow: true, pattern: 'neon' },
  { id: 'kd_secret', name: '쌍둥이자리 성운 오로라 특수낫', weaponType: 'katana', rarity: 'classified', primaryColor: '#4f46e5', secondaryColor: '#db2777', glow: true, pattern: 'galaxy' },
  { id: 'kd_crimson', name: '혈도 (血刀) 심판의 낫', weaponType: 'katana', rarity: 'rare', primaryColor: '#dc2626', secondaryColor: '#0f172a', glow: false, pattern: 'solid' },
  { id: 'kd_samurai', name: '무사의 검 황금 일도', weaponType: 'katana', rarity: 'epic', primaryColor: '#94a3b8', secondaryColor: '#ca8a04', glow: true, pattern: 'gold_plated' },
  { id: 'kd_oni', name: '오니 (鬼) 귀신의 혼 낫', weaponType: 'katana', rarity: 'legendary', primaryColor: '#f97316', secondaryColor: '#4c0519', glow: true, pattern: 'galaxy' },

  // --- SMG skins ---
  { id: 'smg_default', name: '전술 표준 UMP 기관단총', weaponType: 'smg', rarity: 'common', primaryColor: '#475569', secondaryColor: '#1e293b', glow: false, pattern: 'solid' },
  { id: 'smg_neon', name: '사이버 전격 네온 SMG', weaponType: 'smg', rarity: 'rare', primaryColor: '#22d3ee', secondaryColor: '#7c3aed', glow: false, pattern: 'neon' },
  { id: 'smg_storm', name: '번개 폭풍 뇌격 SMG', weaponType: 'smg', rarity: 'epic', primaryColor: '#fbbf24', secondaryColor: '#1d4ed8', glow: true, pattern: 'fade' },
  { id: 'smg_gold', name: '황금 폭격기 골든 SMG', weaponType: 'smg', rarity: 'legendary', primaryColor: '#f59e0b', secondaryColor: '#78350f', glow: true, pattern: 'gold_plated' },
  { id: 'smg_void', name: '공허의 침묵 다크 SMG', weaponType: 'smg', rarity: 'classified', primaryColor: '#4f46e5', secondaryColor: '#0f172a', glow: true, pattern: 'galaxy' },

  // --- Extra Pistol skins ---
  { id: 'p_sakura', name: '벚꽃 에디션 체리블라썸 데글', weaponType: 'pistol', rarity: 'rare', primaryColor: '#ec4899', secondaryColor: '#fce7f3', glow: false, pattern: 'fade' },
  { id: 'p_shadow', name: '어비스 섀도우 암흑 데글', weaponType: 'pistol', rarity: 'epic', primaryColor: '#1e1b4b', secondaryColor: '#7c3aed', glow: true, pattern: 'galaxy' },
  { id: 'p_electric', name: '전격 스톰 일렉트릭 데글', weaponType: 'pistol', rarity: 'rare', primaryColor: '#facc15', secondaryColor: '#1d4ed8', glow: false, pattern: 'neon' },
  { id: 'p_jade', name: '비취 용왕 에메랄드 데글', weaponType: 'pistol', rarity: 'legendary', primaryColor: '#059669', secondaryColor: '#064e3b', glow: true, pattern: 'galaxy' },

  // --- Extra Rifle skins ---
  { id: 'r_arctic', name: '북극 설풍 아크틱 M4', weaponType: 'rifle', rarity: 'rare', primaryColor: '#bae6fd', secondaryColor: '#0284c7', glow: false, pattern: 'fade' },
  { id: 'r_shadow', name: '암흑 저승사자 다크 M4', weaponType: 'rifle', rarity: 'epic', primaryColor: '#1e1b4b', secondaryColor: '#312e81', glow: true, pattern: 'digital' },
  { id: 'r_dragon', name: '청룡의 분노 드래곤 M4', weaponType: 'rifle', rarity: 'legendary', primaryColor: '#06b6d4', secondaryColor: '#ca8a04', glow: true, pattern: 'galaxy' },
  { id: 'r_crimson', name: '지옥불 학살자 크림슨 M4', weaponType: 'rifle', rarity: 'classified', primaryColor: '#dc2626', secondaryColor: '#0f172a', glow: true, pattern: 'neon' },

  // --- Extra Shotgun skins ---
  { id: 's_inferno', name: '지옥불 인페르노 샷건', weaponType: 'shotgun', rarity: 'epic', primaryColor: '#ea580c', secondaryColor: '#1c1917', glow: true, pattern: 'fade' },
  { id: 's_ghost', name: '팬텀 유령 고스트 샷건', weaponType: 'shotgun', rarity: 'rare', primaryColor: '#e2e8f0', secondaryColor: '#334155', glow: false, pattern: 'solid' },
  { id: 's_acid', name: '독성 산 분무기 바이오해저드', weaponType: 'shotgun', rarity: 'rare', primaryColor: '#84cc16', secondaryColor: '#365314', glow: false, pattern: 'neon' },

  // --- Extra Sniper skins ---
  { id: 'sn_emerald', name: '에메랄드 정밀 사수 AWM', weaponType: 'sniper', rarity: 'epic', primaryColor: '#059669', secondaryColor: '#0f172a', glow: true, pattern: 'digital' },
  { id: 'sn_phantom', name: '팬텀 유령 저격수 AWM', weaponType: 'sniper', rarity: 'rare', primaryColor: '#94a3b8', secondaryColor: '#1e293b', glow: false, pattern: 'solid' },
  { id: 'sn_crimson', name: '피의 메아리 크림슨 AWM', weaponType: 'sniper', rarity: 'legendary', primaryColor: '#dc2626', secondaryColor: '#450a0a', glow: true, pattern: 'fade' },

  // --- Extra RPG skins ---
  { id: 'rpg_crimson', name: '붉은 폭풍 크림슨 수류탄', weaponType: 'rpg', rarity: 'rare', primaryColor: '#ef4444', secondaryColor: '#1c1917', glow: false, pattern: 'fade' },
  { id: 'rpg_galaxy', name: '은하 대파괴 코스믹 수류탄', weaponType: 'rpg', rarity: 'legendary', primaryColor: '#7c3aed', secondaryColor: '#020617', glow: true, pattern: 'galaxy' }
];

export const CASES: CaseType[] = [
  {
    id: 'case_recruit',
    name: '신병 지원 보급 클래식 상자',
    cost: 150,
    currency: 'gold',
    customDescription: '기본적인 전투 훈련 및 장비 보급을 위한 전술 보물 상자입니다. 표준 클래식 위장 스킨들을 얻을 수 있습니다.',
    color: '#475569',
    pool: ['p_default', 'p_forest', 'r_default', 's_default', 'sn_default', 'rpg_default', 'kd_default', 'smg_default', 'sn_phantom', 's_ghost']
  },
  {
    id: 'case_tactical',
    name: '택티컬 네온 야광 스킨 상자',
    cost: 500,
    currency: 'gold',
    customDescription: '특수 독성 화합물 형광 코팅과 전술적 경고 디지털 카모플라주 테인티드 레이아웃 컬렉션입니다.',
    color: '#0d9488',
    pool: ['p_neon', 'p_electric', 'p_sakura', 'r_digital', 'r_arctic', 's_toxic', 's_acid', 'sn_blizzard', 'kd_plasma', 'kd_crimson', 'rpg_nuclear', 'rpg_crimson', 'smg_neon']
  },
  {
    id: 'case_classified',
    name: '엘리트 기밀 최상급 특급 소켓상자',
    cost: 80,
    currency: 'gems',
    customDescription: '차원을 왜곡하는 갤럭시 소용돌이 패턴과 찬란한 주권자 리전 무구 스킨셋을 영구 수집할 수 있는 최고급 보상 상자입니다.',
    color: '#7c3aed',
    pool: ['p_gold', 'p_shadow', 'p_jade', 'r_magma', 'r_hyper', 'r_shadow', 'r_dragon', 'r_crimson', 's_void', 's_inferno', 'sn_nebula', 'sn_dragon', 'sn_emerald', 'sn_crimson', 'kd_secret', 'kd_samurai', 'kd_oni', 'smg_storm', 'smg_gold', 'smg_void', 'rpg_galaxy']
  }
];

export const BOTS: BotProfile[] = [
  {
    name: '칼침놓는뉴비킬러',
    title: '동네 허접한 훈련병',
    difficulty: 'easy',
    favoriteWeapon: 'shotgun',
    skinId: 's_default',
    avatarColor: '#10b981',
    winRate: 34,
    kdRate: 0.65,
    badge: '브론즈 I'
  },
  {
    name: '러너_스피드스타',
    title: '파쿠르 중독자',
    difficulty: 'medium',
    favoriteWeapon: 'pistol',
    skinId: 'p_neon',
    avatarColor: '#e11d48',
    winRate: 48,
    kdRate: 0.95,
    badge: '실버 III'
  },
  {
    name: '난사하고기도합시다',
    title: '탄창 소비 요정',
    difficulty: 'medium',
    favoriteWeapon: 'rifle',
    skinId: 'r_digital',
    avatarColor: '#3b82f6',
    winRate: 52,
    kdRate: 1.10,
    badge: '골드 II'
  },
  {
    name: '전장의원샷원킬',
    title: '고요한 암살요원',
    difficulty: 'hard',
    favoriteWeapon: 'sniper',
    skinId: 'sn_blizzard',
    avatarColor: '#84cc16',
    winRate: 64,
    kdRate: 1.45,
    badge: '플래티넘 IV'
  },
  {
    name: '로블록스챔피언임',
    title: '아레나 살아있는 전설',
    difficulty: 'pro',
    favoriteWeapon: 'sniper',
    skinId: 'sn_dragon',
    avatarColor: '#f59e0a',
    winRate: 78,
    kdRate: 2.10,
    badge: '다이아몬드 I'
  },
  {
    name: '인간초월초지능머신',
    title: '경외로운 무결점 전신',
    difficulty: 'pro',
    favoriteWeapon: 'katana',
    skinId: 'kd_secret',
    avatarColor: '#a855f7',
    winRate: 89,
    kdRate: 3.45,
    badge: '챔피언'
  },
  {
    name: '연사왕_불도저',
    title: 'SMG 광속 압박가',
    difficulty: 'medium',
    favoriteWeapon: 'smg',
    skinId: 'smg_neon',
    avatarColor: '#22d3ee',
    winRate: 55,
    kdRate: 1.20,
    badge: '골드 III'
  },
  {
    name: '사이버_기관총병',
    title: '기관단총 달인',
    difficulty: 'hard',
    favoriteWeapon: 'smg',
    skinId: 'smg_storm',
    avatarColor: '#fbbf24',
    winRate: 68,
    kdRate: 1.65,
    badge: '플래티넘 II'
  }
];

export const TAUNT_MESSAGES = {
  easy: [
    "헉, 맞추려면 어떻게 가늠좌 대죠?",
    "와 복장 이쁘다! 어디서 파나요?",
    "아악! 제발 쏘지 말아주세요!",
    "우리 벌써 시작한 건가염?"
  ],
  medium: [
    "좋은 승부구만! 누가 이길지 어디 봅시다.",
    "조심해용, 제 손가락이 오늘 에임 고정이네여.",
    "무빙은 합격인데 과연 내 샷도 피할까?",
    "어차피 금방 끝날 매치임!"
  ],
  hard: [
    "한 방이면 충분해. 대가리 조심하라고.",
    "너무 굼뜬걸. 에임 집중 안 하냐?",
    "여기가 진짜 랭킹 최고 수준 매칭 맞아?",
    "움직임이 다 읽히네. 무빙 좀 꼬아봐."
  ],
  pro: [
    "깔끔하게 게임 끄시는 걸 추천함 ㅎㅎ",
    "공짜 매치 점수 달달하네! 기부 ㄳㄳ",
    "이게 기부천사들의 따사로운 온정인가요?",
    "클립각 나왔다! 바로 유튜브 박제해드림 ㅋㅋ"
  ]
};

export const DEATH_MESSAGES = {
  easy: [
    "아아~ 한 대만 더 맞췄으면 내가 이겼는데!",
    "와 대박 진짜 잘 쏘신다 ㅠㅠ",
    "아 핑튄다! 방금 핑 500ms 넘었음 ㅅㄱ!"
  ],
  medium: [
    "인정합니다! 나이스 샷이였네요.",
    "장전할 때 돌격하다니, 머리 썼네용.",
    "까비! 진짜 재미있었어요!"
  ],
  hard: [
    "이번엔 뽀록이네. 다음 판은 내꺼다.",
    "판정이 이상해! 벽 뒤에서 맞는데?",
    "헤드 트래킹은 조금 봐줄 만했음."
  ],
  pro: [
    "핵 의심 신고 박았습니다 ㅎㅎ 비정상 에임 트래킹 ㅅㄱ",
    "일반전에서 빡겜 오지게 하시넼ㅋㅋ 대기실 가셈",
    "타격 판정 보소. 벽 너머 스쳤는데 즉사임?"
  ]
};
