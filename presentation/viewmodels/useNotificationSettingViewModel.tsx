import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { NotificationSettingRepositoryImpl, NotificationSettings } from "../../data/repositoriesImpl/NotificationSettingRepositoryImpl";

export const useNotificationSettingViewModel = () => {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<NotificationSettings>({
        notice: true,
        reviewLike: true,
        reviewReply: true,
    });

    // 설정 불러오기
    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await NotificationSettingRepositoryImpl.getSettings();
            if (data) setSettings(data);
        } catch (e) {
            console.error("설정 로드 실패:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    // 초기 실행
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // 설정 토글 (낙관적 업데이트)
    const toggleSetting = async (key: keyof NotificationSettings) => {
        const previousValue = settings[key];
        const newValue = !previousValue;

        // 1. UI 먼저 변경
        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            // 2. 서버 요청
            await NotificationSettingRepositoryImpl.updateSetting(key, newValue);
        } catch (e) {
            // 3. 실패 시 롤백
            console.error(e);
            setSettings(prev => ({ ...prev, [key]: previousValue }));
            Alert.alert("저장 실패", "설정을 변경하지 못했습니다.");
        }
    };

    return {
        settings,
        loading,
        toggleSetting
    };
};