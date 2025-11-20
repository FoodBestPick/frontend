// presentation/components/UserTabBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

export default function UserTabBar({ active }: { active: string }) {
    const navigation = useNavigation();

    const tabs = [
        { label: "홈", icon: "home-outline", route: "UserMain" },
        { label: "룰렛", icon: "refresh-outline", route: "RouletteScreen" },
        { label: "매칭", icon: "people-outline", route: "MatchScreen" },
        { label: "마이페이지", icon: "person-outline", route: "MyPageScreen" },
        { label: "알림", icon: "notifications-outline", route: "NotificationScreen" },
    ];

    return (
        <View style={styles.tabBar}>
            {tabs.map(({ label, icon, route }, idx) => {
                const focused = active === label;

                return (
                    <TouchableOpacity
                        key={idx}
                        style={styles.tabItem}
                        onPress={() => {
                            if (active === label) return;  // 이미 활성 탭이면 무시

                            // 🔥 navigate → replace 로 변경하여 스택이 쌓이지 않게 함
                            (navigation as any).replace(route);
                        }}
                    >
                        <Icon
                            name={icon}
                            size={22}
                            color={focused ? "#FFA847" : "#999"}
                        />
                        <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#fff",
        height: 65,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 8,
    },
    tabItem: { alignItems: "center" },
    tabLabel: { fontSize: 11, color: "#999", marginTop: 3 },
    tabLabelActive: { color: "#FFA847", fontWeight: "700" },
});
