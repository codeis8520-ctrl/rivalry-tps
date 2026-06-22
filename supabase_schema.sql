-- =====================================================
-- RIVALRY TPS — Supabase 스키마 (이메일 없는 커스텀 인증)
-- Supabase 대시보드 > SQL Editor에 붙여넣고 실행
-- =====================================================

-- 기존 테이블 초기화 (재설치 시)
DROP VIEW IF EXISTS public.leaderboard;
DROP TABLE IF EXISTS public.player_profiles;
DROP TABLE IF EXISTS public.game_users;

-- 1. 커스텀 인증 테이블 (이메일 없음, 아이디+비밀번호 해시만)
CREATE TABLE public.game_users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username     TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.game_users ENABLE ROW LEVEL SECURITY;
-- anon(비로그인)이 회원가입(INSERT)과 로그인 확인(SELECT) 가능
CREATE POLICY "anon_signup" ON public.game_users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_login"  ON public.game_users FOR SELECT TO anon USING (true);

-- 2. 플레이어 게임 데이터 테이블
CREATE TABLE public.player_profiles (
  username      TEXT PRIMARY KEY REFERENCES public.game_users(username) ON DELETE CASCADE,
  stats         JSONB NOT NULL DEFAULT '{"wins":0,"losses":0,"kills":0,"deaths":0,"headshots":0,"gold":300,"gems":10,"level":1,"xp":0,"winStreak":0,"rankedRP":100}',
  inventory     TEXT[] NOT NULL DEFAULT ARRAY['p_default','r_default','s_default','sn_default','rpg_default','kd_default','smg_default'],
  equipped_skins JSONB NOT NULL DEFAULT '{"pistol":"p_default","rifle":"r_default","smg":"smg_default","shotgun":"s_default","sniper":"sn_default","rpg":"rpg_default","katana":"kd_default"}',
  loadout_slots JSONB NOT NULL DEFAULT '{"slot1":"rifle","slot2":"pistol","slot3":"katana","slot4":"rpg"}',
  crosshair     JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
-- 게임 데이터는 anon이 자유롭게 읽기/쓰기 (이메일 없는 인증 구조상 필요)
CREATE POLICY "open_read"  ON public.player_profiles FOR SELECT TO anon USING (true);
CREATE POLICY "open_write" ON public.player_profiles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "open_update" ON public.player_profiles FOR UPDATE TO anon USING (true);

-- 3. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_player_profiles_updated
  BEFORE UPDATE ON public.player_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. 랭킹 보드 뷰 (공개 스탯만 노출)
CREATE OR REPLACE VIEW public.leaderboard AS
  SELECT
    username,
    (stats->>'rankedRP')::INT  AS ranked_rp,
    (stats->>'wins')::INT      AS wins,
    (stats->>'losses')::INT    AS losses,
    (stats->>'kills')::INT     AS kills,
    (stats->>'deaths')::INT    AS deaths,
    (stats->>'headshots')::INT AS headshots,
    (stats->>'level')::INT     AS level,
    (stats->>'winStreak')::INT AS win_streak,
    created_at
  FROM public.player_profiles
  ORDER BY (stats->>'rankedRP')::INT DESC;

GRANT SELECT ON public.leaderboard TO anon, authenticated;
