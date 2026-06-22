import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Crown, User, X, Swords, Target, TrendingUp, Shield } from 'lucide-react';
import { fetchLeaderboard, fetchPublicProfile, LeaderboardEntry, isSupabaseConfigured } from '../lib/gameDB';

// RP → 랭크 변환 (Lobby.tsx의 getRankFromRP와 동일)
function getRankInfo(rp: number): { name: string; emoji: string; color: string; tier: string } {
  if (rp >= 3000) return { name: 'Grand Champion', emoji: '👑', color: '#f59e0b', tier: 'grand_champion' };
  if (rp >= 2200) return { name: 'Champion', emoji: '🐉', color: '#a855f7', tier: 'champion' };
  if (rp >= 1800) return { name: 'Grandmaster', emoji: '🔮', color: '#ec4899', tier: 'grandmaster' };
  if (rp >= 1400) return { name: 'Master', emoji: '💎', color: '#06b6d4', tier: 'master' };
  if (rp >= 1000) return { name: 'Diamond', emoji: '💠', color: '#38bdf8', tier: 'diamond' };
  if (rp >= 700)  return { name: 'Platinum', emoji: '🥇', color: '#10b981', tier: 'platinum' };
  if (rp >= 450)  return { name: 'Gold', emoji: '🏅', color: '#fbbf24', tier: 'gold' };
  if (rp >= 250)  return { name: 'Silver', emoji: '🥈', color: '#94a3b8', tier: 'silver' };
  return { name: 'Bronze', emoji: '🥉', color: '#f97316', tier: 'bronze' };
}

function calcWinRate(wins: number, losses: number): string {
  if (wins + losses === 0) return '0%';
  return `${Math.round((wins / (wins + losses)) * 100)}%`;
}

function calcKD(kills: number, deaths: number): string {
  if (deaths === 0) return kills > 0 ? kills.toFixed(2) : '0.00';
  return (kills / deaths).toFixed(2);
}

// ── 프로필 모달 ──────────────────────────────────────────────────────────────
interface ProfileModalProps {
  username: string;
  currentUser: string;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ username, currentUser, onClose }) => {
  const [profile, setProfile] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicProfile(username).then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, [username]);

  const isSelf = username.toLowerCase() === currentUser.toLowerCase();
  const rank = profile ? getRankInfo(profile.ranked_rp) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-center border-b border-slate-800">
          <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-xs">프로필 로딩 중...</p>
            </div>
          ) : profile ? (
            <>
              {/* 아바타 */}
              <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl font-black"
                style={{ backgroundColor: `${rank!.color}20`, border: `2px solid ${rank!.color}60` }}>
                <span>{rank!.emoji}</span>
              </div>

              <h2 className="text-xl font-black text-white">{profile.username}</h2>
              {isSelf && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-bold">나</span>
              )}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="text-sm">{rank!.emoji}</span>
                <span className="text-sm font-black" style={{ color: rank!.color }}>{rank!.name}</span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-1">{profile.ranked_rp} RP · Lv.{profile.level}</div>
            </>
          ) : (
            <p className="text-slate-400 text-sm py-4">프로필을 불러올 수 없습니다.</p>
          )}
        </div>

        {/* 스탯 그리드 */}
        {profile && (
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { icon: <Trophy className="w-3.5 h-3.5 text-yellow-400" />, label: '승리', value: profile.wins.toLocaleString(), color: 'text-yellow-400' },
              { icon: <Shield className="w-3.5 h-3.5 text-rose-400" />, label: '패배', value: profile.losses.toLocaleString(), color: 'text-rose-400' },
              { icon: <Target className="w-3.5 h-3.5 text-emerald-400" />, label: '승률', value: calcWinRate(profile.wins, profile.losses), color: 'text-emerald-400' },
              { icon: <Swords className="w-3.5 h-3.5 text-indigo-400" />, label: 'K/D', value: calcKD(profile.kills, profile.deaths), color: 'text-indigo-400' },
              { icon: <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />, label: '킬', value: profile.kills.toLocaleString(), color: 'text-cyan-400' },
              { icon: <Target className="w-3.5 h-3.5 text-pink-400" />, label: '헤드샷', value: profile.headshots.toLocaleString(), color: 'text-pink-400' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <div className="flex items-center gap-1.5 mb-1">
                  {item.icon}
                  <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">{item.label}</span>
                </div>
                <span className={`text-base font-black ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {profile && (
          <div className="px-5 pb-5">
            <div className="text-[10px] text-slate-600 font-mono text-center">
              가입일: {new Date(profile.created_at).toLocaleDateString('ko-KR')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── 메인 랭킹 보드 ───────────────────────────────────────────────────────────
interface LeaderboardScreenProps {
  currentUser: string;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ currentUser }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const dbMode = isSupabaseConfigured();

  const load = async () => {
    setLoading(true);
    const data = await fetchLeaderboard(100);
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (!dbMode) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <Trophy className="w-12 h-12 text-slate-600" />
        <div>
          <p className="text-slate-300 font-bold">랭킹 보드는 Supabase 연결 후 사용 가능합니다</p>
          <p className="text-slate-500 text-xs mt-1">환경변수에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            글로벌 랭킹 보드
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Ranked RP 기준 정렬 · 클릭하면 프로필 확인</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-xs">순위 로딩 중...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-bold">아직 랭킹 데이터가 없습니다</p>
          <p className="text-slate-600 text-xs mt-1">랭크 게임을 플레이하면 랭킹에 등재됩니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {entries.map((entry, idx) => {
            const rank = getRankInfo(entry.ranked_rp);
            const isMe = entry.username.toLowerCase() === currentUser.toLowerCase();
            const pos = idx + 1;

            return (
              <button
                key={entry.username}
                onClick={() => setSelectedUser(entry.username)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all cursor-pointer text-left hover:scale-[1.01] active:scale-[0.99] ${
                  isMe
                    ? 'bg-indigo-500/10 border-indigo-500/40 hover:border-indigo-400/60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                }`}
              >
                {/* 순위 */}
                <div className="w-8 shrink-0 text-center">
                  {pos === 1 ? <span className="text-lg">🥇</span>
                    : pos === 2 ? <span className="text-lg">🥈</span>
                    : pos === 3 ? <span className="text-lg">🥉</span>
                    : <span className="text-sm font-black text-slate-500 font-mono">#{pos}</span>}
                </div>

                {/* 랭크 뱃지 */}
                <span className="text-xl shrink-0">{rank.emoji}</span>

                {/* 이름 + 랭크 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black truncate ${isMe ? 'text-indigo-300' : 'text-white'}`}>
                      {entry.username}
                    </span>
                    {isMe && (
                      <span className="text-[9px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0">나</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold font-mono" style={{ color: rank.color }}>{rank.name}</span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500 font-mono">Lv.{entry.level}</span>
                  </div>
                </div>

                {/* 스탯 */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-slate-500 font-mono">승률</div>
                    <div className="text-xs font-black text-emerald-400">{calcWinRate(entry.wins, entry.losses)}</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-slate-500 font-mono">K/D</div>
                    <div className="text-xs font-black text-cyan-400">{calcKD(entry.kills, entry.deaths)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-mono">RP</div>
                    <div className="text-sm font-black" style={{ color: rank.color }}>{entry.ranked_rp.toLocaleString()}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 프로필 모달 */}
      {selectedUser && (
        <ProfileModal
          username={selectedUser}
          currentUser={currentUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};
