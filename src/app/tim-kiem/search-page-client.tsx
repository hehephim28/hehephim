'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { MovieGrid } from '@/components/features/MovieGrid';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { EnhancedSearchBar } from '@/components/features/EnhancedSearchBar';
import { useSearch } from '@/hooks/useSearch';
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

  // Local state
  const [searchQuery, setSearchQuery] = useState(keyword);

  // Build search parameters
  const searchRequestParams: SearchParams = useMemo(() => ({
    keyword,
    page: currentPage,
    sort_field: sortField,
    sort_type: sortType,
    limit: 24,
  }), [keyword, currentPage, sortField, sortType]);

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
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              {keyword ? `Kết quả tìm kiếm: "${keyword}"` : 'Tìm kiếm phim'}
            </h1>
            
            {keyword && totalItems > 0 && (
              <p className="text-slate-400 text-lg">
                Tìm thấy {totalItems} kết quả cho "{keyword}"
              </p>
            )}

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
            {/* Sort Controls */}
            <div className="container mx-auto px-4 pb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Filter className="w-5 h-5" />
                  <span className="font-medium">Sắp xếp theo:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={sortField === 'modified.time' && sortType === 'desc' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('modified.time', 'desc')}
                  >
                    Mới nhất
                  </Button>
                  <Button
                    variant={sortField === 'year' && sortType === 'desc' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('year', 'desc')}
                  >
                    Năm mới
                  </Button>
                  <Button
                    variant={sortField === '_id' && sortType === 'desc' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('_id', 'desc')}
                  >
                    Mới cập nhật
                  </Button>
                </div>
              </div>
            </div>

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
