import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
<<<<<<< Updated upstream
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ReportApi, ReportListResponse } from '../../data/api/ReportApi';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../core/constants/colors';
=======
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ReportApi, ReportListResponse } from '../../data/api/ReportApi';
import { COLORS } from '../../core/constants/Colors';
>>>>>>> Stashed changes
import { ThemeContext } from '../../context/ThemeContext';
import { Header } from '../components/Header';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types/RootStackParamList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
<<<<<<< Updated upstream
=======
// ⭐ 개별 모달 파일들 임포트
import { SuspendModal } from "../components/SuspendModal";
import { WarningModal } from "../components/WarningModal";
import { SuccessModal } from "../components/SuccessModal";
>>>>>>> Stashed changes

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const AdminReportScreen = () => {
  const navigation = useNavigation<Navigation>();
  // const { token } = useAuth(); // 토큰은 AdminApi에서 자동으로 처리
  const { theme, isDarkMode } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [reports, setReports] = useState<ReportListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter State
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'USER' | 'RESTAURANT'>('ALL');

<<<<<<< Updated upstream
  // Action Modal State
  const [selectedReport, setSelectedReport] = useState<ReportListResponse | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'WARNING' | 'SUSPENSION' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState('7');

  const fetchReports = async (pageNum: number, isRefresh = false, filter = selectedFilter) => {
    // if (!token) return; // authApi가 토큰 처리하므로 불필요
    if (loading) return;
=======
  // 모달 상태
  const [activeModal, setActiveModal] = useState<{
    type: "suspend" | "warning" | null;
    report?: ReportListResponse;
  }>({ type: null, report: undefined });

  const [successModal, setSuccessModal] = useState({
    visible: false,
    type: "",
    user: null,
    extra: "",
  });

  const fetchReports = async (isRefresh = false) => {
    if (loading && !isRefresh) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
>>>>>>> Stashed changes

    setLoading(true);
    try {
<<<<<<< Updated upstream
      // Map filter to targetType
      let targetTypeParam: string | undefined;
      if (filter === 'RESTAURANT') targetTypeParam = 'RESTAURANT';
      else if (filter === 'USER') targetTypeParam = 'USER'; 

      const response = await ReportApi.getAllReports(pageNum, 10, undefined, targetTypeParam); // token 인자 제거

      if (response.code === 200) {
        const newReports = response.data.reports;

        if (isRefresh) {
          setReports(newReports);
        } else {
          setReports((prev) => [...prev, ...newReports]);
        }
        setHasMore(pageNum < response.data.totalPages - 1);
        setPage(pageNum);
=======
      // 필터에 따른 파라미터 설정 (사용자/리뷰는 REVIEW 타입으로 요청)
      let targetTypeParam: string | undefined;
      if (selectedFilter === 'RESTAURANT') targetTypeParam = 'RESTAURANT';
      else if (selectedFilter === 'USER') targetTypeParam = 'REVIEW';

      const response = await ReportApi.getAllReports(0, 1000, undefined, targetTypeParam); 

      if (response.code === 200) {
        const newReports = response.data.reports || response.data.content || response.data || [];
        setReports(newReports);
>>>>>>> Stashed changes
      }
    } catch (error) {
      console.error('신고 목록 조회 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
<<<<<<< Updated upstream
      fetchReports(0, true, selectedFilter);
=======
      fetchReports(true);
>>>>>>> Stashed changes
    }, [selectedFilter])
  );

  const handleRefresh = () => {
<<<<<<< Updated upstream
    setRefreshing(true);
    fetchReports(0, true, selectedFilter);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchReports(page + 1, false, selectedFilter);
    }
=======
    fetchReports(true);
>>>>>>> Stashed changes
  };

  const handleFilterChange = (filter: 'ALL' | 'USER' | 'RESTAURANT') => {
    setSelectedFilter(filter);
<<<<<<< Updated upstream
    setPage(0);
    setReports([]);
    setHasMore(true);
=======
>>>>>>> Stashed changes
  };

  const handleDeleteReport = (reportId: number) => {
    Alert.alert('신고 삭제', '이 신고를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
<<<<<<< Updated upstream
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          // if (!token) return; // authApi가 토큰 처리하므로 불필요
          try {
            const response = await ReportApi.deleteReport(reportId); // token 인자 제거
            if (response.code === 200) {
              Alert.alert('알림', '신고가 삭제되었습니다.');
              handleRefresh();
            } else {
              Alert.alert('오류', '신고 삭제 실패');
            }
          } catch (error) {
            console.error(error);
            Alert.alert('오류', '신고 삭제 중 오류 발생');
=======
      { text: '삭제', style: 'destructive', onPress: async () => {
          try {
            await ReportApi.deleteReport(reportId);
            handleRefresh();
          } catch (error) {
            Alert.alert('오류', '삭제 실패');
>>>>>>> Stashed changes
          }
        }},
    ]);
  };

<<<<<<< Updated upstream
  const openActionModal = (report: ReportListResponse, type: 'WARNING' | 'SUSPENSION') => {
    setSelectedReport(report);
    setActionType(type);
    setActionReason('');
    setSuspensionDays('7');
    setActionModalVisible(true);
  };

  const handleActionSubmit = async () => {
    // if (!token || !selectedReport || !actionType) return; // authApi가 토큰 처리하므로 불필요
    if (!selectedReport || !actionType) return;
    if (!actionReason.trim()) {
      Alert.alert('알림', '사유를 입력해주세요.');
      return;
    }

    try {
      let response;
      if (actionType === 'WARNING') {
        response = await ReportApi.approveWithWarning(selectedReport.id, { // token 인자 제거
          userId: selectedReport.targetId,
          reason: actionReason,
        });
      } else {
        response = await ReportApi.approveWithSuspension(selectedReport.id, { // token 인자 제거
          userId: selectedReport.targetId,
          reason: actionReason,
          durationDays: parseInt(suspensionDays, 10),
        });
      }

      if (response.code === 200) {
        Alert.alert('알림', '처리가 완료되었습니다.');
        setActionModalVisible(false);
        handleRefresh();
      } else {
        Alert.alert('오류', response.message || '처리 실패');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '처리 중 오류 발생');
    }
  };

  const renderItem = ({ item }: { item: ReportListResponse }) => {
    const isRestaurantReport = item.targetType === 'RESTAURANT';
=======
  const renderItem = ({ item }: { item: ReportListResponse }) => {
    const isRestaurantReport = item.targetType === 'RESTAURANT';
    const isPending = item.status === 'PENDING';
>>>>>>> Stashed changes

    return (
      <View style={[styles.card, { backgroundColor: isDarkMode ? theme.card : '#fff' }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: isRestaurantReport ? '#E3F2FD' : '#FFF3E0' }]}>
            <Text style={[styles.badgeText, { color: isRestaurantReport ? '#1976D2' : '#F57C00' }]}>
<<<<<<< Updated upstream
              {item.targetType}
=======
              {isRestaurantReport ? '맛집' : '사용자/리뷰'}
>>>>>>> Stashed changes
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: theme.textSecondary }}>{item.createdAt}</Text>
        </View>

<<<<<<< Updated upstream
        <Text style={[styles.reasonTitle, { color: theme.textPrimary }]}>사유: {item.reason}</Text>
        <Text style={[styles.reasonDetail, { color: theme.textSecondary }]}>{item.reasonDetail}</Text>

        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>신고자 ID: {item.reporterId}</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>대상 ID: {item.targetId}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>상태: </Text>
          <Text style={[styles.statusValue, item.status === 'PENDING' ? styles.pending : styles.completed]}>
            {item.status}
          </Text>
        </View>

        {item.status === 'PENDING' && (
          <View style={styles.actionButtons}>
            {isRestaurantReport ? (
              <TouchableOpacity
                style={[styles.button, styles.checkButton]}
=======
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textPrimary }}>사유: {item.reason}</Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, marginVertical: 8 }}>{item.reasonDetail}</Text>
        
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <Text style={{ fontSize: 12, color: theme.textSecondary }}>대상 ID: {item.targetId}</Text>
          <Text style={{ fontSize: 12, color: isPending ? '#F57C00' : '#388E3C', fontWeight: 'bold' }}>
            {isPending ? '처리 대기' : '처리 완료'}
          </Text>
        </View>

        {isPending && (
          <View style={styles.actionButtons}>
            {isRestaurantReport ? (
              <TouchableOpacity 
                style={styles.checkButton} 
>>>>>>> Stashed changes
                onPress={() => navigation.navigate('AdminRestaurantAdd', { id: item.targetId })}
              >
                <Text style={styles.buttonText}>맛집 확인</Text>
              </TouchableOpacity>
            ) : (
              <>
<<<<<<< Updated upstream
                <TouchableOpacity
                  style={[styles.button, styles.warningButton]}
                  onPress={() => openActionModal(item, 'WARNING')}
                >
                  <Text style={styles.buttonText}>경고</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.suspendButton]}
                  onPress={() => openActionModal(item, 'SUSPENSION')}
=======
                <TouchableOpacity 
                  style={styles.warningButton} 
                  onPress={() => setActiveModal({ type: 'warning', report: item })}
                >
                  <Text style={styles.buttonText}>경고</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suspendButton} 
                  onPress={() => setActiveModal({ type: 'suspend', report: item })}
>>>>>>> Stashed changes
                >
                  <Text style={styles.buttonText}>정지</Text>
                </TouchableOpacity>
              </>
            )}
<<<<<<< Updated upstream

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
=======
            <TouchableOpacity 
              style={styles.deleteButton} 
>>>>>>> Stashed changes
              onPress={() => handleDeleteReport(item.id)}
            >
              <Text style={styles.buttonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#f5f5f5' }]}>
      <Header title="신고 관리" showBackButton onBackPress={() => navigation.goBack()} />
<<<<<<< Updated upstream

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: isDarkMode ? theme.card : '#fff' }]}>
        {(['ALL', 'USER', 'RESTAURANT'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab,
              { borderColor: selectedFilter === filter ? COLORS.primary : 'transparent' }
            ]}
            onPress={() => handleFilterChange(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter ? styles.activeFilterText : { color: theme.textSecondary }
              ]}
            >
              {filter === 'ALL' ? '전체' : filter === 'USER' ? '사용자/리뷰' : '맛집'}
=======
      
      <View style={styles.filterContainer}>
        {(['ALL', 'USER', 'RESTAURANT'] as const).map((f) => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterTab, selectedFilter === f && { borderBottomColor: COLORS.primary }]} 
            onPress={() => handleFilterChange(f)}
          >
            <Text style={[styles.filterText, selectedFilter === f && { color: COLORS.primary }]}>
              {f === 'ALL' ? '전체' : f === 'USER' ? '사용자/리뷰' : '맛집'}
>>>>>>> Stashed changes
            </Text>
          </TouchableOpacity>
        ))}
      </View>

