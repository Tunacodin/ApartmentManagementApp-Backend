// src/navigation/WorkerNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WorkerHomeScreen from '../screens/worker/dashboard/WorkerHome';
import WorkerSettingsScreen from '../screens/worker/dashboard/WorkerSettings';
import WorkerTasksScreen from '../screens/worker/dashboard/WorkerTasks';
import WorkerInfoScreen from '../screens/worker/create/WorkerInfoScreen';
import WorkerJobInfoScreen from '../screens/worker/create/WorkerJobInfoScreen';
import WorkerVerificationScreen from '../screens/worker/create/WorkerVerificationScreen';

import LoginScreen from '../screens/auth/LoginScreen';

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
      <Stack.Screen name="WorkerInfoScreen" component={WorkerInfoScreen} />
      <Stack.Screen name="WorkerJobInfoScreen" component={WorkerJobInfoScreen} />
      <Stack.Screen name="WorkerVerificationScreen" component={WorkerVerificationScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="WorkerDashboard" component={WorkerDashboard} />
    </Stack.Navigator>
  );
}
