import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/login/LoginScreen';
import RoleScreen from './screens/login/RoleScreen';
import SplashScreen from './screens/login/SplashScreen';
import CreateAccountScreen from './screens/login/CreateAccountScreen';
import AddApartmentScreen from './screens/register/AddApartmentScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isSplashVisible, setSplashVisible] = useState(true);

  const handleAnimationFinish = () => {
    setSplashVisible(false);
  };

  return (
    <NavigationContainer>
      {isSplashVisible ? (
        <SplashScreen onAnimationFinish={handleAnimationFinish} />
      ) : (
        <Stack.Navigator initialRouteName="RoleScreen" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="RoleScreen" component={RoleScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="CreateAccountScreen" component={CreateAccountScreen} />
          <Stack.Screen name="AddApartmentScreen" component={AddApartmentScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
