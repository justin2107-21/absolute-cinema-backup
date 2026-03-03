import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FriendProfile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender_profile?: FriendProfile;
  receiver_profile?: FriendProfile;
}

export interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  content_title: string;
  content_poster: string | null;
  content_id: string | null;
  content_source: string | null;
  media_type: string | null;
  rating: number | null;
  created_at: string;
  username?: string;
  avatar_url?: string | null;
}

export function useFriends() {
  const { user, isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    
    // Get accepted friend requests
    const { data: requests } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (!requests) { setFriends([]); return; }

    const friendIds = requests.map(r => r.sender_id === user.id ? r.receiver_id : r.sender_id);
    
    if (friendIds.length === 0) { setFriends([]); return; }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', friendIds);

    setFriends(profiles || []);
  }, [user]);

  const loadPendingRequests = useCallback(async () => {
    if (!user) return;

    const { data: requests } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('status', 'pending');

    if (!requests) { setPendingRequests([]); return; }

    // Load sender profiles
    const senderIds = requests.map(r => r.sender_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', senderIds);

    const enriched = requests.map(r => ({
      ...r,
      sender_profile: profiles?.find(p => p.user_id === r.sender_id) as FriendProfile | undefined,
    }));

    setPendingRequests(enriched);
  }, [user]);

  const loadActivities = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!data) { setActivities([]); return; }

    // Get unique user IDs for profiles
    const userIds = [...new Set(data.map(a => a.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', userIds);

    const enriched: ActivityItem[] = data.map(a => ({
      ...a,
      username: profiles?.find(p => p.user_id === a.user_id)?.username || 'User',
      avatar_url: profiles?.find(p => p.user_id === a.user_id)?.avatar_url,
    }));

    setActivities(enriched);
  }, [user]);

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('friend_requests')
      .insert({ sender_id: user.id, receiver_id: receiverId });

    if (error) {
      if (error.code === '23505') toast.error('Friend request already sent');
      else toast.error('Failed to send request');
      return;
    }

    toast.success('Friend request sent!');
  };

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) { toast.error('Failed to accept request'); return; }

    toast.success('Friend request accepted!');
    loadFriends();
    loadPendingRequests();
  };

  const declineRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'declined' })
      .eq('id', requestId);

    if (error) { toast.error('Failed to decline request'); return; }

    toast.info('Request declined');
    loadPendingRequests();
  };

  const removeFriend = async (friendUserId: string) => {
    if (!user) return;

    await supabase
      .from('friend_requests')
      .delete()
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendUserId}),and(sender_id.eq.${friendUserId},receiver_id.eq.${user.id})`);

    toast.info('Friend removed');
    loadFriends();
  };

  const postActivity = async (
    activityType: string,
    contentTitle: string,
    contentPoster?: string | null,
    contentId?: string,
    contentSource?: string,
    mediaType?: string,
    rating?: number
  ) => {
    if (!user) return;

    await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        content_title: contentTitle,
        content_poster: contentPoster || null,
        content_id: contentId || null,
        content_source: contentSource || 'tmdb',
        media_type: mediaType || 'movie',
        rating: rating || null,
      });
  };

  const searchUsers = async (query: string): Promise<FriendProfile[]> => {
    if (!query.trim() || !user) return [];

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user.id)
      .ilike('username', `%${query}%`)
      .limit(20);

    return (data || []) as FriendProfile[];
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      await Promise.all([loadFriends(), loadPendingRequests(), loadActivities()]);
      setIsLoading(false);
    };

    load();
  }, [isAuthenticated, loadFriends, loadPendingRequests, loadActivities]);

  return {
    friends,
    pendingRequests,
    activities,
    isLoading,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    postActivity,
    searchUsers,
    refreshActivities: loadActivities,
    refreshFriends: loadFriends,
  };
}
