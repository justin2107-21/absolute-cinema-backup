import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WatchPartyRoom {
  id: string;
  code: string;
  host_id: string;
  movie_id: string | null;
  movie_title: string | null;
  movie_poster: string | null;
  is_active: boolean;
  created_at: string;
}

export interface WatchPartyMessage {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  content: string;
  message_type: 'chat' | 'reaction' | 'system';
  created_at: string;
}

export interface PartyParticipant {
  id: string;
  username: string;
  isMuted: boolean;
  hasVideo: boolean;
  isHost: boolean;
}

export function useWatchParty(roomCode?: string) {
  const { user, isAuthenticated } = useAuth();
  const [room, setRoom] = useState<WatchPartyRoom | null>(null);
  const [messages, setMessages] = useState<WatchPartyMessage[]>([]);
  const [participants, setParticipants] = useState<PartyParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Generate a random room code
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Create a new room
  const createRoom = async (movieTitle?: string, movieId?: string, moviePoster?: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to create a watch party');
      return null;
    }

    const code = generateRoomCode();
    
    const { data, error } = await supabase
      .from('watch_party_rooms')
      .insert({
        code,
        host_id: user.id,
        movie_title: movieTitle,
        movie_id: movieId,
        movie_poster: moviePoster,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create watch party');
      return null;
    }

    setRoom(data);
    return data;
  };

  // Join a room by code
  const joinRoom = async (code: string) => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('watch_party_rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Error joining room:', error);
      toast.error('Room not found or inactive');
      setIsLoading(false);
      return null;
    }

    setRoom(data);
    setIsLoading(false);
    return data;
  };

  // Leave/close room
  const leaveRoom = async () => {
    if (room && user && room.host_id === user.id) {
      // Host closes the room
      await supabase
        .from('watch_party_rooms')
        .update({ is_active: false })
        .eq('id', room.id);
    }
    
    setRoom(null);
    setMessages([]);
    setParticipants([]);
    setIsConnected(false);
  };

  // Send a chat message
  const sendMessage = async (content: string, messageType: 'chat' | 'reaction' | 'system' = 'chat') => {
    if (!room || !user) return;

    const username = user.email?.split('@')[0] || 'Anonymous';

    const { error } = await supabase
      .from('watch_party_messages')
      .insert({
        room_id: room.id,
        user_id: user.id,
        username,
        content,
        message_type: messageType,
      });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  // Send a reaction
  const sendReaction = (emoji: string) => {
    sendMessage(emoji, 'reaction');
  };

  // Load messages for a room
  const loadMessages = async (roomId: string) => {
    const { data, error } = await supabase
      .from('watch_party_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data as WatchPartyMessage[]);
  };

  // Subscribe to real-time messages
  useEffect(() => {
    if (!room) return;

    loadMessages(room.id);

    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'watch_party_messages',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          const newMessage = payload.new as WatchPartyMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id]);

  // Set up presence for participants
  useEffect(() => {
    if (!room || !user) return;

    const username = user.email?.split('@')[0] || 'Anonymous';
    const presenceChannel = supabase.channel(`presence:${room.id}`);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const participantsList: PartyParticipant[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            participantsList.push({
              id: presence.user_id,
              username: presence.username,
              isMuted: presence.isMuted || false,
              hasVideo: presence.hasVideo || false,
              isHost: presence.user_id === room.host_id,
            });
          });
        });
        
        setParticipants(participantsList);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        if (newPresences.length > 0 && newPresences[0].user_id !== user.id) {
          toast.info(`${newPresences[0].username} joined the party!`);
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        if (leftPresences.length > 0) {
          toast.info(`${leftPresences[0].username} left the party`);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            username,
            isMuted: false,
            hasVideo: true,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [room?.id, user?.id]);

  // Auto-join room if code is provided
  useEffect(() => {
    if (roomCode && !room) {
      joinRoom(roomCode);
    }
  }, [roomCode]);

  return {
    room,
    messages,
    participants,
    isLoading,
    isConnected,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendReaction,
    generateRoomCode,
    isHost: room?.host_id === user?.id,
  };
}