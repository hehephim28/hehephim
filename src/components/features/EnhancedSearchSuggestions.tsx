import React from 'react';
import Link from 'next/link';
import { Search, Clock, TrendingUp, X, Star, Calendar, Film } from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../utils/cn';
import { decodeHtmlEntities } from '../../utils/helpers';
import type { Movie } from '../../types/movie';

export interface SuggestionData {
  title: string;
  items: Movie[] | string[];
  icon: React.ComponentType<any>;
  showRemove?: boolean;
  type: 'movies' | 'text';
}

interface EnhancedSearchSuggestionsProps {
  data: SuggestionData;
  onSuggestionClick: (suggestion: string | Movie) => void;
  onHistoryRemove?: (query: string) => void;
  className?: string;
  showImages?: boolean;
}

export const EnhancedSearchSuggestions: React.FC<EnhancedSearchSuggestionsProps> = ({
  data,
  onSuggestionClick,
  onHistoryRemove,
  className,
  showImages = true
}) => {
  const { title, items, icon: Icon, showRemove, type } = data;

  const renderMovieSuggestion = (movie: Movie, index: number) => (
    <div
      key={movie._id || index}
      className="group flex items-center gap-3 p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors"
      onClick={() => onSuggestionClick(movie)}
    >
      {/* Movie Poster */}
      {showImages && (
        <div className="flex-shrink-0 w-12 h-16 bg-slate-700 rounded overflow-hidden">
          {movie.poster_url ? (
            <img
              src={movie.poster_url.startsWith('http') 
                ? movie.poster_url 
                : `https://phimimg.com/${movie.poster_url}`
              }
              alt={movie.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-6 h-6 text-slate-500" />
            </div>
          )}
        </div>
      )}

      {/* Movie Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate mb-1">
          {decodeHtmlEntities(movie.name)}
        </h4>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {movie.year && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{movie.year}</span>
            </div>
          )}
          {movie.quality && (
            <span className="px-1.5 py-0.5 bg-red-600/20 text-red-400 rounded text-[10px] font-medium">
              {movie.quality}
            </span>
          )}
          {movie.lang && (
            <span className="px-1.5 py-0.5 bg-blue-600/20 text-blue-400 rounded text-[10px] font-medium">
              {movie.lang}
            </span>
          )}
        </div>
        {movie.origin_name && movie.origin_name !== movie.name && (
          <p className="text-xs text-slate-500 truncate mt-1">
            {decodeHtmlEntities(movie.origin_name)}
          </p>
        )}
      </div>

      {/* Movie Rating (if available) */}
      {movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 && (
        <div className="flex items-center gap-1 text-xs text-yellow-400">
          <Star className="w-3 h-3 fill-current" />
          <span>{movie.tmdb.vote_average.toFixed(1)}</span>
        </div>
      )}
    </div>
  );

  const renderTextSuggestion = (item: string, index: number) => (
    <div
      key={index}
      className="group flex items-center justify-between p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors"
      onClick={() => onSuggestionClick(item)}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {showRemove ? (
          <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
        ) : (
          <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
        )}
        <span className="text-sm text-white truncate">
          {item}
        </span>
      </div>
      
      {showRemove && onHistoryRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onHistoryRemove(item);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded transition-opacity flex-shrink-0 ml-2"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );

  return (
    <div className={cn(
      "bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl max-h-96 overflow-hidden",
      className
    )}>
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">
            {title}
          </span>
          <span className="text-xs text-slate-500">
            ({items.length})
          </span>
        </div>
        
        {/* Suggestions List */}
        <div className={cn(
          "space-y-1 max-h-80 overflow-y-auto",
          // Custom scrollbar styles
          "[&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-track]:bg-slate-700/30",
          "[&::-webkit-scrollbar-thumb]:bg-slate-600/60",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb:hover]:bg-slate-500/80",
          // Firefox scrollbar
          "scrollbar-thin scrollbar-track-slate-700/30 scrollbar-thumb-slate-600/60"
        )}>
          {type === 'movies'
            ? (items as Movie[]).map(renderMovieSuggestion)
            : (items as string[]).map(renderTextSuggestion)
          }
        </div>
      </div>
    </div>
  );
};
