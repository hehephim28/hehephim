import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  showHome = true,
}) => {
  const allItems = showHome 
    ? [{ label: 'Trang chủ', href: '/' }, ...items]
    : items;

  return (
    <nav 
      className={cn('flex items-center space-x-2 text-sm', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0 && showHome;
          const isCurrent = item.isCurrent || isLast;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-slate-500 mx-2 flex-shrink-0" />
              )}
              
              {item.href && !isCurrent ? (
                <Link
                    href={item.href}
                  className={cn(
                    'flex items-center space-x-1 text-slate-400 hover:text-white transition-colors duration-200',
                    isFirst && 'text-red-400 hover:text-red-300'
                  )}
                >
                  {isFirst && <Home className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center space-x-1',
                    isCurrent 
                      ? 'text-white font-medium' 
                      : 'text-slate-400',
                    isFirst && 'text-red-400'
                  )}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {isFirst && <Home className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export { Breadcrumb };
