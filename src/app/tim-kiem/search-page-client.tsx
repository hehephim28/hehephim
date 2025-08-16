'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, ChevronUp, ChevronDown, X } from 'lucide-react';

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MovieGrid } from '@/components/features/MovieGrid';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { EnhancedSearchBar } from '@/components/features/EnhancedSearchBar';
import { useSearch } from '@/hooks/useSearch';
import { useMetadata } from '@/hooks/useMetadata';
import { debounce } from '@/utils/helpers';
import type { SearchParams, SortField, SortType } from '@/types/movie';

interface SearchPageClientProps {
  initialSearchParams: { [key: string]: string | string[] | undefined };
}

export const SearchPageClient: React.FC<SearchPageClientProps> = ({
  initialSearchParams
}) => {
  const router = useRouter();

  // Extract URL parameters
  const keyword = (initialSearchParams.keyword as string) || '';
  const currentPage = parseInt((initialSearchParams.page as string) || '1');
  const sortField = ((initialSearchParams.sort_field as string) || 'year') as SortField;
  const sortType = ((initialSearchParams.sort_type as string) || 'desc') as SortType;
  const selectedType = (initialSearchParams.type_list as string) || '';
  const selectedCategory = (initialSearchParams.category as string) || '';
  const selectedCountry = (initialSearchParams.country as string) || '';
  const selectedYear = (initialSearchParams.year as string) || '';
  const selectedLanguage = (initialSearchParams.sort_lang as string) || '';

  // Local state
  const [searchQuery, setSearchQuery] = useState(keyword);
  const [showFilters, setShowFilters] = useState(false);

  // Get metadata for filters
  const { genres: genresData, countries: countriesData } = useMetadata();

  // Build search parameters
  const searchRequestParams: SearchParams = useMemo(() => ({
    keyword,
    page: currentPage,
    sort_field: sortField,
    sort_type: sortType,
    limit: 24,
    ...(selectedType && { type_list: selectedType }),
    ...(selectedCategory && { category: selectedCategory }),
    ...(selectedCountry && { country: selectedCountry }),
    ...(selectedYear && { year: parseInt(selectedYear) }),
    ...(selectedLanguage && { sort_lang: selectedLanguage }),
  }), [keyword, currentPage, sortField, sortType, selectedType, selectedCategory, selectedCountry, selectedYear, selectedLanguage]);

  // Search query
  const { data: searchData, isLoading, error } = useSearch(searchRequestParams);

  // Debounced search input handler
  const debouncedUpdateQuery = useMemo(
    () => debounce((query: string) => {
      if (query.trim()) {
        updateSearchParams({ keyword: query.trim(), page: 1 });
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery !== keyword) {
      debouncedUpdateQuery(searchQuery);
    }
  }, [searchQuery, keyword, debouncedUpdateQuery]);

  // Update URL search parameters
  const updateSearchParams = (newParams: Partial<SearchParams>) => {
    const url = new URL(window.location.href);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value.toString());
      } else {
        url.searchParams.delete(key);
      }
    });

    router.push(url.toString());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      updateSearchParams({ keyword: searchQuery.trim(), page: 1 });
    }
  };

  const handleEnhancedSearch = (query: string) => {
    if (query.trim()) {
      updateSearchParams({ keyword: query.trim(), page: 1 });
      setSearchQuery(query.trim());
    }
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  const handleSortChange = (field: SortField, order: SortType) => {
    updateSearchParams({ sort_field: field, sort_type: order, page: 1 });
  };

  // Filter handlers
  const handleFilterChange = (filterType: string, value: string) => {
    updateSearchParams({ [filterType]: value || undefined, page: 1 });
  };

  const clearAllFilters = () => {
    updateSearchParams({
      type_list: undefined,
      category: undefined,
      country: undefined,
      year: undefined,
      sort_lang: undefined,
      page: 1
    });
  };

  // Get active filters count
  const activeFiltersCount = [selectedType, selectedCategory, selectedCountry, selectedYear, selectedLanguage]
    .filter(filter => filter && filter.trim() !== '').length;

  // Filter data constants
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

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Tìm kiếm', href: '/tim-kiem', isCurrent: !keyword },
    ...(keyword ? [{ label: `"${keyword}"`, href: `/tim-kiem?keyword=${keyword}`, isCurrent: true }] : [])
  ];

  const movies = searchData?.items || [];
  const totalPages = searchData?.pagination?.totalPages || 1;
  const totalItems = searchData?.pagination?.totalItems || 0;

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-slate-800/50">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* Search Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">
              Tìm kiếm phim
            </h1>

            {/* Enhanced Search Bar with Suggestions */}
            <div className="max-w-2xl mx-auto">
              <EnhancedSearchBar
                placeholder="Tìm kiếm phim, diễn viên, đạo diễn..."
                initialValue={keyword}
                onSearch={handleEnhancedSearch}
                showImages={true}
                large={true}
              />
            </div>
          </div>
        </div>

        {keyword && (
          <>
            {/* Filter Toggle */}
            <div className="container mx-auto px-4 pb-8">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                  {activeFiltersCount > 0 && (
                    <Badge variant="danger" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                  {showFilters ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Xóa bộ lọc
                  </Button>
                )}
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Type Filter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">
                        Loại phim
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => handleFilterChange('type_list', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Tất cả loại</option>
                        {movieTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">
                        Thể loại
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Tất cả thể loại</option>
                        {genresData?.map((genre) => (
                          <option key={genre._id} value={genre.slug}>
                            {genre.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Country Filter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">
                        Quốc gia
                      </label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => handleFilterChange('country', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Tất cả quốc gia</option>
                        {countriesData?.map((country) => (
                          <option key={country._id} value={country.slug}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Year Filter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">
                        Năm phát hành
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Tất cả năm</option>
                        {years.map((year) => (
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Language Filter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">
                        Ngôn ngữ
                      </label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => handleFilterChange('sort_lang', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Tất cả ngôn ngữ</option>
                        {languages.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">
                        Sắp xếp theo
                      </label>
                      <div className="flex space-x-2">
                        <select
                          value={sortField}
                          onChange={(e) => handleSortChange(e.target.value as SortField, sortType)}
                          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
                        >
                          <option value="year">Năm</option>
                          <option value="modified.time">Mới thêm</option>
                        </select>
                        <select
                          value={sortType}
                          onChange={(e) => handleSortChange(sortField, e.target.value as SortType)}
                          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500"
                        >
                          <option value="desc">Giảm dần</option>
                          <option value="asc">Tăng dần</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Header */}
            {keyword && (
              <div className="container mx-auto px-4 mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Kết quả tìm kiếm cho: "{keyword}"
                </h2>
                {searchData?.pagination && (
                  <p className="text-slate-400">
                    Tìm thấy {searchData.pagination.totalItems} kết quả
                    {searchData.pagination.totalPages > 1 && (
                      <span> - Trang {currentPage}/{searchData.pagination.totalPages}</span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Search Results */}
            <div className="container mx-auto px-4 pb-12">
              {error ? (
                <div className="text-center py-12">
                  <div className="text-white">
                    <h2 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
                    <p className="text-slate-400">Không thể thực hiện tìm kiếm. Vui lòng thử lại.</p>
                  </div>
                </div>
              ) : (
                <MovieGrid
                  movies={movies}
                  isLoading={isLoading}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  emptyMessage={
                    isLoading
                      ? 'Đang tìm kiếm...'
                      : `Không tìm thấy kết quả nào cho "${keyword}"`
                  }
                />
              )}
            </div>
          </>
        )}

        {/* Default state - no search keyword */}
        {!keyword && (
          <div className="container mx-auto px-4 pb-12">
            <div className="text-center py-12 text-slate-400">
              <Search className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg">Nhập từ khóa để tìm kiếm phim yêu thích</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPageClient;
