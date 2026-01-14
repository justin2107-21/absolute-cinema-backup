-- Create watch party rooms table
CREATE TABLE public.watch_party_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL,
  movie_id TEXT,
  movie_title TEXT,
  movie_poster TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create watch party messages table
CREATE TABLE public.watch_party_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.watch_party_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat', -- 'chat', 'reaction', 'system'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.watch_party_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_party_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for rooms
CREATE POLICY "Anyone can view active rooms"
ON public.watch_party_rooms FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create rooms"
ON public.watch_party_rooms FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their rooms"
ON public.watch_party_rooms FOR UPDATE
TO authenticated
USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their rooms"
ON public.watch_party_rooms FOR DELETE
TO authenticated
USING (auth.uid() = host_id);

-- RLS policies for messages
CREATE POLICY "Anyone can view room messages"
ON public.watch_party_messages FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can send messages"
ON public.watch_party_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_watch_party_rooms_code ON public.watch_party_rooms(code);
CREATE INDEX idx_watch_party_messages_room_id ON public.watch_party_messages(room_id);
CREATE INDEX idx_watch_party_messages_created_at ON public.watch_party_messages(created_at);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_messages;

-- Trigger for updated_at
CREATE TRIGGER update_watch_party_rooms_updated_at
BEFORE UPDATE ON public.watch_party_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();