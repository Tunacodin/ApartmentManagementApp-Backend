// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';

export default function App() {


  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
