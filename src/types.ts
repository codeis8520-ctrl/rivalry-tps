export type WeaponType = 'pistol' | 'rifle' | 'smg' | 'shotgun' | 'sniper' | 'rpg' | 'katana';

export interface WeaponStats {
  name: string;
  type: WeaponType;
  damage: number;
  headshotMult: number;
  fireRate: number; // millisecond delay between shots
  reloadTime: number; // in seconds
  maxAmmo: number;
  range: number;
  bulletSpeed: number;
  spread: number;
  bulletCount: number; // Multi-bullets for Shotgun
  color: string;
  description: string;
}

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'classified';

export interface WeaponSkin {
  id: string;
  name: string;
  weaponType: WeaponType;
  rarity: Rarity;
  primaryColor: string;
  secondaryColor: string;
  glow: boolean;
  pattern?: 'neon' | 'digital' | 'galaxy' | 'gold_plated' | 'fade' | 'solid';
}

export interface PlayerStats {
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  headshots: number;
  gold: number;
  gems: number;
  level: number;
  xp: number;
  winStreak: number;
  rankedRP?: number; // Optional RP for Ranked Mode
}

export interface BotProfile {
  name: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'pro';
  favoriteWeapon: WeaponType;
  skinId: string;
  avatarColor: string;
  winRate: number;
  kdRate: number;
  badge: string;
  chatReplies?: string[];  // 플레이어 채팅에 반응
  tauntLines?: string[];   // 플레이어 처치 시 도발
  deathLines?: string[];   // 봇 사망 시 반응
  banterLines?: string[];  // 게임 중 주기적 잡담
}

export interface CrosshairSettings {
  size: number;
  thickness: number;
  gap: number;
  color: string;
  outline: boolean;
  outlineColor: string;
  dot: boolean;
  dynamicBloom: boolean;
}

export interface CaseType {
  id: string;
  name: string;
  cost: number;
  currency: 'gold' | 'gems';
  customDescription: string;
  color: string; // Theme color (e.g., golden, purple)
  pool: string[]; // skin IDs in pool
}

export interface GameState {
  playerHealth: number;
  playerMaxHealth: number;
  playerShield: number;
  playerMaxShield: number;
  botHealth: number;
  botMaxHealth: number;
  botShield: number;
  botMaxShield: number;
  playerScore: number;
  botScore: number;
  roundTimeLeft: number;
  isGameOver: boolean;
  winner: 'player' | 'bot' | null;
  roundPhase: 'warmup' | 'active' | 'round_end';
}
