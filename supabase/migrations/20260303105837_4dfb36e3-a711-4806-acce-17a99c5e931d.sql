
-- Friend requests table
CREATE TABLE public.friend_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (sender_id, receiver_id)
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend requests"
ON public.friend_requests FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
ON public.friend_requests FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update requests they received"
ON public.friend_requests FOR UPDATE
USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own requests"
ON public.friend_requests FOR DELETE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Activity feed table
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  content_title TEXT NOT NULL,
  content_poster TEXT,
  content_id TEXT,
  content_source TEXT DEFAULT 'tmdb',
  media_type TEXT DEFAULT 'movie',
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Friends can see each other's activities
CREATE POLICY "Users can view friend activities"
ON public.user_activities FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.friend_requests
    WHERE status = 'accepted'
    AND (
      (sender_id = auth.uid() AND receiver_id = user_activities.user_id)
      OR (receiver_id = auth.uid() AND sender_id = user_activities.user_id)
    )
  )
);

CREATE POLICY "Users can create their own activities"
ON public.user_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
ON public.user_activities FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at on friend_requests
CREATE TRIGGER update_friend_requests_updated_at
BEFORE UPDATE ON public.friend_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activities;
