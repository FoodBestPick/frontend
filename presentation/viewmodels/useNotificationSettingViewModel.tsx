// useNotificationSettingViewModel.tsx
import { useState, useCallback, useEffect } from "react";
import {
  NotificationSettingRepositoryImpl,
  AlarmType,
  AlarmSettingsMap,
} from "../../data/repositoriesImpl/NotificationSettingRepositoryImpl";
import { useAlert } from "../../context/AlertContext";

const DEFAULTS: AlarmSettingsMap = {
  REVIEW_LIKE: true,
  MATCH_SUCCESS: true,
  WARNING_ADDED: true,
};

export const useNotificationSettingViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AlarmSettingsMap>(DEFAULTS);
  const { showAlert } = useAlert();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const server = await NotificationSettingRepositoryImpl.getSettings();
      setSettings({ ...DEFAULTS, ...server });
    } catch (e) {
      console.error("설정 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const toggleSetting = async (alarmType: AlarmType) => {
    const prev = settings[alarmType] ?? true;
    const next = !prev;

    setSettings((p) => ({ ...p, [alarmType]: next }));

    try {
      await NotificationSettingRepositoryImpl.updateSetting(alarmType, next);
    } catch (e) {
      console.error(e);
      setSettings((p) => ({ ...p, [alarmType]: prev }));
      showAlert({ title: "저장 실패", message: "설정을 변경하지 못했습니다." });
    }
  };

  return { settings, loading, toggleSetting };
};
