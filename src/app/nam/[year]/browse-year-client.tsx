'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { MovieGrid } from '@/components/features/MovieGrid';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { useMoviesByYear } from '@/hooks/useMovies';
import type { MovieFilters, SortField, SortType } from '@/types/movie';

interface BrowseYearClientProps {
  year: string;
  initialSearchParams: { [key: string]: string | string[] | undefined };
}

export const BrowseYearClient: React.FC<BrowseYearClientProps> = ({
  year,
  initialSearchParams
}) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('year');
  const [sortType, setSortType] = useState<SortType>('desc');

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

  const { data: moviesData, isLoading, error } = useMoviesByYear(parseInt(year), filters);
  
  const pageTitle = `Phim năm ${year}`;
  const pageSubtitle = `Danh sách phim phát hành năm ${year}`;

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
    { label: 'Năm phát hành', href: '/nam' },
    { label: pageTitle, href: `/nam/${year}`, isCurrent: true }
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
                Mới thêm
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
            emptyMessage={`Không tìm thấy phim năm ${year}`}
          />
        </div>
      </div>
    </Layout>
  );
};

export default BrowseYearClient;
