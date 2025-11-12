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
import UserMain from '../frontend/presentation/screens/UserMain';
import SearchScreen from '../frontend/presentation/screens/SearchScreen';
import SearchResultScreen from '../frontend/presentation/screens/SearchResultScreen';
import RestaurantDetailScreen from '../frontend/presentation/screens/RestaurantDetailScreen';
import RouletteScreen from '../frontend/presentation/screens/RouletteScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignupScreen} />
          <Stack.Screen name="FindAccount" component={FindAccountScreen} />

          {/* 관리자 */}
          <Stack.Screen name="AdminMain" component={AdminMainStack} />

          {/* 사용자 */}
          <Stack.Screen name="UserMain" component={UserMain} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen name="MatchScreen" component={MatchScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="MyPage" component={MyPageScreen} />
          <Stack.Screen name="SearchResult" component={SearchResultScreen} />
          <Stack.Screen
            name="RestaurantDetail"
            component={RestaurantDetailScreen}
          />
          <Stack.Screen name="RouletteScreen" component={RouletteScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
