import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

interface TagItem {
  id: number;
  name: string;
  category: string;
}

interface CategoryOption {
  id: number;
  name: string;
}

interface MenuData {
  menu_name: string;
  menu_price: string;
}

interface RestaurantCreateData {
  restaurant_name: string;
  restaurant_introduce: string;
  restaurant_address: string;
  restaurant_latitude: string;
  restaurant_longitude: string;
  restaurant_category: string;
  menus: MenuData[];
  tags: string[];
}

export const useAdminRestaurantAddViewModel = () => {
  const [purposeTags, setPurposeTags] = useState<TagItem[]>([]);
  const [atmosphereTags, setAtmosphereTags] = useState<TagItem[]>([]);
  const [facilityTags, setFacilityTags] = useState<TagItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. 태그 조회
      const tagResponse = await fetch(`${API_BASE_URL}/tag`);
      const tagResult = await tagResponse.json();

      if (tagResult.code === 200) {
        const tags = tagResult.data as TagItem[];
        setPurposeTags(tags.filter(t => t.category === 'PURPOSE'));
        setAtmosphereTags(tags.filter(t => t.category === 'ATMOSPHERE'));
        setFacilityTags(tags.filter(t => t.category === 'FACILITY'));
      }

      // 2. 카테고리 조회
      const foodResponse = await fetch(`${API_BASE_URL}/food`);
      const foodResult = await foodResponse.json();

      if (foodResult.code === 200) {
        setCategories(foodResult.data);
      }
    } catch (err: any) {
      console.error('초기 데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const createRestaurant = async (
    data: RestaurantCreateData,
    imageFiles: any[],
  ): Promise<{ success: boolean; message: string; restaurantId?: number }> => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      let uploadedUrls: string[] = [];

      // 1단계: 이미지 업로드
      if (imageFiles.length > 0) {
        const imageFormData = new FormData();
        imageFiles.forEach(file => {
          imageFormData.append('files', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || 'image.jpg',
          } as any);
        });

        const s3Response = await fetch(`${API_BASE_URL}/upload/s3`, {
          method: 'POST',
          body: imageFormData,
        });

        const s3Result = await s3Response.json();
        if (s3Result.code === 200 && s3Result.data) {
          uploadedUrls = s3Result.data;
        }
      }

      // 2단계: FormData 생성
      const formData = new FormData();
      formData.append('restaurant_name', data.restaurant_name);
      formData.append('restaurant_introduce', data.restaurant_introduce || '');
      formData.append('restaurant_address', data.restaurant_address);
      formData.append('restaurant_latitude', data.restaurant_latitude);
      formData.append('restaurant_longitude', data.restaurant_longitude);
      formData.append('restaurant_category', data.restaurant_category || '');

      // 메뉴 추가
      data.menus.forEach(menu => {
        formData.append(
          'menus',
          JSON.stringify({
            menu_name: menu.menu_name,
            menu_price: menu.menu_price ? parseInt(menu.menu_price) : null,
          }),
        );
      });

      // 태그 추가
      data.tags.forEach(tag => {
        formData.append('tags', tag);
      });

      // 3단계: 레스토랑 등록
      const response = await fetch(`${API_BASE_URL}/restaurant`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.code === 200) {
        // 4단계: 이미지 URL DB 저장
        if (uploadedUrls.length > 0 && result.data?.id) {
          await fetch(`${API_BASE_URL}/restaurant/${result.data.id}/pictures`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(uploadedUrls),
          });
        }

        return {
          success: true,
          message: '맛집이 성공적으로 등록되었습니다.',
          restaurantId: result.data?.id,
        };
      } else {
        return {
          success: false,
          message: result.message || '등록에 실패했습니다.',
        };
      }
    } catch (error: any) {
      console.error('맛집 등록 오류:', error);
      return {
        success: false,
        message: error.message || '등록 중 문제가 발생했습니다.',
      };
    }
  };

  return {
    purposeTags,
    atmosphereTags,
    facilityTags,
    categories,
    loading,
    error,
    createRestaurant,
    refresh: loadInitialData,
  };
};
