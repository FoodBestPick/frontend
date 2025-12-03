import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

interface Food {
  id: number;
  name: string;
}

export const useAdminFoodViewModel = () => {
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

      const response = await fetch(`${API_BASE_URL}/food`);
      const result = await response.json();

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
      const token = await AsyncStorage.getItem('accessToken');

      const response = await fetch(`${API_BASE_URL}/food`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();

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
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await fetch(`${API_BASE_URL}/food/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();

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
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await fetch(`${API_BASE_URL}/food/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

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
