'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { MovieGrid } from '@/components/features/MovieGrid';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { useMoviesByGenre } from '@/hooks/useMovies';
import { useMetadata } from '@/hooks/useMetadata';
import type { MovieFilters, SortField, SortType } from '@/types/movie';

interface BrowseGenreClientProps {
  genre: string;
  initialSearchParams: { [key: string]: string | string[] | undefined };
}

export const BrowseGenreClient: React.FC<BrowseGenreClientProps> = ({
  genre,
  initialSearchParams
}) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('year');
  const [sortType, setSortType] = useState<SortType>('desc');

  const { genres: genresData } = useMetadata();

  // Initialize filters from URL params
  useEffect(() => {
    const page = parseInt((initialSearchParams.page as string) || '1');
    const sort_field = (initialSearchParams.sort_field as SortField) || 'year';
    const sort_type = (initialSearchParams.sort_type as SortType) || 'desc';

    setCurrentPage(page);
    setSortField(sort_field);
    setSortType(sort_type);
  }, [initialSearchParams]);

  const filters: MovieFilters = {
    page: currentPage,
    sortField: sortField,
    sortType: sortType,
    limit: 24,
  };

  const { data: moviesData, isLoading, error } = useMoviesByGenre(genre, filters);
  
  const genreData = genresData?.find(g => g.slug === genre);
  const pageTitle = genreData?.name || 'Thể loại';
  const pageSubtitle = `Phim thuộc thể loại ${pageTitle}`;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    router.push(url.toString());
  };

  const handleSortChange = (field: SortField, order: SortType) => {
    setSortField(field);
    setSortType(order);
    setCurrentPage(1);
    
    const url = new URL(window.location.href);
    url.searchParams.set('sort_field', field);
    url.searchParams.set('sort_type', order);
    url.searchParams.set('page', '1');
    router.push(url.toString());
  };

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Thể loại', href: '/the-loai' },
    { label: pageTitle, href: `/the-loai/${genre}`, isCurrent: true }
  ];

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
        <div className="bg-slate-800/50">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              {pageTitle}
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {pageSubtitle}
            </p>
          </div>
        </div>

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

        <div className="container mx-auto px-4 pb-12">
          <MovieGrid
            movies={moviesData?.items || []}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={moviesData?.pagination?.totalPages || 1}
            onPageChange={handlePageChange}
            emptyMessage={`Không tìm thấy phim thể loại ${pageTitle.toLowerCase()}`}
          />
        </div>
      </div>
    </Layout>
  );
};

export default BrowseGenreClient;
