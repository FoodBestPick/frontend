import { AdminUser, AdminUserList } from "../../domain/entities/AdminUserList";
import axios from "axios";
import { LOCAL_HOST } from "@env";

export const AdminApi = {
  async getStats() {
    return Promise.resolve({
      code: 200,
      message: "성공적으로 처리되었습니다.",
      data: {
        users: 8542,
        restaurants: 1234,
        todayReviews: 60,
        weekReviews: 342,
        monthReviews: 1428,

        allUserData: [2300, 2450, 2600, 2800, 2950, 2900, 2750],
        allRestaurantData: [950, 1000, 1050, 1100, 1150, 1200, 1234],
        weekUserData: [300, 350, 400, 450, 500, 550, 600],
        barData: [50, 60, 70, 65, 80, 90, 70],
        pieData: [
          { name: "한식", population: 40 },
          { name: "중식", population: 20 },
          { name: "일식", population: 15 },
          { name: "양식", population: 10 },
          { name: "카페", population: 15 },
        ],
      },
    });
  },

  async getDetailStats() {
    return Promise.resolve({
      code: 200,
      message: "성공적으로 처리되었습니다.",
      data: {
        today: {
          visitors: 1230,
          joins: 58,
          restaurants: 12,
          reviews: 150,
          visitorRate: 5.2,
          joinRate: 8.1,
          restaurantRate: -3.2,
          reviewRate: 12.5,
          timeSeries: [18, 32, 54, 20],
          categories: {
            한식: 50,
            중식: 25,
            일식: 15,
            양식: 5,
            기타: 5,
          },
          ratingDistribution: [8, 14, 30, 45, 55],
          topSearches: [
            { term: "마라탕", count: 1250 },
            { term: "강남역 맛집", count: 980 },
            { term: "성수동 카페", count: 870 },
            { term: "홍대 파스타", count: 760 },
            { term: "잠실 롯데월드몰", count: 650 },
          ],
          pie: [
            { name: "검색", population: 40 },
            { name: "SNS", population: 25 },
            { name: "광고", population: 20 },
            { name: "기타", population: 15 },
          ],
        },

        week: {
          visitors: 1240,
          joins: 82,
          restaurants: 56,
          reviews: 248,
          visitorRate: 12.5,
          joinRate: 5.2,
          restaurantRate: -2.1,
          reviewRate: 8.7,
          timeSeries: [30, 55, 45, 50, 32, 20, 58],
          categories: {
            기타: 35,
            양식: 25,
            일식: 25,
            중식: 20,
            한식: 15,
          },
          ratingDistribution: [5, 12, 26, 40, 52],
          topSearches: [
            { term: "강남역 맛집", count: 1204 },
            { term: "홍대 파스타", count: 987 },
            { term: "마라탕", count: 852 },
            { term: "잠실 롯데월드몰", count: 763 },
            { term: "성수동 카페", count: 610 },
          ],
          pie: [
            { name: "검색", population: 20 },
            { name: "SNS", population: 40 },
            { name: "광고", population: 15 },
            { name: "기타", population: 20 },
          ],
        },

        month: {
          visitors: 12870,
          joins: 950,
          restaurants: 345,
          reviews: 2150,
          visitorRate: 18.2,
          joinRate: 15.8,
          restaurantRate: 4.3,
          reviewRate: 11.4,
          timeSeries: [35, 48, 42, 55],
          categories: {
            한식: 40,
            중식: 28,
            일식: 18,
            양식: 10,
            기타: 4,
          },
          ratingDistribution: [6, 10, 24, 38, 60],
          topSearches: [
            { term: "강남역 맛집", count: 15320 },
            { term: "마라탕", count: 12890 },
            { term: "홍대 파스타", count: 11540 },
            { term: "성수동 카페", count: 9820 },
            { term: "잠실 롯데월드몰", count: 8760 },
          ],
          pie: [
            { name: "검색", population: 30 },
            { name: "SNS", population: 35 },
            { name: "광고", population: 20 },
            { name: "기타", population: 15 },
          ],
        },

        custom: {
          visitors: 4500,
          joins: 950,
          restaurants: 345,
          reviews: 2150,
          visitorRate: 18.2,
          joinRate: 15.8,
          restaurantRate: 4.3,
          reviewRate: 11.4,
          timeSeries: [35, 48, 42, 55, 22, 11],
          categories: {
            한식: 40,
            중식: 28,
            일식: 18,
            양식: 10,
            기타: 4,
          },
          ratingDistribution: [6, 10, 24, 38, 60],
          topSearches: [
            { term: "강남역 맛집", count: 15320 },
            { term: "마라탕", count: 12890 },
            { term: "홍대 파스타", count: 11540 },
            { term: "성수동 카페", count: 9820 },
            { term: "잠실 롯데월드몰", count: 8760 },
          ],
          pie: [
            { name: "검색", population: 10 },
            { name: "SNS", population: 20 },
            { name: "광고", population: 30 },
            { name: "기타", population: 40 },
          ],
        },
      },
    });
  },

  async getRestaurantList(
    page: number = 0,
    size: number = 10,
    status?: string,
    keyword?: string) {
    try {
      const params: any = { page, size };
      if (keyword) params.keyword = keyword;
      
      const response = await axios.get(`${LOCAL_HOST}/restaurant`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching restaurant list:", error);
      return {
        code: 500,
        message: "데이터를 불러오는 중 오류가 발생했습니다.",
        data: { content: [] }
      };
    }
  },

  async getUserList(
    page: number,
    size: number,
    status?: string,
    sort?: string,
    keyword?: string
  ): Promise<AdminUserList> {

    const allUsers: AdminUser[] = [
      {
        id: 1,
        name: "맛집탐험가",
        email: "minjun.kim@example.com",
        avatar: require("../../assets/user1.png"),
        joinDate: "2023-03-15",
        lastActive: "2024-07-28",
        status: "접속중",
        warnings: 0,
      },
      {
        id: 2,
        name: "서연의맛집",
        email: "seoyeon.lee@example.com",
        avatar: require("../../assets/user2.png"),
        joinDate: "2023-04-22",
        lastActive: "2024-07-25",
        status: "미접속",
        warnings: 1,
      },
      {
        id: 3,
        name: "맛집탐험가",
        email: "minjun.kim@example.com",
        avatar: require("../../assets/user1.png"),
        joinDate: "2023-03-15",
        lastActive: "2024-07-28",
        status: "접속중",
        warnings: 0,
      },
      {
        id: 4,
        name: "서연의맛집",
        email: "seoyeon.lee@example.com",
        avatar: require("../../assets/user2.png"),
        joinDate: "2023-04-22",
        lastActive: "2024-07-25",
        status: "미접속",
        warnings: 1,
      },
      {
        id: 5,
        name: "맛집탐험가",
        email: "minjun.kim@example.com",
        avatar: require("../../assets/user1.png"),
        joinDate: "2023-03-15",
        lastActive: "2024-07-28",
        status: "접속중",
        warnings: 0,
      },
      {
        id: 6,
        name: "서연의맛집",
        email: "seoyeon.lee@example.com",
        avatar: require("../../assets/user2.png"),
        joinDate: "2023-04-22",
        lastActive: "2024-07-25",
        status: "미접속",
        warnings: 1,
      },
      {
        id: 7,
        name: "맛집탐험가",
        email: "minjun.kim@example.com",
        avatar: require("../../assets/user1.png"),
        joinDate: "2023-03-15",
        lastActive: "2024-07-28",
        status: "접속중",
        warnings: 0,
      },
      {
        id: 8,
        name: "서연의맛집",
        email: "seoyeon.lee@example.com",
        avatar: require("../../assets/user2.png"),
        joinDate: "2023-04-22",
        lastActive: "2024-07-25",
        status: "미접속",
        warnings: 1,
      },
      {
        id: 9,
        name: "맛집탐험가",
        email: "minjun.kim@example.com",
        avatar: require("../../assets/user1.png"),
        joinDate: "2023-03-15",
        lastActive: "2024-07-28",
        status: "접속중",
        warnings: 0,
      },
      {
        id: 10,
        name: "서연의맛집",
        email: "seoyeon.lee@example.com",
        avatar: require("../../assets/user2.png"),
        joinDate: "2023-04-22",
        lastActive: "2024-07-25",
        status: "미접속",
        warnings: 1,
      },
      {
        id: 11,
        name: "맛집탐험가",
        email: "minjun.kim@example.com",
        avatar: require("../../assets/user1.png"),
        joinDate: "2023-03-15",
        lastActive: "2024-07-28",
        status: "접속중",
        warnings: 0,
      },
      {
        id: 12,
        name: "서연의맛집",
        email: "seoyeon.lee@example.com",
        avatar: require("../../assets/user2.png"),
        joinDate: "2023-04-22",
        lastActive: "2024-07-25",
        status: "미접속",
        warnings: 1,
      },
    ];

    let filtered = [...allUsers];

    if (keyword && keyword.trim() !== "") {
      const q = keyword.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (status && status !== "전체") {
      filtered = filtered.filter((u) => u.status === status);
    }

    switch (sort) {
      case "최신 가입순":
        filtered.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
        break;

      case "오래된 가입순":
        filtered.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
        break;

      case "경고 횟수 높은순":
        filtered.sort((a, b) => b.warnings - a.warnings);
        break;

      case "경고 횟수 낮은순":
        filtered.sort((a, b) => a.warnings - b.warnings);
        break;
    }

    const start = (page - 1) * size;
    const paginated = filtered.slice(start, start + size);
    const totalPages = Math.ceil(filtered.length / size);

    return {
      code: 200,
      message: "success",
      data: paginated,
      page,
      size,
      totalPages,
    };
  },

  async getNotifications() {
    return {
      code: 200,
      message: "OK",
      data: [
        {
          id: 1,
          category: "INQUIRY",
          title: "새로운 사용자 문의",
          message: "OOO님의 1:1 문의가 도착했습니다.",
          createdAt: "5분 전",
          read: false,
        },
        {
          id: 2,
          category: "REPORT",
          title: "리뷰 신고 접수",
          message: "XX식당에 대한 리뷰 신고가 접수되었습니다.",
          createdAt: "오후 2:45",
          read: true,
        },
        {
          id: 3,
          category: "RESTAURANT_REQUEST",
          title: "새로운 맛집 요청",
          message: "새로운 맛집 등록 요청이 있습니다.",
          createdAt: "오전 10:12",
          read: false,
        },
        {
          id: 4,
          category: "USER_PENALTY",
          title: "계정 제재 알림",
          message: "정책 위반으로 사용자 계정이 제재되었습니다.",
          createdAt: "어제",
          read: false,
        },
      ],
    };
  },
};
