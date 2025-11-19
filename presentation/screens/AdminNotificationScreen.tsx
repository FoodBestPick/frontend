import { useContext, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from "react-native";
import { Header } from "../components/Header";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types/RootStackParamList";
import { ThemeContext } from "../../context/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { AdminNotificationViewModels } from "../viewmodels/AdminNotificationViewModels";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export const AdminNotificationScreen = () => {
    const navigation = useNavigation<Navigation>();
    const { theme, isDarkMode } = useContext(ThemeContext);

    const { response, loading, error, refresh } = AdminNotificationViewModels();

    const categoryMap: any = {
        INQUIRY: { icon: "chat-bubble-outline", color: "#1E88E5" },
        REPORT: { icon: "error-outline", color: "#E53935" },
        RESTAURANT_REQUEST: { icon: "restaurant-menu", color: "#FB8C00" },
        USER_PENALTY: { icon: "gavel", color: "#757575" },
    };

    const [filterVisible, setFilterVisible] = useState(false);
    const [readFilter, setReadFilter] = useState<"UNREAD" | "READ" | "ALL">("ALL");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const toggleCategory = (cat: string) => {
        setSelectedCategory((prev) => (prev === cat ? null : cat));
    };

    const notifications = response?.data ?? [];

    const filteredList = notifications.filter((item) => {
        if (readFilter === "UNREAD" && item.read) return false;
        if (readFilter === "READ" && !item.read) return false;
        if (selectedCategory && item.category !== selectedCategory) return false;
        return true;
    });


    if (loading)
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.background,
                }}
            >
                <ActivityIndicator size="large" color={theme.icon} />
                <Text
                    style={{
                        marginTop: 10,
                        color: theme.textSecondary,
                        fontSize: 15,
                    }}
                >
                    알림 데이터를 불러오는 중...
                </Text>
            </View>
        );

    if (error)
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.background,
                }}
            >
                <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>
            </View>
        );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Header
                title="알림"
                showBackButton
                onBackPress={() => navigation.goBack()}
                iconName="tune"
                onIconPress={() => setFilterVisible(true)}
            />

            {/* 알림 목록 */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                <TouchableOpacity style={{ marginBottom: 16 }}>
                    <Text style={{ color: "#1E88E5", fontWeight: "600" }}>
                        모두 읽음으로 표시
                    </Text>
                </TouchableOpacity>

                {filteredList.map((item) => {
                    const iconData = categoryMap[item.category];

                    return (
                        <View
                            key={item.id}
                            style={[
                                styles.card,
                                {
                                    borderColor: theme.border,
                                    backgroundColor: !item.read
                                        ? "rgba(255,193,158,0.25)"
                                        : theme.card,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.iconCircle,
                                    { backgroundColor: iconData.color + "20" },
                                ]}
                            >
                                <MaterialIcons
                                    name={iconData.icon}
                                    size={26}
                                    color={iconData.color}
                                />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={[styles.title, { color: theme.textPrimary }]}>
                                    {item.title}
                                </Text>
                                <Text style={[styles.message, { color: theme.textSecondary }]}>
                                    {item.message}
                                </Text>
                                <Text style={[styles.time, { color: theme.textSecondary }]}>
                                    {item.createdAt}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* 필터 모달 */}
            <Modal
                visible={filterVisible}
                transparent
                animationType="fade"
                presentationStyle="overFullScreen"
                statusBarTranslucent
                onRequestClose={() => setFilterVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                                알림 필터
                            </Text>
                            <TouchableOpacity onPress={() => setFilterVisible(false)}>
                                <MaterialIcons name="close" size={24} color={theme.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* 읽음 상태 */}
                        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>
                            읽음 상태
                        </Text>

                        <RadioButton
                            label="모두 보기"
                            selected={readFilter === "ALL"}
                            onPress={() => setReadFilter("ALL")}
                        />

                        <RadioButton
                            label="읽지 않음"
                            selected={readFilter === "UNREAD"}
                            onPress={() => setReadFilter("UNREAD")}
                        />

                        <RadioButton
                            label="읽음"
                            selected={readFilter === "READ"}
                            onPress={() => setReadFilter("READ")}
                        />

                        <View style={styles.divider} />

                        {/* 유형 필터 */}
                        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>
                            유형별 필터
                        </Text>

                        <View style={styles.rowWrap}>
                            <CategoryCheckBox
                                label="문의"
                                selected={selectedCategory === "INQUIRY"}
                                onPress={() => toggleCategory("INQUIRY")}
                            />

                            <CategoryCheckBox
                                label="신고"
                                selected={selectedCategory === "REPORT"}
                                onPress={() => toggleCategory("REPORT")}
                            />

                            <CategoryCheckBox
                                label="맛집 요청"
                                selected={selectedCategory === "RESTAURANT_REQUEST"}
                                onPress={() => toggleCategory("RESTAURANT_REQUEST")}
                            />

                            <CategoryCheckBox
                                label="계정 제재"
                                selected={selectedCategory === "USER_PENALTY"}
                                onPress={() => toggleCategory("USER_PENALTY")}
                            />
                        </View>

                        {/* 하단 버튼 */}
                        <View style={styles.footerButtons}>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={() => {
                                    setReadFilter("ALL");
                                    setSelectedCategory(null);
                                }}
                            >
                                <Text style={{ color: theme.textSecondary }}>초기화</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={() => setFilterVisible(false)}
                            >
                                <Text style={{ color: "#fff", fontWeight: "700" }}>적용</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};


const RadioButton = ({ label, selected, onPress }: any) => {
    const { theme, isDarkMode } = useContext(ThemeContext);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[
                styles.radioRow,
                {
                    backgroundColor: selected
                        ? isDarkMode
                            ? "rgba(255,112,67,0.15)"
                            : "#FFECE6"
                        : theme.card,
                    borderColor: selected ? "#FF7043" : theme.border,
                },
            ]}
        >
            <View
                style={[
                    styles.radioCircle,
                    { borderColor: selected ? "#FF7043" : theme.border },
                ]}
            >
                {selected && <View style={styles.radioInner} />}
            </View>

            <Text
                style={{
                    color: selected ? "#FF7043" : theme.textPrimary,
                    fontWeight: "500",
                }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const CategoryCheckBox = ({ label, selected, onPress }: any) => {
    const { theme, isDarkMode } = useContext(ThemeContext);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[
                styles.checkWrapper,
                { borderColor: selected ? "#FF7043" : theme.border },
            ]}
        >
            <View
                style={[
                    styles.checkBox,
                    {
                        borderColor: selected ? "#FF7043" : theme.border,
                        backgroundColor: selected
                            ? isDarkMode
                                ? "rgba(255,112,67,0.25)"
                                : "#FFECE6"
                            : "transparent",
                    },
                ]}
            >
                {selected && (
                    <MaterialIcons name="check" size={16} color="#FF7043" />
                )}
            </View>

            <Text
                style={{
                    color: theme.textPrimary,
                    marginLeft: 10,
                    fontWeight: selected ? "700" : "500",
                }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1 },

    card: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },

    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },

    title: {
        fontSize: 16,
        fontWeight: "600",
    },

    message: {
        fontSize: 14,
        marginTop: 2,
    },

    time: {
        fontSize: 12,
        marginTop: 6,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },

    modalBox: {
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 25,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
    },

    sectionLabel: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 12,
    },

    divider: {
        height: 1,
        backgroundColor: "#ddd",
        marginVertical: 20,
    },

    footerButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
    },

    resetButton: {
        paddingVertical: 12,
        paddingHorizontal: 65,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#bbb",
    },

    applyButton: {
        backgroundColor: "#FF7043",
        paddingVertical: 12,
        paddingHorizontal: 72,
        borderRadius: 10,
    },

    radioRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 10,
    },

    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 999,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 999,
        backgroundColor: "#FF7043",
    },

    checkWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 12,
        width: "48%",
    },

    checkBox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
    },

    rowWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between"
    },
});
