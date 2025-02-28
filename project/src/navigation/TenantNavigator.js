// src/navigation/TenantNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TenantLeaseInfoScreen from '../screens/tenant/create/TenantLeaseScreen';
import TenantInfoScreen from '../screens/tenant/create/TenantInfoScreen';
import TenantHomeScreen from '../screens/tenant/dashboard/TenantHome';
import TenantRequestsScreen from '../screens/tenant/dashboard/TenantRequest';
import TenantSettingsScreen from '../screens/tenant/dashboard/TenantSettings';
import TenantPaymentScreen from '../screens/tenant/create/TenantPaymentScreen';
import LoginScreen from '../screens/auth/LoginScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TenantDashboard() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Requests') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: route.name,
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
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
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="TenantDashboard" component={TenantDashboard} />
    </Stack.Navigator>
  );
}
