import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminInfoScreen from './AdminInfoScreen';
import ApartmentInfoScreen from './ApartmentInfoScreen';
import AuthorizationInfoScreen from './AuthorizationInfoScreen';

const Stack = createNativeStackNavigator();

function AdminCreateNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AdminInfo"
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          color: '#FFFFFF',
          fontSize: 20,
          fontWeight: 'bold',
        },
        headerStyle: {
          backgroundColor: '#1A202C',
        },
        gestureEnabled: false,
        contentStyle: {
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      <Stack.Screen 
        name="AdminInfo" 
        component={AdminInfoScreen}
        options={{
          title: 'Yönetici Bilgileri',
        }}
      />
      <Stack.Screen 
        name="ApartmentInfo" 
        component={ApartmentInfoScreen}
        options={{
          title: 'Apartman Bilgileri',
        }}
      />
      <Stack.Screen 
        name="AuthorizationInfo" 
        component={AuthorizationInfoScreen}
        options={{
          title: 'Yetkilendirme Bilgileri',
        }}
      />
    </Stack.Navigator>
  );
}

export default AdminCreateNavigator;
