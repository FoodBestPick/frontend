import { authApi } from "../api/UserAuthApi";

// ⚙️ 딱 필요한 3가지 설정
export interface NotificationSettings {
    notice: boolean;      // 공지사항 (관리자 알림)
    reviewLike: boolean;  // 내 리뷰에 달린 좋아요
    reviewReply: boolean; // 내 리뷰에 달린 댓글
}

export class NotificationSettingRepositoryImpl {
    // 1. 설정 조회
    static async getSettings(): Promise<NotificationSettings> {
        const response = await authApi.get("/user/notification/settings");
        return response.data.data;
    }

    // 2. 설정 변경 (하나씩 토글)
    static async updateSetting(key: keyof NotificationSettings, value: boolean): Promise<void> {
        // 예: { "reviewLike": false } 형태로 전송
        await authApi.patch("/user/notification/settings", {
            [key]: value,
        });
    }
}