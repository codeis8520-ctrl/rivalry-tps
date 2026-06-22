import { supabase, isSupabaseConfigured } from './supabase';
export { isSupabaseConfigured };
import { PlayerStats, CrosshairSettings, WeaponType } from '../types';
import { DEFAULT_CROSSHAIR } from '../components/CrosshairEditor';

const GAME_DOMAIN = 'rivalry-game.app';
export const toEmail = (username: string) =>
  `${username.trim().toLowerCase()}@${GAME_DOMAIN}`;

export interface PlayerProfile {
  stats: PlayerStats;
  inventory: string[];
  equippedSkins: Record<string, string>;
  loadoutSlots: Record<string, WeaponType>;
  crosshair: CrosshairSettings;
}

const DEFAULT_PROFILE: PlayerProfile = {
  stats: {
    wins: 0, losses: 0, kills: 0, deaths: 0, headshots: 0,
    gold: 300, gems: 10, level: 1, xp: 0, winStreak: 0, rankedRP: 100,
  },
  inventory: ['p_default', 'r_default', 's_default', 'sn_default', 'rpg_default', 'kd_default', 'smg_default'],
  equippedSkins: { pistol: 'p_default', rifle: 'r_default', smg: 'smg_default', shotgun: 's_default', sniper: 'sn_default', rpg: 'rpg_default', katana: 'kd_default' },
  loadoutSlots: { slot1: 'rifle', slot2: 'pistol', slot3: 'katana', slot4: 'rpg' },
  crosshair: DEFAULT_CROSSHAIR,
};

// 회원가입
export async function signUpUser(username: string, password: string): Promise<{ error: string | null }> {
  const email = toEmail(username);

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: formatAuthError(error.message) };
  if (!data.user) return { error: '회원가입에 실패했습니다.' };

  // 프로필 초기화
  const { error: profileError } = await supabase.from('player_profiles').insert({
    user_id: data.user.id,
    username: username.trim(),
    stats: DEFAULT_PROFILE.stats,
    inventory: DEFAULT_PROFILE.inventory,
    equipped_skins: DEFAULT_PROFILE.equippedSkins,
    loadout_slots: DEFAULT_PROFILE.loadoutSlots,
    crosshair: DEFAULT_PROFILE.crosshair,
  });

  if (profileError) {
    console.error('[DB] 프로필 생성 실패:', profileError.message);
    return { error: '프로필 초기화에 실패했습니다. 다시 시도해주세요.' };
  }

  return { error: null };
}

// 로그인
export async function signInUser(username: string, password: string): Promise<{ error: string | null }> {
  const email = toEmail(username);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: formatAuthError(error.message) };
  return { error: null };
}

// 로그아웃
export async function signOutUser(): Promise<void> {
  await supabase.auth.signOut();
}

// 현재 로그인 유저 ID 반환
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// 플레이어 프로필 로드
export async function loadPlayerProfile(userId: string): Promise<PlayerProfile> {
  const { data, error } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.warn('[DB] 프로필 로드 실패, 기본값 사용:', error?.message);
    return DEFAULT_PROFILE;
  }

  const stats = data.stats as PlayerStats;
  if (stats.rankedRP === undefined) stats.rankedRP = 100;

  return {
    stats,
    inventory: data.inventory as string[],
    equippedSkins: data.equipped_skins as Record<string, string>,
    loadoutSlots: data.loadout_slots as Record<string, WeaponType>,
    crosshair: (data.crosshair as CrosshairSettings) ?? DEFAULT_CROSSHAIR,
  };
}

// 플레이어 프로필 저장
export async function savePlayerProfile(userId: string, profile: Partial<PlayerProfile>): Promise<void> {
  const update: Record<string, unknown> = { user_id: userId, updated_at: new Date().toISOString() };
  if (profile.stats)        update.stats         = profile.stats;
  if (profile.inventory)    update.inventory     = profile.inventory;
  if (profile.equippedSkins) update.equipped_skins = profile.equippedSkins;
  if (profile.loadoutSlots) update.loadout_slots = profile.loadoutSlots;
  if (profile.crosshair)    update.crosshair     = profile.crosshair;

  const { error } = await supabase
    .from('player_profiles')
    .upsert(update, { onConflict: 'user_id' });

  if (error) console.error('[DB] 저장 실패:', error.message);
}

// 랭킹 보드 데이터
export interface LeaderboardEntry {
  username: string;
  ranked_rp: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  headshots: number;
  level: number;
  win_streak: number;
  created_at: string;
}

export async function fetchLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('ranked_rp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[DB] 랭킹 보드 로드 실패:', error.message);
    return [];
  }
  return (data as LeaderboardEntry[]) ?? [];
}

// 특정 유저 프로필 공개 조회 (leaderboard 뷰 통해 안전하게)
export async function fetchPublicProfile(username: string): Promise<LeaderboardEntry | null> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) return null;
  return data as LeaderboardEntry;
}

function formatAuthError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return '아이디 또는 비밀번호가 올바르지 않습니다.';
  if (msg.includes('User already registered')) return '이미 사용 중인 아이디입니다.';
  if (msg.includes('Email not confirmed')) return '이메일 인증이 필요합니다. Supabase 대시보드에서 이메일 인증을 비활성화해 주세요.';
  if (msg.includes('Password should be')) return '비밀번호는 최소 6자 이상이어야 합니다.';
  if (msg.includes('rate limit')) return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  return msg;
}
