import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { AlarmRepositoryImpl, Alarm } from "../../data/repositoriesImpl/AlarmRepositoryImpl";

export const useNotificationViewModel = () => {
    const [notifications, setNotifications] = useState<Alarm[]>([]);
    const [loading, setLoading] = useState(false);

    // 🔄 목록 불러오기
    const fetchAlarms = useCallback(async () => {
        setLoading(true);
        try {
            const data = await AlarmRepositoryImpl.getAlarms();
            setNotifications(data);
        } catch (e) {
            console.error("알림 로드 실패:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    // 📖 개별 읽음 처리
    const markAsRead = async (id: number) => {
        try {
            await AlarmRepositoryImpl.readAlarm(id);
            // UI 즉시 업데이트 (읽음 처리)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (e) { console.error(e); }
    };

    // ✨ 전체 읽음 처리
    const markAllAsRead = async () => {
        try {
            await AlarmRepositoryImpl.readAllAlarms();
            await fetchAlarms(); // 목록 새로고침
        } catch (e) { Alert.alert("오류", "전체 읽음 처리 실패"); }
    };

    // 🗑️ 개별 삭제
    const deleteAlarm = async (id: number) => {
        Alert.alert("알림 삭제", "삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            {
                text: "삭제",
                style: "destructive",
                onPress: async () => {
                    try {
                        await AlarmRepositoryImpl.deleteAlarm(id);
                        setNotifications(prev => prev.filter(n => n.id !== id));
                    } catch (e) { Alert.alert("오류", "삭제 실패"); }
                }
            }
        ]);
    };

    return {
        notifications,
        loading,
        fetchAlarms,
        markAsRead,
        markAllAsRead,
        deleteAlarm,
    };
};