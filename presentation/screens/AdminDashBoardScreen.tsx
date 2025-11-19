import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Header } from "../components/Header";
import { DashboardCard } from "../components/DashBoardCard";
import { COLORS } from "../../core/constants/Colors";
import { AdminDashBoardViewModel } from "../viewmodels/AdminDashBoardViewModels";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LineChart, BarChart } from "react-native-chart-kit";
import { ThemeContext } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types/RootStackParamList";

const { width } = Dimensions.get("window");
type Navigation = NativeStackNavigationProp<RootStackParamList>;

export const AdminDashBoardScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { isDarkMode, theme } = useContext(ThemeContext);
  const { stats, fetchStats } = AdminDashBoardViewModel();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, []);

  if (!stats) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.icon} />
        <Text
          style={{
            marginTop: 10,
            color: theme.textSecondary,
            fontSize: 15,
          }}
        >
          대시보드 데이터를 불러오는 중...
        </Text>
      </View>
    );
  }

  const lineData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [{ data: stats.data.weekUserData ?? [] }],
  };

  const barData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [{ data: stats.data.barData ?? [] }],
  };

  const miniChartStyle = {
    ...StyleSheet.flatten(styles.miniChart),
    width: width * 1.1,
  };

  const chartConfig = {
    backgroundColor: isDarkMode ? theme.card : "#fff",
    backgroundGradientFrom: isDarkMode ? theme.card : "#fff",
    backgroundGradientTo: isDarkMode ? theme.card : "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 180, 180, ${opacity})`,
    labelColor: () => (isDarkMode ? theme.textSecondary : "#777"),
    barPercentage: 0.8,
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? theme.background : COLORS.background },
      ]}
    >
      <Header
        title="관리자 대시보드"
        iconName="notifications-none"
        onIconPress={() => navigation.navigate("NotificationScreen")}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 상단 주요 통계 */}
        <View style={styles.cardSection}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDarkMode ? theme.card : COLORS.card,
                borderColor: theme.border,
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={isDarkMode ? theme.textPrimary : COLORS.text}
                />
                <Text
                  style={[
                    styles.cardLabel,
                    { color: isDarkMode ? theme.textPrimary : COLORS.text },
                  ]}
                >
                  총 사용자 수
                </Text>
              </View>
            </View>
            <Text style={[styles.bigValue, { color: COLORS.primary }]}>
              {stats?.data?.users?.toLocaleString?.() ??
                stats.data.users.toLocaleString()}
              명
            </Text>

            <LineChart
              data={{
                labels: ["", "", "", "", "", "", ""],
                datasets: [{ data: stats.data.allUserData ?? [] }],
              }}
              width={miniChartStyle.width}
              height={60}
              withDots={false}
              withInnerLines={false}
              withVerticalLines={false}
              withHorizontalLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={false}
              transparent
              chartConfig={{
                backgroundColor: "transparent",
                backgroundGradientFrom: "transparent",
                backgroundGradientTo: "transparent",
                fillShadowGradient: "rgba(76, 175, 80, 0.3)",
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                strokeWidth: 0,
              }}
              style={miniChartStyle}
            />
          </View>

          {/* 총 맛집 수 */}
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDarkMode ? theme.card : COLORS.card,
                borderColor: theme.border,
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons
                  name="store-outline"
                  size={18}
                  color={isDarkMode ? theme.textPrimary : COLORS.text}
                />
                <Text
                  style={[
                    styles.cardLabel,
                    { color: isDarkMode ? theme.textPrimary : COLORS.text },
                  ]}
                >
                  총 맛집 수
                </Text>
              </View>
            </View>
            <Text style={[styles.bigValue, { color: COLORS.primary }]}>
              {stats.data.restaurants.toLocaleString()}개
            </Text>

            <LineChart
              data={{
                labels: ["", "", "", "", "", "", ""],
                datasets: [{ data: stats.data.allRestaurantData ?? [] }],
              }}
              width={miniChartStyle.width}
              height={60}
              withDots={false}
              withInnerLines={false}
              withVerticalLines={false}
              withHorizontalLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={false}
              transparent
              chartConfig={{
                backgroundColor: "transparent",
                backgroundGradientFrom: "transparent",
                backgroundGradientTo: "transparent",
                fillShadowGradient: "rgba(33, 150, 243, 0.3)",
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              }}
              style={miniChartStyle}
            />
          </View>
        </View>

        {/* 리뷰 요약 */}
        <View style={styles.reviewRow}>
          <DashboardCard label="오늘 리뷰" value={stats.data.todayReviews} />
          <DashboardCard label="주간 리뷰" value={stats.data.weekReviews} />
          <DashboardCard label="월간 리뷰" value={stats.data.monthReviews} />
        </View>

        {/* 긴급 알림 */}
        <View
          style={[
            styles.alertBox,
            {
              backgroundColor: isDarkMode ? "#422" : "#ffe8e8",
              borderColor: theme.border,
              borderWidth: 1, 
            },
          ]}
        >
          <Text
            style={[
              styles.alertTitle,
              { color: isDarkMode ? theme.textPrimary : "#b00020" },
            ]}
          >
            긴급 알림 / 미처리 업무
          </Text>
          <Text
            style={[
              styles.alertItem,
              { color: isDarkMode ? theme.textPrimary : "#a00" },
            ]}
          >
            승인 대기 맛집: 2건
          </Text>
          <TouchableOpacity style={styles.alertButton}>
            <Text style={styles.alertButtonText}>바로 확인하기</Text>
          </TouchableOpacity>
        </View>

        {/* 실시간 피드 */}
        <View
          style={[
            styles.feedSection,
            {
              backgroundColor: isDarkMode ? theme.card : COLORS.card,
              borderColor: theme.border,
              borderWidth: 1, 
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? theme.textPrimary : COLORS.text },
            ]}
          >
            실시간 활동 피드
          </Text>
          <FeedItem
            icon="storefront-outline"
            color={COLORS.primary}
            text="새로운 맛집 ‘제주 흑돼지’가 승인 대기 중입니다."
            textColor={isDarkMode ? theme.textPrimary : COLORS.text}
          />
          <FeedItem
            icon="chatbubble-outline"
            color={COLORS.primary}
            text="맛집 ‘감성타코’에 새 리뷰가 등록되었습니다."
            textColor={isDarkMode ? theme.textPrimary : COLORS.text}
          />
          <FeedItem
            icon="alert-circle-outline"
            color="#f44336"
            text="리뷰 신고가 접수되었습니다. (광고성)"
            textColor={isDarkMode ? theme.textPrimary : COLORS.text}
          />
        </View>

        {/* 주간 사용자 활동 */}
        <ChartSection
          title="주간 사용자 활동"
          textColor={isDarkMode ? theme.textPrimary : COLORS.text}
          cardColor={isDarkMode ? theme.card : COLORS.card}
          borderColor={theme.border} 
        >
          <LineChart
            data={lineData}
            width={width - 35}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.linechart}
          />
        </ChartSection>

        {/* 맛집 카테고리 분포 */}
        <ChartSection
          title="맛집 카테고리 분포"
          textColor={isDarkMode ? theme.textPrimary : COLORS.text}
          cardColor={isDarkMode ? theme.card : COLORS.card}
          borderColor={theme.border}
        >
          {(stats.data.pieData ?? []).map((item, index) => (
            <View key={item.name} style={{ marginTop: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{
                    color: isDarkMode ? theme.textSecondary : "#6B7280",
                    fontSize: 13,
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    color: isDarkMode ? theme.textSecondary : "#6B7280",
                    fontSize: 13,
                  }}
                >
                  {item.population}%
                </Text>
              </View>

              <View
                style={{
                  height: 6,
                  backgroundColor: isDarkMode ? theme.border : "#EEF2F7",
                  borderRadius: 999,
                }}
              >
                <View
                  style={{
                    width: `${item.population}%`,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: [
                      "#FF8A65",
                      "#FFCA28",
                      "#4CAF50",
                      "#2196F3",
                      "#9C27B0",
                    ][index % 5],
                  }}
                />
              </View>
            </View>
          ))}
        </ChartSection>

        {/* 일일 리뷰 등록 수 */}
        <ChartSection
          title="일일 리뷰 등록 수"
          textColor={isDarkMode ? theme.textPrimary : COLORS.text}
          cardColor={isDarkMode ? theme.card : COLORS.card}
          borderColor={theme.border}
        >
          <BarChart
            data={barData}
            width={width - 75}
            height={180}
            chartConfig={chartConfig}
            withInnerLines={false}
            style={styles.barchart}
            xAxisLabel=""
            yAxisLabel=""
            yAxisSuffix=""
          />
        </ChartSection>

        {/* 빠른 링크 */}
        <View style={styles.quickLinkSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? theme.textPrimary : COLORS.text },
            ]}
          >
            빠른 링크
          </Text>
          <View style={styles.quickGrid}>
            <QuickLink
              icon="checkmark-done-outline"
              label="맛집 등록"
              textColor={isDarkMode ? theme.textPrimary : COLORS.text}
              cardColor={isDarkMode ? theme.card : COLORS.card}
              borderColor={theme.border}
            />
            <QuickLink
              icon="shield-outline"
              label="콘텐츠 신고 관리"
              textColor={isDarkMode ? theme.textPrimary : COLORS.text}
              cardColor={isDarkMode ? theme.card : COLORS.card}
              borderColor={theme.border}
            />
            <QuickLink
              icon="megaphone-outline"
              label="공지사항 작성"
              textColor={isDarkMode ? theme.textPrimary : COLORS.text}
              cardColor={isDarkMode ? theme.card : COLORS.card}
              borderColor={theme.border}
            />
            <QuickLink
              icon="headset-outline"
              label="고객문의 확인"
              textColor={isDarkMode ? theme.textPrimary : COLORS.text}
              cardColor={isDarkMode ? theme.card : COLORS.card}
              borderColor={theme.border}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const FeedItem = ({ icon, color, text, textColor }: any) => (
  <View style={styles.feedItem}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.feedText, { color: textColor }]}>{text}</Text>
  </View>
);

