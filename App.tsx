import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 추가
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
import { AdminRestaurantAddScreen } from './presentation/screens/AdminRestaurantAddScreen';
import { AdminNotificationScreen } from './presentation/screens/AdminNotificationScreen';
import { MapSelectScreen } from './presentation/screens/MapSelectScreen';
import { AdminManageSelectScreen } from './presentation/screens/AdminManageSelectScreen';
import { AdminFoodManageScreen } from './presentation/screens/AdminFoodManageScreen';
import { AdminTagManageScreen } from './presentation/screens/AdminTagManageScreen';
import { ThemeProvider } from './context/ThemeContext';
import { useContext, useEffect } from 'react';
import { ThemeContext } from './context/ThemeContext';
import MyPageScreen from './presentation/screens/MyPageScreen';
import UserNotificationScreen from './presentation/screens/UserNotificationScreen';
import MatchScreen from './presentation/screens/MatchScreen';
import MatchingSetupScreen from './presentation/screens/MatchingSetupScreen';
import MatchingFindingScreen from './presentation/screens/MatchingFindingScreen';
import ChatRoomScreen from './presentation/screens/ChatRoomScreen';
const Stack = createStackNavigator<RootStackParamList>();

function AppInner() {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#121212' : '#FFFFFF'}
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animationTypeForReplace: 'push',
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}
        >
          {/* 공용 */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignupScreen} />
          <Stack.Screen name="FindAccount" component={FindAccountScreen} />
          <Stack.Screen name="MapSelectScreen" component={MapSelectScreen} />

          {/* 관리자 */}
          <Stack.Screen name="AdminMain" component={AdminMainStack} />
          <Stack.Screen
            name="AdminRestaurantAdd"
            component={AdminRestaurantAddScreen}
          />
          <Stack.Screen
            name="NotificationScreen"
            component={AdminNotificationScreen}
          />
          <Stack.Screen
            name="AdminManageSelect"
            component={AdminManageSelectScreen}
          />
          <Stack.Screen
            name="AdminFoodManage"
            component={AdminFoodManageScreen}
          />
          <Stack.Screen
            name="AdminTagManage"
            component={AdminTagManageScreen}
          />

          {/* 사용자 */}
          <Stack.Screen name="UserMain" component={UserNavigation} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen name="SearchResult" component={SearchResultScreen} />
          <Stack.Screen
            name="RestaurantDetail"
            component={RestaurantDetailScreen}
          />
          <Stack.Screen name="MyPageScreen" component={MyPageScreen} />
          <Stack.Screen name="UserNotificationScreen" component={UserNotificationScreen} />
          <Stack.Screen name="MatchScreen" component={MatchScreen} />
          <Stack.Screen name="MatchingSetupScreen" component={MatchingSetupScreen} />
          <Stack.Screen name="MatchingFindingScreen" component={MatchingFindingScreen} />
          <Stack.Screen name="ChatRoomScreen" component={ChatRoomScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  // 임시 토큰 값 (여기에 긴 JWT 토큰 문자열을 붙여넣으세요)
  const TEMP_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6MTc2NDM4ND..."; 

  useEffect(() => {
    const setToken = async () => {
      await AsyncStorage.setItem('accessToken', TEMP_TOKEN);
      console.log("✅ 테스트용 임시 토큰이 설정되었습니다.");
    };
    setToken();
  }, []);

  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
