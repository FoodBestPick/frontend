// 👇 [중요] 반드시 방금 수정한 UserAuthApi를 import 하세요!
// 경로가 빨간줄 뜨면 본인 폴더 구조에 맞춰서 수정해주세요 (예: ../../api/UserAuthApi)
import { authApi } from "../api/UserAuthApi";

export interface Alarm {
    id: number;
    message: string;
    alarmType: string;
    targetType: string;
    targetId: number;
    createdAt: string;
    read: boolean;
}

export class AlarmRepositoryImpl {
    // 1. 알림 목록 조회 [GET /alarm]
    static async getAlarms(): Promise<Alarm[]> {
        // ❌ axios.get(...) 절대 금지
        // ✅ authApi.get(...) 사용 -> 자동으로 토큰이 붙어서 나감
        console.log("🚀 [AlarmRepo] 알림 목록 요청 시작");
        const response = await authApi.get("/alarm");
        return response.data.data;
    }

    // 2. 알림 읽음 처리 (1개) [PATCH /alarm/{id}/read]
    static async readAlarm(alarmId: number): Promise<void> {
        await authApi.patch(`/alarm/${alarmId}/read`);
    }

    // 3. 알림 전체 읽음 [PATCH /alarm/read-all]
    static async readAllAlarms(): Promise<void> {
        await authApi.patch("/alarm/read-all");
    }

    // 4. 알림 삭제 (1개) [DELETE /alarm/{id}/delete]
    static async deleteAlarm(alarmId: number): Promise<void> {
        await authApi.delete(`/alarm/${alarmId}/delete`);
    }

    // 5. 알림 전체 삭제 [DELETE /alarm/delete-all]
    static async deleteAllAlarms(): Promise<void> {
        await authApi.delete("/alarm/delete-all");
    }
}