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
    reloadTime: 0.1,
    maxAmmo: 1,
    range: 120,
    bulletSpeed: 18,
    spread: 0.0,
    bulletCount: 1,
    color: '#ec4899',
    description: '치명적인 사신의 큰 낫입니다. 고속 질주 대시를 가동하여 정면에 포착된 모든 적을 일도양단합니다.',
  },
  revolver: {
    name: '.357 매그넘 리볼버',
    type: 'revolver',
    damage: 52,
    headshotMult: 2.8,
    fireRate: 580,
    reloadTime: 2.5,
    maxAmmo: 6,
    range: 560,
    bulletSpeed: 17,
    spread: 0.013,
    bulletCount: 1,
    color: '#d97706',
    description: '육혈포 고압 매그넘 권총입니다. 느리지만 한 발 한 발의 위력이 압도적이며 헤드샷 시 즉사에 가까운 피해를 입힙니다.',
  },
  minigun: {
    name: 'M134 미니건',
    type: 'minigun',
    damage: 9,
    headshotMult: 1.3,
    fireRate: 45,
    reloadTime: 5.0,
    maxAmmo: 150,
    range: 400,
    bulletSpeed: 14,
    spread: 0.09,
    bulletCount: 1,
    color: '#f59e0b',
    description: '6연장 회전 바렐 미니건입니다. 초당 20발 이상의 물량 공세로 적 진영 전체를 탄막으로 가득 채웁니다.',
  },
  lmg: {
    name: 'M249 경기관총',
    type: 'lmg',
    damage: 20,
    headshotMult: 1.7,
    fireRate: 95,
    reloadTime: 4.5,
    maxAmmo: 80,
    range: 550,
    bulletSpeed: 16,
    spread: 0.048,
    bulletCount: 1,
    color: '#f97316',
    description: '분대 지원 경기관총입니다. 80발 대용량 탄띠로 지속적인 압도적 화력을 제공합니다. 재장전이 오래 걸립니다.',
  },
  crossbow: {
    name: '택티컬 크로스보우',
    type: 'crossbow',
    damage: 90,
    headshotMult: 2.5,
    fireRate: 1800,
    reloadTime: 2.0,
    maxAmmo: 4,
    range: 700,
    bulletSpeed: 19,
    spread: 0.003,
    bulletCount: 1,
    color: '#8b5cf6',
    description: '정밀 전술 크로스보우입니다. 소음 없이 강력한 볼트 하나로 적을 일격에 제압합니다. 헤드샷 시 치명적입니다.',
  },
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
  { id: 'rpg_galaxy', name: '은하 대파괴 코스믹 수류탄', weaponType: 'rpg', rarity: 'legendary', primaryColor: '#7c3aed', secondaryColor: '#020617', glow: true, pattern: 'galaxy' },

  // --- Revolver skins ---
  { id: 'rv_default', name: '냉간 단조 고압 강철 리볼버', weaponType: 'revolver', rarity: 'common', primaryColor: '#78716c', secondaryColor: '#292524', glow: false, pattern: 'solid' },
  { id: 'rv_crimson', name: '피의 심판 크림슨 리볼버', weaponType: 'revolver', rarity: 'rare', primaryColor: '#dc2626', secondaryColor: '#0f172a', glow: false, pattern: 'fade' },
  { id: 'rv_void', name: '공허의 총구 보이드 리볼버', weaponType: 'revolver', rarity: 'epic', primaryColor: '#6366f1', secondaryColor: '#020617', glow: true, pattern: 'galaxy' },
  { id: 'rv_gold', name: '황금 건슬링어 리볼버', weaponType: 'revolver', rarity: 'legendary', primaryColor: '#f59e0b', secondaryColor: '#78350f', glow: true, pattern: 'gold_plated' },
  { id: 'rv_sakura', name: '벚꽃 총잡이 사쿠라 리볼버', weaponType: 'revolver', rarity: 'rare', primaryColor: '#ec4899', secondaryColor: '#fce7f3', glow: false, pattern: 'fade' },
  { id: 'rv_classified', name: '심연의 처형자 다크매터 리볼버', weaponType: 'revolver', rarity: 'classified', primaryColor: '#4c0519', secondaryColor: '#4f46e5', glow: true, pattern: 'galaxy' },

  // --- Minigun skins ---
  { id: 'mg_default', name: '전쟁 기계 냉간 강철 미니건', weaponType: 'minigun', rarity: 'common', primaryColor: '#374151', secondaryColor: '#111827', glow: false, pattern: 'solid' },
  { id: 'mg_neon', name: '사이버 포격기 네온 미니건', weaponType: 'minigun', rarity: 'rare', primaryColor: '#06b6d4', secondaryColor: '#1e1b4b', glow: false, pattern: 'neon' },
  { id: 'mg_inferno', name: '지옥불 학살자 인페르노 미니건', weaponType: 'minigun', rarity: 'epic', primaryColor: '#ef4444', secondaryColor: '#b45309', glow: true, pattern: 'fade' },
  { id: 'mg_galaxy', name: '은하 폭풍 코스믹 미니건', weaponType: 'minigun', rarity: 'legendary', primaryColor: '#7c3aed', secondaryColor: '#1d4ed8', glow: true, pattern: 'galaxy' },
  { id: 'mg_classified', name: '절멸의 신기 타이탄 미니건', weaponType: 'minigun', rarity: 'classified', primaryColor: '#f59e0b', secondaryColor: '#dc2626', glow: true, pattern: 'gold_plated' },

  // --- LMG skins ---
  { id: 'lmg_default', name: '분대 지원 밀리터리 경기관총', weaponType: 'lmg', rarity: 'common', primaryColor: '#1e293b', secondaryColor: '#0f172a', glow: false, pattern: 'solid' },
  { id: 'lmg_neon', name: '전격 폭풍 네온 LMG', weaponType: 'lmg', rarity: 'rare', primaryColor: '#06b6d4', secondaryColor: '#1e1b4b', glow: false, pattern: 'neon' },
  { id: 'lmg_desert', name: '사막 폭풍 디지털 카모 LMG', weaponType: 'lmg', rarity: 'rare', primaryColor: '#d97706', secondaryColor: '#451a03', glow: false, pattern: 'digital' },
  { id: 'lmg_dragon', name: '용의 포효 드래곤 LMG', weaponType: 'lmg', rarity: 'legendary', primaryColor: '#f97316', secondaryColor: '#ca8a04', glow: true, pattern: 'galaxy' },
  { id: 'lmg_classified', name: '전장의 신 워갓 LMG', weaponType: 'lmg', rarity: 'classified', primaryColor: '#dc2626', secondaryColor: '#7c3aed', glow: true, pattern: 'galaxy' },

  // --- Crossbow skins ---
  { id: 'cb_default', name: '숲의 정령 고목 크로스보우', weaponType: 'crossbow', rarity: 'common', primaryColor: '#3f2b0a', secondaryColor: '#166534', glow: false, pattern: 'solid' },
  { id: 'cb_crimson', name: '피의 화살 크림슨 크로스보우', weaponType: 'crossbow', rarity: 'rare', primaryColor: '#dc2626', secondaryColor: '#1c1917', glow: false, pattern: 'fade' },
  { id: 'cb_shadow', name: '암흑 저격 다크 크로스보우', weaponType: 'crossbow', rarity: 'epic', primaryColor: '#1e1b4b', secondaryColor: '#6366f1', glow: true, pattern: 'galaxy' },
  { id: 'cb_gold', name: '황금 전설의 크로스보우', weaponType: 'crossbow', rarity: 'legendary', primaryColor: '#f59e0b', secondaryColor: '#064e3b', glow: true, pattern: 'gold_plated' },
  { id: 'cb_classified', name: '신의 화살 디바인 크로스보우', weaponType: 'crossbow', rarity: 'classified', primaryColor: '#a855f7', secondaryColor: '#ec4899', glow: true, pattern: 'galaxy' },
];