const QuickLink = ({ icon, label, textColor, cardColor, borderColor }: any) => (
  <TouchableOpacity
    style={[
      styles.quickCard,
      { backgroundColor: cardColor, borderColor, borderWidth: 1 },
    ]}
  >
    <Ionicons name={icon} size={24} color={COLORS.primary} />
    <Text style={[styles.quickText, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

const ChartSection = ({ title, children, textColor, cardColor, borderColor }: any) => (
  <View
    style={[
      styles.chartSection,
      { backgroundColor: cardColor, borderColor, borderWidth: 1 },
    ]}
  >
    <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 20 },
  cardSection: { flexDirection: "column", gap: 16 },
  statCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardLabel: { fontSize: 14 },
  bigValue: { fontSize: 28, fontWeight: "bold", marginTop: 6 },
  miniChart: { marginTop: 8, marginLeft: -60, alignSelf: "flex-start" },
  reviewRow: { flexDirection: "row", justifyContent: "space-between" },
  alertBox: { borderRadius: 12, padding: 16 },
  alertTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  alertItem: { fontSize: 14, marginBottom: 2 },
  alertButton: {
    backgroundColor: "#ff4040",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  alertButtonText: { color: "#fff", fontWeight: "bold" },
  feedSection: { borderRadius: 12, padding: 16 },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  feedItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  feedText: { fontSize: 14 },
  chartSection: { borderRadius: 12, padding: 16 },
  linechart: { borderRadius: 12, marginVertical: 8, alignSelf: "center" },
  barchart: { 
    borderRadius: 12, 
    marginVertical: 8, 
    alignSelf: "center", 
    marginRight: 40 
  },
  quickLinkSection: { marginBottom: 40 },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },
  quickCard: {
    width: "48%",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickText: { marginTop: 8, fontSize: 14 },
});
