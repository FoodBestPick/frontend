import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  type: string;
  user: any;
  extra: string;
  theme: any;
}

export const SuccessModal = ({
  visible,
  onClose,
  type,
  user,
  extra,
  theme,
}: SuccessModalProps) => {
  if (!visible) return null;

  const getContent = () => {
    switch (type) {
      case "permission":
        return {
          icon: "settings-outline",
          color: "#007AFF",
          title: "권한 변경이 완료되었습니다!",
          subtitle: `${user?.name || user?.email}님의 권한이 ${extra}로 변경되었습니다.`,
          buttonColor: "#007AFF",
        };
      case "suspend":
        const isUnsuspend = extra === "해제";
        return {
          icon: isUnsuspend ? "checkmark-circle-outline" : "close-circle-outline",
          color: isUnsuspend ? "#4CAF50" : "#E53935",
          title: isUnsuspend ? "계정 정지 해제 완료!" : "계정 정지 조치 완료!",
          subtitle: isUnsuspend
            ? `${user?.name || user?.email}님의 계정 정지가 해제되었습니다.`
            : extra === "영구 정지"
            ? `${user?.name || user?.email}님의 계정이 영구 정지되었습니다.`
            : `${user?.name || user?.email}님의 계정이 ${extra}간 정지되었습니다.`,
          buttonColor: isUnsuspend ? "#4CAF50" : "#E53935",
        };
      case "warning":
        return {
          icon: "alert-circle-outline",
          color: "#FF9800",
          title: "경고 추가 완료!",
          subtitle: `경고 ${extra}가 성공적으로 추가되었습니다.`,
          buttonColor: "#FF9800",
        };
      default:
        return {
          icon: "checkmark-circle-outline",
          color: theme.icon,
          title: "",
          subtitle: "",
          buttonColor: theme.icon,
        };
    }
  };

  const { icon, color, title, subtitle, buttonColor } = getContent();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.successBox, { backgroundColor: theme.card }]}>
          <View style={[styles.successIcon, { backgroundColor: `${color}1A` }]}>
            <Ionicons name={icon as any} size={42} color={color} />
          </View>
          <Text style={[styles.successTitle, { color: theme.textPrimary }]}>
            {title}
          </Text>
          <Text style={[styles.successSub, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>

          <TouchableOpacity
            style={[styles.successBtn, { backgroundColor: buttonColor }]}
            onPress={onClose}
          >
            <Text style={styles.successBtnText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 6,
  },
  successSub: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  successBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  successBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});