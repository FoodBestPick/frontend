import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Header } from "../components/Header";
import { ThemeContext } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types/RootStackParamList";
import { CacheResetModal } from "../components/CacheResetModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⭐ [추가] AuthContext 가져오기
import { useAuth } from "../../context/AuthContext";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export const AdminSettingScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { isDarkMode, toggleDarkMode, theme } = useContext(ThemeContext);

  // ⭐ [추가] AuthContext에서 logout 함수 가져오기
  const { logout } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = (label: string) => {
    console.log(`${label} 클릭됨`);
  };

  // ⭐ [수정] 로그아웃 로직 변경
  const handleLogout = async () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "로그아웃",
          style: "destructive",
          onPress: async () => {
            // Context의 logout 함수 호출 -> App.tsx에서 상태 감지 -> 로그인 화면으로 자동 전환
            await logout();
          }
        }
      ]
    );
  };

  const handleCacheReset = async () => {
    // 주의: AsyncStorage.clear()는 로그인 토큰까지 다 날릴 수 있으니 조심해야 함
    // 여기서는 캐시 초기화 의도에 맞게 필요한 키만 지우거나, clear 후 재로그인 유도 등 정책 필요
    // 일단 기존 로직 유지하되, 로그아웃 될 수 있음을 인지해야 함
    await AsyncStorage.clear();
    toggleDarkMode(false);

    // clear() 하면 토큰도 날아가므로 로그아웃 처리와 동일하게 동작하게 됨
    // 안전하게 logout() 호출해서 상태 동기화
    await logout();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="설정" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="delete-sweep" size={22} color={theme.icon} />
          <Text style={[styles.itemText, { color: theme.textPrimary }]}>
            캐시 초기화
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

        <TouchableOpacity
          style={[
            styles.logoutRow,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={22} color="#E53935" />
          <Text style={[styles.logoutText]}>로그아웃</Text>
          <View style={{ flex: 1 }} />
          <MaterialIcons name="chevron-right" size={22} color="#E53935" />
        </TouchableOpacity>
      </ScrollView>

      <CacheResetModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onConfirm={handleCacheReset}
      />
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