import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { AdminMainStack } from '../frontend/presentation/navigation/AdminNavigation';
import { RootStackParamList } from './presentation/navigation/types/RootStackParamList';

import SplashScreen from '../frontend/presentation/screens/SplashScreen';
import OnboardingScreen from '../frontend/presentation/screens/OnboardingScreen';
import LoginScreen from '../frontend/presentation/screens/LoginScreen';
import SignupScreen from '../frontend/presentation/screens/SignupScreen';
import FindAccountScreen from '../frontend/presentation/screens/FindAccountScreen';
import RestaurantDetailScreen from '../frontend/presentation/screens/RestaurantDetailScreen';
import UserNavigation from './presentation/navigation/UserNavigation';
import { AdminRestaurantAddScreen } from './presentation/screens/AdminRestaurantAddScreen';
import { AdminNotificationScreen } from './presentation/screens/AdminNotificationScreen';
import { MapSelectScreen } from './presentation/screens/MapSelectScreen';
import { AdminManageSelectScreen } from './presentation/screens/AdminManageSelectScreen';
import { AdminFoodManageScreen } from './presentation/screens/AdminFoodManageScreen';
import { AdminTagManageScreen } from './presentation/screens/AdminTagManageScreen';
import { ThemeProvider } from './context/ThemeContext';
import { useContext } from 'react';
import { ThemeContext } from './context/ThemeContext';
import MyPageScreen from './presentation/screens/MyPageScreen';

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
          <Stack.Screen
            name="RestaurantDetail"
            component={RestaurantDetailScreen}
          />
          <Stack.Screen name="MyPageScreen" component={MyPageScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
