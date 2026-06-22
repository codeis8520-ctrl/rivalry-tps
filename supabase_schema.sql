-- =====================================================
-- RIVALRY TPS — Supabase 데이터베이스 스키마
-- Supabase 대시보드 > SQL Editor에 붙여넣고 실행
-- =====================================================

-- 1. player_profiles 테이블 생성
CREATE TABLE IF NOT EXISTS public.player_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  stats         JSONB NOT NULL DEFAULT '{"wins":0,"losses":0,"kills":0,"deaths":0,"headshots":0,"gold":300,"gems":10,"level":1,"xp":0,"winStreak":0,"rankedRP":100}',
  inventory     TEXT[] NOT NULL DEFAULT ARRAY['p_default','r_default','s_default','sn_default','rpg_default','kd_default','smg_default'],
  equipped_skins JSONB NOT NULL DEFAULT '{"pistol":"p_default","rifle":"r_default","smg":"smg_default","shotgun":"s_default","sniper":"sn_default","rpg":"rpg_default","katana":"kd_default"}',
  loadout_slots JSONB NOT NULL DEFAULT '{"slot1":"rifle","slot2":"pistol","slot3":"katana","slot4":"rpg"}',
  crosshair     JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 업데이트 시각 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_player_profiles_updated ON public.player_profiles;
CREATE TRIGGER on_player_profiles_updated
  BEFORE UPDATE ON public.player_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. RLS 활성화
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책
-- 자기 자신 프로필 CRUD
CREATE POLICY "own_select" ON public.player_profiles FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.player_profiles FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.player_profiles FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.player_profiles FOR DELETE  USING (auth.uid() = user_id);

-- 5. 랭킹 보드용 공개 뷰 (인벤토리/스킨/비밀 데이터 제외)
CREATE OR REPLACE VIEW public.leaderboard AS
  SELECT
    username,
    (stats->>'rankedRP')::INT   AS ranked_rp,
    (stats->>'wins')::INT        AS wins,
    (stats->>'losses')::INT      AS losses,
    (stats->>'kills')::INT       AS kills,
    (stats->>'deaths')::INT      AS deaths,
    (stats->>'headshots')::INT   AS headshots,
    (stats->>'level')::INT       AS level,
    (stats->>'winStreak')::INT   AS win_streak,
    created_at
  FROM public.player_profiles
  ORDER BY (stats->>'rankedRP')::INT DESC;

-- 6. 뷰 공개 SELECT 권한 (인증 사용자 누구나 랭킹 조회 가능)
GRANT SELECT ON public.leaderboard TO authenticated, anon;

-- =====================================================
-- Supabase Authentication 설정 (대시보드에서 수동):
-- Authentication > Providers > Email
--  → "Confirm email" 비활성화 (게임은 이메일 인증 불필요)
--  → "Secure email change" 비활성화
-- =====================================================
