import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@env';
import { useAuth } from '../../context/AuthContext';
import { ReportApi } from '../../data/api/ReportApi';
import { Alert } from 'react-native';
import { authApi } from '../../data/api/UserAuthApi';

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
  isLiked: boolean;
  likeCount: number;
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
  const { isLoggedIn } = useAuth(); // token 대신 isLoggedIn 사용 권장
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurantDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 0. 조회수 증가 (비동기 처리, 결과 기다리지 않음)
      authApi.post(`${API_BASE_URL}/restaurant/${restaurantId}/view`, {}).catch(err => console.log('View count increment failed', err));

      // 1. 식당 상세 정보 조회
      const response = await authApi.get(`${API_BASE_URL}/restaurant/${restaurantId}`, {
        timeout: 10000,
      });
      const result = response.data;

      if (result.code === 200) {
        const data = result.data;

        // 2. 리뷰 조회
        let reviews: Review[] = [];
        let reviewCount = data.reviewCount || 0;
        let averageRating = data.averageRating || 0.0;

        try {
          const reviewRes = await authApi.get(`${API_BASE_URL}/api/review/restaurant/${restaurantId}`, {
             timeout: 10000,
          });
          const reviewResult = reviewRes.data;
          if (reviewResult.code === 200) {
            reviews = reviewResult.data.content.map((r: any) => ({
              ...r,
              isMine: r.isMine !== undefined ? r.isMine : (r.mine !== undefined ? r.mine : false),
              isLiked: r.isLiked || false,
              likeCount: r.likeCount || 0
            }));
            
            if (reviewCount === 0 && reviewResult.data.totalElements > 0) {
                reviewCount = reviewResult.data.totalElements;
            }
            if (averageRating === 0.0 && reviews.length > 0) {
               const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
               averageRating = parseFloat((sum / reviews.length).toFixed(1));
            }
          }
        } catch (e) {
          console.error('리뷰 조회 실패', e);
        }

        let isLiked = data.isLiked || false;
        let isFavorite = isLiked;

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
      if (!isLoggedIn) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await authApi.post(`${API_BASE_URL}/api/favorite/${restaurantId}`, {}, {
        timeout: 10000,
      });

      const result = response.data;

      if (result.code === 200) {
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
      if (!isLoggedIn) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await authApi.post(`${API_BASE_URL}/api/like/${restaurantId}`, {}, {
        timeout: 10000,
      });

      const result = response.data;

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
      if (!isLoggedIn) return false;

      const response = await authApi.delete(`${API_BASE_URL}/api/review/${reviewId}`, {
        timeout: 10000,
      });

      const result = response.data;
      if (result.code === 200) {
        await fetchRestaurantDetail(); 
        return true;
      }
      return false;
    } catch (error) {
      console.error('리뷰 삭제 오류:', error);
      return false;
    }
  };

  const toggleReviewLike = async (reviewId: number): Promise<boolean> => {
    try {
      if (!isLoggedIn) return false;

      const response = await authApi.post(`${API_BASE_URL}/api/review/${reviewId}/like`, {}, {
        timeout: 10000,
      });

      const result = response.data;
      if (result.code === 200) {
        setRestaurant(prev => {
          if (!prev) return null;
          const updatedReviews = prev.reviews.map(r => {
            if (r.id === reviewId) {
              return {
                ...r,
                isLiked: !r.isLiked,
                likeCount: r.isLiked ? r.likeCount - 1 : r.likeCount + 1
              };
            }
            return r;
          });
          return { ...prev, reviews: updatedReviews };
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('리뷰 좋아요 오류:', error);
      return false;
    }
  };

  const reportRestaurant = async (reason: string, reasonDetail: string) => {
    if (!isLoggedIn || !restaurant) return;
    try {
      const result = await ReportApi.sendReport({
        targetType: 'RESTAURANT',
        targetId: restaurant.id,
        reason,
        reasonDetail,
      });
      if (result.code === 200) {
        Alert.alert('알림', '신고가 접수되었습니다.');
      } else {
        Alert.alert('오류', result.message || '신고 접수에 실패했습니다.');
      }
    } catch (error) {
      console.error('신고 오류:', error);
      Alert.alert('오류', '신고 중 문제가 발생했습니다.');
    }
  };

  const reportReview = async (reviewId: number, reason: string, reasonDetail: string) => {
    if (!isLoggedIn) return;
    try {
      const result = await ReportApi.sendReport({
        targetType: 'REVIEW',
        targetId: reviewId,
        reason,
        reasonDetail,
      });
      if (result.code === 200) {
        Alert.alert('알림', '리뷰 신고가 접수되었습니다.');
      } else {
        Alert.alert('오류', result.message || '신고 접수에 실패했습니다.');
      }
    } catch (err) {
      console.error('리뷰 신고 오류:', err);
      Alert.alert('오류', '신고 중 문제가 발생했습니다.');
    }
  };

  return {
    restaurant,
    loading,
    error,
    toggleFavorite,
    toggleLike,
    deleteReview,
    toggleReviewLike,
    refresh: fetchRestaurantDetail,
    reportRestaurant,
    reportReview,
  };
};
