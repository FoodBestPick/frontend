import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@env';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../data/api/UserAuthApi';

interface Tag {
  id: number;
  name: string;
  category: string;
}

// ✅ 카테고리별 접두사 정의
export const TAG_PREFIXES = {
  PURPOSE: '#', // 목적
  FACILITY: '$', // 편의시설
  ATMOSPHERE: '@', // 분위기
} as const;

export const useAdminTagViewModel = () => {
  const { isLoggedIn } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApi.get(`${API_BASE_URL}/tag`, {
        timeout: 10000,
      });
      const result = response.data;

      if (result.code === 200) {
        setTags(result.data);
      } else {
        setError(result.message || '태그를 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('태그 조회 오류:', err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (name: string, category: string) => {
    try {
      if (!isLoggedIn) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await authApi.post(`${API_BASE_URL}/tag`, { name, category }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const result = response.data;

      if (result.code === 200) {
        await fetchTags(); 
        return { success: true, message: '태그가 추가되었습니다.' };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error('태그 추가 오류:', error);
      return { success: false, message: '추가 중 오류가 발생했습니다.' };
    }
  };

  const updateTag = async (id: number, name: string, category: string) => {
    try {
      if (!isLoggedIn) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await authApi.put(`${API_BASE_URL}/tag/${id}`, { name, category }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const result = response.data;

      if (result.code === 200) {
        await fetchTags(); 
        return { success: true, message: '태그가 수정되었습니다.' };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error('태그 수정 오류:', error);
      return { success: false, message: '수정 중 오류가 발생했습니다.' };
    }
  };

  const deleteTag = async (id: number) => {
    try {
      if (!isLoggedIn) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const response = await authApi.delete(`${API_BASE_URL}/tag/${id}`, {
        timeout: 10000,
      });

      const result = response.data;

      if (result.code === 200) {
        await fetchTags(); 
        return { success: true, message: '태그가 삭제되었습니다.' };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error('태그 삭제 오류:', error);
      return { success: false, message: '삭제 중 오류가 발생했습니다.' };
    }
  };

  return {
    tags,
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
    refresh: fetchTags,
  };
};