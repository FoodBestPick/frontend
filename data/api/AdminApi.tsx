import axios from "axios";
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AdminUserList } from "../../domain/entities/AdminUserList";

// 토큰 가져오는 헬퍼 함수
const getToken = async () => {
  return await AsyncStorage.getItem("accessToken");
};


export const AdminApi = {
  async getStats(token: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/user/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000, // Timeout 추가
        }
      );
      // 팀원 코드 병합: allRestaurantData가 없을 경우 기본값 추가
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

      const response = await axios.get(
        `${API_BASE_URL}/admin/user/dashboard/detail`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
          timeout: 10000,
        }
      );

      const rawData = response.data.data;

      // 🛡️ 데이터 정제 (숫자 변환 및 null 처리)
      const sanitizeStats = (stats: any) => {
        if (!stats) return {};
        return {
          ...stats,
          visitors: Number(stats.visitors || 0),
          joins: Number(stats.joins || 0),
          restaurants: Number(stats.restaurants || 0),
          reviews: Number(stats.reviews || 0),
          visitorRate: Number(stats.visitorRate || 0),
          joinRate: Number(stats.joinRate || 0),
          restaurantRate: Number(stats.restaurantRate || 0),
          reviewRate: Number(stats.reviewRate || 0),
        };
      };

      const sanitizedData = {
        today: sanitizeStats(rawData.today),
        week: sanitizeStats(rawData.week),
        month: sanitizeStats(rawData.month),
        custom: sanitizeStats(rawData.custom),
      };

      return {
        ...response.data,
        data: sanitizedData,
      };
    } catch (error) {
      console.error("getDetailStats Error:", error);
      return { code: 500, message: "통계 로드 실패", data: null };
    }
  },

  async getRestaurantList(
    page: number = 0,
    size: number = 10,
    status?: string,
    keyword?: string
  ) {
    try {
      const params: any = { page, size };
      if (keyword) params.keyword = keyword;

      const response = await axios.get(`${API_BASE_URL}/restaurant`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching restaurant list:", error);
      return {
        code: 500,
        message: "데이터를 불러오는 중 오류가 발생했습니다.",
        data: { content: [] },
      };
    }
  },

  // ✅ [API 연동] 유저 목록 조회 (클라이언트 사이드 페이징/필터링 구현)
  async getUserList(
    page: number,
    size: number,
    status?: string,
    sort?: string,
    keyword?: string
  ): Promise<AdminUserList> {
    try {
      const token = await getToken();
      console.log(`[AdminApi] Fetching users from: ${API_BASE_URL}/admin/user`);
      
      const response = await axios.get(`${API_BASE_URL}/admin/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("[AdminApi] User list response status:", response.status);

      const allUsers = response.data.data.map((u: any) => {
        if (u.status !== "ACTIVED" && u.status !== "SUSPENDED") {
             console.warn(`[AdminApi] Unknown status from backend: ${u.status}`);
        }

        const isRecent = (dateStr: string) => {
            if (!dateStr) return false;
            const diff = new Date().getTime() - new Date(dateStr).getTime();
            return diff < 10 * 60 * 1000; // 10분 이내 활동
        };

        let statusStr = "미접속";
        if (u.status === "SUSPENDED") statusStr = "정지";
        else if (u.status === "ACTIVED") {
            statusStr = isRecent(u.updatedAt) ? "접속중" : "미접속";
        }

        return {
            id: u.id,
            name: u.nickname,
            email: u.email,
            avatar: u.image ? { uri: u.image } : null,
            joinDate: u.createdAt,
            lastActive: u.updatedAt,
            status: statusStr,
            warnings: u.warnings,
            role: u.role, // ✨ 추가: 백엔드에서 받은 role 정보를 매핑
        };
      });

      // 2. 필터링 (Keyword)
      let filtered = [...allUsers];
      if (keyword && keyword.trim() !== "") {
        const q = keyword.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        );
      }

      // 3. 필터링 (Status) - API Status와 UI Status 매핑이 중요
      // Debugging logs
      if (status && status !== "전체") {
          console.log(`[AdminApi] Filtering by status: '${status}'`);
          console.log(`[AdminApi] Available statuses in list:`, [...new Set(allUsers.map((u: any) => u.status))]);
      }

      if (status && status !== "전체") {
        filtered = filtered.filter((u) => u.status === status);
      }

      // 4. 정렬
      switch (sort) {
        case "최신 가입순":
          filtered.sort(
            (a, b) =>
              new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
          );
          break;
        case "오래된 가입순":
          filtered.sort(
            (a, b) =>
              new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
          );
          break;
        case "경고 횟수 높은순":
          filtered.sort((a, b) => b.warnings - a.warnings);
          break;
        case "경고 횟수 낮은순":
          filtered.sort((a, b) => a.warnings - b.warnings);
          break;
      }

      // 5. 페이징 (Slicing)
      const start = (page - 1) * size;
      const paginated = filtered.slice(start, start + size);
      const totalPages = Math.ceil(filtered.length / size);

      return {
        code: 200,
        message: "success",
        data: paginated,
        page,
        size: size, // size 변수명이 겹치지 않게 수정
        totalPages: totalPages || 1,
      };
    } catch (error: any) {
      console.error("getUserList Error:", error.message);
      if (error.response) {
          console.error("Server Error Data:", error.response.data);
          console.error("Server Error Status:", error.response.status);
      }
      return {
        code: 500,
        message: error.message,
        data: [],
        page: 1,
        size: 10,
        totalPages: 0,
      };
    }
  },

  async updateUserWarning(userId: number, warnings: number, message: string) {
    const token = await getToken();
    await axios.patch(
      `${API_BASE_URL}/admin/user/${userId}/warning`,
      { warnings, message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  async suspendUser(userId: number, days: number, message: string) {
    const token = await getToken();
    await axios.patch(
      `${API_BASE_URL}/admin/user/${userId}/suspende`,
      { day: days, message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  async updateUserRole(userId: number, role: string) {
    const token = await getToken();
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/admin/user/${userId}/role`,
        { role }, // UserRoleRequest DTO에 맞춤
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`[AdminApi] updateUserRole success for userId ${userId}:`, response.status, response.data);
      return response.data; // Return data for potential further checks
    } catch (error: any) {
      console.error(`[AdminApi] updateUserRole error for userId ${userId}:`, error.response?.status, error.response?.data || error.message);
      throw error; // Re-throw to propagate error to ViewModel
    }
  },

  async getNotifications() {
    return { code: 200, message: "OK", data: [] };
  },

  // 🍔 [Food API 추가]
  async getAllFoods() {
    const token = await getToken();
    return axios.get(`${API_BASE_URL}/food`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async createFood(name: string) {
    const token = await getToken();
    return axios.post(`${API_BASE_URL}/food`, { name }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  async updateFood(id: number, name: string) {
    const token = await getToken();
    return axios.put(`${API_BASE_URL}/food/${id}`, { name }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  async deleteFood(foodId: number) {
    const token = await getToken();
    return axios.delete(`${API_BASE_URL}/food/${foodId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};