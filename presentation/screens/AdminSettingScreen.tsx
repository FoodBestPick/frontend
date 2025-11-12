import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Header } from "../components/Header";
import { ThemeContext } from "../../context/ThemeContext";

export const AdminSettingScreen = () => {
  const { isDarkMode, toggleDarkMode, theme } = useContext(ThemeContext);

  const handlePress = (label: string) => {
    Alert.alert(label, `${label} 클릭됨`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="설정" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 🔹 계정 관리 */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          계정 관리
        </Text>

        <TouchableOpacity
          style={[styles.itemRow, { backgroundColor: theme.card }]}
          onPress={() => handlePress("내 프로필")}
        >
          <MaterialIcons name="person" size={22} color={theme.icon} />
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>
            내 프로필
          </Text>
          <View style={{ flex: 1 }} />
          <MaterialIcons
            name="chevron-right"
            size={22}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.itemRow, { backgroundColor: theme.card }]}
          onPress={() => handlePress("비밀번호 변경")}
        >
          <MaterialIcons name="lock" size={22} color={theme.icon} />
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>
            비밀번호 변경
          </Text>
          <View style={{ flex: 1 }} />
          <MaterialIcons
            name="chevron-right"
            size={22}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.itemRow, { backgroundColor: theme.card }]}
          onPress={() => handlePress("접속 기록")}
        >
          <MaterialIcons name="history" size={22} color={theme.icon} />
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>
            접속 기록
          </Text>
          <View style={{ flex: 1 }} />
          <MaterialIcons
            name="chevron-right"
            size={22}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        {/* 🔹 시스템 설정 */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          시스템 설정
        </Text>

        <View style={[styles.itemRow, { backgroundColor: theme.card }]}>
          <MaterialIcons name="brightness-6" size={22} color={theme.icon} />
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>
            다크 모드
          </Text>
          <View style={{ flex: 1 }} />
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            thumbColor={isDarkMode ? theme.icon : "#f4f3f4"}
            trackColor={{ false: "#ccc", true: "#66b2ff55" }}
          />
        </View>

        <TouchableOpacity
          style={[styles.itemRow, { backgroundColor: theme.card }]}
          onPress={() => handlePress("알림 설정")}
        >
          <MaterialIcons name="notifications" size={22} color={theme.icon} />
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>
            알림 설정
          </Text>
          <View style={{ flex: 1 }} />
          <MaterialIcons
            name="chevron-right"
            size={22}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.itemRow, { backgroundColor: theme.card }]}
          onPress={() => handlePress("데이터 백업/복원")}
        >
          <MaterialIcons name="backup" size={22} color={theme.icon} />
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>
            데이터 백업/복원
          </Text>
          <View style={{ flex: 1 }} />
          <MaterialIcons
            name="chevron-right"
            size={22}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        {/* 🔹 기타 */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          기타
        </Text>

        <TouchableOpacity
          style={[styles.itemRow, { backgroundColor: theme.card }]}
          onPress={() => handlePress("공지사항")}
        >
          <MaterialIcons name="campaign" size={22} color={theme.icon} />
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>
            공지사항
          </Text>
          <View style={{ flex: 1 }} />
          <MaterialIcons
            name="chevron-right"
            size={22}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.itemRow, { backgroundColor: theme.card }]}
          onPress={() => handlePress("이용 약관")}
        >
          <MaterialIcons name="description" size={22} color={theme.icon} />
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>
            이용 약관
          </Text>
          <View style={{ flex: 1 }} />
          <MaterialIcons
            name="chevron-right"
            size={22}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.itemRow, { backgroundColor: theme.card }]}
          onPress={() => handlePress("앱 버전 정보")}
        >
          <MaterialIcons name="info-outline" size={22} color={theme.icon} />
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>
            앱 버전 정보
          </Text>
          <View style={{ flex: 1 }} />
          <Text style={[styles.versionLabel, { color: theme.textSecondary }]}>
            v1.0.0
          </Text>
          <MaterialIcons
            name="chevron-right"
            size={22}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        {/* 🔻 로그아웃 (맨 아래 고정) */}
        <TouchableOpacity
          style={[
            styles.logoutRow,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => handlePress("로그아웃")}
        >
          <MaterialIcons name="logout" size={22} color="#E53935" />
          <Text style={[styles.logoutText]}>로그아웃</Text>
          <View style={{ flex: 1 }} />
          <MaterialIcons name="chevron-right" size={22} color="#E53935" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 28,
    borderWidth: 1,
  },
  itemText: { fontSize: 15, marginLeft: 10 },
  versionLabel: { fontSize: 14, marginRight: 6 },
  logoutText: {
    fontSize: 15,
    marginLeft: 10,
    color: "#E53935",
    fontWeight: "600",
  },
});