<<<<<<< Updated upstream
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 16 }
        ]}
        ListEmptyComponent={
          !loading ? <Text style={[styles.emptyText, { color: theme.textSecondary }]}>신고 내역이 없습니다.</Text> : null
        }
        ListFooterComponent={loading && !refreshing ? <ActivityIndicator size="small" color={COLORS.primary} /> : null}
      />

      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? theme.card : 'white' }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {actionType === 'WARNING' ? '경고 처리' : '정지 처리'}
            </Text>

            <Text style={[styles.label, { color: theme.textPrimary }]}>처리 사유</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
              placeholder="사유를 입력하세요"
              placeholderTextColor={theme.textSecondary}
              value={actionReason}
              onChangeText={setActionReason}
              multiline
            />

            {actionType === 'SUSPENSION' && (
              <>
                <Text style={[styles.label, { color: theme.textPrimary }]}>정지 기간 (일)</Text>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
                  placeholder="7"
                  placeholderTextColor={theme.textSecondary}
                  value={suspensionDays}
                  onChangeText={setSuspensionDays}
                  keyboardType="number-pad"
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setActionModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleActionSubmit}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
=======
      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={reports} 
          renderItem={renderItem} 
          keyExtractor={(i) => i.id.toString()}
          onRefresh={handleRefresh} 
          refreshing={refreshing}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: theme.textSecondary }}>신고 내역이 없습니다.</Text>
            </View>
          }
        />
      )}

      {/* --- [공통 모달 적용] --- */}
      <SuspendModal
        visible={activeModal.type === "suspend"}
        onClose={() => setActiveModal({ type: null })}
        user={activeModal.report}
        setSuccessModal={setSuccessModal}
        theme={theme}
        onConfirm={async (id: number, days: number, reason: string) => {
          const res = await ReportApi.approveWithSuspension(activeModal.report!.id, { userId: id, reason, durationDays: days });
          return res.code === 200;
        }}
      />

      <WarningModal
        visible={activeModal.type === "warning"}
        onClose={() => setActiveModal({ type: null })}
        user={activeModal.report}
        setSuccessModal={setSuccessModal}
        theme={theme}
        onConfirm={async (id: number, warnings: number, reason: string) => {
          const res = await ReportApi.approveWithWarning(activeModal.report!.id, { userId: id, reason });
          return res.code === 200;
        }}
      />

      <SuccessModal
        onClose={() => { setSuccessModal({ ...successModal, visible: false }); handleRefresh(); }}
        {...successModal}
        theme={theme}
      />
>>>>>>> Stashed changes
    </View>
  );
};

const styles = StyleSheet.create({
<<<<<<< Updated upstream
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterTab: {
    marginRight: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
  },
  activeFilterTab: {
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeFilterText: {
    color: COLORS.primary,
  },
  listContent: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  reasonDetail: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  pending: {
    color: '#F57C00',
  },
  completed: {
    color: '#388E3C',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  checkButton: {
    backgroundColor: '#2196F3',
  },
  warningButton: {
    backgroundColor: '#FFB74D',
  },
  suspendButton: {
    backgroundColor: '#EF5350',
  },
  deleteButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 40,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
=======
  container: { flex: 1 },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterTab: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filterText: { fontSize: 15, fontWeight: '600', color: '#666' },
  card: { borderRadius: 12, padding: 16, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  buttonText: { color: 'white', fontSize: 13, fontWeight: 'bold' },
  checkButton: { backgroundColor: '#2196F3', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  warningButton: { backgroundColor: '#FFB74D', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  suspendButton: { backgroundColor: '#EF5350', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  deleteButton: { backgroundColor: '#9E9E9E', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
>>>>>>> Stashed changes
});

export default AdminReportScreen;