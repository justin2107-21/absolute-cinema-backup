import { useState } from 'react';
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
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  hasVideo: boolean;
}

interface WatchPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle?: string;
}

export function WatchPartyModal({ isOpen, onClose, movieTitle }: WatchPartyModalProps) {
  const [roomUrl] = useState(`https://absolutecinema.app/party/${Math.random().toString(36).substr(2, 9)}`);
  const [isMuted, setIsMuted] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  
  const [participants] = useState<Participant[]>([
    { id: '1', name: 'You', isMuted: false, hasVideo: true },
    { id: '2', name: 'Friend 1', isMuted: true, hasVideo: false },
    { id: '3', name: 'Friend 2', isMuted: false, hasVideo: true },
  ]);

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'];

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomUrl);
    toast.success('Room link copied to clipboard!');
  };

  const sendReaction = (emoji: string) => {
    toast(emoji, { duration: 1000 });
    setShowReactions(false);
  };

  const leaveRoom = () => {
    onClose();
    toast.info('You left the watch party');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold">Watch Party</h2>
                  <p className="text-xs text-muted-foreground">
                    {movieTitle || 'No movie selected'}
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
                      {p.name[0]}
                    </div>
                    <span className="flex-1 text-sm truncate">{p.name}</span>
                    {p.isMuted && <MicOff className="h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </div>

              {/* Share link */}
              <div className="pt-4 border-t border-border space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Invite Friends
                </h3>
                <div className="flex gap-2">
                  <Input 
                    value={roomUrl} 
                    readOnly 
                    className="text-xs"
                  />
                  <Button size="icon" variant="secondary" onClick={copyRoomLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Video area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
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
                      className="h-20 w-28 rounded-lg bg-card border border-border flex items-center justify-center"
                    >
                      <span className="text-xl font-bold text-muted-foreground">
                        {p.name[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile share link */}
              <div className="mt-4 md:hidden w-full max-w-md">
                <div className="glass-card p-3 flex items-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs truncate flex-1">{roomUrl}</span>
                  <Button size="sm" variant="secondary" onClick={copyRoomLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
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
                            onClick={() => sendReaction(emoji)}
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

              {/* Chat (placeholder) */}
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>

              {/* Leave */}
              <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={leaveRoom}
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
