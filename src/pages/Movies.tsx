import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LayoutGrid, X, TrendingUp, Star, Play, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieRow } from '@/components/movies/MovieRow';
import { MovieRowSkeleton } from '@/components/movies/MovieSkeleton';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/hooks/useWatchlist';
import { getDiversifiedHomeContent } from '@/lib/tmdb';

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function Movies() {
  const navigate = useNavigate();
  const { addToWatchlist, markAsWatched, isInWatchlist, isWatched } = useWatchlist();
  const [showCategories, setShowCategories] = useState(false);

  const { data: homeContent, isLoading } = useQuery({
    queryKey: ['movies-content'],
    queryFn: getDiversifiedHomeContent,
    staleTime: 1000 * 60 * 5,
  });

  const handleCategorySelect = (genreId: number, genreName: string) => {
    setShowCategories(false);
    navigate(`/search?genre=${genreId}&genreName=${genreName}&type=movie`);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header with back button */}
        <header className="px-4 pt-3 pb-2 flex items-center gap-3 border-b border-border/30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Movies</h1>
        </header>

        {/* Categories Button */}
        <section className="px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCategories(true)}
            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border-border/50"
          >
            <LayoutGrid className="h-4 w-4" />
            Categories
          </Button>
        </section>

        {/* Categories Modal */}
        <AnimatePresence>
          {showCategories && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
              onClick={() => setShowCategories(false)}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-10"
              >
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <h3 className="font-semibold text-foreground">Movie Categories</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCategories(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="max-h-80 overflow-y-auto p-2">
                  {GENRES.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => handleCategorySelect(genre.id, genre.name)}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors text-foreground/90 hover:text-foreground"
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Movie Rows - Netflix style */}
        {isLoading ? (
          <>
            <MovieRowSkeleton />
            <MovieRowSkeleton />
            <MovieRowSkeleton />
            <MovieRowSkeleton />
          </>
        ) : (
          <>
            <MovieRow title="Trending Movies" subtitle="What everyone's watching" icon={<TrendingUp className="h-5 w-5" />}>
              {homeContent?.trending.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onAddToWatchlist={addToWatchlist} 
                  onMarkWatched={markAsWatched}
                  onClick={() => navigate(`/movie/${movie.id}`)} 
                  isInWatchlist={isInWatchlist(movie.id)} 
                  isWatched={isWatched(movie.id)} 
                />
              ))}
            </MovieRow>

            <MovieRow title="Popular Movies" subtitle="Fan favorites" icon={<Star className="h-5 w-5" />}>
              {homeContent?.popular.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onAddToWatchlist={addToWatchlist} 
                  onMarkWatched={markAsWatched}
                  onClick={() => navigate(`/movie/${movie.id}`)} 
                  isInWatchlist={isInWatchlist(movie.id)} 
                  isWatched={isWatched(movie.id)} 
                />
              ))}
            </MovieRow>

            <MovieRow title="Top Rated Movies" subtitle="Critically acclaimed" icon={<Star className="h-5 w-5" />}>
              {homeContent?.topRated.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onAddToWatchlist={addToWatchlist} 
                  onMarkWatched={markAsWatched}
                  onClick={() => navigate(`/movie/${movie.id}`)} 
                  isInWatchlist={isInWatchlist(movie.id)} 
                  isWatched={isWatched(movie.id)} 
                />
              ))}
            </MovieRow>

            <MovieRow title="In Theaters" subtitle="Now showing" icon={<Play className="h-5 w-5" />}>
              {homeContent?.nowPlaying.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onAddToWatchlist={addToWatchlist} 
                  onMarkWatched={markAsWatched}
                  onClick={() => navigate(`/movie/${movie.id}`)} 
                  isInWatchlist={isInWatchlist(movie.id)} 
                  isWatched={isWatched(movie.id)} 
                />
              ))}
            </MovieRow>

            <MovieRow title="Coming Soon" subtitle="Mark your calendar" icon={<Calendar className="h-5 w-5" />}>
              {homeContent?.upcoming.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onAddToWatchlist={addToWatchlist} 
                  onMarkWatched={markAsWatched}
                  onClick={() => navigate(`/movie/${movie.id}`)} 
                  isInWatchlist={isInWatchlist(movie.id)} 
                  isWatched={isWatched(movie.id)} 
                />
              ))}
            </MovieRow>
          </>
        )}
      </div>
    </AppLayout>
  );
}
