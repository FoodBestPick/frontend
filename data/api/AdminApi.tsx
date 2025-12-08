import { AdminUser, AdminUserList } from "../../domain/entities/AdminUserList";
import axios from "axios";
import { LOCAL_HOST } from "@env";

const BASE_URL = LOCAL_HOST;

export const AdminApi = {
  async getStats(token: string) {
    try {
      const response = await axios.get(`${BASE_URL}/admin/user/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      
      // 백엔드 응답에 allRestaurantData가 없을 경우를 대비해 기본값 추가
      if (response.data.data && !response.data.data.allRestaurantData) {
        response.data.data.allRestaurantData = [0, 0, 0, 0, 0, 0, 0];
      }
      
      return response.data;
    } catch (error) {
      console.error("getStats error", error);
      throw error;
    }
  },

  async getDetailStats(token: string, startDate?: string, endDate?: string) {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${BASE_URL}/admin/user/dashboard/detail`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error("getDetailStats error", error);
      throw error;
    }
  },

  async getRestaurantList(
    page: number = 0,
    size: number = 10,
    status?: string,
    keyword?: string) {
    try {
      const params: any = { page, size };
      if (keyword) params.keyword = keyword;
      
      const response = await axios.get(`${LOCAL_HOST}/restaurant`, { 
        params,
        timeout: 10000,
      });
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
