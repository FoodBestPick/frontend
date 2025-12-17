import { API_BASE_URL } from "@env";
import { AdminUserList } from "../../domain/entities/AdminUserList";
import { authApi } from "./UserAuthApi";

export const AdminApi = {
  async getStats() {
    try {
      console.log(`🔍 [AdminApi] getStats 요청: ${API_BASE_URL}/admin/user/dashboard`);
      const response = await authApi.get(
        `${API_BASE_URL}/admin/user/dashboard`,
        {
          timeout: 10000, 
        }
      );
      if (response.data.data && !response.data.data.allRestaurantData) {
        response.data.data.allRestaurantData = [0, 0, 0, 0, 0, 0, 0];
      }
      return response.data;
    } catch (error: any) {
      console.error("❌ [AdminApi] getStats error:", error.message);
      console.error("  Status:", error.response?.status);
      console.error("  Data:", error.response?.data);
      throw error;
    }
  },

  async getDetailStats(startDate?: string, endDate?: string) {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      console.log(`🔍 [AdminApi] getDetailStats 요청: ${API_BASE_URL}/admin/user/dashboard/detail`, params);

      const response = await authApi.get(
        `${API_BASE_URL}/admin/user/dashboard/detail`,
        {
          params,
          timeout: 10000,
        }
      );

      const rawData = response.data.data;
      // ... (데이터 정제 로직은 그대로) ...
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
    } catch (error: any) {
      console.error("❌ [AdminApi] getDetailStats Error:", error.message);
      console.error("  Status:", error.response?.status);
      console.error("  Data:", error.response?.data);
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

      const response = await authApi.get(`${API_BASE_URL}/restaurant`, { params });
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

  async getUserList(
    page: number,
    size: number,
    status?: string,
    sort?: string,
    keyword?: string
  ): Promise<AdminUserList> {
    try {
      console.log(`[AdminApi] Fetching users from: ${API_BASE_URL}/admin/user`);
      
      const response = await authApi.get(`${API_BASE_URL}/admin/user`);

      console.log("[AdminApi] User list response status:", response.status);

      const allUsers = response.data.data.map((u: any) => {
        if (u.status !== "ACTIVED" && u.status !== "SUSPENDED") {
             console.warn(`[AdminApi] Unknown status from backend: ${u.status}`);
        }

        const isRecent = (dateStr: string) => {
            if (!dateStr) return false;
            const diff = new Date().getTime() - new Date(dateStr).getTime();
            return diff < 10 * 60 * 1000; 
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
            role: u.role, 
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

      // 3. 필터링 (Status)
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
        size: size, 
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
    await authApi.patch(
      `${API_BASE_URL}/admin/user/${userId}/warning`,
      { warnings, message }
    );
  },

  async suspendUser(userId: number, days: number, message: string) {
    await authApi.patch(
      `${API_BASE_URL}/admin/user/${userId}/suspende`,
      { day: days, message }
    );
  },

  async unsuspendUser(userId: number) {
    await authApi.patch(
      `${API_BASE_URL}/admin/user/${userId}/unsuspend`,
      {}
    );
  },

  async updateUserRole(userId: number, role: string) {
    try {
      const response = await authApi.patch(
        `${API_BASE_URL}/admin/user/${userId}/role`,
        { role } 
      );
      console.log(`[AdminApi] updateUserRole success for userId ${userId}:`, response.status, response.data);
      return response.data; 
    } catch (error: any) {
      console.error(`[AdminApi] updateUserRole error for userId ${userId}:`, error.response?.status, error.response?.data || error.message);
      throw error; 
    }
  },

  async getNotifications() {
    return { code: 200, message: "OK", data: [] };
  },

  async getAllFoods() {
    return authApi.get(`${API_BASE_URL}/food`);
  },

  async createFood(name: string) {
    return authApi.post(`${API_BASE_URL}/food`, { name }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  async updateFood(id: number, name: string) {
    return authApi.put(`${API_BASE_URL}/food/${id}`, { name }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  async deleteFood(foodId: number) {
    return authApi.delete(`${API_BASE_URL}/food/${foodId}`);
  },
};
