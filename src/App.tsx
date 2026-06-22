import { useState, useEffect } from 'react';
import { PlayerStats, CrosshairSettings, BotProfile, WeaponStats, WeaponSkin, WeaponType } from './types';
import { DEFAULT_CROSSHAIR } from './components/CrosshairEditor';
import { Lobby } from './components/Lobby';
import { GameCanvas } from './components/GameCanvas';
import { AuthScreen } from './components/AuthScreen';
import { gameAudio } from './audio';
import { Swords } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<'lobby' | 'game'>('lobby');

  // --- SEPARATE ACCOUNTS STATE ---
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('rivals_current_logged_in_user');
  });

  const getActiveUserKey = () => {
    const active = localStorage.getItem('rivals_current_logged_in_user');
    return active ? active.trim().toLowerCase() : null;
  };

  // --- PERSISTENT STATE INITIALIZERS ---
  const [stats, setStats] = useState<PlayerStats>(() => {
    const userKey = getActiveUserKey();
    const storageKey = userKey ? `rivals_user_${userKey}_stats` : 'rivals_player_stats';
    const local = localStorage.getItem(storageKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.rankedRP === undefined) {
          parsed.rankedRP = 100;
        }
        return parsed;
      } catch (e) { /* fallback */ }
    }
    return {
      wins: 0,
      losses: 0,
      kills: 0,
      deaths: 0,
      headshots: 0,
      gold: 300, // Rich starting coins for 2 recruit case launches!
      gems: 10,
      level: 1,
      xp: 0,
      winStreak: 0,
      rankedRP: 100, // Starting Elo rating
    };
  });

  const [inventory, setInventory] = useState<string[]>(() => {
    const userKey = getActiveUserKey();
    const storageKey = userKey ? `rivals_user_${userKey}_inventory` : 'rivals_inventory';
    const local = localStorage.getItem(storageKey);
    if (local) {
      try { return JSON.parse(local); } catch (e) { /* fallback */ }
    }
    return ['p_default', 'r_default', 's_default', 'sn_default', 'rpg_default', 'kd_default', 'smg_default'];
  });

  const [equippedSkins, setEquippedSkins] = useState<Record<string, string>>(() => {
    const userKey = getActiveUserKey();
    const storageKey = userKey ? `rivals_user_${userKey}_equipped_skins` : 'rivals_equipped_skins';
    const local = localStorage.getItem(storageKey);
    if (local) {
      try { return JSON.parse(local); } catch (e) { /* fallback */ }
    }
    return {
      pistol: 'p_default',
      rifle: 'r_default',
      smg: 'smg_default',
      shotgun: 's_default',
      sniper: 'sn_default',
      rpg: 'rpg_default',
      katana: 'kd_default',
    };
  });

  const [loadoutSlots, setLoadoutSlots] = useState<Record<string, WeaponType>>(() => {
    const userKey = getActiveUserKey();
    const storageKey = userKey ? `rivals_user_${userKey}_loadout_slots` : 'rivals_loadout_slots';
    const local = localStorage.getItem(storageKey);
    if (local) {
      try { return JSON.parse(local); } catch (e) { /* fallback */ }
    }
    return {
      slot1: 'rifle',
      slot2: 'pistol',
      slot3: 'katana',
      slot4: 'rpg',
    };
  });

  const [crosshair, setCrosshair] = useState<CrosshairSettings>(() => {
    const userKey = getActiveUserKey();
    const storageKey = userKey ? `rivals_user_${userKey}_crosshair` : 'rivals_crosshair';
    const local = localStorage.getItem(storageKey);
    if (local) {
      try { return JSON.parse(local); } catch (e) { /* fallback */ }
    }
    return DEFAULT_CROSSHAIR;
  });

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active game-session parameters
  const [activeSession, setActiveSession] = useState<{
    bot: BotProfile;
    botSkin: WeaponSkin;
    loadoutSlots: Record<string, WeaponType>;
    equippedSkins: Record<string, string>;
    gameMode: 'casual' | 'ranked';
  } | null>(null);

  // Ranked Match Report State to trigger overlay on lobby entrance
  const [lastRankedReport, setLastRankedReport] = useState<{
    win: boolean;
    rpChange: number;
    oldRP: number;
    newRP: number;
    botName: string;
  } | null>(null);

  // Synchronizers per logged-in user key
  useEffect(() => {
    if (!currentUser) return;
    const cleanUser = currentUser.trim().toLowerCase();
    localStorage.setItem(`rivals_user_${cleanUser}_stats`, JSON.stringify(stats));
  }, [stats, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const cleanUser = currentUser.trim().toLowerCase();
    localStorage.setItem(`rivals_user_${cleanUser}_inventory`, JSON.stringify(inventory));
  }, [inventory, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const cleanUser = currentUser.trim().toLowerCase();
    localStorage.setItem(`rivals_user_${cleanUser}_equipped_skins`, JSON.stringify(equippedSkins));
  }, [equippedSkins, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const cleanUser = currentUser.trim().toLowerCase();
    localStorage.setItem(`rivals_user_${cleanUser}_loadout_slots`, JSON.stringify(loadoutSlots));
  }, [loadoutSlots, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const cleanUser = currentUser.trim().toLowerCase();
    localStorage.setItem(`rivals_user_${cleanUser}_crosshair`, JSON.stringify(crosshair));
  }, [crosshair, currentUser]);

  // Auth Operations
  const handleLogin = (username: string) => {
    const cleanUser = username.trim().toLowerCase();
    localStorage.setItem('rivals_current_logged_in_user', username);
    setCurrentUser(username);

    // Dynamic loads and resets immediately to prevent stale states
    const savedStats = localStorage.getItem(`rivals_user_${cleanUser}_stats`);
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        if (parsed.rankedRP === undefined) parsed.rankedRP = 100;
        setStats(parsed);
      } catch (e) {}
    } else {
      const dStats = {
        wins: 0, losses: 0, kills: 0, deaths: 0, headshots: 0,
        gold: 300, gems: 10, level: 1, xp: 0, winStreak: 0, rankedRP: 100
      };
      setStats(dStats);
      localStorage.setItem(`rivals_user_${cleanUser}_stats`, JSON.stringify(dStats));
    }

    const savedInv = localStorage.getItem(`rivals_user_${cleanUser}_inventory`);
    if (savedInv) {
      try { setInventory(JSON.parse(savedInv)); } catch (e) {}
    } else {
      const dInv = ['p_default', 'r_default', 's_default', 'sn_default', 'rpg_default', 'kd_default', 'smg_default'];
      setInventory(dInv);
      localStorage.setItem(`rivals_user_${cleanUser}_inventory`, JSON.stringify(dInv));
    }

    const savedEquipped = localStorage.getItem(`rivals_user_${cleanUser}_equipped_skins`);
    if (savedEquipped) {
      try { setEquippedSkins(JSON.parse(savedEquipped)); } catch (e) {}
    } else {
      const dEquipped = {
        pistol: 'p_default', rifle: 'r_default', smg: 'smg_default',
        shotgun: 's_default', sniper: 'sn_default', rpg: 'rpg_default', katana: 'kd_default',
      };
      setEquippedSkins(dEquipped);
      localStorage.setItem(`rivals_user_${cleanUser}_equipped_skins`, JSON.stringify(dEquipped));
    }

    const savedSlots = localStorage.getItem(`rivals_user_${cleanUser}_loadout_slots`);
    if (savedSlots) {
      try { setLoadoutSlots(JSON.parse(savedSlots)); } catch (e) {}
    } else {
      const dSlots = { slot1: 'rifle', slot2: 'pistol', slot3: 'katana', slot4: 'rpg' };
      setLoadoutSlots(dSlots);
      localStorage.setItem(`rivals_user_${cleanUser}_loadout_slots`, JSON.stringify(dSlots));
    }

    const savedCross = localStorage.getItem(`rivals_user_${cleanUser}_crosshair`);
    if (savedCross) {
      try { setCrosshair(JSON.parse(savedCross)); } catch (e) {}
    } else {
      setCrosshair(DEFAULT_CROSSHAIR);
      localStorage.setItem(`rivals_user_${cleanUser}_crosshair`, JSON.stringify(DEFAULT_CROSSHAIR));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rivals_current_logged_in_user');
  };

  // Audio activation listener on body once
  useEffect(() => {
    const triggerUserInteractAudio = () => {
      gameAudio.toggleSound(soundEnabled);
      document.body.removeEventListener('click', triggerUserInteractAudio);
      document.body.removeEventListener('keydown', triggerUserInteractAudio);
    };
    document.body.addEventListener('click', triggerUserInteractAudio);
    document.body.addEventListener('keydown', triggerUserInteractAudio);
    return () => {
      document.body.removeEventListener('click', triggerUserInteractAudio);
      document.body.removeEventListener('keydown', triggerUserInteractAudio);
    };
  }, [soundEnabled]);

  const handleStartGameSession = (
    bot: BotProfile,
    botSkin: WeaponSkin,
    lobbyLoadoutSlots: Record<string, WeaponType>,
    lobbyEquippedSkins: Record<string, string>,
    gameMode: 'casual' | 'ranked' = 'casual'
  ) => {
    setActiveSession({
      bot,
      botSkin,
      loadoutSlots: lobbyLoadoutSlots,
      equippedSkins: lobbyEquippedSkins,
      gameMode,
    });
    setScreen('game');
  };

  // Exit/Finishes match callback
  const handleQuitGameSession = (playerScore: number, botScore: number, finalWinner: 'player' | 'bot' | null) => {
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

          // Win streak bonus
          if (stats.winStreak >= 2) {
            baseWin += 5; // Streak bonus!
          }
          rpChange = baseWin;
          calculatedNextRP = currentRP + rpChange;
        } else {
          let baseLoss = 15;
          if (botDifficulty === 'pro') baseLoss -= 6; // Less harsh loss for challenging Pro bots
          else if (botDifficulty === 'hard') baseLoss -= 3;
          else if (botDifficulty === 'easy') baseLoss += 8; // Lose more points if losing to Easy bot

          rpChange = baseLoss;
          calculatedNextRP = Math.max(0, currentRP - rpChange);
        }
        
        // Save the ranked report card to display in Lobby!
        setLastRankedReport({
          win,
          rpChange,
          oldRP: currentRP,
          newRP: calculatedNextRP,
          botName: activeSession.bot.name,
        });
      }

      setStats((prev) => {
        const earnedGold = win ? (isRanked ? 180 : 120) : (isRanked ? 50 : 30);
        const earnedGems = win ? (isRanked ? 20 : 15) : (isRanked ? 4 : 2);

        let nextXp = prev.xp + (win ? 80 : 30);
        let nextLevel = prev.level;
        if (nextXp >= 100) {
          nextXp -= 100;
          nextLevel += 1;
        }

        return {
          ...prev,
          wins: prev.wins + (win ? 1 : 0),
          losses: prev.losses + (win ? 0 : 1),
          kills: prev.kills + playerScore, // total kills matches score
          deaths: prev.deaths + botScore,  // total deaths matches bot score
          gold: prev.gold + earnedGold,
          gems: prev.gems + earnedGems,
          level: nextLevel,
          xp: nextXp,
          winStreak: win ? prev.winStreak + 1 : 0,
          rankedRP: isRanked ? calculatedNextRP : (prev.rankedRP ?? 100),
        };
      });
    }

    // Go back to lobby index
    setActiveSession(null);
    setScreen('lobby');
  };

  const isGameActive = currentUser && screen === 'game' && activeSession;

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
              onUpdateStats={setStats}
              onUpdateInventory={setInventory}
              onUpdateEquippedSkins={setEquippedSkins}
              onUpdateCrosshair={setCrosshair}
              onStartGame={handleStartGameSession}
              loadoutSlots={loadoutSlots}
              onUpdateLoadoutSlots={setLoadoutSlots}
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
