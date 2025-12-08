import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { NotificationSettingRepositoryImpl, NotificationSettings } from "../../data/repositoriesImpl/NotificationSettingRepositoryImpl";

const MAIN_COLOR = "#FFA847";

const NotificationSettingScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    // ⚙️ [기본값 설정] 서버가 500 에러로 뻗어도 이 값(True)으로 화면이 나옵니다.
    const [settings, setSettings] = useState<NotificationSettings>({
        notice: true,      // 공지사항 (SYSTEM)
        reviewLike: true,  // 리뷰 좋아요 (REVIEW_LIKE)
        reviewReply: true, // 리뷰 댓글 (REVIEW_COMMENT)
    });

    // 🔄 설정 불러오기
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const data = await NotificationSettingRepositoryImpl.getSettings();
                if (data) setSettings(data);
            } catch (e: any) {
                // 🛡️ [방어 코드] 500 에러 = "데이터 없음"으로 간주하고 에러 무시
                if (e.response && e.response.status === 500) {
                    console.log("⚠️ [Server] 설정 데이터 없음 -> 기본값(ON)으로 표시합니다.");
                } else {
                    console.error("설정 로드 실패:", e);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // 👆 스위치 토글 (서버 저장 요청)
    const toggleSwitch = async (key: keyof NotificationSettings) => {
        const previousValue = settings[key];
        const newValue = !previousValue;

        // 1. 화면 먼저 변경 (낙관적 업데이트)
        setSettings((prev) => ({ ...prev, [key]: newValue }));

        try {
            // 2. 서버에 저장 요청
            // (데이터가 없어서 조회 때 500이 났더라도, 업데이트 요청을 보내면 서버가 데이터를 생성해서 저장할 확률이 높습니다)
            await NotificationSettingRepositoryImpl.updateSetting(key, newValue);
            console.log(`✅ ${key} -> ${newValue} 변경 완료`);
        } catch (e) {
            console.error("저장 실패", e);
            // 실패 시 원상복구
            setSettings((prev) => ({ ...prev, [key]: previousValue }));
            Alert.alert("저장 실패", "설정을 변경하지 못했습니다.");
        }
    };

    // 🎨 공통 아이템 컴포넌트
    const SettingItem = ({ label, description, value, onToggle }: any) => (
        <View style={styles.itemContainer}>
            <View style={styles.textContainer}>
                <Text style={styles.itemLabel}>{label}</Text>
                {description && <Text style={styles.itemDesc}>{description}</Text>}
            </View>
            <Switch
                trackColor={{ false: "#E0E0E0", true: MAIN_COLOR }}
                thumbColor={"#FFFFFF"}
                ios_backgroundColor="#E0E0E0"
                onValueChange={onToggle}
                value={value}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>알림 설정</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={MAIN_COLOR} />
                </View>
            ) : (
                <View style={styles.content}>
                    {/* 섹션 1: 커뮤니티 활동 */}
                    <Text style={styles.sectionTitle}>내 활동 알림</Text>
                    <SettingItem
                        label="리뷰 좋아요"
                        description="내 리뷰에 다른 유저가 좋아요를 누르면 알려드려요."
                        value={settings.reviewLike}
                        onToggle={() => toggleSwitch("reviewLike")}
                    />
                    <SettingItem
                        label="댓글 알림"
                        description="내 리뷰에 댓글이 달리면 알려드려요."
                        value={settings.reviewReply}
                        onToggle={() => toggleSwitch("reviewReply")}
                    />

                    <View style={styles.divider} />

                    {/* 섹션 2: 서비스 공지 */}
                    <Text style={styles.sectionTitle}>서비스 정보</Text>
                    <SettingItem
                        label="공지사항 알림"
                        description="중요한 공지사항이나 이벤트 소식을 받습니다."
                        value={settings.notice}
                        onToggle={() => toggleSwitch("notice")}
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    headerButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center", marginLeft: -10 },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#000" },
    content: { padding: 20 },
    sectionTitle: { fontSize: 14, fontWeight: "600", color: "#888", marginBottom: 15, marginTop: 10 },
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 25,
    },
    textContainer: { flex: 1, marginRight: 20 },
    itemLabel: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
    itemDesc: { fontSize: 13, color: "#999", lineHeight: 18 },
    divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 10, marginBottom: 25 },
});

export default NotificationSettingScreen;