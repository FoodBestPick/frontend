import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import UserMain from '../screens/UserMain';
import RouletteScreen from '../screens/RouletteScreen';
import MatchingScreen from '../screens/MatchScreen';
import MyPageScreen from '../screens/MyPageScreen';
const Tab = createBottomTabNavigator();

export const UserNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => {
          const map: Record<string, string> = {
            HomeTab: 'home-outline',
            RouletteTab: 'refresh-outline',
          };
          return (
            <Icon
              name={map[route.name] ?? 'ellipse-outline'}
              size={22}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: '#FFA847',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 75,
          paddingBottom: 10,
          paddingTop: 5,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -2 },
          backgroundColor: '#fff',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={UserMain}
        options={{ tabBarLabel: '홈' }}
      />
      <Tab.Screen
        name="RouletteTab"
        component={RouletteScreen}
        options={{ tabBarLabel: '룰렛' }}
      />

      {/* 3. 매칭 */}
      <Tab.Screen
        name="MatchingTab"
        component={MatchingScreen}
        options={{ tabBarLabel: '매칭' }}
      />

      {/* 4. 마이페이지 */}
      <Tab.Screen
        name="MyPageTab"
        component={MyPageScreen}
        options={{ tabBarLabel: '마이페이지' }}
      />

    </Tab.Navigator>
  );
};

export default UserNavigation;
