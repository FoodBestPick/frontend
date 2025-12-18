import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: theme.card, 
          borderBottomColor: theme.border,
          // 📱 고정 marginTop: 40 대신 시스템 높이를 반영
          paddingTop: insets.top, 
          height: 48 + insets.top,
        },
      ]}
    >
      <View style={styles.content}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  leftButton: {
    width: 48,
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  rightButton: {
    width: 48,
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  leftPlaceholder: {
    width: 48,
  },
  rightPlaceholder: {
    width: 48,
  },
});