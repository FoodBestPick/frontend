import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@env';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../data/api/UserAuthApi';

interface Food {
  id: number;
  name: string;
}

export const useAdminFoodViewModel = () => {
  const { isLoggedIn } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApi.get(`${API_BASE_URL}/food`, {
        timeout: 10000,
      });
      const result = response.data;

      if (result.code === 200) {
        setFoods(result.data);
      } else {
        setError(result.message || '음식 카테고리를 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('음식 조회 오류:', err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const createFood = async (name: string) => {
    try {
      if (!isLoggedIn) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await authApi.post(`${API_BASE_URL}/food`, { name }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const result = response.data;

      if (result.code === 200) {
        await fetchFoods();
        return { success: true, message: '음식 카테고리가 추가되었습니다.' };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error('음식 추가 오류:', error);
      return { success: false, message: '추가 중 오류가 발생했습니다.' };
    }
  };

  const updateFood = async (id: number, name: string) => {
    try {
      if (!isLoggedIn) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await authApi.put(`${API_BASE_URL}/food/${id}`, { name }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const result = response.data;

      if (result.code === 200) {
        await fetchFoods();
        return { success: true, message: '음식 카테고리가 수정되었습니다.' };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error('음식 수정 오류:', error);
      return { success: false, message: '수정 중 오류가 발생했습니다.' };
    }
  };

  const deleteFood = async (id: number) => {
    try {
      if (!isLoggedIn) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await authApi.delete(`${API_BASE_URL}/food/${id}`, {
        timeout: 10000,
      });

      const result = response.data;

      if (result.code === 200) {
        await fetchFoods();
        return { success: true, message: '음식 카테고리가 삭제되었습니다.' };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error('음식 삭제 오류:', error);
      return { success: false, message: '삭제 중 오류가 발생했습니다.' };
    }
  };

  return {
    foods,
    loading,
    error,
    createFood,
    updateFood,
    deleteFood,
    refresh: fetchFoods,
  };
};