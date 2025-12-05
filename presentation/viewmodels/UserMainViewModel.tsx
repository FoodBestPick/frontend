import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@env';

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
      // Fetch a large list to populate the main screen
      // In a real app, you might want a dedicated endpoint for "Home Screen Data"
      const response = await fetch(`${API_BASE_URL}/restaurant/search?size=100`); 
      const result = await response.json();

      if (result.code === 200) {
        const dataList = result.data;
        const mappedStores: Store[] = dataList.map((item: any) => ({
          id: item.id,
          name: item.name,
          image: item.images && item.images.length > 0 ? item.images : ['https://via.placeholder.com/150'], // Fallback image
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
