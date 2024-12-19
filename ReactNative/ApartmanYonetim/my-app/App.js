import AppNavigator from "./src/navigation/AppNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { UserContextProvider } from "./src/contexts/UserContext";

export default function App() {
  return (
    <UserContextProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </UserContextProvider>
  );
}
