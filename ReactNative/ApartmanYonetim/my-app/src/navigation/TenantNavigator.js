// src/navigation/TenantNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PersonalInfoScreen from '../screens/tenant/create/TenantPersonalInfoScreen';
import LeaseInfoScreen from '../screens/Tenant/Create/LeaseInfoScreen';
import PaymentInfoScreen from '../screens/Tenant/Create/PaymentInfoScreen';
import TenantHomeScreen from '../screens/Tenant/Dashboard/TenantHomeScreen';
import TenantRequestsScreen from '../screens/Tenant/Dashboard/TenantRequestsScreen';
import TenantSettingsScreen from '../screens/Tenant/Dashboard/TenantSettingsScreen';
import LoginScreen from '../screens/Auth/LoginScreen';

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
      <Stack.Screen name="PersonalInfoScreen" component={PersonalInfoScreen} />
      <Stack.Screen name="LeaseInfoScreen" component={LeaseInfoScreen} />
      <Stack.Screen name="PaymentInfoScreen" component={PaymentInfoScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="TenantDashboard" component={TenantDashboard} />
    </Stack.Navigator>
  );
}
