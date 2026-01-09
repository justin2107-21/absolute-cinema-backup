import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Star, Play, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieRow } from '@/components/movies/MovieRow';
import { MovieRowSkeleton } from '@/components/movies/MovieSkeleton';
import { HeroSlider } from '@/components/home/HeroSlider';
import { Logo } from '@/components/branding/Logo';
import { Button } from '@/components/ui/button';
import { getTrendingMovies, getPopularMovies, getTopRatedMovies, getNowPlayingMovies } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const { addToWatchlist, markAsWatched, isInWatchlist, isWatched } = useWatchlist();

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: () => getTrendingMovies('week'),
  });

  const { data: popular, isLoading: popularLoading } = useQuery({
    queryKey: ['popular'],
    queryFn: () => getPopularMovies(),
  });

  const { data: topRated, isLoading: topRatedLoading } = useQuery({
    queryKey: ['topRated'],
    queryFn: () => getTopRatedMovies(),
  });

  const { data: nowPlaying, isLoading: nowPlayingLoading } = useQuery({
    queryKey: ['nowPlaying'],
    queryFn: () => getNowPlayingMovies(),
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Logo Header */}
        <header className="px-4 pt-4">
          <Logo size="md" />
        </header>

        {/* Auto-sliding Hero */}
        {trending?.results && trending.results.length > 0 ? (
          <HeroSlider 
            movies={trending.results} 
            onAddToWatchlist={addToWatchlist}
          />
        ) : (
          <div className="h-[55vh] bg-gradient-to-b from-primary/10 to-background" />
        )}

        {/* Quick Actions */}
        <section className="px-4">
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/mood')}
              className="glass-card p-4 flex items-center gap-3 text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">MoodMatch</h3>
                <p className="text-xs text-muted-foreground">AI recommendations</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/party')}
              className="glass-card p-4 flex items-center gap-3 text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cinema-blue to-cinema-green">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Watch Party</h3>
                <p className="text-xs text-muted-foreground">With friends</p>
              </div>
            </motion.button>
          </div>
        </section>

        {/* Movie Rows */}
        {trendingLoading ? <MovieRowSkeleton /> : (
          <MovieRow title="Trending Now" subtitle="What everyone's watching" icon={<TrendingUp className="h-5 w-5" />}>
            {trending?.results.slice(0, 10).map((movie) => (
              <MovieCard key={movie.id} movie={movie} onAddToWatchlist={addToWatchlist} onMarkWatched={markAsWatched}
                onClick={() => navigate(`/movie/${movie.id}`)} isInWatchlist={isInWatchlist(movie.id)} isWatched={isWatched(movie.id)} />
            ))}
          </MovieRow>
        )}

        {popularLoading ? <MovieRowSkeleton /> : (
          <MovieRow title="Popular" subtitle="Fan favorites" icon={<Star className="h-5 w-5" />}>
            {popular?.results.slice(0, 10).map((movie) => (
              <MovieCard key={movie.id} movie={movie} onAddToWatchlist={addToWatchlist} onMarkWatched={markAsWatched}
                onClick={() => navigate(`/movie/${movie.id}`)} isInWatchlist={isInWatchlist(movie.id)} isWatched={isWatched(movie.id)} />
            ))}
          </MovieRow>
        )}

        {topRatedLoading ? <MovieRowSkeleton /> : (
          <MovieRow title="Top Rated" subtitle="Critically acclaimed" icon={<Star className="h-5 w-5" />}>
            {topRated?.results.slice(0, 10).map((movie) => (
              <MovieCard key={movie.id} movie={movie} onAddToWatchlist={addToWatchlist} onMarkWatched={markAsWatched}
                onClick={() => navigate(`/movie/${movie.id}`)} isInWatchlist={isInWatchlist(movie.id)} isWatched={isWatched(movie.id)} />
            ))}
          </MovieRow>
        )}

        {nowPlayingLoading ? <MovieRowSkeleton /> : (
          <MovieRow title="In Theaters" subtitle="Now showing" icon={<Play className="h-5 w-5" />}>
            {nowPlaying?.results.slice(0, 10).map((movie) => (
              <MovieCard key={movie.id} movie={movie} onAddToWatchlist={addToWatchlist} onMarkWatched={markAsWatched}
                onClick={() => navigate(`/movie/${movie.id}`)} isInWatchlist={isInWatchlist(movie.id)} isWatched={isWatched(movie.id)} />
            ))}
          </MovieRow>
        )}
      </div>
    </AppLayout>
  );
}
