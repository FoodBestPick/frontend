import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';

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
import DeleteAccountScreen from './presentation/screens/DeleteAccountScreen'; // 경로 확인
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
import NotificationSettingScreen from "./presentation/screens/NotificationSettingScreen"; // 경로 맞춰서 import
// Screens - Admin
import { AdminRestaurantAddScreen } from './presentation/screens/AdminRestaurantAddScreen';
import { AdminNotificationScreen } from './presentation/screens/AdminNotificationScreen';
import AdminReportScreen from './presentation/screens/AdminReportScreen';

// Contexts
import { ThemeProvider, ThemeContext } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Stack = createStackNavigator<RootStackParamList>();

function AppInner() {
  const { isDarkMode } = useContext(ThemeContext);
  // ⭐ isAdmin 상태 가져오기
  const { loading, isLoggedIn, isAdmin } = useAuth();

  // 디버깅용 로그: 실제로 App.tsx가 isAdmin을 어떻게 보고 있는지 확인
  if (isLoggedIn) {
    console.log(`[App.tsx] 화면 전환 시도 - isAdmin: ${isAdmin}`);
  }

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#121212' : '#FFFFFF'}
      />

      <NavigationContainer>
        {loading ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
          </Stack.Navigator>
        ) : isLoggedIn ? (
          // ⭐ 로그인 성공 시
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right"
            }}
          >
            {/* 🚨 [핵심 수정] initialRouteName 대신 조건부 렌더링으로 순서 제어 
               Navigator는 '가장 위에 정의된 Screen'을 첫 화면으로 보여줍니다.
            */}

            {isAdmin ? (
              // 1. 관리자인 경우: AdminMain을 가장 위에 배치 -> 무조건 여기로 감
              <Stack.Screen name="AdminMain" component={AdminMainStack} />
            ) : (
              // 2. 일반 유저인 경우: UserMain을 가장 위에 배치 -> 무조건 여기로 감
              <Stack.Screen name="UserMain" component={UserNavigation} />
            )}

            {/* 나머지 화면들 등록 (순서 상관 없음, 필요할 때 이동 가능) */}
            {/* 관리자도 유저 화면을 볼 수 있어야 하므로 UserMain 등록 (조건부 중복 방지) */}
            {isAdmin && <Stack.Screen name="UserMain" component={UserNavigation} />}

            {/* 유저는 AdminMain에 접근할 일이 없지만, 에러 방지용으로 등록은 해둘 수 있음 (선택사항) */}
            {!isAdmin && <Stack.Screen name="AdminMain" component={AdminMainStack} />}

            {/* 공통 화면들 */}
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
            {/* ⭐ [추가됨] 비밀번호 변경 화면 등록 (옵션은 Screen 파일에서 제어) */}
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
            {/* 관리자 추가 화면들 */}
            <Stack.Screen name="AdminRestaurantAdd" component={AdminRestaurantAddScreen} />
            <Stack.Screen name="NotificationScreen" component={AdminNotificationScreen} />
            <Stack.Screen name="AdminReportScreen" component={AdminReportScreen} />
            <Stack.Screen name="AdminManageSelect" component={AdminManageSelectScreen} />
            <Stack.Screen name="AdminFoodManage" component={AdminFoodManageScreen} />
            <Stack.Screen name="AdminTagManage" component={AdminTagManageScreen} />
            <Stack.Screen name="MapSelectScreen" component={MapSelectScreen} />
          </Stack.Navigator>
        ) : (
          // 비로그인 (로그인/회원가입 플로우)
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