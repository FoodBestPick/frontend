import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

interface Menu {
  id: number;
  name: string;
  price: string;
}

interface TimeData {
  week: string;
  startTime: string;
  endTime: string;
  restTime: string;
}

interface Review {
  id: number;
  userId: number;
  userNickname: string;
  userProfileImage: string;
  content: string;
  rating: number;
  images: string[];
  createdAt: string;
  isMine: boolean;
}

interface RestaurantDetail {
  id: number;
  name: string;
  address: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  images: string[];
  menus: Menu[];
  times: TimeData[];
  tags: string[];
  isFavorite: boolean;
  isLiked: boolean;
  reviews: Review[];
  reviewCount: number;
  averageRating: number;
}

export const useRestaurantDetailViewModel = (restaurantId: number) => {
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurantDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. 식당 상세 정보 조회
      const response = await fetch(`${API_BASE_URL}/restaurant/${restaurantId}`);
      const result = await response.json();

      if (result.code === 200) {
        const data = result.data;

        // 2. 리뷰 조회
        let reviews: Review[] = [];
        let reviewCount = 0;
        let averageRating = 0.0;

        try {
          const token = await AsyncStorage.getItem('accessToken');
          const reviewRes = await fetch(`${API_BASE_URL}/review/restaurant/${restaurantId}`, {
             headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          const reviewResult = await reviewRes.json();
          if (reviewResult.code === 200) {
            reviews = reviewResult.data.content;
            reviewCount = reviewResult.data.totalElements;
            // 평균 평점 계산 (백엔드에서 안주면 여기서 계산)
            if (reviews.length > 0) {
              const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
              averageRating = parseFloat((sum / reviews.length).toFixed(1));
            }
          }
        } catch (e) {
          console.error('리뷰 조회 실패', e);
        }

        // 3. 좋아요/즐겨찾기 상태 조회 (로그인 시)
        let isLiked = false;
        let isFavorite = false;
        const token = await AsyncStorage.getItem('accessToken');
        
        // TODO: 백엔드에 상태 조회 API가 없으므로, 일단 false로 둠.
        // 실제로는 GET /api/like/status/{id} 같은게 필요함.
        // 현재는 toggle만 구현되어 있어서 상태를 알 수 없음.
        // 임시로 로컬 상태나 별도 API가 필요하지만, 일단 false.

        setRestaurant({
          id: data.id,
          name: data.name,
          address: data.address,
          category: data.category || (data.categories?.[0]?.name) || '카테고리 없음',
          description: data.description || data.introduce || '',
          latitude: parseFloat(data.latitude || '0'),
          longitude: parseFloat(data.longitude || '0'),
          images: data.images || (data.pictures ? data.pictures.map((p: any) => p.url) : []),
          menus: data.menus ? data.menus.map((m: any) => ({
             id: m.id,
             name: m.name,
             price: m.price ? m.price.toString() : '0' 
          })) : [],
          times: data.times ? data.times.map((t: any) => ({
             week: t.week,
             startTime: t.startTime,
             endTime: t.endTime,
             restTime: t.restTime || ''
          })) : [],
          tags: data.tags ? data.tags.map((t: any) => t.name) : [],
          isFavorite: isFavorite,
          isLiked: isLiked,
          reviews: reviews,
          reviewCount: reviewCount,
          averageRating: averageRating,
        });
      } else {
        setError(result.message || '식당 정보를 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('식당 상세 조회 오류:', err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurantDetail();
  }, [fetchRestaurantDetail]);

  const toggleFavorite = async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await fetch(`${API_BASE_URL}/favorite/${restaurantId}`, {
        method: 'POST', // Toggle 방식
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.code === 200) {
        // 상태 반전
        setRestaurant(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
        return {
          success: true,
          message: !restaurant?.isFavorite ? '즐겨찾기 추가' : '즐겨찾기 해제',
        };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error('즐겨찾기 토글 오류:', error);
      return { success: false, message: '처리 중 오류가 발생했습니다.' };
    }
  };

  const toggleLike = async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await fetch(`${API_BASE_URL}/like/${restaurantId}`, {
        method: 'POST', // Toggle 방식
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.code === 200) {
        setRestaurant(prev => prev ? { ...prev, isLiked: !prev.isLiked } : null);
        return {
          success: true,
          message: !restaurant?.isLiked ? '좋아요' : '좋아요 취소',
        };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error('좋아요 토글 오류:', error);
      return { success: false, message: '처리 중 오류가 발생했습니다.' };
    }
  };

  const deleteReview = async (reviewId: number): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/review/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.code === 200) {
        await fetchRestaurantDetail(); // 목록 갱신
        return true;
      }
      return false;
    } catch (error) {
      console.error('리뷰 삭제 오류:', error);
      return false;
    }
  };

  return {
    restaurant,
    loading,
    error,
    toggleFavorite,
    toggleLike,
    deleteReview,
    refresh: fetchRestaurantDetail,
  };
};
