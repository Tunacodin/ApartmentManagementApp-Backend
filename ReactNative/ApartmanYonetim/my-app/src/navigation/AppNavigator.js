// src/navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleScreen from '../screens/auth/RoleScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import AdminNavigator from './AdminNavigator';
import OwnerNavigator from './OwnerNavigator';
import WorkerNavigator from './WorkerNavigator';
import SecurityNavigator from './SecurityNavigator';
import TenantNavigator from './TenantNavigator';
import Splash from '../screens/auth/Splash';

import HelloScreen from '../screens/auth/HelloScreen';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName='Splash' screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="HelloScreen" component={HelloScreen} />
      <Stack.Screen name="RoleScreen" component={RoleScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="AdminNavigator" component={AdminNavigator} />
      <Stack.Screen name="OwnerNavigator" component={OwnerNavigator} />
      <Stack.Screen name="WorkerNavigator" component={WorkerNavigator} />
      <Stack.Screen name="SecurityNavigator" component={SecurityNavigator} />
      <Stack.Screen name="TenantNavigator" component={TenantNavigator} />
    </Stack.Navigator>
  );
}
