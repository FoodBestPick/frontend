export interface PieDataItem {
  name: string;
  population: number;
}

export interface AdminStats {
  code: number;
  message: string;
  data: {
    users: number;
    restaurants: number;
    todayReviews: number;
    weekReviews: number;
    monthReviews: number;

    allUserData: number[];
    allRestaurantData: number[];
    weekUserData: number[];
    barData: number[];
    pieData: PieDataItem[];
  }
}