export const CASES: CaseType[] = [
  {
    id: 'case_recruit',
    name: '신병 지원 보급 클래식 상자',
    cost: 150,
    currency: 'gold',
    customDescription: '기본적인 전투 훈련 및 장비 보급을 위한 전술 보물 상자입니다. 표준 클래식 위장 스킨들을 얻을 수 있습니다.',
    color: '#475569',
    pool: ['p_default', 'p_forest', 'r_default', 's_default', 'sn_default', 'rpg_default', 'kd_default', 'smg_default', 'sn_phantom', 's_ghost', 'rv_default', 'mg_default', 'lmg_default', 'cb_default']
  },
  {
    id: 'case_tactical',
    name: '택티컬 네온 야광 스킨 상자',
    cost: 500,
    currency: 'gold',
    customDescription: '특수 독성 화합물 형광 코팅과 전술적 경고 디지털 카모플라주 테인티드 레이아웃 컬렉션입니다.',
    color: '#0d9488',
    pool: ['p_neon', 'p_electric', 'p_sakura', 'r_digital', 'r_arctic', 's_toxic', 's_acid', 'sn_blizzard', 'kd_plasma', 'kd_crimson', 'rpg_nuclear', 'rpg_crimson', 'smg_neon', 'rv_crimson', 'rv_sakura', 'mg_neon', 'lmg_neon', 'lmg_desert', 'cb_crimson']
  },
  {
    id: 'case_classified',
    name: '엘리트 기밀 최상급 특급 소켓상자',
    cost: 80,
    currency: 'gems',
    customDescription: '차원을 왜곡하는 갤럭시 소용돌이 패턴과 찬란한 주권자 리전 무구 스킨셋을 영구 수집할 수 있는 최고급 보상 상자입니다.',
    color: '#7c3aed',
    pool: ['p_gold', 'p_shadow', 'p_jade', 'r_magma', 'r_hyper', 'r_shadow', 'r_dragon', 'r_crimson', 's_void', 's_inferno', 'sn_nebula', 'sn_dragon', 'sn_emerald', 'sn_crimson', 'kd_secret', 'kd_samurai', 'kd_oni', 'smg_storm', 'smg_gold', 'smg_void', 'rpg_galaxy', 'rv_void', 'rv_gold', 'rv_classified', 'mg_inferno', 'mg_galaxy', 'mg_classified', 'lmg_dragon', 'lmg_classified', 'cb_shadow', 'cb_gold', 'cb_classified']
  }
];

