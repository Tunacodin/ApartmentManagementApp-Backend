// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import AppNavigator from './src/navigation/AppNavigator';

export default function App() {


  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
