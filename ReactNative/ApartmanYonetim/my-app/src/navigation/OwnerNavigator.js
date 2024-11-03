// src/navigation/OwnerNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OwnerHomeScreen from '../screens/owner/dashboard/OwnerHome';
import OwnerPropertiesScreen from '../screens/owner/dashboard/OwnerProperties';
import OwnerSettingsScreen from '../screens/owner/dashboard/OwnerSettings';
import OwnerPaymentDetailsScreen from '../screens/owner/create/OwnerPaymentDetailsScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OwnerPropertyInfoScreen from '../screens/owner/create/OwnerPropertyScreen';
import OwnerInfoScreen from '../screens/owner/create/OwnerInfoScreen';



const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function OwnerDashboard() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={OwnerHomeScreen} />
      <Tab.Screen name="Properties" component={OwnerPropertiesScreen} />
      <Tab.Screen name="Settings" component={OwnerSettingsScreen} />
    </Tab.Navigator>
  );
}

export default function OwnerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OwnerPropertyInfoScreen" component={OwnerPropertyInfoScreen} />
      <Stack.Screen name="OwnerPaymentDetailsScreen" component={OwnerPaymentDetailsScreen} />
      <Stack.Screen name="OwnerInfoScreen" component={OwnerInfoScreen} />
      
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      
      <Stack.Screen name="OwnerDashboard" component={OwnerDashboard} />

    </Stack.Navigator>
  );
}
