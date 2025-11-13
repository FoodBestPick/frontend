import React, { useContext, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ThemeContext } from "../../context/ThemeContext";

export const CacheResetModal = ({ visible, onCancel, onConfirm }: any) => {
  const { theme } = useContext(ThemeContext);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!visible) setIsSuccess(false);
  }, [visible]);

  const handleConfirm = async () => {
    try {
      await onConfirm?.();
      setTimeout(() => setIsSuccess(true), 100);
    } catch (e) {
      console.error("캐시 초기화 오류:", e);
    }
  };

  const handleCloseSuccess = () => {
    setIsSuccess(false);
    onCancel?.();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent>
      <View style={styles.overlay}>
        {!isSuccess && (
          <View
            style={[
              styles.container,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}>
              <MaterialIcons name="warning-amber" size={40} color="#E53935" />
            </View>

            <Text style={[styles.title, { color: theme.textPrimary }]}>
              캐시를 초기화하시겠습니까?
            </Text>
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              모든 임시 데이터가 삭제되며 되돌릴 수 없습니다.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleConfirm}
              >
                <Text style={styles.deleteText}>초기화</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.border }]}
                onPress={onCancel}
              >
                <Text
                  style={[styles.cancelText, { color: theme.textSecondary }]}
                >
                  취소
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isSuccess && (
          <View
            style={[
              styles.container,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}>
              <MaterialIcons name="check-circle" size={40} color="#4CAF50" />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              캐시 초기화 완료!
            </Text>
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              임시 데이터가 성공적으로 삭제되었습니다.
            </Text>

            <TouchableOpacity
              style={[styles.confirmButton]}
              onPress={handleCloseSuccess}
            >
              <Text style={styles.confirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2C2C2C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "600" },
  deleteText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  confirmButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    width: "80%",
  },
  confirmText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
