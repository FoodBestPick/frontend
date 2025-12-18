import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ReportApi, ReportListResponse } from '../../data/api/ReportApi';
import { COLORS } from '../../core/constants/Colors';
import { ThemeContext } from '../../context/ThemeContext';
import { Header } from '../components/Header';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types/RootStackParamList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// ⭐ 개별 모달 파일들 임포트 (디자인 일관성 유지)
import { SuspendModal } from "../components/SuspendModal";
import { WarningModal } from "../components/WarningModal";
import { SuccessModal } from "../components/SuccessModal";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const AdminReportScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { theme, isDarkMode } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [reports, setReports] = useState<ReportListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter State
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'USER' | 'RESTAURANT'>('ALL');

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

    try {
      // 📱 필터 작동: 사용자/리뷰 필터 시 'REVIEW' 파라미터 전달
      let targetTypeParam: string | undefined;
      if (selectedFilter === 'RESTAURANT') targetTypeParam = 'RESTAURANT';
      else if (selectedFilter === 'USER') targetTypeParam = 'REVIEW';

      const response = await ReportApi.getAllReports(0, 1000, undefined, targetTypeParam); 

      if (response.code === 200) {
        const newReports = response.data.reports || response.data.content || response.data || [];
        setReports(newReports);
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
      fetchReports(true);
    }, [selectedFilter])
  );

  const handleRefresh = () => {
    fetchReports(true);
  };

  const handleFilterChange = (filter: 'ALL' | 'USER' | 'RESTAURANT') => {
    setSelectedFilter(filter);
  };

  const handleDeleteReport = (reportId: number) => {
    Alert.alert('신고 삭제', '이 신고를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
          try {
            await ReportApi.deleteReport(reportId);
            handleRefresh();
          } catch (error) {
            Alert.alert('오류', '삭제 실패');
          }
        }},
    ]);
  };

  const renderItem = ({ item }: { item: ReportListResponse }) => {
    const isRestaurantReport = item.targetType === 'RESTAURANT';
    const isPending = item.status === 'PENDING';

    return (
      <View style={[styles.card, { backgroundColor: isDarkMode ? theme.card : '#fff' }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: isRestaurantReport ? '#E3F2FD' : '#FFF3E0' }]}>
            <Text style={[styles.badgeText, { color: isRestaurantReport ? '#1976D2' : '#F57C00' }]}>
              {isRestaurantReport ? '맛집' : '사용자/리뷰'}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: theme.textSecondary }}>{item.createdAt}</Text>
        </View>

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
                onPress={() => navigation.navigate('AdminRestaurantAdd', { id: item.targetId })}
              >
                <Text style={styles.buttonText}>맛집 확인</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.warningButton} 
                  onPress={() => setActiveModal({ type: 'warning', report: item })}
                >
                  <Text style={styles.buttonText}>경고</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suspendButton} 
                  onPress={() => setActiveModal({ type: 'suspend', report: item })}
                >
                  <Text style={styles.buttonText}>정지</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity 
              style={styles.deleteButton} 
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
      
      <View style={styles.filterContainer}>
        {(['ALL', 'USER', 'RESTAURANT'] as const).map((f) => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterTab, selectedFilter === f && { borderBottomColor: COLORS.primary }]} 
            onPress={() => handleFilterChange(f)}
          >
            <Text style={[styles.filterText, selectedFilter === f && { color: COLORS.primary }]}>
              {f === 'ALL' ? '전체' : f === 'USER' ? '사용자/리뷰' : '맛집'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default AdminReportScreen;
