// src/navigation/SecurityNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import SecurityShiftScreen from '../screens/security/create/SecurityShiftScreen';
import SecurityVerificationScreen from '../screens/security/create/SecurityVerificationScreen';

import SecurityHomeScreen from '../screens/security/dashboard/SecurityHome';
import SecurityReportsScreen from '../screens/security/dashboard/SecurityReports';
import SecuritySettingsScreen from '../screens/security/dashboard/SecuritySettings';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SecurityInfoScreen from '../screens/security/create/SecurityInfoScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function SecurityDashboard() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={SecurityHomeScreen} />
      <Tab.Screen name="Reports" component={SecurityReportsScreen} />
      <Tab.Screen name="Settings" component={SecuritySettingsScreen} />
    </Tab.Navigator>
  );
}

export default function SecurityNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SecurityInfoScreen" component={SecurityInfoScreen} />
      <Stack.Screen name="SecurityInfoScreen" component={SecurityShiftScreen} />
<Stack.Screen name="SecurityVerificationScreen" component={SecurityVerificationScreen} />

      <Stack.Screen name="LoginScreen" component={LoginScreen} />

      <Stack.Screen name="SecurityDashboard" component={SecurityDashboard} />
    </Stack.Navigator>
  );
}
