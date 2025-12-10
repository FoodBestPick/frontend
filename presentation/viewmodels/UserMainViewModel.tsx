import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@env';
import axios from 'axios';

export interface Store {
  id: number;
  name: string;
  image: string[];
  rating: number;
  reviews: number;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
}

export const useUserMainViewModel = () => {
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [groupedStores, setGroupedStores] = useState<Record<string, Store[]>>({});
  const [loading, setLoading] = useState(false);

  const fetchAllRestaurants = async () => {
    try {
      setLoading(true);
      console.log(`Fetching restaurants from: ${API_BASE_URL}/restaurant/search?size=20`);
      
      // axios를 사용하여 타임아웃 설정 및 에러 핸들링 강화
      const response = await axios.get(`${API_BASE_URL}/restaurant/search`, {
        params: { size: 20 }, // 데이터 크기를 줄여서 테스트 (100 -> 20)
        timeout: 10000, // 10초 타임아웃
      });

      const result = response.data;

      if (result.code === 200) {
        const dataList = result.data;
        const mappedStores: Store[] = dataList.map((item: any) => ({
          id: item.id,
          name: item.name,
          image: item.images && item.images.length > 0 ? item.images : ['https://via.placeholder.com/150'],
          rating: item.averageRating || 0.0,
          reviews: item.reviewCount || 0,
          category: item.category || '미지정',
          address: item.address || '',
          latitude: item.latitude ? parseFloat(item.latitude) : 0,
          longitude: item.longitude ? parseFloat(item.longitude) : 0,
        }));

        setAllStores(mappedStores);
        groupStoresByCategory(mappedStores);
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupStoresByCategory = (stores: Store[]) => {
    const grouped: Record<string, Store[]> = {};
    stores.forEach(store => {
      const cat = store.category;
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(store);
    });
    setGroupedStores(grouped);
  };

  const getStoresByCategory = (category: string): Store[] => {
    if (category === '전체') return allStores;
    // If we have the data in allStores, filter it. 
    // If we needed pagination for categories, we would fetch here.
    // For now, filtering client-side is consistent with the "All" view logic.
    return allStores.filter(s => s.category === category).sort((a, b) => b.rating - a.rating);
  };

  useEffect(() => {
    fetchAllRestaurants();
  }, []);

  return {
    allStores,
    groupedStores,
    loading,
    getStoresByCategory,
    refresh: fetchAllRestaurants
  };
};
