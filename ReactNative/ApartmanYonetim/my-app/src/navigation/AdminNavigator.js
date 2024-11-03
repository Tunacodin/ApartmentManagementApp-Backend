// src/navigation/AdminNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PersonalInfoScreen from '../screens/admin/create/AdminInfoScreen';
import AuthorizationInfoScreen from '../screens/admin/create/AuthorizationInfoScreen';
import ApartmentInfoScreen from '../screens/admin/create/ApartmentInfoScreen';
import FinancialInfoScreen from '../screens/admin/create/FinancialInfoScreen';
import AdminHome from "../screens/admin/dashboard/AdminHome";
import AdminReports from "../screens/admin/dashboard/AdminReport";
import AdminSettings from "../screens/admin/dashboard/AdminSettings";

import LoginScreen from '../screens/Auth/LoginScreen'; // Login ekranı

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AdminDashboard() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={AdminHome} />
      <Tab.Screen name="Reports" component={AdminReports} />
      <Tab.Screen name="Settings" component={AdminSettings} />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Hesap oluşturma adımları */}
      <Stack.Screen name="PersonalInfoScreen" component={PersonalInfoScreen} />
      <Stack.Screen name="AuthorizationInfoScreen" component={AuthorizationInfoScreen} />
      <Stack.Screen name="ApartmentInfoScreen" component={ApartmentInfoScreen} />
      <Stack.Screen name="FinancialInfoScreen" component={FinancialInfoScreen} />
      
      {/* Hesap oluşturma bittiğinde login ekranına yönlendirme */}
      <Stack.Screen name="LoginScreen" component={LoginScreen} />

      {/* Login işlemi tamamlandıktan sonra dashboard’a geçiş */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    </Stack.Navigator>
  );
}
