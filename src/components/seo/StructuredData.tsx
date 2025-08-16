import { Movie, MovieDetail } from '@/types/movie';

interface WebsiteStructuredDataProps {
  url?: string;
}

interface MovieStructuredDataProps {
  movie: MovieDetail;
  url: string;
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function WebsiteStructuredData({ url = process.env.NEXT_PUBLIC_SITE_URL || 'https://thaihoc285.site' }: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Hehe Phim",
    "alternateName": "Hehe Phim - Xem Phim Online",
    "url": url,
    "description": "Website xem phim online miễn phí với chất lượng HD. Phim bộ, phim lẻ, hoạt hình mới nhất.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}/tim-kiem?keyword={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Hehe Phim",
      "url": url
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function MovieStructuredData({ movie, url }: MovieStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.name,
    "alternateName": movie.origin_name,
    "description": movie.content?.replace(/<[^>]*>/g, '') || `Xem phim ${movie.name} online miễn phí`,
    "image": movie.poster_url || movie.thumb_url,
    "url": url,
    "dateCreated": movie.year ? `${movie.year}-01-01` : undefined,
    "genre": movie.category?.map(cat => cat.name) || [],
    "countryOfOrigin": movie.country?.map(country => ({
      "@type": "Country",
      "name": country.name
    })) || [],
    "actor": movie.actor?.map(actor => ({
      "@type": "Person",
      "name": actor
    })) || [],
    "director": movie.director?.map(director => ({
      "@type": "Person",
      "name": director
    })) || [],
    "duration": movie.time || undefined,
    "aggregateRating": movie.tmdb?.vote_average ? {
      "@type": "AggregateRating",
      "ratingValue": movie.tmdb.vote_average,
      "ratingCount": movie.tmdb.vote_count || 1,
      "bestRating": 10,
      "worstRating": 1
    } : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "Hehe Phim",
      "url": process.env.NEXT_PUBLIC_SITE_URL || "https://thaihoc285.site"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function MovieListStructuredData({ movies, url }: { movies: Movie[], url: string }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": movies.slice(0, 10).map((movie, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Movie",
        "name": movie.name,
        "alternateName": movie.origin_name,
        "image": movie.poster_url || movie.thumb_url,
        "url": `${url}/phim/${movie.slug}`,
        "dateCreated": movie.year ? `${movie.year}-01-01` : undefined,
        "genre": movie.category?.map(cat => cat.name) || []
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
