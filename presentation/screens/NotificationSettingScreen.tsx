import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Linking,
  AppState,
  AppStateStatus,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import messaging, { AuthorizationStatus } from "@react-native-firebase/messaging";
import { NotificationSettingRepositoryImpl } from "../../data/repositoriesImpl/NotificationSettingRepositoryImpl";

const MAIN_COLOR = "#FFA847";

export type AlarmType = "REVIEW_LIKE" | "MATCH_SUCCESS" | "WARNING_ADDED";
export type AlarmSettingsMap = Record<string, boolean>;

const TOGGLES: { type: AlarmType; label: string; description: string }[] = [
  { type: "REVIEW_LIKE", label: "리뷰 좋아요", description: "내 리뷰에 다른 유저가 좋아요를 누르면 알려드려요." },
  { type: "MATCH_SUCCESS", label: "매칭 알림", description: "매칭이 잡히면 알려드려요." },
  { type: "WARNING_ADDED", label: "경고 알림", description: "관리자가 경고를 부여하면 알려드려요." },
];

const DEFAULTS: AlarmSettingsMap = {
  REVIEW_LIKE: true,
  MATCH_SUCCESS: true,
  WARNING_ADDED: true,
};

const NotificationSettingScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const [systemAllowed, setSystemAllowed] = useState<boolean>(false);
  const [settings, setSettings] = useState<AlarmSettingsMap>(DEFAULTS);

  const checkSystemPermission = useCallback(async () => {
    try {
      if (Platform.OS === "android" && Number(Platform.Version) >= 33) {
        const ok = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        setSystemAllowed(ok);
        return ok;
      }


      let auth: any;
      try {
        auth = await (messaging() as any).hasPermission();
      } catch {
        auth = await messaging().requestPermission();
      }

      const ok =
        auth === AuthorizationStatus.AUTHORIZED ||
        auth === AuthorizationStatus.PROVISIONAL;

      setSystemAllowed(ok);
      return ok;
    } catch {

      setSystemAllowed(false);
      return false;
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await NotificationSettingRepositoryImpl.getSettings();
      setSettings({ ...DEFAULTS, ...(data ?? {}) });
    } catch (e: any) {
      console.error("설정 로드 실패:", e);
      setSettings(DEFAULTS);
    } finally {
      setLoading(false);
    }
  }, []);

  // 최초 1회
  useEffect(() => {
    checkSystemPermission();
    fetchSettings();
  }, [checkSystemPermission, fetchSettings]);

  useFocusEffect(
    useCallback(() => {
      checkSystemPermission();
      fetchSettings();
    }, [checkSystemPermission, fetchSettings])
  );

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === "active") {
        checkSystemPermission();
        fetchSettings();
      }
    };

    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, [checkSystemPermission, fetchSettings]);

  const toggleSwitch = async (alarmType: AlarmType) => {
    if (!systemAllowed) {
      Alert.alert(
        "알림 권한이 꺼져있어요",
        "기기 설정에서 알림을 켜야 변경할 수 있어요.",
        [
          { text: "취소", style: "cancel" },
          { text: "설정으로 이동", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const previousValue = settings[alarmType] ?? true;
    const newValue = !previousValue;

    setSettings((prev) => ({ ...prev, [alarmType]: newValue }));

    try {
      await NotificationSettingRepositoryImpl.updateSetting(alarmType, newValue);
    } catch (e) {
      console.error("저장 실패", e);
      setSettings((prev) => ({ ...prev, [alarmType]: previousValue }));
      Alert.alert("저장 실패", "설정을 변경하지 못했습니다.");
    }
  };

  const SettingItem = ({
    label,
    description,
    value,
    onToggle,
    disabled,
  }: {
    label: string;
    description?: string;
    value: boolean;
    onToggle: () => void;
    disabled?: boolean;
  }) => (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.itemLabel}>{label}</Text>
        {description ? <Text style={styles.itemDesc}>{description}</Text> : null}
      </View>
      <Switch
        disabled={disabled}
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
          {!systemAllowed && (
            <TouchableOpacity
              onPress={() => Linking.openSettings()}
              style={styles.permissionBanner}
              activeOpacity={0.9}
            >
              <Text style={styles.permissionTitle}>기기에서 알림 권한이 꺼져 있어요</Text>
              <Text style={styles.permissionDesc}>
                설정에서 알림을 켜야 토글을 변경할 수 있어요. (눌러서 이동)
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>알림</Text>

          {TOGGLES.map((t) => (
            <SettingItem
              key={t.type}
              label={t.label}
              description={t.description}
              value={systemAllowed ? (settings[t.type] ?? true) : false}
              disabled={!systemAllowed}
              onToggle={() => toggleSwitch(t.type)}
            />
          ))}
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
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -10,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#000" },

  content: { padding: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 15,
    marginTop: 10,
  },

  permissionBanner: {
    padding: 12,
    backgroundColor: "#FFF3E8",
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FFE1C7",
  },
  permissionTitle: { fontSize: 14, fontWeight: "700", color: "#333" },
  permissionDesc: { marginTop: 6, fontSize: 12, color: "#666", lineHeight: 16 },

  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  textContainer: { flex: 1, marginRight: 20 },
  itemLabel: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  itemDesc: { fontSize: 13, color: "#999", lineHeight: 18 },
});

export default NotificationSettingScreen;
