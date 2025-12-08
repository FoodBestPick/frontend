import { API_BASE_URL } from "@env";

export interface SendReportRequest {
  targetType: string;
  targetId: number;
  reason: string;
  reasonDetail: string;
}

export const ReportApi = {
  async sendReport(token: string, request: SendReportRequest) {
    try {
      const response = await fetch(`${API_BASE_URL}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      console.error("sendReport error:", error);
      throw error;
    }
  },

  async getAllReports(
    token: string,
    page: number = 0,
    size: number = 10,
    status?: string,
    targetType?: string
  ) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (status) params.append("status", status);
      if (targetType) params.append("targetType", targetType);

      const response = await fetch(
        `${API_BASE_URL}/admin/report?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error("getAllReports error:", error);
      throw error;
    }
  },

  async deleteReport(token: string, reportId: number) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/report/${reportId}/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error("deleteReport error:", error);
      throw error;
    }
  },

  async approveWithWarning(
    token: string,
    reportId: number,
    data: { userId: number; reason: string }
  ) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/report/${reportId}/warning`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            warnings: 1, // Default to 1 warning
            message: data.reason,
          }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("approveWithWarning error:", error);
      throw error;
    }
  },

  async approveWithSuspension(
    token: string,
    reportId: number,
    data: { userId: number; reason: string; durationDays: number }
  ) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/report/${reportId}/suspende`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            day: data.durationDays,
            message: data.reason,
          }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("approveWithSuspension error:", error);
      throw error;
    }
  },
};
