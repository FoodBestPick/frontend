export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  FindAccount: undefined;
  AdminMain: undefined;
  AdminRestaurantAdd:
  | undefined
  | {
    selectedLocation: {
      lat: number;
      lng: number;
      address: string;
    };
  };
  MapSelectScreen: undefined;
  UserMain: undefined;
  RouletteScreen: undefined;
  SearchScreen: undefined;
  SearchResult: {
    query: string;
    filters: FilterState;
  };
  RestaurantDetail: {
    restaurant: RestaurantItem;
  };
  MatchScreen: undefined;
  MyPageScreen: undefined;
  NotificationScreen: undefined;
  UserNotificationScreen: undefined;
};

export interface FilterState {
  location?: string;
  radius?: number;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  openNow?: boolean;
  parking?: boolean;
  delivery?: boolean;
}

export interface RestaurantItem {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  image: string;
  tags: string[];
}
