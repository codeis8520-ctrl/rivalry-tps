import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerStats, CrosshairSettings, BotProfile, WeaponSkin, WeaponType } from './types';
import { DEFAULT_CROSSHAIR } from './components/CrosshairEditor';
import { Lobby } from './components/Lobby';
import { GameCanvas } from './components/GameCanvas';
import { AuthScreen } from './components/AuthScreen';
import { gameAudio } from './audio';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { loadPlayerProfile, savePlayerProfile, signOutUser, getCurrentUserId } from './lib/gameDB';

const DEFAULT_STATS: PlayerStats = {
  wins: 0, losses: 0, kills: 0, deaths: 0, headshots: 0,
  gold: 300, gems: 10, level: 1, xp: 0, winStreak: 0, rankedRP: 100,
};
const DEFAULT_INVENTORY = ['p_default', 'r_default', 's_default', 'sn_default', 'rpg_default', 'kd_default', 'smg_default'];
const DEFAULT_EQUIPPED: Record<string, string> = { pistol: 'p_default', rifle: 'r_default', smg: 'smg_default', shotgun: 's_default', sniper: 'sn_default', rpg: 'rpg_default', katana: 'kd_default' };
const DEFAULT_LOADOUT: Record<string, WeaponType> = { slot1: 'rifle', slot2: 'pistol', slot3: 'katana', slot4: 'rpg' };

// localStorage 헬퍼
const ls = {
  get: <T,>(key: string, fallback: T): T => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (key: string, value: unknown) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  },
};

