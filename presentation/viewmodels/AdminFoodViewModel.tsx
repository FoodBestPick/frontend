import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

interface Food {
  id: number;
  name: string;
}

// ✅ 임시 토큰 (개발용)
const TEMP_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.temporary-token-for-development';

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

      console.log('📡 API 호출:', `${API_BASE_URL}/food`);

      const response = await fetch(`${API_BASE_URL}/food`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📡 Response data:', result);

      if (result.code === 200) {
        setFoods(result.data || []);
        console.log('✅ 조회 성공:', result.data?.length || 0, '개');
      } else {
        setError(result.message || '대표메뉴를 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('❌ 대표메뉴 조회 오류:', err);
      console.error('❌ Error message:', err.message);

      if (err.message.includes('Network request failed')) {
        setError(
          '백엔드 서버에 연결할 수 없습니다.\nhttp://10.0.2.2:8080/food',
        );
      } else {
        setError('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const createFood = async (name: string) => {
    try {
      // ✅ 실제 토큰 또는 임시 토큰 사용
      let token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('⚠️ 저장된 토큰이 없어 임시 토큰 사용');
        token = TEMP_TOKEN;
      }

      console.log('📡 POST 요청:', `${API_BASE_URL}/food`);
      console.log('📡 Body:', { name });

      const response = await fetch(`${API_BASE_URL}/food`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      console.log('📡 POST Response status:', response.status);

      const result = await response.json();
      console.log('📡 POST Response:', result);

      if (result.code === 200) {
        console.log('✅ 추가 성공');
        return { success: true, message: '대표메뉴가 추가되었습니다.' };
      } else {
        console.log('❌ 추가 실패:', result.message);
        return {
          success: false,
          message: result.message || '추가에 실패했습니다.',
        };
      }
    } catch (error: any) {
      console.error('❌ 대표메뉴 추가 오류:', error);
      return { success: false, message: '추가 중 오류가 발생했습니다.' };
    }
  };

  const updateFood = async (id: number, name: string) => {
    try {
      let token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('⚠️ 저장된 토큰이 없어 임시 토큰 사용');
        token = TEMP_TOKEN;
      }

      console.log('📡 PUT 요청:', `${API_BASE_URL}/food/${id}`);
      console.log('📡 Body:', { name });

      const response = await fetch(`${API_BASE_URL}/food/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      console.log('📡 PUT Response status:', response.status);

      const result = await response.json();
      console.log('📡 PUT Response:', result);

      if (result.code === 200) {
        console.log('✅ 수정 성공');
        return { success: true, message: '대표메뉴가 수정되었습니다.' };
      } else {
        console.log('❌ 수정 실패:', result.message);
        return {
          success: false,
          message: result.message || '수정에 실패했습니다.',
        };
      }
    } catch (error: any) {
      console.error('❌ 대표메뉴 수정 오류:', error);
      return { success: false, message: '수정 중 오류가 발생했습니다.' };
    }
  };

  const deleteFood = async (id: number) => {
    try {
      let token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('⚠️ 저장된 토큰이 없어 임시 토큰 사용');
        token = TEMP_TOKEN;
      }

      console.log('📡 DELETE 요청:', `${API_BASE_URL}/food/${id}`);

      const response = await fetch(`${API_BASE_URL}/food/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📡 DELETE Response status:', response.status);

      const result = await response.json();
      console.log('📡 DELETE Response:', result);

      if (result.code === 200) {
        console.log('✅ 삭제 성공');
        return { success: true, message: '대표메뉴가 삭제되었습니다.' };
      } else {
        console.log('❌ 삭제 실패:', result.message);
        return {
          success: false,
          message: result.message || '삭제에 실패했습니다.',
        };
      }
    } catch (error: any) {
      console.error('❌ 대표메뉴 삭제 오류:', error);
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
