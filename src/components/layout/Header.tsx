'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Search, User, LogOut, Heart } from 'lucide-react';
import { Button } from '../ui';
import { HeaderSearchBar } from '../features';
import { AuthModal } from '../ui/AuthModal';
import { useNavigationMetadata } from '../../hooks/useMetadata';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

// Utility function to prevent body scroll without losing scrollbar
const useScrollLock = () => {
  const lockScroll = () => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  };

  const unlockScroll = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };

  return { lockScroll, unlockScroll };
};

export interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [mobileGenreOpen, setMobileGenreOpen] = useState(false);
  const [mobileCountryOpen, setMobileCountryOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Auth state
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();

  // Refs for dropdown elements
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Get metadata for dropdown
  const { genres, countries } = useNavigationMetadata();

  // Initialize scroll lock utility
  const { lockScroll, unlockScroll } = useScrollLock();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
        setIsGenreDropdownOpen(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent body scroll when dropdown is open without losing scrollbar
  useEffect(() => {
    if (isGenreDropdownOpen || isCountryDropdownOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      unlockScroll();
    };
  }, [isGenreDropdownOpen, isCountryDropdownOpen, lockScroll, unlockScroll]);

  // Reset mobile submenu when main menu closes
  useEffect(() => {
    if (!isMenuOpen) {
      setMobileGenreOpen(false);
      setMobileCountryOpen(false);
    }
  }, [isMenuOpen]);

  // Close mobile search when menu opens
  useEffect(() => {
    if (isMenuOpen) {
      setMobileSearchOpen(false);
    }
  }, [isMenuOpen]);

  // Close menu when mobile search opens
  useEffect(() => {
    if (mobileSearchOpen) {
      setIsMenuOpen(false);
    }
  }, [mobileSearchOpen]);

  // Hide search bar on search page to avoid duplicates
  const hideSearchBar = pathname?.startsWith('/tim-kiem');

  const navigationItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Phim bộ', href: '/danh-sach/phim-bo' },
    { label: 'Phim lẻ', href: '/danh-sach/phim-le' },
  ];

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-800',
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Layout */}
          <div className="md:hidden flex items-center flex-1">
            {/* Mobile Menu Button - Left side */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              leftIcon={isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            >
              <span className="sr-only">
                {isMenuOpen ? 'Close menu' : 'Open menu'}
              </span>
            </Button>

            {/* Logo - Next to hamburger with flex-1 to take remaining space */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors flex-1 ml-3"
            >
              <img
                src="/logo.png"
                alt="HeHePhim Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-lg font-bold">HeHePhim</span>
            </Link>
          </div>

          {/* Desktop Logo */}
          <Link
            href="/"
            className="hidden md:flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
          >
            <img
              src="/logo.png"
              alt="HeHePhim Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold">HeHePhim</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-slate-300 hover:text-white transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}

            {/* Dropdown for Thể loại */}
            <div className="relative" ref={genreDropdownRef}>
              <button
                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors duration-200 font-medium"
              >
                <span>Thể Loại</span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isGenreDropdownOpen && "rotate-180"
                )} />
              </button>

              {/* Genre Dropdown Menu */}
              {isGenreDropdownOpen && (
                <>
                  {/* Overlay */}
                  <div
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={() => setIsGenreDropdownOpen(false)}
                  />

                  <div
                    className="absolute top-full left-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="p-4">
                      {/* Grid layout for all genres */}
                      <div className="grid grid-cols-3 gap-2">
                        {genres.map((genre) => (
                          <Link
                            key={genre._id}
                            href={`/the-loai/${genre.slug}`}
                            onClick={() => setIsGenreDropdownOpen(false)}
                            className="block px-2 py-1.5 text-slate-300 hover:text-red-400 hover:bg-slate-700 rounded transition-all duration-200 text-xs text-center whitespace-nowrap"
                          >
                            {genre.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dropdown for Quốc gia */}
            <div className="relative" ref={countryDropdownRef}>
              <button
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors duration-200 font-medium"
              >
                <span>Quốc Gia</span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isCountryDropdownOpen && "rotate-180"
                )} />
              </button>

              {/* Country Dropdown Menu */}
              {isCountryDropdownOpen && (
                <>
                  {/* Overlay */}
                  <div
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={() => setIsCountryDropdownOpen(false)}
                  />

                  <div
                    className="absolute top-full left-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 max-h-[500px] overflow-y-auto"
                  >
                    <div className="p-4">
                      {/* Grid layout for all countries */}
                      <div className="grid grid-cols-3 gap-2">
                        {countries.map((country) => (
                          <Link
                            key={country._id}
                            href={`/quoc-gia/${country.slug}`}
                            onClick={() => setIsCountryDropdownOpen(false)}
                            className="block px-2 py-1.5 text-slate-300 hover:text-red-400 hover:bg-slate-700 rounded transition-all duration-200 text-xs text-center whitespace-nowrap"
                          >
                            {country.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Desktop Search Bar - Hidden on search page */}
          {!hideSearchBar && (
            <div className="hidden md:block">
              <HeaderSearchBar
                placeholder="Tìm kiếm phim..."
                className="w-80"
              />
            </div>
          )}

          {/* Mobile Search Button - Right side with more margin */}
          {!hideSearchBar && (
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden ml-4"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              leftIcon={<Search className="w-5 h-5" />}
            >
              <span className="sr-only">Search</span>
            </Button>
          )}

          {/* Desktop Auth Button / User Menu */}
          <div className="hidden md:block ml-4" ref={userDropdownRef}>
            {authLoading ? (
              <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-medium max-w-[100px] truncate">
                    {user.username}
                  </span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-gray-400 transition-transform",
                    userDropdownOpen && "rotate-180"
                  )} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 py-2">
                    <div className="px-4 py-2 border-b border-slate-700">
                      <p className="text-white font-medium truncate">{user.username}</p>
                      <p className="text-gray-400 text-sm truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      Phim yêu thích
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setAuthModalOpen(true)}
                leftIcon={<User className="w-4 h-4" />}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search Overlay - Overlays on top of header with better spacing */}
        {mobileSearchOpen && !hideSearchBar && (
          <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-slate-900/98 backdrop-blur-sm border-b border-slate-800 z-50">
            <div className="container mx-auto px-4 h-full">
              <div className="flex items-center h-full space-x-3">
                <div className="flex-1 mr-2">
                  <HeaderSearchBar
                    placeholder="Tìm kiếm phim..."
                    className="w-full"
                    onSearch={() => setMobileSearchOpen(false)}
                    autoFocus
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileSearchOpen(false)}
                  leftIcon={<X className="w-5 h-5" />}
                >
                  <span className="sr-only">Close search</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="space-y-4">
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-2 text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Mobile Genres Section */}
                <div className="pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setMobileGenreOpen(!mobileGenreOpen)}
                    className="flex items-center justify-between w-full py-2 text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    <span>Thể Loại</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      mobileGenreOpen && "rotate-180"
                    )} />
                  </button>

                  {mobileGenreOpen && (
                    <div className="mt-3 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {genres.map((genre) => (
                        <Link
                          key={genre._id}
                          href={`/the-loai/${genre.slug}`}
                          onClick={() => {
                            setIsMenuOpen(false);
                            setMobileGenreOpen(false);
                          }}
                          className="block px-3 py-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded text-sm transition-all duration-200 text-center"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Countries Section */}
                <div className="pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setMobileCountryOpen(!mobileCountryOpen)}
                    className="flex items-center justify-between w-full py-2 text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    <span>Quốc Gia</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      mobileCountryOpen && "rotate-180"
                    )} />
                  </button>

                  {mobileCountryOpen && (
                    <div className="mt-3 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {countries.map((country) => (
                        <Link
                          key={country._id}
                          href={`/quoc-gia/${country.slug}`}
                          onClick={() => {
                            setIsMenuOpen(false);
                            setMobileCountryOpen(false);
                          }}
                          className="block px-3 py-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded text-sm transition-all duration-200 text-center"
                        >
                          {country.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Auth Section */}
                <div className="pt-4 border-t border-slate-700">
                  {authLoading ? (
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse" />
                      <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
                    </div>
                  ) : isAuthenticated && user ? (
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-gray-400 text-sm truncate max-w-[180px]">{user.email}</p>
                        </div>
                      </div>

                      {/* Favorites Link */}
                      <Link
                        href="/favorites"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 py-2 text-slate-300 hover:text-red-400 transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                        Phim yêu thích
                      </Link>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-2 py-2 text-slate-300 hover:text-red-400 transition-colors w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        Đăng xuất
                      </button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setAuthModalOpen(true);
                      }}
                      leftIcon={<User className="w-5 h-5" />}
                    >
                      Đăng nhập / Đăng ký
                    </Button>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </header>
  );
};

export { Header };
