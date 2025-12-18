import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";

interface SuspendModalProps {
  visible: boolean;
  onClose: () => void;
  user: any;
  setSuccessModal: (modal: any) => void;
  theme: any;
  onConfirm: (id: number, days: number, reason: string) => Promise<boolean>;
}

export const SuspendModal = ({
  visible,
  onClose,
  user,
  setSuccessModal,
  theme,
  onConfirm,
}: SuspendModalProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("1일");
  const [reason, setReason] = useState("");
  const periods = ["1일", "3일", "7일", "30일", "영구 정지"];

  const parseDays = (periodStr: string) => {
    switch (periodStr) {
      case "1일":
        return 1;
      case "3일":
        return 3;
      case "7일":
        return 7;
      case "30일":
        return 30;
      case "영구 정지":
        return 36500;
      default:
        return 1;
    }
  };

  const isSuspended = user?.status === "정지";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
            {isSuspended ? "정지 해제" : "계정 상태 변경"}
          </Text>
          <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
            사용자: {user?.name || user?.email}
          </Text>

          <View style={[styles.modalDivider, { borderColor: theme.border }]} />

          {isSuspended ? (
            <View>
              <Text
                style={[
                  styles.modalSub,
                  {
                    color: theme.textPrimary,
                    fontSize: 16,
                    marginVertical: 20,
                  },
                ]}
              >
                해당 사용자의 정지를 해제하시겠습니까?
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
                정지 기간
              </Text>
              <View style={{ marginTop: 8, gap: 10 }}>
                {periods.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.radioItem,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => setSelectedPeriod(p)}
                  >
                    <View
                      style={[styles.radioOuter, { borderColor: theme.icon }]}
                    >
                      {selectedPeriod === p && (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: theme.icon },
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[styles.radioText, { color: theme.textPrimary }]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text
                style={[
                  styles.modalLabel,
                  { color: theme.textSecondary, marginTop: 14 },
                ]}
              >
                정지 사유
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.background,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="정지 사유를 입력해주세요."
                placeholderTextColor={theme.textSecondary}
                multiline
                value={reason}
                onChangeText={setReason}
              />
            </>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                { backgroundColor: theme.background },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: theme.textPrimary }]}>
                취소
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.applyBtn,
                { backgroundColor: isSuspended ? "#4CAF50" : "#E53935" },
              ]}
              onPress={async () => {
                let success;
                if (isSuspended) {
                  success = await onConfirm(user.id, 0, "정지 해제");
                } else {
                  const days = parseDays(selectedPeriod);
                  success = await onConfirm(user.id, days, reason);
                }

                if (success) {
                  onClose();
                  setSuccessModal({
                    visible: true,
                    type: "suspend",
                    user,
                    extra: isSuspended ? "해제" : selectedPeriod,
                  });
                  setReason("");
                  setSelectedPeriod("1일");
                } else {
                  Alert.alert(
                    "실패",
                    isSuspended
                      ? "정지 해제에 실패했습니다."
                      : "유저 정지에 실패했습니다."
                  );
                }
              }}
            >
              <Text style={styles.applyText}>
                {isSuspended ? "해제 적용" : "정지 적용"}
              </Text>
            </TouchableOpacity>
          </View>
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
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  modalSub: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  modalDivider: {
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginVertical: 6,
  },
  modalLabel: {
    fontSize: 14,
    color: "#888",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  radioText: {
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    minHeight: 120,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#F2F4F6",
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: "center",
  },
  applyBtn: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#000",
    fontWeight: "bold",
  },
  applyText: {
    color: "#fff",
    fontWeight: "bold",
  },
});