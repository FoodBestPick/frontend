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
        selectedLocation?: {
          lat: number;
          lng: number;
          address: string;
        };
        id?: number;
      };
  MapSelectScreen: undefined;
  AdminManageSelect: undefined;
  AdminFoodManage: undefined;
  AdminTagManage: undefined;

  UserMain: undefined;
  RouletteScreen: undefined;
  SearchScreen: undefined;
  SearchResult: {
    keyword: string;
    category?: string;
    tags?: string[];
    filters?: FilterState;
  };
  RestaurantDetail: {
    restaurantId: number;
  };
  MatchScreen: undefined;
  MyPageScreen: undefined;
  NotificationScreen: undefined;
  UserNotificationScreen: undefined;
  MatchingSetupScreen: undefined;
  MatchingFindingScreen: {
    food: string;
    size: number;
  };
  ChatRoomScreen: {
    roomTitle: string;
    peopleCount: number;
  };
  ReviewWrite: {
    restaurantId: number;
    restaurantName: string;
    review?: {
      id: number;
      content: string;
      rating: number;
      images: string[];
    };
  };
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
