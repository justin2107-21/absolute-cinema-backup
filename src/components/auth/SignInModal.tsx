import { useState } from 'react';
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
  const [showTerms, setShowTerms] = useState(false);

  const handleSignIn = () => {
    onClose();
    navigate('/auth?mode=login&returnTo=/profile');
  };

  const handleCreateAccount = () => {
    onClose();
    navigate('/auth?mode=signup&returnTo=/profile');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => { setShowTerms(false); onClose(); }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4"
          >
            <div className="glass-card p-6 space-y-6 text-center max-w-sm w-full relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => { setShowTerms(false); onClose(); }}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              <AnimatePresence mode="wait">
                {showTerms ? (
                  <motion.div key="terms" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-left space-y-4">
                    <h2 className="text-lg font-bold text-center">Terms of Service</h2>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Last updated: March 2026</p>
                      <p>Welcome to Absolute Cinema. By using our application, you agree to the following terms:</p>
                      <h4 className="font-semibold text-foreground">1. Acceptance of Terms</h4>
                      <p>By accessing or using Absolute Cinema, you agree to be bound by these Terms of Service and all applicable laws.</p>
                      <h4 className="font-semibold text-foreground">2. User Accounts</h4>
                      <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
                      <h4 className="font-semibold text-foreground">3. User Content</h4>
                      <p>You retain ownership of content you post. By posting, you grant us a non-exclusive license to display it.</p>
                      <h4 className="font-semibold text-foreground">4. Prohibited Conduct</h4>
                      <p>Users may not: post illegal content, harass others, spam, or violate intellectual property rights.</p>
                      <h4 className="font-semibold text-foreground">5. Third-Party Services</h4>
                      <p>We use TMDB and AniList APIs for media data. We are not responsible for third-party availability.</p>
                      <h4 className="font-semibold text-foreground">6. Limitation of Liability</h4>
                      <p>Absolute Cinema is provided "as is" without warranties.</p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setShowTerms(false)}>Back</Button>
                  </motion.div>
                ) : (
                  <motion.div key="main" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <div className="flex justify-center pt-2">
                      <Logo size="lg" animated />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl font-bold">Welcome to Absolute Cinema</h2>
                      <p className="text-sm text-muted-foreground">
                        Sign in to unlock your personal movie experience. Track your watchlist,
                        connect with friends, and get AI-powered recommendations.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left">
                      {['Personal Watchlist', 'Movie Diary', 'Friend Activity', 'AI Recommendations'].map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full" onClick={handleSignIn}>Sign In</Button>
                      <Button variant="outline" className="w-full" onClick={handleCreateAccount}>Create Account</Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      By signing in, you agree to our{' '}
                      <button
                        onClick={() => setShowTerms(true)}
                        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                      >
                        Terms of Service
                      </button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
