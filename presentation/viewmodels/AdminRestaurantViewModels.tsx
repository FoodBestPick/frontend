import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@env';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../data/api/UserAuthApi';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  category: string;
  images?: string[];
}

export const useAdminRestaurantViewModel = () => {
  const { isLoggedIn } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async (searchKeyword?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (searchKeyword !== undefined) {
        setSelectedIds([]);
      }

      if (!isLoggedIn) {
        setError('로그인이 필요합니다.');
        return;
      }

      let url = `${API_BASE_URL}/restaurant`;
      if (searchKeyword) {
        url = `${API_BASE_URL}/restaurant/search?keyword=${encodeURIComponent(searchKeyword)}`;
      }

      const response = await authApi.get(url, {
        timeout: 10000,
      });

      const result = response.data;

      if (result.code === 200) {
        const content = result.data.content || result.data; 
        const mappedData = Array.isArray(content) ? content.map((item: any) => ({
          id: item.id,
          name: item.name,
          address: item.address,
          category: item.category || '미지정',
          images: item.images || (item.pictures ? item.pictures.map((p: any) => p.url) : []),
        })) : [];

        setRestaurants(mappedData);
      } else {
        setError(result.message || '맛집 목록을 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('맛집 목록 조회 오류:', err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const search = (text: string) => {
    setKeyword(text);
    fetchRestaurants(text);
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedIds.length === restaurants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(restaurants.map(r => r.id));
    }
  };

  const deleteRestaurant = async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isLoggedIn) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await authApi.delete(`${API_BASE_URL}/restaurant/${id}`, {
        timeout: 10000,
      });

      const result = response.data;

      if (result.code === 200) {
        await fetchRestaurants(); 
        return { success: true, message: '맛집이 삭제되었습니다.' };
      } else {
        return {
          success: false,
          message: result.message || '삭제에 실패했습니다.',
        };
      }
    } catch (error: any) {
      console.error('맛집 삭제 오류:', error);
      return { success: false, message: '삭제 중 오류가 발생했습니다.' };
    }
  };

  return {
    restaurants,
    loading,
    error,
    keyword,
    selectedIds,
    search,
    toggleSelection,
    selectAll,
    deleteRestaurant,
    refresh: fetchRestaurants,
  };
};