export const BOTS: BotProfile[] = [
  // ─── EASY ──────────────────────────────────────────────────────────────────
  {
    name: '칼침놓는뉴비킬러',
    title: '동네 허접한 훈련병',
    difficulty: 'easy',
    favoriteWeapon: 'shotgun',
    skinId: 's_default',
    avatarColor: '#10b981',
    winRate: 34,
    kdRate: 0.65,
    badge: '브론즈 I',
    chatReplies: ['저 아직 배우는 중이에요 ㅠㅠ', '총이 왜 안 맞죠...?', '헉 맞혔다! 제가요?', '재미있는데 너무 어려워요'],
    tauntLines: ['어? 이겼어요? 우와!', '헤헤 맞춰버렸다ㅋㅋ', '초보가 이겼어요 ㅎㅎ', '운이 좋았던 건가요?'],
    deathLines: ['역시 어렵네요 ㅠ', '에이 한 번만 더 하면 이길 텐데...', '망했다ㅠㅠ 핑 탓이에요', '다음엔 진짜 이길 거예요!'],
    banterLines: ['근데 맵이 어디가 끝이에요?', '총알이 다 떨어졌어요 어떡하죠', '저 지금 숨어 있어요 ㅎㅎ', '너무 긴장돼서 손이 떨려요']
  },
  {
    name: '겁쟁이_도망러',
    title: '영원한 후퇴 전문가',
    difficulty: 'easy',
    favoriteWeapon: 'pistol',
    skinId: 'p_forest',
    avatarColor: '#6ee7b7',
    winRate: 28,
    kdRate: 0.45,
    badge: '브론즈 III',
    chatReplies: ['으악 오지 마세요!', '잠깐만요 장전 중이에요!', '전 비겁한 게 아니라 전략적인 거예요', '뒤에서 기다리면 이길 수 있어요...'],
    tauntLines: ['뒤에서 치면 비겁한 거 아니라고요!', '도망치다 맞춘 거예요 ㅋ', '살아남는 게 이기는 거 아닌가요?', '앗 진짜 맞췄다!'],
    deathLines: ['도망 속도가 부족했어...', '조금만 더 빨리 달렸으면!', '으아아 결국 잡혔다', '다음엔 더 빨리 도망갈게요'],
    banterLines: ['지금 어디 있어요? 제가 안 보이는 데 있으면 안전한 거죠?', '전 지금 맵 구석에 있어요', '총소리 나면 반사적으로 도망가게 돼요', '살아 있으면 이기는 거 아닌가요?']
  },
  {
    name: '폼잡기장인',
    title: '겉멋 가득 허세왕',
    difficulty: 'easy',
    favoriteWeapon: 'smg',
    skinId: 'smg_default',
    avatarColor: '#fb923c',
    winRate: 31,
    kdRate: 0.58,
    badge: '브론즈 II',
    chatReplies: ['제 무빙 봤어요? 완전 프로 같죠?', '스킨은 프로급인데 실력이 좀...', '폼만 좋으면 되는 거 아닌가요', '이 정도면 유튜브 올릴 만하죠?'],
    tauntLines: ['역시 나야 나 폼 미쳤잖아', '클립 각 나왔다 ㅋㅋ', '이 무빙 좀 봐 완전 프로 아니야?', '형 진짜 잘생겼지? 총도 잘 쏘고'],
    deathLines: ['핑 때문이에요 진짜로요', '방금 제 무빙 봤어요? 폼은 완벽했잖아요', '에이 일부러 진 거예요', '잠깐 리셋 하고 올게요'],
    banterLines: ['제 스킨 이쁘죠?', '지금 무빙 연습 중이에요', '폼은 제가 완전 프로급이에요', '근데 왜 총알이 안 맞죠']
  },

  // ─── MEDIUM ────────────────────────────────────────────────────────────────
  {
    name: '러너_스피드스타',
    title: '파쿠르 중독자',
    difficulty: 'medium',
    favoriteWeapon: 'pistol',
    skinId: 'p_neon',
    avatarColor: '#e11d48',
    winRate: 48,
    kdRate: 0.95,
    badge: '실버 III',
    chatReplies: ['무빙이 느리시네요~', '제 발이 더 빠를걸요?', '도망치면 이길 수 없죠', '다시 달려볼까요~'],
    tauntLines: ['따라올 수 있으면 따라와봐요~', '스피드가 전부야!', '빠른 게 이기는 거라고!', '못 맞추지? 헤헤~'],
    deathLines: ['이번엔 발이 좀 느렸네...', '다음엔 더 빠르게 도망갈게요', '에이 발목 잡혔다', '속도가 충분하지 않았어'],
    banterLines: ['지금 맵 반 바퀴 돌았어요', '가만히 있으면 죽어요~', '전 벌써 풀충전이에요', '빠르게 움직이세요!']
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
    badge: '골드 II',
    chatReplies: ['탄약 드릴까요? ㅋㅋ', '총알 많이 있어요 걱정 마세요', '빗나가도 언젠간 맞아요', '확률 게임이에요 이건!'],
    tauntLines: ['결국엔 맞아요ㅋ 탄이 많으니까!', '난사의 신이 강림하셨습니다', '한 발은 맞겠지 했더니 맞네', '탄막이 정답이야!'],
    deathLines: ['장전할 타이밍을 놓쳤어...', '탄이 좀 더 있었으면...', '마지막 탄을 아꼈어야 했나', '에이 운이 없었어'],
    banterLines: ['저 지금 탄약 3통 채웠어요', '총소리가 좋아요 팡팡팡!', '에임은 운이에요', '난사하면 언젠간 맞겠지']
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
    badge: '골드 III',
    chatReplies: ['압박감 느껴지나요?', '빠른 연사가 최고야', '멈추면 죽는 거야', 'SMG는 인생이지'],
    tauntLines: ['연사 속도 따라올 수 있어?', '빗자루로 쓸어버렸다!', '압박압박압박!', '느린 자는 죽는 법이야'],
    deathLines: ['장전 중에 당했어...', '좀 더 빨랐어야 했는데', '탄이 다 떨어졌을 때 왜 공격하는 거야', '에이 타이밍이 아쉽네'],
    banterLines: ['지금 연사 속도 최고 상태예요', '탄이 끝없이 나오는 것 같죠?', '압박 느끼고 있어요?', '쉬지 않는 게 제 스타일이에요']
  },
  {
    name: '한방의사나이',
    title: '로망 저격수 지망생',
    difficulty: 'medium',
    favoriteWeapon: 'sniper',
    skinId: 'sn_phantom',
    avatarColor: '#a3e635',
    winRate: 50,
    kdRate: 1.05,
    badge: '실버 I',
    chatReplies: ['한 발에 끝내는 게 진짜 실력이죠', '저격은 로망이에요', '움직이지 마세요 조준 맞추게', '저격총 장전 소리가 멋있지 않나요?'],
    tauntLines: ['한 방이면 충분해!', '저격이 성공했다!', '원샷원킬이 이 맛이지', '움직이지 말라고 했잖아요~'],
    deathLines: ['저격은 운이 조금 필요해...', '조준이 살짝 빗나갔네', '빠르게 움직이는 건 반칙이에요', '다음 판엔 반드시 맞춰줄게요'],
    banterLines: ['저격 각도 잡는 중이에요', '좋은 포지션 찾았어요', '움직임 패턴 읽고 있어요', '다음 탄은 반드시 헤드예요']
  },
  {
    name: '폭탄마_박격포',
    title: 'RPG 광신자',
    difficulty: 'medium',
    favoriteWeapon: 'rpg',
    skinId: 'rpg_crimson',
    avatarColor: '#f97316',
    winRate: 47,
    kdRate: 0.90,
    badge: '실버 II',
    chatReplies: ['폭발이 최고야!', '맵 날려버릴 거야', '한 방에 얼마나 넓게 터지는지 봐요', 'RPG는 예술이에요'],
    tauntLines: ['펑! 그게 다야', '폭발로 끝내는 느낌 최고야', '터뜨렸다!', '맵 다 날려버리겠어'],
    deathLines: ['장전이 너무 느려...', '다음엔 더 정확히 노릴게요', '폭발 범위 안에 없었나봐', '에이 투척 각도가 틀렸어'],
    banterLines: ['지금 최적 투척 각도 계산 중이에요', '폭발은 늘 짜릿하죠', '투척선 보이죠?', '다음 폭탄 준비됐어요']
  },

  // ─── HARD ──────────────────────────────────────────────────────────────────
  {
    name: '전장의원샷원킬',
    title: '고요한 암살요원',
    difficulty: 'hard',
    favoriteWeapon: 'sniper',
    skinId: 'sn_blizzard',
    avatarColor: '#84cc16',
    winRate: 64,
    kdRate: 1.45,
    badge: '플래티넘 IV',
    chatReplies: ['대가리 조심해', '이미 조준 끝났어', '무빙이 다 읽혀', '긴장하지 마 금방 끝나니까'],
    tauntLines: ['한 발이면 충분해. 대가리 조심하라고.', '무빙이 다 읽혀. 어딜 봐도 같아.', '조용히 끝내는 거야.', '저격이란 이런 거야.'],
    deathLines: ['이번엔 뽀록이네. 다음 판은 내꺼다.', '판정이 이상해! 벽 뒤에서 맞는데?', '헤드 트래킹은 조금 봐줄 만했음.', '운이 좋았네, 다음엔 없어.'],
    banterLines: ['네 포지션 다 보여', '스코프 안에 이미 있어', '이 각도에서 못 피해', '뛰어봤자 범위 안이야']
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
    badge: '플래티넘 II',
    chatReplies: ['탄막 뚫을 수 있어?', '연사 속도 체감되지?', '멈추면 죽어', '피하는 것도 한계가 있어'],
    tauntLines: ['탄막이 이렇게 무서워', '연사로 누르면 끝이야', '피할 공간이 없었지?', 'SMG 특화 빌드 맛봐'],
    deathLines: ['탄이 좀 더 있었으면...', '장전이 아쉬웠어', '거리 조절 실패했네', '다음엔 더 가까이 붙을게'],
    banterLines: ['지금 탄약 풀이야', '거리 좁히는 중이야', '각도 잡고 있어', '그 자리에서 벗어나']
  },
  {
    name: '무쌍이도류_낫빌런',
    title: '접근전 인간 재앙',
    difficulty: 'hard',
    favoriteWeapon: 'katana',
    skinId: 'kd_oni',
    avatarColor: '#dc2626',
    winRate: 66,
    kdRate: 1.55,
    badge: '플래티넘 III',
    chatReplies: ['총보다 낫이 빠르다', '가까이 오면 나가는 거야', '근접이 진짜 싸움이야', '대시 한 번이면 끝이야'],
    tauntLines: ['총 필요 없어. 낫 하나면 돼.', '대시로 순삭이지', '근접전은 내 구역이야', '칼 앞에 총이 무슨 소용이야'],
    deathLines: ['거리가 너무 멀었어...', '원거리에서 당하다니', '접근만 했으면 이겼는데', '대시 타이밍이 틀렸어'],
    banterLines: ['거리 좁히는 중이야', '대시 쿨타임 됐어', '가까이 오면 네가 죽어', '낫 들고 달려가는 중이야']
  },
  {
    name: '정밀저격_헤드헌터',
    title: '헤드샷 수집가',
    difficulty: 'hard',
    favoriteWeapon: 'sniper',
    skinId: 'sn_emerald',
    avatarColor: '#059669',
    winRate: 71,
    kdRate: 1.80,
    badge: '다이아몬드 IV',
    chatReplies: ['헤드 각 나왔다', '조준선 중앙에 이미 있어', '몇 번 더 움직여봐', '피해봤자 패턴 읽혀'],
    tauntLines: ['헤드샷 컬렉션 하나 추가', '정밀이란 이런 거야', '조준 잡는 데 0.3초면 충분해', '머리 위치 기억해둬'],
    deathLines: ['판정이 좀 이상했는데...', '조준 완성 직전이었어', '한 발 더 있었으면', '운이 내 편이 아니었네'],
    banterLines: ['머리 위치 기억해뒀어', '조준 완성 중이야', '숨어도 보여', '3발 이내로 끝낼 거야']
  },

  // ─── PRO ───────────────────────────────────────────────────────────────────
  {
    name: '로블록스챔피언임',
    title: '아레나 살아있는 전설',
    difficulty: 'pro',
    favoriteWeapon: 'sniper',
    skinId: 'sn_dragon',
    avatarColor: '#f59e0a',
    winRate: 78,
    kdRate: 2.10,
    badge: '다이아몬드 I',
    chatReplies: ['점수 보내드릴게요 ㅎ', '이 실력에 여기 오셨어요?', '자동화 에임이 아니에요 걱정 마요', '다음 매치는 좀 더 어려운 사람 불러요'],
    tauntLines: ['깔끔하게 게임 끄시는 걸 추천함 ㅎㅎ', '공짜 매치 점수 달달하네! 기부 ㄳㄳ', '이게 기부천사들의 따사로운 온정인가요?', '클립각 나왔다! 바로 유튜브 박제해드림 ㅋㅋ'],
    deathLines: ['핵 의심 신고 박았습니다 ㅎㅎ', '일반전에서 빡겜 오지게 하시넼ㅋㅋ 대기실 가셈', '타격 판정 보소. 벽 너머 스쳤는데 즉사임?', '실수야 실수, 리셋 후 바로 복수할게'],
    banterLines: ['이 포지션 완전 천국이야', '지금 클립 녹화 중이에요 ㅋ', '뭘 해도 다 읽혀', '여기서 몇 판 더 버텨봐']
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
    badge: '챔피언',
    chatReplies: ['입력 수신 완료.', '저항은 비효율적입니다.', '패턴 분석 99% 완료.', '결과는 이미 정해져 있어.'],
    tauntLines: ['처리 완료.', '예측대로야.', '변수가 없는 매치야.', '다음.'],
    deathLines: ['버그가 발생했습니다.', '예상치 못한 변수.', '데이터를 재보정합니다.', '오차 범위 초과. 흥미롭네.'],
    banterLines: ['현재 처리 중입니다.', '모든 동선 계산됐어.', '에너지 소모가 아깝지 않니?', '결과 변수 없음.']
  },
  {
    name: '클립빌런_영상박제',
    title: '유튜브 클립 수집가',
    difficulty: 'pro',
    favoriteWeapon: 'rifle',
    skinId: 'r_crimson',
    avatarColor: '#ef4444',
    winRate: 82,
    kdRate: 2.60,
    badge: '그랜드마스터',
    chatReplies: ['지금 녹화 중이에요 ㅋㅋ', '이 클립 구독자들한테 보여줄게요', '방금 거 편집해서 올릴게요', '조회수 100만은 찍겠는데?'],
    tauntLines: ['클립 각 나왔다 ㅋㅋ 박제야 박제', '이 장면 썸네일 쓸게요 ㅎ', '구독자들이 좋아하겠는데', '영상 올리면 알려드릴게요 ㅋ'],
    deathLines: ['이건 편집할 부분이야', '이 장면은 컷이야 ㅋ', '이런 거 올리면 구독 줄어', '잠깐 녹화 중지하고 올게요'],
    banterLines: ['지금 최고 클립 나오는 중이야', '구독 눌러요 ㅎㅎ', '이 각도가 최고의 클립각이야', '편집하면서 볼 장면 만드는 중']
  },
  {
    name: '다크엔젤_심판자',
    title: '냉혹한 처형의 사자',
    difficulty: 'pro',
    favoriteWeapon: 'katana',
    skinId: 'kd_plasma',
    avatarColor: '#6d28d9',
    winRate: 85,
    kdRate: 2.90,
    badge: '그랜드마스터',
    chatReplies: ['말 필요 없어.', '다가오면 끝이야.', '탈출구는 없어.', '포기하는 게 빨라.'],
    tauntLines: ['심판은 내렸어.', '저항은 무의미했어.', '이미 끝났어.', '다음 라운드도 결과는 같아.'],
    deathLines: ['...흥미롭군.', '방심했어.', '다시 한번.', '이 오차는 없애겠어.'],
    banterLines: ['네 뒤를 항상 보고 있어.', '포위 중이야.', '이미 끝난 싸움이야.', '빠져나갈 방향이 없어.']
  },
  {
    name: '건슬링어_레드',
    title: '6연발의 서부 사나이',
    difficulty: 'medium',
    favoriteWeapon: 'revolver',
    skinId: 'rv_crimson',
    avatarColor: '#dc2626',
    winRate: 54,
    kdRate: 1.15,
    badge: '골드',
    chatReplies: ['총은 빠르게 뽑는 자가 이기는 법이지.', '6발이면 충분해.', '서부에선 말보단 총이 먼저야.', '겁나면 숨어.'],
    tauntLines: ['탕! 끝났네.', '육혈포 한 방이면 충분하지.', '빠르게 뽑았지만 빠르게 죽었네.', '서부의 법칙이야.'],
    deathLines: ['총알이 빨랐네...', '다음엔 더 빠르게 뽑겠어.', '탄창이 비었어.', '서부에서 지다니.'],
    banterLines: ['6발 세고 있어?', '내 총 소리 들었어?', '조준 연습 좀 해봐.', '리볼버가 최고야.']
  },
  {
    name: '탄막왕_맥스파이어',
    title: '끝없는 탄막의 지배자',
    difficulty: 'hard',
    favoriteWeapon: 'minigun',
    skinId: 'mg_inferno',
    avatarColor: '#f59e0b',
    winRate: 68,
    kdRate: 1.80,
    badge: '플래티넘',
    chatReplies: ['탄막이 부족하다고? ㅋ', '150발 준비됐어.', '도망쳐봤자 총알이 더 빨라.', '포탄 세지 마.'],
    tauntLines: ['150발 다 맞은 거야?', '탄막 속에서 살아남을 수 있어?', '미니건 앞에서 버틴 건 칭찬해.', '다음엔 더 쏴줄게.'],
    deathLines: ['탄창이 비었을 때 틈을 노리다니...', '재장전 타이밍이 최악이었어.', '5초만 버텼으면...', '탄막왕의 몰락이군.'],
    banterLines: ['지금 배럴 돌아가는 소리 들려?', '탄피 피해.', '불꽃놀이 시작이야.', '화력이 부족한 적은 없어.']
  },
  {
    name: '고요한_저격수_유령',
    title: '침묵의 크로스보우 사냥꾼',
    difficulty: 'hard',
    favoriteWeapon: 'crossbow',
    skinId: 'cb_shadow',
    avatarColor: '#6366f1',
    winRate: 72,
    kdRate: 2.10,
    badge: '다이아몬드',
    chatReplies: ['소리 없는 화살이 더 무서워.', '피할 수 없어.', '이미 조준했어.', '...'],
    tauntLines: ['볼트 하나면 충분했어.', '소리도 못 들었지?', '조용한 게 더 무서운 법이야.', '피하려 했지만 늦었어.'],
    deathLines: ['화살이 빗나갔어...', '재장전 중이었는데.', '4발 중 마지막이었는데.', '침묵이 깨졌군.'],
    banterLines: ['내 화살 소리 못 들었지?', '4발이면 충분해.', '조준하고 있어.', '크로스보우가 최강이야.']
  },
  {
    name: '철벽_중화기_박사',
    title: '80발 분대지원 전문가',
    difficulty: 'medium',
    favoriteWeapon: 'lmg',
    skinId: 'lmg_dragon',
    avatarColor: '#f97316',
    winRate: 58,
    kdRate: 1.30,
    badge: '실버',
    chatReplies: ['화력 압도가 전략이야.', '80발이면 부족해?', '도망가도 소용없어.', '탄띠 준비됐어.'],
    tauntLines: ['80발 중 몇 발이나 맞았어?', '화력 앞에 전략은 없어.', '분대가 있었다면 살았을 텐데.', '탄띠 끝날 때까지 버텼네.'],
    deathLines: ['재장전이 너무 길었어...', '탄이 떨어질 줄 몰랐어.', '화력으로 눌러야 했는데.', '다음엔 더 쏴야지.'],
    banterLines: ['탄띠 소리 들려?', '화력이 전술이야.', '재장전 타이밍 조심해.', '80발 카운트다운 중.']
  }
];

