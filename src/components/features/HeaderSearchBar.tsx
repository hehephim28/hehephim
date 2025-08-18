import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, History, TrendingUp, X, Clock } from 'lucide-react';
import { Button, Input } from '../ui';
import { cn } from '../../utils/cn';
import { useSearchSuggestions, useSearchHistory, usePopularSearches } from '../../hooks/useSearch';
import { EnhancedSearchSuggestions, type SuggestionData } from './EnhancedSearchSuggestions';
import type { Movie } from '../../types/movie';

export interface HeaderSearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({
  className,
  placeholder = 'Tìm kiếm phim...',
  onSearch,
  autoFocus = false
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get search data
  const { data: suggestions } = useSearchSuggestions(searchQuery, 6);
  const { history: searchHistory, addToHistory, removeFromHistory } = useSearchHistory();
  const { data: popularSearches } = usePopularSearches();

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsInputFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim() || isInputFocused) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    setShowSuggestions(true);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const trimmedQuery = query.trim();
      addToHistory(trimmedQuery);
      router.push(`/tim-kiem?keyword=${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setIsInputFocused(false);
      
      if (onSearch) {
        onSearch(trimmedQuery);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleSuggestionClick = (suggestion: string | Movie) => {
    if (typeof suggestion === 'string') {
      handleSearch(suggestion);
    } else {
      // Direct navigation to movie page
      router.push(`/phim/${suggestion.slug}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setIsInputFocused(false);
    }
  };

  const handleHistoryRemove = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    removeFromHistory(query);
  };

  const clearInput = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Get display suggestions
  const getDisplayData = (): SuggestionData | null => {
    if (searchQuery.trim() && suggestions?.items && suggestions.items.length > 0) {
      return {
        title: 'Phim gợi ý',
        items: suggestions.items,
        icon: Search,
        type: 'movies'
      };
    } else if (!searchQuery.trim() && searchHistory.length > 0) {
      return {
        title: 'Tìm kiếm gần đây',
        items: searchHistory.slice(0, 6),
        icon: History,
        showRemove: true,
        type: 'text'
      };
    } else if (!searchQuery.trim() && popularSearches && popularSearches.length > 0) {
      return {
        title: 'Tìm kiếm phổ biến',
        items: popularSearches.slice(0, 6),
        icon: TrendingUp,
        type: 'text'
      };
    }
    return null;
  };

  const displayData = getDisplayData();

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          variant="search"
          autoFocus={autoFocus}
          className={cn("pr-8", className?.includes('w-full') ? 'w-full' : 'w-80')}
        />

        {/* Clear button */}
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearInput}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </form>

      {/* Enhanced Suggestions Dropdown */}
      {showSuggestions && displayData && displayData.items.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50">
          <EnhancedSearchSuggestions
            data={displayData}
            onSuggestionClick={handleSuggestionClick}
            onHistoryRemove={(query) => removeFromHistory(query)}
            showImages={true} // Show images like search page
          />
        </div>
      )}
    </div>
  );
};
