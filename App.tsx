// frontend/App.tsx
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { AdminMainStack } from '../frontend/presentation/navigation/AdminNavigation';
import { RootStackParamList } from './presentation/navigation/types/RootStackParamList';
import { UserNavigation } from '../frontend/presentation/navigation/UserNavigation';

import SplashScreen from '../frontend/presentation/screens/SplashScreen';
import OnboardingScreen from '../frontend/presentation/screens/OnboardingScreen';
import LoginScreen from '../frontend/presentation/screens/LoginScreen';
import SignupScreen from '../frontend/presentation/screens/SignupScreen';
import FindAccountScreen from '../frontend/presentation/screens/FindAccountScreen';
import SearchScreen from '../frontend/presentation/screens/SearchScreen';
import SearchResultScreen from '../frontend/presentation/screens/SearchResultScreen';
import RestaurantDetailScreen from '../frontend/presentation/screens/RestaurantDetailScreen';
import RouletteScreen from '../frontend/presentation/screens/RouletteScreen';

import { AdminRestaurantAddScreen } from './presentation/screens/AdminRestaurantAddScreen';
import { AdminNotificationScreen } from './presentation/screens/AdminNotificationScreen';
import { MapSelectScreen } from './presentation/screens/MapSelectScreen';

import MyPageScreen from './presentation/screens/MyPageScreen';
import UserNotificationScreen from './presentation/screens/UserNotificationScreen';
import MatchScreen from './presentation/screens/MatchScreen';
import MatchingSetupScreen from './presentation/screens/MatchingSetupScreen';
import MatchingFindingScreen from './presentation/screens/MatchingFindingScreen';
import ChatRoomScreen from './presentation/screens/ChatRoomScreen';

import { ThemeProvider } from "./context/ThemeContext";
import { useContext } from "react";
import { ThemeContext } from "./context/ThemeContext";

// ⭐ 자동로그인 상태 유지
import { AuthProvider, useAuth } from "./context/AuthContext";

const Stack = createStackNavigator<RootStackParamList>();

function AppInner() {
  const { isDarkMode } = useContext(ThemeContext);
  const { loading, isLoggedIn } = useAuth();   // ⭐ 추가됨

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#121212" : "#FFFFFF"}
      />

      <NavigationContainer>

        {/* ⭐ 앱 처음 켤 때: 토큰 로딩중이면 Splash만 보여줌 */}
        {loading ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
          </Stack.Navigator>
        ) : isLoggedIn ? (
          // ⭐ 로그인됨 → 메인 스택
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right"
            }}>
            <Stack.Screen name="UserMain" component={UserNavigation} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
            <Stack.Screen name="SearchResult" component={SearchResultScreen} />
            <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
            <Stack.Screen name="RouletteScreen" component={RouletteScreen} />
            <Stack.Screen name="MyPageScreen" component={MyPageScreen} />
            <Stack.Screen name="UserNotificationScreen" component={UserNotificationScreen} />
            <Stack.Screen name="MatchScreen" component={MatchScreen} />
            <Stack.Screen name="MatchingSetupScreen" component={MatchingSetupScreen} />
            <Stack.Screen name="MatchingFindingScreen" component={MatchingFindingScreen} />
            <Stack.Screen name="ChatRoomScreen" component={ChatRoomScreen} />

            {/* 관리자 */}
            <Stack.Screen name="AdminMain" component={AdminMainStack} />
            <Stack.Screen name="AdminRestaurantAdd" component={AdminRestaurantAddScreen} />
            <Stack.Screen name="NotificationScreen" component={AdminNotificationScreen} />
          </Stack.Navigator>
        ) : (
          // ⭐ 비로그인 → 로그인 플로우
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
            initialRouteName="Onboarding"
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignupScreen} />
            <Stack.Screen name="FindAccount" component={FindAccountScreen} />
            <Stack.Screen name="MapSelectScreen" component={MapSelectScreen} />
          </Stack.Navigator>
        )}

      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </AuthProvider>
  );
}
