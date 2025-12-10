-- Migration: Submission Gamification System
-- Creates tables for assignment submissions, reviews, groups, achievements, and leaderboard

-- Assignment Groups (for group submissions)
CREATE TABLE IF NOT EXISTS assignment_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Members
CREATE TABLE IF NOT EXISTS assignment_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES assignment_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('individual', 'group')),
  group_id UUID REFERENCES assignment_groups(id) ON DELETE SET NULL,
  
  -- Assignment Details
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  academic_level TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  formatting_style TEXT NOT NULL,
  cover_page_data JSONB NOT NULL,
  
  -- Submission Content
  assignment_content TEXT NOT NULL,
  file_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  "references" JSONB DEFAULT '[]'::JSONB,
  
  -- Metadata
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'needs_revision')),
  quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 5),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_feedback TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Credits
  credits_awarded INTEGER DEFAULT 0,
  credits_awarded_at TIMESTAMP WITH TIME ZONE,
  
  -- Training Data Flag
  can_use_for_training BOOLEAN DEFAULT false,
  used_in_training BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submission Reviews (for admin/moderator reviews)
CREATE TABLE IF NOT EXISTS submission_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Review Criteria
  content_quality INTEGER CHECK (content_quality >= 1 AND content_quality <= 5),
  formatting_compliance INTEGER CHECK (formatting_compliance >= 1 AND formatting_compliance <= 5),
  originality INTEGER CHECK (originality >= 1 AND originality <= 5),
  academic_rigor INTEGER CHECK (academic_rigor >= 1 AND academic_rigor <= 5),
  
  -- Overall
  overall_score DECIMAL(3,2),
  feedback TEXT,
  recommendation TEXT CHECK (recommendation IN ('approve', 'reject', 'needs_revision')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements/Badges
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  credits_bonus INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Leaderboard (materialized view for performance)
CREATE TABLE IF NOT EXISTS user_leaderboard (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_submissions INTEGER DEFAULT 0,
  approved_submissions INTEGER DEFAULT 0,
  total_credits_earned INTEGER DEFAULT 0,
  quality_average DECIMAL(3,2) DEFAULT 0,
  rank_position INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assignment_groups_created_by ON assignment_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON assignment_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON assignment_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON assignment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_group_id ON assignment_submissions(group_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quality_score ON assignment_submissions(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON assignment_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_training ON assignment_submissions(can_use_for_training, used_in_training, status) WHERE can_use_for_training = true AND status = 'approved';
CREATE INDEX IF NOT EXISTS idx_reviews_submission_id ON submission_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON submission_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON user_leaderboard(rank_position);

-- Enable RLS
ALTER TABLE assignment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignment_groups
CREATE POLICY "Users can view groups they belong to"
  ON assignment_groups FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM assignment_group_members
      WHERE group_id = assignment_groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups"
  ON assignment_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update groups"
  ON assignment_groups FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policies for assignment_group_members
CREATE POLICY "Users can view group members"
  ON assignment_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignment_group_members agm
      WHERE agm.group_id = assignment_group_members.group_id AND agm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group leaders can add members"
  ON assignment_group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assignment_group_members
      WHERE group_id = assignment_group_members.group_id 
      AND user_id = auth.uid() 
      AND role = 'leader'
    )
  );

-- RLS Policies for assignment_submissions
CREATE POLICY "Users can view own submissions"
  ON assignment_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view group submissions"
  ON assignment_submissions FOR SELECT
  USING (
    submission_type = 'group' AND
    EXISTS (
      SELECT 1 FROM assignment_group_members
      WHERE group_id = assignment_submissions.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create submissions"
  ON assignment_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending submissions"
  ON assignment_submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for submission_reviews (admin/moderator only - you'll need to implement role check)
CREATE POLICY "Users can view reviews of their submissions"
  ON submission_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignment_submissions
      WHERE id = submission_reviews.submission_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage reviews"
  ON submission_reviews FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage achievements"
  ON user_achievements FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_leaderboard
CREATE POLICY "Users can view leaderboard"
  ON user_leaderboard FOR SELECT
  USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assignment_groups_updated_at
  BEFORE UPDATE ON assignment_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at
  BEFORE UPDATE ON assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update leaderboard
CREATE OR REPLACE FUNCTION update_user_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  -- Update leaderboard when submission status changes to approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO user_leaderboard (user_id, total_submissions, approved_submissions, total_credits_earned, quality_average)
    SELECT 
      user_id,
      COUNT(*) as total_submissions,
      COUNT(*) FILTER (WHERE status = 'approved') as approved_submissions,
      COALESCE(SUM(credits_awarded), 0) as total_credits_earned,
      COALESCE(AVG(quality_score), 0) as quality_average
    FROM assignment_submissions
    WHERE user_id = NEW.user_id
    GROUP BY user_id
    ON CONFLICT (user_id) DO UPDATE SET
      total_submissions = EXCLUDED.total_submissions,
      approved_submissions = EXCLUDED.approved_submissions,
      total_credits_earned = EXCLUDED.total_credits_earned,
      quality_average = EXCLUDED.quality_average,
      last_updated = NOW();
    
    -- Update rank positions
    WITH ranked AS (
      SELECT 
        user_id,
        ROW_NUMBER() OVER (ORDER BY total_credits_earned DESC, quality_average DESC) as rank
      FROM user_leaderboard
    )
    UPDATE user_leaderboard
    SET rank_position = ranked.rank
    FROM ranked
    WHERE user_leaderboard.user_id = ranked.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leaderboard_on_approval
  AFTER UPDATE ON assignment_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION update_user_leaderboard();

-- Comments
COMMENT ON TABLE assignment_groups IS 'Groups for collaborative assignment submissions';
COMMENT ON TABLE assignment_group_members IS 'Members of assignment groups';
COMMENT ON TABLE assignment_submissions IS 'Student assignment submissions for gamification and training data collection';
COMMENT ON TABLE submission_reviews IS 'Admin/moderator reviews of submissions';
COMMENT ON TABLE user_achievements IS 'User achievements and badges earned through submissions';
COMMENT ON TABLE user_leaderboard IS 'Leaderboard of top contributors based on submissions and credits earned';

