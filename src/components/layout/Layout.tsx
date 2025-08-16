import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '../../utils/cn';

export interface LayoutProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  containerClassName?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  showHeader = true,
  showFooter = true,
  containerClassName,
}) => {
  return (
    <div className={cn('min-h-screen bg-slate-900 text-white flex flex-col', className)}>
      {showHeader && <Header />}
      
      <main className={cn('flex-1', containerClassName)}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export { Layout };
