import 'react-native-gesture-handler';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useContext, useState, useRef } from 'react';

// Navigations
import { AdminMainStack } from '../frontend/presentation/navigation/AdminNavigation';
import { UserNavigation } from '../frontend/presentation/navigation/UserNavigation';
import { RootStackParamList } from './presentation/navigation/types/RootStackParamList';

// Screens - Auth
import SplashScreen from '../frontend/presentation/screens/SplashScreen';
import OnboardingScreen from '../frontend/presentation/screens/OnboardingScreen';
import LoginScreen from '../frontend/presentation/screens/LoginScreen';
import SignupScreen from '../frontend/presentation/screens/SignupScreen';
import FindAccountScreen from '../frontend/presentation/screens/FindAccountScreen';
// ⭐ [추가됨] 비밀번호 변경 스크린 import
import ChangePasswordScreen from './presentation/screens/ChangePasswordScreen';
import DeleteAccountScreen from './presentation/screens/DeleteAccountScreen'; 
// Screens - User & Common
import SearchScreen from '../frontend/presentation/screens/SearchScreen';
import SearchResultScreen from '../frontend/presentation/screens/SearchResultScreen';
import RestaurantDetailScreen from '../frontend/presentation/screens/RestaurantDetailScreen';
import { MapSelectScreen } from './presentation/screens/MapSelectScreen';
import { AdminManageSelectScreen } from './presentation/screens/AdminManageSelectScreen';
import { AdminFoodManageScreen } from './presentation/screens/AdminFoodManageScreen';
import { AdminTagManageScreen } from './presentation/screens/AdminTagManageScreen';
import RouletteScreen from '../frontend/presentation/screens/RouletteScreen';
import MyPageScreen from './presentation/screens/MyPageScreen';
import UserNotificationScreen from './presentation/screens/UserNotificationScreen';
import MatchScreen from './presentation/screens/MatchScreen';
import MatchingSetupScreen from './presentation/screens/MatchingSetupScreen';
import MatchingFindingScreen from './presentation/screens/MatchingFindingScreen';
import ChatRoomScreen from './presentation/screens/ChatRoomScreen';
import NotificationSettingScreen from "./presentation/screens/NotificationSettingScreen"; 
// Screens - Admin
import { AdminRestaurantAddScreen } from './presentation/screens/AdminRestaurantAddScreen';
import { AdminNotificationScreen } from './presentation/screens/AdminNotificationScreen';
import AdminReportScreen from './presentation/screens/AdminReportScreen';
import { AdminInquiryScreen } from './presentation/screens/AdminInquiryScreen';

// Contexts
import { ThemeProvider, ThemeContext } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components
import { FloatingChatButton } from './presentation/components/FloatingChatButton';

const Stack = createStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function AppInner() {
  const { isDarkMode } = useContext(ThemeContext);
  const { loading, isLoggedIn, isAdmin } = useAuth();
  const [currentRouteName, setCurrentRouteName] = useState<string>('');

  if (isLoggedIn) {
    // console.log(`[App.tsx] 화면 전환 시도 - isAdmin: ${isAdmin}`);
  }

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#121212' : '#FFFFFF'}
      />

      <NavigationContainer
        ref={navigationRef}
        onStateChange={() => {
          const currentRoute = navigationRef.getCurrentRoute();
          if (currentRoute) {
            setCurrentRouteName(currentRoute.name);
          }
        }}
      >
        {loading ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
          </Stack.Navigator>
        ) : isLoggedIn ? (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right"
            }}
          >
            {isAdmin ? (
              // 관리자인 경우 AdminMain만 등록 (필요시 UserMain으로 이동 가능하게 추가할 수도 있음)
              <>
                <Stack.Screen name="AdminMain" component={AdminMainStack} />
                <Stack.Screen name="UserMain" component={UserNavigation} />
              </>
            ) : (
              // 일반 유저인 경우 UserMain만 등록
              <Stack.Screen name="UserMain" component={UserNavigation} />
            )}

            {/* 공통 스크린들 */}
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
            <Stack.Screen
              name="NotificationSetting"
              component={NotificationSettingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
            <Stack.Screen name="AdminRestaurantAdd" component={AdminRestaurantAddScreen} />
            <Stack.Screen name="NotificationScreen" component={AdminNotificationScreen} />
            <Stack.Screen name="AdminReportScreen" component={AdminReportScreen} />
            <Stack.Screen name="AdminInquiryScreen" component={AdminInquiryScreen} />
            <Stack.Screen name="AdminManageSelect" component={AdminManageSelectScreen} />
            <Stack.Screen name="AdminFoodManage" component={AdminFoodManageScreen} />
            <Stack.Screen name="AdminTagManage" component={AdminTagManageScreen} />
            <Stack.Screen name="MapSelectScreen" component={MapSelectScreen} />
          </Stack.Navigator>
        ) : (
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

      {/* 🔥 전역 플로팅 버튼 (로그인 상태일 때만) */}
      {isLoggedIn && !loading && (
        <FloatingChatButton 
          currentRouteName={currentRouteName} 
          navigationRef={navigationRef} 
        />
      )}
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