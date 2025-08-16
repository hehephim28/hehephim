import { apiClient } from './api';
import type { 
  Category,
  Country,
  GenreResponse,
  CountryResponse
} from '../types/movie';

// Complete static data for genres
const STATIC_GENRES: Category[] = [
  { "_id": "9822be111d2ccc29c7172c78b8af8ff5", "name": "Hành Động", "slug": "hanh-dong" },
  { "_id": "d111447ee87ec1a46a31182ce4623662", "name": "Miền Tây", "slug": "mien-tay" },
  { "_id": "0c853f6238e0997ee318b646bb1978bc", "name": "Trẻ Em", "slug": "tre-em" },
  { "_id": "f8ec3e9b77c509fdf64f0c387119b916", "name": "Lịch Sử", "slug": "lich-su" },
  { "_id": "3a17c7283b71fa84e5a8d76fb790ed3e", "name": "Cổ Trang", "slug": "co-trang" },
  { "_id": "1bae5183d681b7649f9bf349177f7123", "name": "Chiến Tranh", "slug": "chien-tranh" },
  { "_id": "68564911f00849030f9c9c144ea1b931", "name": "Viễn Tưởng", "slug": "vien-tuong" },
  { "_id": "4db8d7d4b9873981e3eeb76d02997d58", "name": "Kinh Dị", "slug": "kinh-di" },
  { "_id": "1645fa23fa33651cef84428b0dcc2130", "name": "Tài Liệu", "slug": "tai-lieu" },
  { "_id": "2fb53017b3be83cd754a08adab3e916c", "name": "Bí Ẩn", "slug": "bi-an" },
  { "_id": "4b4457a1af8554c282dc8ac41fd7b4a1", "name": "Phim 18+", "slug": "phim-18" },
  { "_id": "bb2b4b030608ca5984c8dd0770f5b40b", "name": "Tình Cảm", "slug": "tinh-cam" },
  { "_id": "a7b065b92ad356387ef2e075dee66529", "name": "Tâm Lý", "slug": "tam-ly" },
  { "_id": "591bbb2abfe03f5aa13c08f16dfb69a2", "name": "Thể Thao", "slug": "the-thao" },
  { "_id": "66c78b23908113d478d8d85390a244b4", "name": "Phiêu Lưu", "slug": "phieu-luu" },
  { "_id": "252e74b4c832ddb4233d7499f5ed122e", "name": "Âm Nhạc", "slug": "am-nhac" },
  { "_id": "a2492d6cbc4d58f115406ca14e5ec7b6", "name": "Gia Đình", "slug": "gia-dinh" },
  { "_id": "01c8abbb7796a1cf1989616ca5c175e6", "name": "Học Đường", "slug": "hoc-duong" },
  { "_id": "ba6fd52e5a3aca80eaaf1a3b50a182db", "name": "Hài Hước", "slug": "hai-huoc" },
  { "_id": "7a035ac0b37f5854f0f6979260899c90", "name": "Hình Sự", "slug": "hinh-su" },
  { "_id": "578f80eb493b08d175c7a0c29687cbdf", "name": "Võ Thuật", "slug": "vo-thuat" },
  { "_id": "0bcf4077916678de9b48c89221fcf8ae", "name": "Khoa Học", "slug": "khoa-hoc" },
  { "_id": "2276b29204c46f75064735477890afd6", "name": "Thần Thoại", "slug": "than-thoai" },
  { "_id": "37a7b38b6184a5ebd3c43015aa20709d", "name": "Chính Kịch", "slug": "chinh-kich" },
  { "_id": "268385d0de78827ff7bb25c35036ee2a", "name": "Kinh Điển", "slug": "kinh-dien" }
];

