export interface AdminDetailStatResponse {
  visitors: number; 
  joins: number; 
  restaurants: number; 
  reviews: number;

  visitorRate: number; 
  joinRate: number; 
  restaurantRate: number; 
  reviewRate: number; 

  timeSeries: number[]; 
  categories: Record<string, number>; 

  ratingDistribution: number[]; 
  topSearches: SearchRank[]; 
  pie?: { name: string; population: number }[];
}

export interface SearchRank {
  term: string; 
  count: number; 
}

export interface AdminDetailStats {
  code: number;
  message: string;
  data: {
    today: AdminDetailStatResponse;
    week: AdminDetailStatResponse;
    month: AdminDetailStatResponse;
    custom : AdminDetailStatResponse;
  };
}