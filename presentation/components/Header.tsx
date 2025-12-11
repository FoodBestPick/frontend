import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ThemeContext } from "../../context/ThemeContext";

type HeaderProps = {
  title: string;
  iconName?: string;
  showBackButton?: boolean;
  onIconPress?: () => void;
  onBackPress?: () => void;
};

export const Header = ({
  title,
  iconName,
  showBackButton = false,
  onIconPress,
  onBackPress,
}: HeaderProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderBottomColor: theme.border },
      ]}
    >
      {/* 왼쪽: 뒤로가기 버튼 */}
      {showBackButton ? (
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.leftButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back-ios" size={22} color={theme.icon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.leftPlaceholder} />
      )}

      {/* 가운데: 제목 */}
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>

      {/* 오른쪽: 선택적 아이콘 */}
      {iconName ? (
        <TouchableOpacity
          onPress={onIconPress}
          style={styles.rightButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name={iconName} size={24} color={theme.icon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.rightPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  leftButton: {
    width: 30,
    alignItems: "flex-start",
  },
  rightButton: {
    width: 30,
    alignItems: "flex-end",
  },
  leftPlaceholder: {
    width: 30,
  },
  rightPlaceholder: {
    width: 30,
  },
});
