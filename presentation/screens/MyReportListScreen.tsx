import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ReportApi, ReportListResponse } from '../../data/api/ReportApi';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { useAlert } from '../../context/AlertContext';

const MAIN_COLOR = '#FFA847';

const MyReportListScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { showAlert } = useAlert();
  const [reports, setReports] = useState<ReportListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Use ref to track loading state for the fetch callback to avoid dependency cycles
  const loadingRef = useRef(false);

  const fetchReports = useCallback(async (isRefresh = false) => { // ✨ status, targetType 파라미터 제거
    if (!token) return;
    if (loadingRef.current && !isRefresh) return; 

    loadingRef.current = true;
    if (isRefresh) {
        setRefreshing(true);
        setPage(0); // 새로고침 시 페이지 0으로 초기화
        setHasMore(true); // 새로고침 시 hasMore도 초기화
    }
    setLoading(true);
    
    try {
      // ✨ ReportApi.getMyReports 호출 시 page와 size 전달 (status, targetType 제거)
      const response = await ReportApi.getMyReports(isRefresh ? 0 : page, 10); 
      
      if (response.code === 200 && response.data) {
        const newReports = isRefresh ? response.data : [...reports, ...response.data];
        setReports(newReports);
        // 백엔드 응답에 totalPages, totalElements가 있다면 hasMore를 계산 (가정)
        // 현재는 응답 데이터 길이를 기반으로 단순 계산
        setHasMore(response.data.length === 10); // 10개 미만이면 마지막 페이지로 간주
        setPage(prevPage => prevPage + 1); // 다음 페이지를 위해 page 증가
      } else {
         console.warn("Unexpected response structure or empty data:", response);
         setHasMore(false);
      }
    } catch (e: any) {
      console.error("❌ [MyReportListScreen] fetchReports 에러 발생:");
      if (e.response) {
         console.error("  상태 코드:", e.response.status);
         console.error("  응답 데이터:", e.response.data);
         console.error("  응답 헤더:", e.response.headers);
      } else if (e.request) {
         console.error("  요청이 이루어졌으나 응답을 받지 못했습니다:", e.request);
      } else {
         console.error("  에러 메시지:", e.message);
      }
      console.error("  전체 에러 객체:", e); // 상세 에러 객체 전체 출력

      if (e.response && e.response.status === 400) {
         showAlert({ title: "오류", message: `잘못된 요청입니다: ${e.response.data?.message || e.response.data || '알 수 없는 오류'}` });
         console.warn("400 Error on fetchReports. Check backend alignment.");
      } else if (e.response && e.response.status === 401) {
         showAlert({ title: "오류", message: "로그인 세션이 만료되었습니다. 다시 로그인해주세요." });
         // TODO: AuthContext의 logout 함수를 호출하여 로그아웃 처리할 수 있습니다.
         // logout();
      }
      else {
         showAlert({ title: "오류", message: "신고 내역을 불러오는데 실패했습니다." });
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchReports(true);
    }, [fetchReports])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0); // This will be ignored since we removed pagination
    setHasMore(false); // Assume all comes at once
    fetchReports(true);
  };

  const handleLoadMore = () => {
    // If the API returns all data at once, there's no "more" to load.
    // This function becomes effectively disabled for this current API setup.
    // If pagination is re-introduced, this logic will need to be re-enabled.
    if (reports.length > 0 && hasMore && !loadingRef.current && !refreshing) {
        console.log("Attempted to load more, but API is not paginated or hasMore is false.");
    }
  };

  const handleDelete = (reportId: number) => {
    showAlert({
      title: "삭제 확인",
      message: "이 신고 내역을 삭제하시겠습니까?",
      confirmText: "삭제",
      cancelText: "취소",
      showCancel: true,
      onConfirm: async () => {
        if (!token) return;
        try {
          await ReportApi.deleteMyReport(reportId);
          setReports(prev => prev.filter(item => item.id !== reportId));
          showAlert({ title: "알림", message: "삭제되었습니다." });
        } catch (e) {
          showAlert({ title: "오류", message: "삭제 중 문제가 발생했습니다." });
        }
      }
    });
  };

  const handleDeleteAll = () => {
    if (reports.length === 0) return;
    
    showAlert({
      title: "전체 삭제",
      message: "모든 신고 내역을 삭제하시겠습니까?",
      confirmText: "삭제",
      cancelText: "취소",
      showCancel: true,
      onConfirm: async () => {
        if (!token) return;
        try {
          await ReportApi.deleteAllMyReports();
          setReports([]);
          showAlert({ title: "알림", message: "모든 내역이 삭제되었습니다." });
        } catch (e) {
          showAlert({ title: "오류", message: "전체 삭제 중 문제가 발생했습니다." });
        }
      }
    });
  };

  const renderItem = ({ item }: { item: ReportListResponse }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{item.createdAt ? format(new Date(item.createdAt), 'yyyy-MM-dd') : '-'}</Text>
        <View style={styles.badgeContainer}>
            <View style={[styles.statusBadge, item.status === 'PENDING' ? styles.pendingBadge : styles.resolvedBadge]}>
            <Text style={[styles.statusText, item.status === 'PENDING' ? styles.pendingText : styles.resolvedText]}>
                {item.status === 'PENDING' ? '처리중' : '처리완료'}
            </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                <Icon name="close" size={18} color="#999" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.reasonTitle}>사유: {item.reason}</Text>
      <Text style={styles.reasonDetail}>{item.reasonDetail}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 문의/신고 내역</Text>
        <TouchableOpacity onPress={handleDeleteAll} disabled={reports.length === 0 || loading}>
          <Text style={[styles.deleteAllText, (reports.length === 0 || loading) && { color: '#ccc' }]}>전체 삭제</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading && !refreshing && reports.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>접수된 문의/신고 내역이 없습니다.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="large" color={MAIN_COLOR} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  deleteAllText: { fontSize: 14, color: '#E53935', fontWeight: '600' },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },

  listContent: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  date: { fontSize: 13, color: '#aaa' },
  badgeContainer: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingBadge: { backgroundColor: '#FFF4E6' },
  resolvedBadge: { backgroundColor: '#E8F5E9' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  pendingText: { color: '#FFA847' },
  resolvedText: { color: '#4CAF50' },

  reasonTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  reasonDetail: { fontSize: 14, color: '#666', lineHeight: 20 },

  footerLoader: {
    paddingVertical: 20,
  },
});

export default MyReportListScreen;
