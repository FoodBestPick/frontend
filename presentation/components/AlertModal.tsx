import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const MAIN_COLOR = '#FFA847';

interface AlertModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const AlertModal = ({
  visible,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  showCancel = false,
}: AlertModalProps) => {
  const { theme } = useContext(ThemeContext);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: '#fff' }]}>
          {title && (
            <Text style={[styles.modalTitle, { color: '#111' }]}>{title}</Text>
          )}
          <Text style={[styles.modalSub, { color: '#666' }]}>{message}</Text>

          {/* 구분선 (선택사항, 깔끔함을 위해 제거하거나 연하게 추가) */}
          {/* <View style={[styles.modalDivider, { borderColor: '#eee' }]} /> */}

          <View style={styles.modalFooter}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: '#F2F4F6' }]}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={[styles.cancelText, { color: '#000' }]}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.applyBtn,
                { backgroundColor: MAIN_COLOR, marginLeft: showCancel ? 12 : 0 }
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.applyText}>{confirmText}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: width * 0.75,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 24, // 32에서 24로 더 축소
    paddingBottom: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20, // 본문을 제목으로부터 더 아래로 밀어냄
  },
  modalSub: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24, // 버튼과의 간격을 좁혀서 전체 높이가 늘어나지 않게 함
    lineHeight: 24,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F2F4F6',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: MAIN_COLOR,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 17,
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  // applyBtn 스타일 내의 marginLeft 수정 (showCancel 조건부 스타일)
  applyBtnWithMargin: {
    marginLeft: 12,
  }
});