// Complete static data for countries
const STATIC_COUNTRIES: Country[] = [
  { "_id": "f6ce1ae8b39af9d38d653b8a0890adb8", "name": "Việt Nam", "slug": "viet-nam" },
  { "_id": "3e075636c731fe0f889c69e0bf82c083", "name": "Trung Quốc", "slug": "trung-quoc" },
  { "_id": "cefbf1640a17bad1e13c2f6f2a811a2d", "name": "Thái Lan", "slug": "thai-lan" },
  { "_id": "dcd5551cbd22ea2372726daafcd679c1", "name": "Hồng Kông", "slug": "hong-kong" },
  { "_id": "92f688188aa938a03a61a786d6616dcb", "name": "Pháp", "slug": "phap" },
  { "_id": "24a5bf049aeef94ab79bad1f73f16b92", "name": "Đức", "slug": "duc" },
  { "_id": "41487913363f08e29ea07f6fdfb49a41", "name": "Hà Lan", "slug": "ha-lan" },
  { "_id": "8dbb07a18d46f63d8b3c8994d5ccc351", "name": "Mexico", "slug": "mexico" },
  { "_id": "61709e9e6ca6ca8245bc851c0b781673", "name": "Thụy Điển", "slug": "thuy-dien" },
  { "_id": "77dab2f81a6c8c9136efba7ab2c4c0f2", "name": "Philippines", "slug": "philippines" },
  { "_id": "208c51751eff7e1480052cdb4e26176a", "name": "Đan Mạch", "slug": "dan-mach" },
  { "_id": "69e561770d6094af667b9361f58f39bd", "name": "Thụy Sĩ", "slug": "thuy-si" },
  { "_id": "c338f80e38dd2381f8faf9eccb6e6c1c", "name": "Ukraina", "slug": "ukraina" },
  { "_id": "05de95be5fc404da9680bbb3dd8262e6", "name": "Hàn Quốc", "slug": "han-quoc" },
  { "_id": "74d9fa92f4dea9ecea8fc2233dc7921a", "name": "Âu Mỹ", "slug": "au-my" },
  { "_id": "aadd510492662beef1a980624b26c685", "name": "Ấn Độ", "slug": "an-do" },
  { "_id": "445d337b5cd5de476f99333df6b0c2a7", "name": "Canada", "slug": "canada" },
  { "_id": "8a40abac202ab3659bb98f71f05458d1", "name": "Tây Ban Nha", "slug": "tay-ban-nha" },
  { "_id": "4647d00cf81f8fb0ab80f753320d0fc9", "name": "Indonesia", "slug": "indonesia" },
  { "_id": "59317f665349487a74856ac3e37b35b5", "name": "Ba Lan", "slug": "ba-lan" },
  { "_id": "3f0e49c46cbde0c7adf5ea04a97ab261", "name": "Malaysia", "slug": "malaysia" },
  { "_id": "fcd5da8ea7e4bf894692933ee3677967", "name": "Bồ Đào Nha", "slug": "bo-dao-nha" },
  { "_id": "b6ae56d2d40c99fc293aefe45dcb3b3d", "name": "UAE", "slug": "uae" },
  { "_id": "471cdb11e01cf8fcdafd3ab5cd7b4241", "name": "Châu Phi", "slug": "chau-phi" },
  { "_id": "cc85d02a69f06f7b43ab67f5673604a3", "name": "Ả Rập Xê Út", "slug": "a-rap-xe-ut" },
  { "_id": "d4097fbffa8f7149a61281437171eb83", "name": "Nhật Bản", "slug": "nhat-ban" },
  { "_id": "559fea9881e3a6a3e374b860fa8fb782", "name": "Đài Loan", "slug": "dai-loan" },
  { "_id": "932bbaca386ee0436ad0159117eabae4", "name": "Anh", "slug": "anh" },
  { "_id": "8931caa7f43ee5b07bf046c8300f4eba", "name": "Thổ Nhĩ Kỳ", "slug": "tho-nhi-ky" },
  { "_id": "2dbf49dd0884691f87e44769a3a3a29e", "name": "Nga", "slug": "nga" },
  { "_id": "435a85571578e419ed511257881a1e75", "name": "Úc", "slug": "uc" },
  { "_id": "42537f0fb56e31e20ab9c2305752087d", "name": "Brazil", "slug": "brazil" },
  { "_id": "a30878a7fdb6a94348fce16d362edb11", "name": "Ý", "slug": "y" },
  { "_id": "638f494a6d33cf5760f6e95c8beb612a", "name": "Na Uy", "slug": "na-uy" },
  { "_id": "3cf479dac2caaead12dfa36105b1c402", "name": "Nam Phi", "slug": "nam-phi" },
  { "_id": "45a260effdd4ba38e861092ae2a1b96a", "name": "Khác", "slug": "quoc-gia-khac" }
];

export class MetadataService {
  /**
   * Get all available movie genres/categories
   */
  async getGenres(): Promise<GenreResponse> {
    return apiClient.get<GenreResponse>('/the-loai');
  }

  /**
   * Get all available countries
   */
  async getCountries(): Promise<CountryResponse> {
    return apiClient.get<CountryResponse>('/quoc-gia');
  }

  /**
   * Cache for genres and countries (in-memory cache)
   */
  private genresCache: Category[] | null = null;
  private countriesCache: Country[] | null = null;
  private cacheTimestamp: { genres?: number; countries?: number } = {};
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  /**
   * Get genres with caching - prioritize static data
   */
  async getCachedGenres(): Promise<Category[]> {
    const now = Date.now();
    
    if (
      this.genresCache && 
      this.cacheTimestamp.genres && 
      now - this.cacheTimestamp.genres < this.CACHE_DURATION
    ) {
      return this.genresCache;
    }

    try {
      // Try to get from API first
      const apiResponse = await this.getGenres();
      
      // Merge with static data, prioritizing static data structure
      const mergedGenres = this.mergeWithStaticGenres(apiResponse);
      
      this.genresCache = mergedGenres;
      this.cacheTimestamp.genres = now;
      return this.genresCache;
    } catch (error) {
      console.error('Failed to fetch genres from API, using static data:', error);
      // Return static data as fallback
      this.genresCache = STATIC_GENRES;
      this.cacheTimestamp.genres = now;
      return this.genresCache;
    }
  }

