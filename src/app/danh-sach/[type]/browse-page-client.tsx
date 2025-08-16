'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MovieGrid } from '@/components/features/MovieGrid';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { 
  useMoviesByCategory,
  useLatestMovies
} from '@/hooks/useMovies';
import { useMetadata } from '@/hooks/useMetadata';
import { getTypeTitle } from '@/utils/helpers';
import type { MovieFilters, SortField, SortType, MovieType } from '@/types/movie';

interface BrowsePageClientProps {
  type: string;
  initialSearchParams: { [key: string]: string | string[] | undefined };
}

export const BrowsePageClient: React.FC<BrowsePageClientProps> = ({
  type,
  initialSearchParams
}) => {
  const router = useRouter();
  
  // State for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('year');
  const [sortType, setSortType] = useState<SortType>('desc');
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLang, setSelectedLang] = useState('');

  const { genres, countries } = useMetadata();
  
  // Generate years array (current year back to 1990)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  // Initialize filters from URL params
  useEffect(() => {
    const page = parseInt((initialSearchParams.page as string) || '1');
    const sort_field = (initialSearchParams.sort_field as SortField) || 'year';
    const sort_type = (initialSearchParams.sort_type as SortType) || 'desc';
    const genre = (initialSearchParams.genre as string) || '';
    const country = (initialSearchParams.country as string) || '';
    const year = (initialSearchParams.year as string) || '';
    const lang = (initialSearchParams.lang as string) || '';

    setCurrentPage(page);
    setSortField(sort_field);
    setSortType(sort_type);
    setSelectedGenre(genre);
    setSelectedCountry(country);
    setSelectedYear(year);
    setSelectedLang(lang);
  }, [initialSearchParams]);

  // Build filter object
  const filters: MovieFilters = {
    page: currentPage,
    sortField: sortField,
    sortType: sortType,
    limit: 24,
    ...(selectedGenre && { category: selectedGenre }),
    ...(selectedCountry && { country: selectedCountry }),
    ...(selectedYear && { year: parseInt(selectedYear) }),
    ...(selectedLang && { language: selectedLang as any }),
  };

  // Always call all hooks - conditionally use results
  const latestMoviesQuery = useLatestMovies(currentPage, 3);
  const categoryMoviesQuery = useMoviesByCategory({ ...filters, type: type as MovieType });
  
  // Determine which query result to use based on route
  const pageTitle = getTypeTitle(type);
  const pageSubtitle = `Danh sách ${pageTitle.toLowerCase()}`;

  let moviesQuery;
  if (type === 'phim-moi-cap-nhat') {
    moviesQuery = latestMoviesQuery;
  } else {
    moviesQuery = categoryMoviesQuery;
  }

  const { data: moviesData, isLoading, error } = moviesQuery;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page: page.toString() });
  };

  const handleSortChange = (field: SortField, order: SortType) => {
    setSortField(field);
    setSortType(order);
    setCurrentPage(1);
    updateURL({ sort_field: field, sort_type: order, page: '1' });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    const updates: Record<string, string> = { page: '1' };
    
    switch (filterType) {
      case 'genre':
        setSelectedGenre(value);
        updates.genre = value;
        break;
      case 'country':
        setSelectedCountry(value);
        updates.country = value;
        break;
      case 'year':
        setSelectedYear(value);
        updates.year = value;
        break;
      case 'lang':
        setSelectedLang(value);
        updates.lang = value;
        break;
    }
    
    updateURL(updates);
  };

  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedCountry('');
    setSelectedYear('');
    setSelectedLang('');
    setCurrentPage(1);
    updateURL({ genre: '', country: '', year: '', lang: '', page: '1' });
  };

  const updateURL = (updates: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    router.push(url.toString());
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: pageTitle, href: `/danh-sach/${type}`, isCurrent: true }
  ];

  // Handle error state
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h1>
            <p className="text-slate-400 mb-6">Không thể tải danh sách phim.</p>
            <Button onClick={() => router.push('/')}>Về trang chủ</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-slate-800/50">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* Page Header */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                {pageTitle}
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                {pageSubtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Filters and Controls */}
        <section className="bg-slate-900/50 border-b border-slate-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Filter Toggle and Sort */}
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>

                {/* Sort Options */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Sắp xếp:</span>
                  <select
                    value={`${sortField}-${sortType}`}
                    onChange={(e) => {
                      const [field, type] = e.target.value.split('-') as [SortField, SortType];
                      handleSortChange(field, type);
                    }}
                    className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                  >
                    <option value="modified.time-desc">Mới thêm</option>
                    <option value="modified.time-asc">Cũ nhất</option>
                    <option value="year-desc">Năm giảm dần</option>
                    <option value="year-asc">Năm tăng dần</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(selectedGenre || selectedCountry || selectedYear || selectedLang) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-400 hover:text-white"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>

              {/* Active Filters */}
              <div className="flex flex-wrap gap-2">
                {selectedGenre && (
                  <Badge 
                    variant="info"
                    className="cursor-pointer"
                    onClick={() => handleFilterChange('genre', '')}
                  >
                    Thể loại: {genres?.find((g: any) => g.slug === selectedGenre)?.name} ×
                  </Badge>
                )}
                {selectedCountry && (
                  <Badge 
                    variant="info"
                    className="cursor-pointer"
                    onClick={() => handleFilterChange('country', '')}
                  >
                    Quốc gia: {countries?.find((c: any) => c.slug === selectedCountry)?.name} ×
                  </Badge>
                )}
                {selectedYear && (
                  <Badge 
                    variant="warning"
                    className="cursor-pointer"
                    onClick={() => handleFilterChange('year', '')}
                  >
                    Năm: {selectedYear} ×
                  </Badge>
                )}
                {selectedLang && (
                  <Badge 
                    variant="success"
                    className="cursor-pointer"
                    onClick={() => handleFilterChange('lang', '')}
                  >
                    Ngôn ngữ: {selectedLang} ×
                  </Badge>
                )}
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-6 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Genre Filter */}
                  <div className="space-y-2">
                    <label className="text-slate-300 text-sm font-medium">Thể loại</label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => handleFilterChange('genre', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                    >
                      <option value="">Tất cả thể loại</option>
                      {genres?.map((genre: any) => (
                        <option key={genre._id} value={genre.slug}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Country Filter */}
                  <div className="space-y-2">
                    <label className="text-slate-300 text-sm font-medium">Quốc gia</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                    >
                      <option value="">Tất cả quốc gia</option>
                      {countries?.map((country: any) => (
                        <option key={country._id} value={country.slug}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Filter */}
                  <div className="space-y-2">
                    <label className="text-slate-300 text-sm font-medium">Năm phát hành</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
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
                    <label className="text-slate-300 text-sm font-medium">Ngôn ngữ</label>
                    <select
                      value={selectedLang}
                      onChange={(e) => handleFilterChange('lang', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                    >
                      <option value="">Tất cả ngôn ngữ</option>
                      <option value="vietsub">Vietsub</option>
                      <option value="thuyet-minh">Thuyết minh</option>
                      <option value="long-tieng">Lồng tiếng</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Movies Grid */}
        <div className="container mx-auto px-4 pb-12">
          <MovieGrid
            movies={moviesData?.items || moviesData?.data?.items || []}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={moviesData?.pagination?.totalPages || moviesData?.data?.params?.pagination?.totalPages || 1}
            onPageChange={handlePageChange}
            emptyMessage={`Không tìm thấy ${pageTitle.toLowerCase()} nào`}
          />
        </div>
      </div>
    </Layout>
  );
};

export default BrowsePageClient;
