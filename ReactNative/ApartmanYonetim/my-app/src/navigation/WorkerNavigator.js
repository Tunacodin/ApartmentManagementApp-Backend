// src/navigation/WorkerNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PersonalInfoScreen from '../screens/worker/create/WorkerPersonalInfoScreen';
import JobInfoScreen from '../screens/Worker/Create/JobInfoScreen';
import VerificationScreen from '../screens/Worker/Create/VerificationScreen';
import WorkerHomeScreen from '../screens/Worker/Dashboard/WorkerHomeScreen';
import WorkerTasksScreen from '../screens/Worker/Dashboard/WorkerTasksScreen';
import WorkerSettingsScreen from '../screens/Worker/Dashboard/WorkerSettingsScreen';
import LoginScreen from '../screens/Auth/LoginScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function WorkerDashboard() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={WorkerHomeScreen} />
      <Tab.Screen name="Tasks" component={WorkerTasksScreen} />
      <Tab.Screen name="Settings" component={WorkerSettingsScreen} />
    </Tab.Navigator>
  );
}

export default function WorkerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PersonalInfoScreen" component={PersonalInfoScreen} />
      <Stack.Screen name="JobInfoScreen" component={JobInfoScreen} />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="WorkerDashboard" component={WorkerDashboard} />
    </Stack.Navigator>
  );
}
