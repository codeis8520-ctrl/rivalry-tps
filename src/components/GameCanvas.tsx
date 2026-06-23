import React, { useEffect, useRef, useState } from 'react';
import { WeaponStats, WeaponSkin, CrosshairSettings, BotProfile, GameState, WeaponType } from '../types';
import { gameAudio } from '../audio';
import { WEAPON_TYPES, WEAPON_SKINS, TAUNT_MESSAGES, DEATH_MESSAGES } from '../data';
import { Trophy, Swords, Zap, RefreshCw, Volume2, VolumeX, Shield, Heart, ArrowLeft, Send } from 'lucide-react';

interface GameCanvasProps {
  playerWeapon: WeaponStats;
  playerSkin: WeaponSkin;
  bot: BotProfile;
  botSkin: WeaponSkin;
  crosshair: CrosshairSettings;
  onQuit: (playerScore: number, botScore: number, finalWinner: 'player' | 'bot' | null) => void;
  loadoutSlots: Record<string, WeaponType>;
  equippedSkins: Record<string, string>;
  gameMode?: 'casual' | 'ranked' | '2v2';
  // 2v2 props
  allyBot?: BotProfile;
  allyBotSkin?: WeaponSkin;
  bot2?: BotProfile;
  bot2Skin?: WeaponSkin;
}

// Particle class for blood, sparks, shield breaks
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, color: string, speedModifier: number = 1) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 3 + 1) * speedModifier;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = Math.random() * 3 + 1.5;
    this.color = color;
    this.alpha = 1;
    this.maxLife = Math.random() * 20 + 15;
    this.life = this.maxLife;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.life--;
    this.alpha = Math.max(0, this.life / this.maxLife);
  }

  draw(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - cx, this.y - cy, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Floating Combat Text (damage numbers, headshots!)
interface DamageIndicator {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  vy: number;
  life: number;
}

// Bullets
interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isPlayer: boolean;
  color: string;
  speed: number;
  rangeLeft: number;
  trail: { x: number; y: number }[];
  type?: WeaponType;
}

// Rocket Projectile (RPG)
interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayer: boolean;
  color: string;
  speed: number;
}

// Grenades or Health pickup
interface MapPickup {
  x: number;
  y: number;
  type: 'health' | 'shield';
  value: number;
  active: boolean;
  respawnTimer: number;
}

