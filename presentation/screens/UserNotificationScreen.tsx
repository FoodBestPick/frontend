import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // 필터 모달용 아이콘
import { useNavigation } from '@react-navigation/native';

const MAIN_COLOR = '#FFA847';
const CARD_BG_UNREAD_HIGHLIGHT = '#FFF4E6';

// 🔥 알림 타입 정의 (유저 관련)
type ReadFilterType = "UNREAD" | "READ" | "ALL";
type NotiCategory = "COUPON" | "REVIEW_LIKE" | "SYSTEM" | "REPLY" | "ALL";

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'COUPON', title: "새 쿠폰 도착!", message: "할인 쿠폰이 지급되었습니다. 지금 확인하세요.", createdAt: "5분 전", read: false },
  { id: '2', type: 'REVIEW_LIKE', title: "내 리뷰에 좋아요 ❤️", message: "맛잘알님이 회원님의 리뷰에 하트를 눌렀어요.", createdAt: "1시간 전", read: false },
  { id: '3', type: 'SYSTEM', title: "점검 안내", message: "서비스 안정화를 위한 정기 점검이 있습니다.", createdAt: "어제", read: true },
  { id: '4', type: 'REPLY', title: "댓글 알림", message: "회원님의 댓글에 답변이 달렸습니다.", createdAt: "오전 10:12", read: true },
];

const userCategoryMap: any = {
  COUPON: { icon: "gift-outline", color: "#FB8C00" },
  REVIEW_LIKE: { icon: "heart-outline", color: "#E53935" },
  SYSTEM: { icon: "megaphone-outline", color: "#757575" },
  REPLY: { icon: "chatbubble-outline", color: "#1E88E5" },
};

// 🔥 [새 컴포넌트] Radio Button (Admin 코드에서 가져옴)
const RadioButton = ({ label, selected, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[
      styles.radioRow,
      {
        backgroundColor: selected ? "#FFECE6" : "#FFFFFF",
        borderColor: selected ? MAIN_COLOR : "#E0E0E0",
      },
    ]}
  >
    <View
      style={[
        styles.radioCircle,
        { borderColor: selected ? MAIN_COLOR : "#E0E0E0" },
      ]}
    >
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={[styles.radioText, { color: selected ? MAIN_COLOR : '#333' }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// 🔥 [새 컴포넌트] 필터 모달
const FilterModal = ({
  isVisible, onClose, currentReadFilter, onApplyFilter
}: any) => {
  const [tempReadFilter, setTempReadFilter] = useState<ReadFilterType>(currentReadFilter);

  const handleApply = () => {
    onApplyFilter(tempReadFilter);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>알림 필터</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* 읽음 상태 필터 */}
          <Text style={styles.sectionLabel}>읽음 상태</Text>

          <RadioButton
            label="모두 보기"
            selected={tempReadFilter === "ALL"}
            onPress={() => setTempReadFilter("ALL")}
          />
          <RadioButton
            label="읽지 않음"
            selected={tempReadFilter === "UNREAD"}
            onPress={() => setTempReadFilter("UNREAD")}
          />
          <RadioButton
            label="읽음"
            selected={tempReadFilter === "READ"}
            onPress={() => setTempReadFilter("READ")}
          />

          <View style={styles.divider} />

          {/* 하단 버튼 */}
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setTempReadFilter("ALL")}
            >
              <Text style={styles.resetButtonText}>초기화</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


function UserNotificationScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  // 🔥 [추가] 필터 상태
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [readFilter, setReadFilter] = useState<ReadFilterType>("ALL");


  // 🔥 필터링 로직 (Admin 코드 기반)
  const filteredNotifications = notifications.filter((item) => {
    if (readFilter === "UNREAD" && item.read) return false;
    if (readFilter === "READ" && !item.read) return false;
    // 유저용은 카테고리 필터는 일단 생략하고 읽음 상태만 봅니다.
    return true;
  });


  const handleMarkAllRead = () => {
    setNotifications(notifications.map(item => ({ ...item, read: true })));
    setReadFilter("ALL"); // 모두 읽었으니 필터도 ALL로 변경
  };

  const handleApplyFilter = (newFilter: ReadFilterType) => {
    setReadFilter(newFilter);
  };


  const renderNotificationItem = (item: typeof MOCK_NOTIFICATIONS[0]) => {
    const iconData = userCategoryMap[item.type];
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.card,
          isUnread && styles.unreadCardHighlight,
        ]}
        activeOpacity={0.8}
        onPress={() => {
          setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
        }}
      >
        <View style={styles.unreadDot} />

        <View style={[styles.iconCircle, { backgroundColor: iconData.color + "20" }]}>
          <Icon name={iconData.icon} size={24} color={iconData.color} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, isUnread && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.message} numberOfLines={1}>
            {item.message}
          </Text>
          <Text style={styles.time}>
            {item.createdAt}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>알림</Text>

        <TouchableOpacity
          // 🔥 설정 버튼을 필터 모달 여는 버튼으로 사용
          onPress={() => setIsFilterModalVisible(true)}
          style={styles.headerButton}
        >
          <Icon name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllReadText}>
              모두 읽음으로 표시 ({unreadCount}개)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.listContainer}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(renderNotificationItem)
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off-outline" size={50} color="#CCC" />
            <Text style={styles.emptyText}>적용된 필터 조건에 맞는 알림이 없습니다.</Text>
          </View>
        )}
      </ScrollView>

      {/* 🔥 필터 모달 호출 */}
      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        currentReadFilter={readFilter}
        onApplyFilter={handleApplyFilter}
      />
    </SafeAreaView>
  );
};

export default UserNotificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // 🔥 헤더 스타일
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 2, // 높이 압축
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonOffset: { marginLeft: -10 },
  settingsButtonOffset: { marginRight: -10 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginLeft: 44, // 좌우 버튼 영역 확보
    marginRight: 44, // 좌우 버튼 영역 확보
  },

  // 🔥 목록 상단 및 간격 스타일
  markAllReadText: { color: MAIN_COLOR, fontWeight: "600", fontSize: 14 },
  listHeader: { paddingHorizontal: 16, paddingTop: 10, marginBottom: 15 }, // 🔥 간격 확보: 알림 목록과 분리
  listContainer: { flex: 1, paddingTop: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 50, paddingHorizontal: 16 },
  emptyText: { color: '#AAA', marginTop: 10, fontSize: 16 },

  // 카드 스타일
  card: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 16, // 🔥 카드 간 간격
    marginHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  unreadCardHighlight: { borderColor: MAIN_COLOR, borderWidth: 1.5 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: MAIN_COLOR, position: 'absolute', left: 8, top: 8 },
  iconCircle: { width: 48, height: 48, borderRadius: 999, justifyContent: "center", alignItems: "center", marginRight: 16 },
  textContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: "500", color: '#333' },
  unreadTitle: { fontWeight: '700' },
  message: { fontSize: 14, color: '#666', marginTop: 2 },
  time: { fontSize: 12, color: '#999', marginTop: 4 },

  // 🔥 [모달 스타일] Admin 필터 모달 기반 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end", // 바닥에 붙이기
  },
  modalBox: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: '#000',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 20,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bbb",
    width: '48%',
    alignItems: 'center',
  },
  resetButtonText: { color: '#999', fontWeight: '600' },
  applyButton: {
    backgroundColor: MAIN_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  applyButtonText: { color: "#fff", fontWeight: "700" },

  // 🔥 [모달 서브 컴포넌트 스타일]
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: MAIN_COLOR,
  },
  radioText: {
    fontWeight: "500",
  },
});