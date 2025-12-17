import { API_BASE_URL } from "@env";
import { authApi } from "./UserAuthApi";

export interface SendReportRequest {
  targetType: string;
  targetId: number;
  reason: string;
  reasonDetail: string;
}

export interface ReportListResponse {
  id: number;
  reporterId: number;
  targetId: number;
  targetType: string;
  reason: string;
  reasonDetail: string;
  status: string;
  isImposed: boolean; 
  createdAt: string;
  updatedAt: string; 
}

export const ReportApi = {
  async sendReport(request: SendReportRequest) {
    try {
      console.log("🔍 [API] sendReport 요청 URL:", `${API_BASE_URL}/report`); 
      console.log("🔍 [API] sendReport 요청 데이터:", request); 
      const response = await authApi.post(`${API_BASE_URL}/report`, request, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });
      console.log("✅ [API] sendReport 응답:", response.data); 
      return response.data;
    } catch (error: any) { 
      console.error("❌ [API] sendReport 에러 발생:", error.message); 
      throw error;
    }
  },

  // ✨ [추가] 일반 사용자용 자신의 신고 내역 조회
  async getMyReports(
    page: number = 0, 
    size: number = 10, 
    status?: string,
    targetType?: string
  ): Promise<{code: number; message: string; data: ReportListResponse[]; totalPages?: number; totalElements?: number}> { 
    try {
      const params: any = { page, size };
      if (status) params.status = status;
      if (targetType) params.targetType = targetType;

      const response = await authApi.get(`${API_BASE_URL}/report`, {
        params,
        timeout: 10000,
      });
      console.log("✅ [API] getMyReports 응답:", response.data); 
      return response.data; 
    } catch (error: any) { 
      console.error("❌ [API] getMyReports 에러 발생:", error.message);
      throw error;
    }
  },

  // ✨ [추가] 일반 사용자용 특정 신고 내역 삭제
  async deleteMyReport(reportId: number) {
    try {
      const response = await authApi.delete(`${API_BASE_URL}/report/${reportId}/delete`, {
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error("deleteMyReport error:", error);
      throw error;
    }
  },

  // ✨ [추가] 일반 사용자용 모든 신고 내역 삭제
  async deleteAllMyReports() {
    try {
      const response = await authApi.delete(`${API_BASE_URL}/report/all/delete`, {
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error("deleteAllMyReports error:", error);
      throw error;
    }
  },


  async getAllReports(
    page: number = 0,
    size: number = 10,
    status?: string,
    targetType?: string
  ) {
    try {
      const params: any = { page, size };
      if (status) params.status = status;
      if (targetType) params.targetType = targetType;

      const response = await authApi.get(`${API_BASE_URL}/admin/report`, {
        params,
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error("getAllReports error:", error);
      throw error;
    }
  },

  async deleteReport(reportId: number) {
    try {
      const response = await authApi.delete(`${API_BASE_URL}/admin/report/${reportId}/delete`);
      return response.data;
    } catch (error) {
      console.error("deleteReport error:", error);
      throw error;
    }
  },

  async approveWithWarning(
    reportId: number,
    data: { userId: number; reason: string }
  ) {
    try {
      const response = await authApi.patch(
        `${API_BASE_URL}/admin/report/${reportId}/warning`,
        {
          warnings: 1, 
          message: data.reason,
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );
      return response.data;
    } catch (error) {
      console.error("approveWithWarning error:", error);
      throw error;
    }
  },

  async approveWithSuspension(
    reportId: number,
    data: { userId: number; reason: string; durationDays: number }
  ) {
    try {
      const response = await authApi.patch(
        `${API_BASE_URL}/admin/report/${reportId}/suspende`,
        {
          day: data.durationDays,
          message: data.reason,
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );
      return response.data;
    } catch (error) {
      console.error("approveWithSuspension error:", error);
      throw error;
    }
  },
};