import { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Film, Star, TrendingUp, Flame, 
  Heart, Laugh, Sword, Ghost, 
  Rocket, Drama, Music, Baby
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Filter {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'genre' | 'category';
  value: number | string;
}

const filters: Filter[] = [
  { id: 'trending', label: 'Trending', icon: Flame, type: 'category', value: 'trending' },
  { id: 'top-rated', label: 'Top Rated', icon: Star, type: 'category', value: 'top_rated' },
  { id: 'popular', label: 'Most Watched', icon: TrendingUp, type: 'category', value: 'popular' },
  { id: 'action', label: 'Action', icon: Sword, type: 'genre', value: 28 },
  { id: 'comedy', label: 'Comedy', icon: Laugh, type: 'genre', value: 35 },
  { id: 'romance', label: 'Romance', icon: Heart, type: 'genre', value: 10749 },
  { id: 'horror', label: 'Horror', icon: Ghost, type: 'genre', value: 27 },
  { id: 'scifi', label: 'Sci-Fi', icon: Rocket, type: 'genre', value: 878 },
  { id: 'drama', label: 'Drama', icon: Drama, type: 'genre', value: 18 },
  { id: 'animation', label: 'Animation', icon: Baby, type: 'genre', value: 16 },
  { id: 'music', label: 'Musical', icon: Music, type: 'genre', value: 10402 },
];

interface SearchFiltersProps {
  selectedFilter: string | null;
  onFilterSelect: (filter: Filter | null) => void;
}

export function SearchFilters({ selectedFilter, onFilterSelect }: SearchFiltersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* All button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onFilterSelect(null)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all",
          !selectedFilter
            ? "bg-primary text-primary-foreground shadow-button"
            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
        )}
      >
        <Film className="h-4 w-4" />
        All
      </motion.button>

      {filters.map((filter) => {
        const Icon = filter.icon;
        const isSelected = selectedFilter === filter.id;

        return (
          <motion.button
            key={filter.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterSelect(isSelected ? null : filter)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all",
              isSelected
                ? "bg-primary text-primary-foreground shadow-button"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            )}
          >
            <Icon className="h-4 w-4" />
            {filter.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export { filters };
export type { Filter };
