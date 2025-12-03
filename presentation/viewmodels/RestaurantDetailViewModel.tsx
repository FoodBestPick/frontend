import { useState, useEffect } from 'react';
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
}

export const useRestaurantDetailViewModel = (restaurantId: number) => {
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurantDetail();
  }, [restaurantId]);

  const fetchRestaurantDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/restaurant/${restaurantId}`);
      const result = await response.json();

      if (result.code === 200) {
        const data = result.data;

        setRestaurant({
          id: data.id,
          name: data.name,
          address: data.address,
          // 백엔드 DTO의 category 필드 우선 사용
          category: data.category || (data.categories?.[0]?.name) || '카테고리 없음',
          description: data.description || data.introduce || '',
          latitude: parseFloat(data.latitude || '0'),
          longitude: parseFloat(data.longitude || '0'),
          // 백엔드 DTO의 images 필드 우선 사용
          images: data.images || (data.pictures ? data.pictures.map((p: any) => p.url) : []),
          // 메뉴 매핑 (price가 숫자여도 문자열로 변환하여 표시 가능)
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
          isFavorite: false, // 추후 API 연동 필요
          isLiked: false,    // 추후 API 연동 필요
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
  };

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
        method: restaurant?.isFavorite ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.code === 200) {
        await fetchRestaurantDetail(); // 상태 새로고침
        return {
          success: true,
          message: restaurant?.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가',
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
        method: restaurant?.isLiked ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.code === 200) {
        await fetchRestaurantDetail(); // 상태 새로고침
        return {
          success: true,
          message: restaurant?.isLiked ? '좋아요 취소' : '좋아요',
        };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error('좋아요 토글 오류:', error);
      return { success: false, message: '처리 중 오류가 발생했습니다.' };
    }
  };

  return {
    restaurant,
    loading,
    error,
    toggleFavorite,
    toggleLike,
    refresh: fetchRestaurantDetail,
  };
};
