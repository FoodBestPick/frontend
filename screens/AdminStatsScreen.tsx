import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from "react-native";
import { Header } from "../components/Header";
import { COLORS } from "../constants/colors";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

export const AdminStatsScreen = () => {
  const [selectedTab, setSelectedTab] = useState("주간");

  const pieDataUsers = [
    { name: "검색", population: 40, color: "#2196F3", legendFontColor: "#333", legendFontSize: 13 },
    { name: "SNS", population: 25, color: "#4CAF50", legendFontColor: "#333", legendFontSize: 13 },
    { name: "광고", population: 20, color: "#FFC107", legendFontColor: "#333", legendFontSize: 13 },
    { name: "기타", population: 15, color: "#E91E63", legendFontColor: "#333", legendFontSize: 13 },
  ];

  const pieDataRestaurants = [
    { name: "한식", population: 35, color: "#FF9800", legendFontColor: "#333", legendFontSize: 13 },
    { name: "중식", population: 25, color: "#F44336", legendFontColor: "#333", legendFontSize: 13 },
    { name: "일식", population: 20, color: "#FFC107", legendFontColor: "#333", legendFontSize: 13 },
    { name: "양식", population: 15, color: "#9C27B0", legendFontColor: "#333", legendFontSize: 13 },
    { name: "기타", population: 5, color: "#BDBDBD", legendFontColor: "#333", legendFontSize: 13 },
  ];

  const lineData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [{ data: [20, 40, 35, 50, 45, 30, 55] }],
  };

  const barData = {
    labels: ["1점", "2점", "3점", "4점", "5점"],
    datasets: [{ data: [20, 30, 50, 70, 90] }],
  };

  return (
    <View style={styles.container}>
      <Header title="통계 대시보드" />

      {/* 상단 탭 */}
      <View style={styles.tabContainer}>
        {["오늘", "주간", "월간", "사용자 지정"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 주요 통계 카드 */}
        <View style={styles.statsGrid}>
          <StatCard label="총 사용자" value="1,240" rate="+12.5%" up />
          <StatCard label="신규 사용자" value="82" rate="+5.2%" up />
          <StatCard label="총 맛집 수" value="56" rate="-2.1%" />
          <StatCard label="총 리뷰 수" value="248" rate="+8.7%" up />
        </View>

        {/* 사용자 활성도 */}
        <Section title="사용자 활성도">
          <LineChart
            data={lineData}
            width={width - 20}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
          />
        </Section>

        {/* 신규 유입 경로 */}
        <Section title="신규 유입 경로">
          <PieChart
            data={pieDataUsers}
            width={width - 40}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
          />
        </Section>

        {/* 맛집 카테고리 */}
        <Section title="맛집 카테고리">
          <PieChart
            data={pieDataRestaurants}
            width={width - 40}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
          />
        </Section>

        {/* 리뷰 평점 분포 */}
        <Section title="리뷰 평점 분포">
          <BarChart
            data={barData}
            width={width - 40}
            height={180}
            chartConfig={chartConfig}
            yAxisLabel=""
            yAxisSuffix=""
            withInnerLines={false}
            style={styles.chart}
          />
        </Section>

        {/* 인기 검색어 */}
        <Section title="인기 검색어">
          {[
            { rank: 1, term: "강남역 맛집", count: "1,204회" },
            { rank: 2, term: "홍대 파스타", count: "987회" },
            { rank: 3, term: "마라탕", count: "852회" },
            { rank: 4, term: "잠실 롯데월드몰", count: "763회" },
            { rank: 5, term: "성수동 카페", count: "610회" },
          ].map((item) => (
            <View key={item.rank} style={styles.rankRow}>
              <Text style={styles.rankIndex}>{item.rank}</Text>
              <Text style={styles.rankTerm}>{item.term}</Text>
              <Text style={styles.rankCount}>{item.count}</Text>
            </View>
          ))}
        </Section>
      </ScrollView>
    </View>
  );
};

const StatCard = ({ label, value, rate, up }: any) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={[styles.statRate, { color: up ? "#4CAF50" : "#E53935" }]}>{rate}</Text>
  </View>
);

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
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
  scroll: { padding: 16, paddingBottom: 40 },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#0A84FF",
  },
  tabText: { color: "#777", fontWeight: "500" },
  tabTextActive: { color: "#fff", fontWeight: "bold" },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: { fontSize: 14, color: "#888" },
  statValue: { fontSize: 22, fontWeight: "bold", color: COLORS.primary, marginVertical: 4 },
  statRate: { fontSize: 14, fontWeight: "500" },

  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10, color: COLORS.text },
  chart: { borderRadius: 12 , marginLeft : -30},

  rankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rankIndex: { width: 20, fontWeight: "bold", color: COLORS.primary },
  rankTerm: { flex: 1, color: COLORS.text },
  rankCount: { color: "#888" },
});
