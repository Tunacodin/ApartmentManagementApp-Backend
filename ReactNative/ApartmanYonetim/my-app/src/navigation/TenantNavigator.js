// src/navigation/TenantNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TenantLeaseInfoScreen from '../screens/tenant/create/TenantLeaseScreen';
import TenantInfoScreen from '../screens/tenant/create/TenantInfoScreen';
import TenantHomeScreen from '../screens/tenant/dashboard/TenantHome';
import TenantRequestsScreen from '../screens/tenant/dashboard/TenantRequest';
import TenantSettingsScreen from '../screens/tenant/dashboard/TenantSettings';
import TenantFinancialInfoScreen from '../screens/tenant/create/TenantFinancialInfoScreen';
import TenantPaymentScreen from '../screens/tenant/create/TenantPaymentScreen';
import LoginScreen from '../screens/auth/LoginScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TenantDashboard() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={TenantHomeScreen} />
      <Tab.Screen name="Requests" component={TenantRequestsScreen} />
      <Tab.Screen name="Settings" component={TenantSettingsScreen} />
    </Tab.Navigator>
  );
}

export default function TenantNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TenantInfoScreen" component={TenantInfoScreen} />
      <Stack.Screen name="TenantLeaseScreen" component={TenantLeaseInfoScreen} />
       <Stack.Screen name="TenantPaymentScreen" component={TenantPaymentScreen} />
         <Stack.Screen name="TenantFinancialInfoScreen" component={TenantFinancialInfoScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="TenantDashboard" component={TenantDashboard} />
    </Stack.Navigator>
  );
}
