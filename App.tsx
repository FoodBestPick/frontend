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
import UserMain from '../frontend/presentation/screens/UserMain';
import SearchScreen from '../frontend/presentation/screens/SearchScreen';
import SearchResultScreen from '../frontend/presentation/screens/SearchResultScreen';
import RestaurantDetailScreen from '../frontend/presentation/screens/RestaurantDetailScreen';
import RouletteScreen from '../frontend/presentation/screens/RouletteScreen';
import { AdminRestaurantAddScreen } from './presentation/screens/AdminRestaurantAddScreen';
import { AdminNotificationScreen } from './presentation/screens/AdminNotificationScreen';
import { MapSelectScreen } from './presentation/screens/MapSelectScreen';
import { ThemeProvider } from "./context/ThemeContext";
import { useContext } from "react";
import { ThemeContext } from "./context/ThemeContext";
import MyPageScreen from './presentation/screens/MyPageScreen';

const Stack = createStackNavigator<RootStackParamList>();

function AppInner() {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#121212" : "#FFFFFF"}
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
          <Stack.Screen name="AdminRestaurantAdd" component={AdminRestaurantAddScreen} />
          <Stack.Screen name="NotificationScreen" component={AdminNotificationScreen} />

          {/* 사용자 */}
          <Stack.Screen name="UserMain" component={UserNavigation} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen name="SearchResult" component={SearchResultScreen} />
          <Stack.Screen
            name="RestaurantDetail"
            component={RestaurantDetailScreen}
          />
          <Stack.Screen name="RouletteScreen" component={RouletteScreen} />
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
