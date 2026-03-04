import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, type DmMessage } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
  conversationId: string;
  otherUser: { user_id: string; username: string | null; avatar_url: string | null };
  onBack: () => void;
}

export function ChatWindow({ conversationId, otherUser, onBack }: ChatWindowProps) {
  const { user } = useAuth();
  const { loadMessages, sendMessage, markAsRead } = useChat();
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const msgs = await loadMessages(conversationId);
      setMessages(msgs);
      markAsRead(conversationId);
    };
    load();
  }, [conversationId, loadMessages, markAsRead]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`dm-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'dm_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as DmMessage]);
        markAsRead(conversationId);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, markAsRead]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    await sendMessage(conversationId, newMessage);
    setNewMessage('');
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[70vh]">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src={otherUser.avatar_url || undefined} />
          <AvatarFallback>{otherUser.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-sm">{otherUser.username || 'User'}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            Start the conversation! Say hello 👋
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                isMine 
                  ? 'bg-primary text-primary-foreground rounded-br-md' 
                  : 'bg-secondary text-foreground rounded-bl-md'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value.slice(0, 2000))}
          placeholder="Type a message..."
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          maxLength={2000}
        />
        <Button size="icon" onClick={handleSend} disabled={!newMessage.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
