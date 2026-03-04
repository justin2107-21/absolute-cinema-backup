
-- Add bio to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

-- DM conversations
CREATE TABLE public.dm_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id uuid NOT NULL,
  participant2_id uuid NOT NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant1_id, participant2_id)
);

ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their dm conversations" ON public.dm_conversations
FOR SELECT TO authenticated
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create dm conversations" ON public.dm_conversations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can update dm conversations" ON public.dm_conversations
FOR UPDATE TO authenticated
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- DM messages
CREATE TABLE public.dm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.dm_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view dm messages" ON public.dm_messages
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.dm_conversations 
  WHERE id = dm_messages.conversation_id 
  AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
));

CREATE POLICY "Users can send dm messages" ON public.dm_messages
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.dm_conversations 
    WHERE id = dm_messages.conversation_id 
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  )
);

CREATE POLICY "Users can update own dm messages" ON public.dm_messages
FOR UPDATE TO authenticated
USING (auth.uid() = sender_id);

-- Enable realtime for DM
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages;

-- Blocked users
CREATE TABLE public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their blocks" ON public.blocked_users
FOR SELECT TO authenticated USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block users" ON public.blocked_users
FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock users" ON public.blocked_users
FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

-- User reports
CREATE TABLE public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.user_reports
FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.user_reports
FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

-- Add reaction_type to comment_likes
ALTER TABLE public.comment_likes ADD COLUMN IF NOT EXISTS reaction_type text DEFAULT 'like';

-- Add is_edited to comments  
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false;

-- Validate DM message length
CREATE OR REPLACE FUNCTION public.validate_dm_message()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF length(NEW.content) < 1 OR length(NEW.content) > 2000 THEN
    RAISE EXCEPTION 'Message must be between 1 and 2000 characters';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_dm_message_trigger
BEFORE INSERT OR UPDATE ON public.dm_messages
FOR EACH ROW EXECUTE FUNCTION public.validate_dm_message();
