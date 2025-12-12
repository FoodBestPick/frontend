import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { COLORS } from '../../core/constants/colors';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, reasonDetail: string) => void;
  targetName: string; // 신고 대상 이름 (예: 식당 이름, 리뷰 작성자 등)
}

const REPORT_REASONS = [
  '부적절한 홍보/광고',
  '욕설/비하 발언',
  '허위 사실 유포',
  '개인정보 노출',
  '기타',
];

const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  onSubmit,
  targetName,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [reasonDetail, setReasonDetail] = useState<string>('');

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('알림', '신고 사유를 선택해주세요.');
      return;
    }
    if (selectedReason === '기타' && !reasonDetail.trim()) {
      Alert.alert('알림', '기타 사유를 입력해주세요.');
      return;
    }
    onSubmit(selectedReason, reasonDetail);
    handleClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setReasonDetail('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <Text style={styles.title}>신고하기</Text>
              <Text style={styles.subtitle}>대상: {targetName}</Text>

              <View style={styles.reasonContainer}>
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonItem,
                      selectedReason === reason && styles.reasonItemSelected,
                    ]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        selectedReason === reason && styles.radioCircleSelected,
                      ]}
                    />
                    <Text style={styles.reasonText}>{reason}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedReason === '기타' && (
                <TextInput
                  style={styles.input}
                  placeholder="상세 사유를 입력해주세요 (100자 이내)"
                  maxLength={100}
                  multiline
                  value={reasonDetail}
                  onChangeText={setReasonDetail}
                />
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>신고</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.subtext,
    marginBottom: 20,
    textAlign: 'center',
  },
  reasonContainer: {
    marginBottom: 15,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  reasonItemSelected: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.subtext,
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: '#FFA847',
    backgroundColor: '#FFA847',
  },
  reasonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFA847',
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ReportModal;
