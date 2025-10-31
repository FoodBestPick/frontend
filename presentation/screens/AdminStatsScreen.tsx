import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Header } from "../components/Header";
import { COLORS } from "../../core/constants/colors";
import { LineChart, BarChart} from "react-native-chart-kit";
import { DonutChart } from "../components/DonutChart";
import Modal from "react-native-modal";
import { Calendar } from "react-native-calendars";

const { width } = Dimensions.get("window");

type TabKey = "오늘" | "주간" | "월간" | "사용자 지정";

export const AdminStatsScreen = () => {
  const [selectedTab, setSelectedTab] = useState<TabKey>("오늘");
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  // 탭별 UI 데이터 (디자인 스크린샷 기준 값)
  const ui = useMemo(() => {
    const commonChartConfig = {
      backgroundColor: "#fff",
      backgroundGradientFrom: "#fff",
      backgroundGradientTo: "#fff",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(10,132,255, ${opacity})`,
      labelColor: () => "#777",
      barPercentage: 0.8,
    };

    if (selectedTab === "오늘") {
      return {
        // 카드
        cards: [
          { label: "방문자 수", value: "1,230", rate: "+5.2%", up: true },
          { label: "신규 가입", value: "58", rate: "+8.1%", up: true },
          { label: "신규 맛집", value: "12", rate: "-3.2%", up: false },
          { label: "신규 리뷰", value: "150", rate: "+12.5%", up: true },
        ],
        // 라인차트
        line: {
          title: "시간대별 방문자 추이",
          kpi: { value: "85", sub: "18:00  +15%" },
          labels: ["오전", "정오", "오후", "저녁"],
          data: [18, 32, 54, 20],
        },
        // 도넛(파이) + 중앙 텍스트
        pie: {
          centerTop: "58",
          centerBottom: "신규 가입",
          data: [
            { name: "검색", population: 40, color: "#0A84FF", legendFontColor: "#333", legendFontSize: 13 },
            { name: "SNS", population: 25, color: "#2ECC71", legendFontColor: "#333", legendFontSize: 13 },
            { name: "광고", population: 20, color: "#FFC107", legendFontColor: "#333", legendFontSize: 13 },
            { name: "기타", population: 15, color: "#E91E63", legendFontColor: "#333", legendFontSize: 13 },
          ],
        },
        // 가로 막대(분포) – 커스텀 바
        categories: [
          { label: "한식", pct: 50 },
          { label: "중식", pct: 25 },
          { label: "일식", pct: 15 },
          { label: "양식", pct: 5 },
          { label: "기타", pct: 5 },
        ],
        // 리뷰 평점 분포 (막대 차트)
        bar: { labels: ["1점", "2점", "3점", "4점", "5점"], data: [8, 14, 30, 45, 55] },
        // 인기 검색어
        ranks: [
          { rank: 1, term: "마라탕", count: "1,250회" },
          { rank: 2, term: "강남역 맛집", count: "980회" },
          { rank: 3, term: "성수동 카페", count: "870회" },
          { rank: 4, term: "홍대 파스타", count: "760회" },
          { rank: 5, term: "잠실 롯데월드몰", count: "650회" },
        ],
        chartConfig: commonChartConfig,
      };
    }

    if (selectedTab === "주간") {
      return {
        cards: [
          { label: "총 사용자", value: "1,240", rate: "+12.5%", up: true },
          { label: "신규 사용자", value: "82", rate: "+5.2%", up: true },
          { label: "총 맛집 수", value: "56", rate: "-2.1%", up: false },
          { label: "총 리뷰 수", value: "248", rate: "+8.7%", up: true },
        ],
        line: {
          title: "사용자 활성도",
          kpi: { value: "1.2k", sub: "주간  +12.5%" },
          labels: ["월", "화", "수", "목", "금", "토", "일"],
          data: [30, 55, 45, 50, 32, 20, 58],
        },
        pie: {
          centerTop: "82",
          centerBottom: "신규 사용자",
          data: [
            { name: "검색", population: 40, color: "#0A84FF", legendFontColor: "#333", legendFontSize: 13 },
            { name: "SNS", population: 25, color: "#2ECC71", legendFontColor: "#333", legendFontSize: 13 },
            { name: "광고", population: 20, color: "#FFC107", legendFontColor: "#333", legendFontSize: 13 },
            { name: "기타", population: 15, color: "#E91E63", legendFontColor: "#333", legendFontSize: 13 },
          ],
        },
        categories: [
          { label: "기타", pct: 35 },
          { label: "양식", pct: 25 },
          { label: "일식", pct: 25 },
          { label: "중식", pct: 20 },
          { label: "한식", pct: 15 },
        ],
        bar: { labels: ["1점", "2점", "3점", "4점", "5점"], data: [5, 12, 26, 40, 52] },
        ranks: [
          { rank: 1, term: "강남역 맛집", count: "1,204회" },
          { rank: 2, term: "홍대 파스타", count: "987회" },
          { rank: 3, term: "마라탕", count: "852회" },
          { rank: 4, term: "잠실 롯데월드몰", count: "763회" },
          { rank: 5, term: "성수동 카페", count: "610회" },
        ],
        chartConfig: commonChartConfig,
      };
    }

    // 월간
    return {
      cards: [
        { label: "총 사용자", value: "12,870", rate: "+18.2%", up: true },
        { label: "신규 사용자", value: "950", rate: "+15.8%", up: true },
        { label: "총 맛집 수", value: "345", rate: "+4.3%", up: true },
        { label: "총 리뷰 수", value: "2,150", rate: "+11.4%", up: true },
      ],
      line: {
        title: "사용자 활성도",
        kpi: { value: "11.8k", sub: "월간  +18.2%" },
        labels: ["1주", "2주", "3주", "4주"],
        data: [35, 48, 42, 55],
      },
      pie: {
        centerTop: "950",
        centerBottom: "신규 사용자",
        data: [
          { name: "검색", population: 35, color: "#0A84FF", legendFontColor: "#333", legendFontSize: 13 },
          { name: "SNS", population: 30, color: "#2ECC71", legendFontColor: "#333", legendFontSize: 13 },
          { name: "광고", population: 20, color: "#FFC107", legendFontColor: "#333", legendFontSize: 13 },
          { name: "기타", population: 15, color: "#E91E63", legendFontColor: "#333", legendFontSize: 13 },
        ],
      },
      categories: [
        { label: "한식", pct: 40 },
        { label: "중식", pct: 28 },
        { label: "일식", pct: 18 },
        { label: "양식", pct: 10 },
        { label: "기타", pct: 4 },
      ],
      bar: { labels: ["1점", "2점", "3점", "4점", "5점"], data: [6, 10, 24, 38, 60] },
      ranks: [
        { rank: 1, term: "강남역 맛집", count: "15,320회" },
        { rank: 2, term: "마라탕", count: "12,890회" },
        { rank: 3, term: "홍대 파스타", count: "11,540회" },
        { rank: 4, term: "성수동 카페", count: "9,820회" },
        { rank: 5, term: "잠실 롯데월드몰", count: "8,760회" },
      ],
      chartConfig: commonChartConfig,
    };
  }, [selectedTab]);

  return (
    <View style={styles.container}>
      <Header title="통계 대시보드" />

      <View style={styles.tabContainer}>
        {(["오늘", "주간", "월간", "사용자 지정"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              if (tab === "사용자 지정") {
                setSelectedTab("사용자 지정");
                setIsCalendarVisible(true);
              } else {
                setSelectedTab(tab);
              }
            }}
            style={[
              styles.tab,
              selectedTab === tab && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === "사용자 지정" && startDate && endDate
                ? `${startDate} ~ ${endDate}`
                : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Modal
        isVisible={isCalendarVisible}
        onBackdropPress={() => setIsCalendarVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>기간 선택</Text>

          <Calendar
            markingType="period"
            markedDates={{
              ...(startDate && {
                [startDate]: {
                  startingDay: true,
                  color: "#0A84FF",
                  textColor: "white",
                },
              }),
              ...(endDate && {
                [endDate]: { endingDay: true, color: "#0A84FF", textColor: "white" },
              }),
              ...(startDate &&
                endDate && {
                ...Object.fromEntries(
                  Array.from(
                    { length: (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)-1 },
                    (_, i) => {
                      const d = new Date(
                        new Date(startDate).getTime() + (i + 1) * 86400000
                      )
                        .toISOString()
                        .split("T")[0];
                      return [d, { color: "#B3D7FF", textColor: "black" }];
                    }
                  )
                ),
              }),
            }}
            onDayPress={(day) => {
              if (!startDate || (startDate && endDate)) {
                setStartDate(day.dateString);
                setEndDate(null);
              } else if (new Date(day.dateString) < new Date(startDate)) {
                setStartDate(day.dateString);
                setEndDate(null);
              } else {
                setEndDate(day.dateString);
              }
            }}
            theme={{
              selectedDayBackgroundColor: "#0A84FF",
              todayTextColor: "#0A84FF",
              arrowColor: "#0A84FF",
            }}
          />

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#E5E7EB" }]}
              onPress={() => {
                setStartDate(null);
                setEndDate(null);
                setIsCalendarVisible(false);
                setSelectedTab("오늘");
              }}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#0A84FF" }]}
              onPress={() => setIsCalendarVisible(false)}
            >
              <Text style={styles.modalConfirmText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 주요 통계 카드 */}
        <View style={styles.statsGrid}>
          {ui.cards.map((c) => (
            <View key={c.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{c.label}</Text>
              <Text style={styles.statValue}>{c.value}</Text>
              <Text style={[styles.statRate, { color: c.up ? "#2EAD50" : "#E53935" }]}>{c.rate}</Text>
            </View>
          ))}
        </View>

        {/* 사용자 활성도 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{ui.line.title}</Text>
          <View style={styles.kpiRow}>
            <Text style={styles.kpiValue}>{ui.line.kpi.value}</Text>
            <Text style={styles.kpiSub}>{ui.line.kpi.sub}</Text>
          </View>
          <LineChart
            data={{ labels: ui.line.labels, datasets: [{ data: ui.line.data }] }}
            width={width + 10}
            height={180}
            chartConfig={ui.chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>신규 유입 경로</Text>

          <DonutChart
            data={ui.pie.data.map((d) => ({
              name: d.name,
              value: d.population,
              color: d.color,
            }))}
            centerTop={ui.pie.centerTop}
            centerBottom={ui.pie.centerBottom}
          />

          <View style={styles.legend}>
            {ui.pie.data.map((d) => (
              <View key={d.name} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                <Text style={styles.legendText}>
                  {d.name} ({d.population}%)
                </Text>
              </View>
            ))}
          </View>
        </View>

        { }
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>맛집 카테고리 분포</Text>
          {ui.categories.map((c) => (
            <View key={c.label} style={{ marginTop: 10 }}>
              <View style={styles.catRow}>
                <Text style={styles.catLabel}>{c.label}</Text>
                <Text style={styles.catPct}>{c.pct}%</Text>
              </View>
              <View style={styles.catTrack}>
                <View style={[styles.catFill, { width: `${c.pct}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* 리뷰 평점 분포 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>리뷰 평점 분포</Text>
          <BarChart
            data={{ labels: ui.bar.labels, datasets: [{ data: ui.bar.data }] }}
            width={width - 40}
            height={180}
            chartConfig={ui.chartConfig}
            withInnerLines={false}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>

        {/* 인기 검색어 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인기 검색어</Text>
          {ui.ranks.map((r) => (
            <View key={r.rank} style={styles.rankRow}>
              <Text style={styles.rankIndex}>{r.rank}</Text>
              <Text style={styles.rankTerm}>{r.term}</Text>
              <Text style={styles.rankCount}>{r.count}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

/* ===================== Styles ===================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingBottom: 40 },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  tabActive: { backgroundColor: "#0A84FF" },
  tabText: { color: "#667085", fontWeight: "600" },
  tabTextActive: { color: "#fff", fontWeight: "700" },

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
  statLabel: { fontSize: 13, color: "#8E8E93" },
  statValue: { fontSize: 22, fontWeight: "bold", color: COLORS.primary, marginVertical: 4 },
  statRate: { fontSize: 13, fontWeight: "600" },

  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginTop: 16 },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10, color: COLORS.text },
  chart: { borderRadius: 12, marginLeft: -30 },

  kpiRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 6 },
  kpiValue: { fontSize: 28, fontWeight: "800", color: "#111", marginRight: 6 },
  kpiSub: { fontSize: 13, color: "#3CB371", fontWeight: "700" },

pieCenter: {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: [{ translateX: -20 }, { translateY: -20 }],
  alignItems: "center",
  justifyContent: "center",
},
pieCenterTop: {
  fontSize: 22,
  fontWeight: "800",
  color: "#111",
},
pieCenterBottom: {
  fontSize: 12,
  color: "#6B7280",
  marginTop: 2,
},

donutContainer: {
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
},
legend: { marginTop: 20 },
legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
legendDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  marginRight: 8,
},
legendText: { color: "#333", fontSize: 13 },
  // 카테고리 바
  catRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  catLabel: { color: "#6B7280", fontSize: 13 },
  catPct: { color: "#6B7280", fontSize: 13 },
  catTrack: { height: 6, backgroundColor: "#EEF2F7", borderRadius: 999 },
  catFill: { height: 6, backgroundColor: "#0A84FF", borderRadius: 999 },

  // 인기 검색어
  rankRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  rankIndex: { width: 20, fontWeight: "bold", color: COLORS.primary, textAlign: "center" },
  rankTerm: { flex: 1, color: COLORS.text, paddingLeft: 6 },
  rankCount: { color: "#8E8E93" },
  
  modal: {
  justifyContent: "flex-end",
  margin: 0,
},
modalContainer: {
  backgroundColor: "white",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingVertical: 20,
  paddingHorizontal: 20,
},
modalTitle: {
  fontSize: 18,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 10,
},
modalButtonRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 20,
},
modalBtn: {
  flex: 1,
  paddingVertical: 12,
  marginHorizontal: 5,
  borderRadius: 10,
  alignItems: "center",
},
modalCancelText: {
  color: "#111",
  fontWeight: "600",
},
modalConfirmText: {
  color: "#fff",
  fontWeight: "700",
},
});
