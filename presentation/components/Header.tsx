import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../core/constants/colors";

export const Header = ({ title }: { title: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
  },
  title: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    textAlign : "center",
  },
});