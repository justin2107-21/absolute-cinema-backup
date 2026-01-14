import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  ScreenShare, 
  PhoneOff,
  Smile,
  Users,
  Link,
  MessageCircle,
  Send,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useWatchParty, type WatchPartyMessage } from '@/hooks/useWatchParty';
import { useAuth } from '@/contexts/AuthContext';

interface WatchPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle?: string;
  movieId?: string;
  moviePoster?: string;
  roomCode?: string;
}

export function WatchPartyModal({ 
  isOpen, 
  onClose, 
  movieTitle,
  movieId,
  moviePoster,
  roomCode: initialRoomCode
}: WatchPartyModalProps) {
  const { isAuthenticated } = useAuth();
  const {
    room,
    messages,
    participants,
    isConnected,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendReaction,
    isHost,
  } = useWatchParty(initialRoomCode);

  const [isMuted, setIsMuted] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reactionIdRef = useRef(0);

  const roomUrl = room ? `https://absolutecinema.app/party/${room.code}` : '';
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'];

  // Auto-create room on mount if authenticated and no room code
  useEffect(() => {
    if (isOpen && isAuthenticated && !initialRoomCode && !room) {
      createRoom(movieTitle, movieId, moviePoster);
    }
  }, [isOpen, isAuthenticated, initialRoomCode]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle incoming reactions
  useEffect(() => {
    const reactionMessages = messages.filter(m => m.message_type === 'reaction');
    const lastReaction = reactionMessages[reactionMessages.length - 1];
    
    if (lastReaction) {
      const newReaction = {
        id: reactionIdRef.current++,
        emoji: lastReaction.content,
        x: Math.random() * 80 + 10,
      };
      setFloatingReactions(prev => [...prev, newReaction]);
      
      // Remove after animation
      setTimeout(() => {
        setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
      }, 3000);
    }
  }, [messages.length]);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomUrl);
    toast.success('Room link copied!');
  };

  const handleSendReaction = (emoji: string) => {
    sendReaction(emoji);
    setShowReactions(false);
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      sendMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    onClose();
    toast.info('You left the watch party');
  };

  if (!isAuthenticated) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background flex items-center justify-center"
          >
            <div className="text-center space-y-4 p-8">
              <Users className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-bold">Sign in to Join</h2>
              <p className="text-muted-foreground">
                You need to be signed in to create or join a watch party.
              </p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Floating Reactions */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
            {floatingReactions.map((reaction) => (
              <motion.div
                key={reaction.id}
                initial={{ y: '100vh', opacity: 1 }}
                animate={{ y: '-20vh', opacity: 0 }}
                transition={{ duration: 3, ease: 'easeOut' }}
                className="absolute text-4xl"
                style={{ left: `${reaction.x}%` }}
              >
                {reaction.emoji}
              </motion.div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold flex items-center gap-2">
                    Watch Party
                    {isConnected && (
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {room?.movie_title || movieTitle || 'No movie selected'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex h-full pt-20 pb-24">
            {/* Participants sidebar */}
            <div className="w-64 border-r border-border p-4 space-y-4 hidden md:block">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Participants ({participants.length})
              </h3>
              <div className="space-y-2">
                {participants.map((p) => (
                  <div 
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                      {p.username[0]?.toUpperCase()}
                    </div>
                    <span className="flex-1 text-sm truncate">{p.username}</span>
                    {p.isHost && <Crown className="h-4 w-4 text-yellow-500" />}
                    {p.isMuted && <MicOff className="h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </div>

              {/* Share link */}
              {room && (
                <div className="pt-4 border-t border-border space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Invite Friends
                  </h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        value={room.code} 
                        readOnly 
                        className="text-center font-mono font-bold"
                      />
                      <Button size="icon" variant="secondary" onClick={copyRoomLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Share this code with friends
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
              <div className="w-full max-w-4xl aspect-video bg-secondary/30 rounded-2xl border border-border overflow-hidden relative">
                {/* Placeholder for video content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="h-20 w-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                      <ScreenShare className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Ready to Watch</h3>
                      <p className="text-sm text-muted-foreground">
                        Share your screen to start watching together
                      </p>
                    </div>
                  </div>
                </div>

                {/* Participant videos grid (overlay) */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {participants.slice(0, 3).map((p) => (
                    <div 
                      key={p.id}
                      className="h-20 w-28 rounded-lg bg-card border border-border flex items-center justify-center relative"
                    >
                      <span className="text-xl font-bold text-muted-foreground">
                        {p.username[0]?.toUpperCase()}
                      </span>
                      {p.isHost && (
                        <Crown className="absolute top-1 right-1 h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile share link */}
              {room && (
                <div className="mt-4 md:hidden w-full max-w-md">
                  <div className="glass-card p-3 flex items-center gap-2">
                    <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-mono font-bold flex-1">{room.code}</span>
                    <Button size="sm" variant="secondary" onClick={copyRoomLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Chat sidebar */}
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="border-l border-border overflow-hidden flex flex-col"
                >
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">Live Chat</h3>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages
                        .filter(m => m.message_type === 'chat')
                        .map((msg) => (
                          <div key={msg.id} className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-medium text-primary">
                                {msg.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button size="icon" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
            <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
              {/* Mic toggle */}
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              {/* Video toggle */}
              <Button
                variant={!hasVideo ? "destructive" : "secondary"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setHasVideo(!hasVideo)}
              >
                {hasVideo ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>

              {/* Screen share */}
              <Button
                variant={isSharing ? "default" : "secondary"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setIsSharing(!isSharing)}
              >
                <ScreenShare className="h-5 w-5" />
              </Button>

              {/* Reactions */}
              <div className="relative">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setShowReactions(!showReactions)}
                >
                  <Smile className="h-5 w-5" />
                </Button>

                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-xl bg-card border border-border shadow-lg"
                    >
                      <div className="flex gap-1">
                        {reactions.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleSendReaction(emoji)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors text-xl"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat toggle */}
              <Button
                variant={showChat ? "default" : "secondary"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>

              {/* Leave */}
              <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleLeaveRoom}
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}