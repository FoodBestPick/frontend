import { useState } from 'react';
import { API_BASE_URL } from '@env';
import axios from 'axios';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  category: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviews?: number;
}

export const useSearchViewModel = () => {
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'review'>('rating');

  const searchRestaurants = async (
    keyword?: string,
    category?: string,
    tags?: string[],
    filters?: any, // { priceMin, priceMax }
    sort?: 'rating' | 'review'
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // ✅ 통합 검색 엔드포인트 사용
      const url = `${API_BASE_URL}/restaurant/search`;
      const params = new URLSearchParams();

      if (keyword) params.append('keyword', keyword);
      if (category) params.append('category', category);
      if (tags && tags.length > 0) {
        tags.forEach(t => params.append('tags', t));
      }
      if (filters?.priceMin) params.append('minPrice', filters.priceMin.toString());
      if (filters?.priceMax) params.append('maxPrice', filters.priceMax.toString());
      if (filters?.rating) params.append('minRating', filters.rating.toString());
      if (filters?.openNow) params.append('openNow', 'true');
      
      // 정렬 파라미터 추가 (함수 인자로 받거나 상태값 사용)
      const sortValue = sort || sortBy;
      params.append('sort', sortValue);

      const queryString = params.toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;

      console.log('Searching URL:', fullUrl);

      // axios로 변경 및 타임아웃 설정
      const response = await axios.get(fullUrl, { timeout: 10000 });
      const result = response.data;

      if (result.code === 200) {
        // 백엔드에서 List<RestaurantResponse> 반환
        const dataList = result.data;

        const mappedResults = Array.isArray(dataList)
          ? dataList.map((item: any) => ({
              id: item.id,
              name: item.name,
              address: item.address,
              // DTO의 category 필드 사용 (없으면 categories 배열 첫번째)
              category: item.category || (item.categories?.[0]?.name) || '미지정',
              // DTO의 images 필드 사용 (없으면 pictures 배열 매핑)
              images: item.images || (item.pictures ? item.pictures.map((p: any) => p.url) : []),
              latitude: item.latitude ? parseFloat(item.latitude) : 0,
              longitude: item.longitude ? parseFloat(item.longitude) : 0,
              rating: item.averageRating || 0.0,
              reviews: item.reviewCount || 0,
            }))
          : [];

        setResults(mappedResults);
      } else {
        setError(result.message || '검색에 실패했습니다.');
        setResults([]);
      }
    } catch (err: any) {
      console.error('검색 오류:', err);
      setError('검색 중 오류가 발생했습니다.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    sortBy,
    setSortBy,
    searchRestaurants,
    clearResults,
  };
};
