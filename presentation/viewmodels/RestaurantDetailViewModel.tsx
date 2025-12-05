import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@env';
import { useAuth } from '../../context/AuthContext';

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
  const { token } = useAuth();
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
        // 백엔드에서 제공하는 값 우선 사용, 없으면 0
        let reviewCount = data.reviewCount || 0;
        let averageRating = data.averageRating || 0.0;

        try {
          const reviewRes = await fetch(`${API_BASE_URL}/api/review/restaurant/${restaurantId}`, {
             headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          const reviewResult = await reviewRes.json();
          if (reviewResult.code === 200) {
            // 백엔드에서 isMine이 mine으로 올 수도 있으므로 매핑 처리
            reviews = reviewResult.data.content.map((r: any) => ({
              ...r,
              isMine: r.isMine !== undefined ? r.isMine : (r.mine !== undefined ? r.mine : false),
              isLiked: r.isLiked || false,
              likeCount: r.likeCount || 0
            }));
            
            // 만약 백엔드 RestaurantResponse에 값이 없다면 리뷰 목록에서 계산 (fallback)
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

        // 3. 좋아요/즐겨찾기 상태 조회 (로그인 시)
        let isLiked = false;
        let isFavorite = false;
        
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
  }, [restaurantId, token]);

  useEffect(() => {
    fetchRestaurantDetail();
  }, [fetchRestaurantDetail]);

  const toggleFavorite = async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      if (!token) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await fetch(`${API_BASE_URL}/api/favorite/${restaurantId}`, {
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
      if (!token) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await fetch(`${API_BASE_URL}/api/like/${restaurantId}`, {
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
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/api/review/${reviewId}`, {
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

  const toggleReviewLike = async (reviewId: number): Promise<boolean> => {
    try {
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/api/review/${reviewId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.code === 200) {
        // 로컬 상태 업데이트 (낙관적 업데이트)
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

  return {
    restaurant,
    loading,
    error,
    toggleFavorite,
    toggleLike,
    deleteReview,
    toggleReviewLike,
    refresh: fetchRestaurantDetail,
  };
};
