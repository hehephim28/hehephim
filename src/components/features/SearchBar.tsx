import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { Button, Input, Badge, Modal, ModalContent } from '../ui';
import type { MovieFilters, Category, Country } from '../../types/movie';
import { debounce } from '../../utils/helpers';
import { cn } from '../../utils/cn';

export interface SearchBarProps {
  className?: string;
  placeholder?: string;
  initialQuery?: string;
  initialFilters?: MovieFilters;
  onSearch?: (query: string, filters: MovieFilters) => void;
  showAdvancedFilters?: boolean;
  categories?: Category[];
  countries?: Country[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  className,
  placeholder = 'Tìm kiếm phim...',
  initialQuery = '',
  initialFilters = {},
  onSearch,
  showAdvancedFilters = true,
  categories = [],
  countries = [],
}) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<MovieFilters>(initialFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Debounced search
  const debouncedSearch = debounce((searchQuery: string, searchFilters: MovieFilters) => {
    if (onSearch) {
      onSearch(searchQuery, searchFilters);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set('keyword', query.trim());
      
      // Add filters to URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, value.toString());
        }
      });
      
      router.push(`/tim-kiem?${searchParams.toString()}`);
    }
  };

  const updateFilter = (key: keyof MovieFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  };

  const movieTypes = [
    { value: 'phim-bo', label: 'Phim bộ' },
    { value: 'phim-le', label: 'Phim lẻ' },
    { value: 'tv-shows', label: 'TV Shows' },
    { value: 'hoat-hinh', label: 'Hoạt hình' },
  ];

  const languages = [
    { value: 'vietsub', label: 'Vietsub' },
    { value: 'thuyet-minh', label: 'Thuyết minh' },
    { value: 'long-tieng', label: 'Lồng tiếng' },
  ];

  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className={cn('w-full', className)}>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
            variant="search"
          />
        </div>

        {showAdvancedFilters && (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setIsFilterModalOpen(true)}
            leftIcon={<Filter className="w-5 h-5" />}
            className="relative"
          >
            Lọc
            {getActiveFiltersCount() > 0 && (
              <Badge
                size="sm"
                variant="primary"
                className="absolute -top-2 -right-2 min-w-[20px] h-5 text-xs"
              >
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        )}

        <Button type="submit" variant="primary" size="md">
          Tìm kiếm
        </Button>
      </form>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.type && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Loại: {movieTypes.find(t => t.value === filters.type)?.label}</span>
              <button
                onClick={() => updateFilter('type', undefined)}
                className="ml-1 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.category && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Thể loại: {categories.find(c => c.slug === filters.category)?.name}</span>
              <button
                onClick={() => updateFilter('category', undefined)}
                className="ml-1 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.country && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Quốc gia: {countries.find(c => c.slug === filters.country)?.name}</span>
              <button
                onClick={() => updateFilter('country', undefined)}
                className="ml-1 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.year && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Năm: {filters.year}</span>
              <button
                onClick={() => updateFilter('year', undefined)}
                className="ml-1 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.language && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Ngôn ngữ: {languages.find(l => l.value === filters.language)?.label}</span>
              <button
                onClick={() => updateFilter('language', undefined)}
                className="ml-1 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-slate-400 hover:text-white"
          >
            Xóa tất cả
          </Button>
        </div>
      )}

      {/* Advanced Filters Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Bộ lọc nâng cao"
        size="lg"
      >
        <ModalContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Movie Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Loại phim
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => updateFilter('type', e.target.value || undefined)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tất cả</option>
                {movieTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Thể loại
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => updateFilter('category', e.target.value || undefined)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tất cả</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Quốc gia
              </label>
              <select
                value={filters.country || ''}
                onChange={(e) => updateFilter('country', e.target.value || undefined)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tất cả</option>
                {countries.map((country) => (
                  <option key={country.slug} value={country.slug}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Năm phát hành
              </label>
              <select
                value={filters.year || ''}
                onChange={(e) => updateFilter('year', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tất cả</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Ngôn ngữ
              </label>
              <select
                value={filters.language || ''}
                onChange={(e) => updateFilter('language', e.target.value || undefined)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tất cả</option>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <Button
              variant="secondary"
              onClick={clearFilters}
            >
              Xóa bộ lọc
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsFilterModalOpen(false)}
            >
              Áp dụng
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
};

export { SearchBar };
