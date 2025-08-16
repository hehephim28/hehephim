import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, History, TrendingUp, X, Filter } from 'lucide-react';
import { Button, Input } from '../ui';
import { cn } from '../../utils/cn';
import { useSearchSuggestions, useSearchHistory, usePopularSearches } from '../../hooks/useSearch';
import { EnhancedSearchSuggestions, type SuggestionData } from './EnhancedSearchSuggestions';
import type { Movie } from '../../types/movie';

export interface EnhancedSearchBarProps {
  className?: string;
  placeholder?: string;
  initialValue?: string;
  onSearch?: (query: string) => void;
  showFilters?: boolean;
  showImages?: boolean;
  large?: boolean;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  className,
  placeholder = 'Tìm kiếm phim, diễn viên, đạo diễn...',
  initialValue = '',
  onSearch,
  showFilters = false,
  showImages = true,
  large = false
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get search data
  const { data: suggestions } = useSearchSuggestions(searchQuery, 8);
  const { history: searchHistory, addToHistory, removeFromHistory } = useSearchHistory();
  const { data: popularSearches } = usePopularSearches();

  // Update input when initialValue changes
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

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
      
      if (onSearch) {
        onSearch(trimmedQuery);
      } else {
        router.push(`/tim-kiem?keyword=${encodeURIComponent(trimmedQuery)}`);
      }
      
      setShowSuggestions(false);
      setIsInputFocused(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleSuggestionClick = (suggestion: string | Movie) => {
    if (typeof suggestion === 'string') {
      setSearchQuery(suggestion);
      handleSearch(suggestion);
    } else {
      // Direct navigation to movie page
      router.push(`/phim/${suggestion.slug}`);
      setShowSuggestions(false);
      setIsInputFocused(false);
    }
  };

  const handleHistoryRemove = (query: string) => {
    removeFromHistory(query);
  };

  const clearInput = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Get display suggestions
  const getDisplayData = (): SuggestionData | null => {
    if (searchQuery.trim() && suggestions?.items?.length > 0) {
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
          className={cn(
            searchQuery ? "pr-20" : "pr-12", // More padding when clear button is shown
            large ? "py-4 text-lg bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-red-500" : "",
            "w-full"
          )}
        />
        
        {/* Clear button */}
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearInput}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {/* Search button */}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className={cn(
            "absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700",
            large ? "px-4 py-2" : "p-2"
          )}
        >
          <Search className={cn(large ? "w-5 h-5" : "w-4 h-4")} />
        </Button>
      </form>

      {/* Filters Button */}
      {showFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-16 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-700 rounded-full"
        >
          <Filter className="w-4 h-4" />
        </Button>
      )}

      {/* Enhanced Suggestions Dropdown */}
      {showSuggestions && displayData && displayData.items.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <EnhancedSearchSuggestions
            data={displayData}
            onSuggestionClick={handleSuggestionClick}
            onHistoryRemove={handleHistoryRemove}
            showImages={showImages}
          />
        </div>
      )}
    </div>
  );
};
