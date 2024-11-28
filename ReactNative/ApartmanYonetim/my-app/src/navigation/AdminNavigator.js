import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PersonalInfoScreen from '../screens/admin/create/AdminInfoScreen';
import AuthorizationInfoScreen from '../screens/admin/create/AuthorizationInfoScreen';
import ApartmentInfoScreen from '../screens/admin/create/ApartmentInfoScreen';
import FinancialInfoScreen from '../screens/admin/create/FinancialInfoScreen';

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PersonalInfoScreen" component={PersonalInfoScreen} />
      <Stack.Screen name="AuthorizationInfoScreen" component={AuthorizationInfoScreen} />
      <Stack.Screen name="ApartmentInfoScreen" component={ApartmentInfoScreen} />
      <Stack.Screen name="FinancialInfoScreen" component={FinancialInfoScreen} />
    </Stack.Navigator>
  );
}
