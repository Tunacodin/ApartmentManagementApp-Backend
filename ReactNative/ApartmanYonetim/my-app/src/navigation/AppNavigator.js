import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import RoleScreen from '../screens/Auth/RoleScreen';
import AdminNavigator from './AdminNavigator';
import AuthNavigator from './AuthNavigator';
import OwnerNavigator from "./OwnerNavigator";
import WorkerNavigator from "./WorkerNavigator";
import TenantNavigator from "./TenantNavigator";
import SecurityNavigator from './SecurityNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isSplashVisible, setSplashVisible] = useState(true);

  const handleAnimationFinish = () => setSplashVisible(false);

  return (
    <NavigationContainer>
      {isSplashVisible ? (
        <SplashScreen onAnimationFinish={handleAnimationFinish} />
      ) : (
        <Stack.Navigator initialRouteName="RoleScreen" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="RoleScreen" component={RoleScreen} />
          <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
          <Stack.Screen name="AdminNavigator" component={AdminNavigator} />
          <Stack.Screen name="OwnerNavigator" component={OwnerNavigator} />
            <Stack.Screen name="WorkerNavigator" component={WorkerNavigator} />
            <Stack.Screen name="TenantNavigator" component={TenantNavigator} />
             <Stack.Screen name="SecurityNavigator" component={SecurityNavigator} />
            
          
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
