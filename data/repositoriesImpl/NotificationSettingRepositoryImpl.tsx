import { authApi } from "../api/UserAuthApi";

export type AlarmType =
  | "REVIEW_LIKE"
  | "MATCH_SUCCESS"
  | "WARNING_ADDED"
  | string; 

export type AlarmSettingsMap = Record<string, boolean>;

export class NotificationSettingRepositoryImpl {
  static async getSettings(): Promise<AlarmSettingsMap> {
    const res = await authApi.get("/alarm/settings");
    const data = res.data?.data;
    return data?.settings ?? data ?? {}; 
  }

  static async updateSetting(alarmType: AlarmType, enabled: boolean): Promise<void> {
    await authApi.patch("/alarm/settings", { alarmType, enabled });
  }
}