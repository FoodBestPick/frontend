import React, { useContext, useState, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { Header } from "../components/Header";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ThemeContext } from "../../context/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNotificationViewModel } from "../viewmodels/useNotificationViewModel";

export const AdminNotificationScreen = () => {
    const navigation = useNavigation<any>();
    const { theme, isDarkMode } = useContext(ThemeContext);

    const {
        notifications,
        loading,
        fetchAlarms,
        markAsRead,
        markAllAsRead,
        deleteAlarm
    } = useNotificationViewModel();

    const [filterVisible, setFilterVisible] = useState(false);
    const [readFilter, setReadFilter] = useState<"UNREAD" | "READ" | "ALL">("ALL");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchAlarms();
        }, [fetchAlarms])
    );

    const toggleCategory = (cat: string) => {
        setSelectedCategory((prev) => (prev === cat ? null : cat));
    };

    const filteredList = notifications.filter((item) => {
        if (readFilter === "UNREAD" && item.read) return false;
        if (readFilter === "READ" && !item.read) return false;
        if (selectedCategory && item.alarmType !== selectedCategory) return false;
        return true;
    });

    const categoryMap: any = {
        REPORT_RECEIVED: { icon: "error-outline", color: "#E53935", label: "신고 접수" },
        INQUIRY_RECEIVED: { icon: "chat-bubble-outline", color: "#1E88E5", label: "문의 등록" },
        DEFAULT: { icon: "notifications", color: "#999", label: "알림" }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Header
                title="관리자 알림"
                showBackButton
                onBackPress={() => navigation.goBack()}
                iconName="tune"
                onIconPress={() => setFilterVisible(true)}
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAlarms} />}
            >
                <TouchableOpacity style={{ marginBottom: 16 }} onPress={markAllAsRead}>
                    <Text style={{ color: "#1E88E5", fontWeight: "600" }}>모두 읽음으로 표시</Text>
                </TouchableOpacity>

                {filteredList.length === 0 && !loading && (
                    <Text style={{ textAlign: "center", marginTop: 50, color: theme.textSecondary }}>표시할 알림이 없습니다.</Text>
                )}

                {filteredList.map((item) => {
                    const iconData = categoryMap[item.alarmType] || categoryMap.DEFAULT;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => markAsRead(item.id)}
                            // onLongPress 제거하고 아래 X 버튼으로 대체함
                            activeOpacity={0.8}
                            style={[
                                styles.card,
                                {
                                    borderColor: theme.border,
                                    backgroundColor: !item.read ? "rgba(255,193,158,0.25)" : theme.card,
                                },
                            ]}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: iconData.color + "20" }]}>
                                <MaterialIcons name={iconData.icon} size={26} color={iconData.color} />
                            </View>

                            <View style={{ flex: 1, marginRight: 8 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={[styles.title, { color: iconData.color, fontSize: 13, marginBottom: 2 }]}>
                                        {iconData.label}
                                    </Text>
                                    <Text style={[styles.time, { color: theme.textSecondary }]}>
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={[styles.message, { color: theme.textPrimary }]}>{item.message}</Text>
                            </View>

                            {/* 👇 여기에 X 버튼 추가 (우측 상단 배치 느낌) */}
                            <TouchableOpacity
                                onPress={() => deleteAlarm(item.id)}
                                style={styles.deleteButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // 터치 영역 확장
                            >
                                <MaterialIcons name="close" size={20} color="#bbb" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <Modal
                visible={filterVisible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setFilterVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>알림 필터</Text>
                            <TouchableOpacity onPress={() => setFilterVisible(false)}>
                                <MaterialIcons name="close" size={24} color={theme.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>읽음 상태</Text>
                        <RadioButton label="모두 보기" selected={readFilter === "ALL"} onPress={() => setReadFilter("ALL")} />
                        <RadioButton label="읽지 않음" selected={readFilter === "UNREAD"} onPress={() => setReadFilter("UNREAD")} />
                        <RadioButton label="읽음" selected={readFilter === "READ"} onPress={() => setReadFilter("READ")} />

                        <View style={styles.divider} />

                        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>유형별 필터</Text>
                        <View style={styles.rowWrap}>
                            <CategoryCheckBox label="문의" selected={selectedCategory === "INQUIRY_RECEIVED"} onPress={() => toggleCategory("INQUIRY_RECEIVED")} />
                            <CategoryCheckBox label="신고" selected={selectedCategory === "REPORT_RECEIVED"} onPress={() => toggleCategory("REPORT_RECEIVED")} />
                        </View>

                        <View style={styles.footerButtons}>
                            <TouchableOpacity style={styles.resetButton} onPress={() => { setReadFilter("ALL"); setSelectedCategory(null); }}>
                                <Text style={{ color: theme.textSecondary }}>초기화</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={() => setFilterVisible(false)}>
                                <Text style={{ color: "#fff", fontWeight: "700" }}>적용</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// ... (하위 컴포넌트는 그대로 유지)
const RadioButton = ({ label, selected, onPress }: any) => {
    const { theme, isDarkMode } = useContext(ThemeContext);
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.radioRow, { backgroundColor: selected ? isDarkMode ? "rgba(255,112,67,0.15)" : "#FFECE6" : theme.card, borderColor: selected ? "#FF7043" : theme.border }]}>
            <View style={[styles.radioCircle, { borderColor: selected ? "#FF7043" : theme.border }]}>
                {selected && <View style={styles.radioInner} />}
            </View>
            <Text style={{ color: selected ? "#FF7043" : theme.textPrimary, fontWeight: "500" }}>{label}</Text>
        </TouchableOpacity>
    );
};

const CategoryCheckBox = ({ label, selected, onPress }: any) => {
    const { theme, isDarkMode } = useContext(ThemeContext);
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.checkWrapper, { borderColor: selected ? "#FF7043" : theme.border }]}>
            <View style={[styles.checkBox, { borderColor: selected ? "#FF7043" : theme.border, backgroundColor: selected ? isDarkMode ? "rgba(255,112,67,0.25)" : "#FFECE6" : "transparent" }]}>
                {selected && <MaterialIcons name="check" size={16} color="#FF7043" />}
            </View>
            <Text style={{ color: theme.textPrimary, marginLeft: 10, fontWeight: selected ? "700" : "500" }}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    card: { flexDirection: "row", padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16, alignItems: 'center' }, // alignItems 추가
    iconCircle: { width: 48, height: 48, borderRadius: 999, justifyContent: "center", alignItems: "center", marginRight: 16 },
    title: { fontSize: 14, fontWeight: "700" },
    message: { fontSize: 15, marginTop: 4, lineHeight: 20 },
    time: { fontSize: 12 },
    // 👇 삭제 버튼 스타일
    deleteButton: { padding: 4, alignSelf: 'flex-start', marginTop: -4 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    modalBox: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
    modalTitle: { fontSize: 18, fontWeight: "700" },
    sectionLabel: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
    divider: { height: 1, backgroundColor: "#ddd", marginVertical: 20 },
    footerButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
    resetButton: { paddingVertical: 12, paddingHorizontal: 65, borderRadius: 10, borderWidth: 1, borderColor: "#bbb" },
    applyButton: { backgroundColor: "#FF7043", paddingVertical: 12, paddingHorizontal: 72, borderRadius: 10 },
    radioRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 10 },
    radioCircle: { width: 20, height: 20, borderRadius: 999, borderWidth: 2, justifyContent: "center", alignItems: "center", marginRight: 12 },
    radioInner: { width: 10, height: 10, borderRadius: 999, backgroundColor: "#FF7043" },
    checkWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12, width: "48%" },
    checkBox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, justifyContent: "center", alignItems: "center" },
    rowWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});