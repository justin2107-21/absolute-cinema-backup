import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, UserPlus, UserCheck, UserX, Activity, Star, Bookmark, Eye, MessageCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends, type FriendProfile } from '@/hooks/useFriends';
import { useChat } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';

type Tab = 'activity' | 'friends' | 'requests' | 'messages';

export default function Friends() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { friends, pendingRequests, activities, sendFriendRequest, acceptRequest, declineRequest, searchUsers } = useFriends();
  const { conversations, getOrCreateConversation, totalUnread } = useChat();
  const [activeTab, setActiveTab] = useState<Tab>(searchParams.get('chat') ? 'messages' : 'activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeChat, setActiveChat] = useState<{ id: string; user: { user_id: string; username: string | null; avatar_url: string | null } } | null>(() => {
    const chatId = searchParams.get('chat');
    const userId = searchParams.get('user');
    if (chatId && userId) {
      return { id: chatId, user: { user_id: userId, username: null, avatar_url: null } };
    }
    return null;
  });

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    const results = await searchUsers(q);
    setSearchResults(results);
    setIsSearching(false);
  };

  const openChat = async (friend: FriendProfile) => {
    const convoId = await getOrCreateConversation(friend.user_id);
    if (convoId) {
      setActiveChat({ id: convoId, user: { user_id: friend.user_id, username: friend.username, avatar_url: friend.avatar_url } });
      setActiveTab('messages');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'watchlist_add': return <Bookmark className="h-4 w-4 text-primary" />;
      case 'watched': return <Eye className="h-4 w-4 text-green-400" />;
      case 'rated': return <Star className="h-4 w-4 fill-accent text-accent" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityText = (type: string, title: string, rating?: number | null) => {
    switch (type) {
      case 'watchlist_add': return <>added <span className="font-medium text-foreground">{title}</span> to Watchlist</>;
      case 'watched': return <>watched <span className="font-medium text-foreground">{title}</span></>;
      case 'rated': return <>rated <span className="font-medium text-foreground">{title}</span> {'⭐'.repeat(rating || 0)}</>;
      default: return <>{title}</>;
    }
  };

  const getContentPath = (activity: typeof activities[0]) => {
    if (activity.content_source === 'anilist') return `/anime/${activity.content_id}`;
    if (activity.media_type === 'tv') return `/tv/${activity.content_id}`;
    return `/movie/${activity.content_id}`;
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="space-y-6 pt-4">
          <header className="px-4">
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> Friends
            </motion.h1>
          </header>
          <section className="px-4">
            <div className="glass-card p-8 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mx-auto">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Sign in to connect</h3>
              <p className="text-sm text-muted-foreground">
                Sign in to add friends, see what they're watching, and share your movie journey.
              </p>
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            </div>
          </section>
        </div>
      </AppLayout>
    );
  }

  // Active chat view
  if (activeChat) {
    return (
      <AppLayout>
        <div className="pt-4 px-4">
          <ChatWindow
            conversationId={activeChat.id}
            otherUser={activeChat.user}
            onBack={() => setActiveChat(null)}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 pt-4">
        <header className="px-4">
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Friends
          </motion.h1>
        </header>

        {/* Tabs */}
        <div className="px-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'activity' as Tab, label: 'Activity', count: 0 },
            { id: 'friends' as Tab, label: 'Friends', count: friends.length },
            { id: 'messages' as Tab, label: 'Chat', count: totalUnread },
            { id: 'requests' as Tab, label: 'Requests', count: pendingRequests.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  tab.id === 'messages' && activeTab !== 'messages' ? 'bg-destructive text-destructive-foreground' : 'bg-background/20'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Activity Feed */}
          {activeTab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-3 pb-8">
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No activity yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Activity from you and your friends will appear here</p>
                </div>
              ) : (
                activities.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex gap-3 p-3 rounded-xl bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => activity.content_id && navigate(getContentPath(activity))}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={activity.avatar_url || undefined} />
                      <AvatarFallback>{activity.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">{activity.user_id === user?.id ? 'You' : activity.username}</span>{' '}
                        {getActivityText(activity.activity_type, activity.content_title, activity.rating)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {activity.content_poster && (
                      <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <img src={activity.content_poster} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Friends List */}
          {activeTab === 'friends' && (
            <motion.div key="friends" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-4 pb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="text" placeholder="Search users by username..." value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)} className="pl-12" />
              </div>

              {searchQuery.trim().length >= 2 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Search Results</p>
                  {isSearching ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">No users found</div>
                  ) : (
                    searchResults.map(profile => (
                      <div key={profile.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback>{profile.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <span className="flex-1 font-medium text-sm">{profile.username || 'User'}</span>
                        <Button size="sm" variant="outline" onClick={() => sendFriendRequest(profile.user_id)}>
                          <UserPlus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {friends.length === 0 && !searchQuery ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No friends yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Search for users above to send friend requests</p>
                </div>
              ) : (
                !searchQuery && friends.map(friend => (
                  <div key={friend.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                    <button onClick={() => navigate(`/user/${friend.user_id}`)} className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.avatar_url || undefined} />
                        <AvatarFallback>{friend.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm truncate">{friend.username || 'User'}</span>
                    </button>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => openChat(friend)}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <UserCheck className="h-5 w-5 text-green-400" />
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* Messages */}
          {activeTab === 'messages' && (
            <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-3 pb-8">
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No conversations yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Start chatting with a friend from the Friends tab</p>
                </div>
              ) : (
                conversations.map(convo => (
                  <button
                    key={convo.id}
                    onClick={() => setActiveChat({ id: convo.id, user: convo.other_user || { user_id: '', username: null, avatar_url: null } })}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={convo.other_user?.avatar_url || undefined} />
                        <AvatarFallback>{convo.other_user?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      {(convo.unread_count || 0) > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
                          <span className="text-[10px] font-bold text-destructive-foreground">{convo.unread_count}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{convo.other_user?.username || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{convo.last_message || 'No messages yet'}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true })}
                    </span>
                  </button>
                ))
              )}
            </motion.div>
          )}

          {/* Requests */}
          {activeTab === 'requests' && (
            <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 space-y-3 pb-8">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No pending requests</p>
                  <p className="text-sm text-muted-foreground mt-1">Friend requests you receive will appear here</p>
                </div>
              ) : (
                pendingRequests.map(request => (
                  <div key={request.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.sender_profile?.avatar_url || undefined} />
                      <AvatarFallback>{request.sender_profile?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{request.sender_profile?.username || 'User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptRequest(request.id)}>
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => declineRequest(request.id)}>
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
