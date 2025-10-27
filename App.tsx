import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "react-native";
import { AdminMainStack } from "../frontend/presentation/navigation/AdminNavigation";

export default function App() {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <NavigationContainer>
        <AdminMainStack />  
      </NavigationContainer>
    </>
  );
}
