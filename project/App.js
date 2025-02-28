import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from 'react-native-paper';
import AppNavigator from "./src/navigation/AppNavigator";
import { theme } from './src/styles/theme';

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        
        <AppNavigator />

      </NavigationContainer>
    </PaperProvider>
  );
}
