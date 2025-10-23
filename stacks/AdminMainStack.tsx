// stacks/MainStack.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { View, Text } from "react-native";
import { AdminDashboardScreen } from "../screens/AdminDashboardScreen";

const Tab = createBottomTabNavigator();

const Placeholder = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>{title} 화면</Text>
  </View>
);

export const AdminMainStack = () => {
  return (
    <Tab.Navigator
      initialRouteName="대시보드"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#000000", 
        tabBarInactiveTintColor: "#C68A35",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0.3,
          borderTopColor: "#CCC",
          height: 80,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          // 아이콘 매핑
          if (route.name === "대시보드")
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={color}
              />
            );
          if (route.name === "식당")
            return <Ionicons name="location-outline" size={22} color={color} />;
          if (route.name === "회원")
            return (
              <Ionicons name="people-outline" size={22} color={color} />
            );
          if (route.name === "보고서")
            return (
              <MaterialIcons name="outlined-flag" size={22} color={color} />
            );
          if (route.name === "분석")
            return (
              <FontAwesome5 name="chart-bar" size={20} color={color} solid={focused} />
            );
        },
      })}
    >
      <Tab.Screen
        name="대시보드"
        component={AdminDashboardScreen}
        options={{ title: "대시보드" }}
      />
      <Tab.Screen name="식당" component={() => <Placeholder title="식당" />} />
      <Tab.Screen name="회원" component={() => <Placeholder title="회원" />} />
      <Tab.Screen name="보고서" component={() => <Placeholder title="보고서" />} />
      <Tab.Screen name="분석" component={() => <Placeholder title="분석" />} />
    </Tab.Navigator>
  );
};
