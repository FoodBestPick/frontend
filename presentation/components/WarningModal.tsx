import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
  StyleSheet,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type Props = {
  visible: boolean;
  onClose: () => void;
  user: any;
  setSuccessModal: (v: { visible: boolean; type: string; user: any; extra: string }) => void;
  theme: any;
  onConfirm: (userId: number, warningsToAdd: number, reason: string) => Promise<boolean>;
};

export const WarningModal = ({
  visible,
  onClose,
  user,
  setSuccessModal,
  theme,
  onConfirm,
}: Props) => {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [level, setLevel] = useState("1회");

  const levelOptions = [
    { label: "1회", value: "1회" },
    { label: "2회", value: "2회" },
    { label: "3회", value: "3회" },
    { label: "4회", value: "4회" },
    { label: "5회", value: "5회" },
  ];

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (visible) {
      setReason("");
      setDetail("");
      setLevel("1회");
    }
  }, [visible]);

  if (!visible) return null;

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
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>경고 추가</Text>
          <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
            사용자: {user?.email ?? user?.name ?? ""}
          </Text>

          <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>경고 사유</Text>
          <RNTextInput
            style={[
              styles.textField,
              {
                backgroundColor: theme.background,
                color: theme.textPrimary,
                borderColor: theme.border,
              },
            ]}
            placeholder="예: 부적절한 리뷰 작성"
            placeholderTextColor={theme.textSecondary}
            value={reason}
            onChangeText={setReason}
          />

          <RNTextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.background,
                color: theme.textPrimary,
                borderColor: theme.border,
              },
            ]}
            placeholder="경고 사유를 구체적으로 입력해주세요."
            placeholderTextColor={theme.textSecondary}
            multiline
            value={detail}
            onChangeText={setDetail}
          />

          <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>경고 수준</Text>
          <Dropdown
            style={[
              styles.dropdownField,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
            data={levelOptions}
            labelField="label"
            valueField="value"
            value={level}
            placeholder="선택하세요"
            placeholderStyle={{ color: theme.textSecondary }}
            selectedTextStyle={{ color: theme.textPrimary }}
            itemTextStyle={{ color: theme.textPrimary }}
            activeColor={theme.background}
            onChange={(item) => setLevel(item.value)}
          />

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: theme.background }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: theme.textPrimary }]}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: "#FF5252" }]}
              onPress={async () => {
                const warningsToAdd = parseInt(level.replace("회", ""), 10) || 1;
                const fullReason = `${reason} - ${detail}`;

                const success = await onConfirm(user?.id, warningsToAdd, fullReason);

                if (success) {
                  onClose();
                  setSuccessModal({ visible: true, type: "warning", user, extra: level });
                } else {
                  Alert.alert("실패", "경고 추가에 실패했습니다.");
                }
              }}
            >
              <Text style={styles.applyText}>경고 추가</Text>
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
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    marginTop: 10,
  },
  textField: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    minHeight: 120,
    textAlignVertical: "top",
  },
  dropdownField: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10, // 12에서 10으로 축소
    borderRadius: 10,
    marginRight: 8,
    alignItems: "center",
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 10, // 12에서 10으로 축소
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    fontWeight: "bold",
    fontSize: 17, // 15에서 17로 확대
  },
  applyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17, // 15에서 17로 확대
  },
});
  