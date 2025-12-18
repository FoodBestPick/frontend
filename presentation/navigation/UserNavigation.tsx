import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import UserMain from '../screens/UserMain';
import RouletteScreen from '../screens/RouletteScreen';
import MyPageScreen from '../screens/MyPageScreen';
import MatchScreen from '../screens/MatchScreen';
// import NotificationScreen from '../screens/NotificationScreen'; // ❌ 제거됨
import SearchScreen from '../screens/SearchScreen';
import SearchResultScreen from '../screens/SearchResultScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import ReviewWriteScreen from '../screens/ReviewWriteScreen';
import MyLikesScreen from '../screens/MyLikesScreen';
import MyReviewsScreen from '../screens/MyReviewsScreen';
import MatchingSetupScreen from '../screens/MatchingSetupScreen';
import MatchingFindingScreen from '../screens/MatchingFindingScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import CustomerServiceScreen from '../screens/CustomerServiceScreen'; 
import MyReportListScreen from '../screens/MyReportListScreen'; // ✨ 추가
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const RouletteStack = createStackNavigator();
const MatchStack = createStackNavigator();
const MyPageStack = createStackNavigator();
// const NotificationStack = createStackNavigator(); // ❌ 제거됨

const stackOptions = { headerShown: false };

// 1. 홈 스택
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={stackOptions}>
    <HomeStack.Screen name="UserMainScreen" component={UserMain} />
    <HomeStack.Screen name="SearchScreen" component={SearchScreen} />
    <HomeStack.Screen name="SearchResult" component={SearchResultScreen} />
    <HomeStack.Screen
      name="RestaurantDetail"
      component={RestaurantDetailScreen}
    />
    <HomeStack.Screen name="ReviewWrite" component={ReviewWriteScreen} />
  </HomeStack.Navigator>
);

// 2. 룰렛 스택
const RouletteStackNavigator = () => (
  <RouletteStack.Navigator screenOptions={stackOptions}>
    <RouletteStack.Screen name="RouletteScreen" component={RouletteScreen} />
    <RouletteStack.Screen name="SearchResult" component={SearchResultScreen} />
    <RouletteStack.Screen
      name="RestaurantDetail"
      component={RestaurantDetailScreen}
    />
    <RouletteStack.Screen name="ReviewWrite" component={ReviewWriteScreen} />
  </RouletteStack.Navigator>
);

// 3. 매칭 스택
const MatchStackNavigator = () => (
  <MatchStack.Navigator screenOptions={stackOptions}>
    <MatchStack.Screen name="MatchScreen" component={MatchScreen} />
    <MatchStack.Screen name="MatchingSetupScreen" component={MatchingSetupScreen} />
    <MatchStack.Screen name="MatchingFindingScreen" component={MatchingFindingScreen} />
    {/* ChatRoomScreen 제거됨: App.tsx의 Root Stack에서 처리하여 탭바 가림 */}
  </MatchStack.Navigator>
);

// 4. 마이페이지 스택
const MyPageStackNavigator = () => (
  <MyPageStack.Navigator screenOptions={stackOptions}>
    <MyPageStack.Screen name="MyPageScreen" component={MyPageScreen} />
    <MyPageStack.Screen name="MyLikesScreen" component={MyLikesScreen} />
    <MyPageStack.Screen name="MyReviewsScreen" component={MyReviewsScreen} />
    <MyPageStack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
    <MyPageStack.Screen name="CustomerService" component={CustomerServiceScreen} /> 
    <MyPageStack.Screen name="MyReportListScreen" component={MyReportListScreen} /> 
    <MyPageStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
  </MyPageStack.Navigator>
);

// ❌ 5. 알림 스택 (제거됨)

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
            MatchingTab: 'people-outline',
            MyPageTab: 'person-outline',
            // NotificationTab: 'notifications-outline', // ❌ 제거됨
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
          backgroundColor: '#fff',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: '홈' }}
      />
      <Tab.Screen
        name="RouletteTab"
        component={RouletteStackNavigator}
        options={{ tabBarLabel: '룰렛' }}
      />
      {/* ❌ NotificationTab 제거됨 */}
      <Tab.Screen
        name="MatchingTab"
        component={MatchStackNavigator}
        options={{ tabBarLabel: '매칭' }}
      />
      <Tab.Screen
        name="MyPageTab"
        component={MyPageStackNavigator}
        options={{ tabBarLabel: '마이페이지' }}
      />
    </Tab.Navigator>
  );
};

export default UserNavigation;