import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useNotificationViewModel } from "../viewmodels/useNotificationViewModel";
import { Alarm } from "../../data/repositoriesImpl/AlarmRepositoryImpl";

const MAIN_COLOR = '#FFA847';

// 🎨 [유저용] 아이콘 및 라벨 매칭 (스웨거 Enum 기준)
const userCategoryMap: any = {
  REVIEW_LIKE: { icon: "heart-outline", color: "#E53935", label: "좋아요" },
  REVIEW_COMMENT: { icon: "chatbubble-outline", color: "#1E88E5", label: "댓글" },
  INQUIRY_ANSWER: { icon: "help-circle-outline", color: "#4CAF50", label: "답변" },
  WARNING_ADDED: { icon: "alert-circle-outline", color: "#FF9800", label: "경고" },
  MATCH_SUCCESS: { icon: "people-outline", color: "#9C27B0", label: "매칭" },
  SYSTEM: { icon: "megaphone-outline", color: "#757575", label: "공지" },

  DEFAULT: { icon: "notifications-outline", color: "#FFA847", label: "알림" }
};

// --- [Sub Components] ---
const RadioButton = ({ label, selected, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[styles.radioRow, { backgroundColor: selected ? "#FFECE6" : "#FFFFFF", borderColor: selected ? MAIN_COLOR : "#E0E0E0" }]}
  >
    <View style={[styles.radioCircle, { borderColor: selected ? MAIN_COLOR : "#E0E0E0" }]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={[styles.radioText, { color: selected ? MAIN_COLOR : '#333' }]}>{label}</Text>
  </TouchableOpacity>
);

const FilterModal = ({ isVisible, onClose, currentReadFilter, onApplyFilter }: any) => {
  const [tempReadFilter, setTempReadFilter] = useState(currentReadFilter);
  const handleApply = () => { onApplyFilter(tempReadFilter); onClose(); };
  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>알림 필터</Text>
            <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={24} color="#333" /></TouchableOpacity>
          </View>
          <Text style={styles.sectionLabel}>읽음 상태</Text>
          <RadioButton label="모두 보기" selected={tempReadFilter === "ALL"} onPress={() => setTempReadFilter("ALL")} />
          <RadioButton label="읽지 않음" selected={tempReadFilter === "UNREAD"} onPress={() => setTempReadFilter("UNREAD")} />
          <RadioButton label="읽음" selected={tempReadFilter === "READ"} onPress={() => setTempReadFilter("READ")} />
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.resetButton} onPress={() => setTempReadFilter("ALL")}><Text style={styles.resetButtonText}>초기화</Text></TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}><Text style={styles.applyButtonText}>적용</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

function UserNotificationScreen() {
  const navigation = useNavigation<any>();

  const {
    notifications,
    loading,
    fetchAlarms,
    markAsRead,
    markAllAsRead,
    deleteAlarm,
    deleteAllAlarms
  } = useNotificationViewModel();

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [readFilter, setReadFilter] = useState<"UNREAD" | "READ" | "ALL">("ALL");

  useFocusEffect(
    useCallback(() => {
      fetchAlarms();
    }, [fetchAlarms])
  );

  const filteredNotifications = notifications.filter((item) => {
    if (readFilter === "UNREAD" && item.read) return false;
    if (readFilter === "READ" && !item.read) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotificationItem = (item: Alarm) => {
    const iconData = userCategoryMap[item.alarmType] || userCategoryMap.DEFAULT;
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.card, isUnread && styles.unreadCardHighlight]}
        activeOpacity={0.8}
        onPress={() => markAsRead(item.id)}
      >
        {isUnread && <View style={styles.unreadDot} />}
        <View style={[styles.iconCircle, { backgroundColor: iconData.color + "20" }]}>
          <Icon name={iconData.icon} size={24} color={iconData.color} />
        </View>
        <View style={styles.textContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
            <Text style={{ fontSize: 13, color: iconData.color, fontWeight: '600' }}>{iconData.label}</Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <Text style={[styles.title, isUnread && styles.unreadTitle]}>{item.message}</Text>
        </View>
        <TouchableOpacity onPress={() => deleteAlarm(item.id)} style={{ padding: 10 }}>
          <Icon name="close" size={20} color="#CCC" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <TouchableOpacity onPress={() => setIsFilterModalVisible(true)} style={styles.headerButton}>
          <Icon name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllReadText}>모두 읽음 표시 ({unreadCount}개)</Text>
            </TouchableOpacity>
          ) : (
            <View /> 
          )}

          {notifications.length > 0 && (
            <TouchableOpacity onPress={deleteAllAlarms}>
              <Text style={styles.deleteAllText}>전체 삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAlarms} />}
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(renderNotificationItem)
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off-outline" size={50} color="#CCC" />
            <Text style={styles.emptyText}>새로운 알림이 없습니다.</Text>
          </View>
        )}
      </ScrollView>

      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        currentReadFilter={readFilter}
        onApplyFilter={setReadFilter}
      />
    </SafeAreaView>
  );
};

export default UserNotificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000', flex: 1, textAlign: 'center', marginLeft: 44, marginRight: 44 },
  markAllReadText: { color: MAIN_COLOR, fontWeight: "600", fontSize: 14 },
  deleteAllText: { color: '#E53935', fontWeight: "600", fontSize: 14 },
  listHeader: { paddingHorizontal: 16, paddingTop: 10, marginBottom: 15 },
  listContainer: { flex: 1, paddingTop: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 50, paddingHorizontal: 16 },
  emptyText: { color: '#AAA', marginTop: 10, fontSize: 16 },
  card: { flexDirection: "row", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EEE', marginBottom: 16, marginHorizontal: 16, alignItems: 'center', backgroundColor: '#fff', elevation: 2 },
  unreadCardHighlight: { borderColor: MAIN_COLOR, borderWidth: 1.5 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: MAIN_COLOR, position: 'absolute', left: 8, top: 8 },
  iconCircle: { width: 48, height: 48, borderRadius: 999, justifyContent: "center", alignItems: "center", marginRight: 16 },
  textContainer: { flex: 1, justifyContent: 'center', marginRight: 10 },
  title: { fontSize: 15, fontWeight: "500", color: '#333' },
  unreadTitle: { fontWeight: '700' },
  time: { fontSize: 12, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalBox: { backgroundColor: "#FFFFFF", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, width: '100%' },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: '#000' },
  sectionLabel: { fontSize: 15, fontWeight: "600", marginBottom: 12, color: '#333' },
  footerButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  resetButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, borderWidth: 1, borderColor: "#bbb", width: '48%', alignItems: 'center' },
  resetButtonText: { color: '#999', fontWeight: '600' },
  applyButton: { backgroundColor: MAIN_COLOR, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, width: '48%', alignItems: 'center' },
  applyButtonText: { color: "#fff", fontWeight: "700" },
  radioRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 10 },
  radioCircle: { width: 20, height: 20, borderRadius: 999, borderWidth: 2, justifyContent: "center", alignItems: "center", marginRight: 12 },
  radioInner: { width: 10, height: 10, borderRadius: 999, backgroundColor: MAIN_COLOR },
  radioText: { fontWeight: "500" },
});