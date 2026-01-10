import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Logo } from '@/components/branding/Logo';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal - Centered properly */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4"
          >
            <div className="glass-card p-6 space-y-6 text-center max-w-sm w-full relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Logo */}
              <div className="flex justify-center pt-2">
                <Logo size="lg" animated />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Welcome to CinemaSync</h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to unlock your personal movie experience. Track your watchlist, 
                  connect with friends, and get AI-powered recommendations.
                </p>
              </div>

              {/* Features preview */}
              <div className="grid grid-cols-2 gap-3 text-left">
                {[
                  'Personal Watchlist',
                  'Movie Diary',
                  'Friend Activity',
                  'Watch Parties',
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button className="w-full" onClick={handleSignIn}>
                  Sign In
                </Button>
                <Button variant="outline" className="w-full" onClick={handleSignIn}>
                  Create Account
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                By signing in, you agree to our Terms of Service
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}