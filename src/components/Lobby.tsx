import React, { useState, useEffect } from 'react';
import { WeaponStats, WeaponSkin, CaseType, PlayerStats, CrosshairSettings, BotProfile, Rarity, WeaponType } from '../types';
import { gameAudio } from '../audio';
import { WEAPON_TYPES, WEAPON_SKINS, CASES, BOTS } from '../data';
import { CrosshairEditor } from './CrosshairEditor';
import {
  Trophy,
  ShoppingBag,
  Sliders,
  Play,
  User,
  Coins,
  Gem,
  Sparkles,
  ShieldAlert,
  Flame,
  CheckCircle,
  Clock,
  Skull,
  Crosshair,
  BadgeAlert,
  Volume2,
  VolumeX,
  Hammer,
  Shield,
  TrendingUp,
  X,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  Gift
} from 'lucide-react';

export interface RankInfo {
  name: string;
  minRP: number;
  maxRP: number;
  badgeEmoji: string;
  badgeBg: string; 
  borderClass: string;
  textGlowClass?: string;
  colorHex: string;
}

export const RANKS: RankInfo[] = [
  { name: 'Bronze III', minRP: 0, maxRP: 99, badgeEmoji: '🥉', badgeBg: 'bg-amber-900/40 text-amber-500', borderClass: 'border-amber-900/30', colorHex: '#d97706' },
  { name: 'Bronze II', minRP: 100, maxRP: 199, badgeEmoji: '🥉', badgeBg: 'bg-amber-900/40 text-amber-400 border-amber-800/20', borderClass: 'border-amber-800/10', colorHex: '#fbbf24' },
  { name: 'Bronze I', minRP: 200, maxRP: 299, badgeEmoji: '🥉', badgeBg: 'bg-amber-950/40 text-amber-200 font-extrabold border-amber-700/30', borderClass: 'border-amber-700/25', colorHex: '#fef08a' },
  
  { name: 'Silver III', minRP: 300, maxRP: 399, badgeEmoji: '🥈', badgeBg: 'bg-slate-800/40 text-slate-400', borderClass: 'border-slate-800', colorHex: '#94a3b8' },
  { name: 'Silver II', minRP: 400, maxRP: 499, badgeEmoji: '🥈', badgeBg: 'bg-slate-700/40 text-slate-300', borderClass: 'border-slate-700', colorHex: '#cbd5e1' },
  { name: 'Silver I', minRP: 500, maxRP: 599, badgeEmoji: '🥈', badgeBg: 'bg-slate-700/50 text-white font-extrabold', borderClass: 'border-slate-500', colorHex: '#f1f5f9' },

  { name: 'Gold III', minRP: 600, maxRP: 699, badgeEmoji: '🥇', badgeBg: 'bg-yellow-950/40 text-yellow-600', borderClass: 'border-yellow-955', colorHex: '#ca8a04' },
  { name: 'Gold II', minRP: 700, maxRP: 799, badgeEmoji: '🥇', badgeBg: 'bg-yellow-950/50 text-yellow-500 border-yellow-800/40', borderClass: 'border-yellow-900', colorHex: '#eab308' },
  { name: 'Gold I', minRP: 800, maxRP: 899, badgeEmoji: '🥇', badgeBg: 'bg-yellow-905/60 text-yellow-400 font-extrabold', borderClass: 'border-yellow-700', colorHex: '#facc15' },

  { name: 'Platinum III', minRP: 900, maxRP: 1049, badgeEmoji: '💎', badgeBg: 'bg-cyan-950/40 text-cyan-500', borderClass: 'border-cyan-950', colorHex: '#06b6d4' },
  { name: 'Platinum II', minRP: 1050, maxRP: 1199, badgeEmoji: '💎', badgeBg: 'bg-cyan-950/50 text-cyan-400', borderClass: 'border-cyan-900', colorHex: '#22d3ee' },
  { name: 'Platinum I', minRP: 1200, maxRP: 1399, badgeEmoji: '💎', badgeBg: 'bg-cyan-900/40 text-cyan-300 font-extrabold', borderClass: 'border-cyan-700', colorHex: '#67e8f9' },

  { name: 'Diamond III', minRP: 1400, maxRP: 1599, badgeEmoji: '💠', badgeBg: 'bg-indigo-950/40 text-indigo-400', borderClass: 'border-indigo-950', colorHex: '#6366f1' },
  { name: 'Diamond II', minRP: 1600, maxRP: 1799, badgeEmoji: '💠', badgeBg: 'bg-indigo-950/50 text-indigo-350 border-indigo-900/30', borderClass: 'border-indigo-900', colorHex: '#818cf8' },
  { name: 'Diamond I', minRP: 1800, maxRP: 1999, badgeEmoji: '💠', badgeBg: 'bg-indigo-900/40 text-indigo-200 font-extrabold shadow-lg shadow-indigo-500/15', borderClass: 'border-indigo-700', colorHex: '#a5b4fc' },

  { name: 'Master', minRP: 2000, maxRP: 2499, badgeEmoji: '🔮', badgeBg: 'bg-purple-950/60 text-purple-400 animated-pulse font-extrabold border border-purple-800 shadow-md shadow-purple-500/10', borderClass: 'border-purple-800', textGlowClass: 'text-purple-400 drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]', colorHex: '#c084fc' },
  { name: 'Grandmaster', minRP: 2500, maxRP: 2999, badgeEmoji: '🐉', badgeBg: 'bg-rose-950/70 text-rose-400 animate-pulse font-extrabold border-2 border-rose-800 shadow-lg shadow-rose-500/15', borderClass: 'border-rose-800', textGlowClass: 'text-rose-400 drop-shadow-[0_0_5px_rgba(244,63,94,0.6)]', colorHex: '#f43f5e' },
  { name: 'Rivals Legend', minRP: 3000, maxRP: 999999, badgeEmoji: '👑', badgeBg: 'bg-amber-950/80 text-yellow-400 font-extrabold border-2 border-yellow-500 shadow-xl shadow-yellow-500/20', borderClass: 'border-yellow-500', textGlowClass: 'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]', colorHex: '#fbbf24' }
];

export const getRankFromRP = (rp: number): RankInfo => {
  const matchingRank = RANKS.find(r => rp >= r.minRP && rp <= r.maxRP);
  return matchingRank || RANKS[RANKS.length - 1];
};

interface LobbyProps {
  stats: PlayerStats;
  inventory: string[]; // List of skin IDs owned
  equippedSkins: Record<string, string>; // weaponType -> skinId
  crosshair: CrosshairSettings;
  soundEnabled: boolean;
  onSetSoundEnabled: (enabled: boolean) => void;
  onUpdateStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onUpdateInventory: (skins: string[]) => void;
  onUpdateEquippedSkins: (equipped: Record<string, string>) => void;
  onUpdateCrosshair: (settings: CrosshairSettings) => void;
  onStartGame: (bot: BotProfile, botSkin: WeaponSkin, loadoutSlots: Record<string, WeaponType>, equippedSkins: Record<string, string>, gameMode: 'casual' | 'ranked') => void;
  loadoutSlots: Record<string, WeaponType>;
  onUpdateLoadoutSlots: (slots: Record<string, WeaponType>) => void;
  lastRankedReport?: { win: boolean; rpChange: number; oldRP: number; newRP: number; botName: string; } | null;
  onClearRankedReport?: () => void;
  currentUser?: string;
  onLogout?: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  stats,
  inventory,
  equippedSkins,
  crosshair,
  soundEnabled,
  onSetSoundEnabled,
  onUpdateStats,
  onUpdateInventory,
  onUpdateEquippedSkins,
  onUpdateCrosshair,
  onStartGame,
  loadoutSlots,
  onUpdateLoadoutSlots,
  lastRankedReport,
  onClearRankedReport,
  currentUser,
  onLogout,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'matchmaking' | 'armory' | 'shop' | 'crosshair' | 'stats' | 'admin'>('matchmaking');

  // Matchmaking process states
  const [queueType, setQueueType] = useState<'casual' | 'ranked'>('casual');
  const [matchmakingState, setMatchmakingState] = useState<'idle' | 'searching' | 'matched'>('idle');
  const [matchmakingTimer, setMatchmakingTimer] = useState(0);
  const [matchedBot, setMatchedBot] = useState<BotProfile | null>(null);

  // Shop Case roll states
  const [selectedCase, setSelectedCase] = useState<CaseType | null>(null);
  const [caseOpeningState, setCaseOpeningState] = useState<'idle' | 'rolling' | 'revealed'>('idle');
  const [displayedRollSkins, setDisplayedRollSkins] = useState<WeaponSkin[]>([]);
  const [winningSkin, setWinningSkin] = useState<WeaponSkin | null>(null);
  const [activeSpinIndex, setActiveSpinIndex] = useState(0);

  // Armory selected weapon categories
  const [selectedWeaponCategory, setSelectedWeaponCategory] = useState<string>('rifle');

