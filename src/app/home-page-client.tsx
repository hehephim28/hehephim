'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MovieSection } from '@/components/features/MovieSection';
import { HeroSection } from '@/components/features/HeroSection';
import { useLatestMovies, usePhimLe, useMoviesByCountry, useMoviesByGenre, useTVShows, useHoatHinh } from '@/hooks/useMovies';

export const HomePage: React.FC = () => {
  const [loadOtherSections, setLoadOtherSections] = useState(false);
  
  // Load latest movies immediately for fast initial render
  const { data: latestMovies, isLoading: loadingLatest } = useLatestMovies();
  
  // Progressive loading - load other sections after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadOtherSections(true);
    }, 200); // Small delay to let homepage render first
    
    return () => clearTimeout(timer);
  }, []);
  
  // Load other sections progressively
  const { data: phimLeData, isLoading: loadingPhimLe } = usePhimLe({ 
    enabled: loadOtherSections, 
    sortField: 'year', 
    sortType: 'desc', 
    limit: 12 
  });
  
  // Movies by country (sorted by latest year)
  const { data: phimHanData, isLoading: loadingPhimHan } = useMoviesByCountry('han-quoc', { 
    enabled: loadOtherSections,
    sortField: 'year', 
    sortType: 'desc', 
    limit: 12 
  });
  const { data: phimTrungData, isLoading: loadingPhimTrung } = useMoviesByCountry('trung-quoc', { 
    enabled: loadOtherSections,
    sortField: 'year', 
    sortType: 'desc', 
    limit: 12 
  });
  const { data: phimMyData, isLoading: loadingPhimMy } = useMoviesByCountry('au-my', { 
    enabled: loadOtherSections,
    sortField: 'year', 
    sortType: 'desc', 
    limit: 12 
  });
  const { data: phimVietData, isLoading: loadingPhimViet } = useMoviesByCountry('viet-nam', { 
    enabled: loadOtherSections,
    sortField: 'year', 
    sortType: 'desc', 
    limit: 12 
  });
  
  // Movies by genre (sorted by latest year)
  const { data: phimTinhCamData, isLoading: loadingPhimTinhCam } = useMoviesByGenre('tinh-cam', { 
    enabled: loadOtherSections,
    sortField: 'year', 
    sortType: 'desc', 
    limit: 12 
  });
  const { data: phimKinhDiData, isLoading: loadingPhimKinhDi } = useMoviesByGenre('kinh-di', { 
    enabled: loadOtherSections,
    sortField: 'year', 
    sortType: 'desc', 
    limit: 12 
  });

  // TV Shows and Animation (sorted by latest year)
  const { data: tvShowsData, isLoading: loadingTVShows } = useTVShows({ 
    enabled: loadOtherSections, 
    sortField: 'year', 
    sortType: 'desc', 
    limit: 12 
  });
  const { data: hoatHinhData, isLoading: loadingHoatHinh } = useHoatHinh({ 
    enabled: loadOtherSections, 
    sortField: 'year', 
    sortType: 'desc', 
    limit: 12 
  });

  // Get featured movie from latest movies for hero section
  const featuredMovie = latestMovies?.items?.[0];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        {featuredMovie && (
          <HeroSection movie={featuredMovie} />
        )}

        {/* Movie Sections Container */}
        <div className="container mx-auto px-4 py-8 space-y-12">
          {/* Movies Section */}
          <MovieSection
            title="🎬 Phim Lẻ Mới"
            subtitle="Những bộ phim lẻ mới nhất"
            movies={phimLeData?.items?.slice(0, 12) || []}
            isLoading={loadingPhimLe}
            viewAllHref="/danh-sach/phim-le"
            viewAllLabel="Xem tất cả"
            layout="carousel"
          />

          {/* Korean Movies Section */}
          <MovieSection
            title="🇰🇷 Phim Hàn Mới"
            subtitle="Những bộ phim Hàn Quốc mới nhất và đang hot"
            movies={phimHanData?.items?.slice(0, 12) || []}
            isLoading={loadingPhimHan}
            viewAllHref="/quoc-gia/han-quoc"
            viewAllLabel="Xem tất cả"
            layout="carousel"
          />

          {/* Chinese Movies Section */}
          <MovieSection
            title="🇨🇳 Phim Trung Quốc Mới"
            subtitle="Những bộ phim Trung Quốc mới cập nhật"
            movies={phimTrungData?.items?.slice(0, 12) || []}
            isLoading={loadingPhimTrung}
            viewAllHref="/quoc-gia/trung-quoc"
            viewAllLabel="Xem tất cả"
            layout="carousel"
          />

          {/* US-UK Movies Section */}
          <MovieSection
            title="🇺🇸 Phim US-UK Mới"
            subtitle="Phim Hollywood và điện ảnh Âu Mỹ mới nhất"
            movies={phimMyData?.items?.slice(0, 12) || []}
            isLoading={loadingPhimMy}
            viewAllHref="/quoc-gia/au-my"
            viewAllLabel="Xem tất cả"
            layout="carousel"
          />

          {/* Vietnamese Movies Section */}
          <MovieSection
            title="🇻🇳 Phim Việt Mới"
            subtitle="Những bộ phim Việt Nam mới nhất và chất lượng"
            movies={phimVietData?.items?.slice(0, 12) || []}
            isLoading={loadingPhimViet}
            viewAllHref="/quoc-gia/viet-nam"
            viewAllLabel="Xem tất cả"
            layout="carousel"
          />

          {/* Romance Movies Section */}
          <MovieSection
            title="💕 Phim Tình Cảm Mới"
            subtitle="Những câu chuyện tình yêu lãng mạn và cảm động"
            movies={phimTinhCamData?.items?.slice(0, 12) || []}
            isLoading={loadingPhimTinhCam}
            viewAllHref="/the-loai/tinh-cam"
            viewAllLabel="Xem tất cả"
            layout="carousel"
          />

          {/* Horror Movies Section */}
          <MovieSection
            title="🔥 Phim Kinh Dị Mới"
            subtitle="Những bộ phim kinh dị đầy kịch tính và hồi hộp"
            movies={phimKinhDiData?.items?.slice(0, 12) || []}
            isLoading={loadingPhimKinhDi}
            viewAllHref="/the-loai/kinh-di"
            viewAllLabel="Xem tất cả"
            layout="carousel"
          />

          {/* TV Shows Section */}
          <MovieSection
            title="📺 TV Shows Mới"
            subtitle="Những bộ TV Shows mới nhất và đáng xem"
            movies={tvShowsData?.items?.slice(0, 12) || []}
            isLoading={loadingTVShows}
            viewAllHref="/danh-sach/tv-shows"
            viewAllLabel="Xem tất cả"
            layout="carousel"
          />

          {/* Animation Section */}
          <MovieSection
            title="🎭 Hoạt Hình Mới"
            subtitle="Những bộ phim hoạt hình mới nhất và thú vị"
            movies={hoatHinhData?.items?.slice(0, 12) || []}
            isLoading={loadingHoatHinh}
            viewAllHref="/danh-sach/hoat-hinh"
            viewAllLabel="Xem tất cả"
            layout="carousel"
          />
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
