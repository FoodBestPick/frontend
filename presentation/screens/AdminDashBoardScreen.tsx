import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Header } from "../components/Header";
import { DashboardCard } from "../components/DashBoardCard";
import { COLORS } from "../../core/constants/colors";
import { AdminDashBoardViewModel } from "../viewmodels/AdminDashBoardViewModels";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

export const AdminDashBoardScreen = () => {

  const { stats, fetchStats } = AdminDashBoardViewModel();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats(); 
    setRefreshing(false);
  }, []);


  const lineData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [{ data: [2300, 2450, 2600, 2800, 2950, 2900, 2750] }],
  };

  const barData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [{ data: [50, 60, 70, 65, 80, 90, 60] }],
  };

  const pieData = [
    { name: "한식", population: 40, color: "#FF8A65", legendFontColor: "#333", legendFontSize: 13 },
    { name: "중식", population: 20, color: "#FFCA28", legendFontColor: "#333", legendFontSize: 13 },
    { name: "일식", population: 15, color: "#4CAF50", legendFontColor: "#333", legendFontSize: 13 },
    { name: "양식", population: 10, color: "#2196F3", legendFontColor: "#333", legendFontSize: 13 },
    { name: "카페", population: 15, color: "#9C27B0", legendFontColor: "#333", legendFontSize: 13 },
  ];

  const miniChartStyle = {
    ...StyleSheet.flatten(styles.miniChart),
    width: width * 1.1,
  };

  return (
    <View style={styles.container}>
      <Header title="관리자 대시보드" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> 
        }
      >
        {/* 상단 주요 통계 */}
        <View style={styles.cardSection}>
          {/* 총 사용자 수 */}
          <View style={styles.statCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Ionicons name="person-outline" size={18} color={COLORS.text} />
                <Text style={styles.cardLabel}>총 사용자 수</Text>
              </View>
              <Text style={styles.rateText}>+2.5%</Text>
            </View>
            <Text style={styles.bigValue}>{stats.users.toLocaleString()}명</Text>

            <LineChart
              data={{
                labels: ["", "", "", "", "", "", ""],
                datasets: [{ data: [11800, 12000, 12200, 12300, 12450, 12500, 12345] }],
              }}
              width={miniChartStyle.width}
              height={60}
              withDots={false}
              withInnerLines={false}
              withVerticalLines={false}
              withHorizontalLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={false}
              withShadow={true}
              transparent={true}
              chartConfig={{
                backgroundColor: "transparent",
                backgroundGradientFrom: "transparent",
                backgroundGradientTo: "transparent",
                fillShadowGradient: "rgba(76, 175, 80, 0.3)",
                fillShadowGradientOpacity: 0.3,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: () => "transparent",
              }}
              style={miniChartStyle}
            />
          </View>

          {/* 총 맛집 수 */}
          <View style={styles.statCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons name="store-outline" size={18} color={COLORS.text} />
                <Text style={styles.cardLabel}>총 맛집 수</Text>
              </View>
              <Text style={styles.rateText}>+1.8%</Text>
            </View>
            <Text style={styles.bigValue}>{stats.restaurants.toLocaleString()}개</Text>

            <LineChart
              data={{
                labels: ["", "", "", "", "", "", ""],
                datasets: [{ data: [950, 1000, 1050, 1100, 1150, 1200, 1234] }],
              }}
              width={miniChartStyle.width}
              height={60}
              withDots={false}
              withInnerLines={false}
              withVerticalLines={false}
              withHorizontalLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={false}
              withShadow={true}
              transparent={true}
              chartConfig={{
                backgroundColor: "transparent",
                backgroundGradientFrom: "transparent",
                backgroundGradientTo: "transparent",
                fillShadowGradient: "rgba(33, 150, 243, 0.3)",
                fillShadowGradientOpacity: 0.3,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: () => "transparent",
              }}
              style={miniChartStyle}
            />
          </View>
        </View>

        {/* 리뷰 요약 */}
        <View style={styles.reviewRow}>
          <DashboardCard label="오늘 리뷰" value={stats.todayReviews} />
          <DashboardCard label="주간 리뷰" value={stats.weekReviews} />
          <DashboardCard label="월간 리뷰" value={stats.monthReviews} />
        </View>

        {/* 긴급 알림 */}
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>긴급 알림 / 미처리 업무</Text>
          <Text style={styles.alertItem}>승인 대기 맛집: 2건</Text>
          <TouchableOpacity style={styles.alertButton}>
            <Text style={styles.alertButtonText}>바로 확인하기</Text>
          </TouchableOpacity>
        </View>

        {/* 실시간 피드 */}
        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>실시간 활동 피드</Text>
          <FeedItem icon="storefront-outline" color={COLORS.primary} text="새로운 맛집 ‘제주 흑돼지’가 승인 대기 중입니다." />
          <FeedItem icon="chatbubble-outline" color={COLORS.primary} text="맛집 ‘감성타코’에 새 리뷰가 등록되었습니다." />
          <FeedItem icon="alert-circle-outline" color="#f44336" text="리뷰 신고가 접수되었습니다. (광고성)" />
        </View>

        {/* 주간 사용자 활동 */}
        <ChartSection title="주간 사용자 활동">
          <LineChart
            data={lineData}
            width={width - 40}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.linechart}
          />
        </ChartSection>

        {/* 맛집 카테고리 분포 */}
        <ChartSection title="맛집 카테고리 분포">
          <PieChart
            data={pieData}
            width={width - 40}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
          />
        </ChartSection>

        {/* 일일 리뷰 등록 수 */}
        <ChartSection title="일일 리뷰 등록 수">
          <BarChart
            data={barData}
            width={width - 40}
            height={180}
            chartConfig={chartConfig}
            yAxisLabel=""
            yAxisSuffix=""
            withInnerLines={false}
            style={styles.barchart}
          />
        </ChartSection>

        {/* 빠른 링크 */}
        <View style={styles.quickLinkSection}>
          <Text style={styles.sectionTitle}>빠른 링크</Text>
          <View style={styles.quickGrid}>
            <QuickLink icon="checkmark-done-outline" label="맛집 등록" />
            <QuickLink icon="shield-outline" label="콘텐츠 신고 관리" />
            <QuickLink icon="megaphone-outline" label="공지사항 작성" />
            <QuickLink icon="headset-outline" label="고객문의 확인" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const FeedItem = ({ icon, color, text }: any) => (
  <View style={styles.feedItem}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={styles.feedText}>{text}</Text>
  </View>
);

const QuickLink = ({ icon, label }: any) => (
  <TouchableOpacity style={styles.quickCard}>
    <Ionicons name={icon} size={24} color={COLORS.primary} />
    <Text style={styles.quickText}>{label}</Text>
  </TouchableOpacity>
);

const ChartSection = ({ title, children }: any) => (
  <View style={styles.chartSection}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const chartConfig = {
  backgroundColor: "#fff",
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 180, 180, ${opacity})`,
  labelColor: () => "#777",
  barPercentage: 0.8,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, gap: 20 },

  cardSection: { flexDirection: "column", gap: 16 },
  statCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardLabel: { fontSize: 14, color: COLORS.text },
  bigValue: { fontSize: 28, fontWeight: "bold", color: COLORS.primary, marginTop: 6 },
  rateText: { color: "green", fontSize: 13 },

  miniChart: {
    marginTop: 8,
    marginLeft: -60,
    alignSelf: "flex-start",
  },

  reviewRow: { flexDirection: "row", justifyContent: "space-between" },

  alertBox: { backgroundColor: "#ffe8e8", borderRadius: 12, padding: 16 },
  alertTitle: { fontWeight: "bold", fontSize: 16, color: "#b00020", marginBottom: 8 },
  alertItem: { color: "#a00", fontSize: 14, marginBottom: 2 },
  alertButton: {
    backgroundColor: "#ff4040",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  alertButtonText: { color: "#fff", fontWeight: "bold" },

  feedSection: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16 },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10, color: COLORS.text },
  feedItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  feedText: { fontSize: 14, color: COLORS.text },

  chartSection: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16 },
  linechart: { borderRadius: 12, marginVertical: 8, alignSelf: "center", marginLeft: -20 },
  barchart: { borderRadius: 12, marginVertical: 8, alignSelf: "center", marginLeft: -40 },

  quickLinkSection: { marginBottom: 40 },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },
  quickCard: {
    backgroundColor: COLORS.card,
    width: "48%",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickText: { marginTop: 8, fontSize: 14, color: COLORS.text },
});
