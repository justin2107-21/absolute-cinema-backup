import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  onSkip: () => void;
  title: string;
  posterUrl?: string | null;
}

export function RatingModal({ isOpen, onClose, onSubmit, onSkip, title, posterUrl }: RatingModalProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = () => {
    if (selectedRating > 0) {
      onSubmit(selectedRating);
      setSelectedRating(0);
    }
  };

  const handleSkip = () => {
    setSelectedRating(0);
    onSkip();
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
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4"
          >
            <div className="glass-card p-6 space-y-5 text-center max-w-sm w-full relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              {posterUrl && (
                <div className="w-20 h-28 rounded-xl overflow-hidden mx-auto shadow-lg">
                  <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-1">
                <p className="text-2xl">🎉</p>
                <h2 className="text-lg font-bold">You finished watching!</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">{title}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Rate this title:</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setSelectedRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoverRating || selectedRating)
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  disabled={selectedRating === 0}
                  onClick={handleSubmit}
                >
                  Submit Rating
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleSkip}>
                  Skip
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
