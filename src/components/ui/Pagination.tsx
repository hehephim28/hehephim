import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showQuickJump?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showQuickJump = false,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = totalPages > 1 ? getVisiblePages() : [1];

  return (
    <div className={cn('flex items-center justify-center space-x-2 py-8', className)}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center space-x-1 px-3 py-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Trang trước</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="px-3 py-2 text-slate-400"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const pageNum = page as number;
          const isCurrentPage = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              variant={isCurrentPage ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'min-w-[40px] px-3 py-2 font-medium',
                isCurrentPage && 'pointer-events-none'
              )}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center space-x-1 px-3 py-2"
      >
        <span className="hidden sm:inline">Trang sau</span>
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Quick Jump (Optional) */}
      {showQuickJump && totalPages > 10 && (
        <div className="hidden md:flex items-center space-x-2 ml-4">
          <span className="text-sm text-slate-400">Trang:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="w-16 px-2 py-1 text-sm bg-slate-800 border border-slate-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span className="text-sm text-slate-400">/ {totalPages}</span>
        </div>
      )}
    </div>
  );
};

export { Pagination };
