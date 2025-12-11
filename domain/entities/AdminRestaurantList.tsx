export interface AdminRestaurant {
  id: number;
  name: string;
  rating: number;
  review: number;
  status?: string; 
  image: any; 
}

export interface AdminRestaurantList {
  code: number;
  message: string;
  data: AdminRestaurant[];
  page: number;
  size: number;
  totalPages: number;
}