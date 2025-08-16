import Link from 'next/link';
import { Film, Mail } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const movieCategories = [
    { label: 'Phim Bộ', href: '/danh-sach/phim-bo' },
    { label: 'Phim Lẻ', href: '/danh-sach/phim-le' },
    { label: 'TV Shows', href: '/danh-sach/tv-shows' },
    { label: 'Hoạt Hình', href: '/danh-sach/hoat-hinh' },
  ];

  const genres = [
    { label: 'Hành Động', href: '/the-loai/hanh-dong' },
    { label: 'Tình Cảm', href: '/the-loai/tinh-cam' },
    { label: 'Hài Hước', href: '/the-loai/hai-huoc' },
    { label: 'Kinh Dị', href: '/the-loai/kinh-di' },
    { label: 'Viễn Tưởng', href: '/the-loai/vien-tuong' },
    { label: 'Tâm Lý', href: '/the-loai/tam-ly' },
  ];

  const countries = [
    { label: 'Phim Việt Nam', href: '/quoc-gia/viet-nam' },
    { label: 'Phim Hàn Quốc', href: '/quoc-gia/han-quoc' },
    { label: 'Phim Trung Quốc', href: '/quoc-gia/trung-quoc' },
    { label: 'Phim Mỹ', href: '/quoc-gia/my' },
    { label: 'Phim Nhật Bản', href: '/quoc-gia/nhat-ban' },
    { label: 'Phim Thái Lan', href: '/quoc-gia/thai-lan' },
  ];

  return (
    <footer className={cn(
      'bg-slate-900 border-t border-slate-800',
      className
    )}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
            >
              <Film className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold">VietStream</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Xem phim online chất lượng cao, cập nhật nhanh nhất. 
              Kho phim đa dạng từ Việt Nam đến quốc tế, phục vụ mọi sở thích của bạn.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>info@vietstream.com</span>
              </div>
            </div>
          </div>

          {/* Movie Categories */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Danh Mục Phim</h3>
            <ul className="space-y-2">
              {movieCategories.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Thể Loại</h3>
            <ul className="space-y-2">
              {genres.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Countries */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Quốc Gia</h3>
            <ul className="space-y-2">
              {countries.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">
              © 2024 VietStream. All rights reserved. Built with React & TypeScript.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link 
                href="/terms" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                Điều khoản sử dụng
              </Link>
              <Link 
                href="/contact" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                Liên hệ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
