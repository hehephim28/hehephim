import Link from 'next/link';
import { Mail } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {

  return (
    <footer className={cn(
      'bg-slate-900 border-t border-slate-800',
      className
    )}>
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-6">
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
            >
              <img
                src="/logo.png"
                alt="HeHePhim Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold">HeHePhim</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Xem phim online chất lượng cao, cập nhật nhanh nhất.
              Kho phim đa dạng từ Việt Nam đến quốc tế, phục vụ mọi sở thích của bạn.
            </p>
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <Mail className="w-4 h-4" />
              <span>hehephim28@gmail.com</span>
            </div>
            <div className="text-slate-400 text-sm">© 2024 HeHePhim.</div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">

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
