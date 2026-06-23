import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Coins, Gem, TrendingUp, X, Sparkles } from 'lucide-react';
import { gameAudio } from '../audio';

export interface GiftNotification {
  gold: number;
  gems: number;
  rp: number;
  skinName?: string;
}

interface Props {
  notification: GiftNotification | null;
  onDismiss: () => void;
}

export const GiftReceivedOverlay: React.FC<Props> = ({ notification, onDismiss }) => {
  useEffect(() => {
    if (!notification) return;
    gameAudio.playCrateUnlockSound('legendary');
    const timer = setTimeout(onDismiss, 7000);
    return () => clearTimeout(timer);
  }, [notification]);

  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key="gift-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        >
          {/* 배경 어둡게 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black pointer-events-auto"
            onClick={onDismiss}
          />

          {/* 파티클 */}
          {particles.map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 3 === 0 ? '#facc15' : i % 3 === 1 ? '#a855f7' : '#22d3ee',
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              initial={{ scale: 0, opacity: 1, y: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
                y: [0, -(60 + Math.random() * 120)],
                x: [(Math.random() - 0.5) * 80],
              }}
              transition={{ duration: 1.5 + Math.random(), delay: Math.random() * 0.8, ease: 'easeOut' }}
            />
          ))}

          {/* 메인 카드 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative z-10 pointer-events-auto w-full max-w-sm mx-4"
          >
            {/* 글로우 테두리 */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-yellow-400 via-purple-500 to-cyan-400 opacity-80 blur-sm" />
            <div className="relative rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden">
              {/* 상단 헤더 */}
              <div className="relative bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-cyan-500/20 px-5 pt-5 pb-4 text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -6, 6, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/40 mb-3"
                >
                  <Gift className="w-7 h-7 text-slate-900" />
                </motion.div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400">소버린 프로토콜</p>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <h2 className="text-lg font-black text-white">어드민 선물 도착!</h2>
                <p className="text-xs text-slate-400 mt-0.5">관리자가 보상을 지급했습니다</p>
              </div>

              {/* 보상 목록 */}
              <div className="px-5 py-4 space-y-2.5">
                {notification.gold > 0 && (
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                      <Coins className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">골드</p>
                      <p className="text-base font-black text-yellow-400">+{notification.gold.toLocaleString()}</p>
                    </div>
                  </motion.div>
                )}
                {notification.gems > 0 && (
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Gem className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">젬</p>
                      <p className="text-base font-black text-purple-400">+{notification.gems.toLocaleString()}</p>
                    </div>
                  </motion.div>
                )}
                {notification.rp > 0 && (
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">ELO RP</p>
                      <p className="text-base font-black text-cyan-400">+{notification.rp.toLocaleString()}</p>
                    </div>
                  </motion.div>
                )}
                {notification.skinName && (
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">스킨</p>
                      <p className="text-sm font-black text-rose-400">{notification.skinName}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 닫기 버튼 */}
              <div className="px-5 pb-5">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={onDismiss}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  확인
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
