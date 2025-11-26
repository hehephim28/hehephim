'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Search } from 'lucide-react';
import { Button } from '../ui';
import { HeaderSearchBar } from '../features';
import { useNavigationMetadata } from '../../hooks/useMetadata';
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
  const pathname = usePathname();

  // Refs for dropdown elements
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

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
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export { Header };
