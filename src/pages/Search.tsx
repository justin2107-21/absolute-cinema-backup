import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search as SearchIcon, X, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MovieCard } from '@/components/movies/MovieCard';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchFilters, type Filter } from '@/components/search/SearchFilters';
import { searchMovies, getPopularMovies, getTrendingMovies, getTopRatedMovies, getMoviesByGenre } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';

export default function Search() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, selectedFilter, setSelectedFilter } = useSearch();
  const { addToWatchlist, markAsWatched, isInWatchlist, isWatched } = useWatchlist();

  // Get filter-based results
  const { data: filterResults, isLoading: isFilterLoading } = useQuery({
    queryKey: ['filter', selectedFilter],
    queryFn: async () => {
      if (!selectedFilter) return null;
      
      // Find the filter config
      const filterConfigs: Record<string, { type: string; value: string | number }> = {
        'trending': { type: 'category', value: 'trending' },
        'top-rated': { type: 'category', value: 'top_rated' },
        'popular': { type: 'category', value: 'popular' },
        'action': { type: 'genre', value: 28 },
        'comedy': { type: 'genre', value: 35 },
        'romance': { type: 'genre', value: 10749 },
        'horror': { type: 'genre', value: 27 },
        'scifi': { type: 'genre', value: 878 },
        'drama': { type: 'genre', value: 18 },
        'animation': { type: 'genre', value: 16 },
        'music': { type: 'genre', value: 10402 },
      };

      const config = filterConfigs[selectedFilter];
      if (!config) return null;

      if (config.type === 'category') {
        if (config.value === 'trending') return getTrendingMovies();
        if (config.value === 'top_rated') return getTopRatedMovies();
        if (config.value === 'popular') return getPopularMovies();
      } else if (config.type === 'genre') {
        return getMoviesByGenre(config.value as number);
      }
      return null;
    },
    enabled: !!selectedFilter && !searchQuery,
  });

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => searchMovies(searchQuery),
    enabled: searchQuery.length > 2,
  });

  const { data: popular } = useQuery({
    queryKey: ['popular-default'],
    queryFn: () => getPopularMovies(),
    enabled: !selectedFilter && searchQuery.length <= 2,
  });

  // Determine which movies to display
  const getDisplayMovies = useCallback(() => {
    if (searchQuery.length > 2) {
      return searchResults?.results || [];
    }
    if (selectedFilter && filterResults) {
      return filterResults.results || [];
    }
    return popular?.results || [];
  }, [searchQuery, selectedFilter, searchResults, filterResults, popular]);

  const movies = getDisplayMovies();
  const isLoading = isSearching || isFilterLoading;

  const handleFilterSelect = (filter: Filter | null) => {
    setSelectedFilter(filter?.id || null);
    if (filter) {
      setSearchQuery(''); // Clear search when filter is selected
    }
  };

  const getTitle = () => {
    if (searchQuery.length > 2) {
      return `Results for "${searchQuery}"`;
    }
    if (selectedFilter) {
      const filterLabels: Record<string, string> = {
        'trending': 'Trending Movies',
        'top-rated': 'Top Rated Movies',
        'popular': 'Most Watched',
        'action': 'Action Movies',
        'comedy': 'Comedy Movies',
        'romance': 'Romance Movies',
        'horror': 'Horror Movies',
        'scifi': 'Sci-Fi Movies',
        'drama': 'Drama Movies',
        'animation': 'Animation Movies',
        'music': 'Musical Movies',
      };
      return filterLabels[selectedFilter] || 'Movies';
    }
    return undefined;
  };

  return (
    <AppLayout>
      <div className="space-y-6 pt-4">
        {/* Header */}
        <header className="px-4 space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold"
          >
            Search Movies
          </motion.h1>

          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filters */}
          <SearchFilters 
            selectedFilter={selectedFilter} 
            onFilterSelect={handleFilterSelect}
          />
        </header>

        {/* Results */}
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          )}

          {!isLoading && movies && movies.length > 0 && (
            <MovieGrid title={getTitle()}>
              {movies.slice(0, 18).map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MovieCard
                    movie={movie}
                    size="sm"
                    onAddToWatchlist={addToWatchlist}
                    onMarkWatched={markAsWatched}
                    onClick={() => navigate(`/movie/${movie.id}`)}
                    isInWatchlist={isInWatchlist(movie.id)}
                    isWatched={isWatched(movie.id)}
                  />
                </motion.div>
              ))}
            </MovieGrid>
          )}

          {!isLoading && searchQuery.length > 2 && searchResults?.results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No movies found</h3>
              <p className="text-sm text-muted-foreground">
                Try a different search term
              </p>
            </motion.div>
          )}

          {/* Popular section when not searching */}
          {!selectedFilter && searchQuery.length <= 2 && (
            <div className="px-4 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Popular Movies</h2>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}