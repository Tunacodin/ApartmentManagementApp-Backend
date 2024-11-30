import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import AdminNavigationWrapper from './AdminNavigatorWrapper';
import NavigationWithProgress from '../components/NavigationWithProgress';
import { View } from 'react-native';

const Stack = createStackNavigator();

export default function AdminNavigator() {
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
    <View style={{flex:1}}>
      <AdminNavigationWrapper currentStep={currentStep} />
      <NavigationWithProgress 
        currentStep={currentStep} 
        totalSteps={4}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </View>
  );
}