export default function App() {
  const [screen, setScreen] = useState<'lobby' | 'game'>('lobby');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);
  const [inventory, setInventory] = useState<string[]>(DEFAULT_INVENTORY);
  const [equippedSkins, setEquippedSkins] = useState<Record<string, string>>(DEFAULT_EQUIPPED);
  const [loadoutSlots, setLoadoutSlots] = useState<Record<string, WeaponType>>(DEFAULT_LOADOUT);
  const [crosshair, setCrosshair] = useState<CrosshairSettings>(DEFAULT_CROSSHAIR);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [activeSession, setActiveSession] = useState<{
    bot: BotProfile;
    botSkin: WeaponSkin;
    loadoutSlots: Record<string, WeaponType>;
    equippedSkins: Record<string, string>;
    gameMode: 'casual' | 'ranked';
  } | null>(null);

  const [lastRankedReport, setLastRankedReport] = useState<{
    win: boolean; rpChange: number; oldRP: number; newRP: number; botName: string;
  } | null>(null);

  // Debounce ref for Supabase saves
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<Partial<{ stats: PlayerStats; inventory: string[]; equippedSkins: Record<string,string>; loadoutSlots: Record<string,WeaponType>; crosshair: CrosshairSettings }>>({});

  const scheduleSave = useCallback((userId: string, patch: typeof pendingSaveRef.current) => {
    pendingSaveRef.current = { ...pendingSaveRef.current, ...patch };
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const toSave = pendingSaveRef.current;
      pendingSaveRef.current = {};
      await savePlayerProfile(userId, toSave);
    }, 3000);
  }, []);

  // 로컬 localStorage 키 헬퍼
  const lsKey = (field: string) => {
    const u = currentUser?.trim().toLowerCase();
    return u ? `rivals_user_${u}_${field}` : `rivals_${field}`;
  };

  // 플레이어 데이터 로드 (DB 우선, 로컬 폴백)
  const loadUserData = async (username: string, userId: string | null) => {
    if (isSupabaseConfigured() && userId) {
      const profile = await loadPlayerProfile(userId);
      setStats(profile.stats);
      setInventory(profile.inventory);
      setEquippedSkins(profile.equippedSkins);
      setLoadoutSlots(profile.loadoutSlots);
      setCrosshair(profile.crosshair);

      // 로컬에도 캐시
      const k = username.trim().toLowerCase();
      ls.set(`rivals_user_${k}_stats`, profile.stats);
      ls.set(`rivals_user_${k}_inventory`, profile.inventory);
      ls.set(`rivals_user_${k}_equipped_skins`, profile.equippedSkins);
      ls.set(`rivals_user_${k}_loadout_slots`, profile.loadoutSlots);
      ls.set(`rivals_user_${k}_crosshair`, profile.crosshair);
    } else {
      // 로컬 모드 폴백
      const k = username.trim().toLowerCase();
      const s = ls.get<PlayerStats>(`rivals_user_${k}_stats`, DEFAULT_STATS);
      if (s.rankedRP === undefined) s.rankedRP = 100;
      setStats(s);
      setInventory(ls.get(`rivals_user_${k}_inventory`, DEFAULT_INVENTORY));
      setEquippedSkins(ls.get(`rivals_user_${k}_equipped_skins`, DEFAULT_EQUIPPED));
      setLoadoutSlots(ls.get(`rivals_user_${k}_loadout_slots`, DEFAULT_LOADOUT));
      setCrosshair(ls.get(`rivals_user_${k}_crosshair`, DEFAULT_CROSSHAIR));
    }
  };

  // Supabase 세션 감지 (앱 시작 시)
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // 로컬 모드: localStorage에서 현재 유저 복원
      const saved = localStorage.getItem('rivals_current_logged_in_user');
      if (saved) {
        setCurrentUser(saved);
        loadUserData(saved, null);
      }
      setAuthLoading(false);
      return;
    }

    // Supabase 모드: 기존 세션 확인
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const userId = data.session.user.id;
        // username은 email에서 추출 (username@rivalry-game.app 형식)
        const email = data.session.user.email ?? '';
        const username = email.split('@')[0];
        setCurrentUser(username);
        setCurrentUserId(userId);
        await loadUserData(username, userId);
      }
      setAuthLoading(false);
    });

    // 세션 변경 구독
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        setCurrentUserId(null);
        setStats(DEFAULT_STATS);
        setInventory(DEFAULT_INVENTORY);
        setEquippedSkins(DEFAULT_EQUIPPED);
        setLoadoutSlots(DEFAULT_LOADOUT);
        setCrosshair(DEFAULT_CROSSHAIR);
        setScreen('lobby');
      }
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  // 로컬 캐시 동기화 (항상 실행)
  useEffect(() => {
    if (!currentUser) return;
    ls.set(lsKey('stats'), stats);
  }, [stats, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    ls.set(lsKey('inventory'), inventory);
  }, [inventory, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    ls.set(lsKey('equipped_skins'), equippedSkins);
  }, [equippedSkins, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    ls.set(lsKey('loadout_slots'), loadoutSlots);
  }, [loadoutSlots, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    ls.set(lsKey('crosshair'), crosshair);
    // 크로스헤어는 즉시 Supabase 저장
    if (isSupabaseConfigured() && currentUserId) {
      scheduleSave(currentUserId, { crosshair });
    }
  }, [crosshair, currentUser, currentUserId]);

  // 로그인 콜백 (AuthScreen에서 호출)
  const handleLogin = async (username: string) => {
    localStorage.setItem('rivals_current_logged_in_user', username);
    setCurrentUser(username);

    let userId: string | null = null;
    if (isSupabaseConfigured()) {
      userId = await getCurrentUserId();
      setCurrentUserId(userId);
    }
    await loadUserData(username, userId);
  };

  // 로그아웃
  const handleLogout = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      // 보류 중인 저장 즉시 실행
      if (currentUserId && Object.keys(pendingSaveRef.current).length > 0) {
        await savePlayerProfile(currentUserId, pendingSaveRef.current);
        pendingSaveRef.current = {};
      }
    }
    if (isSupabaseConfigured()) {
      await signOutUser();
    }
    setCurrentUser(null);
    setCurrentUserId(null);
    localStorage.removeItem('rivals_current_logged_in_user');
  };

  // 오디오 초기화
  useEffect(() => {
    const trigger = () => {
      gameAudio.toggleSound(soundEnabled);
      document.body.removeEventListener('click', trigger);
      document.body.removeEventListener('keydown', trigger);
    };
    document.body.addEventListener('click', trigger);
    document.body.addEventListener('keydown', trigger);
    return () => {
      document.body.removeEventListener('click', trigger);
      document.body.removeEventListener('keydown', trigger);
    };
  }, [soundEnabled]);

  const handleStartGameSession = (
    bot: BotProfile,
    botSkin: WeaponSkin,
    lobbyLoadoutSlots: Record<string, WeaponType>,
    lobbyEquippedSkins: Record<string, string>,
    gameMode: 'casual' | 'ranked' = 'casual'
  ) => {
    setActiveSession({ bot, botSkin, loadoutSlots: lobbyLoadoutSlots, equippedSkins: lobbyEquippedSkins, gameMode });
    setScreen('game');
  };

  const handleQuitGameSession = async (playerScore: number, botScore: number, finalWinner: 'player' | 'bot' | null) => {
    let updatedStats: PlayerStats | null = null;

    if (finalWinner && activeSession) {
      const isRanked = activeSession.gameMode === 'ranked';
      const win = finalWinner === 'player';
      const botDifficulty = activeSession.bot.difficulty;

      let rpChange = 0;
      let currentRP = stats.rankedRP ?? 100;
      let calculatedNextRP = currentRP;

      if (isRanked) {
        if (win) {
          let baseWin = 25;
          if (botDifficulty === 'pro') baseWin += 12;
          else if (botDifficulty === 'hard') baseWin += 6;
          else if (botDifficulty === 'easy') baseWin -= 6;
          if (stats.winStreak >= 2) baseWin += 5;
          rpChange = baseWin;
          calculatedNextRP = currentRP + rpChange;
        } else {
          let baseLoss = 15;
          if (botDifficulty === 'pro') baseLoss -= 6;
          else if (botDifficulty === 'hard') baseLoss -= 3;
          else if (botDifficulty === 'easy') baseLoss += 8;
          rpChange = baseLoss;
          calculatedNextRP = Math.max(0, currentRP - rpChange);
        }
        setLastRankedReport({ win, rpChange, oldRP: currentRP, newRP: calculatedNextRP, botName: activeSession.bot.name });
      }

      setStats((prev) => {
        const earnedGold = win ? (isRanked ? 180 : 120) : (isRanked ? 50 : 30);
        const earnedGems = win ? (isRanked ? 20 : 15) : (isRanked ? 4 : 2);
        let nextXp = prev.xp + (win ? 80 : 30);
        let nextLevel = prev.level;
        if (nextXp >= 100) { nextXp -= 100; nextLevel += 1; }

        updatedStats = {
          ...prev,
          wins: prev.wins + (win ? 1 : 0),
          losses: prev.losses + (win ? 0 : 1),
          kills: prev.kills + playerScore,
          deaths: prev.deaths + botScore,
          gold: prev.gold + earnedGold,
          gems: prev.gems + earnedGems,
          level: nextLevel,
          xp: nextXp,
          winStreak: win ? prev.winStreak + 1 : 0,
          rankedRP: isRanked ? calculatedNextRP : (prev.rankedRP ?? 100),
        };
        return updatedStats!;
      });
    }

    setActiveSession(null);
    setScreen('lobby');

    // 게임 종료 시 즉시 Supabase 저장
    if (isSupabaseConfigured() && currentUserId && updatedStats) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      await savePlayerProfile(currentUserId, { stats: updatedStats });
    }
  };

  // 로비에서 stats/inventory 변경 시 Supabase 저장 (debounced)
  const handleUpdateStats = useCallback((updater: PlayerStats | ((prev: PlayerStats) => PlayerStats)) => {
    setStats((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (isSupabaseConfigured() && currentUserId) scheduleSave(currentUserId, { stats: next });
      return next;
    });
  }, [currentUserId, scheduleSave]);

  const handleUpdateInventory = useCallback((inv: string[]) => {
    setInventory(inv);
    if (isSupabaseConfigured() && currentUserId) scheduleSave(currentUserId, { inventory: inv });
  }, [currentUserId, scheduleSave]);

  const handleUpdateEquippedSkins = useCallback((skins: Record<string, string>) => {
    setEquippedSkins(skins);
    if (isSupabaseConfigured() && currentUserId) scheduleSave(currentUserId, { equippedSkins: skins });
  }, [currentUserId, scheduleSave]);

  const handleUpdateLoadoutSlots = useCallback((slots: Record<string, WeaponType>) => {
    setLoadoutSlots(slots);
    if (isSupabaseConfigured() && currentUserId) scheduleSave(currentUserId, { loadoutSlots: slots });
  }, [currentUserId, scheduleSave]);

  const isGameActive = currentUser && screen === 'game' && activeSession;

  if (authLoading) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-mono">세션 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bg-slate-950 selection:bg-indigo-600/30 ${isGameActive ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {!currentUser ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <AuthScreen onLogin={handleLogin} />
          </div>
        </div>
      ) : screen === 'lobby' ? (
        <div className="flex items-center justify-start sm:justify-center min-h-screen p-0 sm:p-4">
          <div className="w-full max-w-5xl">
            <Lobby
              stats={stats}
              inventory={inventory}
              equippedSkins={equippedSkins}
              crosshair={crosshair}
              soundEnabled={soundEnabled}
              onSetSoundEnabled={setSoundEnabled}
              onUpdateStats={handleUpdateStats}
              onUpdateInventory={handleUpdateInventory}
              onUpdateEquippedSkins={handleUpdateEquippedSkins}
              onUpdateCrosshair={setCrosshair}
              onStartGame={handleStartGameSession}
              loadoutSlots={loadoutSlots}
              onUpdateLoadoutSlots={handleUpdateLoadoutSlots}
              lastRankedReport={lastRankedReport}
              onClearRankedReport={() => setLastRankedReport(null)}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </div>
        </div>
      ) : (
        activeSession && (
          <div className="w-full h-screen flex flex-col">
            <GameCanvas
              playerWeapon={null as any}
              playerSkin={null as any}
              bot={activeSession.bot}
              botSkin={activeSession.botSkin}
              crosshair={crosshair}
              onQuit={handleQuitGameSession}
              loadoutSlots={activeSession.loadoutSlots}
              equippedSkins={activeSession.equippedSkins}
              gameMode={activeSession.gameMode}
            />
          </div>
        )
      )}
    </div>
  );
}
