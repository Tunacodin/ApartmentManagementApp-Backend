// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RoleProvider } from './src/contexts/RoleProvider';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <RoleProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </RoleProvider>
  );
}
