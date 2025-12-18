import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ReportApi, ReportListResponse } from "../../data/api/ReportApi";
import { COLORS } from "../../core/constants/colors";
import { ThemeContext } from "../../context/ThemeContext";
import { Header } from "../components/Header";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types/RootStackParamList";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WarningModal } from "../components/WarningModal";
import { SuspendModal } from "../components/SuspendModal";
import { SuccessModal } from "../components/SuccessModal";

import { AdminRepositoryImpl } from "../../data/repositoriesImpl/AdminRepositoryImpl";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const AdminReportScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { theme, isDarkMode } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [allReports, setAllReports] = useState<ReportListResponse[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter State
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "USER" | "RESTAURANT">("ALL");

  // 모달 상태
  const [activeModal, setActiveModal] = useState<{
    type: "warning" | "suspend" | null;
    user?: any;
  }>({ type: null, user: null });

  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    type: string;
    user: any;
    extra: string;
  }>({
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
      const response = await ReportApi.getAllReports(0, 10000);

      if (response.code === 200) {
        const newReports = response.data?.reports || response.data || [];
        setAllReports(newReports);
        applyFilter(newReports, selectedFilter);
      } else {
        Alert.alert("오류", response.message || "신고 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("신고 목록 조회 실패:", error);
      Alert.alert("오류", "신고 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 필터 적용 함수
  const applyFilter = (reports: ReportListResponse[], filter: "ALL" | "USER" | "RESTAURANT") => {
    let filtered = [...reports];

    if (filter === "USER") {
      filtered = filtered.filter((r) => r.targetType === "USER" || r.targetType === "REVIEW");
    } else if (filter === "RESTAURANT") {
      filtered = filtered.filter((r) => r.targetType === "RESTAURANT");
    }

    setFilteredReports(filtered);
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports(true);
    }, [])
  );

  const handleFilterChange = (filter: "ALL" | "USER" | "RESTAURANT") => {
    if (selectedFilter === filter) return;
    setSelectedFilter(filter);
    applyFilter(allReports, filter);
  };

  const handleDeleteReport = (reportId: number) => {
    Alert.alert("신고 삭제", "이 신고를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await ReportApi.deleteReport(reportId);
            if (response.code === 200) {
              Alert.alert("알림", "신고가 삭제되었습니다.");
              fetchReports(true);
            } else {
              Alert.alert("오류", response.message || "신고 삭제 실패");
            }
          } catch (error) {
            console.error(error);
            Alert.alert("오류", "신고 삭제 중 오류 발생");
          }
        },
      },
    ]);
  };

  // ✅ 정지/해제 처리 (AdminUserScreen과 동일 흐름)
  const handleSuspend = async (userId: number, days: number, reason: string) => {
    try {
      if (days === 0) {
        await AdminRepositoryImpl.unsuspendUser(userId);
      } else {
        await AdminRepositoryImpl.suspendUser(userId, days, reason);
      }
      return true;
    } catch (error) {
      console.error("정지 처리 실패:", error);
      return false;
    }
  };

  // ✅ 경고 처리 (AdminUserViewModel과 동일 API 사용)
  const handleGiveWarning = async (userId: number, warningsToAdd: number, reason: string) => {
    try {
      await AdminRepositoryImpl.updateUserWarning(userId, warningsToAdd, reason);
      return true;
    } catch (error) {
      console.error("경고 처리 실패:", error);
      return false;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "처리중";
      case "APPROVED":
      case "COMPLETED":
        return "처리 완료";
      case "REJECTED":
        return "반려됨";
      default:
        return status;
    }
  };

  const renderItem = ({ item }: { item: ReportListResponse }) => {
    const isRestaurantReport = item.targetType === "RESTAURANT";
    const isUserOrReviewReport = item.targetType === "USER" || item.targetType === "REVIEW";
    const statusText = getStatusText(item.status);

    const reporterName = item.reporterNickname || `유저 ${item.reporterId}`;
    const targetName = item.targetNickname || `유저 ${item.targetId}`;

    return (
      <View style={[styles.card, { backgroundColor: isDarkMode ? theme.card : "#fff" }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: isRestaurantReport ? "#E3F2FD" : "#FFF3E0" }]}>
            <Text style={[styles.badgeText, { color: isRestaurantReport ? "#1976D2" : "#F57C00" }]}>
              {isRestaurantReport ? "맛집" : "사용자/리뷰"}
            </Text>
          </View>
          <Text style={[styles.date, { color: theme.textSecondary }]}>{item.createdAt}</Text>
        </View>

        <Text style={[styles.reasonTitle, { color: theme.textPrimary }]}>사유: {item.reason}</Text>
        <Text style={[styles.reasonDetail, { color: theme.textSecondary }]}>{item.reasonDetail}</Text>

        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>신고자: {reporterName}</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>피신고자: {targetName}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>상태: </Text>
          <Text style={[styles.statusValue, item.status === "PENDING" ? styles.pending : styles.completed]}>
            {statusText}
          </Text>
        </View>

        {item.status === "PENDING" && (
          <View style={styles.actionButtons}>
            {isRestaurantReport ? (
              // ✅ 기존 기능 유지: 맛집 수정 이동
              <TouchableOpacity
                style={[styles.button, styles.checkButton]}
                onPress={() => navigation.navigate("AdminRestaurantAdd", { id: item.targetId })}
              >
                <Text style={styles.buttonText}>맛집 확인/수정</Text>
              </TouchableOpacity>
            ) : isUserOrReviewReport ? (
              <>
                {/* ✅ 경고: AdminUserScreen과 동일하게 "WarningModal"로 처리 */}
                <TouchableOpacity
                  style={[styles.button, styles.warningButton]}
                  onPress={() =>
                    setActiveModal({
                      type: "warning",
                      user: {
                        id: item.targetId,
                        name: targetName,
                        email: item.targetNickname || `유저 ${item.targetId}`, // WarningModal 표시용
                      },
                    })
                  }
                >
                  <Text style={styles.buttonText}>경고</Text>
                </TouchableOpacity>

                {/* ✅ 정지: AdminUserScreen과 동일하게 "SuspendModal"로 처리 */}
                <TouchableOpacity
                  style={[styles.button, styles.suspendButton]}
                  onPress={() =>
                    setActiveModal({
                      type: "suspend",
                      user: {
                        id: item.targetId,
                        name: targetName,
                        email: item.targetNickname || `유저 ${item.targetId}`,
                        status: "미접속", // SuspendModal이 status==="정지"로 해제 UI 판단하면 일단 미접속으로 넣음
                      },
                    })
                  }
                >
                  <Text style={styles.buttonText}>정지</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {/* ✅ 기존 기능 유지: 신고 삭제 */}
            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDeleteReport(item.id)}>
              <Text style={styles.buttonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading && allReports.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title="신고 관리" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.icon} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>신고 데이터를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : "#f5f5f5" }]}>
      <Header title="신고 관리" showBackButton onBackPress={() => navigation.goBack()} />

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: isDarkMode ? theme.card : "#fff" }]}>
        {(["ALL", "USER", "RESTAURANT"] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab,
              { borderColor: selectedFilter === filter ? COLORS.primary : "transparent" },
            ]}
            onPress={() => handleFilterChange(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter ? styles.activeFilterText : { color: theme.textSecondary },
              ]}
            >
              {filter === "ALL" ? "전체" : filter === "USER" ? "사용자/리뷰" : "맛집"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredReports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={() => fetchReports(true)}
        refreshing={refreshing}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 16 }]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>신고 내역이 없습니다.</Text>
          </View>
        }
      />

      {/* ✅ 모달들: AdminUserScreen과 완전 동일한 패턴으로 연결 */}
      <WarningModal
        visible={activeModal.type === "warning"}
        onClose={() => setActiveModal({ type: null })}
        user={activeModal.user}
        setSuccessModal={setSuccessModal}
        theme={theme}
        onConfirm={async (id: number, warningsToAdd: number, reason: string) => {
          const success = await handleGiveWarning(id, warningsToAdd, reason);
          if (success) fetchReports(true);
          return success;
        }}
      />

      <SuspendModal
        visible={activeModal.type === "suspend"}
        onClose={() => setActiveModal({ type: null })}
        user={activeModal.user}
        setSuccessModal={setSuccessModal}
        theme={theme}
        onConfirm={async (id: number, days: number, reason: string) => {
          const success = await handleSuspend(id, days, reason);
          if (success) fetchReports(true);
          return success;
        }}
      />

      <SuccessModal
        visible={successModal.visible}
        onClose={() => setSuccessModal({ visible: false, type: "", user: null, extra: "" })}
        type={successModal.type}
        user={successModal.user}
        extra={successModal.extra}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
  },
  filterContainer: {
    flexDirection: "row",
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
    fontWeight: "600",
  },
  activeFilterText: {
    color: COLORS.primary,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  reasonDetail: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: "column",
    gap: 4,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusValue: {
    fontSize: 13,
    fontWeight: "bold",
  },
  pending: {
    color: "#F57C00",
  },
  completed: {
    color: "#388E3C",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  checkButton: {
    backgroundColor: "#2196F3",
  },
  warningButton: {
    backgroundColor: "#FF9800",
  },
  suspendButton: {
    backgroundColor: "#EC407A",
  },
  deleteButton: {
    backgroundColor: "#78909C",
  },
  buttonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
});

export default AdminReportScreen;
