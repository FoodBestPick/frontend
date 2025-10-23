// screens/AdminDashboardScreen.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Header } from "../components/Header";
import { DashboardCard } from "../components/DashBoardCard";
import { COLORS } from "../constants/colors";
import { getAdminStats } from "../services/AdminService.tsx";

export const AdminDashboardScreen = () => {
  const [stats, setStats] = useState({
    users: 0,
    reports: 0,
    restaurants: 0,
  });

  useEffect(() => {
    (async () => {
      const data = await getAdminStats();
      setStats(data);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="관리자 대시보드" />
      <ScrollView contentContainerStyle={styles.content}>
        <DashboardCard label="전체 사용자" value={stats.users} />
        <DashboardCard label="신고 접수" value={stats.reports} />
        <DashboardCard label="등록된 맛집" value={stats.restaurants} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 10,
    gap: 12,
  },
});
