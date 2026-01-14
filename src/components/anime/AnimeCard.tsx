import { motion } from 'framer-motion';
import { Star, Play, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AniListMedia } from '@/lib/anilist';

interface AnimeCardProps {
  anime: AniListMedia;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function AnimeCard({ anime, size = 'md', onClick }: AnimeCardProps) {
  const title = anime.title.english || anime.title.romaji;
  
  const sizeClasses = {
    sm: 'aspect-[2/3]',
    md: 'aspect-[2/3]',
    lg: 'aspect-[2/3] min-h-[280px]',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-xl cursor-pointer group",
        sizeClasses[size]
      )}
      onClick={onClick}
    >
      {/* Poster */}
      <img
        src={anime.coverImage.large}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Content type badge */}
      <div className="absolute top-2 left-2">
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          anime.type === 'ANIME' 
            ? "bg-primary/90 text-primary-foreground" 
            : "bg-accent/90 text-accent-foreground"
        )}>
          {anime.type === 'ANIME' ? (
            <span className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              Anime
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Manga
            </span>
          )}
        </span>
      </div>

      {/* Rating badge */}
      {anime.averageScore && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-lg">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-white">
            {(anime.averageScore / 10).toFixed(1)}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
        <h3 className="text-sm font-semibold text-white line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-white/70">
          {anime.type === 'ANIME' && anime.episodes && (
            <span>{anime.episodes} eps</span>
          )}
          {anime.type === 'MANGA' && anime.chapters && (
            <span>{anime.chapters} ch</span>
          )}
          {anime.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="bg-white/20 px-1.5 py-0.5 rounded">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}