// Interactive Arena Blocks
interface ArenaBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  zHeight: number;
  color: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  playerWeapon: initialPlayerWeapon,
  playerSkin: initialPlayerSkin,
  bot,
  botSkin,
  crosshair,
  onQuit,
  loadoutSlots,
  equippedSkins,
  gameMode = 'casual',
  allyBot,
  allyBotSkin,
  bot2,
  bot2Skin,
}) => {
  const is2v2 = gameMode === '2v2';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sound Toggle state
  const [soundOn, setSoundOn] = useState(true);

  // State
  const [gameState, setGameState] = useState<GameState>({
    playerHealth: 100,
    playerMaxHealth: 100,
    playerShield: 100,
    playerMaxShield: 100,
    botHealth: 100,
    botMaxHealth: 100,
    botShield: 100,
    botMaxShield: 100,
    playerScore: 0,
    botScore: 0,
    roundTimeLeft: 60,
    isGameOver: false,
    winner: null,
    roundPhase: 'warmup',
  });

  // --- IN-MATCH MULTIPLE WEAPON SLOTS ---
  const [localLoadoutSlots, setLocalLoadoutSlots] = useState<Record<string, WeaponType>>({
    slot1: loadoutSlots?.slot1 || 'rifle',
    slot2: loadoutSlots?.slot2 || 'pistol',
    slot3: loadoutSlots?.slot3 || 'katana',
    slot4: loadoutSlots?.slot4 || 'rpg',
  });

  const [currentSlot, setCurrentSlot] = useState<'1' | '2' | '3' | '4'>('1'); // Default slot 1 (M4 rifle)
  const currentSlotRef = useRef<'1' | '2' | '3' | '4'>('1');
  const [showLoadoutStore, setShowLoadoutStore] = useState(true); // Default to true at first so they can configure at start!

  const getSlotData = (slot: '1' | '2' | '3' | '4') => {
    let type: WeaponType = 'rifle';
    if (slot === '1') type = localLoadoutSlots?.slot1 || 'rifle';
    else if (slot === '2') type = localLoadoutSlots?.slot2 || 'pistol';
    else if (slot === '3') type = localLoadoutSlots?.slot3 || 'katana';
    else if (slot === '4') type = localLoadoutSlots?.slot4 || 'rpg';

    const wep = WEAPON_TYPES[type] || WEAPON_TYPES.rifle;
    const sId = equippedSkins?.[type] || `${type}_default`;
    const skin = WEAPON_SKINS.find((s) => s.id === sId) || WEAPON_SKINS[0];
    return { wep, skin };
  };

  const currentSlotData = getSlotData(currentSlot);
  const playerWeapon = currentSlotData.wep;
  const playerSkin = currentSlotData.skin;

  // Store ammo / reloading state for all slots
  const slotAmmosRef = useRef<Record<'1' | '2' | '3' | '4', number>>({
    '1': (WEAPON_TYPES[loadoutSlots?.slot1 || 'rifle'] || WEAPON_TYPES.rifle).maxAmmo,
    '2': (WEAPON_TYPES[loadoutSlots?.slot2 || 'pistol'] || WEAPON_TYPES.pistol).maxAmmo,
    '3': (WEAPON_TYPES[loadoutSlots?.slot3 || 'katana'] || WEAPON_TYPES.katana).maxAmmo,
    '4': (WEAPON_TYPES[loadoutSlots?.slot4 || 'rpg'] || WEAPON_TYPES.rpg).maxAmmo,
  });

  const slotReloadingRef = useRef<Record<'1' | '2' | '3' | '4', boolean>>({
    '1': false,
    '2': false,
    '3': false,
    '4': false,
  });

  const slotReloadProgressRef = useRef<Record<'1' | '2' | '3' | '4', number>>({
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
  });

  // Game UI stats
  const [playerCurrentAmmo, setPlayerCurrentAmmo] = useState(playerWeapon.maxAmmo);
  const [playerIsReloading, setPlayerIsReloading] = useState(false);
  const [playerReloadProgress, setPlayerReloadProgress] = useState(0);

  // Katana/Death Scythe Dash Cooldown States
  const [lastKatanaSlashTime, setLastKatanaSlashTime] = useState(0);
  const [katanaCooldownPercent, setKatanaCooldownPercent] = useState(0);

  useEffect(() => {
    if (lastKatanaSlashTime === 0) return;
    
    let active = true;
    const check = () => {
      const elapsed = Date.now() - lastKatanaSlashTime;
      const total = 3000; // 3 seconds
      if (elapsed >= total) {
        setKatanaCooldownPercent(0);
        active = false;
      } else {
        setKatanaCooldownPercent(Math.min(100, ((total - elapsed) / total) * 105));
        if (active) {
          requestAnimationFrame(check);
        }
      }
    };
    
    requestAnimationFrame(check);
    return () => {
      active = false;
    };
  }, [lastKatanaSlashTime]);

  // Refs for physics loop safety to avoid React state stale closures of RAF
  const playerCurrentAmmoRef = useRef(playerWeapon.maxAmmo);
  const playerIsReloadingRef = useRef(false);
  const playerReloadProgressRef = useRef(0);

  const updatePlayerCurrentAmmo = (val: number) => {
    playerCurrentAmmoRef.current = val;
    setPlayerCurrentAmmo(val);
  };

  const updatePlayerIsReloading = (val: boolean) => {
    playerIsReloadingRef.current = val;
    setPlayerIsReloading(val);
  };

  const updatePlayerReloadProgress = (val: number) => {
    playerReloadProgressRef.current = val;
    setPlayerReloadProgress(val);
  };

  const switchSlot = (slot: '1' | '2' | '3' | '4') => {
    const prevSlot = currentSlotRef.current;
    if (slot === prevSlot) return;

    // Save states of previous slot before transitioning
    if (playerIsReloadingRef.current) {
      slotReloadingRef.current[prevSlot] = false;
      slotReloadProgressRef.current[prevSlot] = 0;
      slotAmmosRef.current[prevSlot] = playerCurrentAmmoRef.current;
    } else {
      slotAmmosRef.current[prevSlot] = playerCurrentAmmoRef.current;
      slotReloadingRef.current[prevSlot] = playerIsReloadingRef.current;
      slotReloadProgressRef.current[prevSlot] = playerReloadProgressRef.current;
    }

    // Load states of new slot
    const nextAmmo = slotAmmosRef.current[slot];
    const nextReloading = slotReloadingRef.current[slot];
    const nextProgress = slotReloadProgressRef.current[slot];

    updatePlayerCurrentAmmo(nextAmmo);
    updatePlayerIsReloading(nextReloading);
    updatePlayerReloadProgress(nextProgress);

    currentSlotRef.current = slot;
    setCurrentSlot(slot);
    gameAudio.playClickSound();
    addChatMessage('SYSTEM', `Equipped ${getSlotData(slot).wep.name}`);
  };

  const switchSlotRef = useRef(switchSlot);
  switchSlotRef.current = switchSlot;

  const updateLoadoutSlotsInMatch = (newSlots: Record<string, WeaponType>) => {
    setLocalLoadoutSlots(newSlots);

    // Re-fill ammo for any slots whose weapons changed, or simply refill all of them!
    slotAmmosRef.current = {
      '1': (WEAPON_TYPES[newSlots.slot1 || 'rifle'] || WEAPON_TYPES.rifle).maxAmmo,
      '2': (WEAPON_TYPES[newSlots.slot2 || 'pistol'] || WEAPON_TYPES.pistol).maxAmmo,
      '3': (WEAPON_TYPES[newSlots.slot3 || 'katana'] || WEAPON_TYPES.katana).maxAmmo,
      '4': (WEAPON_TYPES[newSlots.slot4 || 'rpg'] || WEAPON_TYPES.rpg).maxAmmo,
    };

    // Reset reloading states as well
    slotReloadingRef.current = { '1': false, '2': false, '3': false, '4': false };
    slotReloadProgressRef.current = { '1': 0, '2': 0, '3': 0, '4': 0 };

    // Update active UI ammunition display
    const activeWep = WEAPON_TYPES[
      currentSlotRef.current === '1' ? newSlots.slot1 :
      currentSlotRef.current === '2' ? newSlots.slot2 :
      currentSlotRef.current === '3' ? newSlots.slot3 :
      newSlots.slot4
    ] || WEAPON_TYPES.rifle;
    updatePlayerCurrentAmmo(activeWep.maxAmmo);
    updatePlayerIsReloading(false);
    updatePlayerReloadProgress(0);

    addChatMessage('SYSTEM', '🛠️ LOADOUT UPDATED! Ready to fight.');
  };

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const toggleLoadoutStore = () => {
    if (gameStateRef.current?.roundPhase !== 'warmup') return;
    setShowLoadoutStore((prev) => !prev);
    gameAudio.playClickSound();
  };

  const toggleLoadoutStoreRef = useRef<() => void>(toggleLoadoutStore);
  toggleLoadoutStoreRef.current = toggleLoadoutStore;

  // Chat/Taunt bubbles
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; id: number }[]>([]);
  const [customChatMessage, setCustomChatMessage] = useState('');

  // Internal game engine references
  const gameLoopRef = useRef<number | null>(null);

  // Match configurations
  const arenaWidth = 1400;
  const arenaHeight = 1000;

  // Player position & physics
  const playerRef = useRef({
    x: 200,
    y: 500,
    vx: 0,
    vy: 0,
    radius: 17,
    facingAngle: 0,
    isDashing: false,
    dashCooldown: 0,
    dashTimer: 0,
    dashVx: 0,
    dashVy: 0,
    lastShotTime: 0,
    speed: 3.8,
  });

  // Bot position & physics
  const botRef = useRef({
    x: 1200,
    y: 500,
    vx: 0,
    vy: 0,
    radius: 17,
    facingAngle: Math.PI,
    isDashing: false,
    dashCooldown: 0,
    dashTimer: 0,
    dashVx: 0,
    dashVy: 0,
    lastShotTime: 0,
    speed: bot.difficulty === 'pro' ? 3.7 : bot.difficulty === 'hard' ? 3.3 : bot.difficulty === 'medium' ? 2.8 : 2.2,
    currentAmmo: WEAPON_TYPES[bot.favoriteWeapon].maxAmmo,
    isReloading: false,
    reloadProgress: 0,
    stateTimer: 0,
    behaviorState: 'idle', // idle, hunt, cover, retreat
    tauntTimer: 0,
    chatBubbleText: '',
    chatBubbleExpiry: 0,
  });

  // 2v2: Ally and second enemy refs
  const allyRef = useRef({
    x: 350, y: 700,
    vx: 0, vy: 0,
    radius: 17,
    facingAngle: 0,
    isDashing: false, dashCooldown: 0, dashTimer: 0, dashVx: 0, dashVy: 0,
    lastShotTime: 0,
    speed: 2.8,
    currentAmmo: allyBot ? WEAPON_TYPES[allyBot.favoriteWeapon]?.maxAmmo ?? 30 : 30,
    isReloading: false, reloadProgress: 0,
    stateTimer: 0, behaviorState: 'hunt' as string,
  });
  const bot2Ref = useRef({
    x: 1050, y: 300,
    vx: 0, vy: 0,
    radius: 17,
    facingAngle: Math.PI,
    isDashing: false, dashCooldown: 0, dashTimer: 0, dashVx: 0, dashVy: 0,
    lastShotTime: 0,
    speed: bot2 ? (bot2.difficulty === 'pro' ? 3.7 : bot2.difficulty === 'hard' ? 3.3 : bot2.difficulty === 'medium' ? 2.8 : 2.2) : 2.5,
    currentAmmo: bot2 ? WEAPON_TYPES[bot2.favoriteWeapon]?.maxAmmo ?? 30 : 30,
    isReloading: false, reloadProgress: 0,
    stateTimer: 0, behaviorState: 'hunt' as string,
    chatBubbleText: '', chatBubbleExpiry: 0,
  });

  // 2v2 health state (separate from main gameState to avoid breaking 1v1)
  const [teamState, setTeamState] = useState({
    allyHealth: 100, allyShield: 100,
    bot2Health: 100, bot2Shield: 100,
  });
  const allyAliveRef = useRef(true);
  const bot2AliveRef = useRef(true);
  const bot1AliveRef = useRef(true);
  // 2v2: player died but ally still alive → spectating ally
  const isSpectatingRef = useRef(false);
  const [isSpectating, setIsSpectating] = React.useState(false);

  // Keyboard controls
  const keysRef = useRef<Record<string, boolean>>({});

  // Mouse absolute viewport & relative canvas references
  const mouseRef = useRef({ x: 0, y: 0, clicked: false });
  const cameraRef = useRef({ x: 700, y: 500 });

  // Mobile touch controls — fixed joystick
  const joystickTouchIdRef = useRef<number | null>(null);
  const aimTouchIdRef = useRef<number | null>(null);
  const joystickElemRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickStick, setJoystickStick] = useState({ x: 0, y: 0 }); // px offset from joystick center
  const [showMobileChat, setShowMobileChat] = useState(false);
  const JOYSTICK_MAX_R = 40; // max travel radius in px

  // Collections
  const bulletsRef = useRef<Bullet[]>([]);
  const rocketsRef = useRef<Rocket[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const damageIndicatorsRef = useRef<DamageIndicator[]>([]);
  const pickupsRef = useRef<MapPickup[]>([
    { x: 700, y: 250, type: 'shield', value: 50, active: true, respawnTimer: 0 },
    { x: 700, y: 750, type: 'health', value: 50, active: true, respawnTimer: 0 },
    { x: 350, y: 500, type: 'shield', value: 25, active: true, respawnTimer: 0 },
    { x: 1050, y: 500, type: 'health', value: 25, active: true, respawnTimer: 0 },
  ]);

  // Map Pillars - height projected pseudo-3D blocks for cover
  const arenaBlocksRef = useRef<ArenaBlock[]>([
    // Central cross dividers
    { x: 500, y: 440, w: 80, h: 120, zHeight: 65, color: '#475569' },
    { x: 820, y: 440, w: 80, h: 120, zHeight: 65, color: '#475569' },

    // Top covers
    { x: 300, y: 150, w: 150, h: 60, zHeight: 50, color: '#334155' },
    { x: 950, y: 150, w: 150, h: 60, zHeight: 50, color: '#334155' },

    // Bottom covers
    { x: 300, y: 790, w: 150, h: 60, zHeight: 50, color: '#334155' },
    { x: 950, y: 790, w: 150, h: 60, zHeight: 50, color: '#334155' },

    // Lateral pillars
    { x: 120, y: 460, w: 60, h: 80, zHeight: 55, color: '#1e293b' },
    { x: 1220, y: 460, w: 60, h: 80, zHeight: 55, color: '#1e293b' },
  ]);

  // Countdown clock / Phase management helpers
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(3); // Warmup starts at 3
  const [matchStatusLog, setMatchStatusLog] = useState('WAINTING FOR ENEMY MATCHMAKING DUEL...');

  // Toggle Sound Wrapper
  const handleToggleSound = () => {
    const isNowOn = !soundOn;
    setSoundOn(isNowOn);
    gameAudio.toggleSound(isNowOn);
  };

  // Push chat helper
  const addChatMessage = (sender: string, text: string) => {
    setChatMessages((prev) => [
      ...prev,
      { sender, text, id: Date.now() + Math.random() },
    ].slice(-8)); // Limit to last 8 messages
  };

  // Custom chat message submit
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customChatMessage.trim()) return;
    addChatMessage('You', customChatMessage);
    gameAudio.playClickSound();

    // Bot response using per-bot chatReplies or difficulty fallback
    setTimeout(() => {
      if (gameState.isGameOver) return;
      const replies = bot.chatReplies?.length
        ? bot.chatReplies
        : {
            easy: ['저도 채팅 치면서 싸우는 거 좋아요~', '으~ 집중해야 하는데', '채팅이 더 재미있는데요 ㅎㅎ', '잠깐만요 읽고 있어요'],
            medium: ['채팅하면서 에임이 흔들리지 않아요?', '말은 나중에, 지금은 싸워요', '나이스 채팅~ 근데 죽을 준비해요', '말이 많네요~ 실력도 그만큼이길'],
            hard: ['채팅 칠 시간 있으면 포지션 봐', '말 말고 총이나 더 잘 쏴', '수다는 끝나고', '입 닫고 집중해'],
            pro: ['타이핑 속도는 프로급이네 ㅋ', '채팅할 여유 있는 게 신기하네', '그 시간에 무빙이나 연습해', '말 많은 사람치고 잘하는 사람 못 봤어'],
          }[bot.difficulty];
      const botLine = replies[Math.floor(Math.random() * replies.length)];
      addChatMessage(bot.name, botLine);
      triggerBotChatBubble(botLine);
    }, 1200);

    setCustomChatMessage('');
  };

  const triggerBotChatBubble = (text: string) => {
    botRef.current.chatBubbleText = text;
    botRef.current.chatBubbleExpiry = Date.now() + 3000;
  };

  // --- TOUCH CONTROL HANDLERS (fixed joystick) ---
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Check if touch lands on/near the fixed joystick element
      if (joystickElemRef.current && joystickTouchIdRef.current === null) {
        const jr = joystickElemRef.current.getBoundingClientRect();
        const jcx = jr.left + jr.width / 2;
        const jcy = jr.top + jr.height / 2;
        if (Math.hypot(touch.clientX - jcx, touch.clientY - jcy) < jr.width * 0.75) {
          joystickTouchIdRef.current = touch.identifier;
          setJoystickActive(true);
          continue;
        }
      }

      // Everything else = aim + fire
      if (aimTouchIdRef.current === null) {
        aimTouchIdRef.current = touch.identifier;
        const cr = canvasRef.current?.getBoundingClientRect();
        if (cr) {
          mouseRef.current.x = touch.clientX - cr.left;
          mouseRef.current.y = touch.clientY - cr.top;
        }
        mouseRef.current.clicked = true;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === joystickTouchIdRef.current && joystickElemRef.current) {
        const jr = joystickElemRef.current.getBoundingClientRect();
        const jcx = jr.left + jr.width / 2;
        const jcy = jr.top + jr.height / 2;
        const dx = touch.clientX - jcx;
        const dy = touch.clientY - jcy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normDx = dist > 0 ? dx / dist : 0;
        const normDy = dist > 0 ? dy / dist : 0;
        const cDist = Math.min(dist, JOYSTICK_MAX_R);

        setJoystickStick({ x: normDx * cDist, y: normDy * cDist });

        const thr = 0.28;
        const active = cDist > 8;
        keysRef.current['w'] = active && normDy < -thr;
        keysRef.current['s'] = active && normDy > thr;
        keysRef.current['a'] = active && normDx < -thr;
        keysRef.current['d'] = active && normDx > thr;
      } else if (touch.identifier === aimTouchIdRef.current) {
        const cr = canvasRef.current?.getBoundingClientRect();
        if (cr) {
          mouseRef.current.x = touch.clientX - cr.left;
          mouseRef.current.y = touch.clientY - cr.top;
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setJoystickActive(false);
        setJoystickStick({ x: 0, y: 0 });
        keysRef.current['w'] = false;
        keysRef.current['s'] = false;
        keysRef.current['a'] = false;
        keysRef.current['d'] = false;
      } else if (touch.identifier === aimTouchIdRef.current) {
        aimTouchIdRef.current = null;
        mouseRef.current.clicked = false;
      }
    }
  };

  // Core setup and dynamic timers
  useEffect(() => {
    gameAudio.toggleSound(soundOn);

    // Warmup audio cue
    gameAudio.playMatchStartSound();

    addChatMessage('SYSTEM', '매치 시작! 먼저 5라운드를 따내는 플레이어가 승리합니다!');
    const openingLine = bot.tauntLines?.[0] ?? TAUNT_MESSAGES[bot.difficulty][0];
    addChatMessage(bot.name, `[도발] ${openingLine}`);
    triggerBotChatBubble(openingLine);

    // Periodic banter: bot sends random chat every 22-35 seconds
    const banterInterval = setInterval(() => {
      if (gameState.isGameOver) return;
      const lines = bot.banterLines?.length ? bot.banterLines : TAUNT_MESSAGES[bot.difficulty];
      const line = lines[Math.floor(Math.random() * lines.length)];
      addChatMessage(bot.name, line);
      triggerBotChatBubble(line);
    }, 22000 + Math.random() * 13000);

    // Handle Window listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;

      // Handle Reload key manually to prevent repeating triggers
      if (k === 'r') {
        initiatePlayerReloadRef.current?.();
      }

      // Handle Buy Menu Loadout store toggle
      if (k === 'b') {
        toggleLoadoutStoreRef.current?.();
      }
      
      // Match hotkey slots switching
      if (k === '1' || k === '2' || k === '3' || k === '4') {
        switchSlotRef.current?.(k as '1' | '2' | '3' | '4');
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      clearInterval(banterInterval);
    };
  }, []);

  // Initiate reload
  const initiatePlayerReload = () => {
    if (playerIsReloadingRef.current || playerCurrentAmmoRef.current === playerWeapon.maxAmmo) return;
    if (playerWeapon.type === 'katana') return;

    updatePlayerIsReloading(true);
    updatePlayerReloadProgress(0);
    gameAudio.playReloadSound();
    addChatMessage('SYSTEM', 'Reloading...');
  };

  const initiatePlayerReloadRef = useRef(initiatePlayerReload);
  initiatePlayerReloadRef.current = initiatePlayerReload;

  // Bot active reloading
  const triggerBotReload = () => {
    const b = botRef.current;
    if (b.isReloading) return;
    b.isReloading = true;
    b.reloadProgress = 0;
  };

  // Handle countdown loop
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setGameState((prev) => {
        if (prev.isGameOver) return prev;

        // Warmup timer reduction
        if (prev.roundPhase === 'warmup') {
          if (showLoadoutStore) {
            return prev;
          }
          if (phaseTimeLeft > 1) {
            setPhaseTimeLeft((t) => t - 1);
            return prev;
          } else {
            addChatMessage('SYSTEM', '⚡ ROUND ACTIVE! GO GO GO!');
            return {
              ...prev,
              roundPhase: 'active',
              roundTimeLeft: 60,
            };
          }
        }

        // Active match clock reduction
        if (prev.roundPhase === 'active') {
          if (prev.roundTimeLeft > 1) {
            return {
              ...prev,
              roundTimeLeft: prev.roundTimeLeft - 1,
            };
          } else {
            // Draw / Sudden Death if time exhausts
            triggerRoundOver('none');
            return prev;
          }
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(clockTimer);
  }, [phaseTimeLeft, gameState.roundPhase, showLoadoutStore]);


  // Helper trigger after round death
  const triggerRoundOver = (roundWinner: 'player' | 'bot' | 'none') => {
    setGameState((prev) => {
      let pScore = prev.playerScore;
      let bScore = prev.botScore;

      if (roundWinner === 'player') pScore += 1;
      if (roundWinner === 'bot') bScore += 1;

      const isMatchSet = pScore >= 5 || bScore >= 5;
      const matchWinner = isMatchSet ? (pScore >= 5 ? 'player' : 'bot') : null;

      if (isMatchSet) {
        gameAudio.playMatchEndSound(matchWinner === 'player');
        addChatMessage('SYSTEM', `🏆 MATCH GAME OVER! Winner is: ${matchWinner === 'player' ? 'You' : bot.name}`);
        return {
          ...prev,
          playerScore: pScore,
          botScore: bScore,
          isGameOver: true,
          winner: matchWinner,
          roundPhase: 'round_end',
        };
      }

      // Small delay then start next round
      setTimeout(() => {
        resetPositionsForNextRound();
      }, 3000);

      gameAudio.playMatchEndSound(roundWinner === 'player');

      return {
        ...prev,
        playerScore: pScore,
        botScore: bScore,
        roundPhase: 'round_end',
        roundTimeLeft: 0,
      };
    });
  };

  const resetPositionsForNextRound = () => {
    // Reset player position
    playerRef.current.x = 200;
    playerRef.current.y = 500;
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;
    playerRef.current.facingAngle = 0;

    // Reset all slots ammo and reloading state using localLoadoutSlots
    slotAmmosRef.current = {
      '1': (WEAPON_TYPES[localLoadoutSlots?.slot1 || 'rifle'] || WEAPON_TYPES.rifle).maxAmmo,
      '2': (WEAPON_TYPES[localLoadoutSlots?.slot2 || 'pistol'] || WEAPON_TYPES.pistol).maxAmmo,
      '3': (WEAPON_TYPES[localLoadoutSlots?.slot3 || 'katana'] || WEAPON_TYPES.katana).maxAmmo,
      '4': (WEAPON_TYPES[localLoadoutSlots?.slot4 || 'rpg'] || WEAPON_TYPES.rpg).maxAmmo,
    };
    slotReloadingRef.current = { '1': false, '2': false, '3': false, '4': false };
    slotReloadProgressRef.current = { '1': 0, '2': 0, '3': 0, '4': 0 };

    updatePlayerCurrentAmmo(slotAmmosRef.current[currentSlotRef.current]);
    updatePlayerIsReloading(false);
    updatePlayerReloadProgress(0);

    // Reset bot position
    const b = botRef.current;
    b.x = 1200;
    b.y = 500;
    b.vx = 0;
    b.vy = 0;
    b.facingAngle = Math.PI;
    b.currentAmmo = WEAPON_TYPES[bot.favoriteWeapon].maxAmmo;
    b.isReloading = false;
    b.reloadProgress = 0;
    b.behaviorState = 'idle';

    // Reset collectibles
    pickupsRef.current.forEach((p) => {
      p.active = true;
      p.respawnTimer = 0;
    });

    // Reset projectiles
    bulletsRef.current = [];
    rocketsRef.current = [];
    particlesRef.current = [];

    // 2v2: reset ally and bot2
    if (is2v2) {
      allyRef.current.x = 350; allyRef.current.y = 700;
      allyRef.current.vx = 0; allyRef.current.vy = 0;
      allyRef.current.facingAngle = 0;
      allyRef.current.currentAmmo = allyBot ? WEAPON_TYPES[allyBot.favoriteWeapon]?.maxAmmo ?? 30 : 30;
      allyRef.current.isReloading = false; allyRef.current.reloadProgress = 0;

      bot2Ref.current.x = 1050; bot2Ref.current.y = 300;
      bot2Ref.current.vx = 0; bot2Ref.current.vy = 0;
      bot2Ref.current.facingAngle = Math.PI;
      bot2Ref.current.currentAmmo = bot2 ? WEAPON_TYPES[bot2.favoriteWeapon]?.maxAmmo ?? 30 : 30;
      bot2Ref.current.isReloading = false; bot2Ref.current.reloadProgress = 0;

      allyAliveRef.current = true;
      bot2AliveRef.current = true;
      bot1AliveRef.current = true;
      isSpectatingRef.current = false;
      setIsSpectating(false);
      setTeamState({ allyHealth: 100, allyShield: 100, bot2Health: 100, bot2Shield: 100 });
    }

    // Trigger next warmup phase
    setPhaseTimeLeft(3);
    setGameState((prev) => ({
      ...prev,
      playerHealth: 100,
      playerShield: 100,
      botHealth: 100,
      botShield: 100,
      roundPhase: 'warmup',
    }));

    gameAudio.playMatchStartSound();
  };

  // Handle core Canvas Loop and State Processing
  useEffect(() => {
    let animFrameId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resizing updates
    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = Math.max(180, containerRef.current.clientHeight);
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Core Frame ticking
    const tick = () => {
      updateGamePhysics();
      renderGameFrame(ctx, canvas);
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    gameLoopRef.current = animFrameId;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animFrameId);
    };
  }, [gameState.roundPhase, playerWeapon, playerSkin, botSkin, soundOn]);

  // Check rect-to-circle collision for pillars
  const handlePillarCollisions = (entity: { x: number; y: number; radius: number }) => {
    const blocks = arenaBlocksRef.current;
    for (const b of blocks) {
      // Find closest point on block to circle center
      const closestX = Math.max(b.x, Math.min(entity.x, b.x + b.w));
      const closestY = Math.max(b.y, Math.min(entity.y, b.y + b.h));

      const dx = entity.x - closestX;
      const dy = entity.y - closestY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < entity.radius) {
        // We have overlap push the entity out
        const overlap = entity.radius - distance;
        if (distance === 0) {
          // Centered directly on edge, push outwards arbitrarily
          entity.x -= entity.radius;
        } else {
          entity.x += (dx / distance) * overlap;
          entity.y += (dy / distance) * overlap;
        }
      }
    }
  };

  // Update logic
  const updateGamePhysics = () => {
    if (gameState.roundPhase === 'round_end' || gameState.isGameOver) {
      // Simple particle drift during round end
      particlesRef.current.forEach((p) => p.update());
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      return;
    }

    const playr = playerRef.current;
    const bt = botRef.current;

    // --- REGENERATIVE AMMO AND COOLDOWN HANDLERS ---
    if (playr.dashCooldown > 0) playr.dashCooldown--;
    if (playr.dashTimer > 0) {
      playr.dashTimer--;
      playr.x += playr.dashVx;
      playr.y += playr.dashVy;
      if (playr.dashTimer === 0) playr.isDashing = false;
    }

    if (bt.dashCooldown > 0) bt.dashCooldown--;
    if (bt.dashTimer > 0) {
      bt.dashTimer--;
      bt.x += bt.dashVx;
      bt.y += bt.dashVy;
      if (bt.dashTimer === 0) bt.isDashing = false;
    }

    // --- HANDLE PLAYER RELOADING RECOVERY ---
    if (playerIsReloadingRef.current) {
      const step = 100 / (playerWeapon.reloadTime * 60); // 60 FPS scaling
      const next = playerReloadProgressRef.current + step;
      if (next >= 100) {
        updatePlayerCurrentAmmo(playerWeapon.maxAmmo);
        updatePlayerIsReloading(false);
        updatePlayerReloadProgress(0);
      } else {
        updatePlayerReloadProgress(next);
      }
    }

    // --- HANDLE BOT RELOADING RECOVERY ---
    if (bt.isReloading) {
      const bWeapon = WEAPON_TYPES[bot.favoriteWeapon];
      const step = 100 / (bWeapon.reloadTime * 60);
      bt.reloadProgress += step;
      if (bt.reloadProgress >= 100) {
        bt.currentAmmo = bWeapon.maxAmmo;
        bt.isReloading = false;
        bt.reloadProgress = 0;
      }
    }

    // Check pickup respawns or collections
    pickupsRef.current.forEach((p) => {
      if (!p.active) {
        p.respawnTimer--;
        if (p.respawnTimer <= 0) {
          p.active = true;
        }
      } else {
        // Check Player collision with pickup
        const pDist = Math.hypot(playr.x - p.x, playr.y - p.y);
        if (pDist < playr.radius + 15) {
          collectPickup(p, 'player');
        }

        // Check Bot collision with pickup
        const bDist = Math.hypot(bt.x - p.x, bt.y - p.y);
        if (bDist < bt.radius + 15) {
          collectPickup(p, 'bot');
        }
      }
    });

    if (gameState.roundPhase === 'warmup') {
      // Allow minor sliding deceleration but no active controls
      playr.vx *= 0.8;
      playr.vy *= 0.8;
      playr.x += playr.vx;
      playr.y += playr.vy;
      handlePillarCollisions(playr);

      bt.vx *= 0.8;
      bt.vy *= 0.8;
      bt.x += bt.vx;
      bt.y += bt.vy;
      handlePillarCollisions(bt);
      return;
    }

    // --- ACTIVE MATCH CONTROLS & LOGIC ---

    // 1. Process Player Keyboard Input Movement (disabled while spectating)
    if (!playr.isDashing && !isSpectatingRef.current) {
      let dx = 0;
      let dy = 0;
      if (keysRef.current['w'] || keysRef.current['arrowup']) dy -= 1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) dy += 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) dx -= 1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) dx += 1;

      if (dx !== 0 && dy !== 0) {
        // Normalize
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
      }

      playr.vx = dx * playr.speed;
      playr.vy = dy * playr.speed;

      // Handle dodge dash (Shift dynamic slide)
      if (keysRef.current['shift'] && playr.dashCooldown === 0 && (dx !== 0 || dy !== 0)) {
        playr.isDashing = true;
        playr.dashTimer = 16; // 16 frames of sliding dash
        playr.dashCooldown = 120; // 2 seconds cooldown
        playr.dashVx = dx * 8.5;
        playr.dashVy = dy * 8.5;

        // Visual cloud particles on slide start
        for (let i = 0; i < 6; i++) {
          particlesRef.current.push(new Particle(playr.x, playr.y, '#ffffff', 0.5));
        }
      }

      playr.x += playr.vx;
      playr.y += playr.vy;
    }

    // Keep player bound within arena
    playr.x = Math.max(playr.radius, Math.min(arenaWidth - playr.radius, playr.x));
    playr.y = Math.max(playr.radius, Math.min(arenaHeight - playr.radius, playr.y));
    handlePillarCollisions(playr);

    // Dynamic rotation follows visual mouse raycasting
    const pCanvasX = playr.x - cameraRef.current.x + (canvasRef.current?.width || 0) / 2;
    const pCanvasY = playr.y - cameraRef.current.y + (canvasRef.current?.height || 0) / 2;
    playr.facingAngle = Math.atan2(mouseRef.current.y - pCanvasY, mouseRef.current.x - pCanvasX);

    // 2. Playable Weapon Firing logic
    if (mouseRef.current.clicked && !playerIsReloadingRef.current && !playr.isDashing) {
      firePlayerWeapon();
    }

    // 3. Smart Bot Behavior Engine (Ticking AI)
    processBotControls();

    // 3b. 2v2 AI for ally and enemy2
    if (is2v2) {
      if (allyAliveRef.current) {
        const allyWeapon = allyBot ? WEAPON_TYPES[allyBot.favoriteWeapon] : WEAPON_TYPES.rifle;
        const allyDefaultSkin = allyBotSkin ?? WEAPON_SKINS[0];
        processTeamBotAI(
          allyRef,
          [
            { ref: botRef, alive: gameStateRef.current.botHealth > 0 },
            { ref: bot2Ref, alive: bot2AliveRef.current },
          ],
          allyWeapon, true, allyDefaultSkin,
          allyBot?.difficulty ?? 'medium',
        );
      }
      if (bot2AliveRef.current) {
        const bot2Weapon = bot2 ? WEAPON_TYPES[bot2.favoriteWeapon] : WEAPON_TYPES.rifle;
        const bot2DefaultSkin = bot2Skin ?? WEAPON_SKINS[1] ?? WEAPON_SKINS[0];
        processTeamBotAI(
          bot2Ref,
          [
            { ref: playerRef, alive: gameStateRef.current.playerHealth > 0 },
            { ref: allyRef, alive: allyAliveRef.current },
          ],
          bot2Weapon, false, bot2DefaultSkin,
          bot2?.difficulty ?? 'medium',
        );
      }
    }

    // 4. Update Bullets and Projectiles
    updateProjectiles();

    // 5. Update Floating Indicators & Particles
    damageIndicatorsRef.current.forEach((ind) => {
      ind.y += ind.vy;
      ind.vy *= 0.98;
      ind.life--;
    });
    damageIndicatorsRef.current = damageIndicatorsRef.current.filter((ind) => ind.life > 0);

    particlesRef.current.forEach((p) => p.update());
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

    // 6. Camera follows Player (or ally when spectating in 2v2)
    const camTarget = (is2v2 && isSpectatingRef.current) ? allyRef.current : playr;
    cameraRef.current.x += (camTarget.x - cameraRef.current.x) * 0.1;
    cameraRef.current.y += (camTarget.y - cameraRef.current.y) * 0.1;

    // Hard camera boundary lock
    const cw = canvasRef.current?.width || 800;
    const ch = canvasRef.current?.height || 600;
    cameraRef.current.x = Math.max(cw / 2, Math.min(arenaWidth - cw / 2, cameraRef.current.x));
    cameraRef.current.y = Math.max(ch / 2, Math.min(arenaHeight - ch / 2, cameraRef.current.y));
  };

  const collectPickup = (p: MapPickup, entityType: 'player' | 'bot') => {
    p.active = false;
    p.respawnTimer = 450; // Respawns after ~7.5 seconds
    gameAudio.playHitmarkerSound(true); // High pitched feedback ping

    // Splat star particles on collect
    const col = p.type === 'health' ? '#4ade80' : '#38bdf8';
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push(new Particle(p.x, p.y, col, 1.2));
    }

    setGameState((prev) => {
      if (entityType === 'player') {
        let nH = prev.playerHealth;
        let nS = prev.playerShield;
        if (p.type === 'health') {
          nH = Math.min(prev.playerMaxHealth, prev.playerHealth + p.value);
          damageIndicatorsRef.current.push({
            x: playerRef.current.x,
            y: playerRef.current.y - 25,
            text: `+${p.value} HP`,
            color: '#4ade80',
            size: 14,
            vy: -1.5,
            life: 45,
          });
        } else {
          nS = Math.min(prev.playerMaxShield, prev.playerShield + p.value);
          damageIndicatorsRef.current.push({
            x: playerRef.current.x,
            y: playerRef.current.y - 25,
            text: `+${p.value} AP`,
            color: '#38bdf8',
            size: 14,
            vy: -1.5,
            life: 45,
          });
        }
        return { ...prev, playerHealth: nH, playerShield: nS };
      } else {
        let nH = prev.botHealth;
        let nS = prev.botShield;
        if (p.type === 'health') {
          nH = Math.min(prev.botMaxHealth, prev.botHealth + p.value);
          damageIndicatorsRef.current.push({
            x: botRef.current.x,
            y: botRef.current.y - 25,
            text: `+${p.value} HP`,
            color: '#4ade80',
            size: 14,
            vy: -1.5,
            life: 45,
          });
        } else {
          nS = Math.min(prev.botMaxShield, prev.botShield + p.value);
          damageIndicatorsRef.current.push({
            x: botRef.current.x,
            y: botRef.current.y - 25,
            text: `+${p.value} AP`,
            color: '#38bdf8',
            size: 14,
            vy: -1.5,
            life: 45,
          });
        }
        return { ...prev, botHealth: nH, botShield: nS };
      }
    });
  };

  const firePlayerWeapon = () => {
    if (isSpectatingRef.current) return; // can't shoot while spectating
    const playr = playerRef.current;
    const now = Date.now();
    if (now - playr.lastShotTime < playerWeapon.fireRate) return;
    if (playerWeapon.type !== 'katana' && playerCurrentAmmoRef.current <= 0) {
      playr.lastShotTime = now;
      gameAudio.playDryFireSound();
      initiatePlayerReload();
      return;
    }

    playr.lastShotTime = now;
    if (playerWeapon.type !== 'katana') {
      updatePlayerCurrentAmmo(playerCurrentAmmoRef.current - 1);
    } else {
      // Keep ammo fully charged for katana/scythe so it never reports 0 ammo or blocks slot-swapping mechanics
      updatePlayerCurrentAmmo(playerWeapon.maxAmmo);
    }
    gameAudio.playShootSound(playerWeapon.type);

    // Generate projectile triggers based on Weapons
    const baseAngle = playr.facingAngle;

    // Shift muzzle positions visually outwards to look modern
    const barrelX = playr.x + Math.cos(baseAngle) * 22;
    const barrelY = playr.y + Math.sin(baseAngle) * 22;

    if (playerWeapon.type === 'katana') {
      // High-speed Slash dash action logic
      setLastKatanaSlashTime(now);
      playr.isDashing = true;
      playr.dashTimer = 10;
      playr.dashCooldown = 180; // 3 seconds in frames (60 FPS)
      playr.dashVx = Math.cos(baseAngle) * 11;
      playr.dashVy = Math.sin(baseAngle) * 11;

      // Check immediate sweep area for hit
      const checkSlashSweep = () => {
        const bt = botRef.current;
        const dist = Math.hypot(bt.x - playr.x, bt.y - playr.y);
        if (dist < 100) {
          dealDamageToEntity('bot', playerWeapon.damage, false);
        }
      };
      setTimeout(checkSlashSweep, 100);

      // Sword slash visual circle sparks
      for (let i = 0; i < 15; i++) {
        particlesRef.current.push(new Particle(barrelX, barrelY, playerSkin.primaryColor, 1.8));
      }
      return;
    }

    if (playerWeapon.type === 'rpg') {
      // Spawn slow rocket launcher shell
      rocketsRef.current.push({
        x: barrelX,
        y: barrelY,
        vx: Math.cos(baseAngle) * playerWeapon.bulletSpeed,
        vy: Math.sin(baseAngle) * playerWeapon.bulletSpeed,
        isPlayer: true,
        color: playerSkin.primaryColor,
        speed: playerWeapon.bulletSpeed,
      });
      return;
    }

    // Launch general bullet or shotgun pallets
    for (let i = 0; i < playerWeapon.bulletCount; i++) {
      const scatter = (Math.random() - 0.5) * playerWeapon.spread;
      const angle = baseAngle + scatter;
      bulletsRef.current.push({
        x: barrelX,
        y: barrelY,
        vx: Math.cos(angle) * playerWeapon.bulletSpeed,
        vy: Math.sin(angle) * playerWeapon.bulletSpeed,
        damage: playerWeapon.damage,
        isPlayer: true,
        color: playerSkin.primaryColor,
        speed: playerWeapon.bulletSpeed,
        rangeLeft: playerWeapon.range,
        trail: [],
        type: playerWeapon.type,
      });
    }

    // Add recoil feedback camera screen shake placeholder
    cameraRef.current.x += (Math.random() - 0.5) * 8;
    cameraRef.current.y += (Math.random() - 0.5) * 8;
  };

  // Bot core AI logic (runs at 60Hz)
  const processBotControls = () => {
    const bt = botRef.current;
    const playr = playerRef.current;
    const bWeapon = WEAPON_TYPES[bot.favoriteWeapon];

    if (bt.isDashing) {
      bt.x = Math.max(bt.radius, Math.min(arenaWidth - bt.radius, bt.x));
      bt.y = Math.max(bt.radius, Math.min(arenaHeight - bt.radius, bt.y));
      handlePillarCollisions(bt);
      return;
    }

    // In 2v2 spectator mode (player dead), bot1 redirects to ally
    const bot1Target = (is2v2 && isSpectatingRef.current && allyAliveRef.current)
      ? allyRef.current
      : playr;

    // Track targets with smooth rotation limits (no instant snaps!)
    const distToPlayer = Math.hypot(bot1Target.x - bt.x, bot1Target.y - bt.y);
    const targetAngle = Math.atan2(bot1Target.y - bt.y, bot1Target.x - bt.x);
    let angleDiff = targetAngle - bt.facingAngle;
    
    // Normalize to -PI to PI
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    
    // Maximum turn rate per frame depending on difficulty
    let maxTurnSpeed = 0.15; // default
    if (bot.difficulty === 'easy') maxTurnSpeed = 0.06;
    else if (bot.difficulty === 'medium') maxTurnSpeed = 0.09;
    else if (bot.difficulty === 'hard') maxTurnSpeed = 0.13;
    else if (bot.difficulty === 'pro') maxTurnSpeed = 0.17;
    
    if (Math.abs(angleDiff) > maxTurnSpeed) {
      bt.facingAngle += Math.sign(angleDiff) * maxTurnSpeed;
    } else {
      bt.facingAngle = targetAngle;
    }

    // State timings
    bt.stateTimer--;
    if (bt.stateTimer <= 0) {
      // Re-evaluate state
      bt.stateTimer = Math.floor(Math.random() * 60) + 30; // reassess every 0.5 - 1.5s
      const healthPct = (gameState.botHealth + gameState.botShield) / 200;

      if (healthPct < 0.35) {
        // High danger, look for cover blocks or health pickups
        const nearestHealth = pickupsRef.current
          .filter((p) => p.active && p.type === 'health')
          .sort((a, b) => Math.hypot(a.x - bt.x, a.y - bt.y) - Math.hypot(b.x - bt.x, b.y - bt.y))[0];

        if (nearestHealth && Math.hypot(nearestHealth.x - bt.x, nearestHealth.y - bt.y) < 400) {
          bt.behaviorState = 'seek_pickup';
        } else {
          bt.behaviorState = 'cover';
        }
      } else if (distToPlayer > bWeapon.range * 0.7) {
        // Out of weapon ideal profile, hunt down player
        bt.behaviorState = 'hunt';
      } else if (distToPlayer < bWeapon.range * 0.3 && (bWeapon.type === 'sniper')) {
        // Snipe bot gets compressed, retreats
        bt.behaviorState = 'retreat';
      } else {
        // Ideal spray profile, circle, strafe, slide
        bt.behaviorState = Math.random() > 0.4 ? 'strafe' : 'hunt';
      }
    }

    // Movement logic according to states
    let targetVx = 0;
    let targetVy = 0;

    switch (bt.behaviorState) {
      case 'hunt':
        targetVx = Math.cos(bt.facingAngle) * bt.speed;
        targetVy = Math.sin(bt.facingAngle) * bt.speed;
        break;

      case 'retreat':
        targetVx = -Math.cos(bt.facingAngle) * bt.speed;
        targetVy = -Math.sin(bt.facingAngle) * bt.speed;
        break;

      case 'strafe':
        // Move perpendicular to player
        const strafeAngle = bt.facingAngle + Math.PI / 2;
        targetVx = Math.cos(strafeAngle) * bt.speed;
        targetVy = Math.sin(strafeAngle) * bt.speed;
        break;

      case 'seek_pickup':
        const nearestH = pickupsRef.current
          .filter((p) => p.active)
          .sort((a, b) => Math.hypot(a.x - bt.x, a.y - bt.y) - Math.hypot(b.x - bt.x, b.y - bt.y))[0];
        if (nearestH) {
          const angleToP = Math.atan2(nearestH.y - bt.y, nearestH.x - bt.x);
          targetVx = Math.cos(angleToP) * bt.speed;
          targetVy = Math.sin(angleToP) * bt.speed;
        } else {
          bt.behaviorState = 'cover';
        }
        break;

      case 'cover':
        // Move to the closest pillar
        const nearestBlock = arenaBlocksRef.current
          .sort((a, b) => Math.hypot((a.x + a.w/2) - bt.x, (a.y + a.h/2) - bt.y) - Math.hypot((b.x + b.w/2) - bt.x, (b.y + b.h/2) - bt.y))[0];

        if (nearestBlock) {
          // Hide behind block relative to player
          const bCenterX = nearestBlock.x + nearestBlock.w / 2;
          const bCenterY = nearestBlock.y + nearestBlock.h / 2;
          const angleFromPlayer = Math.atan2(bCenterY - bot1Target.y, bCenterX - bot1Target.x);

          const coverX = bCenterX + Math.cos(angleFromPlayer) * 50;
          const coverY = bCenterY + Math.sin(angleFromPlayer) * 50;

          const angleToCover = Math.atan2(coverY - bt.y, coverX - bt.x);
          targetVx = Math.cos(angleToCover) * bt.speed;
          targetVy = Math.sin(angleToCover) * bt.speed;
        } else {
          bt.behaviorState = 'hunt';
        }
        break;
    }

    // Bot random slide/dodge trigger for difficulty modifiers
    if (
      (bot.difficulty === 'pro' || bot.difficulty === 'hard') &&
      bt.dashCooldown === 0 &&
      Math.random() < 0.007 &&
      (targetVx !== 0 || targetVy !== 0)
    ) {
      bt.isDashing = true;
      bt.dashTimer = 16;
      bt.dashCooldown = 180;
      bt.dashVx = (targetVx / bt.speed) * 8.0;
      bt.dashVy = (targetVy / bt.speed) * 8.0;

      // Slide cloud particles
      for (let i = 0; i < 4; i++) {
        particlesRef.current.push(new Particle(bt.x, bt.y, '#ffffff', 0.5));
      }
    }

    if (!bt.isDashing) {
      bt.vx = targetVx;
      bt.vy = targetVy;
      bt.x += bt.vx;
      bt.y += bt.vy;
    }

    bt.x = Math.max(bt.radius, Math.min(arenaWidth - bt.radius, bt.x));
    bt.y = Math.max(bt.radius, Math.min(arenaHeight - bt.radius, bt.y));
    handlePillarCollisions(bt);

    // --- BOT ATTACK / FIRE CONTROL --- Check sightlines (no wall blocks intersecting ray)
    if (!bt.isReloading && bt.currentAmmo <= 0) {
      triggerBotReload();
      return;
    }

    if (!bt.isReloading && !bt.isDashing) {
      const now = Date.now();
      // Adjust bot fire rate depending on difficulty to give player breathing room
      let botFireRate = bWeapon.fireRate;
      if (bot.difficulty === 'easy') botFireRate *= 1.45;
      else if (bot.difficulty === 'medium') botFireRate *= 1.2;
      else if (bot.difficulty === 'hard') botFireRate *= 1.05;
      else if (bot.difficulty === 'pro') botFireRate *= 0.95;

      if (now - bt.lastShotTime > botFireRate) {
        // Can fire: check range and sightlines
        if (distToPlayer < bWeapon.range * 1.1) {
          // Line of sight validation
          if (hasLineOfSight(bt.x, bt.y, bot1Target.x, bot1Target.y)) {
            // Also add a random split-second reaction hesitation before firing
            let shootPanicChance = 0.12; // 12% hesitation per frame check
            if (bot.difficulty === 'easy') shootPanicChance = 0.16;
            else if (bot.difficulty === 'medium') shootPanicChance = 0.08;
            else if (bot.difficulty === 'hard') shootPanicChance = 0.03;
            else shootPanicChance = 0.01;

            if (Math.random() > shootPanicChance) {
              fireBotWeapon(bWeapon, bt, bot1Target);
            }
          }
        }
      }
    }
  };

  // Check LoS
  const hasLineOfSight = (x1: number, y1: number, x2: number, y2: number) => {
    const blocks = arenaBlocksRef.current;
    for (const b of blocks) {
      if (lineIntersectsRect(x1, y1, x2, y2, b.x, b.y, b.w, b.h)) {
        return false;
      }
    }
    return true;
  };

  const lineIntersectsRect = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ) => {
    // Standard AABB line segment intersection
    let minX = Math.min(x1, x2);
    let maxX = Math.max(x1, x2);
    let minY = Math.min(y1, y2);
    let maxY = Math.max(y1, y2);

    if (maxX < rx || minX > rx + rw || maxY < ry || minY > ry + rh) return false;

    // Check if either point is inside the rect
    if (x1 >= rx && x1 <= rx + rw && y1 >= ry && y1 <= ry + rh) return true;
    if (x2 >= rx && x2 <= rx + rw && y2 >= ry && y2 <= ry + rh) return true;

    // Fast check for corners
    return true;
  };

  const fireBotWeapon = (bWeapon: WeaponStats, bt: any, playr: any) => {
    bt.lastShotTime = Date.now();
    bt.currentAmmo--;
    gameAudio.playShootSound(bWeapon.type);

    const barrelX = bt.x + Math.cos(bt.facingAngle) * 22;
    const barrelY = bt.y + Math.sin(bt.facingAngle) * 22;

    // Aim offset error depending on bot difficulty settings (nerfed slightly for humane playability)
    let aimOffset = 0;
    if (bot.difficulty === 'easy') aimOffset = (Math.random() - 0.5) * 0.28;
    else if (bot.difficulty === 'medium') aimOffset = (Math.random() - 0.5) * 0.16;
    else if (bot.difficulty === 'hard') aimOffset = (Math.random() - 0.5) * 0.09;
    else if (bot.difficulty === 'pro') aimOffset = (Math.random() - 0.5) * 0.04;

    const baseAngle = bt.facingAngle + aimOffset;

    if (bWeapon.type === 'katana') {
      bt.isDashing = true;
      bt.dashTimer = 10;
      bt.dashCooldown = 40;
      bt.dashVx = Math.cos(baseAngle) * 10;
      bt.dashVy = Math.sin(baseAngle) * 10;

      const checkSlash = () => {
        const dist = Math.hypot(playr.x - bt.x, playr.y - bt.y);
        if (dist < 100) {
          dealDamageToEntity('player', bWeapon.damage, false);
        }
      };
      setTimeout(checkSlash, 100);

      for (let i = 0; i < 10; i++) {
        particlesRef.current.push(new Particle(barrelX, barrelY, botSkin.primaryColor, 1.8));
      }
      return;
    }

    if (bWeapon.type === 'rpg') {
      rocketsRef.current.push({
        x: barrelX,
        y: barrelY,
        vx: Math.cos(baseAngle) * bWeapon.bulletSpeed,
        vy: Math.sin(baseAngle) * bWeapon.bulletSpeed,
        isPlayer: false,
        color: botSkin.primaryColor,
        speed: bWeapon.bulletSpeed,
      });
      return;
    }

    // Standard Projectile
    for (let i = 0; i < bWeapon.bulletCount; i++) {
      const scatter = (Math.random() - 0.5) * bWeapon.spread;
      const angle = baseAngle + scatter;
      bulletsRef.current.push({
        x: barrelX,
        y: barrelY,
        vx: Math.cos(angle) * bWeapon.bulletSpeed,
        vy: Math.sin(angle) * bWeapon.bulletSpeed,
        damage: bWeapon.damage,
        isPlayer: false,
        color: botSkin.primaryColor,
        speed: bWeapon.bulletSpeed,
        rangeLeft: bWeapon.range,
        trail: [],
        type: bWeapon.type,
      });
    }
  };

  // ─── 2v2 AI helpers ───────────────────────────────────────────────────────
  const fireTeamBotWeapon = (weapon: WeaponStats, attacker: any, target: any, isPlayerTeam: boolean, skin: WeaponSkin) => {
    attacker.lastShotTime = Date.now();
    attacker.currentAmmo--;
    gameAudio.playShootSound(weapon.type);

    const barrelX = attacker.x + Math.cos(attacker.facingAngle) * 22;
    const barrelY = attacker.y + Math.sin(attacker.facingAngle) * 22;
    const aimOffset = (Math.random() - 0.5) * 0.22;
    const baseAngle = attacker.facingAngle + aimOffset;

    if (weapon.type === 'rpg') {
      rocketsRef.current.push({ x: barrelX, y: barrelY, vx: Math.cos(baseAngle) * weapon.bulletSpeed, vy: Math.sin(baseAngle) * weapon.bulletSpeed, isPlayer: isPlayerTeam, color: skin.primaryColor, speed: weapon.bulletSpeed });
      return;
    }
    if (weapon.type === 'katana') {
      const dist = Math.hypot(target.x - attacker.x, target.y - attacker.y);
      if (dist < 110) {
        if (isPlayerTeam) {
          const alive2 = bot2AliveRef.current;
          if (alive2 && Math.hypot(bot2Ref.current.x - attacker.x, bot2Ref.current.y - attacker.y) < 110) dealDamageTo2v2Entity('bot2', weapon.damage, false);
          dealDamageTo2v2Entity('bot', weapon.damage, false);
        } else {
          dealDamageToEntity('player', weapon.damage, false);
          if (allyAliveRef.current && Math.hypot(allyRef.current.x - attacker.x, allyRef.current.y - attacker.y) < 110) dealDamageTo2v2Entity('ally', weapon.damage, false);
        }
      }
      return;
    }
    for (let i = 0; i < weapon.bulletCount; i++) {
      const scatter = (Math.random() - 0.5) * weapon.spread;
      bulletsRef.current.push({
        x: barrelX, y: barrelY,
        vx: Math.cos(baseAngle + scatter) * weapon.bulletSpeed,
        vy: Math.sin(baseAngle + scatter) * weapon.bulletSpeed,
        damage: weapon.damage,
        isPlayer: isPlayerTeam,
        color: skin.primaryColor,
        speed: weapon.bulletSpeed,
        rangeLeft: weapon.range,
        trail: [],
        type: weapon.type,
      });
    }
  };

  const processTeamBotAI = (
    attackerRef: React.MutableRefObject<any>,
    targets: Array<{ ref: React.MutableRefObject<any>; alive: boolean }>,
    weapon: WeaponStats,
    isPlayerTeam: boolean,
    skin: WeaponSkin,
    difficulty: string,
  ) => {
    const attacker = attackerRef.current;

    // Reload
    if (attacker.isReloading) {
      const step = 100 / (weapon.reloadTime * 60);
      attacker.reloadProgress += step;
      if (attacker.reloadProgress >= 100) {
        attacker.currentAmmo = weapon.maxAmmo;
        attacker.isReloading = false;
        attacker.reloadProgress = 0;
      }
    }

    // Find nearest alive target
    const alive = targets.filter(t => t.alive);
    if (alive.length === 0) {
      attacker.vx *= 0.85; attacker.vy *= 0.85;
      attacker.x += attacker.vx; attacker.y += attacker.vy;
      return;
    }
    const target = alive.reduce((best, t) => {
      return Math.hypot(t.ref.current.x - attacker.x, t.ref.current.y - attacker.y) < Math.hypot(best.ref.current.x - attacker.x, best.ref.current.y - attacker.y) ? t : best;
    }, alive[0]);
    const tgt = target.ref.current;
    const distToTarget = Math.hypot(tgt.x - attacker.x, tgt.y - attacker.y);

    // Turn speed by difficulty
    const targetAngle = Math.atan2(tgt.y - attacker.y, tgt.x - attacker.x);
    let angleDiff = targetAngle - attacker.facingAngle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    const maxTurn = difficulty === 'pro' ? 0.16 : difficulty === 'hard' ? 0.12 : difficulty === 'medium' ? 0.09 : 0.06;
    if (Math.abs(angleDiff) > maxTurn) attacker.facingAngle += Math.sign(angleDiff) * maxTurn;
    else attacker.facingAngle = targetAngle;

    // Movement
    if (distToTarget > 320) {
      attacker.vx = Math.cos(attacker.facingAngle) * attacker.speed;
      attacker.vy = Math.sin(attacker.facingAngle) * attacker.speed;
    } else if (distToTarget > 130) {
      const strafeAngle = attacker.facingAngle + (Math.sin(Date.now() / 800) > 0 ? Math.PI / 2 : -Math.PI / 2);
      attacker.vx = Math.cos(strafeAngle) * attacker.speed * 0.8;
      attacker.vy = Math.sin(strafeAngle) * attacker.speed * 0.8;
    } else {
      attacker.vx *= 0.8; attacker.vy *= 0.8;
    }
    attacker.x += attacker.vx;
    attacker.y += attacker.vy;
    attacker.x = Math.max(attacker.radius, Math.min(arenaWidth - attacker.radius, attacker.x));
    attacker.y = Math.max(attacker.radius, Math.min(arenaHeight - attacker.radius, attacker.y));
    handlePillarCollisions(attacker);

    // Fire
    if (!attacker.isReloading) {
      if (attacker.currentAmmo <= 0) { attacker.isReloading = true; attacker.reloadProgress = 0; return; }
      const now = Date.now();
      const fireRate = weapon.fireRate * (difficulty === 'easy' ? 1.4 : difficulty === 'medium' ? 1.2 : 1.05);
      if (now - attacker.lastShotTime > fireRate && distToTarget < weapon.range * 1.1) {
        if (hasLineOfSight(attacker.x, attacker.y, tgt.x, tgt.y)) {
          const panicChance = difficulty === 'easy' ? 0.2 : difficulty === 'medium' ? 0.1 : 0.04;
          if (Math.random() > panicChance) fireTeamBotWeapon(weapon, attacker, tgt, isPlayerTeam, skin);
        }
      }
    }
  };

  const dealDamageTo2v2Entity = (target: 'ally' | 'bot' | 'bot2', rawDmg: number, isHeadshot: boolean) => {
    const ex = target === 'ally' ? allyRef.current.x : target === 'bot2' ? bot2Ref.current.x : botRef.current.x;
    const ey = target === 'ally' ? allyRef.current.y : target === 'bot2' ? bot2Ref.current.y : botRef.current.y;

    if (target === 'ally' || target === 'bot2') {
      setTeamState(prev => {
        let hp = target === 'ally' ? prev.allyHealth : prev.bot2Health;
        let sp = target === 'ally' ? prev.allyShield : prev.bot2Shield;
        let isArmor = false;
        if (sp > 0) { isArmor = true; const abs = Math.min(sp, rawDmg); sp -= abs; hp -= (rawDmg - abs); }
        else hp -= rawDmg;
        hp = Math.max(0, hp);

        const hitColor = isArmor ? '#38bdf8' : (target === 'ally' ? '#4ade80' : '#f87171');
        for (let i = 0; i < 5; i++) particlesRef.current.push(new Particle(ex, ey, hitColor, 1.1));
        damageIndicatorsRef.current.push({ x: ex + (Math.random() - 0.5) * 20, y: ey - 20, text: isHeadshot ? `🎯 ${rawDmg}` : `${rawDmg}`, color: isArmor ? '#38bdf8' : '#fff', size: 12, vy: -1.8, life: 40 });

        if (hp <= 0) {
          if (target === 'ally') {
            allyAliveRef.current = false;
            for (let i = 0; i < 20; i++) particlesRef.current.push(new Particle(ex, ey, '#4ade80', 2));
            if (isSpectatingRef.current) {
              // player is dead and was watching ally → now both team members dead → round over
              isSpectatingRef.current = false;
              setIsSpectating(false);
              addChatMessage('SYSTEM', `💀 ${allyBot?.name ?? '아군'} 전사! 라운드 패배...`);
              triggerRoundOver('bot');
            } else {
              addChatMessage('SYSTEM', `💀 ${allyBot?.name ?? '아군'} 전사! 혼자서 싸워라!`);
            }
          } else if (target === 'bot2') {
            bot2AliveRef.current = false;
            gameAudio.playKillSound();
            for (let i = 0; i < 20; i++) particlesRef.current.push(new Particle(ex, ey, '#fbbf24', 2));
            addChatMessage(bot2?.name ?? 'Enemy2', `💀 [사망] 쓰러졌다!`);
            // Check if both enemies dead → player wins round
            if (!bot1AliveRef.current) triggerRoundOver('player');
          }
        }
        return target === 'ally'
          ? { ...prev, allyHealth: hp, allyShield: sp }
          : { ...prev, bot2Health: hp, bot2Shield: sp };
      });
    } else {
      // bot (enemy1) death in 2v2: check bot2 also dead
      dealDamageToEntity('bot', rawDmg, isHeadshot);
    }
  };

  // Projectile processing
  const updateProjectiles = () => {
    const playr = playerRef.current;
    const bt = botRef.current;

    // A. STANDARD BULLETS
    const activeBullets: Bullet[] = [];
    for (const b of bulletsRef.current) {
      let active = true;

      // Update positions
      b.x += b.vx;
      b.y += b.vy;
      b.rangeLeft -= b.speed;

      // Append trails
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 5) b.trail.shift();

      if (b.rangeLeft <= 0) {
        active = false;
      }

      // Check block collisions
      if (active) {
        for (const block of arenaBlocksRef.current) {
          if (
            b.x >= block.x &&
            b.x <= block.x + block.w &&
            b.y >= block.y &&
            b.y <= block.y + block.h
          ) {
            // Bullet hit wall block! Spawn grey sparks
            active = false;
            for (let i = 0; i < 4; i++) {
              particlesRef.current.push(new Particle(b.x, b.y, '#94a3b8', 0.8));
            }
            break;
          }
        }
      }

      // Check entity overlaps
      if (active) {
        if (b.isPlayer) {
          // Player-team bullets hit enemy1
          const dist = Math.hypot(bt.x - b.x, bt.y - b.y);
          if (dist < bt.radius + 3 && gameStateRef.current.botHealth > 0) {
            active = false;
            const isHead = b.y < bt.y - bt.radius * 0.3;
            const finalDmg = isHead ? Math.round(b.damage * playerWeapon.headshotMult) : b.damage;
            dealDamageToEntity('bot', finalDmg, isHead);
          }
          // 2v2: also check enemy2
          if (active && is2v2 && bot2AliveRef.current) {
            const b2 = bot2Ref.current;
            const dist2 = Math.hypot(b2.x - b.x, b2.y - b.y);
            if (dist2 < b2.radius + 3) {
              active = false;
              const isHead = b.y < b2.y - b2.radius * 0.3;
              const finalDmg = isHead ? Math.round(b.damage * playerWeapon.headshotMult) : b.damage;
              dealDamageTo2v2Entity('bot2', finalDmg, isHead);
            }
          }
        } else {
          // Enemy bullets hit player
          const dist = Math.hypot(playr.x - b.x, playr.y - b.y);
          if (dist < playr.radius + 3) {
            active = false;
            const isHead = b.y < playr.y - playr.radius * 0.3;
            const bWeapon = WEAPON_TYPES[bot.favoriteWeapon];
            const finalDmg = isHead ? Math.round(b.damage * bWeapon.headshotMult) : b.damage;
            dealDamageToEntity('player', finalDmg, isHead);
          }
          // 2v2: also check ally
          if (active && is2v2 && allyAliveRef.current) {
            const al = allyRef.current;
            const distA = Math.hypot(al.x - b.x, al.y - b.y);
            if (distA < al.radius + 3) {
              active = false;
              const isHead = b.y < al.y - al.radius * 0.3;
              const attackerWeapon = WEAPON_TYPES[b.isPlayer ? (allyBot?.favoriteWeapon ?? 'rifle') : bot.favoriteWeapon];
              const finalDmgAlly = isHead ? Math.round(b.damage * attackerWeapon.headshotMult) : b.damage;
              dealDamageTo2v2Entity('ally', finalDmgAlly, isHead);
            }
          }
        }
      }

      if (active) {
        activeBullets.push(b);
      }
    }
    bulletsRef.current = activeBullets;

    // B. RPG ROCKETS
    const activeRockets: Rocket[] = [];
    for (const r of rocketsRef.current) {
      let active = true;
      r.x += r.vx;
      r.y += r.vy;

      // Check arena borders
      if (r.x < 0 || r.x > arenaWidth || r.y < 0 || r.y > arenaHeight) {
        explodeRocket(r);
        active = false;
      }

      // Check wall blocks
      if (active) {
        for (const block of arenaBlocksRef.current) {
          if (
            r.x >= block.x &&
            r.x <= block.x + block.w &&
            r.y >= block.y &&
            r.y <= block.y + block.h
          ) {
            explodeRocket(r);
            active = false;
            break;
          }
        }
      }

      // Check player/bot bounds
      if (active) {
        if (r.isPlayer) {
          if (Math.hypot(bt.x - r.x, bt.y - r.y) < bt.radius + 10) { explodeRocket(r); active = false; }
          if (active && is2v2 && bot2AliveRef.current && Math.hypot(bot2Ref.current.x - r.x, bot2Ref.current.y - r.y) < bot2Ref.current.radius + 10) { explodeRocket(r); active = false; }
        } else {
          if (Math.hypot(playr.x - r.x, playr.y - r.y) < playr.radius + 10) { explodeRocket(r); active = false; }
          if (active && is2v2 && allyAliveRef.current && Math.hypot(allyRef.current.x - r.x, allyRef.current.y - r.y) < allyRef.current.radius + 10) { explodeRocket(r); active = false; }
        }
      }

      if (active) {
        // Rocket particle exhaust puff
        particlesRef.current.push(new Particle(r.x, r.y, '#fb923c', 0.2));
        activeRockets.push(r);
      }
    }
    rocketsRef.current = activeRockets;
  };

  const explodeRocket = (r: Rocket) => {
    gameAudio.playShootSound('rpg'); // Heavy explosion vibration
    const blastRadius = 140;

    // Spawn massive fiery smoke particles
    for (let i = 0; i < 30; i++) {
      const p = new Particle(r.x, r.y, i % 2 === 0 ? '#ef4444' : '#f97316', 2.5);
      particlesRef.current.push(p);
    }

    // Splash damage calculations
    const playr = playerRef.current;
    const bt = botRef.current;

    // Damage player if in blast circle
    const distToP = Math.hypot(playr.x - r.x, playr.y - r.y);
    if (distToP < blastRadius) {
      const factor = 1 - distToP / blastRadius;
      const finalDmg = Math.round(100 * factor);
      if (finalDmg > 5) {
        dealDamageToEntity('player', finalDmg, false);
      }
    }

    // Damage bot if in blast circle
    const distToBot = Math.hypot(bt.x - r.x, bt.y - r.y);
    if (distToBot < blastRadius) {
      const factor = 1 - distToBot / blastRadius;
      const finalDmg = Math.round(100 * factor);
      if (finalDmg > 5) {
        dealDamageToEntity('bot', finalDmg, false);
      }
    }

    // 2v2: damage ally and bot2 too
    if (is2v2) {
      if (allyAliveRef.current) {
        const distA = Math.hypot(allyRef.current.x - r.x, allyRef.current.y - r.y);
        if (distA < blastRadius) { const f = 1 - distA / blastRadius; const d = Math.round(100 * f); if (d > 5) dealDamageTo2v2Entity('ally', d, false); }
      }
      if (bot2AliveRef.current) {
        const distB2 = Math.hypot(bot2Ref.current.x - r.x, bot2Ref.current.y - r.y);
        if (distB2 < blastRadius) { const f = 1 - distB2 / blastRadius; const d = Math.round(100 * f); if (d > 5) dealDamageTo2v2Entity('bot2', d, false); }
      }
    }

    // Camera shakes
    cameraRef.current.x += (Math.random() - 0.5) * 20;
    cameraRef.current.y += (Math.random() - 0.5) * 20;
  };

  const dealDamageToEntity = (target: 'player' | 'bot', rawDmg: number, isHeadshot: boolean) => {
    // Spawn shield spark or blood particles depending on shield state
    const playr = playerRef.current;
    const bt = botRef.current;
    const ex = target === 'player' ? playr.x : bt.x;
    const ey = target === 'player' ? playr.y : bt.y;

    setGameState((prev) => {
      let isArmorActive = false;
      let hp = target === 'player' ? prev.playerHealth : prev.botHealth;
      let sp = target === 'player' ? prev.playerShield : prev.botShield;

      if (sp > 0) {
        isArmorActive = true;
        const shieldAbsorb = Math.min(sp, rawDmg);
        sp -= shieldAbsorb;
        hp -= (rawDmg - shieldAbsorb);
      } else {
        hp -= rawDmg;
      }

      hp = Math.max(0, hp);

      // Hit feedback
      if (target === 'bot') {
        gameAudio.playHitmarkerSound(isHeadshot);

        // Neon hit sparks
        const hitColor = isArmorActive ? '#38bdf8' : '#f87171';
        for (let i = 0; i < 6; i++) {
          particlesRef.current.push(new Particle(ex, ey, hitColor, 1.2));
        }

        // Floating label
        damageIndicatorsRef.current.push({
          x: ex + (Math.random() - 0.5) * 20,
          y: ey - 20,
          text: isHeadshot ? `🎯 CRIT ${rawDmg}` : `${rawDmg}`,
          color: isHeadshot ? '#ef4444' : isArmorActive ? '#38bdf8' : '#fff',
          size: isHeadshot ? 17 : 13,
          vy: -2,
          life: 45,
        });

        // Trigger bot defensive dodge behaviors if high damage
        if (rawDmg > 30) {
          bt.stateTimer = 5; // force immediate reaction tick
          bt.behaviorState = 'cover';
        }
      } else {
        // Red blood splashes on Screen
        const hitColor = isArmorActive ? '#38bdf8' : '#b91c1c';
        for (let i = 0; i < 6; i++) {
          particlesRef.current.push(new Particle(ex, ey, hitColor, 1.2));
        }

        // Flash screen shake
        cameraRef.current.x += (Math.random() - 0.5) * 12;
        cameraRef.current.y += (Math.random() - 0.5) * 12;
      }

      // Check death
      if (hp <= 0) {
        // Handle Death!
        handleEntityDeath(target);
      }

      if (target === 'player') {
        return { ...prev, playerHealth: hp, playerShield: sp };
      } else {
        return { ...prev, botHealth: hp, botShield: sp };
      }
    });
  };

  const handleEntityDeath = (victim: 'player' | 'bot') => {
    gameAudio.playKillSound();

    if (victim === 'player') {
      // In 2v2, attribute taunt to whichever enemy is alive (or random if both alive)
      const killerBot = (is2v2 && bot2 && !bot1AliveRef.current) ? bot2
        : (is2v2 && bot2 && bot2AliveRef.current && Math.random() < 0.5) ? bot2
        : bot;
      const tauntPool = killerBot.tauntLines?.length ? killerBot.tauntLines : TAUNT_MESSAGES[killerBot.difficulty];
      const killerQuote = tauntPool[Math.floor(Math.random() * tauntPool.length)];
      addChatMessage(killerBot.name, `☠️ [도발] ${killerQuote}`);
      triggerBotChatBubble(killerQuote);

      // Bloat death splatter
      for (let i = 0; i < 24; i++) {
        particlesRef.current.push(new Particle(playerRef.current.x, playerRef.current.y, '#ef4444', 2));
      }

      // 2v2: if ally is still alive, enter spectator mode instead of round over
      if (is2v2 && allyAliveRef.current) {
        isSpectatingRef.current = true;
        setIsSpectating(true);
        addChatMessage('SYSTEM', `☠️ 전사! ${allyBot?.name ?? '아군'} 관전 중...`);
        // freeze player in place
        playerRef.current.vx = 0;
        playerRef.current.vy = 0;
        return;
      }

      triggerRoundOver('bot');
    } else {
      const deathPool = bot.deathLines?.length ? bot.deathLines : DEATH_MESSAGES[bot.difficulty];
      const deathQuote = deathPool[Math.floor(Math.random() * deathPool.length)];
      addChatMessage(bot.name, `💀 [사망] ${deathQuote}`);
      triggerBotChatBubble(deathQuote);

      // Bot death chunks
      for (let i = 0; i < 24; i++) {
        particlesRef.current.push(new Particle(botRef.current.x, botRef.current.y, '#fbbf24', 2));
      }

      bot1AliveRef.current = false;
      // 2v2: only trigger round over when BOTH enemies are dead
      if (is2v2 && bot2AliveRef.current) {
        addChatMessage('SYSTEM', `💀 ${bot.name} 처치! ${bot2?.name ?? '적2'} 남은 체력 주의!`);
      } else {
        triggerRoundOver('player');
      }
    }
  };


  // --- MAIN RENDER ROUTINES ---
  const renderGameFrame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const playr = playerRef.current;
    const bt = botRef.current;
    const cx = cameraRef.current.x;
    const cy = cameraRef.current.y;

    // Clean canvas with modern dark grid arena
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw dynamic ground grid lines in perspective
    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;

    const gridSize = 80;
    const startX = Math.floor((cx - canvas.width / 2) / gridSize) * gridSize;
    const endX = startX + canvas.width + gridSize * 2;
    const startY = Math.floor((cy - canvas.height / 2) / gridSize) * gridSize;
    const endY = startY + canvas.height + gridSize * 2;

    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x - cx + canvas.width / 2, startY - cy + canvas.height / 2);
      ctx.lineTo(x - cx + canvas.width / 2, endY - cy + canvas.height / 2);
      ctx.stroke();
    }

    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX - cx + canvas.width / 2, y - cy + canvas.height / 2);
      ctx.lineTo(endX - cx + canvas.width / 2, y - cy + canvas.height / 2);
      ctx.stroke();
    }
    ctx.restore();

    // Map borders boundary line
    ctx.save();
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 4;
    ctx.strokeRect(
      -cx + canvas.width / 2,
      -cy + canvas.height / 2,
      arenaWidth,
      arenaHeight
    );
    ctx.restore();

    // RENDER ORDER: Shadows -> pickups -> blocks/pillars base -> entities/bullets -> height walls caps -> particles -> user UI overlays

    // 1. Shadows of all objects on flat floor
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    const renderShadow = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.ellipse(x - cx + canvas.width / 2, y - cy + canvas.height / 2 + 10, r, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    renderShadow(playr.x, playr.y, playr.radius);
    renderShadow(bt.x, bt.y, bt.radius);

    pickupsRef.current.forEach((p) => {
      if (p.active) renderShadow(p.x, p.y + 4, 15);
    });
    ctx.restore();

    // 2. Map Pickups (Health circles and shield drops)
    pickupsRef.current.forEach((p) => {
      if (!p.active) return;
      const px = p.x - cx + canvas.width / 2;
      const py = p.y - cy + canvas.height / 2;

      ctx.save();
      // Neon glow ring
      const floatVal = Math.sin(Date.now() / 200) * 4;
      const ringGlow = p.type === 'health' ? '#4ade80' : '#38bdf8';

      ctx.shadowBlur = 10;
      ctx.shadowColor = ringGlow;
      ctx.strokeStyle = ringGlow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py + floatVal, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Core insignia
      ctx.fillStyle = ringGlow;
      ctx.beginPath();
      if (p.type === 'health') {
        // Draw cross
        ctx.fillRect(px - 3, py + floatVal - 8, 6, 16);
        ctx.fillRect(px - 8, py + floatVal - 3, 16, 6);
      } else {
        // Draw shield diamond
        ctx.moveTo(px, py + floatVal - 10);
        ctx.lineTo(px + 8, py + floatVal - 2);
        ctx.lineTo(px, py + floatVal + 8);
        ctx.lineTo(px - 8, py + floatVal - 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });

    // 3. Bullet Tracers (lines with trail fade)
    ctx.save();
    for (const b of bulletsRef.current) {
      if (b.trail.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(b.trail[0].x - cx + canvas.width / 2, b.trail[0].y - cy + canvas.height / 2);
      for (let i = 1; i < b.trail.length; i++) {
        ctx.lineTo(b.trail[i].x - cx + canvas.width / 2, b.trail[i].y - cy + canvas.height / 2);
      }
      ctx.lineWidth = b.type === 'sniper' ? 3 : b.type === 'shotgun' ? 1.5 : 2;
      ctx.strokeStyle = b.color;
      ctx.stroke();
    }
    ctx.restore();

    // 4. RPG Rockets rendered as glowing cylinders
    for (const r of rocketsRef.current) {
      const rx = r.x - cx + canvas.width / 2;
      const ry = r.y - cy + canvas.height / 2;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(Math.atan2(r.vy, r.vx));

      // Draw red/orange glowing rocket
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#f97316';
      ctx.fillStyle = r.color;
      ctx.fillRect(-15, -4, 20, 8);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(5, -4);
      ctx.lineTo(12, 0);
      ctx.lineTo(5, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 5. Drawing Arena Blocks with genuine height extrusion (Isometric 3D block feeling!)
    arenaBlocksRef.current.forEach((b) => {
      const bx = b.x - cx + canvas.width / 2;
      const by = b.y - cy + canvas.height / 2;
      const zh = b.zHeight;

      // Draw shadow block base
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(bx, by, b.w, b.h + 8);

      // Draw side walls of extruded pillar
      ctx.fillStyle = '#1e293b'; // dark shade
      ctx.beginPath();
      ctx.moveTo(bx, by + b.h);
      ctx.lineTo(bx, by + b.h - zh);
      ctx.lineTo(bx + b.w, by + b.h - zh);
      ctx.lineTo(bx + b.w, by + b.h);
      ctx.closePath();
      ctx.fill();

      // Left shadow wall
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by - zh);
      ctx.lineTo(bx, by + b.h - zh);
      ctx.lineTo(bx, by + b.h);
      ctx.closePath();
      ctx.fill();

      // Draw top cap
      ctx.fillStyle = b.color; // Standard slate color
      ctx.fillRect(bx, by - zh, b.w, b.h);

      // Outline top border
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by - zh, b.w, b.h);
    });

    // 6. Draw Characters / Avatars in elegant Roblox aesthetics
    const drawAvatar = (
      ax: number,
      ay: number,
      angle: number,
      hbVal: number,
      maxH: number,
      sbVal: number,
      maxS: number,
      skin: WeaponSkin,
      nameLabel: string,
      isPlayerAvatar: boolean,
      isSlasher: boolean,
      entityDashing?: boolean,
      bodyColor?: string,
      nameLabelColor?: string,
    ) => {
      const rx = ax - cx + canvas.width / 2;
      const ry = ay - cy + canvas.height / 2;

      ctx.save();
      ctx.translate(rx, ry);

      // Draw sliding dust trail if dashing
      const charDashing = entityDashing !== undefined ? entityDashing : (isPlayerAvatar ? playr.isDashing : bt.isDashing);
      if (charDashing) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(-20, 10, 8, 0, Math.PI*2);
        ctx.fill();
      }

      // Dynamic rotation
      ctx.rotate(angle);

      // Draw Roblox square Block shoulders/torso
      ctx.fillStyle = bodyColor ?? (isPlayerAvatar ? '#3b82f6' : '#ef4444');
      ctx.fillRect(-15, -15, 22, 30);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(-15, -15, 22, 30);

      // Block head
      ctx.fillStyle = '#fef08a'; // yellow skin
      ctx.fillRect(-8, -8, 16, 16);
      ctx.strokeRect(-8, -8, 16, 16);

      // Roblox happy/angry eyes face
      ctx.fillStyle = '#000000';
      ctx.fillRect(2, -5, 2, 2);
      ctx.fillRect(2, 3, 2, 2);
      ctx.fillRect(5, -2, 1, 4); // mouth

      // Render Held Gun Skin mesh visually
      ctx.save();
      // Gun coordinates
      ctx.translate(8, 6);
      ctx.fillStyle = skin.primaryColor;
      ctx.shadowBlur = skin.glow ? 8 : 0;
      ctx.shadowColor = skin.primaryColor;

      // Draw custom weapon size based on classes
      if (isSlasher) {
        // DRAW SWORD/KATANA!
        ctx.strokeStyle = skin.primaryColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(28, -2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8, -1, 5, 3); // hilt
      } else {
        // Draw normal gun box
        ctx.fillRect(-5, -2, 22, 5); // receiver
        ctx.fillStyle = skin.secondaryColor;
        ctx.fillRect(8, -1, 8, 3); // barrel
        ctx.fillRect(-3, 2, 3, 6); // clip/grip
      }
      ctx.restore();

      ctx.restore();

      // Draw Character Floating HUD: Name, Health, Shield
      ctx.save();
      ctx.translate(rx, ry);

      // A. Label
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillStyle = nameLabelColor ?? (isPlayerAvatar ? '#3b82f6' : '#f97316');
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'center';
      ctx.fillText(nameLabel, 0, -32);

      // B. Bars Container background
      const barW = 54;
      const barH = 5;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(-barW / 2, -26, barW, barH); // health bg
      if (maxS > 0) ctx.fillRect(-barW / 2, -20, barW, barH); // shield bg

      // C. Render Active Shield/Heart progress
      const hpPct = Math.max(0, hbVal / maxH);
      ctx.fillStyle = '#10b981'; // vibrant green
      ctx.fillRect(-barW / 2, -26, barW * hpPct, barH);

      if (maxS > 0) {
        const spPct = Math.max(0, sbVal / maxS);
        ctx.fillStyle = '#06b6d4'; // neon armor blue
        ctx.fillRect(-barW / 2, -20, barW * spPct, barH);
      }
      ctx.restore();

      // Bot chat bubble pop bubble override
      if (!isPlayerAvatar && bt.chatBubbleText && bt.chatBubbleExpiry > Date.now()) {
        ctx.save();
        ctx.font = 'bold 12px system-ui, sans-serif';
        const metrics = ctx.measureText(bt.chatBubbleText);
        const padX = 10;
        const padY = 6;
        const bubbleW = metrics.width + padX * 2;
        const bubbleH = 24;

        const bx_b = rx - bubbleW / 2;
        const by_b = ry - 65;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#ec4899'; // bubble outline pink
        ctx.lineWidth = 1.5;

        // Custom balloon block
        ctx.beginPath();
        ctx.roundRect(bx_b, by_b, bubbleW, bubbleH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(bt.chatBubbleText, rx, by_b + 16);
        ctx.restore();
      }
    };

    // Draw Player (hidden while spectating — player is dead)
    if (!isSpectatingRef.current) {
      drawAvatar(
        playr.x,
        playr.y,
        playr.facingAngle,
        gameState.playerHealth,
        gameState.playerMaxHealth,
        gameState.playerShield,
        gameState.playerMaxShield,
        playerSkin,
        'You',
        true,
        playerWeapon.type === 'katana'
      );
    }

    // Draw Bot enemy (enemy1)
    if (gameState.botHealth > 0) {
      drawAvatar(bt.x, bt.y, bt.facingAngle, gameState.botHealth, gameState.botMaxHealth, gameState.botShield, gameState.botMaxShield, botSkin, bot.name, false, WEAPON_TYPES[bot.favoriteWeapon].type === 'katana', bt.isDashing, '#ef4444', '#f97316');
    }

    // 2v2: Draw Ally (green) and Enemy2 (red)
    if (is2v2) {
      const al = allyRef.current;
      const b2 = bot2Ref.current;
      const ts = teamState;
      if (allyAliveRef.current) {
        const allyWeapon = allyBot ? WEAPON_TYPES[allyBot.favoriteWeapon] : WEAPON_TYPES.rifle;
        const allySkin2 = allyBotSkin ?? WEAPON_SKINS[0];
        drawAvatar(al.x, al.y, al.facingAngle, ts.allyHealth, 100, ts.allyShield, 100, allySkin2, `[아군] ${allyBot?.name ?? 'Ally'}`, false, allyWeapon.type === 'katana', al.isDashing, '#22c55e', '#22c55e');
      }
      if (bot2AliveRef.current) {
        const bot2Weapon = bot2 ? WEAPON_TYPES[bot2.favoriteWeapon] : WEAPON_TYPES.rifle;
        const bot2SkinDraw = bot2Skin ?? WEAPON_SKINS[1] ?? WEAPON_SKINS[0];
        drawAvatar(b2.x, b2.y, b2.facingAngle, ts.bot2Health, 100, ts.bot2Shield, 100, bot2SkinDraw, bot2?.name ?? 'Enemy2', false, bot2Weapon.type === 'katana', b2.isDashing, '#ef4444', '#f97316');
      }
    }

    // 7. Render dynamic particle burst
    particlesRef.current.forEach((p) => p.draw(ctx, cx - canvas.width / 2, cy - canvas.height / 2));

    // 8. Render Floating Indicators (Damage Numbers & Level XP tags)
    damageIndicatorsRef.current.forEach((ind) => {
      const ix = ind.x - cx + canvas.width / 2;
      const iy = ind.y - cy + canvas.height / 2;

      ctx.save();
      ctx.font = `black ${ind.size + 1}px Arial, Impact, sans-serif`;
      ctx.fillStyle = 'black'; // text shadow outline
      ctx.textAlign = 'center';
      ctx.fillText(ind.text, ix + 1, iy + 1);

      ctx.font = `bold ${ind.size}px Arial, Impact, sans-serif`;
      ctx.fillStyle = ind.color;
      ctx.fillText(ind.text, ix, iy);
      ctx.restore();
    });

    // 9. Centered User Custom Crosshair Overlays
    const middleX = canvas.width / 2;
    const middleY = canvas.height / 2;

    // Movement recoil spacing calculation
    let recoilGap = crosshair.gap;
    if (crosshair.dynamicBloom) {
      const movementSpeed = Math.hypot(playr.vx, playr.vy);
      recoilGap += Math.round(movementSpeed * 1.5);
    }

    ctx.save();
    // Center point
    if (crosshair.dot) {
      ctx.fillStyle = crosshair.color;
      if (crosshair.outline) {
        ctx.strokeStyle = crosshair.outlineColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(middleX, middleY, crosshair.thickness / 2, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(middleX, middleY, crosshair.thickness / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const drawCrosshairArm = (tx: number, ty: number, tw: number, th: number) => {
      if (crosshair.outline) {
        ctx.fillStyle = crosshair.outlineColor;
        ctx.fillRect(tx - 1, ty - 1, tw + 2, th + 2);
      }
      ctx.fillStyle = crosshair.color;
      ctx.fillRect(tx, ty, tw, th);
    };

    // Draw Top Arm
    drawCrosshairArm(
      middleX - crosshair.thickness / 2,
      middleY - recoilGap - crosshair.size,
      crosshair.thickness,
      crosshair.size
    );

    // Draw Bottom Arm
    drawCrosshairArm(
      middleX - crosshair.thickness / 2,
      middleY + recoilGap,
      crosshair.thickness,
      crosshair.size
    );

    // Draw Left Arm
    drawCrosshairArm(
      middleX - recoilGap - crosshair.size,
      middleY - crosshair.thickness / 2,
      crosshair.size,
      crosshair.thickness
    );

    // Draw Right Arm
    drawCrosshairArm(
      middleX + recoilGap,
      middleY - crosshair.thickness / 2,
      crosshair.size,
      crosshair.thickness
    );
    ctx.restore();
  };

  return (
    <div className="flex flex-col bg-slate-950 text-white rounded-none sm:rounded-3xl overflow-hidden shadow-none sm:shadow-2xl border-0 sm:border border-slate-800 h-full" id="gameplay-arena-container">
      {/* HUD Header */}
      <div className="flex items-center justify-between bg-slate-900 px-2 sm:px-6 py-2 sm:py-4 border-b border-slate-800 gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => {
              gameAudio.playClickSound();
              onQuit(gameState.playerScore, gameState.botScore, gameState.winner);
            }}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Duel Lobby</span>
          </button>
          
          <div className="hidden md:flex items-center gap-2">
            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded border font-mono tracking-wider ${
              gameMode === 'ranked'
                ? 'bg-rose-550/10 text-rose-400 border-rose-500/20'
                : gameMode === '2v2'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-indigo-500/10 text-indigo-450 border-indigo-500/15'
            }`}>
              {gameMode === 'ranked' ? '🏆 RANKED' : gameMode === '2v2' ? '⚔️ 2v2 TEAM' : '⚔️ CASUAL'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          {/* Round Score display */}
          <div className="flex items-center gap-2 sm:gap-4 bg-slate-950 px-2 sm:px-4 py-1.5 rounded-full border border-slate-800">
            <span className={`text-[10px] sm:text-xs font-bold ${is2v2 ? 'text-emerald-400' : 'text-blue-400'}`}>{is2v2 ? 'TEAM' : 'YOU'}</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-xl font-black text-white font-mono">{gameState.playerScore}</span>
              <span className="text-slate-600">:</span>
              <span className="text-base sm:text-xl font-black text-white font-mono">{gameState.botScore}</span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-red-400 uppercase">{is2v2 ? 'ENEMY' : bot.name.slice(0, 8)}</span>
          </div>

          {/* 2v2 mini health strip */}
          {is2v2 && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-[9px] font-mono">
              <span className="text-emerald-400 font-bold">아군</span>
              <div className="flex flex-col gap-0.5">
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${teamState.allyHealth}%` }} className={`h-full rounded-full ${allyAliveRef.current ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                </div>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${teamState.allyShield}%` }} className="h-full bg-cyan-500 rounded-full" />
                </div>
              </div>
              <span className="text-slate-500">|</span>
              <span className="text-red-400 font-bold">적2</span>
              <div className="flex flex-col gap-0.5">
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${teamState.bot2Health}%` }} className={`h-full rounded-full ${bot2AliveRef.current ? 'bg-red-500' : 'bg-slate-600'}`} />
                </div>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${teamState.bot2Shield}%` }} className="h-full bg-cyan-500 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Round Countdown */}
          <div className="flex flex-col items-center">
            <div className="hidden sm:block text-[10px] text-slate-500 font-bold tracking-widest uppercase">Round Time</div>
            <div className={`text-sm sm:text-lg font-black font-mono leading-none ${gameState.roundTimeLeft < 15 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
              {gameState.roundTimeLeft < 10 ? `0:0${gameState.roundTimeLeft}` : `0:${gameState.roundTimeLeft}`}
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleSound}
            className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          {/* Mobile chat toggle */}
          <button
            onClick={() => setShowMobileChat(v => !v)}
            className="xl:hidden p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors relative"
          >
            <Send className="w-4 h-4" />
            {chatMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full text-[7px] flex items-center justify-center font-bold text-white">
                {chatMessages.length > 9 ? '9' : chatMessages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main split layout (Game Area on left, chat on right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-0 relative flex-1 min-h-0">
        {/* Game Canvas stage (col-span-9) */}
        <div
          ref={containerRef}
          className="xl:col-span-9 relative bg-slate-900 flex items-center justify-center cursor-crosshair overflow-hidden group min-h-[200px] flex-1"
          style={{ touchAction: 'none' }}
          onMouseMove={(e) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
          }}
          onMouseDown={() => { mouseRef.current.clicked = true; }}
          onMouseUp={() => { mouseRef.current.clicked = false; }}
          onMouseLeave={() => { mouseRef.current.clicked = false; }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <canvas ref={canvasRef} className="block w-full h-full" />

          {/* ── 2v2 SPECTATOR OVERLAY ── */}
          {isSpectating && (
            <div className="absolute inset-x-0 top-0 flex flex-col items-center pointer-events-none z-20">
              {/* Top banner */}
              <div className="mt-3 px-5 py-2 bg-slate-950/90 border border-emerald-500/40 rounded-full flex items-center gap-2.5 shadow-lg shadow-emerald-900/20 backdrop-blur-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-black text-xs uppercase tracking-widest font-mono">관전 중</span>
                <span className="text-slate-400 text-[11px] font-bold">—</span>
                <span className="text-white font-black text-xs">{allyBot?.name ?? '아군'}</span>
              </div>
              {/* Subtitle */}
              <div className="mt-1.5 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                아군이 쓰러지면 라운드 패배
              </div>
            </div>
          )}

          {/* Spectator screen-edge vignette */}
          {isSpectating && (
            <div className="absolute inset-0 pointer-events-none z-10"
              style={{ boxShadow: 'inset 0 0 60px 20px rgba(34,197,94,0.12)' }} />
          )}

          {/* ── FIXED VIRTUAL JOYSTICK (mobile only) ── */}
          <div
            className="absolute xl:hidden pointer-events-none select-none"
            style={{ left: 16, bottom: 76 }}
          >
            {/* Outer ring (base) */}
            <div
              ref={joystickElemRef}
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 104,
                height: 104,
                background: joystickActive
                  ? 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(15,23,42,0.55) 100%)'
                  : 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(15,23,42,0.35) 100%)',
                border: joystickActive ? '2px solid rgba(99,102,241,0.6)' : '2px solid rgba(255,255,255,0.18)',
                boxShadow: joystickActive ? '0 0 16px rgba(99,102,241,0.25)' : 'none',
                transition: 'border 0.15s, background 0.15s',
              }}
            >
              {/* Guide cross lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div style={{ position: 'absolute', width: '100%', height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', height: '100%', width: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* Stick knob */}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: joystickActive
                    ? 'radial-gradient(circle at 35% 35%, rgba(129,140,248,0.9), rgba(99,102,241,0.7))'
                    : 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.45), rgba(255,255,255,0.2))',
                  border: joystickActive ? '2px solid rgba(165,180,252,0.8)' : '2px solid rgba(255,255,255,0.3)',
                  boxShadow: joystickActive ? '0 2px 8px rgba(99,102,241,0.4)' : '0 2px 4px rgba(0,0,0,0.3)',
                  transform: `translate(${joystickStick.x}px, ${joystickStick.y}px)`,
                  transition: joystickActive ? 'none' : 'transform 0.12s ease-out',
                  position: 'absolute',
                }}
              />
            </div>
            <div style={{ textAlign: 'center', marginTop: 4, fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: 2 }}>
              MOVE
            </div>
          </div>

          {/* ── AIM + FIRE HINT (right side, mobile only) ── */}
          <div
            className="absolute xl:hidden pointer-events-none select-none flex flex-col items-center"
            style={{ right: 20, bottom: 76 }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                border: '2px solid rgba(239,68,68,0.3)',
                background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, rgba(15,23,42,0.25) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22 }}>🎯</div>
              </div>
            </div>
            <div style={{ marginTop: 4, fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: 2 }}>
              AIM+FIRE
            </div>
          </div>

          {/* BIG OVERLAYS - SUDDEN WARMUP countdown */}
          {gameState.roundPhase === 'warmup' && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none select-none z-10">
              <div className="text-emerald-400 font-mono text-7xl font-black mb-3 scale-110 tracking-widest animate-pulse">
                {showLoadoutStore ? "⏸" : phaseTimeLeft}
              </div>
              <h1 className="text-xl font-sans font-black text-white uppercase tracking-widest">
                {showLoadoutStore ? "무기 선택 중 (Loadout Shopping)" : "Round Warmup Active"}
              </h1>
              <p className="text-slate-400 text-xs mt-1 px-4 text-center">
                {showLoadoutStore 
                  ? "원하는 무기 조합을 구성하세요. 메뉴를 닫으면 지연 웜업이 시작됩니다."
                  : "Aim with mouse rays. Press W A S D to move and SHIFT to slide."}
              </p>
              
              {!showLoadoutStore && (
                <button
                  type="button"
                  onClick={() => {
                    setShowLoadoutStore(true);
                    gameAudio.playClickSound();
                  }}
                  className="mt-6 pointer-events-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-black px-5 py-3 rounded-2xl flex items-center gap-1.5 active:scale-95 transition cursor-pointer shadow-lg animate-bounce uppercase tracking-wider"
                >
                  🛒 무기 상점 열기 [B] (Shop Weapons)
                </button>
              )}
            </div>
          )}

          {/* IN-GAME EXPLICIT WEAPONS LOADOUT MENU (BUY PHASE) */}
          {gameState.roundPhase === 'warmup' && showLoadoutStore && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-20 pointer-events-auto">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/10 px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 font-mono">전장 대기 단계 (FREEZE TIME)</span>
                      <span className="text-[10px] text-slate-500 font-mono">Press [B] to toggle shop</span>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 mt-1">
                      ⚔️ 전술 로드아웃 / 무기 상점
                    </h2>
                    <p className="text-slate-400 text-xs mt-0.5">매치 시작 전, 핫키 [1], [2], [3], [4] 슬롯에 배치할 전술 무기를 커스텀 선택하세요.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoadoutStore(false);
                      gameAudio.playClickSound();
                    }}
                    className="bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 text-slate-400 p-2 rounded-xl transition cursor-pointer text-xs font-bold"
                  >
                    닫기 ✕
                  </button>
                </div>

                {/* Slots selector grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-2 flex-grow">
                  {/* Slot 1: Primary Weapon */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hotkey [1]</span>
                        <span className="text-[8px] bg-sky-500/10 px-1.5 py-0.5 text-sky-400 rounded-full font-mono font-bold uppercase">Primary</span>
                      </div>
                      
                      <div className="mb-3 text-center py-2">
                        <span className="text-3xl">🔫</span>
                        <div className="text-xs font-bold text-white mt-1">
                          {WEAPON_TYPES[localLoadoutSlots.slot1 || 'rifle']?.name}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1 h-8 line-clamp-2 leading-tight">
                          {WEAPON_TYPES[localLoadoutSlots.slot1 || 'rifle']?.description}
                        </div>
                      </div>

                      <select
                        value={localLoadoutSlots.slot1 || 'rifle'}
                        onChange={(e) => {
                          gameAudio.playClickSound();
                          const updated = { ...localLoadoutSlots, slot1: e.target.value as WeaponType };
                          updateLoadoutSlotsInMatch(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer text-center text-slate-300"
                      >
                        {Object.entries(WEAPON_TYPES).map(([k, w]) => (
                          <option key={k} value={k}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-4 border-t border-slate-800/60 pt-2 text-[9px] text-slate-500 leading-tight">
                      기본 사격용 주무기 슬롯입니다.
                    </div>
                  </div>

                  {/* Slot 2: Secondary Weapon */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hotkey [2]</span>
                        <span className="text-[8px] bg-indigo-500/10 px-1.5 py-0.5 text-indigo-400 rounded-full font-mono font-bold uppercase">Secondary</span>
                      </div>
                      
                      <div className="mb-3 text-center py-2">
                        <span className="text-3xl">🎯</span>
                        <div className="text-xs font-bold text-white mt-1">
                          {WEAPON_TYPES[localLoadoutSlots.slot2 || 'pistol']?.name}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1 h-8 line-clamp-2 leading-tight">
                          {WEAPON_TYPES[localLoadoutSlots.slot2 || 'pistol']?.description}
                        </div>
                      </div>

                      <select
                        value={localLoadoutSlots.slot2 || 'pistol'}
                        onChange={(e) => {
                          gameAudio.playClickSound();
                          const updated = { ...localLoadoutSlots, slot2: e.target.value as WeaponType };
                          updateLoadoutSlotsInMatch(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer text-center text-slate-300"
                      >
                        {Object.entries(WEAPON_TYPES).map(([k, w]) => (
                          <option key={k} value={k}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-4 border-t border-slate-800/60 pt-2 text-[9px] text-slate-500 leading-tight">
                      비상용 보조 권총 슬롯입니다.
                    </div>
                  </div>

                  {/* Slot 3: Dash Melee */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hotkey [3]</span>
                        <span className="text-[8px] bg-pink-500/10 px-1.5 py-0.5 text-pink-400 rounded-full font-mono font-bold uppercase">Dash Melee</span>
                      </div>
                      
                      <div className="mb-3 text-center py-2">
                        <span className="text-3xl">🗡️</span>
                        <div className="text-xs font-bold text-white mt-1">
                          {WEAPON_TYPES[localLoadoutSlots.slot3 || 'katana']?.name}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1 h-8 line-clamp-2 leading-tight">
                          {WEAPON_TYPES[localLoadoutSlots.slot3 || 'katana']?.description}
                        </div>
                      </div>

                      <select
                        value={localLoadoutSlots.slot3 || 'katana'}
                        onChange={(e) => {
                          gameAudio.playClickSound();
                          const updated = { ...localLoadoutSlots, slot3: e.target.value as WeaponType };
                          updateLoadoutSlotsInMatch(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer text-center text-slate-300"
                      >
                        {Object.entries(WEAPON_TYPES).map(([k, w]) => (
                          <option key={k} value={k}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-4 border-t border-slate-800/60 pt-2 text-[9px] text-slate-500 leading-tight">
                      대쉬 고속 가속 및 보조 절단기 슬롯입니다.
                    </div>
                  </div>

                  {/* Slot 4: Explosive */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hotkey [4]</span>
                        <span className="text-[8px] bg-purple-500/10 px-1.5 py-0.5 text-purple-400 rounded-full font-mono font-bold uppercase">Explosive</span>
                      </div>
                      
                      <div className="mb-3 text-center py-2">
                        <span className="text-3xl">🧨</span>
                        <div className="text-xs font-bold text-white mt-1">
                          {WEAPON_TYPES[localLoadoutSlots.slot4 || 'rpg']?.name}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1 h-8 line-clamp-2 leading-tight">
                          {WEAPON_TYPES[localLoadoutSlots.slot4 || 'rpg']?.description}
                        </div>
                      </div>

                      <select
                        value={localLoadoutSlots.slot4 || 'rpg'}
                        onChange={(e) => {
                          gameAudio.playClickSound();
                          const updated = { ...localLoadoutSlots, slot4: e.target.value as WeaponType };
                          updateLoadoutSlotsInMatch(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer text-center text-slate-300"
                      >
                        {Object.entries(WEAPON_TYPES).map(([k, w]) => (
                          <option key={k} value={k}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-4 border-t border-slate-800/60 pt-2 text-[9px] text-slate-500 leading-tight">
                      광역 범위 폭발을 가하는 투척/발사 슬롯입니다.
                    </div>
                  </div>
                </div>

                {/* Info bar */}
                <div className="mt-4 p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center text-xs">
                  <div className="text-slate-400 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="font-bold text-amber-400">💡 전술 팁:</span>
                    <span>1~4 단축키 상자에서 자유롭게 실시간 구성하여 대시(낫)와 자동소총(M4)을 배치해보세요!</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        gameAudio.playClickSound();
                        updateLoadoutSlotsInMatch({
                          slot1: 'rifle',
                          slot2: 'pistol',
                          slot3: 'katana',
                          slot4: 'rpg',
                        });
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-lg active:scale-95 transition cursor-pointer text-[10px] uppercase font-mono"
                    >
                      기본 로드아웃 설정
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowLoadoutStore(false);
                    gameAudio.playMatchStartSound();
                  }}
                  className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-6 rounded-2xl shadow-lg active:scale-[0.99] transition text-sm cursor-pointer uppercase tracking-wider"
                >
                  승인 완료 & 매치 준비 (CONFIRM LOADOUT)
                </button>
              </div>
            </div>
          )}

          {/* ROUND END overlay */}
          {gameState.roundPhase === 'round_end' && !gameState.isGameOver && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none select-none z-10">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center shadow-2xl max-w-sm text-center">
                <Swords className="w-12 h-12 text-pink-500 mb-3 animate-bounce" />
                <h2 className="text-2xl font-sans font-black text-white">라운드 종료!</h2>
                <p className="text-slate-400 text-xs mt-1.5 px-4">
                  현재 경기 스코어는 {gameState.playerScore} : {gameState.botScore} 입니다. 경기장 및 아레나 재구성 중...
                </p>
                <div className="flex items-center gap-1 mt-4 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-full font-mono text-[10px] text-emerald-400 font-bold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>다음 경기 준비 중 (PREPARING STAGE)</span>
                </div>
              </div>
            </div>
          )}

          {/* FINAL MATCH END (MATCH OVER) OVERLAY */}
          {gameState.isGameOver && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-10">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col items-center shadow-2xl max-w-md text-center">
                <Trophy className={`w-16 h-16 ${gameState.winner === 'player' ? 'text-yellow-400' : 'text-slate-500'} mb-4`} />
                <h1 className="text-3xl font-sans font-black text-white uppercase tracking-tight">
                  {gameState.winner === 'player' ? '🏆 매치 승리!' : '☠️ 매치 패배'}
                </h1>
                <p className="text-slate-400 text-sm mt-2 px-6">
                  {gameState.winner === 'player'
                    ? `훌륭한 전투력이었습니다! 전장에서 ${bot.name}를(을) 제압하고 리전 아레나 최고 챔피언 컵을 수여받았습니다!`
                    : `아쉬운 결과입니다. 적 ${bot.name}가 막강한 화력으로 매치를 조율했습니다. 더 연마하여 돌아오십시오.`}
                </p>
                <div className="flex gap-4 items-center justify-center bg-slate-950 border border-slate-800 px-6 py-2.5 rounded-2xl mt-5">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-bold">최종 스코어</div>
                    <div className="text-2xl font-black font-mono text-white">
                      {gameState.playerScore} - {gameState.botScore}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-bold">획득한 매치 보상</div>
                    <div className="text-md font-extrabold text-emerald-400 font-mono">
                      +{gameState.winner === 'player' ? '120 골드' : '30 골드'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    gameAudio.playClickSound();
                    onQuit(gameState.playerScore, gameState.botScore, gameState.winner);
                  }}
                  className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  메인 대기실로 복귀하기
                </button>
              </div>
            </div>
          )}

          {/* SLOT-BASED WEAPON HUD BAR */}
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-slate-950/85 backdrop-blur-md p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-800/80 flex items-center gap-1 sm:gap-2 shadow-2xl select-none z-20">
            {(['1', '2', '3', '4'] as const).map((slotNum) => {
              const { wep, skin } = getSlotData(slotNum);
              const isActive = currentSlot === slotNum;
              
              return (
                <button
                  key={slotNum}
                  onClick={() => switchSlot(slotNum)}
                  className={`flex flex-col items-center justify-between px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border transition-all cursor-pointer select-none text-left min-w-[60px] sm:min-w-[105px] relative ${
                    isActive
                      ? 'bg-indigo-650/20 border-indigo-500 shadow-md scale-105'
                      : 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {/* Hotkey number badge */}
                  <span className="absolute top-0.5 right-0.5 px-1 rounded bg-slate-950/70 text-[7px] font-mono font-bold border border-slate-800/50 text-slate-400">
                    {slotNum}
                  </span>

                  <span className="hidden sm:block text-[8px] text-slate-500 font-bold uppercase leading-none mb-1">
                    {slotNum === '1' ? 'Melee' : slotNum === '2' ? 'Sec.' : `S${slotNum}`}
                  </span>

                  <div className="text-[9px] sm:text-[10px] font-black text-white truncate max-w-[50px] sm:max-w-[90px] leading-none uppercase flex items-center gap-1 mt-0.5">
                    <span style={{ color: skin.primaryColor }}>●</span>
                    <span className="hidden sm:inline">{wep.name.split(' ')[0]}</span>
                    <span className="sm:hidden">{wep.name.split(' ')[0].slice(0, 4)}</span>
                  </div>

                  {/* Small stats */}
                  <div className="mt-1.5 sm:mt-2.5 flex items-center justify-between w-full text-[8px] sm:text-[9px] font-mono font-bold leading-none">
                    {wep.type !== 'katana' ? (
                      <span className={isActive ? 'text-indigo-300' : 'text-slate-500'}>
                        {isActive ? playerCurrentAmmo : slotAmmosRef.current[slotNum]}/{wep.maxAmmo}
                      </span>
                    ) : (
                      <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-pink-500" />
                    )}
                    {isActive && (
                      <span className="hidden sm:inline text-[7.5px] text-slate-400 font-sans truncate max-w-[45px] font-normal leading-none">
                        {skin.name}
                      </span>
                    )}
                  </div>

                  {/* Individual slot reloading bar */}
                  {isActive && playerIsReloading && (
                    <div className="absolute inset-0 bg-slate-950/95 rounded-xl flex flex-col items-center justify-center gap-1 px-1 sm:px-2">
                      <span className="text-[7px] sm:text-[8px] text-emerald-400 font-extrabold uppercase animate-pulse">RELOAD</span>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${playerReloadProgress}%` }} className="h-full bg-emerald-400" />
                      </div>
                    </div>
                  )}

                  {/* Katana Dash Cooldown overlay */}
                  {wep.type === 'katana' && katanaCooldownPercent > 0 && (
                    <div className="absolute inset-0 bg-slate-950/95 rounded-xl flex flex-col items-center justify-center gap-1 px-1 sm:px-2">
                      <span className="text-[7px] sm:text-[8px] text-pink-400 font-extrabold uppercase animate-pulse">DASH</span>
                      <span className="text-[9px] sm:text-[10px] font-mono font-black text-pink-400">
                        {((3000 * (katanaCooldownPercent / 105)) / 1000).toFixed(1)}s
                      </span>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${katanaCooldownPercent}%` }} className="h-full bg-pink-500" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile chat overlay */}
        {showMobileChat && (
          <div className="xl:hidden absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
              <span className="text-xs font-bold text-indigo-400">아레나 채팅 로그</span>
              <button onClick={() => setShowMobileChat(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">✕</button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-center text-slate-600 py-6 italic">로그 없음</div>
              ) : chatMessages.map((msg) => (
                <div key={msg.id} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                  <span className={`font-semibold mr-1.5 ${msg.sender === 'SYSTEM' ? 'text-indigo-400' : msg.sender === 'You' ? 'text-blue-400' : 'text-red-400'}`}>{msg.sender}:</span>
                  <span className="text-slate-300">{msg.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={sendChatMessage} className="p-2 border-t border-slate-800 flex gap-1.5">
              <input type="text" placeholder="채팅..." value={customChatMessage} onChange={(e) => setCustomChatMessage(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
              <button type="submit" className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer"><Send className="w-3.5 h-3.5" /></button>
            </form>
          </div>
        )}

        {/* Dynamic Rivals Chat Lobby Logs (col-span-3) */}
        <div className="xl:col-span-3 hidden xl:flex flex-col bg-slate-900 border-t xl:border-t-0 xl:border-l border-slate-800">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 tracking-wider">아레나 대화 및 전투 로그</span>
            <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono font-bold uppercase">
              매치 세션
            </span>
          </div>

          {/* Scrollable messages log */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs font-sans scrollbar-thin">
            {chatMessages.length === 0 ? (
              <div className="text-center text-slate-600 py-6 italic">아직 기록된 로그가 없습니다.</div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                  <span
                    className={`font-semibold mr-1.5 ${
                      msg.sender === 'SYSTEM'
                        ? 'text-indigo-400'
                        : msg.sender === 'You'
                        ? 'text-blue-400'
                        : 'text-red-400 font-extrabold'
                    }`}
                  >
                    {msg.sender}:
                  </span>
                  <span className="text-slate-300 leading-tight break-words">{msg.text}</span>
                </div>
              ))
            )}
          </div>

          {/* Quick reply bar */}
          <form onSubmit={sendChatMessage} className="p-2 border-t border-slate-800 bg-slate-950 flex gap-1.5">
            <input
              type="text"
              placeholder="Type trash talk / gg..."
              value={customChatMessage}
              onChange={(e) => setCustomChatMessage(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
