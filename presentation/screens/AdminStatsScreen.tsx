import React, { useMemo, useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Header } from "../components/Header";
import { LineChart, BarChart } from "react-native-chart-kit";
import { DonutChart } from "../components/DonutChart";
import Modal from "react-native-modal";
import { Calendar } from "react-native-calendars";
import { AdminStatsViewModels } from "../viewmodels/AdminStatsViewModels";
import { ThemeContext } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

type TabKey = "오늘" | "주간" | "월간" | "사용자 지정";

export const AdminStatsScreen = () => {
  const { theme } = useContext(ThemeContext);

  const [selectedTab, setSelectedTab] = useState<TabKey>("오늘");
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { statsDetail, refetch, loading, error } = AdminStatsViewModels();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedTab === "사용자 지정" && startDate && endDate) {
      await refetch(startDate, endDate);
    } else {
      await refetch();
    }
    setRefreshing(false);
  }, [refetch, selectedTab, startDate, endDate]);

  const current = useMemo(() => {
    switch (selectedTab) {
      case "오늘":
        return statsDetail?.data?.today;
      case "주간":
        return statsDetail?.data?.week;
      case "월간":
        return statsDetail?.data?.month;
      case "사용자 지정":
        return statsDetail?.data?.custom ?? statsDetail?.data?.today;
      default:
        return statsDetail?.data?.today;
    }
  }, [selectedTab, statsDetail]);

  const ui = useMemo(() => {
    if (!current) return null;

    const {
      visitors = 0,
      joins = 0,
      restaurants = 0,
      reviews = 0,
      visitorRate = 0,
      joinRate = 0,
      restaurantRate = 0,
      reviewRate = 0,
      timeSeries = [],
      categories,
      ratingDistribution = [],
      topSearches = [],
    } = current;

    const chartConfig = {
      backgroundColor: theme.card,
      backgroundGradientFrom: theme.card,
      backgroundGradientTo: theme.card,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(10,132,255,${opacity})`,
      labelColor: () => theme.textSecondary,
      barPercentage: 0.8,
    };

    function getCustomLabels(start: string, end: string) {
      const s = new Date(start);
      const e = new Date(end);
      const diffDays =
        Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays === 1) return ["오전", "정오", "오후", "저녁"];

      if (diffDays <= 7) {
        const labels: string[] = [];
        for (let i = 0; i < diffDays; i++) {
          const d = new Date(s.getTime() + i * 86400000);
          labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
        }
        return labels;
      }

      if (diffDays <= 30) {
        const weeks = Math.ceil(diffDays / 7);
        return Array.from({ length: weeks }, (_, i) => `${i + 1}주`);
      }

      const months = new Set<string>();
      for (let d = new Date(s); d <= e; d.setMonth(d.getMonth() + 1)) {
        months.add(`${d.getMonth() + 1}월`);
      }
      return Array.from(months);
    }

    const safeCategories =
      categories && typeof categories === "object" ? categories : {};

    const categoriesArr = Object.entries(safeCategories).map(([label, pct]) => ({
      label,
      pct,
    }));

    return {
      cards: [
        {
          label: "방문자 수",
          value: visitors.toLocaleString(),
          rate: `${visitorRate > 0 ? "+" : ""}${visitorRate}%`,
          up: visitorRate >= 0,
        },
        {
          label: "신규 가입",
          value: joins.toLocaleString(),
          rate: `${joinRate > 0 ? "+" : ""}${joinRate}%`,
          up: joinRate >= 0,
        },
        {
          label: "신규 맛집",
          value: restaurants.toLocaleString(),
          rate: `${restaurantRate > 0 ? "+" : ""}${restaurantRate}%`,
          up: restaurantRate >= 0,
        },
        {
          label: "신규 리뷰",
          value: reviews.toLocaleString(),
          rate: `${reviewRate > 0 ? "+" : ""}${reviewRate}%`,
          up: reviewRate >= 0,
        },
      ],
      line: {
        title: "방문자 추이",
        kpi: {
          value: visitors.toLocaleString(),
          // ✅ "+-40%" 방지
          sub: `${selectedTab} ${visitorRate > 0 ? "+" : ""}${visitorRate}%`,
          // ✅ 색상 분기용
          up: visitorRate >= 0,
        },
        labels:
          selectedTab === "오늘"
            ? ["오전", "정오", "오후", "저녁"]
            : selectedTab === "주간"
              ? ["월", "화", "수", "목", "금", "토", "일"]
              : selectedTab === "월간"
                // ✅ 데이터 길이에 맞춰 라벨 생성(점 5개면 5주)
                ? Array.from({ length: timeSeries.length }, (_, i) => `${i + 1}주`)
                : startDate && endDate
                  ? getCustomLabels(startDate, endDate)
                  : [],
        data: timeSeries,
      },

      pie:
        (current.pie ?? []).map((item: any, index: number) => ({
          ...item,
          color: ["#0A84FF", "#2ECC71", "#FFC107", "#E91E63"][index % 4],
          legendFontColor: theme.textPrimary,
          legendFontSize: 13,
        })) ?? [],

      centerTop: joins.toLocaleString(),
      centerBottom: "신규 가입",
      categories: Object.entries(categories).map(([label, pct]) => ({
        label,
        pct,
      })),
      bar: { labels: ["1점", "2점", "3점", "4점", "5점"], data: ratingDistribution },
      ranks: topSearches.map((r: any, i: number) => ({
        rank: i + 1,
        term: r.term,
        count: `${r.count.toLocaleString()}회`,
      })),

      chartConfig,
    };
  }, [current, selectedTab, startDate, endDate, theme]);

  // ✅ “처음 로딩(데이터가 아직 없을 때)”만 전체 로딩 화면
  if (loading && !statsDetail) {
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
        <Text style={{ marginTop: 10, color: theme.textSecondary, fontSize: 15 }}>
          통계 데이터를 불러오는 중...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  if (!ui) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="통계 대시보드" />

      {/* 탭 영역 */}
      <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
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
            style={[styles.tab, selectedTab === tab && { backgroundColor: theme.icon }]}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === tab ? "#fff" : theme.textSecondary },
              ]}
            >
              {tab === "사용자 지정" && startDate && endDate
                ? `${startDate} ~ ${endDate}`
                : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 기간 선택 모달 */}
      <Modal
        isVisible={isCalendarVisible}
        onBackdropPress={() => setIsCalendarVisible(false)}
        style={styles.modal}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
            기간 선택
          </Text>

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
                [endDate]: {
                  endingDay: true,
                  color: "#0A84FF",
                  textColor: "white",
                },
              }),
              ...(startDate &&
                endDate && {
                  ...Object.fromEntries(
                    Array.from(
                      {
                        length:
                          (new Date(endDate).getTime() -
                            new Date(startDate).getTime()) /
                            (1000 * 60 * 60 * 24) -
                          1,
                      },
                      (_, i) => {
                        const d = new Date(
                          new Date(startDate).getTime() + (i + 1) * 86400000
                        )
                          .toISOString()
                          .split("T")[0];
                        return [d, { color: "#B3D7FF", textColor: theme.textPrimary }];
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
              backgroundColor: theme.card,
              calendarBackground: theme.card,
              dayTextColor: theme.textPrimary,
              textDisabledColor: theme.textSecondary,
              monthTextColor: theme.textPrimary,
              arrowColor: "#0A84FF",
              todayTextColor: "#0A84FF",
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
              <Text style={[styles.modalCancelText, { color: theme.textPrimary }]}>
                취소
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#0A84FF" }]}
              onPress={() => {
                setIsCalendarVisible(false);
                if (startDate && endDate) {
                  refetch(startDate, endDate);
                }
              }}
            >
              <Text style={styles.modalConfirmText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 본문 */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 요약 카드 */}
        <View style={styles.statsGrid}>
          {ui.cards.map((c) => (
            <View
              key={c.label}
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderWidth: 1,
                  shadowColor: theme.background,
                },
              ]}
            >
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {c.label}
              </Text>
              <Text style={[styles.statValue, { color: theme.icon }]}>{c.value}</Text>
              <Text style={{ color: c.up ? "#2EAD50" : "#E53935" }}>{c.rate}</Text>
            </View>
          ))}
        </View>

        {/* 방문자 추이 */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderWidth: 1,
              shadowColor: theme.background,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {ui.line.title}
          </Text>
          <View style={styles.kpiRow}>
            <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>
              {ui.line.kpi.value}
            </Text>

            {/* ✅ +면 초록 / -면 빨강 */}
            <Text
              style={[
                styles.kpiSub,
                { color: ui.line.kpi.up ? "#2EAD50" : "#E53935" },
              ]}
            >
              {ui.line.kpi.sub}
            </Text>
          </View>

          {ui.line.data.length > 0 && ui.line.data.some((v: number) => v > 0) ? (
            <LineChart
              data={{ labels: ui.line.labels, datasets: [{ data: ui.line.data }] }}
              width={width - 35}
              height={180}
              chartConfig={ui.chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
            />
          ) : (
            <View
              style={[
                styles.chart,
                { height: 180, justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Text style={{ color: theme.textSecondary }}>데이터가 없습니다.</Text>
            </View>
          )}
        </View>

        {/* 신규 유입 경로 */}
        {ui.pie && ui.pie.length > 0 && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderWidth: 1,
                shadowColor: theme.background,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              신규 유입 경로
            </Text>
            <DonutChart
              data={ui.pie.map((d: any) => ({
                name: d.name,
                value: d.population ?? d.value,
                color: d.color,
              }))}
              centerTop={ui.centerTop}
              centerBottom={ui.centerBottom}
            />

            <View style={styles.legend}>
              {ui.pie.map((d: any) => (
                <View key={d.name} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                    {d.name} ({d.population ?? d.value}%)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 맛집 카테고리 */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderWidth: 1,
              shadowColor: theme.background,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            맛집 카테고리 분포
          </Text>

          {/* ✅ 데이터 없을 때 메시지 */}
          {ui.categories.length > 0 ? (
            ui.categories.map((c: any, index: number) => {
              const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#B185DB"];
              return (
                <View key={c.label} style={{ marginTop: 10 }}>
                  <View style={styles.catRow}>
                    <Text style={[styles.catLabel, { color: theme.textSecondary }]}>
                      {c.label}
                    </Text>
                    <Text style={[styles.catPct, { color: theme.textSecondary }]}>
                      {c.pct}%
                    </Text>
                  </View>
                  <View style={[styles.catTrack, { backgroundColor: theme.background }]}>
                    <View
                      style={[
                        styles.catFill,
                        {
                          width: `${c.pct}%`,
                          backgroundColor: colors[index % colors.length],
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          ) : (
            <View
              style={[
                styles.chart,
                { height: 120, justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Text style={{ color: theme.textSecondary }}>데이터가 없습니다.</Text>
            </View>
          )}
        </View>

        {/* 리뷰 평점 */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderWidth: 1,
              shadowColor: theme.background,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            리뷰 평점 분포
          </Text>

          {ui.bar.data.length > 0 && ui.bar.data.some((v: number) => v > 0) ? (
            <BarChart
              data={{ labels: ui.bar.labels, datasets: [{ data: ui.bar.data }] }}
              width={width - 55}
              height={180}
              chartConfig={ui.chartConfig}
              withInnerLines={false}
              style={styles.chart}
              xAxisLabel=""
              yAxisLabel=""
              yAxisSuffix=""
            />
          ) : (
            <View
              style={[
                styles.chart,
                { height: 180, justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Text style={{ color: theme.textSecondary }}>데이터가 없습니다.</Text>
            </View>
          )}
        </View>

        {/* 인기 검색어 */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderWidth: 1,
              shadowColor: theme.background,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            인기 검색어
          </Text>

          {/* ✅ 데이터 없을 때 메시지 */}
          {ui.ranks.length > 0 ? (
            ui.ranks.map((r: any) => (
              <View key={r.rank} style={styles.rankRow}>
                <Text style={[styles.rankIndex, { color: theme.icon }]}>{r.rank}</Text>
                <Text style={[styles.rankTerm, { color: theme.textPrimary }]}>{r.term}</Text>
                <Text style={[styles.rankCount, { color: theme.textSecondary }]}>{r.count}</Text>
              </View>
            ))
          ) : (
            <View
              style={[
                styles.chart,
                { height: 120, justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Text style={{ color: theme.textSecondary }}>데이터가 없습니다.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  tabText: { fontWeight: "600" },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statCard: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: { fontSize: 13 },
  statValue: { fontSize: 22, fontWeight: "bold", marginVertical: 4 },

  section: { borderRadius: 12, padding: 16, marginTop: 16 },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  chart: { borderRadius: 12, marginLeft: -16 },
  kpiRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 6 },
  kpiValue: { fontSize: 28, fontWeight: "800", marginRight: 6 },
  kpiSub: { fontSize: 13, fontWeight: "700" },

  catRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  catLabel: { fontSize: 13 },
  catPct: { fontSize: 13 },
  catTrack: { height: 6, borderRadius: 999 },
  catFill: { height: 6, borderRadius: 999 },

  rankRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  rankIndex: { width: 20, fontWeight: "bold", textAlign: "center" },
  rankTerm: { flex: 1, paddingLeft: 6 },
  rankCount: {},

  legend: { marginTop: 16 },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 13 },

  modal: { justifyContent: "flex-end", margin: 0 },
  modalContainer: {
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
  modalCancelText: { fontWeight: "600" },
  modalConfirmText: { color: "#fff", fontWeight: "700" },
});
