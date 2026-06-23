import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerStats, CrosshairSettings, BotProfile, WeaponSkin, WeaponType } from './types';
import { DEFAULT_CROSSHAIR } from './components/CrosshairEditor';
import { Lobby } from './components/Lobby';
import { GameCanvas } from './components/GameCanvas';
import { AuthScreen } from './components/AuthScreen';
import { GiftReceivedOverlay, GiftNotification } from './components/GiftReceivedOverlay';
import { gameAudio } from './audio';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { loadPlayerProfile, savePlayerProfile, signOutUser } from './lib/gameDB';
import { WEAPON_SKINS } from './data';

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

  const [giftNotification, setGiftNotification] = useState<GiftNotification | null>(null);

  // Debounce ref for Supabase saves
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<Partial<{ stats: PlayerStats; inventory: string[]; equippedSkins: Record<string,string>; loadoutSlots: Record<string,WeaponType>; crosshair: CrosshairSettings }>>({});
  // 내가 직접 저장한 경우 Realtime 이벤트로 인한 선물 알림을 억제
  const suppressGiftRef = useRef(false);

  const scheduleSave = useCallback((userId: string, patch: typeof pendingSaveRef.current) => {
    pendingSaveRef.current = { ...pendingSaveRef.current, ...patch };
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const toSave = pendingSaveRef.current;
      pendingSaveRef.current = {};
      suppressGiftRef.current = true;
      await savePlayerProfile(userId, toSave);
      setTimeout(() => { suppressGiftRef.current = false; }, 5000);
    }, 3000);
  }, []);

  // 로컬 localStorage 키 헬퍼
  const lsKey = (field: string) => {
    const u = currentUser?.trim().toLowerCase();
    return u ? `rivals_user_${u}_${field}` : `rivals_${field}`;
  };

  // 플레이어 데이터 로드 (DB 우선, 로컬 폴백)
  const loadUserData = async (username: string) => {
    if (isSupabaseConfigured()) {
      const k = username.trim().toLowerCase();
      // 로그인 전 로컬 캐시 (마지막으로 알던 값)
      const cachedStats = ls.get<PlayerStats | null>(`rivals_user_${k}_stats`, null);
      const cachedInventory = ls.get<string[] | null>(`rivals_user_${k}_inventory`, null);

      const profile = await loadPlayerProfile(username);
      setStats(profile.stats);
      setInventory(profile.inventory);
      setEquippedSkins(profile.equippedSkins);
      setLoadoutSlots(profile.loadoutSlots);
      setCrosshair(profile.crosshair);

      // 오프라인 선물 감지: 캐시가 있고 Supabase 값이 더 크면 알림
      if (cachedStats) {
        const goldDelta = (profile.stats.gold ?? 0) - (cachedStats.gold ?? 0);
        const gemsDelta = (profile.stats.gems ?? 0) - (cachedStats.gems ?? 0);
        const rpDelta = (profile.stats.rankedRP ?? 0) - (cachedStats.rankedRP ?? 0);
        const oldInv = cachedInventory ?? [];
        const newSkinId = profile.inventory.find((id) => !oldInv.includes(id));
        const skinName = newSkinId ? (WEAPON_SKINS.find(s => s.id === newSkinId)?.name ?? undefined) : undefined;

        if (goldDelta > 0 || gemsDelta > 0 || rpDelta > 0 || skinName) {
          setGiftNotification({
            gold: Math.max(0, goldDelta),
            gems: Math.max(0, gemsDelta),
            rp: Math.max(0, rpDelta),
            skinName,
          });
        }
      }

      // 로컬 캐시 갱신
      ls.set(`rivals_user_${k}_stats`, profile.stats);
      ls.set(`rivals_user_${k}_inventory`, profile.inventory);
      ls.set(`rivals_user_${k}_equipped_skins`, profile.equippedSkins);
      ls.set(`rivals_user_${k}_loadout_slots`, profile.loadoutSlots);
      ls.set(`rivals_user_${k}_crosshair`, profile.crosshair);
    } else {
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

  // 앱 시작 시 localStorage 세션 복원
  useEffect(() => {
    const saved = localStorage.getItem('rivals_current_logged_in_user');
    if (saved) {
      setCurrentUser(saved);
      loadUserData(saved).finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Supabase Realtime — 어드민 선물 감지
  useEffect(() => {
    if (!currentUser || !isSupabaseConfigured()) return;

    const channel = supabase
      .channel(`gift-watch-${currentUser}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'player_profiles',
          filter: `username=eq.${currentUser.trim().toLowerCase()}`,
        },
        (payload) => {
          const newStats = (payload.new as { stats: PlayerStats; inventory: string[] }).stats;
          const newInventory = (payload.new as { stats: PlayerStats; inventory: string[] }).inventory;
          const oldStats = (payload.old as { stats: PlayerStats; inventory: string[] }).stats;
          const oldInventory = (payload.old as { stats: PlayerStats; inventory: string[] }).inventory ?? [];

          const goldDelta = (newStats?.gold ?? 0) - (oldStats?.gold ?? 0);
          const gemsDelta = (newStats?.gems ?? 0) - (oldStats?.gems ?? 0);
          const rpDelta = (newStats?.rankedRP ?? 0) - (oldStats?.rankedRP ?? 0);

          const newSkinId = newInventory?.find((id: string) => !oldInventory.includes(id));
          const skinName = newSkinId ? (WEAPON_SKINS.find(s => s.id === newSkinId)?.name ?? undefined) : undefined;

          // 내가 저장한 경우 무시, 어드민이 준 경우만 알림
          if (suppressGiftRef.current) return;
          if (goldDelta > 0 || gemsDelta > 0 || rpDelta > 0 || skinName) {
            setStats(newStats);
            if (newInventory) setInventory(newInventory);
            setGiftNotification({
              gold: Math.max(0, goldDelta),
              gems: Math.max(0, gemsDelta),
              rp: Math.max(0, rpDelta),
              skinName,
            });
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  // 로컬 캐시 동기화
  useEffect(() => { if (currentUser) ls.set(lsKey('stats'), stats); }, [stats, currentUser]);
  useEffect(() => { if (currentUser) ls.set(lsKey('inventory'), inventory); }, [inventory, currentUser]);
  useEffect(() => { if (currentUser) ls.set(lsKey('equipped_skins'), equippedSkins); }, [equippedSkins, currentUser]);
  useEffect(() => { if (currentUser) ls.set(lsKey('loadout_slots'), loadoutSlots); }, [loadoutSlots, currentUser]);
  useEffect(() => {
    if (!currentUser) return;
    ls.set(lsKey('crosshair'), crosshair);
    if (isSupabaseConfigured()) scheduleSave(currentUser, { crosshair });
  }, [crosshair, currentUser]);

  // 로그인 콜백
  const handleLogin = async (username: string) => {
    localStorage.setItem('rivals_current_logged_in_user', username);
    setCurrentUser(username);
    await loadUserData(username);
  };

  // 로그아웃
  const handleLogout = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      if (currentUser && Object.keys(pendingSaveRef.current).length > 0) {
        await savePlayerProfile(currentUser, pendingSaveRef.current);
        pendingSaveRef.current = {};
      }
    }
    setCurrentUser(null);
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
    if (isSupabaseConfigured() && currentUser && updatedStats) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      suppressGiftRef.current = true;
      await savePlayerProfile(currentUser, { stats: updatedStats });
      setTimeout(() => { suppressGiftRef.current = false; }, 5000);
    }
  };

  // 로비에서 stats/inventory 변경 시 Supabase 저장 (debounced)
  const handleUpdateStats = useCallback((updater: PlayerStats | ((prev: PlayerStats) => PlayerStats)) => {
    setStats((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (isSupabaseConfigured() && currentUser) scheduleSave(currentUser, { stats: next });
      return next;
    });
  }, [currentUser, scheduleSave]);

  const handleUpdateInventory = useCallback((inv: string[]) => {
    setInventory(inv);
    if (isSupabaseConfigured() && currentUser) scheduleSave(currentUser, { inventory: inv });
  }, [currentUser, scheduleSave]);

  const handleUpdateEquippedSkins = useCallback((skins: Record<string, string>) => {
    setEquippedSkins(skins);
    if (isSupabaseConfigured() && currentUser) scheduleSave(currentUser, { equippedSkins: skins });
  }, [currentUser, scheduleSave]);

  const handleUpdateLoadoutSlots = useCallback((slots: Record<string, WeaponType>) => {
    setLoadoutSlots(slots);
    if (isSupabaseConfigured() && currentUser) scheduleSave(currentUser, { loadoutSlots: slots });
  }, [currentUser, scheduleSave]);

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
      <GiftReceivedOverlay notification={giftNotification} onDismiss={() => setGiftNotification(null)} />
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