export const TAUNT_MESSAGES = {
  easy: [
    "헉, 맞추려면 어떻게 가늠좌 대죠?",
    "와 복장 이쁘다! 어디서 파나요?",
    "아악! 제발 쏘지 말아주세요!",
    "우리 벌써 시작한 건가염?",
    "어? 이겼어요? 우와!",
    "헤헤 맞춰버렸다ㅋㅋ",
    "초보가 이겼어요 ㅎㅎ",
    "운이 좋았던 건가요?",
    "와 대박! 저도 할 수 있잖아요!"
  ],
  medium: [
    "좋은 승부구만! 누가 이길지 어디 봅시다.",
    "조심해용, 제 손가락이 오늘 에임 고정이네여.",
    "무빙은 합격인데 과연 내 샷도 피할까?",
    "어차피 금방 끝날 매치임!",
    "결국엔 맞아요ㅋ 탄이 많으니까!",
    "연사 속도 따라올 수 있어?",
    "한 방이면 충분해!",
    "따라올 수 있으면 따라와봐요~",
    "나이스~ 이 맛에 게임하죠"
  ],
  hard: [
    "한 방이면 충분해. 대가리 조심하라고.",
    "너무 굼뜬걸. 에임 집중 안 하냐?",
    "여기가 진짜 랭킹 최고 수준 매칭 맞아?",
    "움직임이 다 읽히네. 무빙 좀 꼬아봐.",
    "탄막이 이렇게 무서워",
    "총 필요 없어. 낫 하나면 돼.",
    "헤드샷 컬렉션 하나 추가",
    "조용히 끝내는 거야.",
    "피할 공간이 없었지?"
  ],
  pro: [
    "깔끔하게 게임 끄시는 걸 추천함 ㅎㅎ",
    "공짜 매치 점수 달달하네! 기부 ㄳㄳ",
    "이게 기부천사들의 따사로운 온정인가요?",
    "클립각 나왔다! 바로 유튜브 박제해드림 ㅋㅋ",
    "처리 완료.",
    "심판은 내렸어.",
    "클립 각 나왔다 ㅋㅋ 박제야 박제",
    "예측대로야.",
    "이미 끝났어."
  ]
};

