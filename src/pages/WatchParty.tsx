import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, Link, Copy, History } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WatchPartyModal } from '@/components/watchparty/WatchPartyModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecentParty {
  id: string;
  code: string;
  movie_title: string | null;
  created_at: string;
}

export default function WatchParty() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showPartyModal, setShowPartyModal] = useState(!!roomId);
  const [joinCode, setJoinCode] = useState('');
  const [recentParties, setRecentParties] = useState<RecentParty[]>([]);

  // Load recent parties
  useEffect(() => {
    if (isAuthenticated && user) {
      loadRecentParties();
    }
  }, [isAuthenticated, user]);

  const loadRecentParties = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('watch_party_rooms')
      .select('id, code, movie_title, created_at')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) {
      setRecentParties(data);
    }
  };

  const createParty = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to create a watch party');
      navigate('/auth');
      return;
    }
    setShowPartyModal(true);
  };

  const joinParty = () => {
    if (joinCode.trim()) {
      navigate(`/party/${joinCode.toUpperCase()}`);
      setShowPartyModal(true);
    } else {
      toast.error('Please enter a room code');
    }
  };

  const rejoinParty = (code: string) => {
    navigate(`/party/${code}`);
    setShowPartyModal(true);
  };

  if (showPartyModal) {
    return (
      <WatchPartyModal 
        isOpen={true} 
        onClose={() => {
          setShowPartyModal(false);
          navigate('/party');
        }}
        movieTitle="Movie Night"
        roomCode={roomId}
      />
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 pt-4">
        {/* Header */}
        <header className="px-4 space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold flex items-center gap-2"
          >
            <Users className="h-6 w-6 text-primary" />
            Watch Party
          </motion.h1>
          <p className="text-sm text-muted-foreground">
            Watch movies together with friends in real-time
          </p>
        </header>

        {/* Create Party */}
        <section className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-4 bg-gradient-to-br from-primary/20 to-accent/10"
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Plus className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Create a Party</h3>
                <p className="text-sm text-muted-foreground">
                  Start a new watch party and invite friends
                </p>
              </div>
            </div>
            <Button className="w-full gap-2" size="lg" onClick={createParty}>
              <Users className="h-5 w-5" />
              Create Watch Party
            </Button>
          </motion.div>
        </section>

        {/* Join Party */}
        <section className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center">
                <Link className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Join a Party</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a room code to join friends
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter room code (e.g., ABC123)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && joinParty()}
                className="font-mono uppercase"
              />
              <Button onClick={joinParty}>
                Join
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="px-4 space-y-4">
          <h3 className="font-semibold">What you can do</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🎥', title: 'Video Call', desc: 'See your friends' },
              { icon: '🖥️', title: 'Screen Share', desc: 'Watch together' },
              { icon: '💬', title: 'Live Chat', desc: 'React in real-time' },
              { icon: '🎉', title: 'Reactions', desc: 'Send emojis' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass-card p-4 text-center"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h4 className="font-medium text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Parties */}
        <section className="px-4 pb-8 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Parties
          </h3>
          {recentParties.length > 0 ? (
            <div className="space-y-2">
              {recentParties.map((party) => (
                <motion.div
                  key={party.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{party.movie_title || 'Watch Party'}</p>
                    <p className="text-xs text-muted-foreground">
                      Code: {party.code} • {new Date(party.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => rejoinParty(party.code)}>
                    Rejoin
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent parties</p>
              <p className="text-xs">Create a party to get started!</p>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}