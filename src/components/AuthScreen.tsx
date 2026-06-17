import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Eye, EyeOff, Trophy, ShieldAlert, Check, Play, UserPlus, LogIn } from 'lucide-react';
import { gameAudio } from '../audio';

interface AuthScreenProps {
  onLogin: (username: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Helper validation matching Roblox style limits
  const validateForm = () => {
    if (!username.trim() || username.length < 3) {
      setErrorMsg('사용자 이름은 최소 3자 이상이어야 합니다.');
      gameAudio.playCrateRollSound(); // Play feedback tick
      return false;
    }
    // Alphanumeric validation
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(username)) {
      setErrorMsg('사용자 이름은 영문, 숫자, 언더바(_)만 가능합니다.');
      gameAudio.playCrateRollSound();
      return false;
    }

    if (!password || password.length < 4) {
      setErrorMsg('비밀번호는 최소 4자 이상이어야 합니다.');
      gameAudio.playCrateRollSound();
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      gameAudio.playCrateRollSound();
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setLoading(true);
    gameAudio.playClickSound();

    setTimeout(() => {
      try {
        const storedAccountsJson = localStorage.getItem('rivals_users_database');
        const accounts = storedAccountsJson ? JSON.parse(storedAccountsJson) : {};

        const cleanUsername = username.trim().toLowerCase();

        if (isLogin) {
          // --- LOGIN PROCESS ---
          if (!accounts[cleanUsername]) {
            setErrorMsg('존재하지 않는 사용자 이름입니다.');
            gameAudio.playCrateRollSound();
            setLoading(false);
            return;
          }

          if (accounts[cleanUsername].password !== password) {
            setErrorMsg('비밀번호가 일치하지 않습니다.');
            gameAudio.playCrateRollSound();
            setLoading(false);
            return;
          }

          setSuccessMsg('로그인 성공! 전장으로 진입합니다...');
          setTimeout(() => {
            onLogin(username.trim());
          }, 1200);

        } else {
          // --- REGISTER PROCESS ---
          if (accounts[cleanUsername]) {
            setErrorMsg('이미 존재하는 사용자 이름입니다. 다른 이름을 사용하세요.');
            gameAudio.playCrateRollSound();
            setLoading(false);
            return;
          }

          // Register new account
          accounts[cleanUsername] = {
            password: password,
            displayName: username.trim(),
            createdAt: new Date().toISOString(),
          };

          // Commit to Local Database list
          localStorage.setItem('rivals_users_database', JSON.stringify(accounts));

          setSuccessMsg('회원가입이 완료되었습니다! 로그인 상태로 접속합니다...');
          
          // Initialize empty profile states in localStorage as well for this user specifically
          const baseUserStats = {
            wins: 0,
            losses: 0,
            kills: 0,
            deaths: 0,
            headshots: 0,
            gold: 300,
            gems: 10,
            level: 1,
            xp: 0,
            winStreak: 0,
            rankedRP: 100,
          };
          localStorage.setItem(`rivals_user_${cleanUsername}_stats`, JSON.stringify(baseUserStats));

          setTimeout(() => {
            onLogin(username.trim());
          }, 1200);
        }
      } catch (err) {
        setErrorMsg('시스템 오류가 발생했습니다. 다시 시도해주세요.');
        setLoading(false);
      }
    }, 800);
  };

  const toggleTab = () => {
    gameAudio.playClickSound();
    setIsLogin(!isLogin);
    setErrorMsg('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
      {/* Visual background ambient gradient glow */}
      <div className={`absolute -top-10 inset-x-0 h-40 blur-3xl opacity-20 transition-all duration-500 pointer-events-none ${
        isLogin ? 'bg-indigo-500' : 'bg-rose-500'
      }`} />

      {/* Header section with Trophy logo */}
      <div className="flex flex-col items-center text-center space-y-4 relative mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
          isLogin 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-505/20' 
            : 'bg-gradient-to-br from-rose-500 to-orange-500 shadow-rose-550/20'
        }`}>
          <Trophy className="w-7 h-7 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-sans font-black text-2xl tracking-tight uppercase text-white flex items-center gap-1.5 justify-center">
            RIVAL DUELS <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold uppercase font-mono tracking-normal leading-normal">Web Sandbox</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">로블록스 라이벌 스타일의 1v1 아레나에 입장하세요</p>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800/80 mb-6 relative">
        <button
          onClick={() => { if (!isLogin) toggleTab(); }}
          className={`py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
            isLogin 
              ? 'bg-gradient-to-r from-indigo-505 to-indigo-600 text-white shadow' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          disabled={loading}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>로그인</span>
        </button>
        <button
          onClick={() => { if (isLogin) toggleTab(); }}
          className={`py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
            !isLogin 
              ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          disabled={loading}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>회원가입</span>
        </button>
      </div>

      {/* Error and Success Banners */}
      <AnimatePresence mode="wait">
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-start gap-2.5 text-xs font-medium"
          >
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-start gap-2.5 text-xs font-medium"
          >
            <Check className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Username Input Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block text-left">
            사용자 이름 (아이디)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="영문, 숫자만 (최소 3자)"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              disabled={loading}
              maxLength={15}
              className={`w-full bg-slate-950 text-white pl-10 pr-4 py-3 text-sm rounded-xl border font-sans font-bold placeholder:text-slate-600 transition-all focus:outline-none ${
                isLogin
                  ? 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
                  : 'border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
              }`}
            />
          </div>
        </div>

        {/* Password Input Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block text-left">
            비밀번호
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="최소 4자 이상"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              disabled={loading}
              maxLength={20}
              className={`w-full bg-slate-950 text-white pl-10 pr-12 py-3 text-sm rounded-xl border font-sans font-bold placeholder:text-slate-600 transition-all focus:outline-none ${
                isLogin
                  ? 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
                  : 'border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Password Confirmation for Registration */}
        <AnimatePresence>
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="space-y-1.5"
            >
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block text-left">
                비밀번호 확인
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호 동일하게 입력"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  disabled={loading}
                  maxLength={20}
                  className="w-full bg-slate-950 text-white pl-10 pr-12 py-3 text-sm rounded-xl border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 font-sans font-bold placeholder:text-slate-600 transition-all focus:outline-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Actions */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 font-sans font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2 font-mono ${
            isLogin
              ? 'bg-gradient-to-r from-indigo-550 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-indigo-650/15'
              : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-rose-650/15'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isLogin ? '로그인 및 전장 진입' : '회원가입 완료 및 로그인'}</span>
            </>
          )}
        </button>

      </form>

      {/* Footer hint */}
      <div className="text-center mt-6 text-[10px] text-slate-500 font-medium">
        <p>계정 데이터는 현재 브라우저의 안전한 로컬 저장소(LocalStorage)에</p>
        <p className="mt-0.5">사용자별로 완벽히 분할되어 영구 저장됩니다.</p>
      </div>

    </div>
  );
};