export const DEATH_MESSAGES = {
  easy: [
    "아아~ 한 대만 더 맞췄으면 내가 이겼는데!",
    "와 대박 진짜 잘 쏘신다 ㅠㅠ",
    "아 핑튄다! 방금 핑 500ms 넘었음 ㅅㄱ!",
    "역시 어렵네요 ㅠ",
    "에이 한 번만 더 하면 이길 텐데...",
    "망했다ㅠㅠ 핑 탓이에요",
    "다음엔 진짜 이길 거예요!",
    "도망 속도가 부족했어...",
    "핑 때문이에요 진짜로요"
  ],
  medium: [
    "인정합니다! 나이스 샷이였네요.",
    "장전할 때 돌격하다니, 머리 썼네용.",
    "까비! 진짜 재미있었어요!",
    "이번엔 발이 좀 느렸네...",
    "장전할 타이밍을 놓쳤어...",
    "저격은 운이 조금 필요해...",
    "다음엔 더 빨리 도망갈게요",
    "탄이 좀 더 있었으면...",
    "에이 타이밍이 아쉽네"
  ],
  hard: [
    "이번엔 뽀록이네. 다음 판은 내꺼다.",
    "판정이 이상해! 벽 뒤에서 맞는데?",
    "헤드 트래킹은 조금 봐줄 만했음.",
    "운이 좋았네, 다음엔 없어.",
    "탄이 좀 더 있었으면...",
    "거리가 너무 멀었어...",
    "한 발 더 있었으면",
    "접근만 했으면 이겼는데",
    "다음엔 더 가까이 붙을게"
  ],
  pro: [
    "핵 의심 신고 박았습니다 ㅎㅎ 비정상 에임 트래킹 ㅅㄱ",
    "일반전에서 빡겜 오지게 하시넼ㅋㅋ 대기실 가셈",
    "타격 판정 보소. 벽 너머 스쳤는데 즉사임?",
    "버그가 발생했습니다.",
    "...흥미롭군.",
    "이건 편집할 부분이야",
    "실수야 실수, 리셋 후 바로 복수할게",
    "예상치 못한 변수.",
    "방심했어."
  ]
};
