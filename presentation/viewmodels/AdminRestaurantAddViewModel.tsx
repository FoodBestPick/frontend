import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@env';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

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

interface TimeData {
  week: string;
  startTime: string;
  endTime: string;
  restTime: string;
}

// [수정 1] 필수 항목 외에는 ?(Optional) 처리하여 선택 사항으로 변경
interface RestaurantCreateData {
  restaurant_name: string;       // 필수
  restaurant_address: string;    // 필수
  restaurant_latitude?: string;   // 필수
  restaurant_longitude?: string;  // 필수
  restaurant_introduce?: string; // 선택
  restaurant_category?: string;  // 선택
  menus?: MenuData[];            // 선택
  times?: TimeData[];            // 선택
  tags?: string[];               // 선택
}

export const useAdminRestaurantAddViewModel = () => {
  const { token } = useAuth();
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

      // 1. 태그 조회 (카테고리별)
      const purposeResponse = await axios.get(`${API_BASE_URL}/tag/category/PURPOSE`, { timeout: 10000 });
      const facilityResponse = await axios.get(`${API_BASE_URL}/tag/category/FACILITY`, { timeout: 10000 });
      const atmosphereResponse = await axios.get(`${API_BASE_URL}/tag/category/ATMOSPHERE`, { timeout: 10000 });

      const purposeResult = purposeResponse.data;
      const facilityResult = facilityResponse.data;
      const atmosphereResult = atmosphereResponse.data;

      if (purposeResult.code === 200) setPurposeTags(purposeResult.data);
      if (facilityResult.code === 200) setFacilityTags(facilityResult.data);
      if (atmosphereResult.code === 200) setAtmosphereTags(atmosphereResult.data);

      // 2. 카테고리 조회
      const foodResponse = await axios.get(`${API_BASE_URL}/food`, { timeout: 10000 });
      const foodResult = foodResponse.data;

      if (foodResult.code === 200) setCategories(foodResult.data);
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
      if (!token) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      let uploadedUrls: string[] = [];

      // 1단계: 이미지 업로드 (S3)
      if (imageFiles && imageFiles.length > 0) {
        console.log('Step 1: Uploading images to S3 via Axios...');
        const imageFormData = new FormData();
        imageFiles.forEach(file => {
          imageFormData.append('files', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || 'image.jpg',
          } as any);
        });

        try {
          const s3Response = await axios.post(`${API_BASE_URL}/upload/s3`, imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
            transformRequest: (data) => data, // FormData 변형 방지
          });

          const s3Result = s3Response.data;
          if (s3Result.code === 200 && s3Result.data) {
            uploadedUrls = s3Result.data;
            console.log('Step 1: Image upload success', uploadedUrls);
          }
        } catch (s3Error: any) {
          console.error('S3 Upload Error:', s3Error);
        }
      }

      // 2단계: FormData 생성
      console.log('Step 2: Creating FormData for Restaurant...');
      const formData = new FormData();
      
      formData.append('restaurant_name', data.restaurant_name);
      formData.append('restaurant_address', data.restaurant_address);
      if (data.restaurant_latitude) formData.append('restaurant_latitude', data.restaurant_latitude);
      if (data.restaurant_longitude) formData.append('restaurant_longitude', data.restaurant_longitude);

      if (data.restaurant_introduce && data.restaurant_introduce.trim() !== '') {
        formData.append('restaurant_introduce', data.restaurant_introduce);
      }

      if (data.restaurant_category && data.restaurant_category.trim() !== '') {
        formData.append('categories', JSON.stringify([data.restaurant_category]));
      }

      if (data.menus && data.menus.length > 0) {
        const validMenus = data.menus
          .filter(menu => menu.menu_name && menu.menu_name.trim() !== '')
          .map(menu => ({
            menu_name: menu.menu_name,
            menu_price: menu.menu_price ? parseInt(menu.menu_price, 10) : 0,
          }));

        if (validMenus.length > 0) {
          formData.append('menus', JSON.stringify(validMenus));
        }
      }

      if (data.times && data.times.length > 0) {
        const validTimes = data.times.filter(t => t.week && t.startTime && t.endTime);
        if (validTimes.length > 0) {
          formData.append('times', JSON.stringify(validTimes));
        }
      }

      if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => {
          formData.append('tags', tag);
        });
      }

      // 3단계: 레스토랑 등록 (Axios)
      console.log('Step 3: Sending restaurant data via Axios...');
      
      const response = await axios.post(`${API_BASE_URL}/restaurant`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        transformRequest: (data) => data, // FormData 변형 방지
      });

      const result = response.data;
      console.log('Step 3: Restaurant creation success', result);

      if (result.code === 200) {
        // 4단계: 이미지 URL DB 저장
        if (uploadedUrls.length > 0 && result.data?.id) {
          console.log('Step 4: Saving image URLs...', uploadedUrls);
          try {
            const pictureResponse = await axios.post(
              `${API_BASE_URL}/restaurant/${result.data.id}/pictures`, 
              uploadedUrls, 
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            console.log('Step 4: Picture save response', pictureResponse.data);
          } catch (picError: any) {
            console.error('Step 4: Picture save failed', picError);
            // 이미지 저장 실패는 전체 실패로 간주하지 않음 (선택 사항)
          }
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
    } catch (err: any) {
      console.error('맛집 등록 오류 (Axios):', err);
      if (err.response) {
        console.error('Error Response:', err.response.data);
      }
      return {
        success: false,
        message: err.message || '등록 중 문제가 발생했습니다.',
      };
    }
  };

  const getRestaurantDetail = async (id: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurant/${id}`, {
        timeout: 10000,
      });
      const result = response.data;
      if (result.code === 200) {
        const data = result.data;
        // [수정] 태그 데이터 형식 변환 (TagResponse[] -> string[])
        if (data.tags && Array.isArray(data.tags)) {
          console.log('Original Tags:', data.tags);
          if (data.tags.length > 0 && data.tags[0].name) {
            data.tags = data.tags.map((t: any) => t.name);
          }
          console.log('Mapped Tags:', data.tags);
        }
        return data;
      }
      return null;
    } catch (e) {
      console.error('맛집 상세 조회 실패:', e);
      return null;
    }
  };

  const updateRestaurant = async (
    id: number,
    data: RestaurantCreateData,
    imageFiles: any[],
  ): Promise<{ success: boolean; message: string }> => {
    try {
      let uploadedUrls: string[] = [];

      // 1. 새 이미지 업로드
      if (imageFiles && imageFiles.length > 0) {
        const newFiles = imageFiles.filter(f => !f.uri.startsWith('http'));
        
        if (newFiles.length > 0) {
          console.log('Update Step 1: Uploading new images via Axios...');
          const imageFormData = new FormData();
          newFiles.forEach(file => {
            imageFormData.append('files', {
              uri: file.uri,
              type: file.type || 'image/jpeg',
              name: file.fileName || 'image.jpg',
            } as any);
          });

          const s3Response = await axios.post(`${API_BASE_URL}/upload/s3`, imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
            transformRequest: (data) => data,
          });
          
          const s3Result = s3Response.data;
          if (s3Result.code === 200 && s3Result.data) {
            uploadedUrls = s3Result.data;
          }
        }
      }

      // 2. 기본 정보 업데이트 (PUT)
      console.log('Update Step 2: Creating FormData...');
      const formData = new FormData();
      formData.append('restaurant_name', data.restaurant_name);
      formData.append('restaurant_address', data.restaurant_address);
      if (data.restaurant_latitude) formData.append('restaurant_latitude', data.restaurant_latitude);
      if (data.restaurant_longitude) formData.append('restaurant_longitude', data.restaurant_longitude);
      if (data.restaurant_introduce) formData.append('restaurant_introduce', data.restaurant_introduce);
      if (data.restaurant_category) formData.append('categories', JSON.stringify([data.restaurant_category]));
      
      if (data.menus && data.menus.length > 0) {
        const validMenus = data.menus
          .filter(menu => menu.menu_name && menu.menu_name.trim() !== '')
          .map(menu => ({
            menu_name: menu.menu_name,
            menu_price: menu.menu_price ? parseInt(menu.menu_price, 10) : 0,
          }));

        if (validMenus.length > 0) {
          formData.append('menus', JSON.stringify(validMenus));
        }
      }

      if (data.times && data.times.length > 0) {
        const validTimes = data.times.filter(t => t.week && t.startTime && t.endTime);
        if (validTimes.length > 0) {
          formData.append('times', JSON.stringify(validTimes));
        }
      }

      if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => {
          formData.append('tags', tag);
        });
      }

      console.log('Update Step 3: Sending PUT request via Axios...');
      const response = await axios.put(`${API_BASE_URL}/restaurant/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        transformRequest: (data) => data,
      });

      const result = response.data;
      console.log('Update Step 3: Success', result);

      if (result.code === 200) {
        // 3. 새 이미지 URL DB 저장
        if (uploadedUrls.length > 0) {
          console.log('Update Step 4: Saving new image URLs...', uploadedUrls);
          try {
            const pictureResponse = await axios.post(
              `${API_BASE_URL}/restaurant/${id}/pictures`, 
              uploadedUrls, 
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            console.log('Update Step 4: Picture save response', pictureResponse.data);
          } catch (picError: any) {
            console.error('Update Step 4: Picture save failed', picError);
          }
        }
        return { success: true, message: '맛집 정보가 수정되었습니다.' };
      } else {
        return { success: false, message: result.message || '수정에 실패했습니다.' };
      }
    } catch (err: any) {
      console.error('맛집 수정 오류 (Axios):', err);
      if (err.response) {
        console.error('Error Response:', err.response.data);
      }
      return { success: false, message: err.message || '수정 중 문제가 발생했습니다.' };
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
    updateRestaurant,
    getRestaurantDetail,
    refresh: loadInitialData,
  };
};