  // Admin Gift Rewards variables
  const [adminTargetUser, setAdminTargetUser] = useState<string>('');
  const [adminGoldAmount, setAdminGoldAmount] = useState<number>(1000);
  const [adminGemsAmount, setAdminGemsAmount] = useState<number>(100);
  const [adminRPAmount, setAdminRPAmount] = useState<number>(100);
  const [adminSelectedSkin, setAdminSelectedSkin] = useState<string>('none');
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string>('');
  const [adminErrorMsg, setAdminErrorMsg] = useState<string>('');
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);

  useEffect(() => {
    if (activeTab === 'admin') {
      try {
        const storedAccountsJson = localStorage.getItem('rivals_users_database');
        if (storedAccountsJson) {
          const accounts = JSON.parse(storedAccountsJson);
          const usernames = Object.keys(accounts);
          setRegisteredUsers(usernames);
          // Auto-select first user as target if not already set, or default to empty
          if (usernames.length > 0 && !adminTargetUser) {
            const otherUser = usernames.find(u => u !== 'yechan0920yo') || usernames[0];
            setAdminTargetUser(otherUser);
          }
        }
      } catch (e) {
        console.error('Failed to load registered users database for admin tools', e);
      }
    }
  }, [activeTab]);

  const handleGrantReward = () => {
    setAdminSuccessMsg('');
    setAdminErrorMsg('');
    gameAudio.playClickSound();

    if (!adminTargetUser) {
      setAdminErrorMsg('보상을 지급할 대상 사용자를 선택하십시오.');
      return;
    }

    const cleanTargetUser = adminTargetUser.trim().toLowerCase();

    try {
      const storedAccountsJson = localStorage.getItem('rivals_users_database');
      const accounts = storedAccountsJson ? JSON.parse(storedAccountsJson) : {};
      if (!accounts[cleanTargetUser]) {
        setAdminErrorMsg(`선택한 사용자 "${adminTargetUser}"는 유효하지 않거나 탈퇴한 사용자입니다.`);
        return;
      }

      // 1. Update stats (Gold / Gems / Ranked RP)
      const statsKey = `rivals_user_${cleanTargetUser}_stats`;
      const currentStatsJson = localStorage.getItem(statsKey);
      let targetStats = currentStatsJson ? JSON.parse(currentStatsJson) : {
        wins: 0, losses: 0, kills: 0, deaths: 0, headshots: 0,
        rankedRP: 100, gold: 0, gems: 0, level: 1, xp: 0, winStreak: 0
      };

      // Add rewards safely
      const oldGold = Number(targetStats.gold) || 0;
      const oldGems = Number(targetStats.gems) || 0;
      const oldRP = Number(targetStats.rankedRP) || 100;

      targetStats.gold = Math.max(0, oldGold + (Number(adminGoldAmount) || 0));
      targetStats.gems = Math.max(0, oldGems + (Number(adminGemsAmount) || 0));
      targetStats.rankedRP = Math.max(100, oldRP + (Number(adminRPAmount) || 0));

      localStorage.setItem(statsKey, JSON.stringify(targetStats));

      // 1.1 If the target user is the CURRENT user, also trigger state update
      if (cleanTargetUser === currentUser?.trim().toLowerCase()) {
        onUpdateStats((prev: PlayerStats) => ({
          ...prev,
          gold: Math.max(0, (Number(prev.gold) || 0) + (Number(adminGoldAmount) || 0)),
          gems: Math.max(0, (Number(prev.gems) || 0) + (Number(adminGemsAmount) || 0)),
          rankedRP: Math.max(100, (Number(prev.rankedRP) || 100) + (Number(adminRPAmount) || 0)),
        }));
      }

      // 2. Add skin if a valid premium skin was selected
      let skinGrantedText = '';
      if (adminSelectedSkin && adminSelectedSkin !== 'none') {
        const invKey = `rivals_user_${cleanTargetUser}_inventory`;
        const currentInvJson = localStorage.getItem(invKey);
        let targetInv: string[] = currentInvJson ? JSON.parse(currentInvJson) : [];
        
        if (!targetInv.includes(adminSelectedSkin)) {
          targetInv.push(adminSelectedSkin);
          localStorage.setItem(invKey, JSON.stringify(targetInv));
          
          if (cleanTargetUser === currentUser?.trim().toLowerCase()) {
            onUpdateInventory(targetInv);
          }

          const skinObj = WEAPON_SKINS.find(s => s.id === adminSelectedSkin);
          skinGrantedText = skinObj ? `, [${skinObj.name}] 스킨` : '';
        } else {
          skinGrantedText = ' (이미 보유 중인 총기 스킨)';
        }
      }

      // Success chime and notification status
      gameAudio.playCrateUnlockSound('legendary');
      setAdminSuccessMsg(`소버린 프로토콜: 파트너 오퍼레이터 '${accounts[cleanTargetUser].displayName}'님에게 골드 +${(Number(adminGoldAmount) || 0).toLocaleString()}골드, 젬 +${(Number(adminGemsAmount) || 0).toLocaleString()}개, ELO RP +${(Number(adminRPAmount) || 0).toLocaleString()}포인트${skinGrantedText} 지급을 성공적으로 인가하였습니다!`);
    } catch (e) {
      console.error(e);
      setAdminErrorMsg('보상 지급 중 로컬 데이터베이스 처리 오류가 발생했습니다.');
    }
  };

  // Trigger sound engine toggle
  const toggleSound = () => {
    onSetSoundEnabled(!soundEnabled);
    gameAudio.toggleSound(!soundEnabled);
  };

  // Helper to select a bot that matches the player's competitive rating (RP / Elo)
  const selectOpponentForRanked = (rp: number) => {
    // Bronze: < 300 -> easy, medium
    // Silver: 300 - 599 -> medium, hard
    // Gold/Platinum: 600 - 1399 -> hard, pro
    // Diamond+: 1400+ -> pro only!
    let matchingDifficulties: string[] = ['easy', 'medium'];
    if (rp < 300) {
      matchingDifficulties = ['easy', 'medium'];
    } else if (rp < 600) {
      matchingDifficulties = ['medium', 'hard'];
    } else if (rp < 1400) {
      matchingDifficulties = ['hard', 'pro'];
    } else {
      matchingDifficulties = ['pro'];
    }

    const filtered = BOTS.filter(b => matchingDifficulties.includes(b.difficulty));
    if (filtered.length === 0) return BOTS[BOTS.length - 1]; // standard fallback
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  // 1. Simulate Matchmaking timer
  useEffect(() => {
    let intervalId: any;
    if (matchmakingState === 'searching') {
      intervalId = setInterval(() => {
        setMatchmakingTimer((t) => {
          const next = t + 1;
          gameAudio.playCrateRollSound(); // ticks sound

          // Search complete after ~4 seconds
          if (next >= 4) {
            clearInterval(intervalId);
            
            // Choose Bot depending on game mode
            const playerRP = stats.rankedRP ?? 100;
            const randomBot = queueType === 'ranked'
              ? selectOpponentForRanked(playerRP)
              : BOTS[Math.floor(Math.random() * BOTS.length)];

            setMatchedBot(randomBot);
            setMatchmakingState('matched');

            // Sound chime
            gameAudio.playCrateUnlockSound('epic');

            // Start game countdown
            setTimeout(() => {
              const bSkin = WEAPON_SKINS.find((s) => s.id === randomBot.skinId) || WEAPON_SKINS[0];

              // Start the real-time match!
              onStartGame(randomBot, bSkin, loadoutSlots, equippedSkins, queueType);
            }, 3550);

            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [matchmakingState, queueType]);

  const handleStartQueue = (type: 'casual' | 'ranked') => {
    gameAudio.playClickSound();
    setQueueType(type);
    setMatchmakingTimer(0);
    setMatchmakingState('searching');
  };

  const handleCancelQueue = () => {
    gameAudio.playClickSound();
    setMatchmakingState('idle');
  };

  // 2. Armory Skin Management
  const handleEquipSkin = (weaponType: string, skinId: string) => {
    gameAudio.playClickSound();
    onUpdateEquippedSkins({
      ...equippedSkins,
      [weaponType]: skinId,
    });
  };

  // 3. Spawns dynamic sliding crates spin (Roblox chest openings!)
  const handleOpenCase = (cDetails: CaseType) => {
    if (caseOpeningState === 'rolling') return;

    // Currency verification first
    if (cDetails.currency === 'gold' && stats.gold < cDetails.cost) {
      gameAudio.playClickSound();
      alert('⚠️ Not enough Gold! Play more 1v1 matches to earn gold.');
      return;
    }
    if (cDetails.currency === 'gems' && stats.gems < cDetails.cost) {
      gameAudio.playClickSound();
      alert('⚠️ Not enough Gems! Win higher matches or complete achievements.');
      return;
    }

    // Spend currency
    onUpdateStats((prev) => ({
      ...prev,
      gold: cDetails.currency === 'gold' ? prev.gold - cDetails.cost : prev.gold,
      gems: cDetails.currency === 'gems' ? prev.gems - cDetails.cost : prev.gems,
    }));

    gameAudio.playClickSound();
    setSelectedCase(cDetails);
    setCaseOpeningState('rolling');

    // Filter weapon skins to compile pool
    const possibleSkins = WEAPON_SKINS.filter((skin) => cDetails.pool.includes(skin.id));

    // Generate 45 skins in array to simulate linear speed rollers
    const rollerItems: WeaponSkin[] = [];
    for (let i = 0; i < 40; i++) {
      rollerItems.push(possibleSkins[Math.floor(Math.random() * possibleSkins.length)]);
    }

    // Force the winning index (around 32th)
    const winner = possibleSkins[Math.floor(Math.random() * possibleSkins.length)];
    rollerItems[32] = winner;
    setWinningSkin(winner);
    setDisplayedRollSkins(rollerItems);

    // Progressive deceleration animation intervals
    let speed = 40; // in miliseconds
    let currentIdx = 0;

    const tickRoll = () => {
      currentIdx++;
      setActiveSpinIndex(currentIdx);
      gameAudio.playCrateRollSound();

      if (currentIdx < 32) {
        // Linearly slow down
        speed += currentIdx * 0.8;
        setTimeout(tickRoll, speed);
      } else {
        // Open revealed card!
        setCaseOpeningState('revealed');
        gameAudio.playCrateUnlockSound(winner.rarity);

        // Add skin to inventory
        if (!inventory.includes(winner.id)) {
          onUpdateInventory([...inventory, winner.id]);
        }

        // Award level XP as consolation
        onUpdateStats((prev) => {
          let nextXp = prev.xp + 40;
          let nextLevel = prev.level;
          if (nextXp >= 100) {
            nextXp -= 100;
            nextLevel += 1;
            gameAudio.playCrateUnlockSound('legendary'); // level up fanfare!
          }
          return { ...prev, xp: nextXp, level: nextLevel };
        });
      }
    };

    setTimeout(tickRoll, speed);
  };

  const handleDismissCaseWinner = () => {
    gameAudio.playClickSound();
    setCaseOpeningState('idle');
    setSelectedCase(null);
    setWinningSkin(null);
  };

  // Auxiliary skin details helpers
  const getRarityBadgeStyle = (rarity: Rarity) => {
    switch (rarity) {
      case 'common': return 'bg-slate-700/60 text-slate-300 border-slate-600';
      case 'rare': return 'bg-emerald-950/60 text-emerald-300 border-emerald-800';
      case 'epic': return 'bg-indigo-950/60 text-indigo-300 border-indigo-800';
      case 'legendary': return 'bg-yellow-950/60 text-yellow-500 border-yellow-700 animate-pulse';
      case 'classified': return 'bg-purple-950/60 text-pink-400 border-rose-800 border-2 shadow-lg shadow-purple-500/20';
    }
  };

  return (
    <div className="flex flex-col min-h-[580px] bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 select-none pb-6">
      {/* HEADER LOGO BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3.5 py-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Trophy className="w-5 h-5 text-white animate-bounce" />
          </div>
          <div>
            <h1 className="font-sans font-black text-xl tracking-tight uppercase flex items-center gap-1.5">
              RIVAL DUELS <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold normal-case font-mono">Web Sandbox</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Inspired by Roblox Rivals 1v1</p>
          </div>
        </div>

        {/* STATS AND CURRENCY HUB */}
        <div className="flex flex-wrap items-center gap-3.5 py-2.5 md:py-0 border-t md:border-t-0 border-slate-800 w-full md:w-auto justify-end">
          {/* Logged-in User Profile */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-full border border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.04)] animate-pulse">
              <div className="w-5 h-5 rounded-full bg-indigo-505/20 border border-indigo-500 flex items-center justify-center text-[9px] uppercase font-black font-mono text-indigo-400 shrink-0 select-none">
                {currentUser[0]}
              </div>
              <span className="text-xs font-black text-slate-200 font-mono tracking-wide max-w-[85px] truncate">{currentUser}</span>
              
              {onLogout && (
                <button
                  onClick={() => {
                    gameAudio.playClickSound();
                    onLogout();
                  }}
                  className="p-1 hover:bg-slate-800/80 rounded text-slate-500 hover:text-rose-450 cursor-pointer transition-colors"
                  title="로그아웃 (Switch Account)"
                >
                  <LogOut className="w-3 h-3 text-slate-400 hover:text-rose-405" />
                </button>
              )}
            </div>
          )}

          {/* Rank Badge */}
          {(() => {
            const currentRP = stats.rankedRP ?? 100;
            const rank = getRankFromRP(currentRP);
            return (
              <div 
                className={`flex items-center gap-1.5 bg-slate-950 px-3.5 py-1.5 rounded-full border ${rank.borderClass} ${rank.badgeBg} shadow-inner cursor-help transition-all hover:scale-102`}
                title={`Ranked Rating Points: ${currentRP} RP`}
              >
                <span className="text-xs drop-shadow-sm">{rank.badgeEmoji}</span>
                <span className={`text-[10px] font-black uppercase tracking-wider font-mono ${rank.textGlowClass || ''}`}>
                  {rank.name} <span className="text-[9px] text-slate-500">| {currentRP} RP</span>
                </span>
              </div>
            );
          })()}

          {/* Level Tracker */}
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800/80">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 font-bold uppercase leading-none">Level</span>
              <span className="text-xs font-black text-white font-mono leading-none mt-0.5">{stats.level}</span>
            </div>
            <div className="w-12 bg-slate-850 h-1.5 rounded-full overflow-hidden">
              <div style={{ width: `${stats.xp}%` }} className="h-full bg-indigo-505 transition-all" />
            </div>
          </div>

          {/* Currencies */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-amber-500/20 text-amber-500">
            <Coins className="w-4 h-4" />
            <span className="text-xs font-black font-mono">{stats.gold}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-sky-500/20 text-sky-400">
            <Gem className="w-4 h-4" />
            <span className="text-xs font-black font-mono">{stats.gems}</span>
          </div>

          {/* Sound Trigger */}
          <button
            onClick={toggleSound}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-all cursor-pointer border border-slate-700/50"
            title="Toggle Sound FX"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* MATCHMAKING / VS OVERLAY PAGE MODES */}
      {matchmakingState !== 'idle' && (
        <div className="p-8 flex flex-col items-center justify-center flex-1 min-h-[380px] bg-slate-950">
          {matchmakingState === 'searching' ? (
            <div className="flex flex-col items-center max-w-md text-center">
              {/* Spinning radar visual layout with mode customization */}
              <div className={`relative w-28 h-28 border-4 border-slate-800 rounded-full flex items-center justify-center p-4 shadow-2xl animate-pulse mb-6 ${
                queueType === 'ranked' ? 'shadow-rose-600/10' : 'shadow-indigo-600/10'
              }`}>
                <div className={`absolute inset-0 border-t-2 rounded-full animate-spin ${
                  queueType === 'ranked' ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-2xl' : 'border-indigo-400'
                }`} />
                {queueType === 'ranked' ? (
                  <Shield className="w-10 h-10 text-rose-500 filter drop-shadow-[0_0_5px_rgba(244,63,94,0.6)] animate-pulse" />
                ) : (
                  <Crosshair className="w-10 h-10 text-indigo-400" />
                )}
              </div>

              <div className="space-y-1">
                <span className={`text-[10px] font-bold tracking-widest uppercase border px-2.5 py-0.5 rounded-md font-mono ${
                  queueType === 'ranked' 
                    ? 'text-rose-400 border-rose-600/30 bg-rose-500/5 shadow-inner' 
                    : 'text-indigo-400 border-indigo-600/30 bg-indigo-500/5'
                }`}>
                  {queueType === 'ranked' ? 'Ranked competitive' : 'Casual sandbox'}
                </span>
                <h2 className="text-xl font-sans font-black text-white tracking-widest uppercase mt-2">
                  {queueType === 'ranked' ? 'Finding Ranked Rival...' : 'Finding Duel Match...'}
                </h2>
              </div>
              <p className="text-slate-400 text-xs mt-2 px-4 leading-relaxed">
                {queueType === 'ranked' 
                  ? 'Searching for an opponent with matching skill brackets. Adjusting AI modifiers to challenge your division.' 
                  : 'Sweeping regional lobbys for a active 1v1 dueler. Matching based on active casual loadout setups.'}
              </p>

              <div className={`font-mono text-xs font-bold mt-4.5 px-3.5 py-1.5 rounded border ${
                queueType === 'ranked' 
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
                  : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25'
              }`}>
                SEARCH TIME: {matchmakingTimer}s
              </div>

              <button
                onClick={handleCancelQueue}
                className="mt-6 px-6 py-2.5 bg-rose-600/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/25 hover:border-transparent text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Cancel Matchmaking
              </button>
            </div>
          ) : (
            // MATCH FOUND SCREEN (VS CARDS)
            <div className="w-full max-w-3xl flex flex-col items-center py-6 animate-fade-in">
              <div className={`text-xs text-slate-950 font-black px-5 py-1.5 rounded-full uppercase tracking-widest font-mono animate-bounce shadow ${
                queueType === 'ranked' ? 'bg-rose-500 animate-pulse shadow-rose-500/20' : 'bg-emerald-500'
              }`}>
                {queueType === 'ranked' ? '🏆 COMPETITIVE DUEL LOCKED!' : '⚔️ MATCH CONFIRMED!'}
              </div>

              {/* VS Split Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center w-full mt-6">
                {/* Left side card (You) */}
                <div className={`p-6 rounded-3xl text-center shadow-lg relative overflow-hidden flex flex-col justify-between h-[210px] border ${
                  queueType === 'ranked' 
                    ? 'bg-gradient-to-t from-slate-900 to-rose-950/20 border-rose-500/40' 
                    : 'bg-gradient-to-t from-slate-900 to-indigo-950/30 border-indigo-500/30'
                }`}>
                  <div className={`text-[10px] font-bold tracking-widest absolute top-3 left-3 px-2.5 py-0.5 rounded border ${
                    queueType === 'ranked' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                  }`}>
                    BLUE COMPETING TEAM
                  </div>

                  <div className="mt-4">
                    <h3 className="text-2xl font-black text-white leading-none">YOU</h3>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 justify-center font-bold">
                      {queueType === 'ranked' ? (
                        <>
                          <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400 font-mono">Rank Battle Active</span>
                        </>
                      ) : (
                        <span>Ready to combat</span>
                      )}
                    </div>
                  </div>

                  {/* Player Division Display inside VS layout */}
                  <div className="flex gap-4 items-center justify-center bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-900">
                    {queueType === 'ranked' ? (
                      (() => {
                        const currentRP = stats.rankedRP ?? 100;
                        const rank = getRankFromRP(currentRP);
                        return (
                          <div className="flex items-center gap-2.5 text-center">
                            <span className="text-xl">{rank.badgeEmoji}</span>
                            <div className="text-left leading-none">
                              <span className="text-[9px] text-slate-500 font-black uppercase font-mono block">My Rank tier</span>
                              <span className={`text-[11px] font-black uppercase font-mono ${rank.textGlowClass || ''}`}>{rank.name}</span>
                              <span className="text-[9px] block text-slate-450 mt-0.5 font-mono">Rating: {currentRP} RP</span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <>
                        <div className="text-center font-mono text-[9px] text-slate-400 font-bold uppercase">
                          Level: <span className="text-white block text-sm font-black">{stats.level}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-800" />
                        <div className="text-center font-mono text-[9px] text-slate-400 font-bold uppercase">
                          Win Rate: <span className="text-emerald-400 block text-sm font-black">
                            {stats.wins + stats.losses > 0
                              ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100)
                              : 0}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Center "VS" bubble */}
                <div className="md:col-span-2 flex justify-center text-center">
                  <div className={`w-14 h-14 rounded-full border-4 border-slate-950 text-white font-black text-xl flex items-center justify-center shadow-lg transform rotate-12 scale-110 ${
                    queueType === 'ranked' ? 'bg-gradient-to-r from-red-600 to-rose-600' : 'bg-indigo-600'
                  }`}>
                    VS
                  </div>
                </div>

                {/* Right side card (Enemy Bot) */}
                <div className={`p-6 rounded-3xl text-center shadow-lg relative overflow-hidden flex flex-col justify-between h-[210px] border ${
                  queueType === 'ranked' 
                    ? 'bg-gradient-to-t from-slate-900 to-rose-950/20 border-rose-500/40' 
                    : 'bg-gradient-to-t from-slate-900 to-rose-950/30 border-rose-500/30'
                }`}>
                  <div className="text-[10px] bg-rose-500/10 text-rose-300 font-bold tracking-widest absolute top-3 right-3 px-2.5 py-0.5 rounded border border-rose-500/20">
                    ORANGE DUEL TEAM
                  </div>

                  <div className="mt-4">
                    <h3 className="text-2xl font-black text-rose-400 leading-none">{matchedBot?.name}</h3>
                    <div className="text-xs text-rose-300 mt-1 font-bold">{matchedBot?.title}</div>
                  </div>

                  {/* Enemy Rank Display inside VS layout */}
                  <div className="flex gap-4 items-center justify-center bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-900">
                    {queueType === 'ranked' && matchedBot ? (
                      (() => {
                        let rankEmoji = '🥉';
                        let rankName = 'Bronze I';
                        let estRP = '150';
                        if (matchedBot.difficulty === 'medium') {
                          rankEmoji = '🥈';
                          rankName = 'Silver I';
                          estRP = '450';
                        } else if (matchedBot.difficulty === 'hard') {
                          rankEmoji = '💎';
                          rankName = 'Platinum I';
                          estRP = '1150';
                        } else if (matchedBot.difficulty === 'pro') {
                          rankEmoji = '🐉';
                          rankName = 'Grandmaster';
                          estRP = '2600';
                        }
                        return (
                          <div className="flex items-center gap-2.5 text-center">
                            <span className="text-xl">{rankEmoji}</span>
                            <div className="text-left leading-none">
                              <span className="text-[9px] text-slate-500 font-black uppercase font-mono block">Estimated Rank</span>
                              <span className="text-[11px] font-black uppercase font-mono text-rose-400">{rankName}</span>
                              <span className="text-[9px] block text-slate-400 mt-0.5 font-mono">Rating: {estRP} RP</span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <>
                        <div className="text-center font-mono text-[9px] text-slate-400 font-bold uppercase">
                          Difficulty: <span className="text-white block text-sm font-black">{matchedBot?.difficulty.toUpperCase()}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-800" />
                        <div className="text-center font-mono text-[9px] text-slate-400 font-bold uppercase">
                          Badge: <span className="text-yellow-400 block text-sm font-black">{matchedBot?.badge}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Loading progression bar */}
              <div className="w-full max-w-md mt-8">
                <div className={`text-xs font-bold uppercase text-center mb-1 animate-pulse font-mono ${
                  queueType === 'ranked' ? 'text-rose-400' : 'text-indigo-400'
                }`}>
                  {queueType === 'ranked' ? 'LOCKING ELO MULTIPLIERS & PREPARING ARENA...' : 'CONSTRUCTING PLAYGROUND INFRASTRUCTURE...'}
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full animate-[loading_3s_ease-out_forwards] ${
                    queueType === 'ranked' ? 'bg-gradient-to-r from-rose-500 to-red-500' : 'bg-indigo-500'
                  }`} style={{ animationDuration: '3.5s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CASE OPENING ROLLING SCREEN OVERLAY */}
      {selectedCase && caseOpeningState !== 'idle' && (
        <div className="p-8 flex flex-col items-center justify-center flex-1 bg-slate-950/95 backdrop-blur-md z-10">
          <div className="w-full max-w-xl text-center space-y-4">
            <h2 className="text-2xl font-black text-white flex items-center gap-2 justify-center">
              <ShoppingBag className="w-6 h-6 text-indigo-400" />
              Opening {selectedCase.name}
            </h2>

            {/* Spinner display container */}
            <div className="relative w-full overflow-hidden py-3 bg-slate-900 rounded-2xl border border-indigo-500/20 shadow-inner flex items-center gap-2">
              {/* Selector line arrow indicators */}
              <div className="absolute inset-y-0 left-1/2 w-1.5 bg-yellow-400 z-10 shadow-lg -translate-x-1/2" title="Winner target line"></div>

              {/* Slide element wrapper wrapper */}
              <div
                style={{
                  transform: `translateX(calc(50% - ${activeSpinIndex * 158}px))`,
                  transition: caseOpeningState === 'revealed' ? 'transform 1s cubic-bezier(0.1, 0.8, 0.1, 1)' : 'transform 0.1s linear',
                }}
                className="flex items-center gap-1.5 whitespace-nowrap pl-0 transition-transform duration-100 ease-out"
              >
                {displayedRollSkins.map((skin, idx) => (
                  <div
                    key={idx}
                    className={`w-[150px] inline-flex flex-col items-center border p-2.5 rounded-xl flex-shrink-0 relative ${
                      idx === activeSpinIndex
                        ? 'bg-slate-800 border-yellow-400 scale-105 shadow-xl'
                        : 'bg-slate-950/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div style={{ color: skin.primaryColor }} className="text-2xl font-black mb-1.5 drop-shadow-md">
                      ⚔️
                    </div>
                    <div className="text-[10px] font-bold text-slate-200 capitalize truncate w-full text-center">{skin.name}</div>
                    <div className="text-[8px] text-slate-500 uppercase mt-0.5">{skin.weaponType}</div>

                    <div className={`absolute bottom-1 right-1 inset-x-1 text-[7px] py-[1px] font-bold tracking-widest text-center border rounded-md uppercase mt-1 ${getRarityBadgeStyle(skin.rarity)}`}>
                      {skin.rarity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* If revealed show big shiny congratulations dialogue card */}
            {caseOpeningState === 'revealed' && winningSkin && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-w-sm mx-auto animate-[bounce_0.6s_ease-out_1]">
                <div className="text-yellow-400 font-extrabold text-sm tracking-widest uppercase flex items-center gap-1.5 justify-center">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  UNLOCKED NEW SKIN!
                </div>

                {/* Weapon graphic display placeholder */}
                <div
                  style={{
                    backgroundColor: `${winningSkin.primaryColor}15`,
                    borderColor: `${winningSkin.primaryColor}40`,
                  }}
                  className="w-24 h-24 rounded-full mx-auto flex items-center justify-center border-4 shadow-inner relative group"
                >
                  <span style={{ color: winningSkin.primaryColor }} className="text-5xl font-black">
                    ⚔️
                  </span>
                  {winningSkin.glow && (
                    <div
                      style={{ backgroundColor: winningSkin.primaryColor }}
                      className="absolute inset-0 rounded-full opacity-10 animate-ping"
                    />
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-100">{winningSkin.name}</h3>
                  <div
                    style={{ color: winningSkin.primaryColor }}
                    className="text-xs font-bold uppercase tracking-wider mt-0.5"
                  >
                    {winningSkin.weaponType.toUpperCase()} Weapon Skin
                  </div>
                </div>

                <div className={`inline-block px-3 py-1 text-[10px] font-black border rounded-full uppercase tracking-wider ${getRarityBadgeStyle(winningSkin.rarity)}`}>
                  {winningSkin.rarity} rarity
                </div>

                <p className="text-[10px] text-slate-500 max-w-[280px] mx-auto">
                  This skin is permanently bound to your account. You can equip this inside the Armory page to display custom shooting bullet tracers.
                </p>

                <button
                  onClick={handleDismissCaseWinner}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer text-xs"
                >
                  Equip & Continue shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STANDARD LOBBY MAIN CARD & SIDEBAR NAVIGATION */}
      {matchmakingState === 'idle' && caseOpeningState === 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 flex-1">
          {/* Main vertical sidebar tab selectors (col-span-3) */}
          <div className="lg:col-span-3 flex flex-col gap-2 border-b lg:border-b-0 lg:border-r border-slate-800 pb-4 lg:pb-0 lg:pr-5">
            <div className="text-[10px] font-extrabold text-indigo-400 tracking-wider mb-2 uppercase">로비 제어 사령부</div>

            <button
              onClick={() => { gameAudio.playClickSound(); setActiveTab('matchmaking'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'matchmaking'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>1v1 매치메이킹</span>
            </button>

            <button
              onClick={() => { gameAudio.playClickSound(); setActiveTab('armory'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'armory'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Hammer className="w-4 h-4" />
              <span>무기고 로드아웃</span>
            </button>

            <button
              onClick={() => { gameAudio.playClickSound(); setActiveTab('shop'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'shop'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>크레이트 상점</span>
            </button>

            <button
              onClick={() => { gameAudio.playClickSound(); setActiveTab('crosshair'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'crosshair'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              <span>조준점 Sandbox</span>
            </button>

            <button
              onClick={() => { gameAudio.playClickSound(); setActiveTab('stats'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>내 커리어 전적</span>
            </button>

            {currentUser?.trim().toLowerCase() === 'yechan0920yo' && (
              <button
                onClick={() => { gameAudio.playClickSound(); setActiveTab('admin'); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-600/30 border border-rose-500/40'
                    : 'bg-slate-900/50 text-rose-300 border border-rose-500/10 hover:text-white hover:bg-rose-950/40 hover:border-rose-500/30'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="font-mono tracking-wider font-extrabold uppercase text-[11px] sm:text-xs">🛡️ 소버린 콘솔</span>
              </button>
            )}
          </div>

          {/* Core dynamic content window (col-span-9) */}
          <div className="lg:col-span-9" id="lobby-active-panel">

            {/* TAB 1: MATCHMAKING SCREEN (1V1 LOBBY) */}
            {activeTab === 'matchmaking' && (
              <div className="space-y-6">
                {/* Header Welcome banner / Mode selection */}
                <div className="space-y-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                        게임 모드 정밀 선택 <span className="text-xs text-indigo-400 font-bold ml-1.5 flex items-center gap-1 font-mono"><Flame className="w-3.5 h-3.5" /> 연승 기록: {stats.winStreak}</span>
                      </h2>
                      <p className="text-slate-500 text-[11px] font-medium font-sans">실시간 연습 공격이나 영광스런 랭크 포인트 경쟁전(Competitive) 전장에 참여하세요.</p>
                    </div>
                  </div>

                  {/* Mode Select Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Mode Card 1: Casual Sandbox */}
                    <div className="bg-gradient-to-t from-slate-900 to-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all hover:translate-y-[-2px] shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md text-slate-300 bg-slate-800/80 border border-slate-700/30 font-mono">
                            자유로운 연습 매치
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase font-mono">점수 변동 없음</span>
                        </div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">
                          친선 가상 캐주얼 매치
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          반사 신경을 단련하고, 조준경을 테스트하며, 사신의 낫 타이밍을 학습하세요. 아무런 강박 없이 즉시 인공지능 적배를 조우해 연습할 수 있습니다.
                        </p>
                        <div className="pt-2 text-[10px] text-slate-500 space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>승리 보상: <span className="text-amber-500 font-bold">120 골드</span> & <span className="text-sky-400 font-bold">15 젬</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>패배 위로 보상: <span className="text-amber-500 font-bold">30 골드</span></span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartQueue('casual')}
                        className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-sans font-black text-xs uppercase tracking-wider rounded-xl transition-all font-mono border border-slate-700 hover:border-slate-505 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 text-slate-300 fill-slate-300" />
                        <span>캐주얼 매치 시작</span>
                      </button>
                    </div>

                    {/* Mode Card 2: Competitive Ranked */}
                    <div className="bg-gradient-to-t from-slate-900 to-rose-950/20 border border-rose-550/25 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-rose-500/45 transition-all hover:translate-y-[-2px] relative overflow-hidden shadow-lg shadow-rose-950/10">
                      {/* Glowing background bubble */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-550/5 rounded-full blur-2xl pointer-events-none" />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md text-rose-400 bg-rose-500/10 border border-rose-500/20 font-mono flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-rose-400 animate-bounce" /> 프로 경쟁전 풀
                          </span>
                          <span className="text-[9px] text-rose-500 font-black uppercase font-mono animate-pulse">랭킹 1v1 아레나</span>
                        </div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                          랭크 경쟁전 듀얼 매치 <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded uppercase font-black">시즌 1 진행중</span>
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          브론즈 등급부터 대적자가 없는 최우수 아레나 레전드 등급까지 승격하세요! 적 봇의 실력이 나의 평점(ELO)에 맞추어 유동적으로 변동됩니다.
                        </p>
                        <div className="pt-2 text-[10px] text-slate-500 space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>위엄 승리 배당: <span className="text-amber-500 font-bold">180 골드</span> & <span className="text-sky-400 font-bold">20 젬</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>연승 시 고배율 랭킹 포인트 보너스 적립 (+5 RP)</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartQueue('ranked')}
                        className="w-full mt-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-sans font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-rose-950/20 hover:scale-101 hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 font-mono"
                      >
                        <Shield className="w-3.5 h-3.5 text-white" />
                        <span>경쟁전 대적 상대 매칭</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Grid of details: bot profile warnings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      COACHING TIPS FROM CHAMPIONS
                    </h3>
                    <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                      <li>Use <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[9px] text-indigo-300">SHIFT</kbd> to execute a slide. Doing this under fire break enemy tracing vectors!</li>
                      <li>Landing headshots with weapons like Desert Eagle or Snipers completely changes round dynamics due to high critical multipliers.</li>
                      <li>Secure the diamond armor cores on map edges to sustain heavy damage.</li>
                    </ul>
                  </div>

                  {/* Active Weapon equipped overview */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">My Combat Loadout</h3>
                      {Object.entries(WEAPON_TYPES).slice(0, 3).map(([key, value]) => {
                        const sId = equippedSkins[key] || `${key}_default`;
                        const skin = WEAPON_SKINS.find((s) => s.id === sId) || WEAPON_SKINS[0];
                        return (
                          <div key={key} className="flex items-center gap-2 text-xs font-bold text-slate-300 mt-1">
                            <span style={{ color: skin.primaryColor }}>●</span>
                            <span className="uppercase text-[10px] text-slate-500">{key}:</span>
                            {value.name}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setActiveTab('armory')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      Edit Loadout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WEAPON LOADOUTS (ARMORY) */}
            {activeTab === 'armory' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">장착 무기고</h3>
                    <p className="text-xs text-slate-500 mt-0.5">기본 무기 모델을 선택하고 획득한 비주얼 스킨 슬롯을 장착하세요.</p>
                  </div>
                  <div className="text-[10px] bg-indigo-500/10 text-indigo-300 font-mono font-bold px-3 py-1 rounded-full border border-indigo-500/20 max-w-max">
                    활성화된 로드아웃 성향
                  </div>
                </div>

                {/* Hotkey slots config panel */}
                <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-pink-500 rounded-full animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                        전술 단축키 무기배치 (인게임 매치 1, 2, 3, 4번 키)
                      </h4>
                      <p className="text-[10px] text-slate-500">전투 중 단축키로 쉽게 빼내어 쓸 무기를 슬롯에 배치하십시오</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">단축키 [1]</span>
                          <span className="text-[8px] bg-indigo-500/10 px-1.5 py-0.5 text-indigo-400 rounded-full font-mono font-bold uppercase">주무기 (Primary)</span>
                        </div>
                        <select
                          value={loadoutSlots.slot1 || 'rifle'}
                          onChange={(e) => {
                            gameAudio.playClickSound();
                            onUpdateLoadoutSlots({
                              ...loadoutSlots,
                              slot1: e.target.value as WeaponType,
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-850 text-xs font-bold text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-300"
                        >
                          {Object.entries(WEAPON_TYPES).map(([key, value]) => (
                            <option key={key} value={key}>
                              [1] {value.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-2 leading-tight">
                        주무기 단축키입니다. 고대미지 M4 소총 기본 배정.
                      </p>
                    </div>

                    {/* Slot 2 Selector */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">단축키 [2]</span>
                          <span className="text-[8px] bg-indigo-500/10 px-1.5 py-0.5 text-indigo-400 rounded-full font-mono font-bold uppercase">권총 (Secondary)</span>
                        </div>
                        <select
                          value={loadoutSlots.slot2 || 'pistol'}
                          onChange={(e) => {
                            gameAudio.playClickSound();
                            onUpdateLoadoutSlots({
                              ...loadoutSlots,
                              slot2: e.target.value as WeaponType,
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-850 text-xs font-bold text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-300"
                        >
                          {Object.entries(WEAPON_TYPES).map(([key, value]) => (
                            <option key={key} value={key}>
                              [2] {value.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-2 leading-tight">
                        비상 전술 권총입니다. 데저트 이글 권총 기본 배정.
                      </p>
                    </div>

                    {/* Slot 3 Selector */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">단축키 [3]</span>
                          <span className="text-[8px] bg-pink-500/10 px-1.5 py-0.5 text-pink-400 rounded-full font-mono font-bold uppercase">대시 근접 (Dash Melee)</span>
                        </div>
                        <select
                          value={loadoutSlots.slot3 || 'katana'}
                          onChange={(e) => {
                            gameAudio.playClickSound();
                            onUpdateLoadoutSlots({
                              ...loadoutSlots,
                              slot3: e.target.value as WeaponType,
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-850 text-xs font-bold text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-300"
                        >
                          {Object.entries(WEAPON_TYPES).map(([key, value]) => (
                            <option key={key} value={key}>
                              [3] {value.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-2 leading-tight">
                        돌진 근접 단거리 무기입니다. 죽음의 낫 배정.
                      </p>
                    </div>

                    {/* Slot 4 Selector */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">단축키 [4]</span>
                          <span className="text-[8px] bg-purple-500/10 px-1.5 py-0.5 text-purple-400 rounded-full font-mono font-bold uppercase">폭발물 (Explosive)</span>
                        </div>
                        <select
                          value={loadoutSlots.slot4 || 'rpg'}
                          onChange={(e) => {
                            gameAudio.playClickSound();
                            onUpdateLoadoutSlots({
                              ...loadoutSlots,
                              slot4: e.target.value as WeaponType,
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-850 text-xs font-bold text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-300"
                        >
                          {Object.entries(WEAPON_TYPES).map(([key, value]) => (
                            <option key={key} value={key}>
                              [4] {value.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-2 leading-tight">
                        범위 폭파식 고화력 범위 무기입니다. 수류탄 기본 배정.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Selector Tabs */}
                <div className="flex border-b border-slate-800 pb-2.5 gap-2 overflow-x-auto scrollbar-none">
                  {Object.entries(WEAPON_TYPES).map(([type, details]) => (
                    <button
                      key={type}
                      onClick={() => { gameAudio.playClickSound(); setSelectedWeaponCategory(type); }}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize cursor-pointer transition-colors whitespace-nowrap ${
                        selectedWeaponCategory === type
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {details.name}
                    </button>
                  ))}
                </div>

                {/* Selected weapon detail card */}
                {selectedWeaponCategory && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/30 p-5 rounded-2xl border border-slate-800/80">
                    <div className="md:col-span-5 space-y-4">
                      <div>
                        <h4 className="text-md font-black text-indigo-400 uppercase leading-none">
                          {WEAPON_TYPES[selectedWeaponCategory].name}
                        </h4>
                        <span className="text-[10px] bg-slate-800 text-slate-400 font-mono font-bold uppercase block w-max px-2 py-0.5 mt-1.5 rounded">
                          분류: {selectedWeaponCategory}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {WEAPON_TYPES[selectedWeaponCategory].description}
                      </p>

                      {/* Stat progress logs */}
                      <div className="space-y-2">
                        {/* Damage */}
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                            <span>기본 공격력 (Base Damage)</span>
                            <span className="text-slate-300 font-mono">{WEAPON_TYPES[selectedWeaponCategory].damage}</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1 rounded">
                            <div
                              style={{ width: `${Math.min(100, (WEAPON_TYPES[selectedWeaponCategory].damage / 110) * 100)}%` }}
                              className="h-full bg-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Fire rate */}
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                            <span>재장전 대기시간 (Reload Time)</span>
                            <span className="text-slate-300 font-mono">{WEAPON_TYPES[selectedWeaponCategory].reloadTime}초</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1 rounded">
                            <div
                              style={{ width: `${Math.min(100, (3 / WEAPON_TYPES[selectedWeaponCategory].reloadTime) * 100)}%` }}
                              className="h-full bg-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Max ammo */}
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                            <span>탄창 용량 (Magazine Size)</span>
                            <span className="text-slate-300 font-mono">{WEAPON_TYPES[selectedWeaponCategory].maxAmmo}발</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1 rounded">
                            <div
                              style={{ width: `${Math.min(100, (WEAPON_TYPES[selectedWeaponCategory].maxAmmo / 30) * 100)}%` }}
                              className="h-full bg-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skins inventory picker */}
                    <div className="md:col-span-7 space-y-3">
                      <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                        {WEAPON_TYPES[selectedWeaponCategory].name}의 보유한 커스텀 스킨 목록
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[220px] overflow-y-auto pr-1">
                        {WEAPON_SKINS.filter((skin) => skin.weaponType === selectedWeaponCategory).map((skin) => {
                          const isOwned = inventory.includes(skin.id) || skin.rarity === 'common';
                          const isEquipped = equippedSkins[selectedWeaponCategory] === skin.id ||
                            (!equippedSkins[selectedWeaponCategory] && skin.rarity === 'common');

                          return (
                            <div
                              key={skin.id}
                              className={`p-3 rounded-xl border flex flex-col justify-between text-left relative overflow-hidden transition-all ${
                                !isOwned ? 'opacity-40 bg-slate-950/40 border-slate-900' :
                                isEquipped ? 'bg-indigo-950/20 border-indigo-500 shadow-xl' : 'bg-slate-900 border-slate-800'
                              }`}
                            >
                              <div>
                                <span style={{ color: skin.primaryColor }} className="text-xl font-bold leading-none select-none block mb-1">
                                  ⚔️
                                </span>
                                <h5 className="text-[11px] font-bold text-slate-200 truncate w-full">{skin.name}</h5>
                              </div>

                              <div className="flex items-center justify-between mt-3 gap-1">
                                <span className={`text-[8px] font-bold border rounded px-1 capitalize leading-none ${getRarityBadgeStyle(skin.rarity)}`}>
                                  {skin.rarity}
                                </span>

                                {isOwned ? (
                                  isEquipped ? (
                                    <span className="text-[9px] text-indigo-400 font-black uppercase flex items-center gap-0.5 leading-none">
                                      <CheckCircle className="w-3 h-3" /> 장착됨
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleEquipSkin(selectedWeaponCategory, skin.id)}
                                      className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded cursor-pointer leading-none"
                                    >
                                      장착하기
                                    </button>
                                  )
                                ) : (
                                  <span className="text-[8px] text-slate-600 font-bold uppercase leading-none">
                                    잠김
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CASES CHEST OPENINGS (SHOP) */}
            {activeTab === 'shop' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">보급 상자 및 크레이트 상점</h3>
                  <p className="text-xs text-slate-500 mt-0.5">진귀하고 전장의 영광을 드높여 줄 무기 스킨이 들어간 전술 보급 상자를 개봉해 보세요.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {CASES.map((cDetails) => (
                    <div
                      key={cDetails.id}
                      className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 hover:scale-[1.01] transition-all"
                    >
                      <div className="space-y-3">
                        <div
                          style={{
                            backgroundColor: `${cDetails.color}15`,
                            borderColor: `${cDetails.color}40`,
                          }}
                          className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 animate-pulse mx-auto"
                        >
                          <ShoppingBag style={{ color: cDetails.color }} className="w-6 h-6" />
                        </div>

                        <div className="text-center">
                          <h4 className="text-sm font-black text-white leading-tight uppercase">{cDetails.name}</h4>
                          <p className="text-[10px] text-slate-500 mt-1 lines-clamp-2 leading-relaxed px-2">
                            {cDetails.customDescription}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="flex justify-center items-center gap-1.5 font-mono text-sm font-black">
                          {cDetails.currency === 'gold' ? (
                            <Coins className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Gem className="w-4 h-4 text-sky-400" />
                          )}
                          <span className={cDetails.currency === 'gold' ? 'text-amber-500' : 'text-sky-400'}>
                            {cDetails.cost} {cDetails.currency === 'gold' ? '골드(Gold)' : '젬(Gems)'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenCase(cDetails)}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white hover:text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-md flex items-center justify-center gap-1"
                        >
                          <span>상자 열기</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CROSSHAIR COMPONENT */}
            {activeTab === 'crosshair' && (
              <CrosshairEditor settings={crosshair} onChange={onUpdateCrosshair} />
            )}

            {/* TAB 5: LEADERBOARD & CAREER STATS */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">리전 아레나 커리어 전적 통계</h3>
                  <p className="text-xs text-slate-500 mt-0.5">안전한 로컬 브라우저 보안 스토리지 저장소에서 분석한 내 실시간 데이터 전적입니다.</p>
                </div>

                {/* OWNER / GM SPECIAL RANK BOOST UTILITY */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/25 p-5 rounded-2xl relative overflow-hidden shadow-lg shadow-indigo-950/10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-mono font-black px-2.5 py-0.5 rounded-md text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1">
                          ★ OWNER AUTHORIZED
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">{currentUser} 계정 전용</span>
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5 mt-1">
                        시크릿 랭킹 끝까지 보상 부스터 (Max RP Cheat)
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        클릭 한 번으로 즉시 랭크 포인트를 최상위 전설 티어인 <span className="text-yellow-400 font-bold">Rivals Legend (5,000 RP)</span> 등급과 만렙(Lv.100)으로 즉시 부스팅합니다.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        gameAudio.playClickSound();
                        onUpdateStats(prev => ({
                          ...prev,
                          rankedRP: 5000,
                          level: 100,
                          xp: 0,
                          gold: prev.gold < 99999 ? 99999 : prev.gold,
                          gems: prev.gems < 9999 ? 9999 : prev.gems,
                          wins: prev.wins < 99 ? 99 : prev.wins,
                          kills: prev.kills < 842 ? 842 : prev.kills,
                          winStreak: prev.winStreak < 20 ? 20 : prev.winStreak
                        }));
                      }}
                      className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:from-indigo-500 hover:to-rose-400 text-white font-sans font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-950/20 hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 font-mono"
                    >
                      <Trophy className="w-4 h-4 text-white animate-bounce" />
                      <span>Rivals Legend 부스터 기동</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard grid metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Wins */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase">승리 수 (Wins)</div>
                      <div className="text-lg font-black font-mono leading-none mt-1">{stats.wins}</div>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                    <Flame className="w-8 h-8 text-rose-500" />
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase">현재 연승 기록 (Streak)</div>
                      <div className="text-lg font-black font-mono leading-none mt-1">{stats.winStreak}</div>
                    </div>
                  </div>

                  {/* Kills */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                    <Skull className="w-8 h-8 text-red-500" />
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase">총 처치 횟수 (Kills)</div>
                      <div className="text-lg font-black font-mono leading-none mt-1">{stats.kills}</div>
                    </div>
                  </div>

                  {/* K/D Ratio */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                    <BadgeAlert className="w-8 h-8 text-emerald-400" />
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase">킬/데스 비율 (K/D)</div>
                      <div className="text-lg font-black font-mono leading-none mt-1">
                        {stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Leaderboard rankings */}
                <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    글로벌 아레나 실시간 리더보드 순위표
                  </h4>

                  <div className="divide-y divide-slate-800/60">
                    <div className="grid grid-cols-12 text-[10px] text-slate-500 font-bold uppercase py-1.5">
                      <span className="col-span-2">순위 (Rank)</span>
                      <span className="col-span-4">오퍼레이터 네임 (Operator)</span>
                      <span className="col-span-3 text-center">평점 티어 (Elo Rank)</span>
                      <span className="col-span-3 text-right">누적 승률 (Win Rates)</span>
                    </div>

                    {[
                      { pos: '#1', name: 'Singularity_Zero', rank: 'Champion v', wr: '89%' },
                      { pos: '#2', name: 'RivalsChampion_V', rank: 'Diamond iv', wr: '78%' },
                      { pos: '#3', name: `${currentUser || 'Guest'} (You)`, rank: `${stats.level > 10 ? 'Platinum i' : 'Gold iii'}`, wr: `${stats.wins + stats.losses > 0 ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) : 0}%` },
                      { pos: '#4', name: 'SniperElitePro', rank: 'Platinum iv', wr: '64%' },
                      { pos: '#5', name: 'SprayAndPray99', rank: 'Gold ii', wr: '52%' },
                    ].map((leader, i) => (
                      <div key={i} className="grid grid-cols-12 text-xs py-2.5 items-center font-medium">
                        <span className={`col-span-2 font-mono font-black ${i === 2 ? 'text-indigo-400' : 'text-slate-400'}`}>{leader.pos}</span>
                        <span className={`col-span-4 font-bold ${i === 2 ? 'text-white font-black' : 'text-slate-300'}`}>{leader.name}</span>
                        <span className="col-span-3 text-center text-yellow-500 uppercase font-bold text-[10px]">{leader.rank}</span>
                        <span className="col-span-3 text-right text-emerald-400 font-mono font-bold">{leader.wr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SOVEREIGN ADMIN PANEL CONTROLLER (EXCLUSIVELY FOR yechan0920yo) */}
            {activeTab === 'admin' && currentUser?.trim().toLowerCase() === 'yechan0920yo' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/20 to-slate-900 border border-rose-500/30 p-6 rounded-2xl relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono font-black px-2.5 py-0.5 rounded-md text-rose-400 bg-rose-500/10 border border-rose-500/30 animate-pulse">
                          ⚠️ SYSTEM SOVEREIGN AUTHORITY
                        </span>
                        <span className="text-xs text-rose-300 font-mono font-bold uppercase tracking-wider">LEVEL 5 DEV CLEARANCE</span>
                      </div>
                      <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                        YECHAN0920YO DEV CONTROL CORE
                      </h2>
                      <p className="text-slate-405 text-xs text-rose-200/75">
                        소버린 관리자 권한으로 게임 데이터베이스 상태 레이아웃을 마스터 제어할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Card 1: Resource Matrix Generator */}
                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-rose-500/10 space-y-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
                      <h3 className="text-sm font-black text-white uppercase">RESOURCE CONTROLLER</h3>
                    </div>
                    <p className="text-[11px] text-slate-500">지갑 내 골드 및 젬 보상을 완전 조작하거나 리셋합니다.</p>
                    
                    <div className="space-y-2.5 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            gameAudio.playClickSound();
                            onUpdateStats(prev => ({ ...prev, gold: prev.gold + 10000 }));
                          }}
                          className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 font-mono font-bold text-xs text-amber-400 rounded-lg transition-colors cursor-pointer border border-amber-500/10"
                        >
                          +10,000 Gold
                        </button>
                        <button
                          onClick={() => {
                            gameAudio.playClickSound();
                            onUpdateStats(prev => ({ ...prev, gold: 99999 }));
                          }}
                          className="px-3 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-mono font-black text-xs rounded-lg hover:brightness-110 transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        >
                          MAX GOLD (99,999)
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            gameAudio.playClickSound();
                            onUpdateStats(prev => ({ ...prev, gems: prev.gems + 1000 }));
                          }}
                          className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 font-mono font-bold text-xs text-sky-400 rounded-lg transition-colors cursor-pointer border border-sky-500/10"
                        >
                          +1,000 Gems
                        </button>
                        <button
                          onClick={() => {
                            gameAudio.playClickSound();
                            onUpdateStats(prev => ({ ...prev, gems: 9999 }));
                          }}
                          className="px-3 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-mono font-black text-xs rounded-lg hover:brightness-110 transition-all cursor-pointer shadow-[0_0_10px_rgba(14,165,233,0.2)]"
                        >
                          MAX GEMS (9,999)
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          onUpdateStats(prev => ({ ...prev, gold: 0, gems: 0 }));
                        }}
                        className="w-full py-2 bg-slate-950 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 font-mono font-bold text-[11px] uppercase rounded-lg border border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer"
                      >
                        Reset Resources to Zero
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Sovereign Armory Unlocker */}
                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-rose-500/10 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-sm font-black text-white uppercase">SOVEREIGN ARMORY</h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">상점 케이스를 열지 않고 즉시 인벤토리에 모든 종류의 Classified 최고급 한정판 무기 스킨을 영구 잠금 해제합니다.</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          const allSkins = WEAPON_SKINS.map(skin => skin.id);
                          onUpdateInventory(allSkins);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-indigo-650 via-purple-650 to-pink-600 hover:from-indigo-550 hover:to-pink-505 text-white font-semibold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-2 font-mono"
                      >
                        <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                        <span>전체 프리미엄 총기 스킨 완전 해금 (Unlock All)</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          const defaults = ['p_default', 'r_default', 's_default', 'sn_default', 'rpg_default', 'kd_default'];
                          onUpdateInventory(defaults);
                          onUpdateEquippedSkins({
                            pistol: 'p_default', rifle: 'r_default', shotgun: 's_default',
                            sniper: 'sn_default', rpg: 'rpg_default', katana: 'kd_default',
                          });
                        }}
                        className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-slate-500 hover:text-rose-400 font-mono font-bold text-[11px] uppercase rounded-lg border border-slate-800 hover:border-rose-500/20 transition-all cursor-pointer"
                      >
                        Reset Inventory to Defaults
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Arena Level & Rating Booster */}
                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-rose-500/10 space-y-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-rose-505" />
                      <h3 className="text-sm font-black text-white uppercase">LEAGUE RATINGS CONTROL</h3>
                    </div>
                    <p className="text-[11px] text-slate-500">즉시 매치 랭크 포지션과 등급 레벨 단계를 조정합니다.</p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          onUpdateStats(prev => ({ ...prev, level: 100, xp: 0 }));
                        }}
                        className="p-2.5 bg-slate-850 hover:bg-slate-800 hover:text-white font-mono font-bold text-xs text-indigo-400 rounded-lg transition-all border border-slate-800 cursor-pointer text-left flex items-center justify-between"
                      >
                        <span>Level</span>
                        <span className="text-white bg-indigo-500/20 px-1.5 rounded font-black">Lv.100</span>
                      </button>

                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          onUpdateStats(prev => ({ ...prev, rankedRP: 5000 }));
                        }}
                        className="p-2.5 bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-indigo-550/30 hover:border-indigo-400/50 font-mono font-bold text-xs text-yellow-500 rounded-lg transition-all cursor-pointer text-left flex items-center justify-between"
                      >
                        <span>Ranked ELO</span>
                        <span className="text-white bg-indigo-600 px-1.5 rounded font-black text-[10px] uppercase">R_Legend (5000)</span>
                      </button>

                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          onUpdateStats(prev => ({ ...prev, rankedRP: 3800 }));
                        }}
                        className="p-2.5 bg-slate-850 hover:bg-slate-800 hover:text-white font-mono font-bold text-[11px] text-purple-400 rounded-lg transition-all border border-slate-800 cursor-pointer text-left flex items-center justify-between"
                      >
                        <span>Ranked ELO</span>
                        <span className="text-white font-black text-[10px] uppercase">Champion V (3800)</span>
                      </button>

                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          onUpdateStats(prev => ({ ...prev, rankedRP: 2800 }));
                        }}
                        className="p-2.5 bg-slate-850 hover:bg-slate-800 hover:text-white font-mono font-bold text-[11px] text-teal-400 rounded-lg transition-all border border-slate-800 cursor-pointer text-left flex items-center justify-between"
                      >
                        <span>Ranked ELO</span>
                        <span className="text-white font-black text-[10px] uppercase">Diamond V (2800)</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          onUpdateStats(prev => ({ ...prev, winStreak: 50 }));
                        }}
                        className="p-2.5 bg-slate-850 hover:bg-slate-800 hover:text-white font-mono font-bold text-xs text-rose-455 rounded-lg transition-all border border-slate-800 cursor-pointer text-left flex items-center justify-between"
                      >
                        <span>Win Streak</span>
                        <span className="text-white bg-rose-500/20 px-1.5 rounded font-black">50 Streak</span>
                      </button>

                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          onUpdateStats(prev => ({ ...prev, rankedRP: 100, level: 1, xp: 0, winStreak: 0 }));
                        }}
                        className="p-2.5 bg-slate-950 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 font-mono font-semibold text-[11px] rounded-lg border border-slate-800 hover:border-rose-500/10 transition-all cursor-pointer"
                      >
                        Reset Competitive Rating
                      </button>
                    </div>
                  </div>

                  {/* Card 4: Detailed Battle Stats Manipulator */}
                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-rose-500/10 space-y-4">
                    <div className="flex items-center gap-2">
                      <Skull className="w-5 h-5 text-red-500" />
                      <h3 className="text-sm font-black text-white uppercase">STAT STATISTICS MATRIX</h3>
                    </div>
                    <p className="text-[11px] text-slate-500">프로필 요약 및 리더보드 점수 산출을 위해 개별 전적 수치를 부스팅합니다.</p>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          onUpdateStats(prev => ({ ...prev, kills: prev.kills + 100 }));
                        }}
                        className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-mono font-bold text-slate-200 rounded-lg cursor-pointer border border-slate-800 text-left flex items-center justify-between"
                      >
                        <span>Kills</span>
                        <span className="text-red-400 font-black">+100</span>
                      </button>

                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          onUpdateStats(prev => ({ ...prev, deaths: prev.deaths + 10 }));
                        }}
                        className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-mono font-bold text-slate-200 rounded-lg cursor-pointer border border-slate-800 text-left flex items-center justify-between"
                      >
                        <span>Deaths</span>
                        <span className="text-slate-400 font-black">+10</span>
                      </button>

                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          onUpdateStats(prev => ({ ...prev, headshots: prev.headshots + 50 }));
                        }}
                        className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-mono font-bold text-slate-200 rounded-lg cursor-pointer border border-slate-800 text-left flex items-center justify-between"
                      >
                        <span>Headshots</span>
                        <span className="text-amber-400 font-black">+50</span>
                      </button>

                      <button
                        onClick={() => {
                          gameAudio.playClickSound();
                          onUpdateStats(prev => ({ ...prev, wins: prev.wins + 20 }));
                        }}
                        className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-mono font-bold text-slate-200 rounded-lg cursor-pointer border border-slate-800 text-left flex items-center justify-between"
                      >
                        <span>Wins</span>
                        <span className="text-emerald-400 font-black">+20</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        gameAudio.playClickSound();
                        onUpdateStats(prev => ({
                          ...prev,
                          kills: 0,
                          deaths: 0,
                          headshots: 0,
                          wins: 0,
                          losses: 0,
                        }));
                      }}
                      className="w-full py-2 bg-slate-950 hover:bg-rose-950/30 text-slate-500 hover:text-rose-455 font-mono font-semibold text-[11px] rounded-lg border border-slate-800 hover:border-rose-500/20 transition-all cursor-pointer"
                    >
                      Reset Battle Statistics
                    </button>
                  </div>

                  {/* Card 5: Multi-player Reward Sovereign Grant Engine */}
                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-rose-500/20 space-y-4 md:col-span-2 shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">외부 계정 즉각 보상 인가 프로토콜 (Grant Multi-Player Rewards)</h3>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2.5 py-0.5 rounded border border-emerald-500/20 max-w-max">
                        CROSS-ACCOUNT MULTIPLEX
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      데이터베이스에 등록된 다른 플레이어의 계정을 정밀 탐색하여 골드, 젬, 랭킹 포인트(ELO), 또는 진귀한 비밀 한정판 등급 무기 스킨을 즉시 인벤토리에 무상 하사합니다.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      {/* Target Operator Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">1. 대상 오퍼레이터 선택</label>
                        {registeredUsers.length === 0 ? (
                          <div className="text-[11px] text-rose-400 p-2 bg-rose-950/20 border border-rose-500/10 rounded-lg">등록된 사용자가 없습니다.</div>
                        ) : (
                          <select
                            value={adminTargetUser}
                            onChange={(e) => {
                              gameAudio.playClickSound();
                              setAdminTargetUser(e.target.value);
                            }}
                            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white font-medium focus:border-rose-500/50 outline-none"
                          >
                            <option value="">-- 오퍼레이터 선택 --</option>
                            {registeredUsers.map((user) => (
                              <option key={user} value={user}>
                                {user === 'yechan0920yo' ? `👑 ${user} (본인 계정)` : user}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Gold Reward Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">2. 골드(Gold) 인가 금액</label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            value={adminGoldAmount}
                            onChange={(e) => setAdminGoldAmount(Number(e.target.value))}
                            className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-rose-500/50"
                            placeholder="0"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => { gameAudio.playClickSound(); setAdminGoldAmount(prev => prev + 1000); }}
                              className="px-1.5 py-1 bg-slate-800 text-[9px] font-mono text-slate-300 rounded hover:bg-slate-705 cursor-pointer"
                            >
                              +1K
                            </button>
                            <button
                              onClick={() => { gameAudio.playClickSound(); setAdminGoldAmount(prev => prev + 10000); }}
                              className="px-1.5 py-1 bg-slate-800 text-[9px] font-mono text-slate-300 rounded hover:bg-slate-705 cursor-pointer"
                            >
                              +10K
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Gems Reward Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">3. 젬(Gems) 인가 수량</label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            value={adminGemsAmount}
                            onChange={(e) => setAdminGemsAmount(Number(e.target.value))}
                            className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-rose-500/50"
                            placeholder="0"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => { gameAudio.playClickSound(); setAdminGemsAmount(prev => prev + 100); }}
                              className="px-1.5 py-1 bg-slate-800 text-[9px] font-mono text-slate-300 rounded hover:bg-slate-705 cursor-pointer"
                            >
                              +100
                            </button>
                            <button
                              onClick={() => { gameAudio.playClickSound(); setAdminGemsAmount(prev => prev + 1000); }}
                              className="px-1.5 py-1 bg-slate-800 text-[9px] font-mono text-slate-300 rounded hover:bg-slate-705 cursor-pointer"
                            >
                              +1K
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Ranked RP Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">4. ELO 평점(RP) 보류 인가</label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            value={adminRPAmount}
                            onChange={(e) => setAdminRPAmount(Number(e.target.value))}
                            className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-rose-500/50"
                            placeholder="0"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => { gameAudio.playClickSound(); setAdminRPAmount(prev => prev + 100); }}
                              className="px-1.5 py-1 bg-slate-800 text-[9px] font-mono text-slate-300 rounded hover:bg-slate-705 cursor-pointer"
                            >
                              +100
                            </button>
                            <button
                              onClick={() => { gameAudio.playClickSound(); setAdminRPAmount(prev => prev + 500); }}
                              className="px-1.5 py-1 bg-slate-800 text-[9px] font-mono text-slate-300 rounded hover:bg-slate-705 cursor-pointer"
                            >
                              +500
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skin rewards sub-line */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">5. 희귀 프리미엄 무기 기프트 지급 (선택 사항)</label>
                        <select
                          value={adminSelectedSkin}
                          onChange={(e) => {
                            gameAudio.playClickSound();
                            setAdminSelectedSkin(e.target.value);
                          }}
                          className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2.5 text-white outline-none focus:border-rose-500/50"
                        >
                          <option value="none">-- 총기 스킨 지급 안함 --</option>
                          {WEAPON_SKINS.map((skin) => (
                            <option key={skin.id} value={skin.id}>
                              [{skin.weaponType.toUpperCase()}] {skin.name} ({skin.rarity.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={handleGrantReward}
                          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-sans font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Gift className="w-4 h-4" />
                          <span>선택 오퍼레이터 보상 전송 시동</span>
                        </button>
                      </div>
                    </div>

                    {/* Notification Messages */}
                    {adminSuccessMsg && (
                      <div className="p-3 bg-emerald-950/45 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 mt-2 font-sans flex items-start gap-2 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-spin" />
                        <div>{adminSuccessMsg}</div>
                      </div>
                    )}
                    {adminErrorMsg && (
                      <div className="p-3 bg-rose-950/45 border border-rose-500/20 rounded-xl text-xs text-rose-300 mt-2 font-sans animate-fade-in">
                        ⚠️ {adminErrorMsg}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* LAST RANKED REPORT MODAL OVERLAY */}
      {lastRankedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-[fade-in_0.25s_ease-out_forwards]">
          <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Ambient decorative glowing colored backing */}
            <div className={`absolute top-0 inset-x-0 h-40 blur-3xl opacity-20 ${
              lastRankedReport.win ? 'bg-emerald-500' : 'bg-rose-500'
            }`} />

            {/* Header X Close Button */}
            <button 
              onClick={() => {
                gameAudio.playClickSound();
                onClearRankedReport?.();
              }}
              className="absolute top-4 right-4 p-1.5 bg-slate-900 border border-slate-850 hover:border-slate-700 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Duel outcome indicator */}
            <div className="text-center space-y-2 relative">
              <span className={`text-[10px] font-bold tracking-widest uppercase border px-2.5 py-0.5 rounded-full font-mono ${
                lastRankedReport.win 
                  ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' 
                  : 'text-rose-455 border-rose-500/20 bg-rose-500/5'
              }`}>
                Competitive Arena Report
              </span>
              <h1 className={`text-4xl font-black tracking-tighter uppercase ${
                lastRankedReport.win 
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(52,211,153,0.3)] font-mono' 
                  : 'bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)] font-mono'
              }`}>
                {lastRankedReport.win ? 'VICTORY' : 'DEFEAT'}
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Completed Ranked Duel against <span className="text-white font-bold">{lastRankedReport.botName}</span>
              </p>
            </div>

            {/* Elite Badge Progression Segment */}
            <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 text-center space-y-4">
              <div className="flex items-center justify-center gap-6">
                
                {/* Old Rank Container */}
                <div className="flex flex-col items-center space-y-1 opacity-60 scale-90">
                  <div className="text-3xl filter drop-shadow-sm leading-none">
                    {getRankFromRP(lastRankedReport.oldRP).badgeEmoji}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase font-mono">
                    {getRankFromRP(lastRankedReport.oldRP).name}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 font-mono">
                    {lastRankedReport.oldRP} RP
                  </span>
                </div>

                {/* Arrow transition indicator */}
                <div className="flex flex-col items-center">
                  <span className={`text-xs font-bold font-mono py-1 px-2.5 rounded-full flex items-center gap-0.5 ${
                    lastRankedReport.win ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {lastRankedReport.win ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {lastRankedReport.rpChange} RP
                  </span>
                  <span className="text-slate-600 text-lg mt-1">➞</span>
                </div>

                {/* New Rank Container */}
                <div className="flex flex-col items-center space-y-1 animate-pulse">
                  <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(250,204,21,0.2)] leading-none">
                    {getRankFromRP(lastRankedReport.newRP).badgeEmoji}
                  </div>
                  <span className={`text-[11px] font-black uppercase font-mono ${getRankFromRP(lastRankedReport.newRP).textGlowClass || 'text-white'}`}>
                    {getRankFromRP(lastRankedReport.newRP).name}
                  </span>
                  <span className="text-[10px] font-black text-slate-305 font-mono">
                    {lastRankedReport.newRP} RP
                  </span>
                </div>

              </div>

              {/* Progress Level bar inside division brackets */}
              {(() => {
                const currentRank = getRankFromRP(lastRankedReport.newRP);
                const prevBracketMax = currentRank.minRP;
                const nextBracketMax = currentRank.maxRP;
                const bracketSpan = Math.max(1, nextBracketMax - prevBracketMax);
                const bracketOffset = lastRankedReport.newRP - prevBracketMax;
                const percent = Math.min(100, Math.max(0, (bracketOffset / bracketSpan) * 100));
                
                return (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] text-slate-500 font-bold font-mono">
                      <span>NEXT RANK BRACKET</span>
                      <span>{Math.round(percent)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        style={{ width: `${percent}%` }} 
                        className={`h-full transition-all duration-1000 ${
                          lastRankedReport.win ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-red-500'
                        }`} 
                      />
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Earnings and coefficients breakdown */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono text-left">Duel earnings & multipliers</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-900/80 flex justify-between items-center">
                  <span className="text-slate-450">Gold Bounty</span>
                  <span className="text-amber-500 font-black font-mono flex items-center gap-0.5">
                    +{lastRankedReport.win ? 180 : 50} <Coins className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-900/80 flex justify-between items-center">
                  <span className="text-slate-450">Gems Earned</span>
                  <span className="text-sky-400 font-black font-mono flex items-center gap-0.5">
                    +{lastRankedReport.win ? 20 : 4} <Gem className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* OK claim button */}
            <button
              onClick={() => {
                gameAudio.playClickSound();
                onClearRankedReport?.();
              }}
              className={`w-full py-3.5 font-sans font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                lastRankedReport.win 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950' 
                  : 'bg-slate-800 hover:bg-slate-705 text-slate-200'
              }`}
            >
              <span>CONFIRM MATCH REWARD</span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
};
