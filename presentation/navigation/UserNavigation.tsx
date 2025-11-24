import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import UserMain from '../screens/UserMain';
import RouletteScreen from '../screens/RouletteScreen';
import MyPageScreen from '../screens/MyPageScreen';
import MatchScreen from '../screens/MatchScreen';
import NotificationScreen from '../screens/NotificationScreen';
import SearchScreen from '../screens/SearchScreen';
import SearchResultScreen from '../screens/SearchResultScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import MatchingScreen from '../screens/MatchScreen';
import MyPageScreen from '../screens/MyPageScreen';
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const RouletteStack = createStackNavigator();
const MatchStack = createStackNavigator();
const MyPageStack = createStackNavigator();
const NotificationStack = createStackNavigator();

const stackOptions = { headerShown: false };

// ✅ 홈 탭 스택 (UserMain + 검색 + 결과 + 상세)
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={stackOptions}>
    <HomeStack.Screen name="UserMainScreen" component={UserMain} />
    <HomeStack.Screen name="SearchScreen" component={SearchScreen} />
    <HomeStack.Screen name="SearchResult" component={SearchResultScreen} />
    <HomeStack.Screen
      name="RestaurantDetail"
      component={RestaurantDetailScreen}
    />
  </HomeStack.Navigator>
);

// ✅ 룰렛 탭 스택 (룰렛 + 결과 + 상세)
const RouletteStackNavigator = () => (
  <RouletteStack.Navigator screenOptions={stackOptions}>
    <RouletteStack.Screen name="RouletteScreen" component={RouletteScreen} />
    <RouletteStack.Screen name="SearchResult" component={SearchResultScreen} />
    <RouletteStack.Screen
      name="RestaurantDetail"
      component={RestaurantDetailScreen}
    />
  </RouletteStack.Navigator>
);

// ✅ 매칭 탭 스택
const MatchStackNavigator = () => (
  <MatchStack.Navigator screenOptions={stackOptions}>
    <MatchStack.Screen name="MatchScreen" component={MatchScreen} />
  </MatchStack.Navigator>
);

// ✅ 마이페이지 탭 스택
const MyPageStackNavigator = () => (
  <MyPageStack.Navigator screenOptions={stackOptions}>
    <MyPageStack.Screen name="MyPageScreen" component={MyPageScreen} />
  </MyPageStack.Navigator>
);

// ✅ 알림 탭 스택
const NotificationStackNavigator = () => (
  <NotificationStack.Navigator screenOptions={stackOptions}>
    <NotificationStack.Screen
      name="NotificationScreen"
      component={NotificationScreen}
    />
  </NotificationStack.Navigator>
);

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
            MatchTab: 'people-outline',
            MyPageTab: 'person-outline',
            NotificationTab: 'notifications-outline',
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
        component={HomeStackNavigator}
        options={{ tabBarLabel: '홈' }}
      />
      <Tab.Screen
        name="RouletteTab"
        component={RouletteStackNavigator}
        options={{ tabBarLabel: '룰렛' }}
      />
      <Tab.Screen
        name="NotificationTab"
        component={NotificationStackNavigator}
        options={{ tabBarLabel: '알림' }}
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
