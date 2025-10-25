// components/DashboardCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

type Props = {
  label: string;
  value: string | number;
};

export const DashboardCard = ({ label, value }: Props) => (
  <View style={styles.card}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width : "30%",
    alignItems: "center",
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
  },
});
