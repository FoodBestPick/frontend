import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";

export const Header = ({ title }: { title: string }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderBottomColor: theme.border },
      ]}
    >
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
