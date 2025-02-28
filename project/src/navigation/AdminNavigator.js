import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import AdminNavigationWrapper from './AdminNavigatorWrapper';
import NavigationWithProgress from '../components/NavigationWithProgress';
import { View } from 'react-native';
import AdminHome from '../screens/admin/dashboard/AdminHome';

const Stack = createStackNavigator();

function AdminNavigator() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        key: 'admin_stack',
      }}
    >
      <Stack.Screen 
        name="AdminHome"
        component={AdminHome}
        options={{
          key: 'admin_home_screen'
        }}
      />
      <Stack.Screen 
        name="AdminNavigation"
        component={AdminNavigationWrapper}
        options={{
          key: 'admin_navigation_screen'
        }}
      />
      {currentStep < 3 && (
        <Stack.Screen 
          name="NavigationWithProgress"
          component={NavigationWithProgress}
          options={{
            key: 'navigation_with_progress_screen'
          }}
          initialParams={{
            currentStep,
            totalSteps: 4,
            onNext: handleNext,
            onPrevious: handlePrevious
          }}
        />
      )}
    </Stack.Navigator>
  );
}

export default AdminNavigator;