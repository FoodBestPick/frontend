import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { AdminDashBoardScreen } from "../screens/AdminDashBoardScreen";
import { AdminStatsScreen } from "../screens/AdminStatsScreen";
import { AdminUserScreen } from "../screens/AdminUserScreen";
import { AdminRestaurantScreen } from "../screens/AdminRestaurantScreen";
import { AdminSettingScreen } from "../screens/AdminSettingScreen";
import { ThemeContext } from "../../context/ThemeContext";

const Tab = createBottomTabNavigator();

export const AdminMainStack = () => {
  const { isDarkMode, theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      initialRouteName="대시보드"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: isDarkMode ? "#C68A35" : "#000000",
        tabBarInactiveTintColor: isDarkMode ? "#999999" : "#C68A35",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: isDarkMode ? theme.card : "#FFFFFF",
          borderTopWidth: 0.3,
          borderTopColor: isDarkMode ? theme.border : "#CCC",
          height: 80,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === "대시보드")
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={color}
              />
            );
          if (route.name === "맛집")
            return <Ionicons name="location-outline" size={22} color={color} />;
          if (route.name === "회원")
            return <Ionicons name="people-outline" size={22} color={color} />;
          if (route.name === "설정")
            return <MaterialIcons name="settings" size={22} color={color} />;
          if (route.name === "통계")
            return (
              <FontAwesome5
                name="chart-bar"
                size={20}
                color={color}
                solid={focused}
              />
            );
        },
      })}
    >
      <Tab.Screen
        name="대시보드"
        component={AdminDashBoardScreen}
        options={{ title: "대시보드" }}
      />
      <Tab.Screen
        name="맛집"
        component={AdminRestaurantScreen}
        options={{ title: "맛집" }}
      />
      <Tab.Screen
        name="회원"
        component={AdminUserScreen}
        options={{ title: "회원" }}
      />
      <Tab.Screen
        name="통계"
        component={AdminStatsScreen}
        options={{ title: "통계" }}
      />
      <Tab.Screen
        name="설정"
        component={AdminSettingScreen}
        options={{ title: "설정" }}
      />
    </Tab.Navigator>
  );
};
