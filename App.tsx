import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { AdminMainStack } from "../frontend/presentation/navigation/AdminNavigation";
import { RootStackParamList } from "./presentation/navigation/types/RootStackParamList"

import SplashScreen from "../frontend/presentation/screens/SplashScreen";
import LoginScreen from "../frontend/presentation/screens/LoginScreen";
import FindAccountScreen from "../frontend/presentation/screens/FindAccountScreen";
import OnboardingScreen from "../frontend/presentation/screens/OnboardingScreen";
import SignUpScreen from "../frontend/presentation/screens/SignupScreen";
import UserMain from "../frontend/presentation/screens/UserMain";

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="FindAccount" component={FindAccountScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="AdminMain" component={AdminMainStack} />
          <Stack.Screen name="UserMain" component={UserMain} />

        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