  /**
   * Merge API data with static genres
   */
  private mergeWithStaticGenres(apiGenres: Category[]): Category[] {
    // Use static data as base, merge any additional from API
    const merged = [...STATIC_GENRES];
    
    // Add any genres from API that aren't in static data
    apiGenres?.forEach(apiGenre => {
      const exists = merged.some(staticGenre => staticGenre.slug === apiGenre.slug);
      if (!exists) {
        merged.push(apiGenre);
      }
    });
    
    return merged;
  }

  /**
   * Get countries with caching - prioritize static data
   */
  async getCachedCountries(): Promise<Country[]> {
    const now = Date.now();
    
    if (
      this.countriesCache && 
      this.cacheTimestamp.countries && 
      now - this.cacheTimestamp.countries < this.CACHE_DURATION
    ) {
      return this.countriesCache;
    }

    try {
      // Try to get from API first
      const apiResponse = await this.getCountries();
      
      // Merge with static data, prioritizing static data structure
      const mergedCountries = this.mergeWithStaticCountries(apiResponse);
      
      this.countriesCache = mergedCountries;
      this.cacheTimestamp.countries = now;
      return this.countriesCache;
    } catch (error) {
      console.error('Failed to fetch countries from API, using static data:', error);
      // Return static data as fallback
      this.countriesCache = STATIC_COUNTRIES;
      this.cacheTimestamp.countries = now;
      return this.countriesCache;
    }
  }

  /**
   * Merge API data with static countries
   */
  private mergeWithStaticCountries(apiCountries: Country[]): Country[] {
    // Use static data as base, merge any additional from API
    const merged = [...STATIC_COUNTRIES];
    
    // Add any countries from API that aren't in static data
    apiCountries?.forEach(apiCountry => {
      const exists = merged.some(staticCountry => staticCountry.slug === apiCountry.slug);
      if (!exists) {
        merged.push(apiCountry);
      }
    });
    
    return merged;
  }

  /**
   * Find genre by slug
   */
  async getGenreBySlug(slug: string): Promise<Category | null> {
    const genres = await this.getCachedGenres();
    return genres.find(genre => genre.slug === slug) || null;
  }

  /**
   * Find country by slug
   */
  async getCountryBySlug(slug: string): Promise<Country | null> {
    const countries = await this.getCachedCountries();
    return countries.find(country => country.slug === slug) || null;
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.genresCache = null;
    this.countriesCache = null;
    this.cacheTimestamp = {};
  }

  /**
   * Get popular genres (commonly used categories)
   */
  async getPopularGenres(): Promise<Category[]> {
    const genres = await this.getCachedGenres();
    
    // Common popular genre slugs based on typical Vietnamese movie preferences
    const popularSlugs = [
      'hanh-dong',
      'kinh-di', 
      'tinh-cam',
      'hai-huoc',
      'phieu-luu',
      'hinh-su',
      'than-thoai',
      'vien-tuong',
      'co-trang',
      'vo-thuat',
      'tam-ly',
      'chien-tranh'
    ];

    const popularGenres: Category[] = [];
    
    popularSlugs.forEach(slug => {
      const genre = genres.find(g => g.slug === slug);
      if (genre) {
        popularGenres.push(genre);
      }
    });

    // Add remaining genres if we don't have enough popular ones
    if (popularGenres.length < 12) {
      const remainingGenres = genres.filter(
        genre => !popularSlugs.includes(genre.slug)
      );
      popularGenres.push(...remainingGenres.slice(0, 12 - popularGenres.length));
    }

    return popularGenres.slice(0, 12); // Return max 12 genres for navigation
  }

  /**
   * Get popular countries
   */
  async getPopularCountries(): Promise<Country[]> {
    const countries = await this.getCachedCountries();
    
    // Common popular country slugs in order of popularity
    const popularSlugs = [
      'viet-nam',
      'trung-quoc', 
      'han-quoc',
      'au-my',
      'nhat-ban',
      'thai-lan',
      'anh',
      'phap',
      'hong-kong',
      'dai-loan',
      'an-do',
      'canada'
    ];

    const popularCountries: Country[] = [];
    
    popularSlugs.forEach(slug => {
      const country = countries.find(c => c.slug === slug);
      if (country) {
        popularCountries.push(country);
      }
    });

    // Add remaining countries if we don't have enough popular ones
    if (popularCountries.length < 12) {
      const remainingCountries = countries.filter(
        country => !popularSlugs.includes(country.slug)
      );
      popularCountries.push(...remainingCountries.slice(0, 12 - popularCountries.length));
    }

    return popularCountries.slice(0, 12); // Return max 12 countries for navigation
  }
}

// Export singleton instance
export const metadataService = new MetadataService();
