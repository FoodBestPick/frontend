import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";

type Props = {
  label: string;
  value: string | number;
};

export const DashboardCard = ({ label, value }: Props) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.background === "#121212";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,   // ✅ 테두리 색상 통일
          borderWidth: 1,              // ✅ 테두리 추가
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.4 : 0.08,
          shadowRadius: 6,
          elevation: isDark ? 3 : 2,
        },
      ]}
    >
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: theme.icon }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    width: "30%",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
