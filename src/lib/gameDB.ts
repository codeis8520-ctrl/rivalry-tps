import { supabase, isSupabaseConfigured } from './supabase';
export { isSupabaseConfigured };
import { PlayerStats, CrosshairSettings, WeaponType } from '../types';
import { DEFAULT_CROSSHAIR } from '../components/CrosshairEditor';

// ── 비밀번호 해싱 (Web Crypto API, 이메일 없는 커스텀 인증용) ────────────────
const SALT = 'rivalry-tps-2025';
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── 플레이어 프로필 타입 ──────────────────────────────────────────────────────
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

// ── 회원가입 ─────────────────────────────────────────────────────────────────
export async function signUpUser(username: string, password: string): Promise<{ error: string | null }> {
  const trimmed = username.trim();

  // 중복 아이디 확인
  const { data: existing } = await supabase
    .from('game_users')
    .select('username')
    .eq('username', trimmed)
    .maybeSingle();

  if (existing) return { error: '이미 사용 중인 아이디입니다.' };

  const password_hash = await hashPassword(password);

  // game_users 등록
  const { error: userErr } = await supabase
    .from('game_users')
    .insert({ username: trimmed, password_hash });

  if (userErr) {
    if (userErr.code === '23505') return { error: '이미 사용 중인 아이디입니다.' };
    return { error: `회원가입 실패: ${userErr.message}` };
  }

  // player_profiles 초기화
  const { error: profileErr } = await supabase
    .from('player_profiles')
    .insert({
      username: trimmed,
      stats: DEFAULT_PROFILE.stats,
      inventory: DEFAULT_PROFILE.inventory,
      equipped_skins: DEFAULT_PROFILE.equippedSkins,
      loadout_slots: DEFAULT_PROFILE.loadoutSlots,
      crosshair: DEFAULT_PROFILE.crosshair,
    });

  if (profileErr) return { error: `프로필 초기화 실패: ${profileErr.message}` };

  return { error: null };
}

// ── 로그인 ───────────────────────────────────────────────────────────────────
export async function signInUser(username: string, password: string): Promise<{ error: string | null }> {
  const trimmed = username.trim();
  const password_hash = await hashPassword(password);

  const { data, error } = await supabase
    .from('game_users')
    .select('username, password_hash')
    .eq('username', trimmed)
    .maybeSingle();

  if (error) return { error: `로그인 오류: ${error.message}` };
  if (!data) return { error: '존재하지 않는 아이디입니다.' };
  if (data.password_hash !== password_hash) return { error: '비밀번호가 올바르지 않습니다.' };

  return { error: null };
}

// ── 로그아웃 (로컬 세션 정리만, 서버 호출 없음) ────────────────────────────
export async function signOutUser(): Promise<void> {
  // 커스텀 인증이므로 서버 호출 불필요
}

// ── 플레이어 프로필 로드 ──────────────────────────────────────────────────────
export async function loadPlayerProfile(username: string): Promise<PlayerProfile> {
  const { data, error } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('username', username.trim())
    .maybeSingle();

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

// ── 플레이어 프로필 저장 ──────────────────────────────────────────────────────
export async function savePlayerProfile(username: string, profile: Partial<PlayerProfile>): Promise<void> {
  const update: Record<string, unknown> = { username: username.trim(), updated_at: new Date().toISOString() };
  if (profile.stats)         update.stats          = profile.stats;
  if (profile.inventory)     update.inventory      = profile.inventory;
  if (profile.equippedSkins) update.equipped_skins = profile.equippedSkins;
  if (profile.loadoutSlots)  update.loadout_slots  = profile.loadoutSlots;
  if (profile.crosshair)     update.crosshair      = profile.crosshair;

  const { error } = await supabase
    .from('player_profiles')
    .upsert(update, { onConflict: 'username' });

  if (error) console.error('[DB] 저장 실패:', error.message);
}

// ── 랭킹 보드 ────────────────────────────────────────────────────────────────
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

export async function fetchLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('ranked_rp', { ascending: false })
    .limit(limit);

  if (error) { console.error('[DB] 랭킹 로드 실패:', error.message); return []; }
  return (data as LeaderboardEntry[]) ?? [];
}

export async function fetchPublicProfile(username: string): Promise<LeaderboardEntry | null> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error || !data) return null;
  return data as LeaderboardEntry;
}

// ── 전체 유저 목록 (어드민용) ─────────────────────────────────────────────────
export async function fetchAllUsernames(): Promise<string[]> {
  const { data, error } = await supabase
    .from('game_users')
    .select('username')
    .order('username', { ascending: true });

  if (error) { console.error('[DB] 유저 목록 로드 실패:', error.message); return []; }
  return (data ?? []).map((row: { username: string }) => row.username);
}

// ── 어드민: 특정 유저 프로필 직접 수정 ────────────────────────────────────────
export async function adminGrantReward(
  targetUsername: string,
  goldDelta: number,
  gemsDelta: number,
  rpDelta: number,
  skinId?: string,
): Promise<{ error: string | null; newStats?: PlayerStats }> {
  const profile = await loadPlayerProfile(targetUsername);
  const newStats: PlayerStats = {
    ...profile.stats,
    gold: Math.max(0, (profile.stats.gold ?? 0) + goldDelta),
    gems: Math.max(0, (profile.stats.gems ?? 0) + gemsDelta),
    rankedRP: Math.max(100, (profile.stats.rankedRP ?? 100) + rpDelta),
  };

  const newInventory = skinId && skinId !== 'none' && !profile.inventory.includes(skinId)
    ? [...profile.inventory, skinId]
    : profile.inventory;

  const { error } = await supabase
    .from('player_profiles')
    .upsert(
      { username: targetUsername, stats: newStats, inventory: newInventory, updated_at: new Date().toISOString() },
      { onConflict: 'username' },
    );

  if (error) return { error: `지급 실패: ${error.message}` };
  return { error: null, newStats };
}
